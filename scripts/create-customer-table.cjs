const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating customers table in PostgreSQL...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "customers" (
        "id" SERIAL NOT NULL,
        "customerCode" TEXT NOT NULL,
        "customerName" TEXT NOT NULL,
        "customerGroup" TEXT NOT NULL,
        "territory" TEXT,
        "mobile" TEXT NOT NULL,
        "nicBrNo" TEXT,
        "customerType" TEXT NOT NULL,
        "grade" TEXT,
        "firstChannel" TEXT,
        "preferredChannel" TEXT,
        "customerOrigin" TEXT DEFAULT 'Telesonic-sold',
        "relationshipStatus" TEXT DEFAULT 'Active',
        "paymentHold" TEXT DEFAULT 'No',
        "balanceLkr" DOUBLE PRECISION DEFAULT 0.0,
        "status" TEXT NOT NULL DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "customers_customerCode_key" ON "customers"("customerCode");
  `);

  console.log('customers table and unique index created successfully!');

  // Sync to prisma/init-database.sql
  let sql = fs.readFileSync('prisma/init-database.sql', 'utf8');
  const customerSql = `
-- CreateTable customers (MST-01 Customer Master)
CREATE TABLE IF NOT EXISTS "customers" (
    "id" SERIAL NOT NULL,
    "customerCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerGroup" TEXT NOT NULL,
    "territory" TEXT,
    "mobile" TEXT NOT NULL,
    "nicBrNo" TEXT,
    "customerType" TEXT NOT NULL,
    "grade" TEXT,
    "firstChannel" TEXT,
    "preferredChannel" TEXT,
    "customerOrigin" TEXT DEFAULT 'Telesonic-sold',
    "relationshipStatus" TEXT DEFAULT 'Active',
    "paymentHold" TEXT DEFAULT 'No',
    "balanceLkr" DOUBLE PRECISION DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_customerCode_key" ON "customers"("customerCode");
`;

  if (!sql.includes('CREATE TABLE IF NOT EXISTS "customers"')) {
    sql += '\n' + customerSql;
    fs.writeFileSync('prisma/init-database.sql', sql, 'utf8');
    console.log('prisma/init-database.sql updated with customers table!');
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

