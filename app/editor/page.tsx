"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import { CanvasViewer } from "@/components/canvas-viewer";
import { ColorPalette } from "@/components/color-palette";
import { Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type ApiResponse = {
  svg?: string;
  previewPngBase64?: string | null;
  palette?: Array<{ number: number; color: string; rgb: string }>;
};

function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------------
// Form schema + types
// -------------------------
const formSchema = z.object({
  colors: z.number().min(4).max(48),
  minArea: z.number().min(10).max(200),
  smooth: z.number().min(0).max(1),
  strokeWidth: z.number().min(0).max(2),
  facetIterations: z.number().min(1).max(10),
  fontSize: z.number().min(6).max(20),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaintByNumbersPage() {
  // Upload state (keep separate from form)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Processing + results
  const [isProcessing, setIsProcessing] = useState(false);
  const [svg, setSvg] = useState<string | null>(null);
  const [previewPng, setPreviewPng] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<
    Array<{ number: number; color: string; rgb: string }>
  >([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      colors: 12,
      minArea: 50,
      smooth: 0.5,
      strokeWidth: 1,
      facetIterations: 3,
      fontSize: 10,
    },
    mode: "onChange",
  });

  const { watch, setValue, handleSubmit } = form;
  const values = watch();

  const handleImageUpload = (file: File, imageUrl: string) => {
    setUploadedFile(file);
    setUploadedImage(imageUrl);

    // Optional: clear previous results
    setSvg(null);
    setPreviewPng(null);
    setColorPalette([]);
  };

  const processImage = async (v: FormValues) => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("colors", String(v.colors));
      formData.append("minArea", String(v.minArea));
      formData.append("smooth", String(v.smooth)); // 0..1
      formData.append("strokeWidth", String(v.strokeWidth));
      formData.append("facetIterations", String(v.facetIterations));
      formData.append("fontSize", String(v.fontSize));

      const res = await fetch("/api/generator", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;

      setSvg(data.svg ?? null);
      setPreviewPng(
        data.previewPngBase64
          ? `data:image/png;base64,${data.previewPngBase64}`
          : null
      );
      setColorPalette(Array.isArray(data.palette) ? data.palette : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onGenerate = handleSubmit(processImage);

  const handleDownloadSVG = () => {
    if (!svg) return;
    downloadBlob("paint-by-numbers.svg", "image/svg+xml", svg);
  };

  const handleDownloadPNG = () => {
    if (!previewPng) return;
    const a = document.createElement("a");
    a.href = previewPng;
    a.download = "paint-by-numbers.png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Paint by Numbers
            </h1>
            <p className="text-sm text-gray-600">
              Upload an image to generate your printable paint-by-numbers
            </p>
          </div>

          {/* Image Input */}
          <Card className="p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Image Input
            </h2>
            <ImageUpload
              // must call onImageUpload(file, url)
              // @ts-expect-error adjust ImageUpload signature if needed
              onImageUpload={handleImageUpload}
              currentImage={uploadedImage}
            />
          </Card>

          {/* Settings */}
          <Card className="p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Settings
            </h2>

            <div className="space-y-5">
              {/* colors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Number of colors
                  </Label>
                  <span className="text-sm font-medium text-gray-900">
                    {values.colors}
                  </span>
                </div>
                <Slider
                  min={4}
                  max={48}
                  step={1}
                  value={[values.colors]}
                  onValueChange={([n]) =>
                    setValue("colors", n, { shouldDirty: true })
                  }
                  className="w-full"
                />
              </div>

              {/* min area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Minimum area
                  </Label>
                  <span className="text-sm font-medium text-gray-900">
                    {values.minArea}
                  </span>
                </div>
                <Slider
                  min={10}
                  max={200}
                  step={10}
                  value={[values.minArea]}
                  onValueChange={([n]) =>
                    setValue("minArea", n, { shouldDirty: true })
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Merge smaller regions
                </p>
              </div>

              {/* smoothing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Smoothing
                  </Label>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(values.smooth * 100)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[Math.round(values.smooth * 100)]}
                  onValueChange={([n]) =>
                    setValue("smooth", n / 100, { shouldDirty: true })
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Technical → Organic
                </p>
              </div>

              {/* min area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Stroke width
                  </Label>
                  <span className="text-sm font-medium text-gray-900">
                    {values.strokeWidth}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[values.strokeWidth]}
                  onValueChange={([n]) =>
                    setValue("strokeWidth", n, { shouldDirty: true })
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Width of the stroke around each facet
                </p>
              </div>

              {/* font-size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Font size
                  </Label>
                  <span className="text-sm font-medium text-gray-900">
                    {values.fontSize}
                  </span>
                </div>
                <Slider
                  min={6}
                  max={20}
                  step={1}
                  value={[values.fontSize]}
                  onValueChange={([n]) =>
                    setValue("fontSize", n, { shouldDirty: true })
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Font size of the labels
                </p>
              </div>

              {/* facet-iterations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Facet iterations
                  </Label>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={values.facetIterations}
                  onChange={(e) =>
                    setValue("facetIterations", Number(e.target.value), {
                      shouldDirty: true,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of passes to merge small facets
                </p>
              </div>

              {/* generate */}
              <div className="pt-2">
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={!uploadedFile || isProcessing}
                  onClick={onGenerate}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Click “Generate” to apply changes.
                </p>
              </div>
            </div>
          </Card>

          {/* Export */}
          <Card className="p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Export</h2>
            <div className="space-y-2">
              <Button
                onClick={handleDownloadSVG}
                className="w-full bg-transparent"
                variant="outline"
                disabled={!svg || isProcessing}
              >
                <Download className="w-4 h-4 mr-2" />
                Download SVG
              </Button>
              <Button
                onClick={handleDownloadPNG}
                className="w-full"
                disabled={!previewPng || isProcessing}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </Card>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                  <p className="text-sm text-gray-600">Processing image...</p>
                </div>
              </div>
            )}

            <CanvasViewer image={previewPng} />
          </div>

          {colorPalette.length > 0 && (
            <div className="border-t border-gray-200 bg-white">
              <ColorPalette colors={colorPalette} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
