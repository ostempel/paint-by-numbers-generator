import { run } from "@/lib/generator/run";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isBlobLike(x: any): x is Blob {
  return x && typeof x === "object" && typeof x.arrayBuffer === "function";
}

const toBool = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1" || v === "on";
  return v;
}, z.boolean());

const toNum = z.preprocess((v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return v;
}, z.number());

const FormSchema = z.object({
  colors: toNum.default(24),
  minArea: toNum.default(60),
  smooth: toNum.default(0.5),
  strokeWidth: toNum.default(1),
  facetIterations: toNum.default(3),
  fontSize: toNum.default(12),
  // defaults for internal options
  showNumbers: toBool.default(true),
  filled: toBool.default(true),
  withPalette: toBool.default(false),
});

export async function POST(req: Request) {
  const form = await req.formData();

  // --- file parsing (keep as-is) ---
  const fileField = form.get("file");
  if (!fileField) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  let buf: Buffer;
  if (isBlobLike(fileField)) {
    buf = Buffer.from(await fileField.arrayBuffer());
  } else if (typeof fileField === "string") {
    const m = fileField.match(/^data:.*?;base64,(.*)$/);
    if (!m) {
      return NextResponse.json(
        { error: "Invalid file field (string but not data URL)" },
        { status: 400 }
      );
    }
    buf = Buffer.from(m[1], "base64");
  } else {
    return NextResponse.json(
      { error: `Invalid file field type: ${typeof fileField}` },
      { status: 400 }
    );
  }

  // --- FormData -> plain object ---
  const raw = Object.fromEntries(form.entries());

  // --- validate + defaults ---
  const parsed = FormSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid params", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const opts = parsed.data;

  const { svg, previewPng, palette } = await run(buf, opts);

  return NextResponse.json({
    svg,
    previewPngBase64: previewPng ? previewPng.toString("base64") : null,
    palette,
  });
}
