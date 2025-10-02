import Image from "next/image";
import { getAllRealLocations, getMajorLocations } from "@/lib/data/allRealLocations";
import { MapPin, Compass, Star, Map as MapIcon, Sparkles } from "lucide-react";

export const metadata = {
  title: "Adventure Realm Maps - Every Location",
  description: "Explore pixel art maps of all 143 locations from Matt & Bob's 69-chapter journey! Every place, landmark, and region mapped!",
};

export default function MapsPage() {
  const allLocations = getAllRealLocations();
  const majorLocations = getMajorLocations();

  // Terrain colors
  const terrainColors: Record<string, string> = {
    Desert: "from-yellow-100 to-orange-100 dark:from-yellow-950 dark:to-orange-950 border-yellow-300 dark:border-yellow-700",
    Forest: "from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700",
    Mountains: "from-gray-100 to-slate-100 dark:from-gray-950 dark:to-slate-950 border-gray-300 dark:border-gray-700",
    City: "from-stone-100 to-gray-100 dark:from-stone-950 dark:to-gray-950 border-stone-300 dark:border-stone-700",
    Water: "from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700",
    Dungeon: "from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950 border-purple-300 dark:border-purple-700",
    Digital: "from-fuchsia-100 to-pink-100 dark:from-fuchsia-950 dark:to-pink-950 border-fuchsia-300 dark:border-fuchsia-700",
    Cosmic: "from-violet-100 to-purple-100 dark:from-violet-950 dark:to-purple-950 border-violet-300 dark:border-violet-700",
    Village: "from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950 border-amber-300 dark:border-amber-700",
    Valley: "from-lime-100 to-green-100 dark:from-lime-950 dark:to-green-950 border-lime-300 dark:border-lime-700",
    Island: "from-teal-100 to-cyan-100 dark:from-teal-950 dark:to-cyan-950 border-teal-300 dark:border-teal-700",
    Temple: "from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 border-amber-300 dark:border-amber-700",
    Structure: "from-gray-100 to-zinc-100 dark:from-gray-950 dark:to-zinc-950 border-gray-300 dark:border-gray-700",
    Garden: "from-green-100 to-lime-100 dark:from-green-950 dark:to-lime-950 border-green-300 dark:border-green-700",
    Mixed: "from-slate-100 to-gray-100 dark:from-slate-950 dark:to-gray-950 border-slate-300 dark:border-slate-700",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 text-sm text-blue-600 dark:text-blue-300 font-medium tracking-wide">
          🗺️ COMPLETE ADVENTURE REALM ATLAS 🐢
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title mb-4">
          Every Location in the Adventure Realm
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Explore pixel art maps of ALL {allLocations.length} locations from Matt & Bob's journey!
        </p>
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{allLocations.length} Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>{majorLocations.length} Major Sites</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            <span>69 Chapters</span>
          </div>
        </div>
      </div>

      {/* World Map */}
      <section className="mb-20">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold mb-2 tank-title">Complete Journey Map</h2>
          <p className="text-muted-foreground">All {allLocations.length} locations with journey paths showing which chapters visit each place!</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-4 border-blue-400 dark:border-blue-600 rounded-xl overflow-hidden shadow-2xl">
          <div className="relative">
            <Image
              src="/maps/adventure-realm-complete-map.png"
              alt="Complete Adventure Realm Map with All Locations and Journey Paths"
              width={5120}
              height={5120}
              className="pixelated w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
              priority
            />
            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
              <div className="font-bold">🐢 Complete Adventure Realm</div>
              <div className="text-sm">{allLocations.length} Locations • 69 Chapters</div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-t-4 border-blue-400">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-bold mb-2">Map Features:</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-yellow-500 border-2 border-white rounded-sm"></div>
                  <span>Golden Path = 69-Chapter Journey</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-yellow-200 border-2 border-white rounded-sm opacity-50"></div>
                  <span>Faint Lines = Return Visits to Locations</span>
                </div>
              </div>
              
              <div>
                <div className="font-bold mb-2">Marker Sizes:</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-gray-600 border-2 border-white rounded-full"></div>
                  <span>Large = 5+ chapter visits</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-gray-600 border-2 border-white rounded-full"></div>
                  <span>Medium = 3-4 visits</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-gray-600 border-2 border-white rounded-full"></div>
                  <span>Small = 2 visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 border-2 border-white rounded-full"></div>
                  <span>Tiny = 1 mention</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm italic border-t pt-3">
              🌍 Locations spiral outward from center (early chapters) to edge (later chapters) • Colors indicate terrain type
            </div>
          </div>
        </div>
      </section>

      {/* Major Locations */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold mb-2 tank-title flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            Major Locations
          </h2>
          <p className="text-muted-foreground">Recurring destinations appearing in 3+ chapters</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {majorLocations.map((location) => (
            <div
              key={location.name}
              className={`bg-gradient-to-br ${terrainColors[location.terrain] || terrainColors.Mixed} border-2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg line-clamp-2">{location.name}</h3>
                  <span className="text-xs px-2 py-1 bg-white/50 dark:bg-black/30 rounded-full whitespace-nowrap">
                    {location.terrain}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapIcon className="h-3 w-3" />
                    <span>Ch {location.first_chapter}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span>{location.appearances} chapters</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 aspect-square">
                <Image
                  src={`/maps/locations/${location.mapFile}`}
                  alt={`${location.name} map`}
                  width={512}
                  height={512}
                  className="pixelated w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {location.description && (
                <div className="p-4 text-sm text-muted-foreground line-clamp-3">
                  {location.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* All Locations by Terrain */}
      <section>
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold mb-2 tank-title">All Locations by Terrain</h2>
          <p className="text-muted-foreground">Every single place mentioned across all 69 chapters</p>
        </div>

        {/* Group by terrain */}
        {Object.entries(
          allLocations.reduce((acc, loc) => {
            if (!acc[loc.terrain]) acc[loc.terrain] = [];
            acc[loc.terrain].push(loc);
            return acc;
          }, {} as Record<string, typeof allLocations>)
        )
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([terrain, locations]) => (
            <div key={terrain} className="mb-12">
              <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                {terrain} ({locations.length} locations)
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {locations.map((location) => (
                  <div
                    key={location.name}
                    className={`bg-gradient-to-br ${terrainColors[terrain] || terrainColors.Mixed} border-2 rounded-lg overflow-hidden shadow hover:shadow-lg transition-all`}
                    title={`${location.name} (Ch ${location.chapters})`}
                  >
                    <div className="p-2">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                        Ch {location.first_chapter}
                        {location.appearances > 1 && (
                          <span className="ml-1 text-yellow-600 dark:text-yellow-400">
                            ×{location.appearances}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-xs mb-2 line-clamp-2 leading-tight">
                        {location.name}
                      </h4>
                    </div>

                    <div className="bg-gray-900 aspect-square">
                      <Image
                        src={`/maps/locations/${location.mapFile}`}
                        alt={`${location.name} map`}
                        width={256}
                        height={256}
                        className="pixelated w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </section>

      {/* Footer Info */}
      <div className="mt-20 text-center text-sm text-muted-foreground">
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border-2 border-blue-300 dark:border-blue-700">
          <div className="font-bold mb-2">🎨 Created with PixelLab AI</div>
          <div>All {allLocations.length} location maps generated using AI-powered Wang tilesets (16×16 pixel art)</div>
          <div className="mt-2 text-xs">
            Every location, landmark, and region from the entire 69-chapter adventure!
          </div>
          <div className="mt-3 pt-3 border-t text-xs">
            🐢 <strong>Bob says:</strong> "Uncle Matt and I visited {allLocations.length} different places! 
            {majorLocations.length} of them we went back to multiple times. Now you can see them all!"
          </div>
        </div>
      </div>
    </div>
  );
}
