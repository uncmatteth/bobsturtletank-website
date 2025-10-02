/**
 * Create fallback assets for the game
 * This script creates simple colored squares for fallback assets
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// Create fallback assets
createFallbackAsset('hero.png', '#00FF00'); // Green
createFallbackAsset('enemy.png', '#FF0000'); // Red
createFallbackAsset('item.png', '#FFFF00'); // Yellow
createFallbackAsset('effect.png', '#00FFFF'); // Cyan
createFallbackAsset('environment.png', '#8B4513'); // Brown
createFallbackAsset('ui.png', '#FFFFFF'); // White

console.log('✅ Fallback assets created');

/**
 * Create a simple colored square asset
 */
function createFallbackAsset(filename, color) {
  // Create canvas
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');
  
  // Fill with color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 32, 32);
  
  // Add border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 30, 30);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`assets/fallback/${filename}`, buffer);
  
  console.log(`Created: assets/fallback/${filename}`);
}
