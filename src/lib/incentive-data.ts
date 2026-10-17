export interface IncentiveParticipant {
  id: string;
  participantCode: string;
  displayName: string;
  role: string;
  division: string;
  period: string;
  volumePct: number;
  turnoverPct: number;
  projectedCommission: number;
  invoicesOver45Days: number;
  penaltyExposure: number;
  baseTarget: number;
  actualAchievement: number;
  attendanceFactor: number;
}

export interface IncentiveFilterState {
  period: string;
  division: string;
  participant: string;
}

export interface PenaltyRiskInvoice {
  id: string;
  invoiceNumber: string;
  participantCode: string;
  participantName: string;
  customerName: string;
  dueDate: string;
  agingDays: number;
  invoiceAmount: number;
  penaltyExposure: number;
  severity: "Critical" | "High" | "Medium" | "Low";
}

export interface CalculationRunLog {
  runId: string;
  timestamp: string;
  period: string;
  division: string;
  triggeredBy: string;
  recordsProcessed: number;
  duration: string;
  status: "Completed" | "In Progress" | "Failed";
}

export const AVAILABLE_PERIODS = [
  "May 2026",
  "April 2026",
  "March 2026",
  "February 2026",
  "January 2026",
  "December 2025",
];

export const AVAILABLE_DIVISIONS = [
  "All Divisions",
  "Consumer Electronics",
  "Biomedical Engineering",
  "Telecommunications & Networks",
  "Enterprise IT Solutions",
  "Industrial Automation",
  "Power Systems & Generators",
];

export const INITIAL_PARTICIPANTS: IncentiveParticipant[] = [
  {
    id: "p-1",
    participantCode: "TECH-101",
    displayName: "Ruwan Jayasinghe",
    role: "Senior Field Engineer",
    division: "Consumer Electronics",
    period: "May 2026",
    volumePct: 114,
    turnoverPct: 98,
    projectedCommission: 148500,
    invoicesOver45Days: 0,
    penaltyExposure: 0,
    baseTarget: 850000,
    actualAchievement: 969000,
    attendanceFactor: 1.0,
  },
  {
    id: "p-2",
    participantCode: "TECH-102",
    displayName: "Dinesh Bandara",
    role: "Biomedical Specialist",
    division: "Biomedical Engineering",
    period: "May 2026",
    volumePct: 106,
    turnoverPct: 104,
    projectedCommission: 192000,
    invoicesOver45Days: 2,
    penaltyExposure: 24500,
    baseTarget: 1400000,
    actualAchievement: 1484000,
    attendanceFactor: 1.0,
  },
  {
    id: "p-3",
    participantCode: "TECH-103",
    displayName: "Kasun Wijesinghe",
    role: "Network Technician",
    division: "Telecommunications & Networks",
    period: "May 2026",
    volumePct: 92,
    turnoverPct: 88,
    projectedCommission: 88000,
    invoicesOver45Days: 0,
    penaltyExposure: 0,
    baseTarget: 600000,
    actualAchievement: 552000,
    attendanceFactor: 1.0,
  },
  {
    id: "p-4",
    participantCode: "TECH-104",
    displayName: "Anura Senanayake",
    role: "IT Solutions Architect",
    division: "Enterprise IT Solutions",
    period: "May 2026",
    volumePct: 122,
    turnoverPct: 118,
    projectedCommission: 245000,
    invoicesOver45Days: 1,
    penaltyExposure: 18000,
    baseTarget: 2200000,
    actualAchievement: 2684000,
    attendanceFactor: 1.0,
  },
  {
    id: "p-5",
    participantCode: "TECH-105",
    displayName: "Pradeep Kumara",
    role: "Industrial Automation Tech",
    division: "Industrial Automation",
    period: "May 2026",
    volumePct: 78,
    turnoverPct: 74,
    projectedCommission: 52000,
    invoicesOver45Days: 3,
    penaltyExposure: 31200,
    baseTarget: 950000,
    actualAchievement: 741000,
    attendanceFactor: 0.9,
  },
  {
    id: "p-6",
    participantCode: "TECH-106",
    displayName: "Nimal Perera",
    role: "Power Systems Technician",
    division: "Power Systems & Generators",
    period: "May 2026",
    volumePct: 102,
    turnoverPct: 95,
    projectedCommission: 112000,
    invoicesOver45Days: 0,
    penaltyExposure: 0,
    baseTarget: 750000,
    actualAchievement: 765000,
    attendanceFactor: 1.0,
  },
  {
    id: "p-7",
    participantCode: "TECH-107",
    displayName: "Chaminda Silva",
    role: "Consumer AV Technician",
    division: "Consumer Electronics",
    period: "May 2026",
    volumePct: 88,
    turnoverPct: 82,
    projectedCommission: 64000,
    invoicesOver45Days: 1,
    penaltyExposure: 9500,
    baseTarget: 700000,
    actualAchievement: 616000,
    attendanceFactor: 1.0,
  },
];

export const INITIAL_PENALTY_INVOICES: PenaltyRiskInvoice[] = [
  {
    id: "inv-01",
    invoiceNumber: "INV-2026-0842",
    participantCode: "TECH-102",
    participantName: "Dinesh Bandara",
    customerName: "Asiri Central Hospital PLC",
    dueDate: "28-Feb-2026",
    agingDays: 76,
    invoiceAmount: 245000,
    penaltyExposure: 14700,
    severity: "Critical",
  },
  {
    id: "inv-02",
    invoiceNumber: "INV-2026-0911",
    participantCode: "TECH-102",
    participantName: "Dinesh Bandara",
    customerName: "Lanka Hospitals Corp",
    dueDate: "15-Mar-2026",
    agingDays: 61,
    invoiceAmount: 164000,
    penaltyExposure: 9800,
    severity: "High",
  },
  {
    id: "inv-03",
    invoiceNumber: "INV-2026-1044",
    participantCode: "TECH-104",
    participantName: "Anura Senanayake",
    customerName: "Dialog Axiata Corporate HQ",
    dueDate: "20-Mar-2026",
    agingDays: 56,
    invoiceAmount: 360000,
    penaltyExposure: 18000,
    severity: "High",
  },
  {
    id: "inv-04",
    invoiceNumber: "INV-2026-0775",
    participantCode: "TECH-105",
    participantName: "Pradeep Kumara",
    customerName: "Ceylon Tobacco Co. Kandy",
    dueDate: "10-Feb-2026",
    agingDays: 94,
    invoiceAmount: 312000,
    penaltyExposure: 18720,
    severity: "Critical",
  },
  {
    id: "inv-05",
    invoiceNumber: "INV-2026-0889",
    participantCode: "TECH-105",
    participantName: "Pradeep Kumara",
    customerName: "Nestle Lanka Pannala",
    dueDate: "22-Mar-2026",
    agingDays: 54,
    invoiceAmount: 208000,
    penaltyExposure: 12480,
    severity: "High",
  },
  {
    id: "inv-06",
    invoiceNumber: "INV-2026-1102",
    participantCode: "TECH-107",
    participantName: "Chaminda Silva",
    customerName: "Singer Mega Nugegoda",
    dueDate: "25-Mar-2026",
    agingDays: 51,
    invoiceAmount: 158000,
    penaltyExposure: 9500,
    severity: "Medium",
  },
];

export const INITIAL_RUN_LOGS: CalculationRunLog[] = [
  {
    runId: "RUN-2026-05-MTD-04",
    timestamp: "14-May-2026 10:15 IST",
    period: "May 2026",
    division: "All Divisions",
    triggeredBy: "Lakmal Perera (Incentive Administrator)",
    recordsProcessed: 48,
    duration: "3.1s",
    status: "Completed",
  },
  {
    runId: "RUN-2026-05-PRE-03",
    timestamp: "10-May-2026 17:40 IST",
    period: "May 2026",
    division: "Consumer Electronics",
    triggeredBy: "Lakmal Perera (Incentive Administrator)",
    recordsProcessed: 14,
    duration: "1.8s",
    status: "Completed",
  },
  {
    runId: "RUN-2026-04-FIN-01",
    timestamp: "02-May-2026 09:30 IST",
    period: "April 2026",
    division: "All Divisions",
    triggeredBy: "System Scheduled Auto-Run",
    recordsProcessed: 52,
    duration: "4.2s",
    status: "Completed",
  },
  {
    runId: "RUN-2026-04-PRE-02",
    timestamp: "28-Apr-2026 16:15 IST",
    period: "April 2026",
    division: "Biomedical Engineering",
    triggeredBy: "Lakmal Perera (Incentive Administrator)",
    recordsProcessed: 12,
    duration: "1.6s",
    status: "Completed",
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const STORAGE_KEYS = {
  FILTERS: "servio_incentive_filters_v2",
  PARTICIPANTS: "servio_incentive_participants_v2",
};

export const incentiveStorage = {
  getFilters: (): IncentiveFilterState => {
    if (typeof window === "undefined") {
      return { period: "May 2026", division: "All Divisions", participant: "All" };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FILTERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { period: "May 2026", division: "All Divisions", participant: "All" };
  },
  setFilters: (filters: IncentiveFilterState) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
    } catch (e) {
      console.error(e);
    }
  },
  getParticipants: (): IncentiveParticipant[] => {
    if (typeof window === "undefined") return INITIAL_PARTICIPANTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PARTICIPANTS;
  },
  setParticipants: (participants: IncentiveParticipant[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    } catch (e) {
      console.error(e);
    }
  },
};

export function exportIncentiveToExcel(
  participants: IncentiveParticipant[],
  filters: IncentiveFilterState,
) {
  const headers = [
    "Participant Code",
    "Display Name",
    "Role",
    "Division",
    "Period",
    "Volume %",
    "Turnover %",
    "Projected Commission (LKR)",
    "Invoices > 45 Days",
    "Penalty Exposure (LKR)",
  ];

  const rows = participants.map((p) => [
    p.participantCode,
    p.displayName,
    p.role,
    p.division,
    p.period,
    `${p.volumePct}%`,
    `${p.turnoverPct}%`,
    p.projectedCommission,
    p.invoicesOver45Days,
    p.penaltyExposure,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Incentive_Report_${filters.period.replace(/\s+/g, "_")}_${filters.division.replace(/\s+/g, "_")}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportIncentiveToPdf(
  participants: IncentiveParticipant[],
  filters: IncentiveFilterState,
) {
  if (typeof window === "undefined") return;
  window.print();
}
