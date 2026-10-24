import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Incentive Calculation Run Engine API Integration (INC-SCR-09)", () => {
  it("READ: fetches calculation runs from PostgreSQL with readiness checks, scheme summaries, warnings, and logs", async () => {
    const req = new Request("http://localhost:3001/api/incentives/calculation-runs", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe("PostgreSQL (telesonic)");
    expect(Array.isArray(data.runs)).toBe(true);
    expect(data.runs.length).toBeGreaterThanOrEqual(2);

    // Verify May 2026 Simulation Run
    const mayRun = data.runs.find((r: any) => r.id === "RUN-2026-05-PRE-01");
    expect(mayRun).toBeDefined();
    expect(mayRun.runNo).toBe("RUN-2026-05-PRE-01");
    expect(mayRun.period).toBe("May 2026");
    expect(["Simulation", "Final Calculation"]).toContain(mayRun.runType);
    expect(mayRun.totalParticipants).toBe(34);
    expect(mayRun.totalDocsRead).toBe(1735);
    expect(mayRun.totalGrossCommission).toBe(2865000);
    expect(mayRun.totalTargetIncentive).toBe(1240000);
    expect(mayRun.totalPenalty).toBe(122000);
    expect(mayRun.totalNetPayable).toBe(3983000);

    // Verify Readiness Checks
    expect(mayRun.readinessChecks.length).toBe(4);
    expect(mayRun.readinessChecks.every((c: any) => c.isReady)).toBe(true);
    const targetCheck = mayRun.readinessChecks.find((c: any) => c.moduleName === "Monthly Target Quotas");
    expect(targetCheck).toBeDefined();
    expect(targetCheck.requiredState).toBe("Locked & Approved");

    // Verify Scheme Summaries
    expect(mayRun.schemeSummaries.length).toBe(4);
    const salesScheme = mayRun.schemeSummaries.find((s: any) => s.schemeCode === "SCH-SLS-2026");
    expect(salesScheme).toBeDefined();
    expect(salesScheme.schemeName).toBe("Retail Showroom Sales Incentive");
    expect(salesScheme.participants).toBe(12);
    expect(salesScheme.netPayable).toBe(780000);

    // Verify Warnings & Exception Audit
    expect(mayRun.warnings.length).toBe(5);
    const attWarning = mayRun.warnings.find((w: any) => w.code === "WRN-ATT-04");
    expect(attWarning).toBeDefined();
    expect(attWarning.severity).toBe("High");
    expect(attWarning.participantName).toContain("Dilshan Madusanka");

    // Verify Execution Logs
    expect(mayRun.logs.length).toBeGreaterThanOrEqual(9);
    const firstLog = mayRun.logs.find((l: any) => l.message.includes("Engine initialized"));
    expect(firstLog).toBeDefined();

    // Verify April 2026 Final Approved & Posted Run
    const aprRun = data.runs.find((r: any) => r.id === "RUN-2026-04-FIN-01");
    expect(aprRun).toBeDefined();
    expect(aprRun.period).toBe("April 2026");
    expect(aprRun.runType).toBe("Final Calculation");
    expect(aprRun.status).toBe("Posted");
    expect(aprRun.totalNetPayable).toBeGreaterThanOrEqual(3800000);
  });

  it("READ BY ID: fetches single calculation run by ID", async () => {
    const req = new Request("http://localhost:3001/api/incentives/calculation-runs/RUN-2026-05-PRE-01", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.run.id).toBe("RUN-2026-05-PRE-01");
    expect(data.run.schemeSummaries.length).toBe(4);
  });

  it("CRUD & LIFECYCLE: creates run, updates status through approval pipeline, updates values, and deletes run", async () => {
    const testRunId = `RUN-TEST-${Date.now()}`;

    // 1. CREATE
    const createReq = new Request("http://localhost:3001/api/incentives/calculation-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testRunId,
        runNo: testRunId,
        period: "June 2026",
        division: "Consumer Electronics",
        selectedSchemes: "Retail Showroom Sales Incentive",
        runType: "Simulation",
        dataCutoff: "2026-06-30 23:59:59",
        status: "Draft",
        runBy: "Vitest Automated Runner",
        startedAt: "2026-06-30 10:00:00",
        finishedAt: "2026-06-30 10:00:45",
        totalParticipants: 5,
        totalDocsRead: 250,
        totalGrossCommission: 300000,
        totalTargetIncentive: 150000,
        totalPenalty: 10000,
        totalNetPayable: 440000,
        notes: "Automated engine test run",
        readinessChecks: [
          {
            id: `chk-${testRunId}-1`,
            moduleName: "Monthly Target Quotas",
            requiredState: "Locked & Approved",
            currentState: "Locked & Approved",
            isReady: true,
            signer: "Tester",
            lastUpdated: "2026-06-30 09:00:00",
          },
        ],
        schemeSummaries: [
          {
            schemeCode: "SCH-SLS-2026",
            schemeName: "Retail Showroom Sales Incentive",
            division: "Consumer Electronics",
            participants: 5,
            documentsRead: 250,
            grossCommission: 300000,
            targetIncentive: 150000,
            penalty: 10000,
            netPayable: 440000,
            warningsCount: 0,
          },
        ],
        warnings: [],
        logs: [
          {
            id: `log-${testRunId}-1`,
            timestamp: "10:00:00",
            level: "INFO",
            message: "Test run created.",
          },
        ],
      }),
    });

    const createRes = await handleApiRequest(createReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.run.id).toBe(testRunId);
    expect(createData.run.status).toBe("Draft");

    // 2. STATUS TRANSITION 1: Draft -> Calculated
    const calcStatusReq = new Request(
      `http://localhost:3001/api/incentives/calculation-runs/${testRunId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Calculated",
          actorName: "Incentive Supervisor",
          notes: "Calculation executed successfully",
        }),
      }
    );
    const calcRes = await handleApiRequest(calcStatusReq);
    expect(calcRes.status).toBe(200);
    const calcData = await calcRes.json();
    expect(calcData.run.status).toBe("Calculated");

    // 3. STATUS TRANSITION 2: Calculated -> Submitted
    const submitReq = new Request(
      `http://localhost:3001/api/incentives/calculation-runs/${testRunId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Submitted",
          actorName: "Lakmal Perera",
          notes: "Submitted for Executive & Finance sign-off",
        }),
      }
    );
    const submitRes = await handleApiRequest(submitReq);
    expect(submitRes.status).toBe(200);
    const submitData = await submitRes.json();
    expect(submitData.run.status).toBe("Submitted");

    // 4. UPDATE RUN (PUT)
    const updateReq = new Request(`http://localhost:3001/api/incentives/calculation-runs/${testRunId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: "Updated run notes via PUT",
        totalNetPayable: 445000,
      }),
    });
    const updateRes = await handleApiRequest(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.run.notes).toBe("Updated run notes via PUT");

    // 5. DELETE RUN
    const deleteReq = new Request(`http://localhost:3001/api/incentives/calculation-runs/${testRunId}`, {
      method: "DELETE",
    });
    const deleteRes = await handleApiRequest(deleteReq);
    expect(deleteRes.status).toBe(200);

    // 6. VERIFY 404
    const getDeletedReq = new Request(
      `http://localhost:3001/api/incentives/calculation-runs/${testRunId}`,
      { method: "GET" }
    );
    const getDeletedRes = await handleApiRequest(getDeletedReq);
    expect(getDeletedRes.status).toBe(404);
  });
});
