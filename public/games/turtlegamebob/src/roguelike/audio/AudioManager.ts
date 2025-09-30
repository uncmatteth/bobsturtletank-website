/**
 * AudioManager - Handles audio for the roguelike
 */

import { EventBus } from '../events/EventBus';

export class AudioManager {
  private eventBus: EventBus;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  public playSound(soundName: string): void {
    // This would integrate with Phaser's audio system
    console.log(`Playing sound: ${soundName}`);
  }
  
  public playMusic(musicName: string): void {
    // This would integrate with Phaser's audio system
    console.log(`Playing music: ${musicName}`);
  }
}
