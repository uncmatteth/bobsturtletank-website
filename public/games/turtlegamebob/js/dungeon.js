// ============================================================================
// DUNGEON GENERATION & COLLISION
// Procedural generation with multiple rooms and corridors
// ============================================================================

const Dungeon = {
    width: 80,
    height: 80,
    tileSize: 32,
    tiles: [],
    rooms: [],
    currentFloor: 1,
    stairsPos: null,
    
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
        this.stairsPos = null;
        
        // Initialize with walls
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = this.WALL;
            }
        }
        
        // Generate rooms
        const roomCount = 5 + Math.floor(floor / 2); // More rooms on higher floors
        this.generateRooms(roomCount);
        
        // Connect rooms with corridors
        this.connectRooms();
        
        // Place stairs in last room
        const lastRoom = this.rooms[this.rooms.length - 1];
        const stairsX = lastRoom.x + Math.floor(lastRoom.width / 2);
        const stairsY = lastRoom.y + Math.floor(lastRoom.height / 2);
        this.tiles[stairsY][stairsX] = this.STAIRS_DOWN;
        this.stairsPos = { x: stairsX, y: stairsY };
        
        // Spawn enemies (not in first room)
        this.spawnEnemies(floor);
        
        console.log(`✅ Floor ${floor} generated: ${this.rooms.length} rooms`);
    },
    
    generateRooms(count) {
        const minSize = 8;
        const maxSize = 15;
        const padding = 3;
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let placed = false;
            
            while (!placed && attempts < 50) {
                attempts++;
                
                // Random room size
                const width = randomInt(minSize, maxSize);
                const height = randomInt(minSize, maxSize);
                
                // Random position
                const x = randomInt(padding, this.width - width - padding);
                const y = randomInt(padding, this.height - height - padding);
                
                // Check if overlaps with existing rooms
                let overlaps = false;
                for (const room of this.rooms) {
                    if (this.roomsOverlap(
                        { x, y, width, height },
                        { x: room.x - padding, y: room.y - padding, width: room.width + padding * 2, height: room.height + padding * 2 }
                    )) {
                        overlaps = true;
                        break;
                    }
                }
                
                if (!overlaps) {
                    // Carve out the room
                    for (let ry = y; ry < y + height; ry++) {
                        for (let rx = x; rx < x + width; rx++) {
                            this.tiles[ry][rx] = this.FLOOR;
                        }
                    }
                    
                    this.rooms.push({ x, y, width, height, center: { x: x + Math.floor(width / 2), y: y + Math.floor(height / 2) } });
                    placed = true;
                }
            }
        }
    },
    
    roomsOverlap(r1, r2) {
        return !(r1.x + r1.width < r2.x || r1.x > r2.x + r2.width ||
                 r1.y + r1.height < r2.y || r1.y > r2.y + r2.height);
    },
    
    connectRooms() {
        // Connect each room to the next with L-shaped corridor
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];
            
            // Random L-corridor (horizontal then vertical, or vertical then horizontal)
            if (Math.random() > 0.5) {
                // Horizontal first
                this.carveHorizontalCorridor(roomA.center.x, roomB.center.x, roomA.center.y);
                this.carveVerticalCorridor(roomA.center.y, roomB.center.y, roomB.center.x);
            } else {
                // Vertical first
                this.carveVerticalCorridor(roomA.center.y, roomB.center.y, roomA.center.x);
                this.carveHorizontalCorridor(roomA.center.x, roomB.center.x, roomB.center.y);
            }
        }
    },
    
    carveHorizontalCorridor(x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        
        for (let x = startX; x <= endX; x++) {
            if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                this.tiles[y][x] = this.FLOOR;
            }
        }
    },
    
    carveVerticalCorridor(y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        for (let y = startY; y <= endY; y++) {
            if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                this.tiles[y][x] = this.FLOOR;
            }
        }
    },
    
    spawnEnemies(floor) {
        Enemy.clear();
        
        // Spawn enemies in rooms (skip first room where player starts)
        const enemyRooms = this.rooms.slice(1); // Skip first room
        const enemiesPerRoom = 1 + Math.floor(floor / 2); // More enemies on higher floors
        
        for (const room of enemyRooms) {
            const count = randomInt(enemiesPerRoom, enemiesPerRoom + 2);
            
            for (let i = 0; i < count; i++) {
                // Random position in room
                const x = (room.x + randomInt(2, room.width - 2)) * this.tileSize;
                const y = (room.y + randomInt(2, room.height - 2)) * this.tileSize;
                
                // Random enemy type (more variety on higher floors)
                let type;
                if (floor === 1) {
                    type = 'goblin'; // Easy floor
                } else if (floor < 3) {
                    type = randomChoice(['goblin', 'goblin', 'skeleton']); // Mostly goblins
                } else if (floor < 5) {
                    type = randomChoice(['goblin', 'skeleton', 'skeleton']); // More skeletons
                } else {
                    type = randomChoice(['goblin', 'skeleton', 'orc']); // All types
                }
                
                Enemy.spawn(type, x, y);
            }
        }
        
        console.log(`  Spawned ${Enemy.list.length} enemies`);
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
    
    isOnStairs(x, y) {
        if (!this.stairsPos) return false;
        
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        return tileX === this.stairsPos.x && tileY === this.stairsPos.y;
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
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        // Wall edges
                        ctx.fillStyle = '#0a0a1e';
                        ctx.fillRect(screenX, screenY, this.tileSize, 2);
                        ctx.fillRect(screenX, screenY, 2, this.tileSize);
                        break;
                    case this.FLOOR:
                        ctx.fillStyle = '#2a2a3e';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        // Floor pattern
                        if ((x + y) % 2 === 0) {
                            ctx.fillStyle = '#25253a';
                            ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        }
                        break;
                    case this.STAIRS_DOWN:
                        ctx.fillStyle = '#4a4a5e';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        // Draw stairs symbol
                        ctx.fillStyle = '#00d4ff';
                        ctx.font = 'bold 24px monospace';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('▼', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
                        break;
                }
                
                // Debug grid
                if (Game.debugMode) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
    }
};
