import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Globe, Mountain, Trees } from "lucide-react";

export const metadata = {
  title: "Realms & Dimensions",
  description: "Explore the diverse realms, dimensions, and locations of the Adventure Realm",
};

export default function RealmsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Globe className="h-16 w-16 mx-auto mb-4 text-green-600" />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          Realms & Dimensions
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          From fantasy forests to cosmic voids - discover all the dimensions of the Adventure
        </p>
      </div>

      {/* Fantasy Realms */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Trees className="h-8 w-8 text-green-600" />
            Fantasy Realms
          </CardTitle>
          <p className="text-muted-foreground">The magical lands of the primary world</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Cedar Hollow</h3>
                <Badge className="mb-2">Starting Location</Badge>
                <p className="text-sm text-muted-foreground">
                  Matt's home village. Peaceful farming community. Where the adventure begins. 
                  Visible from Iron Mountains.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Dragon Wood</h3>
                <Badge className="mb-2" variant="destructive">Cursed Forest</Badge>
                <p className="text-sm text-muted-foreground">
                  Ancient cursed forest with living trees. Contains dark forces and evil. 
                  Dangerous passage for travelers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Enchanted Wood</h3>
                <Badge className="mb-2" variant="secondary">Magical Sanctuary</Badge>
                <p className="text-sm text-muted-foreground">
                  Home to naiads in crystal pools. Moon lily paths for navigation. 
                  Shi'an's former domain at Woodsgate fortress.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Tranquil Grove</h3>
                <Badge className="mb-2" variant="secondary">Sacred Garden</Badge>
                <p className="text-sm text-muted-foreground">
                  Magical garden tended by sprites. Glowing orbs and sprite queen's statue. 
                  Bob receives sprite-chime blessing for showing joy.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Cinder Woods</h3>
                <Badge className="mb-2" variant="destructive">Witch Territory</Badge>
                <p className="text-sm text-muted-foreground">
                  Domain of witch Jhilsara. Site of Bob's death and resurrection at healing pool. 
                  Dangerous magical forest.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Willowdale</h3>
                <Badge className="mb-2">Village</Badge>
                <p className="text-sm text-muted-foreground">
                  Village cursed by Jhilsara. Saved by Matt and Bob in Chapter 3. 
                  Community that needed protection.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Goodhollow</h3>
                <Badge className="mb-2">Festival Town</Badge>
                <p className="text-sm text-muted-foreground">
                  Harvest festival location. Secret Architects Guild creating Oracle. 
                  Site of technological-magical conflict.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Camarinda</h3>
                <Badge className="mb-2">Cultural Hub</Badge>
                <p className="text-sm text-muted-foreground">
                  Festival de la Danza location. Flamenco dancing, music collaboration. 
                  Celebrates cultural exchange through rhythm.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mountains & Deserts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Mountain className="h-8 w-8 text-orange-600" />
            Mountains & Deserts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Misty Mountains</h3>
                <Badge className="mb-2" variant="destructive">Dangerous</Badge>
                <p className="text-sm text-muted-foreground">
                  Mountain range with caves and giants. Harsh terrain with multiple threats. 
                  Giant attacks occur here.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Giant's Teeth</h3>
                <Badge className="mb-2" variant="destructive">Treacherous</Badge>
                <p className="text-sm text-muted-foreground">
                  Jagged peaks with treacherous climbing paths. Named for appearance. 
                  Dangerous giant encounters.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Desert of Shifting Sands</h3>
                <Badge className="mb-2">Rahil's Domain</Badge>
                <p className="text-sm text-muted-foreground">
                  Vast desert where travelers lose their way. Rahil the Guardian shelters lost souls. 
                  Desert lurkers attack at night. Universe Scope reveals Celestia location.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Celestia (Lost City)</h3>
                <Badge className="mb-2" variant="secondary">Ancient Mystery</Badge>
                <p className="text-sm text-muted-foreground">
                  Tower of the Moon, buried beneath desert sands. Located using Universe Scope. 
                  Quest destination in Chapter 15.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensional Realms */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Globe className="h-8 w-8 text-purple-600" />
            Dimensional Realms
          </CardTitle>
          <p className="text-muted-foreground">Beyond the primary world</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-xl mb-3">Celestial Realm (Chapter 8)</h3>
              <Badge className="mb-3" variant="secondary">Cosmic Dimension</Badge>
              <p className="text-muted-foreground mb-3">
                Accessed via portal using Star-Song Scepter + Dimension Blade + Universe Scope. 
                Contains Tree of Celestial Knowledge and cosmic observatory.
              </p>
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Significance:</strong> Where Matt & Bob learn their role as guardians of cosmic harmony. 
                  Reveals larger cosmic purpose of their journey.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-3">Future Timeline (Chapter 4)</h3>
              <Badge className="mb-3" variant="destructive">Corrupted Future</Badge>
              <p className="text-muted-foreground mb-3">
                Accessed through Passage of Ages portal runes. Futuristic city with advanced civilization 
                but hostile robots suggest corruption.
              </p>
              <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Warning:</strong> Future timeline shows potential dark outcome. 
                  Suggests current actions have long-term cosmic consequences.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-3">The Whispering Woods Portal</h3>
              <Badge className="mb-3" variant="secondary">Gateway Location</Badge>
              <p className="text-muted-foreground">
                Location where portal was discovered and activated. Gateway to celestial realm. 
                Requires specific artifact combination to access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cosmic Locations */}
      <Card className="border-amber-200 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Globe className="h-8 w-8 text-amber-600" />
            Cosmic & Space Locations
          </CardTitle>
          <p className="text-muted-foreground">Chapters 50+ Space Opera Arc</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-xl mb-3">Cosmos Cruiser Interior</h3>
              <Badge className="mb-3" variant="secondary">Starship</Badge>
              <p className="text-muted-foreground mb-3">
                Fabled alien starship with orichalcum walls, crystalline viewports, 
                and luminescent crystal chandeliers. Contains artifacts from thousand worlds.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Features:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Mithril helm console</li>
                    <li>• Alien sigil engravings</li>
                    <li>• Luminescent frescoes</li>
                    <li>• Stellar cartography display</li>
                  </ul>
                </div>
                <div>
                  <strong>Systems:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Zeta Reticuli air plants</li>
                    <li>• Betelgeuse food assemblers</li>
                    <li>• Alpha Centauri incense</li>
                    <li>• Auto-servant systems</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-3">The Cosmic Void</h3>
              <Badge className="mb-3" variant="destructive">Unknown Territory</Badge>
              <p className="text-muted-foreground">
                Journey destination in later chapters. Represents ultimate frontier. 
                Final chapters explore void beyond known space.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Magical Places */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Special Magical Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Healing Pool</h3>
              <p className="text-sm text-muted-foreground">
                In Cinder Woods. Magical pool where Everwood revived Bob. 
                Powerful restorative magic.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Passage of Ages</h3>
              <p className="text-sm text-muted-foreground">
                Portal runes for time travel. Crystal activates sending to future timeline. 
                Genre-shifting gateway.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Orchard of Evermore</h3>
              <p className="text-sm text-muted-foreground">
                Magical wild orchard in forest clearing. Perfect fruits, timeless refuge. 
                Spiritual renewal through nature.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

