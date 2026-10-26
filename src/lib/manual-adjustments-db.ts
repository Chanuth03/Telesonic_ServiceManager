import { getDbPool } from "./db";

export type AdjustmentType = "Addition" | "Deduction";
export type AdjustmentStatus = "Draft" | "Submitted" | "Approved" | "Rejected";
export type ApprovalDecision = "Pending" | "Approved" | "Rejected";

export interface ApprovalStepItem {
  id: string;
  stepNumber: number;
  roleName: string;
  approverName: string;
  decision: ApprovalDecision;
  decidedAt?: string;
  comments?: string;
}

export interface AdjustmentHistoryItem {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface ManualAdjustmentItem {
  id: string;
  adjustmentNo: string;
  runNo: string;
  participantId: string;
  participantName: string;
  division: string;
  schemeCode: string;
  schemeName: string;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  remarks: string;
  attachment?: string;
  status: AdjustmentStatus;
  requiresCeo: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvals: ApprovalStepItem[];
  history: AdjustmentHistoryItem[];
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 10
 */
export async function ensureManualAdjustmentsTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_manual_adjustments (
      id VARCHAR(64) PRIMARY KEY,
      adjustment_no VARCHAR(64) UNIQUE NOT NULL,
      run_no VARCHAR(64) NOT NULL,
      participant_id VARCHAR(64) NOT NULL,
      participant_name VARCHAR(128) NOT NULL,
      division VARCHAR(64) NOT NULL,
      scheme_code VARCHAR(64) NOT NULL,
      scheme_name VARCHAR(128) NOT NULL,
      adjustment_type VARCHAR(32) NOT NULL DEFAULT 'Addition',
      amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
      reason VARCHAR(255) NOT NULL,
      remarks TEXT NOT NULL,
      attachment VARCHAR(255),
      status VARCHAR(32) NOT NULL DEFAULT 'Draft',
      requires_ceo BOOLEAN NOT NULL DEFAULT FALSE,
      created_by VARCHAR(128) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS manual_adjustment_approvals (
      id VARCHAR(64) PRIMARY KEY,
      adjustment_id VARCHAR(64) NOT NULL REFERENCES incentive_manual_adjustments(id) ON DELETE CASCADE,
      step_number INTEGER NOT NULL,
      role_name VARCHAR(64) NOT NULL,
      approver_name VARCHAR(128) NOT NULL,
      decision VARCHAR(32) NOT NULL DEFAULT 'Pending',
      decided_at VARCHAR(64),
      comments TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS manual_adjustment_history (
      id VARCHAR(64) PRIMARY KEY,
      adjustment_id VARCHAR(64) NOT NULL REFERENCES incentive_manual_adjustments(id) ON DELETE CASCADE,
      action VARCHAR(64) NOT NULL,
      performed_by VARCHAR(128) NOT NULL,
      performed_at VARCHAR(64) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_adj_run_no ON incentive_manual_adjustments(run_no);
    CREATE INDEX IF NOT EXISTS idx_adj_participant ON incentive_manual_adjustments(participant_id);
    CREATE INDEX IF NOT EXISTS idx_adj_status ON incentive_manual_adjustments(status);
    CREATE INDEX IF NOT EXISTS idx_adj_division ON incentive_manual_adjustments(division);
  `);

  // Seed sample rows if table is empty
  const countRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_manual_adjustments;`);
  if (countRes.rows[0].cnt === 0) {
    await pool.query(`
      INSERT INTO incentive_manual_adjustments (
        id, adjustment_no, run_no, participant_id, participant_name, division,
        scheme_code, scheme_name, adjustment_type, amount, reason, remarks,
        attachment, status, requires_ceo, created_by
      ) VALUES
      (
        'ADJ-2026-0041', 'ADJ-2026-0041', 'INC-RUN-2026-04-RLC', 'EMP-1025', 'Nuwan Dias', 'RLC Sales',
        'RLC-REP-PAY', 'Dealer Sales Staff Payment Commission', 'Addition', 6500.00,
        'Receipt realised after cut-off', 'Cheque SL3370 realised 01-May, verified with bank reconciliation.',
        'cheque_slip_sl3370.pdf', 'Submitted', FALSE, 'Lakmal Perera (Incentive Administrator)'
      ),
      (
        'ADJ-2026-0042', 'ADJ-2026-0042', 'RUN-2026-05-PRE-01', 'EMP-1024', 'Dilshan Madusanka', 'RLC Service',
        'RLC-SVC', 'Service Technician Scorecard Incentive', 'Addition', 8000.00,
        'Penalty Waiver (Approved Attendance/Delay)', 'Medical leave approved retrospectively by HR. Unfreezing 40% attendance allowance.',
        'medical_certificate_hr_approval.pdf', 'Approved', FALSE, 'Chaminda Warnakula (Service HOD)'
      ),
      (
        'ADJ-2026-0043', 'ADJ-2026-0043', 'RUN-2026-05-PRE-01', 'EMP-1021', 'Kasun Jayawardena', 'Consumer Electronics',
        'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Addition', 75000.00,
        'Special Performance Bonus', 'Exceeded national quarterly showroom target by 180%. Management discretionary award.',
        'board_performance_approval.pdf', 'Submitted', TRUE, 'Lakmal Perera (Incentive Administrator)'
      ),
      (
        'ADJ-2026-0044', 'ADJ-2026-0044', 'RUN-2026-05-PRE-01', 'EMP-1022', 'Pradeep Bandara', 'Commercial Air Conditioning',
        'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Deduction', 12500.00,
        'Customer Satisfaction Recognition', 'HVAC ducting rework penalty agreed per customer complaint #TKT-CAC-8041.',
        'rework_charge_memo.pdf', 'Draft', FALSE, 'Chaminda Warnakula (Service HOD)'
      )
      ON CONFLICT (id) DO NOTHING;

      -- Approvals for ADJ-2026-0041 (Requirement doc Page 33 exact specimen)
      INSERT INTO manual_adjustment_approvals (
        id, adjustment_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES
      ('appr-041-1', 'ADJ-2026-0041', 1, 'HOD Sales', 'HOD Sales - T. Aloka', 'Approved', '06-May-2026 14:20 IST', 'Verified cheque realization receipt from bank.'),
      ('appr-041-2', 'ADJ-2026-0041', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Pending', NULL, NULL)
      ON CONFLICT (id) DO NOTHING;

      -- Approvals for ADJ-2026-0042 (Approved)
      INSERT INTO manual_adjustment_approvals (
        id, adjustment_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES
      ('appr-042-1', 'ADJ-2026-0042', 1, 'Service HOD', 'Chaminda Warnakula (Service HOD)', 'Approved', '13-May-2026 10:00 IST', 'Medical documentation valid.'),
      ('appr-042-2', 'ADJ-2026-0042', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Approved', '14-May-2026 11:30 IST', 'Signed off for inclusion in final run.')
      ON CONFLICT (id) DO NOTHING;

      -- Approvals for ADJ-2026-0043 (Requires CEO due to > LKR 50,000)
      INSERT INTO manual_adjustment_approvals (
        id, adjustment_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES
      ('appr-043-1', 'ADJ-2026-0043', 1, 'HOD Sales', 'HOD Sales - T. Aloka', 'Approved', '14-May-2026 09:15 IST', 'Recommended for high achiever bonus.'),
      ('appr-043-2', 'ADJ-2026-0043', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Approved', '14-May-2026 14:00 IST', 'Budget verified.'),
      ('appr-043-3', 'ADJ-2026-0043', 3, 'CEO', 'CEO - S. K. Wickramasinghe', 'Pending', NULL, 'Mandatory for adjustments exceeding LKR 50,000.')
      ON CONFLICT (id) DO NOTHING;

      -- Approvals for ADJ-2026-0044 (Draft)
      INSERT INTO manual_adjustment_approvals (
        id, adjustment_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES
      ('appr-044-1', 'ADJ-2026-0044', 1, 'Department HOD', 'Chaminda Warnakula (Service HOD)', 'Pending', NULL, NULL),
      ('appr-044-2', 'ADJ-2026-0044', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Pending', NULL, NULL)
      ON CONFLICT (id) DO NOTHING;

      -- Audit history
      INSERT INTO manual_adjustment_history (
        id, adjustment_id, action, performed_by, performed_at, notes
      ) VALUES
      ('hist-041-1', 'ADJ-2026-0041', 'Created Draft', 'Lakmal Perera (Incentive Administrator)', '05-May-2026 10:15 IST', 'Initial draft prepared.'),
      ('hist-041-2', 'ADJ-2026-0041', 'Submitted for Approval', 'Lakmal Perera (Incentive Administrator)', '05-May-2026 11:30 IST', 'Routed to HOD Sales.'),
      ('hist-041-3', 'ADJ-2026-0041', 'Approved Step 1', 'HOD Sales - T. Aloka', '06-May-2026 14:20 IST', 'Verified cheque realization receipt from bank.'),
      ('hist-042-1', 'ADJ-2026-0042', 'Created & Submitted', 'Chaminda Warnakula', '13-May-2026 09:30 IST', 'HR medical slip attached.'),
      ('hist-042-2', 'ADJ-2026-0042', 'Approved Final', 'Finance - M. Jayasinghe', '14-May-2026 11:30 IST', 'Fully approved.')
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get all Manual Adjustments from PostgreSQL
 */
export async function getAllManualAdjustments(filters?: {
  runNo?: string | undefined;
  division?: string | undefined;
  status?: string | undefined;
  type?: string | undefined;
  participantId?: string | undefined;
  search?: string | undefined;
}): Promise<ManualAdjustmentItem[]> {
  await ensureManualAdjustmentsTables();
  const pool = getDbPool();

  let sql = `SELECT * FROM incentive_manual_adjustments WHERE 1=1`;
  const params: any[] = [];

  if (filters?.runNo && filters.runNo !== "All") {
    params.push(filters.runNo);
    sql += ` AND run_no = $${params.length}`;
  }
  if (filters?.division && filters.division !== "All Divisions") {
    params.push(filters.division);
    sql += ` AND division = $${params.length}`;
  }
  if (filters?.status && filters.status !== "All") {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  if (filters?.type && filters.type !== "All") {
    params.push(filters.type);
    sql += ` AND adjustment_type = $${params.length}`;
  }
  if (filters?.participantId) {
    params.push(filters.participantId);
    sql += ` AND participant_id = $${params.length}`;
  }
  if (filters?.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    params.push(q);
    sql += ` AND (LOWER(adjustment_no) LIKE $${params.length} OR LOWER(participant_name) LIKE $${params.length} OR LOWER(reason) LIKE $${params.length} OR LOWER(run_no) LIKE $${params.length})`;
  }

  sql += ` ORDER BY created_at DESC;`;

  const res = await pool.query(sql, params);
  const rows = res.rows || [];

  const adjustments: ManualAdjustmentItem[] = [];

  for (const r of rows) {
    // Approvals
    const appRes = await pool.query(
      `SELECT * FROM manual_adjustment_approvals WHERE adjustment_id = $1 ORDER BY step_number ASC;`,
      [r.id],
    );
    const approvals: ApprovalStepItem[] = appRes.rows.map((a) => ({
      id: a.id,
      stepNumber: a.step_number,
      roleName: a.role_name,
      approverName: a.approver_name,
      decision: a.decision as ApprovalDecision,
      decidedAt: a.decided_at || undefined,
      comments: a.comments || undefined,
    }));

    // History
    const histRes = await pool.query(
      `SELECT * FROM manual_adjustment_history WHERE adjustment_id = $1 ORDER BY created_at ASC;`,
      [r.id],
    );
    const history: AdjustmentHistoryItem[] = histRes.rows.map((h) => ({
      id: h.id,
      action: h.action,
      performedBy: h.performed_by,
      performedAt: h.performed_at,
      notes: h.notes || undefined,
    }));

    adjustments.push({
      id: r.id,
      adjustmentNo: r.adjustment_no,
      runNo: r.run_no,
      participantId: r.participant_id,
      participantName: r.participant_name,
      division: r.division,
      schemeCode: r.scheme_code,
      schemeName: r.scheme_name,
      adjustmentType: r.adjustment_type as AdjustmentType,
      amount: parseFloat(r.amount) || 0,
      reason: r.reason,
      remarks: r.remarks,
      attachment: r.attachment || undefined,
      status: r.status as AdjustmentStatus,
      requiresCeo: Boolean(r.requires_ceo),
      createdBy: r.created_by,
      createdAt: formatDateTime(r.created_at),
      updatedAt: formatDateTime(r.updated_at),
      approvals,
      history,
    });
  }

  return adjustments;
}

/**
 * Get Manual Adjustment by ID
 */
export async function getManualAdjustmentById(id: string): Promise<ManualAdjustmentItem | null> {
  await ensureManualAdjustmentsTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_manual_adjustments WHERE id = $1;`, [id]);
  if (!res.rows || res.rows.length === 0) return null;

  const r = res.rows[0];

  const appRes = await pool.query(
    `SELECT * FROM manual_adjustment_approvals WHERE adjustment_id = $1 ORDER BY step_number ASC;`,
    [r.id],
  );
  const approvals: ApprovalStepItem[] = appRes.rows.map((a) => ({
    id: a.id,
    stepNumber: a.step_number,
    roleName: a.role_name,
    approverName: a.approver_name,
    decision: a.decision as ApprovalDecision,
    decidedAt: a.decided_at || undefined,
    comments: a.comments || undefined,
  }));

  const histRes = await pool.query(
    `SELECT * FROM manual_adjustment_history WHERE adjustment_id = $1 ORDER BY created_at ASC;`,
    [r.id],
  );
  const history: AdjustmentHistoryItem[] = histRes.rows.map((h) => ({
    id: h.id,
    action: h.action,
    performedBy: h.performed_by,
    performedAt: h.performed_at,
    notes: h.notes || undefined,
  }));

  return {
    id: r.id,
    adjustmentNo: r.adjustment_no,
    runNo: r.run_no,
    participantId: r.participant_id,
    participantName: r.participant_name,
    division: r.division,
    schemeCode: r.scheme_code,
    schemeName: r.scheme_name,
    adjustmentType: r.adjustment_type as AdjustmentType,
    amount: parseFloat(r.amount) || 0,
    reason: r.reason,
    remarks: r.remarks,
    attachment: r.attachment || undefined,
    status: r.status as AdjustmentStatus,
    requiresCeo: Boolean(r.requires_ceo),
    createdBy: r.created_by,
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
    approvals,
    history,
  };
}

/**
 * Create a new Manual Adjustment (CREATE)
 */
export async function createManualAdjustment(data: {
  id?: string;
  adjustmentNo?: string;
  runNo: string;
  participantId: string;
  participantName: string;
  division?: string;
  schemeCode: string;
  schemeName?: string;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  remarks: string;
  attachment?: string;
  status?: AdjustmentStatus;
  createdBy?: string;
}): Promise<ManualAdjustmentItem> {
  await ensureManualAdjustmentsTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const id = data.id || data.adjustmentNo || `ADJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const adjustmentNo = data.adjustmentNo || id;
    const amount = Number(data.amount) || 0;
    const requiresCeo = amount > 50000;
    const status: AdjustmentStatus = data.status || "Draft";
    const createdBy = data.createdBy || "Lakmal Perera (Incentive Administrator)";
    const division = data.division || "All Divisions";
    const schemeName = data.schemeName || data.schemeCode;

    await client.query(
      `INSERT INTO incentive_manual_adjustments (
        id, adjustment_no, run_no, participant_id, participant_name, division,
        scheme_code, scheme_name, adjustment_type, amount, reason, remarks,
        attachment, status, requires_ceo, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
      [
        id,
        adjustmentNo,
        data.runNo,
        data.participantId,
        data.participantName,
        division,
        data.schemeCode,
        schemeName,
        data.adjustmentType,
        amount,
        data.reason,
        data.remarks,
        data.attachment || null,
        status,
        requiresCeo,
        createdBy,
      ],
    );

    // Build standard multi-tier approval steps
    // Step 1: Department HOD
    await client.query(
      `INSERT INTO manual_adjustment_approvals (
        id, adjustment_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `appr-${id}-1`,
        id,
        1,
        "Department HOD",
        division.includes("Service") ? "Chaminda Warnakula (Service HOD)" : "HOD Sales - T. Aloka",
        status === "Approved" ? "Approved" : "Pending",
        status === "Approved" ? new Date().toISOString() : null,
        null,
      ],
    );

    // Step 2: Finance Manager
    await client.query(
      `INSERT INTO manual_adjustment_approvals (
        id, adjustment_id, step_number, role_name, approver_name, decision, decided_at, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `appr-${id}-2`,
        id,
        2,
        "Finance Manager",
        "Finance - M. Jayasinghe",
        status === "Approved" ? "Approved" : "Pending",
        status === "Approved" ? new Date().toISOString() : null,
        null,
      ],
    );

    // Step 3: CEO (if amount exceeds threshold)
    if (requiresCeo) {
      await client.query(
        `INSERT INTO manual_adjustment_approvals (
          id, adjustment_id, step_number, role_name, approver_name, decision, decided_at, comments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          `appr-${id}-3`,
          id,
          3,
          "CEO / Executive Director",
          "CEO - S. K. Wickramasinghe",
          status === "Approved" ? "Approved" : "Pending",
          status === "Approved" ? new Date().toISOString() : null,
          "Mandatory review for adjustment amounts exceeding LKR 50,000 threshold.",
        ],
      );
    }

    // Initial audit history
    const ts = new Date().toLocaleString();
    await client.query(
      `INSERT INTO manual_adjustment_history (
        id, adjustment_id, action, performed_by, performed_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${id}-1`,
        id,
        status === "Submitted" ? "Created & Submitted" : "Created Draft",
        createdBy,
        ts,
        `Adjustment ${adjustmentNo} of LKR ${amount.toLocaleString()} created for ${data.participantName}. Reason: ${data.reason}.`,
      ],
    );

    await client.query("COMMIT;");
    const created = await getManualAdjustmentById(id);
    return created!;
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error creating manual adjustment:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update an existing Manual Adjustment (UPDATE)
 */
export async function updateManualAdjustment(
  id: string,
  data: Partial<ManualAdjustmentItem>,
  updatedBy: string = "Incentive Administrator",
): Promise<ManualAdjustmentItem | null> {
  await ensureManualAdjustmentsTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const existing = await getManualAdjustmentById(id);
    if (!existing) {
      await client.query("ROLLBACK;");
      return null;
    }

    const runNo = data.runNo || existing.runNo;
    const participantId = data.participantId || existing.participantId;
    const participantName = data.participantName || existing.participantName;
    const division = data.division || existing.division;
    const schemeCode = data.schemeCode || existing.schemeCode;
    const schemeName = data.schemeName || existing.schemeName;
    const adjustmentType = data.adjustmentType || existing.adjustmentType;
    const amount = data.amount !== undefined ? Number(data.amount) : existing.amount;
    const reason = data.reason || existing.reason;
    const remarks = data.remarks !== undefined ? data.remarks : existing.remarks;
    const attachment = data.attachment !== undefined ? data.attachment : existing.attachment;
    const status = data.status || existing.status;
    const requiresCeo = amount > 50000;

    await client.query(
      `UPDATE incentive_manual_adjustments SET
        run_no = $1,
        participant_id = $2,
        participant_name = $3,
        division = $4,
        scheme_code = $5,
        scheme_name = $6,
        adjustment_type = $7,
        amount = $8,
        reason = $9,
        remarks = $10,
        attachment = $11,
        status = $12,
        requires_ceo = $13,
        updated_at = NOW()
      WHERE id = $14;`,
      [
        runNo,
        participantId,
        participantName,
        division,
        schemeCode,
        schemeName,
        adjustmentType,
        amount,
        reason,
        remarks,
        attachment,
        status,
        requiresCeo,
        id,
      ],
    );

    // Audit History log
    const ts = new Date().toLocaleString();
    await client.query(
      `INSERT INTO manual_adjustment_history (
        id, adjustment_id, action, performed_by, performed_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${id}-${Date.now().toString().slice(-5)}`,
        id,
        "Record Updated",
        updatedBy,
        ts,
        `Updated parameters: Amount LKR ${amount.toLocaleString()}, Reason: ${reason}. Status: ${status}.`,
      ],
    );

    await client.query("COMMIT;");
    return await getManualAdjustmentById(id);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error updating manual adjustment:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Delete a Manual Adjustment (DELETE)
 */
export async function deleteManualAdjustment(id: string): Promise<boolean> {
  await ensureManualAdjustmentsTables();
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_manual_adjustments WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Submit Adjustment for Approval (Status Transition: Draft -> Submitted)
 */
export async function submitAdjustmentForApproval(
  id: string,
  submittedBy: string = "Lakmal Perera (Incentive Administrator)",
): Promise<ManualAdjustmentItem | null> {
  await ensureManualAdjustmentsTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    await client.query(
      `UPDATE incentive_manual_adjustments SET status = 'Submitted', updated_at = NOW() WHERE id = $1;`,
      [id],
    );

    const ts = new Date().toLocaleString();
    await client.query(
      `INSERT INTO manual_adjustment_history (
        id, adjustment_id, action, performed_by, performed_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${id}-${Date.now().toString().slice(-5)}`,
        id,
        "Submitted for Approval",
        submittedBy,
        ts,
        `Adjustment submitted for multi-tier maker-checker verification.`,
      ],
    );

    await client.query("COMMIT;");
    return await getManualAdjustmentById(id);
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Decide an Approval Step (Approve / Reject)
 */
export async function decideApprovalStep(
  adjustmentId: string,
  stepNumber: number,
  decision: "Approved" | "Rejected",
  approverName: string,
  comments?: string,
): Promise<ManualAdjustmentItem | null> {
  await ensureManualAdjustmentsTables();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const ts = new Date().toLocaleString();

    // 1. Update the approval step row
    await client.query(
      `UPDATE manual_adjustment_approvals SET
        decision = $1,
        decided_at = $2,
        approver_name = $3,
        comments = COALESCE($4, comments)
      WHERE adjustment_id = $5 AND step_number = $6;`,
      [decision, ts, approverName, comments || null, adjustmentId, stepNumber],
    );

    // 2. Fetch all steps to check overall status
    const stepsRes = await client.query(
      `SELECT * FROM manual_adjustment_approvals WHERE adjustment_id = $1 ORDER BY step_number ASC;`,
      [adjustmentId],
    );
    const steps = stepsRes.rows;

    let overallStatus: AdjustmentStatus = "Submitted";

    if (decision === "Rejected") {
      overallStatus = "Rejected";
    } else {
      const allApproved = steps.every((s: any) => s.decision === "Approved");
      if (allApproved) {
        overallStatus = "Approved";
      }
    }

    await client.query(
      `UPDATE incentive_manual_adjustments SET status = $1, updated_at = NOW() WHERE id = $2;`,
      [overallStatus, adjustmentId],
    );

    // 3. Log history
    await client.query(
      `INSERT INTO manual_adjustment_history (
        id, adjustment_id, action, performed_by, performed_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `hist-${adjustmentId}-${Date.now().toString().slice(-5)}`,
        adjustmentId,
        `Step ${stepNumber} ${decision}`,
        approverName,
        ts,
        `Decision: ${decision}. Overall status is now ${overallStatus}. ${comments ? `Remarks: "${comments}"` : ""}`.trim(),
      ],
    );

    await client.query("COMMIT;");
    return await getManualAdjustmentById(adjustmentId);
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
}
