import { NextRequest, NextResponse } from "next/server";
import { createWorker, PSM } from "tesseract.js";
import sharp from "sharp";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { extractFourDigitNumbers, cleanOCRText } from "@/lib/ocr-text";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const supported = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/**
 * Preprocess image for 4D OCR
 * Optimized for screenshot images with bold black digits on light background
 * 
 * Pipeline:
 * 1. Grayscale conversion
 * 2. Binary threshold at 20 (captures ONLY very dark/bold pixels)
 * 3. Negate (black text on white background)
 */
async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  const MAX_DIMENSION = 1920;
  
  let image = sharp(buffer, { density: 300 });
  const metadata = await image.metadata();
  
  // Resize if too large (maintain aspect ratio)
  let width = metadata.width || 720;
  let height = metadata.height || 1359;
  
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    image = image.resize(width, height, { kernel: "lanczos3" });
  }
  
  // Grayscale + strict threshold (20) + negate
  // Threshold 20 captures ONLY the boldest/darkest pixels
  // This filters out gray text and noise
  return image
    .grayscale()
    .threshold(20)
    .negate()
    .png()
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const limit = rateLimit(`ocr:${user.id}`, 10, 60_000);
    if (!limit.ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const formData = await request.formData();
    const file = formData.get("file");
    const snapshotId = String(formData.get("snapshotId") || "");
    const drawDate = new Date(String(formData.get("drawDate") || new Date()));

    if (!snapshotId) {
      return NextResponse.json({ error: "Snapshot ID is required" }, { status: 400 });
    }

    // Verify snapshot belongs to user
    const snapshot = await prisma.snapshot.findFirst({
      where: { id: snapshotId, userId: user.id }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found or access denied" }, { status: 404 });
    }

    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!supported.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 400 });

    // Preprocess image (grayscale + threshold 20 + negate for bold-only OCR)
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const preprocessedBuffer = await preprocessImage(originalBuffer);
    
    const base64Image = `data:image/png;base64,${preprocessedBuffer.toString('base64')}`;

    const worker = await createWorker("eng");
    let rawText = "";
    let confidence = 0;

    try {
      // Optimized Tesseract parameters for 4D OCR
      // PSM.SINGLE_BLOCK is best for images with multiple numbers per row
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789 ", // Only digits and spaces
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Best for multiple numbers per image
        preserve_interword_spaces: "1",
        textord_min_xheight: "15",
        textord_max_xheight: "500",
      });
      
      const { data } = await worker.recognize(base64Image);
      rawText = data.text;
      confidence = data.confidence;
    } finally {
      await worker.terminate();
    }

    // Clean OCR text and extract 4D numbers with smart reconstruction
    const cleanedText = cleanOCRText(rawText);
    const numbers = extractFourDigitNumbers(cleanedText);
    
    if (numbers.length > 0) {
      await prisma.result.createMany({
        data: numbers.map((resultNumber) => ({ 
          userId: user.id, 
          snapshotId: snapshotId,
          resultNumber, 
          drawDate 
        })),
        skipDuplicates: true
      });
    }
    await prisma.activityLog.create({ data: { userId: user.id, action: `OCR_SCAN:${numbers.length}:${snapshot.title}` } });

    return NextResponse.json({ 
      numbers, 
      text: cleanedText, 
      rawText,
      confidence,
      extracted: numbers.length,
      snapshot: snapshot.title
    });
  } catch (error) {
    console.error("OCR error:", error);
    const errorMessage = error instanceof Error ? error.message : "OCR processing failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
