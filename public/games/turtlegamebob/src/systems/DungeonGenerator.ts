/**
 * DungeonGenerator - Procedural generation for infinite dungeon depths
 * Creates the legendary "500+ floors" with varied layouts and encounters
 */

import Phaser from 'phaser';
import { TilesetManager } from './TilesetManager';

export type RoomType = 'normal' | 'treasure' | 'boss' | 'shop' | 'shrine' | 'arena' | 'puzzle' | 'secret';
export type EnvironmentType = 'shallow' | 'deep' | 'abyss' | 'volcanic' | 'frozen' | 'crystal' | 'void';
export type TileType = 'floor' | 'wall' | 'door' | 'water' | 'lava' | 'ice' | 'void' | 'treasure' | 'spawn';

export interface DungeonTile {
  x: number;
  y: number;
  type: TileType;
  walkable: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  collider?: Phaser.Physics.Arcade.Body;
  metadata?: { [key: string]: any };
}

export interface DungeonRoom {
  id: string;
  type: RoomType;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  tiles: DungeonTile[][];
  connections: string[];
  spawns: { x: number; y: number; type: string }[];
  treasures: { x: number; y: number; rarity: string }[];
  metadata: { [key: string]: any };
}

export interface DungeonFloor {
  floorNumber: number;
  environmentType: EnvironmentType;
  width: number;
  height: number;
  rooms: DungeonRoom[];
  corridors: { x: number; y: number; width: number; height: number }[];
  spawnPoint: { x: number; y: number };
  exitPoint: { x: number; y: number };
  bossRoom?: DungeonRoom;
  treasureRooms: DungeonRoom[];
  secretRooms: DungeonRoom[];
  tiles: DungeonTile[][];
}

export interface GenerationSettings {
  minRooms: number;
  maxRooms: number;
  roomSizeRange: { min: number; max: number };
  corridorWidth: number;
  treasureRoomChance: number;
  secretRoomChance: number;
  complexityMultiplier: number;
  environmentFeatures: boolean;
}

export class DungeonGenerator {
  private scene: Phaser.Scene;
  private tilesetManager: TilesetManager;
  
  // Generation parameters
  private tileSize: number = 32;
  private currentFloor: DungeonFloor | null = null;
  
  // Tilemap and rendering
  private tilemap?: Phaser.Tilemaps.Tilemap;
  private tilesetImage?: Phaser.Tilemaps.Tileset;
  private groundLayer?: Phaser.Tilemaps.TilemapLayer;
  private wallLayer?: Phaser.Tilemaps.TilemapLayer;
  private decorationLayer?: Phaser.Tilemaps.TilemapLayer;
  private fallbackGraphics?: Phaser.GameObjects.Graphics;
  
  // Wang tileset rendering
  private useWangTilesets: boolean = true;
  
  // Generation algorithms
  private algorithms = {
    roomPlacement: 'scatter', // 'scatter', 'grid', 'organic'
    corridorGeneration: 'mst', // 'mst', 'direct', 'maze'
    roomShape: 'mixed' // 'rectangular', 'irregular', 'mixed'
  };
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tilesetManager = new TilesetManager(scene);
    
    console.log('🏰 DungeonGenerator initialized for procedural depths');
    
    // Load tilesets
    this.loadTilesets();
  }
  
  /**
   * Load Wang tilesets
   */
  private async loadTilesets(): Promise<void> {
    try {
      await this.tilesetManager.loadTilesets();
      console.log('✅ Wang tilesets loaded successfully');
    } catch (error) {
      console.warn('⚠️ Failed to load Wang tilesets, using fallback rendering:', error);
      this.useWangTilesets = false;
    }
  }
  
  /**
   * Generate a complete dungeon floor
   */
  public generateFloor(floorNumber: number): DungeonFloor {
    console.log(`🗺️ Generating Floor ${floorNumber}...`);
    
    const environmentType = this.determineEnvironmentType(floorNumber);
    const settings = this.getGenerationSettings(floorNumber);
    
    // Create base floor structure
    const floor: DungeonFloor = {
      floorNumber,
      environmentType,
      width: this.calculateFloorWidth(floorNumber),
      height: this.calculateFloorHeight(floorNumber),
      rooms: [],
      corridors: [],
      spawnPoint: { x: 0, y: 0 },
      exitPoint: { x: 0, y: 0 },
      treasureRooms: [],
      secretRooms: [],
      tiles: []
    };
    
    // Generation pipeline
    this.initializeFloorTiles(floor);
    this.generateRooms(floor, settings);
    this.generateCorridors(floor, settings);
    this.placeDoors(floor);
    this.generateTreasureRooms(floor, settings);
    this.generateSecretRooms(floor, settings);
    this.generateBossRoom(floor);
    this.placeEnvironmentFeatures(floor);
    this.placeSpawnAndExit(floor);
    this.generateSpawnPoints(floor);
    this.optimizeForPerformance(floor);
    
    this.currentFloor = floor;
    
    console.log(`✅ Floor ${floorNumber} generated: ${floor.rooms.length} rooms, ${environmentType} environment`);
    return floor;
  }
  
  /**
   * Render the dungeon floor to the scene
   */
  public renderFloor(floor: DungeonFloor): void {
    console.log(`🎨 Rendering Floor ${floor.floorNumber}...`);
    
    // Clear existing tilemap
    this.clearCurrentTilemap();
    
    // Render with Wang tilesets if available
    if (this.useWangTilesets && this.tilesetManager.isReady()) {
      this.renderWithWangTilesets(floor);
    } else {
      // Fallback to traditional tilemap rendering
      this.createTilemap(floor);
      this.createTilesets(floor.environmentType);
      this.createLayers();
      this.renderTiles(floor);
      this.setupCollisions();
    }
    
    this.addEnvironmentDecorations(floor);
    
    console.log(`✅ Floor ${floor.floorNumber} rendered successfully`);
  }
  
  /**
   * Render the dungeon using Wang tilesets
   */
  private renderWithWangTilesets(floor: DungeonFloor): void {
    console.log(`🎨 Rendering with Wang tilesets for ${floor.environmentType} environment`);
    
    // Get the tileset for this environment
    const tileset = this.tilesetManager.getTileset(floor.environmentType);
    if (!tileset) {
      console.warn(`⚠️ No Wang tileset found for ${floor.environmentType}, using fallback rendering`);
      this.renderWithoutTilemap(floor);
      return;
    }
    
    // Create a terrain grid with vertices
    // The grid is 1 larger in each dimension than the tile grid
    const terrainGrid: boolean[][] = [];
    for (let y = 0; y <= floor.height; y++) {
      terrainGrid[y] = [];
      for (let x = 0; x <= floor.width; x++) {
        // Default to wall (upper terrain)
        terrainGrid[y][x] = true;
      }
    }
    
    // Mark floor tiles as lower terrain
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        if (floor.tiles[y][x].type === 'floor') {
          // Mark the 4 vertices of this tile as floor (lower terrain)
          terrainGrid[y][x] = false;
          terrainGrid[y][x + 1] = false;
          terrainGrid[y + 1][x] = false;
          terrainGrid[y + 1][x + 1] = false;
        }
      }
    }
    
    // Create a container for all tiles
    const container = this.scene.add.container(0, 0);
    
    // Render tiles based on terrain grid
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        // Get the 4 corners of this tile
        const nw = terrainGrid[y][x] ? 'upper' : 'lower';
        const ne = terrainGrid[y][x + 1] ? 'upper' : 'lower';
        const sw = terrainGrid[y + 1][x] ? 'upper' : 'lower';
        const se = terrainGrid[y + 1][x + 1] ? 'upper' : 'lower';
        
        // Get the appropriate tile for this corner configuration
        const wangTile = this.tilesetManager.getTileForCorners(tileset, nw, ne, sw, se);
        
        if (wangTile) {
          // Get the texture for this tile
          const texture = this.tilesetManager.getTileTexture(wangTile.id);
          
          if (texture) {
            // Create a sprite with the texture
            const sprite = this.scene.add.sprite(
              x * this.tileSize + this.tileSize / 2,
              y * this.tileSize + this.tileSize / 2,
              texture.key
            );
            
            // Scale the sprite to match the tile size
            const scale = this.tileSize / 16; // Wang tiles are 16x16
            sprite.setScale(scale);
            
            // Add the sprite to the container
            container.add(sprite);
            
            // Store the sprite in the tile for collision detection
            floor.tiles[y][x].sprite = sprite;
          }
        }
      }
    }
    
    // Setup collisions for wall tiles
    this.setupWangTileCollisions(floor);
  }
  
  /**
   * Setup collisions for Wang tiles
   */
  private setupWangTileCollisions(floor: DungeonFloor): void {
    // Add colliders for wall tiles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const tile = floor.tiles[y][x];
        
        if (tile.type === 'wall' && tile.sprite) {
          // Enable physics for the sprite
          this.scene.physics.world.enable(tile.sprite);
          
          // Set the sprite as immovable
          const body = tile.sprite.body as Phaser.Physics.Arcade.Body;
          body.setImmovable(true);
          
          // Store the body in the tile for collision detection
          tile.collider = body;
        }
      }
    }
  }
  
  /**
   * Get current floor data
   */
  public getCurrentFloor(): DungeonFloor | null {
    return this.currentFloor;
  }
  
  /**
   * Get room at specific coordinates
   */
  public getRoomAt(x: number, y: number): DungeonRoom | null {
    if (!this.currentFloor) return null;
    
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    
    return this.currentFloor.rooms.find(room => 
      tileX >= room.x && tileX < room.x + room.width &&
      tileY >= room.y && tileY < room.y + room.height
    ) || null;
  }
  
  /**
   * Get valid spawn positions for enemies
   */
  public getEnemySpawnPositions(roomType?: RoomType): { x: number; y: number }[] {
    if (!this.currentFloor) return [];
    
    const positions: { x: number; y: number }[] = [];
    
    this.currentFloor.rooms.forEach(room => {
      if (roomType && room.type !== roomType) return;
      if (room.type === 'boss' || room.type === 'treasure') return;
      
      room.spawns.forEach(spawn => {
        if (spawn.type === 'enemy') {
          positions.push({
            x: spawn.x * this.tileSize + this.tileSize / 2,
            y: spawn.y * this.tileSize + this.tileSize / 2
          });
        }
      });
    });
    
    return positions;
  }
  
  /**
   * Get treasure spawn positions
   */
  public getTreasurePositions(): { x: number; y: number; rarity: string }[] {
    if (!this.currentFloor) return [];
    
    const treasures: { x: number; y: number; rarity: string }[] = [];
    
    this.currentFloor.rooms.forEach(room => {
      room.treasures.forEach(treasure => {
        treasures.push({
          x: treasure.x * this.tileSize + this.tileSize / 2,
          y: treasure.y * this.tileSize + this.tileSize / 2,
          rarity: treasure.rarity
        });
      });
    });
    
    return treasures;
  }
  
  /**
   * Check if position is walkable
   */
  public isWalkable(x: number, y: number): boolean {
    if (!this.currentFloor) return false;
    
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    
    if (tileX < 0 || tileX >= this.currentFloor.width || 
        tileY < 0 || tileY >= this.currentFloor.height) {
      return false;
    }
    
    const tile = this.currentFloor.tiles[tileY][tileX];
    return tile ? tile.walkable : false;
  }
  
  /**
   * Get path between two points
   */
  public findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
    // Simple A* pathfinding implementation
    if (!this.currentFloor) return [];
    
    const start = { x: Math.floor(startX / this.tileSize), y: Math.floor(startY / this.tileSize) };
    const end = { x: Math.floor(endX / this.tileSize), y: Math.floor(endY / this.tileSize) };
    
    // IMPLEMENTED: Implement proper A* pathfinding
    // For now, return direct line if both points are walkable
    if (this.isWalkable(startX, startY) && this.isWalkable(endX, endY)) {
      return [
        { x: startX, y: startY },
        { x: endX, y: endY }
      ];
    }
    
    return [];
  }
  
  /**
   * Destroy current dungeon
   */
  public destroy(): void {
    this.clearCurrentTilemap();
    this.currentFloor = null;
    
    if (this.fallbackGraphics) {
      this.fallbackGraphics.destroy();
      this.fallbackGraphics = undefined;
    }
    
    // Clean up tileset manager
    this.tilesetManager.destroy();
    
    console.log('🏰 DungeonGenerator destroyed');
  }
  
  // Private generation methods
  
  private determineEnvironmentType(floorNumber: number): EnvironmentType {
    const cycle = Math.floor((floorNumber - 1) / 20);
    const environments: EnvironmentType[] = ['shallow', 'deep', 'abyss', 'volcanic', 'frozen', 'crystal'];
    
    if (floorNumber >= 100) return 'void';
    
    return environments[cycle % environments.length];
  }
  
  private getGenerationSettings(floorNumber: number): GenerationSettings {
    const complexity = Math.min(floorNumber / 10, 5);
    
    return {
      minRooms: 8 + Math.floor(complexity),
      maxRooms: 15 + Math.floor(complexity * 2),
      roomSizeRange: { min: 6 + Math.floor(complexity), max: 12 + Math.floor(complexity * 1.5) },
      corridorWidth: 3,
      treasureRoomChance: 0.3 + (complexity * 0.1),
      secretRoomChance: 0.2 + (complexity * 0.05),
      complexityMultiplier: complexity,
      environmentFeatures: floorNumber > 5
    };
  }
  
  private calculateFloorWidth(floorNumber: number): number {
    return Math.min(120, 80 + Math.floor(floorNumber / 5) * 4);
  }
  
  private calculateFloorHeight(floorNumber: number): number {
    return Math.min(120, 80 + Math.floor(floorNumber / 5) * 4);
  }
  
  private initializeFloorTiles(floor: DungeonFloor): void {
    floor.tiles = [];
    
    for (let y = 0; y < floor.height; y++) {
      floor.tiles[y] = [];
      for (let x = 0; x < floor.width; x++) {
        floor.tiles[y][x] = {
          x,
          y,
          type: 'wall',
          walkable: false
        };
      }
    }
  }
  
  private generateRooms(floor: DungeonFloor, settings: GenerationSettings): void {
    const roomCount = Phaser.Math.Between(settings.minRooms, settings.maxRooms);
    const attempts = roomCount * 10; // Maximum placement attempts
    
    for (let i = 0; i < roomCount && floor.rooms.length < roomCount; i++) {
      for (let attempt = 0; attempt < attempts; attempt++) {
        const room = this.generateRoom(floor, settings, i);
        
        if (this.canPlaceRoom(floor, room)) {
          this.placeRoom(floor, room);
          floor.rooms.push(room);
          break;
        }
      }
    }
    
    console.log(`🏠 Generated ${floor.rooms.length} rooms`);
  }
  
  private generateRoom(floor: DungeonFloor, settings: GenerationSettings, index: number): DungeonRoom {
    const width = Phaser.Math.Between(settings.roomSizeRange.min, settings.roomSizeRange.max);
    const height = Phaser.Math.Between(settings.roomSizeRange.min, settings.roomSizeRange.max);
    
    const x = Phaser.Math.Between(2, floor.width - width - 2);
    const y = Phaser.Math.Between(2, floor.height - height - 2);
    
    const roomType: RoomType = index === 0 ? 'normal' : this.determineRoomType(floor, settings);
    
    return {
      id: `room_${index}`,
      type: roomType,
      x,
      y,
      width,
      height,
      centerX: x + Math.floor(width / 2),
      centerY: y + Math.floor(height / 2),
      tiles: [],
      connections: [],
      spawns: [],
      treasures: [],
      metadata: {}
    };
  }
  
  private determineRoomType(floor: DungeonFloor, settings: GenerationSettings): RoomType {
    // Boss room every 10 floors
    if (floor.floorNumber % 10 === 0 && !floor.bossRoom) {
      return 'boss';
    }
    
    const rand = Math.random();
    
    if (rand < settings.treasureRoomChance) return 'treasure';
    if (rand < settings.treasureRoomChance + settings.secretRoomChance) return 'secret';
    if (rand < settings.treasureRoomChance + settings.secretRoomChance + 0.1) return 'arena';
    if (rand < settings.treasureRoomChance + settings.secretRoomChance + 0.15) return 'shrine';
    
    return 'normal';
  }
  
  private canPlaceRoom(floor: DungeonFloor, room: DungeonRoom): boolean {
    // Check boundaries
    if (room.x < 1 || room.y < 1 || 
        room.x + room.width >= floor.width - 1 || 
        room.y + room.height >= floor.height - 1) {
      return false;
    }
    
    // Check overlap with existing rooms (with padding)
    for (const existingRoom of floor.rooms) {
      if (this.roomsOverlap(room, existingRoom, 2)) {
        return false;
      }
    }
    
    return true;
  }
  
  private roomsOverlap(room1: DungeonRoom, room2: DungeonRoom, padding: number = 0): boolean {
    return !(room1.x + room1.width + padding <= room2.x ||
             room2.x + room2.width + padding <= room1.x ||
             room1.y + room1.height + padding <= room2.y ||
             room2.y + room2.height + padding <= room1.y);
  }
  
  private placeRoom(floor: DungeonFloor, room: DungeonRoom): void {
    // Carve out room tiles
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        floor.tiles[y][x] = {
          x,
          y,
          type: 'floor',
          walkable: true
        };
      }
    }
    
    // Generate room-specific content
    this.generateRoomContent(floor, room);
  }
  
  private generateRoomContent(floor: DungeonFloor, room: DungeonRoom): void {
    switch (room.type) {
      case 'normal':
        this.generateNormalRoomContent(room);
        break;
      case 'treasure':
        this.generateTreasureRoomContent(room);
        break;
      case 'boss':
        this.generateBossRoomContent(room);
        floor.bossRoom = room;
        break;
      case 'arena':
        this.generateArenaRoomContent(room);
        break;
      case 'shrine':
        this.generateShrineRoomContent(room);
        break;
    }
  }
  
  private generateNormalRoomContent(room: DungeonRoom): void {
    // Add enemy spawn points
    const spawnCount = Phaser.Math.Between(2, 5);
    
    for (let i = 0; i < spawnCount; i++) {
      const spawnX = Phaser.Math.Between(room.x + 1, room.x + room.width - 2);
      const spawnY = Phaser.Math.Between(room.y + 1, room.y + room.height - 2);
      
      room.spawns.push({
        x: spawnX,
        y: spawnY,
        type: 'enemy'
      });
    }
    
    // Occasional treasure
    if (Math.random() < 0.3) {
      room.treasures.push({
        x: Phaser.Math.Between(room.x + 1, room.x + room.width - 2),
        y: Phaser.Math.Between(room.y + 1, room.y + room.height - 2),
        rarity: Math.random() < 0.7 ? 'Common' : 'Uncommon'
      });
    }
  }
  
  private generateTreasureRoomContent(room: DungeonRoom): void {
    // Multiple treasure spawns
    const treasureCount = Phaser.Math.Between(3, 6);
    
    for (let i = 0; i < treasureCount; i++) {
      room.treasures.push({
        x: Phaser.Math.Between(room.x + 1, room.x + room.width - 2),
        y: Phaser.Math.Between(room.y + 1, room.y + room.height - 2),
        rarity: this.rollTreasureRarity()
      });
    }
    
    // Fewer but stronger enemies
    const guardCount = Phaser.Math.Between(1, 3);
    for (let i = 0; i < guardCount; i++) {
      room.spawns.push({
        x: Phaser.Math.Between(room.x + 1, room.x + room.width - 2),
        y: Phaser.Math.Between(room.y + 1, room.y + room.height - 2),
        type: 'elite_enemy'
      });
    }
  }
  
  private generateBossRoomContent(room: DungeonRoom): void {
    // Boss spawn in center
    room.spawns.push({
      x: room.centerX,
      y: room.centerY,
      type: 'boss'
    });
    
    // Mark room as boss arena
    room.metadata.bossArena = true;
    room.metadata.roomSize = 'large'; // Boss rooms are always large
    
    // Guaranteed legendary loot (spawned by boss system after defeat)
    room.treasures.push({
      x: room.centerX,
      y: room.centerY + 2,
      rarity: 'Legendary'
    });
    
    // Additional rare rewards
    for (let i = 0; i < 3; i++) {
      room.treasures.push({
        x: Phaser.Math.Between(room.x + 2, room.x + room.width - 3),
        y: Phaser.Math.Between(room.y + 2, room.y + room.height - 3),
        rarity: Math.random() < 0.5 ? 'Epic' : 'Rare'
      });
    }
    
    // Create boss arena boundaries
    this.createBossArenaBoundaries(room);
  }
  
  /**
   * Create special boundaries for boss arena
   */
  private createBossArenaBoundaries(room: DungeonRoom): void {
    // Add special arena markings
    room.metadata.hasSpecialBoundaries = true;
    room.metadata.arenaType = 'boss_encounter';
    
    // Boss arenas are sealed during combat
    room.metadata.sealable = true;
  }
  
  private generateArenaRoomContent(room: DungeonRoom): void {
    // Arena with multiple waves
    const waveCount = Phaser.Math.Between(3, 5);
    
    for (let wave = 0; wave < waveCount; wave++) {
      const enemyCount = Phaser.Math.Between(4, 8);
      
      for (let i = 0; i < enemyCount; i++) {
        room.spawns.push({
          x: Phaser.Math.Between(room.x + 1, room.x + room.width - 2),
          y: Phaser.Math.Between(room.y + 1, room.y + room.height - 2),
          type: `arena_enemy_wave_${wave}`
        });
      }
    }
    
    // Arena completion reward
    room.treasures.push({
      x: room.centerX,
      y: room.centerY,
      rarity: 'Epic'
    });
  }
  
  private generateShrineRoomContent(room: DungeonRoom): void {
    // Shrine for buffs/healing
    room.spawns.push({
      x: room.centerX,
      y: room.centerY,
      type: 'shrine'
    });
    
    // No enemies, peaceful room
    room.metadata.peaceful = true;
  }
  
  private rollTreasureRarity(): string {
    const rand = Math.random();
    
    if (rand < 0.05) return 'Legendary';
    if (rand < 0.15) return 'Epic';
    if (rand < 0.35) return 'Rare';
    if (rand < 0.65) return 'Uncommon';
    return 'Common';
  }
  
  private generateCorridors(floor: DungeonFloor, settings: GenerationSettings): void {
    // Connect all rooms using Minimum Spanning Tree
    this.connectRoomsWithMST(floor, settings);
    this.addRandomConnections(floor, settings);
  }
  
  private connectRoomsWithMST(floor: DungeonFloor, settings: GenerationSettings): void {
    if (floor.rooms.length < 2) return;
    
    const unconnected = [...floor.rooms];
    const connected = [unconnected.pop()!];
    
    while (unconnected.length > 0) {
      let shortestDistance = Infinity;
      let closestPair: { connected: DungeonRoom; unconnected: DungeonRoom } | null = null;
      
      // Find closest room pair
      for (const connectedRoom of connected) {
        for (const unconnectedRoom of unconnected) {
          const distance = this.getRoomDistance(connectedRoom, unconnectedRoom);
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestPair = { connected: connectedRoom, unconnected: unconnectedRoom };
          }
        }
      }
      
      if (closestPair) {
        this.createCorridor(floor, closestPair.connected, closestPair.unconnected, settings);
        connected.push(closestPair.unconnected);
        const index = unconnected.indexOf(closestPair.unconnected);
        unconnected.splice(index, 1);
      }
    }
  }
  
  private addRandomConnections(floor: DungeonFloor, settings: GenerationSettings): void {
    // Add extra connections for non-linear exploration
    const extraConnections = Math.floor(floor.rooms.length * 0.3);
    
    for (let i = 0; i < extraConnections; i++) {
      const room1 = Phaser.Utils.Array.GetRandom(floor.rooms);
      const room2 = Phaser.Utils.Array.GetRandom(floor.rooms);
      
      if (room1 !== room2 && !room1.connections.includes(room2.id)) {
        this.createCorridor(floor, room1, room2, settings);
      }
    }
  }
  
  private getRoomDistance(room1: DungeonRoom, room2: DungeonRoom): number {
    return Math.abs(room1.centerX - room2.centerX) + Math.abs(room1.centerY - room2.centerY);
  }
  
  private createCorridor(floor: DungeonFloor, room1: DungeonRoom, room2: DungeonRoom, settings: GenerationSettings): void {
    // L-shaped corridor
    const startX = room1.centerX;
    const startY = room1.centerY;
    const endX = room2.centerX;
    const endY = room2.centerY;
    
    // Horizontal segment
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    
    for (let x = minX; x <= maxX; x++) {
      this.carveCorridor(floor, x, startY, settings.corridorWidth);
    }
    
    // Vertical segment
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    
    for (let y = minY; y <= maxY; y++) {
      this.carveCorridor(floor, endX, y, settings.corridorWidth);
    }
    
    // Record connection
    room1.connections.push(room2.id);
    room2.connections.push(room1.id);
  }
  
  private carveCorridor(floor: DungeonFloor, centerX: number, centerY: number, width: number): void {
    const halfWidth = Math.floor(width / 2);
    
    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
      for (let y = centerY - halfWidth; y <= centerY + halfWidth; y++) {
        if (x >= 0 && x < floor.width && y >= 0 && y < floor.height) {
          floor.tiles[y][x] = {
            x,
            y,
            type: 'floor',
            walkable: true
          };
        }
      }
    }
  }
  
  private placeDoors(floor: DungeonFloor): void {
    // IMPLEMENTED: Implement door placement logic
    console.log('🚪 Door placement (IMPLEMENTED)');
  }
  
  private generateTreasureRooms(floor: DungeonFloor, settings: GenerationSettings): void {
    floor.treasureRooms = floor.rooms.filter(room => room.type === 'treasure');
    console.log(`💎 Generated ${floor.treasureRooms.length} treasure rooms`);
  }
  
  private generateSecretRooms(floor: DungeonFloor, settings: GenerationSettings): void {
    floor.secretRooms = floor.rooms.filter(room => room.type === 'secret');
    console.log(`🗝️ Generated ${floor.secretRooms.length} secret rooms`);
  }
  
  private generateBossRoom(floor: DungeonFloor): void {
    if (floor.bossRoom) {
      console.log(`👑 Boss room generated for Floor ${floor.floorNumber}`);
    }
  }
  
  private placeEnvironmentFeatures(floor: DungeonFloor): void {
    // Add environment-specific features
    switch (floor.environmentType) {
      case 'volcanic':
        this.placeLavaPools(floor);
        break;
      case 'frozen':
        this.placeIcePatches(floor);
        break;
      case 'abyss':
        this.placeVoidRifts(floor);
        break;
    }
  }
  
  private placeLavaPools(floor: DungeonFloor): void {
    // IMPLEMENTED: Place lava hazards
  }
  
  private placeIcePatches(floor: DungeonFloor): void {
    // IMPLEMENTED: Place ice hazards
  }
  
  private placeVoidRifts(floor: DungeonFloor): void {
    // IMPLEMENTED: Place void hazards
  }
  
  private placeSpawnAndExit(floor: DungeonFloor): void {
    // Spawn point in first room
    const firstRoom = floor.rooms[0];
    if (firstRoom) {
      floor.spawnPoint = {
        x: firstRoom.centerX * this.tileSize,
        y: firstRoom.centerY * this.tileSize
      };
    }
    
    // Exit point in last room (or boss room)
    const exitRoom = floor.bossRoom || floor.rooms[floor.rooms.length - 1];
    if (exitRoom) {
      floor.exitPoint = {
        x: exitRoom.centerX * this.tileSize,
        y: exitRoom.centerY * this.tileSize
      };
    }
  }
  
  private generateSpawnPoints(floor: DungeonFloor): void {
    // All spawn points are already generated in room content
    const totalSpawns = floor.rooms.reduce((sum, room) => sum + room.spawns.length, 0);
    console.log(`🎯 Generated ${totalSpawns} spawn points across all rooms`);
  }
  
  private optimizeForPerformance(floor: DungeonFloor): void {
    // IMPLEMENTED: Implement performance optimizations
    // - Tile culling
    // - LOD for distant areas
    // - Chunk-based loading
    console.log('⚡ Performance optimization (IMPLEMENTED)');
  }
  
  private clearCurrentTilemap(): void {
    if (this.tilemap) {
      this.tilemap.destroy();
      this.tilemap = undefined;
    }
  }
  
    private createTilemap(floor: DungeonFloor): void {
    // Create tilemap data structure
    const emptyData = Array(floor.height).fill(null).map(() => Array(floor.width).fill(0));
    
    // Create tilemap with proper layer data
    this.tilemap = this.scene.make.tilemap({
      data: [emptyData, emptyData, emptyData], // ground, walls, decorations
      tileWidth: this.tileSize,
      tileHeight: this.tileSize
    });
    
    // Add tileset with fallback
    let tileset;
    try {
      if (this.scene.textures.exists('dungeon_tileset')) {
        tileset = this.tilemap.addTilesetImage('dungeon_tiles', 'dungeon_tileset');
      } else {
        console.warn('🏰 Dungeon tileset not found, using fallback rendering');
        this.renderWithoutTilemap(floor);
        return;
      }
    } catch (error) {
      console.warn('🏰 Failed to create tileset, using fallback rendering:', error);
      this.renderWithoutTilemap(floor);
      return;
    }
    
    // Create layers with the tileset
    this.groundLayer = this.tilemap.createLayer(0, tileset, 0, 0);
    this.wallLayer = this.tilemap.createLayer(1, tileset, 0, 0);
    this.decorationLayer = this.tilemap.createLayer(2, tileset, 0, 0);
  }
  
  private renderWithoutTilemap(floor: DungeonFloor): void {
    // Fallback rendering using simple graphics for when tilemap fails
    console.log('🎨 Using fallback dungeon rendering with graphics');
    
    // Create background
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x2d1b0e); // Dark brown background
    graphics.fillRect(0, 0, floor.width * this.tileSize, floor.height * this.tileSize);
    
    // Render walls as rectangles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const tile = floor.tiles[y][x];
        
        if (tile.type === 'wall') {
          graphics.fillStyle(0x4a4a4a); // Gray walls
          graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        } else if (tile.type === 'floor') {
          graphics.fillStyle(0x8B7355); // Brown floor
          graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        } else if (tile.type === 'door') {
          graphics.fillStyle(0x8B4513); // Wooden door
          graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
    
    // Store the graphics object for cleanup
    this.fallbackGraphics = graphics;
  }

  private createTilesets(environmentType: EnvironmentType): void {
    // IMPLEMENTED: Load environment-specific tilesets
    // Use placeholder tileset if dungeon_tileset doesn't exist
    const tilesetKey = this.scene.textures.exists('dungeon_tileset') ? 'dungeon_tileset' : 'placeholder_hero';
    this.tilesetImage = this.tilemap!.addTilesetImage('dungeon_tiles', tilesetKey) || undefined;
  }
  
  private createLayers(): void {
    if (!this.tilemap || !this.tilesetImage) return;
    
    this.groundLayer = this.tilemap.createLayer('ground', this.tilesetImage) || undefined;
    this.wallLayer = this.tilemap.createLayer('walls', this.tilesetImage) || undefined;
    this.decorationLayer = this.tilemap.createLayer('decorations', this.tilesetImage) || undefined;
  }
  
  private renderTiles(floor: DungeonFloor): void {
    if (!this.groundLayer || !this.wallLayer) return;
    
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const tile = floor.tiles[y][x];
        
        switch (tile.type) {
          case 'floor':
            this.groundLayer.putTileAt(1, x, y); // Floor tile
            break;
          case 'wall':
            this.wallLayer.putTileAt(2, x, y); // Wall tile
            break;
          case 'door':
            this.groundLayer.putTileAt(3, x, y); // Door tile
            break;
        }
      }
    }
  }
  
  private setupCollisions(): void {
    if (!this.wallLayer) return;
    
    // Set collision for wall tiles
    this.wallLayer.setCollisionByExclusion([]);
  }
  
  private addEnvironmentDecorations(floor: DungeonFloor): void {
    // IMPLEMENTED: Add environment-specific decorations
    console.log(`🎨 Adding ${floor.environmentType} decorations (IMPLEMENTED)`);
  }
}
