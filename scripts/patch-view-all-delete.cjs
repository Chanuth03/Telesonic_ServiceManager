const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// Replace the delete block to ensure ALL master screens (MST-08 to MST-31) ALSO execute backend delete!
const target = `    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
      const idToDelete = rec["id"];
      const serialToDelete = rec["serialNo"] || recId;
      const url = idToDelete
        ? \`/api/serials?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/serials?serialNo=\${encodeURIComponent(String(serialToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/serials")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.serials && Array.isArray(data.serials)) {
              setSavedRecords(data.serials);
            }
          });
      }).catch((e) =>
        console.error("Error deleting serial from DB:", e),
      );
    }

    setSidePopup({`;

const replacement = `    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
      const idToDelete = rec["id"];
      const serialToDelete = rec["serialNo"] || recId;
      const url = idToDelete
        ? \`/api/serials?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/serials?serialNo=\${encodeURIComponent(String(serialToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/serials")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.serials && Array.isArray(data.serials)) {
              setSavedRecords(data.serials);
            }
          });
      }).catch((e) =>
        console.error("Error deleting serial from DB:", e),
      );
    }

    // Generic masters (MST-08 to MST-31) delete directly from PostgreSQL master_records
    if (!["MST-01", "MST-02", "MST-03", "MST-04", "MST-05", "MST-06", "MST-07", "MST-32", "MST-33"].includes(meta.code)) {
      const dbId = rec["_dbId"];
      const deleteUrl = dbId
        ? \`/api/masters?id=\${encodeURIComponent(String(dbId))}\`
        : \`/api/masters?screenCode=\${encodeURIComponent(meta.code)}&recordKey=\${encodeURIComponent(String(recId))}\`;
      apiFetch(deleteUrl, { method: "DELETE" }).then(() => {
        apiFetch(\`/api/masters?screenCode=\${encodeURIComponent(meta.code)}\`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.records && Array.isArray(data.records)) {
              setSavedRecords(data.records);
            }
          });
      }).catch((e) => console.error(\`Error deleting master record for \${meta.code}:\`, e));
    }

    setSidePopup({`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Added universal delete support for all masters');

