"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage: string | null
}

export function ImageUpload({ onImageUpload, currentImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageUpload(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageUpload(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload],
  )

  const handleRemoveImage = () => {
    onImageUpload("")
  }

  return (
    <div>
      {!currentImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"}
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
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Drop your image here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img src={currentImage || "/placeholder.svg"} alt="Uploaded" className="w-full h-32 object-cover" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <Button
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            variant="outline"
            className="w-full text-sm"
          >
            Replace image
          </Button>
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        </div>
      )}
    </div>
  )
}
