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
            const statusVal = (item.payload?.["status"] as MobileJobStatus) || "In Progress";
            await prisma.job.upsert({
              where: { id: item.entityId },
              create: {
                id: item.entityId,
                status: statusVal,
                updatedAt: now,
                syncStatus: "synced",
              },
              update: {
                status: statusVal,
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
          datasource: prisma.$info.datasource,
          databaseUrl: prisma.$info.databaseUrl.replace(/:[^:@]+@/, ":****@"),
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
