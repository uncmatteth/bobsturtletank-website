"use client"

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function TurtleBouncePage() {
  useEffect(() => {
    // Redirect to the actual game
    window.location.href = "/games/turtlebounceybounce/index.html";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen underwater-background">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Loading Turtle Bouncy Bounce...</h1>
        <p className="text-muted-foreground">
          If the game doesn't load automatically, <a href="/games/turtlebouncybounce/index.html" className="text-primary underline">click here</a>.
        </p>
      </div>
    </div>
  );
}
