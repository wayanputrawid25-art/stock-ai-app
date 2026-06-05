import { createUserAction, deleteUserAction, updateUserAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/locale";

export default async function UsersPage() {
  const t = await getDictionary();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.admin.userManagement}</h1>
      <Card>
        <CardHeader><CardTitle>{t.admin.createUser}</CardTitle></CardHeader>
        <CardContent>
          <form action={createUserAction} className="grid gap-3 md:grid-cols-4">
            <Input name="name" placeholder={t.admin.name} required />
            <Input name="email" type="email" placeholder={t.admin.email} required />
            <Input name="password" type="password" placeholder="Password" required />
            <Select name="role" defaultValue="USER"><option>USER</option><option>ADMIN</option></Select>
            <Select name="plan" defaultValue="MONTHLY"><option>MONTHLY</option><option>YEARLY</option><option>LIFETIME</option></Select>
            <Input name="expiredAt" type="date" required />
            <Select name="active" defaultValue="true"><option value="true">Active</option><option value="false">Suspended</option></Select>
            <Button>{t.admin.createUser}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t.admin.accounts}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <thead><Tr><Th>{t.admin.name}</Th><Th>{t.admin.email}</Th><Th>{t.admin.role}</Th><Th>{t.admin.plan}</Th><Th>{t.admin.status}</Th><Th>{t.admin.expiry}</Th><Th>{t.dashboard.actions}</Th></Tr></thead>
            <tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td colSpan={7}>
                    <form action={updateUserAction} className="grid gap-2 md:grid-cols-[1fr_1.3fr_0.9fr_0.9fr_0.9fr_1fr_1fr_auto]">
                      <input type="hidden" name="id" value={user.id} />
                      <Input name="name" defaultValue={user.name} />
                      <Input name="email" type="email" defaultValue={user.email} />
                      <Input name="password" type="password" placeholder="New password" />
                      <Select name="role" defaultValue={user.role}><option>USER</option><option>ADMIN</option></Select>
                      <Select name="plan" defaultValue={user.plan}><option>MONTHLY</option><option>YEARLY</option><option>LIFETIME</option></Select>
                      <Select name="active" defaultValue={String(user.active)}><option value="true">Active</option><option value="false">Suspended</option></Select>
                      <Input name="expiredAt" type="date" defaultValue={user.expiredAt.toISOString().slice(0, 10)} />
                      <Button size="sm">{t.admin.save}</Button>
                    </form>
                    <form action={deleteUserAction} className="mt-2">
                      <input type="hidden" name="id" value={user.id} />
                      <Button size="sm" variant="destructive">{t.admin.delete}</Button>
                    </form>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
