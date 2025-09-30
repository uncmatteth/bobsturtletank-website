/**
 * Enemy - Base class for all enemy entities
 * Implements AI behavior and combat mechanics
 */

import { Entity } from './Entity';
import { EventBus } from '../events/EventBus';
import { HealthComponent } from '../components/HealthComponent';
import { StatsComponent } from '../components/StatsComponent';
import { InventoryComponent } from '../components/InventoryComponent';
import { ExperienceComponent } from '../components/ExperienceComponent';
import { Position } from '../types/Position';
import * as ROT from 'rot-js';

export type AIType = 'aggressive' | 'defensive' | 'patrol' | 'guard' | 'flee';

interface EnemyAppearance {
  char: string;
  fg: string;
  bg: string;
}

export class Enemy extends Entity {
  protected aiType: AIType = 'aggressive';
  protected detectionRadius: number = 8;
  protected attackRadius: number = 1;
  protected lastKnownPlayerPosition: Position | null = null;
  protected patrolPath: Position[] = [];
  protected currentPatrolIndex: number = 0;
  protected turnsSincePlayerSeen: number = 0;
  protected maxChaseTime: number = 10;
  
  constructor(
    eventBus: EventBus,
    name: string,
    x: number,
    y: number,
    appearance: EnemyAppearance,
    level: number = 1
  ) {
    super(eventBus, name, x, y, appearance);
    
    // Set render order (enemies render above items but below player)
    this.setRenderOrder(1);
    
    // Add components based on level
    this.addComponent(new HealthComponent(
      20 + (level * 5), // Current health
      20 + (level * 5)  // Max health
    ));
    
    this.addComponent(new StatsComponent({
      strength: 8 + level,
      dexterity: 8 + level,
      constitution: 8 + level,
      intelligence: 6 + Math.floor(level / 2),
      wisdom: 6 + Math.floor(level / 2),
      charisma: 4
    }));
    
    this.addComponent(new InventoryComponent(5));
    this.addComponent(new ExperienceComponent());
    
    // Set experience level
    const expComponent = this.getComponent<ExperienceComponent>('experience');
    if (expComponent) {
      expComponent.setLevel(level);
    }
  }
  
  /**
   * AI behavior - called each turn
   */
  public act(): void {
    // Get player position (this would need to be passed from the game engine)
    const playerPosition = this.findPlayer();
    
    if (playerPosition) {
      const distance = this.getDistanceToPosition(playerPosition);
      
      // Update last known player position if we can see them
      if (distance <= this.detectionRadius && this.canSeePosition(playerPosition)) {
        this.lastKnownPlayerPosition = { ...playerPosition };
        this.turnsSincePlayerSeen = 0;
      } else {
        this.turnsSincePlayerSeen++;
      }
      
      // Perform AI action based on type
      switch (this.aiType) {
        case 'aggressive':
          this.aggressiveAI(playerPosition);
          break;
        case 'defensive':
          this.defensiveAI(playerPosition);
          break;
        case 'patrol':
          this.patrolAI(playerPosition);
          break;
        case 'guard':
          this.guardAI(playerPosition);
          break;
        case 'flee':
          this.fleeAI(playerPosition);
          break;
      }
    } else {
      // No player found, perform idle behavior
      this.idleBehavior();
    }
  }
  
  /**
   * Aggressive AI - always moves toward and attacks player
   */
  private aggressiveAI(playerPosition: Position): void {
    const distance = this.getDistanceToPosition(playerPosition);
    
    // If player is in attack range, attack
    if (distance <= this.attackRadius && this.canSeePosition(playerPosition)) {
      this.attackPlayer();
      return;
    }
    
    // If we know where the player is, move toward them
    const targetPosition = this.lastKnownPlayerPosition || playerPosition;
    if (targetPosition && this.turnsSincePlayerSeen < this.maxChaseTime) {
      this.moveToward(targetPosition);
    } else {
      // Lost the player, wander randomly
      this.wanderRandomly();
    }
  }
  
  /**
   * Defensive AI - only attacks if player gets too close
   */
  private defensiveAI(playerPosition: Position): void {
    const distance = this.getDistanceToPosition(playerPosition);
    
    // Only react if player is very close
    if (distance <= this.detectionRadius / 2) {
      if (distance <= this.attackRadius) {
        this.attackPlayer();
      } else {
        this.moveToward(playerPosition);
      }
    } else {
      this.idleBehavior();
    }
  }
  
  /**
   * Patrol AI - follows a patrol route, attacks if player is seen
   */
  private patrolAI(playerPosition: Position): void {
    const distance = this.getDistanceToPosition(playerPosition);
    
    // If player is close and visible, switch to aggressive mode temporarily
    if (distance <= this.detectionRadius && this.canSeePosition(playerPosition)) {
      this.aggressiveAI(playerPosition);
      return;
    }
    
    // Continue patrol
    if (this.patrolPath.length > 0) {
      const targetPosition = this.patrolPath[this.currentPatrolIndex];
      const distanceToTarget = this.getDistanceToPosition(targetPosition);
      
      if (distanceToTarget <= 1) {
        // Reached patrol point, move to next
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
      } else {
        // Move toward current patrol point
        this.moveToward(targetPosition);
      }
    } else {
      // No patrol path, wander
      this.wanderRandomly();
    }
  }
  
  /**
   * Guard AI - stays in place unless player gets too close
   */
  private guardAI(playerPosition: Position): void {
    const distance = this.getDistanceToPosition(playerPosition);
    
    if (distance <= this.detectionRadius && this.canSeePosition(playerPosition)) {
      if (distance <= this.attackRadius) {
        this.attackPlayer();
      } else if (distance <= this.detectionRadius / 2) {
        // Move toward player but don't chase too far
        this.moveToward(playerPosition);
      }
    }
    // Otherwise, stay in place
  }
  
  /**
   * Flee AI - runs away from player
   */
  private fleeAI(playerPosition: Position): void {
    const distance = this.getDistanceToPosition(playerPosition);
    
    if (distance <= this.detectionRadius) {
      // Move away from player
      this.moveAwayFrom(playerPosition);
    } else {
      this.idleBehavior();
    }
  }
  
  /**
   * Idle behavior when no player is detected
   */
  private idleBehavior(): void {
    // 20% chance to move randomly each turn
    if (Math.random() < 0.2) {
      this.wanderRandomly();
    }
  }
  
  /**
   * Move toward a target position
   */
  private moveToward(target: Position): void {
    const currentPos = this.getPosition();
    
    // Calculate direction
    const dx = target.x - currentPos.x;
    const dy = target.y - currentPos.y;
    
    // Normalize to get movement direction
    let moveX = 0;
    let moveY = 0;
    
    if (dx > 0) moveX = 1;
    else if (dx < 0) moveX = -1;
    
    if (dy > 0) moveY = 1;
    else if (dy < 0) moveY = -1;
    
    // Try to move
    const newX = currentPos.x + moveX;
    const newY = currentPos.y + moveY;
    
    if (this.canMoveTo(newX, newY)) {
      this.setPosition(newX, newY);
    } else {
      // Try alternative moves if direct path is blocked
      if (moveX !== 0 && this.canMoveTo(currentPos.x + moveX, currentPos.y)) {
        this.setPosition(currentPos.x + moveX, currentPos.y);
      } else if (moveY !== 0 && this.canMoveTo(currentPos.x, currentPos.y + moveY)) {
        this.setPosition(currentPos.x, currentPos.y + moveY);
      }
    }
  }
  
  /**
   * Move away from a target position
   */
  private moveAwayFrom(target: Position): void {
    const currentPos = this.getPosition();
    
    // Calculate opposite direction
    const dx = currentPos.x - target.x;
    const dy = currentPos.y - target.y;
    
    // Normalize to get movement direction
    let moveX = 0;
    let moveY = 0;
    
    if (dx > 0) moveX = 1;
    else if (dx < 0) moveX = -1;
    
    if (dy > 0) moveY = 1;
    else if (dy < 0) moveY = -1;
    
    // Try to move
    const newX = currentPos.x + moveX;
    const newY = currentPos.y + moveY;
    
    if (this.canMoveTo(newX, newY)) {
      this.setPosition(newX, newY);
    } else {
      // Try alternative moves
      this.wanderRandomly();
    }
  }
  
  /**
   * Wander randomly
   */
  private wanderRandomly(): void {
    const currentPos = this.getPosition();
    const directions = [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 0 },                    { x: 1, y: 0 },
      { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
    ];
    
    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    // Try each direction
    for (const dir of directions) {
      const newX = currentPos.x + dir.x;
      const newY = currentPos.y + dir.y;
      
      if (this.canMoveTo(newX, newY)) {
        this.setPosition(newX, newY);
        break;
      }
    }
  }
  
  /**
   * Attack the player
   */
  private attackPlayer(): void {
    // This would need to get the actual player entity
    // For now, emit an event
    this.eventBus.emit('enemy_attack_player', {
      enemy: this,
      position: this.getPosition()
    });
  }
  
  /**
   * Check if can move to a position
   */
  private canMoveTo(x: number, y: number): boolean {
    // This would need access to the map and entity manager
    // For now, return true as placeholder
    return true;
  }
  
  /**
   * Check if can see a position
   */
  private canSeePosition(position: Position): boolean {
    // This would need access to the FOV system
    // For now, return true as placeholder
    return true;
  }
  
  /**
   * Find the player entity
   */
  private findPlayer(): Position | null {
    // This would need access to the entity manager
    // For now, return null as placeholder
    return null;
  }
  
  /**
   * Get distance to a position
   */
  private getDistanceToPosition(position: Position): number {
    const currentPos = this.getPosition();
    return Math.sqrt(
      Math.pow(position.x - currentPos.x, 2) + Math.pow(position.y - currentPos.y, 2)
    );
  }
  
  /**
   * Set AI type
   */
  public setAIType(aiType: AIType): void {
    this.aiType = aiType;
  }
  
  /**
   * Get AI type
   */
  public getAIType(): AIType {
    return this.aiType;
  }
  
  /**
   * Set patrol path
   */
  public setPatrolPath(path: Position[]): void {
    this.patrolPath = [...path];
    this.currentPatrolIndex = 0;
  }
  
  /**
   * Set detection radius
   */
  public setDetectionRadius(radius: number): void {
    this.detectionRadius = radius;
  }
  
  /**
   * Check if enemy is hostile
   */
  public isHostile(): boolean {
    return true; // Enemies are always hostile
  }
  
  /**
   * Check if enemy is dead
   */
  public isDead(): boolean {
    const healthComponent = this.getComponent<HealthComponent>('health');
    return healthComponent ? healthComponent.isDead() : false;
  }
  
  /**
   * Deserialize enemy data
   */
  public deserialize(data: any): void {
    super.deserialize(data);
    this.aiType = data.aiType || 'aggressive';
    this.detectionRadius = data.detectionRadius || 8;
    this.attackRadius = data.attackRadius || 1;
    this.lastKnownPlayerPosition = data.lastKnownPlayerPosition || null;
    this.patrolPath = data.patrolPath || [];
    this.currentPatrolIndex = data.currentPatrolIndex || 0;
    this.turnsSincePlayerSeen = data.turnsSincePlayerSeen || 0;
    this.maxChaseTime = data.maxChaseTime || 10;
  }
  
  /**
   * Serialize enemy data
   */
  public serialize(): any {
    const baseData = super.serialize();
    return {
      ...baseData,
      aiType: this.aiType,
      detectionRadius: this.detectionRadius,
      attackRadius: this.attackRadius,
      lastKnownPlayerPosition: this.lastKnownPlayerPosition,
      patrolPath: this.patrolPath,
      currentPatrolIndex: this.currentPatrolIndex,
      turnsSincePlayerSeen: this.turnsSincePlayerSeen,
      maxChaseTime: this.maxChaseTime
    };
  }
}
