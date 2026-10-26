const fs = require('fs');
let prismaTs = fs.readFileSync('src/lib/prisma.ts', 'utf8');

const target = '  otherBrandEquipment: any;\n  masterRecord: any;';
const replacement = `  otherBrandEquipment: any;
  equipmentSystem: any;
  technician: any;
  subcontractor: any;
  serviceRoleMaster: any;
  serviceTypeMaster: any;
  masterRecord: any;`;

if (!prismaTs.includes('equipmentSystem: any;')) {
  prismaTs = prismaTs.replace(target, replacement);
  fs.writeFileSync('src/lib/prisma.ts', prismaTs, 'utf8');
  console.log('Updated prisma.ts with Batch 1 models');
}

