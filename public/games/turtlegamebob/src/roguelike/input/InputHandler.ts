/**
 * InputHandler - Handles keyboard and mouse input
 * Converts input to game actions
 */

import { EventBus } from '../events/EventBus';

export interface GameAction {
  type: string;
  [key: string]: any;
}

export class InputHandler {
  private eventBus: EventBus;
  private keyMap: { [key: string]: GameAction } = {};
  private inputResolver: ((action: GameAction) => void) | null = null;
  private isWaitingForInput: boolean = false;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupKeyMap();
    this.setupEventListeners();
  }
  
  /**
   * Set up the key mapping
   */
  private setupKeyMap(): void {
    // Movement keys (WASD + Arrow keys + Numpad + Vi keys)
    this.keyMap['KeyW'] = { type: 'move', direction: 'north' };
    this.keyMap['KeyS'] = { type: 'move', direction: 'south' };
    this.keyMap['KeyA'] = { type: 'move', direction: 'west' };
    this.keyMap['KeyD'] = { type: 'move', direction: 'east' };
    
    this.keyMap['ArrowUp'] = { type: 'move', direction: 'north' };
    this.keyMap['ArrowDown'] = { type: 'move', direction: 'south' };
    this.keyMap['ArrowLeft'] = { type: 'move', direction: 'west' };
    this.keyMap['ArrowRight'] = { type: 'move', direction: 'east' };
    
    // Vi keys
    this.keyMap['KeyH'] = { type: 'move', direction: 'west' };
    this.keyMap['KeyJ'] = { type: 'move', direction: 'south' };
    this.keyMap['KeyK'] = { type: 'move', direction: 'north' };
    this.keyMap['KeyL'] = { type: 'move', direction: 'east' };
    this.keyMap['KeyY'] = { type: 'move', direction: 'northwest' };
    this.keyMap['KeyU'] = { type: 'move', direction: 'northeast' };
    this.keyMap['KeyB'] = { type: 'move', direction: 'southwest' };
    this.keyMap['KeyN'] = { type: 'move', direction: 'southeast' };
    
    // Numpad
    this.keyMap['Numpad1'] = { type: 'move', direction: 'southwest' };
    this.keyMap['Numpad2'] = { type: 'move', direction: 'south' };
    this.keyMap['Numpad3'] = { type: 'move', direction: 'southeast' };
    this.keyMap['Numpad4'] = { type: 'move', direction: 'west' };
    this.keyMap['Numpad5'] = { type: 'wait' };
    this.keyMap['Numpad6'] = { type: 'move', direction: 'east' };
    this.keyMap['Numpad7'] = { type: 'move', direction: 'northwest' };
    this.keyMap['Numpad8'] = { type: 'move', direction: 'north' };
    this.keyMap['Numpad9'] = { type: 'move', direction: 'northeast' };
    
    // Action keys
    this.keyMap['Space'] = { type: 'wait' };
    this.keyMap['Period'] = { type: 'wait' };
    this.keyMap['KeyG'] = { type: 'pickup' };
    this.keyMap['KeyI'] = { type: 'inventory' };
    this.keyMap['KeyC'] = { type: 'character_sheet' };
    this.keyMap['KeyE'] = { type: 'equipment' };
    this.keyMap['KeyQ'] = { type: 'quaff' };
    this.keyMap['KeyR'] = { type: 'read' };
    this.keyMap['KeyZ'] = { type: 'zap' };
    this.keyMap['KeyT'] = { type: 'throw' };
    this.keyMap['KeyF'] = { type: 'fire' };
    this.keyMap['KeyO'] = { type: 'open' };
    this.keyMap['KeyX'] = { type: 'examine' };
    this.keyMap['Slash'] = { type: 'help' };
    
    // Stairs
    this.keyMap['BracketLeft'] = { type: 'descend' }; // >
    this.keyMap['BracketRight'] = { type: 'ascend' }; // <
    
    // Save/Load
    this.keyMap['KeyS'] = { type: 'save', ctrl: true };
    this.keyMap['KeyL'] = { type: 'load', ctrl: true };
    
    // Quit
    this.keyMap['KeyQ'] = { type: 'quit', ctrl: true };
    this.keyMap['Escape'] = { type: 'menu' };
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('contextmenu', this.handleRightClick.bind(this));
  }
  
  /**
   * Handle key down events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default browser behavior for game keys
    if (this.keyMap[event.code]) {
      event.preventDefault();
    }
    
    // Check for modifier keys
    const hasCtrl = event.ctrlKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;
    
    // Get the action for this key
    let action = this.keyMap[event.code];
    
    if (!action) {
      return;
    }
    
    // Check if action requires modifiers
    if (action.ctrl && !hasCtrl) {
      return;
    }
    
    if (action.shift && !hasShift) {
      return;
    }
    
    if (action.alt && !hasAlt) {
      return;
    }
    
    // Clone the action to avoid modifying the original
    action = { ...action };
    
    // Add modifier information
    action.ctrl = hasCtrl;
    action.shift = hasShift;
    action.alt = hasAlt;
    
    // Handle the action
    this.handleAction(action);
  }
  
  /**
   * Handle key up events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Currently not used, but could be useful for continuous actions
  }
  
  /**
   * Handle mouse click events
   */
  private handleClick(event: MouseEvent): void {
    // Convert screen coordinates to game coordinates
    const gameCoords = this.screenToGameCoords(event.clientX, event.clientY);
    
    if (gameCoords) {
      const action: GameAction = {
        type: 'click',
        x: gameCoords.x,
        y: gameCoords.y,
        button: event.button
      };
      
      this.handleAction(action);
    }
  }
  
  /**
   * Handle right click events
   */
  private handleRightClick(event: MouseEvent): void {
    event.preventDefault();
    
    // Convert screen coordinates to game coordinates
    const gameCoords = this.screenToGameCoords(event.clientX, event.clientY);
    
    if (gameCoords) {
      const action: GameAction = {
        type: 'right_click',
        x: gameCoords.x,
        y: gameCoords.y
      };
      
      this.handleAction(action);
    }
  }
  
  /**
   * Convert screen coordinates to game coordinates
   */
  private screenToGameCoords(screenX: number, screenY: number): { x: number; y: number } | null {
    // This would need to be implemented based on the display system
    // For now, return null as placeholder
    return null;
  }
  
  /**
   * Handle a game action
   */
  private handleAction(action: GameAction): void {
    // Emit the action as an event
    this.eventBus.emit('input_action', action);
    
    // If we're waiting for input, resolve the promise
    if (this.isWaitingForInput && this.inputResolver) {
      this.inputResolver(action);
      this.inputResolver = null;
      this.isWaitingForInput = false;
    }
  }
  
  /**
   * Wait for input (returns a promise that resolves with the next action)
   */
  public waitForInput(): Promise<GameAction> {
    return new Promise((resolve) => {
      this.inputResolver = resolve;
      this.isWaitingForInput = true;
    });
  }
  
  /**
   * Check if currently waiting for input
   */
  public isWaiting(): boolean {
    return this.isWaitingForInput;
  }
  
  /**
   * Cancel waiting for input
   */
  public cancelWait(): void {
    if (this.inputResolver) {
      this.inputResolver({ type: 'cancel' });
      this.inputResolver = null;
      this.isWaitingForInput = false;
    }
  }
  
  /**
   * Add a custom key mapping
   */
  public addKeyMapping(key: string, action: GameAction): void {
    this.keyMap[key] = action;
  }
  
  /**
   * Remove a key mapping
   */
  public removeKeyMapping(key: string): void {
    delete this.keyMap[key];
  }
  
  /**
   * Get all key mappings
   */
  public getKeyMappings(): { [key: string]: GameAction } {
    return { ...this.keyMap };
  }
  
  /**
   * Set key mappings (replaces all existing mappings)
   */
  public setKeyMappings(keyMap: { [key: string]: GameAction }): void {
    this.keyMap = { ...keyMap };
  }
  
  /**
   * Get help text for controls
   */
  public getControlsHelp(): string {
    return `
MOVEMENT:
  WASD, Arrow Keys, or Vi Keys (hjkl) - Move
  Numpad 1-9 - Move in 8 directions
  
ACTIONS:
  G - Pick up item
  I - Open inventory
  C - Character sheet
  E - Equipment
  Q - Quaff potion
  R - Read scroll
  Z - Zap wand
  T - Throw item
  F - Fire ranged weapon
  O - Open door
  X - Examine
  Space/. - Wait
  
STAIRS:
  > - Descend stairs
  < - Ascend stairs
  
SYSTEM:
  Ctrl+S - Save game
  Ctrl+L - Load game
  Ctrl+Q - Quit
  Escape - Menu
  ? - Help
    `;
  }
}
