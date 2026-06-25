// extract_final.js - Copy TS files to temp .js files and require them
const fs = require('fs');
const path = require('path');
const os = require('os');

const dataDir = path.join(__dirname, 'src', 'data');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mikipedia-'));

const files = ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts'];

// Also need to copy types/index.ts
const typesSrc = path.join(__dirname, 'src', 'types', 'index.ts');
const typesDst = path.join(tmpDir, 'types.js');
fs.mkdirSync(path.join(tmpDir, 'types'));
fs.copyFileSync(typesSrc, typesDst);

const categories = [];

for (const f of files) {
  const src = path.join(dataDir, f);
  const dst = path.join(tmpDir, f.replace('.ts', '.js'));
  
  let text = fs.readFileSync(src, 'utf8');
  // Rewrite imports
  text = text.replace(/import\s+\{\s*(\w+)(?:\s*,\s*(\w+))*\s*\}\s+from\s+['"]\.\.\/types['"]/g, '');
  text = text.replace(/import\s+\{\s*(\w+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, (match, name, importPath) => {
    // Replace .ts extension with nothing (will be resolved)
    return '';
  });
  
  // Change export const xxx: Category = { ... } to module.exports = { ... }
  text = text.replace(/export\s+const\s+\w+Category\s*:\s*Category\s*=\s*/g, 'module.exports = ');
  
  fs.writeFileSync(dst, text, 'utf8');
  
  try {
    // Clear require cache
    delete require.cache[require.resolve(dst)];
    const cat = require(dst);
    categories.push(cat);
    console.log(`  ${f}: ${cat.title} (${cat.topics.length} topics)`);
  } catch(e) {
    console.error(`  ${f}: ERROR - ${e.message}`);
  }
}

// Clean up
fs.rmSync(tmpDir, { recursive: true, force: true });

const jsonData = JSON.stringify(categories);

// Read existing HTML and inject data
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

const outputPath = path.join(__dirname, 'docs', 'index.html');
fs.writeFileSync(outputPath, newHTML, 'utf8');
console.log(`\nOutput: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
console.log(`Total topics: ${categories.reduce((s, c) => s + c.topics.length, 0)}`);
