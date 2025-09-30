/**
 * Inventory System - Industry-Standard UI and Logic
 * 
 * Uses Rex UI for professional interface components
 * Integrates with Zustand store for state management
 */

import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import type { InventoryItem } from '../stores/gameStore';
import _ from 'lodash';

// ============================================================================
// INTERFACES
// ============================================================================

interface InventorySlot {
  x: number;
  y: number;
  width: number;
  height: number;
  item?: InventoryItem;
  container?: any; // Rex UI container
  background?: Phaser.GameObjects.Rectangle;
  sprite?: Phaser.GameObjects.Sprite;
  quantityText?: Phaser.GameObjects.Text;
}

interface InventoryConfig {
  slotsPerRow: number;
  totalSlots: number;
  slotSize: number;
  slotPadding: number;
  backgroundColor: number;
  borderColor: number;
  highlightColor: number;
}

// ============================================================================
// INVENTORY SYSTEM CLASS
// ============================================================================

export class InventorySystem {
  private scene: Phaser.Scene;
  private rexUI: any;
  private gameStore: any;
  
  // UI Components
  private inventoryPanel?: any;
  private slots: InventorySlot[] = [];
  private draggedItem?: { item: InventoryItem; slotIndex: number };
  private contextMenu?: any;
  private tooltip?: any;
  
  // Configuration
  private config: InventoryConfig = {
    slotsPerRow: 8,
    totalSlots: 40,
    slotSize: 48,
    slotPadding: 4,
    backgroundColor: 0x2c3e50,
    borderColor: 0x34495e,
    highlightColor: 0x3498db
  };
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.rexUI = (scene as any).rexUI;
    this.gameStore = useGameStore.getState();
    
    // Subscribe to store changes
    useGameStore.subscribe(
      (state) => state.inventoryVisible,
      (visible) => this.toggleVisibility(visible)
    );
    
    useGameStore.subscribe(
      (state) => state.inventory,
      (inventory) => this.refreshSlots()
    );
    
    this.createInventoryPanel();
    console.log('🎒 Industry-Standard Inventory System initialized');
  }
  
  /**
   * Create the main inventory panel using Rex UI
   */
  private createInventoryPanel(): void {
    const { width, height } = this.scene.cameras.main;
    
    // Calculate panel dimensions
    const panelWidth = (this.config.slotSize + this.config.slotPadding) * this.config.slotsPerRow + 40;
    const panelHeight = Math.ceil(this.config.totalSlots / this.config.slotsPerRow) * (this.config.slotSize + this.config.slotPadding) + 120;
    
    // Create main panel
    this.inventoryPanel = this.rexUI.add.dialog({
      x: width / 2,
      y: height / 2,
      width: panelWidth,
      height: panelHeight,
      
      background: this.rexUI.add.roundRectangle(0, 0, panelWidth, panelHeight, 10, this.config.backgroundColor)
        .setStrokeStyle(2, this.config.borderColor),
      
      title: this.createTitleBar(),
      content: this.createInventoryGrid(),
      actions: this.createActionBar(),
      
      space: {
        left: 15,
        right: 15,
        top: 15,
        bottom: 15,
        title: 10,
        content: 10,
        action: 10
      },
      
      align: {
        title: 'center',
        content: 'center',
        actions: 'center'
      }
    })
    .setScrollFactor(0)
    .setDepth(1000)
    .setVisible(false);
    
    // Make panel draggable
    this.inventoryPanel.setInteractive({ draggable: true });
    this.inventoryPanel.on('drag', (pointer: any, dragX: number, dragY: number) => {
      this.inventoryPanel.setPosition(dragX, dragY);
    });
  }
  
  /**
   * Create title bar with close button
   */
  private createTitleBar(): any {
    return this.rexUI.add.sizer({
      orientation: 'horizontal'
    })
    .add(
      this.scene.add.text(0, 0, '🎒 Inventory', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }),
      { expand: true }
    )
    .add(
      this.rexUI.add.label({
        width: 30,
        height: 30,
        background: this.rexUI.add.roundRectangle(0, 0, 30, 30, 5, 0xe74c3c),
        text: this.scene.add.text(0, 0, '×', {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold'
        }),
        align: 'center'
      })
      .onClick(() => {
        useGameStore.getState().toggleInventory();
      })
    );
  }
  
  /**
   * Create inventory grid with slots
   */
  private createInventoryGrid(): any {
    const gridSizer = this.rexUI.add.gridSizer({
      column: this.config.slotsPerRow,
      row: Math.ceil(this.config.totalSlots / this.config.slotsPerRow),
      columnProportions: 1,
      rowProportions: 1,
      space: { column: this.config.slotPadding, row: this.config.slotPadding }
    });
    
    // Create inventory slots
    for (let i = 0; i < this.config.totalSlots; i++) {
      const slot = this.createInventorySlot(i);
      this.slots.push(slot);
      
      gridSizer.add(
        slot.container,
        { column: i % this.config.slotsPerRow, row: Math.floor(i / this.config.slotsPerRow) }
      );
    }
    
    return gridSizer;
  }
  
  /**
   * Create individual inventory slot
   */
  private createInventorySlot(index: number): InventorySlot {
    // Create slot background
    const background = this.rexUI.add.roundRectangle(
      0, 0, 
      this.config.slotSize, 
      this.config.slotSize, 
      4, 
      0x34495e
    ).setStrokeStyle(1, 0x5a6c7d);
    
    // Create slot container
    const container = this.rexUI.add.overlapSizer({
      width: this.config.slotSize,
      height: this.config.slotSize
    })
    .add(background, { expand: true })
    .setInteractive({ useHandCursor: true });
    
    // Setup slot interactions
    this.setupSlotInteractions(container, index);
    
    const slot: InventorySlot = {
      x: 0,
      y: 0,
      width: this.config.slotSize,
      height: this.config.slotSize,
      container,
      background
    };
    
    return slot;
  }
  
  /**
   * Setup drag/drop and click interactions for slots
   */
  private setupSlotInteractions(container: any, slotIndex: number): void {
    // Hover effects
    container.on('pointerover', () => {
      const slot = this.slots[slotIndex];
      if (slot.background) {
        slot.background.setStrokeStyle(2, this.config.highlightColor);
      }
      
      // Show tooltip if item exists
      const inventory = useGameStore.getState().inventory;
      const item = inventory[slotIndex];
      if (item) {
        this.showTooltip(item, container.x, container.y);
      }
    });
    
    container.on('pointerout', () => {
      const slot = this.slots[slotIndex];
      if (slot.background) {
        slot.background.setStrokeStyle(1, 0x5a6c7d);
      }
      this.hideTooltip();
    });
    
    // Click interactions
    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const inventory = useGameStore.getState().inventory;
      const item = inventory[slotIndex];
      
      if (!item) return;
      
      if (pointer.rightButtonDown()) {
        // Right-click: Show context menu
        this.showContextMenu(item, slotIndex, pointer.x, pointer.y);
      } else if (pointer.leftButtonDown()) {
        // Left-click: Start drag or use item
        if (pointer.getDuration() > 200) {
          // Long press: start drag
          this.startDrag(item, slotIndex);
        } else {
          // Quick click: use item
          this.useItem(item.id);
        }
      }
    });
  }
  
  /**
   * Create action bar with inventory management buttons
   */
  private createActionBar(): any {
    return this.rexUI.add.sizer({
      orientation: 'horizontal',
      space: { item: 10 }
    })
    .add(
      this.rexUI.add.label({
        width: 80,
        height: 30,
        background: this.rexUI.add.roundRectangle(0, 0, 80, 30, 5, 0x27ae60),
        text: this.scene.add.text(0, 0, 'Sort', {
          fontSize: '12px',
          color: '#ffffff'
        }),
        align: 'center'
      })
      .onClick(() => this.sortInventory())
    )
    .add(
      this.rexUI.add.label({
        width: 80,
        height: 30,
        background: this.rexUI.add.roundRectangle(0, 0, 80, 30, 5, 0xf39c12),
        text: this.scene.add.text(0, 0, 'Auto', {
          fontSize: '12px',
          color: '#ffffff'
        }),
        align: 'center'
      })
      .onClick(() => this.autoUseConsumables())
    )
    .add(
      this.rexUI.add.label({
        width: 80,
        height: 30,
        background: this.rexUI.add.roundRectangle(0, 0, 80, 30, 5, 0xe74c3c),
        text: this.scene.add.text(0, 0, 'Sell', {
          fontSize: '12px',
          color: '#ffffff'
        }),
        align: 'center'
      })
      .onClick(() => this.sellJunk())
    );
  }
  
  /**
   * Show tooltip with item information
   */
  private showTooltip(item: InventoryItem, x: number, y: number): void {
    this.hideTooltip();
    
    const tooltipText = this.generateTooltipText(item);
    const rarityColor = this.getRarityColor(item.rarity);
    
    this.tooltip = this.rexUI.add.dialog({
      x: x + 60,
      y: y - 20,
      
      background: this.rexUI.add.roundRectangle(0, 0, 200, 100, 5, 0x2c3e50, 0.9)
        .setStrokeStyle(2, rarityColor),
      
      content: this.scene.add.text(0, 0, tooltipText, {
        fontSize: '12px',
        color: '#ffffff',
        wordWrap: { width: 180 }
      }),
      
      space: { left: 10, right: 10, top: 10, bottom: 10 }
    })
    .setScrollFactor(0)
    .setDepth(2000);
  }
  
  /**
   * Hide tooltip
   */
  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = undefined;
    }
  }
  
  /**
   * Generate tooltip text for item
   */
  private generateTooltipText(item: InventoryItem): string {
    let text = `${item.name}\n${item.description}`;
    
    if (item.quantity > 1) {
      text += `\nQuantity: ${item.quantity}`;
    }
    
    if (item.effects) {
      text += '\nEffects:';
      Object.entries(item.effects).forEach(([effect, value]) => {
        if (value && value > 0) {
          text += `\n+${value} ${effect}`;
        }
      });
    }
    
    text += `\nValue: ${item.value} gold`;
    text += `\nRarity: ${_.capitalize(item.rarity)}`;
    
    return text;
  }
  
  /**
   * Get color for rarity
   */
  private getRarityColor(rarity: string): number {
    const colors: Record<string, number> = {
      'common': 0x95a5a6,
      'uncommon': 0x27ae60,
      'rare': 0x3498db,
      'epic': 0x9b59b6,
      'legendary': 0xf39c12
    };
    
    return colors[rarity] || colors.common;
  }
  
  /**
   * Show context menu for item
   */
  private showContextMenu(item: InventoryItem, slotIndex: number, x: number, y: number): void {
    if (this.contextMenu) {
      this.contextMenu.destroy();
    }
    
    const actions: Array<{ text: string; action: () => void }> = [];
    
    // Use action
    if (item.type === 'consumable' || item.type === 'potion') {
      actions.push({
        text: 'Use',
        action: () => this.useItem(item.id)
      });
    }
    
    // Equip action
    if (item.slot) {
      actions.push({
        text: item.equipped ? 'Unequip' : 'Equip',
        action: () => item.equipped ? 
          useGameStore.getState().unequipItem(item.slot!) : 
          useGameStore.getState().equipItem(item.id)
      });
    }
    
    // Drop action
    actions.push({
      text: 'Drop',
      action: () => useGameStore.getState().removeItem(item.id, 1)
    });
    
    // Drop all action
    if (item.quantity > 1) {
      actions.push({
        text: 'Drop All',
        action: () => useGameStore.getState().removeItem(item.id, item.quantity)
      });
    }
    
    this.createContextMenu(actions, x, y);
  }
  
  /**
   * Create context menu with actions
   */
  private createContextMenu(actions: Array<{ text: string; action: () => void }>, x: number, y: number): void {
    const menuSizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      space: { item: 2 }
    });
    
    actions.forEach(({ text, action }) => {
      const button = this.rexUI.add.label({
        width: 100,
        height: 25,
        background: this.rexUI.add.roundRectangle(0, 0, 100, 25, 3, 0x34495e),
        text: this.scene.add.text(0, 0, text, {
          fontSize: '12px',
          color: '#ffffff'
        }),
        align: 'center'
      })
      .onClick(() => {
        action();
        this.hideContextMenu();
      });
      
      menuSizer.add(button);
    });
    
    this.contextMenu = this.rexUI.add.dialog({
      x,
      y,
      background: this.rexUI.add.roundRectangle(0, 0, 110, actions.length * 27 + 10, 5, 0x2c3e50)
        .setStrokeStyle(1, 0x5a6c7d),
      content: menuSizer,
      space: { left: 5, right: 5, top: 5, bottom: 5 }
    })
    .setScrollFactor(0)
    .setDepth(2500);
    
    // Hide context menu when clicking elsewhere
    this.scene.input.once('pointerdown', () => {
      this.hideContextMenu();
    });
  }
  
  /**
   * Hide context menu
   */
  private hideContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.destroy();
      this.contextMenu = undefined;
    }
  }
  
  /**
   * Use item by ID
   */
  private useItem(itemId: string): void {
    const success = useGameStore.getState().useItem(itemId);
    if (success) {
      // Show use effect
      console.log(`✨ Used item: ${itemId}`);
    }
  }
  
  /**
   * Sort inventory by rarity and type
   */
  private sortInventory(): void {
    const { inventory } = useGameStore.getState();
    
    const sorted = _.orderBy(inventory, [
      (item) => this.getRarityOrder(item.rarity),
      'type',
      'name'
    ], ['desc', 'asc', 'asc']);
    
    useGameStore.setState({ inventory: sorted });
  }
  
  /**
   * Get sorting order for rarity
   */
  private getRarityOrder(rarity: string): number {
    const order: Record<string, number> = {
      'legendary': 5,
      'epic': 4,
      'rare': 3,
      'uncommon': 2,
      'common': 1
    };
    
    return order[rarity] || 0;
  }
  
  /**
   * Auto-use health/mana potions when needed
   */
  private autoUseConsumables(): void {
    const { hero, inventory, useItem } = useGameStore.getState();
    
    // Auto-use health potions if HP < 50%
    if (hero.currentHP < hero.maxHP * 0.5) {
      const healthPotion = inventory.find(item => 
        item.type === 'potion' && item.effects?.healHP && item.quantity > 0
      );
      
      if (healthPotion) {
        useItem(healthPotion.id);
        console.log('🧪 Auto-used health potion');
      }
    }
    
    // Auto-use mana potions if MP < 25%
    if (hero.currentMP < hero.maxMP * 0.25) {
      const manaPotion = inventory.find(item => 
        item.type === 'potion' && item.effects?.healMP && item.quantity > 0
      );
      
      if (manaPotion) {
        useItem(manaPotion.id);
        console.log('🔮 Auto-used mana potion');
      }
    }
  }
  
  /**
   * Sell all common/uncommon items automatically
   */
  private sellJunk(): void {
    const { inventory, removeItem, updateHeroStats } = useGameStore.getState();
    
    let totalValue = 0;
    const toSell = inventory.filter(item => 
      (item.rarity === 'common' || item.rarity === 'uncommon') && 
      !item.equipped
    );
    
    toSell.forEach(item => {
      totalValue += item.value * item.quantity;
      removeItem(item.id, item.quantity);
    });
    
    if (totalValue > 0) {
      updateHeroStats({ gold: useGameStore.getState().hero.gold + totalValue });
      console.log(`💰 Sold junk items for ${totalValue} gold`);
    }
  }
  
  /**
   * Start dragging an item
   */
  private startDrag(item: InventoryItem, slotIndex: number): void {
    this.draggedItem = { item, slotIndex };
    
    // Create drag preview sprite
    const slot = this.slots[slotIndex];
    if (slot.sprite && slot.container) {
      const dragPreview = this.scene.add.sprite(0, 0, item.spriteKey)
        .setDisplaySize(this.config.slotSize - 8, this.config.slotSize - 8)
        .setAlpha(0.7)
        .setDepth(3000)
        .setScrollFactor(0);
      
      // Follow mouse during drag
      this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.draggedItem) {
          dragPreview.setPosition(pointer.x, pointer.y);
        }
      });
      
      // Handle drop
      this.scene.input.once('pointerup', (pointer: Phaser.Input.Pointer) => {
        this.completeDrop(pointer.x, pointer.y);
        dragPreview.destroy();
      });
      
      // Dim original slot during drag
      if (slot.sprite) {
        slot.sprite.setAlpha(0.3);
      }
      
      console.log(`🫴 Started dragging: ${item.name}`);
    }
  }
  
  /**
   * Complete drag and drop operation
   */
  private completeDrop(x: number, y: number): void {
    if (!this.draggedItem) return;
    
    // Find target slot based on drop position
    const targetSlotIndex = this.findSlotAtPosition(x, y);
    const sourceSlotIndex = this.draggedItem.slotIndex;
    
    if (targetSlotIndex !== -1 && targetSlotIndex !== sourceSlotIndex) {
      // Swap items between slots
      this.swapInventorySlots(sourceSlotIndex, targetSlotIndex);
      console.log(`🔄 Moved item from slot ${sourceSlotIndex} to ${targetSlotIndex}`);
    }
    
    // Restore visual state
    const sourceSlot = this.slots[sourceSlotIndex];
    if (sourceSlot.sprite) {
      sourceSlot.sprite.setAlpha(1);
    }
    
    this.draggedItem = undefined;
    this.scene.input.off('pointermove');
  }
  
  /**
   * Find slot at screen position
   */
  private findSlotAtPosition(x: number, y: number): number {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot.container) {
        const bounds = slot.container.getBounds();
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
          return i;
        }
      }
    }
    return -1;
  }
  
  /**
   * Swap items between inventory slots
   */
  private swapInventorySlots(sourceIndex: number, targetIndex: number): void {
    const { inventory } = useGameStore.getState();
    const newInventory = [...inventory];
    
    // Swap items
    const sourceItem = newInventory[sourceIndex];
    const targetItem = newInventory[targetIndex];
    
    newInventory[sourceIndex] = targetItem;
    newInventory[targetIndex] = sourceItem;
    
    useGameStore.setState({ inventory: newInventory });
  }
  
  /**
   * Toggle inventory visibility
   */
  private toggleVisibility(visible: boolean): void {
    if (this.inventoryPanel) {
      this.inventoryPanel.setVisible(visible);
      
      if (visible) {
        this.refreshSlots();
      }
    }
  }
  
  /**
   * Refresh all inventory slots with current data
   */
  private refreshSlots(): void {
    const { inventory } = useGameStore.getState();
    
    this.slots.forEach((slot, index) => {
      // Clear existing item visuals
      if (slot.sprite) {
        slot.sprite.destroy();
        slot.sprite = undefined;
      }
      
      if (slot.quantityText) {
        slot.quantityText.destroy();
        slot.quantityText = undefined;
      }
      
      // Add new item if exists
      const item = inventory[index];
      if (item) {
        // Create item sprite
        if (this.scene.textures.exists(item.spriteKey)) {
          slot.sprite = this.scene.add.sprite(0, 0, item.spriteKey)
            .setDisplaySize(this.config.slotSize - 8, this.config.slotSize - 8);
          
          slot.container.add(slot.sprite);
        }
        
        // Add quantity text for stackable items
        if (item.quantity > 1) {
          slot.quantityText = this.scene.add.text(
            this.config.slotSize / 2 - 8,
            this.config.slotSize / 2 - 8,
            item.quantity.toString(),
            {
              fontSize: '10px',
              color: '#ffffff',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: { x: 2, y: 1 }
            }
          );
          
          slot.container.add(slot.quantityText);
        }
        
        // Apply rarity border color
        const rarityColor = this.getRarityColor(item.rarity);
        if (slot.background) {
          slot.background.setStrokeStyle(2, rarityColor);
        }
      } else {
        // Reset empty slot appearance
        if (slot.background) {
          slot.background.setStrokeStyle(1, 0x5a6c7d);
        }
      }
    });
  }
  
  /**
   * Destroy inventory system and cleanup
   */
  public destroy(): void {
    this.hideTooltip();
    this.hideContextMenu();
    
    if (this.inventoryPanel) {
      this.inventoryPanel.destroy();
    }
    
    this.slots = [];
    console.log('🗑️ Inventory System destroyed');
  }
}

console.log('🎒 Industry-Standard Inventory System ready');
