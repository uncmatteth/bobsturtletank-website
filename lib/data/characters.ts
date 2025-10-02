import charactersData from '@/data/characters.json';

export interface Character {
  name: string;
  subcategory: string;
  firstAppearance: string;
  description: string;
  status: string;
  relationships: string;
  notes: string;
}

export function getAllCharacters(): Character[] {
  return charactersData as Character[];
}

export function getCharacter(name: string): Character | undefined {
  return getAllCharacters().find(c => 
    c.name.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  );
}

export function getCharactersBySubcategory(subcategory: string): Character[] {
  return getAllCharacters().filter(c => c.subcategory === subcategory);
}

export function searchCharacters(query: string): Character[] {
  const lowerQuery = query.toLowerCase();
  return getAllCharacters().filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.notes.toLowerCase().includes(lowerQuery)
  );
}

