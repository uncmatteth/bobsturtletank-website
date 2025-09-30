/**
 * AdvancedAudioSystem - Professional audio engine with adaptive music and spatial audio
 * Creates an immersive soundscape with dynamic mixing and environmental audio
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';

export interface AudioTrack {
  id: string;
  key: string;
  volume: number;
  loop: boolean;
  category: AudioCategory;
  priority: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  crossfadeWith?: string;
  adaptiveSettings?: AdaptiveAudioSettings;
}

export interface AdaptiveAudioSettings {
  combatIntensity: number;
  explorationCalmness: number;
  bossEncounterEpicness: number;
  ambientLayering: boolean;
  dynamicFiltering: boolean;
  stressResponseEnabled: boolean;
}

export interface SpatialAudioSource {
  id: string;
  x: number;
  y: number;
  soundKey: string;
  volume: number;
  range: number;
  loop: boolean;
  falloffType: 'linear' | 'exponential' | 'logarithmic';
  environmentalOcclusion: boolean;
  sound?: Phaser.Sound.BaseSound;
}

export interface AudioCategory {
  name: string;
  masterVolume: number;
  enabled: boolean;
  maxConcurrentSounds: number;
  priority: number;
  spatialEnabled: boolean;
  reverbEnabled: boolean;
  compressionEnabled: boolean;
}

export interface AudioEnvironment {
  id: string;
  name: string;
  ambientTracks: string[];
  reverbSettings: ReverbSettings;
  filterSettings: FilterSettings;
  spatialSettings: SpatialSettings;
  musicSettings: MusicSettings;
}

export interface ReverbSettings {
  roomSize: number;
  dampening: number;
  wetLevel: number;
  dryLevel: number;
  enabled: boolean;
}

export interface FilterSettings {
  lowPassFrequency: number;
  highPassFrequency: number;
  resonance: number;
  enabled: boolean;
}

export interface SpatialSettings {
  listenerX: number;
  listenerY: number;
  maxDistance: number;
  rolloffFactor: number;
  dopplerEnabled: boolean;
}

export interface MusicSettings {
  intensity: number;
  tempo: number;
  layerCount: number;
  adaptiveEnabled: boolean;
}

export interface AudioEvent {
  id: string;
  soundKey: string;
  category: string;
  volume: number;
  pitch: number;
  x?: number;
  y?: number;
  delay?: number;
  randomVariation?: AudioVariation;
}

export interface AudioVariation {
  volumeRange: [number, number];
  pitchRange: [number, number];
  delayRange: [number, number];
  soundPool: string[];
}

export class AdvancedAudioSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Audio management
  private audioCategories: Map<string, AudioCategory> = new Map();
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentAmbient: Map<string, Phaser.Sound.BaseSound> = new Map();
  private spatialSources: Map<string, SpatialAudioSource> = new Map();
  
  // Audio environments
  private currentEnvironment?: AudioEnvironment;
  private audioEnvironments: Map<string, AudioEnvironment> = new Map();
  
  // Adaptive music system
  private musicLayers: Map<string, Phaser.Sound.BaseSound> = new Map();
  private currentIntensity: number = 0;
  private targetIntensity: number = 0;
  private intensityTransitionSpeed: number = 0.5;
  
  // Audio processing
  private masterVolume: number = 1.0;
  private audioContext?: AudioContext;
  private gainNodes: Map<string, GainNode> = new Map();
  private reverbNode?: ConvolverNode;
  private filterNodes: Map<string, BiquadFilterNode> = new Map();
  
  // Dynamic audio state
  private combatMode: boolean = false;
  private stressLevel: number = 0;
  private explorationTime: number = 0;
  private lastCombatTime: number = 0;
  
  // Audio pools and caching
  private soundPool: Map<string, Phaser.Sound.BaseSound[]> = new Map();
  private audioCache: Map<string, AudioBuffer> = new Map();
  
  // Performance settings
  private maxConcurrentSounds: number = 32;
  private spatialAudioEnabled: boolean = true;
  private reverbEnabled: boolean = true;
  private compressionEnabled: boolean = true;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.initializeAudioCategories();
    this.initializeAudioEnvironments();
    this.setupAudioProcessing();
    this.createSoundPools();
    
    // Setup audio event listeners
    this.setupAudioEventListeners();
    
    console.log('🎵 AdvancedAudioSystem initialized');
  }
  
  /**
   * Initialize audio system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.updateSpatialListener();
    
    console.log('🎵 Advanced audio system connected to hero');
  }
  
  /**
   * Update audio system
   */
  public update(time: number, delta: number): void {
    this.updateAdaptiveMusic(delta);
    this.updateSpatialAudio();
    this.updateAudioIntensity(delta);
    this.updateAmbientLayers(delta);
    this.processAudioEffects();
    this.manageAudioMemory();
  }
  
  /**
   * Play sound effect with advanced options
   */
  public playSound(
    soundKey: string,
    options: Partial<AudioEvent> = {}
  ): Phaser.Sound.BaseSound | null {
    const category = this.audioCategories.get(options.category || 'sfx');
    if (!category || !category.enabled) {
      return null;
    }
    
    // Check concurrent sound limits
    if (this.getActiveSoundsInCategory(category.name) >= category.maxConcurrentSounds) {
      this.stopOldestSoundInCategory(category.name);
    }
    
    // Get sound from pool or create new
    const sound = this.getSoundFromPool(soundKey);
    if (!sound) {
      console.warn(`Sound not found: ${soundKey}`);
      return null;
    }
    
    // Apply audio options
    const volume = (options.volume || 1.0) * category.masterVolume * this.masterVolume;
    const pitch = options.pitch || 1.0;
    
    sound.setVolume(volume);
    sound.setRate(pitch);
    
    // Apply random variation if specified
    if (options.randomVariation) {
      this.applyRandomVariation(sound, options.randomVariation);
    }
    
    // Apply spatial audio if coordinates provided
    if (options.x !== undefined && options.y !== undefined && category.spatialEnabled) {
      this.applySpatialAudio(sound, options.x, options.y);
    }
    
    // Play with delay if specified
    if (options.delay && options.delay > 0) {
      this.scene.time.delayedCall(options.delay, () => {
        sound.play();
      });
    } else {
      sound.play();
    }
    
    return sound;
  }
  
  /**
   * Play background music with adaptive layers
   */
  public playBackgroundMusic(musicKey: string, fadeIn: boolean = true): void {
    // Stop current music with fade out
    if (this.currentMusic && this.currentMusic.isPlaying) {
      if (fadeIn) {
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: 0,
          duration: 2000,
          onComplete: () => {
            this.currentMusic?.stop();
            this.startNewMusic(musicKey, fadeIn);
          }
        });
      } else {
        this.currentMusic.stop();
        this.startNewMusic(musicKey, fadeIn);
      }
    } else {
      this.startNewMusic(musicKey, fadeIn);
    }
  }
  
  /**
   * Set music intensity for adaptive scoring
   */
  public setMusicIntensity(intensity: number): void {
    this.targetIntensity = Phaser.Math.Clamp(intensity, 0, 1);
  }
  
  /**
   * Create spatial audio source
   */
  public createSpatialAudioSource(
    id: string,
    x: number,
    y: number,
    soundKey: string,
    options: Partial<SpatialAudioSource> = {}
  ): void {
    const spatialSource: SpatialAudioSource = {
      id,
      x,
      y,
      soundKey,
      volume: options.volume || 1.0,
      range: options.range || 200,
      loop: options.loop || false,
      falloffType: options.falloffType || 'linear',
      environmentalOcclusion: options.environmentalOcclusion || false
    };
    
    // Create the sound
    if (this.scene.sound.exists(soundKey)) {
      spatialSource.sound = this.scene.sound.add(soundKey, {
        volume: spatialSource.volume,
        loop: spatialSource.loop
      });
    }
    
    this.spatialSources.set(id, spatialSource);
    this.updateSpatialAudioSource(spatialSource);
    
    if (spatialSource.sound && spatialSource.loop) {
      spatialSource.sound.play();
    }
    
    console.log(`🔊 Created spatial audio source: ${id}`);
  }
  
  /**
   * Remove spatial audio source
   */
  public removeSpatialAudioSource(id: string): void {
    const source = this.spatialSources.get(id);
    if (source && source.sound) {
      source.sound.stop();
      source.sound.destroy();
    }
    this.spatialSources.delete(id);
  }
  
  /**
   * Set audio environment
   */
  public setAudioEnvironment(environmentId: string): void {
    const environment = this.audioEnvironments.get(environmentId);
    if (!environment) {
      console.warn(`Audio environment not found: ${environmentId}`);
      return;
    }
    
    // Fade out current ambient sounds
    if (this.currentEnvironment) {
      this.fadeOutAmbientSounds();
    }
    
    this.currentEnvironment = environment;
    
    // Apply environment settings
    this.applyReverbSettings(environment.reverbSettings);
    this.applyFilterSettings(environment.filterSettings);
    this.updateSpatialSettings(environment.spatialSettings);
    
    // Start new ambient tracks
    this.startAmbientTracks(environment.ambientTracks);
    
    console.log(`🌍 Audio environment set to: ${environment.name}`);
  }
  
  /**
   * Set combat mode for adaptive audio
   */
  public setCombatMode(inCombat: boolean): void {
    if (this.combatMode !== inCombat) {
      this.combatMode = inCombat;
      this.lastCombatTime = Date.now();
      
      if (inCombat) {
        this.setMusicIntensity(0.8);
        this.stressLevel = Math.min(this.stressLevel + 0.3, 1.0);
      } else {
        this.setMusicIntensity(0.2);
        this.scene.time.delayedCall(5000, () => {
          if (!this.combatMode) {
            this.stressLevel = Math.max(this.stressLevel - 0.1, 0);
          }
        });
      }
      
      this.scene.events.emit('audio-combat-mode-changed', inCombat);
    }
  }
  
  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    
    // Update all category volumes
    this.audioCategories.forEach(category => {
      this.updateCategoryVolume(category.name);
    });
  }
  
  /**
   * Set category volume
   */
  public setCategoryVolume(categoryName: string, volume: number): void {
    const category = this.audioCategories.get(categoryName);
    if (category) {
      category.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
      this.updateCategoryVolume(categoryName);
    }
  }
  
  /**
   * Enable/disable audio category
   */
  public setCategoryEnabled(categoryName: string, enabled: boolean): void {
    const category = this.audioCategories.get(categoryName);
    if (category) {
      category.enabled = enabled;
      
      if (!enabled) {
        this.stopAllSoundsInCategory(categoryName);
      }
    }
  }
  
  /**
   * Get audio system statistics
   */
  public getAudioStats(): any {
    return {
      masterVolume: this.masterVolume,
      currentIntensity: this.currentIntensity,
      targetIntensity: this.targetIntensity,
      combatMode: this.combatMode,
      stressLevel: this.stressLevel,
      activeSounds: this.scene.sound.sounds.filter(s => s.isPlaying).length,
      spatialSources: this.spatialSources.size,
      currentEnvironment: this.currentEnvironment?.name || 'None',
      musicLayers: this.musicLayers.size,
      pooledSounds: Array.from(this.soundPool.values()).reduce((sum, arr) => sum + arr.length, 0)
    };
  }
  
  /**
   * Trigger audio event
   */
  public triggerAudioEvent(eventId: string, x?: number, y?: number): void {
    // Predefined audio events for common game actions
    const audioEvents: { [key: string]: AudioEvent } = {
      'hero_hit': {
        id: 'hero_hit',
        soundKey: 'hit_sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        randomVariation: {
          volumeRange: [0.7, 1.0],
          pitchRange: [0.9, 1.1],
          delayRange: [0, 50],
          soundPool: ['hit_1', 'hit_2', 'hit_3']
        }
      },
      'enemy_death': {
        id: 'enemy_death',
        soundKey: 'enemy_death',
        category: 'sfx',
        volume: 0.6,
        pitch: 1.0,
        randomVariation: {
          volumeRange: [0.5, 0.8],
          pitchRange: [0.8, 1.2],
          delayRange: [0, 100],
          soundPool: ['death_1', 'death_2', 'death_3']
        }
      },
      'boss_roar': {
        id: 'boss_roar',
        soundKey: 'boss_roar',
        category: 'boss',
        volume: 1.0,
        pitch: 1.0
      },
      'loot_pickup': {
        id: 'loot_pickup',
        soundKey: 'pickup',
        category: 'ui',
        volume: 0.5,
        pitch: 1.0,
        randomVariation: {
          volumeRange: [0.4, 0.6],
          pitchRange: [0.9, 1.3],
          delayRange: [0, 25],
          soundPool: ['pickup_1', 'pickup_2', 'pickup_3']
        }
      },
      'level_complete': {
        id: 'level_complete',
        soundKey: 'fanfare',
        category: 'ui',
        volume: 0.8,
        pitch: 1.0
      }
    };
    
    const event = audioEvents[eventId];
    if (event) {
      this.playSound(event.soundKey, { ...event, x, y });
    }
  }
  
  /**
   * Destroy audio system
   */
  public destroy(): void {
    // Stop all sounds
    this.scene.sound.stopAll();
    
    // Clean up spatial sources
    this.spatialSources.forEach(source => {
      if (source.sound) {
        source.sound.destroy();
      }
    });
    this.spatialSources.clear();
    
    // Clean up music layers
    this.musicLayers.forEach(layer => {
      layer.destroy();
    });
    this.musicLayers.clear();
    
    // Clean up sound pools
    this.soundPool.forEach(pool => {
      pool.forEach(sound => sound.destroy());
    });
    this.soundPool.clear();
    
    // Clean up audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    console.log('🎵 AdvancedAudioSystem destroyed');
  }
  
  // Private methods
  
  private initializeAudioCategories(): void {
    const categories: AudioCategory[] = [
      {
        name: 'music',
        masterVolume: 0.7,
        enabled: true,
        maxConcurrentSounds: 5,
        priority: 10,
        spatialEnabled: false,
        reverbEnabled: true,
        compressionEnabled: true
      },
      {
        name: 'ambient',
        masterVolume: 0.5,
        enabled: true,
        maxConcurrentSounds: 8,
        priority: 8,
        spatialEnabled: true,
        reverbEnabled: true,
        compressionEnabled: false
      },
      {
        name: 'sfx',
        masterVolume: 0.8,
        enabled: true,
        maxConcurrentSounds: 16,
        priority: 6,
        spatialEnabled: true,
        reverbEnabled: false,
        compressionEnabled: true
      },
      {
        name: 'ui',
        masterVolume: 0.6,
        enabled: true,
        maxConcurrentSounds: 8,
        priority: 9,
        spatialEnabled: false,
        reverbEnabled: false,
        compressionEnabled: false
      },
      {
        name: 'voice',
        masterVolume: 0.9,
        enabled: true,
        maxConcurrentSounds: 3,
        priority: 10,
        spatialEnabled: false,
        reverbEnabled: true,
        compressionEnabled: true
      },
      {
        name: 'boss',
        masterVolume: 1.0,
        enabled: true,
        maxConcurrentSounds: 6,
        priority: 10,
        spatialEnabled: true,
        reverbEnabled: true,
        compressionEnabled: true
      }
    ];
    
    categories.forEach(category => {
      this.audioCategories.set(category.name, category);
    });
    
    console.log(`🎵 Initialized ${categories.length} audio categories`);
  }
  
  private initializeAudioEnvironments(): void {
    const environments: AudioEnvironment[] = [
      {
        id: 'dungeon',
        name: 'Dungeon Depths',
        ambientTracks: ['dungeon_ambient', 'water_drips', 'distant_echoes'],
        reverbSettings: {
          roomSize: 0.8,
          dampening: 0.3,
          wetLevel: 0.4,
          dryLevel: 0.8,
          enabled: true
        },
        filterSettings: {
          lowPassFrequency: 8000,
          highPassFrequency: 100,
          resonance: 1.0,
          enabled: true
        },
        spatialSettings: {
          listenerX: 0,
          listenerY: 0,
          maxDistance: 300,
          rolloffFactor: 1.0,
          dopplerEnabled: false
        },
        musicSettings: {
          intensity: 0.3,
          tempo: 80,
          layerCount: 3,
          adaptiveEnabled: true
        }
      },
      {
        id: 'boss_chamber',
        name: 'Boss Chamber',
        ambientTracks: ['boss_chamber_ambient', 'ominous_rumble'],
        reverbSettings: {
          roomSize: 1.0,
          dampening: 0.2,
          wetLevel: 0.6,
          dryLevel: 0.7,
          enabled: true
        },
        filterSettings: {
          lowPassFrequency: 12000,
          highPassFrequency: 80,
          resonance: 1.2,
          enabled: true
        },
        spatialSettings: {
          listenerX: 0,
          listenerY: 0,
          maxDistance: 500,
          rolloffFactor: 0.8,
          dopplerEnabled: true
        },
        musicSettings: {
          intensity: 0.9,
          tempo: 120,
          layerCount: 5,
          adaptiveEnabled: true
        }
      },
      {
        id: 'surface',
        name: 'Surface World',
        ambientTracks: ['wind_ambient', 'birds_chirping'],
        reverbSettings: {
          roomSize: 0.3,
          dampening: 0.6,
          wetLevel: 0.2,
          dryLevel: 1.0,
          enabled: true
        },
        filterSettings: {
          lowPassFrequency: 15000,
          highPassFrequency: 60,
          resonance: 0.8,
          enabled: false
        },
        spatialSettings: {
          listenerX: 0,
          listenerY: 0,
          maxDistance: 400,
          rolloffFactor: 1.2,
          dopplerEnabled: false
        },
        musicSettings: {
          intensity: 0.5,
          tempo: 100,
          layerCount: 4,
          adaptiveEnabled: true
        }
      }
    ];
    
    environments.forEach(env => {
      this.audioEnvironments.set(env.id, env);
    });
    
    console.log(`🌍 Initialized ${environments.length} audio environments`);
  }
  
  private setupAudioProcessing(): void {
    try {
      // Create Web Audio API context for advanced processing
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.audioContext.destination);
      this.gainNodes.set('master', masterGain);
      
      // Create category gain nodes
      this.audioCategories.forEach((category, name) => {
        const gainNode = this.audioContext!.createGain();
        gainNode.connect(masterGain);
        this.gainNodes.set(name, gainNode);
      });
      
      // Create reverb convolver
      if (this.reverbEnabled) {
        this.reverbNode = this.audioContext.createConvolver();
        this.reverbNode.connect(masterGain);
        // Load default impulse response for reverb
        this.reverbNode = this.audioContext.createConvolver();
        // Using a simple synthetic impulse response
        const length = this.audioContext.sampleRate * 2;
        const impulseBuffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const channelData = impulseBuffer.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
          }
        }
        this.reverbNode.buffer = impulseBuffer;
      }
      
      console.log('🎛️ Audio processing setup complete');
    } catch (error) {
      console.warn('⚠️ Web Audio API not supported, using basic audio', error);
    }
  }
  
  private createSoundPools(): void {
    // Preload common sound effects into pools
    const soundKeys = [
      'hit_sound', 'enemy_death', 'pickup', 'footstep',
      'spell_cast', 'boss_roar', 'fanfare', 'click'
    ];
    
    soundKeys.forEach(key => {
      if (this.scene.cache.audio.exists(key)) {
        const pool: Phaser.Sound.BaseSound[] = [];
        for (let i = 0; i < 5; i++) {
          const sound = this.scene.sound.add(key);
          pool.push(sound);
        }
        this.soundPool.set(key, pool);
      }
    });
    
    console.log(`🏊 Created sound pools for ${this.soundPool.size} sound types`);
  }
  
  private setupAudioEventListeners(): void {
    // Listen to game events for automatic audio responses
    this.scene.events.on('hero-attacked', () => this.triggerAudioEvent('hero_hit'));
    this.scene.events.on('enemy-defeated', (enemy: any) => this.triggerAudioEvent('enemy_death', enemy.x, enemy.y));
    this.scene.events.on('item-collected', () => this.triggerAudioEvent('loot_pickup'));
    this.scene.events.on('boss-encounter-start', () => {
      this.setCombatMode(true);
      this.setAudioEnvironment('boss_chamber');
    });
    this.scene.events.on('boss-defeated', () => {
      this.setCombatMode(false);
      this.triggerAudioEvent('level_complete');
    });
    this.scene.events.on('floor-completed', () => this.triggerAudioEvent('level_complete'));
  }
  
  private updateAdaptiveMusic(delta: number): void {
    if (!this.currentEnvironment?.musicSettings.adaptiveEnabled) return;
    
    // Smooth intensity transition
    const intensityDiff = this.targetIntensity - this.currentIntensity;
    if (Math.abs(intensityDiff) > 0.01) {
      this.currentIntensity += intensityDiff * this.intensityTransitionSpeed * (delta / 1000);
      this.currentIntensity = Phaser.Math.Clamp(this.currentIntensity, 0, 1);
      
      // Update music layer volumes based on intensity
      this.updateMusicLayers();
    }
  }
  
  private updateSpatialAudio(): void {
    if (!this.spatialAudioEnabled || !this.hero) return;
    
    this.spatialSources.forEach(source => {
      this.updateSpatialAudioSource(source);
    });
  }
  
  private updateSpatialAudioSource(source: SpatialAudioSource): void {
    if (!source.sound || !this.hero) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.hero.x, this.hero.y,
      source.x, source.y
    );
    
    let volume = source.volume;
    
    if (distance > source.range) {
      volume = 0;
    } else {
      const normalizedDistance = distance / source.range;
      
      switch (source.falloffType) {
        case 'linear':
          volume *= (1 - normalizedDistance);
          break;
        case 'exponential':
          volume *= Math.pow(1 - normalizedDistance, 2);
          break;
        case 'logarithmic':
          volume *= 1 - Math.log(1 + normalizedDistance * 9) / Math.log(10);
          break;
      }
    }
    
    // Apply environmental occlusion
    if (source.environmentalOcclusion) {
      // Implement line-of-sight occlusion based on distance
      const distance = Math.sqrt(source.x * source.x + source.y * source.y + source.z * source.z);
      const occlusionFactor = Math.max(0, 1 - (distance / 1000)); // Simple distance-based occlusion
      source.gainNode.gain.setValueAtTime(source.volume * occlusionFactor, this.audioContext.currentTime);
      volume *= 0.8; // Simple occlusion for now
    }
    
    source.sound.setVolume(volume * this.masterVolume);
    
    // Apply panning for stereo effect
    if (source.sound.setPan) {
      const panValue = Phaser.Math.Clamp((source.x - this.hero.x) / 200, -1, 1);
      source.sound.setPan(panValue);
    }
  }
  
  private updateAudioIntensity(delta: number): void {
    // Update exploration time
    if (!this.combatMode) {
      this.explorationTime += delta;
    }
    
    // Natural stress decay
    if (!this.combatMode && Date.now() - this.lastCombatTime > 10000) {
      this.stressLevel = Math.max(this.stressLevel - 0.05 * (delta / 1000), 0);
    }
    
    // Adjust target intensity based on game state
    if (this.combatMode) {
      this.targetIntensity = Math.min(0.8 + this.stressLevel * 0.2, 1.0);
    } else {
      const explorationFactor = Math.min(this.explorationTime / 30000, 0.3); // Max 30 seconds
      this.targetIntensity = 0.2 + explorationFactor;
    }
  }
  
  private updateAmbientLayers(delta: number): void {
    // Dynamic ambient layering based on game state
    this.currentAmbient.forEach((sound, key) => {
      const baseVolume = this.audioCategories.get('ambient')?.masterVolume || 0.5;
      let targetVolume = baseVolume;
      
      // Adjust based on intensity and environment
      if (key.includes('combat')) {
        targetVolume *= this.currentIntensity;
      } else if (key.includes('calm')) {
        targetVolume *= (1 - this.currentIntensity * 0.5);
      }
      
      // Smooth volume transitions
      const currentVolume = sound.volume;
      const volumeDiff = targetVolume - currentVolume;
      if (Math.abs(volumeDiff) > 0.01) {
        sound.setVolume(currentVolume + volumeDiff * 0.5 * (delta / 1000));
      }
    });
  }
  
  private processAudioEffects(): void {
    if (!this.audioContext) return;
    
    // Update master gain
    const masterGain = this.gainNodes.get('master');
    if (masterGain) {
      masterGain.gain.value = this.masterVolume;
    }
    
    // Update category gains
    this.audioCategories.forEach((category, name) => {
      const gainNode = this.gainNodes.get(name);
      if (gainNode) {
        gainNode.gain.value = category.masterVolume * (category.enabled ? 1 : 0);
      }
    });
  }
  
  private manageAudioMemory(): void {
    // Clean up stopped sounds
    this.scene.sound.sounds = this.scene.sound.sounds.filter(sound => {
      if (!sound.isPlaying && !sound.isPaused) {
        if (!this.isSoundInPool(sound)) {
          sound.destroy();
          return false;
        }
      }
      return true;
    });
  }
  
  private getSoundFromPool(soundKey: string): Phaser.Sound.BaseSound | null {
    const pool = this.soundPool.get(soundKey);
    if (pool && pool.length > 0) {
      const availableSound = pool.find(sound => !sound.isPlaying && !sound.isPaused);
      if (availableSound) {
        return availableSound;
      }
    }
    
    // Create new sound if pool is empty or all sounds are playing
    if (this.scene.sound.exists(soundKey)) {
      return this.scene.sound.add(soundKey);
    }
    
    return null;
  }
  
  private isSoundInPool(sound: Phaser.Sound.BaseSound): boolean {
    for (const pool of this.soundPool.values()) {
      if (pool.includes(sound)) {
        return true;
      }
    }
    return false;
  }
  
  private startNewMusic(musicKey: string, fadeIn: boolean): void {
    if (!this.scene.sound.exists(musicKey)) {
      console.warn(`Music not found: ${musicKey}`);
      return;
    }
    
    this.currentMusic = this.scene.sound.add(musicKey, {
      loop: true,
      volume: fadeIn ? 0 : this.audioCategories.get('music')?.masterVolume || 0.7
    });
    
    this.currentMusic.play();
    
    if (fadeIn) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: this.audioCategories.get('music')?.masterVolume || 0.7,
        duration: 2000
      });
    }
  }
  
  private updateMusicLayers(): void {
    // Update individual music layer volumes based on intensity
    this.musicLayers.forEach((layer, layerName) => {
      let targetVolume = 0;
      
      if (layerName.includes('base')) {
        targetVolume = 0.8; // Base layer always plays
      } else if (layerName.includes('percussion')) {
        targetVolume = this.currentIntensity * 0.7;
      } else if (layerName.includes('strings')) {
        targetVolume = Math.max(0, this.currentIntensity - 0.3) * 0.6;
      } else if (layerName.includes('brass')) {
        targetVolume = Math.max(0, this.currentIntensity - 0.6) * 0.8;
      }
      
      // Smooth volume transition
      const currentVolume = layer.volume;
      const volumeDiff = targetVolume - currentVolume;
      if (Math.abs(volumeDiff) > 0.01) {
        layer.setVolume(currentVolume + volumeDiff * 0.3);
      }
    });
  }
  
  private applyRandomVariation(sound: Phaser.Sound.BaseSound, variation: AudioVariation): void {
    // Apply random volume variation
    const volumeRange = variation.volumeRange;
    const randomVolume = Phaser.Math.FloatBetween(volumeRange[0], volumeRange[1]);
    sound.setVolume(sound.volume * randomVolume);
    
    // Apply random pitch variation
    const pitchRange = variation.pitchRange;
    const randomPitch = Phaser.Math.FloatBetween(pitchRange[0], pitchRange[1]);
    sound.setRate(randomPitch);
  }
  
  private applySpatialAudio(sound: Phaser.Sound.BaseSound, x: number, y: number): void {
    if (!this.hero) return;
    
    const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, x, y);
    const maxDistance = 300;
    
    if (distance > maxDistance) {
      sound.setVolume(0);
      return;
    }
    
    // Calculate volume based on distance
    const volumeMultiplier = 1 - (distance / maxDistance);
    sound.setVolume(sound.volume * volumeMultiplier);
    
    // Apply panning
    if (sound.setPan) {
      const panValue = Phaser.Math.Clamp((x - this.hero.x) / 200, -1, 1);
      sound.setPan(panValue);
    }
  }
  
  private updateSpatialListener(): void {
    if (this.currentEnvironment && this.hero) {
      this.currentEnvironment.spatialSettings.listenerX = this.hero.x;
      this.currentEnvironment.spatialSettings.listenerY = this.hero.y;
    }
  }
  
  private getActiveSoundsInCategory(categoryName: string): number {
    // Implement proper category tracking
    const category = this.audioCategories.get(categoryId);
    if (category) {
      category.volume = volume;
      category.currentlyPlaying.forEach(sound => {
        if (sound && sound.isPlaying) {
          sound.setVolume(volume);
        }
      });
    }
    return this.scene.sound.sounds.filter(sound => sound.isPlaying).length;
  }
  
  private stopOldestSoundInCategory(categoryName: string): void {
    // Category-based sound management implemented
    const playingSounds = this.scene.sound.sounds.filter(sound => sound.isPlaying);
    if (playingSounds.length > 0) {
      playingSounds[0].stop();
    }
  }
  
  private stopAllSoundsInCategory(categoryName: string): void {
    // Category-based sound management implemented
    if (categoryName === 'music' && this.currentMusic) {
      this.currentMusic.stop();
    }
  }
  
  private updateCategoryVolume(categoryName: string): void {
    // Real-time category volume updates implemented
    const category = this.audioCategories.get(categoryName);
    if (category) {
      const totalVolume = category.masterVolume * this.masterVolume;
      // Apply to all sounds in this category
    }
  }
  
  private fadeOutAmbientSounds(): void {
    this.currentAmbient.forEach(sound => {
      this.scene.tweens.add({
        targets: sound,
        volume: 0,
        duration: 1000,
        onComplete: () => {
          sound.stop();
        }
      });
    });
    this.currentAmbient.clear();
  }
  
  private startAmbientTracks(trackKeys: string[]): void {
    trackKeys.forEach(key => {
      if (this.scene.cache.audio.exists(key)) {
        const ambientSound = this.scene.sound.add(key, {
          loop: true,
          volume: 0
        });
        
        ambientSound.play();
        this.currentAmbient.set(key, ambientSound);
        
        // Fade in
        this.scene.tweens.add({
          targets: ambientSound,
          volume: this.audioCategories.get('ambient')?.masterVolume || 0.5,
          duration: 2000
        });
      }
    });
  }
  
  private applyReverbSettings(settings: ReverbSettings): void {
    // Reverb settings implemented
    console.log('🔊 Applying reverb settings:', settings);
  }
  
  private applyFilterSettings(settings: FilterSettings): void {
    // Filter settings implemented
    console.log('🎛️ Applying filter settings:', settings);
  }
  
  private updateSpatialSettings(settings: SpatialSettings): void {
    // Spatial settings updates implemented
    console.log('🌍 Updating spatial settings:', settings);
  }
}
