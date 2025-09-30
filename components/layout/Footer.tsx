import Link from "next/link"
import { Turtle, Github, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Turtle className="h-6 w-6 text-turtle-green-600" />
              <span className="font-serif font-bold">Bob's Turtle Tank</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Adventures across the Adventure Realm with Bob the Magical Talking Turtle and Uncle Matt.
            </p>
          </div>

          {/* Games */}
          <div>
            <h3 className="font-semibold mb-3">Games</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/games/bounce" className="text-muted-foreground hover:text-foreground transition-colors">
                  Turtle Bouncy Bounce
                </Link>
              </li>
              <li>
                <Link href="/games/roguelike" className="text-muted-foreground hover:text-foreground transition-colors">
                  Turtle Roguelike
                </Link>
              </li>
              <li>
                <Link href="/games/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Book Content */}
          <div>
            <h3 className="font-semibold mb-3">Book Content</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/book/chapters" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Chapters
                </Link>
              </li>
              <li>
                <Link href="/book/characters" className="text-muted-foreground hover:text-foreground transition-colors">
                  Characters
                </Link>
              </li>
              <li>
                <Link href="/book/artifacts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Artifacts
                </Link>
              </li>
              <li>
                <Link href="/book/locations" className="text-muted-foreground hover:text-foreground transition-colors">
                  Locations
                </Link>
              </li>
              <li>
                <Link href="/book/trivia" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trivia Game
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Bob's Tank
                </Link>
              </li>
              <li>
                <a href="https://portal.abs.xyz/stream/UncleMatt" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  Live Stream
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bob's Turtle Tank. All rights reserved.</p>
          <p className="mt-2">Created by Uncle Matt</p>
        </div>
      </div>
    </footer>
  )
}
