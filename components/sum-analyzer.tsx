"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { SnapshotSelector } from "@/components/snapshot-selector";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

interface SumKPI {
  position: string;
  avgDigit: number;
  avgDigitPercentage: number;
  dominantDigit: number;
  dominantDigitCount: number;
  dominantDigitPercentage: number;
  evenCount: number;
  evenPercentage: number;
  oddCount: number;
  oddPercentage: number;
  bigCount: number;
  bigPercentage: number;
  smallCount: number;
  smallPercentage: number;
}

interface SumDistribution {
  sum: number;
  count: number;
  percentage: number;
}

interface SumAnalysis {
  totalResults: number;
  sumDistribution: SumDistribution[];
  overallStats: {
    mean: number;
    median: number;
    mode: number;
    min: number;
    max: number;
    range: number;
  };
  composition: {
    evenOdd: {
      twoEvenTwoOdd: number;
      threeEvenOneOdd: number;
      threeOddOneEven: number;
      fourEven: number;
      fourOdd: number;
    };
    balance: {
      balancedCount: number;
      balancedPercentage: number;
    };
  };
  positionKPIs: SumKPI[];
}

// Collapsible Section Component
function CollapsibleSection({ title, children, defaultOpen = true }: { 
  title: React.ReactNode; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card className="shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-slate-50 transition-colors md:cursor-default"
      >
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          {title}
        </CardTitle>
        <span className="md:hidden flex items-center gap-1 text-muted-foreground">
          <span className="text-xs">{isOpen ? "Tutup" : "Buka"}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div className={`md:block ${isOpen ? "block" : "hidden"}`}>
        <CardContent className="p-3 sm:p-4">
          {children}
        </CardContent>
      </div>
    </Card>
  );
}

// KPI Card Component
function KPICard({ label, value, subtext, color = "primary" }: {
  label: string;
  value: string | number;
  subtext?: string;
  color?: "primary" | "info" | "success" | "warning";
}) {
  const colorMap = {
    primary: "from-primary to-primary-light",
    info: "from-info to-cyan-400",
    success: "from-success to-emerald-400",
    warning: "from-warning to-amber-400",
  };
  
  return (
    <Card hover className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colorMap[color]} opacity-10 rounded-bl-full`} />
      <CardContent className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold mt-1 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {value}
        </p>
        {subtext && <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

// Position KPI Card
function PositionKPICard({ kpi }: { kpi: SumKPI }) {
  const positionColors: Record<string, string> = {
    AS: "border-teal-500/30",
    KOP: "border-blue-500/30",
    KEPALA: "border-yellow-500/30",
    EKOR: "border-red-500/30",
  };
  
  const positionBg: Record<string, string> = {
    AS: "bg-teal-50",
    KOP: "bg-blue-50",
    KEPALA: "bg-yellow-50",
    EKOR: "bg-red-50",
  };
  
  return (
    <Card className={`border-2 ${positionColors[kpi.position]}`}>
      <CardHeader className={`py-3 px-4 ${positionBg[kpi.position]}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold">{kpi.position}</CardTitle>
          <Badge variant="outline" size="sm">
            Avg: {kpi.avgDigit}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* Dominant Digit */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground">Dominant</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-white font-bold text-sm sm:text-base">
              {kpi.dominantDigit}
            </span>
            <span className="text-xs text-muted-foreground">
              {kpi.dominantDigitCount}x ({kpi.dominantDigitPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
        
        {/* Even-Odd */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
            <span className="text-xs text-blue-600 font-medium">Genap</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-blue-600 text-sm">{kpi.evenCount}</span>
              <span className="text-xs text-blue-500">({kpi.evenPercentage.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
            <span className="text-xs text-orange-600 font-medium">Ganjil</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-orange-600 text-sm">{kpi.oddCount}</span>
              <span className="text-xs text-orange-500">({kpi.oddPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
        
        {/* Big-Small */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
            <span className="text-xs text-purple-600 font-medium">Besar</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-purple-600 text-sm">{kpi.bigCount}</span>
              <span className="text-xs text-purple-500">({kpi.bigPercentage.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-2">
            <span className="text-xs text-green-600 font-medium">Kecil</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-green-600 text-sm">{kpi.smallCount}</span>
              <span className="text-xs text-green-500">({kpi.smallPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composition Card
function CompositionCard({ composition, total }: { 
  composition: SumAnalysis['composition'];
  total: number;
}) {
  const patterns = [
    { label: "2 Genap 2 Ganjil", key: "twoEvenTwoOdd", color: "bg-teal-500" },
    { label: "3 Genap 1 Ganjil", key: "threeEvenOneOdd", color: "bg-blue-500" },
    { label: "3 Ganjil 1 Genap", key: "threeOddOneEven", color: "bg-orange-500" },
    { label: "4 Genap", key: "fourEven", color: "bg-purple-500" },
    { label: "4 Ganjil", key: "fourOdd", color: "bg-red-500" },
  ] as const;
  
  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-slate-50">
        <CardTitle className="text-sm sm:text-base">Komposisi Genap-Ganjil</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          {patterns.map((pattern) => {
            const count = composition.evenOdd[pattern.key];
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={pattern.key} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${pattern.color}`} />
                <span className="text-xs sm:text-sm flex-1">{pattern.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${pattern.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold w-16 text-right">
                    {count}x ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Balance indicator */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium">Rasio Seimbang</span>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-primary">
                {composition.balance.balancedPercentage.toFixed(1)}%
              </span>
              <Badge variant="success" size="sm">
                {composition.balance.balancedCount}x
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SumAnalyzer({ initialSnapshots }: { initialSnapshots: Snapshot[] }) {
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(initialSnapshots[0]?.id || null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots);
  const [analysis, setAnalysis] = useState<SumAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchAnalysis = useCallback(async (snapshotId: string | null) => {
    if (!snapshotId) {
      setAnalysis(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/sum-analysis?snapshot=${snapshotId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Failed to fetch SUM analysis:", error);
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
    setActiveSnapshotId(snapshotId);
    const newUrl = snapshotId ? `/dashboard/sum-analysis?snapshot=${snapshotId}` : "/dashboard/sum-analysis";
    window.history.pushState({}, "", newUrl);
  }, []);
  
  // Prepare chart data - only show sums with count > 0
  const chartData = analysis?.sumDistribution.filter(s => s.count > 0).map(s => ({
    sum: s.sum,
    count: s.count,
    percentage: parseFloat(s.percentage.toFixed(1)),
  })) || [];
  
  const hasData = analysis && analysis.totalResults > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Snapshot Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Analisis Distribusi SUM
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Analisis total jumlah digit per hasil (AS+KOP+KEPALA+EKOR)
          </p>
        </div>
        <SnapshotSelector
          snapshots={snapshots}
          activeSnapshotId={activeSnapshotId}
          onSnapshotChange={handleSnapshotChange}
        />
      </div>

      {isLoading ? (
        <LoadingState fullScreen message="Memuat analisis SUM..." />
      ) : hasData ? (
        <>
          {/* Overall Stats */}
          <CollapsibleSection title="Statistik Keseluruhan" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              <KPICard label="Total Data" value={analysis.totalResults} color="primary" />
              <KPICard label="Mean (Rata-rata)" value={analysis.overallStats.mean} subtext={`Median: ${analysis.overallStats.median}`} color="info" />
              <KPICard label="Modus" value={analysis.overallStats.mode} subtext={`Range: ${analysis.overallStats.min}-${analysis.overallStats.max}`} color="success" />
              <KPICard label="Seimbang (2:2)" value={`${analysis.composition.balance.balancedPercentage.toFixed(1)}%`} subtext={`${analysis.composition.balance.balancedCount}x dari ${analysis.totalResults}`} color="warning" />
            </div>
          </CollapsibleSection>

          {/* Composition Analysis */}
          <CollapsibleSection title="Analisis Komposisi Genap-Ganjil" defaultOpen={true}>
            <div className="grid gap-4 lg:grid-cols-2">
              <CompositionCard composition={analysis.composition} total={analysis.totalResults} />
              
              {/* Sum Distribution Chart */}
              <Card>
                <CardHeader className="py-3 px-4 bg-slate-50">
                  <CardTitle className="text-sm sm:text-base">Distribusi Total SUM</CardTitle>
                </CardHeader>
                <CardContent className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sum" tick={{ fontSize: 10 }} label={{ value: 'SUM', position: 'insideBottom', offset: -5 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [value, name === 'count' ? 'Jumlah' : 'Persen (%)']}
                        labelFormatter={(label) => `Total SUM: ${label}`}
                      />
                      <Bar dataKey="count" fill="#3B82F6" name="Jumlah" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CollapsibleSection>

          {/* Position KPIs */}
          <CollapsibleSection title="KPI per Posisi (AS, KOP, Kepala, Ekor)" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {analysis.positionKPIs.map((kpi) => (
                <PositionKPICard key={kpi.position} kpi={kpi} />
              ))}
            </div>
          </CollapsibleSection>

          {/* Top Sum Values */}
          <CollapsibleSection title="Nilai SUM Paling Sering Muncul" defaultOpen={false}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
              {analysis.sumDistribution.filter(s => s.count > 0).slice(0, 12).map((s) => (
                <div key={s.sum} className="flex flex-col items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <span className="text-lg sm:text-xl font-bold text-primary">{s.sum}</span>
                  <span className="text-xs text-muted-foreground">{s.count}x</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">{s.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </>
      ) : (
        <div className="text-center py-16 px-6 bg-gradient-to-b from-slate-50/50 to-white rounded-2xl border border-dashed border-border/60">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Data</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Pilih snapshoot yang memiliki data untuk melihat analisis SUM.
          </p>
        </div>
      )}
    </div>
  );
}
