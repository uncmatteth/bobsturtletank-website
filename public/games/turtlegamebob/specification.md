# 🐢 Bob's Roguelike - Game Specification

## What We're Building

A browser-based action roguelike where Bob the Turtle explores procedurally generated dungeons, fights enemies, collects items, and tries to survive as long as possible.

---

## Core Experience

### The Player Loop (30 seconds):
1. **Enter a room** - New dungeon room with enemies and items
2. **Fight enemies** - Real-time combat with Bob's attacks
3. **Collect items** - Health potions, weapons, armor
4. **Decide** - Continue deeper or retreat
5. **Repeat** - Until death or victory

### The Session Loop (10-20 minutes):
1. **Start fresh** - New dungeon, fresh Bob
2. **Explore 5-10 floors** - Getting progressively harder
3. **Die** - Permadeath, but keep experience/knowledge
4. **Try again** - With new strategy

---

## What Makes It Fun

### ✅ Immediate Satisfaction:
- Bob moves instantly when you press keys
- Attacks feel impactful (animation, sound, knockback)
- Enemies react immediately to damage
- Items give clear, immediate benefits

### ✅ Meaningful Choices:
- "Do I explore this dangerous room for better loot?"
- "Do I use my health potion now or save it?"
- "Which weapon should I equip?"
- "Should I fight or flee?"

### ✅ Varied Runs:
- Different dungeon layouts every time
- Random enemy placements
- Random item drops
- Different strategies work each run

### ✅ Clear Feedback:
- Health bar always visible
- Damage numbers show impact
- Items have obvious effects
- UI is minimal but informative

---

## Core Gameplay Systems

### 1. Movement & Animation
**What**: Bob moves in 4 directions (up, down, left, right)

**Why**: Simple controls, smooth animations using BrowserQuest sprites

**Experience**:
- Arrow keys or WASD to move
- Bob animates smoothly (walk cycles)
- Can't move through walls or enemies
- Movement feels responsive (no lag)

---

### 2. Combat System
**What**: Real-time combat with attack button

**Why**: More engaging than turn-based, feels like a real game

**Experience**:
- Spacebar to attack
- Bob swings weapon (attack animation)
- Enemies in range take damage
- Enemies attack back when close
- Knockback on hit adds juice
- Death is quick but fair

**Details**:
- **Attack range**: 1.5 tile radius around Bob
- **Attack speed**: 0.5 second cooldown
- **Damage**: 10-20 HP per hit (varies by weapon)
- **Enemy damage**: 5-15 HP per hit (varies by enemy)

---

### 3. Health System
**What**: Bob starts with 100 HP, enemies damage him, potions heal

**Why**: Core resource management, creates tension

**Experience**:
- Health bar at top of screen (green → yellow → red)
- Take damage = screen flash, knockback
- Death = game over screen, restart option
- Health potions restore 30 HP
- Max HP can increase with items

---

### 4. Inventory System
**What**: Bob can carry weapons, armor, and consumables

**Why**: Progression, choice, variety

**Experience**:
- Press 'I' to open inventory (or always visible)
- Click item to equip/use
- See item stats (damage, armor, effects)
- Limited slots (6-8 items max)
- Drop items to make room

**Item Categories**:
- **Weapons**: Swords, axes (different damage/speed)
- **Armor**: Increases defense, reduces damage taken
- **Consumables**: Health potions, buffs
- **Special**: Keys, quest items

---

### 5. Procedural Dungeon Generation
**What**: Each floor is randomly generated rooms connected by corridors

**Why**: Replayability, exploration, discovery

**Experience**:
- Enter through stairs at top
- Explore rooms and hallways
- Find enemies, items, treasures
- Exit through stairs at bottom
- Next floor is harder (more enemies, less items)

**Generation Rules**:
- 5-10 rooms per floor
- 1 starting room (safe)
- 1 exit room (stairs down)
- 3-7 combat rooms (enemies)
- 1-2 treasure rooms (lots of items)
- Corridors connect all rooms
- No unreachable areas

---

### 6. Enemy AI
**What**: Enemies wander, chase Bob when seen, attack when close

**Why**: Creates challenge and danger

**Experience**:
- Idle enemies wander randomly
- See Bob → chase Bob
- Get close → attack Bob
- Take damage → knockback
- Die → drop loot

**Enemy Types** (using BrowserQuest sprites):
1. **Goblin** - Weak, fast, common
2. **Skeleton** - Medium, slow, undead
3. **Orc** - Strong, medium speed
4. **Griffin** - Flying, fast, rare
5. **Boss** - Unique, very strong, end of floor

**Difficulty Scaling**:
- Floor 1: 2-3 enemies per room, 50 HP each
- Floor 5: 5-7 enemies per room, 150 HP each
- Boss floors: 1 boss, 300+ HP

---

### 7. Loot System
**What**: Enemies drop items, chests contain items

**Why**: Rewards exploration and combat

**Experience**:
- Kill enemy → item appears
- Walk over item → auto-pickup
- Chest → click to open → items appear
- Rare items glow/sparkle

**Drop Rates**:
- **Common** (50%): Health potions, basic weapons
- **Uncommon** (30%): Better weapons, armor
- **Rare** (15%): Special items, buffs
- **Epic** (5%): Best weapons, unique effects

---

### 8. Progression
**What**: Bob gets stronger through items, not levels

**Why**: Simple system, rewards play style

**Experience**:
- No XP or levels
- All progression through items
- Find better weapons → deal more damage
- Find better armor → take less damage
- Find more health → survive longer
- Skill improves with practice

---

## User Interface

### Minimal HUD (always visible):
- **Top-left**: Health bar (100/100 HP)
- **Top-right**: Floor number (Floor 3)
- **Bottom-left**: Equipped weapon icon
- **Bottom-right**: Equipped armor icon
- **Bottom-center**: Quick item slots (1-4 keys)

### Inventory Screen (press 'I'):
- **Grid layout**: 8 item slots
- **Item tooltips**: Hover for stats
- **Equip buttons**: Click to equip
- **Drop button**: Click to drop
- **Close**: Press 'I' again or ESC

### Death Screen:
- **Big text**: "YOU DIED"
- **Stats**: Floors reached, enemies killed, items found
- **Button**: "Try Again" (restarts)
- **Button**: "Main Menu" (exits to home)

---

## Controls

### Keyboard:
- **Arrow Keys / WASD**: Move Bob
- **Spacebar**: Attack
- **I**: Open/close inventory
- **1-4**: Use quick items
- **E**: Interact (open chests, doors)
- **ESC**: Pause menu

### Mouse (optional):
- **Click**: Move Bob to location
- **Right-click**: Attack direction
- **Scroll**: Zoom in/out

---

## Visual Style

### Art Direction:
- **Pixel art**: BrowserQuest style
- **Top-down view**: Classic roguelike perspective
- **Colorful**: Vibrant but not garish
- **Readable**: Clear contrast, distinct sprites
- **Animated**: Smooth movement, attack animations

### Camera:
- **Fixed on Bob**: Always centered
- **Smooth follow**: Slight ease-in
- **Zoom level**: Show 15x15 tile area
- **No minimap**: Exploration is blind

### Effects:
- **Particle effects**: Blood splatter, sparkles, smoke
- **Screen shake**: On hit, on death
- **Flash effects**: Damage, healing, power-ups
- **Sprite animations**: All sprites animated

---

## Audio (Future)

### Sound Effects:
- **Footsteps**: Different per floor type
- **Attack sounds**: Sword swish, axe thud
- **Hit sounds**: Enemy hit, Bob hit
- **Item pickup**: Coin clink, potion gulp
- **Death sound**: Dramatic game over

### Music:
- **Main theme**: Adventurous, upbeat
- **Combat theme**: Intense, driving
- **Boss theme**: Epic, climactic
- **Game over**: Sad but motivational

---

## Technical Requirements

### Performance:
- **60 FPS**: Smooth gameplay always
- **Quick load**: < 3 second initial load
- **No lag**: Input response < 16ms
- **Efficient**: No memory leaks

### Browser Support:
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

### Responsive:
- **Desktop**: 1920x1080 optimal
- **Laptop**: 1366x768 minimum
- **Mobile**: Playable but not optimal

---

## Out of Scope (Not Building)

### ❌ Not in MVP:
- Multiplayer
- Cloud saves
- Achievements
- Story mode
- Character customization
- Crafting system
- Skill trees
- Complex stats
- Dialogue system
- Quest system

### ❌ Nice to Have (Later):
- Sound effects
- Music
- Particle effects
- Boss fights
- Special rooms
- Unlockables

---

## Success Metrics

### It's Working When:
- You can play for 10 minutes without bugs
- Combat feels responsive
- Dying feels fair
- You want to try "just one more run"

### It's Great When:
- Friends ask to play
- Players beat floor 5
- Different strategies emerge
- Speedrunners appear
- Reddit posts about it

---

## File Structure

```
turtlegamebob/
├── index.html              # Game entry point
├── game.js                 # Main game loop
├── player.js               # Bob character logic
├── enemy.js                # Enemy AI and types
├── dungeon.js              # Procedural generation
├── inventory.js            # Item management
├── combat.js               # Combat system
├── ui.js                   # HUD and menus
├── sprites.js              # Sprite loading and animation
├── master-sprites/         # All game sprites
└── README.md               # Setup instructions
```

---

**This specification defines WHAT we're building and WHY. Next step: Technical plan (HOW we'll build it).**


