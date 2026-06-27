"use client";

import { useState } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { InputModal } from "@/components/InputModal";

export default function DashboardPage() {
  const [showInputModal, setShowInputModal] = useState(false);

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

        {/* Dashboard Content */}
        <DashboardContentWithModal />
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

// Wrap DashboardContent to handle modal visibility
function DashboardContentWithModal() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showInputModal, setShowInputModal] = useState(false);

  const labels = {
    title: "Dashboard",
    results: "Results",
    top: "Top",
    low: "Low",
    predictionLeader: "Prediction Leader",
    exportCsv: "Export CSV",
    exportExcel: "Export Excel",
    exportPdf: "Export PDF",
    rank: "Rank",
    digit: "Digit",
    score: "Score",
    confidence: "Confidence",
    predictionTop: "Top Prediction",
    saveSnapshot: "Save Snapshot",
    inputData: "Input Data",
    scanOcr: "Scan OCR",
    memuatData: "Memuat data snapshot..."
  };

  return (
    <>
      <DashboardContent 
        key={refreshKey}
        initialSnapshots={[]}
        labels={labels}
      />
    </>
  );
}
