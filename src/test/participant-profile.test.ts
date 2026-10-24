import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Incentive Participant Profile API Integration", () => {
  it("READ: fetches participants from PostgreSQL with assignments and history", async () => {
    const req = new Request("http://localhost:3001/api/incentives/participants", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.participants)).toBe(true);
    expect(data.participants.length).toBeGreaterThanOrEqual(6);

    const nimal = data.participants.find((p: any) => p.id === "EMP-1021");
    expect(nimal).toBeDefined();
    expect(nimal.name).toBe("Nimal Perera");
    expect(nimal.division).toBe("Consumer Electronics");
    expect(nimal.payrollId).toBe("PAY-88342");
    expect(nimal.assignments.length).toBe(2);
    expect(nimal.history.length).toBeGreaterThanOrEqual(2);

    const srvAssignment = nimal.assignments.find((a: any) => a.schemeCode === "SCH-SRV-2026");
    expect(srvAssignment).toBeDefined();
    expect(srvAssignment.calculationRole).toBe("Primary Technician");
    expect(srvAssignment.targetAllocationPercent).toBe(100);
  });

  it("FULL LIFECYCLE: Create Participant -> Assign Scheme -> Update Profile -> End Assignment -> Delete", async () => {
    const testEmpId = `EMP-T${Date.now().toString().slice(-4)}`;

    // 1. CREATE PARTICIPANT
    const createReq = new Request("http://localhost:3001/api/incentives/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testEmpId,
        name: "Test Executive Employee",
        salesEmployeeCode: "SL-999",
        division: "Mobile & Accessories",
        segmentChannel: "Modern Retail & Brand Stores",
        areaManager: "Mahesh Rathnayake (Western Province South)",
        designation: "Retail Sales Executive",
        payrollId: `PAY-${testEmpId.slice(-4)}`,
        active: true,
        phone: "+94 77 000 1122",
        email: "test.exec@telesonic.lk",
        assignments: [
          {
            schemeCode: "SCH-SLS-2026",
            schemeName: "Retail Smartphone & Devices Sales Incentive",
            calculationRole: "Sales Executive",
            isPrimaryRole: true,
            effectiveFrom: "2026-01-01",
            targetAllocationPercent: 100,
            status: "Active",
            notes: "Initial test enrollment",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.participant.id).toBe(testEmpId);
    expect(createdData.participant.assignments.length).toBe(1);

    // 2. ASSIGN A SECOND SCHEME
    const assignReq = new Request(
      `http://localhost:3001/api/incentives/participants/${testEmpId}/assignments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeCode: "SCH-PRM-2026",
          schemeName: "Showroom Promoter Fast Sell-Out Bounty",
          calculationRole: "Showroom Promoter",
          isPrimaryRole: false,
          effectiveFrom: "2026-03-01",
          effectiveTo: "2026-12-31",
          targetAllocationPercent: 25,
          status: "Active",
          notes: "Promoter bounty cross-assignment",
        }),
      },
    );

    const assignRes = await handleApiRequest(assignReq);
    expect(assignRes.status).toBe(200);
    const assignData = await assignRes.json();
    expect(assignData.participant.assignments.length).toBe(2);

    // 3. READ BY ID
    const readReq = new Request(`http://localhost:3001/api/incentives/participants/${testEmpId}`, {
      method: "GET",
    });
    const readRes = await handleApiRequest(readReq);
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.participant.name).toBe("Test Executive Employee");

    // 4. UPDATE PARTICIPANT PROFILE
    const updateReq = new Request(`http://localhost:3001/api/incentives/participants/${testEmpId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        designation: "Senior Sales Executive",
        phone: "+94 77 999 8877",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.participant.designation).toBe("Senior Sales Executive");
    expect(updateData.participant.phone).toBe("+94 77 999 8877");

    // 5. END ASSIGNMENT
    const targetAssignment = updateData.participant.assignments.find(
      (a: any) => a.schemeCode === "SCH-PRM-2026",
    );
    expect(targetAssignment).toBeDefined();

    const endAsgReq = new Request(
      `http://localhost:3001/api/incentives/participants/${testEmpId}/assignments/${targetAssignment.id}`,
      {
        method: "DELETE",
      },
    );
    const endAsgRes = await handleApiRequest(endAsgReq);
    expect(endAsgRes.status).toBe(200);
    const endAsgData = await endAsgRes.json();
    expect(endAsgData.participant.assignments.length).toBe(1);

    // 6. DELETE PARTICIPANT
    const deleteReq = new Request(`http://localhost:3001/api/incentives/participants/${testEmpId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    // 7. VERIFY 404
    const verifyReq = new Request(`http://localhost:3001/api/incentives/participants/${testEmpId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
