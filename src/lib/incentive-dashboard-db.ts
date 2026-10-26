import { getDbPool } from "./db";

export interface IncentiveDashboardRecord {
  id: string;
  participantCode: string;
  displayName: string;
  role: string;
  division: string;
  period: string;
  volumePct: number;
  turnoverPct: number;
  projectedCommission: number;
  invoicesOver45Days: number;
  penaltyExposure: number;
  baseTarget: number;
  actualAchievement: number;
  attendanceFactor: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverdueInvoice {
  id: string;
  invoiceNo: string;
  participantCode: string;
  participantName: string;
  customerName: string;
  invoiceDate: string;
  daysOverdue: number;
  invoiceAmount: number;
  penaltyAmount: number;
}

export interface DashboardPayload {
  records: IncentiveDashboardRecord[];
  overdueInvoices: DashboardOverdueInvoice[];
  metrics: {
    totalProjectedCommission: number;
    avgVolumePct: number;
    avgTurnoverPct: number;
    totalOverdueInvoices: number;
    totalPenaltyExposure: number;
    totalParticipants: number;
  };
  lastRecalculatedAt?: string;
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 16 (Incentive Dashboard)
 */
export async function ensureIncentiveDashboardTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_dashboard_records (
      id VARCHAR(64) PRIMARY KEY,
      participant_code VARCHAR(64) NOT NULL,
      display_name VARCHAR(128) NOT NULL,
      role VARCHAR(128) NOT NULL,
      division VARCHAR(128) NOT NULL,
      period VARCHAR(64) NOT NULL,
      volume_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
      turnover_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
      projected_commission NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      invoices_over_45_days INT NOT NULL DEFAULT 0,
      penalty_exposure NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      base_target NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      actual_achievement NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      attendance_factor NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
      status VARCHAR(32) NOT NULL DEFAULT 'Active',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_dsh_period ON incentive_dashboard_records(period);
    CREATE INDEX IF NOT EXISTS idx_dsh_div ON incentive_dashboard_records(division);
    CREATE INDEX IF NOT EXISTS idx_dsh_code ON incentive_dashboard_records(participant_code);
  `);

  // Seed initial rows if table is empty
  const countRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_dashboard_records;`);
  if (countRes.rows[0].cnt === 0) {
    await pool.query(`
      INSERT INTO incentive_dashboard_records (
        id, participant_code, display_name, role, division, period,
        volume_pct, turnover_pct, projected_commission, invoices_over_45_days,
        penalty_exposure, base_target, actual_achievement, attendance_factor, status, notes
      ) VALUES
      (
        'DSH-2026-04-025', '025', 'Thisara Tharanga', 'Sales Executive - Dealer Seg 01', 'RLC Sales', 'April 2026',
        192.50, 127.17, 187100.00, 0, 0.00, 18400000.00, 23399855.00, 1.00, 'Active',
        'Top performer specimen from Page 34. 192.5% volume achievement with zero overdue penalties.'
      ),
      (
        'DSH-2026-04-031', '031', 'Nuwan Dias', 'Sales Executive - Dealer Seg 02', 'RLC Sales', 'April 2026',
        160.00, 118.00, 214300.00, 0, 0.00, 16000000.00, 18880000.00, 1.00, 'Active',
        'Dealer Segment 02 sales executive. Includes manual adjustment voucher for cheque SL3370.'
      ),
      (
        'DSH-2026-04-044', '044', 'Ishara Fernando', 'Sales Executive', 'RLC Sales', 'April 2026',
        92.00, 88.00, 96200.00, 1, 7258.00, 12000000.00, 10560000.00, 0.95, 'Active',
        'Has 1 overdue dealer invoice > 45 days resulting in LKR 7,258 debtor clawback penalty.'
      ),
      (
        'DSH-2026-04-102', 'SVC-102', 'Dilshan Madusanka', 'Service Technician', 'RLC Service', 'April 2026',
        110.00, 105.00, 65000.00, 0, 0.00, 1200000.00, 1260000.00, 1.00, 'Active',
        'Field technician scorecard. 48 completed repair tickets with 92% first-time-fix rate.'
      ),
      (
        'DSH-2026-05-012', 'MHA-012', 'Kamal Perera', 'Area Sales Manager', 'MHA Major Appliances', 'May 2026',
        122.00, 115.00, 175000.00, 0, 0.00, 22000000.00, 25300000.00, 1.00, 'Active',
        'MHA Western Province dealer network achievement.'
      ),
      (
        'DSH-2026-05-088', 'CAC-088', 'Ruwan Jayasinghe', 'Senior Project Engineer', 'CAC Project Engineering', 'May 2026',
        105.00, 108.00, 195000.00, 1, 15000.00, 15000000.00, 16200000.00, 1.00, 'Active',
        'Commercial AC mega project milestone completion bonus.'
      )
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get All Dashboard Records & Aggregations (READ)
 */
export async function getDashboardData(filters?: {
  period?: string | undefined;
  division?: string | undefined;
  participant?: string | undefined;
  search?: string | undefined;
}): Promise<DashboardPayload> {
  await ensureIncentiveDashboardTables();
  const pool = getDbPool();

  let sql = `SELECT * FROM incentive_dashboard_records WHERE 1=1`;
  const params: any[] = [];

  if (filters?.period && filters.period !== "All") {
    params.push(filters.period);
    sql += ` AND period = $${params.length}`;
  }

  if (filters?.division && filters.division !== "All") {
    params.push(filters.division);
    sql += ` AND division = $${params.length}`;
  }

  if (filters?.participant && filters.participant !== "All") {
    params.push(filters.participant);
    sql += ` AND (display_name = $${params.length} OR participant_code = $${params.length})`;
  }

  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    params.push(q);
    sql += ` AND (
      display_name ILIKE $${params.length} OR
      participant_code ILIKE $${params.length} OR
      role ILIKE $${params.length} OR
      division ILIKE $${params.length}
    )`;
  }

  sql += ` ORDER BY projected_commission DESC;`;

  const res = await pool.query(sql, params);
  const records: IncentiveDashboardRecord[] = res.rows.map((r: any) => ({
    id: r.id,
    participantCode: r.participant_code,
    displayName: r.display_name,
    role: r.role,
    division: r.division,
    period: r.period,
    volumePct: parseFloat(r.volume_pct) || 0,
    turnoverPct: parseFloat(r.turnover_pct) || 0,
    projectedCommission: parseFloat(r.projected_commission) || 0,
    invoicesOver45Days: parseInt(r.invoices_over_45_days, 10) || 0,
    penaltyExposure: parseFloat(r.penalty_exposure) || 0,
    baseTarget: parseFloat(r.base_target) || 0,
    actualAchievement: parseFloat(r.actual_achievement) || 0,
    attendanceFactor: parseFloat(r.attendance_factor) || 1,
    status: r.status,
    notes: r.notes || "",
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  }));

  // Overdue Invoices breakdown for Penalty Risk Tab
  const overdueInvoices: DashboardOverdueInvoice[] = [
    {
      id: "INV-PEN-001",
      invoiceNo: "INV-2026-08819",
      participantCode: "044",
      participantName: "Ishara Fernando",
      customerName: "Lanka Solar Traders Ltd",
      invoiceDate: "12-Feb-2026",
      daysOverdue: 58,
      invoiceAmount: 245000,
      penaltyAmount: 7258,
    },
    {
      id: "INV-PEN-002",
      invoiceNo: "INV-2026-09142",
      participantCode: "CAC-088",
      participantName: "Ruwan Jayasinghe",
      customerName: "Central Hospital AC Expansion",
      invoiceDate: "20-Feb-2026",
      daysOverdue: 51,
      invoiceAmount: 500000,
      penaltyAmount: 15000,
    },
  ];

  const totalProjectedCommission = records.reduce((acc, r) => acc + r.projectedCommission, 0);
  const avgVolumePct = records.length > 0 ? records.reduce((acc, r) => acc + r.volumePct, 0) / records.length : 0;
  const avgTurnoverPct = records.length > 0 ? records.reduce((acc, r) => acc + r.turnoverPct, 0) / records.length : 0;
  const totalOverdueInvoices = records.reduce((acc, r) => acc + r.invoicesOver45Days, 0);
  const totalPenaltyExposure = records.reduce((acc, r) => acc + r.penaltyExposure, 0);

  return {
    records,
    overdueInvoices,
    metrics: {
      totalProjectedCommission,
      avgVolumePct,
      avgTurnoverPct,
      totalOverdueInvoices,
      totalPenaltyExposure,
      totalParticipants: records.length,
    },
    lastRecalculatedAt: new Date().toLocaleTimeString(),
  };
}

/**
 * Get Single Record by ID
 */
export async function getDashboardRecordById(id: string): Promise<IncentiveDashboardRecord | null> {
  await ensureIncentiveDashboardTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_dashboard_records WHERE id = $1;`, [id]);
  if (res.rows.length === 0) return null;
  const r = res.rows[0];

  return {
    id: r.id,
    participantCode: r.participant_code,
    displayName: r.display_name,
    role: r.role,
    division: r.division,
    period: r.period,
    volumePct: parseFloat(r.volume_pct) || 0,
    turnoverPct: parseFloat(r.turnover_pct) || 0,
    projectedCommission: parseFloat(r.projected_commission) || 0,
    invoicesOver45Days: parseInt(r.invoices_over_45_days, 10) || 0,
    penaltyExposure: parseFloat(r.penalty_exposure) || 0,
    baseTarget: parseFloat(r.base_target) || 0,
    actualAchievement: parseFloat(r.actual_achievement) || 0,
    attendanceFactor: parseFloat(r.attendance_factor) || 1,
    status: r.status,
    notes: r.notes || "",
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  };
}

/**
 * Create Dashboard Benchmark Record (CREATE)
 */
export async function createDashboardRecord(data: {
  id?: string;
  participantCode: string;
  displayName: string;
  role?: string;
  division?: string;
  period?: string;
  volumePct?: number;
  turnoverPct?: number;
  projectedCommission?: number;
  invoicesOver45Days?: number;
  penaltyExposure?: number;
  baseTarget?: number;
  actualAchievement?: number;
  attendanceFactor?: number;
  status?: string;
  notes?: string;
}): Promise<IncentiveDashboardRecord> {
  await ensureIncentiveDashboardTables();
  const pool = getDbPool();

  const id = data.id || `DSH-${Date.now()}`;
  const role = data.role || "Sales Representative";
  const division = data.division || "RLC Sales";
  const period = data.period || "April 2026";
  const volumePct = Number(data.volumePct) || 100;
  const turnoverPct = Number(data.turnoverPct) || 100;
  const projectedCommission = Number(data.projectedCommission) || 0;
  const invoicesOver45Days = Number(data.invoicesOver45Days) || 0;
  const penaltyExposure = Number(data.penaltyExposure) || 0;
  const baseTarget = Number(data.baseTarget) || 0;
  const actualAchievement = Number(data.actualAchievement) || 0;
  const attendanceFactor = Number(data.attendanceFactor) || 1.0;
  const status = data.status || "Active";

  await pool.query(
    `INSERT INTO incentive_dashboard_records (
      id, participant_code, display_name, role, division, period,
      volume_pct, turnover_pct, projected_commission, invoices_over_45_days,
      penalty_exposure, base_target, actual_achievement, attendance_factor, status, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
    [
      id,
      data.participantCode,
      data.displayName,
      role,
      division,
      period,
      volumePct,
      turnoverPct,
      projectedCommission,
      invoicesOver45Days,
      penaltyExposure,
      baseTarget,
      actualAchievement,
      attendanceFactor,
      status,
      data.notes || null,
    ],
  );

  const created = await getDashboardRecordById(id);
  if (!created) {
    throw new Error(`Failed to create dashboard record ${id}`);
  }
  return created;
}

/**
 * Update Dashboard Record (UPDATE)
 */
export async function updateDashboardRecord(
  id: string,
  data: Partial<IncentiveDashboardRecord>,
): Promise<IncentiveDashboardRecord> {
  await ensureIncentiveDashboardTables();
  const pool = getDbPool();

  const existing = await getDashboardRecordById(id);
  if (!existing) {
    throw new Error(`Dashboard record ${id} not found.`);
  }

  const displayName = data.displayName || existing.displayName;
  const role = data.role || existing.role;
  const division = data.division || existing.division;
  const period = data.period || existing.period;
  const volumePct = data.volumePct !== undefined ? Number(data.volumePct) : existing.volumePct;
  const turnoverPct = data.turnoverPct !== undefined ? Number(data.turnoverPct) : existing.turnoverPct;
  const projectedCommission = data.projectedCommission !== undefined ? Number(data.projectedCommission) : existing.projectedCommission;
  const invoicesOver45Days = data.invoicesOver45Days !== undefined ? Number(data.invoicesOver45Days) : existing.invoicesOver45Days;
  const penaltyExposure = data.penaltyExposure !== undefined ? Number(data.penaltyExposure) : existing.penaltyExposure;
  const baseTarget = data.baseTarget !== undefined ? Number(data.baseTarget) : existing.baseTarget;
  const actualAchievement = data.actualAchievement !== undefined ? Number(data.actualAchievement) : existing.actualAchievement;
  const attendanceFactor = data.attendanceFactor !== undefined ? Number(data.attendanceFactor) : existing.attendanceFactor;
  const status = data.status || existing.status;
  const notes = data.notes !== undefined ? data.notes : existing.notes;

  await pool.query(
    `UPDATE incentive_dashboard_records SET
      display_name = $1,
      role = $2,
      division = $3,
      period = $4,
      volume_pct = $5,
      turnover_pct = $6,
      projected_commission = $7,
      invoices_over_45_days = $8,
      penalty_exposure = $9,
      base_target = $10,
      actual_achievement = $11,
      attendance_factor = $12,
      status = $13,
      notes = $14,
      updated_at = NOW()
    WHERE id = $15;`,
    [
      displayName,
      role,
      division,
      period,
      volumePct,
      turnoverPct,
      projectedCommission,
      invoicesOver45Days,
      penaltyExposure,
      baseTarget,
      actualAchievement,
      attendanceFactor,
      status,
      notes,
      id,
    ],
  );

  const updated = await getDashboardRecordById(id);
  if (!updated) {
    throw new Error(`Dashboard record ${id} not found after update.`);
  }
  return updated;
}

/**
 * Delete Dashboard Record (DELETE)
 */
export async function deleteDashboardRecord(id: string): Promise<boolean> {
  await ensureIncentiveDashboardTables();
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_dashboard_records WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
