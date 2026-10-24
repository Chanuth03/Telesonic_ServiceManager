import { getDbPool } from "./db";

export type BudgetStatus = "On Track" | "Under Budget" | "Budget Exceeded";

export interface DivisionBudgetRecord {
  id: string;
  period: string;
  division: string;
  targetSales: number;
  actualSales: number;
  targetCollections: number;
  actualCollections: number;
  budgetAllocation: number;
  actualIncentiveCost: number;
  costRatioPct: number;
  varianceAmount: number;
  participantCount: number;
  status: BudgetStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummaryItem {
  category: string;
  participantCount: number;
  grossEarned: number;
  deductions: number;
  netPayable: number;
  avgPayout: number;
  minPayout: number;
  maxPayout: number;
}

export interface DivisionSummaryItem {
  division: string;
  salesCommission: number;
  targetIncentive: number;
  serviceAllowance: number;
  adjustments: number;
  grossEarned: number;
  deductions: number;
  netPayable: number;
  participantCount: number;
  avgPayout: number;
  netSales: number;
  costRatioPct: number;
}

export interface AnalyticsDataPayload {
  divisionBudgets: DivisionBudgetRecord[];
  divisionSummaries: DivisionSummaryItem[];
  categorySummaries: CategorySummaryItem[];
  overallTotals: {
    totalNetSales: number;
    totalCollections: number;
    totalBudgetAllocation: number;
    totalIncentiveCost: number;
    blendedCostRatioPct: number;
    totalVariance: number;
    totalParticipants: number;
  };
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Screen 15 (Scheme Performance & Payout Analytics)
 */
export async function ensureSchemeAnalyticsTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_division_budgets (
      id VARCHAR(64) PRIMARY KEY,
      period VARCHAR(64) NOT NULL,
      division VARCHAR(128) NOT NULL,
      target_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      actual_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      target_collections NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      actual_collections NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      budget_allocation NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      actual_incentive_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      cost_ratio_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
      variance_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      participant_count INT NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'On Track',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_bdg_period ON incentive_division_budgets(period);
    CREATE INDEX IF NOT EXISTS idx_bdg_div ON incentive_division_budgets(division);
  `);

  // Seed sample rows if table is empty
  const countRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_division_budgets;`);
  if (countRes.rows[0].cnt === 0) {
    await pool.query(`
      INSERT INTO incentive_division_budgets (
        id, period, division, target_sales, actual_sales, target_collections, actual_collections,
        budget_allocation, actual_incentive_cost, cost_ratio_pct, variance_amount, participant_count,
        status, notes
      ) VALUES
      (
        'BDG-2026-04-RLC', 'April 2026', 'RLC Sales', 50000000.00, 56240000.00, 45000000.00, 48150000.00,
        3500000.00, 3430670.00, 6.10, 69330.00, 28, 'Under Budget',
        'Official specimen run April 2026. Sales exceeded target by 12.5% with healthy 6.10% incentive cost ratio.'
      ),
      (
        'BDG-2026-04-SVC', 'April 2026', 'RLC Service', 16000000.00, 18500000.00, 15000000.00, 17200000.00,
        1200000.00, 1080000.00, 5.84, 120000.00, 16, 'Under Budget',
        'Service revenue generated from closed warranty and post-warranty repairs. Incentive cost within 6% benchmark.'
      ),
      (
        'BDG-2026-04-MHA', 'April 2026', 'MHA Major Appliances', 40000000.00, 42000000.00, 38000000.00, 39800000.00,
        2800000.00, 2650000.00, 6.31, 150000.00, 22, 'On Track',
        'Major Home Appliances dealer network sell-through. Product commission and volume slabs.'
      ),
      (
        'BDG-2026-04-CAC', 'April 2026', 'CAC Project Engineering', 32000000.00, 35000000.00, 30000000.00, 32500000.00,
        2200000.00, 2250000.00, 6.43, -50000.00, 12, 'Budget Exceeded',
        'Commercial AC mega installation project pool distribution. Milestone completion bonus accelerated.'
      )
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get All Division Budgets & Comprehensive Analytics (READ)
 */
export async function getSchemeAnalytics(filters?: {
  period?: string | undefined;
  division?: string | undefined;
  search?: string | undefined;
}): Promise<AnalyticsDataPayload> {
  await ensureSchemeAnalyticsTables();
  const pool = getDbPool();

  let sql = `SELECT * FROM incentive_division_budgets WHERE 1=1`;
  const params: any[] = [];

  if (filters?.period && filters.period !== "All") {
    params.push(filters.period);
    sql += ` AND period = $${params.length}`;
  }

  if (filters?.division && filters.division !== "All") {
    params.push(filters.division);
    sql += ` AND division = $${params.length}`;
  }

  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    params.push(q);
    sql += ` AND (division ILIKE $${params.length} OR period ILIKE $${params.length} OR notes ILIKE $${params.length})`;
  }

  sql += ` ORDER BY division ASC;`;

  const res = await pool.query(sql, params);
  const divisionBudgets: DivisionBudgetRecord[] = res.rows.map((r: any) => ({
    id: r.id,
    period: r.period,
    division: r.division,
    targetSales: parseFloat(r.target_sales) || 0,
    actualSales: parseFloat(r.actual_sales) || 0,
    targetCollections: parseFloat(r.target_collections) || 0,
    actualCollections: parseFloat(r.actual_collections) || 0,
    budgetAllocation: parseFloat(r.budget_allocation) || 0,
    actualIncentiveCost: parseFloat(r.actual_incentive_cost) || 0,
    costRatioPct: parseFloat(r.cost_ratio_pct) || 0,
    varianceAmount: parseFloat(r.variance_amount) || 0,
    participantCount: parseInt(r.participant_count, 10) || 0,
    status: r.status as BudgetStatus,
    notes: r.notes || "",
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  }));

  // Build INC-RPT-20 Division-wise Incentive Summary from budgets and calculated amounts
  const divisionSummaries: DivisionSummaryItem[] = divisionBudgets.map((b) => {
    const commission = b.actualIncentiveCost * 0.70;
    const targetInc = b.actualIncentiveCost * 0.25;
    const allowance = b.actualIncentiveCost * 0.05;
    const gross = commission + targetInc + allowance;
    const deductions = gross - b.actualIncentiveCost;
    const avg = b.participantCount > 0 ? b.actualIncentiveCost / b.participantCount : 0;
    return {
      division: b.division,
      salesCommission: commission,
      targetIncentive: targetInc,
      serviceAllowance: allowance,
      adjustments: 0,
      grossEarned: gross,
      deductions,
      netPayable: b.actualIncentiveCost,
      participantCount: b.participantCount,
      avgPayout: avg,
      netSales: b.actualSales,
      costRatioPct: b.costRatioPct,
    };
  });

  // Build INC-RPT-21 Employee Category-wise Incentive Summary
  const categorySummaries: CategorySummaryItem[] = [
    {
      category: "Sales Executives (RLC & MHA)",
      participantCount: 38,
      grossEarned: 5280000,
      deductions: 72580,
      netPayable: 5207420,
      avgPayout: 137037.37,
      minPayout: 65000,
      maxPayout: 229800,
    },
    {
      category: "Service Technicians (Field & Workshop)",
      participantCount: 16,
      grossEarned: 1120000,
      deductions: 40000,
      netPayable: 1080000,
      avgPayout: 67500.00,
      minPayout: 45000,
      maxPayout: 92000,
    },
    {
      category: "Area Sales Managers",
      participantCount: 8,
      grossEarned: 1650000,
      deductions: 0,
      netPayable: 1650000,
      avgPayout: 206250.00,
      minPayout: 175000,
      maxPayout: 245000,
    },
    {
      category: "Project Engineers (CAC)",
      participantCount: 12,
      grossEarned: 2250000,
      deductions: 0,
      netPayable: 2250000,
      avgPayout: 187500.00,
      minPayout: 140000,
      maxPayout: 260000,
    },
    {
      category: "Department Heads (HOD Sales/Service)",
      participantCount: 4,
      grossEarned: 980000,
      deductions: 0,
      netPayable: 980000,
      avgPayout: 245000.00,
      minPayout: 220000,
      maxPayout: 280000,
    },
  ];

  // Overall Totals
  const totalNetSales = divisionBudgets.reduce((acc, b) => acc + b.actualSales, 0);
  const totalCollections = divisionBudgets.reduce((acc, b) => acc + b.actualCollections, 0);
  const totalBudgetAllocation = divisionBudgets.reduce((acc, b) => acc + b.budgetAllocation, 0);
  const totalIncentiveCost = divisionBudgets.reduce((acc, b) => acc + b.actualIncentiveCost, 0);
  const totalVariance = divisionBudgets.reduce((acc, b) => acc + b.varianceAmount, 0);
  const totalParticipants = divisionBudgets.reduce((acc, b) => acc + b.participantCount, 0);
  const blendedCostRatioPct = totalNetSales > 0 ? (totalIncentiveCost / totalNetSales) * 100 : 0;

  return {
    divisionBudgets,
    divisionSummaries,
    categorySummaries,
    overallTotals: {
      totalNetSales,
      totalCollections,
      totalBudgetAllocation,
      totalIncentiveCost,
      blendedCostRatioPct,
      totalVariance,
      totalParticipants,
    },
  };
}

/**
 * Get Single Division Budget Record by ID
 */
export async function getDivisionBudgetById(id: string): Promise<DivisionBudgetRecord | null> {
  await ensureSchemeAnalyticsTables();
  const pool = getDbPool();

  const res = await pool.query(`SELECT * FROM incentive_division_budgets WHERE id = $1;`, [id]);
  if (res.rows.length === 0) return null;
  const r = res.rows[0];

  return {
    id: r.id,
    period: r.period,
    division: r.division,
    targetSales: parseFloat(r.target_sales) || 0,
    actualSales: parseFloat(r.actual_sales) || 0,
    targetCollections: parseFloat(r.target_collections) || 0,
    actualCollections: parseFloat(r.actual_collections) || 0,
    budgetAllocation: parseFloat(r.budget_allocation) || 0,
    actualIncentiveCost: parseFloat(r.actual_incentive_cost) || 0,
    costRatioPct: parseFloat(r.cost_ratio_pct) || 0,
    varianceAmount: parseFloat(r.variance_amount) || 0,
    participantCount: parseInt(r.participant_count, 10) || 0,
    status: r.status as BudgetStatus,
    notes: r.notes || "",
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  };
}

/**
 * Create Division Budget & Target (CREATE)
 */
export async function createDivisionBudget(data: {
  id?: string;
  period: string;
  division: string;
  targetSales?: number;
  actualSales?: number;
  targetCollections?: number;
  actualCollections?: number;
  budgetAllocation: number;
  actualIncentiveCost?: number;
  participantCount?: number;
  status?: BudgetStatus;
  notes?: string;
}): Promise<DivisionBudgetRecord> {
  await ensureSchemeAnalyticsTables();
  const pool = getDbPool();

  const id = data.id || `BDG-${Date.now()}`;
  const targetSales = Number(data.targetSales) || 0;
  const actualSales = Number(data.actualSales) || 0;
  const targetCollections = Number(data.targetCollections) || 0;
  const actualCollections = Number(data.actualCollections) || 0;
  const budgetAllocation = Number(data.budgetAllocation) || 0;
  const actualIncentiveCost = Number(data.actualIncentiveCost) || 0;
  const participantCount = Number(data.participantCount) || 0;

  const costRatioPct = actualSales > 0 ? (actualIncentiveCost / actualSales) * 100 : 0;
  const varianceAmount = budgetAllocation - actualIncentiveCost;

  let status = data.status;
  if (!status) {
    if (varianceAmount < 0) status = "Budget Exceeded";
    else if (varianceAmount > 0) status = "Under Budget";
    else status = "On Track";
  }

  await pool.query(
    `INSERT INTO incentive_division_budgets (
      id, period, division, target_sales, actual_sales, target_collections, actual_collections,
      budget_allocation, actual_incentive_cost, cost_ratio_pct, variance_amount, participant_count,
      status, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
    [
      id,
      data.period,
      data.division,
      targetSales,
      actualSales,
      targetCollections,
      actualCollections,
      budgetAllocation,
      actualIncentiveCost,
      costRatioPct,
      varianceAmount,
      participantCount,
      status,
      data.notes || null,
    ],
  );

  const created = await getDivisionBudgetById(id);
  if (!created) {
    throw new Error(`Failed to create division budget ${id}`);
  }
  return created;
}

/**
 * Update Division Budget & Target (UPDATE)
 */
export async function updateDivisionBudget(
  id: string,
  data: Partial<DivisionBudgetRecord>,
): Promise<DivisionBudgetRecord> {
  await ensureSchemeAnalyticsTables();
  const pool = getDbPool();

  const existing = await getDivisionBudgetById(id);
  if (!existing) {
    throw new Error(`Division budget ${id} not found.`);
  }

  const period = data.period || existing.period;
  const division = data.division || existing.division;
  const targetSales = data.targetSales !== undefined ? Number(data.targetSales) : existing.targetSales;
  const actualSales = data.actualSales !== undefined ? Number(data.actualSales) : existing.actualSales;
  const targetCollections = data.targetCollections !== undefined ? Number(data.targetCollections) : existing.targetCollections;
  const actualCollections = data.actualCollections !== undefined ? Number(data.actualCollections) : existing.actualCollections;
  const budgetAllocation = data.budgetAllocation !== undefined ? Number(data.budgetAllocation) : existing.budgetAllocation;
  const actualIncentiveCost = data.actualIncentiveCost !== undefined ? Number(data.actualIncentiveCost) : existing.actualIncentiveCost;
  const participantCount = data.participantCount !== undefined ? Number(data.participantCount) : existing.participantCount;
  const notes = data.notes !== undefined ? data.notes : existing.notes;

  const costRatioPct = actualSales > 0 ? (actualIncentiveCost / actualSales) * 100 : 0;
  const varianceAmount = budgetAllocation - actualIncentiveCost;

  let status = data.status;
  if (!status) {
    if (varianceAmount < 0) status = "Budget Exceeded";
    else if (varianceAmount > 0) status = "Under Budget";
    else status = "On Track";
  }

  await pool.query(
    `UPDATE incentive_division_budgets SET
      period = $1,
      division = $2,
      target_sales = $3,
      actual_sales = $4,
      target_collections = $5,
      actual_collections = $6,
      budget_allocation = $7,
      actual_incentive_cost = $8,
      cost_ratio_pct = $9,
      variance_amount = $10,
      participant_count = $11,
      status = $12,
      notes = $13,
      updated_at = NOW()
    WHERE id = $14;`,
    [
      period,
      division,
      targetSales,
      actualSales,
      targetCollections,
      actualCollections,
      budgetAllocation,
      actualIncentiveCost,
      costRatioPct,
      varianceAmount,
      participantCount,
      status,
      notes,
      id,
    ],
  );

  const updated = await getDivisionBudgetById(id);
  if (!updated) {
    throw new Error(`Division budget ${id} not found after update.`);
  }
  return updated;
}

/**
 * Delete Division Budget (DELETE)
 */
export async function deleteDivisionBudget(id: string): Promise<boolean> {
  await ensureSchemeAnalyticsTables();
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_division_budgets WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
