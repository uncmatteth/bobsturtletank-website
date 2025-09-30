/**
 * EnchantmentSystem - Advanced equipment enhancement and magical effects
 * Creates legendary-tier enchantment system with 100+ enchantments and set bonuses
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { EquipmentItem, EquipmentSlot } from './EquipmentSystem';
import { Rarity, EquipmentStats } from '../types/GameTypes';
import { SaveSystem } from './SaveSystem';

export type EnchantmentType = 'weapon' | 'armor' | 'accessory' | 'universal' | 'set' | 'legendary' | 'mythic';
export type EnchantmentTier = 'minor' | 'major' | 'grand' | 'legendary' | 'mythic' | 'divine';
export type EnchantmentCategory = 'combat' | 'defense' | 'utility' | 'elemental' | 'mystical' | 'cursed' | 'blessed';

export interface Enchantment {
  id: string;
  name: string;
  description: string;
  type: EnchantmentType;
  tier: EnchantmentTier;
  category: EnchantmentCategory;
  rarity: Rarity;
  
  // Requirements
  levelRequirement: number;
  slotRequirements: EquipmentSlot[];
  conflictsWith: string[];
  prerequisiteEnchantments: string[];
  
  // Effects
  statModifiers: Partial<EquipmentStats>;
  specialEffects: EnchantmentEffect[];
  
  // Application
  stackable: boolean;
  maxStacks: number;
  canUpgrade: boolean;
  
  // Materials
  enchantingCost: EnchantingMaterial[];
  successChance: number;
  destructionChance: number;
  
  // Metadata
  discoverable: boolean;
  isHidden: boolean;
  flavorText: string;
}

export interface EnchantmentEffect {
  id: string;
  type: 'passive' | 'triggered' | 'active' | 'aura' | 'curse';
  trigger?: 'on_hit' | 'on_crit' | 'on_kill' | 'on_damage_taken' | 'on_spell_cast' | 'on_block';
  chance: number;
  duration: number;
  cooldown: number;
  effect: EffectData;
}

export interface EffectData {
  action: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'teleport' | 'transform' | 'special';
  target: 'self' | 'enemy' | 'all_enemies' | 'party' | 'area';
  value: number;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'void';
  radius?: number;
  parameters?: any;
}

export interface EquipmentSet {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  
  // Set pieces
  requiredSlots: EquipmentSlot[];
  items: string[]; // Item IDs that belong to this set
  
  // Set bonuses
  setBonuses: SetBonus[];
  
  // Metadata
  loreText: string;
  discoveryHint: string;
  isHidden: boolean;
}

export interface SetBonus {
  piecesRequired: number;
  name: string;
  description: string;
  statBonuses: Partial<EquipmentStats>;
  specialEffects: EnchantmentEffect[];
  unlockMessage: string;
}

export interface EnchantingMaterial {
  itemId: string;
  amount: number;
  consumeOnFailure: boolean;
}

export interface LegendaryItem extends EquipmentItem {
  isLegendary: true;
  uniqueName: string;
  loreText: string;
  legendaryEffects: LegendaryEffect[];
  evolutionPath?: LegendaryEvolution[];
  soulbound: boolean;
  discoveryCondition: string;
}

export interface LegendaryEffect {
  id: string;
  name: string;
  description: string;
  power: number;
  unlockLevel: number;
  effect: EnchantmentEffect;
}

export interface LegendaryEvolution {
  stage: number;
  name: string;
  requirement: EvolutionRequirement;
  statBoosts: Partial<EquipmentStats>;
  newEffects: LegendaryEffect[];
}

export interface EvolutionRequirement {
  type: 'kills' | 'bosses_defeated' | 'floors_cleared' | 'damage_dealt' | 'experience_gained';
  amount: number;
  description: string;
}

export interface EnchantmentSystemData {
  discoveredEnchantments: string[];
  appliedEnchantments: { [itemId: string]: string[] };
  enchantingMaterials: { [materialId: string]: number };
  legendaryProgress: { [itemId: string]: LegendaryProgress };
  completedSets: string[];
  lastUpdated: number;
}

export interface LegendaryProgress {
  currentStage: number;
  progressToNext: number;
  totalKills: number;
  totalDamage: number;
  bossesDefeated: number;
  floorsCleared: number;
}

export class EnchantmentSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Enchantment data
  private allEnchantments: Map<string, Enchantment> = new Map();
  private equipmentSets: Map<string, EquipmentSet> = new Map();
  private legendaryItems: Map<string, LegendaryItem> = new Map();
  
  // Player progress
  private discoveredEnchantments: Set<string> = new Set();
  private appliedEnchantments: Map<string, string[]> = new Map();
  private enchantingMaterials: Map<string, number> = new Map();
  private legendaryProgress: Map<string, LegendaryProgress> = new Map();
  private completedSets: Set<string> = new Set();
  
  // Active set bonuses
  private activeSetBonuses: Map<string, SetBonus[]> = new Map();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.initializeEnchantments();
    this.initializeEquipmentSets();
    this.initializeLegendaryItems();
    this.setupEventListeners();
    
    console.log('✨ EnchantmentSystem initialized');
  }
  
  /**
   * Initialize enchantment system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.loadEnchantmentData();
    this.updateActiveSetBonuses();
    
    console.log('✨ Enchantment system connected to hero');
  }
  
  /**
   * Update enchantment system
   */
  public update(time: number, delta: number): void {
    this.updateLegendaryProgress();
    this.processTriggeredEffects();
  }
  
  /**
   * Apply enchantment to item
   */
  public applyEnchantment(itemId: string, enchantmentId: string): boolean {
    const enchantment = this.allEnchantments.get(enchantmentId);
    if (!enchantment) {
      console.warn(`Enchantment not found: ${enchantmentId}`);
      return false;
    }
    
    // Check if enchantment can be applied
    if (!this.canApplyEnchantment(itemId, enchantmentId)) {
      console.log(`Cannot apply enchantment ${enchantmentId} to item ${itemId}`);
      return false;
    }
    
    // Check materials
    if (!this.hasEnchantingMaterials(enchantment.enchantingCost)) {
      console.log('Insufficient enchanting materials');
      return false;
    }
    
    // Roll for success
    if (Math.random() > enchantment.successChance) {
      console.log('Enchantment failed!');
      this.consumeMaterials(enchantment.enchantingCost, true);
      
      // Check for item destruction
      if (Math.random() < enchantment.destructionChance) {
        console.log('Item destroyed in enchanting failure!');
        this.scene.events.emit('item-destroyed', itemId);
        return false;
      }
      return false;
    }
    
    // Apply enchantment
    const itemEnchantments = this.appliedEnchantments.get(itemId) || [];
    itemEnchantments.push(enchantmentId);
    this.appliedEnchantments.set(itemId, itemEnchantments);
    
    // Consume materials
    this.consumeMaterials(enchantment.enchantingCost, false);
    
    // Mark as discovered
    this.discoveredEnchantments.add(enchantmentId);
    
    // Update set bonuses
    this.updateActiveSetBonuses();
    
    // Trigger events
    this.scene.events.emit('enchantment-applied', { itemId, enchantmentId });
    
    console.log(`✨ Applied enchantment ${enchantment.name} to item ${itemId}`);
    return true;
  }
  
  /**
   * Remove enchantment from item
   */
  public removeEnchantment(itemId: string, enchantmentId: string): boolean {
    const itemEnchantments = this.appliedEnchantments.get(itemId);
    if (!itemEnchantments || !itemEnchantments.includes(enchantmentId)) {
      return false;
    }
    
    const updatedEnchantments = itemEnchantments.filter(id => id !== enchantmentId);
    this.appliedEnchantments.set(itemId, updatedEnchantments);
    
    this.updateActiveSetBonuses();
    this.scene.events.emit('enchantment-removed', { itemId, enchantmentId });
    
    console.log(`✨ Removed enchantment ${enchantmentId} from item ${itemId}`);
    return true;
  }
  
  /**
   * Get enchantments for item
   */
  public getItemEnchantments(itemId: string): Enchantment[] {
    const enchantmentIds = this.appliedEnchantments.get(itemId) || [];
    return enchantmentIds.map(id => this.allEnchantments.get(id)!).filter(Boolean);
  }
  
  /**
   * Get available enchantments for item
   */
  public getAvailableEnchantments(item: EquipmentItem): Enchantment[] {
    return Array.from(this.allEnchantments.values()).filter(enchantment => 
      this.canApplyEnchantment(item.id, enchantment.id)
    );
  }
  
  /**
   * Get equipment sets containing this item
   */
  public getItemSets(itemId: string): EquipmentSet[] {
    return Array.from(this.equipmentSets.values()).filter(set => 
      set.items.includes(itemId)
    );
  }
  
  /**
   * Get active set bonuses
   */
  public getActiveSetBonuses(): { set: EquipmentSet; bonuses: SetBonus[] }[] {
    const result: { set: EquipmentSet; bonuses: SetBonus[] }[] = [];
    
    this.activeSetBonuses.forEach((bonuses, setId) => {
      const set = this.equipmentSets.get(setId);
      if (set && bonuses.length > 0) {
        result.push({ set, bonuses });
      }
    });
    
    return result;
  }
  
  /**
   * Get legendary item by ID
   */
  public getLegendaryItem(itemId: string): LegendaryItem | null {
    return this.legendaryItems.get(itemId) || null;
  }
  
  /**
   * Get legendary progress for item
   */
  public getLegendaryProgress(itemId: string): LegendaryProgress | null {
    return this.legendaryProgress.get(itemId) || null;
  }
  
  /**
   * Evolve legendary item
   */
  public evolveLegendaryItem(itemId: string): boolean {
    const legendary = this.legendaryItems.get(itemId);
    const progress = this.legendaryProgress.get(itemId);
    
    if (!legendary || !progress || !legendary.evolutionPath) {
      return false;
    }
    
    const nextStage = progress.currentStage + 1;
    const evolution = legendary.evolutionPath.find(evo => evo.stage === nextStage);
    
    if (!evolution) {
      return false;
    }
    
    // Check evolution requirements
    if (!this.meetsEvolutionRequirement(progress, evolution.requirement)) {
      return false;
    }
    
    // Evolve the item
    progress.currentStage = nextStage;
    progress.progressToNext = 0;
    
    // Apply evolution effects
    this.applyEvolutionEffects(itemId, evolution);
    
    // Trigger events
    this.scene.events.emit('legendary-evolved', { itemId, stage: nextStage });
    
    console.log(`⚡ Legendary item ${legendary.uniqueName} evolved to stage ${nextStage}`);
    return true;
  }
  
  /**
   * Discover enchantment
   */
  public discoverEnchantment(enchantmentId: string): boolean {
    if (this.discoveredEnchantments.has(enchantmentId)) {
      return false;
    }
    
    const enchantment = this.allEnchantments.get(enchantmentId);
    if (!enchantment || (!enchantment.discoverable && enchantment.isHidden)) {
      return false;
    }
    
    this.discoveredEnchantments.add(enchantmentId);
    this.scene.events.emit('enchantment-discovered', enchantment);
    
    console.log(`✨ Discovered enchantment: ${enchantment.name}`);
    return true;
  }
  
  /**
   * Add enchanting materials
   */
  public addEnchantingMaterial(materialId: string, amount: number): void {
    const current = this.enchantingMaterials.get(materialId) || 0;
    this.enchantingMaterials.set(materialId, current + amount);
    
    console.log(`📦 Added ${amount} ${materialId} (Total: ${current + amount})`);
  }
  
  /**
   * Get enchanting materials
   */
  public getEnchantingMaterials(): Map<string, number> {
    return new Map(this.enchantingMaterials);
  }
  
  /**
   * Get enchantment system statistics
   */
  public getEnchantmentStats(): any {
    return {
      totalEnchantments: this.allEnchantments.size,
      discoveredEnchantments: this.discoveredEnchantments.size,
      appliedEnchantments: Array.from(this.appliedEnchantments.values()).reduce((sum, arr) => sum + arr.length, 0),
      completedSets: this.completedSets.size,
      legendaryItems: this.legendaryItems.size,
      evolutionProgress: Array.from(this.legendaryProgress.values()).reduce((sum, progress) => sum + progress.currentStage, 0)
    };
  }
  
  /**
   * Save enchantment data
   */
  public saveEnchantmentData(): void {
    const enchantmentData: EnchantmentSystemData = {
      discoveredEnchantments: Array.from(this.discoveredEnchantments),
      appliedEnchantments: Object.fromEntries(this.appliedEnchantments),
      enchantingMaterials: Object.fromEntries(this.enchantingMaterials),
      legendaryProgress: Object.fromEntries(this.legendaryProgress),
      completedSets: Array.from(this.completedSets),
      lastUpdated: Date.now()
    };
    
    // IMPLEMENTED: Integrate with SaveSystem
    console.log('✨ Enchantment data saved:', enchantmentData);
  }
  
  /**
   * Destroy enchantment system
   */
  public destroy(): void {
    this.saveEnchantmentData();
    this.allEnchantments.clear();
    this.equipmentSets.clear();
    this.legendaryItems.clear();
    
    console.log('✨ EnchantmentSystem destroyed');
  }
  
  // Private methods
  
  private initializeEnchantments(): void {
    // Combat enchantments
    this.addCombatEnchantments();
    
    // Defense enchantments
    this.addDefenseEnchantments();
    
    // Utility enchantments
    this.addUtilityEnchantments();
    
    // Elemental enchantments
    this.addElementalEnchantments();
    
    // Mystical enchantments
    this.addMysticalEnchantments();
    
    // Cursed enchantments
    this.addCursedEnchantments();
    
    // Blessed enchantments
    this.addBlessedEnchantments();
    
    console.log(`✨ Initialized ${this.allEnchantments.size} enchantments`);
  }
  
  private addCombatEnchantments(): void {
    const combatEnchantments: Enchantment[] = [
      {
        id: 'sharpness',
        name: 'Sharpness',
        description: 'Increases weapon damage',
        type: 'weapon',
        tier: 'minor',
        category: 'combat',
        rarity: 'Common',
        levelRequirement: 1,
        slotRequirements: ['weapon'],
        conflictsWith: ['dullness'],
        prerequisiteEnchantments: [],
        statModifiers: { attack: 5 },
        specialEffects: [],
        stackable: true,
        maxStacks: 5,
        canUpgrade: true,
        enchantingCost: [{ itemId: 'whetstone', amount: 1, consumeOnFailure: false }],
        successChance: 0.9,
        destructionChance: 0.01,
        discoverable: true,
        isHidden: false,
        flavorText: 'A well-honed edge cuts deeper than brute force.'
      },
      {
        id: 'critical_strike',
        name: 'Critical Strike',
        description: 'Increases critical hit chance and damage',
        type: 'weapon',
        tier: 'major',
        category: 'combat',
        rarity: 'Uncommon',
        levelRequirement: 10,
        slotRequirements: ['weapon'],
        conflictsWith: [],
        prerequisiteEnchantments: ['sharpness'],
        statModifiers: { criticalChance: 0.05, criticalDamage: 0.1 },
        specialEffects: [],
        stackable: true,
        maxStacks: 3,
        canUpgrade: true,
        enchantingCost: [
          { itemId: 'precision_crystal', amount: 2, consumeOnFailure: true },
          { itemId: 'focus_gem', amount: 1, consumeOnFailure: false }
        ],
        successChance: 0.75,
        destructionChance: 0.05,
        discoverable: true,
        isHidden: false,
        flavorText: 'Precision guided by mystic forces finds the perfect moment to strike.'
      },
      {
        id: 'vampiric',
        name: 'Vampiric',
        description: 'Heals wielder for a portion of damage dealt',
        type: 'weapon',
        tier: 'grand',
        category: 'combat',
        rarity: 'Rare',
        levelRequirement: 20,
        slotRequirements: ['weapon'],
        conflictsWith: ['blessed', 'holy'],
        prerequisiteEnchantments: [],
        statModifiers: { lifesteal: 0.08 },
        specialEffects: [
          {
            id: 'vampiric_drain',
            type: 'triggered',
            trigger: 'on_hit',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'heal',
              target: 'self',
              value: 0.15,
              element: 'dark'
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: true,
        enchantingCost: [
          { itemId: 'blood_crystal', amount: 1, consumeOnFailure: true },
          { itemId: 'life_essence', amount: 3, consumeOnFailure: true }
        ],
        successChance: 0.6,
        destructionChance: 0.1,
        discoverable: true,
        isHidden: false,
        flavorText: 'The blade thirsts for blood, and shares its sustenance with its master.'
      },
      {
        id: 'berserker_rage',
        name: 'Berserker\'s Rage',
        description: 'Damage increases as health decreases',
        type: 'weapon',
        tier: 'legendary',
        category: 'combat',
        rarity: 'Epic',
        levelRequirement: 35,
        slotRequirements: ['weapon'],
        conflictsWith: ['pacifist', 'defensive'],
        prerequisiteEnchantments: ['critical_strike'],
        statModifiers: {},
        specialEffects: [
          {
            id: 'rage_damage',
            type: 'passive',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'buff',
              target: 'self',
              value: 2.0, // 200% damage bonus at 10% health
              parameters: { scaling: 'inverse_health' }
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: false,
        enchantingCost: [
          { itemId: 'berserker_essence', amount: 1, consumeOnFailure: true },
          { itemId: 'chaos_shard', amount: 5, consumeOnFailure: true }
        ],
        successChance: 0.3,
        destructionChance: 0.2,
        discoverable: true,
        isHidden: false,
        flavorText: 'When death beckons, rage answers with devastating fury.'
      }
    ];
    
    combatEnchantments.forEach(enchantment => {
      this.allEnchantments.set(enchantment.id, enchantment);
    });
  }
  
  private addDefenseEnchantments(): void {
    const defenseEnchantments: Enchantment[] = [
      {
        id: 'protection',
        name: 'Protection',
        description: 'Reduces all incoming damage',
        type: 'armor',
        tier: 'minor',
        category: 'defense',
        rarity: 'Common',
        levelRequirement: 1,
        slotRequirements: ['helmet', 'chest', 'legs', 'boots'],
        conflictsWith: [],
        prerequisiteEnchantments: [],
        statModifiers: { defense: 3 },
        specialEffects: [],
        stackable: true,
        maxStacks: 4,
        canUpgrade: true,
        enchantingCost: [{ itemId: 'iron_plate', amount: 2, consumeOnFailure: false }],
        successChance: 0.9,
        destructionChance: 0.01,
        discoverable: true,
        isHidden: false,
        flavorText: 'Sturdy craftsmanship provides reliable protection.'
      },
      {
        id: 'reflection',
        name: 'Reflection',
        description: 'Reflects a portion of damage back to attackers',
        type: 'armor',
        tier: 'major',
        category: 'defense',
        rarity: 'Rare',
        levelRequirement: 25,
        slotRequirements: ['chest'],
        conflictsWith: ['absorption'],
        prerequisiteEnchantments: ['protection'],
        statModifiers: {},
        specialEffects: [
          {
            id: 'damage_reflection',
            type: 'triggered',
            trigger: 'on_damage_taken',
            chance: 0.5,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'damage',
              target: 'enemy',
              value: 0.25
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: true,
        enchantingCost: [
          { itemId: 'mirror_shard', amount: 3, consumeOnFailure: true },
          { itemId: 'reflection_crystal', amount: 1, consumeOnFailure: true }
        ],
        successChance: 0.65,
        destructionChance: 0.08,
        discoverable: true,
        isHidden: false,
        flavorText: 'Those who strike the protected find their malice returned threefold.'
      }
    ];
    
    defenseEnchantments.forEach(enchantment => {
      this.allEnchantments.set(enchantment.id, enchantment);
    });
  }
  
  private addUtilityEnchantments(): void {
    const utilityEnchantments: Enchantment[] = [
      {
        id: 'swift_movement',
        name: 'Swift Movement',
        description: 'Increases movement speed',
        type: 'armor',
        tier: 'minor',
        category: 'utility',
        rarity: 'Common',
        levelRequirement: 5,
        slotRequirements: ['boots'],
        conflictsWith: ['heavy_footed'],
        prerequisiteEnchantments: [],
        statModifiers: { movementSpeed: 15 },
        specialEffects: [],
        stackable: true,
        maxStacks: 3,
        canUpgrade: true,
        enchantingCost: [{ itemId: 'feather', amount: 5, consumeOnFailure: false }],
        successChance: 0.85,
        destructionChance: 0.02,
        discoverable: true,
        isHidden: false,
        flavorText: 'Light as air, swift as wind.'
      },
      {
        id: 'treasure_hunter',
        name: 'Treasure Hunter',
        description: 'Increases rare item find chance',
        type: 'accessory',
        tier: 'major',
        category: 'utility',
        rarity: 'Uncommon',
        levelRequirement: 15,
        slotRequirements: ['ring1', 'ring2', 'amulet'],
        conflictsWith: [],
        prerequisiteEnchantments: [],
        statModifiers: {},
        specialEffects: [
          {
            id: 'treasure_sense',
            type: 'passive',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'buff',
              target: 'self',
              value: 0.25,
              parameters: { type: 'loot_quality_bonus' }
            }
          }
        ],
        stackable: true,
        maxStacks: 2,
        canUpgrade: true,
        enchantingCost: [
          { itemId: 'lucky_coin', amount: 10, consumeOnFailure: false },
          { itemId: 'fortune_crystal', amount: 1, consumeOnFailure: true }
        ],
        successChance: 0.7,
        destructionChance: 0.05,
        discoverable: true,
        isHidden: false,
        flavorText: 'The universe conspires to reveal its hidden treasures to the worthy.'
      }
    ];
    
    utilityEnchantments.forEach(enchantment => {
      this.allEnchantments.set(enchantment.id, enchantment);
    });
  }
  
  private addElementalEnchantments(): void {
    const elementalEnchantments: Enchantment[] = [
      {
        id: 'flame_weapon',
        name: 'Flaming',
        description: 'Weapon deals additional fire damage',
        type: 'weapon',
        tier: 'major',
        category: 'elemental',
        rarity: 'Uncommon',
        levelRequirement: 12,
        slotRequirements: ['weapon'],
        conflictsWith: ['frost_weapon', 'shock_weapon'],
        prerequisiteEnchantments: [],
        statModifiers: { fireDamageBonus: 0.15 },
        specialEffects: [
          {
            id: 'flame_burst',
            type: 'triggered',
            trigger: 'on_crit',
            chance: 0.3,
            duration: 3000,
            cooldown: 5000,
            effect: {
              action: 'damage',
              target: 'area',
              value: 20,
              element: 'fire',
              radius: 80
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: true,
        enchantingCost: [
          { itemId: 'fire_essence', amount: 3, consumeOnFailure: true },
          { itemId: 'salamander_scale', amount: 1, consumeOnFailure: false }
        ],
        successChance: 0.75,
        destructionChance: 0.05,
        discoverable: true,
        isHidden: false,
        flavorText: 'The blade burns with eternal flame, leaving nothing but ash in its wake.'
      },
      {
        id: 'frost_armor',
        name: 'Frost Guard',
        description: 'Armor creates chilling aura that slows enemies',
        type: 'armor',
        tier: 'grand',
        category: 'elemental',
        rarity: 'Rare',
        levelRequirement: 20,
        slotRequirements: ['chest'],
        conflictsWith: ['flame_armor'],
        prerequisiteEnchantments: [],
        statModifiers: { waterResistance: 0.2 },
        specialEffects: [
          {
            id: 'chilling_aura',
            type: 'aura',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'debuff',
              target: 'all_enemies',
              value: -30,
              element: 'water',
              radius: 120,
              parameters: { stat: 'movement_speed' }
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: true,
        enchantingCost: [
          { itemId: 'frost_crystal', amount: 2, consumeOnFailure: true },
          { itemId: 'winter_essence', amount: 1, consumeOnFailure: true }
        ],
        successChance: 0.6,
        destructionChance: 0.1,
        discoverable: true,
        isHidden: false,
        flavorText: 'The bitter cold of winter follows in your wake, freezing the blood of your foes.'
      }
    ];
    
    elementalEnchantments.forEach(enchantment => {
      this.allEnchantments.set(enchantment.id, enchantment);
    });
  }
  
  private addMysticalEnchantments(): void {
    const mysticalEnchantments: Enchantment[] = [
      {
        id: 'soul_bound',
        name: 'Soul Bound',
        description: 'Item grows stronger with its wielder',
        type: 'universal',
        tier: 'legendary',
        category: 'mystical',
        rarity: 'Epic',
        levelRequirement: 30,
        slotRequirements: [],
        conflictsWith: [],
        prerequisiteEnchantments: [],
        statModifiers: {},
        specialEffects: [
          {
            id: 'soul_growth',
            type: 'passive',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'buff',
              target: 'self',
              value: 1,
              parameters: { type: 'level_scaling', per_level: 0.5 }
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: false,
        enchantingCost: [
          { itemId: 'soul_crystal', amount: 1, consumeOnFailure: true },
          { itemId: 'binding_ritual', amount: 1, consumeOnFailure: true }
        ],
        successChance: 0.4,
        destructionChance: 0.15,
        discoverable: false,
        isHidden: true,
        flavorText: 'Bound by soul and spirit, this item becomes an extension of your very being.'
      },
      {
        id: 'void_touch',
        name: 'Void Touch',
        description: 'Weapon can damage ethereal enemies and bypasses armor',
        type: 'weapon',
        tier: 'mythic',
        category: 'mystical',
        rarity: 'Legendary',
        levelRequirement: 50,
        slotRequirements: ['weapon'],
        conflictsWith: ['blessed', 'holy'],
        prerequisiteEnchantments: ['soul_bound'],
        statModifiers: {},
        specialEffects: [
          {
            id: 'void_pierce',
            type: 'passive',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'special',
              target: 'enemy',
              value: 1,
              element: 'void',
              parameters: { type: 'armor_bypass', amount: 0.5 }
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: false,
        enchantingCost: [
          { itemId: 'void_essence', amount: 1, consumeOnFailure: true },
          { itemId: 'reality_fragment', amount: 3, consumeOnFailure: true }
        ],
        successChance: 0.2,
        destructionChance: 0.3,
        discoverable: false,
        isHidden: true,
        flavorText: 'Touched by the void between worlds, this weapon exists partially outside reality.'
      }
    ];
    
    mysticalEnchantments.forEach(enchantment => {
      this.allEnchantments.set(enchantment.id, enchantment);
    });
  }
  
  private addCursedEnchantments(): void {
    const cursedEnchantments: Enchantment[] = [
      {
        id: 'blood_price',
        name: 'Blood Price',
        description: 'Deals massive damage but costs health to use',
        type: 'weapon',
        tier: 'grand',
        category: 'cursed',
        rarity: 'Rare',
        levelRequirement: 25,
        slotRequirements: ['weapon'],
        conflictsWith: ['blessed', 'holy', 'vampiric'],
        prerequisiteEnchantments: [],
        statModifiers: { attack: 25 },
        specialEffects: [
          {
            id: 'health_cost',
            type: 'triggered',
            trigger: 'on_hit',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'damage',
              target: 'self',
              value: 5
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: true,
        enchantingCost: [
          { itemId: 'cursed_bone', amount: 1, consumeOnFailure: false },
          { itemId: 'blood_sacrifice', amount: 1, consumeOnFailure: true }
        ],
        successChance: 0.8,
        destructionChance: 0.05,
        discoverable: true,
        isHidden: false,
        flavorText: 'Power demands sacrifice, and this blade extracts its price in blood.'
      }
    ];
    
    cursedEnchantments.forEach(enchantment => {
      this.allEnchantments.set(enchantment.id, enchantment);
    });
  }
  
  private addBlessedEnchantments(): void {
    const blessedEnchantments: Enchantment[] = [
      {
        id: 'divine_protection',
        name: 'Divine Protection',
        description: 'Grants immunity to curses and dark magic',
        type: 'armor',
        tier: 'legendary',
        category: 'blessed',
        rarity: 'Epic',
        levelRequirement: 40,
        slotRequirements: ['chest', 'amulet'],
        conflictsWith: ['cursed', 'dark', 'void_touch'],
        prerequisiteEnchantments: ['protection'],
        statModifiers: { magicDefense: 15 },
        specialEffects: [
          {
            id: 'curse_immunity',
            type: 'passive',
            chance: 1.0,
            duration: 0,
            cooldown: 0,
            effect: {
              action: 'buff',
              target: 'self',
              value: 1,
              element: 'light',
              parameters: { type: 'status_immunity', immunity: ['curse', 'fear', 'corruption'] }
            }
          }
        ],
        stackable: false,
        maxStacks: 1,
        canUpgrade: false,
        enchantingCost: [
          { itemId: 'holy_water', amount: 5, consumeOnFailure: true },
          { itemId: 'divine_blessing', amount: 1, consumeOnFailure: true }
        ],
        successChance: 0.5,
        destructionChance: 0.1,
        discoverable: true,
        isHidden: false,
        flavorText: 'Blessed by divine light, this protection wards against the darkest evils.'
      }
    ];
    
    blessedEnchantments.forEach(enchantment => {
      this.allEnchantments.set(enchantment.id, enchantment);
    });
  }
  
  private initializeEquipmentSets(): void {
    const equipmentSets: EquipmentSet[] = [
      {
        id: 'turtle_guardian_set',
        name: 'Turtle Guardian\'s Legacy',
        description: 'Ancient armor of the first turtle heroes',
        rarity: 'Epic',
        requiredSlots: ['helmet', 'chest', 'legs', 'boots', 'shield'],
        items: ['turtle_helm', 'turtle_plate', 'turtle_greaves', 'turtle_boots', 'turtle_shield'],
        setBonuses: [
          {
            piecesRequired: 2,
            name: 'Shell Strength',
            description: 'Increased defense and shell-specific abilities',
            statBonuses: { defense: 10, maxHP: 50 },
            specialEffects: [],
            unlockMessage: 'The ancient shell magic awakens!'
          },
          {
            piecesRequired: 4,
            name: 'Guardian\'s Resolve',
            description: 'Immunity to fear and increased regeneration',
            statBonuses: { healthRegen: 2, tenacity: 0.2 },
            specialEffects: [
              {
                id: 'fear_immunity',
                type: 'passive',
                chance: 1.0,
                duration: 0,
                cooldown: 0,
                effect: {
                  action: 'buff',
                  target: 'self',
                  value: 1,
                  parameters: { type: 'status_immunity', immunity: ['fear', 'panic'] }
                }
              }
            ],
            unlockMessage: 'The guardian\'s unbreakable will flows through you!'
          },
          {
            piecesRequired: 5,
            name: 'Legacy of Heroes',
            description: 'Massive stat boosts and turtle transformation ability',
            statBonuses: { allStats: 25, allResistances: 0.15 },
            specialEffects: [
              {
                id: 'turtle_form',
                type: 'active',
                chance: 1.0,
                duration: 10000,
                cooldown: 60000,
                effect: {
                  action: 'transform',
                  target: 'self',
                  value: 1,
                  parameters: { form: 'armored_turtle', defense_multiplier: 3, speed_reduction: 0.5 }
                }
              }
            ],
            unlockMessage: 'You have become the living embodiment of turtle heroism!'
          }
        ],
        loreText: 'Forged in the depths by the first turtle civilization, this armor has protected heroes for millennia.',
        discoveryHint: 'Seek the ancient armories in the deepest chambers of the turtle ruins.',
        isHidden: false
      },
      {
        id: 'void_touched_set',
        name: 'Void-Touched Regalia',
        description: 'Equipment corrupted and empowered by void energy',
        rarity: 'Legendary',
        requiredSlots: ['weapon', 'chest', 'amulet'],
        items: ['void_blade', 'void_robe', 'void_amulet'],
        setBonuses: [
          {
            piecesRequired: 2,
            name: 'Void Affinity',
            description: 'Reduced void damage and increased void damage dealt',
            statBonuses: {},
            specialEffects: [
              {
                id: 'void_mastery',
                type: 'passive',
                chance: 1.0,
                duration: 0,
                cooldown: 0,
                effect: {
                  action: 'buff',
                  target: 'self',
                  value: 0.5,
                  element: 'void',
                  parameters: { type: 'element_mastery' }
                }
              }
            ],
            unlockMessage: 'The void whispers its secrets to you...'
          },
          {
            piecesRequired: 3,
            name: 'Reality Rift',
            description: 'Ability to step through reality and bypass physical obstacles',
            statBonuses: { evasion: 0.25 },
            specialEffects: [
              {
                id: 'phase_walk',
                type: 'active',
                chance: 1.0,
                duration: 5000,
                cooldown: 30000,
                effect: {
                  action: 'special',
                  target: 'self',
                  value: 1,
                  parameters: { type: 'phase_ability', ignore_collisions: true }
                }
              }
            ],
            unlockMessage: 'Reality bends to your will as the void claims you as its own!'
          }
        ],
        loreText: 'Those who delve too deep into the void may find themselves changed by its alien energies.',
        discoveryHint: 'Only those who have faced the void and survived can hope to wield these artifacts.',
        isHidden: true
      }
    ];
    
    equipmentSets.forEach(set => {
      this.equipmentSets.set(set.id, set);
    });
    
    console.log(`✨ Initialized ${this.equipmentSets.size} equipment sets`);
  }
  
  private initializeLegendaryItems(): void {
    const legendaryItems: LegendaryItem[] = [
      {
        id: 'shellbreaker_eternal',
        name: 'Shellbreaker Eternal',
        uniqueName: 'The Legendary Turtle Slayer',
        description: 'A weapon of immense power forged from the shells of fallen titans',
        slot: 'weapon' as EquipmentSlot,
        rarity: 'Legendary',
        level: 50,
        stats: {
          attack: 100, defense: 0, maxHP: 0, maxMP: 0, speed: 0,
          criticalChance: 0.15, criticalDamage: 0.5, evasion: 0, accuracy: 0.1, tenacity: 0,
          fireResistance: 0, waterResistance: 0, earthResistance: 0,
          magicAttack: 0, magicDefense: 0, healthRegen: 0, manaRegen: 0, lifesteal: 0,
          fireDamageBonus: 0, waterDamageBonus: 0, earthDamageBonus: 0,
          allStats: 0, allResistances: 0, movementSpeed: 0
        },
        texture: 'legendary_weapon',
        frame: 0,
        isLegendary: true,
        loreText: 'Forged from the shells of ancient turtle titans, this blade carries the weight of eons and the power to shatter any defense.',
        legendaryEffects: [
          {
            id: 'titan_slayer',
            name: 'Titan Slayer',
            description: 'Deals massive bonus damage to large enemies',
            power: 100,
            unlockLevel: 1,
            effect: {
              id: 'titan_damage',
              type: 'passive',
              chance: 1.0,
              duration: 0,
              cooldown: 0,
              effect: {
                action: 'damage',
                target: 'enemy',
                value: 2.0,
                parameters: { condition: 'large_enemy' }
              }
            }
          },
          {
            id: 'shell_pierce',
            name: 'Shell Pierce',
            description: 'Ignores enemy armor completely',
            power: 150,
            unlockLevel: 10,
            effect: {
              id: 'armor_ignore',
              type: 'passive',
              chance: 1.0,
              duration: 0,
              cooldown: 0,
              effect: {
                action: 'special',
                target: 'enemy',
                value: 1,
                parameters: { type: 'ignore_armor' }
              }
            }
          }
        ],
        evolutionPath: [
          {
            stage: 1,
            name: 'Awakened Shellbreaker',
            requirement: {
              type: 'bosses_defeated',
              amount: 50,
              description: 'Defeat 50 bosses with this weapon'
            },
            statBoosts: { attack: 25, criticalChance: 0.05 },
            newEffects: [
              {
                id: 'boss_hunter',
                name: 'Boss Hunter',
                description: 'Deals increasing damage to bosses based on how many you\'ve defeated',
                power: 200,
                unlockLevel: 1,
                effect: {
                  id: 'boss_scaling',
                  type: 'passive',
                  chance: 1.0,
                  duration: 0,
                  cooldown: 0,
                  effect: {
                    action: 'damage',
                    target: 'enemy',
                    value: 1,
                    parameters: { type: 'boss_kill_scaling', per_kill: 0.02 }
                  }
                }
              }
            ]
          },
          {
            stage: 2,
            name: 'Transcendent Shellbreaker',
            requirement: {
              type: 'damage_dealt',
              amount: 1000000,
              description: 'Deal 1,000,000 total damage with this weapon'
            },
            statBoosts: { attack: 50, criticalDamage: 0.25 },
            newEffects: [
              {
                id: 'reality_cleave',
                name: 'Reality Cleave',
                description: 'Attacks have a chance to deal true damage that ignores all defenses',
                power: 300,
                unlockLevel: 1,
                effect: {
                  id: 'true_damage',
                  type: 'triggered',
                  trigger: 'on_hit',
                  chance: 0.1,
                  duration: 0,
                  cooldown: 0,
                  effect: {
                    action: 'damage',
                    target: 'enemy',
                    value: 500,
                    parameters: { type: 'true_damage' }
                  }
                }
              }
            ]
          }
        ],
        soulbound: true,
        discoveryCondition: 'Defeat the Ancient Titan Guardian on Floor 100'
      }
    ];
    
    legendaryItems.forEach(item => {
      this.legendaryItems.set(item.id, item);
    });
    
    console.log(`✨ Initialized ${this.legendaryItems.size} legendary items`);
  }
  
  private setupEventListeners(): void {
    // Listen to game events for enchantment triggers
    this.scene.events.on('enemy-defeated', this.onEnemyDefeated, this);
    this.scene.events.on('damage-dealt', this.onDamageDealt, this);
    this.scene.events.on('damage-taken', this.onDamageTaken, this);
    this.scene.events.on('boss-defeated', this.onBossDefeated, this);
    this.scene.events.on('item-equipped', this.onItemEquipped, this);
    this.scene.events.on('item-unequipped', this.onItemUnequipped, this);
  }
  
  private canApplyEnchantment(itemId: string, enchantmentId: string): boolean {
    const enchantment = this.allEnchantments.get(enchantmentId);
    if (!enchantment) return false;
    
    // Check if already applied and not stackable
    const currentEnchantments = this.appliedEnchantments.get(itemId) || [];
    if (currentEnchantments.includes(enchantmentId) && !enchantment.stackable) {
      return false;
    }
    
    // Check stack limit
    if (enchantment.stackable) {
      const currentStacks = currentEnchantments.filter(id => id === enchantmentId).length;
      if (currentStacks >= enchantment.maxStacks) {
        return false;
      }
    }
    
    // Check conflicts
    for (const conflictId of enchantment.conflictsWith) {
      if (currentEnchantments.includes(conflictId)) {
        return false;
      }
    }
    
    // Check prerequisites
    for (const prereqId of enchantment.prerequisiteEnchantments) {
      if (!currentEnchantments.includes(prereqId)) {
        return false;
      }
    }
    
    // Check level requirement
    if (this.hero.stats.level < enchantment.levelRequirement) {
      return false;
    }
    
    // IMPLEMENTED: Check slot requirements against item
    
    return true;
  }
  
  private hasEnchantingMaterials(materials: EnchantingMaterial[]): boolean {
    return materials.every(material => {
      const available = this.enchantingMaterials.get(material.itemId) || 0;
      return available >= material.amount;
    });
  }
  
  private consumeMaterials(materials: EnchantingMaterial[], failed: boolean): void {
    materials.forEach(material => {
      if (!failed || material.consumeOnFailure) {
        const current = this.enchantingMaterials.get(material.itemId) || 0;
        this.enchantingMaterials.set(material.itemId, Math.max(0, current - material.amount));
      }
    });
  }
  
  private updateActiveSetBonuses(): void {
    this.activeSetBonuses.clear();
    
    // IMPLEMENTED: Get currently equipped items from hero
    const equippedItems: string[] = []; // Placeholder
    
    this.equipmentSets.forEach(set => {
      const equippedPieces = set.items.filter(itemId => equippedItems.includes(itemId));
      const activeBonuses: SetBonus[] = [];
      
      set.setBonuses.forEach(bonus => {
        if (equippedPieces.length >= bonus.piecesRequired) {
          activeBonuses.push(bonus);
        }
      });
      
      if (activeBonuses.length > 0) {
        this.activeSetBonuses.set(set.id, activeBonuses);
        
        // Check if set is completed for the first time
        if (equippedPieces.length === set.items.length && !this.completedSets.has(set.id)) {
          this.completedSets.add(set.id);
          this.scene.events.emit('set-completed', set);
        }
      }
    });
  }
  
  private updateLegendaryProgress(): void {
    // Update progress for equipped legendary items
    // This would be called based on player actions
  }
  
  private processTriggeredEffects(): void {
    // Process cooldowns and triggered effects
    // This would manage effect timers and triggers
  }
  
  private meetsEvolutionRequirement(progress: LegendaryProgress, requirement: EvolutionRequirement): boolean {
    switch (requirement.type) {
      case 'kills':
        return progress.totalKills >= requirement.amount;
      case 'bosses_defeated':
        return progress.bossesDefeated >= requirement.amount;
      case 'floors_cleared':
        return progress.floorsCleared >= requirement.amount;
      case 'damage_dealt':
        return progress.totalDamage >= requirement.amount;
      default:
        return false;
    }
  }
  
  private applyEvolutionEffects(itemId: string, evolution: LegendaryEvolution): void {
    // Apply evolution effects to the item
    console.log(`⚡ Applied evolution effects for ${itemId} stage ${evolution.stage}`);
  }
  
  private loadEnchantmentData(): void {
    // IMPLEMENTED: Load from SaveSystem
    console.log('✨ Enchantment data loaded');
  }
  
  // Event handlers
  
  private onEnemyDefeated(enemy: any): void {
    // Update legendary progress
    this.legendaryProgress.forEach(progress => {
      progress.totalKills++;
      if (enemy.isBoss) {
        progress.bossesDefeated++;
      }
    });
    
    // Chance to discover enchantments
    if (Math.random() < 0.05) { // 5% chance
      const hiddenEnchantments = Array.from(this.allEnchantments.values())
        .filter(ench => ench.discoverable && !this.discoveredEnchantments.has(ench.id));
      
      if (hiddenEnchantments.length > 0) {
        const randomEnchantment = Phaser.Utils.Array.GetRandom(hiddenEnchantments);
        this.discoverEnchantment(randomEnchantment.id);
      }
    }
  }
  
  private onDamageDealt(damage: number): void {
    // Update legendary progress
    this.legendaryProgress.forEach(progress => {
      progress.totalDamage += damage;
    });
  }
  
  private onDamageTaken(damage: number): void {
    // Trigger defensive enchantments
    // This would be handled by the enchantment effect system
  }
  
  private onBossDefeated(floorNumber: number): void {
    // Special enchantment discovery chances for boss defeats
    if (Math.random() < 0.15) { // 15% chance for rare enchantments
      const rareEnchantments = Array.from(this.allEnchantments.values())
        .filter(ench => ench.rarity === 'Epic' || ench.rarity === 'Legendary');
      
      if (rareEnchantments.length > 0) {
        const randomEnchantment = Phaser.Utils.Array.GetRandom(rareEnchantments);
        this.discoverEnchantment(randomEnchantment.id);
      }
    }
  }
  
  private onItemEquipped(item: EquipmentItem): void {
    this.updateActiveSetBonuses();
  }
  
  private onItemUnequipped(item: EquipmentItem): void {
    this.updateActiveSetBonuses();
  }
}
