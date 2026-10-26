import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  ArrowLeft,
  Shield,
  Calendar,
  Layers,
  ChevronRight,
  Lock,
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
  Users,
  Building2,
  TrendingUp,
  Award,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Eye,
  Send,
  FileCheck,
  Receipt,
  Database,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/incentive-data";

export type RunStatus =
  | "Draft"
  | "Simulated"
  | "Calculated"
  | "Submitted"
  | "Approved"
  | "Posted"
  | "Locked";

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

export interface CalculationRunItem {
  id: string;
  runNo: string;
  period: string;
  division: string;
  selectedSchemes: string;
  runType: RunType;
  dataCutoff: string;
  status: RunStatus;
  runBy: string;
  startedAt?: string;
  finishedAt?: string;
  totalParticipants: number;
  totalDocsRead: number;
  totalGrossCommission: number;
  totalTargetIncentive: number;
  totalPenalty: number;
  totalNetPayable: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  readinessChecks?: ReadinessCheck[];
  schemeSummaries?: SchemeRunSummary[];
  warnings?: RunWarning[];
  logs?: RunLogEntry[];
}

const DEFAULT_READINESS: ReadinessCheck[] = [
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

const DEFAULT_SCHEME_SUMMARIES: SchemeRunSummary[] = [
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

interface IncentiveCalculationRunViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function IncentiveCalculationRunView({
  onNavigateScreen,
  onBack,
}: IncentiveCalculationRunViewProps) {
  // Database States
  const [runs, setRuns] = useState<CalculationRunItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Selected Run for View/Edit/Delete
  const [activeRun, setActiveRun] = useState<CalculationRunItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    runNo: `RUN-2026-06-SIM-01`,
    period: "June 2026",
    division: "All Divisions",
    selectedSchemes: "All Active Schemes (4 Schemes)",
    runType: "Simulation" as RunType,
    dataCutoff: "2026-06-30 23:59:59",
    notes: "Scheduled calculation cycle",
    runBy: "Lakmal Perera (Incentive Administrator)",
  });

  // Edit Form State (All run parameters editable)
  const [editForm, setEditForm] = useState({
    id: "",
    runNo: "",
    period: "June 2026",
    division: "All Divisions",
    selectedSchemes: "All Active Schemes (4 Schemes)",
    runType: "Simulation" as RunType,
    dataCutoff: "2026-06-30 23:59:59",
    status: "Draft" as RunStatus,
    runBy: "Lakmal Perera (Incentive Administrator)",
    totalParticipants: 0,
    totalDocsRead: 0,
    totalGrossCommission: 0,
    totalTargetIncentive: 0,
    totalPenalty: 0,
    totalNetPayable: 0,
    notes: "",
  });

  // Load Calculation Runs from PostgreSQL API
  const loadRunsFromDb = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/calculation-runs");
      const data = await res.json();

      if (data && data.success && Array.isArray(data.runs)) {
        setRuns(data.runs);
        setIsDbConnected(true);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        setIsDbConnected(false);
      }
    } catch (err: any) {
      console.warn("Failed to load calculation runs:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRunsFromDb();
  }, [loadRunsFromDb]);

  // Aggregated KPI Stats
  const stats = useMemo(() => {
    const totalRuns = runs.length;
    const simulatedRuns = runs.filter((r) => r.status === "Simulated" || r.status === "Draft").length;
    const pendingApprovalRuns = runs.filter((r) => r.status === "Calculated" || r.status === "Submitted").length;
    const approvedPostedRuns = runs.filter((r) => r.status === "Approved" || r.status === "Posted" || r.status === "Locked").length;
    const totalNetPayout = runs.reduce((acc, r) => acc + (Number(r.totalNetPayable) || 0), 0);
    const totalParticipants = runs.reduce((acc, r) => acc + (Number(r.totalParticipants) || 0), 0);

    return {
      totalRuns,
      simulatedRuns,
      pendingApprovalRuns,
      approvedPostedRuns,
      totalNetPayout,
      totalParticipants,
    };
  }, [runs]);

  // Filtered List
  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.runNo.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.division.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q);

      const matchPeriod = selectedPeriod === "All" || r.period === selectedPeriod;
      const matchStatus = selectedStatus === "All" || r.status === selectedStatus;

      return matchSearch && matchPeriod && matchStatus;
    });
  }, [runs, searchTerm, selectedPeriod, selectedStatus]);

  // CREATE: Submit new run to PostgreSQL
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.runNo.trim()) {
      toast.error("Run Number is required.");
      return;
    }

    try {
      setIsProcessing(true);
      const grossComm = 2865000;
      const targetBonus = 1240000;
      const penaltyAmt = 122000;
      const netPayable = grossComm + targetBonus - penaltyAmt;

      const payload = {
        id: createForm.runNo.trim(),
        runNo: createForm.runNo.trim(),
        period: createForm.period,
        division: createForm.division,
        selectedSchemes: createForm.selectedSchemes,
        runType: createForm.runType,
        dataCutoff: createForm.dataCutoff,
        status: createForm.runType === "Simulation" ? ("Simulated" as RunStatus) : ("Calculated" as RunStatus),
        runBy: createForm.runBy,
        startedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        finishedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        totalParticipants: 34,
        totalDocsRead: 1735,
        totalGrossCommission: grossComm,
        totalTargetIncentive: targetBonus,
        totalPenalty: penaltyAmt,
        totalNetPayable: netPayable,
        notes: createForm.notes,
        readinessChecks: DEFAULT_READINESS,
        schemeSummaries: DEFAULT_SCHEME_SUMMARIES,
        warnings: [
          {
            id: `wrn-${Date.now()}-1`,
            code: "WRN-ATT-01",
            schemeCode: "SCH-SRV-2026",
            participantName: "Dilshan Madusanka (EMP-1024)",
            severity: "High" as const,
            message: "Unapproved leave proration applied (0% factor).",
            remediation: "Verify with HR before final sign-off.",
          },
        ],
        logs: [
          {
            id: `log-${Date.now()}-1`,
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO" as const,
            message: `Calculation run initialized by ${createForm.runBy} for period ${createForm.period}.`,
          },
          {
            id: `log-${Date.now()}-2`,
            timestamp: new Date().toLocaleTimeString(),
            level: "SUCCESS" as const,
            message: `Evaluated 4 active schemes. Total Net Pool: LKR ${netPayable.toLocaleString()}.`,
          },
        ],
      };

      const res = await apiFetch("/api/incentives/calculation-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Successfully created Calculation Run ${createForm.runNo}!`, {
          description: `Status: ${payload.status} · Net Pool: LKR ${netPayable.toLocaleString()}`,
        });
        setIsCreateModalOpen(false);
        await loadRunsFromDb();
      } else {
        toast.error("Failed to create calculation run.");
      }
    } catch (err: any) {
      console.error("Create error:", err);
      toast.error("Error creating calculation run in database.");
    } finally {
      setIsProcessing(false);
    }
  };

  // UPDATE: Open edit modal
  const handleOpenEdit = (run: CalculationRunItem) => {
    setActiveRun(run);
    setEditForm({
      id: run.id,
      runNo: run.runNo || run.id,
      period: run.period || "June 2026",
      division: run.division || "All Divisions",
      selectedSchemes: run.selectedSchemes || "All Active Schemes (4 Schemes)",
      runType: run.runType || "Simulation",
      dataCutoff: run.dataCutoff || "2026-06-30 23:59:59",
      status: run.status || "Draft",
      runBy: run.runBy || "Lakmal Perera (Incentive Administrator)",
      totalParticipants: Number(run.totalParticipants) || 0,
      totalDocsRead: Number(run.totalDocsRead) || 0,
      totalGrossCommission: Number(run.totalGrossCommission) || 0,
      totalTargetIncentive: Number(run.totalTargetIncentive) || 0,
      totalPenalty: Number(run.totalPenalty) || 0,
      totalNetPayable: Number(run.totalNetPayable) || 0,
      notes: run.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // UPDATE: Submit edit to PostgreSQL
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/calculation-runs/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: editForm.period,
          division: editForm.division,
          selectedSchemes: editForm.selectedSchemes,
          runType: editForm.runType,
          dataCutoff: editForm.dataCutoff,
          status: editForm.status,
          runBy: editForm.runBy,
          totalParticipants: Number(editForm.totalParticipants) || 0,
          totalDocsRead: Number(editForm.totalDocsRead) || 0,
          totalGrossCommission: Number(editForm.totalGrossCommission) || 0,
          totalTargetIncentive: Number(editForm.totalTargetIncentive) || 0,
          totalPenalty: Number(editForm.totalPenalty) || 0,
          totalNetPayable: Number(editForm.totalNetPayable) || 0,
          notes: editForm.notes,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Updated Calculation Run ${editForm.runNo || editForm.id}!`, {
          description: "All parameters and financial pool updated in PostgreSQL.",
        });
        setIsEditModalOpen(false);
        await loadRunsFromDb();
      } else {
        toast.error("Failed to update calculation run.");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error("Error updating calculation run in database.");
    } finally {
      setIsProcessing(false);
    }
  };

  // UPDATE: Status Transition (PATCH)
  const handleStatusTransition = async (runId: string, newStatus: RunStatus, notesMsg?: string) => {
    try {
      const res = await apiFetch(`/api/incentives/calculation-runs/${runId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: notesMsg || `Status transitioned to ${newStatus}`,
          actorName: "Incentive Administrator",
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Run ${runId} status changed to ${newStatus}!`);
        await loadRunsFromDb();
        if (activeRun && activeRun.id === runId) {
          setActiveRun((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        toast.error("Failed to update run status.");
      }
    } catch (err: any) {
      console.error("Status error:", err);
      toast.error("Error updating status in database.");
    }
  };

  // DELETE: Prompt delete modal
  const handleOpenDelete = (run: CalculationRunItem) => {
    setActiveRun(run);
    setIsDeleteModalOpen(true);
  };

  // DELETE: Execute delete in PostgreSQL
  const handleDeleteConfirm = async () => {
    if (!activeRun) return;

    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/calculation-runs/${activeRun.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Deleted Calculation Run ${activeRun.id} from PostgreSQL.`);
        setIsDeleteModalOpen(false);
        setActiveRun(null);
        await loadRunsFromDb();
      } else {
        toast.error("Failed to delete calculation run.");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Error deleting calculation run.");
    } finally {
      setIsProcessing(false);
    }
  };

  // VIEW: Drilldown
  const handleOpenView = (run: CalculationRunItem) => {
    setActiveRun(run);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Breadcrumbs & Quick Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>All Incentive Screens</span>
            </Button>
          )}
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded">
            Screen #09 · Processing &amp; Runs
          </span>
        </div>

        {/* Quick jump navigation */}
        {onNavigateScreen && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onNavigateScreen("calculation-results")}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer"
            >
              <TrendingUp size={13} />
              <span>Calculation Results</span>
              <ChevronRight size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen("approval-posting")}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <FileCheck size={13} className="text-primary" />
              <span>Approval &amp; Posting</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen("service-performance")}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <span>Service Performance</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2. PostgreSQL Live Connection Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-xs ${
          isDbConnected
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300"
            : "bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Database size={15} className={isDbConnected ? "text-emerald-600" : "text-amber-600"} />
          <span className="font-semibold">
            {isDbConnected
              ? "PostgreSQL Live Database Connected (telesonic)"
              : "PostgreSQL Database Disconnected / Local Mode"}
          </span>
          <span className="hidden sm:inline text-muted-foreground">·</span>
          <span className="hidden sm:inline text-muted-foreground font-mono">
            Table: incentive_calculation_runs ({runs.length} runs loaded)
          </span>
          {lastSynced && (
            <span className="hidden md:inline text-[11px] opacity-75">
              (Last synced: {lastSynced})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadRunsFromDb()}
            disabled={isLoading}
            className="h-6 text-xs px-2 gap-1 cursor-pointer"
          >
            <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
            <span>Sync from DB</span>
          </Button>
        </div>
      </div>

      {/* 3. Screen Title & Action Bar */}
      <div className="card-surface p-5 sm:p-6 rounded-lg border bg-card shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <PlayCircle size={24} />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Incentive Calculation Runs
                </h1>
                <span className="rounded-md bg-primary-soft text-primary px-2.5 py-0.5 text-xs font-semibold">
                  Batch Engine v4.2
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Telesonic Lanka · Manage calculation runs, execute simulations, compute official quotas, and submit for executive sign-off.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Readiness Checks Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReadinessModalOpen(true)}
              className="h-9 gap-1.5 text-xs font-medium cursor-pointer border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300"
            >
              <Shield size={14} className="text-emerald-600" />
              <span>Readiness: Inputs Locked</span>
            </Button>

            {/* CREATE NEW RUN BUTTON */}
            <Button
              size="sm"
              onClick={() => {
                setCreateForm({
                  runNo: `RUN-2026-06-SIM-${Date.now().toString().slice(-4)}`,
                  period: "June 2026",
                  division: "All Divisions",
                  selectedSchemes: "All Active Schemes (4 Schemes)",
                  runType: "Simulation",
                  dataCutoff: "2026-06-30 23:59:59",
                  notes: "Monthly calculation cycle execution",
                  runBy: "Lakmal Perera (Incentive Administrator)",
                });
                setIsCreateModalOpen(true);
              }}
              className="h-9 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>New Calculation Run</span>
            </Button>
          </div>
        </div>

        {/* 4. Aggregated KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Total Runs Recorded
            </span>
            <span className="text-2xl font-bold text-foreground font-mono">{stats.totalRuns}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Active Simulations
            </span>
            <span className="text-2xl font-bold text-amber-600 font-mono">{stats.simulatedRuns}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Approved / Posted Runs
            </span>
            <span className="text-2xl font-bold text-emerald-600 font-mono">{stats.approvedPostedRuns}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Total Net Payout Pool
            </span>
            <span className="text-2xl font-bold text-primary font-mono">
              LKR {formatCurrency(stats.totalNetPayout)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Search and Filters Bar */}
      <div className="card-surface p-4 rounded-lg border bg-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Run ID, Period, Division, Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 text-xs h-9 w-full bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field h-9 text-xs bg-card"
          >
            <option value="All">All Periods</option>
            <option value="May 2026">May 2026</option>
            <option value="April 2026">April 2026</option>
            <option value="June 2026">June 2026</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field h-9 text-xs bg-card"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Simulated">Simulated</option>
            <option value="Calculated">Calculated</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Posted">Posted</option>
            <option value="Locked">Locked</option>
          </select>
        </div>
      </div>

      {/* 6. MAIN CRUD RUNS TABLE */}
      <div className="card-surface overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b bg-muted/50 text-left font-semibold text-muted-foreground">
                <th className="px-4 py-3">Run ID &amp; Type</th>
                <th className="px-4 py-3">Period &amp; Division</th>
                <th className="px-4 py-3 text-center">Participants</th>
                <th className="px-4 py-3 text-right">Gross Commission</th>
                <th className="px-4 py-3 text-right">Target Bonus</th>
                <th className="px-4 py-3 text-right">Penalties</th>
                <th className="px-4 py-3 text-right font-bold text-foreground">Net Payable Pool</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRuns.map((r) => {
                const isFinal = r.runType === "Final Calculation";

                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Run ID & Type */}
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs font-bold text-primary">{r.runNo || r.id}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              isFinal
                                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {r.runType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Period & Division */}
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="font-semibold text-foreground text-xs">{r.period}</div>
                      <div className="text-[11px] text-muted-foreground">{r.division}</div>
                    </td>

                    {/* Participants & Docs */}
                    <td className="px-4 py-3 text-center font-mono">
                      <div className="font-bold text-foreground">{r.totalParticipants} techs</div>
                      <div className="text-[10px] text-muted-foreground">{r.totalDocsRead || 1735} docs</div>
                    </td>

                    {/* Gross Commission */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                      LKR {formatCurrency(r.totalGrossCommission)}
                    </td>

                    {/* Target Bonus */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-primary font-medium">
                      LKR {formatCurrency(r.totalTargetIncentive)}
                    </td>

                    {/* Penalties */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-destructive">
                      -LKR {formatCurrency(r.totalPenalty)}
                    </td>

                    {/* Net Payable */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-foreground text-sm">
                      LKR {formatCurrency(r.totalNetPayable)}
                    </td>

                    {/* Status Dropdown / Badge */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusTransition(
                            r.id,
                            e.target.value as RunStatus,
                            `Status updated manually from table to ${e.target.value}`
                          )
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded border cursor-pointer ${
                          r.status === "Approved" || r.status === "Posted" || r.status === "Locked"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-300"
                            : r.status === "Submitted"
                            ? "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/20 dark:text-blue-300"
                            : r.status === "Calculated"
                            ? "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/20 dark:text-indigo-300"
                            : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/20 dark:text-amber-300"
                        }`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Simulated">Simulated</option>
                        <option value="Calculated">Calculated</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Approved">Approved</option>
                        <option value="Posted">Posted</option>
                        <option value="Locked">Locked</option>
                      </select>
                    </td>

                    {/* CRUD Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. READ / Drilldown */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(r)}
                          className="h-7 w-7 p-0 cursor-pointer text-primary hover:bg-primary/10"
                          title="View Run Details & Scheme Breakdown"
                        >
                          <Eye size={14} />
                        </Button>

                        {/* 2. UPDATE / Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(r)}
                          className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit Run Parameters"
                        >
                          <Edit2 size={13} />
                        </Button>

                        {/* 3. EXECUTE / Recalculate */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast.info(`Recalculating quotas for ${r.id}...`);
                            handleStatusTransition(r.id, "Calculated", "Recalculated quotas from latest data");
                          }}
                          className="h-7 w-7 p-0 cursor-pointer text-emerald-600 hover:bg-emerald-50"
                          title="Recalculate Run"
                        >
                          <RotateCcw size={13} />
                        </Button>

                        {/* 4. DELETE */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(r)}
                          className="h-7 w-7 p-0 cursor-pointer text-destructive hover:bg-destructive/10"
                          title="Delete Calculation Run"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRuns.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-xs">
            No calculation runs match your filter settings. Click <strong>"New Calculation Run"</strong> to create one.
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: CREATE NEW CALCULATION RUN (CREATE)                   */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-xl rounded-xl border bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <PlayCircle size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">New Incentive Calculation Run</h3>
                  <p className="text-xs text-muted-foreground">
                    Initialize a new calculation cycle for all active schemes.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Run Number (ID) *</label>
                  <input
                    type="text"
                    required
                    value={createForm.runNo}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, runNo: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Calculation Period *</label>
                  <select
                    value={createForm.period}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, period: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  >
                    <option value="June 2026">June 2026</option>
                    <option value="May 2026">May 2026</option>
                    <option value="April 2026">April 2026</option>
                    <option value="July 2026">July 2026</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Division Scope</label>
                  <select
                    value={createForm.division}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, division: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  >
                    <option value="All Divisions">All Divisions</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Execution Mode</label>
                  <select
                    value={createForm.runType}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, runType: e.target.value as RunType }))}
                    className="input-field w-full h-8 text-xs bg-card font-medium"
                  >
                    <option value="Simulation">Simulation Run (Preliminary &amp; Non-binding)</option>
                    <option value="Final Calculation">Final Calculation (Official Quota Run)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Selected Schemes</label>
                <input
                  type="text"
                  value={createForm.selectedSchemes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, selectedSchemes: e.target.value }))}
                  className="input-field w-full h-8 text-xs bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Data Cut-Off Date</label>
                  <input
                    type="text"
                    value={createForm.dataCutoff}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, dataCutoff: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Operator / Run By</label>
                  <input
                    type="text"
                    value={createForm.runBy}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, runBy: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Run Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="input-field w-full p-2 text-xs bg-card"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />}
                  <span>Execute &amp; Save Run</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT CALCULATION RUN (UPDATE ALL ATTRIBUTES)          */}
      {/* ============================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Edit2 size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">Edit Calculation Run: {editForm.runNo || editForm.id}</h3>
                  <p className="text-xs text-muted-foreground">Modify run scope, parameters, operators, financial breakdown, and notes.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Section 1: Scope & Parameters */}
              <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  1. Run Parameters &amp; Scope
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Run Reference ID</label>
                    <input
                      type="text"
                      disabled
                      value={editForm.runNo || editForm.id}
                      className="input-field w-full h-8 text-xs font-mono bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Calculation Period *</label>
                    <select
                      value={editForm.period}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, period: e.target.value }))}
                      className="input-field w-full h-8 text-xs bg-card"
                    >
                      <option value="June 2026">June 2026</option>
                      <option value="May 2026">May 2026</option>
                      <option value="April 2026">April 2026</option>
                      <option value="July 2026">July 2026</option>
                      <option value="Q2 2026">Q2 2026</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Division Scope</label>
                    <select
                      value={editForm.division}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, division: e.target.value }))}
                      className="input-field w-full h-8 text-xs bg-card"
                    >
                      <option value="All Divisions">All Divisions</option>
                      <option value="Consumer Electronics">Consumer Electronics</option>
                      <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
                      <option value="Renewable Energy">Renewable Energy</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Execution Mode</label>
                    <select
                      value={editForm.runType}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, runType: e.target.value as RunType }))}
                      className="input-field w-full h-8 text-xs bg-card font-medium"
                    >
                      <option value="Simulation">Simulation Run (Preliminary &amp; Non-binding)</option>
                      <option value="Final Calculation">Final Calculation (Official Quota Run)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Selected Schemes</label>
                  <input
                    type="text"
                    value={editForm.selectedSchemes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, selectedSchemes: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                    placeholder="e.g. All Active Schemes (4 Schemes)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Data Cut-Off Date</label>
                    <input
                      type="text"
                      value={editForm.dataCutoff}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, dataCutoff: e.target.value }))}
                      className="input-field w-full h-8 text-xs font-mono bg-card"
                      placeholder="YYYY-MM-DD HH:MM:SS"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Operator / Run By</label>
                    <input
                      type="text"
                      value={editForm.runBy}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, runBy: e.target.value }))}
                      className="input-field w-full h-8 text-xs bg-card"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as RunStatus }))}
                    className="input-field w-full h-8 text-xs bg-card font-semibold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Simulated">Simulated</option>
                    <option value="Calculated">Calculated</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Posted">Posted</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Financial Pool & Metrics */}
              <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    2. Calculation Metrics &amp; Financial Pool
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const net = Number(editForm.totalGrossCommission) + Number(editForm.totalTargetIncentive) - Number(editForm.totalPenalty);
                      setEditForm((prev) => ({ ...prev, totalNetPayable: net }));
                      toast.info(`Recalculated Net Pool: LKR ${net.toLocaleString()}`);
                    }}
                    className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} /> Auto-compute Net Pool
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Total Eligible Participants</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.totalParticipants}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, totalParticipants: parseInt(e.target.value) || 0 }))}
                      className="input-field w-full h-8 text-xs bg-card font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Documents / Jobs Evaluated</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.totalDocsRead}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, totalDocsRead: parseInt(e.target.value) || 0 }))}
                      className="input-field w-full h-8 text-xs bg-card font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Gross Commission (LKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.totalGrossCommission}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, totalGrossCommission: parseFloat(e.target.value) || 0 }))}
                      className="input-field w-full h-8 text-xs bg-card font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Target Bonus (LKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.totalTargetIncentive}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, totalTargetIncentive: parseFloat(e.target.value) || 0 }))}
                      className="input-field w-full h-8 text-xs bg-card font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Penalty Deductions (LKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.totalPenalty}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, totalPenalty: parseFloat(e.target.value) || 0 }))}
                      className="input-field w-full h-8 text-xs bg-card font-mono text-destructive"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Net Payable Pool (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.totalNetPayable}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, totalNetPayable: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full h-8 text-xs bg-card font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Section 3: Notes & Remarks */}
              <div>
                <label className="font-semibold block mb-1">Run Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="input-field w-full p-2 text-xs bg-card"
                  placeholder="Add remarks or justification for this run..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isProcessing} className="bg-primary text-primary-foreground font-semibold">
                  {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RUN DETAILS & SCHEME BREAKDOWN (READ DRILLDOWN)       */}
      {/* ============================================================== */}
      {isViewModalOpen && activeRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-3xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <PlayCircle size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{activeRun.runNo || activeRun.id}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted border text-foreground">
                      {activeRun.period}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                      {activeRun.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeRun.division} · {activeRun.runType} · Executed by {activeRun.runBy}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsViewModalOpen(false)} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-lg border text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Gross Commission</span>
                <span className="font-bold text-foreground font-mono">
                  LKR {formatCurrency(activeRun.totalGrossCommission)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Target Bonus</span>
                <span className="font-bold text-primary font-mono">
                  +LKR {formatCurrency(activeRun.totalTargetIncentive)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Penalties &amp; Clawbacks</span>
                <span className="font-bold text-destructive font-mono">
                  -LKR {formatCurrency(activeRun.totalPenalty)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Net Payable Pool</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">
                  LKR {formatCurrency(activeRun.totalNetPayable)}
                </span>
              </div>
            </div>

            {/* Scheme Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Active Scheme Payout Breakdown
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b text-left text-muted-foreground">
                    <tr>
                      <th className="p-2">Scheme Name</th>
                      <th className="p-2 text-center">Techs</th>
                      <th className="p-2 text-right">Gross Comm.</th>
                      <th className="p-2 text-right">Target Bonus</th>
                      <th className="p-2 text-right">Net Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(activeRun.schemeSummaries && activeRun.schemeSummaries.length > 0
                      ? activeRun.schemeSummaries
                      : DEFAULT_SCHEME_SUMMARIES
                    ).map((s, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-2 font-medium">
                          <div>{s.schemeName}</div>
                          <span className="font-mono text-[10px] text-muted-foreground">{s.schemeCode}</span>
                        </td>
                        <td className="p-2 text-center font-mono">{s.participants}</td>
                        <td className="p-2 text-right font-mono">LKR {formatCurrency(s.grossCommission)}</td>
                        <td className="p-2 text-right font-mono text-primary">+LKR {formatCurrency(s.targetIncentive)}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-600">
                          LKR {formatCurrency(s.netPayable)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Transition Pipeline Controls */}
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Lifecycle Action: Transition run through approval stages
              </div>
              <div className="flex items-center gap-2">
                {activeRun.status === "Calculated" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusTransition(activeRun.id, "Submitted", "Submitted to Head of Finance")}
                    className="h-8 gap-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Submit for Approval</span>
                  </Button>
                )}
                {activeRun.status === "Submitted" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusTransition(activeRun.id, "Approved", "Approved by CEO and Head of Finance")}
                    className="h-8 gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Approve Run</span>
                  </Button>
                )}
                {activeRun.status === "Approved" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusTransition(activeRun.id, "Posted", "Posted to SAP B1 GL")}
                    className="h-8 gap-1.5 text-xs bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                  >
                    <Receipt size={13} />
                    <span>Post to SAP B1</span>
                  </Button>
                )}
                {activeRun.status === "Posted" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusTransition(activeRun.id, "Locked", "Locked for audit")}
                    className="h-8 gap-1.5 text-xs bg-muted-foreground text-background cursor-pointer"
                  >
                    <Lock size={13} />
                    <span>Lock Run</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                  Close Drilldown
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION DIALOG (DELETE)                   */}
      {/* ============================================================== */}
      {isDeleteModalOpen && activeRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-destructive text-destructive-foreground">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="font-bold text-base text-foreground">Delete Calculation Run?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Are you sure you want to permanently delete calculation run <strong>{activeRun.id}</strong> ({activeRun.period}) from PostgreSQL? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isProcessing}
                className="gap-1.5"
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete Run</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: READINESS STATUS CHECKLIST                            */}
      {/* ============================================================== */}
      {isReadinessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-xl rounded-xl border bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-600 text-white">
                  <Shield size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">Pre-Execution Readiness Status</h3>
                  <p className="text-xs text-muted-foreground">
                    Validation checks ensuring prerequisite modules are locked prior to final quota computation.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsReadinessModalOpen(false)} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-2.5">
              {DEFAULT_READINESS.map((chk) => (
                <div key={chk.id} className="p-3 rounded-lg border bg-muted/40 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{chk.moduleName}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Required: {chk.requiredState} · Signer: {chk.signer}
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded text-[11px]">
                    {chk.currentState}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button size="sm" onClick={() => setIsReadinessModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
