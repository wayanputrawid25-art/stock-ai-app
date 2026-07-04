"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import { InputModal } from "@/components/InputModal";
import { PredictionPanel } from "@/components/PredictionPanel";
import { generatePrediction } from "@/lib/prediction";
import { 
  Flame, Snowflake, HelpCircle, Hash, 
  Grid3X3, Sparkles,
  TrendingUp, TrendingDown, Minus, 
  PieChart as PieChartIcon, Calculator,
  GitBranch, Search, ArrowUpDown,
  BarChart3, Clock, Table2,
  SlidersHorizontal, ArrowLeftRight
} from "lucide-react";

// Types
type Position = "AS" | "KOP" | "KEPALA" | "EKOR";
const POSITIONS: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];

interface DigitData {
  digit: number;
  count: number;
  percentage: number;
  rank?: number;
}

interface MissingData {
  digit: number;
  lastSeen: number;
  drawsMissed: number;
  avgGap: number;
}

interface SumDistribution {
  sum: number;
  count: number;
  percentage: number;
}

interface Analysis {
  totalResults: number;
  frequency: Record<Position, DigitData[]>;
  hot: { position: Position; digits: number[]; data: DigitData[] }[];
  cold: { position: Position; digits: number[]; data: DigitData[] }[];
  missing: Record<Position, MissingData[]>;
  positionAnalysis: { position: Position; hotDigits: number[]; coldDigits: number[]; mostFrequent: number; leastFrequent: number }[];
  pattern: { position: Position; oddEven: { oddCount: number; oddPercent: number; evenCount: number; evenPercent: number }; bigSmall: { bigCount: number; bigPercent: number; smallCount: number; smallPercent: number } }[];
  sum: { 
    distribution: SumDistribution[]; 
    stats: { mean: number; median: number; mode: number; min: number; max: number }; 
    composition: { twoEvenTwoOdd: number; threeEvenOneOdd: number; threeOddOneEven: number; fourEven: number; fourOdd: number };
  };
  pair2D: { pair: string; count: number; percentage: number; lastSeen: number }[];
  mirror: { original: number; mirror: number; occurrences: number }[];
  gap: { position: Position; data: { digit: number; gapScore: number; avgGap: number; lastSeen: number }[] }[];
  trend: Record<Position, { digit: number; recentCount: number; previousCount: number; delta: number; status: string }[]>;
  charts: {
    frequency: { position: Position; data: DigitData[] }[];
    missing: { data: MissingData[] };
    positionStats: { position: Position; oddEven: { odd: number; even: number }; bigSmall: { big: number; small: number }; avgValue: number }[];
    history: { resultNumber: string; drawDate: string; sum: number; oddEven: string; bigSmall: string }[];
  };
}

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

// Tab Configuration
type TabId = "hot-cold" | "position" | "pattern" | "advanced" | "prediction" | "statistics";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: "hot-cold", label: "Hot/Cold", icon: <Flame className="w-4 h-4" /> },
  { id: "position", label: "Position", icon: <Grid3X3 className="w-4 h-4" /> },
  { id: "pattern", label: "Pattern", icon: <PieChartIcon className="w-4 h-4" /> },
  { id: "advanced", label: "Advanced", icon: <Sparkles className="w-4 h-4" /> },
  { id: "prediction", label: "Prediksi", icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
  { id: "statistics", label: "Statistics", icon: <BarChart3 className="w-4 h-4" /> },
];

// Color palette
const COLORS = {
  hot: ["#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2"],
  cold: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
  missing: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"],
  pattern: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
};

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string | number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Digit Display Component
function DigitBox({ value, size = "md", color }: { value: number; size?: "sm" | "md" | "lg"; color?: string }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl"
  };
  
  return (
    <div 
      className={`${sizes[size]} rounded-lg flex items-center justify-center font-bold shadow-sm`}
      style={{ backgroundColor: color || "hsl(var(--muted))" }}
    >
      {value}
    </div>
  );
}

// Position Badge
function PositionBadge({ position }: { position: Position }) {
  const colors: Record<Position, string> = {
    AS: "bg-red-100 text-red-700",
    KOP: "bg-blue-100 text-blue-700",
    KEPALA: "bg-green-100 text-green-700",
    EKOR: "bg-purple-100 text-purple-700"
  };
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${colors[position]}`}>
      {position}
    </span>
  );
}

// Skeleton Loader
function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// HOT/COLD/MISSING TAB
// ============================================================================
function HotColdMissingTab({ analysis }: { analysis: Analysis }) {
  const [activeView, setActiveView] = useState<"hot" | "cold" | "missing">("hot");
  
  const hotColdData = useMemo(() => {
    return POSITIONS.map(pos => {
      const hotEntry = analysis.hot.find(h => h.position === pos);
      const coldEntry = analysis.cold.find(c => c.position === pos);
      const missingEntry = analysis.missing[pos];
      
      return {
        position: pos,
        hotDigits: hotEntry?.digits || [],
        coldDigits: coldEntry?.digits || [],
        missingDigits: [...(missingEntry || [])]
          .sort((a, b) => b.drawsMissed - a.drawsMissed)
          .slice(0, 6)
          .map(m => ({ digit: m.digit, drawsMissed: m.drawsMissed }))
      };
    });
  }, [analysis]);

  const viewColors = activeView === "hot" ? COLORS.hot : activeView === "cold" ? COLORS.cold : COLORS.missing;

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        {(["hot", "cold", "missing"] as const).map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === view
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view === "hot" && <Flame className="w-4 h-4 text-red-500" />}
            {view === "cold" && <Snowflake className="w-4 h-4 text-blue-500" />}
            {view === "missing" && <HelpCircle className="w-4 h-4 text-amber-500" />}
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Hot/Cold/Missing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hotColdData.map(({ position, hotDigits, coldDigits, missingDigits }) => {
          const digits = activeView === "hot" ? hotDigits 
            : activeView === "cold" ? coldDigits 
            : missingDigits.map(m => m.digit);
          
          return (
            <Card key={position} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <PositionBadge position={position} />
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {digits.length} digits
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {digits.map((digit, idx) => (
                    <div key={digit} className="relative">
                      <DigitBox 
                        value={activeView === "missing" ? missingDigits[idx]?.digit : digit} 
                        size="md"
                        color={viewColors[idx % viewColors.length]}
                      />
                      {activeView === "missing" && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] px-1 rounded-full">
                          {missingDigits[idx]?.drawsMissed}
                        </span>
                      )}
                    </div>
                  ))}
                  {digits.length === 0 && (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Combined Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Frequency Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.charts.frequency[0]?.data || []}>
                <XAxis dataKey="digit" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// POSITION TAB
// ============================================================================
function PositionTab({ analysis }: { analysis: Analysis }) {
  const [selectedPosition, setSelectedPosition] = useState<Position>("AS");
  
  const positionData = useMemo(() => {
    return analysis.positionAnalysis.find(p => p.position === selectedPosition);
  }, [analysis, selectedPosition]);

  const frequencyData = useMemo(() => {
    return analysis.frequency[selectedPosition] || [];
  }, [analysis, selectedPosition]);

  return (
    <div className="space-y-6">
      {/* Position Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        {POSITIONS.map(pos => (
          <button
            key={pos}
            onClick={() => setSelectedPosition(pos)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPosition === pos
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Digit Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData}>
                  <XAxis dataKey="digit" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {frequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.hot[index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Position Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              Position Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 font-medium mb-1">Most Frequent</p>
                  <div className="flex items-center gap-2">
                    <DigitBox value={positionData?.mostFrequent || 0} size="lg" color="#fee2e2" />
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        {frequencyData[0]?.count || 0}x
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((frequencyData[0]?.percentage) || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">Least Frequent</p>
                  <div className="flex items-center gap-2">
                    <DigitBox value={positionData?.leastFrequent || 0} size="lg" color="#dbeafe" />
                    <div>
                      <p className="text-sm font-bold text-blue-700">
                        {frequencyData[frequencyData.length - 1]?.count || 0}x
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((frequencyData[frequencyData.length - 1]?.percentage) || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hot/Cold Digits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-500" /> Hot Digits
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {positionData?.hotDigits.map(d => (
                      <DigitBox key={d} value={d} size="sm" color="#fee2e2" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Snowflake className="w-3 h-3 text-blue-500" /> Cold Digits
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {positionData?.coldDigits.map(d => (
                      <DigitBox key={d} value={d} size="sm" color="#dbeafe" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// PATTERN TAB
// ============================================================================
function PatternTab({ analysis }: { analysis: Analysis }) {
  const [activePattern, setActivePattern] = useState<"odd-even" | "big-small" | "sum" | "pair">("odd-even");
  
  const patternData = useMemo(() => {
    return analysis.pattern;
  }, [analysis.pattern]);

  return (
    <div className="space-y-6">
      {/* Pattern Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit flex-wrap">
        {([
          { id: "odd-even", label: "Odd/Even", icon: <ArrowUpDown className="w-4 h-4" /> },
          { id: "big-small", label: "Big/Small", icon: <SlidersHorizontal className="w-4 h-4" /> },
          { id: "sum", label: "Sum", icon: <Calculator className="w-4 h-4" /> },
          { id: "pair", label: "Pair 2D", icon: <GitBranch className="w-4 h-4" /> },
        ] as const).map(pattern => (
          <button
            key={pattern.id}
            onClick={() => setActivePattern(pattern.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activePattern === pattern.id
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {pattern.icon}
            {pattern.label}
          </button>
        ))}
      </div>

      {/* Pattern Content */}
      {activePattern === "odd-even" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {patternData.map(({ position, oddEven }) => (
            <Card key={position}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PositionBadge position={position} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Odd</span>
                      <span className="font-medium">{oddEven.oddCount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${oddEven.oddPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-muted-foreground mt-1">
                      {oddEven.oddPercent.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Even</span>
                      <span className="font-medium">{oddEven.evenCount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${oddEven.evenPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-muted-foreground mt-1">
                      {oddEven.evenPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activePattern === "big-small" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {patternData.map(({ position, bigSmall }) => (
            <Card key={position}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PositionBadge position={position} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Big (5-9)</span>
                      <span className="font-medium">{bigSmall.bigCount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${bigSmall.bigPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-muted-foreground mt-1">
                      {bigSmall.bigPercent.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Small (0-4)</span>
                      <span className="font-medium">{bigSmall.smallCount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${bigSmall.smallPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-muted-foreground mt-1">
                      {bigSmall.smallPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activePattern === "sum" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sum Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.sum.distribution.slice(0, 20)}>
                    <XAxis dataKey="sum" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sum Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Mean</p>
                  <p className="text-2xl font-bold">{analysis.sum.stats.mean}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Median</p>
                  <p className="text-2xl font-bold">{analysis.sum.stats.median}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Mode</p>
                  <p className="text-2xl font-bold">{analysis.sum.stats.mode}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Range</p>
                  <p className="text-2xl font-bold">{analysis.sum.stats.min} - {analysis.sum.stats.max}</p>
                </div>
              </div>
              
              {/* Composition */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Digit Composition</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "2E2O", value: analysis.sum.composition.twoEvenTwoOdd },
                    { label: "3E1O", value: analysis.sum.composition.threeEvenOneOdd },
                    { label: "3O1E", value: analysis.sum.composition.threeOddOneEven },
                    { label: "4E", value: analysis.sum.composition.fourEven },
                    { label: "4O", value: analysis.sum.composition.fourOdd },
                  ].map(comp => (
                    <div key={comp.label} className="text-center p-2 bg-muted rounded">
                      <p className="text-xs font-medium">{comp.label}</p>
                      <p className="text-lg font-bold">{comp.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activePattern === "pair" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2D Pair Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {analysis.pair2D.slice(0, 20).map(({ pair, count, percentage }) => (
                <div 
                  key={pair} 
                  className="p-3 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
                >
                  <p className="text-lg font-bold">{pair}</p>
                  <p className="text-xs text-muted-foreground">{count}x</p>
                  <p className="text-[10px] text-muted-foreground">{percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// ADVANCED TAB
// ============================================================================
function AdvancedTab({ analysis }: { analysis: Analysis }) {
  const [activeView, setActiveView] = useState<"gap" | "mirror" | "trend">("gap");
  
  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        {([
          { id: "gap", label: "Gap Analysis", icon: <GitBranch className="w-4 h-4" /> },
          { id: "mirror", label: "Mirror Number", icon: <ArrowLeftRight className="w-4 h-4" /> },
          { id: "trend", label: "Trend", icon: <TrendingUp className="w-4 h-4" /> },
        ] as const).map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === view.id
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view.icon}
            {view.label}
          </button>
        ))}
      </div>

      {/* Gap Analysis */}
      {activeView === "gap" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysis.gap.map(({ position, data }) => (
            <Card key={position}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PositionBadge position={position} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.slice(0, 5).map(({ digit, gapScore }) => (
                    <div key={digit} className="flex items-center justify-between">
                      <DigitBox value={digit} size="sm" />
                      <div className="flex-1 mx-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(gapScore * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8">{gapScore.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mirror Numbers */}
      {activeView === "mirror" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
              Mirror Number Pairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {analysis.mirror.map(({ original, mirror, occurrences }) => (
                <div key={original} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg font-bold">{original}</span>
                    <span className="text-muted-foreground">↔</span>
                    <span className="text-lg font-bold">{mirror}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{occurrences}x</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {activeView === "trend" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {POSITIONS.map(position => {
            const trendData = analysis.trend[position] || [];
            return (
              <Card key={position}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PositionBadge position={position} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <XAxis dataKey="digit" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="delta" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-1">
                    {trendData.filter(t => t.status !== "STABLE").slice(0, 3).map(t => (
                      <div key={t.digit} className="flex items-center justify-between text-sm">
                        <span>Digit {t.digit}</span>
                        <div className="flex items-center gap-1">
                          {t.status === "TREND UP" && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {t.status === "TREND DOWN" && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {t.status === "STABLE" && <Minus className="w-4 h-4 text-gray-400" />}
                          <span className={`
                            ${t.delta > 0 ? "text-green-600" : t.delta < 0 ? "text-red-600" : "text-muted-foreground"}
                            font-medium
                          `}>
                            {t.delta > 0 ? "+" : ""}{t.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STATISTICS TAB
// ============================================================================
function StatisticsTab({ analysis }: { analysis: Analysis }) {
  const [activeView, setActiveView] = useState<"frequency" | "missing" | "position" | "history">("frequency");
  
  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit flex-wrap">
        {([
          { id: "frequency", label: "Frequency Chart", icon: <BarChart3 className="w-4 h-4" /> },
          { id: "missing", label: "Missing Chart", icon: <HelpCircle className="w-4 h-4" /> },
          { id: "position", label: "Position Stats", icon: <PieChartIcon className="w-4 h-4" /> },
          { id: "history", label: "Result History", icon: <Clock className="w-4 h-4" /> },
        ] as const).map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === view.id
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view.icon}
            {view.label}
          </button>
        ))}
      </div>

      {/* Frequency Chart */}
      {activeView === "frequency" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frequency by Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart>
                  <XAxis dataKey="digit" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="AS" fill="#ef4444" />
                  <Bar dataKey="KOP" fill="#3b82f6" />
                  <Bar dataKey="KEPALA" fill="#22c55e" />
                  <Bar dataKey="EKOR" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Chart */}
      {activeView === "missing" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing Numbers Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.charts.missing.data}>
                  <XAxis dataKey="digit" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="drawsMissed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position Stats */}
      {activeView === "position" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.charts.positionStats.map(stats => (
            <Card key={stats.position}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PositionBadge position={stats.position} />
                  <span className="text-muted-foreground">Avg: {stats.avgValue}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Odd/Even</p>
                    <div className="flex gap-2">
                      <div className="flex-1 text-center p-2 bg-purple-50 rounded">
                        <p className="text-lg font-bold text-purple-700">{stats.oddEven.odd}</p>
                        <p className="text-xs text-purple-600">Odd</p>
                      </div>
                      <div className="flex-1 text-center p-2 bg-green-50 rounded">
                        <p className="text-lg font-bold text-green-700">{stats.oddEven.even}</p>
                        <p className="text-xs text-green-600">Even</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Big/Small</p>
                    <div className="flex gap-2">
                      <div className="flex-1 text-center p-2 bg-orange-50 rounded">
                        <p className="text-lg font-bold text-orange-700">{stats.bigSmall.big}</p>
                        <p className="text-xs text-orange-600">Big</p>
                      </div>
                      <div className="flex-1 text-center p-2 bg-teal-50 rounded">
                        <p className="text-lg font-bold text-teal-700">{stats.bigSmall.small}</p>
                        <p className="text-xs text-teal-600">Small</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Result History */}
      {activeView === "history" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Table2 className="w-5 h-5" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Date</th>
                    <th className="text-center py-2 px-3 font-medium">Number</th>
                    <th className="text-center py-2 px-3 font-medium">Sum</th>
                    <th className="text-center py-2 px-3 font-medium">Odd/Even</th>
                    <th className="text-center py-2 px-3 font-medium">Big/Small</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.charts.history.slice(0, 20).map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 text-muted-foreground">
                        {new Date(item.drawDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        {item.resultNumber}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.sum}
                      </td>
                      <td className="py-2 px-3 text-center text-xs">
                        {item.oddEven}
                      </td>
                      <td className="py-2 px-3 text-center text-xs">
                        {item.bigSmall}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analysis.charts.history.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No results available</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

interface DashboardProps {
  initialSnapshots: Snapshot[];
  initialAnalysis?: Analysis | null;
}

export function Dashboard({ initialSnapshots, initialAnalysis }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("hot-cold");
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(
    initialSnapshots[0]?.id || null
  );
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots);
  const [analysis, setAnalysis] = useState<Analysis | null>(initialAnalysis ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);

  const fetchAnalysis = useCallback(async (snapshotId: string | null) => {
    if (!snapshotId) {
      setAnalysis(null);
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

  // Refresh on tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAnalysis(activeSnapshotId);
        fetchSnapshots();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeSnapshotId, fetchAnalysis, fetchSnapshots]);

  // Listen for data saved events
  useEffect(() => {
    const handleDataSaved = () => {
      fetchAnalysis(activeSnapshotId);
      fetchSnapshots();
    };
    window.addEventListener("dataSaved", handleDataSaved);
    return () => window.removeEventListener("dataSaved", handleDataSaved);
  }, [activeSnapshotId, fetchAnalysis, fetchSnapshots]);

  const selectedSnapshot = snapshots.find(s => s.id === activeSnapshotId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {selectedSnapshot ? (
              <>Snapshot: <span className="font-medium">{selectedSnapshot.title}</span> ({analysis?.totalResults || 0} results)</>
            ) : (
              "Select a snapshot to view analysis"
            )}
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Snapshot Selector */}
          <select
            value={activeSnapshotId || ""}
            onChange={(e) => setActiveSnapshotId(e.target.value || null)}
            className="px-3 py-2 border rounded-lg text-sm bg-background"
          >
            <option value="">Select Snapshot</option>
            {snapshots.map(snap => (
              <option key={snap.id} value={snap.id}>
                {snap.title} ({snap._count?.results || 0})
              </option>
            ))}
          </select>
          
          {/* Input Button */}
          <Button onClick={() => setShowInputModal(true)} className="gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" />
            </svg>
            Input Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <AnalysisSkeleton />
      ) : analysis && analysis.totalResults > 0 ? (
        <>
          {activeTab === "hot-cold" && <HotColdMissingTab analysis={analysis} />}
          {activeTab === "position" && <PositionTab analysis={analysis} />}
          {activeTab === "pattern" && <PatternTab analysis={analysis} />}
          {activeTab === "advanced" && <AdvancedTab analysis={analysis} />}
          {activeTab === "prediction" && (
            <PredictionPanel 
              prediction={generatePrediction(
                analysis.charts.history.map(h => ({
                  resultNumber: h.resultNumber,
                  drawDate: h.drawDate
                }))
              )}
              totalResults={analysis.totalResults}
            />
          )}
          {activeTab === "statistics" && <StatisticsTab analysis={analysis} />}
        </>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Start by selecting a snapshot or inputting new data
          </p>
          <Button onClick={() => setShowInputModal(true)}>
            Input Data
          </Button>
        </Card>
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

export default Dashboard;
