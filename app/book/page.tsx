import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllCharacters } from "@/lib/data/characters";
import { getAllArtifacts } from "@/lib/data/artifacts";
import { getAllRealLocations } from "@/lib/data/allRealLocations";
import { Book, Users, Sparkles, MapPin, Trophy, Headphones, Map, ShoppingCart, Scroll, Star } from "lucide-react";

export const metadata = {
  title: "Bob's Treasure Chest - The Complete Adventure",
  description: "Open the treasure chest! Explore all 69 chapters, 143 locations, 100+ characters, and magical artifacts from Bob's epic adventure.",
};

export default function BookPage() {
  const charactersCount = getAllCharacters().length;
  const artifactsCount = getAllArtifacts().length;
  const realLocations = getAllRealLocations();
  const locationsCount = realLocations.length;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      {/* Hero Header - Treasure Chest Theme */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/20 to-transparent dark:from-amber-900/20 pointer-events-none" />
        <div className="relative">
          <div className="inline-block mb-4 text-sm text-amber-600 dark:text-amber-300 font-medium tracking-wide">
            💎 TREASURE CHEST UNLOCKED 🔓
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold tank-title mb-4 flex items-center justify-center gap-4">
            <span className="text-5xl">📖</span>
            Bob's Complete Adventure
            <span className="text-5xl">✨</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            The treasure chest is open! Explore <strong>69 epic chapters</strong> spanning <strong>143 unique locations</strong>, 
            meet <strong>100+ incredible characters</strong>, and discover <strong>50+ magical artifacts</strong>!
          </p>
          
          {/* Quick Stats */}
          <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-xl border-2 border-amber-300 dark:border-amber-700 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">69</div>
              <div className="text-xs text-muted-foreground">Epic Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{locationsCount}</div>
              <div className="text-xs text-muted-foreground">Unique Places</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{charactersCount}+</div>
              <div className="text-xs text-muted-foreground">Characters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{artifactsCount}+</div>
              <div className="text-xs text-muted-foreground">Artifacts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Buy the Book - FEATURED */}
        <div className="treasure-chest p-8 relative overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 text-8xl opacity-10">📚</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="h-8 w-8 text-yellow-300" />
              <h2 className="font-serif text-3xl font-bold text-white drop-shadow-lg">Get The Complete Book</h2>
            </div>
            <p className="text-white/95 text-lg mb-4 leading-relaxed">
              Experience the complete 69-chapter epic from Cedar Hollow to the Cosmic Void and beyond! 
              Available in paperback, hardcover, and ebook formats.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                <Star className="h-4 w-4 text-yellow-300" />
                <span>69 Chapters</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span>Epic Fantasy</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                <Book className="h-4 w-4 text-blue-300" />
                <span>Complete Series</span>
              </div>
            </div>
            <Button asChild size="lg" className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
              <Link href="/book/buy">🛒 Buy Now - Support Bob!</Link>
            </Button>
          </div>
        </div>

        {/* Audiobook Voice Cast - FEATURED */}
        <div className="underwater-card p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-400 dark:border-purple-600 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 text-7xl opacity-10">🎤</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Headphones className="h-8 w-8 text-purple-600" />
              <h2 className="font-serif text-2xl font-bold text-purple-600">Audiobook Cast</h2>
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              <strong className="text-purple-600">100+ celebrity AI voices!</strong> Morgan Freeman narrates, 
              Taylor Swift voices Bob, and every character has their own celebrity voice!
            </p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                <span>Morgan Freeman - Narrator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>Taylor Swift - Bob</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span>98 more celebrity voices!</span>
              </div>
            </div>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/book/audiobook">🎧 See Full Cast</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Explore the Adventure Realm */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tank-title mb-4">
            Explore the Adventure Realm
          </h2>
          <p className="text-muted-foreground text-lg">
            Deep dive into every aspect of Bob and Matt's epic journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Adventure Atlas */}
          <div className="underwater-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-400 dark:border-blue-600 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-3">
              <Map className="h-7 w-7 text-blue-600" />
              <h3 className="font-bold text-xl text-blue-600">Adventure Atlas</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{locationsCount}</div>
            <p className="text-sm text-muted-foreground mb-4">
              Pixel art maps of every location! Complete world map with journey paths.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/book/maps">🗺️ View Maps</Link>
            </Button>
          </div>

          {/* Tank Residents */}
          <div className="underwater-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-7 w-7 text-purple-600" />
              <h3 className="font-bold text-xl text-purple-600">Tank Residents</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">{charactersCount}+</div>
            <p className="text-sm text-muted-foreground mb-4">
              Heroes, villains, allies, cosmic beings, and magical creatures!
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/characters">👥 Meet Characters</Link>
            </Button>
          </div>

          {/* Sunken Treasures */}
          <div className="underwater-card p-6 hover:scale-105 transition-transform relative overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-20 treasure-glow">💎</div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Sparkles className="h-7 w-7 text-amber-600" />
              <h3 className="font-bold text-xl text-amber-600">Sunken Treasures</h3>
            </div>
            <div className="text-3xl font-bold text-amber-600 mb-2 relative z-10">{artifactsCount}+</div>
            <p className="text-sm text-muted-foreground mb-4 relative z-10">
              Enchanted crystals, cosmic weapons, and legendary magical items!
            </p>
            <Button asChild variant="outline" className="w-full relative z-10">
              <Link href="/book/artifacts">💎 View Artifacts</Link>
            </Button>
          </div>

          {/* Tank Expert Quiz */}
          <div className="underwater-card p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-7 w-7 text-yellow-600" />
              <h3 className="font-bold text-xl text-yellow-600">Tank Expert Test</h3>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-2">Challenge Mode</div>
            <p className="text-sm text-muted-foreground mb-4">
              Test your knowledge! Characters, locations, artifacts, and story events.
            </p>
            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
              <Link href="/book/trivia">🏆 Take Quiz</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lore Deep Dive */}
      <section className="mb-16">
        <div className="underwater-card p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-400 dark:border-indigo-600">
          <div className="flex items-center gap-3 mb-4">
            <Scroll className="h-8 w-8 text-indigo-600" />
            <h2 className="font-serif text-3xl font-bold text-indigo-600">Deep Lore & Story Bible</h2>
          </div>
          <p className="text-muted-foreground mb-6 text-lg">
            Want to understand the deeper connections, magic systems, and hidden histories of the Adventure Realm? 
            Explore the complete lore documentation including guardians, realms, timeline, and character connections.
          </p>
          <Button asChild size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950">
            <Link href="/lore">📜 Explore Deep Lore</Link>
          </Button>
        </div>
      </section>

      {/* Bob's Reading Recommendation */}
      <section className="text-center">
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 max-w-2xl">
          <div className="text-4xl mb-4">🐢</div>
          <div className="font-bold mb-2 text-emerald-600">Bob's Reading Tip:</div>
          <p className="text-muted-foreground">
            "Start with the maps to see where Uncle Matt and I went! Then check out the characters we met along the way. 
            Or just dive right into the book - it's your adventure now! Oh, and definitely take the trivia quiz when you're done. 
            I bet you can't beat my high score! 😏"
          </p>
        </div>
      </section>
    </div>
  );
}
