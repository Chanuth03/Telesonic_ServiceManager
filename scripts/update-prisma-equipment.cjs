const fs = require('fs');
let prismaTs = fs.readFileSync('src/lib/prisma.ts', 'utf8');

if (!prismaTs.includes('equipment: any;')) {
  prismaTs = prismaTs.replace(
    '  serialRegister: any;\n  masterRecord: any;',
    '  serialRegister: any;\n  equipment: any;\n  masterRecord: any;'
  );
  fs.writeFileSync('src/lib/prisma.ts', prismaTs, 'utf8');
  console.log('Added equipment to prisma.ts');
} else {
  console.log('equipment already in prisma.ts');
}

