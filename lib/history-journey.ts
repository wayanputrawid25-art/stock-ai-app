/**
 * History Journey Backtest Analysis Engine
 * 
 * Analyzes historical digit sequences to find transition patterns
 * and generates predictions based on pattern matching with rolling backtest validation.
 * 
 * This is a modular engine that can be reused by other features.
 */

// ============================================================================
// TYPES
// ============================================================================

export type Position = "AS" | "KOP" | "KEPALA" | "EKOR";
export const POSITIONS: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];

export type OrderDepth = 1 | 2 | 3;

export type TrainingSize = 50 | 100 | 200 | "all";

export type PredictionTop = 1 | 3 | 5;

export interface TransitionEntry {
  pattern: string;
  nextNumber: number;
  count: number;
}

export interface PatternFrequency {
  pattern: string;
  nextNumber: number;
  count: number;
  probability: number;
}

export interface PredictionResult {
  currentPattern: string;
  predictions: {
    digit: number;
    count: number;
    probability: number;
  }[];
  totalOccurrences: number;
}

export interface BacktestResult {
  totalTests: number;
  hitTop1: number;
  hitTop3: number;
  hitTop5: number;
  accuracyTop1: number;
  accuracyTop3: number;
  accuracyTop5: number;
  details: BacktestDetail[];
}

export interface BacktestDetail {
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

export interface HistoryJourneyAnalysis {
  position: Position;
  orderDepth: OrderDepth;
  trainingSize: number;
  currentPattern: string;
  predictions: PredictionResult;
  patternFrequency: PatternFrequency[];
  backtest: BacktestResult;
  generatedAt: Date;
}

// ============================================================================
// TRANSITION TABLE ENGINE
// ============================================================================

/**
 * Build transition table from digit sequence
 * Uses Map for O(1) lookups - optimized for performance
 */
export function buildTransitionTable(
  digits: number[],
  order: OrderDepth
): Map<string, Map<number, number>> {
  const table = new Map<string, Map<number, number>>();

  for (let i = 0; i < digits.length - order; i++) {
    // Create pattern key
    const pattern = digits.slice(i, i + order).join("");
    const nextDigit = digits[i + order];

    // Initialize pattern entry if not exists
    if (!table.has(pattern)) {
      table.set(pattern, new Map<number, number>());
    }

    // Increment count
    const patternMap = table.get(pattern)!;
    patternMap.set(nextDigit, (patternMap.get(nextDigit) || 0) + 1);
  }

  return table;
}

/**
 * Get predictions for a given pattern
 */
export function getPredictionsFromTable(
  table: Map<string, Map<number, number>>,
  pattern: string,
  topCount: number = 5
): { digit: number; count: number; probability: number }[] {
  const patternMap = table.get(pattern);
  
  if (!patternMap || patternMap.size === 0) {
    return [];
  }

  // Calculate total occurrences
  let total = 0;
  patternMap.forEach((count) => {
    total += count;
  });

  // Convert to array and sort by count
  const entries: { digit: number; count: number; probability: number }[] = [];
  patternMap.forEach((count, digit) => {
    entries.push({
      digit,
      count,
      probability: total > 0 ? (count / total) * 100 : 0,
    });
  });

  entries.sort((a, b) => b.count - a.count);
  return entries.slice(0, topCount);
}

/**
 * Get total occurrences for a pattern
 */
export function getPatternOccurrences(
  table: Map<string, Map<number, number>>,
  pattern: string
): number {
  const patternMap = table.get(pattern);
  if (!patternMap) return 0;

  let total = 0;
  patternMap.forEach((count) => {
    total += count;
  });
  return total;
}

// ============================================================================
// BACKTEST ENGINE
// ============================================================================

/**
 * Run rolling backtest with specified training size
 * 
 * Algorithm:
 * 1. Use data[0..trainSize-1] to predict data[trainSize]
 * 2. Slide window: use data[1..trainSize] to predict data[trainSize+1]
 * 3. Continue until end of data
 */
export function runBacktest(
  digits: number[],
  order: OrderDepth,
  trainingSize: number,
  topCount: PredictionTop
): BacktestResult {
  if (digits.length <= trainingSize + order) {
    return {
      totalTests: 0,
      hitTop1: 0,
      hitTop3: 0,
      hitTop5: 0,
      accuracyTop1: 0,
      accuracyTop3: 0,
      accuracyTop5: 0,
      details: [],
    };
  }

  const details: BacktestDetail[] = [];
  let hitTop1 = 0;
  let hitTop3 = 0;
  let hitTop5 = 0;

  // Rolling window
  for (let testIndex = trainingSize; testIndex < digits.length - order; testIndex++) {
    // Training data: digits[0..testIndex-1]
    const trainingData = digits.slice(0, testIndex);
    
    // Actual next digit
    const actual = digits[testIndex];

    // Build transition table from training data
    const table = buildTransitionTable(trainingData, order);
    
    // Get current pattern (last 'order' digits before test point)
    const pattern = digits.slice(testIndex - order, testIndex).join("");

    // Get predictions
    const predictions = getPredictionsFromTable(table, pattern, 5);
    
    if (predictions.length === 0) {
      // No pattern found, skip this test
      continue;
    }

    const top1 = predictions[0]?.digit ?? -1;
    const top3 = predictions.slice(0, 3).map((p) => p.digit);
    const top5 = predictions.slice(0, 5).map((p) => p.digit);

    // Check hits
    const isHitTop1 = top1 === actual;
    const isHitTop3 = top3.includes(actual);
    const isHitTop5 = top5.includes(actual);

    if (isHitTop1) hitTop1++;
    if (isHitTop3) hitTop3++;
    if (isHitTop5) hitTop5++;

    details.push({
      index: testIndex,
      pattern,
      actual,
      predictedTop1: top1,
      predictedTop3: top3,
      predictedTop5: top5,
      hitTop1: isHitTop1,
      hitTop3: isHitTop3,
      hitTop5: isHitTop5,
    });
  }

  const totalTests = details.length;

  return {
    totalTests,
    hitTop1,
    hitTop3,
    hitTop5,
    accuracyTop1: totalTests > 0 ? (hitTop1 / totalTests) * 100 : 0,
    accuracyTop3: totalTests > 0 ? (hitTop3 / totalTests) * 100 : 0,
    accuracyTop5: totalTests > 0 ? (hitTop5 / totalTests) * 100 : 0,
    details: details.slice(-100), // Keep last 100 for display
  };
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Extract digits for a specific position from results
 */
export function extractPositionDigits(
  results: { resultNumber: string; drawDate: Date | string }[],
  position: Position,
  limit?: number
): number[] {
  const positionIndex = POSITIONS.indexOf(position);
  
  const digits = results
    .slice(0, limit)
    .map((r) => {
      const num = r.resultNumber.padStart(4, "0");
      return parseInt(num[positionIndex], 10);
    });

  return digits;
}

/**
 * Get training size in actual count
 */
export function getTrainingSizeValue(
  size: TrainingSize,
  totalResults: number
): number {
  if (size === "all") {
    return totalResults;
  }
  return Math.min(size, totalResults);
}

/**
 * Main History Journey Analysis
 * 
 * This is the main entry point that combines all the analysis components.
 */
export function analyzeHistoryJourney(
  results: { resultNumber: string; drawDate: Date | string }[],
  position: Position,
  orderDepth: OrderDepth,
  trainingSize: TrainingSize,
  topCount: PredictionTop = 1
): HistoryJourneyAnalysis {
  // Sort results by date (newest first)
  const sorted = [...results].sort((a, b) => {
    const dateA = new Date(a.drawDate).getTime();
    const dateB = new Date(b.drawDate).getTime();
    return dateB - dateA;
  });

  // Reverse to get chronological order (oldest first)
  const chronological = [...sorted].reverse();

  // Extract digits for position
  const allDigits = extractPositionDigits(chronological, position);
  
  // Apply training size limit
  const trainSizeValue = getTrainingSizeValue(trainingSize, allDigits.length);
  const digits = allDigits.slice(0, trainSizeValue);

  if (digits.length < orderDepth + 1) {
    // Not enough data
    return createEmptyAnalysis(position, orderDepth, trainSizeValue);
  }

  // Build transition table from all training data
  const table = buildTransitionTable(digits, orderDepth);

  // Get current pattern (last 'orderDepth' digits)
  const currentPattern = digits.slice(-orderDepth).join("");

  // Get predictions for current pattern
  const predictions = getPredictionsFromTable(table, currentPattern, 5);
  const totalOccurrences = getPatternOccurrences(table, currentPattern);

  // Build prediction result
  const predictionResult: PredictionResult = {
    currentPattern,
    predictions: predictions.map((p) => ({
      digit: p.digit,
      count: p.count,
      probability: p.probability,
    })),
    totalOccurrences,
  };

  // Build pattern frequency table
  const patternFrequency: PatternFrequency[] = [];
  table.forEach((nextMap, pattern) => {
    let patternTotal = 0;
    nextMap.forEach((count) => {
      patternTotal += count;
    });

    nextMap.forEach((count, nextDigit) => {
      patternFrequency.push({
        pattern,
        nextNumber: nextDigit,
        count,
        probability: patternTotal > 0 ? (count / patternTotal) * 100 : 0,
      });
    });
  });

  // Sort by count descending
  patternFrequency.sort((a, b) => b.count - a.count);

  // Run backtest (use all but last 1 as training, predict last)
  const backtest = runBacktest(digits, orderDepth, Math.max(50, digits.length - 20), topCount);

  return {
    position,
    orderDepth,
    trainingSize: trainSizeValue,
    currentPattern,
    predictions: predictionResult,
    patternFrequency: patternFrequency.slice(0, 50), // Top 50 for display
    backtest,
    generatedAt: new Date(),
  };
}

/**
 * Create empty analysis result
 */
function createEmptyAnalysis(
  position: Position,
  orderDepth: OrderDepth,
  trainingSize: number
): HistoryJourneyAnalysis {
  return {
    position,
    orderDepth,
    trainingSize,
    currentPattern: "",
    predictions: {
      currentPattern: "",
      predictions: [],
      totalOccurrences: 0,
    },
    patternFrequency: [],
    backtest: {
      totalTests: 0,
      hitTop1: 0,
      hitTop3: 0,
      hitTop5: 0,
      accuracyTop1: 0,
      accuracyTop3: 0,
      accuracyTop5: 0,
      details: [],
    },
    generatedAt: new Date(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get pattern string representation
 */
export function formatPattern(pattern: string, order: OrderDepth): string {
  return order === 1 ? `Digit ${pattern}` : `Pattern "${pattern}"`;
}

/**
 * Calculate expected vs actual for display
 */
export function calculateExpectedAccuracy(
  patternFrequency: PatternFrequency[],
  currentPattern: string
): number {
  const entries = patternFrequency.filter((p) => p.pattern === currentPattern);
  
  if (entries.length === 0) return 0;
  
  // Top 1 probability from historical data
  const topEntry = entries.reduce((max, curr) => 
    curr.count > max.count ? curr : max
  , entries[0]);

  return topEntry.probability;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default analyzeHistoryJourney;
