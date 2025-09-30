// Client-side database utilities for Bob The Turtle Roguelike
// Handles communication with Vercel serverless functions and Upstash Redis

class DatabaseManager {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:5173' 
            : 'https://bob-turtle-roguelike.vercel.app';
        
        // Check if we're in development mode
        this.isDevelopment = window.location.hostname === 'localhost';
        
        // Generate or get player ID
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
    
    setPlayerName(name) {
        this.playerName = name.substring(0, 20); // Limit length
        localStorage.setItem('bobturtle_playername', this.playerName);
    }
    
    // Leaderboard functions
    async getLeaderboard() {
        // In development, return mock leaderboard
        if (this.isDevelopment) {
            const mockLeaderboard = [
                { rank: 1, name: 'Dev Turtle', score: 15000, depth: 12, level: 8, date: '2024-01-15' },
                { rank: 2, name: 'Test Player', score: 12000, depth: 10, level: 6, date: '2024-01-14' },
                { rank: 3, name: 'Bob Tester', score: 8000, depth: 8, level: 5, date: '2024-01-13' }
            ];
            return { leaderboard: mockLeaderboard };
        }
        
        try {
            const response = await fetch(`${this.baseURL}/api/leaderboard`);
            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            return await response.json();
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
            return { leaderboard: [] };
        }
    }
    
    async submitScore(score, depth, level, time) {
        // In development, simulate successful submission
        if (this.isDevelopment) {
            console.log(`🏆 Dev mode score: ${score} (depth: ${depth}, level: ${level})`);
            return { success: true, rank: Math.floor(Math.random() * 10) + 1 };
        }
        
        try {
            const response = await fetch(`${this.baseURL}/api/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerName: this.playerName,
                    score,
                    depth,
                    level,
                    time
                })
            });
            
            if (!response.ok) throw new Error('Failed to submit score');
            return await response.json();
        } catch (error) {
            console.error('Score submission error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Save/Load functions
    async saveGame(gameData) {
        // In development, always use localStorage
        if (this.isDevelopment) {
            try {
                localStorage.setItem('bobturtle_save_local', JSON.stringify({
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
        
        // Production: try cloud save with localStorage fallback
        try {
            const response = await fetch(`${this.baseURL}/api/saves?playerId=${this.playerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...gameData,
                    playerName: this.playerName
                })
            });
            
            if (!response.ok) throw new Error('Failed to save game');
            return await response.json();
        } catch (error) {
            console.error('Game save error:', error);
            // Fallback to localStorage
            localStorage.setItem('bobturtle_save_backup', JSON.stringify(gameData));
            return { success: false, error: error.message };
        }
    }
    
    async loadGame() {
        // In development, always use localStorage
        if (this.isDevelopment) {
            try {
                const saved = localStorage.getItem('bobturtle_save_local');
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
        
        // Production: try cloud load with localStorage fallback
        try {
            const response = await fetch(`${this.baseURL}/api/saves?playerId=${this.playerId}`);
            
            if (response.status === 404) {
                // No save found, check localStorage backup
                const backup = localStorage.getItem('bobturtle_save_backup');
                return backup ? { saveData: JSON.parse(backup) } : null;
            }
            
            if (!response.ok) throw new Error('Failed to load game');
            return await response.json();
        } catch (error) {
            console.error('Game load error:', error);
            // Fallback to localStorage
            const backup = localStorage.getItem('bobturtle_save_backup');
            return backup ? { saveData: JSON.parse(backup) } : null;
        }
    }
    
    async deleteSave() {
        try {
            const response = await fetch(`${this.baseURL}/api/saves?playerId=${this.playerId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete save');
            
            // Also clear localStorage backup
            localStorage.removeItem('bobturtle_save_backup');
            
            return await response.json();
        } catch (error) {
            console.error('Save deletion error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Achievement functions
    async getAchievements() {
        try {
            const response = await fetch(`${this.baseURL}/api/achievements?playerId=${this.playerId}`);
            if (!response.ok) throw new Error('Failed to fetch achievements');
            return await response.json();
        } catch (error) {
            console.error('Achievement fetch error:', error);
            return { achievements: [] };
        }
    }
    
    async unlockAchievement(achievementId) {
        // In development, simulate achievement unlock
        if (this.isDevelopment) {
            const achievements = {
                first_blood: { name: "First Blood", description: "Defeat your first enemy", icon: "⚔️" },
                deep_diver: { name: "Deep Diver", description: "Reach depth 5", icon: "🌊" },
                veteran_turtle: { name: "Veteran Turtle", description: "Reach level 10", icon: "🐢" }
            };
            
            const achievement = achievements[achievementId] || { name: "Unknown", description: "Dev achievement", icon: "🏆" };
            console.log(`🏆 Achievement unlocked (dev): ${achievement.name}`);
            return { success: true, achievement, alreadyUnlocked: false };
        }
        
        try {
            const response = await fetch(`${this.baseURL}/api/achievements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: this.playerId,
                    achievementId,
                    playerName: this.playerName
                })
            });
            
            if (!response.ok) throw new Error('Failed to unlock achievement');
            return await response.json();
        } catch (error) {
            console.error('Achievement unlock error:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getGlobalAchievementStats() {
        try {
            const response = await fetch(`${this.baseURL}/api/achievements?global=true`);
            if (!response.ok) throw new Error('Failed to fetch global stats');
            return await response.json();
        } catch (error) {
            console.error('Global stats fetch error:', error);
            return { globalStats: {} };
        }
    }
}

// Global instance
export const dbManager = new DatabaseManager();

// Export for use in HTML files
if (typeof window !== 'undefined') {
    window.dbManager = dbManager;
}
