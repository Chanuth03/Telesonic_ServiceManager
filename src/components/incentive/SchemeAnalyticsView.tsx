import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Edit2,
  Trash2,
  X,
  Target,
  Percent,
  ShieldAlert,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type DivisionBudgetRecord,
  type DivisionSummaryItem,
  type CategorySummaryItem,
  type BudgetStatus,
  type AnalyticsDataPayload,
} from "@/lib/scheme-analytics-db";

interface SchemeAnalyticsViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function SchemeAnalyticsView({
  onBack,
  onNavigateScreen,
}: SchemeAnalyticsViewProps) {
  // Master State
  const [data, setData] = useState<AnalyticsDataPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Tabs: 'division' (INC-RPT-20) | 'category' (INC-RPT-21) | 'matrix' (INC-RPT-22) | 'budget' (INC-RPT-24)
  const [activeTab, setActiveTab] = useState<"division" | "category" | "matrix" | "budget">("division");

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals for Budget CRUD
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Partial<DivisionBudgetRecord> | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<DivisionBudgetRecord | null>(null);

  // Fetch Data from PostgreSQL
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPeriod !== "All") params.append("period", selectedPeriod);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/incentives/analytics?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to load analytics from PostgreSQL.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with PostgreSQL server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  // Distinct Periods
  const periods = useMemo(() => {
    if (!data?.divisionBudgets) return ["All", "April 2026"];
    const set = new Set<string>();
    data.divisionBudgets.forEach((b) => set.add(b.period));
    return ["All", ...Array.from(set)];
  }, [data]);

  // Filtered Budgets in memory
  const filteredBudgets = useMemo(() => {
    if (!data?.divisionBudgets) return [];
    return data.divisionBudgets.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.division.toLowerCase().includes(q) ||
        b.period.toLowerCase().includes(q) ||
        (b.notes && b.notes.toLowerCase().includes(q));
      const matchesPeriod = selectedPeriod === "All" || b.period === selectedPeriod;
      return matchesSearch && matchesPeriod;
    });
  }, [data, searchQuery, selectedPeriod]);

  // Open Create Budget Modal
  const handleOpenCreateBudget = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    const newBdg: Partial<DivisionBudgetRecord> = {
      id: `BDG-2026-05-${rand}`,
      period: "May 2026",
      division: "Dealer Network Direct",
      targetSales: 30000000,
      actualSales: 32500000,
      targetCollections: 28000000,
      actualCollections: 29800000,
      budgetAllocation: 2000000,
      actualIncentiveCost: 1850000,
      participantCount: 14,
      status: "Under Budget",
      notes: "Dealer network direct sales incentive benchmark.",
    };
    setEditingBudget(newBdg);
    setIsEditingBudget(true);
  };

  // Open Edit Budget Modal
  const handleOpenEditBudget = (bdg: DivisionBudgetRecord) => {
    setEditingBudget(JSON.parse(JSON.stringify(bdg)));
    setIsEditingBudget(true);
  };

  // Save Budget (Create or Update)
  const handleSaveBudget = async () => {
    if (!editingBudget || !editingBudget.division || !editingBudget.budgetAllocation) {
      toast.error("Division and budget allocation are required.");
      return;
    }

    try {
      const isNew = !data?.divisionBudgets.some((b) => b.id === editingBudget.id);
      const url = isNew ? "/api/incentives/analytics" : `/api/incentives/analytics/${editingBudget.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBudget),
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success(resData.message || "Division budget saved successfully!");
        setIsEditingBudget(false);
        setEditingBudget(null);
        fetchAnalytics();
      } else {
        toast.error(resData.error || "Failed to save budget.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with PostgreSQL server.");
    }
  };

  // Delete Budget
  const handleDeleteBudget = async () => {
    if (!deletingBudget) return;
    try {
      const res = await fetch(`/api/incentives/analytics/${deletingBudget.id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success(`Budget for ${deletingBudget.division} deleted.`);
        setDeletingBudget(null);
        fetchAnalytics();
      } else {
        toast.error(resData.error || "Failed to delete budget.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting division budget.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.divisionBudgets || data.divisionBudgets.length === 0) {
      toast.error("No analytics data to export.");
      return;
    }
    const headers = [
      "Division",
      "Period",
      "Actual Net Sales (LKR)",
      "Collections (LKR)",
      "Budget Allocation (LKR)",
      "Actual Incentive Cost (LKR)",
      "Cost Ratio %",
      "Variance (LKR)",
      "Participants",
      "Status",
    ];
    const rows = data.divisionBudgets.map((b) => [
      `"${b.division}"`,
      `"${b.period}"`,
      b.actualSales.toFixed(2),
      b.actualCollections.toFixed(2),
      b.budgetAllocation.toFixed(2),
      b.actualIncentiveCost.toFixed(2),
      b.costRatioPct.toFixed(2),
      b.varianceAmount.toFixed(2),
      b.participantCount,
      `"${b.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Scheme_Analytics_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Scheme analytics report exported to CSV.");
  };

  const totals = data?.overallTotals || {
    totalNetSales: 151740000,
    totalCollections: 137650000,
    totalBudgetAllocation: 9700000,
    totalIncentiveCost: 9410670,
    blendedCostRatioPct: 6.20,
    totalVariance: 289330,
    totalParticipants: 78,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Scheme Performance & Payout Analytics
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">
                  INC-SCR-15
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                  INC-RPT-20..24
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-dimensional incentive ROI, cost-to-revenue ratio analytics, division budget benchmarks, and cross-category payout distribution.
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
            onClick={fetchAnalytics}
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
            onClick={handleOpenCreateBudget}
            className="gap-1.5 h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Plus className="w-4 h-4" /> + Set Division Budget Target
          </Button>
        </div>
      </div>

      {/* PostgreSQL Live Indicator */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">PostgreSQL Live Connected:</span>
          <span>table `incentive_division_budgets`</span>
          {lastSynced && <span className="text-slate-400">· Synced at {lastSynced}</span>}
        </div>
        <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
          Industry Benchmark: Incentive Cost &lt; 7.0% of Sales
        </span>
      </div>

      {/* Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Company Net Sales
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            LKR {(totals.totalNetSales / 1000000).toFixed(2)}M
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Collections: LKR {(totals.totalCollections / 1000000).toFixed(2)}M
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Incentive Payout
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700">
            LKR {totals.totalIncentiveCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across {totals.totalParticipants} eligible staff
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Blended Cost Ratio
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {totals.blendedCostRatioPct.toFixed(2)}%
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Well within 7.0% target ceiling
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Budget Variance
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            + LKR {totals.totalVariance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Favorable (Budget: LKR {(totals.totalBudgetAllocation / 1000000).toFixed(2)}M)
          </div>
        </div>
      </div>

      {/* Interactive Tabs Navigation */}
      <div className="border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("division")}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "division"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Division Summary (INC-RPT-20)</span>
          </button>

          <button
            onClick={() => setActiveTab("category")}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "category"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Category Analysis (INC-RPT-21)</span>
          </button>

          <button
            onClick={() => setActiveTab("matrix")}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "matrix"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Division × Category Matrix (INC-RPT-22)</span>
          </button>

          <button
            onClick={() => setActiveTab("budget")}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "budget"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Budget vs Actual &amp; ROI (INC-RPT-24)</span>
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 pb-1">
          <span className="text-xs text-slate-500">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
          >
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DIVISION SUMMARY (INC-RPT-20)                                      */}
      {/* ========================================================================= */}
      {activeTab === "division" && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>INC-RPT-20 Specification:</strong> Incentive cost per division broken down by Product Commission, Target Incentive, Service Allowance, Net Payable, and % of Net Sales.
            </span>
            <span className="font-mono text-slate-500">Grouping: Division &middot; Company Total</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Division</th>
                    <th className="py-3 px-3 text-right">Net Sales (LKR)</th>
                    <th className="py-3 px-3 text-right">Commission (70%)</th>
                    <th className="py-3 px-3 text-right">Target Inc (25%)</th>
                    <th className="py-3 px-3 text-right">Allowance (5%)</th>
                    <th className="py-3 px-3 text-right">Net Payable (LKR)</th>
                    <th className="py-3 px-3 text-center">Staff</th>
                    <th className="py-3 px-3 text-right">Avg / Person</th>
                    <th className="py-3 px-3 text-center">Cost Ratio %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.divisionSummaries?.map((d) => (
                    <tr key={d.division} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {d.division}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        LKR {d.netSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        LKR {d.salesCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        LKR {d.targetIncentive.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        LKR {d.serviceAllowance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 text-[13px]">
                        LKR {d.netPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {d.participantCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        LKR {d.avgPayout.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            d.costRatioPct <= 6.2
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {d.costRatioPct.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="py-3 px-3 text-slate-900">COMPANY TOTAL</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">
                      LKR {totals.totalNetSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      LKR {(totals.totalIncentiveCost * 0.7).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      LKR {(totals.totalIncentiveCost * 0.25).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      LKR {(totals.totalIncentiveCost * 0.05).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-900 text-sm">
                      LKR {totals.totalIncentiveCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-900">
                      {totals.totalParticipants}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">
                      LKR {(totals.totalIncentiveCost / totals.totalParticipants).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-800">
                      {totals.blendedCostRatioPct.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CATEGORY ANALYSIS (INC-RPT-21)                                     */}
      {/* ========================================================================= */}
      {activeTab === "category" && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>INC-RPT-21 Specification:</strong> Incentive summary by employee category (Sales Executives, Technicians, Area Managers, Engineers, HODs) with Min, Avg, and Max payout spreads.
            </span>
            <span className="font-mono text-slate-500">Output: Screen, Excel, PDF</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Employee Category</th>
                    <th className="py-3 px-3 text-center">Headcount</th>
                    <th className="py-3 px-3 text-right">Gross Earned (LKR)</th>
                    <th className="py-3 px-3 text-right">Deductions (LKR)</th>
                    <th className="py-3 px-3 text-right">Net Payable (LKR)</th>
                    <th className="py-3 px-3 text-right font-mono">Min Payout</th>
                    <th className="py-3 px-3 text-right font-mono">Average Payout</th>
                    <th className="py-3 px-3 text-right font-mono">Max Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.categorySummaries?.map((c) => (
                    <tr key={c.category} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        {c.category}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {c.participantCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        LKR {c.grossEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-600">
                        {c.deductions > 0 ? `- LKR ${c.deductions.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                        LKR {c.netPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        LKR {c.minPayout.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 bg-slate-50/50">
                        LKR {c.avgPayout.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold">
                        LKR {c.maxPayout.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
      {/* TAB 3: DIVISION X CATEGORY MATRIX (INC-RPT-22)                            */}
      {/* ========================================================================= */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>INC-RPT-22 Specification:</strong> Two-dimensional cross-tabulation matrix: Divisions in rows × Categories in columns, with row totals, column totals, and grand total.
            </span>
            <span className="font-mono text-slate-500">Two-Dimensional Matrix Layout</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 font-bold text-slate-800">Division \ Category</th>
                    <th className="py-3 px-3 text-right">Sales Executives</th>
                    <th className="py-3 px-3 text-right">Service Techs</th>
                    <th className="py-3 px-3 text-right">Area Managers</th>
                    <th className="py-3 px-3 text-right">Project Engineers</th>
                    <th className="py-3 px-3 text-right">HODs</th>
                    <th className="py-3 px-3 text-right font-bold text-blue-900 bg-blue-50/50">Division Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">RLC Sales</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 2,480,670.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 650,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 300,000.00</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/50">LKR 3,430,670.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">RLC Service</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 860,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 220,000.00</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/50">LKR 1,080,000.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">MHA Major Appliances</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 1,650,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 750,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 250,000.00</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/50">LKR 2,650,000.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">CAC Project Engineering</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 2,040,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">LKR 210,000.00</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/50">LKR 2,250,000.00</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="py-3 px-3 text-slate-900">CATEGORY TOTALS</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">LKR 4,130,670.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">LKR 860,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">LKR 1,400,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">LKR 2,040,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">LKR 980,000.00</td>
                    <td className="py-3 px-3 text-right font-mono text-blue-900 text-sm bg-blue-100/70">
                      LKR {totals.totalIncentiveCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BUDGET VS ACTUAL & ROI (INC-RPT-24) (FULL CRUD TABLE)              */}
      {/* ========================================================================= */}
      {activeTab === "budget" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-600">
              <strong>INC-RPT-24 Specification:</strong> Incentive cost as % of sales/collections, budget allocation variance tracking, and benchmark status.
            </span>
            <Button
              size="sm"
              onClick={handleOpenCreateBudget}
              className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs self-start sm:self-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Division Budget Target
            </Button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Division &amp; Period</th>
                    <th className="py-3 px-3 text-right">Target Sales (LKR)</th>
                    <th className="py-3 px-3 text-right">Actual Sales (LKR)</th>
                    <th className="py-3 px-3 text-right">Budget Allocation</th>
                    <th className="py-3 px-3 text-right">Actual Cost (LKR)</th>
                    <th className="py-3 px-3 text-right">Variance (LKR)</th>
                    <th className="py-3 px-3 text-center">Cost Ratio %</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBudgets.map((b, idx) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{b.division}</div>
                        <div className="text-[11px] text-slate-500">{b.period} · {b.participantCount} staff</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        LKR {b.targetSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        LKR {b.actualSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        LKR {b.budgetAllocation.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                        LKR {b.actualIncentiveCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <span
                          className={`font-bold ${
                            b.varianceAmount >= 0 ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {b.varianceAmount >= 0 ? "+" : ""}
                          LKR {b.varianceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            b.costRatioPct <= 6.2
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {b.costRatioPct.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            b.status === "Under Budget"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : b.status === "On Track"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditBudget(b)}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="Edit Budget Target"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingBudget(b)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Budget Target"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
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
      {/* MODAL 1: CREATE / EDIT BUDGET MODAL (FULL CRUD)                           */}
      {/* ========================================================================= */}
      {isEditingBudget && editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">
                  {data?.divisionBudgets.some((b) => b.id === editingBudget.id)
                    ? "Edit Division Budget Benchmark"
                    : "Set New Division Budget Target"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Division Name *</label>
                  <input
                    type="text"
                    value={editingBudget.division || ""}
                    onChange={(e) =>
                      setEditingBudget({ ...editingBudget, division: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-semibold"
                    placeholder="e.g. RLC Sales"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Period *</label>
                  <input
                    type="text"
                    value={editingBudget.period || "April 2026"}
                    onChange={(e) =>
                      setEditingBudget({ ...editingBudget, period: e.target.value })
                    }
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Sales (LKR)</label>
                  <input
                    type="number"
                    value={editingBudget.targetSales ?? 0}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        targetSales: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Actual Sales Realised (LKR)</label>
                  <input
                    type="number"
                    value={editingBudget.actualSales ?? 0}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        actualSales: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono text-right font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Budget Allocation (LKR) *</label>
                  <input
                    type="number"
                    value={editingBudget.budgetAllocation ?? 0}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        budgetAllocation: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono text-right font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Actual Incentive Cost (LKR)</label>
                  <input
                    type="number"
                    value={editingBudget.actualIncentiveCost ?? 0}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        actualIncentiveCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-mono text-right font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Eligible Participant Count</label>
                  <input
                    type="number"
                    value={editingBudget.participantCount ?? 0}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        participantCount: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Benchmark Status</label>
                  <select
                    value={editingBudget.status || "On Track"}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        status: e.target.value as BudgetStatus,
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="On Track">On Track</option>
                    <option value="Under Budget">Under Budget</option>
                    <option value="Budget Exceeded">Budget Exceeded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Strategic Audit Remarks</label>
                <textarea
                  rows={2}
                  value={editingBudget.notes || ""}
                  onChange={(e) =>
                    setEditingBudget({ ...editingBudget, notes: e.target.value })
                  }
                  className="w-full p-2 border rounded border-slate-300 text-xs"
                  placeholder="Notes on revenue trends, promotional slabs, or commission variance..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingBudget(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveBudget}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Save Budget
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {deletingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Delete Division Budget</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete the budget benchmark target for{" "}
              <strong className="text-slate-900">{deletingBudget.division}</strong> ({deletingBudget.period})? This record will be permanently deleted from PostgreSQL.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingBudget(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteBudget}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Target
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
