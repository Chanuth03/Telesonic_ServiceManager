import { prisma } from "@/lib/prisma";

export async function getMasterDropdownOptions() {
  try {
    const [customers, contacts, sites, technicians, equipment, genericMasters] = await Promise.all([
      prisma.customer.findMany({
        where: { status: "Active" },
        select: { customerCode: true, customerName: true },
        orderBy: { customerName: "asc" },
      }).catch(() => []),
      prisma.contactPerson.findMany({
        select: { contactName: true, mobile: true, customerCode: true },
        orderBy: { contactName: "asc" },
      }).catch(() => []),
      prisma.site.findMany({
        where: { status: "Active" },
        select: { siteName: true, addressLine1: true, cityTown: true, customerCode: true },
        orderBy: { siteName: "asc" },
      }).catch(() => []),
      prisma.technician.findMany({
        where: { status: "Active" },
        select: { name: true, employeeId: true },
        orderBy: { name: "asc" },
      }).catch(() => []),
      prisma.equipment.findMany({
        where: { status: "Active" },
        select: { serialNo: true, brand: true, model: true },
        orderBy: { serialNo: "asc" },
      }).catch(() => []),
      prisma.masterRecord.findMany({
        select: { screenCode: true, recordKey: true, data: true },
      }).catch(() => []),
    ]);

    // Service Types from MST-14 or generic
    const serviceTypeOptions = genericMasters
      .filter((m) => m.screenCode === "MST-14")
      .map((m) => {
        const d = m.data as Record<string, unknown>;
        return String(d.serviceTypeName || d.name || m.recordKey);
      });

    return {
      customers: customers.map((c) => `${c.customerName} (${c.customerCode})`),
      contacts: contacts.map((c) => `${c.contactName}${c.mobile ? ` (${c.mobile})` : ""}`),
      sites: sites.map((s) => `${s.siteName}, ${s.addressLine1 || s.cityTown || ""}`.trim()),
      technicians: technicians.map((t) => `${t.name} (${t.employeeId})`),
      equipment: equipment.map((e) => `${e.brand || ""} ${e.model || ""} [${e.serialNo}]`.trim()),
      serviceTypes: serviceTypeOptions.length > 0 ? serviceTypeOptions : [
        "Breakdown Repair",
        "Preventive Maintenance",
        "Installation",
        "Inspection / Audit",
        "Warranty Claim",
      ],
    };
  } catch (err) {
    console.error("[Master Options] Failed to fetch:", err);
    return {
      customers: [],
      contacts: [],
      sites: [],
      technicians: [],
      equipment: [],
      serviceTypes: [],
    };
  }
}

