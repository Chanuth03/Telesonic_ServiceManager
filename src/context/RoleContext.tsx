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

export type UserRole = "ADMIN" | "TECHNICIAN";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  title: string;
  avatarInitials: string;
}

interface RoleContextType {
  role: UserRole;
  user: UserProfile;
  setRole: (role: UserRole) => void;
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

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_user_role");
      if (saved === "ADMIN" || saved === "TECHNICIAN") {
        return saved;
      }
    }
    return "ADMIN";
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_user_role", newRole);
    }
  };

  const toggleRole = () => {
    const nextRole = role === "ADMIN" ? "TECHNICIAN" : "ADMIN";
    setRole(nextRole);
  };

  const user = role === "ADMIN" ? ADMIN_PROFILE : TECH_PROFILE;

  return (
    <RoleContext.Provider value={{ role, user, setRole, toggleRole }}>
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
