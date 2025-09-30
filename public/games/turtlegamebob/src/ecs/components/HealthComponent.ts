/**
 * HealthComponent - Health, damage, and death properties for an entity
 */

import { Component, registerComponentType } from '../Component';

export class HealthComponent extends Component {
  public currentHealth: number;
  public maxHealth: number;
  public isDead: boolean = false;
  public isInvulnerable: boolean = false;
  public invulnerabilityTimer: number = 0;
  public damageFlashDuration: number = 200; // milliseconds
  
  // Event callbacks
  public onDamage?: (amount: number, source?: number) => void;
  public onHeal?: (amount: number, source?: number) => void;
  public onDeath?: (source?: number) => void;
  
  constructor(maxHealth: number, currentHealth?: number) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth ?? maxHealth;
  }
  
  /**
   * Apply damage to the entity
   */
  public damage(amount: number, source?: number): boolean {
    if (this.isDead || this.isInvulnerable || amount <= 0) {
      return false;
    }
    
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    
    if (this.onDamage) {
      this.onDamage(amount, source);
    }
    
    if (this.currentHealth <= 0) {
      this.isDead = true;
      
      if (this.onDeath) {
        this.onDeath(source);
      }
    }
    
    return true;
  }
  
  /**
   * Heal the entity
   */
  public heal(amount: number, source?: number): boolean {
    if (this.isDead || amount <= 0) {
      return false;
    }
    
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    
    const actualHeal = this.currentHealth - oldHealth;
    
    if (actualHeal > 0 && this.onHeal) {
      this.onHeal(actualHeal, source);
    }
    
    return actualHeal > 0;
  }
  
  /**
   * Set invulnerability for a duration
   */
  public setInvulnerable(duration: number): void {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = duration;
  }
  
  /**
   * Update invulnerability timer
   */
  public updateInvulnerability(delta: number): void {
    if (this.isInvulnerable && this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= delta;
      
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
      }
    }
  }
  
  /**
   * Revive the entity
   */
  public revive(health?: number): void {
    this.isDead = false;
    this.currentHealth = health ?? this.maxHealth;
  }
  
  /**
   * Get health percentage (0-1)
   */
  public getHealthPercentage(): number {
    return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
  }
}

// Register component type
registerComponentType(HealthComponent, 'health');
