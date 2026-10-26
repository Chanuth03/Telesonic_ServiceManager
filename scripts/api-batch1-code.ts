    // =========================================================================
    // 14. /api/equipment-systems — Dedicated Multi-Component Equipment Systems (MST-08)
    // =========================================================================
    if (path === "/api/equipment-systems") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentSystem;

      if (method === "GET") {
        const id = urlParams.get("id");
        const systemId = urlParams.get("systemId");
        const customerId = urlParams.get("customerId");
        const siteId = urlParams.get("siteId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const record = await delegate.findUnique({
            where: { id: Number(id) },
            include: { customer: true, site: true },
          });
          if (!record) return new Response(JSON.stringify({ error: "System not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, system: record }), { status: 200, headers });
        }

        const where: any = {};
        if (systemId) where.systemId = systemId;
        if (customerId) where.customerId = Number(customerId);
        if (siteId) where.siteId = Number(siteId);
        if (search) {
          where.OR = [
            { systemId: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { siteName: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({
          where,
          include: {
            customer: { select: { id: true, customerCode: true, customerName: true } },
            site: { select: { id: true, siteCode: true, siteName: true } },
          },
          orderBy: { id: "asc" },
        });

        const enriched = list.map((e: any) => ({
          ...e,
          customer: e.customer ? e.customer.customerName : e.customerName || "—",
          site: e.site ? e.site.siteName : e.siteName || "—",
        }));

        return new Response(JSON.stringify({ success: true, systems: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const systemId = String(body.systemId || "").trim();
        if (!systemId) {
          return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400, headers });
        }

        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerName = body.customerName ? String(body.customerName).trim() : "";
        if (!customerId && (body.customer || body.customerName)) {
          const custStr = String(body.customer || body.customerName).trim();
          const matchedCust = await (prisma as any).customer.findFirst({
            where: {
              OR: [
                { customerName: { contains: custStr, mode: "insensitive" } },
                { customerCode: { equals: custStr.split(" ")[0], mode: "insensitive" } },
              ],
            },
          });
          if (matchedCust) {
            customerId = matchedCust.id;
            customerName = matchedCust.customerName;
          }
        }

        let siteId = body.siteId ? Number(body.siteId) : undefined;
        let siteName = body.siteName ? String(body.siteName).trim() : "";
        if (!siteId && (body.site || body.siteName)) {
          const siteStr = String(body.site || body.siteName).trim();
          const matchedSite = await (prisma as any).site.findFirst({
            where: { siteName: { contains: siteStr, mode: "insensitive" } },
          });
          if (matchedSite) {
            siteId = matchedSite.id;
            siteName = matchedSite.siteName;
          }
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { systemId } });

        const payloadData = {
          systemId,
          customerId: customerId || null,
          customerName: customerName || null,
          siteId: siteId || null,
          siteName: siteName || null,
          location: body.location || null,
          equipmentCategory: body.equipmentCategory || "VRF Multi-Zone System",
          status: body.status || "Active",
          installedDate: body.installedDate || null,
          commissionedDate: body.commissionedDate || null,
          warrantyStart: body.warrantyStart || null,
          warrantyEnd: body.warrantyEnd || null,
          contract: body.contract || null,
          project: body.project || null,
        };

        let saved: any;
        if (existing) {
          saved = await delegate.update({
            where: { id: existing.id },
            data: payloadData,
            include: { customer: true, site: true },
          });
        } else {
          saved = await delegate.create({
            data: payloadData,
            include: { customer: true, site: true },
          });
        }

        const enriched = {
          ...saved,
          customer: saved.customer ? saved.customer.customerName : saved.customerName || "—",
          site: saved.site ? saved.site.siteName : saved.siteName || "—",
        };

        return new Response(JSON.stringify({ success: true, system: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const systemId = urlParams.get("systemId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "System deleted" }), { status: 200, headers });
        } else if (systemId) {
          await delegate.deleteMany({ where: { systemId } });
          return new Response(JSON.stringify({ success: true, message: "System deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 15. /api/technicians — Dedicated Employee / Technician Master (MST-09)
    // =========================================================================
    if (path === "/api/technicians") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).technician;

      if (method === "GET") {
        const id = urlParams.get("id");
        const employeeId = urlParams.get("employeeId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Technician not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, technician: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (employeeId) where.employeeId = employeeId;
        if (search) {
          where.OR = [
            { employeeId: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { position: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
            { team: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, technicians: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const employeeId = String(body.employeeId || "").trim();
        const name = String(body.name || "").trim();
        if (!employeeId || !name) {
          return new Response(JSON.stringify({ error: "Employee ID and Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { employeeId } });

        const payloadData = {
          employeeId,
          name,
          position: body.position || "Field Technician",
          department: body.department || "Field Operations",
          branch: body.branch || "Colombo Head Office",
          mobile: body.mobile || null,
          technicianType: body.technicianType || "Direct In-House Staff",
          team: body.team || null,
          certifications: body.certifications || null,
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, technician: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const employeeId = urlParams.get("employeeId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Technician deleted" }), { status: 200, headers });
        } else if (employeeId) {
          await delegate.deleteMany({ where: { employeeId } });
          return new Response(JSON.stringify({ success: true, message: "Technician deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Employee ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 16. /api/subcontractors — Dedicated Subcontractor Master (MST-10)
    // =========================================================================
    if (path === "/api/subcontractors") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).subcontractor;

      if (method === "GET") {
        const id = urlParams.get("id");
        const vendorCode = urlParams.get("vendorCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Subcontractor not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, subcontractor: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (vendorCode) where.vendorCode = vendorCode;
        if (search) {
          where.OR = [
            { vendorCode: { contains: search, mode: "insensitive" } },
            { vendorName: { contains: search, mode: "insensitive" } },
            { subcontractorType: { contains: search, mode: "insensitive" } },
            { territory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, subcontractors: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const vendorCode = String(body.vendorCode || "").trim();
        const vendorName = String(body.vendorName || "").trim();
        if (!vendorCode || !vendorName) {
          return new Response(JSON.stringify({ error: "Vendor Code and Vendor Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { vendorCode } });

        const payloadData = {
          vendorCode,
          vendorName,
          subcontractorType: body.subcontractorType || "HVAC Contractor",
          territory: body.territory || "Western Province",
          paymentTerms: body.paymentTerms || "Net 30 Days",
          rating: body.rating !== undefined && body.rating !== null ? Number(body.rating) : 8.0,
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, subcontractor: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const vendorCode = urlParams.get("vendorCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Subcontractor deleted" }), { status: 200, headers });
        } else if (vendorCode) {
          await delegate.deleteMany({ where: { vendorCode } });
          return new Response(JSON.stringify({ success: true, message: "Subcontractor deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Vendor Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 17. /api/service-roles — Dedicated Service Role Master (MST-11)
    // =========================================================================
    if (path === "/api/service-roles") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).serviceRoleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const roleCode = urlParams.get("roleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Service Role not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, role: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (roleCode) where.roleCode = roleCode;
        if (search) {
          where.OR = [
            { roleCode: { contains: search, mode: "insensitive" } },
            { roleName: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, roles: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const roleCode = String(body.roleCode || "").trim();
        const roleName = String(body.roleName || "").trim();
        if (!roleCode || !roleName) {
          return new Response(JSON.stringify({ error: "Role Code and Role Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { roleCode } });

        const payloadData = {
          roleCode,
          roleName,
          internalSubcontractor: body.internalSubcontractor || "Both Internal and Subcontractor",
          incentiveEligible: body.incentiveEligible || "Yes",
          incentiveBasisRef: body.incentiveBasisRef || null,
          multiplePerCall: body.multiplePerCall || "No",
          active: body.active || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, role: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const roleCode = urlParams.get("roleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Service role deleted" }), { status: 200, headers });
        } else if (roleCode) {
          await delegate.deleteMany({ where: { roleCode } });
          return new Response(JSON.stringify({ success: true, message: "Service role deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Role Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 18. /api/service-types — Dedicated Service Type/Reason/Priority Master (MST-12)
    // =========================================================================
    if (path === "/api/service-types") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).serviceTypeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");
        const listType = urlParams.get("listType");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Record not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, serviceType: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (code) where.code = code;
        if (listType) where.listType = listType;
        if (search) {
          where.OR = [
            { code: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { listType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, serviceTypes: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const code = String(body.code || "").trim();
        const description = String(body.description || "").trim();
        if (!code || !description) {
          return new Response(JSON.stringify({ error: "Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { code } });

        const payloadData = {
          code,
          description,
          listType: body.listType || "Service Type",
          defaultPriority: body.defaultPriority || "P2 - Normal Schedule",
          checklistTemplate: body.checklistTemplate || null,
          slaRule: body.slaRule || null,
          chargeableDefault: body.chargeableDefault || "No",
          active: body.active || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, serviceType: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else if (code) {
          await delegate.deleteMany({ where: { code } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Code is required" }), { status: 400, headers });
        }
      }
    }


