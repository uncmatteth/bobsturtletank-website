/**
 * EnvironmentManager - Handles environment objects like doors, stairs, and torches
 * Integrates PixelLab generated environment assets with the game
 */

import Phaser from 'phaser';
import { CharacterManager } from './CharacterManager';

export interface EnvironmentObjectConfig {
  key: string;
  name: string;
  description: string;
  type: 'door' | 'stairs' | 'torch' | 'chest' | 'trap' | 'decoration';
  interactive: boolean;
  solid: boolean;
  lightSource?: boolean;
  lightColor?: number;
  lightIntensity?: number;
  lightRadius?: number;
  animationFrameRate?: number;
}

export class EnvironmentObject extends Phaser.GameObjects.Container {
  // Object properties
  public key: string;
  public name: string;
  public description: string;
  public type: 'door' | 'stairs' | 'torch' | 'chest' | 'trap' | 'decoration';
  public interactive: boolean;
  public solid: boolean;
  
  // Sprite and physics
  private sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body | null = null;
  
  // Light properties
  private lightSource: boolean;
  private lightColor: number;
  private lightIntensity: number;
  private lightRadius: number;
  private light: Phaser.GameObjects.Light | null = null;
  
  // State
  private isOpen: boolean = false;
  private isUsed: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, config: EnvironmentObjectConfig, characterManager: CharacterManager) {
    super(scene, x, y);
    
    // Set properties
    this.key = config.key;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this.interactive = config.interactive;
    this.solid = config.solid;
    this.lightSource = config.lightSource || false;
    this.lightColor = config.lightColor || 0xFFFF00;
    this.lightIntensity = config.lightIntensity || 1;
    this.lightRadius = config.lightRadius || 100;
    
    // Create sprite
    const objSprite = characterManager.createSprite(0, 0, config.key);
    
    if (objSprite) {
      this.sprite = objSprite;
    } else {
      // Fallback to placeholder sprite
      console.warn(`⚠️ Using fallback sprite for environment object: ${config.key}`);
      this.sprite = scene.add.sprite(0, 0, 'fallback_environment');
      
      // Color based on type
      switch (config.type) {
        case 'door':
          this.sprite.setTint(0x8B4513); // Brown
          break;
        case 'stairs':
          this.sprite.setTint(0x808080); // Gray
          break;
        case 'torch':
          this.sprite.setTint(0xFFA500); // Orange
          break;
        case 'chest':
          this.sprite.setTint(0xFFD700); // Gold
          break;
        case 'trap':
          this.sprite.setTint(0xFF0000); // Red
          break;
        case 'decoration':
          this.sprite.setTint(0xFFFFFF); // White
          break;
      }
    }
    
    // Add sprite to container
    this.add(this.sprite);
    
    // Set up physics if solid
    if (this.solid) {
      scene.physics.world.enable(this);
      this.body = this.body as Phaser.Physics.Arcade.Body;
      this.body.setSize(32, 32);
      this.body.setOffset(-16, -16);
      this.body.setImmovable(true);
    }
    
    // Set up light if light source
    if (this.lightSource && scene.lights && scene.lights.addLight) {
      this.light = scene.lights.addLight(x, y, this.lightRadius, this.lightColor, this.lightIntensity);
      
      // Add flicker effect for torches
      if (this.type === 'torch') {
        this.addFlickerEffect();
      }
    }
    
    // Set up animation if available
    if (config.animationFrameRate) {
      this.sprite.play(`${config.key}_idle`, true);
    }
    
    // Make interactive if needed
    if (this.interactive) {
      this.sprite.setInteractive();
      this.sprite.on('pointerdown', () => {
        this.interact();
      });
    }
    
    // Add to scene
    scene.add.existing(this);
    
    console.log(`🏛️ Environment object created: ${config.name} (${config.type})`);
  }
  
  /**
   * Add flicker effect to light
   */
  private addFlickerEffect(): void {
    if (!this.light) return;
    
    // Create random flicker
    this.scene.tweens.add({
      targets: this.light,
      intensity: {
        value: { from: this.lightIntensity * 0.8, to: this.lightIntensity * 1.2 },
        duration: 100,
        ease: 'Sine.easeInOut',
        yoyo: true
      },
      radius: {
        value: { from: this.lightRadius * 0.9, to: this.lightRadius * 1.1 },
        duration: 200,
        ease: 'Sine.easeInOut',
        yoyo: true
      },
      repeat: -1,
      repeatDelay: 100
    });
  }
  
  /**
   * Interact with the object
   */
  public interact(): void {
    switch (this.type) {
      case 'door':
        this.toggleDoor();
        break;
      case 'stairs':
        this.useStairs();
        break;
      case 'torch':
        this.toggleTorch();
        break;
      case 'chest':
        this.openChest();
        break;
      case 'trap':
        this.triggerTrap();
        break;
    }
    
    // Emit interact event
    this.scene.events.emit('environment-interact', this);
  }
  
  /**
   * Toggle door open/closed
   */
  private toggleDoor(): void {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      // Open door
      this.sprite.setFrame(1); // Assuming frame 1 is open door
      
      // Disable collision
      if (this.body) {
        this.body.checkCollision.none = true;
      }
      
      // Play sound
      this.scene.sound.play('door_open', { volume: 0.5 });
      
      console.log(`🚪 Door opened: ${this.name}`);
    } else {
      // Close door
      this.sprite.setFrame(0); // Assuming frame 0 is closed door
      
      // Enable collision
      if (this.body) {
        this.body.checkCollision.none = false;
      }
      
      // Play sound
      this.scene.sound.play('door_close', { volume: 0.5 });
      
      console.log(`🚪 Door closed: ${this.name}`);
    }
  }
  
  /**
   * Use stairs
   */
  private useStairs(): void {
    if (this.isUsed) return;
    
    // Mark as used
    this.isUsed = true;
    
    // Play sound
    this.scene.sound.play('stairs', { volume: 0.5 });
    
    // Emit stairs used event
    this.scene.events.emit('stairs-used', this);
    
    console.log(`🔽 Stairs used: ${this.name}`);
  }
  
  /**
   * Toggle torch
   */
  private toggleTorch(): void {
    if (!this.light) return;
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      // Turn on
      this.light.setVisible(true);
      
      // Play sound
      this.scene.sound.play('torch_light', { volume: 0.5 });
      
      console.log(`🔥 Torch lit: ${this.name}`);
    } else {
      // Turn off
      this.light.setVisible(false);
      
      // Play sound
      this.scene.sound.play('torch_extinguish', { volume: 0.5 });
      
      console.log(`🔥 Torch extinguished: ${this.name}`);
    }
  }
  
  /**
   * Open chest
   */
  private openChest(): void {
    if (this.isUsed) return;
    
    // Mark as used
    this.isUsed = true;
    
    // Change sprite
    this.sprite.setFrame(1); // Assuming frame 1 is open chest
    
    // Play sound
    this.scene.sound.play('chest_open', { volume: 0.5 });
    
    // Emit chest opened event
    this.scene.events.emit('chest-opened', this);
    
    console.log(`📦 Chest opened: ${this.name}`);
  }
  
  /**
   * Trigger trap
   */
  private triggerTrap(): void {
    if (this.isUsed) return;
    
    // Mark as used
    this.isUsed = true;
    
    // Change sprite
    this.sprite.setFrame(1); // Assuming frame 1 is triggered trap
    
    // Play sound
    this.scene.sound.play('trap_trigger', { volume: 0.5 });
    
    // Emit trap triggered event
    this.scene.events.emit('trap-triggered', this);
    
    console.log(`⚠️ Trap triggered: ${this.name}`);
  }
  
  /**
   * Update object
   */
  public update(time: number, delta: number): void {
    // Update light position if moved
    if (this.light) {
      this.light.x = this.x;
      this.light.y = this.y;
    }
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Remove light
    if (this.light && this.scene.lights) {
      this.scene.lights.removeLight(this.light);
    }
    
    // Call parent destroy
    super.destroy();
  }
}

export class EnvironmentManager {
  private scene: Phaser.Scene;
  private characterManager: CharacterManager;
  private objects: EnvironmentObject[] = [];
  private objectConfigs: Map<string, EnvironmentObjectConfig> = new Map();
  
  constructor(scene: Phaser.Scene, characterManager: CharacterManager) {
    this.scene = scene;
    this.characterManager = characterManager;
    
    console.log('🏛️ EnvironmentManager initialized');
    
    // Register object configs
    this.registerObjectConfigs();
  }
  
  /**
   * Register object configurations
   */
  private registerObjectConfigs(): void {
    // Door
    this.objectConfigs.set('dungeon_door', {
      key: 'dungeon_door',
      name: 'Dungeon Door',
      description: 'A sturdy wooden door.',
      type: 'door',
      interactive: true,
      solid: true
    });
    
    // Stairs
    this.objectConfigs.set('stairs_down', {
      key: 'stairs_down',
      name: 'Stairs Down',
      description: 'Stairs leading deeper into the dungeon.',
      type: 'stairs',
      interactive: true,
      solid: false
    });
    
    // Torch
    this.objectConfigs.set('torch_flame', {
      key: 'torch_flame',
      name: 'Torch',
      description: 'A flickering torch providing light.',
      type: 'torch',
      interactive: true,
      solid: false,
      lightSource: true,
      lightColor: 0xFF6600,
      lightIntensity: 1,
      lightRadius: 150,
      animationFrameRate: 10
    });
  }
  
  /**
   * Spawn an environment object
   */
  public spawnObject(
    x: number,
    y: number,
    type: string
  ): EnvironmentObject | null {
    // Get object config
    const config = this.objectConfigs.get(type);
    if (!config) {
      console.warn(`⚠️ Unknown environment object type: ${type}`);
      return null;
    }
    
    // Create object
    const object = new EnvironmentObject(this.scene, x, y, config, this.characterManager);
    
    // Add to objects list
    this.objects.push(object);
    
    return object;
  }
  
  /**
   * Update all objects
   */
  public update(time: number, delta: number): void {
    // Update each object
    for (const object of this.objects) {
      object.update(time, delta);
    }
  }
  
  /**
   * Get all objects
   */
  public getObjects(): EnvironmentObject[] {
    return this.objects;
  }
  
  /**
   * Get objects by type
   */
  public getObjectsByType(type: 'door' | 'stairs' | 'torch' | 'chest' | 'trap' | 'decoration'): EnvironmentObject[] {
    return this.objects.filter(object => object.type === type);
  }
  
  /**
   * Remove an object
   */
  public removeObject(object: EnvironmentObject): void {
    const index = this.objects.indexOf(object);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }
  
  /**
   * Clear all objects
   */
  public clearObjects(): void {
    // Destroy all objects
    for (const object of this.objects) {
      object.destroy();
    }
    
    // Clear array
    this.objects = [];
  }
  
  /**
   * Destroy manager
   */
  public destroy(): void {
    this.clearObjects();
    console.log('🏛️ EnvironmentManager destroyed');
  }
}
