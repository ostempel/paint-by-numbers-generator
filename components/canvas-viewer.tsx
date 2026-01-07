"use client";

import type React from "react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { Scene } from "@/lib/generator/generator";
import { renderSceneSvg } from "@/lib/renderScene";
import { RenderOptions, RenderSceneOpts } from "./render-options";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ColorPalette } from "./color-palette";

interface CanvasViewerProps {
  image?: string | null;
  scene?: Scene | null;
}

function downloadText(filename: string, mime: string, text: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function svgToPngDataUrl(svg: string, width: number, height: number) {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = new window.Image();
    img.decoding = "async";
    img.loading = "eager";

    const dataUrl: string = await new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get 2D canvas context"));
          return;
        }

        // Optional: white background (PNG transparency otherwise)
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => reject(new Error("Failed to load SVG into image"));
      img.src = url;
    });

    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function CanvasViewer({
  image = null,
  scene = null,
}: CanvasViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);

  const [renderOptions, setRenderOptions] = useState<RenderSceneOpts>({
    smooth: 0.5,
    filled: true,
    outlines: true,
    labels: true,
    colorPalette: true,
    stroke: 1,
    labelFontSize: 12,
    background: "white",
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const svgString = useMemo(() => {
    if (!scene) return null;
    return renderSceneSvg(scene, renderOptions);
  }, [scene, renderOptions]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const hasContent = Boolean(scene) || Boolean(image);

  const exportSvg = () => {
    if (!svgString) return;
    downloadText("paint-by-numbers.svg", "image/svg+xml", svgString);
  };

  const exportPng = async () => {
    if (!svgString || !scene) return;
    setIsExporting(true);
    try {
      const pngUrl = await svgToPngDataUrl(
        svgString,
        scene.width,
        scene.height
      );
      downloadDataUrl("paint-by-numbers.png", pngUrl);
    } catch (e) {
      console.error(e);
      // optional: toast
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasContent) {
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

        {/* Export dropdown */}
        <div className="ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full shadow-sm bg-transparent"
                disabled={!svgString || isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportSvg} disabled={!svgString}>
                Download SVG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportPng}
                disabled={!svgString || !scene || isExporting}
              >
                Download PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-transparent"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Render
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-[360px] p-0"
              sideOffset={8}
            >
              <RenderOptions
                value={renderOptions}
                onChange={setRenderOptions}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm relative"
        style={{
          backgroundImage: showGrid
            ? "repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px)"
            : "none",
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
            transformOrigin: "center",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {svgString ? (
              <div
                className="max-w-full max-h-full"
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
            ) : (
              <Image
                src={image || "/placeholder.svg"}
                alt="Paint by numbers preview"
                fill
                className="object-contain"
                draggable={false}
                unoptimized
              />
            )}
          </div>
        </div>
      </div>
      {renderOptions.colorPalette &&
        scene?.palette &&
        scene.palette.length > 0 && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <ColorPalette colors={scene.palette} />
          </div>
        )}
    </div>
  );
}
