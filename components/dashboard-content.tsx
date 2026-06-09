"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { SkeletonStats, SkeletonChart, SkeletonTable } from "@/components/skeleton-card";
import { EmptyState } from "@/components/empty-state";
import { TopLowKPI } from "@/components/top-low-kpi";
import { AnalysisCharts } from "@/components/analysis-charts";
import { SnapshotSelector } from "@/components/snapshot-selector";
import { LoadingState } from "@/components/LoadingState";

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

interface Analysis {
  totalResults: number;
  frequency: Record<string, Array<{ rank: number; digit: number; count: number; percentage: number }>>;
  hot: Record<string, Array<{ rank: number; digit: number; count: number; percentage: number }>>;
  cold: Record<string, Array<{ rank: number; digit: number; count: number; percentage: number }>>;
  gap: Record<string, Array<{ digit: number; gapScore: number }>>;
  trend: Record<string, Array<{ digit: number; recentCount: number; previousCount: number; delta: number; status: string }>>;
  oddEven: Record<string, { oddPercentage: number; evenPercentage: number }>;
  bigSmall: Record<string, { bigPercentage: number; smallPercentage: number }>;
  prediction: Record<string, Array<{ digit: number; score: number; confidence: number }>>;
}

export function DashboardContent({ 
  initialSnapshots, 
  labels 
}: { 
  initialSnapshots: Snapshot[]; 
  labels: {
    title: string;
    results: string;
    top: string;
    low: string;
    predictionLeader: string;
    exportCsv: string;
    exportExcel: string;
    exportPdf: string;
    rank: string;
    digit: string;
    score: string;
    confidence: string;
    predictionTop: string;
    saveSnapshot: string;
    inputData: string;
    scanOcr: string;
    memuatData: string;
  };
}) {
  const searchParams = useSearchParams();
  
  // Get snapshot ID from URL or use first snapshot
  const initialSnapshotId = searchParams.get("snapshot") || initialSnapshots[0]?.id || null;
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(initialSnapshotId);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSnapshotChanging, setIsSnapshotChanging] = useState(false);

  // Fetch analysis data for active snapshot
  const fetchAnalysis = useCallback(async (snapshotId: string | null) => {
    if (!snapshotId) {
      setAnalysis(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/analysis?snapshot=${snapshotId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch snapshots with updated counts
  const fetchSnapshots = useCallback(async () => {
    try {
      const response = await fetch("/api/snapshots");
      if (response.ok) {
        const data = await response.json();
        setSnapshots(data.snapshots || []);
      }
    } catch (error) {
      console.error("Failed to fetch snapshots:", error);
    }
  }, []);

  // Initial load and refetch on visibility/focus
  useEffect(() => {
    fetchAnalysis(activeSnapshotId);
    fetchSnapshots();
  }, [activeSnapshotId, fetchAnalysis, fetchSnapshots]);

  // Handle visibility change - refresh data when returning to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAnalysis(activeSnapshotId);
        fetchSnapshots();
      }
    };

    const handleFocus = () => {
      fetchAnalysis(activeSnapshotId);
      fetchSnapshots();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [activeSnapshotId, fetchAnalysis, fetchSnapshots]);

  // Handle snapshot change
  const handleSnapshotChange = useCallback((snapshotId: string) => {
    setIsSnapshotChanging(true);
    setActiveSnapshotId(snapshotId);
    
    // Update URL without full page reload
    const newUrl = snapshotId ? `/dashboard?snapshot=${snapshotId}` : "/dashboard";
    window.history.pushState({}, "", newUrl);
    
    // Reset loading state after transition
    setTimeout(() => setIsSnapshotChanging(false), 300);
  }, []);

  // Handle OCR/Input success - refresh data
  const handleDataSaved = useCallback(() => {
    fetchAnalysis(activeSnapshotId);
    fetchSnapshots();
  }, [activeSnapshotId, fetchAnalysis, fetchSnapshots]);

  // Listen for custom events from OCR/Input pages
  useEffect(() => {
    const handleDataSavedEvent = () => handleDataSaved();
    window.addEventListener("dataSaved", handleDataSavedEvent);
    return () => window.removeEventListener("dataSaved", handleDataSavedEvent);
  }, [handleDataSaved]);

  const hasData = analysis && analysis.totalResults > 0;
  const selectedSnapshot = snapshots.find(s => s.id === activeSnapshotId);

  // Get TOP-LOW data for each position
  const getTopLowData = (position: string) => {
    if (!analysis) return { top: null, low: null };
    
    const frequency = analysis.frequency[position] || [];
    if (frequency.length === 0) return { top: null, low: null };
    
    // TOP: highest count, if tie, highest digit
    const sortedByCount = [...frequency].sort((a, b) => b.count - a.count || b.digit - a.digit);
    const topDigit = sortedByCount[0];
    
    // LOW: lowest count, if tie, lowest digit
    const sortedByLow = [...frequency].sort((a, b) => a.count - b.count || a.digit - b.digit);
    const lowDigit = sortedByLow[0];
    
    return { top: topDigit?.digit, low: lowDigit?.digit };
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{labels.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and analyze your 4D predictions</p>
        </div>
      </div>

      {/* Snapshot Selector - REQUIRED */}
      {snapshots.length > 0 && (
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 transition-opacity duration-200 ${isSnapshotChanging ? 'opacity-50' : 'opacity-100'}`}>
          <SnapshotSelector 
            snapshots={snapshots} 
            activeSnapshotId={activeSnapshotId}
            onSnapshotChange={handleSnapshotChange}
            isLoading={isSnapshotChanging}
          />
        </div>
      )}

      {/* Empty State - No Snapshots */}
      {snapshots.length === 0 && !isLoading && (
        <EmptyState
          title="Belum ada Snapshot"
          description="Buat snapshot pertama untuk mulai menginput data"
          actionLabel={labels.inputData}
          actionHref="/dashboard/input"
          icon="plus"
        />
      )}

      {/* Empty State - Snapshot has no data */}
      {snapshots.length > 0 && !hasData && !isLoading && (
        <EmptyState
          title={`Belum ada data pada snapshot "${selectedSnapshot?.title || 'ini'}"`}
          description="Mulai input data 4D untuk snapshot ini"
          actionLabel={labels.inputData}
          actionHref="/dashboard/input"
          secondaryActionLabel={labels.scanOcr}
          secondaryActionHref="/dashboard/input"
          icon="document"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <LoadingState variant="dots" message={labels.memuatData} />
          <SkeletonStats />
          <SkeletonChart />
          <SkeletonTable />
        </div>
      )}

      {/* Metrics Grid - TOP-LOW KPI */}
      {hasData && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TopLowKPI position="AS" top={getTopLowData("AS").top} low={getTopLowData("AS").low} />
          <TopLowKPI position="KOP" top={getTopLowData("KOP").top} low={getTopLowData("KOP").low} />
          <TopLowKPI position="KEPALA" top={getTopLowData("KEPALA").top} low={getTopLowData("KEPALA").low} />
          <TopLowKPI position="EKOR" top={getTopLowData("EKOR").top} low={getTopLowData("EKOR").low} />
        </div>
      )}

      {/* Charts Section */}
      {hasData && !isLoading && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Frequency Analysis</h2>
          <AnalysisCharts analysis={analysis} />
        </div>
      )}

      {/* Prediction Tables */}
      {hasData && !isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position) => (
            <Card key={position} className="overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{position} {labels.predictionTop}</CardTitle>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Top {analysis.prediction[position].length} digits
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <thead className="bg-gray-50/50">
                      <Tr><Th className="font-semibold">{labels.rank}</Th><Th className="font-semibold">{labels.digit}</Th><Th className="font-semibold">{labels.score}</Th><Th className="font-semibold">{labels.confidence}</Th></Tr>
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
      {hasData && !isLoading && (
        <div className="rounded-xl border bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Export Data</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="hover:bg-white">
              <Link href={`/api/export/csv${activeSnapshotId ? `?snapshot=${activeSnapshotId}` : ''}`} className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {labels.exportCsv}
              </Link>
            </Button>
            <Button asChild variant="outline" className="hover:bg-white">
              <Link href={`/api/export/xlsx${activeSnapshotId ? `?snapshot=${activeSnapshotId}` : ''}`} className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {labels.exportExcel}
              </Link>
            </Button>
            <Button asChild variant="outline" className="hover:bg-white">
              <Link href={`/api/export/pdf${activeSnapshotId ? `?snapshot=${activeSnapshotId}` : ''}`} className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {labels.exportPdf}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}