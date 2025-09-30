/**
 * ItemManager - Handles item spawning, collection, and effects
 * Integrates PixelLab generated item assets with the game
 */

import Phaser from 'phaser';
import { CharacterManager } from './CharacterManager';

export interface ItemConfig {
  key: string;
  name: string;
  description: string;
  type: 'consumable' | 'equipment' | 'treasure';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  value: number;
  effect?: {
    type: 'health' | 'mana' | 'experience' | 'gold' | 'stat';
    amount: number;
    stat?: string;
  };
}

export class Item extends Phaser.GameObjects.Container {
  // Item properties
  public key: string;
  public name: string;
  public description: string;
  public type: 'consumable' | 'equipment' | 'treasure';
  public rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  public value: number;
  public effect?: {
    type: 'health' | 'mana' | 'experience' | 'gold' | 'stat';
    amount: number;
    stat?: string;
  };
  
  // Sprite and physics
  private sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  
  // Visual effects
  private glowGraphics: Phaser.GameObjects.Graphics;
  private floatTween: Phaser.Tweens.Tween;
  private rotateTween: Phaser.Tweens.Tween;
  
  constructor(scene: Phaser.Scene, x: number, y: number, config: ItemConfig, characterManager: CharacterManager) {
    super(scene, x, y);
    
    // Set properties
    this.key = config.key;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this.rarity = config.rarity;
    this.value = config.value;
    this.effect = config.effect;
    
    // Create sprite
    const itemSprite = characterManager.createSprite(0, 0, config.key);
    
    if (itemSprite) {
      this.sprite = itemSprite;
    } else {
      // Fallback to placeholder sprite
      console.warn(`⚠️ Using fallback sprite for item: ${config.key}`);
      this.sprite = scene.add.sprite(0, 0, 'fallback_item');
      
      // Color based on rarity
      switch (config.rarity) {
        case 'Common':
          this.sprite.setTint(0xFFFFFF); // White
          break;
        case 'Uncommon':
          this.sprite.setTint(0x00FF00); // Green
          break;
        case 'Rare':
          this.sprite.setTint(0x0000FF); // Blue
          break;
        case 'Epic':
          this.sprite.setTint(0xA020F0); // Purple
          break;
        case 'Legendary':
          this.sprite.setTint(0xFFD700); // Gold
          break;
      }
    }
    
    // Add sprite to container
    this.add(this.sprite);
    
    // Create glow effect based on rarity
    this.glowGraphics = scene.add.graphics();
    this.createGlowEffect();
    this.add(this.glowGraphics);
    
    // Set up physics
    scene.physics.world.enable(this);
    this.body.setSize(24, 24);
    this.body.setOffset(-12, -12);
    
    // Add to scene
    scene.add.existing(this);
    
    // Create floating animation
    this.floatTween = scene.tweens.add({
      targets: this.sprite,
      y: -5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Create rotation animation for treasure items
    if (config.type === 'treasure') {
      this.rotateTween = scene.tweens.add({
        targets: this.sprite,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: 'Linear'
      });
    }
    
    console.log(`💎 Item created: ${config.name} (${config.rarity})`);
  }
  
  /**
   * Create glow effect based on rarity
   */
  private createGlowEffect(): void {
    // Clear graphics
    this.glowGraphics.clear();
    
    // Set color based on rarity
    let color: number;
    let alpha: number;
    let radius: number;
    
    switch (this.rarity) {
      case 'Common':
        color = 0xFFFFFF; // White
        alpha = 0.2;
        radius = 12;
        break;
      case 'Uncommon':
        color = 0x00FF00; // Green
        alpha = 0.3;
        radius = 14;
        break;
      case 'Rare':
        color = 0x0000FF; // Blue
        alpha = 0.4;
        radius = 16;
        break;
      case 'Epic':
        color = 0xA020F0; // Purple
        alpha = 0.5;
        radius = 18;
        break;
      case 'Legendary':
        color = 0xFFD700; // Gold
        alpha = 0.6;
        radius = 20;
        break;
      default:
        color = 0xFFFFFF; // White
        alpha = 0.2;
        radius = 12;
    }
    
    // Draw glow
    this.glowGraphics.fillStyle(color, alpha);
    this.glowGraphics.fillCircle(0, 0, radius);
    
    // Place behind sprite
    this.glowGraphics.setDepth(-1);
  }
  
  /**
   * Collect the item
   */
  public collect(): void {
    // Play collect animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 20,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        // Emit collect event
        this.scene.events.emit('item-collected', this);
        
        // Destroy item
        this.destroy();
      }
    });
    
    // Play collect sound
    this.scene.sound.play('collect_item', { volume: 0.5 });
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Stop tweens
    if (this.floatTween) {
      this.floatTween.stop();
    }
    if (this.rotateTween) {
      this.rotateTween.stop();
    }
    
    // Call parent destroy
    super.destroy();
  }
}

export class ItemManager {
  private scene: Phaser.Scene;
  private characterManager: CharacterManager;
  private items: Item[] = [];
  private itemConfigs: Map<string, ItemConfig> = new Map();
  
  constructor(scene: Phaser.Scene, characterManager: CharacterManager) {
    this.scene = scene;
    this.characterManager = characterManager;
    
    console.log('💎 ItemManager initialized');
    
    // Register item configs
    this.registerItemConfigs();
  }
  
  /**
   * Register item configurations
   */
  private registerItemConfigs(): void {
    // Health Potion
    this.itemConfigs.set('health_potion', {
      key: 'health_potion',
      name: 'Health Potion',
      description: 'Restores 50 health points.',
      type: 'consumable',
      rarity: 'Common',
      value: 25,
      effect: {
        type: 'health',
        amount: 50
      }
    });
    
    // Mana Potion
    this.itemConfigs.set('mana_potion', {
      key: 'mana_potion',
      name: 'Mana Potion',
      description: 'Restores 30 mana points.',
      type: 'consumable',
      rarity: 'Common',
      value: 25,
      effect: {
        type: 'mana',
        amount: 30
      }
    });
    
    // Gold Coin
    this.itemConfigs.set('gold_coin', {
      key: 'treasure_chest', // Reusing treasure chest sprite for gold
      name: 'Gold Coin',
      description: 'A shiny gold coin.',
      type: 'treasure',
      rarity: 'Common',
      value: 10,
      effect: {
        type: 'gold',
        amount: 10
      }
    });
    
    // Magic Scroll
    this.itemConfigs.set('magic_scroll', {
      key: 'magic_spell', // Reusing magic spell sprite for scroll
      name: 'Magic Scroll',
      description: 'A scroll containing powerful magic.',
      type: 'consumable',
      rarity: 'Rare',
      value: 100,
      effect: {
        type: 'experience',
        amount: 50
      }
    });
  }
  
  /**
   * Spawn an item
   */
  public spawnItem(
    x: number,
    y: number,
    type: string
  ): Item | null {
    // Get item config
    const config = this.itemConfigs.get(type);
    if (!config) {
      console.warn(`⚠️ Unknown item type: ${type}`);
      return null;
    }
    
    // Create item
    const item = new Item(this.scene, x, y, config, this.characterManager);
    
    // Add to items list
    this.items.push(item);
    
    return item;
  }
  
  /**
   * Update all items
   */
  public update(time: number, delta: number): void {
    // Items don't need updating in this implementation
  }
  
  /**
   * Get all items
   */
  public getItems(): Item[] {
    return this.items;
  }
  
  /**
   * Remove an item
   */
  public removeItem(item: Item): void {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
  
  /**
   * Clear all items
   */
  public clearItems(): void {
    // Destroy all items
    for (const item of this.items) {
      item.destroy();
    }
    
    // Clear array
    this.items = [];
  }
  
  /**
   * Apply item effect
   */
  public applyItemEffect(item: Item, target: any): void {
    // Check if item has an effect
    if (!item.effect) {
      return;
    }
    
    // Apply effect based on type
    switch (item.effect.type) {
      case 'health':
        if (target.health !== undefined && target.maxHealth !== undefined) {
          target.health = Math.min(target.health + item.effect.amount, target.maxHealth);
          console.log(`🧪 Applied health effect: +${item.effect.amount}`);
        }
        break;
      case 'mana':
        if (target.mana !== undefined && target.maxMana !== undefined) {
          target.mana = Math.min(target.mana + item.effect.amount, target.maxMana);
          console.log(`🧪 Applied mana effect: +${item.effect.amount}`);
        }
        break;
      case 'experience':
        if (target.addExperience !== undefined) {
          target.addExperience(item.effect.amount);
          console.log(`🧪 Applied experience effect: +${item.effect.amount}`);
        }
        break;
      case 'gold':
        if (target.gold !== undefined) {
          target.gold += item.effect.amount;
          console.log(`🧪 Applied gold effect: +${item.effect.amount}`);
        }
        break;
      case 'stat':
        if (item.effect.stat && target[item.effect.stat] !== undefined) {
          target[item.effect.stat] += item.effect.amount;
          console.log(`🧪 Applied stat effect: ${item.effect.stat} +${item.effect.amount}`);
        }
        break;
    }
    
    // Emit effect applied event
    this.scene.events.emit('item-effect-applied', item, target);
  }
  
  /**
   * Destroy manager
   */
  public destroy(): void {
    this.clearItems();
    console.log('💎 ItemManager destroyed');
  }
}
