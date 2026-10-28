import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Headset, Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone, Download } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Service Manager" },
      { name: "description", content: "Sign in to the Service Manager service desk." },
      { property: "og:title", content: "Sign in — Service Manager" },
      { property: "og:description", content: "Sign in to the Service Manager service desk." },
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownloadApp = () => {
    navigate({ to: "/mobile-apk-download" });
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Headset size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight">Service Manager</span>
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
                placeholder="Email"
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
              <span>Authenticating...</span>
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
  );
}
