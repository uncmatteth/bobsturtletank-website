#!/usr/bin/env python3
"""
Generate maps for all 69 chapters + master world map
Using CORRECT chapter data
"""

import json
import os
import csv
import random
from PIL import Image, ImageDraw, ImageFont

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

def generate_chapter_map(chapter, tilesets, output_dir):
    """Generate map for a single chapter."""
    terrain = chapter['terrain']
    name = chapter['name']
    chapter_num = chapter['first_chapter']
    
    # Select tileset based on terrain
    tileset = None
    if terrain == 'Desert':
        tileset = tilesets.get('desert')
    elif terrain == 'Water':
        tileset = tilesets.get('ocean')
    elif terrain in ['Dungeon', 'Temple']:
        tileset = tilesets.get('dungeon')
    elif terrain == 'City':
        tileset = tilesets.get('city')
    elif terrain == 'Cosmic':
        tileset = tilesets.get('cosmic')
    else:  # Forest, Mixed, Village, Valley, Island, Digital
        tileset = tilesets.get('grass')
    
    if not tileset:
        print(f"  ⚠️  No tileset for {terrain}")
        return None
    
    # Map size: bigger for milestone chapters
    if chapter_num % 10 == 0 or chapter_num == 1 or chapter_num == 69:
        size = (64, 64)  # Milestone chapters
    else:
        size = (48, 48)  # Regular chapters
    
    # Generate terrain
    seed = chapter_num * 1000  # Use chapter number as seed for consistency
    terrain_grid = create_terrain_layout(size[0], size[1], seed, density=0.45)
    
    # Render map
    map_img = render_map_from_tileset(tileset, terrain_grid)
    
    # Save with chapter number prefix
    safe_name = f"chapter{chapter_num:02d}-{name.lower().replace(' ', '-').replace('!', '').replace(',', '').replace(chr(39), '')[:40]}"
    output_path = f"{output_dir}/{safe_name}.png"
    map_img.save(output_path)
    
    return {
        'chapter': chapter_num,
        'name': name,
        'file': safe_name + '.png',
        'size': size
    }

def create_world_map(chapters, output_path, tilesets):
    """Create master world map with 69-chapter journey path."""
    
    # World map size
    world_width = 256
    world_height = 256
    tile_size = 16
    
    # Create base terrain using grass tileset
    print("🌍 Creating world map base terrain...")
    terrain_grid = create_terrain_layout(world_width, world_height, seed=42, density=0.35)
    
    if 'grass' in tilesets:
        world_map = render_map_from_tileset(tilesets['grass'], terrain_grid)
    else:
        world_map = Image.new('RGBA', (world_width * tile_size, world_height * tile_size), (100, 150, 100, 255))
    
    # Convert to RGB for drawing
    world_map = world_map.convert('RGB')
    draw = ImageDraw.Draw(world_map)
    
    # Calculate positions for chapters
    print("📍 Placing 69 chapters on world map...")
    
    chapter_positions = {}
    
    # Create spiral path from center (Ch 1) outward (Ch 69)
    center_x = world_width * tile_size // 2
    center_y = world_height * tile_size // 2
    
    for i, chapter in enumerate(chapters):
        chapter_num = chapter['first_chapter']
        # Spiral outward from center
        angle = (i / len(chapters)) * 6.28 * 4  # 4 full rotations
        radius = 30 + (i / len(chapters)) * (min(world_width, world_height) * tile_size // 2 - 60)
        
        import math
        x = int(center_x + radius * math.cos(angle))
        y = int(center_y + radius * math.sin(angle))
        
        chapter_positions[chapter_num] = (x, y)
    
    # Draw journey path
    print("🛤️ Drawing 69-chapter journey path...")
    for i in range(len(chapters) - 1):
        ch1 = chapters[i]['first_chapter']
        ch2 = chapters[i + 1]['first_chapter']
        pos1 = chapter_positions[ch1]
        pos2 = chapter_positions[ch2]
        
        # Draw path line
        draw.line([pos1, pos2], fill=(255, 200, 50), width=3)
    
    # Draw chapter markers
    print("📌 Adding chapter markers...")
    
    # Terrain colors
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
        'Mixed': (180, 180, 180)
    }
    
    for chapter in chapters:
        chapter_num = chapter['first_chapter']
        pos = chapter_positions[chapter_num]
        
        color = color_map.get(chapter['terrain'], (255, 255, 255))
        
        # Milestone chapters get larger markers
        if chapter_num % 10 == 0 or chapter_num == 1 or chapter_num == 69:
            marker_size = 10
        else:
            marker_size = 7
        
        # Draw marker
        draw.ellipse([pos[0] - marker_size, pos[1] - marker_size, 
                      pos[0] + marker_size, pos[1] + marker_size],
                     fill=color, outline=(255, 255, 255), width=2)
        
        # Label milestone chapters
        if chapter_num % 10 == 0 or chapter_num == 1 or chapter_num == 69:
            try:
                font = ImageFont.load_default()
                text = f"Ch{chapter_num}"
                draw.text((pos[0] + 12, pos[1] - 8), text, fill=(255, 255, 255), font=font, stroke_width=1, stroke_fill=(0, 0, 0))
            except:
                pass
    
    # Add title
    print("✍️ Adding title and legend...")
    title_font = ImageFont.load_default()
    draw.text((20, 20), "ADVENTURE REALM - Matt & Bob's Complete 69-Chapter Journey", fill=(255, 255, 255), font=title_font, stroke_width=2, stroke_fill=(0, 0, 0))
    draw.text((20, 40), "From Cedar Hollow (Ch1) to the Cosmic Void (Ch69)", fill=(200, 200, 200), font=title_font, stroke_width=1, stroke_fill=(0, 0, 0))
    
    # Save
    world_map.save(output_path)
    print(f"\n✅ World map saved to: {output_path}")

if __name__ == '__main__':
    print("🗺️ GENERATING ALL 69 CHAPTER MAPS")
    print("=" * 60)
    
    # Get script directory and project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Load chapter locations
    csv_path = os.path.join(project_root, 'data/all_chapters_locations.csv')
    chapters = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row['first_chapter'] = int(row['first_chapter'])
            row['appearances'] = int(row['appearances'])
            chapters.append(row)
    
    chapters.sort(key=lambda x: x['first_chapter'])
    
    print(f"\n📊 Loaded {len(chapters)} chapters from CSV")
    
    if len(chapters) != 69:
        print(f"\n⚠️  WARNING: Expected 69 chapters, got {len(chapters)}!")
    
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
        else:
            print(f"⚠️  Missing: {filename} tileset")
    
    print(f"\n🎨 Generating individual chapter maps...")
    print("=" * 60)
    
    output_dir = os.path.join(project_root, 'public/maps/chapters')
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate map for each chapter
    generated_maps = []
    terrain_stats = {}
    
    for chapter in chapters:
        result = generate_chapter_map(chapter, tilesets, output_dir)
        if result:
            generated_maps.append(result)
            terrain = chapter['terrain']
            terrain_stats[terrain] = terrain_stats.get(terrain, 0) + 1
            
            if result['chapter'] % 10 == 0:
                print(f"  Generated Chapter {result['chapter']}: {result['name']}")
    
    print(f"\n✅ Generated {len(generated_maps)} chapter maps!")
    print(f"\n📊 Maps by terrain type:")
    for terrain, count in sorted(terrain_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  {terrain}: {count} chapters")
    
    # Create master world map
    print(f"\n🌍 Creating master world map with 69-chapter journey...")
    print("=" * 60)
    
    world_output = os.path.join(project_root, 'public/maps/adventure-realm-world-map.png')
    create_world_map(chapters, world_output, tilesets)
    
    print(f"\n🎉 COMPLETE!")
    print(f"   📁 Chapter maps: {output_dir}/")
    print(f"   🗺️  World map: {world_output}")
    print(f"\n   Total: {len(generated_maps)} chapter maps + 1 world map")
    print(f"\n✅ All 69 chapters properly mapped!")

