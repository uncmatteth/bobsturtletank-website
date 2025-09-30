/**
 * StatsComponent - Manages entity stats and attributes
 */

import { Component } from './Component';

export interface Stats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export class StatsComponent extends Component {
  private stats: Stats;
  private modifiers: Partial<Stats> = {};
  
  constructor(stats: Stats) {
    super('stats');
    this.stats = { ...stats };
  }
  
  /**
   * Get a stat value (including modifiers)
   */
  public getStat(stat: keyof Stats): number {
    const baseStat = this.stats[stat];
    const modifier = this.modifiers[stat] || 0;
    return baseStat + modifier;
  }
  
  /**
   * Get base stat value (without modifiers)
   */
  public getBaseStat(stat: keyof Stats): number {
    return this.stats[stat];
  }
  
  /**
   * Set a base stat value
   */
  public setStat(stat: keyof Stats, value: number): void {
    this.stats[stat] = value;
    
    if (this.entity) {
      this.entity['eventBus'].emit('stat_changed', {
        entity: this.entity,
        stat,
        value: this.getStat(stat)
      });
    }
  }
  
  /**
   * Add a temporary modifier to a stat
   */
  public addModifier(stat: keyof Stats, value: number): void {
    this.modifiers[stat] = (this.modifiers[stat] || 0) + value;
    
    if (this.entity) {
      this.entity['eventBus'].emit('stat_changed', {
        entity: this.entity,
        stat,
        value: this.getStat(stat)
      });
    }
  }
  
  /**
   * Remove all modifiers from a stat
   */
  public clearModifiers(stat?: keyof Stats): void {
    if (stat) {
      delete this.modifiers[stat];
    } else {
      this.modifiers = {};
    }
  }
  
  /**
   * Get all stats
   */
  public getAllStats(): Stats {
    return {
      strength: this.getStat('strength'),
      dexterity: this.getStat('dexterity'),
      constitution: this.getStat('constitution'),
      intelligence: this.getStat('intelligence'),
      wisdom: this.getStat('wisdom'),
      charisma: this.getStat('charisma')
    };
  }
  
  /**
   * Get stat modifier for d20 system
   */
  public getStatModifier(stat: keyof Stats): number {
    return Math.floor((this.getStat(stat) - 10) / 2);
  }
  
  /**
   * Serialize component data
   */
  public serialize(): any {
    return {
      stats: this.stats,
      modifiers: this.modifiers
    };
  }
  
  /**
   * Deserialize component data
   */
  public deserialize(data: any): void {
    this.stats = data.stats;
    this.modifiers = data.modifiers || {};
  }
}
