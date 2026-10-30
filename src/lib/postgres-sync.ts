import fs from "node:fs";
import path from "node:path";
import { Pool, type PoolClient } from "pg";

type SyncQueueItem = {
  id?: number;
  action: string;
  entityId: string;
  payload?: Record<string, unknown>;
};

type SyncJob = Record<string, unknown> & { id: string };

type ColumnInfo = {
  name: string;
  dataType: string;
  maxLength: number | null;
};

let pool: Pool | null = null;
const columnCache = new Map<string, ColumnInfo[]>();

function readDatabaseUrl(): string | null {
  if (process.env.VITEST) return null;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const text = fs.readFileSync(envPath, "utf8");
    const quoted = text.match(/^DATABASE_URL="([^"]+)"/m);
    if (quoted?.[1]) return quoted[1];
    const plain = text.match(/^DATABASE_URL=([^\r\n]+)/m);
    return plain?.[1]?.trim() || null;
  } catch {
    return null;
  }
}

function getPool(): Pool | null {
  const connectionString = readDatabaseUrl();
  if (!connectionString) return null;
  if (!pool) {
    const isRemote =
      connectionString.includes("supabase.com") ||
      connectionString.includes("neon.tech") ||
      connectionString.includes("render.com") ||
      connectionString.includes("pooler");

    const cleanConnectionString = connectionString.replace(/[?&]sslmode=[^&]+/g, "");

    pool = new Pool({
      connectionString: cleanConnectionString,
      max: 3,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export function postgresSyncEnabled(): boolean {
  return getPool() !== null;
}

function quoteIdent(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Unexpected column name: ${name}`);
  }
  return `"${name}"`;
}

async function columnsFor(client: PoolClient, table: string): Promise<ColumnInfo[]> {
  const cached = columnCache.get(table);
  if (cached) return cached;
  const result = await client.query<{
    column_name: string;
    data_type: string;
    character_maximum_length: number | null;
  }>(
    `SELECT column_name, data_type, character_maximum_length
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table],
  );
  const columns = result.rows.map((row) => ({
    name: row.column_name,
    dataType: row.data_type,
    maxLength: row.character_maximum_length,
  }));
  columnCache.set(table, columns);
  return columns;
}

function columnSet(columns: ColumnInfo[]): Set<string> {
  return new Set(columns.map((column) => column.name));
}

function put(
  row: Record<string, unknown>,
  columns: Set<string>,
  names: string[],
  value: unknown,
) {
  if (value === undefined) return;
  const name = names.find((candidate) => columns.has(candidate));
  if (name) row[name] = value;
}

function coerce(value: unknown, column: ColumnInfo): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const dataType = column.dataType;
  if (dataType === "json" || dataType === "jsonb") {
    return typeof value === "string" ? value : JSON.stringify(value);
  }
  if (dataType.includes("timestamp") || dataType === "date") {
    if (value instanceof Date) return value;
    if (typeof value === "number") return new Date(value);
    if (typeof value === "string") {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  }
  if (typeof value === "object") {
    const text = JSON.stringify(value);
    if (column.maxLength && text.length > column.maxLength) return undefined;
    return text;
  }
  if (typeof value === "string" && column.maxLength && value.length > column.maxLength) {
    return value.slice(0, column.maxLength);
  }
  return value;
}

async function upsert(
  client: PoolClient,
  table: string,
  primaryKey: string,
  values: Record<string, unknown>,
  skipUpdate: string[] = [],
) {
  const columns = await columnsFor(client, table);
  const known = new Map(columns.map((column) => [column.name, column]));
  if (!known.has(primaryKey)) {
    throw new Error(`${table} has no ${primaryKey} column`);
  }

  const entries = Object.entries(values).flatMap(([name, value]) => {
    const column = known.get(name);
    if (!column) return [];
    const coerced = coerce(value, column);
    if (coerced === undefined) return [];
    return [[name, coerced] as const];
  });
  if (!entries.some(([name]) => name === primaryKey)) {
    throw new Error(`Missing ${primaryKey} for ${table}`);
  }

  const names = entries.map(([name]) => name);
  const params = entries.map(([, value]) => value);
  const updates = names.filter((name) => name !== primaryKey && !skipUpdate.includes(name));
  const updateSql = updates.length
    ? updates.map((name) => `${quoteIdent(name)} = EXCLUDED.${quoteIdent(name)}`).join(", ")
    : `${quoteIdent(primaryKey)} = EXCLUDED.${quoteIdent(primaryKey)}`;

  await client.query(
    `INSERT INTO ${quoteIdent(table)} (${names.map(quoteIdent).join(", ")})
     VALUES (${names.map((_, index) => `$${index + 1}`).join(", ")})
     ON CONFLICT (${quoteIdent(primaryKey)}) DO UPDATE SET ${updateSql}`,
    params,
  );
}

async function jobForeignKey(client: PoolClient, table: string): Promise<string | null> {
  const result = await client.query<{ column_name: string }>(
    `SELECT kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND tc.table_name = $1
       AND ccu.table_name = 'jobs'
     LIMIT 1`,
    [table],
  );
  if (result.rows[0]?.column_name) return result.rows[0].column_name;
  const names = columnSet(await columnsFor(client, table));
  if (names.has("job_id")) return "job_id";
  if (names.has("jobId")) return "jobId";
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object");
}

function collectJobs(pendingJobs: SyncJob[], queueItems: SyncQueueItem[]): SyncJob[] {
  const jobs = new Map<string, SyncJob>();
  for (const job of pendingJobs) {
    if (job?.id) jobs.set(String(job.id), { ...job, id: String(job.id) });
  }
  for (const item of queueItems) {
    if (!item.entityId) continue;
    const current = jobs.get(item.entityId) ?? { id: item.entityId };
    if (item.action === "UPDATE_STATUS") {
      if (typeof item.payload?.status === "string") current.status = item.payload.status;
      if (typeof item.payload?.notes === "string") current.declineReason = item.payload.notes;
    } else if (item.payload) {
      Object.assign(current, item.payload, { id: item.entityId });
    }
    jobs.set(item.entityId, current);
  }
  return [...jobs.values()];
}

function jobRow(job: SyncJob, columns: Set<string>, now: Date): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  put(row, columns, ["id"], job.id);
  put(row, columns, ["customer_name", "customerName"], job.customerName);
  put(row, columns, ["customer_contact", "customerContact"], job.customerContact);
  put(row, columns, ["town"], job.town);
  put(row, columns, ["window"], job.window);
  put(row, columns, ["priority"], job.priority);
  put(row, columns, ["role"], job.role);
  put(row, columns, ["status"], job.status);
  put(row, columns, ["category"], job.category);
  put(row, columns, ["site_name", "siteName"], job.siteName);
  put(row, columns, ["site_address", "siteAddress"], job.siteAddress);
  put(row, columns, ["technician_name", "technicianName"], job.technicianName);
  put(row, columns, ["scheduled_date", "scheduledDate"], job.scheduledDate);
  put(row, columns, ["special_conditions", "specialConditions"], job.specialConditions);
  put(row, columns, ["decline_reason", "declineReason"], job.declineReason);
  put(row, columns, ["instructions"], job.instructions);
  put(row, columns, ["sync_status", "syncStatus"], "synced");
  put(row, columns, ["synced_at", "syncedAt"], now);
  put(row, columns, ["updated_at", "updatedAt"], now);
  put(row, columns, ["created_at", "createdAt"], now);

  const fieldPayload = {
    travel: job.travel ?? null,
    photos: job.photos ?? null,
    completion: job.completion ?? null,
  };
  const hasFieldPayload = job.travel || job.photos || job.completion;
  if (hasFieldPayload) {
    put(row, columns, ["mobile_payload", "field_payload", "payload", "metadata", "extra_data"], fieldPayload);
    put(row, columns, ["travel", "travel_details"], job.travel);
    put(row, columns, ["photos", "photo_evidence"], job.photos);
    put(row, columns, ["completion", "signature"], job.completion);
  }
  return row;
}

async function writeChildren(client: PoolClient, job: SyncJob) {
  const jobKey = await jobForeignKey(client, "parts_used");
  if (jobKey && Array.isArray(job.parts)) {
    const columns = columnSet(await columnsFor(client, "parts_used"));
    for (const part of asRecords(job.parts)) {
      const row: Record<string, unknown> = {};
      put(row, columns, ["id"], part.id);
      put(row, columns, [jobKey], job.id);
      put(row, columns, ["part_code", "partCode"], part.partCode);
      put(row, columns, ["name"], part.name);
      put(row, columns, ["category"], part.category);
      put(row, columns, ["qty_used", "qtyUsed"], part.qtyUsed);
      put(row, columns, ["qty_returned", "qtyReturned"], part.qtyReturned);
      put(row, columns, ["unit_price", "unitPrice"], part.unitPrice);
      put(row, columns, ["serial_no", "serialNo"], part.serialNo);
      put(row, columns, ["part_source", "partSource"], part.partSource);
      put(row, columns, ["supplier_name", "supplierName"], part.supplierName);
      put(row, columns, ["return_reason", "returnReason"], part.returnReason);
      put(row, columns, ["remarks"], part.remarks);
      if (row.id) await upsert(client, "parts_used", "id", row);
    }
  }

  const labourKey = await jobForeignKey(client, "labour_logs");
  if (labourKey && Array.isArray(job.labourLogs)) {
    const columns = columnSet(await columnsFor(client, "labour_logs"));
    for (const log of asRecords(job.labourLogs)) {
      const row: Record<string, unknown> = {};
      put(row, columns, ["id"], log.id);
      put(row, columns, [labourKey], job.id);
      put(row, columns, ["technician_name", "technicianName"], log.technicianName);
      put(row, columns, ["date"], log.date);
      put(row, columns, ["hours"], log.hours);
      put(row, columns, ["rate_type", "rateType"], log.rateType);
      put(row, columns, ["activity_description", "activityDescription"], log.activityDescription);
      if (row.id) await upsert(client, "labour_logs", "id", row);
    }
  }

  const inspectionKey = await jobForeignKey(client, "inspections");
  const inspection = asRecord(job.inspection);
  if (inspectionKey && inspection) {
    const columns = columnSet(await columnsFor(client, "inspections"));
    const row: Record<string, unknown> = {};
    put(row, columns, ["id"], inspection.id);
    put(row, columns, [inspectionKey], job.id);
    put(row, columns, ["inspected_at", "inspectedAt"], inspection.inspectedAt);
    put(row, columns, ["technician_name", "technicianName"], inspection.technicianName);
    put(row, columns, ["overall_status", "overallStatus"], inspection.overallStatus);
    put(row, columns, ["general_notes", "generalNotes"], inspection.generalNotes);
    put(row, columns, ["points", "checklist"], inspection.points);
    if (row.id) await upsert(client, "inspections", "id", row);
  }

  const holdKey = await jobForeignKey(client, "hold_requests");
  if (holdKey && Array.isArray(job.holdRequests)) {
    const columns = columnSet(await columnsFor(client, "hold_requests"));
    for (const hold of asRecords(job.holdRequests)) {
      const row: Record<string, unknown> = {};
      put(row, columns, ["id"], hold.id);
      put(row, columns, [holdKey], job.id);
      put(row, columns, ["reason"], hold.reason);
      put(row, columns, ["notes"], hold.notes);
      put(row, columns, ["estimated_delay_hours", "estimatedDelayHours"], hold.estimatedDelayHours);
      put(row, columns, ["requested_at", "requestedAt"], hold.requestedAt);
      put(row, columns, ["status"], hold.status);
      if (row.id) await upsert(client, "hold_requests", "id", row);
    }
  }
}

async function writeSyncLog(
  client: PoolClient,
  batchId: string,
  role: string,
  deviceId: string,
  itemCount: number,
  now: Date,
) {
  const columns = await columnsFor(client, "sync_logs");
  if (columns.length === 0) return;
  const names = columnSet(columns);
  const row: Record<string, unknown> = {};
  put(row, names, ["id"], batchId);
  put(row, names, ["batch_id", "batchId"], batchId);
  put(row, names, ["role"], role);
  put(row, names, ["device_id", "deviceId"], deviceId);
  put(row, names, ["item_count", "itemCount"], itemCount);
  put(row, names, ["status"], "SUCCESS");
  put(
    row,
    names,
    ["details"],
    `Mobile sync wrote ${itemCount} field updates from the on-device database`,
  );
  put(row, names, ["synced_at", "syncedAt"], now);
  const primaryKey = names.has("id") ? "id" : names.has("batch_id") ? "batch_id" : "batchId";
  if (!row[primaryKey]) return;
  await upsert(client, "sync_logs", primaryKey, row);
}

export async function handleMobileSyncRequest(request: Request): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth-Role, X-Device-Id",
  });

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

  const db = getPool();
  if (!db) {
    return new Response(JSON.stringify({ success: false, message: "Main database is not configured" }), {
      status: 503,
      headers,
    });
  }

  let body: { pendingJobs?: SyncJob[]; queueItems?: SyncQueueItem[]; deviceId?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const role = request.headers.get("x-auth-role") || body.role || "TECHNICIAN";
  const deviceId = request.headers.get("x-device-id") || body.deviceId || "TECH-MOBILE-PWA-01";
  const queueItems = body.queueItems ?? [];
  const jobs = collectJobs(body.pendingJobs ?? [], queueItems);
  const now = new Date();
  const batchId = `SYNC-BATCH-${Date.now().toString(36).toUpperCase()}`;
  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    await client.query("BEGIN");
    const jobColumns = columnSet(await columnsFor(client, "jobs"));
    for (const job of jobs) {
      await upsert(client, "jobs", "id", jobRow(job, jobColumns, now), ["created_at", "createdAt"]);
      await writeChildren(client, job);
    }
    const syncedCount = jobs.length + queueItems.length;
    await writeSyncLog(client, batchId, role, deviceId, syncedCount, now);
    await client.query("COMMIT");

    const syncedJobIds = jobs.map((job) => job.id);
    const processedQueueIds = queueItems
      .map((item) => item.id)
      .filter((id): id is number => typeof id === "number");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${jobs.length} jobs to the main database`,
        batchId,
        serverTimestamp: now.toISOString(),
        syncedCount,
        syncedJobIds,
        processedQueueIds,
      }),
      { status: 200, headers },
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "Could not write to the main database";
    console.error("[Mobile sync] PostgreSQL write failed:", message);
    return new Response(JSON.stringify({ success: false, message }), { status: 500, headers });
  } finally {
    client?.release();
  }
}
