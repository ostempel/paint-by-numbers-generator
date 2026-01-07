"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { GeneratorFormValues } from "@/app/editor/page"; // <- Pfad ggf. anpassen

type GeneratorOptionsProps = {
  form: UseFormReturn<GeneratorFormValues>;
  disabled?: boolean;
  isProcessing?: boolean;
  onGenerate: () => void;
};

export function GeneratorOptions({
  form,
  disabled,
  isProcessing,
  onGenerate,
}: GeneratorOptionsProps) {
  const { watch, setValue } = form;
  const values = watch();

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">Settings</h2>

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
          <p className="text-xs text-gray-500 mt-1">Merge smaller regions</p>
        </div>

        {/* facet iterations */}
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
            className="w-full bg-primary-gradient text-white hover:opacity-90"
            variant="secondary"
            disabled={disabled || isProcessing}
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
  );
}
