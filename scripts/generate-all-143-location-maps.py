#!/usr/bin/env python3
"""
Generate maps for ALL 143 locations + comprehensive world map with journey markers
"""

import json
import os
import csv
import random
from PIL import Image, ImageDraw, ImageFont
import math

def load_wang_tileset(metadata_path, image_path):
    """Load Wang tileset."""
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    sprite_sheet = Image.open(image_path)
    tiles = {}
    
    for tile in metadata['tileset_data']['tiles']:
        corners = tile['corners']
        bbox = tile['bounding_box']
        
        tile_img = sprite_sheet.crop((
            bbox['x'], bbox['y'],
            bbox['x'] + bbox['width'],
            bbox['y'] + bbox['height']
        ))
        
        nw = 1 if corners['NW'] == 'upper' else 0
        ne = 1 if corners['NE'] == 'upper' else 0
        sw = 1 if corners['SW'] == 'upper' else 0
        se = 1 if corners['SE'] == 'upper' else 0
        wang_idx = nw * 8 + ne * 4 + sw * 2 + se
        
        tiles[wang_idx] = tile_img
    
    tile_size = metadata['tileset_image']['dimensions']['width'] // 4
    
    return {
        'tiles': tiles,
        'tile_size': tile_size
    }

def create_terrain_layout(width, height, seed, density=0.4):
    """Create procedural terrain layout."""
    random.seed(seed)
    grid = [[0 for _ in range(width + 1)] for _ in range(height + 1)]
    
    for y in range(height + 1):
        for x in range(width + 1):
            center_x, center_y = width // 2, height // 2
            dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
            max_dist = ((width / 2) ** 2 + (height / 2) ** 2) ** 0.5
            
            prob = density * (1 - (dist / max_dist) * 0.5)
            
            if random.random() < prob:
                grid[y][x] = 1
    
    return grid

def render_map_from_tileset(tileset, terrain_grid):
    """Render map using Wang tiles."""
    tiles = tileset['tiles']
    tile_size = tileset['tile_size']
    
    height = len(terrain_grid) - 1
    width = len(terrain_grid[0]) - 1
    
    map_img = Image.new('RGBA', (width * tile_size, height * tile_size))
    
    for y in range(height):
        for x in range(width):
            nw = terrain_grid[y][x]
            ne = terrain_grid[y][x + 1]
            sw = terrain_grid[y + 1][x]
            se = terrain_grid[y + 1][x + 1]
            
            wang_idx = nw * 8 + ne * 4 + sw * 2 + se
            
            if wang_idx in tiles:
                map_img.paste(tiles[wang_idx], (x * tile_size, y * tile_size))
    
    return map_img

def generate_location_map(location, tilesets, output_dir):
    """Generate map for a single location."""
    terrain = location['terrain']
    name = location['name']
    
    # Select tileset based on terrain
    tileset = None
    if terrain == 'Desert':
        tileset = tilesets.get('desert')
    elif terrain == 'Water':
        tileset = tilesets.get('ocean')
    elif terrain in ['Dungeon', 'Temple', 'Structure']:
        tileset = tilesets.get('dungeon')
    elif terrain == 'City':
        tileset = tilesets.get('city')
    elif terrain == 'Cosmic':
        tileset = tilesets.get('cosmic')
    else:  # Forest, Mixed, Village, Valley, Island, Garden, Digital, Mountains
        tileset = tilesets.get('grass')
    
    if not tileset:
        return None
    
    # Map size based on importance
    appearances = location['appearances']
    if appearances >= 5:
        size = (80, 80)  # Major locations
    elif appearances >= 3:
        size = (64, 64)  # Important locations
    elif appearances == 2:
        size = (48, 48)  # Recurring locations
    else:
        size = (32, 32)  # Single mentions
    
    # Generate terrain
    seed = hash(name) % 100000
    terrain_grid = create_terrain_layout(size[0], size[1], seed, density=0.45)
    
    # Render map
    map_img = render_map_from_tileset(tileset, terrain_grid)
    
    # Save
    safe_name = name.lower().replace(' ', '-').replace("'", '').replace(',', '').replace('!', '').replace('(', '').replace(')', '')[:50]
    output_path = f"{output_dir}/{safe_name}.png"
    map_img.save(output_path)
    
    return {
        'name': name,
        'file': safe_name + '.png',
        'size': size
    }

def create_comprehensive_world_map(locations, output_path, tilesets):
    """Create master world map with ALL locations and journey paths."""
    
    # World map size
    world_width = 320
    world_height = 320
    tile_size = 16
    
    # Create base terrain using grass tileset
    print("🌍 Creating comprehensive world map base...")
    terrain_grid = create_terrain_layout(world_width, world_height, seed=42, density=0.35)
    
    if 'grass' in tilesets:
        world_map = render_map_from_tileset(tilesets['grass'], terrain_grid)
    else:
        world_map = Image.new('RGBA', (world_width * tile_size, world_height * tile_size), (100, 150, 100, 255))
    
    # Convert to RGB for drawing
    world_map = world_map.convert('RGB')
    draw = ImageDraw.Draw(world_map)
    
    # Sort by first appearance
    sorted_locs = sorted(locations, key=lambda x: x['first_chapter'])
    
    location_positions = {}
    
    # Create spiral path from center
    center_x = world_width * tile_size // 2
    center_y = world_height * tile_size // 2
    
    print(f"📍 Placing {len(sorted_locs)} locations on world map...")
    
    for i, loc in enumerate(sorted_locs):
        # Spiral outward from center
        angle = (i / len(sorted_locs)) * 6.28 * 5  # 5 rotations for 143 locations
        radius = 40 + (i / len(sorted_locs)) * (min(world_width, world_height) * tile_size // 2 - 80)
        
        x = int(center_x + radius * math.cos(angle))
        y = int(center_y + radius * math.sin(angle))
        
        location_positions[loc['name']] = (x, y)
    
    # Draw journey paths for multi-chapter locations
    print("🛤️ Drawing journey paths...")
    for loc in sorted_locs:
        if loc['appearances'] > 1:
            # Draw connections to chapters where this location appears
            pos = location_positions[loc['name']]
            chapter_nums = [int(c) for c in loc['chapters'].split(',')]
            
            # Draw path to this location from previous chapters
            for ch_num in chapter_nums:
                # Find chapter location
                ch_idx = ch_num - 1
                if ch_idx < len(sorted_locs):
                    angle = (ch_idx / 69) * 6.28 * 5
                    radius = 40 + (ch_idx / 69) * (min(world_width, world_height) * tile_size // 2 - 80)
                    ch_pos = (int(center_x + radius * math.cos(angle)),
                             int(center_y + radius * math.sin(angle)))
                    
                    # Draw light path
                    draw.line([ch_pos, pos], fill=(255, 220, 100, 128), width=1)
    
    # Draw main chapter path
    print("🛤️ Drawing main 69-chapter path...")
    prev_pos = None
    for i in range(69):
        angle = (i / 69) * 6.28 * 5
        radius = 40 + (i / 69) * (min(world_width, world_height) * tile_size // 2 - 80)
        pos = (int(center_x + radius * math.cos(angle)),
               int(center_y + radius * math.sin(angle)))
        
        if prev_pos:
            draw.line([prev_pos, pos], fill=(255, 200, 50), width=4)
        
        prev_pos = pos
    
    # Draw location markers
    print("📌 Adding all location markers...")
    
    color_map = {
        'Desert': (255, 200, 100),
        'Forest': (50, 200, 50),
        'Mountains': (150, 150, 200),
        'City': (200, 200, 200),
        'Water': (100, 150, 255),
        'Dungeon': (100, 100, 100),
        'Digital': (255, 0, 255),
        'Cosmic': (150, 0, 255),
        'Village': (200, 150, 100),
        'Valley': (150, 150, 100),
        'Island': (100, 200, 200),
        'Temple': (220, 180, 140),
        'Structure': (160, 160, 160),
        'Garden': (100, 255, 100),
        'Mixed': (180, 180, 180)
    }
    
    for loc in sorted_locs:
        pos = location_positions[loc['name']]
        color = color_map.get(loc['terrain'], (255, 255, 255))
        
        # Size by importance
        if loc['appearances'] >= 5:
            marker_size = 10
        elif loc['appearances'] >= 3:
            marker_size = 8
        elif loc['appearances'] == 2:
            marker_size = 6
        else:
            marker_size = 4
        
        # Draw marker
        draw.ellipse([pos[0] - marker_size, pos[1] - marker_size, 
                      pos[0] + marker_size, pos[1] + marker_size],
                     fill=color, outline=(255, 255, 255), width=2)
    
    # Add title
    print("✍️ Adding title and info...")
    title_font = ImageFont.load_default()
    draw.text((20, 20), "ADVENTURE REALM - Complete Location Map (143 Locations)", fill=(255, 255, 255), font=title_font, stroke_width=2, stroke_fill=(0, 0, 0))
    draw.text((20, 40), f"All locations from 69 chapters • Yellow path = chapter journey", fill=(200, 200, 200), font=title_font, stroke_width=1, stroke_fill=(0, 0, 0))
    
    # Add legend
    legend_y = world_height * tile_size - 180
    draw.text((20, legend_y), "MARKER SIZE = APPEARANCES:", fill=(255, 255, 255), font=title_font, stroke_width=1, stroke_fill=(0, 0, 0))
    
    for i, (text, size) in enumerate([("5+ chapters", 10), ("3-4 chapters", 8), ("2 chapters", 6), ("1 chapter", 4)]):
        y = legend_y + 20 + (i * 20)
        draw.ellipse([25, y, 25 + size*2, y + size*2], fill=(180, 180, 180), outline=(255, 255, 255))
        draw.text((40 + size*2, y), text, fill=(255, 255, 255), font=title_font)
    
    # Save
    world_map.save(output_path)
    print(f"\n✅ Comprehensive world map saved to: {output_path}")

if __name__ == '__main__':
    print("🗺️ COMPREHENSIVE LOCATION MAPPING - ALL 143 LOCATIONS")
    print("=" * 70)
    
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Load all locations
    csv_path = os.path.join(project_root, 'data/all_locations_comprehensive.csv')
    locations = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row['first_chapter'] = int(row['first_chapter'])
            row['appearances'] = int(row['appearances'])
            locations.append(row)
    
    print(f"\n📊 Loaded {len(locations)} locations from CSV")
    
    # Load ALL tilesets
    base_dir = os.path.join(project_root, 'public/tilesets/topdown')
    tilesets = {}
    
    tileset_files = {
        'grass': 'grass-to-forest',
        'desert': 'sand-to-rock',
        'ocean': 'ocean-water',
        'dungeon': 'dungeon-cave',
        'city': 'city-cobblestone',
        'cosmic': 'cosmic-space'
    }
    
    for key, filename in tileset_files.items():
        json_path = f'{base_dir}/{filename}.json'
        png_path = f'{base_dir}/{filename}.png'
        
        if os.path.exists(json_path) and os.path.exists(png_path):
            tilesets[key] = load_wang_tileset(json_path, png_path)
            print(f"✅ Loaded: {filename} tileset")
    
    print(f"\n🎨 Generating individual location maps...")
    print("=" * 70)
    
    output_dir = os.path.join(project_root, 'public/maps/locations')
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate map for each location
    generated_maps = []
    terrain_stats = {}
    
    for i, loc in enumerate(locations, 1):
        result = generate_location_map(loc, tilesets, output_dir)
        if result:
            generated_maps.append(result)
            terrain = loc['terrain']
            terrain_stats[terrain] = terrain_stats.get(terrain, 0) + 1
            
            if i % 20 == 0:
                print(f"  Generated {i}/{len(locations)} maps...")
    
    print(f"\n✅ Generated {len(generated_maps)} location maps!")
    print(f"\n📊 Maps by terrain type:")
    for terrain, count in sorted(terrain_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  {terrain}: {count} maps")
    
    # Create comprehensive world map
    print(f"\n🌍 Creating comprehensive world map...")
    print("=" * 70)
    
    world_output = os.path.join(project_root, 'public/maps/adventure-realm-complete-map.png')
    create_comprehensive_world_map(locations, world_output, tilesets)
    
    print(f"\n🎉 COMPLETE!")
    print(f"   📁 Location maps: {output_dir}/")
    print(f"   🗺️  World map: {world_output}")
    print(f"\n   Total: {len(generated_maps)} location maps + 1 comprehensive world map")
    print(f"\n✅ All {len(locations)} locations mapped with journey markers!")

