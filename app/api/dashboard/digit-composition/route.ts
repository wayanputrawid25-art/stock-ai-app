import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const snapshotId = request.nextUrl.searchParams.get("snapshot");

    if (!snapshotId) {
      return NextResponse.json(
        { error: "Snapshot ID is required" },
        { status: 400 }
      );
    }

    // Verify snapshot belongs to user
    const snapshot = await prisma.snapshot.findFirst({
      where: {
        id: snapshotId,
        userId: user.id,
      },
    });

    if (!snapshot) {
      return NextResponse.json(
        { error: "Snapshot not found" },
        { status: 404 }
      );
    }

    // Get all results for this snapshot
    const results = await prisma.result.findMany({
      where: {
        snapshotId: snapshotId,
      },
      select: {
        resultNumber: true,
      },
      orderBy: {
        drawDate: "asc",
      },
    });

    if (results.length === 0) {
      return NextResponse.json({
        analysis: null,
        summary: {
          totalResults: 0,
        },
      });
    }

    // Analyze digit composition
    const analysis = analyzeDigitComposition(results.map(r => r.resultNumber));

    return NextResponse.json({
      analysis,
      summary: {
        totalResults: results.length,
      },
    });
  } catch (error) {
    console.error("Digit composition analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze digit composition" },
      { status: 500 }
    );
  }
}

interface DigitAnalysis {
  position: string;
  digit: number;
  count: number;
  percentage: number;
}

function analyzeDigitComposition(numbers: string[]) {
  // Even-Odd Balance Analysis
  const evenOddBalance: Record<string, { count: number; percentage: number }> = {};
  const total = numbers.length;

  // Summation Analysis
  const summation: Record<string, { count: number; percentage: number }> = {};

  // Digit Frequency per position
  const digitFrequency: DigitAnalysis[] = [];

  // Initialize counters
  const positions = ["AS", "KOP", "KEPALA", "EKOR"];
  const positionCounts: Record<string, Record<number, number>> = {};
  positions.forEach(p => {
    positionCounts[p] = {};
    for (let d = 0; d <= 9; d++) {
      positionCounts[p][d] = 0;
    }
  });

  // Process each number
  numbers.forEach((num) => {
    if (num.length !== 4) return;

    const digits = num.split("").map(Number);
    let evenCount = 0;
    let oddCount = 0;

    digits.forEach((digit, index) => {
      const position = positions[index];
      positionCounts[position][digit]++;
      
      if (digit % 2 === 0) {
        evenCount++;
      } else {
        oddCount++;
      }
    });

    // Record even-odd balance
    const balanceKey = `${evenCount}-${oddCount}`;
    if (!evenOddBalance[balanceKey]) {
      evenOddBalance[balanceKey] = { count: 0, percentage: 0 };
    }
    evenOddBalance[balanceKey].count++;

    // Calculate summation
    const sum = digits.reduce((a, b) => a + b, 0);
    if (!summation[sum]) {
      summation[sum] = { count: 0, percentage: 0 };
    }
    summation[sum].count++;
  });

  // Calculate percentages
  Object.keys(evenOddBalance).forEach((key) => {
    evenOddBalance[key].percentage = (evenOddBalance[key].count / total) * 100;
  });

  Object.keys(summation).forEach((key) => {
    summation[key].percentage = (summation[key].count / total) * 100;
  });

  // Build digit frequency data
  positions.forEach((position) => {
    Object.entries(positionCounts[position]).forEach(([digit, count]) => {
      if (count > 0) {
        digitFrequency.push({
          position,
          digit: parseInt(digit),
          count,
          percentage: (count / total) * 100,
        });
      }
    });
  });

  return {
    evenOddBalance,
    summation,
    digitFrequency,
  };
}