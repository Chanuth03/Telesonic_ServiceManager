const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// 1. Add serialOptions state
const stateTarget = '  const [siteOptions, setSiteOptions] = useState<{ id: number; code: string; name: string; customerId: number }[]>([]);';
const stateReplacement = `  const [siteOptions, setSiteOptions] = useState<{ id: number; code: string; name: string; customerId: number }[]>([]);
  const [serialOptions, setSerialOptions] = useState<{ id: number; serialNo: string; itemName?: string }[]>([]);`;

code = code.replace(stateTarget, stateReplacement);

// 2. Add MST-06 loader in useEffect
const loaderTarget = `    // 7. If this screen is Serial Number Register (MST-05 / O1-SCR-MST-05)`;
const loaderReplacement = `    // 8. If this screen is Equipment / Installed Base (MST-06 / O1-SCR-MST-06)
    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
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
        .catch((e) => console.error("Failed to load customers for equipment screen:", e));

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
        .catch((e) => console.error("Failed to load sites for equipment screen:", e));

      // Pre-load serials
      apiFetch("/api/serials")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.serials && Array.isArray(data.serials)) {
            setSerialOptions(
              data.serials.map((s: any) => ({
                id: s.id,
                serialNo: s.serialNo,
                itemName: s.itemName,
              }))
            );
          }
        })
        .catch((e) => console.error("Failed to load serials for equipment screen:", e));

      // Load equipments from DB
      apiFetch("/api/equipments")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.equipments && Array.isArray(data.equipments)) {
            setSavedRecords(data.equipments);
          }
        })
        .catch((e) => console.error("Failed to load equipments from DB:", e));
      return;
    }

    // 7. If this screen is Serial Number Register (MST-05 / O1-SCR-MST-05)`;

code = code.replace(loaderTarget, loaderReplacement);

// 3. Add MST-06 customer change filter
const filterTarget = `    // If on MST-05 and Customer changed, filter/load that customer's serials`;
const filterReplacement = `    // If on MST-06 and Customer changed, filter/load that customer's equipments
    if ((meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(\`/api/equipments?customerId=\${matched.id}\`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.equipments && Array.isArray(data.equipments)) {
              setSavedRecords(data.equipments);
            }
          })
          .catch((err) => console.error("Failed to load equipments for customer:", err));
      }
    }

    // If on MST-05 and Customer changed, filter/load that customer's serials`;

code = code.replace(filterTarget, filterReplacement);

// 4. Add MST-06 save logic
const saveTarget = `      } else if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {`;
const saveReplacement = `      } else if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
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

        // Resolve serial
        let rawSerial = String(formData["serial"] || formData["serialNo"] || "").trim();
        let matchedSerial = serialOptions.find(
          (s) => s.serialNo.toLowerCase() === rawSerial.toLowerCase() || String(s.id) === rawSerial
        );

        const equipPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
          serialId: matchedSerial ? matchedSerial.id : undefined,
          serialNo: matchedSerial ? matchedSerial.serialNo : rawSerial || undefined,
        };

        // Save Equipment directly to dedicated PostgreSQL table
        apiFetch("/api/equipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(equipPayload),
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
          .catch((e) => console.error("Error saving equipment to DB:", e));
      } else if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {`;

code = code.replace(saveTarget, saveReplacement);

// 5. Add MST-06 delete logic
const delTarget = `    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {`;
const delReplacement = `    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? \`/api/equipments?id=\${encodeURIComponent(String(idToDelete))}\`
        : \`/api/equipments?equipmentId=\${encodeURIComponent(String(eqIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting equipment from DB:", e),
      );
    }

    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {`;

code = code.replace(delTarget, delReplacement);

// 6. Add MST-06 dynamic dropdown fields (Customer, Site, Serial)
const dynFieldTarget = `            } else if (
              (meta.code === "MST-02" || meta.code === "MST-03" || meta.code === "MST-05" || meta.id === "O1-SCR-MST-02" || meta.id === "O1-SCR-MST-03" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "customerId" || f.key === "customerName" || f.key === "customer") &&
              customerOptions.length > 0
            ) {`;

const dynFieldReplacement = `            } else if (
              (meta.code === "MST-02" || meta.code === "MST-03" || meta.code === "MST-05" || meta.code === "MST-06" || meta.id === "O1-SCR-MST-02" || meta.id === "O1-SCR-MST-03" || meta.id === "O1-SCR-MST-05" || meta.id === "O1-SCR-MST-06") &&
              (f.key === "customerId" || f.key === "customerName" || f.key === "customer") &&
              customerOptions.length > 0
            ) {`;

code = code.replace(dynFieldTarget, dynFieldReplacement);

// 7. Add MST-06 site and serial dropdowns
const extraFieldsTarget = `            } else if (
              (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "warehouse" || f.key === "location")
            ) {`;

const extraFieldsReplacement = `            } else if (
              (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") &&
              (f.key === "site" || f.key === "siteName")
            ) {
              // If customer is selected, filter sites for this customer
              const rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
              const matchedCust = customerOptions.find(
                (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
              );
              const availableSites = matchedCust
                ? siteOptions.filter((s) => s.customerId === matchedCust.id)
                : siteOptions;
              fieldDef = {
                ...f,
                type: "select",
                options: availableSites.length > 0 ? availableSites.map((s) => s.name) : ["Default Customer Site"],
              };
            } else if (
              (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") &&
              (f.key === "serial" || f.key === "serialNo") &&
              serialOptions.length > 0
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: serialOptions.map((s) => s.serialNo),
              };
            } else if (
              (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "warehouse" || f.key === "location")
            ) {`;

code = code.replace(extraFieldsTarget, extraFieldsReplacement);

// 8. Remove #ID column from table view for MST-06
const idColTarget = `meta.code !== "MST-05" && meta.id !== "O1-SCR-MST-05" && (`;
const idColReplacement = `meta.code !== "MST-05" && meta.id !== "O1-SCR-MST-05" && meta.code !== "MST-06" && meta.id !== "O1-SCR-MST-06" && (`;
code = code.split(idColTarget).join(idColReplacement);

fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Successfully patched MasterScreenView for MST-06');

