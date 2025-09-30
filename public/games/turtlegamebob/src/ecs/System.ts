/**
 * System - Base class for all ECS systems
 * Systems contain behavior that operates on entities with specific components
 */

import { World } from './World';

export abstract class System {
  // Reference to the world this system belongs to
  protected world: World;
  
  // Required component types for entities to be processed by this system
  public abstract readonly requiredComponents: string[];
  
  // System priority (lower numbers run first)
  public priority: number = 0;
  
  constructor(world: World) {
    this.world = world;
  }
  
  /**
   * Initialize the system
   * Called when the system is added to the world
   */
  public initialize(): void {
    // Override in child classes if needed
  }
  
  /**
   * Update the system
   * Called every frame with the time delta
   */
  public abstract update(time: number, delta: number): void;
  
  /**
   * Get all entities that match the required components
   */
  protected getEntities(): number[] {
    return this.world.getEntitiesWithComponents(this.requiredComponents);
  }
  
  /**
   * Clean up the system
   * Called when the system is removed from the world
   */
  public destroy(): void {
    // Override in child classes if needed
  }
}





