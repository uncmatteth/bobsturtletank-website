/**
 * System - Processes entities with specific components
 */

import { World } from './World';

export abstract class System {
  protected world: World;
  public priority: number = 0;
  
  constructor(world: World) {
    this.world = world;
  }
  
  /**
   * Get the component types this system requires
   */
  public abstract getRequiredComponents(): string[];
  
  /**
   * Initialize the system
   */
  public initialize(): void {
    // Override in child classes
  }
  
  /**
   * Update the system
   */
  public abstract update(time: number, delta: number): void;
  
  /**
   * Get entities that match the required components
   */
  protected getEntities(): number[] {
    return this.world.getEntitiesWithComponents(this.getRequiredComponents());
  }
}





