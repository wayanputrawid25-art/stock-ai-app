import { NextRequest, NextResponse } from "next/server";
import { createWorker, PSM } from "tesseract.js";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { extractValid4D } from "@/lib/validation";
import { normalizeOCRDigits } from "@/lib/ocr-text";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const supported = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const limit = rateLimit(`ocr:${user.id}`, 10, 60_000);
    if (!limit.ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const formData = await request.formData();
    const file = formData.get("file");
    const drawDate = new Date(String(formData.get("drawDate") || new Date()));

    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!supported.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    const worker = await createWorker("eng");
    let normalizedText = "";
    let rawText = "";
    let confidence = 0;

    try {
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789",
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        preserve_interword_spaces: "1",
        tessedit_image_baseline: "0.0",
        textord_min_xheight: "10",
        textord_max_xheight: "300",
      });
      
      const { data } = await worker.recognize(base64Image);
      rawText = data.text;
      confidence = data.confidence;
      normalizedText = normalizeOCRDigits(data.text);
    } finally {
      await worker.terminate();
    }

    const numbers = extractValid4D(normalizedText);
    if (numbers.length > 0) {
      await prisma.result.createMany({
        data: numbers.map((resultNumber) => ({ userId: user.id, resultNumber, drawDate })),
        skipDuplicates: true
      });
    }
    await prisma.activityLog.create({ data: { userId: user.id, action: `OCR_SCAN:${numbers.length}` } });

    return NextResponse.json({ 
      numbers, 
      text: normalizedText, 
      rawText,
      confidence,
      extracted: numbers.length
    });
  } catch (error) {
    console.error("OCR error:", error);
    const errorMessage = error instanceof Error ? error.message : "OCR processing failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
