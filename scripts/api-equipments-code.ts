    // 12. /api/equipments — Dedicated Equipment / Installed Base Master (MST-06 / O1-SCR-MST-06)
    if (path === "/api/equipments") {
      const urlParams = new URL(request.url).searchParams;
      const equipDelegate = (prisma as any).equipment;

      if (method === "GET") {
        const id = urlParams.get("id");
        const equipmentId = urlParams.get("equipmentId");
        const customerId = urlParams.get("customerId");
        const siteId = urlParams.get("siteId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const equip = await equipDelegate.findUnique({
            where: { id: Number(id) },
            include: { customer: true, site: true, serial: true },
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
            { serialNo: { contains: search, mode: "insensitive" } },
            { itemCategory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await equipDelegate.findMany({
          where,
          include: {
            customer: { select: { id: true, customerCode: true, customerName: true } },
            site: { select: { id: true, siteCode: true, siteName: true } },
            serial: { select: { id: true, serialNo: true, itemName: true } },
          },
          orderBy: { id: "asc" },
        });

        const enriched = list.map((e: any) => ({
          ...e,
          customer: e.customer ? e.customer.customerName : e.customerName || "—",
          site: e.site ? e.site.siteName : e.siteName || "—",
          serial: e.serial ? e.serial.serialNo : e.serialNo || "—",
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

        let serialId = body.serialId ? Number(body.serialId) : undefined;
        let serialNo = body.serialNo || body.serial ? String(body.serialNo || body.serial).trim() : "";
        if (!serialId && serialNo) {
          const matchedSerial = await (prisma as any).serialRegister.findFirst({
            where: {
              serialNo: { equals: serialNo, mode: "insensitive" },
            },
          });
          if (matchedSerial) {
            serialId = matchedSerial.id;
            serialNo = matchedSerial.serialNo;
          }
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) {
          existing = await equipDelegate.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await equipDelegate.findUnique({ where: { equipmentId } });
        }

        const payloadData = {
          equipmentId,
          customerId: customerId || null,
          customerName: customerName || null,
          siteId: siteId || null,
          siteName: siteName || null,
          itemCategory: body.itemCategory || "General Equipment",
          brand: body.brand || "Carrier",
          model: body.model || null,
          serialId: serialId || null,
          serialNo: serialNo || null,
          origin: body.origin || "Telesonic-originated",
          serviceProvider: body.serviceProvider || "Telesonic In-House SRE",
          installedDate: body.installedDate || null,
          commissionedDate: body.commissionedDate || null,
          warrantyTo: body.warrantyTo || null,
          relationship: body.relationship || "Active Under Warranty",
          systemId: body.systemId || null,
          meterReading: body.meterReading !== undefined && body.meterReading !== null ? Number(body.meterReading) : 0,
          status: body.status || "Installed",
        };

        let saved: any;
        if (existing) {
          saved = await equipDelegate.update({
            where: { id: existing.id },
            data: payloadData,
            include: { customer: true, site: true, serial: true },
          });
        } else {
          saved = await equipDelegate.create({
            data: payloadData,
            include: { customer: true, site: true, serial: true },
          });
        }

        const enriched = {
          ...saved,
          customer: saved.customer ? saved.customer.customerName : saved.customerName || "—",
          site: saved.site ? saved.site.siteName : saved.siteName || "—",
          serial: saved.serial ? saved.serial.serialNo : saved.serialNo || "—",
        };

        return new Response(JSON.stringify({ success: true, equipment: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const equipmentId = urlParams.get("equipmentId");

        if (id) {
          await equipDelegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Equipment deleted" }), { status: 200, headers });
        } else if (equipmentId) {
          await equipDelegate.deleteMany({ where: { equipmentId } });
          return new Response(JSON.stringify({ success: true, message: "Equipment deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Equipment ID is required" }), { status: 400, headers });
        }
      }
    }


