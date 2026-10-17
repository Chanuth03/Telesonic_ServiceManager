import {
  Award,
  Layers,
  TrendingUp,
  Target,
  UserCheck,
  UploadCloud,
  Wrench,
  FileSpreadsheet,
  PlayCircle,
  Sliders,
  CheckSquare,
  Send,
  Receipt,
  HelpCircle,
  BarChart3,
  Trophy,
  ShieldAlert,
  History,
  Settings2,
  type LucideIcon,
} from "lucide-react";

export type ScreenCategory =
  | "All"
  | "Master Data"
  | "Targets & Rules"
  | "Inputs & Imports"
  | "Processing & Runs"
  | "Approvals & Posting"
  | "Settlements & Statements"
  | "Monitoring & Risk";

export interface IncentiveScreenItem {
  id: string;
  screenNumber: number;
  title: string;
  category: ScreenCategory;
  description: string;
  icon: LucideIcon;
  tone: string;
  route?: string;
}

export const INCENTIVE_SCREENS: IncentiveScreenItem[] = [
  {
    id: "scheme-master",
    screenNumber: 1,
    title: "Incentive Scheme Master",
    category: "Master Data",
    description:
      "Define incentive schemes, effective dates, eligibility rules, qualification criteria, and calculation formulae.",
    icon: Award,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "rate-matrix",
    screenNumber: 2,
    title: "Commission & Rate Matrix Setup",
    category: "Master Data",
    description:
      "Configure multi-tier percentage or flat commission rates across item categories, brands, labor types, and customer segments.",
    icon: Layers,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "slab-table",
    screenNumber: 3,
    title: "Target Incentive Slab Table",
    category: "Targets & Rules",
    description:
      "Set volume achievement slabs, percentage multipliers, minimum qualification gates, and accelerated bonus percentages.",
    icon: TrendingUp,
    tone: "bg-warning-soft text-warning",
  },
  {
    id: "monthly-target",
    screenNumber: 4,
    title: "Monthly Target & Quota Allocation",
    category: "Targets & Rules",
    description:
      "Allocate monthly turnover targets, job completion quotas, and product targets per technician, team, and division.",
    icon: Target,
    tone: "bg-warning-soft text-warning",
  },
  {
    id: "participant-profile",
    screenNumber: 5,
    title: "Participant / Technician Profile Mapping",
    category: "Master Data",
    description:
      "Map technicians and sales agents to schemes, assign bank accounts for settlement, define experience grades, and base allowances.",
    icon: UserCheck,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "attendance-import",
    screenNumber: 6,
    title: "Attendance & Leave Factor Import",
    category: "Inputs & Imports",
    description:
      "Import monthly biometric punch records, working days, sick leaves, and compute attendance prorating factors.",
    icon: UploadCloud,
    tone: "bg-info-soft text-info",
  },
  {
    id: "service-performance",
    screenNumber: 7,
    title: "Service Performance & Job Sheet Actuals",
    category: "Inputs & Imports",
    description:
      "Pull closed service orders, warranty claims, spare parts billings, technician hours, and first-time-fix metrics from ERP.",
    icon: Wrench,
    tone: "bg-info-soft text-info",
  },
  {
    id: "calculation-results",
    screenNumber: 8,
    title: "Calculation Results Detail View",
    category: "Processing & Runs",
    description:
      "Inspect detailed technician-level incentive breakdowns, achievement slabs, commission sums, clawbacks, and net payable figures.",
    icon: FileSpreadsheet,
    tone: "bg-success-soft text-success",
  },
  {
    id: "calculation-run",
    screenNumber: 9,
    title: "Incentive Calculation Run & Batch Engine",
    category: "Processing & Runs",
    description:
      "Execute monthly or ad-hoc calculation batches, run simulations, validate pre-requisites, and review execution logs.",
    icon: PlayCircle,
    tone: "bg-success-soft text-success",
  },
  {
    id: "manual-adjustment",
    screenNumber: 10,
    title: "Manual Adjustments & Bonus Claims",
    category: "Processing & Runs",
    description:
      "Record discretionary bonuses, exceptional performance allowances, penalty waivers, and management adjustments with maker-checker.",
    icon: Sliders,
    tone: "bg-success-soft text-success",
  },
  {
    id: "approval-posting",
    screenNumber: 11,
    title: "Multi-Level Approval & Verification",
    category: "Approvals & Posting",
    description:
      "Route calculated batches through Department Head, Finance Manager, and Director approval workflows with digital audit stamps.",
    icon: CheckSquare,
    tone: "bg-warning-soft text-warning",
  },
  {
    id: "gl-posting",
    screenNumber: 12,
    title: "GL Posting & Payroll Handover",
    category: "Approvals & Posting",
    description:
      "Post approved incentive batches to General Ledger expense accounts and export payment batches to bank file formats and payroll.",
    icon: Send,
    tone: "bg-warning-soft text-warning",
  },
  {
    id: "statement-slip",
    screenNumber: 13,
    title: "Participant Incentive Statement (Pay Slip)",
    category: "Settlements & Statements",
    description:
      "Generate individual monthly incentive payslips with detailed breakdown of jobs, slabs, deductions, and tax withholding.",
    icon: Receipt,
    tone: "bg-info-soft text-info",
  },
  {
    id: "dispute-query",
    screenNumber: 14,
    title: "Dispute & Query Resolution Log",
    category: "Settlements & Statements",
    description:
      "Log technician queries, calculation disputes, missing job sheets, and track investigation status and credit notes.",
    icon: HelpCircle,
    tone: "bg-info-soft text-info",
  },
  {
    id: "scheme-analytics",
    screenNumber: 15,
    title: "Scheme Performance & Payout Analytics",
    category: "Monitoring & Risk",
    description:
      "Analyze incentive ROI, cost-to-revenue ratios, technician distribution across achievement slabs, and year-over-year payout trends.",
    icon: BarChart3,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "incentive-dashboard",
    screenNumber: 16,
    title: "Incentive Dashboard",
    category: "Monitoring & Risk",
    description:
      "High-level operational dashboard displaying active period status, turnover achievements, top earners, and aging penalty exposures.",
    icon: Trophy,
    tone: "bg-success-soft text-success",
  },
  {
    id: "clawback-register",
    screenNumber: 17,
    title: "Commission Clawback & Penalty Register",
    category: "Monitoring & Risk",
    description:
      "Track customer overdue invoices (>45 days), cancelled service jobs, repeated customer complaints, and calculate penalty deductions.",
    icon: ShieldAlert,
    tone: "bg-destructive-soft text-destructive",
  },
  {
    id: "audit-trail",
    screenNumber: 18,
    title: "Audit Trail & Scheme Revision History",
    category: "Monitoring & Risk",
    description:
      "Comprehensive chronological audit log of all scheme modifications, target revisions, run recalculations, and approval actions.",
    icon: History,
    tone: "bg-muted text-foreground",
  },
  {
    id: "system-parameters",
    screenNumber: 19,
    title: "System Parameters & Cut-off Policy",
    category: "Master Data",
    description:
      "Define global payroll cut-off dates, default grace periods, aging threshold settings, and automated recalculation triggers.",
    icon: Settings2,
    tone: "bg-primary/10 text-primary",
  },
];
