/**
 * RexUIManager - Professional UI components using Rex UI Plugin
 * Manages all UI elements for the game
 */

import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

export class RexUIManager {
  private scene: Phaser.Scene;
  private rexUI: RexUIPlugin;
  
  // UI components
  private healthBar: any;
  private manaBar: any;
  private floorText: any;
  private messageBox: any;
  private inventory: any;
  private skillTree: any;
  private pauseMenu: any;
  private tooltip: any;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.rexUI = (this.scene.plugins.get('rexUI') as any);
    
    if (!this.rexUI) {
      console.warn('Rex UI Plugin not found. Using fallback UI.');
      return;
    }
  }
  
  /**
   * Create all UI components
   */
  public createUI(): void {
    this.createHealthBar();
    this.createManaBar();
    this.createFloorText();
    this.createMessageBox();
    this.createVirtualJoystick();
    this.createActionButtons();
  }
  
  /**
   * Create health bar
   */
  private createHealthBar(): void {
    if (!this.rexUI) {
      // Fallback to basic health bar
      const graphics = this.scene.add.graphics();
      graphics.setScrollFactor(0);
      this.healthBar = {
        graphics,
        update: (value: number) => {
          graphics.clear();
          graphics.fillStyle(0x000000, 0.5);
          graphics.fillRect(10, 10, 200, 30);
          graphics.fillStyle(0x00ff00);
          graphics.fillRect(10, 10, 200 * value, 30);
          graphics.lineStyle(2, 0xffffff);
          graphics.strokeRect(10, 10, 200, 30);
        }
      };
      return;
    }
    
    // Create Rex UI progress bar
    this.healthBar = this.rexUI.add.slider({
      x: 110,
      y: 25,
      width: 200,
      height: 30,
      orientation: 'horizontal',
      
      track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 5, 0x333333),
      indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 5, 0x00ff00),
      thumb: this.rexUI.add.roundRectangle(0, 0, 16, 16, 8, 0xffffff),
      
      input: 'none',
      value: 1
    })
    .layout()
    .setScrollFactor(0);
    
    // Add health icon
    this.scene.add.text(20, 25, '❤️', { 
      fontSize: '24px' 
    })
    .setOrigin(0.5)
    .setScrollFactor(0);
  }
  
  /**
   * Create mana bar
   */
  private createManaBar(): void {
    if (!this.rexUI) {
      // Fallback to basic mana bar
      const graphics = this.scene.add.graphics();
      graphics.setScrollFactor(0);
      this.manaBar = {
        graphics,
        update: (value: number) => {
          graphics.clear();
          graphics.fillStyle(0x000000, 0.5);
          graphics.fillRect(10, 50, 200, 30);
          graphics.fillStyle(0x0000ff);
          graphics.fillRect(10, 50, 200 * value, 30);
          graphics.lineStyle(2, 0xffffff);
          graphics.strokeRect(10, 50, 200, 30);
        }
      };
      return;
    }
    
    // Create Rex UI progress bar
    this.manaBar = this.rexUI.add.slider({
      x: 110,
      y: 65,
      width: 200,
      height: 30,
      orientation: 'horizontal',
      
      track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 5, 0x333333),
      indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 5, 0x0000ff),
      thumb: this.rexUI.add.roundRectangle(0, 0, 16, 16, 8, 0xffffff),
      
      input: 'none',
      value: 1
    })
    .layout()
    .setScrollFactor(0);
    
    // Add mana icon
    this.scene.add.text(20, 65, '✨', { 
      fontSize: '24px' 
    })
    .setOrigin(0.5)
    .setScrollFactor(0);
  }
  
  /**
   * Create floor text
   */
  private createFloorText(): void {
    if (!this.rexUI) {
      // Fallback to basic text
      this.floorText = this.scene.add.text(10, 100, 'Floor: 1', {
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setScrollFactor(0);
      return;
    }
    
    // Create Rex UI label
    this.floorText = this.rexUI.add.label({
      x: 110,
      y: 105,
      width: 200,
      height: 40,
      
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x333333),
      text: this.scene.add.text(0, 0, 'Floor: 1', {
        fontSize: '24px',
        color: '#ffffff'
      }),
      
      space: {
        left: 15,
        right: 15,
        top: 10,
        bottom: 10
      }
    })
    .layout()
    .setScrollFactor(0);
  }
  
  /**
   * Create message box
   */
  private createMessageBox(): void {
    if (!this.rexUI) {
      // Fallback to basic text
      const text = this.scene.add.text(
        this.scene.cameras.main.width / 2, 
        this.scene.cameras.main.height - 50, 
        '', 
        {
          fontSize: '18px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 4,
          backgroundColor: '#00000088',
          padding: { x: 10, y: 5 }
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);
      
      this.messageBox = {
        text,
        show: (message: string, duration: number = 3000) => {
          text.setText(message).setVisible(true);
          this.scene.time.delayedCall(duration, () => {
            text.setVisible(false);
          });
        }
      };
      return;
    }
    
    // Create Rex UI toast
    this.messageBox = this.rexUI.add.toast({
      x: this.scene.cameras.main.width / 2,
      y: this.scene.cameras.main.height - 50,
      
      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0x333333),
      text: this.scene.add.text(0, 0, '', {
        fontSize: '18px',
        color: '#ffffff'
      }),
      
      space: {
        left: 20,
        right: 20,
        top: 10,
        bottom: 10
      },
      
      duration: {
        in: 200,
        hold: 3000,
        out: 200
      }
    })
    .setScrollFactor(0);
  }
  
  /**
   * Create virtual joystick for mobile
   */
  private createVirtualJoystick(): void {
    // Only create joystick on touch devices
    if (!this.scene.sys.game.device.input.touch) return;
    
    if (!this.rexUI) {
      console.warn('Virtual joystick requires Rex UI Plugin');
      return;
    }
    
    // Create virtual joystick
    const joystick = this.rexUI.add.joystick({
      x: 150,
      y: this.scene.cameras.main.height - 150,
      radius: 100,
      base: this.rexUI.add.circle(0, 0, 50, 0x888888),
      thumb: this.rexUI.add.circle(0, 0, 25, 0xcccccc),
      dir: '8dir',
      forceMin: 16,
      enable: true
    })
    .setScrollFactor(0);
    
    // Export joystick to the scene
    (this.scene as any).joystick = joystick;
    
    // Make semi-transparent
    joystick.base.setAlpha(0.7);
    joystick.thumb.setAlpha(0.7);
  }
  
  /**
   * Create action buttons for mobile
   */
  private createActionButtons(): void {
    // Only create buttons on touch devices
    if (!this.scene.sys.game.device.input.touch) return;
    
    if (!this.rexUI) {
      console.warn('Action buttons require Rex UI Plugin');
      return;
    }
    
    // Create attack button
    const attackButton = this.rexUI.add.label({
      x: this.scene.cameras.main.width - 120,
      y: this.scene.cameras.main.height - 180,
      width: 80,
      height: 80,
      
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 40, 0xff0000),
      text: this.scene.add.text(0, 0, '⚔️', { fontSize: '32px' }),
      
      space: { left: 0, right: 0, top: 0, bottom: 0 }
    })
    .setScrollFactor(0)
    .layout();
    
    // Create cast button
    const castButton = this.rexUI.add.label({
      x: this.scene.cameras.main.width - 60,
      y: this.scene.cameras.main.height - 120,
      width: 80,
      height: 80,
      
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 40, 0x0000ff),
      text: this.scene.add.text(0, 0, '✨', { fontSize: '32px' }),
      
      space: { left: 0, right: 0, top: 0, bottom: 0 }
    })
    .setScrollFactor(0)
    .layout();
    
    // Create inventory button
    const inventoryButton = this.rexUI.add.label({
      x: this.scene.cameras.main.width - 180,
      y: this.scene.cameras.main.height - 120,
      width: 80,
      height: 80,
      
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 40, 0x00ff00),
      text: this.scene.add.text(0, 0, '🎒', { fontSize: '32px' }),
      
      space: { left: 0, right: 0, top: 0, bottom: 0 }
    })
    .setScrollFactor(0)
    .layout();
    
    // Make semi-transparent
    attackButton.getElement('background').setAlpha(0.7);
    castButton.getElement('background').setAlpha(0.7);
    inventoryButton.getElement('background').setAlpha(0.7);
    
    // Add interactivity
    attackButton.setInteractive()
      .on('pointerdown', () => {
        (this.scene as any).attackButtonDown = true;
      })
      .on('pointerup', () => {
        (this.scene as any).attackButtonDown = false;
      });
    
    castButton.setInteractive()
      .on('pointerdown', () => {
        (this.scene as any).castButtonDown = true;
      })
      .on('pointerup', () => {
        (this.scene as any).castButtonDown = false;
      });
    
    inventoryButton.setInteractive()
      .on('pointerdown', () => {
        this.scene.scene.launch('InventoryScene');
        this.scene.scene.pause('GameSceneECS');
      });
    
    // Export buttons to the scene
    (this.scene as any).mobileButtons = {
      attack: attackButton,
      cast: castButton,
      inventory: inventoryButton
    };
  }
  
  /**
   * Show a message
   */
  public showMessage(message: string, duration: number = 3000): void {
    if (this.messageBox) {
      if (this.rexUI) {
        this.messageBox.show(message);
      } else {
        this.messageBox.show(message, duration);
      }
    }
  }
  
  /**
   * Update health bar
   */
  public updateHealthBar(value: number): void {
    if (this.healthBar) {
      if (this.rexUI) {
        this.healthBar.setValue(value);
      } else {
        this.healthBar.update(value);
      }
    }
  }
  
  /**
   * Update mana bar
   */
  public updateManaBar(value: number): void {
    if (this.manaBar) {
      if (this.rexUI) {
        this.manaBar.setValue(value);
      } else {
        this.manaBar.update(value);
      }
    }
  }
  
  /**
   * Update floor text
   */
  public updateFloorText(floor: number): void {
    if (this.floorText) {
      if (this.rexUI) {
        this.floorText.setText(`Floor: ${floor}`);
      } else {
        this.floorText.setText(`Floor: ${floor}`);
      }
    }
  }
  
  /**
   * Show tooltip
   */
  public showTooltip(x: number, y: number, text: string): void {
    if (!this.rexUI) return;
    
    if (!this.tooltip) {
      this.tooltip = this.rexUI.add.label({
        x, y,
        background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x333333),
        text: this.scene.add.text(0, 0, text, {
          fontSize: '16px',
          color: '#ffffff'
        }),
        space: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10
        }
      })
      .layout()
      .setScrollFactor(0)
      .setDepth(1000);
    } else {
      this.tooltip.setText(text);
      this.tooltip.setPosition(x, y);
      this.tooltip.layout();
    }
  }
  
  /**
   * Hide tooltip
   */
  public hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.setVisible(false);
    }
  }
}





