const fs = require('fs');
let c = fs.readFileSync('src/lib/api-handler.ts', 'utf8');

c = c.replace(/create: \{\s*id: item\.entityId,\s*status: String\(item\.payload\?\.\["status"\] \?\? "In Progress"\),\s*updatedAt: now,\s*syncStatus: "synced",\s*\},/g,
`create: {
                id: item.entityId,
                customerName: (item.payload?.["customerName"] as string) || "Unknown",
                town: (item.payload?.["town"] as string) || "Unknown",
                window: (item.payload?.["window"] as string) || "Morning",
                priority: (item.payload?.["priority"] as string) || "medium",
                jobType: (item.payload?.["jobType"] as string) || "Repair",
                stage: (item.payload?.["stage"] as string) || "assigned",
                status: String(item.payload?.["status"] ?? "In Progress"),
                updatedAt: now,
                syncStatus: "synced",
              } as any,`);

c = c.replace(/where: \{\s*\.\.\.\(customerCode \? \{ customerCode: \{ equals: customerCode, mode: "insensitive" as const \} \} : \{\}\),\s*\.\.\.\(customerName \? \{ customerName: \{ contains: customerName, mode: "insensitive" as const \} \} : \{\}\),\s*\},/g,
`where: {
          ...(customerCode ? { customerCode: customerCode } : {}),
          ...(customerName ? { customerName: { contains: customerName } } : {}),
        } as any,`);

fs.writeFileSync('src/lib/api-handler.ts', c, 'utf8');
console.log("Patched api-handler line 82 and 585");

