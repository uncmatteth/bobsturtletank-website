// Game configuration and constants

export const GAME_CONFIG = {
    TILE_SIZE: 48,
    MAP_WIDTH: 25,
    MAP_HEIGHT: 18,
    VIEWPORT_WIDTH: 20,
    VIEWPORT_HEIGHT: 12,
    ROOM_MIN_SIZE: 3,
    ROOM_MAX_SIZE: 8,
    MAX_ROOMS: 8
};

export const TILES = {
    VOID: 0,
    FLOOR: 1,
    WALL: 2,
    DOOR: 2,
    STAIRS_DOWN: 3,
    WATER: 4,
    DEEP_WATER: 5,
    AIR_POCKET: 6,
    TREASURE_FLOOR: 7,
    CORAL_WALL: 8
};

export const ENTITY_TYPES = {
    PLAYER: 'player',
    ENEMY: 'enemy',
    ITEM: 'item',
    STAIRS: 'stairs',
    MERCHANT: 'merchant'
};

export const ITEM_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    POTION: 'potion',
    SCROLL: 'scroll',
    ACCESSORY: 'accessory',
    GOLD: 'gold'
};

export const RARITY_COLORS = {
    'common': '#95a5a6',
    'uncommon': '#2ecc71', 
    'rare': '#3498db',
    'epic': '#9b59b6',
    'legendary': '#f1c40f'
};

export const IDENTIFICATION_COSTS = {
    'rare': 50,
    'epic': 100,
    'legendary': 200
};

export const ENEMY_TYPES = {
    FISH: {
        name: 'Tropical Fish',
        health: 15,
        attack: 3,
        defense: 1,
        speed: 1.2,
        xpReward: 10
    },
    CRAB: {
        name: 'Hermit Crab',
        health: 25,
        attack: 5,
        defense: 3,
        speed: 0.8,
        xpReward: 15
    },
    LOBSTER: {
        name: 'Armored Lobster',
        health: 40,
        attack: 8,
        defense: 6,
        speed: 0.6,
        xpReward: 25
    },
    EEL: {
        name: 'Electric Eel',
        health: 20,
        attack: 12,
        defense: 2,
        speed: 1.5,
        xpReward: 30
    },
    WITCH: {
        name: 'Sea Witch',
        health: 35,
        attack: 15,
        defense: 4,
        speed: 1.0,
        xpReward: 50
    }
};

export const MUSIC_TRACKS = [
    'music/Underwater1.mp3',
    'music/Underwater2.mp3',
    'music/Underwater3.mp3',
    'music/Underwater4.mp3',
    'music/Underwater5.mp3'
    // ... add all 28 tracks
];
