/**
 * InstructionsScene - Game instructions and controls tutorial
 * Shows players how to play the game
 */

import Phaser from 'phaser';

export class InstructionsScene extends Phaser.Scene {
  private instructionsContainer!: Phaser.GameObjects.Container;
  private isVisible: boolean = false;

  constructor() {
    super({ key: 'InstructionsScene' });
  }

  create(): void {
    this.createInstructionsOverlay();
    this.setupControls();
    
    // Hide initially
    this.hideInstructions();
    
    // Listen for show instructions event
    this.events.on('showInstructions', this.showInstructions, this);
  }

  private createInstructionsOverlay(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create container for instructions
    this.instructionsContainer = this.add.container(0, 0);

    // Semi-transparent background
    const background = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    background.setOrigin(0);
    this.instructionsContainer.add(background);

    // Title
    const title = this.add.text(width / 2, 60, '🐢 BOB THE TURTLE', {
      fontSize: '36px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    this.instructionsContainer.add(title);

    const subtitle = this.add.text(width / 2, 100, 'Hero of Turtle Dungeon Depths', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.instructionsContainer.add(subtitle);

    // Instructions
    const instructions = [
      '🎮 HOW TO PLAY:',
      '',
      '⌨️  CONTROLS:',
      '    • Arrow Keys or WASD - Move Bob',
      '    • SPACE - Attack enemies',
      '    • I - Open Inventory (18 equipment slots)',
      '    • K - Open Skills Tree',
      '    • ESC - Pause / Settings',
      '',
      '🎯 OBJECTIVES:',
      '    • Explore procedural dungeons',
      '    • Defeat corrupted sea creatures',
      '    • Collect loot and equipment',
      '    • Level up and unlock abilities',
      '    • Survive as long as possible!',
      '',
      '💎 FEATURES:',
      '    • 3 Shell Classes with unique abilities',
      '    • 200+ weapons and armor pieces',
      '    • Procedural dungeon generation',
      '    • Boss fights every 10 floors',
      '    • Achievement system',
      '',
      '🏆 TIP: Your health refills between floors!',
      '',
      'Press H to show/hide this help',
      'Press ESC or click anywhere to close'
    ];

    let yPos = 150;
    instructions.forEach(line => {
      const color = line.startsWith('🎮') || line.startsWith('⌨️') || line.startsWith('🎯') || line.startsWith('💎') || line.startsWith('🏆') 
        ? '#00ff88' : '#ffffff';
      const fontSize = line.startsWith('🎮') || line.startsWith('⌨️') || line.startsWith('🎯') || line.startsWith('💎') 
        ? '20px' : '16px';
      
      const text = this.add.text(width / 2, yPos, line, {
        fontSize: fontSize,
        color: color,
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
      
      this.instructionsContainer.add(text);
      yPos += line === '' ? 10 : 25;
    });

    // Close button
    const closeButton = this.add.text(width - 40, 40, '✕', {
      fontSize: '24px',
      color: '#ff4444',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => this.hideInstructions());
    this.instructionsContainer.add(closeButton);

    // Make background clickable to close
    background.setInteractive();
    background.on('pointerdown', () => this.hideInstructions());

    // Set depth to appear on top
    this.instructionsContainer.setDepth(10000);
  }

  private setupControls(): void {
    // ESC key to toggle
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.on('down', () => this.hideInstructions());

    // H key to toggle help
    const hKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    hKey?.on('down', () => this.toggleInstructions());
  }

  public showInstructions(): void {
    this.isVisible = true;
    this.instructionsContainer.setVisible(true);
    this.scene.pause('GameScene'); // Pause the game
  }

  public hideInstructions(): void {
    this.isVisible = false;
    this.instructionsContainer.setVisible(false);
    this.scene.resume('GameScene'); // Resume the game
  }

  public toggleInstructions(): void {
    if (this.isVisible) {
      this.hideInstructions();
    } else {
      this.showInstructions();
    }
  }
}
