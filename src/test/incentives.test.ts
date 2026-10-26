import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Incentive Scheme Master API Integration", () => {
  it("READ: fetches all incentive schemes from PostgreSQL with rules, slabs, and versions", async () => {
    const req = new Request("http://localhost:3000/api/incentives/schemes", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.schemes)).toBe(true);
    expect(data.schemes.length).toBeGreaterThanOrEqual(5);

    const slsScheme = data.schemes.find((s: any) => s.schemeCode === "SCH-SLS-2026");
    expect(slsScheme).toBeDefined();
    expect(slsScheme.division).toBe("Mobile & Accessories");
    expect(slsScheme.rules.length).toBeGreaterThan(0);
    expect(slsScheme.slabs.length).toBeGreaterThan(0);
    expect(slsScheme.rateItems.length).toBeGreaterThan(0);
    expect(slsScheme.versions.length).toBeGreaterThan(0);
  });

  it("FULL CRUD CYCLE: Create -> Read -> Update -> Delete a scheme in PostgreSQL", async () => {
    const testSchemeId = `sch-crud-${Date.now()}`;
    const testSchemeCode = `SCH-CRUD-${Date.now().toString().slice(-4)}`;

    // 1. CREATE
    const createReq = new Request("http://localhost:3000/api/incentives/schemes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testSchemeId,
        schemeCode: testSchemeCode,
        schemeName: "Automated CRUD Test Scheme",
        division: "Consumer Electronics",
        schemeType: "Turnover Tier + Slabs",
        participantRole: "Field Service Technician",
        calculationBasis: "Completed Jobs",
        ageBasis: "Job Close Date",
        payableLagMonths: 1,
        effectiveFrom: "2026-06-01",
        effectiveTo: "2026-12-31",
        status: "Draft",
        version: "v1.0",
        description: "Created as part of automated CRUD verification",
        rules: [
          {
            id: `r-test-1`,
            rule: "First-Time-Fix Target",
            parameter: "Min FTF %",
            value: "95.00%",
            source: "ITSM Job Ledger",
          },
        ],
        slabs: [
          {
            slabId: "S-CRUD-1",
            minPercent: 90,
            maxPercent: 100,
            payoutPercent: 100,
            multiplier: 1.0,
            description: "Target achieved bracket",
          },
        ],
        rateItems: [
          {
            category: "Audio",
            productLine: "Speakers",
            commissionRate: "LKR 500 / job",
            paymentTermBand: "N/A",
            basis: "Completed Job",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.scheme.id).toBe(testSchemeId);
    expect(createData.scheme.schemeCode).toBe(testSchemeCode);

    // 2. READ (Verify it exists in PostgreSQL)
    const readReq = new Request("http://localhost:3000/api/incentives/schemes", {
      method: "GET",
    });
    const readRes = await handleApiRequest(readReq);
    const readData = await readRes.json();
    const fetchedScheme = readData.schemes.find((s: any) => s.id === testSchemeId);
    expect(fetchedScheme).toBeDefined();
    expect(fetchedScheme.schemeName).toBe("Automated CRUD Test Scheme");
    expect(fetchedScheme.rules.length).toBe(1);
    expect(fetchedScheme.rules[0].rule).toBe("First-Time-Fix Target");
    expect(fetchedScheme.slabs.length).toBe(1);

    // 3. UPDATE
    const updateReq = new Request(`http://localhost:3000/api/incentives/schemes/${testSchemeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemeName: "Automated CRUD Test Scheme (Updated)",
        description: "Description updated in PostgreSQL",
        rules: [
          {
            id: `r-test-1`,
            rule: "First-Time-Fix Target",
            parameter: "Min FTF %",
            value: "95.00%",
            source: "ITSM Job Ledger",
          },
          {
            id: `r-test-2`,
            rule: "CSAT Floor Qualifier",
            parameter: "Min Rating",
            value: "4.8 / 5.0",
            source: "Customer Survey",
          },
        ],
        modifiedBy: "QA Automation",
        changeNote: "Added CSAT rule and modified title",
      }),
    });

    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.scheme.schemeName).toBe("Automated CRUD Test Scheme (Updated)");
    expect(updateData.scheme.description).toBe("Description updated in PostgreSQL");
    expect(updateData.scheme.rules.length).toBe(2);

    // 4. DELETE
    const deleteReq = new Request(`http://localhost:3000/api/incentives/schemes/${testSchemeId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // 5. VERIFY DELETION
    const verifyReq = new Request("http://localhost:3000/api/incentives/schemes", {
      method: "GET",
    });
    const verifyRes = await handleApiRequest(verifyReq);
    const verifyData = await verifyRes.json();
    const deletedScheme = verifyData.schemes.find((s: any) => s.id === testSchemeId);
    expect(deletedScheme).toBeUndefined();
  });

  it("STATUS TRANSITION: updates status and records audit history in PostgreSQL", async () => {
    const statusReq = new Request("http://localhost:3000/api/incentives/schemes/sch-4/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Approved",
        user: "Director Kamal",
        role: "Approver",
        notes: "Approved by director during unit testing",
      }),
    });

    const res = await handleApiRequest(statusReq);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.scheme.status).toBe("Approved");
  });
});
