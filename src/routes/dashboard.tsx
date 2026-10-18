import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  PauseCircle,
  RotateCcw,
  BarChart3,
  FileSpreadsheet,
  Cpu,
  ShieldCheck,
  ArrowLeft,
  ArrowUpRight,
  Layers,
  Radio,
  Sparkles,
  ChevronRight,
  Clock,
  Database,
  Building,
} from "lucide-react";
import { DASHBOARD_GROUPS, DASHBOARD_SCREENS_LIST } from "@/data/dashboardSpecData";
import { HeartbeatPulseScreen } from "@/components/dashboard/HeartbeatPulseScreen";
import { HoldMonitorScreen } from "@/components/dashboard/HoldMonitorScreen";
import { RepeatJobAnalysisScreen } from "@/components/dashboard/RepeatJobAnalysisScreen";
import { ManagementKpiScreen } from "@/components/dashboard/ManagementKpiScreen";
import { ReportViewerScreen } from "@/components/dashboard/ReportViewerScreen";
import { IntegrationQueueScreen } from "@/components/dashboard/IntegrationQueueScreen";
import { ExportLogScreen } from "@/components/dashboard/ExportLogScreen";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Service Operations & Executive Dashboard (A6) — Telesonic Lanka" },
      {
        name: "description",
        content:
          "Telesonic Lanka Option 01 Service Management Dashboard suite: Live Pulse (DSH-01), Hold Monitor (DSH-02), Repeat Job Analysis (DSH-03), Management KPIs (DSH-04), Integration Queue (DSH-05), Report Viewer (DSH-06), and Export Audit (DSH-07).",
      },
      {
        property: "og:title",
        content: "Service Operations & Executive Dashboard (A6) — Telesonic Lanka",
      },
      {
        property: "og:description",
        content:
          "Telesonic Lanka Option 01 Service Management Dashboard suite: Live Pulse (DSH-01), Hold Monitor (DSH-02), Repeat Job Analysis (DSH-03), Management KPIs (DSH-04), Integration Queue (DSH-05), Report Viewer (DSH-06), and Export Audit (DSH-07).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [activeGroup, setActiveGroup] = useState<string>("live-monitoring");

  const scrollToSection = (id: string) => {
    setActiveGroup(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToScreen = (screenId: string) => {
    const code = screenId.replace("O1-SCR-", "").toLowerCase();
    const element = document.getElementById(`screen-${code}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="py-4 sm:py-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Service Operations & Management Dashboard
            </h1>
          </div>

          {/* Quick jump to screen dropdown & PDF Guide */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              onChange={(e) => {
                if (e.target.value) scrollToScreen(e.target.value);
              }}
              defaultValue=""
              className="p-2 text-xs rounded-lg border border-border bg-card text-foreground font-semibold shadow-xs"
            >
              <option value="" disabled>
                Select Screen...
              </option>
              {DASHBOARD_SCREENS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sticky Group Navigation Anchor Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-2 pb-3 border-b border-border">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
          {DASHBOARD_GROUPS.map((grp) => {
            const isActive = activeGroup === grp.id;
            return (
              <button
                key={grp.id}
                onClick={() => scrollToSection(grp.id)}
                className={`px-4 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted"
                }`}
              >
                <span>{grp.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {grp.screenIds.length} Screens
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GROUP 1: Live Monitoring & Operational Pulse */}
      <div id="live-monitoring" className="space-y-10 scroll-mt-24 pt-2">
        <div className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Live Monitoring & Operational Pulse
            </h2>
          </div>
        </div>

        {/* Screen 1: O1-SCR-DSH-01 */}
        <HeartbeatPulseScreen />

        {/* Screen 2: O1-SCR-DSH-02 */}
        <HoldMonitorScreen />

        {/* Screen 3: O1-SCR-DSH-03 */}
        <RepeatJobAnalysisScreen />
      </div>

      {/* GROUP 2: Executive Management & Financial Performance */}
      <div id="executive-management" className="space-y-10 scroll-mt-24 pt-6">
        <div className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Executive Management & Financial Performance
            </h2>
          </div>
        </div>

        {/* Screen 4: O1-SCR-DSH-04 */}
        <ManagementKpiScreen />

        {/* Screen 5: O1-SCR-DSH-06 */}
        <ReportViewerScreen />
      </div>

      {/* GROUP 3: System Integration & Data Governance */}
      <div id="integration-governance" className="space-y-10 scroll-mt-24 pt-6">
        <div className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              System Integration & Data Governance
            </h2>
          </div>
        </div>

        {/* Screen 6: O1-SCR-DSH-05 */}
        <IntegrationQueueScreen />

        {/* Screen 7: O1-SCR-DSH-07 */}
        <ExportLogScreen />
      </div>

      {/* Footer Navigation Bar */}
      <div className="pt-8 pb-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <Link to="/masters" className="text-primary hover:underline font-semibold">
            Masters
          </Link>
          <span>•</span>
          <Link to="/transactions" className="text-primary hover:underline font-semibold">
            Transactions
          </Link>
          <span>•</span>
          <Link to="/" className="text-primary hover:underline font-semibold">
            Return to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
