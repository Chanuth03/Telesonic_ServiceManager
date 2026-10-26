const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleOtherBrand = [
  {
    equipmentId: "EQ-OTH-99104",
    customerName: "Jayasuriya Textiles (Pvt) Ltd",
    siteName: "Colombo 03 Head Office",
    equipmentCategory: "Air Conditioning Residential",
    brand: "Daikin Overseas",
    model: "FTKC35TVMV Inverter",
    serial: "DKN-66102-SL",
    serialUnknown: "No",
    previousSupplier: "Southern Cool Tech (Third Party)",
    takeoverDate: "2026-09-01",
    takeoverCondition: "Poor airflow; requires coil chemical washing and gas top-up",
    status: "Active",
  },
  {
    equipmentId: "EQ-OTH-99105",
    customerName: "Kandy Lake Hotel Complex",
    siteName: "Central Kitchen Complex",
    equipmentCategory: "Commercial Refrigeration",
    brand: "Mitsubishi Heavy",
    model: "SRK-45-ZMP",
    serial: "MIT-99120-JP",
    serialUnknown: "No",
    previousSupplier: "Direct Import by Client",
    takeoverDate: "2026-08-15",
    takeoverCondition: "Fully operational, routine filter service requested",
    status: "Active",
  },
];

async function seed() {
  const customers = await prisma.$queryRawUnsafe('SELECT id, "customerName" FROM customers;');
  const sites = await prisma.$queryRawUnsafe('SELECT id, "siteName", "customerId" FROM sites;');

  for (const eq of sampleOtherBrand) {
    const cust = customers.find(c => c.customerName.toLowerCase().includes(eq.customerName.toLowerCase().split(' ')[0]));
    const site = sites.find(s => s.siteName.toLowerCase().includes(eq.siteName.toLowerCase().split(' ')[0]));

    await prisma.$executeRawUnsafe(`
      INSERT INTO other_brand_equipments ("equipmentId", "customerId", "customerName", "siteId", "siteName", "equipmentCategory", brand, model, serial, "serialUnknown", "previousSupplier", "takeoverDate", "takeoverCondition", status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
      eq.equipmentCategory,
      eq.brand,
      eq.model,
      eq.serial,
      eq.serialUnknown,
      eq.previousSupplier,
      eq.takeoverDate,
      eq.takeoverCondition,
      eq.status
    );
  }

  console.log('Seeded sample other-brand equipments successfully!');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

