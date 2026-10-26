const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS equipments (
      id SERIAL PRIMARY KEY,
      "equipmentId" VARCHAR(100) UNIQUE NOT NULL,
      "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      "customerName" VARCHAR(255),
      "siteId" INTEGER REFERENCES sites(id) ON DELETE SET NULL,
      "siteName" VARCHAR(255),
      "itemCategory" VARCHAR(150) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      model VARCHAR(100),
      "serialId" INTEGER REFERENCES serials(id) ON DELETE SET NULL,
      "serialNo" VARCHAR(100),
      origin VARCHAR(100) NOT NULL DEFAULT 'Telesonic-originated',
      "serviceProvider" VARCHAR(100) NOT NULL DEFAULT 'Telesonic In-House SRE',
      "installedDate" VARCHAR(50),
      "commissionedDate" VARCHAR(50),
      "warrantyTo" VARCHAR(50),
      relationship VARCHAR(100) DEFAULT 'Active Under Warranty',
      "systemId" VARCHAR(100),
      "meterReading" DOUBLE PRECISION DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Installed',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created table equipments');

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_equipments_customerId ON equipments("customerId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_equipments_siteId ON equipments("siteId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_equipments_serialId ON equipments("serialId");`);
  console.log('Created indices on equipments');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

