import { RenderSceneOpts } from "@/components/render-options";
import { Scene } from "./generator/generator";

export type OutlineMode = "off" | "black" | "colored";

function paletteToCssMap(scene: Scene): Map<number, string> {
  const m = new Map<number, string>();

  for (const p of scene.palette) {
    if (Array.isArray(p.rgb)) {
      m.set(p.id, p.rgb);
    } else if (typeof p.rgb === "string") {
      m.set(p.id, p.rgb);
    } else if (p.color) {
      m.set(p.id, p.color);
    }
  }

  return m;
}

export function renderSceneSvg(scene: Scene, opts: RenderSceneOpts): string {
  const bg = opts.background ?? "white";
  const pal = paletteToCssMap(scene);

  // 1) Fills
  const fills: string[] = [];
  if (opts.filled) {
    for (const r of scene.regions) {
      if (!r.fill?.d) continue;
      const fill = pal.get(r.colorId) ?? "white";
      fills.push(
        `<path d="${r.fill.d}" fill="${fill}" stroke="none" fill-rule="evenodd" />`
      );
    }
  }

  // 2) Outlines
  let outlines = "";

  // Use global outline if available (best quality, no double edges)
  if (opts.outlines) {
    if (scene.outline?.d) {
      outlines = `<path d="${scene.outline.d}"
          fill="none"
          stroke="black"
          stroke-width="${opts.stroke}"
          stroke-linecap="round"
          stroke-linejoin="round" />`;
    } else {
      // fallback: use per-region outlines (will double-draw shared edges)
      const parts: string[] = [];
      for (const r of scene.regions) {
        if (!r.outline?.d) continue;
        parts.push(
          `<path d="${r.outline.d}"
              fill="none"
              stroke="black"
              stroke-width="${opts.stroke}"
              stroke-linecap="round"
              stroke-linejoin="round" />`
        );
      }
      outlines = parts.join("\n");
    }
  }

  // 3) Labels
  const labels: string[] = [];
  if (opts.labels) {
    for (const r of scene.regions) {
      if (!r.label) continue;
      labels.push(
        `<text x="${r.label.x}" y="${r.label.y}"
          font-size="${opts.labelFontSize}"
          text-anchor="middle"
          dominant-baseline="central"
          fill="black">${r.colorId}</text>`
      );
    }
  }

  // 4) SVG wrapper
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${scene.width}" height="${scene.height}"
     viewBox="0 0 ${scene.width} ${scene.height}">
  <rect x="0" y="0" width="${scene.width}" height="${
    scene.height
  }" fill="${bg}" />
  ${fills.join("\n  ")}
  ${outlines}
  ${labels.join("\n  ")}
</svg>`;
}
