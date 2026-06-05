import { AppNav } from "@/components/nav";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="grid md:grid-cols-[220px_1fr]">
      <AppNav role={user.role} />
      <main className="min-w-0 p-4 md:p-6">{children}</main>
    </div>
  );
}
