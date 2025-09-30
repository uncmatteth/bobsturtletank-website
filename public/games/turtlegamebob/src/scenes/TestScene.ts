/**
 * TestScene - A simple scene to test our ECS system
 */

import Phaser from 'phaser';
import { World, Entity, TransformComponent } from '../ecs-simple';

export class TestScene extends Phaser.Scene {
  private world!: World;
  private player!: Entity;
  private text!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'TestScene' });
  }
  
  create(): void {
    // Create ECS world
    this.world = new World();
    
    // Create player entity
    this.player = this.world.createEntity();
    this.player.addComponent(new TransformComponent(400, 300));
    
    // Add a sprite for the player
    const sprite = this.add.sprite(400, 300, 'placeholder_hero');
    
    // Add text to show the scene is working
    this.text = this.add.text(10, 10, 'Test Scene - ECS Working!', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    // Add instructions
    this.add.text(10, 50, 'Use arrow keys to move', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    // Setup input
    this.setupInput();
  }
  
  update(time: number, delta: number): void {
    // Update ECS world
    this.world.update(time, delta);
    
    // Get player transform
    const transform = this.player.getComponent<TransformComponent>('transform');
    if (transform) {
      // Update text to show player position
      this.text.setText(`Test Scene - Position: ${Math.round(transform.x)}, ${Math.round(transform.y)}`);
    }
  }
  
  private setupInput(): void {
    // Get player transform
    const transform = this.player.getComponent<TransformComponent>('transform');
    if (!transform) return;
    
    // Create cursor keys
    const cursors = this.input.keyboard?.createCursorKeys();
    if (!cursors) return;
    
    // Update event
    this.events.on('update', () => {
      const speed = 5;
      
      if (cursors.left?.isDown) {
        transform.x -= speed;
      } else if (cursors.right?.isDown) {
        transform.x += speed;
      }
      
      if (cursors.up?.isDown) {
        transform.y -= speed;
      } else if (cursors.down?.isDown) {
        transform.y += speed;
      }
    });
  }
}





