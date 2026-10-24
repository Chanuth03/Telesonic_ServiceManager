import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Dispute & Query Resolution Log API Integration (INC-SCR-14 / Settlements & Statements)", () => {
  it("READ: fetches seeded dispute queries with realistic resolution scenarios", async () => {
    const req = new Request("http://localhost:3001/api/incentives/disputes", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.disputes)).toBe(true);
    expect(data.disputes.length).toBeGreaterThanOrEqual(4);

    // Verify resolved debtor timing dispute: Thisara Tharanga
    const thisaraDisp = data.disputes.find((d: any) => d.id === "DSP-2026-04-001");
    expect(thisaraDisp).toBeDefined();
    expect(thisaraDisp.disputeNo).toBe("DSP-2026-04-001");
    expect(thisaraDisp.participantName).toBe("Thisara Tharanga");
    expect(thisaraDisp.salesCode).toBe("025");
    expect(thisaraDisp.category).toBe("Receipt Realisation Timing");
    expect(thisaraDisp.claimedAmount).toBe(12500);
    expect(thisaraDisp.approvedAmount).toBe(12500);
    expect(thisaraDisp.status).toBe("Resolved");
    expect(thisaraDisp.resolvedBy).toBe("Finance - M. Jayasinghe");

    // Verify attendance penalty waiver dispute: Dilshan Madusanka
    const dilshanDisp = data.disputes.find((d: any) => d.id === "DSP-2026-04-002");
    expect(dilshanDisp).toBeDefined();
    expect(dilshanDisp.category).toBe("Attendance Penalty Waiver");
    expect(dilshanDisp.claimedAmount).toBe(8000);
    expect(dilshanDisp.status).toBe("Approved");

    // Verify in-progress investigation: Ishara Fernando
    const isharaDisp = data.disputes.find((d: any) => d.id === "DSP-2026-04-003");
    expect(isharaDisp).toBeDefined();
    expect(isharaDisp.status).toBe("Under Investigation");
    expect(isharaDisp.priority).toBe("High");
  });

  it("CRUD lifecycle: CREATE dispute, READ single, UPDATE details, RESOLVE/APPROVE, and DELETE", async () => {
    const testId = `DSP-TEST-${Date.now()}`;
    const testNo = `DSP-REF-${Date.now()}`;

    // 1. CREATE dispute
    const createPayload = {
      id: testId,
      disputeNo: testNo,
      participantId: "EMP-TEST-900",
      salesCode: "090",
      participantName: "Chathura Wickramasinghe",
      designation: "Senior Field Engineer",
      division: "RLC Service",
      period: "May 2026",
      statementRef: "SLIP-2026-05-090",
      category: "Missing Job Sheet / Closed Order",
      priority: "High",
      claimedAmount: 9500,
      description: "Service ticket SR-COL-9908 completed on 29-May with FTF not captured in calculation batch.",
      assignedTo: "Kavindu Perera (Operations)",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.dispute.id).toBe(testId);
    expect(createData.dispute.status).toBe("New");
    expect(createData.dispute.claimedAmount).toBe(9500);

    // 2. READ single dispute
    const getReq = new Request(`http://localhost:3001/api/incentives/disputes/${testId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.dispute.participantName).toBe("Chathura Wickramasinghe");

    // 3. UPDATE dispute
    const updateReq = new Request(`http://localhost:3001/api/incentives/disputes/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Under Investigation",
        investigationNotes: "Job sheet SR-COL-9908 verified. Work completion verified with customer sign-off.",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.dispute.status).toBe("Under Investigation");
    expect(updateData.dispute.investigationNotes).toContain("Job sheet SR-COL-9908 verified");

    // 4. RESOLVE dispute (Approve & Credit)
    const resolveReq = new Request(`http://localhost:3001/api/incentives/disputes/${testId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Resolved",
        approvedAmount: 9500,
        resolutionAction: "Manual bonus adjustment ADJ-2026-0099 created. LKR 9,500 credited to June 2026 payout.",
        investigationNotes: "Approved by Service HOD after work log reconciliation.",
        resolvedBy: "Nimal Perera (Service Manager)",
      }),
    });
    const resolveRes = await handleApiRequest(resolveReq);
    expect(resolveRes.status).toBe(200);
    const resolveData = await resolveRes.json();
    expect(resolveData.success).toBe(true);
    expect(resolveData.dispute.status).toBe("Resolved");
    expect(resolveData.dispute.approvedAmount).toBe(9500);
    expect(resolveData.dispute.resolvedBy).toBe("Nimal Perera (Service Manager)");
    expect(resolveData.dispute.resolvedAt).toBeDefined();

    // 5. DELETE dispute
    const deleteReq = new Request(`http://localhost:3001/api/incentives/disputes/${testId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // 6. Verify 404 after deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/disputes/${testId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
