/**
 * CombatSystem - Handles all combat mechanics
 * Turn-based combat with stats, abilities, and effects
 */

import { EventBus } from '../events/EventBus';
import { Entity } from '../entities/Entity';
import * as ROT from 'rot-js';

export interface CombatResult {
  attacker: Entity;
  defender: Entity;
  damage: number;
  hit: boolean;
  critical: boolean;
  blocked: boolean;
  effects: string[];
}

export class CombatSystem {
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  /**
   * Perform an attack between two entities
   */
  public attack(attacker: Entity, defender: Entity): CombatResult {
    const result: CombatResult = {
      attacker,
      defender,
      damage: 0,
      hit: false,
      critical: false,
      blocked: false,
      effects: []
    };
    
    // Calculate hit chance
    const hitChance = this.calculateHitChance(attacker, defender);
    const hitRoll = Math.random();
    
    if (hitRoll <= hitChance) {
      result.hit = true;
      
      // Calculate damage
      const baseDamage = this.calculateBaseDamage(attacker);
      const defense = this.calculateDefense(defender);
      
      // Check for critical hit
      const criticalChance = this.calculateCriticalChance(attacker);
      const criticalRoll = Math.random();
      
      if (criticalRoll <= criticalChance) {
        result.critical = true;
        result.damage = Math.max(1, Math.floor((baseDamage * 2) - defense));
        result.effects.push('Critical Hit!');
      } else {
        result.damage = Math.max(1, baseDamage - defense);
      }
      
      // Check for block
      const blockChance = this.calculateBlockChance(defender);
      const blockRoll = Math.random();
      
      if (blockRoll <= blockChance) {
        result.blocked = true;
        result.damage = Math.floor(result.damage * 0.5);
        result.effects.push('Blocked!');
      }
      
      // Apply damage
      this.applyDamage(defender, result.damage);
      
      // Check for special effects
      this.applyAttackEffects(attacker, defender, result);
      
    } else {
      result.effects.push('Miss!');
    }
    
    // Emit combat event
    this.eventBus.emit('combat_result', result);
    
    // Create combat message
    this.createCombatMessage(result);
    
    return result;
  }
  
  /**
   * Calculate hit chance
   */
  private calculateHitChance(attacker: Entity, defender: Entity): number {
    const attackerStats = attacker.getComponent('stats');
    const defenderStats = defender.getComponent('stats');
    
    if (!attackerStats || !defenderStats) {
      return 0.7; // Default hit chance
    }
    
    const attackerDex = (attackerStats as any).getStat('dexterity');
    const defenderDex = (defenderStats as any).getStat('dexterity');
    
    // Base hit chance of 70%, modified by dexterity difference
    let hitChance = 0.7 + (attackerDex - defenderDex) * 0.02;
    
    // Clamp between 5% and 95%
    return Math.max(0.05, Math.min(0.95, hitChance));
  }
  
  /**
   * Calculate base damage
   */
  private calculateBaseDamage(attacker: Entity): number {
    const statsComponent = attacker.getComponent('stats');
    if (!statsComponent) {
      return 5; // Default damage
    }
    
    const strength = (statsComponent as any).getStat('strength');
    let baseDamage = Math.floor(strength * 0.8) + ROT.RNG.getUniformInt(1, 6);
    
    // Add equipment bonuses
    const equipmentComponent = attacker.getComponent('equipment');
    if (equipmentComponent) {
      baseDamage += (equipmentComponent as any).getAttackBonus();
    }
    
    return baseDamage;
  }
  
  /**
   * Calculate defense
   */
  private calculateDefense(defender: Entity): number {
    const statsComponent = defender.getComponent('stats');
    if (!statsComponent) {
      return 0; // Default defense
    }
    
    const constitution = (statsComponent as any).getStat('constitution');
    let defense = Math.floor(constitution * 0.3);
    
    // Add equipment bonuses
    const equipmentComponent = defender.getComponent('equipment');
    if (equipmentComponent) {
      defense += (equipmentComponent as any).getDefenseBonus();
    }
    
    return defense;
  }
  
  /**
   * Calculate critical hit chance
   */
  private calculateCriticalChance(attacker: Entity): number {
    const statsComponent = attacker.getComponent('stats');
    if (!statsComponent) {
      return 0.05; // Default 5% crit chance
    }
    
    const dexterity = (statsComponent as any).getStat('dexterity');
    
    // Base 5% crit chance, +0.5% per dexterity point above 10
    let critChance = 0.05 + Math.max(0, dexterity - 10) * 0.005;
    
    // Cap at 25%
    return Math.min(0.25, critChance);
  }
  
  /**
   * Calculate block chance
   */
  private calculateBlockChance(defender: Entity): number {
    const equipmentComponent = defender.getComponent('equipment');
    if (!equipmentComponent) {
      return 0;
    }
    
    // Check if defender has a shield equipped
    const shield = (equipmentComponent as any).getEquipped('shield');
    if (!shield) {
      return 0;
    }
    
    const statsComponent = defender.getComponent('stats');
    if (!statsComponent) {
      return 0.1; // Default 10% block chance with shield
    }
    
    const dexterity = (statsComponent as any).getStat('dexterity');
    
    // Base 10% block chance with shield, +1% per dexterity point above 10
    let blockChance = 0.1 + Math.max(0, dexterity - 10) * 0.01;
    
    // Cap at 50%
    return Math.min(0.5, blockChance);
  }
  
  /**
   * Apply damage to an entity
   */
  private applyDamage(entity: Entity, damage: number): void {
    const healthComponent = entity.getComponent('health');
    if (healthComponent) {
      (healthComponent as any).damage(damage);
    }
  }
  
  /**
   * Apply special attack effects
   */
  private applyAttackEffects(attacker: Entity, defender: Entity, result: CombatResult): void {
    // Check for weapon enchantments
    const equipmentComponent = attacker.getComponent('equipment');
    if (equipmentComponent) {
      const weapon = (equipmentComponent as any).getEquipped('weapon');
      if (weapon) {
        const enchantments = weapon.getEnchantments();
        
        for (const enchantment of enchantments) {
          this.applyEnchantmentEffect(enchantment, attacker, defender, result);
        }
      }
    }
    
    // Check for special abilities based on stats
    const statsComponent = attacker.getComponent('stats');
    if (statsComponent) {
      const intelligence = (statsComponent as any).getStat('intelligence');
      
      // High intelligence chance for mana burn
      if (intelligence >= 15 && Math.random() < 0.1) {
        // TODO: Implement mana system
        result.effects.push('Mana Burn!');
      }
      
      const wisdom = (statsComponent as any).getStat('wisdom');
      
      // High wisdom chance for healing
      if (wisdom >= 15 && Math.random() < 0.05) {
        const healAmount = Math.floor(wisdom * 0.5);
        const healthComponent = attacker.getComponent('health');
        if (healthComponent) {
          (healthComponent as any).heal(healAmount);
          result.effects.push(`Healed ${healAmount} HP!`);
        }
      }
    }
  }
  
  /**
   * Apply enchantment effects
   */
  private applyEnchantmentEffect(enchantment: string, attacker: Entity, defender: Entity, result: CombatResult): void {
    switch (enchantment.toLowerCase()) {
      case 'fire':
        if (Math.random() < 0.3) {
          const fireDamage = ROT.RNG.getUniformInt(2, 6);
          this.applyDamage(defender, fireDamage);
          result.effects.push(`Fire damage: ${fireDamage}!`);
        }
        break;
        
      case 'ice':
        if (Math.random() < 0.2) {
          // TODO: Implement status effects system
          result.effects.push('Frozen!');
        }
        break;
        
      case 'lightning':
        if (Math.random() < 0.25) {
          const lightningDamage = ROT.RNG.getUniformInt(1, 8);
          this.applyDamage(defender, lightningDamage);
          result.effects.push(`Lightning damage: ${lightningDamage}!`);
        }
        break;
        
      case 'vampiric':
        if (Math.random() < 0.2) {
          const drainAmount = Math.floor(result.damage * 0.3);
          const healthComponent = attacker.getComponent('health');
          if (healthComponent) {
            (healthComponent as any).heal(drainAmount);
            result.effects.push(`Drained ${drainAmount} HP!`);
          }
        }
        break;
        
      case 'poison':
        if (Math.random() < 0.4) {
          // TODO: Implement poison status effect
          result.effects.push('Poisoned!');
        }
        break;
    }
  }
  
  /**
   * Create combat message
   */
  private createCombatMessage(result: CombatResult): void {
    let message = '';
    
    const attackerName = result.attacker.getName();
    const defenderName = result.defender.getName();
    
    if (result.hit) {
      if (result.critical) {
        message = `${attackerName} critically hits ${defenderName} for ${result.damage} damage!`;
      } else {
        message = `${attackerName} hits ${defenderName} for ${result.damage} damage!`;
      }
      
      if (result.blocked) {
        message += ' (Blocked)';
      }
      
      // Add effect messages
      if (result.effects.length > 0) {
        const effects = result.effects.filter(e => e !== 'Critical Hit!' && e !== 'Blocked!');
        if (effects.length > 0) {
          message += ` ${effects.join(' ')}`;
        }
      }
    } else {
      message = `${attackerName} misses ${defenderName}!`;
    }
    
    this.eventBus.emit('message', { text: message });
  }
  
  /**
   * Calculate experience reward for defeating an enemy
   */
  public calculateExperienceReward(defeated: Entity, victor: Entity): number {
    // Base experience based on defeated entity's level
    let baseExp = 10;
    
    const defeatedExp = defeated.getComponent('experience');
    if (defeatedExp) {
      const defeatedLevel = (defeatedExp as any).getLevel();
      baseExp = defeatedLevel * 15;
    }
    
    const victorExp = victor.getComponent('experience');
    if (victorExp) {
      const victorLevel = (victorExp as any).getLevel();
      const defeatedLevel = defeatedExp ? (defeatedExp as any).getLevel() : 1;
      
      // Reduce experience for lower level enemies
      if (defeatedLevel < victorLevel) {
        const levelDiff = victorLevel - defeatedLevel;
        baseExp = Math.max(1, baseExp - (levelDiff * 2));
      }
      // Bonus experience for higher level enemies
      else if (defeatedLevel > victorLevel) {
        const levelDiff = defeatedLevel - victorLevel;
        baseExp += levelDiff * 5;
      }
    }
    
    return baseExp;
  }
  
  /**
   * Handle entity death
   */
  public handleEntityDeath(entity: Entity, killer: Entity | null = null): void {
    // Award experience to killer
    if (killer && killer !== entity) {
      const expReward = this.calculateExperienceReward(entity, killer);
      const killerExp = killer.getComponent('experience');
      if (killerExp) {
        (killerExp as any).addExperience(expReward);
      }
    }
    
    // Drop items
    this.dropItems(entity);
    
    // Emit death event
    this.eventBus.emit('entity_died', {
      entity: entity,
      killer: killer
    });
    
    // Create death message
    const entityName = entity.getName();
    if (killer) {
      const killerName = killer.getName();
      this.eventBus.emit('message', {
        text: `${entityName} is defeated by ${killerName}!`
      });
    } else {
      this.eventBus.emit('message', {
        text: `${entityName} dies!`
      });
    }
  }
  
  /**
   * Drop items when entity dies
   */
  private dropItems(entity: Entity): void {
    const inventoryComponent = entity.getComponent('inventory');
    if (!inventoryComponent) {
      return;
    }
    
    const items = (inventoryComponent as any).getItems();
    const position = entity.getPosition();
    
    // Drop some items randomly
    for (const item of items) {
      if (Math.random() < 0.3) { // 30% chance to drop each item
        item.setPosition(position.x, position.y);
        
        this.eventBus.emit('item_dropped', {
          item: item,
          position: position
        });
      }
    }
  }
}
