/**
 * EnemyManager - Handles enemy spawning, AI, and behaviors
 * Integrates PixelLab generated enemy assets with the game
 */

import Phaser from 'phaser';
import { CharacterManager } from './CharacterManager';

export interface EnemyConfig {
  key: string;
  name: string;
  health: number;
  speed: number;
  damage: number;
  attackRange: number;
  detectionRange: number;
  experience: number;
  lootTable?: {
    itemKey: string;
    chance: number;
  }[];
}

export class Enemy extends Phaser.GameObjects.Container {
  // Enemy properties
  public key: string;
  public name: string;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public damage: number;
  public attackRange: number;
  public detectionRange: number;
  public experience: number;
  public lootTable?: { itemKey: string; chance: number }[];
  
  // Sprite and physics
  private sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  
  // AI state
  private state: 'idle' | 'chase' | 'attack' | 'stunned' = 'idle';
  private target: Phaser.GameObjects.GameObject | null = null;
  private attackCooldown: number = 0;
  private stunTimer: number = 0;
  
  // Visual effects
  private healthBar: Phaser.GameObjects.Graphics;
  private damageFlash: Phaser.Time.TimerEvent | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig, characterManager: CharacterManager) {
    super(scene, x, y);
    
    // Set properties
    this.key = config.key;
    this.name = config.name;
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed;
    this.damage = config.damage;
    this.attackRange = config.attackRange;
    this.detectionRange = config.detectionRange;
    this.experience = config.experience;
    this.lootTable = config.lootTable;
    
    // Create sprite
    const enemySprite = characterManager.createSprite(0, 0, config.key);
    
    if (enemySprite) {
      this.sprite = enemySprite;
    } else {
      // Fallback to placeholder sprite
      console.warn(`⚠️ Using fallback sprite for enemy: ${config.key}`);
      this.sprite = scene.add.sprite(0, 0, 'fallback_enemy');
      this.createFallbackAnimations(config.key);
    }
    
    // Add sprite to container
    this.add(this.sprite);
    
    // Create health bar
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
    this.add(this.healthBar);
    
    // Set up physics
    scene.physics.world.enable(this);
    this.body.setSize(24, 24);
    this.body.setOffset(-12, -12);
    
    // Add to scene
    scene.add.existing(this);
    
    console.log(`👹 Enemy created: ${config.name}`);
  }
  
  /**
   * Update enemy logic
   */
  public update(time: number, delta: number): void {
    // Update stun timer
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        this.state = 'idle';
        this.sprite.clearTint();
      } else {
        return; // Skip AI while stunned
      }
    }
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    
    // Run AI based on state
    switch (this.state) {
      case 'idle':
        this.idleState();
        break;
      case 'chase':
        this.chaseState();
        break;
      case 'attack':
        this.attackState();
        break;
    }
  }
  
  /**
   * Set target for enemy
   */
  public setTarget(target: Phaser.GameObjects.GameObject): void {
    this.target = target;
    
    // Start chasing if target is within detection range
    if (this.isTargetInRange(this.detectionRange)) {
      this.state = 'chase';
    }
  }
  
  /**
   * Check if target is in range
   */
  private isTargetInRange(range: number): boolean {
    if (!this.target || !('x' in this.target) || !('y' in this.target)) {
      return false;
    }
    
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );
    
    return distance <= range;
  }
  
  /**
   * Idle state logic
   */
  private idleState(): void {
    // Reset velocity
    this.body.setVelocity(0);
    
    // Play idle animation
    this.sprite.play(`${this.key}_idle`, true);
    
    // Check for target in detection range
    if (this.target && this.isTargetInRange(this.detectionRange)) {
      this.state = 'chase';
    }
  }
  
  /**
   * Chase state logic
   */
  private chaseState(): void {
    // Check if target is valid
    if (!this.target || !('x' in this.target) || !('y' in this.target)) {
      this.state = 'idle';
      return;
    }
    
    // Check if target is in attack range
    if (this.isTargetInRange(this.attackRange)) {
      this.state = 'attack';
      return;
    }
    
    // Check if target is out of detection range
    if (!this.isTargetInRange(this.detectionRange * 1.5)) {
      this.state = 'idle';
      return;
    }
    
    // Move towards target
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );
    
    this.body.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
    
    // Set sprite direction
    if (this.body.velocity.x < 0) {
      this.sprite.setFlipX(true);
    } else if (this.body.velocity.x > 0) {
      this.sprite.setFlipX(false);
    }
    
    // Play walk animation
    this.sprite.play(`${this.key}_walk`, true);
  }
  
  /**
   * Attack state logic
   */
  private attackState(): void {
    // Check if target is valid
    if (!this.target || !('x' in this.target) || !('y' in this.target)) {
      this.state = 'idle';
      return;
    }
    
    // Check if target is out of attack range
    if (!this.isTargetInRange(this.attackRange * 1.2)) {
      this.state = 'chase';
      return;
    }
    
    // Stop movement
    this.body.setVelocity(0);
    
    // Set sprite direction
    const targetX = (this.target as any).x;
    if (targetX < this.x) {
      this.sprite.setFlipX(true);
    } else {
      this.sprite.setFlipX(false);
    }
    
    // Attack if cooldown is ready
    if (this.attackCooldown <= 0) {
      this.attack();
    } else {
      // Play idle animation while waiting
      this.sprite.play(`${this.key}_idle`, true);
    }
  }
  
  /**
   * Perform attack
   */
  private attack(): void {
    // Set cooldown
    this.attackCooldown = 1000; // 1 second
    
    // Play attack animation
    this.sprite.play(`${this.key}_attack`);
    
    // Emit attack event
    this.scene.events.emit('enemy-attack', this, this.target);
  }
  
  /**
   * Take damage
   */
  public takeDamage(amount: number): void {
    // Apply damage
    this.health -= amount;
    
    // Clamp health
    this.health = Math.max(0, this.health);
    
    // Update health bar
    this.updateHealthBar();
    
    // Flash red
    this.sprite.setTint(0xFF0000);
    if (this.damageFlash) {
      this.damageFlash.remove();
    }
    this.damageFlash = this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
    
    // Apply knockback
    this.stun(300); // 300ms stun
    
    // Check for death
    if (this.health <= 0) {
      this.die();
    }
    
    // Emit damage event
    this.scene.events.emit('enemy-damaged', this, amount);
  }
  
  /**
   * Stun the enemy
   */
  public stun(duration: number): void {
    this.state = 'stunned';
    this.stunTimer = duration;
    this.body.setVelocity(0);
    this.sprite.setTint(0xAAAAAA);
  }
  
  /**
   * Die
   */
  private die(): void {
    // Play death animation
    this.sprite.play(`${this.key}_idle`);
    this.sprite.setTint(0x555555);
    
    // Disable physics
    this.body.setVelocity(0);
    
    // Fade out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        // Drop loot
        this.dropLoot();
        
        // Emit death event
        this.scene.events.emit('enemy-died', this);
        
        // Destroy
        this.destroy();
      }
    });
  }
  
  /**
   * Drop loot
   */
  private dropLoot(): void {
    // Check if loot table exists
    if (!this.lootTable || this.lootTable.length === 0) {
      return;
    }
    
    // Roll for loot
    for (const lootEntry of this.lootTable) {
      if (Math.random() <= lootEntry.chance) {
        // Emit loot drop event
        this.scene.events.emit('enemy-loot', this, lootEntry.itemKey);
        break; // Only drop one item
      }
    }
  }
  
  /**
   * Update health bar
   */
  private updateHealthBar(): void {
    // Clear graphics
    this.healthBar.clear();
    
    // Draw health bar
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(-15, -25, 30, 4);
    this.healthBar.fillStyle(0xFF0000);
    this.healthBar.fillRect(-15, -25, 30 * (this.health / this.maxHealth), 4);
  }
  
  /**
   * Create fallback animations
   */
  private createFallbackAnimations(key: string): void {
    // Check if animations already exist
    if (this.scene.anims.exists(`${key}_idle`)) {
      return;
    }
    
    // Create idle animation
    this.scene.anims.create({
      key: `${key}_idle`,
      frames: [{ key: 'fallback_enemy', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    // Create walk animation
    this.scene.anims.create({
      key: `${key}_walk`,
      frames: [
        { key: 'fallback_enemy', frame: 0 },
        { key: 'fallback_enemy', frame: 0 }
      ],
      frameRate: 10,
      repeat: -1
    });
    
    // Create attack animation
    this.scene.anims.create({
      key: `${key}_attack`,
      frames: [{ key: 'fallback_enemy', frame: 0 }],
      frameRate: 10,
      repeat: 0
    });
  }
}

export class EnemyManager {
  private scene: Phaser.Scene;
  private characterManager: CharacterManager;
  private enemies: Enemy[] = [];
  private enemyConfigs: Map<string, EnemyConfig> = new Map();
  
  constructor(scene: Phaser.Scene, characterManager: CharacterManager) {
    this.scene = scene;
    this.characterManager = characterManager;
    
    console.log('👹 EnemyManager initialized');
    
    // Register enemy configs
    this.registerEnemyConfigs();
  }
  
  /**
   * Register enemy configurations
   */
  private registerEnemyConfigs(): void {
    // Red Goblin
    this.enemyConfigs.set('red_goblin', {
      key: 'red_goblin',
      name: 'Red Goblin',
      health: 50,
      speed: 100,
      damage: 10,
      attackRange: 50,
      detectionRange: 200,
      experience: 20,
      lootTable: [
        { itemKey: 'health_potion', chance: 0.2 },
        { itemKey: 'gold_coin', chance: 0.5 }
      ]
    });
    
    // Skeleton Warrior
    this.enemyConfigs.set('skeleton_warrior', {
      key: 'skeleton_warrior',
      name: 'Skeleton Warrior',
      health: 80,
      speed: 80,
      damage: 15,
      attackRange: 60,
      detectionRange: 250,
      experience: 30,
      lootTable: [
        { itemKey: 'health_potion', chance: 0.3 },
        { itemKey: 'mana_potion', chance: 0.2 },
        { itemKey: 'gold_coin', chance: 0.6 }
      ]
    });
    
    // Orc Brute
    this.enemyConfigs.set('orc_brute', {
      key: 'orc_brute',
      name: 'Orc Brute',
      health: 120,
      speed: 70,
      damage: 20,
      attackRange: 70,
      detectionRange: 220,
      experience: 40,
      lootTable: [
        { itemKey: 'health_potion', chance: 0.4 },
        { itemKey: 'mana_potion', chance: 0.3 },
        { itemKey: 'gold_coin', chance: 0.7 }
      ]
    });
    
    // Dark Wizard Boss
    this.enemyConfigs.set('dark_wizard_boss', {
      key: 'dark_wizard_boss',
      name: 'Dark Wizard',
      health: 300,
      speed: 60,
      damage: 30,
      attackRange: 150, // Ranged attack
      detectionRange: 300,
      experience: 100,
      lootTable: [
        { itemKey: 'health_potion', chance: 0.8 },
        { itemKey: 'mana_potion', chance: 0.8 },
        { itemKey: 'gold_coin', chance: 1.0 },
        { itemKey: 'magic_scroll', chance: 0.5 }
      ]
    });
  }
  
  /**
   * Spawn an enemy
   */
  public spawnEnemy(
    x: number,
    y: number,
    type: string,
    target?: Phaser.GameObjects.GameObject
  ): Enemy | null {
    // Get enemy config
    const config = this.enemyConfigs.get(type);
    if (!config) {
      console.warn(`⚠️ Unknown enemy type: ${type}`);
      return null;
    }
    
    // Create enemy
    const enemy = new Enemy(this.scene, x, y, config, this.characterManager);
    
    // Set target if provided
    if (target) {
      enemy.setTarget(target);
    }
    
    // Add to enemies list
    this.enemies.push(enemy);
    
    return enemy;
  }
  
  /**
   * Update all enemies
   */
  public update(time: number, delta: number): void {
    // Update each enemy
    for (const enemy of this.enemies) {
      enemy.update(time, delta);
    }
  }
  
  /**
   * Get all enemies
   */
  public getEnemies(): Enemy[] {
    return this.enemies;
  }
  
  /**
   * Remove an enemy
   */
  public removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }
  
  /**
   * Clear all enemies
   */
  public clearEnemies(): void {
    // Destroy all enemies
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    
    // Clear array
    this.enemies = [];
  }
  
  /**
   * Destroy manager
   */
  public destroy(): void {
    this.clearEnemies();
    console.log('👹 EnemyManager destroyed');
  }
}
