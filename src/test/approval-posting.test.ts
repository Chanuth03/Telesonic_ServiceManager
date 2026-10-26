import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Multi-Level Approval & Posting API Integration (INC-SCR-11)", () => {
  it("READ: fetches approval packages with steps, GL posting preview lines, and audit history", async () => {
    const req = new Request("http://localhost:3001/api/incentives/approval-batches", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.batches)).toBe(true);
    expect(data.batches.length).toBeGreaterThanOrEqual(2);

    // Verify Page 34 specimen: April 2026 RLC package
    const aprBatch = data.batches.find((b: any) => b.id === "APP-2026-04-RLC");
    expect(aprBatch).toBeDefined();
    expect(aprBatch.runNo).toBe("INC-RUN-2026-04-RLC");
    expect(aprBatch.period).toBe("April 2026");
    expect(aprBatch.totalPayable).toBe(3430670);
    expect(aprBatch.postingMethod).toBe("Accrual JE + payroll export");
    expect(aprBatch.accrualJe).toBe("JE-2026-05-0412");
    expect(aprBatch.payrollFile).toBe("INC_RLC_2026-04.xlsx");
    expect(aprBatch.status).toBe("Posted");

    // Verify 4-tier sequential steps
    expect(aprBatch.steps.length).toBe(4);
    expect(aprBatch.steps[0].roleName).toBe("HOD Sales (RLC)");
    expect(aprBatch.steps[0].decision).toBe("Approved");
    expect(aprBatch.steps[1].roleName).toBe("HOD Service");
    expect(aprBatch.steps[1].decision).toBe("Approved");
    expect(aprBatch.steps[2].roleName).toBe("Head of Finance");
    expect(aprBatch.steps[2].decision).toBe("Approved");
    expect(aprBatch.steps[3].roleName).toContain("CEO");
    expect(aprBatch.steps[3].decision).toBe("Approved");

    // Verify GL Posting Preview lines (Page 34 exact rows)
    expect(aprBatch.postingLines.length).toBe(3);
    const seg1 = aprBatch.postingLines.find((l: any) => l.dimension === "RLC / DS01");
    expect(seg1).toBeDefined();
    expect(seg1.amount).toBe(1912440);
    expect(seg1.glExpenseAccount).toBe("620410");
    expect(seg1.glPayableAccount).toBe("240310");

    const seg2 = aprBatch.postingLines.find((l: any) => l.dimension === "RLC / DS02");
    expect(seg2).toBeDefined();
    expect(seg2.amount).toBe(1328230);

    const mgt = aprBatch.postingLines.find((l: any) => l.dimension === "RLC / MGT");
    expect(mgt).toBeDefined();
    expect(mgt.amount).toBe(190000);

    // Verify history audit trail
    expect(aprBatch.history.length).toBeGreaterThanOrEqual(4);
  });

  it("CREATE, READ, UPDATE, APPROVE PIPELINE, POST JE, LOCK, and DELETE: full lifecycle flow", async () => {
    const testBatchId = `APP-TEST-${Date.now()}`;
    const testRunNo = `RUN-TEST-${Date.now()}`;

    // 1. CREATE approval package
    const createPayload = {
      id: testBatchId,
      runNo: testRunNo,
      period: "June 2026",
      division: "Consumer Electronics",
      totalPayable: 2500000,
      postingMethod: "Accrual JE + payroll export",
      notes: "June 2026 mid-year incentive settlement batch.",
      submittedBy: "Lakmal Perera (Incentive Administrator)",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/approval-batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.batch.id).toBe(testBatchId);
    expect(createdData.batch.status).toBe("Submitted");
    expect(createdData.batch.steps.length).toBe(4);
    expect(createdData.batch.postingLines.length).toBeGreaterThanOrEqual(2);

    // 2. READ by ID
    const getReq = new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.batch.totalPayable).toBe(2500000);

    // 3. UPDATE metadata
    const updateReq = new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalPayable: 2650000,
        notes: "Updated with final reconciled adjustment additions.",
        updatedBy: "Finance Reviewer",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.batch.totalPayable).toBe(2650000);

    // 4. SEQUENTIAL FOUR-EYES APPROVALS:
    // Step 1: HOD Sales
    const s1Res = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepNumber: 1,
          decision: "Approved",
          approverName: "HOD Sales - T. Aloka",
          comments: "Sales figures validated.",
        }),
      }),
    );
    expect(s1Res.status).toBe(200);

    // Step 2: HOD Service
    const s2Res = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepNumber: 2,
          decision: "Approved",
          approverName: "Chaminda Warnakula (Service HOD)",
          comments: "Service KPIs matched.",
        }),
      }),
    );
    expect(s2Res.status).toBe(200);

    // Step 3: Finance Manager
    const s3Res = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepNumber: 3,
          decision: "Approved",
          approverName: "Finance - M. Jayasinghe",
          comments: "General Ledger reconciliation verified.",
        }),
      }),
    );
    expect(s3Res.status).toBe(200);

    // Step 4: CEO (Final sign-off -> status: Approved)
    const s4Res = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepNumber: 4,
          decision: "Approved",
          approverName: "CEO - S. K. Wickramasinghe",
          comments: "Authorized for financial disbursement.",
        }),
      }),
    );
    expect(s4Res.status).toBe(200);
    const s4Data = await s4Res.json();
    expect(s4Data.batch.status).toBe("Approved");

    // 5. POST ACCRUAL JOURNAL ENTRY (Status: Approved -> Posted)
    const postJeRes = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}/post-je`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postedBy: "Finance - M. Jayasinghe",
          journalRef: "JE-2026-06-0915",
          payrollFileName: "INC_CE_2026-06.xlsx",
        }),
      }),
    );
    expect(postJeRes.status).toBe(200);
    const postJeData = await postJeRes.json();
    expect(postJeData.batch.status).toBe("Posted");
    expect(postJeData.batch.accrualJe).toBe("JE-2026-06-0915");
    expect(postJeData.batch.payrollFile).toBe("INC_CE_2026-06.xlsx");

    // 6. LOCK FINANCIAL PERIOD (Status: Posted -> Locked)
    const lockRes = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockedBy: "Finance - M. Jayasinghe" }),
      }),
    );
    expect(lockRes.status).toBe(200);
    const lockData = await lockRes.json();
    expect(lockData.batch.status).toBe("Locked");

    // 7. DELETE
    const deleteRes = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}`, {
        method: "DELETE",
      }),
    );
    expect(deleteRes.status).toBe(200);

    const verifyRes = await handleApiRequest(
      new Request(`http://localhost:3001/api/incentives/approval-batches/${testBatchId}`),
    );
    expect(verifyRes.status).toBe(404);
  });
});
