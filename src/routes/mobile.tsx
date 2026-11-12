import { useEffect } from "react";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppInitializer } from "@/components/mobile/AppInitializer";
import { SyncStatusBadge } from "@/components/mobile/SyncStatusBadge";
import { startMobileOfflineBridge } from "@/lib/mobile-offline-bridge";
import { MobileI18nProvider, MobileLanguageSwitch } from "@/lib/mobile-i18n";

export const Route = createFileRoute("/mobile")({
  // Client-only so Airplane Mode can reuse cached JS instead of SSR round-trips.
  ssr: false,
  component: MobileLayout,
});

function MobileLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    try {
      sessionStorage.removeItem("telesonic_offline_recover");
    } catch {
      // ignore
    }

    // Downloads and page-code caching are driven from the root (offline sync lifecycle).
    void startMobileOfflineBridge();
  }, []);

  return (
    <MobileI18nProvider>
      <AppInitializer>
        {pathname !== "/mobile/login" ? (
          <div className="mx-auto w-full max-w-md space-y-3.5 px-1 py-3">
            <MobileLanguageSwitch />
            <SyncStatusBadge />
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </AppInitializer>
    </MobileI18nProvider>
  );
}
