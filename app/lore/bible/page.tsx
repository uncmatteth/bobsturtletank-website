import { BookOpen, Sparkles, Map, Users } from "lucide-react";

export const metadata = {
  title: "Story Bible - Adventure Realm Lore",
  description: "Complete story bible documenting the Adventure Realm, characters, locations, and connections across Matt & Bob's 69-chapter journey.",
};

export default function StoryBiblePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 text-sm text-purple-600 dark:text-purple-300 font-medium tracking-wide">
          📖 ADVENTURE REALM CODEX 🐢
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title mb-4">
          Story Bible
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete reference guide to the Adventure Realm universe, documenting all characters, locations, artifacts, and story connections.
        </p>
      </div>

      {/* Three Pass System */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="underwater-card p-6">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
            <BookOpen className="h-6 w-6" />
            <h3 className="font-bold text-xl">Pass 1: Foundation</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Core story elements, main characters, key locations, and primary plot threads across all 69 chapters.
          </p>
          <div className="text-sm space-y-2">
            <div>✅ Characters documented</div>
            <div>✅ Locations mapped</div>
            <div>✅ Plot threads identified</div>
            <div>✅ Timeline established</div>
          </div>
        </div>

        <div className="underwater-card p-6">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-3">
            <Users className="h-6 w-6" />
            <h3 className="font-bold text-xl">Pass 2: Connections</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Character relationships, recurring themes, foreshadowing, and how story elements interconnect.
          </p>
          <div className="text-sm space-y-2">
            <div>✅ Relationships mapped</div>
            <div>✅ Callbacks identified</div>
            <div>✅ Themes documented</div>
            <div>✅ Patterns recognized</div>
          </div>
        </div>

        <div className="underwater-card p-6">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-3">
            <Sparkles className="h-6 w-6" />
            <h3 className="font-bold text-xl">Pass 3: Consistency</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Verification of continuity, character development arcs, and ensuring all story elements remain consistent.
          </p>
          <div className="text-sm space-y-2">
            <div>✅ Continuity verified</div>
            <div>✅ Arcs tracked</div>
            <div>✅ Details confirmed</div>
            <div>✅ Cross-references checked</div>
          </div>
        </div>
      </div>

      {/* What's Documented */}
      <section className="mb-16">
        <h2 className="font-serif text-3xl font-bold mb-8 text-center tank-title">
          What's in the Story Bible
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="underwater-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-lg">Characters</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 100+ character profiles with descriptions</li>
              <li>• Voice assignments for audiobook</li>
              <li>• Character relationships and connections</li>
              <li>• Development arcs across chapters</li>
              <li>• Recurring vs one-time appearances</li>
            </ul>
          </div>

          <div className="underwater-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Map className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-lg">Locations</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 143 unique locations mapped</li>
              <li>• Terrain classifications</li>
              <li>• Chapter appearances tracked</li>
              <li>• Geographic relationships</li>
              <li>• Journey path documentation</li>
            </ul>
          </div>

          <div className="underwater-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-lg">Artifacts & Magic</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 50+ magical artifacts catalogued</li>
              <li>• Enchantment details</li>
              <li>• Artifact histories and powers</li>
              <li>• Current owners/locations</li>
              <li>• Story significance</li>
            </ul>
          </div>

          <div className="underwater-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-lg">Plot Threads</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Main quest progression</li>
              <li>• Side quest documentation</li>
              <li>• Foreshadowing elements</li>
              <li>• Callbacks and references</li>
              <li>• Unresolved mysteries</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Download/Access Section */}
      <section className="text-center">
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border-2 border-blue-300 dark:border-blue-700">
          <div className="font-bold mb-2">📚 Complete Story Bible Documentation</div>
          <div className="text-sm text-muted-foreground mb-4">
            All lore, characters, locations, and connections meticulously documented across three comprehensive passes.
          </div>
          <div className="text-xs space-y-1">
            <div>🗺️ Explore <a href="/book/maps" className="text-blue-600 hover:underline">Adventure Realm Maps</a></div>
            <div>👥 Browse <a href="/book/characters" className="text-blue-600 hover:underline">Character Database</a></div>
            <div>💎 Discover <a href="/book/artifacts" className="text-blue-600 hover:underline">Magical Artifacts</a></div>
            <div>🔗 View <a href="/lore/connections" className="text-blue-600 hover:underline">Story Connections</a></div>
          </div>
        </div>
      </section>

      {/* Bob's Note */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <div className="inline-block px-6 py-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
          🐢 <strong>Bob says:</strong> "This story bible keeps track of EVERYTHING from our adventure! 
          Uncle Matt and I went through so many places and met so many friends - it's all documented here so 
          nothing gets forgotten! Pretty organized for a turtle, right?"
        </div>
      </div>
    </div>
  );
}


