// Main game update loop
export class GameLoop {
    constructor(scene) {
        this.scene = scene;
        this.lastOxygenUpdate = 0;
    }

    update() {
        if (!this.scene.gameState?.player) return;
        
        this.scene.inputHandler.update();
        this.scene.enemyManager.updateEnemyAI();
        this.updateOxygenSystem();
        this.scene.uiManager.updateUI();
    }

    updateOxygenSystem() {
        const oxygen = this.scene.gameState.playerOxygen;
        const currentTime = Date.now();
        
        if (!this.lastOxygenUpdate) {
            this.lastOxygenUpdate = currentTime;
        }
        
        if (currentTime - this.lastOxygenUpdate > 5000) { // Every 5 seconds
            oxygen.currentOxygen = Math.max(0, oxygen.currentOxygen - 1);
            this.lastOxygenUpdate = currentTime;
            
            if (oxygen.currentOxygen === 0) {
                this.scene.playerController.damagePlayer(3, 'suffocation');
            }
        }
    }
}
