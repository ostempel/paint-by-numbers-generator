"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (file: File | null) => void;
  currentFile: File | null;
}

const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export function ImageUpload({ onImageUpload, currentFile }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!currentFile) return null;
    return URL.createObjectURL(currentFile);
  }, [currentFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const acceptFile = useCallback(
    (file?: File) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Image is too large. Maximum size is 4.5 MB.");
        return;
      }

      setError(null);
      onImageUpload(file);
    },
    [onImageUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      acceptFile(e.dataTransfer.files?.[0]);
    },
    [acceptFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      acceptFile(e.target.files?.[0]);
      e.target.value = "";
    },
    [acceptFile],
  );

  const handleRemoveImage = () => onImageUpload(null);

  return (
    <div>
      {!currentFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop your image here
              </p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Max file size: 4.5 MB · JPG, PNG, WebP
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl ?? "/placeholder.svg"}
              alt="Uploaded"
              className="w-full h-32 object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <Button
            onClick={() =>
              document
                .querySelector<HTMLInputElement>('input[type="file"]')
                ?.click()
            }
            variant="outline"
            className="w-full text-sm"
          >
            Replace image
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
