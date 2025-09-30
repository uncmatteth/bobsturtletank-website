/**
 * TilesetManager - Handles loading and managing Wang tilesets
 * Integrates PixelLab generated tilesets with the dungeon generator
 */

import Phaser from 'phaser';
import { EnvironmentType } from './DungeonGenerator';

export interface WangTile {
  id: string;
  corners: {
    NE: 'lower' | 'upper';
    NW: 'lower' | 'upper';
    SE: 'lower' | 'upper';
    SW: 'lower' | 'upper';
  };
  image: {
    base64: string;
  };
}

export interface WangTileset {
  total_tiles: number;
  tiles: WangTile[];
  lower_terrain: {
    id: string;
    description: string;
  };
  upper_terrain: {
    id: string;
    description: string;
  };
}

export class TilesetManager {
  private scene: Phaser.Scene;
  private tilesets: Map<EnvironmentType, WangTileset> = new Map();
  private tileTextures: Map<string, Phaser.Textures.Texture> = new Map();
  private tileSize: number = 16;
  private isLoaded: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    console.log('🏞️ TilesetManager initialized');
  }

  /**
   * Load all available tilesets
   */
  public async loadTilesets(): Promise<void> {
    console.log('🏞️ Loading Wang tilesets...');
    
    try {
      // Load each tileset JSON file
      await this.loadTileset('assets/tilesets/stone_mossy.json', 'shallow');
      await this.loadTileset('assets/tilesets/dirt_cave.json', 'deep');
      await this.loadTileset('assets/tilesets/marble_ornate.json', 'crystal');
      await this.loadTileset('assets/tilesets/wooden_brick.json', 'abyss');
      await this.loadTileset('assets/tilesets/cobblestone_cracked.json', 'volcanic');
      
      this.isLoaded = true;
      console.log('✅ All tilesets loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load tilesets:', error);
      // Create fallback textures
      this.createFallbackTextures();
    }
  }

  /**
   * Get a tileset for a specific environment
   */
  public getTileset(environment: EnvironmentType): WangTileset | null {
    return this.tilesets.get(environment) || this.tilesets.get('shallow') || null;
  }

  /**
   * Get a tile texture by ID
   */
  public getTileTexture(tileId: string): Phaser.Textures.Texture | null {
    return this.tileTextures.get(tileId) || null;
  }

  /**
   * Check if tilesets are loaded
   */
  public isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Get the appropriate tile for a given corner configuration
   */
  public getTileForCorners(
    tileset: WangTileset,
    nw: 'lower' | 'upper',
    ne: 'lower' | 'upper',
    sw: 'lower' | 'upper',
    se: 'lower' | 'upper'
  ): WangTile | null {
    return tileset.tiles.find(
      (tile) =>
        tile.corners.NW === nw &&
        tile.corners.NE === ne &&
        tile.corners.SW === sw &&
        tile.corners.SE === se
    ) || null;
  }

  /**
   * Calculate binary index from corners (0-15)
   */
  public calculateTileIndex(nw: boolean, ne: boolean, sw: boolean, se: boolean): number {
    return (nw ? 8 : 0) + (ne ? 4 : 0) + (sw ? 2 : 0) + (se ? 1 : 0);
  }

  /**
   * Load a tileset from JSON file
   */
  private async loadTileset(path: string, environmentType: EnvironmentType): Promise<void> {
    try {
      // Load JSON file
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load tileset: ${response.status} ${response.statusText}`);
      }
      
      const json = await response.json();
      const tileset: WangTileset = json.tileset_data;
      
      // Store the tileset
      this.tilesets.set(environmentType, tileset);
      
      // Process each tile
      for (const tile of tileset.tiles) {
        // Create texture from base64
        const textureKey = `wang_tile_${tile.id}`;
        this.createTextureFromBase64(textureKey, tile.image.base64);
        this.tileTextures.set(tile.id, this.scene.textures.get(textureKey));
      }
      
      console.log(`✅ Loaded tileset for ${environmentType} environment`);
    } catch (error) {
      console.error(`❌ Failed to load tileset ${path}:`, error);
      throw error;
    }
  }

  /**
   * Create a Phaser texture from base64 string
   */
  private createTextureFromBase64(key: string, base64: string): void {
    try {
      // Skip if texture already exists
      if (this.scene.textures.exists(key)) {
        return;
      }
      
      // Create image element
      const img = new Image();
      img.src = `data:image/png;base64,${base64}`;
      
      // Add to texture manager when loaded
      img.onload = () => {
        this.scene.textures.addImage(key, img);
      };
    } catch (error) {
      console.error(`❌ Failed to create texture from base64 for ${key}:`, error);
    }
  }

  /**
   * Create fallback textures if tileset loading fails
   */
  private createFallbackTextures(): void {
    console.log('🎨 Creating fallback tileset textures');
    
    // Create simple colored textures for each tile type
    const graphics = this.scene.add.graphics();
    
    // Floor texture (brown)
    graphics.fillStyle(0x8B7355);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_floor', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Wall texture (gray)
    graphics.fillStyle(0x4a4a4a);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_wall', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Door texture (wooden)
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_door', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Water texture (blue)
    graphics.fillStyle(0x0000FF);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_water', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Lava texture (red)
    graphics.fillStyle(0xFF0000);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_lava', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Ice texture (light blue)
    graphics.fillStyle(0xADD8E6);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_ice', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Void texture (black)
    graphics.fillStyle(0x000000);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_void', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Treasure texture (gold)
    graphics.fillStyle(0xFFD700);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_treasure', this.tileSize, this.tileSize);
    graphics.clear();
    
    // Spawn texture (green)
    graphics.fillStyle(0x00FF00);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('fallback_spawn', this.tileSize, this.tileSize);
    
    graphics.destroy();
    
    this.isLoaded = true;
  }

  /**
   * Destroy all created textures
   */
  public destroy(): void {
    // Clean up textures
    this.tileTextures.forEach((_, key) => {
      if (this.scene.textures.exists(`wang_tile_${key}`)) {
        this.scene.textures.remove(`wang_tile_${key}`);
      }
    });
    
    // Clear maps
    this.tilesets.clear();
    this.tileTextures.clear();
    
    console.log('🏞️ TilesetManager destroyed');
  }
}

