// build_v3.js - Use require-like approach to load TS data files
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataDir = path.join(__dirname, 'src', 'data');

function loadCategory(filename) {
  let text = fs.readFileSync(path.join(dataDir, filename), 'utf8');
  
  // Remove TypeScript-specific syntax
  text = text.replace(/^import\s+.*?;?\s*$/gm, '');
  text = text.replace(/^export\s+/gm, '');
  // Remove type annotations
  text = text.replace(/:\s*Category\s*=/g, ' =');
  text = text.replace(/:\s*ContentSection\[\]/g, '');
  
  // Find the const variable assignment
  const match = text.match(/const\s+(\w+)\s*=\s*(\{[\s\S]*\})/);
  if (!match) {
    console.error(`No object found in ${filename}`);
    return null;
  }
  
  const varName = match[1];
  const objText = match[2];
  
  // Run in a sandbox
  const sandbox = {};
  vm.createContext(sandbox);
  try {
    vm.runInContext(`${varName} = ${objText}`, sandbox);
    return sandbox[varName];
  } catch(e) {
    console.error(`Error in ${filename}: ${e.message}`);
    // Print context around error
    const lines = objText.split('\n');
    const stackMatch = e.stack?.match(/<anonymous>:(\d+):(\d+)/);
    if (stackMatch) {
      const errLine = parseInt(stackMatch[1]);
      console.error(`  Near line ${errLine}:`);
      for (let i = Math.max(0, errLine - 3); i < Math.min(lines.length, errLine + 2); i++) {
        console.error(`  ${i + 1}: ${lines[i].substring(0, 100)}`);
      }
    }
    return null;
  }
}

console.log('Loading data files...');
const categories = [];
for (const f of ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts']) {
  const cat = loadCategory(f);
  if (cat) {
    categories.push(cat);
    console.log(`  ${f}: ${cat.title} (${cat.topics.length} topics)`);
  }
}

const jsonData = JSON.stringify(categories);

// Read existing HTML
const htmlPath = path.join(__dirname, 'docs', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace the inline categories data
const dataMarker = 'const categories = [';
const dataEndMarker = '\n// ── RENDER ──';

const startIdx = html.indexOf(dataMarker);
const endIdx = html.indexOf(dataEndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Cannot find data section in HTML');
  process.exit(1);
}

const before = html.substring(0, startIdx);
const after = html.substring(endIdx);
const newHTML = before + 'const categories = ' + jsonData + ';' + after;

// Write output
const outputPath = path.join(__dirname, 'docs', 'index.html');
fs.writeFileSync(outputPath, newHTML, 'utf8');
console.log(`\nOutput: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
console.log(`Total topics: ${categories.reduce((s, c) => s + c.topics.length, 0)}`);
