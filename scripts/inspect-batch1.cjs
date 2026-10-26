const fs = require('fs');
const content = fs.readFileSync('src/data/mastersSpecData.ts', 'utf8');

// Function to extract spec for a code
function getSpec(code) {
  const start = content.indexOf(`code: "${code}"`);
  if (start === -1) return null;
  const block = content.slice(start - 50, start + 3000);
  return block.slice(0, block.indexOf('tabs: ['));
}

['MST-08', 'MST-09', 'MST-10', 'MST-11', 'MST-12'].forEach(c => {
  console.log(`=== ${c} ===`);
  console.log(getSpec(c));
});

