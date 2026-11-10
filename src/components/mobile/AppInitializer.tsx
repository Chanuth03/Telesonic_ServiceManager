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
    // Never leave the technician on a forever spinner if startup hangs.
    const safety = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 4000);

    void (async () => {
      const path = window.location.pathname;
      try {
        const result = await Promise.race([
          resolveTechnicianStartup(),
          new Promise<"timeout">((resolve) => {
            window.setTimeout(() => resolve("timeout"), 3500);
          }),
        ]);
        if (cancelled) return;

        if (result === "timeout") {
          const remembered =
            localStorage.getItem("telesonic_remember_session") === "true" &&
            !!localStorage.getItem("auth_user");
          if (remembered) {
            try {
              const raw = localStorage.getItem("auth_user");
              const token = localStorage.getItem("auth_token") || "offline-session";
              if (raw) {
                const user = JSON.parse(raw);
                await loginRef.current(user, token, true);
              }
            } catch {
              // ignore
            }
            if (path === "/mobile/login") {
              void navigateRef.current({ to: "/mobile", replace: true });
            }
          } else if (path !== "/mobile/login") {
            void navigateRef.current({ to: "/mobile/login", replace: true });
          }
          return;
        }

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
          const offline = isOfflineForTransactions();
          const remembered =
            localStorage.getItem("telesonic_remember_session") === "true" &&
            !!localStorage.getItem("auth_user");

          if ((offline || !navigator.onLine) && remembered) {
            try {
              const raw = localStorage.getItem("auth_user");
              const token = localStorage.getItem("auth_token") || "offline-session";
              if (raw) {
                const user = JSON.parse(raw);
                await loginRef.current(user, token, true);
              }
            } catch {
              // ignore
            }
            if (path === "/mobile/login") {
              void navigateRef.current({ to: "/mobile", replace: true });
            }
          } else {
            const hadStoredToken =
              !!localStorage.getItem("auth_token") || !!sessionStorage.getItem("auth_token");
            if (hadStoredToken && !offline && navigator.onLine) await logoutRef.current();
            if (path !== "/mobile/login") {
              void navigateRef.current({ to: "/mobile/login", replace: true });
            }
          }
        }
      } catch (err) {
        console.error("[AppInitializer] Startup failed; continuing with local session if any:", err);
        try {
          const raw = localStorage.getItem("auth_user");
          const token = localStorage.getItem("auth_token");
          if (raw && token && localStorage.getItem("telesonic_remember_session") === "true") {
            await loginRef.current(JSON.parse(raw), token, true);
          }
        } catch {
          // ignore
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
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
