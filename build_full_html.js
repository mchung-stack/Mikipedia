// build_full_html.js
// Read the existing preview.html and inject the full TS data as inline JS
const fs = require('fs');
const path = require('path');

// Step 1: Read all TS data files and convert to JS objects
const dataDir = path.join(__dirname, 'src', 'data');

function loadTSData(filename) {
  const text = fs.readFileSync(path.join(dataDir, filename), 'utf8');
  // Remove imports/exports, then eval the object literal
  let cleaned = text.replace(/^import\s+.*?;?\s*$/gm, '');
  cleaned = cleaned.replace(/^export\s+/gm, '');
  
  // Find the variable assignment: const xxxCategory: Category = { ... };
  const match = cleaned.match(/const\s+(\w+Category)\s*:\s*Category\s*=\s*(\{[\s\S]*\})/);
  if (!match) {
    console.error(`Cannot parse ${filename}`);
    return null;
  }
  
  const objText = match[2];
  try {
    return eval('(' + objText + ')');
  } catch(e) {
    console.error(`Eval error in ${filename}: ${e.message}`);
    return null;
  }
}

console.log('Loading data files...');
const categories = [];
for (const f of ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts']) {
  const cat = loadTSData(f);
  if (cat) {
    categories.push(cat);
    console.log(`  ${f}: ${cat.title} (${cat.topics.length} topics)`);
  }
}

const jsonData = JSON.stringify(categories);

// Step 2: Read existing HTML
const htmlPath = path.join(__dirname, 'docs', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Step 3: Replace the inline categories data with full data
// Find the categories array in the script
const dataMarker = 'const categories = [';
const dataEndMarker = '// ── RENDER ──';

const startIdx = html.indexOf(dataMarker);
const endIdx = html.indexOf(dataEndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Cannot find data section in HTML');
  process.exit(1);
}

const before = html.substring(0, startIdx);
const after = html.substring(endIdx);
const newHTML = before + 'const categories = ' + jsonData + ';\n\n' + after;

// Write output
const outputPath = path.join(__dirname, 'docs', 'index.html');
fs.writeFileSync(outputPath, newHTML, 'utf8');
console.log(`\nOutput: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
console.log(`Total topics: ${categories.reduce((s, c) => s + c.topics.length, 0)}`);
