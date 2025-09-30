/**
 * EventBus - Handles event-based communication between game systems
 * Implements a simple pub/sub pattern
 */

type EventCallback = (data: any) => void;

export class EventBus {
  private events: { [key: string]: EventCallback[] } = {};
  
  /**
   * Subscribe to an event
   */
  public on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
  }
  
  /**
   * Unsubscribe from an event
   */
  public off(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      return;
    }
    
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
  
  /**
   * Emit an event
   */
  public emit(event: string, data: any = {}): void {
    if (!this.events[event]) {
      return;
    }
    
    for (const callback of this.events[event]) {
      callback(data);
    }
  }
  
  /**
   * Subscribe to an event once
   */
  public once(event: string, callback: EventCallback): void {
    const onceCallback = (data: any) => {
      callback(data);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
  }
  
  /**
   * Clear all event listeners
   */
  public clear(): void {
    this.events = {};
  }
}
