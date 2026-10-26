const fs = require('fs');
let apiHandler = fs.readFileSync('src/lib/api-handler.ts', 'utf8');
const batch1Code = fs.readFileSync('scripts/api-batch1-code.ts', 'utf8');

const target = '    // 14. /api/masters — Unified CRUD for all Master Screens (MST-08 to MST-31) in PostgreSQL';
const replacement = batch1Code + '\n    // 19. /api/masters — Unified CRUD for all Master Screens (MST-13 to MST-31) in PostgreSQL';

if (apiHandler.includes(target)) {
  apiHandler = apiHandler.replace(target, replacement);
  fs.writeFileSync('src/lib/api-handler.ts', apiHandler, 'utf8');
  console.log('Successfully injected Batch 1 APIs into api-handler.ts');
} else {
  console.error('Target not found in api-handler.ts');
  process.exit(1);
}

