import { getDbPool } from "./db";

export type StatementStatus = "Draft" | "Calculated" | "Approved" | "Issued" | "Disbursed";

export interface StatementLineItem {
  id: string;
  statementId: string;
  lineNo: number;
  componentType: string;
  description: string;
  targetValue?: number;
  achievementValue?: number;
  achievementPct?: number;
  earnedAmount: number;
  remarks?: string;
}

export interface ParticipantStatementDetails {
  id: string;
  statementNo: string;
  participantId: string;
  salesCode?: string;
  participantName: string;
  designation: string;
  division: string;
  period: string;
  runNo: string;
  payableCommission: number;
  targetIncentive: number;
  serviceAllowance: number;
  adjustmentsAmount: number;
  penaltiesClawback: number;
  netPayable: number;
  paymentLagMonths: number;
  disbursementMonth: string;
  bankName?: string;
  bankAccountNo?: string;
  status: StatementStatus;
  issuedAt?: string;
  preparedBy: string;
  verifiedBy?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lines: StatementLineItem[];
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 13 (Participant Statement / Pay Slip)
 */
export async function ensureParticipantStatementTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_participant_statements (
      id VARCHAR(64) PRIMARY KEY,
      statement_no VARCHAR(64) UNIQUE NOT NULL,
      participant_id VARCHAR(64) NOT NULL,
      sales_code VARCHAR(64),
      participant_name VARCHAR(128) NOT NULL,
      designation VARCHAR(128) NOT NULL,
      division VARCHAR(128) NOT NULL,
      period VARCHAR(64) NOT NULL,
      run_no VARCHAR(64) NOT NULL,
      payable_commission NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      target_incentive NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      service_allowance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      adjustments_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      penalties_clawback NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      net_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      payment_lag_months INT NOT NULL DEFAULT 3,
      disbursement_month VARCHAR(64) NOT NULL DEFAULT 'July 2026',
      bank_name VARCHAR(64),
      bank_account_no VARCHAR(64),
      status VARCHAR(32) NOT NULL DEFAULT 'Calculated',
      issued_at VARCHAR(64),
      prepared_by VARCHAR(128) NOT NULL,
      verified_by VARCHAR(128),
      approved_by VARCHAR(128),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incentive_statement_lines (
      id VARCHAR(64) PRIMARY KEY,
      statement_id VARCHAR(64) NOT NULL REFERENCES incentive_participant_statements(id) ON DELETE CASCADE,
      line_no INT NOT NULL,
      component_type VARCHAR(64) NOT NULL,
      description VARCHAR(255) NOT NULL,
      target_value NUMERIC(15, 2),
      achievement_value NUMERIC(15, 2),
      achievement_pct NUMERIC(6, 2),
      earned_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      remarks TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_stmt_part ON incentive_participant_statements(participant_id);
    CREATE INDEX IF NOT EXISTS idx_stmt_period ON incentive_participant_statements(period);
    CREATE INDEX IF NOT EXISTS idx_stmt_status ON incentive_participant_statements(status);
  `);

  // Seed sample rows if table is empty
  const countRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_participant_statements;`);
  if (countRes.rows[0].cnt === 0) {
    // 1. Specimen from Page 34: Thisara Tharanga (April 2026: 187,100 + 8,000 + 3,000 = 198,100)
    await pool.query(`
      INSERT INTO incentive_participant_statements (
        id, statement_no, participant_id, sales_code, participant_name, designation, division,
        period, run_no, payable_commission, target_incentive, service_allowance, adjustments_amount,
        penalties_clawback, net_payable, payment_lag_months, disbursement_month, bank_name,
        bank_account_no, status, issued_at, prepared_by, verified_by, approved_by, notes
      ) VALUES
      (
        'SLIP-2026-04-025', 'SLIP-2026-04-025', 'EMP-1025', '025', 'Thisara Tharanga',
        'Sales Executive - Dealer Seg 01', 'RLC Sales', 'April 2026', 'INC-RUN-2026-04-RLC',
        187100.00, 11000.00, 0.00, 0.00, 0.00, 198100.00, 3, 'July 2026',
        'Commercial Bank', '8004128912', 'Issued', '09-May-2026 15:30 IST',
        'Lakmal Perera (Incentive Administrator)', 'Finance - M. Jayasinghe', 'HOD Sales - T. Aloka',
        'Official specimen statement matching Page 34 of development specifications.'
      ),
      (
        'SLIP-2026-04-031', 'SLIP-2026-04-031', 'EMP-1025', '031', 'Nuwan Dias',
        'Sales Executive - Dealer Seg 02', 'RLC Sales', 'April 2026', 'INC-RUN-2026-04-RLC',
        214300.00, 9000.00, 0.00, 6500.00, 0.00, 229800.00, 3, 'July 2026',
        'Sampath Bank', '1004581290', 'Issued', '09-May-2026 15:30 IST',
        'Lakmal Perera (Incentive Administrator)', 'Finance - M. Jayasinghe', 'HOD Sales - T. Aloka',
        'Includes LKR 6,500 approved manual adjustment for cheque SL3370 realised post cut-off.'
      ),
      (
        'SLIP-2026-04-044', 'SLIP-2026-04-044', 'EMP-1044', '044', 'Ishara Fernando',
        'Sales Executive', 'RLC Sales', 'April 2026', 'INC-RUN-2026-04-RLC',
        96200.00, 0.00, 0.00, 0.00, 7258.00, 88942.00, 3, 'July 2026',
        'Bank of Ceylon', '710049281', 'Issued', '09-May-2026 15:30 IST',
        'Lakmal Perera (Incentive Administrator)', 'Finance - M. Jayasinghe', 'HOD Sales - T. Aloka',
        'Includes LKR 7,258 penalty deduction for overdue debtors > 45 days.'
      ),
      (
        'SLIP-2026-05-102', 'SLIP-2026-05-102', 'EMP-1024', 'SVC-102', 'Dilshan Madusanka',
        'Service Technician', 'RLC Service', 'May 2026', 'RUN-2026-05-PRE-01',
        0.00, 0.00, 65000.00, 8000.00, 0.00, 73000.00, 1, 'June 2026',
        'Hatton National Bank', '0410029412', 'Approved', NULL,
        'Chaminda Warnakula (Service HOD)', 'Finance - M. Jayasinghe', 'Chaminda Warnakula (Service HOD)',
        'Technician scorecard incentive. LKR 8,000 attendance penalty waiver authorized by HR.'
      )
      ON CONFLICT (id) DO NOTHING;

      -- Lines for SLIP-2026-04-025 (Page 34 Table Content)
      INSERT INTO incentive_statement_lines (
        id, statement_id, line_no, component_type, description, target_value,
        achievement_value, achievement_pct, earned_amount, remarks
      ) VALUES
      ('line-025-1', 'SLIP-2026-04-025', 1, 'Volume Target', 'Monthly Sales Unit Target', 80.00, 154.00, 192.50, 8000.00, 'Tier 7 Slab (150%+ achievement reached)'),
      ('line-025-2', 'SLIP-2026-04-025', 2, 'Turnover Target', 'Monthly Sales Turnover Target', 18400000.00, 23399855.00, 127.17, 3000.00, 'Tier 3 Turnover Slab reached'),
      ('line-025-3', 'SLIP-2026-04-025', 3, 'Commission', 'Payable Commission on Invoiced Realised Receipts', NULL, NULL, NULL, 187100.00, 'Cash immediate & credit up to 45 days receipts')
      ON CONFLICT (id) DO NOTHING;

      -- Lines for SLIP-2026-04-031
      INSERT INTO incentive_statement_lines (
        id, statement_id, line_no, component_type, description, target_value,
        achievement_value, achievement_pct, earned_amount, remarks
      ) VALUES
      ('line-031-1', 'SLIP-2026-04-031', 1, 'Volume Target', 'Monthly Sales Unit Target', 75.00, 120.00, 160.00, 7500.00, 'Tier 6 Volume reached'),
      ('line-031-2', 'SLIP-2026-04-031', 2, 'Commission', 'Payable Product Commission', NULL, NULL, NULL, 214300.00, 'Realised invoices'),
      ('line-031-3', 'SLIP-2026-04-031', 3, 'Adjustment', 'Manual Addition: Cheque SL3370 post cut-off', NULL, NULL, NULL, 6500.00, 'Approved via ADJ-2026-0041')
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get all Participant Statements (READ)
 */
export async function getAllParticipantStatements(filters?: {
  period?: string | undefined;
  division?: string | undefined;
  status?: string | undefined;
  participantId?: string | undefined;
  search?: string | undefined;
}): Promise<ParticipantStatementDetails[]> {
  await ensureParticipantStatementTables();
  const pool = getDbPool();

  let sql = `SELECT * FROM incentive_participant_statements WHERE 1=1`;
  const params: any[] = [];

  if (filters?.period && filters.period !== "All") {
    params.push(filters.period);
    sql += ` AND period = $${params.length}`;
  }
  if (filters?.division && filters.division !== "All Divisions") {
    params.push(filters.division);
    sql += ` AND division = $${params.length}`;
  }
  if (filters?.status && filters.status !== "All") {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  if (filters?.participantId) {
    params.push(filters.participantId);
    sql += ` AND participant_id = $${params.length}`;
  }
  if (filters?.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    params.push(q);
    sql += ` AND (LOWER(participant_name) LIKE $${params.length} OR LOWER(statement_no) LIKE $${params.length} OR LOWER(COALESCE(sales_code, '')) LIKE $${params.length} OR LOWER(participant_id) LIKE $${params.length})`;
  }

  sql += ` ORDER BY created_at DESC;`;

  const res = await pool.query(sql, params);
  const rows = res.rows || [];

  const statements: ParticipantStatementDetails[] = [];

  for (const r of rows) {
    const linesRes = await pool.query(
      `SELECT * FROM incentive_statement_lines WHERE statement_id = $1 ORDER BY line_no ASC;`,
      [r.id],
    );
    const lines: StatementLineItem[] = linesRes.rows.map((l) => ({
      id: l.id,
      statementId: l.statement_id,
      lineNo: l.line_no,
      componentType: l.component_type,
      description: l.description,
      targetValue: l.target_value ? parseFloat(l.target_value) : undefined,
      achievementValue: l.achievement_value ? parseFloat(l.achievement_value) : undefined,
      achievementPct: l.achievement_pct ? parseFloat(l.achievement_pct) : undefined,
      earnedAmount: parseFloat(l.earned_amount) || 0,
      remarks: l.remarks || undefined,
    }));

    statements.push({
      id: r.id,
      statementNo: r.statement_no,
      participantId: r.participant_id,
      salesCode: r.sales_code || undefined,
      participantName: r.participant_name,
      designation: r.designation,
      division: r.division,
      period: r.period,
      runNo: r.run_no,
      payableCommission: parseFloat(r.payable_commission) || 0,
      targetIncentive: parseFloat(r.target_incentive) || 0,
      serviceAllowance: parseFloat(r.service_allowance) || 0,
      adjustmentsAmount: parseFloat(r.adjustments_amount) || 0,
      penaltiesClawback: parseFloat(r.penalties_clawback) || 0,
      netPayable: parseFloat(r.net_payable) || 0,
      paymentLagMonths: r.payment_lag_months || 3,
      disbursementMonth: r.disbursement_month,
      bankName: r.bank_name || undefined,
      bankAccountNo: r.bank_account_no || undefined,
      status: r.status as StatementStatus,
      issuedAt: r.issued_at || undefined,
      preparedBy: r.prepared_by,
      verifiedBy: r.verified_by || undefined,
      approvedBy: r.approved_by || undefined,
      notes: r.notes || undefined,
      createdAt: formatDateTime(r.created_at),
      updatedAt: formatDateTime(r.updated_at),
      lines,
    });
  }

  return statements;
}

/**
 * Get Statement by ID (READ BY ID)
 */
export async function getParticipantStatementById(id: string): Promise<ParticipantStatementDetails | null> {
  await ensureParticipantStatementTables();
  const pool = getDbPool();

  const res = await pool.query(
    `SELECT * FROM incentive_participant_statements WHERE id = $1 OR statement_no = $1;`,
    [id],
  );
  if (!res.rows || res.rows.length === 0) return null;

  const r = res.rows[0];

  const linesRes = await pool.query(
    `SELECT * FROM incentive_statement_lines WHERE statement_id = $1 ORDER BY line_no ASC;`,
    [r.id],
  );
  const lines: StatementLineItem[] = linesRes.rows.map((l) => ({
    id: l.id,
    statementId: l.statement_id,
    lineNo: l.line_no,
    componentType: l.component_type,
    description: l.description,
    targetValue: l.target_value ? parseFloat(l.target_value) : undefined,
    achievementValue: l.achievement_value ? parseFloat(l.achievement_value) : undefined,
    achievementPct: l.achievement_pct ? parseFloat(l.achievement_pct) : undefined,
    earnedAmount: parseFloat(l.earned_amount) || 0,
    remarks: l.remarks || undefined,
  }));

  return {
    id: r.id,
    statementNo: r.statement_no,
    participantId: r.participant_id,
    salesCode: r.sales_code || undefined,
    participantName: r.participant_name,
    designation: r.designation,
    division: r.division,
    period: r.period,
    runNo: r.run_no,
    payableCommission: parseFloat(r.payable_commission) || 0,
    targetIncentive: parseFloat(r.target_incentive) || 0,
    serviceAllowance: parseFloat(r.service_allowance) || 0,
    adjustmentsAmount: parseFloat(r.adjustments_amount) || 0,
    penaltiesClawback: parseFloat(r.penalties_clawback) || 0,
    netPayable: parseFloat(r.net_payable) || 0,
    paymentLagMonths: r.payment_lag_months || 3,
    disbursementMonth: r.disbursement_month,
    bankName: r.bank_name || undefined,
    bankAccountNo: r.bank_account_no || undefined,
    status: r.status as StatementStatus,
    issuedAt: r.issued_at || undefined,
    preparedBy: r.prepared_by,
    verifiedBy: r.verified_by || undefined,
    approvedBy: r.approved_by || undefined,
    notes: r.notes || undefined,
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
    lines,
  };
}

/**
 * Create a new Participant Statement (CREATE)
 */
export async function createParticipantStatement(data: {
  id?: string;
  statementNo?: string;
  participantId: string;
  salesCode?: string;
  participantName: string;
  designation: string;
  division?: string;
  period: string;
  runNo: string;
  payableCommission: number;
  targetIncentive?: number;
  serviceAllowance?: number;
  adjustmentsAmount?: number;
  penaltiesClawback?: number;
  paymentLagMonths?: number;
  disbursementMonth?: string;
  bankName?: string;
  bankAccountNo?: string;
  status?: StatementStatus;
  preparedBy?: string;
  verifiedBy?: string;
  approvedBy?: string;
  notes?: string;
  lines?: Partial<StatementLineItem>[];
}): Promise<ParticipantStatementDetails> {
  await ensureParticipantStatementTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const id = data.id || `SLIP-${Date.now().toString().slice(-6)}`;
    const statementNo = data.statementNo || id;
    const division = data.division || "RLC Sales";
    const commission = Number(data.payableCommission) || 0;
    const targetIncentive = Number(data.targetIncentive) || 0;
    const serviceAllowance = Number(data.serviceAllowance) || 0;
    const adjustments = Number(data.adjustmentsAmount) || 0;
    const penalties = Number(data.penaltiesClawback) || 0;
    const netPayable = commission + targetIncentive + serviceAllowance + adjustments - penalties;

    const lag = data.paymentLagMonths ?? 3;
    const disbMonth = data.disbursementMonth || "July 2026";
    const status: StatementStatus = data.status || "Calculated";
    const preparedBy = data.preparedBy || "Lakmal Perera (Incentive Administrator)";

    await client.query(
      `INSERT INTO incentive_participant_statements (
        id, statement_no, participant_id, sales_code, participant_name, designation, division,
        period, run_no, payable_commission, target_incentive, service_allowance, adjustments_amount,
        penalties_clawback, net_payable, payment_lag_months, disbursement_month, bank_name,
        bank_account_no, status, prepared_by, verified_by, approved_by, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      );`,
      [
        id,
        statementNo,
        data.participantId,
        data.salesCode || null,
        data.participantName,
        data.designation,
        division,
        data.period,
        data.runNo,
        commission,
        targetIncentive,
        serviceAllowance,
        adjustments,
        penalties,
        netPayable,
        lag,
        disbMonth,
        data.bankName || "Commercial Bank",
        data.bankAccountNo || "8004128912",
        status,
        preparedBy,
        data.verifiedBy || "Finance - M. Jayasinghe",
        data.approvedBy || "HOD Sales - T. Aloka",
        data.notes || null,
      ],
    );

    // Default lines if not provided
    const defaultLines = [
      {
        lineNo: 1,
        componentType: "Commission",
        description: "Payable Commission on Invoiced Realised Receipts",
        earnedAmount: commission,
        remarks: "Realised receipts within payment window",
      },
      {
        lineNo: 2,
        componentType: "Target Incentive",
        description: "Monthly Volume & Turnover Target Incentive",
        earnedAmount: targetIncentive,
        remarks: "Calculated based on Target Slab Matrix",
      },
    ];

    const linesToInsert = data.lines && data.lines.length > 0 ? data.lines : defaultLines;

    for (const [idx, l] of linesToInsert.entries()) {
      const lineId = `stmt-line-${id.slice(-6)}-${idx + 1}`;
      await client.query(
        `INSERT INTO incentive_statement_lines (
          id, statement_id, line_no, component_type, description, target_value,
          achievement_value, achievement_pct, earned_amount, remarks
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          lineId,
          id,
          l.lineNo || idx + 1,
          l.componentType || "Commission",
          l.description || "Incentive component",
          l.targetValue ?? null,
          l.achievementValue ?? null,
          l.achievementPct ?? null,
          Number(l.earnedAmount) || 0,
          l.remarks || null,
        ],
      );
    }

    await client.query("COMMIT;");
    const created = await getParticipantStatementById(id);
    return created!;
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error creating participant statement:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update Participant Statement (UPDATE)
 */
export async function updateParticipantStatement(
  id: string,
  data: Partial<ParticipantStatementDetails>,
): Promise<ParticipantStatementDetails | null> {
  await ensureParticipantStatementTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const existing = await getParticipantStatementById(id);
    if (!existing) {
      await client.query("ROLLBACK;");
      return null;
    }

    const commission = data.payableCommission !== undefined ? Number(data.payableCommission) : existing.payableCommission;
    const targetIncentive = data.targetIncentive !== undefined ? Number(data.targetIncentive) : existing.targetIncentive;
    const serviceAllowance = data.serviceAllowance !== undefined ? Number(data.serviceAllowance) : existing.serviceAllowance;
    const adjustments = data.adjustmentsAmount !== undefined ? Number(data.adjustmentsAmount) : existing.adjustmentsAmount;
    const penalties = data.penaltiesClawback !== undefined ? Number(data.penaltiesClawback) : existing.penaltiesClawback;
    const netPayable = commission + targetIncentive + serviceAllowance + adjustments - penalties;

    const designation = data.designation || existing.designation;
    const division = data.division || existing.division;
    const bankName = data.bankName !== undefined ? data.bankName : existing.bankName;
    const bankAccountNo = data.bankAccountNo !== undefined ? data.bankAccountNo : existing.bankAccountNo;
    const status = data.status || existing.status;
    const notes = data.notes !== undefined ? data.notes : existing.notes;
    const disbursementMonth = data.disbursementMonth || existing.disbursementMonth;

    await client.query(
      `UPDATE incentive_participant_statements SET
        payable_commission = $1,
        target_incentive = $2,
        service_allowance = $3,
        adjustments_amount = $4,
        penalties_clawback = $5,
        net_payable = $6,
        designation = $7,
        division = $8,
        bank_name = $9,
        bank_account_no = $10,
        status = $11,
        notes = $12,
        disbursement_month = $13,
        updated_at = NOW()
      WHERE id = $14;`,
      [
        commission,
        targetIncentive,
        serviceAllowance,
        adjustments,
        penalties,
        netPayable,
        designation,
        division,
        bankName || null,
        bankAccountNo || null,
        status,
        notes || null,
        disbursementMonth,
        id,
      ],
    );

    await client.query("COMMIT;");
    return await getParticipantStatementById(id);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error updating participant statement:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Issue / Email Statement to Participant (Status: Approved -> Issued)
 */
export async function issueStatementToParticipant(
  id: string,
  _issuedBy?: string,
): Promise<ParticipantStatementDetails> {
  await ensureParticipantStatementTables();
  const pool = getDbPool();

  const ts = new Date().toLocaleString();
  await pool.query(
    `UPDATE incentive_participant_statements SET
      status = 'Issued',
      issued_at = $1,
      updated_at = NOW()
    WHERE id = $2;`,
    [ts, id],
  );

  const updated = await getParticipantStatementById(id);
  if (!updated) {
    throw new Error(`Participant statement ${id} not found after issuing.`);
  }
  return updated;
}

/**
 * Delete a Participant Statement (DELETE)
 */
export async function deleteParticipantStatement(id: string): Promise<boolean> {
  await ensureParticipantStatementTables();
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_participant_statements WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
