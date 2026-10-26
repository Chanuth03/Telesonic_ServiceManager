import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL System Parameters & Cut-off Policy API (Screen 19 / Master Data)", () => {
  it("READ: fetches seeded system parameters across cut-off, aging, and governance", async () => {
    const req = new Request("http://localhost:3001/api/incentives/system-parameters", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThanOrEqual(14);

    // Verify Data Cut-off Day parameter: PAR-CUTOFF-01
    const cutoff = data.items.find((i: any) => i.id === "PAR-CUTOFF-01");
    expect(cutoff).toBeDefined();
    expect(cutoff.parameterKey).toBe("DATA_CUTOFF_DAY");
    expect(cutoff.category).toBe("Cut-off & Scheduling");
    expect(cutoff.parameterValue).toBe("25");

    // Verify Debtor Overdue Threshold parameter: PAR-AGING-02
    const overdue = data.items.find((i: any) => i.id === "PAR-AGING-02");
    expect(overdue).toBeDefined();
    expect(overdue.parameterKey).toBe("PENALTY_OVERDUE_THRESHOLD");
    expect(overdue.parameterValue).toBe("45");

    // Verify Dispute Window parameter: PAR-CUTOFF-05
    const dispute = data.items.find((i: any) => i.id === "PAR-CUTOFF-05");
    expect(dispute).toBeDefined();
    expect(dispute.parameterKey).toBe("DISPUTE_WINDOW_DAYS");
    expect(dispute.parameterValue).toBe("10");

    // Verify CEO Approval Threshold: PAR-GOV-01
    const ceoThresh = data.items.find((i: any) => i.id === "PAR-GOV-01");
    expect(ceoThresh).toBeDefined();
    expect(ceoThresh.parameterKey).toBe("CEO_APPROVAL_THRESHOLD");
    expect(ceoThresh.parameterValue).toBe("50000");
  });

  it("FILTER: filters by category and search keyword", async () => {
    // 1. Filter by category "Cut-off & Scheduling"
    const reqCat = new Request(
      "http://localhost:3001/api/incentives/system-parameters?category=Cut-off+%26+Scheduling",
      { method: "GET" }
    );
    const resCat = await handleApiRequest(reqCat);
    const dataCat = await resCat.json();
    expect(dataCat.items.every((i: any) => i.category === "Cut-off & Scheduling")).toBe(true);

    // 2. Search keyword "dispute"
    const reqSearch = new Request("http://localhost:3001/api/incentives/system-parameters?search=dispute", {
      method: "GET",
    });
    const resSearch = await handleApiRequest(reqSearch);
    const dataSearch = await resSearch.json();
    expect(dataSearch.items.length).toBeGreaterThanOrEqual(1);
    expect(dataSearch.items.some((i: any) => i.parameterKey === "DISPUTE_WINDOW_DAYS")).toBe(true);
  });

  it("CRUD lifecycle: CREATE custom parameter, READ single, UPDATE value, RESET to default, and DELETE", async () => {
    const testId = `PAR-TEST-${Date.now()}`;
    const testKey = `CUSTOM_TEST_KEY_${Date.now()}`;

    // 1. CREATE custom parameter
    const createPayload = {
      id: testId,
      parameterKey: testKey,
      parameterName: "Test Service SLA Grace Period",
      category: "Aging & Credit Policy",
      parameterValue: "14",
      unit: "Days",
      defaultValue: "14",
      description: "Grace window allowed for customer warranty replacement verification.",
      isEditable: true,
      effectiveFrom: "2026-05-01",
      lastUpdatedBy: "Quality Assurance Lead",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/system-parameters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.item.id).toBe(testId);
    expect(createData.item.parameterValue).toBe("14");

    // 2. READ single
    const getReq = new Request(`http://localhost:3001/api/incentives/system-parameters/${testId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.item.parameterName).toBe("Test Service SLA Grace Period");

    // 3. UPDATE value
    const updateReq = new Request(`http://localhost:3001/api/incentives/system-parameters/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parameterValue: "21",
        lastUpdatedBy: "Service HOD",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.item.parameterValue).toBe("21");

    // 4. RESET to default
    const resetReq = new Request(`http://localhost:3001/api/incentives/system-parameters/${testId}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetBy: "System Auditor" }),
    });
    const resetRes = await handleApiRequest(resetReq);
    expect(resetRes.status).toBe(200);
    const resetData = await resetRes.json();
    expect(resetData.item.parameterValue).toBe("14"); // reset to defaultValue

    // 5. DELETE custom parameter
    const delReq = new Request(`http://localhost:3001/api/incentives/system-parameters/${testId}`, {
      method: "DELETE",
    });
    const delRes = await handleApiRequest(delReq);
    expect(delRes.status).toBe(200);

    // 6. Verify Deletion
    const verifyDelReq = new Request(`http://localhost:3001/api/incentives/system-parameters/${testId}`, {
      method: "GET",
    });
    const verifyDelRes = await handleApiRequest(verifyDelReq);
    expect(verifyDelRes.status).toBe(404);
  });
});
