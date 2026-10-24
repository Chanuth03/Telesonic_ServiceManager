import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Incentive Dashboard API Integration (INC-SCR-16)", () => {
  it("READ: fetches dashboard participant benchmarks with Page 36 layout and metrics", async () => {
    const req = new Request("http://localhost:3001/api/incentives/dashboard", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.records)).toBe(true);
    expect(data.records.length).toBeGreaterThanOrEqual(4);

    // Verify Page 34 specimen: Thisara Tharanga
    const thisara = data.records.find((r: any) => r.displayName === "Thisara Tharanga");
    expect(thisara).toBeDefined();
    expect(thisara.participantCode).toBe("025");
    expect(thisara.division).toBe("RLC Sales");
    expect(thisara.period).toBe("April 2026");
    expect(thisara.volumePct).toBe(192.5);
    expect(thisara.turnoverPct).toBe(127.17);
    expect(thisara.projectedCommission).toBe(187100);
    expect(thisara.invoicesOver45Days).toBe(0);
    expect(thisara.penaltyExposure).toBe(0);

    // Verify Ishara Fernando penalty exposure
    const ishara = data.records.find((r: any) => r.displayName === "Ishara Fernando");
    expect(ishara).toBeDefined();
    expect(ishara.invoicesOver45Days).toBe(1);
    expect(ishara.penaltyExposure).toBe(7258);

    // Verify overdue invoices array
    expect(Array.isArray(data.overdueInvoices)).toBe(true);
    expect(data.overdueInvoices.length).toBeGreaterThanOrEqual(1);

    // Verify metrics
    expect(data.metrics.totalProjectedCommission).toBeGreaterThan(500000);
    expect(data.metrics.avgVolumePct).toBeGreaterThan(100);
    expect(data.metrics.totalOverdueInvoices).toBeGreaterThanOrEqual(1);
  });

  it("CRUD lifecycle: CREATE benchmark record, READ single, UPDATE figures, RECALCULATE, and DELETE", async () => {
    const testId = `DSH-TEST-${Date.now()}`;

    // 1. CREATE record
    const createPayload = {
      id: testId,
      participantCode: "EMP-TEST-77",
      displayName: "Nadeeka Warnakula",
      role: "Senior Sales Representative",
      division: "RLC Sales",
      period: "May 2026",
      volumePct: 145.0,
      turnoverPct: 120.0,
      projectedCommission: 165000,
      invoicesOver45Days: 0,
      penaltyExposure: 0,
      baseTarget: 15000000,
      actualAchievement: 18000000,
      notes: "Test Dashboard Performance Record",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.record.id).toBe(testId);
    expect(createData.record.projectedCommission).toBe(165000);

    // 2. READ single
    const getReq = new Request(`http://localhost:3001/api/incentives/dashboard/${testId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.record.displayName).toBe("Nadeeka Warnakula");

    // 3. UPDATE
    const updateReq = new Request(`http://localhost:3001/api/incentives/dashboard/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        volumePct: 155.0,
        projectedCommission: 175000,
        notes: "Updated volume achievement post promotion",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.record.volumePct).toBe(155.0);
    expect(updateData.record.projectedCommission).toBe(175000);

    // 4. RECALCULATE trigger
    const recalcReq = new Request("http://localhost:3001/api/incentives/dashboard/recalculate", {
      method: "POST",
    });
    const recalcRes = await handleApiRequest(recalcReq);
    expect(recalcRes.status).toBe(200);
    const recalcData = await recalcRes.json();
    expect(recalcData.success).toBe(true);

    // 5. DELETE
    const deleteReq = new Request(`http://localhost:3001/api/incentives/dashboard/${testId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // 6. Verify 404 after deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/dashboard/${testId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
