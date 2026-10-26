import fs from 'fs';

const specData = fs.readFileSync('src/data/mastersSpecData.ts', 'utf8');

// Function to extract screen spec
function getScreen(code: string) {
  const codeIdx = specData.indexOf(`code: "${code}"`);
  if (codeIdx === -1) return null;
  const chunk = specData.slice(codeIdx - 50, codeIdx + 4000);
  const fieldsStart = chunk.indexOf('fields: [');
  const fieldsEnd = chunk.indexOf('tabs: [');
  return chunk.slice(0, fieldsEnd);
}

['MST-08', 'MST-09', 'MST-10', 'MST-11', 'MST-12'].forEach(code => {
  console.log(`\n================== ${code} ==================`);
  console.log(getScreen(code));
});

