import Phaser from 'phaser';
import { TurtleController } from './turtle-controller';

export class HeightTracker {
  private scene: Phaser.Scene;
  private turtleController: TurtleController;
  
  private heightDisplay!: Phaser.GameObjects.Text;
  private bestHeightDisplay!: Phaser.GameObjects.Text;
  private heightMeter!: Phaser.GameObjects.Graphics;
  
  private startY: number = 0;
  private currentHeight: number = 0;
  private bestHeight: number = 0;
  private lastMilestone: number = 0;

  constructor(scene: Phaser.Scene, turtleController: TurtleController) {
    this.scene = scene;
    this.turtleController = turtleController;
    this.setupHeightDisplay();
    this.loadBestHeight();
  }

  private setupHeightDisplay() {
    const { width } = this.scene.cameras.main;
    
    // Current height display
    this.heightDisplay = this.scene.add.text(20, 20, 'Height: 0 SUPER MEGA ULTIMATE TO THE MAX EXTREME TURTLE UNITS!', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(1000);
    
    // Best height display
    this.bestHeightDisplay = this.scene.add.text(20, 60, `Best: ${this.bestHeight} SUPER MEGA ULTIMATE TO THE MAX EXTREME TURTLE UNITS!`, {
      fontSize: '18px',
      color: '#FFFF00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(1000);
    
    // Epic combo display
    this.createComboDisplay();
    
    // Create height meter on the right side
    this.heightMeter = this.scene.add.graphics();
    this.heightMeter.setScrollFactor(0).setDepth(1000);
    
    // Set starting position for height calculation
    const turtle = this.turtleController.getTurtle();
    this.startY = turtle.y;
  }

  private createComboDisplay() {
    // This will be updated each frame in the update method
  }

  private loadBestHeight() {
    // Load best height from localStorage
    const saved = localStorage.getItem('bob-turtle-best-height');
    this.bestHeight = saved ? parseInt(saved) : 0;
  }

  private saveBestHeight() {
    // Save best height to localStorage
    localStorage.setItem('bob-turtle-best-height', this.bestHeight.toString());
  }

  public update() {
    this.updateHeight();
    this.updateDisplay();
    this.updateHeightMeter();
    this.checkMilestones();
  }

  private updateHeight() {
    const turtle = this.turtleController.getTurtle();
    const heightInPixels = this.startY - turtle.y;
    
    // Convert pixels to turtle units (1 turtle unit = 30 pixels for nice scaling)
    this.currentHeight = Math.max(0, Math.floor(heightInPixels / 30));
    
    // Update best height if current is higher
    if (this.currentHeight > this.bestHeight) {
      this.bestHeight = this.currentHeight;
      this.saveBestHeight();
      this.showNewRecord();
    }
  }

  private updateDisplay() {
    this.heightDisplay.setText(`Height: ${this.currentHeight} SUPER MEGA ULTIMATE TO THE MAX EXTREME TURTLE UNITS!`);
    this.bestHeightDisplay.setText(`Best: ${this.bestHeight} SUPER MEGA ULTIMATE TO THE MAX EXTREME TURTLE UNITS!`);
    
    // Color coding based on performance
    if (this.currentHeight === this.bestHeight && this.currentHeight > 0) {
      this.heightDisplay.setColor('#00FF00'); // Green for new record
    } else if (this.currentHeight > this.bestHeight * 0.8) {
      this.heightDisplay.setColor('#FFFF00'); // Yellow for good performance
    } else {
      this.heightDisplay.setColor('#FFFFFF'); // White for normal
    }
  }

  private updateHeightMeter() {
    const { width, height } = this.scene.cameras.main;
    
    this.heightMeter.clear();
    
    // Draw meter background (full height, right edge)
    const meterX = width - 16;
    const meterY = 12;
    const meterWidth = 10;
    const meterHeight = height - 24;
    
    this.heightMeter.fillStyle(0x0e0e0e, 0.6);
    this.heightMeter.fillRect(meterX - meterWidth, meterY, meterWidth, meterHeight);
    
    // Draw meter border
    this.heightMeter.lineStyle(1, 0xFFFFFF, 0.6);
    this.heightMeter.strokeRect(meterX - meterWidth, meterY, meterWidth, meterHeight);
    
    // SMART INFINITE SCALING HEIGHT METER!
    this.drawInfiniteHeightMeter(meterX, meterY, meterWidth, meterHeight);
    
    // Add smart milestone markers
    this.drawSmartMilestoneMarkers(meterX, meterY, meterWidth, meterHeight);
  }

  private drawInfiniteHeightMeter(meterX: number, meterY: number, meterWidth: number, meterHeight: number) {
    if (this.currentHeight === 0) return;
    
    // Determine current "tier" - each tier is 100 units
    const tier = Math.floor(this.currentHeight / 100);
    const tierStart = tier * 100;
    const tierEnd = (tier + 1) * 100;
    const progressInTier = this.currentHeight - tierStart;
    const tierProgress = progressInTier / 100; // 0 to 1 within current tier
    
    // Draw multiple segments for visual richness
    const segmentHeight = meterHeight / 5; // 5 visual segments always spanning full meter
    
    for (let segment = 0; segment < 5; segment++) {
      const segmentY = meterY + meterHeight - (segment + 1) * segmentHeight;
      const segmentTier = tier - (4 - segment); // Current tier at top, previous tiers below
      
      if (segmentTier < 0) continue; // Don't draw negative tiers
      
      let fillRatio = 0;
      let color = 0x333333;
      
      if (segmentTier < tier) {
        // Previous tiers - fully filled
        fillRatio = 1;
        color = this.getTierColor(segmentTier);
      } else if (segmentTier === tier) {
        // Current tier - partially filled
        fillRatio = tierProgress;
        color = this.getTierColor(segmentTier);
      }
      
      if (fillRatio > 0) {
        const fillHeight = Math.max(2, segmentHeight * fillRatio * 0.92); // keep gap, avoid 0px
        
        this.heightMeter.fillStyle(color, 0.8);
        this.heightMeter.fillRect(
          meterX - meterWidth + 2,
          segmentY + segmentHeight - fillHeight - 2,
          meterWidth - 4,
          fillHeight
        );
        
        // Add tier number label
        if (segmentTier >= 0 && fillRatio > 0.1) {
          const tierText = this.scene.add.text(
            meterX - meterWidth - 5, 
            segmentY + segmentHeight / 2, 
            `${segmentTier}`, {
              fontSize: '10px',
              color: '#FFFFFF',
              fontFamily: 'Arial'
            }
           ).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);
          
          // Auto-destroy to prevent buildup
          this.scene.time.delayedCall(100, () => tierText.destroy());
        }
      }
    }
    
    // Current tier progress indicator at top
    const currentTierText = this.scene.add.text(
      meterX - meterWidth - 6, 
      meterY - 6, 
      `T${tier} ${Math.floor(progressInTier)}/100`, {
        fontSize: '10px',
        color: '#FFFF00',
        fontFamily: 'Arial'
      }
    ).setOrigin(1, 1).setScrollFactor(0).setDepth(1001);
    
    this.scene.time.delayedCall(100, () => currentTierText.destroy());
  }

  private getTierColor(tier: number): number {
    // Color progression through tiers
    const colors = [
      0x00FF00, // Green - Tier 0
      0x88FF00, // Light Green - Tier 1  
      0xFFFF00, // Yellow - Tier 2
      0xFFAA00, // Orange - Tier 3
      0xFF6600, // Red-Orange - Tier 4
      0xFF0066, // Red-Pink - Tier 5
      0xFF00FF, // Magenta - Tier 6
      0x8800FF, // Purple - Tier 7
      0x0088FF, // Blue - Tier 8
      0x00FFFF, // Cyan - Tier 9+
    ];
    
    return colors[Math.min(tier, colors.length - 1)];
  }

  private drawSmartMilestoneMarkers(meterX: number, meterY: number, meterWidth: number, meterHeight: number) {
    // Draw tier boundary markers instead of fixed milestones
    const currentTier = Math.floor(this.currentHeight / 100);
    const segmentHeight = meterHeight / 5;
    
    for (let segment = 0; segment < 5; segment++) {
      const segmentY = meterY + meterHeight - (segment + 1) * segmentHeight;
      const segmentTier = currentTier - (4 - segment);
      
      if (segmentTier >= 0) {
        // Draw tier boundary line
        this.heightMeter.lineStyle(1, 0xFFFFFF, 0.3);
        this.heightMeter.strokeLineShape(new Phaser.Geom.Line(
          meterX - meterWidth, segmentY,
          meterX, segmentY
        ));
        
        // Show tier milestone (every 100 units)
        const tierMilestone = segmentTier * 100;
        if (tierMilestone > 0) {
          const milestoneText = this.scene.add.text(
            meterX - meterWidth - 25, 
            segmentY - 6, 
            `${tierMilestone}`, {
              fontSize: '10px',
              color: '#CCCCCC',
              fontFamily: 'Arial'
            }
          ).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1000);
          
          this.scene.time.delayedCall(100, () => milestoneText.destroy());
        }
      }
    }
  }

  private checkMilestones() {
    const milestones = [10, 25, 50, 100, 200, 300, 500, 750, 1000];
    
    milestones.forEach(milestone => {
      if (this.currentHeight >= milestone && this.lastMilestone < milestone) {
        this.showMilestoneAchievement(milestone);
        this.lastMilestone = milestone;
      }
    });
  }

  private showMilestoneAchievement(milestone: number) {
    const { width, height } = this.scene.cameras.main;
    
    // Create achievement popup - positioned at TOP CENTER to not interfere with gameplay
    const achievementText = this.scene.add.text(width / 2, 120, 
      `🏆 ${milestone} Turtle Units! 🏆`, {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Achievement animation
    achievementText.setScale(0);
    this.scene.tweens.add({
      targets: achievementText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    this.scene.tweens.add({
      targets: achievementText,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      delay: 300,
      ease: 'Power2'
    });
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: achievementText,
      alpha: 0,
      y: height / 2 - 150,
      duration: 1000,
      delay: 2000,
      ease: 'Power2',
      onComplete: () => achievementText.destroy()
    });
    
    // Extra screen shake for big milestones
    const shakeIntensity = milestone >= 100 ? 0.02 : 0.01;
    this.scene.cameras.main.shake(500, shakeIntensity);
  }

  private showNewRecord() {
    const { width, height } = this.scene.cameras.main;
    
    // New record popup - positioned at TOP CENTER to not interfere with gameplay
    const recordText = this.scene.add.text(width / 2, 80, 
      '🎉 NEW RECORD! 🎉', {
      fontSize: '24px',
      color: '#FF00FF',
      fontFamily: 'Arial',
      stroke: '#FFFFFF',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Pulsing effect
    this.scene.tweens.add({
      targets: recordText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 500,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => recordText.destroy()
    });
  }

  public getCurrentHeight(): number {
    return this.currentHeight;
  }

  public getBestHeight(): number {
    return this.bestHeight;
  }

  public reset() {
    const turtle = this.turtleController.getTurtle();
    if (turtle) {
      this.startY = turtle.y;
    }
    this.currentHeight = 0;
    this.lastMilestone = 0;
    
    console.log('Height tracker reset');
  }
}
