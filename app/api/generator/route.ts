import { generateScene } from "@/lib/generator/generator";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Missing or invalid file" },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());

  const raw = Object.fromEntries(form.entries());
  const parsed = FormSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid params", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { scene } = await generateScene(buf, parsed.data);

  return NextResponse.json({ scene });
}
