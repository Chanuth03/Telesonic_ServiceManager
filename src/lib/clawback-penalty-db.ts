import { getDbPool } from "./db";

export type ClawbackRecordType =
  | "Debtor Penalty"
  | "Cheque Dishonour"
  | "Sales Return / Cancellation";

export type TabCategory = "Penalty" | "Clawback" | "History";

export type SettlementStatus = "Pending" | "Deducted" | "Settled" | "Waived";

export interface ClawbackPenaltyItem {
  id: string;
  participantCode: string;
  participantName: string;
  division: string;
  period: string;
  recordType: ClawbackRecordType;
  tabCategory: TabCategory;
  invoiceNo: string;
  customerName: string;
  netValue: number;
  dueAgeDays: number;
  bracket: string;
  ratePercent: number;
  penaltyAmount: number;
  runNo: string;
  isRecurring: boolean; // "Penalty repeats monthly until the invoice is 100% settled"
  settlementStatus: SettlementStatus;
  settledAt?: string | undefined;
  settledBy?: string | undefined;
  resolutionRemarks?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface ClawbackFilter {
  period?: string | undefined;
  division?: string | undefined;
  recordType?: ClawbackRecordType | "All" | undefined;
  tabCategory?: TabCategory | "All" | undefined;
  settlementStatus?: SettlementStatus | "All" | undefined;
  search?: string | undefined;
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure table and seed records exist for Screen 17: INC-SCR-19 Debtor Penalty and Clawback Ledger
 */
export async function ensureClawbackTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_clawback_penalties (
      id VARCHAR(64) PRIMARY KEY,
      participant_code VARCHAR(64) NOT NULL,
      participant_name VARCHAR(128) NOT NULL,
      division VARCHAR(64) NOT NULL,
      period VARCHAR(16) NOT NULL,
      record_type VARCHAR(64) NOT NULL,
      tab_category VARCHAR(32) NOT NULL DEFAULT 'Penalty',
      invoice_no VARCHAR(64) NOT NULL,
      customer_name VARCHAR(128) NOT NULL,
      net_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
      due_age_days INTEGER NOT NULL DEFAULT 0,
      bracket VARCHAR(64) NOT NULL,
      rate_percent NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
      penalty_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
      run_no VARCHAR(64) NOT NULL,
      is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
      settlement_status VARCHAR(32) NOT NULL DEFAULT 'Pending',
      settled_at TIMESTAMP,
      settled_by VARCHAR(128),
      resolution_remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_clawback_part ON incentive_clawback_penalties (participant_code);
    CREATE INDEX IF NOT EXISTS idx_clawback_period ON incentive_clawback_penalties (period);
    CREATE INDEX IF NOT EXISTS idx_clawback_type ON incentive_clawback_penalties (record_type);
    CREATE INDEX IF NOT EXISTS idx_clawback_status ON incentive_clawback_penalties (settlement_status);
  `);

  const countRes = await pool.query(`SELECT COUNT(*) FROM incentive_clawback_penalties;`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    // Seed standard specimens matching page 38 requirement
    const seeds = [
      {
        id: "PEN-2026-04-001",
        participantCode: "044",
        participantName: "Ishara Fernando",
        division: "Retail & Dealer",
        period: "2026-04",
        recordType: "Debtor Penalty",
        tabCategory: "Penalty",
        invoiceNo: "INV-2026-08819",
        customerName: "Lanka Solar Traders Ltd",
        netValue: 245000.0,
        dueAgeDays: 58,
        bracket: "46 - 60 days",
        ratePercent: 2.96,
        penaltyAmount: 7258.0,
        runNo: "INC-RUN-2026-04-RLC",
        isRecurring: true,
        settlementStatus: "Pending",
        resolutionRemarks: "Overdue debtor balance beyond 45-day credit terms. Repeats monthly until 100% settled.",
      },
      {
        id: "PEN-2026-04-002",
        participantCode: "CAC-088",
        participantName: "Ruwan Jayasinghe",
        division: "Air Conditioning",
        period: "2026-04",
        recordType: "Debtor Penalty",
        tabCategory: "Penalty",
        invoiceNo: "INV-2026-09142",
        customerName: "Central Hospital AC Project",
        netValue: 500000.0,
        dueAgeDays: 51,
        bracket: "46 - 60 days",
        ratePercent: 3.0,
        penaltyAmount: 15000.0,
        runNo: "INC-RUN-2026-04-CAC",
        isRecurring: true,
        settlementStatus: "Pending",
        resolutionRemarks: "Retention payment pending verification. Monthly 3.0% debtor penalty applied.",
      },
      {
        id: "PEN-2026-04-003",
        participantCode: "028",
        participantName: "Suneth Alwis",
        division: "Retail & Dealer",
        period: "2026-04",
        recordType: "Debtor Penalty",
        tabCategory: "Penalty",
        invoiceNo: "INV-2026-07412",
        customerName: "Colombo Electronics Hub",
        netValue: 180000.0,
        dueAgeDays: 72,
        bracket: "61 - 90 days",
        ratePercent: 3.5,
        penaltyAmount: 6300.0,
        runNo: "INC-RUN-2026-04-RLC",
        isRecurring: true,
        settlementStatus: "Pending",
        resolutionRemarks: "Secondary aging bracket reached (>60 days). Escalated to regional sales manager.",
      },
      {
        id: "CLW-2026-04-004",
        participantCode: "031",
        participantName: "Nuwan Dias",
        division: "Modern Trade",
        period: "2026-04",
        recordType: "Cheque Dishonour",
        tabCategory: "Clawback",
        invoiceNo: "CHQ-SL3370",
        customerName: "Apex Supermarket Superstore",
        netValue: 180000.0,
        dueAgeDays: 0,
        bracket: "Dishonoured Cheque",
        ratePercent: 3.61,
        penaltyAmount: 6500.0,
        runNo: "INC-RUN-2026-04-MTR",
        isRecurring: false,
        settlementStatus: "Pending",
        resolutionRemarks: "Cheque returned unpaid with reason: Refer to Drawer. Immediate commission clawback.",
      },
      {
        id: "CLW-2026-04-005",
        participantCode: "MHA-012",
        participantName: "Kamal Perera",
        division: "Retail & Dealer",
        period: "2026-04",
        recordType: "Sales Return / Cancellation",
        tabCategory: "Clawback",
        invoiceNo: "CM-2026-0104",
        customerName: "Kandy Tech Plaza Ltd",
        netValue: 95000.0,
        dueAgeDays: 0,
        bracket: "Credit Memo Reversal",
        ratePercent: 5.0,
        penaltyAmount: 4750.0,
        runNo: "INC-RUN-2026-04-RLC",
        isRecurring: false,
        settlementStatus: "Pending",
        resolutionRemarks: "Merchandise returned under warranty credit memo. Commission clawed back in full.",
      },
      {
        id: "PEN-2026-03-006",
        participantCode: "CAC-045",
        participantName: "Nalin Senanayake",
        division: "Air Conditioning",
        period: "2026-03",
        recordType: "Debtor Penalty",
        tabCategory: "History",
        invoiceNo: "INV-2026-05118",
        customerName: "Southern Resort & Spa",
        netValue: 320000.0,
        dueAgeDays: 65,
        bracket: "61 - 90 days",
        ratePercent: 2.5,
        penaltyAmount: 8000.0,
        runNo: "INC-RUN-2026-03-CAC",
        isRecurring: false,
        settlementStatus: "Settled",
        settledAt: "2026-04-05 10:30:00",
        settledBy: "Finance Manager (Nimal Perera)",
        resolutionRemarks: "Fully deducted in March 2026 payroll run. Customer settled arrears in April.",
      },
      {
        id: "CLW-2026-03-007",
        participantCode: "019",
        participantName: "Priyantha Bandara",
        division: "Retail & Dealer",
        period: "2026-03",
        recordType: "Sales Return / Cancellation",
        tabCategory: "History",
        invoiceNo: "CM-2026-0082",
        customerName: "Galle Electricals Co",
        netValue: 64000.0,
        dueAgeDays: 0,
        bracket: "Credit Memo Reversal",
        ratePercent: 4.5,
        penaltyAmount: 2880.0,
        runNo: "INC-RUN-2026-03-RLC",
        isRecurring: false,
        settlementStatus: "Waived",
        settledAt: "2026-04-02 14:15:00",
        settledBy: "CEO Approval",
        resolutionRemarks: "Waived by executive exception: Goods exchanged rather than refunded.",
      },
    ];

    for (const s of seeds) {
      await pool.query(
        `
        INSERT INTO incentive_clawback_penalties (
          id, participant_code, participant_name, division, period, record_type,
          tab_category, invoice_no, customer_name, net_value, due_age_days,
          bracket, rate_percent, penalty_amount, run_no, is_recurring,
          settlement_status, settled_at, settled_by, resolution_remarks, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
        )
      `,
        [
          s.id,
          s.participantCode,
          s.participantName,
          s.division,
          s.period,
          s.recordType,
          s.tabCategory,
          s.invoiceNo,
          s.customerName,
          s.netValue,
          s.dueAgeDays,
          s.bracket,
          s.ratePercent,
          s.penaltyAmount,
          s.runNo,
          s.isRecurring,
          s.settlementStatus,
          s.settledAt || null,
          s.settledBy || null,
          s.resolutionRemarks,
        ]
      );
    }
  }
}

function mapRowToItem(r: any): ClawbackPenaltyItem {
  return {
    id: r.id,
    participantCode: r.participant_code,
    participantName: r.participant_name,
    division: r.division,
    period: r.period,
    recordType: r.record_type as ClawbackRecordType,
    tabCategory: r.tab_category as TabCategory,
    invoiceNo: r.invoice_no,
    customerName: r.customer_name,
    netValue: parseFloat(r.net_value || "0"),
    dueAgeDays: parseInt(r.due_age_days || "0", 10),
    bracket: r.bracket,
    ratePercent: parseFloat(r.rate_percent || "0"),
    penaltyAmount: parseFloat(r.penalty_amount || "0"),
    runNo: r.run_no,
    isRecurring: Boolean(r.is_recurring),
    settlementStatus: r.settlement_status as SettlementStatus,
    settledAt: r.settled_at ? formatDateTime(r.settled_at) : undefined,
    settledBy: r.settled_by || undefined,
    resolutionRemarks: r.resolution_remarks || undefined,
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  };
}

/**
 * Get all clawbacks and penalties matching optional filters
 */
export async function getAllClawbacks(
  filters: ClawbackFilter = {}
): Promise<ClawbackPenaltyItem[]> {
  await ensureClawbackTables();
  const pool = getDbPool();

  let query = `SELECT * FROM incentive_clawback_penalties WHERE 1=1`;
  const params: any[] = [];
  let pIdx = 1;

  if (filters.period && filters.period !== "All") {
    query += ` AND period = $${pIdx++}`;
    params.push(filters.period);
  }

  if (filters.division && filters.division !== "All") {
    query += ` AND division = $${pIdx++}`;
    params.push(filters.division);
  }

  if (filters.recordType && filters.recordType !== "All") {
    query += ` AND record_type = $${pIdx++}`;
    params.push(filters.recordType);
  }

  if (filters.tabCategory && filters.tabCategory !== "All") {
    query += ` AND tab_category = $${pIdx++}`;
    params.push(filters.tabCategory);
  }

  if (filters.settlementStatus && filters.settlementStatus !== "All") {
    query += ` AND settlement_status = $${pIdx++}`;
    params.push(filters.settlementStatus);
  }

  if (filters.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    query += ` AND (
      LOWER(id) LIKE $${pIdx} OR
      LOWER(participant_code) LIKE $${pIdx} OR
      LOWER(participant_name) LIKE $${pIdx} OR
      LOWER(invoice_no) LIKE $${pIdx} OR
      LOWER(customer_name) LIKE $${pIdx} OR
      LOWER(run_no) LIKE $${pIdx}
    )`;
    params.push(q);
    pIdx++;
  }

  query += ` ORDER BY created_at DESC;`;

  const res = await pool.query(query, params);
  return res.rows.map(mapRowToItem);
}

/**
 * Get single clawback/penalty item by ID
 */
export async function getClawbackById(id: string): Promise<ClawbackPenaltyItem | null> {
  await ensureClawbackTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_clawback_penalties WHERE id = $1;`, [id]);
  if (res.rows.length === 0) return null;
  return mapRowToItem(res.rows[0]);
}

/**
 * Create a new penalty or clawback record
 */
export async function createClawback(
  data: Omit<ClawbackPenaltyItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<ClawbackPenaltyItem> {
  await ensureClawbackTables();
  const pool = getDbPool();

  const prefix = data.recordType === "Debtor Penalty" ? "PEN" : "CLW";
  const id =
    data.id ||
    `${prefix}-${data.period.replace("-", "")}-${Date.now().toString().slice(-4)}`;

  // Automatically categorize tab if not provided
  let tabCategory = data.tabCategory;
  if (!tabCategory) {
    if (data.settlementStatus === "Settled" || data.settlementStatus === "Waived") {
      tabCategory = "History";
    } else if (data.recordType === "Debtor Penalty") {
      tabCategory = "Penalty";
    } else {
      tabCategory = "Clawback";
    }
  }

  // Calculate penalty if ratePercent and netValue provided and penaltyAmount is 0
  let penaltyAmount = Number(data.penaltyAmount || 0);
  if (penaltyAmount === 0 && data.ratePercent && data.netValue) {
    penaltyAmount = Math.round((Number(data.netValue) * Number(data.ratePercent)) / 100 * 100) / 100;
  }

  const res = await pool.query(
    `
    INSERT INTO incentive_clawback_penalties (
      id, participant_code, participant_name, division, period, record_type,
      tab_category, invoice_no, customer_name, net_value, due_age_days,
      bracket, rate_percent, penalty_amount, run_no, is_recurring,
      settlement_status, settled_at, settled_by, resolution_remarks, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
    )
    RETURNING *;
  `,
    [
      id,
      data.participantCode,
      data.participantName,
      data.division,
      data.period,
      data.recordType,
      tabCategory,
      data.invoiceNo,
      data.customerName,
      Number(data.netValue || 0),
      Number(data.dueAgeDays || 0),
      data.bracket || (data.recordType === "Debtor Penalty" ? "46 - 60 days" : "Reversal"),
      Number(data.ratePercent || 0),
      penaltyAmount,
      data.runNo || `INC-RUN-${data.period}-MANUAL`,
      data.isRecurring ?? (data.recordType === "Debtor Penalty"),
      data.settlementStatus || "Pending",
      data.settledAt || null,
      data.settledBy || null,
      data.resolutionRemarks || "",
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Update an existing penalty or clawback record
 */
export async function updateClawback(
  id: string,
  data: Partial<Omit<ClawbackPenaltyItem, "id" | "createdAt" | "updatedAt">>
): Promise<ClawbackPenaltyItem | null> {
  await ensureClawbackTables();
  const pool = getDbPool();

  const existing = await getClawbackById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...data,
  };

  // Keep tabCategory aligned with status
  if (data.settlementStatus === "Settled" || data.settlementStatus === "Waived") {
    updated.tabCategory = "History";
  } else if (data.settlementStatus === "Pending") {
    updated.tabCategory = updated.recordType === "Debtor Penalty" ? "Penalty" : "Clawback";
  }

  let penaltyAmount = Number(updated.penaltyAmount);
  if (data.ratePercent !== undefined || data.netValue !== undefined) {
    if (updated.ratePercent > 0 && updated.netValue > 0) {
      penaltyAmount = Math.round((Number(updated.netValue) * Number(updated.ratePercent)) / 100 * 100) / 100;
    }
  }

  const res = await pool.query(
    `
    UPDATE incentive_clawback_penalties SET
      participant_code = $1,
      participant_name = $2,
      division = $3,
      period = $4,
      record_type = $5,
      tab_category = $6,
      invoice_no = $7,
      customer_name = $8,
      net_value = $9,
      due_age_days = $10,
      bracket = $11,
      rate_percent = $12,
      penalty_amount = $13,
      run_no = $14,
      is_recurring = $15,
      settlement_status = $16,
      settled_at = $17,
      settled_by = $18,
      resolution_remarks = $19,
      updated_at = NOW()
    WHERE id = $20
    RETURNING *;
  `,
    [
      updated.participantCode,
      updated.participantName,
      updated.division,
      updated.period,
      updated.recordType,
      updated.tabCategory,
      updated.invoiceNo,
      updated.customerName,
      updated.netValue,
      updated.dueAgeDays,
      updated.bracket,
      updated.ratePercent,
      penaltyAmount,
      updated.runNo,
      updated.isRecurring,
      updated.settlementStatus,
      updated.settledAt || null,
      updated.settledBy || null,
      updated.resolutionRemarks || null,
      id,
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Settle, Deduct, or Waive a penalty/clawback
 */
export async function settleOrWaiveClawback(
  id: string,
  decision: "Settled" | "Deducted" | "Waived",
  performedBy: string,
  remarks: string
): Promise<ClawbackPenaltyItem | null> {
  await ensureClawbackTables();
  const pool = getDbPool();

  const existing = await getClawbackById(id);
  if (!existing) return null;

  const res = await pool.query(
    `
    UPDATE incentive_clawback_penalties SET
      settlement_status = $1,
      tab_category = 'History',
      settled_at = NOW(),
      settled_by = $2,
      resolution_remarks = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING *;
  `,
    [decision, performedBy, remarks, id]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Delete a penalty/clawback entry
 */
export async function deleteClawback(id: string): Promise<boolean> {
  await ensureClawbackTables();
  const pool = getDbPool();

  const res = await pool.query(`DELETE FROM incentive_clawback_penalties WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
