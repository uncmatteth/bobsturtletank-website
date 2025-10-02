"use client"

import { useEffect } from 'react';

export function TankBubbles() {
  useEffect(() => {
    // Create bubbles dynamically
    const bubbleContainer = document.getElementById('bubble-container');
    if (!bubbleContainer) return;

    // Clear existing bubbles
    bubbleContainer.innerHTML = '';

    // Create 20 bubbles with random properties
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      
      // Random size between 10-40px
      const size = Math.random() * 30 + 10;
      bubble.style.setProperty('--size', `${size}px`);
      
      // Random horizontal position
      bubble.style.left = `${Math.random() * 100}%`;
      
      // Random animation duration (6-12 seconds)
      const duration = Math.random() * 6 + 6;
      bubble.style.setProperty('--duration', `${duration}s`);
      
      // Random delay to stagger animations
      const delay = Math.random() * 5;
      bubble.style.setProperty('--delay', `${delay}s`);
      
      // Random drift amount
      const drift = (Math.random() - 0.5) * 100;
      bubble.style.setProperty('--drift', `${drift}px`);
      
      bubbleContainer.appendChild(bubble);
    }
  }, []);

  return (
    <>
      {/* Bubble container */}
      <div 
        id="bubble-container" 
        className="fixed inset-0 pointer-events-none z-10"
        aria-hidden="true"
      />
      
      {/* Water caustics effect */}
      <div className="water-caustics" aria-hidden="true" />
    </>
  );
}

