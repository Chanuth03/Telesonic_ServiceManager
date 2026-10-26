const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleSerials = [
  {
    serialNo: "BSH-CTRL-00872",
    itemCode: "SP-COMP-18K",
    itemName: "SP-COMP-18K Compressor Scroll",
    status: "Installed",
    warehouse: "VAN-KSILVA (Field Stock)",
    customerName: "Jayasuriya Textiles (Pvt) Ltd",
    siteName: "Colombo 03 Head Office",
    systemId: "CNT-2026-07",
    componentRole: "Main Compressor Unit",
    warrantyStart: "2026-10-03",
    replacesSerial: "BSH-CTRL-00412 (Burned Coil)",
    replacedBy: "—",
  },
  {
    serialNo: "CAR-VRF-99014",
    itemCode: "AC-CAR-36K",
    itemName: "Carrier 36000 BTU Commercial VRF",
    status: "Installed",
    warehouse: "Central Stores",
    customerName: "Apex Apparel Lanka (Pvt) Ltd",
    siteName: "Biyagama Export Processing Zone",
    systemId: "VRF-SYS-01",
    componentRole: "Outdoor Unit",
    warrantyStart: "2026-01-15",
    replacesSerial: "—",
    replacedBy: "—",
  },
  {
    serialNo: "MID-INV-55210",
    itemCode: "MID-INV-18K",
    itemName: "Midea 18000 BTU Inverter Split Unit",
    status: "Available",
    warehouse: "Central Stores",
    customerName: "Lanka Canneries PLC",
    siteName: "Factory Complex Narahenpita",
    systemId: "SPL-02",
    componentRole: "Complete Unit",
    warrantyStart: "2026-06-10",
    replacesSerial: "—",
    replacedBy: "—",
  },
];

async function seed() {
  const customers = await prisma.$queryRawUnsafe('SELECT id, "customerName" FROM customers;');
  const items = await prisma.$queryRawUnsafe('SELECT id, "itemCode", "itemName" FROM items;');
  const sites = await prisma.$queryRawUnsafe('SELECT id, "siteName", "customerId" FROM sites;');

  for (const s of sampleSerials) {
    const cust = customers.find(c => c.customerName.toLowerCase().includes(s.customerName.toLowerCase().split(' ')[0]));
    const itm = items.find(i => i.itemCode === s.itemCode || i.itemName.toLowerCase().includes(s.itemCode.toLowerCase()));
    const site = sites.find(st => st.siteName.toLowerCase().includes(s.siteName.toLowerCase().split(' ')[0]));

    await prisma.$executeRawUnsafe(`
      INSERT INTO serials ("serialNo", "itemId", "itemCode", "itemName", status, warehouse, "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT ("serialNo") DO UPDATE SET
        status = EXCLUDED.status,
        warehouse = EXCLUDED.warehouse,
        "siteName" = EXCLUDED."siteName",
        "warrantyStart" = EXCLUDED."warrantyStart";
    `,
      s.serialNo,
      itm ? itm.id : null,
      itm ? itm.itemCode : s.itemCode,
      itm ? itm.itemName : s.itemName,
      s.status,
      s.warehouse,
      cust ? cust.id : null,
      cust ? cust.customerName : s.customerName,
      site ? site.id : null,
      site ? site.siteName : s.siteName,
      s.systemId,
      s.componentRole,
      s.warrantyStart,
      s.replacesSerial,
      s.replacedBy
    );
  }

  console.log('Seeded sample serials successfully!');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

