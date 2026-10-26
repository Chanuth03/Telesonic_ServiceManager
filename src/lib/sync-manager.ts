/**
 * Global Dynamic Synchronization Manager
 *
 * Manages two-way sync between Dexie.js offline PWA storage and PostgreSQL database.
 * - Triggers whenever network status changes to online (window 'online' event).
 * - Pushes unsynced Dexie.js records via secure POST /api/sync route with role headers.
 * - Supports simulated offline mode toggle for testing PWA field scenarios.
 */

import { getUnsyncedDexieRecords, markDexieAsSynced, getPendingSyncCount } from "./offline-db";
import { apiFetch } from "./api-client";

export type SyncState = "idle" | "syncing" | "synced" | "error" | "offline";

export interface SyncStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  syncState: SyncState;
  lastSyncedAt: Date | null;
  pendingCount: number;
  lastError: string | null;
  lastBatchId: string | null;
}

type SyncListener = (status: SyncStatus) => void;

class GlobalSyncManager {
  private isSimulatedOffline: boolean = false;
  private syncState: SyncState = "idle";
  private lastSyncedAt: Date | null = null;
  private pendingCount: number = 0;
  private lastError: string | null = null;
  private lastBatchId: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isInitialized: boolean = false;
  private autoSyncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Read initial simulated offline state if persisted
    try {
      this.isSimulatedOffline = localStorage.getItem("telesonic_simulated_offline") === "true";
    } catch (e) {
      void e;
    }

    // Register Dynamic Online/Offline Listeners
    window.addEventListener("online", this.handleOnlineEvent);
    window.addEventListener("offline", this.handleOfflineEvent);
    window.addEventListener("beforeunload", this.handleBeforeUnloadEvent);

    // Listen to local Dexie updates to recount pending changes
    window.addEventListener("telesonic:dexie-update", () => {
      this.refreshPendingCount();
    });

    // Initial pending count check
    this.refreshPendingCount();

    // Periodic heartbeat sync check every 45 seconds when online
    this.autoSyncInterval = setInterval(() => {
      if (this.getIsOnline() && this.pendingCount > 0 && this.syncState !== "syncing") {
        console.log("[SyncManager] Background heartbeat sync triggered for pending records.");
        this.triggerSync("heartbeat_timer");
      }
    }, 45000);

    console.log("[SyncManager] Global Dynamic Synchronization Manager initialized.");
  }

  private handleOnlineEvent = () => {
    console.log(
      "[SyncManager] 🌐 Network changed to ONLINE! Initiating automatic push sync to PostgreSQL...",
    );
    this.notify();
    // Immediate dynamic synchronization
    this.triggerSync("network_online_event");
  };

  private handleOfflineEvent = () => {
    console.log("[SyncManager] ⚠️ Network changed to OFFLINE.");
    this.syncState = "offline";
    this.notify();
  };

  private handleBeforeUnloadEvent = (event: BeforeUnloadEvent) => {
    if (this.pendingCount > 0 || this.syncState === "syncing") {
      event.preventDefault();
      event.returnValue = "Unsynced offline changes detected. Are you sure you want to reload or leave?";
      return event.returnValue;
    }
  };

  public getIsOnline(): boolean {
    if (typeof navigator === "undefined") return true;
    if (this.isSimulatedOffline) return false;
    return navigator.onLine;
  }

  public getStatus(): SyncStatus {
    const isOnline = this.getIsOnline();
    let effectiveState = this.syncState;
    if (!isOnline && this.syncState !== "syncing") {
      effectiveState = "offline";
    }

    return {
      isOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      syncState: effectiveState,
      lastSyncedAt: this.lastSyncedAt,
      pendingCount: this.pendingCount,
      lastError: this.lastError,
      lastBatchId: this.lastBatchId,
    };
  }

  public async refreshPendingCount(): Promise<number> {
    const count = await getPendingSyncCount();
    this.pendingCount = count;
    this.notify();
    return count;
  }

  public toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    try {
      localStorage.setItem("telesonic_simulated_offline", String(this.isSimulatedOffline));
    } catch (e) {
      void e;
    }

    console.log(
      `[SyncManager] Simulated offline mode is now: ${this.isSimulatedOffline ? "ACTIVE (Offline)" : "INACTIVE (Online)"}`,
    );

    if (!this.isSimulatedOffline) {
      // Transitioning back to online! Trigger dynamic sync
      console.log("[SyncManager] Simulated online restored! Triggering sync now...");
      this.triggerSync("simulated_online_restored");
    } else {
      this.syncState = "offline";
      this.notify();
    }

    return this.isSimulatedOffline;
  }

  /**
   * Main Dynamic Push Synchronization Routine
   */
  public async triggerSync(reason: string = "manual"): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    const isOnline = this.getIsOnline();
    if (!isOnline) {
      this.syncState = "offline";
      this.notify();
      return {
        success: false,
        count: 0,
        message: "Cannot sync while offline. Queued for next connection.",
      };
    }

    if (this.syncState === "syncing") {
      return {
        success: true,
        count: 0,
        message: "Sync already in progress.",
      };
    }

    try {
      this.syncState = "syncing";
      this.lastError = null;
      this.notify();

      // 1. Gather unsynced Dexie.js records
      const { queueItems, pendingJobs } = await getUnsyncedDexieRecords();
      const totalPending = queueItems.length + pendingJobs.length;

      if (totalPending === 0) {
        this.syncState = "synced";
        this.lastSyncedAt = new Date();
        this.pendingCount = 0;
        this.notify();
        return {
          success: true,
          count: 0,
          message: "All records are already up to date with PostgreSQL.",
        };
      }

      console.log(
        `[SyncManager] Pushing ${queueItems.length} queue actions & ${pendingJobs.length} unsynced jobs to PostgreSQL (/api/sync)...`,
      );

      // 2. Perform secure /api/sync request
      const response = await apiFetch(
        "/api/sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Role": "TECHNICIAN",
            "X-Device-Id": "TECH-MOBILE-PWA-01",
          },
          body: JSON.stringify({
            role: "TECHNICIAN",
            deviceId: "TECH-MOBILE-PWA-01",
            timestamp: new Date().toISOString(),
            triggerReason: reason,
            queueItems,
            pendingJobs,
          }),
        },
        { networkOnly: true },
      );

      if (!response.ok) {
        throw new Error(
          `Sync failed with server status ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // 3. Mark processed records as synced in Dexie.js
      const syncedJobIds = data.syncedJobIds || [];
      const processedQueueIds = data.processedQueueIds || [];

      await markDexieAsSynced(syncedJobIds, processedQueueIds);

      this.lastSyncedAt = new Date();
      this.lastBatchId = data.batchId || null;
      this.syncState = "synced";
      await this.refreshPendingCount();

      console.log(
        `[SyncManager] ✅ Successfully synced ${data.syncedCount} records to PostgreSQL.`,
      );
      return {
        success: true,
        count: data.syncedCount || totalPending,
        message: data.message || "Sync completed successfully",
      };
    } catch (err: unknown) {
      console.error("[SyncManager] Error during sync:", err);
      this.lastError = err instanceof Error ? err.message : "Failed to reach sync endpoint";
      this.syncState = "error";
      this.notify();
      return {
        success: false,
        count: 0,
        message: this.lastError,
      };
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => {
      try {
        fn(status);
      } catch (err) {
        console.error("[SyncManager] Listener error:", err);
      }
    });
  }
}

export const syncManager = new GlobalSyncManager();
