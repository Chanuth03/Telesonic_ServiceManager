import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Smartphone,
  Headset,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  DownloadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import { apiFetch } from "@/lib/api-client";
import { readStoredTechnicianSession } from "@/lib/app-initializer";
import { isOfflineForTransactions } from "@/lib/offline-db";
import { refreshMobileJobsFromServer } from "@/lib/mobile-offline-bridge";
import {
  runOfflineBootstrap,
  subscribeBootstrapProgress,
  type BootstrapProgress,
} from "@/lib/offline-bootstrap";
import { syncManager } from "@/lib/sync-manager";

function hasOfflineBypassSession(): boolean {
  if (typeof window === "undefined") return false;
  if (!isOfflineForTransactions()) return false;
  return readStoredTechnicianSession() != null;
}

export const Route = createFileRoute("/mobile/login")({
  beforeLoad: () => {
    if (hasOfflineBypassSession()) {
      throw redirect({ to: "/mobile", replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Mobile Sign In (O1-SCR-MOB-01) — Telesonic Mobile" },
      {
        name: "description",
        content: "Sign in to Telesonic Service Manager Android Mobile Application.",
      },
      { property: "og:title", content: "Mobile Sign In — Telesonic Mobile" },
      {
        property: "og:description",
        content: "Sign in to Telesonic Service Manager Android Mobile Application.",
      },
    ],
  }),
  component: MobileLoginPage,
});

function MobileLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authReady, loginUser } = useRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bootstrap, setBootstrap] = useState<BootstrapProgress | null>(null);
  const [holdForBootstrap, setHoldForBootstrap] = useState(false);

  useEffect(() => {
    return subscribeBootstrapProgress((progress) => {
      if (progress.phase !== "idle") setBootstrap(progress);
    });
  }, []);

  const isBootstrapping =
    holdForBootstrap ||
    (!!bootstrap &&
      !bootstrap.offlineReady &&
      bootstrap.phase !== "idle" &&
      bootstrap.phase !== "error" &&
      bootstrap.phase !== "ready");

  // If the user previously saved login ("Keep me signed in") on this device,
  // skip the login prompt and go directly to the Mobile PWA home screen!
  useEffect(() => {
    if (authReady && isAuthenticated && !isBootstrapping && !holdForBootstrap) {
      navigate({ to: "/mobile", replace: true });
    }
  }, [authReady, isAuthenticated, navigate, isBootstrapping, holdForBootstrap]);

  if (!authReady && !isBootstrapping) {
    return null;
  }
  if (isAuthenticated && !isBootstrapping) {
    return null;
  }

  const handleMobileSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    if (isOfflineForTransactions()) {
      setError(
        "You are offline. First sign-in needs internet. After that, Keep me signed in works in Airplane Mode.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiFetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        },
        { networkOnly: true },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Invalid Email or Password");
        setIsSubmitting(false);
        return;
      }

      const token = data.token || "session-token";

      // Hold navigation while mandatory offline bootstrap runs.
      setHoldForBootstrap(true);
      try {
        const result = await runOfflineBootstrap({
          user: data.user,
          token,
        });
        if (!result.offlineReady) {
          setError(result.error || "Failed to download offline data. Stay online and try again.");
          setHoldForBootstrap(false);
          setIsSubmitting(false);
          return;
        }
      } catch (bootErr) {
        setError(
          bootErr instanceof Error
            ? bootErr.message
            : "Failed to download offline data. Stay online and try again.",
        );
        setHoldForBootstrap(false);
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        await loginUser(data.user, token, rememberMe);
      }

      await refreshMobileJobsFromServer();
      void syncManager.triggerSync("post_login");
      setHoldForBootstrap(false);
      navigate({ to: "/mobile", replace: true });
    } catch {
      setHoldForBootstrap(false);
      setError(
        navigator.onLine
          ? "Something went wrong on the server"
          : "You are offline. Connect once to sign in, then Airplane Mode will keep the app working.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-6 px-3 flex items-center justify-center">
      {/* Phone container frame for mobile native preview */}
      <div className="w-full max-w-md border bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Mobile Header Bar */}
        <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground/15 text-primary-foreground">
              <Headset size={20} />
            </span>
            <div>
              <h1 className="text-sm font-bold leading-tight">Telesonic Service Manager</h1>
            </div>
          </div>
        </div>

        {/* Screen Title & Body */}
        <div className="p-5 space-y-5">
          {isBootstrapping ? (
            <div className="space-y-4 py-6">
              <div className="flex items-center gap-2">
                <DownloadCloud size={18} className="text-primary animate-pulse" />
                <h2 className="text-lg font-bold text-foreground">Preparing offline mode</h2>
              </div>
              <p className="text-xs text-muted-foreground">{bootstrap?.message}</p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${bootstrap?.percent || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Do not close the app until the initial data download finishes. Offline readiness is
                not claimed until this completes.
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold text-foreground">Welcome back</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sign in with your email and password.
                </p>
              </div>

              <form onSubmit={handleMobileSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Mail size={13} className="text-muted-foreground" /> Work email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Lock size={13} className="text-muted-foreground" /> Password
                    </label>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-lg border bg-background pl-3 pr-9 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      aria-label="Toggle password visibility"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive-soft p-2.5 text-xs font-medium text-destructive flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border accent-primary cursor-pointer"
                  />
                  Keep me signed in (Save Login on this device)
                </label>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-xs font-bold gap-2 shadow-xs mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Smartphone size={16} className="animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign in to Mobile App
                      <ArrowRight size={15} />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
