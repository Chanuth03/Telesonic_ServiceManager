    // 11. /api/serials — Dedicated Serial Number Register and Lifecycle Master (MST-05 / O1-SCR-MST-05)
    if (path === "/api/serials") {
      const urlParams = new URL(request.url).searchParams;
      const serialDelegate = (prisma as any).serialRegister;

      if (method === "GET") {
        const id = urlParams.get("id");
        const serialNo = urlParams.get("serialNo");
        const itemId = urlParams.get("itemId");
        const customerId = urlParams.get("customerId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const serial = await serialDelegate.findUnique({
            where: { id: Number(id) },
            include: { item: true, customer: true, site: true },
          });
          if (!serial) {
            return new Response(JSON.stringify({ error: "Serial not found" }), { status: 404, headers });
          }
          return new Response(JSON.stringify({ success: true, serial }), { status: 200, headers });
        }

        const where: any = {};
        if (serialNo) where.serialNo = serialNo;
        if (itemId) where.itemId = Number(itemId);
        if (customerId) where.customerId = Number(customerId);
        if (search) {
          where.OR = [
            { serialNo: { contains: search, mode: "insensitive" } },
            { itemName: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { siteName: { contains: search, mode: "insensitive" } },
            { systemId: { contains: search, mode: "insensitive" } },
          ];
        }

        const serials = await serialDelegate.findMany({
          where,
          include: {
            item: { select: { id: true, itemCode: true, itemName: true } },
            customer: { select: { id: true, customerCode: true, customerName: true } },
            site: { select: { id: true, siteCode: true, siteName: true } },
          },
          orderBy: { id: "asc" },
        });

        const enriched = serials.map((s: any) => ({
          ...s,
          item: s.item ? `${s.item.itemCode} - ${s.item.itemName}` : s.itemName || s.itemCode || "—",
          customer: s.customer ? s.customer.customerName : s.customerName || "—",
          site: s.site ? s.site.siteName : s.siteName || "—",
        }));

        return new Response(JSON.stringify({ success: true, serials: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const serialNo = String(body.serialNo || "").trim();
        if (!serialNo) {
          return new Response(JSON.stringify({ error: "Serial No. is required" }), { status: 400, headers });
        }

        let itemId = body.itemId ? Number(body.itemId) : undefined;
        let itemCode = body.itemCode ? String(body.itemCode).trim() : "";
        let itemName = body.itemName ? String(body.itemName).trim() : "";

        // Auto-match item from dropdown if item string provided
        if (!itemId && body.item) {
          const itemStr = String(body.item).trim();
          const matchCode = itemStr.split(" ")[0];
          const matchedItem = await (prisma as any).item.findFirst({
            where: {
              OR: [
                { itemCode: { equals: matchCode, mode: "insensitive" } },
                { itemName: { contains: itemStr, mode: "insensitive" } },
              ],
            },
          });
          if (matchedItem) {
            itemId = matchedItem.id;
            itemCode = matchedItem.itemCode;
            itemName = matchedItem.itemName;
          }
        }

        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerName = body.customerName ? String(body.customerName).trim() : "";
        if (!customerId && body.customer) {
          const custStr = String(body.customer).trim();
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
        if (!siteId && body.site) {
          const siteStr = String(body.site).trim();
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
          existing = await serialDelegate.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await serialDelegate.findUnique({ where: { serialNo } });
        }

        const payloadData = {
          serialNo,
          itemId: itemId || null,
          itemCode: itemCode || null,
          itemName: itemName || null,
          status: body.status || "Available",
          warehouse: body.warehouse || null,
          customerId: customerId || null,
          customerName: customerName || null,
          siteId: siteId || null,
          siteName: siteName || null,
          systemId: body.systemId || null,
          componentRole: body.componentRole || null,
          warrantyStart: body.warrantyStart || null,
          replacesSerial: body.replacesSerial || null,
          replacedBy: body.replacedBy || null,
        };

        let saved: any;
        if (existing) {
          saved = await serialDelegate.update({
            where: { id: existing.id },
            data: payloadData,
            include: { item: true, customer: true, site: true },
          });
        } else {
          saved = await serialDelegate.create({
            data: payloadData,
            include: { item: true, customer: true, site: true },
          });
        }

        const enriched = {
          ...saved,
          item: saved.item ? `${saved.item.itemCode} - ${saved.item.itemName}` : saved.itemName || saved.itemCode || "—",
          customer: saved.customer ? saved.customer.customerName : saved.customerName || "—",
          site: saved.site ? saved.site.siteName : saved.siteName || "—",
        };

        return new Response(JSON.stringify({ success: true, serial: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const serialNo = urlParams.get("serialNo");

        if (id) {
          await serialDelegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Serial deleted" }), { status: 200, headers });
        } else if (serialNo) {
          await serialDelegate.deleteMany({ where: { serialNo } });
          return new Response(JSON.stringify({ success: true, message: "Serial deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Serial ID or Serial No. is required" }), { status: 400, headers });
        }
      }
    }


