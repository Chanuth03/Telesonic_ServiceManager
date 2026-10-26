const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sampleCustomers = [
    {
      customerCode: "C-30512",
      customerName: "Jayasuriya Textiles (Pvt) Ltd",
      customerGroup: "Corporate Commercial",
      territory: "Western - Colombo Central",
      mobile: "+94 77 123 4567",
      nicBrNo: "PV-8891042",
      customerType: "Corporate Enterprise",
      grade: "Tier 1 - Platinum VIP",
      firstChannel: "Field Sales Rep",
      preferredChannel: "Dedicated Hotline",
      customerOrigin: "Telesonic-sold",
      relationshipStatus: "Active",
      paymentHold: "No",
      balanceLkr: 1250000.0,
      status: "Active",
    },
    {
      customerCode: "C-30513",
      customerName: "Perera Holdings (Pvt) Ltd",
      customerGroup: "Corporate Commercial",
      territory: "Western - Colombo Central",
      mobile: "+94 71 555 8899",
      nicBrNo: "PV-1290381",
      customerType: "Corporate Enterprise",
      grade: "Tier 2 - Strategic Gold",
      firstChannel: "Service Desk Walk-in",
      preferredChannel: "WhatsApp / SMS",
      customerOrigin: "Telesonic-sold",
      relationshipStatus: "Active",
      paymentHold: "No",
      balanceLkr: 45000.0,
      status: "Active",
    },
    {
      customerCode: "C-30514",
      customerName: "Kandy Lake Hotel",
      customerGroup: "Hospitality & Leisure",
      territory: "Central - Kandy Valley",
      mobile: "+94 81 223 4567",
      nicBrNo: "PV-5544332",
      customerType: "Corporate Enterprise",
      grade: "Tier 1 - Platinum VIP",
      firstChannel: "Field Sales Rep",
      preferredChannel: "Email Dispatch",
      customerOrigin: "Telesonic-sold",
      relationshipStatus: "Active",
      paymentHold: "No",
      balanceLkr: 0.0,
      status: "Active",
    }
  ];

  for (const c of sampleCustomers) {
    await prisma.customer.upsert({
      where: { customerCode: c.customerCode },
      update: c,
      create: c,
    });
  }

  const all = await prisma.customer.findMany();
  console.log('Customers in PostgreSQL:', all.map(x => `ID: ${x.id} | Code: ${x.customerCode} | Name: ${x.customerName}`));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

