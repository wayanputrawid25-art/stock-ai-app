"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PredictionPanel } from "@/components/prediction-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputModal } from "@/components/InputModal";

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

interface HistoricalAnalysisResult {
  summary: {
    totalRecords: number;
    lastDate: string | null;
    lastResult: string | null;
    dateRange: string;
  };
  overallFrequency: Array<{ digit: number; count: number; percentage: number }>;
  hotDigits: number[];
  coldDigits: number[];
  positionAnalysis: {
    AS: { hotDigits: number[]; coldDigits: number[] };
    KOP: { hotDigits: number[]; coldDigits: number[] };
    KEPALA: { hotDigits: number[]; coldDigits: number[] };
    EKOR: { hotDigits: number[]; coldDigits: number[] };
  };
  patternAnalysis: {
    oddEvenRatio: { odd: number; even: number; oddPercent: number };
    bigSmallRatio: { big: number; small: number; bigPercent: number };
  };
  predictions: {
    "2d": Array<{ number: string; score: number; confidence: number; reason: string }>;
    "3d": Array<{ number: string; score: number; confidence: number; reason: string }>;
    "4d": Array<{ number: string; score: number; confidence: number; reason: string }>;
  };
  json: {
    hot_digit: number[];
    cold_digit: number[];
    position_analysis: {
      AS: number[];
      KOP: number[];
      KEPALA: number[];
      EKOR: number[];
    };
    prediction_2d: Array<{ number: string; score: number }>;
    prediction_3d: Array<{ number: string; score: number }>;
    prediction_4d: Array<{ number: string; score: number }>;
  };
}

function Icon({ type, className = "" }: { type: "refresh" | "loader"; className?: string }) {
  const paths: Record<string, string> = {
    refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15",
    loader: "M12 3v3m6.366-.848-2.12 2.12M21 12h-3m.848 6.366-2.12-2.12M12 21v-3m-6.366.848 2.12-2.12M3 12h3m-.848-6.366 2.12 2.12",
  };

  if (type === "loader") {
    return (
      <svg className={className + " animate-spin"} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={paths[type] || paths.refresh} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PredictionPage() {
  const searchParams = useSearchParams();
  const urlSnapshotId = searchParams.get("snapshot");
  const [showInputModal, setShowInputModal] = useState(false);
  
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(urlSnapshotId);
  const [analysis, setAnalysis] = useState<HistoricalAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const response = await fetch("/api/snapshots");
        if (response.ok) {
          const data = await response.json();
          setSnapshots(data.snapshots || []);
        }
      } catch (err) {
        console.error("Failed to fetch snapshots:", err);
      }
    };
    fetchSnapshots();
  }, []);

  const fetchAnalysis = async (snapshotId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/prediction?snapshot=${snapshotId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch analysis");
      }
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSnapshotId) {
      fetchAnalysis(selectedSnapshotId);
    } else {
      setAnalysis(null);
    }
  }, [selectedSnapshotId]);

  const handleSnapshotChange = (snapshotId: string) => {
    setSelectedSnapshotId(snapshotId || null);
    const newUrl = snapshotId ? `/dashboard/prediction?snapshot=${snapshotId}` : "/dashboard/prediction";
    window.history.pushState({}, "", newUrl);
  };

  const handleRefresh = () => {
    if (selectedSnapshotId) {
      fetchAnalysis(selectedSnapshotId);
    }
  };

  const currentSnapshot = snapshots.find(s => s.id === selectedSnapshotId);

  return (
    <>
      <div className="space-y-6">
        {/* Input Data Button - Opens Modal */}
        <button
          onClick={() => setShowInputModal(true)}
          className="w-full"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all cursor-pointer shadow-sm">
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">Input Data</p>
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

        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-normal">Predictions & Analysis</h1>
        <div className="flex gap-2 items-center">
          <select
            value={selectedSnapshotId || ""}
            onChange={(e) => handleSnapshotChange(e.target.value)}
            className="px-4 py-2.5 rounded-lg border bg-white text-sm appearance-none cursor-pointer outline-none hover:border-blue-400 focus:border-blue-500"
          >
            <option value="">-- Select Snapshot --</option>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {snapshot.title} ({snapshot._count?.results || 0} results)
              </option>
            ))}
          </select>
          {selectedSnapshotId && (
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <Icon type={loading ? "loader" : "refresh"} className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {currentSnapshot && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border w-fit">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentSnapshot.color }}></div>
          <span className="text-sm font-medium">{currentSnapshot.title}</span>
          <span className="text-xs text-gray-500">({currentSnapshot._count?.results || 0} data)</span>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon type="loader" className="w-8 h-8 mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Analyzing historical data...</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <PredictionPanel analysis={analysis} />
      )}

      {!loading && !selectedSnapshotId && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a snapshot from the dropdown above to analyze historical data and generate predictions
            </p>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Input Modal */}
      <InputModal 
        isOpen={showInputModal} 
        onClose={() => setShowInputModal(false)}
        buttonLabel="Simpan Data"
      />
    </>
  );
}
