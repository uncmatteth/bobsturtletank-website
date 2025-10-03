# 🐢 Bob's Roguelike - Technical Plan

## Architecture Overview

### Simple, Not Over-Engineered
- **No ECS**, no complex patterns
- **Plain JavaScript** with HTML5 Canvas
- **Module pattern** for organization
- **Direct function calls**, no event buses
- **Simple data structures**, no fancy classes

---

## Technology Stack

### Core:
- **HTML5**: Single-page game container
- **Canvas API**: All rendering
- **Vanilla JavaScript**: No framework dependencies
- **LocalStorage**: Save high scores (optional)

### No Dependencies:
- ❌ No Phaser
- ❌ No Pixi.js
- ❌ No game engines
- ❌ No build tools (just files)

### Why Vanilla JS?
- **Fast**: No framework overhead
- **Simple**: Direct control
- **Debuggable**: No abstraction layers
- **Portable**: Works everywhere

---

## Game Loop Architecture

```javascript
// Main game loop (60 FPS)
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // 1. Update game state
    update(deltaTime);
    
    // 2. Render everything
    render();
    
    // 3. Loop
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    handleInput();           // Process keyboard/mouse
    updatePlayer(dt);        // Move Bob, animate
    updateEnemies(dt);       // AI, movement, attacks
    updateCombat(dt);        // Damage calculations
    updateParticles(dt);     // Visual effects
    checkCollisions();       // Walls, doors, items
    checkGameOver();         // Death condition
}

function render() {
    clearCanvas();
    renderDungeon();         // Walls, floors, doors
    renderItems();           // Loot on ground
    renderEnemies();         // All enemies
    renderPlayer();          // Bob on top
    renderParticles();       // Effects overlay
    renderUI();              // HUD, health, inventory
}
```

---

## Core Systems Design

### 1. Player System (`player.js`)

```javascript
const player = {
    // State
    x: 0,
    y: 0,
    health: 100,
    maxHealth: 100,
    direction: 'south',
    isMoving: false,
    isAttacking: false,
    
    // Stats
    damage: 20,
    defense: 0,
    speed: 150, // pixels per second
    
    // Animation
    currentSprite: 'bob_idle',
    frameIndex: 0,
    frameTimer: 0,
    
    // Inventory
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    
    // Methods
    move(dx, dy, dt) { /* ... */ },
    attack() { /* ... */ },
    takeDamage(amount) { /* ... */ },
    heal(amount) { /* ... */ },
    pickupItem(item) { /* ... */ },
    animate(dt) { /* ... */ }
};
```

**Key Functions**:
- `movePlayer(dx, dy, dt)` - Update position, check collisions
- `animatePlayer(dt)` - Cycle through sprite frames
- `attackPlayer()` - Trigger attack animation, damage enemies
- `playerTakeDamage(amount)` - Reduce health, check death

---

### 2. Enemy System (`enemy.js`)

```javascript
const Enemy = {
    create(type, x, y) {
        return {
            id: generateId(),
            type: type,
            x: x,
            y: y,
            health: enemyData[type].health,
            maxHealth: enemyData[type].health,
            damage: enemyData[type].damage,
            speed: enemyData[type].speed,
            state: 'idle', // idle, chase, attack, dead
            direction: 'south',
            target: null,
            frameIndex: 0,
            frameTimer: 0
        };
    },
    
    update(enemy, dt) {
        switch(enemy.state) {
            case 'idle':
                // Random wander
                wanderAI(enemy, dt);
                // Check if player visible
                if (canSeePlayer(enemy)) {
                    enemy.state = 'chase';
                }
                break;
                
            case 'chase':
                // Move toward player
                chasePlayer(enemy, dt);
                // Check if close enough to attack
                if (distanceToPlayer(enemy) < 50) {
                    enemy.state = 'attack';
                }
                break;
                
            case 'attack':
                // Attack player
                attackPlayer(enemy);
                // Check if player too far
                if (distanceToPlayer(enemy) > 100) {
                    enemy.state = 'chase';
                }
                break;
        }
        animateEnemy(enemy, dt);
    }
};

// Enemy types (using BrowserQuest sprites)
const enemyData = {
    'goblin': {
        health: 30,
        damage: 10,
        speed: 120,
        sprite: 'enemies/goblin'
    },
    'skeleton': {
        health: 50,
        damage: 15,
        speed: 80,
        sprite: 'enemies/skeleton'
    },
    'orc': {
        health: 80,
        damage: 20,
        speed: 100,
        sprite: 'enemies/orc'
    },
    'griffin': {
        health: 60,
        damage: 18,
        speed: 150,
        sprite: 'enemies/griffin/adult'
    }
};
```

---

### 3. Dungeon Generation (`dungeon.js`)

```javascript
const Dungeon = {
    generate(floor) {
        const dungeon = {
            floor: floor,
            rooms: [],
            corridors: [],
            tiles: [], // 2D array
            width: 60,
            height: 60
        };
        
        // 1. Create rooms
        const numRooms = 5 + floor; // More rooms on deeper floors
        for (let i = 0; i < numRooms; i++) {
            const room = createRandomRoom();
            if (canPlaceRoom(dungeon, room)) {
                placeRoom(dungeon, room);
                dungeon.rooms.push(room);
            }
        }
        
        // 2. Connect rooms with corridors
        for (let i = 0; i < dungeon.rooms.length - 1; i++) {
            const corridor = connectRooms(
                dungeon.rooms[i],
                dungeon.rooms[i + 1]
            );
            dungeon.corridors.push(corridor);
        }
        
        // 3. Place stairs
        dungeon.startStairs = centerOf(dungeon.rooms[0]);
        dungeon.exitStairs = centerOf(dungeon.rooms[dungeon.rooms.length - 1]);
        
        // 4. Spawn enemies
        for (let i = 1; i < dungeon.rooms.length - 1; i++) {
            spawnEnemiesInRoom(dungeon, dungeon.rooms[i], floor);
        }
        
        // 5. Spawn items
        for (let room of dungeon.rooms) {
            if (Math.random() < 0.3) {
                spawnItemInRoom(dungeon, room, floor);
            }
        }
        
        return dungeon;
    }
};

// Simple room structure
function createRandomRoom() {
    return {
        x: randomInt(5, 55),
        y: randomInt(5, 55),
        width: randomInt(5, 12),
        height: randomInt(5, 12),
        type: randomChoice(['combat', 'combat', 'treasure', 'empty'])
    };
}
```

---

### 4. Combat System (`combat.js`)

```javascript
const Combat = {
    playerAttack() {
        if (player.isAttacking) return;
        
        player.isAttacking = true;
        player.currentSprite = `bob_atk_${player.direction}`;
        player.frameIndex = 0;
        
        // Find enemies in range
        const attackRange = 50; // pixels
        const hitEnemies = enemies.filter(enemy => {
            const dist = distance(player, enemy);
            return dist < attackRange && enemy.health > 0;
        });
        
        // Damage all enemies in range
        for (let enemy of hitEnemies) {
            const damage = player.damage + (player.equippedWeapon?.damage || 0);
            enemy.health -= damage;
            
            // Knockback
            const angle = angleBetween(player, enemy);
            enemy.x += Math.cos(angle) * 20;
            enemy.y += Math.sin(angle) * 20;
            
            // Death
            if (enemy.health <= 0) {
                enemy.state = 'dead';
                dropLoot(enemy);
            }
            
            // Visual feedback
            spawnDamageNumber(enemy.x, enemy.y, damage);
            spawnBloodParticles(enemy.x, enemy.y);
        }
        
        // Attack cooldown
        setTimeout(() => {
            player.isAttacking = false;
            player.currentSprite = player.isMoving ? `bob_walk_${player.direction}` : `bob_idle_${player.direction}`;
        }, 300);
    },
    
    enemyAttack(enemy) {
        if (enemy.attackCooldown > 0) return;
        
        // Check if player in range
        if (distance(enemy, player) > 50) return;
        
        // Damage player
        const damage = enemy.damage - (player.equippedArmor?.defense || 0);
        const actualDamage = Math.max(1, damage);
        player.health -= actualDamage;
        
        // Knockback player
        const angle = angleBetween(enemy, player);
        player.x += Math.cos(angle) * 15;
        player.y += Math.sin(angle) * 15;
        
        // Visual feedback
        screenShake(10);
        spawnDamageNumber(player.x, player.y - 30, actualDamage);
        flashScreen(255, 0, 0, 0.3);
        
        // Death check
        if (player.health <= 0) {
            gameOver();
        }
        
        enemy.attackCooldown = 1000; // 1 second cooldown
    }
};
```

---

### 5. Inventory System (`inventory.js`)

```javascript
const Inventory = {
    slots: 8,
    items: [],
    
    addItem(item) {
        if (this.items.length >= this.slots) {
            console.log('Inventory full!');
            return false;
        }
        this.items.push(item);
        return true;
    },
    
    removeItem(index) {
        return this.items.splice(index, 1)[0];
    },
    
    equipWeapon(index) {
        const item = this.items[index];
        if (item.type !== 'weapon') return;
        
        // Unequip current weapon
        if (player.equippedWeapon) {
            this.items.push(player.equippedWeapon);
        }
        
        // Equip new weapon
        player.equippedWeapon = this.removeItem(index);
        player.damage = 20 + player.equippedWeapon.damage;
    },
    
    equipArmor(index) {
        const item = this.items[index];
        if (item.type !== 'armor') return;
        
        // Unequip current armor
        if (player.equippedArmor) {
            this.items.push(player.equippedArmor);
        }
        
        // Equip new armor
        player.equippedArmor = this.removeItem(index);
        player.defense = player.equippedArmor.defense;
    },
    
    useItem(index) {
        const item = this.items[index];
        if (item.type === 'potion') {
            player.health = Math.min(player.health + item.healAmount, player.maxHealth);
            this.removeItem(index);
        }
    }
};

// Item definitions
const itemData = {
    'health_potion': {
        type: 'potion',
        name: 'Health Potion',
        healAmount: 30,
        sprite: 'items/potion/0.png'
    },
    'iron_sword': {
        type: 'weapon',
        name: 'Iron Sword',
        damage: 10,
        sprite: '1/item-sword1.png'
    },
    'leather_armor': {
        type: 'armor',
        name: 'Leather Armor',
        defense: 5,
        sprite: '1/item-leatherarmor.png'
    }
};
```

---

### 6. Sprite System (`sprites.js`)

```javascript
const Sprites = {
    images: {},
    animations: {},
    
    async load() {
        // Load BrowserQuest Bob animations
        await this.loadAnimation('bob_idle', 'player/bob_idle', 5);
        await this.loadAnimation('bob_walk_down', 'player/bob_walk_down', 4);
        await this.loadAnimation('bob_walk_up', 'player/bob_walk_up', 4);
        await this.loadAnimation('bob_walk_left', 'player/bob_walk_left', 4);
        await this.loadAnimation('bob_walk_right', 'player/bob_walk_right', 4);
        await this.loadAnimation('bob_atk_down', 'player/bob_atk_down', 3);
        await this.loadAnimation('bob_atk_up', 'player/bob_atk_up', 3);
        await this.loadAnimation('bob_atk_left', 'player/bob_atk_left', 3);
        await this.loadAnimation('bob_atk_right', 'player/bob_atk_right', 3);
        
        // Load enemy sprites
        await this.loadImage('goblin', '1/goblin.png');
        await this.loadImage('skeleton', '1/skeleton.png');
        await this.loadImage('orc', '1/ogre.png');
        await this.loadImage('griffin', 'enemies/griffin/adult/0.png');
        
        // Load items
        await this.loadImage('health_potion', 'items/potion/0.png');
        await this.loadImage('sword', '1/item-sword1.png');
        await this.loadImage('armor', '1/item-leatherarmor.png');
    },
    
    async loadAnimation(name, basePath, frameCount) {
        this.animations[name] = [];
        for (let i = 0; i < frameCount; i++) {
            const img = await this.loadImage(`${name}_${i}`, `master-sprites/${basePath}/${i}.png`);
            this.animations[name].push(img);
        }
    },
    
    async loadImage(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                resolve(img);
            };
            img.onerror = reject;
            img.src = path;
        });
    },
    
    draw(ctx, spriteName, x, y, frame = 0) {
        const animation = this.animations[spriteName];
        if (animation) {
            ctx.drawImage(animation[frame], x - 24, y - 24); // Center sprite
        } else {
            const img = this.images[spriteName];
            if (img) {
                ctx.drawImage(img, x - 24, y - 24);
            }
        }
    }
};
```

---

### 7. UI System (`ui.js`)

```javascript
const UI = {
    draw(ctx) {
        // Health bar
        this.drawHealthBar(ctx, 20, 20, 200, 20);
        
        // Floor number
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.fillText(`Floor ${currentFloor}`, canvas.width - 120, 30);
        
        // Equipped items
        this.drawEquippedWeapon(ctx, 20, canvas.height - 70);
        this.drawEquippedArmor(ctx, 90, canvas.height - 70);
        
        // Quick items
        this.drawQuickItems(ctx);
    },
    
    drawHealthBar(ctx, x, y, width, height) {
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);
        
        // Health
        const healthPercent = player.health / player.maxHealth;
        const healthWidth = width * healthPercent;
        
        // Color based on health
        if (healthPercent > 0.5) {
            ctx.fillStyle = '#4ade80'; // green
        } else if (healthPercent > 0.25) {
            ctx.fillStyle = '#facc15'; // yellow
        } else {
            ctx.fillStyle = '#ef4444'; // red
        }
        
        ctx.fillRect(x, y, healthWidth, height);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(`${Math.floor(player.health)}/${player.maxHealth}`, x + 10, y + 15);
    },
    
    drawInventory(ctx) {
        if (!showInventory) return;
        
        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Inventory panel
        const panelX = canvas.width / 2 - 200;
        const panelY = canvas.height / 2 - 200;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(panelX, panelY, 400, 400);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX, panelY, 400, 400);
        
        // Title
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText('INVENTORY', panelX + 120, panelY + 40);
        
        // Item grid (4x2)
        const slotSize = 80;
        const spacing = 20;
        for (let i = 0; i < 8; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const slotX = panelX + spacing + col * (slotSize + spacing);
            const slotY = panelY + 80 + row * (slotSize + spacing);
            
            // Slot background
            ctx.fillStyle = '#374151';
            ctx.fillRect(slotX, slotY, slotSize, slotSize);
            
            // Item
            if (Inventory.items[i]) {
                const item = Inventory.items[i];
                Sprites.draw(ctx, item.sprite, slotX + slotSize/2, slotY + slotSize/2);
            }
        }
    }
};
```

---

## File Structure

```
turtlegamebob/
├── index.html                  # Entry point, canvas setup
├── js/
│   ├── game.js                 # Main game loop, state management
│   ├── player.js               # Player movement, animation, combat
│   ├── enemy.js                # Enemy AI, types, behavior
│   ├── dungeon.js              # Procedural generation
│   ├── combat.js               # Combat calculations
│   ├── inventory.js            # Items, equipment
│   ├── sprites.js              # Sprite loading, drawing
│   ├── ui.js                   # HUD, menus
│   ├── input.js                # Keyboard/mouse handling
│   ├── utils.js                # Helper functions
│   └── particles.js            # Visual effects (optional)
├── css/
│   └── style.css               # Basic styling
├── master-sprites/             # All game sprites (1300 files)
└── README.md                   # How to run
```

---

## Data Flow

```
Input (keyboard) 
  → Input Handler 
  → Game State Update
  → Collision Detection
  → Combat Resolution
  → Animation Update
  → Render
  → Screen
```

---

## Performance Optimizations

### 1. Sprite Caching
- Load all sprites once at startup
- Cache in memory, no repeated loads

### 2. Culling
- Only update/render entities near player
- Skip off-screen enemies

### 3. Efficient Collision
- Grid-based spatial partitioning
- Only check nearby entities

### 4. Minimal DOM
- Single canvas element
- No DOM manipulation per frame

---

## Development Phases

### Phase 1: Core Loop (2-3 hours)
1. Set up canvas and game loop
2. Load and draw Bob sprite
3. Keyboard input → move Bob
4. Simple dungeon (just walls)
5. Camera follows Bob

### Phase 2: Combat (2-3 hours)
1. Add enemies (spawn, draw)
2. Simple AI (chase player)
3. Attack system (spacebar)
4. Damage numbers, health bars
5. Enemy death, loot drop

### Phase 3: Dungeon (2-3 hours)
1. Procedural room generation
2. Corridor connections
3. Multiple floors
4. Stairs (up/down)
5. Enemy spawning

### Phase 4: Items (2-3 hours)
1. Inventory system
2. Pickup items
3. Equip weapons/armor
4. Use potions
5. Item effects

### Phase 5: Polish (2-3 hours)
1. UI/HUD
2. Death screen
3. Screen effects
4. Balance tuning
5. Bug fixes

**Total: ~12-15 hours** for complete, playable game

---

## Testing Strategy

### Manual Testing:
- Play every build
- Check all systems work
- Feel the "fun factor"
- Fix what feels bad

### Edge Cases:
- Full inventory
- Zero health
- Empty rooms
- Impossible spawns
- Collision bugs

### Performance:
- 60 FPS minimum
- No memory leaks
- Smooth animations
- Fast loading

---

**Next Step: Break this plan into specific tasks (`tasks.md`)**


