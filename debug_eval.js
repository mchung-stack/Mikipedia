const fs = require('fs');
const text = fs.readFileSync('src/data/history.ts', 'utf8');
let cleaned = text.replace(/^import\s+.*?;?\s*$/gm, '');
cleaned = cleaned.replace(/^export\s+/gm, '');
const match = cleaned.match(/const\s+(\w+)\s*=\s*(\{[\s\S]*\})/);
const objText = match[2];
const lines = objText.split('\n');
try {
  eval('(' + objText + ')');
} catch(e) {
  console.log('Error:', e.message);
  const m2 = e.stack.match(/:(\d+):(\d+)/);
  if (m2) {
    const ln = parseInt(m2[1]);
    console.log('Around line', ln);
    for (let i = Math.max(0,ln-3); i <= Math.min(lines.length-1, ln+2); i++) {
      console.log(i, lines[i].substring(0,200));
    }
  }
}
