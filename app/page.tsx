import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Book, Trophy, Sparkles, Zap, MapPin } from "lucide-react";
import { TankHero } from "@/components/hero/TankHero";
import { BobCarousel } from "@/components/sections/BobCarousel";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Tank Hero - Looking into Bob's Tank */}
      <TankHero />

      {/* Tank Zones - Explore Different Areas */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 text-sm text-blue-600 dark:text-blue-300 font-medium tracking-wide">
            🗺️ EXPLORE DIFFERENT TANK ZONES 🌊
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 tank-title">
            What's In Bob's Tank?
          </h2>
          <p className="text-xl text-muted-foreground">
            Dive into different zones of Bob's underwater kingdom!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Treasure Chest - The Book */}
          <div className="underwater-card p-6 treasure-chest relative">
            <div className="flex items-center gap-2 text-yellow-300 mb-3 relative z-10">
              <Book className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white drop-shadow-lg">Treasure Chest</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white drop-shadow relative z-10">69 Epic Chapters</h4>
            <p className="text-white/90 mb-6 relative z-10">
              Open the treasure chest to discover Bob's complete adventure from Cedar Hollow to the cosmic void!
            </p>
            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-500 relative z-10">
              <Link href="/book">🔓 Open Chest</Link>
            </Button>
          </div>

          {/* Underwater Arcade */}
          <div className="underwater-arcade p-6">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <Gamepad2 className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white drop-shadow-lg">Underwater Arcade</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white drop-shadow">Play in the Tank!</h4>
            <p className="text-white/90 mb-6">
              Bob's favorite arcade machines are at the bottom of the tank - waterproof and ready to play!
            </p>
            <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-500">
              <Link href="/games">🎮 Start Gaming</Link>
            </Button>
          </div>

          {/* Tank Residents */}
          <div className="underwater-card p-6">
            <div className="flex items-center gap-2 text-purple-600 mb-3">
              <Sparkles className="h-8 w-8" />
              <h3 className="font-bold text-2xl">Tank Residents</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3">100+ Characters</h4>
            <p className="text-muted-foreground mb-6">
              Meet all the friends, allies, and visitors who've stopped by Bob's tank!
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/characters">👥 Meet Everyone</Link>
            </Button>
          </div>

          {/* Sunken Treasures */}
          <div className="underwater-card p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl opacity-20 treasure-glow">💎</div>
            <div className="flex items-center gap-2 text-amber-600 mb-3">
              <Sparkles className="h-8 w-8" />
              <h3 className="font-bold text-2xl">Sunken Treasures</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3">50+ Magical Artifacts</h4>
            <p className="text-muted-foreground mb-6">
              Scattered across the tank floor - enchanted crystals, cosmic weapons, and legendary items!
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/artifacts">💎 Find Treasures</Link>
            </Button>
          </div>

          {/* Tank Quiz Master */}
          <div className="underwater-card p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
            <div className="flex items-center gap-2 text-yellow-600 mb-3">
              <Trophy className="h-8 w-8" />
              <h3 className="font-bold text-2xl">Tank Expert Test</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3">Trivia Challenge</h4>
            <p className="text-muted-foreground mb-6">
              Think you know Bob's tank better than anyone? Prove it in the ultimate tank knowledge quiz!
            </p>
            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-500">
              <Link href="/book/trivia">🏆 Take Quiz</Link>
            </Button>
          </div>

          {/* Adventure Atlas - FEATURED */}
          <div className="underwater-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-400 dark:border-blue-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-6xl opacity-10">🗺️</div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3 relative z-10">
              <MapPin className="h-8 w-8" />
              <h3 className="font-bold text-2xl">Adventure Atlas</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 relative z-10">143 Pixel Art Maps!</h4>
            <p className="text-muted-foreground mb-6 relative z-10">
              Explore EVERY location from the 69-chapter journey! Complete world map with journey paths, individual maps for all 143 places!
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 relative z-10">
              <Link href="/book/maps">🗺️ Explore Complete Atlas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bob Carousel Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-turtle-green-600 to-ocean-blue-600">
            Meet Bob the Turtle
          </h2>
          <p className="text-xl text-muted-foreground">
            The real star of the adventure!
          </p>
        </div>
        <BobCarousel />
      </section>

      {/* About Bob Section with Parallax */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Bob with Parallax */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/bob-gallery/BOB (1).png')] bg-cover bg-center bg-fixed" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-turtle-green-600 via-ocean-blue-600 to-purple-600">
            About Bob & Uncle Matt
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 mb-10 leading-relaxed">
            Bob the Magical Talking Turtle and her companion Uncle Matt traverse the Adventure Realm - 
            a vast universe spanning fantasy forests, futuristic cities, cosmic voids, and digital dimensions. 
            With <span className="font-bold text-turtle-green-600">69 epic chapters</span>, hundreds of characters, and countless magical artifacts, 
            their journey is one of friendship, discovery, and wonder.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/about">
              <Zap className="mr-2 h-5 w-5" />
              Learn More About Bob's Tank
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
