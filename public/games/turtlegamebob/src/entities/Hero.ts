/**
 * Hero - Bob The Turtle with 3 distinct Shell Classes
 * The legendary protagonist with class-specific abilities and progression
 */

import Phaser from 'phaser';

export type ShellClass = 'Shell Defender' | 'Swift Current' | 'Fire Belly';

export interface HeroStats {
  // Core stats
  level: number;
  experience: number;
  experienceToNext: number;
  
  // Health and Mana
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  
  // Combat stats
  attack: number;
  defense: number;
  speed: number;
  criticalRate: number;
  criticalDamage: number;
  
  // Resistances (0-100%)
  fireResistance: number;
  waterResistance: number;
  earthResistance: number;
  
  // Shell Class bonuses
  classBonus: Record<string, number>;
  
  // Progression tracking
  gold?: number;
  highestFloor?: number;
  bossesDefeated?: number;
  totalKills?: number;
  totalDamage?: number;
  deathCount?: number;
  gameStartTime?: number;
}

export interface HeroAbility {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive';
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  level: number;
  maxLevel: number;
  shellClass: ShellClass;
}

export class Hero extends Phaser.GameObjects.Sprite {
  public stats: HeroStats;
  public shellClass: ShellClass;
  public abilities: HeroAbility[] = [];
  
  // Core progression properties (for save system compatibility)
  public level: number;
  public experience: number;
  public heroClass: ShellClass;
  
  // Movement and combat
  public movementSpeed: number = 200;
  public isMoving: boolean = false;
  public isCasting: boolean = false;
  public lastDirection: { x: number; y: number } = { x: 0, y: 1 };
  
  // Combat state
  public isInCombat: boolean = false;
  public isAttacking: boolean = false;
  public lastAttackTime: number = 0;
  public attackCooldown: number = 1000; // 1 second base attack speed
  
  // Inventory reference (set by EquipmentSystem)
  public inventory: any = null;
  
  // Animation state
  private animationPrefix: string;
  private invulnerabilityTimer: number = 0;
  private isInvulnerable: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, shellClass: ShellClass) {
    // Use hero_atlas or fallback to placeholder
    const textureKey = scene.textures.exists('hero_atlas') ? 'hero_atlas' : 'placeholder_hero';
    super(scene, x, y, textureKey, 0);
    
    this.shellClass = shellClass;
    this.heroClass = shellClass; // Alias for save system
    this.stats = this.generateStatsForClass(shellClass);
    this.level = this.stats.level;
    this.experience = this.stats.experience;
    this.abilities = this.getClassAbilities(shellClass);
    this.animationPrefix = this.getAnimationPrefix(shellClass);
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(48, 48); // Collision box smaller than sprite
    body.setOffset(8, 16); // Center the collision box
    body.setCollideWorldBounds(true);
    body.setDrag(300); // Smooth movement
    
    // Set up animations
    this.createAnimations();
    
    // Make sure hero is visible
    this.setScale(1);
    this.setAlpha(1);
    this.setVisible(true);
    
    // Start with idle animation
    try {
      this.play(`${this.animationPrefix}_idle_down`);
    } catch (error) {
      console.warn('Failed to play hero animation, using static sprite');
    }
    
    console.log(`🐢 Hero created: ${shellClass} (Level ${this.stats.level}) at (${x}, ${y})`);
  }
  
  /**
   * Update hero logic
   */
  public update(time: number, delta: number): void {
    this.updateCooldowns(delta);
    this.updateAnimation();
    this.updateCombatState(time);
    this.updateInvulnerability(delta);
    
    // Update movement state
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isMoving = body.velocity.x !== 0 || body.velocity.y !== 0;
  }
  
  /**
   * Move the hero in a direction
   */
  public move(direction: { x: number; y: number }): void {
    if (this.isCasting) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = this.movementSpeed * this.getSpeedMultiplier();
    
    body.setVelocity(direction.x * speed, direction.y * speed);
    
    // Update last direction for facing
    if (direction.x !== 0 || direction.y !== 0) {
      this.lastDirection = { ...direction };
    }
  }
  

  
  /**
   * Cast a spell/ability
   */
  public castAbility(abilityId: string): boolean {
    const ability = this.abilities.find(a => a.id === abilityId);
    
    if (!ability || ability.currentCooldown > 0 || this.stats.currentMP < ability.manaCost) {
      return false;
    }
    
    // Consume mana
    this.stats.currentMP = Math.max(0, this.stats.currentMP - ability.manaCost);
    
    // Set cooldown
    ability.currentCooldown = ability.cooldown;
    
    // Cast the ability
    this.performAbility(ability);
    
    return true;
  }
  
  /**
   * Take damage
   */
  public takeDamage(damage: number, damageType: 'physical' | 'fire' | 'water' | 'earth' = 'physical'): number {
    // Check invulnerability
    if (this.isInvulnerable) {
      console.log('🛡️ Hero is invulnerable - damage blocked');
      return 0;
    }
    
    let actualDamage = damage;
    
    // Apply defense
    const defenseReduction = this.stats.defense / (this.stats.defense + 100);
    actualDamage *= (1 - defenseReduction);
    
    // Apply resistances
    switch (damageType) {
      case 'fire':
        actualDamage *= (1 - this.stats.fireResistance / 100);
        break;
      case 'water':
        actualDamage *= (1 - this.stats.waterResistance / 100);
        break;
      case 'earth':
        actualDamage *= (1 - this.stats.earthResistance / 100);
        break;
    }
    
    actualDamage = Math.round(Math.max(1, actualDamage));
    
    this.stats.currentHP = Math.max(0, this.stats.currentHP - actualDamage);
    
    // Visual feedback
    this.showDamageNumber(actualDamage);
    this.flashRed();
    
    // Check for death
    if (this.stats.currentHP <= 0) {
      this.onDeath();
    }
    
    return actualDamage;
  }
  
  /**
   * Heal the hero
   */
  public heal(amount: number): number {
    const actualHeal = Math.min(amount, this.stats.maxHP - this.stats.currentHP);
    this.stats.currentHP += actualHeal;
    
    if (actualHeal > 0) {
      this.showHealNumber(actualHeal);
    }
    
    return actualHeal;
  }
  
  /**
   * Gain experience
   */
  public gainExperience(amount: number): boolean {
    this.stats.experience += amount;
    
    // Check for level up
    if (this.stats.experience >= this.stats.experienceToNext) {
      return this.levelUp();
    }
    
    return false;
  }
  
  /**
   * Get current stats with all bonuses applied
   */
  public getEffectiveStats(): HeroStats {
    const effectiveStats = { ...this.stats };
    
    // Apply shell class bonuses (includes skill bonuses)
    Object.entries(this.stats.classBonus).forEach(([stat, bonus]) => {
      if (stat in effectiveStats) {
        (effectiveStats as any)[stat] += bonus;
      }
    });
    
    return effectiveStats;
  }
  
  /**
   * Get total stat bonuses from all sources
   */
  public getTotalStatBonuses(): { [key: string]: number } {
    return { ...this.stats.classBonus };
  }
  
  /**
   * Check if hero can use ability
   */
  public canUseAbility(abilityId: string): boolean {
    const ability = this.abilities.find(a => a.id === abilityId);
    return ability !== undefined && 
           ability.currentCooldown <= 0 && 
           this.stats.currentMP >= ability.manaCost;
  }
  
  /**
   * Get available abilities for current class
   */
  public getAvailableAbilities(): HeroAbility[] {
    return this.abilities.filter(ability => ability.level > 0);
  }
  
  // Private methods
  
  private generateStatsForClass(shellClass: ShellClass): HeroStats {
    const baseStats: HeroStats = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      
      currentHP: 100,
      maxHP: 100,
      currentMP: 100,
      maxMP: 100,
      
      attack: 10,
      defense: 10,
      speed: 10,
      criticalRate: 5,
      criticalDamage: 150,
      
      fireResistance: 0,
      waterResistance: 0,
      earthResistance: 0,
      
      classBonus: {}
    };
    
    // Apply shell class modifications
    switch (shellClass) {
      case 'Shell Defender':
        baseStats.maxHP = 150;
        baseStats.currentHP = 150;
        baseStats.defense = 20;
        baseStats.attack = 8;
        baseStats.speed = 7;
        baseStats.earthResistance = 25;
        baseStats.classBonus = {
          maxHP: 50,
          defense: 10,
          earthResistance: 25
        };
        break;
        
      case 'Swift Current':
        baseStats.speed = 15;
        baseStats.attack = 12;
        baseStats.criticalRate = 15;
        baseStats.defense = 6;
        baseStats.waterResistance = 25;
        baseStats.classBonus = {
          speed: 5,
          criticalRate: 10,
          waterResistance: 25
        };
        break;
        
      case 'Fire Belly':
        baseStats.attack = 14;
        baseStats.maxMP = 150;
        baseStats.currentMP = 150;
        baseStats.criticalDamage = 200;
        baseStats.defense = 7;
        baseStats.speed = 9;
        baseStats.fireResistance = 25;
        baseStats.classBonus = {
          attack: 4,
          maxMP: 50,
          criticalDamage: 50,
          fireResistance: 25
        };
        break;
    }
    
    return baseStats;
  }
  
  private getClassAbilities(shellClass: ShellClass): HeroAbility[] {
    const commonAbilities: HeroAbility[] = [
      {
        id: 'basic_attack',
        name: 'Shell Strike',
        description: 'Basic melee attack',
        type: 'active',
        manaCost: 0,
        cooldown: 0,
        currentCooldown: 0,
        level: 1,
        maxLevel: 1,
        shellClass: shellClass
      }
    ];
    
    const classAbilities: HeroAbility[] = [];
    
    switch (shellClass) {
      case 'Shell Defender':
        classAbilities.push(
          {
            id: 'earth_shield',
            name: 'Earth Shield',
            description: 'Creates a protective barrier that absorbs damage',
            type: 'active',
            manaCost: 30,
            cooldown: 8000,
            currentCooldown: 0,
            level: 1,
            maxLevel: 5,
            shellClass: shellClass
          },
          {
            id: 'ground_slam',
            name: 'Ground Slam',
            description: 'Slam the ground to damage nearby enemies',
            type: 'active',
            manaCost: 25,
            cooldown: 5000,
            currentCooldown: 0,
            level: 1,
            maxLevel: 5,
            shellClass: shellClass
          }
        );
        break;
        
      case 'Swift Current':
        classAbilities.push(
          {
            id: 'water_dash',
            name: 'Water Dash',
            description: 'Dash through enemies, dealing damage',
            type: 'active',
            manaCost: 20,
            cooldown: 4000,
            currentCooldown: 0,
            level: 1,
            maxLevel: 5,
            shellClass: shellClass
          },
          {
            id: 'critical_focus',
            name: 'Critical Focus',
            description: 'Increases critical hit chance for a short time',
            type: 'active',
            manaCost: 35,
            cooldown: 12000,
            currentCooldown: 0,
            level: 1,
            maxLevel: 5,
            shellClass: shellClass
          }
        );
        break;
        
      case 'Fire Belly':
        classAbilities.push(
          {
            id: 'fire_blast',
            name: 'Fire Blast',
            description: 'Launch a fireball that explodes on impact',
            type: 'active',
            manaCost: 25,
            cooldown: 3000,
            currentCooldown: 0,
            level: 1,
            maxLevel: 5,
            shellClass: shellClass
          },
          {
            id: 'flame_aura',
            name: 'Flame Aura',
            description: 'Surrounds the hero with burning flames',
            type: 'active',
            manaCost: 40,
            cooldown: 15000,
            currentCooldown: 0,
            level: 1,
            maxLevel: 5,
            shellClass: shellClass
          }
        );
        break;
    }
    
    return [...commonAbilities, ...classAbilities];
  }
  
  private getAnimationPrefix(shellClass: ShellClass): string {
    switch (shellClass) {
      case 'Shell Defender': return 'defender';
      case 'Swift Current': return 'swift';
      case 'Fire Belly': return 'fire';
      default: return 'hero';
    }
  }
  
  private createAnimations(): void {
    // Create simple animations for hero visibility
    const directions = ['down', 'up', 'left', 'right'];
    const actions = ['idle', 'walk', 'attack', 'cast', 'death'];
    
    // Check if hero_atlas texture exists, if not use fallback
    if (!this.scene.textures.exists('hero_atlas')) {
      console.warn('🐢 Hero atlas not found, creating fallback animations');
      this.createFallbackAnimations();
      return;
    }
    
    // Ensure hero is visible first by setting a default frame
    try {
      this.setFrame('idle_down_01');
    } catch (error) {
      console.warn('🐢 Failed to set hero frame, using texture key instead');
      this.createFallbackAnimations();
      return;
    }
    
    directions.forEach(direction => {
      actions.forEach(action => {
        const key = `${this.animationPrefix}_${action}_${direction}`;
        
        if (!this.scene.anims.exists(key)) {
          try {
            // Create animation using hero_atlas frames
            this.scene.anims.create({
              key: key,
              frames: this.scene.anims.generateFrameNames('hero_atlas', {
                prefix: `${action}_${direction}_`,
                suffix: '',
                start: 1,
                end: 1,
                zeroPad: 2
              }),
              frameRate: 8,
              repeat: action === 'idle' || action === 'walk' ? -1 : 0
            });
          } catch (error) {
            // Fallback: create animation with single frame
            this.scene.anims.create({
              key: key,
              frames: [{ key: this.texture.key, frame: 0 }],
              frameRate: 1,
              repeat: -1
            });
          }
        }
      });
    });
    
    // Also create a simple death animation for all classes
    if (!this.scene.anims.exists(`${this.animationPrefix}_death`)) {
      this.scene.anims.create({
        key: `${this.animationPrefix}_death`,
        frames: this.scene.anims.generateFrameNames('hero_atlas', {
          prefix: 'death_down_',
          suffix: '',
          start: 1,
          end: 1,
          zeroPad: 2
        }),
        frameRate: 4,
        repeat: 0
      });
    }
  }
  
  private updateCooldowns(delta: number): void {
    this.abilities.forEach(ability => {
      if (ability.currentCooldown > 0) {
        ability.currentCooldown = Math.max(0, ability.currentCooldown - delta);
      }
    });
  }
  
  private updateAnimation(): void {
    const direction = this.getDirectionString();
    let action = 'idle';
    
    if (this.isCasting) {
      action = 'cast';
    } else if (this.isMoving) {
      action = 'walk';
    }
    
    const animKey = `${this.animationPrefix}_${action}_${direction}`;
    
    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey);
    }
  }
  
  private updateCombatState(time: number): void {
    // Auto-exit combat after 5 seconds of no action
    if (this.isInCombat && time - this.lastAttackTime > 5000) {
      this.isInCombat = false;
    }
  }
  
  private getDirectionString(): string {
    const { x, y } = this.lastDirection;
    
    if (Math.abs(x) > Math.abs(y)) {
      return x > 0 ? 'right' : 'left';
    } else {
      return y > 0 ? 'down' : 'up';
    }
  }
  
  private getSpeedMultiplier(): number {
    // Apply speed bonuses from stats
    const baseSpeed = 10;
    const speedBonus = (this.stats.speed - baseSpeed) / baseSpeed;
    return 1 + speedBonus;
  }
  
  private performAttack(): void {
    this.isCasting = true;
    this.isInCombat = true;
    
    // Play attack animation
    const direction = this.getDirectionString();
    this.play(`${this.animationPrefix}_attack_${direction}`);
    
    // Calculate damage
    const baseDamage = this.stats.attack;
    const isCritical = Math.random() * 100 < this.stats.criticalRate;
    const damage = isCritical ? 
      Math.round(baseDamage * (this.stats.criticalDamage / 100)) : 
      baseDamage;
    
    // Create attack hitbox (will be implemented with combat system)
    this.createAttackHitbox(damage, isCritical);
    
    // End casting after animation
    this.scene.time.delayedCall(500, () => {
      this.isCasting = false;
    });
    
    console.log(`🗡️ Attack: ${damage} damage ${isCritical ? '(CRITICAL!)' : ''}`);
  }
  
  private performAbility(ability: HeroAbility): void {
    this.isCasting = true;
    
    console.log(`✨ Casting ${ability.name}`);
    
    // Ability-specific logic will be implemented in combat system
    switch (ability.id) {
      case 'earth_shield':
        this.castEarthShield();
        break;
      case 'water_dash':
        this.castWaterDash();
        break;
      case 'fire_blast':
        this.castFireBlast();
        break;
      // Add more abilities...
    }
    
    // End casting after animation
    this.scene.time.delayedCall(800, () => {
      this.isCasting = false;
    });
  }
  
  private createAttackHitbox(damage: number, isCritical: boolean): void {
    // Create attack hitbox in front of hero
    const hitboxSize = 60;
    const hitboxX = this.x + (this.lastDirection.x * hitboxSize);
    const hitboxY = this.y + (this.lastDirection.y * hitboxSize);
    
    // Visual attack effect
    const attackEffect = this.scene.add.circle(hitboxX, hitboxY, hitboxSize / 2, 0xff0000, 0.3);
    attackEffect.setStrokeStyle(2, 0xffffff);
    
    // Animate attack effect
    this.scene.tweens.add({
      targets: attackEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => attackEffect.destroy()
    });
    
    // Check for enemies in range using scene's combat system
    const gameScene = this.scene as any;
    if (gameScene.combatSystem && gameScene.enemySystem) {
      const enemies = gameScene.enemySystem.getEnemiesInRange(hitboxX, hitboxY, hitboxSize);
      enemies.forEach((enemy: any) => {
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, hitboxX, hitboxY) <= hitboxSize) {
          gameScene.combatSystem.dealDamage(this, enemy, damage, isCritical);
        }
      });
    }
    
    console.log(`🎯 Attack hitbox: ${damage} damage ${isCritical ? '(CRIT!)' : ''}`);
  }
  
  private castEarthShield(): void {
    // Create shield visual effect
    const shield = this.scene.add.circle(this.x, this.y, 50, 0x8B4513, 0.3);
    shield.setStrokeStyle(4, 0xA0522D, 0.8);
    shield.setDepth(12);
    
    // Add rock particle effects
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const rockX = this.x + Math.cos(angle) * 60;
      const rockY = this.y + Math.sin(angle) * 60;
      
      const rock = this.scene.add.circle(rockX, rockY, 4, 0x654321, 1);
      rock.setDepth(13);
      
      // Orbit animation
      this.scene.tweens.add({
        targets: rock,
        angle: angle + Math.PI * 2,
        duration: 3000,
        repeat: 2,
        ease: 'Linear'
      });
      
      // Cleanup
      this.scene.time.delayedCall(9000, () => {
        rock.destroy();
      });
    }
    
    // Shield pulse animation
    this.scene.tweens.add({
      targets: shield,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: 8,
      onComplete: () => shield.destroy()
    });
    
    // Apply shield effect to combat system
    this.scene.events.emit('apply-shield', {
      target: this,
      amount: 50 + this.stats.level * 5,
      duration: 10000,
      type: 'earth'
    });
    
    console.log('🛡️ Earth Shield activated with enhanced visuals');
  }
  
  private castWaterDash(): void {
    // Create water trail effect
    const direction = this.lastDirection;
    const distance = 120;
    const targetX = this.x + direction.x * distance;
    const targetY = this.y + direction.y * distance;
    
    // Water effect tint
    this.setTint(0x0077BE);
    this.setAlpha(0.7);
    
    // Create water trail
    for (let i = 0; i < 8; i++) {
      const trailX = this.x + (direction.x * distance * i) / 8;
      const trailY = this.y + (direction.y * distance * i) / 8;
      
      const waterDrop = this.scene.add.circle(trailX, trailY, 8, 0x4169E1, 0.6);
      waterDrop.setDepth(10);
      
      this.scene.tweens.add({
        targets: waterDrop,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 600,
        delay: i * 50,
        onComplete: () => waterDrop.destroy()
      });
    }
    
    // Dash movement with speed boost
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.clearTint();
        this.setAlpha(1);
        this.createWaterSplash();
      }
    });
    
    // Apply damage to enemies in path
    this.scene.events.emit('create-line-effect', {
      startX: this.x,
      startY: this.y,
      endX: targetX,
      endY: targetY,
      width: 40,
      damage: 18 + this.stats.attack * 0.6,
      damageType: 'water',
      source: this
    });
    
    console.log('💨 Water Dash performed with trail and splash');
  }
  
  /**
   * Modern attack system with proper feedback
   */
  public attack(direction?: string): boolean {
    if (this.isAttacking) {
      return false;
    }
    
    this.isAttacking = true;
    const attackDirection = direction || this.getCurrentDirection();
    
    // Play attack animation
    this.play(`${this.animationPrefix}_attack_${attackDirection}`);
    
    // Create attack area effect
    this.createAttackEffect(attackDirection);
    
    // Play attack sound
    this.scene.sound.play('sword_hit', { volume: 0.3 });
    
    // Reset attacking state
    this.scene.time.delayedCall(300, () => {
      this.isAttacking = false;
      this.play(`${this.animationPrefix}_idle_${attackDirection}`);
    });
    
    console.log(`⚔️ Hero attacks ${attackDirection}!`);
    return true;
  }
  
  private createAttackEffect(direction: string): void {
    const attackRange = 48;
    let effectX = this.x;
    let effectY = this.y;
    
    // Calculate attack position based on direction
    switch (direction) {
      case 'up':
        effectY -= attackRange;
        break;
      case 'down':
        effectY += attackRange;
        break;
      case 'left':
        effectX -= attackRange;
        break;
      case 'right':
        effectX += attackRange;
        break;
    }
    
    // Create visual attack effect
    const attackEffect = this.scene.add.rectangle(effectX, effectY, 32, 32, 0xffaa00, 0.6);
    attackEffect.setDepth(10);
    
    // Attack animation
    this.scene.tweens.add({
      targets: attackEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => attackEffect.destroy()
    });
    
    // Check for enemies in attack range
    this.scene.events.emit('hero-attack', {
      x: effectX,
      y: effectY,
      range: 32,
      damage: this.stats.attack,
      source: this
    });
  }
  
  private getCurrentDirection(): string {
    // Return the current facing direction or default to 'down'
    if (this.anims.currentAnim) {
      const animKey = this.anims.currentAnim.key;
      if (animKey.includes('_up')) return 'up';
      if (animKey.includes('_down')) return 'down';
      if (animKey.includes('_left')) return 'left';
      if (animKey.includes('_right')) return 'right';
    }
    return 'down';
  }

  /**
   * Create water splash effect
   */
  private createWaterSplash(): void {
    // Main splash
    const splash = this.scene.add.circle(this.x, this.y, 15, 0x0077BE, 0.7);
    splash.setDepth(12);
    
    this.scene.tweens.add({
      targets: splash,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => splash.destroy()
    });
    
    // Water droplets
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const droplet = this.scene.add.circle(this.x, this.y, 3, 0x4169E1, 0.8);
      droplet.setDepth(11);
      
      const endX = this.x + Math.cos(angle) * (30 + Math.random() * 40);
      const endY = this.y + Math.sin(angle) * (30 + Math.random() * 40);
      
      this.scene.tweens.add({
        targets: droplet,
        x: endX,
        y: endY,
        scaleX: 0.1,
        scaleY: 0.1,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => droplet.destroy()
      });
    }
  }
  
  private castFireBlast(): void {
    // Calculate projectile direction
    const direction = this.lastDirection;
    const startX = this.x + direction.x * 30;
    const startY = this.y + direction.y * 30;
    
    // Create fire projectile with enhanced visuals
    this.scene.events.emit('create-projectile', {
      x: startX,
      y: startY,
      direction: direction,
      speed: 300,
      damage: 22 + this.stats.attack * 0.7,
      damageType: 'fire',
      range: 250,
      piercing: false,
      source: this,
      visual: 'fire_blast'
    });
    
    // Create launching effect
    const launchFlame = this.scene.add.circle(startX, startY, 12, 0xFF4500, 0.8);
    launchFlame.setDepth(14);
    
    this.scene.tweens.add({
      targets: launchFlame,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => launchFlame.destroy()
    });
    
    // Fire sparks
    for (let i = 0; i < 8; i++) {
      const spark = this.scene.add.circle(
        startX + (Math.random() - 0.5) * 20,
        startY + (Math.random() - 0.5) * 20,
        2, 0xFF6347, 1
      );
      spark.setDepth(13);
      
      this.scene.tweens.add({
        targets: spark,
        y: spark.y - 20 - Math.random() * 30,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => spark.destroy()
      });
    }
    
    console.log('🔥 Fire Blast launched with enhanced visuals');
  }
  
  private castShellSlam(): void {
    // Create slam trajectory
    const direction = this.lastDirection;
    const distance = 100;
    const targetX = this.x + direction.x * distance;
    const targetY = this.y + direction.y * distance;
    
    // Charge effect
    this.setTint(0xA0522D);
    
    // Dash movement
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.clearTint();
        this.createSlamImpact();
      }
    });
    
    // Screen shake
    this.scene.cameras.main.shake(300, 0.02);
    
    // Create slam area effect
    this.scene.events.emit('create-area-effect', {
      x: targetX,
      y: targetY,
      radius: 80,
      damage: 25 + this.stats.attack * 0.8,
      damageType: 'physical',
      duration: 500,
      source: this
    });
    
    console.log('💥 Shell Slam executed with charge and impact');
  }
  
  /**
   * Create slam impact visual
   */
  private createSlamImpact(): void {
    // Impact crater effect
    const crater = this.scene.add.circle(this.x, this.y, 5, 0x8B4513, 0.8);
    crater.setDepth(11);
    
    this.scene.tweens.add({
      targets: crater,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => crater.destroy()
    });
    
    // Debris particles
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const debris = this.scene.add.circle(this.x, this.y, 2 + Math.random() * 3, 0x654321, 1);
      debris.setDepth(13);
      
      const endX = this.x + Math.cos(angle) * speed;
      const endY = this.y + Math.sin(angle) * speed;
      
      this.scene.tweens.add({
        targets: debris,
        x: endX,
        y: endY,
        alpha: 0,
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => debris.destroy()
      });
    }
  }
  
  private castPrecisionStrike(): void {
    // Enhanced precision attack with targeting
    const direction = this.lastDirection;
    const range = 150;
    
    // Create targeting beam
    const beam = this.scene.add.rectangle(
      this.x + direction.x * range / 2,
      this.y + direction.y * range / 2,
      direction.x !== 0 ? range : 8,
      direction.y !== 0 ? range : 8,
      0x4169E1, 0.6
    );
    beam.setDepth(14);
    
    // Charging effect
    this.setTint(0x4169E1);
    
    // Beam animation
    this.scene.tweens.add({
      targets: beam,
      alpha: 0.2,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        beam.destroy();
        this.clearTint();
        this.executePrecisionStrike(direction, range);
      }
    });
    
    console.log('🎯 Precision Strike charging');
  }
  
  /**
   * Execute precision strike with guaranteed critical
   */
  private executePrecisionStrike(direction: { x: number; y: number }, range: number): void {
    // Create piercing line effect
    this.scene.events.emit('create-line-effect', {
      startX: this.x,
      startY: this.y,
      endX: this.x + direction.x * range,
      endY: this.y + direction.y * range,
      width: 20,
      damage: 20 + this.stats.attack * 0.9,
      damageType: 'physical',
      source: this,
      guaranteedCritical: true,
      piercing: true
    });
    
    // Strike flash effect
    const flash = this.scene.add.rectangle(
      this.x + direction.x * range / 2,
      this.y + direction.y * range / 2,
      direction.x !== 0 ? range : 12,
      direction.y !== 0 ? range : 12,
      0xffffff, 0.9
    );
    flash.setDepth(15);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy()
    });
    
    console.log('🎯 Precision Strike executed with guaranteed crit');
  }
  
  private castFlameAura(): void {
    // Create flame aura visual
    const aura = this.scene.add.circle(this.x, this.y, 60, 0xFF4500, 0.2);
    aura.setStrokeStyle(3, 0xFF6347, 0.6);
    aura.setDepth(11);
    
    // Floating flame particles
    const flameParticles: Phaser.GameObjects.GameObject[] = [];
    
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const flame = this.scene.add.circle(
        this.x + Math.cos(angle) * 50,
        this.y + Math.sin(angle) * 50,
        4, 0xFF4500, 0.8
      );
      flame.setDepth(12);
      flameParticles.push(flame);
      
      // Flickering animation
      this.scene.tweens.add({
        targets: flame,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0.4,
        duration: 200 + Math.random() * 300,
        yoyo: true,
        repeat: -1
      });
      
      // Orbital motion
      this.scene.tweens.add({
        targets: flame,
        angle: angle + Math.PI * 2,
        duration: 4000,
        repeat: 2,
        ease: 'Linear'
      });
    }
    
    // Pulsing aura
    this.scene.tweens.add({
      targets: aura,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.1,
      duration: 800,
      yoyo: true,
      repeat: 12
    });
    
    // Apply burning aura effect
    this.scene.events.emit('apply-aura', {
      target: this,
      radius: 60,
      damage: 8 + this.stats.attack * 0.3,
      damageType: 'fire',
      duration: 10000,
      tickInterval: 1000
    });
    
    // Cleanup after duration
    this.scene.time.delayedCall(10000, () => {
      aura.destroy();
      flameParticles.forEach(particle => {
        if (particle && particle.active) {
          particle.destroy();
        }
      });
    });
    
    console.log('🔥 Flame Aura ignited with orbital flames');
  }
  
  private levelUp(): boolean {
    const oldLevel = this.stats.level;
    this.stats.level++;
    
    // Calculate new experience requirement
    this.stats.experience -= this.stats.experienceToNext;
    this.stats.experienceToNext = Math.floor(100 * Math.pow(1.2, this.stats.level - 1));
    
    // Apply level up bonuses
    this.applyLevelUpBonuses();
    
    // Notify skill system of level up (for talent points)
    this.notifyLevelUp();
    
    // Visual and audio feedback
    this.showLevelUpEffect();
    
    console.log(`🌟 LEVEL UP! ${oldLevel} → ${this.stats.level}`);
    
    return true;
  }
  
  /**
   * Notify external systems of level up
   */
  private notifyLevelUp(): void {
    // This will be called by systems that need to know about level ups
    // For now, just emit an event that can be listened to
    this.scene.events.emit('hero-level-up', this.stats.level);
  }
  
  private applyLevelUpBonuses(): void {
    // Base stat increases per level
    const hpIncrease = Math.floor(10 + (this.stats.level * 2));
    const mpIncrease = Math.floor(5 + this.stats.level);
    
    this.stats.maxHP += hpIncrease;
    this.stats.maxMP += mpIncrease;
    
    // Class-specific bonuses
    switch (this.shellClass) {
      case 'Shell Defender':
        this.stats.defense += 2;
        this.stats.maxHP += 5; // Extra HP for tank
        break;
      case 'Swift Current':
        this.stats.speed += 1;
        this.stats.criticalRate += 1;
        break;
      case 'Fire Belly':
        this.stats.attack += 2;
        this.stats.maxMP += 5; // Extra MP for mage
        break;
    }
    
    // Restore health and mana on level up
    this.stats.currentHP = this.stats.maxHP;
    this.stats.currentMP = this.stats.maxMP;
  }
  
  private showDamageNumber(damage: number): void {
    // Create floating damage text
    const damageText = this.scene.add.text(this.x, this.y - 20, `-${damage}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Animate the text
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
    
    console.log(`💥 -${damage}`);
  }
  
  private showHealNumber(heal: number): void {
    // Create floating heal text
    const healText = this.scene.add.text(this.x, this.y - 20, `+${heal}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#44ff44',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Animate the text
    this.scene.tweens.add({
      targets: healText,
      y: healText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => healText.destroy()
    });
    
    console.log(`💚 +${heal}`);
  }
  
  private showLevelUpEffect(): void {
    // Level up burst effect
    const levelUpText = this.scene.add.text(this.x, this.y, 'LEVEL UP!', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: levelUpText,
      scaleX: 1.5,
      scaleY: 1.5,
      y: levelUpText.y - 60,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => levelUpText.destroy()
    });
    
    // Radial particles effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.circle(this.x, this.y, 4, 0xffff00);
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 100,
        y: this.y + Math.sin(angle) * 100,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
    
    console.log('🌟 LEVEL UP EFFECT');
  }
  
  private flashRed(): void {
    // Quick red tint when taking damage
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }
  
  private onDeath(): void {
    console.log('💀 Hero has fallen!');
    
    // Play death animation
    this.play(`${this.animationPrefix}_death`);
    
    // Trigger death scene after animation
    this.scene.time.delayedCall(2000, () => {
      this.scene.scene.start('DeathScene');
    });
  }
  
  /**
   * Set hero invulnerable for a duration
   */
  public setInvulnerable(duration: number): void {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = duration;
    
    // Visual feedback - make hero semi-transparent
    this.setAlpha(0.7);
    
    console.log(`🛡️ Hero invulnerable for ${duration}ms`);
  }
  
  /**
   * Update invulnerability timer
   */
  private updateInvulnerability(delta: number): void {
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= delta;
      
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.setAlpha(1.0); // Restore full opacity
        console.log('🛡️ Hero invulnerability ended');
      }
    }
  }
  
  private createFallbackAnimations(): void {
    // Create simple fallback animations using the hero's current texture
    const directions = ['down', 'up', 'left', 'right'];
    const actions = ['idle', 'walk', 'attack', 'cast', 'death'];
    
    directions.forEach(direction => {
      actions.forEach(action => {
        const key = `${this.animationPrefix}_${action}_${direction}`;
        
        if (!this.scene.anims.exists(key)) {
          this.scene.anims.create({
            key: key,
            frames: [{ key: this.texture.key, frame: this.frame.name }],
            frameRate: 1,
            repeat: action === 'idle' || action === 'walk' ? -1 : 0
          });
        }
      });
    });
    
    // Set a working animation
    try {
      this.play(`${this.animationPrefix}_idle_down`);
    } catch (error) {
      console.warn('🐢 Failed to play hero animation, using static sprite');
    }
  }
}
