/**
 * RoguelikeScene - Main Phaser scene that integrates the roguelike engine
 * Combines Phaser's rendering with our custom roguelike systems
 */

import Phaser from 'phaser';
import { Engine } from '../roguelike/Engine';

export class RoguelikeScene extends Phaser.Scene {
  private roguelikeEngine!: Engine;
  private tileSize: number = 16;
  private mapWidth: number = 80;
  private mapHeight: number = 40;
  private cameraOffsetX: number = 0;
  private cameraOffsetY: number = 0;
  private spriteGroups: { [key: string]: Phaser.GameObjects.Group } = {};
  private tileSprites: Phaser.GameObjects.Sprite[][] = [];
  private entitySprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private uiContainer!: Phaser.GameObjects.Container;
  private healthBar!: Phaser.GameObjects.Graphics;
  private experienceBar!: Phaser.GameObjects.Graphics;
  private messageText!: Phaser.GameObjects.Text;
  private messageLog: string[] = [];
  private inventoryPanel!: Phaser.GameObjects.Container;
  private characterPanel!: Phaser.GameObjects.Container;
  private isInventoryOpen: boolean = false;
  private isCharacterSheetOpen: boolean = false;

  constructor() {
    super({ key: 'RoguelikeScene' });
  }

  create(): void {
    console.log('🎮 RoguelikeScene: Starting roguelike game...');

    // Initialize the roguelike engine
    this.initializeEngine();

    // Set up the visual display
    this.setupDisplay();

    // Set up UI
    this.setupUI();

    // Set up input handling
    this.setupInput();

    // Set up camera
    this.setupCamera();

    // Set up event listeners
    this.setupEventListeners();

    // Initial display update
    this.updateDisplay();

    console.log('✅ RoguelikeScene: Initialization complete');
  }

  /**
   * Initialize the roguelike engine
   */
  private initializeEngine(): void {
    // Temporarily disable the rot.js engine to avoid DOM conflicts
    console.log('🎮 Roguelike engine disabled to prevent DOM conflicts');
    console.log('🎮 Using pure Phaser implementation instead');
    
    // Don't create the rot.js engine at all for now
    // this.roguelikeEngine = new Engine('roguelike-container');
  }

  /**
   * Set up the visual display
   */
  private setupDisplay(): void {
    // Ensure the Phaser canvas is visible and properly positioned
    const gameCanvas = this.game.canvas;
    if (gameCanvas) {
      gameCanvas.style.position = 'relative';
      gameCanvas.style.zIndex = '100';
      gameCanvas.style.display = 'block';
      gameCanvas.style.visibility = 'visible';
      console.log('🎮 Canvas visibility set:', gameCanvas.style);
    }
    
    // Set camera background color
    this.cameras.main.setBackgroundColor(0x2c3e50);
    
    // Add a visible background rectangle
    const bg = this.add.rectangle(640, 360, 1280, 720, 0x34495e);
    bg.setDepth(-1000);
    
    // Add some test text to verify Phaser is working
    const titleText = this.add.text(640, 100, 'Bob The Turtle: Roguelike Adventure', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    titleText.setDepth(1000);
    
    const statusText = this.add.text(640, 150, 'Phaser Scene Active - Game Loading...', {
      fontSize: '20px',
      color: '#00ff88',
      align: 'center',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    statusText.setDepth(1000);
    
    // Add instructions
    const instructionText = this.add.text(640, 200, 'Press ARROW KEYS to move around', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    instructionText.setDepth(1000);
    
    // Add a test sprite to see if assets are loading
    try {
      const testSprite = this.add.sprite(640, 300, 'hero_south');
      testSprite.setScale(2);
      testSprite.setDepth(1000);
      console.log('✅ Test hero sprite created successfully');
    } catch (error) {
      console.warn('⚠️ Could not create hero sprite:', error);
      // Create a simple colored rectangle as fallback
      const fallbackHero = this.add.rectangle(640, 300, 64, 64, 0x00ff00);
      fallbackHero.setDepth(1000);
    }
    
    // Initialize tile sprites array
    this.tileSprites = [];
    for (let y = 0; y < this.mapHeight; y++) {
      this.tileSprites[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        const sprite = this.add.sprite(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          'stone_mossy_tileset_tile_0'
        );
        sprite.setDisplaySize(this.tileSize, this.tileSize);
        sprite.setVisible(false);
        this.tileSprites[y][x] = sprite;
      }
    }

    // Create sprite groups for different entity types
    this.spriteGroups.players = this.add.group();
    this.spriteGroups.enemies = this.add.group();
    this.spriteGroups.items = this.add.group();
    this.spriteGroups.effects = this.add.group();
  }

  /**
   * Set up UI elements
   */
  private setupUI(): void {
    // Create UI container
    this.uiContainer = this.add.container(0, 0);

    // Create health bar
    this.healthBar = this.add.graphics();
    this.healthBar.setPosition(10, 10);
    this.uiContainer.add(this.healthBar);

    // Create experience bar
    this.experienceBar = this.add.graphics();
    this.experienceBar.setPosition(10, 30);
    this.uiContainer.add(this.experienceBar);

    // Create message log
    this.messageText = this.add.text(10, this.scale.height - 150, '', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
      wordWrap: { width: 400 }
    });
    this.uiContainer.add(this.messageText);

    // Create inventory panel (initially hidden)
    this.createInventoryPanel();

    // Create character sheet panel (initially hidden)
    this.createCharacterPanel();

    // Set UI to fixed camera
    this.uiContainer.setScrollFactor(0);
  }

  /**
   * Create inventory panel
   */
  private createInventoryPanel(): void {
    this.inventoryPanel = this.add.container(this.scale.width / 2, this.scale.height / 2);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(-200, -150, 400, 300);
    bg.lineStyle(2, 0xffffff);
    bg.strokeRect(-200, -150, 400, 300);
    this.inventoryPanel.add(bg);

    // Title
    const title = this.add.text(0, -130, 'INVENTORY', {
      fontSize: '18px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    this.inventoryPanel.add(title);

    // Instructions
    const instructions = this.add.text(0, 120, 'Press I to close', {
      fontSize: '12px',
      color: '#cccccc'
    });
    instructions.setOrigin(0.5);
    this.inventoryPanel.add(instructions);

    this.inventoryPanel.setVisible(false);
    this.inventoryPanel.setScrollFactor(0);
  }

  /**
   * Create character sheet panel
   */
  private createCharacterPanel(): void {
    this.characterPanel = this.add.container(this.scale.width / 2, this.scale.height / 2);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(-250, -200, 500, 400);
    bg.lineStyle(2, 0xffffff);
    bg.strokeRect(-250, -200, 500, 400);
    this.characterPanel.add(bg);

    // Title
    const title = this.add.text(0, -180, 'CHARACTER SHEET', {
      fontSize: '18px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    this.characterPanel.add(title);

    // Instructions
    const instructions = this.add.text(0, 170, 'Press C to close', {
      fontSize: '12px',
      color: '#cccccc'
    });
    instructions.setOrigin(0.5);
    this.characterPanel.add(instructions);

    this.characterPanel.setVisible(false);
    this.characterPanel.setScrollFactor(0);
  }

  /**
   * Set up event listeners for the roguelike engine
   */
  private setupEventListeners(): void {
    // This would connect to the roguelike engine's event bus
    // For now, we'll set up some basic event handling

    this.events.on('player_moved', this.onPlayerMoved, this);
    this.events.on('entity_added', this.onEntityAdded, this);
    this.events.on('entity_removed', this.onEntityRemoved, this);
    this.events.on('message', this.onMessage, this);
    this.events.on('health_changed', this.onHealthChanged, this);
    this.events.on('experience_changed', this.onExperienceChanged, this);
  }

  /**
   * Set up input handling
   */
  private setupInput(): void {
    // Movement keys
    const cursors = this.input.keyboard!.createCursorKeys();
    const wasd = this.input.keyboard!.addKeys('W,S,A,D');
    const actions = this.input.keyboard!.addKeys('I,C,G,SPACE,ESC');

    // Handle input in update loop
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyInput(event.code);
    });
  }

  /**
   * Handle keyboard input
   */
  private handleKeyInput(keyCode: string): void {
    // Handle UI toggles first
    switch (keyCode) {
      case 'KeyI':
        this.toggleInventory();
        return;
      case 'KeyC':
        this.toggleCharacterSheet();
        return;
      case 'Escape':
        this.closeAllPanels();
        return;
    }

    // Don't process game input if UI panels are open
    if (this.isInventoryOpen || this.isCharacterSheetOpen) {
      return;
    }

    // Process game input
    let direction = '';

    switch (keyCode) {
      case 'KeyW':
      case 'ArrowUp':
        direction = 'north';
        break;
      case 'KeyS':
      case 'ArrowDown':
        direction = 'south';
        break;
      case 'KeyA':
      case 'ArrowLeft':
        direction = 'west';
        break;
      case 'KeyD':
      case 'ArrowRight':
        direction = 'east';
        break;
      case 'Space':
        // Wait/rest
        this.handlePlayerAction({ type: 'wait' });
        return;
      case 'KeyG':
        // Pick up item
        this.handlePlayerAction({ type: 'pickup' });
        return;
    }

    if (direction) {
      this.handlePlayerAction({ type: 'move', direction });
    }
  }

  /**
   * Handle player action
   */
  private handlePlayerAction(action: any): void {
    // This would send the action to the roguelike engine
    console.log('Player action:', action);

    // For now, just update the display
    this.updateDisplay();
  }

  /**
   * Set up camera
   */
  private setupCamera(): void {
    // Set camera bounds
    this.cameras.main.setBounds(
      0, 0,
      this.mapWidth * this.tileSize,
      this.mapHeight * this.tileSize
    );

    // Center camera on player (would need player position from engine)
    this.cameras.main.centerOn(
      this.mapWidth * this.tileSize / 2,
      this.mapHeight * this.tileSize / 2
    );
  }

  /**
   * Update the visual display
   */
  private updateDisplay(): void {
    this.updateMap();
    this.updateEntities();
    this.updateUI();
  }

  /**
   * Update map display
   */
  private updateMap(): void {
    // This would get map data from the roguelike engine
    // For now, show some basic tiles

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const sprite = this.tileSprites[y][x];

        // Use different tiles based on position (placeholder logic)
        if (x === 0 || y === 0 || x === this.mapWidth - 1 || y === this.mapHeight - 1) {
          // Walls around the edge
          sprite.setTexture('stone_mossy_tileset_tile_1');
        } else {
          // Floor tiles
          sprite.setTexture('stone_mossy_tileset_tile_0');
        }

        sprite.setVisible(true);
      }
    }
  }

  /**
   * Update entity display
   */
  private updateEntities(): void {
    // This would get entity data from the roguelike engine
    // For now, just show the player

    const playerSprite = this.entitySprites.get('player');
    if (!playerSprite) {
      // Create player sprite
      const sprite = this.add.sprite(
        this.mapWidth * this.tileSize / 2,
        this.mapHeight * this.tileSize / 2,
        'hero_south'
      );
      sprite.setDisplaySize(this.tileSize, this.tileSize);
      this.entitySprites.set('player', sprite);

      // Make camera follow player
      this.cameras.main.startFollow(sprite);
    }
  }

  /**
   * Update UI display
   */
  private updateUI(): void {
    this.updateHealthBar();
    this.updateExperienceBar();
    this.updateMessageLog();
  }

  /**
   * Update health bar
   */
  private updateHealthBar(): void {
    this.healthBar.clear();

    // Background
    this.healthBar.fillStyle(0x660000);
    this.healthBar.fillRect(0, 0, 200, 15);

    // Health (placeholder values)
    const healthPercent = 0.8; // Would get from player
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(0, 0, 200 * healthPercent, 15);

    // Border
    this.healthBar.lineStyle(1, 0xffffff);
    this.healthBar.strokeRect(0, 0, 200, 15);
  }

  /**
   * Update experience bar
   */
  private updateExperienceBar(): void {
    this.experienceBar.clear();

    // Background
    this.experienceBar.fillStyle(0x000066);
    this.experienceBar.fillRect(0, 0, 200, 10);

    // Experience (placeholder values)
    const expPercent = 0.6; // Would get from player
    this.experienceBar.fillStyle(0x0000ff);
    this.experienceBar.fillRect(0, 0, 200 * expPercent, 10);

    // Border
    this.experienceBar.lineStyle(1, 0xffffff);
    this.experienceBar.strokeRect(0, 0, 200, 10);
  }

  /**
   * Update message log
   */
  private updateMessageLog(): void {
    const displayMessages = this.messageLog.slice(-5); // Show last 5 messages
    this.messageText.setText(displayMessages.join('\n'));
  }

  /**
   * Toggle inventory panel
   */
  private toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryPanel.setVisible(this.isInventoryOpen);

    if (this.isInventoryOpen) {
      this.updateInventoryDisplay();
    }
  }

  /**
   * Toggle character sheet panel
   */
  private toggleCharacterSheet(): void {
    this.isCharacterSheetOpen = !this.isCharacterSheetOpen;
    this.characterPanel.setVisible(this.isCharacterSheetOpen);

    if (this.isCharacterSheetOpen) {
      this.updateCharacterSheetDisplay();
    }
  }

  /**
   * Close all panels
   */
  private closeAllPanels(): void {
    this.isInventoryOpen = false;
    this.isCharacterSheetOpen = false;
    this.inventoryPanel.setVisible(false);
    this.characterPanel.setVisible(false);
  }

  /**
   * Update inventory display
   */
  private updateInventoryDisplay(): void {
    // This would get inventory data from the player
    // For now, just show placeholder text
  }

  /**
   * Update character sheet display
   */
  private updateCharacterSheetDisplay(): void {
    // This would get character data from the player
    // For now, just show placeholder text
  }

  /**
   * Event handlers
   */
  private onPlayerMoved(data: any): void {
    const playerSprite = this.entitySprites.get('player');
    if (playerSprite) {
      playerSprite.setPosition(
        data.position.x * this.tileSize,
        data.position.y * this.tileSize
      );
    }
  }

  private onEntityAdded(data: any): void {
    // Create sprite for new entity
    const entity = data.entity;
    const sprite = this.add.sprite(
      entity.getPosition().x * this.tileSize,
      entity.getPosition().y * this.tileSize,
      'enemy_south' // Would determine sprite based on entity type
    );
    sprite.setDisplaySize(this.tileSize, this.tileSize);
    this.entitySprites.set(entity.getId(), sprite);
  }

  private onEntityRemoved(data: any): void {
    // Remove sprite for entity
    const entity = data.entity;
    const sprite = this.entitySprites.get(entity.getId());
    if (sprite) {
      sprite.destroy();
      this.entitySprites.delete(entity.getId());
    }
  }

  private onMessage(data: any): void {
    this.messageLog.push(data.text);

    // Keep only last 20 messages
    if (this.messageLog.length > 20) {
      this.messageLog = this.messageLog.slice(-20);
    }

    this.updateMessageLog();
  }

  private onHealthChanged(data: any): void {
    this.updateHealthBar();
  }

  private onExperienceChanged(data: any): void {
    this.updateExperienceBar();
  }

  update(time: number, delta: number): void {
    // Update roguelike engine if needed
    // The engine handles its own game loop, so this might not be necessary
  }

  destroy(): void {
    // Clean up
    if (this.roguelikeEngine) {
      this.roguelikeEngine.stop();
    }

    super.destroy();
  }
}