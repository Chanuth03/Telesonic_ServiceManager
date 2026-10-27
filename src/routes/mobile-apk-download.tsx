import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Smartphone, Download, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Store deferred install prompt globally
let deferredInstallPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
}

function MobileApkDownloadPage() {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone mode (already installed as PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    if (deferredInstallPrompt) {
      setCanInstallPWA(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      setCanInstallPWA(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleDownloadAndInstall = async () => {
    setIsLaunching(true);

    // 1. If native PWA install prompt is available, trigger it
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        deferredInstallPrompt = null;
        setCanInstallPWA(false);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    }

    // 2. Direct to the shared universal Login screen
    setTimeout(() => {
      navigate({ to: "/login" });
    }, 800);
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-5">
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

          {/* Action Buttons */}
          <div className="space-y-3 border-t pt-5">
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
                  {isInstalled ? "Open Mobile Application" : "Download & Install Mobile App"}
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
