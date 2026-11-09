/**
 * First-login / online bootstrap: download mandatory offline data into Dexie
 * before the app claims offline readiness.
 */

import { apiFetch } from "./api-client";
import {
  cacheMasterOptionsForUser,
  cacheUserProfileLocally,
  DEFAULT_ORGANIZATION_ID,
  ensureOfflineDatabaseReady,
  isOfflineBootstrapComplete,
  putSyncMetadata,
  syncServerJobsIntoDexie,
} from "./offline-db";
import { warmMobileOfflineCache } from "./warm-mobile-offline-cache";
import type { MobileJob } from "./mobile-data";

export type BootstrapPhase =
  | "idle"
  | "opening-db"
  | "caching-profile"
  | "downloading-masters"
  | "downloading-jobs"
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
 * Does not claim offline readiness until every required step succeeds.
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

  try {
    emit({
      phase: "opening-db",
      message: "Preparing secure offline storage…",
      percent: 5,
      offlineReady: false,
      error: undefined,
    });
    await ensureOfflineDatabaseReady();

    emit({
      phase: "caching-profile",
      message: "Caching user profile, roles and permissions…",
      percent: 20,
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
      message: "Downloading master and lookup data…",
      percent: 45,
      offlineReady: false,
    });
    const masterRes = await apiFetch(
      "/api/service-requests/master-options",
      {
        headers: { Authorization: `Bearer ${input.token}` },
      },
      { networkOnly: true },
    );
    if (!masterRes.ok) {
      throw new Error(`Master data download failed (HTTP ${masterRes.status})`);
    }
    const masterJson = (await masterRes.json()) as { options?: Record<string, unknown> };
    if (!masterJson.options || typeof masterJson.options !== "object") {
      throw new Error("Master data response missing options");
    }
    await cacheMasterOptionsForUser(userId, organizationId, masterJson.options);

    emit({
      phase: "downloading-jobs",
      message: "Downloading assigned jobs…",
      percent: 70,
      offlineReady: false,
    });
    try {
      const jobsRes = await apiFetch(
        "/api/jobs",
        { headers: { Authorization: `Bearer ${input.token}` } },
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
      phase: "warming-cache",
      message: "Caching mobile screens for Airplane Mode…",
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
    throw err;
  }
}
