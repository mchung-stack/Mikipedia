// extract_v2.js - Parse TS data files by extracting the exported objects
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src', 'data');
const FILES = ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts'];

function parseTSDataFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  
  // Remove import/export statements
  text = text.replace(/import\s+.*?from\s+['"].*?['"]\s*;?\s*/g, '');
  text = text.replace(/export\s+/g, '');
  
  // Find the category object: const xxxCategory: Category = { ... };
  const objMatch = text.match(/(\w+Category)\s*:\s*Category\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!objMatch) {
    console.error(`Cannot find category object in ${filePath}`);
    return null;
  }
  
  // Extract just the object literal
  let objText = objMatch[2];
  
  // Convert single-quoted strings to double-quoted for JSON compatibility
  // But preserve escaped single quotes
  objText = objText.replace(/(?<!\\)'/g, '"');
  objText = objText.replace(/\\'/g, "'");
  
  try {
    return JSON.parse(objText);
  } catch(e) {
    console.error(`JSON parse error in ${filePath}: ${e.message}`);
    return null;
  }
}

const categories = FILES
  .map(f => parseTSDataFile(path.join(BASE, f)))
  .filter(Boolean);

const outputPath = path.join(__dirname, 'docs', 'mikipedia-data.json');
fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf8');

console.log(`Extracted ${categories.length} categories, ${categories.reduce((s,c) => s + c.topics.length, 0)} topics`);
console.log(`Output: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
