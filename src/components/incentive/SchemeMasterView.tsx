import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Layers,
  Search,
  Filter,
  Plus,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Shield,
  Calendar,
  DollarSign,
  Users,
  Settings2,
  FileCheck,
  AlertTriangle,
  History as HistoryIcon,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Lock,
  Unlock,
  Building,
  Briefcase,
  X,
  FileText,
  Printer,
  Sparkles,
  Target,
  UploadCloud,
  Database,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { useIncentiveDivisions } from "@/lib/use-divisions";

export type SchemeStatus = "Draft" | "Approved" | "Active" | "Superseded" | "Inactive";

export interface SchemeRule {
  id: string;
  rule: string;
  parameter: string;
  value: string;
  source: string;
}

export interface SchemeSlab {
  slabId: string;
  minPercent: number;
  maxPercent: number;
  payoutPercent: number;
  multiplier: number;
  description: string;
}

export interface SchemeRateItem {
  category: string;
  productLine: string;
  commissionRate: string;
  paymentTermBand: string;
  basis: string;
}

export interface SchemeVersionItem {
  version: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: SchemeStatus;
  createdBy: string;
  createdDate: string;
  approvedBy?: string | undefined;
  approvalDate?: string | undefined;
  changeSummary: string;
}

export interface SchemeHistoryLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface IncentiveScheme {
  id: string;
  schemeCode: string;
  schemeName: string;
  division: string;
  schemeType: string;
  participantRole: string;
  calculationBasis: string;
  ageBasis: string;
  payableLagMonths: number;
  effectiveFrom: string;
  effectiveTo: string;
  status: SchemeStatus;
  version: string;
  description?: string;
  rules: SchemeRule[];
  slabs: SchemeSlab[];
  rateItems: SchemeRateItem[];
  exclusions: {
    customerGroups: string[];
    itemCategories: string[];
    jobCodes: string[];
    clawbackWindowDays: number;
  };
  posting: {
    debitGlAccount: string;
    debitGlName: string;
    creditGlAccount: string;
    creditGlName: string;
    costCenter: string;
    projectCode: string;
    postingDayOfMonth: number;
    journalRemarksTemplate: string;
  };
  versions: SchemeVersionItem[];
  history: SchemeHistoryLog[];
}

// Initial Mock Schemes
const INITIAL_SCHEMES: IncentiveScheme[] = [
  {
    id: "sch-1",
    schemeCode: "SCH-SLS-2026",
    schemeName: "Retail Smartphone & Devices Sales Incentive",
    division: "Mobile & Accessories",
    schemeType: "Turnover Tier + Slabs",
    participantRole: "Retail Sales Executive",
    calculationBasis: "Billed Revenue (Excl. Tax)",
    ageBasis: "Invoice Date",
    payableLagMonths: 1,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    status: "Active",
    version: "v2.1",
    description:
      "Primary incentive scheme for retail shop sales personnel based on monthly invoice turnover, subject to collection realization.",
    rules: [
      {
        id: "r-1",
        rule: "Minimum Turnover Achievement Floor",
        parameter: "Min Target %",
        value: "80.00%",
        source: "Monthly Target Entry",
      },
      {
        id: "r-2",
        rule: "Debtor Overdue Penalty Clawback",
        parameter: "Max Allowed Overdue",
        value: "60 Days",
        source: "SAP AR Invoice Aging",
      },
      {
        id: "r-3",
        rule: "Minimum Attendance Requirement",
        parameter: "Min Present Days %",
        value: "90.00%",
        source: "HR Bio-Metric Portal",
      },
      {
        id: "r-4",
        rule: "Top Performer Accelerator Cap",
        parameter: "Max Payout Limit",
        value: "LKR 350,000",
        source: "Executive Committee Policy",
      },
      {
        id: "r-5",
        rule: "Payment Realization Compliance",
        parameter: "Cash Collection Days",
        value: "Within 45 Days",
        source: "SAP Bank Reconciliation",
      },
    ],
    slabs: [
      {
        slabId: "S-01",
        minPercent: 0,
        maxPercent: 79.99,
        payoutPercent: 0,
        multiplier: 0.0,
        description: "Below floor threshold - No incentive",
      },
      {
        slabId: "S-02",
        minPercent: 80,
        maxPercent: 99.99,
        payoutPercent: 75,
        multiplier: 0.75,
        description: "Baseline qualifier band",
      },
      {
        slabId: "S-03",
        minPercent: 100,
        maxPercent: 119.99,
        payoutPercent: 100,
        multiplier: 1.0,
        description: "Target achieved - Full payout",
      },
      {
        slabId: "S-04",
        minPercent: 120,
        maxPercent: 139.99,
        payoutPercent: 125,
        multiplier: 1.25,
        description: "High performance bonus tier",
      },
      {
        slabId: "S-05",
        minPercent: 140,
        maxPercent: 200,
        payoutPercent: 150,
        multiplier: 1.5,
        description: "Super-achiever capped bracket",
      },
    ],
    rateItems: [
      {
        category: "Smartphones",
        productLine: "Flagship 5G Series",
        commissionRate: "2.50%",
        paymentTermBand: "0-30 Days",
        basis: "Net Billed Value",
      },
      {
        category: "Smartphones",
        productLine: "Mid-tier A Series",
        commissionRate: "3.00%",
        paymentTermBand: "0-30 Days",
        basis: "Net Billed Value",
      },
      {
        category: "Accessories",
        productLine: "Audio & Wearables",
        commissionRate: "5.00%",
        paymentTermBand: "0-45 Days",
        basis: "Gross Margin %",
      },
      {
        category: "Smartphones",
        productLine: "Entry Level 4G",
        commissionRate: "1.75%",
        paymentTermBand: "0-30 Days",
        basis: "Net Billed Value",
      },
    ],
    exclusions: {
      customerGroups: [
        "Inter-company Branch Transfers",
        "Executive Staff Personal Orders",
        "Institutional Special Government Tenders",
      ],
      itemCategories: [
        "Free-of-Charge (FOC) Promotional Units",
        "Marketing Demonstration Samples",
        "Damaged / B-Stock Clearance",
      ],
      jobCodes: ["Internal Transfer Freight", "Warranty Replacement Delivery"],
      clawbackWindowDays: 60,
    },
    posting: {
      debitGlAccount: "621000",
      debitGlName: "Sales Staff Incentive & Commission Expense",
      creditGlAccount: "214050",
      creditGlName: "Accrued Incentive Payable — Retail Mobile",
      costCenter: "CC-MOB-RETAIL",
      projectCode: "PRJ-SLS-2026",
      postingDayOfMonth: 25,
      journalRemarksTemplate: "INC/{Period}/SCH-SLS-2026/{EmpNo} - Retail Commission",
    },
    versions: [
      {
        version: "v2.1",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        status: "Active",
        createdBy: "S. Perera (Incentive Admin)",
        createdDate: "2025-12-15",
        approvedBy: "D. Fernando (Head of Finance)",
        approvalDate: "2025-12-28",
        changeSummary:
          "Updated Audio & Wearables commission from 4.5% to 5.0% and adjusted floor threshold.",
      },
      {
        version: "v2.0",
        effectiveFrom: "2025-06-01",
        effectiveTo: "2025-12-31",
        status: "Superseded",
        createdBy: "S. Perera (Incentive Admin)",
        createdDate: "2025-05-18",
        approvedBy: "P. Wickramasinghe (CEO)",
        approvalDate: "2025-05-25",
        changeSummary: "Introduced 5-slab achievement curve and 60-day clawback window.",
      },
      {
        version: "v1.0",
        effectiveFrom: "2025-01-01",
        effectiveTo: "2025-05-31",
        status: "Superseded",
        createdBy: "K. Senaratne (Admin)",
        createdDate: "2024-12-10",
        approvedBy: "D. Fernando (Head of Finance)",
        approvalDate: "2024-12-22",
        changeSummary: "Initial version for FY2025 launch.",
      },
    ],
    history: [
      {
        id: "h-1",
        timestamp: "2026-01-01 09:00",
        user: "System Daemon",
        role: "ERP Automation",
        action: "Version Activated",
        details: "Version v2.1 marked Active upon reaching Effective Date 2026-01-01.",
      },
      {
        id: "h-2",
        timestamp: "2025-12-28 16:30",
        user: "D. Fernando",
        role: "Head of Finance",
        action: "Scheme Approved",
        details: "Approved with Finance Committee authorization Ref #FIN-2025-894.",
      },
      {
        id: "h-3",
        timestamp: "2025-12-15 11:20",
        user: "S. Perera",
        role: "Incentive Administrator",
        action: "New Version Created",
        details: "Copied from v2.0 to introduce modified accessory commission rates.",
      },
    ],
  },
  {
    id: "sch-2",
    schemeCode: "SCH-SRV-2026",
    schemeName: "Field Service Technician First-Time-Fix Incentive",
    division: "Consumer Electronics",
    schemeType: "FTF Multiplier + Job Count",
    participantRole: "Field Service Technician",
    calculationBasis: "Job Completion Count",
    ageBasis: "Job Close Date",
    payableLagMonths: 1,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    status: "Active",
    version: "v1.4",
    description:
      "Incentivizes field repair turnaround, first-time-fix rates (FTF > 92%), and zero repeat complaint within 30-day warranty.",
    rules: [
      {
        id: "r-201",
        rule: "Minimum First-Time-Fix (FTF) Rate",
        parameter: "Min FTF %",
        value: "92.00%",
        source: "Service Manager Evaluation",
      },
      {
        id: "r-202",
        rule: "Repeat Service Call Penalty",
        parameter: "30-Day Re-work Deduction",
        value: "LKR 1,500 / job",
        source: "ITSM Ticket Ledger",
      },
      {
        id: "r-203",
        rule: "Customer CSAT Score Multiplier",
        parameter: "Min Average Rating",
        value: "4.50 / 5.0",
        source: "Customer Feedback Module",
      },
      {
        id: "r-204",
        rule: "Spare Parts Variance Allowance",
        parameter: "Max Stock Discrepancy",
        value: "0.50%",
        source: "SAP Warehouse Goods Issue",
      },
    ],
    slabs: [
      {
        slabId: "S-11",
        minPercent: 0,
        maxPercent: 84.99,
        payoutPercent: 0,
        multiplier: 0,
        description: "FTF below 85% — disqualified",
      },
      {
        slabId: "S-12",
        minPercent: 85,
        maxPercent: 91.99,
        payoutPercent: 50,
        multiplier: 0.5,
        description: "FTF 85-91% — 50% incentive payout",
      },
      {
        slabId: "S-13",
        minPercent: 92,
        maxPercent: 95.99,
        payoutPercent: 100,
        multiplier: 1.0,
        description: "Standard FTF target benchmark",
      },
      {
        slabId: "S-14",
        minPercent: 96,
        maxPercent: 100,
        payoutPercent: 130,
        multiplier: 1.3,
        description: "Excellence rating FTF > 96%",
      },
    ],
    rateItems: [
      {
        category: "LED TV Repair",
        productLine: "Panel Replacement",
        commissionRate: "LKR 1,200 / job",
        paymentTermBand: "N/A",
        basis: "Completed Job",
      },
      {
        category: "Refrigerator Repair",
        productLine: "Inverter Compressor",
        commissionRate: "LKR 1,800 / job",
        paymentTermBand: "N/A",
        basis: "Completed Job",
      },
      {
        category: "Washing Machine",
        productLine: "Motor & PCB Overhaul",
        commissionRate: "LKR 1,400 / job",
        paymentTermBand: "N/A",
        basis: "Completed Job",
      },
      {
        category: "Air Conditioner",
        productLine: "Gas Charging & Service",
        commissionRate: "LKR 1,600 / job",
        paymentTermBand: "N/A",
        basis: "Completed Job",
      },
    ],
    exclusions: {
      customerGroups: ["Internal Company Showroom Repairs", "Factory Warranty DOA Claims"],
      itemCategories: ["Consumables (Tape, Screws, Solder)"],
      jobCodes: ["JOB-INSPECTION-ONLY", "JOB-ESTIMATE-REJECTED"],
      clawbackWindowDays: 30,
    },
    posting: {
      debitGlAccount: "632000",
      debitGlName: "Technician Field Service Incentive Expense",
      creditGlAccount: "214060",
      creditGlName: "Accrued Service Incentive Payable",
      costCenter: "CC-SRV-CONSUMER",
      projectCode: "PRJ-TECH-2026",
      postingDayOfMonth: 28,
      journalRemarksTemplate: "INC/{Period}/SCH-SRV-2026/{EmpNo} - FTF Technician Incentive",
    },
    versions: [
      {
        version: "v1.4",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        status: "Active",
        createdBy: "S. Perera (Incentive Admin)",
        createdDate: "2025-12-10",
        approvedBy: "M. Jayawardena (Service Director)",
        approvalDate: "2025-12-22",
        changeSummary:
          "Added CSAT 4.5 multiplier threshold and updated inverter compressor job bounty.",
      },
    ],
    history: [
      {
        id: "h-201",
        timestamp: "2026-01-01 09:00",
        user: "System Daemon",
        role: "ERP Automation",
        action: "Version Activated",
        details: "Version v1.4 activated on new fiscal calendar.",
      },
    ],
  },
  {
    id: "sch-3",
    schemeCode: "SCH-DLR-2026",
    schemeName: "Tier-1 Authorised Dealer Quarterly Volume Rebate",
    division: "Enterprise Solutions",
    schemeType: "Volume Achievement Matrix",
    participantRole: "Dealer Principal",
    calculationBasis: "Collected Cash Amount",
    ageBasis: "Realization Date",
    payableLagMonths: 2,
    effectiveFrom: "2026-04-01",
    effectiveTo: "2026-06-30",
    status: "Approved",
    version: "v3.0",
    description:
      "Quarterly volume rebate for platinum and gold dealers, contingent on debtor aging realization under 45 days.",
    rules: [
      {
        id: "r-301",
        rule: "Quarterly Minimum Volume Threshold",
        parameter: "Min Volume Target",
        value: "LKR 15,000,000",
        source: "Dealer Contract Appendix B",
      },
      {
        id: "r-302",
        rule: "Debtor Invoice Aging Window",
        parameter: "Max Realization Lag",
        value: "45 Days",
        source: "SAP AR Bank Payment Posting",
      },
      {
        id: "r-303",
        rule: "Sell-Out Verification Requirement",
        parameter: "Dealer Sell-Out Proof",
        value: "100% IMEI Scanned",
        source: "Dealer Portal Sell-out Log",
      },
    ],
    slabs: [
      {
        slabId: "S-21",
        minPercent: 0,
        maxPercent: 89.99,
        payoutPercent: 0,
        multiplier: 0,
        description: "Below quarterly threshold",
      },
      {
        slabId: "S-22",
        minPercent: 90,
        maxPercent: 99.99,
        payoutPercent: 80,
        multiplier: 0.8,
        description: "90-100% Achievement rebate",
      },
      {
        slabId: "S-23",
        minPercent: 100,
        maxPercent: 124.99,
        payoutPercent: 100,
        multiplier: 1.0,
        description: "Target reached — 3.0% flat rebate",
      },
      {
        slabId: "S-24",
        minPercent: 125,
        maxPercent: 200,
        payoutPercent: 135,
        multiplier: 1.35,
        description: "Super tier dealer accelerator",
      },
    ],
    rateItems: [
      {
        category: "Enterprise Servers",
        productLine: "Blade Server Series",
        commissionRate: "3.50%",
        paymentTermBand: "0-45 Days",
        basis: "Collected Cash",
      },
      {
        category: "Networking",
        productLine: "Switch & Firewall Packages",
        commissionRate: "4.00%",
        paymentTermBand: "0-45 Days",
        basis: "Collected Cash",
      },
    ],
    exclusions: {
      customerGroups: ["Direct Government Tenders where dealer acted as agent only"],
      itemCategories: ["Software Subscription Renewals (separate commission)"],
      jobCodes: [],
      clawbackWindowDays: 90,
    },
    posting: {
      debitGlAccount: "612400",
      debitGlName: "Dealer Rebate & Settlement Expense",
      creditGlAccount: "212100",
      creditGlName: "Trade Creditors — Dealer Commission Balance",
      costCenter: "CC-ENT-DEALER",
      projectCode: "PRJ-DLR-Q2-2026",
      postingDayOfMonth: 15,
      journalRemarksTemplate: "INC/{Period}/SCH-DLR-2026/{DealerCode} - Q2 Rebate",
    },
    versions: [
      {
        version: "v3.0",
        effectiveFrom: "2026-04-01",
        effectiveTo: "2026-06-30",
        status: "Approved",
        createdBy: "S. Perera (Incentive Admin)",
        createdDate: "2026-03-10",
        approvedBy: "P. Wickramasinghe (CEO)",
        approvalDate: "2026-03-24",
        changeSummary: "Approved by CEO for Q2 rollout. Awaiting Finance activation.",
      },
    ],
    history: [
      {
        id: "h-301",
        timestamp: "2026-03-24 15:45",
        user: "P. Wickramasinghe",
        role: "Chief Executive Officer",
        action: "CEO Approval Granted",
        details: "Authorized scheme terms for Q2 dealer volume agreements Ref #CEO-2026-112.",
      },
      {
        id: "h-302",
        timestamp: "2026-03-10 10:15",
        user: "S. Perera",
        role: "Incentive Administrator",
        action: "Draft Submitted for Approval",
        details: "Submitted draft v3.0 to Finance & CEO for Q2 launch.",
      },
    ],
  },
  {
    id: "sch-4",
    schemeCode: "SCH-PRM-2026",
    schemeName: "Showroom Promoter Fast Sell-Out Bounty",
    division: "Mobile & Accessories",
    schemeType: "Flat Bounty Per Unit",
    participantRole: "Showroom Promoter",
    calculationBasis: "Sell-Out Unit Count",
    ageBasis: "Invoice Date",
    payableLagMonths: 1,
    effectiveFrom: "2026-05-01",
    effectiveTo: "2026-05-31",
    status: "Draft",
    version: "v1.0",
    description:
      "Special seasonal promotion incentive for in-store brand promoters selling high-margin flagship phone SKUs.",
    rules: [
      {
        id: "r-401",
        rule: "IMEI Customer Registration Verification",
        parameter: "Warranty Activation %",
        value: "100.00%",
        source: "Promoter App Warranty Scan",
      },
      {
        id: "r-402",
        rule: "Minimum Monthly Sold Units Qualifier",
        parameter: "Min Flagship Units",
        value: "15 Units",
        source: "Promoter Sell-out Matrix",
      },
    ],
    slabs: [
      {
        slabId: "S-31",
        minPercent: 0,
        maxPercent: 99.99,
        payoutPercent: 0,
        multiplier: 0,
        description: "Under 15 units — standard pay only",
      },
      {
        slabId: "S-32",
        minPercent: 100,
        maxPercent: 149.99,
        payoutPercent: 100,
        multiplier: 1.0,
        description: "15-25 units — LKR 1,500/unit",
      },
      {
        slabId: "S-33",
        minPercent: 150,
        maxPercent: 200,
        payoutPercent: 140,
        multiplier: 1.4,
        description: ">25 units — LKR 2,100/unit accelerator",
      },
    ],
    rateItems: [
      {
        category: "Flagship 5G",
        productLine: "Titanium Pro 256GB",
        commissionRate: "LKR 1,500 / unit",
        paymentTermBand: "N/A",
        basis: "Verified Sell-out",
      },
      {
        category: "Flagship 5G",
        productLine: "Ultra Fold 512GB",
        commissionRate: "LKR 2,500 / unit",
        paymentTermBand: "N/A",
        basis: "Verified Sell-out",
      },
    ],
    exclusions: {
      customerGroups: ["Wholesale bulk buyers (>3 units)"],
      itemCategories: ["Accessories"],
      jobCodes: [],
      clawbackWindowDays: 14,
    },
    posting: {
      debitGlAccount: "621080",
      debitGlName: "Promoter Seasonal Bounty Expense",
      creditGlAccount: "214050",
      creditGlName: "Accrued Incentive Payable — Promoters",
      costCenter: "CC-MOB-PROMOTER",
      projectCode: "PRJ-PRM-MAY-2026",
      postingDayOfMonth: 20,
      journalRemarksTemplate: "INC/{Period}/SCH-PRM-2026/{EmpNo} - Promoter Bounty",
    },
    versions: [
      {
        version: "v1.0",
        effectiveFrom: "2026-05-01",
        effectiveTo: "2026-05-31",
        status: "Draft",
        createdBy: "S. Perera (Incentive Admin)",
        createdDate: "2026-04-02",
        changeSummary: "Initial draft configured for May 2026 promotional campaign.",
      },
    ],
    history: [
      {
        id: "h-401",
        timestamp: "2026-04-02 14:10",
        user: "S. Perera",
        role: "Incentive Administrator",
        action: "Draft Scheme Initialized",
        details: "Created draft v1.0 for May seasonal sales campaign.",
      },
    ],
  },
  {
    id: "sch-5",
    schemeCode: "SCH-ACC-2025",
    schemeName: "Accessories Inventory Clearance Drive (Archived)",
    division: "Mobile & Accessories",
    schemeType: "Gross Margin %",
    participantRole: "Retail Sales Executive",
    calculationBasis: "Gross Margin",
    ageBasis: "Invoice Date",
    payableLagMonths: 1,
    effectiveFrom: "2025-10-01",
    effectiveTo: "2025-12-31",
    status: "Inactive",
    version: "v1.2",
    description:
      "Historical scheme for 2025 year-end accessories clearance. Superseded and marked inactive.",
    rules: [
      {
        id: "r-501",
        rule: "Minimum Gross Margin Floor",
        parameter: "Min GM %",
        value: "22.00%",
        source: "SAP Sales Analysis",
      },
    ],
    slabs: [
      {
        slabId: "S-41",
        minPercent: 100,
        maxPercent: 200,
        payoutPercent: 100,
        multiplier: 1.0,
        description: "Full payout upon achieving clearance target",
      },
    ],
    rateItems: [
      {
        category: "Accessories",
        productLine: "Power Banks & Cables",
        commissionRate: "6.00%",
        paymentTermBand: "0-30 Days",
        basis: "Gross Margin",
      },
    ],
    exclusions: {
      customerGroups: ["Inter-company transfers"],
      itemCategories: [],
      jobCodes: [],
      clawbackWindowDays: 30,
    },
    posting: {
      debitGlAccount: "621000",
      debitGlName: "Sales Staff Incentive Expense",
      creditGlAccount: "214050",
      creditGlName: "Accrued Incentive Payable",
      costCenter: "CC-MOB-ACC",
      projectCode: "PRJ-ACC-2025",
      postingDayOfMonth: 25,
      journalRemarksTemplate: "INC/{Period}/SCH-ACC-2025/{EmpNo}",
    },
    versions: [
      {
        version: "v1.2",
        effectiveFrom: "2025-10-01",
        effectiveTo: "2025-12-31",
        status: "Inactive",
        createdBy: "S. Perera (Incentive Admin)",
        createdDate: "2025-09-20",
        approvedBy: "D. Fernando",
        approvalDate: "2025-09-28",
        changeSummary: "Completed and expired on 31-Dec-2025. Marked Inactive.",
      },
    ],
    history: [
      {
        id: "h-501",
        timestamp: "2026-01-01 00:00",
        user: "System Daemon",
        role: "ERP Automation",
        action: "Status Changed to Inactive",
        details: "Scheme validity expired. Closed and deactivated.",
      },
    ],
  },
];

interface SchemeMasterViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
}

export function SchemeMasterView({ onNavigateScreen }: SchemeMasterViewProps) {
  // Master Scheme state
  const [schemes, setSchemes] = useState<IncentiveScheme[]>(INITIAL_SCHEMES);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("sch-1");
  const [activeTab, setActiveTab] = useState<string>("rules");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");

  // Database connection & Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  // Load schemes from PostgreSQL
  const loadSchemesFromDb = async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiFetch("/api/incentives/schemes");
      if (res.ok) {
        const data = await res.json();
        if (data.schemes && data.schemes.length > 0) {
          setSchemes(data.schemes);
          setIsDbConnected(true);
          if (!silent) {
            toast.success("Synchronized with PostgreSQL database.", {
              description: `Loaded ${data.schemes.length} schemes successfully.`,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load schemes from PostgreSQL:", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchemesFromDb(true);
  }, []);

  // Dialog & Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);

  // Simulated open calculation run flag (to demonstrate validation rule)
  // "Deactivate only when there is no open calculation run"
  const [hasOpenCalculationRun, setHasOpenCalculationRun] = useState<boolean>(true);

  // Form states for Add Scheme
  const [newSchemeForm, setNewSchemeForm] = useState({
    schemeCode: "",
    schemeName: "",
    division: "Mobile & Accessories",
    schemeType: "Turnover Tier + Slabs",
    participantRole: "Retail Sales Executive",
    calculationBasis: "Billed Revenue (Excl. Tax)",
    ageBasis: "Invoice Date",
    payableLagMonths: 1,
    effectiveFrom: "2026-07-01",
    effectiveTo: "2026-12-31",
    status: "Draft" as SchemeStatus,
    version: "v1.0",
    description: "",
  });

  // Form state for Copy Version
  const [copyVersionForm, setCopyVersionForm] = useState({
    newVersion: "v2.2",
    effectiveFrom: "2027-01-01",
    effectiveTo: "2027-12-31",
    changeSummary: "",
  });

  // Form state for Add Rule
  const [newRuleForm, setNewRuleForm] = useState({
    rule: "",
    parameter: "",
    value: "",
    source: "Monthly Target Entry",
  });

  // Approval note for Activation
  const [activationAuthNote, setActivationAuthNote] = useState(
    "Finance Approval Ref #FIN-2026-104 & CEO Approval Ref #CEO-2026-088",
  );

  // Selected scheme
  const currentScheme = useMemo(() => {
    return (schemes.find((s) => s.id === selectedSchemeId) || schemes[0] || INITIAL_SCHEMES[0])!;
  }, [schemes, selectedSchemeId]);

  // Filtered scheme list
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.schemeCode.toLowerCase().includes(q) ||
        s.schemeName.toLowerCase().includes(q) ||
        s.division.toLowerCase().includes(q) ||
        s.participantRole.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();
      const matchDivision = divisionFilter === "all" || s.division === divisionFilter;

      return matchSearch && matchStatus && matchDivision;
    });
  }, [schemes, searchTerm, statusFilter, divisionFilter]);

  // Dynamic Divisions from Division Master PostgreSQL
  const { divisionNames: availableDivisions } = useIncentiveDivisions();

  // Helper for status badge styling
  const getStatusBadge = (status: SchemeStatus) => {
    switch (status) {
      case "Active":
        return "bg-success-soft text-success border-success/30";
      case "Approved":
        return "bg-info-soft text-info border-info/30";
      case "Draft":
        return "bg-warning-soft text-warning border-warning/30";
      case "Superseded":
        return "bg-muted text-muted-foreground border-border";
      case "Inactive":
        return "bg-destructive-soft text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // -------------------------------------------------------------
  // VALIDATION & ACTIONS
  // -------------------------------------------------------------

  // Action: Add Scheme for Incentive Administrator
  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory validations
    if (!newSchemeForm.schemeCode.trim()) {
      toast.error("Validation Failed: Scheme Code is mandatory.");
      return;
    }
    if (!newSchemeForm.schemeName.trim()) {
      toast.error("Validation Failed: Scheme Name is mandatory.");
      return;
    }
    if (!newSchemeForm.effectiveFrom) {
      toast.error("Validation Failed: Effective From date is mandatory.");
      return;
    }

    // Validation: Date logic
    if (newSchemeForm.effectiveTo && newSchemeForm.effectiveTo <= newSchemeForm.effectiveFrom) {
      toast.error("Validation Failed: 'Effective To' date must be after 'Effective From' date.");
      return;
    }

    // Validation: Effective periods must not overlap for the same scheme code
    const existingWithSameCode = schemes.filter(
      (s) => s.schemeCode.trim().toUpperCase() === newSchemeForm.schemeCode.trim().toUpperCase(),
    );

    if (existingWithSameCode.length > 0) {
      const newStart = new Date(newSchemeForm.effectiveFrom).getTime();
      const newEnd = newSchemeForm.effectiveTo
        ? new Date(newSchemeForm.effectiveTo).getTime()
        : Infinity;

      for (const ex of existingWithSameCode) {
        const exStart = new Date(ex.effectiveFrom).getTime();
        const exEnd = ex.effectiveTo ? new Date(ex.effectiveTo).getTime() : Infinity;

        // Check date overlap
        if (newStart <= exEnd && newEnd >= exStart) {
          toast.error(
            `Validation Error: Effective period overlaps with existing ${ex.schemeCode} (${ex.version}: ${ex.effectiveFrom} to ${ex.effectiveTo || "Ongoing"}). Overlapping periods are prohibited.`,
          );
          return;
        }
      }
    }

    const newId = `sch-${Date.now()}`;
    const createdScheme: IncentiveScheme = {
      id: newId,
      schemeCode: newSchemeForm.schemeCode.trim().toUpperCase(),
      schemeName: newSchemeForm.schemeName.trim(),
      division: newSchemeForm.division,
      schemeType: newSchemeForm.schemeType,
      participantRole: newSchemeForm.participantRole,
      calculationBasis: newSchemeForm.calculationBasis,
      ageBasis: newSchemeForm.ageBasis,
      payableLagMonths: Number(newSchemeForm.payableLagMonths),
      effectiveFrom: newSchemeForm.effectiveFrom,
      effectiveTo: newSchemeForm.effectiveTo,
      status: "Draft",
      version: newSchemeForm.version || "v1.0",
      description:
        newSchemeForm.description || "Incentive scheme configured by Incentive Administrator.",
      rules: [
        {
          id: `r-${Date.now()}-1`,
          rule: "Minimum Target Threshold",
          parameter: "Min Target %",
          value: "80.00%",
          source: "Monthly Target Entry",
        },
        {
          id: `r-${Date.now()}-2`,
          rule: "Debtor Penalty Compliance",
          parameter: "Max Aging",
          value: "60 Days",
          source: "SAP AR Invoice Aging",
        },
      ],
      slabs: [
        {
          slabId: "S-01",
          minPercent: 0,
          maxPercent: 79.99,
          payoutPercent: 0,
          multiplier: 0,
          description: "Below qualifier",
        },
        {
          slabId: "S-02",
          minPercent: 80,
          maxPercent: 99.99,
          payoutPercent: 75,
          multiplier: 0.75,
          description: "Baseline qualifier",
        },
        {
          slabId: "S-03",
          minPercent: 100,
          maxPercent: 120,
          payoutPercent: 100,
          multiplier: 1.0,
          description: "Target achieved",
        },
      ],
      rateItems: [
        {
          category: "General Portfolio",
          productLine: "Standard Line",
          commissionRate: "2.50%",
          paymentTermBand: "0-30 Days",
          basis: newSchemeForm.calculationBasis,
        },
      ],
      exclusions: {
        customerGroups: ["Inter-company transfers"],
        itemCategories: ["FOC Samples"],
        jobCodes: [],
        clawbackWindowDays: 30,
      },
      posting: {
        debitGlAccount: "621000",
        debitGlName: "Sales Staff Incentive Expense",
        creditGlAccount: "214050",
        creditGlName: "Accrued Incentive Payable",
        costCenter: "CC-DEF-01",
        projectCode: "PRJ-2026",
        postingDayOfMonth: 25,
        journalRemarksTemplate: `INC/{Period}/${newSchemeForm.schemeCode.toUpperCase()}/{EmpNo}`,
      },
      versions: [
        {
          version: newSchemeForm.version || "v1.0",
          effectiveFrom: newSchemeForm.effectiveFrom,
          effectiveTo: newSchemeForm.effectiveTo,
          status: "Draft",
          createdBy: "Incentive Administrator (A. Perera)",
          createdDate: new Date().toISOString().split("T")[0] || "2026-01-01",
          changeSummary: "Initial draft configured.",
        },
      ],
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          user: "Incentive Administrator",
          role: "Administrator",
          action: "Scheme Created",
          details: `Created new scheme draft ${newSchemeForm.schemeCode} (${newSchemeForm.version || "v1.0"}).`,
        },
      ],
    };

    setSchemes((prev) => [createdScheme, ...prev]);
    setSelectedSchemeId(newId);
    setIsAddModalOpen(false);

    // Persist to PostgreSQL
    apiFetch("/api/incentives/schemes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createdScheme),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.scheme) {
            setSchemes((prev) => [data.scheme, ...prev.filter((s) => s.id !== newId)]);
            setSelectedSchemeId(data.scheme.id);
            setIsDbConnected(true);
            toast.success(`Scheme ${data.scheme.schemeCode} saved directly to PostgreSQL!`, {
              description: "Draft created. You can define rules, slabs and rate tables before submitting for approval.",
            });
            return;
          }
        }
        toast.info(`Scheme ${createdScheme.schemeCode} created locally in Draft status.`);
      })
      .catch((err) => {
        console.error("PostgreSQL persist error:", err);
        toast.info(`Scheme ${createdScheme.schemeCode} created locally in Draft status.`);
      });
  };

  // Action: Copy to New Version for an active scheme
  const handleCopyToNewVersion = () => {
    if (!currentScheme) return;

    // Check overlap validation for new version
    const newStart = new Date(copyVersionForm.effectiveFrom).getTime();
    const newEnd = copyVersionForm.effectiveTo
      ? new Date(copyVersionForm.effectiveTo).getTime()
      : Infinity;

    // Existing versions of this same scheme code
    const sameCodeSchemes = schemes.filter(
      (s) => s.schemeCode === currentScheme.schemeCode && s.id !== currentScheme.id,
    );

    for (const ex of sameCodeSchemes) {
      const exStart = new Date(ex.effectiveFrom).getTime();
      const exEnd = ex.effectiveTo ? new Date(ex.effectiveTo).getTime() : Infinity;
      if (newStart <= exEnd && newEnd >= exStart) {
        toast.error(
          `Validation Error: Effective period overlaps with existing ${ex.schemeCode} version ${ex.version} (${ex.effectiveFrom} to ${ex.effectiveTo || "Ongoing"}). Overlapping periods are prohibited.`,
        );
        return;
      }
    }

    const newVersionString =
      copyVersionForm.newVersion.trim() ||
      `v${parseFloat(currentScheme.version.replace("v", "")) + 0.1}`;
    const newId = `sch-${Date.now()}`;

    const newVersionScheme: IncentiveScheme = {
      ...currentScheme,
      id: newId,
      version: newVersionString,
      status: "Draft",
      effectiveFrom: copyVersionForm.effectiveFrom,
      effectiveTo: copyVersionForm.effectiveTo,
      description: `${currentScheme.description} (New version copy ${newVersionString})`,
      versions: [
        {
          version: newVersionString,
          effectiveFrom: copyVersionForm.effectiveFrom,
          effectiveTo: copyVersionForm.effectiveTo,
          status: "Draft",
          createdBy: "Incentive Administrator (S. Perera)",
          createdDate: new Date().toISOString().split("T")[0] || "2026-01-01",
          changeSummary:
            copyVersionForm.changeSummary ||
            `Copied from ${currentScheme.version} to adjust parameters for upcoming period.`,
        },
        ...currentScheme.versions,
      ],
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          user: "S. Perera",
          role: "Incentive Administrator",
          action: "Copied to New Version",
          details: `Copied from ${currentScheme.version} (${currentScheme.status}) into editable Draft ${newVersionString}.`,
        },
        ...currentScheme.history,
      ],
    };

    setSchemes((prev) => [newVersionScheme, ...prev]);
    setSelectedSchemeId(newId);
    setIsCopyModalOpen(false);
    toast.success(
      `New draft version ${newVersionString} created for ${currentScheme.schemeCode}.`,
      {
        description:
          "You can now edit parameters in this draft without altering active production rules.",
      },
    );

    // Persist cloned version to PostgreSQL
    apiFetch(`/api/incentives/schemes/${currentScheme.id}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newCode: `${currentScheme.schemeCode}-${newVersionString.replace(".", "_")}`,
        newName: `${currentScheme.schemeName} (${newVersionString})`,
        user: "Incentive Administrator",
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.scheme) {
            setSchemes((prev) => [data.scheme, ...prev.filter((s) => s.id !== newId)]);
            setSelectedSchemeId(data.scheme.id);
          }
        }
      })
      .catch((err) => console.error("PostgreSQL clone error:", err));
  };

  // Action: Activate an approved scheme after Finance/CEO approval
  const handleActivateScheme = () => {
    if (!currentScheme) return;

    if (currentScheme.status !== "Approved") {
      toast.error("Validation Error: Only an Approved scheme can be Activated.");
      return;
    }

    if (!activationAuthNote.trim()) {
      toast.error("Please enter the Finance / CEO approval authorization reference.");
      return;
    }

    // When activating, any currently active scheme with the same schemeCode transitions to Superseded!
    setSchemes((prev) =>
      prev.map((s) => {
        if (
          s.schemeCode === currentScheme.schemeCode &&
          s.id !== currentScheme.id &&
          s.status === "Active"
        ) {
          return {
            ...s,
            status: "Superseded",
            history: [
              {
                id: `h-sup-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                user: "System Daemon",
                role: "ERP Automation",
                action: "Status Superseded",
                details: `Superseded automatically by newly activated version ${currentScheme.version}.`,
              },
              ...s.history,
            ],
          };
        }
        if (s.id === currentScheme.id) {
          return {
            ...s,
            status: "Active",
            history: [
              {
                id: `h-act-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                user: "Head of Finance / CEO",
                role: "Executive Authorizer",
                action: "Scheme Activated",
                details: `Scheme activated for live calculation runs. Authorization: ${activationAuthNote}`,
              },
              ...s.history,
            ],
          };
        }
        return s;
      }),
    );

    setIsActivateModalOpen(false);
    toast.success(`Scheme ${currentScheme.schemeCode} (${currentScheme.version}) is now ACTIVE.`, {
      description: `Finance/CEO approval verified. Ready for calculation runs. Prior active versions marked Superseded.`,
    });

    // Persist activation to PostgreSQL
    apiFetch(`/api/incentives/schemes/${currentScheme.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Active",
        user: "Head of Finance / CEO",
        role: "Executive Authorizer",
        notes: `Scheme activated. Authorization: ${activationAuthNote}`,
      }),
    }).catch((err) => console.error("PostgreSQL activate status error:", err));
  };

  // Action: Deactivate only when there is no open calculation run
  const handleDeactivateScheme = () => {
    if (!currentScheme) return;

    // VALIDATION: Deactivate only when there is no open calculation run!
    if (hasOpenCalculationRun) {
      toast.error("Deactivation Blocked: Open Calculation Run In Progress", {
        description:
          "Scheme has an active open calculation run ('RUN-2026-05-PRE'). Complete or cancel open runs before deactivating this scheme.",
        duration: 5000,
      });
      return;
    }

    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id === currentScheme.id) {
          return {
            ...s,
            status: "Inactive",
            history: [
              {
                id: `h-deact-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                user: "S. Perera",
                role: "Incentive Administrator",
                action: "Scheme Deactivated",
                details:
                  "Deactivated following audit clearance. No open calculation runs detected.",
              },
              ...s.history,
            ],
          };
        }
        return s;
      }),
    );

    setIsDeactivateModalOpen(false);
    toast.success(`Scheme ${currentScheme.schemeCode} has been marked Inactive.`, {
      description: "Scheme is locked from inclusion in new calculation runs.",
    });

    // Persist deactivation to PostgreSQL
    apiFetch(`/api/incentives/schemes/${currentScheme.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Inactive",
        user: "S. Perera",
        role: "Incentive Administrator",
        notes: "Deactivated following audit clearance. No open calculation runs detected.",
      }),
    }).catch((err) => console.error("PostgreSQL deactivate error:", err));
  };

  // Action: Submit Draft for Approval (Draft -> Approved)
  const handleSubmitForApproval = () => {
    if (currentScheme.status !== "Draft") return;
    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id === currentScheme.id) {
          return {
            ...s,
            status: "Approved",
            history: [
              {
                id: `h-app-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                user: "D. Fernando",
                role: "Head of Finance",
                action: "Scheme Approved",
                details: "Approved for production rollout pending activation.",
              },
              ...s.history,
            ],
          };
        }
        return s;
      }),
    );
    toast.success(`Scheme ${currentScheme.schemeCode} approved by Finance/CEO.`, {
      description:
        "Scheme is now in 'Approved' status. Click 'Activate Scheme' to put into live production.",
    });

    // Persist approval status to PostgreSQL
    apiFetch(`/api/incentives/schemes/${currentScheme.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Approved",
        user: "D. Fernando",
        role: "Head of Finance",
        notes: "Approved for production rollout pending activation.",
      }),
    }).catch((err) => console.error("PostgreSQL approve error:", err));
  };

  // Action: Add Rule to scheme
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleForm.rule.trim() || !newRuleForm.parameter.trim() || !newRuleForm.value.trim()) {
      toast.error("Please fill all rule fields.");
      return;
    }

    // Check if scheme is active: Active scheme cannot be edited!
    if (currentScheme.status === "Active") {
      toast.error(
        "Validation Error: An active scheme cannot be edited; create a new version instead.",
      );
      return;
    }

    const newRule: SchemeRule = {
      id: `r-${Date.now()}`,
      rule: newRuleForm.rule.trim(),
      parameter: newRuleForm.parameter.trim(),
      value: newRuleForm.value.trim(),
      source: newRuleForm.source,
    };

    const updatedRules = [...currentScheme.rules, newRule];

    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id === currentScheme.id) {
          return {
            ...s,
            rules: updatedRules,
            history: [
              {
                id: `h-rule-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                user: "Incentive Administrator",
                role: "Administrator",
                action: "Rule Added",
                details: `Added rule: ${newRule.rule} (${newRule.parameter} = ${newRule.value})`,
              },
              ...s.history,
            ],
          };
        }
        return s;
      }),
    );

    setNewRuleForm({ rule: "", parameter: "", value: "", source: "Monthly Target Entry" });
    setIsAddRuleModalOpen(false);
    toast.success("Rule added successfully to scheme definition.");

    // Persist updated rules to PostgreSQL
    apiFetch(`/api/incentives/schemes/${currentScheme.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rules: updatedRules,
        changeNote: `Added qualification rule: ${newRule.rule}`,
      }),
    }).catch((err) => console.error("PostgreSQL rule add error:", err));
  };

  // Action: Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    if (currentScheme.status === "Active") {
      toast.error(
        "Validation Error: An active scheme cannot be edited; create a new version instead.",
      );
      return;
    }

    const remainingRules = currentScheme.rules.filter((r) => r.id !== ruleId);

    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id === currentScheme.id) {
          return {
            ...s,
            rules: remainingRules,
          };
        }
        return s;
      }),
    );
    toast.info("Rule removed from scheme.");

    // Persist updated rules to PostgreSQL
    apiFetch(`/api/incentives/schemes/${currentScheme.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rules: remainingRules,
        changeNote: `Removed qualification rule ${ruleId}`,
      }),
    }).catch((err) => console.error("PostgreSQL rule delete error:", err));
  };

  // Action: Save Entire Scheme Definition to PostgreSQL
  const handleSaveSchemeToDb = async () => {
    if (!currentScheme) return;
    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/schemes/${currentScheme.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentScheme,
          modifiedBy: "Incentive Administrator",
          changeNote: `Manual save for ${currentScheme.schemeCode} (${currentScheme.version}).`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.scheme) {
          setSchemes((prev) =>
            prev.map((s) => (s.id === currentScheme.id ? data.scheme : s)),
          );
        }
        toast.success(`Scheme ${currentScheme.schemeCode} saved to PostgreSQL!`, {
          description: "All rules, rate tables, slabs, and posting codes are saved to the database.",
        });
      } else {
        toast.error("Failed to save scheme to PostgreSQL.");
      }
    } catch (err) {
      console.error("Save scheme error:", err);
      toast.error("Network or database error while saving scheme.");
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Delete Scheme from PostgreSQL (Draft or Inactive)
  const handleDeleteScheme = async () => {
    if (!currentScheme) return;
    if (currentScheme.status === "Active" || currentScheme.status === "Approved") {
      toast.error("Active or Approved schemes cannot be deleted. Deactivate first.");
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Are you sure you want to permanently delete scheme "${currentScheme.schemeCode}" from PostgreSQL?`,
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/incentives/schemes/${currentScheme.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Scheme ${currentScheme.schemeCode} deleted from PostgreSQL.`);
        const remaining = schemes.filter((s) => s.id !== currentScheme.id);
        setSchemes(remaining);
        if (remaining.length > 0 && remaining[0]) {
          setSelectedSchemeId(remaining[0].id);
        }
      } else {
        toast.error("Failed to delete scheme from database.");
      }
    } catch (err) {
      console.error("Delete scheme error:", err);
      toast.error("Error communicating with PostgreSQL server.");
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Export Excel / PDF
  const handleExport = (format: "excel" | "pdf") => {
    toast.success(
      `Exporting ${currentScheme.schemeCode} (${currentScheme.version}) to ${format.toUpperCase()}...`,
      {
        description:
          "Includes scheme metadata, rules matrix, slabs, exclusions, and posting parameters.",
      },
    );
  };

  const isActiveLocked = currentScheme.status === "Active";

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* Quick Navigation Banner (Rate Matrix & Calculation Run)       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/60 p-3 sm:px-4 rounded-lg border border-border/80">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Settings2 size={15} className="text-primary" />
          <span className="font-semibold text-foreground">Incentive Workflow Navigation:</span>
          <span className="hidden sm:inline">Jump directly to linked operational modules</span>
        </div>
        <div className="flex items-center gap-2">
          {onNavigateScreen && (
            <>
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
                onClick={() => onNavigateScreen("slab-table")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <TrendingUp size={13} className="text-primary" />
                <span>Target Slabs</span>
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
                <span>Participant Profiles</span>
                <ChevronRight size={12} className="text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("attendance-import")}
                className="h-7 text-xs gap-1.5 bg-card hover:bg-accent cursor-pointer"
              >
                <UploadCloud size={13} className="text-primary" />
                <span>Attendance Import</span>
                <ChevronRight size={12} className="text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Top Action Bar & Master Selector                              */}
      {/* ------------------------------------------------------------- */}
      <div className="card-surface p-4 sm:p-5 rounded-lg border bg-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary shadow-xs">
              <Award size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Incentive Scheme Master
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-muted text-muted-foreground border">
                  Total Schemes: {schemes.length}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                    isDbConnected
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isDbConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                  />
                  <Database size={11} />
                  <span>{isDbConnected ? "PostgreSQL Connected" : "Local Mode"}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define incentive and commission schemes, participants, calculation basis,
                calculation method, period and posting rules.
              </p>
            </div>
          </div>

          {/* Top Primary Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => loadSchemesFromDb(false)}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin text-primary" : ""} />
              <span>{isLoading ? "Syncing..." : "Sync DB"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("excel")}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <Download size={13} />
              <span>Export Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <Printer size={13} />
              <span>Export PDF</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const defaultDiv = availableDivisions[0] || "Commercial HVAC";
                setNewSchemeForm({
                  schemeCode: `SCH-${defaultDiv.substring(0, 3).toUpperCase()}-2026`,
                  schemeName: "",
                  division: defaultDiv,
                  schemeType: "Turnover Tier + Slabs",
                  participantRole: "Retail Sales Executive",
                  calculationBasis: "Billed Revenue (Excl. Tax)",
                  ageBasis: "Invoice Date",
                  payableLagMonths: 1,
                  effectiveFrom: "2026-07-01",
                  effectiveTo: "2026-12-31",
                  status: "Draft",
                  version: "v1.0",
                  description: "",
                });
                setIsAddModalOpen(true);
              }}
              className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add Scheme (Admin)</span>
            </Button>
          </div>
        </div>

        {/* Filters and Scheme Select Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search scheme code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-8 bg-background text-xs h-8 w-full"
              />
            </div>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="input-field bg-background text-xs h-8 px-2"
            >
              <option value="all">All Divisions</option>
              {availableDivisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field bg-background text-xs h-8 px-2 capitalize"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
              <option value="superseded">Superseded</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground self-center">
            Showing <span className="font-semibold text-foreground">{filteredSchemes.length}</span>{" "}
            of {schemes.length} schemes
          </div>
        </div>

        {/* Scheme Selector Horizontal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
          {filteredSchemes.map((s) => {
            const isSelected = s.id === currentScheme.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSchemeId(s.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                    : "border-border/70 bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-xs font-bold text-foreground truncate">
                    {s.schemeCode}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {s.version}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-1">{s.schemeName}</p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getStatusBadge(s.status)}`}
                  >
                    {s.status}
                  </span>
                  <span className="text-muted-foreground text-[10px] truncate max-w-[80px]">
                    {s.division.split(" ")[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Selected Scheme Detail Header Panel                           */}
      {/* ------------------------------------------------------------- */}
      <div className="card-surface p-5 rounded-lg border bg-card space-y-4 shadow-xs">
        {/* Active Scheme Lock Warning Banner */}
        {isActiveLocked && (
          <div className="flex items-start gap-3 p-3 rounded-md bg-info-soft/40 border border-info/30 text-xs">
            <Lock size={15} className="text-info shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-foreground">
                Active Scheme (Production Locked):{" "}
              </span>
              <span className="text-muted-foreground">
                An active scheme cannot be edited directly to ensure audit integrity of payroll &
                ERP calculations. To make parameter modifications, use the{" "}
                <strong className="text-foreground">"Copy to New Version"</strong> button below.
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-xl font-bold text-foreground">{currentScheme.schemeName}</h3>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary-soft text-primary border border-primary/20">
                {currentScheme.schemeCode}
              </span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border">
                {currentScheme.version}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(currentScheme.status)}`}
              >
                {currentScheme.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{currentScheme.description}</p>
          </div>

          {/* Scheme Actions (Status-flow sensitive) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Action: Save Scheme Definition to PostgreSQL */}
            <Button
              size="sm"
              disabled={isSaving}
              onClick={handleSaveSchemeToDb}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              <Save size={13} className={isSaving ? "animate-spin" : ""} />
              <span>{isSaving ? "Saving..." : "Save to PostgreSQL"}</span>
            </Button>

            {/* Action 1: Copy to New Version (available for Active/Approved schemes) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const verNum = parseFloat(currentScheme.version.replace("v", "")) || 1.0;
                setCopyVersionForm({
                  newVersion: `v${(verNum + 0.1).toFixed(1)}`,
                  effectiveFrom: "2027-01-01",
                  effectiveTo: "2027-12-31",
                  changeSummary: `New version created from ${currentScheme.version} for upcoming policy update.`,
                });
                setIsCopyModalOpen(true);
              }}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <Copy size={13} />
              <span>Copy to New Version</span>
            </Button>

            {/* Action 2: Submit for Approval (Draft status) */}
            {currentScheme.status === "Draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmitForApproval}
                className="h-8 text-xs gap-1.5 text-info border-info/40 bg-info-soft hover:bg-info/20 cursor-pointer"
              >
                <FileCheck size={13} />
                <span>Submit for Approval</span>
              </Button>
            )}

            {/* Action 3: Activate (Approved status -> Active after Finance/CEO approval) */}
            {currentScheme.status === "Approved" && (
              <Button
                size="sm"
                onClick={() => setIsActivateModalOpen(true)}
                className="h-8 text-xs gap-1.5 bg-success text-success-foreground hover:bg-success/90 cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Activate Scheme</span>
              </Button>
            )}

            {/* Action 4: Deactivate (Active status -> Inactive only when no open run) */}
            {currentScheme.status === "Active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeactivateModalOpen(true)}
                className="h-8 text-xs gap-1.5 text-destructive border-destructive/40 hover:bg-destructive-soft cursor-pointer"
              >
                <AlertCircle size={13} />
                <span>Deactivate</span>
              </Button>
            )}

            {/* Action 5: Delete Draft or Inactive Scheme from PostgreSQL */}
            {(currentScheme.status === "Draft" || currentScheme.status === "Inactive") && (
              <Button
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={handleDeleteScheme}
                className="h-8 text-xs gap-1.5 text-destructive border-destructive/40 hover:bg-destructive-soft cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Mandatory Scheme Master Fields Grid                           */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Scheme Code *
            </span>
            <p className="mt-0.5 text-xs font-bold text-foreground font-mono">
              {currentScheme.schemeCode}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">Division *</span>
            <p className="mt-0.5 text-xs font-semibold text-foreground truncate">
              {currentScheme.division}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Scheme Type *
            </span>
            <p className="mt-0.5 text-xs font-semibold text-foreground truncate">
              {currentScheme.schemeType}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Participant Role *
            </span>
            <p className="mt-0.5 text-xs font-semibold text-foreground truncate">
              {currentScheme.participantRole}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Calculation Basis *
            </span>
            <p className="mt-0.5 text-xs font-semibold text-foreground truncate">
              {currentScheme.calculationBasis}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">Age Basis *</span>
            <p className="mt-0.5 text-xs font-semibold text-foreground">{currentScheme.ageBasis}</p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Payable Lag (Months) *
            </span>
            <p className="mt-0.5 text-xs font-semibold text-foreground">
              {currentScheme.payableLagMonths} Month{currentScheme.payableLagMonths > 1 ? "s" : ""}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Effective From *
            </span>
            <p className="mt-0.5 text-xs font-semibold text-foreground font-mono">
              {currentScheme.effectiveFrom}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Effective To
            </span>
            <p className="mt-0.5 text-xs font-semibold text-foreground font-mono">
              {currentScheme.effectiveTo || "Ongoing / Open"}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">Status *</span>
            <p className="mt-0.5 text-xs font-semibold text-foreground">{currentScheme.status}</p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">Version</span>
            <p className="mt-0.5 text-xs font-bold text-foreground font-mono">
              {currentScheme.version}
            </p>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">Posting Day</span>
            <p className="mt-0.5 text-xs font-semibold text-foreground">
              {currentScheme.posting.postingDayOfMonth}th of month
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* The 7 Required Scheme Master Tabs                             */}
      {/* ------------------------------------------------------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="border-b">
          <TabsList className="bg-transparent h-10 p-0 space-x-1 sm:space-x-2 overflow-x-auto justify-start">
            <TabsTrigger
              value="rules"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-xs font-semibold text-muted-foreground cursor-pointer"
            >
              1. Rules ({currentScheme.rules.length})
            </TabsTrigger>
            <TabsTrigger
              value="rates"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-xs font-semibold text-muted-foreground cursor-pointer"
            >
              2. Rate Tables ({currentScheme.rateItems.length})
            </TabsTrigger>
            <TabsTrigger
              value="slabs"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-xs font-semibold text-muted-foreground cursor-pointer"
            >
              3. Slabs ({currentScheme.slabs.length})
            </TabsTrigger>
            <TabsTrigger
              value="exclusions"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-xs font-semibold text-muted-foreground cursor-pointer"
            >
              4. Exclusions
            </TabsTrigger>
            <TabsTrigger
              value="posting"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-xs font-semibold text-muted-foreground cursor-pointer"
            >
              5. Posting (SAP B1)
            </TabsTrigger>
            <TabsTrigger
              value="versions"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-xs font-semibold text-muted-foreground cursor-pointer"
            >
              6. Versions ({currentScheme.versions.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-xs font-semibold text-muted-foreground cursor-pointer"
            >
              7. History ({currentScheme.history.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: RULES GRID (Rule, Parameter, Value, Source)             */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="rules" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border">
            <div>
              <h4 className="text-sm font-bold text-foreground">Scheme Rules Grid</h4>
              <p className="text-xs text-muted-foreground">
                Specifies calculation formulas, eligibility gates, caps, penalties, and upstream
                data sources.
              </p>
            </div>
            <Button
              size="sm"
              disabled={isActiveLocked}
              onClick={() => setIsAddRuleModalOpen(true)}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Rule</span>
            </Button>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/60 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Rule</th>
                    <th className="px-4 py-3">Parameter</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentScheme.rules.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-primary shrink-0" />
                        <span>{r.rule}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{r.parameter}</td>
                      <td className="px-4 py-3 font-bold text-foreground">{r.value}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border">
                          {r.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isActiveLocked}
                          onClick={() => handleDeleteRule(r.id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive-soft disabled:opacity-30 cursor-pointer"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {currentScheme.rules.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-xs text-muted-foreground"
                      >
                        No rules configured for this scheme yet. Click "Add Rule" to add parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: RATE TABLES                                            */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="rates" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border">
            <div>
              <h4 className="text-sm font-bold text-foreground">Linked Commission Rate Tables</h4>
              <p className="text-xs text-muted-foreground">
                Base commission percentage rates by category, product dimensions and payment-term
                bands.
              </p>
            </div>
            {onNavigateScreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("rate-matrix")}
                className="h-8 text-xs gap-1.5 cursor-pointer bg-card hover:bg-accent"
              >
                <ExternalLink size={13} className="text-primary" />
                <span>Open Commission Rate Matrix</span>
              </Button>
            )}
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/60 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product Category</th>
                    <th className="px-4 py-3">Product Line / SKU Series</th>
                    <th className="px-4 py-3">Commission Rate</th>
                    <th className="px-4 py-3">Payment Term Band</th>
                    <th className="px-4 py-3">Calculation Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentScheme.rateItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{item.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.productLine}</td>
                      <td className="px-4 py-3 font-bold text-primary font-mono">
                        {item.commissionRate}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {item.paymentTermBand}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: SLABS (Achievement Thresholds & Multipliers)           */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="slabs" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border">
            <div>
              <h4 className="text-sm font-bold text-foreground">Target Incentive Slab Table</h4>
              <p className="text-xs text-muted-foreground">
                Progressive achievement bands, qualifying floor limits, multipliers and payout
                accelerator tiers.
              </p>
            </div>
            {onNavigateScreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateScreen("slab-table")}
                className="h-8 text-xs gap-1.5 cursor-pointer bg-card hover:bg-accent"
              >
                <ExternalLink size={13} className="text-primary" />
                <span>Open Slabs Configuration</span>
              </Button>
            )}
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/60 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Slab ID</th>
                    <th className="px-4 py-3">Min Achievement %</th>
                    <th className="px-4 py-3">Max Achievement %</th>
                    <th className="px-4 py-3">Payout %</th>
                    <th className="px-4 py-3">Multiplier</th>
                    <th className="px-4 py-3">Classification & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentScheme.slabs.map((slab) => (
                    <tr key={slab.slabId} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {slab.slabId}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground font-mono">
                        {slab.minPercent.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground font-mono">
                        {slab.maxPercent >= 200
                          ? "No Upper Limit"
                          : `${slab.maxPercent.toFixed(1)}%`}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary font-mono">
                        {slab.payoutPercent}%
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {slab.multiplier}x
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{slab.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: EXCLUSIONS                                             */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="exclusions" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="card-surface p-4 rounded-lg border bg-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Scheme Exclusions & Disqualification Rules
              </h4>
              <p className="text-xs text-muted-foreground">
                Non-commissionable transactions, customer types, return clawback windows, and
                promotional item filters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Shield size={14} className="text-primary" />
                  Excluded Customer Groups
                </span>
                <p className="text-xs text-muted-foreground">
                  Invoices generated for the following customer categories do not generate incentive
                  entitlement:
                </p>
                <div className="space-y-1.5 pt-1">
                  {currentScheme.exclusions.customerGroups.map((cg, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs bg-card p-2 rounded border"
                    >
                      <X size={12} className="text-destructive shrink-0" />
                      <span className="font-medium text-foreground">{cg}</span>
                    </div>
                  ))}
                  {currentScheme.exclusions.customerGroups.length === 0 && (
                    <span className="text-xs text-muted-foreground">None specified</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle size={14} className="text-warning" />
                  Excluded Product Lines & SKU Categories
                </span>
                <p className="text-xs text-muted-foreground">
                  Items filtered out from revenue aggregation in SAP Business One:
                </p>
                <div className="space-y-1.5 pt-1">
                  {currentScheme.exclusions.itemCategories.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs bg-card p-2 rounded border"
                    >
                      <X size={12} className="text-destructive shrink-0" />
                      <span className="font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                  {currentScheme.exclusions.itemCategories.length === 0 && (
                    <span className="text-xs text-muted-foreground">None specified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-foreground">
                  Sales Return & Clawback Window
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Transactions returned or unpaid within this window trigger automatic clawback
                  ledger adjustments.
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-primary px-3 py-1 rounded bg-primary-soft border border-primary/20">
                {currentScheme.exclusions.clawbackWindowDays} Days
              </span>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: POSTING (SAP Business One Rules)                       */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="posting" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="card-surface p-4 rounded-lg border bg-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  SAP Business One Posting & GL Accounting
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pre-configured journal entry templates, cost center mapping, and payroll
                  disbursement rules.
                </p>
              </div>
              <span className="text-xs font-mono bg-muted px-2.5 py-1 rounded border text-muted-foreground">
                Target: SAP B1 Journal Voucher
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Debit GL Account (Expense)
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground bg-card px-2.5 py-1 rounded border">
                    {currentScheme.posting.debitGlAccount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentScheme.posting.debitGlName}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Credit GL Account (Accrual Liability)
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground bg-card px-2.5 py-1 rounded border">
                    {currentScheme.posting.creditGlAccount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentScheme.posting.creditGlName}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Cost Center Dimension
                </span>
                <p className="text-xs font-mono font-semibold text-foreground">
                  {currentScheme.posting.costCenter}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Project Code Reference
                </span>
                <p className="text-xs font-mono font-semibold text-foreground">
                  {currentScheme.posting.projectCode}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1">
              <span className="text-xs font-bold text-foreground block">
                Journal Voucher Remarks Format
              </span>
              <p className="text-xs font-mono text-primary bg-card p-2 rounded border">
                {currentScheme.posting.journalRemarksTemplate}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: VERSIONS                                               */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="versions" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border">
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Scheme Versions & Revision Trail
              </h4>
              <p className="text-xs text-muted-foreground">
                All historical, active, and draft versions for Scheme Code:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {currentScheme.schemeCode}
                </span>
                .
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const verNum = parseFloat(currentScheme.version.replace("v", "")) || 1.0;
                setCopyVersionForm({
                  newVersion: `v${(verNum + 0.1).toFixed(1)}`,
                  effectiveFrom: "2027-01-01",
                  effectiveTo: "2027-12-31",
                  changeSummary: `New version created from ${currentScheme.version}.`,
                });
                setIsCopyModalOpen(true);
              }}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <Copy size={13} />
              <span>Copy to New Version</span>
            </Button>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/60 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3">Effective Range</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created By</th>
                    <th className="px-4 py-3">Approved By</th>
                    <th className="px-4 py-3">Change Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentScheme.versions.map((ver, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        <span className="flex items-center gap-1.5">
                          {ver.version === currentScheme.version && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                          {ver.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {ver.effectiveFrom} &rarr; {ver.effectiveTo || "Ongoing"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(ver.status)}`}
                        >
                          {ver.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{ver.createdBy}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ver.approvedBy || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs">
                        {ver.changeSummary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 7: HISTORY (Audit Log)                                    */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="history" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="card-surface p-4 rounded-lg border bg-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Audit Log & State Transitions</h4>
              <p className="text-xs text-muted-foreground">
                Chronological record of scheme creation, modifications, approvals, activations and
                deactivations.
              </p>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {currentScheme.history.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                      <span>
                        User: <strong className="text-foreground">{log.user}</strong>
                      </span>
                      <span>&middot;</span>
                      <span>Role: {log.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD SCHEME (Incentive Administrator)                 */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="card-surface bg-card rounded-xl border max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Plus size={16} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">Add New Incentive Scheme</h3>
                  <p className="text-xs text-muted-foreground">
                    Incentive Administrator Scheme Definition
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Scheme Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCH-MOB-2026"
                    value={newSchemeForm.schemeCode}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, schemeCode: e.target.value })
                    }
                    className="input-field bg-background font-mono text-xs w-full uppercase"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Unique identifier in SAP B1
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Scheme Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Retail Smartphone Sales Scheme"
                    value={newSchemeForm.schemeName}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, schemeName: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Division *</label>
                  <select
                    value={newSchemeForm.division}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, division: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  >
                    {availableDivisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Scheme Type *</label>
                  <select
                    value={newSchemeForm.schemeType}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, schemeType: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  >
                    <option value="Turnover Tier + Slabs">Turnover Tier + Slabs</option>
                    <option value="Volume Achievement Matrix">Volume Achievement Matrix</option>
                    <option value="FTF Multiplier + Job Count">FTF Multiplier + Job Count</option>
                    <option value="Flat Bounty Per Unit">Flat Bounty Per Unit</option>
                    <option value="Gross Margin %">Gross Margin %</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Participant Role *
                  </label>
                  <select
                    value={newSchemeForm.participantRole}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, participantRole: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  >
                    <option value="Retail Sales Executive">Retail Sales Executive</option>
                    <option value="Field Service Technician">Field Service Technician</option>
                    <option value="Dealer Principal">Dealer Principal</option>
                    <option value="Showroom Promoter">Showroom Promoter</option>
                    <option value="Area Sales Manager">Area Sales Manager</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Calculation Basis *
                  </label>
                  <select
                    value={newSchemeForm.calculationBasis}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, calculationBasis: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  >
                    <option value="Billed Revenue (Excl. Tax)">Billed Revenue (Excl. Tax)</option>
                    <option value="Collected Cash Amount">Collected Cash Amount</option>
                    <option value="Job Completion Count">Job Completion Count</option>
                    <option value="Sell-Out Unit Count">Sell-Out Unit Count</option>
                    <option value="Gross Margin">Gross Margin</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Age Basis *</label>
                  <select
                    value={newSchemeForm.ageBasis}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, ageBasis: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  >
                    <option value="Invoice Date">Invoice Date</option>
                    <option value="Payment Due Date">Payment Due Date</option>
                    <option value="Realization Date">Realization Date</option>
                    <option value="Job Close Date">Job Close Date</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Payable Lag in Months *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    required
                    value={newSchemeForm.payableLagMonths}
                    onChange={(e) =>
                      setNewSchemeForm({
                        ...newSchemeForm,
                        payableLagMonths: Number(e.target.value),
                      })
                    }
                    className="input-field bg-background text-xs w-full"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Disbursement lag (e.g. 1 month)
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Effective From *
                  </label>
                  <input
                    type="date"
                    required
                    value={newSchemeForm.effectiveFrom}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, effectiveFrom: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Effective To</label>
                  <input
                    type="date"
                    value={newSchemeForm.effectiveTo}
                    onChange={(e) =>
                      setNewSchemeForm({ ...newSchemeForm, effectiveTo: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  />
                  <span className="text-[10px] text-muted-foreground">Leave empty if ongoing</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Scheme Purpose / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline the business objectives, key target criteria, and payout justification..."
                  value={newSchemeForm.description}
                  onChange={(e) =>
                    setNewSchemeForm({ ...newSchemeForm, description: e.target.value })
                  }
                  className="input-field bg-background text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-[11px] text-muted-foreground">
                  Initial Status: <strong className="text-warning">Draft</strong> &middot; Version:{" "}
                  <strong className="text-foreground">v1.0</strong>
                </span>
                <div className="flex items-center gap-2">
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
                    className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Create Scheme (Draft)
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: COPY TO NEW VERSION                                  */}
      {/* ------------------------------------------------------------- */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card-surface bg-card rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Copy size={16} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Copy to New Version</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-md bg-muted/40 border text-xs space-y-1">
              <p className="text-muted-foreground">
                Source Scheme:{" "}
                <strong className="text-foreground">{currentScheme.schemeCode}</strong> (
                {currentScheme.schemeName})
              </p>
              <p className="text-muted-foreground">
                Current Version: <strong className="text-primary">{currentScheme.version}</strong> (
                {currentScheme.status})
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  New Version Number *
                </label>
                <input
                  type="text"
                  value={copyVersionForm.newVersion}
                  onChange={(e) =>
                    setCopyVersionForm({ ...copyVersionForm, newVersion: e.target.value })
                  }
                  placeholder="e.g. v2.2 or v3.0"
                  className="input-field bg-background font-mono text-xs w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Effective From *
                  </label>
                  <input
                    type="date"
                    value={copyVersionForm.effectiveFrom}
                    onChange={(e) =>
                      setCopyVersionForm({ ...copyVersionForm, effectiveFrom: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Effective To</label>
                  <input
                    type="date"
                    value={copyVersionForm.effectiveTo}
                    onChange={(e) =>
                      setCopyVersionForm({ ...copyVersionForm, effectiveTo: e.target.value })
                    }
                    className="input-field bg-background text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Change Summary / Audit Reason
                </label>
                <textarea
                  rows={2}
                  value={copyVersionForm.changeSummary}
                  onChange={(e) =>
                    setCopyVersionForm({ ...copyVersionForm, changeSummary: e.target.value })
                  }
                  placeholder="Describe reason for new version (e.g. updated slab accelerators for Q1)..."
                  className="input-field bg-background text-xs w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCopyToNewVersion}
                className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create New Version (Draft)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ACTIVATE SCHEME (Finance / CEO Approval)             */}
      {/* ------------------------------------------------------------- */}
      {isActivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card-surface bg-card rounded-xl border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 size={18} />
                <h3 className="text-base font-bold text-foreground">Activate Scheme</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsActivateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Activating{" "}
              <strong className="text-foreground">
                {currentScheme.schemeCode} ({currentScheme.version})
              </strong>{" "}
              will deploy this scheme into production for live monthly incentive calculation runs.
            </p>

            <div className="p-3 rounded-md bg-warning-soft/30 border border-warning/30 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Automatic Superseding:</span> Any
              currently active versions of {currentScheme.schemeCode} will be automatically
              transitioned to <strong>Superseded</strong>.
            </div>

            <div className="text-xs space-y-1">
              <label className="font-semibold text-foreground block">
                Finance / CEO Approval Authorization Reference *
              </label>
              <input
                type="text"
                value={activationAuthNote}
                onChange={(e) => setActivationAuthNote(e.target.value)}
                placeholder="e.g. Ref #FIN-2026-104 & CEO Approval"
                className="input-field bg-background text-xs w-full"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsActivateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleActivateScheme}
                className="text-xs bg-success text-success-foreground hover:bg-success/90"
              >
                Confirm & Activate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: DEACTIVATE SCHEME (Calculation Run Check)             */}
      {/* ------------------------------------------------------------- */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card-surface bg-card rounded-xl border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle size={18} />
                <h3 className="text-base font-bold text-foreground">Deactivate Scheme</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              You are requesting to deactivate{" "}
              <strong className="text-foreground">{currentScheme.schemeCode}</strong>.
            </p>

            {/* Validation Check Container */}
            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2 text-xs">
              <span className="font-bold text-foreground block">
                Pre-deactivation Validation Gate
              </span>
              <p className="text-muted-foreground">
                ERP Business Rule: <em>Deactivate only when there is no open calculation run.</em>
              </p>

              {/* Interactive toggle simulating calculation run state for validation testing */}
              <div className="flex items-center justify-between p-2 rounded bg-card border mt-2">
                <div>
                  <span className="font-semibold text-foreground block">
                    Open Run Detection Simulation
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {hasOpenCalculationRun
                      ? "Detected: 'RUN-2026-05-PRE' is Open (Blocks deactivation)"
                      : "Clear: No open runs detected (Permits deactivation)"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHasOpenCalculationRun(!hasOpenCalculationRun)}
                  className="h-7 text-[11px] cursor-pointer"
                >
                  {hasOpenCalculationRun ? "Simulate All Closed" : "Simulate Open Run"}
                </Button>
              </div>

              {hasOpenCalculationRun && (
                <div className="p-2 rounded bg-destructive-soft text-destructive text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>
                    Validation Warning: Active open calculation run present. Deactivation will fail.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeactivateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeactivateScheme}
                className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                Attempt Deactivation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: ADD RULE                                             */}
      {/* ------------------------------------------------------------- */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card-surface bg-card rounded-xl border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Add Rule to Scheme</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRuleModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Return Deduction"
                  value={newRuleForm.rule}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, rule: e.target.value })}
                  className="input-field bg-background text-xs w-full"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Parameter *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return Window Days"
                  value={newRuleForm.parameter}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, parameter: e.target.value })}
                  className="input-field bg-background text-xs w-full"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Value *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45 Days or 85.00%"
                  value={newRuleForm.value}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, value: e.target.value })}
                  className="input-field bg-background text-xs w-full"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Source *</label>
                <select
                  value={newRuleForm.source}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, source: e.target.value })}
                  className="input-field bg-background text-xs w-full"
                >
                  <option value="Monthly Target Entry">Monthly Target Entry</option>
                  <option value="SAP AR Invoice Aging">SAP AR Invoice Aging</option>
                  <option value="Service Manager Evaluation">Service Manager Evaluation</option>
                  <option value="HR Attendance Bio-Metric">HR Attendance Bio-Metric</option>
                  <option value="Dealer Contract Appendix">Dealer Contract Appendix</option>
                  <option value="Policy Document Ceiling">Policy Document Ceiling</option>
                  <option value="SAP Bank Reconciliation">SAP Bank Reconciliation</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
