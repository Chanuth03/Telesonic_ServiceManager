import { getDbPool } from "./db";
import {
  type AttendanceRecord,
  type ImportBatchHistory,
  type ImportStatus,
} from "@/components/incentive/AttendanceLeaveImportView";

export interface AttendanceBatchDetails {
  id: string;
  period: string;
  division: string;
  source: string;
  status: ImportStatus;
  importedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  records: AttendanceRecord[];
  history: ImportBatchHistory[];
}

function formatDate(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().substring(0, 10);
  }
  return String(val);
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Get all Attendance Import Batches from PostgreSQL
 */
export async function getAllAttendanceBatches(
  period?: string,
  division?: string,
): Promise<AttendanceBatchDetails[]> {
  const pool = getDbPool();

  let query = `SELECT * FROM attendance_import_batches WHERE 1=1`;
  const params: any[] = [];

  if (period) {
    params.push(period);
    query += ` AND UPPER(period) = UPPER($${params.length})`;
  }

  if (division && division !== "All" && division !== "All Service Divisions") {
    params.push(division);
    query += ` AND UPPER(division) = UPPER($${params.length})`;
  }

  query += ` ORDER BY updated_at DESC;`;

  const batchesRes = await pool.query(query, params);
  if (!batchesRes.rows || batchesRes.rows.length === 0) {
    return [];
  }

  const batchIds = batchesRes.rows.map((r) => r.id);

  // Fetch records
  const recordsRes = await pool.query(
    `SELECT * FROM attendance_records 
     WHERE batch_id = ANY($1) 
     ORDER BY sort_order ASC, id ASC;`,
    [batchIds],
  );

  // Fetch history logs
  const historyRes = await pool.query(
    `SELECT * FROM attendance_batch_history_logs 
     WHERE batch_id = ANY($1) 
     ORDER BY timestamp DESC;`,
    [batchIds],
  );

  // Group records
  const recordsMap = new Map<string, AttendanceRecord[]>();
  for (const r of recordsRes.rows) {
    const list = recordsMap.get(r.batch_id) || [];
    let errorMsgs: string[] = [];
    if (r.error_messages) {
      if (Array.isArray(r.error_messages)) {
        errorMsgs = r.error_messages;
      } else if (typeof r.error_messages === "string") {
        try {
          errorMsgs = JSON.parse(r.error_messages);
        } catch {
          errorMsgs = [r.error_messages];
        }
      }
    }

    list.push({
      id: r.id,
      employeeCode: r.employee_code,
      employeeName: r.employee_name,
      role: r.role,
      division: r.division,
      workingDays: Number(r.working_days),
      leaveDays: Number(r.leave_days),
      absentDays: Number(r.absent_days),
      attendanceFactor: Number(r.attendance_factor),
      validationStatus: (r.validation_status as "Valid" | "Error") || "Valid",
      errorMessages: errorMsgs,
      notes: r.notes || "",
    });
    recordsMap.set(r.batch_id, list);
  }

  // Group history
  const historyMap = new Map<string, ImportBatchHistory[]>();
  for (const h of historyRes.rows) {
    const list = historyMap.get(h.batch_id) || [];
    list.push({
      batchId: h.batch_id,
      period: "",
      division: "",
      source: "",
      importedBy: `${h.user_name} (${h.user_role})`,
      importDate: formatDateTime(h.timestamp),
      totalRecords: 0,
      validRecords: 0,
      errorRecords: 0,
      status: "Draft",
      notes: h.details || h.action,
    });
    historyMap.set(h.batch_id, list);
  }

  return batchesRes.rows.map((row) => {
    const batchRecords = recordsMap.get(row.id) || [];
    const validCount = batchRecords.filter((r) => r.validationStatus === "Valid").length;
    const errorCount = batchRecords.filter((r) => r.validationStatus === "Error").length;

    return {
      id: row.id,
      period: row.period,
      division: row.division,
      source: row.source,
      status: (row.status as ImportStatus) || "Draft",
      importedBy: row.imported_by,
      approvedBy: row.approved_by || undefined,
      approvedAt: row.approved_at ? formatDateTime(row.approved_at) : undefined,
      notes: row.notes || "",
      createdAt: formatDateTime(row.created_at),
      updatedAt: formatDateTime(row.updated_at),
      records: batchRecords,
      history: (historyMap.get(row.id) || []).map((h) => ({
        ...h,
        period: row.period,
        division: row.division,
        source: row.source,
        totalRecords: batchRecords.length,
        validRecords: validCount,
        errorRecords: errorCount,
        status: row.status,
      })),
    };
  });
}

/**
 * Get single batch by ID or Period
 */
export async function getAttendanceBatchById(id: string): Promise<AttendanceBatchDetails | null> {
  const all = await getAllAttendanceBatches();
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
 * Create a new Attendance Import Batch in PostgreSQL
 */
export async function createAttendanceBatch(
  b: Partial<AttendanceBatchDetails>,
): Promise<AttendanceBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const id = b.id || `BAT-ATT-${Date.now().toString().slice(-6)}`;
    const period = b.period || "May 2026";
    const division = b.division || "Consumer Electronics";
    const source = b.source || "Biometric Punch Terminal (ZKTeco BioTime)";
    const status = b.status || "Draft";
    const importedBy = b.importedBy || "Service Coordinator";
    const approvedBy = b.approvedBy || null;
    const approvedAt = b.approvedAt ? new Date(b.approvedAt) : null;
    const notes = b.notes || "";

    // 1. Insert Batch Header
    await client.query(
      `INSERT INTO attendance_import_batches (
        id, period, division, source, status, imported_by, approved_by, approved_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [id, period, division, source, status, importedBy, approvedBy, approvedAt, notes],
    );

    // 2. Insert Records
    if (b.records && b.records.length > 0) {
      for (const [idx, r] of b.records.entries()) {
        const recordId = r.id || `att-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;
        await client.query(
          `INSERT INTO attendance_records (
            id, batch_id, employee_code, employee_name, role, division,
            working_days, leave_days, absent_days, attendance_factor,
            validation_status, error_messages, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
          [
            recordId,
            id,
            r.employeeCode,
            r.employeeName,
            r.role,
            r.division || division,
            r.workingDays ?? 22,
            r.leaveDays ?? 0,
            r.absentDays ?? 0,
            r.attendanceFactor ?? 1.0,
            r.validationStatus || "Valid",
            JSON.stringify(r.errorMessages || []),
            r.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 3. Insert History Log
    await client.query(
      `INSERT INTO attendance_batch_history_logs (
        id, batch_id, action, user_name, user_role, details
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `abh-${Date.now().toString().slice(-6)}`,
        id,
        "Batch Created",
        importedBy,
        "Service Coordinator",
        `Created attendance batch for ${period} (${b.records?.length || 0} records).`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const created = await getAttendanceBatchById(id);
    if (!created) {
      throw new Error(`Failed to retrieve created attendance batch ${id}`);
    }
    return created;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error("Error creating attendance batch:", error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update an Attendance Import Batch and overwrite its records in PostgreSQL
 */
export async function updateAttendanceBatch(
  id: string,
  b: Partial<AttendanceBatchDetails>,
): Promise<AttendanceBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const existing = await client.query(`SELECT * FROM attendance_import_batches WHERE id = $1;`, [id]);
    if (!existing.rows || existing.rows.length === 0) {
      clientReleased = true;
      client.release();
      return await createAttendanceBatch({ ...b, id });
    }

    const cur = existing.rows[0];
    const period = b.period !== undefined ? b.period : cur.period;
    const division = b.division !== undefined ? b.division : cur.division;
    const source = b.source !== undefined ? b.source : cur.source;
    const status = b.status !== undefined ? b.status : cur.status;
    const notes = b.notes !== undefined ? b.notes : cur.notes;
    const approvedBy = b.approvedBy !== undefined ? b.approvedBy : cur.approved_by;
    const approvedAt =
      status === "Approved"
        ? new Date()
        : b.approvedAt !== undefined
        ? new Date(b.approvedAt)
        : cur.approved_at;

    // 1. Update header
    await client.query(
      `UPDATE attendance_import_batches SET
        period = $1, division = $2, source = $3, status = $4,
        notes = $5, approved_by = $6, approved_at = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8;`,
      [period, division, source, status, notes, approvedBy, approvedAt, id],
    );

    // 2. Overwrite records if provided
    if (b.records) {
      await client.query(`DELETE FROM attendance_records WHERE batch_id = $1;`, [id]);
      for (const [idx, r] of b.records.entries()) {
        const recordId = r.id || `att-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;
        await client.query(
          `INSERT INTO attendance_records (
            id, batch_id, employee_code, employee_name, role, division,
            working_days, leave_days, absent_days, attendance_factor,
            validation_status, error_messages, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
          [
            recordId,
            id,
            r.employeeCode,
            r.employeeName,
            r.role,
            r.division || division,
            r.workingDays ?? 22,
            r.leaveDays ?? 0,
            r.absentDays ?? 0,
            r.attendanceFactor ?? 1.0,
            r.validationStatus || "Valid",
            JSON.stringify(r.errorMessages || []),
            r.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 3. Log history
    await client.query(
      `INSERT INTO attendance_batch_history_logs (
        id, batch_id, action, user_name, user_role, details
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `abh-${Date.now().toString().slice(-6)}`,
        id,
        status === "Approved" ? "Batch Approved" : "Records Updated",
        b.importedBy || "Service Coordinator",
        "HR Operations",
        `Synchronized ${b.records?.length ?? cur.records_count} attendance records for ${period}.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getAttendanceBatchById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated attendance batch ${id}`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating attendance batch ${id}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Approve or change status of Attendance Batch (Draft -> Validated -> Approved)
 */
export async function updateAttendanceBatchStatus(
  id: string,
  newStatus: ImportStatus,
  approvedBy = "Niluka Senaratne (HR Manager)",
): Promise<AttendanceBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const approvedAt = newStatus === "Approved" ? new Date() : null;

    const res = await client.query(
      `UPDATE attendance_import_batches
       SET status = $1, approved_by = COALESCE($2, approved_by), approved_at = COALESCE($3, approved_at), updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING period;`,
      [newStatus, newStatus === "Approved" ? approvedBy : null, approvedAt, id],
    );

    if (!res.rows || res.rows.length === 0) {
      throw new Error(`Attendance batch ${id} not found.`);
    }

    const period = res.rows[0].period;

    // Log the transition
    await client.query(
      `INSERT INTO attendance_batch_history_logs (
        id, batch_id, action, user_name, user_role, details
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `abh-${Date.now().toString().slice(-6)}`,
        id,
        `Status: ${newStatus}`,
        approvedBy,
        "HR Manager",
        `Attendance batch for ${period} transitioned to ${newStatus}.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getAttendanceBatchById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve attendance batch ${id} after status update.`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating status for batch ${id}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Delete an Attendance Batch from PostgreSQL
 */
export async function deleteAttendanceBatch(id: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM attendance_import_batches WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
