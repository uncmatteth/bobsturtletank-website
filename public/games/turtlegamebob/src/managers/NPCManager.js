// NPC generation and interaction management

import { ENTITY_TYPES, IDENTIFICATION_COSTS } from '../config/Constants.js';

export class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
    }

    generateNPCs() {
        // Generate merchants in merchant rooms
        this.scene.gameState.rooms.forEach(room => {
            if (room.isMerchantRoom) {
                this.createMerchant(room.merchantX, room.merchantY);
            }
        });

        // Occasionally spawn other NPCs
        if (Math.random() < 0.3) {
            this.spawnRandomNPC();
        }
    }

    createMerchant(x, y) {
        const sprite = this.scene.add.sprite(
            x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            y * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            'merchant_turtle_south'
        );
        sprite.setScale(1.0);
        sprite.setDepth(90);

        const merchant = {
            type: ENTITY_TYPES.MERCHANT,
            x: x,
            y: y,
            sprite: sprite,
            npcType: 'merchant',
            name: 'Merchant Turtle',
            dialogue: [
                'Welcome to my shop! I have wares if you have coin.',
                'Looking for equipment? I have the finest gear!',
                'Gold speaks louder than words, friend.'
            ],
            services: ['buy_items', 'sell_equipment']
        };

        this.npcs.push(merchant);
        this.scene.gameState.entities.push(merchant);
        
        this.scene.gameState.addMessage('🛒 A merchant has set up shop in this room!', '#f39c12');
        return merchant;
    }

    createScholar(x, y) {
        const sprite = this.scene.add.sprite(
            x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            y * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            'scholar_turtle_south'
        );
        sprite.setScale(1.0);
        sprite.setDepth(90);

        const scholar = {
            type: ENTITY_TYPES.MERCHANT,
            x: x,
            y: y,
            sprite: sprite,
            npcType: 'scholar',
            name: 'Scholar Turtle',
            dialogue: [
                'Ah, a fellow seeker of knowledge!',
                'I can identify magical items... for a price.',
                'Knowledge is power, but power costs gold.'
            ],
            services: ['identify_items']
        };

        this.npcs.push(scholar);
        this.scene.gameState.entities.push(scholar);
        
        this.scene.gameState.addMessage('📚 A wise scholar offers identification services!', '#9b59b6');
        return scholar;
    }

    createHealer(x, y) {
        const sprite = this.scene.add.sprite(
            x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            y * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            'healer_turtle_south'
        );
        sprite.setScale(1.0);
        sprite.setDepth(90);

        const healer = {
            type: ENTITY_TYPES.MERCHANT,
            x: x,
            y: y,
            sprite: sprite,
            npcType: 'healer',
            name: 'Healer Turtle',
            dialogue: [
                'Your wounds look painful. I can help.',
                'Healing magic flows through these waters.',
                'Health is wealth, my friend.'
            ],
            services: ['healing', 'restoration']
        };

        this.npcs.push(healer);
        this.scene.gameState.entities.push(healer);
        
        this.scene.gameState.addMessage('❤️ A healer offers restoration services!', '#e74c3c');
        return healer;
    }

    spawnRandomNPC() {
        const availableRooms = this.scene.gameState.rooms.filter(room => 
            !room.isTreasureRoom && !room.isMerchantRoom
        );
        
        if (availableRooms.length === 0) return;

        const room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        const centerX = Math.floor(room.x + room.width / 2);
        const centerY = Math.floor(room.y + room.height / 2);

        const npcTypes = ['scholar', 'healer'];
        const npcType = npcTypes[Math.floor(Math.random() * npcTypes.length)];

        switch (npcType) {
            case 'scholar':
                this.createScholar(centerX, centerY);
                break;
            case 'healer':
                this.createHealer(centerX, centerY);
                break;
        }
    }

    interactWithNPC(npc) {
        if (!npc || !npc.npcType) return;

        switch (npc.npcType) {
            case 'merchant':
                this.openMerchantMenu(npc);
                break;
            case 'scholar':
                this.openScholarMenu(npc);
                break;
            case 'healer':
                this.openHealerMenu(npc);
                break;
        }
    }

    openScholarMenu(scholar) {
        // Show identification services
        const unidentified = this.scene.gameState.inventory.filter(item => 
            !item.identified && 
            !this.scene.gameState.identifiedItems.has(item.name) &&
            this.requiresIdentification(item)
        );

        if (unidentified.length === 0) {
            this.scene.gameState.addMessage('📚 "You have no magical items that need identification."', '#9b59b6');
            return;
        }

        // For now, identify the first unidentified item
        const item = unidentified[0];
        const cost = IDENTIFICATION_COSTS[item.rarity] || 25;

        if (this.scene.gameState.gold < cost) {
            this.scene.gameState.addMessage(`📚 "You need ${cost} gold for this identification."`, '#e74c3c');
            return;
        }

        // Perform identification
        this.scene.gameState.gold -= cost;
        this.scene.gameState.identifiedItems.add(item.name);
        
        this.scene.gameState.addMessage(`📚 "Ah yes, this is ${item.name}!" (-${cost} gold)`, '#2ecc71');
        this.scene.gameState.addMessage(`📝 ${item.description || 'A mysterious magical item.'}`, '#3498db');
        this.scene.gameState.updateInventoryDisplay();
        this.scene.uiManager.updateUI();
    }

    requiresIdentification(item) {
        if (!item.rarity) return false;
        return ['rare', 'epic', 'legendary'].includes(item.rarity);
    }

    openMerchantMenu(merchant) {
        // Generate merchant inventory if not exists
        if (!merchant.inventory) {
            merchant.inventory = this.generateMerchantInventory();
        }

        this.scene.gameState.addMessage('🛒 "Welcome to my shop! What can I do for you?"', '#f39c12');
        this.scene.gameState.addMessage('💰 [B]uy items, [S]ell equipment, or [L]eave', '#f39c12');
        
        // Show merchant options
        this.showMerchantInventory(merchant);
    }

    generateMerchantInventory() {
        const depth = this.scene.gameState.currentDepth;
        const inventory = [];

        // Generate 3-6 items for sale
        const itemCount = 3 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < itemCount; i++) {
            const item = this.generateMerchantItem(depth);
            inventory.push(item);
        }

        return inventory;
    }

    generateMerchantItem(depth) {
        const itemTypes = ['weapon', 'armor', 'potion', 'accessory'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        let item;
        switch (itemType) {
            case 'weapon':
                item = {
                    name: this.getRandomWeaponName(),
                    type: 'weapon',
                    attack: 5 + Math.floor(depth * 2) + Math.floor(Math.random() * 5),
                    price: 100 + (depth * 25) + Math.floor(Math.random() * 50),
                    rarity: this.getRandomRarity(depth),
                    description: 'A reliable weapon for underwater combat'
                };
                break;
            case 'armor':
                item = {
                    name: this.getRandomArmorName(),
                    type: 'armor',
                    defense: 3 + Math.floor(depth * 1.5) + Math.floor(Math.random() * 4),
                    price: 80 + (depth * 20) + Math.floor(Math.random() * 40),
                    rarity: this.getRandomRarity(depth),
                    description: 'Protective gear suited for aquatic environments'
                };
                break;
            case 'potion':
                item = {
                    name: this.getRandomPotionName(),
                    type: 'potion',
                    effect: 'healing',
                    value: 30 + Math.floor(depth * 10),
                    price: 20 + (depth * 5) + Math.floor(Math.random() * 15),
                    rarity: 'common',
                    description: 'Restores health when consumed'
                };
                break;
            case 'accessory':
                item = {
                    name: this.getRandomAccessoryName(),
                    type: 'ring',
                    bonus: this.getRandomBonus(),
                    price: 150 + (depth * 30) + Math.floor(Math.random() * 75),
                    rarity: this.getRandomRarity(depth),
                    description: 'A magical accessory with special properties'
                };
                break;
        }

        item.identified = true; // Merchant items are always identified
        return item;
    }

    getRandomWeaponName() {
        const names = [
            'Coral Trident', 'Seaweed Spear', 'Barnacle Blade', 'Tidal Sword',
            'Kelp Whip', 'Pearl Dagger', 'Starfish Mace', 'Nautilus Shell Shield'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomArmorName() {
        const names = [
            'Turtle Shell Armor', 'Scales of Protection', 'Seaweed Cloak',
            'Coral Plate Mail', 'Jellyfish Robe', 'Crab Shell Helmet'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomPotionName() {
        const names = [
            'Healing Kelp Extract', 'Restorative Sea Water', 'Vitality Algae',
            'Regeneration Potion', 'Health Tonic'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomAccessoryName() {
        const names = [
            'Ring of Depths', 'Amulet of Swimming', 'Band of Strength',
            'Circle of Wisdom', 'Loop of Fortune', 'Seal of Power'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomRarity(depth) {
        const rarityRoll = Math.random() + (depth * 0.02);
        if (rarityRoll < 0.7) return 'common';
        if (rarityRoll < 0.9) return 'uncommon';
        if (rarityRoll < 0.97) return 'rare';
        if (rarityRoll < 0.99) return 'epic';
        return 'legendary';
    }

    getRandomBonus() {
        const bonuses = [
            { stat: 'health', value: 10 + Math.floor(Math.random() * 20) },
            { stat: 'mana', value: 5 + Math.floor(Math.random() * 15) },
            { stat: 'attack', value: 2 + Math.floor(Math.random() * 8) },
            { stat: 'defense', value: 2 + Math.floor(Math.random() * 6) },
            { stat: 'oxygen', value: 15 + Math.floor(Math.random() * 25) }
        ];
        return bonuses[Math.floor(Math.random() * bonuses.length)];
    }

    showMerchantInventory(merchant) {
        this.scene.gameState.addMessage('📦 Available items:', '#f39c12');
        
        merchant.inventory.forEach((item, index) => {
            const rarityColor = this.getRarityColor(item.rarity);
            const itemDesc = `${index + 1}. ${item.name} - ${item.price}g`;
            this.scene.gameState.addMessage(`   ${itemDesc}`, rarityColor);
        });
        
        this.scene.gameState.addMessage('💡 Type item number to buy, or "sell" to sell items', '#95a5a6');
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

    buyItem(merchant, itemIndex) {
        if (!merchant.inventory || itemIndex < 0 || itemIndex >= merchant.inventory.length) {
            this.scene.gameState.addMessage('🛒 "Invalid item selection."', '#e74c3c');
            return;
        }

        const item = merchant.inventory[itemIndex];
        
        if (this.scene.gameState.gold < item.price) {
            this.scene.gameState.addMessage(`🛒 "You need ${item.price} gold for that item."`, '#e74c3c');
            return;
        }

        if (this.scene.gameState.inventory.length >= 20) {
            this.scene.gameState.addMessage('🛒 "Your inventory is full!"', '#e74c3c');
            return;
        }

        // Purchase item
        this.scene.gameState.gold -= item.price;
        this.scene.gameState.inventory.push(item);
        merchant.inventory.splice(itemIndex, 1);

        this.scene.gameState.addMessage(`🛒 "Excellent choice! Here's your ${item.name}." (-${item.price}g)`, '#2ecc71');
        this.scene.gameState.stats.itemsFound++;
        this.scene.gameState.updateInventoryDisplay();
        this.scene.uiManager.updateUI();
    }

    sellItem(merchant, playerItemIndex) {
        if (playerItemIndex < 0 || playerItemIndex >= this.scene.gameState.inventory.length) {
            this.scene.gameState.addMessage('🛒 "Invalid item selection."', '#e74c3c');
            return;
        }

        const item = this.scene.gameState.inventory[playerItemIndex];
        
        // Can't sell consumables like potions
        if (item.type === 'potion' || item.type === 'scroll') {
            this.scene.gameState.addMessage('🛒 "I don\'t buy consumable items."', '#e74c3c');
            return;
        }

        // Calculate sell price (usually 50% of original value)
        const sellPrice = Math.floor((item.originalPrice || this.estimateItemValue(item)) * 0.5);
        
        // Sell item
        this.scene.gameState.gold += sellPrice;
        this.scene.gameState.inventory.splice(playerItemIndex, 1);

        this.scene.gameState.addMessage(`🛒 "I'll take that ${item.name} for ${sellPrice} gold."`, '#2ecc71');
        this.scene.gameState.updateInventoryDisplay();
        this.scene.uiManager.updateUI();
    }

    estimateItemValue(item) {
        let baseValue = 50;
        
        if (item.attack) baseValue += item.attack * 10;
        if (item.defense) baseValue += item.defense * 8;
        if (item.bonus) baseValue += item.bonus.value * 5;
        
        const rarityMultiplier = {
            'common': 1,
            'uncommon': 1.5,
            'rare': 2.5,
            'epic': 4,
            'legendary': 8
        };
        
        return Math.floor(baseValue * (rarityMultiplier[item.rarity] || 1));
    }

    openHealerMenu(healer) {
        const health = this.scene.gameState.player.getComponent('health');
        const healCost = 30;

        if (health.currentHealth >= health.maxHealth) {
            this.scene.gameState.addMessage('❤️ "You are already at full health!"', '#e74c3c');
            return;
        }

        if (this.scene.gameState.gold < healCost) {
            this.scene.gameState.addMessage(`❤️ "Healing costs ${healCost} gold."`, '#e74c3c');
            return;
        }

        // Perform healing
        this.scene.gameState.gold -= healCost;
        health.currentHealth = health.maxHealth;
        
        this.scene.gameState.addMessage(`❤️ "Your wounds are healed!" (-${healCost} gold)`, '#2ecc71');
        this.scene.uiManager.updateUI();
    }
}
