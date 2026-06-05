export type Position = "AS" | "KOP" | "KEPALA" | "EKOR";

export type ResultRecord = {
  resultNumber: string;
  drawDate: Date | string;
};

const positions: Position[] = ["AS", "KOP", "KEPALA", "EKOR"];

function emptyCounts() {
  return Object.fromEntries(positions.map((pos) => [pos, Array.from({ length: 10 }, (_, digit) => ({ digit, count: 0 }))])) as Record<
    Position,
    { digit: number; count: number }[]
  >;
}

export function analyzeResults(records: ResultRecord[]) {
  const sorted = [...records].sort((a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime());
  const total = sorted.length || 1;
  const counts = emptyCounts();

  for (const record of sorted) {
    const digits = record.resultNumber.split("").map(Number);
    positions.forEach((position, index) => {
      counts[position][digits[index]].count += 1;
    });
  }

  const frequency = Object.fromEntries(
    positions.map((position) => [
      position,
      counts[position]
        .map((row) => ({ ...row, percentage: (row.count / total) * 100 }))
        .sort((a, b) => b.count - a.count || a.digit - b.digit)
        .map((row, index) => ({ rank: index + 1, ...row }))
    ])
  ) as Record<Position, Array<{ rank: number; digit: number; count: number; percentage: number }>>;

  const gap = Object.fromEntries(
    positions.map((position, index) => [
      position,
      Array.from({ length: 10 }, (_, digit) => {
        const foundIndex = sorted.findIndex((record) => Number(record.resultNumber[index]) === digit);
        return { digit, gapScore: foundIndex === -1 ? sorted.length : foundIndex };
      }).sort((a, b) => b.gapScore - a.gapScore || a.digit - b.digit)
    ])
  ) as Record<Position, Array<{ digit: number; gapScore: number }>>;

  const trend = Object.fromEntries(
    positions.map((position, index) => {
      const recent = sorted.slice(0, 50);
      const previous = sorted.slice(50, 100);
      return [
        position,
        Array.from({ length: 10 }, (_, digit) => {
          const recentCount = recent.filter((record) => Number(record.resultNumber[index]) === digit).length;
          const previousCount = previous.filter((record) => Number(record.resultNumber[index]) === digit).length;
          const delta = recentCount - previousCount;
          return {
            digit,
            recentCount,
            previousCount,
            delta,
            status: delta > 0 ? "TREND UP" : delta < 0 ? "TREND DOWN" : "TREND STABLE"
          };
        }).sort((a, b) => b.delta - a.delta || a.digit - b.digit)
      ];
    })
  ) as Record<Position, Array<{ digit: number; recentCount: number; previousCount: number; delta: number; status: string }>>;

  const oddEven = Object.fromEntries(
    positions.map((position, index) => {
      const odd = sorted.filter((record) => Number(record.resultNumber[index]) % 2 === 1).length;
      const even = sorted.length - odd;
      return [position, { oddPercentage: (odd / total) * 100, evenPercentage: (even / total) * 100 }];
    })
  ) as Record<Position, { oddPercentage: number; evenPercentage: number }>;

  const bigSmall = Object.fromEntries(
    positions.map((position, index) => {
      const big = sorted.filter((record) => Number(record.resultNumber[index]) >= 5).length;
      const small = sorted.length - big;
      return [position, { bigPercentage: (big / total) * 100, smallPercentage: (small / total) * 100 }];
    })
  ) as Record<Position, { bigPercentage: number; smallPercentage: number }>;

  const prediction = Object.fromEntries(
    positions.map((position) => {
      const maxCount = Math.max(...frequency[position].map((row) => row.count), 1);
      const maxGap = Math.max(...gap[position].map((row) => row.gapScore), 1);
      const scored = frequency[position].map((row) => {
        const gapRow = gap[position].find((item) => item.digit === row.digit)!;
        const trendRow = trend[position].find((item) => item.digit === row.digit)!;
        const frequencyScore = (row.count / maxCount) * 40;
        const gapScore = (gapRow.gapScore / maxGap) * 30;
        const trendScore = Math.max(0, Math.min(20, 10 + trendRow.delta * 2));
        const momentumScore = sorted.slice(0, 20).some((record) => record.resultNumber[positions.indexOf(position)] === String(row.digit)) ? 10 : 4;
        const score = frequencyScore + gapScore + trendScore + momentumScore;
        return { digit: row.digit, score: Number(score.toFixed(2)), confidence: Number(Math.min(99, score).toFixed(2)) };
      });
      return [position, scored.sort((a, b) => b.score - a.score || a.digit - b.digit).slice(0, 10)];
    })
  ) as Record<Position, Array<{ digit: number; score: number; confidence: number }>>;

  return {
    totalResults: sorted.length,
    frequency,
    hot: Object.fromEntries(positions.map((position) => [position, frequency[position].slice(0, 10)])),
    cold: Object.fromEntries(positions.map((position) => [position, [...frequency[position]].sort((a, b) => a.count - b.count || a.digit - b.digit).slice(0, 10)])),
    gap,
    trend,
    oddEven,
    bigSmall,
    prediction
  };
}
