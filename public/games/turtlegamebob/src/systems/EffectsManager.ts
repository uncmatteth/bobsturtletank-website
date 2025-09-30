/**
 * EffectsManager - Handles visual effects and animations
 * Integrates PixelLab generated effect assets with the game
 */

import Phaser from 'phaser';
import { CharacterManager } from './CharacterManager';

export interface EffectConfig {
  key: string;
  name: string;
  duration: number;
  scale: number;
  tint?: number;
  alpha?: number;
  blendMode?: Phaser.BlendModes;
  particleCount?: number;
  particleSpeed?: number;
  particleLifespan?: number;
  particleScale?: number;
  particleAlpha?: number;
  particleTint?: number;
  particleBlendMode?: Phaser.BlendModes;
  sound?: string;
  soundVolume?: number;
}

export class EffectsManager {
  private scene: Phaser.Scene;
  private characterManager: CharacterManager;
  private effectConfigs: Map<string, EffectConfig> = new Map();
  private activeEffects: Phaser.GameObjects.Sprite[] = [];
  private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  
  constructor(scene: Phaser.Scene, characterManager: CharacterManager) {
    this.scene = scene;
    this.characterManager = characterManager;
    
    console.log('✨ EffectsManager initialized');
    
    // Register effect configs
    this.registerEffectConfigs();
  }
  
  /**
   * Register effect configurations
   */
  private registerEffectConfigs(): void {
    // Magic Spell Effect
    this.effectConfigs.set('magic_spell', {
      key: 'magic_spell',
      name: 'Magic Spell',
      duration: 500,
      scale: 2,
      tint: 0x00FFFF,
      alpha: 0.8,
      blendMode: Phaser.BlendModes.ADD,
      particleCount: 20,
      particleSpeed: 100,
      particleLifespan: 500,
      particleScale: 0.5,
      particleAlpha: 0.7,
      particleTint: 0x00FFFF,
      particleBlendMode: Phaser.BlendModes.ADD,
      sound: 'magic_spell',
      soundVolume: 0.5
    });
    
    // Fire Effect
    this.effectConfigs.set('fire', {
      key: 'magic_spell', // Reuse magic spell sprite
      name: 'Fire',
      duration: 800,
      scale: 1.5,
      tint: 0xFF4500,
      alpha: 0.9,
      blendMode: Phaser.BlendModes.ADD,
      particleCount: 30,
      particleSpeed: 80,
      particleLifespan: 800,
      particleScale: 0.4,
      particleAlpha: 0.8,
      particleTint: 0xFF4500,
      particleBlendMode: Phaser.BlendModes.ADD,
      sound: 'fire',
      soundVolume: 0.6
    });
    
    // Ice Effect
    this.effectConfigs.set('ice', {
      key: 'magic_spell', // Reuse magic spell sprite
      name: 'Ice',
      duration: 600,
      scale: 1.3,
      tint: 0xADD8E6,
      alpha: 0.7,
      blendMode: Phaser.BlendModes.SCREEN,
      particleCount: 15,
      particleSpeed: 50,
      particleLifespan: 1000,
      particleScale: 0.3,
      particleAlpha: 0.6,
      particleTint: 0xADD8E6,
      particleBlendMode: Phaser.BlendModes.SCREEN,
      sound: 'ice',
      soundVolume: 0.4
    });
    
    // Lightning Effect
    this.effectConfigs.set('lightning', {
      key: 'magic_spell', // Reuse magic spell sprite
      name: 'Lightning',
      duration: 300,
      scale: 1.8,
      tint: 0xFFFF00,
      alpha: 1.0,
      blendMode: Phaser.BlendModes.ADD,
      particleCount: 10,
      particleSpeed: 200,
      particleLifespan: 300,
      particleScale: 0.6,
      particleAlpha: 1.0,
      particleTint: 0xFFFF00,
      particleBlendMode: Phaser.BlendModes.ADD,
      sound: 'lightning',
      soundVolume: 0.7
    });
    
    // Healing Effect
    this.effectConfigs.set('healing', {
      key: 'magic_spell', // Reuse magic spell sprite
      name: 'Healing',
      duration: 1000,
      scale: 1.5,
      tint: 0x00FF00,
      alpha: 0.8,
      blendMode: Phaser.BlendModes.SCREEN,
      particleCount: 25,
      particleSpeed: 60,
      particleLifespan: 1200,
      particleScale: 0.4,
      particleAlpha: 0.7,
      particleTint: 0x00FF00,
      particleBlendMode: Phaser.BlendModes.SCREEN,
      sound: 'healing',
      soundVolume: 0.5
    });
  }
  
  /**
   * Play an effect at a specific position
   */
  public playEffect(
    x: number,
    y: number,
    effectType: string
  ): void {
    // Get effect config
    const config = this.effectConfigs.get(effectType);
    if (!config) {
      console.warn(`⚠️ Unknown effect type: ${effectType}`);
      return;
    }
    
    // Create effect sprite
    const effectSprite = this.characterManager.createSprite(x, y, config.key);
    
    if (effectSprite) {
      // Apply effect properties
      effectSprite.setScale(config.scale);
      if (config.tint !== undefined) effectSprite.setTint(config.tint);
      if (config.alpha !== undefined) effectSprite.setAlpha(config.alpha);
      if (config.blendMode !== undefined) effectSprite.setBlendMode(config.blendMode);
      
      // Add to active effects
      this.activeEffects.push(effectSprite);
      
      // Play animation
      this.scene.tweens.add({
        targets: effectSprite,
        scale: effectSprite.scale * 1.5,
        alpha: 0,
        duration: config.duration,
        onComplete: () => {
          // Remove from active effects
          const index = this.activeEffects.indexOf(effectSprite);
          if (index !== -1) {
            this.activeEffects.splice(index, 1);
          }
          
          // Destroy sprite
          effectSprite.destroy();
        }
      });
    } else {
      // Fallback to simple effect
      this.playFallbackEffect(x, y, config);
    }
    
    // Create particles
    if (config.particleCount && config.particleCount > 0) {
      this.createParticles(x, y, config);
    }
    
    // Play sound
    if (config.sound && this.scene.sound.get(config.sound)) {
      this.scene.sound.play(config.sound, {
        volume: config.soundVolume || 0.5
      });
    }
  }
  
  /**
   * Play a fallback effect when sprite is not available
   */
  private playFallbackEffect(
    x: number,
    y: number,
    config: EffectConfig
  ): void {
    // Create a simple circle effect
    const graphics = this.scene.add.graphics();
    
    // Set style
    graphics.fillStyle(config.tint || 0xFFFFFF, config.alpha || 0.8);
    
    // Draw circle
    graphics.fillCircle(0, 0, 20 * config.scale);
    
    // Position
    graphics.setPosition(x, y);
    
    // Set blend mode
    if (config.blendMode !== undefined) {
      graphics.setBlendMode(config.blendMode);
    }
    
    // Animate and destroy
    this.scene.tweens.add({
      targets: graphics,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: config.duration,
      onComplete: () => {
        graphics.destroy();
      }
    });
  }
  
  /**
   * Create particles for an effect
   */
  private createParticles(
    x: number,
    y: number,
    config: EffectConfig
  ): void {
    // Create particle manager if needed
    if (!this.scene.particles) {
      this.scene.particles = this.scene.add.particles(0, 0, 'fallback_effect', {});
    }
    
    // Create emitter
    const emitter = this.scene.add.particles(x, y, 'fallback_effect', {
      speed: config.particleSpeed || 100,
      scale: { start: config.particleScale || 0.5, end: 0 },
      alpha: { start: config.particleAlpha || 0.7, end: 0 },
      tint: config.particleTint || 0xFFFFFF,
      blendMode: config.particleBlendMode || Phaser.BlendModes.ADD,
      lifespan: config.particleLifespan || 500,
      quantity: config.particleCount || 20
    });
    
    // Add to active emitters
    this.particleEmitters.push(emitter);
    
    // Destroy after duration
    this.scene.time.delayedCall(config.duration, () => {
      // Remove from active emitters
      const index = this.particleEmitters.indexOf(emitter);
      if (index !== -1) {
        this.particleEmitters.splice(index, 1);
      }
      
      // Destroy emitter
      emitter.destroy();
    });
  }
  
  /**
   * Create a screen shake effect
   */
  public screenShake(
    intensity: number = 0.01,
    duration: number = 100
  ): void {
    this.scene.cameras.main.shake(duration, intensity);
  }
  
  /**
   * Create a screen flash effect
   */
  public screenFlash(
    color: number = 0xFFFFFF,
    duration: number = 100,
    alpha: number = 0.5
  ): void {
    this.scene.cameras.main.flash(duration, (color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF, alpha);
  }
  
  /**
   * Create a floating text effect
   */
  public createFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#FFFFFF',
    fontSize: string = '16px',
    duration: number = 1000
  ): void {
    // Create text
    const textObj = this.scene.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: fontSize,
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);
    
    // Animate text
    this.scene.tweens.add({
      targets: textObj,
      y: y - 50,
      alpha: 0,
      duration: duration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        textObj.destroy();
      }
    });
  }
  
  /**
   * Create a hit pause effect (game freeze)
   */
  public hitPause(duration: number = 100): void {
    this.scene.time.delayedCall(0, () => {
      this.scene.physics.pause();
      
      this.scene.time.delayedCall(duration, () => {
        this.scene.physics.resume();
      });
    });
  }
  
  /**
   * Update effects
   */
  public update(time: number, delta: number): void {
    // No update needed for current implementation
  }
  
  /**
   * Clear all effects
   */
  public clearEffects(): void {
    // Destroy all active effects
    for (const effect of this.activeEffects) {
      effect.destroy();
    }
    
    // Clear array
    this.activeEffects = [];
    
    // Destroy all particle emitters
    for (const emitter of this.particleEmitters) {
      emitter.destroy();
    }
    
    // Clear array
    this.particleEmitters = [];
  }
  
  /**
   * Destroy manager
   */
  public destroy(): void {
    this.clearEffects();
    console.log('✨ EffectsManager destroyed');
  }
}
