import { Turtle, Book, Gamepad2, Users, Camera, Sparkles, MapPin, Mic2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BobGallery } from "@/components/gallery/BobGallery";

export const metadata = {
  title: "About Bob's Tank - The Adventure Realm",
  description: "Learn about Bob the Magical Talking Turtle, Uncle Matt, and the epic 69-chapter Adventure Realm journey.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 text-sm text-emerald-600 dark:text-emerald-300 font-medium tracking-wide">
          🐢 WELCOME TO THE TANK 🫧
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title mb-4">
          About Bob's Turtle Tank
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The home of Bob the Magical Talking Turtle and Uncle Matt's epic 69-chapter adventure across the Adventure Realm
        </p>
      </div>

      {/* The Story */}
      <section className="mb-16">
        <div className="underwater-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <Book className="h-8 w-8 text-blue-600" />
            <h2 className="font-serif text-3xl font-bold">The Epic Story</h2>
          </div>
          
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              <strong className="text-emerald-600">Bob the Magical Talking Turtle's</strong> adventure begins in the quiet village of <strong>Cedar Hollow</strong>, 
              where a young bard named <strong>Uncle Matt</strong> discovers a shimmering emerald turtle with extraordinary abilities. 
              Together, they embark on an epic journey across the <strong>Adventure Realm</strong> - a vast universe spanning 
              fantasy forests, futuristic cities, cosmic voids, and digital dimensions.
            </p>
            <p>
              Over the course of <strong className="text-blue-600">69 epic chapters</strong>, Bob and Matt face ancient evils, forge unlikely alliances, 
              discover powerful artifacts, and explore countless worlds. From battling the sorcerer <em>Zarak</em> to 
              befriending cosmic beings, their journey is one of friendship, discovery, wonder, and transformation.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">143</div>
                <div className="text-sm text-muted-foreground">Unique Locations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">100+</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">50+</div>
                <div className="text-sm text-muted-foreground">Magical Artifacts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Heroes */}
      <section className="mb-16">
        <h2 className="font-serif text-3xl font-bold text-center mb-8 tank-title">Meet the Heroes</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bob */}
          <div className="underwater-card p-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl">🐢</div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-emerald-600">Bob</h3>
                <p className="text-sm text-muted-foreground">The Magical Talking Turtle</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              A wise and magical turtle with a shimmering emerald shell and mysterious powers. 
              Bob serves as both companion and guide to Uncle Matt, offering wisdom, magic, and 
              unwavering friendship throughout their journey.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span><strong>Powers:</strong> Magic, wisdom, transformation</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span><strong>Personality:</strong> Wise, loyal, occasionally sarcastic</span>
              </div>
              <div className="flex items-center gap-2">
                <Mic2 className="h-4 w-4 text-blue-600" />
                <span><strong>Voice:</strong> Taylor Swift (audiobook)</span>
              </div>
            </div>
          </div>

          {/* Uncle Matt */}
          <div className="underwater-card p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl">🎵</div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-blue-600">Uncle Matt</h3>
                <p className="text-sm text-muted-foreground">The Brave Bard</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              A kind-hearted bard from Cedar Hollow who plays his father's silver lute. 
              Optimistic and musical, Matt's courage and compassion drive him to help those in need, 
              no matter how dangerous the quest.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span><strong>Skills:</strong> Music, diplomacy, swordplay</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span><strong>Personality:</strong> Kind, brave, musically gifted</span>
              </div>
              <div className="flex items-center gap-2">
                <Mic2 className="h-4 w-4 text-blue-600" />
                <span><strong>Voice:</strong> Morgan Freeman (narrator)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's in the Tank */}
      <section className="mb-16">
        <h2 className="font-serif text-3xl font-bold text-center mb-8 tank-title">Explore the Tank</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* The Book */}
          <div className="underwater-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 text-amber-600 mb-3">
              <Book className="h-6 w-6" />
              <h3 className="font-bold text-xl">The Story</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Read all 69 chapters of Matt & Bob's epic adventure. From Cedar Hollow to the Cosmic Void!
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book">📖 Read Story</Link>
            </Button>
          </div>

          {/* Maps */}
          <div className="underwater-card p-6 hover:scale-105 transition-transform bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <MapPin className="h-6 w-6" />
              <h3 className="font-bold text-xl">Adventure Atlas</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Explore 143 pixel art maps! Complete world map with journey paths and individual location maps.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/book/maps">🗺️ Explore Maps</Link>
            </Button>
          </div>

          {/* Characters */}
          <div className="underwater-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 text-purple-600 mb-3">
              <Users className="h-6 w-6" />
              <h3 className="font-bold text-xl">Tank Residents</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Meet 100+ characters! Each with celebrity AI voices for the audiobook.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/characters">👥 Meet Everyone</Link>
            </Button>
          </div>

          {/* Games */}
          <div className="underwater-arcade p-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <Gamepad2 className="h-6 w-6" />
              <h3 className="font-bold text-xl text-white drop-shadow">Arcade Games</h3>
            </div>
            <p className="text-sm text-white/90 mb-4">
              Play browser games set in Bob's universe! Waterproof arcade machines at the tank bottom!
            </p>
            <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-500">
              <Link href="/games">🎮 Play Games</Link>
            </Button>
          </div>

          {/* Audiobook */}
          <div className="underwater-card p-6 hover:scale-105 transition-transform bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <div className="flex items-center gap-2 text-purple-600 mb-3">
              <Mic2 className="h-6 w-6" />
              <h3 className="font-bold text-xl">Voice Cast</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              100+ celebrity AI voices! Morgan Freeman narrates, Taylor Swift is Bob!
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/audiobook">🎤 Voice Cast</Link>
            </Button>
          </div>

          {/* Bob Gallery */}
          <div className="underwater-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 text-green-600 mb-3">
              <Camera className="h-6 w-6" />
              <h3 className="font-bold text-xl">Bob Photos</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Real photos of Bob the turtle! See the star of the adventure in his actual tank.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="#gallery">📸 View Photos</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Bob's Gallery */}
      <section id="gallery" className="mb-16">
        <h2 className="font-serif text-3xl font-bold text-center mb-8 tank-title">
          Bob's Photo Gallery
        </h2>
        <BobGallery />
      </section>

      {/* Bob's Message */}
      <section className="text-center">
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 max-w-2xl">
          <div className="text-4xl mb-4">🐢</div>
          <div className="font-bold mb-2">Bob Says:</div>
          <p className="text-muted-foreground">
            "Uncle Matt and I had the most incredible adventure across 143 different places! 
            We battled evil sorcerers, made amazing friends, found magical artifacts, and even 
            traveled through space! Now you can explore our whole journey right here in my tank. 
            Pretty awesome for a turtle, right?"
          </p>
        </div>
      </section>
    </div>
  );
}
