export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type InstallListener = (event: BeforeInstallPromptEvent | null) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let started = false;
const listeners = new Set<InstallListener>();

function notify() {
  for (const listener of listeners) listener(deferredPrompt);
}

function readStashedPrompt() {
  const stashed = (window as Window & { __telesonicInstall?: BeforeInstallPromptEvent | null })
    .__telesonicInstall;
  return stashed ?? null;
}

export function initPwa() {
  if (started || typeof window === "undefined") return;
  started = true;

  deferredPrompt = readStashedPrompt();

  window.addEventListener("telesonic-install-ready", () => {
    deferredPrompt = readStashedPrompt();
    notify();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    (window as Window & { __telesonicInstall?: BeforeInstallPromptEvent | null }).__telesonicInstall =
      deferredPrompt;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });

  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* Install stays unavailable if the worker cannot register. */
    });
  }
}

export function subscribeInstallPrompt(listener: InstallListener) {
  listeners.add(listener);
  listener(deferredPrompt);
  return () => {
    listeners.delete(listener);
  };
}

export function canPromptPwaInstall() {
  return deferredPrompt != null;
}

export async function promptPwaInstall() {
  if (!deferredPrompt) return null;
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  notify();
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  return choice.outcome;
}

export function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /WhatsApp|FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|Snapchat|Twitter|LinkedInApp/i.test(
    navigator.userAgent,
  );
}

export function openInDeviceBrowser() {
  const current = window.location.href;
  if (isIosDevice()) return;
  const withoutScheme = current.replace(/^https?:\/\//, "");
  window.location.href = `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(current)};end`;
}

export function waitForInstallPrompt(timeoutMs: number) {
  if (canPromptPwaInstall()) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    let timer = 0;
    const stop = subscribeInstallPrompt((event) => {
      if (!event) return;
      window.clearTimeout(timer);
      stop();
      resolve(true);
    });
    timer = window.setTimeout(() => {
      stop();
      resolve(canPromptPwaInstall());
    }, timeoutMs);
  });
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

if (typeof window !== "undefined") {
  initPwa();
}
