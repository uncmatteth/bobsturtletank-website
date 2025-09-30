/**
 * RPG Calculations System - Industry-Standard Math Operations
 * 
 * Uses Math.js for complex calculations and formulas
 * Provides all RPG mechanics calculations in one place
 */

import { create, all, ConfigOptions, MathJsStatic } from 'mathjs';
import _ from 'lodash';
import type { HeroStats, InventoryItem } from '../stores/gameStore';

// ============================================================================
// MATH.JS CONFIGURATION
// ============================================================================

const mathConfig: ConfigOptions = {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'number',
  precision: 14,
  predictable: false,
  randomSeed: null
};

const math: MathJsStatic = create(all, mathConfig);

// ============================================================================
// INTERFACES
// ============================================================================

export interface DamageCalculation {
  baseDamage: number;
  finalDamage: number;
  isCritical: boolean;
  isBlocked: boolean;
  damageType: 'physical' | 'fire' | 'water' | 'earth';
  modifiers: string[];
}

export interface ExperienceCalculation {
  baseExp: number;
  bonusExp: number;
  totalExp: number;
  expModifiers: string[];
}

export interface LevelProgression {
  currentLevel: number;
  nextLevel: number;
  expRequired: number;
  expToNext: number;
  statGains: {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface EquipmentStats {
  totalAttack: number;
  totalDefense: number;
  totalSpeed: number;
  totalCritRate: number;
  totalCritDamage: number;
  resistances: {
    fire: number;
    water: number;
    earth: number;
  };
  setBonuses: string[];
}

// ============================================================================
// COMBAT CALCULATIONS
// ============================================================================

export class RPGCalculations {
  /**
   * Calculate final damage with all modifiers
   */
  static calculateDamage(
    baseDamage: number,
    attackerStats: HeroStats | any,
    defenderStats: HeroStats | any,
    damageType: 'physical' | 'fire' | 'water' | 'earth' = 'physical'
  ): DamageCalculation {
    const result: DamageCalculation = {
      baseDamage,
      finalDamage: baseDamage,
      isCritical: false,
      isBlocked: false,
      damageType,
      modifiers: []
    };

    // Apply attacker's attack stat
    const attackBonus = attackerStats.attack || 0;
    result.finalDamage = math.evaluate('baseDamage + attackBonus', {
      baseDamage: result.finalDamage,
      attackBonus
    }) as number;

    if (attackBonus > 0) {
      result.modifiers.push(`+${attackBonus} Attack`);
    }

    // Check for critical hit
    const critRate = (attackerStats.criticalRate || 0) / 100;
    const critRoll = Math.random();
    
    if (critRoll < critRate) {
      result.isCritical = true;
      const critMultiplier = (attackerStats.criticalDamage || 150) / 100;
      
      result.finalDamage = math.evaluate('damage * multiplier', {
        damage: result.finalDamage,
        multiplier: critMultiplier
      }) as number;
      
      result.modifiers.push(`Critical Hit! x${critMultiplier}`);
    }

    // Apply defender's defense
    const defense = defenderStats.defense || 0;
    const defenseReduction = math.evaluate('defense / (defense + 100)', { defense }) as number;
    
    result.finalDamage = math.evaluate('damage * (1 - reduction)', {
      damage: result.finalDamage,
      reduction: defenseReduction
    }) as number;

    if (defense > 0) {
      result.modifiers.push(`-${Math.round(defenseReduction * 100)}% Defense`);
    }

    // Apply elemental resistances
    let resistance = 0;
    switch (damageType) {
      case 'fire':
        resistance = defenderStats.fireResistance || 0;
        break;
      case 'water':
        resistance = defenderStats.waterResistance || 0;
        break;
      case 'earth':
        resistance = defenderStats.earthResistance || 0;
        break;
    }

    if (resistance > 0) {
      const resistanceReduction = resistance / 100;
      result.finalDamage = math.evaluate('damage * (1 - resistance)', {
        damage: result.finalDamage,
        resistance: resistanceReduction
      }) as number;
      
      result.modifiers.push(`-${resistance}% ${damageType} Resistance`);
    }

    // Check for block (defender's speed affects block chance)
    const blockChance = math.evaluate('min(0.3, speed / 200)', {
      speed: defenderStats.speed || 0
    }) as number;
    
    const blockRoll = Math.random();
    if (blockRoll < blockChance) {
      result.isBlocked = true;
      result.finalDamage = math.evaluate('damage * 0.5', {
        damage: result.finalDamage
      }) as number;
      
      result.modifiers.push('Blocked! -50% Damage');
    }

    // Ensure minimum 1 damage
    result.finalDamage = Math.max(1, Math.round(result.finalDamage));

    return result;
  }

  /**
   * Calculate experience gain with bonuses
   */
  static calculateExperience(
    baseExp: number,
    playerLevel: number,
    enemyLevel: number,
    bonusMultipliers: Record<string, number> = {}
  ): ExperienceCalculation {
    let totalExp = baseExp;
    const modifiers: string[] = [];

    // Level difference modifier
    const levelDiff = enemyLevel - playerLevel;
    const levelModifier = math.evaluate('max(0.1, 1 + (diff * 0.1))', {
      diff: levelDiff
    }) as number;

    totalExp = math.evaluate('exp * modifier', {
      exp: totalExp,
      modifier: levelModifier
    }) as number;

    if (levelDiff !== 0) {
      modifiers.push(`${levelDiff > 0 ? '+' : ''}${Math.round((levelModifier - 1) * 100)}% Level Diff`);
    }

    // Apply bonus multipliers (from equipment, buffs, etc.)
    let totalBonusMultiplier = 1;
    Object.entries(bonusMultipliers).forEach(([source, multiplier]) => {
      totalBonusMultiplier *= multiplier;
      modifiers.push(`${Math.round((multiplier - 1) * 100)}% ${source}`);
    });

    const bonusExp = math.evaluate('exp * (multiplier - 1)', {
      exp: totalExp,
      multiplier: totalBonusMultiplier
    }) as number;

    totalExp = math.evaluate('exp * multiplier', {
      exp: totalExp,
      multiplier: totalBonusMultiplier
    }) as number;

    return {
      baseExp,
      bonusExp: Math.round(bonusExp),
      totalExp: Math.round(totalExp),
      expModifiers: modifiers
    };
  }

  /**
   * Calculate level progression requirements
   */
  static calculateLevelProgression(currentLevel: number): LevelProgression {
    const nextLevel = currentLevel + 1;
    
    // Exponential experience curve
    const expRequired = math.evaluate('floor(100 * (1.2 ^ (level - 1)))', {
      level: nextLevel
    }) as number;

    // Stat gains per level (with diminishing returns for higher levels)
    const statGains = {
      hp: math.evaluate('floor(10 + (level / 5))', { level: currentLevel }) as number,
      mp: math.evaluate('floor(5 + (level / 8))', { level: currentLevel }) as number,
      attack: math.evaluate('floor(2 + (level / 10))', { level: currentLevel }) as number,
      defense: math.evaluate('floor(1 + (level / 12))', { level: currentLevel }) as number,
      speed: math.evaluate('floor(1 + (level / 15))', { level: currentLevel }) as number,
    };

    return {
      currentLevel,
      nextLevel,
      expRequired,
      expToNext: expRequired,
      statGains
    };
  }

  /**
   * Calculate total stats from equipment
   */
  static calculateEquipmentStats(equipment: Record<string, InventoryItem>): EquipmentStats {
    const stats = {
      totalAttack: 0,
      totalDefense: 0,
      totalSpeed: 0,
      totalCritRate: 0,
      totalCritDamage: 0,
      resistances: { fire: 0, water: 0, earth: 0 },
      setBonuses: [] as string[]
    };

    const equipmentPieces = Object.values(equipment).filter(Boolean);
    
    // Sum all equipment stats
    equipmentPieces.forEach(item => {
      if (item.effects) {
        stats.totalAttack += item.effects.attack || 0;
        stats.totalDefense += item.effects.defense || 0;
        stats.totalSpeed += item.effects.speed || 0;
        stats.totalCritRate += item.effects.criticalRate || 0;
        stats.totalCritDamage += item.effects.criticalDamage || 0;
        stats.resistances.fire += item.effects.fireResistance || 0;
        stats.resistances.water += item.effects.waterResistance || 0;
        stats.resistances.earth += item.effects.earthResistance || 0;
      }
    });

    // Check for equipment set bonuses
    const equipmentNames = equipmentPieces.map(item => item.name.split(' ')[0]); // First word of name
    const setCounts = _.countBy(equipmentNames);
    
    Object.entries(setCounts).forEach(([setName, count]) => {
      if (count >= 2) {
        stats.setBonuses.push(`${setName} Set (${count} pieces)`);
        
        // Example set bonuses
        const setBonusMultiplier = math.evaluate('0.1 * count', { count }) as number;
        stats.totalAttack = math.evaluate('attack * (1 + bonus)', {
          attack: stats.totalAttack,
          bonus: setBonusMultiplier
        }) as number;
      }
    });

    return stats;
  }

  /**
   * Calculate item rarity-based stat ranges
   */
  static calculateItemStatRanges(baseValue: number, rarity: string): { min: number; max: number } {
    const multipliers: Record<string, number> = {
      'common': 1.0,
      'uncommon': 1.25,
      'rare': 1.5,
      'epic': 2.0,
      'legendary': 3.0
    };

    const multiplier = multipliers[rarity] || 1.0;
    const variance = 0.2; // ±20% variance

    const min = math.evaluate('floor(base * multiplier * (1 - variance))', {
      base: baseValue,
      multiplier,
      variance
    }) as number;

    const max = math.evaluate('floor(base * multiplier * (1 + variance))', {
      base: baseValue,
      multiplier,
      variance
    }) as number;

    return { min, max };
  }

  /**
   * Calculate drop rates with magic find
   */
  static calculateDropRate(baseRate: number, magicFind: number = 0): number {
    // Magic find gives diminishing returns
    const effectiveMF = math.evaluate('mf / (mf + 100)', { mf: magicFind }) as number;
    
    return math.evaluate('min(1, baseRate * (1 + effectiveMF))', {
      baseRate,
      effectiveMF
    }) as number;
  }

  /**
   * Generate random stat within rarity range
   */
  static generateRandomStat(baseValue: number, rarity: string): number {
    const { min, max } = this.calculateItemStatRanges(baseValue, rarity);
    
    return math.evaluate('floor(random() * (max - min + 1) + min)', {
      min,
      max
    }) as number;
  }

  /**
   * Calculate combat turn order
   */
  static calculateTurnOrder(entities: Array<{ id: string; speed: number }>): string[] {
    // Add random initiative to speed
    const initiatives = entities.map(entity => ({
      id: entity.id,
      initiative: math.evaluate('speed + random() * 10', {
        speed: entity.speed
      }) as number
    }));

    // Sort by initiative (highest first)
    return _.orderBy(initiatives, 'initiative', 'desc').map(e => e.id);
  }

  /**
   * Calculate healing effectiveness
   */
  static calculateHealing(baseHealing: number, healerStats?: any): number {
    // Future: Add healing power stat
    const healingPower = healerStats?.healingPower || 0;
    
    return math.evaluate('floor(base * (1 + power / 100))', {
      base: baseHealing,
      power: healingPower
    }) as number;
  }

  /**
   * Calculate movement speed in pixels per second
   */
  static calculateMovementSpeed(speedStat: number): number {
    // Convert speed stat to pixels per second for smooth movement
    return math.evaluate('50 + (speed * 2)', { speed: speedStat }) as number;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate random number within range using Math.js
 */
export function randomInRange(min: number, max: number): number {
  return math.evaluate('floor(random() * (max - min + 1) + min)', { min, max }) as number;
}

/**
 * Calculate percentage with Math.js precision
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return math.evaluate('(value / total) * 100', { value, total }) as number;
}

/**
 * Apply multiple multipliers efficiently
 */
export function applyMultipliers(baseValue: number, multipliers: number[]): number {
  if (multipliers.length === 0) return baseValue;
  
  const totalMultiplier = multipliers.reduce((total, mult) => 
    math.evaluate('total * mult', { total, mult }) as number, 1
  );
  
  return math.evaluate('base * multiplier', {
    base: baseValue,
    multiplier: totalMultiplier
  }) as number;
}

console.log('🧮 RPG Calculations System initialized with Math.js');
