import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, ShoppingCart, Gift } from "lucide-react";

export const metadata = {
  title: "Buy the Book",
  description: "Purchase Bob the Turtle's complete 69-chapter adventure - Available now!",
};

export default function BuyBookPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Book className="h-12 w-12 text-turtle-green-600" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold">Buy the Complete Book</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience all 69 chapters of Bob the Magical Talking Turtle's epic adventure!
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Bob's Adventure Realm - Complete Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">What You Get:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ All 69 epic chapters</li>
                  <li>✓ Complete character guide</li>
                  <li>✓ Magical artifacts catalog</li>
                  <li>✓ Locations map & lore</li>
                  <li>✓ Behind-the-scenes content</li>
                  <li>✓ Exclusive author notes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">The Journey:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>⭐ From Cedar Hollow to the cosmic void</li>
                  <li>⭐ 100+ unique locations</li>
                  <li>⭐ 50+ magical artifacts</li>
                  <li>⭐ Epic battles & cosmic adventures</li>
                  <li>⭐ Friendship, discovery & wonder</li>
                  <li>⭐ Multiple thrilling endings</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Available Formats:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button asChild size="lg" className="h-auto py-6 flex flex-col gap-2">
                  <a href="#" className="text-center">
                    <ShoppingCart className="h-6 w-6 mx-auto" />
                    <span className="text-lg font-semibold">Digital Edition</span>
                    <span className="text-sm opacity-90">PDF + EPUB</span>
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
                  <a href="#" className="text-center">
                    <Book className="h-6 w-6 mx-auto" />
                    <span className="text-lg font-semibold">Paperback</span>
                    <span className="text-sm opacity-90">Print Edition</span>
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
                  <a href="#" className="text-center">
                    <Gift className="h-6 w-6 mx-auto" />
                    <span className="text-lg font-semibold">Gift Edition</span>
                    <span className="text-sm opacity-90">Special Package</span>
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <p className="text-center text-sm text-muted-foreground">
                <strong>Coming Soon!</strong> Pre-order information will be available here. 
                Sign up for our newsletter to be notified when the book launches!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            While you wait, explore the free content:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline">
              <a href="/book/characters">Character Encyclopedia</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/book/trivia">Play Trivia</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/games">Play Games</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
