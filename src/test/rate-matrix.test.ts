import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Commission Rate Matrix API Integration", () => {
  it("READ: fetches rate matrices from PostgreSQL with credit bands, rate cells, and history", async () => {
    const req = new Request("http://localhost:3001/api/incentives/rate-matrices", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.matrices)).toBe(true);
    expect(data.matrices.length).toBeGreaterThanOrEqual(1);

    const solarMatrix = data.matrices.find((m: any) => m.id === "mat-solar-q4");
    expect(solarMatrix).toBeDefined();
    expect(typeof solarMatrix.schemeCode).toBe("string");
    expect(typeof solarMatrix.version).toBe("string");
    expect(solarMatrix.bands.length).toBeGreaterThanOrEqual(5);
    expect(solarMatrix.matrixData.length).toBeGreaterThanOrEqual(12);
    expect(solarMatrix.history.length).toBeGreaterThan(0);
  });

  it("FULL CRUD CYCLE: Create -> Update -> Approve -> Delete Rate Matrix in PostgreSQL", async () => {
    const testMatrixId = `mat-test-${Date.now()}`;
    const testSchemeCode = "SCH-MOB-2026";

    // 1. CREATE
    const createReq = new Request("http://localhost:3001/api/incentives/rate-matrices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testMatrixId,
        schemeCode: testSchemeCode,
        matrixName: "Automated Test Matrix",
        version: "v1.0",
        rowDimension: "Capacity Band + Item Type",
        columnDimension: "Payment-term / Credit-age Bands",
        rateUnit: "% of Net Invoiced Value",
        currency: "LKR",
        status: "Draft",
        description: "Created during vitest integration test",
        createdBy: "Integration Test Suite",
        bands: [
          {
            id: `b-test-1-${Date.now()}`,
            name: "Immediate Cash",
            columnKey: "cashImmediate",
            minDays: 0,
            maxDays: 0,
            description: "Immediate settlement",
            defaultFactor: 1.0,
          },
          {
            id: `b-test-2-${Date.now()}`,
            name: "Credit < 30 days",
            columnKey: "creditLt30",
            minDays: 1,
            maxDays: 30,
            description: "Standard credit",
            defaultFactor: 0.9,
          },
        ],
        matrixData: [
          {
            capacityBand: "Standard",
            itemType: "Smartphone A Series",
            cashImmediate: 3.0,
            creditLt15: 2.8,
            creditLt30: 2.5,
            creditLte45: 2.0,
            creditGt45: 1.0,
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    expect(createdData.matrix.id).toBe(testMatrixId);
    expect(createdData.matrix.bands.length).toBe(2);
    expect(createdData.matrix.matrixData.length).toBe(1);

    // 2. READ by ID
    const readReq = new Request(`http://localhost:3001/api/incentives/rate-matrices/${testMatrixId}`, {
      method: "GET",
    });
    const readRes = await handleApiRequest(readReq);
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.matrix.matrixName).toBe("Automated Test Matrix");

    // 3. UPDATE / UPSERT
    const updateReq = new Request(`http://localhost:3001/api/incentives/rate-matrices/${testMatrixId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matrixName: "Updated Automated Test Matrix",
        currency: "USD ($)",
        matrixData: [
          {
            capacityBand: "Standard",
            itemType: "Smartphone A Series",
            cashImmediate: 3.5,
            creditLt15: 3.0,
            creditLt30: 2.7,
            creditLte45: 2.2,
            creditGt45: 1.2,
          },
          {
            capacityBand: "Premium",
            itemType: "Flagship 5G",
            cashImmediate: 4.5,
            creditLt15: 4.0,
            creditLt30: 3.5,
            creditLte45: 3.0,
            creditGt45: 1.5,
          },
        ],
        modifiedBy: "QA Automation Bot",
        changeNote: "Added Flagship 5G row and updated rates",
      }),
    });

    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updatedData = await updateRes.json();
    expect(updatedData.matrix.matrixName).toBe("Updated Automated Test Matrix");
    expect(updatedData.matrix.matrixData.length).toBe(2);

    // 4. APPROVE STATUS
    const statusReq = new Request(`http://localhost:3001/api/incentives/rate-matrices/${testMatrixId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Approved",
        author: "Head of Finance",
        role: "Executive Authorizer",
        details: "Integration test certified approval",
      }),
    });

    const statusRes = await handleApiRequest(statusReq);
    expect(statusRes.status).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.matrix.status).toBe("Approved");

    // 5. DELETE
    const deleteReq = new Request(`http://localhost:3001/api/incentives/rate-matrices/${testMatrixId}`, {
      method: "DELETE",
    });

    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    // Verify deletion
    const verifyReq = new Request(`http://localhost:3001/api/incentives/rate-matrices/${testMatrixId}`, {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(404);
  });
});
