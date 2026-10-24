/**
 * Universal API Client
 *
 * Safely executes /api/* requests against the server.
 * Uses native fetch in browser. Only dynamically imports Node server handler during SSR,
 * ensuring database drivers (pg, net, tls) never leak into the browser client bundle.
 */

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
  const fullUrl = url.startsWith("http") ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`;

  // Browser environment: always use native window.fetch
  if (typeof window !== "undefined") {
    return await window.fetch(fullUrl, init);
  }

  // Server-side (Node.js SSR): dynamically import API handler
  const { handleApiRequest } = await import("./api-handler");
  const req = new Request(fullUrl, init);
  return await handleApiRequest(req);
}
