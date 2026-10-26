import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Send,
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
  Receipt,
  Building,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Download,
  Calendar,
  Lock,
  ArrowUpRight,
  UserCheck,
  CreditCard,
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

export type GLPostingStatus = "Draft" | "Ready to Post" | "Posted" | "Handed Over" | "Reconciled";
export type AccountEntryType = "Debit" | "Credit";

export interface GLPostingLine {
  id: string;
  postingBatchId: string;
  lineNo: number;
  accountType: AccountEntryType;
  glAccountCode: string;
  glAccountName: string;
  costCentre: string;
  amount: number;
  memo?: string;
}

export interface PayrollHandoverItem {
  id: string;
  postingBatchId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  division: string;
  epfNo: string;
  bankName: string;
  bankAccountNo: string;
  grossAmount: number;
  taxDeduction: number;
  netDisbursement: number;
  paymentStatus: string;
}

export interface GLPostingBatchDetails {
  id: string;
  postingRef: string;
  runNo: string;
  period: string;
  division: string;
  postingDate: string;
  journalEntryNo?: string;
  totalDebit: number;
  totalCredit: number;
  payrollBatchNo?: string;
  payrollFileName?: string;
  bankFormat: string;
  bankFileName?: string;
  status: GLPostingStatus;
  paymentLagMonths: number;
  disbursementMonth: string;
  notes?: string;
  postedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lines: GLPostingLine[];
  payrollItems: PayrollHandoverItem[];
}

interface GLPostingPayrollViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function GLPostingPayrollView({ onBack, onNavigateScreen }: GLPostingPayrollViewProps) {
  // Master state from PostgreSQL
  const [batches, setBatches] = useState<GLPostingBatchDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All Divisions");

  // Modals
  const [activeBatch, setActiveBatch] = useState<GLPostingBatchDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<GLPostingBatchDetails | null>(null);

  // Workbench Actions
  const [customJournalRef, setCustomJournalRef] = useState("");

  // Create Form State
  const [createForm, setCreateForm] = useState({
    id: `GLP-2026-06-003`,
    postingRef: `GLP-2026-06-003`,
    runNo: "RUN-2026-06-SIM-01",
    period: "June 2026",
    division: "Consumer Electronics",
    postingDate: new Date().toISOString().slice(0, 10),
    totalAmount: 2450000,
    paymentLagMonths: 3,
    disbursementMonth: "September 2026",
    notes: "June 2026 Accrual Posting Voucher & Payroll Handover.",
    createdBy: "Lakmal Perera (Incentive Administrator)",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    id: "",
    postingRef: "",
    period: "",
    division: "",
    postingDate: "",
    journalEntryNo: "",
    totalDebit: 0,
    totalCredit: 0,
    payrollFileName: "",
    bankFileName: "",
    status: "Ready to Post" as GLPostingStatus,
    disbursementMonth: "",
    notes: "",
  });

  // Load from PostgreSQL API
  const loadBatches = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/gl-posting");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.batches)) {
        setBatches(data.batches);
        setIsDbConnected(true);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        setIsDbConnected(false);
      }
    } catch (err) {
      console.warn("Failed to load GL posting batches:", err);
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
    const totalAccrualAmount = batches.reduce((acc, b) => acc + (Number(b.totalDebit) || 0), 0);
    const postedCount = batches.filter((b) => b.status === "Posted" || b.status === "Handed Over").length;
    const handedOverCount = batches.filter((b) => b.status === "Handed Over").length;
    const readyToPostCount = batches.filter((b) => b.status === "Ready to Post" || b.status === "Draft").length;

    return {
      totalCount,
      totalAccrualAmount,
      postedCount,
      handedOverCount,
      readyToPostCount,
    };
  }, [batches]);

  // Filtered List
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.postingRef.toLowerCase().includes(q) ||
        b.runNo.toLowerCase().includes(q) ||
        b.period.toLowerCase().includes(q) ||
        (b.journalEntryNo && b.journalEntryNo.toLowerCase().includes(q)) ||
        (b.payrollFileName && b.payrollFileName.toLowerCase().includes(q));

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
      const res = await apiFetch("/api/incentives/gl-posting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Created GL Posting Batch ${data.batch.postingRef}!`, {
          description: `Total Double-Entry Accrual: LKR ${Number(createForm.totalAmount).toLocaleString()}`,
        });
        setIsCreateModalOpen(false);
        await loadBatches();
      } else {
        toast.error("Failed to create GL posting batch.");
      }
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Error creating GL posting batch in database.");
    } finally {
      setIsProcessing(false);
    }
  };

  // EDIT (Open Modal)
  const handleOpenEdit = (batch: GLPostingBatchDetails) => {
    setEditForm({
      id: batch.id,
      postingRef: batch.postingRef,
      period: batch.period,
      division: batch.division,
      postingDate: batch.postingDate,
      journalEntryNo: batch.journalEntryNo || "",
      totalDebit: batch.totalDebit,
      totalCredit: batch.totalCredit,
      payrollFileName: batch.payrollFileName || "",
      bankFileName: batch.bankFileName || "",
      status: batch.status,
      disbursementMonth: batch.disbursementMonth,
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
      const res = await apiFetch(`/api/incentives/gl-posting/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Updated Posting Batch ${editForm.postingRef}!`, {
          description: "All changes saved to PostgreSQL.",
        });
        setIsEditModalOpen(false);
        await loadBatches();
        if (activeBatch && activeBatch.id === editForm.id) {
          setActiveBatch(data.batch);
        }
      } else {
        toast.error("Failed to update posting batch.");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating posting batch.");
    } finally {
      setIsProcessing(false);
    }
  };

  // POST TO SAP B1 (Status: Ready to Post -> Posted)
  const handlePostToSAP = async (batchId: string) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/gl-posting/${batchId}/post-sap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postedBy: "Finance - M. Jayasinghe",
          customJournalRef: customJournalRef.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Posted Journal Voucher #${data.batch.journalEntryNo} to SAP B1!`, {
          description: `General Ledger accounts credited & debited. Status: Posted.`,
        });
        setCustomJournalRef("");
        await loadBatches();
        if (activeBatch && activeBatch.id === batchId) {
          setActiveBatch(data.batch);
        }
      } else {
        toast.error("Failed to post to SAP B1.");
      }
    } catch (err) {
      console.error("SAP Post error:", err);
      toast.error("Error executing SAP B1 posting.");
    } finally {
      setIsProcessing(false);
    }
  };

  // TRANSMIT TO HR PAYROLL (Status: Posted -> Handed Over)
  const handleHandoverPayroll = async (batchId: string) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/gl-posting/${batchId}/handover`, {
        method: "POST",
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Handed Over to HR Payroll!`, {
          description: `Export file ${data.batch.payrollFileName} transmitted for salary disbursement.`,
        });
        await loadBatches();
        if (activeBatch && activeBatch.id === batchId) {
          setActiveBatch(data.batch);
        }
      } else {
        toast.error("Failed to handover payroll.");
      }
    } catch (err) {
      console.error("Handover error:", err);
      toast.error("Error transmitting payroll file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // DOWNLOAD CEFT BANK FILE
  const handleDownloadCEFT = (batch: GLPostingBatchDetails) => {
    const header = `01|TELESONIC_LANKA|${batch.bankFormat}|${batch.postingDate}|${batch.payrollItems.length}|${batch.totalDebit}\n`;
    const lines = batch.payrollItems
      .map(
        (p, idx) =>
          `02|${idx + 1}|${p.employeeId}|${p.employeeName}|${p.bankName}|${p.bankAccountNo}|${p.netDisbursement}|${batch.period}|SLIPS-TRANSFER`,
      )
      .join("\n");

    const content = header + lines;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", batch.bankFileName || `CEFT_${batch.period.replace(/\s+/g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded Bank SLIPS / CEFT Transfer File!");
  };

  // DELETE
  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return;
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/api/incentives/gl-posting/${batchToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`Deleted Posting Batch ${batchToDelete.postingRef}!`);
        setBatchToDelete(null);
        if (activeBatch && activeBatch.id === batchToDelete.id) {
          setIsDetailModalOpen(false);
          setActiveBatch(null);
        }
        await loadBatches();
      } else {
        toast.error("Failed to delete posting batch.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting posting batch.");
    } finally {
      setIsProcessing(false);
    }
  };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    const csvHeader = "Posting Ref,Run No,Period,Division,Posting Date,Total Debit,Total Credit,Journal Entry No,Payroll File,Status,Disbursement Month\n";
    const csvRows = filteredBatches
      .map(
        (b) =>
          `"${b.postingRef}","${b.runNo}","${b.period}","${b.division}","${b.postingDate}","${b.totalDebit}","${b.totalCredit}","${b.journalEntryNo || ""}","${b.payrollFileName || ""}","${b.status}","${b.disbursementMonth}"`,
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GL_Posting_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported GL Posting Register to CSV / Excel!");
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
              <Send size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  GL Posting &amp; Payroll Handover
                </h1>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary font-mono">
                  INC-SCR-12
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                  Financial Execution Console
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                SAP Business One General Ledger Accrual Vouchers, Bank SLIPS / CEFT file export, and HR Payroll handover.
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
            <span>+ New GL Posting Batch</span>
          </Button>
        </div>
      </div>

      {/* Database Connection Banner */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isDbConnected ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
          <span>
            {isDbConnected
              ? "PostgreSQL 18 Connected: table `incentive_gl_posting_batches`"
              : "Database connection pending"}
          </span>
          {lastSynced && <span className="text-muted-foreground/70">· Synced at {lastSynced}</span>}
        </div>
        <div className="text-right font-medium">
          Policy: Balanced double-entry accrual with 3-month payable lookback lag (INC-BCR-01)
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI SUMMARY CARDS                                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Posting Batches</span>
            <Send size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">{stats.totalCount}</div>
          <div className="text-[11px] text-muted-foreground">General Ledger Vouchers</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Accrued Pool</span>
            <DollarSign size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-xl font-bold text-primary font-mono">
            {formatCurrency(stats.totalAccrualAmount)}
          </div>
          <div className="text-[11px] text-muted-foreground">Balanced Dr / Cr Total</div>
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
          <div className="text-[11px] text-muted-foreground">Journal Entries Assigned</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Handed Over to HR
            </span>
            <UserCheck size={14} className="text-purple-500" />
          </div>
          <div className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">
            {stats.handedOverCount}
          </div>
          <div className="text-[11px] text-muted-foreground">Payroll Files Transmitted</div>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Ready to Post
            </span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
            {stats.readyToPostCount}
          </div>
          <div className="text-[11px] text-muted-foreground">Awaiting Finance Execution</div>
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
              placeholder="Search posting ref, run no, period, or JE..."
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
              <option value="Ready to Post">Ready to Post</option>
              <option value="Posted">Posted (SAP B1 Active)</option>
              <option value="Handed Over">Handed Over (HR Active)</option>
              <option value="Reconciled">Reconciled</option>
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
              <option value="RLC Sales">RLC Sales</option>
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
              <option value="Renewable Energy">Renewable Energy</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredBatches.length}</strong> of {batches.length} posting batches
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
      {/* 4. MAIN DATA TABLE (GL POSTING BATCHES LIST)                    */}
      {/* ============================================================== */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 font-semibold text-muted-foreground">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 min-w-[140px]">Posting Reference</th>
                <th className="p-3 min-w-[130px]">Period &amp; Scope</th>
                <th className="p-3 min-w-[100px]">Posting Date</th>
                <th className="p-3 text-right min-w-[130px]">Accrual Total (LKR)</th>
                <th className="p-3 min-w-[140px]">Journal Entry (SAP B1)</th>
                <th className="p-3 min-w-[150px]">Payroll Export File</th>
                <th className="p-3 min-w-[140px]">Disbursement Lag</th>
                <th className="p-3 text-center min-w-[110px]">Status</th>
                <th className="p-3 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span>Loading GL posting and payroll batches from PostgreSQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <Send size={24} className="mx-auto text-muted-foreground/50" />
                      <p className="font-medium text-foreground">No posting batches found</p>
                      <p className="text-xs">Click "+ New GL Posting Batch" to initiate an accounting handover voucher.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch, idx) => {
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

                      {/* Posting Reference */}
                      <td className="p-3">
                        <div className="font-bold text-foreground font-mono text-xs">
                          {batch.postingRef}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {batch.runNo}
                        </div>
                      </td>

                      {/* Period & Division */}
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{batch.period}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building size={11} />
                          <span>{batch.division}</span>
                        </div>
                      </td>

                      {/* Posting Date */}
                      <td className="p-3 font-mono text-muted-foreground">
                        {batch.postingDate}
                      </td>

                      {/* Accrual Total */}
                      <td className="p-3 text-right">
                        <div className="font-mono font-bold text-xs text-foreground">
                          LKR {Number(batch.totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Dr = Cr Balanced
                        </div>
                      </td>

                      {/* Journal Entry (SAP B1) */}
                      <td className="p-3">
                        {batch.journalEntryNo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Receipt size={11} /> {batch.journalEntryNo}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            <Clock size={11} /> Ready to Post
                          </span>
                        )}
                      </td>

                      {/* Payroll File */}
                      <td className="p-3">
                        {batch.payrollFileName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-primary bg-primary/10 border border-primary/20">
                            <FileSpreadsheet size={11} /> {batch.payrollFileName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">None</span>
                        )}
                      </td>

                      {/* Disbursement Lag */}
                      <td className="p-3">
                        <div className="font-medium text-foreground">{batch.disbursementMonth}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {batch.paymentLagMonths}-Month Lookback Lag
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            batch.status === "Handed Over"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : batch.status === "Posted"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : batch.status === "Ready to Post"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {batch.status === "Handed Over" && <UserCheck size={11} />}
                          {batch.status === "Posted" && <CheckCircle2 size={11} />}
                          {batch.status === "Ready to Post" && <Clock size={11} />}
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
                            title="Open GL & Payroll Workbench"
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
                            title="Edit Batch"
                            onClick={() => handleOpenEdit(batch)}
                          >
                            <Edit2 size={13} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer text-primary hover:text-primary/80"
                            title="Download CEFT Bank File"
                            onClick={() => handleDownloadCEFT(batch)}
                          >
                            <CreditCard size={13} />
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
      {/* MODAL 1: CREATE GL POSTING BATCH                               */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Send size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">Create GL Posting &amp; Payroll Voucher</h3>
                  <p className="text-xs text-muted-foreground font-mono">INC-SCR-12 · Balanced Double-Entry Setup</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Posting Ref *</label>
                  <input
                    type="text"
                    value={createForm.postingRef}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, postingRef: e.target.value }))}
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
                  <label className="font-semibold block mb-1">Calculation Period *</label>
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
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="RLC Sales">RLC Sales</option>
                    <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="All Divisions">All Divisions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Accrual Amount (LKR) *</label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.totalAmount}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full h-8 text-xs font-mono font-bold bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Posting Date *</label>
                  <input
                    type="date"
                    value={createForm.postingDate}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, postingDate: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Payable Lag (Months)</label>
                  <select
                    value={createForm.paymentLagMonths}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, paymentLagMonths: parseInt(e.target.value) || 3 }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  >
                    <option value={3}>3 Months Lag (RLC Standard)</option>
                    <option value={5}>5 Months Lookback (MHA Standard)</option>
                    <option value={1}>1 Month (Immediate Month End)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Disbursement Month</label>
                  <input
                    type="text"
                    value={createForm.disbursementMonth}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, disbursementMonth: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Voucher Notes &amp; Accounting Memo</label>
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="input-field w-full p-2 text-xs bg-card"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isProcessing} className="bg-primary text-primary-foreground font-semibold cursor-pointer">
                  {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Generate Voucher</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT GL POSTING BATCH                                 */}
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
                  <h3 className="font-bold text-base text-foreground">Edit Posting Batch {editForm.postingRef}</h3>
                  <p className="text-xs text-muted-foreground">Modify accounting parameters or payroll references</p>
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
                  <label className="font-semibold block mb-1">Total Debit (LKR)</label>
                  <input
                    type="number"
                    value={editForm.totalDebit}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, totalDebit: parseFloat(e.target.value) || 0, totalCredit: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full h-8 text-xs font-mono font-bold bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Journal Entry No (SAP B1)</label>
                  <input
                    type="text"
                    value={editForm.journalEntryNo}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, journalEntryNo: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Payroll File Reference</label>
                  <input
                    type="text"
                    value={editForm.payrollFileName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, payrollFileName: e.target.value }))}
                    className="input-field w-full h-8 text-xs font-mono bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as GLPostingStatus }))}
                    className="input-field w-full h-8 text-xs bg-card font-semibold"
                  >
                    <option value="Ready to Post">Ready to Post</option>
                    <option value="Posted">Posted (SAP B1 Active)</option>
                    <option value="Handed Over">Handed Over (HR Active)</option>
                    <option value="Reconciled">Reconciled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Disbursement Month</label>
                <input
                  type="text"
                  value={editForm.disbursementMonth}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, disbursementMonth: e.target.value }))}
                  className="input-field w-full h-8 text-xs bg-card"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes</label>
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
      {/* MODAL 3: WORKBENCH (GL LEDGER & PAYROLL HANDOVER CONSOLE)       */}
      {/* ============================================================== */}
      {isDetailModalOpen && activeBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-3xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Send size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>GL Posting &amp; Payroll Workbench: {activeBatch.postingRef}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        activeBatch.status === "Handed Over"
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : activeBatch.status === "Posted"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {activeBatch.status}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Period: <span className="font-medium text-foreground">{activeBatch.period}</span> · Run:{" "}
                    <span className="font-medium text-foreground">{activeBatch.runNo}</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(false)} className="h-8 w-8 p-0 cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border bg-muted/20 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Accrual Total</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  LKR {Number(activeBatch.totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">SAP B1 Voucher</span>
                {activeBatch.journalEntryNo ? (
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {activeBatch.journalEntryNo}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 italic">Unposted</span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Payroll Export</span>
                <span className="font-mono text-primary truncate block" title={activeBatch.payrollFileName}>
                  {activeBatch.payrollFileName || "Pending"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Disbursement Schedule</span>
                <span className="font-semibold text-foreground">
                  {activeBatch.disbursementMonth} ({activeBatch.paymentLagMonths}M Lag)
                </span>
              </div>
            </div>

            {/* Workbench Tabs: 1. GL Double-Entry | 2. Payroll Handover | 3. Bank CEFT Format */}
            <Tabs defaultValue="gl-lines" className="w-full">
              <TabsList className="grid grid-cols-3 h-9 p-1 bg-muted/50">
                <TabsTrigger value="gl-lines" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <Receipt size={13} />
                  <span>General Ledger Double-Entries ({activeBatch.lines.length})</span>
                </TabsTrigger>
                <TabsTrigger value="payroll" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <UserCheck size={13} />
                  <span>Payroll Staff Register ({activeBatch.payrollItems.length})</span>
                </TabsTrigger>
                <TabsTrigger value="ceft" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <CreditCard size={13} />
                  <span>Bank SLIPS / CEFT File</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: General Ledger Double-Entries */}
              <TabsContent value="gl-lines" className="space-y-3 mt-3">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b font-semibold text-muted-foreground text-[11px]">
                        <th className="p-2 w-10 text-center">#</th>
                        <th className="p-2 w-20 text-center">Dr / Cr</th>
                        <th className="p-2">G/L Account</th>
                        <th className="p-2">Cost Centre</th>
                        <th className="p-2 text-right">Amount (LKR)</th>
                        <th className="p-2">Memo / Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeBatch.lines.map((line) => (
                        <tr key={line.id} className="hover:bg-muted/20">
                          <td className="p-2 text-center font-mono text-muted-foreground">{line.lineNo}</td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                line.accountType === "Debit"
                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {line.accountType}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="font-bold font-mono">{line.glAccountCode}</span>
                            <span className="text-muted-foreground ml-1.5">· {line.glAccountName}</span>
                          </td>
                          <td className="p-2 font-mono text-muted-foreground">{line.costCentre}</td>
                          <td className="p-2 text-right font-mono font-bold text-foreground">
                            LKR {Number(line.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-muted-foreground italic text-[11px]">{line.memo || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 border-t font-bold">
                        <td colSpan={4} className="p-2 text-right">
                          Total Balanced Double-Entry:
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          LKR {Number(activeBatch.totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-emerald-600 dark:text-emerald-400 text-[10px]">
                          ✓ Total Debit = Total Credit
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Posting Action Box */}
                <div className="rounded-lg border p-3 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Receipt size={13} className="text-primary" />
                      <span>Post Accrual Voucher to SAP Business One</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Creates official journal voucher with general ledger debit and liability credit.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Custom JE# (optional)"
                      value={customJournalRef}
                      onChange={(e) => setCustomJournalRef(e.target.value)}
                      className="input-field h-7 text-xs font-mono bg-card w-40"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing || activeBatch.status === "Posted" || activeBatch.status === "Handed Over"}
                      onClick={() => handlePostToSAP(activeBatch.id)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> Post to SAP B1
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Payroll Staff Register */}
              <TabsContent value="payroll" className="space-y-3 mt-3">
                <div className="rounded-lg border overflow-hidden max-h-[260px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b font-semibold text-muted-foreground text-[11px] sticky top-0 bg-muted">
                        <th className="p-2">Employee</th>
                        <th className="p-2">Division / Role</th>
                        <th className="p-2">Bank &amp; Account</th>
                        <th className="p-2 text-right">Gross (LKR)</th>
                        <th className="p-2 text-right">Net Payable</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeBatch.payrollItems.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="p-2">
                            <div className="font-semibold text-foreground">{item.employeeName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{item.employeeId} · {item.epfNo}</div>
                          </td>
                          <td className="p-2">
                            <div className="text-foreground">{item.designation}</div>
                            <div className="text-[10px] text-muted-foreground">{item.division}</div>
                          </td>
                          <td className="p-2">
                            <div className="font-mono text-foreground">{item.bankAccountNo}</div>
                            <div className="text-[10px] text-muted-foreground">{item.bankName}</div>
                          </td>
                          <td className="p-2 text-right font-mono text-muted-foreground">
                            LKR {Number(item.grossAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-foreground">
                            LKR {Number(item.netDisbursement).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                              {item.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border p-3 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <UserCheck size={13} className="text-primary" />
                      <span>Transmit File to HR / Salary Processing</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Hands over file <span className="font-mono font-medium">{activeBatch.payrollFileName}</span> for salary disbursement.
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={isProcessing || activeBatch.status === "Handed Over"}
                    onClick={() => handleHandoverPayroll(activeBatch.id)}
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer"
                  >
                    <Send size={12} /> Transmit to HR Payroll
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 3: Bank SLIPS / CEFT File */}
              <TabsContent value="ceft" className="space-y-3 mt-3">
                <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs text-foreground space-y-2">
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between border-b pb-1">
                    <span>Electronic Funds Transfer (CEFT / SLIPS) Header Preview:</span>
                    <span className="font-bold text-primary">{activeBatch.bankFileName}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre font-mono">
                    {`01|TELESONIC_LANKA|${activeBatch.bankFormat}|${activeBatch.postingDate}|${activeBatch.payrollItems.length}|${activeBatch.totalDebit}`}
                    {"\n"}
                    {activeBatch.payrollItems.slice(0, 3).map((p, i) => `02|${i + 1}|${p.employeeId}|${p.employeeName}|${p.bankName}|${p.bankAccountNo}|${p.netDisbursement}|${activeBatch.period}|SLIPS`).join("\n")}
                    {"\n..."}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleDownloadCEFT(activeBatch)}
                    className="h-7 text-xs bg-primary text-primary-foreground font-semibold cursor-pointer"
                  >
                    <Download size={12} /> Download Bank CEFT File
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-3 border-t">
              <div className="text-[11px] text-muted-foreground font-mono">
                Initiated by {activeBatch.createdBy}
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
                  <Edit2 size={13} /> Edit Voucher
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
                <h3 className="font-bold text-base text-foreground">Confirm Voucher Deletion</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-foreground">
              Are you sure you want to delete GL Posting Voucher{" "}
              <span className="font-bold font-mono">{batchToDelete.postingRef}</span> for period{" "}
              <span className="font-semibold">{batchToDelete.period}</span> (LKR {Number(batchToDelete.totalDebit).toLocaleString()}) from PostgreSQL?
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
