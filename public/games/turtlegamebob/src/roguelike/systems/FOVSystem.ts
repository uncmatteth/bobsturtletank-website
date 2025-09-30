/**
 * FOVSystem - Handles field of view calculations
 * Uses rot.js FOV algorithms for realistic line of sight
 */

import * as ROT from 'rot-js';
import { EventBus } from '../events/EventBus';
import { Map } from '../map/Map';
import { Position } from '../types/Position';

export class FOVSystem {
  private eventBus: EventBus;
  private fov: ROT.FOV.FOV | null = null;
  private visibleCells: { [key: string]: boolean } = {};
  private rememberedCells: { [key: string]: boolean } = {};
  private lightMap: { [key: string]: number } = {};
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  /**
   * Compute field of view from a position
   */
  public computeFOV(position: Position, map: Map, radius: number = 8): void {
    // Clear previous visible cells
    this.visibleCells = {};
    
    // Create FOV calculator
    this.fov = new ROT.FOV.PreciseShadowcasting((x: number, y: number) => {
      return map.getTile(x, y).isTransparent();
    });
    
    // Compute FOV
    this.fov.compute(position.x, position.y, radius, (x: number, y: number, r: number, visibility: number) => {
      const key = `${x},${y}`;
      
      // Mark cell as visible
      this.visibleCells[key] = true;
      
      // Mark cell as remembered
      this.rememberedCells[key] = true;
      
      // Mark map tile as explored
      map.setExplored(x, y);
      
      // Store light level
      this.lightMap[key] = visibility;
    });
    
    // Emit FOV computed event
    this.eventBus.emit('fov_computed', {
      position: position,
      visibleCells: this.visibleCells,
      rememberedCells: this.rememberedCells
    });
  }
  
  /**
   * Check if a position is visible
   */
  public isVisible(x: number, y: number): boolean {
    const key = `${x},${y}`;
    return this.visibleCells[key] === true;
  }
  
  /**
   * Check if a position has been seen before
   */
  public isRemembered(x: number, y: number): boolean {
    const key = `${x},${y}`;
    return this.rememberedCells[key] === true;
  }
  
  /**
   * Get all visible cells
   */
  public getVisibleCells(): { [key: string]: boolean } {
    return { ...this.visibleCells };
  }
  
  /**
   * Get all remembered cells
   */
  public getRememberedCells(): { [key: string]: boolean } {
    return { ...this.rememberedCells };
  }
  
  /**
   * Get light level at a position
   */
  public getLightLevel(x: number, y: number): number {
    const key = `${x},${y}`;
    return this.lightMap[key] || 0;
  }
  
  /**
   * Add light source to the light map
   */
  public addLightSource(position: Position, radius: number, intensity: number = 1.0): void {
    // Simple circular light calculation
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const x = position.x + dx;
          const y = position.y + dy;
          const key = `${x},${y}`;
          
          // Calculate light falloff
          const lightLevel = intensity * (1 - distance / radius);
          
          // Add to existing light (lights are additive)
          this.lightMap[key] = Math.min(1.0, (this.lightMap[key] || 0) + lightLevel);
        }
      }
    }
  }
  
  /**
   * Clear all light sources
   */
  public clearLightSources(): void {
    this.lightMap = {};
  }
  
  /**
   * Get all positions within line of sight from a position
   */
  public getLineOfSight(from: Position, to: Position, map: Map): Position[] {
    const path: Position[] = [];
    
    // Use Bresenham's line algorithm
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let err = dx - dy;
    
    let x = from.x;
    let y = from.y;
    
    while (true) {
      path.push({ x, y });
      
      // Check if we've reached the target
      if (x === to.x && y === to.y) {
        break;
      }
      
      // Check if we hit a wall
      if (!map.getTile(x, y).isTransparent()) {
        break;
      }
      
      const e2 = 2 * err;
      
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return path;
  }
  
  /**
   * Check if there's a clear line of sight between two positions
   */
  public hasLineOfSight(from: Position, to: Position, map: Map): boolean {
    // Use rot.js line calculation
    const path: Position[] = [];
    
    ROT.Path.Line(from.x, from.y, to.x, to.y, (x: number, y: number) => {
      path.push({ x, y });
    });
    
    // Check each position in the path (except the starting position)
    for (let i = 1; i < path.length - 1; i++) {
      const pos = path[i];
      if (!map.getTile(pos.x, pos.y).isTransparent()) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get all positions within a certain distance that are visible
   */
  public getVisiblePositionsInRange(center: Position, range: number): Position[] {
    const positions: Position[] = [];
    
    for (const key in this.visibleCells) {
      const [x, y] = key.split(',').map(Number);
      const distance = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
      );
      
      if (distance <= range) {
        positions.push({ x, y });
      }
    }
    
    return positions;
  }
  
  /**
   * Get the closest visible position to a target
   */
  public getClosestVisiblePosition(target: Position): Position | null {
    let closestPos: Position | null = null;
    let closestDistance = Infinity;
    
    for (const key in this.visibleCells) {
      const [x, y] = key.split(',').map(Number);
      const distance = Math.sqrt(
        Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPos = { x, y };
      }
    }
    
    return closestPos;
  }
  
  /**
   * Update FOV with multiple light sources
   */
  public computeFOVWithLighting(position: Position, map: Map, lightSources: Array<{
    position: Position;
    radius: number;
    intensity: number;
  }>, baseRadius: number = 8): void {
    // Clear light map
    this.clearLightSources();
    
    // Add all light sources
    for (const light of lightSources) {
      this.addLightSource(light.position, light.radius, light.intensity);
    }
    
    // Compute base FOV
    this.computeFOV(position, map, baseRadius);
    
    // Extend FOV based on light sources
    for (const light of lightSources) {
      if (this.isVisible(light.position.x, light.position.y)) {
        // Create temporary FOV for this light source
        const lightFOV = new ROT.FOV.PreciseShadowcasting((x: number, y: number) => {
          return map.getTile(x, y).isTransparent();
        });
        
        lightFOV.compute(light.position.x, light.position.y, light.radius, (x: number, y: number, r: number, visibility: number) => {
          const key = `${x},${y}`;
          
          // Only add to visible cells if we can see the light source
          if (visibility > 0.1) {
            this.visibleCells[key] = true;
            this.rememberedCells[key] = true;
            map.setExplored(x, y);
          }
        });
      }
    }
    
    // Emit updated FOV event
    this.eventBus.emit('fov_computed', {
      position: position,
      visibleCells: this.visibleCells,
      rememberedCells: this.rememberedCells,
      lightSources: lightSources
    });
  }
}
