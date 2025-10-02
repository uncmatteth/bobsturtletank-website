#!/usr/bin/env python3
"""
Generate ALL Adventure Realm location maps
"""

import json
import os
import random
from PIL import Image

def load_wang_tileset(metadata_path, image_path):
    """Load a Wang tileset from PixelLab split format."""
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
    
    tile_size = metadata['tileset_data']['tile_size']['width']
    
    return {'tiles': tiles, 'tile_size': tile_size}

def create_terrain_for_location(location_name, width, height):
    """Create terrain layout based on location characteristics."""
    grid = [[0 for _ in range(width + 1)] for _ in range(height + 1)]
    
    random.seed(hash(location_name) % 100000)  # Consistent for each location
    
    # Different patterns for different location types
    if 'hollow' in location_name.lower() or 'village' in location_name.lower():
        # Village with scattered buildings/trees
        for y in range(height + 1):
            for x in range(width + 1):
                if random.random() < 0.3:
                    grid[y][x] = 1
    
    elif 'meadow' in location_name.lower() or 'field' in location_name.lower():
        # Island/clearing pattern
        center_x, center_y = width // 2, height // 2
        radius = min(width, height) // 3
        for y in range(height + 1):
            for x in range(width + 1):
                dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                if dist < radius:
                    grid[y][x] = 1
    
    elif 'desert' in location_name.lower():
        # Scattered rock formations
        for y in range(height + 1):
            for x in range(width + 1):
                if random.random() < 0.2:
                    # Create small clusters
                    if (x + y) % 5 == 0:
                        for dy in range(-1, 2):
                            for dx in range(-1, 2):
                                ny, nx = y + dy, x + dx
                                if 0 <= ny <= height and 0 <= nx <= width:
                                    grid[ny][nx] = 1
    
    elif 'woods' in location_name.lower() or 'forest' in location_name.lower():
        # Dense forest pattern
        for y in range(height + 1):
            for x in range(width + 1):
                if random.random() < 0.6:
                    grid[y][x] = 1
    
    elif 'labyrinth' in location_name.lower():
        # Maze-like pattern
        for y in range(height + 1):
            for x in range(width + 1):
                if (x % 4 == 0 or y % 4 == 0) and random.random() < 0.7:
                    grid[y][x] = 1
    
    elif 'mountain' in location_name.lower() or 'peak' in location_name.lower():
        # Mountain peak pattern
        center_x, center_y = width // 2, height // 2
        for y in range(height + 1):
            for x in range(width + 1):
                dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                if dist < (min(width, height) // 2) * (1 - y / height):
                    grid[y][x] = 1
    
    else:
        # Default scattered pattern
        for y in range(height + 1):
            for x in range(width + 1):
                if random.random() < 0.4:
                    grid[y][x] = 1
    
    return grid

def render_map(tileset, terrain_grid):
    """Render a map image using Wang tiles."""
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
            
            tile = tiles.get(wang_idx)
            if tile:
                map_img.paste(tile, (x * tile_size, y * tile_size))
    
    return map_img

# Location definitions
locations = [
    {'id': 'cedar-hollow', 'name': 'Cedar Hollow', 'tileset': 'grass', 'size': (48, 48)},
    {'id': 'willow-woods', 'name': 'Willow Woods', 'tileset': 'grass', 'size': (40, 40)},
    {'id': 'morning-meadows', 'name': 'Morning Meadows', 'tileset': 'grass', 'size': (32, 32)},
    {'id': 'desert-of-echoes', 'name': 'Desert of Echoes', 'tileset': 'desert', 'size': (64, 48)},
    {'id': 'the-labyrinth', 'name': 'The Labyrinth', 'tileset': 'grass', 'size': (48, 48)},
    {'id': 'fimbul-peaks', 'name': 'Fimbul Peaks', 'tileset': 'grass', 'size': (40, 56)},
]

if __name__ == '__main__':
    print("🗺️ Generating ALL Adventure Realm Maps\n")
    
    base_dir = '/home/dave/Documents/GitHub/bobsturtletank-website/public/tilesets'
    output_dir = '/home/dave/Documents/GitHub/bobsturtletank-website/public/maps'
    os.makedirs(output_dir, exist_ok=True)
    
    # Load tilesets
    tilesets = {}
    
    if os.path.exists(f'{base_dir}/topdown/grass-to-forest.json'):
        tilesets['grass'] = load_wang_tileset(
            f'{base_dir}/topdown/grass-to-forest.json',
            f'{base_dir}/topdown/grass-to-forest.png'
        )
        print("✅ Loaded: Grass to Forest tileset")
    
    if os.path.exists(f'{base_dir}/topdown/sand-to-rock.json'):
        tilesets['desert'] = load_wang_tileset(
            f'{base_dir}/topdown/sand-to-rock.json',
            f'{base_dir}/topdown/sand-to-rock.png'
        )
        print("✅ Loaded: Sand to Rock tileset")
    
    print()
    
    # Generate maps
    for loc in locations:
        tileset_name = loc['tileset']
        
        if tileset_name not in tilesets:
            print(f"⏭️  Skipping {loc['name']} - tileset not ready yet")
            continue
        
        print(f"📍 Generating {loc['name']}...")
        
        terrain_grid = create_terrain_for_location(loc['name'], loc['size'][0], loc['size'][1])
        map_img = render_map(tilesets[tileset_name], terrain_grid)
        
        output_path = f"{output_dir}/{loc['id']}.png"
        map_img.save(output_path)
        print(f"   ✅ Saved to: {output_path}")
    
    print(f"\n🎉 Map generation complete!")
    print(f"📁 Maps saved to: {output_dir}/")

