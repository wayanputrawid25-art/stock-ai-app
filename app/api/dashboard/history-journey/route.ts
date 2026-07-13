import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { 
  analyzeHistoryJourney,
  Position,
  OrderDepth,
  TrainingSize
} from "@/lib/history-journey";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get("snapshot");
    const position = searchParams.get("position") as Position;
    const orderDepth = parseInt(searchParams.get("orderDepth") || "1") as OrderDepth;
    const trainingSize = searchParams.get("trainingSize") as TrainingSize;

    if (!snapshotId) {
      return NextResponse.json({ error: "Snapshot ID is required" }, { status: 400 });
    }

    // Validate position
    const validPositions: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];
    if (!validPositions.includes(position)) {
      return NextResponse.json({ error: "Invalid position" }, { status: 400 });
    }

    // Validate order depth
    if (![1, 2, 3].includes(orderDepth)) {
      return NextResponse.json({ error: "Invalid order depth" }, { status: 400 });
    }

    // Verify snapshot belongs to user
    const snapshot = await prisma.snapshot.findFirst({
      where: { id: snapshotId, userId: user.id }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found or access denied" }, { status: 404 });
    }

    // Get results for this snapshot
    const results = await prisma.result.findMany({
      where: { userId: user.id, snapshotId },
      orderBy: { drawDate: "desc" },
      select: { resultNumber: true, drawDate: true }
    });

    if (results.length === 0) {
      return NextResponse.json({ error: "No results found in snapshot" }, { status: 400 });
    }

    // Run History Journey analysis
    const analysis = analyzeHistoryJourney(
      results,
      position,
      orderDepth,
      trainingSize || "all"
    );

    return NextResponse.json({
      analysis,
      snapshotId,
      snapshotTitle: snapshot.title,
      totalResults: results.length
    });
  } catch (error) {
    console.error("History Journey analysis error:", error);
    return NextResponse.json({ error: "Failed to run History Journey analysis" }, { status: 500 });
  }
}
