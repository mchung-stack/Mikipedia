// scan_to_json.js - Character-level TS → JSON parser
const fs = require('fs');
const path = require('path');

class Scanner {
  constructor(text) {
    this.t = text;
    this.i = 0;
  }
  skipWS() { while (this.i < this.t.length && /\s/.test(this.t[this.i])) this.i++; }
  
  readString() {
    if (this.t[this.i] !== "'") throw new Error(`Expected quote at ${this.i}, got '${this.t[this.i]}'`);
    this.i++;
    let s = '';
    while (this.i < this.t.length) {
      const ch = this.t[this.i];
      if (ch === '\\') {
        this.i++;
        s += this.t[this.i];
      } else if (ch === "'") {
        this.i++;
        return s;
      } else {
        s += ch;
      }
      this.i++;
    }
    throw new Error('Unterminated string');
  }
  
  readKey() {
    this.skipWS();
    let k = '';
    while (this.i < this.t.length && /[a-zA-Z0-9_]/.test(this.t[this.i])) {
      k += this.t[this.i];
      this.i++;
    }
    return k;
  }
  
  readValue() {
    this.skipWS();
    const ch = this.t[this.i];
    if (ch === "'") return this.readString();
    if (ch === '[') {
      this.i++;
      this.skipWS();
      if (this.t[this.i] === ']') { this.i++; return []; }
      const arr = [];
      while (true) {
        this.skipWS();
        if (this.t[this.i] === ']') { this.i++; return arr; }
        arr.push(this.readValue());
        this.skipWS();
        if (this.t[this.i] === ']') { this.i++; return arr; }
        if (this.t[this.i] !== ',') throw new Error(`Expected , or ] at ${this.i}, got '${this.t[this.i]}'`);
        this.i++; // skip comma
      }
    }
    if (ch === '{') {
      this.i++;
      this.skipWS();
      if (this.t[this.i] === '}') { this.i++; return {}; }
      const obj = {};
      while (true) {
        this.skipWS();
        if (this.t[this.i] === '}') { this.i++; return obj; }
        const key = this.readKey();
        this.skipWS();
        if (this.t[this.i] !== ':') throw new Error(`Expected : at ${this.i}, got '${this.t[this.i]}'`);
        this.i++;
        obj[key] = this.readValue();
        this.skipWS();
        if (this.t[this.i] === '}') { this.i++; return obj; }
        if (this.t[this.i] === ',') { this.i++; }
      }
    }
    throw new Error(`Unexpected char '${ch}' at ${this.i}`);
  }
}

function parseFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  
  // Remove import/export/type annotations
  text = text.replace(/^import\s+.*?;?\s*$/gm, '');
  text = text.replace(/^export\s+/gm, '');
  text = text.replace(/:\s*Category\s*=/g, ' =');
  
  // Find the object start
  const start = text.indexOf('= {');
  if (start === -1) throw new Error('No object found');
  
  const objStart = text.indexOf('{', start);
  const scanner = new Scanner(text.substring(objStart));
  return scanner.readValue();
}

const dataDir = path.join(__dirname, 'src', 'data');
const files = ['culture.ts', 'philosophy.ts', 'science.ts', 'countries.ts', 'history.ts', 'industry.ts', 'lifestyle.ts'];

console.log('Scanning TS files...');
const categories = [];
for (const f of files) {
  try {
    const cat = parseFile(path.join(dataDir, f));
    categories.push(cat);
    const tCount = cat.topics ? cat.topics.length : 0;
    const sCount = cat.topics ? cat.topics.reduce((s, t) => s + (t.sections ? t.sections.length : 0), 0) : 0;
    console.log(`  ✅ ${f}: ${cat.title} (${tCount} topics, ${sCount} sections)`);
  } catch(e) {
    console.log(`  ❌ ${f}: ${e.message}`);
  }
}

// Write to HTML
const jsonData = JSON.stringify(categories);
const htmlPath = path.join(__dirname, 'docs', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const dataMarker = 'const categories = [';
const dataEndMarker = '\n// ── RENDER ──';
const startIdx = html.indexOf(dataMarker);
const endIdx = html.indexOf(dataEndMarker);
const newHTML = html.substring(0, startIdx) + 'const categories = ' + jsonData + ';' + html.substring(endIdx);
fs.writeFileSync(htmlPath, newHTML, 'utf8');

const kb = (fs.statSync(htmlPath).size / 1024).toFixed(1);
const totalT = categories.reduce((s, c) => s + (c.topics ? c.topics.length : 0), 0);
console.log(`\n✅ HTML: ${htmlPath} (${kb} KB) | ${categories.length} cats, ${totalT} topics`);
