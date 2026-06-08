import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractValid4D } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    
    const body = await request.json();
    const { drawDate, raw } = body;

    if (!drawDate || !raw) {
      return NextResponse.json({ error: "Draw date and results are required" }, { status: 400 });
    }

    const numbers = extractValid4D(raw);
    if (numbers.length === 0) {
      return NextResponse.json({ error: "No valid 4-digit numbers found" }, { status: 400 });
    }

    const result = await prisma.result.createMany({
      data: numbers.map((resultNumber) => ({ 
        userId: user.id, 
        resultNumber, 
        drawDate: new Date(drawDate) 
      })),
      skipDuplicates: true
    });

    await prisma.activityLog.create({ 
      data: { 
        userId: user.id, 
        action: `RESULT_INPUT:${numbers.length}` 
      } 
    });

    return NextResponse.json({ 
      success: true, 
      count: numbers.length,
      message: `Saved ${numbers.length} numbers successfully` 
    });
  } catch (error) {
    console.error("Save results error:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}
