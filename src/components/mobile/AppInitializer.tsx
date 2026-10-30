import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "@/context/RoleContext";
import { resolveTechnicianStartup } from "@/lib/app-initializer";

/**
 * Runs once when the mobile app opens.
 * Offline with a valid stored JWT and profile: skip login and open /mobile.
 * Online: confirm the token with the server, then open the dashboard or the login screen.
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
      const result = await resolveTechnicianStartup();
      if (cancelled) return;

      if (result.status === "authenticated") {
        await loginRef.current(result.user, result.token, result.remember);
        if (path === "/mobile/login") {
          void navigateRef.current({ to: "/mobile", replace: true });
        }
      } else {
        const hadStoredToken =
          !!localStorage.getItem("auth_token") || !!sessionStorage.getItem("auth_token");
        if (hadStoredToken) await logoutRef.current();
        if (path !== "/mobile/login") {
          void navigateRef.current({ to: "/mobile/login", replace: true });
        }
      }

      if (!cancelled) setReady(true);
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
