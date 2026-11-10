import { getMobileJobs } from "@/lib/mobile-data";
import { TRANSACTION_PROCESS_MAP } from "@/lib/transactions-db";

const MOBILE_STATIC_PATHS = [
  "/",
  "/mobile",
  "/mobile/",
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

const JOB_SUBPATHS = [
  "",
  "/travel",
  "/parts",
  "/labour",
  "/photos",
  "/inspection",
  "/hold",
  "/completion",
] as const;

function collectMobilePaths(): string[] {
  const jobIds = getMobileJobs(false)
    .map((job) => job.id)
    .filter(Boolean)
    .slice(0, 40);

  const jobPaths = jobIds.flatMap((id) =>
    JOB_SUBPATHS.map((suffix) => `/mobile/jobs/${encodeURIComponent(id)}${suffix}`),
  );

  // Transactions hub is one SPA route; still warm it so the chunk is cached.
  const trxPaths = Object.keys(TRANSACTION_PROCESS_MAP).map(
    (code) => `/transactions?screen=${encodeURIComponent(code)}`,
  );

  return Array.from(new Set([...MOBILE_STATIC_PATHS, ...jobPaths, ...trxPaths]));
}

async function askServiceWorkerToCache(urls: string[]) {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready.catch(() => null);
  const worker = registration?.active;
  if (!worker || urls.length === 0) return;
  worker.postMessage({ type: "CACHE_URLS", urls });
}

/** Eager-load route/component modules so their hashed chunks hit the SW cache. */
async function preloadAppModules(): Promise<void> {
  try {
    const modules = import.meta.glob([
      "/src/routes/mobile*.tsx",
      "/src/routes/transactions.tsx",
      "/src/components/transactions/**/*.{ts,tsx}",
      "/src/components/mobile/**/*.{ts,tsx}",
      "/src/lib/offline-*.ts",
      "/src/lib/sync-manager.ts",
      "/src/lib/mobile-*.ts",
    ]);
    await Promise.allSettled(Object.values(modules).map((load) => load()));
  } catch (err) {
    console.warn("[OfflineCache] Module preload skipped:", err);
  }
}

/**
 * While online, visit mobile + transaction URLs and preload JS modules so
 * Airplane Mode / data-off can open the same screens later from cache.
 */
export async function warmMobileOfflineCache(reason = "startup"): Promise<void> {
  if (typeof window === "undefined") return;
  if (!navigator.onLine) return;

  const paths = collectMobilePaths();
  console.log(`[OfflineCache] Warming ${paths.length} URLs + modules (${reason})`);

  await preloadAppModules();

  const absolute = paths.map((path) => new URL(path, window.location.origin).href);

  await Promise.allSettled(
    absolute.map(async (url) => {
      try {
        await fetch(url, {
          credentials: "same-origin",
          cache: "reload",
          headers: { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
        });
      } catch {
        // Ignore individual warm failures.
      }
    }),
  );

  // Cache whatever the browser already downloaded (route chunks, CSS, icons).
  const loaded = performance
    .getEntriesByType("resource")
    .map((entry) => (entry as PerformanceResourceTiming).name)
    .filter((url) => url.startsWith(window.location.origin));

  await askServiceWorkerToCache([...absolute, ...loaded]);

  try {
    localStorage.setItem("telesonic_offline_cache_warmed_at", new Date().toISOString());
  } catch {
    // ignore
  }
}
