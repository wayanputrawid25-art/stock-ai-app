import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";
import { LoadingState } from "@/components/LoadingState";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getDictionary();
  
  // Get all snapshots with counts
  const snapshots = await prisma.snapshot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { results: true }
      }
    }
  });

  // Labels for client component
  const labels = {
    title: t.dashboard.title,
    results: t.dashboard.results,
    top: t.dashboard.top,
    low: t.dashboard.low,
    predictionLeader: t.dashboard.predictionLeader,
    exportCsv: t.dashboard.exportCsv,
    exportExcel: t.dashboard.exportExcel,
    exportPdf: t.dashboard.exportPdf,
    rank: t.dashboard.rank,
    digit: t.dashboard.digit,
    score: t.dashboard.score,
    confidence: t.dashboard.confidence,
    predictionTop: t.dashboard.predictionTop,
    saveSnapshot: t.dashboard.saveSnapshot,
    inputData: "Input Data",
    scanOcr: "Scan OCR",
    memuatData: "Memuat data snapshot..."
  };

  return (
    <Suspense fallback={<LoadingState fullScreen message="Memuat dashboard..." />}>
      <DashboardContent 
        initialSnapshots={snapshots}
        labels={labels}
      />
    </Suspense>
  );
}
