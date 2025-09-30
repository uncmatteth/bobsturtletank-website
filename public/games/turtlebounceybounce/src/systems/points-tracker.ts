import Phaser from 'phaser';
import { PlatformManager } from './platform-manager';
import { HeightTracker } from './height-tracker';

interface BounceInfo {
  x: number;
  y: number;
  isMoving?: boolean;
  isTiny?: boolean;
  isTimed?: boolean;
  comboMultiplier: number;
  consecutiveBounces: number;
}

/**
 * PointsTracker
 * Tracks a separate points score that uses height progress and the active combo multiplier.
 * - Awards per-bounce points scaled by combo and platform difficulty modifiers
 * - Awards tier bonuses every 100 height units crossed
 * - Adds a gentle drip of points for continuous upward progress
 * - Renders a HUD text showing current points and best points (local)
 */
export class PointsTracker {
  private scene: Phaser.Scene;
  private platformManager: PlatformManager;
  private heightTracker: HeightTracker;

  private points: number = 0;
  private bestPoints: number = 0;

  private pointsDisplay!: Phaser.GameObjects.Text;

  private lastHeightCounted: number = 0;
  private lastTierAwarded: number = 0;

  constructor(scene: Phaser.Scene, platformManager: PlatformManager, heightTracker: HeightTracker) {
    this.scene = scene;
    this.platformManager = platformManager;
    this.heightTracker = heightTracker;

    this.loadBestPoints();
    this.createHud();

    // Listen to bounce events emitted by PlatformManager
    this.platformManager.setBounceListener((info: BounceInfo) => this.onBounce(info));
  }

  public reset(): void {
    this.points = 0;
    this.lastHeightCounted = 0;
    this.lastTierAwarded = 0;
    this.updateHud();
  }

  public update(): void {
    const currentHeight = this.heightTracker.getCurrentHeight();

    // Award small drip based on new height gained since last frame (1 point per 5 units)
    if (currentHeight > this.lastHeightCounted) {
      const gained = currentHeight - this.lastHeightCounted;
      const drip = Math.floor(gained / 5);
      if (drip > 0) {
        this.addPoints(drip);
        this.lastHeightCounted += drip * 5;
      }
    }

    // Tier bonus every 100 units, scaled by current multiplier
    const tier = Math.floor(currentHeight / 100);
    if (tier > this.lastTierAwarded) {
      const { multiplier } = this.platformManager.getComboInfo();
      const bonus = Math.floor(100 * (1 + 0.5 * (multiplier - 1)));
      this.addPoints(bonus);
      this.showFloatingText(this.scene.cameras.main.centerX, this.scene.cameras.main.scrollY + 140, `+${bonus} Tier Bonus x${multiplier}`);
      this.lastTierAwarded = tier;
    }

    this.updateHud();
  }

  private onBounce(info: BounceInfo): void {
    // Base points per bounce
    let base = 10;

    // Platform modifiers
    if (info.isMoving) base += 8;
    if (info.isTiny) base += 12;
    if (info.isTimed) base += 16;

    // Streak spice: small extra per 3+ chain
    if (info.consecutiveBounces >= 3) {
      base += Math.floor(info.consecutiveBounces / 3) * 3;
    }

    const awarded = base * Math.max(1, info.comboMultiplier);
    this.addPoints(awarded);

    // Localized floating text at bounce location
    this.showFloatingText(info.x, info.y - 40, `+${awarded} x${info.comboMultiplier}`);
  }

  private createHud(): void {
    // Place under height HUD (which uses y:20 and y:60). We'll use y:100.
    this.pointsDisplay = this.scene.add.text(20, 100, 'Points: 0 (Best: 0)', {
      fontSize: '22px',
      color: '#7CFC00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(1000);
  }

  private updateHud(): void {
    if (this.points > this.bestPoints) {
      this.bestPoints = this.points;
      this.saveBestPoints();
    }
    this.pointsDisplay.setText(`Points: ${this.points} (Best: ${this.bestPoints})`);
  }

  private addPoints(amount: number): void {
    this.points += Math.max(0, Math.floor(amount));
  }

  private showFloatingText(x: number, y: number, text: string): void {
    const t = this.scene.add.text(x, y, text, {
      fontSize: '20px',
      color: '#FFFF66',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(2000);

    t.setScale(0.6);
    this.scene.tweens.add({ targets: t, y: y - 80, alpha: 0, scaleX: 1, scaleY: 1, duration: 1000, ease: 'Power2', onComplete: () => t.destroy() });
  }

  public getPoints(): number { return this.points; }

  private loadBestPoints(): void {
    const saved = localStorage.getItem('bob-turtle-best-points');
    this.bestPoints = saved ? parseInt(saved) : 0;
  }

  private saveBestPoints(): void {
    localStorage.setItem('bob-turtle-best-points', this.bestPoints.toString());
  }
}


