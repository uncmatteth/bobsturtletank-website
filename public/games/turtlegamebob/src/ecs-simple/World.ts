/**
 * World - Container for entities and components
 */

import { Component } from './Component';
import { Entity } from './Entity';
import { System } from './System';

export class World {
  private nextEntityId: number = 0;
  private entities: Map<number, Entity> = new Map();
  private components: Map<string, Map<number, Component>> = new Map();
  private systems: System[] = [];
  private entityComponents: Map<number, Set<string>> = new Map();
  
  constructor() {}
  
  /**
   * Create a new entity
   */
  public createEntity(): Entity {
    const id = this.nextEntityId++;
    const entity = new Entity(id, this);
    
    this.entities.set(id, entity);
    this.entityComponents.set(id, new Set());
    
    return entity;
  }
  
  /**
   * Register a component with an entity
   */
  public registerComponent(entityId: number, type: string, component: Component): void {
    // Create component map if it doesn't exist
    if (!this.components.has(type)) {
      this.components.set(type, new Map());
    }
    
    // Add component to map
    this.components.get(type)!.set(entityId, component);
    
    // Add to entity's component set
    this.entityComponents.get(entityId)?.add(type);
  }
  
  /**
   * Unregister a component from an entity
   */
  public unregisterComponent(entityId: number, type: string): void {
    // Remove from component map
    this.components.get(type)?.delete(entityId);
    
    // Remove from entity's component set
    this.entityComponents.get(entityId)?.delete(type);
  }
  
  /**
   * Destroy an entity
   */
  public destroyEntity(entityId: number): void {
    if (!this.entities.has(entityId)) {
      return;
    }
    
    // Remove all components
    const componentTypes = this.entityComponents.get(entityId);
    if (componentTypes) {
      for (const type of componentTypes) {
        this.unregisterComponent(entityId, type);
      }
    }
    
    // Remove entity
    this.entities.delete(entityId);
    this.entityComponents.delete(entityId);
  }
  
  /**
   * Add a system
   */
  public addSystem(system: System): this {
    this.systems.push(system);
    
    // Sort systems by priority
    this.systems.sort((a, b) => a.priority - b.priority);
    
    // Initialize the system
    system.initialize();
    
    return this;
  }
  
  /**
   * Get entities with components
   */
  public getEntitiesWithComponents(types: string[]): number[] {
    const result: number[] = [];
    
    // Check each entity
    for (const [entityId, componentTypes] of this.entityComponents.entries()) {
      // Check if the entity has all required components
      if (types.every(type => componentTypes.has(type))) {
        result.push(entityId);
      }
    }
    
    return result;
  }
  
  /**
   * Get a component from an entity
   */
  public getComponent<T extends Component>(entityId: number, type: string): T | undefined {
    return this.components.get(type)?.get(entityId) as T | undefined;
  }
  
  /**
   * Update all systems
   */
  public update(time: number, delta: number): void {
    for (const system of this.systems) {
      system.update(time, delta);
    }
  }
}





