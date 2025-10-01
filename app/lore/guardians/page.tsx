import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Guardian Network",
  description: "The mysterious guardian system protecting travelers across the Adventure Realm",
};

export default function GuardiansPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Shield className="h-16 w-16 mx-auto mb-4 text-turtle-green-600" />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          The Guardian Network
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A mysterious system of protectors watching over travelers across the realms
        </p>
      </div>

      {/* Everwood */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Users className="h-8 w-8 text-turtle-green-600" />
              Everwood
            </CardTitle>
            <Badge variant="outline" className="text-lg">Voluntary Service</Badge>
          </div>
          <p className="text-muted-foreground">Ancient Forest Guardian | First Appearance: Chapter 2</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Description & Abilities:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Ancient guardian with antlered appearance</li>
              <li>• "Countless years I have been tasked with watching over these ancient mountains"</li>
              <li>• Knows travelers' names before meeting them (knew Matt and Bob's clan)</li>
              <li>• Can sense travelers with "courage and noble purpose"</li>
              <li>• Provides aid when need is greatest</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Key Quotes:</h3>
            <blockquote className="border-l-4 border-turtle-green-600 pl-4 italic">
              "When the need is greatest, my aid shall always be available to you."
            </blockquote>
            <blockquote className="border-l-4 border-turtle-green-600 pl-4 italic mt-3">
              "I have been seeking to guide and assist those who journey here with courage and noble purpose."
            </blockquote>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Role in Story:</h3>
            <p className="text-muted-foreground">
              Everwood serves as a mentor figure, warning Matt and Bob of the evil sorcerer Zarak's minions 
              and providing crucial guidance throughout their journey. He represents the voluntary protector 
              archetype within the guardian network.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rahil */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Users className="h-8 w-8 text-ocean-blue-600" />
              Rahil the Guardian
            </CardTitle>
            <Badge variant="outline" className="text-lg">Recompense Service</Badge>
          </div>
          <p className="text-muted-foreground">Desert Guardian | First Appearance: Chapter 15</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Description & Abilities:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Desert guide who shelters lost travelers</li>
              <li>• Possesses the Universe Scope artifact (clockwork device revealing cosmic patterns)</li>
              <li>• Bound by duty to help all souls who wander the sands</li>
              <li>• Knows of other guardians including Everwood</li>
              <li>• Serves as "recompense" for an unknown past deed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Key Quotes:</h3>
            <blockquote className="border-l-4 border-ocean-blue-600 pl-4 italic">
              "I guide all souls who lose their way. It is my sworn duty to shelter all souls who wander these sands."
            </blockquote>
            <blockquote className="border-l-4 border-ocean-blue-600 pl-4 italic mt-3">
              "There are others like me across the realms... You have already met one of my kin, Everwood."
            </blockquote>
            <blockquote className="border-l-4 border-ocean-blue-600 pl-4 italic mt-3">
              "Some serve voluntarily as he does; Some serve as a recompense, as I do."
            </blockquote>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Mystery:</h3>
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
              <p className="text-muted-foreground flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  What is the "recompense" Rahil owes? His service as a guardian appears to be penance 
                  for some past action, but the nature of this debt remains a mystery throughout the story.
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Network System */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-600" />
            The Guardian System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Confirmed Facts:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Organized network of guardians across multiple realms</li>
              <li>• Guardians know of each other's existence and roles</li>
              <li>• Different motivations: some volunteer, others serve as recompense</li>
              <li>• Can appear when travelers are in greatest need</li>
              <li>• Each guardian has a specific domain (mountains, deserts, etc.)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Unanswered Questions:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Who or what organizes this guardian system?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Are there more guardians beyond Everwood and Rahil?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  What determines who becomes a guardian?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Is there a higher power directing the guardians?
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

