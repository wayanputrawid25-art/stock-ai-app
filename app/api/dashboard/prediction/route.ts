import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeHistoricalData, ResultRecord } from "@/lib/historical-analysis";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/prediction
 * 
 * Query Parameters:
 * - snapshot: Snapshot ID to analyze
 * 
 * Returns:
 * - Historical analysis with predictions in JSON format
 */
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

    // Get results for this snapshot
    const results = await prisma.result.findMany({
      where: { userId: user.id, snapshotId },
      orderBy: { drawDate: "desc" },
      select: { resultNumber: true, drawDate: true }
    });

    // Convert to ResultRecord format
    const records: ResultRecord[] = results.map((r) => ({
      resultNumber: r.resultNumber,
      drawDate: r.drawDate,
    }));

    // Perform historical analysis
    const analysis = analyzeHistoricalData(records);

    // Save analysis to history
    await prisma.analysisHistory.create({
      data: {
        userId: user.id,
        snapshotId,
        analysisType: "historical",
        resultJson: JSON.parse(JSON.stringify(analysis)),
      },
    });

    return NextResponse.json({
      success: true,
      snapshotId,
      snapshotTitle: snapshot.title,
      analysis,
    });
  } catch (error) {
    console.error("Prediction analysis error:", error);
    return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 });
  }
}

/**
 * POST /api/dashboard/prediction
 * 
 * Body: JSON array of result numbers
 * 
 * Example:
 * {
 *   "results": ["4821", "9375", "1208", ...]
 * }
 * 
 * Returns:
 * - Historical analysis with predictions in JSON format
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { results } = body;

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "Results array is required" }, { status: 400 });
    }

    // Validate results
    const validResults = results.filter((r: unknown) => 
      typeof r === "string" && /^\d{4}$/.test(r)
    );

    if (validResults.length === 0) {
      return NextResponse.json({ error: "At least one valid 4-digit result is required" }, { status: 400 });
    }

    // Create records with current date
    const records: ResultRecord[] = validResults.map((result: string, index: number) => ({
      resultNumber: result,
      drawDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Space 1 day apart
    }));

    // Perform historical analysis
    const analysis = analyzeHistoricalData(records);

    return NextResponse.json({
      success: true,
      totalResults: validResults.length,
      analysis,
    });
  } catch (error) {
    console.error("Prediction analysis error:", error);
    return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 });
  }
}
