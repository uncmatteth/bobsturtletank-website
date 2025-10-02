import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Character } from "@/lib/data/characters";

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const slug = character.name.toLowerCase().replace(/\s+/g, '-');
  
  const categoryColors = {
    'Main': 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    'Allies': 'text-green-600 bg-green-50 dark:bg-green-950',
    'Antagonists': 'text-red-600 bg-red-50 dark:bg-red-950',
    'Minor': 'text-gray-600 bg-gray-50 dark:bg-gray-950',
  };
  
  const categoryColor = categoryColors[character.subcategory as keyof typeof categoryColors] || 'text-purple-600';

  return (
    <Link href={`/book/characters/${slug}`}>
      <div className="underwater-card h-full hover:scale-105 transition-transform p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-xl">{character.name}</h3>
          <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900">
            Ch. {character.firstAppearance}
          </Badge>
        </div>
        <div className="mb-3">
          <Badge className={`text-xs capitalize ${categoryColor}`}>
            {character.subcategory}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {character.description}
        </p>
        {character.status && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {character.status}
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
}

