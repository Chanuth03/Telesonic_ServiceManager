import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/itsm/AppShell";
import { applyTheme, getSavedTheme } from "@/lib/theme";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { startMobileOfflineBridge } from "@/lib/mobile-offline-bridge";
import { ensureOfflineDatabaseReady } from "@/lib/offline-db";
import { isStandalonePwa } from "@/lib/pwa";
import { UnsyncedDataGuard } from "@/components/common/UnsyncedDataGuard";
import { syncManager } from "@/lib/sync-manager";
import { warmMobileOfflineCache } from "@/lib/warm-mobile-offline-cache";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  useEffect(() => {
    if (!offline) {
      reportLovableError(error, { boundary: "tanstack_root_error_component" });
    }
  }, [error, offline]);

  // No auto-reset loop (that caused endless loading). One clear action into the app.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-lg font-semibold text-foreground">Reload the mobile app</h1>
        <p className="text-sm text-muted-foreground">
          {offline
            ? "You are offline. Open the mobile app to use jobs and transactions saved on this phone."
            : "The last screen failed to open. Continue to the mobile app."}
        </p>
        <button
          type="button"
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          onClick={() => {
            try {
              reset();
            } catch {
              // ignore
            }
            window.location.href = "/mobile";
          }}
        >
          Open mobile app
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Service Manager — Service Desk Platform" },
      {
        name: "description",
        content: "Modern IT service management: incidents, requests, changes and assets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#2563eb" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Telesonic" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;var rem=localStorage.getItem("telesonic_remember_session")==="true"&&!!localStorage.getItem("auth_user");var offline=navigator.onLine===false;if(offline&&rem&&(p==="/mobile/login"||p==="/login")){window.location.replace("/mobile");return;}if(rem&&p==="/login"){window.location.replace("/");return;}if(offline){var killFonts=function(){document.querySelectorAll('link[href*="fonts.googleapis.com"],link[href*="fonts.gstatic.com"]').forEach(function(n){n.remove();});};killFonts();document.addEventListener("DOMContentLoaded",killFonts);}}catch(e){}window.__telesonicInstall=window.__telesonicInstall||null;window.addEventListener("beforeinstallprompt",function(event){event.preventDefault();window.__telesonicInstall=event;window.dispatchEvent(new Event("telesonic-install-ready"));});})();`,
          }}
        />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function hasRememberedOfflineSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      localStorage.getItem("telesonic_remember_session") === "true" &&
      !!localStorage.getItem("auth_user")
    );
  } catch {
    return false;
  }
}

function RootAuthGate({ bare }: { bare: boolean }) {
  const { isAuthenticated, authReady, loginUser } = useRole();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/mobile/login" ||
    pathname === "/mobile-apk-download";
  const isMobilePath = pathname.startsWith("/mobile");
  const remembered = hasRememberedOfflineSession();

  // Force-restore remembered session so the gate never waits forever.
  useEffect(() => {
    if (isAuthenticated || !remembered) return;
    try {
      const raw = localStorage.getItem("auth_user");
      const token = localStorage.getItem("auth_token") || "offline-session";
      if (raw) {
        void loginUser(JSON.parse(raw), token, true);
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated, remembered, loginUser]);

  useEffect(() => {
    if (!authReady && !remembered) return;
    if (remembered && isMobilePath) {
      if (pathname === "/mobile/login") {
        void router.navigate({ to: "/mobile", replace: true });
      }
      return;
    }
    if (!isAuthenticated && !isPublicRoute && !remembered) {
      if (isMobilePath) {
        void router.navigate({ to: "/mobile/login", replace: true });
      } else {
        void router.navigate({ to: "/login", replace: true });
      }
    }
  }, [
    authReady,
    isAuthenticated,
    isPublicRoute,
    pathname,
    router,
    remembered,
    isMobilePath,
  ]);

  // Mobile app: NEVER block on a loading spinner. Always render the screens.
  if (isMobilePath || isPublicRoute || isAuthenticated || remembered) {
    return bare || isMobilePath ? (
      <Outlet />
    ) : (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  // Desktop only short wait — then show app shell anyway.
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const sync = () => setStandalone(isStandalonePwa());
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const installedMobile = standalone && pathname.startsWith("/mobile");
  const bare =
    pathname === "/login" ||
    pathname === "/mobile/login" ||
    pathname === "/mobile-apk-download" ||
    installedMobile;
  useEffect(() => {
    applyTheme(getSavedTheme());
    void (async () => {
      try {
        await ensureOfflineDatabaseReady();
        await startMobileOfflineBridge();
        if (syncManager.getIsOnline()) {
          void syncManager.triggerSync("app_startup");
          // Warm HTML/JS caches so every mobile page works later in Airplane Mode.
          window.setTimeout(() => {
            void warmMobileOfflineCache("app_startup");
          }, 1500);
        }
      } catch (err) {
        console.error("[App] Offline database init failed:", err);
      }
    })();
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (import.meta.env.PROD) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Force activate the latest offline SW after deploy.
            void registration.update();
          })
          .catch(() => {});
      } else {
        // In local development, unregister active service workers so they don't break Vite HMR
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
    }
  }, []);
  return (
    <RoleProvider>
      <QueryClientProvider client={queryClient}>
        <UnsyncedDataGuard />
        <RootAuthGate bare={bare} />
      </QueryClientProvider>
    </RoleProvider>
  );
}
