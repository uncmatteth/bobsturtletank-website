/**
 * Item - Base class for all items in the game
 */

import { Entity } from '../entities/Entity';
import { EventBus } from '../events/EventBus';

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'misc' | 'key' | 'treasure';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface ItemAppearance {
  char: string;
  fg: string;
  bg: string;
}

export abstract class Item extends Entity {
  protected itemType: ItemType;
  protected rarity: ItemRarity;
  protected value: number;
  protected weight: number;
  protected stackable: boolean = false;
  protected stackSize: number = 1;
  protected maxStackSize: number = 1;
  protected description: string;
  protected identified: boolean = true;
  protected cursed: boolean = false;
  
  constructor(
    eventBus: EventBus,
    name: string,
    itemType: ItemType,
    rarity: ItemRarity,
    value: number,
    weight: number,
    appearance: ItemAppearance,
    description: string = ''
  ) {
    super(eventBus, name, 0, 0, appearance);
    this.itemType = itemType;
    this.rarity = rarity;
    this.value = value;
    this.weight = weight;
    this.description = description;
    this.blocking = false;
    this.renderOrder = 2; // Items render below entities
  }
  
  /**
   * Get item type
   */
  public getType(): ItemType {
    return this.itemType;
  }
  
  /**
   * Get item rarity
   */
  public getRarity(): ItemRarity {
    return this.rarity;
  }
  
  /**
   * Get item value
   */
  public getValue(): number {
    return this.value;
  }
  
  /**
   * Get item weight
   */
  public getWeight(): number {
    return this.weight * this.stackSize;
  }
  
  /**
   * Get item description
   */
  public getDescription(): string {
    return this.description;
  }
  
  /**
   * Check if item is stackable
   */
  public isStackable(): boolean {
    return this.stackable;
  }
  
  /**
   * Get current stack size
   */
  public getStackSize(): number {
    return this.stackSize;
  }
  
  /**
   * Get max stack size
   */
  public getMaxStackSize(): number {
    return this.maxStackSize;
  }
  
  /**
   * Add to stack
   */
  public addToStack(amount: number): number {
    const canAdd = Math.min(amount, this.maxStackSize - this.stackSize);
    this.stackSize += canAdd;
    return amount - canAdd; // Return overflow
  }
  
  /**
   * Remove from stack
   */
  public removeFromStack(amount: number): number {
    const canRemove = Math.min(amount, this.stackSize);
    this.stackSize -= canRemove;
    return canRemove;
  }
  
  /**
   * Check if can stack with another item
   */
  public canStackWith(other: Item): boolean {
    return (
      this.stackable &&
      other.stackable &&
      this.getName() === other.getName() &&
      this.itemType === other.itemType &&
      this.rarity === other.rarity
    );
  }
  
  /**
   * Check if item is identified
   */
  public isIdentified(): boolean {
    return this.identified;
  }
  
  /**
   * Identify the item
   */
  public identify(): void {
    this.identified = true;
  }
  
  /**
   * Check if item is cursed
   */
  public isCursed(): boolean {
    return this.cursed;
  }
  
  /**
   * Set cursed status
   */
  public setCursed(cursed: boolean): void {
    this.cursed = cursed;
  }
  
  /**
   * Use the item
   */
  public abstract use(user: Entity): boolean;
  
  /**
   * Get item tooltip text
   */
  public getTooltip(): string {
    let tooltip = this.getName();
    
    if (!this.identified) {
      tooltip = `Unidentified ${this.itemType}`;
    }
    
    tooltip += `\nRarity: ${this.rarity}`;
    tooltip += `\nValue: ${this.value} gold`;
    tooltip += `\nWeight: ${this.weight}`;
    
    if (this.stackable && this.stackSize > 1) {
      tooltip += ` (x${this.stackSize})`;
    }
    
    if (this.description) {
      tooltip += `\n\n${this.description}`;
    }
    
    if (this.cursed && this.identified) {
      tooltip += '\n\nThis item is cursed!';
    }
    
    return tooltip;
  }
  
  /**
   * Get rarity color
   */
  public getRarityColor(): string {
    switch (this.rarity) {
      case 'common': return '#FFFFFF';
      case 'uncommon': return '#00FF00';
      case 'rare': return '#0080FF';
      case 'epic': return '#8000FF';
      case 'legendary': return '#FF8000';
      default: return '#FFFFFF';
    }
  }
  
  /**
   * Items don't act
   */
  public act(): void {
    // Items don't have AI
  }
  
  /**
   * Items are not hostile
   */
  public isHostile(): boolean {
    return false;
  }
  
  /**
   * Items cannot die
   */
  public isDead(): boolean {
    return false;
  }
  
  /**
   * Serialize item data
   */
  public serialize(): any {
    const baseData = super.serialize();
    return {
      ...baseData,
      itemType: this.itemType,
      rarity: this.rarity,
      value: this.value,
      weight: this.weight,
      stackable: this.stackable,
      stackSize: this.stackSize,
      maxStackSize: this.maxStackSize,
      description: this.description,
      identified: this.identified,
      cursed: this.cursed
    };
  }
  
  /**
   * Deserialize item data
   */
  public deserialize(data: any): void {
    super.deserialize(data);
    this.itemType = data.itemType;
    this.rarity = data.rarity;
    this.value = data.value;
    this.weight = data.weight;
    this.stackable = data.stackable;
    this.stackSize = data.stackSize;
    this.maxStackSize = data.maxStackSize;
    this.description = data.description;
    this.identified = data.identified;
    this.cursed = data.cursed;
  }
  
  /**
   * Static method to deserialize any item
   */
  public static deserialize(data: any): Item {
    // This would need to be implemented based on item types
    // For now, throw an error to indicate it needs implementation
    throw new Error('Item.deserialize must be implemented for specific item types');
  }
}
