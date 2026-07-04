import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";
import { SettingsTabs } from "@/components/settings-tabs";

export default async function SettingsPage() {
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
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Account Settings
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and settings</p>
      </div>

      <SettingsTabs 
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
        userActive={user.active}
        memberSince={memberSince}
        planLabel={planLabels[user.plan] || user.plan}
      />
    </div>
  );
}
