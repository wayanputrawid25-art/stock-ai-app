"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { 
  History, Play, RefreshCw, 
  TrendingUp, Target, Percent,
  Table2, BarChart3, PieChart as PieChartIcon,
  Info, Hash
} from "lucide-react";

// Types
type Position = "AS" | "KOP" | "KEPALA" | "EKOR";
type OrderDepth = 1 | 2 | 3;
type TrainingSize = "50" | "100" | "200" | "all";
type PredictionTop = 1 | 3 | 5;

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

interface Prediction {
  digit: number;
  count: number;
  probability: number;
}

interface BacktestDetail {
  index: number;
  pattern: string;
  actual: number;
  predictedTop1: number;
  predictedTop3: number[];
  predictedTop5: number[];
  hitTop1: boolean;
  hitTop3: boolean;
  hitTop5: boolean;
}

interface BacktestResult {
  totalTests: number;
  hitTop1: number;
  hitTop3: number;
  hitTop5: number;
  accuracyTop1: number;
  accuracyTop3: number;
  accuracyTop5: number;
  details: BacktestDetail[];
}

interface PatternFrequency {
  pattern: string;
  nextNumber: number;
  count: number;
  probability: number;
}

interface Analysis {
  position: Position;
  orderDepth: OrderDepth;
  trainingSize: number;
  currentPattern: string;
  predictions: {
    currentPattern: string;
    predictions: Prediction[];
    totalOccurrences: number;
  };
  patternFrequency: PatternFrequency[];
  backtest: BacktestResult;
}

// Color palette
const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];

// Position colors
const POSITION_COLORS: Record<Position, string> = {
  AS: "bg-red-100 text-red-700 border-red-300",
  KOP: "bg-blue-100 text-blue-700 border-blue-300",
  KEPALA: "bg-green-100 text-green-700 border-green-300",
  EKOR: "bg-purple-100 text-purple-700 border-purple-300",
};

const POSITION_LABELS: Record<Position, string> = {
  AS: "AS (1st)",
  KOP: "KOP (2nd)",
  KEPALA: "KEPALA (3rd)",
  EKOR: "EKOR (4th)",
};

export function HistoryJourneyPanel({ 
  snapshots, 
  selectedSnapshotId 
}: { 
  snapshots: Snapshot[];
  selectedSnapshotId: string | null;
}) {
  // State
  const [position, setPosition] = useState<Position>("AS");
  const [orderDepth, setOrderDepth] = useState<OrderDepth>(1);
  const [trainingSize, setTrainingSize] = useState<TrainingSize>("all");
  const [topCount, setTopCount] = useState<PredictionTop>(5);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"summary" | "frequency" | "backtest">("summary");

  const runAnalysis = useCallback(async () => {
    if (!selectedSnapshotId) {
      setError("Please select a snapshot first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        snapshot: selectedSnapshotId,
        position,
        orderDepth: String(orderDepth),
        trainingSize,
        topCount: String(topCount),
      });

      const response = await fetch(`/api/dashboard/history-journey?${params}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSnapshotId, position, orderDepth, trainingSize, topCount]);

  // Auto-run when snapshot changes
  useEffect(() => {
    if (selectedSnapshotId) {
      runAnalysis();
    }
  }, [selectedSnapshotId]);

  // Format order depth label
  const getOrderLabel = (order: OrderDepth) => {
    switch (order) {
      case 1: return "Order-1 (1 digit)";
      case 2: return "Order-2 (2 digits)";
      case 3: return "Order-3 (3 digits)";
    }
  };

  // Render summary view
  const renderSummary = () => {
    if (!analysis) return null;

    const { predictions, backtest, currentPattern, patternFrequency } = analysis;

    return (
      <div className="space-y-6">
        {/* Current Pattern & Prediction */}
        <Card className="border-2 border-amber-200">
          <CardHeader className="bg-amber-50 pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Target className="w-5 h-5" />
              Current Pattern Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Current Pattern Display */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${POSITION_COLORS[position]}`}>
                {POSITION_LABELS[position]}
              </div>
              <div className="text-2xl font-mono">
                Current Pattern: <span className="text-primary font-bold">{currentPattern}</span>
              </div>
            </div>

            {/* Top Predictions */}
            <div>
              <h4 className="font-semibold mb-3">Top Recommendations</h4>
              <div className="flex gap-4 flex-wrap">
                {predictions.predictions.slice(0, 5).map((pred, idx) => (
                  <div
                    key={pred.digit}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all"
                    style={{ 
                      borderColor: COLORS[idx],
                      backgroundColor: `${COLORS[idx]}15`
                    }}
                  >
                    <div className="text-3xl font-bold" style={{ color: COLORS[idx] }}>
                      {idx + 1}
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold font-mono">
                        {pred.digit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pred.probability.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                {predictions.predictions.length === 0 && (
                  <p className="text-muted-foreground">No pattern found in history</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {predictions.totalOccurrences}
                </div>
                <div className="text-xs text-muted-foreground">History Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {predictions.predictions[0]?.probability.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Top-1 Probability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {backtest.accuracyTop1.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Backtest Top-1</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {backtest.accuracyTop3.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Backtest Top-3</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backtest Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Backtest Results ({backtest.totalTests} tests)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-xl text-center border border-red-200">
                <div className="text-3xl font-bold text-red-600">{backtest.hitTop1}</div>
                <div className="text-sm text-muted-foreground">Hit Top-1</div>
                <div className="text-lg font-semibold text-red-500">{backtest.accuracyTop1.toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl text-center border border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{backtest.hitTop3}</div>
                <div className="text-sm text-muted-foreground">Hit Top-3</div>
                <div className="text-lg font-semibold text-orange-500">{backtest.accuracyTop3.toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600">{backtest.hitTop5}</div>
                <div className="text-sm text-muted-foreground">Hit Top-5</div>
                <div className="text-lg font-semibold text-green-500">{backtest.accuracyTop5.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render frequency chart
  const renderFrequency = () => {
    if (!analysis || analysis.patternFrequency.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No pattern data available
          </CardContent>
        </Card>
      );
    }

    // Group by pattern
    const patternGroups = analysis.patternFrequency.reduce((acc, item) => {
      if (!acc[item.pattern]) {
        acc[item.pattern] = [];
      }
      acc[item.pattern].push(item);
      return acc;
    }, {} as Record<string, PatternFrequency[]>);

    const currentPatternData = patternGroups[analysis.currentPattern] || [];
    const chartData = currentPatternData.map((item) => ({
      name: item.nextNumber.toString(),
      value: item.count,
      probability: item.probability,
    }));

    return (
      <div className="space-y-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Pattern &quot;{analysis.currentPattern}&quot; - Next Digit Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string, props: { payload?: { probability?: number } }) => [
                    `${value} times (${props.payload?.probability?.toFixed(1)}%)`,
                    "Frequency"
                  ]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Probability Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pattern Frequency Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Table2 className="w-5 h-5" />
              All Pattern Frequencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Pattern</th>
                    <th className="text-center py-2 px-3">Next</th>
                    <th className="text-center py-2 px-3">Count</th>
                    <th className="text-center py-2 px-3">Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.patternFrequency.slice(0, 30).map((item, idx) => (
                    <tr 
                      key={`${item.pattern}-${item.nextNumber}-${idx}`}
                      className={`border-b hover:bg-muted/50 ${item.pattern === analysis.currentPattern ? "bg-amber-50" : ""}`}
                    >
                      <td className="py-2 px-3 font-mono font-semibold">
                        {item.pattern}
                        {item.pattern === analysis.currentPattern && (
                          <span className="ml-2 text-xs bg-amber-200 px-2 py-0.5 rounded">Current</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{item.nextNumber}</td>
                      <td className="py-2 px-3 text-center">{item.count}</td>
                      <td className="py-2 px-3 text-center">{item.probability.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render backtest details
  const renderBacktest = () => {
    if (!analysis || analysis.backtest.details.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No backtest data available
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Backtest Details (Last 50 tests)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr className="border-b">
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-center py-2 px-3">Pattern</th>
                  <th className="text-center py-2 px-3">Actual</th>
                  <th className="text-center py-2 px-3">Top-1</th>
                  <th className="text-center py-2 px-3">Top-5</th>
                  <th className="text-center py-2 px-3">Hit</th>
                </tr>
              </thead>
              <tbody>
                {analysis.backtest.details.map((detail, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3 text-muted-foreground">{idx + 1}</td>
                    <td className="py-2 px-3 text-center font-mono font-semibold">{detail.pattern}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-lg">{detail.actual}</td>
                    <td className="py-2 px-3 text-center font-mono">{detail.predictedTop1}</td>
                    <td className="py-2 px-3 text-center font-mono">{detail.predictedTop5.join(", ")}</td>
                    <td className="py-2 px-3 text-center">
                      {detail.hitTop1 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Top-1!</span>
                      )}
                      {detail.hitTop3 && !detail.hitTop1 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">Top-3</span>
                      )}
                      {detail.hitTop5 && !detail.hitTop3 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">Top-5</span>
                      )}
                      {!detail.hitTop5 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Miss</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!selectedSnapshotId) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Hash className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Snapshot Selected</h3>
        <p className="text-muted-foreground">
          Please select a snapshot from the dropdown above to analyze
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            History Journey Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Position */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select 
                value={position} 
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-40"
              >
                <option value="AS">AS (1st)</option>
                <option value="KOP">KOP (2nd)</option>
                <option value="KEPALA">KEPALA (3rd)</option>
                <option value="EKOR">EKOR (4th)</option>
              </Select>
            </div>

            {/* Order Depth */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pattern Depth</label>
              <Select 
                value={String(orderDepth)} 
                onChange={(e) => setOrderDepth(parseInt(e.target.value) as OrderDepth)}
                className="w-44"
              >
                <option value="1">Order-1 (1 digit)</option>
                <option value="2">Order-2 (2 digits)</option>
                <option value="3">Order-3 (3 digits)</option>
              </Select>
            </div>

            {/* Training Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Training Data</label>
              <Select 
                value={trainingSize} 
                onChange={(e) => setTrainingSize(e.target.value as TrainingSize)}
                className="w-32"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="all">All History</option>
              </Select>
            </div>

            {/* Top Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Show Top</label>
              <Select 
                value={String(topCount)} 
                onChange={(e) => setTopCount(parseInt(e.target.value) as PredictionTop)}
                className="w-24"
              >
                <option value="1">Top 1</option>
                <option value="3">Top 3</option>
                <option value="5">Top 5</option>
              </Select>
            </div>

            {/* Analyze Button */}
            <Button onClick={runAnalysis} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-4 text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && analysis && (
        <>
          {/* View Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            {([
              { id: "summary", label: "Summary", icon: Target },
              { id: "frequency", label: "Frequency", icon: BarChart3 },
              { id: "backtest", label: "Backtest", icon: History },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === id
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeView === "summary" && renderSummary()}
          {activeView === "frequency" && renderFrequency()}
          {activeView === "backtest" && renderBacktest()}
        </>
      )}

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-3">
          <div className="flex gap-3 text-sm text-blue-800">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>How it works:</strong> The History Journey analyzes transitions from one digit to the next 
              in the historical sequence. For example, if position AS shows &quot;9&quot; appearing before &quot;7&quot; 
              15 times, the system predicts &quot;7&quot; as a likely next digit when &quot;9&quot; appears.
              <br />
              <strong>Backtest accuracy</strong> shows how well this pattern would have predicted historical results.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryJourneyPanel;
