import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "@/context/RoleContext";
import { resolveTechnicianStartup } from "@/lib/app-initializer";
import { isOfflineForTransactions } from "@/lib/offline-db";

/**
 * Runs once when the mobile app opens.
 * Offline with a remembered session: skip login and open /mobile.
 * Online: confirm the token with the server when reachable.
 */
export function AppInitializer({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { loginUser, logoutUser } = useRole();
  const navigateRef = useRef(navigate);
  const loginRef = useRef(loginUser);
  const logoutRef = useRef(logoutUser);
  const [ready, setReady] = useState(false);

  navigateRef.current = navigate;
  loginRef.current = loginUser;
  logoutRef.current = logoutUser;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const path = window.location.pathname;
      try {
        const result = await resolveTechnicianStartup();
        if (cancelled) return;

        if (result.status === "authenticated") {
          await loginRef.current(result.user, result.token, result.remember);
          if (path === "/mobile/login") {
            void navigateRef.current({ to: "/mobile", replace: true });
          }
          if (!isOfflineForTransactions()) {
            try {
              const { syncManager } = await import("@/lib/sync-manager");
              void syncManager.triggerSync("app_initializer");
            } catch {
              // ignore
            }
          }
        } else {
          // Never wipe a remembered offline session just because startup could not
          // reach the API. Only clear credentials when we are online and the server
          // rejected the token (handled inside resolveTechnicianStartup → login).
          const offline = isOfflineForTransactions();
          const remembered =
            localStorage.getItem("telesonic_remember_session") === "true" &&
            !!localStorage.getItem("auth_user");

          if (offline && remembered) {
            // Stay on whatever screen we can; do not force login while offline.
            if (path === "/mobile/login") {
              void navigateRef.current({ to: "/mobile", replace: true });
            }
          } else {
            const hadStoredToken =
              !!localStorage.getItem("auth_token") || !!sessionStorage.getItem("auth_token");
            if (hadStoredToken && !offline) await logoutRef.current();
            if (path !== "/mobile/login") {
              void navigateRef.current({ to: "/mobile/login", replace: true });
            }
          }
        }
      } catch (err) {
        console.error("[AppInitializer] Startup failed; continuing with local session if any:", err);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return children;
}
