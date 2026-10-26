import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Calculation Results Detail View API Integration (INC-SCR-08)", () => {
  it("READ: fetches calculation batches from PostgreSQL with participant breakdowns and audit logs", async () => {
    const req = new Request("http://localhost:3001/api/incentives/calculation-results", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.batches)).toBe(true);
    expect(data.batches.length).toBeGreaterThanOrEqual(2);

    // Verify May 2026 active calculation run
    const mayBatch = data.batches.find((b: any) => b.id === "RUN-2026-05-MTD-04");
    expect(mayBatch).toBeDefined();
    expect(mayBatch.period).toBe("May 2026");
    expect(mayBatch.status).toBe("Verified");
    expect(mayBatch.totalParticipants).toBeGreaterThanOrEqual(7);
    expect(mayBatch.participantResults.length).toBeGreaterThanOrEqual(7);
    expect(mayBatch.auditLogs.length).toBeGreaterThanOrEqual(3);

    // Verify Participant Calculation & Mathematical formula
    // Net Payable = (Gross Commission + Target Incentive) * Attendance Factor - Penalty Clawback
    const ruwan = mayBatch.participantResults.find((p: any) => p.technicianCode === "TECH-101");
    expect(ruwan).toBeDefined();
    expect(ruwan.technicianName).toBe("Ruwan Jayasinghe");
    expect(ruwan.role).toBe("Senior Field Engineer");
    expect(ruwan.schemeCode).toBe("SCH-CE-FIELD");
    expect(ruwan.actualVolume).toBe(46);
    expect(ruwan.targetVolume).toBe(40);
    expect(ruwan.volumePct).toBe(115.0);
    expect(ruwan.grossCommission).toBe(98000);
    expect(ruwan.targetIncentive).toBe(50500);
    expect(ruwan.attendanceFactor).toBe(1.0);
    expect(ruwan.penaltyClawback).toBe(0);
    // (98000 + 50500) * 1.0 - 0 = 148500
    expect(ruwan.netPayable).toBe(148500);
    expect(ruwan.status).toBe("Verified");

    // Verify Dinesh Bandara (Biomedical Specialist with penalty clawback)
    const dinesh = mayBatch.participantResults.find((p: any) => p.technicianCode === "TECH-102");
    expect(dinesh).toBeDefined();
    expect(dinesh.actualTurnover).toBe(1484000);
    expect(dinesh.targetTurnover).toBe(1400000);
    expect(dinesh.grossCommission).toBe(135000);
    expect(dinesh.targetIncentive).toBe(81500);
    expect(dinesh.attendanceFactor).toBe(1.0);
    expect(dinesh.penaltyClawback).toBe(24500);
    // (135000 + 81500) * 1.0 - 24500 = 192000
    expect(dinesh.netPayable).toBe(192000);

    // Verify April 2026 Approved run
    const aprBatch = data.batches.find((b: any) => b.id === "RUN-2026-04-FINAL");
    expect(aprBatch).toBeDefined();
    expect(aprBatch.status).toBe("Approved");
    expect(aprBatch.totalParticipants).toBe(7);
  });

  it("READ BY ID: fetches single calculation batch by ID", async () => {
    const req = new Request("http://localhost:3001/api/incentives/calculation-results/RUN-2026-05-MTD-04", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.batch.id).toBe("RUN-2026-05-MTD-04");
    expect(data.batch.participantResults.length).toBeGreaterThanOrEqual(7);
  });

  it("CRUD LIFECYCLE: creates, updates, toggles participant status, and deletes calculation batch", async () => {
    const testBatchId = `RUN-TEST-${Date.now()}`;

    // 1. CREATE
    const createReq = new Request("http://localhost:3001/api/incentives/calculation-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testBatchId,
        period: "June 2026",
        runDate: "2026-06-30",
        status: "Calculated",
        runType: "Monthly Final Run",
        totalParticipants: 2,
        grossCommissionLkr: 75000,
        targetIncentiveLkr: 140000,
        penaltyClawbackLkr: 5000,
        netPayableLkr: 210000,
        notes: "Automated Vitest test calculation batch",
        participantResults: [
          {
            id: `RES-${testBatchId}-01`,
            technicianCode: "EMP-TEST-01",
            technicianName: "Nimal Ranasinghe",
            role: "Field Technician",
            division: "Kandy",
            schemeCode: "SCH-FLD-01",
            schemeName: "Field Standard",
            actualVolume: 90,
            targetVolume: 80,
            volumePct: 112.5,
            actualTurnover: 1800000,
            targetTurnover: 1600000,
            turnoverPct: 112.5,
            slabTier: "Tier 2",
            slabMultiplier: 1.1,
            grossCommission: 35000,
            targetIncentive: 65000,
            attendanceFactor: 1.0,
            penaltyClawback: 0,
            netPayable: 100000,
            status: "Calculated",
            jobCount: 42,
            overdueInvoiceCount: 0,
            notes: "Eligible for incentive",
          },
          {
            id: `RES-${testBatchId}-02`,
            technicianCode: "EMP-TEST-02",
            technicianName: "Sunil Bandara",
            role: "Workshop Technician",
            division: "Colombo Central",
            schemeCode: "SCH-WKP-01",
            schemeName: "Workshop Standard",
            actualVolume: 105,
            targetVolume: 100,
            volumePct: 105.0,
            actualTurnover: 2200000,
            targetTurnover: 2000000,
            turnoverPct: 110.0,
            slabTier: "Tier 1",
            slabMultiplier: 1.0,
            grossCommission: 40000,
            targetIncentive: 75000,
            attendanceFactor: 1.0,
            penaltyClawback: 5000,
            netPayable: 110000,
            status: "Calculated",
            jobCount: 50,
            overdueInvoiceCount: 1,
            notes: "Minor SLA clawback",
          },
        ],
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: "2026-06-30 18:00:00",
            user: "Vitest Runner",
            role: "Automated Tester",
            action: "Batch Created",
            details: "Created test calculation batch for June 2026",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.batch.id).toBe(testBatchId);

    // 2. VERIFY CREATION
    const fetchReq = new Request(`http://localhost:3001/api/incentives/calculation-results/${testBatchId}`, {
      method: "GET",
    });
    const fetchRes = await handleApiRequest(fetchReq);
    expect(fetchRes.status).toBe(200);
    const fetchData = await fetchRes.json();
    expect(fetchData.batch.id).toBe(testBatchId);
    expect(fetchData.batch.totalParticipants).toBe(2);
    expect(fetchData.batch.participantResults.length).toBe(2);

    // 3. TOGGLE PARTICIPANT STATUS (Calculated -> Verified)
    const statusReq = new Request(
      `http://localhost:3001/api/incentives/calculation-results/${testBatchId}/participants/RES-${testBatchId}-01/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Verified",
          actorName: "Praveen Samarasinghe (Incentive Manager)",
          notes: "Audit verified after reviewing warranty claims",
        }),
      }
    );
    const statusRes = await handleApiRequest(statusReq);
    expect(statusRes.status).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.success).toBe(true);

    // Verify status was persisted in DB
    const verifyFetch = await handleApiRequest(fetchReq.clone());
    const verifyData = await verifyFetch.json();
    const verifiedPart = verifyData.batch.participantResults.find((p: any) => p.id === `RES-${testBatchId}-01`);
    expect(verifiedPart.status).toBe("Verified");

    // 4. UPDATE BATCH (Save changes to totals and status)
    const updateReq = new Request(`http://localhost:3001/api/incentives/calculation-results/${testBatchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Verified",
        notes: "Updated calculation batch with verified status",
        participantResults: verifyData.batch.participantResults,
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);

    // 5. DELETE A PARTICIPANT RESULT
    const deletePartReq = new Request(
      `http://localhost:3001/api/incentives/calculation-results/${testBatchId}/participants/RES-${testBatchId}-02`,
      {
        method: "DELETE",
      }
    );
    const deletePartRes = await handleApiRequest(deletePartReq);
    expect(deletePartRes.status).toBe(200);

    // 6. DELETE ENTIRE BATCH
    const deleteBatchReq = new Request(
      `http://localhost:3001/api/incentives/calculation-results/${testBatchId}`,
      {
        method: "DELETE",
      }
    );
    const deleteBatchRes = await handleApiRequest(deleteBatchReq);
    expect(deleteBatchRes.status).toBe(200);

    // 7. VERIFY GONE
    const verifyGoneReq = new Request(
      `http://localhost:3001/api/incentives/calculation-results/${testBatchId}`,
      {
        method: "GET",
      }
    );
    const verifyGoneRes = await handleApiRequest(verifyGoneReq);
    expect(verifyGoneRes.status).toBe(404);
  });
});
