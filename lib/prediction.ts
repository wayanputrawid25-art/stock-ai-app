/**
 * Prediction Engine - Weighted Scoring System
 * Menghitung kandidat nomor 4D/3D/2D berdasarkan analisis berbobot
 */

import { 
  Position, 
  POSITIONS, 
  ResultRecord,
  analyzeFrequency,
  analyzeGap,
  analyzeTrend,
  analyzePattern
} from "./analyzer";

// Re-export Position for convenience
export type { Position } from "./analyzer";

// ============================================================================
// TYPES
// ============================================================================

export type IndicatorWeights = {
  frequency: number;
  gap: number;
  trend: number;
  oddEven: number;
  bigSmall: number;
};

export type DigitScore = {
  digit: number;
  finalScore: number;
  confidence: number;
  breakdown: {
    frequency: number;
    gap: number;
    trend: number;
    oddEven: number;
    bigSmall: number;
  };
};

export type PositionPrediction = {
  position: Position;
  topDigits: DigitScore[];
  dominantOddEven: "odd" | "even" | "mixed";
  dominantBigSmall: "big" | "small" | "mixed";
};

export type CombinationSet = {
  type: "4D" | "3D" | "2D";
  label: string;
  positions: Position[];
  combinations: string[];
  count: number;
};

export type PredictionResult = {
  weights: IndicatorWeights;
  predictions: Record<Position, PositionPrediction>;
  combinations: CombinationSet[];
  generatedAt: Date;
  totalResults: number;
};

// Default weights sesuai request user
const DEFAULT_WEIGHTS: IndicatorWeights = {
  frequency: 0.35,  // 35%
  gap: 0.25,        // 25%
  trend: 0.20,      // 20%
  oddEven: 0.10,    // 10%
  bigSmall: 0.10,   // 10%
};

// ============================================================================
// SCORING HELPERS
// ============================================================================

/**
 * Calculate frequency score (0-100)
 * Menggunakan rank-based scoring (digit yang lebih sering muncul mendapat skor lebih tinggi)
 */
function calculateFrequencyScore(
  digit: number, 
  frequency: Record<Position, { digit: number; count: number; percentage: number }[]>,
  position: Position,
  totalResults: number
): number {
  const posData = frequency[position].find(d => d.digit === digit);
  if (!posData || totalResults === 0) return 0;
  
  // Sort by count descending to find rank
  const sorted = [...frequency[position]].sort((a, b) => b.count - a.count);
  const rank = sorted.findIndex(d => d.digit === digit) + 1;
  
  // Rank 1 = 100, Rank 10 = 40 (minimum)
  const score = 100 - ((rank - 1) * (60 / 9));
  return Math.round(score * 100) / 100;
}

/**
 * Calculate gap score (0-100)
 * Digit yang lama tidak muncul (cold) mendapat skor lebih tinggi
 */
function calculateGapScore(
  digit: number,
  gapData: { digit: number; gapScore: number; lastSeen: number; avgGap: number }[],
  totalResults: number
): number {
  const data = gapData.find(d => d.digit === digit);
  if (!data || totalResults === 0) return 0;
  
  // lastSeen yang lebih tinggi = cold = skor lebih tinggi
  // Menggunakan ratio lastSeen terhadap total results
  const lastSeenRatio = data.lastSeen / Math.max(totalResults, 1);
  const score = Math.min(100, lastSeenRatio * 100 + data.avgGap);
  return Math.round(score * 100) / 100;
}

/**
 * Calculate trend score (0-100)
 * Digit dengan trend naik (delta positif) mendapat skor lebih tinggi
 */
function calculateTrendScore(
  digit: number,
  trendData: { digit: number; recentCount: number; previousCount: number; delta: number }[]
): number {
  const data = trendData.find(d => d.digit === digit);
  if (!data) return 0;
  
  // Delta positif = trend naik = skor tinggi
  // Delta negatif = trend turun = skor rendah
  // Menggunakan -5 sampai +5 sebagai range normal
  const delta = data.delta;
  const maxDelta = 10; // Batas maksimal delta yang diharapkan
  
  // Skor: 50 adalah baseline (stabil), 100 max naik, 0 max turun
  const score = 50 + (Math.max(-maxDelta, Math.min(maxDelta, delta)) / maxDelta) * 50;
  return Math.round(score * 100) / 100;
}

/**
 * Calculate odd/even match score (0-100)
 * Digit yang match dengan pola dominan odd/even mendapat skor lebih tinggi
 */
function calculateOddEvenScore(
  digit: number,
  patternData: { oddPercent: number; evenPercent: number }
): number {
  const isOdd = digit % 2 === 1;
  const dominantIsOdd = patternData.oddPercent > patternData.evenPercent;
  const isMixed = Math.abs(patternData.oddPercent - patternData.evenPercent) < 10; // < 10% difference = mixed
  
  if (isMixed) {
    return 75; // Default score untuk pola mixed
  }
  
  // Match dengan dominant pattern
  return (isOdd === dominantIsOdd) ? 90 : 50;
}

/**
 * Calculate big/small match score (0-100)
 * Digit yang match dengan pola dominan big/small mendapat skor lebih tinggi
 */
function calculateBigSmallScore(
  digit: number,
  patternData: { bigPercent: number; smallPercent: number }
): number {
  const isBig = digit >= 5;
  const dominantIsBig = patternData.bigPercent > patternData.smallPercent;
  const isMixed = Math.abs(patternData.bigPercent - patternData.smallPercent) < 10;
  
  if (isMixed) {
    return 75; // Default score untuk pola mixed
  }
  
  return (isBig === dominantIsBig) ? 90 : 50;
}

// ============================================================================
// MAIN PREDICTION FUNCTION
// ============================================================================

/**
 * Generate prediction dengan weighted scoring
 */
export function generatePrediction(
  records: ResultRecord[],
  weights: IndicatorWeights = DEFAULT_WEIGHTS,
  topCount: number = 4
): PredictionResult {
  if (records.length === 0) {
    return createEmptyPrediction(weights);
  }

  const sorted = [...records].sort((a, b) => {
    const dateA = new Date(a.drawDate).getTime();
    const dateB = new Date(b.drawDate).getTime();
    return dateB - dateA;
  });

  const totalResults = sorted.length;

  // Calculate all indicators
  const frequency = analyzeFrequency(records);
  const gapData = analyzeGap(records);
  const trendData = analyzeTrend(records);
  const patternData = analyzePattern(records);

  // Calculate predictions per position
  const predictions: Record<Position, PositionPrediction> = {} as Record<Position, PositionPrediction>;

  for (const position of POSITIONS) {
    const posIdx = POSITIONS.indexOf(position);
    const gapForPos = gapData.find(g => g.position === position)?.data || [];
    const trendForPos = trendData[position];
    const patternForPos = patternData[posIdx];

    // Determine dominant patterns
    const dominantOddEven: "odd" | "even" | "mixed" = 
      patternForPos.oddEven.oddPercent > patternForPos.oddEven.evenPercent + 10 ? "odd" :
      patternForPos.oddEven.evenPercent > patternForPos.oddEven.oddPercent + 10 ? "even" : "mixed";
    
    const dominantBigSmall: "big" | "small" | "mixed" =
      patternForPos.bigSmall.bigPercent > patternForPos.bigSmall.smallPercent + 10 ? "big" :
      patternForPos.bigSmall.smallPercent > patternForPos.bigSmall.bigPercent + 10 ? "small" : "mixed";

    // Calculate score for each digit 0-9
    const digitScores: DigitScore[] = [];

    for (let digit = 0; digit <= 9; digit++) {
      const freqScore = calculateFrequencyScore(digit, frequency, position, totalResults);
      const gapScore = calculateGapScore(digit, gapForPos, totalResults);
      const trendScore = calculateTrendScore(digit, trendForPos);
      const oddEvenScore = calculateOddEvenScore(digit, patternForPos.oddEven);
      const bigSmallScore = calculateBigSmallScore(digit, patternForPos.bigSmall);

      // Calculate final weighted score
      const finalScore = 
        (freqScore * weights.frequency) +
        (gapScore * weights.gap) +
        (trendScore * weights.trend) +
        (oddEvenScore * weights.oddEven) +
        (bigSmallScore * weights.bigSmall);

      digitScores.push({
        digit,
        finalScore: Math.round(finalScore * 100) / 100,
        confidence: Math.round(finalScore * 100) / 100, // Confidence = final score
        breakdown: {
          frequency: freqScore,
          gap: gapScore,
          trend: trendScore,
          oddEven: oddEvenScore,
          bigSmall: bigSmallScore,
        },
      });
    }

    // Sort by final score and take top N
    digitScores.sort((a, b) => b.finalScore - a.finalScore);

    predictions[position] = {
      position,
      topDigits: digitScores.slice(0, topCount),
      dominantOddEven,
      dominantBigSmall,
    };
  }

  // Generate combinations
  const combinations = generateCombinations(predictions, topCount);

  return {
    weights,
    predictions,
    combinations,
    generatedAt: new Date(),
    totalResults,
  };
}

/**
 * Generate 4D, 3D, and 2D combinations from top digits
 */
function generateCombinations(
  predictions: Record<Position, PositionPrediction>,
  topCount: number
): CombinationSet[] {
  const combinations: CombinationSet[] = [];

  // Get top digits for each position
  const asDigits = predictions.AS.topDigits.slice(0, topCount).map(d => d.digit);
  const kopDigits = predictions.KOP.topDigits.slice(0, topCount).map(d => d.digit);
  const kepalaDigits = predictions.KEPALA.topDigits.slice(0, topCount).map(d => d.digit);
  const ekorDigits = predictions.EKOR.topDigits.slice(0, topCount).map(d => d.digit);

  // 4D: AS × KOP × KEPALA × EKOR = 4^4 = 256 combinations
  const fourD: string[] = [];
  for (const as of asDigits) {
    for (const kop of kopDigits) {
      for (const kepala of kepalaDigits) {
        for (const ekor of ekorDigits) {
          fourD.push(`${as}${kop}${kepala}${ekor}`);
        }
      }
    }
  }
  combinations.push({
    type: "4D",
    label: "4D (AS × KOP × KEPALA × EKOR)",
    positions: ["AS", "KOP", "KEPALA", "EKOR"],
    combinations: fourD,
    count: fourD.length,
  });

  // 3D: KOP × KEPALA × EKOR = 4^3 = 64 combinations
  const threeD: string[] = [];
  for (const kop of kopDigits) {
    for (const kepala of kepalaDigits) {
      for (const ekor of ekorDigits) {
        threeD.push(`${kop}${kepala}${ekor}`);
      }
    }
  }
  combinations.push({
    type: "3D",
    label: "3D (KOP × KEPALA × EKOR)",
    positions: ["KOP", "KEPALA", "EKOR"],
    combinations: threeD,
    count: threeD.length,
  });

  // 2D: KEPALA × EKOR = 4^2 = 16 combinations
  const twoD: string[] = [];
  for (const kepala of kepalaDigits) {
    for (const ekor of ekorDigits) {
      twoD.push(`${kepala}${ekor}`);
    }
  }
  combinations.push({
    type: "2D",
    label: "2D (KEPALA × EKOR)",
    positions: ["KEPALA", "EKOR"],
    combinations: twoD,
    count: twoD.length,
  });

  return combinations;
}

/**
 * Create empty prediction result
 */
function createEmptyPrediction(weights: IndicatorWeights): PredictionResult {
  const emptyPosition: PositionPrediction = {
    position: "AS",
    topDigits: [],
    dominantOddEven: "mixed",
    dominantBigSmall: "mixed",
  };

  return {
    weights,
    predictions: {
      AS: { ...emptyPosition },
      KOP: { ...emptyPosition, position: "KOP" },
      KEPALA: { ...emptyPosition, position: "KEPALA" },
      EKOR: { ...emptyPosition, position: "EKOR" },
    },
    combinations: [
      { type: "4D", label: "4D (AS × KOP × KEPALA × EKOR)", positions: ["AS", "KOP", "KEPALA", "EKOR"], combinations: [], count: 0 },
      { type: "3D", label: "3D (KOP × KEPALA × EKOR)", positions: ["KOP", "KEPALA", "EKOR"], combinations: [], count: 0 },
      { type: "2D", label: "2D (KEPALA × EKOR)", positions: ["KEPALA", "EKOR"], combinations: [], count: 0 },
    ],
    generatedAt: new Date(),
    totalResults: 0,
  };
}

/**
 * Calculate combined score for a full number combination
 */
export function calculateCombinationScore(
  combination: string,
  predictions: Record<Position, PositionPrediction>
): { score: number; breakdown: Record<Position, number> } {
  const breakdown: Record<Position, number> = {} as Record<Position, number>;
  let totalScore = 0;

  POSITIONS.forEach((position, idx) => {
    const digit = parseInt(combination[idx]);
    const posPred = predictions[position];
    const digitScore = posPred.topDigits.find(d => d.digit === digit);
    const score = digitScore?.finalScore || 0;
    breakdown[position] = score;
    totalScore += score;
  });

  return {
    score: Math.round((totalScore / 4) * 100) / 100,
    breakdown,
  };
}

export default generatePrediction;
