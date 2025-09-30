/**
 * CleanGameScene - Industry-Standard Roguelike Game
 * 
 * Uses:
 * - rot.js for dungeon generation and FOV
 * - Matter.js for advanced physics
 * - EasyStar.js for pathfinding AI
 * - Howler.js for spatial audio
 * - Rex UI for professional interface
 * - Zustand for state management
 * - LocalForage for save/load
 * - Math.js for RPG calculations
 * - Lodash for utilities
 */

import Phaser from 'phaser';
import * as ROT from 'rot-js';
import { Howl } from 'howler';
import * as EasyStar from 'easystarjs';
import { useGameStore } from '../stores/gameStore';
import { InventorySystem } from '../systems/inventorySystem';
import { EquipmentSystem } from '../systems/EquipmentSystem';
import { ProgressionSystem } from '../systems/progressionSystem';
import { SimpleBossSystem } from '../systems/simpleBossSystem';
import { RPGCalculations } from '../systems/rpgCalculations';
import _ from 'lodash';

interface TileData {
  type: 'floor' | 'wall' | 'door' | 'stairs';
  walkable: boolean;
  x: number;
  y: number;
  sprite?: Phaser.GameObjects.Sprite;
}

interface Entity {
  id: string;
  type: 'hero' | 'enemy' | 'item' | 'effect';
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Sprite;
  body?: MatterJS.BodyType;
  health?: number;
  maxHealth?: number;
  speed?: number; // Movement/action speed for rot.js scheduler
  isBoss?: boolean; // Boss entity flag
  bossData?: any; // Boss specific data
  ai?: {
    pathfinder: any;
    target: { x: number, y: number } | null;
    state: 'idle' | 'chasing' | 'attacking' | 'fleeing';
  };
  
  // Required by rot.js scheduler
  getSpeed(): number;
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'potion' | 'weapon' | 'armor' | 'treasure' | 'consumable';
  description: string;
  spriteKey: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export class CleanGameScene extends Phaser.Scene {
  // Core systems
  private howlerSounds!: Map<string, Howl>;
  private rexUI: any;
  
  // rot.js systems
  private rotMap!: ROT.Map.Digger;
  private rotFOV!: ROT.FOV.PreciseShadowcasting;
  private rotScheduler!: ROT.Scheduler.Speed;
  private rotEngine!: ROT.Engine;
  
  // EasyStar pathfinding
  private pathfinder!: EasyStar.js;
  
  // Industry-Standard RPG Systems
  private gameStore: any;
  private inventorySystem!: InventorySystem;
  private equipmentSystem!: EquipmentSystem;
  private progressionSystem!: ProgressionSystem;
  private bossSystem!: SimpleBossSystem;
  
  // Game state
  private mapWidth: number = 80;
  private mapHeight: number = 50;
  private tileSize: number = 32;
  private tiles: TileData[][] = [];
  private entities: Map<string, Entity> = new Map();
  private hero!: Entity;
  private playerTurn: boolean = true;
  
  // Visuals
  private tileGroup!: Phaser.GameObjects.Group;
  private entityGroup!: Phaser.GameObjects.Group;
  private uiGroup!: Phaser.GameObjects.Group;
  private fogOfWar: boolean[][] = [];
  private exploredTiles: boolean[][] = [];
  
  // Performance
  private visibleTiles: Set<string> = new Set();
  private lastFOVUpdate: number = 0;
  
  constructor() {
    super({ key: 'CleanGameScene' });
  }
  
  create(): void {
    console.log('🏰 CleanGameScene: Starting legendary roguelike adventure!');
    
    // Initialize core systems
    this.initializeSystems();
    
    // Initialize industry-standard RPG systems
    this.initializeRPGSystems();
    
    // Generate dungeon with rot.js
    this.generateDungeon();
    
    // Create hero
    this.createHero();
    
    // Setup pathfinding with EasyStar
    this.setupPathfinding();
    
    // Setup FOV with rot.js
    this.setupFieldOfView();
    
    // Create professional UI
    this.createUI();
    
    // Setup input handling
    this.setupInput();
    
    // Start game loop
    this.startGameLoop();
    
    // Try to load saved game
    this.loadGameOnStart();
    
    console.log('✅ CleanGameScene: Legendary adventure ready!');
  }
  
  update(time: number, delta: number): void {
    // Update FOV periodically
    if (time - this.lastFOVUpdate > 100) {
      this.updateFieldOfView();
      this.lastFOVUpdate = time;
    }
    
    // Update entity AI
    this.updateEntityAI(delta);
    
    // Update spatial audio positions
    this.updateSpatialAudio();
  }
  
  /**
   * Initialize industry-standard RPG systems
   */
  private initializeRPGSystems(): void {
    console.log('🎯 Initializing Industry-Standard RPG Systems...');
    
    // Get Zustand store instance
    this.gameStore = useGameStore.getState();
    
    // Initialize inventory system with Rex UI
    this.inventorySystem = new InventorySystem(this);
    
    // Initialize equipment system with Rex UI
    this.equipmentSystem = new EquipmentSystem(this);
    
    // Initialize progression system with achievements
    this.progressionSystem = new ProgressionSystem(this);
    
    // Initialize boss system for victory conditions
    this.bossSystem = new SimpleBossSystem(this);
    
    console.log('✅ RPG Systems initialized');
  }
  
  /**
   * Initialize all core systems
   */
  private initializeSystems(): void {
    console.log('⚙️ Initializing industry-standard systems...');
    
    // Get systems from registry
    this.howlerSounds = this.registry.get('howlerSounds');
    this.rexUI = (this as any).rexUI;
    
    // Initialize rot.js scheduler and engine
    this.rotScheduler = new ROT.Scheduler.Speed();
    this.rotEngine = new ROT.Engine(this.rotScheduler);
    
    // Initialize EasyStar pathfinder
    this.pathfinder = new EasyStar.js();
    this.pathfinder.enableSync();
    
    // Create game groups
    this.tileGroup = this.add.group();
    this.entityGroup = this.add.group();
    this.uiGroup = this.add.group();
    
    // Initialize fog of war arrays
    this.fogOfWar = Array(this.mapHeight).fill(null).map(() => Array(this.mapWidth).fill(true));
    this.exploredTiles = Array(this.mapHeight).fill(null).map(() => Array(this.mapWidth).fill(false));
    
    console.log('✅ All systems initialized');
  }
  
  /**
   * Generate dungeon using rot.js
   */
  private generateDungeon(): void {
    console.log('🗺️ Generating dungeon with rot.js...');
    
    // Create rot.js dungeon generator
    this.rotMap = new ROT.Map.Digger(this.mapWidth, this.mapHeight, {
      roomWidth: [5, 12],
      roomHeight: [5, 10],
      corridorLength: [2, 8],
      dugPercentage: 0.3,
      timeLimit: 10000
    });
    
    // Initialize tile array
    this.tiles = Array(this.mapHeight).fill(null).map(() => 
      Array(this.mapWidth).fill(null).map(() => ({
        type: 'wall' as const,
        walkable: false,
        x: 0,
        y: 0
      }))
    );
    
    // Generate the map
    this.rotMap.create((x, y, value) => {
      if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
        this.tiles[y][x] = {
          type: value === 0 ? 'floor' : 'wall',
          walkable: value === 0,
          x,
          y
        };
      }
    });
    
    // Create visual tiles
    this.createTileVisuals();
    
    // Add special features
    this.addSpecialFeatures();
    
    console.log('✅ Dungeon generated with rot.js');
  }
  
  /**
   * Create visual representation of tiles
   */
  private createTileVisuals(): void {
    const tilesetName = this.selectRandomTileset();
    const tileset = this.cache.json.get(tilesetName);
    
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = this.tiles[y][x];
        const screenX = x * this.tileSize;
        const screenY = y * this.tileSize;
        
        // Create tile sprite
        const sprite = this.add.sprite(screenX, screenY, this.getTileTexture(tile.type, tileset))
          .setOrigin(0, 0)
          .setVisible(false); // Hidden by fog of war initially
        
        tile.sprite = sprite;
        this.tileGroup.add(sprite);
      }
    }
  }
  
  /**
   * Select random tileset for variety
   */
  private selectRandomTileset(): string {
    const tilesets = ['stone_mossy_tileset', 'dirt_cave_tileset', 'marble_ornate_tileset'];
    return tilesets[Math.floor(Math.random() * tilesets.length)];
  }
  
  /**
   * Get appropriate texture for tile type
   */
  private getTileTexture(type: string, tileset: any): string {
    // Use PixelLab tileset data to select appropriate texture
    // This would map to the actual tileset structure
    return type === 'floor' ? 'floor_tile' : 'wall_tile';
  }
  
  /**
   * Add special dungeon features
   */
  private addSpecialFeatures(): void {
    const rooms = this.rotMap.getRooms();
    
    if (rooms.length > 0) {
      // Add stairs in the last room
      const lastRoom = rooms[rooms.length - 1];
      const roomWidth = lastRoom.getRight() - lastRoom.getLeft() + 1;
      const roomHeight = lastRoom.getBottom() - lastRoom.getTop() + 1;
      const stairX = lastRoom.getLeft() + Math.floor(roomWidth / 2);
      const stairY = lastRoom.getTop() + Math.floor(roomHeight / 2);
      
      if (this.isValidPosition(stairX, stairY)) {
        this.tiles[stairY][stairX].type = 'stairs';
        
        // Create stairs entity
        this.createEntity('stairs', 'item', stairX, stairY, 'stairs_down_south');
      }
      
      // Add enemies to rooms
      rooms.forEach((room, index) => {
        if (index === 0) return; // Skip first room (player spawn)
        
        const enemyCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < enemyCount; i++) {
          const roomWidth = room.getRight() - room.getLeft() + 1;
          const roomHeight = room.getBottom() - room.getTop() + 1;
          const enemyX = room.getLeft() + 1 + Math.floor(Math.random() * (roomWidth - 2));
          const enemyY = room.getTop() + 1 + Math.floor(Math.random() * (roomHeight - 2));
          
          if (this.isValidPosition(enemyX, enemyY) && this.tiles[enemyY][enemyX].walkable) {
            const enemyType = this.selectRandomEnemy();
            this.createEnemy(enemyX, enemyY, enemyType);
          }
        }
      });
      
      // Add items to rooms
      rooms.forEach((room, index) => {
        if (Math.random() < 0.7) { // 70% chance for item
          const roomWidth = room.getRight() - room.getLeft() + 1;
          const roomHeight = room.getBottom() - room.getTop() + 1;
          const itemX = room.getLeft() + 1 + Math.floor(Math.random() * (roomWidth - 2));
          const itemY = room.getTop() + 1 + Math.floor(Math.random() * (roomHeight - 2));
          
          if (this.isValidPosition(itemX, itemY) && this.tiles[itemY][itemX].walkable) {
            const itemType = Math.random() < 0.5 ? 'health_potion' : 'treasure_chest';
            this.createEntity('item_' + Math.random(), 'item', itemX, itemY, itemType + '_south');
          }
        }
      });
    }
  }
  
  /**
   * Create the hero character
   */
  private createHero(): void {
    console.log('🐢 Creating hero...');
    
    // Find spawn position (first room)
    const rooms = this.rotMap.getRooms();
    let heroX = Math.floor(this.mapWidth / 2);
    let heroY = Math.floor(this.mapHeight / 2);
    
    if (rooms.length > 0) {
      const firstRoom = rooms[0];
      const roomWidth = firstRoom.getRight() - firstRoom.getLeft() + 1;
      const roomHeight = firstRoom.getBottom() - firstRoom.getTop() + 1;
      heroX = firstRoom.getLeft() + Math.floor(roomWidth / 2);
      heroY = firstRoom.getTop() + Math.floor(roomHeight / 2);
    }
    
    // Create hero entity (using PixelLab green turtle sprite)
    this.hero = this.createEntity('hero', 'hero', heroX, heroY, 'green_turtle_south');
    this.hero.health = 100;
    this.hero.maxHealth = 100;
    
    // Add hero to scheduler
    this.rotScheduler.add(this.hero, true);
    
    // Setup camera to follow hero
    this.cameras.main.startFollow(this.hero.sprite);
    this.cameras.main.setLerp(0.1, 0.1);
    
    console.log(`✅ Hero created at (${heroX}, ${heroY})`);
  }
  
  /**
   * Create an entity with Matter.js physics
   */
  private createEntity(id: string, type: Entity['type'], x: number, y: number, spriteKey: string): Entity {
    const screenX = x * this.tileSize + this.tileSize / 2;
    const screenY = y * this.tileSize + this.tileSize / 2;
    
    // Create sprite with Matter.js physics - proper API
    const sprite = this.matter.add.sprite(screenX, screenY, spriteKey, undefined, {
      isSensor: type === 'item' || type === 'effect',
      frictionStatic: 0,
      friction: 0,
      frictionAir: 0.01,
      inertia: Infinity, // Prevent rotation
      shape: {
        type: 'rectangle',
        width: this.tileSize * 0.8,
        height: this.tileSize * 0.8
      }
    }).setOrigin(0.5, 0.5);
    
    const entity: Entity = {
      id,
      type,
      x,
      y,
      sprite,
      body: sprite.body, // Matter.js body is attached to sprite
      speed: type === 'hero' ? 100 : type === 'enemy' ? 50 + Math.random() * 50 : 0,
      
      // Required by rot.js scheduler - returns speed for turn order
      getSpeed(): number {
        return this.speed || 50;
      }
    };
    
    this.entities.set(id, entity);
    this.entityGroup.add(sprite);
    
    return entity;
  }
  
  /**
   * Create enemy with AI
   */
  private createEnemy(x: number, y: number, enemyType: string): Entity {
    const enemy = this.createEntity(`enemy_${Math.random()}`, 'enemy', x, y, enemyType + '_south');
    
    // Setup AI
    enemy.ai = {
      pathfinder: this.pathfinder,
      target: null,
      state: 'idle'
    };
    
    enemy.health = 30 + Math.floor(Math.random() * 20);
    enemy.maxHealth = enemy.health;
    
    // Add to scheduler for turn-based behavior
    this.rotScheduler.add(enemy, false);
    
    return enemy;
  }
  
  /**
   * Select random enemy type
   */
  private selectRandomEnemy(): string {
    const enemies = ['red_goblin', 'skeleton_warrior', 'orc_brute'];
    if (this.currentFloor > 5) enemies.push('dark_wizard_boss');
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
  
  /**
   * Setup EasyStar pathfinding
   */
  private setupPathfinding(): void {
    console.log('🧭 Setting up EasyStar pathfinding...');
    
    // Convert tile map to pathfinding grid
    const grid = this.tiles.map(row => 
      row.map(tile => tile.walkable ? 0 : 1)
    );
    
    this.pathfinder.setGrid(grid);
    this.pathfinder.setAcceptableTiles([0]);
    this.pathfinder.enableDiagonals();
    this.pathfinder.disableCornerCutting();
    
    console.log('✅ EasyStar pathfinding ready');
  }
  
  /**
   * Setup Field of View with rot.js
   */
  private setupFieldOfView(): void {
    console.log('👁️ Setting up rot.js FOV...');
    
    // Create FOV calculator
    this.rotFOV = new ROT.FOV.PreciseShadowcasting((x, y) => {
      if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
        return false;
      }
      return this.tiles[y][x].walkable;
    });
    
    console.log('✅ rot.js FOV ready');
  }
  
  /**
   * Update field of view
   */
  private updateFieldOfView(): void {
    if (!this.hero) return;
    
    const visionRadius = 8;
    this.visibleTiles.clear();
    
    // Calculate visible tiles using rot.js
    this.rotFOV.compute(this.hero.x, this.hero.y, visionRadius, (x, y, r, visibility) => {
      if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
        this.visibleTiles.add(`${x},${y}`);
        this.fogOfWar[y][x] = false;
        this.exploredTiles[y][x] = true;
        
        // Show tile
        if (this.tiles[y][x].sprite) {
          this.tiles[y][x].sprite!.setVisible(true).setAlpha(1.0);
        }
      }
    });
    
    // Update tile visibility
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const key = `${x},${y}`;
        const tile = this.tiles[y][x];
        
        if (tile.sprite) {
          if (this.visibleTiles.has(key)) {
            // Fully visible
            tile.sprite.setVisible(true).setAlpha(1.0);
          } else if (this.exploredTiles[y][x]) {
            // Explored but not currently visible
            tile.sprite.setVisible(true).setAlpha(0.5);
          } else {
            // Not explored
            tile.sprite.setVisible(false);
          }
        }
      }
    }
    
    // Update entity visibility
    this.entities.forEach(entity => {
      const key = `${entity.x},${entity.y}`;
      if (entity !== this.hero) {
        entity.sprite.setVisible(this.visibleTiles.has(key));
      }
    });
  }
  
  /**
   * Update entity AI using EasyStar pathfinding
   */
  private updateEntityAI(delta: number): void {
    this.entities.forEach(entity => {
      if (entity.type === 'enemy' && entity.ai) {
        // Check if hero is visible
        const heroKey = `${this.hero.x},${this.hero.y}`;
        const entityKey = `${entity.x},${entity.y}`;
        
        if (this.visibleTiles.has(entityKey) && this.visibleTiles.has(heroKey)) {
          // Hero is visible - start chasing
          entity.ai.target = { x: this.hero.x, y: this.hero.y };
          entity.ai.state = 'chasing';
          
          // Calculate path using EasyStar
          this.pathfinder.findPath(entity.x, entity.y, this.hero.x, this.hero.y, (path) => {
            if (path && path.length > 1) {
              // Move one step along the path
              const nextStep = path[1];
              this.moveEntity(entity, nextStep.x, nextStep.y);
            }
          });
          this.pathfinder.calculate();
        }
      }
    });
  }
  
  /**
   * Update spatial audio positions
   */
  private updateSpatialAudio(): void {
    // Update listener position (hero)
    if (this.hero && Howler.ctx) {
      const heroScreenX = this.hero.x * this.tileSize;
      const heroScreenY = this.hero.y * this.tileSize;
      
      // Update Howler listener position
      Howler.pos(heroScreenX / 100, heroScreenY / 100, 0);
    }
  }
  
  /**
   * Create professional UI with Rex UI
   */
  private createUI(): void {
    console.log('🖼️ Creating professional UI...');
    
    // Health bar
    this.createHealthBar();
    
    // Minimap
    this.createMinimap();
    
    // Floor indicator
    this.createFloorIndicator();
    
    // Inventory button
    this.createInventoryButton();
    
    // Controls display
    this.createControlsDisplay();
    
    console.log('✅ Professional UI created');
  }
  
  /**
   * Create health bar UI
   */
  private createHealthBar(): void {
    const { width } = this.cameras.main;
    
    // Background
    const healthBg = this.rexUI.add.roundRectangle(100, 30, 200, 20, 5, 0x333333)
      .setStrokeStyle(2, 0x666666)
      .setScrollFactor(0);
    
    // Health bar
    const healthBar = this.rexUI.add.roundRectangle(100, 30, 196, 16, 3, 0x00ff00)
      .setScrollFactor(0);
    
    this.uiGroup.add(healthBg);
    this.uiGroup.add(healthBar);
    
    // Update health bar
    this.events.on('health-changed', (health: number, maxHealth: number) => {
      const percentage = health / maxHealth;
      const color = percentage > 0.6 ? 0x00ff00 : percentage > 0.3 ? 0xffff00 : 0xff0000;
      
      healthBar.setFillStyle(color);
      healthBar.setScale(percentage, 1);
    });
  }
  
  /**
   * Create minimap
   */
  private createMinimap(): void {
    const { width, height } = this.cameras.main;
    const minimapSize = 150;
    
    const minimap = this.add.renderTexture(width - minimapSize - 20, 20, minimapSize, minimapSize)
      .setScrollFactor(0);
    
    this.uiGroup.add(minimap);
    
    // Update minimap periodically
    this.time.addEvent({
      delay: 500,
      callback: () => this.updateMinimap(minimap),
      loop: true
    });
  }
  
  /**
   * Update minimap display
   */
  private updateMinimap(minimap: Phaser.GameObjects.RenderTexture): void {
    minimap.clear();
    
    const scale = 150 / this.mapWidth;
    
    // Draw explored areas
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (this.exploredTiles[y][x]) {
          const color = this.tiles[y][x].walkable ? 0x666666 : 0x333333;
          minimap.fill(color, x * scale, y * scale, scale, scale);
        }
      }
    }
    
    // Draw hero position
    if (this.hero) {
      minimap.fill(0x00ff88, this.hero.x * scale, this.hero.y * scale, scale * 2, scale * 2);
    }
    
    // Draw enemies
    this.entities.forEach(entity => {
      if (entity.type === 'enemy' && this.visibleTiles.has(`${entity.x},${entity.y}`)) {
        minimap.fill(0xff0000, entity.x * scale, entity.y * scale, scale, scale);
      }
    });
  }
  
  /**
   * Create floor indicator
   */
  private createFloorIndicator(): void {
    const floorText = this.add.text(20, 60, `Floor ${this.currentFloor}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0);
    
    this.uiGroup.add(floorText);
  }
  
  /**
   * Setup input handling with full RPG controls
   */
  private setupInput(): void {
    console.log('🎮 Setting up Industry-Standard RPG Controls...');
    
    // Movement controls
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      // Movement (only during player turn)
      if (this.playerTurn) {
        let dx = 0, dy = 0;
        
        switch (event.code) {
          case 'ArrowUp':
          case 'KeyW':
            dy = -1;
            break;
          case 'ArrowDown':
          case 'KeyS':
            dy = 1;
            break;
          case 'ArrowLeft':
          case 'KeyA':
            dx = -1;
            break;
          case 'ArrowRight':
          case 'KeyD':
            dx = 1;
            break;
        }
        
        if (dx !== 0 || dy !== 0) {
          this.moveHero(dx, dy);
          return;
        }
      }
      
      // UI Controls (available anytime)
      switch (event.code) {
        case 'KeyI':
          // Toggle Inventory
          useGameStore.getState().toggleInventory();
          break;
          
        case 'KeyC':
          // Toggle Character Stats
          useGameStore.getState().toggleStats();
          break;
          
        case 'Escape':
          // Toggle Settings/Pause
          useGameStore.getState().toggleSettings();
          break;
          
        case 'KeyH':
          // Use Health Potion (hotkey)
          this.useQuickItem('health_potion');
          break;
          
        case 'KeyM':
          // Use Mana Potion (hotkey)
          this.useQuickItem('mana_potion');
          break;
          
        case 'KeyQ':
          // Quick Save
          useGameStore.getState().saveGame();
          this.showNotification('💾 Game Saved!', 0x27ae60);
          break;
          
        case 'KeyL':
          // Quick Load (if save exists)
          this.quickLoadGame();
          break;
          
        case 'Space':
          // Skip Turn / Wait
          if (this.playerTurn) {
            this.endPlayerTurn();
          }
          break;
          
        case 'KeyG':
          // Get/Pickup items
          this.pickupNearbyItems();
          break;
          
        case 'KeyR':
          // Rest/Heal (if safe)
          this.attemptRest();
          break;
      }
    });
    
    console.log('✅ RPG Controls configured');
    this.showControlsHelp();
  }
  
  /**
   * Move hero character
   */
  private moveHero(dx: number, dy: number): void {
    const newX = this.hero.x + dx;
    const newY = this.hero.y + dy;
    
    if (this.canMoveTo(newX, newY)) {
      this.moveEntity(this.hero, newX, newY);
      
      // End player turn
      this.playerTurn = false;
      
      // Process NPC turns
      this.time.delayedCall(100, () => {
        this.processTurns();
      });
    }
  }
  
  /**
   * Check if position is valid for movement
   */
  private canMoveTo(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) return false;
    if (!this.tiles[y][x].walkable) return false;
    
    // Check for other entities
    for (const [id, entity] of this.entities) {
      if (entity !== this.hero && entity.x === x && entity.y === y && entity.type !== 'item') {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check if position is within map bounds
   */
  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
  }
  
  /**
   * Move entity to new position
   */
  private moveEntity(entity: Entity, newX: number, newY: number): void {
    entity.x = newX;
    entity.y = newY;
    
    const screenX = newX * this.tileSize + this.tileSize / 2;
    const screenY = newY * this.tileSize + this.tileSize / 2;
    
    // Smooth movement animation
    this.tweens.add({
      targets: entity.sprite,
      x: screenX,
      y: screenY,
      duration: 150,
      ease: 'Power2'
    });
    
    // Update Matter.js body position
    if (entity.body) {
      this.matter.body.setPosition(entity.body, { x: screenX, y: screenY });
    }
    
    // Check for interactions
    if (entity === this.hero) {
      this.checkHeroInteractions();
    }
  }
  
  /**
   * Check for hero interactions
   */
  private checkHeroInteractions(): void {
    // Check for items
    this.entities.forEach((entity, id) => {
      if (entity.type === 'item' && entity.x === this.hero.x && entity.y === this.hero.y) {
        this.collectItemToInventory(entity);
      }
    });
    
    // Check for stairs
    if (this.tiles[this.hero.y][this.hero.x].type === 'stairs') {
      this.descendFloor();
    }
    
    // Check for enemy combat
    this.entities.forEach((entity, id) => {
      if (entity.type === 'enemy' && entity.x === this.hero.x && entity.y === this.hero.y) {
        this.initiateCombat(this.hero, entity);
      }
    });
  }
  
  /**
   * Collect item
   */
  private collectItem(item: Entity): void {
    // Play collection sound
    const sound = this.howlerSounds.get('level_up');
    if (sound) {
      sound.volume(0.5);
      sound.play();
    }
    
    // Remove item
    item.sprite.destroy();
    this.entities.delete(item.id);
    
    console.log(`🎒 Collected item: ${item.id}`);
  }
  
  /**
   * Descend to next floor
   */
  private descendFloor(): void {
    this.currentFloor++;
    console.log(`⬇️ Descending to floor ${this.currentFloor}`);
    
    // Play descent sound
    const sound = this.howlerSounds.get('level_up');
    if (sound) {
      sound.play();
    }
    
    // Regenerate dungeon
    this.clearCurrentFloor();
    this.generateDungeon();
    this.createHero();
    this.setupPathfinding();
    
    // Update UI
    this.events.emit('floor-changed', this.currentFloor);
  }
  
  /**
   * Clear current floor
   */
  private clearCurrentFloor(): void {
    this.tileGroup.clear(true, true);
    this.entities.forEach(entity => entity.sprite.destroy());
    this.entities.clear();
    this.rotScheduler.clear();
  }
  
  /**
   * Process turns for all entities
   */
  private processTurns(): void {
    // This would integrate with rot.js engine for proper turn management
    // For now, simple turn processing
    this.playerTurn = true;
  }
  
  /**
   * Start the main game loop
   */
  private startGameLoop(): void {
    console.log('🔄 Starting game loop...');
    
    // Start background music
    const music = this.howlerSounds.get('exploration_music');
    if (music) {
      music.volume(0.4);
      music.play();
    }
    
    // Initial FOV update
    this.updateFieldOfView();
    
    console.log('✅ Game loop started');
  }
  
  // ========================================================================
  // INDUSTRY-STANDARD RPG FUNCTIONALITY
  // ========================================================================
  
  /**
   * Use quick item by name (health potion, mana potion, etc.)
   */
  private useQuickItem(itemName: string): void {
    const { inventory, useItem } = useGameStore.getState();
    const item = inventory.find(i => 
      i.name.toLowerCase().includes(itemName.replace('_', ' ')) && i.quantity > 0
    );
    
    if (item) {
      const success = useItem(item.id);
      if (success) {
        this.showNotification(`✨ Used ${item.name}`, 0x27ae60);
      }
    } else {
      this.showNotification(`❌ No ${itemName.replace('_', ' ')} available`, 0xe74c3c);
    }
  }
  
  /**
   * Show notification message
   */
  private showNotification(message: string, color: number = 0xffffff): void {
    const notification = this.add.text(
      this.cameras.main.centerX,
      50,
      message,
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
        padding: { x: 10, y: 5 }
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(3000);
    
    // Fade out after 2 seconds
    this.tweens.add({
      targets: notification,
      alpha: 0,
      y: 20,
      duration: 2000,
      ease: 'Power2.easeOut',
      onComplete: () => notification.destroy()
    });
  }
  
  /**
   * Quick load game
   */
  private async quickLoadGame(): Promise<void> {
    const success = await useGameStore.getState().loadGame();
    if (success) {
      this.showNotification('📁 Game Loaded!', 0x3498db);
      // Refresh the scene with loaded data
      this.scene.restart();
    } else {
      this.showNotification('❌ No save file found', 0xe74c3c);
    }
  }
  
  /**
   * Show controls help on first load
   */
  private showControlsHelp(): void {
    const controlsText = `🎮 CONTROLS:
WASD/Arrows - Move  •  I - Inventory  •  C - Stats  •  H - Health Potion
M - Mana Potion  •  G - Pickup  •  R - Rest  •  Space - Skip Turn
Q - Quick Save  •  L - Quick Load  •  ESC - Settings`;
    
    const helpPanel = this.add.text(10, 100, controlsText, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 10, y: 10 }
    })
    .setScrollFactor(0)
    .setDepth(4000);
    
    // Hide after 8 seconds
    this.time.delayedCall(8000, () => {
      this.tweens.add({
        targets: helpPanel,
        alpha: 0,
        duration: 1000,
        onComplete: () => helpPanel.destroy()
      });
    });
  }
  
  /**
   * Pickup nearby items
   */
  private pickupNearbyItems(): void {
    // Auto-collect items at hero position
    this.checkHeroInteractions();
  }
  
  /**
   * Attempt to rest and heal
   */
  private attemptRest(): void {
    const { hero } = useGameStore.getState();
    
    // Check if enemies are nearby
    const nearbyEnemies = Array.from(this.entities.values()).filter(entity =>
      entity.type === 'enemy' && 
      Math.abs(entity.x - this.hero.x) <= 5 && 
      Math.abs(entity.y - this.hero.y) <= 5
    );
    
    if (nearbyEnemies.length > 0) {
      this.showNotification('⚠️ Cannot rest - enemies nearby!', 0xe74c3c);
      return;
    }
    
    // Heal 10% of max HP and MP
    const healAmount = Math.floor(hero.maxHP * 0.1);
    const manaAmount = Math.floor(hero.maxMP * 0.1);
    
    useGameStore.getState().updateHeroStats({
      currentHP: Math.min(hero.maxHP, hero.currentHP + healAmount),
      currentMP: Math.min(hero.maxMP, hero.currentMP + manaAmount)
    });
    
    this.showNotification(`😴 Rested - Healed ${healAmount} HP, ${manaAmount} MP`, 0x27ae60);
    
    // End turn
    this.playerTurn = false;
    this.time.delayedCall(100, () => {
      this.playerTurn = true;
    });
  }
  
  /**
   * Load game on start if save exists
   */
  private async loadGameOnStart(): Promise<void> {
    const success = await useGameStore.getState().loadGame();
    if (success) {
      console.log('📁 Previous save loaded automatically');
    }
  }
  
  // ========================================================================
  // COMPLETE COMBAT SYSTEM
  // ========================================================================
  
  /**
   * Initiate combat between hero and enemy
   */
  private initiateCombat(attacker: Entity, defender: Entity): void {
    if (!this.playerTurn) return;
    
    // Use effective stats that include equipment bonuses for hero
    const attackerStats = attacker === this.hero ? useGameStore.getState().getEffectiveStats() : this.getEnemyStats(attacker);
    const defenderStats = defender === this.hero ? useGameStore.getState().getEffectiveStats() : this.getEnemyStats(defender);
    
    // Calculate damage using industry-standard RPG calculations
    const baseDamage = attackerStats.attack || 10;
    const damageResult = RPGCalculations.calculateDamage(
      baseDamage,
      attackerStats,
      defenderStats,
      'physical'
    );
    
    // Apply damage
    if (defender === this.hero) {
      this.damageHero(damageResult.finalDamage, damageResult);
    } else {
      this.damageEnemy(defender, damageResult.finalDamage, damageResult);
    }
    
    // Show combat feedback
    this.displayCombatResult(attacker, defender, damageResult);
    
    // End player turn if hero attacked
    if (attacker === this.hero) {
      this.endPlayerTurnAfterAction();
    }
  }
  
  /**
   * Get enemy stats for combat calculations
   */
  private getEnemyStats(enemy: Entity): any {
    const baseStats = {
      level: 1,
      attack: 8 + Math.floor(Math.random() * 6), // 8-13 attack
      defense: 5 + Math.floor(Math.random() * 4), // 5-8 defense
      speed: 8 + Math.floor(Math.random() * 4),   // 8-11 speed
      criticalRate: 2 + Math.floor(Math.random() * 3), // 2-4% crit
      criticalDamage: 140 + Math.floor(Math.random() * 20), // 140-160% crit damage
      fireResistance: 0,
      waterResistance: 0,
      earthResistance: 0
    };
    
    // Scale with floor level
    const floorBonus = Math.floor((useGameStore.getState().currentFloor - 1) * 0.2);
    
    return {
      ...baseStats,
      attack: baseStats.attack + floorBonus,
      defense: baseStats.defense + floorBonus,
      maxHP: 30 + (floorBonus * 5),
      currentHP: enemy.health || (30 + (floorBonus * 5))
    };
  }
  
  /**
   * Damage hero with full effects
   */
  private damageHero(damage: number, damageResult: any): void {
    const { hero, damageHero } = useGameStore.getState();
    
    // Apply damage to store
    damageHero(damage);
    
    // Visual effects
    this.showDamageNumber(
      this.hero.sprite.x,
      this.hero.sprite.y - 20,
      damage,
      damageResult.isCritical
    );
    
    this.flashSprite(this.hero.sprite, 0xff4444);
    
    // Check for death
    const updatedHero = useGameStore.getState().hero;
    if (updatedHero.currentHP <= 0) {
      this.handleHeroDeath();
    }
  }
  
  /**
   * Damage enemy with full effects
   */
  private damageEnemy(enemy: Entity, damage: number, damageResult: any): void {
    // Update enemy health
    enemy.health = (enemy.health || this.getEnemyStats(enemy).maxHP) - damage;
    
    // Visual effects
    this.showDamageNumber(
      enemy.sprite.x,
      enemy.sprite.y - 20,
      damage,
      damageResult.isCritical
    );
    
    this.flashSprite(enemy.sprite, 0xff4444);
    
    // Check for death
    if (enemy.health <= 0) {
      if (enemy.isBoss && enemy.bossData) {
        this.killBossWithRewards(enemy);
      } else {
        this.killEnemyWithRewards(enemy);
      }
    }
  }
  
  /**
   * Show floating damage numbers with effects
   */
  private showDamageNumber(x: number, y: number, damage: number, isCritical: boolean): void {
    const color = isCritical ? '#ff6b6b' : '#ffffff';
    const fontSize = isCritical ? '20px' : '16px';
    const text = isCritical ? `CRIT! -${damage}` : `-${damage}`;
    
    const damageText = this.add.text(x, y, text, {
      fontSize,
      color,
      fontStyle: isCritical ? 'bold' : 'normal',
      stroke: '#000000',
      strokeThickness: 2
    })
    .setOrigin(0.5)
    .setDepth(2000);
    
    // Animate damage number
    this.tweens.add({
      targets: damageText,
      y: y - 60,
      alpha: 0,
      scale: isCritical ? 1.5 : 1.2,
      duration: 2000,
      ease: 'Power2.easeOut',
      onComplete: () => damageText.destroy()
    });
  }
  
  /**
   * Flash sprite color for visual feedback
   */
  private flashSprite(sprite: Phaser.GameObjects.Sprite, color: number): void {
    sprite.setTint(color);
    this.time.delayedCall(100, () => {
      sprite.clearTint();
    });
  }
  
  /**
   * Display combat result message
   */
  private displayCombatResult(attacker: Entity, defender: Entity, damageResult: any): void {
    const attackerName = attacker === this.hero ? 'Hero' : 'Enemy';
    const defenderName = defender === this.hero ? 'Hero' : 'Enemy';
    
    let message = `${attackerName} deals ${damageResult.finalDamage} damage to ${defenderName}`;
    
    if (damageResult.isCritical) {
      message += ' - CRITICAL HIT!';
    }
    
    if (damageResult.isBlocked) {
      message += ' - BLOCKED!';
    }
    
    console.log(`⚔️ ${message}`);
    
    // Show brief combat message
    const combatText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 80,
      message,
      {
        fontSize: '14px',
        color: damageResult.isCritical ? '#ff6b6b' : '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 8, y: 4 }
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(2500);
    
    this.time.delayedCall(2000, () => {
      if (combatText.active) {
        this.tweens.add({
          targets: combatText,
          alpha: 0,
          duration: 500,
          onComplete: () => combatText.destroy()
        });
      }
    });
  }
  
  /**
   * Kill boss and give victory rewards
   */
  private killBossWithRewards(boss: Entity): void {
    if (!boss.bossData) return;
    
    const bossData = boss.bossData;
    
    // Award boss rewards through boss system
    this.bossSystem.defeatBoss(bossData.floor);
    
    // Visual effects for boss death
    this.createBossDeathEffect(boss.sprite.x, boss.sprite.y);
    
    // Show boss defeat notification  
    const { width, height } = this.scene.cameras.main;
    const defeatText = this.add.text(width / 2, height / 2 - 100,
      `🏆 ${bossData.name} DEFEATED! 🏆\nFloor ${bossData.floor} Conquered!`,
      {
        fontSize: '18px',
        color: '#ffff44',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(2500);
    
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: defeatText,
        alpha: 0,
        duration: 1000,
        onComplete: () => defeatText.destroy()
      });
    });
    
    // Remove boss
    boss.sprite.destroy();
    this.entities.delete(boss.id);
    
    console.log(`👑 Boss ${bossData.name} defeated!`);
  }
  
  /**
   * Kill enemy and give full rewards
   */
  private killEnemyWithRewards(enemy: Entity): void {
    const heroLevel = useGameStore.getState().hero.level;
    const enemyLevel = Math.max(1, Math.floor(useGameStore.getState().currentFloor / 3));
    
    // Calculate experience using RPG calculations
    const expCalc = RPGCalculations.calculateExperience(
      20 + (enemyLevel * 5), // Base XP scales with enemy level
      heroLevel,
      enemyLevel,
      {} // No equipment bonuses yet
    );
    
    // Give experience
    useGameStore.getState().addExperience(expCalc.totalExp);
    
    // Give gold
    const goldReward = 10 + Math.floor(Math.random() * 20) + (enemyLevel * 5);
    useGameStore.getState().updateHeroStats({
      gold: useGameStore.getState().hero.gold + goldReward
    });
    
    // Drop items (30% chance)
    if (Math.random() < 0.3) {
      this.dropLoot(enemy.x, enemy.y, enemyLevel);
    }
    
    // Update kill count
    const { hero } = useGameStore.getState();
    useGameStore.getState().updateHeroStats({
      totalKills: hero.totalKills + 1
    });
    
    // Visual effects
    this.createDeathEffect(enemy.sprite.x, enemy.sprite.y);
    
    // Show rewards
    this.showNotification(`💀 Enemy defeated! +${expCalc.totalExp} XP, +${goldReward} Gold`, 0xf39c12);
    
    // Remove enemy
    enemy.sprite.destroy();
    this.entities.delete(enemy.id);
    
    // Check for boss encounter on special floors
    const currentFloor = useGameStore.getState().currentFloor;
    if (this.bossSystem.hasBossOnFloor(currentFloor)) {
      this.triggerBossEncounter(currentFloor);
    }
  }
  
  /**
   * Drop loot at location based on enemy level
   */
  private dropLoot(x: number, y: number, enemyLevel: number): void {
    const lootTable = [
      {
        name: 'Health Potion',
        type: 'potion' as const,
        description: 'Restores 50 HP',
        spriteKey: 'health_potion_south',
        effects: { healHP: 50 },
        value: 25,
        weight: 40 // Higher weight = more common
      },
      {
        name: 'Mana Potion',
        type: 'potion' as const,
        description: 'Restores 30 MP',
        spriteKey: 'mana_potion_south',
        effects: { healMP: 30 },
        value: 20,
        weight: 30
      },
      {
        name: 'Rusty Sword',
        type: 'weapon' as const,
        description: 'A worn but functional blade',
        spriteKey: 'treasure_chest_south',
        effects: { attack: 3 + enemyLevel },
        slot: 'weapon',
        value: 50 + (enemyLevel * 20),
        weight: 15
      },
      {
        name: 'Leather Armor',
        type: 'armor' as const,
        description: 'Basic protective gear',
        spriteKey: 'treasure_chest_south',
        effects: { defense: 2 + enemyLevel },
        slot: 'armor',
        value: 40 + (enemyLevel * 15),
        weight: 10
      },
      {
        name: 'Magic Ring',
        type: 'accessory' as const,
        description: 'Enhances magical abilities',
        spriteKey: 'treasure_chest_south',
        effects: { criticalRate: 2, criticalDamage: 10 },
        slot: 'accessory1',
        value: 100 + (enemyLevel * 30),
        weight: 5
      }
    ];
    
    // Select item based on weighted random
    const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedItem;
    for (const item of lootTable) {
      random -= item.weight;
      if (random <= 0) {
        selectedItem = item;
        break;
      }
    }
    
    if (selectedItem) {
      // Determine rarity based on enemy level
      let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common';
      const rarityRoll = Math.random() + (enemyLevel * 0.1);
      
      if (rarityRoll > 0.9) rarity = 'legendary';
      else if (rarityRoll > 0.75) rarity = 'epic';
      else if (rarityRoll > 0.5) rarity = 'rare';
      else if (rarityRoll > 0.3) rarity = 'uncommon';
      
      // Add to inventory
      useGameStore.getState().addItem({
        ...selectedItem,
        quantity: 1,
        rarity,
        stackable: selectedItem.type === 'potion',
        tradeable: true
      });
      
      this.showNotification(`🎁 Found: ${selectedItem.name} (${rarity})`, this.getRarityColor(rarity));
    }
  }
  
  /**
   * Get color for rarity notifications
   */
  private getRarityColor(rarity: string): number {
    const colors: Record<string, number> = {
      'common': 0x95a5a6,
      'uncommon': 0x27ae60,
      'rare': 0x3498db,
      'epic': 0x9b59b6,
      'legendary': 0xf39c12
    };
    return colors[rarity] || colors.common;
  }
  
  /**
   * Create boss death visual effect
   */
  private createBossDeathEffect(x: number, y: number): void {
    // Create enhanced particle effect for boss death
    const particles = this.add.particles(x, y, 'health_potion_south', {
      speed: { min: 50, max: 120 },
      lifespan: 1200,
      quantity: 20,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xff6600, 0xffaa00, 0xffdd00] // Orange/yellow explosion
    });
    
    this.time.delayedCall(2000, () => {
      particles.destroy();
    });
  }
  
  /**
   * Create death visual effect
   */
  private createDeathEffect(x: number, y: number): void {
    // Create particle effect
    const particles = this.add.particles(x, y, 'health_potion_south', {
      speed: { min: 20, max: 60 },
      lifespan: 600,
      quantity: 8,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 }
    });
    
    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }
  
  /**
   * Handle hero death
   */
  private handleHeroDeath(): void {
    this.showNotification('💀 You have died! Press R to respawn.', 0xe74c3c);
    
    // Update death count
    const { hero } = useGameStore.getState();
    useGameStore.getState().updateHeroStats({
      deathCount: hero.deathCount + 1
    });
    
    // Disable input temporarily
    this.playerTurn = false;
    
    // Respawn after delay
    this.time.delayedCall(3000, () => {
      this.respawnHero();
    });
  }
  
  /**
   * Respawn hero at start of level
   */
  private respawnHero(): void {
    // Find starting position (first room)
    const rooms = this.rotMap.getRooms();
    let spawnX = Math.floor(this.mapWidth / 2);
    let spawnY = Math.floor(this.mapHeight / 2);
    
    if (rooms.length > 0) {
      const firstRoom = rooms[0];
      const roomWidth = firstRoom.getRight() - firstRoom.getLeft() + 1;
      const roomHeight = firstRoom.getBottom() - firstRoom.getTop() + 1;
      spawnX = firstRoom.getLeft() + Math.floor(roomWidth / 2);
      spawnY = firstRoom.getTop() + Math.floor(roomHeight / 2);
    }
    
    // Move hero to spawn position
    this.moveEntityToPosition(this.hero, spawnX, spawnY);
    
    // Restore some health
    const { hero } = useGameStore.getState();
    useGameStore.getState().updateHeroStats({
      currentHP: Math.floor(hero.maxHP * 0.5), // 50% health on respawn
      currentMP: Math.floor(hero.maxMP * 0.5)  // 50% mana on respawn
    });
    
    // Re-enable input
    this.playerTurn = true;
    
    this.showNotification('✨ You have been revived!', 0x27ae60);
  }
  
  /**
   * Move entity to specific position
   */
  private moveEntityToPosition(entity: Entity, x: number, y: number): void {
    entity.x = x;
    entity.y = y;
    
    const screenX = x * this.tileSize + this.tileSize / 2;
    const screenY = y * this.tileSize + this.tileSize / 2;
    
    entity.sprite.setPosition(screenX, screenY);
    
    // Update Matter.js body position if it exists
    if (entity.body) {
      this.matter.body.setPosition(entity.body, { x: screenX, y: screenY });
    }
  }
  
  /**
   * End player turn after action
   */
  private endPlayerTurnAfterAction(): void {
    this.playerTurn = false;
    
    // Auto-save periodically
    useGameStore.getState().autoSave();
    
    // Process enemy AI after short delay
    this.time.delayedCall(400, () => {
      this.processAllEnemyTurns();
    });
  }
  
  /**
   * Process all enemy turns with AI
   */
  private processAllEnemyTurns(): void {
    const enemies = Array.from(this.entities.values()).filter(e => e.type === 'enemy');
    
    if (enemies.length === 0) {
      this.playerTurn = true;
      return;
    }
    
    let currentEnemyIndex = 0;
    
    const processNextEnemy = () => {
      if (currentEnemyIndex >= enemies.length) {
        this.playerTurn = true;
        return;
      }
      
      const enemy = enemies[currentEnemyIndex];
      this.processEnemyTurn(enemy);
      
      currentEnemyIndex++;
      this.time.delayedCall(300, processNextEnemy);
    };
    
    processNextEnemy();
  }
  
  /**
   * Process single enemy turn with full AI
   */
  private processEnemyTurn(enemy: Entity): void {
    if (!enemy || !enemy.sprite.active) return;
    
    const heroDistance = Math.abs(enemy.x - this.hero.x) + Math.abs(enemy.y - this.hero.y);
    
    // If adjacent to hero, attack
    if (heroDistance === 1) {
      this.initiateCombat(enemy, this.hero);
      return;
    }
    
    // If hero is within detection range, move towards hero
    if (heroDistance <= 6) {
      this.pathfinder.findPath(
        enemy.x, enemy.y,
        this.hero.x, this.hero.y,
        (path) => {
          if (path && path.length > 1) {
            const nextStep = path[1]; // path[0] is current position
            
            // Check if next position is walkable and not occupied
            if (this.canMoveTo(nextStep.x, nextStep.y)) {
              this.moveEntityToPosition(enemy, nextStep.x, nextStep.y);
            }
          }
        }
      );
      
      this.pathfinder.calculate();
    }
  }
  
  /**
   * Collect item to inventory with full item system
   */
  private collectItemToInventory(item: Entity): void {
    // Play collection sound
    const sound = this.howlerSounds.get('level_up');
    if (sound) {
      sound.volume(0.5);
      sound.play();
    }
    
    // Create inventory item based on sprite
    let inventoryItem;
    const spriteKey = item.sprite.texture.key;
    
    if (spriteKey.includes('health_potion')) {
      inventoryItem = {
        name: 'Health Potion',
        type: 'potion' as const,
        description: 'Restores 50 HP when consumed',
        spriteKey,
        quantity: 1,
        rarity: 'common' as const,
        effects: { healHP: 50 },
        value: 25,
        stackable: true,
        tradeable: true
      };
    } else if (spriteKey.includes('mana_potion')) {
      inventoryItem = {
        name: 'Mana Potion',
        type: 'potion' as const,
        description: 'Restores 30 MP when consumed',
        spriteKey,
        quantity: 1,
        rarity: 'common' as const,
        effects: { healMP: 30 },
        value: 20,
        stackable: true,
        tradeable: true
      };
    } else if (spriteKey.includes('treasure')) {
      const goldAmount = Math.floor(Math.random() * 50) + 25;
      // Add gold directly to hero stats instead of inventory
      useGameStore.getState().updateHeroStats({
        gold: useGameStore.getState().hero.gold + goldAmount
      });
      
      this.showNotification(`💰 Found ${goldAmount} Gold!`, 0xf39c12);
      
      // Remove item and return early
      item.sprite.destroy();
      this.entities.delete(item.id);
      return;
    } else {
      // Generic item
      inventoryItem = {
        name: _.startCase(item.id.replace(/^(item_|entity_)/, '')),
        type: 'treasure' as const,
        description: 'A valuable artifact found in the dungeon depths',
        spriteKey,
        quantity: 1,
        rarity: Math.random() > 0.8 ? 'uncommon' as const : 'common' as const,
        value: Math.floor(Math.random() * 100) + 50,
        stackable: false,
        tradeable: true
      };
    }
    
    // Add to inventory
    useGameStore.getState().addItem(inventoryItem);
    
    // Show notification
    this.showNotification(`📦 Found: ${inventoryItem.name}`, 0x27ae60);
    
    // Remove from world
    item.sprite.destroy();
    this.entities.delete(item.id);
    
    console.log(`✅ Collected: ${inventoryItem.name}`);
  }
  
  /**
   * Trigger boss encounter on special floors
   */
  private triggerBossEncounter(floor: number): void {
    const boss = this.bossSystem.getBossForFloor(floor);
    if (!boss) return;
    
    console.log(`👑 Boss encounter triggered: ${boss.name}`);
    
    // Clear existing enemies
    Array.from(this.entities.values())
      .filter(e => e.type === 'enemy')
      .forEach(enemy => {
        enemy.sprite.destroy();
        this.entities.delete(enemy.id);
      });
    
    // Create boss entity with enhanced stats
    const bossEntity = this.createBossEntity(boss, floor);
    
    // Show boss intro
    this.showBossIntro(boss);
    
    // Play dramatic boss music if available
    this.playBossMusic();
  }
  
  /**
   * Create boss entity with special properties
   */
  private createBossEntity(boss: any, floor: number): Entity {
    // Find center room for boss spawn
    const rooms = this.rotMap.getRooms();
    let bossX = Math.floor(this.mapWidth / 2);
    let bossY = Math.floor(this.mapHeight / 2);
    
    if (rooms.length > 0) {
      const centerRoom = rooms[Math.floor(rooms.length / 2)];
      const roomWidth = centerRoom.getRight() - centerRoom.getLeft() + 1;
      const roomHeight = centerRoom.getBottom() - centerRoom.getTop() + 1;
      bossX = centerRoom.getLeft() + Math.floor(roomWidth / 2);
      bossY = centerRoom.getTop() + Math.floor(roomHeight / 2);
    }
    
    // Create boss entity (using enhanced enemy sprite)
    const bossEntity = this.createEntity('enemy', bossX, bossY, 'dark_wizard_boss_south');
    
    // Scale boss for floor
    bossEntity.sprite.setDisplaySize(64, 64); // Larger boss sprite
    bossEntity.sprite.setTint(0xff6600); // Orange tint for boss
    bossEntity.health = boss.maxHP;
    bossEntity.maxHealth = boss.maxHP;
    bossEntity.isBoss = true;
    bossEntity.bossData = boss;
    
    console.log(`👑 Boss spawned: ${boss.name} at (${bossX}, ${bossY})`);
    return bossEntity;
  }
  
  /**
   * Show boss introduction
   */
  private showBossIntro(boss: any): void {
    const { width, height } = this.scene.cameras.main;
    
    const introText = this.add.text(width / 2, height / 2, 
      `👑 ${boss.name} APPEARS! 👑\nFloor ${boss.floor} Boss Battle!`, 
      {
        fontSize: '20px',
        color: '#ff4444',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(2000);
    
    // Auto-hide after 4 seconds
    this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: introText,
        alpha: 0,
        duration: 1000,
        onComplete: () => introText.destroy()
      });
    });
  }
  
  /**
   * Play boss music
   */
  private playBossMusic(): void {
    try {
      const sound = this.howlerSounds.get('level_up'); // Use level_up sound as boss music
      if (sound) {
        sound.volume(0.8);
        sound.play();
      }
    } catch (error) {
      console.warn('Boss music not available');
    }
  }
}
