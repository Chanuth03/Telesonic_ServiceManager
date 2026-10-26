const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleEquipments = [
  {
    equipmentId: "EQ-018834",
    customerName: "Kandy Lake Hotel Complex",
    siteName: "Central Kitchen Complex",
    itemCategory: "Commercial Refrigeration 400L",
    brand: "Carrier Commercial",
    model: "REF-400-INV",
    serialNo: "MID-INV-55210",
    origin: "Telesonic-originated",
    serviceProvider: "Telesonic In-House SRE",
    installedDate: "2026-09-12",
    commissionedDate: "2026-09-20",
    warrantyTo: "2027-09-20",
    relationship: "Active Under Warranty",
    systemId: "SYS-KANDY-01",
    meterReading: 1420,
    status: "Installed",
  },
  {
    equipmentId: "EQ-018835",
    customerName: "Jayasuriya Textiles (Pvt) Ltd",
    siteName: "Colombo 03 Head Office",
    itemCategory: "Air Conditioning Commercial",
    brand: "Carrier",
    model: "VRF-36K-IND",
    serialNo: "BSH-CTRL-00872",
    origin: "Telesonic-originated",
    serviceProvider: "Telesonic In-House SRE",
    installedDate: "2026-08-10",
    commissionedDate: "2026-08-15",
    warrantyTo: "2027-08-15",
    relationship: "Active Under Warranty",
    systemId: "CNT-2026-07",
    meterReading: 2150,
    status: "Installed",
  },
];

async function seed() {
  const customers = await prisma.$queryRawUnsafe('SELECT id, "customerName" FROM customers;');
  const sites = await prisma.$queryRawUnsafe('SELECT id, "siteName", "customerId" FROM sites;');
  const serials = await prisma.$queryRawUnsafe('SELECT id, "serialNo" FROM serials;');

  for (const eq of sampleEquipments) {
    const cust = customers.find(c => c.customerName.toLowerCase().includes(eq.customerName.toLowerCase().split(' ')[0]));
    const site = sites.find(s => s.siteName.toLowerCase().includes(eq.siteName.toLowerCase().split(' ')[0]));
    const ser = serials.find(s => s.serialNo === eq.serialNo);

    await prisma.$executeRawUnsafe(`
      INSERT INTO equipments ("equipmentId", "customerId", "customerName", "siteId", "siteName", "itemCategory", brand, model, "serialId", "serialNo", origin, "serviceProvider", "installedDate", "commissionedDate", "warrantyTo", relationship, "systemId", "meterReading", status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT ("equipmentId") DO UPDATE SET
        "customerName" = EXCLUDED."customerName",
        "siteName" = EXCLUDED."siteName",
        brand = EXCLUDED.brand,
        status = EXCLUDED.status;
    `,
      eq.equipmentId,
      cust ? cust.id : null,
      cust ? cust.customerName : eq.customerName,
      site ? site.id : null,
      site ? site.siteName : eq.siteName,
      eq.itemCategory,
      eq.brand,
      eq.model,
      ser ? ser.id : null,
      ser ? ser.serialNo : eq.serialNo,
      eq.origin,
      eq.serviceProvider,
      eq.installedDate,
      eq.commissionedDate,
      eq.warrantyTo,
      eq.relationship,
      eq.systemId,
      eq.meterReading,
      eq.status
    );
  }

  console.log('Seeded sample equipments successfully!');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

