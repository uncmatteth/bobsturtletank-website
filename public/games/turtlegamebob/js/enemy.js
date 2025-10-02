// ============================================================================
// ENEMY SYSTEM
// AI, types, behavior
// ============================================================================

const Enemy = {
    list: [],
    
    // Enemy type definitions
    types: {
        'goblin': {
            health: 30,
            damage: 10,
            speed: 120,
            sprite: 'goblin',
            aggroRange: 200
        },
        'skeleton': {
            health: 50,
            damage: 15,
            speed: 80,
            sprite: 'skeleton',
            aggroRange: 150
        },
        'orc': {
            health: 80,
            damage: 20,
            speed: 100,
            sprite: 'orc',
            aggroRange: 180
        }
    },
    
    spawn(type, x, y) {
        const data = this.types[type];
        if (!data) {
            console.error(`Unknown enemy type: ${type}`);
            return null;
        }
        
        const enemy = {
            id: generateId(),
            type: type,
            x: x,
            y: y,
            health: data.health,
            maxHealth: data.health,
            damage: data.damage,
            speed: data.speed,
            sprite: data.sprite,
            aggroRange: data.aggroRange,
            state: 'idle', // idle, chase, attack
            direction: 'down',
            targetX: x,
            targetY: y,
            attackCooldown: 0,
            frameIndex: 0,
            frameTimer: 0
        };
        
        this.list.push(enemy);
        return enemy;
    },
    
    update(dt) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const enemy = this.list[i];
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.list.splice(i, 1);
                continue;
            }
            
            this.updateEnemy(enemy, dt);
        }
    },
    
    updateEnemy(enemy, dt) {
        // Update cooldown
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown -= dt;
        }
        
        const dist = distance(enemy, Player);
        
        // State machine
        switch (enemy.state) {
            case 'idle':
                // Check if player is in range
                if (dist < enemy.aggroRange) {
                    enemy.state = 'chase';
                }
                break;
                
            case 'chase':
                // Move toward player
                const angle = angleBetween(enemy, Player);
                enemy.x += Math.cos(angle) * enemy.speed * dt;
                enemy.y += Math.sin(angle) * enemy.speed * dt;
                
                // Check if close enough to attack
                if (dist < 50) {
                    enemy.state = 'attack';
                }
                break;
                
            case 'attack':
                // Attack player
                if (enemy.attackCooldown <= 0) {
                    Combat.enemyAttack(enemy);
                    enemy.attackCooldown = 1.0;
                }
                
                // Check if player too far
                if (dist > 100) {
                    enemy.state = 'chase';
                }
                break;
        }
    },
    
    render(ctx) {
        for (const enemy of this.list) {
            // Draw sprite
            Sprites.drawSprite(ctx, enemy.sprite, enemy.x, enemy.y, 2);
            
            // Draw health bar
            this.drawHealthBar(ctx, enemy);
            
            // Debug: draw aggro range
            if (Game.debugMode) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.aggroRange, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    },
    
    drawHealthBar(ctx, enemy) {
        const barWidth = 40;
        const barHeight = 4;
        const x = enemy.x - barWidth / 2;
        const y = enemy.y - 40;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4ade80' : '#ef4444';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    },
    
    takeDamage(enemy, amount) {
        enemy.health -= amount;
        
        if (enemy.health <= 0) {
            console.log(`Enemy ${enemy.type} killed!`);
            // TODO: Drop loot
        }
    },
    
    clear() {
        this.list = [];
    }
};

