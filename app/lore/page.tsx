import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Users, Network, Sparkles, Map, Clock, Shield } from "lucide-react";

export const metadata = {
  title: "Lore & World Building",
  description: "Explore the deep lore, guardian network, magic systems, and world-building of Bob's Adventure Realm",
};

export default function LorePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          The Adventure Realm Lore
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Dive deep into the intricate world-building, guardian networks, artifact systems, 
          and cosmic connections that make Bob's Adventure Realm an epic journey
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Guardian Network */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-turtle-green-600">
              <Shield className="h-6 w-6" />
              <CardTitle>Guardian Network</CardTitle>
            </div>
            <CardDescription>Protectors across realms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Discover Everwood, Rahil, and the mysterious guardian system that watches over travelers
            </p>
            <Button asChild className="w-full">
              <Link href="/lore/guardians">Explore Guardians</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Magic Systems */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="h-6 w-6" />
              <CardTitle>Magic & Artifacts</CardTitle>
            </div>
            <CardDescription>Artifact synergy system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Learn how the Star-Song Scepter, Dimension Blade, and other artifacts work together
            </p>
            <Button asChild className="w-full">
              <Link href="/lore/magic">Discover Magic</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-ocean-blue-600">
              <Clock className="h-6 w-6" />
              <CardTitle>Timeline & Events</CardTitle>
            </div>
            <CardDescription>Journey progression</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track the chronological progression of Matt and Bob's epic journey
            </p>
            <Button asChild className="w-full">
              <Link href="/lore/timeline">View Timeline</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-pink-600">
              <Network className="h-6 w-6" />
              <CardTitle>Connections</CardTitle>
            </div>
            <CardDescription>Character relationships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Explore the web of relationships and connections throughout the Adventure Realm
            </p>
            <Button asChild className="w-full">
              <Link href="/lore/connections">See Connections</Link>
            </Button>
          </CardContent>
        </Card>

        {/* World Building */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600">
              <Map className="h-6 w-6" />
              <CardTitle>Realms & Worlds</CardTitle>
            </div>
            <CardDescription>Explore dimensions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              From fantasy forests to cosmic voids - discover all the realms of the Adventure
            </p>
            <Button asChild className="w-full">
              <Link href="/lore/realms">Visit Realms</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Story Bible */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <Book className="h-6 w-6" />
              <CardTitle>Story Bible</CardTitle>
            </div>
            <CardDescription>Core lore database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The comprehensive lore database with all story elements, patterns, and mysteries
            </p>
            <Button asChild className="w-full">
              <Link href="/lore/bible">Read Story Bible</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Lore Section */}
      <Card className="bg-gradient-to-br from-turtle-green-50 to-ocean-blue-50 dark:from-turtle-green-950 dark:to-ocean-blue-950">
        <CardHeader>
          <CardTitle className="text-2xl">Featured Lore: The Guardian Network</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Everwood - The Ancient Guardian
              </h3>
              <p className="text-muted-foreground mb-4">
                "Countless years I have been tasked with watching over these ancient mountains, 
                seeking to guide and assist those who journey here with courage and noble purpose."
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Serves voluntarily as protector</li>
                <li>• Knows travelers' names before meeting them</li>
                <li>• Appears when need is greatest</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rahil - The Desert Guardian
              </h3>
              <p className="text-muted-foreground mb-4">
                "I guide all souls who lose their way. It is my sworn duty to shelter all 
                souls who wander these sands."
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Serves as "recompense" for unknown reason</li>
                <li>• Part of larger guardian network</li>
                <li>• Knows of Everwood and other guardians</li>
              </ul>
            </div>
          </div>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/lore/guardians">
              Explore the Full Guardian Network →
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

