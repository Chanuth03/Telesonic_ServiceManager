// Telesonic Service Worker for PWA Offline Caching
const CACHE_NAME = "telesonic-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests and skip internal vite/HMR requests and API routes
  if (
    event.request.method === "GET" &&
    !event.request.url.includes("/api/") &&
    !event.request.url.includes("/@vite/") &&
    !event.request.url.includes("/@fs/") &&
    !event.request.url.includes("?t=")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return a safe offline fallback response instead of undefined
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        })
    );
  }
});


