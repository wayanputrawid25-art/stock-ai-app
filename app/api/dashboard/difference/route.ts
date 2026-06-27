import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get("snapshot");

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

    // Get results for this snapshot only, ordered by draw date ascending (for difference calculation)
    const results = await prisma.result.findMany({
      where: { userId: user.id, snapshotId },
      orderBy: { drawDate: "asc" },
      select: { 
        resultNumber: true, 
        drawDate: true,
        id: true
      }
    });

    return NextResponse.json({ 
      results,
      snapshotId,
      snapshotTitle: snapshot.title,
      totalResults: results.length
    });
  } catch (error) {
    console.error("Difference analysis error:", error);
    return NextResponse.json({ error: "Failed to get results" }, { status: 500 });
  }
}
