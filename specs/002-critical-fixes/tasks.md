# Implementation Tasks - Critical Fixes

## PHASE 1: Remove Book Chapters (URGENT)
- **TASK-001**: Delete app/book/chapters/ directory
- **TASK-002**: Delete content/chapters/ directory  
- **TASK-003**: Delete lib/data/chapters.ts
- **TASK-004**: Update app/book/page.tsx - remove chapters card
- **TASK-005**: Update app/page.tsx - change chapter feature to "Buy Book"
- **TASK-006**: Update components/layout/Footer.tsx - remove chapter links
- **TASK-007**: Update app/sitemap.ts - remove chapter routes
- **TASK-008**: Create app/book/buy/page.tsx - purchase page

## PHASE 2: Fix CSV Data (Get All 164 Entries)
- **TASK-009**: Rewrite scripts/build-data.ts CSV parser
- **TASK-010**: Handle all CSV column variations
- **TASK-011**: Map spaceship components correctly
- **TASK-012**: Test parser on full CSV
- **TASK-013**: Verify all 164 entries in JSON output
- **TASK-014**: Update data utilities for new structure
- **TASK-015**: Rebuild and verify data files

## PHASE 3: Fix Game Paths
- **TASK-016**: Check turtlebouncybounce actual structure
- **TASK-017**: Fix app/games/bounce/page.tsx routing
- **TASK-018**: Check turtlegamebob structure  
- **TASK-019**: Fix app/games/roguelike/page.tsx routing
- **TASK-020**: Test both games load correctly
- **TASK-021**: Update games hub page with correct links

## PHASE 4: Bob Image Gallery
- **TASK-022**: Move BOB/*.png to public/images/bob-gallery/
- **TASK-023**: Create components/gallery/BobGallery.tsx
- **TASK-024**: Add gallery to homepage
- **TASK-025**: Add gallery to About page
- **TASK-026**: Implement lightbox functionality
- **TASK-027**: Add lazy loading for images
- **TASK-028**: Optimize images for web

## PHASE 5: Final Testing
- **TASK-029**: Test all encyclopedia pages (characters/artifacts/locations)
- **TASK-030**: Verify trivia game works
- **TASK-031**: Test games in browser
- **TASK-032**: Check Bob gallery on all pages
- **TASK-033**: Verify no chapter routes exist
- **TASK-034**: Run production build
- **TASK-035**: Update README with changes
- **TASK-036**: Commit and push fixes

