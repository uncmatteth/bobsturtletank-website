/**
 * HealthComponent - Manages entity health and damage
 */

import { Component } from './Component';

export class HealthComponent extends Component {
  private currentHealth: number;
  private maxHealth: number;
  private regenerationRate: number = 0;
  private lastRegenTime: number = 0;
  
  constructor(currentHealth: number, maxHealth: number, regenerationRate: number = 0) {
    super('health');
    this.currentHealth = currentHealth;
    this.maxHealth = maxHealth;
    this.regenerationRate = regenerationRate;
    this.lastRegenTime = Date.now();
  }
  
  /**
   * Get current health
   */
  public getCurrentHealth(): number {
    return this.currentHealth;
  }
  
  /**
   * Get max health
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }
  
  /**
   * Get health percentage
   */
  public getHealthPercentage(): number {
    return this.currentHealth / this.maxHealth;
  }
  
  /**
   * Heal the entity
   */
  public heal(amount: number): void {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
    
    if (this.entity && this.currentHealth !== oldHealth) {
      this.entity['eventBus'].emit('health_changed', {
        entity: this.entity,
        current: this.currentHealth,
        max: this.maxHealth,
        change: this.currentHealth - oldHealth
      });
    }
  }
  
  /**
   * Damage the entity
   */
  public damage(amount: number): void {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.max(this.currentHealth - amount, 0);
    
    if (this.entity && this.currentHealth !== oldHealth) {
      this.entity['eventBus'].emit('health_changed', {
        entity: this.entity,
        current: this.currentHealth,
        max: this.maxHealth,
        change: this.currentHealth - oldHealth
      });
      
      // Check for death
      if (this.currentHealth <= 0) {
        this.entity['eventBus'].emit('entity_died', {
          entity: this.entity
        });
      }
    }
  }
  
  /**
   * Set max health
   */
  public setMaxHealth(maxHealth: number): void {
    this.maxHealth = maxHealth;
    this.currentHealth = Math.min(this.currentHealth, this.maxHealth);
  }
  
  /**
   * Check if the entity is dead
   */
  public isDead(): boolean {
    return this.currentHealth <= 0;
  }
  
  /**
   * Update component (handle regeneration)
   */
  public update(delta: number): void {
    if (this.regenerationRate > 0 && this.currentHealth < this.maxHealth) {
      const now = Date.now();
      if (now - this.lastRegenTime >= 1000) { // Regenerate every second
        this.heal(this.regenerationRate);
        this.lastRegenTime = now;
      }
    }
  }
  
  /**
   * Serialize component data
   */
  public serialize(): any {
    return {
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth,
      regenerationRate: this.regenerationRate,
      lastRegenTime: this.lastRegenTime
    };
  }
  
  /**
   * Deserialize component data
   */
  public deserialize(data: any): void {
    this.currentHealth = data.currentHealth;
    this.maxHealth = data.maxHealth;
    this.regenerationRate = data.regenerationRate;
    this.lastRegenTime = data.lastRegenTime;
  }
}
