const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExistingRows() {
  await prisma.$executeRawUnsafe(`
    UPDATE serials 
    SET "itemId" = 5, "itemCode" = 'test ietm', "itemName" = 'item name'
    WHERE id IN (4, 6);
  `);
  console.log('Fixed existing rows 4 and 6 in PostgreSQL serials table!');
  await prisma.$disconnect();
}
fixExistingRows().catch(console.error);

