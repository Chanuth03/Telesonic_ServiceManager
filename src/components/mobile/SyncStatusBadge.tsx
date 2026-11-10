import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, HardDrive } from "lucide-react";
import { useSyncManager } from "@/hooks/useSyncManager";
import { useRole } from "@/context/RoleContext";
import { getOfflineDataUpdatedAt } from "@/lib/offline-sync/engine";

function useOfflineDataUpdatedAt(userId: string | null): Date | null {
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const refresh = () => {
      void getOfflineDataUpdatedAt(userId).then((iso) => {
        if (!cancelled) setUpdatedAt(iso ? new Date(iso) : null);
      });
    };
    refresh();
    window.addEventListener("telesonic:offline-data-updated", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("telesonic:offline-data-updated", refresh);
    };
  }, [userId]);
  return updatedAt;
}

export function SyncStatusBadge() {
  const {
    isOnline,
    syncState,
    pendingCount,
    lastSyncedAt,
    lastError,
    triggerSync,
  } = useSyncManager();
  const { user } = useRole();
  const dataUpdatedAt = useOfflineDataUpdatedAt(user?.id != null ? String(user.id) : null);

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-muted/80 p-2.5 text-xs border border-border/60">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <Wifi size={14} className="text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              <WifiOff size={14} className="text-amber-500" />
              <span className="font-semibold text-amber-600 dark:text-amber-400">Offline</span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Data/Wi‑Fi off — using on-device storage
              </span>
            </>
          )}
        </div>

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
              title="Push unsynced records when mobile data or Wi‑Fi is available"
            >
              <RefreshCw size={11} />
              <span>Sync Now</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40 text-muted-foreground">
        <div className="flex items-center gap-1.5 flex-wrap">
          <HardDrive size={11} className="text-blue-500" />
          <span>Local Storage:</span>
          {syncState === "syncing" ? (
            <span className="font-bold text-primary">Syncing…</span>
          ) : pendingCount > 0 ? (
            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              {pendingCount} pending
            </span>
          ) : syncState === "error" ? (
            <span className="font-semibold text-destructive flex items-center gap-0.5">
              <AlertCircle size={11} />
              <span>Sync failed</span>
            </span>
          ) : (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 size={11} />
              <span>Synced</span>
            </span>
          )}
          {lastSyncedAt ? (
            <span className="text-[10px] text-muted-foreground">
              Last sync {lastSyncedAt.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">
        {dataUpdatedAt
          ? `Offline data downloaded ${dataUpdatedAt.toLocaleString()}`
          : isOnline
            ? "Downloading data for offline use…"
            : "Offline data not downloaded yet — connect once to download."}
      </div>

      {!isOnline ? (
        <p className="text-[10px] leading-snug text-amber-700 dark:text-amber-300">
          {pendingCount > 0
            ? `Working offline (no mobile data/Wi‑Fi). ${pendingCount} change${pendingCount > 1 ? "s" : ""} saved on this device and will sync when connection returns.`
            : "Working offline (no mobile data/Wi‑Fi). Jobs, forms, photos and transactions use on-device storage."}
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
