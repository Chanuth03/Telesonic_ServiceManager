const fs = require('fs');
const reqDir = 'C:/Users/ChathumiPbss/.gemini/antigravity/brain/13d0b4de-6e6d-429e-9e24-a1a659d9d3ca/requirements';
for (const f of ['Google AI Studio PostgreSQL + Prism.txt', '1. Google AI Studio Dexie.js (Offli.txt']) {
  console.log('=== FILE:', f, '===');
  const str = fs.readFileSync(reqDir + '/' + f, 'utf8');
  const lines = str.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Screen 9') || lines[i].includes('SCR-09') || lines[i].includes('Calculation Run') || lines[i].includes('INC-SCR-09')) {
      console.log(`Line ${i}:`, lines[i].trim());
      for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 25); j++) {
        console.log(`  [${j}]`, lines[j].trim());
      }
    }
  }
}
