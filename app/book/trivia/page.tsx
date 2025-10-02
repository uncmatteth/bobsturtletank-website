import { TriviaGame } from "@/components/trivia/TriviaGame";
import { Trophy, Star, Award, Target } from "lucide-react";

export const metadata = {
  title: "Tank Expert Quiz - Bob's Trivia Challenge",
  description: "Test your knowledge of Bob's Adventure Realm! 10 questions about characters, locations, and artifacts. Can you beat Bob's high score?",
};

export default function TriviaPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4 text-sm text-yellow-600 dark:text-yellow-300 font-medium tracking-wide">
          🏆 TANK EXPERT CHALLENGE 🎯
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tank-title mb-4">
          Adventure Realm Trivia
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Think you know Bob's tank better than anyone? Test your knowledge with <strong className="text-yellow-600">10 challenging questions</strong> about 
          characters, locations, and magical artifacts from the 69-chapter epic journey!
        </p>
        
        {/* Challenge Stats */}
        <div className="inline-grid grid-cols-3 gap-6 px-8 py-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-xl border-2 border-yellow-400 dark:border-yellow-600 mb-8">
          <div className="text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">10</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          <div className="text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold text-amber-600">100</div>
            <div className="text-xs text-muted-foreground">Max Score</div>
          </div>
          <div className="text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">?</div>
            <div className="text-xs text-muted-foreground">Your Score</div>
          </div>
        </div>

        {/* Bob's Challenge */}
        <div className="inline-block px-6 py-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 max-w-2xl mb-8">
          <div className="text-3xl mb-2">🐢</div>
          <div className="font-bold mb-1 text-emerald-600">Bob's Challenge:</div>
          <p className="text-sm text-muted-foreground">
            "I bet you can't get more than 7 out of 10! These questions are about MY adventure, 
            and I helped write them. Good luck! 😏"
          </p>
        </div>
      </div>

      {/* Trivia Game Component */}
      <TriviaGame />

      {/* Info Section */}
      <div className="mt-12 text-center">
        <div className="inline-block max-w-2xl underwater-card p-6">
          <Award className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
          <h3 className="font-bold text-xl mb-2">Scoring Guide</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong className="text-green-600">90-100:</strong> Tank Expert! You know Bob's world better than Bob!</p>
            <p><strong className="text-blue-600">70-89:</strong> Tank Enthusiast! You've been paying attention!</p>
            <p><strong className="text-yellow-600">50-69:</strong> Tank Visitor! Not bad, but room to improve!</p>
            <p><strong className="text-orange-600">Below 50:</strong> Tank Newbie! Time to re-read the adventure!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
