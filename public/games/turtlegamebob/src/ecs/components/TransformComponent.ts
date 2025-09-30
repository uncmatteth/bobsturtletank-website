/**
 * TransformComponent - Position, rotation, and scale of an entity
 */

import { Component, registerComponentType } from '../Component';

export class TransformComponent extends Component {
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

// Register component type
registerComponentType(TransformComponent, 'transform');
