import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL GL Posting & Payroll Handover API Integration (INC-SCR-12)", () => {
  it("READ: fetches GL posting batches with balanced double-entries and payroll handover items", async () => {
    const req = new Request("http://localhost:3001/api/incentives/gl-posting", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.batches)).toBe(true);
    expect(data.batches.length).toBeGreaterThanOrEqual(2);

    // Verify April 2026 Batch (Page 34 / GL Posting specimen)
    const aprBatch = data.batches.find((b: any) => b.id === "GLP-2026-04-001");
    expect(aprBatch).toBeDefined();
    expect(aprBatch.postingRef).toBe("GLP-2026-04-001");
    expect(aprBatch.period).toBe("April 2026");
    expect(aprBatch.totalDebit).toBe(3430670);
    expect(aprBatch.totalCredit).toBe(3430670);
    expect(aprBatch.journalEntryNo).toBe("JE-2026-05-0412");
    expect(aprBatch.payrollFileName).toBe("INC_RLC_2026-04.xlsx");
    expect(aprBatch.status).toBe("Posted");
    expect(aprBatch.paymentLagMonths).toBe(3);
    expect(aprBatch.disbursementMonth).toBe("July 2026");

    // Verify Balanced Double-Entry Lines
    expect(aprBatch.lines.length).toBe(4);
    const debitSum = aprBatch.lines
      .filter((l: any) => l.accountType === "Debit")
      .reduce((sum: number, l: any) => sum + l.amount, 0);
    const creditSum = aprBatch.lines
      .filter((l: any) => l.accountType === "Credit")
      .reduce((sum: number, l: any) => sum + l.amount, 0);
    expect(debitSum).toBe(3430670);
    expect(creditSum).toBe(3430670);

    // Verify Payroll Handover items
    expect(aprBatch.payrollItems.length).toBeGreaterThanOrEqual(4);
    const nuwan = aprBatch.payrollItems.find((p: any) => p.employeeName.includes("Nuwan Dias"));
    expect(nuwan).toBeDefined();
    expect(nuwan.netDisbursement).toBe(198100);
    expect(nuwan.bankName).toBe("Commercial Bank");
  });

  it("CREATE, READ, UPDATE, EXECUTE SAP POSTING, HANDOVER TO PAYROLL, and DELETE", async () => {
    const testId = `GLP-TEST-${Date.now()}`;
    const testRef = `GLP-REF-${Date.now()}`;

    // 1. CREATE
    const createPayload = {
      id: testId,
      postingRef: testRef,
      runNo: "RUN-2026-06-SIM-01",
      period: "June 2026",
      division: "Consumer Electronics",
      postingDate: "2026-06-30",
      totalAmount: 1800000,
      paymentLagMonths: 3,
      disbursementMonth: "September 2026",
      notes: "June 2026 Accrual Posting Voucher.",
      createdBy: "Lakmal Perera",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/gl-posting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.batch.id).toBe(testId);
    expect(createData.batch.status).toBe("Ready to Post");
    expect(createData.batch.totalDebit).toBe(1800000);
    expect(createData.batch.totalCredit).toBe(1800000);

    // 2. READ detail by ID
    const getReq = new Request(`http://localhost:3001/api/incentives/gl-posting/${testId}`);
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.batch.postingRef).toBe(testRef);

    // 3. UPDATE attributes
    const updateReq = new Request(`http://localhost:3001/api/incentives/gl-posting/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: "Updated: Audited and verified with corporate controller.",
        payrollFileName: "INC_CE_PAYROLL_2026_06.xlsx",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.batch.payrollFileName).toBe("INC_CE_PAYROLL_2026_06.xlsx");

    // 4. EXECUTE SAP POSTING
    const postSapReq = new Request(`http://localhost:3001/api/incentives/gl-posting/${testId}/post-sap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postedBy: "Finance - M. Jayasinghe",
        customJournalRef: "JE-2026-06-9901",
      }),
    });
    const postSapRes = await handleApiRequest(postSapReq);
    expect(postSapRes.status).toBe(200);
    const postSapData = await postSapRes.json();
    expect(postSapData.batch.status).toBe("Posted");
    expect(postSapData.batch.journalEntryNo).toBe("JE-2026-06-9901");

    // 5. HANDOVER TO PAYROLL
    const handoverReq = new Request(`http://localhost:3001/api/incentives/gl-posting/${testId}/handover`, {
      method: "POST",
    });
    const handoverRes = await handleApiRequest(handoverReq);
    expect(handoverRes.status).toBe(200);
    const handoverData = await handoverRes.json();
    expect(handoverData.batch.status).toBe("Handed Over");
    expect(handoverData.batch.payrollItems[0].paymentStatus).toBe("Transmitted to HR");

    // 6. DELETE
    const deleteReq = new Request(`http://localhost:3001/api/incentives/gl-posting/${testId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    const verifyRes = await handleApiRequest(new Request(`http://localhost:3001/api/incentives/gl-posting/${testId}`));
    expect(verifyRes.status).toBe(404);
  });
});
