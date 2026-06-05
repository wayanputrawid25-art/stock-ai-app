import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const t = await getDictionary();
  const [users, results, analyses, logs] = await Promise.all([
    prisma.user.count(),
    prisma.result.count(),
    prisma.analysisHistory.count(),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.admin.title}</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t.admin.users} value={users} />
        <MetricCard label={t.admin.storedResults} value={results} />
        <MetricCard label={t.admin.analyses} value={analyses} />
        <MetricCard label={t.admin.ocrUsage} value={logs.filter((log) => log.action.startsWith("OCR_SCAN")).length} />
      </div>
      <Card>
        <CardHeader><CardTitle>{t.admin.recentActivity}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <thead><Tr><Th>{t.admin.user}</Th><Th>{t.admin.action}</Th><Th>{t.admin.date}</Th></Tr></thead>
            <tbody>
              {logs.map((log) => (
                <Tr key={log.id}><Td>{log.user?.email ?? "System"}</Td><Td>{log.action}</Td><Td>{formatDate(log.createdAt)}</Td></Tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
