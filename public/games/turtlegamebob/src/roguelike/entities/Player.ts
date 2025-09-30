/**
 * Player - Represents the player character
 * Handles player-specific behavior and components
 */

import { Entity } from './Entity';
import { EventBus } from '../events/EventBus';
import { HealthComponent } from '../components/HealthComponent';
import { InventoryComponent } from '../components/InventoryComponent';
import { StatsComponent } from '../components/StatsComponent';
import { ExperienceComponent } from '../components/ExperienceComponent';
import { EquipmentComponent } from '../components/EquipmentComponent';
import { LightSourceComponent } from '../components/LightSourceComponent';

export class Player extends Entity {
  constructor(eventBus: EventBus) {
    super(
      eventBus,
      'Hero',
      0, 0,
      { char: '@', fg: '#00FF00', bg: '#000000' }
    );
    
    // Set render order (player on top)
    this.setRenderOrder(0);
    
    // Add components
    this.addComponent(new HealthComponent(100, 100));
    this.addComponent(new InventoryComponent(20));
    this.addComponent(new StatsComponent({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }));
    this.addComponent(new ExperienceComponent());
    this.addComponent(new EquipmentComponent());
    this.addComponent(new LightSourceComponent(8, '#FFCC00', 0.5));
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for health changes
    this.eventBus.on('health_changed', (data) => {
      if (data.entity === this) {
        // Check for death
        if (data.current <= 0) {
          this.eventBus.emit('player_died', { player: this });
        }
        
        // Check for low health
        if (data.current <= data.max * 0.3) {
          this.eventBus.emit('player_low_health', { player: this });
        }
      }
    });
    
    // Listen for experience gain
    this.eventBus.on('experience_gained', (data) => {
      if (data.entity === this) {
        this.eventBus.emit('message', { text: `You gained ${data.amount} experience.` });
      }
    });
    
    // Listen for level up
    this.eventBus.on('level_up', (data) => {
      if (data.entity === this) {
        this.eventBus.emit('message', { text: `You reached level ${data.level}!` });
      }
    });
    
    // Listen for item pickup
    this.eventBus.on('item_picked_up', (data) => {
      if (data.entity === this) {
        this.eventBus.emit('message', { text: `You picked up ${data.item.getName()}.` });
      }
    });
  }
  
  /**
   * Player's turn action
   * This is called by the scheduler
   */
  public act(): void {
    // Player actions are handled by input
    // This method is required by the Entity interface but not used for Player
  }
  
  /**
   * Check if the player is hostile
   */
  public isHostile(): boolean {
    // Player is never hostile to itself
    return false;
  }
  
  /**
   * Check if the player is dead
   */
  public isDead(): boolean {
    const healthComponent = this.getComponent<HealthComponent>('health');
    return healthComponent ? healthComponent.getCurrentHealth() <= 0 : false;
  }
  
  /**
   * Get player's current level
   */
  public getLevel(): number {
    const expComponent = this.getComponent<ExperienceComponent>('experience');
    return expComponent ? expComponent.getLevel() : 1;
  }
  
  /**
   * Get player's current experience
   */
  public getExperience(): number {
    const expComponent = this.getComponent<ExperienceComponent>('experience');
    return expComponent ? expComponent.getCurrentExperience() : 0;
  }
  
  /**
   * Get player's experience needed for next level
   */
  public getExperienceToNextLevel(): number {
    const expComponent = this.getComponent<ExperienceComponent>('experience');
    return expComponent ? expComponent.getExperienceToNextLevel() : 100;
  }
  
  /**
   * Get player's health
   */
  public getHealth(): number {
    const healthComponent = this.getComponent<HealthComponent>('health');
    return healthComponent ? healthComponent.getCurrentHealth() : 0;
  }
  
  /**
   * Get player's max health
   */
  public getMaxHealth(): number {
    const healthComponent = this.getComponent<HealthComponent>('health');
    return healthComponent ? healthComponent.getMaxHealth() : 0;
  }
  
  /**
   * Heal the player
   */
  public heal(amount: number): void {
    const healthComponent = this.getComponent<HealthComponent>('health');
    if (healthComponent) {
      healthComponent.heal(amount);
    }
  }
  
  /**
   * Damage the player
   */
  public damage(amount: number): void {
    const healthComponent = this.getComponent<HealthComponent>('health');
    if (healthComponent) {
      healthComponent.damage(amount);
    }
  }
  
  /**
   * Get player's attack value
   */
  public getAttackValue(): number {
    const statsComponent = this.getComponent<StatsComponent>('stats');
    if (!statsComponent) return 5;
    
    // Base attack from strength
    let attack = statsComponent.getStat('strength');
    
    // Add equipment bonuses
    const equipmentComponent = this.getComponent<EquipmentComponent>('equipment');
    if (equipmentComponent) {
      attack += equipmentComponent.getAttackBonus();
    }
    
    return attack;
  }
  
  /**
   * Get player's defense value
   */
  public getDefenseValue(): number {
    const statsComponent = this.getComponent<StatsComponent>('stats');
    if (!statsComponent) return 0;
    
    // Base defense from constitution
    let defense = Math.floor(statsComponent.getStat('constitution') / 2);
    
    // Add equipment bonuses
    const equipmentComponent = this.getComponent<EquipmentComponent>('equipment');
    if (equipmentComponent) {
      defense += equipmentComponent.getDefenseBonus();
    }
    
    return defense;
  }
  
  /**
   * Deserialize player data
   */
  public deserialize(data: any): void {
    this.id = data.id;
    this.name = data.name;
    this.position = data.position;
    this.appearance = data.appearance;
    this.blocking = data.blocking;
    this.renderOrder = data.renderOrder;
    
    // Deserialize components
    for (const type in data.components) {
      const component = this.getComponent(type);
      if (component) {
        component.deserialize(data.components[type]);
      }
    }
  }
}
