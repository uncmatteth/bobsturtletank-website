/**
 * SaveManager - Handles game save/load functionality
 */

import { EventBus } from '../events/EventBus';

export class SaveManager {
  private eventBus: EventBus;
  private saveKey: string = 'roguelike_save';
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  public saveGame(data: any): void {
    try {
      const saveData = {
        timestamp: Date.now(),
        version: '1.0.0',
        data: data
      };
      
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      
      this.eventBus.emit('message', { text: 'Game saved.' });
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Failed to save game:', error);
      this.eventBus.emit('message', { text: 'Failed to save game.' });
    }
  }
  
  public loadGame(): any {
    try {
      const saveDataString = localStorage.getItem(this.saveKey);
      if (!saveDataString) {
        return null;
      }
      
      const saveData = JSON.parse(saveDataString);
      console.log('Game loaded successfully');
      
      return saveData.data;
    } catch (error) {
      console.error('Failed to load game:', error);
      this.eventBus.emit('message', { text: 'Failed to load game.' });
      return null;
    }
  }
  
  public hasSaveGame(): boolean {
    return localStorage.getItem(this.saveKey) !== null;
  }
  
  public deleteSaveGame(): void {
    localStorage.removeItem(this.saveKey);
    this.eventBus.emit('message', { text: 'Save game deleted.' });
  }
}
