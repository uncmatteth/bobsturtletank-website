/**
 * CleanBootScene - Industry-Standard Boot Scene
 * Initializes all core systems properly
 */

import Phaser from 'phaser';
import { Howl } from 'howler';
import * as Matter from 'matter-js';

export class CleanBootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CleanBootScene' });
  }
  
  create(): void {
    console.log('🚀 CleanBootScene: Industry-Standard Initialization');
    
    // Initialize Matter.js engine properly
    this.initializeMatterPhysics();
    
    // Initialize Howler audio system
    this.initializeHowlerAudio();
    
    // Setup responsive scaling
    this.initializeResponsiveScaling();
    
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    console.log('✅ CleanBootScene: All systems initialized');
    
    // Move to preload scene
    this.scene.start('CleanPreloadScene');
  }
  
  /**
   * Initialize Matter.js physics engine
   */
  private initializeMatterPhysics(): void {
    console.log('⚙️ Initializing Matter.js physics engine...');
    
    // Configure Matter.js engine settings
    const engine = this.matter.world.engine;
    
    // Optimize for performance
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;
    
    // Configure collision detection
    engine.broadphase.controller = Matter.Grid.create();
    engine.constraintIterations = 2;
    engine.positionIterations = 6;
    engine.velocityIterations = 4;
    
    // Enable sleeping for performance
    engine.enableSleeping = true;
    
    console.log('✅ Matter.js physics engine initialized');
  }
  
  /**
   * Initialize Howler.js spatial audio system
   */
  private initializeHowlerAudio(): void {
    console.log('🔊 Initializing Howler.js spatial audio...');
    
    // Configure Howler global settings
    Howler.volume(0.7);
    Howler.html5PoolSize = 10;
    
    // Enable spatial audio if supported
    if (Howler.ctx) {
      console.log('✅ Web Audio API supported - spatial audio enabled');
    } else {
      console.log('⚠️ Web Audio API not supported - using HTML5 audio');
    }
    
    // Store Howler reference for other scenes
    this.registry.set('howler', Howler);
    
    console.log('✅ Howler.js audio system initialized');
  }
  
  /**
   * Setup responsive scaling system
   */
  private initializeResponsiveScaling(): void {
    console.log('📱 Setting up responsive scaling...');
    
    // Configure scale manager for different devices
    this.scale.on('resize', this.handleResize, this);
    
    // Initial resize
    this.handleResize();
    
    console.log('✅ Responsive scaling initialized');
  }
  
  /**
   * Handle screen resize events
   */
  private handleResize(): void {
    const { width, height } = this.scale.gameSize;
    
    // Determine device type
    const isMobile = width < 768;
    const deviceType = isMobile ? 'Mobile' : 'Desktop';
    
    console.log(`📱 Screen: ${width}x${height} (${deviceType})`);
    
    // Store device info for other scenes
    this.registry.set('deviceInfo', {
      width,
      height,
      isMobile,
      deviceType,
      aspectRatio: width / height
    });
  }
  
  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    console.log('📊 Initializing performance monitoring...');
    
    // Track FPS and performance metrics
    let frameCount = 0;
    let lastTime = performance.now();
    
    const performanceTracker = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        
        // Store performance data
        this.registry.set('performance', {
          fps,
          timestamp: currentTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(performanceTracker);
    };
    
    performanceTracker();
    console.log('✅ Performance monitoring initialized');
  }
}
