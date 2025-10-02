#!/usr/bin/env python3
"""
Extract EVERY location from all 69 chapters - PROPERLY
Fixed CSV formatting issues
"""

import os
import re
import csv
from collections import defaultdict

def extract_all_locations_from_chapters():
    chapter_dir = "/home/dave/Documents/GitHub/turtlebook/COMPLETED CHAPTERS"
    
    all_chapter_titles = {}
    location_chapters = defaultdict(list)
    location_descriptions = {}
    
    # First pass: Get all chapter titles explicitly
    for filename in sorted(os.listdir(chapter_dir)):
        if not filename.endswith('.md'):
            continue
        
        filepath = os.path.join(chapter_dir, filename)
        
        # Handle special Chapter 38 files
        if 'Chapter 38' in filename or 'Chapter38' in filename:
            # Chapter 38 was split into parts
            chapter_num = 38
            if chapter_num not in all_chapter_titles:
                # Find the title from Part A
                if 'Part A' in filename:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.split('\n')
                        for line in lines[:10]:
                            if 'Chapter 38' in line and ':' in line:
                                title = line.split(':', 1)[1].strip()
                                all_chapter_titles[chapter_num] = title
                                break
            continue
        
        # Regular chapter files
        chapter_match = re.search(r'Chapter(\d+)', filename)
        if not chapter_match:
            continue
        chapter_num = int(chapter_match.group(1))
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            # Get chapter title
            for line in lines[:10]:
                if f'Chapter {chapter_num}' in line and ':' in line:
                    title = line.split(':', 1)[1].strip()
                    # Clean up title - remove any newlines or quotes
                    title = title.replace('\n', ' ').replace('"', '').strip()
                    all_chapter_titles[chapter_num] = title
                    
                    # Get description from first substantive paragraph
                    desc_lines = []
                    for l in lines[2:20]:
                        l = l.strip()
                        if l and not l.startswith('#') and len(l) > 50:
                            # Clean the description too
                            l = l.replace('\n', ' ').replace('"', '').replace(',', ';').strip()
                            desc_lines.append(l)
                            if len(desc_lines) >= 2:
                                break
                    if desc_lines:
                        description = ' '.join(desc_lines)[:300]
                        location_descriptions[title] = description
                    break
    
    # Now we have all chapter titles - categorize them
    locations_data = []
    
    for chapter_num in sorted(all_chapter_titles.keys()):
        title = all_chapter_titles[chapter_num]
        
        # Determine terrain based on title
        title_lower = title.lower()
        if any(x in title_lower for x in ['desert', 'sand', 'dune', 'oasis']):
            terrain = 'Desert'
        elif any(x in title_lower for x in ['forest', 'woods', 'grove', 'tree', 'jungle']):
            terrain = 'Forest'
        elif any(x in title_lower for x in ['mountain', 'peak', 'cliff', 'summit', 'heights']):
            terrain = 'Mountains'
        elif any(x in title_lower for x in ['city', 'metropolis', 'town', 'palace']):
            terrain = 'City'
        elif any(x in title_lower for x in ['ocean', 'sea', 'lake', 'river', 'water', 'tide']):
            terrain = 'Water'
        elif any(x in title_lower for x in ['cave', 'cavern', 'labyrinth', 'dungeon', 'crypt']):
            terrain = 'Dungeon'
        elif any(x in title_lower for x in ['digital', 'pixel', 'cyber', 'algorithmic', 'code']):
            terrain = 'Digital'
        elif any(x in title_lower for x in ['cosmic', 'space', 'star', 'void', 'nebula', 'galaxy']):
            terrain = 'Cosmic'
        elif any(x in title_lower for x in ['village', 'settlement', 'hollow', 'hamlet']):
            terrain = 'Village'
        elif any(x in title_lower for x in ['valley', 'canyon', 'gorge']):
            terrain = 'Valley'
        elif any(x in title_lower for x in ['isle', 'island']):
            terrain = 'Island'
        elif any(x in title_lower for x in ['temple', 'sanctum', 'shrine', 'cathedral']):
            terrain = 'Temple'
        else:
            terrain = 'Mixed'
        
        desc = location_descriptions.get(title, f'Chapter {chapter_num} of the adventure')
        
        locations_data.append({
            'name': title,
            'chapters': str(chapter_num),
            'first_chapter': chapter_num,
            'appearances': 1,
            'terrain': terrain,
            'description': desc
        })
    
    return locations_data

if __name__ == '__main__':
    print("🔍 Extracting EVERY location from all 69 chapters (FIXED)...\n")
    
    locations = extract_all_locations_from_chapters()
    
    print(f"✅ Found {len(locations)} chapter locations!\n")
    
    # Count by terrain
    terrain_counts = defaultdict(int)
    for loc in locations:
        terrain_counts[loc['terrain']] += 1
    
    print("📊 Terrain breakdown:")
    for terrain, count in sorted(terrain_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {terrain}: {count}")
    
    # Save to CSV - PROPERLY ESCAPED
    output_file = '../data/all_chapters_locations.csv'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'chapters', 'first_chapter', 'appearances', 'terrain', 'description'], 
                                quoting=csv.QUOTE_MINIMAL, escapechar='\\')
        writer.writeheader()
        writer.writerows(locations)
    
    print(f"\n💾 Saved to: {output_file}")
    
    # Verify
    print(f"\n📍 All chapter titles (first 10):")
    for i, loc in enumerate(locations[:10], 1):
        print(f"  Ch{loc['first_chapter']:2d}: {loc['name']} ({loc['terrain']})")
    print(f"  ...")
    print(f"\n📍 Last 10 chapters:")
    for loc in locations[-10:]:
        print(f"  Ch{loc['first_chapter']:2d}: {loc['name']} ({loc['terrain']})")
    
    # Check for Chapter 38
    ch38 = [loc for loc in locations if loc['first_chapter'] == 38]
    if ch38:
        print(f"\n✅ Chapter 38 found: {ch38[0]['name']}")
    else:
        print(f"\n⚠️  Chapter 38 NOT FOUND!")
    
    # Count chapters
    chapters_found = set(loc['first_chapter'] for loc in locations)
    print(f"\n📊 Total unique chapters: {len(chapters_found)}/69")
    missing = set(range(1, 70)) - chapters_found
    if missing:
        print(f"⚠️  Missing chapters: {sorted(missing)}")

