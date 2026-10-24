import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Monthly Target Entry API Integration", () => {
  it("READ: fetches monthly target batches from PostgreSQL with entries and history", async () => {
    const req = new Request("http://localhost:3001/api/incentives/monthly-targets", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.batches)).toBe(true);
    expect(data.batches.length).toBeGreaterThanOrEqual(2);

    const mayBatch = data.batches.find((b: any) => b.id === "mtb-2026-05");
    expect(mayBatch).toBeDefined();
    expect(mayBatch.period).toBe("May 2026 (Current)");
    expect(mayBatch.schemeCode).toBe("SCH-SLS-2026");
    expect(mayBatch.entries.length).toBeGreaterThanOrEqual(8);
    expect(mayBatch.history.length).toBeGreaterThanOrEqual(3);

    // Verify first entry details
    const firstEntry = mayBatch.entries.find((e: any) => e.participantId === "EMP-1021");
    expect(firstEntry).toBeDefined();
    expect(firstEntry.employeeName).toBe("Nimal Perera");
    expect(firstEntry.baseTargetLkr).toBe(2500000);
    expect(firstEntry.stretchTargetLkr).toBe(3200000);
  });

  it("FULL CRUD CYCLE: Create -> Read -> Update -> Approve -> Lock -> Delete Target Batch in PostgreSQL", async () => {
    const testBatchId = `mtb-test-${Date.now()}`;
    const testPeriod = `June 2026 Test (${Date.now().toString().slice(-4)})`;

    // 1. CREATE
    const createReq = new Request("http://localhost:3001/api/incentives/monthly-targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testBatchId,
        period: testPeriod,
        schemeCode: "SCH-SLS-2026",
        division: "Mobile & Accessories",
        targetType: "Turnover Target (LKR)",
        version: "v1.0 Draft",
        currency: "LKR",
        status: "Draft",
        description: "Integration test target batch",
        createdBy: "Integration Test Suite",
        entries: [
          {
            participantId: "EMP-9001",
            employeeName: "Test Participant 1",
            role: "Sales Executive",
            division: "Mobile & Accessories",
            territory: "Colombo Central",
            schemeCode: "SCH-SLS-2026",
            baseTargetLkr: 2000000,
            stretchTargetLkr: 2600000,
            mtdActualLkr: 2100000,
            notes: "Exceeded base target",
          },
          {
            participantId: "EMP-9002",
            employeeName: "Test Participant 2",
            role: "Field Engineer",
            division: "Consumer Electronics",
            territory: "Kandy Region",
            schemeCode: "SCH-SRV-2026",
            baseTargetLkr: 1500000,
            stretchTargetLkr: 2000000,
            mtdActualLkr: 1400000,
            notes: "On track",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.batch.id).toBe(testBatchId);
    expect(createdData.batch.entries.length).toBe(2);

    // 2. READ by ID
    const readReq = new Request(`http://localhost:3001/api/incentives/monthly-targets/${testBatchId}`, {
      method: "GET",
    });
    const readRes = await handleApiRequest(readReq);
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.batch.period).toBe(testPeriod);
    expect(readData.batch.entries.length).toBe(2);

    // 3. UPDATE: Add a 3rd participant and adjust baseTarget
    const updatedEntries = [
      ...readData.batch.entries,
      {
        participantId: "EMP-9003",
        employeeName: "Test Participant 3",
        role: "Promoter",
        division: "Mobile & Accessories",
        territory: "Galle Hub",
        schemeCode: "SCH-PRM-2026",
        baseTargetLkr: 1000000,
        stretchTargetLkr: 1300000,
        mtdActualLkr: 950000,
        notes: "Newly allocated quota",
      },
    ];

    const updateReq = new Request(`http://localhost:3001/api/incentives/monthly-targets/${testBatchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: "v1.1 Draft",
        entries: updatedEntries,
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.batch.version).toBe("v1.1 Draft");
    expect(updateData.batch.entries.length).toBe(3);

    // 4. APPROVE: Update status to Approved
    const approveReq = new Request(`http://localhost:3001/api/incentives/monthly-targets/${testBatchId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Approved",
        author: "D. Fernando",
        role: "Head of Finance",
        details: "Monthly targets approved for execution",
      }),
    });
    const approveRes = await handleApiRequest(approveReq);
    expect(approveRes.status).toBe(200);
    const approveData = await approveRes.json();
    expect(approveData.batch.status).toBe("Approved");
    expect(approveData.batch.approvedBy).toBe("D. Fernando");

    // 5. LOCK: Update status to Locked
    const lockReq = new Request(`http://localhost:3001/api/incentives/monthly-targets/${testBatchId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Locked",
        author: "Lakmal Perera",
        role: "Incentive Administrator",
        details: "Target period finalized and locked against revisions",
      }),
    });
    const lockRes = await handleApiRequest(lockReq);
    expect(lockRes.status).toBe(200);
    const lockData = await lockRes.json();
    expect(lockData.batch.status).toBe("Locked");
    expect(lockData.batch.isLocked).toBe(true);

    // 6. DELETE: Cleanup
    const deleteReq = new Request(`http://localhost:3001/api/incentives/monthly-targets/${testBatchId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    // Verify deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/monthly-targets/${testBatchId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
