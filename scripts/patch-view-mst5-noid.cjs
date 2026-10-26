const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

const thTarget = '{meta.code !== "MST-02" && meta.id !== "O1-SCR-MST-02" && meta.code !== "MST-03" && meta.id !== "O1-SCR-MST-03" && meta.code !== "MST-04" && meta.id !== "O1-SCR-MST-04" && (';
const thReplacement = '{meta.code !== "MST-02" && meta.id !== "O1-SCR-MST-02" && meta.code !== "MST-03" && meta.id !== "O1-SCR-MST-03" && meta.code !== "MST-04" && meta.id !== "O1-SCR-MST-04" && meta.code !== "MST-05" && meta.id !== "O1-SCR-MST-05" && (';

code = code.split(thTarget).join(thReplacement);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Removed #ID column for MST-05');

