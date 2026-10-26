import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sliders,
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
  CheckSquare,
  ShieldCheck,
  Building,
  User,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Download,
  Paperclip,
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

export type AdjustmentType = "Addition" | "Deduction";
export type AdjustmentStatus = "Draft" | "Submitted" | "Approved" | "Rejected";
export type ApprovalDecision = "Pending" | "Approved" | "Rejected";

export interface ApprovalStepItem {
  id: string;
  stepNumber: number;
  roleName: string;
  approverName: string;
  decision: ApprovalDecision;
  decidedAt?: string;
  comments?: string;
}

export interface AdjustmentHistoryItem {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface ManualAdjustmentItem {
  id: string;
  adjustmentNo: string;
  runNo: string;
  participantId: string;
  participantName: string;
  division: string;
  schemeCode: string;
  schemeName: string;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  remarks: string;
  attachment?: string;
  status: AdjustmentStatus;
  requiresCeo: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvals: ApprovalStepItem[];
  history: AdjustmentHistoryItem[];
}

interface ManualAdjustmentsViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

const STANDARD_REASONS = [
  "Receipt realised after cut-off",
  "Special Performance Bonus",
  "Discretionary Management Award",
  "Penalty Waiver (Approved Attendance/Delay)",
  "System Reconciliation Adjustment",
  "Customer Satisfaction Recognition",
  "Warranty Claim Correction",
  "Other Authorized Discretionary Adjustment",
];

const AVAILABLE_PARTICIPANTS = [
  { id: "EMP-1025", name: "Nuwan Dias", division: "RLC Sales", designation: "Sales Executive" },
  { id: "EMP-1024", name: "Dilshan Madusanka", division: "RLC Service", designation: "Service Technician" },
  { id: "EMP-1021", name: "Kasun Jayawardena", division: "Consumer Electronics", designation: "Showroom Sales Rep" },
  { id: "EMP-1022", name: "Pradeep Bandara", division: "Commercial Air Conditioning", designation: "HVAC Project Manager" },
  { id: "EMP-1023", name: "Ruwan Wijesinghe", division: "Commercial Air Conditioning", designation: "CAC Technical Specialist" },
  { id: "EMP-1030", name: "Mahesh Gunawardena", division: "RLC Service", designation: "Senior Supervisor Technician" },
];

const AVAILABLE_SCHEMES = [
  { code: "RLC-REP-PAY", name: "Dealer Sales Staff Payment Commission", division: "RLC Sales" },
  { code: "RLC-SVC", name: "Service Technician Scorecard Incentive", division: "RLC Service" },
  { code: "SCH-SLS-2026", name: "Retail Showroom Sales Incentive", division: "Consumer Electronics" },
  { code: "SCH-CAC-2026", name: "Commercial HVAC Dealer Commission", division: "Commercial Air Conditioning" },
  { code: "SCH-SOLAR-2026", name: "Renewable Energy Solar Consultant Incentive", division: "Renewable Energy" },
];

export function ManualAdjustmentsView({ onBack, onNavigateScreen }: ManualAdjustmentsViewProps) {
  // Master state from PostgreSQL
  const [adjustments, setAdjustments] = useState<ManualAdjustmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All Divisions");
  const [selectedRunNo, setSelectedRunNo] = useState<string>("All");

  // Active Item for Detail Modal
  const [activeItem, setActiveItem] = useState<ManualAdjustmentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ManualAdjustmentItem | null>(null);

  // Approval Decision Action form in detail modal
  const [decisionStepNumber, setDecisionStepNumber] = useState<number>(1);
  const [decisionComment, setDecisionComment] = useState("");
  const [approverNameInput, setApproverNameInput] = useState("Finance - M. Jayasinghe");

  // Create Form
  const [createForm, setCreateForm] = useState({
    adjustmentNo: `ADJ-2026-00${Math.floor(45 + Math.random() * 50)}`,
    runNo: "RUN-2026-05-PRE-01",
    participantId: "EMP-1025",
    participantName: "Nuwan Dias",
    division: "RLC Sales",
    schemeCode: "RLC-REP-PAY",
    schemeName: "Dealer Sales Staff Payment Commission",
    adjustmentType: "Addition" as AdjustmentType,
    amount: 10000,
    reason: "Receipt realised after cut-off",
    remarks: "Bank slip verified for payment credited before final sign-off.",
    attachment: "bank_deposit_slip.pdf",
    status: "Draft" as AdjustmentStatus,
    createdBy: "Lakmal Perera (Incentive Administrator)",
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    id: "",
    adjustmentNo: "",
    runNo: "",
    participantId: "",
    participantName: "",
    division: "",
    schemeCode: "",
    schemeName: "",
    adjustmentType: "Addition" as AdjustmentType,
    amount: 0,
    reason: "",
    remarks: "",
    attachment: "",
    status: "Draft" as AdjustmentStatus,
  });

  // Load adjustments from PostgreSQL API
  const loadAdjustments = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/manual-adjustments");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.adjustments)) {
        setAdjustments(data.adjustments);
        setIsDbConnected(true);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        setIsDbConnected(false);
      }
    } catch (err) {
      console.warn("Failed to load adjustments:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdjustments();
  }, [loadAdjustments]);

  // Aggregated KPI Metrics
  const metrics = useMemo(() => {
    const totalCount = adjustments.length;
    const additions = adjustments.filter((a) => a.adjustmentType === "Addition");
    const deductions = adjustments.filter((a) => a.adjustmentType === "Deduction");

    const totalAdditionAmount = additions.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    const totalDeductionAmount = deductions.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    const netImpact = totalAdditionAmount - totalDeductionAmount;

    const pendingApprovals = adjustments.filter((a) => a.status === "Submitted").length;
    const approvedCount = adjustments.filter((a) => a.status === "Approved").length;

    return {
      totalCount,
      totalAdditionAmount,
      totalDeductionAmount,
      netImpact,
      pendingApprovals,
      approvedCount,
    };
  }, [adjustments]);

  // Filtered List
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((a) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.adjustmentNo.toLowerCase().includes(q) ||
        a.participantName.toLowerCase().includes(q) ||
        a.participantId.toLowerCase().includes(q) ||
        a.runNo.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q) ||
        a.schemeName.toLowerCase().includes(q);

      const matchStatus = selectedStatus === "All" || a.status === selectedStatus;
      const matchType = selectedType === "All" || a.adjustmentType === selectedType;
      const matchDivision = selectedDivision === "All Divisions" || a.division === selectedDivision;
      const matchRun = selectedRunNo === "All" || a.runNo === selectedRunNo;

      return matchSearch && matchStatus && matchType && matchDivision && matchRun;
    });
  }, [adjustments, searchTerm, selectedStatus, selectedType, selectedDivision, selectedRunNo]);

  // Handle participant change in create modal
  const handleCreateParticipantChange = (partId: string) => {
    const p = AVAILABLE_PARTICIPANTS.find((x) => x.id === partId);
    if (p) {
      setCreateForm((prev) => ({
        ...prev,
        participantId: p.id,
        participantName: p.name,
        division: p.division,
      }));
    }
  };

  // Handle scheme change in create modal
  const handleCreateSchemeChange = (schemeCode: string) => {
    const s = AVAILABLE_SCHEMES.find((x) => x.code === schemeCode);
    if (s) {
      setCreateForm((prev) => ({
        ...prev,
        schemeCode: s.code,
        schemeName: s.name,
      }));
    }
  };

  // CREATE (POST)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.reason.trim() || !createForm.remarks.trim()) {
      toast.error("Reason and remarks are mandatory for manual adjustments (INC-SCR-10 rule).");
      return;
    }
    if (Number(createForm.amount) <= 0) {
      toast.error("Adjustment amount must be greater than zero.");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await apiFetch("/api/incentives/manual-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Created Adjustment ${createForm.adjustmentNo}!`, {
          description: `Amount: LKR ${Number(createForm.amount).toLocaleString()} · Status: ${createForm.status}`,
        });
        setIsCreateModalOpen(false);
        // Reset form for next entry
        setCreateForm((prev) => ({
          ...prev,
          adjustmentNo: `ADJ-2026-00${Math.floor(50 + Math.random() * 50)}`,
          amount: 10000,
          remarks: "Verified authorized adjustment request.",
        }));
        await loadAdjustments();
      } else {
        toast.error("Failed to create manual adjustment in PostgreSQL.");
      }
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Error creating adjustment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // EDIT (Open Modal)
  const handleOpenEdit = (item: ManualAdjustmentItem) => {
    setEditForm({
      id: item.id,
      adjustmentNo: item.adjustmentNo,
      runNo: item.runNo,
      participantId: item.participantId,
      participantName: item.participantName,
      division: item.division,
      schemeCode: item.schemeCode,
      schemeName: item.schemeName,
      adjustmentType: item.adjustmentType,
      amount: item.amount,
      reason: item.reason,
      remarks: item.remarks,
      attachment: item.attachment || "",
      status: item.status,
    });
    setIsEditModalOpen(true);
  };

  // EDIT (PUT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;
    if (!editForm.reason.trim() || !editForm.remarks.trim()) {
      toast.error("Reason and remarks are mandatory.");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/manual-adjustments/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Updated Adjustment ${editForm.adjustmentNo}!`, {
          description: "All changes persisted to PostgreSQL.",
        });
        setIsEditModalOpen(false);
        await loadAdjustments();
        if (activeItem && activeItem.id === editForm.id) {
          setActiveItem(data.adjustment);
        }
      } else {
        toast.error("Failed to update adjustment.");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating adjustment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // SUBMIT FOR APPROVAL (Draft -> Submitted)
  const handleSubmitForApproval = async (item: ManualAdjustmentItem) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/manual-adjustments/${item.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedBy: "Lakmal Perera (Incentive Administrator)" }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Submitted ${item.adjustmentNo} for Approval!`, {
          description: "Forwarded to Department HOD and Finance Manager.",
        });
        await loadAdjustments();
        if (activeItem && activeItem.id === item.id) {
          setActiveItem(data.adjustment);
        }
      } else {
        toast.error("Failed to submit adjustment.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Error submitting adjustment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // DECIDE APPROVAL STEP (Maker-Checker Action)
  const handleDecision = async (
    adjustmentId: string,
    stepNum: number,
    decision: "Approved" | "Rejected",
  ) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/manual-adjustments/${adjustmentId}/decision`, {
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
          description: `Overall adjustment status: ${data.adjustment.status}`,
        });
        setDecisionComment("");
        await loadAdjustments();
        if (activeItem && activeItem.id === adjustmentId) {
          setActiveItem(data.adjustment);
        }
      } else {
        toast.error("Failed to record decision.");
      }
    } catch (err) {
      console.error("Decision error:", err);
      toast.error("Error recording approval decision.");
    } finally {
      setIsProcessing(false);
    }
  };

  // DELETE
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/manual-adjustments/${itemToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data && data.success) {
        toast.success(`Deleted Adjustment ${itemToDelete.adjustmentNo}!`);
        setItemToDelete(null);
        if (activeItem && activeItem.id === itemToDelete.id) {
          setIsDetailModalOpen(false);
          setActiveItem(null);
        }
        await loadAdjustments();
      } else {
        toast.error("Failed to delete adjustment.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting adjustment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    const csvHeader = "Adjustment No,Run No,Participant ID,Participant Name,Division,Scheme,Type,Amount (LKR),Reason,Status,Requires CEO,Created By\n";
    const csvRows = filteredAdjustments
      .map((a) =>
        `"${a.adjustmentNo}","${a.runNo}","${a.participantId}","${a.participantName}","${a.division}","${a.schemeName}","${a.adjustmentType}","${a.amount}","${a.reason}","${a.status}","${a.requiresCeo ? "YES" : "NO"}","${a.createdBy}"`
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Manual_Adjustments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported adjustments to CSV / Excel!");
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
              <Sliders size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Manual Adjustments &amp; Bonus Claims
                </h1>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary font-mono">
                  INC-SCR-10
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                  Maker-Checker UDO
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Controlled discretionary adjustments, bonus awards, and penalty waivers with multi-tier audit trail.
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
            onClick={() => loadAdjustments()}
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
            <span>+ New Adjustment</span>
          </Button>
        </div>
      </div>

      {/* Database Connection Pill */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isDbConnected ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
          <span>
            {isDbConnected
              ? "PostgreSQL 18 Connected: table `incentive_manual_adjustments`"
              : "Database connection pending"}
          </span>
          {lastSynced && <span className="text-muted-foreground/70">· Synced at {lastSynced}</span>}
        </div>
        <div className="text-right font-medium">
          Threshold Rule: Claims &gt; LKR 50,000 automatically require CEO approval
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI SUMMARY CARDS                                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Claims</span>
            <Sliders size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">{metrics.totalCount}</div>
          <div className="text-[11px] text-muted-foreground">Recorded in Ledger</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Additions
            </span>
            <Plus size={14} className="text-emerald-500" />
          </div>
          <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(metrics.totalAdditionAmount)}
          </div>
          <div className="text-[11px] text-muted-foreground">Bonuses &amp; Waivers</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Deductions
            </span>
            <TrendingUp size={14} className="text-amber-500" />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {formatCurrency(metrics.totalDeductionAmount)}
          </div>
          <div className="text-[11px] text-muted-foreground">Clawbacks &amp; Penalties</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Net Impact Pool</span>
            <DollarSign size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-xl font-bold text-primary font-mono">
            {formatCurrency(metrics.netImpact)}
          </div>
          <div className="text-[11px] text-muted-foreground">Net Payout Shift</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending Approvals</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.pendingApprovals}
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              / {metrics.approvedCount} approved
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">Awaiting sign-off</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FILTERS & SEARCH CONTROLS                                   */}
      {/* ============================================================== */}
      <div className="card-surface p-4 rounded-xl border bg-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ref, participant, reason..."
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
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted (Pending)</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-9"
            >
              <option value="All">All Types</option>
              <option value="Addition">Addition (+)</option>
              <option value="Deduction">Deduction (-)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-9"
            >
              <option value="All Divisions">All Divisions</option>
              <option value="RLC Sales">RLC Sales</option>
              <option value="RLC Service">RLC Service</option>
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
              <option value="Renewable Energy">Renewable Energy</option>
            </select>
          </div>

          <div>
            <select
              value={selectedRunNo}
              onChange={(e) => setSelectedRunNo(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-9"
            >
              <option value="All">All Runs</option>
              <option value="RUN-2026-05-PRE-01">RUN-2026-05-PRE-01</option>
              <option value="INC-RUN-2026-04-RLC">INC-RUN-2026-04-RLC</option>
              <option value="RUN-2026-04-FIN-01">RUN-2026-04-FIN-01</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredAdjustments.length}</strong> of {adjustments.length} adjustments
          </span>
          {(searchTerm || selectedStatus !== "All" || selectedType !== "All" || selectedDivision !== "All Divisions" || selectedRunNo !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("All");
                setSelectedType("All");
                setSelectedDivision("All Divisions");
                setSelectedRunNo("All");
              }}
              className="text-primary hover:underline font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN DATA TABLE (ADJUSTMENTS & CLAIMS LIST)                 */}
      {/* ============================================================== */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 font-semibold text-muted-foreground">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 min-w-[130px]">Adjustment Ref</th>
                <th className="p-3 min-w-[170px]">Participant</th>
                <th className="p-3 min-w-[160px]">Division &amp; Scheme</th>
                <th className="p-3 text-center min-w-[100px]">Type</th>
                <th className="p-3 text-right min-w-[120px]">Amount (LKR)</th>
                <th className="p-3 min-w-[200px]">Reason &amp; Remarks</th>
                <th className="p-3 min-w-[180px]">Approvals Workflow</th>
                <th className="p-3 text-center min-w-[100px]">Status</th>
                <th className="p-3 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span>Loading manual adjustments from PostgreSQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <Sliders size={24} className="mx-auto text-muted-foreground/50" />
                      <p className="font-medium text-foreground">No adjustments found</p>
                      <p className="text-xs">Adjust your search or click "+ New Adjustment" to record a claim.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((item, idx) => {
                  const isAddition = item.adjustmentType === "Addition";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        setActiveItem(item);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <td className="p-3 text-center text-muted-foreground font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Adjustment Ref + Run No */}
                      <td className="p-3">
                        <div className="font-bold text-foreground font-mono text-xs flex items-center gap-1.5">
                          <span>{item.adjustmentNo}</span>
                          {item.requiresCeo && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" title="Requires CEO Approval (> LKR 50,000)">
                              CEO
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {item.runNo}
                        </div>
                      </td>

                      {/* Participant */}
                      <td className="p-3">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <User size={12} className="text-muted-foreground" />
                          <span>{item.participantName}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono pl-4">
                          {item.participantId}
                        </div>
                      </td>

                      {/* Division & Scheme */}
                      <td className="p-3">
                        <div className="text-foreground font-medium truncate max-w-[180px]">
                          {item.schemeName}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building size={11} />
                          <span>{item.division}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            isAddition
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {isAddition ? "+" : "-"} {item.adjustmentType}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-3 text-right">
                        <div
                          className={`font-mono font-bold text-xs ${
                            isAddition ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {isAddition ? "+" : "-"}&nbsp;LKR&nbsp;{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Reason & Remarks */}
                      <td className="p-3">
                        <div className="font-medium text-foreground truncate max-w-[220px]" title={item.reason}>
                          {item.reason}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[220px] mt-0.5" title={item.remarks}>
                          {item.remarks}
                        </div>
                        {item.attachment && (
                          <div className="flex items-center gap-1 text-[10px] text-primary mt-0.5">
                            <Paperclip size={10} />
                            <span className="truncate max-w-[160px]">{item.attachment}</span>
                          </div>
                        )}
                      </td>

                      {/* Approvals Workflow */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {item.approvals.map((step) => (
                            <div key={step.id} className="flex items-center gap-1.5 text-[10px]">
                              {step.decision === "Approved" ? (
                                <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                              ) : step.decision === "Rejected" ? (
                                <XCircle size={11} className="text-destructive shrink-0" />
                              ) : (
                                <Clock size={11} className="text-amber-500 shrink-0" />
                              )}
                              <span className="font-semibold text-muted-foreground">S{step.stepNumber}:</span>
                              <span className="truncate max-w-[110px]" title={step.approverName}>
                                {step.roleName.replace("Department ", "")}
                              </span>
                              <span
                                className={`ml-auto font-mono text-[9px] px-1 rounded ${
                                  step.decision === "Approved"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : step.decision === "Rejected"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {step.decision}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.status === "Approved"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : item.status === "Submitted"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : item.status === "Draft"
                              ? "bg-muted text-muted-foreground border border-border"
                              : "bg-destructive/15 text-destructive border border-destructive/20"
                          }`}
                        >
                          {item.status === "Approved" && <CheckCircle2 size={11} />}
                          {item.status === "Submitted" && <Clock size={11} />}
                          {item.status === "Rejected" && <XCircle size={11} />}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer"
                            title="View Full Detail & Approval Trail"
                            onClick={() => {
                              setActiveItem(item);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye size={13} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Edit Adjustment"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit2 size={13} />
                          </Button>

                          {item.status === "Draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 cursor-pointer text-primary hover:text-primary/80"
                              title="Submit for Approval"
                              onClick={() => handleSubmitForApproval(item)}
                            >
                              <Send size={13} />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer text-destructive/80 hover:text-destructive"
                            title="Delete Adjustment"
                            onClick={() => setItemToDelete(item)}
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
      {/* MODAL 1: CREATE ADJUSTMENT / BONUS CLAIM                       */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Sliders size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">Record Manual Adjustment / Bonus Claim</h3>
                  <p className="text-xs text-muted-foreground font-mono">INC-SCR-10 · Controlled Maker-Checker Flow</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Adjustment Ref *</label>
                  <input
                    type="text"
                    value={createForm.adjustmentNo}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, adjustmentNo: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Calculation Run No. *</label>
                  <select
                    value={createForm.runNo}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, runNo: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  >
                    <option value="RUN-2026-05-PRE-01">RUN-2026-05-PRE-01 (May 2026)</option>
                    <option value="INC-RUN-2026-04-RLC">INC-RUN-2026-04-RLC (April 2026)</option>
                    <option value="RUN-2026-04-FIN-01">RUN-2026-04-FIN-01 (Official Final)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Participant *</label>
                  <select
                    value={createForm.participantId}
                    onChange={(e) => handleCreateParticipantChange(e.target.value)}
                    className="input-field w-full h-8 text-xs bg-card"
                  >
                    {AVAILABLE_PARTICIPANTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) · {p.division}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Scheme *</label>
                  <select
                    value={createForm.schemeCode}
                    onChange={(e) => handleCreateSchemeChange(e.target.value)}
                    className="input-field w-full h-8 text-xs bg-card"
                  >
                    {AVAILABLE_SCHEMES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Adjustment Type *</label>
                  <select
                    value={createForm.adjustmentType}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, adjustmentType: e.target.value as AdjustmentType }))}
                    className="input-field w-full h-8 text-xs bg-card font-bold"
                  >
                    <option value="Addition">Addition (+) — Bonus / Allowance / Waiver</option>
                    <option value="Deduction">Deduction (-) — Penalty / Clawback</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Amount (LKR) *</label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.amount}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full h-8 text-xs font-mono font-bold bg-card"
                  />
                  {createForm.amount > 50000 && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                      <AlertTriangle size={11} /> Exceeds LKR 50,000: Multi-tier CEO approval required
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Reason (Controlled Taxonomy) *</label>
                <select
                  value={createForm.reason}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, reason: e.target.value }))}
                  className="input-field w-full h-8 text-xs bg-card font-medium"
                >
                  {STANDARD_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Remarks &amp; Justification *</label>
                <textarea
                  rows={2}
                  value={createForm.remarks}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="input-field w-full p-2 text-xs bg-card"
                  placeholder="Provide detailed justification, cheque references, or committee authorization..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Attachment File Reference</label>
                  <input
                    type="text"
                    value={createForm.attachment}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, attachment: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                    placeholder="e.g. proof_slip.pdf"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value as AdjustmentStatus }))}
                    className="input-field w-full h-8 text-xs bg-card font-semibold"
                  >
                    <option value="Draft">Draft (Save &amp; Review Later)</option>
                    <option value="Submitted">Submitted (Immediate Maker-Checker Route)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className="bg-primary text-primary-foreground font-semibold cursor-pointer"
                >
                  {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Create Adjustment</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT ADJUSTMENT                                       */}
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
                  <h3 className="font-bold text-base text-foreground">Edit Adjustment {editForm.adjustmentNo}</h3>
                  <p className="text-xs text-muted-foreground">Modify claim attributes and remarks</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Adjustment Ref</label>
                  <input
                    type="text"
                    disabled
                    value={editForm.adjustmentNo}
                    className="input-field w-full h-8 text-xs font-mono bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Calculation Run</label>
                  <input
                    type="text"
                    value={editForm.runNo}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, runNo: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Participant</label>
                  <input
                    type="text"
                    value={editForm.participantName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, participantName: e.target.value }))}
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
                  <label className="font-semibold block mb-1">Adjustment Type</label>
                  <select
                    value={editForm.adjustmentType}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, adjustmentType: e.target.value as AdjustmentType }))}
                    className="input-field w-full h-8 text-xs bg-card font-bold"
                  >
                    <option value="Addition">Addition (+)</option>
                    <option value="Deduction">Deduction (-)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Amount (LKR)</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.amount}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full h-8 text-xs font-mono font-bold bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Reason *</label>
                <select
                  value={editForm.reason}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, reason: e.target.value }))}
                  className="input-field w-full h-8 text-xs bg-card font-medium"
                >
                  {STANDARD_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Remarks *</label>
                <textarea
                  rows={2}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="input-field w-full p-2 text-xs bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Attachment</label>
                  <input
                    type="text"
                    value={editForm.attachment}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, attachment: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as AdjustmentStatus }))}
                    className="input-field w-full h-8 text-xs bg-card font-semibold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
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
      {/* MODAL 3: DETAIL VIEW & MULTI-TIER APPROVAL FLOW (PAGE 33 SPEC) */}
      {/* ============================================================== */}
      {isDetailModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Sliders size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>Manual Adjustment: {activeItem.adjustmentNo}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        activeItem.status === "Approved"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : activeItem.status === "Submitted"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {activeItem.status}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Calculation Run: <span className="font-mono font-medium text-foreground">{activeItem.runNo}</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            {/* Header Parameters Box (Specimen from Page 33) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Participant</span>
                <span className="font-semibold text-foreground">{activeItem.participantName}</span>
                <span className="text-muted-foreground block font-mono text-[10px]">{activeItem.participantId}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Scheme</span>
                <span className="font-semibold text-foreground">{activeItem.schemeName}</span>
                <span className="text-muted-foreground block font-mono text-[10px]">{activeItem.schemeCode}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Adjustment Type</span>
                <span
                  className={`font-bold ${
                    activeItem.adjustmentType === "Addition"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {activeItem.adjustmentType === "Addition" ? "+" : "-"} {activeItem.adjustmentType}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Amount (LKR)</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  LKR {Number(activeItem.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Division</span>
                <span className="font-semibold text-foreground">{activeItem.division}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Attachment</span>
                {activeItem.attachment ? (
                  <span className="text-primary font-mono text-[11px] flex items-center gap-1">
                    <Paperclip size={11} /> {activeItem.attachment}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">None</span>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-3 text-xs bg-muted/10 space-y-1">
              <div className="font-semibold text-foreground">Reason &amp; Remarks:</div>
              <div className="text-foreground font-medium">{activeItem.reason}</div>
              <div className="text-muted-foreground">{activeItem.remarks}</div>
            </div>

            {/* Tabs: Approvals & History */}
            <Tabs defaultValue="approvals" className="w-full">
              <TabsList className="grid grid-cols-2 h-9 p-1 bg-muted/50">
                <TabsTrigger value="approvals" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <ShieldCheck size={13} />
                  <span>Approvals Workflow ({activeItem.approvals.length})</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <History size={13} />
                  <span>Audit History ({activeItem.history.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Approvals Grid */}
              <TabsContent value="approvals" className="space-y-3 mt-3">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b font-semibold text-muted-foreground text-[11px]">
                        <th className="p-2 w-12 text-center">Step</th>
                        <th className="p-2">Role Name</th>
                        <th className="p-2">Assigned Approver</th>
                        <th className="p-2 text-center">Decision</th>
                        <th className="p-2">Decision Date</th>
                        <th className="p-2">Comments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeItem.approvals.map((step) => (
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
                  <div className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                    <CheckSquare size={13} className="text-primary" />
                    <span>Maker-Checker Action Panel</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Step Number</label>
                      <select
                        value={decisionStepNumber}
                        onChange={(e) => setDecisionStepNumber(Number(e.target.value))}
                        className="input-field w-full h-7 text-xs bg-card"
                      >
                        {activeItem.approvals.map((s) => (
                          <option key={s.id} value={s.stepNumber}>
                            Step {s.stepNumber} — {s.roleName} ({s.decision})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Acting Approver</label>
                      <input
                        type="text"
                        value={approverNameInput}
                        onChange={(e) => setApproverNameInput(e.target.value)}
                        className="input-field w-full h-7 text-xs bg-card"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">Review Remarks</label>
                    <input
                      type="text"
                      placeholder="Optional comments for sign-off or justification for rejection..."
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
                      disabled={isProcessing}
                      onClick={() => handleDecision(activeItem.id, decisionStepNumber, "Rejected")}
                      className="h-7 text-xs cursor-pointer"
                    >
                      <XCircle size={12} /> Reject Step
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleDecision(activeItem.id, decisionStepNumber, "Approved")}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> Approve Step
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Audit History */}
              <TabsContent value="history" className="space-y-2 mt-3">
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeItem.history.map((h) => (
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
                Created by {activeItem.createdBy}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)} className="cursor-pointer">
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEdit(activeItem);
                  }}
                  className="bg-primary text-primary-foreground font-semibold cursor-pointer"
                >
                  <Edit2 size={13} /> Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION DIALOG                            */}
      {/* ============================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-destructive/15 text-destructive">
                <AlertCircle size={20} />
              </span>
              <div>
                <h3 className="font-bold text-base text-foreground">Confirm Deletion</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-foreground">
              Are you sure you want to delete manual adjustment{" "}
              <span className="font-bold font-mono">{itemToDelete.adjustmentNo}</span> for{" "}
              <span className="font-semibold">{itemToDelete.participantName}</span> (LKR {Number(itemToDelete.amount).toLocaleString()}) from PostgreSQL?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setItemToDelete(null)} className="cursor-pointer">
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
