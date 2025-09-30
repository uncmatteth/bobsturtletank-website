/**
 * Entity - Base class for all game entities
 * Implements the component-based entity system
 */

import { Position } from '../types/Position';
import { Component } from '../components/Component';
import { EventBus } from '../events/EventBus';

interface EntityAppearance {
  char: string;
  fg: string;
  bg: string;
}

export abstract class Entity {
  protected id: string;
  protected name: string;
  protected position: Position;
  protected appearance: EntityAppearance;
  protected components: Map<string, Component> = new Map();
  protected blocking: boolean = true;
  protected renderOrder: number = 1;
  protected eventBus: EventBus;
  
  constructor(eventBus: EventBus, name: string, x: number, y: number, appearance: EntityAppearance) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.position = { x, y };
    this.appearance = appearance;
    this.eventBus = eventBus;
  }
  
  /**
   * Get the entity's ID
   */
  public getId(): string {
    return this.id;
  }
  
  /**
   * Get the entity's name
   */
  public getName(): string {
    return this.name;
  }
  
  /**
   * Get the entity's position
   */
  public getPosition(): Position {
    return { ...this.position };
  }
  
  /**
   * Set the entity's position
   */
  public setPosition(x: number, y: number): void {
    const oldPosition = { ...this.position };
    this.position = { x, y };
    
    // Emit position changed event
    this.eventBus.emit('entity_moved', {
      entity: this,
      oldPosition,
      newPosition: this.position
    });
  }
  
  /**
   * Get the entity's appearance
   */
  public getAppearance(): EntityAppearance {
    return { ...this.appearance };
  }
  
  /**
   * Set the entity's appearance
   */
  public setAppearance(appearance: EntityAppearance): void {
    this.appearance = { ...appearance };
  }
  
  /**
   * Check if the entity blocks movement
   */
  public isBlocking(): boolean {
    return this.blocking;
  }
  
  /**
   * Set whether the entity blocks movement
   */
  public setBlocking(blocking: boolean): void {
    this.blocking = blocking;
  }
  
  /**
   * Get the entity's render order
   */
  public getRenderOrder(): number {
    return this.renderOrder;
  }
  
  /**
   * Set the entity's render order
   */
  public setRenderOrder(renderOrder: number): void {
    this.renderOrder = renderOrder;
  }
  
  /**
   * Add a component to the entity
   */
  public addComponent(component: Component): void {
    this.components.set(component.getType(), component);
    component.setEntity(this);
  }
  
  /**
   * Remove a component from the entity
   */
  public removeComponent(type: string): void {
    if (this.hasComponent(type)) {
      this.components.delete(type);
    }
  }
  
  /**
   * Get a component by type
   */
  public getComponent<T extends Component>(type: string): T | null {
    if (this.hasComponent(type)) {
      return this.components.get(type) as T;
    }
    return null;
  }
  
  /**
   * Check if the entity has a component
   */
  public hasComponent(type: string): boolean {
    return this.components.has(type);
  }
  
  /**
   * Update the entity
   */
  public update(delta: number): void {
    // Update all components
    this.components.forEach(component => {
      component.update(delta);
    });
  }
  
  /**
   * Perform the entity's action (for AI)
   */
  public abstract act(): void;
  
  /**
   * Check if the entity is hostile
   */
  public abstract isHostile(): boolean;
  
  /**
   * Check if the entity is dead
   */
  public abstract isDead(): boolean;
  
  /**
   * Serialize the entity for saving
   */
  public serialize(): any {
    const serializedComponents: { [key: string]: any } = {};
    this.components.forEach((component, type) => {
      serializedComponents[type] = component.serialize();
    });
    
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      appearance: this.appearance,
      components: serializedComponents,
      blocking: this.blocking,
      renderOrder: this.renderOrder
    };
  }
  
  /**
   * Deserialize the entity for loading
   */
  public abstract deserialize(data: any): void;
}
