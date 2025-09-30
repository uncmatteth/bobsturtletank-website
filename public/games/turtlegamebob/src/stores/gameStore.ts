/**
 * Game State Store - Industry-Standard RPG State Management
 * 
 * Uses Zustand for reactive state management
 * Replaces custom hero stats with professional store
 */

import { createStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';
import localforage from 'localforage';
import _ from 'lodash';

// ============================================================================
// INTERFACES
// ============================================================================

export interface HeroStats {
  // Core Identity
  id: string;
  name: string;
  shellClass: 'Shell Defender' | 'Swift Current' | 'Fire Belly';
  
  // Progression
  level: number;
  experience: number;
  experienceToNext: number;
  
  // Vitals
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  
  // Combat Stats
  attack: number;
  defense: number;
  speed: number;
  criticalRate: number; // Percentage (0-100)
  criticalDamage: number; // Percentage multiplier (150 = 1.5x)
  
  // Resistances (0-100%)
  fireResistance: number;
  waterResistance: number;
  earthResistance: number;
  
  // Shell Class Bonuses
  classBonus: Record<string, number>;
  
  // Progression Tracking
  gold: number;
  highestFloor: number;
  bossesDefeated: number;
  totalKills: number;
  totalDamage: number;
  deathCount: number;
  playtimeSeconds: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'potion' | 'weapon' | 'armor' | 'treasure' | 'consumable' | 'accessory';
  description: string;
  spriteKey: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Item Effects
  effects?: {
    healHP?: number;
    healMP?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    criticalRate?: number;
    criticalDamage?: number;
    fireResistance?: number;
    waterResistance?: number;
    earthResistance?: number;
  };
  
  // Equipment Data
  slot?: 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory1' | 'accessory2';
  equipped?: boolean;
  
  // Metadata
  value: number; // Gold value
  stackable: boolean;
  tradeable: boolean;
}

export interface Equipment {
  weapon?: InventoryItem;
  armor?: InventoryItem;
  helmet?: InventoryItem;
  boots?: InventoryItem;
  accessory1?: InventoryItem;
  accessory2?: InventoryItem;
}

export interface GameState {
  // Hero Data
  hero: HeroStats;
  
  // Inventory & Equipment
  inventory: InventoryItem[];
  equipment: Equipment;
  inventoryVisible: boolean;
  
  // Game Progress
  currentFloor: number;
  gameStartTime: number;
  lastSaveTime: number;
  
  // UI State
  showStats: boolean;
  showSettings: boolean;
  
  // Combat State
  inCombat: boolean;
  turnBasedMode: boolean;
}

export interface GameActions {
  // Hero Actions
  updateHeroStats: (updates: Partial<HeroStats>) => void;
  healHero: (amount: number) => void;
  damageHero: (amount: number) => void;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  getEffectiveStats: () => HeroStats; // Stats including equipment bonuses
  
  // Inventory Actions
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => boolean;
  unequipItem: (slot: keyof Equipment) => boolean;
  toggleInventory: () => void;
  
  // Game State Actions
  advanceFloor: () => void;
  resetGame: () => void;
  
  // UI Actions
  toggleStats: () => void;
  toggleSettings: () => void;
  
  // Save/Load Actions
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  autoSave: () => Promise<void>;
}

type GameStore = GameState & GameActions;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const createDefaultHero = (shellClass: HeroStats['shellClass'] = 'Swift Current'): HeroStats => {
  const baseStats = {
    id: `hero_${Date.now()}`,
    name: 'Bob the Turtle',
    shellClass,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    currentHP: 100,
    maxHP: 100,
    currentMP: 50,
    maxMP: 50,
    attack: 10,
    defense: 8,
    speed: 12,
    criticalRate: 5,
    criticalDamage: 150,
    fireResistance: 0,
    waterResistance: 0,
    earthResistance: 0,
    gold: 0,
    highestFloor: 1,
    bossesDefeated: 0,
    totalKills: 0,
    totalDamage: 0,
    deathCount: 0,
    playtimeSeconds: 0,
    classBonus: {}
  };

  // Apply shell class bonuses
  switch (shellClass) {
    case 'Shell Defender':
      return {
        ...baseStats,
        maxHP: 120,
        currentHP: 120,
        defense: 12,
        speed: 8,
        classBonus: { defense: 4, speed: -4, maxHP: 20 }
      };
      
    case 'Swift Current':
      return {
        ...baseStats,
        speed: 16,
        criticalRate: 8,
        attack: 12,
        classBonus: { speed: 4, criticalRate: 3, attack: 2 }
      };
      
    case 'Fire Belly':
      return {
        ...baseStats,
        attack: 14,
        maxMP: 70,
        currentMP: 70,
        fireResistance: 25,
        classBonus: { attack: 4, maxMP: 20, fireResistance: 25 }
      };
      
    default:
      return baseStats;
  }
};

const defaultGameState: GameState = {
  hero: createDefaultHero(),
  inventory: [],
  equipment: {},
  inventoryVisible: false,
  currentFloor: 1,
  gameStartTime: Date.now(),
  lastSaveTime: Date.now(),
  showStats: false,
  showSettings: false,
  inCombat: false,
  turnBasedMode: true
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useGameStore = createStore(
  subscribeWithSelector<GameStore>((set, get) => ({
    ...defaultGameState,

    // ========================================================================
    // HERO ACTIONS
    // ========================================================================
    
    updateHeroStats: (updates) => {
      set((state) => ({
        hero: { ...state.hero, ...updates }
      }));
    },
    
    healHero: (amount) => {
      set((state) => ({
        hero: {
          ...state.hero,
          currentHP: Math.min(state.hero.maxHP, state.hero.currentHP + amount)
        }
      }));
    },
    
    damageHero: (amount) => {
      set((state) => ({
        hero: {
          ...state.hero,
          currentHP: Math.max(0, state.hero.currentHP - amount)
        }
      }));
    },
    
    addExperience: (amount) => {
      set((state) => {
        const newExp = state.hero.experience + amount;
        let updatedHero = { ...state.hero, experience: newExp };
        
        // Check for level up
        while (updatedHero.experience >= updatedHero.experienceToNext) {
          updatedHero.experience -= updatedHero.experienceToNext;
          updatedHero.level += 1;
          
          // Level up bonuses
          updatedHero.maxHP += 10;
          updatedHero.currentHP = updatedHero.maxHP; // Full heal on level up
          updatedHero.maxMP += 5;
          updatedHero.currentMP = updatedHero.maxMP;
          updatedHero.attack += 2;
          updatedHero.defense += 1;
          updatedHero.speed += 1;
          
          // Calculate next level requirement
          updatedHero.experienceToNext = Math.floor(100 * Math.pow(1.2, updatedHero.level - 1));
        }
        
        return { hero: updatedHero };
      });
    },
    
    levelUp: () => {
      // Called by addExperience - kept separate for manual level ups
      const { hero } = get();
      get().addExperience(hero.experienceToNext - hero.experience);
    },
    
    getEffectiveStats: () => {
      const { hero, equipment } = get();
      let effectiveStats = { ...hero };
      
      // Apply equipment bonuses
      Object.values(equipment).forEach((item) => {
        if (item && item.effects) {
          if (item.effects.attack) effectiveStats.attack += item.effects.attack;
          if (item.effects.defense) effectiveStats.defense += item.effects.defense;
          if (item.effects.speed) effectiveStats.speed += item.effects.speed;
          if (item.effects.criticalRate) effectiveStats.criticalRate += item.effects.criticalRate;
          if (item.effects.criticalDamage) effectiveStats.criticalDamage += item.effects.criticalDamage;
          if (item.effects.fireResistance) effectiveStats.fireResistance += item.effects.fireResistance;
          if (item.effects.waterResistance) effectiveStats.waterResistance += item.effects.waterResistance;
          if (item.effects.earthResistance) effectiveStats.earthResistance += item.effects.earthResistance;
        }
      });
      
      // Ensure stats don't go below 0 or above reasonable limits
      effectiveStats.attack = Math.max(1, effectiveStats.attack);
      effectiveStats.defense = Math.max(0, effectiveStats.defense);
      effectiveStats.speed = Math.max(1, effectiveStats.speed);
      effectiveStats.criticalRate = Math.max(0, Math.min(100, effectiveStats.criticalRate));
      effectiveStats.criticalDamage = Math.max(100, Math.min(500, effectiveStats.criticalDamage));
      effectiveStats.fireResistance = Math.max(0, Math.min(100, effectiveStats.fireResistance));
      effectiveStats.waterResistance = Math.max(0, Math.min(100, effectiveStats.waterResistance));
      effectiveStats.earthResistance = Math.max(0, Math.min(100, effectiveStats.earthResistance));
      
      return effectiveStats;
    },

    // ========================================================================
    // INVENTORY ACTIONS  
    // ========================================================================
    
    addItem: (itemData) => {
      set((state) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        // Check if item is stackable and already exists
        if (newItem.stackable) {
          const existingIndex = state.inventory.findIndex(
            item => item.name === newItem.name && item.type === newItem.type
          );
          
          if (existingIndex !== -1) {
            const updatedInventory = [...state.inventory];
            updatedInventory[existingIndex].quantity += newItem.quantity;
            return { inventory: updatedInventory };
          }
        }
        
        return { inventory: [...state.inventory, newItem] };
      });
    },
    
    removeItem: (itemId, quantity = 1) => {
      set((state) => {
        const itemIndex = state.inventory.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return state;
        
        const item = state.inventory[itemIndex];
        const updatedInventory = [...state.inventory];
        
        if (item.quantity <= quantity) {
          // Remove item completely
          updatedInventory.splice(itemIndex, 1);
        } else {
          // Reduce quantity
          updatedInventory[itemIndex] = {
            ...item,
            quantity: item.quantity - quantity
          };
        }
        
        return { inventory: updatedInventory };
      });
    },
    
    useItem: (itemId) => {
      const { hero, inventory } = get();
      const item = inventory.find(i => i.id === itemId);
      
      if (!item || item.quantity <= 0) return false;
      
      // Apply item effects
      if (item.effects) {
        const updates: Partial<HeroStats> = {};
        
        if (item.effects.healHP) {
          updates.currentHP = Math.min(hero.maxHP, hero.currentHP + item.effects.healHP);
        }
        
        if (item.effects.healMP) {
          updates.currentMP = Math.min(hero.maxMP, hero.currentMP + item.effects.healMP);
        }
        
        get().updateHeroStats(updates);
      }
      
      // Remove consumed item
      if (item.type === 'consumable' || item.type === 'potion') {
        get().removeItem(itemId, 1);
      }
      
      return true;
    },
    
    equipItem: (itemId) => {
      const { inventory } = get();
      const item = inventory.find(i => i.id === itemId);
      
      if (!item || !item.slot) return false;
      
      set((state) => {
        // Unequip existing item in slot
        const currentEquipped = state.equipment[item.slot!];
        const updatedEquipment = { ...state.equipment };
        const updatedInventory = state.inventory.map(i => ({ ...i }));
        
        if (currentEquipped) {
          // Move current item back to inventory
          const inventoryItem = updatedInventory.find(i => i.id === currentEquipped.id);
          if (inventoryItem) {
            inventoryItem.equipped = false;
          }
        }
        
        // Equip new item
        updatedEquipment[item.slot] = { ...item, equipped: true };
        const newEquippedItem = updatedInventory.find(i => i.id === itemId);
        if (newEquippedItem) {
          newEquippedItem.equipped = true;
        }
        
        return {
          equipment: updatedEquipment,
          inventory: updatedInventory
        };
      });
      
      return true;
    },
    
    unequipItem: (slot) => {
      set((state) => {
        const item = state.equipment[slot];
        if (!item) return state;
        
        const updatedEquipment = { ...state.equipment };
        delete updatedEquipment[slot];
        
        const updatedInventory = state.inventory.map(i => 
          i.id === item.id ? { ...i, equipped: false } : i
        );
        
        return {
          equipment: updatedEquipment,
          inventory: updatedInventory
        };
      });
      
      return true;
    },
    
    toggleInventory: () => {
      set((state) => ({ inventoryVisible: !state.inventoryVisible }));
    },

    // ========================================================================
    // GAME STATE ACTIONS
    // ========================================================================
    
    advanceFloor: () => {
      set((state) => {
        const newFloor = state.currentFloor + 1;
        return {
          currentFloor: newFloor,
          hero: {
            ...state.hero,
            highestFloor: Math.max(state.hero.highestFloor, newFloor)
          }
        };
      });
    },
    
    resetGame: () => {
      set(defaultGameState);
    },

    // ========================================================================
    // UI ACTIONS
    // ========================================================================
    
    toggleStats: () => {
      set((state) => ({ showStats: !state.showStats }));
    },
    
    toggleSettings: () => {
      set((state) => ({ showSettings: !state.showSettings }));
    },

    // ========================================================================
    // SAVE/LOAD ACTIONS
    // ========================================================================
    
    saveGame: async () => {
      try {
        const state = get();
        const saveData = {
          hero: state.hero,
          inventory: state.inventory,
          equipment: state.equipment,
          currentFloor: state.currentFloor,
          gameStartTime: state.gameStartTime,
          lastSaveTime: Date.now()
        };
        
        await localforage.setItem('bobTurtleGameSave', saveData);
        set({ lastSaveTime: Date.now() });
        console.log('💾 Game saved successfully');
      } catch (error) {
        console.error('❌ Failed to save game:', error);
      }
    },
    
    loadGame: async () => {
      try {
        const saveData = await localforage.getItem<any>('bobTurtleGameSave');
        
        if (saveData) {
          set({
            hero: { ...defaultGameState.hero, ...saveData.hero },
            inventory: saveData.inventory || [],
            equipment: saveData.equipment || {},
            currentFloor: saveData.currentFloor || 1,
            gameStartTime: saveData.gameStartTime || Date.now(),
            lastSaveTime: saveData.lastSaveTime || Date.now()
          });
          
          console.log('📁 Game loaded successfully');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ Failed to load game:', error);
        return false;
      }
    },
    
    autoSave: async () => {
      const { lastSaveTime } = get();
      const now = Date.now();
      
      // Auto-save every 2 minutes
      if (now - lastSaveTime > 120000) {
        await get().saveGame();
      }
    }
  }))
);

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

// Configure LocalForage for better storage performance
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: 'BobTurtleRPG',
  version: 1.0,
  storeName: 'gameData',
  description: 'Bob The Turtle: Hero Of Turtle Dungeon Depths - Save Data'
});

console.log('🏪 Game Store initialized with Zustand + LocalForage');
