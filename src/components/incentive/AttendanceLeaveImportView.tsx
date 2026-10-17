import React, { useState, useMemo } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  Calendar,
  Layers,
  History as HistoryIcon,
  ChevronRight,
  Lock,
  Unlock,
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
  ClipboardPaste,
  FileCheck,
  Wrench,
  Search,
  Filter,
  Download,
  Printer,
  UserCheck,
  HelpCircle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export type ImportStatus = "Draft" | "Validated" | "Approved";
export type UserRole = "HR" | "Service Coordinator";

export interface AttendanceRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  role: string;
  division: string;
  workingDays: number;
  leaveDays: number;
  absentDays: number;
  attendanceFactor: number; // 1.0 (100%), 0.5 (50%), 0.0 (0%)
  validationStatus: "Valid" | "Error";
  errorMessages: string[];
  notes?: string;
}

export interface MasterTechnician {
  code: string;
  name: string;
  role: string;
  division: string;
  isEligible: boolean;
}

export interface ImportBatchHistory {
  batchId: string;
  period: string;
  division: string;
  source: string;
  importedBy: string;
  importDate: string;
  totalRecords: number;
  validRecords: number;
  errorRecords: number;
  status: ImportStatus;
  notes: string;
}

// Master Employee Roster for Validation
const TECHNICIAN_MASTER_ROSTER: MasterTechnician[] = [
  {
    code: "EMP-1021",
    name: "Kasun Jayawardena",
    role: "Senior Service Technician",
    division: "Consumer Electronics",
    isEligible: true,
  },
  {
    code: "EMP-1022",
    name: "Pradeep Bandara",
    role: "Field Service Technician",
    division: "Consumer Electronics",
    isEligible: true,
  },
  {
    code: "EMP-1023",
    name: "Ruwan Wijesinghe",
    role: "AC & Refrigeration Technician",
    division: "Commercial Air Conditioning",
    isEligible: true,
  },
  {
    code: "EMP-1024",
    name: "Dilshan Madusanka",
    role: "Junior Service Tech",
    division: "Consumer Electronics",
    isEligible: true,
  },
  {
    code: "EMP-1025",
    name: "Nuwan Fernando",
    role: "Solar PV Maintenance Tech",
    division: "Renewable Energy",
    isEligible: true,
  },
  {
    code: "EMP-1026",
    name: "Chaminda Warnakula",
    role: "Senior Service Technician",
    division: "Consumer Electronics",
    isEligible: true,
  },
  {
    code: "EMP-1027",
    name: "Sajith Gunaratne",
    role: "Retail Sales Consultant",
    division: "Consumer Electronics",
    isEligible: false, // Ineligible role
  },
  {
    code: "EMP-1028",
    name: "Anura Senanayake",
    role: "Showroom Cashier",
    division: "Consumer Electronics",
    isEligible: false, // Ineligible role
  },
  {
    code: "EMP-1029",
    name: "Dinesh Priyashantha",
    role: "Field Service Technician",
    division: "Consumer Electronics",
    isEligible: true,
  },
  {
    code: "EMP-1030",
    name: "Mahesh Gunawardena",
    role: "AC & Refrigeration Technician",
    division: "Commercial Air Conditioning",
    isEligible: true,
  },
  {
    code: "EMP-1031",
    name: "Niroshan De Silva",
    role: "Diagnostic Specialist",
    division: "Commercial Air Conditioning",
    isEligible: true,
  },
  {
    code: "EMP-1032",
    name: "Sunil Jayasuriya",
    role: "Solar PV Maintenance Tech",
    division: "Renewable Energy",
    isEligible: true,
  },
  {
    code: "EMP-1033",
    name: "Tharindu Wickramasinghe",
    role: "Junior Service Tech",
    division: "Renewable Energy",
    isEligible: true,
  },
  {
    code: "EMP-1034",
    name: "Roshana Weerasinghe",
    role: "Field Service Technician",
    division: "Consumer Electronics",
    isEligible: true,
  },
  {
    code: "EMP-1035",
    name: "Chathura Gamage",
    role: "Senior Service Technician",
    division: "Consumer Electronics",
    isEligible: true,
  },
];

// Helper: Calculate proposed attendance factor according to INC-BCR-10:
// "The documented proposed attendance factor is 100% for 0–1 absent days, 50% for 2 days and 0% for 3 or more days."
export function calculateProposedAttendanceFactor(absentDays: number): number {
  if (absentDays <= 1) {
    return 1.0;
  }
  if (absentDays === 2) {
    return 0.5;
  }
  return 0.0;
}

// Initial Mock Attendance Records for May 2026
const INITIAL_ATTENDANCE_DATA: AttendanceRecord[] = [
  {
    id: "att-1",
    employeeCode: "EMP-1021",
    employeeName: "Kasun Jayawardena",
    role: "Senior Service Technician",
    division: "Consumer Electronics",
    workingDays: 22,
    leaveDays: 2,
    absentDays: 0,
    attendanceFactor: 1.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "Perfect attendance, full factor applied",
  },
  {
    id: "att-2",
    employeeCode: "EMP-1022",
    employeeName: "Pradeep Bandara",
    role: "Field Service Technician",
    division: "Consumer Electronics",
    workingDays: 21,
    leaveDays: 2,
    absentDays: 1,
    attendanceFactor: 1.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "1 unapproved absent day (within 0-1 allowance: 100%)",
  },
  {
    id: "att-3",
    employeeCode: "EMP-1023",
    employeeName: "Ruwan Wijesinghe",
    role: "AC & Refrigeration Technician",
    division: "Commercial Air Conditioning",
    workingDays: 20,
    leaveDays: 2,
    absentDays: 2,
    attendanceFactor: 0.5,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "2 absent days (50% factor applied)",
  },
  {
    id: "att-4",
    employeeCode: "EMP-1024",
    employeeName: "Dilshan Madusanka",
    role: "Junior Service Tech",
    division: "Consumer Electronics",
    workingDays: 18,
    leaveDays: 3,
    absentDays: 3,
    attendanceFactor: 0.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "3 absent days (0% factor applied — forfeiture threshold)",
  },
  {
    id: "att-5",
    employeeCode: "EMP-1025",
    employeeName: "Nuwan Fernando",
    role: "Solar PV Maintenance Tech",
    division: "Renewable Energy",
    workingDays: 23,
    leaveDays: 1,
    absentDays: 0,
    attendanceFactor: 1.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "Full month field deployment",
  },
  {
    id: "att-6",
    employeeCode: "EMP-1026",
    employeeName: "Chaminda Warnakula",
    role: "Senior Service Technician",
    division: "Consumer Electronics",
    workingDays: 21,
    leaveDays: 2,
    absentDays: 1,
    attendanceFactor: 1.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "Within normal limits",
  },
  {
    id: "att-7",
    employeeCode: "EMP-1027",
    employeeName: "Sajith Gunaratne",
    role: "Retail Sales Consultant",
    division: "Consumer Electronics",
    workingDays: 22,
    leaveDays: 1,
    absentDays: 1,
    attendanceFactor: 1.0,
    validationStatus: "Error",
    errorMessages: [
      "Ineligible Role: 'Retail Sales Consultant'. Attendance component applies only to certified field service technicians.",
    ],
    notes: "Imported accidentally from showroom sales payroll",
  },
  {
    id: "att-8",
    employeeCode: "EMP-9999",
    employeeName: "Gamini Wijetunga",
    role: "Contract Technician",
    division: "Consumer Electronics",
    workingDays: 15,
    leaveDays: 0,
    absentDays: 5,
    attendanceFactor: 0.0,
    validationStatus: "Error",
    errorMessages: [
      "Employee code 'EMP-9999' not found in Master Technician roster. Verify employee master record.",
    ],
    notes: "Contractor code unmapped in ERP",
  },
  {
    id: "att-9",
    employeeCode: "EMP-1029",
    employeeName: "Dinesh Priyashantha",
    role: "Field Service Technician",
    division: "Consumer Electronics",
    workingDays: 22,
    leaveDays: 2,
    absentDays: 0,
    attendanceFactor: 1.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "Exemplary punctuality",
  },
  {
    id: "att-10",
    employeeCode: "EMP-1030",
    employeeName: "Mahesh Gunawardena",
    role: "AC & Refrigeration Technician",
    division: "Commercial Air Conditioning",
    workingDays: 21,
    leaveDays: 1,
    absentDays: 2,
    attendanceFactor: 0.5,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "2 days unexcused absence, 50% factor",
  },
  {
    id: "att-11",
    employeeCode: "EMP-1031",
    employeeName: "Niroshan De Silva",
    role: "Diagnostic Specialist",
    division: "Commercial Air Conditioning",
    workingDays: 23,
    leaveDays: 1,
    absentDays: 0,
    attendanceFactor: 1.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "100% factor",
  },
  {
    id: "att-12",
    employeeCode: "EMP-1032",
    employeeName: "Sunil Jayasuriya",
    role: "Solar PV Maintenance Tech",
    division: "Renewable Energy",
    workingDays: 22,
    leaveDays: 2,
    absentDays: 0,
    attendanceFactor: 1.0,
    validationStatus: "Valid",
    errorMessages: [],
    notes: "Full attendance",
  },
];

// Mock Import History
const INITIAL_BATCH_HISTORY: ImportBatchHistory[] = [
  {
    batchId: "BAT-ATT-2026-05A",
    period: "May 2026",
    division: "Consumer Electronics",
    source: "Biometric Punch Terminal (ZKTeco BioTime)",
    importedBy: "Kamal Silva (Service Coordinator)",
    importDate: "12-May-2026 09:15",
    totalRecords: 12,
    validRecords: 10,
    errorRecords: 2,
    status: "Draft",
    notes: "Initial monthly punch clock import for Western Province technicians.",
  },
  {
    batchId: "BAT-ATT-2026-04F",
    period: "April 2026",
    division: "All Service Divisions",
    source: "HRIS Payroll Export (SAP SuccessFactors)",
    importedBy: "Niluka Senaratne (HR Manager)",
    importDate: "28-Apr-2026 16:30",
    totalRecords: 34,
    validRecords: 34,
    errorRecords: 0,
    status: "Approved",
    notes: "Final approved attendance baseline for April incentive distribution.",
  },
  {
    batchId: "BAT-ATT-2026-03B",
    period: "March 2026",
    division: "All Service Divisions",
    source: "Biometric Punch Terminal (ZKTeco BioTime)",
    importedBy: "Niluka Senaratne (HR Manager)",
    importDate: "30-Mar-2026 14:10",
    totalRecords: 32,
    validRecords: 32,
    errorRecords: 0,
    status: "Approved",
    notes: "Closed batch reconciled with SAP B1 journal posting.",
  },
];

interface AttendanceLeaveImportViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function AttendanceLeaveImportView({
  onNavigateScreen,
  onBack,
}: AttendanceLeaveImportViewProps) {
  // Mandatory Header States
  const [period, setPeriod] = useState<string>("May 2026");
  const [division, setDivision] = useState<string>("Consumer Electronics");
  const [source, setSource] = useState<string>("Biometric Punch Terminal (ZKTeco BioTime)");
  const [status, setStatus] = useState<ImportStatus>("Draft");

  // User Role Switcher (HR vs Service Coordinator)
  const [activeRole, setActiveRole] = useState<UserRole>("Service Coordinator");

  // Active Tab: "lines" or "errors"
  const [activeTab, setActiveTab] = useState<string>("lines");

  // Table Data State
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_DATA);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterValidation, setFilterValidation] = useState<"All" | "Valid" | "Error">("All");
  const [filterFactor, setFilterFactor] = useState<string>("All");

  // Modals & Drawers
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Paste Textarea State
  const [pasteRawText, setPasteRawText] = useState<string>("");
  const [pasteParsedRows, setPasteParsedRows] = useState<Partial<AttendanceRecord>[]>([]);

  // Import File Drag & Demo Select State
  const [selectedFilePreset, setSelectedFilePreset] = useState<string>("clean");
  const [importPreviewData, setImportPreviewData] = useState<AttendanceRecord[]>([]);

  // Form for New Line / Manual Add
  const [newLineForm, setNewLineForm] = useState<{
    employeeCode: string;
    workingDays: number;
    leaveDays: number;
    absentDays: number;
    notes: string;
  }>({
    employeeCode: "EMP-1021",
    workingDays: 22,
    leaveDays: 2,
    absentDays: 0,
    notes: "",
  });

  // Calculate live validation diagnostics for any row
  const validateSingleRow = (
    employeeCode: string,
    workingDays: number,
    leaveDays: number,
    absentDays: number,
  ): {
    isValid: boolean;
    errors: string[];
    role: string;
    division: string;
    name: string;
  } => {
    const errors: string[] = [];
    const matchedMaster = TECHNICIAN_MASTER_ROSTER.find(
      (m) => m.code.toUpperCase() === employeeCode.toUpperCase().trim(),
    );

    let name = "Unknown Employee";
    let role = "Unknown Designation";
    let div = division;

    if (!matchedMaster) {
      errors.push(
        `Employee code '${employeeCode}' does not exist in ERP Technician master roster.`,
      );
    } else {
      name = matchedMaster.name;
      role = matchedMaster.role;
      div = matchedMaster.division;

      if (!matchedMaster.isEligible) {
        errors.push(
          `Ineligible Role: '${matchedMaster.role}'. Technician incentive attendance factor is reserved exclusively for Field Service Technicians.`,
        );
      }
    }

    if (workingDays < 0 || leaveDays < 0 || absentDays < 0) {
      errors.push("Day counts (Working, Leave, Absent) cannot be negative numbers.");
    }

    const totalDays = workingDays + leaveDays + absentDays;
    if (totalDays > 31) {
      errors.push(
        `Total days (${totalDays}) exceeds maximum days in calendar month (31). Please verify timesheet math.`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      role,
      division: div,
      name,
    };
  };

  // Re-run validation on whole dataset
  const runValidation = (currentRecords: AttendanceRecord[] = records): AttendanceRecord[] => {
    return currentRecords.map((item) => {
      const res = validateSingleRow(
        item.employeeCode,
        item.workingDays,
        item.leaveDays,
        item.absentDays,
      );
      const factor = calculateProposedAttendanceFactor(item.absentDays);

      return {
        ...item,
        employeeName: res.name !== "Unknown Employee" ? res.name : item.employeeName,
        role: res.role !== "Unknown Designation" ? res.role : item.role,
        division: res.division,
        attendanceFactor: factor,
        validationStatus: res.isValid ? "Valid" : "Error",
        errorMessages: res.errors,
      };
    });
  };

  // Derived validation stats
  const validationStats = useMemo(() => {
    const total = records.length;
    const valid = records.filter((r) => r.validationStatus === "Valid").length;
    const error = records.filter((r) => r.validationStatus === "Error").length;
    const factorSum = records.reduce((acc, r) => acc + r.attendanceFactor, 0);
    const avgFactor = total > 0 ? (factorSum / total) * 100 : 0;
    const totalAbsents = records.reduce((acc, r) => acc + r.absentDays, 0);

    return {
      total,
      valid,
      error,
      avgFactor: avgFactor.toFixed(1),
      totalAbsents,
    };
  }, [records]);

  // Filtered Lines
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.employeeCode.toLowerCase().includes(q) ||
        r.employeeName.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q);

      const matchStatus = filterValidation === "All" || r.validationStatus === filterValidation;

      let matchFactor = true;
      if (filterFactor === "100%") matchFactor = r.attendanceFactor === 1.0;
      else if (filterFactor === "50%") matchFactor = r.attendanceFactor === 0.5;
      else if (filterFactor === "0%") matchFactor = r.attendanceFactor === 0.0;

      return matchQuery && matchStatus && matchFactor;
    });
  }, [records, searchQuery, filterValidation, filterFactor]);

  // Error lines exclusively
  const errorRecords = useMemo(() => {
    return records.filter((r) => r.validationStatus === "Error");
  }, [records]);

  // Action: Trigger Line Validation
  const handleValidateLines = () => {
    const updated = runValidation(records);
    setRecords(updated);

    const errorCount = updated.filter((r) => r.validationStatus === "Error").length;
    if (errorCount === 0) {
      setStatus("Validated");
      toast.success("Validation Successful: All lines verified!", {
        description: `${updated.length} records checked against ERP Technician roster. Ready for HR sign-off.`,
      });
    } else {
      toast.error(`Validation Completed with ${errorCount} Errors`, {
        description: "Review flagged rows in the 'Errors' tab before proceeding to HR approval.",
      });
    }
  };

  // Action: Approve as HR
  const handleApproveAsHr = () => {
    if (activeRole !== "HR") {
      toast.error("HR Authorization Required", {
        description:
          "Only users with the HR role have permission to approve attendance records for incentive payout. Switch to 'HR' role above to sign off.",
      });
      return;
    }

    if (validationStats.error > 0) {
      toast.error("Cannot Approve Batch with Active Errors", {
        description: `There are ${validationStats.error} line errors. Remove or correct invalid rows before approving.`,
      });
      return;
    }

    setStatus("Approved");
    setIsApproveModalOpen(false);
    toast.success("Attendance Batch Approved by HR Manager", {
      description: `Period ${period} (${division}) locked and approved for Service Performance computation.`,
    });
  };

  // Action: Re-open to Draft
  const handleReopenDraft = () => {
    setStatus("Draft");
    toast.info("Batch Re-opened to Draft Status", {
      description: "Modifications, imports, and line edits are now enabled.",
    });
  };

  // Action: Delete row
  const handleDeleteRow = (id: string) => {
    if (status !== "Draft") {
      toast.warning("Batch is locked", {
        description: "Re-open to Draft status to edit or delete lines.",
      });
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.info("Line removed from import table.");
  };

  // Action: Save Edit Line Modal
  const handleSaveEditRow = () => {
    if (!editingRecord) return;
    const factor = calculateProposedAttendanceFactor(editingRecord.absentDays);
    const diag = validateSingleRow(
      editingRecord.employeeCode,
      editingRecord.workingDays,
      editingRecord.leaveDays,
      editingRecord.absentDays,
    );

    const updatedRow: AttendanceRecord = {
      ...editingRecord,
      attendanceFactor: factor,
      validationStatus: diag.isValid ? "Valid" : "Error",
      errorMessages: diag.errors,
      role: diag.role !== "Unknown Designation" ? diag.role : editingRecord.role,
      employeeName: diag.name !== "Unknown Employee" ? diag.name : editingRecord.employeeName,
    };

    setRecords((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
    setEditingRecord(null);
    toast.success(`Updated line for ${updatedRow.employeeName}`);
  };

  // Action: Add New Line
  const handleAddNewLine = () => {
    const diag = validateSingleRow(
      newLineForm.employeeCode,
      newLineForm.workingDays,
      newLineForm.leaveDays,
      newLineForm.absentDays,
    );
    const factor = calculateProposedAttendanceFactor(newLineForm.absentDays);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeCode: newLineForm.employeeCode,
      employeeName: diag.name,
      role: diag.role,
      division: diag.division,
      workingDays: newLineForm.workingDays,
      leaveDays: newLineForm.leaveDays,
      absentDays: newLineForm.absentDays,
      attendanceFactor: factor,
      validationStatus: diag.isValid ? "Valid" : "Error",
      errorMessages: diag.errors,
      notes: newLineForm.notes || "Manually added record",
    };

    setRecords((prev) => [newRecord, ...prev]);
    setIsAddLineModalOpen(false);
    toast.success(`Added attendance record for ${newRecord.employeeName}`);
  };

  // Action: Parse Clipboard Paste
  const handleParsePaste = () => {
    if (!pasteRawText.trim()) {
      toast.error("Paste area is empty. Please paste text from Excel or Google Sheets.");
      return;
    }

    const lines = pasteRawText.trim().split("\n");
    const parsed: Partial<AttendanceRecord>[] = [];

    lines.forEach((line, idx) => {
      // Split by tab or comma
      const cols = line.includes("\t") ? line.split("\t") : line.split(",").map((c) => c.trim());

      if (cols.length >= 3) {
        // Skip header if line starts with employee or code
        const first = cols[0]?.toLowerCase().trim() || "";
        if (first.includes("emp") && first.includes("code")) return;

        const code = cols[0]?.trim() || `EMP-${1030 + idx}`;
        const nameCandidate = cols.length >= 4 ? cols[1]?.trim() : "";
        const workDays = parseFloat(cols.length >= 4 ? cols[2] || "0" : cols[1] || "0") || 22;
        const leaveDays = parseFloat(cols.length >= 4 ? cols[3] || "0" : cols[2] || "0") || 0;
        const absentDays = parseFloat(cols.length >= 5 ? cols[4] || "0" : cols[3] || "0") || 0;

        parsed.push({
          id: `paste-${Date.now()}-${idx}`,
          employeeCode: code,
          employeeName: nameCandidate || "From Clipboard",
          workingDays: workDays,
          leaveDays: leaveDays,
          absentDays: absentDays,
        });
      }
    });

    if (parsed.length === 0) {
      toast.error(
        "Could not parse columns. Ensure at least: EmployeeCode, WorkingDays, LeaveDays, AbsentDays",
      );
      return;
    }

    setPasteParsedRows(parsed);
    toast.info(`Parsed ${parsed.length} rows. Review preview below and commit.`);
  };

  // Commit Pasted Rows to Table
  const handleCommitPastedRows = () => {
    const newItems: AttendanceRecord[] = pasteParsedRows.map((p, idx) => {
      const code = p.employeeCode || `EMP-${1040 + idx}`;
      const workDays = p.workingDays ?? 22;
      const leaveDays = p.leaveDays ?? 0;
      const absentDays = p.absentDays ?? 0;

      const diag = validateSingleRow(code, workDays, leaveDays, absentDays);
      const factor = calculateProposedAttendanceFactor(absentDays);

      return {
        id: `att-p-${Date.now()}-${idx}`,
        employeeCode: code,
        employeeName:
          diag.name !== "Unknown Employee" ? diag.name : p.employeeName || "Imported Staff",
        role: diag.role !== "Unknown Designation" ? diag.role : "Field Service Technician",
        division: diag.division,
        workingDays: workDays,
        leaveDays: leaveDays,
        absentDays: absentDays,
        attendanceFactor: factor,
        validationStatus: diag.isValid ? "Valid" : "Error",
        errorMessages: diag.errors,
        notes: "Imported via clipboard paste",
      };
    });

    setRecords((prev) => [...newItems, ...prev]);
    setIsPasteModalOpen(false);
    setPasteRawText("");
    setPasteParsedRows([]);
    toast.success(`Successfully imported ${newItems.length} records from clipboard!`);
  };

  // Action: Load Mock Excel Preset
  const handleLoadExcelPreset = (presetKey: string) => {
    setSelectedFilePreset(presetKey);

    if (presetKey === "clean") {
      const cleanRows: AttendanceRecord[] = TECHNICIAN_MASTER_ROSTER.filter(
        (t) => t.isEligible,
      ).map((tech, idx) => {
        const absents = idx % 5 === 0 ? 1 : 0;
        return {
          id: `clean-${idx}`,
          employeeCode: tech.code,
          employeeName: tech.name,
          role: tech.role,
          division: tech.division,
          workingDays: 22 - absents,
          leaveDays: 2,
          absentDays: absents,
          attendanceFactor: calculateProposedAttendanceFactor(absents),
          validationStatus: "Valid",
          errorMessages: [],
          notes: "Biometric terminal log verified",
        };
      });
      setImportPreviewData(cleanRows);
    } else if (presetKey === "with-exceptions") {
      const mixedRows: AttendanceRecord[] = [
        ...INITIAL_ATTENDANCE_DATA.slice(0, 5),
        {
          id: `exc-1`,
          employeeCode: "EMP-1028",
          employeeName: "Anura Senanayake",
          role: "Showroom Cashier",
          division: "Consumer Electronics",
          workingDays: 22,
          leaveDays: 1,
          absentDays: 1,
          attendanceFactor: 1.0,
          validationStatus: "Error",
          errorMessages: [
            "Ineligible Role: 'Showroom Cashier'. Incentive attendance factor applies only to field service technicians.",
          ],
          notes: "Imported from retail branch punch record",
        },
        {
          id: `exc-2`,
          employeeCode: "EMP-9002",
          employeeName: "Saman Kumara",
          role: "External Trainee",
          division: "Consumer Electronics",
          workingDays: 18,
          leaveDays: 0,
          absentDays: 4,
          attendanceFactor: 0.0,
          validationStatus: "Error",
          errorMessages: ["Employee code 'EMP-9002' not recognized in ERP master."],
          notes: "Non-rostered trainee",
        },
      ];
      setImportPreviewData(mixedRows);
    } else if (presetKey === "high-absent") {
      const highAbsentRows: AttendanceRecord[] = TECHNICIAN_MASTER_ROSTER.filter(
        (t) => t.isEligible,
      )
        .slice(0, 8)
        .map((tech, idx) => {
          const absents = (idx % 4) + 1; // 1, 2, 3, 4
          return {
            id: `ha-${idx}`,
            employeeCode: tech.code,
            employeeName: tech.name,
            role: tech.role,
            division: tech.division,
            workingDays: 22 - absents,
            leaveDays: 1,
            absentDays: absents,
            attendanceFactor: calculateProposedAttendanceFactor(absents),
            validationStatus: "Valid",
            errorMessages: [],
            notes: `High absence test (${absents} days, factor: ${calculateProposedAttendanceFactor(absents) * 100}%)`,
          };
        });
      setImportPreviewData(highAbsentRows);
    }
  };

  // Commit Excel Import to State
  const handleCommitExcelImport = () => {
    if (importPreviewData.length === 0) {
      toast.warning("No records selected in preview.");
      return;
    }
    setRecords(importPreviewData);
    setIsImportModalOpen(false);
    toast.success(`Imported ${importPreviewData.length} records into ${period} draft.`);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Quick Navigation Bar to Related Screens                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-lg border text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wrench size={14} className="text-primary" />
          <span className="font-semibold text-foreground">Service Technician Incentive Chain:</span>
          <span className="hidden sm:inline">
            Attendance factor directly scales technician First-Time Fix (FTF) & job throughput
            payouts.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateScreen && (
            <>
              {/* PRIMARY SPECIFIED NAVIGATION TO SERVICE PERFORMANCE */}
              <Button
                size="sm"
                onClick={() => onNavigateScreen("service-performance")}
                className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer shadow-xs"
              >
                <Wrench size={13} />
                <span>Service Performance Data</span>
                <ChevronRight size={12} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("participant-profile")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <Users size={13} className="text-primary" />
                <span>Participants</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("scheme-master")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <Award size={13} className="text-primary" />
                <span>Scheme Master</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Top Header & Mandatory Fields Section                      */}
      {/* ------------------------------------------------------------- */}
      <div className="card-surface p-4 sm:p-5 rounded-lg border bg-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Attendance and Leave Import
              </h2>

              {/* Status Indicator */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  status === "Approved"
                    ? "bg-success/10 text-success border-success/30"
                    : status === "Validated"
                      ? "bg-info/10 text-info border-info/30"
                      : "bg-warning/10 text-warning border-warning/30"
                }`}
              >
                {status === "Approved" ? (
                  <CheckCircle2 size={13} />
                ) : status === "Validated" ? (
                  <FileCheck size={13} />
                ) : (
                  <Clock size={13} />
                )}
                <span>Status: {status}</span>
              </span>

              {/* Role Simulation Switcher */}
              <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-md border text-xs">
                <span className="text-muted-foreground font-medium">Acting Role:</span>
                <button
                  onClick={() => setActiveRole("Service Coordinator")}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeRole === "Service Coordinator"
                      ? "bg-card text-foreground shadow-xs border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Service Coordinator
                </button>
                <span className="text-muted-foreground/40">|</span>
                <button
                  onClick={() => setActiveRole("HR")}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeRole === "HR"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  HR Manager
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Import or paste monthly attendance and leave information per technician for the
              attendance component.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Import History */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
            >
              <HistoryIcon size={13} className="text-muted-foreground" />
              <span>Import History</span>
            </Button>

            {status === "Draft" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLoadExcelPreset("clean");
                    setIsImportModalOpen(true);
                  }}
                  className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent text-primary"
                >
                  <UploadCloud size={13} />
                  <span>Import Excel</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPasteModalOpen(true)}
                  className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
                >
                  <ClipboardPaste size={13} />
                  <span>Paste Records</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddLineModalOpen(true)}
                  className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
                >
                  <Plus size={13} />
                  <span>Add Line</span>
                </Button>
              </>
            )}

            {/* Validate Lines Action */}
            {status === "Draft" && (
              <Button
                size="sm"
                onClick={handleValidateLines}
                className="h-8 gap-1.5 text-xs font-semibold bg-info text-info-foreground hover:bg-info/90 cursor-pointer shadow-xs"
              >
                <FileCheck size={13} />
                <span>Validate Lines</span>
              </Button>
            )}

            {/* Approve as HR Action */}
            {status === "Validated" && (
              <Button
                size="sm"
                onClick={() => setIsApproveModalOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold bg-success text-success-foreground hover:bg-success/90 cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={13} />
                <span>Approve as HR</span>
              </Button>
            )}

            {status !== "Draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReopenDraft}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                title="Re-open to Draft for revisions"
              >
                <RotateCcw size={13} />
                <span>Re-open to Draft</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mandatory Header Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t">
          {/* 1. Period (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Period <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Monthly Cycle</span>
            </label>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                if (status === "Approved") setStatus("Draft");
                toast.info(`Switched active period to ${e.target.value}`);
              }}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
            >
              <option value="May 2026">May 2026 (Active Run)</option>
              <option value="April 2026">April 2026 (Closed)</option>
              <option value="March 2026">March 2026 (Closed)</option>
              <option value="June 2026">June 2026 (Upcoming)</option>
            </select>
          </div>

          {/* 2. Division (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Division <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Service Unit</span>
            </label>
            <select
              value={division}
              onChange={(e) => {
                setDivision(e.target.value);
                toast.info(`Filtered for ${e.target.value}`);
              }}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
              <option value="Renewable Energy">Renewable Energy</option>
              <option value="All Service Divisions">All Service Divisions</option>
            </select>
          </div>

          {/* 3. Source (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Source <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Origin System</span>
            </label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                toast.info(`Attendance source set to ${e.target.value}`);
              }}
              disabled={status === "Approved"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-70 disabled:bg-muted/40"
            >
              <option value="Biometric Punch Terminal (ZKTeco BioTime)">
                Biometric Punch Terminal (ZKTeco BioTime)
              </option>
              <option value="HRIS Payroll Export (SAP SuccessFactors)">
                HRIS Payroll Export (SAP SuccessFactors)
              </option>
              <option value="Manual Timesheet Upload (.xlsx)">
                Manual Timesheet Upload (.xlsx)
              </option>
              <option value="Direct Clipboard Paste">Direct Clipboard Paste</option>
            </select>
          </div>

          {/* 4. Status (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Status <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Workflow Stage</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={status}
                className="w-full text-xs font-bold font-mono rounded-md border border-input bg-muted/40 px-3 py-2 shadow-xs text-foreground"
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CRITICAL BUSINESS RULE CALLOUT (INC-BCR-10 REQUIREMENT)       */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-md border border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>Proposed / Demo Rule (Business Clarification Pending — INC-BCR-10)</span>
          </div>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed pl-5">
            The documented attendance factor rule is formulated as:{" "}
            <strong className="underline">100% factor</strong> for 0–1 absent days,{" "}
            <strong className="underline">50% factor</strong> for 2 absent days, and{" "}
            <strong className="underline">0% factor</strong> for 3 or more unapproved absent days.
            This rule is currently operating under a proposed demo status pending executive HR
            policy sign-off.
          </p>
        </div>

        {/* Validation Summary Strip / Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Total Lines</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{validationStats.total}</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-success font-medium flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Valid Lines</span>
            </span>
            <p className="text-lg font-bold text-success mt-0.5">{validationStats.valid}</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
              <AlertCircle size={12} />
              <span>Row Errors</span>
            </span>
            <p className="text-lg font-bold text-destructive mt-0.5">{validationStats.error}</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">
              Avg Attendance Factor
            </span>
            <p className="text-lg font-bold text-primary mt-0.5">{validationStats.avgFactor}%</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-muted-foreground font-medium">Total Absent Days</span>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {validationStats.totalAbsents}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Main Tabs: Lines vs Errors                                 */}
      {/* ------------------------------------------------------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="lines" className="text-xs gap-1.5 px-3 py-1.5">
              <Layers size={13} />
              <span>Lines ({records.length})</span>
            </TabsTrigger>
            <TabsTrigger value="errors" className="text-xs gap-1.5 px-3 py-1.5 relative">
              <AlertCircle
                size={13}
                className={validationStats.error > 0 ? "text-destructive" : ""}
              />
              <span>Errors</span>
              {validationStats.error > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full">
                  {validationStats.error}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Quick Filter Bar */}
          {activeTab === "lines" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter technician or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <select
                value={filterValidation}
                onChange={(e) => setFilterValidation(e.target.value as "All" | "Valid" | "Error")}
                className="h-8 text-xs rounded-md border border-input bg-background px-2.5 shadow-xs"
              >
                <option value="All">All Lines</option>
                <option value="Valid">Valid Lines Only</option>
                <option value="Error">Errors Only</option>
              </select>

              <select
                value={filterFactor}
                onChange={(e) => setFilterFactor(e.target.value)}
                className="h-8 text-xs rounded-md border border-input bg-background px-2.5 shadow-xs"
              >
                <option value="All">All Factors</option>
                <option value="100%">100% Factor (0-1 Absent)</option>
                <option value="50%">50% Factor (2 Absent)</option>
                <option value="0%">0% Factor (3+ Absent)</option>
              </select>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* TAB 1: LINES GRID                                           */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="lines" className="space-y-4 m-0">
          <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[120px]">Employee</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Name</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Designation / Role</th>
                    <th className="py-2.5 px-3 text-right">Working Days</th>
                    <th className="py-2.5 px-3 text-right">Leave Days</th>
                    <th className="py-2.5 px-3 text-right">Absent Days</th>
                    <th className="py-2.5 px-3 min-w-[160px]">
                      <div className="flex items-center gap-1">
                        <span>Attendance Factor</span>
                        <span className="text-[10px] text-amber-600 bg-amber-100/70 dark:bg-amber-950/60 px-1 rounded font-normal">
                          Demo Rule
                        </span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 w-28 text-center">Validation</th>
                    {status === "Draft" && (
                      <th className="py-2.5 px-3 w-20 text-center">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={status === "Draft" ? 10 : 9}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No attendance lines match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item, idx) => {
                      const hasError = item.validationStatus === "Error";
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            hasError ? "bg-destructive/5" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-muted-foreground font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Employee Code */}
                          <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                            {item.employeeCode}
                          </td>

                          {/* Employee Name */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-foreground">{item.employeeName}</div>
                            {item.notes && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-xs">
                                {item.notes}
                              </div>
                            )}
                          </td>

                          {/* Role */}
                          <td className="py-2.5 px-3 text-muted-foreground">
                            <div>{item.role}</div>
                            <span className="text-[10px] text-muted-foreground/80">
                              {item.division}
                            </span>
                          </td>

                          {/* Working Days */}
                          <td className="py-2.5 px-3 text-right font-mono font-medium">
                            {item.workingDays}
                          </td>

                          {/* Leave Days */}
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {item.leaveDays}
                          </td>

                          {/* Absent Days */}
                          <td className="py-2.5 px-3 text-right font-mono">
                            <span
                              className={`font-semibold ${
                                item.absentDays >= 3
                                  ? "text-destructive"
                                  : item.absentDays === 2
                                    ? "text-amber-600"
                                    : "text-foreground"
                              }`}
                            >
                              {item.absentDays}
                            </span>
                          </td>

                          {/* Attendance Factor */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2 py-0.5 rounded ${
                                  item.attendanceFactor === 1.0
                                    ? "bg-success/15 text-success"
                                    : item.attendanceFactor === 0.5
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                      : "bg-destructive/15 text-destructive"
                                }`}
                              >
                                {(item.attendanceFactor * 100).toFixed(0)}%
                              </span>
                              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                {item.attendanceFactor === 1.0
                                  ? "(Full Payout)"
                                  : item.attendanceFactor === 0.5
                                    ? "(50% Scaled)"
                                    : "(Zeroed Out)"}
                              </span>
                            </div>
                          </td>

                          {/* Validation Status */}
                          <td className="py-2.5 px-3 text-center">
                            {hasError ? (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive cursor-help"
                                title={item.errorMessages.join(" | ")}
                              >
                                <AlertCircle size={13} />
                                <span>Error</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                                <CheckCircle2 size={13} />
                                <span>Valid</span>
                              </span>
                            )}
                          </td>

                          {/* Actions (in Draft) */}
                          {status === "Draft" && (
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setEditingRecord(item)}
                                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                  title="Edit Line"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRow(item.id)}
                                  className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                                  title="Remove Line"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="bg-muted/40 p-3 border-t flex flex-wrap items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing <strong>{filteredRecords.length}</strong> of{" "}
                <strong>{records.length}</strong> technician records
              </div>
              <div className="flex items-center gap-4">
                <span>100% Factor: {records.filter((r) => r.attendanceFactor === 1.0).length}</span>
                <span>50% Factor: {records.filter((r) => r.attendanceFactor === 0.5).length}</span>
                <span>0% Factor: {records.filter((r) => r.attendanceFactor === 0.0).length}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: ERRORS TAB                                           */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="errors" className="space-y-4 m-0">
          {errorRecords.length === 0 ? (
            <div className="card-surface p-8 rounded-lg border bg-card text-center space-y-3">
              <CheckCircle2 size={36} className="mx-auto text-success" />
              <h3 className="text-base font-bold text-foreground">
                Zero Validation Errors Detected
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                All technician codes match the master roster, eligible roles are verified, and day
                allocations adhere to monthly thresholds. The batch is eligible for HR approval.
              </p>
              {status === "Draft" && (
                <Button
                  size="sm"
                  onClick={handleValidateLines}
                  className="text-xs font-semibold bg-info text-info-foreground hover:bg-info/90 cursor-pointer"
                >
                  <FileCheck size={13} className="mr-1.5" />
                  <span>Mark as Validated</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center justify-between text-xs text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span className="font-semibold">
                    {errorRecords.length} line{errorRecords.length > 1 ? "s" : ""} failed validation
                    checks.
                  </span>
                </div>
                <span>Fix invalid rows to proceed with HR Approval</span>
              </div>

              <div className="rounded-lg border bg-card overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                      <th className="py-2.5 px-3 min-w-[120px]">Employee</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Name</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Reported Role</th>
                      <th className="py-2.5 px-3">Validation Failure Reason</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Remediation</th>
                      <th className="py-2.5 px-3 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {errorRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-destructive/5">
                        <td className="py-2.5 px-3 font-mono font-bold text-destructive">
                          {item.employeeCode}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {item.employeeName}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{item.role}</td>
                        <td className="py-2.5 px-3">
                          <ul className="list-disc pl-4 space-y-1 text-destructive font-medium">
                            {item.errorMessages.map((msg, i) => (
                              <li key={i}>{msg}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {item.role.toLowerCase().includes("cashier") ||
                          item.role.toLowerCase().includes("consultant")
                            ? "Remove row (Non-technician role)"
                            : "Correct employee ID or update technician master"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRecord(item)}
                            className="h-7 text-xs px-2 gap-1"
                          >
                            <Edit2 size={11} />
                            <span>Fix</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ------------------------------------------------------------- */}
      {/* 4. Modals & Action Drawers                                    */}
      {/* ------------------------------------------------------------- */}

      {/* MODAL: Import Excel Dialog */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">Import Excel Attendance File</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-semibold block text-foreground mb-1">
                  Select Mock Dataset / Upload Source
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleLoadExcelPreset("clean")}
                    className={`p-2.5 text-left rounded-md border text-xs transition-colors cursor-pointer ${
                      selectedFilePreset === "clean"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-input hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold">Standard Clean Batch</div>
                    <div className="text-[10px] opacity-80">10 Eligible Technicians (0 Errors)</div>
                  </button>

                  <button
                    onClick={() => handleLoadExcelPreset("with-exceptions")}
                    className={`p-2.5 text-left rounded-md border text-xs transition-colors cursor-pointer ${
                      selectedFilePreset === "with-exceptions"
                        ? "border-destructive bg-destructive/10 text-destructive font-semibold"
                        : "border-input hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold">Batch with Exceptions</div>
                    <div className="text-[10px] opacity-80">Includes Sales Rep & Unknown ID</div>
                  </button>

                  <button
                    onClick={() => handleLoadExcelPreset("high-absent")}
                    className={`p-2.5 text-left rounded-md border text-xs transition-colors cursor-pointer ${
                      selectedFilePreset === "high-absent"
                        ? "border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold"
                        : "border-input hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold">High Absence Batch</div>
                    <div className="text-[10px] opacity-80">Tests 50% and 0% Demo Slabs</div>
                  </button>
                </div>
              </div>

              {/* Import Preview Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Import Preview ({importPreviewData.length} records parsed)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Target Period: {period} ({division})
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto border rounded-md">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-muted/80 sticky top-0">
                      <tr className="border-b">
                        <th className="p-2">Code</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Role</th>
                        <th className="p-2 text-right">Work</th>
                        <th className="p-2 text-right">Leave</th>
                        <th className="p-2 text-right">Absent</th>
                        <th className="p-2">Factor</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {importPreviewData.map((item, i) => (
                        <tr key={i} className="hover:bg-muted/40">
                          <td className="p-2 font-mono font-medium">{item.employeeCode}</td>
                          <td className="p-2">{item.employeeName}</td>
                          <td className="p-2 text-muted-foreground">{item.role}</td>
                          <td className="p-2 text-right font-mono">{item.workingDays}</td>
                          <td className="p-2 text-right font-mono">{item.leaveDays}</td>
                          <td className="p-2 text-right font-mono font-bold">{item.absentDays}</td>
                          <td className="p-2 font-mono font-bold">
                            {(item.attendanceFactor * 100).toFixed(0)}%
                          </td>
                          <td className="p-2 text-center">
                            {item.validationStatus === "Valid" ? (
                              <span className="text-success font-medium">Valid</span>
                            ) : (
                              <span className="text-destructive font-bold">Error</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Will overwrite current working draft with parsed lines.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCommitExcelImport}
                  className="text-xs bg-primary text-primary-foreground font-semibold"
                >
                  Commit {importPreviewData.length} Records to Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Paste Records Dialog */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">Paste Records from Clipboard</h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Paste Tab-Separated or CSV Data
                  </label>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setPasteRawText(
                        `EMP-1021\tKasun Jayawardena\t22\t2\t0\nEMP-1022\tPradeep Bandara\t21\t2\t1\nEMP-1023\tRuwan Wijesinghe\t20\t2\t2\nEMP-1024\tDilshan Madusanka\t18\t2\t3\nEMP-1025\tNuwan Fernando\t23\t1\t0`,
                      );
                    }}
                    className="h-auto p-0 text-xs text-primary cursor-pointer"
                  >
                    Load Sample Clipboard Data
                  </Button>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Format:{" "}
                  <code>
                    EmployeeCode [tab/comma] EmployeeName [tab/comma] WorkingDays [tab/comma]
                    LeaveDays [tab/comma] AbsentDays
                  </code>
                </p>
                <textarea
                  rows={6}
                  value={pasteRawText}
                  onChange={(e) => setPasteRawText(e.target.value)}
                  placeholder="Paste rows here from Excel, Google Sheets, or CSV file..."
                  className="w-full text-xs font-mono p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={handleParsePaste} className="text-xs gap-1.5">
                  <SlidersHorizontal size={13} />
                  <span>Parse Text</span>
                </Button>
              </div>

              {/* Paste preview if available */}
              {pasteParsedRows.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground">
                    Parsed Preview ({pasteParsedRows.length} rows)
                  </span>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-muted/80 sticky top-0">
                        <tr className="border-b">
                          <th className="p-1.5">Code</th>
                          <th className="p-1.5">Name</th>
                          <th className="p-1.5 text-right">Work</th>
                          <th className="p-1.5 text-right">Leave</th>
                          <th className="p-1.5 text-right">Absent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pasteParsedRows.map((p, i) => (
                          <tr key={i}>
                            <td className="p-1.5 font-mono">{p.employeeCode}</td>
                            <td className="p-1.5">{p.employeeName}</td>
                            <td className="p-1.5 text-right font-mono">{p.workingDays}</td>
                            <td className="p-1.5 text-right font-mono">{p.leaveDays}</td>
                            <td className="p-1.5 text-right font-mono font-bold">{p.absentDays}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasteModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={pasteParsedRows.length === 0}
                onClick={handleCommitPastedRows}
                className="text-xs bg-primary text-primary-foreground font-semibold"
              >
                Add {pasteParsedRows.length} Rows to Grid
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Record Dialog */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Edit Attendance Record</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-foreground mb-1">Employee Code</label>
                <input
                  type="text"
                  value={editingRecord.employeeCode}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, employeeCode: e.target.value })
                  }
                  className="w-full text-xs font-mono rounded-md border border-input bg-background p-2"
                />
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">Employee Name</label>
                <input
                  type="text"
                  value={editingRecord.employeeName}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, employeeName: e.target.value })
                  }
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block text-foreground mb-1">Working Days</label>
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={editingRecord.workingDays}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        workingDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Leave Days</label>
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={editingRecord.leaveDays}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        leaveDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Absent Days</label>
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={editingRecord.absentDays}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        absentDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-muted/40 rounded-md border text-xs">
                <span className="text-muted-foreground font-medium">
                  Computed Attendance Factor:
                </span>
                <span className="font-bold text-foreground ml-2">
                  {(calculateProposedAttendanceFactor(editingRecord.absentDays) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {editingRecord.absentDays <= 1
                    ? "0–1 absent days = 100% factor"
                    : editingRecord.absentDays === 2
                      ? "2 absent days = 50% factor"
                      : "3+ absent days = 0% factor"}
                </span>
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={editingRecord.notes || ""}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  placeholder="e.g. Authorized field leave, medical exemption"
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingRecord(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEditRow}
                className="text-xs bg-primary text-primary-foreground font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New Line Dialog */}
      {isAddLineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Add Technician Attendance Line</h3>
              <button
                onClick={() => setIsAddLineModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-foreground mb-1">
                  Select Technician
                </label>
                <select
                  value={newLineForm.employeeCode}
                  onChange={(e) => setNewLineForm({ ...newLineForm, employeeCode: e.target.value })}
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                >
                  {TECHNICIAN_MASTER_ROSTER.map((tech) => (
                    <option key={tech.code} value={tech.code}>
                      {tech.code} — {tech.name} ({tech.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block text-foreground mb-1">Working Days</label>
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={newLineForm.workingDays}
                    onChange={(e) =>
                      setNewLineForm({
                        ...newLineForm,
                        workingDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Leave Days</label>
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={newLineForm.leaveDays}
                    onChange={(e) =>
                      setNewLineForm({
                        ...newLineForm,
                        leaveDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Absent Days</label>
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={newLineForm.absentDays}
                    onChange={(e) =>
                      setNewLineForm({
                        ...newLineForm,
                        absentDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">Notes</label>
                <input
                  type="text"
                  value={newLineForm.notes}
                  onChange={(e) => setNewLineForm({ ...newLineForm, notes: e.target.value })}
                  placeholder="Optional line notes"
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddLineModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewLine}
                className="text-xs bg-primary text-primary-foreground font-semibold"
              >
                Add to Draft
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Approve as HR Dialog */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-success" size={18} />
                <h3 className="font-bold text-sm text-foreground">HR Approval & Sign-Off</h3>
              </div>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-md border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-bold text-foreground">{period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Division:</span>
                  <span className="font-bold text-foreground">{division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Records:</span>
                  <span className="font-bold text-success">{validationStats.valid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approving HR Manager:</span>
                  <span className="font-bold text-primary">Niluka Senaratne (HR Head)</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Approving this batch will mark attendance records as <strong>Approved</strong> and
                lock them for Service Performance calculation. Any subsequent revisions will require
                explicit re-opening to Draft.
              </p>
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApproveModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApproveAsHr}
                className="text-xs bg-success text-success-foreground font-semibold hover:bg-success/90"
              >
                Confirm HR Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: Mock Import History */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HistoryIcon className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">
                  Attendance Import Batch History
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <p className="text-muted-foreground text-xs">
                Audit trail of past biometric punch imports and HR payroll attendance files.
              </p>

              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                      <th className="py-2 px-3">Batch ID</th>
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3">Source</th>
                      <th className="py-2 px-3">Imported By</th>
                      <th className="py-2 px-3 text-right">Records</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {INITIAL_BATCH_HISTORY.map((batch) => (
                      <tr key={batch.batchId} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">
                          {batch.batchId}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{batch.period}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{batch.source}</td>
                        <td className="py-2.5 px-3">
                          <div>{batch.importedBy}</div>
                          <span className="text-[10px] text-muted-foreground">
                            {batch.importDate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          <span className="text-success font-bold">{batch.validRecords}</span>
                          {batch.errorRecords > 0 && (
                            <span className="text-destructive font-bold ml-1">
                              ({batch.errorRecords} err)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              batch.status === "Approved"
                                ? "bg-success/15 text-success"
                                : "bg-warning/15 text-warning"
                            }`}
                          >
                            {batch.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
