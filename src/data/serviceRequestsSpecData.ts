export interface ServiceRequestRecord {
  id: string; // e.g., 'SR-2026-0841'
  title: string;
  callType:
    "Breakdown" | "Preventive Maintenance" | "Installation" | "Inspection" | "Warranty Claim";
  status: "Open" | "In Triage" | "Assigned" | "On Hold" | "In Progress" | "Resolved" | "Cancelled";
  priority: "P1 - Critical" | "P2 - High" | "P3 - Medium" | "P4 - Low";
  createdAt: string;
  slaResponseTarget: string; // e.g. '2 Hours (Due 14:30)'
  slaResolutionTarget: string; // e.g. '6 Hours (Due 18:30)'
  channel: "Phone Inbound" | "Email" | "Customer Portal" | "Walk-in" | "WhatsApp / Mobile";
  loggedBy: string;

  // Customer & Site (⇄B1)
  customer: {
    cardCode: string;
    cardName: string;
    contactPerson: string;
    phone: string;
    email: string;
    siteId: string;
    siteName: string;
    address: string;
    district: string;
    zone: string;
  };

  // Equipment / Installed Base (⇄B1)
  equipment: {
    serialNo: string;
    itemCode: string;
    brand: string;
    model: string;
    category: string;
    equipmentTag: string;
    installationDate: string;
    warrantyStatus:
      | "Under Warranty"
      | "Under AMC Comprehensive"
      | "Under AMC Labour-Only"
      | "Expired / Out of Scope"
      | "Other Brand Billable";
    contractNo?: string;
    contractExpiry?: string;
    operatingHours?: number;
  };

  // Fault & Symptoms
  fault: {
    category: string;
    symptom: string;
    errorCode?: string;
    description: string;
    preliminaryRootCause?: string;
    safetyHazard: boolean;
  };

  // Commercial Information Panel (⇄B1)
  commercial: {
    creditLimitLKR: number;
    currentBalanceLKR: number;
    overdueAmountLKR: number;
    paymentTerms: string;
    priceList: string;
    creditStatus: "Normal" | "Warning" | "Credit Hold";
    billingHold: boolean;
    billingHoldReason?: string;
    coveredUnderContract: boolean;
    estimatedCostLKR: number;
  };

  // Allocation & Field Depot
  allocation: {
    branchCode: string;
    branchName: string;
    warehouseCode: string;
    assignedTechId?: string;
    assignedTechName?: string;
    scheduledSlot?: string;
  };

  // Repeat & Hold Details
  repeatFlag?: {
    isRepeat: boolean;
    repeatScore: number;
    detectionWindowDays: number;
    previousTicketId?: string;
    previousTicketDate?: string;
    previousTechName?: string;
    previousResolution?: string;
    reworkWarrantyApplicable: boolean;
  };

  holdDetails?: {
    isOnHold: boolean;
    holdReasonCode:
      "CREDIT_HOLD" | "PARTS_AWAITING" | "SITE_ACCESS" | "WARRANTY_VERIFY" | "CUSTOMER_APPROVAL";
    holdReasonLabel: string;
    holdPlacedDate: string;
    placedBy: string;
    supervisorOverrideAllowed: boolean;
    overrideBy?: string;
    overrideJustification?: string;
  };

  // Multi-equipment child count if parent
  isMultiEquipment?: boolean;
  multiEquipmentCount?: number;
}

export interface InboundCallLog {
  id: string;
  timestamp: string;
  callerPhone: string;
  callerName: string;
  companyName: string;
  cardCode?: string;
  matchedEquipmentCount: number;
  selectedSerial?: string;
  quickIssue: string;
  triagePassed: boolean;
  durationSeconds: number;
  status: "In Progress" | "Converted to Request" | "Dispatched" | "Advisory Only";
  createdTicketId?: string;
}

export interface MultiEquipmentItem {
  id: string;
  unitTag: string;
  serialNo: string;
  model: string;
  locationDetails: string;
  faultSummary: string;
  warrantyStatus: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  childJobId?: string;
  assignedTech?: string;
  status: "Draft" | "Generated" | "Scheduled";
}

export const SAMPLE_SERVICE_REQUESTS: ServiceRequestRecord[] = [
  {
    id: "SR-2026-0841",
    title: "Server Room Chiller Compressor High Pressure Trip E4",
    callType: "Breakdown",
    status: "In Triage",
    priority: "P1 - Critical",
    createdAt: "2026-10-13 08:30",
    slaResponseTarget: "2 Hours (Due 10:30)",
    slaResolutionTarget: "6 Hours (Due 14:30)",
    channel: "Phone Inbound",
    loggedBy: "Sanduni Dissanayake (Helpdesk)",
    customer: {
      cardCode: "C20014",
      cardName: "Ceylon Agro Machinery PLC",
      contactPerson: "Mr. Shantha Bandara (Operations Manager)",
      phone: "+94 11 289 4400",
      email: "operations@ceylonagro.lk",
      siteId: "SIT-CMB-04",
      siteName: "Headquarters & Data Processing Plant",
      address: "No. 45/A, Nawam Mawatha, Colombo 02",
      district: "Colombo",
      zone: "Western Province - Zone 1",
    },
    equipment: {
      serialNo: "TEL-AC-VRV-90421",
      itemCode: "EQ-DK-VRV-16",
      brand: "Daikin",
      model: "VRV IV-X Commercial Inverter - 16HP",
      category: "Commercial HVAC & VRV",
      equipmentTag: "Server Room AC Primary 01",
      installationDate: "2024-03-15",
      warrantyStatus: "Under AMC Comprehensive",
      contractNo: "AMC-2025-0199",
      contractExpiry: "2027-03-14",
      operatingHours: 12450,
    },
    fault: {
      category: "Refrigeration Cycle / Compressor",
      symptom: "Continuous tripping of circuit breaker and High Pressure error E4",
      errorCode: "E4 / U4",
      description:
        "The outdoor unit condenser fan runs for 3 minutes, then compressor trips breaker with loud vibration. Ambient temp in server room is climbing to 29°C.",
      preliminaryRootCause:
        "Potential condenser coil clogging or expansion valve failure under heat load",
      safetyHazard: false,
    },
    commercial: {
      creditLimitLKR: 5000000,
      currentBalanceLKR: 3220000,
      overdueAmountLKR: 450000,
      paymentTerms: "Net 30 Days",
      priceList: "Commercial Tier A (Contracted)",
      creditStatus: "Warning",
      billingHold: false,
      billingHoldReason: "Overdue invoices over 45 days (LKR 450,000) under review",
      coveredUnderContract: true,
      estimatedCostLKR: 0,
    },
    allocation: {
      branchCode: "BR-CMB",
      branchName: "Colombo Central Service Center",
      warehouseCode: "WH-CMB-MAIN",
      assignedTechId: "TECH-014",
      assignedTechName: "Sunil Jayatissa (Senior HVAC Specialist)",
      scheduledSlot: "Today 10:45 AM - 01:00 PM",
    },
    repeatFlag: {
      isRepeat: true,
      repeatScore: 94,
      detectionWindowDays: 30,
      previousTicketId: "SR-2026-0798",
      previousTicketDate: "2026-10-02",
      previousTechName: "Kamal Gunasekara",
      previousResolution: "High-pressure switch reset and condenser fin dust wash",
      reworkWarrantyApplicable: true,
    },
  },
  {
    id: "SR-2026-0842",
    title: "Garment Finishing Line Chilled Water Pipe Valve Leak",
    callType: "Breakdown",
    status: "On Hold",
    priority: "P2 - High",
    createdAt: "2026-10-13 09:15",
    slaResponseTarget: "4 Hours (Due 13:15)",
    slaResolutionTarget: "12 Hours (Due 21:15)",
    channel: "Email",
    loggedBy: "Nuwan Jayalath (Web Portal Agent)",
    customer: {
      cardCode: "C10452",
      cardName: "Jayasuriya Garments Exports (Pvt) Ltd",
      contactPerson: "Mr. Roshan De Silva (Plant Engineer)",
      phone: "+94 31 223 9811",
      email: "maintenance@jayasuriyatex.lk",
      siteId: "SIT-KAT-01",
      siteName: "Katunayake Free Trade Zone Plant #2",
      address: "Phase 1, Zone B, BOI Industrial Estate, Katunayake",
      district: "Gampaha",
      zone: "Western Province - Zone 2",
    },
    equipment: {
      serialNo: "TEL-CHL-TRN-33102",
      itemCode: "EQ-TRN-CHL-50",
      brand: "Trane",
      model: "Series R Screw Chiller 50-Ton",
      category: "Industrial Water Chillers",
      equipmentTag: "Plant 2 Primary Chiller",
      installationDate: "2023-08-20",
      warrantyStatus: "Expired / Out of Scope",
      contractNo: "None",
      contractExpiry: "N/A",
      operatingHours: 19800,
    },
    fault: {
      category: "Hydronic / Piping Leakage",
      symptom: "Heavy glycol water dripping from isolation flange above electrical panel",
      errorCode: "None (Mechanical)",
      description:
        "Chilled water supply line gasket failed near booster pump #2. Site water pressure dropped to 1.8 bar.",
      preliminaryRootCause: "Degraded neoprene gasket and vibration loosening",
      safetyHazard: true,
    },
    commercial: {
      creditLimitLKR: 2000000,
      currentBalanceLKR: 2450000,
      overdueAmountLKR: 1250000,
      paymentTerms: "Immediate / Advance for Out-of-Scope",
      priceList: "Standard Billable Retail",
      creditStatus: "Credit Hold",
      billingHold: true,
      billingHoldReason:
        "Account exceeds credit limit by LKR 450,000 and has 90-day overdue invoices. Dispatch requires Finance clearance or Supervisor override.",
      coveredUnderContract: false,
      estimatedCostLKR: 85000,
    },
    allocation: {
      branchCode: "BR-NEG",
      branchName: "Negombo & Katunayake Field Depot",
      warehouseCode: "WH-NEG-01",
      assignedTechId: "TECH-028",
      assignedTechName: "Pradeep Silva (Mechanical Supervisor)",
      scheduledSlot: "Pending Credit Release",
    },
    holdDetails: {
      isOnHold: true,
      holdReasonCode: "CREDIT_HOLD",
      holdReasonLabel: "SAP B1 Credit Limit Exceeded & Overdue AR Invoices",
      holdPlacedDate: "2026-10-13 09:20",
      placedBy: "SAP B1iSN Automated Financial Check Rule BCR-04",
      supervisorOverrideAllowed: true,
    },
    repeatFlag: {
      isRepeat: false,
      repeatScore: 12,
      detectionWindowDays: 60,
      reworkWarrantyApplicable: false,
    },
  },
  {
    id: "SR-2026-0843",
    title: "Cold Storage Room No. 3 Temperature Rise Alarm (-12°C)",
    callType: "Breakdown",
    status: "Open",
    priority: "P1 - Critical",
    createdAt: "2026-10-13 10:05",
    slaResponseTarget: "1 Hour (Due 11:05)",
    slaResolutionTarget: "4 Hours (Due 14:05)",
    channel: "Customer Portal",
    loggedBy: "IoT Automated Alarm Telemetry",
    customer: {
      cardCode: "C30089",
      cardName: "Lanka Cold Stores & Sea Food Logistics PLC",
      contactPerson: "Mr. Anura Perera (Cold Chain Director)",
      phone: "+94 11 293 1150",
      email: "coldchain@lankacold.com",
      siteId: "SIT-PEL-09",
      siteName: "Peliyagoda Central Refrigerated Warehouse",
      address: "Fish Market Complex, Negombo Road, Peliyagoda",
      district: "Gampaha",
      zone: "Western Province - Zone 2",
    },
    equipment: {
      serialNo: "TEL-REF-BIT-77810",
      itemCode: "EQ-BIT-CMP-30",
      brand: "Bitzer",
      model: "Semi-Hermetic Reciprocating Pack 30HP",
      category: "Cold Storage Refrigeration",
      equipmentTag: "Freezer Room 3 Unit A",
      installationDate: "2024-01-10",
      warrantyStatus: "Under AMC Comprehensive",
      contractNo: "AMC-2026-0044",
      contractExpiry: "2027-01-09",
      operatingHours: 15400,
    },
    fault: {
      category: "Refrigerant Loss / Defrost Malfunction",
      symptom: "Room temperature rose from -22°C to -12°C over 4 hours. Seafood stock at risk.",
      errorCode: "ALARM-TEMP-HIGH",
      description:
        "Defrost timer triggered heater cycle but did not terminate; low suction pressure indicator lit.",
      preliminaryRootCause: "Stuck defrost contactor or liquid line solenoid valve coil burnt",
      safetyHazard: false,
    },
    commercial: {
      creditLimitLKR: 10000000,
      currentBalanceLKR: 1200000,
      overdueAmountLKR: 0,
      paymentTerms: "Net 45 Days",
      priceList: "Corporate Gold AMC",
      creditStatus: "Normal",
      billingHold: false,
      coveredUnderContract: true,
      estimatedCostLKR: 0,
    },
    allocation: {
      branchCode: "BR-CMB",
      branchName: "Colombo Central Service Center",
      warehouseCode: "WH-CMB-MAIN",
      assignedTechId: "TECH-009",
      assignedTechName: "Dinesh Kumara (Refrigeration Tech Lead)",
      scheduledSlot: "Today 10:30 AM (Urgent Dispatch)",
    },
  },
  {
    id: "SR-2026-0844",
    title: "Showroom 4-Way Cassette Water Dripping on Display Furniture",
    callType: "Breakdown",
    status: "In Progress",
    priority: "P2 - High",
    createdAt: "2026-10-12 14:20",
    slaResponseTarget: "3 Hours",
    slaResolutionTarget: "8 Hours",
    channel: "Phone Inbound",
    loggedBy: "Sanduni Dissanayake (Helpdesk)",
    customer: {
      cardCode: "C10884",
      cardName: "Singer Mega Colombo South",
      contactPerson: "Mrs. Chandrika Wickramasinghe (Store Manager)",
      phone: "+94 11 258 7720",
      email: "colombosouth@singermega.lk",
      siteId: "SIT-DUP-01",
      siteName: "Singer Mega Duplication Road Showroom",
      address: "No. 320, Duplication Road, Colombo 03",
      district: "Colombo",
      zone: "Western Province - Zone 1",
    },
    equipment: {
      serialNo: "TEL-AC-CAS-55201",
      itemCode: "EQ-MIT-CAS-36",
      brand: "Mitsubishi Electric",
      model: "Mr. Slim 4-Way Inverter Cassette 36,000 BTU",
      category: "Commercial Split AC",
      equipmentTag: "Front Showroom Cassette #1",
      installationDate: "2025-02-18",
      warrantyStatus: "Under Warranty",
      contractNo: "WARR-2025-8812",
      contractExpiry: "2027-02-17",
      operatingHours: 5800,
    },
    fault: {
      category: "Condensate Drain Clog",
      symptom: "Water overflowing drain tray and dripping on showcase sofa",
      errorCode: "None",
      description: "Drain pump running intermittently; algae buildup in transparent drain hose.",
      preliminaryRootCause: "Drain line trap choked with biofilm",
      safetyHazard: false,
    },
    commercial: {
      creditLimitLKR: 8000000,
      currentBalanceLKR: 3400000,
      overdueAmountLKR: 0,
      paymentTerms: "Net 30 Days",
      priceList: "Franchise Partner Rate",
      creditStatus: "Normal",
      billingHold: false,
      coveredUnderContract: true,
      estimatedCostLKR: 0,
    },
    allocation: {
      branchCode: "BR-CMB",
      branchName: "Colombo Central Service Center",
      warehouseCode: "WH-CMB-MAIN",
      assignedTechId: "TECH-017",
      assignedTechName: "Ruwan Senanayake",
      scheduledSlot: "En Route (ETA 25 mins)",
    },
    repeatFlag: {
      isRepeat: true,
      repeatScore: 88,
      detectionWindowDays: 60,
      previousTicketId: "SR-2026-0681",
      previousTicketDate: "2026-09-14",
      previousTechName: "Ruwan Senanayake",
      previousResolution: "Drain flush with nitrogen",
      reworkWarrantyApplicable: true,
    },
  },
  {
    id: "SR-2026-0845",
    title: "Clubhouse Banquet Hall 6x VRF Inverter Units Multi-Split Call",
    callType: "Breakdown",
    status: "In Triage",
    priority: "P2 - High",
    createdAt: "2026-10-13 09:40",
    slaResponseTarget: "4 Hours",
    slaResolutionTarget: "12 Hours",
    channel: "Phone Inbound",
    loggedBy: "Sanduni Dissanayake (Helpdesk)",
    customer: {
      cardCode: "C10042",
      cardName: "Royal Colombo Golf Club",
      contactPerson: "Mr. Dilshan Mendis (Club Secretary)",
      phone: "+94 11 269 5431",
      email: "facilities@rcgc1879.org",
      siteId: "SIT-RCGC-01",
      siteName: "Main Clubhouse & Banquet Hall",
      address: "Model Farm Road, Colombo 08",
      district: "Colombo",
      zone: "Western Province - Zone 1",
    },
    equipment: {
      serialNo: "TEL-SYS-VRF-RCGC",
      itemCode: "EQ-DK-VRV-MULTI",
      brand: "Daikin",
      model: "VRV IV Multi-Component System (6 Indoor Heads)",
      category: "Multi-Component Equipment System",
      equipmentTag: "Banquet Hall Central Multi-System",
      installationDate: "2023-11-05",
      warrantyStatus: "Under AMC Comprehensive",
      contractNo: "AMC-2024-0820",
      contractExpiry: "2026-11-04",
      operatingHours: 11200,
    },
    fault: {
      category: "Multiple Units Tripping / Master Controller Comm Error",
      symptom:
        "Central touch controller displaying Communication Error U4 across all 6 indoor units",
      errorCode: "U4",
      description:
        "Banquet hall has wedding reception scheduled tomorrow evening at 6 PM. All 6 indoor ceiling cassettes are not receiving thermostat signals.",
      preliminaryRootCause:
        "Shielded transmission cable cut or master Outdoor PCB communication board fuse blown",
      safetyHazard: false,
    },
    commercial: {
      creditLimitLKR: 4000000,
      currentBalanceLKR: 850000,
      overdueAmountLKR: 0,
      paymentTerms: "Net 30 Days",
      priceList: "Corporate AMC Tier 1",
      creditStatus: "Normal",
      billingHold: false,
      coveredUnderContract: true,
      estimatedCostLKR: 0,
    },
    allocation: {
      branchCode: "BR-CMB",
      branchName: "Colombo Central Service Center",
      warehouseCode: "WH-CMB-MAIN",
      assignedTechId: "TECH-014",
      assignedTechName: "Sunil Jayatissa & Team",
      scheduledSlot: "Today 02:00 PM",
    },
    isMultiEquipment: true,
    multiEquipmentCount: 6,
  },
];

export const SAMPLE_CALL_LOGS: InboundCallLog[] = [
  {
    id: "CALL-2026-1049",
    timestamp: "11:42:15",
    callerPhone: "0112894400",
    callerName: "Mr. Shantha Bandara",
    companyName: "Ceylon Agro Machinery PLC",
    cardCode: "C20014",
    matchedEquipmentCount: 14,
    selectedSerial: "TEL-AC-VRV-90421",
    quickIssue: "No Cooling / Error E4",
    triagePassed: true,
    durationSeconds: 38,
    status: "Converted to Request",
    createdTicketId: "SR-2026-0841",
  },
  {
    id: "CALL-2026-1050",
    timestamp: "11:48:30",
    callerPhone: "0773345890",
    callerName: "Eng. Kusal Perera",
    companyName: "Jayasuriya Garments (Katunayake)",
    cardCode: "C10452",
    matchedEquipmentCount: 8,
    selectedSerial: "TEL-CHL-TRN-33102",
    quickIssue: "Water Leakage on Booster Line",
    triagePassed: true,
    durationSeconds: 42,
    status: "In Progress",
  },
  {
    id: "CALL-2026-1051",
    timestamp: "11:51:10",
    callerPhone: "0112695431",
    callerName: "Mr. Dilshan Mendis",
    companyName: "Royal Colombo Golf Club",
    cardCode: "C10042",
    matchedEquipmentCount: 6,
    selectedSerial: "TEL-SYS-VRF-RCGC",
    quickIssue: "Banquet Hall AC Comm Error U4",
    triagePassed: true,
    durationSeconds: 45,
    status: "Converted to Request",
    createdTicketId: "SR-2026-0845",
  },
  {
    id: "CALL-2026-1052",
    timestamp: "11:54:02",
    callerPhone: "0714889201",
    callerName: "Malith Alwis",
    companyName: "Lanka Hospitals Diagnostics Kandy",
    cardCode: "C50211",
    matchedEquipmentCount: 4,
    selectedSerial: "TEL-UPS-APC-8812",
    quickIssue: "Beeping Noise / Battery Replace",
    triagePassed: false,
    durationSeconds: 25,
    status: "In Progress",
  },
];

export const SAMPLE_MULTI_EQUIPMENT_ITEMS: Record<string, MultiEquipmentItem[]> = {
  "SR-2026-0845": [
    {
      id: "MEQ-01",
      unitTag: "Banquet Hall - North Entrance Cassette",
      serialNo: "TEL-DK-IN-0101",
      model: "FXFQ50AVEB 4-Way Inverter 18k BTU",
      locationDetails: "Ground Floor, North Gate Entrance",
      faultSummary: "Error U4, No response from remote",
      warrantyStatus: "AMC Comprehensive",
      priority: "High",
      childJobId: "JOB-2026-1401",
      assignedTech: "Sunil Jayatissa",
      status: "Generated",
    },
    {
      id: "MEQ-02",
      unitTag: "Banquet Hall - Center Stage Left Cassette",
      serialNo: "TEL-DK-IN-0102",
      model: "FXFQ80AVEB 4-Way Inverter 28k BTU",
      locationDetails: "Stage Left Column #4",
      faultSummary: "Error U4, Green LED flashing",
      warrantyStatus: "AMC Comprehensive",
      priority: "High",
      childJobId: "JOB-2026-1402",
      assignedTech: "Sunil Jayatissa",
      status: "Generated",
    },
    {
      id: "MEQ-03",
      unitTag: "Banquet Hall - Center Stage Right Cassette",
      serialNo: "TEL-DK-IN-0103",
      model: "FXFQ80AVEB 4-Way Inverter 28k BTU",
      locationDetails: "Stage Right Column #5",
      faultSummary: "Error U4, Communication loop down",
      warrantyStatus: "AMC Comprehensive",
      priority: "High",
      childJobId: "JOB-2026-1403",
      assignedTech: "Sunil Jayatissa",
      status: "Generated",
    },
    {
      id: "MEQ-04",
      unitTag: "VIP Dining Private Lounge Cassette",
      serialNo: "TEL-DK-IN-0104",
      model: "FXFQ32AVEB 4-Way Inverter 12k BTU",
      locationDetails: "First Floor Mezzanine Room A",
      faultSummary: "Fan speed stuck on Low, no cooling",
      warrantyStatus: "AMC Comprehensive",
      priority: "Medium",
      childJobId: "JOB-2026-1404",
      assignedTech: "Ashan Fonseka",
      status: "Generated",
    },
    {
      id: "MEQ-05",
      unitTag: "Service Bar & Catering Area Cassette",
      serialNo: "TEL-DK-IN-0105",
      model: "FXFQ50AVEB 4-Way Inverter 18k BTU",
      locationDetails: "Behind Buffet Service Counter",
      faultSummary: "Water drip tray sensor alarm",
      warrantyStatus: "AMC Comprehensive",
      priority: "Medium",
      childJobId: "JOB-2026-1405",
      assignedTech: "Ashan Fonseka",
      status: "Draft",
    },
    {
      id: "MEQ-06",
      unitTag: "Rooftop VRV Master Condenser Outdoor 16HP",
      serialNo: "TEL-SYS-VRF-RCGC",
      model: "RXQ16ARY1 Outdoor Heat Pump",
      locationDetails: "Clubhouse Plant Roof Deck",
      faultSummary: "Master comm PCB fuse blown / U4 root cause",
      warrantyStatus: "AMC Comprehensive",
      priority: "Critical",
      childJobId: "JOB-2026-1406",
      assignedTech: "Sunil Jayatissa (Tech Lead)",
      status: "Generated",
    },
  ],
};

export const SERVICE_REQUEST_MODULE_SCREENS = [
  {
    id: "O1-SCR-TRX-01",
    code: "TRX-01",
    name: "Unified Service Request with SAP Commercial Panel",
    type: "TRX",
    priority: "P1",
    integration: "SAP B1 BP + Equip + Item + Invoice Read + Create",
    badge: "⇄B1 Live Two-Way",
    purpose:
      "Comprehensive 3-pane service ticket interface displaying customer master, installed base equipment, symptoms, SLA clock, and real-time SAP Business One credit limit, overdue invoices, and AMC status.",
  },
  {
    id: "O1-SCR-TRX-02",
    code: "TRX-02",
    name: "Rapid Inbound Call Logger",
    type: "TRX",
    priority: "P1",
    integration: "SAP B1 BP + Serial Lookup",
    badge: "⇄B1 Lookup",
    purpose:
      "High-speed 30-45 second call center intake tool. Instant phone/caller-ID match, quick customer serial selection, one-tap symptom chips, triage checklist, and instant conversion into unified request or direct dispatch.",
  },
  {
    id: "O1-SCR-TRX-03",
    code: "TRX-03",
    name: "Repeat Service Detector & Hold Resolution",
    type: "TRX",
    priority: "P1",
    integration: "SM Local + SAP History",
    badge: "⇄B1 Hold Sync",
    purpose:
      "Automated repeat service detection within 30/60/90 days window for repeat failure audit and warranty rework liability. Commercial & technical hold resolution center with supervisor overrides and digital audit sign-off.",
  },
  {
    id: "O1-SCR-TRX-04",
    code: "TRX-04",
    name: "Multi-Equipment Service Request Breakdown",
    type: "TRX",
    priority: "P2",
    integration: "SM Local",
    badge: "Local Breakdown",
    purpose:
      "Splits parent service requests for commercial facilities (hotels, factories, multi-split VRF systems) into individual equipment child jobs with independent faults, technician allocations, and status tracking.",
  },
];
