import Phaser from 'phaser';
import { TurtleController } from './turtle-controller';

interface Platform {
  sprite: Phaser.Physics.Arcade.Sprite;
  type: number;
  isMoving?: boolean;
  moveDirection?: number;
  bounced?: boolean; // Prevent bounce spam
  isSafety?: boolean; // Mark safety platforms for cleanup
  isTimedDespawn?: boolean; // Will self-remove shortly after spawn
  isTiny?: boolean;
}

export class PlatformManager {
  private scene: Phaser.Scene;
  private turtleController: TurtleController;
  private platforms: Platform[] = [];
  private platformGroup!: Phaser.Physics.Arcade.Group;
  private bounceListener?: (info: { x: number; y: number; isMoving?: boolean; isTiny?: boolean; isTimed?: boolean; comboMultiplier: number; consecutiveBounces: number; }) => void;
  
  private lastPlatformY: number = 0;
  private platformSpacing: number = 150;
  private minSpacing: number = 120;
  private maxSpacing: number = 200;
  private difficultyMultiplier: number = 1;
  
  // Progressive challenge controls
  private movingChance: number = 0; // Probability a new platform moves (0..1)
  private tinyChance: number = 0;   // Probability a new platform is smaller
  private moveSpeedBase: number = 80; // px/s baseline, scales with difficulty
  private timedDespawnChance: number = 0; // Chance to spawn a timed/fading platform
  
  // Epic combo system!
  private consecutiveBounces: number = 0;
  private comboMultiplier: number = 1;

  constructor(scene: Phaser.Scene, turtleController: TurtleController, private audioManager?: any) {
    this.scene = scene;
    this.turtleController = turtleController;
    
    // Adjust spacing for proper jumping game feel - more reachable
    this.platformSpacing = 220;
    this.minSpacing = 180;
    this.maxSpacing = 250;
    
    this.setupPlatformGroup();
  }

  private setupPlatformGroup() {
    this.platformGroup = this.scene.physics.add.group({
      // Configure group defaults for all platforms
      immovable: true,
      allowGravity: false
    });
    
    // Set up collision between turtle and platforms
    this.scene.physics.add.overlap(
      this.turtleController.getTurtle(),
      this.platformGroup,
      this.handlePlatformBounce,
      undefined,
      this
    );
  }

  public generateInitialPlatforms() {
    const { width, height } = this.scene.cameras.main;
    
    // Clear existing platforms
    this.clearAllPlatforms();
    
    // Generate starting platform under the turtle
    this.createPlatform(width / 2, height - 80, false);
    this.lastPlatformY = height - 80;
    
    // Generate only a few platforms ahead - just enough for 2-3 jumps
    for (let i = 0; i < 5; i++) {
      this.generateNextPlatform();
    }
    
    console.log(`Generated ${this.platforms.length} platforms`);
  }

  public generateNextPlatform() {
    const { width } = this.scene.cameras.main;
    
    // Vertical spacing between platforms - reduced for better reachability
    const baseSpacing = Phaser.Math.Between(180, 250);
    const adjustedSpacing = baseSpacing * this.difficultyMultiplier;
    const nextY = this.lastPlatformY - adjustedSpacing;
    
    // HORIZONTAL POSITIONING: Make platforms reachable!
    // Get the last platform's X position
    const lastPlatformX = this.platforms.length > 0 ? this.platforms[this.platforms.length - 1].sprite.x : width / 2;
    
    // Position next platform within reachable distance (turtle can move ±400 pixels/sec)
    // With jump time of ~2 seconds, turtle can travel ~800 pixels horizontally
    const maxHorizontalDistance = 500; // Much more generous reachable distance
    const minX = Math.max(80, lastPlatformX - maxHorizontalDistance);
    const maxX = Math.min(width - 80, lastPlatformX + maxHorizontalDistance);
    
    // Ensure we have a valid range
    const nextX = minX < maxX ? Phaser.Math.Between(minX, maxX) : width / 2;
    
    // Chance-based moving platforms as difficulty rises; never place moving as the very first after start
    const shouldMove = Math.random() < this.movingChance && this.platforms.length > 0;
    
    console.log(`Next platform: Last X: ${lastPlatformX}, Next X: ${nextX}, Distance: ${Math.abs(nextX - lastPlatformX)}`);
    
    this.createPlatform(nextX, nextY, shouldMove);
    this.lastPlatformY = nextY;
  }

  private createPlatform(x: number, y: number, isMoving: boolean = false) {
    // Randomly select platform type (food item)
    const platformType = Phaser.Math.Between(1, 13);
    const platformSprite = this.scene.physics.add.sprite(x, y, `platform${platformType}`);
    
    // Configure platform physics FIRST
    platformSprite.setImmovable(true);
    platformSprite.body?.setVelocity(0, 0); // Stop any movement
    platformSprite.body?.setGravityY(0); // No gravity on platforms
    
    // Size: sometimes make them tiny at higher heights
    const isTiny = Math.random() < this.tinyChance;
    const scale = isTiny ? 0.12 : 0.15;
    platformSprite.setScale(scale);
    platformSprite.setDepth(100); // Ensure platforms are visible
    platformSprite.setOrigin(0.5, 0.5); // Center the platform properly
    
    // Set collision box BIGGER than visual size for easier landing!
    const scaledWidth = platformSprite.width * scale;
    const scaledHeight = platformSprite.height * scale;
    platformSprite.body?.setSize(scaledWidth * 1.8, scaledHeight * 1.5); // Much bigger hitbox for easier landing!
    
    // Debug: Uncomment to see hitboxes (for testing)
    // platformSprite.body?.debugShowBody = true;
    
    // Add to platform group
    this.platformGroup.add(platformSprite);
    
    // Create platform object
    const platform: Platform = {
      sprite: platformSprite,
      type: platformType,
      isMoving: isMoving,
      bounced: false, // Add bounce flag to prevent spam
      isTiny: isTiny
    };
    
    if (isMoving) {
      platform.moveDirection = Math.random() < 0.5 ? -1 : 1;
      platformSprite.setTint(0xFFAAAA); // Slight red tint for moving platforms
    }

    // Timed despawn platforms for extra challenge (visual cue with fade)
    if (Math.random() < this.timedDespawnChance) {
      platform.isTimedDespawn = true;
      const fadeTween = this.scene.tweens.add({
        targets: platformSprite,
        alpha: { from: 1, to: 0.3 },
        yoyo: true,
        repeat: 4,
        duration: 180,
      });
      this.scene.time.delayedCall(1500, () => {
        if (this.platforms.includes(platform) && !platform.bounced) {
          fadeTween.remove();
          this.removePlatform(platform);
        }
      });
    }
    
    this.platforms.push(platform);
    
    // Add entrance animation - start smaller and grow to tiny size
    platformSprite.setScale(0.05); // Start even tinier
    this.scene.tweens.add({
      targets: platformSprite,
      scaleX: 0.15, // Grow to tiny size (15% of original)
      scaleY: 0.15,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    console.log(`Created platform ${platformType} at ${x}, ${y} with tiny scale 0.15 and BIG hitbox`);
  }

  // Public helper to spawn a safety platform at a specific position
  // Safety platform feature removed per feedback

  private handlePlatformBounce(turtle: any, platformSprite: any) {
    // Find the platform object
    const platform = this.platforms.find(p => p.sprite === platformSprite);
    if (!platform) return;
    
    // Prevent bounce spam - only allow one bounce per platform
    if (platform.bounced) {
      return; // This platform already bounced
    }
    
    console.log('Platform bounce detected!');
    
    // Only bounce if turtle is falling down onto the platform (or moving slowly up)
    if (turtle.body.velocity.y > -50) {
      // Mark platform as bounced to prevent spam
      platform.bounced = true;
      
      // Automatic bounce - slightly higher force for better jumping
      const bounceForce = 900; // Boosted for more height
      turtle.setVelocityY(-bounceForce);
      
      console.log(`Auto-bouncing with force: ${bounceForce}`);
      
      // Epic combo system!
      this.consecutiveBounces++;
      this.updateComboMultiplier();
      
      // Play sounds with combo effects (with error handling)
      if (this.audioManager) {
        try {
          this.audioManager.playBounceSound();
          
          if (this.consecutiveBounces >= 5) {
            this.audioManager.playComboSound(this.comboMultiplier);
          }
        } catch (error: any) {
          console.warn('SFX playback failed (missing files):', error.message);
        }
      }
      
      // Visual effects with combo enhancement
      this.createBounceEffects(platform.sprite.x, platform.sprite.y);
      
      // Screen shake intensity based on combo
      const shakeIntensity = 0.01 + (this.comboMultiplier - 1) * 0.005;
      this.scene.cameras.main.shake(100, shakeIntensity);
      
      // Wiggle animation to show impact, then remove (using createTimeline for Phaser 3.90)
      const s = platform.sprite;
      this.scene.tweens.add({
        targets: s,
        angle: { from: -7, to: 7 },
        duration: 60,
        yoyo: true,
        repeat: 3,
        onComplete: () => this.removePlatform(platform)
      });

      // Notify points system
      this.bounceListener?.({
        x: platform.sprite.x,
        y: platform.sprite.y,
        isMoving: platform.isMoving,
        isTiny: platform.isTiny,
        isTimed: platform.isTimedDespawn,
        comboMultiplier: this.comboMultiplier,
        consecutiveBounces: this.consecutiveBounces
      });
      
      // Generate new platforms ahead if needed
      this.checkAndGenerateNewPlatforms();
    }
  }

  private createBounceEffects(x: number, y: number) {
    console.log(`Creating bounce effects at ${x}, ${y}`);
    
    // Create simple colored circle particles since platform textures might not work for particles
    const particleGraphics = this.scene.add.graphics();
    particleGraphics.fillStyle(0xFFFF00);
    particleGraphics.fillCircle(0, 0, 3);
    particleGraphics.generateTexture('particle', 6, 6);
    particleGraphics.destroy();
    
    // Epic particle explosion effect
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 300 },
      scale: { start: 2, end: 0 },
      lifespan: 600,
      quantity: 20,
      tint: [0xFFFFFF, 0xFFFF00, 0xFF8800, 0x00FFFF, 0xFF00FF],
      gravityY: 200,
      emitting: false
    });
    
    // Trigger particle burst
    particles.explode(20, x, y);
    
    // Secondary sparkle effect  
    const sparkles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 15,
      tint: [0xFFFFFF, 0xFFFF99],
      blendMode: 'ADD',
      emitting: false
    });
    
    sparkles.explode(15, x, y);
    
    // Auto-destroy particles
    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
      sparkles.destroy();
    });
    
    // Bouncy score popup with more flair
    const scoreText = this.scene.add.text(x, y - 30, '+1 🌟', {
      fontSize: '32px',
      color: '#FFFF00',
      fontFamily: 'Arial',
      stroke: '#FF6600',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Multi-stage score animation
    scoreText.setScale(0);
    this.scene.tweens.add({
      targets: scoreText,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    this.scene.tweens.add({
      targets: scoreText,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      delay: 200,
      ease: 'Power2'
    });
    
    this.scene.tweens.add({
      targets: scoreText,
      y: y - 150,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 1500,
      delay: 400,
      ease: 'Power2',
      onComplete: () => scoreText.destroy()
    });
    
    // Add multiple radial wave effects
    for (let i = 0; i < 3; i++) {
      const waveGraphics = this.scene.add.graphics();
      waveGraphics.lineStyle(6 - i * 2, [0x00FFFF, 0xFFFF00, 0xFF00FF][i], 0.8);
      waveGraphics.strokeCircle(x, y, 15);
      
      this.scene.tweens.add({
        targets: waveGraphics,
        scaleX: 6 + i * 2,
        scaleY: 6 + i * 2,
        alpha: 0,
        duration: 600 + i * 200,
        delay: i * 100,
        ease: 'Power2',
        onComplete: () => waveGraphics.destroy()
      });
    }
  }

  private removePlatform(platform: Platform) {
    // Animate platform disappearing
    this.scene.tweens.add({
      targets: platform.sprite,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // Remove from group and array
        this.platformGroup.remove(platform.sprite);
        platform.sprite.destroy();
        
        const index = this.platforms.indexOf(platform);
        if (index > -1) {
          this.platforms.splice(index, 1);
        }
      }
    });
  }

  private checkAndGenerateNewPlatforms() {
    const turtle = this.turtleController.getTurtle();
    const highestPlatformY = Math.min(...this.platforms.map(p => p.sprite.y));
    
    // Generate new platforms one at a time when turtle gets close
    if (turtle.y < highestPlatformY + 800) {
      // Only generate 1-2 new platforms at a time
      for (let i = 0; i < 2; i++) {
        this.generateNextPlatform();
      }
    }
  }

  public update(delta: number) {
    // Update moving platforms
    this.platforms.forEach(platform => {
      if (platform.isMoving && platform.moveDirection) {
        const sprite = platform.sprite;
        const moveSpeed = this.moveSpeedBase * this.difficultyMultiplier;
        
        // Move platform horizontally only
        sprite.x += platform.moveDirection * moveSpeed * (delta / 1000);
        
        // Ensure platform stays immovable and doesn't fall
        if (sprite.body) {
          (sprite.body as any).setVelocity(0, 0);
          (sprite.body as any).setImmovable(true);
        }
        
        // Bounce off screen edges
        if (sprite.x <= 50 || sprite.x >= this.scene.cameras.main.width - 50) {
          platform.moveDirection *= -1;
        }
      } else {
        // Ensure static platforms stay static
        if (platform.sprite.body) {
          (platform.sprite.body as any).setVelocity(0, 0);
          (platform.sprite.body as any).setImmovable(true);
        }
      }
    });
    
    // Clean up platforms that are too far below
    const cameraBottom = this.scene.cameras.main.scrollY + this.scene.cameras.main.height + 500;
    this.platforms.forEach(platform => {
      if (platform.sprite.y > cameraBottom) {
        this.removePlatform(platform);
      }
    });
  }

  public updateDifficulty(height: number) {
    // Gradually increase difficulty based on height
    this.difficultyMultiplier = 1 + (height / 1000) * 0.5;
    
    // Adjust platform spacing
    const baseDifficultyIncrease = Math.min(height / 500, 1);
    this.minSpacing = 120 + baseDifficultyIncrease * 30;
    this.maxSpacing = 200 + baseDifficultyIncrease * 50;

    // New challenges as player climbs higher
    // Start introducing moving platforms at 500, scale up to 30% at ~2000 height
    if (height >= 500) {
      const t = Math.min((height - 500) / 1500, 1);
      this.movingChance = 0.1 + 0.2 * t; // 10% -> 30%
      this.moveSpeedBase = 80 + 40 * t;  // 80 -> 120 px/s
    } else {
      this.movingChance = 0;
      this.moveSpeedBase = 80;
    }

    // Make tiny platforms more common after 800 height up to 20%
    if (height >= 800) {
      const t2 = Math.min((height - 800) / 1500, 1);
      this.tinyChance = 0.05 + 0.15 * t2; // 5% -> 20%
    } else {
      this.tinyChance = 0.02; // occasional tiny early on
    }

    // Introduce timed-despawn platforms after 900 height up to 15%
    if (height >= 900) {
      const t3 = Math.min((height - 900) / 1500, 1);
      this.timedDespawnChance = 0.05 + 0.1 * t3; // 5% -> 15%
    } else {
      this.timedDespawnChance = 0;
    }
  }

  private clearAllPlatforms() {
    this.platforms.forEach(platform => {
      platform.sprite.destroy();
    });
    this.platforms = [];
    this.platformGroup.clear(true, true);
  }

  public getPlatforms(): Platform[] {
    return this.platforms;
  }

  // Epic combo system methods!
  private updateComboMultiplier() {
    this.comboMultiplier = Math.floor(this.consecutiveBounces / 5) + 1;
    
    if (this.consecutiveBounces % 5 === 0 && this.consecutiveBounces >= 5) {
      this.showComboEffect();
    }
  }

  private showComboEffect() {
    const { width, height } = this.scene.cameras.main;
    
    // Epic combo text
    const comboText = this.scene.add.text(width / 2, height / 2, 
      `🔥 ${this.consecutiveBounces} COMBO! 🔥\n${this.comboMultiplier}x MULTIPLIER!`, {
      fontSize: '32px',
      color: '#FF6600',
      fontFamily: 'Arial',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

    // Epic combo animation
    comboText.setScale(0);
    this.scene.tweens.add({
      targets: comboText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
      targets: comboText,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      delay: 300,
      ease: 'Power2'
    });

    this.scene.tweens.add({
      targets: comboText,
      alpha: 0,
      y: height / 2 - 100,
      duration: 1000,
      delay: 1500,
      ease: 'Power2',
      onComplete: () => comboText.destroy()
    });
  }

  public resetCombo() {
    this.consecutiveBounces = 0;
    this.comboMultiplier = 1;
  }

  public getComboInfo(): { bounces: number, multiplier: number } {
    return {
      bounces: this.consecutiveBounces,
      multiplier: this.comboMultiplier
    };
  }

  public setBounceListener(listener: (info: { x: number; y: number; isMoving?: boolean; isTiny?: boolean; isTimed?: boolean; comboMultiplier: number; consecutiveBounces: number; }) => void) {
    this.bounceListener = listener;
  }
}
