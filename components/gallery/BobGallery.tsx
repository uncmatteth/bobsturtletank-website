"use client"

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BobGalleryProps {
  limit?: number;
  columns?: number;
}

export function BobGallery({ limit, columns = 4 }: BobGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Generate array of image numbers (1-84)
  const totalImages = 84;
  const imageNumbers = Array.from({ length: totalImages }, (_, i) => i + 1);
  const displayImages = limit ? imageNumbers.slice(0, limit) : imageNumbers;

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  }[columns] || "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <>
      <div className={`grid ${gridCols} gap-4`}>
        {displayImages.map((num) => {
          const imagePath = `/images/bob-gallery/BOB (${num}).png`;
          return (
            <div
              key={num}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setLightboxImage(imagePath)}
            >
              <Image
                src={imagePath}
                alt={`Bob the Turtle photo ${num}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="relative w-full max-w-5xl aspect-square">
            <Image
              src={lightboxImage}
              alt="Bob the Turtle"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}

