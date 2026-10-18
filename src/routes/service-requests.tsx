import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Headphones,
  Layers,
  RotateCcw,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Cpu,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Sparkles,
} from "lucide-react";
import { SERVICE_REQUEST_MODULE_SCREENS } from "@/data/serviceRequestsSpecData";
import { UnifiedServiceRequestScreen } from "@/components/service-requests/UnifiedServiceRequestScreen";
import { RapidInboundCallLoggerScreen } from "@/components/service-requests/RapidInboundCallLoggerScreen";
import { RepeatDetectorHoldScreen } from "@/components/service-requests/RepeatDetectorHoldScreen";
import { MultiEquipmentBreakdownScreen } from "@/components/service-requests/MultiEquipmentBreakdownScreen";

export const Route = createFileRoute("/service-requests")({
  head: () => ({
    meta: [
      { title: "Service Request Module — Servio & Telesonic Lanka" },
      {
        name: "description",
        content:
          "Service Request Transaction Screens Suite (O1-SCR-TRX-01 to TRX-04) synchronized with SAP Business One.",
      },
      { property: "og:title", content: "Service Request Module — Servio & Telesonic Lanka" },
      {
        property: "og:description",
        content:
          "Service Request Transaction Screens Suite (O1-SCR-TRX-01 to TRX-04) synchronized with SAP Business One.",
      },
    ],
  }),
  component: ServiceRequestsPage,
});

function ServiceRequestsPage() {
  const [activeScreenId, setActiveScreenId] = useState<string>("O1-SCR-TRX-01");
  const [contextTicketId, setContextTicketId] = useState<string | undefined>(undefined);

  const handleNavigateToScreen = (screenId: string, contextId?: string) => {
    setActiveScreenId(screenId);
    if (contextId) {
      setContextTicketId(contextId);
    }
  };

  const activeScreenMeta =
    SERVICE_REQUEST_MODULE_SCREENS.find((s) => s.id === activeScreenId) ||
    SERVICE_REQUEST_MODULE_SCREENS[0];

  return (
    <div className="py-4 sm:py-6 space-y-6">
      {/* Top Breadcrumb & Return to Launcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace Launcher</span>
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Headphones className="w-3.5 h-3.5" />
            <span>Service Request Module (O1 Platform)</span>
          </div>
        </div>

        {/* Quick Screen Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-muted p-1 rounded-xl border border-border">
          {SERVICE_REQUEST_MODULE_SCREENS.map((screen) => {
            const isActive = activeScreenId === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => {
                  setActiveScreenId(screen.id);
                  setContextTicketId(undefined);
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-background text-foreground shadow-xs font-bold border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <span className="font-mono text-[11px] text-primary">{screen.code}</span>
                <span className="hidden md:inline">{screen.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Overview Banner & KPIs */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Service Request Module
            </h1>
          </div>

          {/* Module Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-muted/60 border border-border">
              <span className="text-[10px] text-muted-foreground font-medium block">
                Total Open SRs
              </span>
              <span className="text-lg font-bold font-mono text-foreground">18</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block">
                Avg Call Intake
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                38s
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium block">
                Repeat Alerts
              </span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                3 Active
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <span className="text-[10px] text-destructive font-medium block">
                Commercial Holds
              </span>
              <span className="text-lg font-bold font-mono text-destructive">2 Holds</span>
            </div>
          </div>
        </div>

        {/* 4 Screen Register Quick Cards */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICE_REQUEST_MODULE_SCREENS.map((s) => {
            const isSelected = activeScreenId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setActiveScreenId(s.id);
                  setContextTicketId(undefined);
                }}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border bg-background hover:bg-muted/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  {/* <span className="font-mono font-bold text-primary text-[11px]">{s.id}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {s.badge}
                  </span> */}
                </div>
                <div className="font-bold text-foreground line-clamp-1">{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Render the Active Screen Component */}
      <div className="transition-all duration-200">
        {activeScreenId === "O1-SCR-TRX-01" && (
          <UnifiedServiceRequestScreen onNavigateToScreen={handleNavigateToScreen} />
        )}

        {activeScreenId === "O1-SCR-TRX-02" && (
          <RapidInboundCallLoggerScreen onNavigateToScreen={handleNavigateToScreen} />
        )}

        {activeScreenId === "O1-SCR-TRX-03" && (
          <RepeatDetectorHoldScreen
            initialTicketId={contextTicketId}
            onNavigateToScreen={handleNavigateToScreen}
          />
        )}

        {activeScreenId === "O1-SCR-TRX-04" && (
          <MultiEquipmentBreakdownScreen
            initialTicketId={contextTicketId}
            onNavigateToScreen={handleNavigateToScreen}
          />
        )}
      </div>
    </div>
  );
}
