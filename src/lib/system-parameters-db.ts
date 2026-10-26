import { getDbPool } from "./db";

export type ParameterCategory =
  | "Cut-off & Scheduling"
  | "Aging & Credit Policy"
  | "Calculation & Lag"
  | "Service Scorecard"
  | "Governance & Security";

export interface SystemParameterItem {
  id: string;
  parameterKey: string;
  parameterName: string;
  category: ParameterCategory;
  parameterValue: string;
  unit: string;
  defaultValue: string;
  description: string;
  isEditable: boolean;
  effectiveFrom: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemParameterFilter {
  category?: ParameterCategory | "All" | undefined;
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
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 19: System Parameters & Cut-off Policy
 */
export async function ensureSystemParametersTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_system_parameters (
      id VARCHAR(64) PRIMARY KEY,
      parameter_key VARCHAR(64) UNIQUE NOT NULL,
      parameter_name VARCHAR(128) NOT NULL,
      category VARCHAR(64) NOT NULL,
      parameter_value TEXT NOT NULL,
      unit VARCHAR(32) NOT NULL DEFAULT 'Days',
      default_value TEXT NOT NULL,
      description TEXT NOT NULL,
      is_editable BOOLEAN NOT NULL DEFAULT TRUE,
      effective_from VARCHAR(32) NOT NULL DEFAULT '2026-01-01',
      last_updated_by VARCHAR(128) NOT NULL DEFAULT 'System Administrator',
      last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_param_category ON incentive_system_parameters (category);
    CREATE INDEX IF NOT EXISTS idx_param_key ON incentive_system_parameters (parameter_key);
  `);

  const countRes = await pool.query(`SELECT COUNT(*) FROM incentive_system_parameters;`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    const seeds: Array<Omit<SystemParameterItem, "createdAt" | "updatedAt">> = [
      // 1. Cut-off & Scheduling
      {
        id: "PAR-CUTOFF-01",
        parameterKey: "DATA_CUTOFF_DAY",
        parameterName: "Monthly Data Cut-off Day",
        category: "Cut-off & Scheduling",
        parameterValue: "25",
        unit: "Day of Month",
        defaultValue: "25",
        description: "Monthly transaction cut-off date. All sales invoices, receipts, and closed service tickets up to 23:59:59 on this day are captured.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Finance Director (S. Alwis)",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-CUTOFF-02",
        parameterKey: "CALCULATION_RUN_DAY",
        parameterName: "Monthly Batch Calculation Day",
        category: "Cut-off & Scheduling",
        parameterValue: "28",
        unit: "Day of Month",
        defaultValue: "28",
        description: "Automated engine execution date for monthly batch calculation run across all divisions (RLC, CAC, MHA, Service).",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "System Administrator",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-CUTOFF-03",
        parameterKey: "APPROVAL_DEADLINE_DAY",
        parameterName: "Four-Eyes Sign-Off Deadline",
        category: "Cut-off & Scheduling",
        parameterValue: "3",
        unit: "Day of Next Month",
        defaultValue: "3",
        description: "Final deadline for HOD Sales, HOD Service, Finance Manager, and CEO to sign off the calculation package.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Executive Committee",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-CUTOFF-04",
        parameterKey: "PAYROLL_HANDOVER_DAY",
        parameterName: "Payroll Handover Export Deadline",
        category: "Cut-off & Scheduling",
        parameterValue: "15",
        unit: "Day of Payout Month",
        defaultValue: "15",
        description: "Deadline to transmit final approved net payout schedule to HR Microimage Payroll system for direct salary disbursement.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "HR Director",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-CUTOFF-05",
        parameterKey: "DISPUTE_WINDOW_DAYS",
        parameterName: "Dispute Window Duration",
        category: "Cut-off & Scheduling",
        parameterValue: "10",
        unit: "Days after Statement",
        defaultValue: "10",
        description: "Formal employee dispute inquiry window following individual payslip issuance (Section 15 / INC-BCR-19).",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "HR Manager",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },

      // 2. Aging & Credit Policy
      {
        id: "PAR-AGING-01",
        parameterKey: "CREDIT_TERM_DAYS",
        parameterName: "Standard Customer Credit Period",
        category: "Aging & Credit Policy",
        parameterValue: "30",
        unit: "Days",
        defaultValue: "30",
        description: "Default customer payment credit duration before an invoice is flagged as past due.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Credit Controller",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-AGING-02",
        parameterKey: "PENALTY_OVERDUE_THRESHOLD",
        parameterName: "Debtor Penalty Overdue Grace Threshold",
        category: "Aging & Credit Policy",
        parameterValue: "45",
        unit: "Days past Invoice",
        defaultValue: "45",
        description: "Invoice age threshold beyond which sales payment commission is put on hold and monthly penalty is deducted (Page 38: > 45 days).",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Finance Manager (Nimal Perera)",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-AGING-03",
        parameterKey: "PENALTY_RECURRING_POLICY",
        parameterName: "Debtor Penalty Recurring Policy",
        category: "Aging & Credit Policy",
        parameterValue: "Repeats Monthly Until 100% Settled",
        unit: "Rule Policy",
        defaultValue: "Repeats Monthly Until 100% Settled",
        description: "Page 38 validation rule: Debtor penalty repeats every monthly calculation cycle until overdue balance is settled.",
        isEditable: false,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Executive Committee (Fixed Policy)",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-AGING-04",
        parameterKey: "TIER1_PENALTY_RATE",
        parameterName: "Debtor Penalty Rate: 46 - 60 Days",
        category: "Aging & Credit Policy",
        parameterValue: "2.50",
        unit: "Percent (%)",
        defaultValue: "2.50",
        description: "Monthly penalty deduction rate applied to overdue invoice balance aged 46 to 60 days.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Finance Manager",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-AGING-05",
        parameterKey: "TIER2_PENALTY_RATE",
        parameterName: "Debtor Penalty Rate: 61 - 90 Days",
        category: "Aging & Credit Policy",
        parameterValue: "3.50",
        unit: "Percent (%)",
        defaultValue: "3.50",
        description: "Monthly penalty deduction rate applied to overdue invoice balance aged 61 to 90 days.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Finance Manager",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },

      // 3. Calculation & Lag
      {
        id: "PAR-CALC-01",
        parameterKey: "PAYMENT_COMMISSION_LAG",
        parameterName: "Payment Commission Realisation Lag",
        category: "Calculation & Lag",
        parameterValue: "3",
        unit: "Months",
        defaultValue: "3",
        description: "Section 3.1 & 11 Rule: 3-month realization lag for payment collection commissions (e.g., April collection paid in July).",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Finance Committee",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-CALC-02",
        parameterKey: "RATE_MATCHING_RULE",
        parameterName: "Commission Rate Version Matching Basis",
        category: "Calculation & Lag",
        parameterValue: "Invoice Date",
        unit: "Matching Field",
        defaultValue: "Invoice Date",
        description: "Section 15 / INC-BCR-18: Commission rate version matched by Invoice Date rather than Receipt Date.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Finance Manager",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-CALC-03",
        parameterKey: "TARGET_ACHIEVEMENT_CAP",
        parameterName: "Incentive Payout Maximum Cap",
        category: "Calculation & Lag",
        parameterValue: "No Cap (Unlimited)",
        unit: "Policy Setting",
        defaultValue: "No Cap (Unlimited)",
        description: "Section 15 / INC-BCR-20: Telesonic executive policy specifies uncapped earning potential for top sales performers.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "CEO Office",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },

      // 4. Governance & Security
      {
        id: "PAR-GOV-01",
        parameterKey: "CEO_APPROVAL_THRESHOLD",
        parameterName: "CEO Sign-Off Adjustment Threshold",
        category: "Governance & Security",
        parameterValue: "50000",
        unit: "LKR",
        defaultValue: "50000",
        description: "Section 10 Maker-Checker Rule: Manual incentive claims exceeding LKR 50,000 mandate CEO executive approval.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Internal Audit Head",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-GOV-02",
        parameterKey: "AUTO_LOCK_PERIOD",
        parameterName: "Automatic Period Lock on GL Post",
        category: "Governance & Security",
        parameterValue: "Enabled (Immutable Ledger)",
        unit: "Security Toggle",
        defaultValue: "Enabled (Immutable Ledger)",
        description: "Section 10: Upon SAP B1 Accrual JE posting, period is automatically locked into a read-only immutable state.",
        isEditable: true,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Chief Financial Officer",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
      {
        id: "PAR-GOV-03",
        parameterKey: "TAMPER_CHECK_SHA256",
        parameterName: "Cryptographic SHA-256 Audit Verification",
        category: "Governance & Security",
        parameterValue: "Active Enforced",
        unit: "Crypto Hashing",
        defaultValue: "Active Enforced",
        description: "Auto-generates SHA-256 checksums for all scheme revisions, calculations, and approvals to prevent tampering.",
        isEditable: false,
        effectiveFrom: "2026-01-01",
        lastUpdatedBy: "Security Administrator",
        lastUpdatedAt: "2026-04-01 09:00:00",
      },
    ];

    for (const s of seeds) {
      await pool.query(
        `
        INSERT INTO incentive_system_parameters (
          id, parameter_key, parameter_name, category, parameter_value,
          unit, default_value, description, is_editable, effective_from,
          last_updated_by, last_updated_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::timestamp, NOW(), NOW()
        )
      `,
        [
          s.id,
          s.parameterKey,
          s.parameterName,
          s.category,
          s.parameterValue,
          s.unit,
          s.defaultValue,
          s.description,
          s.isEditable,
          s.effectiveFrom,
          s.lastUpdatedBy,
          s.lastUpdatedAt,
        ]
      );
    }
  }
}

function mapRowToItem(r: any): SystemParameterItem {
  return {
    id: r.id,
    parameterKey: r.parameter_key,
    parameterName: r.parameter_name,
    category: r.category as ParameterCategory,
    parameterValue: r.parameter_value,
    unit: r.unit,
    defaultValue: r.default_value,
    description: r.description,
    isEditable: Boolean(r.is_editable),
    effectiveFrom: r.effective_from,
    lastUpdatedBy: r.last_updated_by,
    lastUpdatedAt: formatDateTime(r.last_updated_at),
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  };
}

/**
 * Get all system parameters matching optional filters
 */
export async function getAllSystemParameters(
  filters: SystemParameterFilter = {}
): Promise<SystemParameterItem[]> {
  await ensureSystemParametersTables();
  const pool = getDbPool();

  let query = `SELECT * FROM incentive_system_parameters WHERE 1=1`;
  const params: any[] = [];
  let pIdx = 1;

  if (filters.category && filters.category !== "All") {
    query += ` AND category = $${pIdx++}`;
    params.push(filters.category);
  }

  if (filters.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    query += ` AND (
      LOWER(id) LIKE $${pIdx} OR
      LOWER(parameter_key) LIKE $${pIdx} OR
      LOWER(parameter_name) LIKE $${pIdx} OR
      LOWER(parameter_value) LIKE $${pIdx} OR
      LOWER(description) LIKE $${pIdx}
    )`;
    params.push(q);
    pIdx++;
  }

  query += ` ORDER BY category ASC, id ASC;`;

  const res = await pool.query(query, params);
  return res.rows.map(mapRowToItem);
}

/**
 * Get single system parameter by ID or Key
 */
export async function getSystemParameterById(idOrKey: string): Promise<SystemParameterItem | null> {
  await ensureSystemParametersTables();
  const pool = getDbPool();

  const res = await pool.query(
    `SELECT * FROM incentive_system_parameters WHERE id = $1 OR parameter_key = $1;`,
    [idOrKey]
  );
  if (res.rows.length === 0) return null;
  return mapRowToItem(res.rows[0]);
}

/**
 * Create a new custom system parameter
 */
export async function createSystemParameter(
  data: Omit<SystemParameterItem, "id" | "lastUpdatedAt" | "createdAt" | "updatedAt"> & {
    id?: string | undefined;
  }
): Promise<SystemParameterItem> {
  await ensureSystemParametersTables();
  const pool = getDbPool();

  const id = data.id || `PAR-CUSTOM-${Date.now().toString().slice(-4)}`;

  const res = await pool.query(
    `
    INSERT INTO incentive_system_parameters (
      id, parameter_key, parameter_name, category, parameter_value,
      unit, default_value, description, is_editable, effective_from,
      last_updated_by, last_updated_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), NOW()
    )
    RETURNING *;
  `,
    [
      id,
      data.parameterKey,
      data.parameterName,
      data.category,
      data.parameterValue,
      data.unit,
      data.defaultValue || data.parameterValue,
      data.description,
      data.isEditable ?? true,
      data.effectiveFrom || "2026-01-01",
      data.lastUpdatedBy || "System Administrator",
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Update an existing system parameter value
 */
export async function updateSystemParameter(
  id: string,
  data: Partial<Omit<SystemParameterItem, "id" | "createdAt" | "updatedAt">>
): Promise<SystemParameterItem | null> {
  await ensureSystemParametersTables();
  const pool = getDbPool();

  const existing = await getSystemParameterById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...data,
  };

  const res = await pool.query(
    `
    UPDATE incentive_system_parameters SET
      parameter_name = $1,
      category = $2,
      parameter_value = $3,
      unit = $4,
      default_value = $5,
      description = $6,
      is_editable = $7,
      effective_from = $8,
      last_updated_by = $9,
      last_updated_at = NOW(),
      updated_at = NOW()
    WHERE id = $10
    RETURNING *;
  `,
    [
      updated.parameterName,
      updated.category,
      updated.parameterValue,
      updated.unit,
      updated.defaultValue,
      updated.description,
      updated.isEditable,
      updated.effectiveFrom,
      updated.lastUpdatedBy,
      id,
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Reset a parameter to its default specification value
 */
export async function resetSystemParameterToDefault(
  id: string,
  resetBy: string
): Promise<SystemParameterItem | null> {
  await ensureSystemParametersTables();
  const pool = getDbPool();

  const existing = await getSystemParameterById(id);
  if (!existing) return null;

  const res = await pool.query(
    `
    UPDATE incentive_system_parameters SET
      parameter_value = default_value,
      last_updated_by = $1,
      last_updated_at = NOW(),
      updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `,
    [resetBy, id]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Delete a custom system parameter
 */
export async function deleteSystemParameter(id: string): Promise<boolean> {
  await ensureSystemParametersTables();
  const pool = getDbPool();

  const res = await pool.query(
    `DELETE FROM incentive_system_parameters WHERE id = $1 AND is_editable = true;`,
    [id]
  );
  return (res.rowCount ?? 0) > 0;
}
