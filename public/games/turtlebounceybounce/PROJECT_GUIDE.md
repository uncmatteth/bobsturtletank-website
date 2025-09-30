# Turtle Bouncer – Project Guide
GUIDE_VERSION: 1   |   CANONICAL_KEY: TURTLE-BOUNCE-V1  

## 1. Project Overview
**Project Name:** Turtle Bouncer  
**High-Level Goal:** Create an addictive infinite-jumping web game where players control a turtle bouncing on food platforms to reach maximum height  
**Primary Tech Stack:** Vite + TypeScript + Phaser 3 + Upstash Redis + Vercel  
**Key Features (User Stories):**  
1. **As a** player, **I want to** aim and control my turtle's bounce power, **so that** I can strategically reach higher platforms.  
2. **As a** player, **I want to** see my height progress in turtle units, **so that** I feel rewarded for improving.
3. **As a** player, **I want to** compete on global leaderboards, **so that** I can compare my best height with others.
4. **As a** player, **I want to** enjoy shuffled background music with volume controls, **so that** the game feels polished and engaging.
5. **As a** player, **I want to** experience progressively harder difficulty, **so that** the game stays challenging as I improve.

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
  | Turtle | Player Entity | The bouncing character controlled by the player |
  | Platform | Game Object | Food items that turtle bounces on (disappear after use) |
  | Bounce | Action | Physics-based jump with aim/power mechanics |
  | Height | Score Metric | Vertical distance measured in turtle units |
  | Session | Game Instance | One playthrough from start to death |
  | Leaderboard | Feature | Global high score list with player names |
  | Background | Visual Layer | Scrolling scenery that changes with height |
  | Aim Line | UI Element | Visual guide showing bounce direction/power |
  | Power | Control Input | Bounce strength determined by drag distance |

- **Synonyms → Canonical (normalize user phrasing):**  
  *(Any time a synonym appears in prompts/specs/code, normalize to the Canonical term. If ambiguous, ask before proceeding.)*  
  | Synonym (user phrase) | Map to Canonical |
  |---|---|
  | character | Turtle |
  | player | Turtle |
  | food platform | Platform |
  | trampoline | Platform |
  | food thing | Platform |
  | jump | Bounce |
  | leap | Bounce |
  | hop | Bounce |
  | score | Height |
  | altitude | Height |
  | game | Session |
  | playthrough | Session |
  | high scores | Leaderboard |
  | rankings | Leaderboard |
  | scenery | Background |
  | targeting | Aim Line |
  | strength | Power |
  | force | Power |

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



