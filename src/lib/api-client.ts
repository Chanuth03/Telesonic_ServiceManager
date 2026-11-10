/**
 * Universal API Client
 *
 * Safely executes /api/* requests against the server.
 * Uses native fetch in browser. Only dynamically imports Node server handler during SSR,
 * ensuring database drivers (pg, net, tls) never leak into the browser client bundle.
 */

export async function apiFetch(
  url: string,
  init?: RequestInit,
  options?: { networkOnly?: boolean },
): Promise<Response> {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
  const fullUrl = url.startsWith("http") ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`;

  // Browser environment: always use native window.fetch
  if (typeof window !== "undefined") {
    // Fail fast when mobile data / Wi‑Fi is already off — do not hang the UI.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        const { setBackendReachable } = await import("./offline-db");
        setBackendReachable(false);
      } catch {
        // ignore
      }
      throw new Error("Network request failed");
    }
    try {
      const res = await window.fetch(fullUrl, init);
      try {
        const { setBackendReachable } = await import("./offline-db");
        setBackendReachable(true);
      } catch {
        // ignore
      }
      if (res.status !== 404) {
        return res;
      }
      if (options?.networkOnly) {
        throw new Error("Main database was not reachable");
      }
      return res;
    } catch (error) {
      try {
        const { setBackendReachable } = await import("./offline-db");
        setBackendReachable(false);
      } catch {
        // ignore
      }
      // Never import the Node/Prisma api-handler into the browser.
      // In Airplane Mode that import hangs or crashes and leaves the UI blank.
      throw error instanceof Error ? error : new Error("Network request failed");
    }
  }

  if (options?.networkOnly) {
    throw new Error("Main database was not reachable");
  }

  // Server-side (Node.js SSR): dynamically import API handler
  const { handleApiRequest } = await import("./api-handler");
  const req = new Request(fullUrl, init);
  return await handleApiRequest(req);
}
