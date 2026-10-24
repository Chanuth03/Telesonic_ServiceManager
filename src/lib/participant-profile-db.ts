import { getDbPool } from "./db";
import {
  type ParticipantRecord,
  type SchemeAssignment,
  type ParticipantHistoryItem,
  type SchemeAssignmentStatus,
} from "@/components/incentive/IncentiveParticipantProfileView";

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
 * Get all incentive participants with their scheme assignments and history
 */
export async function getAllParticipants(
  division?: string,
  activeOnly?: boolean,
): Promise<ParticipantRecord[]> {
  const pool = getDbPool();

  let query = `SELECT * FROM incentive_participants WHERE 1=1`;
  const params: any[] = [];

  if (division && division !== "All Divisions") {
    params.push(division);
    query += ` AND UPPER(division) = UPPER($${params.length})`;
  }

  if (activeOnly) {
    query += ` AND active = TRUE`;
  }

  query += ` ORDER BY id ASC;`;

  const participantsRes = await pool.query(query, params);
  if (!participantsRes.rows || participantsRes.rows.length === 0) {
    return [];
  }

  const participantIds = participantsRes.rows.map((r) => r.id);

  // Fetch scheme assignments
  const assignmentsRes = await pool.query(
    `SELECT * FROM participant_scheme_assignments 
     WHERE participant_id = ANY($1) 
     ORDER BY is_primary_role DESC, created_at ASC;`,
    [participantIds],
  );

  // Fetch history logs
  const historyRes = await pool.query(
    `SELECT * FROM participant_history_logs 
     WHERE participant_id = ANY($1) 
     ORDER BY timestamp DESC;`,
    [participantIds],
  );

  // Group assignments
  const assignmentsMap = new Map<string, SchemeAssignment[]>();
  for (const a of assignmentsRes.rows) {
    const list = assignmentsMap.get(a.participant_id) || [];
    list.push({
      id: a.id,
      schemeCode: a.scheme_code,
      schemeName: a.scheme_name || a.scheme_code,
      calculationRole: a.calculation_role,
      isPrimaryRole: Boolean(a.is_primary_role),
      effectiveFrom: formatDate(a.effective_from),
      effectiveTo: a.effective_to ? formatDate(a.effective_to) : "",
      targetAllocationPercent: Number(a.target_allocation_percent),
      status: (a.status as SchemeAssignmentStatus) || "Active",
      notes: a.notes || "",
    });
    assignmentsMap.set(a.participant_id, list);
  }

  // Group history
  const historyMap = new Map<string, ParticipantHistoryItem[]>();
  for (const h of historyRes.rows) {
    const list = historyMap.get(h.participant_id) || [];
    list.push({
      id: h.id,
      timestamp: formatDateTime(h.timestamp),
      author: h.author,
      role: h.role,
      eventType: h.event_type as any,
      schemeCode: h.scheme_code || undefined,
      previousValue: h.previous_value || "",
      newValue: h.new_value || "",
      changeReason: h.change_reason || "",
    });
    historyMap.set(h.participant_id, list);
  }

  return participantsRes.rows.map((row) => ({
    id: row.id,
    name: row.name,
    salesEmployeeCode: row.sales_employee_code || "",
    division: row.division,
    segmentChannel: row.segment_channel || "",
    areaManager: row.area_manager || "",
    designation: row.designation,
    payrollId: row.payroll_id,
    active: Boolean(row.active),
    phone: row.phone || "",
    email: row.email || "",
    joinDate: row.join_date || formatDate(row.created_at),
    assignments: assignmentsMap.get(row.id) || [],
    history: historyMap.get(row.id) || [],
  }));
}

/**
 * Get single participant by Employee ID
 */
export async function getParticipantById(id: string): Promise<ParticipantRecord | null> {
  const all = await getAllParticipants();
  return (
    all.find(
      (p) =>
        p.id.toLowerCase() === id.toLowerCase() ||
        (p.salesEmployeeCode && p.salesEmployeeCode.toLowerCase() === id.toLowerCase()),
    ) || null
  );
}

/**
 * Create a new Participant Profile
 */
export async function createParticipant(
  p: Partial<ParticipantRecord>,
): Promise<ParticipantRecord> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const id = p.id || `EMP-${Date.now().toString().slice(-4)}`;
    const name = p.name || "New Participant";
    const salesEmployeeCode = p.salesEmployeeCode || `SL-${id.slice(-3)}`;
    const division = p.division || "Consumer Electronics";
    const segmentChannel = p.segmentChannel || "Field Engineering & Repairs";
    const areaManager = p.areaManager || "";
    const designation = p.designation || "Service Technician";
    const payrollId = p.payrollId || `PAY-${id.slice(-4)}`;
    const active = p.active ?? true;
    const phone = p.phone || "";
    const email = p.email || "";
    const joinDate = p.joinDate || formatDate(new Date());

    await client.query(
      `INSERT INTO incentive_participants (
        id, name, sales_employee_code, division, segment_channel,
        area_manager, designation, payroll_id, active, phone, email, join_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
      [
        id,
        name,
        salesEmployeeCode,
        division,
        segmentChannel,
        areaManager,
        designation,
        payrollId,
        active,
        phone,
        email,
        joinDate,
      ],
    );

    // Insert assignments if provided
    if (p.assignments && p.assignments.length > 0) {
      for (const [idx, a] of p.assignments.entries()) {
        const asgId = a.id || `asg-${id.slice(-4)}-${idx + 1}-${Date.now().toString().slice(-4)}`;
        await client.query(
          `INSERT INTO participant_scheme_assignments (
            id, participant_id, scheme_code, scheme_name, calculation_role,
            is_primary_role, effective_from, effective_to, target_allocation_percent,
            status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
          [
            asgId,
            id,
            a.schemeCode,
            a.schemeName || a.schemeCode,
            a.calculationRole || "Primary Technician",
            a.isPrimaryRole ?? true,
            a.effectiveFrom || formatDate(new Date()),
            a.effectiveTo ? a.effectiveTo : null,
            a.targetAllocationPercent ?? 100,
            a.status || "Active",
            a.notes || "",
          ],
        );
      }
    }

    // Insert history log
    await client.query(
      `INSERT INTO participant_history_logs (
        id, participant_id, author, role, event_type, scheme_code, previous_value, new_value, change_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        `hist-${Date.now().toString().slice(-6)}`,
        id,
        "admin.incentive@telesonic.lk",
        "Incentive Administrator",
        "Profile Created",
        p.assignments?.[0]?.schemeCode || null,
        "None",
        `${designation} (${division})`,
        "Participant profile enrolled into Incentive System",
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const created = await getParticipantById(id);
    if (!created) {
      throw new Error(`Failed to retrieve created participant ${id}`);
    }
    return created;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error("Error creating participant profile:", error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Update Participant Profile header details
 */
export async function updateParticipant(
  id: string,
  p: Partial<ParticipantRecord>,
): Promise<ParticipantRecord> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const existing = await client.query(`SELECT * FROM incentive_participants WHERE id = $1;`, [id]);
    if (!existing.rows || existing.rows.length === 0) {
      clientReleased = true;
      client.release();
      return await createParticipant({ ...p, id });
    }

    const cur = existing.rows[0];
    const name = p.name ?? cur.name;
    const salesEmployeeCode = p.salesEmployeeCode ?? cur.sales_employee_code;
    const division = p.division ?? cur.division;
    const segmentChannel = p.segmentChannel ?? cur.segment_channel;
    const areaManager = p.areaManager ?? cur.area_manager;
    const designation = p.designation ?? cur.designation;
    const payrollId = p.payrollId ?? cur.payroll_id;
    const active = p.active ?? cur.active;
    const phone = p.phone ?? cur.phone;
    const email = p.email ?? cur.email;

    await client.query(
      `UPDATE incentive_participants SET
        name = $1, sales_employee_code = $2, division = $3, segment_channel = $4,
        area_manager = $5, designation = $6, payroll_id = $7, active = $8,
        phone = $9, email = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11;`,
      [
        name,
        salesEmployeeCode,
        division,
        segmentChannel,
        areaManager,
        designation,
        payrollId,
        active,
        phone,
        email,
        id,
      ],
    );

    // If assignments provided, synchronize them
    if (p.assignments) {
      await client.query(`DELETE FROM participant_scheme_assignments WHERE participant_id = $1;`, [id]);
      for (const [idx, a] of p.assignments.entries()) {
        const asgId =
          a.id && !a.id.startsWith("new-")
            ? a.id
            : `asg-${id.slice(-4)}-${idx + 1}-${Date.now().toString().slice(-4)}`;

        await client.query(
          `INSERT INTO participant_scheme_assignments (
            id, participant_id, scheme_code, scheme_name, calculation_role,
            is_primary_role, effective_from, effective_to, target_allocation_percent,
            status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
          [
            asgId,
            id,
            a.schemeCode,
            a.schemeName || a.schemeCode,
            a.calculationRole || "Primary Technician",
            a.isPrimaryRole ?? true,
            a.effectiveFrom || formatDate(new Date()),
            a.effectiveTo ? a.effectiveTo : null,
            a.targetAllocationPercent ?? 100,
            a.status || "Active",
            a.notes || "",
          ],
        );
      }
    }

    // Log update
    await client.query(
      `INSERT INTO participant_history_logs (
        id, participant_id, author, role, event_type, previous_value, new_value, change_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `hist-${Date.now().toString().slice(-6)}`,
        id,
        "admin.incentive@telesonic.lk",
        "Incentive Administrator",
        "Role Reassigned",
        `${cur.designation} (${cur.division})`,
        `${designation} (${division})`,
        "Participant profile details synchronized with PostgreSQL",
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getParticipantById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated participant ${id}`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error(`Error updating participant ${id}:`, error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Assign a new scheme to an existing participant
 */
export async function assignSchemeToParticipant(
  participantId: string,
  assignment: Partial<SchemeAssignment>,
): Promise<ParticipantRecord> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    const asgId = assignment.id || `asg-${participantId.slice(-4)}-${Date.now().toString().slice(-4)}`;
    const schemeCode = assignment.schemeCode || "SCH-SRV-2026";
    const schemeName = assignment.schemeName || schemeCode;
    const calculationRole = assignment.calculationRole || "Primary Technician";
    const isPrimaryRole = assignment.isPrimaryRole ?? true;
    const effectiveFrom = assignment.effectiveFrom || formatDate(new Date());
    const effectiveTo = assignment.effectiveTo ? assignment.effectiveTo : null;
    const targetAllocationPercent = assignment.targetAllocationPercent ?? 100;
    const status = assignment.status || "Active";
    const notes = assignment.notes || "";

    await client.query(
      `INSERT INTO participant_scheme_assignments (
        id, participant_id, scheme_code, scheme_name, calculation_role,
        is_primary_role, effective_from, effective_to, target_allocation_percent,
        status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        asgId,
        participantId,
        schemeCode,
        schemeName,
        calculationRole,
        isPrimaryRole,
        effectiveFrom,
        effectiveTo,
        targetAllocationPercent,
        status,
        notes,
      ],
    );

    // Audit log
    await client.query(
      `INSERT INTO participant_history_logs (
        id, participant_id, author, role, event_type, scheme_code, previous_value, new_value, change_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        `hist-${Date.now().toString().slice(-6)}`,
        participantId,
        "admin.incentive@telesonic.lk",
        "Incentive Administrator",
        "Scheme Enrolled",
        schemeCode,
        "None",
        `${calculationRole} (${targetAllocationPercent}% Allocation)`,
        notes || `Assigned to scheme ${schemeCode}`,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getParticipantById(participantId);
    if (!updated) {
      throw new Error(`Failed to retrieve participant ${participantId} after assignment`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error("Error assigning scheme to participant:", error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * End or Remove a Scheme Assignment
 */
export async function endSchemeAssignment(
  participantId: string,
  assignmentId: string,
  reason = "Assignment terminated by Administrator",
): Promise<ParticipantRecord> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    // Fetch assignment to log details
    const asgRes = await client.query(
      `SELECT * FROM participant_scheme_assignments WHERE id = $1 AND participant_id = $2;`,
      [assignmentId, participantId],
    );

    const asg = asgRes.rows[0];
    const schemeCode = asg ? asg.scheme_code : "";

    // Delete or mark inactive
    await client.query(
      `DELETE FROM participant_scheme_assignments WHERE id = $1 AND participant_id = $2;`,
      [assignmentId, participantId],
    );

    // Audit log
    await client.query(
      `INSERT INTO participant_history_logs (
        id, participant_id, author, role, event_type, scheme_code, previous_value, new_value, change_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        `hist-${Date.now().toString().slice(-6)}`,
        participantId,
        "admin.incentive@telesonic.lk",
        "Incentive Administrator",
        "Status Changed",
        schemeCode,
        "Active Assignment",
        "De-enrolled / Ended",
        reason,
      ],
    );

    await client.query("COMMIT");
    clientReleased = true;
    client.release();

    const updated = await getParticipantById(participantId);
    if (!updated) {
      throw new Error(`Failed to retrieve participant ${participantId} after ending assignment`);
    }
    return updated;
  } catch (error) {
    if (!clientReleased) {
      await client.query("ROLLBACK");
      clientReleased = true;
      client.release();
    }
    console.error("Error ending scheme assignment:", error);
    throw error;
  } finally {
    if (!clientReleased) {
      client.release();
    }
  }
}

/**
 * Delete a Participant Profile
 */
export async function deleteParticipant(id: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_participants WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
