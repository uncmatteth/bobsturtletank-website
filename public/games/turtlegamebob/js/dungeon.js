// ============================================================================
// DUNGEON GENERATION & COLLISION
// Procedural generation, tiles, collision
// ============================================================================

const Dungeon = {
    width: 60,
    height: 60,
    tileSize: 32,
    tiles: [],
    rooms: [],
    currentFloor: 1,
    
    // Tile types
    WALL: 0,
    FLOOR: 1,
    DOOR: 2,
    STAIRS_DOWN: 3,
    
    generate(floor) {
        console.log(`🏰 Generating floor ${floor}...`);
        this.currentFloor = floor;
        this.tiles = [];
        this.rooms = [];
        
        // Initialize with walls
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = this.WALL;
            }
        }
        
        // Generate simple test room for now
        // TODO: Implement proper procedural generation
        this.generateSimpleRoom();
        
        // Spawn enemies
        this.spawnEnemies(floor);
        
        console.log(`✅ Floor ${floor} generated`);
    },
    
    generateSimpleRoom() {
        // Create a simple 30x30 room in center
        const roomX = 15;
        const roomY = 15;
        const roomW = 30;
        const roomH = 30;
        
        for (let y = roomY; y < roomY + roomH; y++) {
            for (let x = roomX; x < roomX + roomW; x++) {
                this.tiles[y][x] = this.FLOOR;
            }
        }
        
        this.rooms.push({ x: roomX, y: roomY, width: roomW, height: roomH });
        
        // Place stairs
        this.tiles[roomY + roomH - 2][roomX + Math.floor(roomW / 2)] = this.STAIRS_DOWN;
    },
    
    spawnEnemies(floor) {
        Enemy.clear();
        
        // Spawn enemies in rooms (except first room)
        const enemyCount = 3 + floor;
        for (let i = 0; i < enemyCount; i++) {
            const room = this.rooms[0]; // For now, just use first room
            if (room) {
                const x = (room.x + randomInt(2, room.width - 2)) * this.tileSize;
                const y = (room.y + randomInt(2, room.height - 2)) * this.tileSize;
                
                // Random enemy type
                const types = ['goblin', 'goblin', 'skeleton', 'orc'];
                const type = randomChoice(types);
                
                Enemy.spawn(type, x, y);
            }
        }
    },
    
    getTile(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return this.WALL;
        }
        
        return this.tiles[tileY][tileX];
    },
    
    canMoveTo(x, y) {
        const tile = this.getTile(x, y);
        return tile !== this.WALL;
    },
    
    render(ctx) {
        // Calculate visible tiles based on camera
        const camera = Game.camera;
        const startX = Math.max(0, Math.floor(camera.x / this.tileSize));
        const startY = Math.max(0, Math.floor(camera.y / this.tileSize));
        const endX = Math.min(this.width, Math.ceil((camera.x + Game.canvas.width) / this.tileSize));
        const endY = Math.min(this.height, Math.ceil((camera.y + Game.canvas.height) / this.tileSize));
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;
                
                // Draw tile
                switch (tile) {
                    case this.WALL:
                        ctx.fillStyle = '#1a1a2e';
                        break;
                    case this.FLOOR:
                        ctx.fillStyle = '#2a2a3e';
                        break;
                    case this.STAIRS_DOWN:
                        ctx.fillStyle = '#4a4a5e';
                        break;
                }
                
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                
                // Draw grid (debug)
                if (Game.debugMode) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
    }
};

