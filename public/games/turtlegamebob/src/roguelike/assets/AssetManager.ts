/**
 * AssetManager - Manages loading of roguelike assets
 */

import { EventBus } from '../events/EventBus';

export class AssetManager {
  private eventBus: EventBus;
  private assetsLoaded: boolean = false;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  public async loadAssets(): Promise<void> {
    // This would integrate with Phaser's asset loading
    console.log('Loading roguelike assets...');
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.assetsLoaded = true;
    console.log('Roguelike assets loaded');
  }
  
  public isLoaded(): boolean {
    return this.assetsLoaded;
  }
}
