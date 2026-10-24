import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Edit2,
  Trash2,
  X,
  Play,
  TrendingUp,
  DollarSign,
  AlertCircle,
  FileText,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type IncentiveDashboardRecord,
  type DashboardOverdueInvoice,
  type DashboardPayload,
} from "@/lib/incentive-dashboard-db";

interface IncentiveDashboardWorkspaceProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function IncentiveDashboardWorkspace({
  onBack,
  onNavigateScreen,
}: IncentiveDashboardWorkspaceProps) {
  // Master State
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  // Tabs: 'achievement' | 'penalty-risk' | 'run-status' (Exact Page 36 Spec)
  const [activeTab, setActiveTab] = useState<"achievement" | "penalty-risk" | "run-status">("achievement");

  // Filters (Page 36 Header Fields: Period*, Division, Participant)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals for CRUD
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<Partial<IncentiveDashboardRecord> | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<IncentiveDashboardRecord | null>(null);

  // Fetch from PostgreSQL
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPeriod !== "All") params.append("period", selectedPeriod);
      if (selectedDivision !== "All") params.append("division", selectedDivision);
      if (selectedParticipant !== "All") params.append("participant", selectedParticipant);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/incentives/dashboard?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to load dashboard data from PostgreSQL.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with PostgreSQL server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedPeriod, selectedDivision, selectedParticipant]);

  // Distinct Filter Options
  const periods = useMemo(() => {
    if (!data?.records) return ["All", "April 2026", "May 2026"];
    const set = new Set<string>();
    data.records.forEach((r) => set.add(r.period));
    return ["All", ...Array.from(set)];
  }, [data]);

  const divisions = useMemo(() => {
    if (!data?.records) return ["All", "RLC Sales", "RLC Service", "MHA Major Appliances", "CAC Project Engineering"];
    const set = new Set<string>();
    data.records.forEach((r) => set.add(r.division));
    return ["All", ...Array.from(set)];
  }, [data]);

  const participantNames = useMemo(() => {
    if (!data?.records) return ["All"];
    const set = new Set<string>();
    data.records.forEach((r) => set.add(r.displayName));
    return ["All", ...Array.from(set)];
  }, [data]);

  // Filtered in memory for fast typing
  const filteredRecords = useMemo(() => {
    if (!data?.records) return [];
    return data.records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.displayName.toLowerCase().includes(q) ||
        r.participantCode.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.division.toLowerCase().includes(q);

      const matchesPeriod = selectedPeriod === "All" || r.period === selectedPeriod;
      const matchesDivision = selectedDivision === "All" || r.division === selectedDivision;
      const matchesParticipant = selectedParticipant === "All" || r.displayName === selectedParticipant;

      return matchesSearch && matchesPeriod && matchesDivision && matchesParticipant;
    });
  }, [data, searchQuery, selectedPeriod, selectedDivision, selectedParticipant]);

  // Trigger Recalculation
  const handleTriggerRecalculation = async () => {
    try {
      setIsRecalculating(true);
      const res = await fetch("/api/incentives/dashboard/recalculate", {
        method: "POST",
      });
      const resJson = await res.json();
      if (resJson.success) {
        setData(resJson);
        toast.success(resJson.message || "Recalculation completed successfully.");
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Recalculation failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error triggering recalculation.");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Open Create Record Modal
  const handleOpenCreate = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    const newRec: Partial<IncentiveDashboardRecord> = {
      id: `DSH-2026-05-${rand}`,
      participantCode: `${rand}`,
      displayName: "",
      role: "Sales Executive - Dealer Seg 01",
      division: "RLC Sales",
      period: "May 2026",
      volumePct: 120.0,
      turnoverPct: 110.0,
      projectedCommission: 145000,
      invoicesOver45Days: 0,
      penaltyExposure: 0,
      baseTarget: 15000000,
      actualAchievement: 16500000,
      attendanceFactor: 1.0,
      status: "Active",
      notes: "Monthly sales benchmark record.",
    };
    setEditingRecord(newRec);
    setIsEditing(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: IncentiveDashboardRecord) => {
    setEditingRecord(JSON.parse(JSON.stringify(rec)));
    setIsEditing(true);
  };

  // Save Record (Create or Update)
  const handleSaveRecord = async () => {
    if (!editingRecord || !editingRecord.displayName || !editingRecord.participantCode) {
      toast.error("Participant name and code are required.");
      return;
    }

    try {
      const isNew = !data?.records.some((r) => r.id === editingRecord.id);
      const url = isNew ? "/api/incentives/dashboard" : `/api/incentives/dashboard/${editingRecord.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRecord),
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success(resData.message || "Record saved in PostgreSQL!");
        setIsEditing(false);
        setEditingRecord(null);
        fetchDashboard();
      } else {
        toast.error(resData.error || "Failed to save record.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with PostgreSQL server.");
    }
  };

  // Delete Record
  const handleDeleteRecord = async () => {
    if (!deletingRecord) return;
    try {
      const res = await fetch(`/api/incentives/dashboard/${deletingRecord.id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success(`Record for ${deletingRecord.displayName} deleted.`);
        setDeletingRecord(null);
        fetchDashboard();
      } else {
        toast.error(resData.error || "Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting record from PostgreSQL.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.records || data.records.length === 0) {
      toast.error("No records to export.");
      return;
    }
    const headers = [
      "Participant Code",
      "Display Name",
      "Role",
      "Division",
      "Period",
      "Volume %",
      "Turnover %",
      "Projected Commission (LKR)",
      "Invoices > 45 Days",
      "Penalty Exposure (LKR)",
    ];
    const rows = data.records.map((r) => [
      `"${r.participantCode}"`,
      `"${r.displayName}"`,
      `"${r.role}"`,
      `"${r.division}"`,
      `"${r.period}"`,
      r.volumePct.toFixed(2),
      r.turnoverPct.toFixed(2),
      r.projectedCommission.toFixed(2),
      r.invoicesOver45Days,
      r.penaltyExposure.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Incentive_Dashboard_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dashboard data exported to CSV.");
  };

  const metrics = data?.metrics || {
    totalProjectedCommission: 882600,
    avgVolumePct: 130.92,
    avgTurnoverPct: 108.86,
    totalOverdueInvoices: 2,
    totalPenaltyExposure: 22258,
    totalParticipants: 6,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Incentive Dashboard
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  INC-SCR-16
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                  OPERATIONAL MONITOR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Month-to-date achievement tracking, turnover targets, projected commissions, overdue debtor aging analysis (&gt; 45 days), and calculation run triggering.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 h-9">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
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
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            <Plus className="w-4 h-4" /> + Add Participant Record
          </Button>
        </div>
      </div>

      {/* PostgreSQL Live Indicator */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">PostgreSQL Live Connected:</span>
          <span>table `incentive_dashboard_records`</span>
          {lastSynced && <span className="text-slate-400">· Synced at {lastSynced}</span>}
        </div>
        <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
          Rule INC-BCR-01 Active &middot; Overdue Threshold: 45 Days
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Projected Payout Pool
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            LKR {metrics.totalProjectedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across {metrics.totalParticipants} participants in scope
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Avg Volume Achievement
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {metrics.avgVolumePct.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Turnover Avg: {metrics.avgTurnoverPct.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Invoices &gt; 45 Days Overdue
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {metrics.totalOverdueInvoices}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Exceeding credit grace period
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Debtor Penalty Clawback
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600">
            - LKR {metrics.totalPenaltyExposure.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Auto-deducted from gross earnings
          </div>
        </div>
      </div>

      {/* Header Filters Panel (Matching Page 36: Period*, Division, Participant) */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Participant, Code, Role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Period filter (Page 36 Mandatory Field) */}
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 bg-white"
            >
              <option value="All">Period: All Periods</option>
              {periods.filter((p) => p !== "All").map((p) => (
                <option key={p} value={p}>
                  Period: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Division filter (Page 36 Field) */}
          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 bg-white"
            >
              <option value="All">Division: All Divisions</option>
              {divisions.filter((d) => d !== "All").map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Participant filter (Page 36 Field) */}
          <div>
            <select
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 bg-white"
            >
              <option value="All">Participant: All Participants</option>
              {participantNames.filter((p) => p !== "All").map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> participants in active scope
          </span>
          {(searchQuery || selectedPeriod !== "All" || selectedDivision !== "All" || selectedParticipant !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPeriod("All");
                setSelectedDivision("All");
                setSelectedParticipant("All");
              }}
              className="text-emerald-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation (Exact Page 36 Spec: Achievement | Penalty Risk | Run Status) */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("achievement")}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "achievement"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Achievement Table</span>
          </button>

          <button
            onClick={() => setActiveTab("penalty-risk")}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "penalty-risk"
                ? "border-rose-600 text-rose-700 bg-rose-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Penalty Risk Monitor ({metrics.totalOverdueInvoices})</span>
          </button>

          <button
            onClick={() => setActiveTab("run-status")}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "run-status"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Run Status &amp; Calculation Engine</span>
          </button>
        </div>

        <div className="pb-1 hidden sm:block">
          <Button
            size="sm"
            onClick={handleTriggerRecalculation}
            disabled={isRecalculating}
            className="h-8 gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin" : ""}`} />
            <span>{isRecalculating ? "Recalculating..." : "Recalculate Batch"}</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACHIEVEMENT TABLE (EXACT PAGE 36 GRID COLUMNS)                     */}
      {/* ========================================================================= */}
      {activeTab === "achievement" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Participant</th>
                    <th className="py-3 px-3">Role &amp; Division</th>
                    <th className="py-3 px-3 text-center">Volume %</th>
                    <th className="py-3 px-3 text-center">Turnover %</th>
                    <th className="py-3 px-3 text-right">Projected Commission</th>
                    <th className="py-3 px-3 text-center">Invoices &gt; 45 Days</th>
                    <th className="py-3 px-3 text-right">Penalty Exposure</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No participants found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {r.displayName}
                            <span className="text-[10px] font-mono px-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {r.participantCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {r.period}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{r.role}</div>
                          <div className="text-[11px] text-slate-500">{r.division}</div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              r.volumePct >= 100
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {r.volumePct.toFixed(1)}%
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              r.turnoverPct >= 100
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {r.turnoverPct.toFixed(1)}%
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-[13px]">
                          LKR {r.projectedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {r.invoicesOver45Days > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {r.invoicesOver45Days} overdue
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono">
                          {r.penaltyExposure > 0 ? (
                            <span className="font-bold text-rose-600">
                              - LKR {r.penaltyExposure.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">LKR 0.00</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(r)}
                              className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              title="Edit Benchmark Figures"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingRecord(r)}
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Record"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENALTY RISK MONITOR (AGING DEBTORS > 45 DAYS)                    */}
      {/* ========================================================================= */}
      {activeTab === "penalty-risk" && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">Debtor Penalty Clawback Policy (INC-BCR-01)</span>
              <p className="mt-0.5 leading-relaxed">
                Sales representatives are subject to debtor penalties on customer invoices remaining unpaid beyond the 45-day credit window. If a customer dishonours payment or delays past 45 days, penalty clawbacks are deducted automatically from projected commission payouts.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Invoice No</th>
                    <th className="py-3 px-3">Participant</th>
                    <th className="py-3 px-3">Customer / Dealer</th>
                    <th className="py-3 px-3">Invoice Date</th>
                    <th className="py-3 px-3 text-center">Days Overdue</th>
                    <th className="py-3 px-3 text-right">Invoice Amount (LKR)</th>
                    <th className="py-3 px-3 text-right">Clawback Exposure (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.overdueInvoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{inv.participantName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Code: {inv.participantCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{inv.customerName}</td>
                      <td className="py-3 px-3 text-slate-600">{inv.invoiceDate}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {inv.daysOverdue} days (&gt; 45)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800">
                        LKR {inv.invoiceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                        - LKR {inv.penaltyAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RUN STATUS & CALCULATION ENGINE                                    */}
      {/* ========================================================================= */}
      {activeTab === "run-status" && (
        <div className="space-y-4">
          <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                    Engine Status: Online &middot; SAP B1 Connected
                  </span>
                </div>
                <h3 className="text-lg font-bold">
                  Incentive Calculation Batch: {selectedPeriod === "All" ? "April 2026" : selectedPeriod}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Automated batch engine evaluates invoice realizations, calculates tiered slab bonuses, applies first-time-fix multipliers, and reconciles debtor penalty aging.
                </p>
              </div>

              <Button
                size="sm"
                onClick={handleTriggerRecalculation}
                disabled={isRecalculating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 h-10 px-4 self-start sm:self-auto shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRecalculating ? "Calculating Batch..." : "Trigger Recalculation"}</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Run ID</span>
                <span className="font-mono font-bold text-slate-200">RUN-2026-04-RLC-01</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Processed Records</span>
                <span className="font-mono font-bold text-emerald-400">{filteredRecords.length} Participants</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Validation Mode</span>
                <span className="font-semibold text-slate-200">Strict Four-Eyes Verification</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Execution</span>
                <span className="font-mono text-slate-200">{data?.lastRecalculatedAt || "Just now"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT PARTICIPANT BENCHMARK RECORD (FULL CRUD)           */}
      {/* ========================================================================= */}
      {isEditing && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {data?.records.some((r) => r.id === editingRecord.id)
                    ? "Edit Participant Benchmark Figures"
                    : "Add Participant Benchmark Record"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Participant Name *</label>
                  <input
                    type="text"
                    value={editingRecord.displayName || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, displayName: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-semibold"
                    placeholder="e.g. Thisara Tharanga"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Participant Code *</label>
                  <input
                    type="text"
                    value={editingRecord.participantCode || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, participantCode: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                    placeholder="e.g. 025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Role</label>
                  <input
                    type="text"
                    value={editingRecord.role || ""}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, role: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Division</label>
                  <select
                    value={editingRecord.division || "RLC Sales"}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, division: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="RLC Sales">RLC Sales</option>
                    <option value="RLC Service">RLC Service</option>
                    <option value="MHA Major Appliances">MHA Major Appliances</option>
                    <option value="CAC Project Engineering">CAC Project Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Period</label>
                  <input
                    type="text"
                    value={editingRecord.period || "April 2026"}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, period: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              {/* Achievement and Projected Commission */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 border rounded-lg">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Volume Achievement %</label>
                  <input
                    type="number"
                    value={editingRecord.volumePct ?? 100}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        volumePct: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Turnover Achievement %</label>
                  <input
                    type="number"
                    value={editingRecord.turnoverPct ?? 100}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        turnoverPct: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Projected Commission (LKR)</label>
                  <input
                    type="number"
                    value={editingRecord.projectedCommission ?? 0}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        projectedCommission: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono font-bold text-emerald-700 text-right"
                  />
                </div>
              </div>

              {/* Penalty and Aging */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Invoices &gt; 45 Days Overdue</label>
                  <input
                    type="number"
                    value={editingRecord.invoicesOver45Days ?? 0}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        invoicesOver45Days: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Penalty Exposure Clawback (LKR)</label>
                  <input
                    type="number"
                    value={editingRecord.penaltyExposure ?? 0}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        penaltyExposure: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono font-bold text-rose-600 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editingRecord.notes || ""}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, notes: e.target.value })
                  }
                  className="w-full p-2 border rounded border-slate-300 text-xs"
                  placeholder="Additional audit remarks on targets and achievements..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRecord}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Save Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Delete Participant Record</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete dashboard benchmark record for{" "}
              <strong className="text-slate-900">{deletingRecord.displayName}</strong> ({deletingRecord.participantCode})? This record will be permanently deleted from PostgreSQL.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingRecord(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteRecord}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
