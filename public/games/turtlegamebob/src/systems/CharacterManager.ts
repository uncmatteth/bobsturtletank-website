/**
 * CharacterManager - Handles loading and managing character sprites and animations
 * Integrates PixelLab generated character assets with the game
 */

import Phaser from 'phaser';

export interface CharacterData {
  key: string;
  type: 'hero' | 'enemy' | 'npc' | 'item' | 'effect' | 'environment';
  animations: {
    [key: string]: {
      frameRate: number;
      repeat: number;
      frames: number[];
    }
  };
  metadata?: {
    [key: string]: any;
  };
}

export class CharacterManager {
  private scene: Phaser.Scene;
  private characters: Map<string, CharacterData> = new Map();
  private spritesheets: Map<string, Phaser.Textures.Texture> = new Map();
  private isLoaded: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    console.log('👤 CharacterManager initialized');
  }

  /**
   * Load all character assets
   */
  public async loadCharacters(): Promise<void> {
    console.log('👤 Loading character assets...');
    
    try {
      // Load hero character
      await this.loadCharacter('assets/sprites/green_turtle', 'hero', 'green_turtle');
      
      // Load enemies
      await this.loadCharacter('assets/sprites/enemies', 'enemy', 'red_goblin');
      await this.loadCharacter('assets/sprites/enemies', 'enemy', 'skeleton_warrior');
      await this.loadCharacter('assets/sprites/enemies', 'enemy', 'orc_brute');
      await this.loadCharacter('assets/sprites/enemies', 'enemy', 'dark_wizard_boss');
      
      // Load items
      await this.loadCharacter('assets/sprites/items', 'item', 'treasure_chest');
      await this.loadCharacter('assets/sprites/items', 'item', 'health_potion');
      await this.loadCharacter('assets/sprites/items', 'item', 'mana_potion');
      
      // Load effects
      await this.loadCharacter('assets/sprites/effects', 'effect', 'magic_spell');
      
      // Load environment objects
      await this.loadCharacter('assets/sprites/environment', 'environment', 'dungeon_door');
      await this.loadCharacter('assets/sprites/environment', 'environment', 'stairs_down');
      await this.loadCharacter('assets/sprites/environment', 'environment', 'torch_flame');
      
      // Load UI elements
      await this.loadCharacter('assets/sprites/ui', 'ui', 'mana_bar');
      await this.loadCharacter('assets/sprites/ui', 'ui', 'ui_button');
      
      this.isLoaded = true;
      console.log('✅ All character assets loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load character assets:', error);
      // Create fallback textures
      this.createFallbackTextures();
    }
  }

  /**
   * Get character data by key
   */
  public getCharacter(key: string): CharacterData | null {
    return this.characters.get(key) || null;
  }

  /**
   * Get a spritesheet texture by key
   */
  public getSpritesheet(key: string): Phaser.Textures.Texture | null {
    return this.spritesheets.get(key) || null;
  }

  /**
   * Check if characters are loaded
   */
  public isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Create a character sprite with animations
   */
  public createSprite(
    x: number,
    y: number,
    key: string
  ): Phaser.GameObjects.Sprite | null {
    const character = this.getCharacter(key);
    if (!character) {
      console.warn(`⚠️ Character not found: ${key}`);
      return null;
    }
    
    const spritesheet = this.getSpritesheet(key);
    if (!spritesheet) {
      console.warn(`⚠️ Spritesheet not found: ${key}`);
      return null;
    }
    
    // Create sprite
    const sprite = this.scene.add.sprite(x, y, key);
    
    // Create animations if they don't exist
    this.createAnimations(key, character);
    
    return sprite;
  }

  /**
   * Create animations for a character
   */
  private createAnimations(key: string, character: CharacterData): void {
    // Check if animations already exist
    if (this.scene.anims.exists(`${key}_idle`)) {
      return;
    }
    
    // Create idle animation
    this.scene.anims.create({
      key: `${key}_idle`,
      frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 0 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Create walk animation
    this.scene.anims.create({
      key: `${key}_walk`,
      frames: this.scene.anims.generateFrameNumbers(key, { start: 1, end: 4 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Create attack animation
    this.scene.anims.create({
      key: `${key}_attack`,
      frames: this.scene.anims.generateFrameNumbers(key, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: 0
    });
    
    // Create any custom animations defined in character data
    if (character.animations) {
      Object.entries(character.animations).forEach(([animKey, anim]) => {
        this.scene.anims.create({
          key: `${key}_${animKey}`,
          frames: this.scene.anims.generateFrameNumbers(key, { frames: anim.frames }),
          frameRate: anim.frameRate,
          repeat: anim.repeat
        });
      });
    }
  }

  /**
   * Load a character from extracted assets
   */
  private async loadCharacter(
    basePath: string,
    type: 'hero' | 'enemy' | 'npc' | 'item' | 'effect' | 'environment' | 'ui',
    key: string
  ): Promise<void> {
    try {
      // Check if character already exists
      if (this.characters.has(key)) {
        return;
      }
      
      // Create texture key
      const textureKey = `${type}_${key}`;
      
      // Check if rotations directory exists
      const rotationsPath = `${basePath}/rotations`;
      
      // Load metadata if available
      let metadata = {};
      try {
        const metadataResponse = await fetch(`${basePath}/metadata.json`);
        if (metadataResponse.ok) {
          metadata = await metadataResponse.json();
        }
      } catch (error) {
        console.warn(`⚠️ No metadata found for ${key}`);
      }
      
      // Load character rotations
      const directions = ['south', 'west', 'east', 'north', 'south-west', 'south-east', 'north-west', 'north-east'];
      const loadedDirections: string[] = [];
      
      // Create a spritesheet from the rotations
      const spritesheet = this.scene.textures.createCanvas(textureKey, 32 * directions.length, 32);
      const context = spritesheet.getContext();
      
      // Load each direction
      for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];
        try {
          // Load image
          const img = new Image();
          img.src = `${rotationsPath}/${direction}.png`;
          
          // Wait for image to load
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              // Draw image to spritesheet
              context.drawImage(img, i * 32, 0);
              loadedDirections.push(direction);
              resolve();
            };
            img.onerror = () => {
              console.warn(`⚠️ Failed to load ${direction} rotation for ${key}`);
              resolve(); // Continue even if one direction fails
            };
          });
        } catch (error) {
          console.warn(`⚠️ Failed to load ${direction} rotation for ${key}:`, error);
        }
      }
      
      // Update the canvas texture
      spritesheet.refresh();
      
      // Store the spritesheet
      this.spritesheets.set(key, spritesheet);
      
      // Create character data
      const characterData: CharacterData = {
        key,
        type,
        animations: {
          idle: { frameRate: 10, repeat: -1, frames: [0] },
          walk: { frameRate: 10, repeat: -1, frames: [0, 1, 0, 2] }, // Simple walk animation using available frames
        },
        metadata: {
          ...metadata,
          loadedDirections
        }
      };
      
      // Store the character data
      this.characters.set(key, characterData);
      
      console.log(`✅ Loaded character: ${key} (${loadedDirections.length} directions)`);
    } catch (error) {
      console.error(`❌ Failed to load character ${key}:`, error);
      throw error;
    }
  }

  /**
   * Create fallback textures if character loading fails
   */
  private createFallbackTextures(): void {
    console.log('🎨 Creating fallback character textures');
    
    // Create simple colored textures for each character type
    const graphics = this.scene.add.graphics();
    
    // Hero texture (green)
    graphics.fillStyle(0x00FF00);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('fallback_hero', 32, 32);
    graphics.clear();
    
    // Enemy texture (red)
    graphics.fillStyle(0xFF0000);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('fallback_enemy', 32, 32);
    graphics.clear();
    
    // Item texture (yellow)
    graphics.fillStyle(0xFFFF00);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('fallback_item', 32, 32);
    graphics.clear();
    
    // Effect texture (blue)
    graphics.fillStyle(0x0000FF);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('fallback_effect', 32, 32);
    graphics.clear();
    
    // Environment texture (brown)
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('fallback_environment', 32, 32);
    graphics.clear();
    
    // UI texture (white)
    graphics.fillStyle(0xFFFFFF);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('fallback_ui', 32, 32);
    
    graphics.destroy();
    
    this.isLoaded = true;
  }

  /**
   * Destroy all created textures
   */
  public destroy(): void {
    // Clean up textures
    this.spritesheets.forEach((texture, key) => {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
    });
    
    // Clear maps
    this.characters.clear();
    this.spritesheets.clear();
    
    console.log('👤 CharacterManager destroyed');
  }
}
