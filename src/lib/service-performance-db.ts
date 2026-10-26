import { getDbPool } from "./db";
import {
  type PerformanceStatus,
  type TechnicianPerformanceLine,
  type ServiceJobDetail,
  type PerformanceAuditEntry,
  type JobEligibility,
} from "@/components/incentive/ServicePerformanceDataView";

export interface ServicePerformanceBatchDetails {
  id: string;
  period: string;
  division: string;
  sourceSystem: string;
  receivedOn: string;
  status: PerformanceStatus;
  lockedBy?: string;
  lockedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  techLines: TechnicianPerformanceLine[];
  jobTickets: ServiceJobDetail[];
  auditLogs: PerformanceAuditEntry[];
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
 * Get all Service Performance Batches from PostgreSQL
 */
export async function getAllServicePerformanceBatches(
  period?: string,
  division?: string,
): Promise<ServicePerformanceBatchDetails[]> {
  const pool = getDbPool();

  let query = `SELECT * FROM service_performance_batches WHERE 1=1`;
  const params: any[] = [];

  if (period) {
    params.push(period);
    query += ` AND period = $${params.length}`;
  }
  if (division && division !== "All" && division !== "All Service Divisions") {
    params.push(division);
    query += ` AND division = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC;`;

  const res = await pool.query(query, params);
  const batches: ServicePerformanceBatchDetails[] = [];

  for (const b of res.rows) {
    // 1. Fetch technician lines
    const linesRes = await pool.query(
      `SELECT * FROM service_performance_technician_lines WHERE batch_id = $1 ORDER BY sort_order ASC, employee_code ASC;`,
      [b.id],
    );
    const techLines: TechnicianPerformanceLine[] = linesRes.rows.map((r) => ({
      id: r.id,
      employeeCode: r.employee_code,
      employeeName: r.employee_name,
      role: r.role,
      division: r.division,
      closedJobs: parseInt(r.closed_jobs) || 0,
      hodEligible: parseInt(r.hod_eligible) || 0,
      partial: parseInt(r.partial) || 0,
      notEligible: parseInt(r.not_eligible) || 0,
      excluded: parseInt(r.excluded) || 0,
      avgQuality: parseFloat(r.avg_quality) || 0.0,
      avgDiscipline: parseFloat(r.avg_discipline) || 0.0,
      poorRepeats: parseInt(r.poor_repeats) || 0,
      reviewStatus: r.review_status as any,
      notes: r.notes || "",
    }));

    // 2. Fetch job detail tickets
    const jobsRes = await pool.query(
      `SELECT * FROM service_performance_job_tickets WHERE batch_id = $1 ORDER BY sort_order ASC, completion_date ASC;`,
      [b.id],
    );
    const jobTickets: ServiceJobDetail[] = jobsRes.rows.map((j) => ({
      id: j.id,
      jobTicketNo: j.job_ticket_no,
      employeeCode: j.employee_code,
      employeeName: j.employee_name,
      customerName: j.customer_name,
      equipmentModel: j.equipment_model,
      completionDate: j.completion_date,
      faultCategory: j.fault_category,
      firstTimeFix: Boolean(j.first_time_fix),
      qualityScore: parseFloat(j.quality_score) || 0.0,
      disciplineScore: parseFloat(j.discipline_score) || 0.0,
      eligibility: j.eligibility as JobEligibility,
      isPoorRepeat: Boolean(j.is_poor_repeat),
      repeatReferenceJob: j.repeat_reference_job || undefined,
      hodReviewed: Boolean(j.hod_reviewed),
      closureStatus: j.closure_status as any,
      notes: j.notes || "",
    }));

    // 3. Fetch audit logs
    const auditRes = await pool.query(
      `SELECT * FROM service_performance_audit_logs WHERE batch_id = $1 ORDER BY created_at DESC;`,
      [b.id],
    );
    const auditLogs: PerformanceAuditEntry[] = auditRes.rows.map((a) => ({
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
      division: b.division,
      sourceSystem: b.source_system,
      receivedOn: b.received_on,
      status: b.status as PerformanceStatus,
      lockedBy: b.locked_by || undefined,
      lockedAt: b.locked_at ? formatDateTime(b.locked_at) : undefined,
      notes: b.notes || "",
      createdAt: formatDateTime(b.created_at),
      updatedAt: formatDateTime(b.updated_at),
      techLines,
      jobTickets,
      auditLogs,
    });
  }

  return batches;
}

/**
 * Get single Service Performance Batch by ID
 */
export async function getServicePerformanceBatchById(
  id: string,
): Promise<ServicePerformanceBatchDetails | null> {
  const pool = getDbPool();
  const res = await pool.query(`SELECT * FROM service_performance_batches WHERE id = $1;`, [id]);
  if (!res.rows || res.rows.length === 0) return null;

  const b = res.rows[0];

  const linesRes = await pool.query(
    `SELECT * FROM service_performance_technician_lines WHERE batch_id = $1 ORDER BY sort_order ASC, employee_code ASC;`,
    [id],
  );
  const techLines: TechnicianPerformanceLine[] = linesRes.rows.map((r) => ({
    id: r.id,
    employeeCode: r.employee_code,
    employeeName: r.employee_name,
    role: r.role,
    division: r.division,
    closedJobs: parseInt(r.closed_jobs) || 0,
    hodEligible: parseInt(r.hod_eligible) || 0,
    partial: parseInt(r.partial) || 0,
    notEligible: parseInt(r.not_eligible) || 0,
    excluded: parseInt(r.excluded) || 0,
    avgQuality: parseFloat(r.avg_quality) || 0.0,
    avgDiscipline: parseFloat(r.avg_discipline) || 0.0,
    poorRepeats: parseInt(r.poor_repeats) || 0,
    reviewStatus: r.review_status as any,
    notes: r.notes || "",
  }));

  const jobsRes = await pool.query(
    `SELECT * FROM service_performance_job_tickets WHERE batch_id = $1 ORDER BY sort_order ASC, completion_date ASC;`,
    [id],
  );
  const jobTickets: ServiceJobDetail[] = jobsRes.rows.map((j) => ({
    id: j.id,
    jobTicketNo: j.job_ticket_no,
    employeeCode: j.employee_code,
    employeeName: j.employee_name,
    customerName: j.customer_name,
    equipmentModel: j.equipment_model,
    completionDate: j.completion_date,
    faultCategory: j.fault_category,
    firstTimeFix: Boolean(j.first_time_fix),
    qualityScore: parseFloat(j.quality_score) || 0.0,
    disciplineScore: parseFloat(j.discipline_score) || 0.0,
    eligibility: j.eligibility as JobEligibility,
    isPoorRepeat: Boolean(j.is_poor_repeat),
    repeatReferenceJob: j.repeat_reference_job || undefined,
    hodReviewed: Boolean(j.hod_reviewed),
    closureStatus: j.closure_status as any,
    notes: j.notes || "",
  }));

  const auditRes = await pool.query(
    `SELECT * FROM service_performance_audit_logs WHERE batch_id = $1 ORDER BY created_at DESC;`,
    [id],
  );
  const auditLogs: PerformanceAuditEntry[] = auditRes.rows.map((a) => ({
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
    division: b.division,
    sourceSystem: b.source_system,
    receivedOn: b.received_on,
    status: b.status as PerformanceStatus,
    lockedBy: b.locked_by || undefined,
    lockedAt: b.locked_at ? formatDateTime(b.locked_at) : undefined,
    notes: b.notes || "",
    createdAt: formatDateTime(b.created_at),
    updatedAt: formatDateTime(b.updated_at),
    techLines,
    jobTickets,
    auditLogs,
  };
}

/**
 * Create a new Service Performance Batch in PostgreSQL
 */
export async function createServicePerformanceBatch(
  b: Partial<ServicePerformanceBatchDetails>,
): Promise<ServicePerformanceBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const id = b.id || `BAT-SRV-${Date.now().toString().slice(-6)}`;
    const period = b.period || "May 2026";
    const division = b.division || "Consumer Electronics";
    const sourceSystem = b.sourceSystem || "Servio Service Desk / SAP B1 Service Module";
    const receivedOn = b.receivedOn || `${new Date().toLocaleDateString("en-GB")} IST`;
    const status = b.status || "Draft";
    const lockedBy = b.lockedBy || null;
    const lockedAt = b.lockedAt ? new Date(b.lockedAt) : null;
    const notes = b.notes || "";

    // 1. Insert Batch Header
    await client.query(
      `INSERT INTO service_performance_batches (
        id, period, division, source_system, received_on, status, locked_by, locked_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [id, period, division, sourceSystem, receivedOn, status, lockedBy, lockedAt, notes],
    );

    // 2. Insert Tech Lines
    if (b.techLines && b.techLines.length > 0) {
      for (const [idx, t] of b.techLines.entries()) {
        const lineId = t.id || `spt-${id.slice(-6)}-${idx + 1}`;
        await client.query(
          `INSERT INTO service_performance_technician_lines (
            id, batch_id, employee_code, employee_name, role, division,
            closed_jobs, hod_eligible, partial, not_eligible, excluded,
            avg_quality, avg_discipline, poor_repeats, review_status, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
          [
            lineId,
            id,
            t.employeeCode,
            t.employeeName,
            t.role,
            t.division || division,
            t.closedJobs ?? 0,
            t.hodEligible ?? 0,
            t.partial ?? 0,
            t.notEligible ?? 0,
            t.excluded ?? 0,
            t.avgQuality ?? 0.0,
            t.avgDiscipline ?? 0.0,
            t.poorRepeats ?? 0,
            t.reviewStatus || "Reviewed",
            t.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 3. Insert Job Tickets
    if (b.jobTickets && b.jobTickets.length > 0) {
      for (const [idx, j] of b.jobTickets.entries()) {
        const ticketId = j.id || `spjt-${id.slice(-6)}-${idx + 1}`;
        await client.query(
          `INSERT INTO service_performance_job_tickets (
            id, batch_id, job_ticket_no, employee_code, employee_name, customer_name,
            equipment_model, completion_date, fault_category, first_time_fix,
            quality_score, discipline_score, eligibility, is_poor_repeat,
            repeat_reference_job, hod_reviewed, closure_status, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);`,
          [
            ticketId,
            id,
            j.jobTicketNo,
            j.employeeCode,
            j.employeeName,
            j.customerName,
            j.equipmentModel,
            j.completionDate,
            j.faultCategory,
            j.firstTimeFix ?? true,
            j.qualityScore ?? 10.0,
            j.disciplineScore ?? 10.0,
            j.eligibility || "HOD Eligible",
            j.isPoorRepeat ?? false,
            j.repeatReferenceJob || null,
            j.hodReviewed ?? true,
            j.closureStatus || "Closed",
            j.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 4. Insert Audit Log
    await client.query(
      `INSERT INTO service_performance_audit_logs (
        id, batch_id, timestamp, user_name, user_role, action, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        `spaud-${Date.now().toString().slice(-6)}`,
        id,
        receivedOn,
        "System Pipeline",
        "Integration",
        "Batch Initialized",
        `Created service performance batch for ${period} (${division}) with ${b.jobTickets?.length ?? 0} jobs and ${b.techLines?.length ?? 0} technicians.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const created = await getServicePerformanceBatchById(id);
    if (!created) {
      throw new Error(`Failed to retrieve created service performance batch ${id}`);
    }
    return created;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error("Error creating service performance batch:", error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update an existing Service Performance Batch in PostgreSQL
 */
export async function updateServicePerformanceBatch(
  id: string,
  b: Partial<ServicePerformanceBatchDetails>,
): Promise<ServicePerformanceBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const existing = await client.query(`SELECT * FROM service_performance_batches WHERE id = $1;`, [id]);
    if (!existing.rows || existing.rows.length === 0) {
      clientReleased = true;
      client.release();
      return await createServicePerformanceBatch({ ...b, id });
    }

    const cur = existing.rows[0];
    const period = b.period !== undefined ? b.period : cur.period;
    const division = b.division !== undefined ? b.division : cur.division;
    const sourceSystem = b.sourceSystem !== undefined ? b.sourceSystem : cur.source_system;
    const receivedOn = b.receivedOn !== undefined ? b.receivedOn : cur.received_on;
    const status = b.status !== undefined ? b.status : cur.status;
    const notes = b.notes !== undefined ? b.notes : cur.notes;
    const lockedBy = b.lockedBy !== undefined ? b.lockedBy : cur.locked_by;
    const lockedAt =
      status === "Locked"
        ? new Date()
        : b.lockedAt !== undefined
        ? new Date(b.lockedAt)
        : cur.locked_at;

    // 1. Update Header
    await client.query(
      `UPDATE service_performance_batches SET
        period = $1, division = $2, source_system = $3, received_on = $4,
        status = $5, locked_by = $6, locked_at = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9;`,
      [period, division, sourceSystem, receivedOn, status, lockedBy, lockedAt, notes, id],
    );

    // 2. Overwrite Tech Lines if provided
    if (b.techLines) {
      await client.query(`DELETE FROM service_performance_technician_lines WHERE batch_id = $1;`, [id]);
      for (const [idx, t] of b.techLines.entries()) {
        const lineId = t.id || `spt-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;
        await client.query(
          `INSERT INTO service_performance_technician_lines (
            id, batch_id, employee_code, employee_name, role, division,
            closed_jobs, hod_eligible, partial, not_eligible, excluded,
            avg_quality, avg_discipline, poor_repeats, review_status, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
          [
            lineId,
            id,
            t.employeeCode,
            t.employeeName,
            t.role,
            t.division || division,
            t.closedJobs ?? 0,
            t.hodEligible ?? 0,
            t.partial ?? 0,
            t.notEligible ?? 0,
            t.excluded ?? 0,
            t.avgQuality ?? 0.0,
            t.avgDiscipline ?? 0.0,
            t.poorRepeats ?? 0,
            t.reviewStatus || "Reviewed",
            t.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 3. Overwrite Job Tickets if provided
    if (b.jobTickets) {
      await client.query(`DELETE FROM service_performance_job_tickets WHERE batch_id = $1;`, [id]);
      for (const [idx, j] of b.jobTickets.entries()) {
        const ticketId = j.id || `spjt-${id.slice(-6)}-${idx + 1}-${Date.now().toString().slice(-4)}`;
        await client.query(
          `INSERT INTO service_performance_job_tickets (
            id, batch_id, job_ticket_no, employee_code, employee_name, customer_name,
            equipment_model, completion_date, fault_category, first_time_fix,
            quality_score, discipline_score, eligibility, is_poor_repeat,
            repeat_reference_job, hod_reviewed, closure_status, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);`,
          [
            ticketId,
            id,
            j.jobTicketNo,
            j.employeeCode,
            j.employeeName,
            j.customerName,
            j.equipmentModel,
            j.completionDate,
            j.faultCategory,
            j.firstTimeFix ?? true,
            j.qualityScore ?? 10.0,
            j.disciplineScore ?? 10.0,
            j.eligibility || "HOD Eligible",
            j.isPoorRepeat ?? false,
            j.repeatReferenceJob || null,
            j.hodReviewed ?? true,
            j.closureStatus || "Closed",
            j.notes || "",
            idx + 1,
          ],
        );
      }
    }

    // 4. Log audit action
    await client.query(
      `INSERT INTO service_performance_audit_logs (
        id, batch_id, timestamp, user_name, user_role, action, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        `spaud-${Date.now().toString().slice(-6)}`,
        id,
        `${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} IST`,
        b.lockedBy || "Chaminda Warnakula",
        "Service HOD",
        "Batch Updated",
        `Synchronized ${b.techLines?.length ?? 0} technicians and ${b.jobTickets?.length ?? 0} job tickets in PostgreSQL.`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getServicePerformanceBatchById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated service performance batch ${id}`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating service performance batch ${id}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Lock as HOD or Unlock to Draft
 */
export async function updateServicePerformanceBatchStatus(
  id: string,
  newStatus: PerformanceStatus,
  lockedBy = "Chaminda Warnakula (Service HOD)",
  notes = "",
): Promise<ServicePerformanceBatchDetails> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const lockedAt = newStatus === "Locked" ? new Date() : null;

    const res = await client.query(
      `UPDATE service_performance_batches
       SET status = $1, locked_by = COALESCE($2, locked_by), locked_at = COALESCE($3, locked_at), notes = COALESCE($4, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING period;`,
      [newStatus, newStatus === "Locked" ? lockedBy : null, lockedAt, notes || null, id],
    );

    if (!res.rows || res.rows.length === 0) {
      throw new Error(`Service performance batch ${id} not found.`);
    }

    const period = res.rows[0].period;

    // Log the audit transition
    await client.query(
      `INSERT INTO service_performance_audit_logs (
        id, batch_id, timestamp, user_name, user_role, action, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        `spaud-${Date.now().toString().slice(-6)}`,
        id,
        `${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} IST`,
        lockedBy,
        "Service HOD",
        `Status Changed: ${newStatus}`,
        `Service performance batch for ${period} changed to ${newStatus}. Notes: ${notes || "None"}`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getServicePerformanceBatchById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve batch ${id} after status update.`);
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
 * Delete a Service Performance Batch from PostgreSQL
 */
export async function deleteServicePerformanceBatch(id: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM service_performance_batches WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
