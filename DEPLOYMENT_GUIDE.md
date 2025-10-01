# Deployment Guide - Bob's Turtle Tank Website

## ✅ Step 1: GitHub - COMPLETE!
Your code is now live at: https://github.com/uncmatteth/bobsturtletank-website

## 🚀 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/
2. Click "Add New Project"
3. Import your GitHub repo: `uncmatteth/bobsturtletank-website`
4. Vercel will auto-detect Next.js settings:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy"
6. Wait 2-3 minutes for deployment

### Option B: Via Vercel CLI
```bash
cd /home/dave/Documents/GitHub/bobsturtletank-website
npm install -g vercel
vercel login
vercel --prod
```

## 🌐 Step 3: Add Custom Domain

After Vercel deployment:

1. In Vercel project settings → "Domains"
2. Add `bobsturtletank.fun`
3. Vercel will show you DNS records to add

### Namecheap DNS Settings:
Go to Namecheap → Your Domain → Advanced DNS

Add these records:
- **Type:** A Record
  - **Host:** @
  - **Value:** 76.76.21.21
  - **TTL:** Automatic

- **Type:** CNAME
  - **Host:** www
  - **Value:** cname.vercel-dns.com
  - **TTL:** Automatic

### SSL Certificate:
✅ **FREE & Automatic** - Vercel handles it!
❌ **DO NOT** buy SSL from Namecheap

## 📧 Email Setup (Optional)

Namecheap offers free email forwarding:
1. Namecheap → Your Domain → Email Forwarding
2. Forward `contact@bobsturtletank.fun` → your personal email

For full email hosting, use:
- Google Workspace ($6/user/month)
- Zoho Mail (free for 1 user)
- ProtonMail

## 🎮 Verify Deployment

After deployment, test these URLs:
- https://bobsturtletank.fun → Homepage
- https://bobsturtletank.fun/games → Games arcade
- https://bobsturtletank.fun/book → Book hub
- https://bobsturtletank.fun/book/chapters/1 → First chapter
- https://bobsturtletank.fun/games/bounce → Bouncy game
- https://bobsturtletank.fun/games/roguelike → Roguelike game

## 🔧 Troubleshooting

### Games not loading?
- Check browser console for errors
- Verify game files exist in `public/games/`
- Games may need a few seconds to load assets

### Domain not working?
- DNS changes take 5 minutes to 48 hours
- Check DNS propagation: https://dnschecker.org/

### Build failing?
- Check Vercel build logs
- Ensure `npm run build` works locally first

## 📊 Analytics (Optional)

Add free analytics:
```bash
npm install @vercel/analytics
```

Then add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

// In the return, add:
<Analytics />
```

## 🎯 You're Done!

Your complete website is now live with:
- ✅ 69 chapters of Bob's epic adventure
- ✅ 29 characters, 25 artifacts, 37 locations
- ✅ 2 browser games (Bouncy Bounce & Roguelike)
- ✅ Trivia game
- ✅ Live stream sidebar
- ✅ Full SEO (sitemap, metadata)
- ✅ Production-ready Next.js 15

Enjoy your new website! 🐢✨
