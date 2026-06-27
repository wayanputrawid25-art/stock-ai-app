// 4D Historical Difference Analyzer - Frontend-only logic

export type Position = "AS" | "KOP" | "KEPALA" | "EKOR";
export type PositionKey = "as" | "kop" | "kepala" | "ekor";

export const POSITION_KEY_MAP: Record<Position, PositionKey> = {
  AS: "as",
  KOP: "kop",
  KEPALA: "kepala",
  EKOR: "ekor",
};

export interface ParsedResult {
  resultNumber: string;
  as: number;
  kop: number;
  kepala: number;
  ekor: number;
}

export interface DifferenceRow {
  current: ParsedResult;
  previous: ParsedResult | null;
  differences: {
    as: number | null;
    kop: number | null;
    kepala: number | null;
    ekor: number | null;
  };
}

export interface PositionStats {
  position: Position;
  differences: number[];
  counts: Record<number, number>;
  avgDifference: number;
  mostFrequent: { value: number; count: number } | null;
  positiveCount: number;
  negativeCount: number;
  zeroCount: number;
}

export interface AnalysisResult {
  parsedResults: ParsedResult[];
  differences: DifferenceRow[];
  statistics: {
    as: PositionStats;
    kop: PositionStats;
    kepala: PositionStats;
    ekor: PositionStats;
  };
  summary: {
    totalResults: number;
    totalTransitions: number;
    mostCommonIncrease: { position: Position; diff: number; count: number } | null;
    mostCommonDecrease: { position: Position; diff: number; count: number } | null;
  };
}

// Parse 4-digit numbers from text
export function parseResultsFromText(text: string): ParsedResult[] {
  // Remove all non-digit characters except newlines
  const cleaned = text.replace(/[^0-9\n]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Extract all 4-digit numbers
  const regex = /\b\d{4}\b/g;
  const matches = cleaned.match(regex) || [];
  
  return matches.map((num) => {
    const digits = num.split('').map(Number);
    return {
      resultNumber: num,
      as: digits[0],
      kop: digits[1],
      kepala: digits[2],
      ekor: digits[3],
    };
  });
}

// Calculate differences between consecutive rows
export function calculateDifferences(results: ParsedResult[]): DifferenceRow[] {
  return results.map((current, index) => {
    const previous = index > 0 ? results[index - 1] : null;
    
    return {
      current,
      previous,
      differences: {
        as: previous !== null ? current.as - previous.as : null,
        kop: previous !== null ? current.kop - previous.kop : null,
        kepala: previous !== null ? current.kepala - previous.kepala : null,
        ekor: previous !== null ? current.ekor - previous.ekor : null,
      },
    };
  });
}

// Calculate statistics for a specific position
export function calculatePositionStats(
  position: Position,
  differences: DifferenceRow[]
): PositionStats {
  const positionKey = POSITION_KEY_MAP[position];
  const diffValues = differences
    .map((d) => d.differences[positionKey])
    .filter((v): v is number => v !== null);

  // Count occurrences of each difference value (-9 to +9)
  const counts: Record<number, number> = {};
  for (let i = -9; i <= 9; i++) {
    counts[i] = 0;
  }
  
  diffValues.forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
  });

  const positiveCount = diffValues.filter((v) => v > 0).length;
  const negativeCount = diffValues.filter((v) => v < 0).length;
  const zeroCount = diffValues.filter((v) => v === 0).length;
  
  const avgDifference = diffValues.length > 0
    ? diffValues.reduce((sum, v) => sum + v, 0) / diffValues.length
    : 0;

  // Find most frequent
  let mostFrequent: { value: number; count: number } | null = null;
  for (const [value, count] of Object.entries(counts)) {
    if (count > 0) {
      if (!mostFrequent || count > mostFrequent.count) {
        mostFrequent = { value: Number(value), count };
      }
    }
  }

  return {
    position,
    differences: diffValues,
    counts,
    avgDifference,
    mostFrequent,
    positiveCount,
    negativeCount,
    zeroCount,
  };
}

// Main analysis function
export function analyzeDifferences(results: ParsedResult[]): AnalysisResult {
  const differences = calculateDifferences(results);
  
  const statistics = {
    as: calculatePositionStats("AS", differences),
    kop: calculatePositionStats("KOP", differences),
    kepala: calculatePositionStats("KEPALA", differences),
    ekor: calculatePositionStats("EKOR", differences),
  };

  // Find most common increase and decrease
  let mostCommonIncrease: { position: Position; diff: number; count: number } | null = null;
  let mostCommonDecrease: { position: Position; diff: number; count: number } | null = null;

  const positions: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];
  
  for (const pos of positions) {
    const posKey = POSITION_KEY_MAP[pos];
    for (const [value, count] of Object.entries(statistics[posKey].counts)) {
      const diff = Number(value);
      if (diff > 0 && count > 0) {
        if (!mostCommonIncrease || count > mostCommonIncrease.count) {
          mostCommonIncrease = { position: pos, diff, count };
        }
      }
      if (diff < 0 && count > 0) {
        if (!mostCommonDecrease || count > mostCommonDecrease.count) {
          mostCommonDecrease = { position: pos, diff, count };
        }
      }
    }
  }

  return {
    parsedResults: results,
    differences,
    statistics,
    summary: {
      totalResults: results.length,
      totalTransitions: differences.filter((d) => d.previous !== null).length,
      mostCommonIncrease,
      mostCommonDecrease,
    },
  };
}

// Get frequency data for charts
export function getFrequencyData(results: ParsedResult[]) {
  const positions: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];
  const frequency: Record<Position, Record<number, number>> = {
    AS: {},
    KOP: {},
    KEPALA: {},
    EKOR: {},
  };

  // Initialize counts
  for (const pos of positions) {
    for (let i = 0; i <= 9; i++) {
      frequency[pos][i] = 0;
    }
  }

  // Count occurrences
  results.forEach((r) => {
    frequency.AS[r.as]++;
    frequency.KOP[r.kop]++;
    frequency.KEPALA[r.kepala]++;
    frequency.EKOR[r.ekor]++;
  });

  return frequency;
}

// Get hot digits based on DIFFERENCE patterns - digits that tend to increase (positive trend)
// Uses analysis result which contains both parsedResults and differences
export function getHotDigits(analysis: AnalysisResult, position: Position, count: number = 4): number[] {
  const posKey = POSITION_KEY_MAP[position];
  
  // Track which digits lead to positive differences
  const digitPositiveDiff: Record<number, number> = {};
  const digitNegativeDiff: Record<number, number> = {};
  const digitZeroDiff: Record<number, number> = {};
  
  // Initialize
  for (let i = 0; i <= 9; i++) {
    digitPositiveDiff[i] = 0;
    digitNegativeDiff[i] = 0;
    digitZeroDiff[i] = 0;
  }
  
  // Analyze each difference row
  analysis.differences.forEach((diff) => {
    if (diff.differences[posKey] === null) return;
    
    const currentDigit = diff.current[posKey];
    const diffValue = diff.differences[posKey];
    
    if (diffValue > 0) {
      digitPositiveDiff[currentDigit]++;
    } else if (diffValue < 0) {
      digitNegativeDiff[currentDigit]++;
    } else {
      digitZeroDiff[currentDigit]++;
    }
  });
  
  // Score each digit based on positive difference tendency
  // Higher score = more likely to increase
  const digitScores = Object.entries(digitPositiveDiff).map(([digit, posCount]) => {
    const negCount = digitNegativeDiff[Number(digit)] || 0;
    const zeroCount = digitZeroDiff[Number(digit)] || 0;
    const total = posCount + negCount + zeroCount;
    
    // Score: positive diffs weighted higher, penalize negative diffs
    const score = total > 0 ? (posCount * 2 - negCount) / total : 0;
    
    return { digit: Number(digit), score, positiveCount: posCount };
  });
  
  return digitScores
    .filter(d => d.positiveCount > 0) // Only include digits with positive diffs
    .sort((a, b) => b.score - a.score || a.digit - b.digit)
    .slice(0, count)
    .map(d => d.digit);
}

// Get cold digits based on DIFFERENCE patterns - digits that tend to decrease (negative trend)
export function getColdDigits(analysis: AnalysisResult, position: Position, count: number = 4): number[] {
  const posKey = POSITION_KEY_MAP[position];
  
  const digitNegativeDiff: Record<number, number> = {};
  const digitPositiveDiff: Record<number, number> = {};
  
  for (let i = 0; i <= 9; i++) {
    digitNegativeDiff[i] = 0;
    digitPositiveDiff[i] = 0;
  }
  
  analysis.differences.forEach((diff) => {
    if (diff.differences[posKey] === null) return;
    
    const currentDigit = diff.current[posKey];
    const diffValue = diff.differences[posKey];
    
    if (diffValue < 0) {
      digitNegativeDiff[currentDigit]++;
    } else if (diffValue > 0) {
      digitPositiveDiff[currentDigit]++;
    }
  });
  
  // Score: higher = more likely to decrease
  const digitScores = Object.entries(digitNegativeDiff).map(([digit, negCount]) => {
    const posCount = digitPositiveDiff[Number(digit)] || 0;
    const total = negCount + posCount;
    
    const score = total > 0 ? (negCount * 2 - posCount) / total : 0;
    
    return { digit: Number(digit), score, negativeCount: negCount };
  });
  
  return digitScores
    .filter(d => d.negativeCount > 0)
    .sort((a, b) => b.score - a.score || a.digit - b.digit)
    .slice(0, count)
    .map(d => d.digit);
}

// Get stable digits - digits that tend to stay the same (zero difference)
export function getStableDigits(analysis: AnalysisResult, position: Position, count: number = 4): number[] {
  const posKey = POSITION_KEY_MAP[position];
  
  const digitZeroDiff: Record<number, number> = {};
  const digitTotal: Record<number, number> = {};
  
  for (let i = 0; i <= 9; i++) {
    digitZeroDiff[i] = 0;
    digitTotal[i] = 0;
  }
  
  analysis.differences.forEach((diff) => {
    if (diff.differences[posKey] === null) return;
    
    const currentDigit = diff.current[posKey];
    const diffValue = diff.differences[posKey];
    
    digitTotal[currentDigit]++;
    if (diffValue === 0) {
      digitZeroDiff[currentDigit]++;
    }
  });
  
  const digitScores = Object.entries(digitZeroDiff).map(([digit, zeroCount]) => {
    const total = digitTotal[Number(digit)] || 0;
    const stabilityRatio = total > 0 ? zeroCount / total : 0;
    return { digit: Number(digit), score: stabilityRatio, zeroCount };
  });
  
  return digitScores
    .filter(d => d.zeroCount > 0)
    .sort((a, b) => b.score - a.score || a.digit - b.digit)
    .slice(0, count)
    .map(d => d.digit);
}

// Get difference distribution for charts
export function getDifferenceDistribution(statistics: AnalysisResult["statistics"]) {
  const positions: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];
  const distribution: Record<number, Record<Position, number>> = {};

  // Initialize
  for (let i = -9; i <= 9; i++) {
    distribution[i] = { AS: 0, KOP: 0, KEPALA: 0, EKOR: 0 };
  }

  // Fill counts
  for (const pos of positions) {
    const posKey = POSITION_KEY_MAP[pos];
    for (const [diff, count] of Object.entries(statistics[posKey].counts)) {
      distribution[Number(diff)][pos] = count;
    }
  }

  return distribution;
}