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
    try {
      const res = await window.fetch(fullUrl, init);
      if (res.status !== 404) {
        return res;
      }
      if (options?.networkOnly) {
        throw new Error("Main database was not reachable");
      }
      return res;
    } catch (error) {
      if (options?.networkOnly) {
        throw error instanceof Error ? error : new Error("Main database was not reachable");
      }
      // Offline fallback: if fetch fails (e.g. offline) in browser, dynamically load handler if supported
      try {
        const { handleApiRequest } = await import("./api-handler");
        const req = new Request(fullUrl, init);
        return await handleApiRequest(req);
      } catch {
        throw error instanceof Error ? error : new Error("Network request failed");
      }
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
