/**
 * EquipmentComponent - Manages entity equipment slots
 */

import { Component } from './Component';
import { Equipment } from '../items/Equipment';

export type EquipmentSlot = 
  'weapon' | 'shield' | 'helmet' | 'armor' | 'gloves' | 'boots' | 
  'ring1' | 'ring2' | 'amulet' | 'cloak';

export class EquipmentComponent extends Component {
  private equipment: Map<EquipmentSlot, Equipment> = new Map();
  
  constructor() {
    super('equipment');
  }
  
  /**
   * Equip an item
   */
  public equip(item: Equipment): Equipment | null {
    const slot = item.getEquipmentSlot();
    const previousItem = this.equipment.get(slot) || null;
    
    // Unequip previous item if exists
    if (previousItem) {
      this.unequip(slot);
    }
    
    // Equip new item
    this.equipment.set(slot, item);
    item.onEquip();
    
    if (this.entity) {
      this.entity['eventBus'].emit('item_equipped', {
        entity: this.entity,
        item: item,
        slot: slot
      });
    }
    
    return previousItem;
  }
  
  /**
   * Unequip an item from a slot
   */
  public unequip(slot: EquipmentSlot): Equipment | null {
    const item = this.equipment.get(slot);
    if (!item) {
      return null;
    }
    
    this.equipment.delete(slot);
    item.onUnequip();
    
    if (this.entity) {
      this.entity['eventBus'].emit('item_unequipped', {
        entity: this.entity,
        item: item,
        slot: slot
      });
    }
    
    return item;
  }
  
  /**
   * Get equipped item in a slot
   */
  public getEquipped(slot: EquipmentSlot): Equipment | null {
    return this.equipment.get(slot) || null;
  }
  
  /**
   * Get all equipped items
   */
  public getAllEquipped(): Map<EquipmentSlot, Equipment> {
    return new Map(this.equipment);
  }
  
  /**
   * Check if a slot is occupied
   */
  public isSlotOccupied(slot: EquipmentSlot): boolean {
    return this.equipment.has(slot);
  }
  
  /**
   * Get total attack bonus from equipment
   */
  public getAttackBonus(): number {
    let bonus = 0;
    
    this.equipment.forEach(item => {
      bonus += item.getAttackBonus();
    });
    
    return bonus;
  }
  
  /**
   * Get total defense bonus from equipment
   */
  public getDefenseBonus(): number {
    let bonus = 0;
    
    this.equipment.forEach(item => {
      bonus += item.getDefenseBonus();
    });
    
    return bonus;
  }
  
  /**
   * Get stat bonuses from equipment
   */
  public getStatBonuses(): { [stat: string]: number } {
    const bonuses: { [stat: string]: number } = {};
    
    this.equipment.forEach(item => {
      const itemBonuses = item.getStatBonuses();
      for (const stat in itemBonuses) {
        bonuses[stat] = (bonuses[stat] || 0) + itemBonuses[stat];
      }
    });
    
    return bonuses;
  }
  
  /**
   * Get total equipment weight
   */
  public getTotalWeight(): number {
    let weight = 0;
    
    this.equipment.forEach(item => {
      weight += item.getWeight();
    });
    
    return weight;
  }
  
  /**
   * Get equipment value
   */
  public getTotalValue(): number {
    let value = 0;
    
    this.equipment.forEach(item => {
      value += item.getValue();
    });
    
    return value;
  }
  
  /**
   * Check if can equip item (requirements check)
   */
  public canEquip(item: Equipment): boolean {
    if (!this.entity) {
      return false;
    }
    
    // Check level requirement
    const playerLevel = this.entity.getComponent('experience');
    if (playerLevel && (playerLevel as any).getLevel() < item.getRequiredLevel()) {
      return false;
    }
    
    // Check stat requirements
    const statsComponent = this.entity.getComponent('stats');
    if (statsComponent) {
      const requirements = item.getStatRequirements();
      for (const stat in requirements) {
        if ((statsComponent as any).getStat(stat) < requirements[stat]) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get equipment set bonuses
   */
  public getSetBonuses(): { [setName: string]: number } {
    const setBonuses: { [setName: string]: number } = {};
    const setCounts: { [setName: string]: number } = {};
    
    // Count items in each set
    this.equipment.forEach(item => {
      const setName = item.getSetName();
      if (setName) {
        setCounts[setName] = (setCounts[setName] || 0) + 1;
      }
    });
    
    // Calculate set bonuses
    for (const setName in setCounts) {
      const count = setCounts[setName];
      if (count >= 2) {
        setBonuses[setName] = count;
      }
    }
    
    return setBonuses;
  }
  
  /**
   * Serialize component data
   */
  public serialize(): any {
    const serializedEquipment: { [slot: string]: any } = {};
    
    this.equipment.forEach((item, slot) => {
      serializedEquipment[slot] = item.serialize();
    });
    
    return {
      equipment: serializedEquipment
    };
  }
  
  /**
   * Deserialize component data
   */
  public deserialize(data: any): void {
    this.equipment.clear();
    
    for (const slot in data.equipment) {
      const itemData = data.equipment[slot];
      const item = Equipment.deserialize(itemData);
      if (item) {
        this.equipment.set(slot as EquipmentSlot, item);
      }
    }
  }
}
