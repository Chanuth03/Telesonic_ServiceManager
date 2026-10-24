import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type ClawbackPenaltyItem,
  type ClawbackRecordType,
  type TabCategory,
  type SettlementStatus,
} from "@/lib/clawback-penalty-db";

interface ClawbackPenaltyViewProps {
  onBack?: () => void;
  onNavigateScreen?: (screenId: string) => void;
}

export function ClawbackPenaltyView({ onBack }: ClawbackPenaltyViewProps) {
  // Master State
  const [items, setItems] = useState<ClawbackPenaltyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Tab State: Penalty | Clawback | History (per Page 38 requirement)
  const [activeTab, setActiveTab] = useState<TabCategory>("Penalty");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [selectedRecordType, setSelectedRecordType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modals
  const [viewingItem, setViewingItem] = useState<ClawbackPenaltyItem | null>(null);
  const [editingItem, setEditingItem] = useState<ClawbackPenaltyItem | null>(null);
  const [settlingItem, setSettlingItem] = useState<ClawbackPenaltyItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Settlement Form State
  const [settleDecision, setSettleDecision] = useState<"Settled" | "Deducted" | "Waived">("Settled");
  const [settlePerformedBy, setSettlePerformedBy] = useState<string>("Finance Manager (Nimal Perera)");
  const [settleRemarks, setSettleRemarks] = useState<string>("");

  // New Item Form State (matches Page 38 Header Fields: Participant*, Period*, Type, Total)
  const [formData, setFormData] = useState({
    participantCode: "044",
    participantName: "Ishara Fernando",
    division: "Retail & Dealer",
    period: "2026-04",
    recordType: "Debtor Penalty" as ClawbackRecordType,
    invoiceNo: "",
    customerName: "",
    netValue: 150000,
    dueAgeDays: 52,
    bracket: "46 - 60 days",
    ratePercent: 2.5,
    penaltyAmount: 3750,
    runNo: "INC-RUN-2026-04-RLC",
    isRecurring: true,
    resolutionRemarks: "",
  });

  // Fetch Items from Database API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incentives/clawbacks");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to fetch clawback & penalty records.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Error connecting to database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter Items based on active tab and dropdown filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "Penalty" && item.tabCategory !== "Penalty") return false;
      if (activeTab === "Clawback" && item.tabCategory !== "Clawback") return false;
      if (activeTab === "History" && item.tabCategory !== "History") return false;

      // Period filter
      if (selectedPeriod !== "All" && item.period !== selectedPeriod) return false;

      // Division filter
      if (selectedDivision !== "All" && item.division !== selectedDivision) return false;

      // Type filter
      if (selectedRecordType !== "All" && item.recordType !== selectedRecordType) return false;

      // Status filter
      if (selectedStatus !== "All" && item.settlementStatus !== selectedStatus) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.participantCode.toLowerCase().includes(q) ||
          item.participantName.toLowerCase().includes(q) ||
          item.invoiceNo.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.runNo.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [items, activeTab, selectedPeriod, selectedDivision, selectedRecordType, selectedStatus, searchQuery]);

  // Dynamic Options
  const periods = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.period));
    return ["All", ...Array.from(set).sort().reverse()];
  }, [items]);

  const divisions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.division));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  // KPI Metrics
  const activePenaltiesCount = useMemo(() => items.filter((i) => i.tabCategory === "Penalty").length, [items]);
  const activePenaltiesTotal = useMemo(
    () => items.filter((i) => i.tabCategory === "Penalty").reduce((sum, i) => sum + i.penaltyAmount, 0),
    [items]
  );
  const overdueDebtorsTotal = useMemo(
    () => items.filter((i) => i.tabCategory === "Penalty").reduce((sum, i) => sum + i.netValue, 0),
    [items]
  );
  const activeClawbacksCount = useMemo(() => items.filter((i) => i.tabCategory === "Clawback").length, [items]);
  const activeClawbacksTotal = useMemo(
    () => items.filter((i) => i.tabCategory === "Clawback").reduce((sum, i) => sum + i.penaltyAmount, 0),
    [items]
  );
  const historyTotal = useMemo(
    () => items.filter((i) => i.tabCategory === "History").reduce((sum, i) => sum + i.penaltyAmount, 0),
    [items]
  );

  // Auto-calculation helper for new form
  const handleFormChange = (key: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "recordType") {
        if (value === "Debtor Penalty") {
          next.isRecurring = true;
          next.dueAgeDays = next.dueAgeDays > 45 ? next.dueAgeDays : 55;
          next.bracket = next.dueAgeDays <= 60 ? "46 - 60 days" : next.dueAgeDays <= 90 ? "61 - 90 days" : "> 90 days";
          next.ratePercent = next.dueAgeDays <= 60 ? 2.5 : next.dueAgeDays <= 90 ? 3.5 : 5.0;
        } else if (value === "Cheque Dishonour") {
          next.isRecurring = false;
          next.dueAgeDays = 0;
          next.bracket = "Dishonoured Cheque";
          next.ratePercent = 3.61;
        } else {
          next.isRecurring = false;
          next.dueAgeDays = 0;
          next.bracket = "Credit Memo Reversal";
          next.ratePercent = 5.0;
        }
      }

      if (key === "dueAgeDays" && next.recordType === "Debtor Penalty") {
        const days = Number(value);
        if (days <= 60) {
          next.bracket = "46 - 60 days";
          next.ratePercent = 2.5;
        } else if (days <= 90) {
          next.bracket = "61 - 90 days";
          next.ratePercent = 3.5;
        } else {
          next.bracket = "> 90 days";
          next.ratePercent = 5.0;
        }
      }

      // Recalculate penalty amount
      if (key === "netValue" || key === "ratePercent" || key === "dueAgeDays" || key === "recordType") {
        const net = Number(next.netValue || 0);
        const rate = Number(next.ratePercent || 0);
        next.penaltyAmount = Math.round((net * rate) / 100 * 100) / 100;
      }

      return next;
    });
  };

  // Submit New Record
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.participantCode || !formData.invoiceNo || !formData.netValue) {
      toast.error("Please fill in mandatory fields (* Participant, Invoice No, Net Value).");
      return;
    }

    try {
      const res = await fetch("/api/incentives/clawbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Penalty/Clawback record added successfully.");
        setIsAddModalOpen(false);
        fetchItems();
      } else {
        toast.error(data.error || "Failed to create entry.");
      }
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Error creating entry.");
    }
  };

  // Submit Edit Record
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/incentives/clawbacks/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Record updated successfully.");
        setEditingItem(null);
        fetchItems();
      } else {
        toast.error(data.error || "Failed to update record.");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating record.");
    }
  };

  // Submit Settle / Waive Workflow
  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingItem) return;

    try {
      const res = await fetch(`/api/incentives/clawbacks/${settlingItem.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: settleDecision,
          performedBy: settlePerformedBy,
          remarks: settleRemarks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Entry marked as ${settleDecision} successfully.`);
        setSettlingItem(null);
        setSettleRemarks("");
        fetchItems();
      } else {
        toast.error(data.error || "Failed to process settlement.");
      }
    } catch (err) {
      console.error("Settle error:", err);
      toast.error("Error processing settlement.");
    }
  };

  // Delete Record
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/incentives/clawbacks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Record deleted successfully.");
        setDeletingId(null);
        fetchItems();
      } else {
        toast.error(data.error || "Failed to delete record.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting record.");
    }
  };

  // CSV Export (matches Page 38 requirement: Actions: Export Excel / PDF)
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Participant Code",
      "Participant Name",
      "Division",
      "Period",
      "Record Type",
      "Tab Category",
      "Invoice / Ref",
      "Customer Name",
      "Net Value (LKR)",
      "Due Age (Days)",
      "Aging Bracket",
      "Rate %",
      "Penalty Amount (LKR)",
      "Run No",
      "Monthly Recurring",
      "Status",
      "Settled At",
      "Settled By",
      "Resolution Remarks",
    ];

    const rows = filteredItems.map((i) => [
      i.id,
      i.participantCode,
      `"${i.participantName}"`,
      i.division,
      i.period,
      i.recordType,
      i.tabCategory,
      i.invoiceNo,
      `"${i.customerName}"`,
      i.netValue.toFixed(2),
      i.dueAgeDays,
      `"${i.bracket}"`,
      i.ratePercent.toFixed(2),
      i.penaltyAmount.toFixed(2),
      i.runNo,
      i.isRecurring ? "Yes" : "No",
      i.settlementStatus,
      i.settledAt || "",
      `"${i.settledBy || ""}"`,
      `"${(i.resolutionRemarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Telesonic_Clawback_Penalty_Ledger_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel / CSV report exported successfully.");
  };

  // Status Badge Helper
  const renderStatusBadge = (status: SettlementStatus) => {
    switch (status) {
      case "Settled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Settled
          </span>
        );
      case "Deducted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Check className="w-3 h-3" /> Deducted
          </span>
        );
      case "Waived":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <RotateCcw className="w-3 h-3" /> Waived
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" /> Pending Recovery
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
                Commission Clawback &amp; Penalty Register
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                INC-SCR-19
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                SCREEN 17
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly penalty on overdue invoices (&gt; 45 days) and clawback of commission on returns, cancelled receipts and returned cheques.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchItems}
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
            Add Entry
          </Button>
        </div>
      </div>

      {/* Database Connection & Business Validation Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">PostgreSQL Connected:</span>
          <span>Table `incentive_clawback_penalties` | Last synced: {lastSynced || "Just now"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium">
          <Repeat className="w-3.5 h-3.5 text-amber-600" />
          <span>Validation Rule: Penalty repeats monthly until the invoice is 100% settled</span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Penalties */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Active Debtor Penalties</span>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            LKR {activePenaltiesTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {activePenaltiesCount} invoices overdue &gt; 45 days
          </p>
        </div>

        {/* Overdue Debtors Principal */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Overdue Debtors Base</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            LKR {overdueDebtorsTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Principal exposure subject to monthly penalty
          </p>
        </div>

        {/* Commission Clawbacks */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Commission Clawbacks</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            LKR {activeClawbacksTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeClawbacksCount} dishonoured cheques &amp; returns
          </p>
        </div>

        {/* Settled / Waived History */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Settled / Waived Pool</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            LKR {historyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Historical recovered or exempted records
          </p>
        </div>
      </div>

      {/* Tabs matching Page 38: Penalty | Clawback | History */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab("Penalty")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "Penalty"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Penalty (Overdue Debtors &gt; 45d)
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-bold">
            {items.filter((i) => i.tabCategory === "Penalty").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Clawback")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "Clawback"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Clawback (Returns &amp; Dishonours)
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-orange-500/10 text-orange-600 font-bold">
            {items.filter((i) => i.tabCategory === "Clawback").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("History")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "History"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          History (Settled &amp; Waived)
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground font-bold">
            {items.filter((i) => i.tabCategory === "History").length}
          </span>
        </button>
      </div>

      {/* Clean Compact Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice, customer, participant, or run..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Period Filter */}
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Periods</option>
              {periods
                .filter((p) => p !== "All")
                .map((p) => (
                  <option key={p} value={p}>
                    Period: {p}
                  </option>
                ))}
            </select>
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Divisions</option>
              {divisions
                .filter((d) => d !== "All")
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>

          {/* Record Type Filter */}
          <div>
            <select
              value={selectedRecordType}
              onChange={(e) => setSelectedRecordType(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Types</option>
              <option value="Debtor Penalty">Debtor Penalty</option>
              <option value="Cheque Dishonour">Cheque Dishonour</option>
              <option value="Sales Return / Cancellation">Sales Return / Cancellation</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredItems.length}</strong> of {items.length} records in tab &quot;{activeTab}&quot;
          </span>
          {(searchQuery || selectedPeriod !== "All" || selectedDivision !== "All" || selectedRecordType !== "All" || selectedStatus !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPeriod("All");
                setSelectedDivision("All");
                setSelectedRecordType("All");
                setSelectedStatus("All");
              }}
              className="text-primary hover:underline font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Table matching Page 38: Invoice | Net Value | Due Age | Bracket | Rate % | Penalty (LKR) | Run */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Participant*</th>
                <th className="py-3 px-4">Period*</th>
                <th className="py-3 px-4">Invoice / Customer</th>
                <th className="py-3 px-4 text-right">Net Value (LKR)</th>
                <th className="py-3 px-4 text-center">Due Age</th>
                <th className="py-3 px-4">Bracket</th>
                <th className="py-3 px-4 text-right">Rate %</th>
                <th className="py-3 px-4 text-right">Penalty (LKR)</th>
                <th className="py-3 px-4">Run</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading records from PostgreSQL database...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
                    No records found matching the active tab or filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {index + 1}
                    </td>

                    {/* Participant */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.participantName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Code: {item.participantCode} • {item.division}
                      </div>
                    </td>

                    {/* Period */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{item.period}</span>
                      <div className="text-[10px] text-muted-foreground">{item.recordType}</div>
                    </td>

                    {/* Invoice & Customer */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-primary">{item.invoiceNo}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {item.customerName}
                      </div>
                    </td>

                    {/* Net Value */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      {item.netValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Due Age */}
                    <td className="py-3 px-4 text-center font-mono">
                      {item.dueAgeDays > 0 ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.dueAgeDays > 60 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {item.dueAgeDays}d
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Bracket */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground border border-border">
                        {item.bracket}
                      </span>
                      {item.isRecurring && (
                        <span className="block text-[10px] text-amber-600 mt-0.5 flex items-center gap-0.5">
                          <Repeat className="w-2.5 h-2.5" /> Monthly
                        </span>
                      )}
                    </td>

                    {/* Rate % */}
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {item.ratePercent.toFixed(2)}%
                    </td>

                    {/* Penalty LKR */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-destructive">
                      LKR {item.penaltyAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Run */}
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {item.runNo}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {renderStatusBadge(item.settlementStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Details */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingItem(item)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Settle / Waive Workflow */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSettlingItem(item);
                            setSettleRemarks(item.resolutionRemarks || "");
                          }}
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Settle, Deduct, or Waive"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItem({ ...item })}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(item.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
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
            {/* Table Footer with Summary Total */}
            <tfoot>
              <tr className="bg-muted/70 font-bold border-t border-border">
                <td colSpan={4} className="py-3 px-4 text-foreground text-right uppercase tracking-wider">
                  Total for Filtered Rows:
                </td>
                <td className="py-3 px-4 text-right font-mono text-foreground">
                  LKR {filteredItems.reduce((acc, curr) => acc + curr.netValue, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={3} />
                <td className="py-3 px-4 text-right font-mono text-destructive">
                  LKR {filteredItems.reduce((acc, curr) => acc + curr.penaltyAmount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW ENTRY (Page 38 Header Fields: Participant*, Period*, Type, Total) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Add New Penalty / Clawback Entry</h3>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Participant Code & Name */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Participant Code*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.participantCode}
                    onChange={(e) => handleFormChange("participantCode", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                    placeholder="e.g. 044, CAC-088, 031"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Participant Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.participantName}
                    onChange={(e) => handleFormChange("participantName", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Ishara Fernando"
                  />
                </div>

                {/* Period & Division */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Period* (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) => handleFormChange("period", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                    placeholder="2026-04"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Division*
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => handleFormChange("division", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  >
                    <option value="Retail & Dealer">Retail & Dealer</option>
                    <option value="Air Conditioning">Air Conditioning</option>
                    <option value="Modern Trade">Modern Trade</option>
                    <option value="Service Department">Service Department</option>
                  </select>
                </div>

                {/* Record Type (Debtor Penalty, Cheque Dishonour, Sales Return / Cancellation) */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">
                    Type (Record Classification)*
                  </label>
                  <select
                    value={formData.recordType}
                    onChange={(e) => handleFormChange("recordType", e.target.value as ClawbackRecordType)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="Debtor Penalty">Debtor Penalty (Overdue Invoices &gt; 45 days)</option>
                    <option value="Cheque Dishonour">Cheque Dishonour (Unpaid / Bounced Cheque)</option>
                    <option value="Sales Return / Cancellation">Sales Return / Cancellation (Credit Memo Reversal)</option>
                  </select>
                </div>

                {/* Invoice No & Customer */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Invoice / Cheque / CM No*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNo}
                    onChange={(e) => handleFormChange("invoiceNo", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary font-mono"
                    placeholder="e.g. INV-2026-08819 or CHQ-SL3370"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Customer / Client Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => handleFormChange("customerName", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Lanka Solar Traders Ltd"
                  />
                </div>

                {/* Net Value & Due Age */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Net Value (LKR)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.netValue}
                    onChange={(e) => handleFormChange("netValue", parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Due Age (Days past invoice)
                  </label>
                  <input
                    type="number"
                    value={formData.dueAgeDays}
                    onChange={(e) => handleFormChange("dueAgeDays", parseInt(e.target.value, 10) || 0)}
                    disabled={formData.recordType !== "Debtor Penalty"}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary font-mono disabled:opacity-50"
                  />
                </div>

                {/* Bracket & Rate % */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Aging Bracket
                  </label>
                  <input
                    type="text"
                    value={formData.bracket}
                    onChange={(e) => handleFormChange("bracket", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Penalty / Clawback Rate %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ratePercent}
                    onChange={(e) => handleFormChange("ratePercent", parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                {/* Total Penalty Amount (LKR) */}
                <div className="sm:col-span-2 bg-muted/30 p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">Total Penalty / Clawback (LKR)*</span>
                      <p className="text-[11px] text-muted-foreground">
                        Calculated as Net Value × Rate % (editable)
                      </p>
                    </div>
                    <div className="w-48">
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.penaltyAmount}
                        onChange={(e) => handleFormChange("penaltyAmount", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 text-right bg-background border border-border rounded-lg font-mono font-bold text-destructive text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Run No */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Run Batch Ref
                  </label>
                  <input
                    type="text"
                    value={formData.runNo}
                    onChange={(e) => handleFormChange("runNo", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                {/* Monthly Recurring Checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isRecurringCheck"
                    checked={formData.isRecurring}
                    onChange={(e) => handleFormChange("isRecurring", e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                  />
                  <label htmlFor="isRecurringCheck" className="text-foreground font-semibold cursor-pointer">
                    Monthly Recurring (repeats until 100% settled)
                  </label>
                </div>

                {/* Remarks */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">
                    Remarks / Audit Reason
                  </label>
                  <textarea
                    rows={2}
                    value={formData.resolutionRemarks}
                    onChange={(e) => handleFormChange("resolutionRemarks", e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                    placeholder="Add details regarding overdue status, dishonoured cheque reason, etc."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Save &amp; Enforce Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ENTRY */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Edit Record: {editingItem.id}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingItem(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Participant Name</label>
                  <input
                    type="text"
                    value={editingItem.participantName}
                    onChange={(e) => setEditingItem({ ...editingItem, participantName: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Participant Code</label>
                  <input
                    type="text"
                    value={editingItem.participantCode}
                    onChange={(e) => setEditingItem({ ...editingItem, participantCode: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Invoice / Ref</label>
                  <input
                    type="text"
                    value={editingItem.invoiceNo}
                    onChange={(e) => setEditingItem({ ...editingItem, invoiceNo: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editingItem.customerName}
                    onChange={(e) => setEditingItem({ ...editingItem, customerName: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Net Value (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.netValue}
                    onChange={(e) => {
                      const net = parseFloat(e.target.value) || 0;
                      const pen = Math.round((net * editingItem.ratePercent) / 100 * 100) / 100;
                      setEditingItem({ ...editingItem, netValue: net, penaltyAmount: pen });
                    }}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Due Age (Days)</label>
                  <input
                    type="number"
                    value={editingItem.dueAgeDays}
                    onChange={(e) => setEditingItem({ ...editingItem, dueAgeDays: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Aging Bracket</label>
                  <input
                    type="text"
                    value={editingItem.bracket}
                    onChange={(e) => setEditingItem({ ...editingItem, bracket: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Rate %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.ratePercent}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      const pen = Math.round((editingItem.netValue * rate) / 100 * 100) / 100;
                      setEditingItem({ ...editingItem, ratePercent: rate, penaltyAmount: pen });
                    }}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">Penalty / Clawback Amount (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.penaltyAmount}
                    onChange={(e) => setEditingItem({ ...editingItem, penaltyAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-background border border-border rounded-lg font-mono font-bold text-destructive"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    value={editingItem.resolutionRemarks || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, resolutionRemarks: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Update Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SETTLE / WAIVE / DEDUCT WORKFLOW */}
      {settlingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">Settle / Waive Entry</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettlingItem(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Record Ref:</span>
                <span className="font-mono font-bold">{settlingItem.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participant:</span>
                <span className="font-semibold">{settlingItem.participantName} ({settlingItem.participantCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice / Cheque:</span>
                <span className="font-mono">{settlingItem.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Penalty Exposure:</span>
                <span className="font-bold font-mono text-destructive">
                  LKR {settlingItem.penaltyAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Settlement Action*
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleDecision("Settled")}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      settleDecision === "Settled"
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Settled
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettleDecision("Deducted")}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      settleDecision === "Deducted"
                        ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Deducted
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettleDecision("Waived")}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      settleDecision === "Waived"
                        ? "bg-purple-500 text-white border-purple-600 shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Waived
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Authorizing Officer / Performed By*
                </label>
                <input
                  type="text"
                  required
                  value={settlePerformedBy}
                  onChange={(e) => setSettlePerformedBy(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Resolution Remarks &amp; Reference*
                </label>
                <textarea
                  required
                  rows={3}
                  value={settleRemarks}
                  onChange={(e) => setSettleRemarks(e.target.value)}
                  placeholder="e.g. Cleared via customer payment receipt OR Waived per CEO approval dated..."
                  className="w-full p-2 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setSettlingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Confirm {settleDecision}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL VIEW DRAWER */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Record Details: {viewingItem.id}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingItem(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Participant</span>
                  <span className="font-semibold text-foreground">{viewingItem.participantName}</span>
                  <span className="text-muted-foreground block font-mono">Code: {viewingItem.participantCode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Period &amp; Division</span>
                  <span className="font-semibold text-foreground">{viewingItem.period}</span>
                  <span className="text-muted-foreground block">{viewingItem.division}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Invoice / Ref</span>
                  <span className="font-mono font-bold text-primary">{viewingItem.invoiceNo}</span>
                  <span className="text-muted-foreground block">{viewingItem.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Classification</span>
                  <span className="font-semibold text-foreground">{viewingItem.recordType}</span>
                  <span className="text-muted-foreground block">Bracket: {viewingItem.bracket}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-lg border border-border text-center">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Net Invoice Base</span>
                  <span className="font-mono font-bold">LKR {viewingItem.netValue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Rate %</span>
                  <span className="font-mono font-bold">{viewingItem.ratePercent.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Penalty Amount</span>
                  <span className="font-mono font-bold text-destructive">LKR {viewingItem.penaltyAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase">Enforcement &amp; Settlement</span>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{renderStatusBadge(viewingItem.settlementStatus)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recurring Rule:</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    {viewingItem.isRecurring ? "Repeats monthly until 100% settled" : "One-time deduction"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Run Batch:</span>
                  <span className="font-mono">{viewingItem.runNo}</span>
                </div>
                {viewingItem.settledAt && (
                  <div className="flex justify-between">
                    <span>Settled On:</span>
                    <span>{viewingItem.settledAt} by {viewingItem.settledBy}</span>
                  </div>
                )}
                {viewingItem.resolutionRemarks && (
                  <div className="pt-2 border-t border-border mt-2">
                    <span className="text-muted-foreground block text-[10px] uppercase">Remarks</span>
                    <p className="text-foreground italic">{viewingItem.resolutionRemarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button onClick={() => setViewingItem(null)} className="w-full">
                Close
              </Button>
            </div>
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
                <h4 className="text-base font-bold text-foreground">Confirm Deletion</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to delete record <strong>{deletingId}</strong>? This action cannot be undone.
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
                Delete Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
