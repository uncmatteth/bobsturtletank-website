/**
 * Equipment - Base class for equippable items
 */

import { Item, ItemType, ItemRarity } from './Item';
import { Entity } from '../entities/Entity';
import { EventBus } from '../events/EventBus';
import { EquipmentSlot } from '../components/EquipmentComponent';

interface EquipmentAppearance {
  char: string;
  fg: string;
  bg: string;
}

export abstract class Equipment extends Item {
  protected equipmentSlot: EquipmentSlot;
  protected attackBonus: number = 0;
  protected defenseBonus: number = 0;
  protected statBonuses: { [stat: string]: number } = {};
  protected statRequirements: { [stat: string]: number } = {};
  protected requiredLevel: number = 1;
  protected durability: number = 100;
  protected maxDurability: number = 100;
  protected setName: string | null = null;
  protected enchantments: string[] = [];
  
  constructor(
    eventBus: EventBus,
    name: string,
    itemType: ItemType,
    rarity: ItemRarity,
    value: number,
    weight: number,
    appearance: EquipmentAppearance,
    equipmentSlot: EquipmentSlot,
    description: string = ''
  ) {
    super(eventBus, name, itemType, rarity, value, weight, appearance, description);
    this.equipmentSlot = equipmentSlot;
  }
  
  /**
   * Get equipment slot
   */
  public getEquipmentSlot(): EquipmentSlot {
    return this.equipmentSlot;
  }
  
  /**
   * Get attack bonus
   */
  public getAttackBonus(): number {
    return this.attackBonus;
  }
  
  /**
   * Set attack bonus
   */
  public setAttackBonus(bonus: number): void {
    this.attackBonus = bonus;
  }
  
  /**
   * Get defense bonus
   */
  public getDefenseBonus(): number {
    return this.defenseBonus;
  }
  
  /**
   * Set defense bonus
   */
  public setDefenseBonus(bonus: number): void {
    this.defenseBonus = bonus;
  }
  
  /**
   * Get stat bonuses
   */
  public getStatBonuses(): { [stat: string]: number } {
    return { ...this.statBonuses };
  }
  
  /**
   * Add stat bonus
   */
  public addStatBonus(stat: string, bonus: number): void {
    this.statBonuses[stat] = (this.statBonuses[stat] || 0) + bonus;
  }
  
  /**
   * Get stat requirements
   */
  public getStatRequirements(): { [stat: string]: number } {
    return { ...this.statRequirements };
  }
  
  /**
   * Set stat requirement
   */
  public setStatRequirement(stat: string, requirement: number): void {
    this.statRequirements[stat] = requirement;
  }
  
  /**
   * Get required level
   */
  public getRequiredLevel(): number {
    return this.requiredLevel;
  }
  
  /**
   * Set required level
   */
  public setRequiredLevel(level: number): void {
    this.requiredLevel = level;
  }
  
  /**
   * Get current durability
   */
  public getDurability(): number {
    return this.durability;
  }
  
  /**
   * Get max durability
   */
  public getMaxDurability(): number {
    return this.maxDurability;
  }
  
  /**
   * Get durability percentage
   */
  public getDurabilityPercentage(): number {
    return this.durability / this.maxDurability;
  }
  
  /**
   * Damage the equipment
   */
  public damage(amount: number): void {
    this.durability = Math.max(0, this.durability - amount);
    
    if (this.durability <= 0) {
      this.eventBus.emit('equipment_broken', {
        equipment: this
      });
    }
  }
  
  /**
   * Repair the equipment
   */
  public repair(amount: number): void {
    this.durability = Math.min(this.maxDurability, this.durability + amount);
  }
  
  /**
   * Check if equipment is broken
   */
  public isBroken(): boolean {
    return this.durability <= 0;
  }
  
  /**
   * Get set name
   */
  public getSetName(): string | null {
    return this.setName;
  }
  
  /**
   * Set set name
   */
  public setSetName(setName: string): void {
    this.setName = setName;
  }
  
  /**
   * Get enchantments
   */
  public getEnchantments(): string[] {
    return [...this.enchantments];
  }
  
  /**
   * Add enchantment
   */
  public addEnchantment(enchantment: string): void {
    if (!this.enchantments.includes(enchantment)) {
      this.enchantments.push(enchantment);
    }
  }
  
  /**
   * Remove enchantment
   */
  public removeEnchantment(enchantment: string): void {
    const index = this.enchantments.indexOf(enchantment);
    if (index !== -1) {
      this.enchantments.splice(index, 1);
    }
  }
  
  /**
   * Check if has enchantment
   */
  public hasEnchantment(enchantment: string): boolean {
    return this.enchantments.includes(enchantment);
  }
  
  /**
   * Called when equipment is equipped
   */
  public onEquip(): void {
    // Override in subclasses for special effects
  }
  
  /**
   * Called when equipment is unequipped
   */
  public onUnequip(): void {
    // Override in subclasses for special effects
  }
  
  /**
   * Use equipment (equip it)
   */
  public use(user: Entity): boolean {
    const equipmentComponent = user.getComponent('equipment');
    if (!equipmentComponent) {
      return false;
    }
    
    // Check if can equip
    if (!(equipmentComponent as any).canEquip(this)) {
      this.eventBus.emit('message', {
        text: 'You cannot equip this item.'
      });
      return false;
    }
    
    // Equip the item
    const previousItem = (equipmentComponent as any).equip(this);
    
    // Add previous item back to inventory if exists
    if (previousItem) {
      const inventoryComponent = user.getComponent('inventory');
      if (inventoryComponent) {
        (inventoryComponent as any).addItem(previousItem);
      }
    }
    
    this.eventBus.emit('message', {
      text: `You equipped ${this.getName()}.`
    });
    
    return true;
  }
  
  /**
   * Get enhanced tooltip
   */
  public getTooltip(): string {
    let tooltip = super.getTooltip();
    
    tooltip += `\nSlot: ${this.equipmentSlot}`;
    tooltip += `\nRequired Level: ${this.requiredLevel}`;
    
    if (this.attackBonus > 0) {
      tooltip += `\nAttack: +${this.attackBonus}`;
    }
    
    if (this.defenseBonus > 0) {
      tooltip += `\nDefense: +${this.defenseBonus}`;
    }
    
    // Stat bonuses
    for (const stat in this.statBonuses) {
      const bonus = this.statBonuses[stat];
      if (bonus > 0) {
        tooltip += `\n${stat}: +${bonus}`;
      } else if (bonus < 0) {
        tooltip += `\n${stat}: ${bonus}`;
      }
    }
    
    // Stat requirements
    const reqKeys = Object.keys(this.statRequirements);
    if (reqKeys.length > 0) {
      tooltip += '\nRequirements:';
      for (const stat of reqKeys) {
        tooltip += `\n  ${stat}: ${this.statRequirements[stat]}`;
      }
    }
    
    // Durability
    tooltip += `\nDurability: ${this.durability}/${this.maxDurability}`;
    
    // Set bonus
    if (this.setName) {
      tooltip += `\nSet: ${this.setName}`;
    }
    
    // Enchantments
    if (this.enchantments.length > 0) {
      tooltip += '\nEnchantments:';
      for (const enchantment of this.enchantments) {
        tooltip += `\n  ${enchantment}`;
      }
    }
    
    return tooltip;
  }
  
  /**
   * Serialize equipment data
   */
  public serialize(): any {
    const baseData = super.serialize();
    return {
      ...baseData,
      equipmentSlot: this.equipmentSlot,
      attackBonus: this.attackBonus,
      defenseBonus: this.defenseBonus,
      statBonuses: this.statBonuses,
      statRequirements: this.statRequirements,
      requiredLevel: this.requiredLevel,
      durability: this.durability,
      maxDurability: this.maxDurability,
      setName: this.setName,
      enchantments: this.enchantments
    };
  }
  
  /**
   * Deserialize equipment data
   */
  public deserialize(data: any): void {
    super.deserialize(data);
    this.equipmentSlot = data.equipmentSlot;
    this.attackBonus = data.attackBonus;
    this.defenseBonus = data.defenseBonus;
    this.statBonuses = data.statBonuses || {};
    this.statRequirements = data.statRequirements || {};
    this.requiredLevel = data.requiredLevel;
    this.durability = data.durability;
    this.maxDurability = data.maxDurability;
    this.setName = data.setName;
    this.enchantments = data.enchantments || [];
  }
  
  /**
   * Static method to deserialize equipment
   */
  public static deserialize(data: any): Equipment {
    // This would need to be implemented based on equipment types
    throw new Error('Equipment.deserialize must be implemented for specific equipment types');
  }
}
