/**
 * ProgressionSystem - Handles character progression and abilities
 */

import { EventBus } from '../events/EventBus';
import { Entity } from '../entities/Entity';

export class ProgressionSystem {
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.eventBus.on('level_up', (data) => {
      this.handleLevelUp(data.entity, data.level);
    });
  }
  
  private handleLevelUp(entity: Entity, level: number): void {
    // Handle level up bonuses
    console.log(`${entity.getName()} reached level ${level}!`);
  }
}
