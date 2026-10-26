import { getDbPool } from "./db";
import {
  type SlabRecord,
  type SlabHistoryRecord,
  type SlabStatus,
} from "@/components/incentive/TargetIncentiveSlabTableView";

export interface SlabTableDetails {
  id: string;
  schemeCode: string;
  tableName: string;
  targetType: string;
  slabMethod: string;
  version: string;
  status: SlabStatus;
  description: string;
  createdBy: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  slabs: SlabRecord[];
  history: SlabHistoryRecord[];
}

function formatDate(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Get all Target Incentive Slab Tables from PostgreSQL
 */
export async function getAllSlabTables(schemeCode?: string): Promise<SlabTableDetails[]> {
  const pool = getDbPool();

  let query = `SELECT * FROM target_incentive_slab_tables`;
  const params: any[] = [];
  if (schemeCode) {
    query += ` WHERE UPPER(scheme_code) = UPPER($1)`;
    params.push(schemeCode);
  }
  query += ` ORDER BY updated_at DESC;`;

  const tablesRes = await pool.query(query, params);
  if (!tablesRes.rows || tablesRes.rows.length === 0) {
    return [];
  }

  const tableIds = tablesRes.rows.map((r) => r.id);

  // Fetch tiers
  const tiersRes = await pool.query(
    `SELECT * FROM slab_tiers WHERE table_id = ANY($1) ORDER BY sort_order ASC, min_achievement_percent ASC;`,
    [tableIds],
  );

  // Fetch history
  const historyRes = await pool.query(
    `SELECT * FROM slab_table_history_logs WHERE table_id = ANY($1) ORDER BY timestamp DESC;`,
    [tableIds],
  );

  // Group tiers
  const tiersMap = new Map<string, SlabRecord[]>();
  for (const t of tiersRes.rows) {
    const list = tiersMap.get(t.table_id) || [];
    list.push({
      id: t.id,
      slabTierName: t.slab_tier_name,
      minAchievementPercent: Number(t.min_achievement_percent),
      volumeIncentiveLkr: Number(t.volume_incentive_lkr),
      turnoverIncentiveLkr: Number(t.turnover_incentive_lkr),
      notes: t.notes || "",
    });
    tiersMap.set(t.table_id, list);
  }

  // Group history
  const historyMap = new Map<string, SlabHistoryRecord[]>();
  for (const h of historyRes.rows) {
    const list = historyMap.get(h.table_id) || [];
    list.push({
      id: h.id,
      version: h.version,
      status: h.status as SlabStatus,
      timestamp: formatDate(h.timestamp),
      author: h.author,
      role: h.role,
      changeSummary: h.change_summary,
      details: h.details || "",
    });
    historyMap.set(h.table_id, list);
  }

  return tablesRes.rows.map((row) => ({
    id: row.id,
    schemeCode: row.scheme_code,
    tableName: row.table_name,
    targetType: row.target_type,
    slabMethod: row.slab_method,
    version: row.version || "v1.0",
    status: row.status as SlabStatus,
    description: row.description || "",
    createdBy: row.created_by,
    approvedBy: row.approved_by || undefined,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
    slabs: tiersMap.get(row.id) || [],
    history: historyMap.get(row.id) || [],
  }));
}

/**
 * Get single slab table by ID or by schemeCode
 */
export async function getSlabTableById(id: string): Promise<SlabTableDetails | null> {
  const all = await getAllSlabTables();
  return all.find((t) => t.id === id || t.schemeCode.toUpperCase() === id.toUpperCase()) || null;
}

/**
 * Create a new Slab Table in PostgreSQL
 */
export async function createSlabTable(table: Partial<SlabTableDetails>): Promise<SlabTableDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const id = table.id || `slt-${Date.now().toString().slice(-6)}`;
    const schemeCode = table.schemeCode || "SCH-SLS-2026";
    const tableName = table.tableName || `${schemeCode} Target Incentive Slabs`;
    const targetType = table.targetType || "Turnover Target";
    const slabMethod = table.slabMethod || "Highest Slab Reached (Non-Cumulative)";
    const version = table.version || "v1.0";
    const status = table.status || "Draft";
    const description = table.description || "";
    const createdBy = table.createdBy || "Incentive Administrator";
    const approvedBy = table.approvedBy || null;

    // 1. Insert header
    await client.query(
      `INSERT INTO target_incentive_slab_tables (
        id, scheme_code, table_name, target_type, slab_method, version,
        status, description, created_by, approved_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [
        id,
        schemeCode,
        tableName,
        targetType,
        slabMethod,
        version,
        status,
        description,
        createdBy,
        approvedBy,
      ],
    );

    // 2. Insert Tiers
    if (table.slabs && table.slabs.length > 0) {
      for (const [idx, s] of table.slabs.entries()) {
        await client.query(
          `INSERT INTO slab_tiers (
            id, table_id, slab_tier_name, min_achievement_percent,
            volume_incentive_lkr, turnover_incentive_lkr, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            `slb-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`,
            id,
            s.slabTierName,
            s.minAchievementPercent,
            s.volumeIncentiveLkr,
            s.turnoverIncentiveLkr,
            s.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 3. Insert Initial History
    await client.query(
      `INSERT INTO slab_table_history_logs (id, table_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `hist-slb-${Date.now()}`,
        id,
        version,
        status,
        createdBy,
        "Incentive Administrator",
        "Initial slab table creation",
        `Created slab table ${tableName} (${version}) for scheme ${schemeCode}.`,
      ],
    );

    await client.query("COMMIT");

    const all = await getAllSlabTables();
    const created = all.find((t) => t.id === id);
    if (!created) {
      throw new Error(`Failed to find created slab table ${id}`);
    }
    return created;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update an existing Slab Table in PostgreSQL (with Upsert support)
 */
export async function updateSlabTable(
  id: string,
  updates: Partial<SlabTableDetails> & { modifiedBy?: string; changeNote?: string },
): Promise<SlabTableDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    // Fetch existing by ID, fallback to scheme_code
    let existingRes = await client.query(`SELECT * FROM target_incentive_slab_tables WHERE id = $1;`, [id]);
    let current = existingRes.rows?.[0];

    if (!current && updates.schemeCode) {
      existingRes = await client.query(
        `SELECT * FROM target_incentive_slab_tables WHERE UPPER(scheme_code) = UPPER($1);`,
        [updates.schemeCode.trim()],
      );
      current = existingRes.rows?.[0];
    }

    if (!current) {
      // Upsert: Create slab table if not yet existing
      await client.query("ROLLBACK");
      client.release();
      clientReleased = true;
      return await createSlabTable({ ...updates, id });
    }

    const targetId = current.id;

    // 1. Update header fields
    await client.query(
      `UPDATE target_incentive_slab_tables SET
        table_name = $1,
        scheme_code = $2,
        target_type = $3,
        slab_method = $4,
        version = $5,
        status = $6,
        description = $7,
        approved_by = $8,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9;`,
      [
        updates.tableName ?? current.table_name,
        updates.schemeCode ?? current.scheme_code,
        updates.targetType ?? current.target_type,
        updates.slabMethod ?? current.slab_method,
        updates.version ?? current.version,
        updates.status ?? current.status,
        updates.description ?? current.description,
        updates.approvedBy ?? current.approved_by,
        targetId,
      ],
    );

    // 2. Replace Tiers if provided
    if (updates.slabs) {
      await client.query(`DELETE FROM slab_tiers WHERE table_id = $1;`, [targetId]);
      for (const [idx, s] of updates.slabs.entries()) {
        await client.query(
          `INSERT INTO slab_tiers (
            id, table_id, slab_tier_name, min_achievement_percent,
            volume_incentive_lkr, turnover_incentive_lkr, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            `slb-${targetId.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`,
            targetId,
            s.slabTierName,
            s.minAchievementPercent,
            s.volumeIncentiveLkr,
            s.turnoverIncentiveLkr,
            s.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 3. Append History Log
    const author = updates.modifiedBy || "Incentive Administrator";
    const changeSummary = updates.changeNote || "Saved slab configuration and tiers";
    const details = `Updated ${updates.slabs?.length ?? 0} achievement tiers under version ${
      updates.version || current.version
    }.`;

    await client.query(
      `INSERT INTO slab_table_history_logs (id, table_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `hist-slb-${Date.now()}`,
        targetId,
        updates.version || current.version,
        updates.status || current.status,
        author,
        "Incentive Administrator",
        changeSummary,
        details,
      ],
    );

    await client.query("COMMIT");

    const all = await getAllSlabTables();
    const updated = all.find((t) => t.id === targetId);
    if (!updated) {
      throw new Error(`Failed to find updated slab table ${targetId}`);
    }
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update Slab Table Status (Draft -> Approved, or back)
 */
export async function updateSlabTableStatus(
  id: string,
  newStatus: SlabStatus,
  author: string = "Head of Finance",
  role: string = "Executive Authorizer",
  details: string = "Finance audit verification complete. Certified non-cumulative slab payout logic.",
): Promise<SlabTableDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    let existingRes = await client.query(`SELECT * FROM target_incentive_slab_tables WHERE id = $1;`, [id]);
    let current = existingRes.rows?.[0];

    if (!current) {
      existingRes = await client.query(
        `SELECT * FROM target_incentive_slab_tables WHERE UPPER(scheme_code) = UPPER($1);`,
        [id.trim()],
      );
      current = existingRes.rows?.[0];
    }

    if (!current) {
      await client.query("ROLLBACK");
      client.release();
      clientReleased = true;
      const schemeCode = id.replace(/^slt-/, "").toUpperCase();
      return await createSlabTable({
        id,
        schemeCode,
        status: newStatus,
        tableName: `${schemeCode} Target Incentive Slabs`,
      });
    }

    const targetId = current.id;

    await client.query(
      `UPDATE target_incentive_slab_tables SET status = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3;`,
      [newStatus, newStatus === "Approved" ? author : null, targetId],
    );

    await client.query(
      `INSERT INTO slab_table_history_logs (id, table_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `hist-slb-${Date.now()}`,
        targetId,
        current.version,
        newStatus,
        author,
        role,
        `Slab table status changed to ${newStatus}`,
        details,
      ],
    );

    await client.query("COMMIT");

    const all = await getAllSlabTables();
    return all.find((t) => t.id === targetId)!;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a Slab Table from PostgreSQL
 */
export async function deleteSlabTable(id: string): Promise<boolean> {
  const pool = getDbPool();
  await pool.query(`DELETE FROM target_incentive_slab_tables WHERE id = $1;`, [id]);
  return true;
}
