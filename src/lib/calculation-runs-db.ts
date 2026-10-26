import { getDbPool } from "./db";
import {
  type RunStatus,
  type RunType,
  type SchemeRunSummary,
  type RunWarning,
  type RunLogEntry,
  type ReadinessCheck,
} from "@/components/incentive/IncentiveCalculationRunView";

export interface CalculationRunDetails {
  id: string;
  runNo: string;
  period: string;
  division: string;
  selectedSchemes: string;
  runType: RunType;
  dataCutoff: string;
  status: RunStatus;
  runBy: string;
  startedAt?: string;
  finishedAt?: string;
  totalParticipants: number;
  totalDocsRead: number;
  totalGrossCommission: number;
  totalTargetIncentive: number;
  totalPenalty: number;
  totalNetPayable: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  readinessChecks: ReadinessCheck[];
  schemeSummaries: SchemeRunSummary[];
  warnings: RunWarning[];
  logs: RunLogEntry[];
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

export async function ensureCalculationRunsTables(): Promise<void> {
  const pool = getDbPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_calculation_runs (
      id VARCHAR(64) PRIMARY KEY,
      run_no VARCHAR(64) UNIQUE NOT NULL,
      period VARCHAR(64) NOT NULL,
      division VARCHAR(128) NOT NULL,
      selected_schemes TEXT NOT NULL,
      run_type VARCHAR(64) NOT NULL,
      data_cutoff VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'Draft',
      run_by VARCHAR(128) NOT NULL,
      started_at VARCHAR(64),
      finished_at VARCHAR(64),
      total_participants INT NOT NULL DEFAULT 0,
      total_docs_read INT NOT NULL DEFAULT 0,
      total_gross_commission NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      total_target_incentive NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      total_penalty NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      total_net_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calculation_run_readiness_checks (
      id VARCHAR(64) PRIMARY KEY,
      run_id VARCHAR(64) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
      module_name VARCHAR(128) NOT NULL,
      required_state VARCHAR(64) NOT NULL,
      current_state VARCHAR(64) NOT NULL,
      is_ready BOOLEAN NOT NULL DEFAULT TRUE,
      signer VARCHAR(128) NOT NULL,
      last_updated VARCHAR(64) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calculation_run_scheme_summaries (
      id VARCHAR(64) PRIMARY KEY,
      run_id VARCHAR(64) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
      scheme_code VARCHAR(64) NOT NULL,
      scheme_name VARCHAR(150) NOT NULL,
      division VARCHAR(128) NOT NULL,
      participants INT NOT NULL DEFAULT 0,
      documents_read INT NOT NULL DEFAULT 0,
      gross_commission NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      target_incentive NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      penalty NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      net_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      warnings_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calculation_run_warnings (
      id VARCHAR(64) PRIMARY KEY,
      run_id VARCHAR(64) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
      code VARCHAR(32) NOT NULL,
      scheme_code VARCHAR(64) NOT NULL,
      participant_name VARCHAR(128) NOT NULL,
      severity VARCHAR(32) NOT NULL DEFAULT 'Medium',
      message TEXT NOT NULL,
      remediation TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calculation_run_logs (
      id VARCHAR(64) PRIMARY KEY,
      run_id VARCHAR(64) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
      timestamp VARCHAR(64) NOT NULL,
      level VARCHAR(32) NOT NULL DEFAULT 'INFO',
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    UPDATE incentive_calculation_runs 
    SET status = 'Posted', run_type = 'Final Calculation' 
    WHERE id = 'RUN-2026-04-FIN-01' AND status != 'Posted';
  `);

  const cntRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM incentive_calculation_runs WHERE id = 'RUN-2026-05-PRE-01';`);
  if (cntRes.rows[0].cnt === 0) {
    await pool.query(`
      INSERT INTO incentive_calculation_runs (
        id, run_no, period, division, selected_schemes, run_type, data_cutoff,
        status, run_by, started_at, finished_at, total_participants, total_docs_read,
        total_gross_commission, total_target_incentive, total_penalty, total_net_payable, notes
      ) VALUES
      (
        'RUN-2026-05-PRE-01', 'RUN-2026-05-PRE-01', 'May 2026', 'All Divisions', 'All Active Schemes (4 Schemes)',
        'Simulation', '12-May-2026 23:59:59', 'Simulated', 'Lakmal Perera (Incentive Administrator)',
        '12-May-2026 10:15:20', '12-May-2026 10:16:04', 34, 1735,
        2865000.00, 1240000.00, 122000.00, 3983000.00,
        'Preliminary MTD Simulation run for May 2026 across 4 business divisions.'
      ),
      (
        'RUN-2026-04-FIN-01', 'RUN-2026-04-FIN-01', 'April 2026', 'All Divisions', 'All Active Schemes (4 Schemes)',
        'Final Calculation', '30-Apr-2026 23:59:59', 'Posted', 'Lakmal Perera (Incentive Administrator)',
        '02-May-2026 09:30:15', '02-May-2026 09:31:02', 34, 1680,
        2750000.00, 1210000.00, 70000.00, 3890000.00,
        'April 2026 Official Final Payout Run. Posted to SAP B1 Journal Voucher #JV-2026-04-088.'
      )
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO calculation_run_readiness_checks (
        id, run_id, module_name, required_state, current_state, is_ready, signer, last_updated
      ) VALUES
        ('chk-2026-05-1', 'RUN-2026-05-PRE-01', 'Monthly Target Quotas', 'Locked & Approved', 'Locked & Approved', TRUE, 'Lakmal Perera (Incentive Administrator)', '12-May-2026 11:20 IST'),
        ('chk-2026-05-2', 'RUN-2026-05-PRE-01', 'Attendance & Leave Import', 'Approved by HR', 'Approved by HR', TRUE, 'Niluka Senaratne (HR Manager)', '12-May-2026 15:45 IST'),
        ('chk-2026-05-3', 'RUN-2026-05-PRE-01', 'Service Performance Data', 'Locked by HOD', 'Locked by HOD', TRUE, 'Chaminda Warnakula (Service HOD)', '12-May-2026 16:10 IST'),
        ('chk-2026-05-4', 'RUN-2026-05-PRE-01', 'SAP B1 Debtor Aging Ledger', 'Synchronized', 'Synchronized (0-120+ Days)', TRUE, 'SAP Integration Engine', '12-May-2026 18:00 IST')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO calculation_run_scheme_summaries (
        id, run_id, scheme_code, scheme_name, division, participants,
        documents_read, gross_commission, target_incentive, penalty, net_payable, warnings_count
      ) VALUES
        ('sum-2026-05-1', 'RUN-2026-05-PRE-01', 'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Consumer Electronics', 12, 842, 485000.00, 320000.00, 25000.00, 780000.00, 1),
        ('sum-2026-05-2', 'RUN-2026-05-PRE-01', 'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Commercial Air Conditioning', 10, 416, 1250000.00, 450000.00, 62000.00, 1638000.00, 2),
        ('sum-2026-05-3', 'RUN-2026-05-PRE-01', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Consumer Electronics', 8, 363, 310000.00, 280000.00, 35000.00, 555000.00, 2),
        ('sum-2026-05-4', 'RUN-2026-05-PRE-01', 'SCH-SOLAR-2026', 'Renewable Energy Solar Consultant Incentive', 'Renewable Energy', 4, 114, 820000.00, 190000.00, 0.00, 1010000.00, 0)
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO calculation_run_warnings (
        id, run_id, code, scheme_code, participant_name, severity, message, remediation
      ) VALUES
        ('wrn-2026-05-1', 'RUN-2026-05-PRE-01', 'WRN-ATT-04', 'SCH-SRV-2026', 'Dilshan Madusanka (EMP-1024)', 'High', 'Technician logged 3 unapproved absent days; 0% attendance factor applied (INC-BCR-10 Proposed Demo Rule).', 'Verify with HR if authorized exemption applies before final payout sign-off.'),
        ('wrn-2026-05-2', 'RUN-2026-05-PRE-01', 'WRN-DEBT-12', 'SCH-CAC-2026', 'Pradeep Bandara (EMP-1022)', 'Medium', 'Invoice INV-2026-9042 overdue by 94 days; 15% debtor aging penalty deducted (LKR 28,500).', 'Recoverable upon customer settlement in upcoming settlement cycles.'),
        ('wrn-2026-05-3', 'RUN-2026-05-PRE-01', 'WRN-REP-02', 'SCH-SRV-2026', 'Mahesh Gunawardena (EMP-1030)', 'High', 'Repeat call #SRV-2026-1015 flagged as Poor Workmanship; job excluded from eligible count.', 'HOD classification confirmed after callback inspection.'),
        ('wrn-2026-05-4', 'RUN-2026-05-PRE-01', 'WRN-TGT-01', 'SCH-SLS-2026', 'Kasun Jayawardena (EMP-1021)', 'Low', 'Turnover achievement reached 164.2%; incentive capped at Tier 5 Super Achiever slab ceiling.', 'Informational only; payout capped as configured in Target Slab Table.'),
        ('wrn-2026-05-5', 'RUN-2026-05-PRE-01', 'WRN-DEBT-18', 'SCH-CAC-2026', 'Ruwan Wijesinghe (EMP-1023)', 'Medium', 'Partial payment receipt detected on invoice INV-2026-8911; pro-rata commission calculated.', 'Remaining balance will calculate upon subsequent collection.')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO calculation_run_logs (
        id, run_id, timestamp, level, message
      ) VALUES
        ('log-2026-05-1', 'RUN-2026-05-PRE-01', '10:15:20.102', 'INFO', 'Engine initialized. Configuration validated for period May 2026.'),
        ('log-2026-05-2', 'RUN-2026-05-PRE-01', '10:15:21.430', 'INFO', 'Connecting to SAP Business One Service Layer API... Connected (Latency 14ms).'),
        ('log-2026-05-3', 'RUN-2026-05-PRE-01', '10:15:22.015', 'INFO', 'Ingested 1,735 source documents: 1,258 invoices, 363 service tickets, 114 solar contracts.'),
        ('log-2026-05-4', 'RUN-2026-05-PRE-01', '10:15:25.800', 'DEBUG', 'Evaluating Target Slab Table v2.1 for Retail Showroom Sales (12 participants).'),
        ('log-2026-05-5', 'RUN-2026-05-PRE-01', '10:15:32.410', 'WARN', 'WRN-ATT-04: Dilshan Madusanka (EMP-1024) 3 absent days. Calculated 0% factor.'),
        ('log-2026-05-6', 'RUN-2026-05-PRE-01', '10:15:38.220', 'DEBUG', 'Executing payment-term aging matrix against open receivables ledger.'),
        ('log-2026-05-7', 'RUN-2026-05-PRE-01', '10:15:45.900', 'WARN', 'WRN-DEBT-12: Applied 15% debtor aging penalty on overdue invoice INV-2026-9042.'),
        ('log-2026-05-8', 'RUN-2026-05-PRE-01', '10:15:58.100', 'INFO', 'Net payable reconciliation completed across all 4 schemes. Net Pool: LKR 3,983,000.'),
        ('log-2026-05-9', 'RUN-2026-05-PRE-01', '10:16:04.110', 'SUCCESS', 'Run finished successfully in 44.008s. Generated 5 warnings.')
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}

/**
 * Get all Incentive Calculation Runs from PostgreSQL
 */
export async function getAllCalculationRuns(
  period?: string,
): Promise<CalculationRunDetails[]> {
  await ensureCalculationRunsTables();
  const pool = getDbPool();

  let query = `SELECT * FROM incentive_calculation_runs WHERE 1=1`;
  const params: any[] = [];

  if (period) {
    params.push(period);
    query += ` AND period = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC;`;

  const runsRes = await pool.query(query, params);
  const rows = runsRes.rows || [];

  const runs: CalculationRunDetails[] = [];

  for (const r of rows) {
    // 1. Fetch readiness checks
    const checksRes = await pool.query(
      `SELECT * FROM calculation_run_readiness_checks WHERE run_id = $1 ORDER BY id ASC;`,
      [r.id],
    );
    const readinessChecks: ReadinessCheck[] = checksRes.rows.map((c) => ({
      id: c.id,
      moduleName: c.module_name,
      requiredState: c.required_state,
      currentState: c.current_state,
      isReady: Boolean(c.is_ready),
      signer: c.signer,
      lastUpdated: c.last_updated,
    }));

    // 2. Fetch scheme summaries
    const summariesRes = await pool.query(
      `SELECT * FROM calculation_run_scheme_summaries WHERE run_id = $1 ORDER BY id ASC;`,
      [r.id],
    );
    const schemeSummaries: SchemeRunSummary[] = summariesRes.rows.map((s) => ({
      schemeCode: s.scheme_code,
      schemeName: s.scheme_name,
      division: s.division,
      participants: parseInt(s.participants) || 0,
      documentsRead: parseInt(s.documents_read) || 0,
      grossCommission: parseFloat(s.gross_commission) || 0,
      targetIncentive: parseFloat(s.target_incentive) || 0,
      penalty: parseFloat(s.penalty) || 0,
      netPayable: parseFloat(s.net_payable) || 0,
      warningsCount: parseInt(s.warnings_count) || 0,
    }));

    // 3. Fetch warnings
    const warningsRes = await pool.query(
      `SELECT * FROM calculation_run_warnings WHERE run_id = $1 ORDER BY id ASC;`,
      [r.id],
    );
    const warnings: RunWarning[] = warningsRes.rows.map((w) => ({
      id: w.id,
      code: w.code,
      schemeCode: w.scheme_code,
      participantName: w.participant_name,
      severity: w.severity as any,
      message: w.message,
      remediation: w.remediation,
    }));

    // 4. Fetch logs
    const logsRes = await pool.query(
      `SELECT * FROM calculation_run_logs WHERE run_id = $1 ORDER BY id ASC;`,
      [r.id],
    );
    const logs: RunLogEntry[] = logsRes.rows.map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      level: l.level as any,
      message: l.message,
    }));

    runs.push({
      id: r.id,
      runNo: r.run_no,
      period: r.period,
      division: r.division,
      selectedSchemes: r.selected_schemes,
      runType: r.run_type as RunType,
      dataCutoff: r.data_cutoff,
      status: r.status as RunStatus,
      runBy: r.run_by,
      startedAt: r.started_at || "",
      finishedAt: r.finished_at || "",
      totalParticipants: parseInt(r.total_participants) || 0,
      totalDocsRead: parseInt(r.total_docs_read) || 0,
      totalGrossCommission: parseFloat(r.total_gross_commission) || 0,
      totalTargetIncentive: parseFloat(r.total_target_incentive) || 0,
      totalPenalty: parseFloat(r.total_penalty) || 0,
      totalNetPayable: parseFloat(r.total_net_payable) || 0,
      notes: r.notes || "",
      createdAt: formatDateTime(r.created_at),
      updatedAt: formatDateTime(r.updated_at),
      readinessChecks,
      schemeSummaries,
      warnings,
      logs,
    });
  }

  return runs;
}

/**
 * Get single Calculation Run by ID
 */
export async function getCalculationRunById(
  id: string,
): Promise<CalculationRunDetails | null> {
  await ensureCalculationRunsTables();
  const pool = getDbPool();
  const res = await pool.query(`SELECT * FROM incentive_calculation_runs WHERE id = $1;`, [id]);
  if (!res.rows || res.rows.length === 0) return null;

  const r = res.rows[0];

  const checksRes = await pool.query(
    `SELECT * FROM calculation_run_readiness_checks WHERE run_id = $1 ORDER BY id ASC;`,
    [r.id],
  );
  const readinessChecks: ReadinessCheck[] = checksRes.rows.map((c) => ({
    id: c.id,
    moduleName: c.module_name,
    requiredState: c.required_state,
    currentState: c.current_state,
    isReady: Boolean(c.is_ready),
    signer: c.signer,
    lastUpdated: c.last_updated,
  }));

  const summariesRes = await pool.query(
    `SELECT * FROM calculation_run_scheme_summaries WHERE run_id = $1 ORDER BY id ASC;`,
    [r.id],
  );
  const schemeSummaries: SchemeRunSummary[] = summariesRes.rows.map((s) => ({
    schemeCode: s.scheme_code,
    schemeName: s.scheme_name,
    division: s.division,
    participants: parseInt(s.participants) || 0,
    documentsRead: parseInt(s.documents_read) || 0,
    grossCommission: parseFloat(s.gross_commission) || 0,
    targetIncentive: parseFloat(s.target_incentive) || 0,
    penalty: parseFloat(s.penalty) || 0,
    netPayable: parseFloat(s.net_payable) || 0,
    warningsCount: parseInt(s.warnings_count) || 0,
  }));

  const warningsRes = await pool.query(
    `SELECT * FROM calculation_run_warnings WHERE run_id = $1 ORDER BY id ASC;`,
    [r.id],
  );
  const warnings: RunWarning[] = warningsRes.rows.map((w) => ({
    id: w.id,
    code: w.code,
    schemeCode: w.scheme_code,
    participantName: w.participant_name,
    severity: w.severity as any,
    message: w.message,
    remediation: w.remediation,
  }));

  const logsRes = await pool.query(
    `SELECT * FROM calculation_run_logs WHERE run_id = $1 ORDER BY id ASC;`,
    [r.id],
  );
  const logs: RunLogEntry[] = logsRes.rows.map((l) => ({
    id: l.id,
    timestamp: l.timestamp,
    level: l.level as any,
    message: l.message,
  }));

  return {
    id: r.id,
    runNo: r.run_no,
    period: r.period,
    division: r.division,
    selectedSchemes: r.selected_schemes,
    runType: r.run_type as RunType,
    dataCutoff: r.data_cutoff,
    status: r.status as RunStatus,
    runBy: r.run_by,
    startedAt: r.started_at || "",
    finishedAt: r.finished_at || "",
    totalParticipants: parseInt(r.total_participants) || 0,
    totalDocsRead: parseInt(r.total_docs_read) || 0,
    totalGrossCommission: parseFloat(r.total_gross_commission) || 0,
    totalTargetIncentive: parseFloat(r.total_target_incentive) || 0,
    totalPenalty: parseFloat(r.total_penalty) || 0,
    totalNetPayable: parseFloat(r.total_net_payable) || 0,
    notes: r.notes || "",
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
    readinessChecks,
    schemeSummaries,
    warnings,
    logs,
  };
}

/**
 * Create a new Incentive Calculation Run in PostgreSQL
 */
export async function createCalculationRun(
  data: Partial<CalculationRunDetails>,
): Promise<CalculationRunDetails> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const id = data.id || `RUN-${(data.period || "2026-05").replace(" ", "-").toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const runNo = data.runNo || id;
    const period = data.period || "May 2026";
    const division = data.division || "All Divisions";
    const selectedSchemes = data.selectedSchemes || "All Active Schemes (4 Schemes)";
    const runType = data.runType || "Simulation";
    const dataCutoff = data.dataCutoff || new Date().toISOString().slice(0, 19).replace("T", " ");
    const status = data.status || (runType === "Simulation" ? "Simulated" : "Calculated");
    const runBy = data.runBy || "Incentive Administrator";
    const startedAt = data.startedAt || new Date().toISOString().slice(0, 19).replace("T", " ");
    const finishedAt = data.finishedAt || new Date().toISOString().slice(0, 19).replace("T", " ");
    const totalParticipants = data.totalParticipants ?? (data.schemeSummaries?.reduce((acc, s) => acc + s.participants, 0) || 0);
    const totalDocsRead = data.totalDocsRead ?? (data.schemeSummaries?.reduce((acc, s) => acc + s.documentsRead, 0) || 0);
    const totalGrossCommission = data.totalGrossCommission ?? (data.schemeSummaries?.reduce((acc, s) => acc + s.grossCommission, 0) || 0);
    const totalTargetIncentive = data.totalTargetIncentive ?? (data.schemeSummaries?.reduce((acc, s) => acc + s.targetIncentive, 0) || 0);
    const totalPenalty = data.totalPenalty ?? (data.schemeSummaries?.reduce((acc, s) => acc + s.penalty, 0) || 0);
    const totalNetPayable = data.totalNetPayable ?? (data.schemeSummaries?.reduce((acc, s) => acc + s.netPayable, 0) || 0);
    const notes = data.notes || "";

    // 1. Insert header
    await client.query(
      `INSERT INTO incentive_calculation_runs (
        id, run_no, period, division, selected_schemes, run_type, data_cutoff,
        status, run_by, started_at, finished_at, total_participants, total_docs_read,
        total_gross_commission, total_target_incentive, total_penalty, total_net_payable, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`,
      [
        id, runNo, period, division, selectedSchemes, runType, dataCutoff,
        status, runBy, startedAt, finishedAt, totalParticipants, totalDocsRead,
        totalGrossCommission, totalTargetIncentive, totalPenalty, totalNetPayable, notes,
      ],
    );

    // 2. Insert Readiness Checks
    if (data.readinessChecks && data.readinessChecks.length > 0) {
      for (const [idx, c] of data.readinessChecks.entries()) {
        const checkId = c.id || `chk-${id.slice(-6)}-${idx + 1}`;
        await client.query(
          `INSERT INTO calculation_run_readiness_checks (
            id, run_id, module_name, required_state, current_state, is_ready, signer, last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            checkId, id, c.moduleName, c.requiredState, c.currentState,
            c.isReady ?? true, c.signer || runBy, c.lastUpdated || startedAt,
          ],
        );
      }
    }

    // 3. Insert Scheme Summaries
    if (data.schemeSummaries && data.schemeSummaries.length > 0) {
      for (const [idx, s] of data.schemeSummaries.entries()) {
        const sumId = `sum-${id.slice(-6)}-${idx + 1}`;
        await client.query(
          `INSERT INTO calculation_run_scheme_summaries (
            id, run_id, scheme_code, scheme_name, division, participants,
            documents_read, gross_commission, target_incentive, penalty, net_payable, warnings_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
          [
            sumId, id, s.schemeCode, s.schemeName, s.division, s.participants ?? 0,
            s.documentsRead ?? 0, s.grossCommission ?? 0, s.targetIncentive ?? 0,
            s.penalty ?? 0, s.netPayable ?? 0, s.warningsCount ?? 0,
          ],
        );
      }
    }

    // 4. Insert Warnings
    if (data.warnings && data.warnings.length > 0) {
      for (const [idx, w] of data.warnings.entries()) {
        const warnId = w.id || `wrn-${id.slice(-6)}-${idx + 1}`;
        await client.query(
          `INSERT INTO calculation_run_warnings (
            id, run_id, code, scheme_code, participant_name, severity, message, remediation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            warnId, id, w.code, w.schemeCode, w.participantName,
            w.severity || "Medium", w.message, w.remediation,
          ],
        );
      }
    }

    // 5. Insert Logs
    if (data.logs && data.logs.length > 0) {
      for (const [idx, l] of data.logs.entries()) {
        const logId = l.id || `log-${id.slice(-6)}-${idx + 1}`;
        await client.query(
          `INSERT INTO calculation_run_logs (
            id, run_id, timestamp, level, message
          ) VALUES ($1, $2, $3, $4, $5);`,
          [logId, id, l.timestamp, l.level || "INFO", l.message],
        );
      }
    }

    await client.query("COMMIT;");

    const created = await getCalculationRunById(id);
    return created!;
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error creating calculation run:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update Calculation Run in PostgreSQL
 */
export async function updateCalculationRun(
  id: string,
  data: Partial<CalculationRunDetails>,
): Promise<CalculationRunDetails | null> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const existing = await getCalculationRunById(id);
    if (!existing) {
      await client.query("ROLLBACK;");
      return null;
    }

    const period = data.period || existing.period;
    const division = data.division || existing.division;
    const selectedSchemes = data.selectedSchemes || existing.selectedSchemes;
    const runType = data.runType || existing.runType;
    const dataCutoff = data.dataCutoff || existing.dataCutoff;
    const status = data.status || existing.status;
    const runBy = data.runBy || existing.runBy;
    const notes = data.notes !== undefined ? data.notes : existing.notes;
    const finishedAt = data.finishedAt || existing.finishedAt;
    const totalParticipants = data.totalParticipants ?? existing.totalParticipants;
    const totalDocsRead = data.totalDocsRead ?? existing.totalDocsRead;
    const totalGrossCommission = data.totalGrossCommission ?? existing.totalGrossCommission;
    const totalTargetIncentive = data.totalTargetIncentive ?? existing.totalTargetIncentive;
    const totalPenalty = data.totalPenalty ?? existing.totalPenalty;
    const totalNetPayable = data.totalNetPayable ?? existing.totalNetPayable;

    // 1. Update header
    await client.query(
      `UPDATE incentive_calculation_runs SET
        period = $1, division = $2, selected_schemes = $3, run_type = $4, data_cutoff = $5,
        status = $6, run_by = $7, notes = $8, finished_at = $9,
        total_participants = $10, total_docs_read = $11, total_gross_commission = $12,
        total_target_incentive = $13, total_penalty = $14, total_net_payable = $15,
        updated_at = NOW()
      WHERE id = $16;`,
      [
        period, division, selectedSchemes, runType, dataCutoff,
        status, runBy, notes, finishedAt,
        totalParticipants, totalDocsRead, totalGrossCommission,
        totalTargetIncentive, totalPenalty, totalNetPayable, id,
      ],
    );

    // 2. Overwrite summaries if provided
    if (data.schemeSummaries && data.schemeSummaries.length > 0) {
      await client.query(`DELETE FROM calculation_run_scheme_summaries WHERE run_id = $1;`, [id]);
      for (const [idx, s] of data.schemeSummaries.entries()) {
        const sumId = `sum-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;
        await client.query(
          `INSERT INTO calculation_run_scheme_summaries (
            id, run_id, scheme_code, scheme_name, division, participants,
            documents_read, gross_commission, target_incentive, penalty, net_payable, warnings_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
          [
            sumId, id, s.schemeCode, s.schemeName, s.division, s.participants ?? 0,
            s.documentsRead ?? 0, s.grossCommission ?? 0, s.targetIncentive ?? 0,
            s.penalty ?? 0, s.netPayable ?? 0, s.warningsCount ?? 0,
          ],
        );
      }
    }

    // 3. Append new log entry if provided
    if (data.logs && data.logs.length > 0) {
      for (const l of data.logs) {
        const logId = l.id || `log-${Date.now().toString().slice(-6)}`;
        await client.query(
          `INSERT INTO calculation_run_logs (id, run_id, timestamp, level, message)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING;`,
          [logId, id, l.timestamp, l.level, l.message],
        );
      }
    }

    await client.query("COMMIT;");
    return await getCalculationRunById(id);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error updating calculation run:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update Calculation Run Status
 */
export async function updateCalculationRunStatus(
  id: string,
  status: RunStatus,
  notes?: string,
  user?: string,
): Promise<CalculationRunDetails | null> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    await client.query(
      `UPDATE incentive_calculation_runs SET
        status = $1,
        notes = COALESCE($2, notes),
        updated_at = NOW()
      WHERE id = $3;`,
      [status, notes || null, id],
    );

    // Insert log entry for status change
    const logId = `log-${Date.now().toString().slice(-6)}`;
    const ts = new Date().toLocaleTimeString();
    await client.query(
      `INSERT INTO calculation_run_logs (id, run_id, timestamp, level, message)
       VALUES ($1, $2, $3, $4, $5);`,
      [
        logId,
        id,
        ts,
        "INFO",
        `Run status transitioned to ${status} by ${user || "Incentive Administrator"}. ${notes || ""}`.trim(),
      ],
    );

    await client.query("COMMIT;");
    return await getCalculationRunById(id);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error updating run status:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Delete a Calculation Run
 */
export async function deleteCalculationRun(id: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_calculation_runs WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
