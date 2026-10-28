import { prisma } from "@/lib/prisma";

export async function getMasterDropdownOptions() {
  try {
    const [
      customers,
      contacts,
      sites,
      technicians,
      equipment,
      otherEquipments,
      systems,
      serials,
      items,
      subcontractors,
      serviceRoles,
      serviceTypes,
      holdReasons,
      repeatReasons,
      checklistTemplates,
      warrantyRules,
      contractTemplates,
      projectBudgets,
      costMappings,
      franchiseWarehouses,
      serviceRequests,
      jobs,
      trxRecords,
    ] = await Promise.all([
      prisma.customer.findMany({
        orderBy: { customerName: "asc" },
      }).catch(() => []),
      prisma.contactPerson.findMany({
        orderBy: { contactName: "asc" },
      }).catch(() => []),
      prisma.site.findMany({
        orderBy: { siteName: "asc" },
      }).catch(() => []),
      prisma.technician.findMany({
        orderBy: { name: "asc" },
      }).catch(() => []),
      prisma.equipment.findMany({
        where: { NOT: { status: "Retired" } },
        include: { customer: { select: { customerCode: true, customerName: true } } },
        orderBy: { id: "asc" },
      }).catch(() => []),
      prisma.otherBrandEquipment.findMany({
        include: { customer: { select: { customerCode: true, customerName: true } } },
        orderBy: { id: "asc" },
      }).catch(() => []),
      prisma.equipmentSystem.findMany({
        include: { customer: { select: { customerCode: true, customerName: true } } },
        orderBy: { id: "asc" },
      }).catch(() => []),
      prisma.serialRegister.findMany({
        orderBy: { serialNo: "asc" },
      }).catch(() => []),
      prisma.item.findMany({
        orderBy: { itemCode: "asc" },
      }).catch(() => []),
      prisma.subcontractor.findMany({
        orderBy: { companyName: "asc" },
      }).catch(() => []),
      prisma.serviceRoleMaster.findMany({
        orderBy: { roleCode: "asc" },
      }).catch(() => []),
      prisma.serviceTypeMaster.findMany({
        orderBy: { code: "asc" },
      }).catch(() => []),
      prisma.holdReasonMaster.findMany({
        orderBy: { reasonCode: "asc" },
      }).catch(() => []),
      prisma.repeatReasonMaster.findMany({
        orderBy: { reasonCode: "asc" },
      }).catch(() => []),
      prisma.checklistTemplateMaster.findMany({
        orderBy: { templateCode: "asc" },
      }).catch(() => []),
      prisma.warrantyRuleMaster.findMany({
        orderBy: { ruleCode: "asc" },
      }).catch(() => []),
      prisma.contractTemplateMaster.findMany({
        orderBy: { template: "asc" },
      }).catch(() => []),
      prisma.projectBudgetMaster.findMany({
        orderBy: { projectCode: "asc" },
      }).catch(() => []),
      prisma.costElementMappingMaster.findMany({
        orderBy: { costElement: "asc" },
      }).catch(() => []),
      prisma.franchiseWarehouseMaster.findMany({
        orderBy: { franchiseBp: "asc" },
      }).catch(() => []),
      prisma.serviceRequest.findMany({
        orderBy: { updatedAt: "desc" },
      }).catch(() => []),
      prisma.job.findMany({
        orderBy: { updatedAt: "desc" },
      }).catch(() => []),
      prisma.$queryRawUnsafe<Array<{
        id: number;
        process_key: string;
        record_no: string;
        customer: string | null;
        site: string | null;
        equipment: string | null;
        call_no: string | null;
        request_no: string | null;
        status: string;
        data: Record<string, unknown>;
      }>>(`SELECT * FROM "transaction_records" ORDER BY "updated_at" DESC`).catch(() => []),
    ]);

    const combinedEquipments = [
      ...equipment.map((e: any) => {
        const titleParts = [e.brand, e.model].filter(Boolean).join(" ");
        const refParts = [e.equipmentId, e.serialNo ? `SN: ${e.serialNo}` : null].filter(Boolean).join(" / ");
        const warrantyInfo = e.warrantyTo
          ? `${e.relationship || "Under Warranty"} (Valid to ${e.warrantyTo})`
          : e.relationship || "Active Under Warranty";
        return {
          label: titleParts ? `${titleParts} (${refParts})` : refParts || "Equipment",
          equipmentId: String(e.equipmentId || ""),
          brand: String(e.brand || ""),
          model: String(e.model || ""),
          serialNo: String(e.serialNo || ""),
          customerId: e.customerId as number | null,
          customerName: (e.customerName || e.customer?.customerName || null) as string | null,
          customerCode: (e.customer?.customerCode || null) as string | null,
          siteName: (e.siteName || null) as string | null,
          origin: String(e.origin || "Telesonic Sold"),
          entitlement: String(warrantyInfo),
        };
      }),
      ...otherEquipments.map((e: any) => {
        const titleParts = [e.brand, e.model].filter(Boolean).join(" ");
        const refParts = [e.equipmentId, e.serialNo ? `SN: ${e.serialNo}` : null].filter(Boolean).join(" / ");
        return {
          label: `${titleParts ? `${titleParts} (${refParts})` : refParts} [Other-Brand]`,
          equipmentId: String(e.equipmentId || ""),
          brand: String(e.brand || ""),
          model: String(e.model || ""),
          serialNo: String(e.serialNo || ""),
          customerId: e.customerId as number | null,
          customerName: (e.customerName || e.customer?.customerName || null) as string | null,
          customerCode: (e.customer?.customerCode || null) as string | null,
          siteName: (e.siteName || null) as string | null,
          origin: "Third-Party Sold",
          entitlement: String(e.serviceRelationship || "Chargeable / Out of Warranty"),
        };
      }),
    ];

    const serviceCallRecords = trxRecords.filter((r) => r.process_key === "service-calls");
    const serviceCallsList = [
      ...serviceCallRecords.map((r) => {
        const d = (r.data?.["formData"] as Record<string, unknown>) || r.data || {};
        return {
          callNo: r.record_no,
          label: `${r.record_no}${r.customer ? ` — ${r.customer}` : ""}`,
          requestNo: String(d["requestNo"] || r.request_no || ""),
          customer: String(d["customer"] || r.customer || ""),
          site: String(d["site"] || r.site || ""),
          equipmentSystem: String(d["equipmentSystem"] || r.equipment || ""),
          callType: String(d["callType"] || "Breakdown Repair"),
          priority: String(d["priority"] || "P2 - High"),
          entitlement: String(d["entitlement"] || "Under Warranty"),
          status: r.status,
          plannedDate: String(d["plannedDate"] || ""),
        };
      }),
      ...jobs
        .filter((j: any) => !serviceCallRecords.some((sc) => sc.record_no === j.id))
        .map((j: any) => ({
          callNo: String(j.id),
          label: `${j.id} — ${j.customerName}`,
          requestNo: "",
          customer: String(j.customerName || ""),
          site: String(j.siteAddress || j.town || ""),
          equipmentSystem: String(j.machine || j.equipment || ""),
          callType: "Breakdown Repair",
          priority: String(j.priority || "P2 - High"),
          entitlement: "Under Warranty",
          status: String(j.status || "Assigned"),
          plannedDate: "",
        })),
    ];

    const savedContracts = trxRecords
      .filter((r) => r.process_key === "service-contracts")
      .map((r) => `${r.record_no}${r.customer ? ` (${r.customer})` : ""}`);

    const savedClaims = trxRecords
      .filter((r) => r.process_key === "warranty-claims")
      .map((r) => `${r.record_no}${r.customer ? ` (${r.customer})` : ""}`);

    const savedStockCounts = trxRecords
      .filter((r) => r.process_key === "stock-counts")
      .map((r) => {
        const d = (r.data?.["formData"] as Record<string, unknown>) || r.data || {};
        return {
          countNo: r.record_no,
          label: `${r.record_no}${d["franchise"] ? ` — ${d["franchise"]}` : ""}`,
          franchise: String(d["franchise"] || ""),
          warehouse: String(d["warehouse"] || ""),
          status: r.status,
        };
      });

    const savedQuotations = trxRecords
      .filter((r) => r.process_key === "service-quotations")
      .map((r) => r.record_no);

    const serialStrings = [
      ...serials.map((s: any) => `${s.serialNo}${s.itemName ? ` (${s.itemName})` : ""}`),
      ...combinedEquipments
        .filter((e) => e.serialNo && !serials.some((s: any) => s.serialNo === e.serialNo))
        .map((e) => `${e.serialNo} (${e.brand} ${e.model})`),
    ];

    return {
      customers: customers.map((c: any) => `${c.customerName} (${c.customerCode})`),
      customerDetails: customers.map((c: any) => ({
        id: Number(c.id),
        code: String(c.customerCode),
        name: String(c.customerName),
        label: `${c.customerName} (${c.customerCode})`,
        origin: String(c.customerOrigin || "Telesonic Sold"),
        paymentHold: String(c.paymentHold || "No"),
      })),
      contacts: contacts.map((c: any) => ({
        label: `${c.contactName}${c.mobile ? ` (${c.mobile})` : ""}`,
        contactName: String(c.contactName || ""),
        customerCode: (c.customerCode || null) as string | null,
      })),
      sites: sites.map((s: any) => ({
        label: `${s.siteName}${s.addressLine1 || s.cityTown ? `, ${s.addressLine1 || s.cityTown}` : ""}`.trim(),
        siteName: String(s.siteName || ""),
        customerCode: (s.customerCode || null) as string | null,
        customerId: (s.customerId || null) as number | null,
      })),
      technicians: technicians.map((t: any) => `${t.name} (${t.employeeId})`),
      equipment: combinedEquipments,
      systems: systems.map((s: any) => ({
        label: `${s.systemId} — ${s.systemName}`,
        systemId: String(s.systemId || ""),
        systemName: String(s.systemName || ""),
        customerId: (s.customerId || null) as number | null,
        customerName: (s.customerName || s.customer?.customerName || null) as string | null,
        customerCode: (s.customer?.customerCode || null) as string | null,
      })),
      serials: serialStrings,
      items: items.map((i: any) => `${i.itemCode} - ${i.itemName}`),
      vendors: subcontractors.map((v: any) => `${v.companyName} (${v.subcontractorCode})`),
      warehouses: franchiseWarehouses.map((w: any) => `${w.warehouse} (${w.franchiseName})`),
      franchises: franchiseWarehouses.map((w: any) => `${w.franchiseName} (${w.franchiseBp})`),
      serviceRoles: serviceRoles.map((r: any) => `${r.roleName} (${r.roleCode})`),
      serviceTypes:
        serviceTypes.length > 0
          ? serviceTypes.map((st: any) => String(st.description))
          : [
              "Breakdown Repair",
              "Preventive Maintenance",
              "Installation & Commissioning",
              "Site Visit / Inspection Audit",
              "Warranty Claim Inspection",
            ],
      holdReasons: holdReasons.map((h: any) => `${h.description} (${h.reasonCode})`),
      repeatReasons: repeatReasons.map((r: any) => `${r.description} (${r.reasonCode})`),
      checklistTemplates: checklistTemplates.map((c: any) => `${c.name} (${c.templateCode})`),
      warrantyRules: warrantyRules.map((w: any) => `${w.ruleCode} — ${w.equipmentCategory} (${w.months}M)`),
      contracts: [
        ...savedContracts,
        ...contractTemplates.map((ct: any) => `${ct.template} — ${ct.contractKind}`),
      ],
      projects: projectBudgets.map((p: any) => ({
        label: `${p.projectCode} — ${p.projectName}`,
        projectCode: String(p.projectCode),
        projectName: String(p.projectName),
        customer: String(p.customer),
        budgetLkr: "18,500,000",
        actualLkr: "11,240,000",
        committedLkr: "3,150,000",
      })),
      glAccounts: costMappings.map((cm: any) => `${cm.glAccount} (${cm.costElement})`),
      serviceRequests: serviceRequests.map((sr: any) => ({
        requestNo: String(sr.requestNo || sr.id),
        label: `${sr.requestNo || sr.id} — ${sr.customer || sr.customerName || "Customer"}`,
        customer: String(sr.customer || sr.customerName || ""),
        contact: String(sr.contact || ""),
        site: String(sr.site || ""),
        equipmentSystem: String(sr.equipmentSystem || ""),
        requestType: String(sr.requestType || sr.callType || "Breakdown Repair"),
        priority: String(sr.priority || "P2 - High"),
        entitlement: String(sr.entitlement || "Under Warranty"),
        customerOrigin: String(sr.customerOrigin || "Telesonic Sold"),
        equipmentOrigin: String(sr.equipmentOrigin || "Telesonic Sold"),
      })),
      serviceCalls: serviceCallsList,
      warrantyClaims: savedClaims.length > 0 ? savedClaims : ["CLM-2026-1001"],
      stockCounts: savedStockCounts,
      documents: [
        ...serviceRequests.map((sr: any) => String(sr.requestNo || sr.id)),
        ...serviceCallsList.map((sc) => sc.callNo),
        ...savedQuotations,
        ...savedClaims,
        "SAP-INV-2026-88412",
        "SAP-DLV-2026-55301",
        "SAP-PO-2026-30914",
      ],
    };
  } catch (err) {
    console.error("[Master Options] Failed to fetch:", err);
    return {
      customers: [],
      customerDetails: [],
      contacts: [],
      sites: [],
      technicians: [],
      equipment: [],
      systems: [],
      serials: [],
      items: [],
      vendors: [],
      warehouses: [],
      franchises: [],
      serviceRoles: [],
      serviceTypes: [],
      holdReasons: [],
      repeatReasons: [],
      checklistTemplates: [],
      warrantyRules: [],
      contracts: [],
      projects: [],
      glAccounts: [],
      serviceRequests: [],
      serviceCalls: [],
      warrantyClaims: [],
      stockCounts: [],
      documents: [],
    };
  }
}
