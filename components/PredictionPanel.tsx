"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  TrendingUp, 
  Activity,
  BarChart3,
  Grid3X3,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  Calculator
} from "lucide-react";
import { 
  PredictionResult, 
  PositionPrediction, 
  DigitScore,
  Position
} from "@/lib/prediction";

const POSITIONS: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];

// Position colors
const POSITION_COLORS: Record<Position, { bg: string; border: string; text: string }> = {
  AS: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
  KOP: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  KEPALA: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600" },
  EKOR: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
};

// Indicator metadata
const INDICATORS = [
  { key: "frequency", label: "Frekuensi", weight: 35, icon: BarChart3, color: "bg-blue-500" },
  { key: "gap", label: "Gap", weight: 25, icon: Activity, color: "bg-amber-500" },
  { key: "trend", label: "Trend", weight: 20, icon: TrendingUp, color: "bg-green-500" },
  { key: "oddEven", label: "Ganjil/Genap", weight: 10, icon: Grid3X3, color: "bg-purple-500" },
  { key: "bigSmall", label: "Besar/Kecil", weight: 10, icon: PieChartIcon, color: "bg-pink-500" },
] as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Progress bar untuk confidence
 */
function ConfidenceBar({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const percentage = Math.min(100, Math.max(0, score));
  const color = percentage >= 75 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-red-500";
  const sizes = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className={`w-full bg-gray-200 rounded-full ${sizes[size]} overflow-hidden`}>
      <div
        className={`${sizes[size]} ${color} rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/**
 * Badge untuk digit dengan confidence
 */
function DigitBadge({ digit, score, rank }: { digit: number; score: number; rank: number }) {
  const percentage = Math.min(100, score);
  const colorClass = rank === 1 ? "bg-amber-100 border-amber-400 text-amber-800" :
                     rank === 2 ? "bg-gray-100 border-gray-300 text-gray-700" :
                     rank === 3 ? "bg-orange-100 border-orange-300 text-orange-700" :
                     "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div className={`flex flex-col items-center p-3 rounded-lg border-2 ${colorClass} min-w-[80px]`}>
      <span className="text-2xl font-bold">{digit}</span>
      <span className="text-xs font-medium mt-1">{score.toFixed(1)}</span>
      <ConfidenceBar score={percentage} size="sm" />
    </div>
  );
}

/**
 * Breakdown score untuk satu digit
 */
function ScoreBreakdown({ breakdown }: { breakdown: DigitScore["breakdown"] }) {
  return (
    <div className="grid grid-cols-5 gap-2 mt-3 text-xs">
      {INDICATORS.map((ind) => (
        <div key={ind.key} className="text-center">
          <div className="text-gray-500 mb-1">{ind.label}</div>
          <div className="font-semibold text-gray-700">{breakdown[ind.key as keyof typeof breakdown].toFixed(0)}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Position prediction card
 */
function PositionCard({ prediction }: { prediction: PositionPrediction }) {
  const [expanded, setExpanded] = useState(false);
  const colors = POSITION_COLORS[prediction.position];
  const topDigit = prediction.topDigits[0];

  return (
    <Card className={`${colors.bg} border ${colors.border}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${colors.text}`}>{prediction.position}</span>
            <Badge variant="outline" className="text-xs">
              Top Pick: {topDigit?.digit ?? "-"}
            </Badge>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-white/50 rounded transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Dominant patterns */}
        <div className="flex gap-2 mt-2 text-xs">
          <span className="px-2 py-1 bg-white/60 rounded">
            {prediction.dominantOddEven === "odd" ? "�，奇" : prediction.dominantOddEven === "even" ? "Genap" : "Mixed"} 
            <span className="text-gray-500 ml-1">Ganjil/Genap</span>
          </span>
          <span className="px-2 py-1 bg-white/60 rounded">
            {prediction.dominantBigSmall === "big" ? "Besar" : prediction.dominantBigSmall === "small" ? "Kecil" : "Mixed"}
            <span className="text-gray-500 ml-1">Besar/Kecil</span>
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Top 4 digits */}
        <div className="flex flex-wrap gap-2 justify-center">
          {prediction.topDigits.map((item, idx) => (
            <DigitBadge 
              key={item.digit} 
              digit={item.digit} 
              score={item.finalScore} 
              rank={idx + 1}
            />
          ))}
        </div>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2 text-center">Skor per Indikator</div>
            <ScoreBreakdown breakdown={prediction.topDigits[0]?.breakdown || { frequency: 0, gap: 0, trend: 0, oddEven: 0, bigSmall: 0 }} />
            
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-gray-600">Semua Kandidat:</div>
              {prediction.topDigits.map((item, idx) => (
                <div key={item.digit} className="flex items-center justify-between text-sm bg-white/60 p-2 rounded">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold">#{item.digit}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <ConfidenceBar score={item.finalScore} size="sm" />
                    <span className="font-semibold w-12 text-right">{item.finalScore.toFixed(1)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Combination list dengan copy functionality
 */
function CombinationList({ combinations }: { combinations: string[] }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const displayCombinations = expanded ? combinations : combinations.slice(0, 20);
  const hasMore = combinations.length > 20;

  const handleCopy = () => {
    const text = combinations.join(", ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="h-8"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "Copied!" : "Copy All"}
          </Button>
          <Badge variant="secondary">{combinations.length} numbers</Badge>
        </div>
        {hasMore && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 text-xs"
          >
            {expanded ? "Show Less" : `Show All (${combinations.length})`}
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayCombinations.map((num, idx) => (
          <span 
            key={idx} 
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-semibold hover:bg-gray-50 transition-colors"
          >
            {num}
          </span>
        ))}
      </div>
      
      {hasMore && !expanded && (
        <div className="text-center text-xs text-gray-500">
          +{combinations.length - 20} more combinations
        </div>
      )}
    </div>
  );
}

/**
 * Weight info panel
 */
function WeightInfo() {
  const [show, setShow] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <button 
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 text-amber-800 font-medium text-sm w-full"
      >
        <Calculator className="w-4 h-4" />
        <span>Informasi Bobot Scoring</span>
        {show ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>
      
      {show && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="text-amber-700">
            Setiap digit dinilai berdasarkan 5 indikator:
          </div>
          <div className="grid grid-cols-5 gap-2">
            {INDICATORS.map((ind) => (
              <div key={ind.key} className="text-center bg-white/70 rounded p-2">
                <div className={`w-3 h-3 ${ind.color} rounded-full mx-auto mb-1`} />
                <div className="font-medium">{ind.label}</div>
                <div className="text-xs text-gray-500">{ind.weight}%</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-amber-600 mt-2">
            <Info className="w-3 h-3 inline mr-1" />
            Skor akhir = Σ(Skor × Bobot) untuk setiap indikator
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PredictionPanelProps {
  prediction: PredictionResult | null;
  totalResults: number;
}

export function PredictionPanel({ prediction, totalResults }: PredictionPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "4D" | "3D" | "2D">("overview");

  if (!prediction || totalResults === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Prediction Unavailable</h3>
        <p className="text-muted-foreground">
          Add more data to generate predictions
        </p>
      </Card>
    );
  }

  const fourD = prediction.combinations.find(c => c.type === "4D");
  const threeD = prediction.combinations.find(c => c.type === "3D");
  const twoD = prediction.combinations.find(c => c.type === "2D");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Prediksi Angka
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Berdasarkan {totalResults.toLocaleString()} data hasil • 
            Generated: {new Date(prediction.generatedAt).toLocaleString()}
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-50">
          <Activity className="w-3 h-3 mr-1" />
          Real-time Analysis
        </Badge>
      </div>

      {/* Weight Info */}
      <WeightInfo />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="4D">4D ({fourD?.count || 0})</TabsTrigger>
          <TabsTrigger value="3D">3D ({threeD?.count || 0})</TabsTrigger>
          <TabsTrigger value="2D">2D ({twoD?.count || 0})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Position Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {POSITIONS.map((pos) => (
              <PositionCard 
                key={pos} 
                prediction={prediction.predictions[pos]} 
              />
            ))}
          </div>

          {/* Quick Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Rekomendasi Singkat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                  <div className="text-xs text-emerald-600 font-medium">4D Favorit</div>
                  <div className="font-bold text-emerald-700">
                    {prediction.predictions.AS.topDigits[0]?.digit}
                    {prediction.predictions.KOP.topDigits[0]?.digit}
                    {prediction.predictions.KEPALA.topDigits[0]?.digit}
                    {prediction.predictions.EKOR.topDigits[0]?.digit}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <div className="text-xs text-blue-600 font-medium">3D Favorit</div>
                  <div className="font-bold text-blue-700">
                    {prediction.predictions.KOP.topDigits[0]?.digit}
                    {prediction.predictions.KEPALA.topDigits[0]?.digit}
                    {prediction.predictions.EKOR.topDigits[0]?.digit}
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                  <div className="text-xs text-purple-600 font-medium">2D Favorit</div>
                  <div className="font-bold text-purple-700">
                    {prediction.predictions.KEPALA.topDigits[0]?.digit}
                    {prediction.predictions.EKOR.topDigits[0]?.digit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4D Tab */}
        <TabsContent value="4D">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kombinasi 4D</CardTitle>
              <p className="text-sm text-muted-foreground">
                {fourD?.label} • Total {fourD?.count || 0} kombinasi
              </p>
            </CardHeader>
            <CardContent>
              {fourD && <CombinationList combinations={fourD.combinations} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3D Tab */}
        <TabsContent value="3D">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kombinasi 3D</CardTitle>
              <p className="text-sm text-muted-foreground">
                {threeD?.label} • Total {threeD?.count || 0} kombinasi
              </p>
            </CardHeader>
            <CardContent>
              {threeD && <CombinationList combinations={threeD.combinations} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2D Tab */}
        <TabsContent value="2D">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kombinasi 2D</CardTitle>
              <p className="text-sm text-muted-foreground">
                {twoD?.label} • Total {twoD?.count || 0} kombinasi
              </p>
            </CardHeader>
            <CardContent>
              {twoD && <CombinationList combinations={twoD.combinations} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PredictionPanel;
