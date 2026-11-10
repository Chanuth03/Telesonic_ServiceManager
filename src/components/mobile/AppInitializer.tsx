import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "@/context/RoleContext";
import { resolveTechnicianStartup } from "@/lib/app-initializer";
import { isOfflineForTransactions } from "@/lib/offline-db";

/**
 * Restores the technician session in the background.
 * Never blocks the mobile UI behind a spinner — pages must render offline
 * from Dexie the same way they do online.
 */
export function AppInitializer({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { loginUser, logoutUser, isAuthenticated } = useRole();
  const navigateRef = useRef(navigate);
  const loginRef = useRef(loginUser);
  const logoutRef = useRef(logoutUser);
  const authedRef = useRef(isAuthenticated);

  navigateRef.current = navigate;
  loginRef.current = loginUser;
  logoutRef.current = logoutUser;
  authedRef.current = isAuthenticated;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const path = window.location.pathname;
      try {
        // If RoleContext already restored a remembered session, do not block or redirect away.
        if (authedRef.current) {
          if (path === "/mobile/login") {
            void navigateRef.current({ to: "/mobile", replace: true });
          }
          if (!isOfflineForTransactions() && navigator.onLine) {
            try {
              const { syncManager } = await import("@/lib/sync-manager");
              void syncManager.triggerSync("app_initializer");
            } catch {
              // ignore
            }
          }
          return;
        }

        const result = await Promise.race([
          resolveTechnicianStartup(),
          new Promise<"timeout">((resolve) => {
            window.setTimeout(() => resolve("timeout"), 2500);
          }),
        ]);
        if (cancelled) return;

        const rememberLocal = () => {
          try {
            const raw = localStorage.getItem("auth_user");
            const token = localStorage.getItem("auth_token") || "offline-session";
            if (
              raw &&
              localStorage.getItem("telesonic_remember_session") === "true"
            ) {
              return { user: JSON.parse(raw), token };
            }
          } catch {
            // ignore
          }
          return null;
        };

        if (result === "timeout") {
          const local = rememberLocal();
          if (local) {
            await loginRef.current(local.user, local.token, true);
            if (path === "/mobile/login") {
              void navigateRef.current({ to: "/mobile", replace: true });
            }
          }
          return;
        }

        if (result.status === "authenticated") {
          await loginRef.current(result.user, result.token, result.remember);
          if (path === "/mobile/login") {
            void navigateRef.current({ to: "/mobile", replace: true });
          }
          if (!isOfflineForTransactions() && navigator.onLine) {
            try {
              const { syncManager } = await import("@/lib/sync-manager");
              void syncManager.triggerSync("app_initializer");
            } catch {
              // ignore
            }
          }
          return;
        }

        const local = rememberLocal();
        if (local && (!navigator.onLine || isOfflineForTransactions())) {
          await loginRef.current(local.user, local.token, true);
          if (path === "/mobile/login") {
            void navigateRef.current({ to: "/mobile", replace: true });
          }
          return;
        }

        if (path.startsWith("/mobile") && path !== "/mobile/login" && !local) {
          void navigateRef.current({ to: "/mobile/login", replace: true });
        }
      } catch (err) {
        console.error("[AppInitializer] Startup failed; showing app with local session if any:", err);
        try {
          const raw = localStorage.getItem("auth_user");
          const token = localStorage.getItem("auth_token") || "offline-session";
          if (raw && localStorage.getItem("telesonic_remember_session") === "true") {
            await loginRef.current(JSON.parse(raw), token, true);
          }
        } catch {
          // ignore
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Always render the app immediately — Dexie-backed screens must work offline.
  return children;
}
