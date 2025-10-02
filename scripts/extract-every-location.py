#!/usr/bin/env python3
"""
Extract EVERY location mentioned in all 69 chapters
Not just chapter titles - every named place, landmark, region, etc.
"""

import os
import re
import csv
from collections import defaultdict

def extract_all_locations_from_chapters():
    chapter_dir = "/home/dave/Documents/GitHub/turtlebook/COMPLETED CHAPTERS"
    
    # Patterns for location names
    location_patterns = [
        r'(?:arrived at|reached|entered|left|traveled to|journeyed to|explored|visited|discovered)\s+(?:the\s+)?([A-Z][A-Za-z\s]+(?:Valley|Mountains?|Peak|Forest|Woods?|Grove|Desert|City|Town|Village|Isle?|Sea|Ocean|Lake|River|Canyon|Cavern|Cave|Labyrinth|Temple|Sanctum|Library|Realm|Kingdom|Land|Territory))',
        r'(?:in|at|near|beyond|across|through)\s+(?:the\s+)?([A-Z][A-Za-z\s]+(?:Valley|Mountains?|Peak|Forest|Woods?|Grove|Desert|City|Town|Village|Isle?|Sea|Ocean|Lake|River|Canyon|Cavern|Cave|Labyrinth|Temple|Sanctum|Library|Realm|Kingdom|Land|Territory))',
        r'(?:called|named|known as)\s+([A-Z][A-Za-z\s]+)',
        r'Chapter \d+[^:]*:\s*(.+)$',  # Chapter titles
    ]
    
    all_locations = set()
    location_chapters = defaultdict(list)
    location_descriptions = {}
    
    for filename in sorted(os.listdir(chapter_dir)):
        if not filename.endswith('.md'):
            continue
        
        filepath = os.path.join(chapter_dir, filename)
        chapter_match = re.search(r'Chapter(\d+)', filename)
        if not chapter_match:
            continue
        chapter_num = int(chapter_match.group(1))
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            # Get chapter title location
            for line in lines[:10]:
                if f'Chapter {chapter_num}' in line and ':' in line:
                    title = line.split(':', 1)[1].strip()
                    all_locations.add(title)
                    location_chapters[title].append(chapter_num)
                    
                    # Get first paragraph as description
                    desc_lines = []
                    for l in lines[2:15]:
                        l = l.strip()
                        if l and not l.startswith('#') and len(l) > 40:
                            desc_lines.append(l)
                            if len(desc_lines) >= 2:
                                break
                    if desc_lines and title not in location_descriptions:
                        location_descriptions[title] = ' '.join(desc_lines)[:300]
                    break
            
            # Find all location mentions in content
            for pattern in location_patterns:
                matches = re.finditer(pattern, content, re.MULTILINE)
                for match in matches:
                    location = match.group(1).strip()
                    if len(location) > 3 and location[0].isupper():
                        all_locations.add(location)
                        location_chapters[location].append(chapter_num)
    
    # Convert to sorted list with details
    locations_data = []
    for loc in sorted(all_locations):
        chapters = sorted(set(location_chapters[loc]))
        desc = location_descriptions.get(loc, '')
        
        # Determine terrain
        loc_lower = loc.lower()
        if any(x in loc_lower for x in ['desert', 'sand', 'dune', 'oasis']):
            terrain = 'Desert'
        elif any(x in loc_lower for x in ['forest', 'woods', 'grove', 'tree']):
            terrain = 'Forest'
        elif any(x in loc_lower for x in ['mountain', 'peak', 'cliff', 'summit']):
            terrain = 'Mountains'
        elif any(x in loc_lower for x in ['city', 'metropolis', 'town']):
            terrain = 'City'
        elif any(x in loc_lower for x in ['ocean', 'sea', 'lake', 'river', 'water']):
            terrain = 'Water'
        elif any(x in loc_lower for x in ['cave', 'cavern', 'labyrinth', 'dungeon']):
            terrain = 'Dungeon'
        elif any(x in loc_lower for x in ['digital', 'pixel', 'cyber', 'algorithmic']):
            terrain = 'Digital'
        elif any(x in loc_lower for x in ['cosmic', 'space', 'star', 'void']):
            terrain = 'Cosmic'
        elif any(x in loc_lower for x in ['village', 'settlement', 'hollow']):
            terrain = 'Village'
        elif any(x in loc_lower for x in ['valley', 'canyon']):
            terrain = 'Valley'
        elif any(x in loc_lower for x in ['isle', 'island']):
            terrain = 'Island'
        else:
            terrain = 'Mixed'
        
        locations_data.append({
            'name': loc,
            'chapters': ','.join(map(str, chapters)),
            'first_chapter': chapters[0] if chapters else 0,
            'appearances': len(chapters),
            'terrain': terrain,
            'description': desc
        })
    
    return locations_data

if __name__ == '__main__':
    print("🔍 Extracting EVERY location from all 69 chapters...\n")
    
    locations = extract_all_locations_from_chapters()
    
    print(f"✅ Found {len(locations)} total locations!\n")
    
    # Count by terrain
    terrain_counts = defaultdict(int)
    for loc in locations:
        terrain_counts[loc['terrain']] += 1
    
    print("📊 Terrain breakdown:")
    for terrain, count in sorted(terrain_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {terrain}: {count}")
    
    # Save to CSV
    output_file = '../data/all_locations_complete.csv'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'chapters', 'first_chapter', 'appearances', 'terrain', 'description'])
        writer.writeheader()
        writer.writerows(locations)
    
    print(f"\n💾 Saved to: {output_file}")
    print(f"\n📍 Sample locations:")
    for loc in locations[:20]:
        print(f"  Ch{loc['first_chapter']:2d}: {loc['name']} ({loc['terrain']})")
    print(f"\n  ... and {len(locations) - 20} more!")

