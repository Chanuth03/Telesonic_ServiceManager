import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Smartphone,
  Download,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Server,
  Cpu,
  HardDrive,
  ChevronRight,
  Radio,
} from "lucide-react";
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
      { title: "Telesonic Mobile App Download — Servio ITSM" },
      {
        name: "description",
        content:
          "Install the Telesonic Service Manager mobile app on your phone home screen.",
      },
      { property: "og:title", content: "Telesonic Mobile App Download — Servio ITSM" },
      {
        property: "og:description",
        content:
          "Install the Telesonic Service Manager mobile app on your phone home screen.",
      },
    ],
  }),
  component: MobileApkDownloadPage,
});

function MobileApkDownloadPage() {
  const navigate = useNavigate();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [manualInstall, setManualInstall] = useState<"ios" | "android" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setInstalled(isStandalonePwa());
  }, []);

  const handleDownload = async () => {
    setMessage(null);
    setManualInstall(null);

    if (isStandalonePwa()) {
      navigate({ to: "/mobile/login" });
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

    setIsInstalling(true);
    try {
      const ready = await waitForInstallPrompt(4000);
      if (!ready) {
        setManualInstall("android");
        return;
      }
      const outcome = await promptPwaInstall();
      if (outcome === "accepted") {
        setInstalled(true);
        navigate({ to: "/mobile/login" });
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
      setIsInstalling(false);
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

          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Radio size={12} className="animate-pulse" />
            Field Terminal Preview
          </span>
        </div>

        {/* Main APK Download Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Top Decorative Accent */}
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
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground border">
                  v2.4.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Installs on your phone home screen. Opens the field service app without an app store.
              </p>
              <p className="text-[11px] font-mono text-primary flex items-center gap-1 pt-0.5">
                <ShieldCheck size={13} />
                com.telesonic.servicemanager.mobile
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-primary">
              <Info size={16} className="shrink-0" />
              <span>Install on this phone</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Tap Download. On Android, confirm Install in the browser prompt and the app is added
              to your home screen. On iPhone, Safari will show Add to Home Screen.
            </p>
          </div>

          {/* Technical Specifications Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-muted/40 p-3 border space-y-1">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <HardDrive size={12} /> Installs as
              </span>
              <p className="font-bold text-foreground font-mono">Home screen app</p>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 border space-y-1">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Cpu size={12} /> Target OS
              </span>
              <p className="font-bold text-foreground">Android and iPhone</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl bg-muted/40 p-3 border space-y-1">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Server size={12} /> Integration
              </span>
              <p className="font-bold text-foreground">Option 01 / SAP B1</p>
            </div>
          </div>

          {/* Included Option 01 Mobile Modules Checklist */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Included Mobile Modules (Option 01)
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground">
              {[
                "Mobile Job List (O1-SCR-MOB-02)",
                "Job Detail (O1-SCR-MOB-03)",
                "Travel & Site Check-in (O1-SCR-MOB-04)",
                "Parts Used / Returned (O1-SCR-MOB-06)",
                "Labour & Time Capture (O1-SCR-MOB-07)",
                "Site Photo Capture (O1-SCR-MOB-08)",
                "Digital Signature (O1-SCR-MOB-09)",
                "Site Inspection (O1-SCR-MOB-11)",
                "Van Stock Count Scan (O1-SCR-MOB-12)",
                "Hold Request (O1-SCR-MOB-13)",
                "Notifications Inbox (O1-SCR-MOB-14)",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success shrink-0" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {manualInstall && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
              <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl space-y-3">
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
                      <li>Open this page in Safari, not inside WhatsApp or Chrome.</li>
                      <li>Tap the Share button.</li>
                      <li>Tap Add to Home Screen, then Add.</li>
                    </>
                  ) : (
                    <>
                      <li>Open this page in Chrome, not inside WhatsApp.</li>
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
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 border-t pt-5">
            <Button
              onClick={handleDownload}
              disabled={isInstalling}
              size="lg"
              className="w-full h-12 text-sm font-bold shadow-md gap-2"
            >
              {isInstalling ? (
                <>
                  <Smartphone size={18} className="animate-spin" />
                  Waiting for install confirmation...
                </>
              ) : installed ? (
                <>
                  <CheckCircle2 size={18} />
                  Open installed app
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Mobile App
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

              <Button asChild variant="ghost" size="sm" className="w-full text-primary">
                <Link to="/mobile/login">
                  Direct Mobile Login
                  <ChevronRight size={14} className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground">
          © 2026 Telesonic Service Manager · Option 01 Field Engineering Frontend
        </p>
      </div>
    </div>
  );
}
