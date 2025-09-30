/**
 * AnimationComponent - Animation properties for an entity
 */

import { Component, registerComponentType } from '../Component';
import Phaser from 'phaser';

export class AnimationComponent extends Component {
  public currentAnimation: string | null = null;
  public animations: Map<string, string> = new Map();
  public frameRate: number = 10;
  public repeat: number = -1; // -1 = loop forever
  
  constructor(animations: Record<string, string> = {}) {
    super();
    
    // Convert animations object to map
    Object.entries(animations).forEach(([key, value]) => {
      this.animations.set(key, value);
    });
  }
  
  /**
   * Play an animation on a sprite
   */
  public playAnimation(sprite: Phaser.GameObjects.Sprite, key: string): boolean {
    if (!this.animations.has(key)) {
      return false;
    }
    
    const animKey = this.animations.get(key)!;
    
    if (this.currentAnimation !== animKey) {
      sprite.play(animKey, true);
      this.currentAnimation = animKey;
    }
    
    return true;
  }
  
  /**
   * Stop the current animation
   */
  public stopAnimation(sprite: Phaser.GameObjects.Sprite): void {
    if (this.currentAnimation) {
      sprite.stop();
      this.currentAnimation = null;
    }
  }
  
  /**
   * Add an animation mapping
   */
  public addAnimation(key: string, animationKey: string): void {
    this.animations.set(key, animationKey);
  }
}

// Register component type
registerComponentType(AnimationComponent, 'animation');
