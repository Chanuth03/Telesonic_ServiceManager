import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Attendance and Leave Import API Integration", () => {
  it("READ: fetches attendance batches from PostgreSQL with records and rules (INC-BCR-10)", async () => {
    const req = new Request("http://localhost:3001/api/incentives/attendance", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.batches)).toBe(true);
    expect(data.batches.length).toBeGreaterThanOrEqual(2);

    const mayBatch = data.batches.find((b: any) => b.id === "BAT-ATT-2026-05A");
    expect(mayBatch).toBeDefined();
    expect(mayBatch.period).toBe("May 2026");
    expect(mayBatch.records.length).toBe(12);

    // Rule INC-BCR-10 verification:
    // 0-1 absent days = 1.0 factor (100%)
    const rec1 = mayBatch.records.find((r: any) => r.employeeCode === "EMP-1021");
    expect(rec1).toBeDefined();
    expect(rec1.absentDays).toBe(0);
    expect(rec1.attendanceFactor).toBe(1.0);
    expect(rec1.validationStatus).toBe("Valid");

    // 2 absent days = 0.5 factor (50%)
    const rec3 = mayBatch.records.find((r: any) => r.employeeCode === "EMP-1023");
    expect(rec3).toBeDefined();
    expect(rec3.absentDays).toBe(2);
    expect(rec3.attendanceFactor).toBe(0.5);

    // 3 absent days = 0.0 factor (0% - forfeiture)
    const rec4 = mayBatch.records.find((r: any) => r.employeeCode === "EMP-1024");
    expect(rec4).toBeDefined();
    expect(rec4.absentDays).toBe(3);
    expect(rec4.attendanceFactor).toBe(0.0);

    // Ineligible Role = Validation Error
    const rec7 = mayBatch.records.find((r: any) => r.employeeCode === "EMP-1027");
    expect(rec7).toBeDefined();
    expect(rec7.validationStatus).toBe("Error");
  });

  it("FULL LIFECYCLE: Create Batch -> Read -> Update Records -> Approve -> Delete in PostgreSQL", async () => {
    const testBatchId = `BAT-TEST-${Date.now().toString().slice(-6)}`;

    // 1. CREATE
    const createReq = new Request("http://localhost:3001/api/incentives/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testBatchId,
        period: "June 2026 (Test)",
        division: "Consumer Electronics",
        source: "Excel Import",
        status: "Draft",
        importedBy: "Test Coordinator",
        notes: "Automated test attendance batch",
        records: [
          {
            employeeCode: "EMP-1021",
            employeeName: "Kasun Jayawardena",
            role: "Senior Service Technician",
            division: "Consumer Electronics",
            workingDays: 22,
            leaveDays: 1,
            absentDays: 0,
            attendanceFactor: 1.0,
            validationStatus: "Valid",
            errorMessages: [],
            notes: "Test line 1",
          },
          {
            employeeCode: "EMP-1022",
            employeeName: "Pradeep Bandara",
            role: "Field Service Technician",
            division: "Consumer Electronics",
            workingDays: 21,
            leaveDays: 2,
            absentDays: 2,
            attendanceFactor: 0.5,
            validationStatus: "Valid",
            errorMessages: [],
            notes: "Test line 2",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.batch.id).toBe(testBatchId);
    expect(createdData.batch.records.length).toBe(2);

    // 2. READ BY ID
    const readReq = new Request(`http://localhost:3001/api/incentives/attendance/${testBatchId}`, {
      method: "GET",
    });
    const readRes = await handleApiRequest(readReq);
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.batch.records.length).toBe(2);

    // 3. UPDATE: Add 3rd record
    const updatedRecords = [
      ...readData.batch.records,
      {
        employeeCode: "EMP-1023",
        employeeName: "Ruwan Wijesinghe",
        role: "AC & Refrigeration Technician",
        division: "Commercial Air Conditioning",
        workingDays: 20,
        leaveDays: 2,
        absentDays: 3,
        attendanceFactor: 0.0,
        validationStatus: "Valid",
        errorMessages: [],
        notes: "3 absent days test",
      },
    ];

    const updateReq = new Request(`http://localhost:3001/api/incentives/attendance/${testBatchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Validated",
        records: updatedRecords,
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.batch.status).toBe("Validated");
    expect(updateData.batch.records.length).toBe(3);

    // 4. APPROVE
    const approveReq = new Request(
      `http://localhost:3001/api/incentives/attendance/${testBatchId}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Approved",
          approvedBy: "Niluka Senaratne (HR Manager)",
        }),
      },
    );
    const approveRes = await handleApiRequest(approveReq);
    expect(approveRes.status).toBe(200);
    const approveData = await approveRes.json();
    expect(approveData.batch.status).toBe("Approved");
    expect(approveData.batch.approvedBy).toBe("Niluka Senaratne (HR Manager)");

    // 5. DELETE
    const deleteReq = new Request(`http://localhost:3001/api/incentives/attendance/${testBatchId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    // 6. VERIFY 404
    const verifyReq = new Request(`http://localhost:3001/api/incentives/attendance/${testBatchId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
