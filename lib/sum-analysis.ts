import type { Position } from "./analysis";

export type ResultRecord = {
  resultNumber: string;
  drawDate: Date | string;
};

export type SumKPI = {
  position: Position;
  avgDigit: number;
  avgDigitPercentage: number;
  dominantDigit: number;
  dominantDigitCount: number;
  dominantDigitPercentage: number;
  evenCount: number;
  evenPercentage: number;
  oddCount: number;
  oddPercentage: number;
  bigCount: number;
  bigPercentage: number;
  smallCount: number;
  smallPercentage: number;
};

export type SumDistribution = {
  sum: number;
  count: number;
  percentage: number;
};

export type SumAnalysisResult = {
  totalResults: number;
  sumDistribution: SumDistribution[];
  overallStats: {
    mean: number;
    median: number;
    mode: number;
    min: number;
    max: number;
    range: number;
  };
  composition: {
    evenOdd: {
      twoEvenTwoOdd: number;
      threeEvenOneOdd: number;
      threeOddOneEven: number;
      fourEven: number;
      fourOdd: number;
    };
    balance: {
      balancedCount: number;
      balancedPercentage: number;
    };
  };
  positionKPIs: SumKPI[];
};

export function analyzeSum(results: ResultRecord[]): SumAnalysisResult {
  const sorted = [...results].sort(
    (a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
  );
  const total = sorted.length || 1;

  // Calculate SUM for each result
  const sums = sorted.map((r) =>
    r.resultNumber.split("").reduce((acc, d) => acc + parseInt(d, 10), 0)
  );

  // Sum distribution (0-36)
  const sumCounts: Record<number, number> = {};
  for (let i = 0; i <= 36; i++) sumCounts[i] = 0;
  sums.forEach((s) => {
    sumCounts[s] = (sumCounts[s] || 0) + 1;
  });

  const sumDistribution: SumDistribution[] = Object.entries(sumCounts)
    .map(([sum, count]) => ({
      sum: parseInt(sum, 10),
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count || a.sum - b.sum);

  // Overall stats
  const mean = sums.length > 0 ? sums.reduce((a, b) => a + b, 0) / sums.length : 0;
  const sortedSums = [...sums].sort((a, b) => a - b);
  const median =
    sortedSums.length > 0
      ? sortedSums.length % 2 === 0
        ? (sortedSums[sortedSums.length / 2 - 1] + sortedSums[sortedSums.length / 2]) / 2
        : sortedSums[Math.floor(sortedSums.length / 2)]
      : 0;

  // Mode - most frequent sum
  let mode = 0;
  let maxCount = 0;
  for (const [s, c] of Object.entries(sumCounts)) {
    if (c > maxCount) {
      maxCount = c;
      mode = parseInt(s, 10);
    }
  }

  const min = sortedSums[0] ?? 0;
  const max = sortedSums[sortedSums.length - 1] ?? 0;

  // Composition analysis (even-odd per position)
  const positions: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];
  const composition = {
    evenOdd: {
      twoEvenTwoOdd: 0,
      threeEvenOneOdd: 0,
      threeOddOneEven: 0,
      fourEven: 0,
      fourOdd: 0,
    },
    balance: {
      balancedCount: 0,
      balancedPercentage: 0,
    },
  };

  for (const record of sorted) {
    const digits = record.resultNumber.split("").map(Number);
    const evenCount = digits.filter((d) => d % 2 === 0).length;
    const oddCount = 4 - evenCount;

    if (evenCount === 2 && oddCount === 2) composition.evenOdd.twoEvenTwoOdd++;
    else if (evenCount === 3 && oddCount === 1) composition.evenOdd.threeEvenOneOdd++;
    else if (evenCount === 1 && oddCount === 3) composition.evenOdd.threeOddOneEven++;
    else if (evenCount === 4) composition.evenOdd.fourEven++;
    else if (oddCount === 4) composition.evenOdd.fourOdd++;

    if (evenCount === 2 || oddCount === 2) composition.balance.balancedCount++;
  }
  composition.balance.balancedPercentage =
    (composition.balance.balancedCount / total) * 100;

  // Position KPIs
  const positionKPIs: SumKPI[] = positions.map((position, idx) => {
    const digitCounts: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) digitCounts[d] = 0;
    sorted.forEach((r) => {
      digitCounts[parseInt(r.resultNumber[idx], 10)]++;
    });

    // Average digit value
    let totalDigit = 0;
    sorted.forEach((r) => {
      totalDigit += parseInt(r.resultNumber[idx], 10);
    });
    const avgDigit = sorted.length > 0 ? totalDigit / sorted.length : 0;

    // Dominant digit
    let dominantDigit = 0;
    let dominantCount = 0;
    for (const [d, c] of Object.entries(digitCounts)) {
      if (c > dominantCount) {
        dominantCount = c;
        dominantDigit = parseInt(d, 10);
      }
    }

    const evenCount = sorted.filter((r) => parseInt(r.resultNumber[idx], 10) % 2 === 0).length;
    const oddCount = total - evenCount;
    const bigCount = sorted.filter((r) => parseInt(r.resultNumber[idx], 10) >= 5).length;
    const smallCount = total - bigCount;

    return {
      position,
      avgDigit: Math.round(avgDigit * 100) / 100,
      avgDigitPercentage: (avgDigit / 9) * 100,
      dominantDigit,
      dominantDigitCount: dominantCount,
      dominantDigitPercentage: (dominantCount / total) * 100,
      evenCount,
      evenPercentage: (evenCount / total) * 100,
      oddCount,
      oddPercentage: (oddCount / total) * 100,
      bigCount,
      bigPercentage: (bigCount / total) * 100,
      smallCount,
      smallPercentage: (smallCount / total) * 100,
    };
  });

  return {
    totalResults: sorted.length,
    sumDistribution,
    overallStats: {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode,
      min,
      max,
      range: max - min,
    },
    composition,
    positionKPIs,
  };
}
