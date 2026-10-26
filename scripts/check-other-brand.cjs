const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe('SELECT id, "equipmentId", "customerName", brand, model FROM other_brand_equipments;');
  console.log('Other brand rows:', rows);
  await prisma.$disconnect();
}
main().catch(console.error);

