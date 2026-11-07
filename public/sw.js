// Telesonic Service Worker — keep the PWA usable in Airplane Mode
const CACHE_NAME = "telesonic-pwa-v2";
const PRECACHE_URLS = [
  "/",
  "/mobile",
  "/mobile/login",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response.clone());
          } catch {
            // Ignore individual precache failures (route may be auth-gated).
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

function isAppRequest(request) {
  const url = new URL(request.url);
  if (request.method !== "GET") return false;
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.includes("/@vite/") || url.pathname.includes("/@fs/")) return false;
  if (url.search.includes("t=")) return false;
  return true;
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function offlineShellResponse() {
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#2563eb" />
  <title>Telesonic Mobile — Offline</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      background: #0f172a; color: #e2e8f0; padding: 24px; text-align: center;
    }
    .card {
      max-width: 360px; width: 100%; border: 1px solid #334155; border-radius: 16px;
      background: #1e293b; padding: 24px;
    }
    h1 { font-size: 1.15rem; margin: 0 0 8px; }
    p { margin: 0 0 16px; color: #94a3b8; font-size: 0.9rem; line-height: 1.45; }
    button {
      appearance: none; border: 0; border-radius: 10px; padding: 10px 14px;
      background: #2563eb; color: white; font-weight: 600; cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>You are offline</h1>
    <p>Telesonic Mobile is still on this device. Re-open a page you used while online, or reconnect to refresh.</p>
    <button type="button" onclick="location.href='/mobile'">Open mobile app</button>
  </div>
  <script>
    // If a cached app shell exists, prefer it over this fallback page.
    if ("caches" in window) {
      caches.match("/mobile").then(function (cached) {
        if (cached) location.replace("/mobile");
      });
    }
  </script>
</body>
</html>`;
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function cachedAppShell() {
  return (
    (await caches.match("/mobile", { ignoreSearch: true })) ||
    (await caches.match("/", { ignoreSearch: true })) ||
    (await caches.match("/mobile/login", { ignoreSearch: true })) ||
    offlineShellResponse()
  );
}

self.addEventListener("fetch", (event) => {
  if (!isAppRequest(event.request)) return;

  // HTML navigations: network first, then cached shell (never plain-text "Offline")
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, response.clone());
            // Keep a stable shell entry for Airplane Mode restarts
            if (event.request.url.includes("/mobile")) {
              await cache.put("/mobile", response.clone());
            }
          }
          return response;
        } catch {
          return (
            (await caches.match(event.request, { ignoreSearch: true })) || (await cachedAppShell())
          );
        }
      })(),
    );
    return;
  }

  // Static assets / modules: cache-first, then network, then ignore failure
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response && response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        if (event.request.destination === "document") return cachedAppShell();
        return new Response("", { status: 503, statusText: "Offline" });
      }
    })(),
  );
});
