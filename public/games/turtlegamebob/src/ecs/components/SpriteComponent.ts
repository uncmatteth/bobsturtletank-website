/**
 * SpriteComponent - Visual representation of an entity
 */

import { Component, registerComponentType } from '../Component';
import Phaser from 'phaser';

export class SpriteComponent extends Component {
  public sprite: Phaser.GameObjects.Sprite | null = null;
  public textureKey: string;
  public frame?: string | number;
  public depth: number = 0;
  public visible: boolean = true;
  public alpha: number = 1;
  public tint: number = 0xffffff;
  
  constructor(textureKey: string, frame?: string | number) {
    super();
    this.textureKey = textureKey;
    this.frame = frame;
  }
  
  /**
   * Create a sprite game object in the given scene
   */
  public createSprite(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Sprite {
    this.sprite = scene.add.sprite(x, y, this.textureKey, this.frame);
    this.sprite.setDepth(this.depth);
    this.sprite.setVisible(this.visible);
    this.sprite.setAlpha(this.alpha);
    this.sprite.setTint(this.tint);
    
    return this.sprite;
  }
  
  /**
   * Destroy the sprite game object
   */
  public destroySprite(): void {
    if (this.sprite && this.sprite.scene) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

// Register component type
registerComponentType(SpriteComponent, 'sprite');
