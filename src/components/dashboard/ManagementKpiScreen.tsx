import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  ThumbsUp,
  Download,
  Calendar,
  Building2,
} from "lucide-react";
import { DASHBOARD_SCREENS_LIST, MANAGEMENT_KPIS } from "@/data/dashboardSpecData";
import { DashboardScreenHeader } from "./DashboardScreenHeader";

export const ManagementKpiScreen: React.FC = () => {
  const meta = DASHBOARD_SCREENS_LIST.find((s) => s.code === "DSH-04")!;
  const [period, setPeriod] = useState<"mtd" | "q3" | "ytd">("mtd");

  // Divisional breakdown
  const divisions = [
    {
      name: "Commercial VRV & Central HVAC",
      revenue: "LKR 9,200,000.00",
      target: "LKR 8,500,000.00",
      margin: "46.2%",
      calls: 142,
      trend: "+8.2%",
    },
    {
      name: "Industrial Refrigeration & Chillers",
      revenue: "LKR 3,850,000.00",
      target: "LKR 3,500,000.00",
      margin: "39.8%",
      calls: 68,
      trend: "+10.0%",
    },
    {
      name: "Domestic Split & Package AC",
      revenue: "LKR 1,800,000.00",
      target: "LKR 1,500,000.00",
      margin: "34.5%",
      calls: 95,
      trend: "+20.0%",
    },
  ];

  return (
    <section id="screen-dsh-04" className="scroll-mt-28">
      <DashboardScreenHeader
        meta={meta}
        icon={BarChart3}
        tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400"
      />

      {/* Period Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"></div>

        <div className="flex items-center bg-muted/70 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setPeriod("mtd")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              period === "mtd"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            October 2026 (MTD)
          </button>
          <button
            onClick={() => setPeriod("q3")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              period === "q3"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Q3 Performance
          </button>
          <button
            onClick={() => setPeriod("ytd")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              period === "ytd"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Full Year YTD
          </button>
        </div>
      </div>

      {/* 6 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {MANAGEMENT_KPIS.map((item) => (
          <div
            key={item.kpi}
            className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground leading-snug">
                  {item.kpi}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  {item.trend}
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight my-1">
                {item.value}
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  Target: <strong className="text-foreground">{item.target}</strong>
                </span>
                <span className="font-semibold text-emerald-600">Surpassed</span>
              </div>
              {/* Target Bar */}
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: "95%" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divisional Contribution Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Revenue & Margin by Service Division
            </h3>
            <p className="text-xs text-muted-foreground">
              Performance breakdown synchronized with SAP B1 General Ledger Cost Centers.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-muted text-foreground">
            Total Billed: LKR 14.85 Million
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {divisions.map((div) => (
            <div key={div.name} className="p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <h4 className="text-sm font-bold text-foreground leading-snug">{div.name}</h4>
              </div>

              <div className="my-2">
                <span className="text-xs text-muted-foreground">Revenue Billed</span>
                <div className="text-lg font-extrabold text-foreground font-mono">
                  {div.revenue}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block">Gross Margin</span>
                  <span className="font-bold text-emerald-600">{div.margin}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Calls Served</span>
                  <span className="font-bold text-foreground font-mono">{div.calls} Calls</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
