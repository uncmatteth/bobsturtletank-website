// Central game state management

export class GameState {
    constructor() {
        this.currentDepth = 1;
        this.gameMap = null;
        this.rooms = [];
        this.entities = [];
        this.player = null;
        this.stairsPosition = null;
        this.claimedTreasures = new Set();
        
        // Player progression
        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null,
            ring: null
        };
        this.gold = 0;
        this.identifiedItems = new Set();
        
        // Game tracking
        this.gameStartTime = Date.now();
        this.levelStartTime = Date.now();
        this.achievements = new Set();
        this.stats = {
            enemiesKilled: 0,
            bossesKilled: 0,
            itemsFound: 0,
            treasureRoomsFound: 0,
            deepestDepth: 1,
            totalScore: 0
        };
        
        this.permadeath = true;
    }

    addMessage(text, color = '#ffffff') {
        // Add message to the UI system
        if (window.uiManager) {
            window.uiManager.addMessage(text, color);
        } else {
            console.log(`Game Message: ${text}`);
        }
    }

    updateInventoryDisplay() {
        if (window.uiManager) {
            window.uiManager.updateInventoryDisplay();
        }
    }

    saveGame() {
        return {
            currentDepth: this.currentDepth,
            inventory: this.inventory,
            equipment: this.equipment,
            gold: this.gold,
            identifiedItems: Array.from(this.identifiedItems),
            achievements: Array.from(this.achievements),
            stats: this.stats,
            timestamp: Date.now()
        };
    }

    loadGame(data) {
        if (!data) return false;
        
        try {
            this.currentDepth = data.currentDepth || 1;
            this.inventory = data.inventory || [];
            this.equipment = { ...this.equipment, ...data.equipment };
            this.gold = data.gold || 0;
            this.identifiedItems = new Set(data.identifiedItems || []);
            this.achievements = new Set(data.achievements || []);
            this.stats = { ...this.stats, ...data.stats };
            
            return true;
        } catch (error) {
            console.error('Error loading game data:', error);
            return false;
        }
    }

    getScore() {
        const timeAlive = Math.floor((Date.now() - this.gameStartTime) / 1000);
        return this.currentDepth * 1000 + this.gold * 10 + timeAlive;
    }
}
