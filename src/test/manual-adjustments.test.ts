import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Manual Adjustments & Bonus Claims API Integration (INC-SCR-10)", () => {
  it("READ: fetches manual adjustments from PostgreSQL with approvals and audit history", async () => {
    const req = new Request("http://localhost:3001/api/incentives/manual-adjustments", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.adjustments)).toBe(true);
    expect(data.adjustments.length).toBeGreaterThanOrEqual(4);

    // Verify sample item ADJ-2026-0041 (from Page 33 specimen)
    const adj41 = data.adjustments.find((a: any) => a.id === "ADJ-2026-0041");
    expect(adj41).toBeDefined();
    expect(adj41.adjustmentNo).toBe("ADJ-2026-0041");
    expect(adj41.participantName).toBe("Nuwan Dias");
    expect(adj41.adjustmentType).toBe("Addition");
    expect(adj41.amount).toBe(6500);
    expect(adj41.reason).toContain("Receipt realised after cut-off");
    expect(adj41.status).toBe("Submitted");
    expect(adj41.requiresCeo).toBe(false);

    // Verify Approvals for ADJ-2026-0041
    expect(adj41.approvals.length).toBe(2);
    expect(adj41.approvals[0].roleName).toBe("HOD Sales");
    expect(adj41.approvals[0].decision).toBe("Approved");
    expect(adj41.approvals[1].decision).toBe("Pending");

    // Verify Audit History
    expect(adj41.history.length).toBeGreaterThanOrEqual(2);

    // Verify CEO threshold item ADJ-2026-0043 (Amount 75,000 > 50,000 threshold)
    const adj43 = data.adjustments.find((a: any) => a.id === "ADJ-2026-0043");
    expect(adj43).toBeDefined();
    expect(adj43.amount).toBe(75000);
    expect(adj43.requiresCeo).toBe(true);
    expect(adj43.approvals.length).toBe(3); // Step 3 is CEO
    expect(adj43.approvals[2].roleName).toContain("CEO");
  });

  it("CREATE, READ, UPDATE, SUBMIT, APPROVE, and DELETE: full lifecycle flow on PostgreSQL", async () => {
    const testAdjId = `ADJ-TEST-${Date.now()}`;

    // 1. CREATE (Draft)
    const createPayload = {
      id: testAdjId,
      adjustmentNo: testAdjId,
      runNo: "RUN-2026-05-PRE-01",
      participantId: "EMP-1025",
      participantName: "Nuwan Dias",
      division: "RLC Sales",
      schemeCode: "RLC-REP-PAY",
      schemeName: "Dealer Sales Staff Payment Commission",
      adjustmentType: "Addition",
      amount: 15000,
      reason: "Special Performance Bonus",
      remarks: "Awarded for exceptional conversion rate during promotional week.",
      attachment: "promo_award_approval.pdf",
      status: "Draft",
      createdBy: "Lakmal Perera (Incentive Administrator)",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/manual-adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.adjustment.id).toBe(testAdjId);
    expect(createdData.adjustment.status).toBe("Draft");
    expect(createdData.adjustment.amount).toBe(15000);

    // 2. READ Detail by ID
    const getReq = new Request(`http://localhost:3001/api/incentives/manual-adjustments/${testAdjId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.adjustment.adjustmentNo).toBe(testAdjId);
    expect(getData.adjustment.approvals.length).toBe(2);

    // 3. UPDATE details while in Draft
    const updateReq = new Request(`http://localhost:3001/api/incentives/manual-adjustments/${testAdjId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 18500,
        remarks: "Updated: Awarded for exceptional conversion rate + showroom customer appreciation.",
        updatedBy: "Lakmal Perera",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.adjustment.amount).toBe(18500);

    // 4. SUBMIT for approval (Draft -> Submitted)
    const submitReq = new Request(`http://localhost:3001/api/incentives/manual-adjustments/${testAdjId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submittedBy: "Lakmal Perera" }),
    });
    const submitRes = await handleApiRequest(submitReq);
    expect(submitRes.status).toBe(200);
    const submitData = await submitRes.json();
    expect(submitData.adjustment.status).toBe("Submitted");

    // 5. MAKER-CHECKER DECISION: Step 1 (HOD Approval)
    const step1Req = new Request(`http://localhost:3001/api/incentives/manual-adjustments/${testAdjId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepNumber: 1,
        decision: "Approved",
        approverName: "HOD Sales - T. Aloka",
        comments: "Recommended by sales management.",
      }),
    });
    const step1Res = await handleApiRequest(step1Req);
    expect(step1Res.status).toBe(200);
    const step1Data = await step1Res.json();
    expect(step1Data.adjustment.approvals[0].decision).toBe("Approved");
    // Since step 2 is still pending, overall status remains Submitted
    expect(step1Data.adjustment.status).toBe("Submitted");

    // 6. MAKER-CHECKER DECISION: Step 2 (Finance Manager Approval -> All approved -> Status: Approved)
    const step2Req = new Request(`http://localhost:3001/api/incentives/manual-adjustments/${testAdjId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepNumber: 2,
        decision: "Approved",
        approverName: "Finance - M. Jayasinghe",
        comments: "Budget check passed, verified.",
      }),
    });
    const step2Res = await handleApiRequest(step2Req);
    expect(step2Res.status).toBe(200);
    const step2Data = await step2Res.json();
    expect(step2Data.adjustment.approvals[1].decision).toBe("Approved");
    expect(step2Data.adjustment.status).toBe("Approved");

    // 7. DELETE
    const deleteReq = new Request(`http://localhost:3001/api/incentives/manual-adjustments/${testAdjId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    // Verify deletion
    const verifyGet = await handleApiRequest(new Request(`http://localhost:3001/api/incentives/manual-adjustments/${testAdjId}`));
    expect(verifyGet.status).toBe(404);
  });
});
