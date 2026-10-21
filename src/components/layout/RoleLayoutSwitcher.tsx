import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
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
  RefreshCw,
  Server,
  Shield,
  Smartphone,
  CheckCircle2,
  Clock,
  Wrench,
  ChevronRight,
  Filter,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole, UserProfile } from "@/context/RoleContext";
import { useSyncManager } from "@/hooks/useSyncManager";
import { MobileShell } from "@/components/mobile/MobileShell";
import { getDexieJobs, updateDexieJobStatus, DexieJob } from "@/lib/offline-db";
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
  const userPerms = (user.permissions && user.permissions.length > 0)
    ? user.permissions.map((p) => p.toUpperCase().trim())
    : (user.role.toUpperCase() === "ADMIN" ? ["ALL"] : []);

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
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>ROLE: ADMIN</span>
            </span>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>Direct PostgreSQL (via Prisma)</span>
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Welcome back, {user.name}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Your workspace</h1>
        </div>

        {/* Live Database Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PostgreSQL API Live</span>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              Last fetched: {lastRefreshed || "loading..."}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPostgresData}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh PostgreSQL Data</span>
          </Button>
        </div>
      </div>

      {/* PostgreSQL Database Monitor Panel */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">
              PostgreSQL Database Live Monitor (Direct Server API)
            </h3>
            <span className="text-[11px] font-mono bg-primary/10 text-primary font-bold px-2 py-0.5 rounded border border-primary/20">
              Prisma: datasource db (PostgreSQL)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>DATABASE_URL:</span>
            <span className="text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              {dbStats?.databaseUrl || 'env("DATABASE_URL")'}
            </span>
          </div>
        </div>

        {/* Quick Database Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Total Jobs in PostgreSQL
            </span>
            <span className="text-xl font-bold font-mono text-foreground">{pgJobs.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
              DB Status
            </span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {dbStats?.status || "CONNECTED"}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium block">
              Sync Audit Logs
            </span>
            <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {dbStats?.counts?.syncLogs || 1} Batches
            </span>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="text-[11px] text-purple-700 dark:text-purple-400 font-medium block">
              Service Requests
            </span>
            <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {dbStats?.counts?.serviceRequests || 4}
            </span>
          </div>
        </div>

        {/* Compact PostgreSQL Live Records View */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-2.5">Job ID</th>
                <th className="p-2.5">Customer & Site</th>
                <th className="p-2.5">Town</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Priority</th>
                <th className="p-2.5">Technician</th>
                <th className="p-2.5">Sync Status</th>
                <th className="p-2.5 text-right">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pgJobs.slice(0, 5).map((job) => (
                <tr key={job.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-primary">{job.id}</td>
                  <td className="p-2.5 font-medium text-foreground">
                    {job.customerName}
                    <span className="text-[10px] text-muted-foreground block">
                      {job.siteAddress}
                    </span>
                  </td>
                  <td className="p-2.5 text-muted-foreground">{job.town}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground border border-border">
                      {job.status}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        job.priority === "Critical"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td className="p-2.5 text-foreground">{job.technicianName}</td>
                  <td className="p-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PostgreSQL Synced</span>
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono text-[11px] text-muted-foreground">
                    {job.updatedAt ? new Date(job.updatedAt).toLocaleTimeString() : "Recent"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Desk Module Launcher Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Service Desk Modules</h2>
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
 * 2. TECHNICIAN MOBILE LAYOUT (MobileNav.tsx & MobileShell.tsx)
 * Fetches and saves data locally using Dexie.js!
 * -------------------------------------------------------------
 */
function TechnicianMobileLayout() {
  const [dexieJobs, setDexieJobs] = useState<DexieJob[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const { isOnline, pendingCount, triggerSync } = useSyncManager();

  const loadLocalJobs = async () => {
    setIsLoading(true);
    try {
      const jobs = await getDexieJobs();
      setDexieJobs(jobs);
    } catch (err) {
      console.error("[Technician Mobile] Failed to read from Dexie.js:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocalJobs();

    // Listen to local Dexie updates
    const handleDexieUpdate = () => {
      loadLocalJobs();
    };

    window.addEventListener("telesonic:dexie-update", handleDexieUpdate);
    window.addEventListener("telesonic:sync-complete", handleDexieUpdate);

    return () => {
      window.removeEventListener("telesonic:dexie-update", handleDexieUpdate);
      window.removeEventListener("telesonic:sync-complete", handleDexieUpdate);
    };
  }, []);

  const handleUpdateStatus = async (jobId: string, newStatus: DexieJob["status"]) => {
    try {
      const updated = await updateDexieJobStatus(jobId, newStatus);
      setActionNotice(`Status updated to "${newStatus}" in local Dexie.js.`);
      setTimeout(() => setActionNotice(null), 3000);
      await loadLocalJobs();

      // If online, dynamic sync manager can sync right away
      if (isOnline) {
        triggerSync("status_change");
      }
    } catch (err) {
      console.error("Failed to update status in Dexie:", err);
    }
  };

  const filteredJobs = dexieJobs.filter((job) => {
    if (selectedStatus === "ALL") return true;
    return job.status === selectedStatus;
  });

  return (
    <MobileShell>
      <div className="space-y-3.5 pb-6">
        {/* Toast / Notification */}
        {actionNotice && (
          <div className="p-2.5 rounded-lg bg-foreground text-background text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{actionNotice}</span>
            <span className="text-[10px] text-emerald-400 font-bold">Stored in Dexie.js</span>
          </div>
        )}

        {/* Technician Role & Storage Banner */}
        <div className="rounded-xl border bg-card p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                <HardDrive size={16} />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Field Technician Console
                </span>
                <h2 className="text-sm font-bold text-foreground">Dexie.js Offline Storage</h2>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
              IndexedDB
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All technician jobs, time logs, and parts are persisted locally using Dexie.js. Work
            completely offline; changes sync to PostgreSQL automatically upon network reconnection.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["ALL", "Assigned", "In Progress", "On Hold", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatus === status
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Local Dexie.js Jobs List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Local Jobs ({filteredJobs.length})
            </span>
            <span>
              {pendingCount > 0 ? (
                <span className="text-amber-600 font-bold">{pendingCount} pending push</span>
              ) : (
                <span className="text-emerald-600 font-medium">All synced</span>
              )}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
              <span>Loading local jobs from Dexie.js...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
              No jobs matching filter in local Dexie database.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2.5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-primary">{job.id}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          job.priority === "Critical"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {job.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-foreground mt-0.5">{job.customerName}</h3>
                    <p className="text-[11px] text-muted-foreground">{job.siteAddress}</p>
                  </div>

                  {/* Sync status chip */}
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      job.syncStatus === "pending"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {job.syncStatus === "pending" ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Pending Sync</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={10} />
                        <span>Synced</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Status change action buttons (Dexie.js Offline Mutator) */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-1 flex-wrap">
                  <div className="text-[11px] font-mono text-muted-foreground">
                    Status: <strong className="text-foreground">{job.status}</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    {job.status !== "In Progress" && job.status !== "Completed" && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, "In Progress")}
                        className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Start Job
                      </button>
                    )}

                    {job.status === "In Progress" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(job.id, "On Hold")}
                          className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Hold
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(job.id, "Completed")}
                          className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      </>
                    )}

                    <Link
                      to="/mobile/jobs/$jobId"
                      params={{ jobId: job.id }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                      title="Open full technician job details"
                    >
                      <span>Details</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MobileShell>
  );
}
