// Room-based dungeon generator

import { TILES, GAME_CONFIG } from '../config/Constants.js';

export class RoomBasedGenerator {
    static generateMap(width, height, depth) {
        // Generating map for current depth
        
        const map = new Array(width);
        for (let i = 0; i < width; i++) {
            map[i] = new Array(height).fill(TILES.VOID);
        }
        
        const rooms = [];
        // Starting room generation
        
        // Generate rooms
        for (let attempt = 0; attempt < GAME_CONFIG.MAX_ROOMS * 3; attempt++) {
            const roomWidth = Math.floor(Math.random() * (GAME_CONFIG.ROOM_MAX_SIZE - GAME_CONFIG.ROOM_MIN_SIZE)) + GAME_CONFIG.ROOM_MIN_SIZE;
            const roomHeight = Math.floor(Math.random() * (GAME_CONFIG.ROOM_MAX_SIZE - GAME_CONFIG.ROOM_MIN_SIZE)) + GAME_CONFIG.ROOM_MIN_SIZE;
            const roomX = Math.floor(Math.random() * (width - roomWidth - 2)) + 1;
            const roomY = Math.floor(Math.random() * (height - roomHeight - 2)) + 1;
            
            const newRoom = {
                x: roomX,
                y: roomY,
                width: roomWidth,
                height: roomHeight,
                centerX: roomX + Math.floor(roomWidth / 2),
                centerY: roomY + Math.floor(roomHeight / 2)
            };
            
            // Check for overlap
            let overlaps = false;
            for (const room of rooms) {
                if (this.roomsOverlap(newRoom, room)) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps && rooms.length < GAME_CONFIG.MAX_ROOMS) {
                this.carveRoom(map, newRoom);
                rooms.push(newRoom);
                
                // Connect to previous room
                if (rooms.length > 1) {
                    this.connectRooms(map, rooms[rooms.length - 2], newRoom);
                }
            }
        }
        
        // Add walls around floors
        this.addWalls(map, width, height);
        
        // Add water features based on depth
        this.addWaterFeatures(map, rooms, depth);
        
        // Add treasure rooms on deeper levels
        if (depth >= 3) {
            this.addTreasureRooms(map, rooms);
        }
        
        // Add merchant rooms occasionally
        if (depth >= 2 && Math.random() < 0.3) {
            this.addMerchantRoom(map, rooms);
        }
        
        // Generated rooms for current depth
        return { map, rooms };
    }
    
    static roomsOverlap(room1, room2) {
        return !(room1.x + room1.width + 1 < room2.x || 
                room2.x + room2.width + 1 < room1.x || 
                room1.y + room1.height + 1 < room2.y || 
                room2.y + room2.height + 1 < room1.y);
    }
    
    static carveRoom(map, room) {
        for (let x = room.x; x < room.x + room.width; x++) {
            for (let y = room.y; y < room.y + room.height; y++) {
                map[x][y] = TILES.FLOOR;
            }
        }
    }
    
    static connectRooms(map, room1, room2) {
        let x = room1.centerX;
        let y = room1.centerY;
        
        // Carve L-shaped corridor
        while (x !== room2.centerX) {
            map[x][y] = TILES.FLOOR;
            x += x < room2.centerX ? 1 : -1;
        }
        
        while (y !== room2.centerY) {
            map[x][y] = TILES.FLOOR;
            y += y < room2.centerY ? 1 : -1;
        }
    }
    
    static addWalls(map, width, height) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (map[x][y] === TILES.VOID) {
                    // Check if adjacent to floor
                    let adjacentToFloor = false;
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                if (map[nx][ny] === TILES.FLOOR) {
                                    adjacentToFloor = true;
                                    break;
                                }
                            }
                        }
                        if (adjacentToFloor) break;
                    }
                    
                    if (adjacentToFloor) {
                        map[x][y] = TILES.WALL;
                    }
                }
            }
        }
    }
    
    static addWaterFeatures(map, rooms, depth) {
        // Most rooms are flooded - this is an underwater dungeon!
        const floodedRooms = Math.floor(rooms.length * 0.7); // 70% of rooms flooded
        const airPocketRooms = Math.min(2, Math.floor(rooms.length * 0.3)); // 30% have air pockets
        
        // Flood most rooms
        for (let i = 0; i < floodedRooms; i++) {
            const room = rooms[i];
            
            // Flood entire room with varying depths
            for (let x = room.x; x < room.x + room.width; x++) {
                for (let y = room.y; y < room.y + room.height; y++) {
                    if (map[x][y] === TILES.FLOOR) {
                        // Random mix of water depths
                        map[x][y] = Math.random() < 0.3 ? TILES.DEEP_WATER : TILES.WATER;
                    }
                }
            }
        }
        
        // Add air pockets in some rooms (safe zones)
        for (let i = floodedRooms; i < floodedRooms + airPocketRooms; i++) {
            const room = rooms[i] || rooms[Math.floor(Math.random() * rooms.length)];
            
            // Add air pocket in center of room
            const centerX = room.centerX;
            const centerY = room.centerY;
            
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const x = centerX + dx;
                    const y = centerY + dy;
                    if (x >= room.x && x < room.x + room.width && 
                        y >= room.y && y < room.y + room.height) {
                        if (map[x][y] === TILES.FLOOR) {
                            map[x][y] = TILES.AIR_POCKET;
                        }
                    }
                }
            }
        }
    }
    
    static addTreasureRooms(map, rooms) {
        if (rooms.length < 3) return;
        
        // Don't use the first room (where player spawns) for treasure
        const eligibleRooms = rooms.slice(1);
        if (eligibleRooms.length === 0) return;
        
        const treasureRoom = eligibleRooms[Math.floor(Math.random() * eligibleRooms.length)];
        
        // Make it a special treasure room
        for (let x = treasureRoom.x; x < treasureRoom.x + treasureRoom.width; x++) {
            for (let y = treasureRoom.y; y < treasureRoom.y + treasureRoom.height; y++) {
                if (map[x][y] === TILES.FLOOR) {
                    map[x][y] = TILES.TREASURE_FLOOR;
                }
            }
        }
        
        // Mark the room as a treasure room for later reference
        treasureRoom.isTreasureRoom = true;
    }
    
    static addMerchantRoom(map, rooms) {
        if (rooms.length < 2) return;
        
        // Don't use the first room (where player spawns) or treasure rooms
        const eligibleRooms = rooms.slice(1).filter(room => !room.isTreasureRoom);
        if (eligibleRooms.length === 0) return;
        
        const merchantRoom = eligibleRooms[Math.floor(Math.random() * eligibleRooms.length)];
        
        // Mark the room as a merchant room for later reference
        merchantRoom.isMerchantRoom = true;
        
        // Place merchant in center of room
        const centerX = Math.floor(merchantRoom.x + merchantRoom.width / 2);
        const centerY = Math.floor(merchantRoom.y + merchantRoom.height / 2);
        merchantRoom.merchantX = centerX;
        merchantRoom.merchantY = centerY;
    }
    
    static placeStairs(map, rooms) {
        if (rooms.length === 0) return null;
        
        const stairRoom = rooms[rooms.length - 1]; // Last room
        const stairX = stairRoom.centerX;
        const stairY = stairRoom.centerY;
        
        map[stairX][stairY] = TILES.STAIRS_DOWN;
        return { x: stairX, y: stairY };
    }

    static findPlayerSpawnPosition(rooms) {
        if (rooms.length === 0) {
            return { x: 1, y: 1 };
        }
        
        // Spawn in first room, but not in treasure room
        let spawnRoom = rooms[0];
        
        // If first room is treasure room, find another
        if (spawnRoom.isTreasureRoom) {
            for (let i = 1; i < rooms.length; i++) {
                if (!rooms[i].isTreasureRoom) {
                    spawnRoom = rooms[i];
                    break;
                }
            }
        }
        
        return {
            x: spawnRoom.centerX,
            y: spawnRoom.centerY
        };
    }

    // Utility methods for game logic
    static isValidPosition(map, x, y) {
        if (!map || x < 0 || y < 0 || x >= map.length || y >= map[0].length) {
            return false;
        }
        
        const tileType = map[x][y];
        return tileType === TILES.FLOOR || 
               tileType === TILES.WATER || 
               tileType === TILES.DEEP_WATER || 
               tileType === TILES.AIR_POCKET || 
               tileType === TILES.TREASURE_FLOOR ||
               tileType === TILES.STAIRS_DOWN;
    }

    static getTileType(map, x, y) {
        if (!map || x < 0 || y < 0 || x >= map.length || y >= map[0].length) {
            return TILES.VOID;
        }
        return map[x][y];
    }
}