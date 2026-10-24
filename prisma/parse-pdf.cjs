const fs = require('fs');
const zlib = require('zlib');

const p = 'C:/Users/ChathumiPbss/.gemini/antigravity/brain/13d0b4de-6e6d-429e-9e24-a1a659d9d3ca/requirements/Telesonic_Lanka_Incentive_and_Commission_Module_Development_Requirements 01102026.pdf';
const buf = fs.readFileSync(p);

// Find stream ... endstream
let pos = 0;
let allText = '';

while (pos < buf.length) {
  const streamIdx = buf.indexOf('stream', pos);
  if (streamIdx === -1) break;
  
  // Stream starts after newline
  let start = streamIdx + 6;
  if (buf[start] === 0x0d && buf[start+1] === 0x0a) start += 2;
  else if (buf[start] === 0x0a || buf[start] === 0x0d) start += 1;
  
  const endIdx = buf.indexOf('endstream', start);
  if (endIdx === -1) break;
  
  const streamData = buf.subarray(start, endIdx);
  try {
    const uncompressed = zlib.inflateSync(streamData);
    const text = uncompressed.toString('latin1');
    allText += text + '\n';
  } catch (e) {
    // Not deflate or uncompressed
  }
  
  pos = endIdx + 9;
}

console.log('Total extracted uncompressed text length:', allText.length);

// Extract text within BT ... ET blocks
const textBlocks = [];
const btRegex = /BT[\s\S]*?ET/g;
let match;
while ((match = btRegex.exec(allText)) !== null) {
  // extract strings inside ( ... ) or Tj / TJ
  const block = match[0];
  const tjRegex = /\((.*?)\)\s*Tj/g;
  let tjMatch;
  let blockText = '';
  while ((tjMatch = tjRegex.exec(block)) !== null) {
    blockText += tjMatch[1] + ' ';
  }
  if (blockText.trim()) textBlocks.push(blockText.trim());
}

const fullDoc = textBlocks.join('\n');
console.log('Joined text blocks length:', fullDoc.length);

const searchTerms = ['INC-SCR-09', 'SCR-09', 'Screen 9', 'Calculation Run', 'Calculation Engine', 'Screen 09'];
for (const term of searchTerms) {
  let idx = 0;
  while ((idx = fullDoc.indexOf(term, idx)) !== null && idx !== -1) {
    console.log(`\n=== MATCH FOR "${term}" AT ${idx} ===`);
    console.log(fullDoc.slice(Math.max(0, idx - 200), idx + 1200));
    idx += term.length;
  }
}
