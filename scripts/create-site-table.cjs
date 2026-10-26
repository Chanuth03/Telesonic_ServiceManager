const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating sites table in PostgreSQL...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "sites" (
        "id" SERIAL NOT NULL,
        "customerId" INTEGER NOT NULL,
        "customerCode" TEXT,
        "customerName" TEXT,
        "siteCode" TEXT NOT NULL,
        "siteName" TEXT NOT NULL,
        "building" TEXT,
        "floor" TEXT,
        "room" TEXT,
        "addressLine1" TEXT NOT NULL,
        "cityTown" TEXT NOT NULL,
        "district" TEXT NOT NULL,
        "province" TEXT NOT NULL,
        "landmark" TEXT,
        "gpsLatLong" TEXT,
        "siteContact" TEXT,
        "status" TEXT NOT NULL DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "sites_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "sites_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "sites_siteCode_key" ON "sites"("siteCode");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "sites_customerId_idx" ON "sites"("customerId");
  `);

  console.log('sites table and indexes created successfully!');

  // Sync to prisma/init-database.sql
  let sql = fs.readFileSync('prisma/init-database.sql', 'utf8');
  const tableSql = `
-- CreateTable sites (MST-03 Site and Location Master)
CREATE TABLE IF NOT EXISTS "sites" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerCode" TEXT,
    "customerName" TEXT,
    "siteCode" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "room" TEXT,
    "addressLine1" TEXT NOT NULL,
    "cityTown" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "landmark" TEXT,
    "gpsLatLong" TEXT,
    "siteContact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sites_siteCode_key" ON "sites"("siteCode");
CREATE INDEX IF NOT EXISTS "sites_customerId_idx" ON "sites"("customerId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sites_customerId_fkey') THEN
        ALTER TABLE "sites" ADD CONSTRAINT "sites_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
`;

  if (!sql.includes('CREATE TABLE IF NOT EXISTS "sites"')) {
    sql += '\n' + tableSql;
    fs.writeFileSync('prisma/init-database.sql', sql, 'utf8');
    console.log('prisma/init-database.sql updated with sites table!');
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

