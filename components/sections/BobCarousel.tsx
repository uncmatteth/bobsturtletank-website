"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export function BobCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Use a selection of Bob photos
  const bobPhotos = Array.from({ length: 20 }, (_, i) => i + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bobPhotos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bobPhotos.length]);

  return (
    <div className="relative h-96 overflow-hidden rounded-3xl">
      {bobPhotos.map((num, index) => (
        <motion.div
          key={num}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{
            opacity: index === activeIndex ? 1 : 0,
            scale: index === activeIndex ? 1 : 1.2,
          }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={`/images/bob-gallery/BOB (${num}).png`}
            alt={`Bob ${num}`}
            fill
            className="object-cover"
          />
        </motion.div>
      ))}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {bobPhotos.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
