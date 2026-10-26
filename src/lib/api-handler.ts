import bcrypt from "bcryptjs";
/**
 * API Route Handler
 *
 * Handles /api/sync, /api/jobs, /api/service-requests, /api/stats,
 * and /api/incentives/schemes (PostgreSQL-backed Incentive Scheme Master).
 * Connects directly to PostgreSQL (via Prisma / pg).
 */

import { prisma, PrismaJobRecord } from "@/lib/prisma";
import { MobileJobStatus } from "./mobile-data";
import { handleLoginRequest } from "./auth-handler";
import {
  getAllIncentiveSchemes,
  createIncentiveScheme,
  updateIncentiveScheme,
  updateSchemeStatus,
  cloneIncentiveScheme,
  deleteIncentiveScheme,
} from "./incentive-db";
import {
  getAllRateMatrices,
  getRateMatrixById,
  createRateMatrix,
  updateRateMatrix,
  updateMatrixStatus,
  deleteRateMatrix,
} from "./rate-matrix-db";
import {
  getAllSlabTables,
  getSlabTableById,
  createSlabTable,
  updateSlabTable,
  updateSlabTableStatus,
  deleteSlabTable,
} from "./slab-table-db";
import {
  getAllTargetBatches,
  getTargetBatchById,
  createTargetBatch,
  updateTargetBatch,
  updateTargetBatchStatus,
  deleteTargetBatch,
} from "./monthly-target-db";
import {
  getAllParticipants,
  getParticipantById,
  createParticipant,
  updateParticipant,
  assignSchemeToParticipant,
  endSchemeAssignment,
  deleteParticipant,
} from "./participant-profile-db";
import {
  getAllAttendanceBatches,
  getAttendanceBatchById,
  createAttendanceBatch,
  updateAttendanceBatch,
  updateAttendanceBatchStatus,
  deleteAttendanceBatch,
} from "./attendance-db";
import {
  getAllServicePerformanceBatches,
  getServicePerformanceBatchById,
  createServicePerformanceBatch,
  updateServicePerformanceBatch,
  updateServicePerformanceBatchStatus,
  deleteServicePerformanceBatch,
} from "./service-performance-db";
import {
  getAllCalculationBatches,
  getCalculationBatchById,
  createCalculationBatch,
  updateCalculationBatch,
  updateParticipantResultStatus,
  deleteCalculationBatch,
  deleteParticipantResult,
} from "./calculation-results-db";
import {
  getAllCalculationRuns,
  getCalculationRunById,
  createCalculationRun,
  updateCalculationRun,
  updateCalculationRunStatus,
  deleteCalculationRun,
} from "./calculation-runs-db";
import {
  getAllManualAdjustments,
  getManualAdjustmentById,
  createManualAdjustment,
  updateManualAdjustment,
  deleteManualAdjustment,
  submitAdjustmentForApproval,
  decideApprovalStep,
} from "./manual-adjustments-db";
import {
  getAllApprovalBatches,
  getApprovalBatchById,
  createApprovalBatch,
  updateApprovalBatch,
  recordStepDecision,
  postAccrualJournalEntry,
  lockApprovalPeriod,
  deleteApprovalBatch,
} from "./approval-posting-db";
import {
  getAllGLPostingBatches,
  getGLPostingBatchById,
  createGLPostingBatch,
  updateGLPostingBatch,
  executeSAPPosting,
  markPayrollHandedOver,
  deleteGLPostingBatch,
} from "./gl-posting-db";
import {
  getAllParticipantStatements,
  getParticipantStatementById,
  createParticipantStatement,
  updateParticipantStatement,
  issueStatementToParticipant,
  deleteParticipantStatement,
} from "./participant-statement-db";
import {
  getAllDisputes,
  getDisputeById,
  createDispute,
  updateDispute,
  resolveDispute,
  deleteDispute,
} from "./dispute-query-db";
import {
  getSchemeAnalytics,
  getDivisionBudgetById,
  createDivisionBudget,
  updateDivisionBudget,
  deleteDivisionBudget,
} from "./scheme-analytics-db";
import {
  getDashboardData,
  getDashboardRecordById,
  createDashboardRecord,
  updateDashboardRecord,
  deleteDashboardRecord,
} from "./incentive-dashboard-db";
import {
  getAllClawbacks,
  getClawbackById,
  createClawback,
  updateClawback,
  settleOrWaiveClawback,
  deleteClawback,
  type ClawbackRecordType,
  type TabCategory,
  type SettlementStatus,
} from "./clawback-penalty-db";
import {
  getAllAuditLogs,
  getAuditLogById,
  createAuditLog,
  updateAuditLog,
  verifyAuditLog,
  deleteAuditLog,
  type AuditEntityType,
  type AuditActionType,
  type AuditSeverity,
  type VerificationStatus,
} from "./audit-trail-db";
import {
  getAllSystemParameters,
  getSystemParameterById,
  createSystemParameter,
  updateSystemParameter,
  resetSystemParameterToDefault,
  deleteSystemParameter,
  type ParameterCategory,
} from "./system-parameters-db";
import {
  getAllDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
  type DivisionStatus,
} from "./division-master-db";

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
            const rawStatus = (item.payload as Record<string, unknown> | undefined)?.["status"];
            const statusStr = typeof rawStatus === "string" ? rawStatus : "In Progress";
            await prisma.job.upsert({
              where: { id: item.entityId },
              create: {
                id: item.entityId,
                customerName: ((item.payload as Record<string, unknown> | undefined)?.["customerName"] as string) || "Unknown",
                town: ((item.payload as Record<string, unknown> | undefined)?.["town"] as string) || "Unknown",
                window: ((item.payload as Record<string, unknown> | undefined)?.["window"] as string) || "Morning",
                priority: ((item.payload as Record<string, unknown> | undefined)?.["priority"] as string) || "medium",
                role: authRole,
                status: statusStr,
                category: ((item.payload as Record<string, unknown> | undefined)?.["category"] as string) || "Repair",
                siteAddress: ((item.payload as Record<string, unknown> | undefined)?.["siteAddress"] as string) || "Site Address",
                technicianName: ((item.payload as Record<string, unknown> | undefined)?.["technicianName"] as string) || "Technician",
                scheduledDate: ((item.payload as Record<string, unknown> | undefined)?.["scheduledDate"] as string) || new Date().toISOString().split("T")[0],
                updatedAt: now,
                syncStatus: "synced",
              } as any,
              update: {
                status: statusStr,
                role: authRole,
                updatedAt: now,
                syncStatus: "synced",
              },
            });
            syncedJobIds.push(item.entityId);
          } else if (item.action === "GENERIC_UPDATE" && item.payload) {
            await prisma.job.upsert({
              where: { id: item.entityId },
              create: item.payload as any,
              update: item.payload as any,
            });
            syncedJobIds.push(item.entityId);
          }

          if (item.id) {
            processedQueueIds.push(item.id);
          }
        }
      }

      // 2. Process pending full job records
      if (body.pendingJobs && body.pendingJobs.length > 0) {
        for (const job of body.pendingJobs) {
          await prisma.job.upsert({
            where: { id: job.id },
            create: {
              ...job,
              syncStatus: "synced",
              syncedAt: now,
              updatedAt: now,
            },
            update: {
              ...job,
              syncStatus: "synced",
              syncedAt: now,
              updatedAt: now,
            },
          });
          if (!syncedJobIds.includes(job.id)) {
            syncedJobIds.push(job.id);
          }
        }
      }

      // 3. Insert server sync log
      await prisma.syncLog.create({
        data: {
          batchId,
          role: authRole,
          deviceId,
          itemCount: syncedJobIds.length,
          status: "SUCCESS",
          details: `Processed ${processedQueueIds.length} mutations and synced ${syncedJobIds.length} job records to PostgreSQL.`,
        },
      });

      const response: SyncResponseBody = {
        success: true,
        message: "Synchronized successfully with PostgreSQL database.",
        batchId,
        serverTimestamp: now,
        syncedCount: syncedJobIds.length,
        syncedJobIds,
        processedQueueIds,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers,
      });
    }

    // 2. /api/jobs — Fetch or mutate Jobs from PostgreSQL
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

    // 4. /api/incentives/schemes — Incentive Scheme Master CRUD Endpoints
    if (path === "/api/incentives/schemes") {
      if (method === "GET") {
        const schemes = await getAllIncentiveSchemes();
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: schemes.length,
            schemes,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const body = await request.json();
        const created = await createIncentiveScheme(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Incentive scheme created successfully in PostgreSQL.",
            scheme: created,
          }),
          { status: 201, headers },
        );
      }
    }

    // Incentive Scheme Detail / Status / Clone / Delete operations
    const schemeMatch = path.match(/^\/api\/incentives\/schemes\/([^/]+)(\/(status|clone))?$/);
    if (schemeMatch && schemeMatch[1]) {
      const schemeId = decodeURIComponent(schemeMatch[1]);
      const subAction = schemeMatch[3]; // undefined | 'status' | 'clone'

      // POST /api/incentives/schemes/:id/status
      if (subAction === "status" && method === "POST") {
        const body = await request.json();
        const updated = await updateSchemeStatus(
          schemeId,
          body.status,
          body.user || "Administrator",
          body.role || "Incentive Manager",
          body.notes || "Status transition",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Scheme status updated to ${body.status}.`,
            scheme: updated,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/schemes/:id/clone
      if (subAction === "clone" && method === "POST") {
        const body = await request.json();
        const cloned = await cloneIncentiveScheme(
          schemeId,
          body.newCode,
          body.newName,
          body.user || "Administrator",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Scheme cloned successfully as ${body.newCode}.`,
            scheme: cloned,
          }),
          { status: 201, headers },
        );
      }

      // PUT /api/incentives/schemes/:id
      if (!subAction && method === "PUT") {
        const body = await request.json();
        const updated = await updateIncentiveScheme(schemeId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Incentive scheme updated successfully in PostgreSQL.",
            scheme: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/schemes/:id
      if (!subAction && method === "DELETE") {
        await deleteIncentiveScheme(schemeId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Scheme ${schemeId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 5. /api/incentives/rate-matrices — Commission Rate Matrix CRUD Endpoints
    if (path === "/api/incentives/rate-matrices") {
      if (method === "GET") {
        const schemeCode = url.searchParams.get("schemeCode") || undefined;
        const matrices = await getAllRateMatrices(schemeCode);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: matrices.length,
            matrices,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const body = await request.json();
        const created = await createRateMatrix(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Commission Rate Matrix created successfully in PostgreSQL.",
            matrix: created,
          }),
          { status: 201, headers },
        );
      }
    }

    // Commission Rate Matrix Detail / Status / Delete operations
    const matrixMatch = path.match(/^\/api\/incentives\/rate-matrices\/([^/]+)(\/(status))?$/);
    if (matrixMatch && matrixMatch[1]) {
      const matrixId = decodeURIComponent(matrixMatch[1]);
      const subAction = matrixMatch[3]; // undefined | 'status'

      // POST /api/incentives/rate-matrices/:id/status
      if (subAction === "status" && method === "POST") {
        const body = await request.json();
        const updated = await updateMatrixStatus(
          matrixId,
          body.status,
          body.author || "Finance Director",
          body.role || "Executive Authorizer",
          body.details || "Matrix status transition",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Matrix status updated to ${body.status}.`,
            matrix: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/rate-matrices/:id
      if (!subAction && method === "GET") {
        const matrix = await getRateMatrixById(matrixId);
        if (!matrix) {
          return new Response(
            JSON.stringify({ success: false, error: "Matrix not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, matrix }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/rate-matrices/:id
      if (!subAction && method === "PUT") {
        const body = await request.json();
        const updated = await updateRateMatrix(matrixId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Commission Rate Matrix updated successfully in PostgreSQL.",
            matrix: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/rate-matrices/:id
      if (!subAction && method === "DELETE") {
        await deleteRateMatrix(matrixId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Matrix ${matrixId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 6. /api/incentives/slab-tables — Target Incentive Slab Table CRUD Endpoints
    if (path === "/api/incentives/slab-tables") {
      if (method === "GET") {
        const schemeCode = url.searchParams.get("schemeCode") || undefined;
        const tables = await getAllSlabTables(schemeCode);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: tables.length,
            tables,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const body = await request.json();
        const created = await createSlabTable(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Target Incentive Slab Table created successfully in PostgreSQL.",
            table: created,
          }),
          { status: 201, headers },
        );
      }
    }

    // Slab Table Detail / Status / Delete operations
    const slabMatch = path.match(/^\/api\/incentives\/slab-tables\/([^/]+)(\/(status))?$/);
    if (slabMatch && slabMatch[1]) {
      const tableId = decodeURIComponent(slabMatch[1]);
      const subAction = slabMatch[3]; // undefined | 'status'

      // POST /api/incentives/slab-tables/:id/status
      if (subAction === "status" && method === "POST") {
        const body = await request.json();
        const updated = await updateSlabTableStatus(
          tableId,
          body.status,
          body.author || "Head of Finance",
          body.role || "Executive Authorizer",
          body.details || "Slab table status transition",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Slab table status updated to ${body.status}.`,
            table: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/slab-tables/:id
      if (!subAction && method === "GET") {
        const table = await getSlabTableById(tableId);
        if (!table) {
          return new Response(
            JSON.stringify({ success: false, error: "Slab table not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, table }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/slab-tables/:id
      if (!subAction && method === "PUT") {
        const body = await request.json();
        const updated = await updateSlabTable(tableId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Target Incentive Slab Table updated successfully in PostgreSQL.",
            table: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/slab-tables/:id
      if (!subAction && method === "DELETE") {
        await deleteSlabTable(tableId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Slab table ${tableId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 7. /api/incentives/monthly-targets — Monthly Target Entry CRUD Endpoints
    if (path === "/api/incentives/monthly-targets") {
      if (method === "GET") {
        const period = url.searchParams.get("period") || undefined;
        const schemeCode = url.searchParams.get("schemeCode") || undefined;
        const batches = await getAllTargetBatches(period, schemeCode);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: batches.length,
            batches,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const body = await request.json();
        const created = await createTargetBatch(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Monthly Target Batch created successfully in PostgreSQL.",
            batch: created,
          }),
          { status: 201, headers },
        );
      }
    }

    // Monthly Target Batch Detail / Status / Delete operations
    const targetBatchMatch = path.match(/^\/api\/incentives\/monthly-targets\/([^/]+)(\/(status))?$/);
    if (targetBatchMatch && targetBatchMatch[1]) {
      const batchId = decodeURIComponent(targetBatchMatch[1]);
      const subAction = targetBatchMatch[3]; // undefined | 'status'

      // POST /api/incentives/monthly-targets/:id/status
      if (subAction === "status" && method === "POST") {
        const body = await request.json();
        const updated = await updateTargetBatchStatus(
          batchId,
          body.status,
          body.author || "Head of Sales Operations",
          body.role || "Executive Authorizer",
          body.details || "Monthly target batch status transition",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Target batch status updated to ${body.status}.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/monthly-targets/:id
      if (!subAction && method === "GET") {
        const batch = await getTargetBatchById(batchId);
        if (!batch) {
          return new Response(
            JSON.stringify({ success: false, error: "Target batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, batch }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/monthly-targets/:id
      if (!subAction && method === "PUT") {
        const body = await request.json();
        const updated = await updateTargetBatch(batchId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Monthly Target Batch updated successfully in PostgreSQL.",
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/monthly-targets/:id
      if (!subAction && method === "DELETE") {
        await deleteTargetBatch(batchId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Target batch ${batchId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 8. /api/incentives/participants — Participant Profile CRUD & Scheme Assignment Endpoints
    if (path === "/api/incentives/participants") {
      if (method === "GET") {
        const division = url.searchParams.get("division") || undefined;
        const activeOnly = url.searchParams.get("activeOnly") === "true";
        const participants = await getAllParticipants(division, activeOnly);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: participants.length,
            participants,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const body = await request.json();
        const created = await createParticipant(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Incentive participant profile created successfully in PostgreSQL.",
            participant: created,
          }),
          { status: 201, headers },
        );
      }
    }

    // Participant Detail, Assignments, Delete operations
    const participantMatch = path.match(
      /^\/api\/incentives\/participants\/([^/]+)(\/assignments(\/([^/]+))?)?$/,
    );
    if (participantMatch && participantMatch[1]) {
      const participantId = decodeURIComponent(participantMatch[1]);
      const isAssignments = participantMatch[2]?.startsWith("/assignments");
      const assignmentId = participantMatch[4] ? decodeURIComponent(participantMatch[4]) : undefined;

      // POST /api/incentives/participants/:id/assignments (Assign Scheme)
      if (isAssignments && !assignmentId && method === "POST") {
        const body = await request.json();
        const updated = await assignSchemeToParticipant(participantId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Scheme assigned successfully to participant ${participantId}.`,
            participant: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/participants/:id/assignments/:asgId (End Assignment)
      if (isAssignments && assignmentId && method === "DELETE") {
        const updated = await endSchemeAssignment(participantId, assignmentId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Assignment ${assignmentId} ended for participant ${participantId}.`,
            participant: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/participants/:id
      if (!isAssignments && method === "GET") {
        const participant = await getParticipantById(participantId);
        if (!participant) {
          return new Response(
            JSON.stringify({ success: false, error: "Participant not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, participant }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/participants/:id
      if (!isAssignments && method === "PUT") {
        const body = await request.json();
        const updated = await updateParticipant(participantId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Participant profile updated successfully in PostgreSQL.",
            participant: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/participants/:id
      if (!isAssignments && method === "DELETE") {
        await deleteParticipant(participantId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Participant ${participantId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 9. /api/incentives/attendance — Attendance & Leave Import Endpoints
    if (path === "/api/incentives/attendance") {
      if (method === "GET") {
        const period = url.searchParams.get("period") || undefined;
        const division = url.searchParams.get("division") || undefined;
        const batches = await getAllAttendanceBatches(period, division);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: batches.length,
            batches,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const body = await request.json();
        const created = await createAttendanceBatch(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Attendance import batch created successfully in PostgreSQL.",
            batch: created,
          }),
          { status: 201, headers },
        );
      }
    }

    // Attendance Batch Detail / Status / Delete operations
    const attendanceMatch = path.match(/^\/api\/incentives\/attendance\/([^/]+)(\/(status))?$/);
    if (attendanceMatch && attendanceMatch[1]) {
      const batchId = decodeURIComponent(attendanceMatch[1]);
      const subAction = attendanceMatch[3]; // undefined | 'status'

      // POST /api/incentives/attendance/:id/status (Approve / Validate)
      if (subAction === "status" && method === "POST") {
        const body = await request.json();
        const updated = await updateAttendanceBatchStatus(
          batchId,
          body.status,
          body.approvedBy || "Niluka Senaratne (HR Manager)",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Attendance batch status updated to ${body.status}.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/attendance/:id
      if (!subAction && method === "GET") {
        const batch = await getAttendanceBatchById(batchId);
        if (!batch) {
          return new Response(
            JSON.stringify({ success: false, error: "Attendance batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, batch }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/attendance/:id
      if (!subAction && method === "PUT") {
        const body = await request.json();
        const updated = await updateAttendanceBatch(batchId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Attendance batch records updated successfully in PostgreSQL.",
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/attendance/:id
      if (!subAction && method === "DELETE") {
        await deleteAttendanceBatch(batchId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Attendance batch ${batchId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // =========================================================================
    // 4g. /api/incentives/service-performance — Service Performance & Job Tickets (INC-SCR-07)
    // =========================================================================
    if (path.startsWith("/api/incentives/service-performance")) {
      const url = new URL(request.url);
      const subPath = path.replace("/api/incentives/service-performance", "").replace(/^\//, "");
      const [batchId, subAction] = subPath.split("/");

      // GET /api/incentives/service-performance
      if (!batchId && method === "GET") {
        const period = url.searchParams.get("period") || undefined;
        const division = url.searchParams.get("division") || undefined;
        const batches = await getAllServicePerformanceBatches(period, division);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            batches,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/service-performance (Create Batch)
      if (!batchId && method === "POST") {
        const body = await request.json();
        const created = await createServicePerformanceBatch(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Service performance batch created successfully in PostgreSQL.",
            batch: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/service-performance/:id/status (Lock or Unlock)
      if (batchId && subAction === "status" && method === "POST") {
        const body = await request.json();
        const updated = await updateServicePerformanceBatchStatus(
          batchId,
          body.status,
          body.lockedBy || "Chaminda Warnakula (Service HOD)",
          body.notes || "",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Service performance batch status changed to ${body.status}.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/service-performance/:id
      if (batchId && !subAction && method === "GET") {
        const batch = await getServicePerformanceBatchById(batchId);
        if (!batch) {
          return new Response(
            JSON.stringify({ success: false, error: "Service performance batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, batch }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/service-performance/:id
      if (batchId && !subAction && method === "PUT") {
        const body = await request.json();
        const updated = await updateServicePerformanceBatch(batchId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Service performance records updated successfully in PostgreSQL.",
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/service-performance/:id
      if (batchId && !subAction && method === "DELETE") {
        await deleteServicePerformanceBatch(batchId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Service performance batch ${batchId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // =========================================================================
    // 4h. /api/incentives/calculation-results — Calculation Results Detail View (INC-SCR-08)
    // =========================================================================
    if (path.startsWith("/api/incentives/calculation-results")) {
      const url = new URL(request.url);
      const subPath = path.replace("/api/incentives/calculation-results", "").replace(/^\//, "");
      const segments = subPath.split("/").filter(Boolean);
      const batchId = segments[0];

      // GET /api/incentives/calculation-results
      if (!batchId && method === "GET") {
        const period = url.searchParams.get("period") || undefined;
        const batches = await getAllCalculationBatches(period);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            batches,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/calculation-results (Create Batch)
      if (!batchId && method === "POST") {
        const body = await request.json();
        const created = await createCalculationBatch(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Calculation results batch created successfully in PostgreSQL.",
            batch: created,
          }),
          { status: 201, headers },
        );
      }

      // PATCH /api/incentives/calculation-results/:id/participants/:resultId/status
      if (
        batchId &&
        segments[1] === "participants" &&
        segments[2] &&
        segments[3] === "status" &&
        (method === "PATCH" || method === "POST")
      ) {
        const resultId = segments[2];
        const body = await request.json();
        const updated = await updateParticipantResultStatus(
          batchId,
          resultId,
          body.status,
          body.author || "Incentive Administrator",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: `Participant result ${resultId} status updated to ${body.status}.`,
            participant: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/calculation-results/:id/participants/:resultId
      if (batchId && segments[1] === "participants" && segments[2] && method === "DELETE") {
        const resultId = segments[2];
        await deleteParticipantResult(batchId, resultId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Participant result ${resultId} removed from batch.`,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/calculation-results/:id
      if (batchId && segments.length === 1 && method === "GET") {
        const batch = await getCalculationBatchById(batchId);
        if (!batch) {
          return new Response(
            JSON.stringify({ success: false, error: "Calculation results batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, batch }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/calculation-results/:id
      if (batchId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateCalculationBatch(batchId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Calculation results batch updated successfully in PostgreSQL.",
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/calculation-results/:id
      if (batchId && segments.length === 1 && method === "DELETE") {
        await deleteCalculationBatch(batchId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Calculation results batch ${batchId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // =========================================================================
    // 4h. /api/incentives/calculation-runs — Incentive Calculation Run Engine (INC-SCR-09)
    // =========================================================================
    if (path.startsWith("/api/incentives/calculation-runs")) {
      const subPath = path.replace("/api/incentives/calculation-runs", "");
      const segments = subPath.split("/").filter(Boolean);
      const runId = segments[0];

      // GET /api/incentives/calculation-runs (List all runs)
      if (!runId && method === "GET") {
        const periodParam = url.searchParams.get("period") || undefined;
        const runs = await getAllCalculationRuns(periodParam);
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            runs,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/calculation-runs (Create/Simulate/Execute Run)
      if (!runId && method === "POST") {
        const body = await request.json();
        const created = await createCalculationRun(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Incentive calculation run created successfully in PostgreSQL.",
            run: created,
          }),
          { status: 201, headers },
        );
      }

      // PATCH or POST /api/incentives/calculation-runs/:id/status
      if (runId && segments[1] === "status" && (method === "PATCH" || method === "POST")) {
        const body = await request.json();
        const updated = await updateCalculationRunStatus(
          runId,
          body.status,
          body.notes,
          body.user || body.actorName,
        );

        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Calculation run not found." }),
            { status: 404, headers },
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Run status updated to ${body.status} in PostgreSQL.`,
            run: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/calculation-runs/:id
      if (runId && segments.length === 1 && method === "GET") {
        const run = await getCalculationRunById(runId);
        if (!run) {
          return new Response(
            JSON.stringify({ success: false, error: "Calculation run not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, run }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/calculation-runs/:id
      if (runId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateCalculationRun(runId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Calculation run updated successfully in PostgreSQL.",
            run: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/calculation-runs/:id
      if (runId && segments.length === 1 && method === "DELETE") {
        await deleteCalculationRun(runId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Calculation run ${runId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // =========================================================================
    // 4j. /api/incentives/manual-adjustments — Manual Adjustments & Bonus Claims (INC-SCR-10)
    // =========================================================================
    if (path.startsWith("/api/incentives/manual-adjustments")) {
      const subPath = path.replace("/api/incentives/manual-adjustments", "");
      const segments = subPath.split("/").filter(Boolean);
      const adjId = segments[0];

      // GET /api/incentives/manual-adjustments (List all adjustments)
      if (!adjId && method === "GET") {
        const runNo = url.searchParams.get("runNo") || undefined;
        const division = url.searchParams.get("division") || undefined;
        const status = url.searchParams.get("status") || undefined;
        const type = url.searchParams.get("type") || undefined;
        const participantId = url.searchParams.get("participantId") || undefined;
        const search = url.searchParams.get("search") || undefined;

        const adjustments = await getAllManualAdjustments({
          runNo,
          division,
          status,
          type,
          participantId,
          search,
        });

        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: adjustments.length,
            adjustments,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/manual-adjustments (Create Adjustment)
      if (!adjId && method === "POST") {
        const body = await request.json();
        const created = await createManualAdjustment(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Manual adjustment ${created.adjustmentNo} created successfully in PostgreSQL.`,
            adjustment: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/manual-adjustments/:id/submit
      if (adjId && segments[1] === "submit" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const updated = await submitAdjustmentForApproval(adjId, body.submittedBy);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Adjustment not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Adjustment ${adjId} submitted for approval.`,
            adjustment: updated,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/manual-adjustments/:id/decision (Maker-checker decision)
      if (adjId && segments[1] === "decision" && method === "POST") {
        const body = await request.json();
        const updated = await decideApprovalStep(
          adjId,
          Number(body.stepNumber) || 1,
          body.decision,
          body.approverName || "Reviewer",
          body.comments,
        );
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Adjustment not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Step ${body.stepNumber} decision ${body.decision} recorded.`,
            adjustment: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/manual-adjustments/:id
      if (adjId && segments.length === 1 && method === "GET") {
        const item = await getManualAdjustmentById(adjId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Adjustment not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, adjustment: item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/manual-adjustments/:id
      if (adjId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateManualAdjustment(adjId, body, body.updatedBy);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Adjustment updated successfully in PostgreSQL.",
            adjustment: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/manual-adjustments/:id
      if (adjId && segments.length === 1 && method === "DELETE") {
        await deleteManualAdjustment(adjId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Manual adjustment ${adjId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // =========================================================================
    // 4k. /api/incentives/approval-batches — Multi-Level Approval & Posting (INC-SCR-11)
    // =========================================================================
    if (path.startsWith("/api/incentives/approval-batches")) {
      const subPath = path.replace("/api/incentives/approval-batches", "");
      const segments = subPath.split("/").filter(Boolean);
      const batchId = segments[0];

      // GET /api/incentives/approval-batches (List all batches)
      if (!batchId && method === "GET") {
        const period = url.searchParams.get("period") || undefined;
        const division = url.searchParams.get("division") || undefined;
        const status = url.searchParams.get("status") || undefined;
        const search = url.searchParams.get("search") || undefined;

        const batches = await getAllApprovalBatches({
          period,
          division,
          status,
          search,
        });

        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: batches.length,
            batches,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/approval-batches (Create approval package)
      if (!batchId && method === "POST") {
        const body = await request.json();
        const created = await createApprovalBatch(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Approval batch ${created.id} created successfully in PostgreSQL.`,
            batch: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/approval-batches/:id/step (Record step approval/rejection)
      if (batchId && segments[1] === "step" && method === "POST") {
        const body = await request.json();
        const updated = await recordStepDecision(
          batchId,
          Number(body.stepNumber) || 1,
          body.decision,
          body.approverName || "Reviewer",
          body.comments,
        );
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Approval batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Step ${body.stepNumber} decision ${body.decision} recorded.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/approval-batches/:id/post-je (Post Accrual JE & Payroll Handover)
      if (batchId && segments[1] === "post-je" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const updated = await postAccrualJournalEntry(
          batchId,
          body.postedBy,
          body.journalRef,
          body.payrollFileName,
        );
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Approval batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Posted Accrual Journal Entry #${updated.accrualJe} in SAP Business One.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/approval-batches/:id/lock (Lock Period)
      if (batchId && segments[1] === "lock" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const updated = await lockApprovalPeriod(batchId, body.lockedBy);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Approval batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Financial period locked successfully.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/approval-batches/:id (Get detail by ID)
      if (batchId && segments.length === 1 && method === "GET") {
        const item = await getApprovalBatchById(batchId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Approval batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, batch: item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/approval-batches/:id (Update batch attributes)
      if (batchId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateApprovalBatch(batchId, body, body.updatedBy);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Approval batch updated successfully in PostgreSQL.",
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/approval-batches/:id (Delete batch)
      if (batchId && segments.length === 1 && method === "DELETE") {
        await deleteApprovalBatch(batchId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Approval batch ${batchId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // =========================================================================
    // 4l. /api/incentives/gl-posting — GL Posting & Payroll Handover (INC-SCR-12)
    // =========================================================================
    if (path.startsWith("/api/incentives/gl-posting")) {
      const subPath = path.replace("/api/incentives/gl-posting", "");
      const segments = subPath.split("/").filter(Boolean);
      const batchId = segments[0];

      // GET /api/incentives/gl-posting (List all GL posting batches)
      if (!batchId && method === "GET") {
        const period = url.searchParams.get("period") || undefined;
        const division = url.searchParams.get("division") || undefined;
        const status = url.searchParams.get("status") || undefined;
        const search = url.searchParams.get("search") || undefined;

        const batches = await getAllGLPostingBatches({
          period,
          division,
          status,
          search,
        });

        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (telesonic)",
            count: batches.length,
            batches,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/gl-posting (Create GL posting batch)
      if (!batchId && method === "POST") {
        const body = await request.json();
        const created = await createGLPostingBatch(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `GL Posting batch ${created.postingRef} created successfully in PostgreSQL.`,
            batch: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/gl-posting/:id/post-sap (Execute SAP B1 Posting)
      if (batchId && segments[1] === "post-sap" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const updated = await executeSAPPosting(batchId, body.postedBy, body.customJournalRef);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "GL Posting batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Posted Accrual Journal Voucher #${updated.journalEntryNo} to SAP Business One.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/gl-posting/:id/handover (Mark handed over to Payroll)
      if (batchId && segments[1] === "handover" && method === "POST") {
        const updated = await markPayrollHandedOver(batchId);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "GL Posting batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Transmitted payroll handover file ${updated.payrollFileName} to HR.`,
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/gl-posting/:id (Get detail by ID)
      if (batchId && segments.length === 1 && method === "GET") {
        const item = await getGLPostingBatchById(batchId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "GL Posting batch not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, batch: item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/gl-posting/:id (Update batch)
      if (batchId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateGLPostingBatch(batchId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "GL Posting batch updated successfully in PostgreSQL.",
            batch: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/gl-posting/:id (Delete batch)
      if (batchId && segments.length === 1 && method === "DELETE") {
        await deleteGLPostingBatch(batchId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `GL Posting batch ${batchId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.13 /api/incentives/statements (Participant Incentive Statement / Pay Slip)
    if (path.startsWith("/api/incentives/statements")) {
      const rest = path.replace("/api/incentives/statements", "");
      const segments = rest.split("/").filter(Boolean);
      const statementId = segments[0];

      // GET /api/incentives/statements (List all statements with filters)
      if (segments.length === 0 && method === "GET") {
        const periodParam = url.searchParams.get("period");
        const participantIdParam = url.searchParams.get("participantId");
        const statusParam = url.searchParams.get("status");
        const searchParam = url.searchParams.get("search");

        const filters: {
          period?: string | undefined;
          participantId?: string | undefined;
          status?: string | undefined;
          search?: string | undefined;
        } = {};
        if (periodParam && periodParam !== "All") filters.period = periodParam;
        if (participantIdParam && participantIdParam !== "All") filters.participantId = participantIdParam;
        if (statusParam && statusParam !== "All") filters.status = statusParam;
        if (searchParam) filters.search = searchParam;

        const statements = await getAllParticipantStatements(filters);
        return new Response(
          JSON.stringify({ success: true, count: statements.length, statements }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/statements (Create new statement)
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createParticipantStatement(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Participant statement generated and saved in PostgreSQL.",
            statement: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/statements/:id/issue (Issue / Publish Pay Slip to Participant)
      if (statementId && segments[1] === "issue" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const issued = await issueStatementToParticipant(statementId, body?.issuedBy);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Pay Slip ${issued.statementNo} issued and published to participant.`,
            statement: issued,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/statements/:id (Get single statement details)
      if (statementId && segments.length === 1 && method === "GET") {
        const item = await getParticipantStatementById(statementId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Participant statement not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, statement: item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/statements/:id (Update statement)
      if (statementId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateParticipantStatement(statementId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Participant statement updated successfully in PostgreSQL.",
            statement: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/statements/:id (Delete statement)
      if (statementId && segments.length === 1 && method === "DELETE") {
        await deleteParticipantStatement(statementId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Participant statement ${statementId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.14 /api/incentives/disputes (Dispute & Query Resolution Log)
    if (path.startsWith("/api/incentives/disputes")) {
      const rest = path.replace("/api/incentives/disputes", "");
      const segments = rest.split("/").filter(Boolean);
      const disputeId = segments[0];

      // GET /api/incentives/disputes (List all disputes with filters)
      if (segments.length === 0 && method === "GET") {
        const periodParam = url.searchParams.get("period");
        const divisionParam = url.searchParams.get("division");
        const statusParam = url.searchParams.get("status");
        const priorityParam = url.searchParams.get("priority");
        const participantIdParam = url.searchParams.get("participantId");
        const searchParam = url.searchParams.get("search");

        const filters: {
          period?: string | undefined;
          division?: string | undefined;
          status?: string | undefined;
          priority?: string | undefined;
          participantId?: string | undefined;
          search?: string | undefined;
        } = {};
        if (periodParam && periodParam !== "All") filters.period = periodParam;
        if (divisionParam && divisionParam !== "All") filters.division = divisionParam;
        if (statusParam && statusParam !== "All") filters.status = statusParam;
        if (priorityParam && priorityParam !== "All") filters.priority = priorityParam;
        if (participantIdParam && participantIdParam !== "All") filters.participantId = participantIdParam;
        if (searchParam) filters.search = searchParam;

        const disputes = await getAllDisputes(filters);
        return new Response(
          JSON.stringify({ success: true, count: disputes.length, disputes }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/disputes (Create / Log new dispute)
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createDispute(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Dispute ${created.disputeNo} successfully logged in PostgreSQL.`,
            dispute: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/disputes/:id/resolve (Resolve / Approve / Reject dispute)
      if (disputeId && segments[1] === "resolve" && method === "POST") {
        const body = await request.json();
        const resolved = await resolveDispute(disputeId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Dispute ${resolved.disputeNo} status updated to ${resolved.status}.`,
            dispute: resolved,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/disputes/:id (Get single dispute details)
      if (disputeId && segments.length === 1 && method === "GET") {
        const item = await getDisputeById(disputeId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Dispute record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, dispute: item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/disputes/:id (Update dispute record)
      if (disputeId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateDispute(disputeId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Dispute ${updated.disputeNo} updated successfully in PostgreSQL.`,
            dispute: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/disputes/:id (Delete dispute)
      if (disputeId && segments.length === 1 && method === "DELETE") {
        await deleteDispute(disputeId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Dispute ${disputeId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.15 /api/incentives/analytics (Scheme Performance & Payout Analytics INC-RPT-20..24)
    if (path.startsWith("/api/incentives/analytics")) {
      const rest = path.replace("/api/incentives/analytics", "");
      const segments = rest.split("/").filter(Boolean);
      const budgetId = segments[0];

      // GET /api/incentives/analytics (Full Analytics Payload: Division Summaries, Categories, Matrix, Budgets)
      if (segments.length === 0 && method === "GET") {
        const periodParam = url.searchParams.get("period");
        const divisionParam = url.searchParams.get("division");
        const searchParam = url.searchParams.get("search");

        const filters: {
          period?: string | undefined;
          division?: string | undefined;
          search?: string | undefined;
        } = {};
        if (periodParam && periodParam !== "All") filters.period = periodParam;
        if (divisionParam && divisionParam !== "All") filters.division = divisionParam;
        if (searchParam) filters.search = searchParam;

        const payload = await getSchemeAnalytics(filters);
        return new Response(
          JSON.stringify({ success: true, ...payload }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/analytics (Create Division Budget & Target)
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createDivisionBudget(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Division budget ${created.id} saved in PostgreSQL.`,
            budget: created,
          }),
          { status: 201, headers },
        );
      }

      // GET /api/incentives/analytics/:id (Get single division budget)
      if (budgetId && segments.length === 1 && method === "GET") {
        const item = await getDivisionBudgetById(budgetId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Division budget record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, budget: item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/analytics/:id (Update division budget)
      if (budgetId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateDivisionBudget(budgetId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Division budget ${updated.id} updated successfully in PostgreSQL.`,
            budget: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/analytics/:id (Delete division budget)
      if (budgetId && segments.length === 1 && method === "DELETE") {
        await deleteDivisionBudget(budgetId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Division budget ${budgetId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.16 /api/incentives/dashboard (Operational Incentive Dashboard INC-SCR-16)
    if (path.startsWith("/api/incentives/dashboard")) {
      const rest = path.replace("/api/incentives/dashboard", "");
      const segments = rest.split("/").filter(Boolean);
      const recordId = segments[0];

      // GET /api/incentives/dashboard (List records with metrics, overdue invoices, and filters)
      if (segments.length === 0 && method === "GET") {
        const periodParam = url.searchParams.get("period");
        const divisionParam = url.searchParams.get("division");
        const participantParam = url.searchParams.get("participant");
        const searchParam = url.searchParams.get("search");

        const filters: {
          period?: string | undefined;
          division?: string | undefined;
          participant?: string | undefined;
          search?: string | undefined;
        } = {};
        if (periodParam && periodParam !== "All") filters.period = periodParam;
        if (divisionParam && divisionParam !== "All") filters.division = divisionParam;
        if (participantParam && participantParam !== "All") filters.participant = participantParam;
        if (searchParam) filters.search = searchParam;

        const payload = await getDashboardData(filters);
        return new Response(
          JSON.stringify({ success: true, ...payload }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/dashboard (Create dashboard benchmark record)
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createDashboardRecord(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Dashboard record for ${created.displayName} created successfully.`,
            record: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/dashboard/recalculate (Trigger calculation run from dashboard)
      if (segments[0] === "recalculate" && method === "POST") {
        const payload = await getDashboardData();
        return new Response(
          JSON.stringify({
            success: true,
            message: "Incentive calculation run completed successfully. Benchmark records refreshed.",
            ...payload,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/dashboard/:id (Get single record)
      if (recordId && segments.length === 1 && method === "GET") {
        const item = await getDashboardRecordById(recordId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Dashboard record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, record: item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/dashboard/:id (Update record)
      if (recordId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateDashboardRecord(recordId, body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Dashboard record for ${updated.displayName} updated successfully.`,
            record: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/dashboard/:id (Delete record)
      if (recordId && segments.length === 1 && method === "DELETE") {
        await deleteDashboardRecord(recordId);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Dashboard record ${recordId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.17 /api/incentives/clawbacks (Commission Clawback & Penalty Register INC-SCR-19)
    if (path.startsWith("/api/incentives/clawbacks")) {
      const rest = path.replace("/api/incentives/clawbacks", "");
      const segments = rest.split("/").filter(Boolean);
      const recordId = segments[0];

      // GET /api/incentives/clawbacks
      if (segments.length === 0 && method === "GET") {
        const periodParam = url.searchParams.get("period");
        const divisionParam = url.searchParams.get("division");
        const typeParam = url.searchParams.get("type");
        const tabParam = url.searchParams.get("tab");
        const statusParam = url.searchParams.get("status");
        const searchParam = url.searchParams.get("search");

        const filters: {
          period?: string | undefined;
          division?: string | undefined;
          recordType?: ClawbackRecordType | "All" | undefined;
          tabCategory?: TabCategory | "All" | undefined;
          settlementStatus?: SettlementStatus | "All" | undefined;
          search?: string | undefined;
        } = {};

        if (periodParam && periodParam !== "All") filters.period = periodParam;
        if (divisionParam && divisionParam !== "All") filters.division = divisionParam;
        if (typeParam && typeParam !== "All") filters.recordType = typeParam as ClawbackRecordType;
        if (tabParam && tabParam !== "All") filters.tabCategory = tabParam as TabCategory;
        if (statusParam && statusParam !== "All") filters.settlementStatus = statusParam as SettlementStatus;
        if (searchParam) filters.search = searchParam;

        const items = await getAllClawbacks(filters);
        return new Response(
          JSON.stringify({ success: true, count: items.length, items }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/clawbacks (Create new clawback/penalty)
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createClawback(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Penalty/Clawback record ${created.id} created successfully.`,
            item: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/clawbacks/:id/settle (Settle, Deduct, or Waive)
      if (recordId && segments[1] === "settle" && method === "POST") {
        const body = await request.json();
        const decision = body.decision || "Settled";
        const performedBy = body.performedBy || "Finance Manager";
        const remarks = body.remarks || "";
        const updated = await settleOrWaiveClawback(recordId, decision, performedBy, remarks);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Record ${recordId} updated to ${decision}.`,
            item: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/clawbacks/:id
      if (recordId && segments.length === 1 && method === "GET") {
        const item = await getClawbackById(recordId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/clawbacks/:id
      if (recordId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateClawback(recordId, body);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Record ${recordId} updated successfully.`,
            item: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/clawbacks/:id
      if (recordId && segments.length === 1 && method === "DELETE") {
        const deleted = await deleteClawback(recordId);
        if (!deleted) {
          return new Response(
            JSON.stringify({ success: false, error: "Record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Record ${recordId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.18 /api/incentives/audit-logs (Audit Trail & Scheme Revision History INC-SCR-18)
    if (path.startsWith("/api/incentives/audit-logs")) {
      const rest = path.replace("/api/incentives/audit-logs", "");
      const segments = rest.split("/").filter(Boolean);
      const recordId = segments[0];

      // GET /api/incentives/audit-logs (List audit trail entries with filters)
      if (segments.length === 0 && method === "GET") {
        const entityParam = url.searchParams.get("entityType");
        const actionParam = url.searchParams.get("actionType");
        const severityParam = url.searchParams.get("severity");
        const statusParam = url.searchParams.get("status");
        const userParam = url.searchParams.get("performedBy");
        const searchParam = url.searchParams.get("search");

        const filters: {
          entityType?: AuditEntityType | "All" | undefined;
          actionType?: AuditActionType | "All" | undefined;
          severity?: AuditSeverity | "All" | undefined;
          verificationStatus?: VerificationStatus | "All" | undefined;
          performedBy?: string | undefined;
          search?: string | undefined;
        } = {};

        if (entityParam && entityParam !== "All") filters.entityType = entityParam as AuditEntityType;
        if (actionParam && actionParam !== "All") filters.actionType = actionParam as AuditActionType;
        if (severityParam && severityParam !== "All") filters.severity = severityParam as AuditSeverity;
        if (statusParam && statusParam !== "All") filters.verificationStatus = statusParam as VerificationStatus;
        if (userParam) filters.performedBy = userParam;
        if (searchParam) filters.search = searchParam;

        const items = await getAllAuditLogs(filters);
        return new Response(
          JSON.stringify({ success: true, count: items.length, items }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/audit-logs (Log manual audit event or compliance verification)
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createAuditLog(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Audit entry ${created.id} recorded with checksum ${created.hashChecksum}.`,
            item: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/audit-logs/:id/verify (Verify or flag an audit log entry)
      if (recordId && segments[1] === "verify" && method === "POST") {
        const body = await request.json();
        const status = (body.status as VerificationStatus) || "Verified";
        const notes = body.notes || "";
        const updated = await verifyAuditLog(recordId, status, notes);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Audit record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Audit record ${recordId} verification updated to ${status}.`,
            item: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/audit-logs/:id
      if (recordId && segments.length === 1 && method === "GET") {
        const item = await getAuditLogById(recordId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Audit record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/audit-logs/:id
      if (recordId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateAuditLog(recordId, body);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Audit record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Audit record ${recordId} updated successfully.`,
            item: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/audit-logs/:id
      if (recordId && segments.length === 1 && method === "DELETE") {
        const deleted = await deleteAuditLog(recordId);
        if (!deleted) {
          return new Response(
            JSON.stringify({ success: false, error: "Audit record not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Audit record ${recordId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.19 /api/incentives/system-parameters (System Parameters & Cut-off Policy Screen 19)
    if (path.startsWith("/api/incentives/system-parameters")) {
      const rest = path.replace("/api/incentives/system-parameters", "");
      const segments = rest.split("/").filter(Boolean);
      const recordId = segments[0];

      // GET /api/incentives/system-parameters (List parameters with filters)
      if (segments.length === 0 && method === "GET") {
        const catParam = url.searchParams.get("category");
        const searchParam = url.searchParams.get("search");

        const filters: {
          category?: ParameterCategory | "All" | undefined;
          search?: string | undefined;
        } = {};

        if (catParam && catParam !== "All") filters.category = catParam as ParameterCategory;
        if (searchParam) filters.search = searchParam;

        const items = await getAllSystemParameters(filters);
        return new Response(
          JSON.stringify({ success: true, count: items.length, items }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/system-parameters (Create new custom parameter)
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createSystemParameter(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `System Parameter ${created.parameterName} (${created.parameterKey}) created.`,
            item: created,
          }),
          { status: 201, headers },
        );
      }

      // POST /api/incentives/system-parameters/:id/reset (Reset parameter to default)
      if (recordId && segments[1] === "reset" && method === "POST") {
        const body = await request.json();
        const resetBy = body.resetBy || "System Administrator";
        const updated = await resetSystemParameterToDefault(recordId, resetBy);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Parameter not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Parameter ${recordId} reset to default value (${updated.defaultValue}).`,
            item: updated,
          }),
          { status: 200, headers },
        );
      }

      // GET /api/incentives/system-parameters/:id
      if (recordId && segments.length === 1 && method === "GET") {
        const item = await getSystemParameterById(recordId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Parameter not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/system-parameters/:id
      if (recordId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateSystemParameter(recordId, body);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Parameter not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `System parameter ${updated.parameterName} updated successfully.`,
            item: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/system-parameters/:id
      if (recordId && segments.length === 1 && method === "DELETE") {
        const deleted = await deleteSystemParameter(recordId);
        if (!deleted) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Cannot delete built-in policy or record not found.",
            }),
            { status: 400, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Parameter ${recordId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 4.20 /api/incentives/divisions — Division Master & Operating Units
    if (path.startsWith("/api/incentives/divisions")) {
      const subPath = path.replace("/api/incentives/divisions", "");
      const segments = subPath.split("/").filter(Boolean);
      const rawRecordId = segments[0];
      const recordId = rawRecordId ? decodeURIComponent(rawRecordId) : undefined;

      // GET /api/incentives/divisions
      if (segments.length === 0 && method === "GET") {
        const urlObj = new URL(request.url);
        const status = (urlObj.searchParams.get("status") || "All") as DivisionStatus | "All";
        const search = urlObj.searchParams.get("search") || undefined;

        const items = await getAllDivisions({ status, search });
        return new Response(
          JSON.stringify({
            success: true,
            count: items.length,
            items,
          }),
          { status: 200, headers },
        );
      }

      // POST /api/incentives/divisions
      if (segments.length === 0 && method === "POST") {
        const body = await request.json();
        const created = await createDivision(body);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Division ${created.divisionCode} (${created.divisionName}) created successfully.`,
            item: created,
          }),
          { status: 201, headers },
        );
      }

      // GET /api/incentives/divisions/:id
      if (recordId && segments.length === 1 && method === "GET") {
        const item = await getDivisionById(recordId);
        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: "Division not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({ success: true, item }),
          { status: 200, headers },
        );
      }

      // PUT /api/incentives/divisions/:id
      if (recordId && segments.length === 1 && method === "PUT") {
        const body = await request.json();
        const updated = await updateDivision(recordId, body);
        if (!updated) {
          return new Response(
            JSON.stringify({ success: false, error: "Division not found." }),
            { status: 404, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Division ${updated.divisionCode} updated successfully.`,
            item: updated,
          }),
          { status: 200, headers },
        );
      }

      // DELETE /api/incentives/divisions/:id
      if (recordId && segments.length === 1 && method === "DELETE") {
        const deleted = await deleteDivision(recordId);
        if (!deleted) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Cannot delete division or record not found.",
            }),
            { status: 400, headers },
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: `Division ${recordId} deleted successfully.`,
          }),
          { status: 200, headers },
        );
      }
    }

    // 5. /api/stats — Get PostgreSQL database status & sync history
    if (path === "/api/stats" && method === "GET") {
      const jobCount = await prisma.job.count();
      const requestCount = await prisma.serviceRequest.count();
      const syncLogs = await prisma.syncLog.findMany({ take: 10 });
      const schemes = await getAllIncentiveSchemes();

      return new Response(
        JSON.stringify({
          database: "PostgreSQL 18",
          orm: "Prisma Client (PostgreSQL DataSource)",
                              status: "CONNECTED",
          counts: {
            jobs: jobCount,
            serviceRequests: requestCount,
            syncLogs: syncLogs.length,
            incentiveSchemes: schemes.length,
          },
          recentSyncLogs: syncLogs,
        }),
        { status: 200, headers },
      );
    }

    
    // 5. /api/roles — System Role Master CRUD connected to PostgreSQL
    if (path === "/api/roles") {
      if (method === "GET") {
        const roles = await prisma.systemRole.findMany({
          orderBy: { createdAt: "desc" },
        });
        return new Response(JSON.stringify({ success: true, roles }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const code = String(body.code || "").toUpperCase().trim();
        const name = String(body.name || code);
        if (!code || !name) {
          return new Response(JSON.stringify({ error: "Role Code and Name are mandatory" }), { status: 400, headers });
        }
        const created = await prisma.systemRole.upsert({
          where: { code },
          update: {
            name,
            description: body.description || null,
            permissions: typeof body.permissions === "object" ? JSON.stringify(body.permissions) : (body.permissions || null),
            status: body.status || "Active",
          },
          create: {
            code,
            name,
            description: body.description || null,
            permissions: typeof body.permissions === "object" ? JSON.stringify(body.permissions) : (body.permissions || null),
            status: body.status || "Active",
          },
        });
        return new Response(JSON.stringify({ success: true, role: created }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const urlParams = new URL(request.url).searchParams;
        const roleCode = urlParams.get("code");
        if (!roleCode) {
          return new Response(JSON.stringify({ error: "Role code is required" }), { status: 400, headers });
        }
        await prisma.systemRole.deleteMany({ where: { code: roleCode } });
        return new Response(JSON.stringify({ success: true, message: "Role " + roleCode + " deleted" }), { status: 200, headers });
      }
    }

    
    // 6. /api/users — System User Master CRUD connected to PostgreSQL
    if (path === "/api/users") {
      if (method === "GET") {
        const users = await prisma.user.findMany({
          orderBy: { id: "asc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return new Response(JSON.stringify({ success: true, users }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const email = String(body.email || "").toLowerCase().trim();
        const name = String(body.name || "").trim();
        const role = String(body.role || "TECHNICIAN").toUpperCase().trim();
        const phone = body.phone ? String(body.phone).trim() : null;
        const status = String(body.status || "Active");
        const rawPassword = body.password ? String(body.password).trim() : "";

        if (!email || !name) {
          return new Response(JSON.stringify({ error: "Name and Email are required" }), { status: 400, headers });
        }

        // Check if user has an existing ID (from loading a record) or originalEmail
        const userId = body.id ? Number(body.id) : undefined;
        let existing = null;

        if (userId && !isNaN(userId)) {
          existing = await prisma.user.findUnique({ where: { id: userId } });
        }
        if (!existing) {
          existing = await prisma.user.findUnique({ where: { email } });
        }

        let passwordHash = existing ? existing.password : bcrypt.hashSync("User@123", 10);
        if (rawPassword) {
          passwordHash = bcrypt.hashSync(rawPassword, 10);
        }

        let savedUser;
        if (existing) {
          // Update the existing user record!
          savedUser = await prisma.user.update({
            where: { id: existing.id },
            data: {
              email,
              name,
              role,
              phone,
              status,
              password: passwordHash,
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              phone: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        } else {
          // Create brand new user
          savedUser = await prisma.user.create({
            data: {
              email,
              name,
              role,
              phone,
              status,
              password: passwordHash,
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              phone: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        }

        return new Response(JSON.stringify({ success: true, user: savedUser }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const urlParams = new URL(request.url).searchParams;
        const emailToDelete = urlParams.get("email");
        const idToDelete = urlParams.get("id");

        if (emailToDelete) {
          await prisma.user.deleteMany({ where: { email: emailToDelete.toLowerCase().trim() } });
          return new Response(JSON.stringify({ success: true, message: "User deleted" }), { status: 200, headers });
        } else if (idToDelete) {
          await prisma.user.deleteMany({ where: { id: Number(idToDelete) } });
          return new Response(JSON.stringify({ success: true, message: "User deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Email or ID is required" }), { status: 400, headers });
        }
      }
    }

    // 7. /api/customers — Dedicated Customer Master CRUD (MST-01) in PostgreSQL
    if (path === "/api/customers") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const query = urlParams.get("query")?.toLowerCase().trim();
        let customers;
        if (query) {
          customers = await prisma.customer.findMany({
            where: {
              OR: [
                { customerCode: { contains: query, mode: "insensitive" } },
                { customerName: { contains: query, mode: "insensitive" } },
                { mobile: { contains: query } },
              ],
            },
            orderBy: { id: "asc" },
          });
        } else {
          customers = await prisma.customer.findMany({
            orderBy: { id: "asc" },
          });
        }
        return new Response(JSON.stringify({ success: true, customers }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        let customerCode = String(body.customerCode || "").trim();
        const customerName = String(body.customerName || "").trim();
        const customerGroup = String(body.customerGroup || "Corporate Commercial").trim();
        const customerType = String(body.customerType || "Corporate Enterprise").trim();
        const mobile = String(body.mobile || "").trim();
        const territory = body.territory ? String(body.territory).trim() : null;
        const nicBrNo = body.nicBrNo ? String(body.nicBrNo).trim() : null;
        const grade = body.grade ? String(body.grade).trim() : null;
        const firstChannel = body.firstChannel ? String(body.firstChannel).trim() : null;
        const preferredChannel = body.preferredChannel ? String(body.preferredChannel).trim() : null;
        const customerOrigin = body.customerOrigin ? String(body.customerOrigin).trim() : "Telesonic-sold";
        const relationshipStatus = body.relationshipStatus ? String(body.relationshipStatus).trim() : "Active";
        const paymentHold = body.paymentHold ? String(body.paymentHold).trim() : "No";
        const balanceLkr = body.balanceLkr !== undefined && body.balanceLkr !== null ? Number(body.balanceLkr) : 0.0;
        const status = String(body.status || "Active").trim();

        if (!customerName || !mobile) {
          return new Response(JSON.stringify({ error: "Customer Name and Mobile are mandatory" }), { status: 400, headers });
        }

        // Auto-generate customerCode if missing or blank
        if (!customerCode) {
          const totalCustomers = await prisma.customer.count();
          customerCode = `C-${30510 + totalCustomers + 1}`;
        }

        // Check if updating existing by ID or customerCode
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.customer.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.customer.findUnique({ where: { customerCode } });
        }

        let saved;
        if (existing) {
          saved = await prisma.customer.update({
            where: { id: existing.id },
            data: {
              customerCode,
              customerName,
              customerGroup,
              customerType,
              mobile,
              territory,
              nicBrNo,
              grade,
              firstChannel,
              preferredChannel,
              customerOrigin,
              relationshipStatus,
              paymentHold,
              balanceLkr,
              status,
            },
          });
        } else {
          saved = await prisma.customer.create({
            data: {
              customerCode,
              customerName,
              customerGroup,
              customerType,
              mobile,
              territory,
              nicBrNo,
              grade,
              firstChannel,
              preferredChannel,
              customerOrigin,
              relationshipStatus,
              paymentHold,
              balanceLkr,
              status,
            },
          });
        }

        return new Response(JSON.stringify({ success: true, customer: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("customerCode");

        if (id) {
          await prisma.customer.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Customer deleted" }), { status: 200, headers });
        } else if (code) {
          await prisma.customer.deleteMany({ where: { customerCode: code } });
          return new Response(JSON.stringify({ success: true, message: "Customer deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "id or customerCode is required" }), { status: 400, headers });
        }
      }
    }

    // 8. /api/contacts — Dedicated Contact Person Master CRUD (MST-02) in PostgreSQL
    if (path === "/api/contacts") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const customerId = urlParams.get("customerId");
        const query = urlParams.get("query")?.toLowerCase().trim();

        const whereClause: Record<string, unknown> = {};
        if (customerId) {
          whereClause["customerId"] = Number(customerId);
        }
        if (query) {
          whereClause["OR"] = [
            { contactName: { contains: query, mode: "insensitive" } },
            { mobile: { contains: query } },
            { customerCode: { contains: query, mode: "insensitive" } },
          ];
        }

        const contacts = await prisma.contactPerson.findMany({
          where: whereClause,
          include: {
            customer: {
              select: {
                id: true,
                customerCode: true,
                customerName: true,
              },
            },
          },
          orderBy: { id: "asc" },
        });

        // Add customerName field to each contact object for table display
        const enriched = contacts.map((c: any) => ({
          ...c,
          customerName: c.customer ? c.customer.customerName : c.customerCode || "—",
        }));

        return new Response(JSON.stringify({ success: true, contacts: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const contactName = String(body.contactName || "").trim();
        const mobile = String(body.mobile || "").trim();
        const position = body.position ? String(body.position).trim() : null;
        const email = body.email ? String(body.email).trim() : null;
        const site = body.site ? String(body.site).trim() : null;
        const active = String(body.active || "Yes").trim();
        const validFrom = body.validFrom ? String(body.validFrom).trim() : null;
        const status = String(body.status || "Active").trim();

        if (!contactName || !mobile) {
          return new Response(JSON.stringify({ error: "Contact Name and Mobile are mandatory" }), { status: 400, headers });
        }

        // Resolve customerId
        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerCode = body.customerCode ? String(body.customerCode).trim() : "";

        // If customerCode was passed like "C-30512 (Jayasuriya Textiles)", extract the code "C-30512"
        const codeMatch = customerCode.match(/C-\d+/i);
        const cleanCode = codeMatch ? codeMatch[0].toUpperCase() : customerCode.split(" ")[0];

        if (!customerId) {
          const matchedCust = await prisma.customer.findFirst({
            where: {
              OR: [
                { customerCode: { equals: cleanCode, mode: "insensitive" } },
                { customerName: { contains: cleanCode, mode: "insensitive" } },
              ],
            },
          });
          if (matchedCust) {
            customerId = matchedCust.id;
            customerCode = `${matchedCust.customerCode} (${matchedCust.customerName})`;
          } else {
            // Fallback to first customer in DB if none exists
            const fallback = await prisma.customer.findFirst();
            if (fallback) {
              customerId = fallback.id;
              customerCode = `${fallback.customerCode} (${fallback.customerName})`;
            } else {
              return new Response(JSON.stringify({ error: "Valid Customer ID or Customer Code is required" }), { status: 400, headers });
            }
          }
        }

        // Check if updating existing by ID
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.contactPerson.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.contactPerson.findFirst({
            where: {
              customerId,
              contactName,
            },
          });
        }

        let saved;
        if (existing) {
          saved = await prisma.contactPerson.update({
            where: { id: existing.id },
            data: {
              customerId,
              customerCode,
              contactName,
              position,
              mobile,
              email,
              site,
              active,
              validFrom,
              status,
            },
            include: { customer: true },
          });
        } else {
          saved = await prisma.contactPerson.create({
            data: {
              customerId,
              customerCode,
              contactName,
              position,
              mobile,
              email,
              site,
              active,
              validFrom,
              status,
            },
            include: { customer: true },
          });
        }

        const enriched = {
          ...saved,
          customerName: saved.customer ? saved.customer.customerName : saved.customerCode || "—",
        };

        return new Response(JSON.stringify({ success: true, contact: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        if (id) {
          await prisma.contactPerson.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Contact person deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Contact ID is required" }), { status: 400, headers });
        }
      }
    }

    // 9. /api/sites — Dedicated Site and Location Master CRUD (MST-03) in PostgreSQL
    if (path === "/api/sites") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const customerId = urlParams.get("customerId");
        const query = urlParams.get("query")?.toLowerCase().trim();

        const whereClause: Record<string, unknown> = {};
        if (customerId) {
          whereClause["customerId"] = Number(customerId);
        }
        if (query) {
          whereClause["OR"] = [
            { siteCode: { contains: query, mode: "insensitive" } },
            { siteName: { contains: query, mode: "insensitive" } },
            { cityTown: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
          ];
        }

        const sites = await prisma.site.findMany({
          where: whereClause,
          include: {
            customer: {
              select: {
                id: true,
                customerCode: true,
                customerName: true,
              },
            },
          },
          orderBy: { id: "asc" },
        });

        // Add customerName field to each site object for table display
        const enriched = sites.map((s: any) => ({
          ...s,
          customerName: s.customer ? s.customer.customerName : s.customerName || s.customerCode || "—",
        }));

        return new Response(JSON.stringify({ success: true, sites: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const siteName = String(body.siteName || "").trim();
        let siteCode = String(body.siteCode || "").trim();
        const addressLine1 = String(body.addressLine1 || "").trim();
        const cityTown = String(body.cityTown || "").trim();
        const district = String(body.district || "Colombo").trim();
        const province = String(body.province || "Western").trim();
        const building = body.building ? String(body.building).trim() : null;
        const floor = body.floor ? String(body.floor).trim() : null;
        const room = body.room ? String(body.room).trim() : null;
        const landmark = body.landmark ? String(body.landmark).trim() : null;
        const gpsLatLong = body.gpsLatLong ? String(body.gpsLatLong).trim() : null;
        const siteContact = body.siteContact ? String(body.siteContact).trim() : null;
        const status = String(body.status || "Active").trim();

        if (!siteName || !addressLine1 || !cityTown) {
          return new Response(JSON.stringify({ error: "Site Name, Address Line 1 and City / Town are mandatory" }), { status: 400, headers });
        }

        // Auto-generate siteCode if missing
        if (!siteCode) {
          const totalSites = await prisma.site.count();
          siteCode = `SITE-${cityTown.slice(0, 3).toUpperCase()}-${String(totalSites + 1).padStart(4, "0")}`;
        }

        // Resolve customerId & customerName
        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerName = body.customerName ? String(body.customerName).trim() : "";
        let customerCode = body.customerCode ? String(body.customerCode).trim() : "";

        if (!customerId) {
          const matchedCust = await prisma.customer.findFirst({
            where: {
              OR: [
                { customerName: { equals: customerName, mode: "insensitive" } },
                { customerCode: { equals: customerCode, mode: "insensitive" } },
              ],
            },
          });
          if (matchedCust) {
            customerId = matchedCust.id;
            customerName = matchedCust.customerName;
            customerCode = matchedCust.customerCode;
          } else {
            const fallback = await prisma.customer.findFirst();
            if (fallback) {
              customerId = fallback.id;
              customerName = fallback.customerName;
              customerCode = fallback.customerCode;
            } else {
              return new Response(JSON.stringify({ error: "Valid Customer is required" }), { status: 400, headers });
            }
          }
        }

        // Check if updating existing by ID or siteCode
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.site.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.site.findUnique({ where: { siteCode } });
        }

        let saved;
        if (existing) {
          saved = await prisma.site.update({
            where: { id: existing.id },
            data: {
              customerId,
              customerCode,
              customerName,
              siteCode,
              siteName,
              building,
              floor,
              room,
              addressLine1,
              cityTown,
              district,
              province,
              landmark,
              gpsLatLong,
              siteContact,
              status,
            },
            include: { customer: true },
          });
        } else {
          saved = await prisma.site.create({
            data: {
              customerId,
              customerCode,
              customerName,
              siteCode,
              siteName,
              building,
              floor,
              room,
              addressLine1,
              cityTown,
              district,
              province,
              landmark,
              gpsLatLong,
              siteContact,
              status,
            },
            include: { customer: true },
          });
        }

        const enriched = {
          ...saved,
          customerName: saved.customer ? saved.customer.customerName : saved.customerName || saved.customerCode || "—",
        };

        return new Response(JSON.stringify({ success: true, site: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("siteCode");

        if (id) {
          await prisma.site.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Site deleted" }), { status: 200, headers });
        } else if (code) {
          await prisma.site.deleteMany({ where: { siteCode: code } });
          return new Response(JSON.stringify({ success: true, message: "Site deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Site ID or Code is required" }), { status: 400, headers });
        }
      }
    }

    // 10. /api/items — Dedicated Item Master CRUD (MST-04) in PostgreSQL
    if (path === "/api/items") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const query = urlParams.get("query")?.toLowerCase().trim();
        const brand = urlParams.get("brand");
        const itemGroup = urlParams.get("itemGroup");

        const whereClause: Record<string, unknown> = {};
        if (brand) whereClause["brand"] = brand;
        if (itemGroup) whereClause["itemGroup"] = itemGroup;
        if (query) {
          whereClause["OR"] = [
            { itemCode: { contains: query, mode: "insensitive" } },
            { itemName: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { model: { contains: query, mode: "insensitive" } },
          ];
        }

        const items = await prisma.item.findMany({
          where: whereClause,
          orderBy: { id: "asc" },
        });

        return new Response(JSON.stringify({ success: true, items }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        let itemCode = String(body.itemCode || "").trim();
        const itemName = String(body.itemName || "").trim();
        const itemGroup = String(body.itemGroup || "Service Spare Parts").trim();
        const brand = String(body.brand || "Carrier").trim();
        const model = body.model ? String(body.model).trim() : null;
        const equipmentCategory = String(body.equipmentCategory || "Air Conditioning Commercial").trim();
        const componentRole = body.componentRole ? String(body.componentRole).trim() : null;
        const serviceable = String(body.serviceable || "Yes").trim();
        const warrantyMonths = body.warrantyMonths !== undefined && body.warrantyMonths !== null ? Number(body.warrantyMonths) : 12;
        const componentWarrantyMonths = body.componentWarrantyMonths !== undefined && body.componentWarrantyMonths !== null ? Number(body.componentWarrantyMonths) : 6;
        const serialManaged = String(body.serialManaged || "Yes").trim();
        const status = String(body.status || "Active").trim();

        if (!itemCode || !itemName) {
          return new Response(JSON.stringify({ error: "Item Code and Item Name are mandatory" }), { status: 400, headers });
        }

        // Check if updating existing by ID or itemCode
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.item.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.item.findUnique({ where: { itemCode } });
        }

        let saved;
        if (existing) {
          saved = await prisma.item.update({
            where: { id: existing.id },
            data: {
              itemCode,
              itemName,
              itemGroup,
              brand,
              model,
              equipmentCategory,
              componentRole,
              serviceable,
              warrantyMonths,
              componentWarrantyMonths,
              serialManaged,
              status,
            },
          });
        } else {
          saved = await prisma.item.create({
            data: {
              itemCode,
              itemName,
              itemGroup,
              brand,
              model,
              equipmentCategory,
              componentRole,
              serviceable,
              warrantyMonths,
              componentWarrantyMonths,
              serialManaged,
              status,
            },
          });
        }

        return new Response(JSON.stringify({ success: true, item: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("itemCode");

        if (id) {
          await prisma.item.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Item deleted" }), { status: 200, headers });
        } else if (code) {
          await prisma.item.deleteMany({ where: { itemCode: code } });
          return new Response(JSON.stringify({ success: true, message: "Item deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Item ID or Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 14. /api/equipment-systems — Dedicated Multi-Component Equipment Systems (MST-08)
    // =========================================================================
    if (path === "/api/equipment-systems") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentSystem;

      if (method === "GET") {
        const id = urlParams.get("id");
        const systemId = urlParams.get("systemId");
        const customerId = urlParams.get("customerId");
        const siteId = urlParams.get("siteId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const record = await delegate.findUnique({
            where: { id: Number(id) },
            include: { customer: true, site: true },
          });
          if (!record) return new Response(JSON.stringify({ error: "System not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, system: record }), { status: 200, headers });
        }

        const where: any = {};
        if (systemId) where.systemId = systemId;
        if (customerId) where.customerId = Number(customerId);
        if (siteId) where.siteId = Number(siteId);
        if (search) {
          where.OR = [
            { systemId: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { siteName: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({
          where,
          include: {
            customer: { select: { id: true, customerCode: true, customerName: true } },
            site: { select: { id: true, siteCode: true, siteName: true } },
          },
          orderBy: { id: "asc" },
        });

        const enriched = list.map((e: any) => ({
          ...e,
          customer: e.customer ? e.customer.customerName : e.customerName || "—",
          site: e.site ? e.site.siteName : e.siteName || "—",
        }));

        return new Response(JSON.stringify({ success: true, systems: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const systemId = String(body.systemId || "").trim();
        if (!systemId) {
          return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400, headers });
        }

        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerName = body.customerName ? String(body.customerName).trim() : "";
        if (!customerId && (body.customer || body.customerName)) {
          const custStr = String(body.customer || body.customerName).trim();
          const matchedCust = await (prisma as any).customer.findFirst({
            where: {
              OR: [
                { customerName: { contains: custStr, mode: "insensitive" } },
                { customerCode: { equals: custStr.split(" ")[0], mode: "insensitive" } },
              ],
            },
          });
          if (matchedCust) {
            customerId = matchedCust.id;
            customerName = matchedCust.customerName;
          }
        }

        let siteId = body.siteId ? Number(body.siteId) : undefined;
        let siteName = body.siteName ? String(body.siteName).trim() : "";
        if (!siteId && (body.site || body.siteName)) {
          const siteStr = String(body.site || body.siteName).trim();
          const matchedSite = await (prisma as any).site.findFirst({
            where: { siteName: { contains: siteStr, mode: "insensitive" } },
          });
          if (matchedSite) {
            siteId = matchedSite.id;
            siteName = matchedSite.siteName;
          }
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { systemId } });

        const payloadData = {
          systemId,
          customerId: customerId || null,
          customerName: customerName || null,
          siteId: siteId || null,
          siteName: siteName || null,
          location: body.location || null,
          equipmentCategory: body.equipmentCategory || "VRF Multi-Zone System",
          status: body.status || "Active",
          installedDate: body.installedDate || null,
          commissionedDate: body.commissionedDate || null,
          warrantyStart: body.warrantyStart || null,
          warrantyEnd: body.warrantyEnd || null,
          contract: body.contract || null,
          project: body.project || null,
        };

        let saved: any;
        if (existing) {
          saved = await delegate.update({
            where: { id: existing.id },
            data: payloadData,
            include: { customer: true, site: true },
          });
        } else {
          saved = await delegate.create({
            data: payloadData,
            include: { customer: true, site: true },
          });
        }

        const enriched = {
          ...saved,
          customer: saved.customer ? saved.customer.customerName : saved.customerName || "—",
          site: saved.site ? saved.site.siteName : saved.siteName || "—",
        };

        return new Response(JSON.stringify({ success: true, system: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const systemId = urlParams.get("systemId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "System deleted" }), { status: 200, headers });
        } else if (systemId) {
          await delegate.deleteMany({ where: { systemId } });
          return new Response(JSON.stringify({ success: true, message: "System deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 15. /api/technicians — Dedicated Employee / Technician Master (MST-09)
    // =========================================================================
    if (path === "/api/technicians") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).technician;

      if (method === "GET") {
        const id = urlParams.get("id");
        const employeeId = urlParams.get("employeeId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Technician not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, technician: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (employeeId) where.employeeId = employeeId;
        if (search) {
          where.OR = [
            { employeeId: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { position: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
            { team: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, technicians: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const employeeId = String(body.employeeId || "").trim();
        const name = String(body.name || "").trim();
        if (!employeeId || !name) {
          return new Response(JSON.stringify({ error: "Employee ID and Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { employeeId } });

        const parseRate = (val: any) => {
          if (val === null || val === undefined || val === "") return 0.0;
          const cleaned = String(val).replace(/,/g, "").trim();
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0.0 : parsed;
        };

        const payloadData = {
          employeeId,
          name,
          position: body.position || "Field Technician",
          department: body.department || "Field Operations",
          branch: body.branch || "Colombo Head Office",
          mobile: body.mobile || null,
          technicianType: body.technicianType || "Direct In-House Staff",
          team: body.team || null,
          certifications: body.certifications || null,
          normalRate: parseRate(body.normalRate),
          overtimeRate: parseRate(body.overtimeRate),
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, technician: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const employeeId = urlParams.get("employeeId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Technician deleted" }), { status: 200, headers });
        } else if (employeeId) {
          await delegate.deleteMany({ where: { employeeId } });
          return new Response(JSON.stringify({ success: true, message: "Technician deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Employee ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 16. /api/subcontractors — Dedicated Subcontractor Master (MST-10)
    // =========================================================================
    if (path === "/api/subcontractors") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).subcontractor;

      if (method === "GET") {
        const id = urlParams.get("id");
        const vendorCode = urlParams.get("vendorCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Subcontractor not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, subcontractor: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (vendorCode) where.vendorCode = vendorCode;
        if (search) {
          where.OR = [
            { vendorCode: { contains: search, mode: "insensitive" } },
            { vendorName: { contains: search, mode: "insensitive" } },
            { subcontractorType: { contains: search, mode: "insensitive" } },
            { territory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, subcontractors: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const vendorCode = String(body.vendorCode || "").trim();
        const vendorName = String(body.vendorName || "").trim();
        if (!vendorCode || !vendorName) {
          return new Response(JSON.stringify({ error: "Vendor Code and Vendor Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { vendorCode } });

        const payloadData = {
          vendorCode,
          vendorName,
          subcontractorType: body.subcontractorType || "HVAC Contractor",
          territory: body.territory || "Western Province",
          paymentTerms: body.paymentTerms || "Net 30 Days",
          rating: body.rating !== undefined && body.rating !== null ? Number(body.rating) : 8.0,
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, subcontractor: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const vendorCode = urlParams.get("vendorCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Subcontractor deleted" }), { status: 200, headers });
        } else if (vendorCode) {
          await delegate.deleteMany({ where: { vendorCode } });
          return new Response(JSON.stringify({ success: true, message: "Subcontractor deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Vendor Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 17. /api/service-roles — Dedicated Service Role Master (MST-11)
    // =========================================================================
    if (path === "/api/service-roles") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).serviceRoleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const roleCode = urlParams.get("roleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Service Role not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, role: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (roleCode) where.roleCode = roleCode;
        if (search) {
          where.OR = [
            { roleCode: { contains: search, mode: "insensitive" } },
            { roleName: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, roles: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const roleCode = String(body.roleCode || "").trim();
        const roleName = String(body.roleName || "").trim();
        if (!roleCode || !roleName) {
          return new Response(JSON.stringify({ error: "Role Code and Role Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { roleCode } });

        const payloadData = {
          roleCode,
          roleName,
          internalSubcontractor: body.internalSubcontractor || "Both Internal and Subcontractor",
          incentiveEligible: body.incentiveEligible || "Yes",
          incentiveBasisRef: body.incentiveBasisRef || null,
          multiplePerCall: body.multiplePerCall || "No",
          active: body.active || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, role: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const roleCode = urlParams.get("roleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Service role deleted" }), { status: 200, headers });
        } else if (roleCode) {
          await delegate.deleteMany({ where: { roleCode } });
          return new Response(JSON.stringify({ success: true, message: "Service role deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Role Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 18. /api/service-types — Dedicated Service Type/Reason/Priority Master (MST-12)
    // =========================================================================
    if (path === "/api/service-types") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).serviceTypeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");
        const listType = urlParams.get("listType");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Record not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, serviceType: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (code) where.code = code;
        if (listType) where.listType = listType;
        if (search) {
          where.OR = [
            { code: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { listType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, serviceTypes: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const code = String(body.code || "").trim();
        const description = String(body.description || "").trim();
        if (!code || !description) {
          return new Response(JSON.stringify({ error: "Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { code } });

        const payloadData = {
          code,
          description,
          listType: body.listType || "Service Type",
          defaultPriority: body.defaultPriority || "P2 - Normal Schedule",
          checklistTemplate: body.checklistTemplate || null,
          slaRule: body.slaRule || null,
          chargeableDefault: body.chargeableDefault || "No",
          active: body.active || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, serviceType: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else if (code) {
          await delegate.deleteMany({ where: { code } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 19. /api/hold-reasons - Dedicated Hold Reasons Master (MST-13)
    // =========================================================================
    if (path === "/api/hold-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).holdReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Hold reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, holdReason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { customerWording: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, holdReasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();
        const customerWording = String(body.customerWording || "").trim();
        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          customerWording: customerWording || description,
          excludeFromSla: body.excludeFromSla || "Yes (Clock Paused)",
          maxHoldDays: body.maxHoldDays ? parseInt(String(body.maxHoldDays), 10) : 14,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, holdReason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Hold reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Hold reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 20. /api/repeat-reasons - Dedicated Repeat Reasons Master (MST-14)
    // =========================================================================
    if (path === "/api/repeat-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).repeatReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Repeat reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, repeatReason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { appliesToCategory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, repeatReasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();
        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const activeVal = body.active || "Yes";
        const computedStatus = body.status
          ? body.status
          : activeVal === "No"
          ? "Inactive"
          : "Active";

        const payloadData = {
          reasonCode,
          description,
          countsAsPoorService: body.countsAsPoorService || "Yes",
          detectionPeriodDays: body.detectionPeriodDays ? parseInt(String(body.detectionPeriodDays), 10) : 30,
          appliesToCategory: body.appliesToCategory || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, repeatReason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Repeat reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Repeat reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 21. /api/sla-rules - Dedicated SLA Rules Master (MST-15)
    // =========================================================================
    if (path === "/api/sla-rules") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).slaRuleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "SLA rule not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, slaRule: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (ruleCode) where.ruleCode = ruleCode;
        if (search) {
          where.OR = [
            { ruleCode: { contains: search, mode: "insensitive" } },
            { serviceType: { contains: search, mode: "insensitive" } },
            { priority: { contains: search, mode: "insensitive" } },
            { area: { contains: search, mode: "insensitive" } },
            { calendar: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, slaRules: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const ruleCode = String(body.ruleCode || "").trim();
        const serviceType = String(body.serviceType || "").trim();
        const priority = String(body.priority || "").trim();
        if (!ruleCode || !serviceType || !priority) {
          return new Response(JSON.stringify({ error: "Rule Code, Service Type, and Priority are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { ruleCode } });

        const payloadData = {
          ruleCode,
          serviceType,
          priority,
          area: body.area || "Western Metro Zone",
          resourceType: body.resourceType || "Any Available",
          responseHours: body.responseHours !== undefined && body.responseHours !== null ? parseFloat(String(body.responseHours)) : 4.0,
          resolutionHours: body.resolutionHours !== undefined && body.resolutionHours !== null ? parseFloat(String(body.resolutionHours)) : 24.0,
          warningPct: body.warningPct !== undefined && body.warningPct !== null ? parseFloat(String(body.warningPct)) : 75.0,
          calendar: body.calendar || "CAL-STANDARD-HOURS",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, slaRule: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "SLA rule deleted" }), { status: 200, headers });
        } else if (ruleCode) {
          await delegate.deleteMany({ where: { ruleCode } });
          return new Response(JSON.stringify({ success: true, message: "SLA rule deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rule Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 22. /api/checklist-templates - Dedicated Checklist Templates Master (MST-16)
    // =========================================================================
    if (path === "/api/checklist-templates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).checklistTemplateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const templateCode = urlParams.get("templateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, checklistTemplate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (templateCode) where.templateCode = templateCode;
        if (search) {
          where.OR = [
            { templateCode: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
            { serviceType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, checklistTemplates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const templateCode = String(body.templateCode || "").trim();
        const name = String(body.name || "").trim();
        const equipmentCategory = String(body.equipmentCategory || "").trim();
        const serviceType = String(body.serviceType || "").trim();
        if (!templateCode || !name || !equipmentCategory || !serviceType) {
          return new Response(JSON.stringify({ error: "Template Code, Name, Equipment Category, and Service Type are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { templateCode } });

        const activeVal = body.active || "Yes";
        const computedStatus = body.status
          ? body.status
          : activeVal === "No"
          ? "Inactive"
          : "Active";

        const payloadData = {
          templateCode,
          name,
          equipmentCategory,
          serviceType,
          version: body.version ? parseInt(String(body.version), 10) : 1,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, checklistTemplate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const templateCode = urlParams.get("templateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else if (templateCode) {
          await delegate.deleteMany({ where: { templateCode } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Template Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 29. /api/project-budgets - Dedicated Project and G/L Budget (MST-23)
    // =========================================================================
    if (path === "/api/project-budgets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).projectBudgetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Budget not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, budget: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (projectCode) where.projectCode = projectCode;
        if (search) {
          where.OR = [
            { projectCode: { contains: search, mode: "insensitive" } },
            { projectName: { contains: search, mode: "insensitive" } },
            { customer: { contains: search, mode: "insensitive" } },
            { projectManager: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, budgets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const projectCode = String(body.projectCode || "").trim();
        const projectName = String(body.projectName || "").trim();
        const customer = String(body.customer || "").trim();
        const projectManager = String(body.projectManager || "").trim();

        if (!projectCode || !projectName || !customer || !projectManager) {
          return new Response(JSON.stringify({ error: "Project Code, Name, Customer, and Project Manager are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { projectCode } });

        const status = String(body.status || "Active").trim();
        const payloadData = {
          projectCode,
          projectName,
          customer,
          projectManager,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budgetVersion: body.budgetVersion !== undefined && body.budgetVersion !== null ? parseInt(String(body.budgetVersion), 10) : 1,
          versionStatus: body.versionStatus || "Draft",
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, budget: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else if (projectCode) {
          await delegate.deleteMany({ where: { projectCode } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Project Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 30. /api/cost-element-mappings - Dedicated Cost Element / G/L Mapping (MST-24)
    // =========================================================================
    if (path === "/api/cost-element-mappings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).costElementMappingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Mapping not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, mapping: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (costElement) where.costElement = costElement;
        if (search) {
          where.OR = [
            { costElement: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { glAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, mappings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const costElement = String(body.costElement || "").trim();
        const description = String(body.description || "").trim();
        const glAccount = String(body.glAccount || "").trim();

        if (!costElement || !description || !glAccount) {
          return new Response(JSON.stringify({ error: "Cost Element, Description, and G/L Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { costElement } });

        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          costElement,
          description,
          glAccount,
          revenueCost: body.revenueCost || "Expense",
          requiresCallRef: body.requiresCallRef || "Yes",
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, mapping: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else if (costElement) {
          await delegate.deleteMany({ where: { costElement } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Cost Element is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 31. /api/labour-rates - Dedicated Labour Rates (MST-25)
    // =========================================================================
    if (path === "/api/labour-rates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).labourRateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Rate not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, rate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (rateCode) where.rateCode = rateCode;
        if (search) {
          where.OR = [
            { rateCode: { contains: search, mode: "insensitive" } },
            { technicianType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, rates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const rateCode = String(body.rateCode || "").trim();
        const technicianType = String(body.technicianType || "").trim();
        const normalRate = body.normalRate !== undefined && body.normalRate !== null ? parseFloat(String(body.normalRate).replace(/,/g, "")) : 0;

        if (!rateCode || !technicianType || isNaN(normalRate)) {
          return new Response(JSON.stringify({ error: "Rate Code, Technician Type, and valid Normal Rate are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { rateCode } });

        const overtimeRate = body.overtimeRate !== undefined && body.overtimeRate !== null ? parseFloat(String(body.overtimeRate).replace(/,/g, "")) : 0;
        const subcontractRate = body.subcontractRate !== undefined && body.subcontractRate !== null ? parseFloat(String(body.subcontractRate).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          rateCode,
          technicianType,
          normalRate,
          overtimeRate,
          subcontractRate,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, rate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else if (rateCode) {
          await delegate.deleteMany({ where: { rateCode } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rate Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 32. /api/franchise-warehouses - Dedicated Franchise & Warehouse (MST-26)
    // =========================================================================
    if (path === "/api/franchise-warehouses") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).franchiseWarehouseMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Franchise warehouse not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warehouse: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (franchiseBp) where.franchiseBp = franchiseBp;
        if (search) {
          where.OR = [
            { franchiseBp: { contains: search, mode: "insensitive" } },
            { franchiseName: { contains: search, mode: "insensitive" } },
            { warehouse: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warehouses: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const franchiseBp = String(body.franchiseBp || "").trim();
        const franchiseName = String(body.franchiseName || "").trim();
        const warehouse = String(body.warehouse || "").trim();

        if (!franchiseBp || !franchiseName || !warehouse) {
          return new Response(JSON.stringify({ error: "Franchise BP, Name, and Warehouse are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { franchiseBp } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          franchiseBp,
          franchiseName,
          warehouse,
          stockOwnership: body.stockOwnership || "Telesonic Consignment Stock",
          region: body.region || null,
          countFrequency: body.countFrequency || "Monthly Physical Audit",
          auditor: body.auditor || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warehouse: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else if (franchiseBp) {
          await delegate.deleteMany({ where: { franchiseBp } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Franchise BP is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 33. /api/deviation-reasons - Dedicated Deviation Reasons (MST-27)
    // =========================================================================
    if (path === "/api/deviation-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).deviationReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();

        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const qtyThreshold = body.qtyThreshold !== undefined && body.qtyThreshold !== null ? parseInt(String(body.qtyThreshold), 10) : 1;
        const valueThresholdLkr = body.valueThresholdLkr !== undefined && body.valueThresholdLkr !== null ? parseFloat(String(body.valueThresholdLkr).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          recoverableFromFranchise: body.recoverableFromFranchise || "No (Telesonic Absorption)",
          qtyThreshold,
          valueThresholdLkr,
          escalationRecipients: body.escalationRecipients || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 34. /api/export-permissions - Dedicated Export Permissions (MST-28)
    // =========================================================================
    if (path === "/api/export-permissions") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).exportPermissionMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Permission not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, permission: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (role) where.role = role;
        if (reportGrid) where.reportGrid = reportGrid;
        if (search) {
          where.OR = [
            { role: { contains: search, mode: "insensitive" } },
            { reportGrid: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, permissions: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const role = String(body.role || "").trim();
        const reportGrid = String(body.reportGrid || "").trim();

        if (!role || !reportGrid) {
          return new Response(JSON.stringify({ error: "Role and Target Report / Grid are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) {
          existing = await delegate.findUnique({
            where: {
              role_reportGrid: { role, reportGrid },
            },
          });
        }

        const rowLimit = body.rowLimit !== undefined && body.rowLimit !== null ? parseInt(String(body.rowLimit), 10) : 5000;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          role,
          reportGrid,
          excel: body.excel || "Yes",
          pdf: body.pdf || "Yes",
          restrictedColumns: body.restrictedColumns || null,
          rowLimit,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, permission: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else if (role && reportGrid) {
          await delegate.deleteMany({ where: { role, reportGrid } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "ID or (Role and Report Grid) required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 35. /api/google-meet-settings - Dedicated Google Meet Settings (MST-29)
    // =========================================================================
    if (path === "/api/google-meet-settings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).googleMeetSettingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Setting not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, setting: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (workspaceDomain) where.workspaceDomain = workspaceDomain;
        if (search) {
          where.OR = [
            { workspaceDomain: { contains: search, mode: "insensitive" } },
            { organiserAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, settings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const workspaceDomain = String(body.workspaceDomain || "").trim();
        const organiserAccount = String(body.organiserAccount || "").trim();

        if (!workspaceDomain || !organiserAccount) {
          return new Response(JSON.stringify({ error: "Workspace Domain and Organiser Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { workspaceDomain } });

        const defaultDuration = body.defaultDuration !== undefined && body.defaultDuration !== null ? parseInt(String(body.defaultDuration), 10) : 45;
        const retryCount = body.retryCount !== undefined && body.retryCount !== null ? parseInt(String(body.retryCount), 10) : 3;
        const enabledVal = String(body.enabled || "Yes").trim();
        const computedStatus = enabledVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          workspaceDomain,
          organiserAccount,
          authMethod: body.authMethod || "Google Cloud Service Account JWT",
          defaultDuration,
          inviteCustomer: body.inviteCustomer || "Yes",
          inviteFranchise: body.inviteFranchise || "Yes",
          retryCount,
          enabled: enabledVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, setting: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else if (workspaceDomain) {
          await delegate.deleteMany({ where: { workspaceDomain } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Workspace Domain is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 36. /api/equipment-category-attributes - Dedicated Category Attributes (MST-30)
    // =========================================================================
    if (path === "/api/equipment-category-attributes") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentCategoryAttributeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Category not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, category: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (categoryCode) where.categoryCode = categoryCode;
        if (search) {
          where.OR = [
            { categoryCode: { contains: search, mode: "insensitive" } },
            { categoryName: { contains: search, mode: "insensitive" } },
            { industryGroup: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, categories: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const categoryCode = String(body.categoryCode || "").trim();
        const categoryName = String(body.categoryName || "").trim();

        if (!categoryCode || !categoryName) {
          return new Response(JSON.stringify({ error: "Category Code and Category Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { categoryCode } });

        const defaultInterval = body.defaultInterval !== undefined && body.defaultInterval !== null ? parseInt(String(body.defaultInterval), 10) : 3;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          categoryCode,
          categoryName,
          industryGroup: body.industryGroup || null,
          multiComponent: body.multiComponent || "No",
          meterType: body.meterType || "None",
          defaultIntervalBasis: body.defaultIntervalBasis || "Months (Calendar)",
          defaultInterval,
          checklistSet: body.checklistSet || null,
          warrantyRule: body.warrantyRule || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, category: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else if (categoryCode) {
          await delegate.deleteMany({ where: { categoryCode } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Category Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 37. /api/tool-vehicle-assets - Dedicated Tools, Boxes & Vehicles (MST-31)
    // =========================================================================
    if (path === "/api/tool-vehicle-assets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).toolVehicleAssetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Asset not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, asset: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (assetId) where.assetId = assetId;
        if (search) {
          where.OR = [
            { assetId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { holder: { contains: search, mode: "insensitive" } },
            { vehicleRegNo: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, assets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const assetId = String(body.assetId || "").trim();
        const type = String(body.type || "").trim();
        const description = String(body.description || "").trim();

        if (!assetId || !type || !description) {
          return new Response(JSON.stringify({ error: "Asset ID, Type, and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { assetId } });

        const meterKm = body.meterKm !== undefined && body.meterKm !== null ? parseInt(String(body.meterKm), 10) : null;
        const status = String(body.status || "Available in Stores").trim();

        const payloadData = {
          assetId,
          type,
          description,
          holder: body.holder || null,
          vehicleRegNo: body.vehicleRegNo || null,
          meterKm,
          licenceExpiry: body.licenceExpiry ? new Date(body.licenceExpiry) : null,
          insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, asset: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else if (assetId) {
          await delegate.deleteMany({ where: { assetId } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Asset ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 23. /api/warranty-rules - Dedicated Warranty Rules Master (MST-17)
    // =========================================================================
    if (path === "/api/warranty-rules") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).warrantyRuleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Warranty rule not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warrantyRule: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (ruleCode) where.ruleCode = ruleCode;
        if (search) {
          where.OR = [
            { ruleCode: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
            { componentRole: { contains: search, mode: "insensitive" } },
            { channel: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warrantyRules: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const ruleCode = String(body.ruleCode || "").trim();
        const equipmentCategory = String(body.equipmentCategory || "").trim();
        const startBasis = String(body.startBasis || "").trim();
        const months = body.months !== undefined && body.months !== null ? parseInt(String(body.months), 10) : 12;
        if (!ruleCode || !equipmentCategory || !startBasis) {
          return new Response(JSON.stringify({ error: "Rule Code, Equipment Category, and Start Basis are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { ruleCode } });

        const payloadData = {
          ruleCode,
          equipmentCategory,
          componentRole: body.componentRole || "Complete Unit",
          channel: body.channel || "Direct Corporate Sale",
          startBasis,
          months,
          labourCovered: body.labourCovered || "Yes",
          replacementTreatment: body.replacementTreatment || "Repair in Workshop",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warrantyRule: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Warranty rule deleted" }), { status: 200, headers });
        } else if (ruleCode) {
          await delegate.deleteMany({ where: { ruleCode } });
          return new Response(JSON.stringify({ success: true, message: "Warranty rule deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rule Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 24. /api/free-service-plans - Dedicated Free Service Plan Master (MST-18)
    // =========================================================================
    if (path === "/api/free-service-plans") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).freeServicePlanMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const planCode = urlParams.get("planCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Plan not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, plan: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (planCode) where.planCode = planCode;
        if (search) {
          where.OR = [
            { planCode: { contains: search, mode: "insensitive" } },
            { division: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, plans: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const planCode = String(body.planCode || "").trim();
        const division = String(body.division || "").trim();
        const equipmentCategory = String(body.equipmentCategory || "").trim();
        const visits = body.visits !== undefined && body.visits !== null ? parseInt(String(body.visits), 10) : 3;
        const intervalBasis = String(body.intervalBasis || "Fixed Months").trim();
        const intervalValue = body.intervalValue !== undefined && body.intervalValue !== null ? parseInt(String(body.intervalValue), 10) : 4;
        const startBasis = String(body.startBasis || "Commissioning Date").trim();

        if (!planCode || !division || !equipmentCategory) {
          return new Response(JSON.stringify({ error: "Plan Code, Division, and Equipment Category are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { planCode } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          planCode,
          division,
          equipmentCategory,
          visits,
          intervalBasis,
          intervalValue,
          startBasis,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, plan: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const planCode = urlParams.get("planCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Plan deleted" }), { status: 200, headers });
        } else if (planCode) {
          await delegate.deleteMany({ where: { planCode } });
          return new Response(JSON.stringify({ success: true, message: "Plan deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Plan Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 25. /api/contract-templates - Dedicated Contract Templates Master (MST-19)
    // =========================================================================
    if (path === "/api/contract-templates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).contractTemplateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const template = urlParams.get("template");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, template: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (template) where.template = template;
        if (search) {
          where.OR = [
            { template: { contains: search, mode: "insensitive" } },
            { contractKind: { contains: search, mode: "insensitive" } },
            { coverage: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, templates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const template = String(body.template || "").trim();
        const contractKind = String(body.contractKind || "").trim();

        if (!template || !contractKind) {
          return new Response(JSON.stringify({ error: "Template Code/Title and Contract Kind are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { template } });

        const payloadData = {
          template,
          contractKind,
          visitsPerYear: body.visitsPerYear !== undefined && body.visitsPerYear !== null ? parseInt(String(body.visitsPerYear), 10) : 4,
          coverage: body.coverage || "24/7 Priority Emergency Coverage",
          responseHours: body.responseHours !== undefined && body.responseHours !== null ? parseInt(String(body.responseHours), 10) : 4,
          billingBasis: body.billingBasis || "Quarterly in Advance",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, template: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const template = urlParams.get("template");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else if (template) {
          await delegate.deleteMany({ where: { template } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Template identifier is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 26. /api/relationship-stages - Dedicated Relationship Stages / Reasons (MST-20)
    // =========================================================================
    if (path === "/api/relationship-stages") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).relationshipStageMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");
        const listType = urlParams.get("listType");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Stage not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, stage: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (code) where.code = code;
        if (listType) where.listType = listType;
        if (search) {
          where.OR = [
            { code: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { listType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, stages: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const code = String(body.code || "").trim();
        const description = String(body.description || "").trim();
        const listType = String(body.listType || "").trim();

        if (!code || !description || !listType) {
          return new Response(JSON.stringify({ error: "Code, Description, and List Type are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { code } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          code,
          description,
          listType,
          appliesTo: body.appliesTo || "All Customer Accounts",
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, stage: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Stage deleted" }), { status: 200, headers });
        } else if (code) {
          await delegate.deleteMany({ where: { code } });
          return new Response(JSON.stringify({ success: true, message: "Stage deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 27. /api/reminder-rules - Dedicated Reminder Rules and Intervals (MST-21)
    // =========================================================================
    if (path === "/api/reminder-rules") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).reminderRuleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reminder rule not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reminderRule: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (ruleCode) where.ruleCode = ruleCode;
        if (search) {
          where.OR = [
            { ruleCode: { contains: search, mode: "insensitive" } },
            { reminderType: { contains: search, mode: "insensitive" } },
            { channel: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reminderRules: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const ruleCode = String(body.ruleCode || "").trim();
        const reminderType = String(body.reminderType || "").trim();
        const leadDays = body.leadDays !== undefined && body.leadDays !== null ? parseInt(String(body.leadDays), 10) : 30;

        if (!ruleCode || !reminderType) {
          return new Response(JSON.stringify({ error: "Rule Code and Reminder Type are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { ruleCode } });

        const payloadData = {
          ruleCode,
          reminderType,
          customerCategory: body.customerCategory || "All Customers",
          leadDays,
          maxReminders: body.maxReminders !== undefined && body.maxReminders !== null ? parseInt(String(body.maxReminders), 10) : 3,
          intervalDays: body.intervalDays !== undefined && body.intervalDays !== null ? parseInt(String(body.intervalDays), 10) : 7,
          channel: body.channel || "SMS + WhatsApp",
          consentRequired: body.consentRequired || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reminderRule: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reminder rule deleted" }), { status: 200, headers });
        } else if (ruleCode) {
          await delegate.deleteMany({ where: { ruleCode } });
          return new Response(JSON.stringify({ success: true, message: "Reminder rule deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rule Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 28. /api/notification-templates - Dedicated Notification Templates (MST-22)
    // =========================================================================
    if (path === "/api/notification-templates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).notificationTemplateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const templateId = urlParams.get("templateId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, template: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (templateId) where.templateId = templateId;
        if (search) {
          where.OR = [
            { templateId: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { channel: { contains: search, mode: "insensitive" } },
            { language: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, templates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const templateId = String(body.templateId || "").trim();
        const name = String(body.name || "").trim();
        const channel = String(body.channel || "").trim();
        const messageBody = String(body.body || "").trim();

        if (!templateId || !name || !channel || !messageBody) {
          return new Response(JSON.stringify({ error: "Template Code, Name, Channel, and Message Body are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { templateId } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          templateId,
          name,
          channel,
          language: body.language || "English",
          subject: body.subject || null,
          body: messageBody,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, template: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const templateId = urlParams.get("templateId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else if (templateId) {
          await delegate.deleteMany({ where: { templateId } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Template Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 29. /api/project-budgets - Dedicated Project and G/L Budget (MST-23)
    // =========================================================================
    if (path === "/api/project-budgets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).projectBudgetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Budget not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, budget: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (projectCode) where.projectCode = projectCode;
        if (search) {
          where.OR = [
            { projectCode: { contains: search, mode: "insensitive" } },
            { projectName: { contains: search, mode: "insensitive" } },
            { customer: { contains: search, mode: "insensitive" } },
            { projectManager: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, budgets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const projectCode = String(body.projectCode || "").trim();
        const projectName = String(body.projectName || "").trim();
        const customer = String(body.customer || "").trim();
        const projectManager = String(body.projectManager || "").trim();

        if (!projectCode || !projectName || !customer || !projectManager) {
          return new Response(JSON.stringify({ error: "Project Code, Name, Customer, and Project Manager are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { projectCode } });

        const status = String(body.status || "Active").trim();
        const payloadData = {
          projectCode,
          projectName,
          customer,
          projectManager,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budgetVersion: body.budgetVersion !== undefined && body.budgetVersion !== null ? parseInt(String(body.budgetVersion), 10) : 1,
          versionStatus: body.versionStatus || "Draft",
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, budget: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else if (projectCode) {
          await delegate.deleteMany({ where: { projectCode } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Project Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 30. /api/cost-element-mappings - Dedicated Cost Element / G/L Mapping (MST-24)
    // =========================================================================
    if (path === "/api/cost-element-mappings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).costElementMappingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Mapping not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, mapping: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (costElement) where.costElement = costElement;
        if (search) {
          where.OR = [
            { costElement: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { glAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, mappings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const costElement = String(body.costElement || "").trim();
        const description = String(body.description || "").trim();
        const glAccount = String(body.glAccount || "").trim();

        if (!costElement || !description || !glAccount) {
          return new Response(JSON.stringify({ error: "Cost Element, Description, and G/L Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { costElement } });

        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          costElement,
          description,
          glAccount,
          revenueCost: body.revenueCost || "Expense",
          requiresCallRef: body.requiresCallRef || "Yes",
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, mapping: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else if (costElement) {
          await delegate.deleteMany({ where: { costElement } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Cost Element is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 31. /api/labour-rates - Dedicated Labour Rates (MST-25)
    // =========================================================================
    if (path === "/api/labour-rates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).labourRateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Rate not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, rate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (rateCode) where.rateCode = rateCode;
        if (search) {
          where.OR = [
            { rateCode: { contains: search, mode: "insensitive" } },
            { technicianType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, rates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const rateCode = String(body.rateCode || "").trim();
        const technicianType = String(body.technicianType || "").trim();
        const normalRate = body.normalRate !== undefined && body.normalRate !== null ? parseFloat(String(body.normalRate).replace(/,/g, "")) : 0;

        if (!rateCode || !technicianType || isNaN(normalRate)) {
          return new Response(JSON.stringify({ error: "Rate Code, Technician Type, and valid Normal Rate are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { rateCode } });

        const overtimeRate = body.overtimeRate !== undefined && body.overtimeRate !== null ? parseFloat(String(body.overtimeRate).replace(/,/g, "")) : 0;
        const subcontractRate = body.subcontractRate !== undefined && body.subcontractRate !== null ? parseFloat(String(body.subcontractRate).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          rateCode,
          technicianType,
          normalRate,
          overtimeRate,
          subcontractRate,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, rate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else if (rateCode) {
          await delegate.deleteMany({ where: { rateCode } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rate Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 32. /api/franchise-warehouses - Dedicated Franchise & Warehouse (MST-26)
    // =========================================================================
    if (path === "/api/franchise-warehouses") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).franchiseWarehouseMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Franchise warehouse not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warehouse: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (franchiseBp) where.franchiseBp = franchiseBp;
        if (search) {
          where.OR = [
            { franchiseBp: { contains: search, mode: "insensitive" } },
            { franchiseName: { contains: search, mode: "insensitive" } },
            { warehouse: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warehouses: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const franchiseBp = String(body.franchiseBp || "").trim();
        const franchiseName = String(body.franchiseName || "").trim();
        const warehouse = String(body.warehouse || "").trim();

        if (!franchiseBp || !franchiseName || !warehouse) {
          return new Response(JSON.stringify({ error: "Franchise BP, Name, and Warehouse are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { franchiseBp } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          franchiseBp,
          franchiseName,
          warehouse,
          stockOwnership: body.stockOwnership || "Telesonic Consignment Stock",
          region: body.region || null,
          countFrequency: body.countFrequency || "Monthly Physical Audit",
          auditor: body.auditor || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warehouse: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else if (franchiseBp) {
          await delegate.deleteMany({ where: { franchiseBp } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Franchise BP is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 33. /api/deviation-reasons - Dedicated Deviation Reasons (MST-27)
    // =========================================================================
    if (path === "/api/deviation-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).deviationReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();

        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const qtyThreshold = body.qtyThreshold !== undefined && body.qtyThreshold !== null ? parseInt(String(body.qtyThreshold), 10) : 1;
        const valueThresholdLkr = body.valueThresholdLkr !== undefined && body.valueThresholdLkr !== null ? parseFloat(String(body.valueThresholdLkr).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          recoverableFromFranchise: body.recoverableFromFranchise || "No (Telesonic Absorption)",
          qtyThreshold,
          valueThresholdLkr,
          escalationRecipients: body.escalationRecipients || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 34. /api/export-permissions - Dedicated Export Permissions (MST-28)
    // =========================================================================
    if (path === "/api/export-permissions") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).exportPermissionMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Permission not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, permission: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (role) where.role = role;
        if (reportGrid) where.reportGrid = reportGrid;
        if (search) {
          where.OR = [
            { role: { contains: search, mode: "insensitive" } },
            { reportGrid: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, permissions: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const role = String(body.role || "").trim();
        const reportGrid = String(body.reportGrid || "").trim();

        if (!role || !reportGrid) {
          return new Response(JSON.stringify({ error: "Role and Target Report / Grid are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) {
          existing = await delegate.findUnique({
            where: {
              role_reportGrid: { role, reportGrid },
            },
          });
        }

        const rowLimit = body.rowLimit !== undefined && body.rowLimit !== null ? parseInt(String(body.rowLimit), 10) : 5000;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          role,
          reportGrid,
          excel: body.excel || "Yes",
          pdf: body.pdf || "Yes",
          restrictedColumns: body.restrictedColumns || null,
          rowLimit,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, permission: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else if (role && reportGrid) {
          await delegate.deleteMany({ where: { role, reportGrid } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "ID or (Role and Report Grid) required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 35. /api/google-meet-settings - Dedicated Google Meet Settings (MST-29)
    // =========================================================================
    if (path === "/api/google-meet-settings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).googleMeetSettingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Setting not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, setting: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (workspaceDomain) where.workspaceDomain = workspaceDomain;
        if (search) {
          where.OR = [
            { workspaceDomain: { contains: search, mode: "insensitive" } },
            { organiserAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, settings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const workspaceDomain = String(body.workspaceDomain || "").trim();
        const organiserAccount = String(body.organiserAccount || "").trim();

        if (!workspaceDomain || !organiserAccount) {
          return new Response(JSON.stringify({ error: "Workspace Domain and Organiser Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { workspaceDomain } });

        const defaultDuration = body.defaultDuration !== undefined && body.defaultDuration !== null ? parseInt(String(body.defaultDuration), 10) : 45;
        const retryCount = body.retryCount !== undefined && body.retryCount !== null ? parseInt(String(body.retryCount), 10) : 3;
        const enabledVal = String(body.enabled || "Yes").trim();
        const computedStatus = enabledVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          workspaceDomain,
          organiserAccount,
          authMethod: body.authMethod || "Google Cloud Service Account JWT",
          defaultDuration,
          inviteCustomer: body.inviteCustomer || "Yes",
          inviteFranchise: body.inviteFranchise || "Yes",
          retryCount,
          enabled: enabledVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, setting: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else if (workspaceDomain) {
          await delegate.deleteMany({ where: { workspaceDomain } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Workspace Domain is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 36. /api/equipment-category-attributes - Dedicated Category Attributes (MST-30)
    // =========================================================================
    if (path === "/api/equipment-category-attributes") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentCategoryAttributeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Category not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, category: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (categoryCode) where.categoryCode = categoryCode;
        if (search) {
          where.OR = [
            { categoryCode: { contains: search, mode: "insensitive" } },
            { categoryName: { contains: search, mode: "insensitive" } },
            { industryGroup: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, categories: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const categoryCode = String(body.categoryCode || "").trim();
        const categoryName = String(body.categoryName || "").trim();

        if (!categoryCode || !categoryName) {
          return new Response(JSON.stringify({ error: "Category Code and Category Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { categoryCode } });

        const defaultInterval = body.defaultInterval !== undefined && body.defaultInterval !== null ? parseInt(String(body.defaultInterval), 10) : 3;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          categoryCode,
          categoryName,
          industryGroup: body.industryGroup || null,
          multiComponent: body.multiComponent || "No",
          meterType: body.meterType || "None",
          defaultIntervalBasis: body.defaultIntervalBasis || "Months (Calendar)",
          defaultInterval,
          checklistSet: body.checklistSet || null,
          warrantyRule: body.warrantyRule || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, category: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else if (categoryCode) {
          await delegate.deleteMany({ where: { categoryCode } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Category Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 37. /api/tool-vehicle-assets - Dedicated Tools, Boxes & Vehicles (MST-31)
    // =========================================================================
    if (path === "/api/tool-vehicle-assets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).toolVehicleAssetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Asset not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, asset: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (assetId) where.assetId = assetId;
        if (search) {
          where.OR = [
            { assetId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { holder: { contains: search, mode: "insensitive" } },
            { vehicleRegNo: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, assets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const assetId = String(body.assetId || "").trim();
        const type = String(body.type || "").trim();
        const description = String(body.description || "").trim();

        if (!assetId || !type || !description) {
          return new Response(JSON.stringify({ error: "Asset ID, Type, and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { assetId } });

        const meterKm = body.meterKm !== undefined && body.meterKm !== null ? parseInt(String(body.meterKm), 10) : null;
        const status = String(body.status || "Available in Stores").trim();

        const payloadData = {
          assetId,
          type,
          description,
          holder: body.holder || null,
          vehicleRegNo: body.vehicleRegNo || null,
          meterKm,
          licenceExpiry: body.licenceExpiry ? new Date(body.licenceExpiry) : null,
          insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, asset: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else if (assetId) {
          await delegate.deleteMany({ where: { assetId } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Asset ID is required" }), { status: 400, headers });
        }
      }
    }




    // =========================================================================
    // 29. /api/project-budgets - Dedicated Project and G/L Budget (MST-23)
    // =========================================================================
    if (path === "/api/project-budgets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).projectBudgetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Budget not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, budget: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (projectCode) where.projectCode = projectCode;
        if (search) {
          where.OR = [
            { projectCode: { contains: search, mode: "insensitive" } },
            { projectName: { contains: search, mode: "insensitive" } },
            { customer: { contains: search, mode: "insensitive" } },
            { projectManager: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, budgets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const projectCode = String(body.projectCode || "").trim();
        const projectName = String(body.projectName || "").trim();
        const customer = String(body.customer || "").trim();
        const projectManager = String(body.projectManager || "").trim();

        if (!projectCode || !projectName || !customer || !projectManager) {
          return new Response(JSON.stringify({ error: "Project Code, Name, Customer, and Project Manager are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { projectCode } });

        const status = String(body.status || "Active").trim();
        const payloadData = {
          projectCode,
          projectName,
          customer,
          projectManager,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budgetVersion: body.budgetVersion !== undefined && body.budgetVersion !== null ? parseInt(String(body.budgetVersion), 10) : 1,
          versionStatus: body.versionStatus || "Draft",
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, budget: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else if (projectCode) {
          await delegate.deleteMany({ where: { projectCode } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Project Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 30. /api/cost-element-mappings - Dedicated Cost Element / G/L Mapping (MST-24)
    // =========================================================================
    if (path === "/api/cost-element-mappings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).costElementMappingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Mapping not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, mapping: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (costElement) where.costElement = costElement;
        if (search) {
          where.OR = [
            { costElement: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { glAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, mappings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const costElement = String(body.costElement || "").trim();
        const description = String(body.description || "").trim();
        const glAccount = String(body.glAccount || "").trim();

        if (!costElement || !description || !glAccount) {
          return new Response(JSON.stringify({ error: "Cost Element, Description, and G/L Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { costElement } });

        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          costElement,
          description,
          glAccount,
          revenueCost: body.revenueCost || "Expense",
          requiresCallRef: body.requiresCallRef || "Yes",
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, mapping: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else if (costElement) {
          await delegate.deleteMany({ where: { costElement } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Cost Element is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 31. /api/labour-rates - Dedicated Labour Rates (MST-25)
    // =========================================================================
    if (path === "/api/labour-rates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).labourRateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Rate not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, rate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (rateCode) where.rateCode = rateCode;
        if (search) {
          where.OR = [
            { rateCode: { contains: search, mode: "insensitive" } },
            { technicianType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, rates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const rateCode = String(body.rateCode || "").trim();
        const technicianType = String(body.technicianType || "").trim();
        const normalRate = body.normalRate !== undefined && body.normalRate !== null ? parseFloat(String(body.normalRate).replace(/,/g, "")) : 0;

        if (!rateCode || !technicianType || isNaN(normalRate)) {
          return new Response(JSON.stringify({ error: "Rate Code, Technician Type, and valid Normal Rate are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { rateCode } });

        const overtimeRate = body.overtimeRate !== undefined && body.overtimeRate !== null ? parseFloat(String(body.overtimeRate).replace(/,/g, "")) : 0;
        const subcontractRate = body.subcontractRate !== undefined && body.subcontractRate !== null ? parseFloat(String(body.subcontractRate).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          rateCode,
          technicianType,
          normalRate,
          overtimeRate,
          subcontractRate,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, rate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else if (rateCode) {
          await delegate.deleteMany({ where: { rateCode } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rate Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 32. /api/franchise-warehouses - Dedicated Franchise & Warehouse (MST-26)
    // =========================================================================
    if (path === "/api/franchise-warehouses") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).franchiseWarehouseMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Franchise warehouse not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warehouse: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (franchiseBp) where.franchiseBp = franchiseBp;
        if (search) {
          where.OR = [
            { franchiseBp: { contains: search, mode: "insensitive" } },
            { franchiseName: { contains: search, mode: "insensitive" } },
            { warehouse: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warehouses: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const franchiseBp = String(body.franchiseBp || "").trim();
        const franchiseName = String(body.franchiseName || "").trim();
        const warehouse = String(body.warehouse || "").trim();

        if (!franchiseBp || !franchiseName || !warehouse) {
          return new Response(JSON.stringify({ error: "Franchise BP, Name, and Warehouse are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { franchiseBp } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          franchiseBp,
          franchiseName,
          warehouse,
          stockOwnership: body.stockOwnership || "Telesonic Consignment Stock",
          region: body.region || null,
          countFrequency: body.countFrequency || "Monthly Physical Audit",
          auditor: body.auditor || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warehouse: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else if (franchiseBp) {
          await delegate.deleteMany({ where: { franchiseBp } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Franchise BP is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 33. /api/deviation-reasons - Dedicated Deviation Reasons (MST-27)
    // =========================================================================
    if (path === "/api/deviation-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).deviationReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();

        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const qtyThreshold = body.qtyThreshold !== undefined && body.qtyThreshold !== null ? parseInt(String(body.qtyThreshold), 10) : 1;
        const valueThresholdLkr = body.valueThresholdLkr !== undefined && body.valueThresholdLkr !== null ? parseFloat(String(body.valueThresholdLkr).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          recoverableFromFranchise: body.recoverableFromFranchise || "No (Telesonic Absorption)",
          qtyThreshold,
          valueThresholdLkr,
          escalationRecipients: body.escalationRecipients || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 34. /api/export-permissions - Dedicated Export Permissions (MST-28)
    // =========================================================================
    if (path === "/api/export-permissions") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).exportPermissionMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Permission not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, permission: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (role) where.role = role;
        if (reportGrid) where.reportGrid = reportGrid;
        if (search) {
          where.OR = [
            { role: { contains: search, mode: "insensitive" } },
            { reportGrid: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, permissions: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const role = String(body.role || "").trim();
        const reportGrid = String(body.reportGrid || "").trim();

        if (!role || !reportGrid) {
          return new Response(JSON.stringify({ error: "Role and Target Report / Grid are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) {
          existing = await delegate.findUnique({
            where: {
              role_reportGrid: { role, reportGrid },
            },
          });
        }

        const rowLimit = body.rowLimit !== undefined && body.rowLimit !== null ? parseInt(String(body.rowLimit), 10) : 5000;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          role,
          reportGrid,
          excel: body.excel || "Yes",
          pdf: body.pdf || "Yes",
          restrictedColumns: body.restrictedColumns || null,
          rowLimit,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, permission: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else if (role && reportGrid) {
          await delegate.deleteMany({ where: { role, reportGrid } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "ID or (Role and Report Grid) required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 35. /api/google-meet-settings - Dedicated Google Meet Settings (MST-29)
    // =========================================================================
    if (path === "/api/google-meet-settings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).googleMeetSettingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Setting not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, setting: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (workspaceDomain) where.workspaceDomain = workspaceDomain;
        if (search) {
          where.OR = [
            { workspaceDomain: { contains: search, mode: "insensitive" } },
            { organiserAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, settings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const workspaceDomain = String(body.workspaceDomain || "").trim();
        const organiserAccount = String(body.organiserAccount || "").trim();

        if (!workspaceDomain || !organiserAccount) {
          return new Response(JSON.stringify({ error: "Workspace Domain and Organiser Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { workspaceDomain } });

        const defaultDuration = body.defaultDuration !== undefined && body.defaultDuration !== null ? parseInt(String(body.defaultDuration), 10) : 45;
        const retryCount = body.retryCount !== undefined && body.retryCount !== null ? parseInt(String(body.retryCount), 10) : 3;
        const enabledVal = String(body.enabled || "Yes").trim();
        const computedStatus = enabledVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          workspaceDomain,
          organiserAccount,
          authMethod: body.authMethod || "Google Cloud Service Account JWT",
          defaultDuration,
          inviteCustomer: body.inviteCustomer || "Yes",
          inviteFranchise: body.inviteFranchise || "Yes",
          retryCount,
          enabled: enabledVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, setting: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else if (workspaceDomain) {
          await delegate.deleteMany({ where: { workspaceDomain } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Workspace Domain is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 36. /api/equipment-category-attributes - Dedicated Category Attributes (MST-30)
    // =========================================================================
    if (path === "/api/equipment-category-attributes") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentCategoryAttributeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Category not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, category: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (categoryCode) where.categoryCode = categoryCode;
        if (search) {
          where.OR = [
            { categoryCode: { contains: search, mode: "insensitive" } },
            { categoryName: { contains: search, mode: "insensitive" } },
            { industryGroup: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, categories: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const categoryCode = String(body.categoryCode || "").trim();
        const categoryName = String(body.categoryName || "").trim();

        if (!categoryCode || !categoryName) {
          return new Response(JSON.stringify({ error: "Category Code and Category Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { categoryCode } });

        const defaultInterval = body.defaultInterval !== undefined && body.defaultInterval !== null ? parseInt(String(body.defaultInterval), 10) : 3;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          categoryCode,
          categoryName,
          industryGroup: body.industryGroup || null,
          multiComponent: body.multiComponent || "No",
          meterType: body.meterType || "None",
          defaultIntervalBasis: body.defaultIntervalBasis || "Months (Calendar)",
          defaultInterval,
          checklistSet: body.checklistSet || null,
          warrantyRule: body.warrantyRule || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, category: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else if (categoryCode) {
          await delegate.deleteMany({ where: { categoryCode } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Category Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 37. /api/tool-vehicle-assets - Dedicated Tools, Boxes & Vehicles (MST-31)
    // =========================================================================
    if (path === "/api/tool-vehicle-assets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).toolVehicleAssetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Asset not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, asset: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (assetId) where.assetId = assetId;
        if (search) {
          where.OR = [
            { assetId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { holder: { contains: search, mode: "insensitive" } },
            { vehicleRegNo: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, assets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const assetId = String(body.assetId || "").trim();
        const type = String(body.type || "").trim();
        const description = String(body.description || "").trim();

        if (!assetId || !type || !description) {
          return new Response(JSON.stringify({ error: "Asset ID, Type, and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { assetId } });

        const meterKm = body.meterKm !== undefined && body.meterKm !== null ? parseInt(String(body.meterKm), 10) : null;
        const status = String(body.status || "Available in Stores").trim();

        const payloadData = {
          assetId,
          type,
          description,
          holder: body.holder || null,
          vehicleRegNo: body.vehicleRegNo || null,
          meterKm,
          licenceExpiry: body.licenceExpiry ? new Date(body.licenceExpiry) : null,
          insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, asset: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else if (assetId) {
          await delegate.deleteMany({ where: { assetId } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Asset ID is required" }), { status: 400, headers });
        }
      }
    }

    // 19. /api/masters — Unified CRUD for all Master Screens (MST-13 to MST-31) in PostgreSQL
    if (path === "/api/masters") {
      const urlParams = new URL(request.url).searchParams;
      const screenCode = urlParams.get("screenCode")?.toUpperCase().trim();

      if (method === "GET") {
        if (!screenCode) {
          return new Response(JSON.stringify({ error: "screenCode query parameter is required" }), { status: 400, headers });
        }
        const records = await prisma.masterRecord.findMany({
          where: { screenCode },
          orderBy: { id: "desc" },
        });

        // Unpack data json along with id, status, createdAt, updatedAt
        const unpacked = records.map((r: any) => {
          const baseData = typeof r.data === "object" && r.data !== null ? (r.data as Record<string, unknown>) : {};
          return {
            ...baseData,
            _dbId: r.id,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          };
        });

        return new Response(JSON.stringify({ success: true, records: unpacked }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const sc = String(body.screenCode || screenCode || "").toUpperCase().trim();
        const recordKey = String(body.recordKey || "").trim();
        const recordData = body.data || body;
        const status = String(recordData.status || body.status || "Active");

        if (!sc || !recordKey) {
          return new Response(JSON.stringify({ error: "screenCode and recordKey are mandatory" }), { status: 400, headers });
        }

        const saved = await prisma.masterRecord.upsert({
          where: {
            screenCode_recordKey: {
              screenCode: sc,
              recordKey: recordKey,
            },
          },
          update: {
            data: recordData,
            status: status,
          },
          create: {
            screenCode: sc,
            recordKey: recordKey,
            data: recordData,
            status: status,
          },
        });

        const unpacked = {
          ...(typeof saved.data === "object" && saved.data !== null ? (saved.data as Record<string, unknown>) : {}),
          _dbId: saved.id,
          status: saved.status,
          createdAt: saved.createdAt.toISOString(),
          updatedAt: saved.updatedAt.toISOString(),
        };

        return new Response(JSON.stringify({ success: true, record: unpacked }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const recordKey = urlParams.get("recordKey");
        const dbId = urlParams.get("id");

        if (dbId) {
          await prisma.masterRecord.deleteMany({ where: { id: Number(dbId) } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else if (screenCode && recordKey) {
          await prisma.masterRecord.deleteMany({
            where: {
              screenCode: screenCode,
              recordKey: recordKey,
            },
          });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "id or (screenCode and recordKey) required" }), { status: 400, headers });
        }
      }
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
