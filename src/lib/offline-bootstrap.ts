/**
 * First-login / online bootstrap: download ALL mandatory offline APIs into Dexie
 * and warm every mobile/TRX page shell so Airplane Mode works without visiting
 * each screen online first.
 */

import { apiFetch } from "./api-client";
import {
  cacheMasterOptionsForUser,
  cacheServerTransactionsLocally,
  cacheUserProfileLocally,
  DEFAULT_ORGANIZATION_ID,
  ensureOfflineDatabaseReady,
  getDexieJobs,
  isOfflineBootstrapComplete,
  putSyncMetadata,
  syncServerJobsIntoDexie,
} from "./offline-db";
import { warmMobileOfflineCache } from "./warm-mobile-offline-cache";
import { TRANSACTION_PROCESS_MAP } from "./transactions-db";
import type { MobileJob } from "./mobile-data";
import { hydrateMobileStores } from "./mobile-data";
import { readStoredTechnicianSession } from "./app-initializer";

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
let bootstrapInFlight: Promise<BootstrapProgress> | null = null;
let lastSessionPrefetchAt = 0;

/** Extra master/list endpoints used by screens beyond the combined master-options payload. */
const EXTRA_MASTER_APIS = [
  "/api/customers",
  "/api/contacts",
  "/api/sites",
  "/api/items",
  "/api/equipments",
  "/api/equipment-systems",
  "/api/technicians",
  "/api/subcontractors",
  "/api/service-types",
  "/api/hold-reasons",
  "/api/checklist-templates",
  "/api/stock-counts",
  "/api/franchise-warehouses",
  "/api/labour-rates",
] as const;

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

async function mapPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      const item = items[index]!;
      await worker(item, index);
    }
  });
  await Promise.all(runners);
}

async function cacheJsonMasterBundle(
  userId: string,
  organizationId: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const bundle: Record<string, unknown> = {};

  try {
    const masterRes = await apiFetch(
      "/api/service-requests/master-options",
      { headers: authHeaders },
      { networkOnly: true },
    );
    if (masterRes.ok) {
      const masterJson = (await masterRes.json()) as { options?: Record<string, unknown> };
      if (masterJson.options && typeof masterJson.options === "object") {
        Object.assign(bundle, masterJson.options);
      }
    } else {
      console.warn(`[Bootstrap] Master options HTTP ${masterRes.status}; continuing.`);
    }
  } catch (err) {
    console.warn("[Bootstrap] Master options skipped:", err);
  }

  await mapPool([...EXTRA_MASTER_APIS], 4, async (path) => {
    try {
      const res = await apiFetch(path, { headers: authHeaders }, { networkOnly: true });
      if (!res.ok) return;
      const json = (await res.json()) as Record<string, unknown>;
      const key = path.replace(/^\/api\//, "").replace(/\//g, "_");
      bundle[key] = json;
      // Common list shapes
      if (Array.isArray(json["customers"])) bundle["customers"] = json["customers"];
      if (Array.isArray(json["items"])) bundle["items"] = json["items"];
      if (Array.isArray(json["sites"])) bundle["sites"] = json["sites"];
      if (Array.isArray(json["contacts"])) bundle["contacts"] = json["contacts"];
      if (Array.isArray(json["technicians"])) bundle["technicians"] = json["technicians"];
      if (Array.isArray(json["records"])) bundle[`${key}_records`] = json["records"];
    } catch (err) {
      console.warn(`[Bootstrap] Extra master ${path} skipped:`, err);
    }
  });

  if (Object.keys(bundle).length > 0) {
    await cacheMasterOptionsForUser(userId, organizationId, bundle);
  }
}

/**
 * Download and persist all mandatory offline data after a successful online login.
 * Calls every transaction API + master APIs, then warms every page shell.
 */
export async function runOfflineBootstrap(input: {
  user: BootstrapUserInput;
  token: string;
}): Promise<BootstrapProgress> {
  if (bootstrapInFlight) return bootstrapInFlight;

  bootstrapInFlight = (async () => {
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
        percent: 12,
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
        message: "Downloading all master / lookup APIs…",
        percent: 22,
        offlineReady: false,
      });
      await cacheJsonMasterBundle(userId, organizationId, authHeaders);

      emit({
        phase: "downloading-jobs",
        message: "Downloading assigned jobs…",
        percent: 40,
        offlineReady: false,
      });
      let jobIds: string[] = [];
      try {
        const jobsRes = await apiFetch(
          "/api/jobs",
          { headers: authHeaders },
          { networkOnly: true },
        );
        if (jobsRes.ok) {
          const jobsJson = (await jobsRes.json()) as { jobs?: MobileJob[] };
          if (Array.isArray(jobsJson.jobs)) {
            const merged = await syncServerJobsIntoDexie(jobsJson.jobs);
            hydrateMobileStores({
              jobs: merged.map((job) => {
                const {
                  syncStatus: _syncStatus,
                  updatedAt: _updatedAt,
                  syncedAt: _syncedAt,
                  localVersion: _localVersion,
                  ...rest
                } = job;
                return rest as MobileJob;
              }),
            });
            jobIds = merged.map((j) => j.id).filter(Boolean);
          }
        }
      } catch (err) {
        console.warn("[Bootstrap] Jobs download skipped:", err);
      }
      if (jobIds.length === 0) {
        try {
          jobIds = (await getDexieJobs()).map((j) => j.id).filter(Boolean);
        } catch {
          // ignore
        }
      }

      emit({
        phase: "downloading-transactions",
        message: "Downloading ALL transaction APIs (TRX-01…35)…",
        percent: 50,
        offlineReady: false,
      });
      const processConfigs = Object.values(TRANSACTION_PROCESS_MAP);
      let cachedTx = 0;
      let apisOk = 0;

      await mapPool(processConfigs, 5, async (cfg, i) => {
        const pct = 50 + Math.floor((i / Math.max(processConfigs.length, 1)) * 30);
        emit({
          phase: "downloading-transactions",
          message: `Caching ${cfg.code} (${i + 1}/${processConfigs.length})…`,
          percent: Math.min(pct, 79),
          offlineReady: false,
        });
        try {
          const res = await apiFetch(cfg.apiPath, { headers: authHeaders }, { networkOnly: true });
          if (!res.ok) {
            console.warn(`[Bootstrap] ${cfg.code} HTTP ${res.status}`);
            await putSyncMetadata(
              `prefetch:${cfg.code}`,
              { ok: false, status: res.status, at: new Date().toISOString() },
              userId,
              organizationId,
            );
            return;
          }
          const json = (await res.json()) as {
            records?: Array<Record<string, unknown>>;
            requests?: Array<Record<string, unknown>>;
          };
          const list = (json.records || json.requests || []) as Array<Record<string, unknown>>;
          apisOk += 1;
          if (Array.isArray(list) && list.length > 0) {
            cachedTx += await cacheServerTransactionsLocally({
              code: cfg.code,
              storageKey: `telesonic_trx_${cfg.code}`,
              apiPath: cfg.apiPath,
              primaryField: cfg.primaryField,
              records: list.slice(0, 150),
              userId,
              organizationId,
            });
          }
          await putSyncMetadata(
            `prefetch:${cfg.code}`,
            {
              ok: true,
              count: Array.isArray(list) ? list.length : 0,
              at: new Date().toISOString(),
            },
            userId,
            organizationId,
          );
        } catch (err) {
          console.warn(`[Bootstrap] ${cfg.code} cache skipped:`, err);
        }
      });
      console.log(
        `[Bootstrap] Prefetched ${apisOk}/${processConfigs.length} TRX APIs; cached ${cachedTx} rows.`,
      );

      emit({
        phase: "warming-cache",
        message: "Caching every mobile & transaction page for Airplane Mode…",
        percent: 85,
        offlineReady: false,
      });
      try {
        await warmMobileOfflineCache("login_bootstrap", { jobIds });
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
          apisOk,
          jobCount: jobIds.length,
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

      lastSessionPrefetchAt = Date.now();
      emit({
        phase: "ready",
        message: "All APIs & pages cached. You can work without internet.",
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
      try {
        await putSyncMetadata(
          `bootstrap:${userId}`,
          {
            complete: true,
            partial: true,
            error: message,
            completedAt: new Date().toISOString(),
          },
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
    } finally {
      bootstrapInFlight = null;
    }
  })();

  return bootstrapInFlight;
}

/**
 * For returning / Keep-me-signed-in sessions: while online, force a full API +
 * page prefetch so offline is not limited to screens already opened.
 */
export async function ensureSessionOfflineBootstrap(options?: {
  force?: boolean;
}): Promise<BootstrapProgress | null> {
  if (typeof window === "undefined") return null;
  if (!navigator.onLine) return null;
  if (bootstrapInFlight) return bootstrapInFlight;

  const session = readStoredTechnicianSession();
  if (!session?.token || !session.user?.id) return null;

  const userId = String(session.user.id);
  const already = await isOfflineBootstrapComplete(userId).catch(() => false);
  const stale = Date.now() - lastSessionPrefetchAt > 30 * 60 * 1000;
  const force = options?.force === true || !already || stale || lastSessionPrefetchAt === 0;

  if (!force && already) return getBootstrapProgress();

  return runOfflineBootstrap({
    user: {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email || "",
      role: session.user.role || "TECHNICIAN",
      permissions: Array.isArray(session.user.permissions) ? session.user.permissions : [],
      organizationId: session.user.organizationId
        ? String(session.user.organizationId)
        : DEFAULT_ORGANIZATION_ID,
      ...session.user,
    },
    token: session.token,
  });
}
