import { AppNav } from "@/components/nav";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppNav role={user.role} />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
