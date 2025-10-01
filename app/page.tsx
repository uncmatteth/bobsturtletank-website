import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Book, Trophy, Sparkles, Zap } from "lucide-react";
import { SpectacularHero } from "@/components/hero/SpectacularHero";
import { BobCarousel } from "@/components/sections/BobCarousel";
import { GlassmorphicCard } from "@/components/cards/GlassmorphicCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Spectacular Hero */}
      <SpectacularHero />

      {/* Featured Content with Glassmorphism */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-turtle-green-600 to-ocean-blue-600">
            Explore Bob's Universe
          </h2>
          <p className="text-xl text-muted-foreground">
            Games, stories, and adventures await!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Featured Game */}
          <GlassmorphicCard bobImage={15} className="p-6">
            <div className="flex items-center gap-2 text-turtle-green-400 mb-3">
              <Gamepad2 className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white">Featured Game</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white">Turtle Bouncy Bounce</h4>
            <p className="text-white/80 mb-6">
              Help Bob bounce higher and higher! Dodge platforms, collect coins, and see how high you can go.
            </p>
            <Button asChild className="w-full bg-turtle-green-600 hover:bg-turtle-green-500">
              <Link href="/games/bounce">Play Now</Link>
            </Button>
          </GlassmorphicCard>

          {/* Buy the Book */}
          <GlassmorphicCard bobImage={28} className="p-6">
            <div className="flex items-center gap-2 text-ocean-blue-400 mb-3">
              <Book className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white">The Book</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white">69 Epic Chapters</h4>
            <p className="text-white/80 mb-6">
              From Cedar Hollow to the cosmic void - experience the complete adventure!
            </p>
            <Button asChild className="w-full bg-ocean-blue-600 hover:bg-ocean-blue-500">
              <Link href="/book/buy">Buy Now</Link>
            </Button>
          </GlassmorphicCard>

          {/* Character Encyclopedia */}
          <GlassmorphicCard bobImage={42} className="p-6">
            <div className="flex items-center gap-2 text-purple-400 mb-3">
              <Sparkles className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white">Characters</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white">Meet the Cast</h4>
            <p className="text-white/80 mb-6">
              Explore the rich cast of characters from Uncle Matt and Bob to cosmic entities!
            </p>
            <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
              <Link href="/book/characters">Browse All</Link>
            </Button>
          </GlassmorphicCard>

          {/* Trivia Game */}
          <GlassmorphicCard bobImage={55} className="p-6">
            <div className="flex items-center gap-2 text-yellow-400 mb-3">
              <Trophy className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white">Trivia Challenge</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white">Test Your Knowledge</h4>
            <p className="text-white/80 mb-6">
              How well do you know Bob's Adventure Realm? Take the ultimate trivia challenge!
            </p>
            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-500">
              <Link href="/book/trivia">Play Trivia</Link>
            </Button>
          </GlassmorphicCard>

          {/* Artifacts */}
          <GlassmorphicCard bobImage={67} className="p-6">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Sparkles className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white">Artifacts</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white">Magical Items</h4>
            <p className="text-white/80 mb-6">
              Discover enchanted crystals, cosmic weapons, and legendary treasures!
            </p>
            <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
              <Link href="/book/artifacts">Explore Artifacts</Link>
            </Button>
          </GlassmorphicCard>

          {/* Locations */}
          <GlassmorphicCard bobImage={79} className="p-6">
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <Zap className="h-8 w-8" />
              <h3 className="font-bold text-2xl text-white">Locations</h3>
            </div>
            <h4 className="font-semibold text-xl mb-3 text-white">Realms & Worlds</h4>
            <p className="text-white/80 mb-6">
              Journey through forests, mountains, cosmic voids, and digital dimensions!
            </p>
            <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
              <Link href="/book/locations">Visit Locations</Link>
            </Button>
          </GlassmorphicCard>
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
