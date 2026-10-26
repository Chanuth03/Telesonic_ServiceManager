const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const items = await prisma.$queryRawUnsafe('SELECT id, "itemCode", "itemName" FROM items;');
  console.log('Items in DB:', items);
  await prisma.$disconnect();
}
main().catch(console.error);

