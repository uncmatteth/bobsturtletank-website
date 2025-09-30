/**
 * AnimationSystem - Handles animations for entities
 */

import { System } from '../System';
import { World } from '../World';
import { AnimationComponent } from '../components/AnimationComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { InputComponent } from '../components/InputComponent';

export class AnimationSystem extends System {
  // Required components for entities to be processed by this system
  public readonly requiredComponents: string[] = ['animation', 'sprite'];
  
  constructor(world: World) {
    super(world);
    this.priority = 50; // Animation should happen after input but before rendering
  }
  
  /**
   * Update the system
   */
  public update(time: number, delta: number): void {
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const animation = this.world.getComponent<AnimationComponent>(entityId, 'animation');
      const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
      
      if (animation && sprite && sprite.sprite) {
        // Determine animation to play based on input (if available)
        const input = this.world.getComponent<InputComponent>(entityId, 'input');
        
        if (input) {
          this.updatePlayerAnimation(entityId, animation, sprite, input);
        } else {
          // For non-player entities, use a simple animation system
          this.updateNonPlayerAnimation(entityId, animation, sprite);
        }
      }
    }
  }
  
  /**
   * Update animation for player entities
   */
  private updatePlayerAnimation(
    entityId: number, 
    animation: AnimationComponent, 
    sprite: SpriteComponent, 
    input: InputComponent
  ): void {
    if (!sprite.sprite) return;
    
    // Determine animation based on input
    let animKey = 'idle';
    
    if (input.isAttacking) {
      animKey = 'attack';
    } else if (input.isCasting) {
      animKey = 'cast';
    } else if (input.direction.x !== 0 || input.direction.y !== 0) {
      animKey = 'walk';
      
      // Determine direction suffix
      let dirSuffix = '_down';
      
      if (Math.abs(input.direction.y) > Math.abs(input.direction.x)) {
        dirSuffix = input.direction.y < 0 ? '_up' : '_down';
      } else {
        dirSuffix = input.direction.x < 0 ? '_left' : '_right';
      }
      
      animKey += dirSuffix;
    } else {
      animKey = 'idle_down';
    }
    
    // Play the animation
    animation.playAnimation(sprite.sprite, animKey);
  }
  
  /**
   * Update animation for non-player entities
   */
  private updateNonPlayerAnimation(
    entityId: number, 
    animation: AnimationComponent, 
    sprite: SpriteComponent
  ): void {
    if (!sprite.sprite) return;
    
    // For now, just play the idle animation if available
    if (animation.animations.has('idle')) {
      animation.playAnimation(sprite.sprite, 'idle');
    }
  }
}





