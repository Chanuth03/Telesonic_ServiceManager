/**
 * Global Dynamic Synchronization Manager
 *
 * Manages two-way sync between Dexie.js offline PWA storage and PostgreSQL database.
 * - Triggers whenever network status changes to online (window 'online' event).
 * - Pushes unsynced Dexie.js records via secure POST /api/sync route with role headers.
 * - Supports simulated offline mode toggle for testing PWA field scenarios.
 */

import {
  getUnsyncedDexieRecords,
  markDexieAsSynced,
  getPendingSyncCount,
  probeBackendReachable,
  syncPendingOfflineTransactions,
  ensureOfflineDatabaseReady,
  isDeviceOffline,
  setBackendReachable,
} from "./offline-db";
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

    // Clear legacy "Test Offline Mode" flag — real offline = mobile data / Wi‑Fi off.
    this.isSimulatedOffline = false;
    try {
      localStorage.removeItem("telesonic_simulated_offline");
    } catch (e) {
      void e;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setBackendReachable(false);
    }

    // Register Dynamic Online/Offline Listeners (real network / Airplane Mode / data off)
    window.addEventListener("online", this.handleOnlineEvent);
    window.addEventListener("offline", this.handleOfflineEvent);
    window.addEventListener("beforeunload", this.handleBeforeUnloadEvent);
    window.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("pageshow", this.handlePageShow);
    window.addEventListener("focus", this.handleWindowFocus);
    window.addEventListener("telesonic:sync-complete", () => {
      this.refreshPendingCount();
    });
    window.addEventListener("telesonic:connectivity", () => {
      this.notify();
    });
    window.addEventListener("telesonic:auth-changed", () => {
      if (this.getIsOnline()) void this.triggerSync("auth_changed");
    });

    // Some Android browsers fire connection changes when mobile data is toggled
    // even if navigator.onLine is slow to update.
    const nav = navigator as Navigator & {
      connection?: EventTarget & { addEventListener: (type: string, fn: () => void) => void };
    };
    nav.connection?.addEventListener("change", () => {
      void this.refreshConnectivity("connection_change");
    });

    // Listen to local Dexie updates to recount pending changes
    window.addEventListener("telesonic:dexie-update", () => {
      this.refreshPendingCount();
    });

    void ensureOfflineDatabaseReady()
      .then(async () => {
        void this.refreshPendingCount();
        await this.refreshConnectivity("app_startup");
        if (this.getIsOnline() && this.pendingCount > 0) {
          void this.triggerSync("app_startup");
        }
      })
      .catch((err) => console.error("[SyncManager] Dexie init failed:", err));

    // Periodic heartbeat: re-check real connectivity (data/Wi‑Fi), then sync if needed
    this.autoSyncInterval = setInterval(() => {
      void this.refreshConnectivity("heartbeat_timer").then(() => {
        if (this.getIsOnline() && this.pendingCount > 0 && this.syncState !== "syncing") {
          console.log("[SyncManager] Background heartbeat sync triggered for pending records.");
          this.triggerSync("heartbeat_timer");
        }
      });
    }, 20000);

    // Background Sync API when supported (best-effort; app-open resume remains primary).
    try {
      const hasPeriodicOrOneShotSync =
        typeof window !== "undefined" && "serviceWorker" in navigator && "SyncManager" in window;
      if (hasPeriodicOrOneShotSync) {
        void navigator.serviceWorker.ready.then((reg) => {
          const syncReg = reg as ServiceWorkerRegistration & {
            sync?: { register: (tag: string) => Promise<void> };
          };
          void syncReg.sync?.register("telesonic-pending-sync");
        });
      }
    } catch {
      // ignore unsupported environments
    }

    console.log("[SyncManager] Global Dynamic Synchronization Manager initialized.");
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && this.getIsOnline() && this.pendingCount > 0) {
      void this.triggerSync("visibility_resume");
    }
  };

  private handlePageShow = () => {
    if (this.getIsOnline() && this.pendingCount > 0) {
      void this.triggerSync("pageshow_resume");
    }
  };

  private handleWindowFocus = () => {
    if (this.getIsOnline() && this.pendingCount > 0 && this.syncState !== "syncing") {
      void this.triggerSync("window_focus");
    }
  };

  private handleOnlineEvent = () => {
    console.log(
      "[SyncManager] Network reported ONLINE (Wi‑Fi/data). Probing backend before sync...",
    );
    void this.refreshConnectivity("network_online_event").then(async (reachable) => {
      if (!reachable) {
        console.warn("[SyncManager] onLine=true but backend unreachable (data may still be off).");
        this.syncState = "offline";
        this.notify();
        return;
      }
      await this.triggerSync("network_online_event");
    });
  };

  private handleOfflineEvent = () => {
    console.log("[SyncManager] Network OFFLINE (Airplane Mode / Wi‑Fi & data off).");
    setBackendReachable(false);
    this.syncState = "offline";
    this.notify();
  };

  /** Probe real backend reachability and refresh Online/Offline UI. */
  public async refreshConnectivity(reason = "manual"): Promise<boolean> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setBackendReachable(false);
      this.syncState = "offline";
      this.notify();
      return false;
    }
    const reachable = await probeBackendReachable(2500);
    if (!reachable) {
      this.syncState = "offline";
    } else if (this.syncState === "offline") {
      this.syncState = "idle";
    }
    this.notify();
    console.log(`[SyncManager] Connectivity (${reason}): ${reachable ? "reachable" : "unreachable"}`);
    return reachable;
  }

  private handleBeforeUnloadEvent = (event: BeforeUnloadEvent) => {
    if (this.pendingCount > 0 || this.syncState === "syncing") {
      event.preventDefault();
      event.returnValue = "Unsynced offline changes detected. Are you sure you want to reload or leave?";
      return event.returnValue;
    }
  };

  public getIsOnline(): boolean {
    // Real network only — mobile data / Wi‑Fi / Airplane Mode.
    return !isDeviceOffline();
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
      const reachable = await probeBackendReachable();
      if (!reachable) {
        this.syncState = "offline";
        this.notify();
        return {
          success: false,
          count: 0,
          message: "Backend unreachable. Local Dexie data kept; will retry when online.",
        };
      }

      this.syncState = "syncing";
      this.lastError = null;
      this.notify();

      // 1. Sync offline transactions first (Dexie → process API paths)
      const txResult = await syncPendingOfflineTransactions(apiFetch);

      // 2. Gather unsynced job/queue records
      const { queueItems, pendingJobs } = await getUnsyncedDexieRecords();
      const jobQueueItems = queueItems.filter(
        (item) =>
          item.action !== "TRANSACTION_UPSERT" && item.action !== "TRANSACTION_DELETE",
      );
      const totalPending = jobQueueItems.length + pendingJobs.length;
      let jobSyncedCount = 0;

      if (totalPending > 0) {
        console.log(
          `[SyncManager] Pushing ${jobQueueItems.length} queue actions & ${pendingJobs.length} unsynced jobs to PostgreSQL (/api/sync)...`,
        );

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
              queueItems: jobQueueItems,
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
        const syncedJobIds = data.syncedJobIds || [];
        const processedQueueIds = data.processedQueueIds || [];
        await markDexieAsSynced(syncedJobIds, processedQueueIds);
        jobSyncedCount = data.syncedCount || totalPending;
        this.lastBatchId = data.batchId || null;
      }

      this.lastSyncedAt = new Date();
      this.syncState = txResult.failed > 0 ? "error" : "synced";
      if (txResult.failed > 0) {
        this.lastError = `${txResult.failed} transaction(s) failed to sync; kept in Dexie for retry.`;
      }
      await this.refreshPendingCount();

      const totalSynced = jobSyncedCount + txResult.synced;
      console.log(
        `[SyncManager] ✅ Synced jobs=${jobSyncedCount}, transactions=${txResult.synced}, failedTx=${txResult.failed}`,
      );
      return {
        success: txResult.failed === 0,
        count: totalSynced,
        message:
          totalSynced === 0 && txResult.failed === 0
            ? "All records are already up to date with PostgreSQL."
            : `Synced ${totalSynced} record(s).`,
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
