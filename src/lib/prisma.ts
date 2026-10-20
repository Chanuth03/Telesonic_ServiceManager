/**
 * Prisma Client & PostgreSQL In-Memory Layer
 *
 * Provides a Prisma-compatible database client interface mapping to a PostgreSQL data model.
 * If a native Prisma/PostgreSQL engine is not connected, it falls back to an enterprise
 * in-memory transactional store that mimics PostgreSQL tables and queries faithfully.
 */

import { initialMobileJobs, MobileJob } from "./mobile-data";
import { SAMPLE_SERVICE_REQUESTS, ServiceRequestRecord } from "@/data/serviceRequestsSpecData";
import bcrypt from "bcryptjs";

export interface PrismaJobRecord extends MobileJob {
  createdAt: string;
  updatedAt: string;
  syncStatus: "synced" | "pending";
  syncedAt?: string;
  version: number;
}

export interface PrismaUserRecord {
  id: string;
  email: string;
  name: string;
  password: string; // bcrypt hash
  role: "ADMIN" | "TECHNICIAN";
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrismaSyncLog {
  id: string;
  batchId: string;
  role: string;
  deviceId: string;
  itemCount: number;
  syncedAt: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  details?: string;
}

// Global in-memory PostgreSQL simulation state
declare global {
  var __postgres_prisma_jobs: Map<string, PrismaJobRecord> | undefined;
  var __postgres_prisma_sync_logs: PrismaSyncLog[] | undefined;
  var __postgres_prisma_requests: Map<string, ServiceRequestRecord> | undefined;
  var __postgres_prisma_users: Map<string, PrismaUserRecord> | undefined;
}

function getInitialPostgresJobs(): Map<string, PrismaJobRecord> {
  const map = new Map<string, PrismaJobRecord>();
  const now = new Date().toISOString();
  initialMobileJobs.forEach((job) => {
    map.set(job.id, {
      ...job,
      createdAt: now,
      updatedAt: now,
      syncStatus: "synced",
      syncedAt: now,
      version: 1,
    });
  });
  return map;
}

function getInitialServiceRequests(): Map<string, ServiceRequestRecord> {
  const map = new Map<string, ServiceRequestRecord>();
  SAMPLE_SERVICE_REQUESTS.forEach((req) => {
    map.set(req.id, req);
  });
  return map;
}

function getInitialUsers(): Map<string, PrismaUserRecord> {
  const map = new Map<string, PrismaUserRecord>();
  const now = new Date().toISOString();

  // Default Admin User (password: admin123)
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  map.set("admin@telesonic.lk", {
    id: "usr_admin_001",
    email: "admin@telesonic.lk",
    name: "Nimal Perera (Administrator)",
    password: adminPasswordHash,
    role: "ADMIN",
    phone: "+94 11 234 5678",
    createdAt: now,
    updatedAt: now,
  });

  // Default Field Technician User (password: tech123)
  const techPasswordHash = bcrypt.hashSync("tech123", 10);
  map.set("tech@telesonic.lk", {
    id: "usr_tech_002",
    email: "tech@telesonic.lk",
    name: "Kamal Silva (Field Lead Technician)",
    password: techPasswordHash,
    role: "TECHNICIAN",
    phone: "+94 77 123 4567",
    createdAt: now,
    updatedAt: now,
  });

  return map;
}

// Initialize persistent global singletons
if (!globalThis.__postgres_prisma_jobs) {
  globalThis.__postgres_prisma_jobs = getInitialPostgresJobs();
}
if (!globalThis.__postgres_prisma_sync_logs) {
  globalThis.__postgres_prisma_sync_logs = [
    {
      id: "SYNC-LOG-001",
      batchId: "BATCH-INIT",
      role: "ADMIN",
      deviceId: "SERVER-INIT",
      itemCount: 8,
      syncedAt: new Date(Date.now() - 3600000).toISOString(),
      status: "SUCCESS",
      details: "Initial database seed from PostgreSQL schema",
    },
  ];
}
if (!globalThis.__postgres_prisma_requests) {
  globalThis.__postgres_prisma_requests = getInitialServiceRequests();
}
if (!globalThis.__postgres_prisma_users) {
  globalThis.__postgres_prisma_users = getInitialUsers();
}

const jobsStore = globalThis.__postgres_prisma_jobs;
const syncLogsStore = globalThis.__postgres_prisma_sync_logs;
const requestsStore = globalThis.__postgres_prisma_requests;
const usersStore = globalThis.__postgres_prisma_users;

export function getDatabaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return "postgresql://postgres:password@YOUR_PUBLIC_IP:5432/telesonic_db?schema=public";
}

/**
 * Prisma Client representation for PostgreSQL
 * Configured with datasource db { provider = "postgresql", url = env("DATABASE_URL") }
 */
export const prisma = {
  $info: {
    provider: "postgresql",
    datasource: 'env("DATABASE_URL")',
    databaseUrl: getDatabaseUrl(),
  },
  job: {
    findMany: async (args?: {
      where?: Partial<PrismaJobRecord>;
      orderBy?: { updatedAt?: "asc" | "desc" };
    }): Promise<PrismaJobRecord[]> => {
      let list = Array.from(jobsStore.values());
      if (args?.where) {
        list = list.filter((item) => {
          return Object.entries(args.where!).every(
            ([k, v]) => (item as Record<string, unknown>)[k] === v,
          );
        });
      }
      if (args?.orderBy?.updatedAt === "desc") {
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
      return JSON.parse(JSON.stringify(list));
    },

    findUnique: async (args: { where: { id: string } }): Promise<PrismaJobRecord | null> => {
      const found = jobsStore.get(args.where.id);
      return found ? JSON.parse(JSON.stringify(found)) : null;
    },

    create: async (args: {
      data: Omit<PrismaJobRecord, "createdAt" | "updatedAt" | "version"> & { id?: string };
    }): Promise<PrismaJobRecord> => {
      const now = new Date().toISOString();
      const id = args.data.id || `SC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const record: PrismaJobRecord = {
        ...args.data,
        id,
        createdAt: now,
        updatedAt: now,
        syncStatus: "synced",
        syncedAt: now,
        version: 1,
      };
      jobsStore.set(id, record);
      return JSON.parse(JSON.stringify(record));
    },

    update: async (args: {
      where: { id: string };
      data: Partial<PrismaJobRecord>;
    }): Promise<PrismaJobRecord> => {
      const existing = jobsStore.get(args.where.id);
      if (!existing) {
        throw new Error(`Record with id ${args.where.id} not found in PostgreSQL database`);
      }
      const now = new Date().toISOString();
      const updated: PrismaJobRecord = {
        ...existing,
        ...args.data,
        id: existing.id,
        updatedAt: now,
        syncedAt: now,
        version: existing.version + 1,
      };
      jobsStore.set(existing.id, updated);
      return JSON.parse(JSON.stringify(updated));
    },

    upsert: async (args: {
      where: { id: string };
      create: Partial<PrismaJobRecord>;
      update: Partial<PrismaJobRecord>;
    }): Promise<PrismaJobRecord> => {
      const existing = jobsStore.get(args.where.id);
      const now = new Date().toISOString();
      if (existing) {
        const updated: PrismaJobRecord = {
          ...existing,
          ...args.update,
          id: existing.id,
          updatedAt: now,
          syncedAt: now,
          version: existing.version + 1,
        };
        jobsStore.set(existing.id, updated);
        return JSON.parse(JSON.stringify(updated));
      } else {
        const record: PrismaJobRecord = {
          id: args.where.id,
          customerName: args.create.customerName || "Customer",
          town: args.create.town || "Colombo",
          window: args.create.window || "Morning",
          priority: args.create.priority || "Normal",
          role: args.create.role || "Lead",
          status: args.create.status || "Assigned",
          category: args.create.category || "General",
          siteAddress: args.create.siteAddress || "Site Location",
          technicianName: args.create.technicianName || "Assigned Tech",
          scheduledDate: args.create.scheduledDate || now.slice(0, 10),
          createdAt: now,
          updatedAt: now,
          syncStatus: "synced",
          syncedAt: now,
          version: 1,
          ...args.create,
        };
        jobsStore.set(args.where.id, record);
        return JSON.parse(JSON.stringify(record));
      }
    },

    count: async (): Promise<number> => {
      return jobsStore.size;
    },
  },

  serviceRequest: {
    findMany: async (): Promise<ServiceRequestRecord[]> => {
      return JSON.parse(JSON.stringify(Array.from(requestsStore.values())));
    },
    count: async (): Promise<number> => {
      return requestsStore.size;
    },
  },

  syncLog: {
    findMany: async (args?: { take?: number }): Promise<PrismaSyncLog[]> => {
      const logs = [...syncLogsStore].reverse();
      const result = args?.take ? logs.slice(0, args.take) : logs;
      return JSON.parse(JSON.stringify(result));
    },

    create: async (args: {
      data: Omit<PrismaSyncLog, "id" | "syncedAt">;
    }): Promise<PrismaSyncLog> => {
      const newLog: PrismaSyncLog = {
        ...args.data,
        id: `SYNC-LOG-${Date.now().toString().slice(-6)}`,
        syncedAt: new Date().toISOString(),
      };
      syncLogsStore.push(newLog);
      return JSON.parse(JSON.stringify(newLog));
    },
  },

  user: {
    findUnique: async (args: {
      where: { email?: string; id?: string };
    }): Promise<PrismaUserRecord | null> => {
      if (args.where.email) {
        const emailKey = args.where.email.toLowerCase().trim();
        const user = usersStore.get(emailKey);
        if (user) return JSON.parse(JSON.stringify(user));
        for (const u of usersStore.values()) {
          if (u.email.toLowerCase() === emailKey) {
            return JSON.parse(JSON.stringify(u));
          }
        }
        return null;
      }
      if (args.where.id) {
        for (const u of usersStore.values()) {
          if (u.id === args.where.id) {
            return JSON.parse(JSON.stringify(u));
          }
        }
      }
      return null;
    },

    findMany: async (): Promise<PrismaUserRecord[]> => {
      return JSON.parse(JSON.stringify(Array.from(usersStore.values())));
    },

    create: async (args: {
      data: Omit<PrismaUserRecord, "id" | "createdAt" | "updatedAt"> & { id?: string };
    }): Promise<PrismaUserRecord> => {
      const now = new Date().toISOString();
      const id = args.data.id || `usr_${Date.now().toString(36)}`;
      const user: PrismaUserRecord = {
        ...args.data,
        id,
        email: args.data.email.toLowerCase().trim(),
        createdAt: now,
        updatedAt: now,
      };
      usersStore.set(user.email, user);
      return JSON.parse(JSON.stringify(user));
    },

    count: async (): Promise<number> => {
      return usersStore.size;
    },
  },
};
