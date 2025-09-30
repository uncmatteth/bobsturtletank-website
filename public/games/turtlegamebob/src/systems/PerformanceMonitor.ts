/**
 * PerformanceMonitor - Monitors and optimizes game performance
 * Uses industry-standard techniques to ensure smooth gameplay
 */

import Phaser from 'phaser';

export class PerformanceMonitor {
  private scene: Phaser.Scene;
  private fpsText!: Phaser.GameObjects.Text;
  private memoryText!: Phaser.GameObjects.Text;
  private objectCountText!: Phaser.GameObjects.Text;
  
  private fpsValues: number[] = [];
  private memValues: number[] = [];
  private lastTime: number = 0;
  private frameCount: number = 0;
  private lowFpsWarningThreshold: number = 30;
  private criticalFpsWarningThreshold: number = 20;
  
  private optimizationLevel: number = 0; // 0-3, where 3 is most aggressive
  private showStats: boolean = false;
  
  // Object pools
  private particlePool: any[] = [];
  private textPool: any[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.lastTime = performance.now();
    
    // Create stats display (hidden by default)
    this.createStatsDisplay();
    
    // Set up optimization level based on device
    this.setupOptimizationLevel();
    
    // Apply initial optimization
    this.applyOptimizations();
    
    // Set up toggle key
    this.scene.input.keyboard?.on('keydown-F3', () => {
      this.showStats = !this.showStats;
      this.fpsText.setVisible(this.showStats);
      this.memoryText.setVisible(this.showStats);
      this.objectCountText.setVisible(this.showStats);
    });
  }
  
  /**
   * Create performance stats display
   */
  private createStatsDisplay(): void {
    this.fpsText = this.scene.add.text(10, 10, 'FPS: 60', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(1000).setVisible(this.showStats);
    
    this.memoryText = this.scene.add.text(10, 30, 'MEM: 0 MB', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(1000).setVisible(this.showStats);
    
    this.objectCountText = this.scene.add.text(10, 50, 'OBJ: 0', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(1000).setVisible(this.showStats);
  }
  
  /**
   * Set up optimization level based on device
   */
  private setupOptimizationLevel(): void {
    // Check if mobile device
    if (this.scene.sys.game.device.os.android || this.scene.sys.game.device.os.iOS) {
      this.optimizationLevel = 2; // Higher optimization for mobile
    } else {
      this.optimizationLevel = 1; // Standard optimization for desktop
    }
    
    // Check for URL parameter to force optimization level
    const urlParams = new URLSearchParams(window.location.search);
    const optParam = urlParams.get('opt');
    if (optParam !== null) {
      const optLevel = parseInt(optParam);
      if (!isNaN(optLevel) && optLevel >= 0 && optLevel <= 3) {
        this.optimizationLevel = optLevel;
      }
    }
    
    console.log(`🎮 Performance optimization level: ${this.optimizationLevel}`);
  }
  
  /**
   * Apply optimizations based on current level
   */
  private applyOptimizations(): void {
    // Level 0: No optimizations (for high-end devices)
    if (this.optimizationLevel === 0) {
      return;
    }
    
    // Level 1: Basic optimizations (for mid-range devices)
    if (this.optimizationLevel >= 1) {
      // Reduce particle count
      this.scene.registry.set('particleMultiplier', 0.8);
      
      // Disable some visual effects
      this.scene.registry.set('screenShakeEnabled', true);
      this.scene.registry.set('lightingEnabled', true);
    }
    
    // Level 2: Medium optimizations (for low-end devices)
    if (this.optimizationLevel >= 2) {
      // Further reduce particle count
      this.scene.registry.set('particleMultiplier', 0.5);
      
      // Disable more visual effects
      this.scene.registry.set('screenShakeEnabled', false);
      this.scene.registry.set('lightingEnabled', false);
      
      // Reduce draw distance
      this.scene.registry.set('drawDistance', 600);
      
      // Disable anti-aliasing
      this.scene.game.renderer.setAntialias(false);
    }
    
    // Level 3: Aggressive optimizations (for very low-end devices)
    if (this.optimizationLevel >= 3) {
      // Minimal particle effects
      this.scene.registry.set('particleMultiplier', 0.2);
      
      // Disable all visual effects
      this.scene.registry.set('screenShakeEnabled', false);
      this.scene.registry.set('lightingEnabled', false);
      this.scene.registry.set('animationsEnabled', false);
      
      // Minimal draw distance
      this.scene.registry.set('drawDistance', 400);
      
      // Reduce texture quality
      this.scene.game.renderer.setAntialias(false);
      
      // Disable background animations
      this.scene.registry.set('backgroundAnimationsEnabled', false);
    }
  }
  
  /**
   * Update performance monitoring
   */
  public update(time: number, delta: number): void {
    this.frameCount++;
    
    // Update stats every 30 frames
    if (this.frameCount % 30 === 0) {
      this.updateStats(time);
    }
    
    // Check for performance issues every 60 frames
    if (this.frameCount % 60 === 0) {
      this.checkPerformance();
    }
  }
  
  /**
   * Update performance stats
   */
  private updateStats(time: number): void {
    // Calculate FPS
    const elapsed = time - this.lastTime;
    const fps = Math.round(30 / (elapsed / 1000));
    this.lastTime = time;
    
    // Update FPS values array (keep last 5 values)
    this.fpsValues.push(fps);
    if (this.fpsValues.length > 5) {
      this.fpsValues.shift();
    }
    
    // Calculate average FPS
    const avgFps = Math.round(this.fpsValues.reduce((a, b) => a + b, 0) / this.fpsValues.length);
    
    // Update memory usage (if available)
    let memory = 0;
    if (window.performance && (window.performance as any).memory) {
      memory = Math.round((window.performance as any).memory.usedJSHeapSize / (1024 * 1024));
      
      // Update memory values array (keep last 5 values)
      this.memValues.push(memory);
      if (this.memValues.length > 5) {
        this.memValues.shift();
      }
    }
    
    // Calculate object count
    const objectCount = this.scene.children.getChildren().length;
    
    // Update display
    if (this.showStats) {
      // Color based on FPS
      let fpsColor = '#00ff00'; // Green
      if (avgFps < this.lowFpsWarningThreshold) {
        fpsColor = '#ffff00'; // Yellow
      }
      if (avgFps < this.criticalFpsWarningThreshold) {
        fpsColor = '#ff0000'; // Red
      }
      
      this.fpsText.setText(`FPS: ${avgFps}`).setColor(fpsColor);
      this.memoryText.setText(`MEM: ${memory} MB`);
      this.objectCountText.setText(`OBJ: ${objectCount}`);
    }
  }
  
  /**
   * Check for performance issues and adjust
   */
  private checkPerformance(): void {
    // Calculate average FPS
    const avgFps = this.fpsValues.reduce((a, b) => a + b, 0) / this.fpsValues.length;
    
    // Check for low FPS (only after we have enough data)
    if (this.fpsValues.length >= 10 && avgFps < this.lowFpsWarningThreshold && avgFps > 0 && this.optimizationLevel < 3) {
      console.warn(`⚠️ Low FPS detected: ${Math.round(avgFps)}`);
      
      // Increase optimization level
      this.optimizationLevel++;
      this.applyOptimizations();
      
      console.log(`🎮 Optimization level increased to ${this.optimizationLevel}`);
    }
    
    // Check for memory issues
    if (this.memValues.length > 0) {
      const avgMem = this.memValues.reduce((a, b) => a + b, 0) / this.memValues.length;
      
      if (avgMem > 500 && this.optimizationLevel < 3) { // 500MB threshold
        console.warn(`⚠️ High memory usage detected: ${Math.round(avgMem)} MB`);
        
        // Increase optimization level
        this.optimizationLevel++;
        this.applyOptimizations();
        
        // Force garbage collection if possible
        if (typeof window.gc === 'function') {
          (window as any).gc();
        }
        
        console.log(`🎮 Optimization level increased to ${this.optimizationLevel}`);
      }
    }
  }
  
  /**
   * Get a particle from the pool or create a new one
   */
  public getParticle(type: string): any {
    // Check pool for available particle
    const particle = this.particlePool.find(p => !p.active && p.type === type);
    
    if (particle) {
      particle.active = true;
      return particle;
    }
    
    // Create new particle if none available
    const newParticle = { type, active: true };
    this.particlePool.push(newParticle);
    
    return newParticle;
  }
  
  /**
   * Return a particle to the pool
   */
  public returnParticle(particle: any): void {
    particle.active = false;
  }
  
  /**
   * Get a text object from the pool or create a new one
   */
  public getText(style: any): Phaser.GameObjects.Text {
    // Check pool for available text
    const textObj = this.textPool.find(t => !t.active);
    
    if (textObj) {
      textObj.active = true;
      textObj.setVisible(true);
      return textObj;
    }
    
    // Create new text if none available
    const newText = this.scene.add.text(0, 0, '', style);
    newText.active = true;
    this.textPool.push(newText);
    
    return newText;
  }
  
  /**
   * Return a text object to the pool
   */
  public returnText(text: Phaser.GameObjects.Text): void {
    text.active = false;
    text.setVisible(false);
  }
  
  /**
   * Check if an object is within draw distance
   */
  public isWithinDrawDistance(x: number, y: number): boolean {
    const drawDistance = this.scene.registry.get('drawDistance') || 800;
    
    // Get camera center
    const camera = this.scene.cameras.main;
    const cameraX = camera.scrollX + camera.width / 2;
    const cameraY = camera.scrollY + camera.height / 2;
    
    // Calculate distance
    const distance = Phaser.Math.Distance.Between(x, y, cameraX, cameraY);
    
    return distance <= drawDistance;
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Clean up text pool
    this.textPool.forEach(text => {
      if (text.destroy) {
        text.destroy();
      }
    });
    
    this.textPool = [];
    this.particlePool = [];
    
    // Remove stats display
    if (this.fpsText) this.fpsText.destroy();
    if (this.memoryText) this.memoryText.destroy();
    if (this.objectCountText) this.objectCountText.destroy();
  }
}





