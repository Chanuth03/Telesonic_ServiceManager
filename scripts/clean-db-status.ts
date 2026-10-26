import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.holdReasonMaster.updateMany({
    where: { active: 'Yes' },
    data: { status: 'Active' },
  });
  await prisma.holdReasonMaster.updateMany({
    where: { active: 'No' },
    data: { status: 'Inactive' },
  });
  const list = await prisma.holdReasonMaster.findMany();
  console.log("Cleaned DB hold reasons:", list);
}

main().finally(() => prisma.$disconnect());

