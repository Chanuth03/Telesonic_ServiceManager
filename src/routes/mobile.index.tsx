import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Bell,
  ScanLine,
  ChevronRight,
  LogOut,
} from "lucide-react";
import {
  getMobileJobs,
  getMobileNotifications,
  subscribeMobileJobs,
  getActiveTechnicianName,
  getPendingHoldReviews,
  reviewJobHoldRequest,
} from "@/lib/mobile-data";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import { useMobileI18n } from "@/lib/mobile-i18n";

export const Route = createFileRoute("/mobile/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Telesonic Mobile App — Service Manager" },
      {
        name: "description",
        content: "Telesonic Service Manager Mobile App for field service technicians.",
      },
      { property: "og:title", content: "Telesonic Mobile App — Service Manager" },
      {
        property: "og:description",
        content: "Telesonic Service Manager Mobile App for field service technicians.",
      },
    ],
  }),
  component: MobileOverviewPage,
});

function MobileOverviewPage() {
  const { user, role, logoutUser } = useRole();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(() => getMobileJobs());
  const [notifications, setNotifications] = useState(() => getMobileNotifications());
  const [holdReviews, setHoldReviews] = useState(() => getPendingHoldReviews());
  const { t } = useMobileI18n();

  useEffect(() => {
    const syncState = () => {
      setJobs(getMobileJobs());
      setNotifications(getMobileNotifications());
      setHoldReviews(getPendingHoldReviews());
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
    <div className="space-y-3.5 max-w-full overflow-hidden pb-4">
      {/* Mobile Welcome Heading */}
      <div className="px-0.5 pt-0.5 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground truncate">
          {t("welcome")}, {activeTechName}
        </h2>
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
          <span>{t("signOut")}</span>
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
            <span className="text-xs font-semibold">{t("assignedJobs")}</span>
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
            <span className="text-xs font-semibold">{t("completed")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground font-mono">{completedJobs.length}</p>
          <p className="text-[10px] text-muted-foreground">Work completion slips signed</p>
        </Link>
      </div>

      {/* Additional Option 01 Workflow Hub Tiles */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          {t("fieldModules")}
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
                    {t("stockCount")}
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
                    {t("notifications")}
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

      {role !== "TECHNICIAN" && holdReviews.length > 0 && (
        <div className="space-y-2 rounded-xl border bg-card p-3">
          <h3 className="text-xs font-bold">{t("holdApprovals")}</h3>
          {holdReviews.map(({ job: holdJob, hold }) => (
            <div key={hold.id} className="space-y-1 rounded-lg border p-2 text-xs">
              <p className="font-bold">
                {holdJob.id} · {hold.reason}
              </p>
              <p className="text-muted-foreground">
                Resume {hold.expectedResumeDate || "not set"}. {hold.notes}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    reviewJobHoldRequest(holdJob.id, hold.id, "Approved", user?.name || "Coordinator");
                    setHoldReviews(getPendingHoldReviews());
                    setJobs(getMobileJobs());
                  }}
                >
                  {t("approve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    reviewJobHoldRequest(holdJob.id, hold.id, "Rejected", user?.name || "Coordinator");
                    setHoldReviews(getPendingHoldReviews());
                    setJobs(getMobileJobs());
                  }}
                >
                  {t("reject")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Return to Workspace Button (only for Admin / Desktop Roles) */}
      {role !== "TECHNICIAN" && (
        <div className="rounded-xl border bg-muted/40 p-3.5 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Need full ITSM administrative tools or Service Desk?
          </p>
          <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
            <Link to="/">
              <ArrowLeft size={14} className="mr-1.5" />
              Return to Desktop Workspace
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
