import pg from "pg";

const { Pool } = pg;

// Fetch database connection URL from process.env or fallback to configured PostgreSQL
const rawConnectionString =
  (typeof process !== "undefined" && process.env?.["DATABASE_URL"]) ||
  "postgresql://postgres:TeL%40Pb%232026@localhost:5432/telesonic?schema=public";

const connectionString = rawConnectionString.replace(/([?&])sslmode=[^&]+&?/g, "$1").replace(/[?&]$/, "");

let pool: pg.Pool | null = null;

function sslFor(value: string): { rejectUnauthorized: false } | undefined {
  const local = /@(localhost|127\.0\.0\.1)(:|\/)/.test(value);
  const requestedSsl = /sslmode=/i.test(rawConnectionString);
  if (local && !requestedSsl) return undefined;
  return { rejectUnauthorized: false };
}

export function getDbPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: sslFor(connectionString),
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

