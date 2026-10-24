import React from "react";
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
import { ManualAdjustmentsView } from "@/components/incentive/ManualAdjustmentsView";
import { MultiLevelApprovalView } from "@/components/incentive/MultiLevelApprovalView";
import { GLPostingPayrollView } from "@/components/incentive/GLPostingPayrollView";
import { ParticipantStatementView } from "@/components/incentive/ParticipantStatementView";
import { DisputeResolutionView } from "@/components/incentive/DisputeResolutionView";
import { SchemeAnalyticsView } from "@/components/incentive/SchemeAnalyticsView";
import { IncentiveDashboardWorkspace } from "@/components/incentive/IncentiveDashboardWorkspace";
import { ClawbackPenaltyView } from "@/components/incentive/ClawbackPenaltyView";
import { AuditTrailView } from "@/components/incentive/AuditTrailView";
import { SystemParametersView } from "@/components/incentive/SystemParametersView";
import { DivisionMasterView } from "@/components/incentive/DivisionMasterView";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface IncentiveScreenWorkspaceProps {
  screen: IncentiveScreenItem;
  onBack: () => void;
  onNavigateScreen: (screenId: string) => void;
}

// Stage mapping based on Section 5 Process Flow
function getStageInfo(screenNumber: number): { stageNumber: number; stageName: string; stageTone: string } {
  if ([1, 2, 3, 5, 20].includes(screenNumber)) {
    return { stageNumber: 1, stageName: "Master Scheme Setup", stageTone: "bg-blue-100 text-blue-800 border-blue-200" };
  }
  if ([4, 6, 7].includes(screenNumber)) {
    return { stageNumber: 2, stageName: "Operational Quotas & Inputs", stageTone: "bg-cyan-100 text-cyan-800 border-cyan-200" };
  }
  if ([8, 9, 10].includes(screenNumber)) {
    return { stageNumber: 3, stageName: "Engine Execution & Adjustments", stageTone: "bg-purple-100 text-purple-800 border-purple-200" };
  }
  if ([11, 12].includes(screenNumber)) {
    return { stageNumber: 4, stageName: "Governance & Financial Handover", stageTone: "bg-amber-100 text-amber-800 border-amber-200" };
  }
  if ([13, 14].includes(screenNumber)) {
    return { stageNumber: 5, stageName: "Payslips & Dispute Resolution", stageTone: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  }
  return { stageNumber: 6, stageName: "Risk, Audit & Settings", stageTone: "bg-slate-100 text-slate-800 border-slate-200" };
}

/**
 * Clean Top Navigation Bar with Step Sequence & Previous/Next Navigation
 */
function ProcessLifecycleHeader({
  screen,
  onBack,
  onNavigateScreen,
}: {
  screen: IncentiveScreenItem;
  onBack: () => void;
  onNavigateScreen: (screenId: string) => void;
}) {
  const currentIndex = INCENTIVE_SCREENS.findIndex((s) => s.id === screen.id);
  const prevScreen = currentIndex > 0 ? INCENTIVE_SCREENS[currentIndex - 1] : null;
  const nextScreen = currentIndex < INCENTIVE_SCREENS.length - 1 ? INCENTIVE_SCREENS[currentIndex + 1] : null;

  const stage = getStageInfo(screen.screenNumber);

  return (
    <div className="bg-card border border-border p-3 rounded-xl shadow-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back to launcher & Step Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8 px-2.5 gap-1.5 text-xs font-semibold hover:bg-muted cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>All {INCENTIVE_SCREENS.length} Screens</span>
          </Button>

          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
            Step {screen.screenNumber.toString().padStart(2, "0")} / {INCENTIVE_SCREENS.length}
          </span>

          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${stage.stageTone}`}>
            Stage {stage.stageNumber}: {stage.stageName}
          </span>
        </div>

        {/* Right: Step Switcher & Prev/Next Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {prevScreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen(prevScreen.id)}
              className="h-8 px-2.5 text-xs gap-1 font-medium"
              title={`Previous: #${prevScreen.screenNumber} ${prevScreen.title}`}
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Prev</span>
            </Button>
          )}

          <select
            value={screen.id}
            onChange={(e) => onNavigateScreen(e.target.value)}
            className="h-8 px-2.5 text-xs bg-background border border-border rounded-lg font-medium focus:ring-1 focus:ring-primary max-w-[220px] sm:max-w-[260px] truncate"
          >
            {INCENTIVE_SCREENS.map((s) => (
              <option key={s.id} value={s.id}>
                #{s.screenNumber.toString().padStart(2, "0")} {s.title}
              </option>
            ))}
          </select>

          {nextScreen && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onNavigateScreen(nextScreen.id)}
              className="h-8 px-2.5 text-xs gap-1 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              title={`Next: #${nextScreen.screenNumber} ${nextScreen.title}`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main Workspace Router for all 19 Screens
 */
export function IncentiveScreenWorkspace({
  screen,
  onBack,
  onNavigateScreen,
}: IncentiveScreenWorkspaceProps) {
  const renderContent = () => {
    switch (screen.id) {
      case "scheme-master":
        return <SchemeMasterView onNavigateScreen={onNavigateScreen} />;

      case "rate-matrix":
        return <CommissionRateMatrixView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "slab-table":
        return <TargetIncentiveSlabTableView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "monthly-target":
        return <MonthlyTargetEntryView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "participant-profile":
        return <IncentiveParticipantProfileView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "attendance-import":
        return <AttendanceLeaveImportView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "service-performance":
        return <ServicePerformanceDataView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "calculation-results":
        return <CalculationResultsDetailView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "calculation-run":
        return <IncentiveCalculationRunView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "manual-adjustment":
        return <ManualAdjustmentsView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "approval-posting":
        return <MultiLevelApprovalView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "gl-posting":
        return <GLPostingPayrollView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "statement-slip":
        return <ParticipantStatementView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "dispute-query":
        return <DisputeResolutionView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "scheme-analytics":
        return <SchemeAnalyticsView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "incentive-dashboard":
        return <IncentiveDashboardWorkspace onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "clawback-register":
        return <ClawbackPenaltyView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "audit-trail":
        return <AuditTrailView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "system-parameters":
        return <SystemParametersView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      case "division-master":
        return <DivisionMasterView onNavigateScreen={onNavigateScreen} onBack={onBack} />;

      default:
        return (
          <div className="p-8 text-center text-muted-foreground bg-card border rounded-xl">
            Screen {screen.title} ({screen.id}) is active.
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <ProcessLifecycleHeader
        screen={screen}
        onBack={onBack}
        onNavigateScreen={onNavigateScreen}
      />
      {renderContent()}
    </div>
  );
}
