const fs = require('fs');

const batch4Endpoints = `
    // =========================================================================
    // 29. /api/project-budgets - Dedicated Project and G/L Budget (MST-23)
    // =========================================================================
    if (path === "/api/project-budgets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).projectBudgetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Budget not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, budget: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (projectCode) where.projectCode = projectCode;
        if (search) {
          where.OR = [
            { projectCode: { contains: search, mode: "insensitive" } },
            { projectName: { contains: search, mode: "insensitive" } },
            { customer: { contains: search, mode: "insensitive" } },
            { projectManager: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, budgets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const projectCode = String(body.projectCode || "").trim();
        const projectName = String(body.projectName || "").trim();
        const customer = String(body.customer || "").trim();
        const projectManager = String(body.projectManager || "").trim();

        if (!projectCode || !projectName || !customer || !projectManager) {
          return new Response(JSON.stringify({ error: "Project Code, Name, Customer, and Project Manager are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { projectCode } });

        const status = String(body.status || "Active").trim();
        const payloadData = {
          projectCode,
          projectName,
          customer,
          projectManager,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budgetVersion: body.budgetVersion !== undefined && body.budgetVersion !== null ? parseInt(String(body.budgetVersion), 10) : 1,
          versionStatus: body.versionStatus || "Draft",
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, budget: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else if (projectCode) {
          await delegate.deleteMany({ where: { projectCode } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Project Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 30. /api/cost-element-mappings - Dedicated Cost Element / G/L Mapping (MST-24)
    // =========================================================================
    if (path === "/api/cost-element-mappings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).costElementMappingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Mapping not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, mapping: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (costElement) where.costElement = costElement;
        if (search) {
          where.OR = [
            { costElement: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { glAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, mappings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const costElement = String(body.costElement || "").trim();
        const description = String(body.description || "").trim();
        const glAccount = String(body.glAccount || "").trim();

        if (!costElement || !description || !glAccount) {
          return new Response(JSON.stringify({ error: "Cost Element, Description, and G/L Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { costElement } });

        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          costElement,
          description,
          glAccount,
          revenueCost: body.revenueCost || "Expense",
          requiresCallRef: body.requiresCallRef || "Yes",
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, mapping: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else if (costElement) {
          await delegate.deleteMany({ where: { costElement } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Cost Element is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 31. /api/labour-rates - Dedicated Labour Rates (MST-25)
    // =========================================================================
    if (path === "/api/labour-rates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).labourRateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Rate not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, rate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (rateCode) where.rateCode = rateCode;
        if (search) {
          where.OR = [
            { rateCode: { contains: search, mode: "insensitive" } },
            { technicianType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, rates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const rateCode = String(body.rateCode || "").trim();
        const technicianType = String(body.technicianType || "").trim();
        const normalRate = body.normalRate !== undefined && body.normalRate !== null ? parseFloat(String(body.normalRate).replace(/,/g, "")) : 0;

        if (!rateCode || !technicianType || isNaN(normalRate)) {
          return new Response(JSON.stringify({ error: "Rate Code, Technician Type, and valid Normal Rate are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { rateCode } });

        const overtimeRate = body.overtimeRate !== undefined && body.overtimeRate !== null ? parseFloat(String(body.overtimeRate).replace(/,/g, "")) : 0;
        const subcontractRate = body.subcontractRate !== undefined && body.subcontractRate !== null ? parseFloat(String(body.subcontractRate).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          rateCode,
          technicianType,
          normalRate,
          overtimeRate,
          subcontractRate,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, rate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else if (rateCode) {
          await delegate.deleteMany({ where: { rateCode } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rate Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 32. /api/franchise-warehouses - Dedicated Franchise & Warehouse (MST-26)
    // =========================================================================
    if (path === "/api/franchise-warehouses") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).franchiseWarehouseMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Franchise warehouse not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warehouse: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (franchiseBp) where.franchiseBp = franchiseBp;
        if (search) {
          where.OR = [
            { franchiseBp: { contains: search, mode: "insensitive" } },
            { franchiseName: { contains: search, mode: "insensitive" } },
            { warehouse: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warehouses: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const franchiseBp = String(body.franchiseBp || "").trim();
        const franchiseName = String(body.franchiseName || "").trim();
        const warehouse = String(body.warehouse || "").trim();

        if (!franchiseBp || !franchiseName || !warehouse) {
          return new Response(JSON.stringify({ error: "Franchise BP, Name, and Warehouse are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { franchiseBp } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          franchiseBp,
          franchiseName,
          warehouse,
          stockOwnership: body.stockOwnership || "Telesonic Consignment Stock",
          region: body.region || null,
          countFrequency: body.countFrequency || "Monthly Physical Audit",
          auditor: body.auditor || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warehouse: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else if (franchiseBp) {
          await delegate.deleteMany({ where: { franchiseBp } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Franchise BP is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 33. /api/deviation-reasons - Dedicated Deviation Reasons (MST-27)
    // =========================================================================
    if (path === "/api/deviation-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).deviationReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();

        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const qtyThreshold = body.qtyThreshold !== undefined && body.qtyThreshold !== null ? parseInt(String(body.qtyThreshold), 10) : 1;
        const valueThresholdLkr = body.valueThresholdLkr !== undefined && body.valueThresholdLkr !== null ? parseFloat(String(body.valueThresholdLkr).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          recoverableFromFranchise: body.recoverableFromFranchise || "No (Telesonic Absorption)",
          qtyThreshold,
          valueThresholdLkr,
          escalationRecipients: body.escalationRecipients || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 34. /api/export-permissions - Dedicated Export Permissions (MST-28)
    // =========================================================================
    if (path === "/api/export-permissions") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).exportPermissionMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Permission not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, permission: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (role) where.role = role;
        if (reportGrid) where.reportGrid = reportGrid;
        if (search) {
          where.OR = [
            { role: { contains: search, mode: "insensitive" } },
            { reportGrid: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, permissions: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const role = String(body.role || "").trim();
        const reportGrid = String(body.reportGrid || "").trim();

        if (!role || !reportGrid) {
          return new Response(JSON.stringify({ error: "Role and Target Report / Grid are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) {
          existing = await delegate.findUnique({
            where: {
              role_reportGrid: { role, reportGrid },
            },
          });
        }

        const rowLimit = body.rowLimit !== undefined && body.rowLimit !== null ? parseInt(String(body.rowLimit), 10) : 5000;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          role,
          reportGrid,
          excel: body.excel || "Yes",
          pdf: body.pdf || "Yes",
          restrictedColumns: body.restrictedColumns || null,
          rowLimit,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, permission: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else if (role && reportGrid) {
          await delegate.deleteMany({ where: { role, reportGrid } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "ID or (Role and Report Grid) required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 35. /api/google-meet-settings - Dedicated Google Meet Settings (MST-29)
    // =========================================================================
    if (path === "/api/google-meet-settings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).googleMeetSettingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Setting not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, setting: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (workspaceDomain) where.workspaceDomain = workspaceDomain;
        if (search) {
          where.OR = [
            { workspaceDomain: { contains: search, mode: "insensitive" } },
            { organiserAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, settings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const workspaceDomain = String(body.workspaceDomain || "").trim();
        const organiserAccount = String(body.organiserAccount || "").trim();

        if (!workspaceDomain || !organiserAccount) {
          return new Response(JSON.stringify({ error: "Workspace Domain and Organiser Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { workspaceDomain } });

        const defaultDuration = body.defaultDuration !== undefined && body.defaultDuration !== null ? parseInt(String(body.defaultDuration), 10) : 45;
        const retryCount = body.retryCount !== undefined && body.retryCount !== null ? parseInt(String(body.retryCount), 10) : 3;
        const enabledVal = String(body.enabled || "Yes").trim();
        const computedStatus = enabledVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          workspaceDomain,
          organiserAccount,
          authMethod: body.authMethod || "Google Cloud Service Account JWT",
          defaultDuration,
          inviteCustomer: body.inviteCustomer || "Yes",
          inviteFranchise: body.inviteFranchise || "Yes",
          retryCount,
          enabled: enabledVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, setting: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else if (workspaceDomain) {
          await delegate.deleteMany({ where: { workspaceDomain } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Workspace Domain is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 36. /api/equipment-category-attributes - Dedicated Category Attributes (MST-30)
    // =========================================================================
    if (path === "/api/equipment-category-attributes") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentCategoryAttributeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Category not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, category: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (categoryCode) where.categoryCode = categoryCode;
        if (search) {
          where.OR = [
            { categoryCode: { contains: search, mode: "insensitive" } },
            { categoryName: { contains: search, mode: "insensitive" } },
            { industryGroup: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, categories: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const categoryCode = String(body.categoryCode || "").trim();
        const categoryName = String(body.categoryName || "").trim();

        if (!categoryCode || !categoryName) {
          return new Response(JSON.stringify({ error: "Category Code and Category Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { categoryCode } });

        const defaultInterval = body.defaultInterval !== undefined && body.defaultInterval !== null ? parseInt(String(body.defaultInterval), 10) : 3;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          categoryCode,
          categoryName,
          industryGroup: body.industryGroup || null,
          multiComponent: body.multiComponent || "No",
          meterType: body.meterType || "None",
          defaultIntervalBasis: body.defaultIntervalBasis || "Months (Calendar)",
          defaultInterval,
          checklistSet: body.checklistSet || null,
          warrantyRule: body.warrantyRule || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, category: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else if (categoryCode) {
          await delegate.deleteMany({ where: { categoryCode } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Category Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 37. /api/tool-vehicle-assets - Dedicated Tools, Boxes & Vehicles (MST-31)
    // =========================================================================
    if (path === "/api/tool-vehicle-assets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).toolVehicleAssetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Asset not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, asset: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (assetId) where.assetId = assetId;
        if (search) {
          where.OR = [
            { assetId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { holder: { contains: search, mode: "insensitive" } },
            { vehicleRegNo: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, assets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const assetId = String(body.assetId || "").trim();
        const type = String(body.type || "").trim();
        const description = String(body.description || "").trim();

        if (!assetId || !type || !description) {
          return new Response(JSON.stringify({ error: "Asset ID, Type, and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { assetId } });

        const meterKm = body.meterKm !== undefined && body.meterKm !== null ? parseInt(String(body.meterKm), 10) : null;
        const status = String(body.status || "Available in Stores").trim();

        const payloadData = {
          assetId,
          type,
          description,
          holder: body.holder || null,
          vehicleRegNo: body.vehicleRegNo || null,
          meterKm,
          licenceExpiry: body.licenceExpiry ? new Date(body.licenceExpiry) : null,
          insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, asset: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else if (assetId) {
          await delegate.deleteMany({ where: { assetId } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Asset ID is required" }), { status: 400, headers });
        }
      }
    }
`;

let apiHandler = fs.readFileSync('src/lib/api-handler.ts', 'utf8').replace(/\r\n/g, '\n');
const target = '    // 19. /api/masters — Unified CRUD for all Master Screens (MST-13 to MST-31) in PostgreSQL';

if (apiHandler.includes(target)) {
  apiHandler = apiHandler.replace(target, batch4Endpoints + '\n' + target);
  fs.writeFileSync('src/lib/api-handler.ts', apiHandler, 'utf8');
  console.log('Successfully injected Batch 4 endpoints into api-handler.ts');
} else {
  console.error('Target not found in api-handler.ts');
  process.exit(1);
}

