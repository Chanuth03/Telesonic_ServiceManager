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
    | "GENERIC_UPDATE"
    | "TRANSACTION_UPSERT"
    | "TRANSACTION_DELETE";
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: number;
  status: "pending" | "processing" | "synced" | "failed";
  errorMessage?: string;
  idempotencyKey?: string;
  retryCount?: number;
  nextRetryAt?: number;
  userId?: string;
  organizationId?: string;
}

export interface DexieMeta {
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface DexieStockItem extends StockCountItem {
  updatedAt: number;
}

export type TransactionSyncStatus = "pending" | "syncing" | "synced" | "failed";

export const DEFAULT_ORGANIZATION_ID = "TELESONIC-DEFAULT";

export interface DexieUserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  permissions: string[];
  profile: Record<string, unknown>;
  updatedAt: number;
}

export interface DexieOrganizationRecord {
  id: string;
  name: string;
  code?: string;
  updatedAt: number;
}

export interface DexieRoleRecord {
  id: string;
  code: string;
  name: string;
  userId: string;
  organizationId: string;
  permissions: string[];
  updatedAt: number;
}

export interface DexiePermissionRecord {
  id: string;
  code: string;
  roleId: string;
  userId: string;
  organizationId: string;
  updatedAt: number;
}

export interface DexieConfigurationRecord {
  key: string;
  userId: string;
  organizationId: string;
  value: unknown;
  updatedAt: number;
}

export interface DexieMasterDataRecord {
  id: string;
  category: string;
  userId: string;
  organizationId: string;
  data: unknown;
  updatedAt: number;
}

export interface DexieTransactionItemRecord {
  id: string;
  transactionId: string;
  userId: string;
  organizationId: string;
  lineIndex: number;
  payload: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface DexieSyncMetadataRecord {
  key: string;
  userId: string;
  organizationId?: string;
  value: unknown;
  updatedAt: number;
}

export interface DexieTransactionRecord {
  id: string;
  code: string;
  storageKey: string;
  recordRef: string;
  payload: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  syncStatus: TransactionSyncStatus;
  idempotencyKey: string;
  apiPath: string;
  operation: "upsert" | "delete";
  lastError?: string;
  deleted?: boolean;
  /** Local UUID (same as id for new local creates). */
  localId?: string;
  serverId?: string | null;
  userId?: string;
  organizationId?: string;
  transactionType?: string;
  retryCount?: number;
  nextRetryAt?: number;
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
  users!: EntityTable<DexieUserRecord, "id">;
  organizations!: EntityTable<DexieOrganizationRecord, "id">;
  roles!: EntityTable<DexieRoleRecord, "id">;
  permissions!: EntityTable<DexiePermissionRecord, "id">;
  configurations!: EntityTable<DexieConfigurationRecord, "key">;
  masterData!: EntityTable<DexieMasterDataRecord, "id">;
  transactionItems!: EntityTable<DexieTransactionItemRecord, "id">;
  syncMetadata!: EntityTable<DexieSyncMetadataRecord, "key">;

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

    this.version(4)
      .stores({
        jobs: "id, customerName, status, priority, technicianName, scheduledDate, syncStatus, updatedAt",
        syncQueue: "++id, action, entityId, createdAt, status, idempotencyKey",
        offlineMeta: "key, updatedAt",
        stockCount: "sku, updatedAt",
        notifications: "id, read, type",
        transactions:
          "id, code, storageKey, recordRef, createdAt, updatedAt, syncStatus, idempotencyKey, apiPath, operation",
      })
      .upgrade(async (tx) => {
        await tx
          .table("transactions")
          .toCollection()
          .modify((row: Record<string, unknown>) => {
            if (row["updatedAt"] == null) row["updatedAt"] = row["createdAt"] || Date.now();
            if (!row["idempotencyKey"]) {
              row["idempotencyKey"] = `trx:upsert:${row["code"]}:${row["recordRef"]}`;
            }
            if (!row["operation"]) row["operation"] = "upsert";
            if (!row["apiPath"]) row["apiPath"] = "/api/service-requests";
            if (row["syncStatus"] === "syncing") row["syncStatus"] = "pending";
          });
      });

    this.version(5)
      .stores({
        jobs: "id, customerName, status, priority, technicianName, scheduledDate, syncStatus, updatedAt",
        syncQueue:
          "++id, action, entityId, createdAt, status, idempotencyKey, userId, organizationId, nextRetryAt",
        offlineMeta: "key, updatedAt",
        stockCount: "sku, updatedAt",
        notifications: "id, read, type",
        transactions:
          "id, code, storageKey, recordRef, createdAt, updatedAt, syncStatus, idempotencyKey, apiPath, operation, userId, organizationId, serverId, transactionType, retryCount, nextRetryAt",
        users: "id, email, organizationId, updatedAt",
        organizations: "id, name, updatedAt",
        roles: "id, code, userId, organizationId, updatedAt",
        permissions: "id, code, roleId, userId, organizationId, updatedAt",
        configurations: "key, userId, organizationId, updatedAt",
        masterData: "id, category, userId, organizationId, updatedAt",
        transactionItems: "id, transactionId, userId, organizationId, createdAt",
        syncMetadata: "key, userId, organizationId, updatedAt",
      })
      .upgrade(async (tx) => {
        await tx
          .table("transactions")
          .toCollection()
          .modify((row: Record<string, unknown>) => {
            if (row["localId"] == null) row["localId"] = row["id"];
            if (row["serverId"] === undefined) row["serverId"] = null;
            if (row["organizationId"] == null) row["organizationId"] = DEFAULT_ORGANIZATION_ID;
            if (row["transactionType"] == null) row["transactionType"] = row["code"] || "UNKNOWN";
            if (row["retryCount"] == null) row["retryCount"] = 0;
            if (row["syncStatus"] === "syncing") row["syncStatus"] = "pending";
          });
      });
  }
}

export const offlineDB = new TelesonicOfflineDB();

let dbReadyPromise: Promise<void> | null = null;

/** Open Dexie, request persistent storage, seed reference data. Never clears transactions. */
export async function ensureOfflineDatabaseReady(): Promise<void> {
  if (dbReadyPromise) return dbReadyPromise;
  dbReadyPromise = (async () => {
    await offlineDB.open();
    await requestPersistentStorage();
    await ensureOfflineReferenceData();
  })().catch((err) => {
    dbReadyPromise = null;
    throw err;
  });
  return dbReadyPromise;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    const already = await navigator.storage.persisted?.();
    if (already) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** True when the device reports offline or simulated offline is on. */
export function isDeviceOffline(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!navigator.onLine) return true;
  try {
    return localStorage.getItem("telesonic_simulated_offline") === "true";
  } catch {
    return false;
  }
}

/**
 * Probe whether the backend is actually reachable.
 * navigator.onLine alone is not enough (Airplane Mode / captive portals).
 */
export async function probeBackendReachable(timeoutMs = 3500): Promise<boolean> {
  if (isDeviceOffline()) return false;
  if (typeof window === "undefined") return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await window.fetch(`${window.location.origin}/api/auth/session`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

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

/** Prefer for transaction UX: device offline OR simulated offline. */
export function isOfflineForTransactions(): boolean {
  return isDeviceOffline();
}

function stableTransactionId(code: string, recordRef: string): string {
  return `${code}::${recordRef}`;
}

function stableIdempotencyKey(code: string, recordRef: string, operation: "upsert" | "delete"): string {
  return `trx:${operation}:${code}:${recordRef}`;
}

function readActiveUserScope(): { userId: string; organizationId: string } {
  if (typeof window === "undefined") {
    return { userId: "anonymous", organizationId: DEFAULT_ORGANIZATION_ID };
  }
  try {
    const raw =
      sessionStorage.getItem("auth_user") ||
      (localStorage.getItem("telesonic_remember_session") === "true"
        ? localStorage.getItem("auth_user")
        : null);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        id?: string | number;
        organizationId?: string;
      };
      const userId = parsed?.id != null ? String(parsed.id) : "anonymous";
      const organizationId = parsed?.organizationId
        ? String(parsed.organizationId)
        : DEFAULT_ORGANIZATION_ID;
      return { userId, organizationId };
    }
  } catch {
    // ignore
  }
  return { userId: "anonymous", organizationId: DEFAULT_ORGANIZATION_ID };
}

function extractTransactionItems(
  payload: Record<string, unknown>,
): Array<Record<string, unknown>> {
  const data = payload["data"] as Record<string, unknown> | undefined;
  const tabDatasets = (data?.["tabDatasets"] || payload["tabDatasets"]) as
    | Record<string, Array<Record<string, unknown>>>
    | undefined;
  if (!tabDatasets || typeof tabDatasets !== "object") return [];
  const items: Array<Record<string, unknown>> = [];
  for (const [tabId, rows] of Object.entries(tabDatasets)) {
    if (!Array.isArray(rows)) continue;
    rows.forEach((row, index) => {
      items.push({ tabId, lineIndex: index, ...row });
    });
  }
  return items;
}

/**
 * Persist a transaction to Dexie BEFORE any API call.
 * Uses a stable id per code+recordRef so edits update the same row (no duplicates).
 * Confirms success locally with syncStatus=pending — never waits on the API.
 */
export async function saveOfflineTransaction(input: {
  code: string;
  storageKey: string;
  recordRef: string;
  payload: Record<string, unknown>;
  apiPath: string;
  operation?: "upsert" | "delete";
  userId?: string;
  organizationId?: string;
  serverId?: string | null;
}): Promise<DexieTransactionRecord> {
  await ensureOfflineDatabaseReady();
  const operation = input.operation || "upsert";
  const id = stableTransactionId(input.code, input.recordRef);
  const now = Date.now();
  const scope = readActiveUserScope();
  const userId = input.userId || scope.userId;
  const organizationId = input.organizationId || scope.organizationId;
  const existing = await offlineDB.transactions.get(id);

  // Never allow another user's pending row to be silently overwritten by a different account.
  if (existing?.userId && existing.userId !== userId && existing.userId !== "anonymous") {
    throw new Error("Cannot modify another user's offline transaction");
  }

  const idempotencyKey =
    existing?.idempotencyKey && operation === existing.operation
      ? existing.idempotencyKey
      : stableIdempotencyKey(input.code, input.recordRef, operation);

  const lineItems = extractTransactionItems(input.payload);

  const record: DexieTransactionRecord = {
    id,
    localId: existing?.localId || id,
    code: input.code,
    storageKey: input.storageKey,
    recordRef: input.recordRef,
    payload: {
      ...input.payload,
      idempotencyKey,
      userId,
      organizationId,
      _localSyncMeta: {
        id,
        operation,
        updatedAt: now,
      },
    },
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    syncStatus: "pending",
    idempotencyKey,
    apiPath: input.apiPath,
    operation,
    deleted: operation === "delete",
    lastError: undefined,
    serverId: input.serverId !== undefined ? input.serverId : existing?.serverId ?? null,
    userId,
    organizationId,
    transactionType: input.code,
    retryCount: 0,
    nextRetryAt: undefined,
  };

  await offlineDB.transaction(
    "rw",
    [offlineDB.transactions, offlineDB.transactionItems, offlineDB.syncQueue],
    async () => {
      await offlineDB.transactions.put(record);

      const oldItems = await offlineDB.transactionItems
        .where("transactionId")
        .equals(id)
        .toArray();
      if (oldItems.length > 0) {
        await offlineDB.transactionItems.bulkDelete(oldItems.map((item) => item.id));
      }
      if (lineItems.length > 0 && operation !== "delete") {
        await offlineDB.transactionItems.bulkPut(
          lineItems.map((item, index) => ({
            id: `${id}::item::${index}`,
            transactionId: id,
            userId,
            organizationId,
            lineIndex: index,
            payload: item,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
          })),
        );
      }

      const existingQueue = await offlineDB.syncQueue
        .where("entityId")
        .equals(id)
        .filter((item) => item.status === "pending" || item.status === "failed")
        .first();

      const queuePayload = {
        transactionId: id,
        code: input.code,
        recordRef: input.recordRef,
        apiPath: input.apiPath,
        operation,
        idempotencyKey,
        userId,
        organizationId,
        payload: record.payload,
      };

      if (existingQueue?.id != null) {
        await offlineDB.syncQueue.update(existingQueue.id, {
          action: operation === "delete" ? "TRANSACTION_DELETE" : "TRANSACTION_UPSERT",
          payload: queuePayload,
          status: "pending",
          errorMessage: undefined,
          idempotencyKey,
          retryCount: 0,
          nextRetryAt: undefined,
          userId,
          organizationId,
        });
      } else {
        await offlineDB.syncQueue.add({
          action: operation === "delete" ? "TRANSACTION_DELETE" : "TRANSACTION_UPSERT",
          entityId: id,
          payload: queuePayload,
          createdAt: now,
          status: "pending",
          idempotencyKey,
          retryCount: 0,
          userId,
          organizationId,
        });
      }
    },
  );

  const stored = await offlineDB.transactions.get(id);
  console.log("[Dexie] Transaction stored locally. JSON:", JSON.stringify(stored, null, 2));

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("telesonic:dexie-update", {
        detail: { type: "transaction", id, code: input.code },
      }),
    );
  }

  return record;
}

/** Active (non-deleted) local transactions for a screen, newest first (scoped to current user). */
export async function getDexieTransactionsForScreen(
  code: string,
  storageKey?: string,
): Promise<Record<string, unknown>[]> {
  await ensureOfflineDatabaseReady();
  const { userId } = readActiveUserScope();
  let rows = await offlineDB.transactions.where("code").equals(code).toArray();
  if (storageKey) {
    rows = rows.filter((row) => row.storageKey === storageKey);
  }
  rows = rows.filter(
    (row) => !row.userId || row.userId === userId || row.userId === "anonymous",
  );
  return rows
    .filter((row) => !row.deleted && row.operation !== "delete")
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
    .map((row) => {
      const payload = { ...row.payload };
      delete payload._localSyncMeta;
      return {
        ...payload,
        id: row.recordRef,
        recordNo: row.recordRef,
        _dexieId: row.id,
        _syncStatus: row.syncStatus,
        _idempotencyKey: row.idempotencyKey,
        _serverId: row.serverId ?? null,
        _retryCount: row.retryCount ?? 0,
        updatedAt: new Date(row.updatedAt).toISOString(),
      };
    });
}

export async function getPendingTransactionRecords(
  forUserId?: string,
): Promise<DexieTransactionRecord[]> {
  await ensureOfflineDatabaseReady();
  const scopeUserId = forUserId || readActiveUserScope().userId;
  const now = Date.now();
  // Include interrupted "syncing" rows so a killed tab/app can safely retry.
  const rows = await offlineDB.transactions
    .where("syncStatus")
    .anyOf(["pending", "failed", "syncing"])
    .toArray();
  return rows
    .filter(
      (row) =>
        (!row.userId || row.userId === scopeUserId || row.userId === "anonymous") &&
        (!row.nextRetryAt || row.nextRetryAt <= now),
    )
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

function computeBackoffMs(retryCount: number): number {
  const base = 2000;
  const max = 5 * 60 * 1000;
  return Math.min(max, base * Math.pow(2, Math.max(0, retryCount)));
}

export async function markTransactionSyncState(
  id: string,
  syncStatus: TransactionSyncStatus,
  lastError?: string,
): Promise<void> {
  await offlineDB.transactions.update(id, {
    syncStatus,
    lastError,
    updatedAt: Date.now(),
  });
}

/**
 * Push pending/failed Dexie transactions to their API paths once connectivity is real.
 * Idempotency-Key header + stable keys prevent duplicates across retries.
 * Exponential backoff on failure; never marks SYNCED without backend confirmation.
 */
export async function syncPendingOfflineTransactions(
  apiFetchImpl: (
    url: string,
    init?: RequestInit,
    options?: { networkOnly?: boolean },
  ) => Promise<Response>,
  options?: { userId?: string },
): Promise<{ synced: number; failed: number }> {
  await ensureOfflineDatabaseReady();
  const reachable = await probeBackendReachable();
  if (!reachable) return { synced: 0, failed: 0 };

  const scope = readActiveUserScope();
  const pending = await getPendingTransactionRecords(options?.userId || scope.userId);
  let synced = 0;
  let failed = 0;

  for (const tx of pending) {
    // Hard guard: never upload another user's transactions.
    if (tx.userId && tx.userId !== scope.userId && tx.userId !== "anonymous") {
      continue;
    }

    await markTransactionSyncState(tx.id, "syncing");
    const queueItems = await offlineDB.syncQueue
      .where("entityId")
      .equals(tx.id)
      .filter((item) => item.status === "pending" || item.status === "failed")
      .toArray();
    for (const item of queueItems) {
      if (item.id != null) {
        await offlineDB.syncQueue.update(item.id, { status: "processing" });
      }
    }

    try {
      let response: Response;
      if (tx.operation === "delete") {
        response = await apiFetchImpl(
          `${tx.apiPath}/${encodeURIComponent(tx.recordRef)}`,
          {
            method: "DELETE",
            headers: {
              "Idempotency-Key": tx.idempotencyKey,
            },
          },
          { networkOnly: true },
        );
      } else {
        const body = { ...tx.payload };
        delete body._localSyncMeta;
        response = await apiFetchImpl(
          tx.apiPath,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": tx.idempotencyKey,
            },
            body: JSON.stringify(body),
          },
          { networkOnly: true },
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(`AUTH_${response.status}`);
      }

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}`);
      }

      // 404 on delete = already gone on server; treat as success
      if (tx.operation === "delete") {
        await offlineDB.transaction(
          "rw",
          [offlineDB.transactions, offlineDB.transactionItems, offlineDB.syncQueue],
          async () => {
            await offlineDB.transactions.delete(tx.id);
            const items = await offlineDB.transactionItems
              .where("transactionId")
              .equals(tx.id)
              .primaryKeys();
            if (items.length > 0) await offlineDB.transactionItems.bulkDelete(items);
            for (const item of queueItems) {
              if (item.id != null) await offlineDB.syncQueue.delete(item.id);
            }
          },
        );
      } else {
        let serverId: string | null = tx.serverId ?? null;
        try {
          const json = (await response.json()) as {
            record?: Record<string, unknown>;
            request?: Record<string, unknown>;
            id?: string | number;
          };
          const remote = json.record || json.request || json;
          const candidate =
            remote?.["id"] ??
            remote?.["requestNo"] ??
            remote?.["callNo"] ??
            remote?.["recordNo"] ??
            json.id;
          if (candidate != null) serverId = String(candidate);
        } catch {
          // Response may be empty; keep local recordRef as server id fallback.
          serverId = serverId || tx.recordRef;
        }

        await offlineDB.transactions.update(tx.id, {
          syncStatus: "synced",
          lastError: undefined,
          serverId,
          retryCount: 0,
          nextRetryAt: undefined,
          updatedAt: Date.now(),
        });
        for (const item of queueItems) {
          if (item.id != null) {
            await offlineDB.syncQueue.delete(item.id);
          }
        }
      }
      synced += 1;
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : "Sync failed";
      const retryCount = (tx.retryCount || 0) + 1;
      const nextRetryAt = Date.now() + computeBackoffMs(retryCount);
      await offlineDB.transactions.update(tx.id, {
        syncStatus: "failed",
        lastError: message,
        retryCount,
        nextRetryAt,
        updatedAt: Date.now(),
      });
      for (const item of queueItems) {
        if (item.id != null) {
          await offlineDB.syncQueue.update(item.id, {
            status: "failed",
            errorMessage: message,
            retryCount,
            nextRetryAt,
          });
        }
      }
      if (message.startsWith("AUTH_")) {
        // Stop the batch on auth failure — remaining items stay pending.
        break;
      }
    }
  }

  const now = Date.now();
  await offlineDB.syncMetadata.put({
    key: `last_transaction_sync:${scope.userId}`,
    userId: scope.userId,
    organizationId: scope.organizationId,
    value: { synced, failed, at: new Date(now).toISOString() },
    updatedAt: now,
  });

  if (typeof window !== "undefined" && (synced > 0 || failed > 0)) {
    window.dispatchEvent(
      new CustomEvent("telesonic:sync-complete", {
        detail: { type: "transactions", synced, failed },
      }),
    );
    window.dispatchEvent(new CustomEvent("telesonic:dexie-update", { detail: { type: "transaction" } }));
  }

  return { synced, failed };
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
    await ensureOfflineDatabaseReady();
    const countJobs = await offlineDB.jobs.where("syncStatus").equals("pending").count();
    const countQueue = await offlineDB.syncQueue
      .where("status")
      .anyOf(["pending", "failed"])
      .count();
    const countTx = await offlineDB.transactions
      .where("syncStatus")
      .anyOf(["pending", "failed"])
      .count();
    return Math.max(countJobs, countQueue, countTx);
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
  userId?: string;
  organizationId?: string;
  offlineExpiresAt?: string;
}

/**
 * Persist auth credentials in the encrypted secure vault (not Dexie / not localStorage).
 * Also removes any legacy plaintext copy from offlineMeta.
 */
export async function saveOfflineAuthSession(session: SavedOfflineAuthSession): Promise<void> {
  try {
    const { saveSecureAuthSession, computeOfflineExpiry } = await import("./secure-session-store");
    const userId =
      session.userId ||
      (session.user["id"] != null ? String(session.user["id"]) : "anonymous");
    const organizationId =
      session.organizationId ||
      (session.user["organizationId"] != null
        ? String(session.user["organizationId"])
        : DEFAULT_ORGANIZATION_ID);
    const savedAt = session.savedAt || new Date().toISOString();
    await saveSecureAuthSession({
      token: session.token,
      user: session.user,
      rememberMe: session.rememberMe,
      savedAt,
      userId,
      organizationId,
      offlineExpiresAt: session.offlineExpiresAt || computeOfflineExpiry(savedAt),
    });
    // Scrub legacy plaintext Dexie auth copy if present.
    try {
      await offlineDB.offlineMeta.delete("saved_auth_session");
    } catch {
      // ignore
    }
  } catch (err) {
    console.error("[SecureVault] Failed to save offline auth session:", err);
  }
}

export async function getOfflineAuthSession(): Promise<SavedOfflineAuthSession | null> {
  try {
    const { getSecureAuthSession } = await import("./secure-session-store");
    const secure = await getSecureAuthSession();
    if (secure) {
      return {
        token: secure.token,
        user: secure.user,
        rememberMe: secure.rememberMe,
        savedAt: secure.savedAt,
        userId: secure.userId,
        organizationId: secure.organizationId,
        offlineExpiresAt: secure.offlineExpiresAt,
      };
    }

    // One-time migration from legacy Dexie plaintext session.
    const meta = await offlineDB.offlineMeta.get("saved_auth_session");
    if (meta && meta.value && typeof meta.value === "object") {
      const legacy = meta.value as SavedOfflineAuthSession;
      await saveOfflineAuthSession(legacy);
      await offlineDB.offlineMeta.delete("saved_auth_session");
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearOfflineAuthSession(): Promise<void> {
  try {
    const { clearSecureAuthSession } = await import("./secure-session-store");
    await clearSecureAuthSession();
  } catch {
    // ignore
  }
  try {
    await offlineDB.offlineMeta.delete("saved_auth_session");
  } catch {
    // ignore
  }
}

export async function putSyncMetadata(
  key: string,
  value: unknown,
  userId?: string,
  organizationId?: string,
): Promise<void> {
  await ensureOfflineDatabaseReady();
  const scope = readActiveUserScope();
  await offlineDB.syncMetadata.put({
    key,
    userId: userId || scope.userId,
    organizationId: organizationId || scope.organizationId,
    value,
    updatedAt: Date.now(),
  });
}

export async function getSyncMetadata<T = unknown>(key: string): Promise<T | null> {
  await ensureOfflineDatabaseReady();
  const row = await offlineDB.syncMetadata.get(key);
  return (row?.value as T) ?? null;
}

export async function isOfflineBootstrapComplete(userId: string): Promise<boolean> {
  const meta = await getSyncMetadata<{ complete?: boolean }>(`bootstrap:${userId}`);
  return meta?.complete === true;
}

export async function cacheMasterOptionsForUser(
  userId: string,
  organizationId: string,
  options: Record<string, unknown>,
): Promise<void> {
  await ensureOfflineDatabaseReady();
  const now = Date.now();
  await offlineDB.masterData.put({
    id: `master-options:${userId}`,
    category: "transaction-master-options",
    userId,
    organizationId,
    data: options,
    updatedAt: now,
  });
}

export async function getCachedMasterOptions(
  userId?: string,
): Promise<Record<string, unknown> | null> {
  await ensureOfflineDatabaseReady();
  const scope = readActiveUserScope();
  const uid = userId || scope.userId;
  const row = await offlineDB.masterData.get(`master-options:${uid}`);
  if (row?.data && typeof row.data === "object") {
    return row.data as Record<string, unknown>;
  }
  return null;
}

export async function cacheUserProfileLocally(input: {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  permissions?: string[];
  profile?: Record<string, unknown>;
}): Promise<void> {
  await ensureOfflineDatabaseReady();
  const now = Date.now();
  const organizationId = input.organizationId || DEFAULT_ORGANIZATION_ID;
  const permissions = input.permissions || [];

  await offlineDB.transaction(
    "rw",
    [
      offlineDB.users,
      offlineDB.organizations,
      offlineDB.roles,
      offlineDB.permissions,
      offlineDB.configurations,
    ],
    async () => {
      await offlineDB.organizations.put({
        id: organizationId,
        name: "Telesonic",
        code: "TELESONIC",
        updatedAt: now,
      });
      await offlineDB.users.put({
        id: input.id,
        email: input.email,
        name: input.name,
        role: input.role,
        organizationId,
        permissions,
        profile: input.profile || {},
        updatedAt: now,
      });
      const roleId = `${input.id}:${input.role}`;
      await offlineDB.roles.put({
        id: roleId,
        code: input.role,
        name: input.role,
        userId: input.id,
        organizationId,
        permissions,
        updatedAt: now,
      });
      await offlineDB.permissions
        .where("userId")
        .equals(input.id)
        .delete();
      if (permissions.length > 0) {
        await offlineDB.permissions.bulkPut(
          permissions.map((code) => ({
            id: `${roleId}:${code}`,
            code,
            roleId,
            userId: input.id,
            organizationId,
            updatedAt: now,
          })),
        );
      }
      await offlineDB.configurations.put({
        key: `user-config:${input.id}`,
        userId: input.id,
        organizationId,
        value: { offlineFirst: true, cachedAt: new Date(now).toISOString() },
        updatedAt: now,
      });
    },
  );
}
