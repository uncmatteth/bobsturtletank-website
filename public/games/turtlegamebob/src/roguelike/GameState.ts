/**
 * GameState - Manages the current state of the game
 * Handles state transitions and related events
 */

import { EventBus } from './events/EventBus';

export type State = 'title' | 'playing' | 'paused' | 'inventory' | 'game_over' | 'victory';

export class GameState {
  private state: State = 'title';
  private previousState: State = 'title';
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  /**
   * Get the current state
   */
  public getState(): State {
    return this.state;
  }
  
  /**
   * Set the current state
   */
  public setState(state: State): void {
    // Store previous state
    this.previousState = this.state;
    
    // Set new state
    this.state = state;
    
    // Emit state change event
    this.eventBus.emit('state_changed', { 
      state: this.state,
      previousState: this.previousState
    });
    
    console.log(`Game state changed: ${this.previousState} -> ${this.state}`);
  }
  
  /**
   * Get the previous state
   */
  public getPreviousState(): State {
    return this.previousState;
  }
  
  /**
   * Return to the previous state
   */
  public returnToPreviousState(): void {
    this.setState(this.previousState);
  }
  
  /**
   * Check if the game is in a specific state
   */
  public isState(state: State): boolean {
    return this.state === state;
  }
  
  /**
   * Check if the game is active (playing or inventory)
   */
  public isActive(): boolean {
    return this.state === 'playing' || this.state === 'inventory';
  }
  
  /**
   * Check if the game is over
   */
  public isGameOver(): boolean {
    return this.state === 'game_over' || this.state === 'victory';
  }
}
