import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Timeline & Major Events",
  description: "The chronological progression of Matt and Bob's epic journey",
};

export default function TimelinePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Clock className="h-16 w-16 mx-auto mb-4 text-ocean-blue-600" />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          Journey Timeline
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Track Matt and Bob's epic progression from Cedar Hollow to the cosmic void
        </p>
      </div>

      {/* Story Progression */}
      <div className="space-y-8">
        {/* Chapters 1-5: Foundation */}
        <Card className="border-l-4 border-turtle-green-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Chapters 1-5: The Foundation</CardTitle>
              <Badge variant="outline">Local Adventure → Cosmic Stakes</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="font-semibold text-turtle-green-600 min-w-[80px]">Ch 1</div>
                <div>
                  <strong>Go Explore!</strong> - Matt leaves Cedar Hollow, reunites with Bob, 
                  receives Crystal Amulet from griffin mother
                  <Badge className="ml-2" variant="secondary">Crystal Amulet Acquired</Badge>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="font-semibold text-turtle-green-600 min-w-[80px]">Ch 2</div>
                <div>
                  <strong>The Goblin Ambush</strong> - First major battle, meet Everwood, 
                  Zarak mentioned as main antagonist
                  <Badge className="ml-2" variant="secondary">Everwood Introduction</Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-semibold text-turtle-green-600 min-w-[80px]">Ch 3</div>
                <div>
                  <strong>The Witch's Curse</strong> - Bob's temporary death & resurrection 
                  at magical healing pool, Jhilsara defeated
                  <Badge className="ml-2" variant="destructive">Bob Dies & Revives</Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-semibold text-turtle-green-600 min-w-[80px]">Ch 4</div>
                <div>
                  <strong>A Vision of the Future</strong> - Portal runes activated, time travel 
                  to futuristic city, genre shift to sci-fi
                  <Badge className="ml-2" variant="secondary">Time Travel Begins</Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-semibold text-turtle-green-600 min-w-[80px]">Ch 5</div>
                <div>
                  <strong>The Volcano's Breath</strong> - Dragon encounter, cosmic scope revealed, 
                  hints at larger cosmic forces
                  <Badge className="ml-2" variant="secondary">Cosmic Scale Revealed</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters 6-10: Alliance Building */}
        <Card className="border-l-4 border-ocean-blue-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Chapters 6-10: Building Alliances</CardTitle>
              <Badge variant="outline">Gathering Allies & Powers</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="font-semibold text-ocean-blue-600 min-w-[80px]">Ch 6</div>
                <div>
                  <strong>Forest's Hidden Harmony</strong> - Naiad alliance, Shi'an redemption
                  <Badge className="ml-2" variant="secondary">Fairy Queen Ally</Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-semibold text-ocean-blue-600 min-w-[80px]">Ch 8</div>
                <div>
                  <strong>Celestial Harmonies</strong> - Portal to celestial realm, 
                  learn role as cosmic harmony guardians
                  <Badge className="ml-2" variant="secondary">Destiny Revealed</Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-semibold text-ocean-blue-600 min-w-[80px]">Ch 9</div>
                <div>
                  <strong>Below the Harvest Moon</strong> - Oracle AI creation & moral awakening
                  <Badge className="ml-2" variant="secondary">Oracle Ally</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters 15+: Desert Quest */}
        <Card className="border-l-4 border-amber-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Chapter 15+: Desert Quest</CardTitle>
              <Badge variant="outline">Seeking Lost Celestia</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="font-semibold text-amber-600 min-w-[80px]">Ch 15</div>
                <div>
                  <strong>The Shifting Sands</strong> - Meet Guardian Rahil, cure lunar madness, 
                  use Universe Scope to locate buried city of Celestia
                  <Badge className="ml-2" variant="secondary">Rahil Introduction</Badge>
                  <Badge className="ml-2" variant="secondary">Universe Scope</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter 21: Zarak Confrontation */}
        <Card className="border-l-4 border-red-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Chapter 21: The Dark Confrontation</CardTitle>
              <Badge variant="destructive">Major Antagonist</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="font-semibold text-red-600 min-w-[80px]">Ch 21</div>
                <div>
                  <strong>Zarak Appears</strong> - 19 chapters after first mention, Zarak finally 
                  appears directly in Deepwood. Epic artifact synergy battle purges corruption
                  <Badge className="ml-2" variant="destructive">Zarak Battle</Badge>
                  <Badge className="ml-2" variant="secondary">4-Artifact Synergy</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters 50+: Spaceship Arc */}
        <Card className="border-l-4 border-purple-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Chapters 50+: The Cosmos Cruiser</CardTitle>
              <Badge variant="outline">Spaceship Construction</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                Matt and Bob discover the fabled Cosmos Cruiser starship and begin acquiring 
                the alien artifacts needed to power and operate it. This arc transforms their 
                journey from fantasy adventure to cosmic space opera.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="font-semibold text-purple-600 min-w-[80px]">Ch 50+</div>
                <div>
                  <strong>Key Components Acquired:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Repulsion Gloves - Debris field navigation</li>
                    <li>• Starlight Communicator Arrays - Alien communication</li>
                    <li>• Temporal Telescope - Time/space observation</li>
                    <li>• Gravitational Manipulation Systems - Mass control</li>
                    <li>• Primordial Particle Infusion - Exotic fuel</li>
                    <li>• Solarite Sword - Energy weapon</li>
                    <li>• Quantoharp - Harmonic weapon/tool for Matt</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Structure Analysis */}
        <Card className="bg-gradient-to-br from-turtle-green-50 to-ocean-blue-50 dark:from-turtle-green-950 dark:to-ocean-blue-950">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ArrowRight className="h-6 w-6" />
              Story Progression Pattern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Act 1: Local Adventure</h3>
                <p className="text-sm text-muted-foreground">
                  Chapters 1-5 establish characters, acquire first artifacts, 
                  introduce time travel elements
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Act 2: Cosmic Scope</h3>
                <p className="text-sm text-muted-foreground">
                  Chapters 6-49 expand to celestial realms, build alliances, 
                  confront Zarak, reveal cosmic destiny
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Act 3: Space Opera</h3>
                <p className="text-sm text-muted-foreground">
                  Chapters 50-69 transform into sci-fi with Cosmos Cruiser, 
                  intergalactic travel, cosmic void exploration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

