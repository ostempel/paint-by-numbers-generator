"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { CanvasViewer } from "@/components/canvas-viewer";
import { ColorPalette } from "@/components/color-palette";
import { Loader2 } from "lucide-react";
import { Scene } from "@/lib/generator/generator";
import { GeneratorOptions } from "@/components/generator-options";
import { RenderOptions, RenderSceneOpts } from "@/components/render-options";

type ApiResponse = {
  svg?: string;
  previewPngBase64?: string | null;
  palette?: Array<{ number: number; color: string; rgb: string }>;
  scene?: Scene | null;
};

// function downloadBlob(filename: string, mime: string, content: string) {
//   const blob = new Blob([content], { type: mime });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// -------------------------
// Form schema + types
// -------------------------
const formSchema = z.object({
  colors: z.number().min(4).max(48),
  minArea: z.number().min(10).max(200),
  facetIterations: z.number().min(1).max(10),
});

export type GeneratorFormValues = z.infer<typeof formSchema>;

export default function PaintByNumbersPage() {
  // Upload state (keep separate from form)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [renderOptions, setRenderOptions] = useState<RenderSceneOpts>({
    smooth: 0.5,
    filled: true,
    outlines: true,
    labels: true,
    stroke: 1,
    labelFontSize: 12,
    background: "white",
  });

  // Processing + results
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPng, setPreviewPng] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<
    Array<{ number: number; color: string; rgb: string }>
  >([]);
  const [scene, setScene] = useState<Scene | null>(null);

  const form = useForm<GeneratorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      colors: 12,
      minArea: 50,
      facetIterations: 3,
    },
    mode: "onChange",
  });

  const { handleSubmit } = form;

  const handleImageUpload = (file: File, imageUrl: string) => {
    setUploadedFile(file);
    setUploadedImage(imageUrl);

    // Optional: clear previous results
    setPreviewPng(null);
    setColorPalette([]);
  };

  const processImage = async (v: GeneratorFormValues) => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("colors", String(v.colors));
      formData.append("minArea", String(v.minArea));
      formData.append("facetIterations", String(v.facetIterations));

      const res = await fetch("/api/generator", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;

      setPreviewPng(
        data.previewPngBase64
          ? `data:image/png;base64,${data.previewPngBase64}`
          : null
      );
      setColorPalette(Array.isArray(data.palette) ? data.palette : []);
      setScene(data.scene ? data.scene : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onGenerate = handleSubmit(processImage);

  // const handleDownloadSVG = () => {
  //   if (!svg) return;
  //   downloadBlob("paint-by-numbers.svg", "image/svg+xml", svg);
  // };

  // const handleDownloadPNG = () => {
  //   if (!previewPng) return;
  //   const a = document.createElement("a");
  //   a.href = previewPng;
  //   a.download = "paint-by-numbers.png";
  //   a.click();
  // };

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

          <GeneratorOptions
            form={form}
            disabled={!uploadedFile}
            isProcessing={isProcessing}
            onGenerate={onGenerate}
          />

          <RenderOptions value={renderOptions} onChange={setRenderOptions} />
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

            <CanvasViewer
              image={previewPng}
              scene={scene}
              renderOptions={renderOptions}
            />
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
