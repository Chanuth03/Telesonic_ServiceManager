import React from "react";
import { type LucideIcon, ArrowUpRight, ShieldCheck, RefreshCw } from "lucide-react";
import { DashboardScreenMeta } from "@/data/dashboardSpecData";

interface DashboardScreenHeaderProps {
  meta: DashboardScreenMeta;
  icon: LucideIcon;
  tone: string;
  badgeExtra?: string;
  liveBadge?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DashboardScreenHeader: React.FC<DashboardScreenHeaderProps> = ({
  meta,
  icon: Icon,
  tone,
  badgeExtra,
  liveBadge = false,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon, Number Badge, Title, Classification */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted/80 text-foreground border border-border/60">
                #{meta.code}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{meta.id}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  meta.priority === "P1"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                }`}
              >
                {meta.priority} Priority
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                {meta.type}
              </span>
              {liveBadge && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE STREAM
                </span>
              )}
              {badgeExtra && (
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {badgeExtra}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {meta.name}
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {meta.purpose}
            </p>
          </div>
        </div>

        {/* Right: Roles & Actions */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-muted-foreground block font-medium">
              Target Roles
            </span>
            <span
              className="text-xs font-semibold text-foreground max-w-[200px] truncate block"
              title={meta.roles}
            >
              {meta.roles}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh screen metrics"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
                />
                <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
              </button>
            )}
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded bg-muted/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>O1-Spec Validated</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
