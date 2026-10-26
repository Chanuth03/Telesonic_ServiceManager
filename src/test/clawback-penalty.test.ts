import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Commission Clawback & Penalty Register API (INC-SCR-19 / Screen 17)", () => {
  it("READ: fetches seeded penalty and clawback items with exact Page 38 specs", async () => {
    const req = new Request("http://localhost:3001/api/incentives/clawbacks", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThanOrEqual(7);

    // Verify Debtor Penalty seed: Ishara Fernando (PEN-2026-04-001)
    const ishara = data.items.find((i: any) => i.id === "PEN-2026-04-001");
    expect(ishara).toBeDefined();
    expect(ishara.participantCode).toBe("044");
    expect(ishara.participantName).toBe("Ishara Fernando");
    expect(ishara.recordType).toBe("Debtor Penalty");
    expect(ishara.tabCategory).toBe("Penalty");
    expect(ishara.invoiceNo).toBe("INV-2026-08819");
    expect(ishara.customerName).toBe("Lanka Solar Traders Ltd");
    expect(ishara.netValue).toBe(245000);
    expect(ishara.dueAgeDays).toBe(58);
    expect(ishara.bracket).toBe("46 - 60 days");
    expect(ishara.ratePercent).toBe(2.96);
    expect(ishara.penaltyAmount).toBe(7258);
    expect(ishara.runNo).toBe("INC-RUN-2026-04-RLC");
    expect(ishara.isRecurring).toBe(true); // "Penalty repeats monthly until the invoice is 100% settled"

    // Verify Cheque Dishonour Clawback seed: Nuwan Dias (CLW-2026-04-004)
    const nuwan = data.items.find((i: any) => i.id === "CLW-2026-04-004");
    expect(nuwan).toBeDefined();
    expect(nuwan.recordType).toBe("Cheque Dishonour");
    expect(nuwan.tabCategory).toBe("Clawback");
    expect(nuwan.penaltyAmount).toBe(6500);

    // Verify Sales Return Clawback seed: Kamal Perera (CLW-2026-04-005)
    const kamal = data.items.find((i: any) => i.id === "CLW-2026-04-005");
    expect(kamal).toBeDefined();
    expect(kamal.recordType).toBe("Sales Return / Cancellation");
    expect(kamal.tabCategory).toBe("Clawback");
    expect(kamal.invoiceNo).toBe("CM-2026-0104");

    // Verify Settled history item: Nalin Senanayake (PEN-2026-03-006)
    const nalin = data.items.find((i: any) => i.id === "PEN-2026-03-006");
    expect(nalin).toBeDefined();
    expect(nalin.tabCategory).toBe("History");
    expect(nalin.settlementStatus).toBe("Settled");

    // Verify Waived history item: Priyantha Bandara (CLW-2026-03-007)
    const priyantha = data.items.find((i: any) => i.id === "CLW-2026-03-007");
    expect(priyantha).toBeDefined();
    expect(priyantha.tabCategory).toBe("History");
    expect(priyantha.settlementStatus).toBe("Waived");
  });

  it("FILTER: filters by tabCategory (Penalty, Clawback, History)", async () => {
    // 1. Filter by Penalty tab
    const reqPenalty = new Request("http://localhost:3001/api/incentives/clawbacks?tab=Penalty", {
      method: "GET",
    });
    const resPenalty = await handleApiRequest(reqPenalty);
    const dataPenalty = await resPenalty.json();
    expect(dataPenalty.items.every((i: any) => i.tabCategory === "Penalty")).toBe(true);

    // 2. Filter by Clawback tab
    const reqClawback = new Request("http://localhost:3001/api/incentives/clawbacks?tab=Clawback", {
      method: "GET",
    });
    const resClawback = await handleApiRequest(reqClawback);
    const dataClawback = await resClawback.json();
    expect(dataClawback.items.every((i: any) => i.tabCategory === "Clawback")).toBe(true);

    // 3. Filter by History tab
    const reqHistory = new Request("http://localhost:3001/api/incentives/clawbacks?tab=History", {
      method: "GET",
    });
    const resHistory = await handleApiRequest(reqHistory);
    const dataHistory = await resHistory.json();
    expect(dataHistory.items.every((i: any) => i.tabCategory === "History")).toBe(true);
  });

  it("CRUD lifecycle: CREATE penalty/clawback, READ single, UPDATE, SETTLE/WAIVE, and DELETE", async () => {
    const testId = `PEN-TEST-${Date.now()}`;

    // 1. CREATE new penalty
    const createPayload = {
      id: testId,
      participantCode: "CAC-999",
      participantName: "Kasun Jayawardena",
      division: "Air Conditioning",
      period: "2026-04",
      recordType: "Debtor Penalty",
      invoiceNo: "INV-2026-9901",
      customerName: "Grand Kandy Hotel Suites",
      netValue: 400000,
      dueAgeDays: 62,
      bracket: "61 - 90 days",
      ratePercent: 3.5,
      penaltyAmount: 14000,
      runNo: "INC-RUN-2026-04-CAC",
      isRecurring: true,
      settlementStatus: "Pending",
      resolutionRemarks: "Overdue debtor balance past 60 days.",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/clawbacks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.item.id).toBe(testId);
    expect(createData.item.penaltyAmount).toBe(14000);

    // 2. READ single
    const getReq = new Request(`http://localhost:3001/api/incentives/clawbacks/${testId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.item.participantName).toBe("Kasun Jayawardena");

    // 3. UPDATE details
    const updateReq = new Request(`http://localhost:3001/api/incentives/clawbacks/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        netValue: 350000,
        ratePercent: 3.0,
        penaltyAmount: 10500,
        resolutionRemarks: "Customer paid LKR 50,000 partial; overdue base reduced to 350,000.",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.item.penaltyAmount).toBe(10500);
    expect(updateData.item.netValue).toBe(350000);

    // 4. SETTLE / WAIVE workflow
    const settleReq = new Request(`http://localhost:3001/api/incentives/clawbacks/${testId}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: "Settled",
        performedBy: "Finance Auditor (W. Mendis)",
        remarks: "Customer invoice cleared via RTGS remittance.",
      }),
    });
    const settleRes = await handleApiRequest(settleReq);
    expect(settleRes.status).toBe(200);
    const settleData = await settleRes.json();
    expect(settleData.item.settlementStatus).toBe("Settled");
    expect(settleData.item.tabCategory).toBe("History");
    expect(settleData.item.settledBy).toBe("Finance Auditor (W. Mendis)");

    // 5. DELETE
    const delReq = new Request(`http://localhost:3001/api/incentives/clawbacks/${testId}`, {
      method: "DELETE",
    });
    const delRes = await handleApiRequest(delReq);
    expect(delRes.status).toBe(200);

    // 6. Verify deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/clawbacks/${testId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
