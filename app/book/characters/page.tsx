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
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4 text-sm text-purple-600 dark:text-purple-300 font-medium tracking-wide">
          👥 TANK RESIDENTS DATABASE 🐠
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title mb-4">
          Meet the Characters
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
          Explore all <strong className="text-purple-600">{allCharacters.length}+ characters</strong> who appear in Bob's adventure!
          From heroes to villains, allies to cosmic beings - they're all here in the tank!
        </p>
        <div className="inline-block px-6 py-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border-2 border-purple-300 dark:border-purple-700">
          <div className="text-sm text-muted-foreground">
            🎤 Each character has a <strong className="text-purple-600">celebrity AI voice</strong> in the audiobook!
          </div>
        </div>
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

