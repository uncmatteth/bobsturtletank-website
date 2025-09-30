/**
 * Entity - Container for components
 */

import { Component } from './Component';
import { World } from './World';

export class Entity {
  public readonly id: number;
  private world: World;
  private components: Map<string, Component> = new Map();
  
  constructor(id: number, world: World) {
    this.id = id;
    this.world = world;
  }
  
  /**
   * Add a component to this entity
   */
  public addComponent<T extends Component>(component: T): this {
    const componentClass = component.constructor as typeof Component;
    const type = componentClass.getType();
    
    // Set the entity reference on the component
    component.entityId = this.id;
    
    // Add the component to the entity
    this.components.set(type, component);
    
    // Register the component with the world
    this.world.registerComponent(this.id, type, component);
    
    return this;
  }
  
  /**
   * Get a component by type
   */
  public getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }
  
  /**
   * Check if the entity has a component
   */
  public hasComponent(type: string): boolean {
    return this.components.has(type);
  }
  
  /**
   * Remove a component
   */
  public removeComponent(type: string): this {
    if (this.components.has(type)) {
      // Unregister from world
      this.world.unregisterComponent(this.id, type);
      
      // Remove from entity
      this.components.delete(type);
    }
    
    return this;
  }
  
  /**
   * Destroy the entity
   */
  public destroy(): void {
    // Remove all components
    for (const type of this.components.keys()) {
      this.removeComponent(type);
    }
    
    // Remove from world
    this.world.destroyEntity(this.id);
  }
}





