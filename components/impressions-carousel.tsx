"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const IMAGES = [
  { src: "/colored-preview.jpg", alt: "Colored preview" },
  { src: "/ui-preview.png", alt: "UI preview" },
  { src: "/in-progress.jpg", alt: "Work in progress" },
];

export function ImpressionsCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? IMAGES.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === IMAGES.length - 1 ? 0 : i + 1));

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Image */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-white shadow-md">
        <Image
          src={IMAGES[index].src}
          alt={IMAGES[index].alt}
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-50"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-50"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === index ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
