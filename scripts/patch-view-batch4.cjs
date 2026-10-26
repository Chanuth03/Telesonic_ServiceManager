const fs = require('fs');

let viewFile = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Initial Loaders (around line 316)
const loaderTarget = `    // 24. MST-22: Notification Templates
    if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
      apiFetch("/api/notification-templates").then((r) => r.json()).then((d) => {
        if (d?.templates) setSavedRecords(d.templates);
      });
      return;
    }`;

const loaderReplacement = `    // 24. MST-22: Notification Templates
    if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
      apiFetch("/api/notification-templates").then((r) => r.json()).then((d) => {
        if (d?.templates) setSavedRecords(d.templates);
      });
      return;
    }

    // 25. MST-23: Project and G/L Budget
    if (meta.code === "MST-23" || meta.id === "O1-SCR-MST-23") {
      apiFetch("/api/project-budgets").then((r) => r.json()).then((d) => {
        if (d?.budgets) setSavedRecords(d.budgets);
      });
      return;
    }

    // 26. MST-24: Cost Element / G/L Mapping
    if (meta.code === "MST-24" || meta.id === "O1-SCR-MST-24") {
      apiFetch("/api/cost-element-mappings").then((r) => r.json()).then((d) => {
        if (d?.mappings) setSavedRecords(d.mappings);
      });
      return;
    }

    // 27. MST-25: Labour Rates
    if (meta.code === "MST-25" || meta.id === "O1-SCR-MST-25") {
      apiFetch("/api/labour-rates").then((r) => r.json()).then((d) => {
        if (d?.rates) setSavedRecords(d.rates);
      });
      return;
    }

    // 28. MST-26: Franchise and Franchise Warehouse
    if (meta.code === "MST-26" || meta.id === "O1-SCR-MST-26") {
      apiFetch("/api/franchise-warehouses").then((r) => r.json()).then((d) => {
        if (d?.warehouses) setSavedRecords(d.warehouses);
      });
      return;
    }

    // 29. MST-27: Deviation Reasons
    if (meta.code === "MST-27" || meta.id === "O1-SCR-MST-27") {
      apiFetch("/api/deviation-reasons").then((r) => r.json()).then((d) => {
        if (d?.reasons) setSavedRecords(d.reasons);
      });
      return;
    }

    // 30. MST-28: Export Permissions
    if (meta.code === "MST-28" || meta.id === "O1-SCR-MST-28") {
      apiFetch("/api/export-permissions").then((r) => r.json()).then((d) => {
        if (d?.permissions) setSavedRecords(d.permissions);
      });
      return;
    }

    // 31. MST-29: Google Meet Settings
    if (meta.code === "MST-29" || meta.id === "O1-SCR-MST-29") {
      apiFetch("/api/google-meet-settings").then((r) => r.json()).then((d) => {
        if (d?.settings) setSavedRecords(d.settings);
      });
      return;
    }

    // 32. MST-30: Equipment Category Attributes
    if (meta.code === "MST-30" || meta.id === "O1-SCR-MST-30") {
      apiFetch("/api/equipment-category-attributes").then((r) => r.json()).then((d) => {
        if (d?.categories) setSavedRecords(d.categories);
      });
      return;
    }

    // 33. MST-31: Tools, Tool Boxes and Vehicles
    if (meta.code === "MST-31" || meta.id === "O1-SCR-MST-31") {
      apiFetch("/api/tool-vehicle-assets").then((r) => r.json()).then((d) => {
        if (d?.assets) setSavedRecords(d.assets);
      });
      return;
    }`;

if (viewFile.includes(loaderTarget)) {
  viewFile = viewFile.replace(loaderTarget, loaderReplacement);
  console.log('Successfully injected Batch 4 loaders!');
} else {
  console.error('Loader target not found!');
  process.exit(1);
}

// 2. Save handlers (around line 865)
const saveTarget = `      } else if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
        apiFetch("/api/notification-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.template) {
            setSavedRecords((prev) => [result.template, ...prev.filter((t) => t["id"] !== result.template["id"] && String(t["templateId"]).toUpperCase() !== String(result.template["templateId"]).toUpperCase())]);
          }
        });`;

const saveReplacement = `      } else if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
        apiFetch("/api/notification-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.template) {
            setSavedRecords((prev) => [result.template, ...prev.filter((t) => t["id"] !== result.template["id"] && String(t["templateId"]).toUpperCase() !== String(result.template["templateId"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-23" || meta.id === "O1-SCR-MST-23") {
        apiFetch("/api/project-budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.budget) {
            setSavedRecords((prev) => [result.budget, ...prev.filter((t) => t["id"] !== result.budget["id"] && String(t["projectCode"]).toUpperCase() !== String(result.budget["projectCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-24" || meta.id === "O1-SCR-MST-24") {
        apiFetch("/api/cost-element-mappings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.mapping) {
            setSavedRecords((prev) => [result.mapping, ...prev.filter((t) => t["id"] !== result.mapping["id"] && String(t["costElement"]).toUpperCase() !== String(result.mapping["costElement"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-25" || meta.id === "O1-SCR-MST-25") {
        apiFetch("/api/labour-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.rate) {
            setSavedRecords((prev) => [result.rate, ...prev.filter((t) => t["id"] !== result.rate["id"] && String(t["rateCode"]).toUpperCase() !== String(result.rate["rateCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-26" || meta.id === "O1-SCR-MST-26") {
        apiFetch("/api/franchise-warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.warehouse) {
            setSavedRecords((prev) => [result.warehouse, ...prev.filter((t) => t["id"] !== result.warehouse["id"] && String(t["franchiseBp"]).toUpperCase() !== String(result.warehouse["franchiseBp"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-27" || meta.id === "O1-SCR-MST-27") {
        apiFetch("/api/deviation-reasons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.reason) {
            setSavedRecords((prev) => [result.reason, ...prev.filter((t) => t["id"] !== result.reason["id"] && String(t["reasonCode"]).toUpperCase() !== String(result.reason["reasonCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-28" || meta.id === "O1-SCR-MST-28") {
        apiFetch("/api/export-permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.permission) {
            setSavedRecords((prev) => [result.permission, ...prev.filter((t) => t["id"] !== result.permission["id"] && (String(t["role"]) !== String(result.permission["role"]) || String(t["reportGrid"]) !== String(result.permission["reportGrid"])))]);
          }
        });
      } else if (meta.code === "MST-29" || meta.id === "O1-SCR-MST-29") {
        apiFetch("/api/google-meet-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.setting) {
            setSavedRecords((prev) => [result.setting, ...prev.filter((t) => t["id"] !== result.setting["id"] && String(t["workspaceDomain"]).toUpperCase() !== String(result.setting["workspaceDomain"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-30" || meta.id === "O1-SCR-MST-30") {
        apiFetch("/api/equipment-category-attributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.category) {
            setSavedRecords((prev) => [result.category, ...prev.filter((t) => t["id"] !== result.category["id"] && String(t["categoryCode"]).toUpperCase() !== String(result.category["categoryCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-31" || meta.id === "O1-SCR-MST-31") {
        apiFetch("/api/tool-vehicle-assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.asset) {
            setSavedRecords((prev) => [result.asset, ...prev.filter((t) => t["id"] !== result.asset["id"] && String(t["assetId"]).toUpperCase() !== String(result.asset["assetId"]).toUpperCase())]);
          }
        });`;

if (viewFile.includes(saveTarget)) {
  viewFile = viewFile.replace(saveTarget, saveReplacement);
  console.log('Successfully injected Batch 4 save handlers!');
} else {
  console.error('Save target not found!');
  process.exit(1);
}

// 3. Delete handlers (around line 1394)
const delTarget = `    if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
      const idToDelete = rec["id"];
      const tIdToDelete = rec["templateId"] || recId;
      const url = idToDelete
        ? \`/api/notification-templates?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/notification-templates?templateId=\${encodeURIComponent(String(tIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/notification-templates").then((res) => res.json()).then((data) => {
          if (data?.templates) setSavedRecords(data.templates);
        });
      }).catch((e) => console.error("Error deleting notification template from DB:", e));
    }`;

const delReplacement = `    if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
      const idToDelete = rec["id"];
      const tIdToDelete = rec["templateId"] || recId;
      const url = idToDelete
        ? \`/api/notification-templates?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/notification-templates?templateId=\${encodeURIComponent(String(tIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/notification-templates").then((res) => res.json()).then((data) => {
          if (data?.templates) setSavedRecords(data.templates);
        });
      }).catch((e) => console.error("Error deleting notification template from DB:", e));
    }

    if (meta.code === "MST-23" || meta.id === "O1-SCR-MST-23") {
      const idToDelete = rec["id"];
      const pCodeToDelete = rec["projectCode"] || recId;
      const url = idToDelete
        ? \`/api/project-budgets?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/project-budgets?projectCode=\${encodeURIComponent(String(pCodeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/project-budgets").then((res) => res.json()).then((data) => {
          if (data?.budgets) setSavedRecords(data.budgets);
        });
      }).catch((e) => console.error("Error deleting project budget from DB:", e));
    }

    if (meta.code === "MST-24" || meta.id === "O1-SCR-MST-24") {
      const idToDelete = rec["id"];
      const elemToDelete = rec["costElement"] || recId;
      const url = idToDelete
        ? \`/api/cost-element-mappings?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/cost-element-mappings?costElement=\${encodeURIComponent(String(elemToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/cost-element-mappings").then((res) => res.json()).then((data) => {
          if (data?.mappings) setSavedRecords(data.mappings);
        });
      }).catch((e) => console.error("Error deleting cost element mapping from DB:", e));
    }

    if (meta.code === "MST-25" || meta.id === "O1-SCR-MST-25") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["rateCode"] || recId;
      const url = idToDelete
        ? \`/api/labour-rates?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/labour-rates?rateCode=\${encodeURIComponent(String(rCodeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/labour-rates").then((res) => res.json()).then((data) => {
          if (data?.rates) setSavedRecords(data.rates);
        });
      }).catch((e) => console.error("Error deleting labour rate from DB:", e));
    }

    if (meta.code === "MST-26" || meta.id === "O1-SCR-MST-26") {
      const idToDelete = rec["id"];
      const bpToDelete = rec["franchiseBp"] || recId;
      const url = idToDelete
        ? \`/api/franchise-warehouses?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/franchise-warehouses?franchiseBp=\${encodeURIComponent(String(bpToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/franchise-warehouses").then((res) => res.json()).then((data) => {
          if (data?.warehouses) setSavedRecords(data.warehouses);
        });
      }).catch((e) => console.error("Error deleting franchise warehouse from DB:", e));
    }

    if (meta.code === "MST-27" || meta.id === "O1-SCR-MST-27") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["reasonCode"] || recId;
      const url = idToDelete
        ? \`/api/deviation-reasons?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/deviation-reasons?reasonCode=\${encodeURIComponent(String(rCodeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/deviation-reasons").then((res) => res.json()).then((data) => {
          if (data?.reasons) setSavedRecords(data.reasons);
        });
      }).catch((e) => console.error("Error deleting deviation reason from DB:", e));
    }

    if (meta.code === "MST-28" || meta.id === "O1-SCR-MST-28") {
      const idToDelete = rec["id"];
      const url = idToDelete
        ? \`/api/export-permissions?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/export-permissions?role=\${encodeURIComponent(String(rec["role"]))}&reportGrid=\${encodeURIComponent(String(rec["reportGrid"]))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/export-permissions").then((res) => res.json()).then((data) => {
          if (data?.permissions) setSavedRecords(data.permissions);
        });
      }).catch((e) => console.error("Error deleting export permission from DB:", e));
    }

    if (meta.code === "MST-29" || meta.id === "O1-SCR-MST-29") {
      const idToDelete = rec["id"];
      const domainToDelete = rec["workspaceDomain"] || recId;
      const url = idToDelete
        ? \`/api/google-meet-settings?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/google-meet-settings?workspaceDomain=\${encodeURIComponent(String(domainToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/google-meet-settings").then((res) => res.json()).then((data) => {
          if (data?.settings) setSavedRecords(data.settings);
        });
      }).catch((e) => console.error("Error deleting google meet setting from DB:", e));
    }

    if (meta.code === "MST-30" || meta.id === "O1-SCR-MST-30") {
      const idToDelete = rec["id"];
      const catToDelete = rec["categoryCode"] || recId;
      const url = idToDelete
        ? \`/api/equipment-category-attributes?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/equipment-category-attributes?categoryCode=\${encodeURIComponent(String(catToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/equipment-category-attributes").then((res) => res.json()).then((data) => {
          if (data?.categories) setSavedRecords(data.categories);
        });
      }).catch((e) => console.error("Error deleting equipment category attribute from DB:", e));
    }

    if (meta.code === "MST-31" || meta.id === "O1-SCR-MST-31") {
      const idToDelete = rec["id"];
      const assetToDelete = rec["assetId"] || recId;
      const url = idToDelete
        ? \`/api/tool-vehicle-assets?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/tool-vehicle-assets?assetId=\${encodeURIComponent(String(assetToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/tool-vehicle-assets").then((res) => res.json()).then((data) => {
          if (data?.assets) setSavedRecords(data.assets);
        });
      }).catch((e) => console.error("Error deleting tool/vehicle asset from DB:", e));
    }`;

if (viewFile.includes(delTarget)) {
  viewFile = viewFile.replace(delTarget, delReplacement);
  console.log('Successfully injected Batch 4 delete handlers!');
} else {
  console.error('Delete target not found!');
  process.exit(1);
}

fs.writeFileSync('src/components/masters/MasterScreenView.tsx', viewFile, 'utf8');
console.log('Successfully updated MasterScreenView.tsx with Batch 4 CRUD handlers!');

