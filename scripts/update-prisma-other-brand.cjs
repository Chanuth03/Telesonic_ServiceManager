const fs = require('fs');
let prismaTs = fs.readFileSync('src/lib/prisma.ts', 'utf8');

if (!prismaTs.includes('otherBrandEquipment: any;')) {
  prismaTs = prismaTs.replace(
    '  equipment: any;\n  masterRecord: any;',
    '  equipment: any;\n  otherBrandEquipment: any;\n  masterRecord: any;'
  );
  fs.writeFileSync('src/lib/prisma.ts', prismaTs, 'utf8');
  console.log('Added otherBrandEquipment to prisma.ts');
}

