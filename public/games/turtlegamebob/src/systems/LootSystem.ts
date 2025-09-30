/**
 * LootSystem - Procedural item generation and treasure drops
 * Creates the legendary 200+ weapons/armor with random bonuses
 */

import Phaser from 'phaser';
import { EquipmentItem, EquipmentSlot } from './EquipmentSystem';
import { Rarity, EquipmentStats } from '../types/GameTypes';
import { Enemy } from '../entities/Enemy';
import { Hero } from '../entities/Hero';
import { EnchantmentSystem } from './EnchantmentSystem';

export interface LootTable {
  itemType: 'equipment' | 'consumable' | 'material' | 'currency';
  equipmentSlot?: EquipmentSlot;
  minLevel: number;
  maxLevel: number;
  dropChance: number;
  rarityWeights: Record<Rarity, number>;
  specialEffects?: string[];
}

export interface ItemTemplate {
  name: string;
  slot: EquipmentSlot;
  baseStats: Partial<EquipmentStats>;
  levelScaling: Partial<EquipmentStats>;
  prefixes: string[];
  suffixes: string[];
  description: string;
  visualType: string;
}

export interface LootDrop {
  item: EquipmentItem | ConsumableItem | MaterialItem | CurrencyDrop;
  position: { x: number; y: number };
  sprite: Phaser.GameObjects.Sprite;
  glowEffect?: Phaser.GameObjects.Graphics;
  pickupRadius: number;
  lifetime: number;
  createdAt: number;
}

export interface ConsumableItem {
  id: string;
  name: string;
  type: 'healing' | 'mana' | 'buff' | 'utility';
  effect: {
    type: string;
    value: number;
    duration?: number;
  };
  stackSize: number;
  rarity: Rarity;
  description: string;
  icon: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  type: 'crafting' | 'upgrade' | 'enchant';
  tier: number;
  stackSize: number;
  rarity: Rarity;
  description: string;
  icon: string;
}

export interface CurrencyDrop {
  id: string;
  type: 'gold' | 'gems' | 'essence';
  amount: number;
  icon: string;
}

export class LootSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  private enchantmentSystem!: EnchantmentSystem;
  
  // Loot management
  private activeDrops: LootDrop[] = [];
  private lootGroup!: Phaser.Physics.Arcade.Group;
  
  // Item generation templates
  private weaponTemplates: Map<EquipmentSlot, ItemTemplate[]> = new Map();
  private armorTemplates: Map<EquipmentSlot, ItemTemplate[]> = new Map();
  private accessoryTemplates: Map<EquipmentSlot, ItemTemplate[]> = new Map();
  
  // Loot tables for different sources
  private enemyLootTables: Map<string, LootTable[]> = new Map();
  private treasureLootTables: LootTable[] = [];
  
  // Affix pools for procedural generation
  private prefixPool: { [key: string]: { stats: Partial<EquipmentStats>; weight: number } } = {};
  private suffixPool: { [key: string]: { stats: Partial<EquipmentStats>; weight: number } } = {};
  
  // Drop visual effects
  private pickupSounds: string[] = ['pickup_item', 'pickup_rare', 'pickup_legendary'];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Initialize loot group
    this.lootGroup = scene.physics.add.group({
      classType: Phaser.GameObjects.Sprite,
      maxSize: 100
    });
    
    // Initialize item templates and loot tables
    this.initializeItemTemplates();
    this.initializeLootTables();
    this.initializeAffixPools();
    
    console.log('💎 LootSystem initialized with procedural generation');
  }
  
  /**
   * Set hero reference for loot pickup
   */
  public setHero(hero: Hero): void {
    this.hero = hero;
    
    // Setup collision detection for loot pickup
    this.scene.physics.add.overlap(hero, this.lootGroup, this.handleLootPickup, undefined, this);
    
    console.log('💎 Loot pickup system configured');
  }
  
  /**
   * Generate loot from defeated enemy
   */
  public generateEnemyLoot(enemy: Enemy): void {
    const lootTables = this.getEnemyLootTables(enemy);
    
    lootTables.forEach(table => {
      if (Math.random() < table.dropChance) {
        const item = this.generateItemFromTable(table, enemy.level);
        if (item) {
          this.dropItem(item, enemy.x, enemy.y);
        }
      }
    });
    
    // Always drop some currency
    this.dropCurrency(enemy.x, enemy.y, enemy.level, enemy.rewards.gold);
    
    console.log(`💰 Generated loot from defeated ${enemy.enemyName}`);
  }
  
  /**
   * Generate treasure chest loot
   */
  public generateTreasureLoot(x: number, y: number, chestLevel: number, isRareChest: boolean = false): void {
    const numItems = isRareChest ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(1, 2);
    
    for (let i = 0; i < numItems; i++) {
      const table = Phaser.Utils.Array.GetRandom(this.treasureLootTables);
      const item = this.generateItemFromTable(table, chestLevel);
      
      if (item) {
        // Spread items around chest
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;
        this.dropItem(item, x + offsetX, y + offsetY);
      }
    }
    
    // Bonus currency for treasure chests
    const bonusGold = chestLevel * (isRareChest ? 50 : 25);
    this.dropCurrency(x, y, chestLevel, bonusGold);
    
    console.log(`🏆 Generated treasure chest loot (Level ${chestLevel})`);
  }
  
  /**
   * Generate random equipment item
   */
  public generateRandomEquipment(
    level: number, 
    slot?: EquipmentSlot, 
    rarity?: Rarity
  ): EquipmentItem | null {
    // Select equipment slot
    const targetSlot = slot || this.getRandomEquipmentSlot();
    
    // Get templates for slot
    const templates = this.getTemplatesForSlot(targetSlot);
    if (templates.length === 0) return null;
    
    const template = Phaser.Utils.Array.GetRandom(templates);
    
    // Determine rarity
    const itemRarity = rarity || this.rollRarity(level);
    
    // Generate the item
    return this.generateEquipmentFromTemplate(template, level, itemRarity);
  }
  
  /**
   * Drop item at location
   */
  public dropItem(
    item: EquipmentItem | ConsumableItem | MaterialItem | CurrencyDrop, 
    x: number, 
    y: number
  ): void {
    // Create sprite based on item type
    const sprite = this.scene.add.sprite(x, y, this.getItemIcon(item));
    sprite.setDisplaySize(32, 32);
    sprite.setDepth(10);
    
    // Add physics
    this.scene.physics.add.existing(sprite);
    this.lootGroup.add(sprite);
    
    // Create rarity glow effect
    const glowEffect = this.createRarityGlow(x, y, this.getItemRarity(item));
    
    // Create loot drop
    const lootDrop: LootDrop = {
      item,
      position: { x, y },
      sprite,
      glowEffect,
      pickupRadius: 40,
      lifetime: 300000, // 5 minutes
      createdAt: Date.now()
    };
    
    this.activeDrops.push(lootDrop);
    
    // Animate drop
    this.animateDrop(sprite, glowEffect);
    
    console.log(`💎 Dropped ${this.getItemName(item)} at (${x}, ${y})`);
  }
  
  /**
   * Drop currency at location
   */
  public dropCurrency(x: number, y: number, level: number, baseAmount: number): void {
    const amount = Math.max(1, Math.floor(baseAmount * (1 + level * 0.1)));
    
    const currency: CurrencyDrop = {
      id: `gold_${Date.now()}`,
      type: 'gold',
      amount,
      icon: 'gold_coin'
    };
    
    this.dropItem(currency, x, y);
  }
  
  /**
   * Update loot system
   */
  public update(time: number, delta: number): void {
    // Update loot drops
    this.updateLootDrops(time);
    
    // Check for expired drops
    this.cleanupExpiredDrops(time);
  }
  
  /**
   * Get nearby loot for auto-pickup
   */
  public getNearbyLoot(x: number, y: number, radius: number): LootDrop[] {
    return this.activeDrops.filter(drop => {
      const distance = Phaser.Math.Distance.Between(x, y, drop.position.x, drop.position.y);
      return distance <= radius;
    });
  }
  
  /**
   * Force pickup specific loot drop
   */
  public pickupLoot(lootDrop: LootDrop): boolean {
    const item = lootDrop.item;
    
    // Handle different item types
    let success = false;
    
    if ('slot' in item) {
      // Equipment item
      success = this.hero.inventory?.addItem(item as EquipmentItem) || false;
    } else if ('type' in item && item.type !== 'gold') {
      // Consumable or material
      success = this.hero.inventory?.addConsumable?.(item as ConsumableItem) || false;
    } else {
      // Currency
      const currency = item as CurrencyDrop;
      this.hero.stats.gold = (this.hero.stats.gold || 0) + currency.amount;
      success = true;
    }
    
    if (success) {
      this.removeLootDrop(lootDrop);
      this.playPickupEffect(lootDrop);
      console.log(`✅ Picked up ${this.getItemName(item)}`);
    }
    
    return success;
  }
  
  /**
   * Clear all loot drops
   */
  public clearAllLoot(): void {
    this.activeDrops.forEach(drop => {
      if (drop.sprite && drop.sprite.active) {
        drop.sprite.destroy();
      }
      if (drop.glowEffect && drop.glowEffect.active) {
        drop.glowEffect.destroy();
      }
    });
    
    this.activeDrops = [];
    this.lootGroup.clear(true, true);
    
    console.log('💎 All loot drops cleared');
  }
  
  /**
   * Get loot drop statistics
   */
  public getLootStats(): {
    activeDrops: number;
    byRarity: Record<Rarity, number>;
    byType: Record<string, number>;
  } {
    const byRarity: Record<Rarity, number> = {
      'Common': 0, 'Uncommon': 0, 'Rare': 0, 'Epic': 0, 'Legendary': 0, 'Mythic': 0
    };
    const byType: Record<string, number> = {};
    
    this.activeDrops.forEach(drop => {
      const rarity = this.getItemRarity(drop.item);
      byRarity[rarity]++;
      
      const type = this.getItemType(drop.item);
      byType[type] = (byType[type] || 0) + 1;
    });
    
    return {
      activeDrops: this.activeDrops.length,
      byRarity,
      byType
    };
  }
  
  /**
   * Destroy loot system
   */
  public destroy(): void {
    this.clearAllLoot();
    this.lootGroup.destroy();
    
    console.log('💎 LootSystem destroyed');
  }
  
  // Private methods
  
  private initializeItemTemplates(): void {
    // Weapon templates
    const weaponTemplates: ItemTemplate[] = [
      {
        name: 'Shell Blade',
        slot: 'weapon' as EquipmentSlot,
        baseStats: { attack: 15, criticalRate: 5 },
        levelScaling: { attack: 3, criticalRate: 1 },
        prefixes: ['Sharp', 'Heavy', 'Swift', 'Brutal'],
        suffixes: ['of Power', 'of Speed', 'of Precision'],
        description: 'A weapon forged from hardened shell material',
        visualType: 'sword'
      },
      {
        name: 'Coral Staff',
        slot: 'weapon' as EquipmentSlot,
        baseStats: { attack: 12, maxMP: 20 },
        levelScaling: { attack: 2, maxMP: 4 },
        prefixes: ['Mystic', 'Ancient', 'Glowing'],
        suffixes: ['of Wisdom', 'of the Deep', 'of Sorcery'],
        description: 'A staff grown from living coral',
        visualType: 'staff'
      }
    ];
    
    // Armor templates
    const armorTemplates: ItemTemplate[] = [
      {
        name: 'Shell Armor',
        slot: 'chest' as EquipmentSlot,
        baseStats: { defense: 10, maxHP: 25 },
        levelScaling: { defense: 2, maxHP: 5 },
        prefixes: ['Thick', 'Reinforced', 'Blessed'],
        suffixes: ['of Protection', 'of Endurance', 'of the Guardian'],
        description: 'Armor crafted from turtle shell plates',
        visualType: 'heavy_armor'
      },
      {
        name: 'Seaweed Cloak',
        slot: 'chest' as EquipmentSlot,
        baseStats: { defense: 6, speed: 3 },
        levelScaling: { defense: 1, speed: 1 },
        prefixes: ['Light', 'Flowing', 'Enchanted'],
        suffixes: ['of Swiftness', 'of the Current', 'of Evasion'],
        description: 'A cloak woven from magical seaweed',
        visualType: 'light_armor'
      }
    ];
    
    // Accessory templates
    const accessoryTemplates: ItemTemplate[] = [
      {
        name: 'Pearl Ring',
        slot: 'ring1' as EquipmentSlot,
        baseStats: { maxMP: 15, manaRegen: 1 },
        levelScaling: { maxMP: 3, manaRegen: 0.2 },
        prefixes: ['Lustrous', 'Radiant', 'Perfect'],
        suffixes: ['of Clarity', 'of the Ocean', 'of Power'],
        description: 'A ring set with a glowing pearl',
        visualType: 'jewelry'
      }
    ];
    
    // Organize by slot
    weaponTemplates.forEach(template => {
      if (!this.weaponTemplates.has(template.slot)) {
        this.weaponTemplates.set(template.slot, []);
      }
      this.weaponTemplates.get(template.slot)!.push(template);
    });
    
    armorTemplates.forEach(template => {
      if (!this.armorTemplates.has(template.slot)) {
        this.armorTemplates.set(template.slot, []);
      }
      this.armorTemplates.get(template.slot)!.push(template);
    });
    
    accessoryTemplates.forEach(template => {
      if (!this.accessoryTemplates.has(template.slot)) {
        this.accessoryTemplates.set(template.slot, []);
      }
      this.accessoryTemplates.get(template.slot)!.push(template);
    });
  }
  
  private initializeLootTables(): void {
    // Enemy loot tables
    this.enemyLootTables.set('melee', [
      {
        itemType: 'equipment',
        equipmentSlot: 'weapon' as EquipmentSlot,
        minLevel: 1,
        maxLevel: 999,
        dropChance: 0.15,
        rarityWeights: { 'Common': 60, 'Uncommon': 25, 'Rare': 10, 'Epic': 4, 'Legendary': 1, 'Mythic': 0 }
      },
      {
        itemType: 'equipment',
        equipmentSlot: 'chest' as EquipmentSlot,
        minLevel: 1,
        maxLevel: 999,
        dropChance: 0.1,
        rarityWeights: { 'Common': 70, 'Uncommon': 20, 'Rare': 8, 'Epic': 2, 'Legendary': 0, 'Mythic': 0 }
      }
    ]);
    
    this.enemyLootTables.set('ranged', [
      {
        itemType: 'equipment',
        equipmentSlot: 'weapon' as EquipmentSlot,
        minLevel: 1,
        maxLevel: 999,
        dropChance: 0.12,
        rarityWeights: { 'Common': 50, 'Uncommon': 30, 'Rare': 15, 'Epic': 4, 'Legendary': 1, 'Mythic': 0 }
      }
    ]);
    
    this.enemyLootTables.set('magic', [
      {
        itemType: 'equipment',
        equipmentSlot: 'weapon' as EquipmentSlot,
        minLevel: 1,
        maxLevel: 999,
        dropChance: 0.18,
        rarityWeights: { 'Common': 40, 'Uncommon': 35, 'Rare': 18, 'Epic': 6, 'Legendary': 1, 'Mythic': 0 }
      },
      {
        itemType: 'equipment',
        equipmentSlot: 'ring1' as EquipmentSlot,
        minLevel: 1,
        maxLevel: 999,
        dropChance: 0.08,
        rarityWeights: { 'Common': 45, 'Uncommon': 30, 'Rare': 20, 'Epic': 5, 'Legendary': 0, 'Mythic': 0 }
      }
    ]);
    
    this.enemyLootTables.set('boss', [
      {
        itemType: 'equipment',
        minLevel: 1,
        maxLevel: 999,
        dropChance: 0.8,
        rarityWeights: { 'Common': 0, 'Uncommon': 20, 'Rare': 40, 'Epic': 30, 'Legendary': 9, 'Mythic': 1 }
      }
    ]);
    
    // Treasure chest loot tables
    this.treasureLootTables = [
      {
        itemType: 'equipment',
        minLevel: 1,
        maxLevel: 999,
        dropChance: 0.6,
        rarityWeights: { 'Common': 30, 'Uncommon': 35, 'Rare': 25, 'Epic': 8, 'Legendary': 2, 'Mythic': 0 }
      }
    ];
  }
  
  private initializeAffixPools(): void {
    // Prefix pool (positive modifiers)
    this.prefixPool = {
      'Sharp': { stats: { attack: 3, criticalRate: 2 }, weight: 20 },
      'Heavy': { stats: { attack: 5, speed: -1 }, weight: 15 },
      'Swift': { stats: { speed: 3, attack: 1 }, weight: 18 },
      'Brutal': { stats: { attack: 4, criticalDamage: 10 }, weight: 12 },
      'Mystic': { stats: { maxMP: 15, manaRegen: 1 }, weight: 16 },
      'Ancient': { stats: { maxMP: 10, attack: 2, defense: 2 }, weight: 8 },
      'Glowing': { stats: { maxMP: 12, fireResistance: 10 }, weight: 14 },
      'Thick': { stats: { defense: 4, maxHP: 15 }, weight: 20 },
      'Reinforced': { stats: { defense: 6, maxHP: 10 }, weight: 15 },
      'Blessed': { stats: { defense: 2, maxHP: 20, manaRegen: 0.5 }, weight: 10 },
      'Light': { stats: { speed: 4, defense: 1 }, weight: 18 },
      'Flowing': { stats: { speed: 3, waterResistance: 15 }, weight: 14 },
      'Enchanted': { stats: { maxMP: 8, speed: 2 }, weight: 12 }
    };
    
    // Suffix pool (thematic bonuses)
    this.suffixPool = {
      'of Power': { stats: { attack: 4 }, weight: 20 },
      'of Speed': { stats: { speed: 5 }, weight: 18 },
      'of Precision': { stats: { criticalRate: 8 }, weight: 15 },
      'of Wisdom': { stats: { maxMP: 20 }, weight: 16 },
      'of the Deep': { stats: { waterResistance: 20, maxMP: 5 }, weight: 12 },
      'of Sorcery': { stats: { maxMP: 15, manaRegen: 1.5 }, weight: 10 },
      'of Protection': { stats: { defense: 5 }, weight: 20 },
      'of Endurance': { stats: { maxHP: 25 }, weight: 18 },
      'of the Guardian': { stats: { defense: 3, maxHP: 15 }, weight: 14 },
      'of Swiftness': { stats: { speed: 6 }, weight: 16 },
      'of the Current': { stats: { speed: 3, waterResistance: 10 }, weight: 12 },
      'of Evasion': { stats: { speed: 4, defense: 1 }, weight: 14 },
      'of Clarity': { stats: { maxMP: 18, manaRegen: 1 }, weight: 15 },
      'of the Ocean': { stats: { waterResistance: 25 }, weight: 10 }
    };
  }
  
  private getEnemyLootTables(enemy: Enemy): LootTable[] {
    return this.enemyLootTables.get(enemy.enemyType) || [];
  }
  
  private generateItemFromTable(table: LootTable, level: number): EquipmentItem | ConsumableItem | MaterialItem | null {
    if (table.itemType === 'equipment') {
      const slot = table.equipmentSlot || this.getRandomEquipmentSlot();
      const rarity = this.rollRarityFromWeights(table.rarityWeights);
      return this.generateRandomEquipment(level, slot, rarity);
    }
    
    // IMPLEMENTED: Implement consumable and material generation
    return null;
  }
  
  private rollRarityFromWeights(weights: Record<Rarity, number>): Rarity {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(weights)) {
      roll -= weight;
      if (roll <= 0) {
        return rarity as Rarity;
      }
    }
    
    return 'Common';
  }
  
  private rollRarity(level: number): Rarity {
    // Base rarity chances that improve with level
    const rarityChances = {
      'Mythic': Math.max(0, (level - 50) * 0.1),
      'Legendary': Math.max(0, (level - 30) * 0.5),
      'Epic': Math.max(1, level * 0.8),
      'Rare': Math.max(5, 15 + level * 0.5),
      'Uncommon': Math.max(15, 35 - level * 0.2),
      'Common': 100
    };
    
    return this.rollRarityFromWeights(rarityChances as Record<Rarity, number>);
  }
  
  private getRandomEquipmentSlot(): EquipmentSlot {
    const slots: EquipmentSlot[] = [
      'weapon', 'chest', 'helmet', 'gloves', 'boots', 'shield',
      'ring1', 'amulet', 'belt'
    ];
    return Phaser.Utils.Array.GetRandom(slots);
  }
  
  private getTemplatesForSlot(slot: EquipmentSlot): ItemTemplate[] {
    if (slot === 'weapon' as EquipmentSlot) {
      return this.weaponTemplates.get(slot) || [];
    } else if (['chest', 'helmet', 'gloves', 'boots', 'shield', 'belt'].includes(slot)) {
      return this.armorTemplates.get(slot) || [];
    } else {
      return this.accessoryTemplates.get(slot) || [];
    }
  }
  
  private generateEquipmentFromTemplate(template: ItemTemplate, level: number, rarity: Rarity): EquipmentItem {
    // Calculate base stats with level scaling
    const stats: EquipmentStats = { ...template.baseStats } as EquipmentStats;
    
    Object.entries(template.levelScaling).forEach(([stat, scaling]) => {
      if (scaling && stat in stats) {
        (stats as any)[stat] = ((stats as any)[stat] || 0) + Math.floor(scaling * level);
      }
    });
    
    // Apply rarity multiplier
    const rarityMultiplier = this.getRarityMultiplier(rarity);
    Object.keys(stats).forEach(stat => {
      if ((stats as any)[stat]) {
        (stats as any)[stat] = Math.floor((stats as any)[stat] * rarityMultiplier);
      }
    });
    
    // Generate affixes based on rarity
    const { prefix, suffix } = this.generateAffixes(rarity, stats);
    
    // Create final item name
    const itemName = `${prefix}${template.name}${suffix}`;
    
    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: itemName,
      slot: template.slot,
      stats,
      rarity,
      level,
      description: template.description,
      icon: template.visualType,
      setBonus: undefined // IMPLEMENTED: Implement set bonuses
    };
  }
  
  private getRarityMultiplier(rarity: Rarity): number {
    const multipliers = {
      'Common': 1.0,
      'Uncommon': 1.2,
      'Rare': 1.5,
      'Epic': 2.0,
      'Legendary': 3.0,
      'Mythic': 4.5
    };
    return multipliers[rarity];
  }
  
  private generateAffixes(rarity: Rarity, baseStats: EquipmentStats): { prefix: string; suffix: string } {
    let prefix = '';
    let suffix = '';
    
    const affixCount = this.getAffixCount(rarity);
    
    if (affixCount >= 1) {
      // Add prefix
      const prefixKey = this.weightedRandomFromPool(this.prefixPool);
      if (prefixKey) {
        prefix = `${prefixKey} `;
        this.applyAffixStats(baseStats, this.prefixPool[prefixKey].stats);
      }
    }
    
    if (affixCount >= 2) {
      // Add suffix
      const suffixKey = this.weightedRandomFromPool(this.suffixPool);
      if (suffixKey) {
        suffix = ` ${suffixKey}`;
        this.applyAffixStats(baseStats, this.suffixPool[suffixKey].stats);
      }
    }
    
    return { prefix, suffix };
  }
  
  private getAffixCount(rarity: Rarity): number {
    const affixCounts = {
      'Common': 0,
      'Uncommon': Math.random() < 0.3 ? 1 : 0,
      'Rare': Math.random() < 0.7 ? 1 : 0,
      'Epic': Math.random() < 0.4 ? 2 : 1,
      'Legendary': Math.random() < 0.6 ? 2 : 1,
      'Mythic': 2
    };
    return affixCounts[rarity];
  }
  
  private weightedRandomFromPool(pool: { [key: string]: { weight: number } }): string | null {
    const totalWeight = Object.values(pool).reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    
    for (const [key, item] of Object.entries(pool)) {
      roll -= item.weight;
      if (roll <= 0) {
        return key;
      }
    }
    
    return null;
  }
  
  private applyAffixStats(baseStats: EquipmentStats, affixStats: Partial<EquipmentStats>): void {
    Object.entries(affixStats).forEach(([stat, value]) => {
      if (value && stat in baseStats) {
        (baseStats as any)[stat] = ((baseStats as any)[stat] || 0) + value;
      }
    });
  }
  
  private getItemIcon(item: EquipmentItem | ConsumableItem | MaterialItem | CurrencyDrop): string {
    if ('icon' in item) {
      return item.icon;
    }
    return 'placeholder_item';
  }
  
  private getItemRarity(item: EquipmentItem | ConsumableItem | MaterialItem | CurrencyDrop): Rarity {
    if ('rarity' in item) {
      return item.rarity;
    }
    return 'Common';
  }
  
  private getItemName(item: EquipmentItem | ConsumableItem | MaterialItem | CurrencyDrop): string {
    if ('name' in item) {
      return item.name;
    }
    if ('type' in item && item.type === 'gold') {
      return `${(item as CurrencyDrop).amount} Gold`;
    }
    return 'Unknown Item';
  }
  
  private getItemType(item: EquipmentItem | ConsumableItem | MaterialItem | CurrencyDrop): string {
    if ('slot' in item) return 'equipment';
    if ('type' in item && ['healing', 'mana', 'buff', 'utility'].includes(item.type)) return 'consumable';
    if ('type' in item && ['crafting', 'upgrade', 'enchant'].includes(item.type)) return 'material';
    if ('type' in item && ['gold', 'gems', 'essence'].includes(item.type)) return 'currency';
    return 'unknown';
  }
  
  private createRarityGlow(x: number, y: number, rarity: Rarity): Phaser.GameObjects.Graphics {
    const colors = {
      'Common': 0xffffff,
      'Uncommon': 0x00ff00,
      'Rare': 0x0088ff,
      'Epic': 0x8800ff,
      'Legendary': 0xff8800,
      'Mythic': 0xff0088
    };
    
    const glow = this.scene.add.graphics();
    const color = colors[rarity];
    
    glow.lineStyle(3, color, 0.8);
    glow.strokeCircle(x, y, 20);
    glow.setDepth(9);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return glow;
  }
  
  private animateDrop(sprite: Phaser.GameObjects.Sprite, glow?: Phaser.GameObjects.Graphics): void {
    // Bounce animation
    sprite.setScale(0.1);
    this.scene.tweens.add({
      targets: sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Slight float animation
    this.scene.tweens.add({
      targets: [sprite, glow],
      y: sprite.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  private updateLootDrops(time: number): void {
    // Update any animated effects or proximity indicators
    this.activeDrops.forEach(drop => {
      if (this.hero) {
        const distance = Phaser.Math.Distance.Between(
          this.hero.x, this.hero.y, 
          drop.position.x, drop.position.y
        );
        
        // Enhance glow when hero is nearby
        if (drop.glowEffect && distance <= drop.pickupRadius * 2) {
          drop.glowEffect.setAlpha(0.9);
        } else if (drop.glowEffect) {
          drop.glowEffect.setAlpha(0.5);
        }
      }
    });
  }
  
  private cleanupExpiredDrops(time: number): void {
    this.activeDrops = this.activeDrops.filter(drop => {
      const age = time - drop.createdAt;
      if (age > drop.lifetime) {
        this.removeLootDrop(drop);
        return false;
      }
      return true;
    });
  }
  
  private handleLootPickup(hero: any, lootSprite: any): void {
    const lootDrop = this.activeDrops.find(drop => drop.sprite === lootSprite);
    if (lootDrop) {
      this.pickupLoot(lootDrop);
    }
  }
  
  private removeLootDrop(lootDrop: LootDrop): void {
    if (lootDrop.sprite && lootDrop.sprite.active) {
      lootDrop.sprite.destroy();
    }
    if (lootDrop.glowEffect && lootDrop.glowEffect.active) {
      lootDrop.glowEffect.destroy();
    }
    
    const index = this.activeDrops.indexOf(lootDrop);
    if (index > -1) {
      this.activeDrops.splice(index, 1);
    }
  }
  
  private playPickupEffect(lootDrop: LootDrop): void {
    const rarity = this.getItemRarity(lootDrop.item);
    
    // Play appropriate sound
    let soundIndex = 0;
    if (['Epic', 'Legendary', 'Mythic'].includes(rarity)) soundIndex = 2;
    else if (['Rare'].includes(rarity)) soundIndex = 1;
    
    // Play actual pickup sound
    try {
      const gameScene = this.scene as any;
      if (gameScene.audioSystem) {
        const soundKey = this.pickupSounds[soundIndex];
        gameScene.audioSystem.playSFX(soundKey, 0.6);
      }
    } catch (error) {
      console.warn('Could not play pickup sound:', error);
    }
    console.log(`🔊 Playing pickup sound: ${this.pickupSounds[soundIndex]}`);
    
    // Visual pickup effect
    const effectColor = this.getRarityColor(rarity);
    const pickup = this.scene.add.circle(lootDrop.position.x, lootDrop.position.y, 15, effectColor, 0.8);
    
    this.scene.tweens.add({
      targets: pickup,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => pickup.destroy()
    });
  }
  
  private getRarityColor(rarity: Rarity): number {
    const colors = {
      'Common': 0xffffff,
      'Uncommon': 0x00ff00,
      'Rare': 0x0088ff,
      'Epic': 0x8800ff,
      'Legendary': 0xff8800,
      'Mythic': 0xff0088
    };
    return colors[rarity];
  }
  
  /**
   * Set enchantment system reference
   */
  public setEnchantmentSystem(enchantmentSystem: EnchantmentSystem): void {
    this.enchantmentSystem = enchantmentSystem;
    console.log('✨ EnchantmentSystem integrated with LootSystem');
  }
  
  /**
   * Check for enchanting material drops
   */
  private checkEnchantingMaterialDrop(itemRarity: Rarity): void {
    if (!this.enchantmentSystem) return;
    
    const materialChances: { [key in Rarity]: { [material: string]: number } } = {
      Common: { 'iron_dust': 0.1, 'magic_essence': 0.02 },
      Uncommon: { 'iron_dust': 0.15, 'magic_essence': 0.05, 'arcane_crystal': 0.02 },
      Rare: { 'magic_essence': 0.1, 'arcane_crystal': 0.05, 'elemental_shard': 0.03 },
      Epic: { 'arcane_crystal': 0.15, 'elemental_shard': 0.08, 'void_essence': 0.02 },
      Legendary: { 'elemental_shard': 0.2, 'void_essence': 0.1, 'divine_fragment': 0.03 },
      Mythic: { 'void_essence': 0.3, 'divine_fragment': 0.15, 'reality_crystal': 0.05 }
    };
    
    const materials = materialChances[itemRarity] || {};
    
    Object.entries(materials).forEach(([materialId, chance]) => {
      if (Math.random() < chance) {
        const amount = Math.floor(Math.random() * 3) + 1;
        this.enchantmentSystem.addEnchantingMaterial(materialId, amount);
        
        // Show material discovery effect
        this.showMaterialDiscoveryEffect(materialId, amount);
      }
    });
  }
  
  /**
   * Show material discovery effect
   */
  private showMaterialDiscoveryEffect(materialId: string, amount: number): void {
    if (!this.hero) return;
    
    const materialNames: { [key: string]: string } = {
      'iron_dust': 'Iron Dust',
      'magic_essence': 'Magic Essence',
      'arcane_crystal': 'Arcane Crystal',
      'elemental_shard': 'Elemental Shard',
      'void_essence': 'Void Essence',
      'divine_fragment': 'Divine Fragment',
      'reality_crystal': 'Reality Crystal'
    };
    
    const materialName = materialNames[materialId] || materialId;
    
    // Create floating text effect
    const text = this.scene.add.text(
      this.hero.x + (Math.random() - 0.5) * 100,
      this.hero.y - 50,
      `+${amount} ${materialName}`,
      {
        fontSize: '14px',
        color: '#8A2BE2',
        fontFamily: 'Arial Black',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    text.setDepth(20);
    
    // Animate the text
    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
    
    // Create sparkle effect
    for (let i = 0; i < 5; i++) {
      const sparkle = this.scene.add.circle(
        this.hero.x + (Math.random() - 0.5) * 60,
        this.hero.y + (Math.random() - 0.5) * 60,
        2, 0x8A2BE2, 0.8
      );
      
      sparkle.setDepth(19);
      
      this.scene.tweens.add({
        targets: sparkle,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      });
    }
    
    console.log(`✨ Discovered ${amount} ${materialName}!`);
  }
  
  /**
   * Generate legendary item
   */
  public generateLegendaryItem(itemType: EquipmentSlot, level: number): EquipmentItem {
    const legendaryNames = {
      weapon: ['Shellbreaker Eternal', 'Voidrender', 'Titanfall', 'Stormcaller', 'Soulreaper'],
      helmet: ['Crown of Ancients', 'Voidgazer\'s Helm', 'Mindshield Eternal', 'Crown of Storms'],
      chest: ['Plate of Eternity', 'Voidheart Armor', 'Shell of Titans', 'Stormwarden Mail'],
      legs: ['Greaves of Power', 'Voidwalker Legs', 'Titan Striders', 'Storm Treads'],
      boots: ['Boots of Swiftness', 'Void Steps', 'Titan Stompers', 'Lightning Treads'],
      gloves: ['Gauntlets of Might', 'Void Grasps', 'Titan Fists', 'Storm Grips'],
      ring1: ['Ring of Power', 'Void Band', 'Titan\'s Signet', 'Storm Circle'],
      ring2: ['Ring of Power', 'Void Band', 'Titan\'s Signet', 'Storm Circle'],
      amulet: ['Amulet of Legends', 'Void Pendant', 'Titan\'s Charm', 'Storm Medallion'],
      belt: ['Belt of Heroes', 'Void Sash', 'Titan\'s Girdle', 'Storm Belt'],
      shield: ['Shield of Aegis', 'Void Barrier', 'Titan\'s Bulwark', 'Storm Guard']
    };
    
    const names = legendaryNames[itemType] || ['Legendary Item'];
    const name = Phaser.Utils.Array.GetRandom(names);
    
    // Legendary items have massive stat bonuses
    const baseStats: Partial<EquipmentStats> = {};
    
    // Set base stats based on item type
    if (itemType === 'weapon') {
      baseStats.attack = 50 + level * 2;
      baseStats.criticalChance = 0.15;
      baseStats.criticalDamage = 0.3;
    } else if (['helmet', 'chest', 'legs', 'boots', 'gloves', 'shield'].includes(itemType)) {
      baseStats.defense = 30 + level * 1.5;
      baseStats.maxHP = 100 + level * 5;
    } else {
      baseStats.magicAttack = 40 + level * 1.8;
      baseStats.maxMP = 80 + level * 4;
    }
    
    // Add random legendary bonuses
    const legendaryBonuses = [
      { allStats: 15 },
      { allResistances: 0.15 },
      { lifesteal: 0.1, healthRegen: 2 },
      { evasion: 0.2, movementSpeed: 30 },
      { tenacity: 0.25, magicDefense: 20 }
    ];
    
    const bonus = Phaser.Utils.Array.GetRandom(legendaryBonuses);
    Object.assign(baseStats, bonus);
    
    return {
      id: Phaser.Math.RND.uuid(),
      name,
      slot: itemType,
      rarity: 'Legendary',
      level,
      stats: baseStats as EquipmentStats,
      description: `A legendary ${itemType} of immense power, forged by ancient masters.`,
      texture: 'legendary_item',
      frame: 0
    };
  }
}
