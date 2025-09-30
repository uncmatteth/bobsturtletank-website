import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Turtle, Book, Gamepad2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "About Bob's Tank",
  description: "Learn about Bob the Magical Talking Turtle, Uncle Matt, and the Adventure Realm universe.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Turtle className="h-12 w-12 text-turtle-green-600" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold">About Bob's Turtle Tank</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The home of Bob the Magical Talking Turtle and Uncle Matt's epic adventures across the Adventure Realm
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-6 w-6 text-ocean-blue-600" />
              The Story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bob the Magical Talking Turtle's adventure begins in the quiet village of Cedar Hollow, 
              where a young bard named Uncle Matt discovers a shimmering emerald turtle with extraordinary abilities. 
              Together, they embark on an epic journey across the Adventure Realm - a vast universe spanning 
              fantasy forests, futuristic cities, cosmic voids, and digital dimensions.
            </p>
            <p>
              Over the course of 69 epic chapters, Bob and Matt face ancient evils, forge unlikely alliances, 
              discover powerful artifacts, and explore countless worlds. From battling the sorcerer Zarak to 
              befriending cosmic beings, their journey is one of friendship, discovery, wonder, and transformation.
            </p>
            <p className="font-semibold">
              The complete story features over 100 unique locations, 50+ magical artifacts, and dozens of 
              memorable characters - from humble villagers to cosmic entities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-turtle-green-600" />
              Meet the Heroes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Bob the Magical Talking Turtle</h3>
              <p className="text-muted-foreground">
                A wise and magical turtle with a shimmering emerald shell and mysterious powers. 
                Bob serves as both companion and guide to Uncle Matt, offering wisdom, magic, and 
                unwavering friendship throughout their journey.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Uncle Matt</h3>
              <p className="text-muted-foreground">
                A kind-hearted bard from Cedar Hollow who plays his father's silver lute. 
                Optimistic and musical, Matt's courage and compassion drive him to help those in need, 
                no matter how dangerous the quest.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-purple-600" />
              The Games
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Experience Bob's world through interactive browser games! Each game is built with Phaser 3 
              and brings different aspects of the Adventure Realm to life:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Turtle Bouncy Bounce:</strong> A fast-paced arcade platformer where you help Bob bounce higher and higher</li>
              <li><strong>Turtle Roguelike:</strong> Explore procedurally generated dungeons in this challenging dungeon crawler</li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/games">Play the Games</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Watch Bob's Real Tank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The inspiration for this entire universe comes from a real turtle! Watch the live stream 
              of Bob's actual turtle tank and see the little hero who sparked these epic adventures.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="https://portal.abs.xyz/stream/UncleMatt" target="_blank" rel="noopener noreferrer">
                Watch Live Stream
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explore the Universe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild variant="outline">
                <Link href="/book/chapters">Read All 69 Chapters</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/book/characters">Browse Characters</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/book/artifacts">View Artifacts</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/book/locations">Explore Locations</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/book/trivia">Play Trivia</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/games">Play Games</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-8 border-t">
          <p className="text-muted-foreground">
            Created with 💚 by Uncle Matt
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            © {new Date().getFullYear()} Bob's Turtle Tank. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
