/**
 * Type fixes and utilities for resolving TypeScript errors
 */

// Fix for Phaser GameObject casting
export function asSprite(obj: any): Phaser.GameObjects.Sprite {
  return obj as Phaser.GameObjects.Sprite;
}

export function asContainer(obj: any): Phaser.GameObjects.Container {
  return obj as Phaser.GameObjects.Container;
}

export function asText(obj: any): Phaser.GameObjects.Text {
  return obj as Phaser.GameObjects.Text;
}

// Fix for equipment slot type casting
export function asEquipmentSlot(slot: string): any {
  return slot as any;
}

// Fix for object property access
export function safePropertyAccess(obj: any, property: string): any {
  return (obj as any)[property];
}

// Fix for Phaser audio context
export function getAudioContext(sound: any): AudioContext | null {
  try {
    return (sound as any).context || null;
  } catch {
    return null;
  }
}

// Fix for destroyed/active checks
export function isActive(obj: any): boolean {
  if (!obj) return false;
  return obj.active !== false && (obj as any).destroyed !== true;
}

// Fix for Phaser Circle type
export const PhaserCircle = (Phaser.GameObjects as any).Arc || Phaser.GameObjects.Graphics;

// Fix for particle emitter manager
export const ParticleEmitterManager = Phaser.GameObjects.Particles.ParticleEmitter;





