import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.holdReasonMaster.updateMany({
    where: { active: 'No' },
    data: { status: 'Inactive' },
  });
  console.log("Updated active: No to status: Inactive");
  const list = await prisma.holdReasonMaster.findMany();
  console.log("Current DB records:", list);
}

main().finally(() => prisma.$disconnect());

