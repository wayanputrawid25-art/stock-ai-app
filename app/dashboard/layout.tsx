"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  color: string;
}

const userNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m6 0h-6", color: "primary" },
  { label: "Analyzer", href: "/dashboard/analyzer", icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z", color: "info" },
  { label: "Prediksi", href: "/dashboard/prediction", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "secondary" },
  { label: "Input", href: "/dashboard/input", icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "success" },
  { label: "Riwayat", href: "/dashboard/history", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", color: "muted" },
];

const colorMap: Record<string, { active: string; inactive: string; icon: string }> = {
  primary: { active: "bg-primary text-white", inactive: "text-slate-500", icon: "text-primary" },
  secondary: { active: "bg-secondary text-white", inactive: "text-slate-500", icon: "text-secondary" },
  success: { active: "bg-success text-white", inactive: "text-slate-500", icon: "text-success" },
  info: { active: "bg-info text-white", inactive: "text-slate-500", icon: "text-info" },
  muted: { active: "bg-slate-700 text-white", inactive: "text-slate-500", icon: "text-slate-500" },
};

function MobileNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {userNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "?");
          const colors = colorMap[item.color];
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200 ${
                isActive ? colors.active : "text-slate-500"
              }`}
            >
              <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="hidden md:flex relative flex-col h-screen w-64 bg-white border-r border-border/50">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      
      <div className="relative flex h-20 items-center gap-3 px-5 border-b border-border/50">
        <div className="w-10 h-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light rounded-xl opacity-20 blur-sm"></div>
          <svg viewBox="0 0 32 32" fill="none" className="relative w-full h-full">
            <rect x="2" y="2" width="28" height="28" rx="8" className="fill-primary/10 stroke-primary" strokeWidth="2" />
            <path d="M10 16h12M16 10v12" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="16" r="4" className="fill-primary stroke-none" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            4D Pro
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Analyzer
          </span>
        </div>
      </div>

      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {userNavItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "?");
          const colors = colorMap[item.color];
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-in ${
                isActive 
                  ? `${colors.active} shadow-md` 
                  : `hover:bg-slate-100 ${colors.inactive}`
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${
                isActive ? "bg-white/20" : "bg-slate-100"
              }`}>
                <svg className={`w-5 h-5 ${isActive ? "text-white" : colors.icon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action="/api/logout" method="post" className="p-3 border-t border-border/50">
        <Button 
          type="submit" 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
        >
          <span className="p-1.5 rounded-lg bg-slate-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </span>
          Logout
        </Button>
      </form>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DesktopSidebar />
      <main className="flex-1 overflow-auto pb-24 md:pb-8">
        <div className="h-full p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
