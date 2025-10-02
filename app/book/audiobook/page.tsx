import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Mic, User, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Audiobook Voice Cast",
  description: "Meet the incredible voice cast bringing Bob's adventures to life!",
};

// Voice cast data from character_voice_database.csv
const voiceCast = [
  {
    character: "Uncle Matt (Narrator)",
    voiceActor: "Morgan Freeman",
    type: "Core Recurring",
    chapters: "1-69+",
    appearances: "70+",
    note: "NARRATOR VOICE - The storytelling legend himself",
  },
  {
    character: "Bob",
    voiceActor: "Taylor Swift",
    type: "Core Recurring",
    chapters: "1-69+",
    appearances: "70+",
    note: "Magical Talking Turtle - Bob's iconic voice",
  },
  {
    character: "Ian / Lord Trivia",
    voiceActor: "Ryan Reynolds",
    type: "Core Recurring",
    chapters: "Multiple",
    appearances: "30+",
    note: "The Trivia Master with perfect comedic timing",
  },
  {
    character: "James",
    voiceActor: "Chris Pratt",
    type: "Core Recurring",
    chapters: "Multiple",
    appearances: "25+",
    note: "Uncle Matt's adventurous friend",
  },
  {
    character: "Kayla",
    voiceActor: "Zendaya",
    type: "Core Recurring",
    chapters: "Multiple",
    appearances: "20+",
    note: "The tech-savvy companion",
  },
  {
    character: "Troll",
    voiceActor: "Ronnie James Dio",
    type: "One-off",
    chapters: "1",
    appearances: "1",
    note: "\"You'll be paying the toll!\" - Legendary rock voice",
  },
  {
    character: "Cosmic Entities",
    voiceActor: "Various Celebrity Voices",
    type: "Supporting",
    chapters: "Throughout",
    appearances: "50+",
    note: "100+ characters voiced by dream celebrity cast",
  },
];

export default function AudiobookPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Tank Audio Studio Header */}
      <div className="text-center mb-12 relative">
        <div className="inline-block mb-4 text-sm text-purple-600 dark:text-purple-300 font-medium tracking-wide">
          🎧 UNDERWATER RECORDING STUDIO 🫧
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Headphones className="h-10 w-10 text-purple-500" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title">
            Bob's Tank Audiobook
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          The most star-studded voice cast ever assembled in a turtle tank!
        </p>
        <div className="text-sm text-blue-600 dark:text-blue-400">
          🐢 Bob says: "These are my dream voices! Well, AI versions anyway..."
        </div>
      </div>

      {/* Voice Cast Grid */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="underwater-card p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Mic className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="font-bold text-2xl">The Dream Voice Cast</h2>
              <p className="text-sm text-muted-foreground">
                69 Chapters • 100+ Characters • Infinite Celebrity AI Magic
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {voiceCast.map((cast, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-5 border-2 border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{cast.character}</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      🎤 {cast.voiceActor}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Type:</span> {cast.type}
                  </p>
                  <p>
                    <span className="font-semibold">Chapters:</span> {cast.chapters}
                  </p>
                  <p>
                    <span className="font-semibold">Appearances:</span>{" "}
                    {cast.appearances}
                  </p>
                  <p className="text-muted-foreground italic mt-2">{cast.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Character Database Link */}
        <div className="underwater-card p-6 text-center">
          <h3 className="font-bold text-xl mb-3">
            Want to See ALL 100+ Voice Actors?
          </h3>
          <p className="text-muted-foreground mb-4">
            Every single character has been assigned a celebrity voice! From Morgan
            Freeman to Taylor Swift, we've got the dream team.
          </p>
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href="/book/characters">
              👥 View Complete Voice Cast Database
            </Link>
          </Button>
        </div>
      </div>

      {/* Production Info */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="underwater-card p-8 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950">
          <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
            <Headphones className="h-6 w-6" />
            About the Audiobook Production
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              🎙️ <strong>Production Method:</strong> State-of-the-art AI voice
              synthesis technology brings each character to life with voices that
              sound like your favorite celebrities!
            </p>
            <p>
              📖 <strong>Format:</strong> 69 epic chapters of adventure, fully
              voiced with character-specific celebrity voices
            </p>
            <p>
              🎭 <strong>Voice Database:</strong> Over 100 unique characters, each
              carefully matched to the perfect celebrity voice for their
              personality
            </p>
            <p>
              🐢 <strong>Bob Approved:</strong> "I always knew I'd sound like Taylor
              Swift!" - Bob the Turtle
            </p>
          </div>
        </div>
      </div>

      {/* The All-Important Legal Disclaimer */}
      <div className="max-w-4xl mx-auto">
        <div className="border-4 border-yellow-500 dark:border-yellow-600 rounded-lg p-6 bg-yellow-50 dark:bg-yellow-950/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-2xl text-yellow-900 dark:text-yellow-100 mb-2">
                Important Legal Disclaimer
              </h2>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4 font-medium">
                Please read carefully - This covers everyone's butts! 🛡️
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-yellow-900 dark:text-yellow-100">
            <div className="bg-white/50 dark:bg-black/30 rounded p-4 border border-yellow-300 dark:border-yellow-700">
              <p className="font-bold mb-2">🎭 PARODY & TRANSFORMATIVE WORK</p>
              <p>
                This audiobook production is a <strong>parody and transformative work</strong> created
                for entertainment purposes. The celebrity voice representations are
                created using AI voice synthesis technology and are{" "}
                <strong>NOT actual recordings</strong> of the named celebrities.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-black/30 rounded p-4 border border-yellow-300 dark:border-yellow-700">
              <p className="font-bold mb-2">🤖 AI-GENERATED VOICES</p>
              <p>
                All voice performances are <strong>AI-generated</strong> and synthesized. 
                No actual celebrity participated in this production. The celebrity names 
                are used purely for <strong>descriptive purposes</strong> to indicate the 
                style and tone of the AI-generated voices.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-black/30 rounded p-4 border border-yellow-300 dark:border-yellow-700">
              <p className="font-bold mb-2">⚖️ FAIR USE & NON-COMMERCIAL</p>
              <p>
                This work is provided under principles of <strong>Fair Use</strong> (17 U.S.C. § 107)
                for purposes of criticism, comment, and parody. This is a{" "}
                <strong>non-commercial fan project</strong> created out of love for 
                storytelling and technology. We are not affiliated with, endorsed by, 
                or represent any of the named celebrities.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-black/30 rounded p-4 border border-yellow-300 dark:border-yellow-700">
              <p className="font-bold mb-2">🚫 NO ENDORSEMENT IMPLIED</p>
              <p>
                The use of celebrity names does <strong>NOT</strong> imply any endorsement,
                sponsorship, or affiliation with this project. These individuals have not
                approved, reviewed, or participated in the creation of this audiobook.
                Any similarity to actual voice performances is coincidental and the result
                of AI synthesis technology.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-black/30 rounded p-4 border border-yellow-300 dark:border-yellow-700">
              <p className="font-bold mb-2">📝 ORIGINAL CREATIVE WORK</p>
              <p>
                All story content, characters, plot, and creative elements are{" "}
                <strong>100% original work</strong> by Uncle Matt. Only the AI voice 
                synthesis references celebrity vocal styles for entertainment value.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-black/30 rounded p-4 border border-yellow-300 dark:border-yellow-700">
              <p className="font-bold mb-2">🛡️ TAKEDOWN POLICY</p>
              <p>
                We respect the rights of all individuals. If any celebrity, their 
                representative, or rights holder objects to the use of their name or 
                likeness in this project, please contact us and we will{" "}
                <strong>promptly remove or modify</strong> the content in question. 
                We're just having fun in Bob's tank here! 🐢
              </p>
            </div>

            <div className="bg-white/50 dark:bg-black/30 rounded p-4 border border-yellow-300 dark:border-yellow-700">
              <p className="font-bold mb-2">💙 TRIBUTE & APPRECIATION</p>
              <p>
                This project is created as a <strong>tribute</strong> to the amazing 
                talents of these celebrities and how their unique voices would bring 
                our characters to life. We have immense respect and admiration for 
                their actual work and contributions to entertainment.
              </p>
            </div>

            <p className="text-center pt-4 italic">
              By accessing this audiobook, you acknowledge that you understand these
              are AI-generated voices created for parody and entertainment purposes
              only, and that no actual celebrities were involved in the production.
            </p>

            <p className="text-center pt-2 font-bold">
              🐢 Bob's Legal Note: "My lawyer turtle says this should cover us. 
              We're just having fun and making art! If anyone's upset, we'll fix it. 
              Pinky promise!" 🫧
            </p>
          </div>
        </div>
      </div>

      {/* Back to Book */}
      <div className="text-center mt-12">
        <Button asChild variant="outline" size="lg">
          <Link href="/book">← Back to Treasure Chest</Link>
        </Button>
      </div>
    </div>
  );
}

