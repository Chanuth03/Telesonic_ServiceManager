import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  User,
  Mail,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Briefcase,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type DivisionItem,
  type DivisionStatus,
} from "@/lib/division-master-db";

interface DivisionMasterViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function DivisionMasterView({ onBack, onNavigateScreen }: DivisionMasterViewProps) {
  // Master State
  const [divisions, setDivisions] = useState<DivisionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<DivisionStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [editingDivision, setEditingDivision] = useState<DivisionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State for Add Division
  const [formData, setFormData] = useState({
    divisionCode: "",
    divisionName: "",
    description: "",
    hodName: "",
    hodEmail: "",
    costCenterCode: "",
    status: "Active" as DivisionStatus,
  });

  // Fetch from Database API
  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incentives/divisions");
      if (!res.ok) throw new Error("Failed to load divisions");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setDivisions(data.items);
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load divisions from PostgreSQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  // Filtered Divisions
  const filteredDivisions = useMemo(() => {
    return divisions.filter((div) => {
      const matchesStatus = statusFilter === "All" || div.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        div.divisionCode.toLowerCase().includes(q) ||
        div.divisionName.toLowerCase().includes(q) ||
        div.description.toLowerCase().includes(q) ||
        div.hodName.toLowerCase().includes(q) ||
        div.costCenterCode.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [divisions, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = divisions.length;
    const active = divisions.filter((d) => d.status === "Active").length;
    const costCenters = new Set(divisions.map((d) => d.costCenterCode)).size;
    return { total, active, costCenters };
  }, [divisions]);

  // Create Division Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.divisionCode || !formData.divisionName || !formData.costCenterCode) {
      toast.error("Please fill in all required fields (Code, Name, Cost Center).");
      return;
    }

    try {
      const res = await fetch("/api/incentives/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create division.");
      }

      toast.success(data.message || `Division ${formData.divisionCode} created!`);
      setIsAddModalOpen(false);
      setFormData({
        divisionCode: "",
        divisionName: "",
        description: "",
        hodName: "",
        hodEmail: "",
        costCenterCode: "",
        status: "Active",
      });
      fetchDivisions();
    } catch (err: any) {
      toast.error(err.message || "Could not create division.");
    }
  };

  // Update Division Handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDivision) return;

    try {
      const res = await fetch(`/api/incentives/divisions/${encodeURIComponent(editingDivision.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDivision),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update division.");
      }

      toast.success(data.message || "Division updated successfully.");
      setEditingDivision(null);
      fetchDivisions();
    } catch (err: any) {
      toast.error(err.message || "Could not update division.");
    }
  };

  // Delete Division Handler
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/incentives/divisions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete division.");
      }

      toast.success(data.message || "Division deleted.");
      setDeletingId(null);
      fetchDivisions();
    } catch (err: any) {
      toast.error(err.message || "Could not delete division.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Division Code", "Division Name", "Operational Scope", "HOD Name", "HOD Email", "Cost Center", "Status"];
    const rows = filteredDivisions.map((d) => [
      d.divisionCode,
      `"${d.divisionName.replace(/"/g, '""')}"`,
      `"${d.description.replace(/"/g, '""')}"`,
      `"${d.hodName.replace(/"/g, '""')}"`,
      d.hodEmail || "",
      d.costCenterCode,
      d.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telesonic_divisions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Division Master list exported to CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-lg border-slate-200 hover:bg-slate-100"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Button>
          )}
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-100 dark:border-indigo-900">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Master Data Setup
              </span>
              <span className="text-xs text-slate-500">PostgreSQL Verified</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Division Master & Operating Units
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure corporate divisions, operational scope, HOD leadership, and SAP cost center mappings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDivisions}
            disabled={loading}
            className="text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Sync DB
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9 text-slate-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            + Add Division
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Divisions</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-400">All operating business units</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Status</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {stats.active} <span className="text-xs font-normal text-slate-500">/ {stats.total}</span>
            </div>
            <div className="text-[11px] text-emerald-600">Eligible for scheme calculations</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">SAP Cost Centers</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.costCenters}
            </div>
            <div className="text-[11px] text-slate-400">Financial posting journals</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">HOD Leadership</div>
            <div className="text-xl font-bold text-purple-600 mt-0.5">
              100%
            </div>
            <div className="text-[11px] text-slate-400">Designated divisional sign-off</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, name, HOD, cost center..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {(["All", "Active", "Inactive"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
          {lastSynced && (
            <span className="text-[11px] text-slate-400 ml-2 hidden lg:inline">
              Updated: {lastSynced}
            </span>
          )}
        </div>
      </div>

      {/* Division Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Division Code</th>
                <th className="py-3 px-4">Division Name & Operational Scope</th>
                <th className="py-3 px-4">Head of Division (HOD)</th>
                <th className="py-3 px-4">SAP Cost Center</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading divisions from database...
                  </td>
                </tr>
              ) : filteredDivisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No operating divisions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDivisions.map((div) => (
                  <tr
                    key={div.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800">
                        <Briefcase className="h-3 w-3 text-indigo-500" />
                        {div.divisionCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-semibold text-slate-900 dark:text-white text-[13px]">
                        {div.divisionName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                        {div.description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {div.hodName}
                          </div>
                          {div.hodEmail && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-2.5 w-2.5" />
                              {div.hodEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {div.costCenterCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          div.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {div.status === "Active" ? (
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                        ) : (
                          <X className="h-2.5 w-2.5 text-slate-400" />
                        )}
                        {div.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingDivision({ ...div })}
                          className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Edit Division"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(div.id)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Division"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Integration with Incentive Lifecycle Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl border border-indigo-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Division Master in Telesonic Incentive Architecture
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              These divisions define target groupings (Screen 04), scheme eligibility (Screen 01), attendance batches (Screen 05), and SAP cost center accounting (Screen 13).
            </p>
          </div>
        </div>

        {onNavigateScreen && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen("scheme-master")}
              className="text-xs bg-white dark:bg-slate-900 h-8"
            >
              Open Scheme Master
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* ADD DIVISION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Add New Division
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Division Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIV-SLR / SLR"
                    value={formData.divisionCode}
                    onChange={(e) => setFormData({ ...formData, divisionCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cost Center Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CC-SLR-06"
                    value={formData.costCenterCode}
                    onChange={(e) => setFormData({ ...formData, costCenterCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Division Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Energy & Institutional Power"
                  value={formData.divisionName}
                  onChange={(e) => setFormData({ ...formData, divisionName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Operational Scope & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly state products, channel teams, or service scopes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Head of Division (HOD)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bandhan Senaratne"
                    value={formData.hodName}
                    onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    HOD Email
                  </label>
                  <input
                    type="email"
                    placeholder="hod@telesonic.lk"
                    value={formData.hodEmail}
                    onChange={(e) => setFormData({ ...formData, hodEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DivisionStatus })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Active">Active (Participates in Schemes)</option>
                  <option value="Inactive">Inactive (Suspended)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create Division
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DIVISION MODAL */}
      {editingDivision && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Edit2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Edit Division: {editingDivision.divisionCode}
                </h3>
              </div>
              <button
                onClick={() => setEditingDivision(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Division Code (Read-Only)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingDivision.divisionCode}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cost Center Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDivision.costCenterCode}
                    onChange={(e) =>
                      setEditingDivision({ ...editingDivision, costCenterCode: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Division Name
                </label>
                <input
                  type="text"
                  required
                  value={editingDivision.divisionName}
                  onChange={(e) => setEditingDivision({ ...editingDivision, divisionName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Operational Scope & Description
                </label>
                <textarea
                  rows={2}
                  value={editingDivision.description}
                  onChange={(e) => setEditingDivision({ ...editingDivision, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Head of Division (HOD)
                  </label>
                  <input
                    type="text"
                    value={editingDivision.hodName}
                    onChange={(e) => setEditingDivision({ ...editingDivision, hodName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    HOD Email
                  </label>
                  <input
                    type="email"
                    value={editingDivision.hodEmail || ""}
                    onChange={(e) => setEditingDivision({ ...editingDivision, hodEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={editingDivision.status}
                  onChange={(e) =>
                    setEditingDivision({ ...editingDivision, status: e.target.value as DivisionStatus })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Active">Active (Participates in Schemes)</option>
                  <option value="Inactive">Inactive (Suspended)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingDivision(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Delete Division?
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to delete division <strong>{deletingId}</strong>? Schemes or participants referencing this division may be impacted.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(deletingId)}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default DivisionMasterView;
