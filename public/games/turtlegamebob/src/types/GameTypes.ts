/**
 * Shared game types and enums
 */

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type EquipmentSlot = 
  | 'weapon' 
  | 'helmet' 
  | 'chest' 
  | 'legs' 
  | 'boots' 
  | 'gloves' 
  | 'shield' 
  | 'ring1' 
  | 'ring2' 
  | 'amulet' 
  | 'belt' 
  | 'shoulderPads' 
  | 'mainWeapon' 
  | 'chestArmor';

// Import EquipmentSlot from the systems that use it
import type { EquipmentSystem } from '../systems/EquipmentSystem';

export interface EquipmentStats {
  attack: number;
  defense: number;
  maxHP: number;
  maxMP: number;
  speed: number;
  criticalChance: number;
  criticalDamage: number;
  criticalRate: number; // Alias for criticalChance
  evasion: number;
  accuracy: number;
  tenacity: number;
  fireResistance: number;
  waterResistance: number;
  earthResistance: number;
  magicAttack: number;
  magicDefense: number;
  healthRegen: number;
  manaRegen: number;
  lifesteal: number;
  fireDamageBonus: number;
  waterDamageBonus: number;
  earthDamageBonus: number;
  allStats: number;
  allResistances: number;
  movementSpeed: number;
  gold?: number; // For hero stats compatibility
}

