#!/usr/bin/env python3
"""Extract all topic/section data from TS files into a single JSON for the web app."""
import re, json, os

BASE = '/Users/apple/Desktop/work/CSM/mikipedia/src/data'
FILES = ['history.ts', 'culture.ts', 'philosophy.ts', 'science.ts', 'industry.ts', 'countries.ts', 'lifestyle.ts']

def extract_categories():
    categories = []
    for fname in FILES:
        path = os.path.join(BASE, fname)
        with open(path, 'r') as f:
            text = f.read()
        
        # Extract category-level fields
        cat_id = re.search(r"id:\s*'([^']+)'", text).group(1)
        cat_title = re.search(r"title:\s*'([^']+)'", text).group(1)
        cat_icon = re.search(r"icon:\s*'([^']+)'", text).group(1)
        cat_color = re.search(r"color:\s*'([^']+)'", text).group(1)
        cat_desc = re.search(r"description:\s*'([^']+)'", text).group(1)
        
        # Extract topics
        topics = []
        # Find all topic blocks
        topic_blocks = re.findall(r'{\s*id:\s*\'([^\']+)\',\s*title:\s*\'([^\']+)\',\s*category:', text)
        topic_ids = [m[0] for m in topic_blocks]
        topic_titles = [m[1] for m in topic_blocks]
        
        # Find topic descriptions and icons
        topic_descs = re.findall(r"category:\s*'[^']+',\s*description:\s*'([^']+)'", text)
        topic_icons = re.findall(r"icon:\s*'([^']+)',\s*sections:", text)
        
        # Extract sections for each topic
        # Split by topic boundaries
        parts = re.split(r'{\s*id:\s*\'([^\']+)\',\s*title:\s*\'([^\']+)\',\s*category:', text)
        
        topic_idx = 0
        for i in range(1, len(parts), 2):
            tid = parts[i]
            ttitle = parts[i+1]
            block = parts[i+2] if i+2 < len(parts) else ''
            
            # Find the sections array
            sections_match = re.search(r'sections:\s*\[(.*)\]', block, re.DOTALL)
            if sections_match:
                sections_text = sections_match.group(1)
                sections = parse_sections(sections_text)
            else:
                sections = []
            
            desc = topic_descs[topic_idx] if topic_idx < len(topic_descs) else ''
            icon = topic_icons[topic_idx] if topic_idx < len(topic_icons) else ''
            
            topics.append({
                'id': tid,
                'title': ttitle,
                'desc': desc,
                'icon': icon,
                'sections': sections
            })
            topic_idx += 1
        
        categories.append({
            'id': cat_id,
            'title': cat_title,
            'icon': cat_icon,
            'color': cat_color,
            'desc': cat_desc,
            'topics': topics
        })
    
    return categories

def parse_sections(text):
    """Parse sections array text into structured list."""
    sections = []
    # Find each section block
    section_pattern = r'{\s*id:\s*\'([^\']+)\',\s*title:\s*\'([^\']+)\'(?:,\s*content:\s*\'((?:[^\'\\]|\\.)*)\')?(?:,\s*subs:\s*\[(.*?)\])?\s*}'
    
    for match in re.finditer(section_pattern, text, re.DOTALL):
        sid = match.group(1)
        stitle = match.group(2)
        content = match.group(3)
        subs_text = match.group(4)
        
        if content:
            # Unescape quotes
            content = content.replace("\\'", "'")
        
        subs = []
        if subs_text:
            subs = parse_sections(subs_text)
        
        section = {'id': sid, 'title': stitle}
        if content:
            section['content'] = content
        if subs:
            section['subs'] = subs
        
        sections.append(section)
    
    return sections

if __name__ == '__main__':
    cats = extract_categories()
    output_path = os.path.join(BASE, '..', '..', 'docs', 'mikipedia-data.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cats, f, ensure_ascii=False, indent=2)
    print(f"Extracted {len(cats)} categories with {sum(len(c['topics']) for c in cats)} topics to {output_path}")
    print(f"File size: {os.path.getsize(output_path)} bytes")
