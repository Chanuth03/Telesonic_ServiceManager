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
          </div>
        </div>
      </div>
    </div>
  );
};
