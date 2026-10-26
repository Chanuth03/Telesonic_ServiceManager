// Telesonic Service Worker for PWA Offline Caching
const CACHE_NAME = "telesonic-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through fetch with network-first strategy
  if (event.request.method === "GET" && !event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

