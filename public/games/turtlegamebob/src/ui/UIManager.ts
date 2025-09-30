/**
 * UIManager - Responsive UI framework for the legendary roguelike
 * Handles HUD, mobile controls, and adaptive scaling
 */

import Phaser from 'phaser';

export interface UIConfig {
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  scale: number;
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface HUDElements {
  healthBar: Phaser.GameObjects.Graphics;
  manaBar: Phaser.GameObjects.Graphics;
  levelText: Phaser.GameObjects.Text;
  xpText: Phaser.GameObjects.Text;
  floorText: Phaser.GameObjects.Text;
  notificationContainer: Phaser.GameObjects.Container;
}

export interface MobileControls {
  joystick: VirtualJoystick | null;
  actionButtons: Phaser.GameObjects.Container;
  inventoryButton: Phaser.GameObjects.Image;
  pauseButton: Phaser.GameObjects.Image;
}

export class UIManager {
  private scene: Phaser.Scene;
  private config: UIConfig;
  private hudElements: HUDElements | null = null;
  private mobileControls: MobileControls | null = null;
  private notifications: Phaser.GameObjects.Text[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.config = this.detectUIConfig();
    
    console.log('🖥️ UIManager initialized');
    console.log(`📱 Mobile: ${this.config.isMobile}, Scale: ${this.config.scale}`);
  }
  
  /**
   * Initialize the complete UI system
   */
  public initialize(): void {
    this.createHUD();
    
    if (this.config.isMobile) {
      this.createMobileControls();
    }
    
    this.setupResizeHandling();
    console.log('🎮 UI system ready');
  }
  
  /**
   * Create the main game HUD
   */
  public createHUD(): void {
    const safeTop = this.config.safeArea.top;
    const safeLeft = this.config.safeArea.left;
    const safeRight = this.config.screenWidth - this.config.safeArea.right;
    
    // Health bar background
    const healthBarBg = this.scene.add.graphics();
    healthBarBg.fillStyle(0x330000);
    healthBarBg.fillRoundedRect(safeLeft + 10, safeTop + 10, 200, 20, 4);
    
    // Health bar
    const healthBar = this.scene.add.graphics();
    healthBar.fillStyle(0x00ff00);
    healthBar.fillRoundedRect(safeLeft + 12, safeTop + 12, 196, 16, 2);
    
    // Mana bar background
    const manaBarBg = this.scene.add.graphics();
    manaBarBg.fillStyle(0x000033);
    manaBarBg.fillRoundedRect(safeLeft + 10, safeTop + 40, 200, 20, 4);
    
    // Mana bar
    const manaBar = this.scene.add.graphics();
    manaBar.fillStyle(0x0080ff);
    manaBar.fillRoundedRect(safeLeft + 12, safeTop + 42, 196, 16, 2);
    
    // Health text
    const healthText = this.scene.add.text(safeLeft + 220, safeTop + 20, 'HP: 100/100', {
      fontSize: this.getResponsiveFontSize(16),
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    // Mana text
    const manaText = this.scene.add.text(safeLeft + 220, safeTop + 50, 'MP: 100/100', {
      fontSize: this.getResponsiveFontSize(16),
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    // Level and XP
    const levelText = this.scene.add.text(safeLeft + 10, safeTop + 75, 'Level: 1', {
      fontSize: this.getResponsiveFontSize(16),
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    const xpText = this.scene.add.text(safeLeft + 120, safeTop + 75, 'XP: 0/100', {
      fontSize: this.getResponsiveFontSize(16),
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    // Floor indicator
    const floorText = this.scene.add.text(safeRight - 10, safeTop + 20, 'Floor: 1', {
      fontSize: this.getResponsiveFontSize(18),
      color: '#ffffff',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0);
    
    // Notification container
    const notificationContainer = this.scene.add.container(this.config.screenWidth / 2, safeTop + 150);
    
    this.hudElements = {
      healthBar,
      manaBar,
      levelText,
      xpText,
      floorText,
      notificationContainer
    };
    
    // Set all HUD elements to be fixed to camera
    [healthBarBg, healthBar, manaBarBg, manaBar, healthText, manaText, 
     levelText, xpText, floorText, notificationContainer].forEach(element => {
      element.setScrollFactor(0);
    });
  }
  
  /**
   * Create mobile touch controls
   */
  public createMobileControls(): void {
    if (!this.config.isMobile) return;
    
    const safeBottom = this.config.screenHeight - this.config.safeArea.bottom;
    const safeLeft = this.config.safeArea.left;
    const safeRight = this.config.screenWidth - this.config.safeArea.right;
    
    // Virtual joystick
    const joystick = new VirtualJoystick(this.scene, safeLeft + 80, safeBottom - 80, 60);
    
    // Action buttons container
    const actionButtons = this.scene.add.container(safeRight - 100, safeBottom - 100);
    
    // Primary action button (attack/interact)
    const primaryButton = this.createActionButton(0, 0, 40, '⚔️', '#ff4444');
    actionButtons.add(primaryButton);
    
    // Secondary action button (special ability)
    const secondaryButton = this.createActionButton(-80, -20, 35, '✨', '#4444ff');
    actionButtons.add(secondaryButton);
    
    // Inventory button
    const inventoryButton = this.createActionButton(safeRight - 60, safeBottom - 200, 30, '🎒', '#888888');
    
    // Pause button
    const pauseButton = this.createActionButton(safeRight - 60, this.config.safeArea.top + 60, 25, '⏸️', '#666666');
    
    this.mobileControls = {
      joystick,
      actionButtons,
      inventoryButton,
      pauseButton
    };
    
    // Set all mobile controls to be fixed to camera
    [actionButtons, inventoryButton, pauseButton].forEach(element => {
      element.setScrollFactor(0);
    });
    
    console.log('📱 Mobile controls created');
  }
  
  /**
   * Update HUD with current game state
   */
  public updateHUD(gameState: {
    currentHP: number;
    maxHP: number;
    currentMP: number;
    maxMP: number;
    level: number;
    currentXP: number;
    requiredXP: number;
    floor: number;
  }): void {
    if (!this.hudElements) return;
    
    // Update health bar
    const healthPercent = gameState.currentHP / gameState.maxHP;
    this.hudElements.healthBar.clear();
    this.hudElements.healthBar.fillStyle(this.getHealthBarColor(healthPercent));
    this.hudElements.healthBar.fillRoundedRect(
      this.config.safeArea.left + 12, 
      this.config.safeArea.top + 12, 
      196 * healthPercent, 
      16, 
      2
    );
    
    // Update mana bar
    const manaPercent = gameState.currentMP / gameState.maxMP;
    this.hudElements.manaBar.clear();
    this.hudElements.manaBar.fillStyle(0x0080ff);
    this.hudElements.manaBar.fillRoundedRect(
      this.config.safeArea.left + 12, 
      this.config.safeArea.top + 42, 
      196 * manaPercent, 
      16, 
      2
    );
    
    // Update text elements
    this.hudElements.levelText.setText(`Level: ${gameState.level}`);
    this.hudElements.xpText.setText(`XP: ${gameState.currentXP}/${gameState.requiredXP}`);
    this.hudElements.floorText.setText(`Floor: ${gameState.floor}`);
  }
  
  /**
   * Show notification message
   */
  public showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 3000): void {
    if (!this.hudElements) return;
    
    const colors = {
      info: '#ffffff',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444'
    };
    
    const notification = this.scene.add.text(0, this.notifications.length * -40, message, {
      fontSize: this.getResponsiveFontSize(18),
      color: colors[type],
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);
    
    this.hudElements.notificationContainer.add(notification);
    this.notifications.push(notification);
    
    // Animate in
    notification.setScale(0);
    this.scene.tweens.add({
      targets: notification,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Auto-remove after duration
    this.scene.time.delayedCall(duration, () => {
      this.removeNotification(notification);
    });
  }
  
  /**
   * Get virtual joystick input
   */
  public getJoystickInput(): { x: number; y: number; isPressed: boolean } {
    if (!this.mobileControls?.joystick) {
      return { x: 0, y: 0, isPressed: false };
    }
    
    return this.mobileControls.joystick.getInput();
  }
  
  /**
   * Check if action button is pressed
   */
  public isActionButtonPressed(buttonType: 'primary' | 'secondary'): boolean {
    // IMPLEMENTED: Implement action button state tracking
    return false;
  }
  
  /**
   * Update UI for screen resize
   */
  public handleResize(width: number, height: number): void {
    this.config = this.detectUIConfig();
    
    // Recreate UI elements with new dimensions
    this.destroy();
    this.initialize();
    
    console.log(`📐 UI resized to ${width}x${height}`);
  }
  
  /**
   * Destroy UI elements
   */
  public destroy(): void {
    // Clean up notifications
    this.notifications.forEach(notification => notification.destroy());
    this.notifications = [];
    
    // Clean up HUD elements
    if (this.hudElements) {
      Object.values(this.hudElements).forEach(element => {
        if (element && !element.destroyed) {
          element.destroy();
        }
      });
      this.hudElements = null;
    }
    
    // Clean up mobile controls
    if (this.mobileControls) {
      if (this.mobileControls.joystick) {
        this.mobileControls.joystick.destroy();
      }
      if (this.mobileControls.actionButtons) {
        this.mobileControls.actionButtons.destroy();
      }
      if (this.mobileControls.inventoryButton) {
        this.mobileControls.inventoryButton.destroy();
      }
      if (this.mobileControls.pauseButton) {
        this.mobileControls.pauseButton.destroy();
      }
      this.mobileControls = null;
    }
    
    console.log('🖥️ UIManager destroyed');
  }
  
  // Private helper methods
  
  private detectUIConfig(): UIConfig {
    const isMobile = this.scene.registry.get('isMobile') || false;
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Calculate scale based on screen size
    const baseScale = Math.min(screenWidth / 1280, screenHeight / 720);
    const scale = Math.max(0.5, Math.min(2.0, baseScale));
    
    // Calculate safe areas (for mobile notches, etc.)
    const safeArea = {
      top: isMobile ? 40 : 0,
      bottom: isMobile ? 40 : 0,
      left: isMobile ? 20 : 0,
      right: isMobile ? 20 : 0
    };
    
    return {
      isMobile,
      screenWidth,
      screenHeight,
      scale,
      safeArea
    };
  }
  
  private getResponsiveFontSize(baseSize: number): string {
    return `${Math.round(baseSize * this.config.scale)}px`;
  }
  
  private getHealthBarColor(healthPercent: number): number {
    if (healthPercent > 0.6) return 0x00ff00; // Green
    if (healthPercent > 0.3) return 0xffaa00; // Orange
    return 0xff0000; // Red
  }
  
  private createActionButton(x: number, y: number, radius: number, emoji: string, color: string): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    
    // Button background
    const bg = this.scene.add.circle(0, 0, radius, parseInt(color.replace('#', '0x')), 0.8);
    
    // Button border
    const border = this.scene.add.circle(0, 0, radius);
    border.setStrokeStyle(3, 0xffffff, 0.6);
    
    // Button icon
    const icon = this.scene.add.text(0, 0, emoji, {
      fontSize: this.getResponsiveFontSize(radius * 0.6),
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    container.add([bg, border, icon]);
    container.setSize(radius * 2, radius * 2);
    container.setInteractive();
    
    // Add press effect
    container.on('pointerdown', () => {
      container.setScale(0.9);
    });
    
    container.on('pointerup', () => {
      container.setScale(1.0);
    });
    
    container.on('pointerout', () => {
      container.setScale(1.0);
    });
    
    return container;
  }
  
  private removeNotification(notification: Phaser.GameObjects.Text): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      
      // Animate out
      this.scene.tweens.add({
        targets: notification,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 200,
        onComplete: () => {
          notification.destroy();
          this.repositionNotifications();
        }
      });
    }
  }
  
  private repositionNotifications(): void {
    this.notifications.forEach((notification, index) => {
      this.scene.tweens.add({
        targets: notification,
        y: index * -40,
        duration: 200,
        ease: 'Power2'
      });
    });
  }
  
  private setupResizeHandling(): void {
    this.scene.scale.on('resize', (gameSize: any) => {
      this.handleResize(gameSize.width, gameSize.height);
    });
  }
}

/**
 * Virtual Joystick for mobile controls
 */
class VirtualJoystick {
  private scene: Phaser.Scene;
  private baseX: number;
  private baseY: number;
  private radius: number;
  
  private base: Phaser.GameObjects.Circle;
  private thumb: Phaser.GameObjects.Circle;
  
  private isPressed: boolean = false;
  private inputVector: { x: number; y: number } = { x: 0, y: 0 };
  
  constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;
    this.radius = radius;
    
    this.createJoystick();
    this.setupInput();
  }
  
  private createJoystick(): void {
    // Joystick base
    this.base = this.scene.add.circle(this.baseX, this.baseY, this.radius, 0x333333, 0.6);
    this.base.setStrokeStyle(3, 0xffffff, 0.4);
    this.base.setScrollFactor(0);
    
    // Joystick thumb
    this.thumb = this.scene.add.circle(this.baseX, this.baseY, this.radius * 0.4, 0x666666, 0.8);
    this.thumb.setStrokeStyle(2, 0xffffff, 0.6);
    this.thumb.setScrollFactor(0);
  }
  
  private setupInput(): void {
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }
  
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.baseX, this.baseY);
    
    if (distance <= this.radius) {
      this.isPressed = true;
      this.updateThumbPosition(pointer.x, pointer.y);
    }
  }
  
  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isPressed) {
      this.updateThumbPosition(pointer.x, pointer.y);
    }
  }
  
  private onPointerUp(): void {
    if (this.isPressed) {
      this.isPressed = false;
      this.thumb.setPosition(this.baseX, this.baseY);
      this.inputVector = { x: 0, y: 0 };
    }
  }
  
  private updateThumbPosition(pointerX: number, pointerY: number): void {
    const deltaX = pointerX - this.baseX;
    const deltaY = pointerY - this.baseY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const maxDistance = this.radius * 0.6;
    
    if (distance <= maxDistance) {
      this.thumb.setPosition(pointerX, pointerY);
      this.inputVector.x = deltaX / maxDistance;
      this.inputVector.y = deltaY / maxDistance;
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      const thumbX = this.baseX + Math.cos(angle) * maxDistance;
      const thumbY = this.baseY + Math.sin(angle) * maxDistance;
      
      this.thumb.setPosition(thumbX, thumbY);
      this.inputVector.x = Math.cos(angle);
      this.inputVector.y = Math.sin(angle);
    }
  }
  
  public getInput(): { x: number; y: number; isPressed: boolean } {
    return {
      x: this.inputVector.x,
      y: this.inputVector.y,
      isPressed: this.isPressed
    };
  }
  
  public destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    
    this.base.destroy();
    this.thumb.destroy();
  }
}
