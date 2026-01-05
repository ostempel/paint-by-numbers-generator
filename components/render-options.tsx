"use client";

import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
} from "./ui/multi-select";

export type RenderSceneOpts = {
  smooth: number;
  filled: boolean;
  outlines: boolean;
  labels: boolean;
  stroke: number;
  labelFontSize: number;
  background: string;
};

type Props = {
  value: RenderSceneOpts;
  onChange: (next: RenderSceneOpts) => void;
};

const LAYERS = [
  { value: "filled", label: "Filled colors" },
  { value: "outlines", label: "Outlines" },
  { value: "labels", label: "Labels" },
] as const;

type LayerKey = (typeof LAYERS)[number]["value"];

function getSelectedLayers(v: RenderSceneOpts): LayerKey[] {
  const out: LayerKey[] = [];
  if (v.filled) out.push("filled");
  if (v.outlines) out.push("outlines");
  if (v.labels) out.push("labels");
  return out;
}

function applySelectedLayers(prev: RenderSceneOpts, selected: string[]) {
  const set = new Set(selected);
  return {
    ...prev,
    filled: set.has("filled"),
    outlines: set.has("outlines"),
    labels: set.has("labels"),
  };
}

export function RenderOptions({ value, onChange }: Props) {
  const selected = getSelectedLayers(value);

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Render options
      </h2>

      <div className="space-y-5">
        {/* Layers multiselect */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Layers</Label>

          <MultiSelect
            values={selected}
            onValuesChange={(vals) =>
              onChange(applySelectedLayers(value, vals))
            }
          >
            <MultiSelectTrigger className="w-full">
              <MultiSelectValue placeholder="Select what to show..." />
            </MultiSelectTrigger>

            <MultiSelectContent>
              <MultiSelectGroup>
                {LAYERS.map((l) => (
                  <MultiSelectItem key={l.value} value={l.value}>
                    {l.label}
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>

          <p className="text-xs text-gray-500">
            Toggle fills, outlines and labels without re-generating.
          </p>
        </div>

        {/* Stroke width */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-gray-700">
              Stroke width
            </Label>
            <span className="text-sm font-medium text-gray-900">
              {value.stroke.toFixed(1)}
            </span>
          </div>

          <Slider
            min={0}
            max={2}
            step={0.1}
            value={[value.stroke]}
            onValueChange={([n]) => onChange({ ...value, stroke: n })}
            className="w-full"
          />

          <p className="text-xs text-gray-500 mt-1">
            Thickness of outlines around regions
          </p>
        </div>

        {/* Label font size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-gray-700">
              Label font size
            </Label>
            <span className="text-sm font-medium text-gray-900">
              {value.labelFontSize}px
            </span>
          </div>

          <Slider
            min={6}
            max={20}
            step={1}
            value={[value.labelFontSize]}
            onValueChange={([n]) => onChange({ ...value, labelFontSize: n })}
            className="w-full"
          />

          <p className="text-xs text-gray-500 mt-1">
            Size of the numbers inside regions
          </p>
        </div>

        {/* Background */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Background
          </Label>

          <div className="flex gap-2 items-center mt-2">
            <Input
              value={value.background}
              onChange={(e) =>
                onChange({ ...value, background: e.target.value })
              }
              placeholder="white or #ffffff"
            />
            <div
              className="h-9 w-9 rounded-md border"
              style={{ background: value.background }}
              title={value.background}
            />
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Any valid CSS color (e.g. white, #fff, rgb(...))
          </p>
        </div>
      </div>
    </Card>
  );
}
