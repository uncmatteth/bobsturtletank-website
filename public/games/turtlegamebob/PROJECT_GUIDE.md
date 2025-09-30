# AI Coding Bible – Master Project Guide for Cursor
GUIDE_VERSION: 2   |   CANONICAL_KEY: TURTLE-HERO-LEGENDARY
> Single source of truth for every AI-assisted coding session. Read and obey this before producing code.

## 1. Project Overview
**Project Name:** Bob The Turtle: Hero Of Turtle Dungeon Depths  
**High-Level Goal:** Massive scale roguelike RPG with legendary-tier depth, production-ready quality, and infinite replayability  
**Primary Tech Stack:** Vite + TypeScript + Phaser 3 + Web Audio API + PWA + Industry-Standard Libraries  
**Key Features (User Stories):**  
1. **As a** player, **I want to** choose from 3 distinct Shell Classes with unique abilities, **so that** I can experience different playstyles and builds.  
2. **As a** player, **I want to** explore procedurally generated dungeon depths with 500+ enemy types, **so that** every run feels fresh and challenging.  
3. **As a** player, **I want to** collect and equip 200+ weapons and armor with random bonuses, **so that** I can customize my character and optimize builds.  
4. **As a** player, **I want to** progress through skill trees and unlock achievements, **so that** I have long-term goals and meta-progression.  
5. **As a** player, **I want to** play seamlessly on desktop and mobile with touch controls, **so that** I can enjoy the game anywhere.

## 2. Workflow Rules
- **Plan first, code second** (use §11 template). Approval required before coding.
- One plan step = one implementation task; do not skip steps.
- Update `WORKFLOW_STATE.md` after each step.
- For new features/changes: **pause**, update plan, get approval, then continue.

## 3. File & Folder Architecture

**Frontend**

/src
/components
/pages
/hooks
/context
/utils
/styles
/features/[feature-name]
/tests

**Backend**

- Group by feature.  
- Business logic lives in **services**, not routes.

## 4. Naming Conventions (follow EXACTLY)
| Item | Style | Example |
|------|-------|---------|
| Variables / Functions | camelCase (JS/TS) · snake_case (Python) | `fetchLeaderboardData`, `leaderboard_entries` |
| Classes / Components | PascalCase | `LeaderboardTable`, `UserProfile` |
| Constants / Env Vars | ALL_CAPS_WITH_UNDERSCORES | `MAX_RETRIES`, `API_URL` |
| Files | kebab-case (frontend) · snake_case.py (backend) | `leaderboard-table.tsx`, `leaderboard_service.py` |
| DB Tables | plural snake_case | `leaderboards` |
| DB Fields | snake_case | `created_at`, `user_id` |
| API Routes | REST, plural nouns | `/leaderboards`, `/leaderboards/:id` |
| URLs | kebab-case | `/leaderboard-overview` |
| Events | namespace.action | `leaderboard.created` |

*Never alternate singular/plural or switch casing once chosen.*

## 5. State Management (Frontend)
- Choose one: Context API / Redux Toolkit / Zustand / MobX.  
- Slices/stores named by domain (`leaderboardSlice`).  
- Async data via React Query/SWR if selected (document usage in the plan).

## 6. Data Models & DTOs
- TypeScript interfaces / Pydantic models: PascalCase + `Model` or `DTO`.  
- Must match API schema exactly; define mapping rules once and reuse.

## 7. Error & Logging
- Custom errors: `PascalCaseError` (e.g., `LeaderboardNotFoundError`).  
- Log format: `[timestamp] [level] [context] message`.  
- No `console.log`/prints in production paths; use logger.

## 8. Testing Policy
- Unit tests for every business-logic function or component.  
- Tests mirror file names/paths (`leaderboard_service.test.py`, `leaderboard-table.test.tsx`).  
- Mock externals unless a real integration test is intended.  
- **Coverage:** 100% of business logic; ≥80% overall branches. New code must not reduce coverage.

## 9. Documentation
- Docstrings/JSDoc for functions/classes/modules: purpose, params, returns, side effects.
- Document complex logic and architectural decisions.

## 10. Git Workflow
- Branches: `feature/...`, `fix/...`, `chore/...`.  
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `perf:`, `build:`, `ci:`, `chore:`).

## 11. Plan Template (Must be completed before coding)
**Summary** – What is being built  
**Assumptions** – Inferred requirements/constraints  
**References** – Files, docs, APIs, libraries  
**Implementation Steps** – Numbered, atomic steps (each maps to code/tests)  
**Confidence Level** – High/Medium/Low (per step or overall)  
**Questions** – Clarifications needed before coding

## 12. Workflow State Tracking
Maintain `WORKFLOW_STATE.md` in repo root:
- **Phase:** ANALYZE / PLAN / CODE / VALIDATE  
- **Current Task:** [fill in]  
- **Completed Tasks:** [checked-off plan steps]  
- **Notes:** Key decisions, blockers

## 13. Glossary – Canonical Terms **and Synonyms**
- **Canonical Terms (authoritative names; use these everywhere):**  
  | Canonical | Type | Definition |
  |---|---|---|
  | Hero | Domain entity | Bob The Turtle - the main playable character with Shell Classes. |
  | ShellClass | Domain entity | Character class defining abilities (Shell Defender, Swift Current, Fire Belly). |
  | DungeonFloor | Domain entity | Procedurally generated level in the dungeon depths. |
  | Equipment | Domain entity | Weapons and armor with stats and random bonuses. |
  | Enemy | Domain entity | Hostile creatures that populate dungeon floors. |
  | Skill | Domain entity | Unlockable abilities in class-specific skill trees. |
  | Achievement | Domain entity | Unlockable goals that provide rewards and progression. |
  | SaveData | Resource | Player progress including stats, equipment, and unlocks. |

- **Synonyms → Canonical (normalize user phrasing):**  
  *(Any time a synonym appears in prompts/specs/code, normalize to the Canonical term. If ambiguous, ask before proceeding.)*  
  | Synonym (user phrase) | Map to Canonical |
  |---|---|
  | turtle | Hero |
  | character | Hero |
  | player | Hero |
  | class | ShellClass |
  | build | ShellClass |
  | level | DungeonFloor |
  | floor | DungeonFloor |
  | stage | DungeonFloor |
  | weapon | Equipment |
  | armor | Equipment |
  | gear | Equipment |
  | item | Equipment |
  | monster | Enemy |
  | mob | Enemy |
  | creature | Enemy |
  | ability | Skill |
  | power | Skill |
  | spell | Skill |
  | unlock | Achievement |
  | trophy | Achievement |
  | badge | Achievement |
  | save | SaveData |
  | progress | SaveData |

**Normalization Rules:**  
- Always map synonyms to their Canonical term **before** planning or coding.  
- Never create parallel entities; if a truly new concept appears, propose a new Canonical term and add it here **after approval**.

## 14. Context Receipt Contract
Before coding any step, the assistant must echo:  
- `GUIDE_VERSION` and `CANONICAL_KEY` (exact values),  
- Phase + Current Task from `WORKFLOW_STATE.md`,  
- Three Canonical terms (exact casing/plural) from §13.  
If any item cannot be echoed exactly, STOP and reload/clarify before proceeding.

## 15. Manifest Link
- The **single source of truth** for routes/pages/components/styles/APIs is `MANIFEST.app.yml`.  
- Any change to these must be reflected in the manifest **before** code is written.

## 16. Enforcement
- If a prompt conflicts with this guide, stop and clarify.  
- Updates to rules must be written here first; only then may code follow them.
## 17. Industry-Standard Libraries & Assets

To ensure professional quality and development efficiency, the project will leverage the following industry-standard libraries and assets:

**Core Libraries:**
- **rot.js** - Industry-standard roguelike toolkit for procedural dungeon generation
- **Rex UI Plugin** - Professional UI components for Phaser games
- **phaser-ecs** - Entity Component System for better game architecture
- **matter-physics** - Advanced physics for more realistic interactions
- **howler.js** - Professional audio management for Web Audio API
- **tween.js** - Advanced animation library for smooth effects
- **fontawesome** - Professional icons for UI elements

**Asset Sources:**
- **OpenGameArt.org** - Free CC-licensed sprites and tilesets
- **itch.io** - Professional roguelike asset packs
- **Kenney.nl** - High-quality game assets with permissive licenses
- **Game-Icons.net** - Professional UI and ability icons

**Development Tools:**
- **Texture Packer** - Professional sprite sheet creation
- **Tiled Map Editor** - Industry-standard tilemap creation
- **Aseprite** - Pixel art creation and animation
- **Audacity** - Audio editing for SFX

## 18. Bob The Turtle - Game Architecture

**Core Game Loop:** Explore Dungeon → Fight Enemies → Collect Loot → Upgrade Character → Descend Deeper → Permadeath/Meta-Progression

**Game Scenes:**
- **BootScene:** Engine setup, scale configuration, input initialization
- **PreloadScene:** Load texture atlases, audio, UI assets
- **MenuScene:** Title screen, character creation, settings
- **GameScene:** Main dungeon exploration and combat
- **InventoryScene:** Equipment management and character stats
- **DeathScene:** Game over, stats, meta-progression

**Key Systems:**
- **Combat System:** Real-time action combat with spell casting
- **Inventory System:** 18 equipment slots with drag-and-drop
- **Progression System:** XP, skill trees, talent points
- **Procedural Generation:** Floor layouts, enemy spawns, loot tables
- **Save System:** Browser localStorage with validation
- **Audio System:** Dynamic music, spatial SFX
- **Performance System:** Texture atlasing, memory management

**Asset Organization:**
- **Music:** 28 adaptive background tracks (`public/assets/music/`)
- **SFX:** Combat, UI, achievement sounds (`public/assets/sfx/`)
- **Sprites:** 64x64 pixel art, texture atlases for performance
- **UI:** HUD elements, menus, inventory screens

**Quality Standards:**
- **Performance:** 60 FPS desktop, 30+ FPS mobile
- **Compatibility:** PWA installable, touch controls
- **Scale:** 500+ enemies, 200+ equipment items, infinite floors
- **Polish:** Screen shake, particles, visual feedback


