/**
 * PhysicsSystem - Handles physics for entities
 */

import { System } from '../System';
import { World } from '../World';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';

export class PhysicsSystem extends System {
  // Required components for entities to be processed by this system
  public readonly requiredComponents: string[] = ['physics', 'transform', 'sprite'];
  
  // Reference to the scene
  private scene: Phaser.Scene;
  
  constructor(world: World, scene: Phaser.Scene) {
    super(world);
    this.scene = scene;
    this.priority = 10; // Physics should happen early
  }
  
  /**
   * Initialize the system
   */
  public initialize(): void {
    // Enable physics for all existing entities
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const physics = this.world.getComponent<PhysicsComponent>(entityId, 'physics');
      const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
      
      if (physics && sprite && sprite.sprite && !physics.body) {
        physics.enablePhysics(this.scene, sprite.sprite);
      }
    }
  }
  
  /**
   * Update the system
   */
  public update(time: number, delta: number): void {
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const physics = this.world.getComponent<PhysicsComponent>(entityId, 'physics');
      const transform = this.world.getComponent<TransformComponent>(entityId, 'transform');
      const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
      
      if (physics && transform && sprite) {
        // Enable physics if needed
        if (sprite.sprite && !physics.body) {
          physics.enablePhysics(this.scene, sprite.sprite);
        }
        
        // Update transform from physics body
        if (physics.body) {
          transform.x = physics.body.x + physics.body.width / 2;
          transform.y = physics.body.y + physics.body.height / 2;
          
          // Update physics properties
          physics.velocityX = physics.body.velocity.x;
          physics.velocityY = physics.body.velocity.y;
        }
      }
    }
  }
  
  /**
   * Clean up the system
   */
  public destroy(): void {
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const physics = this.world.getComponent<PhysicsComponent>(entityId, 'physics');
      const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
      
      if (physics && sprite && sprite.sprite) {
        physics.disablePhysics(this.scene, sprite.sprite);
      }
    }
  }
}





