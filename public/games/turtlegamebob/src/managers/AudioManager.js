// Audio and music management system

import { MUSIC_TRACKS } from '../config/Constants.js';

export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.currentMusic = null;
        this.simpleSounds = {};
        
        this.initializeAudio();
    }

    initializeAudio() {
        // Initialize spatial audio context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.listenerNode = this.audioContext.listener;
            console.log('🔊 Spatial audio system initialized!');
        } catch (error) {
            console.warn('Spatial audio not available, using simple audio');
        }

        // Create procedural sound effects using Web Audio API
        this.createProceduralSounds();
    }

    createProceduralSounds() {
        const soundEffects = {
            sword_hit: () => this.createImpactSound(0.1, 800, 200),
            footstep: () => this.createImpactSound(0.05, 400, 100),
            pickup: () => this.createPickupSound(0.1, 600, 1200),
            level_up: () => this.createLevelUpSound(0.3, 440, 880),
            achievement_unlock: () => this.createAchievementSound(0.2, 523, 1047),
            treasure_found: () => this.createTreasureSound(0.3, 659, 1319)
        };

        Object.keys(soundEffects).forEach(soundKey => {
            this.simpleSounds[soundKey] = {
                play: () => soundEffects[soundKey](),
                setVolume: (volume) => this.sfxVolume = volume
            };
        });

        console.log('🔊 Simple procedural sound effects created!');
    }

    createImpactSound(duration, startFreq, endFreq) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createPickupSound(duration, startFreq, endFreq) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createLevelUpSound(duration, freq1, freq2) {
        if (!this.audioContext) return;
        
        // Play two tones in harmony
        [freq1, freq2].forEach(freq => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        });
    }

    createAchievementSound(duration, freq1, freq2) {
        this.createLevelUpSound(duration, freq1, freq2);
    }

    createTreasureSound(duration, freq1, freq2) {
        if (!this.audioContext) return;
        
        // Multiple sparkly tones
        [freq1, freq2, freq1 * 1.5, freq2 * 1.5].forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;
                
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration * 0.5);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration * 0.5);
            }, i * 100);
        });
    }

    startMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }

        // Select random track
        const trackPath = MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
        
        try {
            this.currentMusic = this.scene.sound.add('background_music', {
                volume: this.musicVolume,
                loop: true
            });
            this.currentMusic.play();
            console.log('🎵 Background music started');
        } catch (error) {
            console.warn('Background music not available');
        }
    }

    playSpatialSound(soundKey, x, y) {
        if (this.simpleSounds[soundKey]) {
            this.simpleSounds[soundKey].play();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.setVolume(this.musicVolume);
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        Object.keys(this.simpleSounds).forEach(soundKey => {
            const sound = this.simpleSounds[soundKey];
            if (sound && sound.setVolume) {
                sound.setVolume(this.sfxVolume);
            }
        });
    }

    loadSettings() {
        const musicVolume = localStorage.getItem('bobTurtle_musicVolume') || '30';
        const sfxVolume = localStorage.getItem('bobTurtle_sfxVolume') || '70';
        const musicMuted = localStorage.getItem('bobTurtle_musicMuted') === 'true';
        const sfxMuted = localStorage.getItem('bobTurtle_sfxMuted') === 'true';
        
        const effectiveMusicVolume = musicMuted ? 0 : (musicVolume / 100);
        const effectiveSfxVolume = sfxMuted ? 0 : (sfxVolume / 100);
        
        this.setMusicVolume(effectiveMusicVolume);
        this.setSfxVolume(effectiveSfxVolume);
    }
}
