import { generateScene } from "@/lib/generator/generator";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isBlobLike(x: any): x is Blob {
  return x && typeof x === "object" && typeof x.arrayBuffer === "function";
}

const toNum = z.preprocess((v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return v;
}, z.number());

const FormSchema = z.object({
  colors: toNum.default(24),
  minArea: toNum.default(60),
  facetIterations: toNum.default(3),
  radius: toNum.default(1),
});

export async function POST(req: Request) {
  const form = await req.formData();

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

  const raw = Object.fromEntries(form.entries());

  const parsed = FormSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid params", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const opts = parsed.data;

  const { scene } = await generateScene(buf, opts);

  return NextResponse.json({
    scene,
  });
}
