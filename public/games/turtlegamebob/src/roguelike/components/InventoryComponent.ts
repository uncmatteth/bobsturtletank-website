/**
 * InventoryComponent - Manages entity inventory
 */

import { Component } from './Component';
import { Item } from '../items/Item';

export class InventoryComponent extends Component {
  private items: Item[] = [];
  private maxCapacity: number;
  
  constructor(maxCapacity: number) {
    super('inventory');
    this.maxCapacity = maxCapacity;
  }
  
  /**
   * Add an item to the inventory
   */
  public addItem(item: Item): boolean {
    // Check if inventory is full
    if (this.items.length >= this.maxCapacity) {
      return false;
    }
    
    // Check if item is stackable
    if (item.isStackable()) {
      const existingItem = this.items.find(i => 
        i.getName() === item.getName() && i.canStackWith(item)
      );
      
      if (existingItem) {
        existingItem.addToStack(item.getStackSize());
        
        if (this.entity) {
          this.entity['eventBus'].emit('item_stacked', {
            entity: this.entity,
            item: existingItem,
            amount: item.getStackSize()
          });
        }
        
        return true;
      }
    }
    
    // Add new item
    this.items.push(item);
    
    if (this.entity) {
      this.entity['eventBus'].emit('item_picked_up', {
        entity: this.entity,
        item: item
      });
    }
    
    return true;
  }
  
  /**
   * Remove an item from the inventory
   */
  public removeItem(item: Item): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) {
      return false;
    }
    
    this.items.splice(index, 1);
    
    if (this.entity) {
      this.entity['eventBus'].emit('item_removed', {
        entity: this.entity,
        item: item
      });
    }
    
    return true;
  }
  
  /**
   * Remove an item by name
   */
  public removeItemByName(name: string, amount: number = 1): boolean {
    const item = this.items.find(i => i.getName() === name);
    if (!item) {
      return false;
    }
    
    if (item.isStackable() && item.getStackSize() > amount) {
      item.removeFromStack(amount);
      return true;
    } else {
      return this.removeItem(item);
    }
  }
  
  /**
   * Get all items
   */
  public getItems(): Item[] {
    return [...this.items];
  }
  
  /**
   * Get items by type
   */
  public getItemsByType(type: string): Item[] {
    return this.items.filter(item => item.getType() === type);
  }
  
  /**
   * Find an item by name
   */
  public findItem(name: string): Item | null {
    return this.items.find(item => item.getName() === name) || null;
  }
  
  /**
   * Check if inventory contains an item
   */
  public hasItem(name: string, amount: number = 1): boolean {
    const item = this.findItem(name);
    if (!item) {
      return false;
    }
    
    return item.isStackable() ? item.getStackSize() >= amount : true;
  }
  
  /**
   * Get current capacity
   */
  public getCurrentCapacity(): number {
    return this.items.length;
  }
  
  /**
   * Get max capacity
   */
  public getMaxCapacity(): number {
    return this.maxCapacity;
  }
  
  /**
   * Check if inventory is full
   */
  public isFull(): boolean {
    return this.items.length >= this.maxCapacity;
  }
  
  /**
   * Get inventory weight
   */
  public getWeight(): number {
    return this.items.reduce((total, item) => total + item.getWeight(), 0);
  }
  
  /**
   * Sort inventory
   */
  public sortInventory(): void {
    this.items.sort((a, b) => {
      // Sort by type first, then by name
      if (a.getType() !== b.getType()) {
        return a.getType().localeCompare(b.getType());
      }
      return a.getName().localeCompare(b.getName());
    });
  }
  
  /**
   * Serialize component data
   */
  public serialize(): any {
    return {
      items: this.items.map(item => item.serialize()),
      maxCapacity: this.maxCapacity
    };
  }
  
  /**
   * Deserialize component data
   */
  public deserialize(data: any): void {
    this.maxCapacity = data.maxCapacity;
    this.items = data.items.map((itemData: any) => {
      // This would need to be implemented based on item types
      // For now, return a placeholder
      return Item.deserialize(itemData);
    });
  }
}
