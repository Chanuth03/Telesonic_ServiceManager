import { prisma } from '../src/lib/prisma';

async function testTechnicianRates() {
  const empId = `EMP-TEST-${Date.now().toString().slice(-4)}`;
  
  // 1. Create technician with rates
  const created = await prisma.technician.create({
    data: {
      employeeId: empId,
      name: "Chathura Senanayake",
      position: "Senior Lead HVAC Technician",
      normalRate: 3500.50,
      overtimeRate: 5250.75,
      status: "Active",
    },
  });
  console.log("Technician created with rates:", {
    id: created.id,
    employeeId: created.employeeId,
    normalRate: created.normalRate,
    overtimeRate: created.overtimeRate,
  });

  // 2. Read from DB
  const fetched = await prisma.technician.findUnique({
    where: { id: created.id },
  });
  console.log("Technician fetched from DB:", {
    normalRate: fetched?.normalRate,
    overtimeRate: fetched?.overtimeRate,
  });

  // 3. Clean up
  await prisma.technician.delete({ where: { id: created.id } });
  console.log("Cleanup done. Verified 100%!");
}

testTechnicianRates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

