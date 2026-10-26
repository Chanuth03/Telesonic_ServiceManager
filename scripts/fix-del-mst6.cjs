const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const target = `    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
      const idToDelete = rec["id"];
      const serialToDelete = rec["serialNo"] || recId;
      const url = idToDelete
        ? \`/api/serials?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/serials?serialNo=\${encodeURIComponent(String(serialToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting serial from DB:", e),
      );
    }`;

const replacement = `    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting equipment from DB:", e),
      );
    }

    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
      const idToDelete = rec["id"];
      const serialToDelete = rec["serialNo"] || recId;
      const url = idToDelete
        ? \`/api/serials?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/serials?serialNo=\${encodeURIComponent(String(serialToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting serial from DB:", e),
      );
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Fixed handleDeleteRecord for MST-06');

