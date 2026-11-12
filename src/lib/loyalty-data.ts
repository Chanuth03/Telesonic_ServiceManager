/**
 * Telesonic Lanka - Customer Loyalty Points Management
 * Requirement Specification Data Models & Worked Example Mock Database
 * Reference: TSL-LOY-DRS
 */

export interface DealerLoyaltyMaster {
  customerCode: string;
  customerName: string;
  customerGroup: "Dealer" | "Franchise" | "Direct Corporate";
  division: "RLC" | "MHA" | "CAC";
  accountBalanceLKR: number;
  loyaltyBalance: number;
  loyaltyValueLKR: number;
  loyaltyEligible: boolean;
  eligibleFrom: string;
  minimumPointsForRedemption: number;
  loyaltyStatus: "Active" | "Suspended" | "Closed";
  lastEarnedDate: string;
  lastRedeemedDate: string;
}

export type LoyaltyEntryType =
  | "Opening"
  | "Earn"
  | "Deduct"
  | "Redeem"
  | "Reverse"
  | "Adjust"
  | "Expire";

export interface LoyaltyLedgerEntry {
  entryNo: string;
  customerCode: string;
  customerName: string;
  date: string;
  period: string;
  entryType: LoyaltyEntryType;
  docType: "A/R Invoice" | "A/R Credit Memo" | "Redemption" | "Manual Adjustment" | "Migration Batch" | "Reversal";
  docNo: string;
  baseDoc?: string;
  itemCode?: string;
  description?: string;
  quantity?: number;
  pointsPerUnit?: number;
  points: number; // signed value
  runningBalance: number;
  conversionRate?: number;
  valueLKR?: number;
  reason?: string;
  createdBy: string;
  approvedBy?: string;
  reversedByEntry?: string;
}

export interface RedemptionRecord {
  redemptionNo: string;
  customerCode: string;
  customerName: string;
  requestDate: string;
  pointsToRedeem: number;
  conversionRate: number;
  redemptionValueLKR: number;
  balanceAvailableBefore: number;
  balanceAfter: number;
  status: "Draft" | "Submitted" | "Approved" | "Posted" | "Cancelled";
  creditMemoDocNo?: string;
  invoicesToSettle: {
    invoiceNo: string;
    invoiceDate: string;
    openBalanceLKR: number;
    appliedLKR: number;
  }[];
  approvals: {
    role: string;
    approver: string;
    decision: "Pending" | "Approved" | "Rejected";
    date?: string;
  }[];
  loyaltyLedgerRef?: string;
  excludeFromIncentive: boolean; // Must always be true per TSL-INC-DRS
}

export interface LoyaltyPriceListItem {
  itemCode: string;
  description: string;
  division: "RLC" | "MHA" | "CAC";
  capacityAttribute: string;
  rateFormula: string;
  pointsPerUnit: number;
  effectiveFrom: string;
  status: "Active" | "Superseded" | "Draft";
  version: string;
  approver: string;
}

export interface LoyaltyManualAdjustment {
  adjustmentNo: string;
  customerCode: string;
  customerName: string;
  date: string;
  type: "Addition" | "Deduction";
  points: number;
  reason: string;
  referenceDoc: string;
  remarks: string;
  attachmentName?: string;
  status: "Draft" | "Submitted" | "Approved" | "Posted" | "Rejected";
  approvers: {
    step: number;
    role: string;
    approver: string;
    decision: "Pending" | "Approved" | "Rejected";
    date?: string;
  }[];
}

export interface LoyaltySettingsConfig {
  conversionRateLKR: number; // default 1.00 LKR
  effectiveFrom: string;
  rounding: "Whole points (round down)" | "Standard rounding";
  defaultEligibleGroups: string[];
  redemptionDocumentType: string;
  redemptionGLAccount: string;
  pointsExpiryPolicy: "None (Initially)" | "12 Months Rolling" | "Calendar Year End";
  liabilityAccountingMethod: "Accrue liability at issue (SLFRS 15)" | "Expense on redemption only";
}

// Global System Settings per LOY-SCR-03
export const INITIAL_LOYALTY_SETTINGS: LoyaltySettingsConfig = {
  conversionRateLKR: 1.0,
  effectiveFrom: "2026-04-01",
  rounding: "Whole points (round down)",
  defaultEligibleGroups: ["Dealer"],
  redemptionDocumentType: "A/R Credit Memo (value, no stock)",
  redemptionGLAccount: "LOY-REDEEM / 415900 Customer Loyalty Redemption",
  pointsExpiryPolicy: "None (Initially)",
  liabilityAccountingMethod: "Accrue liability at issue (SLFRS 15)",
};

// Initial Price List items per LOY-SCR-02
export const INITIAL_PRICE_LIST: LoyaltyPriceListItem[] = [
  {
    itemCode: "RLC-FS-09K",
    description: "Fixed Speed 9,000 BTU Inverter AC",
    division: "RLC",
    capacityAttribute: "9,000 BTU",
    rateFormula: "Capacity × 2.5",
    pointsPerUnit: 225,
    effectiveFrom: "2026-04-01",
    status: "Active",
    version: "v2.0",
    approver: "HOD Sales (M. Perera)",
  },
  {
    itemCode: "RLC-IN-12K",
    description: "Inverter 12,000 BTU Wall-mount AC",
    division: "RLC",
    capacityAttribute: "12,000 BTU",
    rateFormula: "Capacity × 2.5",
    pointsPerUnit: 300,
    effectiveFrom: "2026-04-01",
    status: "Active",
    version: "v2.0",
    approver: "HOD Sales (M. Perera)",
  },
  {
    itemCode: "RLC-IN-24K",
    description: "Inverter 24,000 BTU Dual-inverter AC",
    division: "RLC",
    capacityAttribute: "24,000 BTU",
    rateFormula: "Capacity × 2.5",
    pointsPerUnit: 600,
    effectiveFrom: "2026-04-01",
    status: "Active",
    version: "v2.0",
    approver: "HOD Sales (M. Perera)",
  },
  {
    itemCode: "MA100W110",
    description: "Top Loading Washing Machine 10kg",
    division: "MHA",
    capacityAttribute: "10 kg",
    rateFormula: "Fixed Item Rate",
    pointsPerUnit: 150,
    effectiveFrom: "2026-04-01",
    status: "Active",
    version: "v2.0",
    approver: "HOD MHA (K. Silva)",
  },
  {
    itemCode: "MHA-REF-350L",
    description: "Frost-Free Double Door Refrigerator 350L",
    division: "MHA",
    capacityAttribute: "350 L",
    rateFormula: "Fixed Item Rate",
    pointsPerUnit: 200,
    effectiveFrom: "2026-04-01",
    status: "Active",
    version: "v2.0",
    approver: "HOD MHA (K. Silva)",
  },
  {
    itemCode: "CAC-PKG-48K",
    description: "Commercial Package Air Conditioner 48,000 BTU",
    division: "CAC",
    capacityAttribute: "48,000 BTU",
    rateFormula: "Capacity × 2.0",
    pointsPerUnit: 960,
    effectiveFrom: "2026-04-01",
    status: "Active",
    version: "v1.5",
    approver: "HOD Commercial (A. Jayasinghe)",
  },
];

// Initial Dealer Masters matching DRS worked examples (Section 5 & 10)
export const INITIAL_DEALERS: DealerLoyaltyMaster[] = [
  {
    customerCode: "D-0412",
    customerName: "Negombo Cool Centre",
    customerGroup: "Dealer",
    division: "RLC",
    accountBalanceLKR: 1284500.0,
    loyaltyBalance: 8500,
    loyaltyValueLKR: 8500.0,
    loyaltyEligible: true,
    eligibleFrom: "2026-04-01",
    minimumPointsForRedemption: 5000,
    loyaltyStatus: "Active",
    lastEarnedDate: "2026-04-12",
    lastRedeemedDate: "2026-04-29",
  },
  {
    customerCode: "D-0301",
    customerName: "Kandy Air Solutions",
    customerGroup: "Dealer",
    division: "RLC",
    accountBalanceLKR: 842100.0,
    loyaltyBalance: 13050,
    loyaltyValueLKR: 13050.0,
    loyaltyEligible: true,
    eligibleFrom: "2026-04-01",
    minimumPointsForRedemption: 5000,
    loyaltyStatus: "Active",
    lastEarnedDate: "2026-04-28",
    lastRedeemedDate: "2026-03-15",
  },
  {
    customerCode: "D-0620",
    customerName: "Matara Cooling Systems",
    customerGroup: "Dealer",
    division: "MHA",
    accountBalanceLKR: 415000.0,
    loyaltyBalance: 3150,
    loyaltyValueLKR: 3150.0,
    loyaltyEligible: true,
    eligibleFrom: "2026-04-01",
    minimumPointsForRedemption: 5000,
    loyaltyStatus: "Active",
    lastEarnedDate: "2026-04-18",
    lastRedeemedDate: "—",
  },
  {
    customerCode: "D-0118",
    customerName: "Galle Electro Haven",
    customerGroup: "Dealer",
    division: "RLC",
    accountBalanceLKR: 1690000.0,
    loyaltyBalance: 18400,
    loyaltyValueLKR: 18400.0,
    loyaltyEligible: true,
    eligibleFrom: "2026-01-15",
    minimumPointsForRedemption: 5000,
    loyaltyStatus: "Active",
    lastEarnedDate: "2026-05-02",
    lastRedeemedDate: "2026-04-10",
  },
  {
    customerCode: "D-0789",
    customerName: "Kurunegala Refrigeration Mart",
    customerGroup: "Dealer",
    division: "MHA",
    accountBalanceLKR: 520000.0,
    loyaltyBalance: 4200,
    loyaltyValueLKR: 4200.0,
    loyaltyEligible: true,
    eligibleFrom: "2026-02-01",
    minimumPointsForRedemption: 5000,
    loyaltyStatus: "Active",
    lastEarnedDate: "2026-04-22",
    lastRedeemedDate: "—",
  },
  {
    customerCode: "D-0555",
    customerName: "Jaffna Home Electronics",
    customerGroup: "Dealer",
    division: "RLC",
    accountBalanceLKR: 920000.0,
    loyaltyBalance: 0,
    loyaltyValueLKR: 0.0,
    loyaltyEligible: false,
    eligibleFrom: "—",
    minimumPointsForRedemption: 5000,
    loyaltyStatus: "Suspended",
    lastEarnedDate: "—",
    lastRedeemedDate: "—",
  },
];

// Initial Ledger entries precisely following Section 5 (Worked Example) & Section 6
export const INITIAL_LEDGER_ENTRIES: LoyaltyLedgerEntry[] = [
  {
    entryNo: "LL-2026-00401",
    customerCode: "D-0412",
    customerName: "Negombo Cool Centre",
    date: "2026-04-01",
    period: "2026-04",
    entryType: "Opening",
    docType: "Migration Batch",
    docNo: "OB-0001",
    points: 5200,
    runningBalance: 5200,
    reason: "Cut-over opening balance as of 31-Mar-2026",
    createdBy: "Finance (M. Jayasinghe)",
    approvedBy: "Head of Finance",
  },
  {
    entryNo: "LL-2026-00411",
    customerCode: "D-0412",
    customerName: "Negombo Cool Centre",
    date: "2026-04-12",
    period: "2026-04",
    entryType: "Earn",
    docType: "A/R Invoice",
    docNo: "INV-26-11210",
    itemCode: "RLC-FS-09K / RLC-IN-12K",
    description: "10 x 9,000 BTU (225 pts) + 5 x 12,000 BTU (300 pts)",
    quantity: 15,
    points: 3750,
    runningBalance: 8950,
    conversionRate: 1.0,
    createdBy: "Sales Coordinator (K. Perera)",
  },
  {
    entryNo: "LL-2026-00452",
    customerCode: "D-0412",
    customerName: "Negombo Cool Centre",
    date: "2026-04-20",
    period: "2026-04",
    entryType: "Deduct",
    docType: "A/R Credit Memo",
    docNo: "CM-26-00812",
    baseDoc: "INV-26-11210",
    itemCode: "RLC-FS-09K",
    description: "2 x 9,000 BTU unit returned (original 225 pts/unit)",
    quantity: 2,
    pointsPerUnit: 225,
    points: -450,
    runningBalance: 8500,
    createdBy: "Sales Coordinator (K. Perera)",
  },
  {
    entryNo: "LL-2026-00501",
    customerCode: "D-0412",
    customerName: "Negombo Cool Centre",
    date: "2026-04-29",
    period: "2026-04",
    entryType: "Redeem",
    docType: "Redemption",
    docNo: "LR-2026-0019",
    baseDoc: "CM-26-00901",
    points: -5000,
    runningBalance: 3500,
    conversionRate: 1.0,
    valueLKR: 5000.0,
    reason: "Redemption against open invoice INV-26-11488",
    createdBy: "Sales Coordinator (K. Perera)",
    approvedBy: "Finance (M. Jayasinghe)",
  },
  {
    entryNo: "LL-2026-00508",
    customerCode: "D-0412",
    customerName: "Negombo Cool Centre",
    date: "2026-04-30",
    period: "2026-04",
    entryType: "Reverse",
    docType: "Reversal",
    docNo: "CM-26-00901-C",
    baseDoc: "LR-2026-0019",
    points: 5000,
    runningBalance: 8500,
    reason: "Redemption credit memo cancelled; points fully restored",
    createdBy: "Finance (M. Jayasinghe)",
    reversedByEntry: "LL-2026-00501",
  },
  // Kandy Air Solutions
  {
    entryNo: "LL-2026-00602",
    customerCode: "D-0301",
    customerName: "Kandy Air Solutions",
    date: "2026-04-01",
    period: "2026-04",
    entryType: "Opening",
    docType: "Migration Batch",
    docNo: "OB-0001",
    points: 12450,
    runningBalance: 12450,
    reason: "Cut-over opening balance as of 31-Mar-2026",
    createdBy: "Finance (M. Jayasinghe)",
    approvedBy: "Head of Finance",
  },
  {
    entryNo: "LL-2026-00645",
    customerCode: "D-0301",
    customerName: "Kandy Air Solutions",
    date: "2026-04-28",
    period: "2026-04",
    entryType: "Earn",
    docType: "A/R Invoice",
    docNo: "INV-26-11604",
    itemCode: "RLC-IN-24K",
    description: "1 x 24,000 BTU Dual Inverter (600 pts)",
    quantity: 1,
    points: 600,
    runningBalance: 13050,
    conversionRate: 1.0,
    createdBy: "Sales Coordinator (T. Aloka)",
  },
  // Matara Cooling
  {
    entryNo: "LL-2026-00712",
    customerCode: "D-0620",
    customerName: "Matara Cooling Systems",
    date: "2026-04-01",
    period: "2026-04",
    entryType: "Opening",
    docType: "Migration Batch",
    docNo: "OB-0001",
    points: 2400,
    runningBalance: 2400,
    reason: "Opening balance migration",
    createdBy: "Finance (M. Jayasinghe)",
  },
  {
    entryNo: "LL-2026-00788",
    customerCode: "D-0620",
    customerName: "Matara Cooling Systems",
    date: "2026-04-18",
    period: "2026-04",
    entryType: "Earn",
    docType: "A/R Invoice",
    docNo: "INV-26-11390",
    itemCode: "MA100W110",
    description: "5 x Washing Machine 10kg (150 pts/unit)",
    quantity: 5,
    points: 750,
    runningBalance: 3150,
    conversionRate: 1.0,
    createdBy: "Sales Coordinator (K. Perera)",
  },
];

// Initial Redemptions per LOY-SCR-06
export const INITIAL_REDEMPTIONS: RedemptionRecord[] = [
  {
    redemptionNo: "LR-2026-0019",
    customerCode: "D-0412",
    customerName: "Negombo Cool Centre",
    requestDate: "2026-04-29",
    pointsToRedeem: 5000,
    conversionRate: 1.0,
    redemptionValueLKR: 5000.0,
    balanceAvailableBefore: 8500,
    balanceAfter: 3500,
    status: "Cancelled",
    creditMemoDocNo: "CM-26-00901",
    invoicesToSettle: [
      {
        invoiceNo: "INV-26-11488",
        invoiceDate: "2026-04-28",
        openBalanceLKR: 412300.0,
        appliedLKR: 5000.0,
      },
    ],
    approvals: [
      { role: "Finance Officer", approver: "M. Jayasinghe", decision: "Approved", date: "2026-04-29" },
      { role: "HOD Sales", approver: "T. Aloka", decision: "Approved", date: "2026-04-29" },
    ],
    loyaltyLedgerRef: "LL-2026-00501",
    excludeFromIncentive: true,
  },
  {
    redemptionNo: "LR-2026-0024",
    customerCode: "D-0301",
    customerName: "Kandy Air Solutions",
    requestDate: "2026-05-03",
    pointsToRedeem: 6000,
    conversionRate: 1.0,
    redemptionValueLKR: 6000.0,
    balanceAvailableBefore: 13050,
    balanceAfter: 7050,
    status: "Approved",
    creditMemoDocNo: "CM-26-00945",
    invoicesToSettle: [
      {
        invoiceNo: "INV-26-11520",
        invoiceDate: "2026-05-01",
        openBalanceLKR: 320000.0,
        appliedLKR: 6000.0,
      },
    ],
    approvals: [
      { role: "Finance Officer", approver: "M. Jayasinghe", decision: "Approved", date: "2026-05-03" },
    ],
    loyaltyLedgerRef: "LL-2026-00810",
    excludeFromIncentive: true,
  },
  {
    redemptionNo: "LR-2026-0028",
    customerCode: "D-0118",
    customerName: "Galle Electro Haven",
    requestDate: "2026-05-10",
    pointsToRedeem: 8000,
    conversionRate: 1.0,
    redemptionValueLKR: 8000.0,
    balanceAvailableBefore: 18400,
    balanceAfter: 10400,
    status: "Submitted",
    invoicesToSettle: [
      {
        invoiceNo: "INV-26-11802",
        invoiceDate: "2026-05-08",
        openBalanceLKR: 580000.0,
        appliedLKR: 8000.0,
      },
    ],
    approvals: [
      { role: "Finance Officer", approver: "Pending Assignment", decision: "Pending" },
    ],
    excludeFromIncentive: true,
  },
];

// Initial Manual Adjustments per LOY-SCR-08
export const INITIAL_ADJUSTMENTS: LoyaltyManualAdjustment[] = [
  {
    adjustmentNo: "LA-2026-0007",
    customerCode: "D-0301",
    customerName: "Kandy Air Solutions",
    date: "2026-05-03",
    type: "Addition",
    points: 600,
    reason: "Missed on invoice (retroactive eligibility date)",
    referenceDoc: "INV-26-10977",
    remarks: "Eligible from 01-Apr; invoice was issued on 02-Apr before master update.",
    attachmentName: "tax_invoice_10977_signed.pdf",
    status: "Submitted",
    approvers: [
      { step: 1, role: "HOD Sales", approver: "T. Aloka", decision: "Approved", date: "2026-05-03" },
      { step: 2, role: "Finance", approver: "M. Jayasinghe", decision: "Pending" },
    ],
  },
  {
    adjustmentNo: "LA-2026-0005",
    customerCode: "D-0620",
    customerName: "Matara Cooling Systems",
    date: "2026-04-10",
    type: "Deduction",
    points: 150,
    reason: "Damaged warranty replacement reversal discrepancy",
    referenceDoc: "SR-2026-4412",
    remarks: "Adjusted after audit inspection.",
    attachmentName: "inspection_report_4412.pdf",
    status: "Posted",
    approvers: [
      { step: 1, role: "HOD Sales", approver: "T. Aloka", decision: "Approved", date: "2026-04-10" },
      { step: 2, role: "Finance", approver: "M. Jayasinghe", decision: "Approved", date: "2026-04-10" },
    ],
  },
];

const LOCAL_STORAGE_KEY = "telesonic_loyalty_data_v1";

export interface StoredLoyaltyState {
  dealers: DealerLoyaltyMaster[];
  ledger: LoyaltyLedgerEntry[];
  redemptions: RedemptionRecord[];
  adjustments: LoyaltyManualAdjustment[];
  priceList: LoyaltyPriceListItem[];
  settings: LoyaltySettingsConfig;
}

export function loadLoyaltyState(): StoredLoyaltyState {
  if (typeof window === "undefined") {
    return {
      dealers: INITIAL_DEALERS,
      ledger: INITIAL_LEDGER_ENTRIES,
      redemptions: INITIAL_REDEMPTIONS,
      adjustments: INITIAL_ADJUSTMENTS,
      priceList: INITIAL_PRICE_LIST,
      settings: INITIAL_LOYALTY_SETTINGS,
    };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial: StoredLoyaltyState = {
        dealers: INITIAL_DEALERS,
        ledger: INITIAL_LEDGER_ENTRIES,
        redemptions: INITIAL_REDEMPTIONS,
        adjustments: INITIAL_ADJUSTMENTS,
        priceList: INITIAL_PRICE_LIST,
        settings: INITIAL_LOYALTY_SETTINGS,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load loyalty state from localStorage", e);
    return {
      dealers: INITIAL_DEALERS,
      ledger: INITIAL_LEDGER_ENTRIES,
      redemptions: INITIAL_REDEMPTIONS,
      adjustments: INITIAL_ADJUSTMENTS,
      priceList: INITIAL_PRICE_LIST,
      settings: INITIAL_LOYALTY_SETTINGS,
    };
  }
}

export function saveLoyaltyState(state: StoredLoyaltyState): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }
}
