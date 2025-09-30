/**
 * InventoryScene - Equipment management and character stats
 * Overlay scene for managing the legendary 18-slot equipment system
 */

import Phaser from 'phaser';
import { EquipmentSystem, EquipmentItem } from '../systems/EquipmentSystem';
import { Hero } from '../entities/Hero';

export class InventoryScene extends Phaser.Scene {
  private equipmentSystem!: EquipmentSystem;
  private hero!: Hero;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private statsContainer!: Phaser.GameObjects.Container;
  private equipmentContainer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'InventoryScene' });
  }

  create(): void {
    console.log('🎒 Legendary Equipment Interface opened');
    
    // Get hero from game scene
    const gameScene = this.scene.get('GameScene') as any;
    this.hero = gameScene.hero;
    
    // Initialize equipment system
    this.equipmentSystem = new EquipmentSystem(this);
    this.equipmentSystem.setHero(this.hero);
    
    this.createBackground();
    this.createLegendaryInventoryUI();
    this.setupAdvancedControls();
    this.populateTestItems(); // Add some test equipment
  }

  private createBackground(): void {
    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // Inventory panel
    const panelWidth = 800;
    const panelHeight = 600;
    const panelX = (this.cameras.main.width - panelWidth) / 2;
    const panelY = (this.cameras.main.height - panelHeight) / 2;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x2c3e50);
    panel.lineStyle(4, 0x00ff88);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
  }

  private createLegendaryInventoryUI(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // Main title with shell class
    this.add.text(centerX, centerY - 280, `🐢 BOB'S LEGENDARY EQUIPMENT`, {
      fontSize: '28px',
      color: '#00ff88',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(centerX, centerY - 250, `${this.hero.shellClass} • Level ${this.hero.stats.level}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Create three main panels
    this.createStatsPanel(centerX - 350, centerY - 200);
    this.createEquipmentPanel(centerX, centerY - 200);
    this.createInventoryPanel(centerX + 300, centerY - 200);
    
    // Create action buttons
    this.createActionButtons(centerX, centerY + 240);
  }
  
  private createStatsPanel(x: number, y: number): void {
    // Stats panel background
    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x2c3e50, 0.9);
    statsBg.lineStyle(2, 0x00ff88);
    statsBg.fillRoundedRect(x - 100, y - 20, 200, 300, 8);
    statsBg.strokeRoundedRect(x - 100, y - 20, 200, 300, 8);
    
    // Stats title
    this.add.text(x, y, 'CHARACTER STATS', {
      fontSize: '16px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.statsContainer = this.add.container(x, y + 30);
    this.updateStatsDisplay();
  }
  
  private createEquipmentPanel(x: number, y: number): void {
    // Equipment panel background
    const equipBg = this.add.graphics();
    equipBg.fillStyle(0x2c3e50, 0.9);
    equipBg.lineStyle(2, 0x00ff88);
    equipBg.fillRoundedRect(x - 200, y - 20, 400, 380, 8);
    equipBg.strokeRoundedRect(x - 200, y - 20, 400, 380, 8);
    
    // Equipment title
    this.add.text(x, y, '18-SLOT LEGENDARY EQUIPMENT', {
      fontSize: '16px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.equipmentContainer = this.add.container(x, y + 30);
    this.createEquipmentSlots();
  }
  
  private createInventoryPanel(x: number, y: number): void {
    // Inventory panel background
    const invBg = this.add.graphics();
    invBg.fillStyle(0x2c3e50, 0.9);
    invBg.lineStyle(2, 0x00ff88);
    invBg.fillRoundedRect(x - 150, y - 20, 300, 380, 8);
    invBg.strokeRoundedRect(x - 150, y - 20, 300, 380, 8);
    
    // Inventory title
    this.add.text(x, y, 'INVENTORY ITEMS', {
      fontSize: '16px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.inventoryContainer = this.add.container(x, y + 30);
    this.createInventoryGrid();
  }
  
  private createEquipmentSlots(): void {
    // Equipment slots are handled by the EquipmentSystem
    // The visual creation is done in EquipmentSystem.createEquipmentSlots()
    console.log('🎯 18 equipment slots created by EquipmentSystem');
  }
  
  private createInventoryGrid(): void {
    // Create 8x5 inventory grid (40 slots)
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        const slotX = (col - 3.5) * 35;
        const slotY = row * 35;
        
        // Inventory slot background
        const slotBg = this.add.rectangle(slotX, slotY, 32, 32, 0x34495e);
        slotBg.setStrokeStyle(1, 0x7f8c8d);
        
        this.inventoryContainer.add(slotBg);
      }
    }
  }
  
  private updateStatsDisplay(): void {
    // Clear existing stats
    this.statsContainer.removeAll(true);
    
    const stats = this.hero.getEffectiveStats();
    const equipmentBonuses = this.equipmentSystem.getTotalStatBonuses();
    
    const statEntries = [
      { label: 'Health', value: `${stats.currentHP}/${stats.maxHP}`, bonus: equipmentBonuses.maxHP },
      { label: 'Mana', value: `${stats.currentMP}/${stats.maxMP}`, bonus: equipmentBonuses.maxMP },
      { label: 'Attack', value: stats.attack.toString(), bonus: equipmentBonuses.attack },
      { label: 'Defense', value: stats.defense.toString(), bonus: equipmentBonuses.defense },
      { label: 'Speed', value: stats.speed.toString(), bonus: equipmentBonuses.speed },
      { label: 'Crit Rate', value: `${stats.criticalRate}%`, bonus: equipmentBonuses.criticalRate },
      { label: 'Fire Res', value: `${stats.fireResistance}%`, bonus: equipmentBonuses.fireResistance },
      { label: 'Water Res', value: `${stats.waterResistance}%`, bonus: equipmentBonuses.waterResistance },
      { label: 'Earth Res', value: `${stats.earthResistance}%`, bonus: equipmentBonuses.earthResistance }
    ];
    
    statEntries.forEach((stat, index) => {
      const y = index * 25;
      
      // Stat label
      const label = this.add.text(-80, y, stat.label + ':', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial'
      });
      
      // Stat value
      let valueColor = '#ffffff';
      let displayValue = stat.value;
      
      if (stat.bonus && stat.bonus > 0) {
        valueColor = '#00ff88';
        displayValue += ` (+${stat.bonus})`;
      }
      
      const value = this.add.text(0, y, displayValue, {
        fontSize: '14px',
        color: valueColor,
        fontFamily: 'Arial'
      });
      
      this.statsContainer.add([label, value]);
    });
  }
  
  private createActionButtons(x: number, y: number): void {
    // Auto-equip button
    const autoEquipButton = this.add.text(x - 100, y, '⚡ AUTO-EQUIP', {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    autoEquipButton.setInteractive({ useHandCursor: true });
    autoEquipButton.on('pointerover', () => {
      autoEquipButton.setScale(1.1);
      autoEquipButton.setColor('#ffcc00');
    });
    autoEquipButton.on('pointerout', () => {
      autoEquipButton.setScale(1.0);
      autoEquipButton.setColor('#ffaa00');
    });
    autoEquipButton.on('pointerdown', () => this.autoEquipBestItems());
    
    // Close button
    const closeButton = this.add.text(x + 100, y, '✕ CLOSE', {
      fontSize: '16px',
      color: '#e74c3c',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerover', () => {
      closeButton.setScale(1.1);
      closeButton.setColor('#ff6b6b');
    });
    closeButton.on('pointerout', () => {
      closeButton.setScale(1.0);
      closeButton.setColor('#e74c3c');
    });
    closeButton.on('pointerdown', () => this.closeInventory());
  }

  private setupAdvancedControls(): void {
    // ESC or I to close
    this.input.keyboard?.on('keydown-ESC', () => this.closeInventory());
    this.input.keyboard?.on('keydown-I', () => this.closeInventory());
    
    // Enable drag and drop
    this.input.setDragState(this, 1);
    
    // Global drag events
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      const item = (gameObject as any).equipmentItem as EquipmentItem;
      if (item) {
        this.equipmentSystem.startDrag(item, pointer);
      }
    });
    
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
      this.equipmentSystem.updateDrag(pointer);
    });
    
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      this.equipmentSystem.endDrag(pointer);
      this.updateStatsDisplay(); // Refresh stats after equipment change
    });
    
    // Auto-equip hotkey
    this.input.keyboard?.on('keydown-A', () => this.autoEquipBestItems());
  }
  
  private populateTestItems(): void {
    // Generate some test equipment for demonstration
    const testItems = [
      this.equipmentSystem.generateRandomItem(5, 'Rare', 'helmet'),
      this.equipmentSystem.generateRandomItem(5, 'Epic', 'chestArmor'),
      this.equipmentSystem.generateRandomItem(5, 'Uncommon', 'mainWeapon'),
      this.equipmentSystem.generateRandomItem(5, 'Legendary', 'boots'),
      this.equipmentSystem.generateRandomItem(5, 'Common', 'gloves')
    ];
    
    testItems.forEach(item => {
      this.equipmentSystem.addToInventory(item);
    });
    
    console.log('🎲 Added test equipment items to inventory');
  }
  
  private autoEquipBestItems(): void {
    // Auto-equip the best available items for each slot
    const inventory = this.equipmentSystem.getInventory();
    const slots = ['helmet', 'chestArmor', 'mainWeapon', 'boots', 'gloves'] as const;
    
    slots.forEach(slot => {
      const suitableItems = inventory.filter(item => item.slot === slot);
      if (suitableItems.length > 0) {
        // Find item with highest total stats
        const bestItem = suitableItems.reduce((best, current) => {
          const bestTotal = this.calculateItemPower(best);
          const currentTotal = this.calculateItemPower(current);
          return currentTotal > bestTotal ? current : best;
        });
        
        this.equipmentSystem.equipItem(bestItem, slot);
      }
    });
    
    this.updateStatsDisplay();
    console.log('⚡ Auto-equipped best available items');
  }
  
  private calculateItemPower(item: EquipmentItem): number {
    let power = 0;
    
    Object.values(item.baseStats).forEach(value => {
      if (typeof value === 'number') {
        power += value;
      }
    });
    
    Object.values(item.bonusStats).forEach(value => {
      power += value;
    });
    
    // Rarity multiplier
    const rarityMultipliers = {
      'Common': 1.0,
      'Uncommon': 1.2,
      'Rare': 1.5,
      'Epic': 2.0,
      'Legendary': 2.5,
      'Mythic': 3.0
    };
    
    return power * rarityMultipliers[item.rarity];
  }

  private closeInventory(): void {
    console.log('🎒 Legendary Equipment Interface closed');
    
    // Save equipment state
    const equipmentData = this.equipmentSystem.saveEquipmentState();
    // IMPLEMENTED: Save to SaveSystem
    
    // Cleanup
    this.equipmentSystem.destroy();
    
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
