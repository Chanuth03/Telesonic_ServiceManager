import { describe, it, expect } from "vitest";
import { handleApiRequest } from "@/lib/api-handler";

describe("PostgreSQL Division Master API (Master Scheme Setup)", () => {
  it("READ: fetches seeded divisions across corporate operating units", async () => {
    const req = new Request("http://localhost:3001/api/incentives/divisions", {
      method: "GET",
    });

    const res = await handleApiRequest(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThanOrEqual(4);

    // Verify DIV-RLC
    const rlc = data.items.find((i: any) => i.id === "DIV-RLC");
    expect(rlc).toBeDefined();
    expect(rlc.divisionCode).toBe("RLC");
    expect(rlc.divisionName).toContain("Retail");
    expect(rlc.costCenterCode).toBe("CC-RLC-01");
    expect(rlc.status).toBe("Active");

    // Verify DIV-SRV
    const srv = data.items.find((i: any) => i.id === "DIV-SRV");
    expect(srv).toBeDefined();
    expect(srv.divisionCode).toBe("SRV");
    expect(srv.costCenterCode).toBe("CC-SRV-04");
  });

  it("FILTER: filters divisions by status and search keyword", async () => {
    // 1. Filter by status "Active"
    const reqActive = new Request("http://localhost:3001/api/incentives/divisions?status=Active", {
      method: "GET",
    });
    const resActive = await handleApiRequest(reqActive);
    const dataActive = await resActive.json();
    expect(dataActive.items.every((i: any) => i.status === "Active")).toBe(true);

    // 2. Search keyword "Retail"
    const reqSearch = new Request("http://localhost:3001/api/incentives/divisions?search=Retail", {
      method: "GET",
    });
    const resSearch = await handleApiRequest(reqSearch);
    const dataSearch = await resSearch.json();
    expect(dataSearch.items.length).toBeGreaterThanOrEqual(1);
    expect(dataSearch.items.some((i: any) => i.divisionName.includes("Retail"))).toBe(true);
  });

  it("CRUD: creates, reads by ID, updates, and deletes a custom division", async () => {
    const customDiv = {
      id: "DIV-TEST-99",
      divisionCode: "DIV-TEST-99",
      divisionName: "Test Renewable Energy Division",
      description: "Solar inverters and institutional power installation teams",
      hodName: "Test HOD Sunimal",
      hodEmail: "sunimal.test@telesonic.lk",
      costCenterCode: "CC-SOL-99",
      status: "Active",
    };

    // 1. CREATE
    const reqCreate = new Request("http://localhost:3001/api/incentives/divisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customDiv),
    });
    const resCreate = await handleApiRequest(reqCreate);
    expect(resCreate.status).toBe(201);
    const dataCreate = await resCreate.json();
    expect(dataCreate.success).toBe(true);
    expect(dataCreate.item.divisionCode).toBe("DIV-TEST-99");

    // 2. READ BY ID
    const reqGet = new Request("http://localhost:3001/api/incentives/divisions/DIV-TEST-99", {
      method: "GET",
    });
    const resGet = await handleApiRequest(reqGet);
    expect(resGet.status).toBe(200);
    const dataGet = await resGet.json();
    expect(dataGet.item.divisionName).toBe("Test Renewable Energy Division");

    // 3. UPDATE
    const reqUpdate = new Request("http://localhost:3001/api/incentives/divisions/DIV-TEST-99", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        divisionName: "Renewable Energy & B2B Solutions",
        costCenterCode: "CC-SOL-100",
      }),
    });
    const resUpdate = await handleApiRequest(reqUpdate);
    expect(resUpdate.status).toBe(200);
    const dataUpdate = await resUpdate.json();
    expect(dataUpdate.item.divisionName).toBe("Renewable Energy & B2B Solutions");
    expect(dataUpdate.item.costCenterCode).toBe("CC-SOL-100");

    // 4. DELETE
    const reqDelete = new Request("http://localhost:3001/api/incentives/divisions/DIV-TEST-99", {
      method: "DELETE",
    });
    const resDelete = await handleApiRequest(reqDelete);
    expect(resDelete.status).toBe(200);
    const dataDelete = await resDelete.json();
    expect(dataDelete.success).toBe(true);

    // Verify not found after delete
    const reqVerify = new Request("http://localhost:3001/api/incentives/divisions/DIV-TEST-99", {
      method: "GET",
    });
    const resVerify = await handleApiRequest(reqVerify);
    expect(resVerify.status).toBe(404);
  });

  it("URL ENCODING: handles division IDs with spaces and URL encoding in PUT and DELETE", async () => {
    // 1. Create division with spaces in code
    const divWithSpaces = {
      id: "DIV-SOLAR ENERGY",
      divisionCode: "SOLAR ENERGY",
      divisionName: "Solar Energy & Micro-Grid Systems",
      description: "Industrial rooftops and inverter installation",
      hodName: "Chathuni Jayathilake",
      hodEmail: "chathuni.j@telesonic.lk",
      costCenterCode: "CC-SOL-09",
      status: "Active",
    };

    const reqCreate = new Request("http://localhost:3001/api/incentives/divisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(divWithSpaces),
    });
    const resCreate = await handleApiRequest(reqCreate);
    expect(resCreate.status).toBe(201);

    // 2. Update with encoded URL (%20)
    const reqUpdate = new Request("http://localhost:3001/api/incentives/divisions/DIV-SOLAR%20ENERGY", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        divisionName: "Solar Energy & Hybrid Inverter Systems",
        status: "Inactive",
      }),
    });
    const resUpdate = await handleApiRequest(reqUpdate);
    expect(resUpdate.status).toBe(200);
    const dataUpdate = await resUpdate.json();
    expect(dataUpdate.success).toBe(true);
    expect(dataUpdate.item.divisionName).toBe("Solar Energy & Hybrid Inverter Systems");
    expect(dataUpdate.item.status).toBe("Inactive");

    // 3. Delete with encoded URL
    const reqDelete = new Request("http://localhost:3001/api/incentives/divisions/DIV-SOLAR%20ENERGY", {
      method: "DELETE",
    });
    const resDelete = await handleApiRequest(reqDelete);
    expect(resDelete.status).toBe(200);
  });
});
