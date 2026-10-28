import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, HardDrive } from "lucide-react";
import { useSyncManager } from "@/hooks/useSyncManager";

export function SyncStatusBadge() {
  const {
    isOnline,
    isSimulatedOffline,
    syncState,
    pendingCount,
    lastSyncedAt,
    lastError,
    triggerSync,
    toggleSimulatedOffline,
  } = useSyncManager();

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-muted/80 p-2.5 text-xs border border-border/60">
      <div className="flex items-center justify-between gap-2">
        {/* Network & Dexie indicator */}
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <Wifi size={14} className="text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
              <span className="text-[10px] text-muted-foreground font-mono">(PWA Connected)</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              <WifiOff size={14} className="text-amber-500" />
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {isSimulatedOffline ? "Offline (Simulated)" : "Offline (No Connection)"}
              </span>
            </>
          )}
        </div>

        {/* Sync Action & Status */}
        <div className="flex items-center gap-1.5">
          {syncState === "syncing" ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
              <RefreshCw size={12} className="animate-spin text-primary" />
              <span>Sending to the main database...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => triggerSync("badge_sync_now")}
              disabled={!isOnline}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                isOnline
                  ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              }`}
              title="Push unsynced Dexie.js records to PostgreSQL"
            >
              <RefreshCw size={11} />
              <span>Sync Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-row: Pending Queue & Toggle Offline Demo */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <HardDrive size={11} className="text-blue-500" />
          <span>Local Storage:</span>
          {pendingCount > 0 ? (
            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              {pendingCount} unsynced
            </span>
          ) : (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 size={11} />
              <span>Synced</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSimulatedOffline}
          className={`text-[10px] font-semibold underline underline-offset-2 transition-colors cursor-pointer ${
            isSimulatedOffline
              ? "text-emerald-600 font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Toggle simulated offline state to test PWA offline and auto-sync on reconnect"
        >
          {isSimulatedOffline ? "Go Online & Push Sync" : "Test Offline Mode"}
        </button>
      </div>

      {!isOnline && pendingCount > 0 ? (
        <p className="text-[10px] leading-snug text-amber-700 dark:text-amber-300">
          Saved on this device. These changes will be sent to the main database when the connection
          returns.
        </p>
      ) : null}

      {lastError && (
        <div className="text-[10px] text-destructive bg-destructive/10 px-2 py-1 rounded flex items-center gap-1">
          <AlertCircle size={10} />
          <span className="truncate">{lastError}</span>
        </div>
      )}
    </div>
  );
}
