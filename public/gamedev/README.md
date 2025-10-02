# 🎮 Adventure Realm Tilesets - Game Developer Pack

## What's Included

Free pixel art tilesets from Bob's 69-chapter adventure, ready for game development!

### Tilesets Available:
- ✅ Grass to Forest (Top-down)
- ✅ Sand to Rock/Desert (Top-down)
- ✅ Stone Platform (Sidescroller)
- ✅ Wooden Snow (Sidescroller)
- 🔄 Ocean to Beach (Processing)
- 🔄 Urban Concrete (Processing)
- 🔄 Cosmic Void (Processing)
- 🔄 Dense Forest (Processing)
- ...and more coming!

All tiles are **16x16 pixels**, perfect for retro-style games.

---

## 📥 Download Format

Each tileset comes in **split format**:
1. **`tileset_name.json`** - Metadata with tile positions and terrain info
2. **`tileset_name.png`** - Sprite sheet with all tiles

---

## 🎮 For Godot Developers

### Quick Start

1. **Download tilesets** you need (JSON + PNG pairs)
2. **Download** `godot_tileset_converter.gd` from this folder
3. **Run converter**:

```bash
godot --headless -s godot_tileset_converter.gd grass-to-forest.json grass-to-forest.png sand-to-rock.json sand-to-rock.png
```

4. **Import** `combined_terrain.tres` into your Godot project
5. **Create TileMapLayer** node and assign the .tres file
6. **Paint maps** using Terrains tab + Rect Tool (R)!

### Why This Works

The converter transforms PixelLab Wang tilesets into Godot's terrain system:
- ✅ Automatic terrain blending
- ✅ Visual painting with Rect Tool
- ✅ No manual tile placement needed
- ✅ Perfect transitions between terrain types

### Controls in Godot Editor

1. Select your TileMapLayer node
2. Click **TileMap tab** (bottom panel)
3. Click **Terrains button** (connected tiles icon)
4. Select a terrain type
5. Press **R** for Rect Tool
6. Draw rectangles → automatic tile placement!

**Note:** Must use Rect Tool (R), not Paint Tool (D) for corner-based terrains.

---

## 🐍 For Python/Pygame Developers

### Quick Implementation

```python
import json
from PIL import Image

# Load tileset
with open('grass-to-forest.json') as f:
    metadata = json.load(f)

sprite_sheet = Image.open('grass-to-forest.png')

# Extract tiles
tiles = {}
for tile in metadata['tileset_data']['tiles']:
    bbox = tile['bounding_box']
    tile_image = sprite_sheet.crop((bbox['x'], bbox['y'], 
                                    bbox['x'] + bbox['width'], 
                                    bbox['y'] + bbox['height']))
    tiles[tile['id']] = tile_image

# Use in your game!
```

### Example Level Builder

```python
def build_level(layout, tileset):
    """Build a level from 2D array using tileset."""
    tile_size = 16
    
    for y, row in enumerate(layout):
        for x, terrain_type in enumerate(row):
            # Select tile based on surrounding terrain
            tile = select_tile_for_position(x, y, layout, tileset)
            
            # Draw tile at position
            screen.blit(tile, (x * tile_size, y * tile_size))
```

---

## 📊 Tileset Types

### Top-down Tilesets (Wang Tiles)
- **Use for:** RPGs, strategy games, top-down adventures
- **Format:** 16 tiles covering all corner combinations
- **Method:** Corner-based vertex matching
- **Examples:** Grass to Forest, Sand to Rock, Ocean to Beach

### Sidescroller Tilesets
- **Use for:** Platformers, side-scrolling games
- **Format:** 16 platform tiles with edge variations
- **Method:** Edge-based tile selection
- **Examples:** Stone Platform, Wooden Snow, Digital Glitch

---

## 🎨 Creating Connected Terrain Chains

For seamless transitions, use base tile IDs:

```
Ocean → Beach → Grass → Forest

1. Generate Ocean→Beach
2. Use Beach base tile ID for Beach→Grass  
3. Use Grass base tile ID for Grass→Forest
```

This ensures perfect visual continuity!

---

## 📝 License & Attribution

### Usage Rights:
- ✅ **Free for personal/educational projects**
- ✅ **Free for commercial games** (with attribution)
- ✅ **Modify and adapt** as needed
- ✅ **Redistribute** (with credit)

### Required Attribution:
```
Tilesets from "Bob's Adventure Realm" 
by Uncle Matt, generated with PixelLab AI
https://bobsturtletank.fun
```

### Not Allowed:
- ❌ Reselling raw tilesets
- ❌ Claiming as your own creation
- ❌ Removing attribution from distributed works

---

## 🗺️ Example Use Cases

### RPG World Map
- Grass to Forest → villages and forests
- Sand to Rock → desert regions
- Ocean to Beach → coastal areas
- Urban Concrete → cities

### Platformer Levels
- Stone Platform → ancient ruins
- Wooden Snow → frozen mountains
- Digital Glitch → cyber worlds
- Crystal Library → cosmic realms

### Metroidvania
- Mix top-down for overworld
- Sidescroller for dungeons/caves
- Multiple tilesets for biome variety

---

## 🔧 Technical Specs

- **Tile Size:** 16x16 pixels
- **Format:** PNG (RGBA) + JSON metadata
- **Color Mode:** RGBA8
- **Top-down Tiles:** 16 per tileset (2^4 corners)
- **Sidescroller Tiles:** 16 per tileset (edge variations)
- **Compatibility:** Godot 4.x, Unity, Pygame, Phaser, GameMaker

---

## 📚 Additional Resources

### Included in This Pack:
- `godot_tileset_converter.gd` - Godot 4.x converter script
- `README.md` - This file
- All tileset JSON + PNG files

### Online Documentation:
- **PixelLab Wang Tilesets:** See converter script comments
- **Godot Terrain System:** [docs.godotengine.org](https://docs.godotengine.org)
- **Wang Tiles Explained:** Search "Wang tiles game development"

---

## 🐢 About the Adventure Realm

These tilesets are based on actual locations from **Bob's Adventure Realm**, a 69-chapter epic fantasy adventure featuring:
- Uncle Matt - A wandering bard
- Bob - A magical talking turtle
- 68+ unique locations across multiple realms

### Story Locations Represented:
- **Cedar Hollow** - Starting village (Grass/Forest)
- **Desert of Echoes** - Endless wasteland (Sand/Rock)
- **The Labyrinth** - Ancient dungeon (Stone Platform)
- **Fimbul Peaks** - Frozen mountains (Wooden Snow)
- **Cerulean Sea** - Ocean voyage (Water/Beach)
- **Metropolis** - City of Dreams (Urban)
- **Algorithmic Abyss** - Digital realm (Cyber)
- **Library of Light** - Cosmic library (Crystal)

Each tileset captures the actual terrain descriptions from the book!

---

## 💬 Community & Support

- **Website:** https://bobsturtletank.fun
- **Report Issues:** Contact through website
- **Showcase Your Game:** Tag us when you release!
- **Get More Tilesets:** Check website for updates

---

## 🎯 Quick Start Checklist

**For Godot:**
- [ ] Download JSON + PNG pairs for your terrain
- [ ] Download `godot_tileset_converter.gd`
- [ ] Run converter with your files
- [ ] Import .tres into Godot project
- [ ] Create TileMapLayer with the tileset
- [ ] Paint with Terrains tab + Rect Tool!

**For Python/Pygame:**
- [ ] Download JSON + PNG pairs
- [ ] Load JSON metadata in your code
- [ ] Extract tiles from sprite sheet using bounding boxes
- [ ] Implement tile selection based on terrain layout
- [ ] Render your levels!

---

## 🌟 Example Projects Welcome!

Made something cool with these tilesets? We'd love to see it! 

Share your:
- Screenshots
- Gameplay videos
- Released games
- Tutorials

Let's build amazing games together! 🎮✨

---

**Happy Game Development!**  
*- The Bob's Adventure Realm Team* 🐢

