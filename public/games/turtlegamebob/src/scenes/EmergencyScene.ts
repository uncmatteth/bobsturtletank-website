/**
 * EmergencyScene - A minimal scene to get the game running
 */

import Phaser from 'phaser';

export class EmergencyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EmergencyScene' });
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // Create a simple turtle
    this.createSimpleTurtle(centerX, centerY);
    
    // Add title text
    this.add.text(centerX, centerY - 150, '🐢 BOB THE TURTLE', {
      fontSize: '48px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.add.text(centerX, centerY - 100, 'HERO OF TURTLE DUNGEON DEPTHS', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Add instructions
    this.add.text(centerX, centerY + 150, 'Use arrow keys to move', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Add status text
    this.add.text(centerX, centerY + 200, 'EMERGENCY MODE - ECS BYPASSED', {
      fontSize: '14px',
      color: '#ff8888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Setup keyboard input
    this.setupInput();
  }
  
  private createSimpleTurtle(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Create turtle body (shell)
    const shell = this.add.circle(0, 0, 40, 0x006600);
    container.add(shell);
    
    // Create turtle head
    const head = this.add.circle(-50, 0, 20, 0x00aa00);
    container.add(head);
    
    // Create turtle legs
    const legFrontLeft = this.add.circle(-20, -30, 15, 0x00aa00);
    const legFrontRight = this.add.circle(-20, 30, 15, 0x00aa00);
    const legBackLeft = this.add.circle(20, -30, 15, 0x00aa00);
    const legBackRight = this.add.circle(20, 30, 15, 0x00aa00);
    container.add([legFrontLeft, legFrontRight, legBackLeft, legBackRight]);
    
    // Create turtle eyes
    const eyeLeft = this.add.circle(-60, -10, 5, 0xffffff);
    const eyeRight = this.add.circle(-60, 10, 5, 0xffffff);
    container.add([eyeLeft, eyeRight]);
    
    // Create turtle shell pattern
    const shellPattern = this.add.circle(0, 0, 30, 0x008800);
    container.add(shellPattern);
    
    // Add to the scene
    return container;
  }
  
  private setupInput(): void {
    // Get reference to the container (first child is our turtle)
    const turtle = this.children.getAt(0) as Phaser.GameObjects.Container;
    
    // Create cursor keys
    const cursors = this.input.keyboard?.createCursorKeys();
    if (!cursors) return;
    
    // Update event
    this.events.on('update', () => {
      const speed = 5;
      
      if (cursors.left?.isDown) {
        turtle.x -= speed;
        turtle.setScale(-1, 1); // Flip to face left
      } else if (cursors.right?.isDown) {
        turtle.x += speed;
        turtle.setScale(1, 1); // Face right
      }
      
      if (cursors.up?.isDown) {
        turtle.y -= speed;
      } else if (cursors.down?.isDown) {
        turtle.y += speed;
      }
    });
  }
}





