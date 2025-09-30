<!--
Sync Impact Report:
- Version: INITIAL → 1.0.0
- New constitution created from template
- Templates verified: All templates compatible with new constitution
- No follow-up TODOs
-->

# Bob's Turtle Tank Website Constitution

## Core Principles

### I. Content-First Architecture
The website's primary value is Bob's Adventure Realm content (book, characters, lore).

**Rules:**
- Game arcade and stream are secondary features that enhance the core content
- All features must serve the story/world-building first
- Navigation must prioritize discovering book content over games
- Book data (CSV, story bible, chapters) must be programmatically accessible

**Rationale**: The 69-chapter book series and rich lore (100+ locations, 50+ artifacts, 171 CSV entries) is unique IP that differentiates this from a generic game site.

### II. Games Integration Standards
Games are fully integrated into the main site, not external links.

**Rules:**
- Each game must load within the main site navigation
- Shared leaderboard system across all games
- Consistent UI/UX theme across games and main site
- Game assets can reference book lore (characters, locations, artifacts)

**Rationale**: Unified experience keeps users engaged with the brand ecosystem.

### III. Stream Integration (Non-Intrusive)
Live stream from portal.abs.xyz embedded but not dominant.

**Rules:**
- Sidebar placement with pop-out capability
- Does not interfere with main content navigation
- Optional fullscreen mode
- Mobile-friendly responsive behavior

**Rationale**: Stream is ambient content, not the main attraction.

### IV. Performance & Accessibility
Site must load fast and work on all devices/browsers.

**Rules:**
- Mobile-first responsive design
- No blocking JavaScript for core content
- Semantic HTML for accessibility
- Optimized images and assets
- Progressive enhancement (works with JavaScript disabled for content)

**Rationale**: Accessibility ensures maximum reach for book content and games.

### V. Code Quality & Maintainability
Clean, maintainable code following modern best practices.

**Rules:**
- TypeScript strict mode required
- ESLint + Prettier enforced
- Component-based architecture
- Minimal external dependencies
- No legacy libraries (jQuery, etc.)

**Rationale**: Future-proof codebase that's easy to maintain and extend.

## Technology Standards

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: Supabase (leaderboards, user data)
- **Deployment**: Vercel
- **Content**: MDX for book chapters
- **Language**: TypeScript (strict mode)

**Rationale**: Modern, proven stack that integrates well with existing Vercel games and provides excellent SEO for book content.

### Data Sources
- Book content CSV at `/turtlebook/book_consistency_tracker.csv`
- Story bible at `/turtlebook/story_bible_*.txt`
- Completed chapters at `/turtlebook/COMPLETED CHAPTERS/`
- Existing games at `/turtlebook/website/games/`

## Development Workflow

### Feature Development Process
1. Spec created using spec-kit `/specify`
2. Implementation plan via `/plan`
3. Tasks breakdown via `/tasks`
4. Implementation via `/implement`
5. Local testing before deployment
6. User approval before production deployment

### File Organization
```
bobsturtletank-website/
├── app/                    # Next.js 15 app directory
├── components/             # React components
├── lib/                    # Utilities, data fetching
├── public/                 # Static assets
├── data/                   # Book data (CSV, JSON)
└── content/                # MDX chapters
```

### Git Workflow
- Main branch = production deployment
- Feature branches for development
- Clear commit messages
- Vercel automatic deployments

## Governance

### Amendment Process
Constitution changes require:
- Documented rationale for change
- Version bump following semver (MAJOR.MINOR.PATCH)
- Update to this file
- Propagation to affected templates

### Compliance
- All code must align with these principles
- Complexity must be justified
- Features must serve the core content-first mission

**Version**: 1.0.0 | **Ratified**: 2025-01-30 | **Last Amended**: 2025-01-30