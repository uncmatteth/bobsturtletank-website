import Phaser from 'phaser';

export class TurtleController {
  private scene: Phaser.Scene;
  private turtle!: Phaser.Physics.Arcade.Sprite;
  private trailParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: { left?: Phaser.Input.Keyboard.Key; right?: Phaser.Input.Keyboard.Key; a?: Phaser.Input.Keyboard.Key; d?: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene, startX: number, startY: number) {
    this.scene = scene;
    this.createTurtle(startX, startY);
    this.setupPhysics();
    // Create and cache keyboard cursors once to ensure reliable input
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    // Add WASD mirrors for reliability
    if (this.scene.input.keyboard) {
      const added = this.scene.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D' }) as any;
      this.keys = added;
    }
  }

  private createTurtle(x: number, y: number) {
    this.turtle = this.scene.physics.add.sprite(x, y, 'turtle');
    // Make Bob 50% bigger for better visibility (60 -> 90)
    this.turtle.setDisplaySize(90, 90);
    this.turtle.setCollideWorldBounds(false);
    this.turtle.setBounce(0); // No bounce, we'll handle it manually
    this.turtle.setDragX(15); // Even less air resistance for better air control
    this.turtle.setDepth(200); // Ensure turtle is always visible
    
    // Start turtle with no velocity - wait for game to start
    this.turtle.setVelocityY(0); // No initial movement until game starts
    
    console.log(`Created turtle at ${x}, ${y} with size 60x60 - waiting for game start`);
  }



  private setupPhysics() {
    // Set up custom physics properties
    if (this.turtle.body) {
      (this.turtle.body as any).setMaxVelocity(800, 1000);
    }
  }



  public update(delta: number) {
    // Limit falling speed
    if (this.turtle.body && this.turtle.body.velocity.y > 800) {
      this.turtle.body.velocity.y = 800;
    }
    
    // Responsive horizontal movement control with left/right keys
    const leftPressed = !!(this.cursors?.left?.isDown || this.keys?.left?.isDown || this.keys?.a?.isDown);
    const rightPressed = !!(this.cursors?.right?.isDown || this.keys?.right?.isDown || this.keys?.d?.isDown);
    if (leftPressed || rightPressed) {
      if (leftPressed && !rightPressed) {
        // Much faster left movement for easier platform reaching
        this.turtle.setVelocityX(-400); // Increased for better control
      } else if (rightPressed && !leftPressed) {
        // Much faster right movement for easier platform reaching
        this.turtle.setVelocityX(400); // Increased for better control
      } else {
        // Less aggressive drag for better air control
        const currentVelX = this.turtle.body?.velocity.x || 0;
        this.turtle.setVelocityX(currentVelX * 0.92); // Less aggressive slowdown
      }
    } else {
      // No directional input - apply mild damping
      const currentVelX = this.turtle.body?.velocity.x || 0;
      this.turtle.setVelocityX(currentVelX * 0.92);
    }

    // Horizontal wrap-around so Bob doesn't get lost offscreen
    const viewWidth = this.scene.cameras.main.width;
    const buffer = 30;
    if (this.turtle.x < -buffer) {
      this.turtle.x = viewWidth + buffer;
    } else if (this.turtle.x > viewWidth + buffer) {
      this.turtle.x = -buffer;
    }
  }

  public getTurtle(): Phaser.Physics.Arcade.Sprite {
    return this.turtle;
  }

  public getCurrentPosition(): { x: number, y: number } {
    return { x: this.turtle.x, y: this.turtle.y };
  }

  // Mobile-specific methods
  public addTiltInfluence(tiltX: number) {
    // Apply device tilt as subtle horizontal influence (mobile only)
    if (this.turtle.body) {
      const tiltForce = tiltX * 50; // Reduced for automatic mode
      this.turtle.body.velocity.x += tiltForce;
    }
  }

  public triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'medium') {
    // Trigger haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200]
      };
      navigator.vibrate(patterns[intensity]);
    }
  }

  public startGameMovement() {
    // Give turtle higher initial upward velocity for more reaction time
    this.turtle.setVelocityY(-600); // Increased from -400 for higher/longer jump
    
    // Create epic turtle trail effect
    this.createTurtleTrail();
    
    console.log('Turtle movement started with bigger initial jump and epic trail!');
  }

  private createTurtleTrail() {
    // Create turtle trail particles
    this.trailParticles = this.scene.add.particles(this.turtle.x, this.turtle.y, 'platform1', {
      speed: { min: 20, max: 60 },
      scale: { start: 0.2, end: 0 },
      lifespan: 300,
      frequency: 50,
      tint: [0x00FF00, 0x88FF88, 0x00AA00],
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD'
    }).setDepth(150);

    // Follow the turtle
    this.trailParticles.startFollow(this.turtle);
  }
}
