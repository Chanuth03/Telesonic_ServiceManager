const fs = require('fs');
let c = fs.readFileSync('src/lib/api-handler.ts', 'utf8');

const target = `          const matchedCust = await prisma.customer.findFirst({
            where: {
              OR: [
                { customerCode: { equals: cleanCode, mode: "insensitive" } },
                { customerName: { contains: cleanCode, mode: "insensitive" } },
              ],
            },
          });`;

const replacement = `          const matchedCust = await (prisma as any).customer.findFirst({
            where: {
              OR: [
                { customerCode: { equals: cleanCode, mode: "insensitive" } },
                { customerName: { contains: cleanCode, mode: "insensitive" } },
              ],
            },
          });`;

c = c.replace(target, replacement);
fs.writeFileSync('src/lib/api-handler.ts', c, 'utf8');
console.log('Replaced matchedCust prisma query with any cast');

