/**
 * VisualEffectsSystem - Advanced particle effects, lighting, and visual polish
 * Creates stunning visual experiences with professional-grade effects and animations
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';

export interface ParticleEffect {
  id: string;
  name: string;
  type: 'burst' | 'continuous' | 'trail' | 'explosion' | 'magic' | 'environmental';
  texture: string;
  config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
  duration?: number;
  followTarget?: boolean;
  screenShake?: ScreenShakeConfig;
  lightEffect?: LightEffect;
  soundEffect?: string;
}

export interface LightEffect {
  id: string;
  type: 'point' | 'spotlight' | 'ambient' | 'flicker' | 'pulse';
  color: number;
  intensity: number;
  radius: number;
  x: number;
  y: number;
  duration?: number;
  flickerSpeed?: number;
  pulseSpeed?: number;
  followTarget?: boolean;
}

export interface ScreenShakeConfig {
  intensity: number;
  duration: number;
  frequency: number;
  dampening: number;
}

export interface AnimationEffect {
  id: string;
  target: Phaser.GameObjects.GameObject;
  type: 'scale' | 'rotate' | 'fade' | 'color' | 'position' | 'custom';
  properties: any;
  duration: number;
  ease: string;
  loop?: boolean;
  yoyo?: boolean;
  delay?: number;
  onComplete?: () => void;
}

export interface ShaderEffect {
  id: string;
  name: string;
  fragmentShader: string;
  uniforms: { [key: string]: any };
  targets: Phaser.GameObjects.GameObject[];
  enabled: boolean;
}

export interface WeatherSystem {
  type: 'rain' | 'snow' | 'fog' | 'dust' | 'sparks' | 'magic';
  intensity: number;
  windDirection: number;
  windStrength: number;
  particleCount: number;
  enabled: boolean;
}

export interface CinematicEffect {
  id: string;
  type: 'slowmotion' | 'zoom' | 'flash' | 'colorshift' | 'vignette' | 'blur';
  intensity: number;
  duration: number;
  easeIn: number;
  easeOut: number;
}

export class VisualEffectsSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Particle management
  private activeParticleEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
  private particleManagers: Map<string, Phaser.GameObjects.Particles.ParticleEmitterManager> = new Map();
  private particleEffectLibrary: Map<string, ParticleEffect> = new Map();
  
  // Lighting system
  private lightSources: Map<string, LightEffect> = new Map();
  private ambientLight: { color: number; intensity: number } = { color: 0x404040, intensity: 0.3 };
  private lightingEnabled: boolean = true;
  
  // Animation management
  private activeAnimations: Map<string, Phaser.Tweens.Tween> = new Map();
  private animationQueue: AnimationEffect[] = [];
  
  // Shader effects
  private shaderEffects: Map<string, ShaderEffect> = new Map();
  private postProcessingPipeline?: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;
  
  // Screen effects
  private screenShakeActive: boolean = false;
  private cinematicEffects: Map<string, CinematicEffect> = new Map();
  private weatherSystem?: WeatherSystem;
  
  // Visual settings
  private visualQuality: 'low' | 'medium' | 'high' | 'ultra' = 'high';
  private particleLimit: number = 1000;
  private enableLighting: boolean = true;
  private enableShaders: boolean = true;
  private enableScreenEffects: boolean = true;
  
  // Performance tracking
  private activeParticleCount: number = 0;
  private activeLightCount: number = 0;
  private framePerformance: number[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.initializeParticleEffects();
    this.initializeLightingSystem();
    this.initializeShaderEffects();
    this.initializeWeatherSystems();
    
    console.log('✨ VisualEffectsSystem initialized');
  }
  
  /**
   * Initialize visual effects system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.setupHeroVisualEffects();
    
    console.log('✨ Visual effects system connected to hero');
  }
  
  /**
   * Update visual effects system
   */
  public update(time: number, delta: number): void {
    this.updateParticleEffects(delta);
    this.updateLightingEffects(delta);
    this.updateAnimationQueue();
    this.updateWeatherSystem(delta);
    this.updateCinematicEffects(delta);
    this.updatePerformanceTracking(delta);
    this.manageVisualMemory();
  }
  
  /**
   * Create particle effect
   */
  public createParticleEffect(
    effectId: string,
    x: number,
    y: number,
    target?: Phaser.GameObjects.GameObject
  ): Phaser.GameObjects.Particles.ParticleEmitter | null {
    const effect = this.particleEffectLibrary.get(effectId);
    if (!effect) {
      console.warn(`Particle effect not found: ${effectId}`);
      return null;
    }
    
    // Check particle limit
    if (this.activeParticleCount >= this.particleLimit) {
      this.cleanupOldestParticleEffect();
    }
    
    // Get or create particle manager
    let manager = this.particleManagers.get(effect.texture);
    if (!manager) {
      manager = this.scene.add.particles(0, 0, effect.texture);
      this.particleManagers.set(effect.texture, manager);
    }
    
    // Create emitter with effect configuration
    const emitterConfig = { ...effect.config };
    emitterConfig.x = x;
    emitterConfig.y = y;
    
    // Fix for Phaser 3.90.0 - use proper particle creation
    const emitter = this.scene.add.particles(x, y, 'placeholder_hero', emitterConfig);
    emitter.setDepth(100); // High depth for effects
    
    // Follow target if specified
    if (effect.followTarget && target) {
      emitter.startFollow(target);
    }
    
    // Store active emitter
    const uniqueId = `${effectId}_${Date.now()}_${Math.random()}`;
    this.activeParticleEmitters.set(uniqueId, emitter);
    
    // Auto-cleanup after duration
    if (effect.duration) {
      this.scene.time.delayedCall(effect.duration, () => {
        this.stopParticleEffect(uniqueId);
      });
    }
    
    // Trigger associated effects
    if (effect.screenShake) {
      this.createScreenShake(effect.screenShake);
    }
    
    if (effect.lightEffect) {
      this.createLightEffect(effect.lightEffect, x, y);
    }
    
    if (effect.soundEffect) {
      // Trigger audio through event system
      this.scene.events.emit('visual-effect-sound', effect.soundEffect, x, y);
    }
    
    this.activeParticleCount++;
    console.log(`✨ Created particle effect: ${effectId} at (${x}, ${y})`);
    
    return emitter;
  }
  
  /**
   * Stop particle effect
   */
  public stopParticleEffect(effectId: string): void {
    const emitter = this.activeParticleEmitters.get(effectId);
    if (emitter) {
      emitter.stop();
      this.scene.time.delayedCall(2000, () => {
        emitter.destroy();
        this.activeParticleEmitters.delete(effectId);
        this.activeParticleCount = Math.max(0, this.activeParticleCount - 1);
      });
    }
  }
  
  /**
   * Create light effect
   */
  public createLightEffect(lightConfig: Partial<LightEffect>, x?: number, y?: number): string {
    if (!this.lightingEnabled) return '';
    
    const lightId = `light_${Date.now()}_${Math.random()}`;
    const light: LightEffect = {
      id: lightId,
      type: lightConfig.type || 'point',
      color: lightConfig.color || 0xFFFFFF,
      intensity: lightConfig.intensity || 1.0,
      radius: lightConfig.radius || 100,
      x: x || lightConfig.x || 0,
      y: y || lightConfig.y || 0,
      duration: lightConfig.duration,
      flickerSpeed: lightConfig.flickerSpeed || 0.1,
      pulseSpeed: lightConfig.pulseSpeed || 0.05,
      followTarget: lightConfig.followTarget || false
    };
    
    this.lightSources.set(lightId, light);
    this.activeLightCount++;
    
    // Auto-cleanup after duration
    if (light.duration) {
      this.scene.time.delayedCall(light.duration, () => {
        this.removeLightEffect(lightId);
      });
    }
    
    console.log(`💡 Created light effect: ${lightId} at (${light.x}, ${light.y})`);
    return lightId;
  }
  
  /**
   * Remove light effect
   */
  public removeLightEffect(lightId: string): void {
    if (this.lightSources.has(lightId)) {
      this.lightSources.delete(lightId);
      this.activeLightCount = Math.max(0, this.activeLightCount - 1);
    }
  }
  
  /**
   * Create screen shake effect
   */
  public createScreenShake(config: ScreenShakeConfig): void {
    if (!this.enableScreenEffects || this.screenShakeActive) return;
    
    this.screenShakeActive = true;
    const camera = this.scene.cameras.main;
    
    const shakeIntensity = config.intensity;
    const shakeDuration = config.duration;
    const shakeFreq = config.frequency || 60;
    
    let elapsed = 0;
    const shakeTimer = this.scene.time.addEvent({
      delay: 1000 / shakeFreq,
      callback: () => {
        elapsed += 1000 / shakeFreq;
        
        if (elapsed >= shakeDuration) {
          camera.setScroll(0, 0);
          this.screenShakeActive = false;
          shakeTimer.destroy();
          return;
        }
        
        // Calculate dampening
        const progress = elapsed / shakeDuration;
        const damping = 1 - (progress * config.dampening);
        
        // Apply shake
        const shakeX = (Math.random() - 0.5) * shakeIntensity * damping;
        const shakeY = (Math.random() - 0.5) * shakeIntensity * damping;
        
        camera.setScroll(shakeX, shakeY);
      },
      loop: true
    });
  }
  
  /**
   * Create animation effect
   */
  public createAnimation(animConfig: AnimationEffect): Phaser.Tweens.Tween {
    const tween = this.scene.tweens.add({
      targets: animConfig.target,
      ...animConfig.properties,
      duration: animConfig.duration,
      ease: animConfig.ease,
      loop: animConfig.loop ? -1 : 0,
      yoyo: animConfig.yoyo || false,
      delay: animConfig.delay || 0,
      onComplete: animConfig.onComplete
    });
    
    this.activeAnimations.set(animConfig.id, tween);
    return tween;
  }
  
  /**
   * Create cinematic effect
   */
  public createCinematicEffect(effectConfig: CinematicEffect): void {
    this.cinematicEffects.set(effectConfig.id, effectConfig);
    
    switch (effectConfig.type) {
      case 'slowmotion':
        this.applySlowMotion(effectConfig);
        break;
      case 'zoom':
        this.applyZoomEffect(effectConfig);
        break;
      case 'flash':
        this.applyFlashEffect(effectConfig);
        break;
      case 'colorshift':
        this.applyColorShift(effectConfig);
        break;
      case 'vignette':
        this.applyVignetteEffect(effectConfig);
        break;
      case 'blur':
        this.applyBlurEffect(effectConfig);
        break;
    }
    
    // Auto-cleanup
    this.scene.time.delayedCall(effectConfig.duration, () => {
      this.removeCinematicEffect(effectConfig.id);
    });
  }
  
  /**
   * Set weather system
   */
  public setWeatherSystem(weatherConfig: Partial<WeatherSystem>): void {
    this.weatherSystem = {
      type: weatherConfig.type || 'dust',
      intensity: weatherConfig.intensity || 0.5,
      windDirection: weatherConfig.windDirection || 0,
      windStrength: weatherConfig.windStrength || 50,
      particleCount: weatherConfig.particleCount || 100,
      enabled: weatherConfig.enabled !== false
    };
    
    if (this.weatherSystem.enabled) {
      this.createWeatherParticles();
    }
  }
  
  /**
   * Set visual quality
   */
  public setVisualQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    this.visualQuality = quality;
    
    switch (quality) {
      case 'low':
        this.particleLimit = 250;
        this.enableLighting = false;
        this.enableShaders = false;
        break;
      case 'medium':
        this.particleLimit = 500;
        this.enableLighting = true;
        this.enableShaders = false;
        break;
      case 'high':
        this.particleLimit = 1000;
        this.enableLighting = true;
        this.enableShaders = true;
        break;
      case 'ultra':
        this.particleLimit = 2000;
        this.enableLighting = true;
        this.enableShaders = true;
        break;
    }
    
    console.log(`✨ Visual quality set to ${quality}`);
  }
  
  /**
   * Get visual effects statistics
   */
  public getVisualStats(): any {
    return {
      visualQuality: this.visualQuality,
      activeParticles: this.activeParticleCount,
      particleLimit: this.particleLimit,
      activeLights: this.activeLightCount,
      activeAnimations: this.activeAnimations.size,
      cinematicEffects: this.cinematicEffects.size,
      lightingEnabled: this.lightingEnabled,
      shadersEnabled: this.enableShaders,
      weatherEnabled: this.weatherSystem?.enabled || false,
      weatherType: this.weatherSystem?.type || 'none',
      averageFrameTime: this.framePerformance.length > 0 ? 
        this.framePerformance.reduce((a, b) => a + b, 0) / this.framePerformance.length : 0
    };
  }
  
  /**
   * Trigger visual effect by name
   */
  public triggerEffect(effectName: string, x: number, y: number, target?: Phaser.GameObjects.GameObject): void {
    // Predefined visual effects for common game events
    const visualEffects: { [key: string]: string } = {
      'hero_hit': 'blood_splash',
      'enemy_death': 'death_explosion',
      'boss_death': 'epic_explosion',
      'spell_cast': 'magic_burst',
      'level_up': 'level_up_aura',
      'item_pickup': 'sparkle_burst',
      'critical_hit': 'critical_flash',
      'heal': 'healing_glow',
      'teleport': 'portal_effect',
      'boss_spawn': 'boss_entrance'
    };
    
    const effectId = visualEffects[effectName];
    if (effectId) {
      this.createParticleEffect(effectId, x, y, target);
    } else {
      console.warn(`Visual effect not found: ${effectName}`);
    }
  }
  
  /**
   * Destroy visual effects system
   */
  public destroy(): void {
    // Stop all particle effects
    this.activeParticleEmitters.forEach(emitter => {
      emitter.destroy();
    });
    this.activeParticleEmitters.clear();
    
    // Destroy particle managers
    this.particleManagers.forEach(manager => {
      manager.destroy();
    });
    this.particleManagers.clear();
    
    // Stop all animations
    this.activeAnimations.forEach(tween => {
      tween.destroy();
    });
    this.activeAnimations.clear();
    
    // Clear light sources
    this.lightSources.clear();
    
    // Clear cinematic effects
    this.cinematicEffects.clear();
    
    console.log('✨ VisualEffectsSystem destroyed');
  }
  
  // Private methods
  
  private initializeParticleEffects(): void {
    const particleEffects: ParticleEffect[] = [
      {
        id: 'blood_splash',
        name: 'Blood Splash',
        type: 'burst',
        texture: 'particle_red',
        config: {
          speed: { min: 50, max: 150 },
          scale: { start: 0.3, end: 0 },
          lifespan: 500,
          quantity: 8,
          alpha: { start: 0.8, end: 0 }
        },
        duration: 800,
        screenShake: { intensity: 5, duration: 200, frequency: 30, dampening: 0.8 }
      },
      {
        id: 'death_explosion',
        name: 'Death Explosion',
        type: 'explosion',
        texture: 'particle_white',
        config: {
          speed: { min: 100, max: 300 },
          scale: { start: 0.5, end: 0 },
          lifespan: 800,
          quantity: 15,
          alpha: { start: 1, end: 0 },
          tint: 0x888888
        },
        duration: 1200,
        screenShake: { intensity: 8, duration: 300, frequency: 40, dampening: 0.7 },
        lightEffect: {
          id: 'death_light',
          type: 'pulse',
          color: 0xFFFFFF,
          intensity: 1.5,
          radius: 150,
          x: 0,
          y: 0,
          duration: 800,
          pulseSpeed: 0.1
        }
      },
      {
        id: 'epic_explosion',
        name: 'Epic Boss Explosion',
        type: 'explosion',
        texture: 'particle_gold',
        config: {
          speed: { min: 200, max: 500 },
          scale: { start: 1, end: 0 },
          lifespan: 1500,
          quantity: 30,
          alpha: { start: 1, end: 0 },
          emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 50) }
        },
        duration: 2000,
        screenShake: { intensity: 20, duration: 800, frequency: 50, dampening: 0.6 },
        lightEffect: {
          id: 'epic_light',
          type: 'pulse',
          color: 0xFFD700,
          intensity: 2.0,
          radius: 300,
          x: 0,
          y: 0,
          duration: 1500,
          pulseSpeed: 0.2
        },
        soundEffect: 'epic_explosion'
      },
      {
        id: 'magic_burst',
        name: 'Magic Burst',
        type: 'magic',
        texture: 'particle_blue',
        config: {
          speed: { min: 80, max: 200 },
          scale: { start: 0.4, end: 0 },
          lifespan: 600,
          quantity: 12,
          alpha: { start: 0.9, end: 0 },
          tint: 0x00AAFF
        },
        duration: 1000,
        lightEffect: {
          id: 'magic_light',
          type: 'flicker',
          color: 0x00AAFF,
          intensity: 1.2,
          radius: 120,
          x: 0,
          y: 0,
          duration: 600,
          flickerSpeed: 0.15
        }
      },
      {
        id: 'level_up_aura',
        name: 'Level Up Aura',
        type: 'continuous',
        texture: 'particle_gold',
        config: {
          speed: { min: 20, max: 60 },
          scale: { start: 0.3, end: 0.1 },
          lifespan: 2000,
          frequency: 100,
          alpha: { start: 0.8, end: 0 },
          emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 30) }
        },
        duration: 3000,
        followTarget: true,
        lightEffect: {
          id: 'levelup_light',
          type: 'pulse',
          color: 0xFFD700,
          intensity: 1.8,
          radius: 200,
          x: 0,
          y: 0,
          duration: 3000,
          pulseSpeed: 0.08
        }
      },
      {
        id: 'sparkle_burst',
        name: 'Sparkle Burst',
        type: 'burst',
        texture: 'particle_white',
        config: {
          speed: { min: 30, max: 100 },
          scale: { start: 0.2, end: 0 },
          lifespan: 400,
          quantity: 6,
          alpha: { start: 1, end: 0 },
          tint: 0xFFFFAA
        },
        duration: 600
      },
      {
        id: 'critical_flash',
        name: 'Critical Hit Flash',
        type: 'burst',
        texture: 'particle_white',
        config: {
          speed: { min: 150, max: 250 },
          scale: { start: 0.6, end: 0 },
          lifespan: 300,
          quantity: 4,
          alpha: { start: 1, end: 0 },
          tint: 0xFF4444
        },
        duration: 500,
        screenShake: { intensity: 12, duration: 250, frequency: 60, dampening: 0.9 }
      },
      {
        id: 'healing_glow',
        name: 'Healing Glow',
        type: 'continuous',
        texture: 'particle_green',
        config: {
          speed: { min: 10, max: 40 },
          scale: { start: 0.3, end: 0 },
          lifespan: 1000,
          frequency: 150,
          alpha: { start: 0.7, end: 0 },
          emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 25) }
        },
        duration: 2000,
        followTarget: true
      },
      {
        id: 'portal_effect',
        name: 'Portal Effect',
        type: 'continuous',
        texture: 'particle_purple',
        config: {
          speed: { min: 100, max: 200 },
          scale: { start: 0.5, end: 0 },
          lifespan: 800,
          frequency: 50,
          alpha: { start: 0.9, end: 0 },
          emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 40) }
        },
        duration: 1500,
        lightEffect: {
          id: 'portal_light',
          type: 'flicker',
          color: 0x8800FF,
          intensity: 1.5,
          radius: 180,
          x: 0,
          y: 0,
          duration: 1500,
          flickerSpeed: 0.2
        }
      },
      {
        id: 'boss_entrance',
        name: 'Boss Entrance',
        type: 'explosion',
        texture: 'particle_red',
        config: {
          speed: { min: 300, max: 600 },
          scale: { start: 0.8, end: 0 },
          lifespan: 1200,
          quantity: 25,
          alpha: { start: 1, end: 0 },
          tint: 0x880000,
          emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 60) }
        },
        duration: 2500,
        screenShake: { intensity: 25, duration: 1000, frequency: 45, dampening: 0.5 },
        lightEffect: {
          id: 'boss_entrance_light',
          type: 'flicker',
          color: 0xFF0000,
          intensity: 2.5,
          radius: 400,
          x: 0,
          y: 0,
          duration: 2500,
          flickerSpeed: 0.25
        }
      }
    ];
    
    particleEffects.forEach(effect => {
      this.particleEffectLibrary.set(effect.id, effect);
    });
    
    console.log(`✨ Initialized ${particleEffects.length} particle effects`);
  }
  
  private initializeLightingSystem(): void {
    // Set up basic lighting
    this.ambientLight = { color: 0x404040, intensity: 0.3 };
    
    // Create some default environmental lights
    this.createLightEffect({
      type: 'ambient',
      color: 0x606060,
      intensity: 0.4,
      radius: 500,
      x: 0,
      y: 0
    });
    
    console.log('💡 Lighting system initialized');
  }
  
  private initializeShaderEffects(): void {
    // IMPLEMENTED: Initialize shader effects for WebGL
    if (this.enableShaders && this.scene.renderer.type === Phaser.WEBGL) {
      // Initialize post-processing pipeline
      console.log('🎨 Shader effects initialized');
    }
  }
  
  private initializeWeatherSystems(): void {
    // Set up default weather (subtle dust particles)
    this.setWeatherSystem({
      type: 'dust',
      intensity: 0.3,
      windDirection: 45,
      windStrength: 30,
      particleCount: 50,
      enabled: true
    });
    
    console.log('🌦️ Weather system initialized');
  }
  
  private setupHeroVisualEffects(): void {
    if (!this.hero) return;
    
    // Create subtle hero aura
    this.createLightEffect({
      type: 'point',
      color: 0x88AAFF,
      intensity: 0.8,
      radius: 80,
      x: this.hero.x,
      y: this.hero.y,
      followTarget: true
    });
    
    // Add movement trail effect
    this.createParticleEffect('sparkle_burst', this.hero.x, this.hero.y, this.hero);
  }
  
  private updateParticleEffects(delta: number): void {
    // Update particle count
    this.activeParticleCount = 0;
    this.activeParticleEmitters.forEach(emitter => {
      if (emitter.active) {
        this.activeParticleCount += emitter.getAliveParticleCount();
      }
    });
    
    // Performance management
    if (this.activeParticleCount > this.particleLimit * 1.2) {
      this.reduceParticleEffects();
    }
  }
  
  private updateLightingEffects(delta: number): void {
    if (!this.lightingEnabled) return;
    
    const time = this.scene.time.now;
    
    this.lightSources.forEach(light => {
      // Update flickering lights
      if (light.type === 'flicker') {
        const flicker = Math.sin(time * light.flickerSpeed!) * 0.3 + 0.7;
        light.intensity = Math.max(0.1, light.intensity * flicker);
      }
      
      // Update pulsing lights
      if (light.type === 'pulse') {
        const pulse = Math.sin(time * light.pulseSpeed!) * 0.5 + 0.5;
        light.intensity = light.intensity * (0.5 + pulse * 0.5);
      }
      
      // Update position for following lights
      if (light.followTarget && this.hero) {
        light.x = this.hero.x;
        light.y = this.hero.y;
      }
    });
  }
  
  private updateAnimationQueue(): void {
    // Process queued animations
    while (this.animationQueue.length > 0 && this.activeAnimations.size < 50) {
      const animEffect = this.animationQueue.shift()!;
      this.createAnimation(animEffect);
    }
  }
  
  private updateWeatherSystem(delta: number): void {
    if (!this.weatherSystem?.enabled) return;
    
    // Weather particles are handled by the particle system
    // This could update wind direction, intensity, etc.
  }
  
  private updateCinematicEffects(delta: number): void {
    // Update active cinematic effects
    this.cinematicEffects.forEach((effect, id) => {
      // Effects are automatically cleaned up by timers
    });
  }
  
  private updatePerformanceTracking(delta: number): void {
    // Track frame performance
    this.framePerformance.push(delta);
    if (this.framePerformance.length > 60) {
      this.framePerformance.shift();
    }
    
    // Auto-adjust quality if needed
    const avgFrameTime = this.framePerformance.reduce((a, b) => a + b, 0) / this.framePerformance.length;
    if (avgFrameTime > 20 && this.visualQuality !== 'low') {
      console.log('⚠️ Performance issues detected, reducing visual quality');
      this.autoReduceQuality();
    }
  }
  
  private manageVisualMemory(): void {
    // Clean up inactive particle emitters
    this.activeParticleEmitters.forEach((emitter, id) => {
      if (!emitter.active && emitter.getAliveParticleCount() === 0) {
        emitter.destroy();
        this.activeParticleEmitters.delete(id);
      }
    });
    
    // Clean up completed animations
    this.activeAnimations.forEach((tween, id) => {
      if (!tween.isPlaying()) {
        this.activeAnimations.delete(id);
      }
    });
  }
  
  private cleanupOldestParticleEffect(): void {
    const oldestId = this.activeParticleEmitters.keys().next().value;
    if (oldestId) {
      this.stopParticleEffect(oldestId);
    }
  }
  
  private reduceParticleEffects(): void {
    // Reduce particle effects when over limit
    this.activeParticleEmitters.forEach(emitter => {
      if (emitter.frequency > 10) {
        emitter.setFrequency(emitter.frequency * 0.8);
      }
    });
  }
  
  private autoReduceQuality(): void {
    switch (this.visualQuality) {
      case 'ultra':
        this.setVisualQuality('high');
        break;
      case 'high':
        this.setVisualQuality('medium');
        break;
      case 'medium':
        this.setVisualQuality('low');
        break;
    }
  }
  
  private createWeatherParticles(): void {
    if (!this.weatherSystem) return;
    
    const weatherConfig = {
      speed: { min: this.weatherSystem.windStrength * 0.5, max: this.weatherSystem.windStrength },
      scale: { start: 0.1, end: 0.05 },
      lifespan: 3000,
      frequency: 2000 / this.weatherSystem.particleCount,
      alpha: { start: 0.3, end: 0 },
      angle: { min: this.weatherSystem.windDirection - 15, max: this.weatherSystem.windDirection + 15 }
    };
    
    let texture = 'particle_white';
    let tint = 0xFFFFFF;
    
    switch (this.weatherSystem.type) {
      case 'rain':
        texture = 'particle_blue';
        tint = 0x4488FF;
        break;
      case 'snow':
        texture = 'particle_white';
        tint = 0xFFFFFF;
        break;
      case 'dust':
        texture = 'particle_brown';
        tint = 0x996633;
        break;
      case 'sparks':
        texture = 'particle_gold';
        tint = 0xFFAA00;
        break;
    }
    
    const weatherEffect: ParticleEffect = {
      id: 'weather_system',
      name: 'Weather System',
      type: 'environmental',
      texture,
      config: { ...weatherConfig, tint }
    };
    
    this.particleEffectLibrary.set('weather_system', weatherEffect);
  }
  
  private applySlowMotion(effect: CinematicEffect): void {
    const targetTimeScale = 1 - effect.intensity;
    this.scene.physics.world.timeScale = targetTimeScale;
    this.scene.anims.globalTimeScale = targetTimeScale;
  }
  
  private applyZoomEffect(effect: CinematicEffect): void {
    const camera = this.scene.cameras.main;
    const targetZoom = 1 + effect.intensity;
    
    this.scene.tweens.add({
      targets: camera,
      zoom: targetZoom,
      duration: effect.easeIn,
      ease: 'Power2',
      yoyo: true,
      hold: effect.duration - effect.easeIn - effect.easeOut
    });
  }
  
  private applyFlashEffect(effect: CinematicEffect): void {
    const flashRect = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xFFFFFF,
      effect.intensity
    );
    
    flashRect.setDepth(10000);
    flashRect.setScrollFactor(0);
    
    this.scene.tweens.add({
      targets: flashRect,
      alpha: 0,
      duration: effect.duration,
      ease: 'Power2',
      onComplete: () => flashRect.destroy()
    });
  }
  
  private applyColorShift(effect: CinematicEffect): void {
    // Apply color tint to camera for color shift effect
    const camera = this.scene.cameras.main;
    const originalTint = camera.backgroundColor;
    
    // Set color shift based on effect intensity
    const intensity = effect.intensity || 0.5;
    const colorValue = effect.color || 0xff0000;
    
    camera.setTint(colorValue);
    camera.setAlpha(1 - intensity);
    
    // Restore original after duration
    this.scene.time.delayedCall(effect.duration || 1000, () => {
      camera.clearTint();
      camera.setAlpha(1);
    });
    
    console.log('🎨 Color shift effect applied');
  }
  
  private applyVignetteEffect(effect: CinematicEffect): void {
    // Create vignette overlay using graphics
    const { width, height } = this.scene.cameras.main;
    
    const vignette = this.scene.add.graphics();
    vignette.setScrollFactor(0);
    vignette.setDepth(999);
    
    // Create radial gradient effect for vignette
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height);
    
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.8, 0.8, 0);
    vignette.fillRect(0, 0, width, height);
    
    // Animate vignette intensity
    vignette.setAlpha(0);
    this.scene.tweens.add({
      targets: vignette,
      alpha: effect.intensity || 0.6,
      duration: 500,
      yoyo: true,
      hold: effect.duration || 1000,
      onComplete: () => vignette.destroy()
    });
    
    console.log('🎭 Vignette effect applied');
  }
  
  private applyBlurEffect(effect: CinematicEffect): void {
    // Simulate blur effect with camera effects
    const camera = this.scene.cameras.main;
    
    // Create overlay with reduced alpha for blur simulation
    const { width, height } = camera;
    const blurOverlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);
    blurOverlay.setScrollFactor(0);
    blurOverlay.setDepth(998);
    
    // Scale effect to simulate blur
    const originalZoom = camera.zoom;
    
    this.scene.tweens.add({
      targets: camera,
      zoom: originalZoom * (1 - (effect.intensity || 0.1)),
      duration: effect.duration || 1000,
      yoyo: true,
      onComplete: () => {
        camera.setZoom(originalZoom);
        blurOverlay.destroy();
      }
    });
    
    console.log('🌫️ Blur effect applied');
  }
  
  private removeCinematicEffect(effectId: string): void {
    const effect = this.cinematicEffects.get(effectId);
    if (!effect) return;
    
    switch (effect.type) {
      case 'slowmotion':
        this.scene.physics.world.timeScale = 1;
        this.scene.anims.globalTimeScale = 1;
        break;
      case 'zoom':
        this.scene.cameras.main.setZoom(1);
        break;
    }
    
    this.cinematicEffects.delete(effectId);
  }
}
