import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ArrowLeft,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Building2,
  UserCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  FileCheck,
  Calendar,
  Send,
  HelpCircle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type ParticipantStatementDetails,
  type StatementLineItem,
  type StatementStatus,
} from "@/lib/participant-statement-db";

interface ParticipantStatementViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function ParticipantStatementView({
  onBack,
  onNavigateScreen,
}: ParticipantStatementViewProps) {
  // Master State
  const [statements, setStatements] = useState<ParticipantStatementDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modals
  const [viewingStatement, setViewingStatement] = useState<ParticipantStatementDetails | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingStatement, setEditingStatement] = useState<Partial<ParticipantStatementDetails> | null>(null);
  const [deletingStatement, setDeletingStatement] = useState<ParticipantStatementDetails | null>(null);

  // Print ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Fetch statements from PostgreSQL
  const fetchStatements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPeriod !== "All") params.append("period", selectedPeriod);
      if (selectedDivision !== "All") params.append("division", selectedDivision);
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/incentives/statements?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.statements)) {
        setStatements(data.statements);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to load participant statements from PostgreSQL.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with PostgreSQL server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, [selectedPeriod, selectedDivision, selectedStatus]);

  // Filtered in memory for instant typing
  const filteredStatements = useMemo(() => {
    return statements.filter((stmt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        stmt.statementNo.toLowerCase().includes(q) ||
        stmt.participantName.toLowerCase().includes(q) ||
        (stmt.salesCode && stmt.salesCode.toLowerCase().includes(q)) ||
        stmt.designation.toLowerCase().includes(q) ||
        stmt.runNo.toLowerCase().includes(q);

      const matchesPeriod = selectedPeriod === "All" || stmt.period === selectedPeriod;
      const matchesDivision = selectedDivision === "All" || stmt.division === selectedDivision;
      const matchesStatus = selectedStatus === "All" || stmt.status === selectedStatus;

      return matchesSearch && matchesPeriod && matchesDivision && matchesStatus;
    });
  }, [statements, searchQuery, selectedPeriod, selectedDivision, selectedStatus]);

  // Aggregate KPI Stats
  const totalStatementsCount = statements.length;
  const totalNetPayablePool = statements.reduce((acc, s) => acc + (Number(s.netPayable) || 0), 0);
  const avgPayout = totalStatementsCount > 0 ? totalNetPayablePool / totalStatementsCount : 0;
  const issuedCount = statements.filter((s) => s.status === "Issued" || s.status === "Disbursed").length;
  const highestPayout = useMemo(() => {
    if (statements.length === 0) return { name: "N/A", amount: 0 };
    const sorted = [...statements].sort((a, b) => b.netPayable - a.netPayable);
    const top = sorted[0];
    return { name: top ? top.participantName : "N/A", amount: top ? top.netPayable : 0 };
  }, [statements]);

  // Distinct Periods and Divisions for filter dropdowns
  const periods = useMemo(() => {
    const set = new Set<string>();
    statements.forEach((s) => set.add(s.period));
    return ["All", ...Array.from(set)];
  }, [statements]);

  const divisions = useMemo(() => {
    const set = new Set<string>();
    statements.forEach((s) => set.add(s.division));
    return ["All", ...Array.from(set)];
  }, [statements]);

  // Handle Issue to Employee
  const handleIssueStatement = async (statementId: string) => {
    try {
      const res = await fetch(`/api/incentives/statements/${statementId}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issuedBy: "Nimal Perera (Service Manager)" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Pay Slip issued to employee successfully!");
        fetchStatements();
        if (viewingStatement && viewingStatement.id === statementId) {
          setViewingStatement(data.statement);
        }
      } else {
        toast.error(data.error || "Failed to issue statement.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while issuing statement.");
    }
  };

  // Handle Delete Statement
  const handleDeleteStatement = async () => {
    if (!deletingStatement) return;
    try {
      const res = await fetch(`/api/incentives/statements/${deletingStatement.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Statement ${deletingStatement.statementNo} deleted.`);
        setDeletingStatement(null);
        fetchStatements();
      } else {
        toast.error(data.error || "Failed to delete statement.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting statement.");
    }
  };

  // Open Create Form
  const handleOpenCreate = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    const newStmt: Partial<ParticipantStatementDetails> = {
      id: `SLIP-2026-04-${rand}`,
      statementNo: `SLIP-2026-04-${rand}`,
      participantId: `EMP-${rand}`,
      salesCode: `${rand}`,
      participantName: "",
      designation: "Sales Executive - Dealer Seg 01",
      division: "RLC Sales",
      period: "April 2026",
      runNo: "INC-RUN-2026-04-RLC",
      payableCommission: 150000,
      targetIncentive: 10000,
      serviceAllowance: 0,
      adjustmentsAmount: 0,
      penaltiesClawback: 0,
      netPayable: 160000,
      paymentLagMonths: 3,
      disbursementMonth: "July 2026",
      bankName: "Commercial Bank",
      bankAccountNo: "8001928374",
      status: "Draft",
      preparedBy: "Lakmal Perera (Incentive Administrator)",
      verifiedBy: "Finance - M. Jayasinghe",
      approvedBy: "HOD Sales - T. Aloka",
      notes: "Participant incentive statement for April 2026.",
      lines: [
        {
          id: `line-${rand}-1`,
          statementId: `SLIP-2026-04-${rand}`,
          lineNo: 1,
          componentType: "Volume Target",
          description: "Monthly Sales Unit Target",
          targetValue: 80,
          achievementValue: 120,
          achievementPct: 150.0,
          earnedAmount: 7000,
          remarks: "Tier 6 Slab reached",
        },
        {
          id: `line-${rand}-2`,
          statementId: `SLIP-2026-04-${rand}`,
          lineNo: 2,
          componentType: "Turnover Target",
          description: "Monthly Sales Turnover Target",
          targetValue: 15000000,
          achievementValue: 18500000,
          achievementPct: 123.33,
          earnedAmount: 3000,
          remarks: "Tier 3 Turnover Slab reached",
        },
        {
          id: `line-${rand}-3`,
          statementId: `SLIP-2026-04-${rand}`,
          lineNo: 3,
          componentType: "Commission",
          description: "Payable Commission on Invoiced Realised Receipts",
          earnedAmount: 150000,
          remarks: "Realised receipts up to 45 days",
        },
      ],
    };
    setEditingStatement(newStmt);
    setIsEditing(true);
  };

  // Open Edit Form
  const handleOpenEdit = (stmt: ParticipantStatementDetails) => {
    setEditingStatement(JSON.parse(JSON.stringify(stmt)));
    setIsEditing(true);
  };

  // Save Statement (Create or Update)
  const handleSaveStatement = async () => {
    if (!editingStatement || !editingStatement.participantName) {
      toast.error("Participant name is required.");
      return;
    }

    try {
      const isNew = !statements.some((s) => s.id === editingStatement.id);
      const url = isNew
        ? "/api/incentives/statements"
        : `/api/incentives/statements/${editingStatement.id}`;
      const method = isNew ? "POST" : "PUT";

      // Recompute net payable from components
      const comm = Number(editingStatement.payableCommission) || 0;
      const targetInc = Number(editingStatement.targetIncentive) || 0;
      const allowance = Number(editingStatement.serviceAllowance) || 0;
      const adj = Number(editingStatement.adjustmentsAmount) || 0;
      const penalty = Number(editingStatement.penaltiesClawback) || 0;
      const computedNet = comm + targetInc + allowance + adj - penalty;

      const payload = {
        ...editingStatement,
        netPayable: computedNet,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Statement saved successfully!");
        setIsEditing(false);
        setEditingStatement(null);
        fetchStatements();
      } else {
        toast.error(data.error || "Failed to save statement.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving statement to PostgreSQL.");
    }
  };

  // Print Statement Modal
  const handlePrint = () => {
    window.print();
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    if (statements.length === 0) {
      toast.error("No statements to export.");
      return;
    }
    const headers = [
      "Statement No",
      "Sales Code",
      "Participant Name",
      "Designation",
      "Division",
      "Period",
      "Payable Commission (LKR)",
      "Target Incentive (LKR)",
      "Adjustments (LKR)",
      "Penalties (LKR)",
      "Net Payable (LKR)",
      "Payment Lag Months",
      "Disbursement Month",
      "Status",
    ];
    const rows = statements.map((s) => [
      `"${s.statementNo}"`,
      `"${s.salesCode || ""}"`,
      `"${s.participantName}"`,
      `"${s.designation}"`,
      `"${s.division}"`,
      `"${s.period}"`,
      s.payableCommission.toFixed(2),
      s.targetIncentive.toFixed(2),
      s.adjustmentsAmount.toFixed(2),
      s.penaltiesClawback.toFixed(2),
      s.netPayable.toFixed(2),
      s.paymentLagMonths,
      `"${s.disbursementMonth}"`,
      `"${s.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Incentive_Statements_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Statements exported to CSV.");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Participant Incentive Statement (Pay Slip)
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  INC-SCR-12
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                  INC-RPT-17
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Individual participant incentive earnings breakdown, 3-month lookback lag indicator, itemized target achievements, and signature verification.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 h-9">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatements}
            className="gap-1.5 h-9 text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 h-9 text-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const specimen = statements.find((s) => s.id === "SLIP-2026-04-025") || statements[0];
              if (specimen) setViewingStatement(specimen);
            }}
            className="gap-1.5 h-9 text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 font-semibold"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print Pay Slip
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            <Plus className="w-4 h-4" /> + Generate New Statement
          </Button>
        </div>
      </div>

      {/* PostgreSQL Status & Lag Rule Callout Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">PostgreSQL Live Connected:</span>
            <span>table `incentive_participant_statements` & `incentive_statement_lines`</span>
            {lastSynced && <span className="text-slate-400">· Synced at {lastSynced}</span>}
          </div>
          <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Rule INC-BCR-01 Active
          </span>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <div>
            <span className="font-semibold">3-Month Payout Lag Rule:</span> April 2026 incentive paid in July 2026 payroll (3 months after invoice realization).
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Statements
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalStatementsCount}</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-indigo-600 font-medium">{issuedCount} Issued</span> to participants
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Net Payable Pool
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            LKR {totalNetPayablePool.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Realised commission & slab incentives
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Average Statement
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            LKR {avgPayout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across active sales reps & technicians
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Highest Payout
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 truncate" title={highestPayout.name}>
            LKR {highestPayout.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-purple-700 font-medium truncate">
            {highestPayout.name}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Employee, Slip No, Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Period filter */}
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
            >
              <option value="All">All Periods</option>
              {periods.filter((p) => p !== "All").map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Division filter */}
          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
            >
              <option value="All">All Divisions</option>
              {divisions.filter((d) => d !== "All").map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Calculated">Calculated</option>
              <option value="Approved">Approved</option>
              <option value="Issued">Issued (Published)</option>
              <option value="Disbursed">Disbursed (Paid)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t">
          <span>
            Showing <strong className="text-slate-800">{filteredStatements.length}</strong> of {statements.length} participant statements
          </span>
          {(searchQuery || selectedPeriod !== "All" || selectedDivision !== "All" || selectedStatus !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPeriod("All");
                setSelectedDivision("All");
                setSelectedStatus("All");
              }}
              className="text-indigo-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Statements Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">Statement Ref</th>
                <th className="py-3 px-3">Participant & Code</th>
                <th className="py-3 px-3">Division & Period</th>
                <th className="py-3 px-3 text-right">Target Incentive</th>
                <th className="py-3 px-3 text-right">Commission</th>
                <th className="py-3 px-3 text-right">Net Payable</th>
                <th className="py-3 px-3">Payout Month</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStatements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No participant statements found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredStatements.map((stmt, idx) => (
                  <tr
                    key={stmt.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setViewingStatement(stmt)}
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-indigo-700 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                        {stmt.statementNo}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {stmt.runNo}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {stmt.participantName}
                        {stmt.salesCode && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1 rounded border border-slate-200">
                            Code: {stmt.salesCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {stmt.designation}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{stmt.division}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {stmt.period}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      LKR {stmt.targetIncentive.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      LKR {stmt.payableCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="font-bold font-mono text-emerald-700 text-[13px]">
                        LKR {stmt.netPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      {(stmt.adjustmentsAmount !== 0 || stmt.penaltiesClawback !== 0) && (
                        <div className="text-[10px] text-slate-400">
                          {stmt.adjustmentsAmount > 0 && `+${stmt.adjustmentsAmount.toLocaleString()} adj `}
                          {stmt.penaltiesClawback > 0 && `-${stmt.penaltiesClawback.toLocaleString()} pen`}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {stmt.disbursementMonth}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Lag: {stmt.paymentLagMonths} months
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          stmt.status === "Issued"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : stmt.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : stmt.status === "Calculated"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {stmt.status === "Issued" && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                        {stmt.status}
                      </span>
                    </td>

                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingStatement(stmt)}
                          className="h-7 px-2.5 text-xs font-semibold gap-1.5 text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200"
                          title="View & Print Official Pay Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Print Pay Slip</span>
                        </Button>

                        {stmt.status !== "Issued" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleIssueStatement(stmt.id)}
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                            title="Issue to Participant"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(stmt)}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          title="Edit Statement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingStatement(stmt)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Statement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW & PRINT OFFICIAL PAY SLIP (SPECIMEN FROM PAGE 34 EXACT)    */}
      {/* ========================================================================= */}
      {viewingStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden my-6">
            {/* Modal Header & Quick Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base tracking-tight">
                    Individual Incentive Statement (Pay Slip)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ref: {viewingStatement.statementNo} · Period: {viewingStatement.period}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handlePrint}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 gap-1.5 h-8 text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Pay Slip
                </Button>
                {viewingStatement.status !== "Issued" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleIssueStatement(viewingStatement.id)}
                    className="bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700 gap-1.5 h-8 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Issue to Employee
                  </Button>
                )}
                <button
                  onClick={() => setViewingStatement(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pay Slip Document Body (Printable Specimen Layout - Page 34) */}
            <div className="p-8 space-y-6 bg-white" ref={printAreaRef} id="printable-payslip">
              {/* Company & Statement Heading */}
              <div className="border-b-2 border-slate-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    Telesonic Lanka (Pvt) Limited
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    No 45, Galle Road, Colombo 03, Sri Lanka · Tel: +94 11 234 5678
                  </div>
                  <div className="text-xs font-semibold text-indigo-800 mt-1 uppercase tracking-wide">
                    Individual Incentive & Commission Statement
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800">
                    {viewingStatement.statementNo}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Calculation Run: <span className="font-mono">{viewingStatement.runNo}</span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                    Disbursement: {viewingStatement.disbursementMonth} (3-Month Lag Rule)
                  </div>
                </div>
              </div>

              {/* Employee Particulars Grid (Page 34 Specimen) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Participant Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingStatement.participantName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Sales Code / EPF
                  </span>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    {viewingStatement.salesCode || viewingStatement.participantId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Designation
                  </span>
                  <span className="font-semibold text-slate-800">
                    {viewingStatement.designation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Division & Period
                  </span>
                  <span className="font-semibold text-slate-800">
                    {viewingStatement.division} · {viewingStatement.period}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Bank Account
                  </span>
                  <span className="font-semibold text-slate-800">
                    {viewingStatement.bankName || "Commercial Bank"} - {viewingStatement.bankAccountNo || "8004128912"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Statement Status
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {viewingStatement.status} {viewingStatement.issuedAt && `(${viewingStatement.issuedAt})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Commission Earned
                  </span>
                  <span className="font-bold font-mono text-slate-900">
                    LKR {viewingStatement.payableCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Net Incentive Payable
                  </span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">
                    LKR {viewingStatement.netPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Itemized Calculation Lines Table (Matches Page 34 Table Format) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Component Description</th>
                      <th className="py-2.5 px-3 text-right">Target Value</th>
                      <th className="py-2.5 px-3 text-right">Actual Achievement</th>
                      <th className="py-2.5 px-3 text-center">Achieved %</th>
                      <th className="py-2.5 px-3 text-right font-mono">Incentive Amount (LKR)</th>
                      <th className="py-2.5 px-3">Remarks / Slab Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingStatement.lines && viewingStatement.lines.length > 0 ? (
                      viewingStatement.lines.map((line, lIdx) => (
                        <tr key={line.id || lIdx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                            {line.lineNo || lIdx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">
                              {line.componentType}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {line.description}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {line.targetValue !== undefined && line.targetValue !== null
                              ? Number(line.targetValue).toLocaleString("en-US")
                              : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {line.achievementValue !== undefined && line.achievementValue !== null
                              ? Number(line.achievementValue).toLocaleString("en-US")
                              : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {line.achievementPct !== undefined && line.achievementPct !== null ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                                  line.achievementPct >= 100
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {line.achievementPct.toFixed(2)}%
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                            {Number(line.earnedAmount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500">
                            {line.remarks || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-slate-400">
                          No line item breakdown available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payout Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Policy & Calculation Notes
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {viewingStatement.notes ||
                      "Commission calculated from fully realised sales receipts within credit period of 45 days. In accordance with Rule INC-BCR-01, incentive payments have a 3-month lookback period."}
                  </p>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Payable Sales Commission:</span>
                    <span className="font-mono">
                      LKR {viewingStatement.payableCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Volume / Turnover Target Incentive:</span>
                    <span className="font-mono">
                      LKR {viewingStatement.targetIncentive.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {viewingStatement.serviceAllowance > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Service Performance Allowance:</span>
                      <span className="font-mono">
                        LKR {viewingStatement.serviceAllowance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {viewingStatement.adjustmentsAmount !== 0 && (
                    <div className="flex justify-between text-indigo-700">
                      <span>Manual Adjustments & Claims:</span>
                      <span className="font-mono">
                        LKR {viewingStatement.adjustmentsAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {viewingStatement.penaltiesClawback > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Debtor Penalty / Clawback:</span>
                      <span className="font-mono">
                        - LKR {viewingStatement.penaltiesClawback.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-indigo-200 flex justify-between items-center text-sm font-bold text-indigo-950">
                    <span>TOTAL NET PAYABLE:</span>
                    <span className="font-mono text-base text-emerald-700">
                      LKR {viewingStatement.netPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Three Official Authorization Signatures Block (Page 34 requirement) */}
              <div className="pt-6 border-t border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-4 tracking-wider">
                  Official Verification & Approval Signatures (Four-Eyes Principle)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Prepared By</div>
                    <div className="h-10 flex items-center justify-center font-serif italic text-slate-700 font-semibold text-sm">
                      {viewingStatement.preparedBy}
                    </div>
                    <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-500">
                      Incentive Administrator
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified By (Finance)</div>
                    <div className="h-10 flex items-center justify-center font-serif italic text-slate-700 font-semibold text-sm">
                      {viewingStatement.verifiedBy || "Finance - M. Jayasinghe"}
                    </div>
                    <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-500">
                      Finance & Accounts Division
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Authorized By (HOD / CEO)</div>
                    <div className="h-10 flex items-center justify-center font-serif italic text-slate-700 font-semibold text-sm">
                      {viewingStatement.approvedBy || "HOD Sales - T. Aloka"}
                    </div>
                    <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-500">
                      Department Head / Director
                    </div>
                  </div>
                </div>
              </div>

              {/* Dispute Contact Footnote */}
              <div className="text-center text-[11px] text-slate-400 pt-2">
                For queries or disputes regarding calculation lines, please contact Sales Operations / Finance within 7 days of statement issuance.
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="bg-slate-50 px-6 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Click <strong>&quot;Print Pay Slip&quot;</strong> to open the print preview or save as an official PDF document.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingStatement(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-9 px-4 text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Print Pay Slip
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT STATEMENT MODAL (FULL CRUD FORM)                  */}
      {/* ========================================================================= */}
      {isEditing && editingStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">
                  {statements.some((s) => s.id === editingStatement.id)
                    ? "Edit Participant Statement"
                    : "Generate New Participant Statement"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Statement No</label>
                  <input
                    type="text"
                    value={editingStatement.statementNo || ""}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, statementNo: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Participant Name *</label>
                  <input
                    type="text"
                    value={editingStatement.participantName || ""}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, participantName: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-semibold"
                    placeholder="e.g. Thisara Tharanga"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sales Code</label>
                  <input
                    type="text"
                    value={editingStatement.salesCode || ""}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, salesCode: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                    placeholder="025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingStatement.designation || ""}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, designation: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Division</label>
                  <select
                    value={editingStatement.division || "RLC Sales"}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, division: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="RLC Sales">RLC Sales</option>
                    <option value="RLC Service">RLC Service</option>
                    <option value="Dealer Network">Dealer Network</option>
                    <option value="Key Accounts">Key Accounts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Period</label>
                  <input
                    type="text"
                    value={editingStatement.period || "April 2026"}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, period: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Calculation Run No</label>
                  <input
                    type="text"
                    value={editingStatement.runNo || "INC-RUN-2026-04-RLC"}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, runNo: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Payment Lag (Months)</label>
                  <input
                    type="number"
                    value={editingStatement.paymentLagMonths ?? 3}
                    onChange={(e) =>
                      setEditingStatement({
                        ...editingStatement,
                        paymentLagMonths: parseInt(e.target.value, 10) || 3,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Disbursement Month</label>
                  <input
                    type="text"
                    value={editingStatement.disbursementMonth || "July 2026"}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, disbursementMonth: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              {/* Financial Amounts Grid */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="font-semibold text-slate-800 block text-xs">
                  Earnings Breakdown (LKR)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Payable Commission</label>
                    <input
                      type="number"
                      value={editingStatement.payableCommission ?? 0}
                      onChange={(e) =>
                        setEditingStatement({
                          ...editingStatement,
                          payableCommission: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border rounded border-slate-300 font-mono text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Target Incentive (Vol/Turnover)</label>
                    <input
                      type="number"
                      value={editingStatement.targetIncentive ?? 0}
                      onChange={(e) =>
                        setEditingStatement({
                          ...editingStatement,
                          targetIncentive: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border rounded border-slate-300 font-mono text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Service Allowance</label>
                    <input
                      type="number"
                      value={editingStatement.serviceAllowance ?? 0}
                      onChange={(e) =>
                        setEditingStatement({
                          ...editingStatement,
                          serviceAllowance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border rounded border-slate-300 font-mono text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Adjustments (+) </label>
                    <input
                      type="number"
                      value={editingStatement.adjustmentsAmount ?? 0}
                      onChange={(e) =>
                        setEditingStatement({
                          ...editingStatement,
                          adjustmentsAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border rounded border-slate-300 font-mono text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Penalties / Deductions (-)</label>
                    <input
                      type="number"
                      value={editingStatement.penaltiesClawback ?? 0}
                      onChange={(e) =>
                        setEditingStatement({
                          ...editingStatement,
                          penaltiesClawback: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border rounded border-slate-300 font-mono text-right text-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold text-emerald-800">
                      Calculated Net Payable
                    </label>
                    <div className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded font-mono font-bold text-emerald-700 text-right">
                      LKR{" "}
                      {(
                        (Number(editingStatement.payableCommission) || 0) +
                        (Number(editingStatement.targetIncentive) || 0) +
                        (Number(editingStatement.serviceAllowance) || 0) +
                        (Number(editingStatement.adjustmentsAmount) || 0) -
                        (Number(editingStatement.penaltiesClawback) || 0)
                      ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank & Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={editingStatement.bankName || "Commercial Bank"}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, bankName: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bank Account No</label>
                  <input
                    type="text"
                    value={editingStatement.bankAccountNo || ""}
                    onChange={(e) =>
                      setEditingStatement({ ...editingStatement, bankAccountNo: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editingStatement.notes || ""}
                  onChange={(e) =>
                    setEditingStatement({ ...editingStatement, notes: e.target.value })
                  }
                  className="w-full p-2 border rounded border-slate-300 text-xs"
                  placeholder="Additional audit remarks..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveStatement}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Statement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {deletingStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Delete Participant Statement</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete statement{" "}
              <strong className="text-slate-900">{deletingStatement.statementNo}</strong> for{" "}
              <strong className="text-slate-900">{deletingStatement.participantName}</strong>? This will remove the record and all associated line items permanently from PostgreSQL.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingStatement(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteStatement}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Statement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print-specific CSS styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-payslip, #printable-payslip * {
            visibility: visible;
          }
          #printable-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
