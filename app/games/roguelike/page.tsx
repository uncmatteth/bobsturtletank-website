"use client"

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function TurtleRoguelikePage() {
  useEffect(() => {
    // Redirect to the actual game  
    window.location.href = "/games/turtlegamebob/index.html";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
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
        <h1 className="text-3xl font-bold mb-4">Loading Turtle Roguelike...</h1>
        <p className="text-muted-foreground">
          If the game doesn't load automatically, <a href="/games/turtlegamebob/index.html" className="text-primary underline">click here</a>.
        </p>
      </div>
    </div>
  );
}
