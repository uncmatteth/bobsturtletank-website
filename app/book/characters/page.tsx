"use client"

import { useState, useMemo } from "react";
import { getAllCharacters } from "@/lib/data/characters";
import { CharacterCard } from "@/components/book/CharacterCard";
import { SearchFilter } from "@/components/book/SearchFilter";
import { Users } from "lucide-react";

const filters = [
  { label: "Main Characters", value: "Main" },
  { label: "Allies", value: "Allies" },
  { label: "Antagonists", value: "Antagonists" },
  { label: "Minor", value: "Minor" },
];

export default function CharactersPage() {
  const allCharacters = getAllCharacters();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const filteredCharacters = useMemo(() => {
    let filtered = allCharacters;

    // Apply subcategory filter
    if (activeFilter) {
      filtered = filtered.filter(c => c.subcategory === activeFilter);
    }

    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.notes.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [allCharacters, searchQuery, activeFilter]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-turtle-green-600" />
          <h1 className="font-serif text-4xl font-bold">Characters</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Discover {allCharacters.length} characters from Bob's Adventure Realm
        </p>
      </div>

      <div className="mb-8">
        <SearchFilter
          onSearch={setSearchQuery}
          onFilterChange={setActiveFilter}
          filters={filters}
          activeFilter={activeFilter}
          placeholder="Search characters by name, description, or relationships..."
        />
      </div>

      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No characters found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <CharacterCard key={character.name} character={character} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
