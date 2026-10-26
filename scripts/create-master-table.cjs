const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "master_records" (
        "id" SERIAL NOT NULL,
        "screenCode" TEXT NOT NULL,
        "recordKey" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "master_records_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "master_records_screenCode_recordKey_key" ON "master_records"("screenCode", "recordKey");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "master_records_screenCode_idx" ON "master_records"("screenCode");
  `);

  console.log('Successfully created master_records table and indexes in PostgreSQL');
}

main()
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

