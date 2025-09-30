/**
 * LightingSystem - Handles dynamic lighting effects
 */

import { EventBus } from '../events/EventBus';
import { Map } from '../map/Map';
import { Entity } from '../entities/Entity';
import { LightSourceComponent } from '../components/LightSourceComponent';

export class LightingSystem {
  private eventBus: EventBus;
  private lightSources: Entity[] = [];
  private ambientLight: number = 0.1;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.eventBus.on('entity_added', (data) => {
      if (data.entity.hasComponent('light_source')) {
        this.lightSources.push(data.entity);
      }
    });
    
    this.eventBus.on('entity_removed', (data) => {
      const index = this.lightSources.indexOf(data.entity);
      if (index !== -1) {
        this.lightSources.splice(index, 1);
      }
    });
  }
  
  public update(map: Map): void {
    // Update all light sources
    for (const entity of this.lightSources) {
      const lightComponent = entity.getComponent<LightSourceComponent>('light_source');
      if (lightComponent) {
        lightComponent.update(0);
      }
    }
  }
  
  public getLightSources(): Array<{
    position: { x: number; y: number };
    radius: number;
    intensity: number;
  }> {
    return this.lightSources.map(entity => {
      const lightComponent = entity.getComponent<LightSourceComponent>('light_source');
      if (lightComponent) {
        return lightComponent.getLightData();
      }
      return {
        position: entity.getPosition(),
        radius: 0,
        intensity: 0
      };
    });
  }
  
  public setAmbientLight(level: number): void {
    this.ambientLight = Math.max(0, Math.min(1, level));
  }
  
  public getAmbientLight(): number {
    return this.ambientLight;
  }
}
