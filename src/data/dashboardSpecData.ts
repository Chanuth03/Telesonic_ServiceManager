export interface DashboardScreenMeta {
  id: string; // e.g. "O1-SCR-DSH-01"
  code: string; // e.g. "DSH-01"
  name: string;
  module: "Monitoring" | "Integration" | "Reporting";
  group:
    | "Live Monitoring & Operational Pulse"
    | "Executive Management & Financial Performance"
    | "System Integration & Data Governance";
  type: "Dashboard" | "Work queue" | "Viewer" | "Inquiry";
  classification: string;
  priority: "P1" | "P2";
  purpose: string;
  roles: string;
  requirements: string;
  reports: string;
}

export const DASHBOARD_GROUPS = [
  {
    id: "live-monitoring",
    title: "Live Monitoring & Operational Pulse",
    description:
      "Real-time call center pulse, SLA countdowns, hold state analysis, and repeat job detection.",
    screenIds: ["O1-SCR-DSH-01", "O1-SCR-DSH-02", "O1-SCR-DSH-03"],
  },
  {
    id: "executive-management",
    title: "Executive Management & Financial Performance",
    description:
      "High-level department KPIs, revenue/margin targets, and interactive ad-hoc report generation.",
    screenIds: ["O1-SCR-DSH-04", "O1-SCR-DSH-06"],
  },
  {
    id: "integration-governance",
    title: "System Integration & Data Governance",
    description:
      "SAP B1 DI Server sync queue, mobile offline payload logs, and immutable export compliance logs.",
    screenIds: ["O1-SCR-DSH-05", "O1-SCR-DSH-07"],
  },
] as const;

export const DASHBOARD_SCREENS_LIST: DashboardScreenMeta[] = [
  {
    id: "O1-SCR-DSH-01",
    code: "DSH-01",
    name: "Heartbeat & SLA Pulse",
    module: "Monitoring",
    group: "Live Monitoring & Operational Pulse",
    type: "Dashboard",
    classification: "Standard",
    priority: "P1",
    purpose:
      "Real-time operational call center pulse tracking open requests, hourly velocity, overdue tickets, and live SLA timers.",
    roles: "Service Coordinator, Dispatcher, Call Center Supervisor",
    requirements:
      "30-second live refresh, hourly inflow/closure breakdown, SLA countdown timers with warning thresholds.",
    reports: "O1-RPT-01 Service Call Summary Register",
  },
  {
    id: "O1-SCR-DSH-02",
    code: "DSH-02",
    name: "Service Call Hold Monitor",
    module: "Monitoring",
    group: "Live Monitoring & Operational Pulse",
    type: "Work queue",
    classification: "Standard",
    priority: "P1",
    purpose:
      "Dedicated queue tracking all service calls on hold due to parts shortage, customer delay, or technical escalation with aging analysis.",
    roles: "Service Coordinator, Inventory Liaison, Technical Supervisor",
    requirements:
      "Hold reason filtering, expected resume alerts, one-click hold release and customer notification dispatch.",
    reports: "O1-RPT-23 Hold Analysis Report",
  },
  {
    id: "O1-SCR-DSH-03",
    code: "DSH-03",
    name: "Repeat Job Analysis",
    module: "Monitoring",
    group: "Live Monitoring & Operational Pulse",
    type: "Inquiry",
    classification: "Standard",
    priority: "P1",
    purpose:
      "Automated repeat call detector analyzing repeat breakdown frequencies across technicians, equipment models, and rework costs.",
    roles: "Quality Assurance Manager, Service Manager, Technical Trainer",
    requirements:
      "Repeat rate threshold alerting (>10%), technician rework cost rollup in LKR, Poor Workmanship penalty audit.",
    reports: "O1-RPT-18 Repeat Call & Rework Quality Audit",
  },
  {
    id: "O1-SCR-DSH-04",
    code: "DSH-04",
    name: "Management Dashboard",
    module: "Reporting",
    group: "Executive Management & Financial Performance",
    type: "Dashboard",
    classification: "Standard",
    priority: "P1",
    purpose:
      "Executive high-level KPIs including First Time Fix Rate (FTFR), SLA compliance, net service revenue, gross margin %, and CSAT.",
    roles: "Managing Director, Chief Operating Officer, Service Manager",
    requirements:
      "Target vs Actual variance analysis, monthly margin trending, gross revenue tracking in LKR.",
    reports: "O1-RPT-30 Service Department Profitability & Margin Statement",
  },
  {
    id: "O1-SCR-DSH-06",
    code: "DSH-06",
    name: "Report Viewer & Generator",
    module: "Reporting",
    group: "Executive Management & Financial Performance",
    type: "Viewer",
    classification: "Standard",
    priority: "P2",
    purpose:
      "Interactive ad-hoc report generator allowing multi-parameter filtering, instant tabular preview, and Excel/PDF export downloads.",
    roles: "Service Manager, Finance Manager, Branch Supervisors, Auditors",
    requirements:
      "Report parameter selection (Branch, Date range, Category), interactive tabular preview, CSV and PDF export triggers.",
    reports: "All O1-RPT standard suite reports",
  },
  {
    id: "O1-SCR-DSH-05",
    code: "DSH-05",
    name: "Integration Monitor & Error Queue",
    module: "Integration",
    group: "System Integration & Data Governance",
    type: "Work queue",
    classification: "Standard",
    priority: "P1",
    purpose:
      "Operational interface console monitoring SAP Business One DI Server sync queues, Dialog SMS gateway, and Mobile offline sync.",
    roles: "IT Systems Administrator, SAP B1 Technical Consultant, Service Coordinator",
    requirements:
      "Interface error retry queue, attempt counters, manual reprocess triggers, raw XML/JSON payload viewer.",
    reports: "O1-RPT-52 System Integration Exception & Sync Audit Log",
  },
  {
    id: "O1-SCR-DSH-07",
    code: "DSH-07",
    name: "Data Export Log & Audit",
    module: "Integration",
    group: "System Integration & Data Governance",
    type: "Inquiry",
    classification: "Standard",
    priority: "P2",
    purpose:
      "Immutable audit trail logging every user export transaction across the platform for ISO compliance and security governance.",
    roles: "Compliance Officer, Data Protection Officer, Head of IT, Internal Auditor",
    requirements:
      "Non-editable audit entries capturing user, timestamp, report name, format, record count, and applied query filters.",
    reports: "O1-RPT-55 Security & Data Export Compliance Audit",
  },
];

// 1. DSH-01 Heartbeat Pulse Data
export const HEARTBEAT_PULSE_DATA = [
  { time: "08:00", open: 34, newCalls: 6, closed: 2, onHold: 4, overdue: 1 },
  { time: "09:00", open: 38, newCalls: 9, closed: 5, onHold: 5, overdue: 2 },
  { time: "10:00", open: 42, newCalls: 12, closed: 8, onHold: 6, overdue: 2 },
  { time: "11:00", open: 45, newCalls: 8, closed: 11, onHold: 6, overdue: 3 },
  { time: "12:00", open: 43, newCalls: 5, closed: 7, onHold: 7, overdue: 3 },
  { time: "13:00", open: 40, newCalls: 7, closed: 10, onHold: 6, overdue: 2 },
  { time: "14:00", open: 44, newCalls: 11, closed: 9, onHold: 6, overdue: 3 },
  { time: "15:00", open: 42, newCalls: 8, closed: 12, onHold: 6, overdue: 3 },
  { time: "16:00", open: 39, newCalls: 4, closed: 14, onHold: 5, overdue: 2 },
  { time: "17:00", open: 36, newCalls: 3, closed: 11, onHold: 5, overdue: 1 },
];

export const HEARTBEAT_GRID_DATA = [
  { time: "15:00 - 16:00", open: 42, newCalls: 8, closed: 12, onHold: 6, overdue: 3 },
  { time: "14:00 - 15:00", open: 44, newCalls: 11, closed: 9, onHold: 6, overdue: 3 },
  { time: "13:00 - 14:00", open: 40, newCalls: 7, closed: 10, onHold: 6, overdue: 2 },
  { time: "12:00 - 13:00", open: 43, newCalls: 5, closed: 7, onHold: 7, overdue: 3 },
  { time: "11:00 - 12:00", open: 45, newCalls: 8, closed: 11, onHold: 6, overdue: 3 },
  { time: "10:00 - 11:00", open: 42, newCalls: 12, closed: 8, onHold: 6, overdue: 2 },
  { time: "09:00 - 10:00", open: 38, newCalls: 9, closed: 5, onHold: 5, overdue: 2 },
  { time: "08:00 - 09:00", open: 34, newCalls: 6, closed: 2, onHold: 4, overdue: 1 },
];

// 2. DSH-02 Hold Monitor Records
export const HOLD_MONITOR_DATA = [
  {
    callNo: "SC-2026-20511",
    customer: "Wijesinghe Motors Ltd",
    reason: "Poor Workmanship Investigation",
    heldOn: "2026-10-12",
    expectedResume: "2026-10-16",
    age: "3 Days",
    technician: "R. Kumar (Assistant)",
    branch: "Colombo HQ",
  },
  {
    callNo: "SC-2026-20513",
    customer: "Kandy Lake Hotel",
    reason: "Parts Awaited - Special Order",
    heldOn: "2026-10-10",
    expectedResume: "2026-10-22",
    age: "5 Days",
    technician: "S. Bandara (Helper)",
    branch: "Kandy",
  },
  {
    callNo: "SC-2026-20514",
    customer: "Jayasuriya Textiles Ltd",
    reason: "Customer Site Shutdown",
    heldOn: "2026-10-13",
    expectedResume: "2026-10-18",
    age: "2 Days",
    technician: "Lanka Cool Services - M. Nazeer",
    branch: "Jaffna",
  },
  {
    callNo: "SC-2026-20518",
    customer: "Nimal Fernando Engineering",
    reason: "Pending Customer Payment Clearance (BCR-04)",
    heldOn: "2026-10-09",
    expectedResume: "2026-10-17",
    age: "6 Days",
    technician: "A. Perera (Supervisor)",
    branch: "Colombo HQ",
  },
  {
    callNo: "SC-2026-20522",
    customer: "Galle Fort Residencies",
    reason: "Technical Escalation to Daikin Principal",
    heldOn: "2026-10-14",
    expectedResume: "2026-10-20",
    age: "1 Day",
    technician: "K. Silva (Lead)",
    branch: "Galle",
  },
];

// 3. DSH-03 Repeat Job Analysis Records
export const REPEAT_JOB_DATA = [
  {
    dimension: "K. Silva (Lead Technician)",
    calls: 48,
    repeats: 2,
    repeatPct: "4.2%",
    poorService: 0,
    costOfReworkLkr: "28,500.00",
  },
  {
    dimension: "R. Kumar (Assistant Technician)",
    calls: 36,
    repeats: 3,
    repeatPct: "8.3%",
    poorService: 1,
    costOfReworkLkr: "45,500.00",
  },
  {
    dimension: "Lanka Cool Services (Subcontractor)",
    calls: 24,
    repeats: 4,
    repeatPct: "16.7%",
    poorService: 2,
    costOfReworkLkr: "128,750.00",
  },
  {
    dimension: "Daikin VRV-IV 16HP (Equipment Model)",
    calls: 62,
    repeats: 5,
    repeatPct: "8.1%",
    poorService: 0,
    costOfReworkLkr: "88,200.00",
  },
  {
    dimension: "Carrier Inverter 1.5T (Equipment Model)",
    calls: 41,
    repeats: 2,
    repeatPct: "4.9%",
    poorService: 0,
    costOfReworkLkr: "24,000.00",
  },
];

// 4. DSH-04 Management Dashboard Records
export const MANAGEMENT_KPIS = [
  {
    kpi: "First Time Fix Rate (FTFR)",
    value: "88.4%",
    target: "85.0%",
    trend: "+3.4% Favorable",
    positive: true,
  },
  {
    kpi: "Average Response Time (SLA)",
    value: "1.8 Hours",
    target: "2.0 Hours",
    trend: "-0.2h Favorable",
    positive: true,
  },
  {
    kpi: "SLA Resolution Compliance",
    value: "94.2%",
    target: "92.0%",
    trend: "+2.2% Favorable",
    positive: true,
  },
  {
    kpi: "Net Billed Service Revenue",
    value: "LKR 14,850,000.00",
    target: "LKR 13,500,000.00",
    trend: "+10.0% Ahead",
    positive: true,
  },
  {
    kpi: "Overall Service Gross Margin",
    value: "42.6%",
    target: "40.0%",
    trend: "+2.6% Favorable",
    positive: true,
  },
  {
    kpi: "Customer Satisfaction (CSAT)",
    value: "4.7 / 5.0",
    target: "4.5 / 5.0",
    trend: "+0.2 Points",
    positive: true,
  },
];

// 5. DSH-05 Integration Monitor & Error Queue
export const INTEGRATION_QUEUE_DATA = [
  {
    messageId: "MSG-B1-88412",
    interface: "SAP B1 DI Server",
    document: "RCT-77126 (Incoming Payment)",
    error: "Down Payment Account Lock timeout (10005)",
    attempts: 3,
    status: "In Error Queue",
    age: "42 mins",
  },
  {
    messageId: "MSG-SMS-9014",
    interface: "Dialog SMS Gateway",
    document: "O1-NTF-12 (Arrival Notice)",
    error: "Invalid mobile number format (+9470...)",
    attempts: 2,
    status: "Retrying",
    age: "15 mins",
  },
  {
    messageId: "MSG-MOB-4412",
    interface: "Field Mobile Sync API",
    document: "SC-2026-20513 (Checklist)",
    error: "Idempotency token conflict on photo upload",
    attempts: 1,
    status: "Resolved",
    age: "1.2 hrs",
  },
  {
    messageId: "MSG-B1-88415",
    interface: "SAP B1 Inventory Posting",
    document: "ITR-2026-88124 (Parts Issue)",
    error: "Item SP-COMP-18K insufficient batch quantity in AC-SP",
    attempts: 4,
    status: "In Error Queue",
    age: "2.5 hrs",
  },
  {
    messageId: "MSG-B1-88420",
    interface: "SAP B1 Sales Quotation",
    document: "QT-2026-0045 (Quotation Sync)",
    error: "Customer Credit Limit exceeded in SAP B1",
    attempts: 2,
    status: "In Error Queue",
    age: "3.1 hrs",
  },
];

// 6. DSH-06 Report Viewer Definitions
export const REPORT_VIEWER_OPTIONS = [
  {
    id: "O1-RPT-01",
    name: "Service Call Summary Register",
    columns: ["Call #", "Customer", "Equipment", "Status", "Technician", "Cost (LKR)"],
    data: [
      {
        c1: "SC-2026-20511",
        c2: "Wijesinghe Motors Ltd",
        c3: "Chassis Vehicle AC",
        c4: "Completed",
        c5: "K. Silva",
        c6: "518,400.00",
      },
      {
        c2: "Kandy Lake Hotel",
        c1: "SC-2026-20513",
        c3: "Daikin VRV System",
        c4: "In Progress",
        c5: "K. Silva",
        c6: "780,000.00",
      },
      {
        c1: "SC-2026-20514",
        c2: "Jayasuriya Textiles Ltd",
        c3: "Refrigerator 400L",
        c4: "On Hold",
        c5: "M. Nazeer",
        c6: "145,500.00",
      },
      {
        c1: "SC-2026-20518",
        c2: "Nimal Fernando Engineering",
        c3: "Toshiba Inverter",
        c4: "Assigned",
        c5: "A. Perera",
        c6: "68,200.00",
      },
    ],
  },
  {
    id: "O1-RPT-16",
    name: "Technician Incentive & Evaluation Statement",
    columns: [
      "Technician",
      "Role",
      "Calls Completed",
      "Eval Score",
      "Repeat Penalty",
      "Payable (LKR)",
    ],
    data: [
      {
        c1: "K. Silva",
        c2: "Lead Technician",
        c3: "18 Calls",
        c4: "96 / 100",
        c5: "None",
        c6: "45,000.00",
      },
      {
        c1: "R. Kumar",
        c2: "Assistant Tech",
        c3: "14 Calls",
        c4: "92 / 100",
        c5: "-LKR 5,000 (1 Repeat)",
        c6: "22,500.00",
      },
      {
        c1: "A. Perera",
        c2: "Supervisor",
        c3: "22 Calls",
        c4: "98 / 100",
        c5: "None",
        c6: "55,000.00",
      },
    ],
  },
  {
    id: "O1-RPT-43",
    name: "Franchise Inventory Valuation Report",
    columns: [
      "Franchise Warehouse",
      "Item Code",
      "Item Description",
      "On Hand",
      "Unit Cost (LKR)",
      "Valuation (LKR)",
    ],
    data: [
      {
        c1: "Negombo Electronics (F-021)",
        c2: "FLT-0921",
        c3: "Filter Drier 5/8 Flare",
        c4: "5",
        c5: "14,500.00",
        c6: "72,500.00",
      },
      {
        c1: "Negombo Electronics (F-021)",
        c2: "BRG-6204",
        c3: "Deep Groove Bearing",
        c4: "15",
        c5: "3,950.00",
        c6: "59,250.00",
      },
      {
        c1: "Kandy Home Centre (F-044)",
        c2: "SP-COMP-18K",
        c3: "Scroll Compressor 18HP",
        c4: "2",
        c5: "485,000.00",
        c6: "970,000.00",
      },
    ],
  },
];

// 7. DSH-07 Export Log Records
export const EXPORT_LOG_DATA = [
  {
    dateTime: "2026-10-14 09:15:22",
    user: "Kasun Perera (Service Coordinator)",
    report: "O1-RPT-01 Service Call Summary",
    format: "PDF",
    rows: 42,
    parameters: "Branch=Colombo HQ; Status=Open",
  },
  {
    dateTime: "2026-10-13 16:30:45",
    user: "Dilani Silva (Finance)",
    report: "O1-RPT-30 Service Profitability Analysis",
    format: "Excel",
    rows: 128,
    parameters: "Period=Oct-2026; Margin>30%",
  },
  {
    dateTime: "2026-10-12 11:20:10",
    user: "N. Perera (Service Manager)",
    report: "O1-RPT-16 Technician Incentive Statement",
    format: "Excel",
    rows: 16,
    parameters: "Division=Commercial VRV",
  },
  {
    dateTime: "2026-10-10 14:05:00",
    user: "A. Perera (Supervisor)",
    report: "O1-RPT-23 Hold Analysis Report",
    format: "PDF",
    rows: 8,
    parameters: "Age>3 Days; Status=Held",
  },
  {
    dateTime: "2026-10-08 17:00:30",
    user: "Dilani Silva (Finance)",
    report: "O1-RPT-43 Franchise Inventory Valuation",
    format: "Excel",
    rows: 84,
    parameters: "Franchise=All; AsAt=08-Oct-2026",
  },
];
