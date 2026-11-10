import {
  getMobileMutationEpoch,
  subscribeMobilePersist,
  type MobilePersistEvent,
} from "./mobile-data";
import {
  ensureOfflineReferenceData,
  saveDexieJob,
  saveDexieNotifications,
  saveDexieStock,
} from "./offline-db";
import { hydrateScreensFromDexie, syncOfflineData } from "./offline-sync/engine";
import { syncManager } from "./sync-manager";

let started = false;
let unsubscribePersist: (() => void) | null = null;

function isTestEnv(): boolean {
  return typeof process !== "undefined" && process.env["VITEST"] === "true";
}

async function persistMobileEvent(event: MobilePersistEvent) {
  if (event.kind === "job") {
    await saveDexieJob(event.job, event.action);
  } else if (event.kind === "stock") {
    await saveDexieStock(event.items);
  } else {
    await saveDexieNotifications(event.items);
  }
  if (!isTestEnv() && syncManager.getIsOnline()) {
    await syncManager.triggerSync(`mobile_${event.kind}_save`);
  }
}

/**
 * Pull the latest jobs / notifications / van stock into Dexie when online,
 * then refresh the screens. Offline it only re-reads Dexie.
 */
export async function refreshMobileJobsFromServer(): Promise<void> {
  if (typeof window === "undefined" || isTestEnv()) return;
  if (syncManager.getIsOnline()) {
    await syncOfflineData({ reason: "mobile_refresh", scope: "required" });
    return;
  }
  await hydrateScreensFromDexie();
}

/** Keep mobile edits in IndexedDB and upload them when the network returns. */
export async function startMobileOfflineBridge() {
  if (started || typeof window === "undefined") return;
  started = true;

  const epoch = getMobileMutationEpoch();
  await ensureOfflineReferenceData();
  if (getMobileMutationEpoch() === epoch) {
    await hydrateScreensFromDexie();
  }

  // Airplane Mode: re-read IndexedDB so the UI never waits on a failed request.
  window.addEventListener("offline", () => {
    void hydrateScreensFromDexie();
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
