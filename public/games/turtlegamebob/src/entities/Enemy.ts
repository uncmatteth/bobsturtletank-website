/**
 * Enemy - Hostile creatures that populate the dungeon depths
 * Base class for all enemy types with AI behaviors and combat integration
 */

import Phaser from 'phaser';
import { Hero } from './Hero';

export type EnemyType = 'melee' | 'ranged' | 'magic' | 'boss';
export type EnemyBehavior = 'aggressive' | 'defensive' | 'patrol' | 'guard' | 'hunt';
export type DamageType = 'physical' | 'fire' | 'water' | 'earth';

export interface EnemyStats {
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  speed: number;
  attackSpeed: number;
  aggroRange: number;
  attackRange: number;
  
  // Resistances
  fireResistance: number;
  waterResistance: number;
  earthResistance: number;
  
  // AI parameters
  patrolRadius: number;
  chaseTimeout: number;
  stunResistance: number;
}

export interface EnemyRewards {
  experience: number;
  gold: number;
  lootTable: LootDrop[];
}

export interface LootDrop {
  itemType: string;
  dropChance: number;
  quantity: { min: number; max: number };
  rarity?: string;
}

export interface AIState {
  currentBehavior: EnemyBehavior;
  target: Phaser.GameObjects.GameObject | null;
  lastTargetPosition: { x: number; y: number } | null;
  alertTime: number;
  patrolPoints: { x: number; y: number }[];
  currentPatrolIndex: number;
  lastAttackTime: number;
  stunUntil: number;
  homePosition: { x: number; y: number };
  personality?: string;
  groupId?: string;
  leadershipValue?: number;
  lastAIDecision?: any;
  adaptationLevel: number;
}

export class Enemy extends Phaser.GameObjects.Sprite {
  public stats: EnemyStats;
  public rewards: EnemyRewards;
  public aiState: AIState;
  
  // Enemy configuration
  public enemyType: EnemyType;
  public enemyName: string;
  public level: number;
  public isBoss: boolean = false;
  
  // Combat state
  public isDead: boolean = false;
  public isStunned: boolean = false;
  public lastDamageTime: number = 0;
  
  // Visual elements
  public healthBar: Phaser.GameObjects.Graphics | null = null;
  public nameText: Phaser.GameObjects.Text | null = null;
  public statusEffects: Map<string, number> = new Map();
  
  // AI timing
  public lastAIUpdate: number = 0;
  public aiUpdateInterval: number = 100; // Update AI every 100ms
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    enemyType: EnemyType,
    level: number = 1,
    texture: string = 'enemies_atlas'
  ) {
    super(scene, x, y, texture);
    
    this.enemyType = enemyType;
    this.level = level;
    this.enemyName = this.generateEnemyName();
    
    // Initialize stats based on type and level
    this.stats = this.generateStats();
    this.rewards = this.generateRewards();
    this.aiState = this.initializeAI();
    
    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(48, 48);
    body.setOffset(8, 16);
    body.setCollideWorldBounds(true);
    
    // Set enemy appearance
    this.configureAppearance();
    
    // Create health bar
    this.createHealthBar();
    
    console.log(`👹 ${this.enemyName} spawned (Level ${this.level} ${this.enemyType})`);
  }
  
  /**
   * Update enemy AI and behavior
   */
  public update(time: number, delta: number): void {
    if (this.isDead) return;
    
    // Update status effects
    this.updateStatusEffects(delta);
    
    // Update AI behavior
    if (time - this.lastAIUpdate >= this.aiUpdateInterval) {
      this.updateEnhancedAI(time);
      this.lastAIUpdate = time;
    }
    
    // Update visual elements
    this.updateVisuals();
  }
  
  /**
   * Enhanced AI update with behavior system integration
   */
  private updateEnhancedAI(time: number): void {
    if (this.isDead || this.isStunned) return;
    
    // Get AI decision from behavior system if available
    const aiSystem = this.getAIBehaviorSystem();
    if (aiSystem) {
      const decision = aiSystem.getAIDecision(this);
      this.executeAIDecision(decision);
      this.aiState.lastAIDecision = decision;
    } else {
      // Fallback to basic AI
      this.updateBasicAI(time);
    }
  }
  
  /**
   * Execute AI decision from behavior system
   */
  private executeAIDecision(decision: any): void {
    switch (decision.action) {
      case 'attack':
        this.executeAttackAction(decision.target);
        break;
      case 'chase':
        this.executeChaseAction(decision.target);
        break;
      case 'retreat':
        this.executeRetreatAction(decision.target);
        break;
      case 'coordinate_attack':
        this.executeCoordinatedAttack(decision.target);
        break;
      case 'maintain_distance':
        this.executeMaintainDistance(decision.target);
        break;
      case 'flank':
        this.executeFlankAction(decision.target);
        break;
      case 'tactical_position':
        this.executeTacticalPosition(decision.target);
        break;
      case 'berserker_rage':
        this.executeBerserkerRage(decision.target);
        break;
      case 'guard':
        this.executeGuardAction(decision.target);
        break;
      case 'hunt':
        this.executeHuntAction();
        break;
      case 'patrol':
      default:
        this.executePatrolAction();
        break;
    }
  }
  
  /**
   * Get reference to AI behavior system
   */
  private getAIBehaviorSystem(): any {
    // This would be injected by the enemy system
    return (this.scene as any).aiBehaviorSystem || null;
  }
  
  /**
   * Enhanced attack action with AI coordination
   */
  private executeAttackAction(target: { x: number; y: number }): void {
    if (target) {
      this.setTarget({ x: target.x, y: target.y } as any);
      this.aiState.currentBehavior = 'aggressive';
      
      const targetSprite = target as Phaser.GameObjects.Sprite;
      const distance = Phaser.Math.Distance.Between(this.x, this.y, targetSprite.x, targetSprite.y);
      if (distance <= this.stats.attackRange) {
        this.attackTarget({ x: target.x, y: target.y } as any);
      } else {
        this.moveTowards(targetSprite.x, targetSprite.y, this.stats.speed);
      }
    }
  }
  
  /**
   * Enhanced chase action with prediction
   */
  private executeChaseAction(target: { x: number; y: number }): void {
    if (target) {
      this.moveTowards(target.x, target.y, this.stats.speed * 1.2);
      this.aiState.currentBehavior = 'aggressive';
    }
  }
  
  /**
   * Retreat action for low health or overwhelming odds
   */
  private executeRetreatAction(target: { x: number; y: number }): void {
    if (target) {
      // Move away from target
      const angle = Phaser.Math.Angle.Between(target.x, target.y, this.x, this.y);
      const retreatX = this.x + Math.cos(angle) * 100;
      const retreatY = this.y + Math.sin(angle) * 100;
      
      this.moveTowards(retreatX, retreatY, this.stats.speed * 1.5);
      this.aiState.currentBehavior = 'defensive';
      
      // Call for help
      this.broadcastDistressCall();
    }
  }
  
  /**
   * Coordinated attack with other enemies
   */
  private executeCoordinatedAttack(target: { x: number; y: number }): void {
    this.executeAttackAction(target);
    
    // Signal coordinated attack to nearby allies
    this.broadcastCoordinationSignal('coordinate_attack', target);
  }
  
  /**
   * Maintain distance for ranged combat
   */
  private executeMaintainDistance(target: { x: number; y: number }): void {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    const optimalDistance = this.stats.attackRange * 0.8;
    
    if (distance < optimalDistance) {
      // Too close, back away
      const angle = Phaser.Math.Angle.Between(target.x, target.y, this.x, this.y);
      const backX = this.x + Math.cos(angle) * 50;
      const backY = this.y + Math.sin(angle) * 50;
      this.moveTowards(backX, backY, this.stats.speed);
    } else if (distance > this.stats.attackRange) {
      // Too far, move closer
      this.moveTowards(target.x, target.y, this.stats.speed * 0.7);
    } else {
      // Perfect distance, attack
      this.attackTarget({ x: target.x, y: target.y } as any);
    }
  }
  
  /**
   * Flanking maneuver
   */
  private executeFlankAction(target: { x: number; y: number }): void {
    // Calculate flanking position
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const flankAngle = angle + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
    
    const flankX = target.x + Math.cos(flankAngle) * 80;
    const flankY = target.y + Math.sin(flankAngle) * 80;
    
    this.moveTowards(flankX, flankY, this.stats.speed);
    this.aiState.currentBehavior = 'aggressive';
  }
  
  /**
   * Move to tactical position
   */
  private executeTacticalPosition(target: { x: number; y: number }): void {
    this.moveTowards(target.x, target.y, this.stats.speed);
    this.aiState.currentBehavior = 'hunt';
  }
  
  /**
   * Berserker rage mode
   */
  private executeBerserkerRage(target: { x: number; y: number }): void {
    // Increase speed and attack, reduce defense
    const rageMultiplier = 1.5;
    
    // Temporary stat boost
    this.stats.speed *= rageMultiplier;
    this.stats.attack *= rageMultiplier;
    
    // Visual effect
    this.setTint(0xff0000);
    
    // Aggressive pursuit
    this.moveTowards(target.x, target.y, this.stats.speed);
    this.aiState.currentBehavior = 'aggressive';
    
    // Reset after delay
    this.scene.time.delayedCall(5000, () => {
      this.stats.speed /= rageMultiplier;
      this.stats.attack /= rageMultiplier;
      this.clearTint();
    });
  }
  
  /**
   * Enhanced guard action
   */
  private executeGuardAction(target: { x: number; y: number }): void {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    
    if (distance > 50) {
      this.moveTowards(target.x, target.y, this.stats.speed * 0.5);
    }
    
    this.aiState.currentBehavior = 'guard';
  }
  
  /**
   * Enhanced hunt action
   */
  private executeHuntAction(): void {
    // Move in search pattern
    if (this.aiState.patrolPoints.length > 0) {
      const targetPoint = this.aiState.patrolPoints[this.aiState.currentPatrolIndex];
      this.moveTowards(targetPoint.x, targetPoint.y, this.stats.speed * 1.1);
      
      const distance = Phaser.Math.Distance.Between(this.x, this.y, targetPoint.x, targetPoint.y);
      if (distance < 30) {
        this.aiState.currentPatrolIndex = (this.aiState.currentPatrolIndex + 1) % this.aiState.patrolPoints.length;
      }
    }
    
    this.aiState.currentBehavior = 'hunt';
  }
  
  /**
   * Enhanced patrol action
   */
  private executePatrolAction(): void {
    this.behaviorPatrol(this.findNearestHero());
  }
  
  /**
   * Broadcast distress call to AI system
   */
  private broadcastDistressCall(): void {
    const aiSystem = this.getAIBehaviorSystem();
    if (aiSystem) {
      aiSystem.onEnemyDamaged(this, 0, null);
    }
  }
  
  /**
   * Broadcast coordination signal
   */
  private broadcastCoordinationSignal(action: string, target: { x: number; y: number }): void {
    // Emit event for other enemies to coordinate
    this.scene.events.emit('enemy-coordination', {
      sender: this.enemyName,
      action,
      target,
      position: { x: this.x, y: this.y }
    });
  }
  
  /**
   * Fallback to basic AI when behavior system unavailable
   */
  private updateBasicAI(time: number): void {
    this.updateAI(time);
  }
  
  /**
   * Take damage from attacks
   */
  public takeDamage(damage: number, damageType: DamageType = 'physical', source?: Phaser.GameObjects.GameObject): number {
    if (this.isDead) return 0;
    
    // Apply resistances
    let actualDamage = damage;
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
    
    // Apply defense
    const defenseReduction = this.stats.defense / (this.stats.defense + 100);
    actualDamage *= (1 - defenseReduction);
    
    actualDamage = Math.max(1, Math.round(actualDamage));
    
    // Deal damage
    this.stats.currentHP = Math.max(0, this.stats.currentHP - actualDamage);
    this.lastDamageTime = Date.now();
    
    // Visual feedback
    this.showDamageNumber(actualDamage);
    this.flashRed();
    
    // AI reaction to damage
    if (source && !this.aiState.target) {
      this.setTarget(source);
      this.aiState.currentBehavior = 'aggressive';
    }
    
    // Check for death
    if (this.stats.currentHP <= 0) {
      this.onDeath();
    }
    
    return actualDamage;
  }
  
  /**
   * Heal the enemy
   */
  public heal(amount: number): number {
    if (this.isDead) return 0;
    
    const actualHeal = Math.min(amount, this.stats.maxHP - this.stats.currentHP);
    this.stats.currentHP += actualHeal;
    
    if (actualHeal > 0) {
      this.showHealNumber(actualHeal);
    }
    
    return actualHeal;
  }
  
  /**
   * Stun the enemy for a duration
   */
  public stun(duration: number): boolean {
    if (this.isDead) return false;
    
    // Apply stun resistance
    const actualDuration = duration * (1 - this.stats.stunResistance / 100);
    
    if (actualDuration > 0) {
      this.isStunned = true;
      this.aiState.stunUntil = Date.now() + actualDuration;
      this.setTint(0x4444ff); // Blue tint for stun
      
      console.log(`😵 ${this.enemyName} stunned for ${actualDuration}ms`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Apply a status effect
   */
  public applyStatusEffect(effect: string, duration: number): void {
    this.statusEffects.set(effect, Date.now() + duration);
    console.log(`🧪 ${this.enemyName} affected by ${effect} for ${duration}ms`);
  }
  
  /**
   * Set AI target
   */
  public setTarget(target: Phaser.GameObjects.GameObject | null): void {
    this.aiState.target = target;
    if (target) {
      const targetSprite = target as Phaser.GameObjects.Sprite;
      this.aiState.lastTargetPosition = { x: targetSprite.x, y: targetSprite.y };
      this.aiState.alertTime = Date.now();
    }
  }
  
  /**
   * Get current health percentage
   */
  public getHealthPercentage(): number {
    return this.stats.currentHP / this.stats.maxHP;
  }
  
  /**
   * Check if enemy can see target
   */
  public canSeeTarget(target: Phaser.GameObjects.GameObject): boolean {
    const targetSprite = target as Phaser.GameObjects.Sprite;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetSprite.x, targetSprite.y);
    return distance <= this.stats.aggroRange;
  }
  
  /**
   * Get distance to target
   */
  public getDistanceToTarget(target: Phaser.GameObjects.GameObject): number {
    const targetSprite = target as Phaser.GameObjects.Sprite;
    return Phaser.Math.Distance.Between(this.x, this.y, targetSprite.x, targetSprite.y);
  }
  
  /**
   * Perform attack on target
   */
  public attackTarget(target: Phaser.GameObjects.GameObject): boolean {
    if (this.isDead || this.isStunned) return false;
    
    const currentTime = Date.now();
    if (currentTime - this.aiState.lastAttackTime < this.stats.attackSpeed) {
      return false;
    }
    
    const distance = this.getDistanceToTarget(target);
    if (distance > this.stats.attackRange) {
      return false;
    }
    
    // Perform attack based on enemy type
    this.performAttack(target);
    this.aiState.lastAttackTime = currentTime;
    
    return true;
  }
  
  /**
   * Destroy enemy and clean up
   */
  public destroy(): void {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    if (this.nameText) {
      this.nameText.destroy();
    }
    
    super.destroy();
  }
  
  // Private methods
  
  private generateEnemyName(): string {
    const typeNames = {
      melee: ['Dungeon Crab', 'Shell Smasher', 'Coral Guardian'],
      ranged: ['Sea Archer', 'Bubble Shooter', 'Tidal Sniper'],
      magic: ['Ocean Mage', 'Depth Sorcerer', 'Current Wizard'],
      boss: ['Leviathan Lord', 'Abyssal King', 'Tide Master']
    };
    
    const names = typeNames[this.enemyType];
    const baseName = Phaser.Utils.Array.GetRandom(names);
    
    if (this.level >= 10) {
      return `Elite ${baseName}`;
    } else if (this.level >= 5) {
      return `Veteran ${baseName}`;
    }
    
    return baseName;
  }
  
  private generateStats(): EnemyStats {
    const baseStats = {
      melee: {
        maxHP: 80,
        attack: 15,
        defense: 12,
        speed: 80,
        attackSpeed: 1200,
        aggroRange: 120,
        attackRange: 60,
        patrolRadius: 200,
        chaseTimeout: 5000,
        stunResistance: 10
      },
      ranged: {
        maxHP: 60,
        attack: 20,
        defense: 8,
        speed: 100,
        attackSpeed: 1500,
        aggroRange: 150,
        attackRange: 200,
        patrolRadius: 150,
        chaseTimeout: 4000,
        stunResistance: 5
      },
      magic: {
        maxHP: 50,
        attack: 25,
        defense: 6,
        speed: 90,
        attackSpeed: 2000,
        aggroRange: 140,
        attackRange: 180,
        patrolRadius: 180,
        chaseTimeout: 6000,
        stunResistance: 20
      },
      boss: {
        maxHP: 300,
        attack: 35,
        defense: 25,
        speed: 60,
        attackSpeed: 800,
        aggroRange: 200,
        attackRange: 100,
        patrolRadius: 100,
        chaseTimeout: 10000,
        stunResistance: 50
      }
    };
    
    const base = baseStats[this.enemyType];
    const levelMultiplier = 1 + (this.level - 1) * 0.15;
    
    return {
      maxHP: Math.round(base.maxHP * levelMultiplier),
      currentHP: Math.round(base.maxHP * levelMultiplier),
      attack: Math.round(base.attack * levelMultiplier),
      defense: Math.round(base.defense * levelMultiplier),
      speed: base.speed,
      attackSpeed: base.attackSpeed,
      aggroRange: base.aggroRange,
      attackRange: base.attackRange,
      patrolRadius: base.patrolRadius,
      chaseTimeout: base.chaseTimeout,
      stunResistance: base.stunResistance,
      fireResistance: 0,
      waterResistance: 25, // Sea creatures resist water
      earthResistance: 0
    };
  }
  
  private generateRewards(): EnemyRewards {
    const baseXP = 25;
    const baseGold = 5;
    
    return {
      experience: Math.round(baseXP * (1 + this.level * 0.5)),
      gold: Math.round(baseGold * (1 + this.level * 0.3)),
      lootTable: [
        { itemType: 'health_potion', dropChance: 0.3, quantity: { min: 1, max: 1 } },
        { itemType: 'equipment', dropChance: 0.15, quantity: { min: 1, max: 1 }, rarity: 'Common' },
        { itemType: 'materials', dropChance: 0.5, quantity: { min: 1, max: 3 } }
      ]
    };
  }
  
  private initializeAI(): AIState {
    return {
      currentBehavior: 'patrol',
      target: null,
      lastTargetPosition: null,
      alertTime: 0,
      patrolPoints: this.generatePatrolPoints(),
      currentPatrolIndex: 0,
      lastAttackTime: 0,
      stunUntil: 0,
      homePosition: { x: this.x, y: this.y },
      adaptationLevel: 0
    };
  }
  
  private generatePatrolPoints(): { x: number; y: number }[] {
    const points = [];
    const numPoints = 3 + Math.floor(Math.random() * 3); // 3-5 points
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i) / numPoints;
      const distance = 50 + Math.random() * this.stats.patrolRadius;
      
      points.push({
        x: this.aiState?.homePosition?.x || this.x + Math.cos(angle) * distance,
        y: this.aiState?.homePosition?.y || this.y + Math.sin(angle) * distance
      });
    }
    
    return points;
  }
  
  private configureAppearance(): void {
    // Set size and tint based on enemy type
    this.setDisplaySize(64, 64);
    
    const typeTints = {
      melee: 0xff4444,    // Red
      ranged: 0x44ff44,   // Green
      magic: 0x4444ff,    // Blue
      boss: 0xff44ff      // Purple
    };
    
    this.setTint(typeTints[this.enemyType]);
    
    // Boss enemies are larger
    if (this.isBoss || this.enemyType === 'boss') {
      this.setDisplaySize(96, 96);
      this.isBoss = true;
    }
    
    // Higher level enemies have golden tint
    if (this.level >= 10) {
      this.setTint(Phaser.Display.Color.GetColor(255, 215, 0)); // Gold
    }
  }
  
  private createHealthBar(): void {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
    
    // Enemy name/level
    this.nameText = this.scene.add.text(this.x, this.y - 45, `${this.enemyName} (${this.level})`, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
  }
  
  private updateHealthBar(): void {
    if (!this.healthBar) return;
    
    this.healthBar.clear();
    
    const barWidth = 50;
    const barHeight = 6;
    const x = this.x - barWidth / 2;
    const y = this.y - 35;
    
    // Background
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    
    // Health bar
    const healthPercent = this.getHealthPercentage();
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffaa00 : 0xff0000;
    
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    // Border
    this.healthBar.lineStyle(1, 0x666666);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
  }
  
  private updateAI(time: number): void {
    if (this.isDead || this.isStunned) return;
    
    // Check if stun has worn off
    if (this.isStunned && time >= this.aiState.stunUntil) {
      this.isStunned = false;
      this.clearTint();
    }
    
    // Find potential targets (heroes)
    const hero = this.findNearestHero();
    
    // State machine for AI behavior
    switch (this.aiState.currentBehavior) {
      case 'patrol':
        this.behaviorPatrol(hero);
        break;
      case 'aggressive':
        this.behaviorAggressive(hero);
        break;
      case 'defensive':
        this.behaviorDefensive(hero);
        break;
      case 'guard':
        this.behaviorGuard(hero);
        break;
      case 'hunt':
        this.behaviorHunt(hero);
        break;
    }
  }
  
  private findNearestHero(): Hero | null {
    // In a full implementation, this would search for all heroes
    // For now, we'll get the hero from the game scene
    const gameScene = this.scene.scene.get('GameScene') as any;
    return gameScene?.hero || null;
  }
  
  private behaviorPatrol(hero: Hero | null): void {
    // Check for nearby heroes
    if (hero && this.canSeeTarget(hero)) {
      this.setTarget(hero);
      this.aiState.currentBehavior = 'aggressive';
      return;
    }
    
    // Move towards next patrol point
    const targetPoint = this.aiState.patrolPoints[this.aiState.currentPatrolIndex];
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetPoint.x, targetPoint.y);
    
    if (distance < 20) {
      // Reached patrol point, move to next
      this.aiState.currentPatrolIndex = (this.aiState.currentPatrolIndex + 1) % this.aiState.patrolPoints.length;
    } else {
      // Move towards patrol point
      this.moveTowards(targetPoint.x, targetPoint.y, this.stats.speed * 0.5);
    }
  }
  
  private behaviorAggressive(hero: Hero | null): void {
    if (!hero || !this.aiState.target) {
      this.aiState.currentBehavior = 'patrol';
      return;
    }
    
    const distance = this.getDistanceToTarget(hero);
    
    // Check if target is out of range or chase timeout
    if (distance > this.stats.aggroRange * 1.5 || 
        Date.now() - this.aiState.alertTime > this.stats.chaseTimeout) {
      this.setTarget(null);
      this.aiState.currentBehavior = 'patrol';
      return;
    }
    
    // Attack if in range
    if (distance <= this.stats.attackRange) {
      this.attackTarget(hero);
    } else {
      // Chase the target
      this.moveTowards(hero.x, hero.y, this.stats.speed);
    }
  }
  
  private behaviorDefensive(hero: Hero | null): void {
    // Defensive enemies only attack when attacked or very close
    if (hero && (this.getDistanceToTarget(hero) < this.stats.attackRange * 0.5 || 
                 Date.now() - this.lastDamageTime < 3000)) {
      this.setTarget(hero);
      this.aiState.currentBehavior = 'aggressive';
    } else {
      // Return to home position
      const homeDistance = Phaser.Math.Distance.Between(this.x, this.y, 
        this.aiState.homePosition.x, this.aiState.homePosition.y);
      
      if (homeDistance > 50) {
        this.moveTowards(this.aiState.homePosition.x, this.aiState.homePosition.y, this.stats.speed * 0.7);
      }
    }
  }
  
  private behaviorGuard(hero: Hero | null): void {
    // Guard behavior - similar to defensive but with a larger alert radius
    if (hero && this.canSeeTarget(hero)) {
      this.setTarget(hero);
      this.aiState.currentBehavior = 'aggressive';
    }
  }
  
  private behaviorHunt(hero: Hero | null): void {
    // Hunt behavior - actively seeks out heroes
    if (hero) {
      this.setTarget(hero);
      this.aiState.currentBehavior = 'aggressive';
    } else {
      // Search for heroes by moving around
      this.behaviorPatrol(hero);
    }
  }
  
  private moveTowards(targetX: number, targetY: number, speed: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    body.setVelocity(velocityX, velocityY);
  }
  
  private performAttack(target: Phaser.GameObjects.GameObject): void {
    // Create attack effect based on enemy type
    switch (this.enemyType) {
      case 'melee':
        this.performMeleeAttack(target);
        break;
      case 'ranged':
        this.performRangedAttack(target);
        break;
      case 'magic':
        this.performMagicAttack(target);
        break;
      case 'boss':
        this.performBossAttack(target);
        break;
    }
    
    console.log(`⚔️ ${this.enemyName} attacks!`);
  }
  
  private performMeleeAttack(target: Phaser.GameObjects.GameObject): void {
    // Direct melee damage
    if (target instanceof Hero) {
      target.takeDamage(this.stats.attack, 'physical');
    }
    
    // Visual effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }
  
  private performRangedAttack(target: Phaser.GameObjects.GameObject): void {
    // Create projectile
    // IMPLEMENTED: Integrate with CombatSystem for projectiles
    console.log('🏹 Ranged attack projectile');
    
    // Placeholder direct damage
    if (target instanceof Hero) {
      target.takeDamage(this.stats.attack * 0.8, 'physical');
    }
  }
  
  private performMagicAttack(target: Phaser.GameObjects.GameObject): void {
    // Magic spell effect
    // IMPLEMENTED: Integrate with CombatSystem for spell effects
    console.log('✨ Magic spell cast');
    
    // Placeholder magic damage
    if (target instanceof Hero) {
      target.takeDamage(this.stats.attack, 'fire');
    }
  }
  
  private performBossAttack(target: Phaser.GameObjects.GameObject): void {
    // Boss special attack
    console.log('💀 Boss special attack!');
    
    if (target instanceof Hero) {
      target.takeDamage(this.stats.attack * 1.5, 'physical');
    }
  }
  
  private updateStatusEffects(delta: number): void {
    const currentTime = Date.now();
    
    this.statusEffects.forEach((endTime, effect) => {
      if (currentTime >= endTime) {
        this.statusEffects.delete(effect);
        console.log(`🧪 ${effect} effect ended on ${this.enemyName}`);
      }
    });
  }
  
  private updateVisuals(): void {
    // Update health bar position
    this.updateHealthBar();
    
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 45);
    }
  }
  
  private showDamageNumber(damage: number): void {
    // IMPLEMENTED: Create floating damage number
    console.log(`💥 ${this.enemyName} takes ${damage} damage`);
  }
  
  private showHealNumber(heal: number): void {
    // IMPLEMENTED: Create floating heal number
    console.log(`💚 ${this.enemyName} heals ${heal} HP`);
  }
  
  private flashRed(): void {
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (!this.isStunned) {
        this.clearTint();
        this.configureAppearance();
      }
    });
  }
  
  private onDeath(): void {
    if (this.isDead) return;
    
    this.isDead = true;
    console.log(`💀 ${this.enemyName} has been defeated!`);
    
    // Stop movement
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    
    // Visual death effect
    this.setTint(0x888888);
    this.setAlpha(0.7);
    
    // Award rewards
    this.giveRewards();
    
    // Death animation and cleanup
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000,
      onComplete: () => {
        this.destroy();
      }
    });
    
    // Emit death event for other systems
    this.scene.events.emit('enemy-defeated', this);
  }
  
  private giveRewards(): void {
    // IMPLEMENTED: Integrate with progression systems
    console.log(`🏆 Rewards: ${this.rewards.experience} XP, ${this.rewards.gold} gold`);
    
    // Award experience to hero
    const gameScene = this.scene.scene.get('GameScene') as any;
    if (gameScene?.hero) {
      gameScene.hero.gainExperience(this.rewards.experience);
    }
    
    // Process loot drops
    this.rewards.lootTable.forEach(drop => {
      if (Math.random() < drop.dropChance) {
        const quantity = Phaser.Math.Between(drop.quantity.min, drop.quantity.max);
        console.log(`💎 Dropped ${quantity}x ${drop.itemType}`);
        // IMPLEMENTED: Create actual loot items
      }
    });
  }
}
