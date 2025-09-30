// Player movement and actions
import { RoomBasedGenerator } from '../systems/MapGenerator.js';
import { TILES } from '../config/Constants.js';

export class PlayerController {
    constructor(scene) {
        this.scene = scene;
    }

    createPlayer(x, y) {
        // Debug: Check if texture exists
        if (!this.scene.textures.exists('hero_south')) {
            console.error('❌ hero_south texture not found! Available:', Object.keys(this.scene.textures.list));
        } else {
            console.log('✅ hero_south texture found!');
        }
        
        const sprite = this.scene.add.sprite(x * 48 + 24, y * 48 + 24, 'hero_south');
        sprite.setScale(1.0);
        sprite.setDepth(100);
        
        // Force texture refresh
        sprite.setTexture('hero_south');
        
        this.scene.gameState.player = {
            type: 'player', x, y, sprite,
            getComponent: (type) => this.getPlayerComponent(type)
        };
        
        this.initializePlayerStats();
    }

    initializePlayerStats() {
        this.scene.gameState.playerHealth = { currentHealth: 100, maxHealth: 100 };
        this.scene.gameState.playerMana = { currentMana: 50, maxMana: 50 };
        this.scene.gameState.playerOxygen = { currentOxygen: 100, maxOxygen: 100 };
        this.scene.gameState.playerStats = {
            level: 1, experience: 0, experienceToNext: 100,
            attack: 10, defense: 5, gold: 0
        };
    }

    getPlayerComponent(type) {
        switch (type) {
            case 'transform': return { x: this.scene.gameState.player.x, y: this.scene.gameState.player.y };
            case 'health': return this.scene.gameState.playerHealth;
            case 'mana': return this.scene.gameState.playerMana;
            case 'oxygen': return this.scene.gameState.playerOxygen;
            case 'stats': return this.scene.gameState.playerStats;
            default: return null;
        }
    }

    move(dx, dy) {
        const player = this.scene.gameState.player;
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        if (!this.isValidMove(newX, newY)) return;
        
        // Check for enemy combat
        const enemy = this.scene.enemyManager.getEnemyAt(newX, newY);
        if (enemy) {
            this.combat(enemy);
            return;
        }
        
        // Check for item pickup
        const item = this.getItemAt(newX, newY);
        if (item) {
            this.scene.itemManager.pickupItem(item);
        }
        
        // Move player
        this.updatePlayerPosition(newX, newY);
        this.handleTileEffects(newX, newY);
        this.scene.uiManager.updateMinimap();
        this.scene.gameState.turnCount = (this.scene.gameState.turnCount || 0) + 1;
    }

    moveToTarget(targetX, targetY) {
        const player = this.scene.gameState.player;
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.move(dx > 0 ? 1 : -1, 0);
        } else if (dy !== 0) {
            this.move(0, dy > 0 ? 1 : -1);
        }
    }

    updatePlayerPosition(x, y) {
        const player = this.scene.gameState.player;
        const oldX = player.x;
        const oldY = player.y;
        
        player.x = x;
        player.y = y;
        player.sprite.x = x * 48 + 24;
        player.sprite.y = y * 48 + 24;
        
        // Update sprite direction based on movement
        const dx = x - oldX;
        const dy = y - oldY;
        
        if (dx > 0) player.sprite.setTexture('hero_east');
        else if (dx < 0) player.sprite.setTexture('hero_west');
        else if (dy > 0) player.sprite.setTexture('hero_south');
        else if (dy < 0) player.sprite.setTexture('hero_north');
    }

    isValidMove(x, y) {
        return RoomBasedGenerator.isValidPosition(this.scene.gameState.gameMap, x, y);
    }

    getItemAt(x, y) {
        return this.scene.gameState.entities.find(entity => 
            entity.type === 'item' && entity.x === x && entity.y === y
        );
    }

    handleTileEffects(x, y) {
        const tile = RoomBasedGenerator.getTileType(this.scene.gameState.gameMap, x, y);
        
        switch (tile) {
            case TILES.STAIRS_DOWN: this.descendStairs(); break;
            case TILES.WATER: this.handleWater(2); break;
            case TILES.DEEP_WATER: this.handleWater(4); break;
            case TILES.AIR_POCKET: this.handleAirPocket(); break;
            case TILES.TREASURE_FLOOR: this.handleTreasure(x, y); break;
        }
    }

    handleWater(oxygenLoss) {
        const oxygen = this.scene.gameState.playerOxygen;
        oxygen.currentOxygen = Math.max(0, oxygen.currentOxygen - oxygenLoss);
        if (oxygen.currentOxygen === 0) {
            this.damagePlayer(oxygenLoss === 2 ? 5 : 10, 'drowning');
        }
    }

    handleAirPocket() {
        const oxygen = this.scene.gameState.playerOxygen;
        oxygen.currentOxygen = oxygen.maxOxygen;
        this.scene.gameState.addMessage('🫧 You breathe deeply in the air pocket!', '#1abc9c');
    }

    handleTreasure(x, y) {
        // Delegate to a TreasureHandler if this gets complex
        this.scene.gameState.addMessage('💰 You found treasure!', '#f1c40f');
    }

    descendStairs() {
        this.scene.gameState.currentDepth++;
        this.scene.gameState.addMessage(`🏔️ Descending to depth ${this.scene.gameState.currentDepth}...`, '#f39c12');
        this.scene.enemyManager.clearAllEnemies();
        this.scene.generateLevel();
    }

    combat(enemy) {
        const damage = Math.max(1, this.scene.gameState.playerStats.attack - enemy.defense);
        const enemyKilled = this.scene.enemyManager.damageEnemy(enemy, damage);
        
        if (!enemyKilled) {
            const enemyDamage = Math.max(1, enemy.attack - this.scene.gameState.playerStats.defense);
            this.damagePlayer(enemyDamage, 'combat');
        }
    }

    damagePlayer(damage, source) {
        const health = this.scene.gameState.playerHealth;
        health.currentHealth -= damage;
        this.scene.gameState.addMessage(`💥 You take ${damage} damage from ${source}!`, '#e74c3c');
        
        if (health.currentHealth <= 0) {
            this.gameOver();
        }
    }

    identifyItem() {
        this.scene.gameState.addMessage('🔍 Find a Scholar NPC to identify rare items!', '#f39c12');
    }

    gameOver() {
        this.scene.gameState.addMessage('💀 Game Over!', '#e74c3c');
    }
}
