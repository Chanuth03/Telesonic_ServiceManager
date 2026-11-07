import pg from "pg";

const { Pool } = pg;

// Fetch database connection URL from process.env or fallback to configured PostgreSQL
const connectionString =
  (typeof process !== "undefined" && process.env?.["DATABASE_URL"]) ||
  "postgresql://postgres:TeL%40Pb%232026@localhost:5432/telesonic?schema=public";

let pool: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!pool) {
    const isRemote =
      connectionString.includes("supabase.com") ||
      connectionString.includes("neon.tech") ||
      connectionString.includes("render.com") ||
      connectionString.includes("pooler");

    // Clean connection string so node-pg doesn't enforce strict CA verification for self-signed pooler certs
    const cleanConnectionString = connectionString.replace(/[?&]sslmode=[^&]+/g, "");

    pool = new Pool({
      connectionString: cleanConnectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client:", err);
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  const res = await p.query(text, params);
  return res.rows as T[];
}

