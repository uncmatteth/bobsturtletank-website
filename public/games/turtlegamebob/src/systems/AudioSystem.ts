/**
 * AudioSystem - Dynamic music and spatial SFX management
 * Handles the legendary audio experience with 28 music tracks
 */

import Phaser from 'phaser';

export interface AudioTrack {
  key: string;
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

export class AudioSystem {
  private scene: Phaser.Scene;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private musicTracks: Record<string, string> = {};
  private sfxSounds: Record<string, Phaser.Sound.BaseSound> = {};
  
  // Music categories for dynamic switching
  private musicCategories = {
    menu: ['music1'],
    exploration: ['music2', 'music4', 'music6', 'music8'],
    combat: ['music3', 'music5', 'music7', 'music9'],
    boss: ['music10', 'music11', 'music12'],
    ambient: ['music13', 'music14', 'music15', 'music16'],
    victory: ['music17', 'music18'],
    death: ['music19', 'music20'],
    mysterious: ['music21', 'music22', 'music23'],
    intense: ['music24', 'music25', 'music26'],
    peaceful: ['music27', 'music28']
  };
  
  private currentCategory: string = 'menu';
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadSettings();
    this.setupTracks();
    console.log('🎵 AudioSystem initialized');
  }
  
  /**
   * Initialize audio system with preloaded assets
   */
  public initialize(): void {
    this.preloadSFX();
    console.log('🔊 Audio system ready with 28 music tracks');
  }
  
  /**
   * Play music by category with smart selection
   */
  public playMusicCategory(category: string, forceChange: boolean = false): void {
    if (!this.musicEnabled) return;
    
    const tracks = this.musicCategories[category as keyof typeof this.musicCategories];
    if (!tracks || tracks.length === 0) {
      console.warn(`❌ No tracks found for category: ${category}`);
      return;
    }
    
    // Don't change if same category unless forced
    if (this.currentCategory === category && !forceChange && this.currentMusic?.isPlaying) {
      return;
    }
    
    // Select random track from category
    const selectedTrack = Phaser.Utils.Array.GetRandom(tracks);
    this.playMusic(selectedTrack as string, true);
    this.currentCategory = category;
    
    console.log(`🎵 Playing ${category} music: ${selectedTrack}`);
  }
  
  /**
   * Play specific music track
   */
  public playMusic(trackKey: string, loop: boolean = true, fadeTime: number = 1000): void {
    if (!this.musicEnabled) return;
    
    // Stop current music with fade out
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: fadeTime / 2,
        onComplete: () => {
          this.currentMusic?.stop();
          this.startNewTrack(trackKey, loop, fadeTime);
        }
      });
    } else {
      this.startNewTrack(trackKey, loop, fadeTime);
    }
  }
  
  /**
   * Play sound effect with spatial positioning
   */
  public playSFX(sfxKey: string, volume: number = 1.0, x?: number, y?: number): void {
    if (!this.sfxEnabled) return;
    
    try {
      const sound = this.scene.sound.add(sfxKey, {
        volume: this.sfxVolume * volume
      });
      
      // Add spatial audio if position provided
      if (x !== undefined && y !== undefined) {
        this.applySpatialAudio(sound, x, y);
      }
      
      sound.play();
      
      // Clean up after playing
      sound.once('complete', () => {
        sound.destroy();
      });
      
    } catch (error) {
      console.warn(`⚠️ Failed to play SFX: ${sfxKey}`, error);
    }
  }
  
  /**
   * Set music volume (0.0 to 1.0)
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    
    if (this.currentMusic) {
      if ('setVolume' in this.currentMusic) {
        (this.currentMusic as any).setVolume(this.musicVolume);
      }
    }
    
    // Save to registry
    this.scene.registry.set('musicVolume', this.musicVolume);
  }
  
  /**
   * Set SFX volume (0.0 to 1.0)
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.scene.registry.set('sfxVolume', this.sfxVolume);
  }
  
  /**
   * Toggle music on/off
   */
  public toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;
    
    if (!this.musicEnabled && this.currentMusic) {
      this.currentMusic.stop();
    } else if (this.musicEnabled) {
      this.playMusicCategory(this.currentCategory, true);
    }
    
    this.scene.registry.set('musicEnabled', this.musicEnabled);
    console.log(`🎵 Music ${this.musicEnabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Toggle SFX on/off
   */
  public toggleSFX(): void {
    this.sfxEnabled = !this.sfxEnabled;
    this.scene.registry.set('sfxEnabled', this.sfxEnabled);
    console.log(`🔊 SFX ${this.sfxEnabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get current music info
   */
  public getCurrentMusicInfo(): { track: string; category: string; isPlaying: boolean } {
    return {
      track: this.currentMusic?.key || 'none',
      category: this.currentCategory,
      isPlaying: this.currentMusic?.isPlaying || false
    };
  }
  
  /**
   * Adaptive music based on game state
   */
  public updateMusicForGameState(gameState: {
    inCombat: boolean;
    nearBoss: boolean;
    lowHealth: boolean;
    floor: number;
    enemyCount: number;
  }): void {
    let targetCategory = 'exploration';
    
    // Priority-based music selection
    if (gameState.nearBoss) {
      targetCategory = 'boss';
    } else if (gameState.inCombat) {
      if (gameState.enemyCount > 5 || gameState.lowHealth) {
        targetCategory = 'intense';
      } else {
        targetCategory = 'combat';
      }
    } else if (gameState.floor > 20) {
      targetCategory = 'mysterious';
    } else if (gameState.floor % 10 === 0) {
      // Rest floors
      targetCategory = 'peaceful';
    } else {
      targetCategory = 'exploration';
    }
    
    this.playMusicCategory(targetCategory);
  }
  
  /**
   * Play achievement unlock sound with fanfare
   */
  public playAchievementUnlock(): void {
    this.playSFX('achievement_unlock', 0.8);
    
    // Add brief musical flourish
    if (this.musicEnabled) {
      const fanfare = this.scene.sound.add('music17', { volume: 0.3 });
      fanfare.play();
      fanfare.once('complete', () => fanfare.destroy());
    }
  }
  
  /**
   * Play level up sound with celebration
   */
  public playLevelUp(): void {
    this.playSFX('level_up', 0.9);
    
    // Brief volume boost for celebration
    if (this.currentMusic) {
      const originalVolume = ('volume' in this.currentMusic) ? (this.currentMusic as any).volume : 1;
      if ('setVolume' in this.currentMusic) {
        (this.currentMusic as any).setVolume(originalVolume * 1.2);
      }
      
      this.scene.time.delayedCall(1000, () => {
        if (this.currentMusic) {
          if ('setVolume' in this.currentMusic) {
            (this.currentMusic as any).setVolume(originalVolume);
          }
        }
      });
    }
  }
  
  /**
   * Clean up audio resources
   */
  public destroy(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
    
    Object.values(this.sfxSounds).forEach(sound => {
      if (sound && sound.isPlaying) {
        sound.destroy();
      }
    });
    
    this.sfxSounds = {};
    console.log('🔇 AudioSystem destroyed');
  }
  
  // Private helper methods
  
  private loadSettings(): void {
    this.musicVolume = this.scene.registry.get('musicVolume') || 0.7;
    this.sfxVolume = this.scene.registry.get('sfxVolume') || 0.8;
    this.musicEnabled = this.scene.registry.get('musicEnabled') !== false;
    this.sfxEnabled = this.scene.registry.get('sfxEnabled') !== false;
  }
  
  private setupTracks(): void {
    // Map track numbers to keys for easier management
    for (let i = 1; i <= 28; i++) {
      this.musicTracks[`music${i}`] = `music${i}`;
    }
  }
  
  private preloadSFX(): void {
    const sfxKeys = ['achievement_unlock', 'level_up', 'sword_hit'];
    
    sfxKeys.forEach(key => {
      try {
        if (this.scene.cache.audio.exists(key)) {
          const sound = this.scene.sound.add(key, { volume: this.sfxVolume });
          this.sfxSounds[key] = sound;
          console.log(`🔊 SFX loaded: ${key}`);
        } else {
          console.warn(`⚠️ SFX not found: ${key} - creating silent fallback`);
          this.createSilentFallback(key);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to preload SFX: ${key}`, error);
      }
    });
  }
  
  private createSilentFallback(key: string): void {
    try {
      // Create a minimal silent sound that won't cause errors
      this.sfxSounds[key] = {
        play: () => {},
        stop: () => {},
        setVolume: () => {},
        destroy: () => {}
      } as any;
    } catch (error) {
      console.warn(`🔊 Failed to create silent fallback for ${key}:`, error);
    }
  }
  
  private startNewTrack(trackKey: string, loop: boolean, fadeTime: number): void {
    try {
      this.currentMusic = this.scene.sound.add(trackKey, {
        volume: 0,
        loop: loop
      });
      
      this.currentMusic.play();
      
      // Fade in
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: this.musicVolume,
        duration: fadeTime / 2,
        ease: 'Power2'
      });
      
    } catch (error) {
      console.warn(`⚠️ Failed to play music track: ${trackKey}`, error);
    }
  }
  
  private applySpatialAudio(sound: Phaser.Sound.BaseSound, x: number, y: number): void {
    // Simple stereo panning based on X position
    const gameWidth = this.scene.cameras.main.width;
    const pan = ((x / gameWidth) - 0.5) * 2; // -1 to 1
    
    // Distance-based volume (simple implementation)
    const playerX = gameWidth / 2;
    const playerY = this.scene.cameras.main.height / 2;
    const distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
    const maxDistance = Math.max(gameWidth, this.scene.cameras.main.height);
    const distanceVolume = 1 - (distance / maxDistance);
    
    // Apply spatial effects if supported
    if ('setRate' in sound) {
      if ('setVolume' in sound && 'volume' in sound) {
        (sound as any).setVolume((sound as any).volume * distanceVolume);
      }
    }
  }
}

