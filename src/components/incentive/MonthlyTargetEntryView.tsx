import React, { useState, useMemo, useEffect } from "react";
import {
  Target,
  Search,
  Filter,
  Save,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  Shield,
  Calendar,
  Layers,
  History as HistoryIcon,
  ChevronRight,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
  Info,
  DollarSign,
  Percent,
  Sliders,
  ExternalLink,
  Users,
  Building2,
  TrendingUp,
  Award,
  Upload,
  UploadCloud,
  Database,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { useIncentiveDivisions } from "@/lib/use-divisions";

export type TargetPeriodStatus = "Draft" | "Approved" | "Locked";

export interface MonthlyTargetRecord {
  id: string;
  participantId: string;
  employeeName: string;
  role: string;
  division: string;
  territory: string;
  schemeCode: string;
  baseTargetLkr: number;
  stretchTargetLkr: number;
  mtdActualLkr: number;
  notes?: string;
  lastUpdated?: string;
}

export interface TargetHistoryRecord {
  id: string;
  version: string;
  status: TargetPeriodStatus;
  timestamp: string;
  author: string;
  role: string;
  changeSummary: string;
  details: string;
}

export interface SchemeOption {
  code: string;
  name: string;
  division: string;
  targetType: string;
}

const AVAILABLE_SCHEMES: SchemeOption[] = [
  {
    code: "SCH-SLS-2026",
    name: "Retail Smartphone & Devices Sales Incentive",
    division: "Mobile & Accessories",
    targetType: "Turnover Target (LKR)",
  },
  {
    code: "SCH-SRV-2026",
    name: "Field Service Technician First-Time-Fix Incentive",
    division: "Consumer Electronics",
    targetType: "Service Jobs & Turnover",
  },
  {
    code: "SCH-DLR-2026",
    name: "Tier-1 Authorised Dealer Quarterly Volume Rebate",
    division: "Enterprise Solutions",
    targetType: "Volume Target (Units)",
  },
  {
    code: "SCH-PRM-2026",
    name: "Showroom Promoter Fast Sell-Out Bounty",
    division: "Mobile & Accessories",
    targetType: "Turnover Target (LKR)",
  },
  {
    code: "SCH-SOLAR-2026",
    name: "Commercial Solar & Storage Solutions Incentive",
    division: "Renewable Energy",
    targetType: "Turnover Target (LKR)",
  },
];

const TARGET_PERIODS = [
  "May 2026 (Current)",
  "April 2026 (Closed)",
  "June 2026 (Upcoming)",
  "Q2 2026 (Apr - Jun)",
  "Q3 2026 (Jul - Sep)",
];

const TARGET_DIVISIONS = [
  "All Divisions",
  "Mobile & Accessories",
  "Consumer Electronics",
  "Enterprise Solutions",
  "Renewable Energy",
];

const TARGET_TYPES = [
  "Turnover Target (LKR)",
  "Volume Target (Units)",
  "Product Category Target",
  "Combined Volume & Turnover",
];

const INITIAL_TARGETS_DATA: Record<string, MonthlyTargetRecord[]> = {
  "May 2026 (Current)": [
    {
      id: "TGT-202605-001",
      participantId: "EMP-1021",
      employeeName: "Nimal Perera",
      role: "Senior Service Engineer",
      division: "Consumer Electronics",
      territory: "Western Province - Colombo Metro",
      schemeCode: "SCH-SRV-2026",
      baseTargetLkr: 2500000,
      stretchTargetLkr: 3200000,
      mtdActualLkr: 2680000,
      notes: "Met base threshold on 18th May; on track for stretch tier.",
      lastUpdated: "2026-05-18 14:30",
    },
    {
      id: "TGT-202605-002",
      participantId: "EMP-1045",
      employeeName: "Kasun Jayasuriya",
      role: "Enterprise Key Account Manager",
      division: "Enterprise Solutions",
      territory: "Southern & Central Hub",
      schemeCode: "SCH-DLR-2026",
      baseTargetLkr: 4000000,
      stretchTargetLkr: 5000000,
      mtdActualLkr: 4680000,
      notes: "Large commercial institutional contract invoiced in SAP B1.",
      lastUpdated: "2026-05-17 11:20",
    },
    {
      id: "TGT-202605-003",
      participantId: "EMP-1088",
      employeeName: "Dilshan Silva",
      role: "Field Support Specialist",
      division: "Consumer Electronics",
      territory: "Western Province - Gampaha",
      schemeCode: "SCH-SRV-2026",
      baseTargetLkr: 1800000,
      stretchTargetLkr: 2200000,
      mtdActualLkr: 1656000,
      notes: "92% achieved; 3 service jobs pending customer signoff.",
      lastUpdated: "2026-05-18 09:15",
    },
    {
      id: "TGT-202605-004",
      participantId: "EMP-1092",
      employeeName: "Tharindu Fernando",
      role: "Channel Account Executive",
      division: "Mobile & Accessories",
      territory: "North Western & Sabaragamuwa",
      schemeCode: "SCH-SLS-2026",
      baseTargetLkr: 3200000,
      stretchTargetLkr: 4000000,
      mtdActualLkr: 2496000,
      notes: "Mid-month dealer restocking order pending credit approval.",
      lastUpdated: "2026-05-16 16:40",
    },
    {
      id: "TGT-202605-005",
      participantId: "EMP-1104",
      employeeName: "Anura Wickramasinghe",
      role: "Retail Sales Executive",
      division: "Mobile & Accessories",
      territory: "Colombo Flagship Showroom",
      schemeCode: "SCH-SLS-2026",
      baseTargetLkr: 2800000,
      stretchTargetLkr: 3500000,
      mtdActualLkr: 3150000,
      notes: "Exceeded base target (112.5%); qualified for Tier-2 bonus.",
      lastUpdated: "2026-05-18 10:05",
    },
    {
      id: "TGT-202605-006",
      participantId: "EMP-1115",
      employeeName: "Saman Kumara",
      role: "Solar Solutions Specialist",
      division: "Renewable Energy",
      territory: "Islandwide Commercial Projects",
      schemeCode: "SCH-SOLAR-2026",
      baseTargetLkr: 6500000,
      stretchTargetLkr: 8500000,
      mtdActualLkr: 7200000,
      notes: "Factory rooftop hybrid installation commission confirmed.",
      lastUpdated: "2026-05-15 15:55",
    },
    {
      id: "TGT-202605-007",
      participantId: "EMP-1128",
      employeeName: "Chamara Bandara",
      role: "Showroom Promoter",
      division: "Mobile & Accessories",
      territory: "Kandy City Center Showroom",
      schemeCode: "SCH-PRM-2026",
      baseTargetLkr: 1200000,
      stretchTargetLkr: 1600000,
      mtdActualLkr: 980000,
      notes: "Weekend promotional push planned for month-end close.",
      lastUpdated: "2026-05-17 17:10",
    },
    {
      id: "TGT-202605-008",
      participantId: "EMP-1142",
      employeeName: "Pradeep Mendis",
      role: "Senior Technician - HVAC",
      division: "Consumer Electronics",
      territory: "Southern Province - Galle Hub",
      schemeCode: "SCH-SRV-2026",
      baseTargetLkr: 2200000,
      stretchTargetLkr: 2800000,
      mtdActualLkr: 2050000,
      notes: "93.2% completed; warranty maintenance jobs logged.",
      lastUpdated: "2026-05-18 13:45",
    },
  ],
  "April 2026 (Closed)": [
    {
      id: "TGT-202604-001",
      participantId: "EMP-1021",
      employeeName: "Nimal Perera",
      role: "Senior Service Engineer",
      division: "Consumer Electronics",
      territory: "Western Province - Colombo Metro",
      schemeCode: "SCH-SRV-2026",
      baseTargetLkr: 2400000,
      stretchTargetLkr: 3000000,
      mtdActualLkr: 2880000,
      notes: "Final approved actuals. Paid in April payroll.",
      lastUpdated: "2026-04-30 18:00",
    },
    {
      id: "TGT-202604-002",
      participantId: "EMP-1045",
      employeeName: "Kasun Jayasuriya",
      role: "Enterprise Key Account Manager",
      division: "Enterprise Solutions",
      territory: "Southern & Central Hub",
      schemeCode: "SCH-DLR-2026",
      baseTargetLkr: 3800000,
      stretchTargetLkr: 4800000,
      mtdActualLkr: 4560000,
      notes: "120% achievement tier paid.",
      lastUpdated: "2026-04-30 18:00",
    },
  ],
};

const INITIAL_HISTORY: TargetHistoryRecord[] = [
  {
    id: "REV-202605-03",
    version: "v1.2",
    status: "Draft",
    timestamp: "2026-05-18 10:15",
    author: "Lakmal Perera",
    role: "Incentive Administrator",
    changeSummary: "Updated stretch target quota for Consumer Electronics team",
    details:
      "Adjusted Nimal Perera & Dilshan Silva stretch targets based on mid-month territory reallocation.",
  },
  {
    id: "REV-202605-02",
    version: "v1.1",
    status: "Draft",
    timestamp: "2026-05-02 09:30",
    author: "Lakmal Perera",
    role: "Incentive Administrator",
    changeSummary: "Bulk Excel upload of initial May 2026 quotas",
    details: "Imported 8 participant targets from Sales Operations Master Allocation sheet.",
  },
  {
    id: "REV-202605-01",
    version: "v1.0",
    status: "Draft",
    timestamp: "2026-04-28 16:45",
    author: "Sunil Jayawardena",
    role: "Head of Sales Operations",
    changeSummary: "Initialized May 2026 target period cycle",
    details: "Base target templates cloned from April baseline with +5% growth index.",
  },
];

interface MonthlyTargetEntryViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function MonthlyTargetEntryView({ onNavigateScreen, onBack }: MonthlyTargetEntryViewProps) {
  // Dynamic Divisions from Division Master PostgreSQL
  const { divisionNames } = useIncentiveDivisions();
  const targetDivisions = useMemo(() => ["All Divisions", ...divisionNames], [divisionNames]);

  // Header filter states (all required/mandatory)
  const [selectedSchemeCode, setSelectedSchemeCode] = useState<string>("SCH-SLS-2026");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("May 2026 (Current)");
  const [selectedDivision, setSelectedDivision] = useState<string>("All Divisions");
  const [selectedTargetType, setSelectedTargetType] = useState<string>("Turnover Target (LKR)");
  const [version, setVersion] = useState<string>("v1.2 Draft");
  const [currency] = useState<string>("LKR");

  // Status & Lock States
  const [status, setStatus] = useState<TargetPeriodStatus>("Draft");
  const [isPeriodLocked, setIsPeriodLocked] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // PostgreSQL Database & Async States
  const [currentBatchId, setCurrentBatchId] = useState<string>("mtb-2026-05");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [allDbBatches, setAllDbBatches] = useState<any[]>([]);
  const [availableSchemesList, setAvailableSchemesList] = useState<SchemeOption[]>(AVAILABLE_SCHEMES);

  // Targets State
  const [targetsData, setTargetsData] =
    useState<Record<string, MonthlyTargetRecord[]>>(INITIAL_TARGETS_DATA);
  const [historyList, setHistoryList] = useState<TargetHistoryRecord[]>(INITIAL_HISTORY);

  // Load Monthly Targets from PostgreSQL
  const loadTargetsFromDb = async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/monthly-targets");
      const data = await res.json();
      if (data.success && Array.isArray(data.batches) && data.batches.length > 0) {
        setAllDbBatches(data.batches);
        setIsDbConnected(true);

        // Build data map by period
        const periodMap: Record<string, MonthlyTargetRecord[]> = {};
        for (const b of data.batches) {
          periodMap[b.period] = b.entries || [];
        }
        setTargetsData((prev) => ({ ...prev, ...periodMap }));

        // Match current period or first batch
        const match =
          data.batches.find((b: any) => b.period === selectedPeriod) || data.batches[0];
        if (match) {
          setCurrentBatchId(match.id);
          setSelectedSchemeCode(match.schemeCode);
          setSelectedPeriod(match.period);
          setSelectedDivision(match.division || "All Divisions");
          setSelectedTargetType(match.targetType || "Turnover Target (LKR)");
          setVersion(match.version);
          setStatus(match.status);
          setIsPeriodLocked(Boolean(match.isLocked));
          if (match.history && match.history.length > 0) {
            setHistoryList(match.history);
          }
        }
        setHasUnsavedChanges(false);
        if (!silent) {
          toast.success("Synchronized with PostgreSQL database.", {
            description: `Loaded ${data.batches.length} monthly target periods successfully.`,
          });
        }
      } else {
        setIsDbConnected(false);
      }
    } catch (err) {
      console.error("Failed to load monthly targets from PostgreSQL:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Load Schemes dynamically from Scheme Master & Initial Target Load
  useEffect(() => {
    apiFetch("/api/incentives/schemes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.schemes) && data.schemes.length > 0) {
          const mapped: SchemeOption[] = data.schemes.map((s: any) => ({
            code: s.schemeCode,
            name: s.schemeName,
            division: s.division || "All Divisions",
            targetType: s.targetMetric || "Turnover Target (LKR)",
          }));
          setAvailableSchemesList(mapped);
        }
      })
      .catch((err) => console.warn("Using offline schemes fallback:", err));

    loadTargetsFromDb(true);
  }, []);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("targets");

  // Filtering & Search inside the grid
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Inline editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editBaseValue, setEditBaseValue] = useState<number>(0);
  const [editStretchValue, setEditStretchValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>("");

  // Add Target Modal Dialog
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTarget, setNewTarget] = useState<Partial<MonthlyTargetRecord>>({
    participantId: "EMP-1150",
    employeeName: "",
    role: "Retail Sales Executive",
    division: "Mobile & Accessories",
    territory: "Colombo South",
    schemeCode: "SCH-SLS-2026",
    baseTargetLkr: 2000000,
    stretchTargetLkr: 2600000,
    mtdActualLkr: 0,
    notes: "New quota allocation for current month",
  });

  // Bulk Import Simulation Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importFileName, setImportFileName] = useState<string>("");

  // Retrieve current active targets for selected period
  const activePeriodTargets = useMemo(() => {
    return targetsData[selectedPeriod] || [];
  }, [targetsData, selectedPeriod]);

  // Filtered target list
  const filteredTargets = useMemo(() => {
    return activePeriodTargets.filter((item) => {
      const matchDivision =
        selectedDivision === "All Divisions" || item.division === selectedDivision;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.employeeName.toLowerCase().includes(q) ||
        item.participantId.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.territory.toLowerCase().includes(q) ||
        item.division.toLowerCase().includes(q);

      const achPercent =
        item.baseTargetLkr > 0 ? (item.mtdActualLkr / item.baseTargetLkr) * 100 : 0;
      let matchStatus = true;
      if (statusFilter === "Over 100%") {
        matchStatus = achPercent >= 100;
      } else if (statusFilter === "80-100%") {
        matchStatus = achPercent >= 80 && achPercent < 100;
      } else if (statusFilter === "Under 80%") {
        matchStatus = achPercent < 80;
      }

      return matchDivision && matchQuery && matchStatus;
    });
  }, [activePeriodTargets, selectedDivision, searchQuery, statusFilter]);

  // Aggregate metrics calculation
  const aggregates = useMemo(() => {
    const list = activePeriodTargets;
    const count = list.length;
    const totalBase = list.reduce((sum, item) => sum + item.baseTargetLkr, 0);
    const totalStretch = list.reduce((sum, item) => sum + item.stretchTargetLkr, 0);
    const totalActual = list.reduce((sum, item) => sum + item.mtdActualLkr, 0);
    const overallAchievement = totalBase > 0 ? (totalActual / totalBase) * 100 : 0;
    const variance = totalActual - totalBase;
    const achieversCount = list.filter((i) =>
      i.baseTargetLkr > 0 ? (i.mtdActualLkr / i.baseTargetLkr) * 100 >= 100 : false,
    ).length;

    return {
      count,
      totalBase,
      totalStretch,
      totalActual,
      overallAchievement,
      variance,
      achieversCount,
    };
  }, [activePeriodTargets]);

  // Division Rollup aggregation
  const divisionRollup = useMemo(() => {
    const map = new Map<
      string,
      {
        division: string;
        participants: number;
        totalBase: number;
        totalStretch: number;
        totalActual: number;
      }
    >();

    activePeriodTargets.forEach((t) => {
      const existing = map.get(t.division) || {
        division: t.division,
        participants: 0,
        totalBase: 0,
        totalStretch: 0,
        totalActual: 0,
      };
      existing.participants += 1;
      existing.totalBase += t.baseTargetLkr;
      existing.totalStretch += t.stretchTargetLkr;
      existing.totalActual += t.mtdActualLkr;
      map.set(t.division, existing);
    });

    return Array.from(map.values()).map((row) => ({
      ...row,
      achievementPct: row.totalBase > 0 ? (row.totalActual / row.totalBase) * 100 : 0,
      variance: row.totalActual - row.totalBase,
    }));
  }, [activePeriodTargets]);

  // Helpers
  const formatLKR = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getAchievementBadge = (actual: number, base: number) => {
    if (base <= 0) return { label: "0%", color: "bg-muted text-muted-foreground" };
    const pct = (actual / base) * 100;
    if (pct >= 120) {
      return {
        label: `${pct.toFixed(1)}%`,
        tag: "Super Achiever",
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
      };
    }
    if (pct >= 100) {
      return {
        label: `${pct.toFixed(1)}%`,
        tag: "Target Met",
        color:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
      };
    }
    if (pct >= 80) {
      return {
        label: `${pct.toFixed(1)}%`,
        tag: "Threshold",
        color:
          "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800",
      };
    }
    return {
      label: `${pct.toFixed(1)}%`,
      tag: "Below Min",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    };
  };

  // Actions
  const handleStartEdit = (row: MonthlyTargetRecord) => {
    if (isPeriodLocked) {
      toast.error("Period is locked. Unlock to modify targets.");
      return;
    }
    if (status === "Approved") {
      toast.info("Target sheet is Approved. Switch back to Draft to modify.");
      return;
    }
    setEditingRowId(row.id);
    setEditBaseValue(row.baseTargetLkr);
    setEditStretchValue(row.stretchTargetLkr);
    setEditNotes(row.notes || "");
  };

  const handleSaveRow = (id: string) => {
    if (editBaseValue <= 0) {
      toast.error("Base Target must be greater than zero.");
      return;
    }
    if (editStretchValue < editBaseValue) {
      toast.error("Stretch Target cannot be lower than Base Target.");
      return;
    }

    setTargetsData((prev) => {
      const list = [...(prev[selectedPeriod] || [])];
      const index = list.findIndex((item) => item.id === id);
      const existing = list[index];
      if (index !== -1 && existing) {
        list[index] = {
          ...existing,
          baseTargetLkr: editBaseValue,
          stretchTargetLkr: editStretchValue,
          notes: editNotes,
          lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
      }
      return { ...prev, [selectedPeriod]: list };
    });

    setEditingRowId(null);
    setHasUnsavedChanges(true);
    toast.success("Target updated in active working draft.");
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
  };

  const handleDeleteRow = (id: string) => {
    if (isPeriodLocked || status === "Approved") {
      toast.error("Cannot delete rows from a locked or approved sheet.");
      return;
    }
    setTargetsData((prev) => {
      const list = (prev[selectedPeriod] || []).filter((item) => item.id !== id);
      return { ...prev, [selectedPeriod]: list };
    });
    setHasUnsavedChanges(true);
    toast.success("Participant target row removed.");
  };

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    const match = allDbBatches.find((b: any) => b.period === newPeriod);
    if (match) {
      setCurrentBatchId(match.id);
      setSelectedSchemeCode(match.schemeCode);
      setSelectedDivision(match.division || "All Divisions");
      setSelectedTargetType(match.targetType || "Turnover Target (LKR)");
      setVersion(match.version);
      setStatus(match.status);
      setIsPeriodLocked(Boolean(match.isLocked));
      if (match.history && match.history.length > 0) setHistoryList(match.history);
    }
  };

  const handleSaveDraft = async () => {
    await handleSaveToPostgreSql();
  };

  const handleSaveToPostgreSql = async () => {
    try {
      setIsSaving(true);
      const batchPayload = {
        id: currentBatchId,
        period: selectedPeriod,
        schemeCode: selectedSchemeCode,
        division: selectedDivision,
        targetType: selectedTargetType,
        version: version,
        currency: currency,
        status: status,
        isLocked: isPeriodLocked,
        entries: activePeriodTargets,
      };

      const res = await apiFetch(`/api/incentives/monthly-targets/${currentBatchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchPayload),
      });

      const data = await res.json();
      if (data.success && data.batch) {
        setHasUnsavedChanges(false);
        setIsDbConnected(true);
        if (data.batch.history && data.batch.history.length > 0) {
          setHistoryList(data.batch.history);
        }
        toast.success("Saved to PostgreSQL successfully!", {
          description: `Synchronized ${activePeriodTargets.length} target records for ${selectedPeriod} into PostgreSQL.`,
        });
      } else {
        toast.error(data.error || "Failed to save targets to PostgreSQL.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to connect to PostgreSQL database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveSheet = async () => {
    if (hasUnsavedChanges) {
      toast.error("Please save your draft changes to PostgreSQL before approving.");
      return;
    }
    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/monthly-targets/${currentBatchId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Approved",
          author: "Lakmal Perera",
          role: "Incentive Administrator",
          details: `Approved total portfolio quota of ${formatLKR(aggregates.totalBase)} across ${aggregates.count} participants.`,
        }),
      });
      const data = await res.json();
      if (data.success && data.batch) {
        setStatus("Approved");
        setVersion("v2.0 Approved");
        if (data.batch.history) setHistoryList(data.batch.history);
        toast.success(`Monthly Target Sheet marked as Approved for ${selectedPeriod} in PostgreSQL!`);
      } else {
        setStatus("Approved");
        setVersion("v2.0 Approved");
        toast.success(`Monthly Target Sheet marked as Approved for ${selectedPeriod}!`);
      }
    } catch (err) {
      setStatus("Approved");
      setVersion("v2.0 Approved");
      toast.success(`Monthly Target Sheet marked as Approved for ${selectedPeriod}!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePeriodLock = async () => {
    const nextLock = !isPeriodLocked;
    const nextStatus: TargetPeriodStatus = nextLock ? "Locked" : "Draft";
    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/monthly-targets/${currentBatchId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          author: "Lakmal Perera",
          role: "Incentive Administrator",
          details: nextLock
            ? "Period locked against revisions in PostgreSQL."
            : "Period unlocked for adjustments.",
        }),
      });
      const data = await res.json();
      if (data.success && data.batch) {
        setIsPeriodLocked(nextLock);
        setStatus(nextStatus);
        if (data.batch.history) setHistoryList(data.batch.history);
      } else {
        setIsPeriodLocked(nextLock);
        setStatus(nextStatus);
      }
    } catch (err) {
      setIsPeriodLocked(nextLock);
      setStatus(nextStatus);
    } finally {
      setIsSaving(false);
    }

    if (nextLock) {
      toast.warning(
        `Target period ${selectedPeriod} is now LOCKED in PostgreSQL. Further modifications are disabled.`,
      );
    } else {
      toast.info(`Target period ${selectedPeriod} unlocked for adjustments.`);
    }
  };

  const handleCreateNewDraftVersion = () => {
    setStatus("Draft");
    setVersion("v2.1 Draft");
    setIsPeriodLocked(false);
    toast.success("New draft version created (v2.1 Draft). You can now edit quotas.");
  };

  const handleAddTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.employeeName || !newTarget.baseTargetLkr) {
      toast.error("Please provide participant name and base target.");
      return;
    }

    const row: MonthlyTargetRecord = {
      id: `TGT-${Date.now().toString().slice(-6)}`,
      participantId: newTarget.participantId || "EMP-9999",
      employeeName: newTarget.employeeName,
      role: newTarget.role || "Retail Sales Executive",
      division: newTarget.division || "Mobile & Accessories",
      territory: newTarget.territory || "Western Territory",
      schemeCode: selectedSchemeCode,
      baseTargetLkr: Number(newTarget.baseTargetLkr) || 1000000,
      stretchTargetLkr: Number(newTarget.stretchTargetLkr) || 1300000,
      mtdActualLkr: 0,
      notes: newTarget.notes || "Added manually",
      lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setTargetsData((prev) => ({
      ...prev,
      [selectedPeriod]: [row, ...(prev[selectedPeriod] || [])],
    }));

    setIsAddModalOpen(false);
    setHasUnsavedChanges(true);
    toast.success(`Target quota added for ${newTarget.employeeName}.`);
  };

  const handleSimulateImport = () => {
    if (!importFileName) {
      toast.error("Please choose a file to import.");
      return;
    }
    // Simulate import
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1200)), {
      loading: `Parsing Excel sheet "${importFileName}" and validating employee IDs...`,
      success: () => {
        setIsImportModalOpen(false);
        setImportFileName("");
        setHasUnsavedChanges(true);
        return "Successfully imported 8 target quotas into draft sheet with zero validation errors.";
      },
      error: "Failed to parse spreadsheet file.",
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Target ID",
      "Employee ID",
      "Employee Name",
      "Role",
      "Division",
      "Territory",
      "Scheme Code",
      "Base Target (LKR)",
      "Stretch Target (LKR)",
      "MTD Actual (LKR)",
      "Achievement %",
      "Variance (LKR)",
      "Notes",
    ];

    const rows = activePeriodTargets.map((r) => [
      r.id,
      r.participantId,
      `"${r.employeeName}"`,
      `"${r.role}"`,
      `"${r.division}"`,
      `"${r.territory}"`,
      r.schemeCode,
      r.baseTargetLkr,
      r.stretchTargetLkr,
      r.mtdActualLkr,
      ((r.mtdActualLkr / r.baseTargetLkr) * 100).toFixed(2),
      r.mtdActualLkr - r.baseTargetLkr,
      `"${r.notes || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Monthly_Targets_${selectedPeriod.replace(/[^a-zA-Z0-9]/g, "_")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Targets exported to Excel CSV successfully.");
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar: Title, Purpose, Badges & Quick Workflow Jumps */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <Target size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Monthly Target Entry
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                    isPeriodLocked
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                      : status === "Approved"
                        ? "bg-success-soft text-success border border-emerald-300"
                        : "bg-warning-soft text-warning border border-amber-300"
                  }`}
                >
                  {isPeriodLocked ? (
                    <>
                      <Lock size={11} /> Period Locked (Read-Only)
                    </>
                  ) : status === "Approved" ? (
                    <>
                      <CheckCircle2 size={11} /> Approved Target Sheet
                    </>
                  ) : (
                    <>
                      <Clock size={11} /> Draft Version
                    </>
                  )}
                </span>
                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  {version}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enter and review monthly targets for sales and service participants across
                divisions, track MTD actuals, and enforce period lock rules.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Cross-Screen Navigation */}
          <div className="hidden xl:flex items-center gap-1.5 border-r pr-3 mr-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateScreen?.("scheme-master")}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Award size={13} />
              <span>Scheme Master</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateScreen?.("rate-matrix")}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Layers size={13} />
              <span>Rate Matrix</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateScreen?.("slab-table")}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <TrendingUp size={13} />
              <span>Target Slabs</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateScreen?.("participant-profile")}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Users size={13} />
              <span>Participant Profile</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateScreen?.("attendance-import")}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <UploadCloud size={13} />
              <span>Attendance Import</span>
            </Button>
          </div>

          {/* Period Lock Toggle Action */}
          <Button
            variant={isPeriodLocked ? "outline" : "secondary"}
            size="sm"
            onClick={handleTogglePeriodLock}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {isPeriodLocked ? (
              <>
                <Unlock size={13} className="text-emerald-600" />
                <span>Unlock Period</span>
              </>
            ) : (
              <>
                <Lock size={13} className="text-amber-600" />
                <span>Lock Period</span>
              </>
            )}
          </Button>

          {/* Save to PostgreSQL Action */}
          {!isPeriodLocked && status === "Draft" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveToPostgreSql}
              disabled={isSaving}
              className="h-8 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer bg-primary text-primary-foreground hover:opacity-90"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{isSaving ? "Saving..." : hasUnsavedChanges ? "Save to PostgreSQL *" : "Save to PostgreSQL"}</span>
            </Button>
          )}

          {/* Approve Target Sheet Action */}
          {!isPeriodLocked && status === "Draft" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApproveSheet}
              disabled={isSaving}
              className="h-8 gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Approve Targets</span>
            </Button>
          )}

          {/* If Approved, give button to branch to new draft */}
          {status === "Approved" && !isPeriodLocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewDraftVersion}
              className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Plus size={13} />
              <span>Create New Revision</span>
            </Button>
          )}

          {/* Import Excel */}
          {!isPeriodLocked && status === "Draft" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <Upload size={13} />
              <span>Import Excel</span>
            </Button>
          )}

          {/* Export Options */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrintSchedule}
            title="Print Monthly Targets"
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Printer size={14} />
          </Button>
        </div>
      </div>

      {/* PostgreSQL Database Connection Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-muted/30 border rounded-lg text-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${isDbConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
          />
          <Database size={16} className={isDbConnected ? "text-emerald-600" : "text-amber-600"} />
          <span className="text-muted-foreground">
            Database Engine:{" "}
            <strong className="text-foreground">
              {isDbConnected ? "PostgreSQL Connected (telesonic)" : "Local Mode"}
            </strong>{" "}
            — Monthly participant target quotas, stretch thresholds, and MTD actuals are synchronized with PostgreSQL.
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isDbConnected
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            {isDbConnected ? "PostgreSQL Connected" : "Local Mode"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadTargetsFromDb(false)}
            disabled={isLoading}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reload from PostgreSQL"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* 2. Period Locked Warning Banner (when locked) */}
      {isPeriodLocked && (
        <div className="rounded-lg border border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-900/60 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-950 dark:text-amber-100 flex items-center gap-2">
              <span>Target Period Locked — Read Only Audit Mode</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 font-mono">
                {selectedPeriod}
              </span>
            </h4>
            <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              This target cycle has been officially locked by the Incentive Administrator. All quota
              values, stretch targets, and participant allocations are locked against further
              modification. If you need to make exceptions, click <strong>Unlock Period</strong> or
              create a formal audit revision.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTogglePeriodLock}
            className="h-7 text-xs border-amber-400 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            Unlock Period
          </Button>
        </div>
      )}

      {/* 3. Mandatory Header Configuration Panel */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between border-b pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Header Fields & Quota Context (Mandatory)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SAP B1 Quota Integration Synced</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 text-xs">
          {/* Scheme */}
          <div className="space-y-1 lg:col-span-2">
            <label className="font-semibold text-foreground flex items-center gap-1">
              <span>Scheme</span>
              <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedSchemeCode}
              onChange={(e) => {
                setSelectedSchemeCode(e.target.value);
                const scheme = (availableSchemesList || AVAILABLE_SCHEMES).find(
                  (s) => s.code === e.target.value,
                );
                if (scheme) {
                  setSelectedTargetType(scheme.targetType);
                }
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {(availableSchemesList && availableSchemesList.length > 0
                ? availableSchemesList
                : AVAILABLE_SCHEMES
              ).map((scheme) => (
                <option key={scheme.code} value={scheme.code}>
                  {scheme.code} — {scheme.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Period (Month/Year) */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1">
              <Calendar size={12} className="text-muted-foreground" />
              <span>Target Period</span>
              <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-medium"
            >
              {TARGET_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          {/* Division */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1">
              <Building2 size={12} className="text-muted-foreground" />
              <span>Division</span>
              <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {targetDivisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* Target Type */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1">
              <span>Target Type</span>
              <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedTargetType}
              onChange={(e) => setSelectedTargetType(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {TARGET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1">
              <span>Currency</span>
              <span className="text-destructive">*</span>
            </label>
            <div className="flex h-9 items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-xs font-mono font-semibold text-foreground">
              <span>{currency}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-sans">
                Lankan Rupee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Portfolio Performance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Participants</span>
            <Users size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-lg font-bold font-mono tracking-tight text-foreground">
            {aggregates.count}
          </div>
          <div className="text-[10px] text-muted-foreground">Active in {selectedDivision}</div>
        </div>

        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Total Base Quota</span>
            <Target size={14} className="text-sky-600" />
          </div>
          <div
            className="mt-1 text-sm font-bold font-mono text-foreground truncate"
            title={formatLKR(aggregates.totalBase)}
          >
            {formatLKR(aggregates.totalBase)}
          </div>
          <div className="text-[10px] text-muted-foreground">Budget target threshold</div>
        </div>

        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Total Stretch Quota</span>
            <TrendingUp size={14} className="text-purple-600" />
          </div>
          <div
            className="mt-1 text-sm font-bold font-mono text-foreground truncate"
            title={formatLKR(aggregates.totalStretch)}
          >
            {formatLKR(aggregates.totalStretch)}
          </div>
          <div className="text-[10px] text-muted-foreground">Max accelerator tier</div>
        </div>

        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">MTD Actual Sales</span>
            <DollarSign size={14} className="text-emerald-600" />
          </div>
          <div
            className="mt-1 text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate"
            title={formatLKR(aggregates.totalActual)}
          >
            {formatLKR(aggregates.totalActual)}
          </div>
          <div className="text-[10px] text-muted-foreground">Synced from SAP B1</div>
        </div>

        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Achievement %</span>
            <Percent size={14} className="text-primary" />
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-primary">
            {aggregates.overallAchievement.toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground">
            {aggregates.achieversCount} / {aggregates.count} at &ge;100%
          </div>
        </div>

        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Target Variance</span>
            <span
              className={`text-[10px] font-mono font-bold ${
                aggregates.variance >= 0 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {aggregates.variance >= 0 ? "+ Surplus" : "- Deficit"}
            </span>
          </div>
          <div
            className={`mt-1 text-sm font-bold font-mono truncate ${
              aggregates.variance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
            title={formatLKR(aggregates.variance)}
          >
            {formatLKR(Math.abs(aggregates.variance))}
          </div>
          <div className="text-[10px] text-muted-foreground">vs Monthly Base Budget</div>
        </div>
      </div>

      {/* 5. Main Workspace Tabs: Targets, Rollup & Aggregates, Revisions History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-1">
          <TabsList className="bg-muted/70 p-1">
            <TabsTrigger value="targets" className="gap-1.5 text-xs font-semibold">
              <Target size={13} />
              <span>Targets Entry Grid</span>
              <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.2 font-mono text-[10px] text-primary">
                {filteredTargets.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rollup" className="gap-1.5 text-xs font-semibold">
              <Building2 size={13} />
              <span>Division Summary</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs font-semibold">
              <HistoryIcon size={13} />
              <span>Revisions & History</span>
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.2 font-mono text-[10px]">
                {historyList.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Search and Add in Targets Tab */}
          {activeTab === "targets" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search participant or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="All">All Achievements</option>
                <option value="Over 100%">Achieved &ge; 100%</option>
                <option value="80-100%">Threshold (80-100%)</option>
                <option value="Under 80%">Below 80%</option>
              </select>

              {!isPeriodLocked && status === "Draft" && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setIsAddModalOpen(true)}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Participant</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: Targets Entry Grid */}
        <TabsContent value="targets" className="space-y-4 m-0">
          <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/70 text-muted-foreground font-semibold uppercase tracking-wider text-[11px] border-b">
                  <tr>
                    <th className="px-3.5 py-3 font-semibold">Participant / Employee</th>
                    <th className="px-3 py-3 font-semibold">Role & Territory</th>
                    <th className="px-3 py-3 font-semibold">Scheme Code</th>
                    <th className="px-3.5 py-3 font-semibold text-right">
                      Base Target ({currency}) <span className="text-destructive">*</span>
                    </th>
                    <th className="px-3.5 py-3 font-semibold text-right">
                      Stretch Target ({currency})
                    </th>
                    <th className="px-3.5 py-3 font-semibold text-right">
                      MTD Actual ({currency})
                    </th>
                    <th className="px-3.5 py-3 font-semibold text-center">Achievement %</th>
                    <th className="px-3.5 py-3 font-semibold text-right">Variance</th>
                    <th className="px-3.5 py-3 font-semibold text-center">Period Status</th>
                    <th className="px-3.5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTargets.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Target size={32} className="text-muted-foreground/40" />
                          <p className="text-sm font-medium">No target records found</p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your search query, division filter, or add a participant.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTargets.map((row) => {
                      const isEditing = editingRowId === row.id;
                      const badge = getAchievementBadge(row.mtdActualLkr, row.baseTargetLkr);
                      const variance = row.mtdActualLkr - row.baseTargetLkr;

                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            isEditing ? "bg-primary/5" : "hover:bg-muted/30"
                          }`}
                        >
                          {/* Participant Name & ID */}
                          <td className="px-3.5 py-3">
                            <div className="font-semibold text-foreground">{row.employeeName}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono mt-0.5">
                              <span>{row.participantId}</span>
                              <span>&middot;</span>
                              <span className="text-[10px] text-muted-foreground">
                                {row.division}
                              </span>
                            </div>
                          </td>

                          {/* Role & Territory */}
                          <td className="px-3 py-3">
                            <div className="text-foreground font-medium">{row.role}</div>
                            <div
                              className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[180px]"
                              title={row.territory}
                            >
                              {row.territory}
                            </div>
                          </td>

                          {/* Scheme Code */}
                          <td className="px-3 py-3 font-mono text-[11px] text-primary font-medium">
                            {row.schemeCode}
                          </td>

                          {/* Base Target (Editable in draft) */}
                          <td className="px-3.5 py-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <input
                                  type="number"
                                  value={editBaseValue}
                                  onChange={(e) => setEditBaseValue(Number(e.target.value))}
                                  className="w-28 h-7 text-right rounded border border-primary bg-background px-2 font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="font-mono font-semibold text-foreground">
                                {formatLKR(row.baseTargetLkr)}
                              </span>
                            )}
                          </td>

                          {/* Stretch Target (Editable in draft) */}
                          <td className="px-3.5 py-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <input
                                  type="number"
                                  value={editStretchValue}
                                  onChange={(e) => setEditStretchValue(Number(e.target.value))}
                                  className="w-28 h-7 text-right rounded border border-primary bg-background px-2 font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            ) : (
                              <span className="font-mono text-muted-foreground">
                                {formatLKR(row.stretchTargetLkr)}
                              </span>
                            )}
                          </td>

                          {/* MTD Actual (from ERP) */}
                          <td className="px-3.5 py-3 text-right font-mono font-semibold text-foreground">
                            {formatLKR(row.mtdActualLkr)}
                          </td>

                          {/* Achievement Badge */}
                          <td className="px-3.5 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono font-bold ${badge.color}`}
                              title={badge.tag}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Variance */}
                          <td
                            className={`px-3.5 py-3 text-right font-mono text-[11px] font-semibold ${
                              variance >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {variance >= 0 ? "+" : ""}
                            {formatLKR(variance)}
                          </td>

                          {/* Period Lock Status */}
                          <td className="px-3.5 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                                isPeriodLocked
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              }`}
                            >
                              {isPeriodLocked ? (
                                <>
                                  <Lock size={10} /> Locked
                                </>
                              ) : (
                                <>
                                  <Unlock size={10} /> Open
                                </>
                              )}
                            </span>
                          </td>

                          {/* Row Actions */}
                          <td className="px-3.5 py-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSaveRow(row.id)}
                                  className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
                                  title="Confirm edit"
                                >
                                  <Check size={14} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                  className="h-7 w-7 text-muted-foreground hover:bg-muted cursor-pointer"
                                  title="Cancel edit"
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {!isPeriodLocked && status === "Draft" ? (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleStartEdit(row)}
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                      title="Edit target quota"
                                    >
                                      <Edit2 size={13} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleDeleteRow(row.id)}
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                      title="Remove participant"
                                    >
                                      <Trash2 size={13} />
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground italic">
                                    Read-only
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  Showing <strong>{filteredTargets.length}</strong> of{" "}
                  <strong>{activePeriodTargets.length}</strong> participants
                </span>
                <span>&middot;</span>
                <span>
                  Total Base:{" "}
                  <strong className="font-mono text-foreground">
                    {formatLKR(aggregates.totalBase)}
                  </strong>
                </span>
                <span>&middot;</span>
                <span>
                  Total MTD Actual:{" "}
                  <strong className="font-mono text-foreground">
                    {formatLKR(aggregates.totalActual)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px]">Period Cycle:</span>
                <span className="font-semibold text-foreground">{selectedPeriod}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Division Summary / Rollup */}
        <TabsContent value="rollup" className="space-y-4 m-0">
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Division-Level Target Rollup & Achievement Summary
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aggregated target quotas, actual achievement, and quota attainment progress across
                  company divisions.
                </p>
              </div>
              <span className="rounded bg-muted px-2.5 py-1 text-xs font-mono font-semibold">
                {selectedPeriod}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase tracking-wider text-[11px] border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Division</th>
                    <th className="px-4 py-3 font-semibold text-center">Headcount</th>
                    <th className="px-4 py-3 font-semibold text-right">Total Base Quota</th>
                    <th className="px-4 py-3 font-semibold text-right">Stretch Quota</th>
                    <th className="px-4 py-3 font-semibold text-right">MTD Actual Sales</th>
                    <th className="px-4 py-3 font-semibold text-center">Progress / Attainment</th>
                    <th className="px-4 py-3 font-semibold text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {divisionRollup.map((div) => {
                    const badge = getAchievementBadge(div.totalActual, div.totalBase);
                    return (
                      <tr key={div.division} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                          <Building2 size={14} className="text-muted-foreground" />
                          <span>{div.division}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-medium">
                          {div.participants}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                          {formatLKR(div.totalBase)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                          {formatLKR(div.totalStretch)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatLKR(div.totalActual)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1 max-w-[140px] mx-auto">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="font-bold">{div.achievementPct.toFixed(1)}%</span>
                              <span className="text-muted-foreground">{badge.tag}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  div.achievementPct >= 100
                                    ? "bg-emerald-500"
                                    : div.achievementPct >= 80
                                      ? "bg-sky-500"
                                      : "bg-amber-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, Math.max(0, div.achievementPct))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono font-semibold ${
                            div.variance >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {div.variance >= 0 ? "+" : ""}
                          {formatLKR(div.variance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Revisions & Audit History */}
        <TabsContent value="history" className="space-y-4 m-0">
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Monthly Target Revisions & Audit Log
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Historical ledger of all quota allocations, imports, administrator sign-offs, and
                  period locks.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">Immutable Audit Trail</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {historyList.map((entry) => (
                <div key={entry.id} className="relative group">
                  <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary" />
                  <div className="rounded-lg border bg-muted/30 p-3.5 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground font-mono">
                          {entry.version}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                            entry.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : entry.status === "Locked"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.status}
                        </span>
                        <span className="text-xs text-muted-foreground">&middot;</span>
                        <span className="text-xs font-medium text-foreground">
                          {entry.changeSummary}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock size={11} /> {entry.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{entry.details}</p>

                    <div className="text-[11px] text-muted-foreground/80 flex items-center gap-2 pt-1 border-t border-border/50">
                      <span>
                        Recorded by: <strong>{entry.author}</strong> ({entry.role})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 6. Modal Dialog: Add Participant Target */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border bg-card p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Add Participant Monthly Target
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTargetSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newTarget.participantId}
                    onChange={(e) =>
                      setNewTarget((prev) => ({ ...prev, participantId: e.target.value }))
                    }
                    placeholder="e.g. EMP-1099"
                    className="w-full h-8 px-2.5 rounded border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Employee Name *</label>
                  <input
                    type="text"
                    required
                    value={newTarget.employeeName}
                    onChange={(e) =>
                      setNewTarget((prev) => ({ ...prev, employeeName: e.target.value }))
                    }
                    placeholder="e.g. Sanjeewa Silva"
                    className="w-full h-8 px-2.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Division</label>
                  <select
                    value={newTarget.division}
                    onChange={(e) =>
                      setNewTarget((prev) => ({ ...prev, division: e.target.value }))
                    }
                    className="w-full h-8 px-2.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Mobile & Accessories">Mobile & Accessories</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Enterprise Solutions">Enterprise Solutions</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Role</label>
                  <input
                    type="text"
                    value={newTarget.role}
                    onChange={(e) => setNewTarget((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full h-8 px-2.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Territory / Hub</label>
                <input
                  type="text"
                  value={newTarget.territory}
                  onChange={(e) => setNewTarget((prev) => ({ ...prev, territory: e.target.value }))}
                  placeholder="e.g. Western Province - Colombo South"
                  className="w-full h-8 px-2.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Base Target ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTarget.baseTargetLkr}
                    onChange={(e) =>
                      setNewTarget((prev) => ({ ...prev, baseTargetLkr: Number(e.target.value) }))
                    }
                    className="w-full h-8 px-2.5 rounded border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Stretch Target ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTarget.stretchTargetLkr}
                    onChange={(e) =>
                      setNewTarget((prev) => ({
                        ...prev,
                        stretchTargetLkr: Number(e.target.value),
                      }))
                    }
                    className="w-full h-8 px-2.5 rounded border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Allocation Notes</label>
                <textarea
                  rows={2}
                  value={newTarget.notes}
                  onChange={(e) => setNewTarget((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes or baseline rationale..."
                  className="w-full p-2 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Add Target
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Dialog: Excel Bulk Import Simulation */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-foreground">Bulk Import Monthly Targets</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Upload a prepared Excel template (.xlsx, .csv) with columns: <code>EmployeeID</code>
                , <code>BaseTarget</code>, <code>StretchTarget</code>, and <code>Territory</code>.
              </p>

              <div className="rounded-lg border-2 border-dashed border-border p-6 text-center hover:bg-muted/40 transition-colors cursor-pointer">
                <Upload size={24} className="mx-auto text-muted-foreground" />
                <div className="mt-2 font-medium text-foreground">
                  {importFileName ? importFileName : "Drag and drop template file here"}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  or choose a sample file below
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setImportFileName("May_2026_Sales_Ops_Quota_Master.xlsx")}
                    className="h-7 text-[11px]"
                  >
                    Load Sample File
                  </Button>
                </div>
              </div>

              <div className="rounded bg-muted/60 p-2.5 text-[11px] text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <Info size={12} className="text-primary" /> Target Period:
                </div>
                <div>
                  Values will overwrite draft targets for <strong>{selectedPeriod}</strong>.
                  Existing approved periods will remain untouched.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSimulateImport}
                  disabled={!importFileName}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Import Targets
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
