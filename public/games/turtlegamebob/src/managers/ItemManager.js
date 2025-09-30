// Item generation and management system

import { ITEM_TYPES, RARITY_COLORS } from '../config/Constants.js';

export class ItemManager {
    constructor(scene) {
        this.scene = scene;
        this.itemData = this.initializeItemData();
    }

    initializeItemData() {
        return {
            weapons: [
                { name: 'Rusted Dagger', attack: 3, description: 'A corroded blade, still sharp enough to wound.' },
                { name: 'Iron Sword', attack: 6, description: 'A sturdy iron blade, reliable in combat.' },
                { name: 'Steel Spear', attack: 8, description: 'A long reach weapon, perfect for keeping enemies at bay.' },
                { name: 'Coral Trident', attack: 10, description: 'A magical trident infused with sea power.' },
                { name: 'Tidal Blade', attack: 12, description: 'A sword that flows like water, cutting through anything.' },
                { name: 'Poseidon\'s Fury', attack: 15, description: 'Legendary weapon of the sea god himself.' }
            ],
            armor: [
                { name: 'Tattered Cloth', defense: 2, description: 'Worn fabric that offers minimal protection.' },
                { name: 'Leather Vest', defense: 4, description: 'Supple leather that absorbs some blows.' },
                { name: 'Chain Mail', defense: 6, description: 'Interlocked metal rings provide solid defense.' },
                { name: 'Scale Armor', defense: 8, description: 'Overlapping scales like a turtle\'s shell.' },
                { name: 'Plate Armor', defense: 10, description: 'Heavy metal plates offering excellent protection.' },
                { name: 'Turtle Shell Armor', defense: 12, description: 'Ancient shell armor blessed by turtle spirits.' }
            ],
            potions: [
                { name: 'Health Potion', effect: 'healing', value: 30, description: 'Restores 30 health when consumed.' },
                { name: 'Greater Health Potion', effect: 'healing', value: 60, description: 'Restores 60 health when consumed.' },
                { name: 'Mana Potion', effect: 'mana', value: 25, description: 'Restores 25 mana when consumed.' },
                { name: 'Oxygen Elixir', effect: 'oxygen', value: 50, description: 'Restores 50 oxygen when consumed.' },
                { name: 'Strength Potion', effect: 'temp_attack', value: 5, description: 'Temporarily increases attack by 5.' },
                { name: 'Defense Potion', effect: 'temp_defense', value: 3, description: 'Temporarily increases defense by 3.' }
            ],
            accessories: [
                { name: 'Ring of Health', bonus: { stat: 'health', value: 15 }, description: 'Increases maximum health.' },
                { name: 'Ring of Mana', bonus: { stat: 'mana', value: 10 }, description: 'Increases maximum mana.' },
                { name: 'Ring of Strength', bonus: { stat: 'attack', value: 3 }, description: 'Increases attack power.' },
                { name: 'Ring of Protection', bonus: { stat: 'defense', value: 2 }, description: 'Increases defensive capabilities.' },
                { name: 'Amulet of Swimming', bonus: { stat: 'oxygen', value: 25 }, description: 'Increases oxygen capacity.' },
                { name: 'Band of Fortune', bonus: { stat: 'gold_find', value: 20 }, description: 'Increases gold found from enemies.' }
            ],
            scrolls: [
                { name: 'Scroll of Healing', effect: 'heal_full', description: 'Instantly restores all health.' },
                { name: 'Scroll of Teleport', effect: 'teleport', description: 'Teleports you to a random safe location.' },
                { name: 'Scroll of Identify', effect: 'identify_all', description: 'Identifies all items in your inventory.' },
                { name: 'Scroll of Mapping', effect: 'reveal_map', description: 'Reveals the entire floor layout.' },
                { name: 'Scroll of Enchantment', effect: 'enchant_item', description: 'Improves a random equipped item.' }
            ]
        };
    }

    generateItems() {
        const depth = this.scene.gameState.currentDepth;
        const rooms = this.scene.gameState.rooms;
        
        // Generate items in random locations
        const itemCount = 3 + Math.floor(Math.random() * 5) + Math.floor(depth / 2);
        
        for (let i = 0; i < itemCount; i++) {
            const room = rooms[Math.floor(Math.random() * rooms.length)];
            const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
            const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
            
            // Make sure the tile is floor
            if (this.scene.gameState.gameMap[x][y] === 1) {
                this.createRandomItem(x, y);
            }
        }
        
        console.log(`🎒 Generated ${itemCount} items for depth ${depth}`);
    }

    createRandomItem(x, y) {
        const depth = this.scene.gameState.currentDepth;
        const itemTypes = ['weapons', 'armor', 'potions', 'accessories', 'scrolls'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        let itemPool = this.itemData[itemType];
        let selectedItem;
        
        // Higher depth = better items
        if (depth > 3) {
            // Filter to higher tier items at deeper levels
            const tierFilter = Math.min(Math.floor(depth / 2), itemPool.length - 1);
            itemPool = itemPool.slice(tierFilter);
        }
        
        selectedItem = itemPool[Math.floor(Math.random() * itemPool.length)];
        
        // Create item entity
        this.createItem(x, y, selectedItem, itemType);
    }

    createItem(x, y, itemData, itemType) {
        // Determine sprite based on item type
        let textureKey = 'item_gold'; // Fallback
        
        switch (itemType) {
            case 'weapons':
                textureKey = this.scene.textures.exists('item_weapon') ? 'item_weapon' : 'item_gold';
                break;
            case 'armor':
                textureKey = this.scene.textures.exists('item_armor') ? 'item_armor' : 'item_gold';
                break;
            case 'potions':
                textureKey = this.scene.textures.exists('item_potion') ? 'item_potion' : 'item_gold';
                break;
            case 'accessories':
                textureKey = this.scene.textures.exists('item_ring') ? 'item_ring' : 'item_gold';
                break;
            case 'scrolls':
                textureKey = this.scene.textures.exists('item_scroll') ? 'item_scroll' : 'item_gold';
                break;
        }
        
        const sprite = this.scene.add.sprite(
            x * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            y * this.scene.gameConfig.TILE_SIZE + this.scene.gameConfig.TILE_SIZE/2,
            textureKey
        );
        sprite.setScale(1.0);
        sprite.setDepth(80);
        
        // Determine rarity and identification status
        const rarity = this.determineItemRarity(itemData, this.scene.gameState.currentDepth);
        const autoIdentified = !this.requiresIdentification({rarity});
        
        const item = {
            type: 'item',
            x: x,
            y: y,
            sprite: sprite,
            itemData: {
                ...itemData,
                type: itemType.slice(0, -1), // Remove 's' from plural
                rarity: rarity,
                identified: autoIdentified,
                cursed: Math.random() < 0.1, // 10% chance of curse
                originalPrice: this.estimateItemValue(itemData, rarity)
            }
        };
        
        this.scene.gameState.entities.push(item);
        return item;
    }

    determineItemRarity(itemData, depth) {
        // Base rarity chances (higher depth = better items)
        const rarityRoll = Math.random() + (depth * 0.03); // Depth bonus
        
        if (rarityRoll < 0.6) return 'common';      // 60% base
        if (rarityRoll < 0.85) return 'uncommon';   // 25% base
        if (rarityRoll < 0.95) return 'rare';       // 10% base
        if (rarityRoll < 0.99) return 'epic';       // 4% base
        return 'legendary';                          // 1% base
    }

    requiresIdentification(item) {
        // Only rare and above items need identification
        if (!item.rarity) return false;
        return ['rare', 'epic', 'legendary'].includes(item.rarity);
    }

    estimateItemValue(itemData, rarity) {
        let baseValue = 20;
        
        if (itemData.attack) baseValue += itemData.attack * 8;
        if (itemData.defense) baseValue += itemData.defense * 6;
        if (itemData.value) baseValue += itemData.value * 2;
        if (itemData.bonus) baseValue += itemData.bonus.value * 4;
        
        const rarityMultiplier = {
            'common': 1,
            'uncommon': 1.5,
            'rare': 2.5,
            'epic': 4,
            'legendary': 8
        };
        
        return Math.floor(baseValue * (rarityMultiplier[rarity] || 1));
    }

    pickupItem(itemEntity) {
        if (!itemEntity || !itemEntity.itemData) return false;
        
        const inventory = this.scene.gameState.inventory;
        
        // Check inventory space
        if (inventory.length >= 20) {
            this.scene.gameState.addMessage('🎒 Your inventory is full!', '#e74c3c');
            return false;
        }
        
        // Add to inventory
        inventory.push(itemEntity.itemData);
        
        // Remove from world
        if (itemEntity.sprite) {
            itemEntity.sprite.destroy();
        }
        
        const entityIndex = this.scene.gameState.entities.indexOf(itemEntity);
        if (entityIndex > -1) {
            this.scene.gameState.entities.splice(entityIndex, 1);
        }
        
        // Update stats
        this.scene.gameState.stats.itemsFound++;
        
        // Show pickup message
        const rarity = itemEntity.itemData.rarity;
        const rarityColor = RARITY_COLORS[rarity] || '#ffffff';
        this.scene.gameState.addMessage(
            `📦 Picked up ${itemEntity.itemData.name}!`, 
            rarityColor
        );
        
        // Auto-equip if better than current equipment
        this.autoEquip(itemEntity.itemData);
        
        // Update UI
        this.scene.gameState.updateInventoryDisplay();
        this.scene.uiManager.updateUI();
        
        // Play pickup sound
        this.scene.audioManager.playSpatialSound('pickup', itemEntity.x, itemEntity.y);
        
        return true;
    }

    autoEquip(item) {
        if (!item || item.type === 'potion' || item.type === 'scroll') return;
        
        const equipment = this.scene.gameState.equipment;
        const playerStats = this.scene.gameState.player.getComponent('stats');
        
        let shouldEquip = false;
        let equipSlot = null;
        
        switch (item.type) {
            case 'weapon':
                equipSlot = 'weapon';
                shouldEquip = !equipment.weapon || 
                    (item.attack || 0) > (equipment.weapon.attack || 0);
                break;
            case 'armor':
                equipSlot = 'armor';
                shouldEquip = !equipment.armor || 
                    (item.defense || 0) > (equipment.armor.defense || 0);
                break;
            case 'accessory':
            case 'ring':
                equipSlot = 'ring';
                shouldEquip = !equipment.ring;
                break;
        }
        
        if (shouldEquip && equipSlot) {
            // Unequip current item
            if (equipment[equipSlot]) {
                this.unequipItem(equipSlot);
            }
            
            // Equip new item
            equipment[equipSlot] = item;
            this.applyItemBonuses(item, true);
            
            this.scene.gameState.addMessage(
                `⚡ Equipped ${item.name}!`, 
                '#2ecc71'
            );
            
            // Remove from inventory since it's now equipped
            const invIndex = this.scene.gameState.inventory.indexOf(item);
            if (invIndex > -1) {
                this.scene.gameState.inventory.splice(invIndex, 1);
            }
        }
    }

    unequipItem(slot) {
        const equipment = this.scene.gameState.equipment;
        const item = equipment[slot];
        
        if (!item) return;
        
        // Remove bonuses
        this.applyItemBonuses(item, false);
        
        // Add back to inventory if there's space
        if (this.scene.gameState.inventory.length < 20) {
            this.scene.gameState.inventory.push(item);
        } else {
            this.scene.gameState.addMessage(
                `💼 ${item.name} dropped due to full inventory!`, 
                '#e74c3c'
            );
        }
        
        equipment[slot] = null;
    }

    applyItemBonuses(item, apply = true) {
        const multiplier = apply ? 1 : -1;
        const health = this.scene.gameState.player.getComponent('health');
        const mana = this.scene.gameState.player.getComponent('mana');
        const oxygen = this.scene.gameState.player.getComponent('oxygen');
        const stats = this.scene.gameState.player.getComponent('stats');
        
        if (item.attack) {
            stats.attack += item.attack * multiplier;
        }
        
        if (item.defense) {
            stats.defense += item.defense * multiplier;
        }
        
        if (item.bonus) {
            switch (item.bonus.stat) {
                case 'health':
                    const healthBonus = item.bonus.value * multiplier;
                    health.maxHealth += healthBonus;
                    if (apply) health.currentHealth += healthBonus;
                    break;
                case 'mana':
                    const manaBonus = item.bonus.value * multiplier;
                    mana.maxMana += manaBonus;
                    if (apply) mana.currentMana += manaBonus;
                    break;
                case 'oxygen':
                    const oxygenBonus = item.bonus.value * multiplier;
                    oxygen.maxOxygen += oxygenBonus;
                    if (apply) oxygen.currentOxygen += oxygenBonus;
                    break;
                case 'attack':
                    stats.attack += item.bonus.value * multiplier;
                    break;
                case 'defense':
                    stats.defense += item.bonus.value * multiplier;
                    break;
            }
        }
    }

    useConsumable(item) {
        if (!item || (item.type !== 'potion' && item.type !== 'scroll')) {
            return false;
        }
        
        const health = this.scene.gameState.player.getComponent('health');
        const mana = this.scene.gameState.player.getComponent('mana');
        const oxygen = this.scene.gameState.player.getComponent('oxygen');
        
        let used = false;
        
        switch (item.effect) {
            case 'healing':
                if (health.currentHealth < health.maxHealth) {
                    health.currentHealth = Math.min(
                        health.maxHealth,
                        health.currentHealth + item.value
                    );
                    this.scene.gameState.addMessage(
                        `❤️ Restored ${item.value} health!`, 
                        '#e74c3c'
                    );
                    used = true;
                }
                break;
            case 'mana':
                if (mana.currentMana < mana.maxMana) {
                    mana.currentMana = Math.min(
                        mana.maxMana,
                        mana.currentMana + item.value
                    );
                    this.scene.gameState.addMessage(
                        `💙 Restored ${item.value} mana!`, 
                        '#3498db'
                    );
                    used = true;
                }
                break;
            case 'oxygen':
                if (oxygen.currentOxygen < oxygen.maxOxygen) {
                    oxygen.currentOxygen = Math.min(
                        oxygen.maxOxygen,
                        oxygen.currentOxygen + item.value
                    );
                    this.scene.gameState.addMessage(
                        `🫧 Restored ${item.value} oxygen!`, 
                        '#1abc9c'
                    );
                    used = true;
                }
                break;
        }
        
        if (used) {
            // Remove item from inventory
            const invIndex = this.scene.gameState.inventory.indexOf(item);
            if (invIndex > -1) {
                this.scene.gameState.inventory.splice(invIndex, 1);
            }
            
            this.scene.gameState.updateInventoryDisplay();
            this.scene.uiManager.updateUI();
            
            // Play use sound
            this.scene.audioManager.playSpatialSound('pickup', 0, 0);
        }
        
        return used;
    }
}
