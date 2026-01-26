import sharp from "sharp";
import { quantizeImage } from "./quantize";
import { buildFacets, mergeSmallFacets } from "./facets";
import { facetsToScene } from "./svg";

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
  fill: { d: string };
  outline: { d: string };
  region: { d: string };
  label: { x?: number; y?: number; r?: number };
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
  const img = sharp(inputImage).rotate();
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
    `4. 🔀 Merging small facets (< ${opts.minArea} px) with ${opts.facetIterations} iterations...`,
  );
  let merged = facets;
  for (let i = 0; i < opts.facetIterations; i++) {
    merged = mergeSmallFacets(
      merged,
      indexMap,
      width,
      height,
      palette,
      opts.minArea,
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
