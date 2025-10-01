import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Star } from "lucide-react";

export const metadata = {
  title: "Magic Systems & Artifact Synergy",
  description: "The intricate magic systems and artifact combinations of the Adventure Realm",
};

export default function MagicPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-600" />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          Magic Systems & Artifact Synergy
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover how artifacts work together in cosmic harmony
        </p>
      </div>

      {/* Primary Artifact Trinity */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Star className="h-8 w-8 text-purple-600" />
            The Primary Artifact Trinity
          </CardTitle>
          <p className="text-muted-foreground">
            Given by underwater turtle sages in Chapter 4
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-turtle-green-600">Star-Song Scepter</h3>
              <Badge>Bob's Artifact</Badge>
              <p className="text-sm text-muted-foreground">
                "Channels arcane insights from realms beyond imagining"
              </p>
              <ul className="text-sm space-y-1">
                <li>• Sound/music-based magic</li>
                <li>• Cosmic channeling</li>
                <li>• Portal activation</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-ocean-blue-600">Dimension Blade</h3>
              <Badge>Matt's Artifact</Badge>
              <p className="text-sm text-muted-foreground">
                "Cleave seams between worlds, and glimpse fates unseen"
              </p>
              <ul className="text-sm space-y-1">
                <li>• Dimensional cutting</li>
                <li>• Portal opening</li>
                <li>• World-walking</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-amber-600">Melody Box</h3>
              <Badge>Shared Artifact</Badge>
              <p className="text-sm text-muted-foreground">
                "Channels the very rhythm underlying creation"
              </p>
              <ul className="text-sm space-y-1">
                <li>• Reality resonance</li>
                <li>• Cosmic rhythm</li>
                <li>• Creation channeling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portal Activation System */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Zap className="h-7 w-7 text-ocean-blue-600" />
            Portal Activation System (Chapter 8)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-lg mb-4">
              "The scepter, the Dimension Blade, and the Universe Scope – they must all play a part"
            </p>
            <p className="text-muted-foreground">
              Creates a "symphony of elements – earth, sky, and the intangible connection between them"
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Required Components:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-turtle-green-600" />
                <span><strong>Star-Song Scepter</strong> - Channels cosmic energy</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ocean-blue-600" />
                <span><strong>Dimension Blade</strong> - Cuts dimensional seams</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span><strong>Universe Scope</strong> - Reveals cosmic patterns</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Result:</h3>
            <p className="text-muted-foreground">
              Travel to celestial realm, encounter Tree of Celestial Knowledge, and learn their role as guardians of cosmic harmony
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Combat Synergy */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Zap className="h-7 w-7 text-amber-600" />
            Combat Synergy (Chapter 21)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-lg mb-4">
              "Their allied strengths combined, the two mystical items blazed forth with brilliant intensity"
            </p>
            <p className="text-muted-foreground">
              "Shooting a beam of stellar radiance" to purge forest corruption
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Combined Power (4 Artifacts):</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-turtle-green-600" />
                <span><strong>Dimension Blade</strong> - Cutting power</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-ocean-blue-600" />
                <span><strong>Star-Song Scepter</strong> - Cosmic channeling</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span><strong>Prism of Perspectives</strong> - Multi-dimensional focus</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-600" />
                <span><strong>Universe Scope</strong> - Pattern revelation</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Effect:</h3>
            <p className="text-muted-foreground">
              Massive stellar radiance beam capable of purging corruption and defeating Zarak's dark forces
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Magic System Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Magic System Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-turtle-green-600">Sound/Music Magic</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Bob's clan heritage</li>
                <li>• Ancient tongue sigils</li>
                <li>• Star-Song Scepter</li>
                <li>• Melody Box resonance</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 text-ocean-blue-600">Light vs. Darkness</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Crystal amulet purification</li>
                <li>• Banishing shadows</li>
                <li>• Corruption purging</li>
                <li>• Zarak's dark forces</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 text-purple-600">Dimensional Magic</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Dimension Blade cutting</li>
                <li>• Portal creation</li>
                <li>• Time travel (Passage of Ages)</li>
                <li>• World-walking</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 text-amber-600">Cosmic Magic</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Celestial realm access</li>
                <li>• Cosmic harmony guardianship</li>
                <li>• Universe Scope patterns</li>
                <li>• Tree of Celestial Knowledge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

