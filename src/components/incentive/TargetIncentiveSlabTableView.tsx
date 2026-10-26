import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
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
  Target,
  Calculator,
  Users,
  Database,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export type SlabStatus = "Draft" | "Approved";

export interface SlabRecord {
  id: string;
  slabTierName: string;
  minAchievementPercent: number; // Achievement >= %
  volumeIncentiveLkr: number; // Volume Target Incentive (LKR)
  turnoverIncentiveLkr: number; // Turnover Target Incentive (LKR)
  notes?: string;
}

export interface SlabHistoryRecord {
  id: string;
  version: string;
  status: SlabStatus;
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
  role: string;
}

const AVAILABLE_SCHEMES: SchemeOption[] = [
  {
    code: "SCH-SLS-2026",
    name: "Retail Smartphone & Devices Sales Incentive",
    division: "Mobile & Accessories",
    role: "Retail Sales Executive",
  },
  {
    code: "SCH-SRV-2026",
    name: "Field Service Technician First-Time-Fix Incentive",
    division: "Consumer Electronics",
    role: "Field Service Technician",
  },
  {
    code: "SCH-DLR-2026",
    name: "Tier-1 Authorised Dealer Quarterly Volume Rebate",
    division: "Enterprise Solutions",
    role: "Dealer Principal",
  },
  {
    code: "SCH-PRM-2026",
    name: "Showroom Promoter Fast Sell-Out Bounty",
    division: "Mobile & Accessories",
    role: "Showroom Promoter",
  },
  {
    code: "SCH-SOLAR-2026",
    name: "Commercial Solar & Storage Solutions Incentive",
    division: "Renewable Energy",
    role: "Commercial Sales Consultant",
  },
];

const TARGET_TYPES = [
  "Volume Target",
  "Turnover Target",
  "Product Category Target",
  "Combined Volume & Turnover",
];

const SLAB_METHODS = [
  "Highest Slab Reached (Non-Cumulative)",
  "Tiered Stepped Slabs",
  "Accelerated Milestone Multiplier",
];

// Initial demonstration slab records
const INITIAL_SLABS_DATA: Record<string, SlabRecord[]> = {
  "SCH-SLS-2026": [
    {
      id: "slb-01",
      slabTierName: "Floor / Minimum Entry",
      minAchievementPercent: 80.0,
      volumeIncentiveLkr: 15000,
      turnoverIncentiveLkr: 25000,
      notes: "Baseline qualifying threshold; minimum required for any incentive payout.",
    },
    {
      id: "slb-02",
      slabTierName: "Intermediate Tier",
      minAchievementPercent: 90.0,
      volumeIncentiveLkr: 25000,
      turnoverIncentiveLkr: 45000,
      notes: "Satisfactory achievement tier prior to 100% quota benchmark.",
    },
    {
      id: "slb-03",
      slabTierName: "Target Parity Benchmark",
      minAchievementPercent: 100.0,
      volumeIncentiveLkr: 40000,
      turnoverIncentiveLkr: 75000,
      notes: "Full quota fulfillment benchmark. Standard scheduled payout.",
    },
    {
      id: "slb-04",
      slabTierName: "High Performer Band",
      minAchievementPercent: 110.0,
      volumeIncentiveLkr: 60000,
      turnoverIncentiveLkr: 110000,
      notes: "Above target accelerator; awarded as single non-cumulative amount.",
    },
    {
      id: "slb-05",
      slabTierName: "Excellence Accelerator",
      minAchievementPercent: 125.0,
      volumeIncentiveLkr: 85000,
      turnoverIncentiveLkr: 150000,
      notes: "Premier bracket for top quartile territory executives.",
    },
    {
      id: "slb-06",
      slabTierName: "Super Achiever Ceiling",
      minAchievementPercent: 150.0,
      volumeIncentiveLkr: 120000,
      turnoverIncentiveLkr: 220000,
      notes: "Maximum capped payout slab for extraordinary over-quota performance.",
    },
  ],
  "SCH-SRV-2026": [
    {
      id: "slb-srv-01",
      slabTierName: "FTF Standard Floor",
      minAchievementPercent: 85.0,
      volumeIncentiveLkr: 12000,
      turnoverIncentiveLkr: 18000,
      notes: "Technician qualifying repair threshold.",
    },
    {
      id: "slb-srv-02",
      slabTierName: "FTF Benchmark",
      minAchievementPercent: 92.0,
      volumeIncentiveLkr: 28000,
      turnoverIncentiveLkr: 42000,
      notes: "Contractual SLA baseline attainment.",
    },
    {
      id: "slb-srv-03",
      slabTierName: "FTF Excellence",
      minAchievementPercent: 96.0,
      volumeIncentiveLkr: 50000,
      turnoverIncentiveLkr: 75000,
      notes: "Master technician zero-rework tier.",
    },
  ],
};

const INITIAL_HISTORY: SlabHistoryRecord[] = [
  {
    id: "hist-slb-04",
    version: "v2.2",
    status: "Draft",
    timestamp: "2026-10-13 19:15:30",
    author: "S. Perera",
    role: "Incentive Administrator",
    changeSummary: "Initiated v2.2 draft for Q4 slab optimization",
    details:
      "Adjusted 125% and 150% turnover incentive values to reflect updated FY2026 revenue growth targets. Non-cumulative rule preserved.",
  },
  {
    id: "hist-slb-03",
    version: "v2.1",
    status: "Approved",
    timestamp: "2026-07-01 10:45:00",
    author: "D. Fernando",
    role: "Head of Finance",
    changeSummary: "Approved Q3 slab table revision",
    details:
      "Ratified 6 achievement tiers. Certified that slabs operate on highest-slab-reached payout logic.",
  },
  {
    id: "hist-slb-02",
    version: "v2.0",
    status: "Approved",
    timestamp: "2026-03-28 14:20:10",
    author: "P. Wickramasinghe",
    role: "Chief Executive Officer",
    changeSummary: "Executive sign-off for mid-year incentive scaling",
    details:
      "Added 150% Super Achiever tier with LKR 120,000 volume and LKR 220,000 turnover payout.",
  },
  {
    id: "hist-slb-01",
    version: "v1.0",
    status: "Approved",
    timestamp: "2026-01-02 09:00:00",
    author: "S. Perera",
    role: "Incentive Administrator",
    changeSummary: "Initial baseline slab table established",
    details: "Baseline 4-tier slab structure mapped directly from SAP Business One budget matrix.",
  },
];

interface TargetIncentiveSlabTableViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function TargetIncentiveSlabTableView({
  onNavigateScreen,
  onBack,
}: TargetIncentiveSlabTableViewProps) {
  // Mandatory Header States
  const [selectedSchemeCode, setSelectedSchemeCode] = useState<string>("SCH-SLS-2026");
  const [targetType, setTargetType] = useState<string>("Turnover Target");
  const [slabMethod, setSlabMethod] = useState<string>("Highest Slab Reached (Non-Cumulative)");
  const [version, setVersion] = useState<string>("v2.1");
  const [status, setStatus] = useState<SlabStatus>("Approved");

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("slabs");

  // Grid Data State
  const [slabs, setSlabs] = useState<SlabRecord[]>(INITIAL_SLABS_DATA["SCH-SLS-2026"] || []);

  // History State
  const [history, setHistory] = useState<SlabHistoryRecord[]>(INITIAL_HISTORY);

  // Interactive Edit / Draft state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SlabRecord>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // New Row Modal / Inline Drawer
  const [isAddingNewRow, setIsAddingNewRow] = useState<boolean>(false);
  const [newRowData, setNewRowData] = useState<Partial<SlabRecord>>({
    slabTierName: "",
    minAchievementPercent: 100,
    volumeIncentiveLkr: 30000,
    turnoverIncentiveLkr: 50000,
    notes: "",
  });

  // Simulator State for Critical Business Rule
  const [simulatorAchievement, setSimulatorAchievement] = useState<number>(112.5);

  // PostgreSQL Database & Async States
  const [slabTableId, setSlabTableId] = useState<string>("slt-sls-2026");
  const [tableName, setTableName] = useState<string>("Retail Smartphone & Devices Sales Target Slabs");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [allDbTables, setAllDbTables] = useState<any[]>([]);
  const [availableSchemesList, setAvailableSchemesList] = useState<SchemeOption[]>(AVAILABLE_SCHEMES);

  // Load Target Incentive Slab Table from PostgreSQL
  const loadSlabTableFromDb = async (silent: boolean = false, targetScheme?: string) => {
    try {
      if (!silent) setIsLoading(true);
      const schemeToQuery = targetScheme || selectedSchemeCode;
      const res = await apiFetch("/api/incentives/slab-tables");
      if (res.ok) {
        const data = await res.json();
        if (data.tables && data.tables.length > 0) {
          setAllDbTables(data.tables);
          const match =
            data.tables.find(
              (t: any) => t.schemeCode.toUpperCase() === schemeToQuery.toUpperCase(),
            ) || data.tables[0];

          if (match) {
            setSlabTableId(match.id);
            setSelectedSchemeCode(match.schemeCode);
            setTableName(match.tableName);
            setTargetType(match.targetType);
            setSlabMethod(match.slabMethod);
            setVersion(match.version);
            setStatus(match.status);
            if (match.slabs && match.slabs.length > 0) setSlabs(match.slabs);
            if (match.history && match.history.length > 0) setHistory(match.history);
            setIsDbConnected(true);
            setHasUnsavedChanges(false);
            if (!silent) {
              toast.success("Synchronized with PostgreSQL database.", {
                description: `Loaded ${match.tableName} (${match.version}) successfully.`,
              });
            }
          }
        }
      } else {
        setIsDbConnected(false);
      }
    } catch (err) {
      console.error("Failed to load slab tables from PostgreSQL:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlabTableFromDb(true);

    // Also load available schemes from DB
    apiFetch("/api/incentives/schemes")
      .then((r) => r.json())
      .then((data) => {
        if (data.schemes && data.schemes.length > 0) {
          setAvailableSchemesList(
            data.schemes.map((s: any) => ({
              code: s.schemeCode,
              name: s.schemeName,
              division: s.division,
              role: s.participantRole,
            })),
          );
        }
      })
      .catch((err) => console.error("Could not fetch schemes:", err));
  }, []);

  // Current selected scheme object
  const currentScheme = useMemo(() => {
    return (
      availableSchemesList.find((s) => s.code === selectedSchemeCode) ||
      AVAILABLE_SCHEMES.find((s) => s.code === selectedSchemeCode) ||
      availableSchemesList[0] ||
      AVAILABLE_SCHEMES[0]
    )!;
  }, [selectedSchemeCode, availableSchemesList]);

  // Handle scheme change with PostgreSQL synchronization
  const handleSchemeChange = (newCode: string) => {
    setSelectedSchemeCode(newCode);
    const match = allDbTables.find((t) => t.schemeCode.toUpperCase() === newCode.toUpperCase());
    if (match) {
      setSlabTableId(match.id);
      setTableName(match.tableName);
      setTargetType(match.targetType);
      setSlabMethod(match.slabMethod);
      setVersion(match.version);
      setStatus(match.status);
      if (match.slabs) setSlabs(match.slabs);
      if (match.history) setHistory(match.history);
    } else {
      const loadedSlabs = INITIAL_SLABS_DATA[newCode] || INITIAL_SLABS_DATA["SCH-SLS-2026"] || [];
      setSlabs(loadedSlabs);
      setSlabTableId(`slt-${newCode.toLowerCase()}`);
    }
    setEditingRowId(null);
    setHasUnsavedChanges(false);
    toast.info(`Loaded slab table for ${newCode}`, {
      description: "Displaying configured achievement thresholds and incentive values.",
    });
  };

  // Switch Version
  const handleVersionChange = (newVer: string) => {
    setVersion(newVer);
    if (newVer.includes("Draft") || newVer === "v2.2") {
      setStatus("Draft");
      toast.info(`Switched to ${newVer} (Draft Mode)`, {
        description: "Editing enabled. You can adjust achievement thresholds and save drafts.",
      });
    } else {
      setStatus("Approved");
      toast.info(`Switched to ${newVer} (Approved Mode)`, {
        description: "Viewing certified, read-only incentive slabs.",
      });
    }
  };

  // Convert current approved version to a new draft version
  const handleCreateNewDraftVersion = () => {
    setVersion("v2.2");
    setStatus("Draft");
    setHasUnsavedChanges(true);

    const newLog: SlabHistoryRecord = {
      id: `hist-${Date.now()}`,
      version: "v2.2",
      status: "Draft",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "Ayesha Asarak",
      role: "Incentive Administrator",
      changeSummary: "Branched new working draft v2.2 from approved v2.1",
      details: "Editable copy initialized for slab threshold tuning.",
    };
    setHistory((prev) => [newLog, ...prev]);

    toast.success("New Draft Version v2.2 Created", {
      description: "You may now edit slab tiers, add new thresholds, and save draft revisions.",
    });
  };

  // Save Draft Action to PostgreSQL
  const handleSaveDraft = async () => {
    if (status !== "Draft") {
      toast.error("Cannot save in Approved mode", {
        description: "Create or switch to a Draft version before making revisions.",
      });
      return;
    }

    // Validation: Achievement percentages must be strictly non-negative
    for (const slab of slabs) {
      if (slab.minAchievementPercent < 0) {
        toast.error("Validation Error", {
          description: `Slab "${slab.slabTierName}" has invalid negative achievement percentage.`,
        });
        return;
      }
      if (slab.volumeIncentiveLkr < 0 || slab.turnoverIncentiveLkr < 0) {
        toast.error("Validation Error", {
          description: `Slab "${slab.slabTierName}" cannot have negative incentive amounts.`,
        });
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/slab-tables/${slabTableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeCode: selectedSchemeCode,
          tableName: tableName || `${selectedSchemeCode} Target Incentive Slabs`,
          targetType,
          slabMethod,
          version,
          status: "Draft",
          slabs,
          modifiedBy: "Incentive Administrator",
          changeNote: `Manual save for slab table (${version}) with ${slabs.length} tiers.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.table?.history) setHistory(data.table.history);
        setHasUnsavedChanges(false);
        setIsDbConnected(true);
        toast.success(`Slab Table (${version}) saved to PostgreSQL!`, {
          description: `Persisted ${slabs.length} achievement tiers directly to database.`,
        });
      } else {
        toast.error("Failed to save slab table to PostgreSQL.");
      }
    } catch (err) {
      console.error("Save slab table error:", err);
      toast.error("Network or database error while saving slab table.");
      setIsDbConnected(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Approve Draft Version Action in PostgreSQL
  const handleApproveDraft = async () => {
    if (status !== "Draft") return;

    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/slab-tables/${slabTableId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Approved",
          author: "D. Fernando",
          role: "Head of Finance",
          details: "Finance audit verification complete. Certified non-cumulative slab payout logic.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus("Approved");
        setHasUnsavedChanges(false);
        if (data.table?.history) setHistory(data.table.history);
        toast.success(`Version ${version} Approved in PostgreSQL!`, {
          description: "Slab table is certified and locked for payroll calculation runs.",
        });
      } else {
        toast.error("Failed to approve slab table in PostgreSQL.");
      }
    } catch (err) {
      console.error("Approve slab table error:", err);
      toast.error("Database connection error during approval.");
    } finally {
      setIsSaving(false);
    }
  };

  // Start inline editing
  const handleStartEdit = (slab: SlabRecord) => {
    if (status !== "Draft") {
      toast.warning("Slab Table is Approved (Read-Only)", {
        description: "Click 'Create New Draft Version' to enable editing.",
      });
      return;
    }
    setEditingRowId(slab.id);
    setEditForm({ ...slab });
  };

  // Save inline edit
  const handleSaveInlineEdit = () => {
    if (!editingRowId || !editForm) return;

    if (
      editForm.minAchievementPercent === undefined ||
      editForm.minAchievementPercent < 0 ||
      editForm.volumeIncentiveLkr === undefined ||
      editForm.volumeIncentiveLkr < 0 ||
      editForm.turnoverIncentiveLkr === undefined ||
      editForm.turnoverIncentiveLkr < 0
    ) {
      toast.error("Please enter valid positive values for all slab fields.");
      return;
    }

    setSlabs((prev) =>
      prev
        .map((row) => (row.id === editingRowId ? ({ ...row, ...editForm } as SlabRecord) : row))
        .sort((a, b) => a.minAchievementPercent - b.minAchievementPercent),
    );

    setEditingRowId(null);
    setEditForm({});
    setHasUnsavedChanges(true);

    toast.success("Slab Row Updated", {
      description: "Changes applied to current draft. Remember to save draft.",
    });
  };

  // Cancel inline edit
  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditForm({});
  };

  // Delete Slab Row
  const handleDeleteRow = (id: string, name: string) => {
    if (status !== "Draft") {
      toast.warning("Cannot delete in Approved mode");
      return;
    }

    if (slabs.length <= 1) {
      toast.error("At least one slab tier must be maintained.");
      return;
    }

    setSlabs((prev) => prev.filter((r) => r.id !== id));
    setHasUnsavedChanges(true);
    toast.success(`Removed slab "${name}" from draft`);
  };

  // Add new slab row
  const handleAddNewRow = () => {
    if (status !== "Draft") {
      toast.warning("Cannot add rows in Approved mode");
      return;
    }

    if (!newRowData.slabTierName?.trim()) {
      toast.error("Please provide a name for the slab tier.");
      return;
    }

    const minAch = Number(newRowData.minAchievementPercent) || 0;
    const volInc = Number(newRowData.volumeIncentiveLkr) || 0;
    const turnInc = Number(newRowData.turnoverIncentiveLkr) || 0;

    const newRecord: SlabRecord = {
      id: `slb-custom-${Date.now()}`,
      slabTierName: newRowData.slabTierName.trim(),
      minAchievementPercent: minAch,
      volumeIncentiveLkr: volInc,
      turnoverIncentiveLkr: turnInc,
      notes: newRowData.notes?.trim() || "Configured user tier.",
    };

    setSlabs((prev) =>
      [...prev, newRecord].sort((a, b) => a.minAchievementPercent - b.minAchievementPercent),
    );
    setIsAddingNewRow(false);
    setNewRowData({
      slabTierName: "",
      minAchievementPercent: 100,
      volumeIncentiveLkr: 30000,
      turnoverIncentiveLkr: 50000,
      notes: "",
    });
    setHasUnsavedChanges(true);

    toast.success(`Added new slab tier: ${newRecord.slabTierName}`);
  };

  // Export Excel
  const handleExportExcel = () => {
    toast.success("Exporting Slab Table to Excel (.xlsx)...", {
      description: `Downloaded ${selectedSchemeCode}_Slabs_${version}.xlsx`,
    });

    const headers = [
      "Slab Tier",
      "Achievement >= %",
      "Volume Target Incentive (LKR)",
      "Turnover Target Incentive (LKR)",
      "Slab Method",
      "Status",
    ];

    const rows = slabs.map((s) => [
      s.slabTierName,
      `${s.minAchievementPercent}%`,
      s.volumeIncentiveLkr,
      s.turnoverIncentiveLkr,
      slabMethod,
      status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedSchemeCode}_Slabs_${version}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print
  const handleExportPdf = () => {
    toast.success("Preparing PDF Printable Rate Schedule...", {
      description: "Opening browser print dialogue formatted for standard A4 landscape.",
    });
    window.print();
  };

  // Calculate simulated payout based on Critical Business Rule:
  // "Pay the incentive amount for the highest slab reached; slabs are not cumulative."
  const simulationResult = useMemo(() => {
    const sorted = [...slabs].sort((a, b) => a.minAchievementPercent - b.minAchievementPercent);
    // Find all qualifying slabs where achievement >= minAchievementPercent
    const qualifying = sorted.filter((s) => simulatorAchievement >= s.minAchievementPercent);

    if (qualifying.length === 0) {
      return {
        matchedSlab: null,
        highestTierReached: "Below Threshold (< " + (sorted[0]?.minAchievementPercent ?? 0) + "%)",
        volumePayout: 0,
        turnoverPayout: 0,
        totalPayout: 0,
        qualifyingCount: 0,
      };
    }

    // The highest slab reached is the last item in the qualifying array
    const highest = qualifying[qualifying.length - 1];
    if (!highest) {
      return {
        matchedSlab: null,
        highestTierReached: "None",
        volumePayout: 0,
        turnoverPayout: 0,
        totalPayout: 0,
        qualifyingCount: 0,
      };
    }
    return {
      matchedSlab: highest,
      highestTierReached: `${highest.slabTierName} (≥ ${highest.minAchievementPercent}%)`,
      volumePayout: highest.volumeIncentiveLkr,
      turnoverPayout: highest.turnoverIncentiveLkr,
      totalPayout: highest.volumeIncentiveLkr + highest.turnoverIncentiveLkr,
      qualifyingCount: qualifying.length,
    };
  }, [slabs, simulatorAchievement]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Quick Navigation Bar to Related Screens                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/60 p-3 sm:px-4 rounded-lg border border-border/80">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp size={15} className="text-primary" />
          <span className="font-semibold text-foreground">Slab Table Workflow:</span>
          <span className="hidden sm:inline">
            Linked target matrices and calculation configurations
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onNavigateScreen && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("scheme-master")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <Layers size={13} className="text-primary" />
                <span>Incentive Scheme Master</span>
                <ChevronRight size={12} className="text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("rate-matrix")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <FileSpreadsheet size={13} className="text-primary" />
                <span>Commission Rate Matrix</span>
                <ChevronRight size={12} className="text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("monthly-target")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <Target size={13} className="text-primary" />
                <span>Monthly Targets</span>
                <ChevronRight size={12} className="text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("participant-profile")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <Users size={13} className="text-primary" />
                <span>Participant Profile</span>
                <ChevronRight size={12} className="text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PostgreSQL Status & Sync Banner */}
      <div className="bg-card border rounded-lg p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
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
            — Target achievement tiers and non-cumulative slab payouts are synchronized with PostgreSQL.
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
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
            onClick={() => loadSlabTableFromDb(false)}
            disabled={isLoading}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reload from PostgreSQL"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Top Header & Mandatory Fields Section                      */}
      {/* ------------------------------------------------------------- */}
      <div className="card-surface p-4 sm:p-5 rounded-lg border bg-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success shadow-xs">
              <TrendingUp size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">Target Incentive Slab Table</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    status === "Approved"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {status === "Approved" ? (
                    <>
                      <CheckCircle2 size={12} />
                      Approved
                    </>
                  ) : (
                    <>
                      <Clock size={12} />
                      Draft (Editable)
                    </>
                  )}
                </span>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-500/15 text-amber-700">
                    <AlertTriangle size={11} /> Unsaved Revisions
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Maintain achievement slabs for volume, turnover and product-category targets with
                non-cumulative payout rules.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {status === "Draft" ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>{isSaving ? "Saving..." : "Save to PostgreSQL"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApproveDraft}
                  className="h-8 gap-1.5 text-xs font-medium cursor-pointer text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Approve Slabs</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNewDraftVersion}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Unlock size={13} className="text-primary" />
                <span>Create New Draft Version</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
              title="Export Slabs to Excel"
            >
              <Download size={13} className="text-primary" />
              <span className="hidden sm:inline">Export Excel</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
              title="Print Schedule / Export PDF"
            >
              <Printer size={13} className="text-muted-foreground" />
              <span className="hidden sm:inline">Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* Mandatory Header Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t">
          {/* 1. Scheme (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Scheme <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                {currentScheme.division}
              </span>
            </label>
            <select
              value={selectedSchemeCode}
              onChange={(e) => handleSchemeChange(e.target.value)}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {availableSchemesList.map((scheme) => (
                <option key={scheme.code} value={scheme.code}>
                  {scheme.code} — {scheme.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Target Type (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Target Type <span className="text-destructive">*</span>
            </label>
            <select
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setHasUnsavedChanges(true);
              }}
              disabled={status !== "Draft"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-75 disabled:bg-muted/50"
            >
              {TARGET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Slab Method (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Slab Method <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                Non-Cumulative
              </span>
            </label>
            <select
              value={slabMethod}
              onChange={(e) => {
                setSlabMethod(e.target.value);
                setHasUnsavedChanges(true);
              }}
              disabled={status !== "Draft"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-75 disabled:bg-muted/50 font-medium"
            >
              {SLAB_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Version (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Version <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Select Version</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={version}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="w-full text-xs font-mono font-medium rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="v2.1">v2.1 (Approved Active)</option>
                <option value="v2.2">v2.2 (Draft Revision)</option>
                <option value="v2.0">v2.0 (Approved Historical)</option>
                <option value="v1.0">v1.0 (Archived)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scheme Context Strip */}
        <div className="bg-muted/40 rounded-md p-2.5 text-xs flex flex-wrap items-center justify-between gap-3 text-muted-foreground border">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary shrink-0" />
            <span>
              Targeted Role: <strong className="text-foreground">{currentScheme.role}</strong>
            </span>
            <span className="text-border">|</span>
            <span>
              Division: <strong className="text-foreground">{currentScheme.division}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Check size={11} /> 100% ERP Rule Sync Active
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CRITICAL BUSINESS RULE BANNER & INTERACTIVE SIMULATOR      */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-xs shrink-0 mt-0.5">
              <Info size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Critical Business Rule: Highest Slab Reached (Non-Cumulative)
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded">
                  Mandatory Payout Logic
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Employees are paid the incentive amount defined strictly for the{" "}
                <strong>highest achievement slab reached</strong>. Slab payouts are{" "}
                <strong>not cumulative</strong> (earlier qualifying tiers are not added together).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-card px-3 py-1.5 rounded-md border text-xs text-muted-foreground">
            <Calculator size={14} className="text-primary" />
            <span>Live Achievement Simulator Below</span>
          </div>
        </div>

        {/* Live Simulator Widget */}
        <div className="mt-2 pt-3 border-t border-primary/15 bg-card/80 rounded-md p-3 border">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Input Slider / Value */}
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Percent size={13} className="text-primary" /> Test Actual Achievement %:
                </span>
                <span className="font-mono font-bold text-primary text-sm">
                  {simulatorAchievement.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                step="0.5"
                value={simulatorAchievement}
                onChange={(e) => setSimulatorAchievement(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>50% (Sub-floor)</span>
                <span>80% (Floor)</span>
                <span>100% (Target)</span>
                <span>125%</span>
                <span>150%+</span>
              </div>
            </div>

            {/* Simulated Payout Breakdown */}
            <div className="md:col-span-7 bg-muted/40 rounded-lg p-2.5 border grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-card rounded border">
                <span className="text-[10px] text-muted-foreground block">Highest Slab</span>
                <span
                  className="font-bold text-foreground text-xs truncate block"
                  title={simulationResult.highestTierReached}
                >
                  {simulationResult.highestTierReached}
                </span>
              </div>

              <div className="p-2 bg-card rounded border">
                <span className="text-[10px] text-muted-foreground block">Volume Payout</span>
                <span className="font-bold font-mono text-primary text-xs block">
                  LKR {simulationResult.volumePayout.toLocaleString()}
                </span>
              </div>

              <div className="p-2 bg-card rounded border border-primary/30 bg-primary/5">
                <span className="text-[10px] text-primary font-semibold block">
                  Turnover Payout
                </span>
                <span className="font-bold font-mono text-primary text-xs block">
                  LKR {simulationResult.turnoverPayout.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 italic flex items-center gap-1">
            <Check size={12} className="text-emerald-600" />
            Single tier payment: At {simulatorAchievement.toFixed(1)}%, payout is strictly LKR{" "}
            {(simulationResult.volumePayout + simulationResult.turnoverPayout).toLocaleString()}{" "}
            total. Slabs are not summed.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Main Tabs: Slabs & History                                 */}
      {/* ------------------------------------------------------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="slabs" className="gap-2 text-xs font-semibold cursor-pointer">
              <TrendingUp size={14} />
              <span>Slabs ({slabs.length} Tiers)</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 text-xs font-semibold cursor-pointer">
              <HistoryIcon size={14} />
              <span>History ({history.length} Logs)</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Tab Helper or Action */}
          {activeTab === "slabs" && status === "Draft" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNewRow(true)}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent self-start sm:self-auto"
            >
              <Plus size={13} className="text-primary" />
              <span>Add Slab Row</span>
            </Button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: SLABS GRID                                             */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="slabs" className="mt-0 focus-visible:outline-none space-y-4">
          {/* Add New Row Form Drawer (Conditional when clicking Add Slab Row) */}
          {isAddingNewRow && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Plus size={14} className="text-primary" /> New Slab Tier Configuration
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingNewRow(false)}
                  className="h-6 w-6 p-0 text-muted-foreground"
                >
                  <X size={14} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Slab Tier Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bronze Accelerator"
                    value={newRowData.slabTierName || ""}
                    onChange={(e) => setNewRowData({ ...newRowData, slabTierName: e.target.value })}
                    className="w-full text-xs rounded border bg-background px-2.5 py-1.5 shadow-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Achievement ≥ %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newRowData.minAchievementPercent ?? 100}
                    onChange={(e) =>
                      setNewRowData({
                        ...newRowData,
                        minAchievementPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded border bg-background px-2.5 py-1.5 shadow-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Volume Target Incentive (LKR)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={newRowData.volumeIncentiveLkr ?? 0}
                    onChange={(e) =>
                      setNewRowData({
                        ...newRowData,
                        volumeIncentiveLkr: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded border bg-background px-2.5 py-1.5 shadow-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Turnover Target Incentive (LKR)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={newRowData.turnoverIncentiveLkr ?? 0}
                    onChange={(e) =>
                      setNewRowData({
                        ...newRowData,
                        turnoverIncentiveLkr: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded border bg-background px-2.5 py-1.5 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNewRow(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddNewRow}
                  className="h-7 text-xs gap-1"
                >
                  <Check size={12} /> Confirm & Insert Slab
                </Button>
              </div>
            </div>
          )}

          {/* Slabs Grid Table */}
          <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/60 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Slab Tier</th>
                    <th className="px-4 py-3 text-right">Achievement ≥ %</th>
                    <th className="px-4 py-3 text-right">Volume Target Incentive (LKR)</th>
                    <th className="px-4 py-3 text-right">Turnover Target Incentive (LKR)</th>
                    <th className="px-4 py-3 text-center">Payout Calculation Mode</th>
                    <th className="px-4 py-3 text-left">Audit Notes & Eligibility</th>
                    {status === "Draft" && <th className="px-4 py-3 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {slabs.map((slab, index) => {
                    const isEditing = editingRowId === slab.id;
                    const isSimulatedActive = simulationResult.matchedSlab?.id === slab.id;

                    if (isEditing) {
                      return (
                        <tr key={slab.id} className="bg-primary/10">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editForm.slabTierName ?? slab.slabTierName}
                              onChange={(e) =>
                                setEditForm({ ...editForm, slabTierName: e.target.value })
                              }
                              className="w-full text-xs font-semibold rounded border bg-background px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.5"
                                value={editForm.minAchievementPercent ?? slab.minAchievementPercent}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    minAchievementPercent: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 text-xs font-mono font-bold text-right rounded border bg-background px-2 py-1"
                              />
                              <span className="font-semibold">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-[11px] text-muted-foreground">LKR</span>
                              <input
                                type="number"
                                step="500"
                                value={editForm.volumeIncentiveLkr ?? slab.volumeIncentiveLkr}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    volumeIncentiveLkr: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-28 text-xs font-mono font-bold text-right rounded border bg-background px-2 py-1"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-[11px] text-muted-foreground">LKR</span>
                              <input
                                type="number"
                                step="1000"
                                value={editForm.turnoverIncentiveLkr ?? slab.turnoverIncentiveLkr}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    turnoverIncentiveLkr: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-28 text-xs font-mono font-bold text-right rounded border bg-background px-2 py-1"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Highest Reached
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editForm.notes ?? slab.notes ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              placeholder="Notes..."
                              className="w-full text-xs rounded border bg-background px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={handleSaveInlineEdit}
                                className="h-6 w-6 p-0 bg-emerald-600 hover:bg-emerald-700"
                                title="Save Row"
                              >
                                <Check size={12} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelInlineEdit}
                                className="h-6 w-6 p-0 text-muted-foreground"
                                title="Cancel Edit"
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={slab.id}
                        className={`transition-colors ${
                          isSimulatedActive
                            ? "bg-primary/10 font-medium border-l-4 border-l-primary"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        {/* Slab Tier */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {slab.slabTierName}
                            </span>
                            {index === 0 && (
                              <span className="text-[10px] font-medium bg-muted px-1.5 py-0.2 rounded text-muted-foreground">
                                Floor
                              </span>
                            )}
                            {index === slabs.length - 1 && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                Cap Ceiling
                              </span>
                            )}
                            {isSimulatedActive && (
                              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.2 rounded animate-pulse">
                                Active Match
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Achievement >= % */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                          <span className="px-2 py-1 rounded bg-muted/70 inline-block">
                            ≥ {slab.minAchievementPercent.toFixed(1)}%
                          </span>
                        </td>

                        {/* Volume Target Incentive (LKR) */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-primary">
                          LKR {slab.volumeIncentiveLkr.toLocaleString()}
                        </td>

                        {/* Turnover Target Incentive (LKR) */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                          LKR {slab.turnoverIncentiveLkr.toLocaleString()}
                        </td>

                        {/* Payout Calculation Mode */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground inline-flex items-center gap-1">
                            <Shield size={11} className="text-primary" />
                            Single Highest Slab
                          </span>
                        </td>

                        {/* Audit Notes */}
                        <td
                          className="px-4 py-3.5 text-muted-foreground text-[11px] max-w-xs truncate"
                          title={slab.notes}
                        >
                          {slab.notes || "—"}
                        </td>

                        {/* Actions (in Draft mode) */}
                        {status === "Draft" && (
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(slab)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Edit Slab Row"
                              >
                                <Edit2 size={13} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRow(slab.id, slab.slabTierName)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                                title="Delete Slab Row"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="bg-muted/30 px-4 py-3 border-t flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
              <div className="flex items-center gap-2">
                <span>
                  Total Active Slabs: <strong>{slabs.length}</strong>
                </span>
                <span>•</span>
                <span>
                  Qualifying Span:{" "}
                  <strong>
                    {slabs[0]?.minAchievementPercent || 0}% –{" "}
                    {slabs[slabs.length - 1]?.minAchievementPercent || 0}%+
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="italic">
                  * Note: Slabs are non-cumulative; only highest qualifying tier pays out.
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: AUDIT HISTORY                                          */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="history" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Slab Revision & Approval History
                </h4>
                <p className="text-xs text-muted-foreground">
                  Audit trail of target threshold calibrations, committee approvals, and status
                  transitions.
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-mono">
                {history.length} Event Logs
              </span>
            </div>

            <div className="divide-y divide-border">
              {history.map((log) => (
                <div key={log.id} className="py-3.5 space-y-1.5 first:pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded text-foreground">
                        {log.version}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          log.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {log.status === "Approved" ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {log.status}
                      </span>
                      <span className="font-semibold text-xs text-foreground">
                        {log.changeSummary}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                    {log.details}
                  </p>

                  <div className="text-[11px] text-muted-foreground/80 pl-1 flex items-center gap-2">
                    <span>Authorized by:</span>
                    <strong className="text-foreground">{log.author}</strong>
                    <span>({log.role})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
