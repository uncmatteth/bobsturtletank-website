import Phaser from 'phaser';
import { BootScene } from './scenes/boot-scene';
import { PreloadScene } from './scenes/preload-scene';
import { GameScene } from './scenes/game-scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true
  },
  scene: [BootScene, PreloadScene, GameScene]
};

// Create and start the game
const game = new Phaser.Game(config);

// Handle window resize for responsive design
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});


