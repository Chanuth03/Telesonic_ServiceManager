/**
 * Every dataset the app needs offline, declared in one place.
 * The sync engine downloads each dataset when it is missing or older than its TTL,
 * so no section depends on having been opened while online.
 */

import { apiFetch } from "@/lib/api-client";
import {
  applyServerNotifications,
  applyServerVanStock,
  cacheMasterOptionsForUser,
  cacheServerTransactionsLocally,
  syncServerJobsIntoDexie,
} from "@/lib/offline-db";
import type { MobileJob, MobileNotification, StockCountItem } from "@/lib/mobile-data";
import { TRANSACTION_PROCESS_MAP } from "@/lib/transactions-db";

export interface PullContext {
  userId: string;
  organizationId: string;
  headers: Record<string, string>;
  /** Server timestamp of the last successful pull; null means download everything. */
  since: string | null;
}

export interface PullResult {
  count: number;
  /** Server clock at response time; used as the next `since` to avoid device clock skew. */
  serverTime?: string;
}

export interface DatasetDefinition {
  key: string;
  label: string;
  /** Required datasets must be on the device before the app claims it is offline-ready. */
  required: boolean;
  ttlMs: number;
  pull: (ctx: PullContext) => Promise<PullResult>;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
export const TRANSACTION_HISTORY_LIMIT = 150;

async function getJson<T>(path: string, headers: Record<string, string>): Promise<T> {
  const res = await apiFetch(path, { headers }, { networkOnly: true });
  if (!res.ok) throw new Error(`${path} returned HTTP ${res.status}`);
  return (await res.json()) as T;
}

const mobileCore: DatasetDefinition = {
  key: "mobile-core",
  label: "Jobs, notifications and van stock",
  required: true,
  ttlMs: 5 * MINUTE,
  async pull({ headers, since }) {
    const query = new URLSearchParams({ masters: "0" });
    if (since) query.set("since", since);
    const body = await getJson<{
      serverTime?: string;
      jobs?: MobileJob[];
      notifications?: MobileNotification[];
      vanStock?: StockCountItem[] | null;
    }>(`/api/mobile/bootstrap?${query.toString()}`, headers);

    let count = 0;
    if (Array.isArray(body.jobs)) {
      await syncServerJobsIntoDexie(body.jobs);
      count += body.jobs.length;
    }
    if (Array.isArray(body.notifications)) {
      await applyServerNotifications(body.notifications);
      count += body.notifications.length;
    }
    if (await applyServerVanStock(body.vanStock)) {
      count += body.vanStock?.length || 0;
    }
    return { count, ...(body.serverTime ? { serverTime: body.serverTime } : {}) };
  },
};

const masterOptions: DatasetDefinition = {
  key: "master-options",
  label: "Customers, sites, items and lookups",
  required: true,
  ttlMs: 6 * HOUR,
  async pull({ headers, userId, organizationId }) {
    const body = await getJson<{ options?: Record<string, unknown> }>(
      "/api/service-requests/master-options",
      headers,
    );
    if (!body.options || typeof body.options !== "object") return { count: 0 };
    await cacheMasterOptionsForUser(userId, organizationId, body.options);
    return { count: Object.keys(body.options).length };
  },
};

const transactionDatasets: DatasetDefinition[] = Object.values(TRANSACTION_PROCESS_MAP).map(
  (cfg) => ({
    key: `trx:${cfg.code}`,
    label: `${cfg.code} history`,
    required: false,
    ttlMs: 6 * HOUR,
    async pull({ headers, userId, organizationId }) {
      const body = await getJson<{
        records?: Array<Record<string, unknown>>;
        requests?: Array<Record<string, unknown>>;
      }>(cfg.apiPath, headers);
      const list = body.records || body.requests || [];
      if (!Array.isArray(list) || list.length === 0) return { count: 0 };
      const count = await cacheServerTransactionsLocally({
        code: cfg.code,
        storageKey: `telesonic_trx_${cfg.code}`,
        apiPath: cfg.apiPath,
        primaryField: cfg.primaryField,
        records: list.slice(0, TRANSACTION_HISTORY_LIMIT),
        userId,
        organizationId,
      });
      return { count };
    },
  }),
);

export const OFFLINE_DATASETS: DatasetDefinition[] = [
  mobileCore,
  masterOptions,
  ...transactionDatasets,
];
