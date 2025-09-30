# Bob's Turtle Tank Website - Implementation Plan

## Tech Stack

### Core Framework
- **Next.js 15** (App Router) - Latest stable version
- **React 18** - Server/Client components
- **TypeScript 5** - Strict mode

### Styling & UI
- **Tailwind CSS 3** - Utility-first styling
- **Shadcn UI** - Component library (not installed as dependency, copy components)
- **Lucide React** - Icon library
- **next/font** - Google Fonts optimization

### Data & Backend
- **Supabase** - PostgreSQL database + realtime features
- **@supabase/ssr** - Server-side auth helpers
- **CSV Parse** - CSV to JSON conversion (build time)
- **Gray-matter** - Markdown frontmatter parsing
- **Next MDX** - MDX content rendering

### Development Tools
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - Type-safe linting

## Project Structure

```
bobsturtletank-website/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # Global styles
│   ├── games/
│   │   ├── layout.tsx           # Games section layout
│   │   ├── page.tsx             # Arcade hub
│   │   ├── bounce/page.tsx      # Turtle Bouncy Bounce
│   │   ├── roguelike/page.tsx   # Turtle Game Bob
│   │   └── leaderboard/page.tsx # Global leaderboard
│   ├── book/
│   │   ├── layout.tsx           # Book section layout
│   │   ├── page.tsx             # Book landing page
│   │   ├── characters/
│   │   │   ├── page.tsx         # Character list
│   │   │   └── [slug]/page.tsx  # Character detail
│   │   ├── artifacts/page.tsx   # Artifacts list
│   │   ├── locations/page.tsx   # Locations list
│   │   ├── chapters/
│   │   │   ├── page.tsx         # Chapter list
│   │   │   └── [number]/page.tsx # Read chapter
│   │   └── trivia/page.tsx      # Trivia game
│   ├── about/page.tsx           # About page
│   └── api/
│       ├── leaderboard/
│       │   └── route.ts         # Leaderboard API
│       └── trivia/
│           └── route.ts         # Trivia questions API
├── components/
│   ├── ui/                      # Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── StreamSidebar.tsx
│   ├── games/
│   │   ├── GameCard.tsx
│   │   ├── GameEmbed.tsx
│   │   └── Leaderboard.tsx
│   └── book/
│       ├── CharacterCard.tsx
│       ├── CharacterDetail.tsx
│       ├── ChapterNav.tsx
│       ├── ChapterReader.tsx
│       ├── TriviaGame.tsx
│       └── SearchFilter.tsx
├── lib/
│   ├── data/
│   │   ├── build-data.ts        # Build-time data processing
│   │   ├── parse-csv.ts         # CSV parser
│   │   ├── parse-chapters.ts    # Chapter metadata
│   │   └── parse-story-bible.ts # Story bible parser
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── database.types.ts    # Generated types
│   ├── utils.ts                 # Shared utilities
│   └── constants.ts             # Constants
├── data/                        # Generated at build time
│   ├── characters.json
│   ├── artifacts.json
│   ├── locations.json
│   ├── timeline.json
│   └── chapters.json
├── content/                     # MDX chapters (copied from /turtlebook)
│   └── chapters/
│       ├── chapter-01.mdx
│       ├── chapter-02.mdx
│       └── ...
├── public/
│   ├── games/                   # Game files (symlinked or copied)
│   ├── images/
│   └── fonts/
├── scripts/
│   ├── build-data.ts            # Pre-build script
│   └── copy-games.ts            # Copy game files
├── types/
│   ├── book.ts                  # Book data types
│   └── games.ts                 # Game data types
├── .env.local.example           # Environment variables template
├── .gitignore
├── components.json              # Shadcn config
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Implementation Phases

### Phase 1: Project Setup & Foundation (Step 1-3)

**1. Initialize Next.js Project**
```bash
npx create-next-app@latest bobsturtletank-website --typescript --tailwind --app --src-dir false
cd bobsturtletank-website
```

**2. Install Dependencies**
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install csv-parse gray-matter date-fns

# Dev dependencies
npm install -D @types/node
```

**3. Initialize Shadcn UI**
```bash
npx shadcn@latest init
npx shadcn@latest add button card tabs dialog table input
```

### Phase 2: Data Processing (Step 4-6)

**4. Create Data Parsing Scripts**
- `lib/data/parse-csv.ts` - Parse book_consistency_tracker.csv
- `lib/data/parse-chapters.ts` - Extract chapter metadata
- `lib/data/parse-story-bible.ts` - Parse story bible files
- `lib/data/build-data.ts` - Main build script

**5. Build-Time Data Generation**
- Run parsing scripts during build
- Generate JSON files in `/data` directory
- Create TypeScript types from data

**6. Copy Book Content**
```bash
# Copy chapters
cp -r /home/dave/Documents/GitHub/turtlebook/COMPLETED\ CHAPTERS/* content/chapters/

# Copy CSV
cp /home/dave/Documents/GitHub/turtlebook/book_consistency_tracker.csv data/source/

# Copy story bibles
cp /home/dave/Documents/GitHub/turtlebook/story_bible*.txt data/source/
```

### Phase 3: Core Layout & Navigation (Step 7-9)

**7. Root Layout**
- Create `app/layout.tsx` with:
  - Global styles
  - Font configuration
  - Metadata
  - Analytics setup (optional)

**8. Navigation Component**
- `components/layout/Navbar.tsx`:
  - Responsive menu
  - Logo/branding
  - Main nav links (Home, Games, Book, About)
  - Mobile hamburger menu

**9. Footer Component**
- `components/layout/Footer.tsx`:
  - Links
  - Social media
  - Copyright

### Phase 4: Homepage (Step 10-12)

**10. Homepage Hero**
- Welcome section
- Bob the Turtle introduction
- Call-to-action buttons

**11. Stream Sidebar**
- `components/layout/StreamSidebar.tsx`:
  - Embed iframe from portal.abs.xyz
  - Collapse/expand toggle
  - Pop-out to fullscreen dialog
  - Responsive positioning

**12. Featured Content**
- Featured game card
- Latest chapter highlight
- Quick links to trivia/characters

### Phase 5: Games Arcade (Step 13-16)

**13. Games Arcade Hub**
- `app/games/page.tsx`:
  - Game cards grid
  - Game descriptions
  - Play buttons

**14. Game Integration**
- Copy/symlink game files from `/turtlebook/website/games/`
- Create game pages:
  - `app/games/bounce/page.tsx`
  - `app/games/roguelike/page.tsx`
- Embed games in iframes or dedicated routes

**15. Supabase Setup**
- Create Supabase project
- Run migration for leaderboard tables
- Configure environment variables
- Create client/server utilities

**16. Leaderboard System**
- `app/api/leaderboard/route.ts` - API routes
- `components/games/Leaderboard.tsx` - Display component
- Submit score functionality
- Global leaderboard page

### Phase 6: Book Content - Characters (Step 17-20)

**17. Character Data Processing**
- Parse CSV to extract characters
- Generate character JSON with relationships
- Create character type definitions

**18. Character List Page**
- `app/book/characters/page.tsx`:
  - Grid of character cards
  - Search functionality
  - Filter by category (Main, Allies, Antagonists, etc.)
  - Sort options

**19. Character Card Component**
- `components/book/CharacterCard.tsx`:
  - Character name and type
  - Brief description
  - First appearance chapter
  - Status indicator
  - Click to detail page

**20. Character Detail Page**
- `app/book/characters/[slug]/page.tsx`:
  - Full character info
  - All appearances
  - Relationships graph
  - Cross-references
  - Static generation for SEO

### Phase 7: Book Content - Artifacts & Locations (Step 21-24)

**21. Artifacts Page**
- `app/book/artifacts/page.tsx`:
  - Filter by artifact type
  - Search artifacts
  - Display artifact cards

**22. Locations Page**
- `app/book/locations/page.tsx`:
  - Filter by location type
  - Browse all locations
  - Location detail views

**23. Shared Components**
- `components/book/SearchFilter.tsx`:
  - Reusable search/filter
  - Used across characters, artifacts, locations

**24. Data Fetching Utilities**
- Server components fetch from JSON
- Client components use state for filtering
- Type-safe queries

### Phase 8: Book Content - Chapters (Step 25-27)

**25. Chapter List Page**
- `app/book/chapters/page.tsx`:
  - List all 69 chapters
  - Chapter titles and summaries
  - Navigation to read

**26. Chapter Reader**
- `app/book/chapters/[number]/page.tsx`:
  - MDX rendering
  - Previous/Next navigation
  - Reading progress indicator (client-side)
  - Styled content (typography plugin)

**27. Chapter Navigation Component**
- `components/book/ChapterNav.tsx`:
  - Chapter select dropdown
  - Prev/Next buttons
  - Progress indicator

### Phase 9: Trivia Game (Step 28-30)

**28. Trivia Game Engine**
- `lib/trivia/generate-questions.ts`:
  - Parse CSV to create questions
  - Multiple question types
  - Difficulty levels
  - Randomization

**29. Trivia Game Component**
- `components/book/TriviaGame.tsx`:
  - Question display
  - Answer selection
  - Score tracking
  - Timer (optional)
  - Results screen

**30. Trivia API & Leaderboard**
- `app/api/trivia/route.ts` - Get random questions
- Submit trivia scores to Supabase
- Display trivia leaderboard

### Phase 10: Styling & Polish (Step 31-33)

**31. Theme Configuration**
- Tailwind config with custom colors:
  - Turtle greens
  - Ocean blues
  - Earth tones
  - Fantasy accents
- Dark mode support

**32. Component Styling**
- Ensure consistent spacing
- Responsive design testing
- Animations (subtle)
- Loading states

**33. Accessibility**
- Keyboard navigation
- ARIA labels
- Alt text for images
- Color contrast verification
- Screen reader testing

### Phase 11: SEO & Metadata (Step 34-35)

**34. Dynamic Metadata**
- Generate metadata for each page
- Open Graph images
- Twitter cards
- Structured data (JSON-LD)

**35. Sitemap & robots.txt**
- Auto-generate sitemap
- Include all character/chapter pages
- Configure robots.txt

### Phase 12: Testing & Deployment (Step 36-38)

**36. Local Testing**
- Test all routes
- Test responsive design
- Test game embeds
- Test stream embed
- Verify data accuracy

**37. Performance Optimization**
- Run Lighthouse audits
- Optimize images
- Code splitting verification
- Remove unused CSS

**38. Deployment Preparation**
- Create `.env.local.example`
- Update README with setup instructions
- Verify build succeeds
- Create deployment checklist

## Configuration Files

### `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['portal.abs.xyz'],
  },
  async rewrites() {
    return [
      {
        source: '/games/bounce/:path*',
        destination: '/games/bounce/index.html',
      },
      {
        source: '/games/roguelike/:path*',
        destination: '/games/roguelike/index.html',
      },
    ];
  },
};

export default nextConfig;
```

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'turtle-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          // ... more shades
        },
        'ocean-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... more shades
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

export default config
```

### `package.json` Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run build:data && next build",
    "build:data": "tsx scripts/build-data.ts",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write ."
  }
}
```

## Environment Variables

### `.env.local.example`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stream
NEXT_PUBLIC_STREAM_URL=https://portal.abs.xyz/stream/UncleMatt
```

## Supabase Migration

### `supabase/migrations/001_initial_schema.sql`
```sql
-- Leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_slug TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leaderboards_game_score 
  ON leaderboards(game_slug, score DESC);

-- Trivia scores table
CREATE TABLE IF NOT EXISTS trivia_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  questions_answered INTEGER NOT NULL,
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trivia_scores_score 
  ON trivia_scores(score DESC);
```

## Development Workflow

1. **Start with data processing** - Get book content accessible
2. **Build layout/navigation** - Foundation for all pages
3. **Implement homepage** - First user touchpoint
4. **Add games** - High-value, engaging feature
5. **Build book features** - Core content (characters → chapters → trivia)
6. **Polish & optimize** - Make it production-ready

## Testing Checklist

- [ ] Homepage loads correctly
- [ ] Navigation works (desktop & mobile)
- [ ] Stream sidebar loads and can pop out
- [ ] Games load and are playable
- [ ] Leaderboards submit and display scores
- [ ] Character list shows all entries from CSV
- [ ] Character search/filter works
- [ ] Character detail pages load
- [ ] Chapters list displays all 69 chapters
- [ ] Chapter reader renders MDX correctly
- [ ] Chapter navigation works
- [ ] Trivia game generates valid questions
- [ ] Trivia score submission works
- [ ] Mobile responsive on all pages
- [ ] Dark mode works (if implemented)
- [ ] Lighthouse scores meet targets
- [ ] No console errors
- [ ] Build succeeds without warnings

## Dependencies Summary

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "lucide-react": "^0.300.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "csv-parse": "^5.5.3",
    "gray-matter": "^4.0.3",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "tsx": "^4.0.0"
  }
}
```

## Next Steps After Implementation

1. User deploys to Vercel
2. Connect bobsturtletank.fun domain
3. Configure Supabase environment variables
4. Test production deployment
5. Monitor analytics and performance
6. Plan Phase 2 features (user accounts, audiobook player, etc.)
