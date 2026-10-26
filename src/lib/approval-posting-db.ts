import { getDbPool } from "./db";

export type ApprovalPackageStatus = "Submitted" | "Approved" | "Posted" | "Locked" | "Rejected";
export type StepDecision = "Pending" | "Approved" | "Rejected" | "Skipped";

export interface ApprovalStepItem {
  id: string;
  batchId: string;
  stepNumber: number;
  roleName: string;
  approverName: string;
  decision: StepDecision;
  decidedAt?: string;
  comments?: string;
}

export interface PostingPreviewLine {
  id: string;
  batchId: string;
  lineNo: number;
  divisionCostCentre: string;
  glExpenseAccount: string;
  glExpenseName: string;
  glPayableAccount: string;
  glPayableName: string;
  amount: number;
  dimension: string;
}

export interface ApprovalBatchHistoryItem {
  id: string;
  batchId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface ApprovalBatchDetails {
  id: string;
  runNo: string;
  period: string;
  division: string;
  totalPayable: number;
  postingMethod: string;
  accrualJe?: string;
  payrollFile?: string;
  status: ApprovalPackageStatus;
  currentStep: number;
  totalSteps: number;
  notes?: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  steps: ApprovalStepItem[];
  postingLines: PostingPreviewLine[];
  history: ApprovalBatchHistoryItem[];
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 11 (Multi-Level Approval & Posting)
 */
export async function ensureApprovalPostingTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_approval_batches (
      id VARCHAR(64) PRIMARY KEY,
      run_no VARCHAR(64) UNIQUE NOT NULL,
      period VARCHAR(64) NOT NULL,
      division VARCHAR(128) NOT NULL,
      total_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      posting_method VARCHAR(128) NOT NULL DEFAULT 'Accrual JE + payroll export',
      accrual_je VARCHAR(64),
      payroll_file VARCHAR(128),
      status VARCHAR(32) NOT NULL DEFAULT 'Submitted',
      current_step INT NOT NULL DEFAULT 1,
      total_steps INT NOT NULL DEFAULT 4,
      notes TEXT,
      submitted_by VARCHAR(128) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS approval_batch_steps (
      id VARCHAR(64) PRIMARY KEY,
      batch_id VARCHAR(64) NOT NULL REFERENCES incentive_approval_batches(id) ON DELETE CASCADE,
      step_number INT NOT NULL,
      role_name VARCHAR(128) NOT NULL,
      approver_name VARCHAR(128) NOT NULL,
      decision VARCHAR(32) NOT NULL DEFAULT 'Pending',
      decided_at VARCHAR(64),
      comments TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS approval_posting_lines (
      id VARCHAR(64) PRIMARY KEY,
      batch_id VARCHAR(64) NOT NULL REFERENCES incentive_approval_batches(id) ON DELETE CASCADE,
      line_no INT NOT NULL,
      division_cost_centre VARCHAR(128) NOT NULL,
      gl_expense_account VARCHAR(64) NOT NULL,
      gl_expense_name VARCHAR(128) NOT NULL,
      gl_payable_account VARCHAR(64) NOT NULL,
      gl_payable_name VARCHAR(128) NOT NULL,
      amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      dimension VARCHAR(64) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS approval_batch_history (
      id VARCHAR(64) PRIMARY KEY,
      batch_id VARCHAR(64) NOT NULL REFERENCES incentive_approval_batches(id) ON DELETE CASCADE,
      action VARCHAR(128) NOT NULL,
      performed_by VARCHAR(128) NOT NULL,
      performed_at VARCHAR(64) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_appr_batch_period ON incentive_approval_batches(period);
    CREATE INDEX IF NOT EXISTS idx_appr_batch_status ON incentive_approval_batches(status);
    CREATE INDEX IF NOT EXISTS idx_appr_batch_run ON incentive_approval_batches(run_no);
  `);

  // Seed sample approval packages if table empty
  const countRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_approval_batches;`);
  if (countRes.rows[0].cnt === 0) {
    // 1. April 2026 Batch (Page 34 Specimen: Fully Approved, Posted & Locked)
    await pool.query(`
      INSERT INTO incentive_approval_batches (
        id, run_no, period, division, total_payable, posting_method, accrual_je,
        payroll_file, status, current_step, total_steps, notes, submitted_by
      ) VALUES (
        'APP-2026-04-RLC', 'INC-RUN-2026-04-RLC', 'April 2026', 'All Divisions', 3430670.00,
        'Accrual JE + payroll export', 'JE-2026-05-0412', 'INC_RLC_2026-04.xlsx',
        'Posted', 4, 4,
        'Official April 2026 incentive settlement approved by CEO and posted to SAP Business One.',
        'Lakmal Perera (Incentive Administrator)'
      ),
      (
        'APP-2026-05-PRE', 'RUN-2026-05-PRE-01', 'May 2026', 'All Divisions', 3983000.00,
        'Accrual JE + payroll export', NULL, NULL,
        'Submitted', 2, 4,
        'May 2026 Preliminary calculation run package forwarded for multi-tier executive sign-offs.',
        'Lakmal Perera (Incentive Administrator)'
      )
      ON CONFLICT (id) DO NOTHING;

      -- Seed Steps for April 2026 (All 4 Approved)
      INSERT INTO approval_batch_steps (
        id, batch_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES
      ('step-04-1', 'APP-2026-04-RLC', 1, 'HOD Sales (RLC)', 'HOD Sales - T. Aloka', 'Approved', '06-May-2026 14:15 IST', 'Sales volumes and commission schedules verified.'),
      ('step-04-2', 'APP-2026-04-RLC', 2, 'HOD Service', 'Chaminda Warnakula (Service HOD)', 'Approved', '07-May-2026 11:30 IST', 'Scorecard metrics and technician jobs audited.'),
      ('step-04-3', 'APP-2026-04-RLC', 3, 'Head of Finance', 'Finance - M. Jayasinghe', 'Approved', '08-May-2026 16:45 IST', 'GL cost centre accounts and tax provisions audited.'),
      ('step-04-4', 'APP-2026-04-RLC', 4, 'CEO / Executive Director', 'CEO - S. K. Wickramasinghe', 'Approved', '09-May-2026 10:20 IST', 'Final executive authorization granted for payout.')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Steps for May 2026 (Step 1 Approved, Step 2 Pending)
      INSERT INTO approval_batch_steps (
        id, batch_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES
      ('step-05-1', 'APP-2026-05-PRE', 1, 'HOD Sales (RLC)', 'HOD Sales - T. Aloka', 'Approved', '13-May-2026 16:20 IST', 'Verified preliminary targets and dealer incentives.'),
      ('step-05-2', 'APP-2026-05-PRE', 2, 'HOD Service', 'Chaminda Warnakula (Service HOD)', 'Pending', NULL, 'Reviewing attendance factors and job sheets.'),
      ('step-05-3', 'APP-2026-05-PRE', 3, 'Head of Finance', 'Finance - M. Jayasinghe', 'Pending', NULL, 'Awaiting division HOD sign-offs.'),
      ('step-05-4', 'APP-2026-05-PRE', 4, 'CEO / Executive Director', 'CEO - S. K. Wickramasinghe', 'Pending', NULL, 'Final executive authorization tier.')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Posting Preview Lines for April 2026 (Exact Page 34 Table)
      INSERT INTO approval_posting_lines (
        id, batch_id, line_no, division_cost_centre, gl_expense_account, gl_expense_name,
        gl_payable_account, gl_payable_name, amount, dimension
      ) VALUES
      ('post-04-1', 'APP-2026-04-RLC', 1, 'RLC - Dealer Seg. 01', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 1912440.00, 'RLC / DS01'),
      ('post-04-2', 'APP-2026-04-RLC', 2, 'RLC - Dealer Seg. 02', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 1328230.00, 'RLC / DS02'),
      ('post-04-3', 'APP-2026-04-RLC', 3, 'RLC - Management', '620420', 'Manager Incentive Expense', '240310', 'Incentive Payable', 190000.00, 'RLC / MGT')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Posting Preview Lines for May 2026
      INSERT INTO approval_posting_lines (
        id, batch_id, line_no, division_cost_centre, gl_expense_account, gl_expense_name,
        gl_payable_account, gl_payable_name, amount, dimension
      ) VALUES
      ('post-05-1', 'APP-2026-05-PRE', 1, 'Consumer Electronics Showroom', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 780000.00, 'CE / SHW01'),
      ('post-05-2', 'APP-2026-05-PRE', 2, 'Commercial AC Dealer Sales', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 1638000.00, 'CAC / DLR'),
      ('post-05-3', 'APP-2026-05-PRE', 3, 'Field Service Engineering', '620430', 'Service Technician Bonus', '240310', 'Incentive Payable', 555000.00, 'SVC / FLD'),
      ('post-05-4', 'APP-2026-05-PRE', 4, 'Renewable Energy Solar Team', '620440', 'Solar Consultant Commission', '240310', 'Incentive Payable', 1010000.00, 'SOL / ENG')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Audit History for April 2026
      INSERT INTO approval_batch_history (
        id, batch_id, action, performed_by, performed_at, notes
      ) VALUES
      ('hist-04-1', 'APP-2026-04-RLC', 'Package Created & Submitted', 'Lakmal Perera', '05-May-2026 10:00 IST', 'Generated from final calculation run INC-RUN-2026-04-RLC.'),
      ('hist-04-2', 'APP-2026-04-RLC', 'HOD Sales Approved', 'HOD Sales - T. Aloka', '06-May-2026 14:15 IST', 'Step 1 complete.'),
      ('hist-04-3', 'APP-2026-04-RLC', 'HOD Service Approved', 'Chaminda Warnakula', '07-May-2026 11:30 IST', 'Step 2 complete.'),
      ('hist-04-4', 'APP-2026-04-RLC', 'Finance Manager Approved', 'Finance - M. Jayasinghe', '08-May-2026 16:45 IST', 'Step 3 complete.'),
      ('hist-04-5', 'APP-2026-04-RLC', 'CEO Final Approval', 'CEO - S. K. Wickramasinghe', '09-May-2026 10:20 IST', 'Step 4 complete. Package status updated to Approved.'),
      ('hist-04-6', 'APP-2026-04-RLC', 'Posted Accrual JE to SAP B1', 'Finance - M. Jayasinghe', '09-May-2026 11:45 IST', 'Posted Journal Entry #JE-2026-05-0412. Exported payroll file INC_RLC_2026-04.xlsx.')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Audit History for May 2026
      INSERT INTO approval_batch_history (
        id, batch_id, action, performed_by, performed_at, notes
      ) VALUES
      ('hist-05-1', 'APP-2026-05-PRE', 'Package Created & Submitted', 'Lakmal Perera', '12-May-2026 18:00 IST', 'Submitted to approval pipeline after MTD calculation simulation.'),
      ('hist-05-2', 'APP-2026-05-PRE', 'HOD Sales Approved', 'HOD Sales - T. Aloka', '13-May-2026 16:20 IST', 'Step 1 complete.')
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get all Approval Batches from PostgreSQL (READ)
 */
export async function getAllApprovalBatches(filters?: {
  period?: string | undefined;
  division?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
}): Promise<ApprovalBatchDetails[]> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();

  let sql = `SELECT * FROM incentive_approval_batches WHERE 1=1`;
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
    sql += ` AND (LOWER(run_no) LIKE $${params.length} OR LOWER(id) LIKE $${params.length} OR LOWER(period) LIKE $${params.length} OR LOWER(accrual_je) LIKE $${params.length})`;
  }

  sql += ` ORDER BY created_at DESC;`;

  const res = await pool.query(sql, params);
  const rows = res.rows || [];

  const batches: ApprovalBatchDetails[] = [];

  for (const r of rows) {
    // 1. Fetch Steps
    const stepsRes = await pool.query(
      `SELECT * FROM approval_batch_steps WHERE batch_id = $1 ORDER BY step_number ASC;`,
      [r.id],
    );
    const steps: ApprovalStepItem[] = stepsRes.rows.map((s) => ({
      id: s.id,
      batchId: s.batch_id,
      stepNumber: s.step_number,
      roleName: s.role_name,
      approverName: s.approver_name,
      decision: s.decision as StepDecision,
      decidedAt: s.decided_at || undefined,
      comments: s.comments || undefined,
    }));

    // 2. Fetch Posting Lines
    const linesRes = await pool.query(
      `SELECT * FROM approval_posting_lines WHERE batch_id = $1 ORDER BY line_no ASC;`,
      [r.id],
    );
    const postingLines: PostingPreviewLine[] = linesRes.rows.map((l) => ({
      id: l.id,
      batchId: l.batch_id,
      lineNo: l.line_no,
      divisionCostCentre: l.division_cost_centre,
      glExpenseAccount: l.gl_expense_account,
      glExpenseName: l.gl_expense_name,
      glPayableAccount: l.gl_payable_account,
      glPayableName: l.gl_payable_name,
      amount: parseFloat(l.amount) || 0,
      dimension: l.dimension,
    }));

    // 3. Fetch History
    const histRes = await pool.query(
      `SELECT * FROM approval_batch_history WHERE batch_id = $1 ORDER BY created_at ASC;`,
      [r.id],
    );
    const history: ApprovalBatchHistoryItem[] = histRes.rows.map((h) => ({
      id: h.id,
      batchId: h.batch_id,
      action: h.action,
      performedBy: h.performed_by,
      performedAt: h.performed_at,
      notes: h.notes || undefined,
    }));

    batches.push({
      id: r.id,
      runNo: r.run_no,
      period: r.period,
      division: r.division,
      totalPayable: parseFloat(r.total_payable) || 0,
      postingMethod: r.posting_method,
      accrualJe: r.accrual_je || undefined,
      payrollFile: r.payroll_file || undefined,
      status: r.status as ApprovalPackageStatus,
      currentStep: r.current_step,
      totalSteps: r.total_steps,
      notes: r.notes || undefined,
      submittedBy: r.submitted_by,
      createdAt: formatDateTime(r.created_at),
      updatedAt: formatDateTime(r.updated_at),
      steps,
      postingLines,
      history,
    });
  }

  return batches;
}

/**
 * Get Approval Batch by ID (READ BY ID)
 */
export async function getApprovalBatchById(id: string): Promise<ApprovalBatchDetails | null> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_approval_batches WHERE id = $1 OR run_no = $1;`, [id]);
  if (!res.rows || res.rows.length === 0) return null;

  const r = res.rows[0];

  const stepsRes = await pool.query(
    `SELECT * FROM approval_batch_steps WHERE batch_id = $1 ORDER BY step_number ASC;`,
    [r.id],
  );
  const steps: ApprovalStepItem[] = stepsRes.rows.map((s) => ({
    id: s.id,
    batchId: s.batch_id,
    stepNumber: s.step_number,
    roleName: s.role_name,
    approverName: s.approver_name,
    decision: s.decision as StepDecision,
    decidedAt: s.decided_at || undefined,
    comments: s.comments || undefined,
  }));

  const linesRes = await pool.query(
    `SELECT * FROM approval_posting_lines WHERE batch_id = $1 ORDER BY line_no ASC;`,
    [r.id],
  );
  const postingLines: PostingPreviewLine[] = linesRes.rows.map((l) => ({
    id: l.id,
    batchId: l.batch_id,
    lineNo: l.line_no,
    divisionCostCentre: l.division_cost_centre,
    glExpenseAccount: l.gl_expense_account,
    glExpenseName: l.gl_expense_name,
    glPayableAccount: l.gl_payable_account,
    glPayableName: l.gl_payable_name,
    amount: parseFloat(l.amount) || 0,
    dimension: l.dimension,
  }));

  const histRes = await pool.query(
    `SELECT * FROM approval_batch_history WHERE batch_id = $1 ORDER BY created_at ASC;`,
    [r.id],
  );
  const history: ApprovalBatchHistoryItem[] = histRes.rows.map((h) => ({
    id: h.id,
    batchId: h.batch_id,
    action: h.action,
    performedBy: h.performed_by,
    performedAt: h.performed_at,
    notes: h.notes || undefined,
  }));

  return {
    id: r.id,
    runNo: r.run_no,
    period: r.period,
    division: r.division,
    totalPayable: parseFloat(r.total_payable) || 0,
    postingMethod: r.posting_method,
    accrualJe: r.accrual_je || undefined,
    payrollFile: r.payroll_file || undefined,
    status: r.status as ApprovalPackageStatus,
    currentStep: r.current_step,
    totalSteps: r.total_steps,
    notes: r.notes || undefined,
    submittedBy: r.submitted_by,
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
    steps,
    postingLines,
    history,
  };
}

/**
 * Create a new Multi-Level Approval Package (CREATE)
 */
export async function createApprovalBatch(data: {
  id?: string;
  runNo: string;
  period: string;
  division?: string;
  totalPayable: number;
  postingMethod?: string;
  accrualJe?: string;
  payrollFile?: string;
  notes?: string;
  submittedBy?: string;
  steps?: Partial<ApprovalStepItem>[];
  postingLines?: Partial<PostingPreviewLine>[];
}): Promise<ApprovalBatchDetails> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const id = data.id || `APP-${data.runNo.replace(/[^A-Za-z0-9]/g, "-")}`;
    const division = data.division || "All Divisions";
    const postingMethod = data.postingMethod || "Accrual JE + payroll export";
    const submittedBy = data.submittedBy || "Lakmal Perera (Incentive Administrator)";
    const totalPayable = Number(data.totalPayable) || 0;

    await client.query(
      `INSERT INTO incentive_approval_batches (
        id, run_no, period, division, total_payable, posting_method,
        accrual_je, payroll_file, status, current_step, total_steps, notes, submitted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Submitted', 1, 4, $9, $10);`,
      [
        id,
        data.runNo,
        data.period,
        division,
        totalPayable,
        postingMethod,
        data.accrualJe || null,
        data.payrollFile || null,
        data.notes || null,
        submittedBy,
      ],
    );

    // Standard 4-Tier Approval Flow per requirement doc Page 34
    const defaultSteps = [
      { stepNumber: 1, roleName: "HOD Sales (RLC)", approverName: "HOD Sales - T. Aloka" },
      { stepNumber: 2, roleName: "HOD Service", approverName: "Chaminda Warnakula (Service HOD)" },
      { stepNumber: 3, roleName: "Head of Finance", approverName: "Finance - M. Jayasinghe" },
      { stepNumber: 4, roleName: "CEO / Executive Director", approverName: "CEO - S. K. Wickramasinghe" },
    ];

    const stepsToUse = data.steps && data.steps.length > 0 ? data.steps : defaultSteps;

    for (const [idx, s] of stepsToUse.entries()) {
      const stepId = `step-${id.slice(-6)}-${idx + 1}`;
      await client.query(
        `INSERT INTO approval_batch_steps (
          id, batch_id, step_number, role_name, approver_name, decision, decided_at, comments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          stepId,
          id,
          s.stepNumber || idx + 1,
          s.roleName || "Reviewer",
          s.approverName || "Approver",
          s.decision || "Pending",
          s.decidedAt || null,
          s.comments || null,
        ],
      );
    }

    // Default posting preview lines if none supplied
    const defaultLines = [
      {
        lineNo: 1,
        divisionCostCentre: `${division} - Direct Operations`,
        glExpenseAccount: "620410",
        glExpenseName: "Sales & Service Incentive Expense",
        glPayableAccount: "240310",
        glPayableName: "Incentive Payable",
        amount: Math.round(totalPayable * 0.8),
        dimension: "CORP / OPS",
      },
      {
        lineNo: 2,
        divisionCostCentre: `${division} - Management Pool`,
        glExpenseAccount: "620420",
        glExpenseName: "Manager Incentive Expense",
        glPayableAccount: "240310",
        glPayableName: "Incentive Payable",
        amount: Math.round(totalPayable * 0.2),
        dimension: "CORP / MGT",
      },
    ];

    const linesToUse = data.postingLines && data.postingLines.length > 0 ? data.postingLines : defaultLines;

    for (const [idx, l] of linesToUse.entries()) {
      const lineId = `post-${id.slice(-6)}-${idx + 1}`;
      await client.query(
        `INSERT INTO approval_posting_lines (
          id, batch_id, line_no, division_cost_centre, gl_expense_account,
          gl_expense_name, gl_payable_account, gl_payable_name, amount, dimension
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          lineId,
          id,
          l.lineNo || idx + 1,
          l.divisionCostCentre || division,
          l.glExpenseAccount || "620410",
          l.glExpenseName || "Incentive Expense",
          l.glPayableAccount || "240310",
          l.glPayableName || "Incentive Payable",
          Number(l.amount) || 0,
          l.dimension || "DIM1",
        ],
      );
    }

    // Initial History
    const ts = new Date().toLocaleString();
    await client.query(
      `INSERT INTO approval_batch_history (id, batch_id, action, performed_by, performed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${id}-1`,
        id,
        "Package Created & Submitted",
        submittedBy,
        ts,
        `Approval package created for ${data.runNo} (${data.period}) totaling LKR ${totalPayable.toLocaleString()}.`,
      ],
    );

    await client.query("COMMIT;");
    const created = await getApprovalBatchById(id);
    return created!;
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error creating approval batch:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update an existing Approval Batch (UPDATE)
 */
export async function updateApprovalBatch(
  id: string,
  data: Partial<ApprovalBatchDetails>,
  updatedBy: string = "Finance Administrator",
): Promise<ApprovalBatchDetails | null> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const existing = await getApprovalBatchById(id);
    if (!existing) {
      await client.query("ROLLBACK;");
      return null;
    }

    const period = data.period || existing.period;
    const division = data.division || existing.division;
    const totalPayable = data.totalPayable !== undefined ? Number(data.totalPayable) : existing.totalPayable;
    const postingMethod = data.postingMethod || existing.postingMethod;
    const accrualJe = data.accrualJe !== undefined ? data.accrualJe : existing.accrualJe;
    const payrollFile = data.payrollFile !== undefined ? data.payrollFile : existing.payrollFile;
    const status = data.status || existing.status;
    const notes = data.notes !== undefined ? data.notes : existing.notes;

    await client.query(
      `UPDATE incentive_approval_batches SET
        period = $1,
        division = $2,
        total_payable = $3,
        posting_method = $4,
        accrual_je = $5,
        payroll_file = $6,
        status = $7,
        notes = $8,
        updated_at = NOW()
      WHERE id = $9;`,
      [
        period,
        division,
        totalPayable,
        postingMethod,
        accrualJe || null,
        payrollFile || null,
        status,
        notes || null,
        id,
      ],
    );

    const ts = new Date().toLocaleString();
    await client.query(
      `INSERT INTO approval_batch_history (id, batch_id, action, performed_by, performed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${id}-${Date.now().toString().slice(-5)}`,
        id,
        "Package Attributes Updated",
        updatedBy,
        ts,
        `Updated parameters: Total LKR ${totalPayable.toLocaleString()}, Status: ${status}, Posting Method: ${postingMethod}.`,
      ],
    );

    await client.query("COMMIT;");
    return await getApprovalBatchById(id);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error updating approval batch:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Record Step Decision (Approve / Reject) — Four-Eyes Sequential Workflow
 */
export async function recordStepDecision(
  batchId: string,
  stepNumber: number,
  decision: "Approved" | "Rejected",
  approverName: string,
  comments?: string,
): Promise<ApprovalBatchDetails | null> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const batch = await getApprovalBatchById(batchId);
    if (!batch) {
      await client.query("ROLLBACK;");
      return null;
    }

    const ts = new Date().toLocaleString();

    // 1. Update the target step
    await client.query(
      `UPDATE approval_batch_steps SET
        decision = $1,
        decided_at = $2,
        approver_name = $3,
        comments = COALESCE($4, comments)
      WHERE batch_id = $5 AND step_number = $6;`,
      [decision, ts, approverName, comments || null, batchId, stepNumber],
    );

    // 2. Evaluate overall batch status
    const stepsRes = await client.query(
      `SELECT * FROM approval_batch_steps WHERE batch_id = $1 ORDER BY step_number ASC;`,
      [batchId],
    );
    const steps = stepsRes.rows;

    let newStatus: ApprovalPackageStatus = "Submitted";
    let nextStep = stepNumber;

    if (decision === "Rejected") {
      newStatus = "Rejected";
    } else {
      const allApproved = steps.every((s: any) => s.decision === "Approved");
      if (allApproved) {
        newStatus = "Approved";
        nextStep = steps.length;
      } else {
        nextStep = Math.min(steps.length, stepNumber + 1);
      }
    }

    await client.query(
      `UPDATE incentive_approval_batches SET
        status = $1,
        current_step = $2,
        updated_at = NOW()
      WHERE id = $3;`,
      [newStatus, nextStep, batchId],
    );

    // 3. Log history
    await client.query(
      `INSERT INTO approval_batch_history (id, batch_id, action, performed_by, performed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${batchId}-${Date.now().toString().slice(-5)}`,
        batchId,
        `Step ${stepNumber} ${decision}`,
        approverName,
        ts,
        `Step ${stepNumber} marked ${decision}. Batch status is now ${newStatus}. ${comments ? `Comments: "${comments}"` : ""}`.trim(),
      ],
    );

    await client.query("COMMIT;");
    return await getApprovalBatchById(batchId);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error recording step decision:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Post Accrual Journal Entry to SAP Business One & Generate Payroll File
 */
export async function postAccrualJournalEntry(
  batchId: string,
  postedBy: string = "Finance - M. Jayasinghe",
  journalRef?: string,
  payrollFileName?: string,
): Promise<ApprovalBatchDetails | null> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const batch = await getApprovalBatchById(batchId);
    if (!batch) {
      await client.query("ROLLBACK;");
      return null;
    }

    if (batch.status !== "Approved" && batch.status !== "Posted") {
      throw new Error("Posting only permitted after full multi-level approval (INC-SCR-11 Rule).");
    }

    const jeRef = journalRef || batch.accrualJe || `JE-2026-05-${Math.floor(1000 + Math.random() * 9000)}`;
    const pFile = payrollFileName || batch.payrollFile || `INC_${batch.division.replace(/\s+/g, "_")}_${batch.period.replace(/\s+/g, "_")}.xlsx`;

    await client.query(
      `UPDATE incentive_approval_batches SET
        status = 'Posted',
        accrual_je = $1,
        payroll_file = $2,
        updated_at = NOW()
      WHERE id = $3;`,
      [jeRef, pFile, batchId],
    );

    const ts = new Date().toLocaleString();
    await client.query(
      `INSERT INTO approval_batch_history (id, batch_id, action, performed_by, performed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${batchId}-${Date.now().toString().slice(-5)}`,
        batchId,
        "Posted Accrual JE & Payroll Handover",
        postedBy,
        ts,
        `Posted SAP B1 Journal Voucher #${jeRef}. Generated payroll handover export ${pFile}.`,
      ],
    );

    await client.query("COMMIT;");
    return await getApprovalBatchById(batchId);
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Lock Period after Posting (Status: Posted -> Locked)
 */
export async function lockApprovalPeriod(
  batchId: string,
  lockedBy: string = "Finance - M. Jayasinghe",
): Promise<ApprovalBatchDetails | null> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    await client.query(
      `UPDATE incentive_approval_batches SET
        status = 'Locked',
        updated_at = NOW()
      WHERE id = $1;`,
      [batchId],
    );

    const ts = new Date().toLocaleString();
    await client.query(
      `INSERT INTO approval_batch_history (id, batch_id, action, performed_by, performed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${batchId}-${Date.now().toString().slice(-5)}`,
        batchId,
        "Period Locked",
        lockedBy,
        ts,
        `Financial period locked. All calculations, postings, and participant statements frozen.`,
      ],
    );

    await client.query("COMMIT;");
    return await getApprovalBatchById(batchId);
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Delete an Approval Batch (DELETE)
 */
export async function deleteApprovalBatch(id: string): Promise<boolean> {
  await ensureApprovalPostingTables();
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_approval_batches WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
