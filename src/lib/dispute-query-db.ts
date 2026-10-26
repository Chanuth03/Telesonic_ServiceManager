import { getDbPool } from "./db";

export type DisputeStatus = "New" | "Under Investigation" | "Approved" | "Resolved" | "Rejected";
export type DisputePriority = "Critical" | "High" | "Medium" | "Low";

export interface DisputeRecord {
  id: string;
  disputeNo: string;
  participantId: string;
  salesCode?: string;
  participantName: string;
  designation: string;
  division: string;
  period: string;
  statementRef?: string;
  category: string;
  priority: DisputePriority;
  claimedAmount: number;
  approvedAmount: number;
  status: DisputeStatus;
  description: string;
  investigationNotes?: string;
  resolutionAction?: string;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 14 (Dispute & Query Resolution Log)
 */
export async function ensureDisputeTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_disputes (
      id VARCHAR(64) PRIMARY KEY,
      dispute_no VARCHAR(64) UNIQUE NOT NULL,
      participant_id VARCHAR(64) NOT NULL,
      sales_code VARCHAR(64),
      participant_name VARCHAR(128) NOT NULL,
      designation VARCHAR(128) NOT NULL,
      division VARCHAR(128) NOT NULL,
      period VARCHAR(64) NOT NULL,
      statement_ref VARCHAR(64),
      category VARCHAR(128) NOT NULL,
      priority VARCHAR(32) NOT NULL DEFAULT 'Medium',
      claimed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      approved_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      status VARCHAR(32) NOT NULL DEFAULT 'New',
      description TEXT NOT NULL,
      investigation_notes TEXT,
      resolution_action TEXT,
      assigned_to VARCHAR(128),
      resolved_by VARCHAR(128),
      resolved_at VARCHAR(64),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_disp_part ON incentive_disputes(participant_id);
    CREATE INDEX IF NOT EXISTS idx_disp_period ON incentive_disputes(period);
    CREATE INDEX IF NOT EXISTS idx_disp_status ON incentive_disputes(status);
  `);

  // Seed sample rows if table is empty
  const countRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_disputes;`);
  if (countRes.rows[0].cnt === 0) {
    await pool.query(`
      INSERT INTO incentive_disputes (
        id, dispute_no, participant_id, sales_code, participant_name, designation, division,
        period, statement_ref, category, priority, claimed_amount, approved_amount, status,
        description, investigation_notes, resolution_action, assigned_to, resolved_by, resolved_at
      ) VALUES
      (
        'DSP-2026-04-001', 'DSP-2026-04-001', 'EMP-1025', '025', 'Thisara Tharanga',
        'Sales Executive - Dealer Seg 01', 'RLC Sales', 'April 2026', 'SLIP-2026-04-025',
        'Receipt Realisation Timing', 'High', 12500.00, 12500.00, 'Resolved',
        'Invoice INV-8821 realised on April 28 (within 45-day credit window) but flagged as overdue debtors penalty.',
        'Finance ledger audit confirmed bank slip verified on 28-Apr-2026. Realisation within 45 days.',
        'Credit adjustment ADJ-2026-0048 generated for LKR 12,500.00; will be paid with May 2026 payout run.',
        'Dilani Silva (Finance)', 'Finance - M. Jayasinghe', '02-May-2026 14:15'
      ),
      (
        'DSP-2026-04-002', 'DSP-2026-04-002', 'EMP-1024', 'SVC-102', 'Dilshan Madusanka',
        'Service Technician', 'RLC Service', 'May 2026', 'SLIP-2026-05-102',
        'Attendance Penalty Waiver', 'Medium', 8000.00, 8000.00, 'Approved',
        'Attendance penalty of LKR 8,000 deducted for 24-Apr. Technician was dispatched on emergency off-site hospital repair in Kandy.',
        'Service head confirmed emergency work order SR-KND-091 completed on site with client sign-off.',
        'Waiver approved by HR and Service HOD. To be credited in next disbursement.',
        'Kavindu Perera (Operations)', 'Chaminda Warnakula (Service HOD)', '05-May-2026 10:30'
      ),
      (
        'DSP-2026-04-003', 'DSP-2026-04-003', 'EMP-1044', '044', 'Ishara Fernando',
        'Sales Executive', 'RLC Sales', 'April 2026', 'SLIP-2026-04-044',
        'Debtor Clawback Discrepancy', 'High', 7258.00, 0.00, 'Under Investigation',
        'LKR 7,258 penalty clawback applied for customer dealer cheque dishonour. Client replaced with cash receipt within 48 hours.',
        'Cross-verifying bank slip deposit date and receipt voucher RV-7719 with Commercial Bank branch statement.',
        'Pending confirmation of final cash receipt timestamp from Accounts.',
        'Dilani Silva (Finance)', NULL, NULL
      ),
      (
        'DSP-2026-05-004', 'DSP-2026-05-004', 'EMP-1031', '031', 'Nuwan Dias',
        'Sales Executive - Dealer Seg 02', 'RLC Sales', 'May 2026', 'SLIP-2026-04-031',
        'Slab Tier Threshold Query', 'Medium', 4000.00, 0.00, 'New',
        'Incentive calculation applied Tier 6 Volume slab instead of Tier 7 slab. Total volume achieved was 152 units.',
        NULL, NULL, 'Unassigned', NULL, NULL
      )
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get All Disputes (READ)
 */
export async function getAllDisputes(filters?: {
  period?: string | undefined;
  division?: string | undefined;
  status?: string | undefined;
  priority?: string | undefined;
  participantId?: string | undefined;
  search?: string | undefined;
}): Promise<DisputeRecord[]> {
  await ensureDisputeTables();
  const pool = getDbPool();

  let sql = `SELECT * FROM incentive_disputes WHERE 1=1`;
  const params: any[] = [];

  if (filters?.period && filters.period !== "All") {
    params.push(filters.period);
    sql += ` AND period = $${params.length}`;
  }

  if (filters?.division && filters.division !== "All") {
    params.push(filters.division);
    sql += ` AND division = $${params.length}`;
  }

  if (filters?.status && filters.status !== "All") {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }

  if (filters?.priority && filters.priority !== "All") {
    params.push(filters.priority);
    sql += ` AND priority = $${params.length}`;
  }

  if (filters?.participantId && filters.participantId !== "All") {
    params.push(filters.participantId);
    sql += ` AND participant_id = $${params.length}`;
  }

  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    params.push(q);
    sql += ` AND (
      dispute_no ILIKE $${params.length} OR
      participant_name ILIKE $${params.length} OR
      sales_code ILIKE $${params.length} OR
      category ILIKE $${params.length} OR
      description ILIKE $${params.length} OR
      statement_ref ILIKE $${params.length}
    )`;
  }

  sql += ` ORDER BY created_at DESC;`;

  const res = await pool.query(sql, params);
  return res.rows.map((r: any) => ({
    id: r.id,
    disputeNo: r.dispute_no,
    participantId: r.participant_id,
    salesCode: r.sales_code || "",
    participantName: r.participant_name,
    designation: r.designation,
    division: r.division,
    period: r.period,
    statementRef: r.statement_ref || "",
    category: r.category,
    priority: r.priority as DisputePriority,
    claimedAmount: parseFloat(r.claimed_amount) || 0,
    approvedAmount: parseFloat(r.approved_amount) || 0,
    status: r.status as DisputeStatus,
    description: r.description,
    investigationNotes: r.investigation_notes || "",
    resolutionAction: r.resolution_action || "",
    assignedTo: r.assigned_to || "",
    resolvedBy: r.resolved_by || "",
    resolvedAt: r.resolved_at || "",
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  }));
}

/**
 * Get Single Dispute By ID
 */
export async function getDisputeById(id: string): Promise<DisputeRecord | null> {
  await ensureDisputeTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_disputes WHERE id = $1;`, [id]);
  if (res.rows.length === 0) return null;
  const r = res.rows[0];

  return {
    id: r.id,
    disputeNo: r.dispute_no,
    participantId: r.participant_id,
    salesCode: r.sales_code || "",
    participantName: r.participant_name,
    designation: r.designation,
    division: r.division,
    period: r.period,
    statementRef: r.statement_ref || "",
    category: r.category,
    priority: r.priority as DisputePriority,
    claimedAmount: parseFloat(r.claimed_amount) || 0,
    approvedAmount: parseFloat(r.approved_amount) || 0,
    status: r.status as DisputeStatus,
    description: r.description,
    investigationNotes: r.investigation_notes || "",
    resolutionAction: r.resolution_action || "",
    assignedTo: r.assigned_to || "",
    resolvedBy: r.resolved_by || "",
    resolvedAt: r.resolved_at || "",
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  };
}

/**
 * Create Dispute (CREATE)
 */
export async function createDispute(data: {
  id?: string;
  disputeNo?: string;
  participantId: string;
  salesCode?: string;
  participantName: string;
  designation?: string;
  division?: string;
  period?: string;
  statementRef?: string;
  category: string;
  priority?: DisputePriority;
  claimedAmount: number;
  approvedAmount?: number;
  status?: DisputeStatus;
  description: string;
  investigationNotes?: string;
  resolutionAction?: string;
  assignedTo?: string;
}): Promise<DisputeRecord> {
  await ensureDisputeTables();
  const pool = getDbPool();

  const id = data.id || `DSP-${Date.now()}`;
  const disputeNo = data.disputeNo || `DSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const designation = data.designation || "Sales Representative";
  const division = data.division || "RLC Sales";
  const period = data.period || "April 2026";
  const priority = data.priority || "Medium";
  const claimedAmount = Number(data.claimedAmount) || 0;
  const approvedAmount = Number(data.approvedAmount) || 0;
  const status = data.status || "New";

  await pool.query(
    `INSERT INTO incentive_disputes (
      id, dispute_no, participant_id, sales_code, participant_name, designation, division,
      period, statement_ref, category, priority, claimed_amount, approved_amount, status,
      description, investigation_notes, resolution_action, assigned_to
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`,
    [
      id,
      disputeNo,
      data.participantId,
      data.salesCode || null,
      data.participantName,
      designation,
      division,
      period,
      data.statementRef || null,
      data.category,
      priority,
      claimedAmount,
      approvedAmount,
      status,
      data.description,
      data.investigationNotes || null,
      data.resolutionAction || null,
      data.assignedTo || "Unassigned",
    ],
  );

  const created = await getDisputeById(id);
  if (!created) {
    throw new Error(`Failed to create dispute ${id}`);
  }
  return created;
}

/**
 * Update Dispute (UPDATE)
 */
export async function updateDispute(
  id: string,
  data: Partial<DisputeRecord>,
): Promise<DisputeRecord> {
  await ensureDisputeTables();
  const pool = getDbPool();

  const existing = await getDisputeById(id);
  if (!existing) {
    throw new Error(`Dispute ${id} not found.`);
  }

  const category = data.category || existing.category;
  const priority = data.priority || existing.priority;
  const claimedAmount = data.claimedAmount !== undefined ? Number(data.claimedAmount) : existing.claimedAmount;
  const approvedAmount = data.approvedAmount !== undefined ? Number(data.approvedAmount) : existing.approvedAmount;
  const status = data.status || existing.status;
  const description = data.description || existing.description;
  const investigationNotes = data.investigationNotes !== undefined ? data.investigationNotes : existing.investigationNotes;
  const resolutionAction = data.resolutionAction !== undefined ? data.resolutionAction : existing.resolutionAction;
  const assignedTo = data.assignedTo !== undefined ? data.assignedTo : existing.assignedTo;
  const resolvedBy = data.resolvedBy !== undefined ? data.resolvedBy : existing.resolvedBy;
  const resolvedAt = data.resolvedAt !== undefined ? data.resolvedAt : existing.resolvedAt;

  await pool.query(
    `UPDATE incentive_disputes SET
      category = $1,
      priority = $2,
      claimed_amount = $3,
      approved_amount = $4,
      status = $5,
      description = $6,
      investigation_notes = $7,
      resolution_action = $8,
      assigned_to = $9,
      resolved_by = $10,
      resolved_at = $11,
      updated_at = NOW()
    WHERE id = $12;`,
    [
      category,
      priority,
      claimedAmount,
      approvedAmount,
      status,
      description,
      investigationNotes,
      resolutionAction,
      assignedTo,
      resolvedBy,
      resolvedAt,
      id,
    ],
  );

  const updated = await getDisputeById(id);
  if (!updated) {
    throw new Error(`Dispute ${id} not found after update.`);
  }
  return updated;
}

/**
 * Resolve Dispute (Approve / Reject workflow)
 */
export async function resolveDispute(
  id: string,
  resolution: {
    status: DisputeStatus;
    approvedAmount?: number;
    resolutionAction: string;
    investigationNotes?: string;
    resolvedBy?: string;
  },
): Promise<DisputeRecord> {
  await ensureDisputeTables();
  const pool = getDbPool();

  const existing = await getDisputeById(id);
  if (!existing) {
    throw new Error(`Dispute ${id} not found.`);
  }

  const resolvedAt = new Date().toLocaleString();
  const approvedAmount = resolution.approvedAmount !== undefined ? Number(resolution.approvedAmount) : existing.approvedAmount;
  const resolvedBy = resolution.resolvedBy || "Nimal Perera (Service Manager)";

  await pool.query(
    `UPDATE incentive_disputes SET
      status = $1,
      approved_amount = $2,
      resolution_action = $3,
      investigation_notes = COALESCE($4, investigation_notes),
      resolved_by = $5,
      resolved_at = $6,
      updated_at = NOW()
    WHERE id = $7;`,
    [
      resolution.status,
      approvedAmount,
      resolution.resolutionAction,
      resolution.investigationNotes || null,
      resolvedBy,
      resolvedAt,
      id,
    ],
  );

  const updated = await getDisputeById(id);
  if (!updated) {
    throw new Error(`Dispute ${id} not found after resolution.`);
  }
  return updated;
}

/**
 * Delete Dispute (DELETE)
 */
export async function deleteDispute(id: string): Promise<boolean> {
  await ensureDisputeTables();
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_disputes WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
