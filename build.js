const fs = require('fs'), path = require('path');

class Scanner {
  constructor(t) { this.t = t; this.i = 0; }
  skipWS() { while (this.i < this.t.length && /\s/.test(this.t[this.i])) this.i++; }
  readString() {
    this.i++; let s = '';
    while (this.i < this.t.length) {
      if (this.t[this.i] === '\\') { this.i++; s += this.t[this.i]; }
      else if (this.t[this.i] === "'") { this.i++; return s; }
      else s += this.t[this.i];
      this.i++;
    }
    throw new Error('Unterminated string');
  }
  readKey() { this.skipWS(); let k = ''; while (this.i < this.t.length && /[a-zA-Z0-9_]/.test(this.t[this.i])) { k += this.t[this.i]; this.i++; } return k; }
  readValue() {
    this.skipWS(); const ch = this.t[this.i];
    if (ch === "'") return this.readString();
    if (ch === '[') { this.i++; this.skipWS(); const arr = []; while (true) { this.skipWS(); if (this.t[this.i] === ']') { this.i++; return arr; } arr.push(this.readValue()); this.skipWS(); if (this.t[this.i] === ']') { this.i++; return arr; } if (this.t[this.i] !== ',') throw new Error(`Expected , at ${this.i}`); this.i++; } }
    if (ch === '{') { this.i++; this.skipWS(); const obj = {}; while (true) { this.skipWS(); if (this.t[this.i] === '}') { this.i++; return obj; } const key = this.readKey(); this.skipWS(); if (this.t[this.i] !== ':') throw new Error(`Expected : at ${this.i}`); this.i++; obj[key] = this.readValue(); this.skipWS(); if (this.t[this.i] === '}') { this.i++; return obj; } if (this.t[this.i] === ',') { this.i++; } } }
    throw new Error(`Unexpected '${ch}' at ${this.i}`);
  }
}

function parseFile(fp) {
  let t = fs.readFileSync(fp,'utf8');
  t = t.replace(/^import\s+.*?;?\s*$/gm,'').replace(/^export\s+/gm,'').replace(/:\s*Category\s*=/g,' =');
  const s = t.indexOf('= {'), o = t.indexOf('{', s);
  return new Scanner(t.substring(o)).readValue();
}

const dir = path.join(__dirname,'src','data');
const cats = [];
for (const f of ['history.ts','culture.ts','philosophy.ts','science.ts','industry.ts','countries.ts','lifestyle.ts']) {
  const c = parseFile(path.join(dir,f));
  cats.push(c);
  const tc = c.topics.length, sc = c.topics.reduce((a,t)=>a+(t.sections?t.sections.length:0),0);
  console.log(`  ${c.title}: ${tc} topics, ${sc} sections`);
}

const json = JSON.stringify(cats);
let html = fs.readFileSync(path.join(__dirname,'docs','index.html'),'utf8');
const m = 'const categories = [', e = '\n// ── RENDER ──';
html = html.substring(0,html.indexOf(m)) + m + json + ';' + html.substring(html.indexOf(e));
fs.writeFileSync(path.join(__dirname,'docs','index.html'), html, 'utf8');
console.log(`\nHTML: ${(html.length/1024).toFixed(1)} KB | ${cats.length} categories, ${cats.reduce((a,c)=>a+c.topics.length,0)} topics`);
