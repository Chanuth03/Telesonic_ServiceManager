/**
 * Offline sync engine.
 *
 * Order on every run: push the local outbox first, then pull datasets that are
 * missing or stale (per-dataset TTL), then refresh screen memory from Dexie.
 * Dexie is the single source the screens read from; the network only writes into it.
 */

import {
  DEFAULT_ORGANIZATION_ID,
  getDexieJobs,
  getDexieNotifications,
  getDexieStock,
  getSyncMetadata,
  isDeviceOffline,
  putSyncMetadata,
  type DexieJob,
} from "@/lib/offline-db";
import { getMobileMutationEpoch, hydrateMobileStores, type MobileJob } from "@/lib/mobile-data";
import { readStoredTechnicianSession } from "@/lib/app-initializer";
import { OFFLINE_DATASETS, type DatasetDefinition } from "./registry";

export interface DatasetSyncState {
  ok: boolean;
  lastSyncedAt: string | null;
  serverTime: string | null;
  count: number;
  error?: string;
}

export interface OfflineSyncProgress {
  done: number;
  total: number;
  label: string;
}

export interface OfflineSyncSummary {
  ran: boolean;
  reason: string;
  pulled: string[];
  skipped: string[];
  failed: string[];
  requiredReady: boolean;
}

export interface OfflineSyncOptions {
  reason: string;
  /** "required" = only what the app needs to open offline; "all" = also transaction history. */
  scope?: "required" | "all";
  /** Ignore TTLs and download again. */
  force?: boolean;
  /** Push the outbox before pulling (default true). */
  pushFirst?: boolean;
  auth?: { token: string; userId: string; organizationId?: string };
  onProgress?: (progress: OfflineSyncProgress) => void;
}

const PULL_CONCURRENCY = 4;

interface RunHandle {
  done: Promise<OfflineSyncSummary>;
  /** Resolves as soon as the required datasets are finished. */
  requiredDone: Promise<OfflineSyncSummary>;
}

let inFlight: RunHandle | null = null;

function metaKey(datasetKey: string, userId: string): string {
  return `dataset:${datasetKey}:${userId}`;
}

function toMobileJob(job: DexieJob): MobileJob {
  const {
    syncStatus: _syncStatus,
    updatedAt: _updatedAt,
    syncedAt: _syncedAt,
    localVersion: _localVersion,
    ...rest
  } = job;
  return rest;
}

/**
 * Refresh the in-memory screen stores from Dexie. Skipped if the user edited
 * something while Dexie was being read, so an in-progress save is never undone.
 */
export async function hydrateScreensFromDexie(): Promise<boolean> {
  const epoch = getMobileMutationEpoch();
  const [jobs, notifications, stock] = await Promise.all([
    getDexieJobs(),
    getDexieNotifications(),
    getDexieStock(),
  ]);
  if (getMobileMutationEpoch() !== epoch) return false;
  hydrateMobileStores({ jobs: jobs.map(toMobileJob), notifications, stock });
  return true;
}

function resolveAuth(options: OfflineSyncOptions) {
  if (options.auth) {
    return {
      token: options.auth.token,
      userId: options.auth.userId,
      organizationId: options.auth.organizationId || DEFAULT_ORGANIZATION_ID,
    };
  }
  const session = readStoredTechnicianSession();
  if (!session?.token || session.user?.id == null) return null;
  return {
    token: session.token,
    userId: String(session.user.id),
    organizationId: session.user.organizationId
      ? String(session.user.organizationId)
      : DEFAULT_ORGANIZATION_ID,
  };
}

export async function getDatasetState(
  datasetKey: string,
  userId: string,
): Promise<DatasetSyncState | null> {
  return getSyncMetadata<DatasetSyncState>(metaKey(datasetKey, userId));
}

function isFresh(state: DatasetSyncState | null, dataset: DatasetDefinition): boolean {
  if (!state?.ok || !state.lastSyncedAt) return false;
  return Date.now() - new Date(state.lastSyncedAt).getTime() < dataset.ttlMs;
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const runners = Array.from({ length: Math.min(PULL_CONCURRENCY, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++]!;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function runSync(
  options: OfflineSyncOptions,
  onRequiredDone: (summary: OfflineSyncSummary) => void,
): Promise<OfflineSyncSummary> {
  const summary: OfflineSyncSummary = {
    ran: false,
    reason: options.reason,
    pulled: [],
    skipped: [],
    failed: [],
    requiredReady: false,
  };

  const auth = resolveAuth(options);
  if (!auth || isDeviceOffline()) {
    summary.requiredReady = auth ? await isRequiredDataReady(auth.userId) : false;
    onRequiredDone(summary);
    return summary;
  }
  summary.ran = true;

  if (options.pushFirst !== false) {
    try {
      const { syncManager } = await import("@/lib/sync-manager");
      await syncManager.triggerSync(`${options.reason}:push`);
    } catch (err) {
      console.warn("[OfflineSync] Outbox push failed; continuing with pull:", err);
    }
  }

  const scope = options.scope || "all";
  const datasets = OFFLINE_DATASETS.filter((d) => scope === "all" || d.required);
  const headers = { Authorization: `Bearer ${auth.token}` };
  const states = new Map<string, DatasetSyncState | null>();
  for (const dataset of datasets) {
    states.set(dataset.key, await getDatasetState(dataset.key, auth.userId));
  }
  const due = datasets.filter((d) => options.force || !isFresh(states.get(d.key) ?? null, d));
  summary.skipped = datasets.filter((d) => !due.includes(d)).map((d) => d.key);

  let done = 0;
  const total = due.length;
  const pullOne = async (dataset: DatasetDefinition) => {
    const previous = states.get(dataset.key) ?? null;
    options.onProgress?.({ done, total, label: dataset.label });
    try {
      const result = await dataset.pull({
        userId: auth.userId,
        organizationId: auth.organizationId,
        headers,
        since: options.force ? null : previous?.serverTime || null,
      });
      await putSyncMetadata(
        metaKey(dataset.key, auth.userId),
        {
          ok: true,
          lastSyncedAt: new Date().toISOString(),
          serverTime: result.serverTime || previous?.serverTime || null,
          count: result.count,
        } satisfies DatasetSyncState,
        auth.userId,
        auth.organizationId,
      );
      summary.pulled.push(dataset.key);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[OfflineSync] ${dataset.key} failed:`, message);
      // Keep the previous success timestamp so already-cached data stays usable.
      await putSyncMetadata(
        metaKey(dataset.key, auth.userId),
        {
          ok: Boolean(previous?.ok),
          lastSyncedAt: previous?.lastSyncedAt || null,
          serverTime: previous?.serverTime || null,
          count: previous?.count || 0,
          error: message,
        } satisfies DatasetSyncState,
        auth.userId,
        auth.organizationId,
      );
      summary.failed.push(dataset.key);
    } finally {
      done += 1;
      options.onProgress?.({ done, total, label: dataset.label });
    }
  };

  // Required datasets first so the app becomes usable offline as early as possible.
  await runPool(
    due.filter((d) => d.required),
    pullOne,
  );
  await hydrateScreensFromDexie().catch((err) =>
    console.warn("[OfflineSync] Screen refresh failed:", err),
  );
  summary.requiredReady = await isRequiredDataReady(auth.userId);
  onRequiredDone({ ...summary, pulled: [...summary.pulled], failed: [...summary.failed] });

  await runPool(
    due.filter((d) => !d.required),
    pullOne,
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("telesonic:offline-data-updated", { detail: summary }));
  }
  console.log(`[OfflineSync] ${options.reason}:`, summary);
  return summary;
}

/**
 * Single-flight: concurrent callers share one run. A caller asking only for
 * required data is answered as soon as that part of the shared run finishes.
 */
export function syncOfflineData(options: OfflineSyncOptions): Promise<OfflineSyncSummary> {
  const wantsRequiredOnly = options.scope === "required";
  if (inFlight) return wantsRequiredOnly ? inFlight.requiredDone : inFlight.done;

  let resolveRequired!: (summary: OfflineSyncSummary) => void;
  const requiredDone = new Promise<OfflineSyncSummary>((resolve) => {
    resolveRequired = resolve;
  });
  const done = runSync(options, resolveRequired)
    .catch((err): OfflineSyncSummary => {
      console.error("[OfflineSync] Run failed:", err);
      return {
        ran: false,
        reason: options.reason,
        pulled: [],
        skipped: [],
        failed: ["engine"],
        requiredReady: false,
      };
    })
    .then((summary) => {
      resolveRequired(summary);
      return summary;
    })
    .finally(() => {
      inFlight = null;
    });
  inFlight = { done, requiredDone };
  return wantsRequiredOnly ? requiredDone : done;
}

export async function isRequiredDataReady(userId: string): Promise<boolean> {
  for (const dataset of OFFLINE_DATASETS.filter((d) => d.required)) {
    const state = await getDatasetState(dataset.key, userId);
    if (!state?.ok) return false;
  }
  return true;
}

/** Oldest successful download among required datasets — shown as "Data updated …". */
export async function getOfflineDataUpdatedAt(userId: string): Promise<string | null> {
  let oldest: string | null = null;
  for (const dataset of OFFLINE_DATASETS.filter((d) => d.required)) {
    const state = await getDatasetState(dataset.key, userId);
    if (!state?.lastSyncedAt) return null;
    if (!oldest || state.lastSyncedAt < oldest) oldest = state.lastSyncedAt;
  }
  return oldest;
}

const FOREGROUND_REFRESH_MS = 10 * 60 * 1000;
let lifecycleStarted = false;

/**
 * Keep offline data fresh while the app is open. iOS has no background sync,
 * so refresh on start, on reconnect, on return to foreground, and on a timer.
 */
export function startOfflineSyncLifecycle(): void {
  if (lifecycleStarted || typeof window === "undefined") return;
  lifecycleStarted = true;

  const refresh = (reason: string) => {
    void syncOfflineData({ reason, scope: "all" }).catch((err) =>
      console.warn(`[OfflineSync] ${reason} failed:`, err),
    );
  };

  refresh("app_start");
  window.addEventListener("online", () => window.setTimeout(() => refresh("network_online"), 1500));
  window.addEventListener("telesonic:auth-changed", () => refresh("auth_changed"));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh("foreground");
  });
  window.setInterval(() => {
    if (document.visibilityState === "visible") refresh("foreground_timer");
  }, FOREGROUND_REFRESH_MS);
}
