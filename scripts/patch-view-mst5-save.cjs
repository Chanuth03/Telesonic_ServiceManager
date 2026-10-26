const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const saveTarget = `      } else if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
        // Save Item directly to dedicated PostgreSQL table
        apiFetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.item) {
              setSavedRecords((prev) => [
                result.item,
                ...prev.filter(
                  (i) =>
                    i["id"] !== result.item["id"] &&
                    String(i["itemCode"]).toUpperCase() !== String(result.item["itemCode"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving item to DB:", e));
      } else {`;

const saveReplacement = `      } else if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
        // Save Item directly to dedicated PostgreSQL table
        apiFetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.item) {
              setSavedRecords((prev) => [
                result.item,
                ...prev.filter(
                  (i) =>
                    i["id"] !== result.item["id"] &&
                    String(i["itemCode"]).toUpperCase() !== String(result.item["itemCode"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving item to DB:", e));
      } else if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
        // Resolve customer
        let rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
        let matchedCust = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
        );

        // Resolve item
        let rawItem = String(formData["item"] || formData["itemName"] || "").trim();
        let matchedItem = itemOptions.find(
          (i) => i.name.toLowerCase() === rawItem.toLowerCase() || i.code.toLowerCase() === rawItem.toLowerCase() || String(i.id) === rawItem
        );

        // Resolve site
        let rawSite = String(formData["site"] || formData["siteName"] || "").trim();
        let matchedSite = siteOptions.find(
          (s) => s.name.toLowerCase() === rawSite.toLowerCase() || s.code.toLowerCase() === rawSite.toLowerCase() || String(s.id) === rawSite
        );

        const serialPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          itemId: matchedItem ? matchedItem.id : undefined,
          itemCode: matchedItem ? matchedItem.code : undefined,
          itemName: matchedItem ? matchedItem.name : rawItem || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
        };

        // Save Serial directly to dedicated PostgreSQL table
        apiFetch("/api/serials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serialPayload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.serial) {
              setSavedRecords((prev) => [
                result.serial,
                ...prev.filter(
                  (s) =>
                    s["id"] !== result.serial["id"] &&
                    String(s["serialNo"]).toUpperCase() !== String(result.serial["serialNo"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving serial to DB:", e));
      } else {`;

code = code.replace(saveTarget, saveReplacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Added MST-05 save handler to MasterScreenView');

