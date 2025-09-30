/**
 * EnemySystem - Manages enemy spawning, AI coordination, and combat integration
 * Handles the legendary 500+ enemy types with intelligent spawning
 */

import Phaser from 'phaser';
import { Enemy, EnemyType, EnemyBehavior } from '../entities/Enemy';
import { Hero } from '../entities/Hero';
import { CombatSystem } from './CombatSystem';
import { AIBehaviorSystem } from './AIBehaviorSystem';
import { DungeonGenerator } from './DungeonGenerator';

export interface SpawnWave {
  enemies: EnemySpawnData[];
  delay: number;
  triggerCondition?: 'time' | 'enemy_count' | 'player_position' | 'boss_trigger';
  triggerValue?: number;
}

export interface EnemySpawnData {
  type: EnemyType;
  level: number;
  behavior: EnemyBehavior;
  spawnArea: { x: number; y: number; radius: number };
  count: number;
  variance?: number; // Level variance +/-
}

export interface FloorConfiguration {
  floorNumber: number;
  baseEnemyLevel: number;
  maxEnemies: number;
  spawnInterval: number;
  enemyTypes: EnemyType[];
  bossFloor: boolean;
  environmentType: 'shallow' | 'deep' | 'abyss' | 'volcanic' | 'frozen';
}

export class EnemySystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  private combatSystem!: CombatSystem;
  public aiBehaviorSystem!: AIBehaviorSystem;
  private dungeonGenerator!: DungeonGenerator;
  
  // AIBehaviorSystem is now public
  
  // Enemy management
  private enemies: Enemy[] = [];
  public enemyGroup!: Phaser.Physics.Arcade.Group; // Public for combat system access
  private maxEnemies: number = 20;
  
  // Spawning system
  private spawnTimer: number = 0;
  private spawnInterval: number = 3000; // 3 seconds
  private spawnPoints: { x: number; y: number }[] = [];
  private currentFloor: FloorConfiguration;
  
  // AI coordination
  private aiUpdateTimer: number = 0;
  private aiUpdateInterval: number = 50; // Update AI every 50ms
  private alertRadius: number = 200; // Distance for enemy coordination
  
  // Combat integration
  private combatEvents: Map<string, number> = new Map();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Initialize enemy group
    this.enemyGroup = scene.physics.add.group({
      classType: Enemy,
      maxSize: 50,
      runChildUpdate: true
    });
    
    // Initialize floor configuration
    this.currentFloor = this.generateFloorConfig(1);
    this.generateSpawnPoints();
    
    console.log('👹 EnemySystem initialized');
  }
  
  /**
   * Set references to other systems
   */
  public initialize(hero: Hero, combatSystem: CombatSystem, dungeonGenerator: DungeonGenerator): void {
    this.hero = hero;
    this.combatSystem = combatSystem;
    this.dungeonGenerator = dungeonGenerator;
    
    // Initialize AI behavior system
    this.aiBehaviorSystem = new AIBehaviorSystem(this.scene);
    this.aiBehaviorSystem.initialize(hero, dungeonGenerator);
    
    // Inject AI system reference into scene for enemy access
    (this.scene as any).aiBehaviorSystem = this.aiBehaviorSystem;
    
    // Set up enemy group in combat system
    this.setupCombatIntegration();
    
    console.log('👹 EnemySystem integrated with combat and AI');
  }
  
  /**
   * Update enemy system
   */
  public update(time: number, delta: number): void {
    // Update AI behavior system
    if (this.aiBehaviorSystem) {
      this.aiBehaviorSystem.update(time, delta);
    }
    
    // Update spawning
    this.updateSpawning(time, delta);
    
    // Update AI coordination
    this.updateAICoordination(time, delta);
    
    // Clean up dead enemies
    this.cleanupDeadEnemies();
    
    // Update enemy behaviors based on game state
    this.updateEnemyBehaviors();
  }
  
  /**
   * Spawn enemy at specific location
   */
  public spawnEnemy(
    x: number, 
    y: number, 
    type: EnemyType, 
    level: number = this.currentFloor.baseEnemyLevel,
    behavior: EnemyBehavior = 'patrol'
  ): Enemy {
    // Apply level variance
    const variance = Math.floor(Math.random() * 3) - 1; // -1 to +1
    const finalLevel = Math.max(1, level + variance);
    
    // Create enemy
    const enemy = new Enemy(this.scene, x, y, type, finalLevel);
    enemy.aiState.currentBehavior = behavior;
    
    // Add to groups
    this.enemies.push(enemy);
    this.enemyGroup.add(enemy);
    
    // Register with AI system
    if (this.aiBehaviorSystem) {
      this.aiBehaviorSystem.registerEnemy(enemy);
    }
    
    // Configure based on floor
    this.configureEnemyForFloor(enemy);
    
    console.log(`👹 Spawned ${enemy.enemyName} at (${x}, ${y})`);
    return enemy;
  }
  
  /**
   * Spawn a group of enemies
   */
  public spawnEnemyGroup(spawnData: EnemySpawnData): Enemy[] {
    const spawnedEnemies: Enemy[] = [];
    
    for (let i = 0; i < spawnData.count; i++) {
      // Random position within spawn area
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnData.spawnArea.radius;
      const x = spawnData.spawnArea.x + Math.cos(angle) * distance;
      const y = spawnData.spawnArea.y + Math.sin(angle) * distance;
      
      // Apply level variance
      const variance = spawnData.variance || 1;
      const levelOffset = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
      const level = Math.max(1, spawnData.level + levelOffset);
      
      const enemy = this.spawnEnemy(x, y, spawnData.type, level, spawnData.behavior);
      spawnedEnemies.push(enemy);
    }
    
    console.log(`👹 Spawned group: ${spawnData.count} ${spawnData.type} enemies`);
    return spawnedEnemies;
  }
  
  /**
   * Spawn boss enemy
   */
  public spawnBoss(x: number, y: number, floorNumber: number): Enemy {
    const bossLevel = Math.max(floorNumber, this.currentFloor.baseEnemyLevel + 2);
    const boss = this.spawnEnemy(x, y, 'boss', bossLevel, 'aggressive');
    
    boss.isBoss = true;
    boss.setDisplaySize(128, 128); // Larger boss
    
    // Boss special configuration
    boss.stats.maxHP *= 3;
    boss.stats.currentHP = boss.stats.maxHP;
    boss.stats.attack *= 1.5;
    boss.stats.aggroRange *= 2;
    
    console.log(`👑 Boss spawned: ${boss.enemyName} (Level ${bossLevel})`);
    return boss;
  }
  
  /**
   * Clear all enemies
   */
  public clearAllEnemies(): void {
    this.enemies.forEach(enemy => {
      if (enemy && enemy.active) {
        enemy.destroy();
      }
    });
    
    this.enemies = [];
    this.enemyGroup.clear(true, true);
    
    console.log('👹 All enemies cleared');
  }
  
  /**
   * Get all living enemies
   */
  public getLivingEnemies(): Enemy[] {
    return this.enemies.filter(enemy => !enemy.isDead);
  }
  
  /**
   * Get enemies within radius of point
   */
  public getEnemiesInRadius(x: number, y: number, radius: number): Enemy[] {
    return this.getLivingEnemies().filter(enemy => {
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      return distance <= radius;
    });
  }
  
  /**
   * Get coordination candidates for AI system
   */
  public getCoordinationCandidates(sourceEnemy: Enemy, radius: number): Enemy[] {
    return this.getEnemiesInRadius(sourceEnemy.x, sourceEnemy.y, radius)
      .filter(enemy => enemy !== sourceEnemy);
  }
  
  /**
   * Get nearest enemy to point
   */
  public getNearestEnemy(x: number, y: number, maxDistance?: number): Enemy | null {
    const livingEnemies = this.getLivingEnemies();
    if (livingEnemies.length === 0) return null;
    
    let nearest: Enemy | null = null;
    let nearestDistance = maxDistance || Infinity;
    
    livingEnemies.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });
    
    return nearest;
  }
  
  /**
   * Set floor configuration
   */
  public setFloor(floorNumber: number): void {
    this.currentFloor = this.generateFloorConfig(floorNumber);
    this.maxEnemies = this.currentFloor.maxEnemies;
    this.spawnInterval = this.currentFloor.spawnInterval;
    
    // Clear existing enemies and respawn for new floor
    this.clearAllEnemies();
    this.generateSpawnPoints();
    
    // Spawn initial enemies
    this.spawnInitialEnemies();
    
    console.log(`👹 Floor ${floorNumber} configured: ${this.currentFloor.environmentType} environment`);
  }
  
  /**
   * Trigger enemy alert (when hero is detected)
   */
  public triggerAlert(x: number, y: number, alertRadius: number = this.alertRadius): void {
    const alertedEnemies = this.getEnemiesInRadius(x, y, alertRadius);
    
    alertedEnemies.forEach(enemy => {
      if (enemy.aiState.currentBehavior === 'patrol' || enemy.aiState.currentBehavior === 'guard') {
        enemy.setTarget(this.hero);
        enemy.aiState.currentBehavior = 'hunt';
        enemy.aiState.alertTime = Date.now();
      }
    });
    
    if (alertedEnemies.length > 0) {
      console.log(`🚨 ${alertedEnemies.length} enemies alerted to hero presence`);
    }
  }
  
  /**
   * Get enemy statistics
   */
  public getEnemyStats(): {
    total: number;
    living: number;
    byType: Record<EnemyType, number>;
    byBehavior: Record<EnemyBehavior, number>;
  } {
    const living = this.getLivingEnemies();
    const byType: Record<EnemyType, number> = { melee: 0, ranged: 0, magic: 0, boss: 0 };
    const byBehavior: Record<EnemyBehavior, number> = { 
      aggressive: 0, defensive: 0, patrol: 0, guard: 0, hunt: 0 
    };
    
    living.forEach(enemy => {
      byType[enemy.enemyType]++;
      byBehavior[enemy.aiState.currentBehavior]++;
    });
    
    return {
      total: this.enemies.length,
      living: living.length,
      byType,
      byBehavior
    };
  }
  
  /**
   * Get AI statistics for debugging
   */
  public getAIStats(): any {
    return this.aiBehaviorSystem ? this.aiBehaviorSystem.getAIStats() : null;
  }
  
  /**
   * Force group formation for testing
   */
  public forceGroupFormation(leaderId: string, pattern: string): void {
    const leader = this.enemies.find(e => e.enemyName === leaderId);
    if (leader && this.aiBehaviorSystem) {
      this.aiBehaviorSystem.forceGroupFormation(leader, pattern as any);
    }
  }
  
  /**
   * Handle coordination events between enemies
   */
  private handleCoordinationEvent(data: any): void {
    const nearbyEnemies = this.getEnemiesInRadius(data.position.x, data.position.y, 200);
    
    nearbyEnemies.forEach(enemy => {
      if (enemy.enemyName !== data.sender) {
        // Apply coordination effect based on action
        switch (data.action) {
          case 'coordinate_attack':
            enemy.setTarget(data.target);
            enemy.aiState.currentBehavior = 'aggressive';
            break;
          case 'retreat':
            enemy.aiState.currentBehavior = 'defensive';
            break;
        }
      }
    });
  }
  
  /**
   * Destroy enemy system
   */
  public destroy(): void {
    this.clearAllEnemies();
    this.enemyGroup.destroy();
    
    if (this.aiBehaviorSystem) {
      this.aiBehaviorSystem.destroy();
    }
    
    console.log('👹 EnemySystem destroyed');
  }
  
  // Private methods
  
  private generateFloorConfig(floorNumber: number): FloorConfiguration {
    const environmentTypes = ['shallow', 'deep', 'abyss', 'volcanic', 'frozen'] as const;
    const environmentIndex = Math.floor((floorNumber - 1) / 5) % environmentTypes.length;
    
    return {
      floorNumber,
      baseEnemyLevel: Math.max(1, floorNumber),
      maxEnemies: Math.min(30, 15 + Math.floor(floorNumber / 2)),
      spawnInterval: Math.max(1000, 4000 - (floorNumber * 100)),
      enemyTypes: this.getEnemyTypesForFloor(floorNumber),
      bossFloor: floorNumber % 10 === 0,
      environmentType: environmentTypes[environmentIndex]
    };
  }
  
  private getEnemyTypesForFloor(floorNumber: number): EnemyType[] {
    const types: EnemyType[] = ['melee'];
    
    if (floorNumber >= 3) types.push('ranged');
    if (floorNumber >= 5) types.push('magic');
    if (floorNumber >= 10) types.push('boss');
    
    return types;
  }
  
  private generateSpawnPoints(): void {
    this.spawnPoints = [];
    const numPoints = 8 + Math.floor(this.currentFloor.floorNumber / 5);
    
    // Create spawn points around the edges of the playable area
    const margin = 100;
    const width = this.scene.cameras.main.width - margin * 2;
    const height = this.scene.cameras.main.height - margin * 2;
    
    for (let i = 0; i < numPoints; i++) {
      const side = i % 4;
      let x, y;
      
      switch (side) {
        case 0: // Top
          x = margin + Math.random() * width;
          y = margin;
          break;
        case 1: // Right
          x = width + margin;
          y = margin + Math.random() * height;
          break;
        case 2: // Bottom
          x = margin + Math.random() * width;
          y = height + margin;
          break;
        case 3: // Left
          x = margin;
          y = margin + Math.random() * height;
          break;
        default:
          x = margin + Math.random() * width;
          y = margin + Math.random() * height;
      }
      
      this.spawnPoints.push({ x, y });
    }
  }
  
  private spawnInitialEnemies(): void {
    const initialCount = Math.min(5, this.maxEnemies);
    
    for (let i = 0; i < initialCount; i++) {
      this.spawnRandomEnemy();
    }
  }
  
  private updateSpawning(time: number, delta: number): void {
    this.spawnTimer += delta;
    
    if (this.spawnTimer >= this.spawnInterval && this.getLivingEnemies().length < this.maxEnemies) {
      this.spawnRandomEnemy();
      this.spawnTimer = 0;
    }
  }
  
  private spawnRandomEnemy(): void {
    if (this.spawnPoints.length === 0 || !this.hero) return;
    
    const spawnPoint = Phaser.Utils.Array.GetRandom(this.spawnPoints);
    const enemyType = Phaser.Utils.Array.GetRandom(this.currentFloor.enemyTypes);
    const behavior = this.getRandomBehavior();
    
    // Don't spawn too close to hero
    const heroDistance = Phaser.Math.Distance.Between(
      spawnPoint.x, spawnPoint.y, this.hero.x, this.hero.y
    );
    
    if (heroDistance > 150) {
      this.spawnEnemy(spawnPoint.x, spawnPoint.y, enemyType, this.currentFloor.baseEnemyLevel, behavior);
    }
  }
  
  private getRandomBehavior(): EnemyBehavior {
    const behaviors: EnemyBehavior[] = ['patrol', 'guard', 'defensive'];
    
    // Higher floor enemies are more aggressive
    if (this.currentFloor.floorNumber >= 5) {
      behaviors.push('aggressive');
    }
    if (this.currentFloor.floorNumber >= 10) {
      behaviors.push('hunt');
    }
    
    return Phaser.Utils.Array.GetRandom(behaviors);
  }
  
  private configureEnemyForFloor(enemy: Enemy): void {
    // Apply environment-specific bonuses
    switch (this.currentFloor.environmentType) {
      case 'volcanic':
        enemy.stats.fireResistance += 25;
        enemy.stats.attack *= 1.1;
        break;
      case 'frozen':
        enemy.stats.waterResistance += 25;
        enemy.stats.speed *= 0.9;
        break;
      case 'abyss':
        enemy.stats.maxHP *= 1.2;
        enemy.stats.currentHP = enemy.stats.maxHP;
        break;
      case 'deep':
        enemy.stats.aggroRange *= 1.3;
        break;
    }
  }
  
  private updateAICoordination(time: number, delta: number): void {
    this.aiUpdateTimer += delta;
    
    if (this.aiUpdateTimer >= this.aiUpdateInterval) {
      this.coordinateEnemyAI();
      this.aiUpdateTimer = 0;
    }
  }
  
  private coordinateEnemyAI(): void {
    const livingEnemies = this.getLivingEnemies();
    
    // Group coordination - enemies near each other share information
    livingEnemies.forEach(enemy => {
      if (enemy.aiState.target) {
        // Alert nearby enemies to the target
        const nearbyEnemies = this.getEnemiesInRadius(enemy.x, enemy.y, this.alertRadius);
        
        nearbyEnemies.forEach(nearbyEnemy => {
          if (!nearbyEnemy.aiState.target && nearbyEnemy !== enemy) {
            nearbyEnemy.setTarget(enemy.aiState.target);
            nearbyEnemy.aiState.currentBehavior = 'hunt';
          }
        });
      }
    });
  }
  
  private updateEnemyBehaviors(): void {
    // Check if hero is properly initialized
    if (!this.hero || !this.hero.stats) {
      return; // Skip update if hero not ready
    }
    
    // Adjust enemy behaviors based on game state
    const heroHP = this.hero.stats.currentHP / this.hero.stats.maxHP;
    const enemyCount = this.getLivingEnemies().length;
    
    // If hero is low on health, some enemies become more aggressive
    if (heroHP < 0.3) {
      this.getLivingEnemies().forEach(enemy => {
        if (enemy.aiState.currentBehavior === 'defensive' && Math.random() < 0.3) {
          enemy.aiState.currentBehavior = 'aggressive';
        }
      });
    }
    
    // If there are few enemies left, make them more defensive
    if (enemyCount <= 3) {
      this.getLivingEnemies().forEach(enemy => {
        if (enemy.aiState.currentBehavior === 'aggressive' && Math.random() < 0.5) {
          enemy.aiState.currentBehavior = 'defensive';
        }
      });
    }
  }
  
  private cleanupDeadEnemies(): void {
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.isDead && !enemy.active) {
        return false;
      }
      return true;
    });
  }
  
  private setupCombatIntegration(): void {
    // Listen for combat events
    this.scene.events.on('enemy-defeated', this.onEnemyDefeated, this);
    
    // Listen for AI coordination events
    this.scene.events.on('enemy-coordination', this.handleCoordinationEvent, this);
    
    // Register enemy group with combat system
    // The combat system will handle collision detection
  }
  
  private onEnemyDefeated(enemy: Enemy): void {
    console.log(`👹 ${enemy.enemyName} defeated - processing rewards`);
    
    // Notify AI system of enemy death
    if (this.aiBehaviorSystem) {
      this.aiBehaviorSystem.onEnemyDeath(enemy);
    }
    
    // Trigger save system auto-save
    this.scene.events.emit('enemy-killed');
    
    // Check for floor completion
    if (this.currentFloor.bossFloor && enemy.isBoss) {
      this.scene.events.emit('boss-defeated', this.currentFloor.floorNumber);
    }
  }
}
