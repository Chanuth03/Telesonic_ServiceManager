const fs = require('fs');
let apiHandler = fs.readFileSync('src/lib/api-handler.ts', 'utf8');
const equipCode = fs.readFileSync('scripts/api-equipments-code.ts', 'utf8');

const target = '    // 12. /api/masters — Unified CRUD for all Master Screens (MST-06 to MST-31) in PostgreSQL';
const replacement = equipCode + '\n    // 13. /api/masters — Unified CRUD for all Master Screens (MST-07 to MST-31) in PostgreSQL';

if (apiHandler.includes(target)) {
  apiHandler = apiHandler.replace(target, replacement);
  fs.writeFileSync('src/lib/api-handler.ts', apiHandler, 'utf8');
  console.log('Successfully injected /api/equipments into api-handler.ts');
} else {
  console.error('Target not found in api-handler.ts');
  process.exit(1);
}

