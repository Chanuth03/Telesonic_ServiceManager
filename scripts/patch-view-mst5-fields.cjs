const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const fieldTarget = `            } else if (
              (meta.code === "MST-02" || meta.code === "MST-03" || meta.id === "O1-SCR-MST-02" || meta.id === "O1-SCR-MST-03") &&
              (f.key === "customerId" || f.key === "customerName" || f.key === "customer") &&
              customerOptions.length > 0
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: customerOptions.map((c) => c.name),
              };
            }`;

const fieldReplacement = `            } else if (
              (meta.code === "MST-02" || meta.code === "MST-03" || meta.code === "MST-05" || meta.id === "O1-SCR-MST-02" || meta.id === "O1-SCR-MST-03" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "customerId" || f.key === "customerName" || f.key === "customer") &&
              customerOptions.length > 0
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: customerOptions.map((c) => c.name),
              };
            } else if (
              (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "item" || f.key === "itemId" || f.key === "itemName") &&
              itemOptions.length > 0
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: itemOptions.map((i) => \`\${i.code} - \${i.name}\`),
              };
            } else if (
              (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "warehouse" || f.key === "location")
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: [
                  "Central Stores",
                  "Colombo Main Warehouse",
                  "VAN-KSILVA (Field Stock)",
                  "VAN-PERERA (Field Stock)",
                  "Transit / Staging Area",
                  "Customer Site Installed",
                ],
              };
            }`;

code = code.replace(fieldTarget, fieldReplacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Added MST-05 dynamic dropdown fields');

