"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function SwimmingBob() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 20 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isSwimming, setIsSwimming] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const swimInterval = setInterval(() => {
      // Randomly decide to swim
      if (Math.random() > 0.7) {
        setIsSwimming(true);
        
        // Random target position
        const targetX = Math.random() * 80 + 10; // 10-90%
        const targetY = Math.random() * 60 + 10; // 10-70%
        
        // Determine direction based on movement
        setDirection(targetX > position.x ? 'right' : 'left');
        
        // Animate to new position
        setPosition({ x: targetX, y: targetY });
        
        // Stop swimming animation after reaching
        setTimeout(() => setIsSwimming(false), 3000);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(swimInterval);
  }, [position, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const bubbleInterval = setInterval(() => {
      if (!isSwimming && Math.random() > 0.8) {
        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 4000);
      }
    }, 6000);

    return () => clearInterval(bubbleInterval);
  }, [isSwimming, mounted]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed pointer-events-none z-20 transition-all duration-[3000ms] ease-in-out"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
      aria-hidden="true"
    >
      <div className={`relative ${isSwimming ? 'animate-bounce' : ''}`}>
        {/* Bob the Turtle */}
        <div className="relative w-16 h-16 md:w-24 md:h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full">
            <div className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-2xl md:text-4xl">🐢</span>
            </div>
          </div>
        </div>
        
        {/* Occasional speech bubble */}
        {showBubble && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="bubble-text text-xs md:text-sm">
              {getRandomBobQuote()}
            </div>
          </div>
        )}
        
        {/* Swimming motion bubbles */}
        {isSwimming && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 bg-white/60 rounded-full animate-ping" />
            <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          </>
        )}
      </div>
    </div>
  );
}

function getRandomBobQuote(): string {
  const quotes = [
    "Welcome to my tank! 🫧",
    "Check out the treasures! 💎",
    "Want to play? 🎮",
    "*nom nom* 🌿",
    "Uncle Matt!  👋",
    "Adventure awaits! ⭐",
    "Bubble bubble! 💧",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

