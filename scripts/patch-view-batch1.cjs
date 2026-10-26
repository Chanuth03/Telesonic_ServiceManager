const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// 1. Add Loaders for MST-08 through MST-12
const loaderTarget = `    // 9. If this screen is Other-Brand Equipment Registration (MST-07 / O1-SCR-MST-07)`;
const loaderReplacement = `    // 10. MST-08: Multi-Component Equipment System
    if (meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") {
      apiFetch("/api/customers").then((r) => r.json()).then((d) => {
        if (d?.customers) setCustomerOptions(d.customers.map((c: any) => ({ id: c.id, code: c.customerCode, name: c.customerName })));
      });
      apiFetch("/api/sites").then((r) => r.json()).then((d) => {
        if (d?.sites) setSiteOptions(d.sites.map((s: any) => ({ id: s.id, code: s.siteCode, name: s.siteName, customerId: s.customerId })));
      });
      apiFetch("/api/equipment-systems").then((r) => r.json()).then((d) => {
        if (d?.systems) setSavedRecords(d.systems);
      });
      return;
    }

    // 11. MST-09: Employee / Technician
    if (meta.code === "MST-09" || meta.id === "O1-SCR-MST-09") {
      apiFetch("/api/technicians").then((r) => r.json()).then((d) => {
        if (d?.technicians) setSavedRecords(d.technicians);
      });
      return;
    }

    // 12. MST-10: Subcontractors
    if (meta.code === "MST-10" || meta.id === "O1-SCR-MST-10") {
      apiFetch("/api/subcontractors").then((r) => r.json()).then((d) => {
        if (d?.subcontractors) setSavedRecords(d.subcontractors);
      });
      return;
    }

    // 13. MST-11: Service Role Master
    if (meta.code === "MST-11" || meta.id === "O1-SCR-MST-11") {
      apiFetch("/api/service-roles").then((r) => r.json()).then((d) => {
        if (d?.roles) setSavedRecords(d.roles);
      });
      return;
    }

    // 14. MST-12: Service Type / Reason / Priority / Status
    if (meta.code === "MST-12" || meta.id === "O1-SCR-MST-12") {
      apiFetch("/api/service-types").then((r) => r.json()).then((d) => {
        if (d?.serviceTypes) setSavedRecords(d.serviceTypes);
      });
      return;
    }

    // 9. If this screen is Other-Brand Equipment Registration (MST-07 / O1-SCR-MST-07)`;

code = code.replace(loaderTarget, loaderReplacement);

// 2. Add Customer Filter for MST-08
const filterTarget = `    // If on MST-07 and Customer changed, filter/load that customer's equipments`;
const filterReplacement = `    // If on MST-08 and Customer changed, filter/load that customer's systems
    if ((meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(\`/api/equipment-systems?customerId=\${matched.id}\`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.systems) setSavedRecords(data.systems);
          });
      }
    }

    // If on MST-07 and Customer changed, filter/load that customer's equipments`;

code = code.replace(filterTarget, filterReplacement);

// 3. Add Save Logic for MST-08 through MST-12
const saveTarget = `      } else if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {`;
const saveReplacement = `      } else if (meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") {
        let rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
        let matchedCust = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
        );
        let rawSite = String(formData["site"] || formData["siteName"] || "").trim();
        let matchedSite = siteOptions.find(
          (s) => s.name.toLowerCase() === rawSite.toLowerCase() || s.code.toLowerCase() === rawSite.toLowerCase() || String(s.id) === rawSite
        );
        const sysPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
        };
        apiFetch("/api/equipment-systems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sysPayload),
        }).then((res) => res.json()).then((result) => {
          if (result.system) {
            setSavedRecords((prev) => [result.system, ...prev.filter((s) => s["id"] !== result.system["id"] && String(s["systemId"]).toUpperCase() !== String(result.system["systemId"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-09" || meta.id === "O1-SCR-MST-09") {
        apiFetch("/api/technicians", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.technician) {
            setSavedRecords((prev) => [result.technician, ...prev.filter((t) => t["id"] !== result.technician["id"] && String(t["employeeId"]).toUpperCase() !== String(result.technician["employeeId"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-10" || meta.id === "O1-SCR-MST-10") {
        apiFetch("/api/subcontractors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.subcontractor) {
            setSavedRecords((prev) => [result.subcontractor, ...prev.filter((s) => s["id"] !== result.subcontractor["id"] && String(s["vendorCode"]).toUpperCase() !== String(result.subcontractor["vendorCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-11" || meta.id === "O1-SCR-MST-11") {
        apiFetch("/api/service-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.role) {
            setSavedRecords((prev) => [result.role, ...prev.filter((r) => r["id"] !== result.role["id"] && String(r["roleCode"]).toUpperCase() !== String(result.role["roleCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-12" || meta.id === "O1-SCR-MST-12") {
        apiFetch("/api/service-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.serviceType) {
            setSavedRecords((prev) => [result.serviceType, ...prev.filter((t) => t["id"] !== result.serviceType["id"] && String(t["code"]).toUpperCase() !== String(result.serviceType["code"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {`;

code = code.replace(saveTarget, saveReplacement);

// 4. Add Delete Logic for MST-08 through MST-12
const delTarget = `    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {`;
const delReplacement = `    if (meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") {
      const idToDelete = rec["id"];
      const sysIdToDelete = rec["systemId"] || recId;
      const url = idToDelete ? \`/api/equipment-systems?id=\${encodeURIComponent(String(idToDelete))}\` : \`/api/equipment-systems?systemId=\${encodeURIComponent(String(sysIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/equipment-systems").then((res) => res.json()).then((data) => {
          if (data?.systems) setSavedRecords(data.systems);
        });
      });
    }

    if (meta.code === "MST-09" || meta.id === "O1-SCR-MST-09") {
      const idToDelete = rec["id"];
      const empIdToDelete = rec["employeeId"] || recId;
      const url = idToDelete ? \`/api/technicians?id=\${encodeURIComponent(String(idToDelete))}\` : \`/api/technicians?employeeId=\${encodeURIComponent(String(empIdToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/technicians").then((res) => res.json()).then((data) => {
          if (data?.technicians) setSavedRecords(data.technicians);
        });
      });
    }

    if (meta.code === "MST-10" || meta.id === "O1-SCR-MST-10") {
      const idToDelete = rec["id"];
      const vCodeToDelete = rec["vendorCode"] || recId;
      const url = idToDelete ? \`/api/subcontractors?id=\${encodeURIComponent(String(idToDelete))}\` : \`/api/subcontractors?vendorCode=\${encodeURIComponent(String(vCodeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/subcontractors").then((res) => res.json()).then((data) => {
          if (data?.subcontractors) setSavedRecords(data.subcontractors);
        });
      });
    }

    if (meta.code === "MST-11" || meta.id === "O1-SCR-MST-11") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["roleCode"] || recId;
      const url = idToDelete ? \`/api/service-roles?id=\${encodeURIComponent(String(idToDelete))}\` : \`/api/service-roles?roleCode=\${encodeURIComponent(String(rCodeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/service-roles").then((res) => res.json()).then((data) => {
          if (data?.roles) setSavedRecords(data.roles);
        });
      });
    }

    if (meta.code === "MST-12" || meta.id === "O1-SCR-MST-12") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["code"] || recId;
      const url = idToDelete ? \`/api/service-types?id=\${encodeURIComponent(String(idToDelete))}\` : \`/api/service-types?code=\${encodeURIComponent(String(codeToDelete))}\`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/service-types").then((res) => res.json()).then((data) => {
          if (data?.serviceTypes) setSavedRecords(data.serviceTypes);
        });
      });
    }

    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {`;

code = code.replace(delTarget, delReplacement);

// 5. Connect Dropdowns for Customer and Site in MST-08
const custTarget = `meta.code === "MST-07" || meta.id === "O1-SCR-MST-02"`;
const custReplacement = `meta.code === "MST-07" || meta.code === "MST-08" || meta.id === "O1-SCR-MST-02"`;
code = code.replace(custTarget, custReplacement);

const siteTarget = `meta.code === "MST-07" || meta.id === "O1-SCR-MST-06" || meta.id === "O1-SCR-MST-07"`;
const siteReplacement = `meta.code === "MST-07" || meta.code === "MST-08" || meta.id === "O1-SCR-MST-06" || meta.id === "O1-SCR-MST-07" || meta.id === "O1-SCR-MST-08"`;
code = code.replace(siteTarget, siteReplacement);

fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Successfully integrated Batch 1 into MasterScreenView');

