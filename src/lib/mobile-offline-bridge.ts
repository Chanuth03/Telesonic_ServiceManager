import {
  getMobileMutationEpoch,
  hydrateMobileStores,
  subscribeMobilePersist,
  type MobileJob,
  type MobilePersistEvent,
} from "./mobile-data";
import {
  ensureOfflineReferenceData,
  getDexieJobs,
  getDexieNotifications,
  getDexieStock,
  saveDexieJob,
  saveDexieNotifications,
  saveDexieStock,
  syncServerJobsIntoDexie,
  type DexieJob,
} from "./offline-db";
import { syncManager } from "./sync-manager";
import { apiFetch } from "./api-client";

let started = false;
let unsubscribePersist: (() => void) | null = null;

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

async function persistMobileEvent(event: MobilePersistEvent) {
  if (event.kind === "job") {
    await saveDexieJob(event.job, event.action);
    if (typeof process === "undefined" || process.env["VITEST"] !== "true") {
      if (syncManager.getIsOnline()) {
        await syncManager.triggerSync("mobile_local_save");
      }
    }
    return;
  }

  if (event.kind === "stock") {
    await saveDexieStock(event.items);
    if (typeof process === "undefined" || process.env["VITEST"] !== "true") {
      if (syncManager.getIsOnline()) {
        await syncManager.triggerSync("mobile_stock_save");
      }
    }
    return;
  }

  await saveDexieNotifications(event.items);
}

/**
 * Pull latest jobs from PostgreSQL (/api/jobs) into Dexie.js when online
 */
export async function refreshMobileJobsFromServer(): Promise<void> {
  if (typeof window === "undefined") return;
  if (typeof process !== "undefined" && process.env["VITEST"] === "true") return;

  if (!syncManager.getIsOnline()) {
    const localJobs = await getDexieJobs();
    hydrateMobileStores({ jobs: localJobs.map(toMobileJob) });
    return;
  }

  try {
    const res = await apiFetch("/api/jobs");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        const mergedDexieJobs = await syncServerJobsIntoDexie(data.jobs as MobileJob[]);
        hydrateMobileStores({ jobs: mergedDexieJobs.map(toMobileJob) });
        return;
      }
    }
  } catch {
    // Offline fallback: read from Dexie.js
  }

  const localJobs = await getDexieJobs();
  hydrateMobileStores({ jobs: localJobs.map(toMobileJob) });
}

/** Keep mobile edits in IndexedDB and upload them when the network returns. */
export async function startMobileOfflineBridge() {
  if (started || typeof window === "undefined") return;
  started = true;

  const epoch = getMobileMutationEpoch();
  await ensureOfflineReferenceData();
  if (getMobileMutationEpoch() === epoch) {
    const [jobs, notifications, stock] = await Promise.all([
      getDexieJobs(),
      getDexieNotifications(),
      getDexieStock(),
    ]);
    hydrateMobileStores({
      jobs: jobs.map(toMobileJob),
      notifications,
      stock,
    });
  }

  // Pull latest assigned jobs from PostgreSQL into Dexie if online
  void refreshMobileJobsFromServer();

  window.addEventListener("telesonic:auth-changed", () => {
    void refreshMobileJobsFromServer();
  });

  window.addEventListener("online", () => {
    void refreshMobileJobsFromServer();
  });

  unsubscribePersist = subscribeMobilePersist((event) => {
    void persistMobileEvent(event).catch((err) => {
      console.error("[Mobile] Offline save failed:", err);
    });
  });
}

export function resetMobileOfflineBridgeForTests() {
  unsubscribePersist?.();
  unsubscribePersist = null;
  started = false;
}
