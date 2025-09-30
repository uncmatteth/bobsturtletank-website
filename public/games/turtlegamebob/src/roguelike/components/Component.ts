/**
 * Component - Base class for all entity components
 * Implements the component pattern for modular entity behavior
 */

import { Entity } from '../entities/Entity';

export abstract class Component {
  protected entity: Entity | null = null;
  protected type: string;
  
  constructor(type: string) {
    this.type = type;
  }
  
  /**
   * Get the component type
   */
  public getType(): string {
    return this.type;
  }
  
  /**
   * Set the entity that owns this component
   */
  public setEntity(entity: Entity): void {
    this.entity = entity;
  }
  
  /**
   * Get the entity that owns this component
   */
  public getEntity(): Entity | null {
    return this.entity;
  }
  
  /**
   * Update the component
   */
  public update(delta: number): void {
    // Override in subclasses
  }
  
  /**
   * Serialize the component for saving
   */
  public abstract serialize(): any;
  
  /**
   * Deserialize the component for loading
   */
  public abstract deserialize(data: any): void;
}
