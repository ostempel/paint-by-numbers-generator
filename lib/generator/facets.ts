import { lab, differenceEuclidean, type Lab } from "culori";

export type Facet = {
  id: number;
  colorIndex: number;
  pixels: number[]; // indices into image (y*width+x)
  area: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export function buildFacets(
  indexMap: Uint16Array,
  width: number,
  height: number
): Facet[] {
  const visited = new Uint8Array(width * height);
  const facets: Facet[] = [];
  let id = 0;

  const neighbors = (p: number) => {
    const x = p % width,
      y = (p / width) | 0;
    const out: number[] = [];
    if (x > 0) out.push(p - 1);
    if (x < width - 1) out.push(p + 1);
    if (y > 0) out.push(p - width);
    if (y < height - 1) out.push(p + width);
    return out;
  };

  for (let p = 0; p < width * height; p++) {
    if (visited[p]) continue;
    visited[p] = 1;

    const c = indexMap[p];
    const queue = [p];
    const pixels: number[] = [];

    let minX = p % width,
      maxX = minX;
    let minY = (p / width) | 0,
      maxY = minY;

    while (queue.length) {
      const cur = queue.pop()!;
      pixels.push(cur);

      const x = cur % width,
        y = (cur / width) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      for (const nb of neighbors(cur)) {
        if (visited[nb]) continue;
        if (indexMap[nb] !== c) continue;
        visited[nb] = 1;
        queue.push(nb);
      }
    }

    facets.push({
      id: id++,
      colorIndex: c,
      pixels,
      area: pixels.length,
      minX,
      minY,
      maxX,
      maxY,
    });
  }

  return facets;
}

export function mergeSmallFacets(
  facets: Facet[],
  indexMap: Uint16Array,
  width: number,
  height: number,
  palette: Array<[number, number, number]>,
  minArea: number
): Facet[] {
  const palLab: Lab[] = palette.map(
    ([r, g, b]) => lab({ mode: "rgb", r: r / 255, g: g / 255, b: b / 255 })!
  );

  // ✅ build distance function once
  const distLab = differenceEuclidean("lab");

  const getNeighborColorIndices = (p: number): number[] => {
    const x = p % width,
      y = (p / width) | 0;
    const out: number[] = [];
    const push = (q: number) => out.push(indexMap[q]);
    if (x > 0) push(p - 1);
    if (x < width - 1) push(p + 1);
    if (y > 0) push(p - width);
    if (y < height - 1) push(p + width);
    return out;
  };

  for (const f of facets) {
    if (f.area >= minArea) continue;

    const neighborCounts = new Map<number, number>();
    for (const p of f.pixels) {
      for (const ci of getNeighborColorIndices(p)) {
        if (ci === f.colorIndex) continue;
        neighborCounts.set(ci, (neighborCounts.get(ci) ?? 0) + 1);
      }
    }
    if (neighborCounts.size === 0) continue;

    const srcLab = palLab[f.colorIndex];

    let best = -1;
    let bestScore = -Infinity;

    for (const [ci, count] of neighborCounts) {
      const dstLab = palLab[ci];

      // ✅ number
      const d = distLab(srcLab, dstLab);

      const score = count * 10 - d;
      if (score > bestScore) {
        bestScore = score;
        best = ci;
      }
    }

    if (best >= 0) {
      for (const p of f.pixels) indexMap[p] = best;
    }
  }

  return buildFacets(indexMap, width, height);
}
