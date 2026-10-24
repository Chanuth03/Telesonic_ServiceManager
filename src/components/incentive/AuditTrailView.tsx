import React, { useState, useEffect, useMemo } from "react";
import {
  History,
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
  GitCommit,
  Hash,
  Terminal,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type IncentiveAuditLogItem,
  type AuditEntityType,
  type AuditActionType,
  type AuditSeverity,
  type VerificationStatus,
} from "@/lib/audit-trail-db";

interface AuditTrailViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

type TabCategory =
  | "All"
  | "Scheme & Rates"
  | "Targets & Quotas"
  | "Workflows & Posting"
  | "Adjustments & Penalties";

export function AuditTrailView({ onBack }: AuditTrailViewProps) {
  // Master State
  const [logs, setLogs] = useState<IncentiveAuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Tabs
  const [activeTab, setActiveTab] = useState<TabCategory>("All");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEntity, setSelectedEntity] = useState<string>("All");
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modals
  const [viewingLog, setViewingLog] = useState<IncentiveAuditLogItem | null>(null);
  const [editingLog, setEditingLog] = useState<IncentiveAuditLogItem | null>(null);
  const [verifyingLog, setVerifyingLog] = useState<IncentiveAuditLogItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Verify Form State
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>("Verified");
  const [verifyNotes, setVerifyNotes] = useState<string>("");

  // New Log Form State
  const [formData, setFormData] = useState({
    entityType: "Scheme Master" as AuditEntityType,
    entityId: "SCH-RLC-001",
    actionType: "UPDATE" as AuditActionType,
    performedBy: "Nimal Perera (Finance Manager)",
    role: "Finance Manager",
    terminalIp: "172.16.0.201",
    severity: "MEDIUM" as AuditSeverity,
    diffSummary: "",
    versionTag: "v1.1",
    verificationStatus: "Verified" as VerificationStatus,
    auditorNotes: "",
    oldValue: "",
    newValue: "",
  });

  // Fetch Logs from Database API
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incentives/audit-logs");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setLogs(data.items);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to load audit logs.");
      }
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      toast.error("Database connection error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Tab Category mapping
      if (activeTab === "Scheme & Rates") {
        if (log.entityType !== "Scheme Master" && log.entityType !== "Rate Matrix") return false;
      } else if (activeTab === "Targets & Quotas") {
        if (log.entityType !== "Target & Quota" && log.entityType !== "Participant Profile") return false;
      } else if (activeTab === "Workflows & Posting") {
        if (
          log.entityType !== "Calculation Run" &&
          log.entityType !== "Multi-Level Approval" &&
          log.entityType !== "GL Posting"
        )
          return false;
      } else if (activeTab === "Adjustments & Penalties") {
        if (
          log.entityType !== "Manual Adjustment" &&
          log.entityType !== "Penalty & Clawback" &&
          log.entityType !== "Dispute Resolution"
        )
          return false;
      }

      // Entity filter
      if (selectedEntity !== "All" && log.entityType !== selectedEntity) return false;

      // Action filter
      if (selectedAction !== "All" && log.actionType !== selectedAction) return false;

      // Severity filter
      if (selectedSeverity !== "All" && log.severity !== selectedSeverity) return false;

      // Status filter
      if (selectedStatus !== "All" && log.verificationStatus !== selectedStatus) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          log.id.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          log.entityType.toLowerCase().includes(q) ||
          log.performedBy.toLowerCase().includes(q) ||
          log.diffSummary.toLowerCase().includes(q) ||
          log.hashChecksum.toLowerCase().includes(q) ||
          (log.oldValue && log.oldValue.toLowerCase().includes(q)) ||
          (log.newValue && log.newValue.toLowerCase().includes(q)) ||
          (log.auditorNotes && log.auditorNotes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [logs, activeTab, selectedEntity, selectedAction, selectedSeverity, selectedStatus, searchQuery]);

  // KPI Metrics
  const totalEvents = logs.length;
  const versionBumps = useMemo(
    () => logs.filter((l) => l.actionType === "VERSION_BUMP" || l.versionTag).length,
    [logs]
  );
  const criticalGovernance = useMemo(
    () => logs.filter((l) => l.severity === "CRITICAL" || l.actionType === "LOCK_PERIOD" || l.role === "CEO").length,
    [logs]
  );
  const verifiedCount = useMemo(
    () => logs.filter((l) => l.verificationStatus === "Verified").length,
    [logs]
  );

  // Dynamic Options
  const entityTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.entityType));
    return ["All", ...Array.from(set).sort()];
  }, [logs]);

  const actionTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.actionType));
    return ["All", ...Array.from(set).sort()];
  }, [logs]);

  // Create Log Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.diffSummary.trim() || !formData.entityId.trim()) {
      toast.error("Please provide Entity Reference and Change Description.");
      return;
    }

    try {
      const res = await fetch("/api/incentives/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Audit entry logged successfully.");
        setIsAddModalOpen(false);
        fetchLogs();
      } else {
        toast.error(data.error || "Failed to log audit entry.");
      }
    } catch (err) {
      console.error("Create audit log error:", err);
      toast.error("Error logging audit entry.");
    }
  };

  // Update Log Submit
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    try {
      const res = await fetch(`/api/incentives/audit-logs/${editingLog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLog),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Audit entry updated successfully.");
        setEditingLog(null);
        fetchLogs();
      } else {
        toast.error(data.error || "Failed to update audit entry.");
      }
    } catch (err) {
      console.error("Update audit log error:", err);
      toast.error("Error updating audit entry.");
    }
  };

  // Verify Log Submit
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingLog) return;

    try {
      const res = await fetch(`/api/incentives/audit-logs/${verifyingLog.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: verifyStatus,
          notes: verifyNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Audit entry marked as ${verifyStatus}.`);
        setVerifyingLog(null);
        setVerifyNotes("");
        fetchLogs();
      } else {
        toast.error(data.error || "Failed to update verification.");
      }
    } catch (err) {
      console.error("Verify audit log error:", err);
      toast.error("Error updating verification.");
    }
  };

  // Delete Log
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/incentives/audit-logs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Audit entry deleted.");
        setDeletingId(null);
        fetchLogs();
      } else {
        toast.error(data.error || "Failed to delete audit entry.");
      }
    } catch (err) {
      console.error("Delete audit log error:", err);
      toast.error("Error deleting audit entry.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Audit ID",
      "Timestamp",
      "Entity Type",
      "Entity ID",
      "Action Type",
      "Performed By",
      "Role",
      "Terminal IP",
      "Severity",
      "Version Tag",
      "Diff Summary",
      "Verification Status",
      "Auditor Notes",
      "Hash Checksum",
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.entityType}"`,
      l.entityId,
      l.actionType,
      `"${l.performedBy}"`,
      `"${l.role}"`,
      l.terminalIp,
      l.severity,
      l.versionTag || "",
      `"${(l.diffSummary || "").replace(/"/g, '""')}"`,
      l.verificationStatus,
      `"${(l.auditorNotes || "").replace(/"/g, '""')}"`,
      l.hashChecksum,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Telesonic_Audit_Trail_Ledger_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit trail report exported to Excel / CSV.");
  };

  // Action Badge Helper
  const renderActionBadge = (action: AuditActionType) => {
    switch (action) {
      case "VERSION_BUMP":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <GitCommit className="w-3 h-3" /> Version Bump
          </span>
        );
      case "APPROVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "LOCK_PERIOD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Lock className="w-3 h-3" /> Period Lock
          </span>
        );
      case "CALCULATE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Repeat className="w-3 h-3" /> Calculate Run
          </span>
        );
      case "POST_GL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <FileText className="w-3 h-3" /> Post Accrual JE
          </span>
        );
      case "REJECT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case "WAIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
            <RotateCcw className="w-3 h-3" /> Waive
          </span>
        );
      case "UPDATE":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <Edit2 className="w-3 h-3" /> Update
          </span>
        );
    }
  };

  // Severity Badge Helper
  const renderSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
            MEDIUM
          </span>
        );
      case "LOW":
      case "INFO":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-300">
            {severity}
          </span>
        );
    }
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
                Audit Trail &amp; Scheme Revision History
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                INC-SCR-18
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                SECURITY &amp; AUDIT
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Comprehensive chronological audit log of all scheme modifications, target revisions, run recalculations, and four-eyes approvals.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
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
            Log Audit Event
          </Button>
        </div>
      </div>

      {/* Compliance & Integrity Checksum Status Banner */}
      <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">PostgreSQL Audit Ledger Active:</span>
          <span>Table `incentive_audit_logs` | Synced at: {lastSynced || "Just now"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Section 10 Standard: Segregation of Duties &amp; Immutable Locked Months Enforced</span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Total Audit Events</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{totalEvents}</div>
          <p className="text-xs text-muted-foreground mt-1">Chronological ledger entries logged</p>
        </div>

        {/* Scheme & Rate Version Changes */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Scheme Version Bumps</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <GitCommit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{versionBumps}</div>
          <p className="text-xs text-muted-foreground mt-1">Effective-dated version transitions</p>
        </div>

        {/* Critical Governance Actions */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Governance Sign-Offs</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{criticalGovernance}</div>
          <p className="text-xs text-muted-foreground mt-1">CEO approvals &amp; period locks</p>
        </div>

        {/* Compliance Verification Rate */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Verified Records</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {totalEvents > 0 ? `${Math.round((verifiedCount / totalEvents) * 100)}%` : "100%"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {verifiedCount} of {totalEvents} entries verified
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("All")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "All"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          All Events
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground font-bold">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Scheme & Rates")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "Scheme & Rates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitCommit className="w-4 h-4" />
          Scheme &amp; Rate Revisions
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 font-bold">
            {logs.filter((l) => l.entityType === "Scheme Master" || l.entityType === "Rate Matrix").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Targets & Quotas")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "Targets & Quotas"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Targets &amp; Quotas
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
            {logs.filter((l) => l.entityType === "Target & Quota" || l.entityType === "Participant Profile").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Workflows & Posting")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "Workflows & Posting"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="w-4 h-4" />
          Workflows &amp; Posting
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
            {logs.filter((l) =>
              l.entityType === "Calculation Run" ||
              l.entityType === "Multi-Level Approval" ||
              l.entityType === "GL Posting"
            ).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Adjustments & Penalties")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "Adjustments & Penalties"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Adjustments &amp; Penalties
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-800 font-bold">
            {logs.filter((l) =>
              l.entityType === "Manual Adjustment" ||
              l.entityType === "Penalty & Clawback" ||
              l.entityType === "Dispute Resolution"
            ).length}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Entity, User, Diff summary, or Hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Entity Type Filter */}
          <div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Entities</option>
              {entityTypes
                .filter((e) => e !== "All")
                .map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Actions</option>
              {actionTypes
                .filter((a) => a !== "All")
                .map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredLogs.length}</strong> of {logs.length} audit entries
          </span>
          {(searchQuery || selectedEntity !== "All" || selectedAction !== "All" || selectedSeverity !== "All" || selectedStatus !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedEntity("All");
                setSelectedAction("All");
                setSelectedSeverity("All");
                setSelectedStatus("All");
              }}
              className="text-primary hover:underline font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Timestamp &amp; Terminal</th>
                <th className="py-3 px-4">Entity &amp; Reference</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Performed By &amp; Role</th>
                <th className="py-3 px-4">Change Summary</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4">Checksum</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading audit trail from PostgreSQL database...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
                    No audit records found matching active filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {index + 1}
                    </td>

                    {/* Timestamp & IP */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-foreground">{log.timestamp}</div>
                      <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                        <Terminal className="w-2.5 h-2.5" /> {log.terminalIp}
                      </div>
                    </td>

                    {/* Entity & ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        {log.entityId}
                        {log.versionTag && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-100 text-purple-800 font-bold border border-purple-200">
                            {log.versionTag}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{log.entityType}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderActionBadge(log.actionType)}
                    </td>

                    {/* Performed By & Role */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{log.performedBy}</div>
                      <div className="text-[11px] text-muted-foreground">{log.role}</div>
                    </td>

                    {/* Change Summary */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-2 text-foreground/90 leading-relaxed text-[11px]">
                        {log.diffSummary}
                      </p>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {renderSeverityBadge(log.severity)}
                    </td>

                    {/* Hash Checksum */}
                    <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-muted border border-border" title={log.hashChecksum}>
                        {log.hashChecksum.slice(0, 14)}...
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {log.verificationStatus === "Verified" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : log.verificationStatus === "Flagged" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 border border-red-300">
                          <AlertTriangle className="w-2.5 h-2.5" /> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-2.5 h-2.5" /> Under Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Diff */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingLog(log)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="View Changes & Diff"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Auditor Review / Verify */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setVerifyingLog(log);
                            setVerifyStatus(log.verificationStatus);
                            setVerifyNotes(log.auditorNotes || "");
                          }}
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Auditor Review & Verification"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit Notes */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingLog({ ...log })}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit Notes"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(log.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete Entry"
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

      {/* MODAL 1: DETAIL & DIFF VIEW DRAWER */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Audit Snapshot: {viewingLog.id}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingLog(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3.5 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Entity</span>
                  <span className="font-semibold text-foreground">{viewingLog.entityType}</span>
                  <span className="text-muted-foreground block font-mono">{viewingLog.entityId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Action Type</span>
                  <span className="font-semibold text-foreground">{viewingLog.actionType}</span>
                  {viewingLog.versionTag && (
                    <span className="text-purple-700 dark:text-purple-300 font-bold block">{viewingLog.versionTag}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Signatory</span>
                  <span className="font-semibold text-foreground">{viewingLog.performedBy}</span>
                  <span className="text-muted-foreground block">{viewingLog.role}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Recorded On</span>
                  <span className="font-mono text-foreground">{viewingLog.timestamp}</span>
                  <span className="text-muted-foreground block font-mono">{viewingLog.terminalIp}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-muted/30 p-3.5 rounded-lg border border-border">
                <span className="text-muted-foreground block text-[10px] uppercase mb-1 font-semibold">
                  Change Description &amp; Scope
                </span>
                <p className="text-foreground leading-relaxed font-medium">
                  {viewingLog.diffSummary}
                </p>
              </div>

              {/* Side-by-Side Diff */}
              {(viewingLog.oldValue || viewingLog.newValue) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3 rounded-lg">
                    <span className="text-red-700 dark:text-red-300 font-semibold block text-[10px] uppercase mb-1">
                      Previous State (Old Value)
                    </span>
                    <pre className="font-mono text-[11px] text-red-900 dark:text-red-200 whitespace-pre-wrap break-all overflow-x-auto">
                      {viewingLog.oldValue ? JSON.stringify(JSON.parse(viewingLog.oldValue), null, 2) : "None (New Record Created)"}
                    </pre>
                  </div>

                  <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold block text-[10px] uppercase mb-1">
                      Updated State (New Value)
                    </span>
                    <pre className="font-mono text-[11px] text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap break-all overflow-x-auto">
                      {viewingLog.newValue ? JSON.stringify(JSON.parse(viewingLog.newValue), null, 2) : "None"}
                    </pre>
                  </div>
                </div>
              )}

              {/* Checksum & Auditor Sign-off */}
              <div className="bg-muted/40 p-3.5 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    Cryptographic Integrity Hash:
                  </span>
                  <span className="font-mono text-[11px] text-primary font-bold">
                    {viewingLog.hashChecksum}
                  </span>
                </div>
                {viewingLog.auditorNotes && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                      Auditor Review Notes
                    </span>
                    <p className="text-foreground italic mt-0.5">{viewingLog.auditorNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button onClick={() => setViewingLog(null)} className="w-full sm:w-auto">
                Close Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW AUDIT EVENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Log Manual Audit Entry</h3>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Entity Type*</label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value as AuditEntityType })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  >
                    <option value="Scheme Master">Scheme Master</option>
                    <option value="Rate Matrix">Rate Matrix</option>
                    <option value="Target & Quota">Target &amp; Quota</option>
                    <option value="Participant Profile">Participant Profile</option>
                    <option value="Calculation Run">Calculation Run</option>
                    <option value="Manual Adjustment">Manual Adjustment</option>
                    <option value="Multi-Level Approval">Multi-Level Approval</option>
                    <option value="GL Posting">GL Posting</option>
                    <option value="Penalty & Clawback">Penalty &amp; Clawback</option>
                    <option value="Dispute Resolution">Dispute Resolution</option>
                    <option value="System Security">System Security</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Entity Reference ID*</label>
                  <input
                    type="text"
                    required
                    value={formData.entityId}
                    onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                    placeholder="e.g. SCH-RLC-001 or RUN-2026-04"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Action Type*</label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value as AuditActionType })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  >
                    <option value="VERSION_BUMP">VERSION_BUMP (Scheme / Rate Plan)</option>
                    <option value="UPDATE">UPDATE (Edit Fields / Rules)</option>
                    <option value="APPROVE">APPROVE (Sign-Off Step)</option>
                    <option value="CALCULATE">CALCULATE (Batch Execution)</option>
                    <option value="POST_GL">POST_GL (Accrual Journal)</option>
                    <option value="LOCK_PERIOD">LOCK_PERIOD (Immutable Ledger)</option>
                    <option value="WAIVE">WAIVE (Penalty Exemption)</option>
                    <option value="OVERRIDE">OVERRIDE (Executive Override)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Severity*</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as AuditSeverity })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  >
                    <option value="INFO">INFO</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Performed By*</label>
                  <input
                    type="text"
                    required
                    value={formData.performedBy}
                    onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Role*</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">Change Summary / Diff Description*</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.diffSummary}
                    onChange={(e) => setFormData({ ...formData, diffSummary: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                    placeholder="Explain the scheme alteration, rate adjustment, or governance approval."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">Auditor Review Notes</label>
                  <input
                    type="text"
                    value={formData.auditorNotes}
                    onChange={(e) => setFormData({ ...formData, auditorNotes: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                    placeholder="e.g. Verified against Board circular 2026/04."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Record Audit Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AUDITOR VERIFICATION & REVIEW */}
      {verifyingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">
                  Auditor Compliance Review: {verifyingLog.id}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVerifyingLog(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entity:</span>
                <span className="font-semibold">{verifyingLog.entityType} ({verifyingLog.entityId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-semibold">{verifyingLog.actionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authorizing User:</span>
                <span>{verifyingLog.performedBy}</span>
              </div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Compliance Status*
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyStatus("Verified")}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      verifyStatus === "Verified"
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Verified
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyStatus("Under Review")}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      verifyStatus === "Under Review"
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Under Review
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyStatus("Flagged")}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      verifyStatus === "Flagged"
                        ? "bg-red-500 text-white border-red-600 shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Flagged
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Auditor Sign-off Notes &amp; Verification Remarks*
                </label>
                <textarea
                  required
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Inspected against Board resolution and checked four-eyes signature completeness."
                  className="w-full p-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setVerifyingLog(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Confirm Compliance Sign-Off
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT LOG ENTRY */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Edit Audit Note: {editingLog.id}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingLog(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Change Summary / Diff</label>
                <textarea
                  rows={2}
                  value={editingLog.diffSummary}
                  onChange={(e) => setEditingLog({ ...editingLog, diffSummary: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Auditor Review Notes</label>
                <textarea
                  rows={2}
                  value={editingLog.auditorNotes || ""}
                  onChange={(e) => setEditingLog({ ...editingLog, auditorNotes: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingLog(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Update Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE CONFIRMATION */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Confirm Audit Deletion</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to delete audit entry <strong>{deletingId}</strong>?
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
                Delete Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
