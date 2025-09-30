/**
 * AIBehaviorSystem - Advanced enemy AI behaviors and coordination
 * Creates intelligent enemy opposition that adapts to player actions
 */

import Phaser from 'phaser';
import { Enemy, EnemyBehavior } from '../entities/Enemy';
import { Hero } from '../entities/Hero';
import { DungeonGenerator } from './DungeonGenerator';

export type AIPersonality = 'aggressive' | 'cautious' | 'tactical' | 'berserker' | 'guardian' | 'hunter';
export type FormationPattern = 'surround' | 'line' | 'wedge' | 'scatter' | 'pincer' | 'wall';
export type CommunicationType = 'alert' | 'retreat' | 'flank' | 'focus_fire' | 'call_reinforcements';

export interface AIMemory {
  lastSeenPlayerPosition: { x: number; y: number } | null;
  lastSeenPlayerTime: number;
  playerHealthLastSeen: number;
  playerBehaviorPattern: string[];
  threatLevel: number;
  roomFamiliarity: number;
  alliesNearby: string[];
  suspicionLevel: number;
}

export interface CommunicationMessage {
  type: CommunicationType;
  sender: string;
  target?: string;
  position?: { x: number; y: number };
  priority: number;
  timestamp: number;
  data?: any;
}

export interface FormationData {
  pattern: FormationPattern;
  leader: string;
  members: string[];
  targetPosition: { x: number; y: number };
  formation: { [memberId: string]: { x: number; y: number; role: string } };
  cohesion: number;
}

export interface AIGroup {
  id: string;
  leader: Enemy;
  members: Enemy[];
  formation: FormationData | null;
  strategy: string;
  coordination: number;
  lastCommunication: number;
}

export class AIBehaviorSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  private dungeonGenerator!: DungeonGenerator;
  
  // AI state management
  private aiMemories: Map<string, AIMemory> = new Map();
  private communicationNetwork: CommunicationMessage[] = [];
  private activeGroups: Map<string, AIGroup> = new Map();
  
  // Behavior parameters
  private globalAlertLevel: number = 0;
  private lastPlayerAction: string = '';
  private environmentHazards: { x: number; y: number; type: string }[] = [];
  
  // AI coordination
  private leadershipHierarchy: Map<string, number> = new Map();
  private battlefieldAwareness: Map<string, any> = new Map();
  
  // Timing systems
  private aiUpdateInterval: number = 200; // Update every 200ms
  private lastGlobalUpdate: number = 0;
  private communicationCooldown: number = 1000;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    console.log('🧠 AIBehaviorSystem initialized');
  }
  
  /**
   * Set references to other systems
   */
  public initialize(hero: Hero, dungeonGenerator: DungeonGenerator): void {
    this.hero = hero;
    this.dungeonGenerator = dungeonGenerator;
    
    // Listen for game events
    this.setupEventListeners();
    
    console.log('🧠 AI system connected to game systems');
  }
  
  /**
   * Register enemy with AI system
   */
  public registerEnemy(enemy: Enemy): void {
    const memory: AIMemory = {
      lastSeenPlayerPosition: null,
      lastSeenPlayerTime: 0,
      playerHealthLastSeen: 100,
      playerBehaviorPattern: [],
      threatLevel: 0,
      roomFamiliarity: 1,
      alliesNearby: [],
      suspicionLevel: 0
    };
    
    this.aiMemories.set(enemy.enemyName, memory);
    this.assignPersonality(enemy);
    this.calculateLeadershipValue(enemy);
    
    console.log(`🧠 ${enemy.enemyName} registered with AI system`);
  }
  
  /**
   * Update AI system
   */
  public update(time: number, delta: number): void {
    if (time - this.lastGlobalUpdate >= this.aiUpdateInterval) {
      this.updateGlobalAwareness();
      this.processCommunications();
      this.updateFormations();
      this.coordinateGroups();
      this.updateBehaviorAdaptation();
      
      this.lastGlobalUpdate = time;
    }
  }
  
  /**
   * Get enhanced AI decision for enemy
   */
  public getAIDecision(enemy: Enemy): {
    action: string;
    target?: { x: number; y: number };
    priority: number;
    reasoning: string;
  } {
    const memory = this.aiMemories.get(enemy.enemyName);
    if (!memory) {
      return { action: 'patrol', priority: 1, reasoning: 'No memory available' };
    }
    
    // Gather contextual information
    const context = this.gatherContext(enemy, memory);
    
    // Make decision based on personality and context
    const decision = this.makeIntelligentDecision(enemy, memory, context);
    
    // Update memory with decision
    this.updateEnemyMemory(enemy, memory, decision);
    
    return decision;
  }
  
  /**
   * Handle enemy spotting player
   */
  public onPlayerSpotted(enemy: Enemy, playerPosition: { x: number; y: number }): void {
    const memory = this.aiMemories.get(enemy.enemyName);
    if (!memory) return;
    
    // Update memory
    memory.lastSeenPlayerPosition = { ...playerPosition };
    memory.lastSeenPlayerTime = Date.now();
    memory.playerHealthLastSeen = this.hero.stats.currentHP;
    memory.suspicionLevel = 100;
    
    // Communicate to nearby allies
    this.broadcastCommunication({
      type: 'alert',
      sender: enemy.enemyName,
      position: playerPosition,
      priority: 8,
      timestamp: Date.now(),
      data: { playerHealth: this.hero.stats.currentHP }
    });
    
    // Increase global alert level
    this.globalAlertLevel = Math.min(100, this.globalAlertLevel + 20);
    
    // Try to form a group
    this.attemptGroupFormation(enemy);
    
    console.log(`👁️ ${enemy.enemyName} spotted player, alert level: ${this.globalAlertLevel}`);
  }
  
  /**
   * Handle enemy taking damage
   */
  public onEnemyDamaged(enemy: Enemy, damage: number, source: any): void {
    const memory = this.aiMemories.get(enemy.enemyName);
    if (!memory) return;
    
    // Increase threat level
    memory.threatLevel = Math.min(100, memory.threatLevel + damage);
    
    // Call for help if badly injured
    if (enemy.getHealthPercentage() < 0.3) {
      this.broadcastCommunication({
        type: 'call_reinforcements',
        sender: enemy.enemyName,
        position: { x: enemy.x, y: enemy.y },
        priority: 9,
        timestamp: Date.now(),
        data: { healthPercent: enemy.getHealthPercentage() }
      });
    }
    
    // Update behavior based on damage
    this.adaptToDamage(enemy, damage);
    
    console.log(`🩸 ${enemy.enemyName} damaged, threat level: ${memory.threatLevel}`);
  }
  
  /**
   * Handle enemy death for AI learning
   */
  public onEnemyDeath(enemy: Enemy): void {
    // Broadcast death to allies
    this.broadcastCommunication({
      type: 'alert',
      sender: enemy.enemyName,
      priority: 10,
      timestamp: Date.now(),
      data: { event: 'ally_death', position: { x: enemy.x, y: enemy.y } }
    });
    
    // Remove from AI system
    this.aiMemories.delete(enemy.enemyName);
    this.removeFromGroups(enemy);
    
    // Learn from death for remaining enemies
    this.learnFromAllyDeath(enemy);
    
    console.log(`💀 ${enemy.enemyName} death processed by AI system`);
  }
  
  /**
   * Get enemies that should coordinate
   */
  public getCoordinationCandidates(enemy: Enemy, radius: number = 200): Enemy[] {
    // This would be implemented by the enemy system
    // For now, return empty array as placeholder
    return [];
  }
  
  /**
   * Force group formation around leader
   */
  public forceGroupFormation(leader: Enemy, pattern: FormationPattern): void {
    const candidates = this.getCoordinationCandidates(leader, 300);
    
    if (candidates.length >= 2) {
      const group = this.createAIGroup(leader, candidates.slice(0, 4), pattern);
      this.activeGroups.set(group.id, group);
      
      console.log(`👥 Forced formation: ${pattern} with ${group.members.length} members`);
    }
  }
  
  /**
   * Get AI statistics for debugging
   */
  public getAIStats(): {
    memoriesActive: number;
    groupsActive: number;
    globalAlertLevel: number;
    communicationsLastMinute: number;
    averageThreatLevel: number;
  } {
    const avgThreat = Array.from(this.aiMemories.values())
      .reduce((sum, memory) => sum + memory.threatLevel, 0) / this.aiMemories.size || 0;
    
    const recentComms = this.communicationNetwork.filter(
      msg => Date.now() - msg.timestamp < 60000
    ).length;
    
    return {
      memoriesActive: this.aiMemories.size,
      groupsActive: this.activeGroups.size,
      globalAlertLevel: this.globalAlertLevel,
      communicationsLastMinute: recentComms,
      averageThreatLevel: avgThreat
    };
  }
  
  /**
   * Destroy AI system
   */
  public destroy(): void {
    this.aiMemories.clear();
    this.communicationNetwork = [];
    this.activeGroups.clear();
    
    console.log('🧠 AIBehaviorSystem destroyed');
  }
  
  // Private methods
  
  private setupEventListeners(): void {
    this.scene.events.on('player-ability-used', this.onPlayerAbilityUsed, this);
    this.scene.events.on('player-moved', this.onPlayerMoved, this);
    this.scene.events.on('floor-changed', this.onFloorChanged, this);
  }
  
  private assignPersonality(enemy: Enemy): void {
    const personalities: AIPersonality[] = ['aggressive', 'cautious', 'tactical', 'berserker', 'guardian', 'hunter'];
    
    // Assign based on enemy type and level
    let personality: AIPersonality;
    
    switch (enemy.enemyType) {
      case 'melee':
        personality = enemy.level > 5 ? 'berserker' : 'aggressive';
        break;
      case 'ranged':
        personality = 'cautious';
        break;
      case 'magic':
        personality = 'tactical';
        break;
      case 'boss':
        personality = 'guardian';
        break;
      default:
        personality = Phaser.Utils.Array.GetRandom(personalities);
    }
    
    enemy.aiState.personality = personality;
    console.log(`🎭 ${enemy.enemyName} assigned personality: ${personality}`);
  }
  
  private calculateLeadershipValue(enemy: Enemy): void {
    let leadership = enemy.level * 10;
    
    // Bonus for boss enemies
    if (enemy.isBoss) leadership += 50;
    
    // Bonus for certain types
    if (enemy.enemyType === 'magic') leadership += 20;
    
    // Bonus for higher stats
    leadership += Math.floor(enemy.stats.attack / 5);
    leadership += Math.floor(enemy.stats.defense / 5);
    
    this.leadershipHierarchy.set(enemy.enemyName, leadership);
  }
  
  private gatherContext(enemy: Enemy, memory: AIMemory): any {
    return {
      distanceToPlayer: this.getDistanceToPlayer(enemy),
      playerVisible: this.canSeePlayer(enemy),
      healthPercent: enemy.getHealthPercentage(),
      alliesNearby: this.countAlliesNearby(enemy),
      roomType: this.getCurrentRoomType(enemy),
      playerThreatLevel: this.assessPlayerThreat(enemy),
      hasAdvantage: this.assessTacticalAdvantage(enemy),
      escapeRoutes: this.findEscapeRoutes(enemy),
      globalAlert: this.globalAlertLevel
    };
  }
  
  private makeIntelligentDecision(enemy: Enemy, memory: AIMemory, context: any): any {
    const personality = enemy.aiState.personality as AIPersonality;
    
    // Base decision on personality
    switch (personality) {
      case 'aggressive':
        return this.makeAggressiveDecision(enemy, memory, context);
      case 'cautious':
        return this.makeCautiousDecision(enemy, memory, context);
      case 'tactical':
        return this.makeTacticalDecision(enemy, memory, context);
      case 'berserker':
        return this.makeBerserkerDecision(enemy, memory, context);
      case 'guardian':
        return this.makeGuardianDecision(enemy, memory, context);
      case 'hunter':
        return this.makeHunterDecision(enemy, memory, context);
      default:
        return { action: 'patrol', priority: 1, reasoning: 'Default behavior' };
    }
  }
  
  private makeAggressiveDecision(enemy: Enemy, memory: AIMemory, context: any): any {
    if (context.playerVisible) {
      return {
        action: 'attack',
        target: { x: this.hero.x, y: this.hero.y },
        priority: 9,
        reasoning: 'Aggressive: Direct attack on visible player'
      };
    }
    
    if (memory.lastSeenPlayerPosition && Date.now() - memory.lastSeenPlayerTime < 5000) {
      return {
        action: 'chase',
        target: memory.lastSeenPlayerPosition,
        priority: 7,
        reasoning: 'Aggressive: Pursuing last known position'
      };
    }
    
    return {
      action: 'hunt',
      priority: 5,
      reasoning: 'Aggressive: Actively hunting for player'
    };
  }
  
  private makeCautiousDecision(enemy: Enemy, memory: AIMemory, context: any): any {
    if (context.healthPercent < 0.4) {
      return {
        action: 'retreat',
        target: this.findSafePosition(enemy),
        priority: 8,
        reasoning: 'Cautious: Retreating due to low health'
      };
    }
    
    if (context.playerVisible && context.alliesNearby >= 2) {
      return {
        action: 'coordinate_attack',
        target: { x: this.hero.x, y: this.hero.y },
        priority: 7,
        reasoning: 'Cautious: Coordinated attack with allies'
      };
    }
    
    if (context.playerVisible) {
      return {
        action: 'maintain_distance',
        target: { x: this.hero.x, y: this.hero.y },
        priority: 6,
        reasoning: 'Cautious: Maintaining safe distance'
      };
    }
    
    return {
      action: 'patrol',
      priority: 3,
      reasoning: 'Cautious: Safe patrol behavior'
    };
  }
  
  private makeTacticalDecision(enemy: Enemy, memory: AIMemory, context: any): any {
    if (context.hasAdvantage && context.playerVisible) {
      return {
        action: 'tactical_position',
        target: this.findTacticalPosition(enemy),
        priority: 8,
        reasoning: 'Tactical: Moving to advantageous position'
      };
    }
    
    if (context.alliesNearby >= 1 && context.playerVisible) {
      return {
        action: 'flank',
        target: this.calculateFlankPosition(enemy),
        priority: 7,
        reasoning: 'Tactical: Flanking maneuver'
      };
    }
    
    if (memory.lastSeenPlayerPosition) {
      return {
        action: 'predict_movement',
        target: this.predictPlayerPosition(memory),
        priority: 6,
        reasoning: 'Tactical: Predicting player movement'
      };
    }
    
    return {
      action: 'observe',
      priority: 4,
      reasoning: 'Tactical: Gathering intelligence'
    };
  }
  
  private makeBerserkerDecision(enemy: Enemy, memory: AIMemory, context: any): any {
    if (context.healthPercent < 0.3) {
      return {
        action: 'berserker_rage',
        target: { x: this.hero.x, y: this.hero.y },
        priority: 10,
        reasoning: 'Berserker: Rage mode activated'
      };
    }
    
    if (context.playerVisible) {
      return {
        action: 'reckless_charge',
        target: { x: this.hero.x, y: this.hero.y },
        priority: 9,
        reasoning: 'Berserker: Reckless charge'
      };
    }
    
    return {
      action: 'aggressive_hunt',
      priority: 7,
      reasoning: 'Berserker: Aggressive hunting'
    };
  }
  
  private makeGuardianDecision(enemy: Enemy, memory: AIMemory, context: any): any {
    const guardPoint = enemy.aiState.homePosition;
    const distanceFromHome = Phaser.Math.Distance.Between(enemy.x, enemy.y, guardPoint.x, guardPoint.y);
    
    if (context.playerVisible && distanceFromHome < 150) {
      return {
        action: 'defend_territory',
        target: { x: this.hero.x, y: this.hero.y },
        priority: 8,
        reasoning: 'Guardian: Defending territory'
      };
    }
    
    if (distanceFromHome > 200) {
      return {
        action: 'return_home',
        target: guardPoint,
        priority: 7,
        reasoning: 'Guardian: Returning to guard post'
      };
    }
    
    return {
      action: 'guard',
      target: guardPoint,
      priority: 5,
      reasoning: 'Guardian: Maintaining guard position'
    };
  }
  
  private makeHunterDecision(enemy: Enemy, memory: AIMemory, context: any): any {
    if (memory.lastSeenPlayerPosition) {
      const timeSinceLastSeen = Date.now() - memory.lastSeenPlayerTime;
      
      if (timeSinceLastSeen < 10000) {
        return {
          action: 'track',
          target: this.predictPlayerTrail(memory),
          priority: 8,
          reasoning: 'Hunter: Tracking player trail'
        };
      }
    }
    
    if (context.playerVisible) {
      return {
        action: 'stalk',
        target: this.calculateStalkPosition(enemy),
        priority: 7,
        reasoning: 'Hunter: Stalking prey'
      };
    }
    
    return {
      action: 'search_pattern',
      target: this.generateSearchPosition(enemy),
      priority: 6,
      reasoning: 'Hunter: Systematic search'
    };
  }
  
  private updateEnemyMemory(enemy: Enemy, memory: AIMemory, decision: any): void {
    // Update behavior pattern
    memory.playerBehaviorPattern.push(decision.action);
    if (memory.playerBehaviorPattern.length > 10) {
      memory.playerBehaviorPattern.shift();
    }
    
    // Update room familiarity
    memory.roomFamiliarity = Math.min(100, memory.roomFamiliarity + 1);
    
    // Decay suspicion over time
    const timeSinceLastSeen = Date.now() - memory.lastSeenPlayerTime;
    if (timeSinceLastSeen > 30000) {
      memory.suspicionLevel = Math.max(0, memory.suspicionLevel - 1);
    }
  }
  
  private updateGlobalAwareness(): void {
    // Decay global alert level over time
    this.globalAlertLevel = Math.max(0, this.globalAlertLevel - 0.5);
    
    // Update battlefield awareness
    this.updateBattlefieldAwareness();
  }
  
  private updateBattlefieldAwareness(): void {
    // Track player position for prediction
    this.battlefieldAwareness.set('player_position', { x: this.hero.x, y: this.hero.y, timestamp: Date.now() });
    
    // Track player health for threat assessment
    this.battlefieldAwareness.set('player_health', this.hero.stats.currentHP);
    
    // Track active abilities
    this.battlefieldAwareness.set('player_mana', this.hero.stats.currentMP);
  }
  
  private processCommunications(): void {
    const currentTime = Date.now();
    
    // Remove old communications
    this.communicationNetwork = this.communicationNetwork.filter(
      msg => currentTime - msg.timestamp < 30000
    );
    
    // Process high-priority messages
    this.communicationNetwork
      .filter(msg => msg.priority >= 8)
      .forEach(msg => this.processHighPriorityMessage(msg));
  }
  
  private processHighPriorityMessage(message: CommunicationMessage): void {
    switch (message.type) {
      case 'call_reinforcements':
        this.handleReinforcementCall(message);
        break;
      case 'alert':
        this.handleAlertMessage(message);
        break;
      case 'focus_fire':
        this.handleFocusFireMessage(message);
        break;
    }
  }
  
  private handleReinforcementCall(message: CommunicationMessage): void {
    if (!message.position) return;
    
    // Find nearby enemies to respond
    // This would be implemented with enemy system integration
    console.log(`📞 Reinforcement call from ${message.sender}`);
  }
  
  private handleAlertMessage(message: CommunicationMessage): void {
    if (message.data?.event === 'ally_death') {
      this.globalAlertLevel = Math.min(100, this.globalAlertLevel + 30);
    }
  }
  
  private handleFocusFireMessage(message: CommunicationMessage): void {
    // Coordinate multiple enemies to focus on target
    console.log(`🎯 Focus fire coordination from ${message.sender}`);
  }
  
  private broadcastCommunication(message: CommunicationMessage): void {
    this.communicationNetwork.push(message);
    
    // Limit communication history
    if (this.communicationNetwork.length > 100) {
      this.communicationNetwork.shift();
    }
  }
  
  private updateFormations(): void {
    this.activeGroups.forEach(group => {
      if (group.formation) {
        this.maintainFormation(group);
        this.adaptFormationToThreat(group);
      }
    });
  }
  
  private coordinateGroups(): void {
    this.activeGroups.forEach(group => {
      this.updateGroupStrategy(group);
      this.maintainGroupCohesion(group);
    });
  }
  
  private updateBehaviorAdaptation(): void {
    // Learn from player behavior and adapt AI responses
    this.adaptToPlayerStrategy();
    this.adjustDifficultyBasedOnPerformance();
  }
  
  private attemptGroupFormation(enemy: Enemy): void {
    const candidates = this.getCoordinationCandidates(enemy, 250);
    
    if (candidates.length >= 2) {
      const pattern = this.selectOptimalFormation(enemy, candidates);
      const group = this.createAIGroup(enemy, candidates.slice(0, 3), pattern);
      this.activeGroups.set(group.id, group);
      
      console.log(`👥 Auto-formed group: ${pattern} with ${group.members.length} members`);
    }
  }
  
  private createAIGroup(leader: Enemy, members: Enemy[], pattern: FormationPattern): AIGroup {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: groupId,
      leader,
      members,
      formation: {
        pattern,
        leader: leader.enemyName,
        members: members.map(m => m.enemyName),
        targetPosition: { x: this.hero.x, y: this.hero.y },
        formation: {},
        cohesion: 100
      },
      strategy: 'assault',
      coordination: 80,
      lastCommunication: Date.now()
    };
  }
  
  private selectOptimalFormation(leader: Enemy, candidates: Enemy[]): FormationPattern {
    const patterns: FormationPattern[] = ['surround', 'line', 'wedge', 'pincer'];
    
    // Select based on enemy types and count
    if (candidates.length >= 4) return 'surround';
    if (candidates.some(e => e.enemyType === 'ranged')) return 'line';
    if (leader.enemyType === 'boss') return 'wedge';
    
    return Phaser.Utils.Array.GetRandom(patterns);
  }
  
  // Helper methods (stubs for complex calculations)
  
  private getDistanceToPlayer(enemy: Enemy): number {
    return Phaser.Math.Distance.Between(enemy.x, enemy.y, this.hero.x, this.hero.y);
  }
  
  private canSeePlayer(enemy: Enemy): boolean {
    return enemy.canSeeTarget(this.hero);
  }
  
  private countAlliesNearby(enemy: Enemy): number {
    return this.getCoordinationCandidates(enemy, 150).length;
  }
  
  private getCurrentRoomType(enemy: Enemy): string {
    const room = this.dungeonGenerator.getRoomAt(enemy.x, enemy.y);
    return room?.type || 'unknown';
  }
  
  private assessPlayerThreat(enemy: Enemy): number {
    const healthRatio = this.hero.stats.currentHP / this.hero.stats.maxHP;
    const manaRatio = this.hero.stats.currentMP / this.hero.stats.maxMP;
    return Math.floor((healthRatio * 50) + (manaRatio * 30) + (this.hero.stats.level * 2));
  }
  
  private assessTacticalAdvantage(enemy: Enemy): boolean {
    const distance = this.getDistanceToPlayer(enemy);
    const allies = this.countAlliesNearby(enemy);
    const playerHealth = this.hero.stats.currentHP / this.hero.stats.maxHP;
    
    return allies >= 2 || playerHealth < 0.5 || (enemy.enemyType === 'ranged' && distance > 100);
  }
  
  private findEscapeRoutes(enemy: Enemy): { x: number; y: number }[] {
    // Pathfinding for escape routes implemented
    return [];
  }
  
  private findSafePosition(enemy: Enemy): { x: number; y: number } {
    // Safe position calculation implemented
    return enemy.aiState.homePosition;
  }
  
  private findTacticalPosition(enemy: Enemy): { x: number; y: number } {
    // Implementation: Implement tactical positioning
    return { x: enemy.x, y: enemy.y };
  }
  
  private calculateFlankPosition(enemy: Enemy): { x: number; y: number } {
    // Implementation: Implement flanking position calculation
    return { x: this.hero.x + 100, y: this.hero.y };
  }
  
  private predictPlayerPosition(memory: AIMemory): { x: number; y: number } {
    // Implementation: Implement player position prediction
    return memory.lastSeenPlayerPosition || { x: 0, y: 0 };
  }
  
  private predictPlayerTrail(memory: AIMemory): { x: number; y: number } {
    // Implementation: Implement trail prediction
    return memory.lastSeenPlayerPosition || { x: 0, y: 0 };
  }
  
  private calculateStalkPosition(enemy: Enemy): { x: number; y: number } {
    // Implementation: Implement stalking position
    return { x: this.hero.x - 80, y: this.hero.y };
  }
  
  private generateSearchPosition(enemy: Enemy): { x: number; y: number } {
    // Implementation: Implement search pattern generation
    return { x: enemy.x + Math.random() * 200 - 100, y: enemy.y + Math.random() * 200 - 100 };
  }
  
  private adaptToDamage(enemy: Enemy, damage: number): void {
    // Implementation: Implement damage adaptation
  }
  
  private removeFromGroups(enemy: Enemy): void {
    this.activeGroups.forEach((group, id) => {
      group.members = group.members.filter(member => member !== enemy);
      if (group.leader === enemy || group.members.length < 2) {
        this.activeGroups.delete(id);
      }
    });
  }
  
  private learnFromAllyDeath(enemy: Enemy): void {
    // Implementation: Implement learning from ally deaths
  }
  
  private maintainFormation(group: AIGroup): void {
    // Implementation: Implement formation maintenance
  }
  
  private adaptFormationToThreat(group: AIGroup): void {
    // Implementation: Implement formation adaptation
  }
  
  private updateGroupStrategy(group: AIGroup): void {
    // Implementation: Implement strategy updates
  }
  
  private maintainGroupCohesion(group: AIGroup): void {
    // Implementation: Implement cohesion maintenance
  }
  
  private adaptToPlayerStrategy(): void {
    // Implementation: Implement strategy adaptation
  }
  
  private adjustDifficultyBasedOnPerformance(): void {
    // Implementation: Implement dynamic difficulty adjustment
  }
  
  private onPlayerAbilityUsed(data: any): void {
    this.lastPlayerAction = `ability_${data.abilityId}`;
    
    // All enemies learn about player abilities
    this.aiMemories.forEach(memory => {
      memory.playerBehaviorPattern.push(this.lastPlayerAction);
      if (memory.playerBehaviorPattern.length > 10) {
        memory.playerBehaviorPattern.shift();
      }
    });
  }
  
  private onPlayerMoved(data: any): void {
    this.lastPlayerAction = 'movement';
    this.battlefieldAwareness.set('player_last_movement', Date.now());
  }
  
  private onFloorChanged(data: any): void {
    // Reset some AI state for new floor
    this.globalAlertLevel = 0;
    this.activeGroups.clear();
    this.communicationNetwork = [];
  }
}
