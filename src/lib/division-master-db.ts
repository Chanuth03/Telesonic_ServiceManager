import { getDbPool } from "./db";

export type DivisionStatus = "Active" | "Inactive";

export interface DivisionItem {
  id: string;
  divisionCode: string;
  divisionName: string;
  description: string;
  hodName: string;
  hodEmail?: string | undefined;
  costCenterCode: string;
  status: DivisionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DivisionFilter {
  status?: DivisionStatus | "All" | undefined;
  search?: string | undefined;
}

function formatDateTime(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(val);
}

/**
 * Ensure PostgreSQL Tables & Seed Data exist for Division Master
 */
export async function ensureDivisionTables(): Promise<void> {
  const pool = getDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_divisions (
      id VARCHAR(64) PRIMARY KEY,
      division_code VARCHAR(32) UNIQUE NOT NULL,
      division_name VARCHAR(128) NOT NULL,
      description TEXT NOT NULL,
      hod_name VARCHAR(128) NOT NULL,
      hod_email VARCHAR(128),
      cost_center_code VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_div_code ON incentive_divisions (division_code);
    CREATE INDEX IF NOT EXISTS idx_div_status ON incentive_divisions (status);
  `);

  const countRes = await pool.query(`SELECT COUNT(*) FROM incentive_divisions;`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    const seeds = [
      {
        id: "DIV-RLC",
        divisionCode: "RLC",
        divisionName: "Retail & Consumer Electronics",
        description: "Retail sales network, solar inverter capacity distribution, dealer sales executives, and area sales management.",
        hodName: "Bandhan Senaratne",
        hodEmail: "bandhan.s@telesonic.lk",
        costCenterCode: "CC-RLC-01",
        status: "Active",
      },
      {
        id: "DIV-CAC",
        divisionCode: "CAC",
        divisionName: "Commercial Air Conditioning",
        description: "Central HVAC engineering projects, VRF installations, corporate chillers, and project pool incentive distribution.",
        hodName: "Ruwan Jayasinghe",
        hodEmail: "ruwan.j@telesonic.lk",
        costCenterCode: "CC-CAC-02",
        status: "Active",
      },
      {
        id: "DIV-MHA",
        divisionCode: "MHA",
        divisionName: "Major Home Appliances",
        description: "Refrigerators, washing machines, kitchen ovens, showroom promoters, and dealer sell-out incentive schemes.",
        hodName: "Kamal Perera",
        hodEmail: "kamal.p@telesonic.lk",
        costCenterCode: "CC-MHA-03",
        status: "Active",
      },
      {
        id: "DIV-SRV",
        divisionCode: "SRV",
        divisionName: "Service & Technical Department",
        description: "Field technical service, bench workshop repairs, coordinator performance, first-time-fix evaluation, and scorecard tiers.",
        hodName: "Kamal Wijeratne",
        hodEmail: "kamal.w@telesonic.lk",
        costCenterCode: "CC-SRV-04",
        status: "Active",
      },
      {
        id: "DIV-MTR",
        divisionCode: "MTR",
        divisionName: "Modern Trade & Key Accounts",
        description: "Supermarket chains, institutional bulk supplies, key corporate clients, and promoter commission structures.",
        hodName: "Nuwan Dias",
        hodEmail: "nuwan.d@telesonic.lk",
        costCenterCode: "CC-MTR-05",
        status: "Active",
      },
    ];

    for (const s of seeds) {
      await pool.query(
        `
        INSERT INTO incentive_divisions (
          id, division_code, division_name, description, hod_name,
          hod_email, cost_center_code, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        )
      `,
        [
          s.id,
          s.divisionCode,
          s.divisionName,
          s.description,
          s.hodName,
          s.hodEmail,
          s.costCenterCode,
          s.status,
        ]
      );
    }
  }
}

function mapRowToItem(r: any): DivisionItem {
  return {
    id: r.id,
    divisionCode: r.division_code,
    divisionName: r.division_name,
    description: r.description,
    hodName: r.hod_name,
    hodEmail: r.hod_email || undefined,
    costCenterCode: r.cost_center_code,
    status: r.status as DivisionStatus,
    createdAt: formatDateTime(r.created_at),
    updatedAt: formatDateTime(r.updated_at),
  };
}

/**
 * Get all divisions matching optional filters
 */
export async function getAllDivisions(
  filters: DivisionFilter = {}
): Promise<DivisionItem[]> {
  await ensureDivisionTables();
  const pool = getDbPool();

  let query = `SELECT * FROM incentive_divisions WHERE 1=1`;
  const params: any[] = [];
  let pIdx = 1;

  if (filters.status && filters.status !== "All") {
    query += ` AND status = $${pIdx++}`;
    params.push(filters.status);
  }

  if (filters.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    query += ` AND (
      LOWER(id) LIKE $${pIdx} OR
      LOWER(division_code) LIKE $${pIdx} OR
      LOWER(division_name) LIKE $${pIdx} OR
      LOWER(description) LIKE $${pIdx} OR
      LOWER(hod_name) LIKE $${pIdx} OR
      LOWER(cost_center_code) LIKE $${pIdx}
    )`;
    params.push(q);
    pIdx++;
  }

  query += ` ORDER BY division_code ASC;`;

  const res = await pool.query(query, params);
  return res.rows.map(mapRowToItem);
}

/**
 * Get single division by ID or Code
 */
export async function getDivisionById(idOrCode: string): Promise<DivisionItem | null> {
  await ensureDivisionTables();
  const pool = getDbPool();

  const clean = decodeURIComponent(idOrCode).trim();
  const res = await pool.query(
    `SELECT * FROM incentive_divisions 
     WHERE id = $1 OR division_code = $1 OR UPPER(id) = UPPER($1) OR UPPER(division_code) = UPPER($1);`,
    [clean]
  );
  if (res.rows.length === 0) return null;
  return mapRowToItem(res.rows[0]);
}

/**
 * Create a new division
 */
export async function createDivision(
  data: Omit<DivisionItem, "id" | "createdAt" | "updatedAt"> & { id?: string | undefined }
): Promise<DivisionItem> {
  await ensureDivisionTables();
  const pool = getDbPool();

  const code = data.divisionCode.trim().toUpperCase();
  const id = data.id || `DIV-${code}`;

  const res = await pool.query(
    `
    INSERT INTO incentive_divisions (
      id, division_code, division_name, description, hod_name,
      hod_email, cost_center_code, status, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
    )
    RETURNING *;
  `,
    [
      id,
      code,
      data.divisionName,
      data.description,
      data.hodName,
      data.hodEmail || null,
      data.costCenterCode || `CC-${code}-01`,
      data.status || "Active",
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Update an existing division
 */
export async function updateDivision(
  id: string,
  data: Partial<Omit<DivisionItem, "id" | "createdAt" | "updatedAt">>
): Promise<DivisionItem | null> {
  await ensureDivisionTables();
  const pool = getDbPool();

  const existing = await getDivisionById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...data,
  };

  const res = await pool.query(
    `
    UPDATE incentive_divisions SET
      division_code = $1,
      division_name = $2,
      description = $3,
      hod_name = $4,
      hod_email = $5,
      cost_center_code = $6,
      status = $7,
      updated_at = NOW()
    WHERE id = $8
    RETURNING *;
  `,
    [
      updated.divisionCode.toUpperCase(),
      updated.divisionName,
      updated.description,
      updated.hodName,
      updated.hodEmail || null,
      updated.costCenterCode,
      updated.status,
      existing.id,
    ]
  );

  return mapRowToItem(res.rows[0]);
}

/**
 * Delete a division
 */
export async function deleteDivision(id: string): Promise<boolean> {
  await ensureDivisionTables();
  const pool = getDbPool();

  const clean = decodeURIComponent(id).trim();
  const res = await pool.query(
    `DELETE FROM incentive_divisions 
     WHERE id = $1 OR division_code = $1 OR UPPER(id) = UPPER($1) OR UPPER(division_code) = UPPER($1);`,
    [clean]
  );
  return (res.rowCount ?? 0) > 0;
}
