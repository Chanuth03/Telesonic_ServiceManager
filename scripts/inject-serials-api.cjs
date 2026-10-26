const fs = require('fs');
let apiHandler = fs.readFileSync('src/lib/api-handler.ts', 'utf8');
const serialsCode = fs.readFileSync('scripts/api-serials-code.ts', 'utf8');

const target = '    // 11. /api/masters — Unified CRUD for all Master Screens (MST-05 to MST-31) in PostgreSQL';
const replacement = serialsCode + '\n    // 12. /api/masters — Unified CRUD for all Master Screens (MST-06 to MST-31) in PostgreSQL';

if (apiHandler.includes(target)) {
  apiHandler = apiHandler.replace(target, replacement);
  fs.writeFileSync('src/lib/api-handler.ts', apiHandler, 'utf8');
  console.log('Successfully injected /api/serials into api-handler.ts');
} else {
  console.error('Target not found in api-handler.ts');
  process.exit(1);
}

