/**
 * Entity - Unique identifier for game objects in the ECS
 * Entities are just IDs that components can reference
 */

import { Component, ComponentTypes } from './Component';
import { World } from './World';

export class Entity {
  // Unique entity ID
  public readonly id: number;
  
  // Reference to the world this entity belongs to
  private world: World;
  
  // Map of component types to components
  private components: Map<string, Component> = new Map();
  
  constructor(id: number, world: World) {
    this.id = id;
    this.world = world;
  }
  
  /**
   * Add a component to this entity
   */
  public addComponent<T extends Component>(component: T): this {
    const type = (component.constructor as any).type;
    
    if (!type) {
      throw new Error(`Component ${component.constructor.name} has no type. Did you forget to register it?`);
    }
    
    // Set the entity reference on the component
    component.entity = this.id;
    
    // Add the component to the entity
    this.components.set(type, component);
    
    // Register the component with the world
    this.world.registerComponent(this.id, type, component);
    
    return this;
  }
  
  /**
   * Remove a component from this entity
   */
  public removeComponent(type: string): this {
    if (this.components.has(type)) {
      // Unregister the component from the world
      this.world.unregisterComponent(this.id, type);
      
      // Remove the component from the entity
      this.components.delete(type);
    }
    
    return this;
  }
  
  /**
   * Check if this entity has a component
   */
  public hasComponent(type: string): boolean {
    return this.components.has(type);
  }
  
  /**
   * Get a component from this entity
   */
  public getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }
  
  /**
   * Get all components from this entity
   */
  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }
  
  /**
   * Destroy this entity and all its components
   */
  public destroy(): void {
    // Remove all components
    for (const type of this.components.keys()) {
      this.removeComponent(type);
    }
    
    // Remove the entity from the world
    this.world.destroyEntity(this.id);
  }
}
