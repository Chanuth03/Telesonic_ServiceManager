const fs = require('fs');

// 1. Update MasterScreenView.tsx to properly split item dropdown string and match item
let viewCode = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const oldViewMatch = `        // Resolve item
        let rawItem = String(formData["item"] || formData["itemName"] || "").trim();
        let matchedItem = itemOptions.find(
          (i) => i.name.toLowerCase() === rawItem.toLowerCase() || i.code.toLowerCase() === rawItem.toLowerCase() || String(i.id) === rawItem
        );`;

const newViewMatch = `        // Resolve item
        let rawItem = String(formData["item"] || formData["itemName"] || "").trim();
        // Dropdown value format: "{itemCode} - {itemName}"
        let itemCodePart = rawItem.includes(" - ") ? rawItem.split(" - ")[0].trim() : rawItem;
        let matchedItem = itemOptions.find(
          (i) =>
            i.code.toLowerCase() === itemCodePart.toLowerCase() ||
            i.name.toLowerCase() === rawItem.toLowerCase() ||
            \`\${i.code} - \${i.name}\`.toLowerCase() === rawItem.toLowerCase() ||
            String(i.id) === rawItem
        );`;

viewCode = viewCode.replace(oldViewMatch, newViewMatch);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', viewCode, 'utf8');

// 2. Update api-handler.ts to properly match item dropdown string on server side too
let apiCode = fs.readFileSync('src/lib/api-handler.ts', 'utf8');

const oldApiMatch = `        // Auto-match item from dropdown if item string provided
        if (!itemId && body.item) {
          const itemStr = String(body.item).trim();
          const matchCode = itemStr.split(" ")[0];
          const matchedItem = await (prisma as any).item.findFirst({
            where: {
              OR: [
                { itemCode: { equals: matchCode, mode: "insensitive" } },
                { itemName: { contains: itemStr, mode: "insensitive" } },
              ],
            },
          });
          if (matchedItem) {
            itemId = matchedItem.id;
            itemCode = matchedItem.itemCode;
            itemName = matchedItem.itemName;
          }
        }`;

const newApiMatch = `        // Auto-match item from dropdown if item string provided
        if (!itemId && (body.item || body.itemName)) {
          const itemStr = String(body.item || body.itemName).trim();
          const matchCode = itemStr.includes(" - ") ? itemStr.split(" - ")[0].trim() : itemStr;
          const matchName = itemStr.includes(" - ") ? itemStr.split(" - ").slice(1).join(" - ").trim() : itemStr;
          const matchedItem = await (prisma as any).item.findFirst({
            where: {
              OR: [
                { itemCode: { equals: matchCode, mode: "insensitive" } },
                { itemName: { equals: matchName, mode: "insensitive" } },
                { itemName: { contains: matchCode, mode: "insensitive" } },
              ],
            },
          });
          if (matchedItem) {
            itemId = matchedItem.id;
            itemCode = matchedItem.itemCode;
            itemName = matchedItem.itemName;
          }
        }`;

apiCode = apiCode.replace(oldApiMatch, newApiMatch);
fs.writeFileSync('src/lib/api-handler.ts', apiCode, 'utf8');

console.log('Successfully updated item matching logic in View and API');

