import { applyPaletteSync, buildPaletteSync, utils } from "image-q";

type QuantizeResult = {
  indexMap: Uint16Array;
  palette: Array<[number, number, number]>;
};

export function quantizeImage(
  rgb: Buffer,
  width: number,
  height: number,
  colors: number,
  opts?: { dither?: boolean }
): QuantizeResult {
  const pc = utils.PointContainer.fromUint8Array(
    new Uint8Array(rgb),
    width,
    height
  );

  const palette = buildPaletteSync([pc], {
    colorDistanceFormula: "euclidean",
    paletteQuantization: "neuquant",
    colors,
  });

  const outPointContainer = applyPaletteSync(pc, palette, {
    colorDistanceFormula: "euclidean",
    imageQuantization: opts?.dither ? "floyd-steinberg" : "nearest",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pal = palette.getPointContainer().getPointArray() as any[];

  const key = (r: number, g: number, b: number) => (r << 16) | (g << 8) | b;
  const map = new Map<number, number>();
  for (let i = 0; i < pal.length; i++) {
    const p = pal[i];
    map.set(key(p.r, p.g, p.b), i);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outPts = outPointContainer.getPointArray() as any[];
  const indexMap = new Uint16Array(width * height);
  for (let i = 0; i < outPts.length; i++) {
    const p = outPts[i];
    indexMap[i] = map.get(key(p.r, p.g, p.b)) ?? 0;
  }

  return {
    indexMap,
    palette: pal.map((p) => [p.r, p.g, p.b] as [number, number, number]),
  };
}
