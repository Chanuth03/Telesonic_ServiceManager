import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { handleApiRequest } from "@/lib/api-handler";
import {
  offlineDB,
  updateDexieJobStatus,
  getUnsyncedDexieRecords,
  markDexieAsSynced,
} from "@/lib/offline-db";
import { syncManager } from "@/lib/sync-manager";

describe("PostgreSQL (via Prisma) & Dexie.js Dynamic Sync Engine", () => {
  beforeEach(async () => {
    // Clear Dexie tables before test
    await offlineDB.jobs.clear();
    await offlineDB.syncQueue.clear();
  });

  it("stores and fetches jobs directly via PostgreSQL (Prisma layer)", async () => {
    const jobs = await prisma.job.findMany();
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);

    const testId = `TEST-JOB-${Date.now()}`;
    const created = await prisma.job.create({
      data: {
        id: testId,
        customerName: "Test Client PLC",
        town: "Kandy",
        window: "Morning",
        priority: "High",
        role: "Lead",
        status: "Assigned",
        category: "Commercial AC",
        siteAddress: "Kandy Industrial Zone",
        technicianName: "Nimal Perera",
        scheduledDate: "2026-10-20",
        syncStatus: "synced",
      },
    });

    expect(created.id).toBe(testId);

    const fetched = await prisma.job.findUnique({ where: { id: testId } });
    expect(fetched).not.toBeNull();
    expect(fetched?.customerName).toBe("Test Client PLC");
  });

  it("persists local updates in Dexie.js and marks them as pending sync", async () => {
    const testJobId = "SC-2026-9999";
    const updated = await updateDexieJobStatus(testJobId, "In Progress", "Technician reached site");

    expect(updated.id).toBe(testJobId);
    expect(updated.status).toBe("In Progress");
    expect(updated.syncStatus).toBe("pending");

    const unsynced = await getUnsyncedDexieRecords();
    expect(unsynced.pendingJobs.some((j) => j.id === testJobId)).toBe(true);
    expect(unsynced.queueItems.some((q) => q.entityId === testJobId)).toBe(true);
  });

  it("processes /api/sync endpoint and updates PostgreSQL database", async () => {
    const reqBody = {
      role: "TECHNICIAN",
      deviceId: "TECH-TEST-DEVICE",
      timestamp: new Date().toISOString(),
      queueItems: [
        {
          id: 1,
          action: "UPDATE_STATUS",
          entityId: "SC-2026-SYNC-01",
          payload: { status: "Completed", notes: "Filter replaced successfully" },
          createdAt: Date.now(),
        },
      ],
      pendingJobs: [
        {
          id: "SC-2026-SYNC-01",
          customerName: "Sync Enterprise Lanka",
          town: "Colombo 03",
          window: "10:00 - 12:00",
          priority: "Normal" as const,
          role: "Technician",
          status: "Completed" as const,
          category: "Chiller",
          siteAddress: "Galle Road, Colombo",
          technicianName: "Nimal Perera",
          scheduledDate: "2026-10-20",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: "synced" as const,
          version: 1,
        },
      ],
    };

    const request = new Request("http://localhost:3000/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Role": "TECHNICIAN",
        "X-Device-Id": "TECH-TEST-DEVICE",
      },
      body: JSON.stringify(reqBody),
    });

    const response = await handleApiRequest(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.syncedJobIds).toContain("SC-2026-SYNC-01");

    // Verify in PostgreSQL (Prisma)
    const savedJob = await prisma.job.findUnique({ where: { id: "SC-2026-SYNC-01" } });
    expect(savedJob).not.toBeNull();
    expect(savedJob?.status).toBe("Completed");
  });

  it("marks Dexie.js records as synced after sync completion", async () => {
    const jobId = "SC-2026-LOCAL-SYNC";
    await updateDexieJobStatus(jobId, "Accepted");

    let unsynced = await getUnsyncedDexieRecords();
    expect(unsynced.pendingJobs.length).toBeGreaterThan(0);

    const queueIds = unsynced.queueItems.map((q) => q.id!).filter(Boolean);
    await markDexieAsSynced([jobId], queueIds);

    unsynced = await getUnsyncedDexieRecords();
    const remainingPending = unsynced.pendingJobs.filter((j) => j.id === jobId);
    expect(remainingPending.length).toBe(0);
  });
});
