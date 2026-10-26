const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS serials (
      id SERIAL PRIMARY KEY,
      "serialNo" VARCHAR(100) UNIQUE NOT NULL,
      "itemId" INTEGER REFERENCES items(id) ON DELETE SET NULL,
      "itemCode" VARCHAR(100),
      "itemName" VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Available',
      warehouse VARCHAR(150),
      "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      "customerName" VARCHAR(255),
      "siteId" INTEGER REFERENCES sites(id) ON DELETE SET NULL,
      "siteName" VARCHAR(255),
      "systemId" VARCHAR(100),
      "componentRole" VARCHAR(100),
      "warrantyStart" VARCHAR(50),
      "replacesSerial" VARCHAR(100),
      "replacedBy" VARCHAR(100),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created table serials');

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_serials_itemId ON serials("itemId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_serials_customerId ON serials("customerId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_serials_siteId ON serials("siteId");`);
  console.log('Created indices on serials');

  await prisma.$disconnect();
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});

