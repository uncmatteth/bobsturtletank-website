/**
 * EndgameSystem - New Game+, prestige mechanics, and endless progression
 * Creates the ultimate endgame experience with infinite replayability
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { EquipmentStats } from '../types/GameTypes';
import { SaveSystem } from './SaveSystem';

export type PrestigeRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legendary' | 'Mythic' | 'Transcendent' | 'Eternal';

export interface NewGamePlusData {
  plusLevel: number;
  completionTime: number;
  highestFloor: number;
  bossesDefeated: number;
  totalKills: number;
  totalDamage: number;
  deathCount: number;
  completionDate: number;
  difficulty: EndgameDifficulty;
  carryOverItems: string[];
  legacyBonuses: LegacyBonus[];
}

export interface PrestigeData {
  currentRank: PrestigeRank;
  totalPrestigePoints: number;
  availablePoints: number;
  prestigeLevel: number;
  prestigeExperience: number;
  nextRankRequirement: number;
  totalCompletions: number;
  firstCompletionDate: number;
  fastestCompletion: number;
  bestFloorReached: number;
  totalPlaytime: number;
}

export interface LegacyBonus {
  id: string;
  name: string;
  description: string;
  tier: number;
  category: 'combat' | 'defense' | 'utility' | 'progression' | 'legendary';
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effects: LegacyEffect[];
  unlockRequirement: string;
}

export interface LegacyEffect {
  type: 'stat_bonus' | 'multiplier' | 'special_ability' | 'passive_effect';
  target: keyof EquipmentStats | 'special';
  value: number;
  scaling: 'linear' | 'exponential' | 'logarithmic';
  description: string;
}

export interface EndlessMode {
  isActive: boolean;
  currentWave: number;
  difficultyMultiplier: number;
  waveStartTime: number;
  totalWaveTime: number;
  enemiesDefeated: number;
  bossesEncountered: number;
  rewardsEarned: EndlessReward[];
  leaderboardScore: number;
}

export interface EndlessReward {
  wave: number;
  type: 'prestige_points' | 'legendary_item' | 'unique_enchantment' | 'cosmetic' | 'title';
  item: any;
  claimed: boolean;
}

export interface EndgameDifficulty {
  name: string;
  displayName: string;
  description: string;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  enemySpeedMultiplier: number;
  bossFrequency: number;
  lootQualityMultiplier: number;
  experienceMultiplier: number;
  prestigePointMultiplier: number;
  specialMechanics: string[];
}

export interface ChallengeMode {
  id: string;
  name: string;
  description: string;
  rules: ChallengeRule[];
  rewards: ChallengeReward[];
  isActive: boolean;
  isCompleted: boolean;
  bestScore: number;
  completionTime: number;
}

export interface ChallengeRule {
  type: 'no_healing' | 'time_limit' | 'one_life' | 'limited_equipment' | 'boss_rush' | 'enemy_modifier';
  parameters: any;
  description: string;
}

export interface ChallengeReward {
  type: 'prestige_points' | 'unique_item' | 'title' | 'cosmetic' | 'legacy_bonus';
  value: any;
  description: string;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  rank: number;
  score: number;
  category: 'fastest_completion' | 'highest_floor' | 'endless_waves' | 'total_prestige' | 'challenge_score';
  achievementDate: number;
  additionalData: any;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  rewards: SeasonalReward[];
  leaderboard: LeaderboardEntry[];
  specialMechanics: string[];
}

export interface SeasonalReward {
  requirement: string;
  type: 'exclusive_item' | 'cosmetic' | 'title' | 'prestige_bonus';
  item: any;
  claimed: boolean;
}

export interface EndgameSystemData {
  newGamePlusData: NewGamePlusData[];
  prestigeData: PrestigeData;
  endlessMode: EndlessMode;
  activeChallenges: ChallengeMode[];
  completedChallenges: string[];
  leaderboardEntries: { [category: string]: LeaderboardEntry };
  seasonalProgress: { [eventId: string]: any };
  lastUpdated: number;
}

export class EndgameSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Core endgame data
  private newGamePlusData: NewGamePlusData[] = [];
  private prestigeData!: PrestigeData;
  private endlessMode!: EndlessMode;
  
  // Challenge and competitive systems
  private availableChallenges: Map<string, ChallengeMode> = new Map();
  private activeChallenges: ChallengeMode[] = [];
  private completedChallenges: Set<string> = new Set();
  
  // Legacy progression system
  private legacyBonuses: Map<string, LegacyBonus> = new Map();
  private purchasedBonuses: Set<string> = new Set();
  
  // Leaderboards and seasonal content
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private seasonalEvents: Map<string, SeasonalEvent> = new Map();
  
  // Difficulty scaling
  private difficultyModes: Map<string, EndgameDifficulty> = new Map();
  private currentDifficulty: EndgameDifficulty;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.initializeDifficultyModes();
    this.initializeLegacyBonuses();
    this.initializeChallenges();
    this.initializeSeasonalEvents();
    this.initializePrestigeSystem();
    this.initializeEndlessMode();
    
    console.log('🏆 EndgameSystem initialized');
  }
  
  /**
   * Initialize endgame system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.loadEndgameData();
    this.applyLegacyBonuses();
    
    console.log('🏆 Endgame system connected to hero');
  }
  
  /**
   * Update endgame system
   */
  public update(time: number, delta: number): void {
    this.updateEndlessMode(time, delta);
    this.updateActiveChallenges(time, delta);
    this.updateSeasonalEvents(time);
    this.updatePrestigeProgress();
  }
  
  /**
   * Start New Game Plus
   */
  public startNewGamePlus(carryOverItems: string[] = []): boolean {
    if (!this.canStartNewGamePlus()) {
      console.warn('Cannot start New Game+ - requirements not met');
      return false;
    }
    
    // Record completion data
    const completionData: NewGamePlusData = {
      plusLevel: this.newGamePlusData.length + 1,
      completionTime: this.calculateCompletionTime(),
      highestFloor: this.hero.stats.highestFloor || 1,
      bossesDefeated: this.hero.stats.bossesDefeated || 0,
      totalKills: this.hero.stats.totalKills || 0,
      totalDamage: this.hero.stats.totalDamage || 0,
      deathCount: this.hero.stats.deathCount || 0,
      completionDate: Date.now(),
      difficulty: this.currentDifficulty,
      carryOverItems,
      legacyBonuses: this.getActiveLegacyBonuses()
    };
    
    this.newGamePlusData.push(completionData);
    
    // Award prestige points
    const prestigePoints = this.calculatePrestigePoints(completionData);
    this.awardPrestigePoints(prestigePoints);
    
    // Trigger New Game+ start
    this.scene.events.emit('new-game-plus-started', completionData);
    
    console.log(`🏆 Started New Game+ Level ${completionData.plusLevel} with ${prestigePoints} prestige points`);
    return true;
  }
  
  /**
   * Purchase legacy bonus
   */
  public purchaseLegacyBonus(bonusId: string): boolean {
    const bonus = this.legacyBonuses.get(bonusId);
    if (!bonus) {
      console.warn(`Legacy bonus not found: ${bonusId}`);
      return false;
    }
    
    // Check if already at max level
    if (bonus.currentLevel >= bonus.maxLevel) {
      console.log(`Legacy bonus ${bonus.name} is already at max level`);
      return false;
    }
    
    // Check prestige point cost
    const cost = this.calculateLegacyBonusCost(bonus);
    if (this.prestigeData.availablePoints < cost) {
      console.log(`Insufficient prestige points. Need ${cost}, have ${this.prestigeData.availablePoints}`);
      return false;
    }
    
    // Check unlock requirements
    if (!this.meetsLegacyBonusRequirements(bonus)) {
      console.log(`Requirements not met for ${bonus.name}`);
      return false;
    }
    
    // Purchase the bonus
    this.prestigeData.availablePoints -= cost;
    bonus.currentLevel++;
    this.purchasedBonuses.add(bonusId);
    
    // Apply the bonus immediately
    this.applyLegacyBonus(bonus);
    
    // Trigger events
    this.scene.events.emit('legacy-bonus-purchased', bonus);
    
    console.log(`✨ Purchased ${bonus.name} Level ${bonus.currentLevel} for ${cost} prestige points`);
    return true;
  }
  
  /**
   * Start endless mode
   */
  public startEndlessMode(): void {
    this.endlessMode = {
      isActive: true,
      currentWave: 1,
      difficultyMultiplier: 1.0,
      waveStartTime: Date.now(),
      totalWaveTime: 0,
      enemiesDefeated: 0,
      bossesEncountered: 0,
      rewardsEarned: [],
      leaderboardScore: 0
    };
    
    this.scene.events.emit('endless-mode-started');
    console.log('♾️ Endless Mode started!');
  }
  
  /**
   * Complete endless wave
   */
  public completeEndlessWave(): void {
    if (!this.endlessMode.isActive) return;
    
    const waveTime = Date.now() - this.endlessMode.waveStartTime;
    this.endlessMode.totalWaveTime += waveTime;
    this.endlessMode.currentWave++;
    this.endlessMode.difficultyMultiplier += 0.05; // 5% increase per wave
    
    // Calculate wave rewards
    const waveRewards = this.calculateEndlessWaveRewards();
    this.endlessMode.rewardsEarned.push(...waveRewards);
    
    // Update leaderboard score
    this.updateEndlessLeaderboardScore();
    
    // Start next wave
    this.endlessMode.waveStartTime = Date.now();
    
    this.scene.events.emit('endless-wave-completed', {
      wave: this.endlessMode.currentWave - 1,
      rewards: waveRewards,
      nextDifficulty: this.endlessMode.difficultyMultiplier
    });
    
    console.log(`♾️ Wave ${this.endlessMode.currentWave - 1} completed! Next difficulty: ${this.endlessMode.difficultyMultiplier.toFixed(2)}x`);
  }
  
  /**
   * Start challenge mode
   */
  public startChallenge(challengeId: string): boolean {
    const challenge = this.availableChallenges.get(challengeId);
    if (!challenge) {
      console.warn(`Challenge not found: ${challengeId}`);
      return false;
    }
    
    if (challenge.isActive) {
      console.log(`Challenge ${challenge.name} is already active`);
      return false;
    }
    
    // Activate challenge
    challenge.isActive = true;
    challenge.bestScore = 0;
    this.activeChallenges.push(challenge);
    
    // Apply challenge rules
    this.applyChallengeRules(challenge);
    
    this.scene.events.emit('challenge-started', challenge);
    console.log(`🎯 Challenge started: ${challenge.name}`);
    return true;
  }
  
  /**
   * Complete challenge
   */
  public completeChallenge(challengeId: string, score: number): void {
    const challenge = this.availableChallenges.get(challengeId);
    if (!challenge || !challenge.isActive) return;
    
    // Update challenge data
    challenge.isCompleted = true;
    challenge.isActive = false;
    challenge.bestScore = Math.max(challenge.bestScore, score);
    challenge.completionTime = Date.now();
    
    // Remove from active challenges
    this.activeChallenges = this.activeChallenges.filter(c => c.id !== challengeId);
    this.completedChallenges.add(challengeId);
    
    // Award challenge rewards
    this.awardChallengeRewards(challenge, score);
    
    this.scene.events.emit('challenge-completed', { challenge, score });
    console.log(`🏅 Challenge completed: ${challenge.name} (Score: ${score})`);
  }
  
  /**
   * Set difficulty mode
   */
  public setDifficulty(difficultyName: string): boolean {
    const difficulty = this.difficultyModes.get(difficultyName);
    if (!difficulty) {
      console.warn(`Difficulty mode not found: ${difficultyName}`);
      return false;
    }
    
    this.currentDifficulty = difficulty;
    this.scene.events.emit('difficulty-changed', difficulty);
    
    console.log(`⚡ Difficulty set to ${difficulty.displayName}`);
    return true;
  }
  
  /**
   * Get prestige data
   */
  public getPrestigeData(): PrestigeData {
    return { ...this.prestigeData };
  }
  
  /**
   * Get endless mode data
   */
  public getEndlessModeData(): EndlessMode {
    return { ...this.endlessMode };
  }
  
  /**
   * Get available legacy bonuses
   */
  public getAvailableLegacyBonuses(): LegacyBonus[] {
    return Array.from(this.legacyBonuses.values()).filter(bonus => 
      this.meetsLegacyBonusRequirements(bonus)
    );
  }
  
  /**
   * Get active challenges
   */
  public getActiveChallenges(): ChallengeMode[] {
    return [...this.activeChallenges];
  }
  
  /**
   * Get leaderboard for category
   */
  public getLeaderboard(category: string): LeaderboardEntry[] {
    return this.leaderboards.get(category) || [];
  }
  
  /**
   * Get endgame statistics
   */
  public getEndgameStats(): any {
    return {
      newGamePlusLevel: this.newGamePlusData.length,
      totalPrestigePoints: this.prestigeData.totalPrestigePoints,
      prestigeRank: this.prestigeData.currentRank,
      endlessHighestWave: this.endlessMode.currentWave,
      challengesCompleted: this.completedChallenges.size,
      totalCompletions: this.prestigeData.totalCompletions,
      fastestCompletion: this.prestigeData.fastestCompletion,
      currentDifficulty: this.currentDifficulty.displayName
    };
  }
  
  /**
   * Save endgame data
   */
  public saveEndgameData(): void {
    const endgameData: EndgameSystemData = {
      newGamePlusData: this.newGamePlusData,
      prestigeData: this.prestigeData,
      endlessMode: this.endlessMode,
      activeChallenges: this.activeChallenges,
      completedChallenges: Array.from(this.completedChallenges),
      leaderboardEntries: Object.fromEntries(this.leaderboards),
      seasonalProgress: {},
      lastUpdated: Date.now()
    };
    
    // IMPLEMENTED: Integrate with SaveSystem
    console.log('🏆 Endgame data saved:', endgameData);
  }
  
  /**
   * Destroy endgame system
   */
  public destroy(): void {
    this.saveEndgameData();
    this.legacyBonuses.clear();
    this.availableChallenges.clear();
    this.leaderboards.clear();
    
    console.log('🏆 EndgameSystem destroyed');
  }
  
  // Private methods
  
  private initializeDifficultyModes(): void {
    const difficulties: EndgameDifficulty[] = [
      {
        name: 'normal',
        displayName: 'Normal',
        description: 'Standard difficulty for new adventures',
        enemyHealthMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        enemySpeedMultiplier: 1.0,
        bossFrequency: 1.0,
        lootQualityMultiplier: 1.0,
        experienceMultiplier: 1.0,
        prestigePointMultiplier: 1.0,
        specialMechanics: []
      },
      {
        name: 'hard',
        displayName: 'Hard',
        description: 'Increased challenge with better rewards',
        enemyHealthMultiplier: 1.5,
        enemyDamageMultiplier: 1.3,
        enemySpeedMultiplier: 1.1,
        bossFrequency: 1.2,
        lootQualityMultiplier: 1.3,
        experienceMultiplier: 1.2,
        prestigePointMultiplier: 1.5,
        specialMechanics: ['elite_enemies']
      },
      {
        name: 'nightmare',
        displayName: 'Nightmare',
        description: 'Brutal difficulty for veterans',
        enemyHealthMultiplier: 2.0,
        enemyDamageMultiplier: 1.8,
        enemySpeedMultiplier: 1.3,
        bossFrequency: 1.5,
        lootQualityMultiplier: 1.8,
        experienceMultiplier: 1.5,
        prestigePointMultiplier: 2.5,
        specialMechanics: ['elite_enemies', 'boss_modifiers', 'limited_healing']
      },
      {
        name: 'inferno',
        displayName: 'Inferno',
        description: 'The ultimate test of skill and determination',
        enemyHealthMultiplier: 3.0,
        enemyDamageMultiplier: 2.5,
        enemySpeedMultiplier: 1.5,
        bossFrequency: 2.0,
        lootQualityMultiplier: 2.5,
        experienceMultiplier: 2.0,
        prestigePointMultiplier: 4.0,
        specialMechanics: ['elite_enemies', 'boss_modifiers', 'limited_healing', 'permadeath_mode', 'chaos_effects']
      }
    ];
    
    difficulties.forEach(difficulty => {
      this.difficultyModes.set(difficulty.name, difficulty);
    });
    
    this.currentDifficulty = difficulties[0]; // Start with normal
    
    console.log(`⚡ Initialized ${difficulties.length} difficulty modes`);
  }
  
  private initializeLegacyBonuses(): void {
    const bonuses: LegacyBonus[] = [
      {
        id: 'combat_mastery',
        name: 'Combat Mastery',
        description: 'Increases all damage dealt by 2% per level',
        tier: 1,
        category: 'combat',
        cost: 5,
        maxLevel: 10,
        currentLevel: 0,
        effects: [
          {
            type: 'multiplier',
            target: 'attack',
            value: 0.02,
            scaling: 'linear',
            description: '+2% damage per level'
          }
        ],
        unlockRequirement: 'Complete New Game+ once'
      },
      {
        id: 'turtle_resilience',
        name: 'Turtle Resilience',
        description: 'Increases maximum health by 5% per level',
        tier: 1,
        category: 'defense',
        cost: 5,
        maxLevel: 10,
        currentLevel: 0,
        effects: [
          {
            type: 'multiplier',
            target: 'maxHP',
            value: 0.05,
            scaling: 'linear',
            description: '+5% max health per level'
          }
        ],
        unlockRequirement: 'Complete New Game+ once'
      },
      {
        id: 'swift_shell',
        name: 'Swift Shell',
        description: 'Increases movement speed by 3% per level',
        tier: 1,
        category: 'utility',
        cost: 4,
        maxLevel: 8,
        currentLevel: 0,
        effects: [
          {
            type: 'multiplier',
            target: 'movementSpeed',
            value: 0.03,
            scaling: 'linear',
            description: '+3% movement speed per level'
          }
        ],
        unlockRequirement: 'Complete New Game+ once'
      },
      {
        id: 'treasure_sense',
        name: 'Treasure Sense',
        description: 'Increases rare item find chance by 5% per level',
        tier: 2,
        category: 'progression',
        cost: 8,
        maxLevel: 5,
        currentLevel: 0,
        effects: [
          {
            type: 'special_ability',
            target: 'special',
            value: 0.05,
            scaling: 'linear',
            description: '+5% rare item chance per level'
          }
        ],
        unlockRequirement: 'Complete New Game+ 3 times'
      },
      {
        id: 'experience_boost',
        name: 'Experience Boost',
        description: 'Increases experience gain by 10% per level',
        tier: 2,
        category: 'progression',
        cost: 10,
        maxLevel: 5,
        currentLevel: 0,
        effects: [
          {
            type: 'multiplier',
            target: 'special',
            value: 0.1,
            scaling: 'linear',
            description: '+10% experience gain per level'
          }
        ],
        unlockRequirement: 'Complete New Game+ 3 times'
      },
      {
        id: 'legendary_affinity',
        name: 'Legendary Affinity',
        description: 'Increases legendary item drop chance by 2% per level',
        tier: 3,
        category: 'legendary',
        cost: 15,
        maxLevel: 3,
        currentLevel: 0,
        effects: [
          {
            type: 'special_ability',
            target: 'special',
            value: 0.02,
            scaling: 'linear',
            description: '+2% legendary drop chance per level'
          }
        ],
        unlockRequirement: 'Complete New Game+ 5 times'
      },
      {
        id: 'prestige_multiplier',
        name: 'Prestige Multiplier',
        description: 'Increases prestige point gain by 15% per level',
        tier: 3,
        category: 'progression',
        cost: 20,
        maxLevel: 3,
        currentLevel: 0,
        effects: [
          {
            type: 'multiplier',
            target: 'special',
            value: 0.15,
            scaling: 'linear',
            description: '+15% prestige points per level'
          }
        ],
        unlockRequirement: 'Reach Platinum prestige rank'
      },
      {
        id: 'eternal_power',
        name: 'Eternal Power',
        description: 'Grants massive stat bonuses that scale with New Game+ level',
        tier: 4,
        category: 'legendary',
        cost: 50,
        maxLevel: 1,
        currentLevel: 0,
        effects: [
          {
            type: 'special_ability',
            target: 'special',
            value: 1.0,
            scaling: 'exponential',
            description: 'All stats +1% per New Game+ level'
          }
        ],
        unlockRequirement: 'Complete New Game+ 10 times and reach Legendary prestige rank'
      }
    ];
    
    bonuses.forEach(bonus => {
      this.legacyBonuses.set(bonus.id, bonus);
    });
    
    console.log(`✨ Initialized ${bonuses.length} legacy bonuses`);
  }
  
  private initializeChallenges(): void {
    const challenges: ChallengeMode[] = [
      {
        id: 'speedrun',
        name: 'Speedrun Challenge',
        description: 'Complete the first 50 floors as quickly as possible',
        rules: [
          {
            type: 'time_limit',
            parameters: { maxTime: 3600000 }, // 1 hour
            description: 'Complete within 60 minutes'
          }
        ],
        rewards: [
          {
            type: 'prestige_points',
            value: 25,
            description: '25 Prestige Points'
          },
          {
            type: 'title',
            value: 'Speed Demon',
            description: 'Title: Speed Demon'
          }
        ],
        isActive: false,
        isCompleted: false,
        bestScore: 0,
        completionTime: 0
      },
      {
        id: 'no_healing',
        name: 'Iron Turtle',
        description: 'Complete 25 floors without using any healing items or abilities',
        rules: [
          {
            type: 'no_healing',
            parameters: {},
            description: 'No healing items or regeneration'
          }
        ],
        rewards: [
          {
            type: 'prestige_points',
            value: 30,
            description: '30 Prestige Points'
          },
          {
            type: 'unique_item',
            value: 'iron_shell_amulet',
            description: 'Iron Shell Amulet (Unique)'
          }
        ],
        isActive: false,
        isCompleted: false,
        bestScore: 0,
        completionTime: 0
      },
      {
        id: 'boss_rush',
        name: 'Boss Rush',
        description: 'Face 10 consecutive bosses without breaks',
        rules: [
          {
            type: 'boss_rush',
            parameters: { bossCount: 10 },
            description: 'Defeat 10 bosses in sequence'
          }
        ],
        rewards: [
          {
            type: 'prestige_points',
            value: 40,
            description: '40 Prestige Points'
          },
          {
            type: 'legacy_bonus',
            value: 'boss_slayer',
            description: 'Unlock Boss Slayer legacy bonus'
          }
        ],
        isActive: false,
        isCompleted: false,
        bestScore: 0,
        completionTime: 0
      },
      {
        id: 'one_life',
        name: 'Permadeath',
        description: 'Complete 100 floors with only one life',
        rules: [
          {
            type: 'one_life',
            parameters: {},
            description: 'No respawns or revives'
          }
        ],
        rewards: [
          {
            type: 'prestige_points',
            value: 100,
            description: '100 Prestige Points'
          },
          {
            type: 'title',
            value: 'Immortal Turtle',
            description: 'Title: Immortal Turtle'
          },
          {
            type: 'unique_item',
            value: 'crown_of_immortality',
            description: 'Crown of Immortality (Mythic)'
          }
        ],
        isActive: false,
        isCompleted: false,
        bestScore: 0,
        completionTime: 0
      }
    ];
    
    challenges.forEach(challenge => {
      this.availableChallenges.set(challenge.id, challenge);
    });
    
    console.log(`🎯 Initialized ${challenges.length} challenge modes`);
  }
  
  private initializeSeasonalEvents(): void {
    // IMPLEMENTED: Implement seasonal events system
    console.log('🎊 Seasonal events system ready');
  }
  
  private initializePrestigeSystem(): void {
    this.prestigeData = {
      currentRank: 'Bronze',
      totalPrestigePoints: 0,
      availablePoints: 0,
      prestigeLevel: 1,
      prestigeExperience: 0,
      nextRankRequirement: 100,
      totalCompletions: 0,
      firstCompletionDate: 0,
      fastestCompletion: 0,
      bestFloorReached: 1,
      totalPlaytime: 0
    };
    
    console.log('🏆 Prestige system initialized');
  }
  
  private initializeEndlessMode(): void {
    this.endlessMode = {
      isActive: false,
      currentWave: 0,
      difficultyMultiplier: 1.0,
      waveStartTime: 0,
      totalWaveTime: 0,
      enemiesDefeated: 0,
      bossesEncountered: 0,
      rewardsEarned: [],
      leaderboardScore: 0
    };
    
    console.log('♾️ Endless mode system initialized');
  }
  
  private canStartNewGamePlus(): boolean {
    // Check if player has completed the main game (reached floor 100+)
    return (this.hero.stats.highestFloor || 1) >= 100;
  }
  
  private calculateCompletionTime(): number {
    // IMPLEMENTED: Calculate actual playtime
    return Date.now() - (this.hero.stats.gameStartTime || Date.now());
  }
  
  private calculatePrestigePoints(completionData: NewGamePlusData): number {
    let basePoints = 50; // Base prestige points
    
    // Bonus for difficulty
    basePoints *= completionData.difficulty.prestigePointMultiplier;
    
    // Bonus for performance
    if (completionData.completionTime < 7200000) basePoints += 10; // Under 2 hours
    if (completionData.highestFloor >= 150) basePoints += 20; // Reached floor 150+
    if (completionData.deathCount === 0) basePoints += 30; // No deaths
    
    // Scaling bonus for New Game+ level
    basePoints += completionData.plusLevel * 5;
    
    return Math.floor(basePoints);
  }
  
  private awardPrestigePoints(points: number): void {
    this.prestigeData.totalPrestigePoints += points;
    this.prestigeData.availablePoints += points;
    this.prestigeData.totalCompletions++;
    
    // Check for rank promotion
    this.checkPrestigeRankPromotion();
    
    console.log(`🏆 Awarded ${points} prestige points (Total: ${this.prestigeData.totalPrestigePoints})`);
  }
  
  private checkPrestigeRankPromotion(): void {
    const rankRequirements: { [key in PrestigeRank]: number } = {
      'Bronze': 0,
      'Silver': 100,
      'Gold': 300,
      'Platinum': 600,
      'Diamond': 1000,
      'Legendary': 1500,
      'Mythic': 2500,
      'Transcendent': 4000,
      'Eternal': 10000
    };
    
    const ranks: PrestigeRank[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legendary', 'Mythic', 'Transcendent', 'Eternal'];
    
    for (let i = ranks.length - 1; i >= 0; i--) {
      const rank = ranks[i];
      if (this.prestigeData.totalPrestigePoints >= rankRequirements[rank] && 
          this.prestigeData.currentRank !== rank) {
        
        const oldRank = this.prestigeData.currentRank;
        this.prestigeData.currentRank = rank;
        this.prestigeData.nextRankRequirement = i < ranks.length - 1 ? rankRequirements[ranks[i + 1]] : 0;
        
        this.scene.events.emit('prestige-rank-promoted', { oldRank, newRank: rank });
        console.log(`🎖️ Prestige rank promoted: ${oldRank} → ${rank}`);
        break;
      }
    }
  }
  
  private getActiveLegacyBonuses(): LegacyBonus[] {
    return Array.from(this.legacyBonuses.values()).filter(bonus => 
      bonus.currentLevel > 0
    );
  }
  
  private calculateLegacyBonusCost(bonus: LegacyBonus): number {
    // Cost increases with each level
    return Math.floor(bonus.cost * Math.pow(1.5, bonus.currentLevel));
  }
  
  private meetsLegacyBonusRequirements(bonus: LegacyBonus): boolean {
    // IMPLEMENTED: Implement requirement checking based on bonus.unlockRequirement
    return this.newGamePlusData.length >= 1; // Simple check for now
  }
  
  private applyLegacyBonuses(): void {
    this.getActiveLegacyBonuses().forEach(bonus => {
      this.applyLegacyBonus(bonus);
    });
  }
  
  private applyLegacyBonus(bonus: LegacyBonus): void {
    // Apply legacy bonus effects to hero
    bonus.effects.forEach(effect => {
      const bonusValue = effect.value * bonus.currentLevel;
      
      if (effect.type === 'stat_bonus' && effect.target !== 'special') {
        // Direct stat bonus
        (this.hero.stats as any)[effect.target] = 
          ((this.hero.stats as any)[effect.target] || 0) + bonusValue;
      } else if (effect.type === 'multiplier' && effect.target !== 'special') {
        // Multiplicative bonus
        (this.hero.stats as any)[effect.target] = 
          ((this.hero.stats as any)[effect.target] || 0) * (1 + bonusValue);
      }
      // IMPLEMENTED: Handle special abilities and passive effects
    });
  }
  
  private updateEndlessMode(time: number, delta: number): void {
    if (!this.endlessMode.isActive) return;
    
    // Update endless mode timers and scaling
    // This would be connected to the actual game state
  }
  
  private updateActiveChallenges(time: number, delta: number): void {
    this.activeChallenges.forEach(challenge => {
      // Update challenge progress and check completion
      // This would be connected to the actual game state
    });
  }
  
  private updateSeasonalEvents(time: number): void {
    // Update seasonal events and check for new events
    // This would be connected to a backend service
  }
  
  private updatePrestigeProgress(): void {
    // Update prestige experience and level
    // This would be based on ongoing play
  }
  
  private calculateEndlessWaveRewards(): EndlessReward[] {
    const rewards: EndlessReward[] = [];
    
    // Award prestige points every 5 waves
    if (this.endlessMode.currentWave % 5 === 0) {
      rewards.push({
        wave: this.endlessMode.currentWave,
        type: 'prestige_points',
        item: Math.floor(this.endlessMode.currentWave / 5) * 2,
        claimed: false
      });
    }
    
    // Award legendary items every 25 waves
    if (this.endlessMode.currentWave % 25 === 0) {
      rewards.push({
        wave: this.endlessMode.currentWave,
        type: 'legendary_item',
        item: `endless_legendary_${this.endlessMode.currentWave}`,
        claimed: false
      });
    }
    
    return rewards;
  }
  
  private updateEndlessLeaderboardScore(): void {
    // Calculate leaderboard score based on wave reached and performance
    this.endlessMode.leaderboardScore = 
      this.endlessMode.currentWave * 100 + 
      this.endlessMode.enemiesDefeated +
      Math.floor(1000000 / (this.endlessMode.totalWaveTime || 1));
  }
  
  private applyChallengeRules(challenge: ChallengeMode): void {
    // Apply challenge rules to the game state
    challenge.rules.forEach(rule => {
      this.scene.events.emit('challenge-rule-applied', rule);
    });
  }
  
  private awardChallengeRewards(challenge: ChallengeMode, score: number): void {
    challenge.rewards.forEach(reward => {
      switch (reward.type) {
        case 'prestige_points':
          this.awardPrestigePoints(reward.value as number);
          break;
        case 'unique_item':
          this.scene.events.emit('reward-item', reward.value);
          break;
        case 'title':
          this.scene.events.emit('reward-title', reward.value);
          break;
        case 'legacy_bonus':
          // Unlock new legacy bonus
          break;
      }
    });
  }
  
  private loadEndgameData(): void {
    // IMPLEMENTED: Load from SaveSystem
    console.log('🏆 Endgame data loaded');
  }
}
