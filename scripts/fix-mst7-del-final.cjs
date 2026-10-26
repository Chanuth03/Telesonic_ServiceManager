const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const target = `    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting equipment from DB:", e),
      );
    }`;

const replacement = `    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/other-brand-equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/other-brand-equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" })
        .then(() => {
          apiFetch("/api/other-brand-equipments")
            .then((res) => res.json())
            .then((data) => {
              if (data && data.equipments && Array.isArray(data.equipments)) {
                setSavedRecords(data.equipments);
              }
            });
        })
        .catch((e) => console.error("Error deleting other-brand equipment from DB:", e));
    }

    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" })
        .then(() => {
          apiFetch("/api/equipments")
            .then((res) => res.json())
            .then((data) => {
              if (data && data.equipments && Array.isArray(data.equipments)) {
                setSavedRecords(data.equipments);
              }
            });
        })
        .catch((e) => console.error("Error deleting equipment from DB:", e));
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Successfully added MST-07 delete logic to handleDeleteRecord');

