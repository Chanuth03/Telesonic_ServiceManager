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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import { apiFetch } from "@/lib/api-client";
import { refreshMobileJobsFromServer } from "@/lib/mobile-offline-bridge";

function hasSavedBrowserSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem("auth_user") && sessionStorage.getItem("auth_token")) {
      return true;
    }
    if (
      localStorage.getItem("telesonic_remember_session") === "true" &&
      localStorage.getItem("auth_user") &&
      localStorage.getItem("auth_token")
    ) {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export const Route = createFileRoute("/mobile/login")({
  beforeLoad: () => {
    if (hasSavedBrowserSession()) {
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

  // If the user previously saved login ("Keep me signed in") on this device,
  // skip the login prompt and go directly to the Mobile PWA home screen!
  useEffect(() => {
    if (authReady && isAuthenticated) {
      navigate({ to: "/mobile", replace: true });
    }
  }, [authReady, isAuthenticated, navigate]);

  if (!authReady || isAuthenticated || hasSavedBrowserSession()) {
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

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Invalid Email or Password");
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        await loginUser(data.user, data.token || "session-token", true);
      }

      await refreshMobileJobsFromServer();
      navigate({ to: "/mobile", replace: true });
    } catch {
      setError("Something went wrong on the server");
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

            {/* Submit Button */}
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
        </div>
      </div>
    </div>
  );
}
