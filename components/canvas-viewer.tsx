"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Grid3x3 } from "lucide-react";
import Image from "next/image";

interface CanvasViewerProps {
  image: string | null;
}

export function CanvasViewer({ image }: CanvasViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  if (!image) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No image generated yet
          </h3>
          <p className="text-sm text-gray-600">
            Upload an image and generate a paint-by-numbers template
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomOut}
          disabled={zoom <= 0.25}
          className="rounded-full shadow-sm bg-transparent"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-gray-700 min-w-16 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          className="rounded-full shadow-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <Button
          size="icon"
          variant={showGrid ? "default" : "outline"}
          onClick={() => setShowGrid(!showGrid)}
          className="rounded-full shadow-sm"
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm relative"
        style={{
          backgroundImage: showGrid
            ? "repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px)"
            : "repeating-conic-gradient(#f3f4f6 0% 25%, #ffffff 0% 50%) 50% / 20px 20px",
          cursor: isPanning ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={image || "/placeholder.svg"}
              alt="Paint by numbers preview"
              fill
              className="object-contain"
              draggable={false}
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}
