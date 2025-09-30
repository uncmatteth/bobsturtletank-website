/**
 * DungeonGenerator - Creates procedural dungeons using rot.js
 */

import * as ROT from 'rot-js';
import Phaser from 'phaser';

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  connections: Room[];
  type: RoomType;
}

export enum RoomType {
  NORMAL = 'normal',
  ENTRANCE = 'entrance',
  EXIT = 'exit',
  TREASURE = 'treasure',
  BOSS = 'boss',
  SHOP = 'shop',
  SHRINE = 'shrine',
  SECRET = 'secret'
}

export interface Corridor {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface DungeonFloor {
  width: number;
  height: number;
  tiles: number[][];
  rooms: Room[];
  corridors: Corridor[];
  entrance: { x: number; y: number };
  exit: { x: number; y: number };
  floorNumber: number;
  environmentType: string;
}

export class DungeonGenerator {
  private tileSize: number = 32;
  private minRoomSize: number = 5;
  private maxRoomSize: number = 15;
  private roomAttempts: number = 500;
  private corridorWidth: number = 2;
  
  constructor(private scene: Phaser.Scene) {}
  
  /**
   * Generate a new dungeon floor
   */
  public generateFloor(floorNumber: number, width: number = 80, height: number = 60): DungeonFloor {
    console.log(`🏰 Generating floor ${floorNumber} (${width}x${height})`);
    
    // Initialize tiles array
    const tiles: number[][] = Array(height).fill(0).map(() => Array(width).fill(1)); // 1 = wall
    
    // Create a new dungeon using ROT.js
    const digger = new ROT.Map.Digger(width, height, {
      roomWidth: [this.minRoomSize, this.maxRoomSize],
      roomHeight: [this.minRoomSize, this.maxRoomSize],
      corridorLength: [3, 10],
      dugPercentage: 0.2
    });
    
    // Get rooms and corridors
    const rooms: Room[] = [];
    const corridors: Corridor[] = [];
    
    // Process rooms
    digger.getRooms().forEach((rotRoom) => {
      const room: Room = {
        x: rotRoom.getLeft(),
        y: rotRoom.getTop(),
        width: rotRoom.getRight() - rotRoom.getLeft() + 1,
        height: rotRoom.getBottom() - rotRoom.getTop() + 1,
        centerX: Math.floor(rotRoom.getLeft() + (rotRoom.getRight() - rotRoom.getLeft()) / 2),
        centerY: Math.floor(rotRoom.getTop() + (rotRoom.getBottom() - rotRoom.getTop()) / 2),
        connections: [],
        type: RoomType.NORMAL
      };
      
      rooms.push(room);
      
      // Carve out the room
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            tiles[y][x] = 0; // 0 = floor
          }
        }
      }
    });
    
    // Process corridors
    digger.getCorridors().forEach((corridor) => {
      const startX = corridor._startX;
      const startY = corridor._startY;
      const endX = corridor._endX;
      const endY = corridor._endY;
      
      corridors.push({
        startX,
        startY,
        endX,
        endY
      });
      
      // Carve out the corridor
      const points = [];
      new ROT.Path.Dijkstra(endX, endY, (x, y) => {
        return (x >= 0 && y >= 0 && x < width && y < height);
      }).compute(startX, startY, (x, y) => {
        points.push({ x, y });
      });
      
      // Make corridors wider
      points.forEach(point => {
        for (let dy = -Math.floor(this.corridorWidth / 2); dy <= Math.floor(this.corridorWidth / 2); dy++) {
          for (let dx = -Math.floor(this.corridorWidth / 2); dx <= Math.floor(this.corridorWidth / 2); dx++) {
            const nx = point.x + dx;
            const ny = point.y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              tiles[ny][nx] = 0; // 0 = floor
            }
          }
        }
      });
    });
    
    // Assign special room types
    this.assignRoomTypes(rooms, floorNumber);
    
    // Find entrance and exit
    const entranceRoom = rooms.find(room => room.type === RoomType.ENTRANCE);
    const exitRoom = rooms.find(room => room.type === RoomType.EXIT);
    
    const entrance = entranceRoom 
      ? { x: entranceRoom.centerX, y: entranceRoom.centerY } 
      : { x: rooms[0].centerX, y: rooms[0].centerY };
    
    const exit = exitRoom 
      ? { x: exitRoom.centerX, y: exitRoom.centerY } 
      : { x: rooms[rooms.length - 1].centerX, y: rooms[rooms.length - 1].centerY };
    
    // Determine environment type based on floor number
    const environmentType = this.getEnvironmentType(floorNumber);
    
    return {
      width,
      height,
      tiles,
      rooms,
      corridors,
      entrance,
      exit,
      floorNumber,
      environmentType
    };
  }
  
  /**
   * Assign room types based on floor number
   */
  private assignRoomTypes(rooms: Room[], floorNumber: number): void {
    if (rooms.length < 2) return;
    
    // Entrance room is always the first room
    rooms[0].type = RoomType.ENTRANCE;
    
    // Exit room is always the last room (furthest from entrance)
    rooms[rooms.length - 1].type = RoomType.EXIT;
    
    // Boss room if floor is multiple of 10
    if (floorNumber % 10 === 0) {
      // Find a large room for the boss
      const largeRooms = rooms
        .filter(room => room.type === RoomType.NORMAL && room.width >= 10 && room.height >= 10)
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));
      
      if (largeRooms.length > 0) {
        largeRooms[0].type = RoomType.BOSS;
      }
    }
    
    // Add treasure rooms (10% of rooms)
    const treasureRoomCount = Math.max(1, Math.floor(rooms.length * 0.1));
    let treasureRoomsAdded = 0;
    
    while (treasureRoomsAdded < treasureRoomCount) {
      const randomIndex = Math.floor(Math.random() * rooms.length);
      const room = rooms[randomIndex];
      
      if (room.type === RoomType.NORMAL) {
        room.type = RoomType.TREASURE;
        treasureRoomsAdded++;
      }
    }
    
    // Add shop room if floor is multiple of 5 but not 10
    if (floorNumber % 5 === 0 && floorNumber % 10 !== 0) {
      const normalRooms = rooms.filter(room => room.type === RoomType.NORMAL);
      
      if (normalRooms.length > 0) {
        const randomIndex = Math.floor(Math.random() * normalRooms.length);
        normalRooms[randomIndex].type = RoomType.SHOP;
      }
    }
    
    // Add shrine room (5% chance per floor)
    if (Math.random() < 0.05) {
      const normalRooms = rooms.filter(room => room.type === RoomType.NORMAL);
      
      if (normalRooms.length > 0) {
        const randomIndex = Math.floor(Math.random() * normalRooms.length);
        normalRooms[randomIndex].type = RoomType.SHRINE;
      }
    }
    
    // Add secret room (10% chance per floor)
    if (Math.random() < 0.1) {
      const normalRooms = rooms.filter(room => room.type === RoomType.NORMAL);
      
      if (normalRooms.length > 0) {
        const randomIndex = Math.floor(Math.random() * normalRooms.length);
        normalRooms[randomIndex].type = RoomType.SECRET;
      }
    }
  }
  
  /**
   * Get environment type based on floor number
   */
  private getEnvironmentType(floorNumber: number): string {
    if (floorNumber <= 10) {
      return 'shallow';
    } else if (floorNumber <= 20) {
      return 'deep';
    } else if (floorNumber <= 30) {
      return 'abyss';
    } else if (floorNumber <= 40) {
      return 'volcanic';
    } else if (floorNumber <= 50) {
      return 'frozen';
    } else if (floorNumber <= 60) {
      return 'crystal';
    } else {
      return 'void';
    }
  }
  
  /**
   * Create a tilemap from a dungeon floor
   */
  public createTilemap(floor: DungeonFloor): Phaser.Tilemaps.Tilemap {
    // Create the tilemap
    const tilemap = this.scene.make.tilemap({
      width: floor.width,
      height: floor.height,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize
    });
    
    // Add tileset
    const tilesetKey = this.scene.textures.exists('dungeon_tileset') 
      ? 'dungeon_tileset' 
      : 'placeholder_hero';
    
    const tileset = tilemap.addTilesetImage('dungeon_tiles', tilesetKey);
    
    // Create layers
    const groundLayer = tilemap.createBlankLayer('ground', tileset);
    const wallLayer = tilemap.createBlankLayer('walls', tileset);
    const objectLayer = tilemap.createBlankLayer('objects', tileset);
    
    // Fill ground layer with floor tiles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        if (floor.tiles[y][x] === 0) { // Floor
          groundLayer?.putTileAt(0, x, y);
        }
      }
    }
    
    // Fill wall layer with wall tiles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        if (floor.tiles[y][x] === 1) { // Wall
          // Determine wall type based on surrounding tiles
          let wallType = 1; // Default wall
          
          // Check if it's a corner or edge
          const hasNorth = y > 0 && floor.tiles[y - 1][x] === 1;
          const hasSouth = y < floor.height - 1 && floor.tiles[y + 1][x] === 1;
          const hasEast = x < floor.width - 1 && floor.tiles[y][x + 1] === 1;
          const hasWest = x > 0 && floor.tiles[y][x - 1] === 1;
          
          if (hasNorth && hasSouth && hasEast && hasWest) {
            wallType = 1; // Full wall
          } else if (!hasNorth && hasSouth && hasEast && hasWest) {
            wallType = 2; // North edge
          } else if (hasNorth && !hasSouth && hasEast && hasWest) {
            wallType = 3; // South edge
          } else if (hasNorth && hasSouth && !hasEast && hasWest) {
            wallType = 4; // East edge
          } else if (hasNorth && hasSouth && hasEast && !hasWest) {
            wallType = 5; // West edge
          } else {
            wallType = 6; // Corner or isolated wall
          }
          
          wallLayer?.putTileAt(wallType, x, y);
        }
      }
    }
    
    // Add special objects
    floor.rooms.forEach(room => {
      if (room.type === RoomType.ENTRANCE) {
        objectLayer?.putTileAt(10, room.centerX, room.centerY); // Entrance tile
      } else if (room.type === RoomType.EXIT) {
        objectLayer?.putTileAt(11, room.centerX, room.centerY); // Exit tile
      } else if (room.type === RoomType.BOSS) {
        objectLayer?.putTileAt(12, room.centerX, room.centerY); // Boss marker
      } else if (room.type === RoomType.TREASURE) {
        objectLayer?.putTileAt(13, room.centerX, room.centerY); // Treasure chest
      } else if (room.type === RoomType.SHOP) {
        objectLayer?.putTileAt(14, room.centerX, room.centerY); // Shop marker
      } else if (room.type === RoomType.SHRINE) {
        objectLayer?.putTileAt(15, room.centerX, room.centerY); // Shrine marker
      }
    });
    
    // Set collisions for wall layer
    wallLayer?.setCollisionByExclusion([-1]);
    
    return tilemap;
  }
}





