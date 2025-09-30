// UI management and interface system

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.messageLog = [];
        this.maxMessages = 50;
        
        this.initializeUI();
    }

    initializeUI() {
        // Initialize UI elements
        this.healthText = document.getElementById('health-text');
        this.manaText = document.getElementById('mana-text');
        this.oxygenText = document.getElementById('oxygen-text');
        this.levelText = document.getElementById('level-text');
        this.expText = document.getElementById('exp-text');
        this.depthText = document.getElementById('depth-text');
        this.turnText = document.getElementById('turn-text');
        this.goldText = document.getElementById('gold-text');
        
        this.healthBar = document.getElementById('health-bar');
        this.manaBar = document.getElementById('mana-bar');
        this.oxygenBar = document.getElementById('oxygen-bar');
        this.expBar = document.getElementById('exp-bar');
        
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.inventoryItems = document.getElementById('inventory-items');
        this.inventoryCount = document.getElementById('inventory-count');
        
        this.messageContent = document.getElementById('message-content');
        this.minimap = document.getElementById('minimap');
        this.minimapCtx = this.minimap?.getContext('2d');
        
        this.setupUIEventListeners();
    }

    setupUIEventListeners() {
        // Ability buttons
        const shellRetreatBtn = document.getElementById('shell-retreat-btn');
        const swimBoostBtn = document.getElementById('swim-boost-btn');
        const inventoryBtn = document.getElementById('inventory-btn');
        const identifyBtn = document.getElementById('identify-btn');
        
        if (shellRetreatBtn) {
            shellRetreatBtn.addEventListener('click', () => this.scene.useShellRetreat());
        }
        if (swimBoostBtn) {
            swimBoostBtn.addEventListener('click', () => this.scene.useSwimBoost());
        }
        if (inventoryBtn) {
            inventoryBtn.addEventListener('click', () => this.toggleInventory());
        }
        if (identifyBtn) {
            identifyBtn.addEventListener('click', () => this.scene.identifyRandomItem());
        }
    }

    updateUI() {
        if (!this.scene.gameState?.player) return;

        const health = this.scene.gameState.player.getComponent('health');
        const mana = this.scene.gameState.player.getComponent('mana');
        const oxygen = this.scene.gameState.player.getComponent('oxygen');
        const stats = this.scene.gameState.player.getComponent('stats');

        if (health && this.healthText) {
            this.healthText.textContent = `${health.currentHealth}/${health.maxHealth}`;
            this.updateBar(this.healthBar, health.currentHealth, health.maxHealth);
        }

        if (mana && this.manaText) {
            this.manaText.textContent = `${mana.currentMana}/${mana.maxMana}`;
            this.updateBar(this.manaBar, mana.currentMana, mana.maxMana);
        }

        if (oxygen && this.oxygenText) {
            this.oxygenText.textContent = `${oxygen.currentOxygen}/${oxygen.maxOxygen}`;
            this.updateBar(this.oxygenBar, oxygen.currentOxygen, oxygen.maxOxygen);
        }

        if (stats) {
            if (this.levelText) this.levelText.textContent = stats.level;
            if (this.expText) this.expText.textContent = `${stats.experience}/${stats.experienceToNext}`;
            if (this.goldText) this.goldText.textContent = stats.gold;
            this.updateBar(this.expBar, stats.experience, stats.experienceToNext);
        }

        if (this.depthText) this.depthText.textContent = this.scene.gameState.currentDepth;
        if (this.turnText) this.turnText.textContent = this.scene.gameState.turnCount || 1;

        this.updateInventoryDisplay();
    }

    updateBar(barElement, current, max) {
        if (!barElement) return;
        const percentage = Math.max(0, Math.min(100, (current / max) * 100));
        barElement.style.width = `${percentage}%`;
    }

    addMessage(text, color = '#ffffff') {
        this.messageLog.push({ text, color, timestamp: Date.now() });
        
        // Keep only recent messages
        if (this.messageLog.length > this.maxMessages) {
            this.messageLog.shift();
        }
        
        this.updateMessageDisplay();
    }

    updateMessageDisplay() {
        if (!this.messageContent) return;
        
        const recentMessages = this.messageLog.slice(-10); // Show last 10 messages
        this.messageContent.innerHTML = recentMessages
            .map(msg => `<div style="color: ${msg.color}; margin: 2px 0;">${msg.text}</div>`)
            .join('');
        
        // Auto-scroll to bottom
        this.messageContent.scrollTop = this.messageContent.scrollHeight;
    }

    updateInventoryDisplay() {
        if (!this.inventoryItems || !this.scene.gameState) return;

        const inventory = this.scene.gameState.inventory || [];
        
        if (this.inventoryCount) {
            this.inventoryCount.textContent = inventory.length;
        }

        if (inventory.length === 0) {
            this.inventoryItems.innerHTML = '<div style="color: #95a5a6;">No items</div>';
            return;
        }

        this.inventoryItems.innerHTML = inventory.map((item, index) => {
            const identified = item.identified || this.scene.gameState.identifiedItems.has(item.name);
            const rarityColor = this.getRarityColor(item.rarity);
            const itemClass = identified ? 'item-identified' : 'item-unidentified';
            
            return `
                <div class="item-slot ${itemClass}" onclick="window.gameInstance.scene.scenes[0].selectItem(${index})" style="border-color: ${rarityColor};">
                    <div style="font-weight: bold; color: ${rarityColor};">
                        ${identified ? item.name : '??? ' + (item.type || 'Item')}
                    </div>
                    ${identified && item.description ? `<div style="font-size: 10px; color: #bdc3c7;">${item.description}</div>` : ''}
                    ${identified && item.attack ? `<div style="color: #e74c3c;">+${item.attack} Attack</div>` : ''}
                    ${identified && item.defense ? `<div style="color: #3498db;">+${item.defense} Defense</div>` : ''}
                    ${identified && item.bonus ? `<div style="color: #f39c12;">+${item.bonus.value} ${item.bonus.stat}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    getRarityColor(rarity) {
        const colors = {
            'common': '#95a5a6',
            'uncommon': '#2ecc71',
            'rare': '#3498db',
            'epic': '#9b59b6',
            'legendary': '#f1c40f'
        };
        return colors[rarity] || '#ffffff';
    }

    toggleInventory() {
        if (!this.inventoryPanel) return;
        
        const isVisible = this.inventoryPanel.style.display !== 'none';
        this.inventoryPanel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.updateInventoryDisplay();
        }
    }

    updateMinimap() {
        if (!this.minimapCtx || !this.scene.gameState?.gameMap) return;

        const ctx = this.minimapCtx;
        const map = this.scene.gameState.gameMap;
        const mapWidth = map.length;
        const mapHeight = map[0]?.length || 0;
        
        const canvasWidth = this.minimap.width;
        const canvasHeight = this.minimap.height;
        
        const scaleX = canvasWidth / mapWidth;
        const scaleY = canvasHeight / mapHeight;
        
        // Clear canvas
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw map tiles
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                const tile = map[x][y];
                let color = '#2c3e50'; // Default (void)
                
                switch (tile) {
                    case 1: color = '#34495e'; break; // Floor
                    case 2: color = '#7f8c8d'; break; // Wall
                    case 3: color = '#f39c12'; break; // Stairs
                    case 4: color = '#3498db'; break; // Water
                    case 5: color = '#2980b9'; break; // Deep water
                    case 6: color = '#1abc9c'; break; // Air pocket
                    case 7: color = '#f1c40f'; break; // Treasure floor
                }
                
                ctx.fillStyle = color;
                ctx.fillRect(
                    Math.floor(x * scaleX),
                    Math.floor(y * scaleY),
                    Math.ceil(scaleX),
                    Math.ceil(scaleY)
                );
            }
        }
        
        // Draw player position
        if (this.scene.gameState.player) {
            const playerPos = this.scene.gameState.player.getComponent('transform');
            if (playerPos) {
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(
                    Math.floor(playerPos.x * scaleX) - 1,
                    Math.floor(playerPos.y * scaleY) - 1,
                    3,
                    3
                );
            }
        }
        
        // Draw entities
        if (this.scene.gameState.entities) {
            this.scene.gameState.entities.forEach(entity => {
                if (entity.type === 'enemy') {
                    ctx.fillStyle = '#e67e22';
                    ctx.fillRect(
                        Math.floor(entity.x * scaleX),
                        Math.floor(entity.y * scaleY),
                        2,
                        2
                    );
                } else if (entity.type === 'item') {
                    ctx.fillStyle = '#9b59b6';
                    ctx.fillRect(
                        Math.floor(entity.x * scaleX),
                        Math.floor(entity.y * scaleY),
                        1,
                        1
                    );
                }
            });
        }
    }

    showAchievementNotification(achievement) {
        // Create floating achievement notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            z-index: 9999;
            text-align: center;
            border: 3px solid #f1c40f;
            animation: achievementPop 3s ease-in-out forwards;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 5px;">🏆</div>
            <div style="font-size: 18px; margin-bottom: 5px;">ACHIEVEMENT UNLOCKED!</div>
            <div style="font-size: 14px;">${achievement.name}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        // Add CSS animation if not exists
        if (!document.getElementById('achievement-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-styles';
            style.textContent = `
                @keyframes achievementPop {
                    0% { transform: translate(-50%, -50%) scale(0) rotate(180deg); opacity: 0; }
                    10% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); opacity: 1; }
                    20% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
                    80% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0.8) rotate(0deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}
