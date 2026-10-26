const fs = require('fs');
let c = fs.readFileSync('src/lib/api-handler.ts', 'utf8');

c = c.replace('contacts.map((c) => ({', 'contacts.map((c: any) => ({');
c = c.replace('sites.map((s) => ({', 'sites.map((s: any) => ({');
c = c.replace('records.map((r) => {', 'records.map((r: any) => {');

fs.writeFileSync('src/lib/api-handler.ts', c, 'utf8');
console.log('Fixed implicit any parameters in api-handler.ts');

