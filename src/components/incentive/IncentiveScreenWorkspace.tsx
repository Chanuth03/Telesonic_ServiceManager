import React, { useState } from "react";
import { type IncentiveScreenItem, INCENTIVE_SCREENS } from "@/lib/incentive-screens-data";
import { SchemeMasterView } from "@/components/incentive/SchemeMasterView";
import { CommissionRateMatrixView } from "@/components/incentive/CommissionRateMatrixView";
import { TargetIncentiveSlabTableView } from "@/components/incentive/TargetIncentiveSlabTableView";
import { MonthlyTargetEntryView } from "@/components/incentive/MonthlyTargetEntryView";
import { IncentiveParticipantProfileView } from "@/components/incentive/IncentiveParticipantProfileView";
import { AttendanceLeaveImportView } from "@/components/incentive/AttendanceLeaveImportView";
import { ServicePerformanceDataView } from "@/components/incentive/ServicePerformanceDataView";
import { CalculationResultsDetailView } from "@/components/incentive/CalculationResultsDetailView";
import { IncentiveCalculationRunView } from "@/components/incentive/IncentiveCalculationRunView";

import {
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Save,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Sliders,
  CheckSquare,
  Send,
  Receipt,
  BarChart3,
  ShieldAlert,
  History,
  Settings2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface IncentiveScreenWorkspaceProps {
  screen: IncentiveScreenItem;
  onBack: () => void;
  onNavigateScreen: (screenId: string) => void;
}

export function IncentiveScreenWorkspace({
  screen,
  onBack,
  onNavigateScreen,
}: IncentiveScreenWorkspaceProps) {
  // If the active screen has a dedicated full-fidelity component, route to it!
  switch (screen.id) {
    case "scheme-master":
      return (
        <div className="space-y-4">
          <TopWorkspaceBar screen={screen} onBack={onBack} onNavigateScreen={onNavigateScreen} />
          <SchemeMasterView onNavigateScreen={onNavigateScreen} />
        </div>
      );

    case "rate-matrix":
      return (
        <div className="space-y-4">
          <CommissionRateMatrixView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    case "slab-table":
      return (
        <div className="space-y-4">
          <TargetIncentiveSlabTableView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    case "monthly-target":
      return (
        <div className="space-y-4">
          <MonthlyTargetEntryView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    case "participant-profile":
      return (
        <div className="space-y-4">
          <IncentiveParticipantProfileView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    case "attendance-import":
      return (
        <div className="space-y-4">
          <AttendanceLeaveImportView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    case "service-performance":
      return (
        <div className="space-y-4">
          <ServicePerformanceDataView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    case "calculation-results":
      return (
        <div className="space-y-4">
          <CalculationResultsDetailView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    case "calculation-run":
      return (
        <div className="space-y-4">
          <IncentiveCalculationRunView onNavigateScreen={onNavigateScreen} onBack={onBack} />
        </div>
      );

    default:
      // Generic high-fidelity operational screen template for remaining screens (10 to 19)
      return (
        <GenericIncentiveScreenWorkspace
          screen={screen}
          onBack={onBack}
          onNavigateScreen={onNavigateScreen}
        />
      );
  }
}

function TopWorkspaceBar({
  screen,
  onBack,
  onNavigateScreen,
}: {
  screen: IncentiveScreenItem;
  onBack: () => void;
  onNavigateScreen: (screenId: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>All Incentive Screens</span>
        </Button>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded">
          Screen #{screen.screenNumber.toString().padStart(2, "0")} · {screen.category}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={screen.id}
          onChange={(e) => onNavigateScreen(e.target.value)}
          className="input-field text-xs h-8 bg-card"
        >
          {INCENTIVE_SCREENS.map((s) => (
            <option key={s.id} value={s.id}>
              #{s.screenNumber.toString().padStart(2, "0")} {s.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function GenericIncentiveScreenWorkspace({
  screen,
  onBack,
  onNavigateScreen,
}: {
  screen: IncentiveScreenItem;
  onBack: () => void;
  onNavigateScreen: (screenId: string) => void;
}) {
  const ScreenIcon = screen.icon;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDivision, setActiveDivision] = useState("All Divisions");

  return (
    <div className="space-y-6 pb-8">
      {/* Top Bar */}
      <TopWorkspaceBar screen={screen} onBack={onBack} onNavigateScreen={onNavigateScreen} />

      {/* Screen Banner */}
      <div className="card-surface p-5 sm:p-6 rounded-lg border bg-card shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${screen.tone} shadow-xs`}
            >
              <ScreenIcon size={24} />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {screen.title}
                </h1>
                <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                  Screen #{screen.screenNumber.toString().padStart(2, "0")}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                {screen.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success("Module configuration exported to Excel.");
              }}
              className="gap-1.5 text-xs h-8"
            >
              <Download size={13} />
              <span>Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs h-8"
            >
              <Printer size={13} />
              <span>Print</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success("Parameters and settings saved successfully.", {
                  description: `${screen.title} state updated.`,
                });
              }}
              className="gap-1.5 text-xs h-8 shadow-xs"
            >
              <Save size={13} />
              <span>Save Record</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content Toolbar */}
      <div className="card-surface p-4 rounded-lg border bg-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder={`Search ${screen.title.toLowerCase()} records...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 text-xs h-9 w-full bg-card"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={activeDivision}
            onChange={(e) => setActiveDivision(e.target.value)}
            className="input-field h-9 text-xs bg-card"
          >
            <option value="All Divisions">All Divisions</option>
            <option value="Consumer Electronics">Consumer Electronics</option>
            <option value="Biomedical Engineering">Biomedical Engineering</option>
            <option value="Telecommunications & Networks">Telecommunications & Networks</option>
            <option value="Enterprise IT Solutions">Enterprise IT Solutions</option>
          </select>

          <Button
            size="sm"
            onClick={() => {
              toast.info(`New record form opened for ${screen.title}`);
            }}
            className="h-9 gap-1.5 text-xs"
          >
            <Plus size={13} />
            <span>New Record</span>
          </Button>
        </div>
      </div>

      {/* Interactive Table Representation */}
      <div className="card-surface overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-primary" />
            <span className="font-semibold text-xs text-foreground">
              {screen.title} Active Register
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Status: Operational &middot; ERP Connected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/20 text-left font-semibold text-muted-foreground">
                <th className="px-4 py-3 w-14 text-center">#</th>
                <th className="px-4 py-3">Reference / Code</th>
                <th className="px-4 py-3">Description / Parameter</th>
                <th className="px-4 py-3">Effective Scope</th>
                <th className="px-4 py-3">Last Modified</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  code: `${screen.id.toUpperCase().slice(0, 3)}-2026-001`,
                  name: `Default ${screen.title} Configuration Matrix`,
                  scope: activeDivision,
                  date: "14-May-2026 10:30 IST",
                  status: "Active",
                },
                {
                  code: `${screen.id.toUpperCase().slice(0, 3)}-2026-002`,
                  name: `Secondary Branch Exception Policy`,
                  scope: "All Outstations (Kandy, Galle, Jaffna)",
                  date: "10-May-2026 14:15 IST",
                  status: "Active",
                },
                {
                  code: `${screen.id.toUpperCase().slice(0, 3)}-2026-003`,
                  name: `Special Quarterly Incentive Adjustment Criteria`,
                  scope: "Enterprise Accounts & High-Value SLAs",
                  date: "04-May-2026 09:00 IST",
                  status: "Under Review",
                },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-primary">{item.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.scope}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                    {item.date}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === "Active"
                          ? "bg-success-soft text-success"
                          : "bg-warning-soft text-warning"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toast.success(`Loaded details for ${item.code}`);
                      }}
                      className="h-7 text-xs text-primary hover:underline cursor-pointer"
                    >
                      Configure &rarr;
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
