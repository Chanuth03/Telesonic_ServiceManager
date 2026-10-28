import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  Shield,
  Smartphone,
  ArrowRightLeft,
  Database,
  HardDrive,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useSyncManager } from "@/hooks/useSyncManager";
import {
  saveOfflineAuthSession,
  getOfflineAuthSession,
  clearOfflineAuthSession,
} from "@/lib/offline-db";

export type UserRole = string;

export interface UserProfile {
  id: string | number;
  name: string;
  role: UserRole;
  email: string;
  title?: string;
  avatarInitials?: string;
  permissions?: string[];
}

interface RoleContextType {
  role: UserRole;
  user: UserProfile;
  isAuthenticated: boolean;
  authReady: boolean;
  setRole: (role: UserRole) => void;
  setUser: (user: UserProfile) => void;
  loginUser: (user: UserProfile, token: string, rememberMe: boolean) => Promise<void>;
  logoutUser: () => Promise<void>;
  toggleRole: () => void;
}

const ADMIN_PROFILE: UserProfile = {
  id: "USR-ADM-01",
  name: "Nimal (Admin)",
  role: "ADMIN",
  email: "admin@telesonic.lk",
  title: "Service Desk Administrator",
  avatarInitials: "NA",
};

const TECH_PROFILE: UserProfile = {
  id: "TECH-0092",
  name: "Nimal Perera (Field Lead)",
  role: "TECHNICIAN",
  email: "nimal.p@telesonic.lk",
  title: "Field Service Lead Specialist",
  avatarInitials: "NP",
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function getInitialAuthState(isVitest: boolean): {
  user: UserProfile;
  role: UserRole;
  isAuthenticated: boolean;
  authReady: boolean;
} {
  if (typeof window === "undefined") {
    return {
      user: ADMIN_PROFILE,
      role: "ADMIN",
      isAuthenticated: isVitest,
      authReady: isVitest,
    };
  }
  try {
    const sessionUserRaw = sessionStorage.getItem("auth_user");
    const sessionToken = sessionStorage.getItem("auth_token");
    if (sessionUserRaw && sessionToken) {
      const parsed = JSON.parse(sessionUserRaw) as UserProfile;
      if (parsed && parsed.name) {
        return {
          user: parsed,
          role: parsed.role || "ADMIN",
          isAuthenticated: true,
          authReady: true,
        };
      }
    }

    const isRemembered = localStorage.getItem("telesonic_remember_session") === "true";
    const localUserRaw = localStorage.getItem("auth_user");
    const localToken = localStorage.getItem("auth_token");
    if (isRemembered && localUserRaw && localToken) {
      const parsed = JSON.parse(localUserRaw) as UserProfile;
      if (parsed && parsed.name) {
        sessionStorage.setItem("auth_user", localUserRaw);
        sessionStorage.setItem("auth_token", localToken);
        sessionStorage.setItem("mobile_authenticated", "true");
        sessionStorage.setItem("mobile_tech_id", parsed.name);
        return {
          user: parsed,
          role: parsed.role || "ADMIN",
          isAuthenticated: true,
          authReady: true,
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    user: ADMIN_PROFILE,
    role: "ADMIN",
    isAuthenticated: isVitest,
    authReady: isVitest,
  };
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const isVitest = typeof process !== "undefined" && process.env["VITEST"] === "true";
  const initial = getInitialAuthState(isVitest);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initial.user);
  const [role, setRoleState] = useState<UserRole>(initial.role);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initial.isAuthenticated);
  const [authReady, setAuthReady] = useState<boolean>(initial.authReady);

  // Restore session on mount:
  // 1) Active tab session in sessionStorage
  // 2) Persistent "Keep me signed in" session in localStorage (telesonic_remember_session === "true")
  // 3) Offline PWA Dexie.js session in offlineMeta ("saved_auth_session")
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const restoreAuth = async () => {
      try {
        // 1. Check active tab sessionStorage first
        const sessionUserRaw = sessionStorage.getItem("auth_user");
        const sessionToken = sessionStorage.getItem("auth_token");
        if (sessionUserRaw && sessionToken) {
          const parsed = JSON.parse(sessionUserRaw) as UserProfile;
          if (parsed && parsed.name && !cancelled) {
            setCurrentUser(parsed);
            if (parsed.role) setRoleState(parsed.role);
            setIsAuthenticated(true);
            setAuthReady(true);
            window.dispatchEvent(new CustomEvent("telesonic:auth-changed", { detail: parsed }));
            return;
          }
        }

        // 2. Check persistent localStorage if user checked "Keep me signed in"
        const isRemembered = localStorage.getItem("telesonic_remember_session") === "true";
        const localUserRaw = localStorage.getItem("auth_user");
        const localToken = localStorage.getItem("auth_token");

        if (isRemembered && localUserRaw && localToken) {
          const parsed = JSON.parse(localUserRaw) as UserProfile;
          if (parsed && parsed.name && !cancelled) {
            sessionStorage.setItem("auth_user", localUserRaw);
            sessionStorage.setItem("auth_token", localToken);
            sessionStorage.setItem("mobile_authenticated", "true");
            sessionStorage.setItem("mobile_tech_id", parsed.name);
            setCurrentUser(parsed);
            if (parsed.role) setRoleState(parsed.role);
            setIsAuthenticated(true);
            setAuthReady(true);
            window.dispatchEvent(new CustomEvent("telesonic:auth-changed", { detail: parsed }));
            return;
          }
        } else if (!isRemembered) {
          // Clean up any legacy un-remembered localStorage keys so fresh startup goes to Login
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("mobile_tech_id");
        }

        // 3. Check Dexie.js offlineMeta for Mobile PWA offline auto-login
        const dexieSession = await getOfflineAuthSession();
        if (dexieSession && dexieSession.rememberMe && dexieSession.user && !cancelled) {
          const parsed = dexieSession.user as unknown as UserProfile;
          if (parsed && parsed.name) {
            const userJson = JSON.stringify(parsed);
            localStorage.setItem("telesonic_remember_session", "true");
            localStorage.setItem("auth_user", userJson);
            localStorage.setItem("auth_token", dexieSession.token);
            sessionStorage.setItem("auth_user", userJson);
            sessionStorage.setItem("auth_token", dexieSession.token);
            sessionStorage.setItem("mobile_authenticated", "true");
            sessionStorage.setItem("mobile_tech_id", parsed.name);
            setCurrentUser(parsed);
            if (parsed.role) setRoleState(parsed.role);
            setIsAuthenticated(true);
            setAuthReady(true);
            window.dispatchEvent(new CustomEvent("telesonic:auth-changed", { detail: parsed }));
            return;
          }
        }
      } catch {
        // Ignore parse errors
      }

      if (!cancelled) {
        setIsAuthenticated(isVitest);
        setAuthReady(true);
      }
    };

    void restoreAuth();
    return () => {
      cancelled = true;
    };
  }, [isVitest]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("app_user_role", newRole);
      if (localStorage.getItem("telesonic_remember_session") === "true") {
        localStorage.setItem("app_user_role", newRole);
      }
    }
  };

  const setUser = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      const userJson = JSON.stringify(newUser);
      sessionStorage.setItem("auth_user", userJson);
      sessionStorage.setItem("mobile_authenticated", "true");
      sessionStorage.setItem("mobile_tech_id", newUser.name);
      if (newUser.role) {
        sessionStorage.setItem("app_user_role", newUser.role);
        setRoleState(newUser.role);
      }
      if (localStorage.getItem("telesonic_remember_session") === "true") {
        localStorage.setItem("auth_user", userJson);
        localStorage.setItem("mobile_tech_id", newUser.name);
        if (newUser.role) {
          localStorage.setItem("app_user_role", newUser.role);
        }
      }
      window.dispatchEvent(new CustomEvent("telesonic:auth-changed", { detail: newUser }));
    }
  };

  const loginUser = async (newUser: UserProfile, token: string, rememberMe: boolean) => {
    setCurrentUser(newUser);
    if (newUser.role) {
      setRoleState(newUser.role);
    }
    setIsAuthenticated(true);
    setAuthReady(true);

    if (typeof window !== "undefined") {
      const userJson = JSON.stringify(newUser);
      sessionStorage.setItem("auth_user", userJson);
      sessionStorage.setItem("auth_token", token);
      sessionStorage.setItem("mobile_authenticated", "true");
      sessionStorage.setItem("mobile_tech_id", newUser.name);
      if (newUser.role) {
        sessionStorage.setItem("app_user_role", newUser.role);
      }

      if (rememberMe) {
        localStorage.setItem("telesonic_remember_session", "true");
        localStorage.setItem("auth_user", userJson);
        localStorage.setItem("auth_token", token);
        localStorage.setItem("mobile_tech_id", newUser.name);
        if (newUser.role) {
          localStorage.setItem("app_user_role", newUser.role);
        }
        await saveOfflineAuthSession({
          token,
          user: newUser as unknown as Record<string, unknown>,
          rememberMe: true,
          savedAt: new Date().toISOString(),
        });
      } else {
        localStorage.removeItem("telesonic_remember_session");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("mobile_tech_id");
        localStorage.removeItem("app_user_role");
        await clearOfflineAuthSession();
      }

      window.dispatchEvent(new CustomEvent("telesonic:auth-changed", { detail: newUser }));
    }
  };

  const logoutUser = async () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("mobile_authenticated");
      sessionStorage.removeItem("mobile_tech_id");
      sessionStorage.removeItem("app_user_role");
      localStorage.removeItem("telesonic_remember_session");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("mobile_tech_id");
      localStorage.removeItem("app_user_role");
      await clearOfflineAuthSession();
      window.dispatchEvent(new CustomEvent("telesonic:auth-changed", { detail: null }));
    }
  };

  const toggleRole = () => {
    const nextRole = role === "ADMIN" ? "TECHNICIAN" : "ADMIN";
    setRole(nextRole);
  };

  // Sync user state if updated in localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = () => {
      const savedUser =
        sessionStorage.getItem("auth_user") ||
        (localStorage.getItem("telesonic_remember_session") === "true"
          ? localStorage.getItem("auth_user")
          : null);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          if (parsed.role) setRoleState(parsed.role);
          setIsAuthenticated(true);
        } catch {}
      } else if (!isVitest) {
        setIsAuthenticated(false);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isVitest]);

  const user = currentUser;

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        isAuthenticated,
        authReady,
        setRole,
        setUser,
        loginUser,
        logoutUser,
        toggleRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

/**
 * Interactive Role Switcher Bar with database indicators
 */
export function RoleSwitcherBar() {
  const { role, setRole, toggleRole } = useRole();
  const { isOnline, pendingCount, syncState, triggerSync } = useSyncManager();

  return (
    <div className="bg-gradient-to-r from-card via-muted/40 to-card border-b border-border/70 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
          <span>Layout & Role Mode:</span>
        </span>

        {/* Role Toggle Button Group */}
        <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setRole("ADMIN")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              role === "ADMIN"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ADMIN (Desktop)</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("TECHNICIAN")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              role === "TECHNICIAN"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>TECHNICIAN (Mobile)</span>
          </button>
        </div>
      </div>

      {/* Backend & Offline Status Indicators */}
      <div className="flex items-center gap-3">
        {role === "ADMIN" ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Backend:</span>
            <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              PostgreSQL (via Prisma) Direct
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">Storage:</span>
              <span className="font-mono font-bold text-foreground bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                Dexie.js Offline PWA
              </span>
            </div>

            {pendingCount > 0 ? (
              <button
                type="button"
                onClick={() => triggerSync("role_bar_button")}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                title="Unsynced records waiting to be pushed to PostgreSQL"
              >
                <span>{pendingCount} pending sync</span>
                {syncState === "syncing" && <span className="animate-spin text-xs">↻</span>}
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span>All Synced</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
