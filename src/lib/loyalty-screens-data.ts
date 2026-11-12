import {
  Users,
  Tag,
  Settings,
  FileText,
  FileCheck2,
  CreditCard,
  History,
  SlidersHorizontal,
  UploadCloud,
  LayoutDashboard,
  Globe,
  MonitorCheck,
  type LucideIcon,
} from "lucide-react";

export type LoyaltyCategory =
  | "All"
  | "Master Data & Setup"
  | "Sales & Point Earning"
  | "Redemption & Adjustments"
  | "Audit & Historical"
  | "Portals & Service Integration";

export interface LoyaltyScreenItem {
  id: string; // e.g. "LOY-SCR-01"
  screenNumber: number;
  screenCode: string;
  title: string;
  category: LoyaltyCategory;
  description: string;
  icon: LucideIcon;
  tone: string;
  badge: string;
  platform: string;
}

export const LOYALTY_SCREENS: LoyaltyScreenItem[] = [
  {
    id: "LOY-SCR-01",
    screenNumber: 1,
    screenCode: "LOY-SCR-01",
    title: "Customer Master – Loyalty Fields and Tab",
    category: "Master Data & Setup",
    description:
      "Loyalty eligibility, minimum redemption limit, and live balance displayed next to account balance on the Business Partner master.",
    icon: Users,
    tone: "bg-primary-soft text-primary",
    badge: "BP Master",
    platform: "SAP B1 Client",
  },
  {
    id: "LOY-SCR-02",
    screenNumber: 2,
    screenCode: "LOY-SCR-02",
    title: "Loyalty Points Price List",
    category: "Master Data & Setup",
    description:
      "Points per unit held in dedicated SAP B1 price list 'Loyalty Points' with capacity x 2.5 formula and version approval controls.",
    icon: Tag,
    tone: "bg-primary-soft text-primary",
    badge: "Price List",
    platform: "SAP B1 Client",
  },
  {
    id: "LOY-SCR-03",
    screenNumber: 3,
    screenCode: "LOY-SCR-03",
    title: "Loyalty Settings",
    category: "Master Data & Setup",
    description:
      "Company-level loyalty rules: conversion rate (LKR 1.00/pt), eligible groups, rounding, redemption G/L, and SLFRS 15 liability accounting.",
    icon: Settings,
    tone: "bg-primary-soft text-primary",
    badge: "UDT Settings",
    platform: "B1 Add-on Form",
  },
  {
    id: "LOY-SCR-04",
    screenNumber: 4,
    screenCode: "LOY-SCR-04",
    title: "A/R Invoice – Loyalty Points",
    category: "Sales & Point Earning",
    description:
      "Automatic points calculation on invoice adding: invoiced quantity x unit points, showing balance before and balance after.",
    icon: FileText,
    tone: "bg-success-soft text-success",
    badge: "A/R Invoice",
    platform: "SAP B1 Client",
  },
  {
    id: "LOY-SCR-05",
    screenNumber: 5,
    screenCode: "LOY-SCR-05",
    title: "A/R Credit Memo – Loyalty Deduction",
    category: "Sales & Point Earning",
    description:
      "Deducts points for credited items at the points per unit originally earned on the base invoice line with anti-negative balance guards.",
    icon: FileCheck2,
    tone: "bg-warning-soft text-warning",
    badge: "A/R Credit Memo",
    platform: "SAP B1 Client",
  },
  {
    id: "LOY-SCR-06",
    screenNumber: 6,
    screenCode: "LOY-SCR-06",
    title: "Loyalty Redemption",
    category: "Redemption & Adjustments",
    description:
      "Redeem points into value A/R Credit Memos applied strictly against open invoices. Zero cash payout; excluded from sales incentives.",
    icon: CreditCard,
    tone: "bg-primary-soft text-primary",
    badge: "Redemption UDO",
    platform: "B1 Add-on Form",
  },
  {
    id: "LOY-SCR-07",
    screenNumber: 7,
    screenCode: "LOY-SCR-07",
    title: "Customer Loyalty Ledger (History)",
    category: "Audit & Historical",
    description:
      "Complete, immutable loyalty audit trail with running balances, drill-down to source invoices, and point-in-time inquiries.",
    icon: History,
    tone: "bg-info-soft text-info",
    badge: "Ledger UDO",
    platform: "B1 Add-on Form",
  },
  {
    id: "LOY-SCR-08",
    screenNumber: 8,
    screenCode: "LOY-SCR-08",
    title: "Loyalty Manual Adjustment",
    category: "Redemption & Adjustments",
    description:
      "Authorized manual corrections (+/- points) with business justification, file attachments, and multi-level approval workflow.",
    icon: SlidersHorizontal,
    tone: "bg-warning-soft text-warning",
    badge: "Adjustment UDO",
    platform: "B1 Add-on Form",
  },
  {
    id: "LOY-SCR-09",
    screenNumber: 9,
    screenCode: "LOY-SCR-09",
    title: "Opening Balance Import",
    category: "Master Data & Setup",
    description:
      "Batch load cut-over opening balances from legacy spreadsheets with row validation, eligibility check, and Finance sign-off.",
    icon: UploadCloud,
    tone: "bg-info-soft text-info",
    badge: "Batch Import",
    platform: "B1 Add-on Form",
  },
  {
    id: "LOY-SCR-10",
    screenNumber: 10,
    screenCode: "LOY-SCR-10",
    title: "Loyalty Dashboard",
    category: "Master Data & Setup",
    description:
      "High-level executive metrics: outstanding liability in LKR, points issued/redeemed velocity, top dealers, and redemption readiness.",
    icon: LayoutDashboard,
    tone: "bg-primary-soft text-primary",
    badge: "Executive KPI",
    platform: "B1 Add-on Form",
  },
  {
    id: "LOY-SCR-11",
    screenNumber: 11,
    screenCode: "LOY-SCR-11",
    title: "Portal – My Loyalty Points",
    category: "Portals & Service Integration",
    description:
      "Dealer self-service view in Dealer Portal: points balance, value, minimum threshold status, statement, and draft redemption request.",
    icon: Globe,
    tone: "bg-success-soft text-success",
    badge: "Dealer Portal",
    platform: "Franchise Portal",
  },
  {
    id: "LOY-SCR-12",
    screenNumber: 12,
    screenCode: "LOY-SCR-12",
    title: "Service Manager – Customer Loyalty Panel",
    category: "Portals & Service Integration",
    description:
      "Option 01: Read-only live loyalty panel embedded in Service Manager customer view and commercial panels refreshed via integration.",
    icon: MonitorCheck,
    tone: "bg-info-soft text-info",
    badge: "Service Manager O1",
    platform: "SM Browser",
  },
];
