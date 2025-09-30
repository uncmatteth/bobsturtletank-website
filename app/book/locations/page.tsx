"use client"

import { useState, useMemo } from "react";
import { getAllLocations } from "@/lib/data/locations";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SearchFilter } from "@/components/book/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const filters = [
  { label: "Villages", value: "Villages" },
  { label: "Forests", value: "Forests" },
  { label: "Mountains", value: "Mountains" },
  { label: "Cities", value: "Cities" },
  { label: "Dungeons", value: "Dungeons" },
  { label: "Realms", value: "Realms" },
];

export default function LocationsPage() {
  const allLocations = getAllLocations();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const filteredLocations = useMemo(() => {
    let filtered = allLocations;

    // Apply subcategory filter
    if (activeFilter) {
      filtered = filtered.filter(l => l.subcategory === activeFilter);
    }

    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(lowerQuery) ||
        l.description.toLowerCase().includes(lowerQuery) ||
        l.notes.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [allLocations, searchQuery, activeFilter]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-8 w-8 text-amber-600" />
          <h1 className="font-serif text-4xl font-bold">Locations</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Explore {allLocations.length} legendary locations across the Adventure Realm
        </p>
      </div>

      <div className="mb-8">
        <SearchFilter
          onSearch={setSearchQuery}
          onFilterChange={setActiveFilter}
          filters={filters}
          activeFilter={activeFilter}
          placeholder="Search locations by name or description..."
        />
      </div>

      {filteredLocations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No locations found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <Card key={location.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Ch. {location.firstAppearance}
                    </Badge>
                  </div>
                  <CardDescription className="capitalize">
                    {location.subcategory}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {location.description}
                  </p>
                  {location.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      {location.notes}
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
