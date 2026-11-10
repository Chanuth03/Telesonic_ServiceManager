/**
 * Store all page code for offline use.
 *
 * Primary path: the service worker downloads every file listed in the
 * build-time /offline-manifest.json. Fallback (manifest missing): load every
 * route's code chunk through the router so the service worker caches it as it
 * passes through.
 */

interface RouteChunkLoader {
  routesById: Record<string, unknown>;
  loadRouteChunk: (route: never) => Promise<void> | undefined;
}

export interface PrecacheResult {
  ok: boolean;
  manifest: boolean;
  total?: number;
  stored?: number;
  version?: string;
  fallbackRoutes?: number;
}

let routerRef: RouteChunkLoader | null = null;
let inFlight: Promise<PrecacheResult> | null = null;

/** Called once from the root component so the fallback can reach every route. */
export function registerOfflineRouter(router: unknown): void {
  const candidate = router as Partial<RouteChunkLoader> | null;
  if (candidate?.routesById && typeof candidate.loadRouteChunk === "function") {
    routerRef = candidate as RouteChunkLoader;
  }
}

async function askServiceWorker(timeoutMs: number): Promise<PrecacheResult> {
  if (!("serviceWorker" in navigator)) return { ok: false, manifest: false };
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 5000)),
  ]);
  const worker = registration?.active;
  if (!worker) return { ok: false, manifest: false };

  return new Promise<PrecacheResult>((resolve) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => resolve({ ok: false, manifest: false }), timeoutMs);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      const data = (event.data || {}) as Partial<PrecacheResult>;
      resolve({ ok: Boolean(data.ok), manifest: Boolean(data.manifest), ...data });
    };
    worker.postMessage({ type: "PRECACHE_APP" }, [channel.port2]);
  });
}

async function loadAllRouteChunks(): Promise<number> {
  if (!routerRef) return 0;
  const routes = Object.values(routerRef.routesById);
  await Promise.allSettled(
    routes.map((route) => Promise.resolve(routerRef!.loadRouteChunk(route as never))),
  );
  return routes.length;
}

export async function warmMobileOfflineCache(reason = "startup"): Promise<PrecacheResult> {
  if (typeof window === "undefined") return { ok: false, manifest: false };
  if (!navigator.onLine) return { ok: false, manifest: false };
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const result = await askServiceWorker(120_000);
    if (!result.manifest) {
      result.fallbackRoutes = await loadAllRouteChunks();
    }
    console.log(`[OfflineCache] Page code precache (${reason}):`, result);
    try {
      localStorage.setItem(
        "telesonic_offline_cache_warmed_at",
        JSON.stringify({ at: new Date().toISOString(), ...result }),
      );
    } catch {
      // ignore
    }
    return result;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
