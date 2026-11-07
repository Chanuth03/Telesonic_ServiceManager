import { useEffect } from "react";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppInitializer } from "@/components/mobile/AppInitializer";
import { SyncStatusBadge } from "@/components/mobile/SyncStatusBadge";
import { startMobileOfflineBridge } from "@/lib/mobile-offline-bridge";
import { warmMobileOfflineCache } from "@/lib/warm-mobile-offline-cache";
import { syncManager } from "@/lib/sync-manager";

export const Route = createFileRoute("/mobile")({
  // Client-only so Airplane Mode can reuse cached JS instead of SSR round-trips.
  ssr: false,
  component: MobileLayout,
});

function MobileLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    let warmTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleWarm = (reason: string) => {
      if (!syncManager.getIsOnline()) return;
      if (warmTimer) clearTimeout(warmTimer);
      warmTimer = setTimeout(() => {
        void warmMobileOfflineCache(reason);
      }, 800);
    };

    void startMobileOfflineBridge().then(() => scheduleWarm("mobile_layout"));
    const onOnline = () => scheduleWarm("network_online");
    const onDexie = () => scheduleWarm("dexie_update");
    window.addEventListener("online", onOnline);
    window.addEventListener("telesonic:dexie-update", onDexie);
    window.addEventListener("telesonic:sync-complete", onDexie);
    return () => {
      if (warmTimer) clearTimeout(warmTimer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("telesonic:dexie-update", onDexie);
      window.removeEventListener("telesonic:sync-complete", onDexie);
    };
  }, []);

  return (
    <AppInitializer>
      {pathname !== "/mobile/login" ? (
        <div className="mx-auto w-full max-w-md space-y-3.5 px-1 py-3">
          <SyncStatusBadge />
          <Outlet />
        </div>
      ) : (
        <Outlet />
      )}
    </AppInitializer>
  );
}
