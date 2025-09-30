/**
 * InputSystem - Handles input for player-controlled entities
 */

import { System } from '../System';
import { World } from '../World';
import { InputComponent } from '../components/InputComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';

export class InputSystem extends System {
  // Required components for entities to be processed by this system
  public readonly requiredComponents: string[] = ['input'];
  
  // Reference to the scene
  private scene: Phaser.Scene;
  
  constructor(world: World, scene: Phaser.Scene) {
    super(world);
    this.scene = scene;
    this.priority = 0; // Input should happen first
  }
  
  /**
   * Initialize the system
   */
  public initialize(): void {
    // Set up input for all existing entities
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const input = this.world.getComponent<InputComponent>(entityId, 'input');
      
      if (input) {
        input.setupKeyboardInput(this.scene);
        
        // Set up virtual joystick for mobile
        if (this.scene.sys.game.device.input.touch) {
          input.setupVirtualJoystick(this.scene);
        }
      }
    }
  }
  
  /**
   * Update the system
   */
  public update(time: number, delta: number): void {
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const input = this.world.getComponent<InputComponent>(entityId, 'input');
      
      if (input) {
        // Update input state
        input.updateInput();
        
        // Apply movement to physics if available
        const physics = this.world.getComponent<PhysicsComponent>(entityId, 'physics');
        
        if (physics && physics.body) {
          physics.body.setVelocity(
            input.direction.x * input.moveSpeed,
            input.direction.y * input.moveSpeed
          );
        }
      }
    }
  }
}





