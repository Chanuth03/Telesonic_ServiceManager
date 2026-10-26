const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// 1. Remove the accidental duplicate delete block from useEffect
const accidentalBlock = `    // 8. If this screen is Equipment / Installed Base (MST-06 / O1-SCR-MST-06)
    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/other-brand-equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/other-brand-equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting other-brand equipment from DB:", e),
      );
    }

    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {`;

const correctedBlock = `    // 8. If this screen is Equipment / Installed Base (MST-06 / O1-SCR-MST-06)
    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {`;

code = code.replace(accidentalBlock, correctedBlock);

// 2. Put the actual delete call inside handleDeleteRecord where it belongs!
const handleDelTarget = `    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting equipment from DB:", e),
      );
    }`;

const handleDelReplacement = `    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/other-brand-equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/other-brand-equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/other-brand-equipments")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.equipments && Array.isArray(data.equipments)) {
              setSavedRecords(data.equipments);
            }
          });
      }).catch((e) =>
        console.error("Error deleting other-brand equipment from DB:", e),
      );
    }

    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/equipments")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.equipments && Array.isArray(data.equipments)) {
              setSavedRecords(data.equipments);
            }
          });
      }).catch((e) =>
        console.error("Error deleting equipment from DB:", e),
      );
    }`;

code = code.replace(handleDelTarget, handleDelReplacement);

fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Fixed MST-07 delete placement in handleDeleteRecord');

