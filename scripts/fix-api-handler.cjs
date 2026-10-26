const fs = require('fs');
let c = fs.readFileSync('src/lib/api-handler.ts', 'utf8');

c = c.replace('status: item.payload?.status || "In Progress",', 'status: String(item.payload?.["status"] ?? "In Progress"),');
c = c.replace('status: item.payload?.status,', 'status: String(item.payload?.["status"] ?? "In Progress"),');
c = c.replace('create: item.payload,', 'create: item.payload as any,');
c = c.replace('update: item.payload,', 'update: item.payload as any,');

c = c.replace('customerCode: { equals: customerCode, mode: "insensitive" },', '...(customerCode ? { customerCode: { equals: customerCode, mode: "insensitive" as const } } : {}),');
c = c.replace('customerName: { contains: customerName, mode: "insensitive" },', '...(customerName ? { customerName: { contains: customerName, mode: "insensitive" as const } } : {}),');

fs.writeFileSync('src/lib/api-handler.ts', c, 'utf8');
console.log("Successfully updated api-handler.ts");

