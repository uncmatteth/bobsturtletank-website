// Small focused game engine - just coordinates other systems
import { AssetLoader } from './AssetLoader.js';
import { InputHandler } from './InputHandler.js';
import { TileRenderer } from './TileRenderer.js';
import { PlayerController } from './PlayerController.js';
import { GameLoop } from './GameLoop.js';
import { AudioManager } from '../managers/AudioManager.js';
import { UIManager } from '../managers/UIManager.js';
import { NPCManager } from '../managers/NPCManager.js';
import { ItemManager } from '../managers/ItemManager.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { RoomBasedGenerator } from '../systems/MapGenerator.js';
import { GameState } from '../systems/GameState.js';
import { GAME_CONFIG } from '../config/Constants.js';

export class CompleteRoguelikeScene extends Phaser.Scene {
    constructor() {
        super('CompleteRoguelikeScene');
        this.initializeSystems();
    }

    initializeSystems() {
        this.gameState = new GameState();
        this.gameConfig = GAME_CONFIG; // Make config available to managers
        this.assetLoader = new AssetLoader(this);
        this.inputHandler = new InputHandler(this);
        this.tileRenderer = new TileRenderer(this);
        this.playerController = new PlayerController(this);
        this.gameLoop = new GameLoop(this);
        
        // Managers
        this.audioManager = new AudioManager(this);
        this.uiManager = new UIManager(this);
        this.npcManager = new NPCManager(this);
        this.itemManager = new ItemManager(this);
        this.enemyManager = new EnemyManager(this);
    }

    preload() {
        console.log('🎨 Loading complete roguelike assets...');
        this.assetLoader.loadAllAssets();
    }

    create() {
        console.log('🎮 Creating complete roguelike game...');
        
        try {
            this.generateLevel();
            this.inputHandler.setup();
            this.audioManager.loadSettings();
            this.audioManager.startMusic();
            this.uiManager.updateUI();
            this.showWelcomeMessages();
            this.loadExistingSave();
            
            console.log('✅ Game scene created successfully!');
        } catch (error) {
            console.error('❌ Error creating game scene:', error);
        }
    }

    update() {
        this.gameLoop.update();
    }

    generateLevel() {
        const { map, rooms } = RoomBasedGenerator.generateMap(
            GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT, this.gameState.currentDepth
        );
        
        this.gameState.gameMap = map;
        this.gameState.rooms = rooms;
        this.gameState.stairsPosition = RoomBasedGenerator.placeStairs(map, rooms);
        
        if (!this.gameState.player) {
            const playerPos = RoomBasedGenerator.findPlayerSpawnPosition(rooms);
            this.playerController.createPlayer(playerPos.x, playerPos.y);
        }
        
        this.npcManager.generateNPCs();
        this.itemManager.generateItems();
        this.enemyManager.spawnEnemies();
        this.tileRenderer.renderMap();
        this.uiManager.updateMinimap();
        
        console.log(`🏰 Generated level ${this.gameState.currentDepth} with ${rooms.length} rooms`);
    }

    showWelcomeMessages() {
        this.gameState.addMessage('🐢 Bob the Red-Eared Slider awakens in the flooded ruins!', '#3498db');
        this.gameState.addMessage('🌊 As a semi-aquatic turtle, you can swim well but still need air!', '#1abc9c');
        this.gameState.addMessage('🫧 Find air pockets to breathe and stairs to descend deeper!', '#f39c12');
        this.gameState.addMessage('📦 Press I for inventory, E for equipment! Find NPCs to identify rare items!', '#9b59b6');
    }

    loadExistingSave() {
        if (window.dbManager) {
            window.dbManager.loadGame().then(result => {
                if (result?.saveData) {
                    this.gameState.loadGame(result.saveData);
                    this.gameState.addMessage('📁 Game loaded successfully!', '#2ecc71');
                } else {
                    this.gameState.addMessage('📝 No existing save found, starting fresh', '#95a5a6');
                }
            }).catch(() => {
                this.gameState.addMessage('📝 No existing save found, starting fresh', '#95a5a6');
            });
        }
    }

    checkLevelUp() {
        const stats = this.gameState.player.getComponent('stats');
        if (stats.experience >= stats.experienceToNext) {
            stats.level++;
            stats.experience -= stats.experienceToNext;
            stats.experienceToNext = Math.floor(stats.experienceToNext * 1.2);
            
            // Increase base stats
            const health = this.gameState.player.getComponent('health');
            const mana = this.gameState.player.getComponent('mana');
            
            const healthGain = 10 + Math.floor(stats.level / 2);
            const manaGain = 5 + Math.floor(stats.level / 3);
            const attackGain = 1 + Math.floor(stats.level / 4);
            const defenseGain = 1 + Math.floor(stats.level / 5);
            
            health.maxHealth += healthGain;
            health.currentHealth += healthGain;
            mana.maxMana += manaGain;
            mana.currentMana += manaGain;
            stats.attack += attackGain;
            stats.defense += defenseGain;
            
            this.gameState.addMessage(`🎉 Level Up! You are now level ${stats.level}!`, '#f1c40f');
            this.gameState.addMessage(`💪 +${healthGain} HP, +${manaGain} MP, +${attackGain} ATK, +${defenseGain} DEF`, '#2ecc71');
            
            this.audioManager.playSpatialSound('level_up', this.gameState.player.x, this.gameState.player.y);
            this.uiManager.updateUI();
        }
    }
}
