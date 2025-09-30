/**
 * EntityManager - Manages all entities in the game
 * Handles spawning, updating, and removing entities
 */

import { Entity } from './Entity';
import { EventBus } from '../events/EventBus';
import { Map } from '../map/Map';
import { Position } from '../types/Position';
import { Enemy } from './Enemy';
import { Item } from '../items/Item';
import * as ROT from 'rot-js';

export class EntityManager {
  private entities: Map<string, Entity> = new Map();
  private spatialGrid: { [key: string]: Entity[] } = {};
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    
    // Listen for entity events
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for entity movement
    this.eventBus.on('entity_moved', (data) => {
      this.updateSpatialGrid(data.entity, data.oldPosition, data.newPosition);
    });
    
    // Listen for entity death
    this.eventBus.on('entity_died', (data) => {
      this.removeEntity(data.entity);
    });
  }
  
  /**
   * Add an entity to the manager
   */
  public addEntity(entity: Entity): void {
    this.entities.set(entity.getId(), entity);
    this.addToSpatialGrid(entity);
    
    this.eventBus.emit('entity_added', { entity });
  }
  
  /**
   * Remove an entity from the manager
   */
  public removeEntity(entity: Entity): void {
    this.entities.delete(entity.getId());
    this.removeFromSpatialGrid(entity);
    
    this.eventBus.emit('entity_removed', { entity });
  }
  
  /**
   * Get an entity by ID
   */
  public getEntity(id: string): Entity | null {
    return this.entities.get(id) || null;
  }
  
  /**
   * Get all entities
   */
  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * Get entities at a specific position
   */
  public getEntitiesAt(x: number, y: number): Entity[] {
    const key = `${x},${y}`;
    return this.spatialGrid[key] || [];
  }
  
  /**
   * Get the first blocking entity at a position
   */
  public getEntityAt(x: number, y: number): Entity | null {
    const entities = this.getEntitiesAt(x, y);
    return entities.find(entity => entity.isBlocking()) || null;
  }
  
  /**
   * Get all items at a position
   */
  public getItemsAt(x: number, y: number): Item[] {
    const entities = this.getEntitiesAt(x, y);
    return entities.filter(entity => entity instanceof Item) as Item[];
  }
  
  /**
   * Get all enemies at a position
   */
  public getEnemiesAt(x: number, y: number): Enemy[] {
    const entities = this.getEntitiesAt(x, y);
    return entities.filter(entity => entity instanceof Enemy) as Enemy[];
  }
  
  /**
   * Get entities within a radius
   */
  public getEntitiesInRadius(center: Position, radius: number): Entity[] {
    const entities: Entity[] = [];
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const x = center.x + dx;
          const y = center.y + dy;
          entities.push(...this.getEntitiesAt(x, y));
        }
      }
    }
    
    return entities;
  }
  
  /**
   * Get enemies within a radius
   */
  public getEnemiesInRadius(center: Position, radius: number): Enemy[] {
    const entities = this.getEntitiesInRadius(center, radius);
    return entities.filter(entity => entity instanceof Enemy) as Enemy[];
  }
  
  /**
   * Get the closest entity to a position
   */
  public getClosestEntity(position: Position, filter?: (entity: Entity) => boolean): Entity | null {
    let closestEntity: Entity | null = null;
    let closestDistance = Infinity;
    
    for (const entity of this.entities.values()) {
      if (filter && !filter(entity)) {
        continue;
      }
      
      const entityPos = entity.getPosition();
      const distance = Math.sqrt(
        Math.pow(entityPos.x - position.x, 2) + Math.pow(entityPos.y - position.y, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEntity = entity;
      }
    }
    
    return closestEntity;
  }
  
  /**
   * Get the closest enemy to a position
   */
  public getClosestEnemy(position: Position): Enemy | null {
    return this.getClosestEntity(position, entity => entity instanceof Enemy) as Enemy | null;
  }
  
  /**
   * Update all entities
   */
  public update(delta: number): void {
    for (const entity of this.entities.values()) {
      entity.update(delta);
    }
  }
  
  /**
   * Remove all dead entities
   */
  public removeDeadEntities(): void {
    const deadEntities: Entity[] = [];
    
    for (const entity of this.entities.values()) {
      if (entity.isDead()) {
        deadEntities.push(entity);
      }
    }
    
    for (const entity of deadEntities) {
      this.removeEntity(entity);
    }
  }
  
  /**
   * Clear all entities
   */
  public clearEntities(): void {
    this.entities.clear();
    this.spatialGrid = {};
    
    this.eventBus.emit('entities_cleared');
  }
  
  /**
   * Populate a level with entities
   */
  public populateLevel(map: Map, level: number): void {
    const rooms = map.getRooms();
    
    // Spawn enemies
    this.spawnEnemies(rooms, level);
    
    // Spawn items
    this.spawnItems(rooms, level);
    
    // Spawn special entities based on room types
    this.spawnSpecialEntities(rooms, level);
  }
  
  /**
   * Spawn enemies in rooms
   */
  private spawnEnemies(rooms: any[], level: number): void {
    const enemyCount = Math.floor(rooms.length * 0.7) + ROT.RNG.getUniformInt(1, 3);
    
    for (let i = 0; i < enemyCount; i++) {
      // Pick a random room (not the first one, which is the starting room)
      const roomIndex = ROT.RNG.getUniformInt(1, rooms.length - 1);
      const room = rooms[roomIndex];
      
      // Get a random position in the room
      const position = room.getRandomPosition();
      
      // Check if position is free
      if (this.getEntityAt(position.x, position.y)) {
        continue; // Skip if occupied
      }
      
      // Create enemy based on level
      const enemy = this.createRandomEnemy(level, position);
      if (enemy) {
        this.addEntity(enemy);
      }
    }
  }
  
  /**
   * Spawn items in rooms
   */
  private spawnItems(rooms: any[], level: number): void {
    const itemCount = Math.floor(rooms.length * 0.5) + ROT.RNG.getUniformInt(0, 2);
    
    for (let i = 0; i < itemCount; i++) {
      // Pick a random room
      const roomIndex = ROT.RNG.getUniformInt(0, rooms.length - 1);
      const room = rooms[roomIndex];
      
      // Get a random position in the room
      const position = room.getRandomPosition();
      
      // Check if position is free
      if (this.getEntitiesAt(position.x, position.y).length > 0) {
        continue; // Skip if occupied
      }
      
      // Create item based on level
      const item = this.createRandomItem(level, position);
      if (item) {
        this.addEntity(item);
      }
    }
  }
  
  /**
   * Spawn special entities based on room types
   */
  private spawnSpecialEntities(rooms: any[], level: number): void {
    for (const room of rooms) {
      const roomType = room.getType();
      
      switch (roomType) {
        case 'boss':
          this.spawnBoss(room, level);
          break;
        case 'treasure':
          this.spawnTreasure(room, level);
          break;
        case 'shop':
          this.spawnShop(room, level);
          break;
      }
    }
  }
  
  /**
   * Create a random enemy based on level
   */
  private createRandomEnemy(level: number, position: Position): Enemy | null {
    // This would be implemented with actual enemy classes
    // For now, return null as placeholder
    return null;
  }
  
  /**
   * Create a random item based on level
   */
  private createRandomItem(level: number, position: Position): Item | null {
    // This would be implemented with actual item classes
    // For now, return null as placeholder
    return null;
  }
  
  /**
   * Spawn a boss in a boss room
   */
  private spawnBoss(room: any, level: number): void {
    const position = room.getCenter();
    
    // Check if position is free
    if (this.getEntityAt(position.x, position.y)) {
      return;
    }
    
    // Create boss enemy
    const boss = this.createBoss(level, position);
    if (boss) {
      this.addEntity(boss);
    }
  }
  
  /**
   * Spawn treasure in a treasure room
   */
  private spawnTreasure(room: any, level: number): void {
    const treasureCount = ROT.RNG.getUniformInt(2, 5);
    
    for (let i = 0; i < treasureCount; i++) {
      const position = room.getRandomPosition();
      
      // Check if position is free
      if (this.getEntitiesAt(position.x, position.y).length > 0) {
        continue;
      }
      
      // Create treasure item
      const treasure = this.createTreasureItem(level, position);
      if (treasure) {
        this.addEntity(treasure);
      }
    }
  }
  
  /**
   * Spawn shop in a shop room
   */
  private spawnShop(room: any, level: number): void {
    // This would spawn a shopkeeper NPC and items for sale
    // Placeholder for now
  }
  
  /**
   * Create a boss enemy
   */
  private createBoss(level: number, position: Position): Enemy | null {
    // Placeholder - would create actual boss enemy
    return null;
  }
  
  /**
   * Create a treasure item
   */
  private createTreasureItem(level: number, position: Position): Item | null {
    // Placeholder - would create actual treasure item
    return null;
  }
  
  /**
   * Add entity to spatial grid
   */
  private addToSpatialGrid(entity: Entity): void {
    const position = entity.getPosition();
    const key = `${position.x},${position.y}`;
    
    if (!this.spatialGrid[key]) {
      this.spatialGrid[key] = [];
    }
    
    this.spatialGrid[key].push(entity);
  }
  
  /**
   * Remove entity from spatial grid
   */
  private removeFromSpatialGrid(entity: Entity): void {
    const position = entity.getPosition();
    const key = `${position.x},${position.y}`;
    
    if (this.spatialGrid[key]) {
      const index = this.spatialGrid[key].indexOf(entity);
      if (index !== -1) {
        this.spatialGrid[key].splice(index, 1);
        
        // Clean up empty arrays
        if (this.spatialGrid[key].length === 0) {
          delete this.spatialGrid[key];
        }
      }
    }
  }
  
  /**
   * Update spatial grid when entity moves
   */
  private updateSpatialGrid(entity: Entity, oldPosition: Position, newPosition: Position): void {
    // Remove from old position
    const oldKey = `${oldPosition.x},${oldPosition.y}`;
    if (this.spatialGrid[oldKey]) {
      const index = this.spatialGrid[oldKey].indexOf(entity);
      if (index !== -1) {
        this.spatialGrid[oldKey].splice(index, 1);
        
        if (this.spatialGrid[oldKey].length === 0) {
          delete this.spatialGrid[oldKey];
        }
      }
    }
    
    // Add to new position
    const newKey = `${newPosition.x},${newPosition.y}`;
    if (!this.spatialGrid[newKey]) {
      this.spatialGrid[newKey] = [];
    }
    this.spatialGrid[newKey].push(entity);
  }
  
  /**
   * Serialize entity manager data
   */
  public serialize(): any {
    const serializedEntities: any[] = [];
    
    for (const entity of this.entities.values()) {
      serializedEntities.push(entity.serialize());
    }
    
    return {
      entities: serializedEntities
    };
  }
  
  /**
   * Deserialize entity manager data
   */
  public deserialize(data: any): void {
    this.clearEntities();
    
    for (const entityData of data.entities) {
      // This would need to be implemented based on entity types
      // For now, skip deserialization
    }
  }
}
