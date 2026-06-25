// extract_data.js - Node script to extract all content from TS files into JSON
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src', 'data');
const FILES = ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts'];

function escapeJS(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function parseSections(text) {
  const sections = [];
  const re = /\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)'(?:,\s*content:\s*'([^']*)')?(?:,\s*subs:\s*\[([\s\S]*?)\])?\s*\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const sec = { id: m[1], title: m[2] };
    if (m[3] !== undefined) sec.content = m[3].replace(/\\'/g, "'");
    if (m[4] !== undefined) sec.subs = parseSections(m[4]);
    sections.push(sec);
  }
  return sections;
}

function extractCategory(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  
  const catId = text.match(/id:\s*'([^']+)'/)?.[1] || '';
  const catTitle = text.match(/title:\s*'([^']+)'/)?.[1] || '';
  const catIcon = text.match(/icon:\s*'([^']+)'/)?.[1] || '';
  const catColor = text.match(/color:\s*'([^']+)'/)?.[1] || '';
  const catDesc = text.match(/description:\s*'([^']+)'/)?.[1] || '';
  
  // Find all topics
  const topics = [];
  const topicRegex = /\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*category:\s*'[^']+',\s*description:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*sections:\s*\[([\s\S]*?)\]\s*\}/g;
  
  let m;
  while ((m = topicRegex.exec(text)) !== null) {
    const topic = {
      id: m[1],
      title: m[2],
      desc: m[3].replace(/\\'/g, "'"),
      icon: m[4],
      sections: parseSections(m[5])
    };
    topics.push(topic);
  }
  
  return { id: catId, title: catTitle, icon: catIcon, color: catColor, desc: catDesc, topics };
}

const categories = FILES.map(f => extractCategory(path.join(BASE, f)));

const outputPath = path.join(__dirname, 'docs', 'mikipedia-data.json');
fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf8');

console.log(`Extracted ${categories.length} categories, ${categories.reduce((s,c) => s + c.topics.length, 0)} topics`);
console.log(`Output: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
