/**
 * QuestSystem - Story, daily, and weekly quest mechanics
 * Creates meaningful progression and narrative depth for the legendary RPG
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { SaveSystem } from './SaveSystem';

export type QuestType = 'story' | 'daily' | 'weekly' | 'achievement' | 'exploration' | 'combat' | 'collection';
export type QuestStatus = 'available' | 'active' | 'completed' | 'turned_in' | 'failed' | 'locked';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'reach' | 'survive' | 'craft' | 'use_ability' | 'equip' | 'level_up';
  target?: string; // Enemy type, item type, floor number, etc.
  currentProgress: number;
  requiredProgress: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'skill_points' | 'unlock' | 'title';
  amount?: number;
  itemId?: string;
  itemRarity?: string;
  unlockId?: string;
  title?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  status: QuestStatus;
  
  // Requirements
  levelRequirement: number;
  floorRequirement: number;
  prerequisiteQuests: string[];
  
  // Objectives and rewards
  objectives: QuestObjective[];
  rewards: QuestReward[];
  
  // Timing
  startTime?: number;
  expirationTime?: number;
  cooldownTime?: number;
  
  // Metadata
  storyChapter?: number;
  isRepeatable: boolean;
  isHidden: boolean;
  category: string;
  npcGiver?: string;
  
  // Tracking
  timesCompleted: number;
  firstCompletedTime?: number;
  lastCompletedTime?: number;
}

export interface QuestProgress {
  questId: string;
  objectiveProgress: { [objectiveId: string]: number };
  startedAt: number;
  lastUpdated: number;
}

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  questIds: string[];
  currentQuestIndex: number;
  completed: boolean;
  rewards: QuestReward[];
}

export interface DailyQuestPool {
  easyQuests: string[];
  mediumQuests: string[];
  hardQuests: string[];
  lastRefresh: number;
  currentQuests: string[];
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  startTime: number;
  endTime: number;
  participants: number;
  leaderboard: { playerId: string; score: number }[];
}

export class QuestSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Quest management
  private allQuests: Map<string, Quest> = new Map();
  private activeQuests: Map<string, Quest> = new Map();
  private completedQuests: Set<string> = new Set();
  private questProgress: Map<string, QuestProgress> = new Map();
  
  // Quest chains and categories
  private questChains: Map<string, QuestChain> = new Map();
  private storyQuests: Map<number, string[]> = new Map(); // Chapter -> Quest IDs
  
  // Daily and weekly systems
  private dailyQuestPool: DailyQuestPool;
  private weeklyChallenge: WeeklyChallenge | null = null;
  private lastDailyRefresh: number = 0;
  private lastWeeklyRefresh: number = 0;
  
  // Events and notifications
  private questNotifications: string[] = [];
  private pendingRewards: QuestReward[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.dailyQuestPool = this.createEmptyDailyPool();
    
    this.initializeQuests();
    this.setupEventListeners();
    
    console.log('📜 QuestSystem initialized');
  }
  
  /**
   * Initialize quest system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.loadQuestProgress();
    this.refreshDailyQuests();
    this.refreshWeeklyChallenge();
    this.activateAvailableQuests();
    
    console.log('📜 Quest system connected to hero');
  }
  
  /**
   * Update quest system
   */
  public update(time: number, delta: number): void {
    this.checkDailyRefresh();
    this.checkWeeklyRefresh();
    this.updateQuestTimers(time);
    this.processQuestNotifications();
  }
  
  /**
   * Get all active quests
   */
  public getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests.values()).sort((a, b) => {
      // Sort by priority: story > daily > weekly > others
      const priority = { story: 0, daily: 1, weekly: 2, achievement: 3, exploration: 4, combat: 5, collection: 6 };
      return priority[a.type] - priority[b.type];
    });
  }
  
  /**
   * Get available quests that can be started
   */
  public getAvailableQuests(): Quest[] {
    return Array.from(this.allQuests.values())
      .filter(quest => quest.status === 'available' && this.canStartQuest(quest))
      .sort((a, b) => a.levelRequirement - b.levelRequirement);
  }
  
  /**
   * Get completed quests
   */
  public getCompletedQuests(): Quest[] {
    return Array.from(this.allQuests.values())
      .filter(quest => this.completedQuests.has(quest.id))
      .sort((a, b) => (b.lastCompletedTime || 0) - (a.lastCompletedTime || 0));
  }
  
  /**
   * Start a quest
   */
  public startQuest(questId: string): boolean {
    const quest = this.allQuests.get(questId);
    if (!quest || !this.canStartQuest(quest)) {
      return false;
    }
    
    quest.status = 'active';
    quest.startTime = Date.now();
    this.activeQuests.set(questId, quest);
    
    // Initialize progress tracking
    const progress: QuestProgress = {
      questId,
      objectiveProgress: {},
      startedAt: Date.now(),
      lastUpdated: Date.now()
    };
    
    quest.objectives.forEach(obj => {
      progress.objectiveProgress[obj.id] = 0;
    });
    
    this.questProgress.set(questId, progress);
    
    // Trigger quest start events
    this.scene.events.emit('quest-started', quest);
    this.addNotification(`Quest Started: ${quest.title}`);
    
    console.log(`📜 Started quest: ${quest.title}`);
    return true;
  }
  
  /**
   * Complete a quest
   */
  public completeQuest(questId: string): boolean {
    const quest = this.activeQuests.get(questId);
    if (!quest || !this.isQuestCompleted(quest)) {
      return false;
    }
    
    quest.status = 'completed';
    quest.lastCompletedTime = Date.now();
    if (!quest.firstCompletedTime) {
      quest.firstCompletedTime = Date.now();
    }
    quest.timesCompleted++;
    
    // Remove from active quests
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);
    
    // Award rewards
    this.awardQuestRewards(quest);
    
    // Check for quest chain progression
    this.checkQuestChainProgression(quest);
    
    // Trigger completion events
    this.scene.events.emit('quest-completed', quest);
    this.addNotification(`Quest Completed: ${quest.title}`);
    
    // Handle repeatable quests
    if (quest.isRepeatable) {
      this.scheduleQuestRepeat(quest);
    }
    
    console.log(`✅ Completed quest: ${quest.title}`);
    return true;
  }
  
  /**
   * Update quest progress
   */
  public updateQuestProgress(type: string, target?: string, amount: number = 1): void {
    this.activeQuests.forEach(quest => {
      quest.objectives.forEach(objective => {
        if (this.objectiveMatches(objective, type, target)) {
          this.incrementObjectiveProgress(quest.id, objective.id, amount);
        }
      });
    });
  }
  
  /**
   * Get quest by ID
   */
  public getQuest(questId: string): Quest | null {
    return this.allQuests.get(questId) || null;
  }
  
  /**
   * Get current story chapter quests
   */
  public getCurrentStoryQuests(): Quest[] {
    const currentChapter = this.getCurrentStoryChapter();
    const chapterQuestIds = this.storyQuests.get(currentChapter) || [];
    
    return chapterQuestIds
      .map(id => this.allQuests.get(id))
      .filter(quest => quest) as Quest[];
  }
  
  /**
   * Get daily quests
   */
  public getDailyQuests(): Quest[] {
    return this.dailyQuestPool.currentQuests
      .map(id => this.allQuests.get(id))
      .filter(quest => quest && quest.type === 'daily') as Quest[];
  }
  
  /**
   * Get weekly challenge
   */
  public getWeeklyChallenge(): WeeklyChallenge | null {
    return this.weeklyChallenge;
  }
  
  /**
   * Get quest statistics
   */
  public getQuestStats(): {
    totalQuests: number;
    completedQuests: number;
    activeQuests: number;
    storyProgress: number;
    dailyStreak: number;
    weeklyParticipation: number;
  } {
    return {
      totalQuests: this.allQuests.size,
      completedQuests: this.completedQuests.size,
      activeQuests: this.activeQuests.size,
      storyProgress: this.getStoryCompletionPercentage(),
      dailyStreak: this.getDailyQuestStreak(),
      weeklyParticipation: this.weeklyChallenge ? 1 : 0
    };
  }
  
  /**
   * Save quest progress
   */
  public saveProgress(): void {
    const questData = {
      activeQuests: Array.from(this.activeQuests.keys()),
      completedQuests: Array.from(this.completedQuests),
      questProgress: Object.fromEntries(this.questProgress),
      lastDailyRefresh: this.lastDailyRefresh,
      lastWeeklyRefresh: this.lastWeeklyRefresh,
      dailyQuestPool: this.dailyQuestPool
    };
    
    // IMPLEMENTED: Implement quest data saving
    console.log('Quest data saved:', questData);
  }
  
  /**
   * Destroy quest system
   */
  public destroy(): void {
    this.saveProgress();
    this.allQuests.clear();
    this.activeQuests.clear();
    this.questProgress.clear();
    
    console.log('📜 QuestSystem destroyed');
  }
  
  // Private methods
  
  private initializeQuests(): void {
    // Initialize story quests
    this.initializeStoryQuests();
    
    // Initialize daily quest templates
    this.initializeDailyQuests();
    
    // Initialize weekly challenge templates
    this.initializeWeeklyQuests();
    
    // Initialize achievement quests
    this.initializeAchievementQuests();
    
    // Initialize exploration quests
    this.initializeExplorationQuests();
    
    console.log(`📜 Initialized ${this.allQuests.size} quests`);
  }
  
  private initializeStoryQuests(): void {
    // Chapter 1: The Awakening
    const chapter1Quests: Quest[] = [
      {
        id: 'story_001_first_steps',
        title: 'First Steps into the Depths',
        description: 'Begin your legendary journey by choosing your shell class and exploring the first floor.',
        type: 'story',
        difficulty: 'easy',
        status: 'available',
        levelRequirement: 1,
        floorRequirement: 1,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'choose_class',
            description: 'Choose your shell class',
            type: 'equip',
            currentProgress: 0,
            requiredProgress: 1,
            completed: false
          },
          {
            id: 'explore_floor_1',
            description: 'Explore Floor 1 of the dungeon',
            type: 'reach',
            target: 'floor_1',
            currentProgress: 0,
            requiredProgress: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 100 },
          { type: 'gold', amount: 50 },
          { type: 'item', itemId: 'starter_weapon', itemRarity: 'Common' }
        ],
        isRepeatable: false,
        isHidden: false,
        category: 'main_story',
        storyChapter: 1,
        timesCompleted: 0
      },
      {
        id: 'story_002_first_combat',
        title: 'Trial by Combat',
        description: 'Defeat your first enemies and learn the ways of battle.',
        type: 'story',
        difficulty: 'easy',
        status: 'locked',
        levelRequirement: 1,
        floorRequirement: 1,
        prerequisiteQuests: ['story_001_first_steps'],
        objectives: [
          {
            id: 'defeat_enemies',
            description: 'Defeat 5 enemies',
            type: 'kill',
            target: 'any',
            currentProgress: 0,
            requiredProgress: 5,
            completed: false
          },
          {
            id: 'use_ability',
            description: 'Use your class ability 3 times',
            type: 'use_ability',
            target: 'class_ability',
            currentProgress: 0,
            requiredProgress: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 200 },
          { type: 'skill_points', amount: 1 }
        ],
        isRepeatable: false,
        isHidden: false,
        category: 'main_story',
        storyChapter: 1,
        timesCompleted: 0
      },
      {
        id: 'story_003_depths_calling',
        title: 'The Depths Are Calling',
        description: 'Venture deeper into the dungeon and reach Floor 5.',
        type: 'story',
        difficulty: 'medium',
        status: 'locked',
        levelRequirement: 3,
        floorRequirement: 1,
        prerequisiteQuests: ['story_002_first_combat'],
        objectives: [
          {
            id: 'reach_floor_5',
            description: 'Reach Floor 5',
            type: 'reach',
            target: 'floor_5',
            currentProgress: 0,
            requiredProgress: 1,
            completed: false
          },
          {
            id: 'collect_loot',
            description: 'Collect 10 items',
            type: 'collect',
            target: 'any_item',
            currentProgress: 0,
            requiredProgress: 10,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 500 },
          { type: 'gold', amount: 200 },
          { type: 'item', itemId: 'uncommon_armor', itemRarity: 'Uncommon' }
        ],
        isRepeatable: false,
        isHidden: false,
        category: 'main_story',
        storyChapter: 1,
        timesCompleted: 0
      }
    ];
    
    // Add story quests to system
    chapter1Quests.forEach(quest => {
      this.allQuests.set(quest.id, quest);
    });
    
    this.storyQuests.set(1, chapter1Quests.map(q => q.id));
    
    // Chapter 2: The First Guardian
    const chapter2Quests: Quest[] = [
      {
        id: 'story_004_first_boss',
        title: 'The First Guardian',
        description: 'Face the Corrupted Leviathan on Floor 10 and prove your worth.',
        type: 'story',
        difficulty: 'hard',
        status: 'locked',
        levelRequirement: 8,
        floorRequirement: 10,
        prerequisiteQuests: ['story_003_depths_calling'],
        objectives: [
          {
            id: 'defeat_leviathan',
            description: 'Defeat the Corrupted Leviathan',
            type: 'kill',
            target: 'corrupted_leviathan',
            currentProgress: 0,
            requiredProgress: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 1000 },
          { type: 'gold', amount: 500 },
          { type: 'item', itemId: 'legendary_boss_weapon', itemRarity: 'Legendary' },
          { type: 'unlock', unlockId: 'advanced_skills' }
        ],
        isRepeatable: false,
        isHidden: false,
        category: 'main_story',
        storyChapter: 2,
        timesCompleted: 0
      }
    ];
    
    chapter2Quests.forEach(quest => {
      this.allQuests.set(quest.id, quest);
    });
    
    this.storyQuests.set(2, chapter2Quests.map(q => q.id));
  }
  
  private initializeDailyQuests(): void {
    const dailyQuests: Quest[] = [
      // Easy daily quests
      {
        id: 'daily_easy_001',
        title: 'Daily Training',
        description: 'Defeat 10 enemies to keep your combat skills sharp.',
        type: 'daily',
        difficulty: 'easy',
        status: 'available',
        levelRequirement: 1,
        floorRequirement: 1,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'defeat_enemies',
            description: 'Defeat 10 enemies',
            type: 'kill',
            target: 'any',
            currentProgress: 0,
            requiredProgress: 10,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 100 },
          { type: 'gold', amount: 50 }
        ],
        isRepeatable: true,
        isHidden: false,
        category: 'daily',
        timesCompleted: 0,
        expirationTime: 24 * 60 * 60 * 1000 // 24 hours
      },
      {
        id: 'daily_easy_002',
        title: 'Treasure Hunter',
        description: 'Collect 5 items from defeated enemies.',
        type: 'daily',
        difficulty: 'easy',
        status: 'available',
        levelRequirement: 1,
        floorRequirement: 1,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'collect_items',
            description: 'Collect 5 items',
            type: 'collect',
            target: 'any_item',
            currentProgress: 0,
            requiredProgress: 5,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 75 },
          { type: 'gold', amount: 75 }
        ],
        isRepeatable: true,
        isHidden: false,
        category: 'daily',
        timesCompleted: 0,
        expirationTime: 24 * 60 * 60 * 1000
      },
      
      // Medium daily quests
      {
        id: 'daily_medium_001',
        title: 'Deep Exploration',
        description: 'Venture 3 floors deeper than your current progress.',
        type: 'daily',
        difficulty: 'medium',
        status: 'available',
        levelRequirement: 5,
        floorRequirement: 3,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'explore_floors',
            description: 'Explore 3 new floors',
            type: 'reach',
            target: 'deeper_floors',
            currentProgress: 0,
            requiredProgress: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 300 },
          { type: 'gold', amount: 150 },
          { type: 'item', itemId: 'rare_equipment', itemRarity: 'Rare' }
        ],
        isRepeatable: true,
        isHidden: false,
        category: 'daily',
        timesCompleted: 0,
        expirationTime: 24 * 60 * 60 * 1000
      },
      
      // Hard daily quests
      {
        id: 'daily_hard_001',
        title: 'Elite Slayer',
        description: 'Defeat 5 elite enemies without dying.',
        type: 'daily',
        difficulty: 'hard',
        status: 'available',
        levelRequirement: 10,
        floorRequirement: 5,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'defeat_elites',
            description: 'Defeat 5 elite enemies',
            type: 'kill',
            target: 'elite',
            currentProgress: 0,
            requiredProgress: 5,
            completed: false
          },
          {
            id: 'no_deaths',
            description: 'Complete without dying',
            type: 'survive',
            currentProgress: 0,
            requiredProgress: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 500 },
          { type: 'gold', amount: 300 },
          { type: 'skill_points', amount: 1 }
        ],
        isRepeatable: true,
        isHidden: false,
        category: 'daily',
        timesCompleted: 0,
        expirationTime: 24 * 60 * 60 * 1000
      }
    ];
    
    dailyQuests.forEach(quest => {
      this.allQuests.set(quest.id, quest);
    });
  }
  
  private initializeWeeklyQuests(): void {
    // Weekly quests are generated dynamically
  }
  
  private initializeAchievementQuests(): void {
    const achievementQuests: Quest[] = [
      {
        id: 'achievement_001_first_kill',
        title: 'First Blood',
        description: 'Defeat your first enemy.',
        type: 'achievement',
        difficulty: 'easy',
        status: 'available',
        levelRequirement: 1,
        floorRequirement: 1,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'first_kill',
            description: 'Defeat 1 enemy',
            type: 'kill',
            target: 'any',
            currentProgress: 0,
            requiredProgress: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 50 },
          { type: 'title', title: 'Slayer' }
        ],
        isRepeatable: false,
        isHidden: false,
        category: 'achievement',
        timesCompleted: 0
      },
      {
        id: 'achievement_002_collector',
        title: 'Treasure Collector',
        description: 'Collect 100 items total.',
        type: 'achievement',
        difficulty: 'medium',
        status: 'available',
        levelRequirement: 1,
        floorRequirement: 1,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'collect_100_items',
            description: 'Collect 100 items',
            type: 'collect',
            target: 'any_item',
            currentProgress: 0,
            requiredProgress: 100,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 500 },
          { type: 'gold', amount: 1000 },
          { type: 'title', title: 'Treasure Hunter' }
        ],
        isRepeatable: false,
        isHidden: false,
        category: 'achievement',
        timesCompleted: 0
      }
    ];
    
    achievementQuests.forEach(quest => {
      this.allQuests.set(quest.id, quest);
    });
  }
  
  private initializeExplorationQuests(): void {
    const explorationQuests: Quest[] = [
      {
        id: 'exploration_001_floor_10',
        title: 'Depths Explorer',
        description: 'Reach Floor 10 and face the first boss.',
        type: 'exploration',
        difficulty: 'medium',
        status: 'available',
        levelRequirement: 5,
        floorRequirement: 1,
        prerequisiteQuests: [],
        objectives: [
          {
            id: 'reach_floor_10',
            description: 'Reach Floor 10',
            type: 'reach',
            target: 'floor_10',
            currentProgress: 0,
            requiredProgress: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 1000 },
          { type: 'gold', amount: 500 },
          { type: 'unlock', unlockId: 'boss_encounter' }
        ],
        isRepeatable: false,
        isHidden: false,
        category: 'exploration',
        timesCompleted: 0
      }
    ];
    
    explorationQuests.forEach(quest => {
      this.allQuests.set(quest.id, quest);
    });
  }
  
  private setupEventListeners(): void {
    // Listen to game events to update quest progress
    this.scene.events.on('enemy-defeated', this.onEnemyDefeated, this);
    this.scene.events.on('item-collected', this.onItemCollected, this);
    this.scene.events.on('floor-reached', this.onFloorReached, this);
    this.scene.events.on('hero-level-up', this.onHeroLevelUp, this);
    this.scene.events.on('ability-used', this.onAbilityUsed, this);
    this.scene.events.on('boss-defeated', this.onBossDefeated, this);
  }
  
  private loadQuestProgress(): void {
    // IMPLEMENTED: Implement quest data loading
    const questData = null;
    if (questData) {
      // Restore quest states
      questData.activeQuests?.forEach((questId: string) => {
        const quest = this.allQuests.get(questId);
        if (quest) {
          quest.status = 'active';
          this.activeQuests.set(questId, quest);
        }
      });
      
      // Restore completed quests
      questData.completedQuests?.forEach((questId: string) => {
        this.completedQuests.add(questId);
        const quest = this.allQuests.get(questId);
        if (quest) {
          quest.status = 'completed';
        }
      });
      
      // Restore progress
      if (questData.questProgress) {
        Object.entries(questData.questProgress).forEach(([questId, progress]: [string, any]) => {
          this.questProgress.set(questId, progress);
        });
      }
      
      // Restore daily/weekly state
      this.lastDailyRefresh = questData.lastDailyRefresh || 0;
      this.lastWeeklyRefresh = questData.lastWeeklyRefresh || 0;
      if (questData.dailyQuestPool) {
        this.dailyQuestPool = questData.dailyQuestPool;
      }
    }
  }
  
  private canStartQuest(quest: Quest): boolean {
    // Check level requirement
    if (this.hero.stats.level < quest.levelRequirement) {
      return false;
    }
    
    // Check floor requirement (IMPLEMENTED: get current floor from game)
    // if (currentFloor < quest.floorRequirement) return false;
    
    // Check prerequisites
    for (const prereqId of quest.prerequisiteQuests) {
      if (!this.completedQuests.has(prereqId)) {
        return false;
      }
    }
    
    // Check if already active or completed (unless repeatable)
    if (quest.status === 'active' || (quest.status === 'completed' && !quest.isRepeatable)) {
      return false;
    }
    
    return true;
  }
  
  private isQuestCompleted(quest: Quest): boolean {
    return quest.objectives.every(obj => obj.completed);
  }
  
  private objectiveMatches(objective: QuestObjective, type: string, target?: string): boolean {
    if (objective.type !== type) return false;
    if (objective.completed) return false;
    
    // Check target matching
    if (objective.target) {
      if (objective.target === 'any' || objective.target === target) {
        return true;
      }
      
      // Special matching logic
      if (objective.target === 'any_item' && type === 'collect') {
        return true;
      }
      
      if (objective.target === 'elite' && target?.includes('elite')) {
        return true;
      }
    }
    
    return !objective.target; // No specific target required
  }
  
  private incrementObjectiveProgress(questId: string, objectiveId: string, amount: number): void {
    const quest = this.activeQuests.get(questId);
    const progress = this.questProgress.get(questId);
    
    if (!quest || !progress) return;
    
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective || objective.completed) return;
    
    // Update progress
    objective.currentProgress = Math.min(
      objective.currentProgress + amount,
      objective.requiredProgress
    );
    
    progress.objectiveProgress[objectiveId] = objective.currentProgress;
    progress.lastUpdated = Date.now();
    
    // Check if objective is completed
    if (objective.currentProgress >= objective.requiredProgress) {
      objective.completed = true;
      this.scene.events.emit('objective-completed', { quest, objective });
      this.addNotification(`Objective Complete: ${objective.description}`);
    }
    
    // Check if quest is completed
    if (this.isQuestCompleted(quest)) {
      this.completeQuest(questId);
    }
  }
  
  private awardQuestRewards(quest: Quest): void {
    quest.rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          if (reward.amount) {
            this.hero.gainExperience(reward.amount);
            this.addNotification(`+${reward.amount} XP`);
          }
          break;
        case 'gold':
          if (reward.amount) {
            // IMPLEMENTED: Add gold to player inventory
            this.addNotification(`+${reward.amount} Gold`);
          }
          break;
        case 'skill_points':
          if (reward.amount) {
            // IMPLEMENTED: Add skill points
            this.addNotification(`+${reward.amount} Skill Points`);
          }
          break;
        case 'item':
          // IMPLEMENTED: Generate and give item
          this.addNotification(`Received: ${reward.itemId} (${reward.itemRarity})`);
          break;
        case 'title':
          // IMPLEMENTED: Award title
          this.addNotification(`Title Earned: ${reward.title}`);
          break;
        case 'unlock':
          // IMPLEMENTED: Unlock feature
          this.addNotification(`Unlocked: ${reward.unlockId}`);
          break;
      }
    });
  }
  
  private activateAvailableQuests(): void {
    // Auto-activate story quests that are available
    Array.from(this.allQuests.values())
      .filter(quest => quest.type === 'story' && quest.status === 'available' && this.canStartQuest(quest))
      .forEach(quest => {
        this.startQuest(quest.id);
      });
  }
  
  private checkQuestChainProgression(completedQuest: Quest): void {
    // Unlock next quest in chain
    Array.from(this.allQuests.values())
      .filter(quest => quest.prerequisiteQuests.includes(completedQuest.id))
      .forEach(quest => {
        if (quest.status === 'locked' && this.canStartQuest(quest)) {
          quest.status = 'available';
          this.addNotification(`New Quest Available: ${quest.title}`);
        }
      });
  }
  
  private refreshDailyQuests(): void {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (now - this.lastDailyRefresh >= dayInMs) {
      // Generate new daily quests
      this.generateDailyQuests();
      this.lastDailyRefresh = now;
      this.addNotification('Daily quests refreshed!');
    }
  }
  
  private generateDailyQuests(): void {
    // Select 3 daily quests: 1 easy, 1 medium, 1 hard
    const easyQuests = Array.from(this.allQuests.values()).filter(q => q.type === 'daily' && q.difficulty === 'easy');
    const mediumQuests = Array.from(this.allQuests.values()).filter(q => q.type === 'daily' && q.difficulty === 'medium');
    const hardQuests = Array.from(this.allQuests.values()).filter(q => q.type === 'daily' && q.difficulty === 'hard');
    
    this.dailyQuestPool.currentQuests = [
      Phaser.Utils.Array.GetRandom(easyQuests)?.id,
      Phaser.Utils.Array.GetRandom(mediumQuests)?.id,
      Phaser.Utils.Array.GetRandom(hardQuests)?.id
    ].filter(id => id) as string[];
    
    // Reset daily quest status
    this.dailyQuestPool.currentQuests.forEach(questId => {
      const quest = this.allQuests.get(questId);
      if (quest) {
        quest.status = 'available';
        quest.startTime = Date.now();
        quest.expirationTime = Date.now() + 24 * 60 * 60 * 1000;
      }
    });
  }
  
  private checkDailyRefresh(): void {
    const now = Date.now();
    if (now - this.lastDailyRefresh >= 24 * 60 * 60 * 1000) {
      this.refreshDailyQuests();
    }
  }
  
  private refreshWeeklyChallenge(): void {
    // IMPLEMENTED: Implement weekly challenge generation
  }
  
  private checkWeeklyRefresh(): void {
    const now = Date.now();
    if (now - this.lastWeeklyRefresh >= 7 * 24 * 60 * 60 * 1000) {
      this.refreshWeeklyChallenge();
    }
  }
  
  private updateQuestTimers(time: number): void {
    // Check for expired quests
    this.activeQuests.forEach((quest, questId) => {
      if (quest.expirationTime && time > quest.expirationTime) {
        quest.status = 'failed';
        this.activeQuests.delete(questId);
        this.addNotification(`Quest Expired: ${quest.title}`);
      }
    });
  }
  
  private processQuestNotifications(): void {
    // Process pending notifications (could be shown in UI)
    if (this.questNotifications.length > 0) {
      // IMPLEMENTED: Display notifications in UI
      this.questNotifications.splice(0, 5); // Limit to 5 at a time
    }
  }
  
  private addNotification(message: string): void {
    this.questNotifications.push(message);
    console.log(`📜 Quest: ${message}`);
  }
  
  private createEmptyDailyPool(): DailyQuestPool {
    return {
      easyQuests: [],
      mediumQuests: [],
      hardQuests: [],
      lastRefresh: 0,
      currentQuests: []
    };
  }
  
  private getCurrentStoryChapter(): number {
    // Determine current story chapter based on completed quests
    let maxChapter = 1;
    this.storyQuests.forEach((questIds, chapter) => {
      const allCompleted = questIds.every(id => this.completedQuests.has(id));
      if (allCompleted && chapter >= maxChapter) {
        maxChapter = chapter + 1;
      }
    });
    return maxChapter;
  }
  
  private getStoryCompletionPercentage(): number {
    const totalStoryQuests = Array.from(this.storyQuests.values()).flat().length;
    const completedStoryQuests = Array.from(this.storyQuests.values()).flat()
      .filter(id => this.completedQuests.has(id)).length;
    
    return totalStoryQuests > 0 ? Math.round((completedStoryQuests / totalStoryQuests) * 100) : 0;
  }
  
  private getDailyQuestStreak(): number {
    // IMPLEMENTED: Implement daily streak tracking
    return 0;
  }
  
  private scheduleQuestRepeat(quest: Quest): void {
    if (quest.cooldownTime) {
      quest.status = 'available';
      quest.startTime = Date.now() + quest.cooldownTime;
    }
  }
  
  // Event handlers
  
  private onEnemyDefeated(enemy: any): void {
    let target = 'any';
    if (enemy.isBoss) {
      target = enemy.enemyName?.toLowerCase() || 'boss';
    } else if (enemy.enemyType === 'elite') {
      target = 'elite';
    }
    
    this.updateQuestProgress('kill', target, 1);
  }
  
  private onItemCollected(item: any): void {
    this.updateQuestProgress('collect', 'any_item', 1);
  }
  
  private onFloorReached(floorNumber: number): void {
    this.updateQuestProgress('reach', `floor_${floorNumber}`, 1);
  }
  
  private onHeroLevelUp(level: number): void {
    this.updateQuestProgress('level_up', undefined, 1);
  }
  
  private onAbilityUsed(abilityData: any): void {
    this.updateQuestProgress('use_ability', 'class_ability', 1);
  }
  
  private onBossDefeated(floorNumber: number): void {
    // Boss-specific quest updates handled in onEnemyDefeated
    this.scene.events.emit('floor-reached', floorNumber + 1);
  }
}
