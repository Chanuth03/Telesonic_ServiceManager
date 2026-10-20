/**
 * Client-Side API Route Interceptor (Safe No-Op)
 *
 * Replaced by safe apiFetch in src/lib/api-client.ts to avoid modifying window.fetch.
 */

export function setupClientApiInterceptor(): void {
  // Safe no-op: window.fetch is getter-only in this environment
}
