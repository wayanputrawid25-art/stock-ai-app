"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { analyzeResults } from "@/lib/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Analysis = ReturnType<typeof analyzeResults>;

export function AnalysisCharts({ analysis }: { analysis: Analysis }) {
  const frequencyData = analysis.frequency.AS.map((row) => ({
    digit: row.digit,
    AS: row.count,
    KOP: analysis.frequency.KOP.find((item) => item.digit === row.digit)?.count ?? 0,
    KEPALA: analysis.frequency.KEPALA.find((item) => item.digit === row.digit)?.count ?? 0,
    EKOR: analysis.frequency.EKOR.find((item) => item.digit === row.digit)?.count ?? 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequency Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={frequencyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="digit" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="AS" fill="#0f766e" />
            <Bar dataKey="KOP" fill="#2563eb" />
            <Bar dataKey="KEPALA" fill="#ca8a04" />
            <Bar dataKey="EKOR" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
