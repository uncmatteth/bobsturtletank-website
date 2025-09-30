/**
 * ExperienceComponent - Manages entity experience and leveling
 */

import { Component } from './Component';

export class ExperienceComponent extends Component {
  private currentExperience: number = 0;
  private level: number = 1;
  private experienceTable: number[] = [];
  
  constructor() {
    super('experience');
    this.generateExperienceTable();
  }
  
  /**
   * Generate experience table for leveling
   */
  private generateExperienceTable(): void {
    // Generate experience requirements for levels 1-100
    for (let level = 1; level <= 100; level++) {
      if (level === 1) {
        this.experienceTable.push(0);
      } else {
        // Exponential growth with some variation
        const baseExp = Math.floor(100 * Math.pow(1.2, level - 2));
        this.experienceTable.push(baseExp);
      }
    }
  }
  
  /**
   * Get current experience
   */
  public getCurrentExperience(): number {
    return this.currentExperience;
  }
  
  /**
   * Get current level
   */
  public getLevel(): number {
    return this.level;
  }
  
  /**
   * Get experience required for next level
   */
  public getExperienceToNextLevel(): number {
    if (this.level >= this.experienceTable.length) {
      return 0; // Max level reached
    }
    
    const nextLevelExp = this.experienceTable[this.level];
    return nextLevelExp - this.currentExperience;
  }
  
  /**
   * Get experience required for current level
   */
  public getExperienceForCurrentLevel(): number {
    if (this.level <= 1) {
      return 0;
    }
    
    return this.experienceTable[this.level - 1];
  }
  
  /**
   * Get experience progress as percentage
   */
  public getExperienceProgress(): number {
    if (this.level >= this.experienceTable.length) {
      return 1.0; // Max level
    }
    
    const currentLevelExp = this.getExperienceForCurrentLevel();
    const nextLevelExp = this.experienceTable[this.level];
    const progressExp = this.currentExperience - currentLevelExp;
    const requiredExp = nextLevelExp - currentLevelExp;
    
    return Math.min(progressExp / requiredExp, 1.0);
  }
  
  /**
   * Add experience
   */
  public addExperience(amount: number): void {
    this.currentExperience += amount;
    
    if (this.entity) {
      this.entity['eventBus'].emit('experience_gained', {
        entity: this.entity,
        amount: amount,
        total: this.currentExperience
      });
    }
    
    // Check for level up
    this.checkLevelUp();
  }
  
  /**
   * Check if the entity should level up
   */
  private checkLevelUp(): void {
    let leveledUp = false;
    
    while (this.level < this.experienceTable.length && 
           this.currentExperience >= this.experienceTable[this.level]) {
      this.level++;
      leveledUp = true;
      
      if (this.entity) {
        this.entity['eventBus'].emit('level_up', {
          entity: this.entity,
          level: this.level,
          previousLevel: this.level - 1
        });
      }
    }
    
    if (leveledUp && this.entity) {
      // Apply level up bonuses
      this.applyLevelUpBonuses();
    }
  }
  
  /**
   * Apply bonuses when leveling up
   */
  private applyLevelUpBonuses(): void {
    if (!this.entity) return;
    
    // Increase health
    const healthComponent = this.entity.getComponent('health');
    if (healthComponent) {
      const healthIncrease = Math.floor(Math.random() * 10) + 5; // 5-14 HP
      (healthComponent as any).setMaxHealth(
        (healthComponent as any).getMaxHealth() + healthIncrease
      );
      (healthComponent as any).heal(healthIncrease); // Full heal on level up
    }
    
    // Increase stats
    const statsComponent = this.entity.getComponent('stats');
    if (statsComponent) {
      // Random stat increase
      const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      const randomStat = stats[Math.floor(Math.random() * stats.length)] as any;
      const currentValue = (statsComponent as any).getBaseStat(randomStat);
      (statsComponent as any).setStat(randomStat, currentValue + 1);
      
      if (this.entity) {
        this.entity['eventBus'].emit('message', {
          text: `Your ${randomStat} increased!`
        });
      }
    }
  }
  
  /**
   * Set level directly (for testing or special cases)
   */
  public setLevel(level: number): void {
    if (level < 1 || level >= this.experienceTable.length) {
      return;
    }
    
    const oldLevel = this.level;
    this.level = level;
    this.currentExperience = this.experienceTable[level - 1];
    
    if (this.entity && level > oldLevel) {
      this.entity['eventBus'].emit('level_up', {
        entity: this.entity,
        level: this.level,
        previousLevel: oldLevel
      });
    }
  }
  
  /**
   * Serialize component data
   */
  public serialize(): any {
    return {
      currentExperience: this.currentExperience,
      level: this.level,
      experienceTable: this.experienceTable
    };
  }
  
  /**
   * Deserialize component data
   */
  public deserialize(data: any): void {
    this.currentExperience = data.currentExperience;
    this.level = data.level;
    this.experienceTable = data.experienceTable || [];
    
    // Regenerate table if empty
    if (this.experienceTable.length === 0) {
      this.generateExperienceTable();
    }
  }
}
