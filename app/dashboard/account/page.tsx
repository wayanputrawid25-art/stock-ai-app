import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AccountForm } from "@/components/account-form";

export default async function AccountPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const memberSince = format(new Date(user.createdAt), "MMMM yyyy");
  const planLabels: Record<string, string> = {
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
    LIFETIME: "Lifetime",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Account</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details and security</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit overflow-hidden">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-1">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium bg-white shadow-md text-purple-600 border border-purple-200">
                <span className="p-2 rounded-lg bg-purple-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
                  </svg>
                </span>
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/50 transition-colors">
                <span className="p-2 rounded-lg bg-white/50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                  </svg>
                </span>
                Security
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/50 transition-colors">
                <span className="p-2 rounded-lg bg-white/50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                  </svg>
                </span>
                Subscription
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/50 transition-colors">
                <span className="p-2 rounded-lg bg-white/50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </span>
                Activity
              </button>
            </nav>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription className="text-base">{user.email}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-md">{planLabels[user.plan] || user.plan}</Badge>
                    <Badge variant="success" size="sm" className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Role", value: user.role, icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                  { label: "Plan", value: planLabels[user.plan] || user.plan, icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
                  { label: "Member Since", value: memberSince, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                  { label: "Status", value: user.active ? "Active" : "Inactive", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={item.icon} />
                      </svg>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Edit Form */}
          <AccountForm userId={user.id} userName={user.name} userEmail={user.email} />

          <Card className="overflow-hidden border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl text-red-700">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-red-200 bg-red-50/50">
                <div>
                  <p className="font-medium text-red-700">Delete Account</p>
                  <p className="text-sm text-red-600/80">Permanently delete your account and all data</p>
                </div>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 rounded-xl">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
