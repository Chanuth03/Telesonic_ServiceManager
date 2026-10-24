import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Participant Incentive Statement / Pay Slip API Integration (INC-SCR-12 / INC-RPT-17)", () => {
  it("READ: fetches seeded participant statements with Page 34 specimen calculation (Thisara Tharanga)", async () => {
    const req = new Request("http://localhost:3001/api/incentives/statements", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.statements)).toBe(true);
    expect(data.statements.length).toBeGreaterThanOrEqual(4);

    // Verify Page 34 specimen: Thisara Tharanga (April 2026: 187,100 + 8,000 + 3,000 = 198,100 LKR)
    const thisara = data.statements.find((s: any) => s.id === "SLIP-2026-04-025");
    expect(thisara).toBeDefined();
    expect(thisara.participantName).toBe("Thisara Tharanga");
    expect(thisara.salesCode).toBe("025");
    expect(thisara.designation).toBe("Sales Executive - Dealer Seg 01");
    expect(thisara.period).toBe("April 2026");
    expect(thisara.payableCommission).toBe(187100);
    expect(thisara.targetIncentive).toBe(11000); // 8,000 (vol) + 3,000 (turnover)
    expect(thisara.netPayable).toBe(198100);
    expect(thisara.paymentLagMonths).toBe(3);
    expect(thisara.disbursementMonth).toBe("July 2026");

    // Verify itemized calculation lines match Page 34
    expect(thisara.lines.length).toBe(3);
    const volLine = thisara.lines.find((l: any) => l.componentType === "Volume Target");
    expect(volLine).toBeDefined();
    expect(volLine.targetValue).toBe(80);
    expect(volLine.achievementValue).toBe(154);
    expect(volLine.achievementPct).toBe(192.5);
    expect(volLine.earnedAmount).toBe(8000);

    const turnLine = thisara.lines.find((l: any) => l.componentType === "Turnover Target");
    expect(turnLine).toBeDefined();
    expect(turnLine.targetValue).toBe(18400000);
    expect(turnLine.achievementValue).toBe(23399855);
    expect(turnLine.achievementPct).toBe(127.17);
    expect(turnLine.earnedAmount).toBe(3000);

    const commLine = thisara.lines.find((l: any) => l.componentType === "Commission");
    expect(commLine).toBeDefined();
    expect(commLine.earnedAmount).toBe(187100);
  });

  it("CRUD lifecycle: CREATE, READ single, UPDATE, ISSUE statement, and DELETE", async () => {
    const testId = `SLIP-TEST-${Date.now()}`;
    const testNo = `STMT-TEST-${Date.now()}`;

    // 1. CREATE statement
    const createPayload = {
      id: testId,
      statementNo: testNo,
      participantId: "EMP-TEST-999",
      salesCode: "099",
      participantName: "Kasun Chamara",
      designation: "Senior Technician - Service Seg 02",
      division: "Service & Maintenance",
      period: "May 2026",
      runNo: "INC-RUN-2026-05-SRV",
      payableCommission: 125000,
      targetIncentive: 15000,
      serviceAllowance: 5000,
      adjustmentsAmount: 2500,
      penaltiesClawback: 0,
      netPayable: 147500,
      paymentLagMonths: 3,
      disbursementMonth: "August 2026",
      bankName: "Sampath Bank",
      bankAccountNo: "109823472619",
      status: "Draft",
      preparedBy: "Kavindu Perera (Sales Operations)",
      verifiedBy: "Dilani Silva (Finance)",
      approvedBy: "Nimal Perera (Service Manager)",
      notes: "Test Statement Lifecycle",
      lines: [
        {
          lineNo: 1,
          componentType: "Service Allowance",
          description: "First-Time-Fix Service Allowance",
          targetValue: 40,
          achievementValue: 48,
          achievementPct: 120,
          earnedAmount: 5000,
        },
        {
          lineNo: 2,
          componentType: "Turnover Commission",
          description: "May 2026 Service Revenue Commission",
          targetValue: 5000000,
          achievementValue: 6200000,
          achievementPct: 124,
          earnedAmount: 125000,
        },
        {
          lineNo: 3,
          componentType: "Quarterly Target",
          description: "Target Completion Incentive Bonus",
          targetValue: 100,
          achievementValue: 110,
          achievementPct: 110,
          earnedAmount: 15000,
        },
        {
          lineNo: 4,
          componentType: "Adjustment",
          description: "Approved Manual Service Bonus",
          earnedAmount: 2500,
        },
      ],
    };

    const createReq = new Request("http://localhost:3001/api/incentives/statements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.statement.id).toBe(testId);
    expect(createData.statement.netPayable).toBe(147500);
    expect(createData.statement.lines.length).toBe(4);

    // 2. READ single statement
    const getReq = new Request(`http://localhost:3001/api/incentives/statements/${testId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.statement.participantName).toBe("Kasun Chamara");

    // 3. UPDATE statement
    const updateReq = new Request(`http://localhost:3001/api/incentives/statements/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: "Updated remarks for supervisor demo",
        serviceAllowance: 7000,
        netPayable: 149500,
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.statement.notes).toBe("Updated remarks for supervisor demo");
    expect(updateData.statement.serviceAllowance).toBe(7000);
    expect(updateData.statement.netPayable).toBe(149500);

    // 4. ISSUE statement (Issue pay slip to participant)
    const issueReq = new Request(`http://localhost:3001/api/incentives/statements/${testId}/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issuedBy: "Nimal Perera (Service Manager)" }),
    });
    const issueRes = await handleApiRequest(issueReq);
    expect(issueRes.status).toBe(200);
    const issueData = await issueRes.json();
    expect(issueData.success).toBe(true);
    expect(issueData.statement.status).toBe("Issued");
    expect(issueData.statement.issuedAt).toBeDefined();

    // 5. DELETE statement
    const deleteReq = new Request(`http://localhost:3001/api/incentives/statements/${testId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // 6. Verify 404 after deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/statements/${testId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
