/**
 * First-login bootstrap: cache the profile, download every *required* dataset
 * (jobs, notifications, van stock, master data) before entering the app, then
 * download transaction history and all page code in the background.
 *
 * Returning sessions never repeat the full download — the sync engine only
 * pulls datasets that are missing or past their TTL.
 */

import {
  cacheUserProfileLocally,
  DEFAULT_ORGANIZATION_ID,
  ensureOfflineDatabaseReady,
  isOfflineBootstrapComplete,
  putSyncMetadata,
} from "./offline-db";
import { isRequiredDataReady, syncOfflineData } from "./offline-sync/engine";
import { warmMobileOfflineCache } from "./warm-mobile-offline-cache";

export type BootstrapPhase =
  | "idle"
  | "opening-db"
  | "caching-profile"
  | "downloading"
  | "finalizing"
  | "ready"
  | "error";

export interface BootstrapProgress {
  phase: BootstrapPhase;
  message: string;
  percent: number;
  offlineReady: boolean;
  error?: string | undefined;
}

export interface BootstrapUserInput {
  id: string | number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  organizationId?: string;
  [key: string]: unknown;
}

type ProgressListener = (progress: BootstrapProgress) => void;

const listeners = new Set<ProgressListener>();
let currentProgress: BootstrapProgress = {
  phase: "idle",
  message: "",
  percent: 0,
  offlineReady: false,
};

function emit(partial: Partial<BootstrapProgress>) {
  currentProgress = { ...currentProgress, ...partial };
  listeners.forEach((fn) => {
    try {
      fn(currentProgress);
    } catch {
      // ignore listener errors
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("telesonic:bootstrap-progress", { detail: currentProgress }),
    );
  }
}

export function subscribeBootstrapProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  listener(currentProgress);
  return () => listeners.delete(listener);
}

export function getBootstrapProgress(): BootstrapProgress {
  return currentProgress;
}

export async function checkOfflineReady(userId: string): Promise<boolean> {
  await ensureOfflineDatabaseReady();
  return isOfflineBootstrapComplete(userId);
}

/** Background work after the required data is on the device. */
function startBackgroundDownloads(auth: { token: string; userId: string; organizationId: string }) {
  void warmMobileOfflineCache("login_bootstrap");
  void syncOfflineData({ reason: "login_background", scope: "all", pushFirst: false, auth });
}

/** Run after a successful online login. Waits only for the required datasets. */
export async function runOfflineBootstrap(input: {
  user: BootstrapUserInput;
  token: string;
}): Promise<BootstrapProgress> {
  const userId = String(input.user.id);
  const organizationId = input.user.organizationId
    ? String(input.user.organizationId)
    : DEFAULT_ORGANIZATION_ID;
  const auth = { token: input.token, userId, organizationId };

  try {
    emit({
      phase: "opening-db",
      message: "Preparing on-device storage…",
      percent: 5,
      offlineReady: false,
      error: undefined,
    });
    await ensureOfflineDatabaseReady();

    emit({ phase: "caching-profile", message: "Saving your profile…", percent: 15 });
    await cacheUserProfileLocally({
      id: userId,
      email: input.user.email,
      name: input.user.name,
      role: input.user.role,
      organizationId,
      permissions: Array.isArray(input.user.permissions) ? input.user.permissions : [],
      profile: { ...input.user },
    });

    emit({ phase: "downloading", message: "Downloading data for offline use…", percent: 25 });
    const summary = await syncOfflineData({
      reason: "login",
      scope: "required",
      force: true,
      pushFirst: false,
      auth,
      onProgress: ({ done, total, label }) => {
        const pct = total > 0 ? 25 + Math.round((done / total) * 65) : 90;
        emit({ phase: "downloading", message: `Downloading ${label}…`, percent: pct });
      },
    });

    emit({ phase: "finalizing", message: "Finishing up…", percent: 95 });
    const ready = summary.requiredReady || (await isRequiredDataReady(userId));
    await putSyncMetadata(
      `bootstrap:${userId}`,
      {
        complete: ready,
        partial: !ready,
        failed: summary.failed,
        completedAt: new Date().toISOString(),
        organizationId,
      },
      userId,
      organizationId,
    );

    startBackgroundDownloads(auth);

    emit({
      phase: "ready",
      message: ready
        ? "Offline data ready. You can work without internet."
        : "Some data could not be downloaded. It will retry automatically while online.",
      percent: 100,
      offlineReady: true,
      ...(ready ? {} : { error: `Failed: ${summary.failed.join(", ")}` }),
    });
    return currentProgress;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bootstrap failed";
    console.warn("[Bootstrap] Failed; app stays usable with on-device data:", err);
    emit({
      phase: "ready",
      message: "Some data could not be downloaded. It will retry automatically while online.",
      percent: 100,
      offlineReady: true,
      error: message,
    });
    return currentProgress;
  }
}
