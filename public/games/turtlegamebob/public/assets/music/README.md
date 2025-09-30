# Music Directory

This directory contains all background music tracks for Bob The Turtle: Hero Of Turtle Dungeon Depths.

## Track List

### Core Music Tracks
- `menu_theme.ogg` - Main menu background music (2-3 minutes, looping)
- `dungeon_ambient.ogg` - General dungeon exploration (5-7 minutes, looping)
- `combat_theme.ogg` - Combat encounter music (3-4 minutes, looping)
- `boss_battle.ogg` - Boss fight music (4-5 minutes, looping)
- `victory_theme.ogg` - Victory/completion music (30-60 seconds, non-looping)

### Extended Music System
- `prologue_theme.ogg` - Cinematic style intro music
- `character_select.ogg` - Shell class selection screen
- `floor_transition.ogg` - Moving between floors
- `treasure_room.ogg` - Special treasure room music
- `shop_theme.ogg` - Merchant/shop encounter music
- `game_over.ogg` - Death/game over music
- `credits_theme.ogg` - End credits music

### Dynamic Music Layers
- `dungeon_base.ogg` - Base dungeon ambience
- `dungeon_tension.ogg` - Layer for nearby enemies
- `dungeon_danger.ogg` - Layer for low health/danger

## Audio Specifications

### Technical Requirements
- **Format:** OGG Vorbis (primary), MP3 (fallback)
- **Sample Rate:** 44.1 kHz
- **Bit Rate:** 128-192 kbps (compressed for web)
- **Channels:** Stereo
- **Volume:** Normalized to -6dB peak to prevent clipping

### Loop Points
- **Seamless Loops:** All looping tracks must have perfect loop points
- **Intro Sections:** Can have non-looping intro before main loop
- **Fade Points:** Include 0.5-1 second crossfade capability
- **Silence Padding:** No silence at start/end of files

## Musical Style Guidelines

### Ocean/Underwater Theme
- **Instruments:** Synthesized pads, ambient textures, aquatic sound design
- **Melody:** Flowing, organic melodies that suggest water movement
- **Harmony:** Open, spacious chords with reverb and delay effects
- **Rhythm:** Gentle, undulating rhythms (avoid harsh beats)

### Combat Music
- **Energy:** Higher tempo and intensity than exploration
- **Percussion:** More prominent drums and rhythmic elements
- **Tension:** Use dissonance and dynamic builds
- **Resolution:** Musical phrases that enhance combat flow

### Boss Battles
- **Epic Scale:** Orchestral or synthesized orchestral elements
- **Intensity:** Highest energy level in the game
- **Memorable Themes:** Each major boss should have unique musical identity
- **Dynamic Changes:** Music should adapt to boss fight phases

## Implementation Notes

### Adaptive Music System
- **Smooth Transitions:** Music changes based on game state
- **Layer Mixing:** Multiple audio layers can be mixed in real-time
- **Combat Triggers:** Music responds to entering/leaving combat
- **Emotional Pacing:** Music supports the emotional arc of gameplay

### Performance Considerations
- **File Size:** Keep individual tracks under 5MB when possible
- **Streaming:** Support for streaming longer tracks
- **Memory Usage:** Efficient loading and unloading of music
- **Mobile Optimization:** Compressed versions for mobile devices

## File Naming Conventions
- Use lowercase with underscores: `track_name.ogg`
- Indicate loop type: `_loop` for seamless loops
- Version numbers: `_v1`, `_v2` for iterations
- Descriptive names: `boss_kraken_battle` not `music_003`

## Volume Guidelines

### Relative Volume Levels
- **Menu Music:** 60% - Background ambience
- **Exploration:** 50% - Subtle background presence  
- **Combat:** 70% - More prominent but not overwhelming
- **Boss Battles:** 80% - Maximum impact
- **Victory/Stingers:** 60% - Celebratory but not jarring

### Dynamic Range
- **Quiet Sections:** Allow for peaceful exploration moments
- **Loud Sections:** Build tension and excitement appropriately
- **Transitions:** Smooth volume changes between sections
- **Master Limiting:** Gentle limiting to maintain consistency

## Audio Tools and Workflow
- **Recommended DAWs:** Reaper, Logic Pro, Ableton Live, FL Studio
- **Export Settings:** High quality source, compressed delivery
- **Plugin Recommendations:** Reverb, delay, chorus for underwater feel
- **Reference Tracks:** Study aquatic/underwater game soundtracks

## Quality Checklist
- [ ] Proper loop points with no clicks or pops
- [ ] Consistent volume levels across all tracks
- [ ] No clipping or distortion
- [ ] Appropriate file size for web delivery
- [ ] Matches the game's oceanic atmosphere
- [ ] Smooth transitions between sections
- [ ] Mobile-friendly compression
- [ ] Correct file naming convention


