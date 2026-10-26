import { getDbPool } from "./db";
import { type ParticipantCalculationResult } from "@/components/incentive/CalculationResultsDetailView";

export interface CalculationResultBatchDetails {
  id: string;
  period: string;
  runDate: string;
  status: "Calculated" | "Verified" | "Held" | "Approved";
  runType: string;
  totalParticipants: number;
  grossCommissionLkr: number;
  targetIncentiveLkr: number;
  penaltyClawbackLkr: number;
  netPayableLkr: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  participantResults: ParticipantCalculationResult[];
  auditLogs: {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    action: string;
    details: string;
  }[];
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Get all Calculation Result Batches from PostgreSQL
 */
export async function getAllCalculationBatches(
  period?: string,
): Promise<CalculationResultBatchDetails[]> {
  const pool = getDbPool();

  let query = `SELECT * FROM calculation_result_batches WHERE 1=1`;
  const params: any[] = [];

  if (period) {
    params.push(period);
    query += ` AND period = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC;`;

  const res = await pool.query(query, params);
  const batches: CalculationResultBatchDetails[] = [];

  for (const b of res.rows) {
    // 1. Fetch participant results
    const resultsRes = await pool.query(
      `SELECT * FROM calculation_participant_results WHERE batch_id = $1 ORDER BY sort_order ASC, technician_code ASC;`,
      [b.id],
    );
    const participantResults: ParticipantCalculationResult[] = resultsRes.rows.map((r) => ({
      id: r.id,
      technicianCode: r.technician_code,
      technicianName: r.technician_name,
      role: r.role,
      division: r.division,
      schemeCode: r.scheme_code,
      schemeName: r.scheme_name,
      targetVolume: parseFloat(r.target_volume) || 0,
      actualVolume: parseFloat(r.actual_volume) || 0,
      volumePct: parseFloat(r.volume_pct) || 0,
      targetTurnover: parseFloat(r.target_turnover) || 0,
      actualTurnover: parseFloat(r.actual_turnover) || 0,
      turnoverPct: parseFloat(r.turnover_pct) || 0,
      slabTier: r.slab_tier,
      slabMultiplier: parseFloat(r.slab_multiplier) || 1.0,
      grossCommission: parseFloat(r.gross_commission) || 0,
      targetIncentive: parseFloat(r.target_incentive) || 0,
      attendanceFactor: parseFloat(r.attendance_factor) || 1.0,
      penaltyClawback: parseFloat(r.penalty_clawback) || 0,
      netPayable: parseFloat(r.net_payable) || 0,
      status: r.status as any,
      jobCount: parseInt(r.job_count) || 0,
      overdueInvoiceCount: parseInt(r.overdue_invoice_count) || 0,
      notes: r.notes || "",
    }));

    // 2. Fetch audit logs
    const auditRes = await pool.query(
      `SELECT * FROM calculation_result_audit_logs WHERE batch_id = $1 ORDER BY created_at DESC;`,
      [b.id],
    );
    const auditLogs = auditRes.rows.map((a) => ({
      id: a.id,
      timestamp: a.timestamp,
      user: a.user_name,
      role: a.user_role,
      action: a.action,
      details: a.details || "",
    }));

    batches.push({
      id: b.id,
      period: b.period,
      runDate: b.run_date,
      status: b.status,
      runType: b.run_type,
      totalParticipants: parseInt(b.total_participants) || participantResults.length,
      grossCommissionLkr: parseFloat(b.gross_commission_lkr) || 0,
      targetIncentiveLkr: parseFloat(b.target_incentive_lkr) || 0,
      penaltyClawbackLkr: parseFloat(b.penalty_clawback_lkr) || 0,
      netPayableLkr: parseFloat(b.net_payable_lkr) || 0,
      notes: b.notes || "",
      createdAt: formatDateTime(b.created_at),
      updatedAt: formatDateTime(b.updated_at),
      participantResults,
      auditLogs,
    });
  }

  return batches;
}

/**
 * Get single Calculation Result Batch by ID
 */
export async function getCalculationBatchById(
  id: string,
): Promise<CalculationResultBatchDetails | null> {
  const pool = getDbPool();
  const res = await pool.query(`SELECT * FROM calculation_result_batches WHERE id = $1;`, [id]);
  if (!res.rows || res.rows.length === 0) return null;

  const b = res.rows[0];

  const resultsRes = await pool.query(
    `SELECT * FROM calculation_participant_results WHERE batch_id = $1 ORDER BY sort_order ASC, technician_code ASC;`,
    [id],
  );
  const participantResults: ParticipantCalculationResult[] = resultsRes.rows.map((r) => ({
    id: r.id,
    technicianCode: r.technician_code,
    technicianName: r.technician_name,
    role: r.role,
    division: r.division,
    schemeCode: r.scheme_code,
    schemeName: r.scheme_name,
    targetVolume: parseFloat(r.target_volume) || 0,
    actualVolume: parseFloat(r.actual_volume) || 0,
    volumePct: parseFloat(r.volume_pct) || 0,
    targetTurnover: parseFloat(r.target_turnover) || 0,
    actualTurnover: parseFloat(r.actual_turnover) || 0,
    turnoverPct: parseFloat(r.turnover_pct) || 0,
    slabTier: r.slab_tier,
    slabMultiplier: parseFloat(r.slab_multiplier) || 1.0,
    grossCommission: parseFloat(r.gross_commission) || 0,
    targetIncentive: parseFloat(r.target_incentive) || 0,
    attendanceFactor: parseFloat(r.attendance_factor) || 1.0,
    penaltyClawback: parseFloat(r.penalty_clawback) || 0,
    netPayable: parseFloat(r.net_payable) || 0,
    status: r.status as any,
    jobCount: parseInt(r.job_count) || 0,
    overdueInvoiceCount: parseInt(r.overdue_invoice_count) || 0,
    notes: r.notes || "",
  }));

  const auditRes = await pool.query(
    `SELECT * FROM calculation_result_audit_logs WHERE batch_id = $1 ORDER BY created_at DESC;`,
    [id],
  );
  const auditLogs = auditRes.rows.map((a) => ({
    id: a.id,
    timestamp: a.timestamp,
    user: a.user_name,
    role: a.user_role,
    action: a.action,
    details: a.details || "",
  }));

  return {
    id: b.id,
    period: b.period,
    runDate: b.run_date,
    status: b.status,
    runType: b.run_type,
    totalParticipants: parseInt(b.total_participants) || participantResults.length,
    grossCommissionLkr: parseFloat(b.gross_commission_lkr) || 0,
    targetIncentiveLkr: parseFloat(b.target_incentive_lkr) || 0,
    penaltyClawbackLkr: parseFloat(b.penalty_clawback_lkr) || 0,
    netPayableLkr: parseFloat(b.net_payable_lkr) || 0,
    notes: b.notes || "",
    createdAt: formatDateTime(b.created_at),
    updatedAt: formatDateTime(b.updated_at),
    participantResults,
    auditLogs,
  };
}

/**
 * Create a new Calculation Result Batch in PostgreSQL
 */
export async function createCalculationBatch(
  b: Partial<CalculationResultBatchDetails>,
): Promise<CalculationResultBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const id = b.id || `RUN-${Date.now().toString().slice(-6)}`;
    const period = b.period || "May 2026";
    const runDate = b.runDate || `${new Date().toLocaleDateString("en-GB")} IST`;
    const status = b.status || "Calculated";
    const runType = b.runType || "MTD Simulation";
    const notes = b.notes || "";

    const participants = b.participantResults || [];
    const totalParticipants = participants.length;
    const grossCommissionLkr = participants.reduce((acc, r) => acc + (r.grossCommission || 0), 0);
    const targetIncentiveLkr = participants.reduce((acc, r) => acc + (r.targetIncentive || 0), 0);
    const penaltyClawbackLkr = participants.reduce((acc, r) => acc + (r.penaltyClawback || 0), 0);
    const netPayableLkr = participants.reduce((acc, r) => acc + (r.netPayable || 0), 0);

    // 1. Insert Batch Header
    await client.query(
      `INSERT INTO calculation_result_batches (
        id, period, run_date, status, run_type, total_participants,
        gross_commission_lkr, target_incentive_lkr, penalty_clawback_lkr, net_payable_lkr, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        id,
        period,
        runDate,
        status,
        runType,
        totalParticipants,
        grossCommissionLkr,
        targetIncentiveLkr,
        penaltyClawbackLkr,
        netPayableLkr,
        notes,
      ],
    );

    // 2. Insert Participant Results
    for (const [idx, r] of participants.entries()) {
      const resultId = r.id || `calc-${id.slice(-6)}-${idx + 1}`;
      await client.query(
        `INSERT INTO calculation_participant_results (
          id, batch_id, technician_code, technician_name, role, division,
          scheme_code, scheme_name, target_volume, actual_volume, volume_pct,
          target_turnover, actual_turnover, turnover_pct, slab_tier, slab_multiplier,
          gross_commission, target_incentive, attendance_factor, penalty_clawback,
          net_payable, status, job_count, overdue_invoice_count, notes, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26);`,
        [
          resultId,
          id,
          r.technicianCode || (r as any).participantCode || "",
          r.technicianName || (r as any).name || "",
          r.role || "",
          r.division || (r as any).branch || "",
          r.schemeCode || "",
          r.schemeName || "",
          r.targetVolume ?? 0,
          r.actualVolume ?? 0,
          r.volumePct ?? (r as any).volumeAchievementPct ?? 0,
          r.targetTurnover ?? (r as any).targetTurnoverLkr ?? 0,
          r.actualTurnover ?? (r as any).actualTurnoverLkr ?? 0,
          r.turnoverPct ?? (r as any).turnoverAchievementPct ?? 0,
          r.slabTier || "Tier 1",
          r.slabMultiplier ?? 1.0,
          r.grossCommission ?? (r as any).grossCommissionLkr ?? 0,
          r.targetIncentive ?? (r as any).targetIncentiveLkr ?? 0,
          r.attendanceFactor ?? 1.0,
          r.penaltyClawback ?? (r as any).penaltyClawbackLkr ?? 0,
          r.netPayable ?? (r as any).netPayableLkr ?? 0,
          r.status || "Calculated",
          r.jobCount ?? 0,
          r.overdueInvoiceCount ?? 0,
          r.notes || "",
          idx + 1,
        ],
      );
    }

    // 3. Insert Audit Log
    await client.query(
      `INSERT INTO calculation_result_audit_logs (
        id, batch_id, timestamp, user_name, user_role, action, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        `craud-${Date.now().toString().slice(-6)}`,
        id,
        runDate,
        "Incentive Batch Engine",
        "System Engine",
        "Calculation Batch Initialized",
        `Created calculation results batch for ${period} with ${totalParticipants} participants. Total Net Payable: LKR ${netPayableLkr.toLocaleString()}.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const created = await getCalculationBatchById(id);
    if (!created) {
      throw new Error(`Failed to retrieve created calculation batch ${id}`);
    }
    return created;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error("Error creating calculation batch:", error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update Calculation Batch and overwrite participant results in PostgreSQL
 */
export async function updateCalculationBatch(
  id: string,
  b: Partial<CalculationResultBatchDetails>,
): Promise<CalculationResultBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const existing = await client.query(`SELECT * FROM calculation_result_batches WHERE id = $1;`, [id]);
    if (!existing.rows || existing.rows.length === 0) {
      clientReleased = true;
      client.release();
      return await createCalculationBatch({ ...b, id });
    }

    const cur = existing.rows[0];
    const period = b.period !== undefined ? b.period : cur.period;
    const runDate = b.runDate !== undefined ? b.runDate : cur.run_date;
    const status = b.status !== undefined ? b.status : cur.status;
    const runType = b.runType !== undefined ? b.runType : cur.run_type;
    const notes = b.notes !== undefined ? b.notes : cur.notes;

    const participants = b.participantResults || [];
    const totalParticipants = participants.length > 0 ? participants.length : parseInt(cur.total_participants) || 0;
    const grossCommissionLkr =
      participants.length > 0
        ? participants.reduce((acc, r) => acc + (r.grossCommission || 0), 0)
        : parseFloat(cur.gross_commission_lkr) || 0;
    const targetIncentiveLkr =
      participants.length > 0
        ? participants.reduce((acc, r) => acc + (r.targetIncentive || 0), 0)
        : parseFloat(cur.target_incentive_lkr) || 0;
    const penaltyClawbackLkr =
      participants.length > 0
        ? participants.reduce((acc, r) => acc + (r.penaltyClawback || 0), 0)
        : parseFloat(cur.penalty_clawback_lkr) || 0;
    const netPayableLkr =
      participants.length > 0
        ? participants.reduce((acc, r) => acc + (r.netPayable || 0), 0)
        : parseFloat(cur.net_payable_lkr) || 0;

    // 1. Update Header
    await client.query(
      `UPDATE calculation_result_batches SET
        period = $1, run_date = $2, status = $3, run_type = $4, total_participants = $5,
        gross_commission_lkr = $6, target_incentive_lkr = $7, penalty_clawback_lkr = $8,
        net_payable_lkr = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11;`,
      [
        period,
        runDate,
        status,
        runType,
        totalParticipants,
        grossCommissionLkr,
        targetIncentiveLkr,
        penaltyClawbackLkr,
        netPayableLkr,
        notes,
        id,
      ],
    );

    // 2. Overwrite Participant Results if provided
    if (b.participantResults && b.participantResults.length > 0) {
      await client.query(`DELETE FROM calculation_participant_results WHERE batch_id = $1;`, [id]);
      for (const [idx, r] of b.participantResults.entries()) {
        const resultId = r.id || `calc-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;
        await client.query(
          `INSERT INTO calculation_participant_results (
            id, batch_id, technician_code, technician_name, role, division,
            scheme_code, scheme_name, target_volume, actual_volume, volume_pct,
            target_turnover, actual_turnover, turnover_pct, slab_tier, slab_multiplier,
            gross_commission, target_incentive, attendance_factor, penalty_clawback,
            net_payable, status, job_count, overdue_invoice_count, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26);`,
          [
            resultId,
            id,
            r.technicianCode || (r as any).participantCode || "",
            r.technicianName || (r as any).name || "",
            r.role || "",
            r.division || (r as any).branch || "",
            r.schemeCode || "",
            r.schemeName || "",
            r.targetVolume ?? 0,
            r.actualVolume ?? 0,
            r.volumePct ?? (r as any).volumeAchievementPct ?? 0,
            r.targetTurnover ?? (r as any).targetTurnoverLkr ?? 0,
            r.actualTurnover ?? (r as any).actualTurnoverLkr ?? 0,
            r.turnoverPct ?? (r as any).turnoverAchievementPct ?? 0,
            r.slabTier || "Tier 1",
            r.slabMultiplier ?? 1.0,
            r.grossCommission ?? (r as any).grossCommissionLkr ?? 0,
            r.targetIncentive ?? (r as any).targetIncentiveLkr ?? 0,
            r.attendanceFactor ?? 1.0,
            r.penaltyClawback ?? (r as any).penaltyClawbackLkr ?? 0,
            r.netPayable ?? (r as any).netPayableLkr ?? 0,
            r.status || "Calculated",
            r.jobCount ?? 0,
            r.overdueInvoiceCount ?? 0,
            r.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 3. Log Audit
    await client.query(
      `INSERT INTO calculation_result_audit_logs (
        id, batch_id, timestamp, user_name, user_role, action, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        `craud-${Date.now().toString().slice(-6)}`,
        id,
        `${new Date().toLocaleDateString("en-GB")} IST`,
        "Incentive Administrator",
        "Administrator",
        "Calculation Results Updated",
        `Synchronized ${totalParticipants} participant computation results in PostgreSQL.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getCalculationBatchById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated calculation batch ${id}`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating calculation batch ${id}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update single participant result status (Calculated / Verified / Held / Approved)
 */
export async function updateParticipantResultStatus(
  batchId: string,
  resultId: string,
  newStatus: "Calculated" | "Verified" | "Held" | "Approved",
  author = "Incentive Administrator",
): Promise<ParticipantCalculationResult> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const res = await client.query(
      `UPDATE calculation_participant_results
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND batch_id = $3
       RETURNING *;`,
      [newStatus, resultId, batchId],
    );

    if (!res.rows || res.rows.length === 0) {
      throw new Error(`Participant calculation result ${resultId} not found in batch ${batchId}.`);
    }

    const row = res.rows[0];

    // Log the participant status change
    await client.query(
      `INSERT INTO calculation_result_audit_logs (
        id, batch_id, timestamp, user_name, user_role, action, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        `craud-${Date.now().toString().slice(-6)}`,
        batchId,
        `${new Date().toLocaleDateString("en-GB")} IST`,
        author,
        "Incentive Administrator",
        `Participant Status: ${newStatus}`,
        `Updated ${row.technician_name} (${row.technician_code}) calculation status to ${newStatus}.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    return {
      id: row.id,
      technicianCode: row.technician_code,
      technicianName: row.technician_name,
      role: row.role,
      division: row.division,
      schemeCode: row.scheme_code,
      schemeName: row.scheme_name,
      targetVolume: parseFloat(row.target_volume) || 0,
      actualVolume: parseFloat(row.actual_volume) || 0,
      volumePct: parseFloat(row.volume_pct) || 0,
      targetTurnover: parseFloat(row.target_turnover) || 0,
      actualTurnover: parseFloat(row.actual_turnover) || 0,
      turnoverPct: parseFloat(row.turnover_pct) || 0,
      slabTier: row.slab_tier,
      slabMultiplier: parseFloat(row.slab_multiplier) || 1.0,
      grossCommission: parseFloat(row.gross_commission) || 0,
      targetIncentive: parseFloat(row.target_incentive) || 0,
      attendanceFactor: parseFloat(row.attendance_factor) || 1.0,
      penaltyClawback: parseFloat(row.penalty_clawback) || 0,
      netPayable: parseFloat(row.net_payable) || 0,
      status: row.status as any,
      jobCount: parseInt(row.job_count) || 0,
      overdueInvoiceCount: parseInt(row.overdue_invoice_count) || 0,
      notes: row.notes || "",
    };
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating participant result ${resultId}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Delete a Calculation Batch from PostgreSQL
 */
export async function deleteCalculationBatch(id: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM calculation_result_batches WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Delete a single participant result from a calculation batch
 */
export async function deleteParticipantResult(
  batchId: string,
  resultId: string,
): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(
    `DELETE FROM calculation_participant_results WHERE id = $1 AND batch_id = $2;`,
    [resultId, batchId],
  );
  return (res.rowCount ?? 0) > 0;
}
