"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateTriviaQuestions, TriviaQuestion } from "@/lib/data/trivia";
import { Trophy, RotateCcw } from "lucide-react";

export function TriviaGame() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setQuestions(generateTriviaQuestions(10));
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameFinished(false);
  };

  const handleAnswerClick = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameFinished(true);
      }
    }, 2000);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading trivia questions...</p>
      </div>
    );
  }

  if (gameFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <CardTitle className="text-2xl">Game Complete!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-6xl font-bold mb-2">{score}/{questions.length}</p>
            <p className="text-2xl text-muted-foreground">{percentage}% Correct</p>
          </div>

          <div>
            {percentage >= 90 && (
              <p className="text-lg">🏆 Outstanding! You're a true Adventure Realm expert!</p>
            )}
            {percentage >= 70 && percentage < 90 && (
              <p className="text-lg">⭐ Great job! You know your Bob lore!</p>
            )}
            {percentage >= 50 && percentage < 70 && (
              <p className="text-lg">👍 Not bad! Keep exploring the Adventure Realm!</p>
            )}
            {percentage < 50 && (
              <p className="text-lg">📚 Time to re-read some chapters!</p>
            )}
          </div>

          <Button onClick={startNewGame} size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswers = [currentQuestion.correctAnswer, ...currentQuestion.wrongAnswers];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <Badge>
            Score: {score}/{questions.length}
          </Badge>
        </div>
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {shuffledAnswers.map((answer, index) => {
          const isCorrect = answer === currentQuestion.correctAnswer;
          const isSelected = answer === selectedAnswer;
          const shouldHighlight = showResult && (isSelected || isCorrect);

          return (
            <Button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              disabled={showResult}
              variant={
                shouldHighlight
                  ? isCorrect
                    ? "default"
                    : isSelected
                    ? "destructive"
                    : "outline"
                  : "outline"
              }
              className="w-full h-auto py-4 text-left justify-start whitespace-normal"
            >
              {showResult && isCorrect && "✓ "}
              {showResult && isSelected && !isCorrect && "✗ "}
              {answer}
            </Button>
          );
        })}

        {showResult && (
          <p className="text-center text-sm text-muted-foreground pt-4">
            {selectedAnswer === currentQuestion.correctAnswer
              ? "Correct! ✓"
              : `Wrong. The correct answer was: ${currentQuestion.correctAnswer}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
