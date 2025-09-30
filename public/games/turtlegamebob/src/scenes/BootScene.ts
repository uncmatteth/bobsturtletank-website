/**
 * BootScene - Simple boot scene that redirects to complete implementation
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    console.log('🚀 BootScene: Redirecting to complete implementation...');
  }

  create(): void {
    // Redirect to complete implementation
    window.location.href = 'game-complete.html';
  }
}