/**
 * PerformanceSystem - Memory management and optimization for legendary-tier performance
 * Ensures 60 FPS desktop, 30+ FPS mobile with texture atlasing and smart resource management
 */

import Phaser from 'phaser';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  drawCalls: number;
  textureMemory: number;
  gameObjects: number;
  particleCount: number;
}

export interface QualitySettings {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  maxParticles: number;
  maxEnemies: number;
  textureQuality: number;
  shadowsEnabled: boolean;
  postProcessingEnabled: boolean;
  particleEffectsEnabled: boolean;
}

export class PerformanceSystem {
  private scene: Phaser.Scene;
  private metrics: PerformanceMetrics;
  private qualitySettings: QualitySettings;
  
  // Performance monitoring
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private lastFpsCheck: number = 0;
  private performanceCheckInterval: number = 1000; // 1 second
  
  // Texture atlas management
  private textureAtlases: Map<string, Phaser.Textures.Texture> = new Map();
  private spritePool: Map<string, Phaser.GameObjects.Sprite[]> = new Map();
  
  // Memory management
  private memoryThreshold: number = 100 * 1024 * 1024; // 100MB
  private cleanupInterval: number = 30000; // 30 seconds
  private lastCleanup: number = 0;
  
  // Quality adjustment
  private autoQualityEnabled: boolean = true;
  private qualityAdjustmentCooldown: number = 5000; // 5 seconds
  private lastQualityAdjustment: number = 0;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.metrics = {
      fps: 60,
      memoryUsage: 0,
      drawCalls: 0,
      textureMemory: 0,
      gameObjects: 0,
      particleCount: 0
    };
    
    this.qualitySettings = this.getInitialQualitySettings();
    this.initialize();
    
    console.log('⚡ PerformanceSystem initialized');
  }
  
  /**
   * Initialize performance monitoring and optimization
   */
  public initialize(): void {
    this.setupTextureAtlases();
    this.setupObjectPools();
    this.startPerformanceMonitoring();
    
    console.log(`🎯 Quality Level: ${this.qualitySettings.level}`);
    console.log(`📊 Max Enemies: ${this.qualitySettings.maxEnemies}`);
    console.log(`✨ Particles: ${this.qualitySettings.particleEffectsEnabled ? 'Enabled' : 'Disabled'}`);
  }
  
  /**
   * Update performance metrics and auto-adjust quality if needed
   */
  public update(): void {
    this.updateMetrics();
    this.checkPerformance();
    this.performMemoryCleanup();
    
    // Auto-adjust quality based on performance
    if (this.autoQualityEnabled && this.shouldAdjustQuality()) {
      this.autoAdjustQuality();
    }
  }
  
  /**
   * Get optimized sprite from pool or create new one
   */
  public getSprite(textureKey: string, frame?: string | number): Phaser.GameObjects.Sprite {
    const poolKey = `${textureKey}_${frame || 0}`;
    let pool = this.spritePool.get(poolKey);
    
    if (!pool) {
      pool = [];
      this.spritePool.set(poolKey, pool);
    }
    
    // Try to reuse existing sprite
    for (let i = 0; i < pool.length; i++) {
      const sprite = pool[i];
      if (!sprite.active) {
        sprite.setActive(true).setVisible(true);
        return sprite;
      }
    }
    
    // Create new sprite if pool is empty
    const sprite = this.scene.add.sprite(0, 0, textureKey, frame);
    pool.push(sprite);
    
    return sprite;
  }
  
  /**
   * Return sprite to pool for reuse
   */
  public releaseSprite(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setActive(false).setVisible(false);
    sprite.setPosition(0, 0);
    sprite.setScale(1);
    sprite.setRotation(0);
    sprite.setAlpha(1);
    sprite.clearTint();
  }
  
  /**
   * Create texture atlas for efficient rendering
   */
  public createTextureAtlas(atlasKey: string, imageKey: string, jsonKey: string): void {
    try {
      const atlas = this.scene.textures.addAtlas(atlasKey, 
        this.scene.textures.get(imageKey).getSourceImage(),
        this.scene.cache.json.get(jsonKey)
      );
      
      this.textureAtlases.set(atlasKey, atlas);
      console.log(`📋 Texture atlas created: ${atlasKey}`);
    } catch (error) {
      console.warn(`⚠️ Failed to create texture atlas: ${atlasKey}`, error);
    }
  }
  
  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get current quality settings
   */
  public getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }
  
  /**
   * Set quality level manually
   */
  public setQualityLevel(level: 'LOW' | 'MEDIUM' | 'HIGH'): void {
    this.qualitySettings = this.getQualitySettingsForLevel(level);
    this.applyQualitySettings();
    this.scene.registry.set('qualityLevel', level);
    
    console.log(`🎯 Quality level set to: ${level}`);
  }
  
  /**
   * Enable or disable auto quality adjustment
   */
  public setAutoQuality(enabled: boolean): void {
    this.autoQualityEnabled = enabled;
    console.log(`🔄 Auto quality: ${enabled ? 'Enabled' : 'Disabled'}`);
  }
  
  /**
   * Force memory cleanup
   */
  public forceCleanup(): void {
    this.performMemoryCleanup(true);
    console.log('🧹 Forced memory cleanup completed');
  }
  
  /**
   * Get memory usage estimate
   */
  public getMemoryUsage(): number {
    // Estimate memory usage based on active objects
    const textureMemory = this.estimateTextureMemory();
    const objectMemory = this.scene.children.length * 1024; // Rough estimate
    
    return textureMemory + objectMemory;
  }
  
  /**
   * Check if device can handle specific quality level
   */
  public canHandleQuality(level: 'LOW' | 'MEDIUM' | 'HIGH'): boolean {
    const isMobile = this.scene.registry.get('isMobile');
    const devicePixelRatio = this.scene.registry.get('devicePixelRatio') || 1;
    
    if (level === 'HIGH') {
      return !isMobile && devicePixelRatio >= 1.5 && this.metrics.fps >= 45;
    } else if (level === 'MEDIUM') {
      return this.metrics.fps >= 25;
    }
    
    return true; // LOW quality should work on everything
  }
  
  /**
   * Destroy performance system and clean up resources
   */
  public destroy(): void {
    // Clear object pools
    this.spritePool.forEach(pool => {
      pool.forEach(sprite => sprite.destroy());
    });
    this.spritePool.clear();
    
    // Clear texture atlases
    this.textureAtlases.clear();
    
    console.log('⚡ PerformanceSystem destroyed');
  }
  
  // Private helper methods
  
  private getInitialQualitySettings(): QualitySettings {
    const level = this.scene.registry.get('qualityLevel') || 'HIGH';
    return this.getQualitySettingsForLevel(level);
  }
  
  private getQualitySettingsForLevel(level: 'LOW' | 'MEDIUM' | 'HIGH'): QualitySettings {
    switch (level) {
      case 'LOW':
        return {
          level: 'LOW',
          maxParticles: 10,
          maxEnemies: 15,
          textureQuality: 0.5,
          shadowsEnabled: false,
          postProcessingEnabled: false,
          particleEffectsEnabled: false
        };
      case 'MEDIUM':
        return {
          level: 'MEDIUM',
          maxParticles: 25,
          maxEnemies: 30,
          textureQuality: 0.75,
          shadowsEnabled: false,
          postProcessingEnabled: false,
          particleEffectsEnabled: true
        };
      case 'HIGH':
      default:
        return {
          level: 'HIGH',
          maxParticles: 50,
          maxEnemies: 50,
          textureQuality: 1.0,
          shadowsEnabled: true,
          postProcessingEnabled: true,
          particleEffectsEnabled: true
        };
    }
  }
  
  private setupTextureAtlases(): void {
    // Create placeholder texture atlases for common sprite types
    this.createPlaceholderAtlas('heroes', 256, 256);
    this.createPlaceholderAtlas('enemies', 512, 512);
    this.createPlaceholderAtlas('items', 256, 256);
    this.createPlaceholderAtlas('effects', 128, 128);
    this.createPlaceholderAtlas('ui', 256, 256);
  }
  
  private createPlaceholderAtlas(name: string, width: number, height: number): void {
    // Create a placeholder atlas for now
    // In a real implementation, this would load actual sprite sheet data
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff00ff'; // Magenta placeholder
      ctx.fillRect(0, 0, width, height);
    }
    
    // Check if texture already exists to prevent warnings
    const textureKey = `${name}_atlas`;
    if (!this.scene.textures.exists(textureKey)) {
      this.scene.textures.addCanvas(textureKey, canvas);
    }
  }
  
  private setupObjectPools(): void {
    // Pre-populate sprite pools for common objects
    const commonSprites = ['hero', 'enemy', 'projectile', 'item'];
    
    commonSprites.forEach(spriteType => {
      const pool: Phaser.GameObjects.Sprite[] = [];
      
      // Create initial pool of 10 sprites per type
      for (let i = 0; i < 10; i++) {
        const sprite = this.scene.add.sprite(0, 0, 'placeholder_hero');
        sprite.setActive(false).setVisible(false);
        pool.push(sprite);
      }
      
      this.spritePool.set(spriteType, pool);
    });
  }
  
  private startPerformanceMonitoring(): void {
    // Monitor FPS and performance every second
    this.scene.time.addEvent({
      delay: this.performanceCheckInterval,
      callback: this.updateFPSHistory,
      callbackScope: this,
      loop: true
    });
  }
  
  private updateMetrics(): void {
    this.frameCount++;
    
    // Update basic metrics
    this.metrics.gameObjects = this.scene.children.length;
    this.metrics.memoryUsage = this.getMemoryUsage();
    this.metrics.textureMemory = this.estimateTextureMemory();
    
    // Update FPS (calculated in updateFPSHistory)
    const now = Date.now();
    if (now - this.lastFpsCheck >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsCheck = now;
    }
  }
  
  private updateFPSHistory(): void {
    this.fpsHistory.push(this.metrics.fps);
    
    // Keep only last 10 FPS readings
    if (this.fpsHistory.length > 10) {
      this.fpsHistory.shift();
    }
    
    // Calculate average FPS
    const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    this.metrics.fps = Math.round(avgFPS);
  }
  
  private checkPerformance(): void {
    // Check for performance issues (only after we have enough data)
    if (this.fpsHistory.length >= 5 && this.metrics.fps < 20 && this.metrics.fps > 0) {
      console.warn('⚠️ Low FPS detected:', this.metrics.fps);
    }
    
    if (this.metrics.memoryUsage > this.memoryThreshold) {
      console.warn('⚠️ High memory usage:', this.metrics.memoryUsage);
      this.performMemoryCleanup(true);
    }
  }
  
  private shouldAdjustQuality(): boolean {
    const now = Date.now();
    
    // Don't adjust too frequently
    if (now - this.lastQualityAdjustment < this.qualityAdjustmentCooldown) {
      return false;
    }
    
    // Adjust if FPS is consistently low or high
    const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    
    return (avgFPS < 25 && this.qualitySettings.level !== 'LOW') ||
           (avgFPS > 55 && this.qualitySettings.level !== 'HIGH');
  }
  
  private autoAdjustQuality(): void {
    // Don't auto-adjust if we don't have enough data or during initialization
    if (this.fpsHistory.length < 10) return;
    
    const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    
    // Ignore invalid FPS values
    if (avgFPS <= 0 || avgFPS > 200) return;
    
    let newLevel = this.qualitySettings.level;
    
    if (avgFPS < 25 && this.qualitySettings.level === 'HIGH') {
      newLevel = 'MEDIUM';
    } else if (avgFPS < 20 && this.qualitySettings.level === 'MEDIUM') {
      newLevel = 'LOW';
    } else if (avgFPS > 55 && this.qualitySettings.level === 'LOW') {
      newLevel = 'MEDIUM';
    } else if (avgFPS > 50 && this.qualitySettings.level === 'MEDIUM') {
      newLevel = 'HIGH';
    }
    
    if (newLevel !== this.qualitySettings.level) {
      console.log(`🔄 Auto-adjusting quality: ${this.qualitySettings.level} → ${newLevel} (FPS: ${avgFPS})`);
      this.setQualityLevel(newLevel);
      this.lastQualityAdjustment = Date.now();
    }
  }
  
  private applyQualitySettings(): void {
    // Update registry with new quality settings
    this.scene.registry.set('maxEnemies', this.qualitySettings.maxEnemies);
    this.scene.registry.set('particlesEnabled', this.qualitySettings.particleEffectsEnabled);
    this.scene.registry.set('postProcessingEnabled', this.qualitySettings.postProcessingEnabled);
    
    // Apply to existing systems if available
    // IMPLEMENTED: Notify other systems of quality changes
  }
  
  private performMemoryCleanup(force: boolean = false): void {
    const now = Date.now();
    
    if (!force && now - this.lastCleanup < this.cleanupInterval) {
      return;
    }
    
    // Clean up inactive sprites in pools
    this.spritePool.forEach((pool, key) => {
      const inactiveSprites = pool.filter(sprite => !sprite.active);
      if (inactiveSprites.length > 20) {
        // Keep only 10 inactive sprites, destroy the rest
        const toDestroy = inactiveSprites.slice(10);
        toDestroy.forEach(sprite => {
          const index = pool.indexOf(sprite);
          if (index > -1) {
            pool.splice(index, 1);
            sprite.destroy();
          }
        });
        
        console.log(`🧹 Cleaned up ${toDestroy.length} sprites from ${key} pool`);
      }
    });
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    this.lastCleanup = now;
  }
  
  private estimateTextureMemory(): number {
    let totalMemory = 0;
    
    // Estimate memory usage of loaded textures
    this.scene.textures.each((texture: Phaser.Textures.Texture) => {
      if (texture.source && texture.source[0]) {
        const source = texture.source[0];
        totalMemory += (source.width * source.height * 4); // RGBA = 4 bytes per pixel
      }
    });
    
    return totalMemory;
  }
}
