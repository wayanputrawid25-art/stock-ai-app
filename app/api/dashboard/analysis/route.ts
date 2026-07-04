import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeAll } from "@/lib/analyzer";

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

    // Get results for this snapshot only
    const results = await prisma.result.findMany({
      where: { userId: user.id, snapshotId },
      orderBy: { drawDate: "desc" },
      select: { resultNumber: true, drawDate: true }
    });

    // Use consolidated analyzer
    const analysis = analyzeAll(results);

    return NextResponse.json({ 
      analysis,
      snapshotId,
      snapshotTitle: snapshot.title,
      totalResults: analysis.totalResults
    });
  } catch (error) {
    console.error("Dashboard analysis error:", error);
    return NextResponse.json({ error: "Failed to get analysis" }, { status: 500 });
  }
}