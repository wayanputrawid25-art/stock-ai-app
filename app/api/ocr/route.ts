import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { extractValid4D } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const supported = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const limit = rateLimit(`ocr:${user.id}`, 10, 60_000);
    if (!limit.ok) return NextResponse.json({ error: "OCR rate limit exceeded" }, { status: 429 });

    const formData = await request.formData();
    const file = formData.get("file");
    const drawDate = new Date(String(formData.get("drawDate") || new Date()));

    if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
    if (!supported.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File must be 10MB or smaller" }, { status: 400 });

    const worker = await createWorker("eng");
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data } = await worker.recognize(buffer);
    await worker.terminate();

    const numbers = extractValid4D(data.text);
    if (numbers.length > 0) {
      await prisma.result.createMany({
        data: numbers.map((resultNumber) => ({ userId: user.id, resultNumber, drawDate })),
        skipDuplicates: true
      });
    }
    await prisma.activityLog.create({ data: { userId: user.id, action: `OCR_SCAN:${numbers.length}` } });

    return NextResponse.json({ numbers, text: data.text });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "OCR processing failed" }, { status: 500 });
  }
}
