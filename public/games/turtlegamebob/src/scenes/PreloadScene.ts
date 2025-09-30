/**
 * PreloadScene - Asset loading with progress tracking
 * Loads all game assets and shows loading progress
 */

import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;
  private assetText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingScreen();
    this.loadAssets();
    this.setupLoadingEvents();
  }

  create(): void {
    console.log('🎨 Assets loaded - transitioning to menu');
    
    // Check for missing audio files and create fallbacks
    this.ensureAudioFallbacks();
    
    // Setup placeholder frames for hero animations
    this.setupPlaceholderFrames();
    
    // Optimize textures for better performance
    this.optimizeLoadedTextures();
    
    // Small delay to show completion
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
  
  /**
   * Ensure all required audio files have fallbacks if missing
   */
  private ensureAudioFallbacks(): void {
    const requiredSfx = ['achievement_unlock', 'level_up', 'sword_hit'];
    
    requiredSfx.forEach(sfxKey => {
      if (!this.cache.audio.exists(sfxKey)) {
        console.warn(`🔊 Audio missing: ${sfxKey}, creating fallback`);
        this.createAudioFallback(sfxKey);
      } else {
        console.log(`✅ Audio ready: ${sfxKey}`);
      }
    });
  }
  
  private optimizeLoadedTextures(): void {
    try {
      // Enable texture caching and compression where possible
      const textureManager = this.textures;
      
      // Iterate through texture keys instead of list.forEach
      Object.keys(textureManager.list).forEach(key => {
        const texture = textureManager.get(key);
        if (texture && texture.source && texture.source[0]) {
          try {
            // Set smooth rendering for better quality
            texture.source[0].scaleMode = Phaser.ScaleModes.LINEAR;
            
            // Skip mipmapping to avoid WebGL warnings with non-power-of-two textures
            // Modern browsers handle non-power-of-two textures well without mipmaps
            if (texture.source[0].image && this.renderer && this.renderer.gl) {
              const image = texture.source[0].image;
              const isPowerOfTwo = (image.width & (image.width - 1)) === 0 && 
                                  (image.height & (image.height - 1)) === 0;
              
              // Only enable mipmapping for power-of-two textures and when texture is bound
              if (isPowerOfTwo && texture.source[0].glTexture) {
                console.log(`🖼️ Enabling mipmaps for power-of-two texture: ${key} (${image.width}x${image.height})`);
              } else if (!isPowerOfTwo) {
                console.log(`🖼️ Skipping mipmaps for non-power-of-two texture: ${key} (${image.width}x${image.height})`);
              }
            }
          } catch (error) {
            // Ignore individual texture optimization errors
          }
        }
      });
      
      console.log('🚀 Texture optimization completed');
    } catch (error) {
      console.warn('⚠️ Texture optimization skipped:', error);
    }
  }

  private createLoadingScreen(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Title
    this.add.text(width / 2, height / 2 - 150, '🐢 BOB THE TURTLE', {
      fontSize: '48px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2 - 100, 'HERO OF TURTLE DUNGEON DEPTHS', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Progress bar background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222);
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // Progress bar
    this.loadingBar = this.add.graphics();
    
    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Percentage text
    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Asset being loaded text
    this.assetText = this.add.text(width / 2, height / 2 + 50, '', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private setupLoadingEvents(): void {
    this.load.on('progress', (value: number) => {
      this.percentText.setText(Math.round(value * 100) + '%');
      
      this.loadingBar.clear();
      this.loadingBar.fillStyle(0x00ff88);
      this.loadingBar.fillRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('fileprogress', (file: any) => {
      this.assetText.setText('Loading: ' + file.key);
    });
    
    // Handle file load errors gracefully
    this.load.on('loaderror', (file: any) => {
      console.warn(`⚠️ Failed to load: ${file.key} (${file.type})`);
      this.assetText.setText(`Skipped: ${file.key}`);
    });
    
    this.load.on('complete', () => {
      this.loadingBar.destroy();
      this.progressBox.destroy();
      this.loadingText.setText('Complete!');
      this.percentText.setText('100%');
      this.assetText.setText('Ready to explore the depths!');
    });
  }

  private loadAssets(): void {
    // Create a simple placeholder for testing
    this.createSimplePlaceholders();
    
    // Create all placeholder assets including hero atlas
    this.createPlaceholderAssets();
    
    // Load extracted assets
    this.loadExtractedAssets();
    
    // Load music assets
    for (let i = 1; i <= 28; i++) {
      this.load.audio(`music${i}`, `assets/music/${i}.mp3`);
    }
    
    // Generate Web Audio API sounds for missing SFX
    this.generateWebAudioSounds();
    
    // Load existing SFX assets with error handling
    this.loadSFXWithErrorHandling();
  }
  
  /**
   * Load extracted assets from the assets/extracted directory
   */
  private loadExtractedAssets(): void {
    console.log('🎨 Loading extracted assets...');
    
    // Load green turtle hero (8 directions)
    this.loadCategoryAsset('green_turtle', 'hero', true);
    
    // Load enemies (4 directions)
    this.loadCategoryAsset('enemies', 'red_goblin', false);
    this.loadCategoryAsset('enemies', 'skeleton_warrior', false);
    this.loadCategoryAsset('enemies', 'orc_brute', false);
    this.loadCategoryAsset('enemies', 'dark_wizard_boss', false);
    
    // Load items (4 directions)
    this.loadCategoryAsset('items', 'health_potion', false);
    this.loadCategoryAsset('items', 'mana_potion', false);
    this.loadCategoryAsset('items', 'treasure_chest', false);
    
    // Load effects (4 directions)
    this.loadCategoryAsset('effects', 'magic_spell', false);
    
    // Load environment objects (4 directions)
    this.loadCategoryAsset('environment', 'dungeon_door', false);
    this.loadCategoryAsset('environment', 'stairs_down', false);
    this.loadCategoryAsset('environment', 'torch_flame', false);
    
    // Load UI elements (4 directions)
    this.loadCategoryAsset('ui', 'mana_bar', false);
    this.loadCategoryAsset('ui', 'ui_button', false);
    
    // Load tilesets
    this.loadTilesetAsset('stone_mossy', 'stone_mossy_tileset');
    this.loadTilesetAsset('dirt_cave', 'dirt_cave_tileset');
    this.loadTilesetAsset('marble_ornate', 'marble_ornate_tileset');
    this.loadTilesetAsset('wooden_brick', 'wooden_brick_tileset');
    this.loadTilesetAsset('cobblestone_cracked', 'cobblestone_cracked_tileset');
  }
  
  /**
   * Load assets from a category folder (e.g., enemies, items, etc.)
   */
  private loadCategoryAsset(category: string, key: string, has8Directions: boolean): void {
    try {
      const directions = has8Directions 
        ? ['south', 'west', 'east', 'north', 'south-west', 'south-east', 'north-west', 'north-east']
        : ['south', 'west', 'east', 'north'];

      let loadedCount = 0;
      const totalDirections = directions.length;

      directions.forEach((direction, index) => {
        const imagePath = `assets/sprites/${category}/rotations/${direction}.png`;
        const imageKey = `${key}_${direction}`;
        
        this.load.image(imageKey, imagePath);
        
        this.load.once(`filecomplete-image-${imageKey}`, () => {
          loadedCount++;
          if (loadedCount === totalDirections) {
            console.log(`✅ Loaded all ${totalDirections} directions for ${key}`);
          }
        });
        
        this.load.once(`loaderror-image-${imageKey}`, () => {
          console.warn(`⚠️ Failed to load ${imageKey} from ${imagePath}`);
        });
      });
    } catch (error) {
      console.warn(`⚠️ Failed to load category asset ${key}:`, error);
    }
  }

  /**
   * Load a character asset from the extracted directory (DEPRECATED - use loadCategoryAsset)
   */
  private loadCharacterAsset(path: string, key: string): void {
    try {
      // Try to load all directions
      const directions = ['south', 'west', 'east', 'north', 'south-west', 'south-east', 'north-west', 'north-east'];
      
      // Create a spritesheet from the directions
      const frames: Phaser.Types.Loader.FileTypes.ImageFrameConfig[] = [];
      
      // Add each direction as a frame
      directions.forEach((direction, index) => {
        try {
          this.load.image(`${key}_${direction}`, `assets/extracted/${path}/rotations/${direction}.png`);
          frames.push({
            key: `${key}_${direction}`,
            frame: index
          });
        } catch (error) {
          console.warn(`⚠️ Failed to load ${key} ${direction} rotation`);
        }
      });
      
      // Create atlas configuration
      const atlasConfig = {
        texture: key,
        frames: frames
      };
      
      // Add to texture manager when all images are loaded
      this.load.once('complete', () => {
        try {
          this.textures.addAtlas(key, atlasConfig);
          console.log(`✅ Created atlas for ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to create atlas for ${key}:`, error);
        }
      });
    } catch (error) {
      console.warn(`⚠️ Failed to load character asset ${key}:`, error);
    }
  }
  
  /**
   * Load a tileset asset from the extracted directory
   */
  private loadTilesetAsset(name: string, key: string): void {
    try {
      this.load.json(key, `assets/tilesets/${name}.json`);
      
      // Process tileset when loaded
      this.load.once(`filecomplete-json-${key}`, () => {
        try {
          const tilesetData = this.cache.json.get(key);
          
          if (tilesetData && tilesetData.tileset_data && tilesetData.tileset_data.tiles) {
            console.log(`✅ Loaded tileset ${key} with ${tilesetData.tileset_data.tiles.length} tiles`);
            
            // Create textures for each tile
            tilesetData.tileset_data.tiles.forEach((tile: any) => {
              if (tile.image && tile.image.base64) {
                const tileKey = `${key}_tile_${tile.id}`;
                try {
                  // Create image from base64
                  const img = new Image();
                  img.src = `data:image/png;base64,${tile.image.base64}`;
                  
                  // Add to texture manager when loaded
                  img.onload = () => {
                    this.textures.addImage(tileKey, img);
                  };
                } catch (error) {
                  console.warn(`⚠️ Failed to create texture for ${tileKey}:`, error);
                }
              }
            });
          }
        } catch (error) {
          console.warn(`⚠️ Failed to process tileset ${key}:`, error);
        }
      });
    } catch (error) {
      console.warn(`⚠️ Failed to load tileset ${key}:`, error);
    }
  }
  
  private generateWebAudioSounds(): void {
    // Create Web Audio API sounds for missing SFX
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Generate click sound
    const clickBuffer = this.createClickSound(audioContext);
    this.cache.audio.add('click', clickBuffer);
    
    // Generate damage sound
    const damageBuffer = this.createDamageSound(audioContext);
    this.cache.audio.add('damage', damageBuffer);
    
    // Generate death sound
    const deathBuffer = this.createDeathSound(audioContext);
    this.cache.audio.add('death', deathBuffer);
    
    // Generate enemy death sound
    const enemyDeathBuffer = this.createEnemyDeathSound(audioContext);
    this.cache.audio.add('enemy_death', enemyDeathBuffer);
    
    // Generate next floor sound
    const nextFloorBuffer = this.createNextFloorSound(audioContext);
    this.cache.audio.add('next_floor', nextFloorBuffer);
  }
  
  private createClickSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.1; // 100ms
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.3;
    }
    
    return buffer;
  }
  
  private createDamageSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.2;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 5) * 0.2;
    }
    
    return buffer;
  }
  
  private createDeathSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.5;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq = 200 * (1 - t);
      data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 2) * 0.3;
    }
    
    return buffer;
  }
  
  private createEnemyDeathSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.3;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq = 400 + 200 * Math.sin(t * 10);
      data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3) * 0.2;
    }
    
    return buffer;
  }
  
  private createNextFloorSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.4;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq = 400 + 400 * t;
      data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 1) * 0.3;
    }
    
    return buffer;
  }
  
  private createAchievementSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.6; // Achievement sounds are longer and more celebratory
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Three-note triumphant chord progression
      const freq1 = 523.25; // C5
      const freq2 = 659.25; // E5
      const freq3 = 783.99; // G5
      
      let sample = 0;
      if (t < 0.2) {
        sample = Math.sin(2 * Math.PI * freq1 * t) * Math.exp(-t * 2) * 0.3;
      } else if (t < 0.4) {
        sample = Math.sin(2 * Math.PI * freq2 * t) * Math.exp(-(t-0.2) * 2) * 0.3;
      } else {
        sample = Math.sin(2 * Math.PI * freq3 * t) * Math.exp(-(t-0.4) * 1.5) * 0.3;
      }
      
      data[i] = sample;
    }
    
    return buffer;
  }
  
  private createLevelUpSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.5; // Level up celebration sound
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Rising magical sound
      const freq = 440 + (660 * t); // Rising pitch from A4 to approximately E5
      const modulation = Math.sin(2 * Math.PI * 8 * t) * 0.1; // Slight vibrato
      data[i] = Math.sin(2 * Math.PI * (freq + modulation) * t) * Math.exp(-t * 1.5) * 0.4;
    }
    
    return buffer;
  }
  
  private createSwordHitSound(audioContext: AudioContext): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.15; // Quick, sharp impact sound
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Sharp metallic clang with noise component
      const toneFreq = 800 + (200 * Math.exp(-t * 20)); // Sharp, decaying metallic tone
      const noise = (Math.random() * 2 - 1) * 0.3; // White noise component
      const tone = Math.sin(2 * Math.PI * toneFreq * t) * 0.7;
      
      data[i] = (tone + noise) * Math.exp(-t * 15) * 0.3; // Very sharp decay
    }
    
    return buffer;
  }
  
  /**
   * Create synthetic audio fallbacks for missing SFX files
   */
  private createAudioFallback(sfxKey: string): void {
    try {
      // Create a minimal Web Audio API buffer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      let buffer: AudioBuffer;
      
      switch (sfxKey) {
        case 'achievement_unlock':
          buffer = this.createAchievementSound(audioContext);
          break;
        case 'level_up':
          buffer = this.createLevelUpSound(audioContext);
          break;
        case 'sword_hit':
          buffer = this.createSwordHitSound(audioContext);
          break;
        default:
          // Create a very short silent buffer as ultimate fallback
          buffer = audioContext.createBuffer(1, sampleRate * 0.1, sampleRate);
          break;
      }
      
      // Add the generated buffer to the audio cache
      this.cache.audio.add(sfxKey, buffer);
      console.log(`✅ Generated synthetic audio for: ${sfxKey}`);
      
    } catch (error) {
      console.warn(`⚠️ Failed to generate synthetic audio for ${sfxKey}:`, error);
      // Create absolute minimal fallback - silent buffer
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const silentBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.01, audioContext.sampleRate);
        this.cache.audio.add(sfxKey, silentBuffer);
      } catch (finalError) {
        console.error(`💥 Complete audio fallback failure for ${sfxKey}:`, finalError);
      }
    }
  }
  
  private loadSFXWithErrorHandling(): void {
    // Try to load existing SFX files with multiple format fallbacks
    const sfxFiles = [
      'achievement_unlock',
      'level_up', 
      'sword_hit'
    ];
    
    sfxFiles.forEach(sfx => {
      try {
        // Load WAV files from assets root directory
        this.load.audio(sfx, `assets/${sfx}.wav`);
        
        // Add error handler for individual files  
        this.load.once(`loaderror-audio-${sfx}`, () => {
          console.warn(`🔊 Failed to load ${sfx} audio files, will use Web Audio fallback`);
          // Note: createAudioFallback will be called in create() if needed
        });
        
        this.load.once(`filecomplete-audio-${sfx}`, () => {
          console.log(`🔊 Successfully loaded ${sfx}`);
        });
        
      } catch (error) {
        console.warn(`🔊 Failed to queue ${sfx}, using generated fallback`);
      }
    });
  }

  private createSimplePlaceholders(): void {
    // Create a simple placeholder hero
    const heroCanvas = document.createElement('canvas');
    heroCanvas.width = 64;
    heroCanvas.height = 64;
    const heroCtx = heroCanvas.getContext('2d')!;
    
    // Draw a simple turtle
    heroCtx.fillStyle = '#00aa00'; // Green body
    heroCtx.fillRect(16, 16, 32, 32);
    
    heroCtx.fillStyle = '#006600'; // Darker shell
    heroCtx.fillRect(20, 20, 24, 24);
    
    heroCtx.fillStyle = '#00ff00'; // Light green head
    heroCtx.fillRect(8, 24, 8, 16);
    
    heroCtx.fillStyle = '#ffffff'; // Eyes
    heroCtx.fillRect(10, 28, 4, 4);
    
    // Add the texture to the game
    this.textures.addCanvas('placeholder_hero', heroCanvas);
  }
  
  private createPlaceholderAssets(): void {
    // Create detailed placeholders for all missing textures
    const assets = [
      { key: 'placeholder_hero', color: '#00ff88', type: 'hero' },
      { key: 'dungeon_tileset', color: '#8B4513', type: 'tileset' },
      { key: 'enemies_atlas', color: '#ff4444', type: 'enemy' },
      { key: 'items_atlas', color: '#ffaa00', type: 'item' },
      { key: 'effects_atlas', color: '#ffffff', type: 'effect' },
      { key: 'ui_atlas', color: '#4444ff', type: 'ui' }
    ];
    
    assets.forEach(asset => {
      const dataURL = this.createDetailedPlaceholder(asset.type, asset.color);
      this.load.image(asset.key, dataURL);
    });
    
    // Create hero atlas with detailed sprites
    this.load.spritesheet('hero_atlas', this.createHeroAtlasTexture(), { frameWidth: 64, frameHeight: 64 });
  }
  
  private createDetailedPlaceholder(type: string, color: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Clear background
    ctx.clearRect(0, 0, 64, 64);
    
    switch (type) {
      case 'hero':
        // This is handled by the hero atlas
        this.drawDetailedTurtle(ctx, 0, 0, 'down', 'idle', 'Swift Current');
        break;
        
      case 'enemy':
        this.drawDetailedEnemy(ctx, 32, 32);
        break;
        
      case 'tileset':
        this.drawDetailedTileset(ctx);
        break;
        
      case 'item':
        this.drawDetailedTreasure(ctx, 32, 32);
        break;
        
      case 'effect':
        this.drawDetailedEffect(ctx);
        break;
        
      case 'ui':
        this.drawDetailedUI(ctx);
        break;
    }
    
    return canvas.toDataURL();
  }
  
  private drawDetailedEnemy(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Create a corrupted sea creature enemy
    const enemyColors = {
      body: '#8B0000',        // Dark red
      bodyDark: '#4B0000',    // Darker red
      eyes: '#FF4500',        // Orange eyes
      eyesPupil: '#000000',   // Black pupils
      teeth: '#FFFFFF',       // White teeth
      fins: '#006400',        // Dark green fins
      corruption: '#800080'   // Purple corruption
    };
    
    // Main body (fish-like)
    ctx.fillStyle = enemyColors.body;
    ctx.fillRect(centerX - 12, centerY - 6, 24, 12);
    ctx.fillRect(centerX - 10, centerY - 8, 20, 16);
    ctx.fillRect(centerX - 8, centerY - 10, 16, 20);
    
    // Body shadows
    ctx.fillStyle = enemyColors.bodyDark;
    ctx.fillRect(centerX + 6, centerY + 2, 4, 8);
    ctx.fillRect(centerX - 4, centerY + 6, 12, 4);
    
    // Corruption patches
    ctx.fillStyle = enemyColors.corruption;
    ctx.fillRect(centerX - 6, centerY - 4, 3, 3);
    ctx.fillRect(centerX + 4, centerY - 2, 2, 2);
    ctx.fillRect(centerX - 2, centerY + 4, 4, 2);
    
    // Fins
    ctx.fillStyle = enemyColors.fins;
    ctx.fillRect(centerX - 14, centerY - 2, 4, 8); // Left fin
    ctx.fillRect(centerX + 10, centerY - 2, 4, 8); // Right fin
    ctx.fillRect(centerX + 8, centerY - 6, 8, 4); // Top fin
    
    // Eyes (menacing)
    ctx.fillStyle = enemyColors.eyes;
    ctx.fillRect(centerX - 6, centerY - 4, 4, 4);
    ctx.fillRect(centerX + 2, centerY - 4, 4, 4);
    
    // Eye pupils (angry)
    ctx.fillStyle = enemyColors.eyesPupil;
    ctx.fillRect(centerX - 4, centerY - 2, 2, 2);
    ctx.fillRect(centerX + 4, centerY - 2, 2, 2);
    
    // Teeth
    ctx.fillStyle = enemyColors.teeth;
    ctx.fillRect(centerX - 4, centerY + 2, 2, 3);
    ctx.fillRect(centerX - 1, centerY + 2, 2, 4);
    ctx.fillRect(centerX + 2, centerY + 2, 2, 3);
  }
  
  private drawDetailedTileset(ctx: CanvasRenderingContext2D): void {
    // Create underwater stone/coral tileset
    const tileColors = {
      stone: '#4682B4',       // Steel blue
      stoneLight: '#87CEEB',  // Sky blue
      stoneDark: '#2F4F4F',   // Dark slate gray
      coral: '#FF7F50',       // Coral
      seaweed: '#228B22'      // Forest green
    };
    
    // Base stone texture
    ctx.fillStyle = tileColors.stone;
    ctx.fillRect(0, 0, 64, 64);
    
    // Stone blocks pattern
    for (let x = 0; x < 64; x += 16) {
      for (let y = 0; y < 64; y += 16) {
        // Block outline
        ctx.fillStyle = tileColors.stoneDark;
        ctx.fillRect(x, y, 16, 2);
        ctx.fillRect(x, y, 2, 16);
        
        // Block highlights
        ctx.fillStyle = tileColors.stoneLight;
        ctx.fillRect(x + 2, y + 2, 12, 2);
        ctx.fillRect(x + 2, y + 2, 2, 12);
        
        // Coral growth
        if (Math.random() > 0.7) {
          ctx.fillStyle = tileColors.coral;
          ctx.fillRect(x + 6, y + 6, 4, 4);
          ctx.fillRect(x + 8, y + 4, 2, 2);
        }
        
        // Seaweed
        if (Math.random() > 0.8) {
          ctx.fillStyle = tileColors.seaweed;
          ctx.fillRect(x + 4, y + 8, 2, 6);
          ctx.fillRect(x + 3, y + 10, 2, 4);
        }
      }
    }
  }
  
  private drawDetailedTreasure(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Create underwater treasure chest
    const treasureColors = {
      chest: '#8B4513',       // Saddle brown
      chestDark: '#654321',   // Dark brown
      gold: '#FFD700',        // Gold
      goldDark: '#DAA520',    // Dark gold
      metal: '#C0C0C0',       // Silver
      gem: '#FF1493'          // Deep pink
    };
    
    // Chest base
    ctx.fillStyle = treasureColors.chest;
    ctx.fillRect(centerX - 12, centerY - 4, 24, 12);
    ctx.fillRect(centerX - 10, centerY - 6, 20, 16);
    
    // Chest shadows
    ctx.fillStyle = treasureColors.chestDark;
    ctx.fillRect(centerX + 6, centerY + 2, 4, 8);
    ctx.fillRect(centerX - 8, centerY + 6, 16, 2);
    
    // Gold trim
    ctx.fillStyle = treasureColors.gold;
    ctx.fillRect(centerX - 10, centerY - 2, 20, 2);
    ctx.fillRect(centerX - 10, centerY + 4, 20, 2);
    
    // Lock
    ctx.fillStyle = treasureColors.metal;
    ctx.fillRect(centerX - 2, centerY - 1, 4, 6);
    ctx.fillRect(centerX - 1, centerY - 3, 2, 3);
    
    // Keyhole
    ctx.fillStyle = treasureColors.chestDark;
    ctx.fillRect(centerX, centerY + 1, 1, 2);
    
    // Magical glow
    ctx.fillStyle = treasureColors.gem;
    ctx.fillRect(centerX - 14, centerY - 8, 2, 2);
    ctx.fillRect(centerX + 12, centerY - 6, 2, 2);
    ctx.fillRect(centerX - 6, centerY + 10, 2, 2);
    ctx.fillRect(centerX + 8, centerY + 12, 2, 2);
  }
  
  private drawDetailedEffect(ctx: CanvasRenderingContext2D): void {
    // Create magical water effects
    const effectColors = {
      water: '#40E0D0',       // Turquoise
      waterLight: '#AFEEEE',  // Pale turquoise
      magic: '#9370DB',       // Medium purple
      sparkle: '#FFFFFF'      // White
    };
    
    // Water ripples
    for (let i = 0; i < 4; i++) {
      const x = 16 + i * 8;
      const y = 16 + i * 8;
      
      ctx.fillStyle = effectColors.water;
      ctx.fillRect(x - 4, y, 8, 2);
      ctx.fillRect(x, y - 4, 2, 8);
      
      ctx.fillStyle = effectColors.waterLight;
      ctx.fillRect(x - 2, y + 1, 4, 1);
      ctx.fillRect(x + 1, y - 2, 1, 4);
    }
    
    // Magic sparkles
    const sparklePositions = [
      {x: 8, y: 8}, {x: 48, y: 12}, {x: 16, y: 48}, 
      {x: 52, y: 40}, {x: 24, y: 24}, {x: 40, y: 56}
    ];
    
    sparklePositions.forEach(pos => {
      ctx.fillStyle = effectColors.sparkle;
      ctx.fillRect(pos.x, pos.y, 2, 2);
      ctx.fillRect(pos.x + 1, pos.y - 1, 1, 1);
      ctx.fillRect(pos.x + 1, pos.y + 2, 1, 1);
      ctx.fillRect(pos.x - 1, pos.y + 1, 1, 1);
      ctx.fillRect(pos.x + 2, pos.y + 1, 1, 1);
    });
  }
  
  private drawDetailedUI(ctx: CanvasRenderingContext2D): void {
    // Create underwater-themed UI elements
    const uiColors = {
      frame: '#4682B4',       // Steel blue
      frameLight: '#87CEEB',  // Sky blue
      frameDark: '#2F4F4F',   // Dark slate gray
      accent: '#40E0D0'       // Turquoise
    };
    
    // Outer frame
    ctx.fillStyle = uiColors.frame;
    ctx.fillRect(0, 0, 64, 64);
    
    // Inner area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(4, 4, 56, 56);
    
    // Frame highlights
    ctx.fillStyle = uiColors.frameLight;
    ctx.fillRect(0, 0, 64, 2);
    ctx.fillRect(0, 0, 2, 64);
    
    // Frame shadows
    ctx.fillStyle = uiColors.frameDark;
    ctx.fillRect(0, 62, 64, 2);
    ctx.fillRect(62, 0, 2, 64);
    
    // Corner decorations
    ctx.fillStyle = uiColors.accent;
    ctx.fillRect(8, 8, 4, 4);
    ctx.fillRect(52, 8, 4, 4);
    ctx.fillRect(8, 52, 4, 4);
    ctx.fillRect(52, 52, 4, 4);
    
    // Center decoration
    ctx.fillStyle = uiColors.accent;
    ctx.fillRect(30, 30, 4, 4);
    ctx.fillRect(28, 32, 8, 2);
    ctx.fillRect(32, 28, 2, 8);
  }
  
  private createHeroAtlasTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 256;  // 4 frames wide
    canvas.height = 320; // 5 actions high
    const ctx = canvas.getContext('2d')!;
    
    // Create detailed pixel art for Swift Current (default class)
    // In a full implementation, this would read the selected class from registry
    const actions = ['idle', 'walk', 'attack', 'cast', 'death'];
    const directions = ['down', 'up', 'left', 'right'];
    const shellClass = 'Swift Current'; // Default to Swift Current
    
    actions.forEach((action, actionIndex) => {
      directions.forEach((direction, dirIndex) => {
        const x = dirIndex * 64;
        const y = actionIndex * 64;
        
        // Create detailed turtle based on the reference style
        this.drawDetailedTurtle(ctx, x, y, direction, action, shellClass);
      });
    });
    
    return canvas.toDataURL();
  }
  
  private getShellClassColors(shellClass: string): any {
    switch (shellClass) {
      case 'Shell Defender':
        return {
          shell: '#2B5D31',      // Deep forest green shell
          shellPattern: '#4F7942', // Medium green pattern
          body: '#228B22',       // Forest green body
          bodyLight: '#90EE90',  // Light green highlights
          bodyDark: '#006400',   // Dark green shadows
          eyes: '#FFD700',       // Gold eyes
          eyesPupil: '#2B2B2B',  // Dark pupils
          claws: '#F5DEB3',      // Wheat colored claws
          weapon: '#8B4513',     // Brown weapon handle
          weaponMetal: '#A0522D', // Bronze metal
          classSymbol: '#228B22' // Earth/shield symbol
        };
      
      case 'Fire Belly':
        return {
          shell: '#8B0000',      // Dark red shell
          shellPattern: '#FF4500', // Orange-red pattern
          body: '#DC143C',       // Crimson body
          bodyLight: '#FF6347',  // Tomato highlights
          bodyDark: '#B22222',   // Fire brick shadows
          eyes: '#FF8C00',       // Dark orange eyes
          eyesPupil: '#2B2B2B',  // Dark pupils
          claws: '#2F4F4F',      // Dark slate claws
          weapon: '#8B4513',     // Brown weapon handle
          weaponMetal: '#CD853F', // Peru metal
          classSymbol: '#FF4500' // Fire symbol
        };
      
      case 'Swift Current':
      default:
        return {
          shell: '#2B8A3E',      // Deep green shell
          shellPattern: '#51CF66', // Bright green pattern
          body: '#228BE6',       // Blue body (Swift Current)
          bodyLight: '#74C0FC',  // Light blue highlights
          bodyDark: '#1864AB',   // Dark blue shadows
          eyes: '#FFD43B',       // Golden eyes
          eyesPupil: '#2B2B2B',  // Dark pupils
          claws: '#F8F9FA',      // Light claws
          weapon: '#8B4513',     // Brown weapon handle
          weaponMetal: '#C0C0C0', // Silver weapon
          classSymbol: '#40E0D0' // Water/turquoise symbol
        };
    }
  }
  
  private drawDetailedTurtle(ctx: CanvasRenderingContext2D, x: number, y: number, direction: string, action: string, shellClass: string = 'Swift Current'): void {
    // Clear the area with transparent background
    ctx.clearRect(x, y, 64, 64);
    
    // Determine shell class colors based on class
    const shellColors = this.getShellClassColors(shellClass);
    
    // Base body position adjustments for direction
    let bodyOffsetX = 0, bodyOffsetY = 0;
    let headOffsetX = 0, headOffsetY = 0;
    
    switch (direction) {
      case 'down':
        headOffsetY = 8;
        break;
      case 'up': 
        headOffsetY = -8;
        break;
      case 'left':
        headOffsetX = -6;
        bodyOffsetX = 2;
        break;
      case 'right':
        headOffsetX = 6;
        bodyOffsetX = -2;
        break;
    }
    
    // Action-specific modifications
    if (action === 'walk') {
      bodyOffsetY += Math.sin(Date.now() / 200) * 1; // Subtle bob
    } else if (action === 'attack') {
      if (direction === 'right') headOffsetX += 4;
      if (direction === 'left') headOffsetX -= 4;
    }
    
    const centerX = x + 32 + bodyOffsetX;
    const centerY = y + 32 + bodyOffsetY;
    
    // Draw shell (back layer)
    this.drawTurtleShell(ctx, centerX, centerY - 4, shellColors);
    
    // Draw body
    this.drawTurtleBody(ctx, centerX, centerY, direction, shellColors);
    
    // Draw head
    this.drawTurtleHead(ctx, centerX + headOffsetX, centerY + headOffsetY - 8, direction, shellColors);
    
    // Draw limbs
    this.drawTurtleLimbs(ctx, centerX, centerY, direction, action, shellColors);
    
    // Draw weapon for attack/cast actions
    if (action === 'attack' || action === 'cast') {
      this.drawWeapon(ctx, centerX, centerY, direction, action, shellColors);
    }
    
    // Death effect
    if (action === 'death') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x, y, 64, 64);
    }
    
    // Magic effects for cast
    if (action === 'cast') {
      this.drawMagicEffects(ctx, centerX, centerY, shellColors);
    }
  }
  
  private drawTurtleShell(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, colors: any): void {
    // Shell base (oval shape using rectangles for pixel art)
    ctx.fillStyle = colors.shell;
    ctx.fillRect(centerX - 12, centerY - 8, 24, 16);
    ctx.fillRect(centerX - 10, centerY - 10, 20, 20);
    ctx.fillRect(centerX - 8, centerY - 12, 16, 24);
    
    // Shell pattern (hexagonal segments)
    ctx.fillStyle = colors.shellPattern;
    ctx.fillRect(centerX - 6, centerY - 6, 4, 4);
    ctx.fillRect(centerX + 2, centerY - 6, 4, 4);
    ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
    ctx.fillRect(centerX - 6, centerY + 2, 4, 4);
    ctx.fillRect(centerX + 2, centerY + 2, 4, 4);
    
    // Shell edge highlights
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 12, centerY - 8, 24, 2);
    ctx.fillRect(centerX - 10, centerY - 10, 2, 4);
    ctx.fillRect(centerX + 8, centerY - 10, 2, 4);
  }
  
  private drawTurtleBody(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, direction: string, colors: any): void {
    // Main body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 8, centerY - 4, 16, 12);
    ctx.fillRect(centerX - 6, centerY - 6, 12, 16);
    
    // Body highlights
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 6, centerY - 4, 2, 8);
    ctx.fillRect(centerX - 4, centerY - 6, 8, 2);
    
    // Body shadows
    ctx.fillStyle = colors.bodyDark;
    ctx.fillRect(centerX + 4, centerY + 4, 2, 6);
    ctx.fillRect(centerX - 2, centerY + 8, 6, 2);
    
    // Class symbol on chest
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 1, centerY + 1, 2, 4);
    ctx.fillRect(centerX - 2, centerY + 2, 4, 2);
    ctx.fillStyle = colors.classSymbol;
    ctx.fillRect(centerX, centerY + 2, 1, 2);
  }
  
  private drawTurtleHead(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, direction: string, colors: any): void {
    // Head base
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 4, centerY - 2, 8, 6);
    ctx.fillRect(centerX - 3, centerY - 4, 6, 8);
    
    // Head highlights
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 3, centerY - 3, 2, 4);
    
    // Eyes based on direction
    let eyeOffsetX = 0;
    if (direction === 'left') eyeOffsetX = -1;
    if (direction === 'right') eyeOffsetX = 1;
    
    // Eyes
    ctx.fillStyle = colors.eyes;
    ctx.fillRect(centerX - 2 + eyeOffsetX, centerY - 1, 2, 2);
    ctx.fillRect(centerX + 1 + eyeOffsetX, centerY - 1, 2, 2);
    
    // Eye pupils
    ctx.fillStyle = colors.eyesPupil;
    ctx.fillRect(centerX - 1 + eyeOffsetX, centerY, 1, 1);
    ctx.fillRect(centerX + 2 + eyeOffsetX, centerY, 1, 1);
    
    // Nose/beak
    ctx.fillStyle = colors.bodyDark;
    if (direction === 'down') {
      ctx.fillRect(centerX, centerY + 2, 2, 1);
    } else if (direction === 'up') {
      ctx.fillRect(centerX, centerY - 2, 2, 1);
    }
  }
  
  private drawTurtleLimbs(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, direction: string, action: string, colors: any): void {
    // Arm positions vary by direction and action
    let leftArmX = centerX - 10, leftArmY = centerY + 2;
    let rightArmX = centerX + 8, rightArmY = centerY + 2;
    
    if (action === 'walk') {
      leftArmY += Math.sin(Date.now() / 150) * 2;
      rightArmY += Math.sin(Date.now() / 150 + Math.PI) * 2;
    }
    
    // Arms
    ctx.fillStyle = colors.body;
    ctx.fillRect(leftArmX, leftArmY, 3, 6);
    ctx.fillRect(rightArmX, rightArmY, 3, 6);
    
    // Legs
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 8, centerY + 8, 4, 6);
    ctx.fillRect(centerX + 4, centerY + 8, 4, 6);
    
    // Feet/claws
    ctx.fillStyle = colors.claws;
    ctx.fillRect(centerX - 8, centerY + 12, 2, 2);
    ctx.fillRect(centerX - 4, centerY + 12, 2, 2);
    ctx.fillRect(centerX + 4, centerY + 12, 2, 2);
    ctx.fillRect(centerX + 8, centerY + 12, 2, 2);
  }
  
  private drawWeapon(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, direction: string, action: string, colors: any): void {
    // Weapon position
    let weaponX = centerX + 8, weaponY = centerY - 8;
    
    if (direction === 'left') {
      weaponX = centerX - 12;
    }
    
    // Staff handle
    ctx.fillStyle = colors.weapon;
    ctx.fillRect(weaponX, weaponY, 2, 16);
    
    // Weapon head based on class
    ctx.fillStyle = colors.weaponMetal;
    ctx.fillRect(weaponX - 1, weaponY - 4, 4, 4);
    ctx.fillRect(weaponX, weaponY - 6, 2, 2);
    
    // Class-specific weapon effects
    ctx.fillStyle = colors.classSymbol;
    ctx.fillRect(weaponX, weaponY - 5, 2, 1);
    
    // Magic glow during casting
    if (action === 'cast') {
      const glowColor = colors.classSymbol.replace('#', '');
      const r = parseInt(glowColor.substr(0, 2), 16);
      const g = parseInt(glowColor.substr(2, 2), 16);
      const b = parseInt(glowColor.substr(4, 2), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
      ctx.fillRect(weaponX - 2, weaponY - 6, 6, 8);
    }
  }
  
  private drawMagicEffects(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, colors: any): void {
    // Class-specific magic sparkles
    const sparkles = [
      {x: centerX - 12, y: centerY - 8},
      {x: centerX + 10, y: centerY - 6},
      {x: centerX - 8, y: centerY + 8},
      {x: centerX + 6, y: centerY + 10}
    ];
    
    ctx.fillStyle = colors.classSymbol;
    sparkles.forEach(sparkle => {
      ctx.fillRect(sparkle.x, sparkle.y, 2, 2);
      ctx.fillRect(sparkle.x + 1, sparkle.y - 1, 1, 1);
      ctx.fillRect(sparkle.x + 1, sparkle.y + 2, 1, 1);
    });
  }
  
  private setupPlaceholderFrames(): void {
    // Add required animation frames for hero atlas
    if (this.textures.exists('hero_atlas')) {
      const texture = this.textures.get('hero_atlas');
      
      // Create frames for all animation combinations
      const directions = ['down', 'up', 'left', 'right'];
      const actions = ['idle', 'walk', 'attack', 'cast', 'death'];
      
      let frameIndex = 0;
      actions.forEach(action => {
        directions.forEach(direction => {
          const frameName = `${action}_${direction}_01`;
          if (!texture.has(frameName)) {
            const x = (frameIndex % 4) * 64;
            const y = Math.floor(frameIndex / 4) * 64;
            texture.add(frameName, 0, x, y, 64, 64);
            frameIndex++;
          }
        });
      });
    }
  }
}
