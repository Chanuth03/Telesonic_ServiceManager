import React, { useState, useMemo, useEffect } from "react";
import {
  Wrench,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
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
  RefreshCw,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Eye,
  SlidersHorizontal,
  CheckSquare,
  AlertOctagon,
  ArrowUpRight,
  Database,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

export type PerformanceStatus = "Draft" | "Locked" | "Used in Run";
export type PerformanceRole = "Service HOD" | "Incentive Administrator";
export type JobEligibility = "HOD Eligible" | "Partial" | "Not Eligible" | "Excluded";

export interface TechnicianPerformanceLine {
  id: string;
  employeeCode: string;
  employeeName: string;
  role: string;
  division: string;
  closedJobs: number;
  hodEligible: number;
  partial: number;
  notEligible: number;
  excluded: number;
  avgQuality: number; // e.g. 9.2 / 10
  avgDiscipline: number; // e.g. 9.5 / 10
  poorRepeats: number; // Count of repeat calls flagged as poor service
  reviewStatus: "Reviewed" | "Pending Review" | "Exceptions Found";
  notes?: string;
}

export interface ServiceJobDetail {
  id: string;
  jobTicketNo: string;
  employeeCode: string;
  employeeName: string;
  customerName: string;
  equipmentModel: string;
  completionDate: string;
  faultCategory: string;
  firstTimeFix: boolean;
  qualityScore: number; // /10
  disciplineScore: number; // /10
  eligibility: JobEligibility;
  isPoorRepeat: boolean;
  repeatReferenceJob?: string;
  hodReviewed: boolean;
  closureStatus: "Closed" | "Open" | "Pending QA";
  notes?: string;
}

export interface PerformanceAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

// Initial Mock Technician Summary Lines
const INITIAL_TECH_LINES: TechnicianPerformanceLine[] = [
  {
    id: "tech-1",
    employeeCode: "EMP-1021",
    employeeName: "Kasun Jayawardena",
    role: "Senior Service Technician",
    division: "Consumer Electronics",
    closedJobs: 48,
    hodEligible: 44,
    partial: 3,
    notEligible: 1,
    excluded: 0,
    avgQuality: 9.4,
    avgDiscipline: 9.7,
    poorRepeats: 0,
    reviewStatus: "Reviewed",
    notes: "High FTF rate, zero poor repeats",
  },
  {
    id: "tech-2",
    employeeCode: "EMP-1022",
    employeeName: "Pradeep Bandara",
    role: "Field Service Technician",
    division: "Consumer Electronics",
    closedJobs: 42,
    hodEligible: 36,
    partial: 4,
    notEligible: 1,
    excluded: 1,
    avgQuality: 8.8,
    avgDiscipline: 9.1,
    poorRepeats: 1,
    reviewStatus: "Exceptions Found",
    notes: "1 poor repeat flagged on inverter board rework",
  },
  {
    id: "tech-3",
    employeeCode: "EMP-1023",
    employeeName: "Ruwan Wijesinghe",
    role: "AC & Refrigeration Technician",
    division: "Commercial Air Conditioning",
    closedJobs: 38,
    hodEligible: 34,
    partial: 2,
    notEligible: 2,
    excluded: 0,
    avgQuality: 9.1,
    avgDiscipline: 9.3,
    poorRepeats: 0,
    reviewStatus: "Reviewed",
    notes: "Chiller maintenance project complete",
  },
  {
    id: "tech-4",
    employeeCode: "EMP-1024",
    employeeName: "Dilshan Madusanka",
    role: "Junior Service Tech",
    division: "Consumer Electronics",
    closedJobs: 30,
    hodEligible: 22,
    partial: 5,
    notEligible: 2,
    excluded: 1,
    avgQuality: 7.9,
    avgDiscipline: 8.4,
    poorRepeats: 2,
    reviewStatus: "Exceptions Found",
    notes: "2 poor repeats under senior review",
  },
  {
    id: "tech-5",
    employeeCode: "EMP-1025",
    employeeName: "Nuwan Fernando",
    role: "Solar PV Maintenance Tech",
    division: "Renewable Energy",
    closedJobs: 35,
    hodEligible: 33,
    partial: 2,
    notEligible: 0,
    excluded: 0,
    avgQuality: 9.6,
    avgDiscipline: 9.8,
    poorRepeats: 0,
    reviewStatus: "Reviewed",
    notes: "Top customer satisfaction on commercial inverters",
  },
  {
    id: "tech-6",
    employeeCode: "EMP-1026",
    employeeName: "Chaminda Warnakula",
    role: "Senior Service Technician",
    division: "Consumer Electronics",
    closedJobs: 26,
    hodEligible: 24,
    partial: 2,
    notEligible: 0,
    excluded: 0,
    avgQuality: 9.5,
    avgDiscipline: 9.6,
    poorRepeats: 0,
    reviewStatus: "Reviewed",
    notes: "Advanced diagnostic support calls",
  },
  {
    id: "tech-7",
    employeeCode: "EMP-1029",
    employeeName: "Dinesh Priyashantha",
    role: "Field Service Technician",
    division: "Consumer Electronics",
    closedJobs: 40,
    hodEligible: 37,
    partial: 2,
    notEligible: 1,
    excluded: 0,
    avgQuality: 9.0,
    avgDiscipline: 9.2,
    poorRepeats: 0,
    reviewStatus: "Reviewed",
    notes: "Consistent completion velocity",
  },
  {
    id: "tech-8",
    employeeCode: "EMP-1030",
    employeeName: "Mahesh Gunawardena",
    role: "AC & Refrigeration Technician",
    division: "Commercial Air Conditioning",
    closedJobs: 36,
    hodEligible: 30,
    partial: 3,
    notEligible: 2,
    excluded: 1,
    avgQuality: 8.4,
    avgDiscipline: 8.9,
    poorRepeats: 1,
    reviewStatus: "Exceptions Found",
    notes: "1 poor repeat on duct leak sealing",
  },
  {
    id: "tech-9",
    employeeCode: "EMP-1031",
    employeeName: "Niroshan De Silva",
    role: "Diagnostic Specialist",
    division: "Commercial Air Conditioning",
    closedJobs: 32,
    hodEligible: 30,
    partial: 2,
    notEligible: 0,
    excluded: 0,
    avgQuality: 9.7,
    avgDiscipline: 9.8,
    poorRepeats: 0,
    reviewStatus: "Reviewed",
    notes: "Expert escalation calls",
  },
  {
    id: "tech-10",
    employeeCode: "EMP-1032",
    employeeName: "Sunil Jayasuriya",
    role: "Solar PV Maintenance Tech",
    division: "Renewable Energy",
    closedJobs: 34,
    hodEligible: 31,
    partial: 2,
    notEligible: 1,
    excluded: 0,
    avgQuality: 9.2,
    avgDiscipline: 9.4,
    poorRepeats: 0,
    reviewStatus: "Reviewed",
    notes: "High grid synchronisation efficiency",
  },
];

// Initial Mock Job Tickets
const INITIAL_JOB_TICKETS: ServiceJobDetail[] = [
  {
    id: "job-101",
    jobTicketNo: "SRV-2026-0891",
    employeeCode: "EMP-1021",
    employeeName: "Kasun Jayawardena",
    customerName: "Aitken Spence Hotel PLC",
    equipmentModel: "Daikin VRV-IV 12HP Heat Recovery",
    completionDate: "04-May-2026",
    faultCategory: "Inverter Compressor PCB Error Code U4",
    firstTimeFix: true,
    qualityScore: 9.8,
    disciplineScore: 10.0,
    eligibility: "HOD Eligible",
    isPoorRepeat: false,
    hodReviewed: true,
    closureStatus: "Closed",
    notes: "Verified by HOD. Flawless first-time fix with OEM thermistor replacement.",
  },
  {
    id: "job-102",
    jobTicketNo: "SRV-2026-0904",
    employeeCode: "EMP-1022",
    employeeName: "Pradeep Bandara",
    customerName: "Singer Mega Showroom - Kandy",
    equipmentModel: "Panasonic 4-Way Cassette 36,000 BTU",
    completionDate: "07-May-2026",
    faultCategory: "Condensate Drain Pump Overflow / Float Sensor",
    firstTimeFix: false,
    qualityScore: 6.2,
    disciplineScore: 8.5,
    eligibility: "Not Eligible",
    isPoorRepeat: true,
    repeatReferenceJob: "SRV-2026-0742 (Closed 22-Apr)",
    hodReviewed: true,
    closureStatus: "Closed",
    notes:
      "Flagged as Poor Service: Drain clamp improperly secured causing return flood visit within 15 days.",
  },
  {
    id: "job-103",
    jobTicketNo: "SRV-2026-0922",
    employeeCode: "EMP-1023",
    employeeName: "Ruwan Wijesinghe",
    customerName: "Hemas Hospitals Thalawathugoda",
    equipmentModel: "Trane Air-Cooled Scroll Chiller 50TR",
    completionDate: "09-May-2026",
    faultCategory: "Low Suction Pressure / Expansion Valve Calibration",
    firstTimeFix: true,
    qualityScore: 9.4,
    disciplineScore: 9.5,
    eligibility: "HOD Eligible",
    isPoorRepeat: false,
    hodReviewed: true,
    closureStatus: "Closed",
    notes: "Critical ICU unit restored within 2-hour SLA.",
  },
  {
    id: "job-104",
    jobTicketNo: "SRV-2026-0951",
    employeeCode: "EMP-1024",
    employeeName: "Dilshan Madusanka",
    customerName: "Dialog Axiata Cell Tower #44",
    equipmentModel: "Huawei Solar Inverter 20kW",
    completionDate: "10-May-2026",
    faultCategory: "DC Ground Fault / Array Isolation Alarm",
    firstTimeFix: false,
    qualityScore: 5.8,
    disciplineScore: 7.9,
    eligibility: "Not Eligible",
    isPoorRepeat: true,
    repeatReferenceJob: "SRV-2026-0810 (Closed 28-Apr)",
    hodReviewed: true,
    closureStatus: "Closed",
    notes:
      "Flagged as Poor Repeat: MC4 connector crimp failed after 12 days, resulting in downtime call.",
  },
  {
    id: "job-105",
    jobTicketNo: "SRV-2026-0978",
    employeeCode: "EMP-1025",
    employeeName: "Nuwan Fernando",
    customerName: "Brandix Apparel Logistics Hub",
    equipmentModel: "SMA Sunny Tripower 50kW",
    completionDate: "11-May-2026",
    faultCategory: "Grid Parameter Drift / Firmware Update",
    firstTimeFix: true,
    qualityScore: 9.7,
    disciplineScore: 10.0,
    eligibility: "HOD Eligible",
    isPoorRepeat: false,
    hodReviewed: true,
    closureStatus: "Closed",
    notes: "Full system telemetry re-established.",
  },
  {
    id: "job-106",
    jobTicketNo: "SRV-2026-1002",
    employeeCode: "EMP-1022",
    employeeName: "Pradeep Bandara",
    customerName: "Keells Super - Moratuwa",
    equipmentModel: "Carrier Multi-Deck Commercial Freezer",
    completionDate: "11-May-2026",
    faultCategory: "Evaporator Fan Motor Bearing Seizure",
    firstTimeFix: true,
    qualityScore: 8.9,
    disciplineScore: 9.0,
    eligibility: "Partial",
    isPoorRepeat: false,
    hodReviewed: true,
    closureStatus: "Closed",
    notes: "Partial incentive credit: Shared call with apprentice technician.",
  },
  {
    id: "job-107",
    jobTicketNo: "SRV-2026-1015",
    employeeCode: "EMP-1030",
    employeeName: "Mahesh Gunawardena",
    customerName: "Cinnamon Grand Colombo",
    equipmentModel: "Mitsubishi Electric City Multi 16HP",
    completionDate: "12-May-2026",
    faultCategory: "Refrigerant R410A Leak at Flare Nut",
    firstTimeFix: false,
    qualityScore: 6.5,
    disciplineScore: 8.0,
    eligibility: "Not Eligible",
    isPoorRepeat: true,
    repeatReferenceJob: "SRV-2026-0865 (Closed 02-May)",
    hodReviewed: true,
    closureStatus: "Closed",
    notes:
      "Flagged as Poor Repeat: Leak test was rushed on first call; joint required re-brazing on callback.",
  },
  {
    id: "job-108",
    jobTicketNo: "SRV-2026-1033",
    employeeCode: "EMP-1021",
    employeeName: "Kasun Jayawardena",
    customerName: "National Development Bank HQ",
    equipmentModel: "Liebert Emerson Precision Data Center AC",
    completionDate: "12-May-2026",
    faultCategory: "Microprocessor Controller Board Replacement",
    firstTimeFix: true,
    qualityScore: 9.9,
    disciplineScore: 10.0,
    eligibility: "HOD Eligible",
    isPoorRepeat: false,
    hodReviewed: true,
    closureStatus: "Closed",
    notes: "Server room temperature kept within 21°C SLA throughout swap.",
  },
  {
    id: "job-109",
    jobTicketNo: "SRV-2026-1055",
    employeeCode: "EMP-1024",
    employeeName: "Dilshan Madusanka",
    customerName: "Softlogic Retail - Nugegoda",
    equipmentModel: "Samsung 24,000 BTU Inverter Split",
    completionDate: "13-May-2026",
    faultCategory: "Indoor Cross-Flow Fan Noise",
    firstTimeFix: false,
    qualityScore: 5.5,
    disciplineScore: 7.5,
    eligibility: "Not Eligible",
    isPoorRepeat: true,
    repeatReferenceJob: "SRV-2026-0920 (Closed 05-May)",
    hodReviewed: true,
    closureStatus: "Closed",
    notes: "Customer complained of repeat vibrating noise after incomplete bushing replacement.",
  },
  {
    id: "job-110",
    jobTicketNo: "SRV-2026-1070",
    employeeCode: "EMP-1031",
    employeeName: "Niroshan De Silva",
    customerName: "Lanka Hospitals Blood Bank",
    equipmentModel: "Ultra-Low Temp Cold Chain Unit -80°C",
    completionDate: "13-May-2026",
    faultCategory: "Cascade Compressor Stage 2 Interstage Pressure",
    firstTimeFix: true,
    qualityScore: 10.0,
    disciplineScore: 10.0,
    eligibility: "HOD Eligible",
    isPoorRepeat: false,
    hodReviewed: true,
    closureStatus: "Closed",
    notes: "Zero temperature excursion. High-complexity repair validated by HOD.",
  },
];

// Initial Audit History
const INITIAL_AUDIT_LOG: PerformanceAuditEntry[] = [
  {
    id: "aud-01",
    timestamp: "12-May-2026 14:35 IST",
    user: "Automated Data Pipeline",
    role: "System Integration",
    action: "Source Sync Completed",
    details: "Synchronized 363 closed calls from Servio Service Desk / SAP B1 Service Module.",
  },
  {
    id: "aud-02",
    timestamp: "12-May-2026 16:10 IST",
    user: "Chaminda Warnakula",
    role: "Service HOD",
    action: "Poor Repeat Review",
    details: "Classified 4 repeat calls as Poor Workmanship after customer callback inspection.",
  },
  {
    id: "aud-03",
    timestamp: "12-May-2026 17:00 IST",
    user: "Lakmal Perera",
    role: "Incentive Administrator",
    action: "Draft Validation",
    details:
      "Verified call closing dates fall strictly within 01-May-2026 to 31-May-2026 period boundary.",
  },
];

interface ServicePerformanceDataViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function ServicePerformanceDataView({
  onNavigateScreen,
  onBack,
}: ServicePerformanceDataViewProps) {
  // Mandatory Header Fields
  const [period, setPeriod] = useState<string>("May 2026");
  const [division, setDivision] = useState<string>("Consumer Electronics");
  const [sourceSystem, setSourceSystem] = useState<string>(
    "Servio Service Desk / SAP B1 Service Module",
  );
  const [receivedOn, setReceivedOn] = useState<string>("12-May-2026 14:35 IST");
  const [status, setStatus] = useState<PerformanceStatus>("Draft");

  // Role Switcher: Service HOD vs Incentive Administrator
  const [activeRole, setActiveRole] = useState<PerformanceRole>("Service HOD");

  // Tabs: Lines, Job Detail, Exceptions, History
  const [activeTab, setActiveTab] = useState<string>("lines");

  // Data States
  const [techLines, setTechLines] = useState<TechnicianPerformanceLine[]>(INITIAL_TECH_LINES);
  const [jobTickets, setJobTickets] = useState<ServiceJobDetail[]>(INITIAL_JOB_TICKETS);
  const [auditLogs, setAuditLogs] = useState<PerformanceAuditEntry[]>(INITIAL_AUDIT_LOG);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterDivision, setFilterDivision] = useState<string>("All");
  const [filterRepeatOnly, setFilterRepeatOnly] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<ServiceJobDetail | null>(null);

  // Modals & Drawers
  const [isLockModalOpen, setIsLockModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [lockNotes, setLockNotes] = useState<string>(
    "HOD review finalized. Closed calls verified against customer satisfaction marks and poor repeat criteria.",
  );

  // PostgreSQL Database & Async States
  const [currentBatchId, setCurrentBatchId] = useState<string>("BAT-SRV-2026-05A");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [allDbBatches, setAllDbBatches] = useState<any[]>([]);

  // New Ticket Form State
  const [newTicketForm, setNewTicketForm] = useState<Partial<ServiceJobDetail>>({
    jobTicketNo: `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    employeeCode: "EMP-1021",
    customerName: "",
    equipmentModel: "",
    completionDate: "15-May-2026",
    faultCategory: "General Maintenance",
    firstTimeFix: true,
    qualityScore: 9.5,
    disciplineScore: 10.0,
    eligibility: "HOD Eligible",
    isPoorRepeat: false,
    closureStatus: "Closed",
    notes: "",
  });

  // Load Service Performance Batches from PostgreSQL
  const loadServicePerformanceFromDb = async (silent: boolean = false, targetPeriod?: string) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/service-performance");
      const data = await res.json();
      if (data.success && Array.isArray(data.batches) && data.batches.length > 0) {
        setAllDbBatches(data.batches);
        setIsDbConnected(true);

        const periodToMatch = targetPeriod || period;
        const match =
          data.batches.find(
            (b: any) => b.period.toLowerCase() === periodToMatch.toLowerCase(),
          ) || data.batches[0];

        if (match) {
          setCurrentBatchId(match.id);
          setPeriod(match.period);
          setDivision(match.division);
          setSourceSystem(match.sourceSystem);
          setReceivedOn(match.receivedOn);
          setStatus(match.status);
          if (match.notes) setLockNotes(match.notes);
          if (match.techLines && match.techLines.length > 0) setTechLines(match.techLines);
          if (match.jobTickets && match.jobTickets.length > 0) setJobTickets(match.jobTickets);
          if (match.auditLogs && match.auditLogs.length > 0) setAuditLogs(match.auditLogs);
          setHasUnsavedChanges(false);
        }
      }
    } catch (err) {
      console.error("Failed to load service performance from DB:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServicePerformanceFromDb(true);
  }, []);

  // Performance Aggregates
  const stats = useMemo(() => {
    const totalTechs = techLines.length;
    const totalClosed = techLines.reduce((acc, t) => acc + t.closedJobs, 0);
    const totalEligible = techLines.reduce((acc, t) => acc + t.hodEligible, 0);
    const totalPoorRepeats = techLines.reduce((acc, t) => acc + t.poorRepeats, 0);
    const qualitySum = techLines.reduce((acc, t) => acc + t.avgQuality, 0);
    const disciplineSum = techLines.reduce((acc, t) => acc + t.avgDiscipline, 0);

    const overallQuality = totalTechs > 0 ? (qualitySum / totalTechs).toFixed(1) : "0.0";
    const overallDiscipline = totalTechs > 0 ? (disciplineSum / totalTechs).toFixed(1) : "0.0";
    const eligibilityRate =
      totalClosed > 0 ? ((totalEligible / totalClosed) * 100).toFixed(1) : "0.0";

    return {
      totalTechs,
      totalClosed,
      totalEligible,
      totalPoorRepeats,
      overallQuality,
      overallDiscipline,
      eligibilityRate,
    };
  }, [techLines]);

  // Filtered Tech Lines
  const filteredTechLines = useMemo(() => {
    return techLines.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.employeeCode.toLowerCase().includes(q) ||
        t.employeeName.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q);

      const matchDiv = filterDivision === "All" || t.division === filterDivision;
      const matchRepeat = !filterRepeatOnly || t.poorRepeats > 0;

      return matchSearch && matchDiv && matchRepeat;
    });
  }, [techLines, searchQuery, filterDivision, filterRepeatOnly]);

  // Filtered Job Tickets
  const filteredJobs = useMemo(() => {
    return jobTickets.filter((j) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        j.jobTicketNo.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q) ||
        j.employeeName.toLowerCase().includes(q) ||
        j.equipmentModel.toLowerCase().includes(q) ||
        j.faultCategory.toLowerCase().includes(q)
      );
    });
  }, [jobTickets, searchQuery]);

  // Exceptions list: Poor repeats or Not Eligible jobs
  const exceptionJobs = useMemo(() => {
    return jobTickets.filter(
      (j) => j.isPoorRepeat || j.eligibility === "Not Eligible" || j.qualityScore < 7.0,
    );
  }, [jobTickets]);

  // Action: Switch Period with Database Lookup
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const match = allDbBatches.find(
      (b: any) => b.period.toLowerCase() === newPeriod.toLowerCase(),
    );
    if (match) {
      setCurrentBatchId(match.id);
      setDivision(match.division);
      setSourceSystem(match.sourceSystem);
      setReceivedOn(match.receivedOn);
      setStatus(match.status);
      if (match.notes) setLockNotes(match.notes);
      if (match.techLines && match.techLines.length > 0) setTechLines(match.techLines);
      if (match.jobTickets && match.jobTickets.length > 0) setJobTickets(match.jobTickets);
      if (match.auditLogs && match.auditLogs.length > 0) setAuditLogs(match.auditLogs);
      setHasUnsavedChanges(false);
      toast.info(`Switched to ${newPeriod} (${match.status})`);
    } else {
      if (status === "Locked") setStatus("Draft");
      setHasUnsavedChanges(true);
      toast.info(`Switched active period to ${newPeriod}`);
    }
  };

  // Action: Save Working Records directly to PostgreSQL
  const handleSaveToPostgreSql = async () => {
    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/service-performance/${currentBatchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          division,
          sourceSystem,
          receivedOn,
          status,
          notes: lockNotes,
          lockedBy:
            activeRole === "Service HOD"
              ? "Chaminda Warnakula (Service HOD)"
              : "Incentive Administrator",
          techLines,
          jobTickets,
        }),
      });

      const data = await res.json();
      if (data.success && data.batch) {
        setHasUnsavedChanges(false);
        setIsDbConnected(true);
        toast.success("Saved to PostgreSQL successfully!", {
          description: `Synchronized ${techLines.length} technician lines and ${jobTickets.length} job sheets for ${period}.`,
        });
        loadServicePerformanceFromDb(true, period);
      } else {
        toast.error(data.error || "Failed to save service performance data.");
      }
    } catch (err) {
      console.error("Save service performance error:", err);
      toast.error("Failed to save service performance to PostgreSQL.");
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Refresh from Source while in Draft
  const handleRefreshFromSource = () => {
    if (status !== "Draft") {
      toast.warning("Refresh blocked: Data is locked.", {
        description: "Re-open to Draft status to pull fresh tickets from ERP service desk.",
      });
      return;
    }

    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const newTimestamp =
        new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " IST";
      setReceivedOn(newTimestamp);

      const newAudit: PerformanceAuditEntry = {
        id: `aud-${Date.now()}`,
        timestamp: newTimestamp,
        user: activeRole === "Service HOD" ? "Chaminda Warnakula" : "Lakmal Perera",
        role: activeRole,
        action: "Source Sync Refreshed",
        details: `Refreshed from ${sourceSystem}. Synced ${jobTickets.length} calls across ${techLines.length} service technicians.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
      setHasUnsavedChanges(true);

      toast.success("Service Performance Data Refreshed from Source", {
        description: `Successfully synchronized with ${sourceSystem} at ${newTimestamp}.`,
      });
    }, 700);
  };

  // Action: Lock as HOD
  const handleLockAsHod = async () => {
    if (activeRole !== "Service HOD") {
      toast.error("HOD Authorization Required", {
        description:
          "Only the Service Head of Department (HOD) can lock performance facts for incentive runs. Switch role to 'Service HOD' to sign off.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/service-performance/${currentBatchId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Locked",
          lockedBy: "Chaminda Warnakula (Service HOD)",
          notes: lockNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("Locked");
        setIsLockModalOpen(false);
        setHasUnsavedChanges(false);
        toast.success(`Service Performance Data Locked by HOD for ${period} in PostgreSQL!`, {
          description: "Facts are sealed and ready for the Incentive Calculation Run.",
        });
        loadServicePerformanceFromDb(true, period);
      } else {
        toast.error(data.error || "Failed to lock batch.");
      }
    } catch (err) {
      setStatus("Locked");
      setIsLockModalOpen(false);
      toast.success(`Service Performance Data Locked by HOD for ${period}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Unlock to Draft
  const handleUnlockToDraft = async () => {
    if (status === "Used in Run") {
      toast.error("Cannot Unlock: Used in Active Calculation Run", {
        description: "This performance batch is locked by calculation run RUN-2026-05-PRE.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/service-performance/${currentBatchId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Draft",
          notes: "Re-opened to Draft status by HOD.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("Draft");
        setHasUnsavedChanges(false);
        toast.info("Batch Unlocked to Draft Status in PostgreSQL", {
          description: "Modifications and source refreshing are now enabled.",
        });
        loadServicePerformanceFromDb(true, period);
      } else {
        setStatus("Draft");
      }
    } catch (err) {
      setStatus("Draft");
      toast.info("Batch Unlocked to Draft Status");
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Export Excel / PDF
  const handleExport = (format: "Excel" | "PDF") => {
    setIsExportModalOpen(false);
    toast.success(`Exporting ${format} Performance Schedule...`, {
      description: `Period: ${period} | Division: ${division} | File: Service_Performance_${period.replace(" ", "_")}.${
        format === "Excel" ? "xlsx" : "pdf"
      }`,
    });
  };

  // Action: Toggle Job Eligibility in Draft
  const handleToggleJobEligibility = (jobId: string, newEligibility: JobEligibility) => {
    if (status !== "Draft") {
      toast.warning("Cannot edit locked batch", {
        description: "Switch to Draft status to adjust job classifications.",
      });
      return;
    }

    setJobTickets((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, eligibility: newEligibility } : j)),
    );
    setHasUnsavedChanges(true);
    toast.info(`Updated job eligibility to "${newEligibility}"`, {
      description: "Click 'Save to DB' to commit to PostgreSQL.",
    });
  };

  // Action: Toggle Poor Repeat Flag
  const handleTogglePoorRepeat = (jobId: string) => {
    if (status !== "Draft") {
      toast.warning("Cannot edit locked batch", {
        description: "Switch to Draft status to adjust poor repeat classification.",
      });
      return;
    }

    setJobTickets((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const newPoorRepeat = !j.isPoorRepeat;
        return {
          ...j,
          isPoorRepeat: newPoorRepeat,
          eligibility: newPoorRepeat ? "Not Eligible" : "HOD Eligible",
          qualityScore: newPoorRepeat ? Math.min(j.qualityScore, 6.0) : 9.5,
        };
      }),
    );
    setHasUnsavedChanges(true);
    toast.info("Toggled Poor Repeat status", {
      description: "Click 'Save to DB' to commit changes to PostgreSQL.",
    });
  };

  // Action: Delete Job Ticket
  const handleDeleteJobTicket = (ticketId: string) => {
    if (status !== "Draft") {
      toast.warning("Cannot delete locked job ticket", {
        description: "Re-open to Draft status to delete job tickets.",
      });
      return;
    }
    setJobTickets((prev) => prev.filter((j) => j.id !== ticketId));
    setHasUnsavedChanges(true);
    toast.info("Job ticket removed from table.", {
      description: "Click 'Save to DB' to commit this deletion to PostgreSQL.",
    });
  };

  // Action: Delete Technician Line
  const handleDeleteTechLine = (lineId: string) => {
    if (status !== "Draft") {
      toast.warning("Cannot delete locked line", {
        description: "Re-open to Draft status to modify technician roster.",
      });
      return;
    }
    setTechLines((prev) => prev.filter((t) => t.id !== lineId));
    setHasUnsavedChanges(true);
    toast.info("Technician line removed from table.", {
      description: "Click 'Save to DB' to commit this deletion to PostgreSQL.",
    });
  };

  // Action: Delete Entire Batch from PostgreSQL
  const handleDeleteBatch = async (batchIdToDelete: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete service performance batch "${batchIdToDelete}" and all its job sheets from PostgreSQL?`,
      )
    ) {
      return;
    }
    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/service-performance/${batchIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Batch ${batchIdToDelete} deleted from PostgreSQL successfully!`);
        await loadServicePerformanceFromDb(false);
      } else {
        toast.error(data.error || "Failed to delete batch from PostgreSQL.");
      }
    } catch (err) {
      console.error("Delete batch error:", err);
      toast.error("Failed to delete service performance batch from PostgreSQL.");
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Add New Job Ticket
  const handleAddNewJobTicket = () => {
    if (!newTicketForm.customerName || !newTicketForm.equipmentModel) {
      toast.error("Please enter Customer Name and Equipment Model.");
      return;
    }

    const techMatch = techLines.find((t) => t.employeeCode === newTicketForm.employeeCode);

    const newTicket: ServiceJobDetail = {
      id: `spjt-${Date.now()}`,
      jobTicketNo: newTicketForm.jobTicketNo || `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeCode: newTicketForm.employeeCode || "EMP-1021",
      employeeName: techMatch ? techMatch.employeeName : "Technician",
      customerName: newTicketForm.customerName,
      equipmentModel: newTicketForm.equipmentModel,
      completionDate: newTicketForm.completionDate || "15-May-2026",
      faultCategory: newTicketForm.faultCategory || "General Maintenance",
      firstTimeFix: newTicketForm.firstTimeFix ?? true,
      qualityScore: Number(newTicketForm.qualityScore) || 9.5,
      disciplineScore: Number(newTicketForm.disciplineScore) || 10.0,
      eligibility: (newTicketForm.eligibility as JobEligibility) || "HOD Eligible",
      isPoorRepeat: Boolean(newTicketForm.isPoorRepeat),
      repeatReferenceJob: newTicketForm.repeatReferenceJob || undefined,
      hodReviewed: true,
      closureStatus: "Closed",
      notes: newTicketForm.notes || "Added manually",
    };

    setJobTickets((prev) => [newTicket, ...prev]);
    setIsAddTicketModalOpen(false);
    setHasUnsavedChanges(true);
    toast.success(`Added service ticket ${newTicket.jobTicketNo}`, {
      description: "Click 'Save to DB' to commit to PostgreSQL.",
    });

    // Reset form
    setNewTicketForm({
      jobTicketNo: `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeCode: "EMP-1021",
      customerName: "",
      equipmentModel: "",
      completionDate: "15-May-2026",
      faultCategory: "General Maintenance",
      firstTimeFix: true,
      qualityScore: 9.5,
      disciplineScore: 10.0,
      eligibility: "HOD Eligible",
      isPoorRepeat: false,
      closureStatus: "Closed",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Quick Navigation Bar to Related Screens                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-lg border text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wrench size={14} className="text-primary" />
          <span className="font-semibold text-foreground">Service Performance Context:</span>
          <span className="hidden sm:inline">
            Connects technician attendance factors with closed calls, QA marks, and poor repeat
            penalties.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateScreen && (
            <>
              {/* PRIMARY PROCEED BUTTON TO INCENTIVE CALCULATION RUN */}
              <Button
                size="sm"
                onClick={() => onNavigateScreen("calculation-run")}
                className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer shadow-xs"
              >
                <TrendingUp size={13} />
                <span>Incentive Calculation Run</span>
                <ChevronRight size={12} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("attendance-import")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <Upload size={13} className="text-primary" />
                <span>Attendance Import</span>
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
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PostgreSQL Database Status Banner                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-lg border text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background border font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                isDbConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <Database size={13} className="text-primary" />
            <span className="font-semibold text-foreground">
              {isDbConnected ? "PostgreSQL Connected (telesonic)" : "Local Memory"}
            </span>
            <span className="text-muted-foreground/60 text-[10px]">|</span>
            <span className="text-muted-foreground text-[11px]">
              Batch: <span className="font-mono text-foreground font-semibold">{currentBatchId}</span>
            </span>
          </div>

          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <AlertCircle size={11} /> Unsaved changes in draft
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadServicePerformanceFromDb(false, period)}
            disabled={isLoading}
            className="h-7 text-xs gap-1.5 hover:bg-background cursor-pointer"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            <span>Sync DB</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveToPostgreSql}
            disabled={isSaving}
            className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs font-semibold"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            <span>Save to PostgreSQL</span>
          </Button>
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
                Service Performance Data
              </h2>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  status === "Locked"
                    ? "bg-primary/10 text-primary border-primary/30"
                    : status === "Used in Run"
                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                      : "bg-warning/10 text-warning border-warning/30"
                }`}
              >
                {status === "Locked" ? (
                  <Lock size={13} />
                ) : status === "Used in Run" ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <Clock size={13} />
                )}
                <span>Status: {status}</span>
              </span>

              {/* Source Online Indicator */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span>ERP Service Sync: Online</span>
              </span>

              {/* Role Simulation Switcher */}
              <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-md border text-xs">
                <span className="text-muted-foreground font-medium">Acting Role:</span>
                <button
                  onClick={() => setActiveRole("Service HOD")}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeRole === "Service HOD"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Service HOD
                </button>
                <span className="text-muted-foreground/40">|</span>
                <button
                  onClick={() => setActiveRole("Incentive Administrator")}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeRole === "Incentive Administrator"
                      ? "bg-card text-foreground shadow-xs border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Incentive Admin
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Maintain monthly service facts per person and role, including completed jobs,
              HOD-eligible jobs, quality and discipline marks, and repeat flags.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Batches History */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
            >
              <HistoryIcon size={13} className="text-muted-foreground" />
              <span>Batches ({allDbBatches.length > 0 ? allDbBatches.length : 2})</span>
            </Button>

            {/* Refresh from Source while in Draft */}
            {status === "Draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshFromSource}
                disabled={isRefreshing}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin text-primary" : ""} />
                <span>{isRefreshing ? "Syncing..." : "Refresh from Source"}</span>
              </Button>
            )}

            {/* Save to PostgreSQL Button */}
            <Button
              size="sm"
              onClick={handleSaveToPostgreSql}
              disabled={isSaving}
              className="h-8 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save to DB</span>
            </Button>

            {/* Lock as HOD Action */}
            {status === "Draft" && (
              <Button
                size="sm"
                onClick={() => setIsLockModalOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                <Lock size={13} />
                <span>Lock as HOD</span>
              </Button>
            )}

            {/* Unlock to Draft */}
            {status === "Locked" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlockToDraft}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Unlock size={13} />
                <span>Unlock to Draft</span>
              </Button>
            )}

            {/* Export Excel / PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer bg-card hover:bg-accent"
            >
              <Download size={13} className="text-muted-foreground" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Mandatory Header Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-3 border-t">
          {/* 1. Period (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Period <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Monthly Quota</span>
            </label>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
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

          {/* 3. Source System (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Source System <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Origin</span>
            </label>
            <select
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
              disabled={status !== "Draft"}
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-75"
            >
              <option value="Servio Service Desk / SAP B1 Service Module">
                Servio Service Desk / SAP B1
              </option>
              <option value="Field Technicians Mobile Telematics API">
                Field Technicians Mobile Telematics
              </option>
              <option value="Direct Call Center Telephony Integration">
                Direct Telephony Integration
              </option>
            </select>
          </div>

          {/* 4. Received On */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Received On</span>
              <span className="text-[10px] text-muted-foreground">Timestamp</span>
            </label>
            <input
              type="text"
              readOnly
              value={receivedOn}
              className="w-full text-xs font-mono rounded-md border border-input bg-muted/40 px-3 py-2 shadow-xs text-muted-foreground"
            />
          </div>

          {/* 5. Status (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Status <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Lifecycle</span>
            </label>
            <input
              type="text"
              readOnly
              value={status}
              className="w-full text-xs font-bold font-mono rounded-md border border-input bg-muted/40 px-3 py-2 shadow-xs text-foreground"
            />
          </div>
        </div>

        {/* Validation Callout Banner */}
        <div className="rounded-md border border-info/30 bg-info/5 p-3 text-xs space-y-1">
          <div className="flex items-center gap-2 text-info font-bold">
            <Shield size={14} className="shrink-0" />
            <span>Service Performance Fact Validations</span>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-5">
            Only <strong>Closed</strong> service calls that have undergone{" "}
            <strong>HOD Review</strong> qualify for incentive calculation. Any repeat service call
            classified as <strong>Poor Service</strong> within 30 days is automatically flagged and
            docked from eligible technician counts.
          </p>
        </div>

        {/* Performance Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Technicians</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{stats.totalTechs}</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Closed Jobs</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{stats.totalClosed}</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-success font-medium flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>HOD Eligible</span>
            </span>
            <p className="text-lg font-bold text-success mt-0.5">
              {stats.totalEligible}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({stats.eligibilityRate}%)
              </span>
            </p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Avg Quality</span>
            <p className="text-lg font-bold text-primary mt-0.5">{stats.overallQuality} / 10</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">Avg Discipline</span>
            <p className="text-lg font-bold text-primary mt-0.5">{stats.overallDiscipline} / 10</p>
          </div>

          <div className="card-surface p-3 rounded-md border bg-card/60 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
              <AlertTriangle size={12} />
              <span>Poor Repeats</span>
            </span>
            <p className="text-lg font-bold text-destructive mt-0.5">{stats.totalPoorRepeats}</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Main Tabs: Lines, Job Detail, Exceptions, History          */}
      {/* ------------------------------------------------------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="lines" className="text-xs gap-1.5 px-3 py-1.5">
              <Layers size={13} />
              <span>Lines ({techLines.length})</span>
            </TabsTrigger>
            <TabsTrigger value="job-detail" className="text-xs gap-1.5 px-3 py-1.5">
              <FileText size={13} />
              <span>Job Detail ({jobTickets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="text-xs gap-1.5 px-3 py-1.5 relative">
              <AlertCircle
                size={13}
                className={exceptionJobs.length > 0 ? "text-destructive" : ""}
              />
              <span>Exceptions ({exceptionJobs.length})</span>
              {exceptionJobs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full">
                  {exceptionJobs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1.5 px-3 py-1.5">
              <HistoryIcon size={13} />
              <span>History ({auditLogs.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search technician or ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {activeTab === "lines" && (
              <>
                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2.5 shadow-xs"
                >
                  <option value="All">All Divisions</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Commercial Air Conditioning">Commercial Air Conditioning</option>
                  <option value="Renewable Energy">Renewable Energy</option>
                </select>

                <button
                  onClick={() => setFilterRepeatOnly(!filterRepeatOnly)}
                  className={`h-8 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    filterRepeatOnly
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AlertTriangle size={12} />
                  <span>Poor Repeats Only</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* TAB 1: LINES (TECHNICIAN SUMMARY GRID)                      */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="lines" className="space-y-4 m-0">
          <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                    <th className="py-2.5 px-3 min-w-[120px]">Employee</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Role</th>
                    <th className="py-2.5 px-3 text-right">Closed Jobs</th>
                    <th className="py-2.5 px-3 text-right text-success">HOD Eligible</th>
                    <th className="py-2.5 px-3 text-right">Partial</th>
                    <th className="py-2.5 px-3 text-right text-muted-foreground">Not Eligible</th>
                    <th className="py-2.5 px-3 text-right text-muted-foreground">Excluded</th>
                    <th className="py-2.5 px-3 text-right">Avg Quality /10</th>
                    <th className="py-2.5 px-3 text-right">Avg Discipline /10</th>
                    <th className="py-2.5 px-3 text-right text-destructive">Poor Repeats</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center w-20">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTechLines.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-muted-foreground">
                        No technician service lines match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTechLines.map((item) => {
                      const hasRepeats = item.poorRepeats > 0;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            hasRepeats ? "bg-destructive/5" : ""
                          }`}
                        >
                          {/* Employee */}
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            <div className="font-semibold">{item.employeeName}</div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {item.employeeCode}
                            </span>
                          </td>

                          {/* Role & Division */}
                          <td className="py-2.5 px-3 text-muted-foreground">
                            <div>{item.role}</div>
                            <span className="text-[10px] text-muted-foreground/80">
                              {item.division}
                            </span>
                          </td>

                          {/* Closed Jobs */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                            {item.closedJobs}
                          </td>

                          {/* HOD Eligible */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-success">
                            {item.hodEligible}
                          </td>

                          {/* Partial */}
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {item.partial}
                          </td>

                          {/* Not Eligible */}
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {item.notEligible}
                          </td>

                          {/* Excluded */}
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {item.excluded}
                          </td>

                          {/* Avg Quality /10 */}
                          <td className="py-2.5 px-3 text-right font-mono">
                            <span
                              className={`font-semibold ${
                                item.avgQuality >= 9.0
                                  ? "text-success"
                                  : item.avgQuality >= 8.0
                                    ? "text-foreground"
                                    : "text-amber-600"
                              }`}
                            >
                              {item.avgQuality.toFixed(1)}
                            </span>
                          </td>

                          {/* Avg Discipline /10 */}
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                            {item.avgDiscipline.toFixed(1)}
                          </td>

                          {/* Poor Repeats */}
                          <td className="py-2.5 px-3 text-right font-mono">
                            {item.poorRepeats > 0 ? (
                              <span className="inline-flex items-center gap-1 font-bold text-destructive">
                                <AlertTriangle size={11} />
                                <span>{item.poorRepeats}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                item.reviewStatus === "Reviewed"
                                  ? "bg-success/15 text-success"
                                  : item.reviewStatus === "Exceptions Found"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-warning/15 text-warning"
                              }`}
                            >
                              {item.reviewStatus}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery(item.employeeCode);
                                  setActiveTab("job-detail");
                                }}
                                className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10"
                                title="Inspect Individual Service Tickets"
                              >
                                <Eye size={12} />
                                <span>Calls</span>
                              </Button>
                              {status === "Draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTechLine(item.id)}
                                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                  title="Remove technician line"
                                >
                                  <Trash2 size={12} />
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

            <div className="bg-muted/40 p-3 border-t flex flex-wrap items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing <strong>{filteredTechLines.length}</strong> of{" "}
                <strong>{techLines.length}</strong> technicians
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Eligible Payout Base: <strong>{stats.totalEligible}</strong> calls
                </span>
                <span>
                  Flagged Poor Repeats: <strong>{stats.totalPoorRepeats}</strong>
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: JOB DETAIL (INSPECTION OF TICKETS)                   */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="job-detail" className="space-y-4 m-0">
          <div className="flex items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-lg border">
            <div className="text-xs text-muted-foreground">
              Showing <strong>{filteredJobs.length}</strong> service call sheets for <strong>{period}</strong>.
            </div>
            {status === "Draft" && (
              <Button
                size="sm"
                onClick={() => setIsAddTicketModalOpen(true)}
                className="h-7 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Add Job Sheet</span>
              </Button>
            )}
          </div>

          <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                    <th className="py-2.5 px-3 min-w-[120px]">Ticket No</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Technician</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Customer</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Equipment / Model</th>
                    <th className="py-2.5 px-3">Fault / Symptom</th>
                    <th className="py-2.5 px-3 text-center">FTF</th>
                    <th className="py-2.5 px-3 text-right">Quality</th>
                    <th className="py-2.5 px-3 text-right">Discipline</th>
                    <th className="py-2.5 px-3 text-center min-w-[110px]">HOD Eligibility</th>
                    <th className="py-2.5 px-3 text-center">Repeat Flag</th>
                    <th className="py-2.5 px-3 text-center w-20">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-muted-foreground">
                        No service call tickets match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr
                        key={job.id}
                        className={`hover:bg-muted/30 transition-colors ${
                          job.isPoorRepeat ? "bg-destructive/5" : ""
                        }`}
                      >
                        {/* Ticket No */}
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">
                          {job.jobTicketNo}
                        </td>

                        {/* Technician */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-foreground">{job.employeeName}</div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {job.employeeCode}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {job.customerName}
                        </td>

                        {/* Equipment */}
                        <td className="py-2.5 px-3 text-muted-foreground">{job.equipmentModel}</td>

                        {/* Fault */}
                        <td
                          className="py-2.5 px-3 max-w-xs truncate text-muted-foreground"
                          title={job.faultCategory}
                        >
                          {job.faultCategory}
                        </td>

                        {/* First-Time Fix */}
                        <td className="py-2.5 px-3 text-center">
                          {job.firstTimeFix ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
                              <Check size={12} />
                              <span>Yes</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <X size={12} />
                              <span>No</span>
                            </span>
                          )}
                        </td>

                        {/* Quality Score */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              job.qualityScore < 7.0 ? "text-destructive" : "text-foreground"
                            }
                          >
                            {job.qualityScore.toFixed(1)}
                          </span>
                        </td>

                        {/* Discipline Score */}
                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          {job.disciplineScore.toFixed(1)}
                        </td>

                        {/* HOD Eligibility Dropdown (in Draft) or Badge */}
                        <td className="py-2.5 px-3 text-center">
                          {status === "Draft" ? (
                            <select
                              value={job.eligibility}
                              onChange={(e) =>
                                handleToggleJobEligibility(job.id, e.target.value as JobEligibility)
                              }
                              className="text-[11px] rounded border border-input bg-background px-1.5 py-0.5 shadow-xs"
                            >
                              <option value="HOD Eligible">HOD Eligible</option>
                              <option value="Partial">Partial</option>
                              <option value="Not Eligible">Not Eligible</option>
                              <option value="Excluded">Excluded</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                job.eligibility === "HOD Eligible"
                                  ? "bg-success/15 text-success"
                                  : job.eligibility === "Partial"
                                    ? "bg-info/15 text-info"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {job.eligibility}
                            </span>
                          )}
                        </td>

                        {/* Repeat Flag */}
                        <td className="py-2.5 px-3 text-center">
                          {status === "Draft" ? (
                            <button
                              onClick={() => handleTogglePoorRepeat(job.id)}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                job.isPoorRepeat
                                  ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                              title="Click to toggle poor repeat status"
                            >
                              <AlertTriangle size={11} />
                              <span>{job.isPoorRepeat ? "Poor Repeat" : "Normal"}</span>
                            </button>
                          ) : job.isPoorRepeat ? (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive/15 text-destructive rounded text-[10px] font-bold"
                              title={job.notes}
                            >
                              <AlertTriangle size={11} />
                              <span>Poor Repeat</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Normal</span>
                          )}
                        </td>

                        {/* Inspect Details & Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              title="View Full Call Notes"
                            >
                              <Eye size={13} />
                            </button>
                            {status === "Draft" && (
                              <button
                                onClick={() => handleDeleteJobTicket(job.id)}
                                className="p-1 hover:bg-destructive/10 rounded text-destructive cursor-pointer transition-colors"
                                title="Delete job sheet"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------- */}
        {/* TAB 3: EXCEPTIONS                                           */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="exceptions" className="space-y-4 m-0">
          <div className="card-surface p-4 rounded-lg border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertCircle size={15} className="text-destructive" />
                  <span>Flagged Exceptions & Repeat Call Discrepancies</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Service calls classified as Poor Repeats, sub-7.0 quality mark failures, or
                  non-eligible repairs.
                </p>
              </div>

              <span className="text-xs font-bold text-destructive px-2 py-1 bg-destructive/10 rounded">
                {exceptionJobs.length} Exceptions Requiring HOD Action
              </span>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                    <th className="py-2.5 px-3 min-w-[120px]">Ticket No</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Technician</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Customer</th>
                    <th className="py-2.5 px-3">Exception Category</th>
                    <th className="py-2.5 px-3 min-w-[200px]">HOD Audit Notes</th>
                    <th className="py-2.5 px-3 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {exceptionJobs.map((exc) => (
                    <tr key={exc.id} className="hover:bg-destructive/5">
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">
                        {exc.jobTicketNo}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground">{exc.employeeName}</div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {exc.employeeCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-foreground">{exc.customerName}</td>
                      <td className="py-2.5 px-3">
                        {exc.isPoorRepeat ? (
                          <span className="inline-flex items-center gap-1 font-bold text-destructive">
                            <AlertTriangle size={12} />
                            <span>Poor Repeat Workmanship</span>
                          </span>
                        ) : exc.qualityScore < 7.0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <AlertCircle size={12} />
                            <span>Substandard QA ({exc.qualityScore.toFixed(1)}/10)</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{exc.eligibility}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground text-[11px] leading-relaxed">
                        {exc.notes}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/15 text-destructive">
                          Flagged
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------- */}
        {/* TAB 4: AUDIT HISTORY                                        */}
        {/* ----------------------------------------------------------- */}
        <TabsContent value="history" className="space-y-4 m-0">
          <div className="card-surface p-4 rounded-lg border bg-card space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HistoryIcon size={15} className="text-primary" />
              <span>Service Performance Lifecycle & Review History</span>
            </h3>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-md border bg-muted/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{log.action}</span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        ({log.user})
                      </span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">{log.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------------------------------------- */}
      {/* 4. Modals                                                     */}
      {/* ------------------------------------------------------------- */}

      {/* MODAL: Lock as HOD Dialog */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">HOD Service Performance Lock</h3>
              </div>
              <button
                onClick={() => setIsLockModalOpen(false)}
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
                  <span className="text-muted-foreground">HOD Eligible Calls:</span>
                  <span className="font-bold text-success">
                    {stats.totalEligible} of {stats.totalClosed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Poor Repeats Flagged:</span>
                  <span className="font-bold text-destructive">{stats.totalPoorRepeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sign-Off Officer:</span>
                  <span className="font-bold text-primary">Chaminda Warnakula (Service HOD)</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">
                  HOD Review Sign-Off Notes <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={3}
                  value={lockNotes}
                  onChange={(e) => setLockNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Locking this performance dataset will prevent further modifications or source ticket
                re-syncing. These facts will be ingested directly by the Incentive Calculation Run.
              </p>
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLockModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleLockAsHod}
                className="text-xs bg-primary text-primary-foreground font-semibold"
              >
                Seal & Lock as HOD
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Export Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">Export Performance Data</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-muted-foreground">
                Export monthly service performance records for {period} ({division}):
              </p>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport("Excel")}
                  className="w-full justify-start gap-2 h-10 text-xs"
                >
                  <FileSpreadsheet size={15} className="text-success" />
                  <div className="text-left">
                    <div className="font-semibold">Excel Register (.xlsx)</div>
                    <div className="text-[10px] text-muted-foreground">
                      Full technician facts and raw tickets
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleExport("PDF")}
                  className="w-full justify-start gap-2 h-10 text-xs"
                >
                  <Printer size={15} className="text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">HOD Performance Summary (.pdf)</div>
                    <div className="text-[10px] text-muted-foreground">
                      Signed monthly HOD evaluation sheet
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Single Job Inspector */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">
                  Service Call Inspector: {selectedJob.jobTicketNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md border">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Customer:</span>
                  <span className="font-bold text-foreground">{selectedJob.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Technician:</span>
                  <span className="font-bold text-foreground">
                    {selectedJob.employeeName} ({selectedJob.employeeCode})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">
                    Equipment / Model:
                  </span>
                  <span className="text-foreground">{selectedJob.equipmentModel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Completion Date:</span>
                  <span className="font-mono text-foreground">{selectedJob.completionDate}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold block text-foreground">
                  Reported Fault / Diagnosis:
                </span>
                <p className="p-2.5 rounded bg-muted/20 border text-muted-foreground">
                  {selectedJob.faultCategory}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded border bg-card text-center">
                  <span className="text-[10px] text-muted-foreground block">First-Time Fix</span>
                  <span
                    className={`font-bold ${selectedJob.firstTimeFix ? "text-success" : "text-amber-600"}`}
                  >
                    {selectedJob.firstTimeFix ? "Achieved" : "Repeat Call"}
                  </span>
                </div>

                <div className="p-2 rounded border bg-card text-center">
                  <span className="text-[10px] text-muted-foreground block">Quality Score</span>
                  <span className="font-bold text-foreground">
                    {selectedJob.qualityScore.toFixed(1)} / 10
                  </span>
                </div>

                <div className="p-2 rounded border bg-card text-center">
                  <span className="text-[10px] text-muted-foreground block">Discipline Score</span>
                  <span className="font-bold text-foreground">
                    {selectedJob.disciplineScore.toFixed(1)} / 10
                  </span>
                </div>
              </div>

              {selectedJob.isPoorRepeat && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>Poor Repeat Flagged (Reference: {selectedJob.repeatReferenceJob})</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This call was classified by HOD as a callback due to technician workmanship
                    defect within 30 days.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="font-semibold block text-foreground">HOD Review Notes:</span>
                <p className="p-2.5 rounded bg-muted/20 border text-muted-foreground italic">
                  "{selectedJob.notes}"
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJob(null)}
                className="text-xs"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New Job Sheet */}
      {isAddTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">Add Service Job Sheet</h3>
              </div>
              <button
                onClick={() => setIsAddTicketModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-foreground mb-1">Ticket Number</label>
                  <input
                    type="text"
                    value={newTicketForm.jobTicketNo}
                    onChange={(e) =>
                      setNewTicketForm({ ...newTicketForm, jobTicketNo: e.target.value })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={newTicketForm.employeeCode}
                    onChange={(e) =>
                      setNewTicketForm({ ...newTicketForm, employeeCode: e.target.value })
                    }
                    className="w-full text-xs rounded-md border border-input bg-background p-2"
                  >
                    {techLines.map((t) => (
                      <option key={t.employeeCode} value={t.employeeCode}>
                        {t.employeeCode} — {t.employeeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">
                  Customer Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cinnamon Grand Colombo"
                  value={newTicketForm.customerName}
                  onChange={(e) =>
                    setNewTicketForm({ ...newTicketForm, customerName: e.target.value })
                  }
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-foreground mb-1">
                    Equipment / Model <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daikin Inverter 24,000 BTU"
                    value={newTicketForm.equipmentModel}
                    onChange={(e) =>
                      setNewTicketForm({ ...newTicketForm, equipmentModel: e.target.value })
                    }
                    className="w-full text-xs rounded-md border border-input bg-background p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Completion Date</label>
                  <input
                    type="text"
                    placeholder="DD-Mon-YYYY"
                    value={newTicketForm.completionDate}
                    onChange={(e) =>
                      setNewTicketForm({ ...newTicketForm, completionDate: e.target.value })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">Fault / Symptom</label>
                <input
                  type="text"
                  placeholder="e.g. Refrigerant Leak at Expansion Valve"
                  value={newTicketForm.faultCategory}
                  onChange={(e) =>
                    setNewTicketForm({ ...newTicketForm, faultCategory: e.target.value })
                  }
                  className="w-full text-xs rounded-md border border-input bg-background p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block text-foreground mb-1">First-Time Fix</label>
                  <select
                    value={newTicketForm.firstTimeFix ? "true" : "false"}
                    onChange={(e) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        firstTimeFix: e.target.value === "true",
                      })
                    }
                    className="w-full text-xs rounded-md border border-input bg-background p-2"
                  >
                    <option value="true">Yes (First-Time)</option>
                    <option value="false">No (Callback / Repeat)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Quality /10</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newTicketForm.qualityScore}
                    onChange={(e) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        qualityScore: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Discipline /10</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newTicketForm.disciplineScore}
                    onChange={(e) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        disciplineScore: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs font-mono rounded-md border border-input bg-background p-2 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-foreground mb-1">HOD Eligibility</label>
                  <select
                    value={newTicketForm.eligibility}
                    onChange={(e) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        eligibility: e.target.value as JobEligibility,
                      })
                    }
                    className="w-full text-xs rounded-md border border-input bg-background p-2"
                  >
                    <option value="HOD Eligible">HOD Eligible</option>
                    <option value="Partial">Partial</option>
                    <option value="Not Eligible">Not Eligible</option>
                    <option value="Excluded">Excluded</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-foreground mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Optional review notes"
                    value={newTicketForm.notes}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, notes: e.target.value })}
                    className="w-full text-xs rounded-md border border-input bg-background p-2"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddTicketModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewJobTicket}
                className="text-xs bg-primary text-primary-foreground font-semibold"
              >
                Add Job Sheet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Batch History Drawer */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="card-surface bg-card border rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HistoryIcon className="text-primary" size={18} />
                <h3 className="font-bold text-sm text-foreground">
                  Service Performance Batches in PostgreSQL
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <p className="text-muted-foreground text-xs">
                Monthly closed service performance batches stored in PostgreSQL.
              </p>

              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/70 text-muted-foreground font-semibold border-b">
                      <th className="py-2 px-3">Batch ID</th>
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3">Division</th>
                      <th className="py-2 px-3 text-right">Techs</th>
                      <th className="py-2 px-3 text-right">Job Sheets</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(allDbBatches.length > 0
                      ? allDbBatches
                      : [
                          {
                            id: "BAT-SRV-2026-05A",
                            period: "May 2026",
                            division: "Consumer Electronics",
                            status: "Draft",
                            techLines: Array(10),
                            jobTickets: Array(10),
                          },
                          {
                            id: "BAT-SRV-2026-04F",
                            period: "April 2026",
                            division: "All Service Divisions",
                            status: "Locked",
                            techLines: Array(10),
                            jobTickets: Array(10),
                          },
                        ]
                    ).map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{b.id}</td>
                        <td className="py-2.5 px-3 font-semibold">{b.period}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{b.division}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          {b.techLines?.length ?? 0}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          {b.jobTickets?.length ?? 0}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              b.status === "Locked"
                                ? "bg-primary/15 text-primary"
                                : b.status === "Used in Run"
                                  ? "bg-purple-500/15 text-purple-700"
                                  : "bg-warning/15 text-warning"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handlePeriodChange(b.period);
                                setIsHistoryModalOpen(false);
                              }}
                              className="h-6 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10"
                              title="Load batch to editor"
                            >
                              Load
                            </Button>
                            {b.status !== "Locked" && b.status !== "Used in Run" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBatch(b.id)}
                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="Delete draft batch from PostgreSQL"
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
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
                onClick={() => setIsHistoryModalOpen(false)}
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
