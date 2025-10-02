# 🐢 Bob's Roguelike - Constitution

## Core Principles

### 1. Simplicity Over Complexity
- **No over-engineering**: Keep the codebase simple and maintainable
- **No enterprise patterns**: Avoid ECS, dependency injection, or complex abstractions
- **Plain JavaScript/Canvas**: Use vanilla JS with HTML5 Canvas, no heavy frameworks
- **Readable code**: Clear, self-documenting code over clever solutions

### 2. Fun First, Polish Second
- **Gameplay over graphics**: Focus on making it fun to play before making it pretty
- **Tight controls**: Responsive, immediate feedback
- **Clear progression**: Players should always know what to do next
- **Risk vs Reward**: Meaningful choices at every turn

### 3. Use What We Have
- **BrowserQuest sprites**: We have 1300 professional sprites ready to use
- **Proven assets**: No AI generation needed, stick with hand-crafted art
- **Bob as hero**: Use the complete BrowserQuest Bob animations (50+ frames)
- **Enemy variety**: 100+ enemy sprites already available

### 4. Classic Roguelike Elements
- **Procedural generation**: Each dungeon is unique
- **Permadeath**: Death is permanent, start over
- **Turn-based or real-time**: TBD based on what's more fun
- **Resource management**: Health, inventory, equipment
- **Progressive difficulty**: Deeper = harder

### 5. Bob Universe Lore
- **Story from turtlebook**: Tie into the 69-chapter adventure
- **143 locations**: Use the mapped locations from the book
- **Character consistency**: Bob is a turtle hero, not generic player
- **Artifacts from book**: Use the catalogued artifacts as items

### 6. Quality Standards (from Spec Kit)
- **Complete implementation**: No stubs or placeholders
- **Error handling**: Proper error messages and recovery
- **Testing**: Must be playable and bug-free
- **Performance**: Smooth 60 FPS on modern browsers
- **Documentation**: Clear README and code comments

### 7. Development Philosophy
- **Iterate quickly**: Build, test, refine
- **Playtest often**: If it's not fun, change it
- **No feature creep**: Keep scope tight
- **Ship it**: Done is better than perfect

## Non-Negotiables

### Must Have:
- ✅ BrowserQuest Bob sprites (walk, attack, idle animations)
- ✅ Procedurally generated dungeons
- ✅ Combat system (simple but satisfying)
- ✅ Inventory system
- ✅ Health/death mechanics
- ✅ At least 5 enemy types
- ✅ At least 10 item types
- ✅ Progressive difficulty

### Must NOT Have:
- ❌ Complex ECS architecture
- ❌ Multiple "complete" versions
- ❌ Over-engineered systems
- ❌ Unfinished features
- ❌ Confusing UI
- ❌ Poor performance

## Success Criteria

### It's "Done" When:
1. You can play through 5+ dungeon levels
2. Combat feels responsive and fun
3. Death is meaningful but not frustrating
4. Sprites animate smoothly
5. No game-breaking bugs
6. Performance is consistently good
7. Someone can pick it up and play without instructions

### It's "Amazing" When:
1. You want to play "just one more run"
2. Each run feels different
3. Finding items is exciting
4. Combat requires strategy
5. Death teaches you something
6. Runs last 10-20 minutes
7. You tell your friends to try it

## Technical Constraints

- **Browser-based**: Must run in modern browsers (Chrome, Firefox, Safari)
- **No server**: Entirely client-side
- **Lightweight**: Load time < 3 seconds
- **Mobile-friendly**: Responsive design (optional but nice)
- **Keyboard controls**: Arrow keys + WASD + spacebar
- **Save system**: LocalStorage for high scores/unlocks (optional)

## Design Inspiration

**Good Examples:**
- Binding of Isaac (gameplay loop)
- Enter the Gungeon (tight controls)
- Slay the Spire (deck building simplicity)
- Original Rogue (procedural generation)
- Hades (feel-good progression)

**What We're NOT Making:**
- NetHack (too complex)
- Dwarf Fortress (too deep)
- Any half-finished prototype we've made before

## Development Priorities

### Phase 1: Core Loop (Week 1)
1. Bob moves and animates
2. Dungeon generates
3. Enemies spawn and move
4. Basic combat (attack/damage)
5. Death/restart

### Phase 2: Gameplay (Week 2)
1. Multiple enemy types
2. Items and inventory
3. Health system
4. Level progression
5. Basic UI

### Phase 3: Polish (Week 3)
1. Sound effects
2. Particle effects
3. Better dungeon generation
4. More items/enemies
5. Balance tuning

### Phase 4: Extra Credit
1. Boss fights
2. Unlockables
3. High score system
4. Special rooms
5. Story integration

---

**Remember**: Keep it simple. Keep it fun. Ship it.

**If in doubt**: Ask "Is this making the game more fun?" If no, cut it.

**When stuck**: Play the game. Feel what's wrong. Fix that one thing.

---

This constitution guides all decisions for Bob's Roguelike. When in doubt, refer back to these principles.

