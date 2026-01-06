import sharp from "sharp";
import { optimize } from "svgo";
import { quantizeImage } from "./quantize";
import { buildFacets, mergeSmallFacets } from "./facets";
import { facetsToScene, facetsToSvg } from "./svg";

export type RunConfig = {
  facetIterations: number;
  colors: number;
  minArea: number;
  smooth: number;
  strokeWidth: number;
  showNumbers: boolean;
  fontSize: number;
  filled: boolean;
  withPalette: boolean;
};

export type PaletteEntry = {
  number: number;
  color: string;
  rgb: string;
};

export type RunResult = {
  svg: string;
  previewPng?: Buffer;
  palette?: PaletteEntry[];
};

function toHex2(n: number) {
  return n.toString(16).padStart(2, "0");
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase();
}

export async function generateSvg(
  inputImage: Buffer,
  opts: RunConfig
): Promise<RunResult> {
  // 1) load + resize + raw pixels
  console.log(`1. 🖼  Processing image buffer...`);
  const img = sharp(inputImage).rotate(); // respect EXIF
  const meta = await img.metadata();
  if (!meta.width || !meta.height)
    throw new Error("Cannot read image metadata.");

  const resized = img
    .resize({ withoutEnlargement: true })
    .blur(1.2)
    .sharpen(0.2);

  const { data, info } = await resized
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // 2) quantize => indexed pixels + palette
  console.log(`2. 🎨 Quantizing to ${opts.colors} colors...`);
  const { indexMap, palette } = quantizeImage(data, width, height, opts.colors);

  const paletteMap = palette.map(([r, g, b], i) => ({
    number: i + 1,
    color: rgbToHex(r, g, b),
    rgb: `rgb(${r},${g},${b})`,
  }));

  // 3) facets (connected components on indexMap)
  console.log(`3. 🔷 Building facets...`);
  const facets = buildFacets(indexMap, width, height);

  // 4) merge small facets
  console.log(
    `4. 🔀 Merging small facets (< ${opts.minArea} px) with ${opts.facetIterations} iterations...`
  );
  let merged = facets;
  for (let i = 0; i < opts.facetIterations; i++) {
    merged = mergeSmallFacets(
      merged,
      indexMap,
      width,
      height,
      palette,
      opts.minArea
    );
  }

  // 5) SVG output
  console.log(
    `5. 📝 Generating SVG (${opts.showNumbers}, ${opts.fontSize})...`
  );
  const svg = facetsToSvg(merged, width, height, palette, {
    stroke: opts.strokeWidth,
    labels: opts.showNumbers,
    labelFontSize: opts.fontSize,
    withPalette: opts.withPalette,
    filled: true,
  });

  // 6) optimize svg
  const optimized = optimize(svg, {
    multipass: true,
    plugins: ["preset-default"],
  }).data;

  console.log(`6. 🖼  Rendering PNG preview from SVG...`);
  const previewPng = await sharp(Buffer.from(optimized))
    .png({
      compressionLevel: 0,
      adaptiveFiltering: true,
    })
    .toBuffer();

  return { svg: optimized, previewPng, palette: paletteMap };
}

export type Scene = {
  width: number;
  height: number;
  palette: Array<{
    id: number; // 1-based
    color: string;
    rgb: string;
  }>;
  outline: { d: string };
  regions: SceneRegion[];
};

export type SceneRegion = {
  id: number;
  colorId: number; // palette id 1-based
  area: number;
  fill: { d: string }; // evenodd
  outline: { d: string };
  region: { d: string };
  label: { x: number; y: number; r?: number };
};

export type SceneOptions = {
  radius: number;
  colors: number;
  minArea: number;
  facetIterations: number;

  //TODO
  //minLabelArea: number;
  //minLabelDist: number;
};

export async function generateScene(inputImage: Buffer, opts: SceneOptions) {
  // 1) load + resize + raw pixels
  console.log(`1. 🖼  Processing image buffer...`);
  const img = sharp(inputImage).rotate(); // respect EXIF
  const meta = await img.metadata();
  if (!meta.width || !meta.height)
    throw new Error("Cannot read image metadata.");

  const resized = img
    .resize({ withoutEnlargement: true })
    .blur(1.2)
    .sharpen(0.2);

  const { data, info } = await resized
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // 2) quantize => indexed pixels + palette
  console.log(`2. 🎨 Quantizing to ${opts.colors} colors...`);
  const { indexMap, palette } = quantizeImage(data, width, height, opts.colors);

  // 3) facets (connected components on indexMap)
  console.log(`3. 🔷 Building facets...`);
  const facets = buildFacets(indexMap, width, height);

  // 4) merge small facets
  console.log(
    `4. 🔀 Merging small facets (< ${opts.minArea} px) with ${opts.facetIterations} iterations...`
  );
  let merged = facets;
  for (let i = 0; i < opts.facetIterations; i++) {
    merged = mergeSmallFacets(
      merged,
      indexMap,
      width,
      height,
      palette,
      opts.minArea
    );
  }

  // 5) SVG output
  console.log(`5. 📝 Generating Scene`);
  const scene = facetsToScene(merged, width, height, palette, {
    radius: opts.radius,
    minLabelArea: 80,
    minLabelDist: 2,
  });

  return { scene };
}
