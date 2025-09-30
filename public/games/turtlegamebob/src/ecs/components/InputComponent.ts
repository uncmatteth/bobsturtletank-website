/**
 * InputComponent - Input handling for an entity
 */

import { Component, registerComponentType } from '../Component';
import Phaser from 'phaser';

export class InputComponent extends Component {
  public moveSpeed: number = 200;
  public direction: { x: number, y: number } = { x: 0, y: 0 };
  public isAttacking: boolean = false;
  public isCasting: boolean = false;
  public isInteracting: boolean = false;
  
  // Input state
  public keys: {
    up?: Phaser.Input.Keyboard.Key;
    down?: Phaser.Input.Keyboard.Key;
    left?: Phaser.Input.Keyboard.Key;
    right?: Phaser.Input.Keyboard.Key;
    attack?: Phaser.Input.Keyboard.Key;
    cast?: Phaser.Input.Keyboard.Key;
    interact?: Phaser.Input.Keyboard.Key;
  } = {};
  
  // Virtual joystick for mobile
  public joystick: any = null;
  
  constructor(moveSpeed: number = 200) {
    super();
    this.moveSpeed = moveSpeed;
  }
  
  /**
   * Set up keyboard input
   */
  public setupKeyboardInput(scene: Phaser.Scene): void {
    this.keys = {
      up: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      attack: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      cast: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      interact: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F)
    };
    
    // Also add arrow keys
    const cursors = scene.input.keyboard?.createCursorKeys();
    if (cursors) {
      this.keys.up = this.keys.up || cursors.up;
      this.keys.down = this.keys.down || cursors.down;
      this.keys.left = this.keys.left || cursors.left;
      this.keys.right = this.keys.right || cursors.right;
    }
  }
  
  /**
   * Set up virtual joystick for mobile
   */
  public setupVirtualJoystick(scene: Phaser.Scene): void {
    // This would use the Rex UI plugin in a real implementation
    // For now, we'll just create a placeholder
    this.joystick = {
      createCursorKeys: () => ({
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false }
      }),
      force: 0,
      angle: 0
    };
  }
  
  /**
   * Update input state
   */
  public updateInput(): void {
    // Reset direction
    this.direction.x = 0;
    this.direction.y = 0;
    
    // Check keyboard input
    if (this.keys.up?.isDown) {
      this.direction.y = -1;
    } else if (this.keys.down?.isDown) {
      this.direction.y = 1;
    }
    
    if (this.keys.left?.isDown) {
      this.direction.x = -1;
    } else if (this.keys.right?.isDown) {
      this.direction.x = 1;
    }
    
    // Check joystick input
    if (this.joystick) {
      const joystickKeys = this.joystick.createCursorKeys();
      
      if (joystickKeys.up.isDown) {
        this.direction.y = -1;
      } else if (joystickKeys.down.isDown) {
        this.direction.y = 1;
      }
      
      if (joystickKeys.left.isDown) {
        this.direction.x = -1;
      } else if (joystickKeys.right.isDown) {
        this.direction.x = 1;
      }
    }
    
    // Normalize direction vector for diagonal movement
    const length = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
    if (length > 0) {
      this.direction.x /= length;
      this.direction.y /= length;
    }
    
    // Check action input
    this.isAttacking = !!this.keys.attack?.isDown;
    this.isCasting = !!this.keys.cast?.isDown;
    this.isInteracting = !!this.keys.interact?.isDown;
  }
}

// Register component type
registerComponentType(InputComponent, 'input');
