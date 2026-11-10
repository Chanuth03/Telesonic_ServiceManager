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
  "/sw.js",
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

export interface WarmOfflineCacheOptions {
  /** Job IDs already downloaded into Dexie — used so Airplane Mode can open every job screen. */
  jobIds?: string[];
}

function collectMobilePaths(jobIds: string[] = []): string[] {
  const ids = jobIds.filter(Boolean).slice(0, 60);

  const jobPaths = ids.flatMap((id) =>
    JOB_SUBPATHS.map((suffix) => `/mobile/jobs/${encodeURIComponent(id)}${suffix}`),
  );

  // Every TRX screen must be reachable offline without visiting it online first.
  const trxPaths = Object.keys(TRANSACTION_PROCESS_MAP).flatMap((code) => [
    `/transactions?screen=${encodeURIComponent(code)}`,
    `/transactions?code=${encodeURIComponent(code)}`,
  ]);

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
      "/src/lib/warm-mobile-offline-cache.ts",
      "/src/data/transactionsSpecData.ts",
    ]);
    await Promise.allSettled(Object.values(modules).map((load) => load()));
  } catch (err) {
    console.warn("[OfflineCache] Module preload skipped:", err);
  }
}

async function fetchInBatches(urls: string[], batchSize = 8): Promise<void> {
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async (url) => {
        try {
          await fetch(url, {
            credentials: "same-origin",
            cache: "reload",
            headers: {
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
          });
        } catch {
          // Ignore individual warm failures.
        }
      }),
    );
  }
}

/**
 * While online, visit mobile + transaction URLs and preload JS modules so
 * Airplane Mode / data-off can open the same screens later from cache —
 * including screens the user has never opened in this session.
 */
export async function warmMobileOfflineCache(
  reason = "startup",
  options: WarmOfflineCacheOptions = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!navigator.onLine) return;

  let jobIds = options.jobIds || [];
  if (jobIds.length === 0) {
    try {
      const { getDexieJobs } = await import("@/lib/offline-db");
      const jobs = await getDexieJobs();
      jobIds = jobs.map((j) => j.id).filter(Boolean);
    } catch {
      // ignore — still warm static + TRX shells
    }
  }

  const paths = collectMobilePaths(jobIds);
  console.log(`[OfflineCache] Warming ${paths.length} URLs + modules (${reason})`);

  await preloadAppModules();

  const absolute = paths.map((path) => new URL(path, window.location.origin).href);
  await fetchInBatches(absolute, 8);

  // Cache whatever the browser already downloaded (route chunks, CSS, icons).
  const loaded = performance
    .getEntriesByType("resource")
    .map((entry) => (entry as PerformanceResourceTiming).name)
    .filter((url) => url.startsWith(window.location.origin));

  await askServiceWorkerToCache([...absolute, ...loaded]);

  try {
    localStorage.setItem("telesonic_offline_cache_warmed_at", new Date().toISOString());
    localStorage.setItem("telesonic_offline_cache_warmed_paths", String(paths.length));
  } catch {
    // ignore
  }
}
