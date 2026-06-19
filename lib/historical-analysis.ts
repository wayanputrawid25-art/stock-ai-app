/**
 * Historical Lottery Analysis Library
 * Statistical analysis for 4-digit lottery results
 */

export type Position = "AS" | "KOP" | "KEPALA" | "EKOR";

export type ResultRecord = {
  resultNumber: string;
  drawDate: Date | string;
};

export type DigitFrequency = {
  digit: number;
  count: number;
  percentage: number;
};

export type PositionAnalysisData = {
  position: Position;
  frequency: DigitFrequency[];
  hotDigits: number[];
  coldDigits: number[];
  avgGap: Record<number, number>;
  lastSeen: Record<number, number>;
};

export type TrendData = {
  digit: number;
  recentCount: number;
  previousCount: number;
  delta: number;
  status: "TREND UP" | "TREND DOWN" | "STABLE";
};

export type PatternAnalysis = {
  oddEvenRatio: { odd: number; even: number; oddPercent: number };
  bigSmallRatio: { big: number; small: number; bigPercent: number };
  consecutivePairs: number;
  repeatedDigits: number;
};

export type DigitScore = {
  digit: number;
  frequencyScore: number;
  recencyScore: number;
  trendScore: number;
  gapScore: number;
  totalScore: number;
  confidence: number;
};

export type Candidate2D = {
  number: string;
  score: number;
  confidence: number;
  reason: string;
};

export type Candidate3D = {
  number: string;
  score: number;
  confidence: number;
  reason: string;
};

export type Candidate4D = {
  number: string;
  score: number;
  confidence: number;
  reason: string;
};

export type AnalysisSummary = {
  totalRecords: number;
  firstDate: Date | null;
  lastDate: Date | null;
  lastResult: string | null;
  dateRange: string;
};

export type HistoricalAnalysisResult = {
  summary: AnalysisSummary;
  overallFrequency: DigitFrequency[];
  hotDigits: number[];
  coldDigits: number[];
  positionAnalysis: Record<Position, PositionAnalysisData>;
  trendAnalysis: Record<Position, TrendData[]>;
  patternAnalysis: PatternAnalysis;
  predictions: {
    "2d": Candidate2D[];
    "3d": Candidate3D[];
    "4d": Candidate4D[];
  };
  json: {
    hot_digit: number[];
    cold_digit: number[];
    position_analysis: Record<Position, number[]>;
    prediction_2d: Array<{ number: string; score: number }>;
    prediction_3d: Array<{ number: string; score: number }>;
    prediction_4d: Array<{ number: string; score: number }>;
  };
};

const POSITIONS: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function sortByCountDescending(a: DigitFrequency, b: DigitFrequency): number {
  return b.count - a.count || a.digit - b.digit;
}

function sortByCountAscending(a: DigitFrequency, b: DigitFrequency): number {
  return a.count - b.count || a.digit - b.digit;
}

function formatDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

function isOdd(n: number): boolean {
  return n % 2 === 1;
}

function isBig(n: number): boolean {
  return n >= 5;
}

function calculateOverallFrequency(records: ResultRecord[]): DigitFrequency[] {
  const counts = new Array(10).fill(0);
  const total = records.length * 4;

  for (const record of records) {
    for (const char of record.resultNumber) {
      counts[parseInt(char)]++;
    }
  }

  return DIGITS.map((digit) => ({
    digit,
    count: counts[digit],
    percentage: (counts[digit] / total) * 100,
  })).sort(sortByCountDescending);
}

function calculatePositionFrequency(
  records: ResultRecord[],
  position: Position
): DigitFrequency[] {
  const positionIndex = POSITIONS.indexOf(position);
  const counts = new Array(10).fill(0);
  const total = records.length;

  for (const record of records) {
    const digit = parseInt(record.resultNumber[positionIndex]);
    counts[digit]++;
  }

  return DIGITS.map((digit) => ({
    digit,
    count: counts[digit],
    percentage: total > 0 ? (counts[digit] / total) * 100 : 0,
  }));
}

function calculateGapStats(
  records: ResultRecord[],
  position: Position
): { avgGap: Record<number, number>; lastSeen: Record<number, number> } {
  const positionIndex = POSITIONS.indexOf(position);
  const gaps: Record<number, number[]> = {};
  const lastSeen: Record<number, number> = {};

  DIGITS.forEach((d) => {
    gaps[d] = [];
    lastSeen[d] = records.length;
  });

  for (let i = 0; i < records.length; i++) {
    const digit = parseInt(records[i].resultNumber[positionIndex]);
    gaps[digit].push(i);
  }

  const avgGap: Record<number, number> = {};
  DIGITS.forEach((d) => {
    if (gaps[d].length > 1) {
      let totalGap = 0;
      for (let i = 1; i < gaps[d].length; i++) {
        totalGap += gaps[d][i] - gaps[d][i - 1];
      }
      avgGap[d] = totalGap / (gaps[d].length - 1);
    } else if (gaps[d].length === 1) {
      avgGap[d] = records.length;
    } else {
      avgGap[d] = records.length * 2;
    }

    if (gaps[d].length > 0) {
      lastSeen[d] = records.length - 1 - gaps[d][gaps[d].length - 1];
    }
  });

  return { avgGap, lastSeen };
}

function calculateTrends(
  records: ResultRecord[],
  position: Position,
  recentCount: number = 50,
  previousCount: number = 50
): TrendData[] {
  const positionIndex = POSITIONS.indexOf(position);
  const sorted = [...records].sort(
    (a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime()
  );

  const recent = sorted.slice(0, recentCount);
  const previous = sorted.slice(recentCount, recentCount + previousCount);

  return DIGITS.map((digit) => {
    const recentFreq = recent.filter(
      (r) => parseInt(r.resultNumber[positionIndex]) === digit
    ).length;
    const previousFreq = previous.filter(
      (r) => parseInt(r.resultNumber[positionIndex]) === digit
    ).length;
    const delta = recentFreq - previousFreq;

    return {
      digit,
      recentCount: recentFreq,
      previousCount: previousFreq,
      delta,
      status:
        delta > 2
          ? "TREND UP"
          : delta < -2
          ? "TREND DOWN"
          : "STABLE",
    };
  });
}

function analyzePatterns(records: ResultRecord[]): PatternAnalysis {
  let oddCount = 0;
  let evenCount = 0;
  let bigCount = 0;
  let smallCount = 0;
  let consecutivePairs = 0;
  let repeatedDigits = 0;

  for (const record of records) {
    const digits = record.resultNumber.split("").map(Number);
    
    for (const d of digits) {
      if (isOdd(d)) oddCount++;
      else evenCount++;
      if (isBig(d)) bigCount++;
      else smallCount++;
    }

    for (let i = 0; i < 3; i++) {
      if (digits[i + 1] === digits[i] + 1 || digits[i + 1] === digits[i] - 1) {
        consecutivePairs++;
      }
    }

    const numDigitCounts = new Map<number, number>();
    for (const d of digits) {
      numDigitCounts.set(d, (numDigitCounts.get(d) || 0) + 1);
    }
    if (Array.from(numDigitCounts.values()).some((c) => c > 1)) {
      repeatedDigits++;
    }
  }

  const total = records.length * 4;

  return {
    oddEvenRatio: {
      odd: oddCount,
      even: evenCount,
      oddPercent: (oddCount / total) * 100,
    },
    bigSmallRatio: {
      big: bigCount,
      small: smallCount,
      bigPercent: (bigCount / total) * 100,
    },
    consecutivePairs,
    repeatedDigits,
  };
}

function calculateDigitScores(
  frequency: DigitFrequency[],
  trendData: TrendData[],
  gapStats: { avgGap: Record<number, number>; lastSeen: Record<number, number> },
  totalRecords: number
): DigitScore[] {
  const maxCount = Math.max(...frequency.map((f) => f.count), 1);
  const maxGap = Math.max(...Object.values(gapStats.avgGap), 1);

  return DIGITS.map((digit) => {
    const freq = frequency.find((f) => f.digit === digit)!;
    const trend = trendData.find((t) => t.digit === digit)!;
    const avgGap = gapStats.avgGap[digit] || 1;
    const lastSeen = gapStats.lastSeen[digit] || totalRecords;

    const frequencyScore = (freq.count / maxCount) * 35;
    const recencyScore = Math.min(25, (lastSeen / totalRecords) * 25);

    let trendScore = 10;
    if (trend.delta > 0) trendScore = Math.min(20, 10 + trend.delta * 2);
    else if (trend.delta < 0) trendScore = Math.max(0, 10 + trend.delta * 2);

    const gapScore = Math.min(20, (avgGap / maxGap) * 20);

    const totalScore = frequencyScore + recencyScore + trendScore + gapScore;
    const confidence = Math.min(100, totalScore);

    return {
      digit,
      frequencyScore: Math.round(frequencyScore * 100) / 100,
      recencyScore: Math.round(recencyScore * 100) / 100,
      trendScore: Math.round(trendScore * 100) / 100,
      gapScore: Math.round(gapScore * 100) / 100,
      totalScore: Math.round(totalScore * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

function generate2DCandidates(
  positionScores: Record<Position, DigitScore[]>,
  hotDigits: number[],
  coldDigits: number[]
): Candidate2D[] {
  const candidates: Candidate2D[] = [];
  const usedPairs = new Set<string>();

  for (let i = 0; i < hotDigits.length; i++) {
    for (let j = 0; j < hotDigits.length; j++) {
      if (i === j) continue;
      const pair = `${hotDigits[i]}${hotDigits[j]}`;
      if (usedPairs.has(pair)) continue;
      usedPairs.add(pair);
      candidates.push({
        number: pair,
        score: 85 + Math.round(Math.random() * 10),
        confidence: 85 + Math.round(Math.random() * 10),
        reason: "Hot digit combination",
      });
    }
  }

  for (const hot of hotDigits.slice(0, 4)) {
    for (const cold of coldDigits.slice(0, 4)) {
      const pair = `${hot}${cold}`;
      if (usedPairs.has(pair)) continue;
      usedPairs.add(pair);
      candidates.push({
        number: pair,
        score: 75 + Math.round(Math.random() * 10),
        confidence: 75 + Math.round(Math.random() * 10),
        reason: "Hot-emerging cold mix",
      });
    }
  }

  const topFromPositions = POSITIONS.map((pos) => positionScores[pos][0]?.digit ?? 0);
  for (let i = 0; i < topFromPositions.length; i++) {
    for (let j = i + 1; j < topFromPositions.length; j++) {
      const pair = `${topFromPositions[i]}${topFromPositions[j]}`;
      if (usedPairs.has(pair)) continue;
      usedPairs.add(pair);
      candidates.push({
        number: pair,
        score: 80 + Math.round(Math.random() * 10),
        confidence: 80 + Math.round(Math.random() * 10),
        reason: "Top position digits",
      });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function generate3DCandidates(
  positionScores: Record<Position, DigitScore[]>,
  hotDigits: number[]
): Candidate3D[] {
  const candidates: Candidate3D[] = [];
  const usedTriples = new Set<string>();

  const topDigits = POSITIONS.map((pos) =>
    positionScores[pos].slice(0, 3).map((d) => d.digit)
  );

  for (const d0 of topDigits[0]) {
    for (const d1 of topDigits[1]) {
      for (const d2 of topDigits[2]) {
        if (d0 === d1 || d1 === d2) continue;
        const triple = `${d0}${d1}${d2}`;
        if (usedTriples.has(triple)) continue;
        usedTriples.add(triple);
        candidates.push({
          number: triple,
          score: 82 + Math.round(Math.random() * 10),
          confidence: 82 + Math.round(Math.random() * 10),
          reason: "Top 3 position digits",
        });
      }
    }
  }

  for (let i = 0; i < Math.min(3, hotDigits.length); i++) {
    for (let j = 0; j < 10; j++) {
      if (hotDigits.includes(j)) continue;
      const triple = `${hotDigits[i]}${hotDigits[(i + 1) % 3]}${j}`;
      if (usedTriples.has(triple)) continue;
      usedTriples.add(triple);
      candidates.push({
        number: triple,
        score: 75 + Math.round(Math.random() * 10),
        confidence: 75 + Math.round(Math.random() * 10),
        reason: "Hot digit variations",
      });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function generate4DCandidates(
  positionScores: Record<Position, DigitScore[]>,
  hotDigits: number[]
): Candidate4D[] {
  const candidates: Candidate4D[] = [];
  const usedNumbers = new Set<string>();

  const bestDigits = POSITIONS.map((pos) =>
    positionScores[pos].slice(0, 5).map((d) => d.digit)
  );

  for (const d0 of bestDigits[0]) {
    for (const d1 of bestDigits[1]) {
      for (const d2 of bestDigits[2]) {
        for (const d3 of bestDigits[3]) {
          if (d0 === d1 && d1 === d2 && d2 === d3) continue;
          const number = `${d0}${d1}${d2}${d3}`;
          if (usedNumbers.has(number)) continue;
          usedNumbers.add(number);

          const score = Math.round(
            (positionScores.AS.find((s) => s.digit === d0)?.totalScore || 50) * 0.3 +
            (positionScores.KOP.find((s) => s.digit === d1)?.totalScore || 50) * 0.25 +
            (positionScores.KEPALA.find((s) => s.digit === d2)?.totalScore || 50) * 0.25 +
            (positionScores.EKOR.find((s) => s.digit === d3)?.totalScore || 50) * 0.2
          );

          candidates.push({
            number,
            score,
            confidence: score,
            reason: "Optimal position combination",
          });
        }
      }
    }
  }

  const hotFocused = hotDigits.slice(0, 4);
  for (let i = 0; i < hotFocused.length; i++) {
    for (const d1 of bestDigits[1]) {
      for (const d2 of bestDigits[2]) {
        for (const d3 of bestDigits[3]) {
          const number = `${hotFocused[i]}${d1}${d2}${d3}`;
          if (usedNumbers.has(number)) continue;
          usedNumbers.add(number);
          candidates.push({
            number,
            score: 70 + Math.round(Math.random() * 15),
            confidence: 70 + Math.round(Math.random() * 15),
            reason: "Hot digit emphasis",
          });
        }
      }
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function createEmptyResult(): HistoricalAnalysisResult {
  const emptyCandidates: Candidate2D[] = [];
  const empty3d: Candidate3D[] = [];
  const empty4d: Candidate4D[] = [];

  return {
    summary: {
      totalRecords: 0,
      firstDate: null,
      lastDate: null,
      lastResult: null,
      dateRange: "No data",
    },
    overallFrequency: DIGITS.map((digit) => ({ digit, count: 0, percentage: 0 })),
    hotDigits: [],
    coldDigits: [],
    positionAnalysis: {} as Record<Position, PositionAnalysisData>,
    trendAnalysis: {} as Record<Position, TrendData[]>,
    patternAnalysis: {
      oddEvenRatio: { odd: 0, even: 0, oddPercent: 0 },
      bigSmallRatio: { big: 0, small: 0, bigPercent: 0 },
      consecutivePairs: 0,
      repeatedDigits: 0,
    },
    predictions: {
      "2d": emptyCandidates,
      "3d": empty3d,
      "4d": empty4d,
    },
    json: {
      hot_digit: [],
      cold_digit: [],
      position_analysis: { AS: [], KOP: [], KEPALA: [], EKOR: [] },
      prediction_2d: [],
      prediction_3d: [],
      prediction_4d: [],
    },
  };
}

export function analyzeHistoricalData(records: ResultRecord[]): HistoricalAnalysisResult {
  if (records.length === 0) {
    return createEmptyResult();
  }

  const sorted = [...records].sort(
    (a, b) => formatDate(b.drawDate).getTime() - formatDate(a.drawDate).getTime()
  );

  const totalRecords = sorted.length;

  const summary: AnalysisSummary = {
    totalRecords,
    firstDate: formatDate(sorted[sorted.length - 1].drawDate),
    lastDate: formatDate(sorted[0].drawDate),
    lastResult: sorted[0].resultNumber,
    dateRange: totalRecords > 1
      ? `${formatDate(sorted[sorted.length - 1].drawDate).toLocaleDateString()} - ${formatDate(sorted[0].drawDate).toLocaleDateString()}`
      : formatDate(sorted[0].drawDate).toLocaleDateString(),
  };

  const overallFrequency = calculateOverallFrequency(sorted);

  const sortedByFreq = [...overallFrequency].sort(sortByCountDescending);
  const hotDigits = sortedByFreq.slice(0, 4).map((f) => f.digit);
  const coldDigits = sortedByFreq.slice(-4).map((f) => f.digit);

  const positionAnalysis: Record<Position, PositionAnalysisData> = {} as Record<Position, PositionAnalysisData>;
  const positionScores: Record<Position, DigitScore[]> = {} as Record<Position, DigitScore[]>;

  for (const position of POSITIONS) {
    const frequency = calculatePositionFrequency(sorted, position);
    const gapStats = calculateGapStats(sorted, position);
    const trends = calculateTrends(sorted, position);
    
    const hotForPos = [...frequency].sort(sortByCountDescending).slice(0, 4).map((f) => f.digit);
    const coldForPos = [...frequency].sort(sortByCountAscending).slice(0, 4).map((f) => f.digit);
    
    const scores = calculateDigitScores(frequency, trends, gapStats, totalRecords);

    positionAnalysis[position] = {
      position,
      frequency,
      hotDigits: hotForPos,
      coldDigits: coldForPos,
      avgGap: gapStats.avgGap,
      lastSeen: gapStats.lastSeen,
    };
    positionScores[position] = scores;
  }

  const trendAnalysis: Record<Position, TrendData[]> = {
    AS: calculateTrends(sorted, "AS"),
    KOP: calculateTrends(sorted, "KOP"),
    KEPALA: calculateTrends(sorted, "KEPALA"),
    EKOR: calculateTrends(sorted, "EKOR"),
  };

  const patternAnalysis = analyzePatterns(sorted);

  const predictions2D = generate2DCandidates(positionScores, hotDigits, coldDigits);
  const predictions3D = generate3DCandidates(positionScores, hotDigits);
  const predictions4D = generate4DCandidates(positionScores, hotDigits);

  return {
    summary,
    overallFrequency,
    hotDigits,
    coldDigits,
    positionAnalysis,
    trendAnalysis,
    patternAnalysis,
    predictions: {
      "2d": predictions2D,
      "3d": predictions3D,
      "4d": predictions4D,
    },
    json: {
      hot_digit: hotDigits,
      cold_digit: coldDigits,
      position_analysis: {
        AS: positionAnalysis.AS.hotDigits,
        KOP: positionAnalysis.KOP.hotDigits,
        KEPALA: positionAnalysis.KEPALA.hotDigits,
        EKOR: positionAnalysis.EKOR.hotDigits,
      },
      prediction_2d: predictions2D.map((p) => ({ number: p.number, score: p.score })),
      prediction_3d: predictions3D.map((p) => ({ number: p.number, score: p.score })),
      prediction_4d: predictions4D.map((p) => ({ number: p.number, score: p.score })),
    },
  };
}

export default analyzeHistoricalData;
