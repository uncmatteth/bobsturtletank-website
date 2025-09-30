import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy } from "lucide-react";

export const metadata = {
  title: "Games Arcade",
  description: "Play browser games set in Bob's Adventure Realm universe!",
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
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gamepad2 className="h-10 w-10 text-turtle-green-600" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold">Bob's Adventure Realm Arcade</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Play browser games featuring Bob the Turtle and challenge friends on the leaderboard!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">{game.title}</CardTitle>
              <CardDescription>Built with {game.tech}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{game.description}</p>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href={`/games/${game.slug}`}>
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Play Game
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Leaderboard Section */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <CardTitle>Global Leaderboard</CardTitle>
          </div>
          <CardDescription>Compete with players worldwide!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Check out the top players across all games and see how you rank!
          </p>
          <Button asChild className="w-full">
            <Link href="/games/leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
