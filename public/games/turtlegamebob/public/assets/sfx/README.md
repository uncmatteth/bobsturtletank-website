# Sound Effects Directory

This directory contains all sound effects for Bob The Turtle: Hero Of Turtle Dungeon Depths.

## Sound Effect Categories

### Player Actions
- `bob_attack.ogg` - Bob's basic attack sound
- `bob_hurt.ogg` - Bob taking damage
- `bob_death.ogg` - Bob's death sound
- `footsteps.ogg` - Footstep sounds for movement
- `bob_level_up.ogg` - Level up achievement sound

### Shell Class Abilities
- `shell_defender_stone_armor.ogg` - Stone armor activation
- `shell_defender_earth_spike.ogg` - Earth spike attack
- `swift_current_water_bolt.ogg` - Water bolt spell
- `swift_current_healing_spring.ogg` - Healing spring effect
- `fire_belly_flame_breath.ogg` - Fire breath attack
- `fire_belly_ignite.ogg` - Ignite spell effect

### Spell Casting
- `spell_fire.ogg` - Fire magic casting
- `spell_water.ogg` - Water magic casting  
- `spell_earth.ogg` - Earth magic casting
- `spell_lightning.ogg` - Lightning magic casting
- `spell_nature.ogg` - Nature magic casting
- `spell_void.ogg` - Void magic casting
- `spell_time.ogg` - Time magic casting

### Combat Sounds
- `weapon_swing.ogg` - Weapon attack sounds
- `weapon_hit.ogg` - Weapon connecting with enemy
- `shield_block.ogg` - Successful shield block
- `critical_hit.ogg` - Critical damage sound
- `enemy_death.ogg` - Enemy defeated sound
- `armor_clank.ogg` - Armor movement sounds

### Item & Inventory
- `item_pickup.ogg` - Picking up items
- `item_drop.ogg` - Dropping items
- `item_equip.ogg` - Equipping gear
- `item_unequip.ogg` - Removing gear
- `treasure_open.ogg` - Opening treasure chests
- `gold_pickup.ogg` - Collecting gold
- `rare_item_drop.ogg` - Special sound for rare items
- `legendary_item_drop.ogg` - Epic sound for legendary items

### User Interface
- `ui_click.ogg` - Button click sound
- `ui_hover.ogg` - Button hover sound
- `ui_error.ogg` - Error/invalid action sound
- `ui_confirm.ogg` - Confirmation sound
- `ui_cancel.ogg` - Cancel/back sound
- `inventory_open.ogg` - Opening inventory
- `inventory_close.ogg` - Closing inventory
- `page_turn.ogg` - Menu navigation

### Environment & Dungeon
- `door_open.ogg` - Opening doors
- `door_close.ogg` - Closing doors
- `door_locked.ogg` - Attempting to open locked door
- `stairs_down.ogg` - Descending to next floor
- `room_enter.ogg` - Entering new room
- `secret_found.ogg` - Discovering secret areas
- `trap_trigger.ogg` - Activating traps
- `water_splash.ogg` - Water environmental sounds

### Enemy Sounds
- `enemy_spotted.ogg` - Enemy detecting player
- `enemy_attack.ogg` - Enemy attack sounds
- `enemy_hurt.ogg` - Enemy taking damage
- `corrupted_fish_swim.ogg` - Corrupted sea life movement
- `jellyfish_float.ogg` - Jellyfish floating sound
- `crab_scuttle.ogg` - Crab movement
- `void_wraith_whisper.ogg` - Abyssal creature sounds
- `kraken_roar.ogg` - Boss creature sounds

### Ambient Sounds
- `dungeon_ambient.ogg` - General dungeon atmosphere
- `water_drips.ogg` - Cave water dripping
- `wind_howl.ogg` - Atmospheric wind
- `bubble_pop.ogg` - Underwater bubble sounds
- `coral_creak.ogg` - Organic environment sounds

## Audio Specifications

### Technical Requirements
- **Format:** OGG Vorbis (primary), MP3 (fallback)
- **Sample Rate:** 44.1 kHz
- **Bit Depth:** 16-bit
- **Channels:** Mono (most SFX), Stereo (ambient/spatial)
- **Duration:** 0.1-3 seconds for most SFX
- **File Size:** Under 100KB per sound effect

### Volume Guidelines
- **Normalize:** All SFX normalized to consistent levels
- **Range:** -12dB to -6dB peak levels
- **Dynamics:** Preserve natural dynamics, avoid over-compression
- **Mixing:** Balanced frequency response for game audio mix

## Sound Design Guidelines

### Oceanic Theme
- **Underwater Feel:** Add subtle reverb/delay for underwater ambience
- **Bubble Effects:** Incorporate bubble sounds where appropriate
- **Organic Textures:** Use natural, flowing sound characteristics
- **Aquatic Elements:** Water-based sound design for spells and movement

### 64-bit Pixel Aesthetic
- **Retro Style:** Blend modern production with nostalgic sound design
- **Clean Synthesis:** Use both organic and synthesized elements
- **Punchy Impact:** Clear, impactful sounds that cut through music
- **Nostalgic Feel:** Reference classic game audio while staying modern

### Spatial Audio Design
- **3D Positioning:** Sounds designed for spatial audio system
- **Distance Falloff:** Natural volume reduction with distance
- **Environmental Response:** Sounds react to room acoustics
- **Directional Cues:** Help players locate sound sources

## Implementation Notes

### Audio Triggers
- **Player Actions:** Immediate response to player input
- **Environmental:** Triggered by game state changes
- **Layered Sounds:** Multiple variations prevent repetition
- **Dynamic Mixing:** Sounds adapt to current audio mix

### Performance Optimization
- **Compression:** Efficient file sizes for web delivery
- **Streaming:** On-demand loading for less common sounds
- **Memory Management:** Smart caching of frequently used SFX
- **Mobile Considerations:** Optimized versions for mobile devices

### Variation System
- **Randomization:** Pitch and timing variations prevent monotony
- **Multiple Takes:** Several versions of common sounds
- **Layer Mixing:** Combine sound elements dynamically
- **Adaptive Playback:** Sounds respond to game context

## File Naming Conventions
- Use lowercase with underscores: `sound_name.ogg`
- Category prefixes: `bob_`, `enemy_`, `spell_`, `ui_`
- Action descriptors: `_attack`, `_hurt`, `_death`
- Variation numbers: `_01`, `_02` for multiple versions

## Quality Checklist
- [ ] Consistent volume levels across all SFX
- [ ] No clipping or distortion
- [ ] Appropriate file size for web delivery
- [ ] Matches oceanic/underwater theme
- [ ] Clean start/end points (no clicks)
- [ ] Proper frequency balance
- [ ] Compatible with spatial audio system
- [ ] Correct file naming convention


