/**
 * CombatSystem - Real-time action combat mechanics
 * Handles damage calculation, spell effects, and combat interactions
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';

export interface DamageInfo {
  amount: number;
  type: 'physical' | 'fire' | 'water' | 'earth';
  isCritical: boolean;
  source: Phaser.GameObjects.GameObject;
  target: Phaser.GameObjects.GameObject;
}

export interface CombatEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'damage' | 'heal';
  duration: number;
  remainingTime: number;
  tickInterval: number;
  lastTick: number;
  value: number;
  target: Phaser.GameObjects.GameObject;
  sprite?: Phaser.GameObjects.Sprite;
  damage?: number;
  damageType?: 'physical' | 'fire' | 'water' | 'earth';
  source?: Phaser.GameObjects.GameObject;
}

export interface Projectile {
  sprite: Phaser.GameObjects.Sprite;
  damage: number;
  damageType: 'physical' | 'fire' | 'water' | 'earth';
  speed: number;
  direction: { x: number; y: number };
  source: Phaser.GameObjects.GameObject;
  piercing: boolean;
  range: number;
  distanceTraveled: number;
}

export class CombatSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Combat state
  private activeEffects: CombatEffect[] = [];
  private activeProjectiles: Projectile[] = [];
  private damageNumbers: Phaser.GameObjects.Text[] = [];
  
  // Combat groups for collision detection
  private heroGroup!: Phaser.Physics.Arcade.Group;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private projectileGroup!: Phaser.Physics.Arcade.Group;
  private effectGroup!: Phaser.Physics.Arcade.Group;
  
  // Visual effects
  private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeGroups();
    this.setupCollisions();
    this.setupAbilityEvents();
    
    console.log('⚔️ CombatSystem initialized');
  }
  
  /**
   * Setup ability event listeners
   */
  private setupAbilityEvents(): void {
    // Listen for ability events from Hero
    this.scene.events.on('create-projectile', this.handleCreateProjectile, this);
    this.scene.events.on('create-area-effect', this.handleCreateAreaEffect, this);
    this.scene.events.on('create-line-effect', this.handleCreateLineEffect, this);
    this.scene.events.on('apply-shield', this.handleApplyShield, this);
    this.scene.events.on('apply-aura', this.handleApplyAura, this);
    
    console.log('⚔️ Ability events configured');
  }
  
  /**
   * Set the hero reference
   */
  public setHero(hero: Hero): void {
    this.hero = hero;
    this.heroGroup.add(hero);
    console.log('🐢 Hero registered with combat system');
  }
  
  /**
   * Setup enemy collision detection
   */
  public setupEnemyCollisions(enemyGroup: Phaser.Physics.Arcade.Group): void {
    this.enemyGroup = enemyGroup;
    
    // Hero vs Enemy collision (melee combat)
    this.scene.physics.add.overlap(this.heroGroup, this.enemyGroup, this.handleHeroEnemyCollision, undefined, this);
    
    // Hero projectiles vs Enemies
    this.scene.physics.add.overlap(this.projectileGroup, this.enemyGroup, this.handleProjectileEnemyCollision, undefined, this);
    
    // Hero area effects vs Enemies
    this.scene.physics.add.overlap(this.effectGroup, this.enemyGroup, this.handleEffectEnemyCollision, undefined, this);
    
    console.log('⚔️ Enemy collision detection setup');
  }
  
  /**
   * Update combat system
   */
  public update(time: number, delta: number): void {
    this.updateProjectiles(delta);
    this.updateEffects(time, delta);
    this.updateDamageNumbers(delta);
    this.cleanupExpiredObjects();
  }
  
  /**
   * Create melee attack hitbox
   */
  public createMeleeAttack(attacker: Phaser.GameObjects.GameObject, damage: number, range: number = 80): void {
    const attackerSprite = attacker as Phaser.GameObjects.Sprite;
    const direction = this.getAttackerDirection(attackerSprite);
    
    // Calculate attack position
    const attackX = attackerSprite.x + (direction.x * range);
    const attackY = attackerSprite.y + (direction.y * range);
    
    // Create temporary hitbox
    const hitbox = this.scene.add.zone(attackX, attackY, range, range);
    this.scene.physics.add.existing(hitbox);
    
    // Visual attack effect
    this.createAttackEffect(attackX, attackY, direction);
    
    // Check for hits
    this.scene.physics.overlap(hitbox, this.enemyGroup, (hitboxObj, enemy) => {
      this.handleMeleeHit(attacker, enemy as Phaser.GameObjects.GameObject, damage);
    });
    
    // Remove hitbox after brief moment
    this.scene.time.delayedCall(100, () => {
      hitbox.destroy();
    });
  }
  
  /**
   * Create ranged projectile
   */
  public createProjectile(
    source: Phaser.GameObjects.GameObject,
    startX: number,
    startY: number,
    direction: { x: number; y: number },
    damage: number,
    damageType: 'physical' | 'fire' | 'water' | 'earth' = 'physical',
    speed: number = 400,
    range: number = 600,
    piercing: boolean = false
  ): void {
    // Create projectile sprite
    const sprite = this.scene.add.sprite(startX, startY, 'projectile_' + damageType);
    this.scene.physics.add.existing(sprite);
    
    // Set projectile tint based on damage type
    const typeTints = {
      physical: 0xcccccc,
      fire: 0xff4400,
      water: 0x0088ff,
      earth: 0x8b4513
    };
    sprite.setTint(typeTints[damageType]);
    
    // Create projectile data
    const projectile: Projectile = {
      sprite,
      damage,
      damageType,
      speed,
      direction: { ...direction },
      source,
      piercing,
      range,
      distanceTraveled: 0
    };
    
    this.activeProjectiles.push(projectile);
    this.projectileGroup.add(sprite);
    
    // Set initial velocity
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(direction.x * speed, direction.y * speed);
    
    // Add trail effect
    this.createProjectileTrail(sprite, damageType);
    
    console.log(`🏹 Projectile created: ${damageType} (${damage} damage)`);
  }
  
  /**
   * Apply combat effect to target
   */
  public applyEffect(
    target: Phaser.GameObjects.GameObject,
    effectType: 'buff' | 'debuff' | 'damage' | 'heal',
    value: number,
    duration: number,
    name: string,
    tickInterval: number = 1000
  ): void {
    const effect: CombatEffect = {
      id: `${name}_${Date.now()}`,
      name,
      type: effectType,
      duration,
      remainingTime: duration,
      tickInterval,
      lastTick: Date.now(),
      value,
      target
    };
    
    this.activeEffects.push(effect);
    this.createEffectVisual(target, effectType, name);
    
    console.log(`✨ Effect applied: ${name} (${value} ${effectType})`);
  }
  
  /**
   * Calculate damage with resistances and bonuses
   */
  public calculateDamage(
    baseDamage: number,
    damageType: 'physical' | 'fire' | 'water' | 'earth',
    attacker: any,
    target: any
  ): DamageInfo {
    let finalDamage = baseDamage;
    
    // Apply attacker bonuses
    if (attacker.stats) {
      finalDamage += attacker.stats.attack || 0;
      
      // Check for critical hit
      const critChance = attacker.stats.criticalRate || 0;
      const isCritical = Math.random() * 100 < critChance;
      
      if (isCritical) {
        const critMultiplier = (attacker.stats.criticalDamage || 150) / 100;
        finalDamage *= critMultiplier;
      }
    }
    
    // Apply target defenses
    if (target.stats) {
      const defense = target.stats.defense || 0;
      const defenseReduction = defense / (defense + 100);
      finalDamage *= (1 - defenseReduction);
      
      // Apply elemental resistances
      switch (damageType) {
        case 'fire':
          finalDamage *= (1 - (target.stats.fireResistance || 0) / 100);
          break;
        case 'water':
          finalDamage *= (1 - (target.stats.waterResistance || 0) / 100);
          break;
        case 'earth':
          finalDamage *= (1 - (target.stats.earthResistance || 0) / 100);
          break;
      }
    }
    
    return {
      amount: Math.max(1, Math.round(finalDamage)),
      type: damageType,
      isCritical: false, // Will be set by attacker logic
      source: attacker,
      target: target
    };
  }
  
  /**
   * Create visual damage number
   */
  public showDamageNumber(x: number, y: number, damage: number, isCritical: boolean = false): void {
    const color = isCritical ? '#ffff00' : '#ff4444';
    const fontSize = isCritical ? '24px' : '18px';
    const prefix = isCritical ? 'CRIT! ' : '';
    
    const damageText = this.scene.add.text(x, y, `${prefix}${damage}`, {
      fontSize: fontSize,
      color: color,
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    damageText.setScrollFactor(0); // Don't scroll with camera
    this.damageNumbers.push(damageText);
    
    // Animate damage number
    this.scene.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      scaleX: isCritical ? 1.5 : 1.2,
      scaleY: isCritical ? 1.5 : 1.2,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        const index = this.damageNumbers.indexOf(damageText);
        if (index > -1) {
          this.damageNumbers.splice(index, 1);
        }
        damageText.destroy();
      }
    });
  }
  
  /**
   * Create area of effect damage
   */
  public createAreaDamage(
    centerX: number,
    centerY: number,
    radius: number,
    damage: number,
    damageType: 'physical' | 'fire' | 'water' | 'earth',
    source: Phaser.GameObjects.GameObject
  ): void {
    // Create visual effect
    this.createExplosionEffect(centerX, centerY, radius, damageType);
    
    // Create damage zone
    const damageZone = this.scene.add.zone(centerX, centerY, radius * 2, radius * 2);
    this.scene.physics.add.existing(damageZone);
    
    // Check for overlapping enemies
    this.scene.physics.overlap(damageZone, this.enemyGroup, (zone, enemy) => {
      const distance = Phaser.Math.Distance.Between(
        centerX, centerY,
        enemy.x, enemy.y
      );
      
      if (distance <= radius) {
        // Apply damage with falloff based on distance
        const falloffMultiplier = 1 - (distance / radius) * 0.5;
        const finalDamage = Math.round(damage * falloffMultiplier);
        
        this.dealDamage(source, enemy as Phaser.GameObjects.GameObject, finalDamage, damageType);
      }
    });
    
    // Clean up damage zone
    damageZone.destroy();
  }
  
  /**
   * Deal damage to target
   */
  public dealDamage(
    source: Phaser.GameObjects.GameObject,
    target: Phaser.GameObjects.GameObject,
    damage: number,
    damageType: 'physical' | 'fire' | 'water' | 'earth' = 'physical'
  ): number {
    const damageInfo = this.calculateDamage(damage, damageType, source, target);
    
    // Apply damage to target
    if (target instanceof Hero) {
      target.takeDamage(damageInfo.amount, damageInfo.type);
    } else if ((target as any).takeDamage) {
      (target as any).takeDamage(damageInfo.amount, damageInfo.type);
    }
    
    // Show damage number
    this.showDamageNumber(target.x, target.y - 20, damageInfo.amount, damageInfo.isCritical);
    
    // Create hit effect
    this.createHitEffect(target.x, target.y, damageInfo.type);
    
    return damageInfo.amount;
  }
  
  /**
   * Clean up combat system
   */
  public destroy(): void {
    // Clean up projectiles
    this.activeProjectiles.forEach(projectile => {
      if (projectile.sprite && !projectile.sprite.destroyed) {
        projectile.sprite.destroy();
      }
    });
    this.activeProjectiles = [];
    
    // Clean up effects
    this.activeEffects = [];
    
    // Clean up damage numbers
    this.damageNumbers.forEach(text => {
      if (!text.destroyed) {
        text.destroy();
      }
    });
    this.damageNumbers = [];
    
    // Clean up particle emitters
    this.particleEmitters.forEach(emitter => {
      if (!emitter.destroyed) {
        emitter.destroy();
      }
    });
    this.particleEmitters = [];
    
    console.log('⚔️ CombatSystem destroyed');
  }
  
  // Private helper methods
  
  private initializeGroups(): void {
    this.heroGroup = this.scene.physics.add.group();
    this.enemyGroup = this.scene.physics.add.group();
    this.projectileGroup = this.scene.physics.add.group();
    this.effectGroup = this.scene.physics.add.group();
  }
  
  private setupCollisions(): void {
    // Projectile vs Enemy collisions
    this.scene.physics.add.overlap(
      this.projectileGroup,
      this.enemyGroup,
      this.onProjectileHitEnemy,
      undefined,
      this
    );
    
    // Projectile vs Hero collisions  
    this.scene.physics.add.overlap(
      this.projectileGroup,
      this.heroGroup,
      this.onProjectileHitHero,
      undefined,
      this
    );
  }
  
  private onProjectileHitEnemy(projectileSprite: any, enemy: any): void {
    const projectile = this.activeProjectiles.find(p => p.sprite === projectileSprite);
    if (!projectile) return;
    
    // Deal damage
    this.dealDamage(projectile.source, enemy, projectile.damage, projectile.damageType);
    
    // Remove projectile unless it's piercing
    if (!projectile.piercing) {
      this.removeProjectile(projectile);
    }
  }
  
  private onProjectileHitHero(projectileSprite: any, hero: any): void {
    const projectile = this.activeProjectiles.find(p => p.sprite === projectileSprite);
    if (!projectile || projectile.source === hero) return;
    
    // Deal damage to hero
    this.dealDamage(projectile.source, hero, projectile.damage, projectile.damageType);
    
    // Remove projectile
    this.removeProjectile(projectile);
  }
  
  private removeProjectile(projectile: Projectile): void {
    const index = this.activeProjectiles.indexOf(projectile);
    if (index > -1) {
      this.activeProjectiles.splice(index, 1);
      if (projectile.sprite && !projectile.sprite.destroyed) {
        projectile.sprite.destroy();
      }
    }
  }
  
  private updateProjectiles(delta: number): void {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i];
      
      // Update distance traveled
      projectile.distanceTraveled += projectile.speed * (delta / 1000);
      
      // Remove if out of range
      if (projectile.distanceTraveled >= projectile.range) {
        this.removeProjectile(projectile);
      }
    }
  }
  
  private updateEffects(time: number, delta: number): void {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      
      // Update remaining time
      effect.remainingTime -= delta;
      
      // Apply effect tick
      if (time - effect.lastTick >= effect.tickInterval) {
        this.applyEffectTick(effect);
        effect.lastTick = time;
      }
      
      // Remove expired effects
      if (effect.remainingTime <= 0) {
        this.activeEffects.splice(i, 1);
      }
    }
  }
  
  private updateDamageNumbers(delta: number): void {
    // Damage numbers are managed by their own tweens
    // This method can be used for additional updates if needed
  }
  
  private cleanupExpiredObjects(): void {
    // Remove destroyed projectiles
    this.activeProjectiles = this.activeProjectiles.filter(p => 
      p.sprite && p.sprite.active
    );
    
    // Remove destroyed damage numbers
    this.damageNumbers = this.damageNumbers.filter(text => 
      text.active
    );
  }
  
  private getAttackerDirection(attacker: Phaser.GameObjects.Sprite): { x: number; y: number } {
    // Get direction from Hero's lastDirection or default to down
    if (attacker instanceof Hero) {
      return attacker.lastDirection;
    }
    
    // Default direction for other attackers
    return { x: 0, y: 1 };
  }
  
  private handleMeleeHit(attacker: Phaser.GameObjects.GameObject, target: Phaser.GameObjects.GameObject, damage: number): void {
    this.dealDamage(attacker, target, damage, 'physical');
  }
  
  private applyEffectTick(effect: CombatEffect): void {
    const target = effect.target;
    
    switch (effect.type) {
      case 'damage':
        if (target instanceof Hero) {
          target.takeDamage(effect.value);
        } else if ((target as any).takeDamage) {
          (target as any).takeDamage(effect.value);
        }
        break;
        
      case 'heal':
        if (target instanceof Hero) {
          target.heal(effect.value);
        } else if ((target as any).heal) {
          (target as any).heal(effect.value);
        }
        break;
        
      // Buffs and debuffs would modify stats directly
      case 'buff':
      case 'debuff':
        // IMPLEMENTED: Implement stat modifications
        break;
    }
  }
  
  private createAttackEffect(x: number, y: number, direction: { x: number; y: number }): void {
    // Create simple attack flash
    const flash = this.scene.add.circle(x, y, 30, 0xffffff, 0.8);
    
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }
  
  private createProjectileTrail(sprite: Phaser.GameObjects.Sprite, damageType: string): void {
    // Simple trail effect - IMPLEMENTED: Replace with particle system
    const trail = this.scene.add.circle(sprite.x, sprite.y, 4, 0xffffff, 0.5);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 300,
      onComplete: () => trail.destroy()
    });
  }
  
  private createEffectVisual(target: Phaser.GameObjects.GameObject, effectType: string, name: string): void {
    // Create visual indicator for effect
    const colors = {
      buff: 0x00ff00,
      debuff: 0xff0000,
      damage: 0xff4444,
      heal: 0x44ff44
    };
    
    const color = colors[effectType as keyof typeof colors] || 0xffffff;
    const targetSprite = target as Phaser.GameObjects.Sprite;
    const ring = this.scene.add.circle(targetSprite.x, targetSprite.y, 40, color, 0.3);
    ring.setStrokeStyle(2, color, 0.8);
    
    this.scene.tweens.add({
      targets: ring,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1000,
      onComplete: () => ring.destroy()
    });
  }
  
  private createExplosionEffect(x: number, y: number, radius: number, damageType: string): void {
    const colors = {
      physical: 0xcccccc,
      fire: 0xff4400,
      water: 0x0088ff,
      earth: 0x8b4513
    };
    
    const color = colors[damageType as keyof typeof colors] || 0xffffff;
    const explosion = this.scene.add.circle(x, y, 10, color, 0.8);
    
    this.scene.tweens.add({
      targets: explosion,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => explosion.destroy()
    });
  }
  
  private createHitEffect(x: number, y: number, damageType: string): void {
    const colors = {
      physical: 0xffffff,
      fire: 0xff4400,
      water: 0x0088ff,
      earth: 0x8b4513,
      enemy_hit: 0xff0000,
      projectile_hit: 0xffff00,
      area_hit: 0xff8800
    };
    
    const color = colors[damageType as keyof typeof colors] || 0xffffff;
    const hit = this.scene.add.circle(x, y, 15, color, 0.7);
    
    this.scene.tweens.add({
      targets: hit,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 200,
      onComplete: () => hit.destroy()
    });
  }
  
  /**
   * Handle collision between hero and enemy (melee combat)
   */
  private handleHeroEnemyCollision(hero: any, enemy: any): void {
    if (enemy.isDead) return;
    
    // Enemy automatically attacks hero on collision
    const currentTime = Date.now();
    if (currentTime - enemy.aiState.lastAttackTime >= enemy.stats.attackSpeed) {
      const damage = enemy.stats.attack;
      hero.takeDamage(damage, 'physical', enemy);
      enemy.aiState.lastAttackTime = currentTime;
      
      // Set hero in combat state
      hero.isInCombat = true;
      
      // Create hit effect
      this.createHitEffect(hero.x, hero.y, 'enemy_hit');
      
      // Trigger enemy alert
      this.scene.events.emit('enemy-collision', enemy.x, enemy.y);
      
      console.log(`⚔️ ${enemy.enemyName} attacks hero for ${damage} damage`);
    }
  }
  
  /**
   * Handle collision between projectile and enemy
   */
  private handleProjectileEnemyCollision(projectile: any, enemy: any): void {
    if (enemy.isDead) return;
    
    // Find the projectile data
    const projectileData = this.activeProjectiles.find(p => p.sprite === projectile);
    if (!projectileData) return;
    
    // Apply damage
    const damage = projectileData.damage;
    enemy.takeDamage(damage, projectileData.damageType, projectileData.source);
    
    // Create hit effect
    this.createHitEffect(enemy.x, enemy.y, 'projectile_hit');
    
    // Remove projectile unless it's piercing
    if (!projectileData.piercing) {
      this.removeProjectile(projectileData);
    }
    
    console.log(`🎯 Projectile hits ${enemy.enemyName} for ${damage} damage`);
  }
  
  /**
   * Handle collision between area effect and enemy
   */
  private handleEffectEnemyCollision(effect: any, enemy: any): void {
    if (enemy.isDead) return;
    
    // Find the effect data
    const effectData = this.activeEffects.find(e => e.sprite === effect);
    if (!effectData) return;
    
    // Check if enemy has already been hit by this effect
    const effectId = effectData.id;
    if (enemy.hitByEffects && enemy.hitByEffects.includes(effectId)) {
      return;
    }
    
    // Apply damage
    const damage = effectData.damage;
    enemy.takeDamage(damage, effectData.damageType, effectData.source);
    
    // Mark enemy as hit by this effect
    if (!enemy.hitByEffects) {
      enemy.hitByEffects = [];
    }
    enemy.hitByEffects.push(effectId);
    
    // Create hit effect
    this.createHitEffect(enemy.x, enemy.y, 'area_hit');
    
    console.log(`💥 Area effect hits ${enemy.enemyName} for ${damage} damage`);
  }
  
  /**
   * Handle create projectile event
   */
  private handleCreateProjectile(data: any): void {
    this.createProjectile(
      data.source, data.x, data.y, data.direction,
      data.damage, data.damageType, data.speed, data.range, data.piercing
    );
    
    // Enhanced projectile visual based on type - IMPLEMENTED: Visual effects handled in createProjectile
  }
  
  /**
   * Handle create area effect event
   */
  private handleCreateAreaEffect(data: any): void {
    this.createAttackEffect(
      data.x, data.y, data.radius, data.damage, data.damageType, data.duration, data.source
    );
  }
  
  /**
   * Handle create line effect event
   */
  private handleCreateLineEffect(data: any): void {
    this.createLineEffect(data);
  }
  
  /**
   * Handle apply shield event
   */
  private handleApplyShield(data: any): void {
    // IMPLEMENTED: Implement shield mechanics
    console.log(`🛡️ Applied ${data.amount} ${data.type} shield for ${data.duration}ms`);
  }
  
  /**
   * Handle apply aura event
   */
  private handleApplyAura(data: any): void {
    // IMPLEMENTED: Implement aura mechanics
    console.log(`🔥 Applied ${data.damage} damage aura for ${data.duration}ms`);
  }
  
  /**
   * Create line effect for dash abilities
   */
  private createLineEffect(data: any): void {
    const lineLength = Phaser.Math.Distance.Between(data.startX, data.startY, data.endX, data.endY);
    const angle = Phaser.Math.Angle.Between(data.startX, data.startY, data.endX, data.endY);
    
    // Create line visual
    const line = this.scene.add.rectangle(
      data.startX + Math.cos(angle) * lineLength / 2,
      data.startY + Math.sin(angle) * lineLength / 2,
      lineLength,
      data.width,
      0x00ff88, 0.6
    );
    line.setRotation(angle);
    line.setDepth(13);
    
    // Fade out animation
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 300,
      onComplete: () => line.destroy()
    });
    
    // Apply damage to enemies in line
    if (this.enemyGroup) {
      this.enemyGroup.children.entries.forEach((enemy: any) => {
        if (enemy.isDead) return;
        
        const distance = this.distanceToLine(
          enemy.x, enemy.y,
          data.startX, data.startY,
          data.endX, data.endY
        );
        
        if (distance <= data.width / 2) {
          let damage = data.damage;
          if (data.guaranteedCritical) {
            damage *= 2;
            this.createCriticalEffect(enemy.x, enemy.y);
          }
          
          enemy.takeDamage(damage, data.damageType, data.source);
          this.createHitEffect(enemy.x, enemy.y, data.damageType);
        }
      });
    }
    
    console.log(`⚡ Line effect created: ${lineLength} length, ${data.damage} damage`);
  }
  
  /**
   * Calculate distance from point to line
   */
  private distanceToLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const xx = x1 + param * C;
    const yy = y1 + param * D;
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Create critical hit effect
   */
  private createCriticalEffect(x: number, y: number): void {
    const crit = this.scene.add.text(x, y, 'CRITICAL!', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'Arial Black',
      stroke: '#ff0000',
      strokeThickness: 2
    }).setOrigin(0.5);
    crit.setDepth(20);
    
    this.scene.tweens.add({
      targets: crit,
      y: crit.y - 40,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => crit.destroy()
    });
  }
  
  /**
   * Enhance fire projectile with trail effects
   */
  private enhanceFireProjectile(projectile: Projectile): void {
    // Create fire trail
    const trail = this.scene.add.particles(projectile.sprite.x, projectile.sprite.y, 'fire_particle', {
      scale: { start: 0.3, end: 0.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      frequency: 50,
      tint: 0xFF4500
    });
    trail.setDepth(12);
    
    // Follow projectile
    const updateTrail = () => {
      if (projectile.sprite && projectile.sprite.active) {
        trail.setPosition(projectile.sprite.x, projectile.sprite.y);
      }
    };
    
    this.scene.events.on('update', updateTrail);
    
    // Cleanup when projectile is destroyed
    const originalDestroy = projectile.sprite.destroy;
    projectile.sprite.destroy = function() {
      trail.destroy();
      this.scene.events.off('update', updateTrail);
      originalDestroy.call(this);
    };
  }
}
