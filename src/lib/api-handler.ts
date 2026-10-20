/**
 * API Route Handler
 *
 * Handles /api/sync, /api/jobs, /api/service-requests, /api/stats.
 * Connects directly to PostgreSQL (via Prisma).
 */

import { prisma, PrismaJobRecord } from "@/lib/prisma";
import { handleLoginRequest } from "./auth-handler";

export interface SyncRequestBody {
  role: string;
  deviceId: string;
  timestamp: string;
  queueItems?: Array<{
    id?: number;
    action: string;
    entityId: string;
    payload: Record<string, unknown>;
    createdAt: number;
  }>;
  pendingJobs?: PrismaJobRecord[];
}

export interface SyncResponseBody {
  success: boolean;
  message: string;
  batchId: string;
  serverTimestamp: string;
  syncedCount: number;
  syncedJobIds: string[];
  processedQueueIds: number[];
}

export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Set CORS and JSON headers
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth-Role, X-Device-Id",
  });

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // 0. /api/auth/login or /api/login — Secure Authentication Endpoint
    if ((path === "/api/auth/login" || path === "/api/login") && method === "POST") {
      return await handleLoginRequest(request);
    }

    // 1. /api/sync — Synchronization endpoint for Dexie.js offline records to PostgreSQL
    if (path === "/api/sync" && method === "POST") {
      const authRole = request.headers.get("x-auth-role") || "TECHNICIAN";
      const deviceId = request.headers.get("x-device-id") || "DEVICE-DEFAULT";

      let body: SyncRequestBody;
      try {
        body = await request.json();
      } catch {
        body = { role: authRole, deviceId, timestamp: new Date().toISOString() };
      }

      const syncedJobIds: string[] = [];
      const processedQueueIds: number[] = [];
      const now = new Date().toISOString();
      const batchId = `SYNC-BATCH-${Date.now().toString(36).toUpperCase()}`;

      // 1. Process queued mutations
      if (body.queueItems && body.queueItems.length > 0) {
        for (const item of body.queueItems) {
          if (item.action === "UPDATE_STATUS") {
            await prisma.job.upsert({
              where: { id: item.entityId },
              create: {
                id: item.entityId,
                status: item.payload?.status || "In Progress",
                updatedAt: now,
                syncStatus: "synced",
              },
              update: {
                status: item.payload?.status,
                updatedAt: now,
                syncStatus: "synced",
              },
            });
            syncedJobIds.push(item.entityId);
          } else if (item.action === "GENERIC_UPDATE" && item.payload) {
            await prisma.job.upsert({
              where: { id: item.entityId },
              create: item.payload,
              update: item.payload,
            });
            syncedJobIds.push(item.entityId);
          }

          if (item.id !== undefined) {
            processedQueueIds.push(item.id);
          }
        }
      }

      // 2. Process pending jobs
      if (body.pendingJobs && body.pendingJobs.length > 0) {
        for (const job of body.pendingJobs) {
          await prisma.job.upsert({
            where: { id: job.id },
            create: {
              ...job,
              syncStatus: "synced",
              syncedAt: now,
            },
            update: {
              ...job,
              syncStatus: "synced",
              syncedAt: now,
            },
          });
          if (!syncedJobIds.includes(job.id)) {
            syncedJobIds.push(job.id);
          }
        }
      }

      // 3. Record Sync Audit Log in PostgreSQL
      const syncedCount = syncedJobIds.length + processedQueueIds.length;
      await prisma.syncLog.create({
        data: {
          batchId,
          role: authRole,
          deviceId: body.deviceId || deviceId,
          itemCount: syncedCount,
          status: "SUCCESS",
          details: `Processed ${syncedJobIds.length} job updates & ${processedQueueIds.length} queue items from Dexie.js offline PWA storage`,
        },
      });

      const responsePayload: SyncResponseBody = {
        success: true,
        message: `Successfully synchronized ${syncedCount} records to PostgreSQL`,
        batchId,
        serverTimestamp: now,
        syncedCount,
        syncedJobIds,
        processedQueueIds,
      };

      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers,
      });
    }

    // 2. /api/jobs — Fetch or create jobs in PostgreSQL
    if (path === "/api/jobs") {
      if (method === "GET") {
        const jobs = await prisma.job.findMany({
          orderBy: { updatedAt: "desc" },
        });
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (via Prisma)",
            count: jobs.length,
            jobs,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const payload = await request.json();
        const created = await prisma.job.create({ data: payload });
        return new Response(JSON.stringify({ success: true, job: created }), {
          status: 201,
          headers,
        });
      }
    }

    // 3. /api/service-requests — Fetch service requests from PostgreSQL
    if (path === "/api/service-requests" && method === "GET") {
      const requests = await prisma.serviceRequest.findMany();
      return new Response(
        JSON.stringify({
          success: true,
          source: "PostgreSQL (via Prisma)",
          count: requests.length,
          requests,
        }),
        { status: 200, headers },
      );
    }

    // 4. /api/stats — Get PostgreSQL database status & sync history
    if (path === "/api/stats" && method === "GET") {
      const jobCount = await prisma.job.count();
      const requestCount = await prisma.serviceRequest.count();
      const syncLogs = await prisma.syncLog.findMany({ take: 10 });

      return new Response(
        JSON.stringify({
          database: "PostgreSQL 16",
          orm: "Prisma Client (PostgreSQL DataSource)",
          datasource: prisma.$info.datasource,
          databaseUrl: prisma.$info.databaseUrl.replace(/:[^:@]+@/, ":****@"),
          status: "CONNECTED",
          counts: {
            jobs: jobCount,
            serviceRequests: requestCount,
            syncLogs: syncLogs.length,
          },
          recentSyncLogs: syncLogs,
        }),
        { status: 200, headers },
      );
    }

    return new Response(JSON.stringify({ error: `Not Found: ${path}` }), {
      status: 404,
      headers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error(`[API Error] ${path}:`, error);
    return new Response(
      JSON.stringify({
        error: message,
        database: "PostgreSQL",
      }),
      { status: 500, headers },
    );
  }
}
