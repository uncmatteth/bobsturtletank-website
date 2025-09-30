/**
 * World - Container for all entities, components, and systems in the ECS
 */

import { Component } from './Component';
import { Entity } from './Entity';
import { System } from './System';

export class World {
  // Entity counter for generating unique IDs
  private nextEntityId: number = 0;
  
  // Map of entity IDs to entities
  private entities: Map<number, Entity> = new Map();
  
  // Map of component types to maps of entity IDs to components
  private components: Map<string, Map<number, Component>> = new Map();
  
  // Array of systems
  private systems: System[] = [];
  
  // Map of entity IDs to sets of component types
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
   * Destroy an entity
   */
  public destroyEntity(id: number): void {
    if (!this.entities.has(id)) {
      return;
    }
    
    // Remove all components
    const componentTypes = this.entityComponents.get(id);
    if (componentTypes) {
      for (const type of componentTypes) {
        this.unregisterComponent(id, type);
      }
    }
    
    // Remove the entity
    this.entities.delete(id);
    this.entityComponents.delete(id);
  }
  
  /**
   * Register a component with an entity
   */
  public registerComponent(entityId: number, type: string, component: Component): void {
    // Create the component map if it doesn't exist
    if (!this.components.has(type)) {
      this.components.set(type, new Map());
    }
    
    // Add the component to the map
    this.components.get(type)!.set(entityId, component);
    
    // Add the component type to the entity's set
    this.entityComponents.get(entityId)?.add(type);
  }
  
  /**
   * Unregister a component from an entity
   */
  public unregisterComponent(entityId: number, type: string): void {
    // Remove the component from the map
    this.components.get(type)?.delete(entityId);
    
    // Remove the component type from the entity's set
    this.entityComponents.get(entityId)?.delete(type);
  }
  
  /**
   * Add a system to the world
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
   * Remove a system from the world
   */
  public removeSystem(system: System): this {
    const index = this.systems.indexOf(system);
    
    if (index !== -1) {
      // Destroy the system
      system.destroy();
      
      // Remove the system
      this.systems.splice(index, 1);
    }
    
    return this;
  }
  
  /**
   * Get all entities with the specified components
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
  
  /**
   * Destroy the world and all entities
   */
  public destroy(): void {
    // Destroy all systems
    for (const system of this.systems) {
      system.destroy();
    }
    
    // Clear all entities
    for (const entityId of this.entities.keys()) {
      this.destroyEntity(entityId);
    }
    
    // Clear all data
    this.systems = [];
    this.entities.clear();
    this.components.clear();
    this.entityComponents.clear();
  }
}





