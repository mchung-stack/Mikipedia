// build_complete.js - Fix and extract ALL category data, then embed into HTML
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const files = ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts'];

function extractObjectLiteral(text) {
  // Remove imports, exports, type annotations
  text = text.replace(/^import\s+.*?;?\s*$/gm, '');
  text = text.replace(/^export\s+/gm, '');
  text = text.replace(/:\s*Category\s*=/g, ' =');
  
  // Find the '= {' start (may have varying whitespace)
  const eqMatch = text.match(/=\s*\{/);
  if (!eqMatch) return null;
  const eqIdx = eqMatch.index;
  const braceIdx = text.indexOf('{', eqIdx);
  
  let pos = braceIdx + 1; // after '{'
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;
  
  // Count braces to find matching closing }
  while (pos < text.length) {
    const ch = text[pos];
    
    if (escaped) {
      escaped = false;
      pos++;
      continue;
    }
    
    if (inString) {
      if (ch === '\\') escaped = true;
      else if (ch === stringChar) inString = false;
      pos++;
      continue;
    }
    
    if (ch === "'" || ch === '"') {
      inString = true;
      stringChar = ch;
      pos++;
      continue;
    }
    
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') {
      depth--;
      if (depth < 0) {
        // Found the top-level closing }
        return text.substring(braceIdx, pos + 1);
      }
    }
    pos++;
  }
  return null;
}

// Test on all files
console.log('Extracting data...');
const categories = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(dataDir, f), 'utf8');
  const objText = extractObjectLiteral(text);
  if (!objText) {
    console.log(`  ${f}: FAIL - cannot extract object`);
    continue;
  }
  
  // Write as module.exports and require
  const tmpPath = `/tmp/mikipedia-${f.replace('.ts', '.js')}`;
  const moduleJS = 'module.exports = ' + objText + ';';
  fs.writeFileSync(tmpPath, moduleJS);
  
  try {
    delete require.cache[require.resolve(tmpPath)];
    const cat = require(tmpPath);
    categories.push(cat);
    const sectionCount = cat.topics.reduce((s, t) => s + (t.sections ? t.sections.length : 0), 0);
    console.log(`  ✅ ${f}: ${cat.title} (${cat.topics.length} topics, ${sectionCount} sections)`);
  } catch(e) {
    console.log(`  ❌ ${f}: ${e.message}`);
  }
}

// Build final HTML
const jsonData = JSON.stringify(categories);
const htmlPath = path.join(__dirname, 'docs', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const dataMarker = 'const categories = [';
const dataEndMarker = '\n// ── RENDER ──';
const startIdx = html.indexOf(dataMarker);
const endIdx = html.indexOf(dataEndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Cannot find data section in HTML');
  process.exit(1);
}

const newHTML = html.substring(0, startIdx) + 'const categories = ' + jsonData + ';' + html.substring(endIdx);
fs.writeFileSync(htmlPath, newHTML, 'utf8');

const kb = (fs.statSync(htmlPath).size / 1024).toFixed(1);
const totalTopics = categories.reduce((s, c) => s + c.topics.length, 0);
const totalSections = categories.reduce((s, c) => s + c.topics.reduce((s2, t) => s2 + (t.sections ? t.sections.length : 0), 0), 0);

console.log(`\n✅ Final: ${htmlPath} (${kb} KB)`);
console.log(`   ${categories.length} categories, ${totalTopics} topics, ${totalSections} sections`);
