// ============================================================================
// INVENTORY & ITEM SYSTEM
// Items, equipment, pickups
// ============================================================================

const Inventory = {
    slots: 8,
    items: [],
    groundItems: [],
    isOpen: false,
    selectedSlot: -1,
    
    // Item definitions
    itemTypes: {
        // Weapons
        'sword1': {
            name: 'Iron Sword',
            type: 'weapon',
            damage: 10,
            sprite: 'sword1',
            rarity: 'common'
        },
        'sword2': {
            name: 'Steel Sword',
            type: 'weapon',
            damage: 15,
            sprite: 'sword2',
            rarity: 'uncommon'
        },
        'axe': {
            name: 'Battle Axe',
            type: 'weapon',
            damage: 20,
            sprite: 'axe',
            rarity: 'rare'
        },
        'goldensword': {
            name: 'Golden Sword',
            type: 'weapon',
            damage: 30,
            sprite: 'goldensword',
            rarity: 'epic'
        },
        
        // Armor
        'clotharmor': {
            name: 'Cloth Armor',
            type: 'armor',
            defense: 5,
            sprite: 'clotharmor',
            rarity: 'common'
        },
        'leatherarmor': {
            name: 'Leather Armor',
            type: 'armor',
            defense: 10,
            sprite: 'leatherarmor',
            rarity: 'uncommon'
        },
        'mailarmor': {
            name: 'Chain Mail',
            type: 'armor',
            defense: 15,
            sprite: 'mailarmor',
            rarity: 'rare'
        },
        'platearmor': {
            name: 'Plate Armor',
            type: 'armor',
            defense: 25,
            sprite: 'platearmor',
            rarity: 'epic'
        },
        
        // Consumables
        'health_potion': {
            name: 'Health Potion',
            type: 'consumable',
            heal: 50,
            sprite: 'health_potion',
            rarity: 'common'
        }
    },
    
    addItem(item) {
        if (this.items.length >= this.slots) {
            console.log('Inventory full!');
            return false;
        }
        this.items.push(item);
        console.log(`Picked up ${item.name}`);
        return true;
    },
    
    removeItem(index) {
        if (index < 0 || index >= this.items.length) return null;
        return this.items.splice(index, 1)[0];
    },
    
    useItem(index) {
        const item = this.items[index];
        if (!item) return;
        
        const itemData = this.itemTypes[item.id];
        
        switch (itemData.type) {
            case 'weapon':
                // Unequip old weapon
                if (Player.equippedWeapon) {
                    this.addItem(Player.equippedWeapon);
                }
                // Equip new weapon
                Player.equippedWeapon = item;
                Player.damage = 20 + itemData.damage;
                this.removeItem(index);
                console.log(`Equipped ${itemData.name} (+${itemData.damage} damage)`);
                break;
                
            case 'armor':
                // Unequip old armor
                if (Player.equippedArmor) {
                    this.addItem(Player.equippedArmor);
                }
                // Equip new armor
                Player.equippedArmor = item;
                Player.defense = itemData.defense;
                this.removeItem(index);
                console.log(`Equipped ${itemData.name} (+${itemData.defense} defense)`);
                break;
                
            case 'consumable':
                Player.heal(itemData.heal);
                this.removeItem(index);
                console.log(`Used ${itemData.name} (+${itemData.heal} HP)`);
                break;
        }
    },
    
    dropItem(x, y, itemId) {
        const itemData = this.itemTypes[itemId];
        if (!itemData) return;
        
        this.groundItems.push({
            id: generateId(),
            itemId: itemId,
            name: itemData.name,
            sprite: itemData.sprite,
            x: x,
            y: y
        });
    },
    
    checkPickups() {
        for (let i = this.groundItems.length - 1; i >= 0; i--) {
            const item = this.groundItems[i];
            const dist = distance(Player, item);
            
            if (dist < 40) {
                if (this.addItem(item)) {
                    this.groundItems.splice(i, 1);
                }
            }
        }
    },
    
    getRandomLoot(floor) {
        // Loot table based on floor
        const lootTable = [];
        
        // Weapons (less common on early floors)
        if (floor >= 1) lootTable.push('sword1', 'sword1');
        if (floor >= 2) lootTable.push('sword2');
        if (floor >= 4) lootTable.push('axe');
        if (floor >= 6) lootTable.push('goldensword');
        
        // Armor
        if (floor >= 1) lootTable.push('clotharmor', 'clotharmor');
        if (floor >= 2) lootTable.push('leatherarmor');
        if (floor >= 3) lootTable.push('mailarmor');
        if (floor >= 5) lootTable.push('platearmor');
        
        // Potions (always available)
        lootTable.push('health_potion', 'health_potion', 'health_potion');
        
        return randomChoice(lootTable);
    },
    
    render(ctx) {
        // Render ground items
        for (const item of this.groundItems) {
            Sprites.drawSprite(ctx, item.sprite, item.x, item.y, 1.5);
            
            // Glow effect
            const time = Date.now() / 1000;
            const glow = Math.sin(time * 3) * 0.3 + 0.7;
            ctx.globalAlpha = glow * 0.5;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(item.x, item.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    },
    
    clear() {
        this.items = [];
        this.groundItems = [];
        this.isOpen = false;
        this.selectedSlot = -1;
    }
};
