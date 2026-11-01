import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  AlertTriangle,
  ShoppingBag,
  Bug,
  GitPullRequestArrow,
  HardDrive,
  BookOpen,
  ClipboardList,
  MonitorCog,
  Trophy,
  ArrowUpRight,
  Database,
  Headphones,
  ArrowRightLeft,
  CheckCircle2,
  ChevronRight,
  Bell,
  ScanLine,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole, UserProfile } from "@/context/RoleContext";
import { MobileShell } from "@/components/mobile/MobileShell";
import {
  getMobileJobs,
  getMobileNotifications,
  subscribeMobileJobs,
  getActiveTechnicianName,
} from "@/lib/mobile-data";
import { PrismaJobRecord } from "@/lib/prisma";
import { apiFetch } from "@/lib/api-client";

interface DbStatsType {
  database?: string;
  status?: string;
  datasource?: string;
  databaseUrl?: string;
  counts?: {
    jobs?: number;
    syncLogs?: number;
    serviceRequests?: number;
  };
}

// Mapping between desktop module paths and permission codes
const modulePermissionMap: Record<string, string> = {
  "/transactions": "TRANSACTIONS",
  "/masters": "MASTERS",
  "/service-requests": "SERVICE_REQUESTS",
  "/dashboard": "DASHBOARD",
  "/incidents": "INCIDENTS",
  "/jobs": "JOBS",
  "/catalog": "CATALOG",
  "/problems": "PROBLEMS",
  "/changes": "CHANGES",
  "/assets": "ASSETS",
  "/knowledge": "KNOWLEDGE",
  "/equipment": "EQUIPMENT",
  "/incentive": "INCENTIVE",
};

const desktopModules = [
  {
    to: "/transactions",
    label: "Transactions",
    icon: ArrowRightLeft,
    tone: "bg-primary-soft text-primary",
  },
  { to: "/masters", label: "Masters", icon: Database, tone: "bg-primary-soft text-primary" },
  {
    to: "/service-requests",
    label: "Service Requests",
    icon: Headphones,
    tone: "bg-info-soft text-info",
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    tone: "bg-primary-soft text-primary",
  },
  {
    to: "/incidents",
    label: "Incidents",
    icon: AlertTriangle,
    tone: "bg-destructive-soft text-destructive",
  },
  { to: "/jobs", label: "Jobs", icon: ClipboardList, tone: "bg-info-soft text-info" },
  {
    to: "/catalog",
    label: "Service Catalog",
    icon: ShoppingBag,
    tone: "bg-success-soft text-success",
  },
  { to: "/problems", label: "Problem", icon: Bug, tone: "bg-warning-soft text-warning" },
  {
    to: "/changes",
    label: "Change",
    icon: GitPullRequestArrow,
    tone: "bg-primary-soft text-primary",
  },
  { to: "/assets", label: "Assets", icon: HardDrive, tone: "bg-info-soft text-info" },
  {
    to: "/knowledge",
    label: "Knowledge Base",
    icon: BookOpen,
    tone: "bg-success-soft text-success",
  },
  {
    to: "/equipment",
    label: "Equipment Card",
    icon: MonitorCog,
    tone: "bg-warning-soft text-warning",
  },
  { to: "/incentive", label: "Incentive", icon: Trophy, tone: "bg-success-soft text-success" },
] as const;

export function RoleLayoutSwitcher() {
  const { role, user } = useRole();

  if (role === "TECHNICIAN") {
    return <TechnicianMobileLayout />;
  }

  return <AdminDesktopLayout user={user} />;
}

/**
 * -------------------------------------------------------------
 * 1. ADMIN DESKTOP LAYOUT ("Your workspace" UI)
 * Fetches data directly from PostgreSQL API endpoints (/api/jobs, /api/stats)
 * -------------------------------------------------------------
 */
function AdminDesktopLayout({ user }: { user: UserProfile }) {
  const [pgJobs, setPgJobs] = useState<PrismaJobRecord[]>([]);
  const [dbStats, setDbStats] = useState<DbStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Filter desktop tiles according to permissions assigned to the user's role
  const userPerms =
    user.permissions && user.permissions.length > 0
      ? user.permissions.map((p) => p.toUpperCase().trim())
      : user.role.toUpperCase() === "ADMIN"
        ? ["ALL"]
        : [];

  const hasAll = userPerms.includes("ALL");

  const visibleModules = desktopModules.filter((mod) => {
    if (hasAll) return true;
    const requiredPerm = modulePermissionMap[mod.to];
    if (!requiredPerm) return true;
    return userPerms.includes(requiredPerm);
  });

  const fetchPostgresData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, statsRes] = await Promise.all([
        apiFetch("/api/jobs"),
        apiFetch("/api/stats"),
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setPgJobs(jobsData.jobs || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setDbStats(statsData);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("[Admin Desktop] Failed to fetch from PostgreSQL API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostgresData();
  }, []);

  return (
    <div className="py-4 sm:py-8 space-y-8">
      {/* Workspace Header with PostgreSQL Status */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Welcome, {user.name}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Your workspace</h1>
        </div>
      </div>

      {/* Service Desk Module Launcher Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Modules</h2>
        <nav aria-label="Service desk modules" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {visibleModules.map(({ to, label, icon: Icon, tone }) => (
            <Button
              key={to}
              asChild
              variant="ghost"
              className="group h-auto min-h-40 flex-col items-start justify-between gap-6 whitespace-normal rounded-lg border bg-card p-5 text-card-foreground shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-md motion-reduce:transform-none sm:min-h-48 sm:p-6"
            >
              <Link to={to}>
                <span className="flex w-full items-start justify-between gap-2">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${tone}`}>
                    <Icon className="size-6" />
                  </span>
                  <ArrowUpRight className="text-muted-foreground transition-colors group-hover:text-primary" />
                </span>
                <span className="text-base font-semibold sm:text-lg">{label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/**
 * -------------------------------------------------------------
 * 2. TECHNICIAN MOBILE LAYOUT
 * Redirects to /mobile and renders the exact Mobile Overview UI
 * -------------------------------------------------------------
 */
function TechnicianMobileLayout() {
  const { user, logoutUser } = useRole();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(() => getMobileJobs());
  const [notifications, setNotifications] = useState(() => getMobileNotifications());

  useEffect(() => {
    navigate({ to: "/mobile", replace: true });
  }, [navigate]);

  useEffect(() => {
    const syncState = () => {
      setJobs(getMobileJobs());
      setNotifications(getMobileNotifications());
    };
    syncState();
    const unsub = subscribeMobileJobs(syncState);
    window.addEventListener("telesonic:auth-changed", syncState);
    window.addEventListener("telesonic:dexie-update", syncState);
    window.addEventListener("telesonic:sync-complete", syncState);
    return () => {
      unsub();
      window.removeEventListener("telesonic:auth-changed", syncState);
      window.removeEventListener("telesonic:dexie-update", syncState);
      window.removeEventListener("telesonic:sync-complete", syncState);
    };
  }, [user?.name]);

  const activeTechName = user?.name || getActiveTechnicianName();

  const assignedJobs = jobs.filter((j) => j.status === "Assigned" || j.status === "Accepted");
  const completedJobs = jobs.filter((j) => j.status === "Completed");
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <MobileShell>
      <div className="space-y-3.5 max-w-full overflow-hidden pb-4">
        {/* Mobile Welcome Heading */}
        <div className="px-0.5 pt-0.5 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground truncate">Welcome, {activeTechName}</h2>
          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              navigate({ to: "/mobile/login", replace: true });
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
            title="Sign out of Mobile App"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>

        {/* Technician Workflow Quick Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/mobile/jobs"
            className="rounded-xl border bg-card p-3.5 shadow-2xs hover:border-primary/50 transition-colors block space-y-1"
          >
            <div className="flex items-center gap-2 text-primary">
              <ClipboardList size={16} />
              <span className="text-xs font-semibold">Assigned Jobs</span>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">{assignedJobs.length}</p>
            <p className="text-[10px] text-muted-foreground">Work orders awaiting site action</p>
          </Link>

          <Link
            to="/mobile/jobs"
            className="rounded-xl border bg-card p-3.5 shadow-2xs hover:border-primary/50 transition-colors block space-y-1"
          >
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 size={16} />
              <span className="text-xs font-semibold">Completed</span>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">{completedJobs.length}</p>
            <p className="text-[10px] text-muted-foreground">Work completion slips signed</p>
          </Link>
        </div>

        {/* Additional Option 01 Workflow Hub Tiles */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Field Technician Modules
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {/* Stock Count Scan */}
            <Link
              to="/mobile/stock-count"
              className="p-3 rounded-xl border bg-card hover:border-primary/50 transition-colors flex items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ScanLine size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Van Stock Count Scan
                    </h4>
                    <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded border">
                      O1-SCR-MOB-12
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Audit mobile van inventory & barcode check
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
              />
            </Link>

            {/* Notifications Inbox */}
            <Link
              to="/mobile/notifications"
              className="p-3 rounded-xl border bg-card hover:border-primary/50 transition-colors flex items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors relative">
                  <Bell size={18} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Notifications Inbox
                    </h4>
                    <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded border">
                      O1-SCR-MOB-14
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {unreadNotifications > 0
                      ? `${unreadNotifications} unread dispatch alerts`
                      : "Dispatch notices & alerts"}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
              />
            </Link>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
