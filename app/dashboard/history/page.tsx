import { deleteAnalysisAction } from "@/app/actions/results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";
import { formatDate } from "@/lib/utils";

export default async function HistoryPage() {
  const user = await requireUser();
  const t = await getDictionary();
  const history = await prisma.analysisHistory.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.dashboard.historyTitle}</h1>
      <Card>
        <CardHeader><CardTitle>{t.dashboard.savedAnalyses}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <thead><Tr><Th>{t.dashboard.type}</Th><Th>{t.dashboard.date}</Th><Th>{t.dashboard.summary}</Th><Th>{t.dashboard.actions}</Th></Tr></thead>
            <tbody>
              {history.map((item) => {
                const result = item.resultJson as { totalResults?: number };
                return (
                  <Tr key={item.id}>
                    <Td>{item.analysisType}</Td>
                    <Td>{formatDate(item.createdAt)}</Td>
                    <Td>{result.totalResults ?? 0} {t.dashboard.resultRecords}</Td>
                    <Td>
                      <form action={deleteAnalysisAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button size="sm" variant="destructive">{t.dashboard.delete}</Button>
                      </form>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
