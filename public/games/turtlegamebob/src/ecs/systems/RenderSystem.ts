/**
 * RenderSystem - Handles rendering entities with sprites
 */

import { System } from '../System';
import { World } from '../World';
import { SpriteComponent } from '../components/SpriteComponent';
import { TransformComponent } from '../components/TransformComponent';

export class RenderSystem extends System {
  // Required components for entities to be processed by this system
  public readonly requiredComponents: string[] = ['sprite', 'transform'];
  
  // Reference to the scene
  private scene: Phaser.Scene;
  
  constructor(world: World, scene: Phaser.Scene) {
    super(world);
    this.scene = scene;
    this.priority = 100; // Render should happen last
  }
  
  /**
   * Initialize the system
   */
  public initialize(): void {
    // Create sprites for all existing entities
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
      const transform = this.world.getComponent<TransformComponent>(entityId, 'transform');
      
      if (sprite && transform && !sprite.sprite) {
        sprite.createSprite(this.scene, transform.x, transform.y);
      }
    }
  }
  
  /**
   * Update the system
   */
  public update(time: number, delta: number): void {
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
      const transform = this.world.getComponent<TransformComponent>(entityId, 'transform');
      
      if (sprite && transform) {
        // Create sprite if it doesn't exist
        if (!sprite.sprite) {
          sprite.createSprite(this.scene, transform.x, transform.y);
        }
        
        // Update sprite properties
        if (sprite.sprite) {
          sprite.sprite.setPosition(transform.x, transform.y);
          sprite.sprite.setRotation(transform.rotation);
          sprite.sprite.setScale(transform.scaleX, transform.scaleY);
          sprite.sprite.setVisible(sprite.visible);
          sprite.sprite.setAlpha(sprite.alpha);
          sprite.sprite.setTint(sprite.tint);
          sprite.sprite.setDepth(sprite.depth);
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
      const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
      
      if (sprite) {
        sprite.destroySprite();
      }
    }
  }
}





