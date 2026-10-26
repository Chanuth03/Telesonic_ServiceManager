const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sampleItems = [
    {
      itemCode: "FLT-0921-FLT",
      itemName: "High Efficiency Carbon Filter 24x24",
      itemGroup: "Service Spare Parts",
      brand: "Carrier",
      model: "FLT-CAR-V4",
      equipmentCategory: "Air Conditioning Commercial",
      componentRole: "Consumables",
      serviceable: "Yes",
      warrantyMonths: 12,
      componentWarrantyMonths: 6,
      serialManaged: "Yes",
      status: "Active",
    },
    {
      itemCode: "SP-COMP-18K",
      itemName: "Rotary Inverter Compressor 18000 BTU R410A",
      itemGroup: "Service Spare Parts",
      brand: "Toshiba",
      model: "TOS-COMP-18",
      equipmentCategory: "Air Conditioning Commercial",
      componentRole: "Compressor",
      serviceable: "Yes",
      warrantyMonths: 60,
      componentWarrantyMonths: 60,
      serialManaged: "Yes",
      status: "Active",
    },
    {
      itemCode: "AC-SPLIT-18K-INV",
      itemName: "Inverter Split Air Conditioner 18000 BTU Complete",
      itemGroup: "Finished Equipment",
      brand: "Midea",
      model: "MID-18-INV",
      equipmentCategory: "Air Conditioning Commercial",
      componentRole: "Complete Unit",
      serviceable: "Yes",
      warrantyMonths: 24,
      componentWarrantyMonths: 120,
      serialManaged: "Yes",
      status: "Active",
    },
    {
      itemCode: "GAS-R410A-CYL",
      itemName: "Refrigerant Gas R410A 11.3kg Cylinder",
      itemGroup: "Consumables",
      brand: "Carrier",
      model: "R410A-11KG",
      equipmentCategory: "Air Conditioning Commercial",
      componentRole: "Consumables",
      serviceable: "No",
      warrantyMonths: 0,
      componentWarrantyMonths: 0,
      serialManaged: "No",
      status: "Active",
    }
  ];

  for (const item of sampleItems) {
    await prisma.item.upsert({
      where: { itemCode: item.itemCode },
      update: item,
      create: item,
    });
  }

  const all = await prisma.item.findMany();
  console.log('Items in PostgreSQL:', all.map(x => `ID: ${x.id} | Code: ${x.itemCode} | Name: ${x.itemName} | Brand: ${x.brand}`));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

