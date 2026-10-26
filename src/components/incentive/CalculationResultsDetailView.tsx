import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Shield,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  DollarSign,
  UserCheck,
  Eye,
  FileText,
  Percent,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Users,
  Building2,
  X,
  Check,
  Database,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  History,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/incentive-data";
import { apiFetch } from "@/lib/api-client";

export interface ParticipantCalculationResult {
  id: string;
  technicianCode: string;
  technicianName: string;
  role: string;
  division: string;
  schemeCode: string;
  schemeName: string;
  targetVolume: number;
  actualVolume: number;
  volumePct: number;
  targetTurnover: number;
  actualTurnover: number;
  turnoverPct: number;
  slabTier: string;
  slabMultiplier: number;
  grossCommission: number;
  targetIncentive: number;
  attendanceFactor: number;
  penaltyClawback: number;
  netPayable: number;
  status: "Calculated" | "Verified" | "Held" | "Approved";
  jobCount: number;
  overdueInvoiceCount: number;
  notes?: string;
}

export interface CalculationResultBatch {
  id: string;
  period: string;
  runDate: string;
  status: "Calculated" | "Verified" | "Held" | "Approved";
  runType: string;
  totalParticipants: number;
  grossCommissionLkr: number;
  targetIncentiveLkr: number;
  penaltyClawbackLkr: number;
  netPayableLkr: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  participantResults: ParticipantCalculationResult[];
  auditLogs: {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    action: string;
    details: string;
  }[];
}

const INITIAL_FALLBACK_RESULTS: ParticipantCalculationResult[] = [
  {
    id: "calc-01",
    technicianCode: "TECH-101",
    technicianName: "Ruwan Jayasinghe",
    role: "Senior Field Engineer",
    division: "Consumer Electronics",
    schemeCode: "SCH-CE-FIELD",
    schemeName: "Consumer AV & Smart Appliances Tiered Incentive",
    targetVolume: 40,
    actualVolume: 46,
    volumePct: 115,
    targetTurnover: 850000,
    actualTurnover: 969000,
    turnoverPct: 114,
    slabTier: "Tier 3 (110% - 125%)",
    slabMultiplier: 1.15,
    grossCommission: 98000,
    targetIncentive: 50500,
    attendanceFactor: 1.0,
    penaltyClawback: 0,
    netPayable: 148500,
    status: "Verified",
    jobCount: 46,
    overdueInvoiceCount: 0,
  },
  {
    id: "calc-02",
    technicianCode: "TECH-102",
    technicianName: "Dinesh Bandara",
    role: "Biomedical Specialist",
    division: "Biomedical Engineering",
    schemeCode: "SCH-MED-SPEC",
    schemeName: "Healthcare Diagnostic & Imaging Systems Scheme",
    targetVolume: 25,
    actualVolume: 27,
    volumePct: 108,
    targetTurnover: 1400000,
    actualTurnover: 1484000,
    turnoverPct: 106,
    slabTier: "Tier 2 (100% - 110%)",
    slabMultiplier: 1.05,
    grossCommission: 135000,
    targetIncentive: 81500,
    attendanceFactor: 1.0,
    penaltyClawback: 24500,
    netPayable: 192000,
    status: "Verified",
    jobCount: 27,
    overdueInvoiceCount: 2,
  },
  {
    id: "calc-03",
    technicianCode: "TECH-103",
    technicianName: "Kasun Wijesinghe",
    role: "Network Technician",
    division: "Telecommunications & Networks",
    schemeCode: "SCH-TEL-NET",
    schemeName: "Fiber Optic & Microwave Installation Incentive",
    targetVolume: 35,
    actualVolume: 32,
    volumePct: 91,
    targetTurnover: 600000,
    actualTurnover: 552000,
    turnoverPct: 92,
    slabTier: "Tier 1 (80% - 99%)",
    slabMultiplier: 0.9,
    grossCommission: 58000,
    targetIncentive: 30000,
    attendanceFactor: 1.0,
    penaltyClawback: 0,
    netPayable: 88000,
    status: "Calculated",
    jobCount: 32,
    overdueInvoiceCount: 0,
  },
  {
    id: "calc-04",
    technicianCode: "TECH-104",
    technicianName: "Anura Senanayake",
    role: "IT Solutions Architect",
    division: "Enterprise IT Solutions",
    schemeCode: "SCH-IT-SRV",
    schemeName: "Enterprise Datacenter & Server Maintenance Matrix",
    targetVolume: 20,
    actualVolume: 25,
    volumePct: 125,
    targetTurnover: 2200000,
    actualTurnover: 2684000,
    turnoverPct: 122,
    slabTier: "Tier 4 (> 120% Super Achievement)",
    slabMultiplier: 1.25,
    grossCommission: 165000,
    targetIncentive: 98000,
    attendanceFactor: 1.0,
    penaltyClawback: 18000,
    netPayable: 245000,
    status: "Approved",
    jobCount: 25,
    overdueInvoiceCount: 1,
  },
  {
    id: "calc-05",
    technicianCode: "TECH-105",
    technicianName: "Pradeep Kumara",
    role: "Industrial Automation Tech",
    division: "Industrial Automation",
    schemeCode: "SCH-IND-AUTO",
    schemeName: "PLC & Robotics Field Commission Structure",
    targetVolume: 30,
    actualVolume: 23,
    volumePct: 76,
    targetTurnover: 950000,
    actualTurnover: 741000,
    turnoverPct: 78,
    slabTier: "Below Threshold (< 80%)",
    slabMultiplier: 0.7,
    grossCommission: 48000,
    targetIncentive: 35200,
    attendanceFactor: 0.9,
    penaltyClawback: 31200,
    netPayable: 52000,
    status: "Held",
    jobCount: 23,
    overdueInvoiceCount: 3,
  },
  {
    id: "calc-06",
    technicianCode: "TECH-106",
    technicianName: "Nimal Perera",
    role: "Power Systems Technician",
    division: "Power Systems & Generators",
    schemeCode: "SCH-PWR-GEN",
    schemeName: "Diesel Generator & UPS Service Commission Scheme",
    targetVolume: 28,
    actualVolume: 29,
    volumePct: 103,
    targetTurnover: 750000,
    actualTurnover: 765000,
    turnoverPct: 102,
    slabTier: "Tier 2 (100% - 110%)",
    slabMultiplier: 1.0,
    grossCommission: 72000,
    targetIncentive: 40000,
    attendanceFactor: 1.0,
    penaltyClawback: 0,
    netPayable: 112000,
    status: "Calculated",
    jobCount: 29,
    overdueInvoiceCount: 0,
  },
  {
    id: "calc-07",
    technicianCode: "TECH-107",
    technicianName: "Chaminda Silva",
    role: "Consumer AV Technician",
    division: "Consumer Electronics",
    schemeCode: "SCH-CE-FIELD",
    schemeName: "Consumer AV & Smart Appliances Tiered Incentive",
    targetVolume: 32,
    actualVolume: 28,
    volumePct: 87,
    targetTurnover: 700000,
    actualTurnover: 616000,
    turnoverPct: 88,
    slabTier: "Tier 1 (80% - 99%)",
    slabMultiplier: 0.85,
    grossCommission: 45000,
    targetIncentive: 28500,
    attendanceFactor: 1.0,
    penaltyClawback: 9500,
    netPayable: 64000,
    status: "Verified",
    jobCount: 28,
    overdueInvoiceCount: 1,
  },
];

interface CalculationResultsDetailViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function CalculationResultsDetailView({
  onNavigateScreen,
  onBack,
}: CalculationResultsDetailViewProps) {
  // DB & Batch States
  const [batches, setBatches] = useState<CalculationResultBatch[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string>("RUN-2026-05-MTD-04");
  const [results, setResults] = useState<ParticipantCalculationResult[]>(INITIAL_FALLBACK_RESULTS);
  const [auditLogs, setAuditLogs] = useState<CalculationResultBatch["auditLogs"]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Filters & Modals
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedResult, setSelectedResult] = useState<ParticipantCalculationResult | null>(null);
  const [isBatchesModalOpen, setIsBatchesModalOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);

  // New Participant Form State
  const [newForm, setNewForm] = useState({
    technicianCode: "",
    technicianName: "",
    role: "Field Technician",
    division: "Consumer Electronics",
    schemeCode: "SCH-CE-FIELD",
    schemeName: "Consumer AV & Smart Appliances Tiered Incentive",
    targetVolume: 30,
    actualVolume: 32,
    targetTurnover: 750000,
    actualTurnover: 800000,
    slabTier: "Tier 2 (100% - 110%)",
    slabMultiplier: 1.05,
    grossCommission: 65000,
    targetIncentive: 40000,
    attendanceFactor: 1.0,
    penaltyClawback: 0,
    jobCount: 32,
    overdueInvoiceCount: 0,
    status: "Calculated" as ParticipantCalculationResult["status"],
  });

  // Current selected batch object
  const activeBatch = useMemo(() => {
    return batches.find((b) => b.id === activeBatchId) || {
      id: activeBatchId,
      period: "May 2026",
      runDate: new Date().toISOString().slice(0, 10),
      status: "Verified" as const,
      runType: "MTD Simulation Run",
      totalParticipants: results.length,
      grossCommissionLkr: 621000,
      targetIncentiveLkr: 363700,
      penaltyClawbackLkr: 83200,
      netPayableLkr: 901500,
      notes: "Telesonic Lanka monthly calculation run",
      participantResults: results,
      auditLogs: [],
    };
  }, [batches, activeBatchId, results]);

  // Load Calculation Batches from PostgreSQL
  const loadCalculationBatches = useCallback(async (preferredBatchId?: string) => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/api/incentives/calculation-results");
      const data = await res.json();

      if (data && data.success && Array.isArray(data.batches) && data.batches.length > 0) {
        setBatches(data.batches);
        setIsDbConnected(true);
        setLastSynced(new Date().toLocaleTimeString());

        // Determine which batch to display
        const targetId = preferredBatchId || activeBatchId || data.batches[0].id;
        const found = data.batches.find((b: any) => b.id === targetId) || data.batches[0];

        setActiveBatchId(found.id);
        if (found.participantResults && found.participantResults.length > 0) {
          setResults(found.participantResults);
        }
        setAuditLogs(found.auditLogs || []);
        setHasUnsavedChanges(false);
      } else {
        setIsDbConnected(false);
      }
    } catch (err: any) {
      console.warn("Could not connect to PostgreSQL calculation API, keeping local data:", err);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeBatchId]);

  useEffect(() => {
    loadCalculationBatches();
  }, [loadCalculationBatches]);

  // Handle switching active batch
  const handleBatchSelect = (batchId: string) => {
    const selected = batches.find((b) => b.id === batchId);
    if (selected) {
      setActiveBatchId(selected.id);
      setResults(selected.participantResults || []);
      setAuditLogs(selected.auditLogs || []);
      setHasUnsavedChanges(false);
      toast.info(`Switched to Calculation Batch: ${selected.id}`, {
        description: `Period: ${selected.period} · ${selected.participantResults.length} participants`,
      });
    }
  };

  // Filters
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchSearch =
        !searchTerm ||
        r.technicianCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.schemeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDiv = selectedDivision === "All" || r.division === selectedDivision;
      const matchStatus = selectedStatus === "All" || r.status === selectedStatus;
      return matchSearch && matchDiv && matchStatus;
    });
  }, [results, searchTerm, selectedDivision, selectedStatus]);

  // Aggregate stats
  const totals = useMemo(() => {
    return filteredResults.reduce(
      (acc, r) => ({
        count: acc.count + 1,
        gross: acc.gross + (Number(r.grossCommission) || 0),
        targetBonus: acc.targetBonus + (Number(r.targetIncentive) || 0),
        penalties: acc.penalties + (Number(r.penaltyClawback) || 0),
        net: acc.net + (Number(r.netPayable) || 0),
      }),
      { count: 0, gross: 0, targetBonus: 0, penalties: 0, net: 0 },
    );
  }, [filteredResults]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "Technician Code",
      "Technician Name",
      "Division",
      "Scheme Code",
      "Volume %",
      "Turnover %",
      "Slab Multiplier",
      "Gross Commission (LKR)",
      "Target Bonus (LKR)",
      "Attendance Factor",
      "Penalty Clawback (LKR)",
      "Net Payable (LKR)",
      "Status",
    ];

    const rows = filteredResults.map((r) => [
      r.technicianCode,
      `"${r.technicianName}"`,
      `"${r.division}"`,
      r.schemeCode,
      `${r.volumePct}%`,
      `${r.turnoverPct}%`,
      r.slabMultiplier,
      r.grossCommission,
      r.targetIncentive,
      r.attendanceFactor,
      r.penaltyClawback,
      r.netPayable,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Incentive_Calculation_Results_${activeBatch.period.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Calculation results exported to CSV.", {
      description: `${filteredResults.length} records downloaded.`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Participant Status Change (Persisted to PostgreSQL)
  const handleStatusChange = async (id: string, newStatus: ParticipantCalculationResult["status"]) => {
    // 1. Optimistic update
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setHasUnsavedChanges(true);

    try {
      // 2. Persist to API
      const res = await apiFetch(
        `/api/incentives/calculation-results/${activeBatchId}/participants/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            actorName: "Incentive Supervisor",
            notes: `Status changed to ${newStatus} directly from Calculation Results View`,
          }),
        }
      );
      const data = await res.json();

      if (data && data.success) {
        toast.success(`Participant status updated to ${newStatus} in PostgreSQL.`);
        setHasUnsavedChanges(false);
      } else {
        toast.info(`Status updated locally to ${newStatus}.`);
      }
    } catch (err: any) {
      console.warn("Status change saved locally (API fallback):", err);
      toast.info(`Status updated locally to ${newStatus}.`);
    }
  };

  // Delete Individual Participant Result
  const handleDeleteParticipant = async (resultId: string, techName: string) => {
    if (!confirm(`Are you sure you want to remove ${techName} from calculation batch ${activeBatchId}?`)) {
      return;
    }

    try {
      const res = await apiFetch(
        `/api/incentives/calculation-results/${activeBatchId}/participants/${resultId}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (data && data.success) {
        setResults((prev) => prev.filter((r) => r.id !== resultId));
        toast.success(`Removed ${techName} from calculation batch.`);
      } else {
        setResults((prev) => prev.filter((r) => r.id !== resultId));
        toast.info(`Removed ${techName} locally.`);
      }
    } catch (err: any) {
      setResults((prev) => prev.filter((r) => r.id !== resultId));
      toast.info(`Removed ${techName} locally.`);
    }
  };

  // Save All Changes to PostgreSQL
  const handleSaveToPostgreSql = async () => {
    try {
      setIsSaving(true);
      const grossComm = results.reduce((acc, r) => acc + (Number(r.grossCommission) || 0), 0);
      const targetInc = results.reduce((acc, r) => acc + (Number(r.targetIncentive) || 0), 0);
      const penaltyClaw = results.reduce((acc, r) => acc + (Number(r.penaltyClawback) || 0), 0);
      const netPay = results.reduce((acc, r) => acc + (Number(r.netPayable) || 0), 0);

      const payload = {
        period: activeBatch.period,
        status: activeBatch.status,
        runType: activeBatch.runType,
        totalParticipants: results.length,
        grossCommissionLkr: grossComm,
        targetIncentiveLkr: targetInc,
        penaltyClawbackLkr: penaltyClaw,
        netPayableLkr: netPay,
        notes: activeBatch.notes || "Updated from Calculation Results Detail View",
        participantResults: results,
      };

      const res = await apiFetch(
        `/api/incentives/calculation-results/${activeBatchId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (data && data.success) {
        toast.success("Successfully persisted calculation results to PostgreSQL!", {
          description: `Batch ${activeBatchId} · ${results.length} participants synced.`,
        });
        setHasUnsavedChanges(false);
        await loadCalculationBatches(activeBatchId);
      } else {
        toast.warning("Could not sync with PostgreSQL backend; changes kept locally.");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Error saving calculation results to database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add Participant Submit Handler
  const handleAddParticipantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.technicianCode.trim() || !newForm.technicianName.trim()) {
      toast.error("Technician Code and Name are required.");
      return;
    }

    const volPct =
      newForm.targetVolume > 0
        ? Math.round((newForm.actualVolume / newForm.targetVolume) * 100)
        : 100;
    const turnoverPct =
      newForm.targetTurnover > 0
        ? Math.round((newForm.actualTurnover / newForm.targetTurnover) * 100)
        : 100;

    // Formula: (gross + targetInc) * attendance - penalty
    const computedNet = Math.max(
      0,
      Math.round(
        (newForm.grossCommission + newForm.targetIncentive) * newForm.attendanceFactor -
          newForm.penaltyClawback
      )
    );

    const newParticipant: ParticipantCalculationResult = {
      id: `calc-${Date.now().toString().slice(-6)}`,
      technicianCode: newForm.technicianCode.trim().toUpperCase(),
      technicianName: newForm.technicianName.trim(),
      role: newForm.role,
      division: newForm.division,
      schemeCode: newForm.schemeCode,
      schemeName: newForm.schemeName,
      targetVolume: Number(newForm.targetVolume) || 0,
      actualVolume: Number(newForm.actualVolume) || 0,
      volumePct: volPct,
      targetTurnover: Number(newForm.targetTurnover) || 0,
      actualTurnover: Number(newForm.actualTurnover) || 0,
      turnoverPct: turnoverPct,
      slabTier: newForm.slabTier,
      slabMultiplier: Number(newForm.slabMultiplier) || 1.0,
      grossCommission: Number(newForm.grossCommission) || 0,
      targetIncentive: Number(newForm.targetIncentive) || 0,
      attendanceFactor: Number(newForm.attendanceFactor) || 1.0,
      penaltyClawback: Number(newForm.penaltyClawback) || 0,
      netPayable: computedNet,
      status: newForm.status,
      jobCount: Number(newForm.jobCount) || 0,
      overdueInvoiceCount: Number(newForm.overdueInvoiceCount) || 0,
    };

    const updated = [...results, newParticipant];
    setResults(updated);
    setIsAddParticipantOpen(false);
    setHasUnsavedChanges(true);

    toast.success(`Added ${newParticipant.technicianName} to calculation batch.`);

    // Automatically sync to PostgreSQL
    try {
      const grossComm = updated.reduce((acc, r) => acc + (Number(r.grossCommission) || 0), 0);
      const targetInc = updated.reduce((acc, r) => acc + (Number(r.targetIncentive) || 0), 0);
      const penaltyClaw = updated.reduce((acc, r) => acc + (Number(r.penaltyClawback) || 0), 0);
      const netPay = updated.reduce((acc, r) => acc + (Number(r.netPayable) || 0), 0);

      await apiFetch(`/api/incentives/calculation-results/${activeBatchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: activeBatch.period,
          status: activeBatch.status,
          runType: activeBatch.runType,
          totalParticipants: updated.length,
          grossCommissionLkr: grossComm,
          targetIncentiveLkr: targetInc,
          penaltyClawbackLkr: penaltyClaw,
          netPayableLkr: netPay,
          participantResults: updated,
        }),
      });
      setHasUnsavedChanges(false);
      await loadCalculationBatches(activeBatchId);
    } catch (err: any) {
      console.warn("Failed background auto-sync:", err);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>All Incentive Screens</span>
            </Button>
          )}
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded">
            Screen #08 · Processing & Runs
          </span>
        </div>

        {/* Quick jump navigation */}
        {onNavigateScreen && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Jump to:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen("calculation-run")}
              className="h-7 text-xs gap-1 cursor-pointer"
            >
              <span>Batch Engine</span>
              <ArrowRight size={11} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen("approval-posting")}
              className="h-7 text-xs gap-1 cursor-pointer"
            >
              <span>Approvals</span>
              <ArrowRight size={11} />
            </Button>
          </div>
        )}
      </div>

      {/* PostgreSQL Live Connection Status Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-xs ${
          isDbConnected
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300"
            : "bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Database size={15} className={isDbConnected ? "text-emerald-600" : "text-amber-600"} />
          <span className="font-semibold">
            {isDbConnected
              ? "PostgreSQL Live Database Connected (telesonic)"
              : "PostgreSQL Database Disconnected / Using Offline Fallback"}
          </span>
          <span className="hidden sm:inline text-muted-foreground">·</span>
          <span className="hidden sm:inline text-muted-foreground font-mono">
            Table: calculation_result_batches &amp; calculation_participant_results
          </span>
          {lastSynced && (
            <span className="hidden md:inline text-[11px] opacity-75">
              (Last synced: {lastSynced})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-amber-600 font-semibold text-[11px] flex items-center gap-1">
              <AlertCircle size={12} />
              Unsaved changes
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadCalculationBatches(activeBatchId)}
            disabled={isLoading}
            className="h-6 text-xs px-2 gap-1"
          >
            <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
            <span>Sync from DB</span>
          </Button>
        </div>
      </div>

      {/* Screen Title & Batch Context Banner */}
      <div className="card-surface p-5 sm:p-6 rounded-lg border bg-card shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-success text-success-foreground shadow-xs">
              <FileSpreadsheet size={24} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Calculation Results Detail View
                </h1>
                <span className="rounded-md bg-success-soft text-success px-2 py-0.5 text-xs font-semibold font-mono">
                  Batch #{activeBatch.id}
                </span>
                <span className="rounded-md bg-primary-soft text-primary px-2 py-0.5 text-xs font-medium">
                  {activeBatch.period}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  activeBatch.status === "Approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : activeBatch.status === "Verified"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {activeBatch.status}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Telesonic Lanka · Individual participant incentive computations, quota achievements,
                slabs, attendance proration, and aging penalty deductions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Period / Batch Selector */}
            {batches.length > 0 && (
              <select
                value={activeBatchId}
                onChange={(e) => handleBatchSelect(e.target.value)}
                className="input-field h-8 text-xs bg-card font-medium"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.period} ({b.id}) - {b.status}
                  </option>
                ))}
              </select>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBatchesModalOpen(true)}
              className="gap-1.5 text-xs h-8"
              title="View all calculation batches and audit history"
            >
              <History size={13} />
              <span>Batches ({batches.length})</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddParticipantOpen(true)}
              className="gap-1.5 text-xs h-8"
            >
              <Plus size={13} />
              <span>Add Participant</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSaveToPostgreSql}
              disabled={isSaving}
              className="gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save to DB</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="gap-1.5 text-xs h-8"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs h-8"
            >
              <Printer size={13} />
              <span>Print</span>
            </Button>
          </div>
        </div>

        {/* Aggregated KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Participants
            </span>
            <span className="text-xl font-bold text-foreground font-mono">{totals.count}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Gross Commission
            </span>
            <span className="text-xl font-bold text-foreground font-mono">
              LKR {formatCurrency(totals.gross)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Target Bonus
            </span>
            <span className="text-xl font-bold text-foreground font-mono text-primary">
              LKR {formatCurrency(totals.targetBonus)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Penalty Clawbacks
            </span>
            <span className="text-xl font-bold text-destructive font-mono">
              -LKR {formatCurrency(totals.penalties)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Net Payable Pool
            </span>
            <span className="text-xl font-bold text-success font-mono">
              LKR {formatCurrency(totals.net)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-surface p-4 rounded-lg border bg-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by code, technician name, or scheme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 text-xs h-9 w-full bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="input-field h-9 text-xs bg-card"
          >
            <option value="All">All Divisions</option>
            <option value="Consumer Electronics">Consumer Electronics</option>
            <option value="Biomedical Engineering">Biomedical Engineering</option>
            <option value="Telecommunications & Networks">Telecommunications & Networks</option>
            <option value="Enterprise IT Solutions">Enterprise IT Solutions</option>
            <option value="Industrial Automation">Industrial Automation</option>
            <option value="Power Systems & Generators">Power Systems & Generators</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field h-9 text-xs bg-card"
          >
            <option value="All">All Verification Statuses</option>
            <option value="Calculated">Calculated</option>
            <option value="Verified">Verified</option>
            <option value="Approved">Approved</option>
            <option value="Held">Held / Under Review</option>
          </select>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="card-surface overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[1020px]">
            <thead>
              <tr className="border-b bg-muted/50 text-left font-semibold text-muted-foreground">
                <th className="px-3.5 py-3">Technician / Code</th>
                <th className="px-3.5 py-3">Division & Scheme</th>
                <th className="px-3.5 py-3 text-right">Target Achieved</th>
                <th className="px-3.5 py-3 text-right">Slab Tier</th>
                <th className="px-3.5 py-3 text-right">Gross Comm.</th>
                <th className="px-3.5 py-3 text-right">Target Bonus</th>
                <th className="px-3.5 py-3 text-right">Penalty</th>
                <th className="px-3.5 py-3 text-right font-bold text-foreground">Net Payable</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                <th className="px-3.5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredResults.map((r) => {
                const isOver = r.volumePct >= 100;
                const hasPenalty = r.penaltyClawback > 0;

                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-3.5 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {r.technicianCode}
                        </span>
                        <div>
                          <div className="font-semibold text-foreground">{r.technicianName}</div>
                          <div className="text-[10px] text-muted-foreground">{r.role}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 text-muted-foreground">
                      <div className="font-medium text-foreground">{r.division}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {r.schemeName}
                      </div>
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums">
                      <div className={isOver ? "text-success font-semibold" : "text-foreground"}>
                        Vol: {r.volumePct}% ({r.actualVolume}/{r.targetVolume})
                      </div>
                      <div className="text-[10px] text-muted-foreground">Val: {r.turnoverPct}%</div>
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-muted rounded font-medium text-foreground">
                        {r.slabMultiplier}x
                      </span>
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums text-foreground">
                      LKR {formatCurrency(r.grossCommission)}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums text-primary font-medium">
                      LKR {formatCurrency(r.targetIncentive)}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums">
                      {hasPenalty ? (
                        <span className="text-destructive font-semibold">
                          -LKR {formatCurrency(r.penaltyClawback)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums font-bold text-foreground text-sm">
                      LKR {formatCurrency(r.netPayable)}
                    </td>

                    <td className="px-3.5 py-3 text-center">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(
                            r.id,
                            e.target.value as ParticipantCalculationResult["status"],
                          )
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          r.status === "Approved"
                            ? "bg-success-soft text-success border-success/30"
                            : r.status === "Verified"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : r.status === "Held"
                                ? "bg-destructive-soft text-destructive border-destructive/30"
                                : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <option value="Calculated">Calculated</option>
                        <option value="Verified">Verified</option>
                        <option value="Approved">Approved</option>
                        <option value="Held">Held</option>
                      </select>
                    </td>

                    <td className="px-3.5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedResult(r)}
                          className="h-7 w-7 p-0 cursor-pointer"
                          title="View Detailed Computation Drilldown"
                        >
                          <Eye size={13} className="text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteParticipant(r.id, r.technicianName)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Remove participant from batch"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-xs">
            No technician incentive records match the search and filter settings.
          </div>
        )}
      </div>

      {/* Drilldown Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <UserCheck size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {selectedResult.technicianName} ({selectedResult.technicianCode})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedResult.role} · {selectedResult.division}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResult(null)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Scheme Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-muted/40 p-3.5 rounded-lg border">
              <div>
                <span className="text-muted-foreground block text-[11px]">Applied Scheme</span>
                <span className="font-semibold text-foreground font-mono">
                  {selectedResult.schemeCode}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Achievement Tier</span>
                <span className="font-semibold text-foreground">{selectedResult.slabTier}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Attendance Factor</span>
                <span className="font-semibold text-foreground">
                  {Math.round(selectedResult.attendanceFactor * 100)}% (Prorated)
                </span>
              </div>
            </div>

            {/* Computation Breakdown Math */}
            <div className="space-y-2 border rounded-lg p-4 bg-card text-xs">
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Formula Computation Breakdown
              </h4>

              <div className="space-y-1.5 pt-2 font-mono">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">
                    Base Gross Commission ({selectedResult.jobCount} job sheets closed):
                  </span>
                  <span className="font-medium text-foreground">
                    LKR {formatCurrency(selectedResult.grossCommission)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">
                    Target Achievement Bonus ({selectedResult.slabMultiplier}x multiplier):
                  </span>
                  <span className="font-medium text-primary">
                    + LKR {formatCurrency(selectedResult.targetIncentive)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">
                    Aging Penalty Clawback ({selectedResult.overdueInvoiceCount} invoices &gt; 45
                    days):
                  </span>
                  <span className="font-medium text-destructive">
                    - LKR {formatCurrency(selectedResult.penaltyClawback)}
                  </span>
                </div>

                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-foreground">Net Disbursable Incentive:</span>
                  <span className="text-success font-bold">
                    LKR {formatCurrency(selectedResult.netPayable)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="gap-1.5 text-xs"
              >
                <Printer size={13} />
                <span>Print Individual Payslip</span>
              </Button>

              <Button size="sm" onClick={() => setSelectedResult(null)} className="text-xs">
                Close Drilldown
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batches History Modal */}
      {isBatchesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-3xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <History size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Calculation Batches in PostgreSQL
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage historical calculation runs, review audit trails, or load another batch.
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBatchesModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-3">
              {batches.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    b.id === activeBatchId
                      ? "bg-primary/5 border-primary/40 shadow-xs"
                      : "bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{b.period}</span>
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          b.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "Verified"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span>Participants: {b.totalParticipants}</span>
                      <span>Net Pool: LKR {formatCurrency(b.netPayableLkr)}</span>
                      <span>Run Date: {b.runDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.id === activeBatchId ? (
                      <span className="text-xs font-semibold text-primary px-3 py-1 bg-primary/10 rounded-md flex items-center gap-1">
                        <Check size={13} /> Active
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleBatchSelect(b.id);
                          setIsBatchesModalOpen(false);
                        }}
                        className="text-xs h-8"
                      >
                        Load Batch
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Audit Trail for Active Batch */}
            {auditLogs.length > 0 && (
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Audit Trail for {activeBatchId}
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded bg-muted/40 border text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground">· {log.details}</span>
                      </div>
                      <div className="text-right text-[11px] text-muted-foreground font-mono shrink-0">
                        {log.user} ({log.timestamp})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" onClick={() => setIsBatchesModalOpen(false)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {isAddParticipantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-xl rounded-xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Plus size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Add Participant to Calculation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Add a new technician calculation line directly into {activeBatchId}.
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddParticipantOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleAddParticipantSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Technician Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TECH-108"
                    value={newForm.technicianCode}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, technicianCode: e.target.value }))
                    }
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Technician Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malinda Wickrama"
                    value={newForm.technicianName}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, technicianName: e.target.value }))
                    }
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Division</label>
                  <select
                    value={newForm.division}
                    onChange={(e) => setNewForm((prev) => ({ ...prev, division: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  >
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Biomedical Engineering">Biomedical Engineering</option>
                    <option value="Telecommunications & Networks">Telecommunications & Networks</option>
                    <option value="Enterprise IT Solutions">Enterprise IT Solutions</option>
                    <option value="Industrial Automation">Industrial Automation</option>
                    <option value="Power Systems & Generators">Power Systems & Generators</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Role</label>
                  <input
                    type="text"
                    value={newForm.role}
                    onChange={(e) => setNewForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="input-field w-full h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Target Volume</label>
                  <input
                    type="number"
                    value={newForm.targetVolume}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, targetVolume: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Actual Volume</label>
                  <input
                    type="number"
                    value={newForm.actualVolume}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, actualVolume: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Target Turnover (LKR)</label>
                  <input
                    type="number"
                    value={newForm.targetTurnover}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, targetTurnover: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Actual Turnover (LKR)</label>
                  <input
                    type="number"
                    value={newForm.actualTurnover}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, actualTurnover: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Gross Comm. (LKR)</label>
                  <input
                    type="number"
                    value={newForm.grossCommission}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, grossCommission: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Target Bonus (LKR)</label>
                  <input
                    type="number"
                    value={newForm.targetIncentive}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, targetIncentive: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Penalty (LKR)</label>
                  <input
                    type="number"
                    value={newForm.penaltyClawback}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, penaltyClawback: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Attendance Factor</label>
                  <input
                    type="number"
                    step="0.05"
                    max="1.0"
                    min="0"
                    value={newForm.attendanceFactor}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, attendanceFactor: Number(e.target.value) }))
                    }
                    className="input-field w-full h-8 text-xs bg-card font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddParticipantOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                  Add to Batch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
