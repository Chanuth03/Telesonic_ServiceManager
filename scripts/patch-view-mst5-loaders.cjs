const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// 1. Add itemOptions state
const stateTarget = '  const [customerOptions, setCustomerOptions] = useState<{ id: number; code: string; name: string }[]>([]);';
const stateReplacement = `  const [customerOptions, setCustomerOptions] = useState<{ id: number; code: string; name: string }[]>([]);
  const [itemOptions, setItemOptions] = useState<{ id: number; code: string; name: string }[]>([]);
  const [siteOptions, setSiteOptions] = useState<{ id: number; code: string; name: string; customerId: number }[]>([]);`;

code = code.replace(stateTarget, stateReplacement);

// 2. Add MST-05 loader in useEffect
const loaderTarget = `    // 6. If this screen is Item Master (MST-04 / O1-SCR-MST-04)
    if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
      apiFetch("/api/items")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.items && Array.isArray(data.items)) {
            setSavedRecords(data.items);
          }
        })
        .catch((err) => console.error("Failed to load items from DB:", err));
      return;
    }`;

const loaderReplacement = `${loaderTarget}

    // 7. If this screen is Serial Number Register (MST-05 / O1-SCR-MST-05)
    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
      // Pre-load items for Item dropdown
      apiFetch("/api/items")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.items && Array.isArray(data.items)) {
            setItemOptions(
              data.items.map((i: any) => ({
                id: i.id,
                code: i.itemCode,
                name: i.itemName,
              }))
            );
          }
        })
        .catch((e) => console.error("Failed to load items for serial screen:", e));

      // Pre-load customers for Customer dropdown
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
        .catch((e) => console.error("Failed to load customers for serial screen:", e));

      // Pre-load sites for Site dropdown
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
        .catch((e) => console.error("Failed to load sites for serial screen:", e));

      // Load serials from DB
      apiFetch("/api/serials")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.serials && Array.isArray(data.serials)) {
            setSavedRecords(data.serials);
          }
        })
        .catch((e) => console.error("Failed to load serials from DB:", e));
      return;
    }`;

code = code.replace(loaderTarget, loaderReplacement);

fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Successfully updated MasterScreenView with MST-05 loaders');

