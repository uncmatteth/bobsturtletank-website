import { TriviaGame } from "@/components/trivia/TriviaGame";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Trivia Game",
  description: "Test your knowledge of Bob's Adventure Realm! Answer questions about characters, locations, and artifacts.",
};

export default function TriviaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-10 w-10 text-yellow-600" />
          <h1 className="font-serif text-4xl font-bold">Adventure Realm Trivia</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Test your knowledge of Bob the Turtle's epic journey! Answer 10 questions about characters, 
          locations, and magical artifacts from across the Adventure Realm.
        </p>
      </div>

      <TriviaGame />
    </div>
  );
}
