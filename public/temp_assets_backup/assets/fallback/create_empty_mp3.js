/**
 * Create empty MP3 files for fallback sounds
 * This script creates empty MP3 files for fallback sounds
 */

const fs = require('fs');

// List of sound files to create
const sounds = [
  'collect.mp3',
  'door_open.mp3',
  'door_close.mp3',
  'stairs.mp3',
  'torch_light.mp3',
  'torch_extinguish.mp3',
  'chest_open.mp3',
  'trap_trigger.mp3',
  'magic_spell.mp3',
  'fire.mp3',
  'ice.mp3',
  'lightning.mp3',
  'healing.mp3'
];

// Empty MP3 file content (44 bytes header)
const emptyMp3 = Buffer.from([
  0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x54, 0x41, 0x4C, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00
]);

// Create each sound file
for (const sound of sounds) {
  fs.writeFileSync(`assets/fallback/${sound}`, emptyMp3);
  console.log(`Created: assets/fallback/${sound}`);
}

console.log('✅ Fallback sounds created');
