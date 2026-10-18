import React, { useState } from "react";
import {
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  Cpu,
  DollarSign,
  TrendingDown,
  Info,
  BadgeAlert,
} from "lucide-react";
import { DASHBOARD_SCREENS_LIST, REPEAT_JOB_DATA } from "@/data/dashboardSpecData";
import { DashboardScreenHeader } from "./DashboardScreenHeader";

export const RepeatJobAnalysisScreen: React.FC = () => {
  const meta = DASHBOARD_SCREENS_LIST.find((s) => s.code === "DSH-03")!;
  const [activeDimension, setActiveDimension] = useState<"all" | "tech" | "model">("all");

  const filteredData = REPEAT_JOB_DATA.filter((item) => {
    if (activeDimension === "tech") {
      return item.dimension.includes("Technician") || item.dimension.includes("Subcontractor");
    }
    if (activeDimension === "model") {
      return item.dimension.includes("Equipment Model");
    }
    return true;
  });

  return (
    <section id="screen-dsh-03" className="scroll-mt-28">
      <DashboardScreenHeader
        meta={meta}
        icon={RotateCcw}
        tone="bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400"
      />

      {/* Rework Summary Statistics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Total Repeat Calls
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground tabular-nums">16</span>
            <span className="text-xs font-semibold text-amber-600">Across 211 Total Calls</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Department Rate: 7.58%
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Rework Cost Exposure
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">LKR</span>
            <span className="text-2xl font-extrabold text-rose-600 tabular-nums">314,950</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Direct labour & parts loss
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Poor Service Faults
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground tabular-nums">3</span>
            <span className="text-xs font-semibold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950">
              Penalized
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Incentive deduction applied
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Repeat Threshold Target
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground tabular-nums">&lt; 5.0%</span>
            <span className="text-xs font-medium text-emerald-600">Company Benchmark</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">ISO 9001 Standard</span>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Repeat Analysis by Dimension</h3>
            <p className="text-xs text-muted-foreground">
              Review technician workmanship and equipment failure frequencies to prevent repetitive
              customer churn.
            </p>
          </div>

          {/* Dimension Filter Switcher */}
          <div className="flex items-center bg-muted/70 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveDimension("all")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeDimension === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Dimensions
            </button>
            <button
              onClick={() => setActiveDimension("tech")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeDimension === "tech"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Technicians & Subcontractors
            </button>
            <button
              onClick={() => setActiveDimension("model")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeDimension === "model"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Equipment Models
            </button>
          </div>
        </div>

        {/* High-density Data Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Analyzed Dimension (Technician / Equipment Model)</th>
                <th className="py-2.5 px-3 text-center">Total Completed Calls</th>
                <th className="py-2.5 px-3 text-center">Repeat Calls</th>
                <th className="py-2.5 px-3 text-center">Repeat Rate %</th>
                <th className="py-2.5 px-3 text-center">Poor Workmanship Faults</th>
                <th className="py-2.5 px-3 text-right">Rework Cost (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((item) => {
                const repeatVal = parseFloat(item.repeatPct);
                const isHighRisk = repeatVal >= 10.0;
                const isModerate = repeatVal >= 6.0 && repeatVal < 10.0;

                return (
                  <tr key={item.dimension} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {item.dimension.includes("Technician") ||
                        item.dimension.includes("Subcontractor") ? (
                          <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span>{item.dimension}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-foreground">
                      {item.calls}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                      {item.repeats}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                          isHighRisk
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300"
                            : isModerate
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300"
                        }`}
                      >
                        {isHighRisk && <BadgeAlert className="w-3 h-3 text-rose-600" />}
                        {item.repeatPct}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.poorService > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 border border-rose-200">
                          {item.poorService} Fault{item.poorService > 1 ? "s" : ""} (-LKR{" "}
                          {item.poorService * 5000})
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">0 (Clean)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {item.costOfReworkLkr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
