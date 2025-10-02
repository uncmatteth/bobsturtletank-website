// ============================================================================
// UI SYSTEM
// HUD, menus, health bar
// ============================================================================

const UI = {
    render(ctx) {
        this.drawHealthBar(ctx);
        this.drawFloorNumber(ctx);
        
        if (Game.debugMode) {
            this.drawFPS(ctx);
        }
    },
    
    drawHealthBar(ctx) {
        const x = 20;
        const y = 20;
        const width = 200;
        const height = 30;
        
        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, width, height);
        
        // Health
        const healthPercent = Player.health / Player.maxHealth;
        let color;
        if (healthPercent > 0.5) {
            color = '#4ade80'; // green
        } else if (healthPercent > 0.25) {
            color = '#facc15'; // yellow
        } else {
            color = '#ef4444'; // red
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * healthPercent, height);
        
        // Border
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.floor(Player.health)} / ${Player.maxHealth} HP`, x + width / 2, y + height / 2);
    },
    
    drawFloorNumber(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`Floor ${Dungeon.currentFloor}`, Game.canvas.width - 20, 20);
    },
    
    drawFPS(ctx) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`${Game.fps} FPS`, Game.canvas.width - 20, 60);
    },
    
    drawGameOver(ctx) {
        // Darken screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
        
        // Title
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 72px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('YOU DIED', Game.canvas.width / 2, Game.canvas.height / 2 - 50);
        
        // Stats
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText(`Floor Reached: ${Dungeon.currentFloor}`, Game.canvas.width / 2, Game.canvas.height / 2 + 30);
        
        // Restart hint
        ctx.font = '20px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Press R to Restart', Game.canvas.width / 2, Game.canvas.height / 2 + 100);
    }
};

