const fs = require('fs');
let prismaTs = fs.readFileSync('src/lib/prisma.ts', 'utf8');

prismaTs = prismaTs.replace(
  '  item: any;\n  masterRecord: any;',
  '  item: any;\n  serialRegister: any;\n  masterRecord: any;'
);

fs.writeFileSync('src/lib/prisma.ts', prismaTs, 'utf8');
console.log('Added serialRegister to prisma.ts');

