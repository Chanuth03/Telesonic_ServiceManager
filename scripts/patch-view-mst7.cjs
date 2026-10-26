const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// 1. Add MST-07 loader in useEffect
const loaderTarget = `    // 8. If this screen is Equipment / Installed Base (MST-06 / O1-SCR-MST-06)`;
const loaderReplacement = `    // 9. If this screen is Other-Brand Equipment Registration (MST-07 / O1-SCR-MST-07)
    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
      // Pre-load customers
      apiFetch("/api/customers")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.customers && Array.isArray(data.customers)) {
            setCustomerOptions(
              data.customers.map((c: any) => ({
                id: c.id,
                code: c.customerCode,
                name: c.customerName,
              }))
            );
          }
        })
        .catch((e) => console.error("Failed to load customers for MST-07:", e));

      // Pre-load sites
      apiFetch("/api/sites")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.sites && Array.isArray(data.sites)) {
            setSiteOptions(
              data.sites.map((s: any) => ({
                id: s.id,
                code: s.siteCode,
                name: s.siteName,
                customerId: s.customerId,
              }))
            );
          }
        })
        .catch((e) => console.error("Failed to load sites for MST-07:", e));

      // Load other-brand equipments from DB
      apiFetch("/api/other-brand-equipments")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.equipments && Array.isArray(data.equipments)) {
            setSavedRecords(data.equipments);
          }
        })
        .catch((e) => console.error("Failed to load other brand equipments from DB:", e));
      return;
    }

    // 8. If this screen is Equipment / Installed Base (MST-06 / O1-SCR-MST-06)`;

code = code.replace(loaderTarget, loaderReplacement);

// 2. Add MST-07 customer filter
const filterTarget = `    // If on MST-06 and Customer changed, filter/load that customer's equipments`;
const filterReplacement = `    // If on MST-07 and Customer changed, filter/load that customer's equipments
    if ((meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(\`/api/other-brand-equipments?customerId=\${matched.id}\`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.equipments && Array.isArray(data.equipments)) {
              setSavedRecords(data.equipments);
            }
          })
          .catch((err) => console.error("Failed to load other-brand equipments for customer:", err));
      }
    }

    // If on MST-06 and Customer changed, filter/load that customer's equipments`;

code = code.replace(filterTarget, filterReplacement);

// 3. Add MST-07 save logic
const saveTarget = `      } else if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {`;
const saveReplacement = `      } else if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
        // Resolve customer
        let rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
        let matchedCust = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
        );

        // Resolve site
        let rawSite = String(formData["site"] || formData["siteName"] || "").trim();
        let matchedSite = siteOptions.find(
          (s) => s.name.toLowerCase() === rawSite.toLowerCase() || s.code.toLowerCase() === rawSite.toLowerCase() || String(s.id) === rawSite
        );

        const otherPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
        };

        // Save Other Brand Equipment directly to dedicated PostgreSQL table
        apiFetch("/api/other-brand-equipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(otherPayload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.equipment) {
              setSavedRecords((prev) => [
                result.equipment,
                ...prev.filter(
                  (e) =>
                    e["id"] !== result.equipment["id"] &&
                    String(e["equipmentId"]).toUpperCase() !== String(result.equipment["equipmentId"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving other-brand equipment to DB:", e));
      } else if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {`;

code = code.replace(saveTarget, saveReplacement);

// 4. Add MST-07 delete logic
const delTarget = `    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {`;
const delReplacement = `    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
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

code = code.replace(delTarget, delReplacement);

// 5. Add MST-07 dynamic dropdowns (Customer and Site)
const custFieldTarget = `meta.code === "MST-06" || meta.id === "O1-SCR-MST-02" || meta.id === "O1-SCR-MST-03" || meta.id === "O1-SCR-MST-05" || meta.id === "O1-SCR-MST-06"`;
const custFieldReplacement = `meta.code === "MST-06" || meta.code === "MST-07" || meta.id === "O1-SCR-MST-02" || meta.id === "O1-SCR-MST-03" || meta.id === "O1-SCR-MST-05" || meta.id === "O1-SCR-MST-06" || meta.id === "O1-SCR-MST-07"`;
code = code.replace(custFieldTarget, custFieldReplacement);

// Site dropdown for MST-07 too
const siteFieldTarget = `(meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") &&\n              (f.key === "site" || f.key === "siteName")`;
const siteFieldReplacement = `(meta.code === "MST-06" || meta.code === "MST-07" || meta.id === "O1-SCR-MST-06" || meta.id === "O1-SCR-MST-07") &&\n              (f.key === "site" || f.key === "siteName")`;
code = code.replace(siteFieldTarget, siteFieldReplacement);

// 6. Remove #ID column for MST-07
const idColTarget = `meta.code !== "MST-06" && meta.id !== "O1-SCR-MST-06" && (`;
const idColReplacement = `meta.code !== "MST-06" && meta.id !== "O1-SCR-MST-06" && meta.code !== "MST-07" && meta.id !== "O1-SCR-MST-07" && (`;
code = code.split(idColTarget).join(idColReplacement);

fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Successfully patched MasterScreenView for MST-07');

