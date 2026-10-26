import { getDbPool } from "./db";

export type AuditEntityType =
  | "Scheme Master"
  | "Rate Matrix"
  | "Target & Quota"
  | "Participant Profile"
  | "Calculation Run"
  | "Manual Adjustment"
  | "Multi-Level Approval"
  | "GL Posting"
  | "Penalty & Clawback"
  | "Dispute Resolution"
  | "System Security";

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "VERSION_BUMP"
  | "APPROVE"
  | "REJECT"
  | "CALCULATE"
  | "POST_GL"
  | "LOCK_PERIOD"
  | "WAIVE"
  | "OVERRIDE";

export type AuditSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type VerificationStatus = "Verified" | "Under Review" | "Flagged";

export interface IncentiveAuditLogItem {
  id: string;
  timestamp: string;
  entityType: AuditEntityType;
  entityId: string;
  actionType: AuditActionType;
  performedBy: string;
  role: string;
  terminalIp: string;
  severity: AuditSeverity;
  oldValue?: string | undefined;
  newValue?: string | undefined;
  diffSummary: string;
  versionTag?: string | undefined;
  verificationStatus: VerificationStatus;
  auditorNotes?: string | undefined;
  hashChecksum: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogFilter {
  entityType?: AuditEntityType | "All" | undefined;
  actionType?: AuditActionType | "All" | undefined;
  severity?: AuditSeverity | "All" | undefined;
  verificationStatus?: VerificationStatus | "All" | undefined;
  performedBy?: string | undefined;
  search?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

// Generate simple mock SHA-256-like integrity hash
function generateChecksum(id: string, entity: string, action: string, user: string): string {
  const raw = `${id}:${entity}:${action}:${user}:${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return "SHA256:" + Math.abs(hash).toString(16).padStart(16, "0") + "ea819f0";
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 18: Audit Trail & Scheme Revision History
 */
export async function ensureAuditTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      entity_type VARCHAR(64) NOT NULL,
      entity_id VARCHAR(64) NOT NULL,
      action_type VARCHAR(32) NOT NULL,
      performed_by VARCHAR(128) NOT NULL,
      role VARCHAR(64) NOT NULL,
      terminal_ip VARCHAR(64) NOT NULL DEFAULT '172.16.0.201',
      severity VARCHAR(16) NOT NULL DEFAULT 'INFO',
      old_value TEXT,
      new_value TEXT,
      diff_summary TEXT NOT NULL,
      version_tag VARCHAR(32),
      verification_status VARCHAR(32) NOT NULL DEFAULT 'Verified',
      auditor_notes TEXT,
      hash_checksum VARCHAR(128) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_entity ON incentive_audit_logs (entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON incentive_audit_logs (action_type);
    CREATE INDEX IF NOT EXISTS idx_audit_time ON incentive_audit_logs (timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_status ON incentive_audit_logs (verification_status);
  `);

  const countRes = await pool.query(`SELECT COUNT(*) FROM incentive_audit_logs;`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    const seeds = [
      {
        id: "AUD-2026-04-001",
        timestamp: "2026-04-01 09:15:22",
        entityType: "Scheme Master",
        entityId: "SCH-RLC-001",
        actionType: "VERSION_BUMP",
        performedBy: "Bandhan Senaratne (HOD Sales)",
        role: "HOD Sales",
        terminalIp: "172.16.0.45",
        severity: "HIGH",
        oldValue: JSON.stringify({ version: "v1.0", effectiveTo: "2026-03-31", status: "Active" }),
        newValue: JSON.stringify({ version: "v1.1", effectiveFrom: "2026-04-01", status: "Active" }),
        diffSummary: "Scheme revision v1.1 activated. Split ratio revised for multi-technician pool from 60/40 to 50/50 per HR circular.",
        versionTag: "v1.0 → v1.1",
        verificationStatus: "Verified",
        auditorNotes: "Authorized under Executive Committee approval ref: EXC-2026-03-29.",
        hashChecksum: "SHA256:8f41e0b9c23178ea819f0",
      },
      {
        id: "AUD-2026-04-002",
        timestamp: "2026-04-02 11:30:10",
        entityType: "Rate Matrix",
        entityId: "MAT-RLC-2026",
        actionType: "UPDATE",
        performedBy: "Nimal Perera (Finance Manager)",
        role: "Finance Manager",
        terminalIp: "172.16.0.201",
        severity: "MEDIUM",
        oldValue: JSON.stringify({ bracket_46_60: 2.5 }),
        newValue: JSON.stringify({ bracket_46_60: 2.96 }),
        diffSummary: "Adjusted payment collection commission rate for Solar capacity band > 10kW to 2.96% for 46-60d debtor age.",
        versionTag: "v2.0",
        verificationStatus: "Verified",
        auditorNotes: "Verified against pricing committee circular 2026/04.",
        hashChecksum: "SHA256:3a91f4d0c11547ea819f0",
      },
      {
        id: "AUD-2026-04-003",
        timestamp: "2026-04-05 14:20:00",
        entityType: "Target & Quota",
        entityId: "TGT-2026-04-RLC",
        actionType: "APPROVE",
        performedBy: "Nihal Fernando (HOD Sales)",
        role: "HOD Sales",
        terminalIp: "172.16.0.82",
        severity: "MEDIUM",
        oldValue: JSON.stringify({ status: "Draft", targetPool: 24000000 }),
        newValue: JSON.stringify({ status: "Approved", targetPool: 24500000 }),
        diffSummary: "Approved April 2026 monthly sales target entry for 42 sales executives across 4 regions.",
        versionTag: "v1.0",
        verificationStatus: "Verified",
        auditorNotes: "Approved target figures match annual operating plan (AOP) quotas.",
        hashChecksum: "SHA256:c221e9b8f04123ea819f0",
      },
      {
        id: "AUD-2026-04-004",
        timestamp: "2026-04-15 16:45:00",
        entityType: "Calculation Run",
        entityId: "INC-RUN-2026-04-RLC",
        actionType: "CALCULATE",
        performedBy: "System Automation (Batch Engine)",
        role: "Incentive Administrator",
        terminalIp: "127.0.0.1",
        severity: "INFO",
        oldValue: null,
        newValue: JSON.stringify({ participants: 34, grossIncentive: 3745200, netPayable: 3438670 }),
        diffSummary: "Official batch calculation executed for April 2026. Realised receipt commissions computed with 3-month lag.",
        versionTag: "Batch-01",
        verificationStatus: "Verified",
        auditorNotes: "Automated batch run completed with 0 exceptions.",
        hashChecksum: "SHA256:4d88e1a2f30999ea819f0",
      },
      {
        id: "AUD-2026-04-005",
        timestamp: "2026-04-18 10:05:40",
        entityType: "Manual Adjustment",
        entityId: "ADJ-2026-04-001",
        actionType: "APPROVE",
        performedBy: "Kamal Wijeratne (HOD Service)",
        role: "HOD Service",
        terminalIp: "172.16.0.60",
        severity: "HIGH",
        oldValue: JSON.stringify({ status: "Pending", amount: 15000 }),
        newValue: JSON.stringify({ status: "Approved", amount: 15000, approver: "Kamal Wijeratne" }),
        diffSummary: "Manual bonus claim approved for Senior Technician Chathura (EMP-018) for exceptional offshore installation.",
        versionTag: "ADJ-001",
        verificationStatus: "Verified",
        auditorNotes: "Dual sign-off confirmed by HOD Service and Finance.",
        hashChecksum: "SHA256:7b61a9d0e51244ea819f0",
      },
      {
        id: "AUD-2026-04-006",
        timestamp: "2026-04-20 17:15:30",
        entityType: "Multi-Level Approval",
        entityId: "APP-2026-04-RLC",
        actionType: "APPROVE",
        performedBy: "Dr. J. Silva (CEO)",
        role: "CEO",
        terminalIp: "172.16.0.10",
        severity: "CRITICAL",
        oldValue: JSON.stringify({ step: 3, approver: "Finance Manager", status: "Under Review" }),
        newValue: JSON.stringify({ step: 4, approver: "CEO", status: "Approved" }),
        diffSummary: "Four-eyes approval pipeline completed. Final Stage 4 CEO authorization granted for LKR 3,438,670 payout.",
        versionTag: "SignOff-Final",
        verificationStatus: "Verified",
        auditorNotes: "All four required signatories present: HOD Sales, HOD Service, Finance Manager, CEO.",
        hashChecksum: "SHA256:9e01f2b3c45678ea819f0",
      },
      {
        id: "AUD-2026-04-007",
        timestamp: "2026-04-21 09:30:00",
        entityType: "GL Posting",
        entityId: "POST-2026-04-RLC",
        actionType: "LOCK_PERIOD",
        performedBy: "Nimal Perera (Finance Manager)",
        role: "Finance Manager",
        terminalIp: "172.16.0.201",
        severity: "CRITICAL",
        oldValue: JSON.stringify({ accrualJE: "Pending", periodLocked: false }),
        newValue: JSON.stringify({ accrualJE: "JE-2026-05-8412", periodLocked: true }),
        diffSummary: "SAP Business One Accrual Journal Entry JE-2026-05-8412 posted. April 2026 locked as Immutable Ledger.",
        versionTag: "JE-Locked",
        verificationStatus: "Verified",
        auditorNotes: "Period lock successfully prevents further edits to calculation batch per INC-SCR-11.",
        hashChecksum: "SHA256:2f11d4e5a67890ea819f0",
      },
      {
        id: "AUD-2026-04-008",
        timestamp: "2026-04-22 13:45:12",
        entityType: "Penalty & Clawback",
        entityId: "PEN-2026-04-001",
        actionType: "CREATE",
        performedBy: "System Automation (Debtor Aging)",
        role: "Incentive Administrator",
        terminalIp: "127.0.0.1",
        severity: "HIGH",
        oldValue: null,
        newValue: JSON.stringify({ invoice: "INV-2026-08819", customer: "Lanka Solar Traders Ltd", ageDays: 58, penalty: 7258 }),
        diffSummary: "Debtor penalty enforced for invoice INV-2026-08819 overdue past 45 days. Monthly repeat flag set.",
        versionTag: "PEN-2026-04",
        verificationStatus: "Verified",
        auditorNotes: "Enforced automatically per Page 38 validation rule.",
        hashChecksum: "SHA256:1a88c7d9e03321ea819f0",
      },
      {
        id: "AUD-2026-04-009",
        timestamp: "2026-04-23 15:10:45",
        entityType: "Dispute Resolution",
        entityId: "DSP-2026-04-001",
        actionType: "UPDATE",
        performedBy: "M. Jayasinghe (Senior Accountant)",
        role: "Finance",
        terminalIp: "172.16.0.205",
        severity: "MEDIUM",
        oldValue: JSON.stringify({ status: "Under Investigation", approvedAmount: 0 }),
        newValue: JSON.stringify({ status: "Resolved", approvedAmount: 12500 }),
        diffSummary: "Dispute resolved in favor of Thisara Tharanga (025). Receipt realisation timing confirmed within cutoff.",
        versionTag: "DSP-001",
        verificationStatus: "Verified",
        auditorNotes: "Credit adjustment scheduled for next payroll run.",
        hashChecksum: "SHA256:5e33b2a1c99877ea819f0",
      },
    ];

    for (const s of seeds) {
      await pool.query(
        `
        INSERT INTO incentive_audit_logs (
          id, timestamp, entity_type, entity_id, action_type, performed_by,
          role, terminal_ip, severity, old_value, new_value, diff_summary,
          version_tag, verification_status, auditor_notes, hash_checksum, created_at, updated_at
        ) VALUES (
          $1, $2::timestamp, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
        )
      `,
        [
          s.id,
          s.timestamp,
          s.entityType,
          s.entityId,
          s.actionType,
          s.performedBy,
          s.role,
          s.terminalIp,
          s.severity,
          s.oldValue,
          s.newValue,
          s.diffSummary,
          s.versionTag,
          s.verificationStatus,
          s.auditorNotes,
          s.hashChecksum,
        ]
      );
    }
  }
}

function mapRowToItem(r: any): IncentiveAuditLogItem {
  return {
    id: r.id,
    timestamp: formatDateTime(r.timestamp),
    entityType: r.entity_type as AuditEntityType,
    entityId: r.entity_id,
    actionType: r.action_type as AuditActionType,
    performedBy: r.performed_by,
    role: r.role,
    terminalIp: r.terminal_ip,
    severity: r.severity as AuditSeverity,
    oldValue: r.old_value || undefined,
    newValue: r.new_value || undefined,
    diffSummary: r.diff_summary,
    versionTag: r.version_tag || undefined,
    verificationStatus: r.verification_status as VerificationStatus,
    auditorNotes: r.auditor_notes || undefined,
    hashChecksum: r.hash_checksum,
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  };
}

/**
 * Get all audit trail records matching optional filters
 */
export async function getAllAuditLogs(
  filters: AuditLogFilter = {}
): Promise<IncentiveAuditLogItem[]> {
  await ensureAuditTables();
  const pool = getDbPool();

  let query = `SELECT * FROM incentive_audit_logs WHERE 1=1`;
  const params: any[] = [];
  let pIdx = 1;

  if (filters.entityType && filters.entityType !== "All") {
    query += ` AND entity_type = $${pIdx++}`;
    params.push(filters.entityType);
  }

  if (filters.actionType && filters.actionType !== "All") {
    query += ` AND action_type = $${pIdx++}`;
    params.push(filters.actionType);
  }

  if (filters.severity && filters.severity !== "All") {
    query += ` AND severity = $${pIdx++}`;
    params.push(filters.severity);
  }

  if (filters.verificationStatus && filters.verificationStatus !== "All") {
    query += ` AND verification_status = $${pIdx++}`;
    params.push(filters.verificationStatus);
  }

  if (filters.performedBy) {
    query += ` AND LOWER(performed_by) LIKE $${pIdx++}`;
    params.push(`%${filters.performedBy.toLowerCase()}%`);
  }

  if (filters.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    query += ` AND (
      LOWER(id) LIKE $${pIdx} OR
      LOWER(entity_id) LIKE $${pIdx} OR
      LOWER(entity_type) LIKE $${pIdx} OR
      LOWER(performed_by) LIKE $${pIdx} OR
      LOWER(diff_summary) LIKE $${pIdx} OR
      COALESCE(LOWER(new_value), '') LIKE $${pIdx} OR
      COALESCE(LOWER(old_value), '') LIKE $${pIdx} OR
      COALESCE(LOWER(auditor_notes), '') LIKE $${pIdx} OR
      LOWER(hash_checksum) LIKE $${pIdx}
    )`;
    params.push(q);
    pIdx++;
  }

  query += ` ORDER BY timestamp DESC;`;

  const res = await pool.query(query, params);
  return res.rows.map(mapRowToItem);
}

/**
 * Get single audit log record by ID
 */
export async function getAuditLogById(id: string): Promise<IncentiveAuditLogItem | null> {
  await ensureAuditTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_audit_logs WHERE id = $1;`, [id]);
  if (res.rows.length === 0) return null;
  return mapRowToItem(res.rows[0]);
}

/**
 * Create a new audit log record
 */
export async function createAuditLog(
  data: Omit<IncentiveAuditLogItem, "id" | "timestamp" | "hashChecksum" | "createdAt" | "updatedAt"> & {
    id?: string | undefined;
    timestamp?: string | undefined;
  }
): Promise<IncentiveAuditLogItem> {
  await ensureAuditTables();
  const pool = getDbPool();

  const id = data.id || `AUD-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Date.now().toString().slice(-4)}`;
  const hashChecksum = generateChecksum(id, data.entityType, data.actionType, data.performedBy);

  const res = await pool.query(
    `
    INSERT INTO incentive_audit_logs (
      id, timestamp, entity_type, entity_id, action_type, performed_by,
      role, terminal_ip, severity, old_value, new_value, diff_summary,
      version_tag, verification_status, auditor_notes, hash_checksum, created_at, updated_at
    ) VALUES (
      $1, COALESCE($2::timestamp, NOW()), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
    )
    RETURNING *;
  `,
    [
      id,
      data.timestamp || null,
      data.entityType,
      data.entityId,
      data.actionType,
      data.performedBy,
      data.role || "Incentive Administrator",
      data.terminalIp || "172.16.0.201",
      data.severity || "INFO",
      data.oldValue || null,
      data.newValue || null,
      data.diffSummary,
      data.versionTag || null,
      data.verificationStatus || "Verified",
      data.auditorNotes || null,
      hashChecksum,
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Update an existing audit record (e.g. auditor review, verification status, notes)
 */
export async function updateAuditLog(
  id: string,
  data: Partial<Omit<IncentiveAuditLogItem, "id" | "createdAt" | "updatedAt">>
): Promise<IncentiveAuditLogItem | null> {
  await ensureAuditTables();
  const pool = getDbPool();

  const existing = await getAuditLogById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...data,
  };

  const res = await pool.query(
    `
    UPDATE incentive_audit_logs SET
      entity_type = $1,
      entity_id = $2,
      action_type = $3,
      performed_by = $4,
      role = $5,
      terminal_ip = $6,
      severity = $7,
      old_value = $8,
      new_value = $9,
      diff_summary = $10,
      version_tag = $11,
      verification_status = $12,
      auditor_notes = $13,
      updated_at = NOW()
    WHERE id = $14
    RETURNING *;
  `,
    [
      updated.entityType,
      updated.entityId,
      updated.actionType,
      updated.performedBy,
      updated.role,
      updated.terminalIp,
      updated.severity,
      updated.oldValue || null,
      updated.newValue || null,
      updated.diffSummary,
      updated.versionTag || null,
      updated.verificationStatus,
      updated.auditorNotes || null,
      id,
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Set Auditor verification status & notes
 */
export async function verifyAuditLog(
  id: string,
  status: VerificationStatus,
  notes: string
): Promise<IncentiveAuditLogItem | null> {
  await ensureAuditTables();
  const pool = getDbPool();

  const res = await pool.query(
    `
    UPDATE incentive_audit_logs SET
      verification_status = $1,
      auditor_notes = $2,
      updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `,
    [status, notes, id]
  );

  if (res.rows.length === 0) return null;
  return mapRowToItem(res.rows[0]);
}

/**
 * Delete an audit log entry (for maintenance or supervisor demo testing)
 */
export async function deleteAuditLog(id: string): Promise<boolean> {
  await ensureAuditTables();
  const pool = getDbPool();

  const res = await pool.query(`DELETE FROM incentive_audit_logs WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
