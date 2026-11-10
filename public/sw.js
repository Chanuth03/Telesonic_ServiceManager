// Telesonic Service Worker — keep the real SPA working when data/Wi‑Fi is off.
// All page code is stored at install from /offline-manifest.json (generated at build),
// so screens never visited online still open in Airplane Mode.
const CACHE_NAME = "telesonic-pwa-v10";
const PREV_CACHE_NAMES = ["telesonic-pwa-v9-ios"];
const MANIFEST_URL = "/offline-manifest.json";
const MANIFEST_STATE_KEY = "/__offline-manifest-state";
const NAVIGATION_TIMEOUT_MS = 3500;
const SHELL_URLS = [
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
      await cacheShell(cache);
      await precacheFromManifest();
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // iPhone: keep the previous generation so an offline launch mid-update still has JS/CSS.
      const keep = new Set([CACHE_NAME, ...PREV_CACHE_NAMES]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  const reply = (payload) => {
    const port = event.ports && event.ports[0];
    if (port) port.postMessage(payload);
  };

  if (data.type === "PRECACHE_APP") {
    event.waitUntil(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cacheShell(cache);
          const result = await precacheFromManifest();
          reply({ ok: true, ...result });
        } catch (err) {
          reply({ ok: false, error: String(err) });
        }
      })(),
    );
    return;
  }

  if (data.type === "CACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        await cacheInBatches(cache, data.urls.filter((url) => typeof url === "string"));
        reply({ ok: true });
      })(),
    );
  }
});

async function cacheShell(cache) {
  await Promise.all(
    SHELL_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload", credentials: "same-origin" });
        if (response.ok) {
          await cache.put(url, response.clone());
          await cacheHtmlAssets(cache, response.clone());
        }
      } catch {
        // offline during install — keep whatever is already cached
      }
    }),
  );
}

async function cacheInBatches(cache, urls, batchSize = 10) {
  let stored = 0;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (url) => {
        try {
          if (await cache.match(url)) {
            stored += 1;
            return;
          }
          const response = await fetch(url, { credentials: "same-origin" });
          if (response.ok) {
            await cache.put(url, response.clone());
            stored += 1;
          }
        } catch {
          // retry on next precache request
        }
      }),
    );
  }
  return stored;
}

/** Store every build file listed in the manifest; drop files from builds older than the previous one. */
async function precacheFromManifest() {
  let manifest;
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) return { manifest: false };
    manifest = await response.json();
  } catch {
    return { manifest: false };
  }
  if (!manifest || !Array.isArray(manifest.assets)) return { manifest: false };

  const cache = await caches.open(CACHE_NAME);
  const stored = await cacheInBatches(cache, manifest.assets);

  const stateResponse = await cache.match(MANIFEST_STATE_KEY);
  const state = stateResponse ? await stateResponse.json().catch(() => ({})) : {};
  const previousAssets =
    state.version && state.version !== manifest.version ? state.assets || [] : state.previousAssets || [];

  if (stored === manifest.assets.length) {
    const keep = new Set([...manifest.assets, ...previousAssets]);
    const requests = await cache.keys();
    await Promise.all(
      requests.map(async (request) => {
        const path = new URL(request.url).pathname;
        if (path.startsWith("/assets/") && !keep.has(path)) await cache.delete(request);
      }),
    );
    await cache.put(
      MANIFEST_STATE_KEY,
      new Response(
        JSON.stringify({
          version: manifest.version,
          assets: manifest.assets,
          previousAssets,
          cachedAt: new Date().toISOString(),
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    );
  }

  return {
    manifest: true,
    version: manifest.version,
    total: manifest.assets.length,
    stored,
  };
}

function isAppRequest(request) {
  const url = new URL(request.url);
  if (request.method !== "GET") return false;
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname === MANIFEST_URL) return false;
  if (url.pathname.includes("/@vite/") || url.pathname.includes("/@fs/")) return false;
  if (url.search.includes("t=")) return false;
  return true;
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isHashedAsset(request) {
  return new URL(request.url).pathname.startsWith("/assets/");
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

async function matchAnyCache(request) {
  return (
    (await caches.match(request, { ignoreSearch: true, cacheName: CACHE_NAME })) ||
    (await caches.match(request, { ignoreSearch: true }))
  );
}

/** Prefer a cached SPA document (with JS). Check current + previous cache (iOS). */
async function cachedAppShell() {
  const keys = ["/mobile", "/mobile/", "/", "/transactions", "/mobile/jobs", "/mobile/login"];
  for (const key of keys) {
    const hit = await matchAnyCache(key);
    if (hit) return hit;
  }
  return undefined;
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
    await cacheInBatches(cache, Array.from(urls));
  } catch {
    // ignore
  }
}

/** fetch() that gives up after `ms` — iOS can hang on "connected but no internet". */
function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(request).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

async function handleNavigation(event) {
  try {
    const response = await fetchWithTimeout(event.request, NAVIGATION_TIMEOUT_MS);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, response.clone());
      const path = new URL(event.request.url).pathname;
      if (path === "/" || path.startsWith("/mobile") || path.startsWith("/transactions")) {
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
      (await matchAnyCache(event.request)) ||
      (await cachedAppShell()) ||
      new Response(
        "<!doctype html><html><head><meta charset=utf-8><meta http-equiv=refresh content='0;url=/mobile'></head><body></body></html>",
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
      )
    );
  }
}

async function handleStaticAsset(event) {
  const cached = await matchAnyCache(event.request);
  if (cached) {
    // Hashed build files never change; only revalidate unhashed files (icons, manifest).
    if (!isHashedAsset(event.request)) {
      event.waitUntil(
        fetch(event.request)
          .then((fresh) => putInCache(event.request, fresh))
          .catch(() => {}),
      );
    }
    return cached;
  }
  try {
    const response = await fetch(event.request);
    await putInCache(event.request, response);
    return response;
  } catch {
    return new Response("", { status: 503, statusText: "Offline" });
  }
}

async function handleOther(event) {
  try {
    const response = await fetch(event.request);
    await putInCache(event.request, response);
    return response;
  } catch {
    return (await matchAnyCache(event.request)) || new Response("", { status: 503, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  if (!isAppRequest(event.request)) return;
  if (isNavigationRequest(event.request)) {
    event.respondWith(handleNavigation(event));
    return;
  }
  if (isStaticAsset(event.request)) {
    event.respondWith(handleStaticAsset(event));
    return;
  }
  event.respondWith(handleOther(event));
});
