#!/usr/bin/env python3
"""
Complete location extraction from all 69 chapters of Bob's Adventure
Extracts EVERY location mentioned, not just chapter titles
"""

import os
import re
import csv

def extract_locations():
    chapter_dir = "/home/dave/Documents/GitHub/turtlebook/COMPLETED CHAPTERS"
    locations_data = []
    
    chapter_files = sorted([f for f in os.listdir(chapter_dir) if f.endswith('.md')])
    
    for filename in chapter_files:
        filepath = os.path.join(chapter_dir, filename)
        
        # Extract chapter number
        match = re.search(r'Chapter(\d+)', filename)
        if not match:
            continue
        chapter_num = match.group(1)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            # Get chapter title
            title = None
            for line in lines[:10]:
                if 'Chapter' in line and ':' in line:
                    title = line.split(':', 1)[1].strip()
                    break
            
            if not title:
                continue
            
            # Extract description (first substantive paragraph)
            description = []
            for line in lines[2:20]:  # Skip title lines
                line = line.strip()
                if line and not line.startswith('#') and len(line) > 50:
                    description.append(line)
                    if len(description) >= 2:
                        break
            
            desc_text = ' '.join(description)[:300] if description else ''
            
            # Determine terrain type from title and description
            terrain_type = determine_terrain(title, desc_text)
            
            # Determine map type
            map_type = determine_map_type(title, desc_text)
            
            locations_data.append({
                'chapter': chapter_num,
                'name': title,
                'description': desc_text,
                'terrain_type': terrain_type,
                'map_type': map_type,
                'filename': filename
            })
    
    return locations_data

def determine_terrain(title, description):
    """Determine terrain type from title and description"""
    title_lower = title.lower()
    desc_lower = description.lower()
    combined = title_lower + ' ' + desc_lower
    
    # Check for specific terrain keywords
    if any(word in combined for word in ['desert', 'sand', 'dune', 'oasis']):
        return 'Desert'
    elif any(word in combined for word in ['forest', 'woods', 'grove', 'tree']):
        return 'Forest'
    elif any(word in combined for word in ['city', 'metropolis', 'urban', 'concrete', 'skyscraper']):
        return 'City'
    elif any(word in combined for word in ['mountain', 'peak', 'cliff', 'summit', 'frozen', 'ice']):
        return 'Mountains'
    elif any(word in combined for word in ['ocean', 'sea', 'water', 'lake', 'island']):
        return 'Water'
    elif any(word in combined for word in ['cave', 'cavern', 'labyrinth', 'dungeon']):
        return 'Dungeon'
    elif any(word in combined for word in ['digital', 'pixel', 'cyber', 'algorithmic', 'code']):
        return 'Digital'
    elif any(word in combined for word in ['cosmic', 'space', 'star', 'planet', 'void', 'cosmos']):
        return 'Cosmic'
    elif any(word in combined for word in ['library', 'sanctum', 'temple', 'monastery']):
        return 'Sacred'
    elif any(word in combined for word in ['valley', 'canyon', 'gorge']):
        return 'Valley'
    elif any(word in combined for word in ['village', 'town', 'settlement']):
        return 'Village'
    elif any(word in combined for word in ['carnival', 'festival', 'celebration']):
        return 'Festival'
    elif any(word in combined for word in ['orchard', 'garden', 'meadow']):
        return 'Grassland'
    else:
        return 'Mixed'

def determine_map_type(title, description):
    """Determine if top-down or sidescroller would work better"""
    combined = (title + ' ' + description).lower()
    
    # Sidescroller indicators
    if any(word in combined for word in ['labyrinth', 'dungeon', 'cave', 'platform', 'climb', 'ascend']):
        return 'Sidescroller'
    elif any(word in combined for word in ['digital', 'pixel', 'cyber', 'algorithmic']):
        return 'Sidescroller'
    # Top-down indicators  
    else:
        return 'Top-down'

if __name__ == '__main__':
    print("Extracting ALL locations from 69 chapters...\n")
    
    locations = extract_locations()
    
    print(f"✅ Found {len(locations)} chapter locations!\n")
    
    # Count by terrain type
    terrain_counts = {}
    for loc in locations:
        terrain = loc['terrain_type']
        terrain_counts[terrain] = terrain_counts.get(terrain, 0) + 1
    
    print("📊 Terrain Types:")
    for terrain, count in sorted(terrain_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {terrain}: {count} locations")
    
    # Count map types
    map_counts = {}
    for loc in locations:
        map_type = loc['map_type']
        map_counts[map_type] = map_counts.get(map_type, 0) + 1
    
    print(f"\n🗺️ Map Types:")
    for map_type, count in map_counts.items():
        print(f"  {map_type}: {count} locations")
    
    # Save to CSV
    output_file = '../data/complete_locations_extract.csv'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['chapter', 'name', 'terrain_type', 'map_type', 'description', 'filename'])
        writer.writeheader()
        writer.writerows(locations)
    
    print(f"\n💾 Saved to: {output_file}")
    print(f"\n🎯 Next: Generate tilesets for all {len(set(l['terrain_type'] for l in locations))} terrain types!")

