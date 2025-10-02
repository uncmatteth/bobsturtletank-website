import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy } from "lucide-react";

export const metadata = {
  title: "Underwater Arcade",
  description: "Play waterproof arcade games at the bottom of Bob's tank!",
};

const games = [
  {
    id: "bounce",
    title: "Turtle Bouncy Bounce",
    description: "Help Bob bounce higher and higher! Dodge falling platforms, collect coins, and see how high you can climb. A fast-paced arcade platformer with leaderboards.",
    slug: "bounce",
    tech: "Phaser 3",
  },
  {
    id: "roguelike",
    title: "Turtle Roguelike Adventure",
    description: "Explore procedurally generated dungeons as Bob! Battle enemies, collect loot, and survive as long as you can in this challenging roguelike dungeon crawler.",
    slug: "roguelike",
    tech: "Phaser 3",
  },
];

export default function GamesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Underwater Arcade Header */}
      <div className="text-center mb-12 relative">
        <div className="inline-block mb-4 text-sm text-cyan-600 dark:text-cyan-300 font-medium tracking-wide">
          🎮 UNDERWATER ARCADE ZONE 🫧
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gamepad2 className="h-10 w-10 text-cyan-500" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title">
            Bob's Underwater Arcade
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          Waterproof arcade machines at the bottom of the tank!
        </p>
        <div className="text-sm text-blue-600 dark:text-blue-400">
          🐢 Bob says: "All my favorite games are down here!"
        </div>
        
        {/* Tank floor decorations */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 opacity-30">
          <span className="text-2xl aqua-plant">🌿</span>
          <span className="text-2xl">🪨</span>
          <span className="text-2xl aqua-plant" style={{ animationDelay: '1s' }}>🌿</span>
        </div>
      </div>

      {/* Arcade Machines */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {games.map((game) => (
          <div key={game.id} className="underwater-arcade group">
            <div className="p-6">
              {/* Arcade Screen Glow */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-400/70 transition-all">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white drop-shadow">{game.title}</h3>
                  <p className="text-sm text-cyan-200">Built with {game.tech}</p>
                </div>
              </div>
              <p className="text-white/90 mb-6">{game.description}</p>
              
              {/* Insert Coin Button */}
              <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold shadow-lg">
                <Link href={`/games/${game.slug}`}>
                  🪙 INSERT COIN - PLAY NOW
                </Link>
              </Button>
              
              {/* Bubbles rising from arcade */}
              <div className="flex gap-2 mt-3 justify-center">
                <span className="text-xs opacity-50">💧</span>
                <span className="text-xs opacity-40">💧</span>
                <span className="text-xs opacity-30">💧</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tank Leaderboard Trophy */}
      <div className="max-w-2xl mx-auto underwater-card p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-yellow-500 flex items-center justify-center treasure-glow">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-2xl">Tank Champions</h2>
            <p className="text-sm text-muted-foreground">Global Leaderboard</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          Check out the top players across all games and see if you can become the ultimate tank champion!
        </p>
        <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-500">
          <Link href="/games/leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            🏆 View Tank Champions
          </Link>
        </Button>
      </div>
      
      {/* Coming Soon */}
      <div className="mt-12 text-center">
        <div className="max-w-2xl mx-auto underwater-card p-8">
          <div className="text-4xl mb-3">🎪</div>
          <h2 className="font-serif text-2xl font-bold mb-3">More Arcade Machines Arriving!</h2>
          <p className="text-muted-foreground mb-4">
            Bob is installing more arcade machines at the bottom of the tank. 
            Check back soon for new waterproof games!
          </p>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            🐢 "I'm saving up for a Dance Dance Revolution machine!" - Bob
          </div>
        </div>
      </div>
    </div>
  );
}
