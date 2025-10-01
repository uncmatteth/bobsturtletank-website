"use client"

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Image from "next/image";

interface GlassmorphicCardProps {
  children: ReactNode;
  bobImage?: number;
  className?: string;
}

export function GlassmorphicCard({ children, bobImage, className = "" }: GlassmorphicCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {bobImage && (
        <div className="absolute inset-0 opacity-20">
          <Image
            src={`/images/bob-gallery/BOB (${bobImage}).png`}
            alt="Bob"
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
