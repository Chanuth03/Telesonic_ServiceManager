import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE technicians ADD COLUMN IF NOT EXISTS "normalRate" DOUBLE PRECISION DEFAULT 0.0;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE technicians ADD COLUMN IF NOT EXISTS "overtimeRate" DOUBLE PRECISION DEFAULT 0.0;`);
  console.log('Columns normalRate and overtimeRate added successfully via Prisma raw SQL');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

