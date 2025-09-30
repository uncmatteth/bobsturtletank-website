/**
 * PhysicsComponent - Physics properties for an entity
 */

import { Component, registerComponentType } from '../Component';
import Phaser from 'phaser';

export class PhysicsComponent extends Component {
  public body: Phaser.Physics.Arcade.Body | null = null;
  public velocityX: number = 0;
  public velocityY: number = 0;
  public acceleration: number = 0;
  public drag: number = 0;
  public bounce: number = 0;
  public collideWorldBounds: boolean = true;
  public width: number = 32;
  public height: number = 32;
  public offsetX: number = 0;
  public offsetY: number = 0;
  
  constructor(options: Partial<PhysicsComponent> = {}) {
    super();
    Object.assign(this, options);
  }
  
  /**
   * Enable physics on a sprite
   */
  public enablePhysics(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite): Phaser.Physics.Arcade.Body {
    scene.physics.world.enable(sprite);
    
    this.body = sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setVelocity(this.velocityX, this.velocityY);
    this.body.setAcceleration(this.acceleration, this.acceleration);
    this.body.setDrag(this.drag, this.drag);
    this.body.setBounce(this.bounce, this.bounce);
    this.body.setCollideWorldBounds(this.collideWorldBounds);
    this.body.setSize(this.width, this.height);
    this.body.setOffset(this.offsetX, this.offsetY);
    
    return this.body;
  }
  
  /**
   * Disable physics on a sprite
   */
  public disablePhysics(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite): void {
    if (this.body) {
      scene.physics.world.disable(sprite);
      this.body = null;
    }
  }
}

// Register component type
registerComponentType(PhysicsComponent, 'physics');
