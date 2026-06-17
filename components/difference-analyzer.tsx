"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  analyzeDifferences,
  parseResultsFromText,
  getFrequencyData,
  getDifferenceDistribution,
  POSITION_KEY_MAP,
  type AnalysisResult,
  type Position,
  type PositionKey,
  type DifferenceRow,
} from "@/lib/difference-analysis";

function Icon({ type, className = "" }: { type: "upload" | "check" | "alert" | "loader" | "camera" | "plus" | "trash" | "table" | "chart"; className?: string }) {
  const paths: Record<string, string> = {
    upload: "M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
    check: "M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    alert: "M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    camera: "M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z",
    plus: "M12 4.5v15m7.5-7.5h-15",
    trash: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
    table: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 0 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 0 6 13.125v-1.5m0-5.25v-1.5c0-.621.504-1.125 1.125-1.125H18m-1.5 0H6m0 0h1.5M6 5.625h1.5m0 0H6m0 0v1.5M18 5.625v1.5M18 5.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M6 13.125h1.5m0 0h1.5M6 13.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75m-9.75 0A1.125 1.125 0 0 1 6 12.75v-1.5m0-5.25v-1.5c0-.621.504-1.125 1.125-1.125H18m0 0h1.5M6 12.75V5.625m0 12.75c0 .621.504 1.125 1.125 1.125H6m0 0h9.75M18 19.5h-9.75M18 19.5a1.125 1.125 0 0 0 1.125-1.125V18m0 0v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M18 13.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M18 13.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H6m0 0h9.75M6 13.125H4.875A1.125 1.125 0 0 0 3.75 14.25V18m0 0v1.5c0 .621.504 1.125 1.125 1.125H6",
    chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
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

// OCR Correction map
const OCR_CORRECTIONS: Record<string, string> = {
  O: "0", o: "0",
  I: "1", l: "1", "|": "1",
  Z: "2", z: "2",
  S: "5", s: "5",
  B: "8",
};

function cleanOCRText(text: string): string {
  let corrected = text;
  for (const [wrong, correct] of Object.entries(OCR_CORRECTIONS)) {
    corrected = corrected.split(wrong).join(correct);
  }
  return corrected.replace(/[^0-9\n]/g, " ").replace(/\s+/g, " ").trim();
}

// Dashboard Card Component
function DashboardCard({ label, value, detail, icon }: { label: string; value: string | number; detail?: string; icon: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            icon === "trending-up" ? "bg-green-100" :
            icon === "trending-down" ? "bg-red-100" :
            icon === "arrow-right" ? "bg-blue-100" :
            "bg-gray-100"
          }`}>
            <Icon 
              type={icon === "arrow-right" ? "upload" : icon === "trending-up" ? "check" : icon === "trending-down" ? "alert" : "table"} 
              className={`w-5 h-5 ${
                icon === "trending-up" ? "text-green-600" :
                icon === "trending-down" ? "text-red-600" :
                icon === "arrow-right" ? "text-blue-600" :
                "text-gray-600"
              }`} 
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analysis Table Component
function AnalysisTable({ position, differences, analysis }: { position: Position; differences: DifferenceRow[]; analysis: AnalysisResult }) {
  const positionKey = POSITION_KEY_MAP[position];
  const stats = analysis.statistics[positionKey];
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{position} Analysis</CardTitle>
          <span className="text-sm text-muted-foreground">
            Avg: {stats.avgDifference.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <thead className="bg-gray-50/50">
              <Tr>
                <Th className="text-center">Previous</Th>
                <Th className="text-center">Current</Th>
                <Th className="text-center">Difference</Th>
              </Tr>
            </thead>
            <tbody>
              {differences.slice(0, 20).map((row, idx) => (
                <Tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/30" : ""}>
                  <Td className="text-center font-mono">
                    {row.previous !== null ? row.previous[positionKey] : "-"}
                  </Td>
                  <Td className="text-center font-mono font-bold">
                    {row.current[positionKey]}
                  </Td>
                  <Td className={`text-center font-mono font-semibold ${
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

// Statistics Component
function StatisticsCard({ position, stats }: { position: Position; stats: AnalysisResult["statistics"][PositionKey] }) {
  const diffLabels = [-3, -2, -1, 1, 2, 3];
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-3">
        <CardTitle className="text-lg">{position} Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Difference Counts */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {diffLabels.map((diff) => (
            <div key={diff} className="p-2 rounded-lg bg-gray-50">
              <p className={`text-xs ${diff > 0 ? "text-green-600" : "text-red-600"}`}>
                {diff > 0 ? "+" : ""}{diff}
              </p>
              <p className="text-lg font-bold">{stats.counts[diff] || 0}</p>
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="pt-2 border-t space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Average Difference</span>
            <span className={`font-semibold ${stats.avgDifference > 0 ? "text-green-600" : stats.avgDifference < 0 ? "text-red-600" : ""}`}>
              {stats.avgDifference > 0 ? "+" : ""}{stats.avgDifference.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Positive Changes</span>
            <span className="font-semibold text-green-600">{stats.positiveCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Negative Changes</span>
            <span className="font-semibold text-red-600">{stats.negativeCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">No Change</span>
            <span className="font-semibold text-gray-600">{stats.zeroCount}</span>
          </div>
          {stats.mostFrequent && (
            <div className="flex justify-between text-sm pt-1 border-t">
              <span className="text-muted-foreground">Most Frequent</span>
              <span className={`font-semibold ${stats.mostFrequent.value > 0 ? "text-green-600" : stats.mostFrequent.value < 0 ? "text-red-600" : "text-gray-600"}`}>
                {stats.mostFrequent.value > 0 ? "+" : ""}{stats.mostFrequent.value} ({stats.mostFrequent.count}x)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DifferenceAnalyzer() {
  const [manualInput, setManualInput] = useState("");
  const [ocrResult, setOcrResult] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Perform analysis when OCR result or manual input changes
  useEffect(() => {
    const textToAnalyze = ocrResult || manualInput;
    if (textToAnalyze.trim()) {
      const results = parseResultsFromText(textToAnalyze);
      if (results.length > 0) {
        const analysisResult = analyzeDifferences(results);
        setAnalysis(analysisResult);
        setMessage({ type: "success", text: `Analyzed ${results.length} results successfully` });
      } else {
        setAnalysis(null);
        if (textToAnalyze.trim()) {
          setMessage({ type: "error", text: "No valid 4-digit numbers found" });
        }
      }
    } else {
      setAnalysis(null);
    }
  }, [ocrResult, manualInput]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
        const event = new Event("change", { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  }, []);

  const handleScan = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "error", text: "Please select an image first" });
      return;
    }

    setScanning(true);
    setScanStatus("Scanning OCR...");
    setMessage(null);

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setScanStatus(`Scanning OCR... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const cleaned = cleanOCRText(result.data.text);
      setOcrResult(cleaned);
      setScanStatus("");
      setMessage({ type: "success", text: "OCR scan completed successfully" });
    } catch {
      setMessage({ type: "error", text: "OCR scan failed. Please try manual input." });
    } finally {
      setScanning(false);
    }
  };

  const handleClear = () => {
    setManualInput("");
    setOcrResult("");
    setPreview(null);
    setAnalysis(null);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const frequencyData = analysis ? getFrequencyData(analysis.parsedResults) : null;
  const differenceData = analysis ? getDifferenceDistribution(analysis.statistics) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">4D Historical Difference Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyze historical 4D results and calculate digit differences</p>
      </div>

      {/* Input Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Icon type="upload" className="w-5 h-5" />
            Data Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* OCR Image Upload - Optional */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Upload Image (Optional OCR)</label>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">Optional</span>
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer 
                transition-all duration-300 ease-in-out
                ${isDragging 
                  ? "border-blue-500 bg-blue-50/50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }
                ${scanning ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
                  <Icon type={isDragging ? "camera" : "upload"} className={`w-6 h-6 ${isDragging ? "text-blue-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? "Drop image here" : "Click or drag image to select"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP</p>
                </div>
              </div>
            </div>

            {preview && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={preview} alt="Preview" className="w-full h-auto max-h-40 object-contain bg-gray-50" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleScan}
                disabled={scanning || !preview}
                variant="outline"
                className="flex-1"
              >
                {scanning ? (
                  <>
                    <Icon type="loader" className="w-4 h-4 animate-spin mr-2" />
                    {scanStatus}
                  </>
                ) : (
                  <>
                    <Icon type="camera" className="w-4 h-4 mr-2" />
                    Scan Image
                  </>
                )}
              </Button>
              <Button onClick={handleClear} variant="ghost" className="h-9 w-9 p-0">
                <Icon type="trash" className="w-4 h-4" />
              </Button>
            </div>

            {scanning && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-3">
                <p className="text-sm text-blue-600">{scanStatus}</p>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Manual Input / OCR Result
            </label>
            <Textarea
              value={ocrResult || manualInput}
              onChange={(e) => {
                setOcrResult("");
                setManualInput(e.target.value);
              }}
              placeholder={"Enter 4-digit numbers (one per line) or paste OCR result..."}
              rows={6}
              className="font-mono"
            />
            {analysis && (
              <p className="text-xs text-green-600">
                {analysis.parsedResults.length} valid 4-digit numbers detected
              </p>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
              message.type === "success" 
                ? "border-green-200 bg-green-50" 
                : "border-red-200 bg-red-50"
            }`}>
              <Icon 
                type={message.type === "success" ? "check" : "alert"} 
                className={`w-5 h-5 flex-shrink-0 ${message.type === "success" ? "text-green-600" : "text-red-600"}`} 
              />
              <p className={`text-sm font-medium ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>
                {message.text}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {analysis && (
        <>
          {/* Dashboard Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              label="Total Results"
              value={analysis.summary.totalResults}
              icon="table"
            />
            <DashboardCard
              label="Total Transitions"
              value={analysis.summary.totalTransitions}
              icon="arrow-right"
            />
            <DashboardCard
              label="Most Common Increase"
              value={analysis.summary.mostCommonIncrease ? 
                `+${analysis.summary.mostCommonIncrease.diff} (${analysis.summary.mostCommonIncrease.position})` : 
                "N/A"
              }
              detail={analysis.summary.mostCommonIncrease ? `${analysis.summary.mostCommonIncrease.count}x` : ""}
              icon="trending-up"
            />
            <DashboardCard
              label="Most Common Decrease"
              value={analysis.summary.mostCommonDecrease ? 
                `${analysis.summary.mostCommonDecrease.diff} (${analysis.summary.mostCommonDecrease.position})` : 
                "N/A"
              }
              detail={analysis.summary.mostCommonDecrease ? `${analysis.summary.mostCommonDecrease.count}x` : ""}
              icon="trending-down"
            />
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatisticsCard position="AS" stats={analysis.statistics.as} />
            <StatisticsCard position="KOP" stats={analysis.statistics.kop} />
            <StatisticsCard position="KEPALA" stats={analysis.statistics.kepala} />
            <StatisticsCard position="EKOR" stats={analysis.statistics.ekor} />
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Difference Distribution Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon type="chart" className="w-5 h-5" />
                  Difference Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
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
                      <XAxis dataKey="difference" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon type="chart" className="w-5 h-5" />
                  Digit Frequency
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
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
                      <XAxis dataKey="digit" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
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

          {/* Analysis Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position) => (
              <AnalysisTable
                key={position}
                position={position}
                differences={analysis.differences}
                analysis={analysis}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!analysis && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon type="table" className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Upload an image for OCR scanning or manually enter 4-digit numbers to start analyzing differences
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}