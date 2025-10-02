import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Book, ShoppingCart, Gift, Star, Heart, Sparkles, Map, Headphones } from "lucide-react";

export const metadata = {
  title: "Buy Bob's Complete Adventure - Support the Tank!",
  description: "Get all 69 chapters of Bob the Magical Talking Turtle's epic adventure! Available in digital, paperback, and special editions.",
};

export default function BuyBookPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 text-sm text-amber-600 dark:text-amber-300 font-medium tracking-wide">
          📚 SUPPORT BOB'S TANK 🐢
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tank-title mb-4 flex items-center justify-center gap-4 flex-wrap">
          <span className="text-5xl">📖</span>
          Buy the Complete Book
          <span className="text-5xl">✨</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
          Experience <strong className="text-blue-600">all 69 chapters</strong> of Bob the Magical Talking Turtle's epic adventure!
          From Cedar Hollow to the Cosmic Void and beyond!
        </p>
        <div className="inline-block px-6 py-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
          <div className="text-sm">
            <span className="text-emerald-600 font-bold">🐢 Support Bob!</span> Every purchase helps keep Bob's tank clean and his snacks plentiful!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="treasure-chest p-8 mb-8">
          <h2 className="font-serif text-3xl font-bold text-white drop-shadow-lg mb-6 text-center">
            The Complete Adventure Awaits!
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* What You Get */}
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-4 text-yellow-300 flex items-center gap-2">
                <Star className="h-5 w-5" />
                What's Inside:
              </h3>
              <ul className="space-y-3 text-white/95">
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span>All <strong>69 epic chapters</strong> - The complete saga</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span><strong>143 unique locations</strong> across multiple realms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span><strong>100+ memorable characters</strong> with unique voices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span><strong>50+ magical artifacts</strong> and legendary items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span>Complete <strong>character guide</strong> and backstories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span><strong>Behind-the-scenes</strong> author notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span><strong>Exclusive bonus content</strong> not on the website</span>
                </li>
              </ul>
            </div>

            {/* The Journey */}
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-4 text-purple-300 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                The Epic Journey:
              </h3>
              <ul className="space-y-3 text-white/95">
                <li className="flex items-start gap-2">
                  <span className="text-blue-300">⭐</span>
                  <span>From <strong>Cedar Hollow</strong> to the <strong>Cosmic Void</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300">⭐</span>
                  <span>Fantasy forests, futuristic cities, digital realms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300">⭐</span>
                  <span>Epic battles against ancient evils</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300">⭐</span>
                  <span>Cosmic adventures with interdimensional beings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300">⭐</span>
                  <span>Themes of <strong>friendship, discovery & wonder</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300">⭐</span>
                  <span>Multiple thrilling climaxes and resolutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300">⭐</span>
                  <span>Perfect for readers of all ages!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Format Options */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-8 tank-title">
            Choose Your Format
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Digital Edition */}
            <div className="underwater-card p-6 text-center hover:scale-105 transition-transform">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-2xl mb-2">Digital Edition</h3>
              <p className="text-sm text-muted-foreground mb-4">PDF + EPUB formats</p>
              <div className="text-3xl font-bold text-blue-600 mb-4">$9.99</div>
              <ul className="text-sm text-muted-foreground space-y-1 mb-6 text-left">
                <li>✓ Instant download</li>
                <li>✓ Read on any device</li>
                <li>✓ Searchable text</li>
                <li>✓ Lifetime access</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                Coming Soon!
              </Button>
            </div>

            {/* Paperback */}
            <div className="underwater-card p-6 text-center hover:scale-105 transition-transform border-2 border-amber-400 dark:border-amber-600">
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                POPULAR
              </div>
              <Book className="h-12 w-12 mx-auto mb-4 text-amber-600" />
              <h3 className="font-bold text-2xl mb-2">Paperback</h3>
              <p className="text-sm text-muted-foreground mb-4">Premium print edition</p>
              <div className="text-3xl font-bold text-amber-600 mb-4">$24.99</div>
              <ul className="text-sm text-muted-foreground space-y-1 mb-6 text-left">
                <li>✓ Physical book to collect</li>
                <li>✓ High-quality printing</li>
                <li>✓ Beautiful cover art</li>
                <li>✓ Perfect gift option</li>
              </ul>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled>
                Coming Soon!
              </Button>
            </div>

            {/* Special Edition */}
            <div className="treasure-chest p-6 text-center hover:scale-105 transition-transform">
              <Gift className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="font-bold text-2xl mb-2 text-white drop-shadow-lg">Special Edition</h3>
              <p className="text-sm text-white/80 mb-4">Collector's package</p>
              <div className="text-3xl font-bold text-yellow-300 mb-4">$49.99</div>
              <ul className="text-sm text-white/90 space-y-1 mb-6 text-left">
                <li>✓ Hardcover with dust jacket</li>
                <li>✓ Signed bookplate</li>
                <li>✓ Character art prints</li>
                <li>✓ Exclusive bookmark</li>
                <li>✓ Digital edition included</li>
              </ul>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-500" disabled>
                Coming Soon!
              </Button>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="underwater-card p-8 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-400 dark:border-blue-600 mb-8">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h3 className="font-bold text-2xl mb-3">Pre-Order Information Coming Soon!</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            The book is currently being finalized for publication. Sign up for our newsletter to be the first 
            to know when pre-orders go live! You'll also get exclusive behind-the-scenes content and early 
            access to bonus chapters.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" disabled>
            📧 Join the Waitlist (Coming Soon)
          </Button>
        </div>

        {/* While You Wait */}
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl font-bold mb-6 tank-title">
            While You Wait, Explore Free Content!
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" size="lg" className="h-auto py-4 flex flex-col gap-2">
              <Link href="/book/maps">
                <Map className="h-6 w-6" />
                <span>143 Pixel Art Maps</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto py-4 flex flex-col gap-2">
              <Link href="/book/characters">
                <Star className="h-6 w-6" />
                <span>Character Encyclopedia</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto py-4 flex flex-col gap-2">
              <Link href="/book/audiobook">
                <Headphones className="h-6 w-6" />
                <span>Voice Cast Info</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto py-4 flex flex-col gap-2">
              <Link href="/book/trivia">
                <Sparkles className="h-6 w-6" />
                <span>Play Trivia Quiz</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bob's Thank You */}
      <div className="text-center">
        <div className="inline-block px-8 py-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 max-w-2xl">
          <div className="text-5xl mb-4">🐢💚</div>
          <div className="font-bold mb-2 text-emerald-600">Bob Says Thank You!</div>
          <p className="text-muted-foreground">
            "Every book purchase helps support my tank! Uncle Matt and I worked really hard on this adventure, 
            and we're so excited to share it with everyone. Whether you buy the book or just explore the free 
            content, thanks for being part of our journey! You're all amazing! 🙏✨"
          </p>
        </div>
      </div>
    </div>
  );
}
