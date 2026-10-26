import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  Search,
  Filter,
  Save,
  Upload,
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
  DollarSign,
  Percent,
  Sliders,
  History as HistoryIcon,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Edit2,
  Check,
  X,
  FileCheck,
  Plus,
  Trash2,
  Info,
  TrendingUp,
  Target,
  Users,
  Database,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

export type MatrixStatus = "Draft" | "Approved";

export interface RateMatrixCell {
  capacityBand: string;
  itemType: string;
  cashImmediate: number | null; // e.g. 3.50%
  creditLt15: number | null; // e.g. 3.25%
  creditLt30: number | null; // e.g. 2.75%
  creditLte45: number | null; // e.g. 2.00%
  creditGt45: number | null; // e.g. 1.00% or 0%
}

export interface CreditBandDefinition {
  id: string;
  name: string;
  columnKey: keyof Omit<RateMatrixCell, "capacityBand" | "itemType">;
  minDays: number;
  maxDays: number;
  description: string;
  defaultFactor: number;
}

export interface HistoryRecord {
  id: string;
  version: string;
  status: MatrixStatus;
  timestamp: string;
  author: string;
  role: string;
  changeSummary: string;
  details: string;
}

interface CommissionRateMatrixViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

// Initial realistic default credit bands
const INITIAL_BANDS: CreditBandDefinition[] = [
  {
    id: "band-cash",
    name: "Cash / Immediate Cheque",
    columnKey: "cashImmediate",
    minDays: 0,
    maxDays: 0,
    description: "Paid immediately upon delivery or within 0 business days.",
    defaultFactor: 1.0,
  },
  {
    id: "band-lt15",
    name: "Credit < 15 days",
    columnKey: "creditLt15",
    minDays: 1,
    maxDays: 14,
    description: "Invoiced payment settled between day 1 and 14 from dispatch.",
    defaultFactor: 0.95,
  },
  {
    id: "band-lt30",
    name: "Credit < 30 days",
    columnKey: "creditLt30",
    minDays: 15,
    maxDays: 29,
    description: "Standard net commercial terms (settlement between day 15 and 29).",
    defaultFactor: 0.85,
  },
  {
    id: "band-lte45",
    name: "Credit ≤ 45 days",
    columnKey: "creditLte45",
    minDays: 30,
    maxDays: 45,
    description: "Extended customer credit band; settled between 30 and 45 days.",
    defaultFactor: 0.7,
  },
  {
    id: "band-gt45",
    name: "Credit > 45 days",
    columnKey: "creditGt45",
    minDays: 46,
    maxDays: 999,
    description: "Overdue tier beyond 45 days; eligible for degraded rate or clawback.",
    defaultFactor: 0.35,
  },
];

// Realistic Initial Matrix Grid Data
const INITIAL_MATRIX_ROWS: RateMatrixCell[] = [
  {
    capacityBand: "< 5 kW",
    itemType: "String Inverter",
    cashImmediate: 3.5,
    creditLt15: 3.2,
    creditLt30: 2.75,
    creditLte45: 2.0,
    creditGt45: 0.75,
  },
  {
    capacityBand: "< 5 kW",
    itemType: "Microinverter",
    cashImmediate: 4.0,
    creditLt15: 3.75,
    creditLt30: 3.25,
    creditLte45: 2.5,
    creditGt45: 1.0,
  },
  {
    capacityBand: "5 - 10 kW",
    itemType: "String Inverter",
    cashImmediate: 3.75,
    creditLt15: 3.4,
    creditLt30: 2.9,
    creditLte45: 2.1,
    creditGt45: 0.8,
  },
  {
    capacityBand: "5 - 10 kW",
    itemType: "Hybrid ESS Inverter",
    cashImmediate: 4.25,
    creditLt15: 4.0,
    creditLt30: 3.5,
    creditLte45: 2.75,
    creditGt45: 1.25,
  },
  {
    capacityBand: "10 - 20 kW",
    itemType: "String Inverter",
    cashImmediate: 4.0,
    creditLt15: 3.6,
    creditLt30: 3.0,
    creditLte45: 2.2,
    creditGt45: 0.9,
  },
  {
    capacityBand: "10 - 20 kW",
    itemType: "Hybrid ESS Inverter",
    cashImmediate: 4.5,
    creditLt15: 4.2,
    creditLt30: 3.7,
    creditLte45: 3.0,
    creditGt45: 1.5,
  },
  {
    capacityBand: "20 - 50 kW",
    itemType: "Commercial Hybrid",
    cashImmediate: 4.8,
    creditLt15: 4.5,
    creditLt30: 3.9,
    creditLte45: 3.1,
    creditGt45: 1.6,
  },
  {
    capacityBand: "20 - 50 kW",
    itemType: "Lithium Battery Module",
    cashImmediate: 3.2,
    creditLt15: 3.0,
    creditLt30: 2.5,
    creditLte45: 1.8,
    creditGt45: 0.5,
  },
  {
    capacityBand: "50 - 100 kW",
    itemType: "Commercial Hybrid",
    cashImmediate: 5.0,
    creditLt15: 4.7,
    creditLt30: 4.1,
    creditLte45: 3.3,
    creditGt45: 1.75,
  },
  {
    capacityBand: "50 - 100 kW",
    itemType: "Central Inverter",
    cashImmediate: 4.5,
    creditLt15: 4.1,
    creditLt30: 3.6,
    creditLte45: 2.8,
    creditGt45: 1.2,
  },
  {
    capacityBand: "> 100 kW",
    itemType: "Central Inverter",
    cashImmediate: 5.5,
    creditLt15: 5.1,
    creditLt30: 4.5,
    creditLte45: 3.6,
    creditGt45: 2.0,
  },
  {
    capacityBand: "> 100 kW",
    itemType: "High-Voltage ESS Block",
    cashImmediate: 4.0,
    creditLt15: 3.75,
    creditLt30: 3.2,
    creditLte45: 2.4,
    creditGt45: 0.0, // Explicitly 0.0 to demonstrate zero allowed validation
  },
];

// Audit History Logs
const INITIAL_HISTORY: HistoryRecord[] = [
  {
    id: "hist-004",
    version: "v3.2",
    status: "Draft",
    timestamp: "2026-10-13 18:45:12",
    author: "Ayesha Asarak",
    role: "Incentive Administrator",
    changeSummary: "Initiated v3.2 Draft for Q4 2026 solar equipment lines",
    details:
      "Adjusted commercial storage capacity bands and updated Credit > 45 days retention policy. Zero allowed on HV ESS Block.",
  },
  {
    id: "hist-003",
    version: "v3.1",
    status: "Approved",
    timestamp: "2026-07-01 09:15:00",
    author: "Marcus Wong",
    role: "Finance Director",
    changeSummary: "Approved Q3 2026 Commission Rate Matrix",
    details:
      "All 12 matrix band intersections certified. No band overlaps detected across payment terms.",
  },
  {
    id: "hist-002",
    version: "v3.0",
    status: "Approved",
    timestamp: "2026-04-02 11:30:20",
    author: "Marcus Wong",
    role: "Finance Director",
    changeSummary: "Promoted draft to approved state after executive committee signoff",
    details: "Aligned product types with updated SAP Business One Item Group classifications.",
  },
  {
    id: "hist-001",
    version: "v2.4",
    status: "Approved",
    timestamp: "2026-01-10 14:22:00",
    author: "David Chen",
    role: "Commercial Operations Lead",
    changeSummary: "Initial 2026 baseline commission matrix established",
    details: "Imported baseline rates via Excel for 5 kW - 100 kW capacity ranges.",
  },
];

export function CommissionRateMatrixView({
  onNavigateScreen,
  onBack,
}: CommissionRateMatrixViewProps) {
  // Header Mandatory Fields State
  const [selectedScheme, setSelectedScheme] = useState("SCH-2025-SOLAR-01");
  const [selectedVersion, setSelectedVersion] = useState("v3.2");
  const [rowDimension, setRowDimension] = useState("Capacity Band + Item Type");
  const [columnDimension, setColumnDimension] = useState("Payment-term / Credit-age Bands");
  const [rateUnit, setRateUnit] = useState("% of Net Invoiced Value");
  const [currency, setCurrency] = useState("USD ($)");

  // Status flow: Draft -> Approved
  const [status, setStatus] = useState<MatrixStatus>("Draft");

  // Active Tab
  const [activeTab, setActiveTab] = useState<"matrix" | "bands" | "history">("matrix");

  // Grid Data & Bands State
  const [matrixData, setMatrixData] = useState<RateMatrixCell[]>(INITIAL_MATRIX_ROWS);
  const [bands, setBands] = useState<CreditBandDefinition[]>(INITIAL_BANDS);
  const [history, setHistory] = useState<HistoryRecord[]>(INITIAL_HISTORY);

  // Filters for Matrix tab
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("All");
  const [itemTypeFilter, setItemTypeFilter] = useState("All");

  // Modals & Dialogs
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditBandModal, setShowEditBandModal] = useState(false);
  const [editingBand, setEditingBand] = useState<CreditBandDefinition | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Excel Import state
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importPreviewCount, setImportPreviewCount] = useState<number>(0);

  // Quick Inline Edit Active Cell
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colKey: keyof Omit<RateMatrixCell, "capacityBand" | "itemType">;
    val: string;
  } | null>(null);

  // PostgreSQL Database & Async States
  const [matrixId, setMatrixId] = useState<string>("mat-solar-q4");
  const [matrixName, setMatrixName] = useState<string>("Commercial Solar Inverter & ESS Matrix");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [availableSchemes, setAvailableSchemes] = useState<Array<{ schemeCode: string; schemeName: string }>>([
    { schemeCode: "SCH-2025-SOLAR-01", schemeName: "Commercial Solar" },
    { schemeCode: "SCH-MOB-2026", schemeName: "sales scheama" },
    { schemeCode: "SCH-MOB-2027", schemeName: "chathuni" },
  ]);

  // Add Dimension Row Modal State
  const [showAddRowModal, setShowAddRowModal] = useState<boolean>(false);
  const [newRowForm, setNewRowForm] = useState({
    capacityBand: "< 5 kW",
    itemType: "",
    cashImmediate: 3.5,
    creditLt15: 3.0,
    creditLt30: 2.5,
    creditLte45: 2.0,
    creditGt45: 1.0,
  });

  // Load Commission Rate Matrix from PostgreSQL
  const loadMatrixFromDb = async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/rate-matrices");
      if (res.ok) {
        const data = await res.json();
        if (data.matrices && data.matrices.length > 0) {
          const mat = data.matrices[0];
          setMatrixId(mat.id);
          setMatrixName(mat.matrixName);
          setSelectedScheme(mat.schemeCode);
          setSelectedVersion(mat.version);
          setRowDimension(mat.rowDimension);
          setColumnDimension(mat.columnDimension);
          setRateUnit(mat.rateUnit);
          setCurrency(mat.currency);
          setStatus(mat.status);
          if (mat.bands && mat.bands.length > 0) setBands(mat.bands);
          if (mat.matrixData && mat.matrixData.length > 0) setMatrixData(mat.matrixData);
          if (mat.history && mat.history.length > 0) setHistory(mat.history);
          setIsDbConnected(true);
          if (!silent) {
            toast.success("Synchronized with PostgreSQL database.", {
              description: `Loaded matrix ${mat.matrixName} (${mat.version}) successfully.`,
            });
          }
        }
      } else {
        setIsDbConnected(false);
      }
    } catch (err) {
      console.error("Failed to load rate matrix from PostgreSQL:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatrixFromDb(true);

    // Also load available schemes from DB
    apiFetch("/api/incentives/schemes")
      .then((r) => r.json())
      .then((data) => {
        if (data.schemes && data.schemes.length > 0) {
          setAvailableSchemes(
            data.schemes.map((s: any) => ({
              schemeCode: s.schemeCode,
              schemeName: s.schemeName,
            })),
          );
        }
      })
      .catch((err) => console.error("Could not fetch schemes:", err));
  }, []);

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowForm.itemType.trim()) {
      toast.error("Validation Failed: Item Type is required.");
      return;
    }

    const exists = matrixData.some(
      (r) =>
        r.capacityBand.trim().toLowerCase() === newRowForm.capacityBand.trim().toLowerCase() &&
        r.itemType.trim().toLowerCase() === newRowForm.itemType.trim().toLowerCase(),
    );
    if (exists) {
      toast.error(`Combination "${newRowForm.capacityBand} - ${newRowForm.itemType}" already exists.`);
      return;
    }

    const newCellRow: RateMatrixCell = {
      capacityBand: newRowForm.capacityBand.trim(),
      itemType: newRowForm.itemType.trim(),
      cashImmediate: Number(newRowForm.cashImmediate),
      creditLt15: Number(newRowForm.creditLt15),
      creditLt30: Number(newRowForm.creditLt30),
      creditLte45: Number(newRowForm.creditLte45),
      creditGt45: Number(newRowForm.creditGt45),
    };

    setMatrixData((prev) => [...prev, newCellRow]);
    setShowAddRowModal(false);
    setNewRowForm({
      capacityBand: "< 5 kW",
      itemType: "",
      cashImmediate: 3.5,
      creditLt15: 3.0,
      creditLt30: 2.5,
      creditLte45: 2.0,
      creditGt45: 1.0,
    });
    toast.success(`Added dimension row "${newCellRow.capacityBand} - ${newCellRow.itemType}".`, {
      description: "Click 'Save to PostgreSQL' to persist this to the database.",
    });
  };

  const handleDeleteRow = (index: number) => {
    if (status === "Approved") {
      toast.warning("Cannot delete rows while in Approved status. Switch to Draft first.");
      return;
    }
    const target = matrixData[index];
    if (!target) return;
    const updated = matrixData.filter((_, i) => i !== index);
    setMatrixData(updated);
    toast.success(`Removed row "${target.capacityBand} - ${target.itemType}".`, {
      description: "Click 'Save to PostgreSQL' to update the database.",
    });
  };

  // --------------------------------------------------------------------------
  // Validations:
  // 1. Bands must not overlap
  // 2. Every band combination must have a value; zero is allowed.
  // --------------------------------------------------------------------------

  // Overlap validation logic for bands
  const bandOverlapError = useMemo(() => {
    // Sort bands by minDays
    const sorted = [...bands].sort((a, b) => a.minDays - b.minDays);
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current && next && current.maxDays >= next.minDays) {
        return `Overlap detected: "${current.name}" (Days ${current.minDays} - ${current.maxDays}) overlaps with "${next.name}" (Days ${next.minDays} - ${next.maxDays}). Payment-term bands must not overlap.`;
      }
    }
    return null;
  }, [bands]);

  // Completeness validation: Every band combination must have a value (zero is allowed!)
  const completenessValidation = useMemo(() => {
    const missingCells: { row: string; col: string }[] = [];
    let totalCells = 0;
    let validCells = 0;

    matrixData.forEach((row) => {
      const colKeys: (keyof Omit<RateMatrixCell, "capacityBand" | "itemType">)[] = [
        "cashImmediate",
        "creditLt15",
        "creditLt30",
        "creditLte45",
        "creditGt45",
      ];

      colKeys.forEach((key) => {
        totalCells++;
        const val = row[key];
        // Must be a number (0 is explicitly allowed!), not null, undefined, or NaN
        if (val === null || val === undefined || isNaN(val)) {
          missingCells.push({
            row: `${row.capacityBand} - ${row.itemType}`,
            col: key,
          });
        } else {
          validCells++;
        }
      });
    });

    const isComplete = missingCells.length === 0;
    return {
      isComplete,
      missingCount: missingCells.length,
      missingCells,
      totalCells,
      validCells,
      completionRate: Math.round((validCells / (totalCells || 1)) * 100),
    };
  }, [matrixData]);

  // Filtered rows for Matrix tab
  const filteredMatrix = useMemo(() => {
    return matrixData.filter((row) => {
      const matchesSearch =
        searchQuery === "" ||
        row.capacityBand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.itemType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCapacity = capacityFilter === "All" || row.capacityBand === capacityFilter;
      const matchesItemType = itemTypeFilter === "All" || row.itemType === itemTypeFilter;
      return matchesSearch && matchesCapacity && matchesItemType;
    });
  }, [matrixData, searchQuery, capacityFilter, itemTypeFilter]);

  // Unique capacity bands & item types for filters
  const uniqueCapacities = useMemo(() => {
    return Array.from(new Set(matrixData.map((r) => r.capacityBand)));
  }, [matrixData]);

  const uniqueItemTypes = useMemo(() => {
    return Array.from(new Set(matrixData.map((r) => r.itemType)));
  }, [matrixData]);

  // --------------------------------------------------------------------------
  // Actions:
  // --------------------------------------------------------------------------

  // Save draft version to PostgreSQL
  const handleSaveDraft = async () => {
    if (status !== "Draft") {
      toast.warning("Matrix is currently in Approved status.", {
        description: "Create a new draft version to make and persist edits.",
      });
      return;
    }

    if (bandOverlapError) {
      toast.error("Cannot save matrix: Bands overlap detected.", {
        description: bandOverlapError,
      });
      return;
    }

    // Add entry to history
    const newLog: HistoryRecord = {
      id: `hist-${Date.now()}`,
      version: selectedVersion,
      status: "Draft",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "Ayesha Asarak",
      role: "Incentive Administrator",
      changeSummary: "Saved draft matrix values and configuration",
      details: `Saved ${matrixData.length} capacity and product dimension rows (${completenessValidation.validCells}/${completenessValidation.totalCells} combinations populated).`,
    };

    setHistory([newLog, ...history]);

    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/rate-matrices/${matrixId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeCode: selectedScheme,
          matrixName: matrixName || "Commission Rate Matrix",
          version: selectedVersion,
          rowDimension,
          columnDimension,
          rateUnit,
          currency,
          status: "Draft",
          bands,
          matrixData,
          modifiedBy: "Incentive Administrator",
          changeNote: `Manual save for rate matrix (${selectedVersion}) with ${matrixData.length} rows.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.matrix) {
          if (data.matrix.history) setHistory(data.matrix.history);
          setIsDbConnected(true);
        }
        toast.success(`Commission Rate Matrix (${selectedVersion}) saved to PostgreSQL!`, {
          description: `Persisted ${matrixData.length} dimension rows and ${bands.length} credit bands to database.`,
        });
      } else {
        toast.error("Failed to save matrix to PostgreSQL.");
      }
    } catch (err) {
      console.error("Save matrix error:", err);
      toast.error("Network or database error while saving matrix.");
      setIsDbConnected(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Status Action: Approve or Create New Draft in PostgreSQL
  const handleApproveMatrix = async () => {
    if (bandOverlapError) {
      toast.error("Approval blocked: Bands overlap error.", {
        description: bandOverlapError,
      });
      return;
    }

    if (!completenessValidation.isComplete) {
      toast.error("Approval blocked: Incomplete rate matrix.", {
        description: `${completenessValidation.missingCount} rate cell(s) are missing values. Every band combination must have a value (zero is allowed).`,
      });
      return;
    }

    setStatus("Approved");
    setShowApprovalModal(false);

    const approveLog: HistoryRecord = {
      id: `hist-${Date.now()}`,
      version: selectedVersion,
      status: "Approved",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "Marcus Wong",
      role: "Finance Director",
      changeSummary: `Formally certified and approved Commission Rate Matrix ${selectedVersion}`,
      details:
        "Validation passed: Zero missing combinations and no payment-term overlaps. Matrix is now locked for active payroll runs.",
    };
    setHistory([approveLog, ...history]);

    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/rate-matrices/${matrixId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Approved",
          author: "Marcus Wong",
          role: "Finance Director",
          details: `Formally certified and approved Commission Rate Matrix ${selectedVersion}.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.matrix?.history) setHistory(data.matrix.history);
        toast.success(`Commission Rate Matrix ${selectedVersion} Approved in PostgreSQL!`, {
          description: "Rates locked and authorized for calculation runs and posting.",
        });
      }
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewDraftVersion = () => {
    const nextVer = "v3.3";
    setSelectedVersion(nextVer);
    setStatus("Draft");

    const draftLog: HistoryRecord = {
      id: `hist-${Date.now()}`,
      version: nextVer,
      status: "Draft",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "Ayesha Asarak",
      role: "Incentive Administrator",
      changeSummary: `Created new draft version ${nextVer} from approved ${selectedVersion}`,
      details: "Cloned all dimension rows and credit bands for upcoming adjustment cycle.",
    };
    setHistory([draftLog, ...history]);

    toast.info(`Created new draft version: ${nextVer}`, {
      description: "Cells unlocked for editing. Remember to save draft once updated.",
    });
  };

  // Cell editing handlers
  const handleCellClick = (
    rowIndex: number,
    colKey: keyof Omit<RateMatrixCell, "capacityBand" | "itemType">,
    currentVal: number | null,
  ) => {
    if (status === "Approved") {
      toast.info("Matrix is locked in Approved status.", {
        description: "Click 'Create New Draft Version' to modify rates.",
      });
      return;
    }
    setEditingCell({
      rowIndex,
      colKey,
      val: currentVal !== null ? currentVal.toString() : "",
    });
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const num = parseFloat(editingCell.val);
    const updated = [...matrixData];
    const targetRow = updated[editingCell.rowIndex];
    if (targetRow) {
      if (editingCell.val.trim() === "" || isNaN(num)) {
        // Set to null to indicate empty (which will trigger validation)
        targetRow[editingCell.colKey] = null as unknown as number;
        toast.warning("Empty rate value entered.", {
          description: "Every combination must have a value (zero is allowed).",
        });
      } else {
        targetRow[editingCell.colKey] = parseFloat(num.toFixed(3));
      }
    }

    setMatrixData(updated);
    setEditingCell(null);
  };

  // Excel Import Handler
  const handleSimulateImport = () => {
    if (status !== "Draft") {
      toast.error("Import only permitted in Draft status.", {
        description: "Create a new draft version to import replacement rates.",
      });
      return;
    }

    // Simulate reading Excel and populating fresh values
    const importedRows: RateMatrixCell[] = [
      {
        capacityBand: "< 5 kW",
        itemType: "String Inverter",
        cashImmediate: 3.65,
        creditLt15: 3.35,
        creditLt30: 2.85,
        creditLte45: 2.1,
        creditGt45: 0.8,
      },
      {
        capacityBand: "< 5 kW",
        itemType: "Microinverter",
        cashImmediate: 4.15,
        creditLt15: 3.85,
        creditLt30: 3.35,
        creditLte45: 2.6,
        creditGt45: 1.05,
      },
      {
        capacityBand: "5 - 10 kW",
        itemType: "String Inverter",
        cashImmediate: 3.85,
        creditLt15: 3.5,
        creditLt30: 3.0,
        creditLte45: 2.2,
        creditGt45: 0.85,
      },
      {
        capacityBand: "5 - 10 kW",
        itemType: "Hybrid ESS Inverter",
        cashImmediate: 4.4,
        creditLt15: 4.1,
        creditLt30: 3.6,
        creditLte45: 2.85,
        creditGt45: 1.3,
      },
      {
        capacityBand: "10 - 20 kW",
        itemType: "String Inverter",
        cashImmediate: 4.1,
        creditLt15: 3.7,
        creditLt30: 3.1,
        creditLte45: 2.3,
        creditGt45: 0.95,
      },
      {
        capacityBand: "10 - 20 kW",
        itemType: "Hybrid ESS Inverter",
        cashImmediate: 4.65,
        creditLt15: 4.3,
        creditLt30: 3.8,
        creditLte45: 3.1,
        creditGt45: 1.55,
      },
      {
        capacityBand: "20 - 50 kW",
        itemType: "Commercial Hybrid",
        cashImmediate: 4.95,
        creditLt15: 4.6,
        creditLt30: 4.0,
        creditLte45: 3.2,
        creditGt45: 1.65,
      },
      {
        capacityBand: "20 - 50 kW",
        itemType: "Lithium Battery Module",
        cashImmediate: 3.35,
        creditLt15: 3.1,
        creditLt30: 2.6,
        creditLte45: 1.9,
        creditGt45: 0.55,
      },
      {
        capacityBand: "50 - 100 kW",
        itemType: "Commercial Hybrid",
        cashImmediate: 5.15,
        creditLt15: 4.8,
        creditLt30: 4.2,
        creditLte45: 3.4,
        creditGt45: 1.8,
      },
      {
        capacityBand: "50 - 100 kW",
        itemType: "Central Inverter",
        cashImmediate: 4.65,
        creditLt15: 4.25,
        creditLt30: 3.75,
        creditLte45: 2.9,
        creditGt45: 1.25,
      },
      {
        capacityBand: "> 100 kW",
        itemType: "Central Inverter",
        cashImmediate: 5.75,
        creditLt15: 5.25,
        creditLt30: 4.65,
        creditLte45: 3.75,
        creditGt45: 2.1,
      },
      {
        capacityBand: "> 100 kW",
        itemType: "High-Voltage ESS Block",
        cashImmediate: 4.2,
        creditLt15: 3.9,
        creditLt30: 3.35,
        creditLte45: 2.5,
        creditGt45: 0.0,
      },
    ];

    setMatrixData(importedRows);
    setShowImportModal(false);

    const importLog: HistoryRecord = {
      id: `hist-${Date.now()}`,
      version: selectedVersion,
      status: "Draft",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "Ayesha Asarak",
      role: "Incentive Administrator",
      changeSummary: `Imported Excel spreadsheet: ${importFileName || "Q4_Rates_Master.xlsx"}`,
      details: `Successfully loaded and parsed 12 product dimension rows across 5 payment-term columns. All values verified.`,
    };
    setHistory([importLog, ...history]);

    toast.success("Excel Import Successful!", {
      description: `Loaded 12 rows with 60 valid cell combinations into draft ${selectedVersion}.`,
    });
  };

  // Export handlers
  const handleExportExcel = () => {
    toast.success(`Exporting Commission Rate Matrix (${selectedVersion}) to Excel...`, {
      description: "Downloaded file: Commission_Rate_Matrix_v3.2_Draft.xlsx",
    });
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    toast.success(`Generating PDF document for Rate Matrix (${selectedVersion})...`, {
      description: "Formatted printable matrix report with approval signature lines.",
    });
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
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
            — Commission rates, payment-term bands, and audit logs are synchronized with PostgreSQL.
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
            onClick={() => loadMatrixFromDb(false)}
            disabled={isLoading}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reload from PostgreSQL"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* Main Header Card with Mandatory Fields & Actions */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b bg-muted/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info-soft text-info flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Commission Rate Matrix
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      status === "Draft"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {status === "Draft" ? (
                      <>
                        <Clock size={12} /> Draft
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} /> Approved
                      </>
                    )}
                  </span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-medium text-muted-foreground border">
                    {selectedVersion}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Maintain rates by product dimension—such as capacity band, inverter type and
                  product type—against payment-term or credit-age bands.
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Navigation back to Scheme Master */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen?.("scheme-master")}
              className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-background"
              title="Navigate back to Incentive Scheme Master"
            >
              <ArrowLeft size={14} />
              <span>Back to Scheme</span>
            </Button>

            {/* Navigation to Target Incentive Slab Table */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen?.("slab-table")}
              className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-background"
              title="Navigate to Target Incentive Slab Table"
            >
              <TrendingUp size={14} className="text-primary" />
              <span>Target Slabs</span>
            </Button>

            {/* Navigation to Monthly Target Entry */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen?.("monthly-target")}
              className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-background"
              title="Navigate to Monthly Target Entry"
            >
              <Target size={14} className="text-primary" />
              <span>Monthly Targets</span>
            </Button>

            {/* Navigation to Participant Profile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen?.("participant-profile")}
              className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-background"
              title="Navigate to Incentive Participant Profile"
            >
              <Users size={14} className="text-primary" />
              <span>Participant Profiles</span>
            </Button>

            {/* Export action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-background"
            >
              <Download size={14} />
              <span>Export</span>
            </Button>

            {/* Import Excel (draft only) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportModal(true)}
              disabled={status !== "Draft"}
              className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-background"
              title={
                status !== "Draft"
                  ? "Import only allowed in Draft state"
                  : "Import Excel spreadsheet"
              }
            >
              <Upload size={14} />
              <span>Import Excel</span>
            </Button>

            {/* Save to PostgreSQL */}
            {status === "Draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="h-9 gap-1.5 text-xs font-semibold cursor-pointer bg-background text-primary border-primary/40 hover:bg-primary/5 shadow-xs"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isSaving ? "Saving..." : "Save to PostgreSQL"}</span>
              </Button>
            )}

            {/* Status Flow Action: Approve or New Draft */}
            {status === "Draft" ? (
              <Button
                size="sm"
                onClick={() => setShowApprovalModal(true)}
                className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 size={14} />
                <span>Approve Matrix</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleCreateNewDraftVersion}
                className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Plus size={14} />
                <span>Create New Draft Version</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mandatory Header Fields Section */}
        <div className="p-5 sm:p-6 bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Scheme (mandatory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Scheme</span>
                <span className="text-[10px] text-destructive font-medium">*Mandatory</span>
              </label>
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-2.5 py-1.5 shadow-xs focus:ring-1 focus:ring-ring font-medium"
              >
                {availableSchemes.map((s) => (
                  <option key={s.schemeCode} value={s.schemeCode}>
                    {s.schemeCode} ({s.schemeName})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Version (mandatory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Version</span>
                <span className="text-[10px] text-destructive font-medium">*Mandatory</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedVersion}
                  readOnly={status === "Approved"}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className={`w-full text-xs rounded-md border border-input px-2.5 py-1.5 font-mono shadow-xs ${
                    status === "Approved"
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-background"
                  }`}
                  placeholder="e.g. v3.2"
                />
                {status === "Approved" && (
                  <Lock size={12} className="absolute right-2.5 top-2.5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* 3. Row Dimension (mandatory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Row Dimension</span>
                <span className="text-[10px] text-destructive font-medium">*Mandatory</span>
              </label>
              <select
                value={rowDimension}
                disabled={status === "Approved"}
                onChange={(e) => setRowDimension(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-2.5 py-1.5 shadow-xs focus:ring-1 focus:ring-ring font-medium disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="Capacity Band + Item Type">Capacity Band + Item Type</option>
                <option value="Capacity Band Only">Capacity Band Only</option>
                <option value="Inverter & Battery Type">Inverter & Battery Type</option>
                <option value="Product Classification Group">Product Classification Group</option>
              </select>
            </div>

            {/* 4. Column Dimension (mandatory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Column Dimension</span>
                <span className="text-[10px] text-destructive font-medium">*Mandatory</span>
              </label>
              <select
                value={columnDimension}
                disabled={status === "Approved"}
                onChange={(e) => setColumnDimension(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-2.5 py-1.5 shadow-xs focus:ring-1 focus:ring-ring font-medium disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="Payment-term / Credit-age Bands">
                  Payment-term / Credit-age Bands
                </option>
                <option value="Milestone Payment Bands (Cash/Credit/COD)">
                  Milestone Payment Bands
                </option>
                <option value="Customer Credit Rating Aging Bands">
                  Customer Credit Rating Aging Bands
                </option>
              </select>
            </div>

            {/* 5. Rate Unit (mandatory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Rate Unit</span>
                <span className="text-[10px] text-destructive font-medium">*Mandatory</span>
              </label>
              <select
                value={rateUnit}
                disabled={status === "Approved"}
                onChange={(e) => setRateUnit(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-2.5 py-1.5 shadow-xs focus:ring-1 focus:ring-ring font-medium disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="% of Net Invoiced Value">% of Net Invoiced Value</option>
                <option value="% of Gross Margin">% of Gross Margin</option>
                <option value="Fixed Amount per kW (Currency)">Fixed Amount per kW</option>
                <option value="Fixed Amount per Item Unit (Currency)">
                  Fixed Amount per Item Unit
                </option>
              </select>
            </div>

            {/* 6. Currency (mandatory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Currency</span>
                <span className="text-[10px] text-destructive font-medium">*Mandatory</span>
              </label>
              <select
                value={currency}
                disabled={status === "Approved"}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-2.5 py-1.5 shadow-xs focus:ring-1 focus:ring-ring font-medium disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="MYR (RM)">MYR (RM) - Malaysian Ringgit</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="SGD (S$)">SGD (S$) - Singapore Dollar</option>
              </select>
            </div>
          </div>

          {/* Validation Status Summary Banner */}
          <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Overlap Status */}
              <div className="flex items-center gap-1.5">
                {bandOverlapError ? (
                  <span className="inline-flex items-center gap-1 text-destructive font-medium">
                    <AlertTriangle size={14} /> Band Overlap Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={14} /> Bands Valid (No Overlaps)
                  </span>
                )}
              </div>

              {/* Completeness Status */}
              <div className="flex items-center gap-1.5">
                {completenessValidation.isComplete ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={14} /> All Band Combinations Filled (
                    {completenessValidation.validCells}/{completenessValidation.totalCells})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle size={14} /> Missing {completenessValidation.missingCount} Cell
                    Values (Zero is allowed)
                  </span>
                )}
              </div>

              <div className="text-muted-foreground">
                Effective Scheme:{" "}
                <strong className="text-foreground">Commercial Solar Solutions</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Editing Mode:</span>
              {status === "Draft" ? (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-[11px] border border-amber-500/20">
                  Interactive Draft Editing (Click any cell)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium text-[11px] border">
                  Protected Read-Only (Approved)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs: Matrix, Bands, History */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "matrix" | "bands" | "history")}
        className="space-y-4"
      >
        <div className="flex items-center justify-between border-b pb-1">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="matrix" className="gap-2 text-xs font-medium cursor-pointer">
              <Layers size={14} />
              <span>Matrix</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-background text-[10px] font-semibold text-foreground">
                {matrixData.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="bands" className="gap-2 text-xs font-medium cursor-pointer">
              <Sliders size={14} />
              <span>Bands</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-background text-[10px] font-semibold text-foreground">
                {bands.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 text-xs font-medium cursor-pointer">
              <HistoryIcon size={14} />
              <span>History</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-background text-[10px] font-semibold text-foreground">
                {history.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground hidden sm:block">
            Status: <strong className="text-foreground">{status}</strong> | Rate Base:{" "}
            <strong className="text-foreground">{rateUnit}</strong>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: MATRIX TAB                                                  */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="matrix" className="space-y-4 pt-1">
          {/* Matrix Filter & Search Bar */}
          <div className="bg-card border rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by capacity band or item type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Filter size={13} className="text-muted-foreground" />
                <span className="text-muted-foreground">Capacity:</span>
                <select
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  className="text-xs rounded-md border border-input bg-background px-2 py-1"
                >
                  <option value="All">All Capacities ({uniqueCapacities.length})</option>
                  {uniqueCapacities.map((cap) => (
                    <option key={cap} value={cap}>
                      {cap}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Item Type:</span>
                <select
                  value={itemTypeFilter}
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                  className="text-xs rounded-md border border-input bg-background px-2 py-1"
                >
                  <option value="All">All Items ({uniqueItemTypes.length})</option>
                  {uniqueItemTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {(searchQuery || capacityFilter !== "All" || itemTypeFilter !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCapacityFilter("All");
                    setItemTypeFilter("All");
                  }}
                  className="h-7 text-xs px-2 text-muted-foreground"
                >
                  Reset
                </Button>
              )}

              {status === "Draft" && (
                <Button
                  size="sm"
                  onClick={() => setShowAddRowModal(true)}
                  className="h-7 text-xs px-2.5 gap-1.5 bg-primary text-primary-foreground cursor-pointer shrink-0"
                >
                  <Plus size={13} />
                  <span>Add Row</span>
                </Button>
              )}
            </div>
          </div>

          {/* Validation Notice if Missing Values */}
          {!completenessValidation.isComplete && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Validation Alert:</strong> {completenessValidation.missingCount} cell
                  combinations have missing values. Every combination must contain a numeric value
                  before this matrix can be Approved (zero <code>0.00%</code> is valid and allowed).
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Auto-fill empty cells with 0.00%
                  const filled = matrixData.map((row) => ({
                    ...row,
                    cashImmediate: row.cashImmediate ?? 0.0,
                    creditLt15: row.creditLt15 ?? 0.0,
                    creditLt30: row.creditLt30 ?? 0.0,
                    creditLte45: row.creditLte45 ?? 0.0,
                    creditGt45: row.creditGt45 ?? 0.0,
                  }));
                  setMatrixData(filled);
                  toast.info("Populated missing cells with 0.00%", {
                    description: "Zero values are recognized as valid minimum commission tiers.",
                  });
                }}
                className="h-7 text-xs bg-background shrink-0"
              >
                Auto-fill Empty with 0.00%
              </Button>
            </div>
          )}

          {/* Matrix Grid Table */}
          <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b text-muted-foreground font-semibold">
                    <th className="py-3 px-4 w-[160px] border-r">Capacity Band</th>
                    <th className="py-3 px-4 w-[200px] border-r">Item Type</th>
                    <th className="py-3 px-4 text-right border-r bg-emerald-500/5">
                      <div className="flex flex-col items-end">
                        <span className="text-foreground">Cash / Immediate Cheque</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          Day 0 (Full Rate)
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right border-r">
                      <div className="flex flex-col items-end">
                        <span className="text-foreground">Credit &lt; 15 days</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          1 - 14 Days
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right border-r">
                      <div className="flex flex-col items-end">
                        <span className="text-foreground">Credit &lt; 30 days</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          15 - 29 Days
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right border-r">
                      <div className="flex flex-col items-end">
                        <span className="text-foreground">Credit ≤ 45 days</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          30 - 45 Days
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right bg-amber-500/5">
                      <div className="flex flex-col items-end">
                        <span className="text-foreground">Credit &gt; 45 days</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          46+ Days (Degraded)
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-3 w-[60px] text-center border-l">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No product dimension records match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMatrix.map((row, rowIdx) => {
                      // Find real index in matrixData for edits
                      const originalIndex = matrixData.findIndex(
                        (r) => r.capacityBand === row.capacityBand && r.itemType === row.itemType,
                      );

                      return (
                        <tr
                          key={`${row.capacityBand}-${row.itemType}`}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-foreground border-r bg-muted/10">
                            {row.capacityBand}
                          </td>
                          <td className="py-3 px-4 text-foreground border-r font-medium">
                            {row.itemType}
                          </td>

                          {/* Column 1: Cash / Immediate Cheque */}
                          <td
                            onClick={() =>
                              handleCellClick(originalIndex, "cashImmediate", row.cashImmediate)
                            }
                            className={`py-2.5 px-4 text-right font-mono border-r transition-colors ${
                              status === "Draft" ? "cursor-pointer hover:bg-primary/5" : ""
                            } ${
                              row.cashImmediate === null
                                ? "bg-destructive/10 text-destructive font-bold"
                                : row.cashImmediate === 0
                                  ? "text-muted-foreground bg-muted/20"
                                  : "text-emerald-700 dark:text-emerald-400 font-semibold"
                            }`}
                          >
                            <CellContent
                              val={row.cashImmediate}
                              isEditing={
                                editingCell?.rowIndex === originalIndex &&
                                editingCell?.colKey === "cashImmediate"
                              }
                              editVal={editingCell?.val ?? ""}
                              onEditChange={(v) =>
                                setEditingCell((prev) => (prev ? { ...prev, val: v } : null))
                              }
                              onSave={handleSaveCell}
                              onCancel={() => setEditingCell(null)}
                            />
                          </td>

                          {/* Column 2: Credit < 15 days */}
                          <td
                            onClick={() =>
                              handleCellClick(originalIndex, "creditLt15", row.creditLt15)
                            }
                            className={`py-2.5 px-4 text-right font-mono border-r transition-colors ${
                              status === "Draft" ? "cursor-pointer hover:bg-primary/5" : ""
                            } ${
                              row.creditLt15 === null
                                ? "bg-destructive/10 text-destructive font-bold"
                                : row.creditLt15 === 0
                                  ? "text-muted-foreground bg-muted/20"
                                  : "text-foreground"
                            }`}
                          >
                            <CellContent
                              val={row.creditLt15}
                              isEditing={
                                editingCell?.rowIndex === originalIndex &&
                                editingCell?.colKey === "creditLt15"
                              }
                              editVal={editingCell?.val ?? ""}
                              onEditChange={(v) =>
                                setEditingCell((prev) => (prev ? { ...prev, val: v } : null))
                              }
                              onSave={handleSaveCell}
                              onCancel={() => setEditingCell(null)}
                            />
                          </td>

                          {/* Column 3: Credit < 30 days */}
                          <td
                            onClick={() =>
                              handleCellClick(originalIndex, "creditLt30", row.creditLt30)
                            }
                            className={`py-2.5 px-4 text-right font-mono border-r transition-colors ${
                              status === "Draft" ? "cursor-pointer hover:bg-primary/5" : ""
                            } ${
                              row.creditLt30 === null
                                ? "bg-destructive/10 text-destructive font-bold"
                                : row.creditLt30 === 0
                                  ? "text-muted-foreground bg-muted/20"
                                  : "text-foreground"
                            }`}
                          >
                            <CellContent
                              val={row.creditLt30}
                              isEditing={
                                editingCell?.rowIndex === originalIndex &&
                                editingCell?.colKey === "creditLt30"
                              }
                              editVal={editingCell?.val ?? ""}
                              onEditChange={(v) =>
                                setEditingCell((prev) => (prev ? { ...prev, val: v } : null))
                              }
                              onSave={handleSaveCell}
                              onCancel={() => setEditingCell(null)}
                            />
                          </td>

                          {/* Column 4: Credit ≤ 45 days */}
                          <td
                            onClick={() =>
                              handleCellClick(originalIndex, "creditLte45", row.creditLte45)
                            }
                            className={`py-2.5 px-4 text-right font-mono border-r transition-colors ${
                              status === "Draft" ? "cursor-pointer hover:bg-primary/5" : ""
                            } ${
                              row.creditLte45 === null
                                ? "bg-destructive/10 text-destructive font-bold"
                                : row.creditLte45 === 0
                                  ? "text-muted-foreground bg-muted/20"
                                  : "text-foreground"
                            }`}
                          >
                            <CellContent
                              val={row.creditLte45}
                              isEditing={
                                editingCell?.rowIndex === originalIndex &&
                                editingCell?.colKey === "creditLte45"
                              }
                              editVal={editingCell?.val ?? ""}
                              onEditChange={(v) =>
                                setEditingCell((prev) => (prev ? { ...prev, val: v } : null))
                              }
                              onSave={handleSaveCell}
                              onCancel={() => setEditingCell(null)}
                            />
                          </td>

                          {/* Column 5: Credit > 45 days */}
                          <td
                            onClick={() =>
                              handleCellClick(originalIndex, "creditGt45", row.creditGt45)
                            }
                            className={`py-2.5 px-4 text-right font-mono transition-colors ${
                              status === "Draft" ? "cursor-pointer hover:bg-primary/5" : ""
                            } ${
                              row.creditGt45 === null
                                ? "bg-destructive/10 text-destructive font-bold"
                                : row.creditGt45 === 0
                                  ? "text-muted-foreground bg-amber-500/5 font-semibold"
                                  : "text-amber-700 dark:text-amber-400 font-semibold"
                            }`}
                          >
                            <CellContent
                              val={row.creditGt45}
                              isEditing={
                                editingCell?.rowIndex === originalIndex &&
                                editingCell?.colKey === "creditGt45"
                              }
                              editVal={editingCell?.val ?? ""}
                              onEditChange={(v) =>
                                setEditingCell((prev) => (prev ? { ...prev, val: v } : null))
                              }
                              onSave={handleSaveCell}
                              onCancel={() => setEditingCell(null)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Legend */}
            <div className="p-4 border-t bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Cash / Immediate Rate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground" />
                  Standard Credit Terms
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Late / Degraded Tier (&gt;45d)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" />
                  0.00% Zero (Allowed &amp; Valid)
                </span>
              </div>
              <div>
                Showing <strong>{filteredMatrix.length}</strong> of{" "}
                <strong>{matrixData.length}</strong> product dimension rows
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: BANDS TAB                                                   */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="bands" className="space-y-4 pt-1">
          {/* Overlap Status Banner */}
          {bandOverlapError ? (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-xs text-destructive flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-sm mb-1">
                  Payment-Term Bands Overlap Detected
                </strong>
                <p>{bandOverlapError}</p>
                <p className="mt-1 text-muted-foreground">
                  Validations require non-overlapping day ranges so each sales invoice falls into
                  exactly one distinct aging category.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Bands Configuration Valid:</strong> All 5 credit-age and payment term bands
                are sequentially ordered without any overlapping day brackets.
              </span>
            </div>
          )}

          {/* Bands Table */}
          <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  Configured Payment-Term &amp; Credit-Age Bands
                </h3>
                <p className="text-xs text-muted-foreground">
                  Defines the column dimension boundaries mapping invoice debtor payment lag to rate
                  column multipliers.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={status === "Approved"}
                onClick={() => {
                  setEditingBand({
                    id: `band-${Date.now()}`,
                    name: "New Credit Tier",
                    columnKey: "creditLt30",
                    minDays: 46,
                    maxDays: 60,
                    description: "Custom intermediate tier",
                    defaultFactor: 0.5,
                  });
                  setShowEditBandModal(true);
                }}
                className="h-8 text-xs gap-1.5 cursor-pointer bg-background"
              >
                <Plus size={14} />
                <span>Add Band Tier</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b text-muted-foreground font-semibold">
                    <th className="py-3 px-4 w-[60px]">Seq</th>
                    <th className="py-3 px-4 w-[220px]">Band Column Name</th>
                    <th className="py-3 px-4 w-[120px]">Day Range</th>
                    <th className="py-3 px-4">Aging Criteria &amp; Rules</th>
                    <th className="py-3 px-4 w-[140px] text-right">Target Multiplier</th>
                    <th className="py-3 px-4 w-[100px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bands.map((b, index) => (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-muted-foreground">#{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{b.name}</td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {b.minDays === 0 && b.maxDays === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
                            0 Days (Cash)
                          </span>
                        ) : b.maxDays >= 900 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">
                            &gt; {b.minDays - 1} Days
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-muted text-foreground">
                            {b.minDays} – {b.maxDays} Days
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{b.description}</td>
                      <td className="py-3 px-4 font-mono text-right font-medium text-foreground">
                        {(b.defaultFactor * 100).toFixed(0)}% Basis
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={status === "Approved"}
                          onClick={() => {
                            setEditingBand(b);
                            setShowEditBandModal(true);
                          }}
                          className="h-7 text-xs px-2 text-primary hover:bg-primary/10"
                        >
                          <Edit2 size={13} className="mr-1" /> Configure
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: HISTORY TAB                                                 */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="history" className="space-y-4 pt-1">
          <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  Rate Matrix Audit Trail &amp; Version History
                </h3>
                <p className="text-xs text-muted-foreground">
                  Complete chronological trace of matrix drafts, Excel imports, rate adjustments and
                  authorized approvals.
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Total Audit Events: {history.length}
              </span>
            </div>

            <div className="divide-y divide-border">
              {history.map((record) => (
                <div key={record.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border">
                        {record.version}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          record.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {record.status}
                      </span>
                      <span className="font-medium text-xs text-foreground">
                        {record.changeSummary}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>{record.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{record.details}</p>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span>
                      Actor: <strong className="text-foreground">{record.author}</strong> (
                      {record.role})
                    </span>
                    <span>•</span>
                    <span>
                      Action ID: <code>{record.id}</code>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* -------------------------------------------------------------------- */}
      {/* DIALOG 1: EXCEL IMPORT MODAL                                         */}
      {/* -------------------------------------------------------------------- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="text-primary" size={18} />
                  Import Excel into Draft Rate Matrix
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Load matrix rates from a spreadsheet (.xlsx) into current draft ({selectedVersion}
                  ).
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Dropzone mock */}
              <div className="border-2 border-dashed border-input rounded-lg p-6 text-center space-y-2 bg-muted/20 hover:bg-muted/40 transition-colors">
                <Upload size={28} className="mx-auto text-primary" />
                <div className="font-medium text-foreground">
                  Drag and drop Excel spreadsheet here, or click to browse
                </div>
                <div className="text-muted-foreground text-[11px]">
                  Supports .xlsx, .xls formatted with headers: Capacity Band, Item Type, Cash,
                  &lt;15d, &lt;30d, ≤45d, &gt;45d
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImportFileName("Solar_Equipment_RateMatrix_Q4_2026.xlsx");
                    setImportPreviewCount(12);
                    toast.success(
                      "Excel template parsed: Solar_Equipment_RateMatrix_Q4_2026.xlsx",
                      {
                        description: "Found 12 dimension rows and 60 rate intersections.",
                      },
                    );
                  }}
                  className="mt-2 text-xs h-8 cursor-pointer bg-background"
                >
                  Load Sample Master Spreadsheet
                </Button>
              </div>

              {importFileName && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Ready to parse: {importFileName}
                    </span>
                    <span>{importPreviewCount} Rows</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Validation Check: Column dimensions match required 5 payment-term headers. Zero
                    values properly preserved.
                  </p>
                </div>
              )}

              <div className="bg-muted/40 p-3 rounded-lg text-muted-foreground space-y-1">
                <strong>Import Rules:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Importing will overwrite existing draft matrix cell values.</li>
                  <li>Every row-column intersection must contain a number (0% allowed).</li>
                  <li>Existing active/approved versions in SAP are unaffected until posted.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSimulateImport}
                disabled={!importFileName}
                className="text-xs h-8 cursor-pointer gap-1.5 bg-primary text-primary-foreground"
              >
                <Check size={14} />
                <span>Apply to Draft Matrix</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIALOG 2: EXPORT MODAL                                         */}
      {/* ------------------------------------------------------------- */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Download className="text-primary" size={18} />
                  Export Commission Rate Matrix
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate authorized reports for Scheme: {selectedScheme} ({selectedVersion})
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div
                onClick={handleExportExcel}
                className="p-3 border rounded-lg hover:border-primary cursor-pointer hover:bg-primary/5 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Export as Excel Workbook (.xlsx)
                  </h4>
                  <p className="text-muted-foreground text-[11px]">
                    Includes active matrix grid, aging band definitions and full audit log.
                  </p>
                </div>
              </div>

              <div
                onClick={handleExportPDF}
                className="p-3 border rounded-lg hover:border-primary cursor-pointer hover:bg-primary/5 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                  <Printer size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Export Printable PDF Document</h4>
                  <p className="text-muted-foreground text-[11px]">
                    Official rate schedule with executive signature blocks and stamp lines.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIALOG 3: CONFIGURE BAND MODAL                                 */}
      {/* ------------------------------------------------------------- */}
      {showEditBandModal && editingBand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Sliders className="text-primary" size={18} />
                  Configure Payment-Term Band
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adjust bracket min/max days. Bands must not overlap!
                </p>
              </div>
              <button
                onClick={() => setShowEditBandModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Band Name</label>
                <input
                  type="text"
                  value={editingBand.name}
                  onChange={(e) => setEditingBand({ ...editingBand, name: e.target.value })}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Min Days</label>
                  <input
                    type="number"
                    value={editingBand.minDays}
                    onChange={(e) =>
                      setEditingBand({
                        ...editingBand,
                        minDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs rounded-md border border-input bg-background px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Max Days</label>
                  <input
                    type="number"
                    value={editingBand.maxDays}
                    onChange={(e) =>
                      setEditingBand({
                        ...editingBand,
                        maxDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs rounded-md border border-input bg-background px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Description / Aging Notes
                </label>
                <textarea
                  rows={2}
                  value={editingBand.description}
                  onChange={(e) => setEditingBand({ ...editingBand, description: e.target.value })}
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditBandModal(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Save band
                  const updatedBands = bands.map((b) =>
                    b.id === editingBand.id ? editingBand : b,
                  );
                  setBands(updatedBands);
                  setShowEditBandModal(false);
                  toast.success(`Band configuration saved: ${editingBand.name}`);
                }}
                className="text-xs h-8 cursor-pointer bg-primary text-primary-foreground"
              >
                Save Band
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIALOG 4: APPROVAL CONFIRMATION MODAL                          */}
      {/* ------------------------------------------------------------- */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Shield className="text-emerald-600" size={18} />
                  Approve Commission Rate Matrix ({selectedVersion})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm formal verification and transition from Draft to Approved.
                </p>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Validation Check Passed
                </div>
                <p className="text-[11px]">
                  All {completenessValidation.totalCells} matrix combinations are populated
                  (including valid zero values), and no payment-term bands overlap.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Scheme Code</span>
                  <span className="font-semibold text-foreground">{selectedScheme}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Version</span>
                  <span className="font-semibold text-foreground">{selectedVersion}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Rate Unit</span>
                  <span className="font-semibold text-foreground">{rateUnit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Currency</span>
                  <span className="font-semibold text-foreground">{currency}</span>
                </div>
              </div>

              <p className="text-muted-foreground text-[11px]">
                Upon approval, this rate matrix will be locked from inline editing. Subsequent
                adjustments will require creating a new draft version.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApprovalModal(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApproveMatrix}
                className="text-xs h-8 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Confirm &amp; Approve Matrix
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Cell Content Helper Component with Inline Editing
// ----------------------------------------------------------------------------
function CellContent({
  val,
  isEditing,
  editVal,
  onEditChange,
  onSave,
  onCancel,
}: {
  val: number | null;
  isEditing: boolean;
  editVal: string;
  onEditChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (isEditing) {
    return (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="number"
          step="0.05"
          value={editVal}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
          autoFocus
          className="w-16 px-1.5 py-0.5 text-right text-xs rounded border border-primary bg-background focus:outline-hidden"
          placeholder="0.00"
        />
        <button
          onClick={onSave}
          className="p-1 rounded bg-primary text-primary-foreground hover:opacity-90"
          title="Save rate"
        >
          <Check size={11} />
        </button>
        <button
          onClick={onCancel}
          className="p-1 rounded bg-muted text-muted-foreground hover:bg-muted/80"
          title="Cancel"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  if (val === null || val === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-destructive italic">
        <AlertCircle size={11} /> Missing
      </span>
    );
  }

  return <span>{val.toFixed(2)}%</span>;
}
