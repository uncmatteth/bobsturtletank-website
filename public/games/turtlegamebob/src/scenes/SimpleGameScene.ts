/**
 * SimpleGameScene - A straightforward game scene using our generated assets
 */

import Phaser from 'phaser';
import { AssetLoader } from '../systems/AssetLoader';

export class SimpleGameScene extends Phaser.Scene {
  // Asset loader
  private assetLoader!: AssetLoader;
  
  // Game objects
  private hero!: Phaser.GameObjects.Sprite;
  private enemies: Phaser.GameObjects.Sprite[] = [];
  private items: Phaser.GameObjects.Sprite[] = [];
  private environment: Phaser.GameObjects.Sprite[] = [];
  
  // UI elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private manaBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  
  // Game state
  private health: number = 100;
  private maxHealth: number = 100;
  private mana: number = 50;
  private maxMana: number = 50;
  private level: number = 1;
  private score: number = 0;
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;
  
  constructor() {
    super({ key: 'SimpleGameScene' });
  }
  
  preload(): void {
    // Create asset loader
    this.assetLoader = new AssetLoader(this);
    
    // Load all assets
    this.assetLoader.loadAssets();
  }
  
  create(): void {
    console.log('🎮 Creating SimpleGameScene');
    
    // Process tilesets
    this.assetLoader.processTilesets();
    
    // Create dungeon
    this.createDungeon();
    
    // Create hero
    this.createHero();
    
    // Create enemies
    this.createEnemies();
    
    // Create items
    this.createItems();
    
    // Create UI
    this.createUI();
    
    // Set up camera
    this.cameras.main.startFollow(this.hero);
    
    // Set up input
    this.setupInput();
    
    // Start background music
    this.sound.play('collect', { loop: true, volume: 0.5 });
  }
  
  update(time: number, delta: number): void {
    // Update hero movement
    this.updateHeroMovement();
    
    // Update enemies
    this.updateEnemies(time);
    
    // Check collisions
    this.checkCollisions();
  }
  
  /**
   * Create the dungeon environment
   */
  private createDungeon(): void {
    // Create a simple dungeon layout
    const dungeonWidth = 20;
    const dungeonHeight = 20;
    const tileSize = 32;
    
    // Create floor tiles
    for (let y = 0; y < dungeonHeight; y++) {
      for (let x = 0; x < dungeonWidth; x++) {
        // Create floor tile
        const tile = this.add.rectangle(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          tileSize,
          tileSize,
          0x2B5D31
        );
        
        // Add some variation
        if (Math.random() < 0.1) {
          tile.setFillStyle(0x3A7D41);
        }
      }
    }
    
    // Create walls around the edges
    for (let x = 0; x < dungeonWidth; x++) {
      this.createWall(x * tileSize + tileSize / 2, 0);
      this.createWall(x * tileSize + tileSize / 2, dungeonHeight * tileSize);
    }
    
    for (let y = 0; y < dungeonHeight; y++) {
      this.createWall(0, y * tileSize + tileSize / 2);
      this.createWall(dungeonWidth * tileSize, y * tileSize + tileSize / 2);
    }
    
    // Add some random walls
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(1, dungeonWidth - 2);
      const y = Phaser.Math.Between(1, dungeonHeight - 2);
      this.createWall(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
    }
    
    // Add environment objects
    this.createEnvironmentObjects();
  }
  
  /**
   * Create a wall tile
   */
  private createWall(x: number, y: number): void {
    const wall = this.add.rectangle(x, y, 32, 32, 0x8B4513);
    this.physics.add.existing(wall, true);
  }
  
  /**
   * Create environment objects
   */
  private createEnvironmentObjects(): void {
    // Add stairs
    const stairs = this.add.sprite(300, 300, 'stairs_down_south');
    this.environment.push(stairs);
    
    // Add doors
    const door1 = this.add.sprite(200, 200, 'dungeon_door_south');
    const door2 = this.add.sprite(400, 400, 'dungeon_door_east');
    this.environment.push(door1, door2);
    
    // Add torches
    const torch1 = this.add.sprite(150, 150, 'torch_south');
    const torch2 = this.add.sprite(450, 150, 'torch_south');
    const torch3 = this.add.sprite(150, 450, 'torch_south');
    const torch4 = this.add.sprite(450, 450, 'torch_south');
    this.environment.push(torch1, torch2, torch3, torch4);
    
    // Add physics to environment objects
    this.environment.forEach(obj => {
      this.physics.add.existing(obj, true);
    });
  }
  
  /**
   * Create the hero character
   */
  private createHero(): void {
    // Create hero sprite
    this.hero = this.add.sprite(300, 200, 'hero_south');
    
    // Set up physics
    this.physics.add.existing(this.hero);
    (this.hero.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    
    // Play idle animation
    this.hero.play('hero_idle_south');
  }
  
  /**
   * Create enemies
   */
  private createEnemies(): void {
    // Create some enemies
    const enemyTypes = ['red_goblin', 'skeleton_warrior', 'orc_brute', 'dark_wizard'];
    
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 500);
      const y = Phaser.Math.Between(100, 500);
      const type = Phaser.Utils.Array.GetRandom(enemyTypes);
      const direction = Phaser.Utils.Array.GetRandom(['south', 'west', 'east', 'north']);
      
      const enemy = this.add.sprite(x, y, `${type}_${direction}`);
      this.physics.add.existing(enemy);
      (enemy.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
      
      // Add custom properties
      (enemy as any).type = type;
      (enemy as any).health = 50;
      (enemy as any).damage = 10;
      
      this.enemies.push(enemy);
    }
  }
  
  /**
   * Create items
   */
  private createItems(): void {
    // Create some items
    const itemTypes = ['health_potion', 'mana_potion', 'treasure_chest'];
    
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 500);
      const y = Phaser.Math.Between(100, 500);
      const type = Phaser.Utils.Array.GetRandom(itemTypes);
      
      const item = this.add.sprite(x, y, `${type}_south`);
      this.physics.add.existing(item);
      
      // Add custom properties
      (item as any).type = type;
      
      this.items.push(item);
    }
  }
  
  /**
   * Create UI elements
   */
  private createUI(): void {
    // Create health bar
    this.healthBar = this.add.graphics();
    this.healthBar.setScrollFactor(0);
    
    // Create mana bar
    this.manaBar = this.add.graphics();
    this.manaBar.setScrollFactor(0);
    
    // Create level text
    this.levelText = this.add.text(20, 20, `Level: ${this.level}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    this.levelText.setScrollFactor(0);
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Set up input controls
   */
  private setupInput(): void {
    // Set up cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Set up attack key
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  
  /**
   * Update hero movement
   */
  private updateHeroMovement(): void {
    // Get hero body
    const body = this.hero.body as Phaser.Physics.Arcade.Body;
    
    // Reset velocity
    body.setVelocity(0);
    
    // Handle movement
    const speed = 100;
    let direction = 'south';
    
    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
      direction = 'west';
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
      direction = 'east';
    }
    
    if (this.cursors.up.isDown) {
      body.setVelocityY(-speed);
      direction = 'north';
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(speed);
      direction = 'south';
    }
    
    // Normalize diagonal movement
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.velocity.normalize().scale(speed);
    }
    
    // Update animation based on movement
    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      this.hero.play(`hero_walk_${direction}`, true);
    } else {
      this.hero.play(`hero_idle_${direction}`, true);
    }
    
    // Handle attack
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.heroAttack(direction);
    }
  }
  
  /**
   * Update enemies
   */
  private updateEnemies(time: number): void {
    this.enemies.forEach(enemy => {
      // Skip inactive enemies
      if (!enemy.active) return;
      
      // Simple AI: move towards player if nearby
      const distanceToHero = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.hero.x, this.hero.y
      );
      
      if (distanceToHero < 200) {
        // Move towards hero
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.hero.x, this.hero.y
        );
        
        const speed = 50;
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        
        body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
        
        // Update direction
        let direction = 'south';
        if (body.velocity.x < -Math.abs(body.velocity.y)) direction = 'west';
        else if (body.velocity.x > Math.abs(body.velocity.y)) direction = 'east';
        else if (body.velocity.y < 0) direction = 'north';
        
        // Update animation
        const type = (enemy as any).type;
        enemy.play(`${type}_walk_${direction}`, true);
      } else {
        // Stand still
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
        
        // Update animation
        const type = (enemy as any).type;
        enemy.play(`${type}_idle_south`, true);
      }
    });
  }
  
  /**
   * Check collisions
   */
  private checkCollisions(): void {
    // Hero vs environment
    this.physics.collide(this.hero, this.environment);
    
    // Hero vs enemies
    this.physics.collide(this.hero, this.enemies);
    
    // Hero vs items
    this.physics.overlap(this.hero, this.items, this.collectItem, undefined, this);
  }
  
  /**
   * Collect an item
   */
  private collectItem(hero: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject): void {
    const itemType = (item as any).type;
    
    // Apply item effect
    switch (itemType) {
      case 'health_potion':
        this.health = Math.min(this.health + 25, this.maxHealth);
        break;
      case 'mana_potion':
        this.mana = Math.min(this.mana + 25, this.maxMana);
        break;
      case 'treasure_chest':
        this.score += 100;
        break;
    }
    
    // Update UI
    this.updateUI();
    
    // Play sound
    this.sound.play('collect');
    
    // Remove item
    item.destroy();
    const index = this.items.indexOf(item as Phaser.GameObjects.Sprite);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
  
  /**
   * Hero attack
   */
  private heroAttack(direction: string): void {
    // Play attack animation
    this.hero.play(`hero_attack_${direction}`);
    
    // Play sound
    this.sound.play('magic_spell');
    
    // Create attack effect
    const attackX = this.hero.x + (direction === 'east' ? 32 : direction === 'west' ? -32 : 0);
    const attackY = this.hero.y + (direction === 'south' ? 32 : direction === 'north' ? -32 : 0);
    
    const effect = this.add.sprite(attackX, attackY, 'magic_spell_south');
    
    // Animate and destroy effect
    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // Check for enemies in attack range
    this.enemies.forEach(enemy => {
      if (!enemy.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        attackX, attackY,
        enemy.x, enemy.y
      );
      
      if (distance < 40) {
        this.damageEnemy(enemy);
      }
    });
  }
  
  /**
   * Damage an enemy
   */
  private damageEnemy(enemy: Phaser.GameObjects.Sprite): void {
    // Reduce enemy health
    (enemy as any).health -= 25;
    
    // Flash red
    this.tweens.add({
      targets: enemy,
      alpha: 0.5,
      yoyo: true,
      duration: 100,
      repeat: 1
    });
    
    // Check if enemy is defeated
    if ((enemy as any).health <= 0) {
      this.defeatEnemy(enemy);
    }
  }
  
  /**
   * Defeat an enemy
   */
  private defeatEnemy(enemy: Phaser.GameObjects.Sprite): void {
    // Play defeat animation
    const type = (enemy as any).type;
    enemy.play(`${type}_idle_south`);
    
    // Play sound
    this.sound.play('fire');
    
    // Create defeat effect
    const effect = this.add.sprite(enemy.x, enemy.y, 'magic_spell_south');
    
    // Animate and destroy effect
    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // Animate and destroy enemy
    this.tweens.add({
      targets: enemy,
      alpha: 0,
      scale: 0.5,
      duration: 500,
      onComplete: () => {
        enemy.destroy();
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
          this.enemies.splice(index, 1);
        }
        
        // Chance to drop item
        if (Math.random() < 0.5) {
          this.dropItem(enemy.x, enemy.y);
        }
        
        // Gain experience
        this.gainExperience(25);
      }
    });
  }
  
  /**
   * Drop an item
   */
  private dropItem(x: number, y: number): void {
    // Choose random item type
    const itemTypes = ['health_potion', 'mana_potion', 'treasure_chest'];
    const type = Phaser.Utils.Array.GetRandom(itemTypes);
    
    // Create item
    const item = this.add.sprite(x, y, `${type}_south`);
    this.physics.add.existing(item);
    
    // Add custom properties
    (item as any).type = type;
    
    // Add to items array
    this.items.push(item);
  }
  
  /**
   * Gain experience
   */
  private gainExperience(amount: number): void {
    // Increase score
    this.score += amount;
    
    // Check for level up
    if (this.score >= this.level * 100) {
      this.levelUp();
    }
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Level up
   */
  private levelUp(): void {
    // Increase level
    this.level++;
    
    // Increase stats
    this.maxHealth += 20;
    this.health = this.maxHealth;
    this.maxMana += 10;
    this.mana = this.maxMana;
    
    // Play sound
    this.sound.play('healing');
    
    // Create level up effect
    const effect = this.add.sprite(this.hero.x, this.hero.y, 'magic_spell_south');
    effect.setScale(2);
    effect.setTint(0xFFFF00);
    
    // Animate and destroy effect
    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 4,
      duration: 1000,
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // Flash screen
    this.cameras.main.flash(500, 255, 255, 255);
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Update UI elements
   */
  private updateUI(): void {
    // Update health bar
    this.healthBar.clear();
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(10, 50, 200, 20);
    this.healthBar.fillStyle(0xFF0000);
    this.healthBar.fillRect(10, 50, 200 * (this.health / this.maxHealth), 20);
    
    // Update mana bar
    this.manaBar.clear();
    this.manaBar.fillStyle(0x000000, 0.5);
    this.manaBar.fillRect(10, 80, 200, 15);
    this.manaBar.fillStyle(0x0000FF);
    this.manaBar.fillRect(10, 80, 200 * (this.mana / this.maxMana), 15);
    
    // Update level text
    this.levelText.setText(`Level: ${this.level}  Score: ${this.score}`);
  }
}
