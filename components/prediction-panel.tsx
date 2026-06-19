"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th, Tr } from "@/components/ui/table";

// Types
interface DigitFrequency {
  digit: number;
  count: number;
  percentage: number;
}

interface AnalysisSummary {
  totalRecords: number;
  lastDate: string | null;
  lastResult: string | null;
  dateRange: string;
}

interface PositionPrediction {
  position: string;
  topDigits: Array<{ digit: number; score: number; confidence: number }>;
}

interface Candidate {
  number: string;
  score: number;
  confidence: number;
  reason: string;
}

interface PatternAnalysis {
  oddEvenRatio: { odd: number; even: number; oddPercent: number };
  bigSmallRatio: { big: number; small: number; bigPercent: number };
}

interface HistoricalAnalysisResult {
  summary: AnalysisSummary;
  overallFrequency: DigitFrequency[];
  hotDigits: number[];
  coldDigits: number[];
  positionAnalysis: {
    AS: { hotDigits: number[]; coldDigits: number[] };
    KOP: { hotDigits: number[]; coldDigits: number[] };
    KEPALA: { hotDigits: number[]; coldDigits: number[] };
    EKOR: { hotDigits: number[]; coldDigits: number[] };
  };
  patternAnalysis: PatternAnalysis;
  predictions: {
    "2d": Candidate[];
    "3d": Candidate[];
    "4d": Candidate[];
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

// Icon Component
function Icon({ type, className = "" }: { type: "fire" | "snow" | "copy" | "check" | "download" | "chart"; className?: string }) {
  const paths: Record<string, string> = {
    fire: "M12.452 4.353c.845.642 1.335 1.591 1.336 2.647a3.5 3.5 0 0 1-3.5 3.5c-1.354 0-2.694-.77-3.323-1.95L4.586 7.8a4.5 4.5 0 0 1 1.997-1.124L9 5.1l2.452 1.577ZM8.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z",
    snow: "M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07",
    copy: "M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M16 4h2a2 2 0 0 1 2 2v2M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2M8 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H8Z",
    check: "M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    download: "M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4",
    chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={paths[type] || paths.chart} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Score Bar Component
function ScoreBar({ score }: { score: number }) {
  const percentage = Math.min(100, score);
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : "bg-gray-400";
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Digit Badge Component
function DigitBadge({ digit, type }: { digit: number; type: "hot" | "cold" | "normal" }) {
  const colors = {
    hot: "bg-orange-100 text-orange-800 border-orange-300",
    cold: "bg-cyan-100 text-cyan-800 border-cyan-300",
    normal: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-bold ${colors[type]}`}>
      {digit}
    </span>
  );
}

// Candidate Row Component
function CandidateRow({ candidate, rank }: { candidate: Candidate; rank: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tr className={rank % 2 === 0 ? "bg-gray-50/50" : ""}>
      <Td className="text-center font-bold text-lg">{rank}</Td>
      <Td className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono font-bold text-lg tracking-wider">{candidate.number}</span>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Copy number"
          >
            <Icon type={copied ? "check" : "copy"} className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </Td>
      <Td className="text-center">
        <div className="flex items-center justify-center gap-2">
          <ScoreBar score={candidate.score} />
          <span className="text-sm font-medium w-12 text-right">{candidate.score}</span>
        </div>
      </Td>
      <Td className="text-center text-sm text-gray-600 hidden md:table-cell">{candidate.reason}</Td>
    </Tr>
  );
}

// Main Prediction Panel Component
interface PredictionPanelProps {
  analysis: HistoricalAnalysisResult | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function PredictionPanel({ analysis, loading, onRefresh }: PredictionPanelProps) {
  const [showJson, setShowJson] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const handleCopyJson = () => {
    if (analysis) {
      navigator.clipboard.writeText(JSON.stringify(analysis.json, null, 2));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 1500);
    }
  };

  const handleDownloadJson = () => {
    if (analysis) {
      const blob = new Blob([JSON.stringify(analysis.json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prediction-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!analysis) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon type="chart" className="w-5 h-5" />
            Predictions & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Analyze historical data to generate predictions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{analysis.summary.totalRecords}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Result</p>
            <p className="text-2xl font-bold font-mono">{analysis.summary.lastResult || "-"}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Date Range</p>
            <p className="text-sm font-medium truncate">{analysis.summary.dateRange}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-sm font-medium">
              {analysis.summary.lastDate
                ? new Date(analysis.summary.lastDate).toLocaleDateString()
                : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hot & Cold Digits */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Icon type="fire" className="w-5 h-5" />
                Hot Digits
              </CardTitle>
              <Badge variant="secondary">{analysis.hotDigits.length} digits</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {analysis.hotDigits.map((digit) => (
                <DigitBadge key={`hot-${digit}`} digit={digit} type="hot" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Most frequently appearing digits in recent draws
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <Icon type="snow" className="w-5 h-5" />
                Cold Digits
              </CardTitle>
              <Badge variant="secondary">{analysis.coldDigits.length} digits</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {analysis.coldDigits.map((digit) => (
                <DigitBadge key={`cold-${digit}`} digit={digit} type="cold" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Digits that appear less frequently - may be &quot;due&quot; to appear
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Position Analysis */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Position Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position) => (
              <div key={position} className="p-3 rounded-lg bg-gray-50 border">
                <p className="font-semibold mb-2">{position}</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.positionAnalysis[position].hotDigits.map((digit) => (
                    <DigitBadge key={`${position}-hot-${digit}`} digit={digit} type="hot" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2D Candidates */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>2D Candidates (2-digit)</CardTitle>
            <Badge variant="secondary">Top 10</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead className="bg-gray-50/50">
              <Tr>
                <Th className="text-center">#</Th>
                <Th className="text-center">Number</Th>
                <Th className="text-center w-1/3">Score</Th>
                <Th className="text-center hidden md:table-cell">Reason</Th>
              </Tr>
            </thead>
            <tbody>
              {analysis.predictions["2d"].slice(0, 10).map((candidate, idx) => (
                <CandidateRow key={`2d-${idx}`} candidate={candidate} rank={idx + 1} />
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      {/* 3D Candidates */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>3D Candidates (3-digit)</CardTitle>
            <Badge variant="secondary">Top 10</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead className="bg-gray-50/50">
              <Tr>
                <Th className="text-center">#</Th>
                <Th className="text-center">Number</Th>
                <Th className="text-center w-1/3">Score</Th>
                <Th className="text-center hidden md:table-cell">Reason</Th>
              </Tr>
            </thead>
            <tbody>
              {analysis.predictions["3d"].slice(0, 10).map((candidate, idx) => (
                <CandidateRow key={`3d-${idx}`} candidate={candidate} rank={idx + 1} />
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      {/* 4D Candidates */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>4D Candidates (4-digit)</CardTitle>
            <Badge variant="secondary">Top 20</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead className="bg-gray-50/50">
              <Tr>
                <Th className="text-center">#</Th>
                <Th className="text-center">Number</Th>
                <Th className="text-center w-1/3">Score</Th>
                <Th className="text-center hidden md:table-cell">Reason</Th>
              </Tr>
            </thead>
            <tbody>
              {analysis.predictions["4d"].slice(0, 20).map((candidate, idx) => (
                <CandidateRow key={`4d-${idx}`} candidate={candidate} rank={idx + 1} />
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground mb-1">Odd/Even Ratio</p>
              <p className="text-lg font-bold">
                {analysis.patternAnalysis.oddEvenRatio.oddPercent.toFixed(1)}% Odd /{" "}
                {(100 - analysis.patternAnalysis.oddEvenRatio.oddPercent).toFixed(1)}% Even
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground mb-1">Big/Small Ratio</p>
              <p className="text-lg font-bold">
                {analysis.patternAnalysis.bigSmallRatio.bigPercent.toFixed(1)}% Big (5-9) /{" "}
                {(100 - analysis.patternAnalysis.bigSmallRatio.bigPercent).toFixed(1)}% Small (0-4)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON Output Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>JSON Output</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyJson}>
                <Icon type={jsonCopied ? "check" : "copy"} className="w-4 h-4 mr-1" />
                {jsonCopied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                <Icon type="download" className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowJson(!showJson)}>
                {showJson ? "Hide" : "Show"} JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        {showJson && (
          <CardContent>
            <pre className="p-4 rounded-lg bg-gray-900 text-green-400 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(analysis.json, null, 2)}
            </pre>
          </CardContent>
        )}
      </Card>

      {/* Disclaimer */}
      <Card className="shadow-sm border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> This analysis is based on historical data patterns and
            statistical probability. It does not guarantee future results. Please gamble
            responsibly and within your means.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PredictionPanel;
