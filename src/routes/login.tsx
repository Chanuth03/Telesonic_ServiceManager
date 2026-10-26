import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Headset, Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone, Download } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Servio ITSM" },
      { name: "description", content: "Sign in to the Servio ITSM service desk." },
      { property: "og:title", content: "Sign in — Servio ITSM" },
      { property: "og:description", content: "Sign in to the Servio ITSM service desk." },
    ],
  }),
  component: LoginPage,
});

import { useRole } from "@/context/RoleContext";
import { apiFetch } from "@/lib/api-client";

function LoginPage() {
  const navigate = useNavigate();
  const { setRole, setUser } = useRole();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("admin@telesonic.lk");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownloadApp = () => {
    // If accessed on a mobile phone or directly requested, redirect to the mobile app installation page
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );

    if (isMobileDevice) {
      // Direct mobile device redirection to mobile installation / mobile workspace
      navigate({ to: "/mobile-apk-download" });
    } else {
      // Desktop or default redirect
      navigate({ to: "/mobile-apk-download" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
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
        setLoading(false);
        return;
      }

      // Store JWT Token in localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      // Update Active User & Role in Context and localStorage
      if (data.user) {
        setUser(data.user);
      } else if (data.user?.role) {
        setRole(data.user.role);
      }

      navigate({ to: "/" });
    } catch {
      setError("Something went wrong on the server");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleType: "ADMIN" | "TECHNICIAN") => {
    if (roleType === "ADMIN") {
      setEmail("admin@telesonic.lk");
      setPassword("admin123");
    } else {
      setEmail("tech@telesonic.lk");
      setPassword("tech123");
    }
    setError("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Headset size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Servio<span className="font-medium text-sidebar-muted"> ITSM</span>
          </span>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight">
            Every ticket, job and asset — one service desk.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-sidebar-muted">
            Designed for IT operations teams who need clarity, speed and compliance across
            departments.
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-3 gap-4 border-t border-sidebar-border pt-6">
            <div>
              <div className="text-2xl font-bold tracking-tight text-sidebar-foreground">99.8%</div>
              <div className="text-xs text-sidebar-muted">SLA compliance</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-sidebar-foreground">12m</div>
              <div className="text-xs text-sidebar-muted">Mean resolution</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-sidebar-foreground">4.9★</div>
              <div className="text-xs text-sidebar-muted">User satisfaction</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-sidebar-muted">
          <span>© 2026 Telesonic Service Manager</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadApp}
              className="inline-flex items-center gap-1.5 font-medium text-sidebar-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Smartphone size={13} />
              Download Mobile App
            </button>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Headset size={18} />
              </span>
              <span className="text-lg font-bold tracking-tight">Servio ITSM</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadApp}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Smartphone size={13} />
              Get App
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your service desk account.
          </p>

          {/* Prominent Download Mobile App Button */}
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Smartphone size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  Get the mobile app
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadApp}
              className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Download size={13} />
              Download Mobile App
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold">Work email</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  className="input-field pl-9"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold">Password</label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type={showPw ? "text" : "password"}
                  className="input-field pl-9 pr-10"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-destructive-soft px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border accent-primary" /> Keep me
              signed in
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating with Bcrypt & JWT...</span>
              ) : (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need an account? Contact your service desk administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
