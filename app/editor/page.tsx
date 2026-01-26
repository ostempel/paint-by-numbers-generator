"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { CanvasViewer } from "@/components/canvas-viewer";
import { Loader2 } from "lucide-react";
import { Scene } from "@/lib/generator/generator";
import { GeneratorOptions } from "@/components/generator-options";
import Link from "next/link";

type ApiResponse = {
  scene?: Scene | null;
};

const formSchema = z.object({
  colors: z.number().min(4).max(48),
  minArea: z.number().min(10).max(200),
  facetIterations: z.number().min(1).max(10),
});

export type GeneratorFormValues = z.infer<typeof formSchema>;

export default function PaintByNumbersPage() {
  // Upload state (keep separate from form)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Processing + results
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPng, setPreviewPng] = useState<string | null>(null);
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

  const handleImageUpload = (file: File | null) => {
    setUploadedFile(file);

    setPreviewPng(null);
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

      setScene(data.scene ? data.scene : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onGenerate = handleSubmit(processImage);

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-[100dvh]">
        <aside className="w-full lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 sm:p-6 space-y-6">
          <div>
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2 hover:underline">
                Paint by Numbers
              </h1>
            </Link>
            <p className="text-sm text-gray-600">
              Upload an image to generate your printable paint-by-numbers
            </p>
          </div>

          <Card className="p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Image Input</h2>
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentFile={uploadedFile}
            />
          </Card>

          <GeneratorOptions
            form={form}
            disabled={!uploadedFile}
            isProcessing={isProcessing}
            onGenerate={onGenerate}
          />
        </aside>

        <main className="flex-1 flex flex-col min-h-0 bg-gray-50">
          <div className="flex-1 min-h-0 flex items-stretch justify-stretch p-3 sm:p-6 overflow-hidden relative">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                  <p className="text-sm text-gray-600">Processing image...</p>
                </div>
              </div>
            )}

            <CanvasViewer image={previewPng} scene={scene} />
          </div>
        </main>
      </div>
    </div>
  );
}
