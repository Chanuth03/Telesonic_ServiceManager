const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating items table in PostgreSQL...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "items" (
        "id" SERIAL NOT NULL,
        "itemCode" TEXT NOT NULL,
        "itemName" TEXT NOT NULL,
        "itemGroup" TEXT NOT NULL,
        "brand" TEXT NOT NULL,
        "model" TEXT,
        "equipmentCategory" TEXT NOT NULL,
        "componentRole" TEXT,
        "serviceable" TEXT NOT NULL DEFAULT 'Yes',
        "warrantyMonths" INTEGER DEFAULT 12,
        "componentWarrantyMonths" INTEGER DEFAULT 6,
        "serialManaged" TEXT NOT NULL DEFAULT 'Yes',
        "status" TEXT NOT NULL DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "items_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "items_itemCode_key" ON "items"("itemCode");
  `);

  console.log('items table created successfully!');

  // Sync to prisma/init-database.sql
  let sql = fs.readFileSync('prisma/init-database.sql', 'utf8');
  const tableSql = `
-- CreateTable items (MST-04 Item Master)
CREATE TABLE IF NOT EXISTS "items" (
    "id" SERIAL NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemGroup" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "equipmentCategory" TEXT NOT NULL,
    "componentRole" TEXT,
    "serviceable" TEXT NOT NULL DEFAULT 'Yes',
    "warrantyMonths" INTEGER DEFAULT 12,
    "componentWarrantyMonths" INTEGER DEFAULT 6,
    "serialManaged" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "items_itemCode_key" ON "items"("itemCode");
`;

  if (!sql.includes('CREATE TABLE IF NOT EXISTS "items"')) {
    sql += '\n' + tableSql;
    fs.writeFileSync('prisma/init-database.sql', sql, 'utf8');
    console.log('prisma/init-database.sql updated with items table!');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

