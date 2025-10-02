import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Book, Users, Network, Sparkles, Map, Clock, Shield, Scroll } from "lucide-react";

export const metadata = {
  title: "Deep Lore - Adventure Realm Mysteries",
  description: "Explore the guardian network, magic systems, character connections, and hidden mysteries of Bob's Adventure Realm",
};

export default function LorePage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 text-sm text-indigo-600 dark:text-indigo-300 font-medium tracking-wide">
          📜 ANCIENT SCROLLS & SECRETS 🔮
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tank-title mb-4">
          Adventure Realm Lore
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Dive deep into the <strong className="text-indigo-600">intricate world-building</strong>, guardian networks, 
          magic systems, and cosmic connections that make Bob's 69-chapter adventure an epic journey!
        </p>
        <div className="inline-block px-6 py-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg border-2 border-purple-300 dark:border-purple-700">
          <div className="text-sm text-muted-foreground">
            ✨ Discover <strong className="text-purple-600">hidden connections</strong> and mysteries spanning multiple realms!
          </div>
        </div>
      </div>

      {/* Lore Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Guardian Network */}
        <div className="underwater-card p-8 hover:scale-105 transition-transform bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-400 dark:border-green-600">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
            <h2 className="font-serif text-2xl font-bold text-green-600">Guardian Network</h2>
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Discover <strong>Everwood</strong>, <strong>Rahil</strong>, and the mysterious guardian system 
            that watches over travelers across all realms. Who are they? Why do they serve?
          </p>
          <ul className="text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Ancient protectors across dimensions</li>
            <li>• Know travelers before meeting them</li>
            <li>• Bound by mysterious oaths</li>
          </ul>
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <Link href="/lore/guardians">🛡️ Explore Guardians</Link>
          </Button>
        </div>

        {/* Magic & Artifacts */}
        <div className="underwater-card p-8 hover:scale-105 transition-transform bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-400 dark:border-purple-600">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h2 className="font-serif text-2xl font-bold text-purple-600">Magic Systems</h2>
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Understand the <strong>artifact synergy system</strong> and how the Star-Song Scepter, 
            Dimension Blade, and Chrono Crystal interact across time and space!
          </p>
          <ul className="text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Artifact synergy mechanics</li>
            <li>• Cosmic-level magic systems</li>
            <li>• 50+ interconnected artifacts</li>
          </ul>
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
            <Link href="/lore/magic">✨ Discover Magic</Link>
          </Button>
        </div>

        {/* Timeline */}
        <div className="underwater-card p-8 hover:scale-105 transition-transform bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-400 dark:border-blue-600">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <h2 className="font-serif text-2xl font-bold text-blue-600">Timeline & Events</h2>
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Track the <strong>chronological progression</strong> of Matt and Bob's journey across 
            69 epic chapters, from Cedar Hollow to the Cosmic Void!
          </p>
          <ul className="text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Chapter-by-chapter timeline</li>
            <li>• Key events and turning points</li>
            <li>• Character arc progressions</li>
          </ul>
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/lore/timeline">⏰ View Timeline</Link>
          </Button>
        </div>

        {/* Connections */}
        <div className="underwater-card p-8 hover:scale-105 transition-transform bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-2 border-pink-400 dark:border-pink-600">
          <div className="flex items-center gap-3 mb-4">
            <Network className="h-8 w-8 text-pink-600" />
            <h2 className="font-serif text-2xl font-bold text-pink-600">Character Connections</h2>
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Explore the <strong>web of relationships</strong> connecting 100+ characters across 
            the Adventure Realm - allies, enemies, and unexpected friendships!
          </p>
          <ul className="text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Character relationship maps</li>
            <li>• Hidden connections revealed</li>
            <li>• Alliance networks & rivalries</li>
          </ul>
          <Button asChild className="w-full bg-pink-600 hover:bg-pink-700">
            <Link href="/lore/connections">🕸️ See Connections</Link>
          </Button>
        </div>

        {/* Realms */}
        <div className="underwater-card p-8 hover:scale-105 transition-transform bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-2 border-amber-400 dark:border-amber-600">
          <div className="flex items-center gap-3 mb-4">
            <Map className="h-8 w-8 text-amber-600" />
            <h2 className="font-serif text-2xl font-bold text-amber-600">Realms & Dimensions</h2>
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Journey through <strong>143 unique locations</strong> spanning fantasy forests, 
            futuristic cities, digital dimensions, and cosmic voids!
          </p>
          <ul className="text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Multi-dimensional realm system</li>
            <li>• Reality layers and boundaries</li>
            <li>• Cross-realm travel mechanics</li>
          </ul>
          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
            <Link href="/lore/realms">🌌 Visit Realms</Link>
          </Button>
        </div>

        {/* Story Bible */}
        <div className="treasure-chest p-8 hover:scale-105 transition-transform relative overflow-hidden">
          <div className="absolute top-4 right-4 text-6xl opacity-20">📖</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Book className="h-8 w-8 text-yellow-300" />
              <h2 className="font-serif text-2xl font-bold text-white drop-shadow-lg">Story Bible</h2>
            </div>
            <p className="text-white/95 mb-4 leading-relaxed">
              The <strong>comprehensive lore database</strong> with all story elements, patterns, 
              mysteries, and the foundational documents that define the Adventure Realm!
            </p>
            <ul className="text-sm space-y-2 mb-6 text-white/90">
              <li>• Complete story structure</li>
              <li>• Foundational world rules</li>
              <li>• Story consistency guide</li>
            </ul>
            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-500">
              <Link href="/lore/bible">📜 Read Story Bible</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Featured: Guardian Network Deep Dive */}
      <section className="mb-16">
        <div className="underwater-card p-10 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-2 border-emerald-400 dark:border-emerald-600">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
            <h2 className="font-serif text-3xl font-bold tank-title mb-2">Featured: The Guardian Network</h2>
            <p className="text-muted-foreground">One of the Adventure Realm's greatest mysteries</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Everwood */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-6 w-6 text-green-600" />
                <h3 className="font-bold text-xl text-green-600">Everwood</h3>
              </div>
              <p className="text-sm italic text-muted-foreground mb-4 border-l-4 border-green-400 pl-3">
                "Countless years I have been tasked with watching over these ancient mountains, 
                seeking to guide and assist those who journey here with courage and noble purpose."
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>Serves voluntarily as mountain protector</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>Knows travelers' names before meeting them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>Appears when need is greatest</span>
                </li>
              </ul>
            </div>

            {/* Rahil */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-6 w-6 text-amber-600" />
                <h3 className="font-bold text-xl text-amber-600">Rahil</h3>
              </div>
              <p className="text-sm italic text-muted-foreground mb-4 border-l-4 border-amber-400 pl-3">
                "I guide all souls who lose their way. It is my sworn duty to shelter all 
                souls who wander these sands."
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Serves as "recompense" for unknown reason</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Part of larger guardian network</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Knows of Everwood and other guardians</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/lore/guardians">
                🛡️ Explore the Full Guardian Network →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bob's Lore Tip */}
      <div className="text-center">
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 max-w-2xl">
          <div className="text-4xl mb-4">🐢📚</div>
          <div className="font-bold mb-2 text-emerald-600">Bob's Lore Secret:</div>
          <p className="text-muted-foreground">
            "The lore goes DEEP. Like, really deep. There are connections Uncle Matt and I didn't even realize until 
            way later in the adventure! The Guardian Network stuff especially - that was wild when we figured out 
            what was really going on. Start with the Guardians page if you want your mind blown! 🤯"
          </p>
        </div>
      </div>
    </div>
  );
}
