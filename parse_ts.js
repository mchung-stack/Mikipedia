// parse_ts.js - Simple recursive descent parser for TS object literals
const fs = require('fs');
const path = require('path');

class Parser {
  constructor(text) {
    this.text = text;
    this.pos = 0;
  }
  
  peek() { return this.text[this.pos]; }
  skipWhitespace() { while (this.pos < this.text.length && /\s/.test(this.text[this.pos])) this.pos++; }
  expect(ch) {
    this.skipWhitespace();
    if (this.text[this.pos] !== ch) throw new Error(`Expected '${ch}' at pos ${this.pos}, got '${this.text[this.pos]}'`);
    this.pos++;
  }
  
  parseString() {
    this.expect("'");
    let result = '';
    while (this.pos < this.text.length && this.text[this.pos] !== "'") {
      if (this.text[this.pos] === '\\') {
        this.pos++;
        result += this.text[this.pos];
      } else {
        result += this.text[this.pos];
      }
      this.pos++;
    }
    this.expect("'");
    return result;
  }
  
  parseKey() {
    this.skipWhitespace();
    let key = '';
    while (this.pos < this.text.length && /[a-zA-Z0-9_]/.test(this.text[this.pos])) {
      key += this.text[this.pos];
      this.pos++;
    }
    return key;
  }
  
  parseValue() {
    this.skipWhitespace();
    const ch = this.text[this.pos];
    
    if (ch === "'") return this.parseString();
    if (ch === '[') return this.parseArray();
    if (ch === '{') return this.parseObject();
    
    throw new Error(`Unexpected character '${ch}' at pos ${this.pos}`);
  }
  
  parseArray() {
    this.expect('[');
    this.skipWhitespace();
    if (this.text[this.pos] === ']') {
      this.pos++;
      return [];
    }
    
    const arr = [];
    arr.push(this.parseValue());
    while (true) {
      this.skipWhitespace();
      if (this.text[this.pos] === ']') {
        this.pos++;
        break;
      }
      this.expect(',');
      arr.push(this.parseValue());
    }
    return arr;
  }
  
  parseObject() {
    this.expect('{');
    this.skipWhitespace();
    if (this.text[this.pos] === '}') {
      this.pos++;
      return {};
    }
    
    const obj = {};
    while (true) {
      this.skipWhitespace();
      if (this.text[this.pos] === '}') {
        this.pos++;
        break;
      }
      const key = this.parseKey();
      this.expect(':');
      obj[key] = this.parseValue();
      this.skipWhitespace();
      if (this.text[this.pos] === ',') {
        this.pos++;
        this.skipWhitespace();
      }
    }
    return obj;
  }
}

function parseFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  
  // Remove imports/exports
  text = text.replace(/^import\s+.*?;?\s*$/gm, '');
  text = text.replace(/^export\s+/gm, '');
  // Remove type annotations
  text = text.replace(/:\s*Category\s*=/g, ' =');
  
  // Find the const variable
  const constMatch = text.match(/const\s+(\w+)\s*=\s*/);
  if (!constMatch) throw new Error('No const assignment found');
  
  const objStart = text.indexOf('{', constMatch.index + constMatch[0].length);
  const objText = text.substring(objStart);
  
  const parser = new Parser(objText);
  return parser.parseObject();
}

const dataDir = path.join(__dirname, 'src', 'data');
const files = ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts'];

console.log('Parsing data files...');
const categories = [];
for (const f of files) {
  try {
    const cat = parseFile(path.join(dataDir, f));
    categories.push(cat);
    console.log(`  ${f}: ${cat.title} (${cat.topics.length} topics)`);
  } catch(e) {
    console.error(`  ${f}: ERROR - ${e.message}`);
  }
}

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
