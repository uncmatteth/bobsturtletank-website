import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Heart, Users } from "lucide-react";

export const metadata = {
  title: "Character Connections & Relationships",
  description: "The web of relationships throughout Bob's Adventure Realm",
};

export default function ConnectionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Network className="h-16 w-16 mx-auto mb-4 text-pink-600" />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          Character Connections
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore the intricate web of relationships across the Adventure Realm
        </p>
      </div>

      {/* Core Duo */}
      <Card className="mb-8 bg-gradient-to-br from-turtle-green-50 to-ocean-blue-50 dark:from-turtle-green-950 dark:to-ocean-blue-950">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Heart className="h-8 w-8 text-pink-600" />
            The Core Duo: Matt & Bob
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Uncle Matt</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Bard/musician from Cedar Hollow</li>
                <li>• Carries father's silver lute</li>
                <li>• Grey eyes, bushy beard</li>
                <li>• Wields Dimension Blade</li>
                <li>• Optimistic and musical</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Bob the Magical Talking Turtle</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Red-Eared Slider Clan</li>
                <li>• Emerald shell with red ear markings</li>
                <li>• Emerald eyes</li>
                <li>• Wields Star-Song Scepter</li>
                <li>• Magical voice powers</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-muted-foreground">
              <strong>Relationship:</strong> Companions and best friends who complement each other perfectly. 
              Matt provides musical creativity and dimensional magic, while Bob brings ancient clan wisdom 
              and sonic/celestial powers. Their artifacts work in synergy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Network */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Users className="h-7 w-7 text-turtle-green-600" />
            Guardian Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Everwood ↔ Matt & Bob</h3>
              <Badge className="mb-2">Mentor Relationship</Badge>
              <p className="text-sm text-muted-foreground">
                Ancient guardian who watches over travelers. Knew their names before meeting them. 
                Provides guidance when need is greatest. Warns of Zarak's threat.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Rahil ↔ Matt & Bob</h3>
              <Badge className="mb-2">Guide Relationship</Badge>
              <p className="text-sm text-muted-foreground">
                Desert guardian who shelters lost souls. Mentions connection to Everwood. 
                Provides Universe Scope artifact to help locate Celestia.
              </p>
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Network Connection:</strong> Everwood and Rahil are part of organized guardian system. 
              They know of each other and can sense when Matt & Bob need aid.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Allies & Companions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Allies & Redeemed Characters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Shi'an (Exiled Fairy Queen)
                  <Badge variant="secondary">Redeemed</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Initially antagonist. Redeemed through Matt's music. Former enemy becomes ally. 
                  Helped restore the Enchanted Wood.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Oracle (Sentient AI)
                  <Badge variant="secondary">Created Ally</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Difference Engine given sentience. Bob teaches it morality. Rebels against 
                  creators to prevent planetary harm. Becomes moral compass.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Naiads
                  <Badge variant="secondary">Water Spirits</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recognize Bob's Red-Eared Slider clan heritage. Request clan song. 
                  Become allies in Enchanted Wood.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Mother Griffin
                  <Badge variant="secondary">Benefactor</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Grateful for rescue of baby griffin. Gives Crystal Amulet (first major artifact). 
                  Sets adventure in motion with magical gift.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Junia (Turtle Elder)
                  <Badge variant="secondary">Clan Connection</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Village storyteller turtle. May share clan heritage with Bob. 
                  Represents turtle wisdom tradition.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Underwater Turtle Sages
                  <Badge variant="secondary">Artifact Givers</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Provided Primary Artifact Trinity: Star-Song Scepter, Dimension Blade, Melody Box. 
                  Understand cosmic destiny.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Antagonists */}
      <Card className="mb-8 border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Antagonistic Forces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Zarak (Evil Sorcerer)
              <Badge variant="destructive">Main Antagonist</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Mentioned in Chapter 2 by Everwood. Doesn't appear directly until Chapter 21 
              (19-chapter buildup). Controls dark forces and minions. Corrupts forests and realms.
            </p>
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Foreshadowing Pattern:</strong> Early casual mention becomes major plot driver. 
                Long buildup creates anticipation for confrontation.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Jhilsara (Witch)</h3>
              <p className="text-sm text-muted-foreground">
                Cursed Willowdale village. Defeated in Chapter 3. Hints at connection to larger evil.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Architects Guild</h3>
              <p className="text-sm text-muted-foreground">
                Technological cult creating Oracle for planetary manipulation. Thwarted by Oracle's moral awakening.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mysterious Figures */}
      <Card className="bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-950 dark:to-amber-950">
        <CardHeader>
          <CardTitle className="text-2xl">Mysterious Figures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              The Beggar Woman
              <Badge variant="outline">Unknown Identity</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Appeared in crossroads town (Chapter 10). "Eyes strangely youthful, twinkling with 
              cycles of wisdom gathered over untold generations." Vanished mysteriously leaving only copper penny.
            </p>
            <blockquote className="border-l-4 border-purple-600 pl-4 italic text-sm">
              "I have an inkling your path ahead may hold a choice or two where light feet and 
              open minds will serve you well."
            </blockquote>
            <div className="mt-3 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Mystery:</strong> Is she connected to Guardian network? A disguised deity? 
                Her prophecy suggests knowledge of future events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

