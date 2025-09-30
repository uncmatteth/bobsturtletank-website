/**
 * CleanMenuScene - Professional Menu with Rex UI
 * Class selection and settings using industry-standard UI
 */

import Phaser from 'phaser';
import { Howl } from 'howler';

export class CleanMenuScene extends Phaser.Scene {
  private howlerSounds!: Map<string, Howl>;
  private selectedClass: string = 'Shell Defender';
  private rexUI: any; // Rex UI plugin
  
  constructor() {
    super({ key: 'CleanMenuScene' });
  }
  
  create(): void {
    console.log('📋 CleanMenuScene: Professional Menu Interface');
    
    // Get Howler sounds
    this.howlerSounds = this.registry.get('howlerSounds');
    this.rexUI = (this as any).rexUI; // Access Rex UI plugin
    
    // Create professional background
    this.createBackground();
    
    // Create title
    this.createTitle();
    
    // Create class selection using Rex UI
    this.createClassSelection();
    
    // Create start button
    this.createStartButton();
    
    // Create settings panel
    this.createSettingsPanel();
    
    // Start menu music
    this.playMenuMusic();
    
    console.log('✅ CleanMenuScene: Menu interface ready');
  }
  
  /**
   * Create professional background
   */
  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Gradient background
    const bg = this.add.graphics();
    
    // Create gradient effect
    for (let i = 0; i < height; i++) {
      const alpha = 1 - (i / height) * 0.3;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 26, g: 26, b: 26, a: 255 },
        { r: 13, g: 52, g: 39, a: 255 },
        height,
        i
      );
      
      bg.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), alpha);
      bg.fillRect(0, i, width, 1);
    }
    
    // Add subtle texture overlay
    const particles = this.add.particles(0, 0, 'dust', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      scale: { min: 0.1, max: 0.3 },
      alpha: { min: 0.1, max: 0.3 },
      quantity: 2,
      frequency: 1000,
      lifespan: 5000
    });
    
    // Create particle texture if it doesn't exist
    if (!this.textures.exists('dust')) {
      this.createDustTexture();
    }
  }
  
  /**
   * Create dust particle texture
   */
  private createDustTexture(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('dust', 4, 4);
    graphics.destroy();
  }
  
  /**
   * Create professional title
   */
  private createTitle(): void {
    const { width } = this.cameras.main;
    
    // Main title with glow effect
    const titleText = this.add.text(width / 2, 150, '🐢 Bob The Turtle', {
      fontSize: '64px',
      color: '#00ff88',
      fontFamily: 'Arial Black',
      stroke: '#003322',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, 220, 'Hero Of Turtle Dungeon Depths', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Edition badge
    this.add.text(width / 2, 260, 'Industry-Standard Edition', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Add glow animation to title
    this.tweens.add({
      targets: titleText,
      alpha: { from: 1, to: 0.7 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * Create class selection using Rex UI
   */
  private createClassSelection(): void {
    const { width, height } = this.cameras.main;
    
    // Class selection title
    this.add.text(width / 2, 320, 'Choose Your Shell Class', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Shell classes data
    const shellClasses = [
      {
        name: 'Shell Defender',
        description: 'Tanky turtle with high defense and protective abilities',
        icon: '🛡️',
        stats: { HP: 100, ATK: 60, DEF: 90, SPD: 40 }
      },
      {
        name: 'Swift Current', 
        description: 'Fast and agile with water-based attacks',
        icon: '💨',
        stats: { HP: 70, ATK: 80, DEF: 50, SPD: 90 }
      },
      {
        name: 'Fire Belly',
        description: 'Powerful fire magic and area damage',
        icon: '🔥',
        stats: { HP: 80, ATK: 90, DEF: 60, SPD: 60 }
      }
    ];
    
    // Create class selection cards using Rex UI
    const classCards: any[] = [];
    
    shellClasses.forEach((shellClass, index) => {
      const x = width / 2 + (index - 1) * 250;
      const y = height / 2;
      
      // Create card using Rex UI RoundRectangle
      const card = this.rexUI.add.roundRectangle(x, y, 200, 180, 10, 0x2a2a2a)
        .setStrokeStyle(2, this.selectedClass === shellClass.name ? 0x00ff88 : 0x666666)
        .setInteractive()
        .on('pointerdown', () => this.selectClass(shellClass.name, card, classCards))
        .on('pointerover', () => {
          if (this.selectedClass !== shellClass.name) {
            card.setStrokeStyle(2, 0x888888);
          }
        })
        .on('pointerout', () => {
          if (this.selectedClass !== shellClass.name) {
            card.setStrokeStyle(2, 0x666666);
          }
        });
      
      // Class icon
      this.add.text(x, y - 60, shellClass.icon, {
        fontSize: '32px'
      }).setOrigin(0.5);
      
      // Class name
      this.add.text(x, y - 20, shellClass.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // Stats display
      const statsText = `HP: ${shellClass.stats.HP}  ATK: ${shellClass.stats.ATK}\\nDEF: ${shellClass.stats.DEF}  SPD: ${shellClass.stats.SPD}`;
      this.add.text(x, y + 20, statsText, {
        fontSize: '12px',
        color: '#cccccc',
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
      
      // Description (smaller text)
      this.add.text(x, y + 60, shellClass.description, {
        fontSize: '10px',
        color: '#888888',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: 180 }
      }).setOrigin(0.5);
      
      classCards.push(card);
    });
    
    // Set default selection
    if (classCards.length > 0) {
      classCards[0].setStrokeStyle(2, 0x00ff88);
    }
  }
  
  /**
   * Select shell class
   */
  private selectClass(className: string, selectedCard: any, allCards: any[]): void {
    this.selectedClass = className;
    
    // Update visual feedback
    allCards.forEach(card => card.setStrokeStyle(2, 0x666666));
    selectedCard.setStrokeStyle(2, 0x00ff88);
    
    // Play selection sound
    const sound = this.howlerSounds.get('sword_hit');
    if (sound) {
      sound.volume(0.3);
      sound.play();
    }
    
    console.log(`🐢 Selected Shell Class: ${className}`);
  }
  
  /**
   * Create start game button
   */
  private createStartButton(): void {
    const { width, height } = this.cameras.main;
    
    // Create button using Rex UI
    const startButton = this.rexUI.add.roundRectangle(width / 2, height - 120, 200, 50, 10, 0x00ff88)
      .setStrokeStyle(2, 0x00cc66)
      .setInteractive()
      .on('pointerdown', () => this.startGame())
      .on('pointerover', () => {
        startButton.setFillStyle(0x00cc66);
        this.tweens.add({
          targets: startButton,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100
        });
      })
      .on('pointerout', () => {
        startButton.setFillStyle(0x00ff88);
        this.tweens.add({
          targets: startButton,
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
      });
    
    // Button text
    this.add.text(width / 2, height - 120, 'START ADVENTURE', {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
  
  /**
   * Create settings panel
   */
  private createSettingsPanel(): void {
    const { width, height } = this.cameras.main;
    
    // Settings button
    const settingsButton = this.add.text(width - 100, height - 40, '⚙️ Settings', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.openSettings())
    .on('pointerover', () => settingsButton.setColor('#ffffff'))
    .on('pointerout', () => settingsButton.setColor('#888888'));
  }
  
  /**
   * Start the game
   */
  private startGame(): void {
    console.log(`🚀 Starting game as ${this.selectedClass}`);
    
    // Store selected class
    this.registry.set('playerClass', this.selectedClass);
    
    // Stop menu music
    const menuMusic = this.howlerSounds.get('menu_music');
    if (menuMusic && menuMusic.playing()) {
      menuMusic.fade(1, 0, 1000);
    }
    
    // Play start sound
    const startSound = this.howlerSounds.get('level_up');
    if (startSound) {
      startSound.play();
    }
    
    // Transition to game
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start('CleanGameScene');
    });
  }
  
  /**
   * Open settings dialog
   */
  private openSettings(): void {
    console.log('⚙️ Opening settings...');
    
    // Create settings dialog using Rex UI
    const dialog = this.rexUI.add.dialog({
      x: this.cameras.main.centerX,
      y: this.cameras.main.centerY,
      width: 400,
      height: 300,
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x333333),
      title: this.add.text(0, 0, 'Settings', { fontSize: '20px', color: '#ffffff' }),
      content: this.createSettingsContent(),
      actions: [
        this.add.text(0, 0, 'Close', { fontSize: '16px', color: '#00ff88' })
      ]
    });
    
    dialog.on('button.click', () => {
      dialog.destroy();
    });
  }
  
  /**
   * Create settings content
   */
  private createSettingsContent(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    
    // Volume sliders would go here
    container.add(this.add.text(0, -50, 'Music Volume: 70%', {
      fontSize: '16px',
      color: '#ffffff'
    }));
    
    container.add(this.add.text(0, -20, 'SFX Volume: 80%', {
      fontSize: '16px', 
      color: '#ffffff'
    }));
    
    container.add(this.add.text(0, 10, 'Quality: High', {
      fontSize: '16px',
      color: '#ffffff'
    }));
    
    return container;
  }
  
  /**
   * Play menu music
   */
  private playMenuMusic(): void {
    const menuMusic = this.howlerSounds.get('menu_music');
    if (menuMusic && !menuMusic.playing()) {
      menuMusic.volume(0.6);
      menuMusic.play();
      console.log('🎵 Menu music started');
    }
  }
}
