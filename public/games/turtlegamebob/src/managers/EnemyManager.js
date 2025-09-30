// Enemy spawning and AI management system

import { ENEMY_TYPES } from '../config/Constants.js';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.lastAIUpdate = 0;
        this.aiUpdateInterval = 1000; // Update AI every second
    }

    spawnEnemies() {
        const depth = this.scene.gameState.currentDepth;
        const rooms = this.scene.gameState.rooms;
        
        // Skip first room (where player spawns)
        const spawnRooms = rooms.slice(1);
        
        // Calculate enemy count based on depth
        const baseEnemies = 3;
        const depthBonus = Math.floor(depth / 2);
        const enemyCount = baseEnemies + depthBonus + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < enemyCount; i++) {
            const room = spawnRooms[Math.floor(Math.random() * spawnRooms.length)];
            
            // Don't spawn in treasure or merchant rooms
            if (room.isTreasureRoom || room.isMerchantRoom) continue;
            
            const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
            const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
            
            // Make sure the tile is floor
            if (this.scene.gameState.gameMap[x][y] === 1) {
                this.spawnEnemy(x, y, depth);
            }
        }
        
        // Occasionally spawn boss at deeper levels
        if (depth >= 5 && Math.random() < 0.3) {
            this.spawnBoss();
        }
        
        console.log(`👹 Spawned ${this.enemies.length} enemies for depth ${depth}`);
    }

    spawnEnemy(x, y, depth) {
        const enemyType = this.selectEnemyType(depth);
        const enemyData = ENEMY_TYPES[enemyType];
        
        // Scale stats based on depth
        const scaledStats = this.scaleEnemyStats(enemyData, depth);
        
        // Determine sprite
        let textureKey = 'enemy_fish_south';
        switch (enemyType) {
            case 'FISH':
                textureKey = this.scene.textures.exists('enemy_fish_south') ? 'enemy_fish_south' : 'enemy_generic_south';
                break;
            case 'CRAB':
                textureKey = this.scene.textures.exists('enemy_crab_south') ? 'enemy_crab_south' : 'enemy_generic_south';
                break;
            case 'LOBSTER':
                textureKey = this.scene.textures.exists('armored_lobster_warrior_south') ? 'armored_lobster_warrior_south' : 'enemy_generic_south';
                break;
            case 'EEL':
                textureKey = this.scene.textures.exists('electric_eel_south') ? 'electric_eel_south' : 'enemy_generic_south';
                break;
            case 'WITCH':
                textureKey = this.scene.textures.exists('sea_witch_south') ? 'sea_witch_south' : 'enemy_generic_south';
                break;
        }
        
        const sprite = this.scene.add.sprite(
            x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            y * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            textureKey
        );
        sprite.setScale(1.0);
        sprite.setDepth(85);
        
        // Apply different tints for different enemy types
        const enemyTints = {
            'FISH': 0x3498db,      // Blue
            'CRAB': 0xe74c3c,      // Red  
            'LOBSTER': 0xf39c12,   // Orange
            'EEL': 0x9b59b6,       // Purple
            'WITCH': 0x1abc9c,     // Teal
            'BOSS': 0x2c3e50       // Dark
        };
        
        if (enemyTints[enemyType]) {
            sprite.setTint(enemyTints[enemyType]);
        }
        
        const enemy = {
            type: 'enemy',
            x: x,
            y: y,
            sprite: sprite,
            enemyType: enemyType,
            name: scaledStats.name,
            health: scaledStats.health,
            maxHealth: scaledStats.health,
            attack: scaledStats.attack,
            defense: scaledStats.defense,
            speed: scaledStats.speed,
            xpReward: scaledStats.xpReward,
            goldReward: Math.floor(scaledStats.xpReward * 0.8),
            lastMoveTime: 0,
            moveDirection: { x: 0, y: 0 },
            playerLastSeen: null,
            aggressive: true
        };
        
        this.enemies.push(enemy);
        this.scene.gameState.entities.push(enemy);
        
        return enemy;
    }

    selectEnemyType(depth) {
        const weights = {
            'FISH': Math.max(1, 10 - depth),      // Common early, rare later
            'CRAB': Math.max(1, 8 - depth * 0.5), // Common early-mid
            'LOBSTER': Math.max(1, depth - 2),     // Rare early, common later
            'EEL': Math.max(1, depth - 3),         // Appears mid-game
            'WITCH': Math.max(1, depth - 5)        // Appears late game
        };
        
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'FISH'; // Fallback
    }

    scaleEnemyStats(baseStats, depth) {
        const depthMultiplier = 1 + (depth - 1) * 0.2; // 20% increase per depth
        const randomVariation = 0.8 + Math.random() * 0.4; // ±20% random variation
        
        return {
            name: baseStats.name,
            health: Math.floor(baseStats.health * depthMultiplier * randomVariation),
            attack: Math.floor(baseStats.attack * depthMultiplier * randomVariation),
            defense: Math.floor(baseStats.defense * depthMultiplier * randomVariation),
            speed: baseStats.speed,
            xpReward: Math.floor(baseStats.xpReward * depthMultiplier)
        };
    }

    spawnBoss() {
        const depth = this.scene.gameState.currentDepth;
        const rooms = this.scene.gameState.rooms;
        
        // Find largest room for boss
        let bossRoom = rooms.reduce((largest, room) => {
            const area = room.width * room.height;
            const largestArea = largest.width * largest.height;
            return area > largestArea ? room : largest;
        });
        
        const centerX = Math.floor(bossRoom.x + bossRoom.width / 2);
        const centerY = Math.floor(bossRoom.y + bossRoom.height / 2);
        
        const bossStats = this.generateBossStats(depth);
        
        const sprite = this.scene.add.sprite(
            centerX * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            centerY * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            'enemy_boss_south'
        );
        sprite.setScale(1.5); // Bosses are bigger
        sprite.setDepth(85);
        
        const boss = {
            type: 'enemy',
            x: centerX,
            y: centerY,
            sprite: sprite,
            enemyType: 'BOSS',
            name: bossStats.name,
            health: bossStats.health,
            maxHealth: bossStats.health,
            attack: bossStats.attack,
            defense: bossStats.defense,
            speed: bossStats.speed,
            xpReward: bossStats.xpReward,
            goldReward: bossStats.goldReward,
            isBoss: true,
            lastMoveTime: 0,
            moveDirection: { x: 0, y: 0 },
            playerLastSeen: null,
            aggressive: true,
            specialAbilities: ['charge', 'area_attack']
        };
        
        this.enemies.push(boss);
        this.scene.gameState.entities.push(boss);
        
        // Boss introduction
        this.scene.gameState.addMessage(`💀 ${boss.name} emerges from the depths!`, '#e74c3c');
        this.scene.audioManager.playSpatialSound('achievement_unlock', centerX, centerY);
        
        return boss;
    }

    generateBossStats(depth) {
        const bossNames = [
            'Kraken Spawn', 'Deep Sea Tyrant', 'Abyssal Guardian',
            'Leviathan\'s Offspring', 'Trench Lord', 'Coral Behemoth'
        ];
        
        return {
            name: bossNames[Math.floor(Math.random() * bossNames.length)],
            health: 80 + (depth * 20),
            attack: 15 + (depth * 3),
            defense: 8 + (depth * 2),
            speed: 0.8,
            xpReward: 100 + (depth * 25),
            goldReward: 50 + (depth * 15)
        };
    }

    updateEnemyAI(deltaTime) {
        const currentTime = Date.now();
        
        // Only update AI periodically for performance
        if (currentTime - this.lastAIUpdate < this.aiUpdateInterval) return;
        this.lastAIUpdate = currentTime;
        
        const playerPos = this.scene.gameState.player.getComponent('transform');
        if (!playerPos) return;
        
        this.enemies.forEach(enemy => {
            if (enemy.health <= 0) return;
            
            this.updateEnemyBehavior(enemy, playerPos);
        });
    }

    updateEnemyBehavior(enemy, playerPos) {
        const distanceToPlayer = Math.abs(enemy.x - playerPos.x) + Math.abs(enemy.y - playerPos.y);
        
        // If player is close, move towards them
        if (distanceToPlayer <= 8) {
            this.moveEnemyTowardsPlayer(enemy, playerPos);
        } else {
            // Random movement
            this.randomEnemyMovement(enemy);
        }
    }

    moveEnemyTowardsPlayer(enemy, playerPos) {
        const dx = playerPos.x - enemy.x;
        const dy = playerPos.y - enemy.y;
        
        // Determine best move direction
        let moveX = 0, moveY = 0;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else {
            moveY = dy > 0 ? 1 : -1;
        }
        
        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;
        
        // Check if move is valid
        if (this.isValidEnemyMove(newX, newY, enemy)) {
            this.moveEnemy(enemy, newX, newY);
        } else {
            // Try alternative directions
            const alternatives = [
                { x: moveX, y: 0 },
                { x: 0, y: moveY },
                { x: -moveX, y: 0 },
                { x: 0, y: -moveY }
            ];
            
            for (const alt of alternatives) {
                const altX = enemy.x + alt.x;
                const altY = enemy.y + alt.y;
                
                if (this.isValidEnemyMove(altX, altY, enemy)) {
                    this.moveEnemy(enemy, altX, altY);
                    break;
                }
            }
        }
    }

    randomEnemyMovement(enemy) {
        if (Math.random() < 0.3) { // 30% chance to move
            const directions = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];
            
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const newX = enemy.x + direction.x;
            const newY = enemy.y + direction.y;
            
            if (this.isValidEnemyMove(newX, newY, enemy)) {
                this.moveEnemy(enemy, newX, newY);
            }
        }
    }

    isValidEnemyMove(x, y, enemy) {
        const map = this.scene.gameState.gameMap;
        
        // Check bounds
        if (x < 0 || y < 0 || x >= map.length || y >= map[0].length) {
            return false;
        }
        
        // Check tile type (floor, water, air pocket)
        const tile = map[x][y];
        if (tile !== 1 && tile !== 4 && tile !== 6) {
            return false;
        }
        
        // Check for other entities at position
        const blocked = this.scene.gameState.entities.some(entity => 
            entity !== enemy && entity.x === x && entity.y === y
        );
        
        return !blocked;
    }

    moveEnemy(enemy, newX, newY) {
        enemy.x = newX;
        enemy.y = newY;
        
        if (enemy.sprite) {
            enemy.sprite.x = newX * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2;
            enemy.sprite.y = newY * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2;
        }
    }

    damageEnemy(enemy, damage) {
        if (!enemy || enemy.health <= 0) return false;
        
        // Apply defense
        const actualDamage = Math.max(1, damage - enemy.defense);
        enemy.health -= actualDamage;
        
        // Show damage number
        this.showDamageNumber(enemy.x, enemy.y, actualDamage, '#ff6b6b');
        
        // Check if enemy died
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
            return true;
        }
        
        // Show health bar
        this.showEnemyHealthBar(enemy);
        
        return false;
    }

    killEnemy(enemy) {
        const playerStats = this.scene.gameState.player.getComponent('stats');
        
        // Give XP and gold
        playerStats.experience += enemy.xpReward;
        playerStats.gold += enemy.goldReward;
        
        // Update stats
        this.scene.gameState.stats.enemiesKilled++;
        if (enemy.isBoss) {
            this.scene.gameState.stats.bossesKilled++;
        }
        
        // Show rewards
        this.scene.gameState.addMessage(
            `💀 ${enemy.name} defeated! (+${enemy.xpReward} XP, +${enemy.goldReward} gold)`, 
            '#2ecc71'
        );
        
        // Remove from arrays
        const enemyIndex = this.enemies.indexOf(enemy);
        if (enemyIndex > -1) {
            this.enemies.splice(enemyIndex, 1);
        }
        
        const entityIndex = this.scene.gameState.entities.indexOf(enemy);
        if (entityIndex > -1) {
            this.scene.gameState.entities.splice(entityIndex, 1);
        }
        
        // Destroy sprite
        if (enemy.sprite) {
            enemy.sprite.destroy();
        }
        
        // Death effects
        this.createDeathEffect(enemy.x, enemy.y);
        this.scene.audioManager.playSpatialSound('sword_hit', enemy.x, enemy.y);
        
        // Check level up
        this.scene.checkLevelUp();
        
        // Drop loot occasionally
        if (Math.random() < 0.3) {
            this.scene.itemManager.createRandomItem(enemy.x, enemy.y);
        }
    }

    showDamageNumber(x, y, damage, color) {
        const worldX = x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2;
        const worldY = y * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2;
        
        const damageText = this.scene.add.text(worldX, worldY, `-${damage}`, {
            fontSize: '16px',
            fill: color,
            fontFamily: 'Courier New',
            stroke: '#000000',
            strokeThickness: 2
        });
        damageText.setOrigin(0.5);
        damageText.setDepth(200);
        
        // Animate damage number
        this.scene.tweens.add({
            targets: damageText,
            y: worldY - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    showEnemyHealthBar(enemy) {
        const worldX = enemy.x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2;
        const worldY = enemy.y * this.scene.gameConfig.TILE_SIZE - 10;
        
        // Remove existing health bar
        if (enemy.healthBar) {
            enemy.healthBar.destroy();
            enemy.healthBarBg.destroy();
        }
        
        // Create health bar background
        enemy.healthBarBg = this.scene.add.rectangle(worldX, worldY, 32, 4, 0x333333);
        enemy.healthBarBg.setDepth(150);
        
        // Create health bar fill
        const healthPercent = enemy.health / enemy.maxHealth;
        const barColor = healthPercent > 0.6 ? 0x2ecc71 : healthPercent > 0.3 ? 0xf39c12 : 0xe74c3c;
        
        enemy.healthBar = this.scene.add.rectangle(worldX, worldY, 32 * healthPercent, 4, barColor);
        enemy.healthBar.setDepth(151);
        
        // Remove health bar after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            if (enemy.healthBar) {
                enemy.healthBar.destroy();
                enemy.healthBarBg.destroy();
                enemy.healthBar = null;
                enemy.healthBarBg = null;
            }
        });
    }

    createDeathEffect(x, y) {
        const worldX = x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2;
        const worldY = y * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2;
        
        // Create particle effect
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(worldX, worldY, 2, 0xff6b6b);
            particle.setDepth(180);
            particles.push(particle);
            
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 30;
            
            this.scene.tweens.add({
                targets: particle,
                x: worldX + Math.cos(angle) * speed,
                y: worldY + Math.sin(angle) * speed,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    getEnemyAt(x, y) {
        return this.enemies.find(enemy => enemy.x === x && enemy.y === y && enemy.health > 0);
    }

    clearAllEnemies() {
        this.enemies.forEach(enemy => {
            if (enemy.sprite) {
                enemy.sprite.destroy();
            }
            if (enemy.healthBar) {
                enemy.healthBar.destroy();
                enemy.healthBarBg.destroy();
            }
        });
        
        this.enemies = [];
    }
}
