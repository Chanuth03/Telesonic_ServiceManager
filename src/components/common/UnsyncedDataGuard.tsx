import React, { useEffect, useState } from "react";
import { syncManager, type SyncStatus } from "@/lib/sync-manager";
import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnsyncedDataGuard() {
  const [status, setStatus] = useState<SyncStatus>(() => syncManager.getStatus());
  const [showRefreshBlockedModal, setShowRefreshBlockedModal] = useState(false);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setStatus);
    return () => unsubscribe();
  }, []);

  // Intercept keyboard reload shortcuts (F5, Ctrl+R, Cmd+R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isReload =
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"));

      if (isReload) {
        const current = syncManager.getStatus();
        if (current.pendingCount > 0 || current.syncState === "syncing") {
          e.preventDefault();
          e.stopPropagation();
          setShowRefreshBlockedModal(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  const hasUnsynced = status.pendingCount > 0 || status.syncState === "syncing";
  const isOffline = !status.isOnline || status.isSimulatedOffline;

  return (
    <>
      {/* Top Warning Banner when offline with unsynced changes */}
      {hasUnsynced && (
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2">
            {isOffline ? (
              <WifiOff className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
            ) : (
              <RefreshCw className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 animate-spin" />
            )}
            <span>
              {isOffline
                ? `You have ${status.pendingCount} offline update${status.pendingCount > 1 ? "s" : ""} saved on this device. Please turn on your internet connection to sync your data to the server.`
                : `Syncing ${status.pendingCount} update${status.pendingCount > 1 ? "s" : ""} to the server... Please do not refresh.`}
            </span>
          </div>
          {isOffline && status.isSimulatedOffline && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200"
              onClick={() => syncManager.toggleSimulatedOffline()}
            >
              Restore Internet
            </Button>
          )}
        </div>
      )}

      {/* Modal dialog when user tries to reload with F5 / Ctrl+R */}
      {showRefreshBlockedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-card p-6 shadow-2xl text-card-foreground">
            <div className="flex items-center gap-3 text-destructive mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-none">
                  Page Refresh Blocked
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Unsynced updates waiting on device
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              You have <strong>{status.pendingCount} pending update{status.pendingCount > 1 ? "s" : ""}</strong> stored locally on this device that have not yet uploaded to the database.
            </p>

            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <WifiOff className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Action required:</strong> Please turn on your internet connection to sync the data to PostgreSQL. Reloading is disabled until your data is safely synchronized.
              </span>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {status.isSimulatedOffline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    syncManager.toggleSimulatedOffline();
                    setShowRefreshBlockedModal(false);
                  }}
                >
                  Turn On Internet (Simulated)
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowRefreshBlockedModal(false)}
              >
                I Understand, Keep Working
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

