"use client"

import { useState, useMemo } from "react";
import Link from "next/link";
import { getAllLocations } from "@/lib/data/locations";
import { SearchFilter } from "@/components/book/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Map } from "lucide-react";

const filters = [
  { label: "Forest", value: "Forest" },
  { label: "Grassland", value: "Grassland" },
  { label: "Mountains", value: "Mountains" },
  { label: "Desert", value: "Desert" },
  { label: "Dungeon", value: "Dungeon" },
  { label: "City", value: "City" },
  { label: "Cosmic", value: "Cosmic" },
];

export default function LocationsPage() {
  const allLocations = getAllLocations();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const filteredLocations = useMemo(() => {
    let filtered = allLocations;

    // Apply terrain type filter
    if (activeFilter) {
      filtered = filtered.filter(l => l.terrainType.includes(activeFilter));
    }

    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(lowerQuery) ||
        l.description.toLowerCase().includes(lowerQuery) ||
        l.region.toLowerCase().includes(lowerQuery) ||
        l.terrainType.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [allLocations, searchQuery, activeFilter]);

  const getLocationIcon = (terrainType: string) => {
    const terrain = terrainType.toLowerCase();
    if (terrain.includes('village')) return '🏘️';
    if (terrain.includes('forest')) return '🌲';
    if (terrain.includes('mountain')) return '⛰️';
    if (terrain.includes('city')) return '🏙️';
    if (terrain.includes('dungeon') || terrain.includes('cave')) return '⚔️';
    if (terrain.includes('cosmic') || terrain.includes('void')) return '🌌';
    if (terrain.includes('desert')) return '🏜️';
    if (terrain.includes('ocean') || terrain.includes('sea')) return '🌊';
    return '📍';
  };

  const getCategoryColor = (terrainType: string) => {
    const terrain = terrainType.toLowerCase();
    if (terrain.includes('village')) return 'bg-green-100 dark:bg-green-900 text-green-600';
    if (terrain.includes('forest')) return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600';
    if (terrain.includes('mountain')) return 'bg-gray-100 dark:bg-gray-900 text-gray-600';
    if (terrain.includes('city')) return 'bg-blue-100 dark:bg-blue-900 text-blue-600';
    if (terrain.includes('dungeon') || terrain.includes('cave')) return 'bg-red-100 dark:bg-red-900 text-red-600';
    if (terrain.includes('cosmic') || terrain.includes('void')) return 'bg-purple-100 dark:bg-purple-900 text-purple-600';
    if (terrain.includes('desert')) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600';
    if (terrain.includes('ocean') || terrain.includes('sea')) return 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600';
    return 'bg-amber-100 dark:bg-amber-900 text-amber-600';
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4 text-sm text-green-600 dark:text-green-300 font-medium tracking-wide">
          🗺️ TANK ZONES DIRECTORY 📍
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title mb-4">
          Adventure Realm Locations
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Explore <strong className="text-green-600">{allLocations.length}+ legendary locations</strong> from Bob's journey!
          Villages, forests, mountains, cities, dungeons, and cosmic realms.
        </p>
        
        {/* Featured: Link to Maps Page */}
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border-2 border-blue-400 dark:border-blue-600 max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <Map className="h-6 w-6 text-blue-600" />
            <div className="font-bold text-blue-600">Want to SEE these locations?</div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Check out our <strong>143 pixel art maps</strong> showing the actual geography of every location! 
            Includes a complete world map with journey paths.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/book/maps">🗺️ View Complete Atlas</Link>
          </Button>
        </div>
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
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg">
            No locations found matching your criteria. Try different keywords!
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Showing <strong>{filteredLocations.length}</strong> location{filteredLocations.length !== 1 ? 's' : ''}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <div 
                key={location.id} 
                className="underwater-card p-6 relative overflow-hidden hover:scale-105 transition-transform"
              >
                {/* Decorative Icon */}
                <div className="absolute top-2 right-2 text-5xl opacity-15">
                  {getLocationIcon(location.terrainType)}
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-xl">{location.name}</h3>
                    <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 shrink-0">
                      Ch. {location.chapters[0]}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <Badge className={`text-xs ${getCategoryColor(location.terrainType)}`}>
                      {location.terrainType}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {location.description}
                  </p>
                  
                  {location.specialFeatures && location.specialFeatures.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Special Features:</p>
                      <p className="text-xs text-muted-foreground">
                        {location.specialFeatures.slice(0, 3).join(' • ')}
                      </p>
                    </div>
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
          <div className="font-bold mb-2 text-emerald-600">Bob's Travel Tip:</div>
          <p className="text-muted-foreground">
            "Uncle Matt and I visited SO many places! Each one was unique and had its own challenges. 
            My personal favorite? Probably the Crystal Caverns - so sparkly! But the Cosmic Void was pretty wild too. 
            Check out the maps page to see where we went in each chapter! 🗺️"
          </p>
        </div>
      </div>
    </div>
  );
}
