import React, { useState, useMemo } from "react";
import {
  UserCheck,
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
  Briefcase,
  BadgeCheck,
  User,
  Hash,
  MapPin,
  FileText,
  Copy,
  ChevronDown,
  Target,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export type ParticipantStatus = "Active" | "Inactive";
export type SchemeAssignmentStatus = "Active" | "Inactive" | "Pending Approval";

export interface SchemeAssignment {
  id: string;
  schemeCode: string;
  schemeName: string;
  calculationRole: string; // e.g., "Primary Technician", "Secondary Contributor", "Lead Supervisor", "Sales Executive", "Area Sales Manager", "Head of Department (HOD)"
  isPrimaryRole: boolean;
  effectiveFrom: string;
  effectiveTo: string; // empty string indicates ongoing / open-ended
  targetAllocationPercent: number; // default 100%
  status: SchemeAssignmentStatus;
  notes?: string;
}

export interface ParticipantHistoryItem {
  id: string;
  timestamp: string;
  author: string;
  role: string; // "Incentive Administrator"
  eventType:
    | "Scheme Enrolled"
    | "Role Reassigned"
    | "Division Transfer"
    | "Status Changed"
    | "Quota Adjusted"
    | "Profile Created";
  schemeCode?: string;
  previousValue: string;
  newValue: string;
  changeReason: string;
}

export interface ParticipantRecord {
  id: string; // Employee Code, e.g. "EMP-1021"
  name: string; // Employee Name
  salesEmployeeCode: string; // e.g. "SL-204"
  division: string; // e.g. "Consumer Electronics"
  segmentChannel: string; // e.g. "Field Engineering & Repairs"
  areaManager: string; // e.g. "Sunil Warnakulasuriya"
  designation: string; // e.g. "Senior Service Engineer"
  payrollId: string; // e.g. "PAY-88342"
  active: boolean; // Active or Inactive
  phone?: string;
  email?: string;
  joinDate: string;
  assignments: SchemeAssignment[];
  history: ParticipantHistoryItem[];
}

export interface AvailableSchemeOption {
  code: string;
  name: string;
  division: string;
  applicableRoles: string[];
}

const AVAILABLE_SCHEMES_LIST: AvailableSchemeOption[] = [
  {
    code: "SCH-SRV-2026",
    name: "Field Service Technician Performance Incentive",
    division: "Consumer Electronics",
    applicableRoles: [
      "Primary Technician",
      "Lead Supervisor",
      "Secondary Contributor",
      "Service HOD",
    ],
  },
  {
    code: "SCH-SLS-2026",
    name: "Retail Smartphone & Devices Sales Incentive",
    division: "Mobile & Accessories",
    applicableRoles: [
      "Sales Executive",
      "Senior Channel Account Exec",
      "Area Sales Manager",
      "Showroom Promoter",
    ],
  },
  {
    code: "SCH-DLR-2026",
    name: "Tier-1 Authorised Dealer Quarterly Rebate",
    division: "Enterprise Solutions",
    applicableRoles: ["Key Account Manager", "Enterprise Lead", "Area Manager", "Channel Director"],
  },
  {
    code: "SCH-PRM-2026",
    name: "Showroom Promoter Fast Sell-Out Bounty",
    division: "Mobile & Accessories",
    applicableRoles: ["Showroom Promoter", "Lead Promoter", "Store Supervisor"],
  },
  {
    code: "SCH-SOLAR-2026",
    name: "Commercial Solar & Storage Solutions Incentive",
    division: "Renewable Energy",
    applicableRoles: [
      "Senior Energy Consultant",
      "Solar Project Engineer",
      "Regional Sales Manager",
    ],
  },
];

const DIVISIONS = [
  "Consumer Electronics",
  "Mobile & Accessories",
  "Enterprise Solutions",
  "Renewable Energy",
  "Aftermarket Spares & Logistics",
];

const SEGMENT_CHANNELS = [
  "Field Engineering & Repairs",
  "Modern Retail & Brand Stores",
  "Corporate Key Accounts & B2B",
  "Authorized Dealer Franchise Network",
  "Commercial Rooftop EPC & Solar",
  "Direct Enterprise Solutions",
];

const AREA_MANAGERS = [
  "Sunil Warnakulasuriya (Western Province North)",
  "Mahesh Rathnayake (Western Province South)",
  "Chathura Wijesinghe (Central & Hills)",
  "Ranjith Senanayake (Southern Region)",
  "Priyantha Alwis (Northern & Eastern)",
  "Harsha Jayawardena (Enterprise Key Accounts)",
];

const CALCULATION_ROLES = [
  "Primary Technician",
  "Lead Supervisor",
  "Secondary Contributor",
  "Sales Executive",
  "Senior Channel Account Exec",
  "Key Account Manager",
  "Area Sales Manager",
  "Head of Department (HOD)",
  "Showroom Promoter",
  "Technical Specialist",
];

// Seed participants with comprehensive mock records
const INITIAL_PARTICIPANTS: ParticipantRecord[] = [
  {
    id: "EMP-1021",
    name: "Nimal Perera",
    salesEmployeeCode: "SL-204",
    division: "Consumer Electronics",
    segmentChannel: "Field Engineering & Repairs",
    areaManager: "Sunil Warnakulasuriya (Western Province North)",
    designation: "Senior Service Engineer",
    payrollId: "PAY-88342",
    active: true,
    phone: "+94 77 123 4567",
    email: "nimal.p@telesonic.lk",
    joinDate: "15-Mar-2021",
    assignments: [
      {
        id: "ASG-101",
        schemeCode: "SCH-SRV-2026",
        schemeName: "Field Service Technician Performance Incentive",
        calculationRole: "Primary Technician",
        isPrimaryRole: true,
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        targetAllocationPercent: 100,
        status: "Active",
        notes: "Assigned lead role for Colombo Metro customer tickets",
      },
      {
        id: "ASG-102",
        schemeCode: "SCH-SLS-2026",
        schemeName: "Retail Smartphone & Devices Sales Incentive",
        calculationRole: "Secondary Contributor",
        isPrimaryRole: false,
        effectiveFrom: "2026-02-01",
        effectiveTo: "2026-06-30",
        targetAllocationPercent: 20,
        status: "Active",
        notes: "Warranty extension accessory cross-sell contribution",
      },
    ],
    history: [
      {
        id: "HIST-01",
        timestamp: "2026-01-05 09:30:12",
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Scheme Enrolled",
        schemeCode: "SCH-SRV-2026",
        previousValue: "None",
        newValue: "Primary Technician (100% Allocation)",
        changeReason: "Annual 2026 Field Service Incentive kickoff enrollment",
      },
      {
        id: "HIST-02",
        timestamp: "2026-02-01 14:15:45",
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Scheme Enrolled",
        schemeCode: "SCH-SLS-2026",
        previousValue: "None",
        newValue: "Secondary Contributor (20% Allocation)",
        changeReason: "Approved cross-selling scheme bonus for authorized repairs",
      },
    ],
  },
  {
    id: "EMP-1022",
    name: "Kasun Jayasuriya",
    salesEmployeeCode: "SL-108",
    division: "Enterprise Solutions",
    segmentChannel: "Corporate Key Accounts & B2B",
    areaManager: "Harsha Jayawardena (Enterprise Key Accounts)",
    designation: "Key Account Manager",
    payrollId: "PAY-88410",
    active: true,
    phone: "+94 71 882 3311",
    email: "kasun.j@telesonic.lk",
    joinDate: "01-Aug-2020",
    assignments: [
      {
        id: "ASG-201",
        schemeCode: "SCH-DLR-2026",
        schemeName: "Tier-1 Authorised Dealer Quarterly Rebate",
        calculationRole: "Key Account Manager",
        isPrimaryRole: true,
        effectiveFrom: "2026-04-01",
        effectiveTo: "2026-06-30",
        targetAllocationPercent: 100,
        status: "Active",
        notes: "Q2 Enterprise volume target keeper",
      },
    ],
    history: [
      {
        id: "HIST-10",
        timestamp: "2026-03-28 11:20:00",
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Scheme Enrolled",
        schemeCode: "SCH-DLR-2026",
        previousValue: "None",
        newValue: "Key Account Manager (100% Allocation)",
        changeReason: "Assigned as primary relationship manager for Top 10 B2B dealers",
      },
    ],
  },
  {
    id: "EMP-1023",
    name: "Dilshan Silva",
    salesEmployeeCode: "SL-312",
    division: "Consumer Electronics",
    segmentChannel: "Field Engineering & Repairs",
    areaManager: "Chathura Wijesinghe (Central & Hills)",
    designation: "Field Support Specialist",
    payrollId: "PAY-88519",
    active: true,
    phone: "+94 76 555 9012",
    email: "dilshan.s@telesonic.lk",
    joinDate: "10-Jan-2022",
    assignments: [
      {
        id: "ASG-301",
        schemeCode: "SCH-SRV-2026",
        schemeName: "Field Service Technician Performance Incentive",
        calculationRole: "Primary Technician",
        isPrimaryRole: true,
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        targetAllocationPercent: 100,
        status: "Active",
        notes: "Kandy and Central Region service coverage",
      },
    ],
    history: [
      {
        id: "HIST-20",
        timestamp: "2026-01-05 10:00:00",
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Scheme Enrolled",
        schemeCode: "SCH-SRV-2026",
        previousValue: "None",
        newValue: "Primary Technician (100% Allocation)",
        changeReason: "2026 Field Engineer enrollment",
      },
    ],
  },
  {
    id: "EMP-1024",
    name: "Tharindu Fernando",
    salesEmployeeCode: "SL-405",
    division: "Mobile & Accessories",
    segmentChannel: "Modern Retail & Brand Stores",
    areaManager: "Mahesh Rathnayake (Western Province South)",
    designation: "Senior Channel Account Exec",
    payrollId: "PAY-88602",
    active: true,
    phone: "+94 77 999 1234",
    email: "tharindu.f@telesonic.lk",
    joinDate: "05-Jun-2023",
    assignments: [
      {
        id: "ASG-401",
        schemeCode: "SCH-SLS-2026",
        schemeName: "Retail Smartphone & Devices Sales Incentive",
        calculationRole: "Senior Channel Account Exec",
        isPrimaryRole: true,
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        targetAllocationPercent: 100,
        status: "Active",
        notes: "Galle Road and Liberty Plaza flagship retail stores",
      },
    ],
    history: [
      {
        id: "HIST-30",
        timestamp: "2026-01-10 15:40:00",
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Scheme Enrolled",
        schemeCode: "SCH-SLS-2026",
        previousValue: "None",
        newValue: "Senior Channel Account Exec (100% Allocation)",
        changeReason: "Promotion to Senior Channel Rep with retail target tier",
      },
    ],
  },
  {
    id: "EMP-1025",
    name: "Kavinda Bandara",
    salesEmployeeCode: "SL-490",
    division: "Consumer Electronics",
    segmentChannel: "Field Engineering & Repairs",
    areaManager: "Sunil Warnakulasuriya (Western Province North)",
    designation: "Junior Service Technician",
    payrollId: "PAY-88730",
    active: false,
    phone: "+94 70 333 4455",
    email: "kavinda.b@telesonic.lk",
    joinDate: "01-Apr-2026",
    assignments: [
      {
        id: "ASG-501",
        schemeCode: "SCH-SRV-2026",
        schemeName: "Field Service Technician Performance Incentive",
        calculationRole: "Secondary Contributor",
        isPrimaryRole: false,
        effectiveFrom: "2026-04-01",
        effectiveTo: "2026-06-30",
        targetAllocationPercent: 50,
        status: "Inactive",
        notes: "Probationary period evaluation (currently inactive on live runs)",
      },
    ],
    history: [
      {
        id: "HIST-40",
        timestamp: "2026-04-02 08:30:00",
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Status Changed",
        schemeCode: "SCH-SRV-2026",
        previousValue: "Active",
        newValue: "Inactive / Probation Hold",
        changeReason: "Under probation evaluation per HR guidelines",
      },
    ],
  },
  {
    id: "EMP-1026",
    name: "Chaminda Wickramasinghe",
    salesEmployeeCode: "SL-102",
    division: "Consumer Electronics",
    segmentChannel: "Field Engineering & Repairs",
    areaManager: "Sunil Warnakulasuriya (Western Province North)",
    designation: "Head of Department (HOD) - Field Support",
    payrollId: "PAY-88001",
    active: true,
    phone: "+94 77 777 8899",
    email: "chaminda.w@telesonic.lk",
    joinDate: "01-Jan-2018",
    assignments: [
      {
        id: "ASG-601",
        schemeCode: "SCH-SRV-2026",
        schemeName: "Field Service Technician Performance Incentive",
        calculationRole: "Head of Department (HOD)",
        isPrimaryRole: true,
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        targetAllocationPercent: 100,
        status: "Active",
        notes: "Divisional override pool calculation",
      },
    ],
    history: [
      {
        id: "HIST-50",
        timestamp: "2026-01-02 11:00:00",
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Role Reassigned",
        schemeCode: "SCH-SRV-2026",
        previousValue: "Lead Supervisor",
        newValue: "Head of Department (HOD)",
        changeReason: "HOD departmental incentive override structure update",
      },
    ],
  },
];

interface IncentiveParticipantProfileViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function IncentiveParticipantProfileView({
  onNavigateScreen,
  onBack,
}: IncentiveParticipantProfileViewProps) {
  // Master participants state
  const [participants, setParticipants] = useState<ParticipantRecord[]>(INITIAL_PARTICIPANTS);

  // Currently selected participant id
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("EMP-1021");

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("assignments");

  // Search & Filters for participant switcher / list
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterDivision, setFilterDivision] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Participant Form state (Header fields)
  const currentParticipant = useMemo(() => {
    return (participants.find((p) => p.id === selectedParticipantId) ||
      participants[0] ||
      INITIAL_PARTICIPANTS[0])!;
  }, [participants, selectedParticipantId]);

  // Editable header draft state
  const [headerForm, setHeaderForm] = useState<{
    id: string;
    name: string;
    salesEmployeeCode: string;
    division: string;
    segmentChannel: string;
    areaManager: string;
    designation: string;
    payrollId: string;
    active: boolean;
  }>({
    id: currentParticipant.id,
    name: currentParticipant.name,
    salesEmployeeCode: currentParticipant.salesEmployeeCode,
    division: currentParticipant.division,
    segmentChannel: currentParticipant.segmentChannel,
    areaManager: currentParticipant.areaManager,
    designation: currentParticipant.designation,
    payrollId: currentParticipant.payrollId,
    active: currentParticipant.active,
  });

  // Keep form in sync when current participant changes
  React.useEffect(() => {
    if (currentParticipant) {
      setHeaderForm({
        id: currentParticipant.id,
        name: currentParticipant.name,
        salesEmployeeCode: currentParticipant.salesEmployeeCode,
        division: currentParticipant.division,
        segmentChannel: currentParticipant.segmentChannel,
        areaManager: currentParticipant.areaManager,
        designation: currentParticipant.designation,
        payrollId: currentParticipant.payrollId,
        active: currentParticipant.active,
      });
    }
  }, [currentParticipant]);

  // Track if header form has dirty changes
  const isHeaderDirty = useMemo(() => {
    return (
      headerForm.name !== currentParticipant.name ||
      headerForm.salesEmployeeCode !== currentParticipant.salesEmployeeCode ||
      headerForm.division !== currentParticipant.division ||
      headerForm.segmentChannel !== currentParticipant.segmentChannel ||
      headerForm.areaManager !== currentParticipant.areaManager ||
      headerForm.designation !== currentParticipant.designation ||
      headerForm.payrollId !== currentParticipant.payrollId ||
      headerForm.active !== currentParticipant.active
    );
  }, [headerForm, currentParticipant]);

  // New Participant Modal
  const [isNewParticipantModalOpen, setIsNewParticipantModalOpen] = useState<boolean>(false);
  const [newParticipantData, setNewParticipantData] = useState<{
    id: string;
    name: string;
    salesEmployeeCode: string;
    division: string;
    segmentChannel: string;
    areaManager: string;
    designation: string;
    payrollId: string;
    active: boolean;
  }>({
    id: `EMP-${1000 + participants.length + 21}`,
    name: "",
    salesEmployeeCode: `SL-${500 + participants.length}`,
    division: "Consumer Electronics",
    segmentChannel: "Field Engineering & Repairs",
    areaManager: AREA_MANAGERS[0] || "Sunil Warnakulasuriya (Western Province North)",
    designation: "Senior Service Engineer",
    payrollId: `PAY-${88800 + participants.length}`,
    active: true,
  });

  // Add Scheme Assignment Modal
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState<boolean>(false);
  const [newAssignment, setNewAssignment] = useState<{
    schemeCode: string;
    calculationRole: string;
    isPrimaryRole: boolean;
    effectiveFrom: string;
    effectiveTo: string;
    targetAllocationPercent: number;
    status: SchemeAssignmentStatus;
    notes: string;
  }>({
    schemeCode: "SCH-SRV-2026",
    calculationRole: "Primary Technician",
    isPrimaryRole: true,
    effectiveFrom: "2026-05-01",
    effectiveTo: "2026-12-31",
    targetAllocationPercent: 100,
    status: "Active",
    notes: "Assigned in May 2026 incentive cycle",
  });

  // Validation error state for scheme assignment modal
  const [assignmentValidationError, setAssignmentValidationError] = useState<string | null>(null);

  // Edit Assignment Modal
  const [editingAssignment, setEditingAssignment] = useState<SchemeAssignment | null>(null);

  // Filtered participant list for drawer / selector
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.salesEmployeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.payrollId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.designation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDiv = filterDivision === "All" || p.division === filterDivision;
      const matchStat =
        filterStatus === "All" || (filterStatus === "Active" ? p.active : !p.active);

      return matchSearch && matchDiv && matchStat;
    });
  }, [participants, searchQuery, filterDivision, filterStatus]);

  // Aggregate stats for currently viewed participant
  const currentStats = useMemo(() => {
    const totalAssignments = currentParticipant.assignments.length;
    const activeAssignments = currentParticipant.assignments.filter(
      (a) => a.status === "Active",
    ).length;
    const primaryRolesCount = currentParticipant.assignments.filter(
      (a) => a.isPrimaryRole && a.status === "Active",
    ).length;
    const totalAllocation = currentParticipant.assignments
      .filter((a) => a.status === "Active")
      .reduce((sum, a) => sum + a.targetAllocationPercent, 0);

    return {
      totalAssignments,
      activeAssignments,
      primaryRolesCount,
      totalAllocation,
    };
  }, [currentParticipant]);

  // =========================================================================
  // Helper: Overlap check for date ranges
  // =========================================================================
  const doDatesOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
    const sA = new Date(startA).getTime();
    const eA = endA ? new Date(endA).getTime() : Infinity;
    const sB = new Date(startB).getTime();
    const eB = endB ? new Date(endB).getTime() : Infinity;

    return sA <= eB && sB <= eA;
  };

  // =========================================================================
  // Handlers: Save Header Changes
  // =========================================================================
  const handleSaveHeader = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Mandatory field validations
    if (!headerForm.name.trim()) {
      toast.error("Employee Name is mandatory.");
      return;
    }
    if (!headerForm.division.trim()) {
      toast.error("Division is mandatory.");
      return;
    }
    if (!headerForm.designation.trim()) {
      toast.error("Designation is mandatory.");
      return;
    }
    if (!headerForm.payrollId.trim()) {
      toast.error("Payroll ID is mandatory.");
      return;
    }

    const previousDiv = currentParticipant.division;
    const previousDesig = currentParticipant.designation;
    const previousStatus = currentParticipant.active ? "Active" : "Inactive";
    const newStatus = headerForm.active ? "Active" : "Inactive";

    const newHistoryRecords: ParticipantHistoryItem[] = [];

    if (previousDiv !== headerForm.division) {
      newHistoryRecords.push({
        id: `HIST-${Date.now()}-1`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Division Transfer",
        previousValue: previousDiv,
        newValue: headerForm.division,
        changeReason: "Updated employee divisional assignment in profile header",
      });
    }

    if (previousDesig !== headerForm.designation) {
      newHistoryRecords.push({
        id: `HIST-${Date.now()}-2`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Role Reassigned",
        previousValue: previousDesig,
        newValue: headerForm.designation,
        changeReason: "Designation title updated by Incentive Administrator",
      });
    }

    if (previousStatus !== newStatus) {
      newHistoryRecords.push({
        id: `HIST-${Date.now()}-3`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        author: "admin.incentive@telesonic.lk",
        role: "Incentive Administrator",
        eventType: "Status Changed",
        previousValue: previousStatus,
        newValue: newStatus,
        changeReason: `Participant active flag modified to ${newStatus}`,
      });
    }

    // Update in participant list
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === currentParticipant.id) {
          return {
            ...p,
            name: headerForm.name,
            salesEmployeeCode: headerForm.salesEmployeeCode,
            division: headerForm.division,
            segmentChannel: headerForm.segmentChannel,
            areaManager: headerForm.areaManager,
            designation: headerForm.designation,
            payrollId: headerForm.payrollId,
            active: headerForm.active,
            history: [...newHistoryRecords, ...p.history],
          };
        }
        return p;
      }),
    );

    toast.success(`Profile updated for ${headerForm.name} (${currentParticipant.id})`, {
      description: "Header details and audit history saved successfully.",
    });
  };

  // =========================================================================
  // Handlers: Add Scheme Assignment (Enforce 1 primary role per scheme/period)
  // =========================================================================
  const handleValidateAndAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentValidationError(null);

    if (!newAssignment.schemeCode) {
      setAssignmentValidationError("Please select a scheme.");
      return;
    }
    if (!newAssignment.calculationRole) {
      setAssignmentValidationError("Calculation Role is mandatory.");
      return;
    }
    if (!newAssignment.effectiveFrom) {
      setAssignmentValidationError("Effective From date is mandatory.");
      return;
    }
    if (
      newAssignment.effectiveTo &&
      new Date(newAssignment.effectiveTo) < new Date(newAssignment.effectiveFrom)
    ) {
      setAssignmentValidationError("Effective To cannot be earlier than Effective From.");
      return;
    }

    // MANDATORY BUSINESS RULE:
    // Only 1 primary calculation role per scheme per period!
    if (newAssignment.isPrimaryRole) {
      const existingConflictingPrimary = currentParticipant.assignments.find(
        (asg) =>
          asg.schemeCode === newAssignment.schemeCode &&
          asg.isPrimaryRole &&
          asg.status === "Active" &&
          doDatesOverlap(
            asg.effectiveFrom,
            asg.effectiveTo,
            newAssignment.effectiveFrom,
            newAssignment.effectiveTo,
          ),
      );

      if (existingConflictingPrimary) {
        setAssignmentValidationError(
          `Validation Error: Only 1 primary calculation role per scheme per period is permitted. ` +
            `This participant already has primary role "${existingConflictingPrimary.calculationRole}" for scheme ${existingConflictingPrimary.schemeCode} ` +
            `during the overlapping period (${existingConflictingPrimary.effectiveFrom} to ${
              existingConflictingPrimary.effectiveTo || "Open-ended"
            }). ` +
            `Please uncheck Primary Role or adjust the effective period.`,
        );
        return;
      }
    }

    const schemeInfo = AVAILABLE_SCHEMES_LIST.find((s) => s.code === newAssignment.schemeCode);

    const createdAssignment: SchemeAssignment = {
      id: `ASG-${Date.now()}`,
      schemeCode: newAssignment.schemeCode,
      schemeName: schemeInfo ? schemeInfo.name : newAssignment.schemeCode,
      calculationRole: newAssignment.calculationRole,
      isPrimaryRole: newAssignment.isPrimaryRole,
      effectiveFrom: newAssignment.effectiveFrom,
      effectiveTo: newAssignment.effectiveTo,
      targetAllocationPercent: Number(newAssignment.targetAllocationPercent) || 100,
      status: newAssignment.status,
      notes: newAssignment.notes,
    };

    const historyRecord: ParticipantHistoryItem = {
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "admin.incentive@telesonic.lk",
      role: "Incentive Administrator",
      eventType: "Scheme Enrolled",
      schemeCode: newAssignment.schemeCode,
      previousValue: "None",
      newValue: `${newAssignment.calculationRole} (${newAssignment.targetAllocationPercent}%, ${
        newAssignment.isPrimaryRole ? "Primary" : "Secondary"
      })`,
      changeReason: newAssignment.notes || "Scheme assignment added by Incentive Administrator",
    };

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === currentParticipant.id) {
          return {
            ...p,
            assignments: [createdAssignment, ...p.assignments],
            history: [historyRecord, ...p.history],
          };
        }
        return p;
      }),
    );

    setIsAddAssignmentModalOpen(false);
    setNewAssignment({
      schemeCode: "SCH-SRV-2026",
      calculationRole: "Primary Technician",
      isPrimaryRole: true,
      effectiveFrom: "2026-05-01",
      effectiveTo: "2026-12-31",
      targetAllocationPercent: 100,
      status: "Active",
      notes: "",
    });

    toast.success(`Assigned ${newAssignment.schemeCode} to ${currentParticipant.name}`, {
      description: `Role: ${newAssignment.calculationRole} (${
        newAssignment.isPrimaryRole ? "Primary" : "Secondary"
      }) with ${newAssignment.targetAllocationPercent}% allocation.`,
    });
  };

  // =========================================================================
  // Handlers: Save Edited Scheme Assignment
  // =========================================================================
  const handleSaveEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    if (editingAssignment.isPrimaryRole) {
      const conflict = currentParticipant.assignments.find(
        (asg) =>
          asg.id !== editingAssignment.id &&
          asg.schemeCode === editingAssignment.schemeCode &&
          asg.isPrimaryRole &&
          asg.status === "Active" &&
          doDatesOverlap(
            asg.effectiveFrom,
            asg.effectiveTo,
            editingAssignment.effectiveFrom,
            editingAssignment.effectiveTo,
          ),
      );

      if (conflict) {
        toast.error("Primary Role Conflict", {
          description: `Only 1 primary calculation role per scheme per period allowed. Conflict with assignment ${conflict.id}.`,
        });
        return;
      }
    }

    const prevAssignment = currentParticipant.assignments.find(
      (a) => a.id === editingAssignment.id,
    );

    const hist: ParticipantHistoryItem = {
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "admin.incentive@telesonic.lk",
      role: "Incentive Administrator",
      eventType: "Quota Adjusted",
      schemeCode: editingAssignment.schemeCode,
      previousValue: prevAssignment
        ? `${prevAssignment.calculationRole} (${prevAssignment.targetAllocationPercent}%, ${prevAssignment.status})`
        : "N/A",
      newValue: `${editingAssignment.calculationRole} (${editingAssignment.targetAllocationPercent}%, ${editingAssignment.status})`,
      changeReason: editingAssignment.notes || "Assignment details updated",
    };

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === currentParticipant.id) {
          return {
            ...p,
            assignments: p.assignments.map((a) =>
              a.id === editingAssignment.id ? editingAssignment : a,
            ),
            history: [hist, ...p.history],
          };
        }
        return p;
      }),
    );

    setEditingAssignment(null);
    toast.success("Assignment updated successfully.");
  };

  // =========================================================================
  // Handlers: Remove Scheme Assignment
  // =========================================================================
  const handleRemoveAssignment = (assignmentId: string) => {
    const toRemove = currentParticipant.assignments.find((a) => a.id === assignmentId);
    if (!toRemove) return;

    const hist: ParticipantHistoryItem = {
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      author: "admin.incentive@telesonic.lk",
      role: "Incentive Administrator",
      eventType: "Role Reassigned",
      schemeCode: toRemove.schemeCode,
      previousValue: `${toRemove.calculationRole} (${toRemove.schemeCode})`,
      newValue: "Unassigned / Removed",
      changeReason: "Assignment removed by Incentive Administrator",
    };

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === currentParticipant.id) {
          return {
            ...p,
            assignments: p.assignments.filter((a) => a.id !== assignmentId),
            history: [hist, ...p.history],
          };
        }
        return p;
      }),
    );

    toast.info(`Assignment for ${toRemove.schemeCode} removed.`);
  };

  // =========================================================================
  // Handlers: Create New Participant
  // =========================================================================
  const handleCreateParticipant = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newParticipantData.name.trim()) {
      toast.error("Employee Name is mandatory.");
      return;
    }
    if (!newParticipantData.payrollId.trim()) {
      toast.error("Payroll ID is mandatory.");
      return;
    }
    if (!newParticipantData.division.trim()) {
      toast.error("Division is mandatory.");
      return;
    }
    if (!newParticipantData.designation.trim()) {
      toast.error("Designation is mandatory.");
      return;
    }

    const created: ParticipantRecord = {
      id: newParticipantData.id || `EMP-${1030 + participants.length}`,
      name: newParticipantData.name,
      salesEmployeeCode: newParticipantData.salesEmployeeCode || `SL-${500 + participants.length}`,
      division: newParticipantData.division,
      segmentChannel: newParticipantData.segmentChannel,
      areaManager: newParticipantData.areaManager,
      designation: newParticipantData.designation,
      payrollId: newParticipantData.payrollId,
      active: newParticipantData.active,
      joinDate: new Date().toISOString().substring(0, 10),
      assignments: [],
      history: [
        {
          id: `HIST-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          author: "admin.incentive@telesonic.lk",
          role: "Incentive Administrator",
          eventType: "Profile Created",
          previousValue: "None",
          newValue: `${newParticipantData.name} (${newParticipantData.id})`,
          changeReason: "New participant profile registered into Incentive Master",
        },
      ],
    };

    setParticipants((prev) => [created, ...prev]);
    setSelectedParticipantId(created.id);
    setIsNewParticipantModalOpen(false);

    toast.success(`Participant ${created.name} registered successfully.`, {
      description: `Employee ID: ${created.id} • Payroll: ${created.payrollId}`,
    });
  };

  // =========================================================================
  // Handlers: Export & Print
  // =========================================================================
  const handleExportCSV = () => {
    const csvRows = [
      [
        "Employee Code",
        "Employee Name",
        "Sales Employee Code",
        "Division",
        "Segment / Channel",
        "Area Manager",
        "Designation",
        "Payroll ID",
        "Active Status",
        "Scheme Code",
        "Calculation Role",
        "Primary Role",
        "Effective From",
        "Effective To",
        "Target Allocation %",
        "Assignment Status",
      ],
    ];

    participants.forEach((p) => {
      if (p.assignments.length === 0) {
        csvRows.push([
          p.id,
          `"${p.name}"`,
          p.salesEmployeeCode,
          `"${p.division}"`,
          `"${p.segmentChannel}"`,
          `"${p.areaManager}"`,
          `"${p.designation}"`,
          p.payrollId,
          p.active ? "Active" : "Inactive",
          "None",
          "None",
          "No",
          "N/A",
          "N/A",
          "0%",
          "N/A",
        ]);
      } else {
        p.assignments.forEach((asg) => {
          csvRows.push([
            p.id,
            `"${p.name}"`,
            p.salesEmployeeCode,
            `"${p.division}"`,
            `"${p.segmentChannel}"`,
            `"${p.areaManager}"`,
            `"${p.designation}"`,
            p.payrollId,
            p.active ? "Active" : "Inactive",
            asg.schemeCode,
            `"${asg.calculationRole}"`,
            asg.isPrimaryRole ? "Yes" : "No",
            asg.effectiveFrom,
            asg.effectiveTo || "Ongoing",
            `${asg.targetAllocationPercent}%`,
            asg.status,
          ]);
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Incentive_Participant_Profiles_${new Date().toISOString().substring(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Participant Profiles CSV exported successfully.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-lg p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-md">
              <UserCheck size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Incentive Participant Profile
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Shield size={12} />
                  Role: Incentive Administrator
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Link sales employees, managers, HODs, and technicians to schemes, divisions,
                segments, area managers, and payroll IDs.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Profile</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsNewParticipantModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>New Participant</span>
          </Button>
        </div>
      </div>

      {/* Participant Switcher & Quick Navigation Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Participant Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-foreground">Participant Directory</h2>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {filteredParticipants.length} of {participants.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, EMP code, payroll..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/40 border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Division & Status Filters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                  Division
                </label>
                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className="w-full p-1.5 text-xs bg-card border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                >
                  <option value="All">All Divisions</option>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-1.5 text-xs bg-card border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Participant List */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 divide-y divide-border/60">
              {filteredParticipants.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No participants match your filter.
                </div>
              ) : (
                filteredParticipants.map((p) => {
                  const isSelected = p.id === currentParticipant.id;
                  const activeCount = p.assignments.filter((a) => a.status === "Active").length;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedParticipantId(p.id)}
                      className={`pt-2 pb-2 px-2.5 rounded-md cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/10 border-l-4 border-l-primary text-foreground shadow-2xs"
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs truncate">{p.name}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                p.active
                                  ? "bg-success-soft text-success"
                                  : "bg-destructive-soft text-destructive"
                              }`}
                            >
                              {p.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {p.designation}
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground shrink-0 font-medium">
                          {p.id}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="truncate max-w-[170px]">{p.division}</span>
                        <span className="font-medium text-primary bg-primary/5 px-1 rounded">
                          {activeCount} {activeCount === 1 ? "scheme" : "schemes"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Cross-Screen Navigation Links */}
          <div className="bg-card border rounded-lg p-3.5 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Related Incentive Screens
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                onClick={() => onNavigateScreen?.("scheme-master")}
                className="flex items-center justify-between p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers size={13} className="text-primary" />
                  <span>Incentive Scheme Master</span>
                </div>
                <ChevronRight size={13} />
              </button>

              <button
                onClick={() => onNavigateScreen?.("rate-matrix")}
                className="flex items-center justify-between p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={13} className="text-info" />
                  <span>Commission Rate Matrix</span>
                </div>
                <ChevronRight size={13} />
              </button>

              <button
                onClick={() => onNavigateScreen?.("slab-table")}
                className="flex items-center justify-between p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-secondary" />
                  <span>Target Incentive Slab Table</span>
                </div>
                <ChevronRight size={13} />
              </button>

              <button
                onClick={() => onNavigateScreen?.("monthly-target")}
                className="flex items-center justify-between p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Target size={13} className="text-warning" />
                  <span>Monthly Target Entry</span>
                </div>
                <ChevronRight size={13} />
              </button>

              <button
                onClick={() => onNavigateScreen?.("attendance-import")}
                className="flex items-center justify-between p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud size={13} className="text-info" />
                  <span>Attendance & Leave Import</span>
                </div>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Header Fields & Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card: Mandatory Participant Fields */}
          <div className="bg-card border rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground">{currentParticipant.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-primary">
                      {currentParticipant.id}
                    </span>
                    <span>•</span>
                    <span>Payroll ID: {currentParticipant.payrollId}</span>
                    <span>•</span>
                    <span>Sales Code: {currentParticipant.salesEmployeeCode || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    currentParticipant.active
                      ? "bg-success-soft text-success border border-success/30"
                      : "bg-destructive-soft text-destructive border border-destructive/30"
                  }`}
                >
                  <CheckCircle2 size={12} />
                  {currentParticipant.active ? "Active" : "Inactive"}
                </span>

                <Button
                  size="sm"
                  variant={isHeaderDirty ? "default" : "outline"}
                  onClick={() => handleSaveHeader()}
                  disabled={!isHeaderDirty}
                  className={`h-8 gap-1.5 text-xs font-medium cursor-pointer ${
                    isHeaderDirty
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  <Save size={13} />
                  <span>Save Header Details</span>
                </Button>
              </div>
            </div>

            {/* Header Mandatory Form Fields */}
            <form onSubmit={handleSaveHeader}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Employee Name (Mandatory) */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Employee Name</span>
                    <span className="text-destructive font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={headerForm.name}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                    placeholder="Enter full employee name"
                    required
                  />
                </div>

                {/* Sales Employee Code */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Sales Employee Code</span>
                    <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={headerForm.salesEmployeeCode}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        salesEmployeeCode: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary font-mono text-foreground"
                    placeholder="e.g. SL-204"
                  />
                </div>

                {/* Division (Mandatory) */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Division</span>
                    <span className="text-destructive font-bold">*</span>
                  </label>
                  <select
                    value={headerForm.division}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        division: e.target.value,
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                    required
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Segment / Channel */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Segment / Channel</span>
                  </label>
                  <select
                    value={headerForm.segmentChannel}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        segmentChannel: e.target.value,
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  >
                    {SEGMENT_CHANNELS.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area Manager */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Area Manager</span>
                  </label>
                  <select
                    value={headerForm.areaManager}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        areaManager: e.target.value,
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  >
                    {AREA_MANAGERS.map((am) => (
                      <option key={am} value={am}>
                        {am}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation (Mandatory) */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Designation</span>
                    <span className="text-destructive font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={headerForm.designation}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                    placeholder="e.g. Senior Service Engineer"
                    required
                  />
                </div>

                {/* Payroll ID (Mandatory) */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Payroll ID</span>
                    <span className="text-destructive font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={headerForm.payrollId}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        payrollId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary font-mono text-foreground"
                    placeholder="e.g. PAY-88342"
                    required
                  />
                </div>

                {/* Active (Mandatory) */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>Active Status</span>
                    <span className="text-destructive font-bold">*</span>
                  </label>
                  <select
                    value={headerForm.active ? "true" : "false"}
                    onChange={(e) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        active: e.target.value === "true",
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground font-semibold"
                    required
                  >
                    <option value="true">Active (Eligible for Runs)</option>
                    <option value="false">Inactive / Suspended</option>
                  </select>
                </div>

                {/* Employee ID (Read-only System Key) */}
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                    <span>Employee ID / Master Key</span>
                  </label>
                  <div className="w-full px-3 py-1.5 text-xs bg-muted/60 border rounded-md font-mono text-muted-foreground">
                    {currentParticipant.id}
                  </div>
                </div>
              </div>

              {isHeaderDirty && (
                <div className="mt-3 p-2.5 rounded bg-warning-soft border border-warning/30 flex items-center justify-between text-xs text-warning-foreground">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-warning shrink-0" />
                    <span>You have unsaved changes in the participant header fields.</span>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 text-xs bg-warning text-warning-foreground hover:bg-warning/90 cursor-pointer"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>

            {/* Quick KPI Row for Selected Participant */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t text-xs">
              <div className="bg-muted/40 p-2.5 rounded-md border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Enrolled Schemes
                </span>
                <span className="text-base font-bold text-foreground">
                  {currentStats.totalAssignments}
                </span>
              </div>
              <div className="bg-muted/40 p-2.5 rounded-md border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Active Schemes
                </span>
                <span className="text-base font-bold text-success">
                  {currentStats.activeAssignments}
                </span>
              </div>
              <div className="bg-muted/40 p-2.5 rounded-md border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Primary Roles
                </span>
                <span className="text-base font-bold text-primary">
                  {currentStats.primaryRolesCount}
                </span>
              </div>
              <div className="bg-muted/40 p-2.5 rounded-md border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Total Allocation
                </span>
                <span className="text-base font-bold text-foreground">
                  {currentStats.totalAllocation}%
                </span>
              </div>
            </div>
          </div>

          {/* Main Tabs: Scheme Assignments & History */}
          <div className="bg-card border rounded-lg shadow-xs overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-5 pt-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <TabsList className="bg-muted/60 p-1">
                  <TabsTrigger
                    value="assignments"
                    className="gap-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-xs"
                  >
                    <Layers size={14} />
                    <span>Scheme Assignments</span>
                    <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
                      {currentParticipant.assignments.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="gap-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-xs"
                  >
                    <HistoryIcon size={14} />
                    <span>History & Audit</span>
                    <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold">
                      {currentParticipant.history.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {activeTab === "assignments" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setAssignmentValidationError(null);
                      setIsAddAssignmentModalOpen(true);
                    }}
                    className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs mb-3 sm:mb-0"
                  >
                    <Plus size={13} />
                    <span>Add Scheme Assignment</span>
                  </Button>
                )}
              </div>

              {/* TAB 1: Scheme Assignments */}
              <TabsContent value="assignments" className="p-0 m-0">
                <div className="p-4 bg-muted/20 border-b flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Info size={14} className="text-primary shrink-0" />
                    <span>
                      <strong>Rule:</strong> Only 1 primary calculation role per scheme per period
                      is allowed. Secondary contributions are permitted.
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-muted/60 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Scheme</th>
                        <th className="px-4 py-3">Calculation Role</th>
                        <th className="px-4 py-3">Role Tier</th>
                        <th className="px-4 py-3">Effective From</th>
                        <th className="px-4 py-3">Effective To</th>
                        <th className="px-4 py-3 text-right">Target Allocation</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentParticipant.assignments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-8 text-center text-muted-foreground text-xs"
                          >
                            No schemes currently assigned to this participant. Click "Add Scheme
                            Assignment" to enroll.
                          </td>
                        </tr>
                      ) : (
                        currentParticipant.assignments.map((asg) => (
                          <tr key={asg.id} className="hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-mono font-bold text-primary block">
                                  {asg.schemeCode}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {asg.schemeName}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3 font-medium text-foreground">
                              {asg.calculationRole}
                            </td>

                            <td className="px-4 py-3">
                              {asg.isPrimaryRole ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-primary/15 text-primary border border-primary/20">
                                  <BadgeCheck size={12} />
                                  Primary
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground">
                                  Secondary
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 font-mono text-muted-foreground">
                              {asg.effectiveFrom}
                            </td>

                            <td className="px-4 py-3 font-mono text-muted-foreground">
                              {asg.effectiveTo || (
                                <span className="text-xs text-muted-foreground italic">
                                  Open-ended
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                              {asg.targetAllocationPercent}%
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  asg.status === "Active"
                                    ? "bg-success-soft text-success"
                                    : asg.status === "Pending Approval"
                                      ? "bg-warning-soft text-warning"
                                      : "bg-destructive-soft text-destructive"
                                }`}
                              >
                                {asg.status}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingAssignment(asg)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Edit Assignment"
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAssignment(asg.id)}
                                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive-soft cursor-pointer"
                                  title="Remove Assignment"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB 2: History & Audit Log */}
              <TabsContent value="history" className="p-0 m-0">
                <div className="p-4 bg-muted/20 border-b flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary shrink-0" />
                    <span>
                      Audit log records all role modifications, scheme enrollments, and divisional
                      changes performed by Incentive Administrator.
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-muted/60 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Date & Time</th>
                        <th className="px-4 py-3">Event Type</th>
                        <th className="px-4 py-3">Scheme</th>
                        <th className="px-4 py-3">Previous Value</th>
                        <th className="px-4 py-3">New Value</th>
                        <th className="px-4 py-3">Modified By</th>
                        <th className="px-4 py-3">Change Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentParticipant.history.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-muted-foreground text-xs"
                          >
                            No revision history found for this participant.
                          </td>
                        </tr>
                      ) : (
                        currentParticipant.history.map((hist) => (
                          <tr key={hist.id} className="hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                              {hist.timestamp}
                            </td>

                            <td className="px-4 py-3">
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground">
                                {hist.eventType}
                              </span>
                            </td>

                            <td className="px-4 py-3 font-mono font-bold text-primary">
                              {hist.schemeCode || "-"}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground max-w-[150px] truncate">
                              {hist.previousValue}
                            </td>

                            <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">
                              {hist.newValue}
                            </td>

                            <td className="px-4 py-3">
                              <div className="text-[11px]">
                                <span className="font-semibold text-foreground block">
                                  {hist.author}
                                </span>
                                <span className="text-muted-foreground">{hist.role}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">{hist.changeReason}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Add Scheme Assignment with 1 Primary Role validation             */}
      {/* ========================================================================= */}
      {isAddAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-primary/10 text-primary">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Add Scheme Assignment</h3>
                  <p className="text-xs text-muted-foreground">
                    Assign {currentParticipant.name} ({currentParticipant.id}) to an incentive
                    scheme.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAssignmentModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleValidateAndAddAssignment} className="p-5 space-y-4">
              {/* Validation alert banner */}
              {assignmentValidationError && (
                <div className="p-3 rounded-md bg-destructive-soft border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div className="leading-tight">{assignmentValidationError}</div>
                </div>
              )}

              {/* Scheme Selection (Mandatory) */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Scheme <span className="text-destructive">*</span>
                </label>
                <select
                  value={newAssignment.schemeCode}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      schemeCode: e.target.value,
                    }))
                  }
                  className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  required
                >
                  {AVAILABLE_SCHEMES_LIST.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} — {s.name} ({s.division})
                    </option>
                  ))}
                </select>
              </div>

              {/* Calculation Role (Mandatory) */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Calculation Role <span className="text-destructive">*</span>
                </label>
                <select
                  value={newAssignment.calculationRole}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      calculationRole: e.target.value,
                    }))
                  }
                  className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  required
                >
                  {CALCULATION_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Role Checkbox */}
              <div className="p-3 bg-muted/40 border rounded-md">
                <label className="flex items-start gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={newAssignment.isPrimaryRole}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        isPrimaryRole: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-semibold text-foreground block">
                      Primary Calculation Role
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Enforces: Only 1 primary role per scheme per period. Calculates direct base
                      incentives.
                    </span>
                  </div>
                </label>
              </div>

              {/* Effective Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Effective From <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={newAssignment.effectiveFrom}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        effectiveFrom: e.target.value,
                      }))
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Effective To{" "}
                    <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={newAssignment.effectiveTo}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        effectiveTo: e.target.value,
                      }))
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              {/* Allocation % & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Target Allocation %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newAssignment.targetAllocationPercent}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          targetAllocationPercent: Number(e.target.value),
                        }))
                      }
                      className="w-full p-2 pr-7 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground font-mono"
                      required
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Status</label>
                  <select
                    value={newAssignment.status}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        status: e.target.value as SchemeAssignmentStatus,
                      }))
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Assignment Notes */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Assignment Notes / Justification
                </label>
                <input
                  type="text"
                  value={newAssignment.notes}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="e.g. Lead role assigned for Colombo territory"
                  className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Add Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Edit Scheme Assignment                                           */}
      {/* ========================================================================= */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-surface bg-card border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-primary/10 text-primary">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Edit Scheme Assignment</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {editingAssignment.schemeCode} • {editingAssignment.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingAssignment(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditAssignment} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Calculation Role
                </label>
                <select
                  value={editingAssignment.calculationRole}
                  onChange={(e) =>
                    setEditingAssignment((prev) =>
                      prev ? { ...prev, calculationRole: e.target.value } : null,
                    )
                  }
                  className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  required
                >
                  {CALCULATION_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-muted/40 border rounded-md">
                <label className="flex items-start gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingAssignment.isPrimaryRole}
                    onChange={(e) =>
                      setEditingAssignment((prev) =>
                        prev ? { ...prev, isPrimaryRole: e.target.checked } : null,
                      )
                    }
                    className="mt-0.5 rounded border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-semibold text-foreground block">
                      Primary Calculation Role
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Only 1 primary role per scheme per period permitted.
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={editingAssignment.effectiveFrom}
                    onChange={(e) =>
                      setEditingAssignment((prev) =>
                        prev ? { ...prev, effectiveFrom: e.target.value } : null,
                      )
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Effective To
                  </label>
                  <input
                    type="date"
                    value={editingAssignment.effectiveTo}
                    onChange={(e) =>
                      setEditingAssignment((prev) =>
                        prev ? { ...prev, effectiveTo: e.target.value } : null,
                      )
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Target Allocation %
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editingAssignment.targetAllocationPercent}
                    onChange={(e) =>
                      setEditingAssignment((prev) =>
                        prev
                          ? {
                              ...prev,
                              targetAllocationPercent: Number(e.target.value),
                            }
                          : null,
                      )
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Status</label>
                  <select
                    value={editingAssignment.status}
                    onChange={(e) =>
                      setEditingAssignment((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: e.target.value as SchemeAssignmentStatus,
                            }
                          : null,
                      )
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Change Note / Reference
                </label>
                <input
                  type="text"
                  value={editingAssignment.notes || ""}
                  onChange={(e) =>
                    setEditingAssignment((prev) =>
                      prev ? { ...prev, notes: e.target.value } : null,
                    )
                  }
                  className="w-full p-2 text-xs bg-background border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  placeholder="Reason for adjustment"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAssignment(null)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: New Participant Registration Modal                               */}
      {/* ========================================================================= */}
      {isNewParticipantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-surface bg-card border rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-primary/10 text-primary">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Enroll New Participant Profile
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Create profile in Incentive Master with employee and payroll keys.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewParticipantModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateParticipant} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Employee Code <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={newParticipantData.id}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        id: e.target.value,
                      }))
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={newParticipantData.name}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Ruwan Jayakody"
                    className="w-full p-2 text-xs bg-background border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Payroll ID <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={newParticipantData.payrollId}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        payrollId: e.target.value,
                      }))
                    }
                    placeholder="e.g. PAY-88910"
                    className="w-full p-2 text-xs bg-background border rounded-md font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Sales Employee Code
                  </label>
                  <input
                    type="text"
                    value={newParticipantData.salesEmployeeCode}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        salesEmployeeCode: e.target.value,
                      }))
                    }
                    placeholder="e.g. SL-508"
                    className="w-full p-2 text-xs bg-background border rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Division <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={newParticipantData.division}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        division: e.target.value,
                      }))
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md"
                    required
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Designation <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={newParticipantData.designation}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    placeholder="e.g. Service Engineer"
                    className="w-full p-2 text-xs bg-background border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Segment / Channel
                  </label>
                  <select
                    value={newParticipantData.segmentChannel}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        segmentChannel: e.target.value,
                      }))
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md"
                  >
                    {SEGMENT_CHANNELS.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Area Manager
                  </label>
                  <select
                    value={newParticipantData.areaManager}
                    onChange={(e) =>
                      setNewParticipantData((prev) => ({
                        ...prev,
                        areaManager: e.target.value,
                      }))
                    }
                    className="w-full p-2 text-xs bg-background border rounded-md"
                  >
                    {AREA_MANAGERS.map((am) => (
                      <option key={am} value={am}>
                        {am}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewParticipantModalOpen(false)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Create Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
