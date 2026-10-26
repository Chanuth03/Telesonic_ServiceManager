const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer1 = await prisma.customer.findFirst({ where: { customerCode: "C-30512" } });
  const customer2 = await prisma.customer.findFirst({ where: { customerCode: "C-30513" } });
  const customer3 = await prisma.customer.findFirst({ where: { customerCode: "C-30514" } });

  if (!customer1 || !customer2) {
    console.log("Customers not found, ensure customers are seeded first");
    return;
  }

  const sampleSites = [
    {
      customerId: customer1.id,
      customerCode: customer1.customerCode,
      customerName: customer1.customerName,
      siteCode: "SITE-COL-0091",
      siteName: "Spinning Plant - Block A",
      building: "Industrial Zone Complex",
      floor: "Ground Floor & Mezzanine",
      room: "Main Chiller Room 01",
      addressLine1: "No 45/B, Temple Road, Ratmalana",
      cityTown: "Colombo",
      district: "Colombo",
      province: "Western",
      landmark: "Near Airport Roundabout",
      gpsLatLong: "6.8227° N, 79.8860° E",
      siteContact: "Mr. K. Samarasinghe (071 555 8899)",
      status: "Active",
    },
    {
      customerId: customer1.id,
      customerCode: customer1.customerCode,
      customerName: customer1.customerName,
      siteCode: "SITE-NEG-0042",
      siteName: "Negombo Weaving Mill",
      building: "North Wing",
      floor: "1st Floor",
      room: "Compressor Bay 2",
      addressLine1: "12 Beach Road, Katunayake",
      cityTown: "Negombo",
      district: "Gampaha",
      province: "Western",
      landmark: "Opposite Export Processing Zone Gate 2",
      gpsLatLong: "7.1725° N, 79.8856° E",
      siteContact: "Ms. Dilani Silva (076 402 1133)",
      status: "Active",
    },
    {
      customerId: customer2.id,
      customerCode: customer2.customerCode,
      customerName: customer2.customerName,
      siteCode: "SITE-KAN-0018",
      siteName: "Perera Central Logistics Hub",
      building: "Warehouse Complex 3",
      floor: "Ground Floor",
      room: "Cold Storage Unit 1",
      addressLine1: "88 Peradeniya Road",
      cityTown: "Kandy",
      district: "Kandy",
      province: "Central",
      landmark: "Near Botanical Gardens",
      gpsLatLong: "7.2683° N, 80.5960° E",
      siteContact: "Mr. Samantha Bandara (077 999 4433)",
      status: "Active",
    }
  ];

  for (const s of sampleSites) {
    await prisma.site.upsert({
      where: { siteCode: s.siteCode },
      update: s,
      create: s,
    });
  }

  const all = await prisma.site.findMany({ include: { customer: true } });
  console.log('Sites in PostgreSQL:', all.map(x => `ID: ${x.id} | Customer: ${x.customer.customerName} | Code: ${x.siteCode} | Name: ${x.siteName} | City: ${x.cityTown}`));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

