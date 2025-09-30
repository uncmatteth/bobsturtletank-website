"use client"

import { useState, useMemo } from "react";
import { getAllArtifacts } from "@/lib/data/artifacts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SearchFilter } from "@/components/book/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function ArtifactsPage() {
  const allArtifacts = getAllArtifacts();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtifacts = useMemo(() => {
    if (!searchQuery) return allArtifacts;

    const lowerQuery = searchQuery.toLowerCase();
    return allArtifacts.filter(a =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.description.toLowerCase().includes(lowerQuery) ||
      a.notes.toLowerCase().includes(lowerQuery)
    );
  }, [allArtifacts, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="font-serif text-4xl font-bold">Magical Artifacts</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Discover {allArtifacts.length} magical artifacts from across the Adventure Realm
        </p>
      </div>

      <div className="mb-8">
        <SearchFilter
          onSearch={setSearchQuery}
          placeholder="Search artifacts by name or description..."
        />
      </div>

      {filteredArtifacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No artifacts found matching your search.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredArtifacts.length} artifact{filteredArtifacts.length !== 1 ? 's' : ''}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtifacts.map((artifact) => (
              <Card key={artifact.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{artifact.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Ch. {artifact.firstAppearance}
                    </Badge>
                  </div>
                  <CardDescription className="capitalize">
                    {artifact.subcategory}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {artifact.description}
                  </p>
                  {artifact.owner && artifact.owner !== "None" && (
                    <div>
                      <p className="text-xs text-muted-foreground">Owner:</p>
                      <Badge variant="secondary" className="text-xs">
                        {artifact.owner}
                      </Badge>
                    </div>
                  )}
                  {artifact.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      {artifact.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
