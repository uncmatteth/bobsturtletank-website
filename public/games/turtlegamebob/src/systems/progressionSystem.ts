/**
 * Character Progression System - Industry-Standard RPG Progression
 * 
 * Handles level ups, skill trees, achievements, and progression rewards
 * Uses Rex UI for notifications and choice dialogs
 */

import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import type { HeroStats } from '../stores/gameStore';
import _ from 'lodash';

// ============================================================================
// INTERFACES
// ============================================================================

interface LevelUpChoice {
  id: string;
  name: string;
  description: string;
  icon: string;
  effects: Partial<HeroStats>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewards: {
    experience?: number;
    gold?: number;
    items?: any[];
  };
}

interface ProgressionConfig {
  backgroundColor: number;
  borderColor: number;
  highlightColor: number;
  achievementColor: number;
}

// ============================================================================
// PROGRESSION SYSTEM CLASS
// ============================================================================

export class ProgressionSystem {
  private scene: Phaser.Scene;
  private rexUI: any;
  private gameStore: any;
  
  // UI Components
  private levelUpDialog?: any;
  private achievementPanel?: any;
  private progressionPanel?: any;
  private notificationQueue: any[] = [];
  
  // Progression Data
  private achievements: Achievement[] = [];
  private levelUpChoices: LevelUpChoice[] = [];
  
  // Configuration
  private config: ProgressionConfig = {
    backgroundColor: 0x2c3e50,
    borderColor: 0x34495e,
    highlightColor: 0x3498db,
    achievementColor: 0xf39c12
  };
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.rexUI = (scene as any).rexUI;
    this.gameStore = useGameStore.getState();
    
    this.initializeAchievements();
    this.initializeLevelUpChoices();
    this.setupStoreSubscriptions();
    
    console.log('📈 Character Progression System initialized');
  }
  
  /**
   * Setup store subscriptions for progression events
   */
  private setupStoreSubscriptions(): void {
    // Listen for level changes
    let previousLevel = this.gameStore.hero.level;
    useGameStore.subscribe((state) => {
      if (state.hero.level > previousLevel) {
        this.handleLevelUp(previousLevel, state.hero.level);
        previousLevel = state.hero.level;
      }
    });
    
    // Listen for kill count changes for achievements
    let previousKills = this.gameStore.hero.totalKills;
    useGameStore.subscribe((state) => {
      if (state.hero.totalKills > previousKills) {
        this.checkKillAchievements(state.hero.totalKills);
        previousKills = state.hero.totalKills;
      }
    });
    
    // Listen for floor progress
    let previousFloor = this.gameStore.currentFloor;
    useGameStore.subscribe((state) => {
      if (state.currentFloor > previousFloor) {
        this.checkFloorAchievements(state.currentFloor);
        previousFloor = state.currentFloor;
      }
    });
  }
  
  /**
   * Initialize achievement system
   */
  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_kill',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        icon: '⚔️',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rewards: { experience: 50, gold: 25 }
      },
      {
        id: 'kill_10',
        name: 'Warrior',
        description: 'Defeat 10 enemies',
        icon: '🛡️',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        rewards: { experience: 100, gold: 50 }
      },
      {
        id: 'kill_50',
        name: 'Veteran',
        description: 'Defeat 50 enemies',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        rewards: { experience: 250, gold: 100 }
      },
      {
        id: 'kill_100',
        name: 'Legend',
        description: 'Defeat 100 enemies',
        icon: '👑',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        rewards: { experience: 500, gold: 250 }
      },
      {
        id: 'floor_5',
        name: 'Deep Explorer',
        description: 'Reach floor 5',
        icon: '🗻',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        rewards: { experience: 200, gold: 100 }
      },
      {
        id: 'floor_10',
        name: 'Abyss Walker',
        description: 'Reach floor 10',
        icon: '🌋',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        rewards: { experience: 500, gold: 250 }
      },
      {
        id: 'level_10',
        name: 'Experienced',
        description: 'Reach level 10',
        icon: '✨',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        rewards: { gold: 200 }
      },
      {
        id: 'gold_1000',
        name: 'Rich Turtle',
        description: 'Accumulate 1000 gold',
        icon: '💰',
        unlocked: false,
        progress: 0,
        maxProgress: 1000,
        rewards: { experience: 300 }
      }
    ];
  }
  
  /**
   * Initialize level up choice system
   */
  private initializeLevelUpChoices(): void {
    this.levelUpChoices = [
      {
        id: 'warrior_path',
        name: 'Warrior\'s Might',
        description: '+3 Attack, +2 Defense, +10 HP',
        icon: '⚔️',
        effects: { attack: 3, defense: 2, maxHP: 10 }
      },
      {
        id: 'swift_path',
        name: 'Swift Current',
        description: '+2 Speed, +3% Critical Rate, +5% Critical Damage',
        icon: '🌊',
        effects: { speed: 2, criticalRate: 3, criticalDamage: 5 }
      },
      {
        id: 'mystic_path',
        name: 'Mystic Shell',
        description: '+15 MP, +10% All Resistances, +1 Defense',
        icon: '🔮',
        effects: { maxMP: 15, fireResistance: 10, waterResistance: 10, earthResistance: 10, defense: 1 }
      },
      {
        id: 'balanced_path',
        name: 'Balanced Growth',
        description: '+1 All Combat Stats, +5 HP, +3 MP',
        icon: '⚖️',
        effects: { attack: 1, defense: 1, speed: 1, maxHP: 5, maxMP: 3 }
      }
    ];
  }
  
  /**
   * Handle level up event
   */
  private handleLevelUp(oldLevel: number, newLevel: number): void {
    console.log(`🎉 Level Up! ${oldLevel} → ${newLevel}`);
    
    // Show level up notification
    this.showLevelUpNotification(newLevel);
    
    // Check level-based achievements
    this.checkLevelAchievements(newLevel);
    
    // Show level up choices for major levels (every 5 levels)
    if (newLevel % 5 === 0) {
      this.showLevelUpChoices(newLevel);
    }
  }
  
  /**
   * Show level up notification
   */
  private showLevelUpNotification(level: number): void {
    const { width, height } = this.scene.cameras.main;
    
    // Create dramatic level up notification
    const notification = this.rexUI.add.dialog({
      x: width / 2,
      y: height / 2,
      width: 400,
      height: 200,
      
      background: this.rexUI.add.roundRectangle(0, 0, 400, 200, 15, this.config.achievementColor)
        .setStrokeStyle(4, 0xf1c40f),
      
      content: this.rexUI.add.sizer({
        orientation: 'vertical',
        space: { item: 10 }
      })
      .add(
        this.scene.add.text(0, 0, '🎉 LEVEL UP! 🎉', {
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2
        })
      )
      .add(
        this.scene.add.text(0, 0, `Level ${level}`, {
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold'
        })
      )
      .add(
        this.scene.add.text(0, 0, 'Stats increased!', {
          fontSize: '14px',
          color: '#ecf0f1'
        })
      ),
      
      space: { left: 20, right: 20, top: 20, bottom: 20 }
    })
    .setScrollFactor(0)
    .setDepth(3000);
    
    // Play level up sound
    try {
      const scene = this.scene as any;
      const sound = scene.howlerSounds?.get('level_up');
      if (sound) {
        sound.volume(0.7);
        sound.play();
      }
    } catch (error) {
      console.warn('Level up sound not available');
    }
    
    // Auto-hide after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      notification.destroy();
    });
  }
  
  /**
   * Show level up choices dialog
   */
  private showLevelUpChoices(level: number): void {
    const { width, height } = this.scene.cameras.main;
    
    const choiceButtons = this.levelUpChoices.map(choice => 
      this.rexUI.add.label({
        width: 300,
        height: 80,
        background: this.rexUI.add.roundRectangle(0, 0, 300, 80, 8, 0x34495e)
          .setStrokeStyle(2, 0x5a6c7d),
        text: this.rexUI.add.sizer({
          orientation: 'vertical'
        })
        .add(
          this.scene.add.text(0, 0, `${choice.icon} ${choice.name}`, {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
          })
        )
        .add(
          this.scene.add.text(0, 0, choice.description, {
            fontSize: '12px',
            color: '#bdc3c7',
            wordWrap: { width: 280 }
          })
        ),
        space: { left: 15, right: 15, top: 10, bottom: 10 },
        align: 'left'
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        choice.background?.setStrokeStyle(3, this.config.highlightColor);
      })
      .on('pointerout', () => {
        choice.background?.setStrokeStyle(2, 0x5a6c7d);
      })
      .onClick(() => {
        this.applyLevelUpChoice(choice);
        this.levelUpDialog?.destroy();
        this.levelUpDialog = undefined;
      })
    );
    
    const choicesSizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      space: { item: 10 }
    });
    
    choiceButtons.forEach(button => choicesSizer.add(button));
    
    this.levelUpDialog = this.rexUI.add.dialog({
      x: width / 2,
      y: height / 2,
      width: 350,
      height: 450,
      
      background: this.rexUI.add.roundRectangle(0, 0, 350, 450, 10, this.config.backgroundColor)
        .setStrokeStyle(2, this.config.borderColor),
      
      title: this.scene.add.text(0, 0, `🎯 Level ${level} Advancement`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }),
      
      content: choicesSizer,
      
      space: {
        left: 15,
        right: 15,
        top: 15,
        bottom: 15,
        title: 10,
        content: 10
      }
    })
    .setScrollFactor(0)
    .setDepth(3500);
  }
  
  /**
   * Apply level up choice bonuses
   */
  private applyLevelUpChoice(choice: LevelUpChoice): void {
    const currentStats = useGameStore.getState().hero;
    const updates: Partial<HeroStats> = {};
    
    // Apply stat bonuses
    Object.entries(choice.effects).forEach(([stat, value]) => {
      if (typeof value === 'number') {
        updates[stat as keyof HeroStats] = (currentStats[stat as keyof HeroStats] as number) + value;
      }
    });
    
    // Apply HP/MP increases to current values too
    if (choice.effects.maxHP) {
      updates.currentHP = currentStats.currentHP + choice.effects.maxHP;
    }
    if (choice.effects.maxMP) {
      updates.currentMP = currentStats.currentMP + choice.effects.maxMP;
    }
    
    useGameStore.getState().updateHeroStats(updates);
    
    console.log(`📈 Applied level up bonus: ${choice.name}`);
    this.showFloatingText(`+${choice.name}`, this.config.achievementColor);
  }
  
  /**
   * Check and unlock kill-based achievements
   */
  private checkKillAchievements(killCount: number): void {
    const killAchievements = ['first_kill', 'kill_10', 'kill_50', 'kill_100'];
    
    killAchievements.forEach(achievementId => {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.progress = killCount;
        
        if (achievement.progress >= achievement.maxProgress) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }
  
  /**
   * Check and unlock floor-based achievements
   */
  private checkFloorAchievements(floor: number): void {
    const floorAchievements = ['floor_5', 'floor_10'];
    
    floorAchievements.forEach(achievementId => {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.progress = floor;
        
        if (achievement.progress >= achievement.maxProgress) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }
  
  /**
   * Check level-based achievements
   */
  private checkLevelAchievements(level: number): void {
    const levelAchievements = ['level_10'];
    
    levelAchievements.forEach(achievementId => {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.progress = level;
        
        if (achievement.progress >= achievement.maxProgress) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }
  
  /**
   * Unlock achievement and give rewards
   */
  private unlockAchievement(achievement: Achievement): void {
    achievement.unlocked = true;
    
    console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
    
    // Give rewards
    const { updateHeroStats, addExperience } = useGameStore.getState();
    
    if (achievement.rewards.experience) {
      addExperience(achievement.rewards.experience);
    }
    
    if (achievement.rewards.gold) {
      const currentHero = useGameStore.getState().hero;
      updateHeroStats({ gold: currentHero.gold + achievement.rewards.gold });
    }
    
    // Show achievement notification
    this.showAchievementNotification(achievement);
  }
  
  /**
   * Show achievement unlock notification
   */
  private showAchievementNotification(achievement: Achievement): void {
    const { width, height } = this.scene.cameras.main;
    
    const notification = this.rexUI.add.dialog({
      x: width - 200,
      y: 100,
      width: 300,
      height: 120,
      
      background: this.rexUI.add.roundRectangle(0, 0, 300, 120, 10, this.config.achievementColor)
        .setStrokeStyle(2, 0xf1c40f),
      
      content: this.rexUI.add.sizer({
        orientation: 'vertical',
        space: { item: 5 }
      })
      .add(
        this.scene.add.text(0, 0, '🏆 ACHIEVEMENT!', {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold'
        })
      )
      .add(
        this.scene.add.text(0, 0, `${achievement.icon} ${achievement.name}`, {
          fontSize: '13px',
          color: '#ffffff'
        })
      )
      .add(
        this.scene.add.text(0, 0, achievement.description, {
          fontSize: '10px',
          color: '#ecf0f1',
          wordWrap: { width: 280 }
        })
      ),
      
      space: { left: 10, right: 10, top: 10, bottom: 10 }
    })
    .setScrollFactor(0)
    .setDepth(3000);
    
    // Slide in from right
    notification.setX(width + 150);
    this.scene.tweens.add({
      targets: notification,
      x: width - 150,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Auto-hide after 4 seconds
    this.scene.time.delayedCall(4000, () => {
      this.scene.tweens.add({
        targets: notification,
        x: width + 150,
        duration: 300,
        ease: 'Power2.easeIn',
        onComplete: () => notification.destroy()
      });
    });
  }
  
  /**
   * Show floating text effect
   */
  private showFloatingText(text: string, color: number): void {
    const { width, height } = this.scene.cameras.main;
    
    const floatingText = this.scene.add.text(width / 2, height / 2 - 50, text, {
      fontSize: '16px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(2500);
    
    this.scene.tweens.add({
      targets: floatingText,
      y: floatingText.y - 80,
      alpha: 0,
      scale: 1.5,
      duration: 2000,
      ease: 'Power2.easeOut',
      onComplete: () => floatingText.destroy()
    });
  }
  
  /**
   * Get achievement progress for display
   */
  public getAchievementProgress(): Achievement[] {
    return this.achievements.map(a => ({ ...a }));
  }
  
  /**
   * Force check all achievements (useful for testing)
   */
  public checkAllAchievements(): void {
    const { hero, currentFloor } = useGameStore.getState();
    
    this.checkKillAchievements(hero.totalKills);
    this.checkFloorAchievements(currentFloor);
    this.checkLevelAchievements(hero.level);
    
    // Check gold achievement
    const goldAchievement = this.achievements.find(a => a.id === 'gold_1000');
    if (goldAchievement && !goldAchievement.unlocked) {
      goldAchievement.progress = hero.gold;
      if (goldAchievement.progress >= goldAchievement.maxProgress) {
        this.unlockAchievement(goldAchievement);
      }
    }
  }
  
  /**
   * Destroy progression system
   */
  public destroy(): void {
    if (this.levelUpDialog) this.levelUpDialog.destroy();
    if (this.achievementPanel) this.achievementPanel.destroy();
    if (this.progressionPanel) this.progressionPanel.destroy();
    
    this.notificationQueue = [];
    console.log('🗑️ Progression System destroyed');
  }
}

console.log('📈 Character Progression System ready');
