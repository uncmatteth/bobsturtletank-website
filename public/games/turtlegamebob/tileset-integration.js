/**
 * 🏰 TILESET INTEGRATION SYSTEM
 * Integrates beautiful pixel art tilesets into Bob The Turtle game
 */

class TilesetManager {
    constructor(scene) {
        this.scene = scene;
        this.tilesets = new Map();
        this.tileSize = 32;
    }

    /**
     * Load tileset from JSON file
     */
    async loadTileset(name, jsonPath) {
        try {
            const response = await fetch(jsonPath);
            const data = await response.json();
            
            console.log(`🎨 Loading tileset: ${name}`);
            
            // Extract tileset data
            const tileset = {
                name: name,
                tiles: data.tileset_data.tiles,
                totalTiles: data.tileset_data.total_tiles,
                metadata: data.metadata
            };
            
            // Create Phaser textures from base64 images
            for (let i = 0; i < tileset.tiles.length; i++) {
                const tile = tileset.tiles[i];
                const textureKey = `${name}_tile_${i}`;
                
                // Convert base64 to texture
                const img = new Image();
                img.onload = () => {
                    this.scene.textures.addImage(textureKey, img);
                };
                img.src = `data:image/png;base64,${tile.image.base64}`;
                
                // Store tile info
                tile.textureKey = textureKey;
                tile.binaryIndex = i;
            }
            
            this.tilesets.set(name, tileset);
            console.log(`✅ Tileset loaded: ${name} (${tileset.totalTiles} tiles)`);
            
            return tileset;
        } catch (error) {
            console.error(`❌ Failed to load tileset ${name}:`, error);
            return null;
        }
    }

    /**
     * Generate dungeon using Wang tileset
     */
    generateDungeonWithTileset(tilesetName, width, height) {
        const tileset = this.tilesets.get(tilesetName);
        if (!tileset) {
            console.error(`❌ Tileset not found: ${tilesetName}`);
            return null;
        }

        console.log(`🏗️ Generating ${width}x${height} dungeon with ${tilesetName}`);

        // Create terrain grid (vertices) - (width+1) x (height+1)
        const terrainGrid = this.generateTerrainGrid(width + 1, height + 1);
        
        // Create tile sprites based on corner sampling
        const tileSprites = [];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Sample 4 corners from terrain grid
                const nw = terrainGrid[y][x];         // North-West
                const ne = terrainGrid[y][x + 1];     // North-East  
                const sw = terrainGrid[y + 1][x];     // South-West
                const se = terrainGrid[y + 1][x + 1]; // South-East
                
                // Calculate binary index for Wang tiling
                const binaryIndex = nw * 8 + ne * 4 + sw * 2 + se * 1;
                
                // Get corresponding tile
                const tile = tileset.tiles[binaryIndex];
                if (tile && tile.textureKey) {
                    // Create sprite at world position
                    const worldX = x * this.tileSize + this.tileSize / 2;
                    const worldY = y * this.tileSize + this.tileSize / 2;
                    
                    const sprite = this.scene.add.image(worldX, worldY, tile.textureKey);
                    sprite.setOrigin(0.5, 0.5);
                    
                    // Enable lighting
                    if (this.scene.lights) {
                        sprite.setPipeline('Light2D');
                    }
                    
                    tileSprites.push({
                        sprite: sprite,
                        x: x,
                        y: y,
                        terrain: { nw, ne, sw, se },
                        binaryIndex: binaryIndex
                    });
                }
            }
        }

        console.log(`✅ Generated ${tileSprites.length} tiles`);
        return tileSprites;
    }

    /**
     * Generate terrain grid with interesting patterns
     */
    generateTerrainGrid(width, height) {
        const grid = [];
        
        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                // Create interesting terrain patterns
                let terrain = 0; // 0 = lower (stone), 1 = upper (mossy)
                
                // Add some mossy patches
                const centerX = width / 2;
                const centerY = height / 2;
                const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                // Mossy areas near edges and in patches
                if (x < 3 || x > width - 4 || y < 3 || y > height - 4) {
                    terrain = Math.random() < 0.7 ? 1 : 0; // 70% mossy near edges
                } else if (Math.random() < 0.3) {
                    terrain = 1; // 30% random mossy patches
                }
                
                // Add some noise for organic feel
                if (Math.random() < 0.1) {
                    terrain = 1 - terrain; // Flip 10% for variety
                }
                
                grid[y][x] = terrain;
            }
        }
        
        return grid;
    }

    /**
     * Get tileset info
     */
    getTilesetInfo(name) {
        const tileset = this.tilesets.get(name);
        if (!tileset) return null;
        
        return {
            name: tileset.name,
            totalTiles: tileset.totalTiles,
            lowerTerrain: tileset.metadata.lower_description,
            upperTerrain: tileset.metadata.upper_description,
            transition: tileset.metadata.transition_description
        };
    }
}

// Export for use in game
window.TilesetManager = TilesetManager;

console.log('🎨 Tileset Integration System loaded!');






