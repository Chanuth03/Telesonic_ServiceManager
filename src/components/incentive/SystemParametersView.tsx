import React, { useState, useEffect, useMemo } from "react";
import {
  Settings2,
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
  ShieldCheck,
  Building2,
  FileText,
  User,
  Check,
  X,
  Printer,
  Calendar,
  AlertCircle,
  TrendingDown,
  Repeat,
  RotateCcw,
  Layers,
  Lock,
  Sliders,
  CalendarDays,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type SystemParameterItem,
  type ParameterCategory,
} from "@/lib/system-parameters-db";

interface SystemParametersViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function SystemParametersView({ onBack }: SystemParametersViewProps) {
  // Master State
  const [params, setParams] = useState<SystemParameterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Tabs
  const [activeCategory, setActiveCategory] = useState<ParameterCategory | "All">("All");

  // Filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [editingParam, setEditingParam] = useState<SystemParameterItem | null>(null);
  const [resettingParam, setResettingParam] = useState<SystemParameterItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Parameter Form State
  const [formData, setFormData] = useState({
    parameterKey: "",
    parameterName: "",
    category: "Cut-off & Scheduling" as ParameterCategory,
    parameterValue: "",
    unit: "Days",
    defaultValue: "",
    description: "",
    effectiveFrom: "2026-05-01",
    lastUpdatedBy: "Finance Director (Nimal Perera)",
    isEditable: true,
  });

  // Fetch Parameters from Database API
  const fetchParams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incentives/system-parameters");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setParams(data.items);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to load system parameters.");
      }
    } catch (err) {
      console.error("Fetch parameters error:", err);
      toast.error("Database connection error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParams();
  }, []);

  // Filtered List
  const filteredParams = useMemo(() => {
    return params.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.parameterKey.toLowerCase().includes(q) ||
          p.parameterName.toLowerCase().includes(q) ||
          p.parameterValue.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [params, activeCategory, searchQuery]);

  // Key Metric Highlights
  const cutoffDay = useMemo(
    () => params.find((p) => p.parameterKey === "DATA_CUTOFF_DAY")?.parameterValue || "25",
    [params]
  );
  const overdueGrace = useMemo(
    () => params.find((p) => p.parameterKey === "PENALTY_OVERDUE_THRESHOLD")?.parameterValue || "45",
    [params]
  );
  const paymentLag = useMemo(
    () => params.find((p) => p.parameterKey === "PAYMENT_COMMISSION_LAG")?.parameterValue || "3",
    [params]
  );
  const disputeDays = useMemo(
    () => params.find((p) => p.parameterKey === "DISPUTE_WINDOW_DAYS")?.parameterValue || "10",
    [params]
  );

  // Submit Create New Parameter
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parameterKey || !formData.parameterName || !formData.parameterValue) {
      toast.error("Please fill in Parameter Key, Name, and Initial Value.");
      return;
    }

    try {
      const res = await fetch("/api/incentives/system-parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Custom policy parameter added.");
        setIsAddModalOpen(false);
        setFormData({
          parameterKey: "",
          parameterName: "",
          category: "Cut-off & Scheduling",
          parameterValue: "",
          unit: "Days",
          defaultValue: "",
          description: "",
          effectiveFrom: "2026-05-01",
          lastUpdatedBy: "Finance Director (Nimal Perera)",
          isEditable: true,
        });
        fetchParams();
      } else {
        toast.error(data.error || "Failed to add parameter.");
      }
    } catch (err) {
      console.error("Create parameter error:", err);
      toast.error("Error creating parameter.");
    }
  };

  // Submit Edit Parameter Value
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParam) return;

    try {
      const res = await fetch(`/api/incentives/system-parameters/${editingParam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parameterValue: editingParam.parameterValue,
          description: editingParam.description,
          effectiveFrom: editingParam.effectiveFrom,
          lastUpdatedBy: "Finance Director (Nimal Perera)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Parameter "${editingParam.parameterName}" updated to ${editingParam.parameterValue}.`);
        setEditingParam(null);
        fetchParams();
      } else {
        toast.error(data.error || "Failed to update parameter.");
      }
    } catch (err) {
      console.error("Update parameter error:", err);
      toast.error("Error updating parameter.");
    }
  };

  // Submit Reset to Factory Default
  const handleResetSubmit = async () => {
    if (!resettingParam) return;

    try {
      const res = await fetch(`/api/incentives/system-parameters/${resettingParam.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetBy: "System Auditor" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Parameter reset to specification default: ${data.item.defaultValue}`);
        setResettingParam(null);
        fetchParams();
      } else {
        toast.error(data.error || "Failed to reset parameter.");
      }
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("Error resetting parameter.");
    }
  };

  // Delete Parameter
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/incentives/system-parameters/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Parameter removed.");
        setDeletingId(null);
        fetchParams();
      } else {
        toast.error(data.error || "Cannot delete system parameter.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting parameter.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Key",
      "Parameter Name",
      "Category",
      "Configured Value",
      "Unit",
      "Default Value",
      "Description",
      "Effective From",
      "Last Updated By",
      "Last Updated At",
    ];

    const rows = filteredParams.map((p) => [
      p.id,
      p.parameterKey,
      `"${p.parameterName}"`,
      p.category,
      `"${p.parameterValue}"`,
      p.unit,
      `"${p.defaultValue}"`,
      `"${p.description.replace(/"/g, '""')}"`,
      p.effectiveFrom,
      `"${p.lastUpdatedBy}"`,
      p.lastUpdatedAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Telesonic_System_Parameters_Policy_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Policy parameters exported to Excel / CSV.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-xl shadow-xs">
        <div className="flex items-start gap-4">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-9 px-3 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                System Parameters &amp; Cut-off Policy
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                INC-SCR-19
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                SCREEN 19
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Define global payroll cut-off dates, default grace periods, aging threshold settings, and automated recalculation triggers.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParams}
            disabled={loading}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            PDF
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Policy Rule
          </Button>
        </div>
      </div>

      {/* Visual Monthly Cut-Off Pipeline Calendar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Official Monthly Cut-off &amp; Settlement Pipeline (Section 5 Standard)
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Cycle Baseline: Calendar Month
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Day 25 */}
          <div className="p-3.5 rounded-lg border border-primary/30 bg-primary/5 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-primary">Day 25</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                Cut-off
              </span>
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">Data Cut-off</span>
              <p className="text-[11px] text-muted-foreground">Invoices, receipts &amp; closed tickets up to 23:59 captured.</p>
            </div>
          </div>

          {/* Day 28 */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/40 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-foreground">Day 28</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                Engine
              </span>
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">Batch Calculation</span>
              <p className="text-[11px] text-muted-foreground">Automated calculation engine runs across all divisions.</p>
            </div>
          </div>

          {/* Day 03 M+1 */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/40 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-foreground">Day 03</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                Sign-off
              </span>
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">Four-Eyes Approval</span>
              <p className="text-[11px] text-muted-foreground">HOD Sales → HOD Service → Finance → CEO pipeline complete.</p>
            </div>
          </div>

          {/* Day 05 M+1 */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/40 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-foreground">Day 05</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                Lock
              </span>
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">Accrual JE &amp; Lock</span>
              <p className="text-[11px] text-muted-foreground">SAP B1 Accrual JE posted and month locked as Immutable.</p>
            </div>
          </div>

          {/* Day 15 M+3 */}
          <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-emerald-600">Day 15</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                Payout
              </span>
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">Payroll Handover</span>
              <p className="text-[11px] text-muted-foreground">3-month lag payout disbursed via HR Payroll salary export.</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Policy Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cut-off Day */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Data Cut-off Date</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{cutoffDay}th of Month</div>
          <p className="text-xs text-muted-foreground mt-1">Receipts &amp; invoices snapshot day</p>
        </div>

        {/* Debtor Grace Period */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Debtor Penalty Grace</span>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{overdueGrace} Days</div>
          <p className="text-xs text-muted-foreground mt-1">Penalty begins past 45-day threshold</p>
        </div>

        {/* Realisation Lag */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Payment Realisation Lag</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{paymentLag} Months Lag</div>
          <p className="text-xs text-muted-foreground mt-1">Section 11 cash realization rule</p>
        </div>

        {/* Dispute Window */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Dispute Window</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{disputeDays} Days</div>
          <p className="text-xs text-muted-foreground mt-1">INC-BCR-19 inquiry period post slip</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveCategory("All")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeCategory === "All"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="w-4 h-4" />
          All Policies &amp; Parameters
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground font-bold">
            {params.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("Cut-off & Scheduling")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeCategory === "Cut-off & Scheduling"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Cut-off &amp; Scheduling
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
            {params.filter((p) => p.category === "Cut-off & Scheduling").length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("Aging & Credit Policy")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeCategory === "Aging & Credit Policy"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          Aging &amp; Credit Policy
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-bold">
            {params.filter((p) => p.category === "Aging & Credit Policy").length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("Calculation & Lag")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeCategory === "Calculation & Lag"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Repeat className="w-4 h-4" />
          Calculation &amp; Lag
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
            {params.filter((p) => p.category === "Calculation & Lag").length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("Governance & Security")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeCategory === "Governance & Security"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="w-4 h-4" />
          Governance &amp; Security
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {params.filter((p) => p.category === "Governance & Security").length}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search parameters by key, name, value, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto justify-between sm:justify-end">
            <span>
              Showing <strong className="text-foreground">{filteredParams.length}</strong> parameters
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Parameters Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Key &amp; Parameter Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Active Policy Value</th>
                <th className="py-3 px-4 text-center">Default Spec</th>
                <th className="py-3 px-4">Policy Description &amp; Rule</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading system parameters from PostgreSQL database...
                  </td>
                </tr>
              ) : filteredParams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
                    No policy parameters found matching active filter.
                  </td>
                </tr>
              ) : (
                filteredParams.map((item, index) => {
                  const isModified = item.parameterValue !== item.defaultValue;

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* Index */}
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* Key & Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{item.parameterName}</div>
                        <div className="text-[11px] font-mono text-primary flex items-center gap-1 mt-0.5">
                          {item.parameterKey}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground border border-border">
                          {item.category}
                        </span>
                      </td>

                      {/* Active Value */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border shadow-2xs font-mono font-bold text-foreground">
                          {item.parameterValue}
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({item.unit})
                          </span>
                        </div>
                        {isModified && (
                          <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">
                            Modified from spec
                          </span>
                        )}
                      </td>

                      {/* Default Value */}
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground whitespace-nowrap">
                        {item.defaultValue}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-foreground/90 leading-relaxed text-[11px]">
                          {item.description}
                        </p>
                      </td>

                      {/* Effective Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {item.effectiveFrom}
                      </td>

                      {/* Last Modified */}
                      <td className="py-3 px-4 text-[11px] whitespace-nowrap">
                        <div className="font-medium text-foreground">{item.lastUpdatedBy}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{item.lastUpdatedAt}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit Value */}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!item.isEditable}
                            onClick={() => setEditingParam({ ...item })}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title={item.isEditable ? "Configure / Edit Parameter" : "Fixed System Policy"}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Reset to Spec Default */}
                          {isModified && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setResettingParam(item)}
                              className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Reset to Factory Spec Default"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Delete (only for custom parameters) */}
                          {item.id.startsWith("PAR-CUSTOM") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingId(item.id)}
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete Custom Parameter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
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

      {/* MODAL 1: EDIT PARAMETER VALUE */}
      {editingParam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Configure Policy: {editingParam.parameterName}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingParam(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parameter Key:</span>
                <span className="font-mono font-bold text-primary">{editingParam.parameterKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span>{editingParam.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specification Default:</span>
                <span className="font-mono font-semibold">{editingParam.defaultValue} ({editingParam.unit})</span>
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Active Parameter Value ({editingParam.unit})*
                </label>
                <input
                  type="text"
                  required
                  value={editingParam.parameterValue}
                  onChange={(e) => setEditingParam({ ...editingParam, parameterValue: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-lg font-mono font-bold text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Effective From Date*
                </label>
                <input
                  type="text"
                  required
                  value={editingParam.effectiveFrom}
                  onChange={(e) => setEditingParam({ ...editingParam, effectiveFrom: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Policy Description / Business Justification
                </label>
                <textarea
                  rows={3}
                  value={editingParam.description}
                  onChange={(e) => setEditingParam({ ...editingParam, description: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingParam(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Save &amp; Apply Setting
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET TO SPECIFICATION DEFAULT */}
      {resettingParam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-600">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Reset to Spec Default?</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reset <strong>{resettingParam.parameterName}</strong> from &quot;{resettingParam.parameterValue}&quot; back to factory default &quot;<strong>{resettingParam.defaultValue}</strong>&quot;?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setResettingParam(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                onClick={handleResetSubmit}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW POLICY PARAMETER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Define New System Policy Rule</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Parameter Key (Uppercase)*</label>
                <input
                  type="text"
                  required
                  value={formData.parameterKey}
                  onChange={(e) => setFormData({ ...formData, parameterKey: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                  className="w-full p-2 bg-background border border-border rounded-lg font-mono font-bold"
                  placeholder="e.g. MIN_SERVICE_EVALUATION_SCORE"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Parameter Name*</label>
                <input
                  type="text"
                  required
                  value={formData.parameterName}
                  onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-lg"
                  placeholder="e.g. Minimum Customer Service Rating Threshold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Category*</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ParameterCategory })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  >
                    <option value="Cut-off & Scheduling">Cut-off &amp; Scheduling</option>
                    <option value="Aging & Credit Policy">Aging &amp; Credit Policy</option>
                    <option value="Calculation & Lag">Calculation &amp; Lag</option>
                    <option value="Service Scorecard">Service Scorecard</option>
                    <option value="Governance & Security">Governance &amp; Security</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Unit of Measure*</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                    placeholder="e.g. Score (0-10), Days, %, LKR"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Configured Value*</label>
                  <input
                    type="text"
                    required
                    value={formData.parameterValue}
                    onChange={(e) => setFormData({ ...formData, parameterValue: e.target.value, defaultValue: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono font-bold"
                    placeholder="e.g. 8.0"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Effective Date</label>
                  <input
                    type="text"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Description &amp; Business Rules</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-lg"
                  placeholder="Explain how this policy governs incentive calculations or scheduling."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Create Parameter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Delete Custom Parameter?</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to remove parameter <strong>{deletingId}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deletingId)}
              >
                Delete Parameter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
