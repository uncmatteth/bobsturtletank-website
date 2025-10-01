# Implementation Plan - Critical Website Fixes

## Phase 1: Remove Book Chapter Content (URGENT)

### Files to Delete:
- `app/book/chapters/` - entire directory
- `app/book/chapters/[number]/page.tsx`
- `content/chapters/` - all markdown files
- Update `app/sitemap.ts` - remove chapter routes

### Files to Update:
- `app/book/page.tsx` - remove "Read Chapters" card
- `app/page.tsx` - update featured chapter to link to purchase page
- `components/layout/Footer.tsx` - remove chapter links
- `lib/data/chapters.ts` - delete entire file

### New Pages to Create:
- `app/book/buy/page.tsx` - "Buy the Book" page with info

## Phase 2: Fix CSV Data Processing

### Current Parser Issues:
```typescript
// PROBLEM: relax_column_count drops data
const records = parse(csvContent, {
  relax_column_count: true, // ❌ This loses data
});
```

### Solution:
1. Read raw CSV line by line
2. Handle inconsistent column counts properly
3. Map to correct data structures
4. Validate all 164 entries processed

### Update Files:
- `scripts/build-data.ts` - rewrite parser
- Test with full CSV (164 lines)
- Verify output JSON files

## Phase 3: Fix Game Paths

### Investigation:
```bash
# Check actual game structure
ls -la public/games/turtlebouncybounce/
ls -la public/games/turtlegamebob/
```

### Fix Routing:
- Update `app/games/bounce/page.tsx`
- Update `app/games/roguelike/page.tsx`
- Test game loading in browser

## Phase 4: Bob Image Gallery

### Image Processing:
1. Move BOB images to `public/images/bob-gallery/`
2. Optimize with Next.js Image component
3. Create responsive gallery component

### New Components:
- `components/gallery/BobGallery.tsx` - Main gallery
- `components/gallery/BobImage.tsx` - Individual image card
- Add to homepage
- Add to About page

### Features:
- Grid layout (responsive)
- Lightbox on click
- Lazy loading
- Image optimization

## Phase 5: Testing & Deployment

### Test Checklist:
- [ ] No chapter routes accessible
- [ ] All 164 items in encyclopedia
- [ ] Both games load and play
- [ ] Bob gallery displays all 84 images
- [ ] Sitemap updated
- [ ] Production build passes
- [ ] All links work

### Deployment:
1. Commit changes
2. Push to GitHub
3. Vercel auto-deploys
4. Verify live site
