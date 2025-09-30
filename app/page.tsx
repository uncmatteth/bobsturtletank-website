import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Gamepad2, Book, Trophy, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-turtle-green-700 dark:text-turtle-green-400 mb-4">
          Welcome to Bob's Turtle Tank
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Join Bob the Magical Talking Turtle and Uncle Matt on epic adventures across the Adventure Realm!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/games">
              <Gamepad2 className="mr-2 h-5 w-5" />
              Play Games
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/book">
              <Book className="mr-2 h-5 w-5" />
              Explore the Book
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/book/trivia">
              <Trophy className="mr-2 h-5 w-5" />
              Play Trivia
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Content */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {/* Featured Game */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-turtle-green-600">
              <Gamepad2 className="h-6 w-6" />
              <CardTitle>Featured Game</CardTitle>
            </div>
            <CardDescription>Test your skills!</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">Turtle Bouncy Bounce</h3>
            <p className="text-sm text-muted-foreground">
              Help Bob bounce higher and higher! Dodge platforms, collect coins, and see how high you can go.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/games/bounce">Play Now</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Latest Chapter */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-ocean-blue-600">
              <Book className="h-6 w-6" />
              <CardTitle>Latest Chapter</CardTitle>
            </div>
            <CardDescription>Continue the adventure</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">Chapter 69: A Beckoning Signal Through the Stars</h3>
            <p className="text-sm text-muted-foreground">
              The cosmic journey continues as mysterious signals beckon from the void...
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/chapters/69">Read Chapter</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Character Encyclopedia */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="h-6 w-6" />
              <CardTitle>Character Encyclopedia</CardTitle>
            </div>
            <CardDescription>Discover the realm</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">171 Characters & Locations</h3>
            <p className="text-sm text-muted-foreground">
              Explore detailed profiles of every character, magical artifact, and legendary location from the Adventure Realm.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/characters">Browse Characters</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* About Bob Section */}
      <section className="text-center py-12 max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl font-bold mb-6">About Bob & Uncle Matt</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Bob the Magical Talking Turtle and her companion Uncle Matt traverse the Adventure Realm - 
          a vast universe spanning fantasy forests, futuristic cities, cosmic voids, and digital dimensions. 
          With 69 epic chapters, hundreds of characters, and countless magical artifacts, 
          their journey is one of friendship, discovery, and wonder.
        </p>
        <Button asChild>
          <Link href="/about">Learn More About Bob's Tank</Link>
        </Button>
      </section>
    </div>
  );
}
