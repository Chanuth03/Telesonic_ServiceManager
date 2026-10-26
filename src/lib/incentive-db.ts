import { getDbPool } from "./db";
import type {
  IncentiveScheme,
  SchemeRule,
  SchemeSlab,
  SchemeRateItem,
  SchemeVersionItem,
  SchemeHistoryLog,
  SchemeStatus,
} from "@/components/incentive/SchemeMasterView";

function formatDate(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") {
    const parts = val.split("T");
    return parts[0] ?? val;
  }
  if (val instanceof Date) {
    const parts = val.toISOString().split("T");
    return parts[0] ?? "";
  }
  return String(val);
}

function formatTimestamp(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof Date) {
    const iso = val.toISOString();
    const parts = iso.split("T");
    const datePart = parts[0] ?? "";
    const timePart = parts[1]?.substring(0, 5) ?? "";
    return `${datePart} ${timePart}`.trim();
  }
  return String(val);
}

/**
 * Fetch all incentive schemes from PostgreSQL with nested relations
 */
export async function getAllIncentiveSchemes(): Promise<IncentiveScheme[]> {
  const pool = getDbPool();

  const schemesRes = await pool.query(
    `SELECT * FROM incentive_schemes ORDER BY created_at DESC;`,
  );
  if (!schemesRes.rows || schemesRes.rows.length === 0) {
    return [];
  }

  const schemeIds = schemesRes.rows.map((r: { id: string }) => r.id);

  // Fetch all related items in batch queries
  const [rulesRes, slabsRes, ratesRes, versionsRes, historyRes] = await Promise.all([
    pool.query(`SELECT * FROM scheme_rules WHERE scheme_id = ANY($1) ORDER BY created_at ASC;`, [
      schemeIds,
    ]),
    pool.query(`SELECT * FROM scheme_slabs WHERE scheme_id = ANY($1) ORDER BY min_percent ASC;`, [
      schemeIds,
    ]),
    pool.query(`SELECT * FROM scheme_rate_items WHERE scheme_id = ANY($1) ORDER BY created_at ASC;`, [
      schemeIds,
    ]),
    pool.query(`SELECT * FROM scheme_versions WHERE scheme_id = ANY($1) ORDER BY created_date DESC;`, [
      schemeIds,
    ]),
    pool.query(`SELECT * FROM scheme_history_logs WHERE scheme_id = ANY($1) ORDER BY timestamp DESC;`, [
      schemeIds,
    ]),
  ]);

  // Group by scheme_id
  const rulesMap = new Map<string, SchemeRule[]>();
  for (const r of rulesRes.rows) {
    const list = rulesMap.get(r.scheme_id) || [];
    list.push({
      id: r.id,
      rule: r.rule,
      parameter: r.parameter,
      value: r.value,
      source: r.source,
    });
    rulesMap.set(r.scheme_id, list);
  }

  const slabsMap = new Map<string, SchemeSlab[]>();
  for (const s of slabsRes.rows) {
    const list = slabsMap.get(s.scheme_id) || [];
    list.push({
      slabId: s.slab_id,
      minPercent: Number(s.min_percent),
      maxPercent: Number(s.max_percent),
      payoutPercent: Number(s.payout_percent),
      multiplier: Number(s.multiplier),
      description: s.description || "",
    });
    slabsMap.set(s.scheme_id, list);
  }

  const ratesMap = new Map<string, SchemeRateItem[]>();
  for (const rt of ratesRes.rows) {
    const list = ratesMap.get(rt.scheme_id) || [];
    list.push({
      category: rt.category,
      productLine: rt.product_line,
      commissionRate: rt.commission_rate,
      paymentTermBand: rt.payment_term_band,
      basis: rt.basis,
    });
    ratesMap.set(rt.scheme_id, list);
  }

  const versionsMap = new Map<string, SchemeVersionItem[]>();
  for (const v of versionsRes.rows) {
    const list = versionsMap.get(v.scheme_id) || [];
    list.push({
      version: v.version,
      effectiveFrom: formatDate(v.effective_from),
      effectiveTo: formatDate(v.effective_to),
      status: v.status as SchemeStatus,
      createdBy: v.created_by,
      createdDate: formatDate(v.created_date),
      approvedBy: v.approved_by || undefined,
      approvalDate: v.approval_date ? formatDate(v.approval_date) : undefined,
      changeSummary: v.change_summary,
    });
    versionsMap.set(v.scheme_id, list);
  }

  const historyMap = new Map<string, SchemeHistoryLog[]>();
  for (const h of historyRes.rows) {
    const list = historyMap.get(h.scheme_id) || [];
    list.push({
      id: h.id,
      timestamp: formatTimestamp(h.timestamp),
      user: h.user,
      role: h.role,
      action: h.action,
      details: h.details,
    });
    historyMap.set(h.scheme_id, list);
  }

  // Map into IncentiveScheme objects
  return schemesRes.rows.map((row: any) => {
    const exclusions = row.exclusions || {
      customerGroups: [],
      itemCategories: [],
      jobCodes: [],
      clawbackWindowDays: 30,
    };

    const posting = row.posting || {
      debitGlAccount: "621000",
      debitGlName: "Incentive Expense",
      creditGlAccount: "214050",
      creditGlName: "Accrued Incentive Payable",
      costCenter: "CC-DEFAULT",
      projectCode: "PRJ-DEFAULT",
      postingDayOfMonth: 25,
      journalRemarksTemplate: `INC/{Period}/${row.scheme_code}/{EmpNo}`,
    };

    return {
      id: row.id,
      schemeCode: row.scheme_code,
      schemeName: row.scheme_name,
      division: row.division,
      schemeType: row.scheme_type,
      participantRole: row.participant_role,
      calculationBasis: row.calculation_basis,
      ageBasis: row.age_basis,
      payableLagMonths: Number(row.payable_lag_months || 1),
      effectiveFrom: formatDate(row.effective_from),
      effectiveTo: formatDate(row.effective_to),
      status: row.status as SchemeStatus,
      version: row.version || "v1.0",
      description: row.description || "",
      rules: rulesMap.get(row.id) || [],
      slabs: slabsMap.get(row.id) || [],
      rateItems: ratesMap.get(row.id) || [],
      exclusions,
      posting,
      versions: versionsMap.get(row.id) || [],
      history: historyMap.get(row.id) || [],
    };
  });
}

/**
 * Create a new incentive scheme in PostgreSQL
 */
export async function createIncentiveScheme(scheme: Partial<IncentiveScheme>): Promise<IncentiveScheme> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const id = scheme.id || `sch-${Date.now().toString().slice(-6)}`;
    const schemeCode = scheme.schemeCode || `SCH-NEW-${Date.now().toString().slice(-4)}`;
    const schemeName = scheme.schemeName || "New Incentive Scheme";
    const division = scheme.division || "Mobile & Accessories";
    const schemeType = scheme.schemeType || "Turnover Tier + Slabs";
    const participantRole = scheme.participantRole || "Retail Sales Executive";
    const calculationBasis = scheme.calculationBasis || "Billed Revenue (Excl. Tax)";
    const ageBasis = scheme.ageBasis || "Invoice Date";
    const payableLagMonths = scheme.payableLagMonths ?? 1;
    const effectiveFrom = scheme.effectiveFrom || new Date().toISOString().split("T")[0];
    const effectiveTo = scheme.effectiveTo || "2026-12-31";
    const status = scheme.status || "Draft";
    const version = scheme.version || "v1.0";
    const description = scheme.description || "";
    const exclusions = scheme.exclusions || {
      customerGroups: [],
      itemCategories: [],
      jobCodes: [],
      clawbackWindowDays: 30,
    };
    const posting = scheme.posting || {
      debitGlAccount: "621000",
      debitGlName: "Incentive Expense",
      creditGlAccount: "214050",
      creditGlName: "Accrued Incentive Payable",
      costCenter: "CC-GEN",
      projectCode: "PRJ-GEN",
      postingDayOfMonth: 25,
      journalRemarksTemplate: `INC/{Period}/${schemeCode}/{EmpNo}`,
    };

    // 1. Insert Scheme
    await client.query(
      `INSERT INTO incentive_schemes (
        id, scheme_code, scheme_name, division, scheme_type, participant_role,
        calculation_basis, age_basis, payable_lag_months, effective_from, effective_to,
        status, version, description, exclusions, posting
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
      [
        id,
        schemeCode,
        schemeName,
        division,
        schemeType,
        participantRole,
        calculationBasis,
        ageBasis,
        payableLagMonths,
        effectiveFrom,
        effectiveTo,
        status,
        version,
        description,
        JSON.stringify(exclusions),
        JSON.stringify(posting),
      ],
    );

    // 2. Insert Rules
    if (scheme.rules && scheme.rules.length > 0) {
      for (const [i, r] of scheme.rules.entries()) {
        await client.query(
          `INSERT INTO scheme_rules (id, scheme_id, rule, parameter, value, source)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [r.id || `r-${Date.now()}-${i}`, id, r.rule, r.parameter, r.value, r.source],
        );
      }
    }

    // 3. Insert Slabs
    if (scheme.slabs && scheme.slabs.length > 0) {
      for (const [i, s] of scheme.slabs.entries()) {
        await client.query(
          `INSERT INTO scheme_slabs (id, scheme_id, slab_id, min_percent, max_percent, payout_percent, multiplier, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            `sl-${Date.now()}-${i}`,
            id,
            s.slabId,
            s.minPercent,
            s.maxPercent,
            s.payoutPercent,
            s.multiplier,
            s.description,
          ],
        );
      }
    }

    // 4. Insert Rate Items
    if (scheme.rateItems && scheme.rateItems.length > 0) {
      for (const [i, rt] of scheme.rateItems.entries()) {
        await client.query(
          `INSERT INTO scheme_rate_items (id, scheme_id, category, product_line, commission_rate, payment_term_band, basis)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [
            `rt-${Date.now()}-${i}`,
            id,
            rt.category,
            rt.productLine,
            rt.commissionRate,
            rt.paymentTermBand,
            rt.basis,
          ],
        );
      }
    }

    // 5. Initial Version
    await client.query(
      `INSERT INTO scheme_versions (id, scheme_id, version, effective_from, effective_to, status, created_by, change_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        `v-${Date.now()}`,
        id,
        version,
        effectiveFrom,
        effectiveTo,
        status,
        "Administrator",
        "Initial scheme creation.",
      ],
    );

    // 6. Initial History Log
    await client.query(
      `INSERT INTO scheme_history_logs (id, scheme_id, "user", role, action, details)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `h-${Date.now()}`,
        id,
        "Administrator",
        "Incentive Manager",
        "Scheme Created",
        `Created new scheme ${schemeCode} (${schemeName}).`,
      ],
    );

    await client.query("COMMIT");

    const all = await getAllIncentiveSchemes();
    const created = all.find((s) => s.id === id);
    if (!created) {
      throw new Error(`Failed to find created scheme ${id}`);
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
 * Update an existing scheme in PostgreSQL
 */
export async function updateIncentiveScheme(
  id: string,
  updates: Partial<IncentiveScheme> & { modifiedBy?: string; changeNote?: string },
): Promise<IncentiveScheme> {
  const pool = getDbPool();
  const client = await pool.connect();
  let clientReleased = false;

  try {
    await client.query("BEGIN");

    // Fetch existing by ID, or fallback to scheme_code if ID is client-generated
    let existingRes = await client.query(`SELECT * FROM incentive_schemes WHERE id = $1;`, [id]);
    let current = existingRes.rows?.[0];

    if (!current && updates.schemeCode) {
      existingRes = await client.query(
        `SELECT * FROM incentive_schemes WHERE UPPER(scheme_code) = UPPER($1);`,
        [updates.schemeCode.trim()],
      );
      current = existingRes.rows?.[0];
    }

    if (!current) {
      // Upsert: Create scheme if it does not yet exist in PostgreSQL
      await client.query("ROLLBACK");
      client.release();
      clientReleased = true;
      return await createIncentiveScheme({ ...updates, id });
    }

    const targetId = current.id;

    // 1. Update basic fields
    await client.query(
      `UPDATE incentive_schemes SET
        scheme_code = $1,
        scheme_name = $2,
        division = $3,
        scheme_type = $4,
        participant_role = $5,
        calculation_basis = $6,
        age_basis = $7,
        payable_lag_months = $8,
        effective_from = $9,
        effective_to = $10,
        status = $11,
        version = $12,
        description = $13,
        exclusions = $14,
        posting = $15,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $16;`,
      [
        updates.schemeCode ?? current.scheme_code,
        updates.schemeName ?? current.scheme_name,
        updates.division ?? current.division,
        updates.schemeType ?? current.scheme_type,
        updates.participantRole ?? current.participant_role,
        updates.calculationBasis ?? current.calculation_basis,
        updates.ageBasis ?? current.age_basis,
        updates.payableLagMonths ?? current.payable_lag_months,
        updates.effectiveFrom ?? current.effective_from,
        updates.effectiveTo ?? current.effective_to,
        updates.status ?? current.status,
        updates.version ?? current.version,
        updates.description ?? current.description,
        JSON.stringify(updates.exclusions ?? current.exclusions),
        JSON.stringify(updates.posting ?? current.posting),
        targetId,
      ],
    );

    // 2. Replace Rules if provided
    if (updates.rules) {
      await client.query(`DELETE FROM scheme_rules WHERE scheme_id = $1;`, [targetId]);
      for (const [i, r] of updates.rules.entries()) {
        await client.query(
          `INSERT INTO scheme_rules (id, scheme_id, rule, parameter, value, source)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [r.id || `r-${Date.now()}-${i}`, targetId, r.rule, r.parameter, r.value, r.source],
        );
      }
    }

    // 3. Replace Slabs if provided
    if (updates.slabs) {
      await client.query(`DELETE FROM scheme_slabs WHERE scheme_id = $1;`, [targetId]);
      for (const [i, s] of updates.slabs.entries()) {
        await client.query(
          `INSERT INTO scheme_slabs (id, scheme_id, slab_id, min_percent, max_percent, payout_percent, multiplier, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            `sl-${Date.now()}-${i}`,
            targetId,
            s.slabId,
            s.minPercent,
            s.maxPercent,
            s.payoutPercent,
            s.multiplier,
            s.description,
          ],
        );
      }
    }

    // 4. Replace Rate Items if provided
    if (updates.rateItems) {
      await client.query(`DELETE FROM scheme_rate_items WHERE scheme_id = $1;`, [targetId]);
      for (const [i, rt] of updates.rateItems.entries()) {
        await client.query(
          `INSERT INTO scheme_rate_items (id, scheme_id, category, product_line, commission_rate, payment_term_band, basis)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [
            `rt-${Date.now()}-${i}`,
            targetId,
            rt.category,
            rt.productLine,
            rt.commissionRate,
            rt.paymentTermBand,
            rt.basis,
          ],
        );
      }
    }

    // 5. Append Audit Log
    const user = updates.modifiedBy || "Administrator";
    const action = updates.changeNote ? "Scheme Updated" : "Parameters Saved";
    const details =
      updates.changeNote ||
      `Updated rules, slabs, and general parameters for ${updates.schemeCode || current.scheme_code}.`;

    await client.query(
      `INSERT INTO scheme_history_logs (id, scheme_id, "user", role, action, details)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [`h-${Date.now()}`, targetId, user, "Incentive Administrator", action, details],
    );

    await client.query("COMMIT");

    const all = await getAllIncentiveSchemes();
    const updated = all.find((s) => s.id === targetId);
    if (!updated) {
      throw new Error(`Failed to find updated scheme ${targetId}`);
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
 * Transition Scheme Status (Draft -> Approved -> Active -> Superseded / Inactive)
 */
export async function updateSchemeStatus(
  id: string,
  newStatus: SchemeStatus,
  user: string = "Administrator",
  role: string = "Finance Approver",
  reason: string = "Status transition",
): Promise<IncentiveScheme> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingRes = await client.query(`SELECT * FROM incentive_schemes WHERE id = $1;`, [id]);
    if (!existingRes.rows || existingRes.rows.length === 0) {
      throw new Error(`Scheme ${id} not found.`);
    }

    const scheme = existingRes.rows[0];
    if (!scheme) {
      throw new Error(`Scheme ${id} not found.`);
    }
    const prevStatus = scheme.status;

    // Update status in scheme table
    await client.query(
      `UPDATE incentive_schemes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`,
      [newStatus, id],
    );

    // If status became Approved, mark latest version approved
    if (newStatus === "Approved") {
      await client.query(
        `UPDATE scheme_versions SET status = 'Approved', approved_by = $1, approval_date = CURRENT_TIMESTAMP
         WHERE scheme_id = $2 AND status = 'Draft';`,
        [user, id],
      );
    } else if (newStatus === "Active") {
      await client.query(
        `UPDATE scheme_versions SET status = 'Active' WHERE scheme_id = $1 AND (status = 'Draft' OR status = 'Approved');`,
        [id],
      );
    } else if (newStatus === "Superseded" || newStatus === "Inactive") {
      await client.query(
        `UPDATE scheme_versions SET status = $1 WHERE scheme_id = $2 AND status = 'Active';`,
        [newStatus, id],
      );
    }

    // Add audit log
    await client.query(
      `INSERT INTO scheme_history_logs (id, scheme_id, "user", role, action, details)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        `h-${Date.now()}`,
        id,
        user,
        role,
        `Status Changed to ${newStatus}`,
        `Transitioned status from ${prevStatus} to ${newStatus}. Note: ${reason}`,
      ],
    );

    await client.query("COMMIT");

    const all = await getAllIncentiveSchemes();
    const updated = all.find((s) => s.id === id);
    if (!updated) {
      throw new Error(`Failed to find scheme ${id}`);
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
 * Clone an existing scheme
 */
export async function cloneIncentiveScheme(
  sourceSchemeId: string,
  newCode: string,
  newName: string,
  _user: string = "Administrator",
): Promise<IncentiveScheme> {
  const all = await getAllIncentiveSchemes();
  const source = all.find((s) => s.id === sourceSchemeId);
  if (!source) {
    throw new Error(`Source scheme ${sourceSchemeId} not found.`);
  }

  const cloned: Partial<IncentiveScheme> = {
    ...source,
    id: `sch-${Date.now().toString().slice(-6)}`,
    schemeCode: newCode,
    schemeName: newName,
    status: "Draft",
    version: "v1.0",
    rules: source.rules.map((r, i) => ({ ...r, id: `r-${Date.now()}-${i}` })),
    slabs: source.slabs.map((s) => ({ ...s })),
    rateItems: source.rateItems.map((rt) => ({ ...rt })),
  };

  return await createIncentiveScheme(cloned);
}

/**
 * Delete a scheme (only Draft or Inactive allowed)
 */
export async function deleteIncentiveScheme(id: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM incentive_schemes WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
