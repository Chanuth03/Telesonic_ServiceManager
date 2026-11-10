// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { createHash } from "node:crypto";
import type { Plugin } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const OFFLINE_ASSET_PATTERN = /\.(m?js|css|woff2?|ttf|otf|svg|png|jpe?g|webp|gif|ico)$/i;

/**
 * Emits /offline-manifest.json listing every client build file so the service
 * worker can store all page code at install — not only pages already visited.
 */
function offlineAssetManifest(): Plugin {
  return {
    name: "telesonic-offline-asset-manifest",
    apply: "build",
    applyToEnvironment(environment) {
      return environment.name === "client";
    },
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle)
        .filter((fileName) => OFFLINE_ASSET_PATTERN.test(fileName))
        .map((fileName) => `/${fileName.replace(/^\/+/, "")}`)
        .sort();
      const version = createHash("sha1").update(assets.join("|")).digest("hex").slice(0, 12);
      this.emitFile({
        type: "asset",
        fileName: "offline-manifest.json",
        source: JSON.stringify({ version, generatedAt: new Date().toISOString(), assets }),
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  plugins: [offlineAssetManifest()],
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
