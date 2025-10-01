# How to Push to GitHub

## Create GitHub Repo First

1. Go to https://github.com/new
2. Name it: `bobsturtletank-website`
3. DON'T add README, .gitignore, or license (we already have them)
4. Click "Create repository"

## Then Push from Terminal

```bash
cd /home/dave/Documents/GitHub/bobsturtletank-website
git remote add origin https://github.com/YOUR_USERNAME/bobsturtletank-website.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username!

## After Pushing

1. Go to Vercel.com
2. Import your GitHub repo
3. Vercel will auto-deploy!
4. Add custom domain `bobsturtletank.fun` in Vercel settings
5. Update DNS records on Namecheap

Done! 🚀
