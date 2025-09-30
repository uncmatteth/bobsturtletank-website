/**
 * AchievementSystem - 50+ achievements with progression rewards
 * Creates compelling long-term goals and recognition for player accomplishments
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { SaveSystem } from './SaveSystem';

export type AchievementCategory = 'combat' | 'exploration' | 'collection' | 'progression' | 'mastery' | 'survival' | 'legendary' | 'hidden';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface AchievementProgress {
  current: number;
  required: number;
  percentage: number;
}

export interface AchievementReward {
  type: 'experience' | 'skill_points' | 'gold' | 'item' | 'title' | 'unlock' | 'cosmetic';
  amount?: number;
  itemId?: string;
  itemRarity?: string;
  title?: string;
  unlockId?: string;
  cosmeticId?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  rarity: AchievementRarity;
  
  // Progress tracking
  trackingType: 'counter' | 'boolean' | 'maximum' | 'milestone';
  progressKey: string;
  requiredValue: number;
  currentProgress: number;
  
  // Status
  isUnlocked: boolean;
  isCompleted: boolean;
  completedDate?: number;
  isHidden: boolean;
  
  // Requirements
  prerequisites: string[];
  levelRequirement: number;
  floorRequirement: number;
  
  // Rewards
  rewards: AchievementReward[];
  points: number;
  
  // Metadata
  icon: string;
  secretHint?: string;
  series?: string;
  difficulty: number; // 1-10 scale
}

export interface AchievementSeries {
  id: string;
  name: string;
  description: string;
  achievementIds: string[];
  seriesReward: AchievementReward;
  completed: boolean;
}

export interface AchievementStats {
  totalAchievements: number;
  completedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  completionPercentage: number;
  rareAchievements: number;
  recentAchievements: Achievement[];
  categoryProgress: { [category: string]: { completed: number; total: number } };
}

export interface PlayerAchievementData {
  achievements: { [id: string]: Achievement };
  progress: { [key: string]: number };
  completedSeries: string[];
  earnedTitles: string[];
  unlockedCosmetics: string[];
  totalPoints: number;
  lastUpdated: number;
}

export class AchievementSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Achievement data
  private allAchievements: Map<string, Achievement> = new Map();
  private achievementSeries: Map<string, AchievementSeries> = new Map();
  private playerProgress: Map<string, number> = new Map();
  
  // Player achievement state
  private completedAchievements: Set<string> = new Set();
  private earnedTitles: Set<string> = new Set();
  private unlockedCosmetics: Set<string> = new Set();
  private totalAchievementPoints: number = 0;
  
  // Notifications and UI
  private pendingNotifications: Achievement[] = [];
  private recentAchievements: Achievement[] = [];
  
  // Tracking data
  private sessionStats: Map<string, number> = new Map();
  private combatStats: Map<string, number> = new Map();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.initializeAchievements();
    this.initializeAchievementSeries();
    this.setupEventListeners();
    
    console.log('🏆 AchievementSystem initialized');
  }
  
  /**
   * Initialize achievement system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.loadAchievementData();
    this.checkInitialProgress();
    
    console.log('🏆 Achievement system connected to hero');
  }
  
  /**
   * Update achievement system
   */
  public update(time: number, delta: number): void {
    this.updateSessionStats(delta);
    this.checkAchievementProgress();
    this.processNotifications();
  }
  
  /**
   * Track progress for specific achievement key
   */
  public trackProgress(key: string, value: number, isIncrement: boolean = true): void {
    const currentValue = this.playerProgress.get(key) || 0;
    const newValue = isIncrement ? currentValue + value : Math.max(currentValue, value);
    
    this.playerProgress.set(key, newValue);
    this.checkAchievementsForKey(key);
    
    // Update session stats
    this.sessionStats.set(key, newValue);
  }
  
  /**
   * Get achievement by ID
   */
  public getAchievement(id: string): Achievement | null {
    return this.allAchievements.get(id) || null;
  }
  
  /**
   * Get all achievements by category
   */
  public getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.allAchievements.values())
      .filter(achievement => achievement.category === category)
      .sort((a, b) => a.difficulty - b.difficulty);
  }
  
  /**
   * Get completed achievements
   */
  public getCompletedAchievements(): Achievement[] {
    return Array.from(this.allAchievements.values())
      .filter(achievement => achievement.isCompleted)
      .sort((a, b) => (b.completedDate || 0) - (a.completedDate || 0));
  }
  
  /**
   * Get available (visible but not completed) achievements
   */
  public getAvailableAchievements(): Achievement[] {
    return Array.from(this.allAchievements.values())
      .filter(achievement => !achievement.isHidden && !achievement.isCompleted && achievement.isUnlocked)
      .sort((a, b) => this.getAchievementProgress(a).percentage - this.getAchievementProgress(b).percentage);
  }
  
  /**
   * Get achievement progress
   */
  public getAchievementProgress(achievement: Achievement): AchievementProgress {
    const current = Math.min(achievement.currentProgress, achievement.requiredValue);
    const required = achievement.requiredValue;
    const percentage = required > 0 ? Math.round((current / required) * 100) : 0;
    
    return { current, required, percentage };
  }
  
  /**
   * Get achievement statistics
   */
  public getAchievementStats(): AchievementStats {
    const totalAchievements = this.allAchievements.size;
    const completedAchievements = this.completedAchievements.size;
    const totalPoints = Array.from(this.allAchievements.values()).reduce((sum, ach) => sum + ach.points, 0);
    const earnedPoints = this.totalAchievementPoints;
    const completionPercentage = totalAchievements > 0 ? Math.round((completedAchievements / totalAchievements) * 100) : 0;
    
    const rareAchievements = this.getCompletedAchievements()
      .filter(ach => ach.rarity === 'epic' || ach.rarity === 'legendary' || ach.rarity === 'mythic').length;
    
    const categoryProgress: { [category: string]: { completed: number; total: number } } = {};
    const categories = ['combat', 'exploration', 'collection', 'progression', 'mastery', 'survival', 'legendary', 'hidden'];
    
    categories.forEach(category => {
      const categoryAchievements = this.getAchievementsByCategory(category as AchievementCategory);
      const completed = categoryAchievements.filter(ach => ach.isCompleted).length;
      categoryProgress[category] = { completed, total: categoryAchievements.length };
    });
    
    return {
      totalAchievements,
      completedAchievements,
      totalPoints,
      earnedPoints,
      completionPercentage,
      rareAchievements,
      recentAchievements: this.recentAchievements.slice(0, 5),
      categoryProgress
    };
  }
  
  /**
   * Get earned titles
   */
  public getEarnedTitles(): string[] {
    return Array.from(this.earnedTitles);
  }
  
  /**
   * Get unlocked cosmetics
   */
  public getUnlockedCosmetics(): string[] {
    return Array.from(this.unlockedCosmetics);
  }
  
  /**
   * Force complete achievement (for testing)
   */
  public forceCompleteAchievement(achievementId: string): boolean {
    const achievement = this.allAchievements.get(achievementId);
    if (!achievement || achievement.isCompleted) {
      return false;
    }
    
    achievement.currentProgress = achievement.requiredValue;
    return this.completeAchievement(achievement);
  }
  
  /**
   * Load achievement data from storage
   */
  private loadAchievementDataFromStorage(): any {
    try {
      const saved = localStorage.getItem('achievement_data');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load achievement data:', error);
      return null;
    }
  }

  /**
   * Save achievement data
   */
  public saveAchievementData(): void {
    const achievementData: PlayerAchievementData = {
      achievements: Object.fromEntries(this.allAchievements),
      progress: Object.fromEntries(this.playerProgress),
      completedSeries: Array.from(this.achievementSeries.values())
        .filter(series => series.completed)
        .map(series => series.id),
      earnedTitles: Array.from(this.earnedTitles),
      unlockedCosmetics: Array.from(this.unlockedCosmetics),
      totalPoints: this.totalAchievementPoints,
      lastUpdated: Date.now()
    };
    
    // Save to localStorage temporarily
    try {
      localStorage.setItem('achievement_data', JSON.stringify(achievementData));
    } catch (error) {
      console.warn('Failed to save achievement data:', error);
    }
  }
  
  /**
   * Destroy achievement system
   */
  public destroy(): void {
    this.saveAchievementData();
    this.allAchievements.clear();
    this.playerProgress.clear();
    
    console.log('🏆 AchievementSystem destroyed');
  }
  
  // Private methods
  
  private initializeAchievements(): void {
    // Combat achievements
    this.addCombatAchievements();
    
    // Exploration achievements
    this.addExplorationAchievements();
    
    // Collection achievements
    this.addCollectionAchievements();
    
    // Progression achievements
    this.addProgressionAchievements();
    
    // Mastery achievements
    this.addMasteryAchievements();
    
    // Survival achievements
    this.addSurvivalAchievements();
    
    // Legendary achievements
    this.addLegendaryAchievements();
    
    // Hidden achievements
    this.addHiddenAchievements();
    
    console.log(`🏆 Initialized ${this.allAchievements.size} achievements`);
  }
  
  private addCombatAchievements(): void {
    const combatAchievements: Achievement[] = [
      {
        id: 'combat_first_kill',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        category: 'combat',
        tier: 'bronze',
        rarity: 'common',
        trackingType: 'counter',
        progressKey: 'enemies_defeated',
        requiredValue: 1,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 50 },
          { type: 'title', title: 'Slayer' }
        ],
        points: 5,
        icon: 'sword_bronze',
        difficulty: 1
      },
      {
        id: 'combat_destroyer',
        name: 'Destroyer',
        description: 'Defeat 100 enemies',
        category: 'combat',
        tier: 'silver',
        rarity: 'uncommon',
        trackingType: 'counter',
        progressKey: 'enemies_defeated',
        requiredValue: 100,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['combat_first_kill'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 500 },
          { type: 'gold', amount: 200 },
          { type: 'title', title: 'Destroyer' }
        ],
        points: 15,
        icon: 'sword_silver',
        difficulty: 3
      },
      {
        id: 'combat_annihilator',
        name: 'Annihilator',
        description: 'Defeat 1000 enemies',
        category: 'combat',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'counter',
        progressKey: 'enemies_defeated',
        requiredValue: 1000,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['combat_destroyer'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 2000 },
          { type: 'gold', amount: 1000 },
          { type: 'skill_points', amount: 3 },
          { type: 'title', title: 'Annihilator' }
        ],
        points: 50,
        icon: 'sword_gold',
        difficulty: 6
      },
      {
        id: 'combat_boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat your first boss',
        category: 'combat',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'counter',
        progressKey: 'bosses_defeated',
        requiredValue: 1,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 8,
        floorRequirement: 10,
        rewards: [
          { type: 'experience', amount: 1000 },
          { type: 'gold', amount: 500 },
          { type: 'item', itemId: 'boss_trophy', itemRarity: 'Epic' },
          { type: 'title', title: 'Boss Slayer' }
        ],
        points: 25,
        icon: 'crown_gold',
        difficulty: 5
      },
      {
        id: 'combat_critical_master',
        name: 'Critical Master',
        description: 'Land 100 critical hits',
        category: 'combat',
        tier: 'silver',
        rarity: 'uncommon',
        trackingType: 'counter',
        progressKey: 'critical_hits',
        requiredValue: 100,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 5,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 750 },
          { type: 'skill_points', amount: 1 },
          { type: 'title', title: 'Critical Master' }
        ],
        points: 20,
        icon: 'lightning_silver',
        difficulty: 4
      }
    ];
    
    combatAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private addExplorationAchievements(): void {
    const explorationAchievements: Achievement[] = [
      {
        id: 'exploration_first_floor',
        name: 'First Steps',
        description: 'Reach Floor 2',
        category: 'exploration',
        tier: 'bronze',
        rarity: 'common',
        trackingType: 'maximum',
        progressKey: 'max_floor_reached',
        requiredValue: 2,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 100 },
          { type: 'title', title: 'Explorer' }
        ],
        points: 5,
        icon: 'compass_bronze',
        difficulty: 1
      },
      {
        id: 'exploration_deep_diver',
        name: 'Deep Diver',
        description: 'Reach Floor 10',
        category: 'exploration',
        tier: 'silver',
        rarity: 'uncommon',
        trackingType: 'maximum',
        progressKey: 'max_floor_reached',
        requiredValue: 10,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['exploration_first_floor'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 500 },
          { type: 'gold', amount: 300 },
          { type: 'title', title: 'Deep Diver' }
        ],
        points: 15,
        icon: 'compass_silver',
        difficulty: 3
      },
      {
        id: 'exploration_abyss_walker',
        name: 'Abyss Walker',
        description: 'Reach Floor 25',
        category: 'exploration',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'maximum',
        progressKey: 'max_floor_reached',
        requiredValue: 25,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['exploration_deep_diver'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 2000 },
          { type: 'gold', amount: 1000 },
          { type: 'skill_points', amount: 2 },
          { type: 'title', title: 'Abyss Walker' }
        ],
        points: 35,
        icon: 'compass_gold',
        difficulty: 7
      },
      {
        id: 'exploration_void_touched',
        name: 'Void Touched',
        description: 'Reach Floor 50',
        category: 'exploration',
        tier: 'platinum',
        rarity: 'epic',
        trackingType: 'maximum',
        progressKey: 'max_floor_reached',
        requiredValue: 50,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['exploration_abyss_walker'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 5000 },
          { type: 'gold', amount: 3000 },
          { type: 'skill_points', amount: 5 },
          { type: 'item', itemId: 'void_artifact', itemRarity: 'Legendary' },
          { type: 'title', title: 'Void Touched' }
        ],
        points: 75,
        icon: 'void_platinum',
        difficulty: 9
      }
    ];
    
    explorationAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private addCollectionAchievements(): void {
    const collectionAchievements: Achievement[] = [
      {
        id: 'collection_packrat',
        name: 'Pack Rat',
        description: 'Collect 50 items',
        category: 'collection',
        tier: 'bronze',
        rarity: 'common',
        trackingType: 'counter',
        progressKey: 'items_collected',
        requiredValue: 50,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 200 },
          { type: 'gold', amount: 100 },
          { type: 'title', title: 'Pack Rat' }
        ],
        points: 10,
        icon: 'bag_bronze',
        difficulty: 2
      },
      {
        id: 'collection_hoarder',
        name: 'Treasure Hoarder',
        description: 'Collect 500 items',
        category: 'collection',
        tier: 'silver',
        rarity: 'uncommon',
        trackingType: 'counter',
        progressKey: 'items_collected',
        requiredValue: 500,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['collection_packrat'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 1000 },
          { type: 'gold', amount: 500 },
          { type: 'skill_points', amount: 1 },
          { type: 'title', title: 'Treasure Hoarder' }
        ],
        points: 25,
        icon: 'bag_silver',
        difficulty: 5
      },
      {
        id: 'collection_legendary_hunter',
        name: 'Legendary Hunter',
        description: 'Collect 10 legendary items',
        category: 'collection',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'counter',
        progressKey: 'legendary_items_collected',
        requiredValue: 10,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 10,
        floorRequirement: 5,
        rewards: [
          { type: 'experience', amount: 2000 },
          { type: 'gold', amount: 1500 },
          { type: 'skill_points', amount: 3 },
          { type: 'item', itemId: 'collectors_badge', itemRarity: 'Epic' },
          { type: 'title', title: 'Legendary Hunter' }
        ],
        points: 40,
        icon: 'star_gold',
        difficulty: 7
      }
    ];
    
    collectionAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private addProgressionAchievements(): void {
    const progressionAchievements: Achievement[] = [
      {
        id: 'progression_level_10',
        name: 'Veteran Turtle',
        description: 'Reach level 10',
        category: 'progression',
        tier: 'bronze',
        rarity: 'common',
        trackingType: 'maximum',
        progressKey: 'max_level_reached',
        requiredValue: 10,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 500 },
          { type: 'skill_points', amount: 2 },
          { type: 'title', title: 'Veteran Turtle' }
        ],
        points: 15,
        icon: 'level_bronze',
        difficulty: 3
      },
      {
        id: 'progression_level_25',
        name: 'Elite Turtle',
        description: 'Reach level 25',
        category: 'progression',
        tier: 'silver',
        rarity: 'uncommon',
        trackingType: 'maximum',
        progressKey: 'max_level_reached',
        requiredValue: 25,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['progression_level_10'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 1500 },
          { type: 'skill_points', amount: 5 },
          { type: 'gold', amount: 1000 },
          { type: 'title', title: 'Elite Turtle' }
        ],
        points: 30,
        icon: 'level_silver',
        difficulty: 6
      },
      {
        id: 'progression_skill_master',
        name: 'Skill Master',
        description: 'Max out 5 skills',
        category: 'progression',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'counter',
        progressKey: 'maxed_skills',
        requiredValue: 5,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 15,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 3000 },
          { type: 'skill_points', amount: 10 },
          { type: 'title', title: 'Skill Master' }
        ],
        points: 50,
        icon: 'tree_gold',
        difficulty: 8
      }
    ];
    
    progressionAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private addMasteryAchievements(): void {
    const masteryAchievements: Achievement[] = [
      {
        id: 'mastery_shell_defender',
        name: 'Shell Defender Master',
        description: 'Complete 100 battles as Shell Defender without dying',
        category: 'mastery',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'counter',
        progressKey: 'shell_defender_victories',
        requiredValue: 100,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 10,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 2500 },
          { type: 'skill_points', amount: 5 },
          { type: 'cosmetic', cosmeticId: 'shell_defender_crown' },
          { type: 'title', title: 'Shell Master' }
        ],
        points: 75,
        icon: 'shield_mastery',
        difficulty: 8
      },
      {
        id: 'mastery_swift_current',
        name: 'Swift Current Master',
        description: 'Complete 100 battles as Swift Current without dying',
        category: 'mastery',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'counter',
        progressKey: 'swift_current_victories',
        requiredValue: 100,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 10,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 2500 },
          { type: 'skill_points', amount: 5 },
          { type: 'cosmetic', cosmeticId: 'swift_current_wings' },
          { type: 'title', title: 'Speed Master' }
        ],
        points: 75,
        icon: 'speed_mastery',
        difficulty: 8
      },
      {
        id: 'mastery_fire_belly',
        name: 'Fire Belly Master',
        description: 'Complete 100 battles as Fire Belly without dying',
        category: 'mastery',
        tier: 'gold',
        rarity: 'rare',
        trackingType: 'counter',
        progressKey: 'fire_belly_victories',
        requiredValue: 100,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 10,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 2500 },
          { type: 'skill_points', amount: 5 },
          { type: 'cosmetic', cosmeticId: 'fire_belly_aura' },
          { type: 'title', title: 'Fire Master' }
        ],
        points: 75,
        icon: 'fire_mastery',
        difficulty: 8
      }
    ];
    
    masteryAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private addSurvivalAchievements(): void {
    const survivalAchievements: Achievement[] = [
      {
        id: 'survival_iron_turtle',
        name: 'Iron Turtle',
        description: 'Survive 5 floors without dying',
        category: 'survival',
        tier: 'bronze',
        rarity: 'common',
        trackingType: 'counter',
        progressKey: 'floors_survived_streak',
        requiredValue: 5,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: [],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 300 },
          { type: 'gold', amount: 150 },
          { type: 'title', title: 'Iron Turtle' }
        ],
        points: 10,
        icon: 'shield_bronze',
        difficulty: 3
      },
      {
        id: 'survival_steel_turtle',
        name: 'Steel Turtle',
        description: 'Survive 15 floors without dying',
        category: 'survival',
        tier: 'silver',
        rarity: 'uncommon',
        trackingType: 'counter',
        progressKey: 'floors_survived_streak',
        requiredValue: 15,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['survival_iron_turtle'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 1000 },
          { type: 'gold', amount: 500 },
          { type: 'skill_points', amount: 2 },
          { type: 'title', title: 'Steel Turtle' }
        ],
        points: 25,
        icon: 'shield_silver',
        difficulty: 6
      },
      {
        id: 'survival_legendary_turtle',
        name: 'Legendary Turtle',
        description: 'Survive 50 floors without dying',
        category: 'survival',
        tier: 'platinum',
        rarity: 'legendary',
        trackingType: 'counter',
        progressKey: 'floors_survived_streak',
        requiredValue: 50,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['survival_steel_turtle'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 10000 },
          { type: 'gold', amount: 5000 },
          { type: 'skill_points', amount: 10 },
          { type: 'item', itemId: 'legendary_shell', itemRarity: 'Legendary' },
          { type: 'title', title: 'Legendary Turtle' }
        ],
        points: 100,
        icon: 'shell_legendary',
        difficulty: 10
      }
    ];
    
    survivalAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private addLegendaryAchievements(): void {
    const legendaryAchievements: Achievement[] = [
      {
        id: 'legendary_boss_hunter',
        name: 'Legendary Boss Hunter',
        description: 'Defeat all 8 legendary bosses',
        category: 'legendary',
        tier: 'diamond',
        rarity: 'mythic',
        trackingType: 'counter',
        progressKey: 'unique_bosses_defeated',
        requiredValue: 8,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['combat_boss_slayer'],
        levelRequirement: 20,
        floorRequirement: 10,
        rewards: [
          { type: 'experience', amount: 15000 },
          { type: 'gold', amount: 10000 },
          { type: 'skill_points', amount: 20 },
          { type: 'item', itemId: 'crown_of_champions', itemRarity: 'Mythic' },
          { type: 'title', title: 'Champion of the Depths' }
        ],
        points: 200,
        icon: 'crown_diamond',
        difficulty: 10
      },
      {
        id: 'legendary_depth_lord',
        name: 'Depth Lord',
        description: 'Reach Floor 100',
        category: 'legendary',
        tier: 'diamond',
        rarity: 'mythic',
        trackingType: 'maximum',
        progressKey: 'max_floor_reached',
        requiredValue: 100,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: false,
        prerequisites: ['exploration_void_touched'],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 25000 },
          { type: 'gold', amount: 15000 },
          { type: 'skill_points', amount: 25 },
          { type: 'item', itemId: 'depths_mastery_orb', itemRarity: 'Mythic' },
          { type: 'title', title: 'Depth Lord' },
          { type: 'unlock', unlockId: 'new_game_plus' }
        ],
        points: 500,
        icon: 'depths_diamond',
        difficulty: 10
      }
    ];
    
    legendaryAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private addHiddenAchievements(): void {
    const hiddenAchievements: Achievement[] = [
      {
        id: 'hidden_speed_demon',
        name: 'Speed Demon',
        description: 'Complete Floor 10 in under 5 minutes',
        category: 'hidden',
        tier: 'gold',
        rarity: 'epic',
        trackingType: 'boolean',
        progressKey: 'fast_floor_10_completion',
        requiredValue: 1,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: true,
        prerequisites: [],
        levelRequirement: 1,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 2000 },
          { type: 'cosmetic', cosmeticId: 'speed_trails' },
          { type: 'title', title: 'Speed Demon' }
        ],
        points: 50,
        icon: 'lightning_hidden',
        secretHint: 'Swift completion of a milestone floor...',
        difficulty: 7
      },
      {
        id: 'hidden_pacifist',
        name: 'Unexpected Pacifist',
        description: 'Complete a floor without killing any enemies',
        category: 'hidden',
        tier: 'silver',
        rarity: 'rare',
        trackingType: 'boolean',
        progressKey: 'pacifist_floor_completion',
        requiredValue: 1,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: true,
        prerequisites: [],
        levelRequirement: 5,
        floorRequirement: 3,
        rewards: [
          { type: 'experience', amount: 1000 },
          { type: 'title', title: 'Peaceful Turtle' }
        ],
        points: 30,
        icon: 'peace_hidden',
        secretHint: 'Sometimes the path of peace is more challenging...',
        difficulty: 6
      },
      {
        id: 'hidden_collector',
        name: 'Obsessive Collector',
        description: 'Collect every item on a single floor',
        category: 'hidden',
        tier: 'gold',
        rarity: 'epic',
        trackingType: 'boolean',
        progressKey: 'perfect_collection_floor',
        requiredValue: 1,
        currentProgress: 0,
        isUnlocked: true,
        isCompleted: false,
        isHidden: true,
        prerequisites: [],
        levelRequirement: 3,
        floorRequirement: 1,
        rewards: [
          { type: 'experience', amount: 1500 },
          { type: 'gold', amount: 1000 },
          { type: 'item', itemId: 'collectors_artifact', itemRarity: 'Epic' },
          { type: 'title', title: 'Perfectionist' }
        ],
        points: 40,
        icon: 'gem_hidden',
        secretHint: 'Leave no treasure behind...',
        difficulty: 5
      }
    ];
    
    hiddenAchievements.forEach(achievement => {
      this.allAchievements.set(achievement.id, achievement);
    });
  }
  
  private initializeAchievementSeries(): void {
    const series: AchievementSeries[] = [
      {
        id: 'combat_mastery_series',
        name: 'Combat Mastery',
        description: 'Master all aspects of combat',
        achievementIds: ['combat_first_kill', 'combat_destroyer', 'combat_annihilator', 'combat_critical_master'],
        seriesReward: {
          type: 'item',
          itemId: 'combat_mastery_ring',
          itemRarity: 'Legendary'
        },
        completed: false
      },
      {
        id: 'exploration_series',
        name: 'Deep Explorer',
        description: 'Explore the deepest parts of the dungeon',
        achievementIds: ['exploration_first_floor', 'exploration_deep_diver', 'exploration_abyss_walker', 'exploration_void_touched'],
        seriesReward: {
          type: 'cosmetic',
          cosmeticId: 'explorer_badge'
        },
        completed: false
      },
      {
        id: 'class_mastery_series',
        name: 'Class Mastery',
        description: 'Master all three shell classes',
        achievementIds: ['mastery_shell_defender', 'mastery_swift_current', 'mastery_fire_belly'],
        seriesReward: {
          type: 'title',
          title: 'Grandmaster Turtle'
        },
        completed: false
      }
    ];
    
    series.forEach(s => {
      this.achievementSeries.set(s.id, s);
    });
  }
  
  private setupEventListeners(): void {
    // Listen to game events for achievement tracking
    this.scene.events.on('enemy-defeated', this.onEnemyDefeated, this);
    this.scene.events.on('item-collected', this.onItemCollected, this);
    this.scene.events.on('floor-reached', this.onFloorReached, this);
    this.scene.events.on('hero-level-up', this.onHeroLevelUp, this);
    this.scene.events.on('boss-defeated', this.onBossDefeated, this);
    this.scene.events.on('critical-hit', this.onCriticalHit, this);
    this.scene.events.on('skill-maxed', this.onSkillMaxed, this);
    this.scene.events.on('death', this.onPlayerDeath, this);
  }
  
  private loadAchievementData(): void {
    // Load achievement data from localStorage temporarily
    const achievementData = this.loadAchievementDataFromStorage();
    if (achievementData) {
      // Restore progress
      if (achievementData.progress) {
        Object.entries(achievementData.progress).forEach(([key, value]: [string, any]) => {
          this.playerProgress.set(key, value);
        });
      }
      
      // Restore achievement states
      if (achievementData.achievements) {
        Object.entries(achievementData.achievements).forEach(([id, data]: [string, any]) => {
          const achievement = this.allAchievements.get(id);
          if (achievement) {
            achievement.currentProgress = data.currentProgress || 0;
            achievement.isCompleted = data.isCompleted || false;
            achievement.completedDate = data.completedDate;
            
            if (achievement.isCompleted) {
              this.completedAchievements.add(id);
              this.recentAchievements.unshift(achievement);
            }
          }
        });
      }
      
      // Restore other data
      this.totalAchievementPoints = achievementData.totalPoints || 0;
      achievementData.earnedTitles?.forEach((title: string) => {
        this.earnedTitles.add(title);
      });
      achievementData.unlockedCosmetics?.forEach((cosmetic: string) => {
        this.unlockedCosmetics.add(cosmetic);
      });
    }
  }
  
  private checkInitialProgress(): void {
    // Set initial progress based on hero state
    this.trackProgress('max_level_reached', this.hero.stats.level, false);
    // Add other initial checks as needed
  }
  
  private updateSessionStats(delta: number): void {
    // Track session-based statistics
    const playTime = this.sessionStats.get('play_time') || 0;
    this.sessionStats.set('play_time', playTime + delta);
  }
  
  private checkAchievementProgress(): void {
    // Update current progress for all achievements
    this.allAchievements.forEach(achievement => {
      if (!achievement.isCompleted && achievement.isUnlocked) {
        const currentValue = this.playerProgress.get(achievement.progressKey) || 0;
        achievement.currentProgress = currentValue;
        
        if (achievement.currentProgress >= achievement.requiredValue) {
          this.completeAchievement(achievement);
        }
      }
    });
  }
  
  private checkAchievementsForKey(key: string): void {
    const relevantAchievements = Array.from(this.allAchievements.values())
      .filter(ach => ach.progressKey === key && !ach.isCompleted && ach.isUnlocked);
    
    relevantAchievements.forEach(achievement => {
      achievement.currentProgress = this.playerProgress.get(key) || 0;
      
      if (achievement.currentProgress >= achievement.requiredValue) {
        this.completeAchievement(achievement);
      }
    });
  }
  
  private completeAchievement(achievement: Achievement): boolean {
    if (achievement.isCompleted) return false;
    
    achievement.isCompleted = true;
    achievement.completedDate = Date.now();
    this.completedAchievements.add(achievement.id);
    
    // Award rewards
    this.awardAchievementRewards(achievement);
    
    // Add to total points
    this.totalAchievementPoints += achievement.points;
    
    // Add to recent achievements
    this.recentAchievements.unshift(achievement);
    if (this.recentAchievements.length > 10) {
      this.recentAchievements.pop();
    }
    
    // Add to notification queue
    this.pendingNotifications.push(achievement);
    
    // Check for series completion
    this.checkSeriesCompletion(achievement);
    
    // Unlock prerequisite achievements
    this.unlockPrerequisiteAchievements(achievement);
    
    // Trigger achievement completed event
    this.scene.events.emit('achievement-completed', achievement);
    
    console.log(`🏆 Achievement completed: ${achievement.name}`);
    return true;
  }
  
  private awardAchievementRewards(achievement: Achievement): void {
    achievement.rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          if (reward.amount) {
            this.hero.gainExperience(reward.amount);
          }
          break;
        case 'skill_points':
          if (reward.amount) {
            // IMPLEMENTED: Award skill points
            console.log(`+${reward.amount} Skill Points`);
          }
          break;
        case 'gold':
          if (reward.amount) {
            // IMPLEMENTED: Award gold
            console.log(`+${reward.amount} Gold`);
          }
          break;
        case 'title':
          if (reward.title) {
            this.earnedTitles.add(reward.title);
            console.log(`Title earned: ${reward.title}`);
          }
          break;
        case 'cosmetic':
          if (reward.cosmeticId) {
            this.unlockedCosmetics.add(reward.cosmeticId);
            console.log(`Cosmetic unlocked: ${reward.cosmeticId}`);
          }
          break;
        case 'item':
          // IMPLEMENTED: Award item
          console.log(`Item awarded: ${reward.itemId} (${reward.itemRarity})`);
          break;
        case 'unlock':
          // IMPLEMENTED: Unlock feature
          console.log(`Feature unlocked: ${reward.unlockId}`);
          break;
      }
    });
  }
  
  private checkSeriesCompletion(completedAchievement: Achievement): void {
    this.achievementSeries.forEach(series => {
      if (series.completed) return;
      
      if (series.achievementIds.includes(completedAchievement.id)) {
        const allCompleted = series.achievementIds.every(id => this.completedAchievements.has(id));
        
        if (allCompleted) {
          series.completed = true;
          this.awardSeriesReward(series);
          console.log(`🏆 Achievement series completed: ${series.name}`);
        }
      }
    });
  }
  
  private awardSeriesReward(series: AchievementSeries): void {
    // Award series completion reward
    const reward = series.seriesReward;
    switch (reward.type) {
      case 'title':
        if (reward.title) {
          this.earnedTitles.add(reward.title);
        }
        break;
      case 'item':
        // IMPLEMENTED: Award item
        console.log(`Series reward: ${reward.itemId}`);
        break;
      case 'cosmetic':
        if (reward.cosmeticId) {
          this.unlockedCosmetics.add(reward.cosmeticId);
        }
        break;
    }
  }
  
  private unlockPrerequisiteAchievements(completedAchievement: Achievement): void {
    // Find achievements that have this as a prerequisite
    this.allAchievements.forEach(achievement => {
      if (achievement.prerequisites.includes(completedAchievement.id) && !achievement.isUnlocked) {
        const allPrereqsMet = achievement.prerequisites.every(prereqId => 
          this.completedAchievements.has(prereqId));
        
        if (allPrereqsMet) {
          achievement.isUnlocked = true;
          console.log(`🔓 Achievement unlocked: ${achievement.name}`);
        }
      }
    });
  }
  
  private processNotifications(): void {
    if (this.pendingNotifications.length > 0) {
      // IMPLEMENTED: Display achievement notifications in UI
      this.pendingNotifications.splice(0, 3); // Limit notifications
    }
  }
  
  // Event handlers
  
  private onEnemyDefeated(enemy: any): void {
    this.trackProgress('enemies_defeated', 1);
    
    if (enemy.isBoss) {
      this.trackProgress('bosses_defeated', 1);
      this.trackProgress('unique_bosses_defeated', 1);
    }
    
    // Track class-specific victories
    const heroClass = this.hero.shellClass;
    if (heroClass === 'Shell Defender') {
      this.trackProgress('shell_defender_victories', 1);
    } else if (heroClass === 'Swift Current') {
      this.trackProgress('swift_current_victories', 1);
    } else if (heroClass === 'Fire Belly') {
      this.trackProgress('fire_belly_victories', 1);
    }
  }
  
  private onItemCollected(item: any): void {
    this.trackProgress('items_collected', 1);
    
    if (item.rarity === 'Legendary') {
      this.trackProgress('legendary_items_collected', 1);
    }
  }
  
  private onFloorReached(floorNumber: number): void {
    this.trackProgress('max_floor_reached', floorNumber, false);
    this.trackProgress('floors_survived_streak', 1);
  }
  
  private onHeroLevelUp(level: number): void {
    this.trackProgress('max_level_reached', level, false);
  }
  
  private onBossDefeated(floorNumber: number): void {
    // Handled in onEnemyDefeated
  }
  
  private onCriticalHit(data: any): void {
    this.trackProgress('critical_hits', 1);
  }
  
  private onSkillMaxed(skill: any): void {
    this.trackProgress('maxed_skills', 1);
  }
  
  private onPlayerDeath(): void {
    // Reset survival streak
    this.trackProgress('floors_survived_streak', 0, false);
  }
}
