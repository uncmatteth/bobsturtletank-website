/**
 * AssetLoader - Direct asset loading system for Bob The Turtle
 * Loads all generated pixel art assets directly
 */

import Phaser from 'phaser';

export class AssetLoader {
  private scene: Phaser.Scene;
  private assetsLoaded: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Load all game assets
   */
  public loadAssets(): void {
    // Load character sprites
    this.loadCharacterSprites();
    
    // Load environment objects
    this.loadEnvironmentObjects();
    
    // Load items
    this.loadItemSprites();
    
    // Load effects
    this.loadEffectSprites();
    
    // Load UI elements
    this.loadUIElements();
    
    // Load tilesets
    this.loadTilesets();
    
    // Load audio
    this.loadAudio();
  }
  
  /**
   * Load character sprites
   */
  private loadCharacterSprites(): void {
    console.log('🧙 Loading character sprites...');
    
    // Hero - Green Turtle
    this.loadDirectionalSprite('hero', 'assets/extracted/green_turtle/rotations');
    
    // Enemies
    this.loadDirectionalSprite('red_goblin', 'assets/extracted/enemies/rotations');
    this.loadDirectionalSprite('skeleton_warrior', 'assets/extracted/enemies/rotations');
    this.loadDirectionalSprite('orc_brute', 'assets/extracted/enemies/rotations');
    this.loadDirectionalSprite('dark_wizard', 'assets/extracted/enemies/rotations');
  }
  
  /**
   * Load environment objects
   */
  private loadEnvironmentObjects(): void {
    console.log('🏞️ Loading environment objects...');
    
    // Doors, stairs, torches
    this.loadDirectionalSprite('dungeon_door', 'assets/extracted/environment/rotations');
    this.loadDirectionalSprite('stairs_down', 'assets/extracted/environment/rotations');
    this.loadDirectionalSprite('torch', 'assets/extracted/environment/rotations');
  }
  
  /**
   * Load item sprites
   */
  private loadItemSprites(): void {
    console.log('💎 Loading item sprites...');
    
    // Health potion, mana potion, treasure chest
    this.loadDirectionalSprite('health_potion', 'assets/extracted/items/rotations');
    this.loadDirectionalSprite('mana_potion', 'assets/extracted/items/rotations');
    this.loadDirectionalSprite('treasure_chest', 'assets/extracted/items/rotations');
  }
  
  /**
   * Load effect sprites
   */
  private loadEffectSprites(): void {
    console.log('✨ Loading effect sprites...');
    
    // Magic spell effects
    this.loadDirectionalSprite('magic_spell', 'assets/extracted/effects/rotations');
  }
  
  /**
   * Load UI elements
   */
  private loadUIElements(): void {
    console.log('🖥️ Loading UI elements...');
    
    // UI elements
    this.loadDirectionalSprite('mana_bar', 'assets/extracted/ui/rotations');
    this.loadDirectionalSprite('ui_button', 'assets/extracted/ui/rotations');
  }
  
  /**
   * Load tilesets
   */
  private loadTilesets(): void {
    console.log('🧱 Loading tilesets...');
    
    // Load tileset JSON files
    const tilesets = [
      'stone_mossy',
      'dirt_cave',
      'marble_ornate',
      'wooden_brick',
      'cobblestone_cracked'
    ];
    
    tilesets.forEach(tileset => {
      this.scene.load.json(`${tileset}_tileset`, `assets/tilesets/${tileset}.json`);
    });
  }
  
  /**
   * Load audio files
   */
  private loadAudio(): void {
    console.log('🔊 Loading audio...');
    
    // Load basic sound effects
    const sounds = [
      'collect',
      'door_open',
      'door_close',
      'stairs',
      'torch_light',
      'torch_extinguish',
      'chest_open',
      'trap_trigger',
      'magic_spell',
      'fire',
      'ice',
      'lightning',
      'healing'
    ];
    
    sounds.forEach(sound => {
      this.scene.load.audio(sound, `assets/fallback/${sound}.mp3`);
    });
  }
  
  /**
   * Load a sprite with all directions
   */
  private loadDirectionalSprite(key: string, path: string): void {
    // Try to load all directions
    const directions = ['south', 'west', 'east', 'north', 'south-west', 'south-east', 'north-west', 'north-east'];
    
    // Load each direction
    directions.forEach(direction => {
      try {
        this.scene.load.image(`${key}_${direction}`, `${path}/${direction}.png`);
      } catch (error) {
        console.warn(`⚠️ Failed to load ${key}_${direction}`);
      }
    });
    
    // Create animations when loaded
    this.scene.load.once('complete', () => {
      this.createAnimations(key, directions);
    });
  }
  
  /**
   * Create animations for a sprite
   */
  private createAnimations(key: string, directions: string[]): void {
    directions.forEach(direction => {
      // Create idle animation
      if (this.scene.textures.exists(`${key}_${direction}`)) {
        this.scene.anims.create({
          key: `${key}_idle_${direction}`,
          frames: [{ key: `${key}_${direction}`, frame: 0 }],
          frameRate: 10,
          repeat: -1
        });
        
        // Create walk animation (using the same frame but with timing)
        this.scene.anims.create({
          key: `${key}_walk_${direction}`,
          frames: [{ key: `${key}_${direction}`, frame: 0 }],
          frameRate: 10,
          repeat: -1
        });
        
        // Create attack animation
        this.scene.anims.create({
          key: `${key}_attack_${direction}`,
          frames: [{ key: `${key}_${direction}`, frame: 0 }],
          frameRate: 10,
          repeat: 0
        });
      }
    });
  }
  
  /**
   * Process tilesets after loading
   */
  public processTilesets(): void {
    console.log('🧱 Processing tilesets...');
    
    const tilesets = [
      'stone_mossy',
      'dirt_cave',
      'marble_ornate',
      'wooden_brick',
      'cobblestone_cracked'
    ];
    
    tilesets.forEach(tileset => {
      const key = `${tileset}_tileset`;
      if (this.scene.cache.json.exists(key)) {
        const tilesetData = this.scene.cache.json.get(key);
        
        if (tilesetData && tilesetData.tileset_data && tilesetData.tileset_data.tiles) {
          console.log(`✅ Processing tileset ${key} with ${tilesetData.tileset_data.tiles.length} tiles`);
          
          // Process each tile
          tilesetData.tileset_data.tiles.forEach((tile: any) => {
            if (tile.image && tile.image.base64) {
              const tileKey = `${key}_tile_${tile.id}`;
              
              // Create image from base64
              const img = new Image();
              img.src = `data:image/png;base64,${tile.image.base64}`;
              
              // Add to texture manager when loaded
              img.onload = () => {
                this.scene.textures.addImage(tileKey, img);
              };
            }
          });
        }
      }
    });
  }
}
