    // 13. /api/other-brand-equipments — Dedicated Other-Brand Equipment Master (MST-07 / O1-SCR-MST-07)
    if (path === "/api/other-brand-equipments") {
      const urlParams = new URL(request.url).searchParams;
      const otherDelegate = (prisma as any).otherBrandEquipment;

      if (method === "GET") {
        const id = urlParams.get("id");
        const equipmentId = urlParams.get("equipmentId");
        const customerId = urlParams.get("customerId");
        const siteId = urlParams.get("siteId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const equip = await otherDelegate.findUnique({
            where: { id: Number(id) },
            include: { customer: true, site: true },
          });
          if (!equip) {
            return new Response(JSON.stringify({ error: "Equipment not found" }), { status: 404, headers });
          }
          return new Response(JSON.stringify({ success: true, equipment: equip }), { status: 200, headers });
        }

        const where: any = {};
        if (equipmentId) where.equipmentId = equipmentId;
        if (customerId) where.customerId = Number(customerId);
        if (siteId) where.siteId = Number(siteId);
        if (search) {
          where.OR = [
            { equipmentId: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { siteName: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
            { serial: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await otherDelegate.findMany({
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

        return new Response(JSON.stringify({ success: true, equipments: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const equipmentId = String(body.equipmentId || "").trim();
        if (!equipmentId) {
          return new Response(JSON.stringify({ error: "Equipment ID is required" }), { status: 400, headers });
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
            where: {
              siteName: { contains: siteStr, mode: "insensitive" },
            },
          });
          if (matchedSite) {
            siteId = matchedSite.id;
            siteName = matchedSite.siteName;
          }
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) {
          existing = await otherDelegate.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await otherDelegate.findUnique({ where: { equipmentId } });
        }

        const payloadData = {
          equipmentId,
          customerId: customerId || null,
          customerName: customerName || null,
          siteId: siteId || null,
          siteName: siteName || null,
          equipmentCategory: body.equipmentCategory || "Air Conditioning",
          brand: body.brand || "Other",
          model: body.model || "Standard",
          serial: body.serial || null,
          serialUnknown: body.serialUnknown || "No",
          previousSupplier: body.previousSupplier || null,
          takeoverDate: body.takeoverDate || null,
          takeoverCondition: body.takeoverCondition || null,
          status: body.status || "Active",
        };

        let saved: any;
        if (existing) {
          saved = await otherDelegate.update({
            where: { id: existing.id },
            data: payloadData,
            include: { customer: true, site: true },
          });
        } else {
          saved = await otherDelegate.create({
            data: payloadData,
            include: { customer: true, site: true },
          });
        }

        const enriched = {
          ...saved,
          customer: saved.customer ? saved.customer.customerName : saved.customerName || "—",
          site: saved.site ? saved.site.siteName : saved.siteName || "—",
        };

        return new Response(JSON.stringify({ success: true, equipment: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const equipmentId = urlParams.get("equipmentId");

        if (id) {
          await otherDelegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Equipment deleted" }), { status: 200, headers });
        } else if (equipmentId) {
          await otherDelegate.deleteMany({ where: { equipmentId } });
          return new Response(JSON.stringify({ success: true, message: "Equipment deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Equipment ID is required" }), { status: 400, headers });
        }
      }
    }


