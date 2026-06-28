import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeSum } from "@/lib/sum-analysis";

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

    const totalResults = results.length;
    const analysis = totalResults > 0
      ? { ...analyzeSum(results), totalResults }
      : { ...analyzeSum([]), totalResults: 0 };

    return NextResponse.json({
      analysis,
      snapshotId,
      snapshotTitle: snapshot.title,
      totalResults
    });
  } catch (error) {
    console.error("SUM analysis error:", error);
    return NextResponse.json({ error: "Failed to get SUM analysis" }, { status: 500 });
  }
}
