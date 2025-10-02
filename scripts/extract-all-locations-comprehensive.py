#!/usr/bin/env python3
"""
Extract EVERY location mentioned in all 69 chapters
Not just chapter titles - every named place, landmark, region, city, forest, etc.
"""

import os
import re
from collections import defaultdict

def extract_all_locations_from_content():
    chapter_dir = "/home/dave/Documents/GitHub/turtlebook/COMPLETED CHAPTERS"
    
    # Track locations and which chapters they appear in
    location_mentions = defaultdict(set)
    location_contexts = {}
    
    # Patterns for finding locations
    # Looking for capitalized multi-word names that sound like places
    location_patterns = [
        # Explicit location indicators
        r'(?:in|at|to|from|near|through|across|beyond|within)\s+(?:the\s+)?([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,4}(?:\s+(?:Forest|Woods?|Grove|Desert|Mountain|Peak|Valley|Canyon|Cave|Cavern|Labyrinth|City|Town|Village|Isle?|Sea|Ocean|Lake|River|Temple|Sanctum|Library|Realm|Kingdom|Palace|Tower|Castle|Hall|Chamber|Garden|Oasis|Dune|Cliff|Ridge|Summit|Highlands?|Lowlands?|Plains?|Meadow|Glade|Hollow|Haven|Sanctuary))+)',
        
        # Chapter titles (these are definitely locations)
        r'Chapter \d+:\s+(.+)$',
        
        # Named places in quotes or emphasized
        r'(?:called|named|known as)\s+"([A-Z][^"]+)"',
        r'(?:called|named|known as)\s+([A-Z][A-Za-z\s]+)',
        
        # Proper nouns that end with location words
        r'\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3}\s+(?:Forest|Woods?|Grove|Desert|Mountain|Peak|Valley|Canyon|Cave|Cavern|Labyrinth|City|Town|Village|Isle?|Sea|Ocean|Lake|River|Temple|Sanctum|Library|Realm|Kingdom|Palace|Tower|Castle|Hall|Chamber|Garden|Oasis|Dune|Cliff|Ridge|Summit|Highlands?|Lowlands?|Plains?|Meadow|Glade|Hollow|Haven|Sanctuary))\b',
    ]
    
    print("📖 Reading all 69 chapters and extracting locations...\n")
    
    for filename in sorted(os.listdir(chapter_dir)):
        if not filename.endswith('.md'):
            continue
        
        filepath = os.path.join(chapter_dir, filename)
        
        # Handle Chapter 38 parts
        if 'Chapter 38' in filename or 'Chapter38' in filename:
            chapter_num = 38
        else:
            chapter_match = re.search(r'Chapter(\d+)', filename)
            if not chapter_match:
                continue
            chapter_num = int(chapter_match.group(1))
        
        print(f"  Reading Chapter {chapter_num}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Extract locations using all patterns
            for pattern in location_patterns:
                matches = re.finditer(pattern, content, re.MULTILINE)
                for match in matches:
                    location = match.group(1).strip()
                    
                    # Clean up the location name
                    location = location.replace('\n', ' ').replace('  ', ' ').strip()
                    
                    # Filter out noise
                    if len(location) < 3:
                        continue
                    if not location[0].isupper():
                        continue
                    
                    # Skip common false positives
                    skip_words = ['The End', 'Chapter', 'Uncle Matt', 'Bob', 'Matt', 'Uncle', 'Magical Talking Turtle']
                    if any(skip in location for skip in skip_words):
                        continue
                    
                    # Add to tracking
                    location_mentions[location].add(chapter_num)
                    
                    # Store context (first 200 chars around mention)
                    if location not in location_contexts:
                        match_pos = match.start()
                        context_start = max(0, match_pos - 100)
                        context_end = min(len(content), match_pos + 200)
                        context = content[context_start:context_end].replace('\n', ' ')
                        location_contexts[location] = context.strip()
    
    # Convert to list with metadata
    locations_data = []
    
    for location, chapters in sorted(location_mentions.items()):
        chapters_list = sorted(list(chapters))
        
        # Categorize by terrain
        loc_lower = location.lower()
        if any(x in loc_lower for x in ['desert', 'sand', 'dune', 'oasis']):
            terrain = 'Desert'
        elif any(x in loc_lower for x in ['forest', 'woods', 'grove', 'tree', 'jungle']):
            terrain = 'Forest'
        elif any(x in loc_lower for x in ['mountain', 'peak', 'cliff', 'summit', 'ridge', 'highland']):
            terrain = 'Mountains'
        elif any(x in loc_lower for x in ['city', 'metropolis', 'town', 'palace']):
            terrain = 'City'
        elif any(x in loc_lower for x in ['ocean', 'sea', 'lake', 'river', 'water', 'tide']):
            terrain = 'Water'
        elif any(x in loc_lower for x in ['cave', 'cavern', 'labyrinth', 'dungeon', 'crypt']):
            terrain = 'Dungeon'
        elif any(x in loc_lower for x in ['digital', 'pixel', 'cyber', 'algorithmic', 'code']):
            terrain = 'Digital'
        elif any(x in loc_lower for x in ['cosmic', 'space', 'star', 'void', 'nebula', 'galaxy', 'cosmos']):
            terrain = 'Cosmic'
        elif any(x in loc_lower for x in ['village', 'settlement', 'hollow', 'hamlet', 'haven']):
            terrain = 'Village'
        elif any(x in loc_lower for x in ['valley', 'canyon', 'gorge', 'glade', 'meadow']):
            terrain = 'Valley'
        elif any(x in loc_lower for x in ['isle', 'island']):
            terrain = 'Island'
        elif any(x in loc_lower for x in ['temple', 'sanctum', 'shrine', 'cathedral', 'sanctuary']):
            terrain = 'Temple'
        elif any(x in loc_lower for x in ['garden', 'orchard']):
            terrain = 'Garden'
        elif any(x in loc_lower for x in ['library', 'hall', 'chamber', 'tower']):
            terrain = 'Structure'
        else:
            terrain = 'Mixed'
        
        context = location_contexts.get(location, '')
        
        locations_data.append({
            'name': location,
            'chapters': ','.join(map(str, chapters_list)),
            'first_chapter': chapters_list[0],
            'appearances': len(chapters_list),
            'terrain': terrain,
            'description': context[:300] if context else f'Mentioned in Chapter {chapters_list[0]}'
        })
    
    return locations_data

if __name__ == '__main__':
    print("🗺️  COMPREHENSIVE LOCATION EXTRACTION")
    print("=" * 70)
    print("Extracting EVERY location mentioned across all 69 chapters...\n")
    
    locations = extract_all_locations_from_content()
    
    print(f"\n✅ Found {len(locations)} unique locations!\n")
    
    # Statistics
    terrain_counts = defaultdict(int)
    multi_chapter = 0
    for loc in locations:
        terrain_counts[loc['terrain']] += 1
        if loc['appearances'] > 1:
            multi_chapter += 1
    
    print("📊 Terrain breakdown:")
    for terrain, count in sorted(terrain_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {terrain}: {count} locations")
    
    print(f"\n📍 Locations appearing in multiple chapters: {multi_chapter}")
    
    # Top recurring locations
    recurring = sorted([loc for loc in locations if loc['appearances'] > 2], 
                      key=lambda x: x['appearances'], reverse=True)
    if recurring:
        print(f"\n⭐ Most frequently mentioned locations:")
        for loc in recurring[:10]:
            print(f"  {loc['name']}: {loc['appearances']} chapters")
    
    # Save to CSV
    import csv
    output_file = '../data/all_locations_comprehensive.csv'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'chapters', 'first_chapter', 'appearances', 'terrain', 'description'],
                                quoting=csv.QUOTE_MINIMAL, escapechar='\\')
        writer.writeheader()
        writer.writerows(locations)
    
    print(f"\n💾 Saved to: {output_file}")
    print(f"\n📋 Sample locations:")
    for loc in locations[:15]:
        print(f"  Ch{loc['first_chapter']:2d}: {loc['name'][:50]} ({loc['terrain']})")
    print(f"  ... and {len(locations) - 15} more!")

