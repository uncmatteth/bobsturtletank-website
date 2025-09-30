import Phaser from 'phaser';
import { TurtleController } from '../systems/turtle-controller';
import { PlatformManager } from '../systems/platform-manager';
import { HeightTracker } from '../systems/height-tracker';
import { BackgroundScroller } from '../systems/background-scroller';
import { AudioManager } from '../systems/audio-manager';
// import { LeaderboardUI } from '../ui/leaderboard'; // REMOVED - using integrated leaderboard
import { LeaderboardService } from '../systems/leaderboard-service';
import { PointsTracker } from '../systems/points-tracker';

export class GameScene extends Phaser.Scene {
  private turtleController!: TurtleController;
  private platformManager!: PlatformManager;
  private heightTracker!: HeightTracker;
  private backgroundScroller!: BackgroundScroller;
  private audioManager!: AudioManager;
  // private leaderboardUI!: LeaderboardUI; // REMOVED - using integrated leaderboard
  private leaderboardService!: LeaderboardService;
  private pointsTracker!: PointsTracker;
  
  private gameCamera!: Phaser.Cameras.Scene2D.Camera;
  private isGameOver: boolean = false;
  private gameStarted: boolean = false;
  private startInstructions?: Phaser.GameObjects.Text;
  
  // Mobile optimization properties
  private isMobile: boolean = false;
  private deviceOrientation: DeviceOrientationEvent | null = null;
  
  // Integrated leaderboard properties
  private leaderboardContainer?: Phaser.GameObjects.Container;
  private currentName: string = '';
  private nameInput?: Phaser.GameObjects.Text;
  private maxNameLength: number = 15;
  private nameInputHandler?: (event: KeyboardEvent) => void;
  private isLeaderboardOpen: boolean = false;
  private storedFinalHeight: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Initialize camera
    this.gameCamera = this.cameras.main;
    // Expand camera bounds massively so the camera can follow Bob essentially forever
    this.gameCamera.setBounds(0, -1000000, width, 2000000);
    
    // Initialize game systems
    this.initializeSystems();
    
    // Set up input handlers
    this.setupInput();
    
    // Detect mobile and setup mobile features
    this.setupMobileOptimizations();
    
    // Start background music
    this.audioManager.startMusic();
    
    // Show initial instructions
    this.showStartInstructions();
  }

  update(time: number, delta: number) {
    if (this.isGameOver || !this.gameStarted) return;
    
    // Update all game systems
    this.turtleController.update(delta);
    this.platformManager.update(delta);
    this.heightTracker.update();
    if (this.pointsTracker) {
      this.pointsTracker.update();
    }
    this.backgroundScroller.update();
    
    // Update difficulty based on height
    this.platformManager.updateDifficulty(this.heightTracker.getCurrentHeight());
    
    // Check for game over condition
    this.checkGameOver();
    
    // Update camera to follow turtle
    this.updateCamera();
    
    // Apply mobile tilt controls if available
    this.updateMobileControls();
  }

  private initializeSystems() {
    const { width, height } = this.cameras.main;
    
    // Initialize background scroller
    this.backgroundScroller = new BackgroundScroller(this);
    
    // Initialize turtle controller - position above first platform
    this.turtleController = new TurtleController(this, width / 2, height - 180);
    
    // Initialize audio manager first
    this.audioManager = new AudioManager(this);
    
    // Initialize platform manager with audio
    this.platformManager = new PlatformManager(this, this.turtleController, this.audioManager);
    
    // Initialize height tracker
    this.heightTracker = new HeightTracker(this, this.turtleController);
    
    // Initialize points tracker (after platform + height)
    this.pointsTracker = new PointsTracker(this, this.platformManager, this.heightTracker);
    
    // Initialize leaderboard systems
    this.leaderboardService = new LeaderboardService();
    // this.leaderboardUI = new LeaderboardUI(this, this.leaderboardService); // REMOVED - using integrated leaderboard
  }

  private setupInput() {
    // Simple input - just start game and restart
    this.input.on('pointerdown', () => {
      if (!this.gameStarted) {
        this.startGame();
        return;
      }
      
      // When dead, we restart via any key; pointer will not auto-restart to avoid accidental taps
    });

    // Keyboard controls
    this.input.keyboard?.on('keydown-SPACE', (ev: KeyboardEvent) => {
      // Prevent SPACE from scrolling or being treated as an arrow
      ev.preventDefault();
      console.log(`SPACE key detected: gameStarted=${this.gameStarted}, isGameOver=${this.isGameOver}`);
      
      if (this.isGameOver) {
        // Allow SPACE to revive when dead
        this.restartGame();
        return;
      }
      if (!this.gameStarted) {
        console.log('Starting game from SPACE key...');
        this.startGame();
      }
    });

    // Mute key
    this.input.keyboard?.on('keydown-M', () => {
      this.audioManager.toggleMute();
    });

    // Leaderboard key
    this.input.keyboard?.on('keydown-L', () => {
      if (!this.isGameOver) {
        // this.leaderboardUI.showLeaderboard(); // REMOVED - using integrated leaderboard
      }
    });

    // Test death sound key (for debugging)
    // Removed X test key from production

    // Global key handler: prevent arrow scroll; restart on any non-modifier key if game over
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      console.log('🔧 Global key:', event.code, 'isGameOver:', this.isGameOver, 'isLeaderboardOpen:', this.isLeaderboardOpen);
      if (this.isGameOver && !this.isLeaderboardOpen) {
        const ignore = ['ShiftLeft','ShiftRight','ControlLeft','ControlRight','AltLeft','AltRight','MetaLeft','MetaRight','F12'];
        if (!ignore.includes(event.code)) {
          console.log('🔄 Global keydown triggering restart:', event.code);
          this.restartGame();
        }
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
        // Allow arrow keys to start the game
        if (!this.gameStarted) {
          this.startGame();
        }
      }
    });
  }

  private showStartInstructions() {
    const { width, height } = this.cameras.main;
    
    console.log('Creating start instructions...');
    
    // EPIC animated title (gradient-like stroke + glow + subtle float)
    const title = this.add.text(24, 140,
      'Bob The Turtle: Bouncey Food Delight Bounce', {
      fontSize: '48px',
      color: '#00FFE0',
      fontFamily: 'Impact',
      stroke: '#002a28',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#00b3a6', blur: 30, fill: true }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(6000);

    this.tweens.add({ targets: title, y: '+=6', duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: title, alpha: { from: 0.92, to: 1 }, duration: 1200, yoyo: true, repeat: -1 });

    // Minimal clean instructions (smaller, lower-left, persistent for readability)
    const instructions = 'She bounces automatically on food platforms.\nUse Arrow Keys or A/D to move.';
    this.startInstructions = this.add.text(24, height - 24, instructions, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'left',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(5000);
    
    console.log('Instructions created:', this.startInstructions ? 'SUCCESS' : 'FAILED');
    
    // Keep instructions static and readable until the game starts
    
    console.log('Pulse animation added to instructions');
    
    // Generate starting platform so turtle has something to stand on
    this.platformManager.generateInitialPlatforms();
    
    console.log('Instructions shown with starting platform, waiting for user input to start game...');
  }

  private startGame() {
    this.gameStarted = true;
    
    console.log('Game started!');
    
    // Keep instructions persistent during play
    
    // Start turtle movement with initial jump
    this.turtleController.startGameMovement();
    
    console.log('Turtle movement started, game is now active!');
  }

  private updateCamera() {
    const turtle = this.turtleController.getTurtle();
    if (turtle) {
      // Only move camera UP with Bob; never follow her downward. Also clamp max upward scroll speed.
      const targetY = turtle.y - this.cameras.main.height * 0.7;
      const currentY = this.cameras.main.scrollY;
      if (targetY < currentY) {
        const lerpY = Phaser.Math.Linear(currentY, targetY, 0.08);
        this.cameras.main.setScroll(0, lerpY);
      }
    }
  }

  private checkGameOver() {
    if (this.isGameOver) return;
    
    const turtle = this.turtleController.getTurtle();
    if (turtle) {
      // Game over if turtle falls sufficiently below the bottom of the screen
      const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height;
      const gameOverY = cameraBottom + 60; // small margin below bottom
      const turtleSpeed = turtle.body?.velocity.y || 0;

      if (turtle.y > gameOverY && turtleSpeed > 150) {
        console.log(`Game Over triggered! Turtle y: ${turtle.y}, Camera bottom: ${cameraBottom}, Speed: ${turtleSpeed}`);
        this.triggerGameOver();
      }
    }
  }

  private triggerGameOver() {
    if (this.isGameOver) return;
    
    // Capture height BEFORE setting game over flag
    const finalHeight = this.heightTracker.getCurrentHeight();
    const finalPoints = this.pointsTracker ? this.pointsTracker.getPoints() : 0;
    
    this.isGameOver = true;
    
    // Stop the turtle
    const turtle = this.turtleController.getTurtle();
    if (turtle) {
      turtle.setVelocity(0, 0);
    }
    
    // Play epic death sound and effects (ensure death sound takes priority)
    this.createDeathExplosion();
    this.audioManager.playDeathSound();
    
    // Stop music
    this.audioManager.stopMusic();
    
    // Show death screen immediately to avoid getting stuck
    this.time.delayedCall(100, () => {
      console.log('Showing death screen with height:', finalHeight, 'points:', finalPoints);
      this.showEpicDeathScreen(finalHeight, finalPoints);
    });
  }

  private async showGameOverScreen(finalHeight: number) {
    const { width, height } = this.cameras.main;
    
    console.log(`Showing game over screen with height: ${finalHeight}`);
    
    // Semi-transparent overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(9999);
    
    // Game over title
    const gameOverTitle = this.add.text(width / 2, height / 2 - 150, 'GAME OVER!', {
      fontSize: '48px',
      color: '#FF6666',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
    
    // Final score
    const scoreText = this.add.text(width / 2, height / 2 - 80, 
      `Final Height: ${finalHeight} turtle units`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
    
    // Restart button
    const restartButton = this.add.text(width / 2, height / 2, 'RESTART GAME 🔄', {
      fontSize: '28px',
      color: '#00FF00',
      fontFamily: 'Arial',
      backgroundColor: '#004400',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000).setInteractive();
    
    restartButton.on('pointerdown', () => {
      console.log('Restart button clicked');
      this.restartGame();
    });
    
    // Leaderboard button - HIDDEN FOR NOW
    // const leaderboardButton = this.add.text(width / 2, height / 2 + 80, 'View Leaderboard 🏆', {
    //   fontSize: '20px',
    //   color: '#FFD700',
    //   fontFamily: 'Arial',
    //   backgroundColor: '#333333',
    //   padding: { x: 15, y: 8 }
    // }).setOrigin(0.5).setScrollFactor(0).setDepth(10000).setInteractive();
    
    // leaderboardButton.on('pointerdown', () => {
    //   console.log('📊 OLD Leaderboard button clicked!');
    //   this.showIntegratedLeaderboard(finalHeight);
    // });
    
    // Check if this is a top score (for later leaderboard integration)
    try {
      const isTopScore = await this.leaderboardService.isTopScore(finalHeight);
      if (isTopScore && finalHeight > 25) {
        // Add a highlight for good scores
        const congratsText = this.add.text(width / 2, height / 2 - 40, 
          '🌟 Great job! New record! 🌟', {
          fontSize: '20px',
          color: '#FFD700',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
      }
    } catch (error) {
      console.log('Could not check leaderboard:', error);
    }
  }

  private createDeathExplosion() {
    const turtle = this.turtleController.getTurtle();
    if (!turtle) return;

    // Shorter, tighter screen shake
    this.cameras.main.shake(600, 0.05);

    // Single strong burst
    const explosionParticles = this.add.particles(turtle.x, turtle.y, 'platform1', {
      speed: { min: 400, max: 900 },
      scale: { start: 0.6, end: 0 },
      lifespan: 700,
      quantity: 120,
      tint: [0xFF0000, 0xFF9900, 0xFFFF00, 0xFFFFFF],
      gravityY: 250,
      blendMode: 'ADD'
    });

    const shockwaveParticles = this.add.particles(turtle.x, turtle.y, 'platform1', {
      speed: { min: 200, max: 500 },
      scale: { start: 1.0, end: 0 },
      lifespan: 600,
      quantity: 60,
      tint: [0xFFFFFF],
      alpha: { start: 0.9, end: 0 },
      blendMode: 'SCREEN'
    });

    this.time.delayedCall(650, () => {
      explosionParticles.destroy();
      shockwaveParticles.destroy();
    });

    // Multiple color flashes for epic effect
    // Single quick flash
    const flash = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0xFFFFFF, 0.5
    ).setScrollFactor(0).setDepth(9998);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

                    // Single explosion sound - no spam!
                if (this.audioManager) {
                    this.audioManager.playDeathSound();
                }
  }

  private showEpicDeathScreen(finalHeight: number, finalPoints: number) {
    console.log('🎮 showEpicDeathScreen called with height:', finalHeight, 'points:', finalPoints);
    const { width, height } = this.cameras.main;
    
    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9)
      .setScrollFactor(0).setDepth(9999);

    // EPIC DEATH TITLE with dripping blood effect
    const deathTitle = this.add.text(width / 2, height / 2 - 200, '💀 BOB HAS FALLEN! 💀', {
      fontSize: '48px',
      color: '#FF0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#660000', blur: 10, fill: true }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

    // Sad Bob ASCII Art
    const sadBob = this.add.text(width / 2 - 150, height / 2 - 100, 
      `    ╭──╮\n   ╰ ● ╯   💧\n   ╭─🐢─╮  💧\n  ╰─────╯ 💧\n      😭`, {
      fontSize: '20px',
      color: '#00AA00',
      fontFamily: 'Courier',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

    // Coffin and skulls
    const coffin = this.add.text(width / 2 + 100, height / 2 - 50, '⚰️', {
      fontSize: '80px'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

    const skulls = this.add.text(width / 2, height / 2 + 50, '💀 ☠️ 💀 ☠️ 💀', {
      fontSize: '32px'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

    // Final height with dramatic effect
    // Randomized cheeky death messages
    const messages = [
      `Bob reached ${finalHeight} turtle units\nbefore her tragic demise...`,
      `She flew too close to the sun. ${finalHeight} turtle units!`,
      `Gravity won. ${finalHeight} turtle units.`,
      `She bonked it at ${finalHeight}. Brutal.`,
      `A heroic swan dive at ${finalHeight} turtle units.`,
      `RIP Bob. ${finalHeight} TU. Send snacks.`,
      `She’ll bounce again. Score: ${finalHeight}.`,
      `Combo broke. Spirit didn’t. ${finalHeight}.`,
      `Skulls approved this message: ${finalHeight}.`,
      `F in the chat for ${finalHeight} turtle units.`,
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    const heightText = this.add.text(width / 2, height / 2 + 120, msg.replace(/turtle units/gi, 'SUPER MEGA ULTIMATE TO THE MAX EXTREME TURTLE UNITS!'), {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

    // Show final points as separate score metric
    const pointsText = this.add.text(width / 2, height / 2 + 160, `Score: ${finalPoints} pts (combo-fueled)`, {
      fontSize: '20px',
      color: '#7CFC00',
      fontFamily: 'Arial',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

    // Restart button with glow effect
    const restartButton = this.add.text(width / 2, height / 2 + 200, '🔄 REVIVE BOB 🔄', {
      fontSize: '28px',
      color: '#00FF00',
      fontFamily: 'Arial',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 },
      stroke: '#00AA00',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000).setInteractive();

    // Leaderboard button - HIDDEN FOR NOW
    // const leaderboardButton = this.add.text(width / 2, height / 2 + 260, '👑 View Leaderboard 👑', {
    //   fontSize: '20px',
    //   color: '#FFD700',
    //   fontFamily: 'Arial',
    //   backgroundColor: '#333333',
    //   padding: { x: 15, y: 8 }
    // }).setOrigin(0.5).setScrollFactor(0).setDepth(10000).setInteractive();

    // Button interactions - set up BEFORE animation
    restartButton.on('pointerdown', () => {
      console.log('🔄 REVIVE BOB clicked!');
      this.restartGame();
    });

    restartButton.on('pointerover', () => {
      restartButton.setScale(1.1);
    });

    restartButton.on('pointerout', () => {
      restartButton.setScale(1);
    });

    // leaderboardButton.on('pointerdown', () => {
    //   console.log('🏆 Leaderboard button clicked, opening with height:', finalHeight);
    //   this.showIntegratedLeaderboard(finalHeight);
    // });

    // leaderboardButton.on('pointerover', () => {
    //   leaderboardButton.setScale(1.1);
    // });

    // leaderboardButton.on('pointerout', () => {
    //   leaderboardButton.setScale(1);
    // });

    // Animate everything in dramatically
    [deathTitle, sadBob, coffin, skulls, heightText, pointsText, restartButton].forEach((element, index) => {
      element.setAlpha(0);
      this.tweens.add({
        targets: element,
        alpha: 1,
        duration: 500,
        delay: index * 200,
        ease: 'Power2.easeOut'
      });
    });

    // Check if it's a top score (async, don't block UI)
    this.leaderboardService.isTopScore(finalHeight).then((isTop: boolean) => {
      if (isTop) {
        const newRecordText = this.add.text(width / 2, height / 2 - 250, 
          '🎉 NEW RECORD! 🎉\nBob died heroically!', {
          fontSize: '20px',
          color: '#FFD700',
          fontFamily: 'Arial',
          align: 'center',
          stroke: '#AA6600',
          strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

        this.audioManager.playNewRecordSound();
      }
    }).catch(() => {
      // Ignore leaderboard check errors
      console.log('Could not check if score is a top score');
    });
  }

  private restartGame() {
    console.log('Restarting game...');
    
    // Prevent restart spam
    if (this.isRestarting) {
      console.log('Already restarting - ignoring request');
      return;
    }
    this.isRestarting = true;
    
    // Reset game state
    this.isGameOver = false;
    this.gameStarted = false;
    
    // Reset height tracker
    if (this.heightTracker) {
      this.heightTracker.reset();
    }
    
    // Reset points tracker
    if (this.pointsTracker) {
      this.pointsTracker.reset();
    }
    
    // Clean up leaderboard container
    if (this.leaderboardContainer) {
      this.leaderboardContainer.destroy();
      this.leaderboardContainer = undefined;
    }
    
    // Reset name input state and remove keyboard listener
    this.currentName = '';
    this.nameInput = undefined;
    
    // Remove keyboard listener to prevent interference
    if (this.nameInputHandler) {
      this.input.keyboard?.off('keydown', this.nameInputHandler);
      this.nameInputHandler = undefined;
      console.log('Removed keyboard listener on restart'); // Debug
    }
    
    // Reset leaderboard flag
    this.isLeaderboardOpen = false;
    
    // Reset combo system
    this.platformManager.resetCombo();
    
    // Stop all audio to prevent chaos
    this.audioManager.stopMusic();
    
    // Restart the scene
    this.scene.restart();
  }

  private isRestarting: boolean = false;

  public getTurtleController(): TurtleController {
    return this.turtleController;
  }

  public getPlatformManager(): PlatformManager {
    return this.platformManager;
  }

  public getHeightTracker(): HeightTracker {
    return this.heightTracker;
  }

  private setupMobileOptimizations() {
    // Detect mobile device
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (this.isMobile) {
      // Capture touch and disable default actions to avoid scroll/zoom
      this.game.canvas.style.touchAction = 'none';
      // Capture touch input without assigning to optional chain
      if ((this.input as any).touch) {
        (this.input as any).touch.capture = true;
      }

      // Request device orientation permission (iOS 13+)
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ permission request
        this.showOrientationPermissionPrompt();
      } else if (window.DeviceOrientationEvent) {
        // Android and older iOS
        this.enableDeviceOrientation();
      }
      
      // Prevent zoom on double tap
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
      
      // Prevent scrolling while touching game canvas only
      this.game.canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
      }, { passive: false });
      
      // Add mobile-specific UI hints
      this.addMobileUIHints();
    }
  }

  private showOrientationPermissionPrompt() {
    if (this.isMobile) {
      const { width, height } = this.cameras.main;
      
      const promptText = this.add.text(width / 2, 100, 
        'Tap to enable tilt controls! 📱', {
        fontSize: '18px',
        color: '#FFFF00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(6000).setInteractive();
      
      promptText.on('pointerdown', async () => {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            this.enableDeviceOrientation();
            promptText.destroy();
          }
        } catch (error) {
          console.log('Device orientation not available');
          promptText.destroy();
        }
      });
      
      // Auto-hide after 5 seconds
      this.time.delayedCall(5000, () => {
        if (promptText.active) promptText.destroy();
      });
    }
  }

  private enableDeviceOrientation() {
    window.addEventListener('deviceorientation', (event: DeviceOrientationEvent) => {
      this.deviceOrientation = event;
    });
  }

  private addMobileUIHints() {
    const { width, height } = this.cameras.main;
    
    // Add finger gesture hint
    const gestureHint = this.add.text(width / 2, height - 50, 
      '🐢 Bob bounces automatically! Use arrow keys or tilt to steer! 📱', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setAlpha(0.8);
    
    // Fade out hint after game starts
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: gestureHint,
        alpha: 0,
        duration: 1000,
        onComplete: () => gestureHint.destroy()
      });
    });
  }

  private updateMobileControls() {
    if (this.isMobile && this.deviceOrientation && this.gameStarted && !this.isGameOver) {
      // Apply subtle tilt influence (gamma is left/right tilt)
      const tiltX = (this.deviceOrientation.gamma || 0) / 90; // Normalize to -1 to 1
      this.turtleController.addTiltInfluence(tiltX * 0.3); // Reduce influence for subtlety
    }
  }

    private showIntegratedLeaderboard(finalHeight: number) {
    console.log('📊 showIntegratedLeaderboard called with finalHeight:', finalHeight);
    const { width, height } = this.cameras.main;

    // Store the final height for later use
    this.storedFinalHeight = finalHeight;
    
    // Set flag to prevent global restart on key press
    this.isLeaderboardOpen = true;

    // Remove existing leaderboard if any
    if (this.leaderboardContainer) {
      this.leaderboardContainer.destroy();
    }

    // Create container for leaderboard content - positioned on the right side
    this.leaderboardContainer = this.add.container(0, 0);
    this.leaderboardContainer.setScrollFactor(0).setDepth(10000);

    // Always show name entry first - everyone can submit their score!
    this.showNameEntrySection(finalHeight);
  }

  private showNameEntrySection(finalHeight: number) {
    if (!this.leaderboardContainer) return;
    const { width, height } = this.cameras.main;
    
    // Clear container
    this.leaderboardContainer.removeAll(true);
    
    // Right side panel for name entry (starts at 60% of screen width)
    const rightX = width * 0.75; // Center of right panel
    
    // Background for right panel
    const panelBg = this.add.rectangle(rightX, height / 2, width * 0.45, height * 0.8, 0x000000, 0.7);
    panelBg.setStrokeStyle(3, 0xFFD700);
    this.leaderboardContainer?.add(panelBg);
    
    // Score submission title
    const title = this.add.text(rightX, height * 0.15, '🏆 SUBMIT YOUR SCORE! 🏆', {
      fontSize: '28px',
      color: '#FFD700',
      fontFamily: 'Arial',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.leaderboardContainer?.add(title);
    
    // Achievement text - check if it's actually a high score
    this.leaderboardService.isTopScore(finalHeight).then(isTopScore => {
      const achievementText = isTopScore 
        ? `🎉 AMAZING! NEW HIGH SCORE! 🎉\nYou reached ${finalHeight} TURTLE UNITS!`
        : `Great run! You reached\n${finalHeight} TURTLE UNITS!`;
      
      const achievement = this.add.text(rightX, height * 0.25, achievementText, {
        fontSize: '18px',
        color: isTopScore ? '#FFD700' : '#FFFFFF',
        fontFamily: 'Arial',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      this.leaderboardContainer?.add(achievement);
    }).catch(() => {
      // Fallback if we can't check
      const achievement = this.add.text(rightX, height * 0.25, `Great run! You reached\n${finalHeight} TURTLE UNITS!`, {
        fontSize: '18px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      this.leaderboardContainer?.add(achievement);
    });
    
    // Name entry section
    const nameLabel = this.add.text(rightX, height * 0.4, 'Enter your name:', {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    this.leaderboardContainer?.add(nameLabel);
    
    // Name input field with border
    const inputBg = this.add.rectangle(rightX, height * 0.48, width * 0.3, 50, 0x333333);
    inputBg.setStrokeStyle(2, 0xFFFFFF);
    this.leaderboardContainer?.add(inputBg);
    
    this.nameInput = this.add.text(rightX, height * 0.48, 'Type your name...', {
      fontSize: '18px',
      color: '#CCCCCC',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setInteractive();
    
    // Handle clicks on the input field
    this.nameInput.on('pointerdown', () => {
      console.log('🖱️ Name input clicked, current name:', this.currentName);
      if (this.nameInput) {
        // Clear placeholder and show cursor
        if (this.currentName === '') {
          this.nameInput.setText('|');
        } else {
          this.nameInput.setText(this.currentName + '|');
        }
        this.nameInput.setColor('#FFFFFF');
      }
    });
    
    this.leaderboardContainer?.add(this.nameInput);
    
    // Submit button - bulletproof implementation
    const submitButton = this.add.rectangle(rightX, height * 0.6, 200, 50, 0x00AA00)
      .setStrokeStyle(2, 0x00FF00)
      .setInteractive()
      .setDepth(15000);
    
    const submitText = this.add.text(rightX, height * 0.6, 'Submit Score! 🚀', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(15001);
    
    // Direct click handler that will work - prevent spam
    let submitClicked = false;
    submitButton.on('pointerdown', () => {
      if (submitClicked) return; // Prevent spam clicking
      submitClicked = true;
      
      const trimmed = this.currentName.trim();
      if (trimmed.length >= 2) {
        this.submitScore(this.storedFinalHeight);
      } else {
        if (this.nameInput) {
          this.nameInput.setText('Name must be 2+ characters!');
          this.nameInput.setColor('#FF6666');
        }
      }
      
      // Re-enable after delay
      setTimeout(() => {
        submitClicked = false;
      }, 1000);
    });
    
    submitButton.on('pointerover', () => {
      submitButton.setFillStyle(0x00FF00);
      submitText.setScale(1.1);
    });
    
    submitButton.on('pointerout', () => {
      submitButton.setFillStyle(0x00AA00);
      submitText.setScale(1);
    });
    
    this.leaderboardContainer?.add(submitButton);
    this.leaderboardContainer?.add(submitText);
    
    // Skip button
    const skipButton = this.add.text(rightX, height * 0.7, 'Skip & View Leaderboard', {
      fontSize: '16px',
      color: '#FFFF00',
      fontFamily: 'Arial',
      backgroundColor: '#666600',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    skipButton.on('pointerdown', () => {
      this.showLeaderboardSection();
    });
    
    skipButton.on('pointerover', () => {
      skipButton.setScale(1.05);
    });
    
    skipButton.on('pointerout', () => {
      skipButton.setScale(1);
    });
    
    this.leaderboardContainer?.add(skipButton);
    
    // Instructions
    const instructions = this.add.text(rightX, height * 0.82, 'Everyone can submit their score!\nType your name and press ENTER or click Submit\n(2-15 characters, no profanity)', {
      fontSize: '12px',
      color: '#AAAAAA',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    this.leaderboardContainer?.add(instructions);
    
    // Set up keyboard input for name entry
    console.log('🎯 About to call setupNameInput...');
    this.setupNameInput();
    console.log('🎯 setupNameInput call completed');
  }

  private async showLeaderboardSection() {
    if (!this.leaderboardContainer) return;
    const { width, height } = this.cameras.main;
    
    // Clear container
    this.leaderboardContainer.removeAll(true);
    
    // Right side panel for leaderboard (starts at 60% of screen width)
    const rightX = width * 0.75; // Center of right panel
    
    // Background for right panel
    const panelBg = this.add.rectangle(rightX, height / 2, width * 0.45, height * 0.9, 0x000000, 0.8);
    panelBg.setStrokeStyle(3, 0xFFD700);
    this.leaderboardContainer?.add(panelBg);
    
    // Loading text
    const loadingText = this.add.text(rightX, height / 2, 'Loading leaderboard...', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.leaderboardContainer?.add(loadingText);
    
    try {
      // Get leaderboard data
      const leaderboardData = await this.leaderboardService.getTopScores(8);
      
      // Remove loading text
      loadingText.destroy();
      
      // Title
      const title = this.add.text(rightX, height * 0.08, 'Bob\'s Cosmic Leaderboard 🐢🌟', {
        fontSize: '24px',
        color: '#FFD700',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      this.leaderboardContainer?.add(title);
      
      // Show message if no scores
      if (leaderboardData.length === 0) {
        const noScoresText = this.add.text(rightX, height * 0.4, 'No scores yet!\nBe the first to submit a score!', {
          fontSize: '18px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
          align: 'center'
        }).setOrigin(0.5);
        this.leaderboardContainer?.add(noScoresText);
      }
      
      // Column headers
      const rankHeader = this.add.text(rightX - width * 0.12, height * 0.18, 'RANK', {
        fontSize: '16px',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.leaderboardContainer?.add(rankHeader);
      
      const nameHeader = this.add.text(rightX, height * 0.18, 'NAME', {
        fontSize: '16px',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.leaderboardContainer?.add(nameHeader);
      
      const heightHeader = this.add.text(rightX + width * 0.12, height * 0.18, 'HEIGHT', {
        fontSize: '16px',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.leaderboardContainer?.add(heightHeader);
      
      // Display entries
      leaderboardData.slice(0, 8).forEach((entry: any, index: number) => {
        const yPos = height * 0.25 + (index * height * 0.06);
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
        const entryColor = index < 3 ? colors[index] : '#FFFFFF';
        
        // Rank with medals for top 3
        const rankText = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`;
        const rankDisplay = this.add.text(rightX - width * 0.12, yPos, rankText, {
          fontSize: '14px',
          color: entryColor,
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.leaderboardContainer?.add(rankDisplay);
        
        // Name (truncate if too long)
        const displayName = entry.name.length > 12 ? entry.name.substring(0, 12) + '...' : entry.name;
        const nameDisplay = this.add.text(rightX, yPos, displayName, {
          fontSize: '14px',
          color: entryColor,
          fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.leaderboardContainer?.add(nameDisplay);
        
        // Height
        const heightDisplay = this.add.text(rightX + width * 0.12, yPos, `${entry.height} TU`, {
          fontSize: '14px',
          color: entryColor,
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.leaderboardContainer?.add(heightDisplay);
      });
      
      // Back button at bottom of panel
      const backButton = this.add.text(rightX, height * 0.88, '← Hide Leaderboard', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        backgroundColor: '#333333',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setInteractive();
      
      backButton.on('pointerdown', () => {
        console.log('Hide leaderboard button clicked!'); // Debug log
        
        // Reset flag to re-enable global restart
        this.isLeaderboardOpen = false;
        console.log('Leaderboard closed - re-enabling global restart'); // Debug
        
        // Hide leaderboard and clean up
        if (this.leaderboardContainer) {
          this.leaderboardContainer.destroy();
          this.leaderboardContainer = undefined;
        }
        
        // Clean up name input
        this.currentName = '';
        this.nameInput = undefined;
        
        // Remove keyboard listener
        if (this.nameInputHandler) {
          this.input.keyboard?.off('keydown', this.nameInputHandler);
          this.nameInputHandler = undefined;
        }
      });
      
      backButton.on('pointerover', () => {
        backButton.setScale(1.1);
      });
      
      backButton.on('pointerout', () => {
        backButton.setScale(1);
      });
      
      this.leaderboardContainer?.add(backButton);
      
    } catch (error) {
      loadingText.setText('Failed to load leaderboard 😞');
      console.error('Leaderboard error:', error);
    }
    
    // Always add hide button regardless of API success/failure
    const hideButton = this.add.text(rightX, height * 0.88, '← Hide Leaderboard', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    hideButton.on('pointerdown', () => {
      this.isLeaderboardOpen = false;
      if (this.leaderboardContainer) {
        this.leaderboardContainer.destroy();
        this.leaderboardContainer = undefined;
      }
      this.currentName = '';
      this.nameInput = undefined;
      if (this.nameInputHandler) {
        this.input.keyboard?.off('keydown', this.nameInputHandler);
        this.nameInputHandler = undefined;
      }
    });
    
    this.leaderboardContainer?.add(hideButton);
  }

  private setupNameInput() {
    console.log('🎹 Setting up name input...');
    
    // Reset current name
    this.currentName = '';
    
    // Remove existing listener if any
    if (this.nameInputHandler) {
      this.input.keyboard?.off('keydown', this.nameInputHandler);
    }
    
    // Make sure keyboard input is enabled
    if (!this.input.keyboard) {
      console.log('❌ No keyboard input available');
      return;
    }
    
    console.log('✅ Keyboard input available, continuing setup...');
    
    // Create new handler
    this.nameInputHandler = (event: KeyboardEvent) => {
      console.log('⌨️ Key pressed:', event.key, 'current name:', this.currentName);
      if (!this.isGameOver || !this.nameInput) {
        console.log('❌ Ignoring key - isGameOver:', this.isGameOver, 'hasNameInput:', !!this.nameInput);
        return;
      }
      
      if (event.key === 'Backspace') {
        this.currentName = this.currentName.slice(0, -1);
        console.log('🔙 Backspace - new name:', this.currentName);
      } else if (event.key === 'Enter') {
        const trimmed = this.currentName.trim();
        if (trimmed.length >= 2) {
          console.log('✅ Enter pressed - submitting score');
          this.submitScore(this.storedFinalHeight);
        } else {
          console.log('❌ Enter pressed but name too short:', trimmed);
        }
      } else if (event.key.length === 1 && this.currentName.length < this.maxNameLength) {
        // Only allow letters, numbers, and basic symbols
        if (/[a-zA-Z0-9\s\-_]/.test(event.key)) {
          this.currentName += event.key;
          console.log('✅ Added character - new name:', this.currentName);
        } else {
          console.log('❌ Invalid character:', event.key);
        }
      } else {
        console.log('❌ Key ignored - special key or name too long');
      }
      
      this.updateNameDisplay();
    };
    
    // Set up keyboard events for name input
    this.input.keyboard.on('keydown', this.nameInputHandler);
    console.log('🎹 Keyboard listener attached successfully');
    
    // Update display immediately
    this.updateNameDisplay();
    console.log('🎹 Name input setup completed successfully');
  }

  private updateNameDisplay() {
    console.log('🔄 updateNameDisplay called, currentName:', this.currentName, 'nameInput text:', this.nameInput?.text);
    if (this.nameInput) {
      const isEmpty = this.currentName === '';
      const isValidName = this.isValidName(this.currentName);
      
      if (!isEmpty) {
        this.nameInput.setText(this.currentName + '|');
        this.nameInput.setColor(isValidName ? '#FFFFFF' : '#FF6666');
        console.log('📝 Updated display to:', this.nameInput.text);
      } else {
        if (this.nameInput.text === 'Type your name...') {
          this.nameInput.setColor('#AAAAAA');
          console.log('📝 Keeping placeholder');
        } else {
          this.nameInput.setText('|');
          this.nameInput.setColor('#FFFFFF');
          console.log('📝 Showing empty cursor');
        }
      }
    } else {
      console.log('❌ No nameInput found in updateNameDisplay');
    }
  }

  private isValidName(name: string): boolean {
    if (!name || name.trim().length < 2) return false;
    if (name.trim().length > this.maxNameLength) return false;
    
    // Basic profanity filter
    const profanityList = ['shit', 'fuck', 'bitch', 'damn', 'hell'];
    const lowerName = name.toLowerCase().trim();
    if (profanityList.some(word => lowerName.includes(word))) return false;
    
    return true;
  }

  private async submitScore(height: number) {
    const trimmedName = this.currentName.trim();
    
    if (!this.isValidName(trimmedName) || trimmedName.length < 2) {
      if (this.nameInput) {
        this.nameInput.setText('Name must be 2+ characters!');
        this.nameInput.setColor('#FF6666');
      }
      return;
    }
    
    try {
      // Show submitting message
      if (this.nameInput) {
        this.nameInput.setText('Submitting...');
        this.nameInput.setColor('#FFFF00');
      }
      
      // Submit to leaderboard service
      const success = await this.leaderboardService.submitScore(trimmedName, height);
      
      if (success) {
        // Show success and switch to leaderboard view
        if (this.nameInput) {
          this.nameInput.setText('Score submitted! 🎉');
          this.nameInput.setColor('#00FF00');
        }
        
        // Auto-switch to leaderboard after a delay
        this.time.delayedCall(1500, () => {
          this.showLeaderboardSection();
        });
      } else {
        throw new Error('Failed to submit score');
      }
      
    } catch (error) {
      if (this.nameInput) {
        this.nameInput.setText('Failed to submit. Try again.');
        this.nameInput.setColor('#FF6666');
      }
    }
  }
}
