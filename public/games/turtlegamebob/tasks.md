# 🐢 Bob's Roguelike - Implementation Tasks

## Phase 1: Core Loop (Est: 2-3 hours)

### Task 1.1: Setup Project Structure ✅
- [x] Create clean folder structure
- [x] Keep master-sprites folder
- [x] Create index.html with canvas
- [x] Create js/ folder for modules
- [x] Create css/ folder for styles

### Task 1.2: Game Loop & Canvas
- [ ] Set up HTML5 canvas (1920x1080)
- [ ] Create game.js with requestAnimationFrame loop
- [ ] Implement deltaTime calculation
- [ ] Add FPS counter (debug mode)
- [ ] Test: Black screen running at 60 FPS

### Task 1.3: Sprite Loader
- [ ] Create sprites.js module
- [ ] Load BrowserQuest Bob idle animation (5 frames)
- [ ] Load Bob walk animations (4 directions × 4 frames)
- [ ] Load Bob attack animations (4 directions × 3 frames)
- [ ] Create sprite drawing function
- [ ] Test: Bob idle sprite visible on canvas

### Task 1.4: Player Movement
- [ ] Create player.js module
- [ ] Player state object (x, y, direction, speed)
- [ ] Create input.js for keyboard handling
- [ ] Arrow keys / WASD move player
- [ ] Update player position based on input
- [ ] Test: Bob moves around screen

### Task 1.5: Player Animation
- [ ] Implement animation frame cycling
- [ ] Switch to walk animation when moving
- [ ] Switch to idle when stopped
- [ ] Face correct direction based on movement
- [ ] Test: Bob walks smoothly with animation

---

## Phase 2: Combat (Est: 2-3 hours)

### Task 2.1: Basic Enemy
- [ ] Create enemy.js module
- [ ] Define enemy data structure
- [ ] Load goblin sprite from master-sprites
- [ ] Spawn 1 goblin at fixed position
- [ ] Render enemy sprite
- [ ] Test: Goblin visible on screen

### Task 2.2: Enemy AI
- [ ] Implement idle state (random wander)
- [ ] Implement chase state (follow player)
- [ ] Calculate distance to player
- [ ] Switch states based on distance
- [ ] Update enemy position
- [ ] Test: Goblin chases Bob when close

### Task 2.3: Combat System
- [ ] Create combat.js module
- [ ] Spacebar triggers player attack
- [ ] Play attack animation
- [ ] Define attack range (50px radius)
- [ ] Detect enemies in range
- [ ] Deal damage to enemies
- [ ] Test: Bob can hit goblin

### Task 2.4: Health & Death
- [ ] Add health to player (100 HP)
- [ ] Add health to enemies (30 HP goblin)
- [ ] Enemy attacks player when close
- [ ] Display damage numbers
- [ ] Enemy death (remove from game)
- [ ] Player death (game over screen)
- [ ] Test: Combat feels responsive

### Task 2.5: Visual Feedback
- [ ] Screen shake on hit
- [ ] Knockback on damage
- [ ] Flash effect when hurt
- [ ] Simple particle effect on hit
- [ ] Test: Combat feels juicy

---

## Phase 3: Dungeon (Est: 2-3 hours)

### Task 3.1: Simple Dungeon
- [ ] Create dungeon.js module
- [ ] Define tile types (wall, floor)
- [ ] Create 2D array for tiles
- [ ] Hard-code simple room (20×20)
- [ ] Render walls and floors
- [ ] Test: Room visible

### Task 3.2: Collision Detection
- [ ] Check wall collision in movement
- [ ] Prevent player from moving through walls
- [ ] Prevent enemies from moving through walls
- [ ] Test: Can't walk through walls

### Task 3.3: Camera System
- [ ] Center camera on player
- [ ] Calculate viewport offset
- [ ] Apply offset to all rendering
- [ ] Smooth camera follow
- [ ] Test: Camera follows Bob

### Task 3.4: Procedural Room Generation
- [ ] Generate random room size
- [ ] Place walls around perimeter
- [ ] Fill interior with floor
- [ ] Generate 5 random rooms
- [ ] Test: Different rooms each time

### Task 3.5: Room Connections
- [ ] Connect rooms with corridors
- [ ] L-shaped corridor algorithm
- [ ] Ensure all rooms reachable
- [ ] Place stairs (start & exit)
- [ ] Test: Can navigate full dungeon

### Task 3.6: Enemy Spawning
- [ ] Spawn enemies in random rooms
- [ ] Scale enemy count by floor
- [ ] Avoid spawning in start room
- [ ] Multiple enemy types
- [ ] Test: Enemies distributed well

---

## Phase 4: Items (Est: 2-3 hours)

### Task 4.1: Item System
- [ ] Create inventory.js module
- [ ] Define item data structures
- [ ] Item types: weapon, armor, potion
- [ ] Load item sprites
- [ ] Test: Item data loading

### Task 4.2: Item Drops
- [ ] Enemy drops item on death
- [ ] Item appears on ground
- [ ] Render ground items
- [ ] Random drop tables
- [ ] Test: Enemies drop loot

### Task 4.3: Inventory UI
- [ ] Create ui.js module
- [ ] Draw inventory grid (4×2 slots)
- [ ] Press 'I' to open/close
- [ ] Click slot to select item
- [ ] Display item tooltips
- [ ] Test: Inventory opens/closes

### Task 4.4: Item Pickup
- [ ] Detect player touching item
- [ ] Auto-pickup item
- [ ] Add to inventory
- [ ] Remove from ground
- [ ] Full inventory handling
- [ ] Test: Can pick up items

### Task 4.5: Equipment System
- [ ] Equip weapon from inventory
- [ ] Equip armor from inventory
- [ ] Update player stats
- [ ] Show equipped items in HUD
- [ ] Unequip/swap items
- [ ] Test: Equipment changes stats

### Task 4.6: Consumables
- [ ] Use potion from inventory
- [ ] Heal player health
- [ ] Remove consumed item
- [ ] Quick-use hotkeys (1-4)
- [ ] Test: Potions work

---

## Phase 5: Polish (Est: 2-3 hours)

### Task 5.1: HUD System
- [ ] Health bar (top-left)
- [ ] Floor number (top-right)
- [ ] Equipped weapon icon (bottom-left)
- [ ] Equipped armor icon (bottom-right)
- [ ] Quick item slots (bottom-center)
- [ ] Test: HUD always visible

### Task 5.2: Menu Screens
- [ ] Main menu (on load)
- [ ] Pause menu (ESC key)
- [ ] Death screen with stats
- [ ] Restart button
- [ ] Test: All menus work

### Task 5.3: Floor Progression
- [ ] Stairs down to next floor
- [ ] Increase difficulty per floor
- [ ] Generate new dungeon
- [ ] Reset player position
- [ ] Track current floor
- [ ] Test: Can reach floor 5

### Task 5.4: Balance & Tuning
- [ ] Adjust enemy health/damage
- [ ] Adjust item drop rates
- [ ] Adjust player stats
- [ ] Adjust dungeon difficulty curve
- [ ] Playtest extensively
- [ ] Test: Game feels fair

### Task 5.5: Visual Polish
- [ ] Add more particle effects
- [ ] Improve screen shake
- [ ] Add damage number animations
- [ ] Polish UI appearance
- [ ] Add transition effects
- [ ] Test: Looks professional

### Task 5.6: Bug Fixes
- [ ] Fix collision edge cases
- [ ] Fix animation glitches
- [ ] Fix inventory bugs
- [ ] Fix spawning issues
- [ ] Performance optimization
- [ ] Test: No game-breaking bugs

---

## Phase 6: Extra Credit (Optional)

### Task 6.1: More Enemy Types
- [ ] Add Skeleton enemy (50 HP, slow)
- [ ] Add Orc enemy (80 HP, strong)
- [ ] Add Griffin enemy (60 HP, fast)
- [ ] Unique behaviors per enemy
- [ ] Test: Variety is fun

### Task 6.2: Boss Fights
- [ ] Boss room on every 5th floor
- [ ] Unique boss sprite
- [ ] 300+ HP, special attacks
- [ ] Boss loot (rare items)
- [ ] Test: Boss is challenging

### Task 6.3: Sound Effects
- [ ] Load audio files
- [ ] Play attack sounds
- [ ] Play hurt sounds
- [ ] Play pickup sounds
- [ ] Play death sound
- [ ] Test: Audio enhances feel

### Task 6.4: Special Rooms
- [ ] Treasure room (lots of items)
- [ ] Empty room (safe rest)
- [ ] Ambush room (many enemies)
- [ ] Shrine room (heal fully)
- [ ] Test: Room variety

### Task 6.5: Unlockables
- [ ] Track high score
- [ ] Save to LocalStorage
- [ ] Unlock new starting items
- [ ] Track total kills
- [ ] Test: Progression feels good

---

## Current Progress

- [x] Phase 0: Spec Kit Documentation
  - [x] Constitution
  - [x] Specification
  - [x] Plan
  - [x] Tasks
- [ ] Phase 1: Core Loop
- [ ] Phase 2: Combat
- [ ] Phase 3: Dungeon
- [ ] Phase 4: Items
- [ ] Phase 5: Polish
- [ ] Phase 6: Extra Credit

---

## Next Steps

1. **Clean up folder** - Remove old code, keep sprites
2. **Task 1.1** - Set up project structure
3. **Task 1.2** - Game loop & canvas
4. **Continue sequentially** through all tasks

**Estimated Total Time**: 12-15 hours for Phases 1-5

---

## Success Criteria Checklist

### Minimum Viable Game:
- [ ] Bob moves smoothly with animations
- [ ] Combat feels responsive
- [ ] Enemies chase and attack
- [ ] Dungeons generate procedurally
- [ ] Items can be picked up and equipped
- [ ] Health system works
- [ ] Death and restart works
- [ ] Can reach floor 5
- [ ] Runs at 60 FPS
- [ ] No game-breaking bugs

### Amazing Game:
- [ ] "Just one more run" feeling
- [ ] Different strategies work
- [ ] Finding items is exciting
- [ ] Combat requires skill
- [ ] Death feels fair
- [ ] Want to show friends

---

**Ready to implement! Starting with Phase 1...**


