export type SvgOpts = {
  stroke: number;
  labels: boolean;
  labelFontSize: number;
  withPalette: boolean;
  filled?: boolean; // ✅ NEW: render painted preview (vector fills)
};

type Pt = { x: number; y: number };
type Key = string;

const k = (x: number, y: number): Key => `${x},${y}`;
const unk = (s: Key): Pt => {
  const [x, y] = s.split(",").map(Number);
  return { x, y };
};
const ekey = (a: Key, b: Key) => (a < b ? `${a}|${b}` : `${b}|${a}`);

// 1) Topologie-sichere Vereinfachung: nur kollineare Punkte entfernen
function removeCollinear(pts: Pt[]): Pt[] {
  if (pts.length < 3) return pts;
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = out[out.length - 1];
    const b = pts[i];
    const c = pts[i + 1];

    const dx1 = Math.sign(b.x - a.x);
    const dy1 = Math.sign(b.y - a.y);
    const dx2 = Math.sign(c.x - b.x);
    const dy2 = Math.sign(c.y - b.y);

    // if direction doesn't change, b is redundant
    if (dx1 === dx2 && dy1 === dy2) continue;
    out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// 2) Optional: lokale Rundung ohne Abkürzen durch andere Regionen
// macht aus L-L-Knick kleine Q-Kurve.
// radius in "pixel units" (0.4 - 1.2 ist meist gut)
function roundedPath(pts: Pt[], radius = 0.6, closed = false): string {
  if (pts.length < 2) return "";

  const r = Math.max(0, radius);
  const get = (i: number) => pts[(i + pts.length) % pts.length];

  const d: string[] = [];
  d.push(`M${pts[0].x},${pts[0].y}`);

  const lastIndex = closed ? pts.length : pts.length - 1;

  for (let i = 1; i < lastIndex; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);

    const v1x = p1.x - p0.x;
    const v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x;
    const v2y = p2.y - p1.y;

    const len1 = Math.hypot(v1x, v1y) || 1;
    const len2 = Math.hypot(v2x, v2y) || 1;

    // clamp radius so we don't overshoot
    const rr = Math.min(r, len1 * 0.45, len2 * 0.45);

    const p1a = { x: p1.x - (v1x / len1) * rr, y: p1.y - (v1y / len1) * rr };
    const p1b = { x: p1.x + (v2x / len2) * rr, y: p1.y + (v2y / len2) * rr };

    d.push(`L${p1a.x},${p1a.y}`);
    d.push(`Q${p1.x},${p1.y} ${p1b.x},${p1b.y}`);

    // for open paths we don't handle the last corner here
    if (!closed && i === pts.length - 2) {
      d.push(`L${pts[pts.length - 1].x},${pts[pts.length - 1].y}`);
    }
  }

  if (closed) d.push("Z");
  return d.join(" ");
}

// 3) Stitchen: Aus einzelnen Grid-Kanten werden Polylines (Borders)
function buildBorderPolylines(
  idAt: Int32Array,
  width: number,
  height: number
): Pt[][] {
  const adj = new Map<Key, Key[]>();

  const addEdge = (a: Key, b: Key) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  };

  // Boundary edges (nur rechts/unten, damit keine Doppelkanten)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const id = idAt[p];

      if (x < width - 1 && idAt[p + 1] !== id) {
        addEdge(k(x + 1, y), k(x + 1, y + 1));
      }
      if (y < height - 1 && idAt[p + width] !== id) {
        addEdge(k(x, y + 1), k(x + 1, y + 1));
      }
    }
  }

  const used = new Set<string>();
  const polylines: Pt[][] = [];

  const neighbors = (v: Key) => adj.get(v) ?? [];
  const unusedNeighbors = (v: Key) =>
    neighbors(v).filter((nb) => !used.has(ekey(v, nb)));

  // Startpunkte: erst endpoints/junctions (grad != 2), dann loops
  const nodes = Array.from(adj.keys());
  const isBranch = (v: Key) => neighbors(v).length !== 2;

  const trace = (start: Key): Pt[] => {
    const pts: Pt[] = [];
    let cur = start;
    let prev: Key | null = null;

    pts.push(unk(cur));

    while (true) {
      const cands = unusedNeighbors(cur);
      if (cands.length === 0) break;

      let next = cands[0];
      if (prev && cands.length > 1) {
        const notBack = cands.find((c) => c !== prev);
        if (notBack) next = notBack;
      }

      used.add(ekey(cur, next));
      prev = cur;
      cur = next;
      pts.push(unk(cur));

      if (cur === start) break; // closed loop
    }

    return pts;
  };

  // Pass 1: start at branch/end nodes
  for (const v of nodes) {
    if (!isBranch(v)) continue;
    while (unusedNeighbors(v).length) {
      const pts = trace(v);
      if (pts.length >= 2) polylines.push(pts);
    }
  }

  // Pass 2: remaining loops
  for (const v of nodes) {
    while (unusedNeighbors(v).length) {
      const pts = trace(v);
      if (pts.length >= 2) polylines.push(pts);
    }
  }

  return polylines;
}

type LabelPoint = { x: number; y: number; dist: number };

function findLabelPoint(
  facet: { id: number; minX: number; minY: number; maxX: number; maxY: number },
  idAt: Int32Array,
  width: number,
  height: number
): LabelPoint | null {
  const x0 = facet.minX,
    y0 = facet.minY,
    x1 = facet.maxX,
    y1 = facet.maxY;
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  if (w <= 0 || h <= 0) return null;

  const idx = (lx: number, ly: number) => ly * w + lx;

  const dist = new Int16Array(w * h);
  dist.fill(-1);

  const qx = new Int16Array(w * h);
  const qy = new Int16Array(w * h);
  let qh = 0,
    qt = 0;

  const inFacet = (gx: number, gy: number) =>
    gx >= 0 &&
    gy >= 0 &&
    gx < width &&
    gy < height &&
    idAt[gy * width + gx] === facet.id;

  for (let gy = y0; gy <= y1; gy++) {
    for (let gx = x0; gx <= x1; gx++) {
      if (!inFacet(gx, gy)) continue;

      const lx = gx - x0;
      const ly = gy - y0;

      const border =
        !inFacet(gx - 1, gy) ||
        !inFacet(gx + 1, gy) ||
        !inFacet(gx, gy - 1) ||
        !inFacet(gx, gy + 1);

      dist[idx(lx, ly)] = border ? 0 : 32767;

      if (border) {
        qx[qt] = lx;
        qy[qt] = ly;
        qt++;
      }
    }
  }

  if (qt === 0) return null;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  while (qh < qt) {
    const cx = qx[qh];
    const cy = qy[qh];
    qh++;

    const cd = dist[idx(cx, cy)];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

      const di = idx(nx, ny);
      if (dist[di] < 0) continue;
      if (dist[di] !== 32767) continue;

      dist[di] = cd + 1;
      qx[qt] = nx;
      qy[qt] = ny;
      qt++;
    }
  }

  let bestX = -1,
    bestY = -1,
    bestD = -1;
  for (let ly = 0; ly < h; ly++) {
    for (let lx = 0; lx < w; lx++) {
      const d = dist[idx(lx, ly)];
      if (d > bestD && d !== 32767) {
        bestD = d;
        bestX = lx;
        bestY = ly;
      }
    }
  }

  if (bestD < 0) return null;
  return { x: x0 + bestX + 0.5, y: y0 + bestY + 0.5, dist: bestD };
}

// ---------------------------
// NEW: Facet fills as vector loops (perfect painted preview)
// ---------------------------
type Loop = Pt[];

function buildFacetLoopsBBox(
  facet: { id: number; minX: number; minY: number; maxX: number; maxY: number },
  idAt: Int32Array,
  width: number,
  height: number
): Loop[] {
  const out = new Map<Key, Key[]>(); // directed edges
  const used = new Set<string>();

  const pushEdge = (ax: number, ay: number, bx: number, by: number) => {
    const a = k(ax, ay);
    const b = k(bx, by);
    if (!out.has(a)) out.set(a, []);
    out.get(a)!.push(b);
  };

  const inside = (x: number, y: number) =>
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height &&
    idAt[y * width + x] === facet.id;

  // Scan only bbox (fast)
  for (let y = facet.minY; y <= facet.maxY; y++) {
    for (let x = facet.minX; x <= facet.maxX; x++) {
      if (!inside(x, y)) continue;

      // We add directed edges around the pixel cell (x,y) if neighbor is outside.
      // Orientation chosen so boundaries form closed loops.
      if (!inside(x - 1, y)) pushEdge(x, y, x, y + 1); // left edge downward
      if (!inside(x + 1, y)) pushEdge(x + 1, y + 1, x + 1, y); // right edge upward
      if (!inside(x, y - 1)) pushEdge(x + 1, y, x, y); // top edge leftward
      if (!inside(x, y + 1)) pushEdge(x, y + 1, x + 1, y + 1); // bottom edge rightward
    }
  }

  const loops: Loop[] = [];

  for (const [start, tos] of out.entries()) {
    for (const firstTo of tos) {
      const first = `${start}|${firstTo}`;
      if (used.has(first)) continue;

      const loop: Loop = [];
      let cur = start;
      let next = firstTo;

      loop.push(unk(cur));

      while (true) {
        used.add(`${cur}|${next}`);
        cur = next;
        loop.push(unk(cur));

        if (cur === start) break;

        const nbs = out.get(cur);
        if (!nbs || nbs.length === 0) break;

        // choose any unused outgoing directed edge
        let chosen: Key | null = null;
        for (const cand of nbs) {
          if (!used.has(`${cur}|${cand}`)) {
            chosen = cand;
            break;
          }
        }
        if (!chosen) break;
        next = chosen;
      }

      // drop duplicate last point if it closes (we'll close with Z)
      if (loop.length >= 2) {
        const a = loop[0];
        const b = loop[loop.length - 1];
        if (a.x === b.x && a.y === b.y) loop.pop();
      }

      if (loop.length >= 3) loops.push(loop);
    }
  }

  return loops;
}

export function facetsToSvg(
  facets: Array<{
    id: number;
    colorIndex: number;
    pixels: number[];
    area: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }>,
  width: number,
  height: number,
  palette: Array<[number, number, number]>,
  opts: SvgOpts
): string {
  // ---------------------------
  // 0) idAt map (used by fills, borders, labels)
  // ---------------------------
  const idAt = new Int32Array(width * height).fill(-1);
  for (const f of facets) for (const p of f.pixels) idAt[p] = f.id;

  // ---------------------------
  // 1) Painted fills (vector) – optional
  // ---------------------------
  const fillParts: string[] = [];
  if (opts.filled) {
    for (const f of facets) {
      const loops = buildFacetLoopsBBox(f, idAt, width, height);
      if (!loops.length) continue;

      const [r, g, b] = palette[f.colorIndex] ?? [255, 255, 255];
      const fill = `rgb(${r},${g},${b})`;

      // For perfect match with outlines, we can also round the fill loops.
      // Use the SAME radius as borders so they align visually.
      const radius = 0.6;

      const d = loops
        .map((loop) => {
          const cleaned = removeCollinear(loop);
          return roundedPath(cleaned, radius, true);
        })
        .join(" ");

      fillParts.push(
        `<path d="${d}" fill="${fill}" stroke="none" fill-rule="evenodd"/>`
      );
    }
  }

  // ---------------------------
  // 2) Borders: stitched + safe smoothing
  // ---------------------------
  const polylines = buildBorderPolylines(idAt, width, height);

  const borderPaths: string[] = [];
  for (const pts of polylines) {
    const cleaned = removeCollinear(pts);

    const closed =
      cleaned.length > 3 &&
      cleaned[0].x === cleaned[cleaned.length - 1].x &&
      cleaned[0].y === cleaned[cleaned.length - 1].y;

    const ring = closed ? cleaned.slice(0, -1) : cleaned;
    const d = roundedPath(ring, 0.6, closed);
    if (d) borderPaths.push(d);
  }

  // ---------------------------
  // 3) Labels (inside facet via distance transform)
  // ---------------------------
  const labelParts: string[] = [];
  if (opts.labels) {
    for (const f of facets) {
      if (f.area < 80) continue;

      const p = findLabelPoint(f, idAt, width, height);
      if (!p) continue;
      if (p.dist < 2) continue;

      const label = String(f.colorIndex + 1);
      labelParts.push(
        `<text x="${p.x}" y="${p.y}" font-size="${opts.labelFontSize}" text-anchor="middle" dominant-baseline="central">${label}</text>`
      );
    }
  }

  // ---------------------------
  // 4) Legend (below image)
  // ---------------------------
  const legendX = 10;
  const legendY0 = height + 20;
  const legendRowH = 18;

  const legend = palette
    .map(([r, g, b], i) => {
      const y = legendY0 + i * legendRowH;
      const fill = `rgb(${r},${g},${b})`;
      return `
  <rect x="${legendX}" y="${
        y - 10
      }" width="12" height="12" fill="${fill}" stroke="black" stroke-width="0.5"/>
  <text x="${
    legendX + 18
  }" y="${y}" font-size="12" dominant-baseline="central">${
        i + 1
      } ${fill}</text>`;
    })
    .join("");

  let svgHeight = height;
  if (opts.withPalette) {
    svgHeight = height + 30 + palette.length * legendRowH;
  }

  // ---------------------------
  // 5) Final SVG
  // ---------------------------
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${svgHeight}" viewBox="0 0 ${width} ${svgHeight}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="white"/>
  ${opts.filled ? fillParts.join("\n  ") : ""}
  <path d="${borderPaths.join(" ")}"
        fill="none"
        stroke="black"
        stroke-width="${opts.stroke}"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  ${labelParts.join("\n  ")}
  ${opts.withPalette ? legend : ""}
</svg>`;
}
