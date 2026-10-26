import { getDbPool } from "./db";
import {
  type MonthlyTargetRecord,
  type TargetHistoryRecord,
  type TargetPeriodStatus,
} from "@/components/incentive/MonthlyTargetEntryView";

export interface MonthlyTargetBatchDetails {
  id: string;
  period: string;
  schemeCode: string;
  division: string;
  targetType: string;
  version: string;
  currency: string;
  status: TargetPeriodStatus;
  isLocked: boolean;
  description: string;
  createdBy: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  entries: MonthlyTargetRecord[];
  history: TargetHistoryRecord[];
}

function formatDate(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Get all Monthly Target Batches from PostgreSQL
 */
export async function getAllTargetBatches(
  period?: string,
  schemeCode?: string,
): Promise<MonthlyTargetBatchDetails[]> {
  const pool = getDbPool();

  let query = `SELECT * FROM monthly_target_batches WHERE 1=1`;
  const params: any[] = [];
  if (period) {
    params.push(period);
    query += ` AND UPPER(period) = UPPER($${params.length})`;
  }
  if (schemeCode) {
    params.push(schemeCode);
    query += ` AND UPPER(scheme_code) = UPPER($${params.length})`;
  }
  query += ` ORDER BY updated_at DESC;`;

  const batchesRes = await pool.query(query, params);
  if (!batchesRes.rows || batchesRes.rows.length === 0) {
    return [];
  }

  const batchIds = batchesRes.rows.map((r) => r.id);

  // Fetch entries
  const entriesRes = await pool.query(
    `SELECT * FROM monthly_target_entries WHERE batch_id = ANY($1) ORDER BY sort_order ASC, id ASC;`,
    [batchIds],
  );

  // Fetch history
  const historyRes = await pool.query(
    `SELECT * FROM monthly_target_history_logs WHERE batch_id = ANY($1) ORDER BY timestamp DESC;`,
    [batchIds],
  );

  // Group entries
  const entriesMap = new Map<string, MonthlyTargetRecord[]>();
  for (const e of entriesRes.rows) {
    const list = entriesMap.get(e.batch_id) || [];
    list.push({
      id: e.id,
      participantId: e.participant_id,
      employeeName: e.employee_name,
      role: e.role,
      division: e.division,
      territory: e.territory,
      schemeCode: e.scheme_code,
      baseTargetLkr: Number(e.base_target_lkr),
      stretchTargetLkr: Number(e.stretch_target_lkr),
      mtdActualLkr: Number(e.mtd_actual_lkr),
      notes: e.notes || "",
      lastUpdated: e.last_updated || formatDate(e.updated_at),
    });
    entriesMap.set(e.batch_id, list);
  }

  // Group history
  const historyMap = new Map<string, TargetHistoryRecord[]>();
  for (const h of historyRes.rows) {
    const list = historyMap.get(h.batch_id) || [];
    list.push({
      id: h.id,
      version: h.version,
      status: h.status as TargetPeriodStatus,
      timestamp: formatDate(h.timestamp),
      author: h.author,
      role: h.role,
      changeSummary: h.change_summary,
      details: h.details || "",
    });
    historyMap.set(h.batch_id, list);
  }

  return batchesRes.rows.map((row) => ({
    id: row.id,
    period: row.period,
    schemeCode: row.scheme_code,
    division: row.division || "All Divisions",
    targetType: row.target_type || "Turnover Target (LKR)",
    version: row.version || "v1.0 Draft",
    currency: row.currency || "LKR",
    status: (row.status as TargetPeriodStatus) || "Draft",
    isLocked: Boolean(row.is_locked),
    description: row.description || "",
    createdBy: row.created_by,
    approvedBy: row.approved_by || undefined,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
    entries: entriesMap.get(row.id) || [],
    history: historyMap.get(row.id) || [],
  }));
}

/**
 * Get a single Monthly Target Batch by ID or period
 */
export async function getTargetBatchById(id: string): Promise<MonthlyTargetBatchDetails | null> {
  const all = await getAllTargetBatches();
  return (
    all.find(
      (b) =>
        b.id === id ||
        b.period.toLowerCase() === id.toLowerCase() ||
        b.period.toLowerCase().startsWith(id.toLowerCase()),
    ) || null
  );
}

/**
 * Create a new Monthly Target Batch in PostgreSQL
 */
export async function createTargetBatch(
  batch: Partial<MonthlyTargetBatchDetails>,
): Promise<MonthlyTargetBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const id = batch.id || `mtb-${Date.now().toString().slice(-6)}`;
    const period = batch.period || "May 2026 (Current)";
    const schemeCode = batch.schemeCode || "SCH-SLS-2026";
    const division = batch.division || "All Divisions";
    const targetType = batch.targetType || "Turnover Target (LKR)";
    const version = batch.version || "v1.0 Draft";
    const currency = batch.currency || "LKR";
    const status = batch.status || "Draft";
    const isLocked = batch.isLocked ?? (status === "Locked");
    const description = batch.description || "";
    const createdBy = batch.createdBy || "Incentive Administrator";
    const approvedBy = batch.approvedBy || null;

    // 1. Insert header batch
    await client.query(
      `INSERT INTO monthly_target_batches (
        id, period, scheme_code, division, target_type, version, currency,
        status, is_locked, description, created_by, approved_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
      [
        id,
        period,
        schemeCode,
        division,
        targetType,
        version,
        currency,
        status,
        isLocked,
        description,
        createdBy,
        approvedBy,
      ],
    );

    // 2. Insert Target Entries
    if (batch.entries && batch.entries.length > 0) {
      for (const [idx, e] of batch.entries.entries()) {
        const entryId =
          e.id && !e.id.startsWith("new-")
            ? e.id
            : `tgt-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;

        await client.query(
          `INSERT INTO monthly_target_entries (
            id, batch_id, participant_id, employee_name, role, division, territory,
            scheme_code, base_target_lkr, stretch_target_lkr, mtd_actual_lkr,
            notes, sort_order, last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
          [
            entryId,
            id,
            e.participantId,
            e.employeeName,
            e.role,
            e.division,
            e.territory,
            e.schemeCode || schemeCode,
            e.baseTargetLkr || 0,
            e.stretchTargetLkr || 0,
            e.mtdActualLkr || 0,
            e.notes || "",
            idx + 1,
            e.lastUpdated || formatDate(new Date()),
          ],
        );
      }
    }

    // 3. Insert Initial History Log
    await client.query(
      `INSERT INTO monthly_target_history_logs (id, batch_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `rev-${id.slice(-6)}-${Date.now().toString().slice(-4)}`,
        id,
        version,
        status,
        createdBy,
        "Incentive Administrator",
        "Initial target batch created in PostgreSQL",
        `Created monthly target batch for period ${period} (${version}). Total entries: ${batch.entries?.length || 0}.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const created = await getTargetBatchById(id);
    if (!created) {
      throw new Error(`Failed to retrieve created target batch with ID ${id}`);
    }
    return created;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error("Error creating target batch:", error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update a Target Batch and replace its target entries in PostgreSQL
 */
export async function updateTargetBatch(
  id: string,
  batch: Partial<MonthlyTargetBatchDetails>,
): Promise<MonthlyTargetBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    // Check existing
    const existing = await client.query(`SELECT * FROM monthly_target_batches WHERE id = $1;`, [id]);
    if (!existing.rows || existing.rows.length === 0) {
      // If it doesn't exist yet, insert it gracefully
      clientReleased = true;
      client.release();
      return await createTargetBatch({ ...batch, id });
    }

    const current = existing.rows[0];
    const period = batch.period !== undefined ? batch.period : current.period;
    const schemeCode = batch.schemeCode !== undefined ? batch.schemeCode : current.scheme_code;
    const division = batch.division !== undefined ? batch.division : current.division;
    const targetType = batch.targetType !== undefined ? batch.targetType : current.target_type;
    const version = batch.version !== undefined ? batch.version : current.version;
    const currency = batch.currency !== undefined ? batch.currency : current.currency;
    const status = batch.status !== undefined ? batch.status : current.status;
    const isLocked =
      batch.isLocked !== undefined
        ? batch.isLocked
        : status === "Locked"
        ? true
        : current.is_locked;
    const description = batch.description !== undefined ? batch.description : current.description;
    const approvedBy = batch.approvedBy !== undefined ? batch.approvedBy : current.approved_by;

    // 1. Update Batch Header
    await client.query(
      `UPDATE monthly_target_batches SET
        period = $1, scheme_code = $2, division = $3, target_type = $4,
        version = $5, currency = $6, status = $7, is_locked = $8,
        description = $9, approved_by = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11;`,
      [
        period,
        schemeCode,
        division,
        targetType,
        version,
        currency,
        status,
        isLocked,
        description,
        approvedBy,
        id,
      ],
    );

    // 2. Overwrite Target Entries if provided
    if (batch.entries) {
      await client.query(`DELETE FROM monthly_target_entries WHERE batch_id = $1;`, [id]);

      for (const [idx, e] of batch.entries.entries()) {
        const entryId =
          e.id && !e.id.startsWith("new-")
            ? e.id
            : `tgt-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;

        await client.query(
          `INSERT INTO monthly_target_entries (
            id, batch_id, participant_id, employee_name, role, division, territory,
            scheme_code, base_target_lkr, stretch_target_lkr, mtd_actual_lkr,
            notes, sort_order, last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
          [
            entryId,
            id,
            e.participantId,
            e.employeeName,
            e.role,
            e.division,
            e.territory,
            e.schemeCode || schemeCode,
            e.baseTargetLkr || 0,
            e.stretchTargetLkr || 0,
            e.mtdActualLkr || 0,
            e.notes || "",
            idx + 1,
            e.lastUpdated || formatDate(new Date()),
          ],
        );
      }
    }

    // 3. Insert audit log
    const author = batch.createdBy || "Lakmal Perera";
    await client.query(
      `INSERT INTO monthly_target_history_logs (id, batch_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `rev-${id.slice(-6)}-${Date.now().toString().slice(-4)}`,
        id,
        version,
        status,
        author,
        "Incentive Administrator",
        "Target batch updated and synchronized with PostgreSQL",
        `Updated monthly targets for period ${period}. Total entries: ${batch.entries?.length ?? current.entries_count}.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getTargetBatchById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated batch ${id}`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating target batch ${id}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update the status of a Target Batch (Draft -> Approved -> Locked)
 */
export async function updateTargetBatchStatus(
  id: string,
  newStatus: TargetPeriodStatus,
  author = "Head of Sales Operations",
  role = "Executive Authorizer",
  details = "Status state update",
): Promise<MonthlyTargetBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const isLocked = newStatus === "Locked";
    const approvedBy = newStatus === "Approved" || newStatus === "Locked" ? author : null;

    const res = await client.query(
      `UPDATE monthly_target_batches
       SET status = $1, is_locked = $2, approved_by = COALESCE($3, approved_by), updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING version, period;`,
      [newStatus, isLocked, approvedBy, id],
    );

    if (!res.rows || res.rows.length === 0) {
      throw new Error(`Target batch with id ${id} not found.`);
    }

    const { version, period } = res.rows[0];

    // Log the status change
    await client.query(
      `INSERT INTO monthly_target_history_logs (id, batch_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `rev-status-${Date.now().toString().slice(-6)}`,
        id,
        version,
        newStatus,
        author,
        role,
        `Status transitioned to ${newStatus}`,
        `Batch ${period} (${id}) status changed to ${newStatus}. ${details}`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getTargetBatchById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve target batch ${id} after status update.`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating target batch status ${id}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Delete a Target Batch from PostgreSQL
 */
export async function deleteTargetBatch(id: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM monthly_target_batches WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
