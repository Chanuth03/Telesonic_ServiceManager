import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Target Incentive Slab Table API Integration", () => {
  it("READ: fetches slab tables from PostgreSQL with achievement tiers and history", async () => {
    const req = new Request("http://localhost:3001/api/incentives/slab-tables", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.tables)).toBe(true);
    expect(data.tables.length).toBeGreaterThanOrEqual(2);

    const slsTable = data.tables.find((t: any) => t.id === "slt-sls-2026");
    expect(slsTable).toBeDefined();
    expect(slsTable.schemeCode).toBe("SCH-SLS-2026");
    expect(slsTable.version).toBe("v2.1");
    expect(slsTable.slabs.length).toBe(6);
    expect(slsTable.history.length).toBeGreaterThan(0);
  });

  it("FULL CRUD CYCLE: Create -> Update -> Approve -> Delete Slab Table in PostgreSQL", async () => {
    const testTableId = `slt-test-${Date.now()}`;
    const testSchemeCode = "SCH-MOB-2027";

    // 1. CREATE
    const createReq = new Request("http://localhost:3001/api/incentives/slab-tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testTableId,
        schemeCode: testSchemeCode,
        tableName: "Automated Test Slab Table",
        targetType: "Turnover Target",
        slabMethod: "Highest Slab Reached (Non-Cumulative)",
        version: "v1.0",
        status: "Draft",
        description: "Created during vitest integration test",
        createdBy: "Integration Test Suite",
        slabs: [
          {
            id: `slb-t1-${Date.now()}`,
            slabTierName: "Tier 1 (80%)",
            minAchievementPercent: 80.0,
            volumeIncentiveLkr: 10000,
            turnoverIncentiveLkr: 20000,
            notes: "Entry qualifying threshold",
          },
          {
            id: `slb-t2-${Date.now()}`,
            slabTierName: "Tier 2 (100%)",
            minAchievementPercent: 100.0,
            volumeIncentiveLkr: 25000,
            turnoverIncentiveLkr: 50000,
            notes: "Benchmark target fulfilled",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.table.id).toBe(testTableId);
    expect(createdData.table.slabs.length).toBe(2);

    // 2. READ by ID
    const readReq = new Request(`http://localhost:3001/api/incentives/slab-tables/${testTableId}`, {
      method: "GET",
    });
    const readRes = await handleApiRequest(readReq);
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.table.tableName).toBe("Automated Test Slab Table");

    // 3. UPDATE / UPSERT
    const updateReq = new Request(`http://localhost:3001/api/incentives/slab-tables/${testTableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableName: "Updated Automated Test Slab Table",
        slabs: [
          {
            id: `slb-t1-${Date.now()}`,
            slabTierName: "Tier 1 (80%)",
            minAchievementPercent: 80.0,
            volumeIncentiveLkr: 15000,
            turnoverIncentiveLkr: 25000,
            notes: "Revised entry threshold",
          },
          {
            id: `slb-t2-${Date.now()}`,
            slabTierName: "Tier 2 (100%)",
            minAchievementPercent: 100.0,
            volumeIncentiveLkr: 30000,
            turnoverIncentiveLkr: 60000,
            notes: "Revised benchmark target",
          },
          {
            id: `slb-t3-${Date.now()}`,
            slabTierName: "Tier 3 (120%)",
            minAchievementPercent: 120.0,
            volumeIncentiveLkr: 45000,
            turnoverIncentiveLkr: 90000,
            notes: "High achiever accelerator",
          },
        ],
        modifiedBy: "QA Automation Bot",
        changeNote: "Added Tier 3 and adjusted incentive rates",
      }),
    });

    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updatedData = await updateRes.json();
    expect(updatedData.table.tableName).toBe("Updated Automated Test Slab Table");
    expect(updatedData.table.slabs.length).toBe(3);

    // 4. APPROVE STATUS
    const statusReq = new Request(`http://localhost:3001/api/incentives/slab-tables/${testTableId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Approved",
        author: "Head of Finance",
        role: "Executive Authorizer",
        details: "Integration test certified approval",
      }),
    });

    const statusRes = await handleApiRequest(statusReq);
    expect(statusRes.status).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.table.status).toBe("Approved");

    // 5. DELETE
    const deleteReq = new Request(`http://localhost:3001/api/incentives/slab-tables/${testTableId}`, {
      method: "DELETE",
    });

    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    // Verify deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/slab-tables/${testTableId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
