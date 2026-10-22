import { useEffect } from "react";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SyncStatusBadge } from "@/components/mobile/SyncStatusBadge";
import { startMobileOfflineBridge } from "@/lib/mobile-offline-bridge";

export const Route = createFileRoute("/mobile")({
  component: MobileLayout,
});

function MobileLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    void startMobileOfflineBridge();
  }, []);

  return (
    <>
      {pathname !== "/mobile/login" ? (
        <div className="mx-auto w-full max-w-md px-3 pt-3">
          <SyncStatusBadge />
        </div>
      ) : null}
      <Outlet />
    </>
  );
}
