"use client"

import { useState, useMemo } from "react";
import { getAllArtifacts } from "@/lib/data/artifacts";
import { SearchFilter } from "@/components/book/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Gem, Wand2 } from "lucide-react";

export default function ArtifactsPage() {
  const allArtifacts = getAllArtifacts();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtifacts = useMemo(() => {
    if (!searchQuery) return allArtifacts;

    const lowerQuery = searchQuery.toLowerCase();
    return allArtifacts.filter(a =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.description.toLowerCase().includes(lowerQuery) ||
      a.notes.toLowerCase().includes(lowerQuery) ||
      a.owner.toLowerCase().includes(lowerQuery)
    );
  }, [allArtifacts, searchQuery]);

  const getArtifactIcon = (subcategory: string) => {
    switch (subcategory.toLowerCase()) {
      case 'weapons':
        return '⚔️';
      case 'crystals':
      case 'enchanted items':
        return '💎';
      case 'clothing':
        return '👔';
      default:
        return '✨';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4 text-sm text-amber-600 dark:text-amber-300 font-medium tracking-wide">
          💎 SUNKEN TREASURES VAULT ✨
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title mb-4">
          Magical Artifacts
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
          Discover <strong className="text-amber-600">{allArtifacts.length}+ legendary artifacts</strong> scattered across the tank floor!
          Enchanted crystals, cosmic weapons, and magical items collected throughout the journey.
        </p>
        <div className="inline-block px-6 py-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border-2 border-amber-300 dark:border-amber-700">
          <div className="text-sm text-muted-foreground">
            🔮 Each artifact has <strong className="text-amber-600">magical properties</strong> and a unique story!
          </div>
        </div>
      </div>

      <div className="mb-8">
        <SearchFilter
          onSearch={setSearchQuery}
          placeholder="Search artifacts by name, description, or owner..."
        />
      </div>

      {filteredArtifacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg">
            No artifacts found matching your search. Try different keywords!
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Showing <strong>{filteredArtifacts.length}</strong> magical artifact{filteredArtifacts.length !== 1 ? 's' : ''}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtifacts.map((artifact) => (
              <div 
                key={artifact.name} 
                className="underwater-card p-6 relative overflow-hidden hover:scale-105 transition-transform"
              >
                {/* Decorative Icon */}
                <div className="absolute top-2 right-2 text-4xl opacity-20 treasure-glow">
                  {getArtifactIcon(artifact.subcategory)}
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-xl">{artifact.name}</h3>
                    <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 shrink-0">
                      Ch. {artifact.firstAppearance}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <Badge className="text-xs capitalize bg-purple-100 dark:bg-purple-900 text-purple-600">
                      {artifact.subcategory}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {artifact.description}
                  </p>
                  
                  {artifact.owner && artifact.owner !== "None" && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Current Owner:</p>
                      <Badge variant="secondary" className="text-xs">
                        {artifact.owner}
                      </Badge>
                    </div>
                  )}
                  
                  {artifact.notes && (
                    <p className="text-xs text-muted-foreground italic border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      {artifact.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bob's Message */}
      <div className="text-center mt-12">
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 max-w-2xl">
          <div className="text-4xl mb-4">🐢</div>
          <div className="font-bold mb-2 text-emerald-600">Bob's Artifact Tip:</div>
          <p className="text-muted-foreground">
            "Some of these artifacts are REALLY powerful! Like, cosmic-level powerful. Uncle Matt and I had to be super careful 
            with some of them. The Chrono Crystal? That thing can literally break time! Just... don't touch anything in here 
            without asking first, okay? 😅"
          </p>
        </div>
      </div>
    </div>
  );
}
