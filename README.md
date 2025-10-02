# Bob's Turtle Tank Website

The official website for Bob the Magical Talking Turtle's Adventure Realm - featuring the complete 69-chapter epic, browser games, character encyclopedia, and more!

## Features

### 📖 The Book
- **69 Epic Chapters**: Read the complete adventure from Cedar Hollow to the cosmic void
- **Character Encyclopedia**: Detailed profiles of 29+ characters with bios, relationships, and first appearances
- **Magical Artifacts**: 25+ artifacts with descriptions and ownership details
- **Legendary Locations**: 37+ locations spanning villages, forests, mountains, cities, and cosmic realms

### 🎮 Games Arcade
- **Turtle Bouncy Bounce**: Fast-paced arcade platformer
- **Turtle Roguelike**: Procedurally generated dungeon crawler
- **Leaderboards**: Compete with players worldwide (coming soon)

### 🏆 Interactive Features
- **Trivia Game**: 10-question quiz testing your Adventure Realm knowledge
- **Live Stream**: Watch Bob's real turtle tank live
- **Search & Filter**: Find characters, artifacts, and locations easily

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom turtle/ocean theme
- **UI Components**: Shadcn UI
- **Data**: CSV-based content management with build-time JSON generation
- **Games**: Phaser 3 browser games
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bobsturtletank-website
```

2. Install dependencies:
```bash
npm install
```

3. Build data files:
```bash
npm run build:data
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
bobsturtletank-website/
├── app/                    # Next.js app router pages
│   ├── about/             # About page
│   ├── book/              # Book content (characters, chapters, etc.)
│   ├── games/             # Games pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── book/              # Book-related components
│   ├── layout/            # Layout components (Navbar, Footer, etc.)
│   ├── trivia/            # Trivia game components
│   └── ui/                # Shadcn UI components
├── content/
│   └── chapters/          # Markdown chapter files
├── data/
│   ├── source/            # Source data files (CSV)
│   ├── characters.json    # Generated character data
│   ├── artifacts.json     # Generated artifact data
│   ├── locations.json     # Generated location data
│   └── chapters.json      # Generated chapter metadata
├── lib/
│   ├── data/              # Data access utilities
│   └── utils.ts           # Utility functions
├── public/
│   └── games/             # Game files
├── scripts/
│   └── build-data.ts      # Data processing script
└── specs/                 # Spec-kit documentation
```

## Data Management

The website uses a CSV-based content management system:

1. **Source Data**: `data/source/book_consistency_tracker.csv`
2. **Build Script**: `scripts/build-data.ts` processes CSV into JSON
3. **Generated Data**: JSON files in `data/` directory
4. **Access Layer**: Utility functions in `lib/data/`

### Adding New Content

1. Update the CSV file in `data/source/`
2. Run `npm run build:data`
3. Content automatically available throughout the site

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Vercel will automatically detect Next.js configuration
4. Deploy!

### Custom Domain Setup

1. Purchase domain (e.g., bobsturtletank.fun from Namecheap)
2. In Vercel project settings, add custom domain
3. Update DNS records:
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`
4. Vercel handles SSL automatically (no need to purchase from domain registrar)

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values:

```env
NEXT_PUBLIC_SITE_URL=https://bobsturtletank.fun
```

## Games Integration

The website includes two Phaser 3 games:
- **Turtle Bouncy Bounce**: `public/games/turtlebouncybounce/`
- **Turtle Roguelike**: `public/games/turtlegamebob/`

Games are standalone HTML5 games that can be accessed via:
- `/games/bounce` → redirects to `/games/turtlebouncybounce/index.html`
- `/games/roguelike` → redirects to `/games/turtlegamebob/index.html`

## Contributing

This is a personal project for Bob's Turtle Tank. If you find bugs or have suggestions, feel free to open an issue!

## License

© 2025 Bob's Turtle Tank. All rights reserved.

Created by Uncle Matt with 💚

---

## Live Stream

Watch Bob's real turtle tank live at: https://portal.abs.xyz/stream/UncleMatt

