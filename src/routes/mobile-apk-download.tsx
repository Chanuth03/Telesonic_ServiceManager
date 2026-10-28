import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Smartphone, Download, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isInAppBrowser,
  isIosDevice,
  isStandalonePwa,
  openInDeviceBrowser,
  promptPwaInstall,
  waitForInstallPrompt,
} from "@/lib/pwa";

export const Route = createFileRoute("/mobile-apk-download")({
  head: () => ({
    meta: [
      { title: "Telesonic Mobile App — Service Manager" },
      {
        name: "description",
        content: "Install and run Telesonic Service Manager Mobile Application.",
      },
    ],
  }),
  component: MobileApkDownloadPage,
});

function MobileApkDownloadPage() {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [manualInstall, setManualInstall] = useState<"ios" | "android" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsInstalled(isStandalonePwa());
  }, []);

  const handleDownloadAndInstall = async () => {
    setMessage(null);
    setManualInstall(null);

    if (isStandalonePwa()) {
      navigate({ to: "/mobile" });
      return;
    }

    if (isIosDevice()) {
      setManualInstall("ios");
      return;
    }

    if (isInAppBrowser()) {
      openInDeviceBrowser();
      return;
    }

    setIsLaunching(true);
    try {
      const ready = await waitForInstallPrompt(4000);
      if (!ready) {
        setManualInstall("android");
        return;
      }
      const outcome = await promptPwaInstall();
      if (outcome === "accepted") {
        setIsInstalled(true);
        navigate({ to: "/mobile" });
        return;
      }
      if (outcome === "dismissed") {
        setMessage(
          "Installation was cancelled. Tap Download again when you want the app on this phone.",
        );
      } else {
        setManualInstall("android");
      }
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Top Back Action */}
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/login">
              <ArrowLeft size={16} className="mr-1.5" />
              Back to Website Login
            </Link>
          </Button>
        </div>

        {/* Main APK / PWA Download Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-xl space-y-6 relative overflow-hidden">
          {/* Top Decorative Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-info to-primary" />

          {/* App Header & Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Smartphone size={32} />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Telesonic Mobile App
                </h1>
                {isInstalled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Installed
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Progressive Web App for Field Service Technicians with Offline Capability
              </p>
            </div>
          </div>

          {manualInstall && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
              <div className="w-full max-w-md space-y-3 rounded-2xl bg-card p-5 shadow-2xl">
                <div className="flex items-center gap-2 text-base font-bold">
                  <Smartphone size={18} className="text-primary" />
                  {manualInstall === "ios"
                    ? "Add Telesonic on your iPhone"
                    : "Install Telesonic on this phone"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {manualInstall === "ios"
                    ? "iPhone does not download an app file. Safari adds the icon to your home screen."
                    : "Chrome did not open the install popup. Add the app from the browser menu."}
                </p>
                <ol className="list-decimal space-y-1.5 pl-4 text-sm">
                  {manualInstall === "ios" ? (
                    <>
                      <li>Open this page in Safari, not inside Chrome or other browsers.</li>
                      <li>Tap the Share button.</li>
                      <li>Tap Add to Home Screen, then Add.</li>
                    </>
                  ) : (
                    <>
                      <li>Open this page in Chrome.</li>
                      <li>Tap the three-dot menu at the top right.</li>
                      <li>Tap Install app or Add to Home screen, then Install.</li>
                    </>
                  )}
                </ol>
                <Button className="w-full" onClick={() => setManualInstall(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-5">
            <Button
              onClick={handleDownloadAndInstall}
              disabled={isLaunching}
              size="lg"
              className="w-full h-12 text-sm font-bold shadow-md gap-2 cursor-pointer"
            >
              {isLaunching ? (
                <>
                  <Smartphone size={18} className="animate-spin" />
                  Installing & Launching Mobile App...
                </>
              ) : (
                <>
                  <Download size={18} />
                  {isInstalled ? "Open Mobile Application" : "Download Mobile App"}
                </>
              )}
            </Button>

            <div className="flex items-center justify-between gap-3 text-xs">
              <Button asChild variant="outline" size="sm" className="w-full text-muted-foreground">
                <Link to="/login">
                  <ArrowLeft size={14} className="mr-1.5" />
                  Back to Website Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
