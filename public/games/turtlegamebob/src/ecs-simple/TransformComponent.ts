/**
 * TransformComponent - Position, rotation, and scale
 */

import { Component, ComponentRegistry } from './Component';

export class TransformComponent extends Component {
  public static readonly type: string = 'transform';
  
  public x: number = 0;
  public y: number = 0;
  public rotation: number = 0;
  public scaleX: number = 1;
  public scaleY: number = 1;
  
  constructor(x: number = 0, y: number = 0, rotation: number = 0, scaleX: number = 1, scaleY: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }
}

// Register component
ComponentRegistry[TransformComponent.type] = TransformComponent;





