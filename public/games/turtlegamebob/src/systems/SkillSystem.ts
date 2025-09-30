/**
 * SkillSystem - Class-specific skill trees and talent progression
 * Manages skill unlocks, talent points, and cross-class progression bonuses
 */

import Phaser from 'phaser';
import { Hero, ShellClass } from '../entities/Hero';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  
  // Tree structure
  row: number;
  column: number;
  requirements: string[]; // IDs of prerequisite skills
  
  // Progression
  currentLevel: number;
  maxLevel: number;
  pointsPerLevel: number;
  
  // Effects
  skillType: 'passive' | 'active' | 'enhancement';
  effects: SkillEffect[];
  
  // Restrictions
  shellClass: ShellClass;
  minCharacterLevel: number;
}

export interface SkillEffect {
  type: 'stat_bonus' | 'ability_unlock' | 'ability_enhance' | 'special';
  target: string; // stat name or ability ID
  value: number;
  valuePerLevel?: number;
  description: string;
}

export interface SkillTree {
  shellClass: ShellClass;
  name: string;
  description: string;
  color: number;
  nodes: SkillNode[];
  bonusNodes: SkillNode[]; // Cross-class bonuses
}

export interface TalentAllocation {
  skillId: string;
  pointsAllocated: number;
}

export class SkillSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Skill trees for each shell class
  private skillTrees: Map<ShellClass, SkillTree> = new Map();
  private crossClassSkills: SkillNode[] = [];
  
  // Player progression
  private allocatedTalents: Map<string, number> = new Map();
  private availableTalentPoints: number = 0;
  
  // UI state
  private activeTree: ShellClass | 'cross' = 'Shell Defender';
  private selectedNode: SkillNode | null = null;
  private skillTreeUI: Phaser.GameObjects.Container | null = null;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeSkillTrees();
    
    console.log('🌟 SkillSystem initialized with class-specific trees');
  }
  
  /**
   * Set hero reference and load progression
   */
  public setHero(hero: Hero): void {
    this.hero = hero;
    this.loadProgressionData();
    this.calculateAvailableTalentPoints();
    
    // Listen for level up events
    this.scene.events.on('hero-level-up', this.onLevelUp, this);
    
    console.log(`🐢 Skill progression loaded for ${hero.shellClass}`);
  }
  
  /**
   * Allocate talent point to a skill
   */
  public allocatePoint(skillId: string): boolean {
    const skill = this.findSkillById(skillId);
    if (!skill) {
      console.warn(`❌ Skill not found: ${skillId}`);
      return false;
    }
    
    // Check if we have available points
    if (this.availableTalentPoints <= 0) {
      console.warn('❌ No talent points available');
      return false;
    }
    
    // Check if skill is at max level
    if (skill.currentLevel >= skill.maxLevel) {
      console.warn(`❌ Skill ${skill.name} is already at max level`);
      return false;
    }
    
    // Check requirements
    if (!this.meetsRequirements(skill)) {
      console.warn(`❌ Requirements not met for ${skill.name}`);
      return false;
    }
    
    // Allocate point
    skill.currentLevel++;
    this.allocatedTalents.set(skillId, skill.currentLevel);
    this.availableTalentPoints--;
    
    // Apply skill effects
    this.applySkillEffects(skill, skill.currentLevel);
    
    // Update hero stats
    this.recalculateHeroStats();
    
    console.log(`🌟 Allocated point to ${skill.name} (Level ${skill.currentLevel})`);
    return true;
  }
  
  /**
   * Reset skill allocation for respec
   */
  public resetSkills(skillTreeType: ShellClass | 'cross' | 'all' = 'all'): number {
    let refundedPoints = 0;
    
    if (skillTreeType === 'all') {
      // Reset all skills
      this.allocatedTalents.forEach((points, skillId) => {
        const skill = this.findSkillById(skillId);
        if (skill) {
          refundedPoints += skill.currentLevel;
          skill.currentLevel = 0;
        }
      });
      this.allocatedTalents.clear();
    } else {
      // Reset specific tree
      const tree = skillTreeType === 'cross' ? 
        { nodes: this.crossClassSkills } : 
        this.skillTrees.get(skillTreeType);
      
      if (tree) {
        tree.nodes.forEach(skill => {
          if (skill.currentLevel > 0) {
            refundedPoints += skill.currentLevel;
            skill.currentLevel = 0;
            this.allocatedTalents.delete(skill.id);
          }
        });
      }
    }
    
    this.availableTalentPoints += refundedPoints;
    this.recalculateHeroStats();
    
    console.log(`🔄 Reset skills, refunded ${refundedPoints} talent points`);
    return refundedPoints;
  }
  
  /**
   * Get skill tree for specific class
   */
  public getSkillTree(shellClass: ShellClass): SkillTree | undefined {
    return this.skillTrees.get(shellClass);
  }
  
  /**
   * Get cross-class skills
   */
  public getCrossClassSkills(): SkillNode[] {
    return this.crossClassSkills;
  }
  
  /**
   * Get available talent points
   */
  public getAvailableTalentPoints(): number {
    return this.availableTalentPoints;
  }
  
  /**
   * Get total talent points spent
   */
  public getTotalPointsSpent(): number {
    let total = 0;
    this.allocatedTalents.forEach(points => total += points);
    return total;
  }
  
  /**
   * Check if skill requirements are met
   */
  public meetsRequirements(skill: SkillNode): boolean {
    // Check character level
    if (this.hero.stats.level < skill.minCharacterLevel) {
      return false;
    }
    
    // Check shell class compatibility
    if (skill.shellClass !== this.hero.shellClass && skill.shellClass !== 'cross' as any) {
      return false;
    }
    
    // Check prerequisite skills
    for (const reqId of skill.requirements) {
      const reqSkill = this.findSkillById(reqId);
      if (!reqSkill || reqSkill.currentLevel === 0) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get total stat bonuses from skills
   */
  public getSkillStatBonuses(): { [key: string]: number } {
    const bonuses: { [key: string]: number } = {};
    
    // Process all allocated skills
    this.allocatedTalents.forEach((level, skillId) => {
      const skill = this.findSkillById(skillId);
      if (!skill || level === 0) return;
      
      skill.effects.forEach(effect => {
        if (effect.type === 'stat_bonus') {
          const bonus = effect.value + (effect.valuePerLevel || 0) * (level - 1);
          bonuses[effect.target] = (bonuses[effect.target] || 0) + bonus;
        }
      });
    });
    
    return bonuses;
  }
  
  /**
   * Create skill tree UI
   */
  public createSkillTreeUI(container: Phaser.GameObjects.Container): void {
    this.skillTreeUI = container;
    
    // Create tree tabs
    this.createTreeTabs();
    
    // Create skill nodes
    this.createSkillNodes();
    
    // Create connection lines
    this.createConnectionLines();
    
    // Create info panel
    this.createInfoPanel();
  }
  
  /**
   * Update skill tree UI
   */
  public updateSkillTreeUI(): void {
    if (!this.skillTreeUI) return;
    
    // Update all skill nodes visual state
    this.updateSkillNodesVisual();
    
    // Update talent point display
    this.updateTalentPointsDisplay();
    
    // Update selected node info
    this.updateSelectedNodeInfo();
  }
  
  /**
   * Handle skill node click
   */
  public onSkillNodeClick(skillId: string, isRightClick: boolean = false): void {
    const skill = this.findSkillById(skillId);
    if (!skill) return;
    
    if (isRightClick) {
      // Right click to remove point (if possible)
      this.removeSkillPoint(skillId);
    } else {
      // Left click to select or allocate
      if (this.selectedNode?.id === skillId && this.availableTalentPoints > 0) {
        this.allocatePoint(skillId);
      } else {
        this.selectedNode = skill;
        this.updateSelectedNodeInfo();
      }
    }
    
    this.updateSkillTreeUI();
  }
  
  /**
   * Save skill progression data
   */
  public saveProgressionData(): any {
    return {
      allocatedTalents: Array.from(this.allocatedTalents.entries()),
      availableTalentPoints: this.availableTalentPoints
    };
  }
  
  /**
   * Load skill progression data
   */
  public loadProgressionData(data?: any): void {
    if (data?.allocatedTalents) {
      this.allocatedTalents.clear();
      data.allocatedTalents.forEach(([skillId, level]: [string, number]) => {
        this.allocatedTalents.set(skillId, level);
        const skill = this.findSkillById(skillId);
        if (skill) {
          skill.currentLevel = level;
        }
      });
    }
    
    if (data?.availableTalentPoints !== undefined) {
      this.availableTalentPoints = data.availableTalentPoints;
    }
    
    this.recalculateHeroStats();
  }
  
  /**
   * Handle level up - award talent points
   */
  public onLevelUp(newLevel: number): void {
    // Award talent points based on level
    const pointsToAward = this.calculateTalentPointsForLevel(newLevel);
    this.availableTalentPoints += pointsToAward;
    
    console.log(`🌟 Level up! Awarded ${pointsToAward} talent points`);
  }
  
  /**
   * Destroy skill system
   */
  public destroy(): void {
    if (this.skillTreeUI && this.skillTreeUI.active) {
      this.skillTreeUI.destroy();
    }
    this.skillTreeUI = null;
    
    // Remove event listeners
    this.scene.events.off('hero-level-up', this.onLevelUp, this);
    
    console.log('🌟 SkillSystem destroyed');
  }
  
  // Private helper methods
  
  private initializeSkillTrees(): void {
    // Initialize Shell Defender tree
    this.skillTrees.set('Shell Defender', this.createShellDefenderTree());
    
    // Initialize Swift Current tree
    this.skillTrees.set('Swift Current', this.createSwiftCurrentTree());
    
    // Initialize Fire Belly tree
    this.skillTrees.set('Fire Belly', this.createFireBellyTree());
    
    // Initialize cross-class skills
    this.crossClassSkills = this.createCrossClassSkills();
  }
  
  private createShellDefenderTree(): SkillTree {
    return {
      shellClass: 'Shell Defender',
      name: 'Guardian\'s Path',
      description: 'Master the art of defense and earth magic',
      color: 0x8B4513,
      nodes: [
        // Row 1 - Foundation
        {
          id: 'def_thick_shell',
          name: 'Thick Shell',
          description: 'Your shell becomes harder, providing increased defense and health.',
          shortDescription: '+Defense, +Max HP',
          icon: 'skill_thick_shell',
          row: 0, column: 1,
          requirements: [],
          currentLevel: 0, maxLevel: 5, pointsPerLevel: 1,
          skillType: 'passive',
          effects: [
            { type: 'stat_bonus', target: 'defense', value: 3, valuePerLevel: 2, description: '+3 Defense per level' },
            { type: 'stat_bonus', target: 'maxHP', value: 10, valuePerLevel: 5, description: '+10 Max HP per level' }
          ],
          shellClass: 'Shell Defender',
          minCharacterLevel: 1
        },
        
        // Row 2 - Defensive abilities
        {
          id: 'def_shell_slam',
          name: 'Shell Slam',
          description: 'Charge forward with your shell, dealing damage and stunning enemies.',
          shortDescription: 'Charging attack with stun',
          icon: 'skill_shell_slam',
          row: 1, column: 0,
          requirements: ['def_thick_shell'],
          currentLevel: 0, maxLevel: 3, pointsPerLevel: 1,
          skillType: 'active',
          effects: [
            { type: 'ability_unlock', target: 'shell_slam', value: 1, description: 'Unlocks Shell Slam ability' }
          ],
          shellClass: 'Shell Defender',
          minCharacterLevel: 3
        },
        
        {
          id: 'def_earth_shield',
          name: 'Earth Shield',
          description: 'Enhance your Earth Shield ability with increased absorption and duration.',
          shortDescription: 'Improved Earth Shield',
          icon: 'skill_earth_shield',
          row: 1, column: 2,
          requirements: ['def_thick_shell'],
          currentLevel: 0, maxLevel: 5, pointsPerLevel: 1,
          skillType: 'enhancement',
          effects: [
            { type: 'ability_enhance', target: 'earth_shield', value: 20, valuePerLevel: 15, description: '+20% shield strength per level' }
          ],
          shellClass: 'Shell Defender',
          minCharacterLevel: 3
        },
        
        // Row 3 - Advanced techniques
        {
          id: 'def_tremor',
          name: 'Earth Tremor',
          description: 'Create a powerful earthquake that damages all nearby enemies.',
          shortDescription: 'Area earthquake attack',
          icon: 'skill_tremor',
          row: 2, column: 1,
          requirements: ['def_shell_slam', 'def_earth_shield'],
          currentLevel: 0, maxLevel: 3, pointsPerLevel: 1,
          skillType: 'active',
          effects: [
            { type: 'ability_unlock', target: 'earth_tremor', value: 1, description: 'Unlocks Earth Tremor ability' }
          ],
          shellClass: 'Shell Defender',
          minCharacterLevel: 8
        },
        
        // Row 4 - Master techniques
        {
          id: 'def_fortress',
          name: 'Living Fortress',
          description: 'Transform into an immovable fortress, gaining massive damage reduction.',
          shortDescription: 'Ultimate defensive form',
          icon: 'skill_fortress',
          row: 3, column: 1,
          requirements: ['def_tremor'],
          currentLevel: 0, maxLevel: 1, pointsPerLevel: 3,
          skillType: 'active',
          effects: [
            { type: 'ability_unlock', target: 'living_fortress', value: 1, description: 'Unlocks Living Fortress ultimate' }
          ],
          shellClass: 'Shell Defender',
          minCharacterLevel: 15
        }
      ],
      bonusNodes: []
    };
  }
  
  private createSwiftCurrentTree(): SkillTree {
    return {
      shellClass: 'Swift Current',
      name: 'Flow Mastery',
      description: 'Master speed and precision in combat',
      color: 0x0077BE,
      nodes: [
        // Row 1 - Foundation
        {
          id: 'swift_agility',
          name: 'Fluid Movement',
          description: 'Move like water, increasing speed and critical hit chance.',
          shortDescription: '+Speed, +Crit Rate',
          icon: 'skill_agility',
          row: 0, column: 1,
          requirements: [],
          currentLevel: 0, maxLevel: 5, pointsPerLevel: 1,
          skillType: 'passive',
          effects: [
            { type: 'stat_bonus', target: 'speed', value: 2, valuePerLevel: 1, description: '+2 Speed per level' },
            { type: 'stat_bonus', target: 'criticalRate', value: 3, valuePerLevel: 2, description: '+3% Crit Rate per level' }
          ],
          shellClass: 'Swift Current',
          minCharacterLevel: 1
        },
        
        // Row 2 - Combat techniques
        {
          id: 'swift_dash',
          name: 'Water Dash',
          description: 'Enhance your Water Dash with increased damage and reduced cooldown.',
          shortDescription: 'Improved Water Dash',
          icon: 'skill_water_dash',
          row: 1, column: 0,
          requirements: ['swift_agility'],
          currentLevel: 0, maxLevel: 5, pointsPerLevel: 1,
          skillType: 'enhancement',
          effects: [
            { type: 'ability_enhance', target: 'water_dash', value: 25, valuePerLevel: 15, description: '+25% damage per level' }
          ],
          shellClass: 'Swift Current',
          minCharacterLevel: 3
        },
        
        {
          id: 'swift_precision',
          name: 'Precision Strikes',
          description: 'Your critical hits deal even more damage and have additional effects.',
          shortDescription: 'Enhanced critical hits',
          icon: 'skill_precision',
          row: 1, column: 2,
          requirements: ['swift_agility'],
          currentLevel: 0, maxLevel: 3, pointsPerLevel: 1,
          skillType: 'passive',
          effects: [
            { type: 'stat_bonus', target: 'criticalDamage', value: 20, valuePerLevel: 15, description: '+20% Crit Damage per level' }
          ],
          shellClass: 'Swift Current',
          minCharacterLevel: 3
        },
        
        // Row 3 - Advanced techniques
        {
          id: 'swift_whirlpool',
          name: 'Whirlpool Strike',
          description: 'Create a spinning water vortex that pulls in and damages enemies.',
          shortDescription: 'Vortex area attack',
          icon: 'skill_whirlpool',
          row: 2, column: 1,
          requirements: ['swift_dash', 'swift_precision'],
          currentLevel: 0, maxLevel: 3, pointsPerLevel: 1,
          skillType: 'active',
          effects: [
            { type: 'ability_unlock', target: 'whirlpool_strike', value: 1, description: 'Unlocks Whirlpool Strike ability' }
          ],
          shellClass: 'Swift Current',
          minCharacterLevel: 8
        },
        
        // Row 4 - Master techniques
        {
          id: 'swift_torrent',
          name: 'Torrent Form',
          description: 'Become one with water, gaining incredible speed and multi-hit attacks.',
          shortDescription: 'Ultimate speed form',
          icon: 'skill_torrent',
          row: 3, column: 1,
          requirements: ['swift_whirlpool'],
          currentLevel: 0, maxLevel: 1, pointsPerLevel: 3,
          skillType: 'active',
          effects: [
            { type: 'ability_unlock', target: 'torrent_form', value: 1, description: 'Unlocks Torrent Form ultimate' }
          ],
          shellClass: 'Swift Current',
          minCharacterLevel: 15
        }
      ],
      bonusNodes: []
    };
  }
  
  private createFireBellyTree(): SkillTree {
    return {
      shellClass: 'Fire Belly',
      name: 'Inferno Mastery',
      description: 'Harness the power of fire and elemental magic',
      color: 0xFF4500,
      nodes: [
        // Row 1 - Foundation
        {
          id: 'fire_inner_flame',
          name: 'Inner Flame',
          description: 'The fire within you burns brighter, increasing attack power and mana.',
          shortDescription: '+Attack, +Max MP',
          icon: 'skill_inner_flame',
          row: 0, column: 1,
          requirements: [],
          currentLevel: 0, maxLevel: 5, pointsPerLevel: 1,
          skillType: 'passive',
          effects: [
            { type: 'stat_bonus', target: 'attack', value: 4, valuePerLevel: 2, description: '+4 Attack per level' },
            { type: 'stat_bonus', target: 'maxMP', value: 15, valuePerLevel: 10, description: '+15 Max MP per level' }
          ],
          shellClass: 'Fire Belly',
          minCharacterLevel: 1
        },
        
        // Row 2 - Fire magic
        {
          id: 'fire_blast_mastery',
          name: 'Fire Blast Mastery',
          description: 'Your Fire Blast spell becomes more powerful and efficient.',
          shortDescription: 'Improved Fire Blast',
          icon: 'skill_fire_blast',
          row: 1, column: 0,
          requirements: ['fire_inner_flame'],
          currentLevel: 0, maxLevel: 5, pointsPerLevel: 1,
          skillType: 'enhancement',
          effects: [
            { type: 'ability_enhance', target: 'fire_blast', value: 30, valuePerLevel: 20, description: '+30% damage per level' }
          ],
          shellClass: 'Fire Belly',
          minCharacterLevel: 3
        },
        
        {
          id: 'fire_aura_mastery',
          name: 'Flame Aura Mastery',
          description: 'Your Flame Aura burns hotter and lasts longer.',
          shortDescription: 'Improved Flame Aura',
          icon: 'skill_flame_aura',
          row: 1, column: 2,
          requirements: ['fire_inner_flame'],
          currentLevel: 0, maxLevel: 3, pointsPerLevel: 1,
          skillType: 'enhancement',
          effects: [
            { type: 'ability_enhance', target: 'flame_aura', value: 50, valuePerLevel: 25, description: '+50% duration per level' }
          ],
          shellClass: 'Fire Belly',
          minCharacterLevel: 3
        },
        
        // Row 3 - Advanced magic
        {
          id: 'fire_meteor',
          name: 'Meteor Strike',
          description: 'Call down a massive meteor that devastates a large area.',
          shortDescription: 'Devastating area spell',
          icon: 'skill_meteor',
          row: 2, column: 1,
          requirements: ['fire_blast_mastery', 'fire_aura_mastery'],
          currentLevel: 0, maxLevel: 3, pointsPerLevel: 1,
          skillType: 'active',
          effects: [
            { type: 'ability_unlock', target: 'meteor_strike', value: 1, description: 'Unlocks Meteor Strike ability' }
          ],
          shellClass: 'Fire Belly',
          minCharacterLevel: 8
        },
        
        // Row 4 - Master magic
        {
          id: 'fire_phoenix',
          name: 'Phoenix Form',
          description: 'Transform into a phoenix of pure fire, gaining flight and immense power.',
          shortDescription: 'Ultimate fire form',
          icon: 'skill_phoenix',
          row: 3, column: 1,
          requirements: ['fire_meteor'],
          currentLevel: 0, maxLevel: 1, pointsPerLevel: 3,
          skillType: 'active',
          effects: [
            { type: 'ability_unlock', target: 'phoenix_form', value: 1, description: 'Unlocks Phoenix Form ultimate' }
          ],
          shellClass: 'Fire Belly',
          minCharacterLevel: 15
        }
      ],
      bonusNodes: []
    };
  }
  
  private createCrossClassSkills(): SkillNode[] {
    return [
      {
        id: 'cross_veteran',
        name: 'Veteran Fighter',
        description: 'Experience in combat grants bonuses to all stats.',
        shortDescription: 'All stats bonus',
        icon: 'skill_veteran',
        row: 0, column: 0,
        requirements: [],
        currentLevel: 0, maxLevel: 10, pointsPerLevel: 1,
        skillType: 'passive',
        effects: [
          { type: 'stat_bonus', target: 'attack', value: 1, valuePerLevel: 1, description: '+1 All Stats per level' },
          { type: 'stat_bonus', target: 'defense', value: 1, valuePerLevel: 1, description: '+1 All Stats per level' },
          { type: 'stat_bonus', target: 'speed', value: 1, valuePerLevel: 1, description: '+1 All Stats per level' }
        ],
        shellClass: 'cross' as any,
        minCharacterLevel: 5
      },
      
      {
        id: 'cross_scholar',
        name: 'Arcane Scholar',
        description: 'Study of magic increases mana efficiency and regeneration.',
        shortDescription: 'Mana bonuses',
        icon: 'skill_scholar',
        row: 0, column: 1,
        requirements: [],
        currentLevel: 0, maxLevel: 5, pointsPerLevel: 1,
        skillType: 'passive',
        effects: [
          { type: 'stat_bonus', target: 'maxMP', value: 20, valuePerLevel: 15, description: '+20 Max MP per level' },
          { type: 'special', target: 'mana_regen', value: 0.5, valuePerLevel: 0.3, description: '+0.5 MP/sec per level' }
        ],
        shellClass: 'cross' as any,
        minCharacterLevel: 10
      }
    ];
  }
  
  private findSkillById(skillId: string): SkillNode | null {
    // Search in all skill trees
    for (const tree of this.skillTrees.values()) {
      const skill = tree.nodes.find(node => node.id === skillId);
      if (skill) return skill;
    }
    
    // Search in cross-class skills
    const crossSkill = this.crossClassSkills.find(node => node.id === skillId);
    if (crossSkill) return crossSkill;
    
    return null;
  }
  
  private applySkillEffects(skill: SkillNode, level: number): void {
    skill.effects.forEach(effect => {
      switch (effect.type) {
        case 'ability_unlock':
          this.unlockAbility(effect.target);
          break;
        case 'ability_enhance':
          this.enhanceAbility(effect.target, effect.value + (effect.valuePerLevel || 0) * (level - 1));
          break;
        // stat_bonus effects are handled in recalculateHeroStats
      }
    });
  }
  
  private unlockAbility(abilityId: string): void {
    // IMPLEMENTED: Unlock ability in hero's ability list
    console.log(`🔓 Unlocked ability: ${abilityId}`);
  }
  
  private enhanceAbility(abilityId: string, enhancement: number): void {
    // IMPLEMENTED: Apply enhancement to existing ability
    console.log(`⚡ Enhanced ability ${abilityId} by ${enhancement}%`);
  }
  
  private recalculateHeroStats(): void {
    if (!this.hero) return;
    
    // Apply skill stat bonuses to hero
    const skillBonuses = this.getSkillStatBonuses();
    
    // Store skill bonuses in hero's classBonus for integration with equipment
    this.hero.stats.classBonus = { ...skillBonuses };
    
    console.log('📊 Hero stats recalculated with skill bonuses:', skillBonuses);
  }
  
  private calculateAvailableTalentPoints(): void {
    if (!this.hero) return;
    
    // Calculate total points that should be available
    const totalPointsFromLevel = this.calculateTotalTalentPointsForLevel(this.hero.stats.level);
    const spentPoints = this.getTotalPointsSpent();
    
    this.availableTalentPoints = Math.max(0, totalPointsFromLevel - spentPoints);
  }
  
  private calculateTalentPointsForLevel(level: number): number {
    // Award 1 talent point every level, bonus points at milestones
    let points = 1;
    
    if (level % 5 === 0) points += 1; // Bonus point every 5 levels
    if (level % 10 === 0) points += 1; // Extra bonus every 10 levels
    
    return points;
  }
  
  private calculateTotalTalentPointsForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i <= level; i++) {
      total += this.calculateTalentPointsForLevel(i);
    }
    return total;
  }
  
  private removeSkillPoint(skillId: string): boolean {
    const skill = this.findSkillById(skillId);
    if (!skill || skill.currentLevel === 0) return false;
    
    // Check if removing this point would break dependencies
    if (this.wouldBreakDependencies(skillId)) {
      console.warn(`❌ Cannot remove point from ${skill.name} - would break dependencies`);
      return false;
    }
    
    // Remove point
    skill.currentLevel--;
    this.allocatedTalents.set(skillId, skill.currentLevel);
    this.availableTalentPoints++;
    
    if (skill.currentLevel === 0) {
      this.allocatedTalents.delete(skillId);
    }
    
    this.recalculateHeroStats();
    
    console.log(`🔄 Removed point from ${skill.name} (Level ${skill.currentLevel})`);
    return true;
  }
  
  private wouldBreakDependencies(skillId: string): boolean {
    // Check if any other skills depend on this one
    const allSkills = [...Array.from(this.skillTrees.values()).flatMap(tree => tree.nodes), ...this.crossClassSkills];
    
    return allSkills.some(skill => 
      skill.requirements.includes(skillId) && skill.currentLevel > 0
    );
  }
  
  private createTreeTabs(): void {
    // IMPLEMENTED: Implement tree tab UI
    console.log('🌳 Creating skill tree tabs');
  }
  
  private createSkillNodes(): void {
    // IMPLEMENTED: Implement skill node UI
    console.log('🔗 Creating skill nodes');
  }
  
  private createConnectionLines(): void {
    // IMPLEMENTED: Implement connection line UI
    console.log('📏 Creating connection lines');
  }
  
  private createInfoPanel(): void {
    // IMPLEMENTED: Implement info panel UI
    console.log('ℹ️ Creating info panel');
  }
  
  private updateSkillNodesVisual(): void {
    // IMPLEMENTED: Update visual state of all skill nodes
  }
  
  private updateTalentPointsDisplay(): void {
    // IMPLEMENTED: Update talent points counter
  }
  
  private updateSelectedNodeInfo(): void {
    // IMPLEMENTED: Update selected node information panel
  }
}
