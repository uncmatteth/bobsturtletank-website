/**
 * UIManager - Manages the text-based UI for the roguelike
 */

import * as ROT from 'rot-js';
import { EventBus } from '../events/EventBus';
import { Player } from '../entities/Player';

export class UIManager {
  private display: ROT.Display;
  private eventBus: EventBus;
  private messages: string[] = [];
  private maxMessages: number = 10;
  
  constructor(display: ROT.Display, eventBus: EventBus) {
    this.display = display;
    this.eventBus = eventBus;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.eventBus.on('message', (data) => {
      this.addMessage(data.text);
    });
  }
  
  public init(player: Player): void {
    this.addMessage('Welcome to the dungeon!');
  }
  
  public update(player: Player): void {
    // Update UI elements based on player state
  }
  
  public render(): void {
    // Render UI elements (this would be integrated with Phaser)
  }
  
  private addMessage(message: string): void {
    this.messages.push(message);
    
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }
  
  public getMessages(): string[] {
    return [...this.messages];
  }
}
