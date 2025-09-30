/**
 * Map - Handles procedural map generation and tile management
 * Uses rot.js algorithms for dungeon generation
 */

import * as ROT from 'rot-js';
import { Tile } from './Tile';
import { EventBus } from '../events/EventBus';
import { Room } from './Room';
import { Position } from '../types/Position';

export class Map {
  private width: number = 80;
  private height: number = 40;
  private tiles: Tile[][] = [];
  private rooms: Room[] = [];
  private corridors: Position[][] = [];
  private startPosition: Position = { x: 0, y: 0 };
  private endPosition: Position = { x: 0, y: 0 };
  private explored: { [key: string]: boolean } = {};
  private eventBus: EventBus;
  private currentLevel: number = 1;
  
  // Algorithm options
  private algorithms = {
    'cellular': ROT.Map.Cellular,
    'digger': ROT.Map.Digger,
    'uniform': ROT.Map.Uniform,
    'rogue': ROT.Map.Rogue,
    'arena': ROT.Map.Arena,
    'divided': ROT.Map.DividedMaze
  };
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  /**
   * Generate a new level
   */
  public generateLevel(level: number): void {
    console.log(`🗺️ Generating level ${level}...`);
    
    // Store current level
    this.currentLevel = level;
    
    // Clear existing data
    this.tiles = [];
    this.rooms = [];
    this.corridors = [];
    this.explored = {};
    
    // Initialize tiles with walls
    this.initializeTiles();
    
    // Select algorithm based on level
    const algorithm = this.selectAlgorithm(level);
    
    // Generate dungeon
    this.generateDungeon(algorithm);
    
    // Place stairs
    this.placeStairs();
    
    // Place special features
    this.placeSpecialFeatures(level);
    
    // Emit level generated event
    this.eventBus.emit('level_generated', { level, map: this });
    
    console.log(`✅ Level ${level} generated with ${this.rooms.length} rooms`);
  }
  
  /**
   * Initialize all tiles as walls
   */
  private initializeTiles(): void {
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = new Tile('wall');
      }
    }
  }
  
  /**
   * Select generation algorithm based on level
   */
  private selectAlgorithm(level: number): string {
    // Different algorithms for different level ranges
    if (level <= 5) {
      return 'digger'; // Basic dungeon for early levels
    } else if (level <= 10) {
      return 'uniform'; // More uniform rooms for mid levels
    } else if (level <= 15) {
      return 'cellular'; // Cave-like for deeper levels
    } else if (level <= 20) {
      return 'divided'; // Maze-like for deep levels
    } else {
      // For very deep levels, randomly select between cellular and divided
      return Math.random() > 0.5 ? 'cellular' : 'divided';
    }
  }
  
  /**
   * Generate dungeon using rot.js algorithms
   */
  private generateDungeon(algorithmName: string): void {
    // Get algorithm constructor
    const Algorithm = this.algorithms[algorithmName] || this.algorithms['digger'];
    
    // Create algorithm instance
    const options: any = {};
    
    // Set algorithm-specific options
    switch (algorithmName) {
      case 'cellular':
        options.born = [5, 6, 7, 8];
        options.survive = [4, 5, 6, 7, 8];
        options.topology = 8;
        break;
      case 'digger':
        options.roomWidth = [3, 9];
        options.roomHeight = [3, 6];
        options.corridorLength = [2, 6];
        options.dugPercentage = 0.2;
        break;
      case 'uniform':
        options.roomWidth = [5, 10];
        options.roomHeight = [5, 8];
        break;
    }
    
    // Create generator
    const generator = new Algorithm(this.width, this.height, options);
    
    // Store rooms for digger and uniform algorithms
    if (algorithmName === 'digger' || algorithmName === 'uniform') {
      generator.create((x: number, y: number, value: number) => {
        // 0 = floor, 1 = wall
        if (value === 0) {
          this.tiles[y][x] = new Tile('floor');
        }
      });
      
      // Get rooms and corridors
      if ('getRooms' in generator) {
        const rooms = generator.getRooms();
        for (const room of rooms) {
          const { x1, y1, x2, y2 } = room as any;
          this.rooms.push(new Room(x1, y1, x2 - x1 + 1, y2 - y1 + 1));
        }
      }
      
      if ('getCorridors' in generator) {
        const corridors = generator.getCorridors();
        for (const corridor of corridors) {
          const { startX, startY, endX, endY } = corridor as any;
          this.corridors.push([
            { x: startX, y: startY },
            { x: endX, y: endY }
          ]);
        }
      }
    } else {
      // For cellular automata, we need to run several generations
      if (algorithmName === 'cellular') {
        generator.randomize(0.5);
        for (let i = 0; i < 5; i++) {
          generator.create();
        }
      }
      
      // Get the result
      generator.create((x: number, y: number, value: number) => {
        // 0 = floor, 1 = wall
        if (value === 0) {
          this.tiles[y][x] = new Tile('floor');
        }
      });
      
      // For cellular, find connected regions
      if (algorithmName === 'cellular') {
        this.findRoomsInCellular();
      }
    }
    
    // Set start position (first room center or random floor tile)
    if (this.rooms.length > 0) {
      const firstRoom = this.rooms[0];
      this.startPosition = {
        x: Math.floor(firstRoom.x + firstRoom.width / 2),
        y: Math.floor(firstRoom.y + firstRoom.height / 2)
      };
    } else {
      this.startPosition = this.getRandomFloorPosition();
    }
  }
  
  /**
   * Find rooms in cellular automata map
   */
  private findRoomsInCellular(): void {
    // Use connected components algorithm to find rooms
    const connected: { [key: string]: number } = {};
    let roomId = 0;
    
    // First pass: label all floor tiles with room IDs
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].isWalkable()) {
          const key = `${x},${y}`;
          
          // Check neighbors
          const neighbors = [
            `${x-1},${y}`, // left
            `${x-1},${y-1}`, // top-left
            `${x},${y-1}` // top
          ];
          
          let foundRoom = false;
          for (const neighbor of neighbors) {
            if (neighbor in connected) {
              connected[key] = connected[neighbor];
              foundRoom = true;
              break;
            }
          }
          
          // If no neighboring room, create a new one
          if (!foundRoom) {
            connected[key] = roomId++;
          }
        }
      }
    }
    
    // Second pass: merge rooms
    let changed = true;
    while (changed) {
      changed = false;
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (this.tiles[y][x].isWalkable()) {
            const key = `${x},${y}`;
            const roomId = connected[key];
            
            // Check all neighbors
            const neighbors = [
              `${x-1},${y}`, // left
              `${x+1},${y}`, // right
              `${x},${y-1}`, // top
              `${x},${y+1}`, // bottom
              `${x-1},${y-1}`, // top-left
              `${x+1},${y-1}`, // top-right
              `${x-1},${y+1}`, // bottom-left
              `${x+1},${y+1}` // bottom-right
            ];
            
            for (const neighbor of neighbors) {
              if (neighbor in connected && connected[neighbor] !== roomId) {
                // Merge rooms
                const oldId = connected[neighbor];
                for (const k in connected) {
                  if (connected[k] === oldId) {
                    connected[k] = roomId;
                  }
                }
                changed = true;
              }
            }
          }
        }
      }
    }
    
    // Count tiles in each room
    const roomSizes: { [key: number]: number } = {};
    for (const key in connected) {
      const roomId = connected[key];
      roomSizes[roomId] = (roomSizes[roomId] || 0) + 1;
    }
    
    // Find the largest room
    let largestRoomId = 0;
    let largestRoomSize = 0;
    for (const roomId in roomSizes) {
      if (roomSizes[roomId] > largestRoomSize) {
        largestRoomSize = roomSizes[roomId];
        largestRoomId = parseInt(roomId);
      }
    }
    
    // Keep only the largest room, turn other rooms into walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].isWalkable()) {
          const key = `${x},${y}`;
          if (connected[key] !== largestRoomId) {
            this.tiles[y][x] = new Tile('wall');
          }
        }
      }
    }
    
    // Create a single room object for the cellular map
    const bounds = this.findBounds();
    this.rooms.push(new Room(
      bounds.minX,
      bounds.minY,
      bounds.maxX - bounds.minX + 1,
      bounds.maxY - bounds.minY + 1
    ));
  }
  
  /**
   * Find the bounds of the walkable area
   */
  private findBounds(): { minX: number, minY: number, maxX: number, maxY: number } {
    let minX = this.width;
    let minY = this.height;
    let maxX = 0;
    let maxY = 0;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].isWalkable()) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    return { minX, minY, maxX, maxY };
  }
  
  /**
   * Place stairs to the next level
   */
  private placeStairs(): void {
    // Place stairs in the last room or a random floor tile
    if (this.rooms.length > 0) {
      const lastRoom = this.rooms[this.rooms.length - 1];
      this.endPosition = {
        x: Math.floor(lastRoom.x + lastRoom.width / 2),
        y: Math.floor(lastRoom.y + lastRoom.height / 2)
      };
    } else {
      this.endPosition = this.getRandomFloorPosition();
    }
    
    // Set the tile to stairs
    this.tiles[this.endPosition.y][this.endPosition.x] = new Tile('stairs');
  }
  
  /**
   * Place special features based on level
   */
  private placeSpecialFeatures(level: number): void {
    // Add special features based on level
    if (level % 5 === 0) {
      // Boss level - add special room
      this.placeBossRoom();
    }
    
    if (level % 3 === 0) {
      // Add treasure room
      this.placeTreasureRoom();
    }
    
    // Add environmental hazards
    this.placeHazards(level);
  }
  
  /**
   * Place a boss room
   */
  private placeBossRoom(): void {
    // Only if we have rooms
    if (this.rooms.length < 2) return;
    
    // Use the second to last room as boss room
    const bossRoomIndex = this.rooms.length - 2;
    const bossRoom = this.rooms[bossRoomIndex];
    
    // Mark the room as boss room
    bossRoom.setType('boss');
    
    // Add special floor tiles
    for (let y = bossRoom.y; y < bossRoom.y + bossRoom.height; y++) {
      for (let x = bossRoom.x; x < bossRoom.x + bossRoom.width; x++) {
        if (this.tiles[y][x].isWalkable()) {
          this.tiles[y][x] = new Tile('boss_floor');
        }
      }
    }
  }
  
  /**
   * Place a treasure room
   */
  private placeTreasureRoom(): void {
    // Only if we have rooms
    if (this.rooms.length < 3) return;
    
    // Pick a random room that's not the first or last
    const roomIndex = Math.floor(Math.random() * (this.rooms.length - 2)) + 1;
    const treasureRoom = this.rooms[roomIndex];
    
    // Mark the room as treasure room
    treasureRoom.setType('treasure');
    
    // Add special floor tiles
    for (let y = treasureRoom.y; y < treasureRoom.y + treasureRoom.height; y++) {
      for (let x = treasureRoom.x; x < treasureRoom.x + treasureRoom.width; x++) {
        if (this.tiles[y][x].isWalkable()) {
          this.tiles[y][x] = new Tile('treasure_floor');
        }
      }
    }
  }
  
  /**
   * Place environmental hazards
   */
  private placeHazards(level: number): void {
    // Different hazards based on level
    let hazardType = 'trap';
    let hazardChance = 0.02;
    
    if (level > 5) {
      hazardType = 'water';
      hazardChance = 0.03;
    }
    
    if (level > 10) {
      hazardType = 'lava';
      hazardChance = 0.04;
    }
    
    if (level > 15) {
      hazardType = 'void';
      hazardChance = 0.05;
    }
    
    // Place hazards
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].isWalkable() && Math.random() < hazardChance) {
          // Don't place hazards at start or end position
          if ((x === this.startPosition.x && y === this.startPosition.y) ||
              (x === this.endPosition.x && y === this.endPosition.y)) {
            continue;
          }
          
          // Don't place hazards in doorways
          if (this.isDoorway(x, y)) {
            continue;
          }
          
          this.tiles[y][x] = new Tile(hazardType);
        }
      }
    }
  }
  
  /**
   * Check if a position is a doorway
   */
  private isDoorway(x: number, y: number): boolean {
    // Count walkable neighbors
    let walkableCount = 0;
    let wallCount = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) {
          continue;
        }
        
        if (this.tiles[ny][nx].isWalkable()) {
          walkableCount++;
        } else {
          wallCount++;
        }
      }
    }
    
    // A doorway has both walkable tiles and walls around it
    return walkableCount > 0 && wallCount > 0 && (
      // Horizontal doorway
      (this.isWall(x - 1, y) && this.isWall(x + 1, y) && 
       this.isWalkable(x, y - 1) && this.isWalkable(x, y + 1)) ||
      // Vertical doorway
      (this.isWall(x, y - 1) && this.isWall(x, y + 1) && 
       this.isWalkable(x - 1, y) && this.isWalkable(x + 1, y))
    );
  }
  
  /**
   * Get a random position with a floor tile
   */
  private getRandomFloorPosition(): Position {
    const floorPositions: Position[] = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].isWalkable()) {
          floorPositions.push({ x, y });
        }
      }
    }
    
    if (floorPositions.length === 0) {
      // Fallback to center of map
      return { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };
    }
    
    return floorPositions[Math.floor(Math.random() * floorPositions.length)];
  }
  
  /**
   * Get the tile at a specific position
   */
  public getTile(x: number, y: number): Tile {
    // Check bounds
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return new Tile('wall');
    }
    
    return this.tiles[y][x];
  }
  
  /**
   * Check if a position is walkable
   */
  public isWalkable(x: number, y: number): boolean {
    return this.getTile(x, y).isWalkable();
  }
  
  /**
   * Check if a position is a wall
   */
  public isWall(x: number, y: number): boolean {
    return this.getTile(x, y).isWall();
  }
  
  /**
   * Get the start position
   */
  public getStartPosition(): Position {
    return { ...this.startPosition };
  }
  
  /**
   * Get the end position
   */
  public getEndPosition(): Position {
    return { ...this.endPosition };
  }
  
  /**
   * Get map dimensions
   */
  public getDimensions(): { width: number, height: number } {
    return { width: this.width, height: this.height };
  }
  
  /**
   * Get all rooms
   */
  public getRooms(): Room[] {
    return [...this.rooms];
  }
  
  /**
   * Mark a tile as explored
   */
  public setExplored(x: number, y: number): void {
    this.explored[`${x},${y}`] = true;
  }
  
  /**
   * Check if a tile has been explored
   */
  public isExplored(x: number, y: number): boolean {
    return this.explored[`${x},${y}`] === true;
  }
  
  /**
   * Serialize map data for saving
   */
  public serialize(): any {
    return {
      width: this.width,
      height: this.height,
      tiles: this.tiles.map(row => row.map(tile => tile.serialize())),
      rooms: this.rooms.map(room => room.serialize()),
      startPosition: this.startPosition,
      endPosition: this.endPosition,
      explored: this.explored,
      currentLevel: this.currentLevel
    };
  }
  
  /**
   * Deserialize map data for loading
   */
  public deserialize(data: any): void {
    this.width = data.width;
    this.height = data.height;
    this.tiles = data.tiles.map((row: any[]) => row.map((tileData: any) => {
      const tile = new Tile('wall');
      tile.deserialize(tileData);
      return tile;
    }));
    this.rooms = data.rooms.map((roomData: any) => {
      const room = new Room(0, 0, 0, 0);
      room.deserialize(roomData);
      return room;
    });
    this.startPosition = data.startPosition;
    this.endPosition = data.endPosition;
    this.explored = data.explored;
    this.currentLevel = data.currentLevel;
  }
}
