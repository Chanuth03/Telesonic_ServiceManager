import React, { useState, useEffect, useMemo } from "react";
import {
  HelpCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  UserCheck,
  Building2,
  FileText,
  ShieldCheck,
  Send,
  X,
  TrendingUp,
  Receipt,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type DisputeRecord,
  type DisputeStatus,
  type DisputePriority,
} from "@/lib/dispute-query-db";

interface DisputeResolutionViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function DisputeResolutionView({
  onBack,
  onNavigateScreen,
}: DisputeResolutionViewProps) {
  // Master State
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");

  // Modals
  const [viewingDispute, setViewingDispute] = useState<DisputeRecord | null>(null);
  const [resolvingDispute, setResolvingDispute] = useState<DisputeRecord | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingDispute, setEditingDispute] = useState<Partial<DisputeRecord> | null>(null);
  const [deletingDispute, setDeletingDispute] = useState<DisputeRecord | null>(null);

  // Resolution Form State
  const [resolutionStatus, setResolutionStatus] = useState<DisputeStatus>("Resolved");
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [resolutionAction, setResolutionAction] = useState<string>("");
  const [investigationNotes, setInvestigationNotes] = useState<string>("");

  // Fetch from PostgreSQL
  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPeriod !== "All") params.append("period", selectedPeriod);
      if (selectedDivision !== "All") params.append("division", selectedDivision);
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (selectedPriority !== "All") params.append("priority", selectedPriority);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/incentives/disputes?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.disputes)) {
        setDisputes(data.disputes);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to load disputes from PostgreSQL.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with PostgreSQL server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [selectedPeriod, selectedDivision, selectedStatus, selectedPriority]);

  // Filter in memory for instant typing
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.disputeNo.toLowerCase().includes(q) ||
        d.participantName.toLowerCase().includes(q) ||
        (d.salesCode && d.salesCode.toLowerCase().includes(q)) ||
        d.category.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (d.statementRef && d.statementRef.toLowerCase().includes(q));

      const matchesPeriod = selectedPeriod === "All" || d.period === selectedPeriod;
      const matchesDivision = selectedDivision === "All" || d.division === selectedDivision;
      const matchesStatus = selectedStatus === "All" || d.status === selectedStatus;
      const matchesPriority = selectedPriority === "All" || d.priority === selectedPriority;

      return matchesSearch && matchesPeriod && matchesDivision && matchesStatus && matchesPriority;
    });
  }, [disputes, searchQuery, selectedPeriod, selectedDivision, selectedStatus, selectedPriority]);

  // Aggregates & KPIs
  const totalCount = disputes.length;
  const pendingCount = disputes.filter(
    (d) => d.status === "New" || d.status === "Under Investigation",
  ).length;
  const resolvedCount = disputes.filter((d) => d.status === "Resolved" || d.status === "Approved").length;
  const totalClaimedPool = disputes.reduce((acc, d) => acc + (Number(d.claimedAmount) || 0), 0);
  const totalApprovedPool = disputes.reduce((acc, d) => acc + (Number(d.approvedAmount) || 0), 0);

  // Distinct Periods and Divisions
  const periods = useMemo(() => {
    const set = new Set<string>();
    disputes.forEach((d) => set.add(d.period));
    return ["All", ...Array.from(set)];
  }, [disputes]);

  const divisions = useMemo(() => {
    const set = new Set<string>();
    disputes.forEach((d) => set.add(d.division));
    return ["All", ...Array.from(set)];
  }, [disputes]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newDisp: Partial<DisputeRecord> = {
      id: `DSP-2026-05-${rand}`,
      disputeNo: `DSP-2026-05-${rand}`,
      participantId: "EMP-1025",
      salesCode: "025",
      participantName: "Thisara Tharanga",
      designation: "Sales Executive - Dealer Seg 01",
      division: "RLC Sales",
      period: "May 2026",
      statementRef: "SLIP-2026-04-025",
      category: "Receipt Realisation Timing",
      priority: "High",
      claimedAmount: 7500,
      approvedAmount: 0,
      status: "New",
      description: "Query regarding realization date of Dealer Invoice INV-9104. Customer paid on 28th April.",
      assignedTo: "Dilani Silva (Finance)",
    };
    setEditingDispute(newDisp);
    setIsEditing(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (disp: DisputeRecord) => {
    setEditingDispute(JSON.parse(JSON.stringify(disp)));
    setIsEditing(true);
  };

  // Save Dispute (Create or Update)
  const handleSaveDispute = async () => {
    if (!editingDispute || !editingDispute.participantName || !editingDispute.description) {
      toast.error("Participant name and query description are required.");
      return;
    }

    try {
      const isNew = !disputes.some((d) => d.id === editingDispute.id);
      const url = isNew ? "/api/incentives/disputes" : `/api/incentives/disputes/${editingDispute.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDispute),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Dispute record saved successfully in PostgreSQL!");
        setIsEditing(false);
        setEditingDispute(null);
        fetchDisputes();
      } else {
        toast.error(data.error || "Failed to save dispute record.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with PostgreSQL server.");
    }
  };

  // Open Resolve Workflow Modal
  const handleOpenResolveModal = (disp: DisputeRecord) => {
    setResolvingDispute(disp);
    setResolutionStatus("Resolved");
    setApprovedAmount(disp.claimedAmount || 0);
    setResolutionAction(
      disp.resolutionAction ||
        `Adjustment credit voucher ADJ-2026-${Math.floor(100 + Math.random() * 900)} generated. Credited to next payout run.`,
    );
    setInvestigationNotes(
      disp.investigationNotes ||
        "Investigation completed. Source documents verified with Accounts and Operations registers.",
    );
  };

  // Submit Resolution
  const handleSubmitResolution = async () => {
    if (!resolvingDispute) return;
    try {
      const res = await fetch(`/api/incentives/disputes/${resolvingDispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: resolutionStatus,
          approvedAmount: resolutionStatus === "Rejected" ? 0 : Number(approvedAmount),
          resolutionAction,
          investigationNotes,
          resolvedBy: "Nimal Perera (Service Manager)",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Dispute ${resolvingDispute.disputeNo} updated.`);
        setResolvingDispute(null);
        fetchDisputes();
      } else {
        toast.error(data.error || "Failed to resolve dispute.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resolving dispute.");
    }
  };

  // Delete Dispute
  const handleDeleteDispute = async () => {
    if (!deletingDispute) return;
    try {
      const res = await fetch(`/api/incentives/disputes/${deletingDispute.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Dispute ${deletingDispute.disputeNo} deleted successfully.`);
        setDeletingDispute(null);
        fetchDisputes();
      } else {
        toast.error(data.error || "Failed to delete dispute.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting dispute from PostgreSQL.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (disputes.length === 0) {
      toast.error("No disputes to export.");
      return;
    }
    const headers = [
      "Dispute No",
      "Participant",
      "Sales Code",
      "Division",
      "Period",
      "Category",
      "Priority",
      "Claimed (LKR)",
      "Approved (LKR)",
      "Status",
      "Statement Ref",
      "Assigned To",
      "Resolved By",
    ];
    const rows = disputes.map((d) => [
      `"${d.disputeNo}"`,
      `"${d.participantName}"`,
      `"${d.salesCode || ""}"`,
      `"${d.division}"`,
      `"${d.period}"`,
      `"${d.category}"`,
      `"${d.priority}"`,
      d.claimedAmount.toFixed(2),
      d.approvedAmount.toFixed(2),
      `"${d.status}"`,
      `"${d.statementRef || ""}"`,
      `"${d.assignedTo || ""}"`,
      `"${d.resolvedBy || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dispute_Resolution_Log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dispute log exported to CSV.");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Dispute & Query Resolution Log
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200">
                  INC-SCR-14
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                  SETTLEMENTS & STATEMENTS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Log participant calculation queries, investigate invoice/job disputes, track four-eyes approval workflow, and generate credit note adjustments.
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
            onClick={fetchDisputes}
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
            className="gap-1.5 h-9 bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            <Plus className="w-4 h-4" /> + Log New Dispute
          </Button>
        </div>
      </div>

      {/* PostgreSQL Status Bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">PostgreSQL Live Connected:</span>
          <span>table `incentive_disputes`</span>
          {lastSynced && <span className="text-slate-400">· Synced at {lastSynced}</span>}
        </div>
        <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
          Four-Eyes Dispute Resolution Active
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Queries Logged
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="mt-1 text-xs text-slate-500">
            Across sales reps & service technicians
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Pending Investigation
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{pendingCount}</div>
          <div className="mt-1 text-xs text-slate-500">
            New & in-progress inquiries
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Resolved & Credited
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{resolvedCount}</div>
          <div className="mt-1 text-xs text-slate-500">
            Approved with adjustments
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Approved Value
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            LKR {totalApprovedPool.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Claimed: LKR {totalClaimedPool.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Dispute No, Participant, Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Period filter */}
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 bg-white"
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
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 bg-white"
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
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Approved">Approved</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t">
          <span>
            Showing <strong className="text-slate-800">{filteredDisputes.length}</strong> of {disputes.length} dispute inquiries
          </span>
          {(searchQuery || selectedPeriod !== "All" || selectedDivision !== "All" || selectedStatus !== "All" || selectedPriority !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPeriod("All");
                setSelectedDivision("All");
                setSelectedStatus("All");
                setSelectedPriority("All");
              }}
              className="text-amber-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Disputes Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Dispute Ref</th>
                <th className="py-3 px-3">Participant & Code</th>
                <th className="py-3 px-3">Division & Period</th>
                <th className="py-3 px-3">Category & Priority</th>
                <th className="py-3 px-3 text-right">Claimed</th>
                <th className="py-3 px-3 text-right">Approved</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Assigned / Resolved</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No dispute inquiries found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((disp, idx) => (
                  <tr
                    key={disp.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setViewingDispute(disp)}
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-amber-800 flex items-center gap-1.5 font-mono">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        {disp.disputeNo}
                      </div>
                      {disp.statementRef && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Slip: {disp.statementRef}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {disp.participantName}
                        {disp.salesCode && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1 rounded border border-slate-200">
                            {disp.salesCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {disp.designation}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{disp.division}</div>
                      <div className="text-[11px] text-slate-500">{disp.period}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{disp.category}</div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold mt-0.5 ${
                          disp.priority === "Critical"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : disp.priority === "High"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : disp.priority === "Medium"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {disp.priority}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-900 font-semibold">
                      LKR {disp.claimedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      LKR {disp.approvedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          disp.status === "Resolved"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : disp.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : disp.status === "Under Investigation"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : disp.status === "Rejected"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {disp.status === "Resolved" && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                        {disp.status === "Under Investigation" && <Clock className="w-2.5 h-2.5 mr-1" />}
                        {disp.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-xs">
                      {disp.resolvedBy ? (
                        <div>
                          <span className="font-semibold text-slate-800">{disp.resolvedBy}</span>
                          <div className="text-[10px] text-slate-400">{disp.resolvedAt}</div>
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          Assigned: <span className="font-medium">{disp.assignedTo || "Unassigned"}</span>
                        </div>
                      )}
                    </td>

                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenResolveModal(disp)}
                          className="h-7 px-2.5 text-xs font-semibold gap-1 text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200"
                          title="Investigate & Resolve"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Resolve</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(disp)}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          title="Edit Dispute"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingDispute(disp)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Dispute"
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
      {/* MODAL 1: VIEW DETAILS MODAL                                               */}
      {/* ========================================================================= */}
      {viewingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">Dispute Query Dossier</h3>
                  <p className="text-xs text-slate-300">
                    Ref: {viewingDispute.disputeNo} · {viewingDispute.participantName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDispute(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 border rounded-lg">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Participant
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingDispute.participantName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Sales Code
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {viewingDispute.salesCode || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Claimed Amount
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    LKR {viewingDispute.claimedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Approved Amount
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    LKR {viewingDispute.approvedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">Query / Discrepancy Description:</span>
                <p className="p-3 bg-amber-50/50 border border-amber-200 rounded text-slate-700 leading-relaxed">
                  {viewingDispute.description}
                </p>
              </div>

              {viewingDispute.investigationNotes && (
                <div>
                  <span className="font-semibold text-slate-800 block mb-1">Investigation Audit Findings:</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-relaxed">
                    {viewingDispute.investigationNotes}
                  </p>
                </div>
              )}

              {viewingDispute.resolutionAction && (
                <div>
                  <span className="font-semibold text-emerald-800 block mb-1">Resolution & Credit Note Action:</span>
                  <p className="p-3 bg-emerald-50/60 border border-emerald-200 rounded text-emerald-900 leading-relaxed font-mono">
                    {viewingDispute.resolutionAction}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t text-[11px] text-slate-500">
                <div>
                  Assigned Investigator: <strong className="text-slate-700">{viewingDispute.assignedTo || "Unassigned"}</strong>
                </div>
                <div>
                  Resolved By: <strong className="text-slate-700">{viewingDispute.resolvedBy || "Pending"}</strong>
                  {viewingDispute.resolvedAt && <span> ({viewingDispute.resolvedAt})</span>}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingDispute(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const d = viewingDispute;
                  setViewingDispute(null);
                  handleOpenResolveModal(d);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Resolve Dispute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INVESTIGATION & RESOLUTION WORKFLOW MODAL                         */}
      {/* ========================================================================= */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-amber-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base">Investigate & Resolve Dispute</h3>
                  <p className="text-xs text-amber-100">
                    Ref: {resolvingDispute.disputeNo} · {resolvingDispute.participantName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResolvingDispute(null)}
                className="p-1 rounded-md text-amber-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="font-semibold text-amber-900 mb-1">
                  Claimed Query: {resolvingDispute.category}
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {resolvingDispute.description}
                </p>
                <div className="mt-2 text-[11px] font-semibold text-slate-700">
                  Claimed Amount: LKR {resolvingDispute.claimedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Decision / Target Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResolutionStatus("Resolved");
                      setApprovedAmount(resolvingDispute.claimedAmount);
                    }}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
                      resolutionStatus === "Resolved"
                        ? "bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Resolved & Credit
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionStatus("Under Investigation")}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
                      resolutionStatus === "Under Investigation"
                        ? "bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> In Review
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResolutionStatus("Rejected");
                      setApprovedAmount(0);
                    }}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
                      resolutionStatus === "Rejected"
                        ? "bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Reject Claim
                  </button>
                </div>
              </div>

              {resolutionStatus !== "Rejected" && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Approved Credit Amount (LKR) *</label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Investigation Notes & Evidence *</label>
                <textarea
                  rows={3}
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 text-xs"
                  placeholder="Audit details, invoice receipt verification, attendance log review..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Resolution Action / Credit Note Memo *</label>
                <textarea
                  rows={2}
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 font-mono text-xs"
                  placeholder="Credit adjustment memo or explanation of decision..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResolvingDispute(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitResolution}
                className="bg-amber-700 hover:bg-amber-800 text-white font-semibold"
              >
                Submit Decision
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE / EDIT DISPUTE MODAL (FULL CRUD)                         */}
      {/* ========================================================================= */}
      {isEditing && editingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {disputes.some((d) => d.id === editingDispute.id)
                    ? "Edit Dispute Record"
                    : "Log New Dispute / Calculation Query"}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Dispute Ref</label>
                  <input
                    type="text"
                    value={editingDispute.disputeNo || ""}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, disputeNo: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Participant Name *</label>
                  <input
                    type="text"
                    value={editingDispute.participantName || ""}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, participantName: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sales Code</label>
                  <input
                    type="text"
                    value={editingDispute.salesCode || ""}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, salesCode: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingDispute.designation || ""}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, designation: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Division</label>
                  <select
                    value={editingDispute.division || "RLC Sales"}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, division: e.target.value })
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
                    value={editingDispute.period || "April 2026"}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, period: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category *</label>
                  <select
                    value={editingDispute.category || "Receipt Realisation Timing"}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, category: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="Receipt Realisation Timing">Receipt Realisation Timing</option>
                    <option value="Missing Job Sheet / Closed Order">Missing Job Sheet / Closed Order</option>
                    <option value="Slab Tier Threshold Query">Slab Tier Threshold Query</option>
                    <option value="Attendance Penalty Waiver">Attendance Penalty Waiver</option>
                    <option value="Debtor Clawback Discrepancy">Debtor Clawback Discrepancy</option>
                    <option value="Special Discretionary Claim">Special Discretionary Claim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                  <select
                    value={editingDispute.priority || "Medium"}
                    onChange={(e) =>
                      setEditingDispute({
                        ...editingDispute,
                        priority: e.target.value as DisputePriority,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Claimed Amount (LKR) *</label>
                  <input
                    type="number"
                    value={editingDispute.claimedAmount ?? 0}
                    onChange={(e) =>
                      setEditingDispute({
                        ...editingDispute,
                        claimedAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono text-right font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Related Statement Slip No</label>
                  <input
                    type="text"
                    value={editingDispute.statementRef || ""}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, statementRef: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                    placeholder="SLIP-2026-04-025"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned Investigator</label>
                  <input
                    type="text"
                    value={editingDispute.assignedTo || "Dilani Silva (Finance)"}
                    onChange={(e) =>
                      setEditingDispute({ ...editingDispute, assignedTo: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Query / Discrepancy Description *</label>
                <textarea
                  rows={3}
                  value={editingDispute.description || ""}
                  onChange={(e) =>
                    setEditingDispute({ ...editingDispute, description: e.target.value })
                  }
                  className="w-full p-2 border rounded border-slate-300 text-xs"
                  placeholder="Explain the dispute details, missing invoice number, customer receipt..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveDispute}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
              >
                Save Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {deletingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Delete Dispute Query</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete dispute query{" "}
              <strong className="text-slate-900">{deletingDispute.disputeNo}</strong> for{" "}
              <strong className="text-slate-900">{deletingDispute.participantName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingDispute(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteDispute}
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
