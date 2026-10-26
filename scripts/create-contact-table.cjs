const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating contact_persons table in PostgreSQL...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "contact_persons" (
        "id" SERIAL NOT NULL,
        "customerId" INTEGER NOT NULL,
        "customerCode" TEXT,
        "contactName" TEXT NOT NULL,
        "position" TEXT,
        "mobile" TEXT NOT NULL,
        "email" TEXT,
        "site" TEXT,
        "active" TEXT NOT NULL DEFAULT 'Yes',
        "validFrom" TEXT,
        "status" TEXT NOT NULL DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "contact_persons_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "contact_persons_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "contact_persons_customerId_idx" ON "contact_persons"("customerId");
  `);

  console.log('contact_persons table created successfully!');

  // Sync to prisma/init-database.sql
  let sql = fs.readFileSync('prisma/init-database.sql', 'utf8');
  const tableSql = `
-- CreateTable contact_persons (MST-02 Contact Person Master)
CREATE TABLE IF NOT EXISTS "contact_persons" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerCode" TEXT,
    "contactName" TEXT NOT NULL,
    "position" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "site" TEXT,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "validFrom" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_persons_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "contact_persons_customerId_idx" ON "contact_persons"("customerId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_persons_customerId_fkey') THEN
        ALTER TABLE "contact_persons" ADD CONSTRAINT "contact_persons_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
`;

  if (!sql.includes('CREATE TABLE IF NOT EXISTS "contact_persons"')) {
    sql += '\n' + tableSql;
    fs.writeFileSync('prisma/init-database.sql', sql, 'utf8');
    console.log('prisma/init-database.sql updated with contact_persons table!');
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

