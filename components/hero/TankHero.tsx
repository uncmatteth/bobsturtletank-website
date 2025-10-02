"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Book, Sparkles } from "lucide-react";

export function TankHero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Tank Rim Top */}
      <div className="absolute top-0 left-0 right-0 h-4 tank-rim" />
      
      {/* Water Surface Shimmer */}
      <div className="absolute top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 py-16">
        {/* Looking into tank perspective */}
        <div className="inline-block mb-6 text-sm text-blue-600 dark:text-blue-300 font-medium tracking-wide">
          👀 YOU ARE LOOKING INTO BOB'S TANK 🐢
        </div>
        
        {/* Main Title */}
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tank-title">
          Welcome to<br />
          Bob's Turtle Tank
        </h1>
        
        {/* Bob's Welcome Message */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative inline-block">
            <div className="bubble-text text-lg md:text-xl p-6">
              <p className="mb-2">
                <span className="text-4xl">🐢</span> Hi! I'm Bob!
              </p>
              <p className="text-muted-foreground">
                Welcome to my underwater kingdom! Check out my 69-chapter adventure,
                play games in my arcade, and explore all the treasures I've collected!
              </p>
            </div>
          </div>
        </div>
        
        {/* Tank Equipment - Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
            <Link href="/book">
              <Book className="mr-2 h-5 w-5" />
              Open Treasure Chest 💎
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-white/80 backdrop-blur">
            <Link href="/games">
              <Gamepad2 className="mr-2 h-5 w-5" />
              Tank Arcade 🎮
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-white/80 backdrop-blur">
            <Link href="/book/characters">
              <Sparkles className="mr-2 h-5 w-5" />
              Tank Residents 🐠
            </Link>
          </Button>
        </div>
        
        {/* Tank Stats */}
        <div className="mt-12 flex flex-wrap gap-8 justify-center text-center">
          <div className="underwater-card p-4 min-w-[120px]">
            <div className="text-3xl font-bold text-blue-600">69</div>
            <div className="text-sm text-muted-foreground">Chapters</div>
            <div className="text-xs">📖</div>
          </div>
          <div className="underwater-card p-4 min-w-[120px]">
            <div className="text-3xl font-bold text-emerald-600">100+</div>
            <div className="text-sm text-muted-foreground">Characters</div>
            <div className="text-xs">🎭</div>
          </div>
          <div className="underwater-card p-4 min-w-[120px]">
            <div className="text-3xl font-bold text-amber-600">50+</div>
            <div className="text-sm text-muted-foreground">Treasures</div>
            <div className="text-xs">💎</div>
          </div>
          <div className="underwater-card p-4 min-w-[120px]">
            <div className="text-3xl font-bold text-purple-600">∞</div>
            <div className="text-sm text-muted-foreground">Adventures</div>
            <div className="text-xs">⭐</div>
          </div>
        </div>
      </div>
      
      {/* Tank Floor Decorations */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
        {/* Substrate/Gravel */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-800/30 to-transparent" />
        
        {/* Random decorations */}
        <div className="absolute bottom-8 left-[10%] text-4xl opacity-60 aqua-plant">🌿</div>
        <div className="absolute bottom-8 left-[25%] text-3xl opacity-50">🪨</div>
        <div className="absolute bottom-8 right-[30%] text-4xl opacity-60 aqua-plant" style={{ animationDelay: '1s' }}>🌿</div>
        <div className="absolute bottom-8 right-[15%] text-3xl opacity-50">🪨</div>
        <div className="absolute bottom-12 left-[50%] text-2xl opacity-70 treasure-glow">💎</div>
      </div>
    </section>
  );
}

