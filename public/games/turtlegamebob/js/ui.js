// ============================================================================
// UI SYSTEM
// HUD, inventory, menus
// ============================================================================

const UI = {
    render(ctx) {
        this.drawHealthBar(ctx);
        this.drawFloorNumber(ctx);
        this.drawEquipment(ctx);
        this.drawHints(ctx);
        
        // Draw inventory if open
        if (Inventory.isOpen) {
            this.drawInventory(ctx);
        }
        
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
    
    drawEquipment(ctx) {
        const x = 20;
        const y = 70;
        const size = 50;
        
        // Weapon slot
        this.drawSlot(ctx, x, y, size, Player.equippedWeapon, '⚔️');
        
        // Armor slot
        this.drawSlot(ctx, x + size + 10, y, size, Player.equippedArmor, '🛡️');
    },
    
    drawSlot(ctx, x, y, size, item, icon) {
        // Background
        ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
        ctx.fillRect(x, y, size, size);
        
        // Border
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
        
        if (item) {
            // Draw item sprite (small)
            Sprites.drawSprite(ctx, item.sprite, x + size / 2, y + size / 2, 1.2);
        } else {
            // Draw icon
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '24px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, x + size / 2, y + size / 2);
        }
    },
    
    drawHints(ctx) {
        const hints = [];
        
        // Stairs hint
        if (Dungeon.isOnStairs(Player.x, Player.y)) {
            hints.push('Press E to go down stairs');
        }
        
        // Item pickup hint
        if (Inventory.groundItems.some(item => distance(Player, item) < 40)) {
            hints.push('Walk over items to pick up');
        }
        
        // Inventory hint
        if (!Inventory.isOpen && Inventory.items.length > 0) {
            hints.push('Press I for inventory');
        }
        
        // Draw hints
        if (hints.length > 0) {
            const y = Game.canvas.height - 60;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            hints.forEach((hint, i) => {
                ctx.fillText(hint, Game.canvas.width / 2, y + i * 25);
            });
        }
    },
    
    toggleInventory() {
        Inventory.isOpen = !Inventory.isOpen;
        Inventory.selectedSlot = -1;
    },
    
    drawInventory(ctx) {
        const width = 400;
        const height = 300;
        const x = (Game.canvas.width - width) / 2;
        const y = (Game.canvas.height - height) / 2;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(x, y, width, height);
        
        // Border
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Title
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INVENTORY', x + width / 2, y + 30);
        
        // Instructions
        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        ctx.fillText('Click item to use/equip | Press I to close', x + width / 2, y + 60);
        
        // Item slots
        const slotSize = 70;
        const cols = 4;
        const rows = 2;
        const startX = x + (width - cols * slotSize) / 2;
        const startY = y + 90;
        
        for (let i = 0; i < Inventory.slots; i++) {
            const slotX = startX + (i % cols) * slotSize;
            const slotY = startY + Math.floor(i / cols) * slotSize;
            const item = Inventory.items[i];
            
            // Slot background
            ctx.fillStyle = item ? 'rgba(0, 212, 255, 0.1)' : 'rgba(26, 26, 46, 0.8)';
            ctx.fillRect(slotX, slotY, slotSize - 5, slotSize - 5);
            
            // Slot border
            ctx.strokeStyle = (i === Inventory.selectedSlot) ? '#ffd700' : '#00d4ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(slotX, slotY, slotSize - 5, slotSize - 5);
            
            if (item) {
                // Draw item sprite
                Sprites.drawSprite(ctx, item.sprite, slotX + slotSize / 2 - 2, slotY + slotSize / 2 - 2, 1.5);
                
                // Item name
                const itemData = Inventory.itemTypes[item.itemId];
                ctx.fillStyle = this.getRarityColor(itemData.rarity);
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(itemData.name, slotX + slotSize / 2 - 2, slotY + slotSize - 10);
                
                // Check if mouse is over slot (for click detection)
                if (Input.mouse.pressed && this.isMouseInRect(Input.mouse, {x: slotX, y: slotY, width: slotSize - 5, height: slotSize - 5})) {
                    Inventory.useItem(i);
                    Input.mouse.pressed = false; // Consume click
                }
            }
        }
    },
    
    getRarityColor(rarity) {
        switch (rarity) {
            case 'common': return '#aaa';
            case 'uncommon': return '#4ade80';
            case 'rare': return '#3b82f6';
            case 'epic': return '#a855f7';
            default: return '#fff';
        }
    },
    
    isMouseInRect(mouse, rect) {
        return mouse.x >= rect.x && mouse.x <= rect.x + rect.width &&
               mouse.y >= rect.y && mouse.y <= rect.y + rect.height;
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
