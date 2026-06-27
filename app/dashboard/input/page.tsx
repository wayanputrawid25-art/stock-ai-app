"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputModal } from "@/components/InputModal";

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

interface DigitAnalysis {
  position: string;
  digit: number;
  count: number;
  percentage: number;
}

interface CompositionResult {
  evenOddBalance: Record<string, { count: number; percentage: number }>;
  summation: Record<string, { count: number; percentage: number }>;
  digitFrequency: DigitAnalysis[];
}

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

export default function InputPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CompositionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      const response = await fetch("/api/snapshots");
      if (response.ok) {
        const data = await response.json();
        setSnapshots(data.snapshots || []);
        if (data.snapshots?.length > 0 && !selectedSnapshotId) {
          setSelectedSnapshotId(data.snapshots[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch snapshots:", error);
    }
  };

  const fetchAnalysis = async (snapshotId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/digit-composition?snapshot=${snapshotId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSnapshotId) {
      fetchAnalysis(selectedSnapshotId);
    }
  }, [selectedSnapshotId]);

  const currentSnapshot = snapshots.find(s => s.id === selectedSnapshotId);

  return (
    <div className="space-y-6">
      {/* Input Data Button */}
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

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Pendekatan Komposisi Digit</h1>
        <p className="text-sm text-muted-foreground mt-1">Analisis komposisi angka 4D: keseimbangan genap-ganjil dan jumlah total</p>
      </div>

      {/* Snapshot Selector */}
      <CollapsibleSection title="Pilih Snapshot" defaultOpen={true}>
        <div className="space-y-3">
          <select
            value={selectedSnapshotId || ""}
            onChange={(e) => setSelectedSnapshotId(e.target.value || null)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm appearance-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="">-- Pilih Snapshot --</option>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {snapshot.title} ({snapshot._count?.results || 0} data)
              </option>
            ))}
          </select>
          
          {currentSnapshot && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border w-fit">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentSnapshot.color }}></div>
              <span className="text-sm font-medium">{currentSnapshot.title}</span>
              <span className="text-xs text-gray-500">({currentSnapshot._count?.results || 0} data)</span>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
            </svg>
            <p className="text-muted-foreground">Menganalisis komposisi digit...</p>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!loading && !analysis && selectedSnapshotId && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada data untuk dianalisis</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {!loading && analysis && (
        <>
          {/* Even-Odd Balance Section */}
          <CollapsibleSection 
            title={
              <span className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <span>Keseimbangan Genap-Ganjil</span>
              </span>
            } 
            defaultOpen={true}
          >
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Analisis rasio antara jumlah angka genap dan ganjil dalam setiap kombinasi 4D.
                Contoh: kombinasi "1234" memiliki 2 angka genap (2, 4) dan 2 angka ganjil (1, 3).
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(analysis.evenOddBalance || {}).map(([balance, data]) => (
                  <div key={balance} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 text-center border">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg font-bold text-slate-700">{balance}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{data.count}</div>
                    <div className="text-xs text-gray-500">{data.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Insight</h4>
                <p className="text-sm text-blue-700">
                  Kombinasi dengan keseimbangan {Object.entries(analysis.evenOddBalance || {}).sort((a, b) => b[1].count - a[1].count)[0]?.[0]} 
                  {" "}paling sering muncul ({Object.entries(analysis.evenOddBalance || {}).sort((a, b) => b[1].count - a[1].count)[0]?.[1].percentage.toFixed(1)}%).
                  Pertimbangkan untuk menyeimbangkan antara angka genap dan ganjil dalam prediksi Anda.
                </p>
              </div>
            </CardContent>
          </CollapsibleSection>

          {/* Summation Section */}
          <CollapsibleSection 
            title={
              <span className="flex items-center gap-2">
                <span className="text-xl">🔢</span>
                <span>Jumlah Total (Summation)</span>
              </span>
            } 
            defaultOpen={true}
          >
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Menjumlahkan keempat digit untuk setiap kombinasi 4D. 
                Contoh: 1234 → 1+2+3+4 = 10. Analisis melihat angka jumlah mana yang paling sering muncul.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(analysis.summation || {})
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 18)
                  .map(([sum, data]) => (
                    <div 
                      key={sum} 
                      className={`rounded-lg p-3 text-center border ${
                        data.percentage > 10 
                          ? "bg-green-100 border-green-300" 
                          : data.percentage > 5 
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">Sum = {sum}</div>
                      <div className={`text-xl font-bold ${
                        data.percentage > 10 
                          ? "text-green-700" 
                          : data.percentage > 5 
                            ? "text-blue-700"
                            : "text-gray-700"
                      }`}>{data.count}</div>
                      <div className="text-xs text-gray-500">{data.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📊 Insight</h4>
                <p className="text-sm text-green-700">
                  Jumlah total (summation) paling sering muncul adalah {" "}
                  <span className="font-bold">
                    {Object.entries(analysis.summation || {}).sort((a, b) => b[1].count - a[1].count)[0]?.[0]}
                  </span>
                  {" "}dengan {Object.entries(analysis.summation || {}).sort((a, b) => b[1].count - a[1].count)[0]?.[1].count} kemunculan 
                  ({Object.entries(analysis.summation || {}).sort((a, b) => b[1].count - a[1].count)[0]?.[1].percentage.toFixed(1)}%).
                </p>
              </div>
            </CardContent>
          </CollapsibleSection>

          {/* Digit Frequency */}
          <CollapsibleSection 
            title={
              <span className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <span>Frekuensi Digit</span>
              </span>
            } 
            defaultOpen={false}
          >
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Frekuensi kemunculan setiap digit (0-9) pada setiap posisi dalam kombinasi 4D.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {["AS", "KOP", "KEPALA", "EKOR"].map((position) => (
                  <Card key={position} className="shadow-sm">
                    <CardHeader className="py-2 px-3 bg-slate-100">
                      <CardTitle className="text-sm text-center">{position}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="grid grid-cols-5 gap-1">
                        {analysis.digitFrequency
                          .filter(d => d.position === position)
                          .sort((a, b) => b.count - a.count)
                          .map((d) => (
                            <div key={d.digit} className="text-center">
                              <div className={`text-lg font-bold ${
                                d.percentage > 15 ? "text-green-600" : d.percentage > 10 ? "text-blue-600" : "text-gray-700"
                              }`}>{d.digit}</div>
                              <div className="text-xs text-gray-500">{d.count}</div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </CollapsibleSection>
        </>
      )}

      {/* Input Modal */}
      <InputModal 
        isOpen={showInputModal} 
        onClose={() => setShowInputModal(false)}
        buttonLabel="Simpan Data"
      />
    </div>
  );
}
