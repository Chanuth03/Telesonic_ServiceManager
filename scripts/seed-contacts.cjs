const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer1 = await prisma.customer.findFirst({ where: { customerCode: "C-30512" } });
  const customer2 = await prisma.customer.findFirst({ where: { customerCode: "C-30513" } });

  if (!customer1 || !customer2) {
    console.log("Customers not found, ensure customers are seeded first");
    return;
  }

  const sampleContacts = [
    {
      customerId: customer1.id,
      customerCode: customer1.customerCode,
      contactName: "Ms. Dilani Silva",
      position: "Facilities & Plant Manager",
      mobile: "+94 76 402 1133",
      email: "dilani.s@jayasuriya.lk",
      site: "Site EQ-018834 (Colombo Central)",
      active: "Yes",
      validFrom: "2026-01-15",
      status: "Active",
    },
    {
      customerId: customer1.id,
      customerCode: customer1.customerCode,
      contactName: "Mr. Ruwan Perera",
      position: "Chief Electrical Engineer",
      mobile: "+94 71 555 8898",
      email: "ruwan.p@jayasuriya.lk",
      site: "Main Factory Warehouse",
      active: "Yes",
      validFrom: "2025-06-01",
      status: "Active",
    },
    {
      customerId: customer2.id,
      customerCode: customer2.customerCode,
      contactName: "Mr. Samantha Bandara",
      position: "Senior Operations Director",
      mobile: "+94 77 999 4433",
      email: "samantha@pereraholdings.lk",
      site: "Headquarters Tower 1",
      active: "Yes",
      validFrom: "2026-02-01",
      status: "Active",
    }
  ];

  for (const c of sampleContacts) {
    const existing = await prisma.contactPerson.findFirst({
      where: {
        customerId: c.customerId,
        contactName: c.contactName,
      }
    });

    if (existing) {
      await prisma.contactPerson.update({ where: { id: existing.id }, data: c });
    } else {
      await prisma.contactPerson.create({ data: c });
    }
  }

  const all = await prisma.contactPerson.findMany({ include: { customer: true } });
  console.log('Contact Persons in PostgreSQL:', all.map(x => `ID: ${x.id} | Customer: ${x.customer.customerName} (${x.customer.customerCode}) | Contact: ${x.contactName} (${x.mobile})`));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

