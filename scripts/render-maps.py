#!/usr/bin/env python3
"""
Render actual map images from PixelLab tilesets
Creates visual maps of Adventure Realm locations for website display
"""

import json
import os
from PIL import Image

def load_wang_tileset(metadata_path, image_path):
    """Load a Wang tileset from PixelLab split format."""
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    sprite_sheet = Image.open(image_path)
    
    # Index tiles by Wang number (corner pattern)
    tiles = {}
    
    for tile in metadata['tileset_data']['tiles']:
        corners = tile['corners']
        bbox = tile['bounding_box']
        
        # Extract tile image
        tile_img = sprite_sheet.crop((
            bbox['x'], bbox['y'],
            bbox['x'] + bbox['width'],
            bbox['y'] + bbox['height']
        ))
        
        # Calculate Wang index (NW*8 + NE*4 + SW*2 + SE*1)
        nw = 1 if corners['NW'] == 'upper' else 0
        ne = 1 if corners['NE'] == 'upper' else 0
        sw = 1 if corners['SW'] == 'upper' else 0
        se = 1 if corners['SE'] == 'upper' else 0
        wang_idx = nw * 8 + ne * 4 + sw * 2 + se
        
        tiles[wang_idx] = tile_img
    
    tile_size = metadata['tileset_data']['tile_size']
    
    return {
        'tiles': tiles,
        'tile_size': tile_size['width'],
        'metadata': metadata
    }

def create_terrain_layout(width, height, pattern='island'):
    """Create a terrain layout grid.
    
    Grid is (width+1) x (height+1) vertices where:
    0 = lower terrain (e.g., grass)
    1 = upper terrain (e.g., forest)
    """
    grid = [[0 for _ in range(width + 1)] for _ in range(height + 1)]
    
    if pattern == 'island':
        # Create an island of upper terrain in lower terrain
        center_x = width // 2
        center_y = height // 2
        radius = min(width, height) // 3
        
        for y in range(height + 1):
            for x in range(width + 1):
                dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                if dist < radius:
                    grid[y][x] = 1
    
    elif pattern == 'path':
        # Create a winding path of upper terrain
        for y in range(height + 1):
            for x in range(width + 1):
                if abs(x - width // 2) < 3 or abs(y - height // 2) < 3:
                    grid[y][x] = 1
    
    elif pattern == 'gradient':
        # Gradient from lower to upper
        for y in range(height + 1):
            for x in range(width + 1):
                if x > width // 2:
                    grid[y][x] = 1
    
    elif pattern == 'scattered':
        # Scattered patches
        import random
        random.seed(42)
        for y in range(height + 1):
            for x in range(width + 1):
                center_x = width // 2
                center_y = height // 2
                dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                if random.random() < (1 - dist / (width / 2)):
                    grid[y][x] = 1
    
    return grid

def render_map(tileset, terrain_grid):
    """Render a map image using Wang tiles based on terrain grid."""
    tiles = tileset['tiles']
    tile_size = tileset['tile_size']
    
    height = len(terrain_grid) - 1
    width = len(terrain_grid[0]) - 1
    
    # Create output image
    map_img = Image.new('RGBA', (width * tile_size, height * tile_size))
    
    # Place tiles
    for y in range(height):
        for x in range(width):
            # Sample 4 corners (vertices) around this cell
            nw = terrain_grid[y][x]
            ne = terrain_grid[y][x + 1]
            sw = terrain_grid[y + 1][x]
            se = terrain_grid[y + 1][x + 1]
            
            # Calculate Wang index
            wang_idx = nw * 8 + ne * 4 + sw * 2 + se
            
            # Get tile (or use fallback if missing)
            tile = tiles.get(wang_idx, tiles.get(0, tiles[list(tiles.keys())[0]]))
            
            # Paste tile
            map_img.paste(tile, (x * tile_size, y * tile_size))
    
    return map_img

def create_location_map(location_name, tileset_name, pattern='island', size=(32, 32)):
    """Create a map for a specific location."""
    
    # Paths
    base_dir = '/home/dave/Documents/GitHub/bobsturtletank-website/public/tilesets'
    metadata_path = None
    image_path = None
    
    # Find tileset files
    if 'grass' in tileset_name.lower() or 'forest' in tileset_name.lower():
        metadata_path = f'{base_dir}/topdown/grass-to-forest.json'
        image_path = f'{base_dir}/topdown/grass-to-forest.png'
    elif 'sand' in tileset_name.lower() or 'desert' in tileset_name.lower():
        metadata_path = f'{base_dir}/topdown/sand-to-rock.json'
        image_path = f'{base_dir}/topdown/sand-to-rock.png'
    
    if not metadata_path or not os.path.exists(metadata_path):
        print(f"❌ Tileset not found: {tileset_name}")
        return None
    
    print(f"📍 Creating map for {location_name}...")
    
    # Load tileset
    tileset = load_wang_tileset(metadata_path, image_path)
    
    # Create terrain layout
    terrain_grid = create_terrain_layout(size[0], size[1], pattern)
    
    # Render map
    map_img = render_map(tileset, terrain_grid)
    
    return map_img

if __name__ == '__main__':
    print("🗺️ Adventure Realm Map Renderer\n")
    
    # Create output directory
    output_dir = '../public/maps'
    os.makedirs(output_dir, exist_ok=True)
    
    # Test maps
    locations = [
        {
            'name': 'Cedar Hollow',
            'tileset': 'grass-to-forest',
            'pattern': 'scattered',
            'size': (48, 48)
        },
        {
            'name': 'Morning Meadows',
            'tileset': 'grass-to-forest',
            'pattern': 'island',
            'size': (32, 32)
        },
        {
            'name': 'Desert of Echoes',
            'tileset': 'sand-to-rock',
            'pattern': 'gradient',
            'size': (64, 48)
        }
    ]
    
    for loc in locations:
        map_img = create_location_map(
            loc['name'],
            loc['tileset'],
            loc['pattern'],
            loc['size']
        )
        
        if map_img:
            output_path = f"{output_dir}/{loc['name'].lower().replace(' ', '-')}.png"
            map_img.save(output_path)
            print(f"  ✅ Saved: {output_path}")
    
    print(f"\n🎉 Created {len(locations)} maps!")
    print(f"📁 Output: {output_dir}/")

