import { getDbPool } from "./db";

export type GLPostingStatus = "Draft" | "Ready to Post" | "Posted" | "Handed Over" | "Reconciled";
export type AccountEntryType = "Debit" | "Credit";

export interface GLPostingLine {
  id: string;
  postingBatchId: string;
  lineNo: number;
  accountType: AccountEntryType;
  glAccountCode: string;
  glAccountName: string;
  costCentre: string;
  amount: number;
  memo?: string;
}

export interface PayrollHandoverItem {
  id: string;
  postingBatchId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  division: string;
  epfNo: string;
  bankName: string;
  bankAccountNo: string;
  grossAmount: number;
  taxDeduction: number;
  netDisbursement: number;
  paymentStatus: string;
}

export interface GLPostingBatchDetails {
  id: string;
  postingRef: string;
  runNo: string;
  period: string;
  division: string;
  postingDate: string;
  journalEntryNo?: string;
  totalDebit: number;
  totalCredit: number;
  payrollBatchNo?: string;
  payrollFileName?: string;
  bankFormat: string;
  bankFileName?: string;
  status: GLPostingStatus;
  paymentLagMonths: number;
  disbursementMonth: string;
  notes?: string;
  postedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lines: GLPostingLine[];
  payrollItems: PayrollHandoverItem[];
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 12 (GL Posting & Payroll Handover)
 */
export async function ensureGLPostingTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_gl_posting_batches (
      id VARCHAR(64) PRIMARY KEY,
      posting_ref VARCHAR(64) UNIQUE NOT NULL,
      run_no VARCHAR(64) NOT NULL,
      period VARCHAR(64) NOT NULL,
      division VARCHAR(128) NOT NULL,
      posting_date VARCHAR(64) NOT NULL,
      journal_entry_no VARCHAR(64),
      total_debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      total_credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      payroll_batch_no VARCHAR(64),
      payroll_file_name VARCHAR(128),
      bank_format VARCHAR(64) NOT NULL DEFAULT 'SLIPS / CEFT',
      bank_file_name VARCHAR(128),
      status VARCHAR(32) NOT NULL DEFAULT 'Draft',
      payment_lag_months INT NOT NULL DEFAULT 3,
      disbursement_month VARCHAR(64) NOT NULL DEFAULT 'July 2026',
      notes TEXT,
      posted_by VARCHAR(128),
      created_by VARCHAR(128) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incentive_gl_posting_lines (
      id VARCHAR(64) PRIMARY KEY,
      posting_batch_id VARCHAR(64) NOT NULL REFERENCES incentive_gl_posting_batches(id) ON DELETE CASCADE,
      line_no INT NOT NULL,
      account_type VARCHAR(16) NOT NULL,
      gl_account_code VARCHAR(64) NOT NULL,
      gl_account_name VARCHAR(128) NOT NULL,
      cost_centre VARCHAR(64) NOT NULL,
      amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      memo TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incentive_payroll_handover_items (
      id VARCHAR(64) PRIMARY KEY,
      posting_batch_id VARCHAR(64) NOT NULL REFERENCES incentive_gl_posting_batches(id) ON DELETE CASCADE,
      employee_id VARCHAR(64) NOT NULL,
      employee_name VARCHAR(128) NOT NULL,
      designation VARCHAR(100) NOT NULL,
      division VARCHAR(100) NOT NULL,
      epf_no VARCHAR(32),
      bank_name VARCHAR(64) NOT NULL,
      bank_account_no VARCHAR(64) NOT NULL,
      gross_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      tax_deduction NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      net_disbursement NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      payment_status VARCHAR(32) NOT NULL DEFAULT 'Pending Handover',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_gl_batch_period ON incentive_gl_posting_batches(period);
    CREATE INDEX IF NOT EXISTS idx_gl_batch_status ON incentive_gl_posting_batches(status);
    CREATE INDEX IF NOT EXISTS idx_gl_batch_run ON incentive_gl_posting_batches(run_no);
  `);

  // Seed sample posting batches if table empty
  const countRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_gl_posting_batches;`);
  if (countRes.rows[0].cnt === 0) {
    // 1. April 2026 Batch (Posted to SAP B1 + Reconciled Payroll)
    await pool.query(`
      INSERT INTO incentive_gl_posting_batches (
        id, posting_ref, run_no, period, division, posting_date, journal_entry_no,
        total_debit, total_credit, payroll_batch_no, payroll_file_name, bank_format,
        bank_file_name, status, payment_lag_months, disbursement_month, notes,
        posted_by, created_by
      ) VALUES (
        'GLP-2026-04-001', 'GLP-2026-04-001', 'INC-RUN-2026-04-RLC', 'April 2026', 'RLC Sales',
        '2026-05-09', 'JE-2026-05-0412', 3430670.00, 3430670.00, 'PAY-BATCH-2026-04-01',
        'INC_RLC_2026-04.xlsx', 'SLIPS / CEFT Bank File', 'CEFT_TELESONIC_RLC_202605.txt',
        'Posted', 3, 'July 2026',
        'Official Accrual JE posted to SAP Business One. Handed over to HR Payroll for July 2026 salary cycle (3-month lag rule INC-BCR-01).',
        'Finance - M. Jayasinghe', 'Lakmal Perera (Incentive Administrator)'
      ),
      (
        'GLP-2026-05-002', 'GLP-2026-05-002', 'RUN-2026-05-PRE-01', 'May 2026', 'All Divisions',
        '2026-06-02', NULL, 3983000.00, 3983000.00, 'PAY-BATCH-2026-05-01',
        'INC_ALL_2026-05_PRE.xlsx', 'SLIPS / CEFT Bank File', 'CEFT_TELESONIC_MAY2026.txt',
        'Ready to Post', 3, 'August 2026',
        'May 2026 GL allocation preview. Balanced double-entries prepared for SAP B1 posting.',
        NULL, 'Lakmal Perera (Incentive Administrator)'
      )
      ON CONFLICT (id) DO NOTHING;

      -- Lines for Batch 1 (Balanced: 3 Dr lines + 1 Cr line = 3,430,670.00)
      INSERT INTO incentive_gl_posting_lines (
        id, posting_batch_id, line_no, account_type, gl_account_code, gl_account_name,
        cost_centre, amount, memo
      ) VALUES
      ('line-04-1', 'GLP-2026-04-001', 1, 'Debit', '620410', 'Sales Incentive Expense - Seg 01', 'RLC/DS01', 1912440.00, 'Dealer Segment 01 Commission'),
      ('line-04-2', 'GLP-2026-04-001', 2, 'Debit', '620410', 'Sales Incentive Expense - Seg 02', 'RLC/DS02', 1328230.00, 'Dealer Segment 02 Commission'),
      ('line-04-3', 'GLP-2026-04-001', 3, 'Debit', '620420', 'Sales Manager Target Incentive', 'RLC/MGT', 190000.00, 'Manager Target Incentive Accrual'),
      ('line-04-4', 'GLP-2026-04-001', 4, 'Credit', '240310', 'Accrued Incentive Payable', 'CORP/FIN', 3430670.00, 'Total Month Accrued Liability')
      ON CONFLICT (id) DO NOTHING;

      -- Lines for Batch 2 (May 2026 preview: 4 Dr lines + 1 Cr line = 3,983,000.00)
      INSERT INTO incentive_gl_posting_lines (
        id, posting_batch_id, line_no, account_type, gl_account_code, gl_account_name,
        cost_centre, amount, memo
      ) VALUES
      ('line-05-1', 'GLP-2026-05-002', 1, 'Debit', '620410', 'Retail Showroom Commission', 'CE/SHW01', 780000.00, 'Consumer Electronics Showroom'),
      ('line-05-2', 'GLP-2026-05-002', 2, 'Debit', '620410', 'Commercial HVAC Commission', 'CAC/DLR', 1638000.00, 'Commercial AC Dealer Sales'),
      ('line-05-3', 'GLP-2026-05-002', 3, 'Debit', '620430', 'Service Technician Scorecard', 'SVC/FLD', 555000.00, 'Field Technician Incentive'),
      ('line-05-4', 'GLP-2026-05-002', 4, 'Debit', '620440', 'Renewable Energy Consultant', 'SOL/ENG', 1010000.00, 'Solar Consultant Commission'),
      ('line-05-5', 'GLP-2026-05-002', 5, 'Credit', '240310', 'Accrued Incentive Payable', 'CORP/FIN', 3983000.00, 'Total Month Net Pool Liability')
      ON CONFLICT (id) DO NOTHING;

      -- Payroll Handover Items for Batch 1 (Sample Employees)
      INSERT INTO incentive_payroll_handover_items (
        id, posting_batch_id, employee_id, employee_name, designation, division, epf_no,
        bank_name, bank_account_no, gross_amount, tax_deduction, net_disbursement, payment_status
      ) VALUES
      ('pay-04-1', 'GLP-2026-04-001', 'EMP-1025', 'Nuwan Dias', 'Sales Executive', 'RLC Sales', 'EPF-8041', 'Commercial Bank', '8004128912', 198100.00, 0.00, 198100.00, 'Handed Over to HR'),
      ('pay-04-2', 'GLP-2026-04-001', 'EMP-1021', 'Kasun Jayawardena', 'Showroom Sales Rep', 'Consumer Electronics', 'EPF-7915', 'Sampath Bank', '1004581290', 214300.00, 0.00, 214300.00, 'Handed Over to HR'),
      ('pay-04-3', 'GLP-2026-04-001', 'EMP-1024', 'Dilshan Madusanka', 'Service Technician', 'RLC Service', 'EPF-8204', 'Bank of Ceylon', '710049281', 88942.00, 0.00, 88942.00, 'Handed Over to HR'),
      ('pay-04-4', 'GLP-2026-04-001', 'EMP-1010', 'K. Ranasinghe', 'Sales Area Manager', 'RLC Sales', 'EPF-6500', 'Hatton National Bank', '0410029412', 60000.00, 0.00, 60000.00, 'Handed Over to HR')
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get all GL Posting & Payroll Handover Batches (READ)
 */
export async function getAllGLPostingBatches(filters?: {
  period?: string | undefined;
  division?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
}): Promise<GLPostingBatchDetails[]> {
  await ensureGLPostingTables();
  const pool = getDbPool();

  let sql = `SELECT * FROM incentive_gl_posting_batches WHERE 1=1`;
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
  if (filters?.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    params.push(q);
    sql += ` AND (LOWER(posting_ref) LIKE $${params.length} OR LOWER(run_no) LIKE $${params.length} OR LOWER(period) LIKE $${params.length} OR LOWER(COALESCE(journal_entry_no, '')) LIKE $${params.length})`;
  }

  sql += ` ORDER BY created_at DESC;`;

  const res = await pool.query(sql, params);
  const rows = res.rows || [];

  const batches: GLPostingBatchDetails[] = [];

  for (const r of rows) {
    // Lines
    const linesRes = await pool.query(
      `SELECT * FROM incentive_gl_posting_lines WHERE posting_batch_id = $1 ORDER BY line_no ASC;`,
      [r.id],
    );
    const lines: GLPostingLine[] = linesRes.rows.map((l) => ({
      id: l.id,
      postingBatchId: l.posting_batch_id,
      lineNo: l.line_no,
      accountType: l.account_type as AccountEntryType,
      glAccountCode: l.gl_account_code,
      glAccountName: l.gl_account_name,
      costCentre: l.cost_centre,
      amount: parseFloat(l.amount) || 0,
      memo: l.memo || undefined,
    }));

    // Payroll Items
    const payRes = await pool.query(
      `SELECT * FROM incentive_payroll_handover_items WHERE posting_batch_id = $1 ORDER BY employee_name ASC;`,
      [r.id],
    );
    const payrollItems: PayrollHandoverItem[] = payRes.rows.map((p) => ({
      id: p.id,
      postingBatchId: p.posting_batch_id,
      employeeId: p.employee_id,
      employeeName: p.employee_name,
      designation: p.designation,
      division: p.division,
      epfNo: p.epf_no,
      bankName: p.bank_name,
      bankAccountNo: p.bank_account_no,
      grossAmount: parseFloat(p.gross_amount) || 0,
      taxDeduction: parseFloat(p.tax_deduction) || 0,
      netDisbursement: parseFloat(p.net_disbursement) || 0,
      paymentStatus: p.payment_status,
    }));

    batches.push({
      id: r.id,
      postingRef: r.posting_ref,
      runNo: r.run_no,
      period: r.period,
      division: r.division,
      postingDate: r.posting_date,
      journalEntryNo: r.journal_entry_no || undefined,
      totalDebit: parseFloat(r.total_debit) || 0,
      totalCredit: parseFloat(r.total_credit) || 0,
      payrollBatchNo: r.payroll_batch_no || undefined,
      payrollFileName: r.payroll_file_name || undefined,
      bankFormat: r.bank_format,
      bankFileName: r.bank_file_name || undefined,
      status: r.status as GLPostingStatus,
      paymentLagMonths: r.payment_lag_months || 3,
      disbursementMonth: r.disbursement_month,
      notes: r.notes || undefined,
      postedBy: r.posted_by || undefined,
      createdBy: r.created_by,
      createdAt: formatDateTime(r.created_at),
      updatedAt: formatDateTime(r.updated_at),
      lines,
      payrollItems,
    });
  }

  return batches;
}

/**
 * Get single GL Posting Batch by ID
 */
export async function getGLPostingBatchById(id: string): Promise<GLPostingBatchDetails | null> {
  await ensureGLPostingTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_gl_posting_batches WHERE id = $1 OR posting_ref = $1;`, [id]);
  if (!res.rows || res.rows.length === 0) return null;

  const r = res.rows[0];

  const linesRes = await pool.query(
    `SELECT * FROM incentive_gl_posting_lines WHERE posting_batch_id = $1 ORDER BY line_no ASC;`,
    [r.id],
  );
  const lines: GLPostingLine[] = linesRes.rows.map((l) => ({
    id: l.id,
    postingBatchId: l.posting_batch_id,
    lineNo: l.line_no,
    accountType: l.account_type as AccountEntryType,
    glAccountCode: l.gl_account_code,
    glAccountName: l.gl_account_name,
    costCentre: l.cost_centre,
    amount: parseFloat(l.amount) || 0,
    memo: l.memo || undefined,
  }));

  const payRes = await pool.query(
    `SELECT * FROM incentive_payroll_handover_items WHERE posting_batch_id = $1 ORDER BY employee_name ASC;`,
    [r.id],
  );
  const payrollItems: PayrollHandoverItem[] = payRes.rows.map((p) => ({
    id: p.id,
    postingBatchId: p.posting_batch_id,
    employeeId: p.employee_id,
    employeeName: p.employee_name,
    designation: p.designation,
    division: p.division,
    epfNo: p.epf_no,
    bankName: p.bank_name,
    bankAccountNo: p.bank_account_no,
    grossAmount: parseFloat(p.gross_amount) || 0,
    taxDeduction: parseFloat(p.tax_deduction) || 0,
    netDisbursement: parseFloat(p.net_disbursement) || 0,
    paymentStatus: p.payment_status,
  }));

  return {
    id: r.id,
    postingRef: r.posting_ref,
    runNo: r.run_no,
    period: r.period,
    division: r.division,
    postingDate: r.posting_date,
    journalEntryNo: r.journal_entry_no || undefined,
    totalDebit: parseFloat(r.total_debit) || 0,
    totalCredit: parseFloat(r.total_credit) || 0,
    payrollBatchNo: r.payroll_batch_no || undefined,
    payrollFileName: r.payroll_file_name || undefined,
    bankFormat: r.bank_format,
    bankFileName: r.bank_file_name || undefined,
    status: r.status as GLPostingStatus,
    paymentLagMonths: r.payment_lag_months || 3,
    disbursementMonth: r.disbursement_month,
    notes: r.notes || undefined,
    postedBy: r.posted_by || undefined,
    createdBy: r.created_by,
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
    lines,
    payrollItems,
  };
}

/**
 * Create a new GL Posting & Payroll Handover Batch (CREATE)
 */
export async function createGLPostingBatch(data: {
  id?: string;
  postingRef?: string;
  runNo: string;
  period: string;
  division?: string;
  postingDate?: string;
  totalAmount: number;
  paymentLagMonths?: number;
  disbursementMonth?: string;
  notes?: string;
  createdBy?: string;
  lines?: Partial<GLPostingLine>[];
  payrollItems?: Partial<PayrollHandoverItem>[];
}): Promise<GLPostingBatchDetails> {
  await ensureGLPostingTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const id = data.id || `GLP-${Date.now().toString().slice(-6)}`;
    const postingRef = data.postingRef || id;
    const division = data.division || "All Divisions";
    const postingDate = data.postingDate || new Date().toISOString().slice(0, 10);
    const totalAmount = Number(data.totalAmount) || 0;
    const paymentLag = data.paymentLagMonths ?? 3;
    const disbursementMonth = data.disbursementMonth || "July 2026";
    const createdBy = data.createdBy || "Lakmal Perera (Incentive Administrator)";

    await client.query(
      `INSERT INTO incentive_gl_posting_batches (
        id, posting_ref, run_no, period, division, posting_date, journal_entry_no,
        total_debit, total_credit, payroll_batch_no, payroll_file_name, bank_format,
        bank_file_name, status, payment_lag_months, disbursement_month, notes, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NULL, $7, $7,
        $8, $9, 'SLIPS / CEFT', $10, 'Ready to Post', $11, $12, $13, $14
      );`,
      [
        id,
        postingRef,
        data.runNo,
        data.period,
        division,
        postingDate,
        totalAmount,
        `PAY-BATCH-${data.period.replace(/\s+/g, "_")}`,
        `INC_PAYROLL_${data.period.replace(/\s+/g, "_")}.xlsx`,
        `CEFT_TELESONIC_${data.period.replace(/\s+/g, "_")}.txt`,
        paymentLag,
        disbursementMonth,
        data.notes || null,
        createdBy,
      ],
    );

    // Default Balanced Double-Entry Lines if not provided
    const defaultLines = [
      {
        lineNo: 1,
        accountType: "Debit" as const,
        glAccountCode: "620410",
        glAccountName: "Incentive & Commission Expense",
        costCentre: "OPS/CORP",
        amount: totalAmount,
        memo: `Monthly incentive accrual for ${data.period}`,
      },
      {
        lineNo: 2,
        accountType: "Credit" as const,
        glAccountCode: "240310",
        glAccountName: "Accrued Incentive Payable",
        costCentre: "FIN/CORP",
        amount: totalAmount,
        memo: `Accrued incentive liability payable in ${disbursementMonth}`,
      },
    ];

    const linesToInsert = data.lines && data.lines.length > 0 ? data.lines : defaultLines;

    for (const [idx, l] of linesToInsert.entries()) {
      const lineId = `gl-line-${id.slice(-6)}-${idx + 1}`;
      await client.query(
        `INSERT INTO incentive_gl_posting_lines (
          id, posting_batch_id, line_no, account_type, gl_account_code, gl_account_name,
          cost_centre, amount, memo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [
          lineId,
          id,
          l.lineNo || idx + 1,
          l.accountType || "Debit",
          l.glAccountCode || "620410",
          l.glAccountName || "Incentive Expense",
          l.costCentre || "CORP",
          Number(l.amount) || 0,
          l.memo || null,
        ],
      );
    }

    // Default sample employee payroll lines if none provided
    const defaultPayItems = [
      {
        employeeId: "EMP-1025",
        employeeName: "Nuwan Dias",
        designation: "Sales Executive",
        division: division,
        epfNo: "EPF-8041",
        bankName: "Commercial Bank",
        bankAccountNo: "8004128912",
        grossAmount: Math.round(totalAmount * 0.5),
        taxDeduction: 0,
        netDisbursement: Math.round(totalAmount * 0.5),
      },
      {
        employeeId: "EMP-1021",
        employeeName: "Kasun Jayawardena",
        designation: "Showroom Rep",
        division: division,
        epfNo: "EPF-7915",
        bankName: "Sampath Bank",
        bankAccountNo: "1004581290",
        grossAmount: Math.round(totalAmount * 0.5),
        taxDeduction: 0,
        netDisbursement: Math.round(totalAmount * 0.5),
      },
    ];

    const payItemsToInsert = data.payrollItems && data.payrollItems.length > 0 ? data.payrollItems : defaultPayItems;

    for (const [idx, p] of payItemsToInsert.entries()) {
      const pId = `pay-item-${id.slice(-6)}-${idx + 1}`;
      await client.query(
        `INSERT INTO incentive_payroll_handover_items (
          id, posting_batch_id, employee_id, employee_name, designation, division,
          epf_no, bank_name, bank_account_no, gross_amount, tax_deduction, net_disbursement, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Pending Handover');`,
        [
          pId,
          id,
          p.employeeId || `EMP-${idx + 1}`,
          p.employeeName || "Employee",
          p.designation || "Staff",
          p.division || division,
          p.epfNo || "EPF-0000",
          p.bankName || "Commercial Bank",
          p.bankAccountNo || "0000000000",
          Number(p.grossAmount) || 0,
          Number(p.taxDeduction) || 0,
          Number(p.netDisbursement) || 0,
        ],
      );
    }

    await client.query("COMMIT;");
    const created = await getGLPostingBatchById(id);
    return created!;
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error creating GL posting batch:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update GL Posting Batch Attributes (UPDATE)
 */
export async function updateGLPostingBatch(
  id: string,
  data: Partial<GLPostingBatchDetails>,
): Promise<GLPostingBatchDetails | null> {
  await ensureGLPostingTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const existing = await getGLPostingBatchById(id);
    if (!existing) {
      await client.query("ROLLBACK;");
      return null;
    }

    const period = data.period || existing.period;
    const division = data.division || existing.division;
    const postingDate = data.postingDate || existing.postingDate;
    const journalEntryNo = data.journalEntryNo !== undefined ? data.journalEntryNo : existing.journalEntryNo;
    const totalDebit = data.totalDebit !== undefined ? Number(data.totalDebit) : existing.totalDebit;
    const totalCredit = data.totalCredit !== undefined ? Number(data.totalCredit) : existing.totalCredit;
    const payrollFileName = data.payrollFileName !== undefined ? data.payrollFileName : existing.payrollFileName;
    const bankFileName = data.bankFileName !== undefined ? data.bankFileName : existing.bankFileName;
    const status = data.status || existing.status;
    const disbursementMonth = data.disbursementMonth || existing.disbursementMonth;
    const notes = data.notes !== undefined ? data.notes : existing.notes;
    const postedBy = data.postedBy !== undefined ? data.postedBy : existing.postedBy;

    await client.query(
      `UPDATE incentive_gl_posting_batches SET
        period = $1,
        division = $2,
        posting_date = $3,
        journal_entry_no = $4,
        total_debit = $5,
        total_credit = $6,
        payroll_file_name = $7,
        bank_file_name = $8,
        status = $9,
        disbursement_month = $10,
        notes = $11,
        posted_by = $12,
        updated_at = NOW()
      WHERE id = $13;`,
      [
        period,
        division,
        postingDate,
        journalEntryNo || null,
        totalDebit,
        totalCredit,
        payrollFileName || null,
        bankFileName || null,
        status,
        disbursementMonth,
        notes || null,
        postedBy || null,
        id,
      ],
    );

    await client.query("COMMIT;");
    return await getGLPostingBatchById(id);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error updating GL posting batch:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Execute Posting to SAP Business One (Status: Ready to Post -> Posted)
 */
export async function executeSAPPosting(
  id: string,
  postedBy: string = "Finance - M. Jayasinghe",
  customJournalRef?: string,
): Promise<GLPostingBatchDetails | null> {
  await ensureGLPostingTables();
  const pool = getDbPool();

  const existing = await getGLPostingBatchById(id);
  if (!existing) return null;

  const jeRef = customJournalRef || existing.journalEntryNo || `JE-2026-05-${Math.floor(1000 + Math.random() * 9000)}`;

  await pool.query(
    `UPDATE incentive_gl_posting_batches SET
      status = 'Posted',
      journal_entry_no = $1,
      posted_by = $2,
      updated_at = NOW()
    WHERE id = $3;`,
    [jeRef, postedBy, id],
  );

  return await getGLPostingBatchById(id);
}

/**
 * Handover to HR Payroll & Mark Transmitted (Status: Posted -> Handed Over)
 */
export async function markPayrollHandedOver(
  id: string,
): Promise<GLPostingBatchDetails | null> {
  await ensureGLPostingTables();
  const pool = getDbPool();

  await pool.query(
    `UPDATE incentive_gl_posting_batches SET
      status = 'Handed Over',
      updated_at = NOW()
    WHERE id = $1;`,
    [id],
  );

  await pool.query(
    `UPDATE incentive_payroll_handover_items SET
      payment_status = 'Transmitted to HR'
    WHERE posting_batch_id = $1;`,
    [id],
  );

  return await getGLPostingBatchById(id);
}

/**
 * Delete a GL Posting Batch (DELETE)
 */
export async function deleteGLPostingBatch(id: string): Promise<boolean> {
  await ensureGLPostingTables();
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_gl_posting_batches WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
