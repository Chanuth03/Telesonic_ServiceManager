/**
 * PostgreSQL Transactions Database Service
 * Provides full CRUD operations for all operational transaction processes
 * directly against PostgreSQL.
 */

import { prisma } from "@/lib/prisma";

export interface TransactionProcessConfig {
  code: string;
  processKey: string;
  apiPath: string;
  prefix: string;
  primaryField: string;
}

export const TRANSACTION_PROCESS_MAP: Record<string, TransactionProcessConfig> = {
  "TRX-01": { code: "TRX-01", processKey: "service-requests", apiPath: "/api/service-requests", prefix: "SR", primaryField: "requestNo" },
  "TRX-02": { code: "TRX-02", processKey: "service-calls", apiPath: "/api/service-calls", prefix: "SC", primaryField: "callNo" },
  "TRX-03": { code: "TRX-03", processKey: "dispatch-schedules", apiPath: "/api/dispatch-schedules", prefix: "DSP", primaryField: "recordNo" },
  "TRX-04": { code: "TRX-04", processKey: "appointments", apiPath: "/api/appointments", prefix: "APT", primaryField: "recordNo" },
  "TRX-05": { code: "TRX-05", processKey: "call-assignments", apiPath: "/api/call-assignments", prefix: "ASG", primaryField: "recordNo" },
  "TRX-06": { code: "TRX-06", processKey: "call-holds", apiPath: "/api/call-holds", prefix: "HLD", primaryField: "recordNo" },
  "TRX-07": { code: "TRX-07", processKey: "site-inspections", apiPath: "/api/site-inspections", prefix: "INSP", primaryField: "recordNo" },
  "TRX-08": { code: "TRX-08", processKey: "installations", apiPath: "/api/installations", prefix: "INS", primaryField: "installationNo" },
  "TRX-09": { code: "TRX-09", processKey: "warranty-activations", apiPath: "/api/warranty-activations", prefix: "WAC", primaryField: "activationNo" },
  "TRX-10": { code: "TRX-10", processKey: "warranty-claims", apiPath: "/api/warranty-claims", prefix: "CLM", primaryField: "claimNo" },
  "TRX-11": { code: "TRX-11", processKey: "serial-replacements", apiPath: "/api/serial-replacements", prefix: "SRP", primaryField: "replacementNo" },
  "TRX-12": { code: "TRX-12", processKey: "service-contracts", apiPath: "/api/service-contracts", prefix: "CNT", primaryField: "contractNo" },
  "TRX-13": { code: "TRX-13", processKey: "relationship-events", apiPath: "/api/relationship-events", prefix: "REV", primaryField: "eventNo" },
  "TRX-14": { code: "TRX-14", processKey: "relationship-timelines", apiPath: "/api/relationship-timelines", prefix: "RTL", primaryField: "recordNo" },
  "TRX-15": { code: "TRX-15", processKey: "reminder-queues", apiPath: "/api/reminder-queues", prefix: "REM", primaryField: "recordNo" },
  "TRX-16": { code: "TRX-16", processKey: "communication-consents", apiPath: "/api/communication-consents", prefix: "CNS", primaryField: "recordNo" },
  "TRX-17": { code: "TRX-17", processKey: "parts-requests", apiPath: "/api/parts-requests", prefix: "PRQ", primaryField: "requestNo" },
  "TRX-18": { code: "TRX-18", processKey: "subcontractor-confirmations", apiPath: "/api/subcontractor-confirmations", prefix: "SWC", primaryField: "confirmationNo" },
  "TRX-19": { code: "TRX-19", processKey: "supplier-cost-links", apiPath: "/api/supplier-cost-links", prefix: "SCL", primaryField: "recordNo" },
  "TRX-20": { code: "TRX-20", processKey: "service-reports", apiPath: "/api/service-reports", prefix: "RPT", primaryField: "recordNo" },
  "TRX-21": { code: "TRX-21", processKey: "supervisor-reviews", apiPath: "/api/supervisor-reviews", prefix: "SRV", primaryField: "recordNo" },
  "TRX-22": { code: "TRX-22", processKey: "hod-recommendations", apiPath: "/api/hod-recommendations", prefix: "HOD", primaryField: "recordNo" },
  "TRX-23": { code: "TRX-23", processKey: "technician-evaluations", apiPath: "/api/technician-evaluations", prefix: "EVL", primaryField: "recordNo" },
  "TRX-24": { code: "TRX-24", processKey: "document-corrections", apiPath: "/api/document-corrections", prefix: "COR", primaryField: "recordNo" },
  "TRX-25": { code: "TRX-25", processKey: "audit-inquiries", apiPath: "/api/audit-inquiries", prefix: "AUD", primaryField: "recordNo" },
  "TRX-26": { code: "TRX-26", processKey: "call-profitability", apiPath: "/api/call-profitability", prefix: "PRF", primaryField: "recordNo" },
  "TRX-27": { code: "TRX-27", processKey: "project-workspaces", apiPath: "/api/project-workspaces", prefix: "PRJ", primaryField: "recordNo" },
  "TRX-28": { code: "TRX-28", processKey: "project-budget-inquiries", apiPath: "/api/project-budget-inquiries", prefix: "PBI", primaryField: "recordNo" },
  "TRX-29": { code: "TRX-29", processKey: "franchise-stock-dashboards", apiPath: "/api/franchise-stock-dashboards", prefix: "FSD", primaryField: "recordNo" },
  "TRX-30": { code: "TRX-30", processKey: "stock-counts", apiPath: "/api/stock-counts", prefix: "STC", primaryField: "countNo" },
  "TRX-31": { code: "TRX-31", processKey: "stock-variance-reviews", apiPath: "/api/stock-variance-reviews", prefix: "SVR", primaryField: "recordNo" },
  "TRX-32": { code: "TRX-32", processKey: "stock-adjustments", apiPath: "/api/stock-adjustments", prefix: "ADJ", primaryField: "adjustmentNo" },
  "TRX-33": { code: "TRX-33", processKey: "communication-logs", apiPath: "/api/communication-logs", prefix: "CML", primaryField: "recordNo" },
  "TRX-34": { code: "TRX-34", processKey: "workshop-jobs", apiPath: "/api/workshop-jobs", prefix: "WJB", primaryField: "recordNo" },
  "TRX-35": { code: "TRX-35", processKey: "service-quotations", apiPath: "/api/service-quotations", prefix: "QTN", primaryField: "quotationNo" },
};

export const PROCESS_KEY_TO_CONFIG: Record<string, TransactionProcessConfig> = Object.values(
  TRANSACTION_PROCESS_MAP,
).reduce(
  (acc, cfg) => {
    acc[cfg.processKey] = cfg;
    return acc;
  },
  {} as Record<string, TransactionProcessConfig>,
);

export interface StoredTransactionRow {
  id: number;
  process_key: string;
  record_no: string;
  customer: string | null;
  site: string | null;
  equipment: string | null;
  call_no: string | null;
  request_no: string | null;
  status: string;
  data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

function formatRowForClient(row: StoredTransactionRow): Record<string, unknown> {
  const rawData = row.data || {};
  const innerForm = (rawData["formData"] as Record<string, unknown>) || rawData;
  return {
    ...innerForm,
    id: row.record_no,
    recordNo: row.record_no,
    processKey: row.process_key,
    customer: innerForm["customer"] || row.customer || "",
    site: innerForm["site"] || row.site || "",
    equipment: innerForm["equipment"] || innerForm["equipmentSystem"] || row.equipment || "",
    callNo: innerForm["callNo"] || row.call_no || "",
    requestNo: innerForm["requestNo"] || row.request_no || "",
    status: String(innerForm["status"] || row.status || "Draft"),
    data: rawData,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTransactionRecordsByProcess(
  processKey: string,
): Promise<Array<Record<string, unknown>>> {
  try {
    const rows = await prisma.$queryRawUnsafe<StoredTransactionRow[]>(
      `SELECT * FROM "transaction_records" WHERE "process_key" = $1 ORDER BY "updated_at" DESC`,
      processKey,
    );
    return rows.map(formatRowForClient);
  } catch (err) {
    console.error(`[PostgreSQL] Error fetching transaction_records for ${processKey}:`, err);
    return [];
  }
}

export async function getTransactionRecordByNo(
  processKey: string,
  recordNo: string,
): Promise<Record<string, unknown> | null> {
  try {
    const rows = await prisma.$queryRawUnsafe<StoredTransactionRow[]>(
      `SELECT * FROM "transaction_records" WHERE "process_key" = $1 AND "record_no" = $2 LIMIT 1`,
      processKey,
      recordNo,
    );
    if (!rows[0]) return null;
    return formatRowForClient(rows[0]);
  } catch (err) {
    console.error(`[PostgreSQL] Error fetching single transaction_record:`, err);
    return null;
  }
}

export async function upsertTransactionRecord(
  processKey: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const cfg = PROCESS_KEY_TO_CONFIG[processKey];
  const prefix = cfg ? cfg.prefix : "TRX";
  const primaryField = cfg ? cfg.primaryField : "recordNo";

  const payloadDataObj =
    payload["data"] && typeof payload["data"] === "object"
      ? (payload["data"] as Record<string, unknown>)
      : null;

  const innerForm =
    payloadDataObj && payloadDataObj["formData"]
      ? (payloadDataObj["formData"] as Record<string, unknown>)
      : payload;

  const rawPrimary = String(
    payload[primaryField] ||
      innerForm[primaryField] ||
      payload["recordNo"] ||
      innerForm["recordNo"] ||
      payload["id"] ||
      "",
  ).trim();

  const recordNo =
    rawPrimary ||
    `${prefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const customer =
    String(
      innerForm["customer"] ||
        innerForm["endCustomerName"] ||
        innerForm["dealer"] ||
        innerForm["vendor"] ||
        innerForm["franchise"] ||
        payload["customer"] ||
        "",
    ).trim() || null;

  const site =
    String(
      innerForm["site"] ||
        innerForm["warehouse"] ||
        innerForm["fromWarehouse"] ||
        payload["site"] ||
        "",
    ).trim() || null;

  const equipment =
    String(
      innerForm["equipmentSystem"] ||
        innerForm["equipment"] ||
        innerForm["systemId"] ||
        innerForm["serial"] ||
        innerForm["unitSerial"] ||
        innerForm["item"] ||
        payload["equipment"] ||
        "",
    ).trim() || null;

  const callNo =
    String(
      (primaryField === "callNo"
        ? recordNo
        : innerForm["callNo"] || innerForm["calls"] || payload["callNo"]) || "",
    ).trim() || null;

  const requestNo =
    String(
      (primaryField === "requestNo"
        ? recordNo
        : innerForm["requestNo"] || payload["requestNo"]) || "",
    ).trim() || null;

  const status = String(innerForm["status"] || payload["status"] || "Saved").trim();

  const enrichedFormData = {
    ...innerForm,
    [primaryField]: recordNo,
    recordNo,
    status,
  };

  const jsonData = {
    formData: enrichedFormData,
    tabDatasets: payloadDataObj ? payloadDataObj["tabDatasets"] || {} : {},
  };

  const rows = await prisma.$queryRawUnsafe<StoredTransactionRow[]>(
    `INSERT INTO "transaction_records" (
      "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "updated_at"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT ("process_key", "record_no") DO UPDATE SET
      "customer" = EXCLUDED."customer",
      "site" = EXCLUDED."site",
      "equipment" = EXCLUDED."equipment",
      "call_no" = EXCLUDED."call_no",
      "request_no" = EXCLUDED."request_no",
      "status" = EXCLUDED."status",
      "data" = EXCLUDED."data",
      "updated_at" = CURRENT_TIMESTAMP
    RETURNING *`,
    processKey,
    recordNo,
    customer,
    site,
    equipment,
    callNo,
    requestNo,
    status,
    JSON.stringify(jsonData),
  );

  // Cross-process database updates in PostgreSQL:
  if (processKey === "service-calls" && requestNo) {
    const cleanReqNo = requestNo.split("—")[0]?.trim() || requestNo;
    await prisma.serviceRequest
      .updateMany({
        where: { OR: [{ requestNo: cleanReqNo }, { id: cleanReqNo }] },
        data: { status: "Converted" },
      })
      .catch(() => {});
  }

  if (processKey === "call-holds" && callNo) {
    const cleanCallNo = callNo.split("—")[0]?.trim() || callNo;
    const newCallStatus = innerForm["resumeDate"] ? "In Progress" : "On Hold";
    await prisma
      .$executeRawUnsafe(
        `UPDATE "transaction_records" SET "status" = $1, "updated_at" = CURRENT_TIMESTAMP WHERE "process_key" = 'service-calls' AND "record_no" = $2`,
        newCallStatus,
        cleanCallNo,
      )
      .catch(() => {});
  }

  if ((processKey === "appointments" || processKey === "call-assignments") && callNo) {
    const cleanCallNo = callNo.split("—")[0]?.trim() || callNo;
    const nextStatus = processKey === "appointments" ? "Scheduled" : "Assigned";
    await prisma
      .$executeRawUnsafe(
        `UPDATE "transaction_records" SET "status" = $1, "updated_at" = CURRENT_TIMESTAMP WHERE "process_key" = 'service-calls' AND "record_no" = $2`,
        nextStatus,
        cleanCallNo,
      )
      .catch(() => {});
  }

  // Also synchronize Service Calls, Dispatch Schedules, Call Assignments, and Call Holds with mobile `jobs` table:
  try {
    if (processKey === "service-calls") {
      const assignedPerson = String(
        innerForm["assignedPerson"] || innerForm["person"] || innerForm["receivedBy"] || "",
      ).trim();
      if (assignedPerson) {
        const mappedStatus =
          status === "In Progress"
            ? "In Progress"
            : status === "On Hold"
              ? "On Hold"
              : status === "Completed" || status === "Closed"
                ? "Completed"
                : status === "Accepted"
                  ? "Accepted"
                  : "Assigned";
        const rawPrio = String(innerForm["priority"] || "Normal");
        const mappedPriority = rawPrio.includes("P1") || rawPrio.includes("Critical")
          ? "Critical"
          : rawPrio.includes("P2") || rawPrio.includes("High")
            ? "High"
            : "Normal";
        const schedDate = String(
          innerForm["plannedDate"] ||
            innerForm["scheduledDate"] ||
            innerForm["creationDate"] ||
            new Date().toISOString().slice(0, 10),
        );
        await prisma.job.upsert({
          where: { id: recordNo },
          update: {
            customerName: customer || "Customer",
            siteAddress: site || "Customer Site",
            town: (site || "Colombo").split(",").pop()?.trim() || "Colombo",
            priority: mappedPriority,
            status: mappedStatus,
            category: equipment || String(innerForm["callType"] || "Service Call"),
            technicianName: assignedPerson,
            scheduledDate: schedDate,
          },
          create: {
            id: recordNo,
            customerName: customer || "Customer",
            siteAddress: site || "Customer Site",
            town: (site || "Colombo").split(",").pop()?.trim() || "Colombo",
            window: "Today, 09:00 - 12:00",
            priority: mappedPriority,
            role: String(innerForm["roles"] || "Lead Technician"),
            status: mappedStatus,
            category: equipment || String(innerForm["callType"] || "Service Call"),
            technicianName: assignedPerson,
            scheduledDate: schedDate,
            syncStatus: "synced",
          },
        });
      }
    } else if (processKey === "call-assignments" && callNo) {
      const cleanCallNo = callNo.split("—")[0]?.trim() || callNo;
      const assignedPerson = String(innerForm["person"] || "").trim();
      if (assignedPerson && cleanCallNo) {
        const scRow = await getTransactionRecordByNo("service-calls", cleanCallNo);
        const custName = String(scRow?.["customer"] || customer || "Customer");
        const siteAddr = String(scRow?.["site"] || site || "Customer Site");
        const equipCat = String(scRow?.["equipment"] || scRow?.["equipmentSystem"] || equipment || "Service Call");
        await prisma.job.upsert({
          where: { id: cleanCallNo },
          update: {
            technicianName: assignedPerson,
            role: String(innerForm["roles"] || "Lead Technician"),
            status: "Assigned",
          },
          create: {
            id: cleanCallNo,
            customerName: custName,
            siteAddress: siteAddr,
            town: siteAddr.split(",").pop()?.trim() || "Colombo",
            window: "Today, 09:00 - 12:00",
            priority: "High",
            role: String(innerForm["roles"] || "Lead Technician"),
            status: "Assigned",
            category: equipCat,
            technicianName: assignedPerson,
            scheduledDate: new Date().toISOString().slice(0, 10),
            syncStatus: "synced",
          },
        });
      }
    } else if (processKey === "call-holds" && callNo) {
      const cleanCallNo = callNo.split("—")[0]?.trim() || callNo;
      const newCallStatus = innerForm["resumeDate"] ? "In Progress" : "On Hold";
      await prisma.job
        .updateMany({
          where: { id: cleanCallNo },
          data: { status: newCallStatus },
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error("[PostgreSQL] Non-blocking job sync error:", err);
  }

  return formatRowForClient(rows[0]!);
}

export async function deleteTransactionRecordByNo(
  processKey: string,
  recordNo: string,
): Promise<boolean> {
  try {
    const count = await prisma.$executeRawUnsafe(
      `DELETE FROM "transaction_records" WHERE "process_key" = $1 AND "record_no" = $2`,
      processKey,
      recordNo,
    );
    return Number(count) > 0;
  } catch (err) {
    console.error(`[PostgreSQL] Error deleting transaction_record ${processKey}/${recordNo}:`, err);
    return false;
  }
}
