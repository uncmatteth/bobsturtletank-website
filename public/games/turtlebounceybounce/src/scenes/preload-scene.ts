import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.createLoadingScreen();
    this.loadAssets();
    this.setupLoadingEvents();
  }

  create() {
    // All assets loaded, start the game
    this.scene.start('GameScene');
  }

  private createLoadingScreen() {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x87CEEB);
    
    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Bob The Turtle: Bouncey Food Delight Bounce...', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Progress bar background
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x222222);
    progressBg.fillRect(width / 2 - 200, height / 2, 400, 20);
    
    // Progress bar
    this.progressBar = this.add.graphics();
  }

  private loadAssets() {
    // Load turtle character
    this.load.image('turtle', 'assets/turtle.png');
    
    // Load platform images (food items)
    for (let i = 1; i <= 13; i++) {
      this.load.image(`platform${i}`, `assets/platforms/${i}.png`);
    }
    
    // Load background images
    for (let i = 1; i <= 10; i++) {
      this.load.image(`bg${i}`, `assets/backgrounds/bg${i}.png`);
    }
    
    // Load music files (simplified naming: 1.mp3 through 21.mp3)
    for (let i = 1; i <= 21; i++) {
      this.load.audio(`music${i-1}`, `assets/music/${i}.mp3`); // music0-20 maps to 1-21.mp3
    }
    
    // Load epic sound effects! (Create placeholder files or get real ones from free sources)
    // For now, we'll use fallbacks and provide instructions for getting real SFX
    // Load epic sound effects! 
    this.loadSoundEffects();
    console.log('🎵 Loading SFX - add files to public/assets/sfx/ or they will be skipped');
  }

  private setupLoadingEvents() {
    this.load.on('progress', (value: number) => {
      const { width, height } = this.cameras.main;
      
      // Update progress bar
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00FF00);
      this.progressBar.fillRect(width / 2 - 200, height / 2, 400 * value, 20);
      
      // Update loading text
      this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('Ready to bounce!');
      
      // Log loaded assets for debugging
      console.log('All assets loaded successfully!');
    });
  }

  private loadSoundEffects() {
    // Load SFX files with fallback handling
    const sfxFiles = [
      { key: 'bounce', file: 'bounce.mp3' },
      { key: 'death', file: 'death.mp3' },
      { key: 'newrecord', file: 'newrecord.mp3' },
      { key: 'milestone', file: 'milestone.mp3' },
      { key: 'combo', file: 'combo.mp3' }
    ];

    sfxFiles.forEach(sfx => {
      try {
        // Support mp3, wav, ogg fallbacks
        this.load.audio(sfx.key, [
          `assets/sfx/${sfx.file}`,
          `assets/sfx/${sfx.file.replace('.mp3','.wav')}`,
          `assets/sfx/${sfx.file.replace('.mp3','.ogg')}`
        ]);
      } catch (error) {
        console.warn(`SFX file ${sfx.file} not found - will use fallback`);
      }
    });

    // Add completion handler to show SFX instructions
    this.load.on('filecomplete', (key: string) => {
      if (sfxFiles.some(sfx => sfx.key === key)) {
        console.log(`✅ Loaded SFX: ${key}`);
      }
    });

    this.load.on('loaderror', (file: any) => {
      if (sfxFiles.some(sfx => sfx.key === file.key)) {
        console.warn(`❌ Missing SFX: ${file.key} - Add ${file.key}.mp3 to public/assets/sfx/ folder!`);
        console.warn(`📁 Expected path: public/assets/sfx/${file.key}.mp3`);
      }
    });

    // Add complete handler to check what loaded
    this.load.on('complete', () => {
      console.log('🎵 SFX LOADING COMPLETE! Checking what loaded...');
      sfxFiles.forEach(sfx => {
        if (this.cache.audio.exists(sfx.key)) {
          console.log(`✅ ${sfx.key}.mp3 - LOADED SUCCESSFULLY`);
        } else {
          console.warn(`❌ ${sfx.key}.mp3 - NOT FOUND - Add to public/assets/sfx/`);
        }
      });
      console.log('💡 For instant downloads: Check public/assets/sfx/QUICK_TEST_SOUNDS.md');
    });
  }
}
