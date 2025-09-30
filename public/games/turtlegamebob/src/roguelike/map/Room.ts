/**
 * Room - Represents a room in the dungeon
 * Handles room properties and behavior
 */

import { Position } from '../types/Position';

export type RoomType = 'normal' | 'boss' | 'treasure' | 'shop' | 'shrine';

export class Room {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private type: RoomType = 'normal';
  private connected: boolean = false;
  
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  /**
   * Get the center position of the room
   */
  public getCenter(): Position {
    return {
      x: Math.floor(this.x + this.width / 2),
      y: Math.floor(this.y + this.height / 2)
    };
  }
  
  /**
   * Check if a position is inside the room
   */
  public contains(x: number, y: number): boolean {
    return (
      x >= this.x && x < this.x + this.width &&
      y >= this.y && y < this.y + this.height
    );
  }
  
  /**
   * Check if this room intersects with another room
   */
  public intersects(other: Room): boolean {
    return !(
      this.x + this.width <= other.x ||
      other.x + other.width <= this.x ||
      this.y + this.height <= other.y ||
      other.y + other.height <= this.y
    );
  }
  
  /**
   * Get a random position inside the room
   */
  public getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * (this.width - 2)) + this.x + 1,
      y: Math.floor(Math.random() * (this.height - 2)) + this.y + 1
    };
  }
  
  /**
   * Set the room type
   */
  public setType(type: RoomType): void {
    this.type = type;
  }
  
  /**
   * Get the room type
   */
  public getType(): RoomType {
    return this.type;
  }
  
  /**
   * Mark the room as connected
   */
  public setConnected(connected: boolean): void {
    this.connected = connected;
  }
  
  /**
   * Check if the room is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Get the room's area
   */
  public getArea(): number {
    return this.width * this.height;
  }
  
  /**
   * Serialize room data for saving
   */
  public serialize(): any {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      type: this.type,
      connected: this.connected
    };
  }
  
  /**
   * Deserialize room data for loading
   */
  public deserialize(data: any): void {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.type = data.type;
    this.connected = data.connected;
  }
}
