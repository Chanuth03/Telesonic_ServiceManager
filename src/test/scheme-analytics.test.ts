import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Scheme Performance & Payout Analytics API Integration (INC-RPT-20..24)", () => {
  it("READ: fetches division summaries, category metrics, and budget benchmarks", async () => {
    const req = new Request("http://localhost:3001/api/incentives/analytics", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.divisionBudgets)).toBe(true);
    expect(data.divisionBudgets.length).toBeGreaterThanOrEqual(4);

    // Verify RLC Sales specimen
    const rlc = data.divisionBudgets.find((b: any) => b.id === "BDG-2026-04-RLC");
    expect(rlc).toBeDefined();
    expect(rlc.division).toBe("RLC Sales");
    expect(rlc.period).toBe("April 2026");
    expect(rlc.actualSales).toBe(56240000);
    expect(rlc.budgetAllocation).toBe(3500000);
    expect(rlc.actualIncentiveCost).toBe(3430670);
    expect(rlc.varianceAmount).toBe(69330);
    expect(rlc.costRatioPct).toBe(6.1);
    expect(rlc.status).toBe("Under Budget");

    // Verify INC-RPT-20 division summaries
    expect(Array.isArray(data.divisionSummaries)).toBe(true);
    expect(data.divisionSummaries.length).toBeGreaterThanOrEqual(4);
    const rlcSummary = data.divisionSummaries.find((s: any) => s.division === "RLC Sales");
    expect(rlcSummary).toBeDefined();
    expect(rlcSummary.netPayable).toBe(3430670);
    expect(rlcSummary.costRatioPct).toBe(6.1);

    // Verify INC-RPT-21 employee category summaries
    expect(Array.isArray(data.categorySummaries)).toBe(true);
    expect(data.categorySummaries.length).toBeGreaterThanOrEqual(5);
    const salesExec = data.categorySummaries.find((c: any) => c.category.includes("Sales Executives"));
    expect(salesExec).toBeDefined();
    expect(salesExec.participantCount).toBe(38);
    expect(salesExec.maxPayout).toBe(229800);

    // Verify Overall Totals
    expect(data.overallTotals.totalNetSales).toBeGreaterThan(100000000);
    expect(data.overallTotals.totalIncentiveCost).toBeGreaterThan(5000000);
    expect(data.overallTotals.blendedCostRatioPct).toBeGreaterThan(5.0);
  });

  it("CRUD lifecycle: CREATE division target, READ single, UPDATE budget, and DELETE", async () => {
    const testId = `BDG-TEST-${Date.now()}`;

    // 1. CREATE division budget
    const createPayload = {
      id: testId,
      period: "June 2026",
      division: "Dealer Network Direct",
      targetSales: 30000000,
      actualSales: 32000000,
      targetCollections: 28000000,
      actualCollections: 29500000,
      budgetAllocation: 2000000,
      actualIncentiveCost: 1850000,
      participantCount: 15,
      notes: "Test Budget Benchmark for Dealer Network",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.budget.id).toBe(testId);
    expect(createData.budget.budgetAllocation).toBe(2000000);
    expect(createData.budget.varianceAmount).toBe(150000); // 2,000,000 - 1,850,000
    expect(createData.budget.status).toBe("Under Budget");

    // 2. READ single
    const getReq = new Request(`http://localhost:3001/api/incentives/analytics/${testId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.budget.division).toBe("Dealer Network Direct");

    // 3. UPDATE
    const updateReq = new Request(`http://localhost:3001/api/incentives/analytics/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budgetAllocation: 2100000,
        actualIncentiveCost: 1900000,
        notes: "Revised benchmark allocation",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.budget.budgetAllocation).toBe(2100000);
    expect(updateData.budget.varianceAmount).toBe(200000); // 2,100,000 - 1,900,000
    expect(updateData.budget.notes).toBe("Revised benchmark allocation");

    // 4. DELETE
    const deleteReq = new Request(`http://localhost:3001/api/incentives/analytics/${testId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // 5. Verify 404 after deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/analytics/${testId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
