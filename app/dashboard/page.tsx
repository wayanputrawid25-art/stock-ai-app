import Link from "next/link";
import { runAnalysisAction } from "@/app/actions/results";
import { AnalysisCharts } from "@/components/analysis-charts";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { analyzeResults } from "@/lib/analysis";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";
import { SnapshotSelector } from "@/components/snapshot-selector";

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getDictionary();
  
  // Get all snapshots with CORRECT count using Prisma
  const snapshots = await prisma.snapshot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { results: true }
      }
    }
  });

  // Get the first snapshot as default
  const defaultSnapshotId = snapshots[0]?.id || null;

  // Get results ONLY for the selected snapshot (NOT all results)
  let analysis = analyzeResults([]);  // Initialize with empty results

  if (defaultSnapshotId) {
    // Use count query for accurate numbers
    const totalResults = await prisma.result.count({
      where: { userId: user.id, snapshotId: defaultSnapshotId }
    });

    if (totalResults > 0) {
      const results = await prisma.result.findMany({
        where: { userId: user.id, snapshotId: defaultSnapshotId },
        orderBy: { drawDate: "desc" },
        select: { resultNumber: true, drawDate: true }
      });
      analysis = { ...analyzeResults(results), totalResults };
    } else {
      analysis = { ...analyzeResults([]), totalResults: 0 };
    }
  }

  const hasData = analysis.totalResults > 0;
  const selectedSnapshot = snapshots.find(s => s.id === defaultSnapshotId);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and analyze your 4D predictions</p>
        </div>
        {defaultSnapshotId && (
          <form action={runAnalysisAction}>
            <input type="hidden" name="snapshotId" value={defaultSnapshotId} />
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 font-semibold">
              {t.dashboard.saveSnapshot}
            </Button>
          </form>
        )}
      </div>

      {/* Snapshot Selector - REQUIRED */}
      {snapshots.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <SnapshotSelector 
            snapshots={snapshots} 
            activeSnapshotId={defaultSnapshotId}
          />
        </div>
      )}

      {/* Empty State - No Snapshots */}
      {snapshots.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada Snapshot</h3>
          <p className="text-gray-500 mb-4">Buat snapshot pertama untuk mulai menginput data</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/input">Input Data</Link>
          </Button>
        </div>
      )}

      {/* Empty State - Snapshot has no data */}
      {snapshots.length > 0 && !hasData && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tidak ada data pada snapshot &quot;{selectedSnapshot?.title || 'ini'}&quot;
          </h3>
          <p className="text-gray-500 mb-4">Mulai input data 4D untuk snapshot ini</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/input">Input Data</Link>
          </Button>
        </div>
      )}

      {/* Metrics Grid */}
      {hasData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label={t.dashboard.results} value={analysis.totalResults} />
          <MetricCard label={`${t.dashboard.top} AS`} value={analysis.prediction.AS[0]?.digit ?? "-"} detail={t.dashboard.predictionLeader} />
          <MetricCard label={`${t.dashboard.top} KOP`} value={analysis.prediction.KOP[0]?.digit ?? "-"} detail={t.dashboard.predictionLeader} />
          <MetricCard label={`${t.dashboard.top} EKOR`} value={analysis.prediction.EKOR[0]?.digit ?? "-"} detail={t.dashboard.predictionLeader} />
        </div>
      )}

      {/* Charts Section */}
      {hasData && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Frequency Analysis</h2>
          <AnalysisCharts analysis={analysis} />
        </div>
      )}

      {/* Prediction Tables */}
      {hasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position) => (
            <Card key={position} className="overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{position} {t.dashboard.predictionTop}</CardTitle>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Top {analysis.prediction[position].length} digits
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <thead className="bg-gray-50/50">
                      <Tr><Th className="font-semibold">{t.dashboard.rank}</Th><Th className="font-semibold">{t.dashboard.digit}</Th><Th className="font-semibold">{t.dashboard.score}</Th><Th className="font-semibold">{t.dashboard.confidence}</Th></Tr>
                    </thead>
                    <tbody>
                      {analysis.prediction[position].map((row, index) => (
                        <Tr key={row.digit} className={index === 0 ? 'bg-green-50/50' : ''}>
                          <Td>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                              {index + 1}
                            </span>
                          </Td>
                          <Td className="font-mono font-bold text-lg">{row.digit}</Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                                  style={{ width: `${Math.min(row.score * 10, 100)}%` }} 
                                />
                              </div>
                              <span className="text-sm font-medium">{row.score}</span>
                            </div>
                          </Td>
                          <Td className="text-muted-foreground">{row.confidence}%</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Export Section */}
      {hasData && (
        <div className="rounded-xl border bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Export Data</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="hover:bg-white">
              <Link href={`/api/export/csv${defaultSnapshotId ? `?snapshot=${defaultSnapshotId}` : ''}`} className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {t.dashboard.exportCsv}
              </Link>
            </Button>
            <Button asChild variant="outline" className="hover:bg-white">
              <Link href={`/api/export/xlsx${defaultSnapshotId ? `?snapshot=${defaultSnapshotId}` : ''}`} className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {t.dashboard.exportExcel}
              </Link>
            </Button>
            <Button asChild variant="outline" className="hover:bg-white">
              <Link href={`/api/export/pdf${defaultSnapshotId ? `?snapshot=${defaultSnapshotId}` : ''}`} className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {t.dashboard.exportPdf}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
