import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Character } from "@/lib/data/characters";

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const slug = character.name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Link href={`/book/characters/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{character.name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              Ch. {character.firstAppearance}
            </Badge>
          </div>
          <CardDescription className="capitalize">{character.subcategory}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {character.description}
          </p>
          {character.status && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {character.status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
