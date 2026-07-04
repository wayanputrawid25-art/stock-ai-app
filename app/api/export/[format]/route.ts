import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeAll } from "@/lib/analyzer";
import { toCsv, toPdfBuffer, toXlsxBuffer } from "@/lib/export";

function rowsFromAnalysis(analysis: ReturnType<typeof analyzeAll>) {
  return analysis.hot.flatMap((hotData) =>
    hotData.data.map((row, index) => ({
      position: hotData.position,
      rank: index + 1,
      digit: row.digit,
      count: row.count,
      percentage: row.percentage
    }))
  );
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ format: string }> }) {
  try {
    const user = await requireUser();
    const { format } = await params;
    const snapshotId = new URL(_.nextUrl).searchParams.get("snapshot");
    
    const whereClause = snapshotId 
      ? { userId: user.id, snapshotId }
      : { userId: user.id };
    
    const results = await prisma.result.findMany({
      where: whereClause,
      select: { resultNumber: true, drawDate: true }
    });
    
    const analysis = analyzeAll(results);
    const rows = rowsFromAnalysis(analysis);

    if (format === "csv") {
      return new NextResponse(toCsv(rows), {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": "attachment; filename=prediction-report.csv"
        }
      });
    }

    if (format === "xlsx") {
      const xlsxBuf = await toXlsxBuffer(rows);
      return new NextResponse(new Uint8Array(xlsxBuf), {
        headers: {
          "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": "attachment; filename=prediction-report.xlsx"
        }
      });
    }

    if (format === "pdf") {
      const lines = rows.map(
        (row) => `${row.position} #${row.rank} digit ${row.digit} count ${row.count} (${row.percentage.toFixed(1)}%)`
      );
      const pdfBuf = toPdfBuffer("Frequency Analyzer 4D Pro - Prediction Report", lines);
      return new NextResponse(new Uint8Array(pdfBuf), {
        headers: {
          "content-type": "application/pdf",
          "content-disposition": "attachment; filename=prediction-report.pdf"
        }
      });
    }

    return NextResponse.json({ error: "Unsupported export format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
