const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const changeTarget = `    // If on MST-03 and Customer changed, filter/load that customer's sites
    if ((meta.code === "MST-03" || meta.id === "O1-SCR-MST-03") && (key === "customerName" || key === "customer")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(\`/api/sites?customerId=\${matched.id}\`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.sites && Array.isArray(data.sites)) {
              setSavedRecords(data.sites);
            }
          })
          .catch((err) => console.error("Failed to load sites for customer:", err));
      }
    }`;

const changeReplacement = `${changeTarget}

    // If on MST-05 and Customer changed, filter/load that customer's serials
    if ((meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(\`/api/serials?customerId=\${matched.id}\`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.serials && Array.isArray(data.serials)) {
              setSavedRecords(data.serials);
            }
          })
          .catch((err) => console.error("Failed to load serials for customer:", err));
      }
    }`;

code = code.replace(changeTarget, changeReplacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Added MST-05 customer filter in MasterScreenView');

