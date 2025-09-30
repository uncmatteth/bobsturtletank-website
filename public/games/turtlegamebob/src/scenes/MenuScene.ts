/**
 * MenuScene - Simple menu scene
 */

import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    console.log('🎮 MenuScene: Starting game...');
    // Redirect to complete implementation
    window.location.href = 'game-complete.html';
  }
}