/**
 * Consolidated 4D Analysis Library
 * All-in-one analysis engine for lottery results
 */

export type Position = "AS" | "KOP" | "KEPALA" | "EKOR";
export const POSITIONS: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];

export type ResultRecord = {
  resultNumber: string;
  drawDate: Date | string;
};

// ============================================================================
// TYPES
// ============================================================================

export type DigitFrequency = {
  digit: number;
  count: number;
  percentage: number;
  rank: number;
};

export type HotColdData = {
  position: Position;
  digits: number[];
  data: DigitFrequency[];
};

export type MissingNumber = {
  digit: number;
  lastSeen: number;
  drawsMissed: number;
  avgGap: number;
};

export type GapAnalysis = {
  position: Position;
  data: {
    digit: number;
    gapScore: number;
    avgGap: number;
    lastSeen: number;
  }[];
};

export type TrendData = {
  digit: number;
  recentCount: number;
  previousCount: number;
  delta: number;
  status: "TREND UP" | "TREND DOWN" | "STABLE";
};

export type PatternAnalysis = {
  position: Position;
  oddEven: { oddCount: number; oddPercent: number; evenCount: number; evenPercent: number };
  bigSmall: { bigCount: number; bigPercent: number; smallCount: number; smallPercent: number };
};

export type SumData = {
  sum: number;
  count: number;
  percentage: number;
};

export type Pair2D = {
  pair: string;
  count: number;
  percentage: number;
  lastSeen: number;
};

export type MirrorNumber = {
  original: number;
  mirror: number;
  occurrences: number;
};

export type FrequencyChart = {
  position: Position;
  data: { digit: number; count: number; percentage: number }[];
};

export type MissingChart = {
  data: { digit: number; drawsMissed: number; lastSeen: number }[];
};

export type PositionStatsChart = {
  position: Position;
  oddEven: { odd: number; even: number };
  bigSmall: { big: number; small: number };
  avgValue: number;
};

export type HistoryItem = {
  resultNumber: string;
  drawDate: Date | string;
  sum: number;
  oddEven: string;
  bigSmall: string;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

function sortByCountDesc(a: { count: number }, b: { count: number }): number {
  return b.count - a.count;
}

function isOdd(n: number): boolean {
  return n % 2 === 1;
}

function isBig(n: number): boolean {
  return n >= 5;
}

// ============================================================================
// FREQUENCY ANALYSIS
// ============================================================================

export function analyzeFrequency(records: ResultRecord[]): Record<Position, DigitFrequency[]> {
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  const total = sorted.length || 1;
  
  const result: Record<Position, DigitFrequency[]> = {} as Record<Position, DigitFrequency[]>;
  
  for (const position of POSITIONS) {
    const idx = POSITIONS.indexOf(position);
    const counts: number[] = new Array(10).fill(0);
    
    sorted.forEach(r => {
      counts[parseInt(r.resultNumber[idx])]++;
    });
    
    result[position] = counts.map((count, digit) => ({
      digit,
      count,
      percentage: (count / total) * 100,
      rank: 0
    })).sort((a, b) => b.count - a.count || a.digit - b.digit)
       .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }
  
  return result;
}

// ============================================================================
// HOT & COLD ANALYSIS
// ============================================================================

export function analyzeHotCold(records: ResultRecord[], topCount: number = 6): { hot: HotColdData[]; cold: HotColdData[] } {
  const frequency = analyzeFrequency(records);
  
  const hot = POSITIONS.map(pos => ({
    position: pos,
    digits: frequency[pos].slice(0, topCount).map(d => d.digit),
    data: frequency[pos].slice(0, topCount)
  }));
  
  const cold = POSITIONS.map(pos => ({
    position: pos,
    digits: [...frequency[pos]].sort((a, b) => a.count - b.count || a.digit - b.digit).slice(0, topCount).map(d => d.digit),
    data: [...frequency[pos]].sort((a, b) => a.count - b.count || a.digit - b.digit).slice(0, topCount)
  }));
  
  return { hot, cold };
}

// ============================================================================
// MISSING NUMBER ANALYSIS
// ============================================================================

export function analyzeMissing(records: ResultRecord[]): Record<Position, MissingNumber[]> {
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  const total = sorted.length;
  
  const result: Record<Position, MissingNumber[]> = {} as Record<Position, MissingNumber[]>;
  
  for (const position of POSITIONS) {
    const idx = POSITIONS.indexOf(position);
    const gaps: Record<number, number[]> = {};
    
    for (let d = 0; d <= 9; d++) gaps[d] = [];
    
    sorted.forEach((r, i) => {
      gaps[parseInt(r.resultNumber[idx])].push(i);
    });
    
    result[position] = Array.from({ length: 10 }, (_, digit) => {
      const appearances = gaps[digit];
      const lastSeen = appearances.length > 0 ? total - 1 - appearances[appearances.length - 1] : total;
      
      let avgGap = total;
      if (appearances.length > 1) {
        let sum = 0;
        for (let i = 1; i < appearances.length; i++) {
          sum += appearances[i] - appearances[i - 1];
        }
        avgGap = sum / (appearances.length - 1);
      } else if (appearances.length === 1) {
        avgGap = total;
      }
      
      return {
        digit,
        lastSeen,
        drawsMissed: lastSeen,
        avgGap: Math.round(avgGap * 100) / 100
      };
    }).sort((a, b) => b.drawsMissed - a.drawsMissed || a.digit - b.digit);
  }
  
  return result;
}

// ============================================================================
// GAP ANALYSIS
// ============================================================================

export function analyzeGap(records: ResultRecord[]): GapAnalysis[] {
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  const total = sorted.length;
  
  return POSITIONS.map(position => {
    const idx = POSITIONS.indexOf(position);
    const gaps: Record<number, number[]> = {};
    
    for (let d = 0; d <= 9; d++) gaps[d] = [];
    
    sorted.forEach((r, i) => {
      gaps[parseInt(r.resultNumber[idx])].push(i);
    });
    
    const maxGap = Math.max(...Array.from({ length: 10 }, (_, d) => {
      if (gaps[d].length > 1) {
        let max = 0;
        for (let i = 1; i < gaps[d].length; i++) {
          max = Math.max(max, gaps[d][i] - gaps[d][i - 1]);
        }
        return max;
      }
      return total;
    }));
    
    const data = Array.from({ length: 10 }, (_, digit) => {
      const appearances = gaps[digit];
      const lastSeen = appearances.length > 0 ? total - 1 - appearances[appearances.length - 1] : total;
      
      let avgGap = total;
      if (appearances.length > 1) {
        let sum = 0;
        for (let i = 1; i < appearances.length; i++) {
          sum += appearances[i] - appearances[i - 1];
        }
        avgGap = sum / (appearances.length - 1);
      } else if (appearances.length === 1) {
        avgGap = total;
      }
      
      const gapScore = lastSeen > 0 ? Math.min(10, (lastSeen / (total || 1)) * 10 + avgGap / 10) : 0;
      
      return { digit, gapScore: Math.round(gapScore * 100) / 100, avgGap: Math.round(avgGap * 100) / 100, lastSeen };
    }).sort((a, b) => b.gapScore - a.gapScore || a.digit - b.digit);
    
    return { position, data };
  });
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

export function analyzeTrend(records: ResultRecord[]): Record<Position, TrendData[]> {
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  
  const result: Record<Position, TrendData[]> = {} as Record<Position, TrendData[]>;
  
  for (const position of POSITIONS) {
    const idx = POSITIONS.indexOf(position);
    const recent = sorted.slice(0, 50);
    const previous = sorted.slice(50, 100);
    
    result[position] = Array.from({ length: 10 }, (_, digit) => {
      const recentCount = recent.filter(r => parseInt(r.resultNumber[idx]) === digit).length;
      const previousCount = previous.filter(r => parseInt(r.resultNumber[idx]) === digit).length;
      const delta = recentCount - previousCount;
      
      const status: TrendData["status"] = delta > 2 ? "TREND UP" : delta < -2 ? "TREND DOWN" : "STABLE";
      
      return {
        digit,
        recentCount,
        previousCount,
        delta,
        status
      };
    }).sort((a, b) => b.delta - a.delta || a.digit - b.digit);
  }
  
  return result;
}

// ============================================================================
// PATTERN ANALYSIS (Odd/Even, Big/Small)
// ============================================================================

export function analyzePattern(records: ResultRecord[]): PatternAnalysis[] {
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  const total = sorted.length || 1;
  
  return POSITIONS.map(position => {
    const idx = POSITIONS.indexOf(position);
    
    let oddCount = 0, evenCount = 0, bigCount = 0, smallCount = 0;
    
    sorted.forEach(r => {
      const digit = parseInt(r.resultNumber[idx]);
      if (isOdd(digit)) oddCount++; else evenCount++;
      if (isBig(digit)) bigCount++; else smallCount++;
    });
    
    return {
      position,
      oddEven: {
        oddCount, oddPercent: (oddCount / total) * 100,
        evenCount, evenPercent: (evenCount / total) * 100
      },
      bigSmall: {
        bigCount, bigPercent: (bigCount / total) * 100,
        smallCount, smallPercent: (smallCount / total) * 100
      }
    };
  });
}

// ============================================================================
// SUM ANALYSIS
// ============================================================================

export function analyzeSum(records: ResultRecord[]): {
  distribution: SumData[];
  stats: { mean: number; median: number; mode: number; min: number; max: number };
  composition: {
    twoEvenTwoOdd: number;
    threeEvenOneOdd: number;
    threeOddOneEven: number;
    fourEven: number;
    fourOdd: number;
  };
} {
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  const total = sorted.length || 1;
  
  const sums = sorted.map(r => r.resultNumber.split("").reduce((a, d) => a + parseInt(d), 0));
  
  const sumCounts: Record<number, number> = {};
  sums.forEach(s => { sumCounts[s] = (sumCounts[s] || 0) + 1; });
  
  const distribution: SumData[] = [];
  for (let s = 0; s <= 36; s++) {
    distribution.push({
      sum: s,
      count: sumCounts[s] || 0,
      percentage: ((sumCounts[s] || 0) / total) * 100
    });
  }
  distribution.sort((a, b) => b.count - a.count || a.sum - b.sum);
  
  const mean = sums.length > 0 ? sums.reduce((a, b) => a + b, 0) / sums.length : 0;
  const sortedSums = [...sums].sort((a, b) => a - b);
  const median = sortedSums.length > 0
    ? sortedSums.length % 2 === 0
      ? (sortedSums[sortedSums.length / 2 - 1] + sortedSums[sortedSums.length / 2]) / 2
      : sortedSums[Math.floor(sortedSums.length / 2)]
    : 0;
  
  let mode = 0, maxCount = 0;
  for (const [s, c] of Object.entries(sumCounts)) {
    if (c > maxCount) { maxCount = c; mode = parseInt(s); }
  }
  
  const composition = { twoEvenTwoOdd: 0, threeEvenOneOdd: 0, threeOddOneEven: 0, fourEven: 0, fourOdd: 0 };
  sorted.forEach(r => {
    const digits = r.resultNumber.split("").map(Number);
    const evenCount = digits.filter(d => d % 2 === 0).length;
    if (evenCount === 2) composition.twoEvenTwoOdd++;
    else if (evenCount === 3) composition.threeEvenOneOdd++;
    else if (evenCount === 1) composition.threeOddOneEven++;
    else if (evenCount === 4) composition.fourEven++;
    else composition.fourOdd++;
  });
  
  return {
    distribution,
    stats: {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode,
      min: sortedSums[0] ?? 0,
      max: sortedSums[sortedSums.length - 1] ?? 0
    },
    composition
  };
}

// ============================================================================
// PAIR 2D ANALYSIS
// ============================================================================

export function analyzePair2D(records: ResultRecord[]): Pair2D[] {
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  const total = sorted.length || 1;
  
  const pairCounts: Record<string, { count: number; lastSeen: number }> = {};
  const pairPositions: Record<string, number> = {};
  
  sorted.forEach((r, idx) => {
    const sum = r.resultNumber.split("").reduce((a, d) => a + parseInt(d), 0);
    const pair = sum.toString().padStart(2, "0");
    
    if (!pairCounts[pair]) {
      pairCounts[pair] = { count: 0, lastSeen: idx };
      pairPositions[pair] = idx;
    }
    pairCounts[pair].count++;
    pairPositions[pair] = Math.min(pairPositions[pair], idx);
  });
  
  return Object.entries(pairCounts)
    .map(([pair, data]) => ({
      pair,
      count: data.count,
      percentage: (data.count / total) * 100,
      lastSeen: data.lastSeen + 1
    }))
    .sort((a, b) => b.count - a.count || parseInt(a.pair) - parseInt(b.pair));
}

// ============================================================================
// MIRROR NUMBER ANALYSIS
// ============================================================================

const MIRROR_MAP: Record<number, number> = {
  0: 5, 1: 6, 2: 7, 3: 8, 4: 9,
  5: 0, 6: 1, 7: 2, 8: 3, 9: 4
};

export function analyzeMirror(records: ResultRecord[]): MirrorNumber[] {
  const mirrorCounts: Record<number, number> = {};
  
  records.forEach(r => {
    r.resultNumber.split("").forEach(d => {
      const digit = parseInt(d);
      mirrorCounts[MIRROR_MAP[digit]] = (mirrorCounts[MIRROR_MAP[digit]] || 0) + 1;
    });
  });
  
  return Array.from({ length: 10 }, (_, digit) => ({
    original: digit,
    mirror: MIRROR_MAP[digit],
    occurrences: mirrorCounts[digit] || 0
  })).sort((a, b) => b.occurrences - a.occurrences);
}

// ============================================================================
// CHART DATA
// ============================================================================

export function getFrequencyChartData(records: ResultRecord[]): FrequencyChart[] {
  const frequency = analyzeFrequency(records);
  
  return POSITIONS.map(pos => ({
    position: pos,
    data: frequency[pos]
  }));
}

export function getMissingChartData(records: ResultRecord[]): MissingChart {
  const missing = analyzeMissing(records);
  
  const allMissing: { digit: number; drawsMissed: number; lastSeen: number }[] = [];
  POSITIONS.forEach(pos => {
    missing[pos].forEach(m => {
      const existing = allMissing.find(d => d.digit === m.digit);
      if (existing) {
        existing.drawsMissed = Math.max(existing.drawsMissed, m.drawsMissed);
        existing.lastSeen = Math.max(existing.lastSeen, m.lastSeen);
      } else {
        allMissing.push({ digit: m.digit, drawsMissed: m.drawsMissed, lastSeen: m.lastSeen });
      }
    });
  });
  
  return { data: allMissing.sort((a, b) => b.drawsMissed - a.drawsMissed) };
}

export function getPositionStatsChart(records: ResultRecord[]): PositionStatsChart[] {
  const pattern = analyzePattern(records);
  const frequency = analyzeFrequency(records);
  
  return POSITIONS.map((pos, idx) => {
    const digits = records.map(r => parseInt(r.resultNumber[idx]));
    const avgValue = digits.length > 0 ? digits.reduce((a, b) => a + b, 0) / digits.length : 0;
    
    return {
      position: pos,
      oddEven: { odd: pattern[idx].oddEven.oddCount, even: pattern[idx].oddEven.evenCount },
      bigSmall: { big: pattern[idx].bigSmall.bigCount, small: pattern[idx].bigSmall.smallCount },
      avgValue: Math.round(avgValue * 100) / 100
    };
  });
}

export function getHistoryData(records: ResultRecord[]): HistoryItem[] {
  return [...records]
    .sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime())
    .map(r => {
      const digits = r.resultNumber.split("").map(Number);
      const sum = digits.reduce((a, d) => a + d, 0);
      const oddCount = digits.filter(d => isOdd(d)).length;
      const bigCount = digits.filter(d => isBig(d)).length;
      
      return {
        resultNumber: r.resultNumber,
        drawDate: r.drawDate,
        sum,
        oddEven: `${oddCount} Ganjil / ${4 - oddCount} Genap`,
        bigSmall: `${bigCount} Besar / ${4 - bigCount} Kecil`
      };
    });
}

// ============================================================================
// MAIN ANALYZER FUNCTION
// ============================================================================

export type AnalysisResult = {
  totalResults: number;
  dateRange: { start: Date | null; end: Date | null };
  
  // Frequency
  frequency: Record<Position, DigitFrequency[]>;
  
  // Hot & Cold
  hot: HotColdData[];
  cold: HotColdData[];
  
  // Missing
  missing: Record<Position, MissingNumber[]>;
  
  // Position Analysis
  positionAnalysis: {
    position: Position;
    hotDigits: number[];
    coldDigits: number[];
    mostFrequent: number;
    leastFrequent: number;
  }[];
  
  // Pattern
  pattern: PatternAnalysis[];
  
  // Sum
  sum: {
    distribution: SumData[];
    stats: { mean: number; median: number; mode: number; min: number; max: number };
    composition: {
      twoEvenTwoOdd: number;
      threeEvenOneOdd: number;
      threeOddOneEven: number;
      fourEven: number;
      fourOdd: number;
    };
  };
  
  // Pair 2D
  pair2D: Pair2D[];
  
  // Mirror
  mirror: MirrorNumber[];
  
  // Gap
  gap: GapAnalysis[];
  
  // Trend
  trend: Record<Position, TrendData[]>;
  
  // Charts
  charts: {
    frequency: FrequencyChart[];
    missing: MissingChart;
    positionStats: PositionStatsChart[];
    history: HistoryItem[];
  };
};

export function analyzeAll(records: ResultRecord[]): AnalysisResult {
  if (records.length === 0) {
    return createEmptyResult();
  }
  
  const sorted = [...records].sort((a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime());
  const frequency = analyzeFrequency(records);
  const { hot, cold } = analyzeHotCold(records);
  const missing = analyzeMissing(records);
  const pattern = analyzePattern(records);
  const sum = analyzeSum(records);
  const pair2D = analyzePair2D(records);
  const mirror = analyzeMirror(records);
  const gap = analyzeGap(records);
  const trend = analyzeTrend(records);
  
  const positionAnalysis = POSITIONS.map(pos => {
    const freq = frequency[pos];
    const coldFreq = [...freq].sort((a, b) => a.count - b.count);
    
    return {
      position: pos,
      hotDigits: freq.slice(0, 6).map(d => d.digit),
      coldDigits: coldFreq.slice(0, 6).map(d => d.digit),
      mostFrequent: freq[0].digit,
      leastFrequent: coldFreq[0].digit
    };
  });
  
  return {
    totalResults: sorted.length,
    dateRange: {
      start: formatDate(sorted[sorted.length - 1].drawDate),
      end: formatDate(sorted[0].drawDate)
    },
    frequency,
    hot,
    cold,
    missing,
    positionAnalysis,
    pattern,
    sum,
    pair2D,
    mirror,
    gap,
    trend,
    charts: {
      frequency: getFrequencyChartData(records),
      missing: getMissingChartData(records),
      positionStats: getPositionStatsChart(records),
      history: getHistoryData(records)
    }
  };
}

function createEmptyResult(): AnalysisResult {
  const emptyFreq: DigitFrequency[] = Array.from({ length: 10 }, (_, d) => ({
    digit: d, count: 0, percentage: 0, rank: d + 1
  }));
  
  const emptyPattern: PatternAnalysis[] = POSITIONS.map(pos => ({
    position: pos,
    oddEven: { oddCount: 0, oddPercent: 0, evenCount: 0, evenPercent: 0 },
    bigSmall: { bigCount: 0, bigPercent: 0, smallCount: 0, smallPercent: 0 }
  }));
  
  return {
    totalResults: 0,
    dateRange: { start: null, end: null },
    frequency: Object.fromEntries(POSITIONS.map(p => [p, emptyFreq])) as Record<Position, DigitFrequency[]>,
    hot: POSITIONS.map(pos => ({ position: pos, digits: [], data: [] })),
    cold: POSITIONS.map(pos => ({ position: pos, digits: [], data: [] })),
    missing: Object.fromEntries(POSITIONS.map(p => [p, []])) as unknown as Record<Position, MissingNumber[]>,
    positionAnalysis: POSITIONS.map(pos => ({
      position: pos, hotDigits: [], coldDigits: [], mostFrequent: 0, leastFrequent: 0
    })),
    pattern: emptyPattern,
    sum: {
      distribution: [],
      stats: { mean: 0, median: 0, mode: 0, min: 0, max: 0 },
      composition: { twoEvenTwoOdd: 0, threeEvenOneOdd: 0, threeOddOneEven: 0, fourEven: 0, fourOdd: 0 }
    },
    pair2D: [],
    mirror: Array.from({ length: 10 }, (_, d) => ({ original: d, mirror: MIRROR_MAP[d], occurrences: 0 })),
    gap: POSITIONS.map(pos => ({ position: pos, data: [] })),
    trend: Object.fromEntries(POSITIONS.map(p => [p, []])) as unknown as Record<Position, TrendData[]>,
    charts: {
      frequency: POSITIONS.map(pos => ({ position: pos, data: [] })),
      missing: { data: [] },
      positionStats: POSITIONS.map(pos => ({
        position: pos, oddEven: { odd: 0, even: 0 }, bigSmall: { big: 0, small: 0 }, avgValue: 0
      })),
      history: []
    }
  };
}

export default analyzeAll;
