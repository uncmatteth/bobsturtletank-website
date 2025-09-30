/**
 * UIManager - Handles UI elements and HUD
 * Integrates PixelLab generated UI assets with the game
 */

import Phaser from 'phaser';
import { CharacterManager } from './CharacterManager';

export class UIManager {
  private scene: Phaser.Scene;
  private characterManager: CharacterManager;
  
  // UI elements
  private container: Phaser.GameObjects.Container;
  private healthBar: Phaser.GameObjects.Graphics;
  private manaBar: Phaser.GameObjects.Graphics;
  private experienceBar: Phaser.GameObjects.Graphics;
  private levelText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;
  private buttons: Map<string, Phaser.GameObjects.Container> = new Map();
  
  // UI state
  private health: number = 100;
  private maxHealth: number = 100;
  private mana: number = 50;
  private maxMana: number = 50;
  private experience: number = 0;
  private experienceToNextLevel: number = 100;
  private level: number = 1;
  private gold: number = 0;
  
  constructor(scene: Phaser.Scene, characterManager: CharacterManager) {
    this.scene = scene;
    this.characterManager = characterManager;
    
    // Create UI container (fixed to camera)
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1000); // Always on top
    this.container.setScrollFactor(0); // Fixed to camera
    
    console.log('🖥️ UIManager initialized');
    
    // Create UI elements
    this.createUI();
  }
  
  /**
   * Create UI elements
   */
  private createUI(): void {
    // Get screen dimensions
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create health bar
    this.healthBar = this.scene.add.graphics();
    this.container.add(this.healthBar);
    
    // Create mana bar
    this.manaBar = this.scene.add.graphics();
    this.container.add(this.manaBar);
    
    // Create experience bar
    this.experienceBar = this.scene.add.graphics();
    this.container.add(this.experienceBar);
    
    // Create level text
    this.levelText = this.scene.add.text(20, 20, 'Level 1', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.container.add(this.levelText);
    
    // Create gold text
    this.goldText = this.scene.add.text(width - 20, 20, '0 Gold', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);
    this.container.add(this.goldText);
    
    // Create buttons
    this.createButtons();
    
    // Update all UI elements
    this.updateUI();
  }
  
  /**
   * Create UI buttons
   */
  private createButtons(): void {
    // Get screen dimensions
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create attack button
    this.createButton('attack', width - 100, height - 100, 'Attack', 0xFF0000);
    
    // Create inventory button
    this.createButton('inventory', width - 180, height - 100, 'Inventory', 0x00FF00);
    
    // Create map button
    this.createButton('map', width - 260, height - 100, 'Map', 0x0000FF);
  }
  
  /**
   * Create a UI button
   */
  private createButton(
    key: string,
    x: number,
    y: number,
    text: string,
    color: number
  ): void {
    // Create button container
    const button = this.scene.add.container(x, y);
    
    // Try to use UI button sprite
    const buttonSprite = this.characterManager.createSprite(0, 0, 'ui_button');
    
    if (buttonSprite) {
      button.add(buttonSprite);
    } else {
      // Fallback to graphics
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(color, 0.8);
      graphics.fillRoundedRect(-40, -20, 80, 40, 10);
      graphics.lineStyle(2, 0xFFFFFF, 1);
      graphics.strokeRoundedRect(-40, -20, 80, 40, 10);
      button.add(graphics);
    }
    
    // Add text
    const buttonText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    button.add(buttonText);
    
    // Make interactive
    button.setSize(80, 40);
    button.setInteractive(new Phaser.Geom.Rectangle(-40, -20, 80, 40), Phaser.Geom.Rectangle.Contains);
    
    // Add hover effect
    button.on('pointerover', () => {
      buttonText.setScale(1.1);
    });
    
    button.on('pointerout', () => {
      buttonText.setScale(1);
    });
    
    // Add click effect
    button.on('pointerdown', () => {
      buttonText.setScale(0.9);
    });
    
    button.on('pointerup', () => {
      buttonText.setScale(1);
      this.handleButtonClick(key);
    });
    
    // Add to container
    this.container.add(button);
    
    // Store button
    this.buttons.set(key, button);
  }
  
  /**
   * Handle button click
   */
  private handleButtonClick(key: string): void {
    // Emit button click event
    this.scene.events.emit('ui-button-click', key);
    
    console.log(`🖱️ Button clicked: ${key}`);
  }
  
  /**
   * Update UI elements
   */
  private updateUI(): void {
    // Update health bar
    this.updateHealthBar();
    
    // Update mana bar
    this.updateManaBar();
    
    // Update experience bar
    this.updateExperienceBar();
    
    // Update level text
    this.levelText.setText(`Level ${this.level}`);
    
    // Update gold text
    this.goldText.setText(`${this.gold} Gold`);
  }
  
  /**
   * Update health bar
   */
  private updateHealthBar(): void {
    // Clear graphics
    this.healthBar.clear();
    
    // Get screen dimensions
    const width = this.scene.cameras.main.width;
    
    // Draw background
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(20, 50, 200, 20);
    
    // Draw health
    this.healthBar.fillStyle(0xFF0000);
    this.healthBar.fillRect(20, 50, 200 * (this.health / this.maxHealth), 20);
    
    // Draw border
    this.healthBar.lineStyle(2, 0xFFFFFF, 1);
    this.healthBar.strokeRect(20, 50, 200, 20);
    
    // Draw text
    if (!this.healthBar.getData('text')) {
      const text = this.scene.add.text(120, 60, `${this.health}/${this.maxHealth}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      this.container.add(text);
      this.healthBar.setData('text', text);
    } else {
      const text = this.healthBar.getData('text') as Phaser.GameObjects.Text;
      text.setText(`${this.health}/${this.maxHealth}`);
    }
  }
  
  /**
   * Update mana bar
   */
  private updateManaBar(): void {
    // Clear graphics
    this.manaBar.clear();
    
    // Get screen dimensions
    const width = this.scene.cameras.main.width;
    
    // Draw background
    this.manaBar.fillStyle(0x000000, 0.5);
    this.manaBar.fillRect(20, 80, 200, 15);
    
    // Draw mana
    this.manaBar.fillStyle(0x0000FF);
    this.manaBar.fillRect(20, 80, 200 * (this.mana / this.maxMana), 15);
    
    // Draw border
    this.manaBar.lineStyle(2, 0xFFFFFF, 1);
    this.manaBar.strokeRect(20, 80, 200, 15);
    
    // Draw text
    if (!this.manaBar.getData('text')) {
      const text = this.scene.add.text(120, 87, `${this.mana}/${this.maxMana}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      this.container.add(text);
      this.manaBar.setData('text', text);
    } else {
      const text = this.manaBar.getData('text') as Phaser.GameObjects.Text;
      text.setText(`${this.mana}/${this.maxMana}`);
    }
  }
  
  /**
   * Update experience bar
   */
  private updateExperienceBar(): void {
    // Clear graphics
    this.experienceBar.clear();
    
    // Get screen dimensions
    const width = this.scene.cameras.main.width;
    
    // Draw background
    this.experienceBar.fillStyle(0x000000, 0.5);
    this.experienceBar.fillRect(0, this.scene.cameras.main.height - 10, width, 10);
    
    // Draw experience
    this.experienceBar.fillStyle(0xFFFF00);
    this.experienceBar.fillRect(0, this.scene.cameras.main.height - 10, width * (this.experience / this.experienceToNextLevel), 10);
    
    // Draw text
    if (!this.experienceBar.getData('text')) {
      const text = this.scene.add.text(width / 2, this.scene.cameras.main.height - 5, `XP: ${this.experience}/${this.experienceToNextLevel}`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);
      
      this.container.add(text);
      this.experienceBar.setData('text', text);
    } else {
      const text = this.experienceBar.getData('text') as Phaser.GameObjects.Text;
      text.setText(`XP: ${this.experience}/${this.experienceToNextLevel}`);
    }
  }
  
  /**
   * Update player stats
   */
  public updatePlayerStats(
    health: number,
    maxHealth: number,
    mana: number,
    maxMana: number,
    experience: number,
    experienceToNextLevel: number,
    level: number,
    gold?: number
  ): void {
    // Update stats
    this.health = health;
    this.maxHealth = maxHealth;
    this.mana = mana;
    this.maxMana = maxMana;
    this.experience = experience;
    this.experienceToNextLevel = experienceToNextLevel;
    this.level = level;
    if (gold !== undefined) this.gold = gold;
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Show a message
   */
  public showMessage(
    message: string,
    duration: number = 3000
  ): void {
    // Get screen dimensions
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create message background
    const background = this.scene.add.graphics();
    background.fillStyle(0x000000, 0.7);
    background.fillRoundedRect(width / 2 - 200, height / 2 - 50, 400, 100, 10);
    background.lineStyle(2, 0xFFFFFF, 1);
    background.strokeRoundedRect(width / 2 - 200, height / 2 - 50, 400, 100, 10);
    
    // Create message text
    const text = this.scene.add.text(width / 2, height / 2, message, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 380 }
    }).setOrigin(0.5);
    
    // Add to container
    const messageContainer = this.scene.add.container(0, 0, [background, text]);
    messageContainer.setDepth(2000); // Above UI
    messageContainer.setScrollFactor(0); // Fixed to camera
    
    // Fade in
    messageContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: messageContainer,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        // Wait and fade out
        this.scene.time.delayedCall(duration, () => {
          this.scene.tweens.add({
            targets: messageContainer,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              messageContainer.destroy();
            }
          });
        });
      }
    });
  }
  
  /**
   * Show a tooltip
   */
  public showTooltip(
    x: number,
    y: number,
    text: string
  ): Phaser.GameObjects.Container {
    // Create tooltip background
    const background = this.scene.add.graphics();
    background.fillStyle(0x000000, 0.7);
    background.fillRoundedRect(-100, -50, 200, 100, 5);
    background.lineStyle(1, 0xFFFFFF, 0.5);
    background.strokeRoundedRect(-100, -50, 200, 100, 5);
    
    // Create tooltip text
    const tooltipText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 180 }
    }).setOrigin(0.5);
    
    // Create tooltip container
    const tooltip = this.scene.add.container(x, y, [background, tooltipText]);
    tooltip.setDepth(1500); // Above UI but below messages
    tooltip.setScrollFactor(0); // Fixed to camera
    
    return tooltip;
  }
  
  /**
   * Hide a tooltip
   */
  public hideTooltip(tooltip: Phaser.GameObjects.Container): void {
    // Fade out and destroy
    this.scene.tweens.add({
      targets: tooltip,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        tooltip.destroy();
      }
    });
  }
  
  /**
   * Resize UI
   */
  public resize(width: number, height: number): void {
    // Update positions of UI elements
    
    // Gold text
    this.goldText.setPosition(width - 20, 20);
    
    // Experience bar
    if (this.experienceBar.getData('text')) {
      const text = this.experienceBar.getData('text') as Phaser.GameObjects.Text;
      text.setPosition(width / 2, height - 5);
    }
    
    // Buttons
    if (this.buttons.has('attack')) {
      const attackButton = this.buttons.get('attack')!;
      attackButton.setPosition(width - 100, height - 100);
    }
    
    if (this.buttons.has('inventory')) {
      const inventoryButton = this.buttons.get('inventory')!;
      inventoryButton.setPosition(width - 180, height - 100);
    }
    
    if (this.buttons.has('map')) {
      const mapButton = this.buttons.get('map')!;
      mapButton.setPosition(width - 260, height - 100);
    }
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Destroy manager
   */
  public destroy(): void {
    // Destroy container and all children
    this.container.destroy();
    
    console.log('🖥️ UIManager destroyed');
  }
}
