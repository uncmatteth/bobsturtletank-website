/**
 * AssetManager - Manages all game assets
 * Generates and loads assets for the game
 */

import { HeroSpriteGenerator } from './HeroSpriteGenerator';
import { EnemySpriteGenerator } from './EnemySpriteGenerator';
import { TilesetGenerator } from './TilesetGenerator';

export class AssetManager {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Load all assets
   */
  public loadAssets(): void {
    // Load music assets
    this.loadMusic();
    
    // Load SFX assets
    this.loadSFX();
    
    // Generate and load sprites
    this.generateSprites();
  }
  
  /**
   * Load music assets
   */
  private loadMusic(): void {
    // Load music tracks
    for (let i = 1; i <= 28; i++) {
      this.scene.load.audio(`music${i}`, `assets/music/${i}.mp3`);
    }
  }
  
  /**
   * Load SFX assets
   */
  private loadSFX(): void {
    // Load sound effects
    this.scene.load.audio('achievement_unlock', 'assets/sfx/achievement_unlock.ogg');
    this.scene.load.audio('level_up', 'assets/sfx/level_up.ogg');
    this.scene.load.audio('sword_hit', 'assets/sfx/sword_hit.ogg');
    
    // Add more game-specific sounds
    this.scene.load.audio('damage', 'assets/sfx/sword_hit.ogg'); // Reuse existing sound
    this.scene.load.audio('death', 'assets/sfx/achievement_unlock.ogg'); // Reuse existing sound
    this.scene.load.audio('enemy_death', 'assets/sfx/level_up.ogg'); // Reuse existing sound
    this.scene.load.audio('next_floor', 'assets/sfx/achievement_unlock.ogg'); // Reuse existing sound
    this.scene.load.audio('click', 'assets/sfx/sword_hit.ogg'); // Reuse existing sound
  }
  
  /**
   * Generate and load sprites
   */
  private generateSprites(): void {
    // Generate hero atlas
    const heroAtlas = HeroSpriteGenerator.generateHeroAtlas();
    this.scene.textures.addBase64('hero_atlas', heroAtlas);
    
    // Generate enemy atlas
    const enemyAtlas = EnemySpriteGenerator.generateEnemyAtlas();
    this.scene.textures.addBase64('enemies_atlas', enemyAtlas);
    
    // Generate dungeon tileset
    const dungeonTileset = TilesetGenerator.generateDungeonTileset();
    this.scene.textures.addBase64('dungeon_tileset', dungeonTileset);
    
    // Generate placeholder for items
    const itemsCanvas = document.createElement('canvas');
    itemsCanvas.width = 64;
    itemsCanvas.height = 64;
    const itemsCtx = itemsCanvas.getContext('2d')!;
    itemsCtx.fillStyle = '#ffaa00';
    itemsCtx.fillRect(0, 0, 64, 64);
    itemsCtx.strokeStyle = '#000000';
    itemsCtx.strokeRect(0, 0, 64, 64);
    itemsCtx.fillStyle = '#ffffff';
    itemsCtx.fillText('Item', 16, 32);
    this.scene.textures.addBase64('items_atlas', itemsCanvas.toDataURL());
    
    // Generate placeholder for effects
    const effectsCanvas = document.createElement('canvas');
    effectsCanvas.width = 64;
    effectsCanvas.height = 64;
    const effectsCtx = effectsCanvas.getContext('2d')!;
    effectsCtx.fillStyle = '#ffffff';
    effectsCtx.fillRect(0, 0, 64, 64);
    effectsCtx.strokeStyle = '#000000';
    effectsCtx.strokeRect(0, 0, 64, 64);
    effectsCtx.fillStyle = '#000000';
    effectsCtx.fillText('Effect', 16, 32);
    this.scene.textures.addBase64('effects_atlas', effectsCanvas.toDataURL());
    
    // Generate placeholder for UI
    const uiCanvas = document.createElement('canvas');
    uiCanvas.width = 64;
    uiCanvas.height = 64;
    const uiCtx = uiCanvas.getContext('2d')!;
    uiCtx.fillStyle = '#4444ff';
    uiCtx.fillRect(0, 0, 64, 64);
    uiCtx.strokeStyle = '#000000';
    uiCtx.strokeRect(0, 0, 64, 64);
    uiCtx.fillStyle = '#ffffff';
    uiCtx.fillText('UI', 24, 32);
    this.scene.textures.addBase64('ui_atlas', uiCanvas.toDataURL());
    
    // Generate placeholder hero (for backward compatibility)
    const heroCanvas = document.createElement('canvas');
    heroCanvas.width = 64;
    heroCanvas.height = 64;
    const heroCtx = heroCanvas.getContext('2d')!;
    heroCtx.fillStyle = '#00ff88';
    heroCtx.fillRect(0, 0, 64, 64);
    heroCtx.strokeStyle = '#000000';
    heroCtx.strokeRect(0, 0, 64, 64);
    heroCtx.fillStyle = '#ffffff';
    heroCtx.fillText('Hero', 20, 32);
    this.scene.textures.addBase64('placeholder_hero', heroCanvas.toDataURL());
  }
  
  /**
   * Create animation frames for hero
   */
  public createHeroAnimations(): void {
    if (!this.scene.textures.exists('hero_atlas')) return;
    
    const texture = this.scene.textures.get('hero_atlas');
    
    // Create frames for all animation combinations
    const directions = ['down', 'up', 'left', 'right'];
    const actions = ['idle', 'walk', 'attack', 'cast', 'death'];
    const shellClasses = ['shell_defender', 'swift_current', 'fire_belly'];
    
    // Default to swift_current if no class is selected
    const selectedClass = this.scene.registry.get('selectedShellClass')?.name || 'Swift Current';
    const classKey = selectedClass.toLowerCase().replace(' ', '_');
    
    let frameIndex = 0;
    actions.forEach((action, actionIndex) => {
      directions.forEach((direction, dirIndex) => {
        const x = dirIndex * 64;
        const y = actionIndex * 64;
        
        // Create frame
        const frameName = `${action}_${direction}_01`;
        if (!texture.has(frameName)) {
          texture.add(frameName, 0, x, y, 64, 64);
        }
        
        // Create animation
        const animKey = `${classKey}_${action}_${direction}`;
        if (!this.scene.anims.exists(animKey)) {
          this.scene.anims.create({
            key: animKey,
            frames: [{ key: 'hero_atlas', frame: frameName }],
            frameRate: 8,
            repeat: action === 'idle' || action === 'walk' ? -1 : 0
          });
        }
        
        frameIndex++;
      });
      
      // Create generic animations for each action (without direction)
      const animKey = `${classKey}_${action}`;
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: [{ key: 'hero_atlas', frame: `${action}_down_01` }],
          frameRate: 8,
          repeat: action === 'idle' || action === 'walk' ? -1 : 0
        });
      }
    });
  }
  
  /**
   * Create animation frames for enemies
   */
  public createEnemyAnimations(): void {
    if (!this.scene.textures.exists('enemies_atlas')) return;
    
    const texture = this.scene.textures.get('enemies_atlas');
    
    // Create frames for all enemy types
    const enemyTypes = [
      'slime', 'crab', 'fish', 'octopus',
      'jellyfish', 'shark', 'turtle', 'serpent'
    ];
    
    enemyTypes.forEach((type, index) => {
      const x = (index % 4) * 64;
      const y = Math.floor(index / 4) * 64;
      
      // Create frame
      const frameName = `${type}_01`;
      if (!texture.has(frameName)) {
        texture.add(frameName, 0, x, y, 64, 64);
      }
      
      // Create animations
      const actions = ['idle', 'walk', 'attack', 'death'];
      
      actions.forEach(action => {
        const animKey = `${type}_${action}`;
        if (!this.scene.anims.exists(animKey)) {
          this.scene.anims.create({
            key: animKey,
            frames: [{ key: 'enemies_atlas', frame: frameName }],
            frameRate: 8,
            repeat: action === 'idle' || action === 'walk' ? -1 : 0
          });
        }
      });
    });
    
    // Create generic enemy animations
    const actions = ['idle', 'walk', 'attack', 'death'];
    
    actions.forEach(action => {
      const animKey = `enemy_${action}`;
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: [{ key: 'enemies_atlas', frame: 'slime_01' }],
          frameRate: 8,
          repeat: action === 'idle' || action === 'walk' ? -1 : 0
        });
      }
    });
  }
}





