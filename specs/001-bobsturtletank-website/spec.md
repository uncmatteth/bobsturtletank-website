# Bob's Turtle Tank Website - Complete Specification

## Overview

Build a comprehensive website for bobsturtletank.fun that showcases Bob the Turtle's Adventure Realm, integrates browser games, embeds the live turtle tank stream, and provides interactive exploration of the 69-chapter book series.

## Core Requirements

### 1. Homepage & Navigation

**Primary Navigation:**
- Homepage (featured content + stream)
- Games Arcade (hub for all games)
- Book Section (chapters, characters, artifacts, locations)
- About Bob's Tank

**Homepage Features:**
- Hero section introducing Bob the Turtle and the Adventure Realm
- Live stream embed (sidebar, collapsible, pop-out capability)
- Featured game of the week
- Latest chapter highlight
- Quick links to character encyclopedia and trivia game

### 2. Live Stream Integration

**Requirements:**
- Embed stream from `https://portal.abs.xyz/stream/UncleMatt`
- Sidebar placement (right side on desktop, bottom on mobile)
- Pop-out button to fullscreen overlay
- Minimize/expand toggle
- Responsive sizing
- Does not block main content

**Stream Video Element:**
```html
<video crossorigin="" playsinline="" preload="metadata" 
  src="blob:https://portal.abs.xyz/02b740ff-820a-4f8f-a233-b0b1343584aa">
</video>
```

### 3. Games Arcade

**Game Integration:**
- Turtle Bouncy Bounce (platform jumping game)
- Turtle Game Bob (roguelike dungeon crawler)
- Future game slots (expandable)

**Arcade Features:**
- Game cards with screenshots and descriptions
- Play button launches game in iframe or dedicated page
- Unified leaderboard system (cross-game)
- High scores displayed per game
- Filter/search games by genre or character

**Technical Requirements:**
- Load games from `/website/games/` directory
- Each game in isolated iframe or dedicated route
- Shared Supabase backend for leaderboards
- Consistent theme wrapper around each game

### 4. Book Content Section

#### 4.1 Character Encyclopedia

**Data Source:** `/turtlebook/book_consistency_tracker.csv`

**Features:**
- Browse all 171 tracked entities
- Filter by category: Characters, Locations, Artifacts, Timeline Events, Relationships
- Search by name or description
- Character detail pages showing:
  - Name, description, first appearance chapter
  - Current status
  - Relationships
  - Cross-references
  - All chapter appearances

**UI:**
- Card grid layout
- Category tabs/filters
- Search bar with instant results
- Sorting options (alphabetical, by chapter, by status)

#### 4.2 Artifacts Database

**Features:**
- All magical items and artifacts from the book
- Filter by type: Weapons, Magical, Tools, Vehicles, etc.
- Detail view with:
  - Description
  - Powers/abilities
  - Owner/bearer
  - First appearance
  - Status (Active, Consumed, Destroyed)

#### 4.3 Location Explorer

**Features:**
- Interactive list of 100+ locations
- Categories: Villages, Forests, Mountains, Magical realms, Futuristic cities
- Location detail pages with:
  - Description
  - Events that occurred there
  - Characters encountered
  - Chapters featuring this location

**Future Enhancement:**
- Visual map representation (hand-drawn or illustrated)

#### 4.4 Chapter Browser

**Data Source:** `/turtlebook/COMPLETED CHAPTERS/*.md`

**Features:**
- List all 69 chapters with titles
- Chapter summary view
- Read full chapter (MDX rendering)
- Audio player integration (when audiobook ready)
- Navigation: Previous/Next chapter
- Progress tracking (optional user feature)

#### 4.5 Trivia Game

**Data Source:** `/turtlebook/book_consistency_tracker.csv`

**Game Mechanics:**
- Multiple choice questions generated from CSV data
- Question types:
  - "What chapter did X first appear?"
  - "Who owns the [Artifact]?"
  - "What is the status of [Character]?"
  - "Where did [Event] occur?"
- Score tracking
- Difficulty levels (Easy/Medium/Hard based on obscurity)
- Leaderboard integration

**Questions Examples:**
```
Q: In which chapter did Uncle Matt first meet Everwood?
A: Chapter 2

Q: What magical artifact did the Griffin Mother give to Matt?
A: Enchanted Crystal

Q: What is Bob's species clan?
A: Red-Eared Slider Clan
```

### 5. Data Integration

**CSV Processing:**
- Parse `/turtlebook/book_consistency_tracker.csv` on build
- Convert to JSON for fast client-side filtering
- Index by category, name, chapter
- Pre-generate static pages for SEO

**Story Bible Integration:**
- Parse story_bible_pass*.txt files for additional lore
- Extract chapter summaries
- Build relationship graphs
- Generate timeline data

**Chapter Content:**
- Convert markdown chapters to MDX
- Preserve formatting
- Add metadata (chapter number, title, word count)
- Generate table of contents

### 6. Design & UX

**Theme:**
- Fantasy adventure aesthetic (matching book tone)
- Turtle/aquatic color palette (greens, blues, earth tones)
- Whimsical but readable
- Dark mode option

**Typography:**
- Heading font: Fantasy-style serif (readable)
- Body font: Clean sans-serif
- Code/technical: Monospace

**Components (Shadcn UI):**
- Navigation (responsive menu)
- Cards (games, characters, chapters)
- Tabs (filtering)
- Dialog (pop-out stream)
- Table (leaderboards)
- Search (command palette style)

**Responsive Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 7. Technical Architecture

**Next.js 15 App Structure:**
```
app/
├── page.tsx                    # Homepage
├── games/
│   ├── page.tsx               # Arcade hub
│   ├── [slug]/page.tsx        # Individual game pages
│   └── leaderboard/page.tsx   # Global leaderboard
├── book/
│   ├── page.tsx               # Book landing
│   ├── characters/
│   │   ├── page.tsx           # Character list
│   │   └── [id]/page.tsx      # Character detail
│   ├── artifacts/page.tsx     # Artifacts list
│   ├── locations/page.tsx     # Locations list
│   ├── chapters/
│   │   ├── page.tsx           # Chapter list
│   │   └── [number]/page.tsx  # Read chapter
│   └── trivia/page.tsx        # Trivia game
├── about/page.tsx             # About Bob's Tank
└── layout.tsx                 # Root layout with nav

components/
├── ui/                        # Shadcn components
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── StreamSidebar.tsx
├── games/
│   ├── GameCard.tsx
│   └── Leaderboard.tsx
├── book/
│   ├── CharacterCard.tsx
│   ├── ChapterNav.tsx
│   └── TriviaQuestion.tsx
└── shared/
    ├── SearchBar.tsx
    └── FilterTabs.tsx

lib/
├── data/
│   ├── parseCSV.ts            # CSV to JSON converter
│   ├── chapters.ts            # Chapter data utilities
│   └── storyBible.ts          # Story bible parsing
├── supabase/
│   ├── client.ts              # Supabase client
│   └── leaderboards.ts        # Leaderboard queries
└── utils.ts                   # Shared utilities

data/                          # Generated at build time
├── characters.json
├── artifacts.json
├── locations.json
├── timeline.json
└── chapters-metadata.json

public/
├── games/                     # Symlink to existing games
└── assets/                    # Images, icons
```

**API Routes:**
```
app/api/
├── leaderboard/
│   ├── submit/route.ts        # POST score
│   └── get/route.ts           # GET scores
└── trivia/
    └── questions/route.ts     # GET random questions
```

### 8. Supabase Schema

**Tables:**

```sql
-- Leaderboards
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_slug TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_leaderboards_game ON leaderboards(game_slug, score DESC);

-- Trivia Scores
CREATE TABLE trivia_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  questions_answered INTEGER NOT NULL,
  difficulty TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Progress (Optional)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  chapters_read INTEGER[],
  trivia_high_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Performance Requirements

- **Lighthouse Score Targets:**
  - Performance: > 90
  - Accessibility: 100
  - Best Practices: > 90
  - SEO: 100

- **Load Times:**
  - First Contentful Paint: < 1.5s
  - Time to Interactive: < 3s
  - Largest Contentful Paint: < 2.5s

- **Optimization:**
  - Static generation for all book content
  - Image optimization (Next.js Image component)
  - Code splitting per route
  - Lazy load games and heavy components
  - CDN delivery via Vercel Edge

### 10. SEO & Metadata

**Meta Tags:**
- Dynamic per page (character pages, chapter pages, etc.)
- Open Graph images for sharing
- Twitter cards
- Structured data (schema.org for book content)

**Sitemap:**
- Auto-generated including all characters, chapters, locations
- Submitted to search engines

**robots.txt:**
- Allow all crawlers
- Sitemap reference

### 11. Deployment

**Vercel Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (for metadata)
- `STREAM_EMBED_URL` (portal.abs.xyz URL)

### 12. Future Enhancements

**Phase 2 (Post-Launch):**
- User accounts and authentication
- Bookmarks/favorites for characters
- Reading progress tracking
- Community features (comments, fan theories)
- Interactive timeline visualization
- Audio player for completed audiobook chapters
- More RVC voice model integration
- Fan art gallery
- Forum/discussion board

**Phase 3:**
- Mobile apps (PWA first)
- More games (based on book events)
- Merchandise integration
- Newsletter signup
- RSS feed for new chapters

## Success Criteria

1. ✅ All book content (characters, artifacts, locations) accessible and searchable
2. ✅ Both games fully integrated and playable
3. ✅ Live stream embedded and functional
4. ✅ Trivia game working with CSV data
5. ✅ Mobile responsive on all screen sizes
6. ✅ Lighthouse scores meet targets
7. ✅ Deploys successfully to Vercel
8. ✅ Domain (bobsturtletank.fun) connected with SSL

## Out of Scope (For Now)

- User authentication (Phase 2)
- Audiobook player (waiting for RVC completion)
- Community features (Phase 2)
- Merchandise store (Phase 3)
- Mobile native apps (Phase 3)

## Timeline Estimate

**MVP (Minimum Viable Product):**
- Homepage + Navigation: 2-3 hours
- Stream integration: 1 hour
- Games arcade: 2-3 hours
- Character encyclopedia: 3-4 hours
- Trivia game: 2-3 hours
- Styling & polish: 2-3 hours
- Testing & deployment: 1-2 hours

**Total: 13-19 hours of development**

## Dependencies

**External:**
- Existing games in `/turtlebook/website/games/`
- CSV data at `/turtlebook/book_consistency_tracker.csv`
- Chapter markdown files
- Stream URL from portal.abs.xyz

**Internal:**
- Supabase project setup
- Vercel account ready
- Domain purchased (bobsturtletank.fun)

## Questions & Clarifications

1. Should we copy game files or symlink to `/turtlebook/website/games/`?
2. Priority order for book features? (Character encyclopedia vs Trivia first?)
3. Color scheme preferences? (Default to turtle greens/blues/earth tones)
4. Logo/branding assets available?
5. Analytics tracking desired? (Vercel Analytics, Google Analytics, etc.)

## Acceptance Criteria

- [ ] Homepage loads with stream sidebar
- [ ] Navigation works on mobile and desktop
- [ ] Both games accessible from arcade hub
- [ ] Character encyclopedia shows all 171 CSV entries
- [ ] Trivia game generates questions from CSV
- [ ] All 69 chapters browsable
- [ ] Site is responsive on mobile/tablet/desktop
- [ ] Lighthouse scores meet targets
- [ ] Deploys to Vercel without errors
- [ ] Domain connects properly with SSL
