import { jsPDF } from "jspdf";

export function generateTelesonicGuidePdf(): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    const pageNum = doc.getNumberOfPages();
    // Header
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, 8, contentWidth, 0.4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("TELESONIC HVAC/R ITSM — PRESENTATION & OPERATIONAL MANUAL", margin, 7);
    doc.text("TILES: MASTERS | TRANSACTIONS | DASHBOARD", pageWidth - margin, 7, {
      align: "right",
    });

    // Footer
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, pageHeight - 12, contentWidth, 0.4, "F");
    doc.text(
      "Confidential & Proprietary — Telesonic Engineering (Pvt) Ltd",
      margin,
      pageHeight - 8,
    );
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  };

  // ---------------- PAGE 1: COVER & EXECUTIVE SUMMARY ----------------
  // Header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TELESONIC FIELD SERVICE ITSM", margin, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Step-by-Step Operational & Presentation Guide for Core Modules", margin, 28);
  doc.text(
    "Verified Working Modules: Masters (/masters), Transactions (/transactions), Dashboard (/dashboard)",
    margin,
    34,
  );

  y = 52;
  drawHeaderFooter();

  // Document metadata box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Target Audience: System Demonstrators, Operations Leads & Auditors", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Purpose: Step-by-step instructions on operating and showcasing data saving, part catalog integrations,",
    margin + 4,
    y + 12,
  );
  doc.text(
    "work orders, pricing recalculations, and executive single-page dashboards.",
    margin + 4,
    y + 17,
  );
  doc.text(
    "Status: All 3 Tiles 100% Frontend Active with LocalStorage State Persistence.",
    margin + 4,
    y + 22,
  );

  y += 32;

  // Table of Contents Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 44, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("TABLE OF CONTENTS & PRESENTATION SEQUENCE", margin + 6, y + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const tocItems = [
    "Section 1: Workspace Launcher & Navigation Architecture (Route: /)",
    "Section 2: Tile 1 — Masters Management (Route: /masters) — Detailed Step-by-Step",
    "Section 3: Tile 2 — Transaction Processing (Route: /transactions) — Parts Saving & Work Orders",
    "Section 4: Tile 3 — Unified Service Operations Dashboard (Route: /dashboard) — Single Page View",
    "Section 5: 5-Minute Live Presentation Script (Exact talking points & clicks)",
  ];
  tocItems.forEach((item, index) => {
    doc.text(`•  ${item}`, margin + 6, y + 15 + index * 5.5);
  });

  y += 52;

  // Section 1
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("SECTION 1: WORKSPACE ARCHITECTURE & LAUNCHER (ROUTE: /)", margin + 4, y + 5);

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "The entry point of the application is the Servio Workspace launcher (at /). As required by the system",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "rules, login returns to this launcher so that all operational modules remain accessible without requiring",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "a persistent lateral sidebar. The three highlighted presentation tiles are prominently positioned:",
    margin,
    y,
  );
  y += 6;

  const tileBoxes = [
    {
      name: "Transactions (/transactions)",
      desc: "Job cards, service quotes, warranty claims, spare parts requests with dynamic calculations.",
    },
    {
      name: "Masters (/masters)",
      desc: "28 master screens including spare parts catalog, multi-component equipment, price lists, SLA skills.",
    },
    {
      name: "Dashboard (/dashboard)",
      desc: "Unified single-page continuous view containing all 7 monitoring, KPI, queue, and audit screens.",
    },
  ];

  tileBoxes.forEach((tile) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(tile.name, margin + 4, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(tile.desc, margin + 4, y + 8.5);
    y += 14;
  });

  // ---------------- PAGE 2: MASTERS STEP-BY-STEP ----------------
  doc.addPage();
  y = margin;
  drawHeaderFooter();

  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SECTION 2: TILE 1 — MASTERS MANAGEMENT (/masters)", margin + 4, y + 5.5);

  y += 14;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("Overview & Purpose:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "The Masters module manages all foundation reference data for HVAC/R service operations across Sri Lanka.",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "It implements 28 standardized master screens based on the A2 Specification Table, with full tab navigation,",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "add-part catalog integration, editing, deletion, and local storage data persistence.",
    margin,
    y,
  );

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Key Master Screens to Showcase During Presentation:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");

  const mastersKey = [
    {
      code: "MST-05",
      name: "Item / Spare Parts Master",
      desc: "Catalog of compressors, R410A refrigerant, inverter PCBs, sensors, contactors with warehouse stock and unit rates.",
    },
    {
      code: "MST-08",
      name: "Multi-Component Equipment Master",
      desc: "Hierarchy mapping outdoor condensing units (ODU) and indoor fan coil units (IDU) with serials.",
    },
    {
      code: "MST-25",
      name: "Price List & Discount Master",
      desc: "Standard commercial tariffs, dealer discounts, and warranty labor price lists in LKR.",
    },
    {
      code: "MST-06",
      name: "Technician Skills & Certification",
      desc: "Skill matrix (VRF Level 3, Chiller Overhaul, Electrical A-Grade) for auto-dispatching.",
    },
    {
      code: "MST-01",
      name: "Branch & Service Center Master",
      desc: "Colombo Central, Kandy, Galle, Negombo service hubs with GPS coordinates and stores.",
    },
  ];

  mastersKey.forEach((m) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${m.code} - ${m.name}:`, margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(m.desc, margin + 40, y);
    y += 5.5;
  });

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Step-by-Step User Instructions for Masters:", margin, y);
  y += 6;

  const masterSteps = [
    {
      step: "Step 1: Open Masters Module",
      action: "Click on the 'Masters' tile from the workspace launcher (or navigate to /masters).",
      detail:
        "Notice the searchable sidebar on the left listing all 28 registered master screens grouped cleanly.",
    },
    {
      step: "Step 2: Select a Master Screen (e.g., MST-05 or MST-08)",
      action:
        "Click 'MST-05 Item / Spare Parts Master' or 'MST-08 Multi-Component Equipment' in the sidebar.",
      detail:
        "The screen loads with its official metadata, status badge, audit trail timestamp, and configured tabs.",
    },
    {
      step: "Step 3: Add a New Part / Line Item to the Master",
      action: "Click the green '+ Add Part / Row Item' button located above the tab table.",
      detail:
        "An interactive modal opens. You can pick from the Telesonic Genuine Spares Catalog (e.g. Daikin Inverter Compressor, Copeland Scroll, or R410A) or enter custom codes, descriptions, and warehouse locations.",
    },
    {
      step: "Step 4: Save the Part and Verify Immediate Display",
      action: "Click 'Save Line Item' inside the modal.",
      detail:
        "The row is immediately appended to the table with a green 'New' badge. A success notification banner confirms: 'Master Line successfully added and saved to localStorage'.",
    },
    {
      step: "Step 5: Modify Header Attributes & Commit Record",
      action:
        "Edit any header field (e.g., Change Item Description, Category, or Minimum Stock) and click 'Save Record'.",
      detail:
        "The state is committed to browser localStorage. Refreshing or switching screens preserves your changes.",
    },
    {
      step: "Step 6: Deletion / Cleanup (Optional)",
      action:
        "Click the red trash icon on any added row to remove it instantly from the master dataset.",
      detail:
        "A confirmation notification informs you that the row was removed and storage updated.",
    },
  ];

  masterSteps.forEach((s) => {
    checkPageBreak(14);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 13, 1, 1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text(s.step, margin + 3, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(s.action, margin + 45, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(s.detail, margin + 3, y + 9);

    y += 15;
  });

  // ---------------- PAGE 3: TRANSACTIONS STEP-BY-STEP ----------------
  doc.addPage();
  y = margin;
  drawHeaderFooter();

  doc.setFillColor(13, 148, 136); // Teal 600
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SECTION 3: TILE 2 — TRANSACTION PROCESSING (/transactions)", margin + 4, y + 5.5);

  y += 14;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("Overview & Purpose:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "The Transactions module powers day-to-day HVAC/R service workflows: field job dispatch, parts requisitions,",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "quotations, AMC contracts, and warranty processing across 42 registered transaction screens.",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "It features live cost and price calculation, spare parts modal integration, and real-time hold validation.",
    margin,
    y,
  );

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Transaction Screens to Showcase:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");

  const transKey = [
    {
      code: "TRX-17",
      name: "Parts Issue & Return Request",
      desc: "Dispatch genuine parts to field technicians; tracks warehouse deductions and unused returns.",
    },
    {
      code: "TRX-35",
      name: "Service Quotation & Estimation",
      desc: "Estimates compressor replacements, copper piping, refrigerant charges with automated LKR markup.",
    },
    {
      code: "TRX-02",
      name: "Job Card Execution / Field Service",
      desc: "Core field work order capturing technician diagnostics, parts consumed, customer signoff.",
    },
    {
      code: "TRX-26",
      name: "Equipment Commissioning Certificate",
      desc: "Commissioning test readings (suction/discharge pressures, amp draw, refrigerant charge).",
    },
    {
      code: "TRX-31",
      name: "Annual Maintenance Contract (AMC)",
      desc: "Scheduled preventive maintenance cycles, billing schedules, and contracted SLA terms.",
    },
  ];

  transKey.forEach((t) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${t.code} - ${t.name}:`, margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(t.desc, margin + 40, y);
    y += 5.5;
  });

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Step-by-Step User Instructions for Transactions:", margin, y);
  y += 6;

  const transSteps = [
    {
      step: "Step 1: Open Transactions Module",
      action:
        "Click on the 'Transactions' tile from the workspace launcher (or navigate to /transactions).",
      detail:
        "The transaction workspace displays a category-filtered sidebar (Requisitions, Service, Contracts, Warranty, Billing).",
    },
    {
      step: "Step 2: Choose a Transaction (e.g., TRX-17 or TRX-35)",
      action: "Click on 'TRX-17 Parts Issue / Return Request' or 'TRX-35 Service Quotation'.",
      detail:
        "The work order view loads with its Transaction Number (e.g., REQ-2026-0881), Status (In Progress/Draft), and SLA priority.",
    },
    {
      step: "Step 3: Switch to the 'Parts & Materials' Tab",
      action: "Click on the 'Parts & Materials' or 'Line Items' tab in the middle navigation.",
      detail:
        "The live table displays currently allocated parts along with summary metrics: Total Lines and Total Amount (LKR).",
    },
    {
      step: "Step 4: Click '+ Add Spare Part' to Open Spares Catalog",
      action: "Click the prominent '+ Add Spare Part' button above the parts table.",
      detail:
        "The Telesonic genuine catalog opens. Select a part such as 'Daikin 3HP Inverter Compressor (LKR 125,000)' or 'R410A Refrigerant Cylinder (LKR 28,500)'.",
    },
    {
      step: "Step 5: Adjust Quantity, Warehouse, or Pricing and Save",
      action:
        "Set Quantity = 2, confirm Unit Price and Warehouse (e.g., Colombo Main), then click 'Save Line Item'.",
      detail:
        "The spare part is instantly inserted into the transaction table. The total value is dynamically recalculated (e.g. + LKR 250,000).",
    },
    {
      step: "Step 6: Click 'Save Transaction' to Commit Record",
      action: "Click the blue 'Save Transaction' button in the upper header toolbar.",
      detail:
        "An in-app toast notification appears confirming successful persistence: 'Transaction REQ-2026-0881 saved successfully'.",
    },
    {
      step: "Step 7: Test Creating a Fresh Transaction Record",
      action: "Click '+ New Record' in the top bar to initialize a blank work order template.",
      detail: "Fields are reset with a fresh sequential reference code, ready for demonstration.",
    },
  ];

  transSteps.forEach((s) => {
    checkPageBreak(14);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 13, 1, 1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(13, 148, 136);
    doc.text(s.step, margin + 3, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(s.action, margin + 45, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(s.detail, margin + 3, y + 9);

    y += 15;
  });

  // ---------------- PAGE 4: DASHBOARD STEP-BY-STEP ----------------
  doc.addPage();
  y = margin;
  drawHeaderFooter();

  doc.setFillColor(124, 58, 237); // Purple 600
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SECTION 4: TILE 3 — UNIFIED SERVICE DASHBOARD (/dashboard)", margin + 4, y + 5.5);

  y += 14;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("Overview & Purpose (Unified Group-Wise Single Page):", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "As specified in the requirement document (Tel.pdf A6), all dashboard screens are unified into a single",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "continuous scrollable page grouped by functional domain, with sticky fast-jump navigation at the top.",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "This delivers real-time operational pulse, hold management, financial KPIs, queues, and audit trails.",
    margin,
    y,
  );

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("The 3 Dashboard Groups & 7 Included Screens:", margin, y);
  y += 5;

  const dashGroups = [
    {
      group: "GROUP 1: Live Monitoring & Operational Pulse",
      screens: [
        "O1-SCR-DSH-01: Heartbeat Pulse — Live SLA gauges, active technicians, and unresolved emergency tickets.",
        "O1-SCR-DSH-02: Hold Monitor — Interactive resolution for Credit Limit, Spare Parts, and Warranty Approvals.",
        "O1-SCR-DSH-03: Repeat Job Analysis — 30-day recall rates, faulty part correlations, and technician coaching.",
      ],
    },
    {
      group: "GROUP 2: Executive & Financial Performance",
      screens: [
        "O1-SCR-DSH-04: Management KPI Dashboard — Revenue (LKR 28.4M), First-Time-Fix Rate (89.2%), CSAT score.",
        "O1-SCR-DSH-06: Report Viewer & Downloader — Filter reports by branch and export genuine CSV spreadsheets.",
      ],
    },
    {
      group: "GROUP 3: System Integration & Data Governance",
      screens: [
        "O1-SCR-DSH-05: Integration Queue — Live status of SAP B1 DI Server, Dialog SMS, with interactive RETRY action.",
        "O1-SCR-DSH-07: Export Audit Log — ISO 27001-compliant immutable log with cryptographic SHA-256 validation.",
      ],
    },
  ];

  dashGroups.forEach((g) => {
    checkPageBreak(22);
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(g.group, margin + 3, y + 4);
    y += 7.5;

    g.screens.forEach((sc) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`• ${sc}`, margin + 3, y);
      y += 4.5;
    });
    y += 2;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Step-by-Step User Instructions for Dashboard:", margin, y);
  y += 6;

  const dashSteps = [
    {
      step: "Step 1: Open Unified Dashboard",
      action: "Click 'Dashboard' from the workspace or open /dashboard.",
      detail:
        "The entire operations deck loads in one clean view. Notice the live ticker bar showing active emergency jobs.",
    },
    {
      step: "Step 2: Use Sticky Section Anchors to Jump Between Groups",
      action:
        "Click on 'Operational Pulse', 'Financial & KPIs', or 'Integration & Audit' in the sticky sub-header.",
      detail: "Smoothly scrolls directly to the corresponding section without reloading.",
    },
    {
      step: "Step 3: Test Interactive Hold Resolution on DSH-02",
      action:
        "Locate the 'Hold Monitor' card. Click 'Release Hold' or 'Approve Overwrite' on a blocked job card.",
      detail:
        "The hold status changes in real-time to 'Resolved' or 'Processing', simulating dispatch unblocking.",
    },
    {
      step: "Step 4: Test Real CSV Report Export on DSH-06",
      action:
        "Scroll to 'Report Viewer'. Select a Report Type (e.g., Spare Parts Consumption) and click 'Export CSV'.",
      detail:
        "Your browser immediately downloads a genuine Excel-compatible CSV file with actual report metrics.",
    },
    {
      step: "Step 5: Test Integration Retry on DSH-05",
      action:
        "Scroll to 'Integration Queue'. Click 'Retry Payload' on any failed SAP B1 sync item.",
      detail:
        "The record transitions to 'Retrying' and then 'Success (Synced)', proving active front-end reactivity.",
    },
  ];

  dashSteps.forEach((s) => {
    checkPageBreak(14);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 13, 1, 1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(124, 58, 237);
    doc.text(s.step, margin + 3, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(s.action, margin + 45, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(s.detail, margin + 3, y + 9);

    y += 15;
  });

  // ---------------- PAGE 5: 5-MINUTE LIVE PRESENTATION SCRIPT ----------------
  doc.addPage();
  y = margin;
  drawHeaderFooter();

  doc.setFillColor(225, 29, 72); // Rose 600
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SECTION 5: 5-MINUTE LIVE PRESENTATION DEMO SCRIPT", margin + 4, y + 5.5);

  y += 14;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Presenter's Rehearsal Script (Follow this step-by-step during your presentation):",
    margin,
    y,
  );
  y += 6;

  const scriptStages = [
    {
      minute: "0:00 - 1:00",
      title: "Workspace Entry & High-Level Architecture",
      script:
        '"Good morning/afternoon team. Today I am presenting the Servio ITSM system for Telesonic. Notice our clean Workspace at the root route (/), keeping all modules accessible. Today we focus on three core operational engines: Masters, Transactions, and the unified continuous Dashboard."',
      action: "Show the / route. Highlight the Transactions, Masters, and Dashboard tiles.",
    },
    {
      minute: "1:00 - 2:15",
      title: "Tile 1 Demonstration — Masters (/masters)",
      script:
        "\"First, let's step into Masters. Here we maintain 28 master records. Let's open MST-05 (Spare Parts) or MST-08 (Multi-Component Equipment). Notice how easy it is to add a new spare part: I click '+ Add Part / Row Item', select a Daikin Inverter Compressor from our genuine catalog, confirm its warehouse stock, and click Save. Notice the instant confirmation and that this data is persistently stored in local storage.\"",
      action:
        "Click Masters tile -> Select MST-05 -> Click '+ Add Part / Row Item' -> Pick catalog item -> Click Save -> Point out green 'New' badge.",
    },
    {
      minute: "2:15 - 3:45",
      title: "Tile 2 Demonstration — Transactions (/transactions)",
      script:
        "\"Next, let's move to Transactions where field operations happen. I'll open TRX-17 Parts Issue / Return Request or TRX-35 Service Quotation. Here we see the active work order with priority and SLA countdown. Let's add spare parts to this order: click '+ Add Spare Part', pick our genuine R410A refrigerant or capacitor, enter quantity 2. Watch how the total amount immediately calculates and updates in real time. When I click 'Save Transaction', the entire job order is safely committed with confirmation.\"",
      action:
        "Click Transactions -> Select TRX-17 -> Click 'Parts & Materials' tab -> Click '+ Add Spare Part' -> Save part -> Note live sum update -> Click 'Save Transaction'.",
    },
    {
      minute: "3:45 - 5:00",
      title: "Tile 3 Demonstration — Unified Dashboard (/dashboard)",
      script:
        '"Finally, let\'s examine our unified Dashboard. In accordance with the A6 specification, all 7 dashboard screens are seamlessly integrated into a single continuous page, grouped into three logical operational tiers. Group 1 gives us real-time SLA pulse, repeat jobs, and an interactive Hold Monitor where we can unblock credit-held jobs with one click. Group 2 gives executives instant financial KPIs and a live CSV Report Exporter. Group 3 ensures data governance with live SAP B1 queue health and cryptographic audit logs. Everything is responsive, reactive, and presentation-ready."',
      action:
        "Click Dashboard tile -> Scroll through Groups 1, 2, and 3 -> Click 'Release Hold' in Hold Monitor -> Click 'Export CSV' in Report Viewer to show real downloaded file -> Show SAP queue retry.",
    },
  ];

  scriptStages.forEach((st) => {
    checkPageBreak(28);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 25, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(225, 29, 72);
    doc.text(`[${st.minute}]`, margin + 3, y + 4.5);

    doc.setTextColor(15, 23, 42);
    doc.text(st.title, margin + 25, y + 4.5);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitScript = doc.splitTextToSize(`Say: ${st.script}`, contentWidth - 8);
    doc.text(splitScript, margin + 3, y + 9);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(`Action: ${st.action}`, margin + 3, y + 21);

    y += 28;
  });

  return doc;
}
