const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const delTarget = `    if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["itemCode"] || recId;
      const url = idToDelete
        ? \`/api/items?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/items?itemCode=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting item from DB:", e),
      );
    }`;

const delReplacement = `${delTarget}

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

code = code.replace(delTarget, delReplacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Added MST-05 delete handler');

