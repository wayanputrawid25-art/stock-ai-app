import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";
import { formatDate } from "@/lib/utils";

export default async function LogsPage() {
  const t = await getDictionary();
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: true } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.admin.activityLogs}</h1>
      <Card>
        <CardHeader><CardTitle>{t.admin.latestEvents}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <thead><Tr><Th>{t.admin.user}</Th><Th>{t.admin.action}</Th><Th>{t.admin.date}</Th></Tr></thead>
            <tbody>{logs.map((log) => <Tr key={log.id}><Td>{log.user?.email ?? "System"}</Td><Td>{log.action}</Td><Td>{formatDate(log.createdAt)}</Td></Tr>)}</tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
