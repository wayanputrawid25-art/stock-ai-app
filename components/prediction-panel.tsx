"use client";

import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface Candidate {
  number: string;
  score: number;
  confidence: number;
  reason: string;
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
  predictions: {
    "2d": Candidate[];
    "3d": Candidate[];
    "4d": Candidate[];
  };
  json: {
    hot_digit: number[];
    cold_digit: number[];
    position_analysis: Record<string, number[]>;
    prediction_2d: Array<{ number: string; score: number }>;
    prediction_3d: Array<{ number: string; score: number }>;
    prediction_4d: Array<{ number: string; score: number }>;
  };
}

// Icon components
function Icon({ name, className = "" }: { name: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    fire: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12.452 4.353c.845.642 1.335 1.591 1.336 2.647a3.5 3.5 0 0 1-3.5 3.5c-1.354 0-2.694-.77-3.323-1.95L4.586 7.8a4.5 4.5 0 0 1 1.997-1.124L9 5.1l2.452 1.577Z" />
      </svg>
    ),
    snow: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
      </svg>
    ),
    copy: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    ),
    check: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    download: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    chart: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  };
  return icons[name] || icons.chart;
}

// Score Bar Component
function ScoreBar({ score }: { score: number }) {
  const percentage = Math.min(100, score);
  const getColor = (s: number) => {
    if (s >= 85) return "from-emerald-500 to-green-400";
    if (s >= 70) return "from-primary to-primary-light";
    if (s >= 50) return "from-amber-500 to-yellow-400";
    return "from-slate-400 to-slate-300";
  };
  
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getColor(score)}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Digit Badge Component
function DigitBadge({ digit, type, size = "default" }: { digit: number; type: "hot" | "cold" | "normal"; size?: "sm" | "default" | "lg" }) {
  const styles = {
    hot: "bg-gradient-to-br from-hot/20 to-hot-light text-hot border-hot/30",
    cold: "bg-gradient-to-br from-cold/20 to-cold-light text-cold border-cold/30",
    normal: "bg-slate-100 text-slate-700 border-slate-200",
  };
  
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg text-sm",
    default: "w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-lg sm:text-xl",
    lg: "w-12 h-12 rounded-xl text-xl sm:text-2xl",
  };

  return (
    <span className={`inline-flex items-center justify-center border-2 font-bold digit-display ${sizeClasses[size]} ${styles[type]}`}>
      {digit}
    </span>
  );
}

// Candidate Card Component
function CandidateCard({ candidate, rank }: { candidate: Candidate; rank: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isTop = rank <= 3;

  return (
    <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 ${isTop ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${isTop ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
            {rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-mono font-bold text-xl sm:text-2xl tracking-wider digit-display">{candidate.number}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                title="Copy number"
              >
                <Icon name={copied ? "check" : "copy"} className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">{candidate.reason}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-16 sm:w-24">
            <ScoreBar score={candidate.score} />
          </div>
          <div className="text-right">
            <span className="text-base sm:text-lg font-bold text-primary">{candidate.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Prediction Panel Component
interface PredictionPanelProps {
  analysis: HistoricalAnalysisResult | null;
}

export function PredictionPanel({ analysis }: PredictionPanelProps) {
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
      <Card className="overflow-hidden">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Icon name="chart" className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-muted-foreground">Analyze historical data to generate predictions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card hover className="overflow-hidden">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                <Icon name="chart" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Records</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{analysis.summary.totalRecords.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover className="overflow-hidden">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-secondary/10 flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Last</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold font-mono tracking-wider truncate">{analysis.summary.lastResult || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover className="overflow-hidden">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-hot/10 flex-shrink-0">
                <Icon name="fire" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-hot" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Hot</p>
                <div className="flex gap-1 mt-1">
                  {analysis.hotDigits.slice(0, 6).map((d) => (
                    <span key={d} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-hot/20 text-hot text-xs sm:text-sm font-bold flex items-center justify-center">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover className="overflow-hidden">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-cold/10 flex-shrink-0">
                <Icon name="snow" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cold" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Cold</p>
                <div className="flex gap-1 mt-1">
                  {analysis.coldDigits.slice(0, 6).map((d) => (
                    <span key={d} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-cold/20 text-cold text-xs sm:text-sm font-bold flex items-center justify-center">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hot & Cold Digits Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-hot/10 to-transparent border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-hot">
                <Icon name="fire" className="w-5 h-5" />
                Hot Digits
              </CardTitle>
              <Badge variant="hot" size="md">Top 6</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {analysis.hotDigits.map((digit) => (
                <DigitBadge key={`hot-${digit}`} digit={digit} type="hot" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Most frequently appearing digits
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cold/10 to-transparent border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-cold">
                <Icon name="snow" className="w-5 h-5" />
                Cold Digits
              </CardTitle>
              <Badge variant="cold" size="md">Top 6</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {analysis.coldDigits.map((digit) => (
                <DigitBadge key={`cold-${digit}`} digit={digit} type="cold" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              May be &quot;due&quot; to appear
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Position Analysis */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b">
          <CardTitle>Position Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position, idx) => {
              const colors = ["text-primary", "text-secondary", "text-success", "text-info"];
              return (
                <div key={position} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${idx === 0 ? 'from-primary to-primary-light' : idx === 1 ? 'from-secondary to-secondary-light' : idx === 2 ? 'from-success to-emerald-400' : 'from-info to-cyan-400'} text-white flex items-center justify-center font-bold text-sm`}>
                      {position.charAt(0)}
                    </span>
                    <span className="font-semibold">{position}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.positionAnalysis[position].hotDigits.map((digit) => (
                      <DigitBadge key={`${position}-hot-${digit}`} digit={digit} type="hot" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2D Candidates */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">2D</span>
              2-Digit Candidates
            </CardTitle>
            <Badge variant="secondary">Top 10</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {analysis.predictions["2d"].slice(0, 10).map((candidate, idx) => (
            <CandidateCard key={`2d-${idx}`} candidate={candidate} rank={idx + 1} />
          ))}
        </CardContent>
      </Card>

      {/* 3D Candidates */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">3D</span>
              3-Digit Candidates
            </CardTitle>
            <Badge variant="secondary">Top 10</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {analysis.predictions["3d"].slice(0, 10).map((candidate, idx) => (
            <CandidateCard key={`3d-${idx}`} candidate={candidate} rank={idx + 1} />
          ))}
        </CardContent>
      </Card>

      {/* 4D Candidates */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50/50 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold">4D</span>
              4-Digit Candidates
            </CardTitle>
            <Badge variant="secondary">Top 20</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {analysis.predictions["4d"].slice(0, 20).map((candidate, idx) => (
            <CandidateCard key={`4d-${idx}`} candidate={candidate} rank={idx + 1} />
          ))}
        </CardContent>
      </Card>

      {/* JSON Output */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              JSON Output
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyJson} className="gap-2">
                <Icon name={jsonCopied ? "check" : "copy"} className="w-4 h-4" />
                {jsonCopied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadJson} className="gap-2">
                <Icon name="download" className="w-4 h-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowJson(!showJson)}>
                {showJson ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showJson && (
          <CardContent className="p-0">
            <pre className="p-4 rounded-b-xl bg-slate-900 text-green-400 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(analysis.json, null, 2)}
            </pre>
          </CardContent>
        )}
      </Card>

      {/* Disclaimer */}
      <Card className="overflow-hidden border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-amber-800">
              <strong>Disclaimer:</strong> This analysis is based on historical data patterns and statistical probability. It does not guarantee future results. Please gamble responsibly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PredictionPanel;
