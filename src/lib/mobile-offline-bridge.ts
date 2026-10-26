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
  type DexieJob,
} from "./offline-db";
import { syncManager } from "./sync-manager";

let started = false;
let unsubscribePersist: (() => void) | null = null;

function toMobileJob(job: DexieJob): MobileJob {
  const { syncStatus: _syncStatus, updatedAt: _updatedAt, syncedAt: _syncedAt, localVersion: _localVersion, ...rest } =
    job;
  return rest;
}

async function persistMobileEvent(event: MobilePersistEvent) {
  if (event.kind === "job") {
    await saveDexieJob(event.job, event.action);
    if (typeof process === "undefined" || process.env.VITEST !== "true") {
      if (syncManager.getIsOnline()) {
        await syncManager.triggerSync("mobile_local_save");
      }
    }
    return;
  }

  if (event.kind === "stock") {
    await saveDexieStock(event.items);
    return;
  }

  await saveDexieNotifications(event.items);
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
