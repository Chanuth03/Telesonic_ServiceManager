/**
 * First-login / online bootstrap: download mandatory offline data into Dexie
 * before the app claims offline readiness.
 */

import { apiFetch } from "./api-client";
import {
  cacheMasterOptionsForUser,
  cacheServerTransactionsLocally,
  cacheUserProfileLocally,
  DEFAULT_ORGANIZATION_ID,
  ensureOfflineDatabaseReady,
  isOfflineBootstrapComplete,
  putSyncMetadata,
  syncServerJobsIntoDexie,
} from "./offline-db";
import { warmMobileOfflineCache } from "./warm-mobile-offline-cache";
import { TRANSACTION_PROCESS_MAP } from "./transactions-db";
import type { MobileJob } from "./mobile-data";

export type BootstrapPhase =
  | "idle"
  | "opening-db"
  | "caching-profile"
  | "downloading-masters"
  | "downloading-jobs"
  | "downloading-transactions"
  | "warming-cache"
  | "finalizing"
  | "ready"
  | "error";

export interface BootstrapProgress {
  phase: BootstrapPhase;
  message: string;
  percent: number;
  offlineReady: boolean;
  error?: string;
}

export interface BootstrapUserInput {
  id: string | number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  organizationId?: string;
  [key: string]: unknown;
}

type ProgressListener = (progress: BootstrapProgress) => void;

const listeners = new Set<ProgressListener>();
let currentProgress: BootstrapProgress = {
  phase: "idle",
  message: "",
  percent: 0,
  offlineReady: false,
};

function emit(partial: Partial<BootstrapProgress>) {
  currentProgress = { ...currentProgress, ...partial };
  listeners.forEach((fn) => {
    try {
      fn(currentProgress);
    } catch {
      // ignore listener errors
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("telesonic:bootstrap-progress", { detail: currentProgress }),
    );
  }
}

export function subscribeBootstrapProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  listener(currentProgress);
  return () => listeners.delete(listener);
}

export function getBootstrapProgress(): BootstrapProgress {
  return currentProgress;
}

export async function checkOfflineReady(userId: string): Promise<boolean> {
  await ensureOfflineDatabaseReady();
  return isOfflineBootstrapComplete(userId);
}

/**
 * Download and persist all mandatory offline data after a successful online login.
 */
export async function runOfflineBootstrap(input: {
  user: BootstrapUserInput;
  token: string;
}): Promise<BootstrapProgress> {
  const userId = String(input.user.id);
  const organizationId = input.user.organizationId
    ? String(input.user.organizationId)
    : DEFAULT_ORGANIZATION_ID;
  const permissions = Array.isArray(input.user.permissions) ? input.user.permissions : [];
  const authHeaders = { Authorization: `Bearer ${input.token}` };

  try {
    emit({
      phase: "opening-db",
      message: "Preparing on-device storage…",
      percent: 5,
      offlineReady: false,
      error: undefined,
    });
    await ensureOfflineDatabaseReady();

    emit({
      phase: "caching-profile",
      message: "Caching user profile, roles and permissions…",
      percent: 15,
      offlineReady: false,
    });
    await cacheUserProfileLocally({
      id: userId,
      email: input.user.email,
      name: input.user.name,
      role: input.user.role,
      organizationId,
      permissions,
      profile: { ...input.user },
    });

    emit({
      phase: "downloading-masters",
      message: "Downloading customers, products and lookup data…",
      percent: 30,
      offlineReady: false,
    });
    try {
      const masterRes = await apiFetch(
        "/api/service-requests/master-options",
        { headers: authHeaders },
        { networkOnly: true },
      );
      if (masterRes.ok) {
        const masterJson = (await masterRes.json()) as { options?: Record<string, unknown> };
        if (masterJson.options && typeof masterJson.options === "object") {
          await cacheMasterOptionsForUser(userId, organizationId, masterJson.options);
        }
      } else {
        console.warn(`[Bootstrap] Master options HTTP ${masterRes.status}; continuing.`);
      }
    } catch (err) {
      console.warn("[Bootstrap] Master options skipped:", err);
    }

    emit({
      phase: "downloading-jobs",
      message: "Downloading assigned jobs…",
      percent: 45,
      offlineReady: false,
    });
    try {
      const jobsRes = await apiFetch(
        "/api/jobs",
        { headers: authHeaders },
        { networkOnly: true },
      );
      if (jobsRes.ok) {
        const jobsJson = (await jobsRes.json()) as { jobs?: MobileJob[] };
        if (Array.isArray(jobsJson.jobs)) {
          await syncServerJobsIntoDexie(jobsJson.jobs);
        }
      }
    } catch (err) {
      console.warn("[Bootstrap] Jobs download skipped:", err);
    }

    emit({
      phase: "downloading-transactions",
      message: "Downloading transaction history for offline use…",
      percent: 60,
      offlineReady: false,
    });
    const processConfigs = Object.values(TRANSACTION_PROCESS_MAP);
    let cachedTx = 0;
    for (let i = 0; i < processConfigs.length; i++) {
      const cfg = processConfigs[i]!;
      const pct = 60 + Math.floor((i / Math.max(processConfigs.length, 1)) * 20);
      emit({
        phase: "downloading-transactions",
        message: `Caching ${cfg.code} records…`,
        percent: pct,
        offlineReady: false,
      });
      try {
        const res = await apiFetch(cfg.apiPath, { headers: authHeaders }, { networkOnly: true });
        if (!res.ok) continue;
        const json = (await res.json()) as {
          records?: Array<Record<string, unknown>>;
          requests?: Array<Record<string, unknown>>;
        };
        const list = (json.records || json.requests || []) as Array<Record<string, unknown>>;
        if (!Array.isArray(list) || list.length === 0) continue;
        cachedTx += await cacheServerTransactionsLocally({
          code: cfg.code,
          storageKey: `telesonic_trx_${cfg.code}`,
          apiPath: cfg.apiPath,
          primaryField: cfg.primaryField,
          records: list.slice(0, 100),
          userId,
          organizationId,
        });
      } catch (err) {
        console.warn(`[Bootstrap] ${cfg.code} cache skipped:`, err);
      }
    }
    console.log(`[Bootstrap] Cached ${cachedTx} transaction rows for offline.`);

    emit({
      phase: "warming-cache",
      message: "Caching mobile & transaction screens for Airplane Mode…",
      percent: 85,
      offlineReady: false,
    });
    try {
      await warmMobileOfflineCache("login_bootstrap");
    } catch (err) {
      console.warn("[Bootstrap] SW warm skipped:", err);
    }

    emit({
      phase: "finalizing",
      message: "Finalizing offline readiness…",
      percent: 95,
      offlineReady: false,
    });
    await putSyncMetadata(
      `bootstrap:${userId}`,
      {
        complete: true,
        completedAt: new Date().toISOString(),
        organizationId,
        cachedTransactions: cachedTx,
      },
      userId,
      organizationId,
    );
    await putSyncMetadata(
      `bootstrap_status:${userId}`,
      { offlineReady: true },
      userId,
      organizationId,
    );

    emit({
      phase: "ready",
      message: "Offline data ready. You can work without internet.",
      percent: 100,
      offlineReady: true,
    });
    return currentProgress;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bootstrap failed";
    emit({
      phase: "error",
      message: "Initial offline download failed. Stay online and try again.",
      percent: currentProgress.percent,
      offlineReady: false,
      error: message,
    });
    // Still mark a soft-ready so the user can enter the app with whatever was cached.
    try {
      await putSyncMetadata(
        `bootstrap:${userId}`,
        { complete: true, partial: true, error: message, completedAt: new Date().toISOString() },
        userId,
        organizationId,
      );
    } catch {
      // ignore
    }
    emit({
      phase: "ready",
      message: "Partial offline data saved. You can continue.",
      percent: 100,
      offlineReady: true,
      error: message,
    });
    return currentProgress;
  }
}
