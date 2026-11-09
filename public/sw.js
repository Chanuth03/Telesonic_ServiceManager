// Telesonic Service Worker — full mobile offline (Airplane Mode)
const CACHE_NAME = "telesonic-pwa-v5";
const PRECACHE_URLS = [
  "/",
  "/mobile",
  "/mobile/login",
  "/mobile/jobs",
  "/mobile/stock-count",
  "/mobile/notifications",
  "/mobile-apk-download",
  "/transactions",
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
            // ignore
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

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        data.urls.map(async (url) => {
          try {
            if (typeof url !== "string") return;
            const request = new Request(url, { credentials: "same-origin" });
            const response = await fetch(request);
            if (response && response.ok) await cache.put(request, response.clone());
          } catch {
            // ignore
          }
        }),
      );
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
    /\.(js|css|mjs|woff2?|ttf|png|jpg|jpeg|svg|webp|ico|json|webmanifest)$/i.test(path)
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
    body { margin:0; min-height:100vh; display:grid; place-items:center; font-family:system-ui,-apple-system,sans-serif; background:#f8fafc; color:#0f172a; padding:24px; text-align:center; }
    .card { max-width:360px; width:100%; border:1px solid #e2e8f0; border-radius:16px; background:#fff; padding:24px; }
    h1 { font-size:1.15rem; margin:0 0 8px; }
    p { margin:0 0 16px; color:#64748b; font-size:0.9rem; line-height:1.45; }
    a { appearance:none; border:0; border-radius:10px; padding:10px 14px; background:#2563eb; color:#fff; font-weight:600; text-decoration:none; display:inline-block; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You're offline</h1>
    <p>Open a mobile screen you used while online. Jobs, photos, parts, labour and transactions stay on this device.</p>
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
    (await caches.match("/mobile/jobs", { ignoreSearch: true })) ||
    (await caches.match("/", { ignoreSearch: true })) ||
    (await caches.match("/mobile/login", { ignoreSearch: true })) ||
    offlineShellResponse()
  );
}

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  if (response.type !== "basic" && response.type !== "cors") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

self.addEventListener("fetch", (event) => {
  if (!isAppRequest(event.request)) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            await putInCache(event.request, response);
            const path = new URL(event.request.url).pathname;
            if (path === "/mobile" || path.startsWith("/mobile/")) {
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

  if (isStaticAsset(event.request)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) {
          event.waitUntil(
            (async () => {
              try {
                const fresh = await fetch(event.request);
                await putInCache(event.request, fresh);
              } catch {
                // keep cached
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
          // Last resort: pathname match ignoring full URL variance after deploys.
          const path = new URL(event.request.url).pathname;
          const byPath = await caches.match(path, { ignoreSearch: true });
          if (byPath) return byPath;
          return new Response("", { status: 503, statusText: "Offline" });
        }
      })(),
    );
    return;
  }

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
