const fs = require('fs');
const content = fs.readFileSync('src/data/mastersSpecData.ts', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('MST-06'));
console.log('MST-06 found at line:', idx);
if (idx !== -1) {
  console.log(lines.slice(idx - 2, idx + 140).join('\n'));
}

