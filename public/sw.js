// Telesonic Service Worker — keep the real SPA working when data/Wi‑Fi is off
const CACHE_NAME = "telesonic-pwa-v8";
const PRECACHE_URLS = [
  "/",
  "/mobile",
  "/mobile/",
  "/mobile/login",
  "/mobile/jobs",
  "/mobile/stock-count",
  "/mobile/notifications",
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
            if (response.ok) {
              await cache.put(url, response.clone());
              await cacheHtmlAssets(cache, response.clone());
            }
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

/** Prefer a cached SPA document (with JS), never a dead-end offline HTML card. */
async function cachedAppShell() {
  return (
    (await caches.match("/mobile", { ignoreSearch: true })) ||
    (await caches.match("/mobile/", { ignoreSearch: true })) ||
    (await caches.match("/", { ignoreSearch: true })) ||
    (await caches.match("/transactions", { ignoreSearch: true })) ||
    (await caches.match("/mobile/jobs", { ignoreSearch: true })) ||
    (await caches.match("/mobile/login", { ignoreSearch: true }))
  );
}

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  if (response.type !== "basic" && response.type !== "cors") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function cacheHtmlAssets(cache, response) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return;
    const html = await response.text();
    const origin = self.location.origin;
    const urls = new Set();
    const patterns = [
      /<script[^>]+src=["']([^"']+)["']/gi,
      /<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*(?:stylesheet|modulepreload|preload)[^"']*["']/gi,
      /<link[^>]+rel=["'][^"']*(?:stylesheet|modulepreload|preload)[^"']*["'][^>]*href=["']([^"']+)["']/gi,
    ];
    for (const re of patterns) {
      let match;
      while ((match = re.exec(html))) {
        try {
          const abs = new URL(match[1], origin).href;
          if (abs.startsWith(origin)) urls.add(abs);
        } catch {
          // ignore
        }
      }
    }
    await Promise.all(
      Array.from(urls).map(async (url) => {
        try {
          if (await cache.match(url)) return;
          const asset = await fetch(url, { credentials: "same-origin" });
          if (asset.ok) await cache.put(url, asset.clone());
        } catch {
          // ignore
        }
      }),
    );
  } catch {
    // ignore
  }
}

self.addEventListener("fetch", (event) => {
  if (!isAppRequest(event.request)) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      (async () => {
        // Offline: always serve the real SPA shell so client router can show every page.
        if (!self.navigator.onLine) {
          const exact = await caches.match(event.request, { ignoreSearch: true });
          if (exact) return exact;
          const shell = await cachedAppShell();
          if (shell) return shell;
          // Absolute last resort — still avoid a custom dead-end page; retry shell paths.
          return (
            (await caches.match("/mobile", { ignoreSearch: true })) ||
            new Response("<!doctype html><html><head><meta charset=utf-8><meta http-equiv=refresh content='0;url=/mobile'></head><body></body></html>", {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
          );
        }

        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            await putInCache(event.request, response);
            const path = new URL(event.request.url).pathname;
            const cache = await caches.open(CACHE_NAME);
            if (path === "/" || path === "/mobile" || path.startsWith("/mobile") || path.startsWith("/transactions")) {
              await cache.put("/mobile", response.clone());
              if (path === "/" || path === "/mobile" || path === "/mobile/") {
                await cache.put("/", response.clone());
              }
            }
            event.waitUntil(cacheHtmlAssets(cache, response.clone()));
          }
          return response;
        } catch {
          return (
            (await caches.match(event.request, { ignoreSearch: true })) ||
            (await cachedAppShell()) ||
            Response.error()
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
          if (self.navigator.onLine) {
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
          }
          return cached;
        }

        if (!self.navigator.onLine) {
          const path = new URL(event.request.url).pathname;
          return (
            (await caches.match(path, { ignoreSearch: true })) ||
            new Response("", { status: 503, statusText: "Offline" })
          );
        }

        try {
          const response = await fetch(event.request);
          await putInCache(event.request, response);
          return response;
        } catch {
          const path = new URL(event.request.url).pathname;
          return (
            (await caches.match(path, { ignoreSearch: true })) ||
            new Response("", { status: 503, statusText: "Offline" })
          );
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      if (!self.navigator.onLine) {
        return (
          (await caches.match(event.request, { ignoreSearch: true })) ||
          new Response("", { status: 503, statusText: "Offline" })
        );
      }
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
