import { prisma } from '../src/lib/prisma';

async function main() {
  const list = await prisma.holdReasonMaster.findMany();
  console.log("DB Hold Reasons:", list);
}

main().finally(() => prisma.$disconnect());

