import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Audit Trail & Scheme Revision History API (Screen 18 / Security & Audit)", () => {
  it("READ: fetches seeded audit logs across key modules with diffs and checksums", async () => {
    const req = new Request("http://localhost:3001/api/incentives/audit-logs", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThanOrEqual(9);

    // Verify Scheme Master Version Bump: AUD-2026-04-001
    const schemeRev = data.items.find((i: any) => i.id === "AUD-2026-04-001");
    expect(schemeRev).toBeDefined();
    expect(schemeRev.entityType).toBe("Scheme Master");
    expect(schemeRev.entityId).toBe("SCH-RLC-001");
    expect(schemeRev.actionType).toBe("VERSION_BUMP");
    expect(schemeRev.performedBy).toContain("Bandhan Senaratne");
    expect(schemeRev.versionTag).toBe("v1.0 → v1.1");
    expect(schemeRev.hashChecksum).toContain("SHA256:");

    // Verify Four-Eyes CEO sign-off audit log: AUD-2026-04-006
    const ceoSignoff = data.items.find((i: any) => i.id === "AUD-2026-04-006");
    expect(ceoSignoff).toBeDefined();
    expect(ceoSignoff.entityType).toBe("Multi-Level Approval");
    expect(ceoSignoff.role).toBe("CEO");
    expect(ceoSignoff.severity).toBe("CRITICAL");

    // Verify GL Posting & Period Lock audit log: AUD-2026-04-007
    const glLock = data.items.find((i: any) => i.id === "AUD-2026-04-007");
    expect(glLock).toBeDefined();
    expect(glLock.entityType).toBe("GL Posting");
    expect(glLock.actionType).toBe("LOCK_PERIOD");
    expect(glLock.diffSummary).toContain("Immutable Ledger");
  });

  it("FILTER: filters by entityType, severity, and search keywords", async () => {
    // 1. Filter by entityType "Scheme Master"
    const reqScheme = new Request("http://localhost:3001/api/incentives/audit-logs?entityType=Scheme+Master", {
      method: "GET",
    });
    const resScheme = await handleApiRequest(reqScheme);
    const dataScheme = await resScheme.json();
    expect(dataScheme.items.every((i: any) => i.entityType === "Scheme Master")).toBe(true);

    // 2. Filter by severity "CRITICAL"
    const reqCrit = new Request("http://localhost:3001/api/incentives/audit-logs?severity=CRITICAL", {
      method: "GET",
    });
    const resCrit = await handleApiRequest(reqCrit);
    const dataCrit = await resCrit.json();
    expect(dataCrit.items.every((i: any) => i.severity === "CRITICAL")).toBe(true);

    // 3. Search keyword
    const reqSearch = new Request("http://localhost:3001/api/incentives/audit-logs?search=Lanka+Solar", {
      method: "GET",
    });
    const resSearch = await handleApiRequest(reqSearch);
    const dataSearch = await resSearch.json();
    expect(dataSearch.items.length).toBeGreaterThanOrEqual(1);
  });

  it("CRUD lifecycle: CREATE audit entry, READ single, UPDATE auditor notes, VERIFY, and DELETE", async () => {
    const testId = `AUD-TEST-${Date.now()}`;

    // 1. CREATE audit record
    const createPayload = {
      id: testId,
      entityType: "Scheme Master",
      entityId: "SCH-CAC-002",
      actionType: "UPDATE",
      performedBy: "Compliance Officer (K. Silva)",
      role: "Compliance",
      terminalIp: "172.16.0.120",
      severity: "MEDIUM",
      diffSummary: "Annual audit verification of CAC project slab matrix thresholds.",
      versionTag: "v2.0",
      verificationStatus: "Under Review",
      auditorNotes: "Initial review pending sign-off.",
    };

    const createReq = new Request("http://localhost:3001/api/incentives/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.item.id).toBe(testId);
    expect(createData.item.hashChecksum).toBeDefined();

    // 2. READ single
    const getReq = new Request(`http://localhost:3001/api/incentives/audit-logs/${testId}`, {
      method: "GET",
    });
    const getRes = await handleApiRequest(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.item.performedBy).toContain("Compliance Officer");

    // 3. UPDATE details
    const updateReq = new Request(`http://localhost:3001/api/incentives/audit-logs/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auditorNotes: "Thresholds inspected against board minutes and verified accurate.",
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.item.auditorNotes).toContain("inspected against board minutes");

    // 4. VERIFY status change
    const verifyReq = new Request(`http://localhost:3001/api/incentives/audit-logs/${testId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Verified",
        notes: "Passed compliance check on 2026-10-23.",
      }),
    });
    const verifyRes = await handleApiRequest(verifyReq);
    expect(verifyRes.status).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData.item.verificationStatus).toBe("Verified");

    // 5. DELETE
    const delReq = new Request(`http://localhost:3001/api/incentives/audit-logs/${testId}`, {
      method: "DELETE",
    });
    const delRes = await handleApiRequest(delReq);
    expect(delRes.status).toBe(200);

    // 6. Verify Deletion
    const verifyDelReq = new Request(`http://localhost:3001/api/incentives/audit-logs/${testId}`, {
      method: "GET",
    });
    const verifyDelRes = await handleApiRequest(verifyDelReq);
    expect(verifyDelRes.status).toBe(404);
  });
});
