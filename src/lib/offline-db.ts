import Dexie, { type EntityTable } from "dexie";
import {
  defaultTechnicianSeedJobs,
  initialNotifications,
  initialStockCountItems,
  MobileJob,
  MobileNotification,
  StockCountItem,
} from "./mobile-data";

export interface DexieJob extends MobileJob {
  syncStatus: "synced" | "pending" | "error";
  updatedAt: number;
  syncedAt?: number;
  localVersion: number;
}

export interface DexieSyncQueueItem {
  id?: number;
  action:
    | "UPDATE_STATUS"
    | "ADD_LABOUR"
    | "ADD_PART"
    | "SUBMIT_INSPECTION"
    | "SUBMIT_HOLD"
    | "COMPLETE_JOB"
    | "GENERIC_UPDATE";
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: number;
  status: "pending" | "processing" | "synced" | "failed";
  errorMessage?: string;
}

export interface DexieMeta {
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface DexieStockItem extends StockCountItem {
  updatedAt: number;
}

export interface DexieTransactionRecord {
  id: string;
  code: string;
  storageKey: string;
  recordRef: string;
  payload: Record<string, unknown>;
  createdAt: number;
  syncStatus: "pending" | "synced";
}

/**
 * Dexie.js Offline Database for Field Service Mobile PWA
 */
class TelesonicOfflineDB extends Dexie {
  jobs!: EntityTable<DexieJob, "id">;
  syncQueue!: EntityTable<DexieSyncQueueItem, "id">;
  offlineMeta!: EntityTable<DexieMeta, "key">;
  stockCount!: EntityTable<DexieStockItem, "sku">;
  notifications!: EntityTable<MobileNotification, "id">;
  transactions!: EntityTable<DexieTransactionRecord, "id">;

  constructor() {
    super("TelesonicOfflineDB");

    this.version(1).stores({
      jobs: "id, customerName, status, priority, technicianName, scheduledDate, syncStatus, updatedAt",
      syncQueue: "++id, action, entityId, createdAt, status",
      offlineMeta: "key, updatedAt",
    });

    this.version(2).stores({
      jobs: "id, customerName, status, priority, technicianName, scheduledDate, syncStatus, updatedAt",
      syncQueue: "++id, action, entityId, createdAt, status",
      offlineMeta: "key, updatedAt",
      stockCount: "sku, updatedAt",
      notifications: "id, read, type",
    });

    this.version(3).stores({
      jobs: "id, customerName, status, priority, technicianName, scheduledDate, syncStatus, updatedAt",
      syncQueue: "++id, action, entityId, createdAt, status",
      offlineMeta: "key, updatedAt",
      stockCount: "sku, updatedAt",
      notifications: "id, read, type",
      transactions: "id, code, storageKey, recordRef, createdAt, syncStatus",
    });
  }
}

export const offlineDB = new TelesonicOfflineDB();

let seedingPromise: Promise<void> | null = null;

/**
 * Seed initial jobs into Dexie.js if empty (thread-safe and idempotent)
 */
export async function seedDexieInitialJobs(): Promise<void> {
  if (seedingPromise) {
    return seedingPromise;
  }

  seedingPromise = (async () => {
    try {
      const count = await offlineDB.jobs.count();
      const now = Date.now();
      if (count === 0) {
        const initialDexieJobs: DexieJob[] = defaultTechnicianSeedJobs.map((job) => ({
          ...job,
          syncStatus: "synced",
          updatedAt: now,
          syncedAt: now,
          localVersion: 1,
        }));
        await offlineDB.jobs.bulkPut(initialDexieJobs);
        await offlineDB.offlineMeta.put({
          key: "last_seeded_at",
          value: new Date().toISOString(),
          updatedAt: now,
        });
        console.log(
          `[Dexie.js] Seeded ${initialDexieJobs.length} initial jobs for offline PWA storage.`,
        );
      } else {
        // Ensure any newly defined default technician jobs are present without overwriting existing ones
        for (const seedJob of defaultTechnicianSeedJobs) {
          const exists = await offlineDB.jobs.get(seedJob.id);
          if (!exists) {
            await offlineDB.jobs.put({
              ...seedJob,
              syncStatus: "synced",
              updatedAt: now,
              syncedAt: now,
              localVersion: 1,
            });
          }
        }
      }
    } catch (err) {
      console.error("[Dexie.js] Error seeding initial jobs:", err);
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
}

/**
 * Get all local jobs from Dexie.js
 */
export async function getDexieJobs(): Promise<DexieJob[]> {
  await seedDexieInitialJobs();
  return await offlineDB.jobs.orderBy("scheduledDate").reverse().toArray();
}

/**
 * Get a single local job by ID
 */
export async function getDexieJobById(id: string): Promise<DexieJob | undefined> {
  await seedDexieInitialJobs();
  return await offlineDB.jobs.get(id);
}

/**
 * Update a local job status in Dexie.js and queue for sync
 */
export async function updateDexieJobStatus(
  jobId: string,
  newStatus: MobileJob["status"],
  notes?: string,
): Promise<DexieJob> {
  const existing = await offlineDB.jobs.get(jobId);
  const now = Date.now();

  const updated: DexieJob = existing
    ? {
        ...existing,
        status: newStatus,
        syncStatus: "pending",
        updatedAt: now,
        localVersion: (existing.localVersion || 1) + 1,
      }
    : {
        id: jobId,
        customerName: "Offline Client",
        town: "Colombo",
        window: "Morning",
        priority: "Normal",
        role: "Lead",
        status: newStatus,
        category: "Breakdown",
        siteAddress: "Local Site",
        technicianName: "Technician (Offline)",
        scheduledDate: new Date().toISOString().slice(0, 10),
        syncStatus: "pending",
        updatedAt: now,
        localVersion: 1,
      };

  await offlineDB.jobs.put(updated);

  // Enqueue sync action
  await offlineDB.syncQueue.add({
    action: "UPDATE_STATUS",
    entityId: jobId,
    payload: { status: newStatus, notes, updatedAt: new Date().toISOString() },
    createdAt: now,
    status: "pending",
  });

  // Notify listeners
  window.dispatchEvent(new CustomEvent("telesonic:dexie-update", { detail: { jobId, newStatus } }));

  return updated;
}

/**
 * Update whole job record in Dexie.js (e.g. after adding part, inspection, or travel)
 */
export async function saveDexieJob(
  job: MobileJob,
  actionType: DexieSyncQueueItem["action"] = "GENERIC_UPDATE",
): Promise<DexieJob> {
  const now = Date.now();
  const existing = await offlineDB.jobs.get(job.id);

  const dexieJob: DexieJob = {
    ...job,
    syncStatus: "pending",
    updatedAt: now,
    localVersion: (existing?.localVersion || 1) + 1,
  };

  await offlineDB.jobs.put(dexieJob);

  await offlineDB.syncQueue.add({
    action: actionType,
    entityId: job.id,
    payload: { ...job, updatedAt: new Date().toISOString() },
    createdAt: now,
    status: "pending",
  });

  window.dispatchEvent(new CustomEvent("telesonic:dexie-update", { detail: { jobId: job.id } }));
  return dexieJob;
}

/**
 * Fetch all unsynced changes to be pushed to /api/sync
 */
export async function getUnsyncedDexieRecords(): Promise<{
  queueItems: DexieSyncQueueItem[];
  pendingJobs: DexieJob[];
}> {
  const queueItems = await offlineDB.syncQueue.where("status").equals("pending").toArray();
  const pendingJobs = await offlineDB.jobs.where("syncStatus").equals("pending").toArray();

  return { queueItems, pendingJobs };
}

/**
 * Mark sync items and jobs as synced after successful /api/sync response
 */
export async function markDexieAsSynced(
  syncedJobIds: string[],
  queueItemIds: number[],
): Promise<void> {
  const now = Date.now();

  await offlineDB.transaction(
    "rw",
    [offlineDB.jobs, offlineDB.syncQueue, offlineDB.offlineMeta],
    async () => {
      if (queueItemIds.length > 0) {
        await offlineDB.syncQueue.bulkDelete(queueItemIds);
      }

      for (const id of syncedJobIds) {
        const stillPending = await offlineDB.syncQueue
          .where("entityId")
          .equals(id)
          .filter((item) => item.status === "pending")
          .count();
        if (stillPending > 0) continue;
        await offlineDB.jobs.update(id, {
          syncStatus: "synced",
          syncedAt: now,
        });
      }

      // Record last sync time
      await offlineDB.offlineMeta.put({
        key: "last_sync_timestamp",
        value: new Date().toISOString(),
        updatedAt: now,
      });
    },
  );

  window.dispatchEvent(
    new CustomEvent("telesonic:sync-complete", { detail: { syncedJobIds, timestamp: now } }),
  );
}

/**
 * Get count of pending unsynced items
 */
export function isOfflineForTransactions(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!navigator.onLine) return true;
  try {
    return localStorage.getItem("telesonic_simulated_offline") === "true";
  } catch {
    return false;
  }
}

export async function saveOfflineTransaction(input: {
  code: string;
  storageKey: string;
  recordRef: string;
  payload: Record<string, unknown>;
}): Promise<DexieTransactionRecord> {
  const record: DexieTransactionRecord = {
    id: `${input.code}-${input.recordRef}-${Date.now()}`,
    code: input.code,
    storageKey: input.storageKey,
    recordRef: input.recordRef,
    payload: input.payload,
    createdAt: Date.now(),
    syncStatus: "pending",
  };
  await offlineDB.transactions.put(record);
  const stored = await offlineDB.transactions.get(record.id);
  console.log("[Dexie] Offline transaction stored. JSON:", JSON.stringify(stored, null, 2));
  return record;
}

export async function saveDexieStock(items: StockCountItem[]): Promise<void> {
  const now = Date.now();
  await offlineDB.stockCount.bulkPut(items.map((item) => ({ ...item, updatedAt: now })));
  await offlineDB.syncQueue.add({
    action: "GENERIC_UPDATE",
    entityId: `STOCK-COUNT-${now}`,
    payload: { type: "STOCK_COUNT", items, updatedAt: new Date(now).toISOString() },
    createdAt: now,
    status: "pending",
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("telesonic:dexie-update", { detail: { type: "stock" } }));
  }
}

export async function getDexieStock(): Promise<StockCountItem[]> {
  const rows = await offlineDB.stockCount.toArray();
  return rows.map(({ updatedAt: _updatedAt, ...item }) => item);
}

export async function saveDexieNotifications(items: MobileNotification[]): Promise<void> {
  await offlineDB.notifications.clear();
  if (items.length > 0) await offlineDB.notifications.bulkPut(items);
}

export async function getDexieNotifications(): Promise<MobileNotification[]> {
  return offlineDB.notifications.toArray();
}

export async function ensureOfflineReferenceData(): Promise<void> {
  await seedDexieInitialJobs();
  const now = Date.now();
  if ((await offlineDB.stockCount.count()) === 0) {
    await offlineDB.stockCount.bulkPut(
      initialStockCountItems.map((item) => ({ ...item, updatedAt: now })),
    );
  }
  if ((await offlineDB.notifications.count()) === 0) {
    await offlineDB.notifications.bulkPut(initialNotifications.map((item) => ({ ...item })));
  }
}

export async function getPendingSyncCount(): Promise<number> {
  try {
    const countJobs = await offlineDB.jobs.where("syncStatus").equals("pending").count();
    const countQueue = await offlineDB.syncQueue.where("status").equals("pending").count();
    return Math.max(countJobs, countQueue);
  } catch {
    return 0;
  }
}


/**
 * Merge server jobs into Dexie.js without overwriting local unsynced ('pending') edits
 */
export async function syncServerJobsIntoDexie(serverJobs: MobileJob[]): Promise<DexieJob[]> {
  await seedDexieInitialJobs();
  const now = Date.now();
  for (const sJob of serverJobs) {
    if (!sJob?.id) continue;
    const existing = await offlineDB.jobs.get(sJob.id);
    if (existing && existing.syncStatus === "pending") {
      continue;
    }
    await offlineDB.jobs.put({
      ...(existing || {}),
      ...sJob,
      syncStatus: "synced",
      updatedAt: now,
      syncedAt: now,
      localVersion: existing?.localVersion || 1,
    });
  }
  return await getDexieJobs();
}

export interface SavedOfflineAuthSession {
  token: string;
  user: Record<string, unknown>;
  rememberMe: boolean;
  savedAt: string;
}

export async function saveOfflineAuthSession(session: SavedOfflineAuthSession): Promise<void> {
  try {
    await offlineDB.offlineMeta.put({
      key: "saved_auth_session",
      value: session,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error("[Dexie.js] Failed to save offline auth session:", err);
  }
}

export async function getOfflineAuthSession(): Promise<SavedOfflineAuthSession | null> {
  try {
    const meta = await offlineDB.offlineMeta.get("saved_auth_session");
    if (meta && meta.value && typeof meta.value === "object") {
      return meta.value as SavedOfflineAuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearOfflineAuthSession(): Promise<void> {
  try {
    await offlineDB.offlineMeta.delete("saved_auth_session");
  } catch {
    // ignore
  }
}
