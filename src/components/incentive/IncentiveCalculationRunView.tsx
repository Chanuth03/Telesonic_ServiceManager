import React, { useState, useMemo } from "react";
import {
  PlayCircle,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Calendar,
  Layers,
  History as HistoryIcon,
  ChevronRight,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
  Info,
  DollarSign,
  Percent,
  Sliders,
  ExternalLink,
  Users,
  Building2,
  TrendingUp,
  Award,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Eye,
  SlidersHorizontal,
  CheckSquare,
  AlertOctagon,
  ArrowUpRight,
  Send,
  FileCheck,
  Receipt,
  Terminal,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export type RunStatus =
  "Draft" | "Simulated" | "Calculated" | "Submitted" | "Approved" | "Posted" | "Locked";

export type RunType = "Simulation" | "Final Calculation";

export interface SchemeRunSummary {
  schemeCode: string;
  schemeName: string;
  division: string;
  participants: number;
  documentsRead: number;
  grossCommission: number;
  targetIncentive: number;
  penalty: number;
  netPayable: number;
  warningsCount: number;
}

export interface RunWarning {
  id: string;
  code: string;
  schemeCode: string;
  participantName: string;
  severity: "High" | "Medium" | "Low";
  message: string;
  remediation: string;
}

export interface RunLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "DEBUG";
  message: string;
}

export interface ReadinessCheck {
  id: string;
  moduleName: string;
  requiredState: string;
  currentState: string;
  isReady: boolean;
  signer: string;
  lastUpdated: string;
}

// Initial Mock Readiness Check State
const INITIAL_READINESS: ReadinessCheck[] = [
  {
    id: "chk-1",
    moduleName: "Monthly Target Quotas",
    requiredState: "Locked & Approved",
    currentState: "Locked & Approved",
    isReady: true,
    signer: "Lakmal Perera (Incentive Administrator)",
    lastUpdated: "12-May-2026 11:20 IST",
  },
  {
    id: "chk-2",
    moduleName: "Attendance & Leave Import",
    requiredState: "Approved by HR",
    currentState: "Approved by HR",
    isReady: true,
    signer: "Niluka Senaratne (HR Manager)",
    lastUpdated: "12-May-2026 15:45 IST",
  },
  {
    id: "chk-3",
    moduleName: "Service Performance Data",
    requiredState: "Locked by HOD",
    currentState: "Locked by HOD",
    isReady: true,
    signer: "Chaminda Warnakula (Service HOD)",
    lastUpdated: "12-May-2026 16:10 IST",
  },
  {
    id: "chk-4",
    moduleName: "SAP B1 Debtor Aging Ledger",
    requiredState: "Synchronized",
    currentState: "Synchronized (0-120+ Days)",
    isReady: true,
    signer: "SAP Integration Engine",
    lastUpdated: "12-May-2026 18:00 IST",
  },
];

// Initial Mock Schemes Summary Data
const INITIAL_SCHEME_SUMMARIES: SchemeRunSummary[] = [
  {
    schemeCode: "SCH-SLS-2026",
    schemeName: "Retail Showroom Sales Incentive",
    division: "Consumer Electronics",
    participants: 12,
    documentsRead: 842,
    grossCommission: 485000,
    targetIncentive: 320000,
    penalty: 25000,
    netPayable: 780000,
    warningsCount: 1,
  },
  {
    schemeCode: "SCH-CAC-2026",
    schemeName: "Commercial HVAC Dealer Commission",
    division: "Commercial Air Conditioning",
    participants: 10,
    documentsRead: 416,
    grossCommission: 1250000,
    targetIncentive: 450000,
    penalty: 62000,
    netPayable: 1638000,
    warningsCount: 2,
  },
  {
    schemeCode: "SCH-SRV-2026",
    schemeName: "Field Service Technician Performance Incentive",
    division: "Consumer Electronics",
    participants: 8,
    documentsRead: 363,
    grossCommission: 310000,
    targetIncentive: 280000,
    penalty: 35000,
    netPayable: 555000,
    warningsCount: 2,
  },
  {
    schemeCode: "SCH-SOLAR-2026",
    schemeName: "Renewable Energy Solar Consultant Incentive",
    division: "Renewable Energy",
    participants: 4,
    documentsRead: 114,
    grossCommission: 820000,
    targetIncentive: 190000,
    penalty: 0,
    netPayable: 1010000,
    warningsCount: 0,
  },
];

// Initial Mock Warnings
const INITIAL_WARNINGS: RunWarning[] = [
  {
    id: "wrn-1",
    code: "WRN-ATT-04",
    schemeCode: "SCH-SRV-2026",
    participantName: "Dilshan Madusanka (EMP-1024)",
    severity: "High",
    message:
      "Technician logged 3 unapproved absent days; 0% attendance factor applied (INC-BCR-10 Proposed Demo Rule).",
    remediation: "Verify with HR if authorized exemption applies before final payout sign-off.",
  },
  {
    id: "wrn-2",
    code: "WRN-DEBT-12",
    schemeCode: "SCH-CAC-2026",
    participantName: "Pradeep Bandara (EMP-1022)",
    severity: "Medium",
    message:
      "Invoice INV-2026-9042 overdue by 94 days; 15% debtor aging penalty deducted (LKR 28,500).",
    remediation: "Recoverable upon customer settlement in upcoming settlement cycles.",
  },
  {
    id: "wrn-3",
    code: "WRN-REP-02",
    schemeCode: "SCH-SRV-2026",
    participantName: "Mahesh Gunawardena (EMP-1030)",
    severity: "High",
    message:
      "Repeat call #SRV-2026-1015 flagged as Poor Workmanship; job excluded from eligible count.",
    remediation: "HOD classification confirmed after callback inspection.",
  },
  {
    id: "wrn-4",
    code: "WRN-TGT-01",
    schemeCode: "SCH-SLS-2026",
    participantName: "Kasun Jayawardena (EMP-1021)",
    severity: "Low",
    message:
      "Turnover achievement reached 164.2%; incentive capped at Tier 5 Super Achiever slab ceiling.",
    remediation: "Informational only; payout capped as configured in Target Slab Table.",
  },
  {
    id: "wrn-5",
    code: "WRN-DEBT-18",
    schemeCode: "SCH-CAC-2026",
    participantName: "Ruwan Wijesinghe (EMP-1023)",
    severity: "Medium",
    message:
      "Partial payment receipt detected on invoice INV-2026-8911; pro-rata commission calculated.",
    remediation: "Remaining balance will calculate upon subsequent collection.",
  },
];

// Initial Execution Log
const INITIAL_LOGS: RunLogEntry[] = [
  {
    id: "log-1",
    timestamp: "10:15:20.102",
    level: "INFO",
    message: "Engine initialized. Configuration validated for period May 2026.",
  },
  {
    id: "log-2",
    timestamp: "10:15:21.430",
    level: "INFO",
    message: "Connecting to SAP Business One Service Layer API... Connected (Latency 14ms).",
  },
  {
    id: "log-3",
    timestamp: "10:15:22.015",
    level: "INFO",
    message:
      "Ingested 1,735 source documents: 1,258 invoices, 363 service tickets, 114 solar contracts.",
  },
  {
    id: "log-4",
    timestamp: "10:15:25.800",
    level: "DEBUG",
    message: "Evaluating Target Slab Table v2.1 for Retail Showroom Sales (12 participants).",
  },
  {
    id: "log-5",
    timestamp: "10:15:32.410",
    level: "WARN",
    message: "WRN-ATT-04: Dilshan Madusanka (EMP-1024) 3 absent days. Calculated 0% factor.",
  },
  {
    id: "log-6",
    timestamp: "10:15:38.220",
    level: "DEBUG",
    message: "Executing payment-term aging matrix against open receivables ledger.",
  },
  {
    id: "log-7",
    timestamp: "10:15:45.900",
    level: "WARN",
    message: "WRN-DEBT-12: Applied 15% debtor aging penalty on overdue invoice INV-2026-9042.",
  },
  {
    id: "log-8",
    timestamp: "10:15:58.100",
    level: "INFO",
    message: "Net payable reconciliation completed across all 4 schemes. Net Pool: LKR 3,983,000.",
  },
  {
    id: "log-9",
    timestamp: "10:16:04.110",
    level: "SUCCESS",
    message: "Run finished successfully in 44.008s. Generated 5 warnings.",
  },
];

// Currency Formatter
function formatLKR(amount: number): string {
  return "LKR " + amount.toLocaleString("en-LK");
}

interface IncentiveCalculationRunViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function IncentiveCalculationRunView({
  onNavigateScreen,
  onBack,
}: IncentiveCalculationRunViewProps) {
  // Mandatory Header States
  const [runNo, setRunNo] = useState<string>("RUN-2026-05-PRE-01");
  const [period, setPeriod] = useState<string>("May 2026");
  const [division, setDivision] = useState<string>("All Divisions");
  const [selectedSchemes, setSelectedSchemes] = useState<string>("All Active Schemes (4 Schemes)");
  const [runType, setRunType] = useState<RunType>("Simulation");
  const [dataCutoff, setDataCutoff] = useState<string>("12-May-2026 23:59:59");
  const [status, setStatus] = useState<RunStatus>("Simulated");
  const [runBy, setRunBy] = useState<string>("Lakmal Perera (Incentive Administrator)");
  const [started, setStarted] = useState<string>("14-May-2026 10:15:20");
  const [finished, setFinished] = useState<string>("14-May-2026 10:16:04");

  // Readiness Checks State
  const [readiness, setReadiness] = useState<ReadinessCheck[]>(INITIAL_READINESS);

  // Tabs: Participants, Warnings, Log
  const [activeTab, setActiveTab] = useState<string>("participants");

  // Grid Data States
  const [summaries, setSummaries] = useState<SchemeRunSummary[]>(INITIAL_SCHEME_SUMMARIES);
  const [warnings, setWarnings] = useState<RunWarning[]>(INITIAL_WARNINGS);
  const [logs, setLogs] = useState<RunLogEntry[]>(INITIAL_LOGS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");

  // Modals & Execution States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);
  const [submissionNotes, setSubmissionNotes] = useState<string>(
    "Calculation completed. All 4 schemes verified against locked targets, attendance and service data.",
  );

  // Validation: Are all prerequisite inputs locked?
  const allInputsLocked = useMemo(() => {
    return readiness.every((r) => r.isReady);
  }, [readiness]);

  // Aggregates across all schemes
  const totals = useMemo(() => {
    const totalParticipants = summaries.reduce((acc, s) => acc + s.participants, 0);
    const totalDocs = summaries.reduce((acc, s) => acc + s.documentsRead, 0);
    const totalGross = summaries.reduce((acc, s) => acc + s.grossCommission, 0);
    const totalTarget = summaries.reduce((acc, s) => acc + s.targetIncentive, 0);
    const totalPenalty = summaries.reduce((acc, s) => acc + s.penalty, 0);
    const totalNet = summaries.reduce((acc, s) => acc + s.netPayable, 0);
    const totalWarnings = summaries.reduce((acc, s) => acc + s.warningsCount, 0);

    return {
      totalParticipants,
      totalDocs,
      totalGross,
      totalTarget,
      totalPenalty,
      totalNet,
      totalWarnings,
    };
  }, [summaries]);

  // Filtered Summaries
  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        s.schemeCode.toLowerCase().includes(q) ||
        s.schemeName.toLowerCase().includes(q) ||
        s.division.toLowerCase().includes(q)
      );
    });
  }, [summaries, searchQuery]);

  // Filtered Warnings
  const filteredWarnings = useMemo(() => {
    return warnings.filter((w) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        w.code.toLowerCase().includes(q) ||
        w.schemeCode.toLowerCase().includes(q) ||
        w.participantName.toLowerCase().includes(q) ||
        w.message.toLowerCase().includes(q);

      const matchSeverity = severityFilter === "All" || w.severity === severityFilter;

      return matchSearch && matchSeverity;
    });
  }, [warnings, searchQuery, severityFilter]);

  // Action: Simulate while in Draft
  const handleSimulateRun = () => {
    setIsProcessing(true);
    setProcessingProgress(15);
    setRunType("Simulation");
    setRunNo(
      `RUN-${period.replace(" ", "-").toUpperCase()}-SIM-${Date.now().toString().slice(-4)}`,
    );

    const startTs = new Date().toLocaleTimeString();
    setStarted(`${new Date().toLocaleDateString("en-GB")} ${startTs}`);

    setTimeout(() => setProcessingProgress(45), 400);
    setTimeout(() => setProcessingProgress(80), 900);

    setTimeout(() => {
      setIsProcessing(false);
      setProcessingProgress(100);
      setStatus("Simulated");

      const finishTs = new Date().toLocaleTimeString();
      setFinished(`${new Date().toLocaleDateString("en-GB")} ${finishTs}`);

      const newLog: RunLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: finishTs,
        level: "SUCCESS",
        message: `Simulation calculation finished in 1.4s. 34 participants evaluated across ${summaries.length} schemes.`,
      };
      setLogs((prev) => [newLog, ...prev]);

      toast.success("Simulation Run Complete", {
        description: "Evaluated schemes and generated preliminary payout estimates. Non-binding.",
      });
    }, 1400);
  };

  // Action: Calculate Final when inputs are locked
  const handleCalculateFinal = () => {
    // VALIDATION 1: Final run is blocked unless targets, attendance and service data are locked!
    if (!allInputsLocked) {
      toast.error("Final Run Blocked: Prerequisite Modules Unlocked", {
        description:
          "Final calculation requires Monthly Targets, Attendance Import, and Service Performance Data to be locked and approved. Check Readiness Status.",
        duration: 6000,
      });
      setIsReadinessModalOpen(true);
      return;
    }

    // VALIDATION 2: Only one final run is permitted per scheme per period!
    // Check if there is already an Approved or Posted run
    if (status === "Approved" || status === "Posted" || status === "Locked") {
      toast.error("Duplicate Final Run Blocked", {
        description:
          "A final calculation run has already been approved/posted for this period. Archive or cancel existing run to proceed.",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(20);
    setRunType("Final Calculation");
    setRunNo(`RUN-${period.replace(" ", "-").toUpperCase()}-FIN-01`);

    const startTs = new Date().toLocaleTimeString();
    setStarted(`${new Date().toLocaleDateString("en-GB")} ${startTs}`);

    setTimeout(() => setProcessingProgress(50), 500);
    setTimeout(() => setProcessingProgress(85), 1000);

    setTimeout(() => {
      setIsProcessing(false);
      setProcessingProgress(100);
      setStatus("Calculated");

      const finishTs = new Date().toLocaleTimeString();
      setFinished(`${new Date().toLocaleDateString("en-GB")} ${finishTs}`);

      const newLog: RunLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: finishTs,
        level: "SUCCESS",
        message: `Final Calculation RUN-2026-05-FIN-01 completed. All prerequisite locks validated. Ready for submission.`,
      };
      setLogs((prev) => [newLog, ...prev]);

      toast.success("Final Calculation Run Completed Successfully", {
        description:
          "Locked data ingested. Net Payable pool verified: LKR 3,983,000. Ready to submit for executive approval.",
      });
    }, 1500);
  };

  // Action: Recalculate only when not yet approved
  const handleRecalculate = () => {
    // VALIDATION: Recalculate only when not yet approved!
    if (status === "Approved" || status === "Posted" || status === "Locked") {
      toast.error("Recalculation Prohibited", {
        description:
          "This calculation run has already been approved/posted. Recalculation is permitted only prior to executive approval.",
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStatus("Calculated");
      toast.info("Recalculation complete. Payout figures updated.");
    }, 900);
  };

  // Action: Submit for Approval when Calculated
  const handleSubmitForApproval = () => {
    if (status !== "Calculated") {
      toast.warning("Cannot submit uncalculated run", {
        description: "Execute a Final Calculation before submitting for approval.",
      });
      return;
    }

    setStatus("Submitted");
    setIsSubmitModalOpen(false);

    const submitTs = new Date().toLocaleTimeString();
    const newLog: RunLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: submitTs,
      level: "INFO",
      message: `Run ${runNo} submitted for Executive / Finance Approval by ${runBy}. Notes: ${submissionNotes}`,
    };
    setLogs((prev) => [newLog, ...prev]);

    toast.success("Run Submitted for Executive Approval", {
      description: "Dispatched to Head of Finance and Managing Director approval inbox.",
    });
  };

  // Action: Simulate Executive Approval
  const handleSimulateExecutiveApproval = () => {
    setStatus("Approved");
    toast.success("Run Approved by Head of Finance & CEO", {
      description: "Approved for SAP B1 Journal Voucher posting.",
    });
  };

  // Action: Simulate SAP B1 Posting
  const handleSimulatePosting = () => {
    setStatus("Posted");
    toast.success("Posted to SAP Business One", {
      description: "Journal Voucher #JV-2026-05-092 created in General Ledger.",
    });
  };

  // Action: Simulate Lock Run
  const handleSimulateLock = () => {
    setStatus("Locked");
    toast.success("Calculation Run Locked & Archived", {
      description: "Period closed. Read-only audit state.",
    });
  };

  // Action: Export Excel / PDF
  const handleExport = (format: "Excel" | "PDF") => {
    setIsExportModalOpen(false);
    toast.success(`Exporting ${format} Report for ${runNo}...`, {
      description: `Period: ${period} | File: Incentive_Calculation_${runNo}.${
        format === "Excel" ? "xlsx" : "pdf"
      }`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Quick Navigation Bar to Related Screens                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-lg border text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <PlayCircle size={14} className="text-primary" />
          <span className="font-semibold text-foreground">Incentive Calculation Engine:</span>
          <span className="hidden sm:inline">
            Aggregates targets, biometric attendance factors, and HOD service performance into
            payroll payouts.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateScreen && (
            <>
              {/* PRIMARY PROCEED BUTTON TO CALCULATION RESULTS */}
              <Button
                size="sm"
                onClick={() => onNavigateScreen("calculation-results")}
                className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer shadow-xs"
              >
                <TrendingUp size={13} />
                <span>Calculation Results</span>
                <ChevronRight size={12} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("approval-posting")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <FileCheck size={13} className="text-primary" />
                <span>Approval & Posting</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("service-performance")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <Wrench size={13} className="text-primary" />
                <span>Service Performance</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Top Header & Mandatory Fields Section                      */}
      {/* ------------------------------------------------------------- */}
      <div className="card-surface p-4 sm:p-5 rounded-lg border bg-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Incentive Calculation Run
              </h2>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  status === "Locked" || status === "Posted"
                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                    : status === "Approved"
                      ? "bg-success/10 text-success border-success/30"
                      : status === "Submitted"
                        ? "bg-info/10 text-info border-info/30"
                        : status === "Calculated"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : status === "Simulated"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {status === "Approved" || status === "Posted" || status === "Locked" ? (
                  <CheckCircle2 size={13} />
                ) : status === "Submitted" ? (
                  <Send size={13} />
                ) : status === "Calculated" || status === "Simulated" ? (
                  <PlayCircle size={13} />
                ) : (
                  <Clock size={13} />
                )}
                <span>Status: {status}</span>
              </span>

              {/* Run Type Indicator */}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-muted/60 text-foreground font-semibold">
                {runType}
              </span>

              {/* Role Indicator */}
              <span className="text-[11px] text-muted-foreground">
                Role: <strong className="text-foreground">Incentive Administrator</strong>
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Run the monthly calculation for selected schemes, supporting simulation and final
              calculation.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Readiness Checks */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReadinessModalOpen(true)}
              className={`h-8 gap-1.5 text-xs font-medium cursor-pointer ${
                allInputsLocked
                  ? "text-success border-success/40 bg-success/5"
                  : "text-destructive border-destructive/40 bg-destructive/5"
              }`}
            >
              <Shield size={13} />
              <span>Readiness: {allInputsLocked ? "Inputs Ready" : "Inputs Unlocked"}</span>
            </Button>

            {/* 1. Simulate while in Draft */}
            {(status === "Draft" || status === "Simulated") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateRun}
                disabled={isProcessing}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent text-primary"
              >
                <PlayCircle size={13} className={isProcessing ? "animate-spin" : ""} />
                <span>Simulate Run</span>
              </Button>
            )}

            {/* 2. Calculate Final when inputs are locked */}
            {(status === "Draft" || status === "Simulated") && (
              <Button
                size="sm"
                onClick={handleCalculateFinal}
                disabled={isProcessing}
                className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={13} className={isProcessing ? "animate-spin" : ""} />
                <span>Calculate Final</span>
              </Button>
            )}

            {/* 3. Recalculate only when not yet approved */}
            {(status === "Simulated" || status === "Calculated") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                disabled={isProcessing}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                title="Recalculate with updated inputs before approval"
              >
                <RotateCcw size={13} />
                <span>Recalculate</span>
              </Button>
            )}

            {/* 4. Submit for Approval when Calculated */}
            {status === "Calculated" && (
              <Button
                size="sm"
                onClick={() => setIsSubmitModalOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold bg-success text-success-foreground hover:bg-success/90 cursor-pointer shadow-xs"
              >
                <Send size={13} />
                <span>Submit for Approval</span>
              </Button>
            )}

            {/* Simulation of downstream states for testing */}
            {status === "Submitted" && (
              <Button
                size="sm"
                onClick={handleSimulateExecutiveApproval}
                className="h-8 gap-1.5 text-xs font-semibold bg-success text-success-foreground hover:bg-success/90 cursor-pointer"
              >
                <Check size={13} />
                <span>Approve Run</span>
              </Button>
            )}

            {status === "Approved" && (
              <Button
                size="sm"
                onClick={handleSimulatePosting}
                className="h-8 gap-1.5 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
              >
                <Receipt size={13} />
                <span>Post to SAP B1</span>
              </Button>
            )}

            {status === "Posted" && (
              <Button
                size="sm"
                onClick={handleSimulateLock}
                className="h-8 gap-1.5 text-xs font-semibold bg-muted-foreground text-background hover:bg-foreground cursor-pointer"
              >
                <Lock size={13} />
                <span>Lock Run</span>
              </Button>
            )}

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
            >
              <Download size={13} className="text-muted-foreground" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Processing Indicator Bar */}
        {isProcessing && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium text-primary">
              <span className="flex items-center gap-1.5">
                <PlayCircle size={14} className="animate-spin" />
                <span>Executing Rule Engine Simulation ({runType})...</span>
              </span>
              <span>{processingProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Mandatory Header Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t">
          {/* 1. Run No. (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Run No. <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Unique ID</span>
            </label>
            <input
              type="text"
              readOnly
              value={runNo}
              className="w-full text-xs font-mono font-bold rounded-md border border-input bg-muted/40 px-3 py-2 shadow-xs text-foreground"
            />
          </div>

          {/* 2. Period (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Period <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Cycle</span>
            </label>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setRunNo(`RUN-${e.target.value.replace(" ", "-").toUpperCase()}-PRE-01`);
                toast.info(`Switched run period to ${e.target.value}`);
              }}
              disabled={status !== "Draft" && status !== "Simulated"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium disabled:opacity-75"
            >
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="March 2026">March 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
          </div>

          {/* 3. Division (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Division <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Scope</span>
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              disabled={status !== "Draft" && status !== "Simulated"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-75"
            >
              <option value="All Divisions">All Divisions</option>
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
              <option value="Renewable Energy">Renewable Energy</option>
            </select>
          </div>

          {/* 4. Schemes (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Schemes <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Active Schemes</span>
            </label>
            <select
              value={selectedSchemes}
              onChange={(e) => setSelectedSchemes(e.target.value)}
              disabled={status !== "Draft" && status !== "Simulated"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-75 font-medium"
            >
              <option value="All Active Schemes (4 Schemes)">All Active Schemes (4 Schemes)</option>
              <option value="SCH-SLS-2026 (Retail Showroom)">SCH-SLS-2026 (Retail Showroom)</option>
              <option value="SCH-CAC-2026 (Commercial HVAC)">SCH-CAC-2026 (Commercial HVAC)</option>
              <option value="SCH-SRV-2026 (Service Field Tech)">
                SCH-SRV-2026 (Service Field Tech)
              </option>
              <option value="SCH-SOLAR-2026 (Renewable Energy)">
                SCH-SOLAR-2026 (Renewable Energy)
              </option>
            </select>
          </div>

          {/* 5. Run Type (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Run Type <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Execution Mode</span>
            </label>
            <select
              value={runType}
              onChange={(e) => setRunType(e.target.value as RunType)}
              disabled={status !== "Draft" && status !== "Simulated"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium disabled:opacity-75"
            >
              <option value="Simulation">Simulation (Non-Binding Test)</option>
              <option value="Final Calculation">Final Calculation (Binding Quota)</option>
            </select>
          </div>

          {/* 6. Data Cut-off (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Data Cut-off <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Cutoff Timestamp</span>
            </label>
            <input
              type="text"
              value={dataCutoff}
              onChange={(e) => setDataCutoff(e.target.value)}
              disabled={status !== "Draft" && status !== "Simulated"}
              className="w-full text-xs font-mono rounded-md border border-input bg-background px-3 py-2 shadow-xs disabled:opacity-75"
            />
          </div>

          {/* 7. Run By */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Run By</span>
              <span className="text-[10px] text-muted-foreground">Operator</span>
            </label>
            <input
              type="text"
              readOnly
              value={runBy}
              className="w-full text-xs rounded-md border border-input bg-muted/40 px-3 py-2 shadow-xs text-muted-foreground"
            />
          </div>

          {/* 8. Started & Finished Timing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Execution Timing</span>
              <span className="text-[10px] text-muted-foreground">Runtime: 44s</span>
            </label>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-md border">
              <span>{started.split(" ")[1] || "10:15:20"}</span>
              <span>→</span>
              <span>{finished.split(" ")[1] || "10:16:04"}</span>
            </div>
          </div>
        </div>

        {/* Validation Callout Card */}
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Shield size={14} className="shrink-0" />
              <span>Calculation Run Validation Guardrails</span>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Rule: Single Final Run per Scheme per Period
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-5">
            Final calculations are strictly blocked unless all prerequisite modules (Monthly
            Targets, Attendance, and Service Performance) are locked and verified. Only one final
            calculation run is permitted per scheme for any active monthly billing cycle.
          </p>
        </div>

        {/* KPI Aggregates Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Participants</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{totals.totalParticipants}</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Docs Processed</span>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {totals.totalDocs.toLocaleString()}
            </p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Gross Commission</span>
            <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
              {formatLKR(totals.totalGross)}
            </p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Target Incentive</span>
            <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
              {formatLKR(totals.totalTarget)}
            </p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-destructive font-medium">Debtor Penalties</span>
            <p className="text-sm sm:text-base font-bold text-destructive mt-0.5">
              - {formatLKR(totals.totalPenalty)}
            </p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60 bg-success/5 border-success/30 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-success font-bold">Net Payable Pool</span>
            <p className="text-sm sm:text-base font-bold text-success mt-0.5">
              {formatLKR(totals.totalNet)}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Main Tabs: Participants, Warnings, Log                     */}
      {/* ------------------------------------------------------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="participants" className="text-xs gap-1.5 px-3 py-1.5">
              <Users size={13} />
              <span>Participants by Scheme ({summaries.length})</span>
            </TabsTrigger>
            <TabsTrigger value="warnings" className="text-xs gap-1.5 px-3 py-1.5 relative">
              <AlertTriangle size={13} className={warnings.length > 0 ? "text-amber-500" : ""} />
              <span>Warnings ({warnings.length})</span>
              {warnings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {warnings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="log" className="text-xs gap-1.5 px-3 py-1.5">
              <Terminal size={13} />
              <span>Run Execution Log ({logs.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scheme, code, warning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {activeTab === "warnings" && (
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="h-8 text-xs rounded-md border border-input bg-background px-2.5 shadow-xs"
              >
                <option value="All">All Severities</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* TAB 1: PARTICIPANTS (SCHEME SUMMARY GRID)                   */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="participants" className="space-y-4 m-0">
          <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                    <th className="py-2.5 px-3 min-w-[200px]">Scheme</th>
                    <th className="py-2.5 px-3 text-right">Participants</th>
                    <th className="py-2.5 px-3 text-right">Documents Read</th>
                    <th className="py-2.5 px-3 text-right">Gross Commission</th>
                    <th className="py-2.5 px-3 text-right">Target Incentive</th>
                    <th className="py-2.5 px-3 text-right text-destructive">Penalty</th>
                    <th className="py-2.5 px-3 text-right text-success font-bold">Net Payable</th>
                    <th className="py-2.5 px-3 text-center">Warnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No schemes match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredSummaries.map((item) => (
                      <tr key={item.schemeCode} className="hover:bg-muted/30 transition-colors">
                        {/* Scheme */}
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          <div className="font-semibold">{item.schemeName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-primary font-bold">
                              {item.schemeCode}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              · {item.division}
                            </span>
                          </div>
                        </td>

                        {/* Participants */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          {item.participants}
                        </td>

                        {/* Documents Read */}
                        <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                          {item.documentsRead.toLocaleString()}
                        </td>

                        {/* Gross Commission */}
                        <td className="py-2.5 px-3 text-right font-mono text-foreground">
                          {formatLKR(item.grossCommission)}
                        </td>

                        {/* Target Incentive */}
                        <td className="py-2.5 px-3 text-right font-mono text-foreground">
                          {formatLKR(item.targetIncentive)}
                        </td>

                        {/* Penalty */}
                        <td className="py-2.5 px-3 text-right font-mono text-destructive">
                          {item.penalty > 0 ? `- ${formatLKR(item.penalty)}` : "—"}
                        </td>

                        {/* Net Payable */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-success text-sm">
                          {formatLKR(item.netPayable)}
                        </td>

                        {/* Warnings */}
                        <td className="py-2.5 px-3 text-center">
                          {item.warningsCount > 0 ? (
                            <button
                              onClick={() => {
                                setSearchQuery(item.schemeCode);
                                setActiveTab("warnings");
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                              title="Click to view warning details"
                            >
                              <AlertTriangle size={12} />
                              <span>{item.warningsCount} warnings</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                              <CheckCircle2 size={12} />
                              <span>Clean</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/40 p-3 border-t flex flex-wrap items-center justify-between text-xs text-muted-foreground">
              <div>
                Total <strong>{totals.totalParticipants}</strong> enrolled participants across{" "}
                <strong>{summaries.length}</strong> calculation schemes.
              </div>
              <div className="flex items-center gap-3">
                <span>
                  Total Net Outflow:{" "}
                  <strong className="text-success">{formatLKR(totals.totalNet)}</strong>
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: WARNINGS                                             */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="warnings" className="space-y-4 m-0">
          <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                    <th className="py-2.5 px-3 w-28">Warning Code</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Scheme</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Participant</th>
                    <th className="py-2.5 px-3 w-24 text-center">Severity</th>
                    <th className="py-2.5 px-3">Warning Message & Context</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredWarnings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No warnings found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredWarnings.map((w) => (
                      <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          {w.code}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-primary font-medium">
                          {w.schemeCode}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {w.participantName}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.severity === "High"
                                ? "bg-destructive/15 text-destructive"
                                : w.severity === "Medium"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {w.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground leading-relaxed">
                          {w.message}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground text-[11px] leading-relaxed">
                          {w.remediation}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------- */}
        {/* TAB 3: RUN LOG                                              */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="log" className="space-y-4 m-0">
          <div className="card-surface p-4 rounded-lg border bg-zinc-950 text-zinc-100 font-mono text-xs space-y-2 shadow-inner max-h-[480px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-primary" />
                <span>Execution Trace: {runNo}</span>
              </div>
              <span>Engine v4.2.1-prod</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-zinc-500 select-none text-[11px] shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`font-bold text-[10px] px-1 rounded shrink-0 ${
                      log.level === "SUCCESS"
                        ? "bg-emerald-950 text-emerald-400"
                        : log.level === "WARN"
                          ? "bg-amber-950 text-amber-400"
                          : log.level === "DEBUG"
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-blue-950 text-blue-400"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span
                    className={
                      log.level === "SUCCESS"
                        ? "text-emerald-300"
                        : log.level === "WARN"
                          ? "text-amber-300"
                          : "text-zinc-200"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------------------------------------- */}
      {/* 4. Modals                                                     */}
      {/* ------------------------------------------------------------- */}

      {/* MODAL: Readiness Checks Inspector */}
      {isReadinessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">
                  Calculation Run Input Readiness Checks
                </h3>
              </div>
              <button
                onClick={() => setIsReadinessModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Before executing a <strong>Final Calculation Run</strong>, all prerequisite input
                modules must be fully locked and approved by authorized department heads.
              </p>

              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                      <th className="p-2.5">Input Module</th>
                      <th className="p-2.5">Required State</th>
                      <th className="p-2.5">Current State</th>
                      <th className="p-2.5">Authorizing Officer</th>
                      <th className="p-2.5 text-center">Ready</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {readiness.map((chk) => (
                      <tr key={chk.id} className="hover:bg-muted/30">
                        <td className="p-2.5 font-semibold text-foreground">{chk.moduleName}</td>
                        <td className="p-2.5 text-muted-foreground font-mono">
                          {chk.requiredState}
                        </td>
                        <td className="p-2.5 font-medium">{chk.currentState}</td>
                        <td className="p-2.5">
                          <div className="text-foreground">{chk.signer}</div>
                          <span className="text-[10px] text-muted-foreground">
                            {chk.lastUpdated}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          {chk.isReady ? (
                            <span className="inline-flex items-center gap-1 text-success font-bold">
                              <CheckCircle2 size={14} />
                              <span>Ready</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive font-bold">
                              <AlertCircle size={14} />
                              <span>Open</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Toggle Readiness for Testing Demo Validations */}
              <div className="p-3 bg-muted/30 rounded-md border text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-foreground">
                    Simulation Toggle: Module Locks
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Toggle prerequisite locks to test the blocked validation rule.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toggled = readiness.map((r, i) =>
                      i === 1 ? { ...r, isReady: !r.isReady } : r,
                    );
                    setReadiness(toggled);
                    toast.info(`Toggled Attendance Import lock state.`);
                  }}
                  className="text-xs h-7"
                >
                  Toggle Attendance Lock
                </Button>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReadinessModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Submit for Approval Dialog */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">
                  Submit Calculation for Executive Approval
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-md border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Run No:</span>
                  <span className="font-mono font-bold text-foreground">{runNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-bold text-foreground">{period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Net Payable:</span>
                  <span className="font-bold text-success text-sm">
                    {formatLKR(totals.totalNet)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipients:</span>
                  <span className="font-medium text-foreground">Head of Finance & CEO</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">
                  Submission Notes <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Once submitted, this run moves to <strong>Submitted</strong> status. Further quota
                modifications are locked until approved or returned for review.
              </p>
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitForApproval}
                className="text-xs bg-success text-success-foreground font-semibold hover:bg-success/90"
              >
                Confirm Submission
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Export Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">Export Calculation Run</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-muted-foreground">
                Export calculation run summary for {runNo} ({period}):
              </p>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport("Excel")}
                  className="w-full justify-start gap-2 h-10 text-xs"
                >
                  <FileSpreadsheet size={15} className="text-success" />
                  <div className="text-left">
                    <div className="font-semibold">Excel Run Schedule (.xlsx)</div>
                    <div className="text-[10px] text-muted-foreground">
                      Full participant lines, gross, penalties, and net payable
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleExport("PDF")}
                  className="w-full justify-start gap-2 h-10 text-xs"
                >
                  <Printer size={15} className="text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Executive Run Summary (.pdf)</div>
                    <div className="text-[10px] text-muted-foreground">
                      Approval ready report for Finance & Director sign-off
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
