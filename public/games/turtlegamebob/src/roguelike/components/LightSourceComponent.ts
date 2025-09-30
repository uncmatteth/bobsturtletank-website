/**
 * LightSourceComponent - Makes an entity emit light
 */

import { Component } from './Component';

export class LightSourceComponent extends Component {
  private radius: number;
  private color: string;
  private intensity: number;
  private flickering: boolean = false;
  private flickerSpeed: number = 0.1;
  private currentIntensity: number;
  
  constructor(radius: number, color: string = '#FFFFFF', intensity: number = 1.0) {
    super('light_source');
    this.radius = radius;
    this.color = color;
    this.intensity = intensity;
    this.currentIntensity = intensity;
  }
  
  /**
   * Get light radius
   */
  public getRadius(): number {
    return this.radius;
  }
  
  /**
   * Set light radius
   */
  public setRadius(radius: number): void {
    this.radius = radius;
  }
  
  /**
   * Get light color
   */
  public getColor(): string {
    return this.color;
  }
  
  /**
   * Set light color
   */
  public setColor(color: string): void {
    this.color = color;
  }
  
  /**
   * Get light intensity
   */
  public getIntensity(): number {
    return this.currentIntensity;
  }
  
  /**
   * Set light intensity
   */
  public setIntensity(intensity: number): void {
    this.intensity = intensity;
    this.currentIntensity = intensity;
  }
  
  /**
   * Enable/disable flickering
   */
  public setFlickering(flickering: boolean, speed: number = 0.1): void {
    this.flickering = flickering;
    this.flickerSpeed = speed;
  }
  
  /**
   * Check if light is flickering
   */
  public isFlickering(): boolean {
    return this.flickering;
  }
  
  /**
   * Update component (handle flickering)
   */
  public update(delta: number): void {
    if (this.flickering) {
      // Create flickering effect
      const time = Date.now() * this.flickerSpeed;
      const flicker = Math.sin(time) * 0.2 + Math.sin(time * 2.3) * 0.1;
      this.currentIntensity = Math.max(0.3, this.intensity + flicker);
    } else {
      this.currentIntensity = this.intensity;
    }
  }
  
  /**
   * Get light data for rendering
   */
  public getLightData(): {
    radius: number;
    color: string;
    intensity: number;
    position: { x: number; y: number };
  } {
    const position = this.entity ? this.entity.getPosition() : { x: 0, y: 0 };
    
    return {
      radius: this.radius,
      color: this.color,
      intensity: this.currentIntensity,
      position
    };
  }
  
  /**
   * Serialize component data
   */
  public serialize(): any {
    return {
      radius: this.radius,
      color: this.color,
      intensity: this.intensity,
      flickering: this.flickering,
      flickerSpeed: this.flickerSpeed,
      currentIntensity: this.currentIntensity
    };
  }
  
  /**
   * Deserialize component data
   */
  public deserialize(data: any): void {
    this.radius = data.radius;
    this.color = data.color;
    this.intensity = data.intensity;
    this.flickering = data.flickering;
    this.flickerSpeed = data.flickerSpeed;
    this.currentIntensity = data.currentIntensity;
  }
}
