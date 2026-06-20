"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { SkeletonStats, SkeletonChart, SkeletonTable } from "@/components/skeleton-card";
import { EmptyState } from "@/components/empty-state";
import { TopLowKPI } from "@/components/top-low-kpi";
import { AnalysisCharts } from "@/components/analysis-charts";
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

function AnimatedDigit({ value, delay = 0 }: { value: number | null; delay?: number }) {
  return (
    <div 
      className="relative w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-2xl font-bold text-slate-700 digit-display">
        {value !== null ? value : "-"}
      </span>
    </div>
  );
}

function StatCard({ label, value, subtext, icon, color = "primary" }: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "info";
}) {
  const colorMap = {
    primary: "from-primary to-primary-light",
    secondary: "from-secondary to-secondary-light",
    success: "from-success to-emerald-400",
    warning: "from-warning to-amber-400",
    info: "from-info to-cyan-400",
  };
  
  return (
    <Card hover className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[color]} opacity-10 rounded-bl-full`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {value}
            </p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
  
  const initialSnapshotId = searchParams.get("snapshot") || initialSnapshots[0]?.id || null;
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(initialSnapshotId);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSnapshotChanging, setIsSnapshotChanging] = useState(false);

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
	
  useEffect(() => {
    fetchAnalysis(activeSnapshotId);
    fetchSnapshots();
  }, [activeSnapshotId, fetchAnalysis, fetchSnapshots]);

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
	
  const handleSnapshotChange = useCallback((snapshotId: string) => {
    setIsSnapshotChanging(true);
    setActiveSnapshotId(snapshotId);
    const newUrl = snapshotId ? `/dashboard?snapshot=${snapshotId}` : "/dashboard";
    window.history.pushState({}, "", newUrl);
    setTimeout(() => setIsSnapshotChanging(false), 300);
  }, []);

  const handleDataSaved = useCallback(() => {
    fetchAnalysis(activeSnapshotId);
    fetchSnapshots();
  }, [activeSnapshotId, fetchAnalysis, fetchSnapshots]);
	
  useEffect(() => {
    const handleDataSavedEvent = () => handleDataSaved();
    window.addEventListener("dataSaved", handleDataSavedEvent);
    return () => window.removeEventListener("dataSaved", handleDataSavedEvent);
  }, [handleDataSaved]);

  const hasData = analysis && analysis.totalResults > 0;
  const selectedSnapshot = snapshots.find(s => s.id === activeSnapshotId);
	
  const getTopLowData = (position: string) => {
    if (!analysis) return { top: null, low: null };
    const frequency = analysis.frequency[position] || [];
    if (frequency.length === 0) return { top: null, low: null };
    
    const sortedByCount = [...frequency].sort((a, b) => b.count - a.count || b.digit - a.digit);
    const topDigit = sortedByCount[0];
    const sortedByLow = [...frequency].sort((a, b) => a.count - b.count || a.digit - b.digit);
    const lowDigit = sortedByLow[0];
    
    return { top: topDigit?.digit, low: lowDigit?.digit };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              {labels.title}
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">Analisis dan prediksi 4D dengan data historis</p>
        </div>
        
        {selectedSnapshot && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border shadow-sm">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: selectedSnapshot.color }} />
            <span className="font-medium">{selectedSnapshot.title}</span>
            <Badge variant="secondary">{selectedSnapshot._count?.results || 0} data</Badge>
          </div>
        )}
      </div>

      {/* Snapshot Selector */}
      {snapshots.length > 0 && (
        <Card className={`overflow-hidden transition-opacity duration-300 ${isSnapshotChanging ? 'opacity-50' : 'opacity-100'}`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Pilih Snapshot
                </label>
                <select
                  value={activeSnapshotId || ""}
                  onChange={(e) => handleSnapshotChange(e.target.value)}
                  className="w-full h-11 rounded-lg border-2 border-input bg-white px-4 text-sm outline-none transition-all focus:border-primary"
                >
                  <option value="">-- Pilih Snapshot --</option>
                  {snapshots.map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {snapshot.title} ({snapshot._count?.results || 0} results)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="gap-2">
                  <Link href="/dashboard/input">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {labels.inputData}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty States */}
      {snapshots.length === 0 && !isLoading && (
        <EmptyState
          title="Belum ada Snapshot"
          description="Buat snapshot pertama untuk mulai menginput data"
          actionLabel={labels.inputData}
          actionHref="/dashboard/input"
          icon="plus"
        />
      )}

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

      {/* Stats Overview */}
      {hasData && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Results"
            value={analysis.totalResults.toLocaleString()}
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z" />
              </svg>
            }
            color="primary"
          />
          <StatCard
            label="Hot Digit"
            value={analysis.hot.AS?.[0]?.digit ?? "-"}
            subtext="Most frequent"
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12.452 4.353c.845.642 1.335 1.591 1.336 2.647a3.5 3.5 0 0 1-3.5 3.5c-1.354 0-2.694-.77-3.323-1.95L4.586 7.8a4.5 4.5 0 0 1 1.997-1.124L9 5.1l2.452 1.577Z" />
              </svg>
            }
            color="warning"
          />
          <StatCard
            label="Cold Digit"
            value={analysis.cold.AS?.[0]?.digit ?? "-"}
            subtext="Least frequent"
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
              </svg>
            }
            color="info"
          />
          <StatCard
            label="Predictions"
            value={Object.keys(analysis.prediction).length * 10}
            subtext="Digit candidates"
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color="success"
          />
        </div>
      )}

      {/* TOP-LOW Position Cards */}
      {hasData && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position, idx) => {
            const { top, low } = getTopLowData(position);
            const positionColors = ["from-primary/20 to-primary/5", "from-secondary/20 to-secondary/5", "from-success/20 to-success/5", "from-info/20 to-info/5"];
            
            return (
              <Card key={position} className={`overflow-hidden bg-gradient-to-br ${positionColors[idx]}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700">{position}</h3>
                    <Badge variant={idx === 0 ? "default" : "secondary"} size="sm">
                      Position {idx + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">TOP</p>
                      <AnimatedDigit value={top} delay={idx * 100} />
                    </div>
                    <div className="text-2xl font-bold text-slate-300">/</div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">LOW</p>
                      <AnimatedDigit value={low} delay={idx * 100 + 50} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Charts Section */}
      {hasData && !isLoading && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Frequency Analysis
              </CardTitle>
              <Badge variant="secondary">{analysis.totalResults} records</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <AnalysisCharts analysis={analysis} />
          </CardContent>
        </Card>
      )}

      {/* Prediction Tables */}
      {hasData && !isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position) => (
            <Card key={position} className="overflow-hidden" hover>
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {position.charAt(0)}
                    </span>
                    {position} Predictions
                  </CardTitle>
                  <Badge variant="outline" size="sm">
                    Top {analysis.prediction[position].length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <thead className="bg-slate-50/80">
                    <Tr>
                      <Th className="font-semibold">#</Th>
                      <Th className="font-semibold">Digit</Th>
                      <Th className="font-semibold">Score</Th>
                      <Th className="font-semibold hidden sm:table-cell">Confidence</Th>
                    </Tr>
                  </thead>
                  <tbody>
                    {analysis.prediction[position].map((row, index) => (
                      <Tr key={row.digit} className={`${index === 0 ? 'bg-primary/5' : index % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                        <Td>
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold ${index === 0 ? 'bg-primary text-white shadow-md' : 'bg-slate-200 text-slate-600'}`}>
                            {index + 1}
                          </span>
                        </Td>
                        <Td>
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg digit-display ${index === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {row.digit}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-primary to-primary-light' : 'bg-slate-300'}`}
                                style={{ width: `${Math.min(row.score * 10, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-8">{row.score}</span>
                          </div>
                        </Td>
                        <Td className="hidden sm:table-cell">
                          <Badge variant={row.confidence >= 80 ? "success" : row.confidence >= 60 ? "default" : "secondary"} size="sm">
                            {row.confidence}%
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Export Section */}
      {hasData && !isLoading && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/api/export/csv${activeSnapshotId ? `?snapshot=${activeSnapshotId}` : ''}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {labels.exportCsv}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/api/export/xlsx${activeSnapshotId ? `?snapshot=${activeSnapshotId}` : ''}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {labels.exportExcel}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/api/export/pdf${activeSnapshotId ? `?snapshot=${activeSnapshotId}` : ''}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {labels.exportPdf}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
