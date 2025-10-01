"use client"

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Book, Trophy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function SpectacularHero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [currentBg, setCurrentBg] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev % 20) + 1); // Rotate through 20 random Bob images
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Random Bob images for floating effect
  const floatingBobs = [3, 7, 12, 18, 25, 33, 41, 52];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-ocean-blue-900 via-turtle-green-900 to-purple-900">
      {/* Animated Background Bob Photos */}
      <motion.div
        key={currentBg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        <Image
          src={`/images/bob-gallery/BOB (${currentBg}).png`}
          alt="Bob"
          fill
          className="object-cover blur-sm"
          priority
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      {/* Floating Bob Images with Parallax */}
      {floatingBobs.map((bobNum, index) => (
        <motion.div
          key={bobNum}
          style={{ 
            y: index % 2 === 0 ? y1 : y2,
            left: `${(index * 15) % 90}%`,
            top: `${(index * 20) % 80}%`,
            width: "120px",
            height: "120px",
          }}
          className="absolute"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 0.4, 
            scale: 1,
            y: [0, -20, 0],
          }}
          transition={{
            opacity: { delay: index * 0.2 },
            scale: { delay: index * 0.2 },
            y: {
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <Image
            src={`/images/bob-gallery/BOB (${bobNum}).png`}
            alt="Bob"
            fill
            className="object-contain rounded-full border-4 border-white/20 shadow-2xl"
          />
        </motion.div>
      ))}

      {/* Main Hero Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen text-center"
      >
        {/* Animated Title */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="font-serif text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-turtle-green-400 via-ocean-blue-400 to-purple-400"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            Bob's Turtle Tank
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-3xl text-white/90 max-w-4xl mb-12 font-light"
        >
          Join Bob the Magical Talking Turtle on an epic adventure across the Adventure Realm!
        </motion.p>

        {/* Animated Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-turtle-green-600 to-turtle-green-700 hover:from-turtle-green-500 hover:to-turtle-green-600 shadow-2xl">
              <Link href="/games">
                <Gamepad2 className="mr-2 h-6 w-6" />
                Play Games
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white/50 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 shadow-2xl">
              <Link href="/book/buy">
                <Book className="mr-2 h-6 w-6" />
                Buy the Book
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 bg-gradient-to-r from-ocean-blue-600 to-ocean-blue-700 hover:from-ocean-blue-500 hover:to-ocean-blue-600 shadow-2xl">
              <Link href="/book/trivia">
                <Trophy className="mr-2 h-6 w-6" />
                Play Trivia
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1 },
            y: { duration: 2, repeat: Infinity }
          }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <Sparkles className="h-8 w-8 text-white/60" />
        </motion.div>
      </motion.div>
    </div>
  );
}
