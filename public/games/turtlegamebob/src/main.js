// Main entry point - clean and focused
import { CompleteRoguelikeScene } from './core/GameEngine.js';

class MainMenuManager {
    constructor() {
        this.gameStarted = false;
        this.setupMainMenu();
    }

    setupMainMenu() {
        // Load settings and set up menu buttons
        this.loadSettings();
        this.updateContinueButton();
        
        // Button event listeners
        const newGameBtn = document.getElementById('new-game-btn');
        const continueBtn = document.getElementById('continue-game-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const creditsBtn = document.getElementById('credits-btn');
        
        console.log('🔧 Setting up menu buttons:', { newGameBtn, continueBtn, settingsBtn, creditsBtn });
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('🎮 New Game button clicked!');
                this.startNewGame();
            });
        } else {
            console.error('❌ New Game button not found!');
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                console.log('📂 Continue button clicked!');
                this.continueGame();
            });
        } else {
            console.error('❌ Continue button not found!');
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('⚙️ Settings button clicked!');
                this.showSettings();
            });
        } else {
            console.error('❌ Settings button not found!');
        }
        
        if (creditsBtn) {
            creditsBtn.addEventListener('click', () => {
                console.log('🎬 Credits button clicked!');
                this.showCredits();
            });
        } else {
            console.error('❌ Credits button not found!');
        }
    }

    startNewGame() {
        localStorage.removeItem('bobTurtleRoguelike_save');
        this.hideMainMenu();
        this.initializeGame();
    }

    continueGame() {
        if (localStorage.getItem('bobTurtleRoguelike_save')) {
            this.hideMainMenu();
            this.initializeGame();
        }
    }

    initializeGame() {
        if (window.game) {
            window.game.destroy(true);
        }

        const gameConfig = {
            type: Phaser.AUTO,
            width: 1200,
            height: 800,
            parent: 'game-container',
            backgroundColor: '#1a1a2e',
            scene: CompleteRoguelikeScene,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            audio: {
                disableWebAudio: false
            }
        };

        window.game = new Phaser.Game(gameConfig);
        window.gameInstance = window.game;
    }

    hideMainMenu() {
        document.getElementById('main-menu-overlay').style.display = 'none';
        this.gameStarted = true;
    }

    showMainMenu() {
        document.getElementById('main-menu-overlay').style.display = 'block';
        this.updateContinueButton();
        this.gameStarted = false;
    }

    updateContinueButton() {
        const continueBtn = document.getElementById('continue-game-btn');
        if (localStorage.getItem('bobTurtleRoguelike_save')) {
            continueBtn.disabled = false;
            continueBtn.style.background = '#27ae60';
            continueBtn.style.opacity = '1';
        } else {
            continueBtn.disabled = true;
            continueBtn.style.background = '#7f8c8d';
            continueBtn.style.opacity = '0.5';
        }
    }

    loadSettings() {
        // Load and apply saved audio settings
        const musicVolume = localStorage.getItem('bobTurtle_musicVolume') || '30';
        const sfxVolume = localStorage.getItem('bobTurtle_sfxVolume') || '70';
        const musicMuted = localStorage.getItem('bobTurtle_musicMuted') === 'true';
        const sfxMuted = localStorage.getItem('bobTurtle_sfxMuted') === 'true';
        
        // Update UI elements if they exist
        this.updateVolumeSliders(musicVolume, sfxVolume);
        this.updateMuteButtons(musicMuted, sfxMuted);
    }

    updateVolumeSliders(musicVolume, sfxVolume) {
        const musicSlider = document.getElementById('music-volume-slider');
        const sfxSlider = document.getElementById('sfx-volume-slider');
        const musicText = document.getElementById('music-volume-text');
        const sfxText = document.getElementById('sfx-volume-text');
        
        if (musicSlider) musicSlider.value = musicVolume;
        if (sfxSlider) sfxSlider.value = sfxVolume;
        if (musicText) musicText.textContent = musicVolume + '%';
        if (sfxText) sfxText.textContent = sfxVolume + '%';
    }

    updateMuteButtons(musicMuted, sfxMuted) {
        this.updateMuteButtonState('music', musicMuted);
        this.updateMuteButtonState('sfx', sfxMuted);
    }

    updateMuteButtonState(type, isMuted) {
        const buttons = [
            document.getElementById(`${type}-mute-btn`),
            document.getElementById(`settings-${type}-mute-btn`)
        ];
        
        buttons.forEach(btn => {
            if (btn) {
                btn.textContent = isMuted ? '🔇' : '🔊';
                btn.style.background = isMuted ? '#e74c3c' : '#2ecc71';
            }
        });
    }

    showSettings() {
        document.getElementById('settings-panel').style.display = 'block';
    }

    hideSettings() {
        document.getElementById('settings-panel').style.display = 'none';
    }

    showCredits() {
        document.getElementById('credits-panel').style.display = 'block';
    }

    hideCredits() {
        document.getElementById('credits-panel').style.display = 'none';
    }
}

// Embedded Database Manager (CORS fix)
class DatabaseManager {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:5173' 
            : 'https://bob-turtle-roguelike.vercel.app';
        
        this.isDevelopment = window.location.hostname === 'localhost' || window.location.protocol === 'file:';
        this.playerId = this.getOrCreatePlayerId();
        this.playerName = localStorage.getItem('bobturtle_playername') || 'Anonymous Turtle';
        
        if (this.isDevelopment) {
            console.log('🔧 Development mode: Using localStorage for saves');
        }
    }

    getOrCreatePlayerId() {
        let playerId = localStorage.getItem('bobturtle_playerid');
        if (!playerId) {
            playerId = 'turtle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('bobturtle_playerid', playerId);
        }
        return playerId;
    }

    async saveGame(gameData) {
        if (this.isDevelopment) {
            try {
                localStorage.setItem('bobTurtleRoguelike_save', JSON.stringify({
                    ...gameData,
                    playerName: this.playerName,
                    timestamp: Date.now()
                }));
                console.log('💾 Game saved locally (dev mode)');
                return { success: true };
            } catch (error) {
                console.error('Local save error:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: true };
    }

    async loadGame() {
        if (this.isDevelopment) {
            try {
                const saved = localStorage.getItem('bobTurtleRoguelike_save');
                if (saved) {
                    console.log('📁 Loading local save (dev mode)');
                    return { saveData: JSON.parse(saved) };
                }
                return null;
            } catch (error) {
                console.error('Local load error:', error);
                return null;
            }
        }
        return null;
    }

    async unlockAchievement(achievementId) {
        if (this.isDevelopment) {
            console.log(`🏆 Achievement unlocked (dev): ${achievementId}`);
            return { success: true, achievement: { name: "Achievement", icon: "🏆" }, alreadyUnlocked: false };
        }
        return { success: true };
    }

    async getLeaderboard() {
        return { leaderboard: [] };
    }

    async submitScore(score, depth, level, time) {
        if (this.isDevelopment) {
            console.log(`🏆 Dev mode score: ${score} (depth: ${depth}, level: ${level})`);
        }
        return { success: true, rank: 1 };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initializing Bob The Turtle Roguelike...');
    
    // Initialize global instances
    window.dbManager = new DatabaseManager();
    window.mainMenu = new MainMenuManager();
    
    console.log('✅ Game initialized and ready!');
});
