import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Send,
  ShieldCheck,
  Building,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Download,
  Lock,
  Unlock,
  Receipt,
  FileCheck,
  TrendingUp,
  X,
  History,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/incentive-data";

export type ApprovalPackageStatus = "Submitted" | "Approved" | "Posted" | "Locked" | "Rejected";
export type StepDecision = "Pending" | "Approved" | "Rejected" | "Skipped";

export interface ApprovalStepItem {
  id: string;
  batchId: string;
  stepNumber: number;
  roleName: string;
  approverName: string;
  decision: StepDecision;
  decidedAt?: string;
  comments?: string;
}

export interface PostingPreviewLine {
  id: string;
  batchId: string;
  lineNo: number;
  divisionCostCentre: string;
  glExpenseAccount: string;
  glExpenseName: string;
  glPayableAccount: string;
  glPayableName: string;
  amount: number;
  dimension: string;
}

export interface ApprovalBatchHistoryItem {
  id: string;
  batchId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface ApprovalBatchDetails {
  id: string;
  runNo: string;
  period: string;
  division: string;
  totalPayable: number;
  postingMethod: string;
  accrualJe?: string;
  payrollFile?: string;
  status: ApprovalPackageStatus;
  currentStep: number;
  totalSteps: number;
  notes?: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  steps: ApprovalStepItem[];
  postingLines: PostingPreviewLine[];
  history: ApprovalBatchHistoryItem[];
}

interface MultiLevelApprovalViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function MultiLevelApprovalView({ onBack, onNavigateScreen }: MultiLevelApprovalViewProps) {
  // Master state from PostgreSQL
  const [batches, setBatches] = useState<ApprovalBatchDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All Divisions");

  // Modals state
  const [activeBatch, setActiveBatch] = useState<ApprovalBatchDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<ApprovalBatchDetails | null>(null);

  // Approver Action in Detail Workbench
  const [decisionStepNumber, setDecisionStepNumber] = useState<number>(1);
  const [approverNameInput, setApproverNameInput] = useState("Finance - M. Jayasinghe");
  const [decisionComment, setDecisionComment] = useState("");

  // Posting Inputs in Detail Modal
  const [journalRefInput, setJournalRefInput] = useState("");
  const [payrollFileInput, setPayrollFileInput] = useState("");

  // Create Form State
  const [createForm, setCreateForm] = useState({
    id: `APP-2026-06-SIM`,
    runNo: "RUN-2026-06-SIM-01",
    period: "June 2026",
    division: "All Divisions",
    totalPayable: 3500000,
    postingMethod: "Accrual JE + payroll export",
    notes: "June 2026 Mid-Year Incentive Settlement Package.",
    submittedBy: "Lakmal Perera (Incentive Administrator)",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    id: "",
    runNo: "",
    period: "",
    division: "",
    totalPayable: 0,
    postingMethod: "Accrual JE + payroll export",
    accrualJe: "",
    payrollFile: "",
    status: "Submitted" as ApprovalPackageStatus,
    notes: "",
  });

  // Load from PostgreSQL API
  const loadBatches = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/approval-batches");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.batches)) {
        setBatches(data.batches);
        setIsDbConnected(true);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        setIsDbConnected(false);
      }
    } catch (err) {
      console.warn("Failed to load approval batches:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  // Aggregated KPI Stats
  const stats = useMemo(() => {
    const totalCount = batches.length;
    const totalPayablePool = batches.reduce((acc, b) => acc + (Number(b.totalPayable) || 0), 0);
    const pendingCount = batches.filter((b) => b.status === "Submitted").length;
    const approvedCount = batches.filter((b) => b.status === "Approved").length;
    const postedCount = batches.filter((b) => b.status === "Posted").length;
    const lockedCount = batches.filter((b) => b.status === "Locked").length;

    return {
      totalCount,
      totalPayablePool,
      pendingCount,
      approvedCount,
      postedCount,
      lockedCount,
    };
  }, [batches]);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.runNo.toLowerCase().includes(q) ||
        b.period.toLowerCase().includes(q) ||
        (b.accrualJe && b.accrualJe.toLowerCase().includes(q)) ||
        (b.payrollFile && b.payrollFile.toLowerCase().includes(q));

      const matchStatus = selectedStatus === "All" || b.status === selectedStatus;
      const matchPeriod = selectedPeriod === "All" || b.period === selectedPeriod;
      const matchDivision = selectedDivision === "All Divisions" || b.division === selectedDivision;

      return matchSearch && matchStatus && matchPeriod && matchDivision;
    });
  }, [batches, searchTerm, selectedStatus, selectedPeriod, selectedDivision]);

  // CREATE (POST)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.runNo.trim()) {
      toast.error("Calculation Run Number is required.");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await apiFetch("/api/incentives/approval-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Created Approval Package ${data.batch.id}!`, {
          description: `Total Pool: LKR ${Number(createForm.totalPayable).toLocaleString()} · 4 Approval Tiers Initialized`,
        });
        setIsCreateModalOpen(false);
        await loadBatches();
      } else {
        toast.error("Failed to create approval package.");
      }
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Error creating approval package in PostgreSQL.");
    } finally {
      setIsProcessing(false);
    }
  };

  // EDIT (Open Modal)
  const handleOpenEdit = (batch: ApprovalBatchDetails) => {
    setEditForm({
      id: batch.id,
      runNo: batch.runNo,
      period: batch.period,
      division: batch.division,
      totalPayable: batch.totalPayable,
      postingMethod: batch.postingMethod,
      accrualJe: batch.accrualJe || "",
      payrollFile: batch.payrollFile || "",
      status: batch.status,
      notes: batch.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // EDIT (PUT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/approval-batches/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Updated Approval Package ${editForm.id}!`, {
          description: "All parameters and ledger references updated in PostgreSQL.",
        });
        setIsEditModalOpen(false);
        await loadBatches();
        if (activeBatch && activeBatch.id === editForm.id) {
          setActiveBatch(data.batch);
        }
      } else {
        toast.error("Failed to update approval package.");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating approval package in database.");
    } finally {
      setIsProcessing(false);
    }
  };

  // STEP DECISION (Maker-Checker Action)
  const handleStepDecision = async (
    batchId: string,
    stepNum: number,
    decision: "Approved" | "Rejected",
  ) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/approval-batches/${batchId}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepNumber: stepNum,
          decision,
          approverName: approverNameInput,
          comments: decisionComment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Step ${stepNum} ${decision}!`, {
          description: `Package status: ${data.batch.status}`,
        });
        setDecisionComment("");
        await loadBatches();
        if (activeBatch && activeBatch.id === batchId) {
          setActiveBatch(data.batch);
        }
      } else {
        toast.error("Failed to record decision.");
      }
    } catch (err) {
      console.error("Step error:", err);
      toast.error("Error recording step approval.");
    } finally {
      setIsProcessing(false);
    }
  };

  // POST ACCRUAL JOURNAL ENTRY (Status: Approved -> Posted)
  const handlePostJournalEntry = async (batchId: string) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/approval-batches/${batchId}/post-je`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postedBy: "Finance - M. Jayasinghe",
          journalRef: journalRefInput.trim() || undefined,
          payrollFileName: payrollFileInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Posted Accrual JE #${data.batch.accrualJe}!`, {
          description: `Payroll export ${data.batch.payrollFile} generated for payroll handover.`,
        });
        await loadBatches();
        if (activeBatch && activeBatch.id === batchId) {
          setActiveBatch(data.batch);
        }
      } else {
        toast.error("Posting only allowed after all approval tiers are fully approved.");
      }
    } catch (err) {
      console.error("Post JE error:", err);
      toast.error("Error posting journal entry.");
    } finally {
      setIsProcessing(false);
    }
  };

  // LOCK PERIOD (Status: Posted -> Locked)
  const handleLockPeriod = async (batchId: string) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/approval-batches/${batchId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockedBy: "Finance - M. Jayasinghe" }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Period Locked Successfully!`, {
          description: "Financial period frozen. All statements and calculation lines are now immutable.",
        });
        await loadBatches();
        if (activeBatch && activeBatch.id === batchId) {
          setActiveBatch(data.batch);
        }
      } else {
        toast.error("Failed to lock period.");
      }
    } catch (err) {
      console.error("Lock error:", err);
      toast.error("Error locking period.");
    } finally {
      setIsProcessing(false);
    }
  };

  // DELETE
  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return;
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/approval-batches/${batchToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Deleted Approval Package ${batchToDelete.id}!`);
        setBatchToDelete(null);
        if (activeBatch && activeBatch.id === batchToDelete.id) {
          setIsDetailModalOpen(false);
          setActiveBatch(null);
        }
        await loadBatches();
      } else {
        toast.error("Failed to delete approval package.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting approval batch.");
    } finally {
      setIsProcessing(false);
    }
  };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    const csvHeader = "Batch ID,Run No,Period,Division,Total Payable (LKR),Posting Method,Accrual JE,Payroll File,Status,Current Step\n";
    const csvRows = filteredBatches
      .map(
        (b) =>
          `"${b.id}","${b.runNo}","${b.period}","${b.division}","${b.totalPayable}","${b.postingMethod}","${b.accrualJe || ""}","${b.payrollFile || ""}","${b.status}","${b.currentStep}/${b.totalSteps}"`,
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Approval_Batches_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported approval packages to CSV / Excel!");
  };

  // EXPORT PDF
  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & METADATA BAR                                   */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <CheckSquare size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Multi-Level Approval &amp; Verification
                </h1>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary font-mono">
                  INC-SCR-11
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                  Approval &amp; Posting
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sequential Four-Eyes sign-off pipeline (HOD → Service → Finance → CEO), Accrual JE Posting, and Period Lock.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="h-8 text-xs gap-1.5 cursor-pointer">
              <ArrowLeft size={13} />
              <span>Back</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadBatches()}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Sync</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet size={13} />
            <span>Excel</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Download size={13} />
            <span>PDF</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>+ New Approval Package</span>
          </Button>
        </div>
      </div>

      {/* Database Connection Pill */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isDbConnected ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
          <span>
            {isDbConnected
              ? "PostgreSQL 18 Connected: table `incentive_approval_batches`"
              : "Database connection pending"}
          </span>
          {lastSynced && <span className="text-muted-foreground/70">· Synced at {lastSynced}</span>}
        </div>
        <div className="text-right font-medium">
          Workflow Rule: Sequential four-eyes authorization (HOD Sales → HOD Service → Finance → CEO)
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI SUMMARY CARDS                                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Packages</span>
            <CheckSquare size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">{stats.totalCount}</div>
          <div className="text-[11px] text-muted-foreground">Calculation Batches</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Payable Pool</span>
            <DollarSign size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-xl font-bold text-primary font-mono">
            {formatCurrency(stats.totalPayablePool)}
          </div>
          <div className="text-[11px] text-muted-foreground">Net Payout Value</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Sign-Offs
            </span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pendingCount}
          </div>
          <div className="text-[11px] text-muted-foreground">Awaiting Approvals</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Posted to SAP B1
            </span>
            <Receipt size={14} className="text-emerald-500" />
          </div>
          <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.postedCount}
          </div>
          <div className="text-[11px] text-muted-foreground">Accrual JE Created</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Locked Periods</span>
            <Lock size={14} className="text-muted-foreground" />
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">{stats.lockedCount}</div>
          <div className="text-[11px] text-muted-foreground">Immutable Ledger</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FILTERS & SEARCH CONTROLS                                   */}
      {/* ============================================================== */}
      <div className="card-surface p-4 rounded-xl border bg-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search package, run, period, or JE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-9"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-9"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted (Pending)</option>
              <option value="Approved">Approved</option>
              <option value="Posted">Posted (JE Generated)</option>
              <option value="Locked">Locked</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-9"
            >
              <option value="All">All Periods</option>
              <option value="April 2026">April 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-9"
            >
              <option value="All Divisions">All Divisions</option>
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
              <option value="Renewable Energy">Renewable Energy</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredBatches.length}</strong> of {batches.length} approval packages
          </span>
          {(searchTerm || selectedStatus !== "All" || selectedPeriod !== "All" || selectedDivision !== "All Divisions") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("All");
                setSelectedPeriod("All");
                setSelectedDivision("All Divisions");
              }}
              className="text-primary hover:underline font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN DATA TABLE (APPROVAL PACKAGES LIST)                    */}
      {/* ============================================================== */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 font-semibold text-muted-foreground">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 min-w-[140px]">Package Reference</th>
                <th className="p-3 min-w-[130px]">Period &amp; Scope</th>
                <th className="p-3 text-right min-w-[130px]">Total Payable (LKR)</th>
                <th className="p-3 min-w-[170px]">Approval Progress</th>
                <th className="p-3 min-w-[130px]">Accrual JE (SAP B1)</th>
                <th className="p-3 min-w-[150px]">Payroll Export</th>
                <th className="p-3 text-center min-w-[100px]">Status</th>
                <th className="p-3 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span>Loading approval packages from PostgreSQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <CheckSquare size={24} className="mx-auto text-muted-foreground/50" />
                      <p className="font-medium text-foreground">No approval packages found</p>
                      <p className="text-xs">Click "+ New Approval Package" to initiate sign-off workflow.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch, idx) => {
                  const approvedCount = batch.steps.filter((s) => s.decision === "Approved").length;
                  const progressPct = Math.round((approvedCount / batch.totalSteps) * 100);

                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        setActiveBatch(batch);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <td className="p-3 text-center text-muted-foreground font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Package Reference + Run No */}
                      <td className="p-3">
                        <div className="font-bold text-foreground font-mono text-xs flex items-center gap-1.5">
                          <span>{batch.id}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {batch.runNo}
                        </div>
                      </td>

                      {/* Period & Scope */}
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{batch.period}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building size={11} />
                          <span>{batch.division}</span>
                        </div>
                      </td>

                      {/* Total Payable */}
                      <td className="p-3 text-right">
                        <div className="font-mono font-bold text-xs text-foreground">
                          LKR {Number(batch.totalPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {batch.postingMethod}
                        </div>
                      </td>

                      {/* Approval Progress */}
                      <td className="p-3">
                        <div className="space-y-1 max-w-[160px]">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium text-foreground">
                              {approvedCount} / {batch.totalSteps} Approved
                            </span>
                            <span className="font-mono text-muted-foreground">{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                progressPct === 100 ? "bg-emerald-500" : "bg-primary"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Accrual JE */}
                      <td className="p-3">
                        {batch.accrualJe ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Receipt size={11} /> {batch.accrualJe}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Not Posted</span>
                        )}
                      </td>

                      {/* Payroll Export */}
                      <td className="p-3">
                        {batch.payrollFile ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-primary bg-primary/10 border border-primary/20">
                            <FileSpreadsheet size={11} /> {batch.payrollFile}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Pending</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            batch.status === "Posted"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : batch.status === "Approved"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : batch.status === "Locked"
                              ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20"
                              : batch.status === "Submitted"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-destructive/15 text-destructive border border-destructive/20"
                          }`}
                        >
                          {batch.status === "Posted" && <Receipt size={11} />}
                          {batch.status === "Approved" && <CheckCircle2 size={11} />}
                          {batch.status === "Locked" && <Lock size={11} />}
                          {batch.status === "Submitted" && <Clock size={11} />}
                          {batch.status === "Rejected" && <XCircle size={11} />}
                          <span>{batch.status}</span>
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer"
                            title="View Full Approval Package & Workbench"
                            onClick={() => {
                              setActiveBatch(batch);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye size={13} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Edit Batch Attributes"
                            onClick={() => handleOpenEdit(batch)}
                          >
                            <Edit2 size={13} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer text-destructive/80 hover:text-destructive"
                            title="Delete Batch"
                            onClick={() => setBatchToDelete(batch)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: CREATE APPROVAL PACKAGE                               */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <CheckSquare size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">Initiate Multi-Level Approval Package</h3>
                  <p className="text-xs text-muted-foreground font-mono">INC-SCR-11 · Four-Eyes Authorization</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Package ID *</label>
                  <input
                    type="text"
                    value={createForm.id}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, id: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Calculation Run No. *</label>
                  <input
                    type="text"
                    value={createForm.runNo}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, runNo: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Period *</label>
                  <select
                    value={createForm.period}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, period: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  >
                    <option value="June 2026">June 2026</option>
                    <option value="May 2026">May 2026</option>
                    <option value="April 2026">April 2026</option>
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Total Payable (LKR) *</label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.totalPayable}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, totalPayable: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full h-8 text-xs font-mono font-bold bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Posting Method *</label>
                  <input
                    type="text"
                    value={createForm.postingMethod}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, postingMethod: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes / Settlement Remarks</label>
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="input-field w-full p-2 text-xs bg-card"
                  placeholder="Memo for review committee..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isProcessing} className="bg-primary text-primary-foreground font-semibold cursor-pointer">
                  {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Initiate Package</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT APPROVAL PACKAGE                                 */}
      {/* ============================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Edit2 size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">Edit Package {editForm.id}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{editForm.runNo}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Period</label>
                  <input
                    type="text"
                    value={editForm.period}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, period: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Division</label>
                  <input
                    type="text"
                    value={editForm.division}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, division: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Total Payable (LKR)</label>
                  <input
                    type="number"
                    value={editForm.totalPayable}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, totalPayable: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full h-8 text-xs font-mono font-bold bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Posting Method</label>
                  <input
                    type="text"
                    value={editForm.postingMethod}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, postingMethod: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Accrual JE (SAP B1)</label>
                  <input
                    type="text"
                    value={editForm.accrualJe}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, accrualJe: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                    placeholder="e.g. JE-2026-05-0412"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Payroll File Reference</label>
                  <input
                    type="text"
                    value={editForm.payrollFile}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, payrollFile: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                    placeholder="e.g. INC_2026_05.xlsx"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as ApprovalPackageStatus }))}
                  className="input-field w-full h-8 text-xs bg-card font-semibold"
                >
                  <option value="Submitted">Submitted (Pending Review)</option>
                  <option value="Approved">Approved (All Tiers Complete)</option>
                  <option value="Posted">Posted (JE Created)</option>
                  <option value="Locked">Locked (Financial Freeze)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="input-field w-full p-2 text-xs bg-card"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isProcessing} className="bg-primary text-primary-foreground font-semibold cursor-pointer">
                  {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Edit2 size={13} />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: WORKBENCH (EXACT PAGE 34 SPECIMEN)                     */}
      {/* ============================================================== */}
      {isDetailModalOpen && activeBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-3xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <CheckSquare size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>Approval and Posting: {activeBatch.id}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        activeBatch.status === "Posted"
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : activeBatch.status === "Approved"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : activeBatch.status === "Locked"
                          ? "bg-slate-500/15 text-slate-700 dark:text-slate-300"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {activeBatch.status}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Calculation Run: <span className="font-medium text-foreground">{activeBatch.runNo}</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            {/* Header Specimen Panel (Page 34) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Period</span>
                <span className="font-bold text-foreground">{activeBatch.period}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Total Payable (LKR)</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  LKR {Number(activeBatch.totalPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Posting Method</span>
                <span className="font-medium text-foreground">{activeBatch.postingMethod}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Accrual JE (SAP B1)</span>
                {activeBatch.accrualJe ? (
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {activeBatch.accrualJe}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">Pending Approval</span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Payroll File</span>
                {activeBatch.payrollFile ? (
                  <span className="font-mono text-primary font-medium">{activeBatch.payrollFile}</span>
                ) : (
                  <span className="text-muted-foreground italic">Pending Handover</span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Submitted By</span>
                <span className="text-foreground">{activeBatch.submittedBy}</span>
              </div>
            </div>

            {/* Workbench Tabs: Approval Steps | Posting Preview | History */}
            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid grid-cols-3 h-9 p-1 bg-muted/50">
                <TabsTrigger value="steps" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <ShieldCheck size={13} />
                  <span>Approval Steps ({activeBatch.steps.length})</span>
                </TabsTrigger>
                <TabsTrigger value="posting" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <Receipt size={13} />
                  <span>Posting Preview ({activeBatch.postingLines.length} G/L Lines)</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <History size={13} />
                  <span>History &amp; Audit ({activeBatch.history.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Approval Steps */}
              <TabsContent value="steps" className="space-y-3 mt-3">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b font-semibold text-muted-foreground text-[11px]">
                        <th className="p-2 w-12 text-center">#</th>
                        <th className="p-2">Role / Tier</th>
                        <th className="p-2">Assigned Approver</th>
                        <th className="p-2 text-center">Decision</th>
                        <th className="p-2">Decision Date</th>
                        <th className="p-2">Comments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeBatch.steps.map((step) => (
                        <tr key={step.id} className="hover:bg-muted/20">
                          <td className="p-2 text-center font-bold font-mono text-muted-foreground">
                            {step.stepNumber}
                          </td>
                          <td className="p-2 font-medium text-foreground">{step.roleName}</td>
                          <td className="p-2 text-muted-foreground">{step.approverName}</td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                step.decision === "Approved"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : step.decision === "Rejected"
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {step.decision}
                            </span>
                          </td>
                          <td className="p-2 text-muted-foreground font-mono text-[11px]">
                            {step.decidedAt || "—"}
                          </td>
                          <td className="p-2 text-muted-foreground italic text-[11px]">
                            {step.comments || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Approver Action Panel */}
                <div className="rounded-lg border p-3 bg-muted/20 space-y-2">
                  <div className="font-semibold text-xs flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare size={13} className="text-primary" />
                      <span>Sequential Four-Eyes Approver Action Panel</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Step {activeBatch.currentStep} of {activeBatch.totalSteps}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Tier to Decide</label>
                      <select
                        value={decisionStepNumber}
                        onChange={(e) => setDecisionStepNumber(Number(e.target.value))}
                        className="input-field w-full h-7 text-xs bg-card"
                      >
                        {activeBatch.steps.map((s) => (
                          <option key={s.id} value={s.stepNumber}>
                            Step {s.stepNumber}: {s.roleName} ({s.decision})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Acting Approver Name</label>
                      <input
                        type="text"
                        value={approverNameInput}
                        onChange={(e) => setApproverNameInput(e.target.value)}
                        className="input-field w-full h-7 text-xs bg-card"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Approval Remarks / Sign-Off Comments</label>
                    <input
                      type="text"
                      placeholder="Audited figures and authorized for next sign-off tier..."
                      value={decisionComment}
                      onChange={(e) => setDecisionComment(e.target.value)}
                      className="input-field w-full h-7 text-xs bg-card"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isProcessing || activeBatch.status === "Locked"}
                      onClick={() => handleStepDecision(activeBatch.id, decisionStepNumber, "Rejected")}
                      className="h-7 text-xs cursor-pointer"
                    >
                      <XCircle size={12} /> Reject Tier
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing || activeBatch.status === "Locked"}
                      onClick={() => handleStepDecision(activeBatch.id, decisionStepNumber, "Approved")}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> Approve Tier
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Posting Preview (Page 34 Table Specimen) */}
              <TabsContent value="posting" className="space-y-3 mt-3">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b font-semibold text-muted-foreground text-[11px]">
                        <th className="p-2 w-12 text-center">#</th>
                        <th className="p-2">Division / Cost Centre</th>
                        <th className="p-2">G/L (Incentive Expense)</th>
                        <th className="p-2">G/L (Incentive Payable)</th>
                        <th className="p-2 text-right">Amount (LKR)</th>
                        <th className="p-2 text-center">Dimension</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeBatch.postingLines.map((line) => (
                        <tr key={line.id} className="hover:bg-muted/20">
                          <td className="p-2 text-center font-mono text-muted-foreground">{line.lineNo}</td>
                          <td className="p-2 font-medium text-foreground">{line.divisionCostCentre}</td>
                          <td className="p-2 font-mono text-[11px]">
                            <span className="font-bold text-foreground">{line.glExpenseAccount}</span> · {line.glExpenseName}
                          </td>
                          <td className="p-2 font-mono text-[11px]">
                            <span className="font-bold text-foreground">{line.glPayableAccount}</span> · {line.glPayableName}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-foreground">
                            LKR {Number(line.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center font-mono text-[11px] text-muted-foreground">
                            {line.dimension}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 border-t font-bold">
                        <td colSpan={4} className="p-2 text-right">
                          Total Posting Allocation:
                        </td>
                        <td className="p-2 text-right font-mono text-primary font-bold">
                          LKR{" "}
                          {activeBatch.postingLines
                            .reduce((sum, l) => sum + Number(l.amount), 0)
                            .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-center text-muted-foreground text-[10px]">Balanced</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Accrual JE Posting Action Box */}
                <div className="rounded-lg border p-3 bg-muted/20 space-y-2">
                  <div className="font-semibold text-xs flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Receipt size={13} className="text-primary" />
                      <span>SAP Business One Accrual JE &amp; Payroll Handover Controls</span>
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Requirement Rule: Posting allowed only after full approval
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Accrual Journal Entry Voucher No.</label>
                      <input
                        type="text"
                        placeholder="e.g. JE-2026-05-0412"
                        value={journalRefInput || activeBatch.accrualJe || ""}
                        onChange={(e) => setJournalRefInput(e.target.value)}
                        className="input-field w-full h-7 text-xs font-mono bg-card"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Payroll Handover Export File</label>
                      <input
                        type="text"
                        placeholder="e.g. INC_RLC_2026-04.xlsx"
                        value={payrollFileInput || activeBatch.payrollFile || ""}
                        onChange={(e) => setPayrollFileInput(e.target.value)}
                        className="input-field w-full h-7 text-xs font-mono bg-card"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing || (activeBatch.status !== "Approved" && activeBatch.status !== "Posted")}
                      onClick={() => handlePostJournalEntry(activeBatch.id)}
                      className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer"
                    >
                      <Receipt size={12} /> Post Accrual JE &amp; Export
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isProcessing || activeBatch.status !== "Posted"}
                      onClick={() => handleLockPeriod(activeBatch.id)}
                      className="h-7 text-xs font-semibold cursor-pointer"
                    >
                      <Lock size={12} /> Lock Period (Freeze)
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: History & Audit Log */}
              <TabsContent value="history" className="space-y-2 mt-3">
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeBatch.history.map((h) => (
                    <div key={h.id} className="p-2 rounded-lg border bg-card text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Sparkles size={11} className="text-primary" />
                          <span>{h.action}</span>
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{h.performedAt}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        By <span className="font-medium text-foreground">{h.performedBy}</span>
                      </div>
                      {h.notes && <div className="text-[11px] text-muted-foreground italic">{h.notes}</div>}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-3 border-t">
              <div className="text-[11px] text-muted-foreground font-mono">
                Initiated by {activeBatch.submittedBy}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)} className="cursor-pointer">
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEdit(activeBatch);
                  }}
                  className="bg-primary text-primary-foreground font-semibold cursor-pointer"
                >
                  <Edit2 size={13} /> Edit Batch
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION DIALOG                            */}
      {/* ============================================================== */}
      {batchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-destructive/15 text-destructive">
                <AlertCircle size={20} />
              </span>
              <div>
                <h3 className="font-bold text-base text-foreground">Confirm Package Deletion</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-foreground">
              Are you sure you want to delete approval package{" "}
              <span className="font-bold font-mono">{batchToDelete.id}</span> for run{" "}
              <span className="font-semibold">{batchToDelete.runNo}</span> (LKR {Number(batchToDelete.totalPayable).toLocaleString()}) from PostgreSQL?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setBatchToDelete(null)} className="cursor-pointer">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isProcessing}
                onClick={handleDeleteConfirm}
                className="font-semibold cursor-pointer"
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete Permanently</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
