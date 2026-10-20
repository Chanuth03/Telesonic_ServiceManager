/**
 * Universal API Client
 *
 * Safely executes /api/* requests against the server or dispatches directly
 * to the PostgreSQL (via Prisma) handler when offline or in dev without monkey-patching window.fetch.
 */

import { handleApiRequest } from "./api-handler";

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const fullUrl = url.startsWith("http") ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`;

  // If in browser and online, attempt native fetch first
  if (typeof window !== "undefined") {
    try {
      const res = await window.fetch(fullUrl, init);
      if (res.status !== 404) {
        return res;
      }
    } catch {
      // If network fails (e.g. offline, simulated offline, dev server proxy), fallback to local Prisma handler
    }
  }

  // Direct local dispatch against the PostgreSQL (via Prisma) handler
  const req = new Request(fullUrl, init);
  return await handleApiRequest(req);
}
