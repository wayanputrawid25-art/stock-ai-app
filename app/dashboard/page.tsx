import Link from "next/link";
import { runAnalysisAction } from "@/app/actions/results";
import { AnalysisCharts } from "@/components/analysis-charts";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { analyzeResults } from "@/lib/analysis";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getDictionary();
  const results = await prisma.result.findMany({ where: { userId: user.id }, orderBy: { drawDate: "desc" }, select: { resultNumber: true, drawDate: true } });
  const analysis = analyzeResults(results);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-normal">{t.dashboard.title}</h1>
        <form action={runAnalysisAction}><Button>{t.dashboard.saveSnapshot}</Button></form>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t.dashboard.results} value={analysis.totalResults} />
        <MetricCard label={`${t.dashboard.top} AS`} value={analysis.prediction.AS[0]?.digit ?? "-"} detail={t.dashboard.predictionLeader} />
        <MetricCard label={`${t.dashboard.top} KOP`} value={analysis.prediction.KOP[0]?.digit ?? "-"} detail={t.dashboard.predictionLeader} />
        <MetricCard label={`${t.dashboard.top} EKOR`} value={analysis.prediction.EKOR[0]?.digit ?? "-"} detail={t.dashboard.predictionLeader} />
      </div>
      <AnalysisCharts analysis={analysis} />
      <div className="grid gap-4 lg:grid-cols-2">
        {(["AS", "KOP", "KEPALA", "EKOR"] as const).map((position) => (
          <Card key={position}>
            <CardHeader><CardTitle>{position} {t.dashboard.predictionTop}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <thead><Tr><Th>{t.dashboard.rank}</Th><Th>{t.dashboard.digit}</Th><Th>{t.dashboard.score}</Th><Th>{t.dashboard.confidence}</Th></Tr></thead>
                <tbody>{analysis.prediction[position].map((row, index) => <Tr key={row.digit}><Td>{index + 1}</Td><Td>{row.digit}</Td><Td>{row.score}</Td><Td>{row.confidence}%</Td></Tr>)}</tbody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link href="/api/export/csv">{t.dashboard.exportCsv}</Link></Button>
        <Button asChild variant="outline"><Link href="/api/export/xlsx">{t.dashboard.exportExcel}</Link></Button>
        <Button asChild variant="outline"><Link href="/api/export/pdf">{t.dashboard.exportPdf}</Link></Button>
      </div>
    </div>
  );
}
