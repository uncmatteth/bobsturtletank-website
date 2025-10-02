# Browser Errors Fixed

## Issues from Console:

### ✅ FIXED:
1. **Favicon 404** - Added Bob icon as favicon (`/bob-icon.png`)
2. **Dev server restart** - Now running on port 3001

### ⚠️ KNOWN ISSUES (Can't Fix):

1. **Stream CSP Error** 
   ```
   Refused to frame 'https://portal.abs.xyz/' because an ancestor violates 
   the following Content Security Policy directive: "frame-ancestors 'none'".
   ```
   - **What it means:** The portal.abs.xyz website blocks ALL iframe embedding for security
   - **Workaround:** Click "Pop out to new window" button to open stream in new tab
   - **This is NOT a bug** - it's their security policy

2. **Font preload warnings**
   - These are Next.js optimization warnings (not actual errors)
   - Fonts still load correctly
   - Safe to ignore

3. **Browser extension injections**
   ```
   injection-callback.js, pageProvider.js
   ```
   - These are from YOUR browser extensions (crypto wallets, etc.)
   - Not related to the website
   - Safe to ignore

## How to View Site:

1. **URL:** http://localhost:3001 (port changed because 3000 was in use)
2. **Refresh** your browser
3. **Enjoy** the spectacular visuals!

## Stream Access:

- Click "🐢 Watch Bob's Tank Live" button
- Click "Pop out to new window" icon (↗) 
- Stream opens in new tab (CSP restriction workaround)

---

**The website itself is working perfectly!** The errors you saw were:
- Font optimization (cosmetic, not real errors)
- Stream CSP (their security, not our bug)
- Browser extensions (your crypto wallets)


