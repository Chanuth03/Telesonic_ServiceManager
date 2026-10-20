import { useState, useEffect } from "react";
import { syncManager, SyncStatus } from "@/lib/sync-manager";

export function useSyncManager() {
  const [status, setStatus] = useState<SyncStatus>(() => syncManager.getStatus());

  useEffect(() => {
    return syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  return {
    ...status,
    triggerSync: (reason?: string) => syncManager.triggerSync(reason),
    toggleSimulatedOffline: () => syncManager.toggleSimulatedOffline(),
    refreshPendingCount: () => syncManager.refreshPendingCount(),
  };
}
