import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractValid4D } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    
    const body = await request.json();
    const { snapshotId, drawDate, raw } = body;

    if (!snapshotId) {
      return NextResponse.json({ error: "Snapshot is required" }, { status: 400 });
    }

    if (!drawDate || !raw) {
      return NextResponse.json({ error: "Draw date and results are required" }, { status: 400 });
    }

    // Verify snapshot belongs to user
    const snapshot = await prisma.snapshot.findFirst({
      where: { id: snapshotId, userId: user.id }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found or access denied" }, { status: 404 });
    }

    const numbers = extractValid4D(raw);
    if (numbers.length === 0) {
      return NextResponse.json({ error: "No valid 4-digit numbers found" }, { status: 400 });
    }

    const result = await prisma.result.createMany({
      data: numbers.map((resultNumber) => ({ 
        userId: user.id,
        snapshotId: snapshotId, 
        resultNumber, 
        drawDate: new Date(drawDate) 
      })),
      skipDuplicates: true
    });

    await prisma.activityLog.create({ 
      data: { 
        userId: user.id, 
        action: `RESULT_INPUT:${numbers.length}:${snapshot.title}` 
      } 
    });

    return NextResponse.json({ 
      success: true, 
      count: numbers.length,
      snapshot: snapshot.title,
      message: `Saved ${numbers.length} numbers to "${snapshot.title}"` 
    });
  } catch (error) {
    console.error("Save results error:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}
