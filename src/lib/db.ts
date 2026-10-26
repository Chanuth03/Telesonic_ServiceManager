import pg from "pg";

const { Pool } = pg;

// Fetch database connection URL from process.env or fallback to configured PostgreSQL
const connectionString =
  (typeof process !== "undefined" && process.env?.["DATABASE_URL"]) ||
  "postgresql://postgres:TeL%40Pb%232026@localhost:5432/telesonic?schema=public";

let pool: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
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

