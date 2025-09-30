import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllCharacters } from "@/lib/data/characters";
import { getAllArtifacts } from "@/lib/data/artifacts";
import { getAllLocations } from "@/lib/data/locations";
import { getAllChapters } from "@/lib/data/chapters";
import { Book, Users, Sparkles, MapPin, Trophy } from "lucide-react";

export const metadata = {
  title: "The Book",
  description: "Explore Bob's Adventure Realm - Read chapters, discover characters, artifacts, and locations from the epic 69-chapter series.",
};

export default function BookPage() {
  const charactersCount = getAllCharacters().length;
  const artifactsCount = getAllArtifacts().length;
  const locationsCount = getAllLocations().length;
  const chaptersCount = getAllChapters().length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          Bob's Adventure Realm Encyclopedia
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Dive deep into the {chaptersCount}-chapter epic journey of Bob the Magical Talking Turtle and Uncle Matt.
          Explore characters, magical artifacts, legendary locations, and test your knowledge!
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chapters */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-ocean-blue-600">
              <Book className="h-6 w-6" />
              <CardTitle>Chapters</CardTitle>
            </div>
            <CardDescription>{chaptersCount} epic chapters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Read the complete adventure from Cedar Hollow to the cosmic void and beyond!
            </p>
            <Button asChild className="w-full">
              <Link href="/book/chapters">Read Chapters</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Characters */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-turtle-green-600">
              <Users className="h-6 w-6" />
              <CardTitle>Characters</CardTitle>
            </div>
            <CardDescription>{charactersCount} characters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Meet heroes, villains, allies, and cosmic beings from across the Adventure Realm.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/characters">Browse Characters</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Artifacts */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="h-6 w-6" />
              <CardTitle>Magical Artifacts</CardTitle>
            </div>
            <CardDescription>{artifactsCount} artifacts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Discover enchanted items, powerful weapons, and mysterious objects.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/artifacts">View Artifacts</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <MapPin className="h-6 w-6" />
              <CardTitle>Locations</CardTitle>
            </div>
            <CardDescription>{locationsCount} locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Explore villages, forests, mountains, dungeons, cities, and cosmic realms.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/locations">Explore Locations</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Trivia Game */}
        <Card className="hover:shadow-lg transition-shadow md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 text-pink-600">
              <Trophy className="h-6 w-6" />
              <CardTitle>Trivia Game</CardTitle>
            </div>
            <CardDescription>Test your Adventure Realm knowledge!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Challenge yourself with questions about characters, locations, artifacts, and story events. 
              Compete for the top spot on the leaderboard!
            </p>
            <Button asChild className="w-full">
              <Link href="/book/trivia">Play Trivia</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
