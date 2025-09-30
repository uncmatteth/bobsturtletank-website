import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private musicTracks: string[] = [];
  private currentTrack?: Phaser.Sound.BaseSound;
  private currentTrackIndex: number = 0;
  
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private isPlaying: boolean = false;
  
  // UI Elements
  private volumeButton!: Phaser.GameObjects.Text;
  private muteButton!: Phaser.GameObjects.Text;
  private trackDisplay!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupMusicTracks();
    this.setupAudioUI();
    this.loadAudioSettings();
    
    // Debug audio system on creation
    console.log('🎵 Audio Manager initialized');
    console.log('Muted:', this.isMuted, 'Volume:', this.volume);
  }

  private setupMusicTracks() {
    // List all available music tracks (21 total: music0 through music20)
    for (let i = 0; i < 21; i++) {
      this.musicTracks.push(`music${i}`);
    }
    
    // Shuffle the playlist initially
    this.shufflePlaylist();
  }

  private setupAudioUI() {
    const { width } = this.scene.cameras.main;
    
    // Mute button
    this.muteButton = this.scene.add.text(width - 120, 20, '🔊', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setDepth(1000).setInteractive();
    
    this.muteButton.on('pointerdown', () => {
      this.toggleMute();
    });
    
    // Volume controls (+ and -)
    const volumeDown = this.scene.add.text(width - 90, 20, '🔽', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setDepth(1000).setInteractive();
    
    const volumeUp = this.scene.add.text(width - 60, 20, '🔼', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setDepth(1000).setInteractive();
    
    volumeDown.on('pointerdown', () => {
      this.decreaseVolume();
    });
    
    volumeUp.on('pointerdown', () => {
      this.increaseVolume();
    });
    
    // Track display removed to avoid overlap with points HUD
    
    // Skip track button
    const skipButton = this.scene.add.text(width - 30, 20, '⏭️', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setDepth(1000).setInteractive();
    
    skipButton.on('pointerdown', () => {
      this.skipTrack();
    });
  }

  private loadAudioSettings() {
    // Load saved audio settings
    const savedVolume = localStorage.getItem('bob-turtle-volume');
    const savedMute = localStorage.getItem('bob-turtle-muted');
    
    if (savedVolume) {
      this.volume = parseFloat(savedVolume);
    }
    
    if (savedMute) {
      this.isMuted = savedMute === 'true';
    }
    
    this.updateUI();
  }

  private saveAudioSettings() {
    localStorage.setItem('bob-turtle-volume', this.volume.toString());
    localStorage.setItem('bob-turtle-muted', this.isMuted.toString());
  }

  public startMusic() {
    if (this.isPlaying) return;
    
    // Stop any existing tracks first to prevent multiple music
    this.stopMusic();
    
    this.playCurrentTrack();
    this.isPlaying = true;
  }

  public stopMusic() {
    if (this.currentTrack) {
      this.currentTrack.stop();
      this.currentTrack.destroy();
      this.currentTrack = undefined;
    }
    this.isPlaying = false;
    
    // Also stop all music tracks that might be playing to prevent overlap
    this.musicTracks.forEach(trackKey => {
      try {
        const track = this.scene.sound.get(trackKey);
        if (track && track.isPlaying) {
          track.stop();
        }
      } catch (error) {
        // Ignore errors for non-existent tracks
      }
    });
  }

  private playCurrentTrack() {
    // Stop current track if playing
    if (this.currentTrack) {
      this.currentTrack.stop();
    }
    
    // Get current track key
    const trackKey = this.musicTracks[this.currentTrackIndex];
    
    // Create and play new track
    this.currentTrack = this.scene.sound.add(trackKey, {
      volume: this.isMuted ? 0 : this.volume,
      loop: false
    });
    
    // Set up track end event to play next track
    this.currentTrack.once('complete', () => {
      this.playNextTrack();
    });
    
    this.currentTrack.play();
    
    // Update track display
    this.updateTrackDisplay(trackKey);
  }

  private playNextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
    
    // If we've gone through all tracks, shuffle again
    if (this.currentTrackIndex === 0) {
      this.shufflePlaylist();
    }
    
    this.playCurrentTrack();
  }

  private shufflePlaylist() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.musicTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.musicTracks[i], this.musicTracks[j]] = [this.musicTracks[j], this.musicTracks[i]];
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.currentTrack) {
      (this.currentTrack as any).setVolume(this.isMuted ? 0 : this.volume);
    }
    
    this.updateUI();
    this.saveAudioSettings();
    
    // Show mute status briefly
    this.showVolumeStatus();
  }

  public increaseVolume() {
    this.volume = Math.min(1, this.volume + 0.1);
    
    if (this.currentTrack && !this.isMuted) {
(this.currentTrack as any).setVolume(this.volume);
    }
    
    this.updateUI();
    this.saveAudioSettings();
    this.showVolumeStatus();
  }

  public decreaseVolume() {
    this.volume = Math.max(0, this.volume - 0.1);
    
    if (this.currentTrack && !this.isMuted) {
(this.currentTrack as any).setVolume(this.volume);
    }
    
    this.updateUI();
    this.saveAudioSettings();
    this.showVolumeStatus();
  }

  public skipTrack() {
    this.playNextTrack();
    
    // Show skip feedback
    const { width, height } = this.scene.cameras.main;
    const skipText = this.scene.add.text(width / 2, height - 100, 'Track Skipped! 🎵', {
      fontSize: '18px',
      color: '#FFFF00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Animate skip feedback
    this.scene.tweens.add({
      targets: skipText,
      alpha: 0,
      y: height - 150,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => skipText.destroy()
    });
  }

  private updateUI() {
    // Update mute button
    this.muteButton.setText(this.isMuted ? '🔇' : '🔊');
    
    // Update button colors based on state
    if (this.isMuted) {
      this.muteButton.setColor('#FF6666');
    } else {
      this.muteButton.setColor('#FFFFFF');
    }
  }

  private updateTrackDisplay(trackKey: string) {
    // Track display removed to avoid overlap with points HUD
    // Music continues to play and shuffle normally
  }

  private showVolumeStatus() {
    const { width, height } = this.scene.cameras.main;
    
    let statusText = '';
    if (this.isMuted) {
      statusText = 'Muted 🔇';
    } else {
      const volumePercent = Math.round(this.volume * 100);
      statusText = `Volume: ${volumePercent}% 🔊`;
    }
    
    const volumeStatus = this.scene.add.text(width / 2, height - 50, statusText, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Animate volume status
    volumeStatus.setAlpha(0);
    this.scene.tweens.add({
      targets: volumeStatus,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
    
    this.scene.tweens.add({
      targets: volumeStatus,
      alpha: 0,
      duration: 500,
      delay: 1000,
      ease: 'Power2',
      onComplete: () => volumeStatus.destroy()
    });
  }

  public getCurrentTrackName(): string {
    const trackNames = [
      'Cosmic Turtle Bob (Original)',
      'Cosmic Turtle Bob (Remix)',
      'Cosmic Turtle Bob (Remix 1)',
      'Cosmic Turtle Bob (Remix 2)',
      'Cosmic Turtle Bob (Remix 3)',
      'Cosmic Turtle Bob (Remix 4)',
      'Cosmic Turtle Bob (Remix 5)',
      'Cosmic Turtle Bob (Remix 6)',
      'Cosmic Turtle Bob (Remix 7)',
      'Cosmic Turtle Bob (Remix 8)',
      'Cosmic Turtle Bob (Remix 9)',
      'Cosmic Turtle Bob (Remix 10)',
      'Cosmic Turtle Bob (Remix 11)',
      'Cosmic Turtle Bob (Remix 12)',
      'Cosmic Turtle Bob (Remix 13)',
      'Cosmic Turtle Bob (Remix 14)',
      'Cosmic Turtle Bob (Remix 15)',
      'Cosmic Turtle Bob (Remix 16)',
      'Cosmic Turtle Bob (Remix 17)',
      'Cosmic Turtle Bob (Remix 18)',
      'Cosmic Turtle Bob (Classic)',
      'Cosmic Turtle Bob (Finale)'
    ];
    
    return trackNames[this.currentTrackIndex] || 'Unknown Track';
  }

  // Epic sound effects system!
  public playSfx(sfxName: string, volume: number = 0.5) {
    if (this.isMuted) return;
    
    try {
      const sfx = this.scene.sound.add(sfxName, { volume: volume * this.volume });
      sfx.play();
      
      // Auto-destroy after playing
      sfx.once('complete', () => {
        sfx.destroy();
      });
    } catch (error) {
      console.warn(`Failed to play SFX: ${sfxName}`, error);
    }
  }

  public playBounceSound() {
    this.playSfx('bounce', 0.7);
  }

  public playDeathSound() {
    console.log('🎵 DEATH SOUND REQUEST');
    
    // Prevent spam - only allow one death sound per second
    const now = Date.now();
    if (this.lastDeathSound && (now - this.lastDeathSound) < 1000) {
      console.log('🚫 Death sound on cooldown - preventing spam');
      return;
    }
    this.lastDeathSound = now;
    
    // Show visual indicator only during testing
    if (this.isTestingAudio) {
      this.showSoundTestIndicator('Testing Explosion Sound...');
    }
    
    // Try to play death sound from cache (not from existing sound instances)
    if (this.scene.cache.audio.exists('death')) {
      console.log('✅ Death sound found in cache! Playing...');
      this.playSfx('death', 0.8);
      if (this.isTestingAudio) {
        this.showSoundTestIndicator('💥 EXPLOSION! 💥', '#FF0000');
      }
    } else {
      console.warn('❌ Death sound NOT FOUND in cache! Ensure public/assets/sfx/death.mp3 exists and PreloadScene is loading it.');
      if (this.isTestingAudio) {
        this.showSoundTestIndicator('❌ NO EXPLOSION SOUND FILE!', '#FF6666');
      }
    }
    
    this.isTestingAudio = false; // Reset test flag
  }

  private lastDeathSound: number = 0;
  private isTestingAudio: boolean = false;

  public testDeathSound() {
    this.isTestingAudio = true;
    this.playDeathSound();
  }

  private showSoundTestIndicator(message: string, color: string = '#00FF00') {
    const { width, height } = this.scene.cameras.main;
    
    const indicator = this.scene.add.text(width / 2, height / 2, message, {
      fontSize: '32px',
      color: color,
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      stroke: '#FFFFFF',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9999);

    // Animate and destroy
    indicator.setScale(0);
    this.scene.tweens.add({
      targets: indicator,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
      targets: indicator,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      ease: 'Power2',
      onComplete: () => indicator.destroy()
    });
  }

  public playNewRecordSound() {
    this.playSfx('newrecord', 0.9);
  }

  public playMilestoneSound() {
    this.playSfx('milestone', 0.6);
  }

  public playComboSound(comboLevel: number) {
    const volume = Math.min(0.8, 0.4 + comboLevel * 0.1);
    this.playSfx('combo', volume);
  }
}
