import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load any essential assets needed before the main preload
    // For now, we'll just set up the loading screen
  }

  create() {
    // Configure input for both desktop and mobile
    this.input.addPointer(3); // Allow multi-touch for mobile gestures
    
    // Set up responsive design
    this.scale.on('resize', this.handleResize, this);
    
    // Reduce iOS Safari rubber-band scrolling and tap delay
    this.game.canvas.style.touchAction = 'none';
    if ((this.input as any).touch) {
      (this.input as any).touch.capture = true;
    }

    // Proceed to preload scene
    this.scene.start('PreloadScene');
  }

  private handleResize(gameSize: any) {
    // Handle responsive resize logic
    const width = gameSize.width;
    const height = gameSize.height;
    
    // Ensure game scales properly on different devices
    if (this.cameras && this.cameras.main) {
      this.cameras.main.setViewport(0, 0, width, height);
    }
  }
}
