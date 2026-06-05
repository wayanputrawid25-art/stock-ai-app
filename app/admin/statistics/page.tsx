import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";
import { formatDate } from "@/lib/utils";

export default async function StatisticsPage() {
  const t = await getDictionary();
  const analyses = await prisma.analysisHistory.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: true } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.admin.analysisStats}</h1>
      <Card>
        <CardHeader><CardTitle>{t.admin.recentAnalysisRuns}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <thead><Tr><Th>{t.admin.user}</Th><Th>{t.dashboard.type}</Th><Th>{t.admin.totalResults}</Th><Th>{t.admin.date}</Th></Tr></thead>
            <tbody>
              {analyses.map((item) => {
                const result = item.resultJson as { totalResults?: number };
                return <Tr key={item.id}><Td>{item.user.email}</Td><Td>{item.analysisType}</Td><Td>{result.totalResults ?? 0}</Td><Td>{formatDate(item.createdAt)}</Td></Tr>;
              })}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
