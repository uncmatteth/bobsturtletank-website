/**
 * Equipment System - Industry-Standard Equipment UI and Logic
 * CACHE BUSTER: 2024-12-19-15:30
 */

import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import type { InventoryItem, Equipment } from '../stores/gameStore';

// Export types for other systems
export type EquipmentItem = InventoryItem;
import _ from 'lodash';

interface EquipmentSlot {
  slotType: keyof Equipment;
  x: number;
  y: number;
  width: number;
  height: number;
  item?: InventoryItem;
  container?: any;
  background?: Phaser.GameObjects.Rectangle;
  sprite?: Phaser.GameObjects.Sprite;
  label?: Phaser.GameObjects.Text;
}

interface EquipmentConfig {
  slotSize: number;
  slotPadding: number;
  backgroundColor: number;
  borderColor: number;
  highlightColor: number;
  equippedColor: number;
}

export class EquipmentSystem {
  private scene: Phaser.Scene;
  private rexUI: any;
  private gameStore: any;
  private hero?: any; // Hero reference
  
  private equipmentPanel?: any;
  private slots: EquipmentSlot[] = [];
  private statsDisplay?: any;
  private tooltip?: any;
  
  private config: EquipmentConfig = {
    slotSize: 64,
    slotPadding: 8,
    backgroundColor: 0x2c3e50,
    borderColor: 0x34495e,
    highlightColor: 0x3498db,
    equippedColor: 0x27ae60
  };
  
  private slotLayout: Array<{ type: keyof Equipment; label: string; x: number; y: number }> = [
    { type: 'helmet', label: 'Helmet', x: 1, y: 0 },
    { type: 'weapon', label: 'Weapon', x: 0, y: 1 },
    { type: 'armor', label: 'Armor', x: 1, y: 1 },
    { type: 'boots', label: 'Boots', x: 1, y: 2 },
    { type: 'accessory1', label: 'Ring 1', x: 0, y: 2 },
    { type: 'accessory2', label: 'Ring 2', x: 2, y: 2 }
  ];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.rexUI = (scene as any).rexUI;
    this.gameStore = useGameStore.getState();
    
    useGameStore.subscribe(
      (state) => state.showStats,
      (visible) => this.toggleVisibility(visible)
    );
    
    useGameStore.subscribe(
      (state) => state.equipment,
      (equipment) => this.refreshEquipment()
    );
    
    this.createEquipmentPanel();
    console.log('⚔️ Equipment System initialized - CACHE BUSTER 2024-12-19-15:30');
  }
  
  /**
   * Set hero reference for equipment management
   * CRITICAL METHOD - MUST EXIST FOR GAME TO WORK
   */
  public setHero(hero: any): void {
    console.log('🔧 EQUIPMENT SYSTEM: setHero method called with hero:', hero ? 'VALID' : 'NULL');
    this.hero = hero;
    this.refreshEquipment();
    console.log('🐢 Hero registered with equipment system - CACHE BUSTER ACTIVE');
  }
  
  private createEquipmentPanel(): void {
    const { width, height } = this.scene.cameras.main;
    const panelWidth = (this.config.slotSize + this.config.slotPadding) * 3 + 300;
    const panelHeight = (this.config.slotSize + this.config.slotPadding) * 3 + 150;
    
    this.equipmentPanel = this.rexUI.add.dialog({
      x: width - panelWidth / 2 - 20,
      y: height / 2,
      width: panelWidth,
      height: panelHeight,
      background: this.rexUI.add.roundRectangle(0, 0, panelWidth, panelHeight, 10, this.config.backgroundColor)
        .setStrokeStyle(2, this.config.borderColor),
      title: this.createTitleBar(),
      content: this.createEquipmentLayout(),
      space: { left: 15, right: 15, top: 15, bottom: 15, title: 10, content: 10 },
      align: { title: 'center', content: 'center' }
    })
    .setScrollFactor(0)
    .setDepth(1000)
    .setVisible(false);
    
    this.equipmentPanel.setInteractive({ draggable: true });
    this.equipmentPanel.on('drag', (pointer: any, dragX: number, dragY: number) => {
      this.equipmentPanel.setPosition(dragX, dragY);
    });
  }
  
  private createTitleBar(): any {
    return this.rexUI.add.sizer({ orientation: 'horizontal' })
    .add(this.scene.add.text(0, 0, '⚔️ Equipment & Stats', {
      fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
    }), { expand: true })
    .add(this.rexUI.add.label({
      width: 30, height: 30,
      background: this.rexUI.add.roundRectangle(0, 0, 30, 30, 5, 0xe74c3c),
      text: this.scene.add.text(0, 0, '×', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }),
      align: 'center'
    }).onClick(() => useGameStore.getState().toggleStats()));
  }
  
  private createEquipmentLayout(): any {
    return this.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 20 } })
    .add(this.createEquipmentGrid(), { proportion: 1 })
    .add(this.createStatsDisplay(), { proportion: 1 });
  }
  
  private createEquipmentGrid(): any {
    const gridSizer = this.rexUI.add.gridSizer({
      column: 3, row: 3, columnProportions: 1, rowProportions: 1,
      space: { column: this.config.slotPadding, row: this.config.slotPadding }
    });
    
    this.slotLayout.forEach(slotConfig => {
      const slot = this.createEquipmentSlot(slotConfig);
      this.slots.push(slot);
      gridSizer.add(slot.container, { column: slotConfig.x, row: slotConfig.y });
    });
    
    return gridSizer;
  }
  
  private createEquipmentSlot(slotConfig: { type: keyof Equipment; label: string; x: number; y: number }): EquipmentSlot {
    const background = this.rexUI.add.roundRectangle(0, 0, this.config.slotSize, this.config.slotSize, 8, 0x34495e)
      .setStrokeStyle(2, 0x5a6c7d);
    
    const label = this.scene.add.text(0, -this.config.slotSize/2 + 12, slotConfig.label, {
      fontSize: '10px', color: '#bdc3c7', fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    const container = this.rexUI.add.overlapSizer({ width: this.config.slotSize, height: this.config.slotSize })
    .add(background, { expand: true })
    .add(label, { align: 'top' })
    .setInteractive({ useHandCursor: true });
    
    this.setupEquipmentSlotInteractions(container, slotConfig.type);
    
    return {
      slotType: slotConfig.type, x: slotConfig.x, y: slotConfig.y,
      width: this.config.slotSize, height: this.config.slotSize,
      container, background, label
    };
  }
  
  private setupEquipmentSlotInteractions(container: any, slotType: keyof Equipment): void {
    container.on('pointerover', () => {
      const slot = this.slots.find(s => s.slotType === slotType);
      if (slot?.background) slot.background.setStrokeStyle(3, this.config.highlightColor);
      
      const equipment = useGameStore.getState().equipment;
      const item = equipment[slotType];
      if (item) this.showTooltip(item, container.x, container.y);
    });
    
    container.on('pointerout', () => {
      const slot = this.slots.find(s => s.slotType === slotType);
      const equipment = useGameStore.getState().equipment;
      const item = equipment[slotType];
      
      if (slot?.background) {
        const strokeColor = item ? this.config.equippedColor : 0x5a6c7d;
        slot.background.setStrokeStyle(2, strokeColor);
      }
      this.hideTooltip();
    });
    
    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        const equipment = useGameStore.getState().equipment;
        const item = equipment[slotType];
        if (item) {
          useGameStore.getState().unequipItem(slotType);
          console.log(`🗡️ Unequipped: ${item.name}`);
        }
      } else if (pointer.leftButtonDown()) {
        this.showEquippableItems(slotType);
      }
    });
  }
  
  private createStatsDisplay(): any {
    const { hero } = useGameStore.getState();
    const effectiveStats = useGameStore.getState().getEffectiveStats();
    const statsText = this.generateStatsText(hero, effectiveStats);
    
    this.statsDisplay = this.rexUI.add.sizer({ orientation: 'vertical', space: { item: 5 } })
    .add(this.scene.add.text(0, 0, '📊 Character Stats', {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
    }), { align: 'center' })
    .add(this.scene.add.text(0, 0, statsText, {
      fontSize: '12px', color: '#ecf0f1', lineSpacing: 2
    }));
    
    return this.statsDisplay;
  }
  
  private generateStatsText(baseStats: any, effectiveStats: any): string {
    const formatStatChange = (base: number, effective: number) => {
      const diff = effective - base;
      if (diff === 0) return effective.toString();
      return `${effective} ${diff > 0 ? `(+${diff})` : `(${diff})`}`;
    };
    
    return [
      `Level: ${baseStats.level}`,
      `Experience: ${baseStats.experience}/${baseStats.experienceToNext}`,
      '', `HP: ${baseStats.currentHP}/${baseStats.maxHP}`,
      `MP: ${baseStats.currentMP}/${baseStats.maxMP}`, '',
      `Attack: ${formatStatChange(baseStats.attack, effectiveStats.attack)}`,
      `Defense: ${formatStatChange(baseStats.defense, effectiveStats.defense)}`,
      `Speed: ${formatStatChange(baseStats.speed, effectiveStats.speed)}`, '',
      `Critical Rate: ${formatStatChange(baseStats.criticalRate, effectiveStats.criticalRate)}%`,
      `Critical Damage: ${formatStatChange(baseStats.criticalDamage, effectiveStats.criticalDamage)}%`, '',
      `Fire Resist: ${formatStatChange(baseStats.fireResistance, effectiveStats.fireResistance)}%`,
      `Water Resist: ${formatStatChange(baseStats.waterResistance, effectiveStats.waterResistance)}%`,
      `Earth Resist: ${formatStatChange(baseStats.earthResistance, effectiveStats.earthResistance)}%`, '',
      `Gold: ${baseStats.gold}`, `Floor: ${useGameStore.getState().currentFloor}`,
      `Kills: ${baseStats.totalKills}`
    ].join('\n');
  }
  
  private showEquippableItems(slotType: keyof Equipment): void {
    const { inventory } = useGameStore.getState();
    const compatibleItems = inventory.filter(item => item.slot === slotType && !item.equipped);
    
    if (compatibleItems.length === 0) {
      console.log(`❌ No ${slotType} items available to equip`);
      return;
    }
    
    const menuActions = compatibleItems.map(item => ({
      text: `${item.name} ${item.rarity !== 'common' ? `(${item.rarity})` : ''}`,
      action: () => {
        useGameStore.getState().equipItem(item.id);
        console.log(`⚔️ Equipped: ${item.name}`);
      }
    }));
    
    this.createEquipmentMenu(menuActions, slotType);
  }
  
  private createEquipmentMenu(actions: Array<{ text: string; action: () => void }>, slotType: keyof Equipment): void {
    const menuSizer = this.rexUI.add.sizer({ orientation: 'vertical', space: { item: 2 } });
    
    actions.forEach(({ text, action }) => {
      const button = this.rexUI.add.label({
        width: 200, height: 30,
        background: this.rexUI.add.roundRectangle(0, 0, 200, 30, 5, 0x34495e),
        text: this.scene.add.text(0, 0, text, { fontSize: '12px', color: '#ffffff' }),
        align: 'left', space: { left: 10 }
      }).onClick(() => { action(); this.hideEquipmentMenu(); });
      
      menuSizer.add(button);
    });
    
    const { width, height } = this.scene.cameras.main;
    const equipmentMenu = this.rexUI.add.dialog({
      x: width / 2, y: height / 2,
      background: this.rexUI.add.roundRectangle(0, 0, 220, actions.length * 32 + 20, 8, this.config.backgroundColor)
        .setStrokeStyle(2, this.config.borderColor),
      content: menuSizer, space: { left: 10, right: 10, top: 10, bottom: 10 }
    }).setScrollFactor(0).setDepth(2500);
    
    (this as any).currentEquipmentMenu = equipmentMenu;
    this.scene.input.once('pointerdown', () => this.hideEquipmentMenu());
  }
  
  private hideEquipmentMenu(): void {
    const menu = (this as any).currentEquipmentMenu;
    if (menu) { menu.destroy(); (this as any).currentEquipmentMenu = undefined; }
  }
  
  private showTooltip(item: InventoryItem, x: number, y: number): void {
    this.hideTooltip();
    const tooltipText = this.generateEquipmentTooltipText(item);
    const rarityColor = this.getRarityColor(item.rarity);
    
    this.tooltip = this.rexUI.add.dialog({
      x: x + 80, y: y - 20,
      background: this.rexUI.add.roundRectangle(0, 0, 220, 120, 5, 0x2c3e50, 0.95)
        .setStrokeStyle(2, rarityColor),
      content: this.scene.add.text(0, 0, tooltipText, {
        fontSize: '11px', color: '#ffffff', wordWrap: { width: 200 }
      }),
      space: { left: 10, right: 10, top: 10, bottom: 10 }
    }).setScrollFactor(0).setDepth(2000);
  }
  
  private generateEquipmentTooltipText(item: InventoryItem): string {
    let text = `${item.name}\n${item.description}`;
    
    if (item.effects) {
      text += '\n\nStats:';
      Object.entries(item.effects).forEach(([effect, value]) => {
        if (value && value > 0) {
          const displayName = effect.replace(/([A-Z])/g, ' $1').toLowerCase();
          text += `\n+${value} ${displayName}`;
        }
      });
    }
    
    text += `\n\nValue: ${item.value} gold`;
    text += `\nRarity: ${_.capitalize(item.rarity)}`;
    if (item.equipped) text += '\n\n✓ Currently Equipped';
    
    return text;
  }
  
  private hideTooltip(): void {
    if (this.tooltip) { this.tooltip.destroy(); this.tooltip = undefined; }
  }
  
  private getRarityColor(rarity: string): number {
    const colors: Record<string, number> = {
      'common': 0x95a5a6, 'uncommon': 0x27ae60, 'rare': 0x3498db, 'epic': 0x9b59b6, 'legendary': 0xf39c12
    };
    return colors[rarity] || colors.common;
  }
  
  private toggleVisibility(visible: boolean): void {
    if (this.equipmentPanel) {
      this.equipmentPanel.setVisible(visible);
      if (visible) { this.refreshEquipment(); this.refreshStats(); }
    }
  }
  
  private refreshEquipment(): void {
    const { equipment } = useGameStore.getState();
    
    this.slots.forEach(slot => {
      if (slot.sprite) { slot.sprite.destroy(); slot.sprite = undefined; }
      
      const item = equipment[slot.slotType];
      if (item) {
        if (this.scene.textures.exists(item.spriteKey)) {
          slot.sprite = this.scene.add.sprite(0, 0, item.spriteKey)
            .setDisplaySize(this.config.slotSize - 16, this.config.slotSize - 16);
          slot.container.add(slot.sprite);
        }
        
        const rarityColor = this.getRarityColor(item.rarity);
        if (slot.background) slot.background.setStrokeStyle(2, rarityColor);
      } else {
        if (slot.background) slot.background.setStrokeStyle(2, 0x5a6c7d);
      }
    });
  }
  
  private refreshStats(): void {
    if (this.statsDisplay) {
      const { hero } = useGameStore.getState();
      const effectiveStats = useGameStore.getState().getEffectiveStats();
      const statsText = this.generateStatsText(hero, effectiveStats);
      
      const textObject = this.statsDisplay.getElement('items')[1];
      if (textObject) textObject.setText(statsText);
    }
  }
  
  public destroy(): void {
    this.hideTooltip();
    this.hideEquipmentMenu();
    if (this.equipmentPanel) this.equipmentPanel.destroy();
    this.slots = [];
    console.log('🗑️ Equipment System destroyed');
  }
}

console.log('⚔️ Industry-Standard Equipment System ready - CACHE BUSTER 2024-12-19-15:30');