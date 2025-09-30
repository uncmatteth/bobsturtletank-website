import Phaser from 'phaser';

export class BackgroundScroller {
  private scene: Phaser.Scene;
  private backgrounds: Phaser.GameObjects.TileSprite[] = [];
  private currentBgIndex: number = 0;
  private transitionBg?: Phaser.GameObjects.TileSprite;
  
  private scrollSpeed: number = 0.3;
  private lastCameraY: number = 0;
  private heightThresholds: number[] = [0, 500, 1000, 2000, 4000, 6000, 8000, 10000, 15000, 20000];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupBackgrounds();
    this.lastCameraY = this.scene.cameras.main.scrollY;
    // Keep backgrounds covering the whole screen on resize
    this.scene.scale.on('resize', this.onResize, this);
  }

  private setupBackgrounds() {
    const { width, height } = this.scene.cameras.main;
    // Use a single fullscreen tileSprite; we animate via tilePosition so it looks infinite
    const bg = this.createBackground(this.currentBgIndex, 0);
    bg.setPosition(width / 2, height / 2);
    bg.setSize(width, height);
    this.backgrounds = [bg];
    console.log(`Created ${this.backgrounds.length} background layer for fullscreen coverage`);
  }

  private createBackground(bgIndex: number, depth: number = 0) {
    const { width, height } = this.scene.cameras.main;
    
    // Cycle through available backgrounds (bg1 to bg10)
    const bgKey = `bg${(bgIndex % 10) + 1}`;
    
    // Create a MASSIVE tiled background that covers infinite scrolling
    // Fullscreen tileSprite fixed to the camera; parallax via tilePosition
    const background = this.scene.add.tileSprite(width / 2, height / 2, width, height, bgKey);
    
    background.setOrigin(0.5, 0.5);
    background.setScrollFactor(0, 0); // Always cover the screen
    background.setDepth(depth);
    background.setAlpha(1);
    
    console.log(`Created background ${bgKey} with massive size: ${width * 3} x ${height * 20}`);
    
    return background;
  }

  private onResize(gameSize: any) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.backgrounds.forEach(bg => {
      bg.setSize(width, height);
      bg.setPosition(width / 2, height / 2);
    });
    if (this.transitionBg) {
      this.transitionBg.setSize(width, height);
      this.transitionBg.setPosition(width / 2, height / 2);
    }
  }

  public update() {
    const cam = this.scene.cameras.main;
    // Ensure backgrounds always cover the viewport (handles CSS/devicePixelRatio cases)
    this.backgrounds.forEach(bg => {
      if (bg.displayWidth !== cam.width || bg.displayHeight !== cam.height) {
        bg.setSize(cam.width, cam.height);
        bg.setPosition(cam.width / 2, cam.height / 2);
      }
    });
    const currentCameraY = cam.scrollY;
    const deltaY = currentCameraY - this.lastCameraY;
    
    // Update background positions based on camera movement
    this.updateBackgroundPositions(deltaY);
    
    // Check if we need to transition to a new background set as we climb
    this.checkBackgroundTransition();
    
    this.lastCameraY = currentCameraY;
  }

  private updateBackgroundPositions(deltaY: number) {
    this.backgrounds.forEach(bg => {
      if (bg && bg.active) {
        // Vertical-only parallax by shifting tile positions; tile fills the screen
        bg.tilePositionY += deltaY * this.scrollSpeed * 0.4;
        // No horizontal movement — keep 0 to avoid sideways scrolling artifacts
        bg.tilePositionX = 0;
        if (bg.tilePositionY > 100000 || bg.tilePositionY < -100000) {
          bg.tilePositionY = 0;
        }
      }
    });
    
    // Update transition background if it exists
    if (this.transitionBg && this.transitionBg.active) {
      this.transitionBg.tilePositionY += deltaY * this.scrollSpeed * 0.4;
      this.transitionBg.tilePositionX = 0;
    }
  }

  private checkBackgroundTransition() {
    // Calculate current height (camera scroll represents height)
    const currentHeight = Math.abs(this.scene.cameras.main.scrollY);
    
    // Determine which background should be active based on height
    let targetBgIndex = 0;
    for (let i = 0; i < this.heightThresholds.length; i++) {
      if (currentHeight >= this.heightThresholds[i]) {
        targetBgIndex = i;
      }
    }
    
    // Trigger transition if we've reached a new background zone
    if (targetBgIndex !== this.currentBgIndex) {
      this.transitionToBackground(targetBgIndex);
    }
  }

  private transitionToBackground(newBgIndex: number) {
    // Don't transition if already transitioning
    if (this.transitionBg && this.transitionBg.active) return;
    
    // Create new background for transition
    this.transitionBg = this.createBackground(newBgIndex, 1);
    this.transitionBg.setAlpha(0);
    
    // Fade transition
    this.scene.tweens.add({
      targets: this.transitionBg,
      alpha: 1,
      duration: 2000,
      ease: 'Power2.easeInOut',
      onComplete: () => {
        // Remove old backgrounds
        this.backgrounds.forEach(bg => {
          if (bg && bg.active) {
            bg.destroy();
          }
        });
        
        // Make transition background the new main background
        this.backgrounds = [this.transitionBg!];
        this.transitionBg = undefined;
        this.currentBgIndex = newBgIndex;
        
        // Show transition effect
        this.showBackgroundTransitionEffect(newBgIndex);
      }
    });
  }

  private showBackgroundTransitionEffect(bgIndex: number) {
    const { width, height } = this.scene.cameras.main;
    
    // Get environment name based on background
    const environmentNames = [
      'Snacklantis', 'Coral-n on the Cob Reef', 'Kelpifornia Roll Forest', 'Deep Dish Blue', 'Twilight Scone',
      'A-biscuits Plain', 'Volcanic Vents & Vines', 'Arctic Turtlettuce', 'Tropi-cauliflower Paradise', 'Cosmic Chow-sea'
    ];
    
    const environmentName = environmentNames[bgIndex % environmentNames.length];
    
    // Show environment transition text
    const transitionText = this.scene.add.text(width / 2, height / 2 + 50, 
      `Entering: ${environmentName}`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
    
    // Animate transition text
    transitionText.setAlpha(0);
    this.scene.tweens.add({
      targets: transitionText,
      alpha: 1,
      duration: 500,
      ease: 'Power2.easeOut'
    });
    
    this.scene.tweens.add({
      targets: transitionText,
      alpha: 0,
      duration: 500,
      delay: 2000,
      ease: 'Power2.easeIn',
      onComplete: () => transitionText.destroy()
    });
    
    // Add sparkle particles for magical transition effect
    const sparkles = this.scene.add.particles(width / 2, height / 2, 'platform1', {
      speed: { min: 50, max: 200 },
      scale: { start: 0.1, end: 0 },
      lifespan: 1000,
      quantity: 20,
      tint: [0xFFFFFF, 0x00FFFF, 0xFF00FF, 0xFFFF00],
      blendMode: 'ADD'
    }).setScrollFactor(0).setDepth(3000);
    
    // Auto-destroy sparkles
    this.scene.time.delayedCall(1000, () => {
      sparkles.destroy();
    });
  }

  public getCurrentEnvironment(): string {
    const environmentNames = [
      'Snacklantis', 'Coral-n on the Cob Reef', 'Kelpifornia Roll Forest', 'Deep Dish Blue', 'Twilight Scone',
      'A-biscuits Plain', 'Volcanic Vents & Vines', 'Arctic Turtlettuce', 'Tropi-cauliflower Paradise', 'Cosmic Chow-sea'
    ];
    
    return environmentNames[this.currentBgIndex % environmentNames.length];
  }

  public setScrollSpeed(speed: number) {
    this.scrollSpeed = speed;
  }
}
