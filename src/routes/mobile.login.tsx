import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Smartphone,
  Headset,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mobile/login")({
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

import { useRole } from "@/context/RoleContext";
import { apiFetch } from "@/lib/api-client";

function MobileLoginPage() {
  const navigate = useNavigate();
  const { setRole, setUser } = useRole();
  const [email, setEmail] = useState("admin@telesonic.lk");
  const [password, setPassword] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      if (data.user) {
        setUser(data.user);
      } else if (data.user?.role) {
        setRole(data.user.role);
      }

      sessionStorage.setItem("mobile_authenticated", "true");
      sessionStorage.setItem("mobile_tech_id", data.user?.name || email.trim());

      navigate({ to: "/mobile" });
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
              <p className="text-[11px] opacity-80">Option 01 · Mobile Field Console</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-primary-foreground/20 px-2 py-0.5 rounded text-primary-foreground font-semibold">
            MOB-01
          </span>
        </div>

        {/* Screen Title & Body */}
        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Welcome back</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign in with the same email and password as the website.
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
                placeholder="you@company.com"
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
                <button type="button" className="text-[11px] font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full rounded-lg border bg-background pl-3 pr-9 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  placeholder="••••••••"
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

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border accent-primary" />
              Keep me signed in
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
                  Authenticating with Bcrypt & JWT...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          {/* Quick Flow Navigation Links */}
          <div className="border-t pt-4 space-y-2 text-center text-xs">
            <p className="text-muted-foreground text-[11px]">Need the app on this phone?</p>
            <div className="flex items-center justify-center gap-3 text-xs font-medium">
              <Link
                to="/mobile-apk-download"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Download size={13} />
                Download Mobile App
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/login" className="text-muted-foreground hover:underline">
                Website Login
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-muted/50 px-4 py-2.5 border-t text-[10px] text-center text-muted-foreground flex items-center justify-between">
          <span>O1-SCR-MOB-01 Mobile Sign In</span>
          <span className="font-mono">Telesonic v2.4.0</span>
        </div>
      </div>
    </div>
  );
}
