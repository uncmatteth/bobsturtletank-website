/**
 * Roguelike Engine - Core game engine using rot.js
 * Handles game loop, state management, and core systems
 */

import * as ROT from 'rot-js';
import { Map } from './map/Map';
import { Player } from './entities/Player';
import { EntityManager } from './entities/EntityManager';
import { UIManager } from './ui/UIManager';
import { InputHandler } from './input/InputHandler';
import { GameState } from './GameState';
import { EventBus } from './events/EventBus';
import { CombatSystem } from './systems/CombatSystem';
import { FOVSystem } from './systems/FOVSystem';
import { LightingSystem } from './systems/LightingSystem';
import { ItemSystem } from './systems/ItemSystem';
import { ProgressionSystem } from './systems/ProgressionSystem';
import { AudioManager } from './audio/AudioManager';
import { AssetManager } from './assets/AssetManager';
import { SaveManager } from './save/SaveManager';

export class Engine {
  private scheduler: ROT.Scheduler.Speed;
  private gameDisplay: ROT.Display;
  private map: Map;
  private player: Player;
  private entityManager: EntityManager;
  private uiManager: UIManager;
  private inputHandler: InputHandler;
  private gameState: GameState;
  private eventBus: EventBus;
  private combatSystem: CombatSystem;
  private fovSystem: FOVSystem;
  private lightingSystem: LightingSystem;
  private itemSystem: ItemSystem;
  private progressionSystem: ProgressionSystem;
  private audioManager: AudioManager;
  private assetManager: AssetManager;
  private saveManager: SaveManager;
  
  private isRunning: boolean = false;
  private currentLevel: number = 1;
  private turn: number = 0;
  
  constructor(containerId: string) {
    console.log('🎮 Initializing Roguelike Engine');
    
    // Initialize event bus first so systems can subscribe
    this.eventBus = new EventBus();
    
    // Initialize display
    this.gameDisplay = new ROT.Display({
      width: 80,
      height: 40,
      fontSize: 16,
      fontFamily: 'monospace',
      forceSquareRatio: true
    });
    
    // Attach display to container
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(this.gameDisplay.getContainer()!);
    } else {
      console.error('Container not found:', containerId);
    }
    
    // Initialize scheduler
    this.scheduler = new ROT.Scheduler.Speed();
    
    // Initialize systems
    this.assetManager = new AssetManager(this.eventBus);
    this.map = new Map(this.eventBus);
    this.entityManager = new EntityManager(this.eventBus);
    this.uiManager = new UIManager(this.gameDisplay, this.eventBus);
    this.inputHandler = new InputHandler(this.eventBus);
    this.combatSystem = new CombatSystem(this.eventBus);
    this.fovSystem = new FOVSystem(this.eventBus);
    this.lightingSystem = new LightingSystem(this.eventBus);
    this.itemSystem = new ItemSystem(this.eventBus);
    this.progressionSystem = new ProgressionSystem(this.eventBus);
    this.audioManager = new AudioManager(this.eventBus);
    this.saveManager = new SaveManager(this.eventBus);
    
    // Initialize game state
    this.gameState = new GameState(this.eventBus);
    
    // Create player
    this.player = new Player(this.eventBus);
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Initialize the game
   */
  public async init(): Promise<void> {
    console.log('🚀 Initializing game...');
    
    // Load assets
    await this.assetManager.loadAssets();
    
    // Initialize map
    this.map.generateLevel(this.currentLevel);
    
    // Place player
    const startPosition = this.map.getStartPosition();
    this.player.setPosition(startPosition.x, startPosition.y);
    
    // Add player to scheduler
    this.scheduler.add(this.player, true);
    
    // Add player to entity manager
    this.entityManager.addEntity(this.player);
    
    // Generate entities
    this.entityManager.populateLevel(this.map, this.currentLevel);
    
    // Calculate initial FOV
    this.fovSystem.computeFOV(this.player.getPosition(), this.map);
    
    // Initialize UI
    this.uiManager.init(this.player);
    
    // Set initial game state
    this.gameState.setState('playing');
    
    console.log('✅ Game initialized');
    
    // Start game loop
    this.start();
  }
  
  /**
   * Start the game loop
   */
  public start(): void {
    this.isRunning = true;
    this.gameLoop();
  }
  
  /**
   * Stop the game loop
   */
  public stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Main game loop
   */
  private gameLoop(): void {
    if (!this.isRunning) return;
    
    // Get current actor
    const actor = this.scheduler.next();
    if (!actor) return;
    
    // If it's the player's turn
    if (actor === this.player) {
      // Render the game
      this.render();
      
      // Wait for player input
      this.inputHandler.waitForInput().then(action => {
        // Process player action
        this.processPlayerAction(action);
        
        // Continue game loop
        this.gameLoop();
      });
    } else {
      // Process AI turn
      this.processAITurn(actor);
      
      // Continue game loop
      this.gameLoop();
    }
  }
  
  /**
   * Process player action
   */
  private processPlayerAction(action: any): void {
    // Process action based on type
    switch (action.type) {
      case 'move':
        this.handlePlayerMove(action.direction);
        break;
      case 'attack':
        this.handlePlayerAttack(action.target);
        break;
      case 'use_item':
        this.handlePlayerUseItem(action.item);
        break;
      case 'wait':
        // Do nothing, just pass turn
        break;
      case 'descend':
        this.handlePlayerDescend();
        break;
    }
    
    // Increment turn counter
    this.turn++;
    
    // Update systems
    this.updateSystems();
  }
  
  /**
   * Process AI turn
   */
  private processAITurn(actor: any): void {
    // Let the AI take its turn
    actor.act();
    
    // Increment turn counter
    this.turn++;
    
    // Update systems
    this.updateSystems();
  }
  
  /**
   * Handle player movement
   */
  private handlePlayerMove(direction: string): void {
    const currentPos = this.player.getPosition();
    let newX = currentPos.x;
    let newY = currentPos.y;
    
    // Calculate new position based on direction
    switch (direction) {
      case 'north':
        newY--;
        break;
      case 'south':
        newY++;
        break;
      case 'west':
        newX--;
        break;
      case 'east':
        newX++;
        break;
      case 'northeast':
        newX++;
        newY--;
        break;
      case 'northwest':
        newX--;
        newY--;
        break;
      case 'southeast':
        newX++;
        newY++;
        break;
      case 'southwest':
        newX--;
        newY++;
        break;
    }
    
    // Check if the new position is valid
    if (this.map.isWalkable(newX, newY)) {
      // Check for entities at the new position
      const entity = this.entityManager.getEntityAt(newX, newY);
      
      if (entity && entity.isBlocking()) {
        // If entity is hostile, attack it
        if (entity.isHostile()) {
          this.combatSystem.attack(this.player, entity);
        }
      } else {
        // Move player
        this.player.setPosition(newX, newY);
        
        // Update FOV
        this.fovSystem.computeFOV(this.player.getPosition(), this.map);
        
        // Check for items
        const items = this.entityManager.getItemsAt(newX, newY);
        if (items.length > 0) {
          this.eventBus.emit('message', { text: `You see ${items.map(i => i.getName()).join(', ')} here.` });
        }
      }
    } else {
      this.eventBus.emit('message', { text: 'You cannot move there.' });
    }
  }
  
  /**
   * Handle player attack
   */
  private handlePlayerAttack(target: any): void {
    this.combatSystem.attack(this.player, target);
  }
  
  /**
   * Handle player using an item
   */
  private handlePlayerUseItem(item: any): void {
    this.itemSystem.useItem(this.player, item);
  }
  
  /**
   * Handle player descending to next level
   */
  private handlePlayerDescend(): void {
    // Check if player is on stairs
    const pos = this.player.getPosition();
    if (this.map.getTile(pos.x, pos.y).isStairs()) {
      // Go to next level
      this.currentLevel++;
      
      // Generate new level
      this.map.generateLevel(this.currentLevel);
      
      // Place player at start position
      const startPosition = this.map.getStartPosition();
      this.player.setPosition(startPosition.x, startPosition.y);
      
      // Clear entities and repopulate
      this.entityManager.clearEntities();
      this.entityManager.addEntity(this.player);
      this.entityManager.populateLevel(this.map, this.currentLevel);
      
      // Recalculate FOV
      this.fovSystem.computeFOV(this.player.getPosition(), this.map);
      
      // Message
      this.eventBus.emit('message', { text: `You descend to floor ${this.currentLevel}...` });
      
      // Play sound
      this.audioManager.playSound('descend');
    } else {
      this.eventBus.emit('message', { text: 'There are no stairs here.' });
    }
  }
  
  /**
   * Update all game systems
   */
  private updateSystems(): void {
    // Update lighting
    this.lightingSystem.update(this.map);
    
    // Check for dead entities
    this.entityManager.removeDeadEntities();
    
    // Update UI
    this.uiManager.update(this.player);
    
    // Check for game over
    if (this.player.isDead()) {
      this.gameState.setState('game_over');
      this.eventBus.emit('game_over');
      this.stop();
    }
  }
  
  /**
   * Render the game
   */
  private render(): void {
    // Clear the display
    this.gameDisplay.clear();
    
    // Render the map
    this.renderMap();
    
    // Render entities
    this.renderEntities();
    
    // Render UI
    this.uiManager.render();
  }
  
  /**
   * Render the map
   */
  private renderMap(): void {
    const visibleCells = this.fovSystem.getVisibleCells();
    
    // Render visible cells
    for (const key in visibleCells) {
      const [x, y] = key.split(',').map(Number);
      const tile = this.map.getTile(x, y);
      
      // Get tile appearance
      const appearance = tile.getAppearance();
      
      // Draw tile
      this.gameDisplay.draw(
        x, 
        y, 
        appearance.char, 
        appearance.fg, 
        appearance.bg
      );
    }
    
    // Render remembered cells
    const rememberedCells = this.fovSystem.getRememberedCells();
    for (const key in rememberedCells) {
      // Skip visible cells
      if (key in visibleCells) continue;
      
      const [x, y] = key.split(',').map(Number);
      const tile = this.map.getTile(x, y);
      
      // Get tile appearance
      const appearance = tile.getAppearance();
      
      // Draw tile with darker colors
      this.gameDisplay.draw(
        x, 
        y, 
        appearance.char, 
        this.darkenColor(appearance.fg), 
        this.darkenColor(appearance.bg)
      );
    }
  }
  
  /**
   * Render entities
   */
  private renderEntities(): void {
    const visibleCells = this.fovSystem.getVisibleCells();
    
    // Get all entities
    const entities = this.entityManager.getAllEntities();
    
    // Sort entities by render order
    entities.sort((a, b) => a.getRenderOrder() - b.getRenderOrder());
    
    // Render visible entities
    for (const entity of entities) {
      const pos = entity.getPosition();
      const key = `${pos.x},${pos.y}`;
      
      // Only render if visible
      if (key in visibleCells) {
        const appearance = entity.getAppearance();
        
        this.gameDisplay.draw(
          pos.x, 
          pos.y, 
          appearance.char, 
          appearance.fg, 
          appearance.bg
        );
      }
    }
  }
  
  /**
   * Darken a color for remembered tiles
   */
  private darkenColor(color: string): string {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Darken by 50%
    const darkenedR = Math.floor(r * 0.5);
    const darkenedG = Math.floor(g * 0.5);
    const darkenedB = Math.floor(b * 0.5);
    
    // Convert back to hex
    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for game state changes
    this.eventBus.on('state_changed', (data) => {
      console.log(`Game state changed to ${data.state}`);
    });
    
    // Listen for player death
    this.eventBus.on('entity_died', (data) => {
      if (data.entity === this.player) {
        this.gameState.setState('game_over');
        this.eventBus.emit('game_over');
        this.stop();
      }
    });
    
    // Listen for level changes
    this.eventBus.on('level_changed', (data) => {
      this.currentLevel = data.level;
    });
    
    // Listen for save game request
    this.eventBus.on('save_game', () => {
      this.saveGame();
    });
    
    // Listen for load game request
    this.eventBus.on('load_game', () => {
      this.loadGame();
    });
  }
  
  /**
   * Save the game
   */
  private saveGame(): void {
    const saveData = {
      player: this.player.serialize(),
      map: this.map.serialize(),
      entities: this.entityManager.serialize(),
      currentLevel: this.currentLevel,
      turn: this.turn
    };
    
    this.saveManager.saveGame(saveData);
  }
  
  /**
   * Load the game
   */
  private loadGame(): void {
    const saveData = this.saveManager.loadGame();
    
    if (saveData) {
      // Load player
      this.player.deserialize(saveData.player);
      
      // Load map
      this.map.deserialize(saveData.map);
      
      // Load entities
      this.entityManager.deserialize(saveData.entities);
      
      // Set current level
      this.currentLevel = saveData.currentLevel;
      
      // Set turn
      this.turn = saveData.turn;
      
      // Recalculate FOV
      this.fovSystem.computeFOV(this.player.getPosition(), this.map);
      
      // Update UI
      this.uiManager.update(this.player);
      
      // Render
      this.render();
      
      this.eventBus.emit('message', { text: 'Game loaded.' });
    } else {
      this.eventBus.emit('message', { text: 'No saved game found.' });
    }
  }
}
