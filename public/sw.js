// Telesonic Service Worker — Airplane Mode must serve the real app shell, not an error page
const CACHE_NAME = "telesonic-pwa-v3";
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
            // Ignore individual precache failures.
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

function isStaticAsset(request) {
  const destination = request.destination;
  if (["script", "style", "worker", "font", "image"].includes(destination)) return true;
  const path = new URL(request.url).pathname;
  return (
    path.startsWith("/assets/") ||
    path.startsWith("/icons/") ||
    /\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|ico|json|webmanifest)$/i.test(path)
  );
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
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      background: #f8fafc; color: #0f172a; padding: 24px; text-align: center;
    }
    .card {
      max-width: 360px; width: 100%; border: 1px solid #e2e8f0; border-radius: 16px;
      background: #fff; padding: 24px; box-shadow: 0 1px 2px rgb(15 23 42 / 6%);
    }
    h1 { font-size: 1.15rem; margin: 0 0 8px; }
    p { margin: 0 0 16px; color: #64748b; font-size: 0.9rem; line-height: 1.45; }
    a, button {
      appearance: none; border: 0; border-radius: 10px; padding: 10px 14px;
      background: #2563eb; color: white; font-weight: 600; cursor: pointer;
      text-decoration: none; display: inline-block;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>You're offline</h1>
    <p>Open the mobile app from a screen you used while online. Local jobs and transactions stay on this device.</p>
    <a href="/mobile">Open mobile app</a>
  </div>
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

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  // opaque/cors responses are not useful for same-origin app shell
  if (response.type !== "basic" && response.type !== "cors") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

self.addEventListener("fetch", (event) => {
  if (!isAppRequest(event.request)) return;

  // HTML navigations: network first, then cached shell
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            await putInCache(event.request, response);
            if (new URL(event.request.url).pathname.startsWith("/mobile")) {
              const cache = await caches.open(CACHE_NAME);
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

  // JS/CSS/images: cache-first so Airplane Mode can boot a previously visited build
  if (isStaticAsset(event.request)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) {
          // Refresh in background when online
          event.waitUntil(
            (async () => {
              try {
                const fresh = await fetch(event.request);
                await putInCache(event.request, fresh);
              } catch {
                // keep cached copy
              }
            })(),
          );
          return cached;
        }
        try {
          const response = await fetch(event.request);
          await putInCache(event.request, response);
          return response;
        } catch {
          return new Response("", { status: 503, statusText: "Offline" });
        }
      })(),
    );
    return;
  }

  // Everything else same-origin: network then cache
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        await putInCache(event.request, response);
        return response;
      } catch {
        return (
          (await caches.match(event.request, { ignoreSearch: true })) ||
          new Response("", { status: 503, statusText: "Offline" })
        );
      }
    })(),
  );
});
