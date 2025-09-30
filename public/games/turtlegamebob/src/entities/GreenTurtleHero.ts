/**
 * GreenTurtleHero - The main player character
 * Uses the PixelLab generated character assets
 */

import Phaser from 'phaser';
import { CharacterManager } from '../systems/CharacterManager';

export class GreenTurtleHero extends Phaser.GameObjects.Container {
  // Character properties
  private sprite: Phaser.GameObjects.Sprite;
  private speed: number = 200;
  private health: number = 100;
  private maxHealth: number = 100;
  private mana: number = 50;
  private maxMana: number = 50;
  private level: number = 1;
  private experience: number = 0;
  private experienceToNextLevel: number = 100;
  private isAttacking: boolean = false;
  private attackCooldown: number = 0;
  private invulnerable: boolean = false;
  private invulnerabilityTimer: number = 0;
  
  // Physics body
  public body: Phaser.Physics.Arcade.Body;
  
  // Input handling
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey: Phaser.Input.Keyboard.Key;
  
  // Visual effects
  private healthBar: Phaser.GameObjects.Graphics;
  private manaBar: Phaser.GameObjects.Graphics;
  private damageFlash: Phaser.Time.TimerEvent | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number, characterManager: CharacterManager) {
    super(scene, x, y);
    
    // Create sprite
    const heroSprite = characterManager.createSprite(0, 0, 'green_turtle');
    
    if (heroSprite) {
      this.sprite = heroSprite;
    } else {
      // Fallback to placeholder sprite
      console.warn('⚠️ Using fallback hero sprite');
      this.sprite = scene.add.sprite(0, 0, 'fallback_hero');
      this.createFallbackAnimations();
    }
    
    // Add sprite to container
    this.add(this.sprite);
    
    // Create health and mana bars
    this.healthBar = scene.add.graphics();
    this.manaBar = scene.add.graphics();
    this.updateBars();
    this.add(this.healthBar);
    this.add(this.manaBar);
    
    // Set up physics
    scene.physics.world.enable(this);
    this.body.setSize(24, 24);
    this.body.setOffset(-12, -12);
    
    // Set up input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Add to scene
    scene.add.existing(this);
    
    console.log('🐢 Green Turtle Hero created');
  }
  
  /**
   * Update hero logic
   */
  public update(time: number, delta: number): void {
    // Handle movement
    this.handleMovement();
    
    // Handle attack
    this.handleAttack(time);
    
    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTimer -= delta;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerable = false;
        this.sprite.setAlpha(1);
      } else {
        // Flash effect
        this.sprite.setAlpha(Math.sin(time / 50) * 0.5 + 0.5);
      }
    }
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
  }
  
  /**
   * Handle hero movement
   */
  private handleMovement(): void {
    // Reset velocity
    this.body.setVelocity(0);
    
    // Don't move while attacking
    if (this.isAttacking) {
      return;
    }
    
    // Handle movement input
    const speed = this.speed;
    let moving = false;
    
    if (this.cursors.left.isDown) {
      this.body.setVelocityX(-speed);
      this.sprite.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown) {
      this.body.setVelocityX(speed);
      this.sprite.setFlipX(false);
      moving = true;
    }
    
    if (this.cursors.up.isDown) {
      this.body.setVelocityY(-speed);
      moving = true;
    } else if (this.cursors.down.isDown) {
      this.body.setVelocityY(speed);
      moving = true;
    }
    
    // Normalize diagonal movement
    if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
      this.body.velocity.normalize().scale(speed);
    }
    
    // Play appropriate animation
    if (moving) {
      this.sprite.play('green_turtle_walk', true);
    } else {
      this.sprite.play('green_turtle_idle', true);
    }
  }
  
  /**
   * Handle hero attack
   */
  private handleAttack(time: number): void {
    // Check for attack input
    if (this.attackKey.isDown && this.attackCooldown <= 0 && !this.isAttacking) {
      this.attack();
    }
    
    // Reset attacking state when animation completes
    if (this.isAttacking && !this.sprite.anims.isPlaying) {
      this.isAttacking = false;
    }
  }
  
  /**
   * Perform attack
   */
  public attack(): void {
    this.isAttacking = true;
    this.attackCooldown = 500; // 500ms cooldown
    
    // Play attack animation
    this.sprite.play('green_turtle_attack');
    
    // Screen shake effect
    this.scene.cameras.main.shake(100, 0.01);
    
    // Create attack effect
    this.createAttackEffect();
    
    // Emit attack event
    this.scene.events.emit('hero-attack', this);
  }
  
  /**
   * Create visual effect for attack
   */
  private createAttackEffect(): void {
    // Get attack direction
    const direction = this.sprite.flipX ? -1 : 1;
    
    // Create slash effect
    const slash = this.scene.add.sprite(
      this.x + direction * 32,
      this.y,
      'fallback_effect'
    );
    
    // Set slash properties
    slash.setScale(1.5);
    slash.setAlpha(0.7);
    slash.setTint(0xFFFFFF);
    
    // Animate and destroy
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 2.5,
      duration: 300,
      onComplete: () => {
        slash.destroy();
      }
    });
  }
  
  /**
   * Take damage
   */
  public takeDamage(amount: number): void {
    // Check invulnerability
    if (this.invulnerable) {
      return;
    }
    
    // Apply damage
    this.health -= amount;
    
    // Clamp health
    this.health = Math.max(0, this.health);
    
    // Update health bar
    this.updateBars();
    
    // Flash red
    this.sprite.setTint(0xFF0000);
    if (this.damageFlash) {
      this.damageFlash.remove();
    }
    this.damageFlash = this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
    
    // Screen shake
    this.scene.cameras.main.shake(200, 0.02);
    
    // Set invulnerability
    this.invulnerable = true;
    this.invulnerabilityTimer = 1000; // 1 second
    
    // Check for death
    if (this.health <= 0) {
      this.die();
    }
    
    // Emit damage event
    this.scene.events.emit('hero-damaged', this, amount);
  }
  
  /**
   * Die
   */
  private die(): void {
    // Play death animation
    this.sprite.play('green_turtle_idle');
    this.sprite.setTint(0xFF0000);
    
    // Disable physics
    this.body.setVelocity(0);
    
    // Fade out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        // Emit death event
        this.scene.events.emit('hero-died', this);
      }
    });
  }
  
  /**
   * Add experience
   */
  public addExperience(amount: number): void {
    this.experience += amount;
    
    // Check for level up
    while (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
    
    // Emit experience event
    this.scene.events.emit('hero-experience', this, amount);
  }
  
  /**
   * Level up
   */
  private levelUp(): void {
    // Increase level
    this.level++;
    
    // Reset experience
    this.experience -= this.experienceToNextLevel;
    
    // Increase experience required for next level
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    
    // Increase stats
    this.maxHealth += 20;
    this.health = this.maxHealth;
    this.maxMana += 10;
    this.mana = this.maxMana;
    this.speed += 5;
    
    // Update bars
    this.updateBars();
    
    // Visual effects
    this.scene.cameras.main.flash(500, 255, 255, 255);
    this.scene.cameras.main.shake(500, 0.02);
    
    // Create level up effect
    this.createLevelUpEffect();
    
    // Emit level up event
    this.scene.events.emit('hero-level-up', this);
  }
  
  /**
   * Create visual effect for level up
   */
  private createLevelUpEffect(): void {
    // Create particles
    const particles = this.scene.add.particles(this.x, this.y, 'fallback_effect', {
      speed: 100,
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000
    });
    
    // Destroy after animation
    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }
  
  /**
   * Update health and mana bars
   */
  private updateBars(): void {
    // Clear graphics
    this.healthBar.clear();
    this.manaBar.clear();
    
    // Draw health bar
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(-15, -30, 30, 5);
    this.healthBar.fillStyle(0xFF0000);
    this.healthBar.fillRect(-15, -30, 30 * (this.health / this.maxHealth), 5);
    
    // Draw mana bar
    this.manaBar.fillStyle(0x000000, 0.5);
    this.manaBar.fillRect(-15, -25, 30, 3);
    this.manaBar.fillStyle(0x0000FF);
    this.manaBar.fillRect(-15, -25, 30 * (this.mana / this.maxMana), 3);
  }
  
  /**
   * Create fallback animations
   */
  private createFallbackAnimations(): void {
    // Check if animations already exist
    if (this.scene.anims.exists('green_turtle_idle')) {
      return;
    }
    
    // Create idle animation
    this.scene.anims.create({
      key: 'green_turtle_idle',
      frames: [{ key: 'fallback_hero', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    // Create walk animation
    this.scene.anims.create({
      key: 'green_turtle_walk',
      frames: [
        { key: 'fallback_hero', frame: 0 },
        { key: 'fallback_hero', frame: 0 }
      ],
      frameRate: 10,
      repeat: -1
    });
    
    // Create attack animation
    this.scene.anims.create({
      key: 'green_turtle_attack',
      frames: [{ key: 'fallback_hero', frame: 0 }],
      frameRate: 10,
      repeat: 0
    });
  }
  
  /**
   * Get hero properties
   */
  public getProperties(): any {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      mana: this.mana,
      maxMana: this.maxMana,
      level: this.level,
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel
    };
  }
}
