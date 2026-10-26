const fs = require('fs');
const content = fs.readFileSync('src/data/mastersSpecData.ts', 'utf8');

// List all master specs
const regex = /id:\s*"(O1-SCR-MST-\d+)",\s*code:\s*"(MST-\d+)",\s*name:\s*"([^"]+)"/g;
let match;
const screens = [];
while ((match = regex.exec(content)) !== null) {
  screens.push({ id: match[1], code: match[2], name: match[3] });
}
console.log('Total masters found:', screens.length);
screens.forEach(s => console.log(`${s.code}: ${s.name}`));

