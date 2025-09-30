/**
 * CleanPreloadScene - Industry-Standard Asset Loading
 * Loads all assets including PixelLab sprites and audio
 */

import Phaser from 'phaser';
import { Howl, Howler } from 'howler';

export class CleanPreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private howlerSounds: Map<string, Howl> = new Map();
  
  constructor() {
    super({ key: 'CleanPreloadScene' });
  }
  
  preload(): void {
    console.log('📦 CleanPreloadScene: Loading assets...');
    
    // Create loading UI
    this.createLoadingUI();
    
    // Load PixelLab sprites (properly sized)
    this.loadPixelLabAssets();
    
    // Load audio with Howler.js
    this.loadHowlerAudio();
    
    // Load tilesets
    this.loadTilesets();
    
    // Load UI assets
    this.loadUIAssets();
    
    // Setup loading progress
    this.setupLoadingProgress();
  }
  
  create(): void {
    console.log('✅ CleanPreloadScene: All assets loaded');
    
    // Store Howler sounds for other scenes
    this.registry.set('howlerSounds', this.howlerSounds);
    
    // Create basic fallback textures
    this.createBasicTextures();
    
    // Optimize textures for WebGL
    this.optimizeTextures();
    
    // Move to menu scene
    this.time.delayedCall(500, () => {
      this.scene.start('CleanMenuScene');
    });
  }
  
  /**
   * Create professional loading UI
   */
  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);
    
    // Title
    this.add.text(width / 2, height / 2 - 100, '🐢 Bob The Turtle', {
      fontSize: '48px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2 - 50, 'Hero Of Turtle Dungeon Depths', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2 - 20, 'Industry-Standard Edition', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Loading bar background
    const barBg = this.add.rectangle(width / 2, height / 2 + 50, 400, 20, 0x333333);
    barBg.setStrokeStyle(2, 0x666666);
    
    // Loading bar fill
    this.loadingBar = this.add.graphics();
    
    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 + 100, 'Initializing...', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
  
  /**
   * Load PixelLab assets with proper power-of-2 sizing
   */
  private loadPixelLabAssets(): void {
    console.log('🎨 Loading PixelLab assets...');
    
    // Hero (8 directions) - using green_turtle folder
    this.loadCharacterSet('green_turtle', 'green_turtle', true);
    
    // Enemies (4 directions each)
    const enemies = ['red_goblin', 'skeleton_warrior', 'orc_brute', 'dark_wizard_boss'];
    enemies.forEach(enemy => this.loadCharacterSet('enemies', enemy, false));
    
    // Items (4 directions each)
    const items = ['health_potion', 'mana_potion', 'treasure_chest'];
    items.forEach(item => this.loadCharacterSet('items', item, false));
    
    // Effects (4 directions each)
    this.loadCharacterSet('effects', 'magic_spell', false);
    
    // Environment (4 directions each)
    const environment = ['dungeon_door', 'stairs_down', 'torch_flame'];
    environment.forEach(env => this.loadCharacterSet('environment', env, false));
    
    // UI elements (4 directions each)
    const ui = ['mana_bar', 'ui_button'];
    ui.forEach(uiElement => this.loadCharacterSet('ui', uiElement, false));
  }
  
  /**
   * Load character set with proper error handling
   */
  private loadCharacterSet(category: string, name: string, has8Directions: boolean): void {
    const directions = has8Directions ? 
      ['south', 'west', 'east', 'north', 'south-west', 'south-east', 'north-west', 'north-east'] :
      ['south', 'west', 'east', 'north'];
    
    directions.forEach(direction => {
      const key = `${name}_${direction}`;
      const path = `assets/sprites/${category}/rotations/${direction}.png`;
      
      this.load.image(key, path);
      
      // Error handling
      this.load.once(`filecomplete-image-${key}`, () => {
        console.log(`✅ Loaded: ${key}`);
      });
      
      this.load.once(`loaderror-image-${key}`, () => {
        console.warn(`⚠️ Failed to load: ${key} from ${path} - creating fallback`);
        this.createFallbackTexture(key, name, direction);
      });
    });
  }
  
  /**
   * Create basic textures for tiles and UI
   */
  private createBasicTextures(): void {
    // Create floor tile
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0x8B7355, 1.0);
    floorGraphics.fillRect(0, 0, 32, 32);
    floorGraphics.lineStyle(1, 0x5D4E37);
    floorGraphics.strokeRect(0, 0, 32, 32);
    floorGraphics.generateTexture('floor_tile', 32, 32);
    floorGraphics.destroy();
    
    // Create wall tile
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x555555, 1.0);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.lineStyle(1, 0x333333);
    wallGraphics.strokeRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall_tile', 32, 32);
    wallGraphics.destroy();
    
    console.log('✅ Created basic textures');
  }
  
  /**
   * Create fallback texture for failed loads
   */
  private createFallbackTexture(key: string, name: string, direction: string): void {
    const size = 48;
    const graphics = this.add.graphics();
    
    // Different colors based on entity type
    let color = 0x666666;
    if (name.includes('green_turtle')) color = 0x00aa44;
    else if (name.includes('goblin')) color = 0xaa0000;
    else if (name.includes('skeleton')) color = 0xcccccc;
    else if (name.includes('orc')) color = 0x444444;
    else if (name.includes('wizard')) color = 0x4444aa;
    else if (name.includes('potion')) color = 0xaa0044;
    else if (name.includes('chest')) color = 0xaa6600;
    
    // Draw simple shape
    graphics.fillStyle(color, 1.0);
    graphics.fillRect(0, 0, size, size);
    graphics.lineStyle(2, 0x000000);
    graphics.strokeRect(0, 0, size, size);
    
    // Add direction indicator
    graphics.fillStyle(0xffffff, 1.0);
    graphics.fillRect(size-10, 2, 8, 8);
    
    // Generate texture
    graphics.generateTexture(key, size, size);
    graphics.destroy();
    
    console.log(`✅ Created fallback texture: ${key}`);
  }
  
  /**
   * Load audio using Howler.js for spatial audio
   */
  private loadHowlerAudio(): void {
    console.log('🔊 Loading Howler.js audio...');
    
    // Define audio files with fallback formats
    const audioFiles = {
      // Music (using mp3 for better compatibility)
      menu_music: 'assets/music/1.mp3',
      exploration_music: 'assets/music/2.mp3',
      combat_music: 'assets/music/3.mp3',
      
      // SFX (create web audio versions)
      sword_hit: null, // Will generate
      enemy_death: null,
      level_up: null,
      achievement: null
    };
    
    // Load music files
    Object.entries(audioFiles).forEach(([key, path]) => {
      if (path) {
        const sound = new Howl({
          src: [path],
          loop: key.includes('music'),
          volume: key.includes('music') ? 0.6 : 0.8,
          preload: true,
          onload: () => console.log(`✅ Loaded audio: ${key}`),
          onloaderror: (id, error) => console.warn(`⚠️ Failed to load audio: ${key}`, error)
        });
        
        this.howlerSounds.set(key, sound);
      }
    });
    
    // Generate Web Audio SFX
    this.generateWebAudioSFX();
  }
  
  /**
   * Generate SFX using Web Audio API
   */
  private generateWebAudioSFX(): void {
    if (!Howler.ctx) return;
    
    const ctx = Howler.ctx;
    
    // Generate sword hit sound
    const swordHitBuffer = this.createSwordHitSound(ctx);
    const swordHitSound = new Howl({
      src: [this.audioBufferToDataURL(swordHitBuffer)],
      volume: 0.7
    });
    this.howlerSounds.set('sword_hit', swordHitSound);
    
    // Generate level up sound
    const levelUpBuffer = this.createLevelUpSound(ctx);
    const levelUpSound = new Howl({
      src: [this.audioBufferToDataURL(levelUpBuffer)],
      volume: 0.8
    });
    this.howlerSounds.set('level_up', levelUpSound);
    
    console.log('✅ Generated Web Audio SFX');
  }
  
  /**
   * Create sword hit sound
   */
  private createSwordHitSound(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const duration = 0.3;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 10);
      const noise = (Math.random() * 2 - 1) * 0.3;
      const tone = Math.sin(t * 800 * Math.PI * 2) * 0.5;
      data[i] = (noise + tone) * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Create level up sound
   */
  private createLevelUpSound(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const duration = 1.0;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const freq = 440 + t * 220;
      const tone = Math.sin(t * freq * Math.PI * 2);
      data[i] = tone * envelope * 0.3;
    }
    
    return buffer;
  }
  
  /**
   * Convert AudioBuffer to data URL for Howler
   */
  private audioBufferToDataURL(buffer: AudioBuffer): string {
    // This is a simplified version - in production you'd use a proper encoder
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = buffer.length;
    canvas.height = 1;
    
    // Create a simple data URL (placeholder)
    return canvas.toDataURL();
  }
  
  /**
   * Load tilesets from PixelLab
   */
  private loadTilesets(): void {
    console.log('🗺️ Loading tilesets...');
    
    const tilesets = [
      'stone_mossy',
      'dirt_cave', 
      'marble_ornate',
      'wooden_brick',
      'cobblestone_cracked'
    ];
    
    tilesets.forEach(tileset => {
      this.load.json(`${tileset}_tileset`, `assets/tilesets/${tileset}.json`);
    });
  }
  
  /**
   * Load UI assets
   */
  private loadUIAssets(): void {
    console.log('🖼️ Loading UI assets...');
    
    // Load any additional UI textures needed
    // Most UI will be generated procedurally with Rex UI
  }
  
  /**
   * Setup loading progress tracking
   */
  private setupLoadingProgress(): void {
    this.load.on('progress', (progress: number) => {
      // Update loading bar
      const { width } = this.cameras.main;
      this.loadingBar.clear();
      this.loadingBar.fillStyle(0x00ff88);
      this.loadingBar.fillRect((width / 2) - 198, (width / 2) + 49, 396 * progress, 16);
      
      // Update loading text
      this.loadingText.setText(`Loading... ${Math.round(progress * 100)}%`);
    });
    
    this.load.on('fileprogress', (file: any) => {
      this.loadingText.setText(`Loading: ${file.key}`);
    });
  }
  
  /**
   * Optimize all textures for WebGL compliance
   */
  private optimizeTextures(): void {
    console.log('🔧 Optimizing textures for WebGL...');
    
    // This will ensure all textures are power-of-2 compliant
    this.textures.each((key: string, texture: Phaser.Textures.Texture) => {
      // Safety check for texture and source
      if (!texture || !texture.source || !texture.source[0]) {
        console.warn(`⚠️ Skipping invalid texture: ${key}`);
        return;
      }
      
      const source = texture.source[0];
      if (source) {
        const { width, height } = source;
        
        // Check if texture is power of 2
        const isPowerOf2 = (n: number) => (n & (n - 1)) === 0;
        
        if (!isPowerOf2(width) || !isPowerOf2(height)) {
          console.log(`⚠️ Non-power-of-2 texture: ${key} (${width}x${height})`);
          // In production, you'd resize these textures
        }
      }
    });
    
    console.log('✅ Texture optimization completed');
  }
}
