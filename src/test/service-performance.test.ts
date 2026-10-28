import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Service Performance & Job Sheet Actuals API Integration (INC-SCR-07)", () => {
  it("READ: fetches service performance batches from PostgreSQL with technician summaries and job tickets", async () => {
    const req = new Request("http://localhost:3001/api/incentives/service-performance", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.batches)).toBe(true);
    expect(data.batches.length).toBeGreaterThanOrEqual(2);

    // Verify May 2026 active batch
    const mayBatch = data.batches.find((b: any) => b.id === "BAT-SRV-2026-05A");
    expect(mayBatch).toBeDefined();
    expect(mayBatch.period).toBe("May 2026");
    expect(mayBatch.status).toBe("Draft");
    expect(mayBatch.techLines.length).toBe(10);
    expect(mayBatch.jobTickets.length).toBe(10);
    expect(mayBatch.auditLogs.length).toBeGreaterThanOrEqual(3);

    // Technician Line Verification
    const tech1 = mayBatch.techLines.find((t: any) => t.employeeCode === "EMP-1021");
    expect(tech1).toBeDefined();
    expect(tech1.employeeName).toBe("Kasun Jayawardena");
    expect(tech1.closedJobs).toBe(48);
    expect(tech1.hodEligible).toBe(44);
    expect(tech1.avgQuality).toBe(9.4);
    expect(tech1.avgDiscipline).toBe(9.7);
    expect(tech1.poorRepeats).toBe(0);

    // Poor Repeat Job Classification Verification
    const poorJob = mayBatch.jobTickets.find((j: any) => j.jobTicketNo === "SRV-2026-0904");
    expect(poorJob).toBeDefined();
    expect(poorJob.employeeCode).toBe("EMP-1022");
    expect(poorJob.firstTimeFix).toBe(false);
    expect(poorJob.isPoorRepeat).toBe(true);
    expect(poorJob.eligibility).toBe("Not Eligible");
    expect(poorJob.qualityScore).toBe(6.2);

    // Eligible First-Time Fix Job Verification
    const ftfJob = mayBatch.jobTickets.find((j: any) => j.jobTicketNo === "SRV-2026-0891");
    expect(ftfJob).toBeDefined();
    expect(ftfJob.firstTimeFix).toBe(true);
    expect(ftfJob.isPoorRepeat).toBe(false);
    expect(ftfJob.eligibility).toBe("HOD Eligible");
    expect(ftfJob.qualityScore).toBe(9.8);

    // Verify April 2026 Locked batch
    const aprBatch = data.batches.find((b: any) => b.id === "BAT-SRV-2026-04F");
    expect(aprBatch).toBeDefined();
    expect(aprBatch.status).toBe("Locked");
    expect(aprBatch.lockedBy).toBe("Chaminda Warnakula (Service HOD)");
  });

  it("FULL LIFECYCLE: Create Batch -> Read -> Update Job Classification -> Lock as HOD -> Unlock -> Delete in PostgreSQL", async () => {
    const testBatchId = `BAT-SRV-TEST-${Date.now().toString().slice(-6)}`;

    // 1. CREATE
    const createReq = new Request("http://localhost:3001/api/incentives/service-performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testBatchId,
        period: "June 2026 (Test)",
        division: "Consumer Electronics",
        sourceSystem: "ServiceManager Service Desk",
        receivedOn: "01-Jun-2026 10:00 IST",
        status: "Draft",
        notes: "Automated test service performance batch",
        techLines: [
          {
            employeeCode: "EMP-1021",
            employeeName: "Kasun Jayawardena",
            role: "Senior Service Technician",
            division: "Consumer Electronics",
            closedJobs: 20,
            hodEligible: 18,
            partial: 2,
            notEligible: 0,
            excluded: 0,
            avgQuality: 9.5,
            avgDiscipline: 9.8,
            poorRepeats: 0,
            reviewStatus: "Reviewed",
          },
        ],
        jobTickets: [
          {
            jobTicketNo: "SRV-TEST-001",
            employeeCode: "EMP-1021",
            employeeName: "Kasun Jayawardena",
            customerName: "Hilton Colombo",
            equipmentModel: "Daikin VRV System",
            completionDate: "02-Jun-2026",
            faultCategory: "Sensor Replacement",
            firstTimeFix: true,
            qualityScore: 9.6,
            disciplineScore: 10.0,
            eligibility: "HOD Eligible",
            isPoorRepeat: false,
            closureStatus: "Closed",
          },
          {
            jobTicketNo: "SRV-TEST-002",
            employeeCode: "EMP-1021",
            employeeName: "Kasun Jayawardena",
            customerName: "Taj Samudra",
            equipmentModel: "Carrier Multi-Split",
            completionDate: "03-Jun-2026",
            faultCategory: "Flare Joint Tightening",
            firstTimeFix: false,
            qualityScore: 6.0,
            disciplineScore: 8.0,
            eligibility: "Not Eligible",
            isPoorRepeat: true,
            repeatReferenceJob: "SRV-PREV-888",
            closureStatus: "Closed",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.batch.id).toBe(testBatchId);
    expect(createdData.batch.techLines.length).toBe(1);
    expect(createdData.batch.jobTickets.length).toBe(2);

    // 2. READ BY ID
    const readReq = new Request(`http://localhost:3001/api/incentives/service-performance/${testBatchId}`, {
      method: "GET",
    });
    const readRes = await handleApiRequest(readReq);
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.batch.techLines.length).toBe(1);
    expect(readData.batch.jobTickets.length).toBe(2);

    // 3. UPDATE: Adjust Job Classification (re-classify job 2 from Not Eligible to Partial after review)
    const updatedTickets = [
      readData.batch.jobTickets[0],
      {
        ...readData.batch.jobTickets[1],
        eligibility: "Partial",
        notes: "Approved for partial incentive credit upon secondary review.",
      },
    ];

    const updateReq = new Request(`http://localhost:3001/api/incentives/service-performance/${testBatchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...readData.batch,
        jobTickets: updatedTickets,
      }),
    });

    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    const updatedJob2 = updateData.batch.jobTickets.find((j: any) => j.jobTicketNo === "SRV-TEST-002");
    expect(updatedJob2.eligibility).toBe("Partial");

    // 4. LOCK AS SERVICE HOD
    const lockReq = new Request(`http://localhost:3001/api/incentives/service-performance/${testBatchId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Locked",
        lockedBy: "Chaminda Warnakula (Service HOD)",
        notes: "Verified and locked for incentive calculation.",
      }),
    });
    const lockRes = await handleApiRequest(lockReq);
    expect(lockRes.status).toBe(200);
    const lockData = await lockRes.json();
    expect(lockData.batch.status).toBe("Locked");
    expect(lockData.batch.lockedBy).toContain("Chaminda Warnakula");

    // 5. UNLOCK TO DRAFT
    const unlockReq = new Request(`http://localhost:3001/api/incentives/service-performance/${testBatchId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Draft",
        notes: "Re-opened for adjustments.",
      }),
    });
    const unlockRes = await handleApiRequest(unlockReq);
    expect(unlockRes.status).toBe(200);
    const unlockData = await unlockRes.json();
    expect(unlockData.batch.status).toBe("Draft");

    // 6. DELETE IN POSTGRESQL
    const delReq = new Request(`http://localhost:3001/api/incentives/service-performance/${testBatchId}`, {
      method: "DELETE",
    });
    const delRes = await handleApiRequest(delReq);
    expect(delRes.status).toBe(200);

    // Verify deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/service-performance/${testBatchId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
