import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

export const metadata = {
  title: "Global Leaderboard",
  description: "Top players across all Bob's Turtle Tank games!",
};

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-10 w-10 text-yellow-600" />
          <h1 className="font-serif text-4xl font-bold">Global Leaderboard</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Top players across all games
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-turtle-green-600" />
              Turtle Bouncy Bounce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Leaderboard feature coming soon! Play the game to be among the first to claim a top spot.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-purple-600" />
              Turtle Roguelike Adventure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Leaderboard feature coming soon! Play the game to be among the first to claim a top spot.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

