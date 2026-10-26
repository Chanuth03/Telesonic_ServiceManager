const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// Replace the delete block to ensure clean resolution of ID and primary keys
const oldDelBlock = `  // Delete saved record
  const handleDeleteRecord = (rec: Record<string, unknown>) => {
    const primaryKey = meta.fields[0]?.key || "id";
    const recId = rec[primaryKey];
    setSavedRecords((prev) => prev.filter((r) => r[primaryKey] !== recId));

    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      const emailToDelete = rec["email"] || recId;
      apiFetch(\`/api/users?email=\${encodeURIComponent(String(emailToDelete))}\`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting user from DB:", e));
    }

    if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
      const codeToDelete = rec["code"] || recId;
      apiFetch(\`/api/roles?code=\${encodeURIComponent(String(codeToDelete))}\`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting role from DB:", e));
    }

    if (meta.code === "MST-01" || meta.id === "O1-SCR-MST-01") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["customerCode"] || recId;
      const url = idToDelete
        ? \`/api/customers?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/customers?customerCode=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting customer from DB:", e),
      );
    }

    if (meta.code === "MST-02" || meta.id === "O1-SCR-MST-02") {
      const idToDelete = rec["id"];
      if (idToDelete) {
        apiFetch(\`/api/contacts?id=\${encodeURIComponent(String(idToDelete))}\`, {
          method: "DELETE",
        }).catch((e) => console.error("Error deleting contact person from DB:", e));
      }
    }

    if (meta.code === "MST-03" || meta.id === "O1-SCR-MST-03") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["siteCode"] || recId;
      const url = idToDelete
        ? \`/api/sites?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/sites?siteCode=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting site from DB:", e),
      );
    }

    if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["itemCode"] || recId;
      const url = idToDelete
        ? \`/api/items?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/items?itemCode=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting item from DB:", e),
      );
    }

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

    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
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

const newDelBlock = `  // Delete saved record
  const handleDeleteRecord = (rec: Record<string, unknown>) => {
    const primaryKey = meta.fields[0]?.key || "id";
    const recId = rec[primaryKey] || rec["id"];
    setSavedRecords((prev) =>
      prev.filter((r) => {
        if (rec["id"] && r["id"]) return r["id"] !== rec["id"];
        if (recId && r[primaryKey]) return r[primaryKey] !== recId;
        return true;
      })
    );

    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      const emailToDelete = rec["email"] || recId;
      apiFetch(\`/api/users?email=\${encodeURIComponent(String(emailToDelete))}\`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting user from DB:", e));
    }

    if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
      const codeToDelete = rec["code"] || recId;
      apiFetch(\`/api/roles?code=\${encodeURIComponent(String(codeToDelete))}\`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting role from DB:", e));
    }

    if (meta.code === "MST-01" || meta.id === "O1-SCR-MST-01") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["customerCode"] || recId;
      const url = idToDelete
        ? \`/api/customers?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/customers?customerCode=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting customer from DB:", e),
      );
    }

    if (meta.code === "MST-02" || meta.id === "O1-SCR-MST-02") {
      const idToDelete = rec["id"];
      if (idToDelete) {
        apiFetch(\`/api/contacts?id=\${encodeURIComponent(String(idToDelete))}\`, {
          method: "DELETE",
        }).catch((e) => console.error("Error deleting contact person from DB:", e));
      }
    }

    if (meta.code === "MST-03" || meta.id === "O1-SCR-MST-03") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["siteCode"] || recId;
      const url = idToDelete
        ? \`/api/sites?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/sites?siteCode=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting site from DB:", e),
      );
    }

    if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["itemCode"] || recId;
      const url = idToDelete
        ? \`/api/items?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/items?itemCode=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting item from DB:", e),
      );
    }

    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/other-brand-equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/other-brand-equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        // Refresh live list from server to ensure perfect sync
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
    }

    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
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
    }`;

code = code.replace(oldDelBlock, newDelBlock);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Successfully enhanced handleDeleteRecord with server re-fetch');

