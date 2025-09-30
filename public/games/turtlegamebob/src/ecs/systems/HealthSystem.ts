/**
 * HealthSystem - Handles health, damage, and death for entities
 */

import { System } from '../System';
import { World } from '../World';
import { HealthComponent } from '../components/HealthComponent';
import { SpriteComponent } from '../components/SpriteComponent';

export class HealthSystem extends System {
  // Required components for entities to be processed by this system
  public readonly requiredComponents: string[] = ['health'];
  
  constructor(world: World) {
    super(world);
    this.priority = 20; // Health should happen after physics but before rendering
  }
  
  /**
   * Update the system
   */
  public update(time: number, delta: number): void {
    const entities = this.getEntities();
    
    for (const entityId of entities) {
      const health = this.world.getComponent<HealthComponent>(entityId, 'health');
      
      if (health) {
        // Update invulnerability
        health.updateInvulnerability(delta);
        
        // Handle death
        if (health.isDead) {
          this.handleEntityDeath(entityId);
        }
        
        // Handle damage flash
        this.handleDamageFlash(entityId, health);
      }
    }
  }
  
  /**
   * Handle entity death
   */
  private handleEntityDeath(entityId: number): void {
    // For now, just hide the sprite
    const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
    
    if (sprite && sprite.sprite) {
      sprite.visible = false;
    }
    
    // In a real implementation, we would trigger death animations,
    // spawn loot, award XP, etc.
  }
  
  /**
   * Handle damage flash effect
   */
  private handleDamageFlash(entityId: number, health: HealthComponent): void {
    const sprite = this.world.getComponent<SpriteComponent>(entityId, 'sprite');
    
    if (sprite && sprite.sprite && health.isInvulnerable) {
      // Flash the sprite when invulnerable
      const flashInterval = 100; // milliseconds
      const shouldBeVisible = Math.floor(health.invulnerabilityTimer / flashInterval) % 2 === 0;
      
      sprite.alpha = shouldBeVisible ? 1 : 0.5;
    } else if (sprite) {
      sprite.alpha = 1;
    }
  }
}





