"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { InputModal } from "@/components/InputModal";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  analyzeDifferences,
  parseResultsFromText,
  getFrequencyData,
  getDifferenceDistribution,
  getHotDigits,
  getColdDigits,
  POSITION_KEY_MAP,
  type AnalysisResult,
  type Position,
  type PositionKey,
  type DifferenceRow,
} from "@/lib/difference-analysis";

// Collapsible Section Component for Mobile
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

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

interface SnapshotResult {
  id: string;
  resultNumber: string;
  drawDate: string;
}

function Icon({ type, className = "" }: { type: "upload" | "check" | "alert" | "loader" | "camera" | "plus" | "trash" | "table" | "chart" | "database"; className?: string }) {
  const paths: Record<string, string> = {
    upload: "M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
    check: "M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    alert: "M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    camera: "M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z",
    plus: "M12 4.5v15m7.5-7.5h-15",
    trash: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
    table: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 0 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 0 6 13.125v-1.5m0-5.25v-1.5c0-.621.504-1.125 1.125-1.125H18m-1.5 0H6m0 0h1.5M6 5.625h1.5m0 0H6m0 0v1.5M18 5.625v1.5M18 5.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M6 13.125h1.5m0 0h1.5M6 13.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75m-9.75 0A1.125 1.125 0 0 1 6 12.75v-1.5m0-5.25v-1.5c0-.621.504-1.125 1.125-1.125H18m0 0h1.5M6 12.75V5.625m0 12.75c0 .621.504 1.125 1.125 1.125H6m0 0h9.75M18 19.5h-9.75M18 19.5a1.125 1.125 0 0 0 1.125-1.125V18m0 0v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M18 13.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M18 13.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M6 13.125H4.875A1.125 1.125 0 0 0 3.75 14.25V18m0 0v1.5c0 .621.504 1.125 1.125 1.125H6",
    chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
    database: "M3 3l8.735 8.735c.282.282.439.659.439 1.06V21h5.826c.401 0 .778-.157 1.06-.439L21 12M3 3l8.735 8.735M3 3v8.735M3 3h8.735M12 12l8.735 8.735M12 12v8.735M12 12H3.265",
  };

  if (type === "loader") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={paths[type] || paths.upload} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Digit Badge Component - Mobile optimized
function DigitBadge({ digit, type }: { digit: number; type: "hot" | "cold" | "normal" }) {
  const styles = {
    hot: "bg-gradient-to-br from-red-500/20 to-orange-400/20 text-red-600 border-red-300",
    cold: "bg-gradient-to-br from-blue-500/20 to-cyan-400/20 text-blue-600 border-blue-300",
    normal: "bg-slate-100 text-slate-700 border-slate-200",
  };
  
  return (
    <span className={`inline-flex items-center justify-center border-2 font-bold digit-display w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl text-xs sm:text-sm ${styles[type]}`}>
      {digit}
    </span>
  );
}

// Dashboard Card Component - Compact for mobile
function DashboardCard({ label, value, detail, icon }: { label: string; value: string | number; detail?: string; icon: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            icon === "trending-up" ? "bg-green-100" :
            icon === "trending-down" ? "bg-red-100" :
            icon === "arrow-right" ? "bg-blue-100" :
            "bg-gray-100"
          }`}>
            <Icon 
              type={icon === "arrow-right" ? "upload" : icon === "trending-up" ? "check" : icon === "trending-down" ? "alert" : "table"} 
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                icon === "trending-up" ? "text-green-600" :
                icon === "trending-down" ? "text-red-600" :
                icon === "arrow-right" ? "text-blue-600" :
                "text-gray-600"
              }`} 
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-lg sm:text-xl font-bold truncate">{value}</p>
            {detail && <p className="text-xs text-muted-foreground truncate">{detail}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analysis Table Component - Mobile optimized
function AnalysisTable({ position, differences, analysis }: { position: Position; differences: DifferenceRow[]; analysis: AnalysisResult }) {
  const positionKey = POSITION_KEY_MAP[position];
  const stats = analysis.statistics[positionKey];
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b py-2 px-3 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base">{position}</CardTitle>
          <span className="text-[10px] sm:text-sm text-muted-foreground">
            Avg: {stats.avgDifference > 0 ? "+" : ""}{stats.avgDifference.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <thead className="bg-gray-50/50">
              <Tr>
                <Th className="text-center text-[10px] sm:text-sm py-1.5 px-1 sm:px-2">Sebelum</Th>
                <Th className="text-center text-[10px] sm:text-sm py-1.5 px-1 sm:px-2">Sekarang</Th>
                <Th className="text-center text-[10px] sm:text-sm py-1.5 px-1 sm:px-2">Selisih</Th>
              </Tr>
            </thead>
            <tbody>
              {differences.slice(0, 15).map((row, idx) => (
                <Tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/30" : ""}>
                  <Td className="text-center font-mono text-xs sm:text-sm py-1.5 px-1 sm:px-2">
                    {row.previous !== null ? row.previous[positionKey] : "-"}
                  </Td>
                  <Td className="text-center font-mono font-bold text-xs sm:text-sm py-1.5 px-1 sm:px-2">
                    {row.current[positionKey]}
                  </Td>
                  <Td className={`text-center font-mono font-semibold text-xs sm:text-sm py-1.5 px-1 sm:px-2 ${
                    row.differences[positionKey] === null ? "text-gray-400" :
                    row.differences[positionKey] > 0 ? "text-green-600" :
                    row.differences[positionKey] < 0 ? "text-red-600" :
                    "text-gray-600"
                  }`}>
                    {row.differences[positionKey] === null ? "-" : 
                     row.differences[positionKey] > 0 ? `+${row.differences[positionKey]}` : 
                     row.differences[positionKey]}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Statistics Component - Mobile optimized with DIFFERENCE logic
function StatisticsCard({ position, stats, hotDigits, coldDigits }: { 
  position: Position; 
  stats: AnalysisResult["statistics"][PositionKey]; 
  hotDigits: number[];
  coldDigits: number[];
}) {
  const positionColors = {
    AS: { from: "from-primary", to: "to-primary-light", text: "text-primary" },
    KOP: { from: "from-secondary", to: "to-secondary-light", text: "text-secondary" },
    KEPALA: { from: "from-emerald-500", to: "to-emerald-400", text: "text-emerald-600" },
    EKOR: { from: "from-cyan-500", to: "to-cyan-400", text: "text-cyan-600" },
  };
  const colors = positionColors[position];
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b py-2 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${colors.from} ${colors.to} text-white flex items-center justify-center font-bold text-xs sm:text-sm`}>
            {position.charAt(0)}
          </span>
          <span className="font-semibold text-sm sm:text-base">{position}</span>
        </div>
      </CardHeader>
      <CardContent className="p-2.5 sm:p-4 space-y-3">
        {/* Hot Digits (Positive Trend) */}
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            ↑ Naik
          </p>
          <div className="flex flex-wrap gap-1">
            {hotDigits.length > 0 ? hotDigits.map((digit) => (
              <DigitBadge key={`hot-${digit}`} digit={digit} type="hot" />
            )) : <span className="text-[10px] text-muted-foreground">-</span>}
          </div>
        </div>
        
        {/* Cold Digits (Negative Trend) */}
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            ↓ Turun
          </p>
          <div className="flex flex-wrap gap-1">
            {coldDigits.length > 0 ? coldDigits.map((digit) => (
              <DigitBadge key={`cold-${digit}`} digit={digit} type="cold" />
            )) : <span className="text-[10px] text-muted-foreground">-</span>}
          </div>
        </div>
        
        {/* Difference Counts Grid - Smaller on mobile */}
        <div className="grid grid-cols-6 gap-0.5 sm:gap-1 text-center">
          {[-3, -2, -1, 1, 2, 3].map((diff) => (
            <div key={diff} className="p-1 sm:p-1.5 rounded bg-gray-50">
              <p className={`text-[10px] sm:text-xs ${diff > 0 ? "text-green-600" : "text-red-600"} font-medium`}>
                {diff > 0 ? "+" : ""}{diff}
              </p>
              <p className="text-xs sm:text-sm font-bold">{stats.counts[diff] || 0}</p>
            </div>
          ))}
        </div>
        
        {/* Summary Stats - Compact */}
        <div className="pt-1.5 sm:pt-2 border-t space-y-1">
          <div className="flex justify-between text-[11px] sm:text-sm">
            <span className="text-muted-foreground">Avg</span>
            <span className={`font-semibold ${stats.avgDifference > 0 ? "text-green-600" : stats.avgDifference < 0 ? "text-red-600" : "text-gray-600"}`}>
              {stats.avgDifference > 0 ? "+" : ""}{stats.avgDifference.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-[11px] sm:text-sm">
            <span className="text-muted-foreground">↑</span>
            <span className="font-semibold text-green-600">{stats.positiveCount}</span>
            <span className="text-muted-foreground">↓</span>
            <span className="font-semibold text-red-600">{stats.negativeCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DifferenceAnalyzer({ initialSnapshots }: { initialSnapshots: Snapshot[] }) {
  const searchParams = useSearchParams();
  
  const initialSnapshotId = searchParams.get("snapshot") || initialSnapshots[0]?.id || null;
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(initialSnapshotId);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots);
  const [snapshotResults, setSnapshotResults] = useState<SnapshotResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);

  // Fetch snapshots
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

  // Fetch results from snapshot
  const fetchSnapshotResults = useCallback(async (snapshotId: string | null) => {
    if (!snapshotId) {
      setSnapshotResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/difference?snapshot=${snapshotId}`);
      if (response.ok) {
        const data = await response.json();
        setSnapshotResults(data.results || []);
      }
    } catch (error) {
      console.error("Failed to fetch snapshot results:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshotResults(activeSnapshotId);
    fetchSnapshots();
  }, [activeSnapshotId, fetchSnapshotResults, fetchSnapshots]);

  // Refresh on visibility change or focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchSnapshotResults(activeSnapshotId);
        fetchSnapshots();
      }
    };

    const handleFocus = () => {
      fetchSnapshotResults(activeSnapshotId);
      fetchSnapshots();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [activeSnapshotId, fetchSnapshotResults, fetchSnapshots]);

  // Handle snapshot change from selector
  const handleSnapshotChange = useCallback((newSnapshotId: string) => {
    setActiveSnapshotId(newSnapshotId);
    const newUrl = newSnapshotId ? `/dashboard/analyzer?snapshot=${newSnapshotId}` : "/dashboard/analyzer";
    window.history.pushState({}, "", newUrl);
  }, []);

  // Perform analysis when snapshot results change
  useEffect(() => {
    if (snapshotResults.length > 0) {
      const textToAnalyze = snapshotResults.map(r => r.resultNumber).join("\n");
      const results = parseResultsFromText(textToAnalyze);
      if (results.length > 0) {
        const analysisResult = analyzeDifferences(results);
        setAnalysis(analysisResult);
      } else {
        setAnalysis(null);
      }
    } else {
      setAnalysis(null);
    }
  }, [snapshotResults]);

  // Compute chart data from analysis
  const differenceData = analysis ? getDifferenceDistribution(analysis.statistics) : null;
  const frequencyData = analysis ? getFrequencyData(analysis.parsedResults) : null;

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-24 sm:pb-8">
      {/* Header - Compact on mobile */}
      <div className="sm:mb-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">4D Difference Analyzer</h1>
        <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-0.5 sm:mt-1">Analisis selisih digit hasil 4D</p>
      </div>

      {/* Snapshot Selector - Collapsible on Mobile */}
      <CollapsibleSection title={
        <span className="flex items-center gap-2">
          <Icon type="database" className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Pilih Snapshot</span>
        </span>
      } defaultOpen={true}>
        {isLoading && snapshots.length > 0 ? (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Icon type="loader" className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            Memuat data...
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={activeSnapshotId || ""}
              onChange={(e) => handleSnapshotChange(e.target.value)}
              disabled={isLoading}
              className={`
                w-full px-2 py-2 sm:px-3 sm:py-2.5 rounded-lg border bg-white text-xs sm:text-sm appearance-none 
                cursor-pointer outline-none transition-all duration-200
                ${isLoading 
                  ? 'border-gray-300 bg-gray-100 cursor-wait opacity-70' 
                  : 'border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }
              `}
            >
              <option value="">-- Pilih Snapshot --</option>
              {snapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {snapshot.title} ({snapshot._count?.results || 0})
                </option>
              ))}
            </select>
            
            {/* Current Snapshot Info - Compact */}
            {activeSnapshotId && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-medium truncate">
                  {snapshots.find(s => s.id === activeSnapshotId)?.title || "Loading..."}
                </span>
                <span className="text-muted-foreground">
                  ({snapshotResults.length} data)
                </span>
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* Input Data Button - Opens Modal */}
      <button
        onClick={() => setShowInputModal(true)}
        className="w-full block"
      >
        <Card className="shadow-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all cursor-pointer">
          <CardContent className="py-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon type="upload" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">Input Data</p>
                  <p className="text-white/80 text-xs">Upload gambar atau input manual</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Input Modal */}
      <InputModal 
        isOpen={showInputModal} 
        onClose={() => setShowInputModal(false)}
        buttonLabel="Simpan Data"
      />

      {/* Results Section */}
      {analysis && (
        <>
          {/* Dashboard Cards - Collapsible on Mobile */}
          <CollapsibleSection title="Ringkasan" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                label="Total"
                value={analysis.summary.totalResults}
                icon="table"
              />
              <DashboardCard
                label="Transisi"
                value={analysis.summary.totalTransitions}
                icon="arrow-right"
              />
              <DashboardCard
                label="Naik Terbanyak"
                value={analysis.summary.mostCommonIncrease ? 
                  `+${analysis.summary.mostCommonIncrease.diff}` : 
                  "N/A"
                }
                detail={analysis.summary.mostCommonIncrease ? `${analysis.summary.mostCommonIncrease.position}: ${analysis.summary.mostCommonIncrease.count}x` : ""}
                icon="trending-up"
              />
              <DashboardCard
                label="Turun Terbanyak"
                value={analysis.summary.mostCommonDecrease ? 
                  `${analysis.summary.mostCommonDecrease.diff}` : 
                  "N/A"
                }
                detail={analysis.summary.mostCommonDecrease ? `${analysis.summary.mostCommonDecrease.position}: ${analysis.summary.mostCommonDecrease.count}x` : ""}
                icon="trending-down"
              />
            </div>
          </CollapsibleSection>

          {/* Statistics Cards - Position Analysis with DIFFERENCE logic - Collapsible on Mobile */}
          <CollapsibleSection title="Analisis Posisi (Pola Selisih)" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <StatisticsCard 
                position="AS" 
                stats={analysis.statistics.as} 
                hotDigits={getHotDigits(analysis, "AS")} 
                coldDigits={getColdDigits(analysis, "AS")}
              />
              <StatisticsCard 
                position="KOP" 
                stats={analysis.statistics.kop} 
                hotDigits={getHotDigits(analysis, "KOP")} 
                coldDigits={getColdDigits(analysis, "KOP")}
              />
              <StatisticsCard 
                position="KEPALA" 
                stats={analysis.statistics.kepala} 
                hotDigits={getHotDigits(analysis, "KEPALA")} 
                coldDigits={getColdDigits(analysis, "KEPALA")}
              />
              <StatisticsCard 
                position="EKOR" 
                stats={analysis.statistics.ekor} 
                hotDigits={getHotDigits(analysis, "EKOR")} 
                coldDigits={getColdDigits(analysis, "EKOR")}
              />
            </div>
          </CollapsibleSection>

          {/* Charts Section - Collapsible on Mobile */}
          <CollapsibleSection title={
            <span className="flex items-center gap-2">
              <Icon type="chart" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Graifik</span>
            </span>
          } defaultOpen={false}>
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Difference Distribution Chart */}
              <Card className="shadow-sm">
                <CardHeader className="py-3 px-3 sm:px-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    Distribusi Selisih
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-56 sm:h-72">
                  {differenceData && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(differenceData).map(([diff, data]) => ({
                        difference: Number(diff),
                        AS: data.AS,
                        KOP: data.KOP,
                        KEPALA: data.KEPALA,
                        EKOR: data.EKOR,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="difference" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="AS" fill="#0f766e" />
                        <Bar dataKey="KOP" fill="#2563eb" />
                        <Bar dataKey="KEPALA" fill="#ca8a04" />
                        <Bar dataKey="EKOR" fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Digit Frequency Chart */}
              <Card className="shadow-sm">
                <CardHeader className="py-3 px-3 sm:px-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    Frekuensi Digit
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-56 sm:h-72">
                  {frequencyData && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Array.from({ length: 10 }, (_, i) => ({
                        digit: i,
                        AS: frequencyData.AS[i],
                        KOP: frequencyData.KOP[i],
                        KEPALA: frequencyData.KEPALA[i],
                        EKOR: frequencyData.EKOR[i],
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="digit" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="AS" fill="#0f766e" />
                        <Bar dataKey="KOP" fill="#2563eb" />
                        <Bar dataKey="KEPALA" fill="#ca8a04" />
                        <Bar dataKey="EKOR" fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </CollapsibleSection>

          {/* Analysis Tables - Collapsible on Mobile */}
          <CollapsibleSection title="Detail Tabel" defaultOpen={false}>
            <div className="grid gap-3 sm:gap-4 lg:gap-6">
              {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position) => (
                <AnalysisTable
                  key={position}
                  position={position}
                  differences={analysis.differences}
                  analysis={analysis}
                />
              ))}
            </div>
          </CollapsibleSection>
        </>
      )}

      {/* Empty State - Compact */}
      {!analysis && (
        <Card className="shadow-sm">
          <CardContent className="py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon type="table" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Belum Ada Data</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto px-4">
              Upload gambar untuk OCR atau masukkan angka 4 digit secara manual
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}