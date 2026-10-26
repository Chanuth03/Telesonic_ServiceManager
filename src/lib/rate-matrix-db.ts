import { getDbPool } from "./db";
import {
  type RateMatrixCell,
  type CreditBandDefinition,
  type HistoryRecord,
  type MatrixStatus,
} from "@/components/incentive/CommissionRateMatrixView";

export interface RateMatrixDetails {
  id: string;
  schemeCode: string;
  matrixName: string;
  version: string;
  rowDimension: string;
  columnDimension: string;
  rateUnit: string;
  currency: string;
  status: MatrixStatus;
  description: string;
  createdBy: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  bands: CreditBandDefinition[];
  matrixData: RateMatrixCell[];
  history: HistoryRecord[];
}

function formatDate(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Get all Commission Rate Matrices from PostgreSQL
 */
export async function getAllRateMatrices(schemeCode?: string): Promise<RateMatrixDetails[]> {
  const pool = getDbPool();

  let query = `SELECT * FROM commission_rate_matrices`;
  const params: any[] = [];
  if (schemeCode) {
    query += ` WHERE UPPER(scheme_code) = UPPER($1)`;
    params.push(schemeCode);
  }
  query += ` ORDER BY updated_at DESC;`;

  const matricesRes = await pool.query(query, params);
  if (!matricesRes.rows || matricesRes.rows.length === 0) {
    return [];
  }

  const matrixIds = matricesRes.rows.map((r) => r.id);

  // Fetch bands
  const bandsRes = await pool.query(
    `SELECT * FROM matrix_credit_bands WHERE matrix_id = ANY($1) ORDER BY sort_order ASC, min_days ASC;`,
    [matrixIds],
  );

  // Fetch cells
  const cellsRes = await pool.query(
    `SELECT * FROM matrix_cells WHERE matrix_id = ANY($1) ORDER BY sort_order ASC, id ASC;`,
    [matrixIds],
  );

  // Fetch history
  const historyRes = await pool.query(
    `SELECT * FROM matrix_history_logs WHERE matrix_id = ANY($1) ORDER BY timestamp DESC;`,
    [matrixIds],
  );

  // Group bands
  const bandsMap = new Map<string, CreditBandDefinition[]>();
  for (const b of bandsRes.rows) {
    const list = bandsMap.get(b.matrix_id) || [];
    list.push({
      id: b.id,
      name: b.name,
      columnKey: b.column_key as keyof Omit<RateMatrixCell, "capacityBand" | "itemType">,
      minDays: Number(b.min_days),
      maxDays: Number(b.max_days),
      description: b.description || "",
      defaultFactor: Number(b.default_factor || 1.0),
    });
    bandsMap.set(b.matrix_id, list);
  }

  // Group cells
  const cellsMap = new Map<string, RateMatrixCell[]>();
  for (const c of cellsRes.rows) {
    const list = cellsMap.get(c.matrix_id) || [];
    list.push({
      capacityBand: c.capacity_band,
      itemType: c.item_type,
      cashImmediate: c.cash_immediate !== null ? Number(c.cash_immediate) : null,
      creditLt15: c.credit_lt15 !== null ? Number(c.credit_lt15) : null,
      creditLt30: c.credit_lt30 !== null ? Number(c.credit_lt30) : null,
      creditLte45: c.credit_lte45 !== null ? Number(c.credit_lte45) : null,
      creditGt45: c.credit_gt45 !== null ? Number(c.credit_gt45) : null,
    });
    cellsMap.set(c.matrix_id, list);
  }

  // Group history
  const historyMap = new Map<string, HistoryRecord[]>();
  for (const h of historyRes.rows) {
    const list = historyMap.get(h.matrix_id) || [];
    list.push({
      id: h.id,
      version: h.version,
      status: h.status as MatrixStatus,
      timestamp: formatDate(h.timestamp),
      author: h.author,
      role: h.role,
      changeSummary: h.change_summary,
      details: h.details || "",
    });
    historyMap.set(h.matrix_id, list);
  }

  return matricesRes.rows.map((row) => ({
    id: row.id,
    schemeCode: row.scheme_code,
    matrixName: row.matrix_name,
    version: row.version || "v1.0",
    rowDimension: row.row_dimension,
    columnDimension: row.column_dimension,
    rateUnit: row.rate_unit,
    currency: row.currency,
    status: row.status as MatrixStatus,
    description: row.description || "",
    createdBy: row.created_by,
    approvedBy: row.approved_by || undefined,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
    bands: bandsMap.get(row.id) || [],
    matrixData: cellsMap.get(row.id) || [],
    history: historyMap.get(row.id) || [],
  }));
}

/**
 * Get a single Commission Rate Matrix by ID
 */
export async function getRateMatrixById(id: string): Promise<RateMatrixDetails | null> {
  const all = await getAllRateMatrices();
  return all.find((m) => m.id === id) || null;
}

/**
 * Create a new Commission Rate Matrix in PostgreSQL
 */
export async function createRateMatrix(matrix: Partial<RateMatrixDetails>): Promise<RateMatrixDetails> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const id = matrix.id || `mat-${Date.now().toString().slice(-6)}`;
    const schemeCode = matrix.schemeCode || "SCH-2025-SOLAR-01";
    const matrixName = matrix.matrixName || "Commission Rate Matrix";
    const version = matrix.version || "v1.0";
    const rowDimension = matrix.rowDimension || "Capacity Band + Item Type";
    const columnDimension = matrix.columnDimension || "Payment-term / Credit-age Bands";
    const rateUnit = matrix.rateUnit || "% of Net Invoiced Value";
    const currency = matrix.currency || "USD ($)";
    const status = matrix.status || "Draft";
    const description = matrix.description || "";
    const createdBy = matrix.createdBy || "Incentive Administrator";
    const approvedBy = matrix.approvedBy || null;

    // 1. Insert header
    await client.query(
      `INSERT INTO commission_rate_matrices (
        id, scheme_code, matrix_name, version, row_dimension, column_dimension,
        rate_unit, currency, status, description, created_by, approved_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
      [
        id,
        schemeCode,
        matrixName,
        version,
        rowDimension,
        columnDimension,
        rateUnit,
        currency,
        status,
        description,
        createdBy,
        approvedBy,
      ],
    );

    // 2. Insert Credit Bands
    if (matrix.bands && matrix.bands.length > 0) {
      for (const [idx, b] of matrix.bands.entries()) {
        await client.query(
          `INSERT INTO matrix_credit_bands (
            id, matrix_id, name, column_key, min_days, max_days, description, default_factor, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            b.id || `b-${Date.now()}-${idx}`,
            id,
            b.name,
            b.columnKey,
            b.minDays,
            b.maxDays,
            b.description || "",
            b.defaultFactor ?? 1.0,
            idx + 1,
          ],
        );
      }
    }

    // 3. Insert Cells
    if (matrix.matrixData && matrix.matrixData.length > 0) {
      for (const [idx, c] of matrix.matrixData.entries()) {
        await client.query(
          `INSERT INTO matrix_cells (
            id, matrix_id, capacity_band, item_type, cash_immediate, credit_lt15,
            credit_lt30, credit_lte45, credit_gt45, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
          [
            `mc-${Date.now()}-${idx}`,
            id,
            c.capacityBand,
            c.itemType,
            c.cashImmediate,
            c.creditLt15,
            c.creditLt30,
            c.creditLte45,
            c.creditGt45,
            idx + 1,
          ],
        );
      }
    }

    // 4. Insert Initial History
    await client.query(
      `INSERT INTO matrix_history_logs (id, matrix_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `mhl-${Date.now()}`,
        id,
        version,
        status,
        createdBy,
        "Incentive Administrator",
        "Initial matrix creation",
        `Created matrix ${matrixName} (${version}) for scheme ${schemeCode}.`,
      ],
    );

    await client.query("COMMIT");

    const all = await getAllRateMatrices();
    const created = all.find((m) => m.id === id);
    if (!created) {
      throw new Error(`Failed to find created matrix ${id}`);
    }
    return created;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update an existing Commission Rate Matrix in PostgreSQL (with Upsert support)
 */
export async function updateRateMatrix(
  id: string,
  updates: Partial<RateMatrixDetails> & { modifiedBy?: string; changeNote?: string },
): Promise<RateMatrixDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    // Fetch existing by ID, fallback to scheme_code if temporary client ID was passed
    let existingRes = await client.query(`SELECT * FROM commission_rate_matrices WHERE id = $1;`, [id]);
    let current = existingRes.rows?.[0];

    if (!current && updates.schemeCode) {
      existingRes = await client.query(
        `SELECT * FROM commission_rate_matrices WHERE UPPER(scheme_code) = UPPER($1);`,
        [updates.schemeCode.trim()],
      );
      current = existingRes.rows?.[0];
    }

    if (!current) {
      // Upsert: Create matrix if it doesn't exist
      await client.query("ROLLBACK");
      client.release();
      clientReleased = true;
      return await createRateMatrix({ ...updates, id });
    }

    const targetId = current.id;

    // 1. Update header fields
    await client.query(
      `UPDATE commission_rate_matrices SET
        matrix_name = $1,
        scheme_code = $2,
        version = $3,
        row_dimension = $4,
        column_dimension = $5,
        rate_unit = $6,
        currency = $7,
        status = $8,
        description = $9,
        approved_by = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11;`,
      [
        updates.matrixName ?? current.matrix_name,
        updates.schemeCode ?? current.scheme_code,
        updates.version ?? current.version,
        updates.rowDimension ?? current.row_dimension,
        updates.columnDimension ?? current.column_dimension,
        updates.rateUnit ?? current.rate_unit,
        updates.currency ?? current.currency,
        updates.status ?? current.status,
        updates.description ?? current.description,
        updates.approvedBy ?? current.approved_by,
        targetId,
      ],
    );

    // 2. Replace Credit Bands if provided
    if (updates.bands) {
      await client.query(`DELETE FROM matrix_credit_bands WHERE matrix_id = $1;`, [targetId]);
      for (const [idx, b] of updates.bands.entries()) {
        await client.query(
          `INSERT INTO matrix_credit_bands (
            id, matrix_id, name, column_key, min_days, max_days, description, default_factor, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            b.id || `b-${Date.now()}-${idx}`,
            targetId,
            b.name,
            b.columnKey,
            b.minDays,
            b.maxDays,
            b.description || "",
            b.defaultFactor ?? 1.0,
            idx + 1,
          ],
        );
      }
    }

    // 3. Replace Cells if provided
    if (updates.matrixData) {
      await client.query(`DELETE FROM matrix_cells WHERE matrix_id = $1;`, [targetId]);
      for (const [idx, c] of updates.matrixData.entries()) {
        await client.query(
          `INSERT INTO matrix_cells (
            id, matrix_id, capacity_band, item_type, cash_immediate, credit_lt15,
            credit_lt30, credit_lte45, credit_gt45, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
          [
            `mc-${Date.now()}-${idx}`,
            targetId,
            c.capacityBand,
            c.itemType,
            c.cashImmediate,
            c.creditLt15,
            c.creditLt30,
            c.creditLte45,
            c.creditGt45,
            idx + 1,
          ],
        );
      }
    }

    // 4. Append History Log
    const author = updates.modifiedBy || "Incentive Administrator";
    const changeSummary = updates.changeNote || "Saved matrix configuration and rate cells";
    const details = `Updated rate cells and configuration for ${updates.matrixName || current.matrix_name}.`;

    await client.query(
      `INSERT INTO matrix_history_logs (id, matrix_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `mhl-${Date.now()}`,
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

    const all = await getAllRateMatrices();
    const updated = all.find((m) => m.id === targetId);
    if (!updated) {
      throw new Error(`Failed to find updated matrix ${targetId}`);
    }
    return updated;
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
 * Update Matrix Status (Draft -> Approved, or back)
 */
export async function updateMatrixStatus(
  id: string,
  newStatus: MatrixStatus,
  author: string = "Finance Director",
  role: string = "Executive Authorizer",
  details: string = "Certified matrix rate combinations for payroll calculation runs.",
): Promise<RateMatrixDetails> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingRes = await client.query(`SELECT * FROM commission_rate_matrices WHERE id = $1;`, [id]);
    if (!existingRes.rows || existingRes.rows.length === 0) {
      throw new Error(`Matrix ${id} not found.`);
    }

    const current = existingRes.rows[0];

    await client.query(
      `UPDATE commission_rate_matrices SET status = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3;`,
      [newStatus, newStatus === "Approved" ? author : null, id],
    );

    await client.query(
      `INSERT INTO matrix_history_logs (id, matrix_id, version, status, author, role, change_summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `mhl-${Date.now()}`,
        id,
        current.version,
        newStatus,
        author,
        role,
        `Matrix status changed to ${newStatus}`,
        details,
      ],
    );

    await client.query("COMMIT");

    const all = await getAllRateMatrices();
    return all.find((m) => m.id === id)!;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a Commission Rate Matrix from PostgreSQL
 */
export async function deleteRateMatrix(id: string): Promise<boolean> {
  const pool = getDbPool();
  await pool.query(`DELETE FROM commission_rate_matrices WHERE id = $1;`, [id]);
  return true;
}
