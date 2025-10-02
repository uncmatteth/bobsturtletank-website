import { getAllCharacters, getCharacter } from "@/lib/data/characters";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Book } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const characters = getAllCharacters();
  return characters.map((character) => ({
    slug: character.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const character = getCharacter(resolvedParams.slug);
  if (!character) return { title: "Character Not Found" };

  return {
    title: character.name,
    description: character.description,
  };
}

export default async function CharacterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const character = getCharacter(resolvedParams.slug);

  if (!character) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/book/characters">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Characters
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="font-serif text-4xl font-bold">{character.name}</h1>
            <Badge variant="outline">Chapter {character.firstAppearance}</Badge>
            <Badge className="capitalize">{character.subcategory}</Badge>
          </div>
          {character.status && (
            <Badge variant="secondary">{character.status}</Badge>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{character.description}</p>
            </CardContent>
          </Card>

          {character.relationships && character.relationships !== "None" && (
            <Card>
              <CardHeader>
                <CardTitle>Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{character.relationships}</p>
              </CardContent>
            </Card>
          )}

          {character.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{character.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>First Appearance</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span>Chapter {character.firstAppearance}</span>
              <Button asChild variant="outline">
                <Link href={`/book/chapters/${character.firstAppearance}`}>
                  <Book className="mr-2 h-4 w-4" />
                  Read Chapter
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
