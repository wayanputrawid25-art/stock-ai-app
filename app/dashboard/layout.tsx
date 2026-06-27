"use client";

import { useState, useEffect } from "react";
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
  { label: "Probabilitas", href: "/dashboard/input", icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "success" },
  { label: "Telegram", href: "/dashboard/telegram", icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z", color: "info" },
  { label: "Riwayat", href: "/dashboard/history", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", color: "muted" },
  { label: "Akun", href: "/dashboard/account", icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z", color: "accent" },
  { label: "Setting", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "warning" },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m6 0h-6", color: "primary" },
  { label: "Users", href: "/admin/users", icon: "M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", color: "secondary" },
  { label: "Analysis", href: "/admin/statistics", icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z", color: "info" },
  { label: "Akun", href: "/dashboard/account", icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z", color: "accent" },
  { label: "Setting", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "warning" },
];

const colorMap: Record<string, { bg: string; text: string; hover: string; active: string; iconBg: string }> = {
  primary: { bg: "bg-primary/8", text: "text-primary", hover: "hover:bg-primary/12", active: "bg-primary/12 border-primary/30", iconBg: "bg-primary" },
  secondary: { bg: "bg-secondary/8", text: "text-secondary-foreground", hover: "hover:bg-secondary/12", active: "bg-secondary/12 border-secondary/30", iconBg: "bg-secondary" },
  success: { bg: "bg-success/8", text: "text-success", hover: "hover:bg-success/12", active: "bg-success/12 border-success/30", iconBg: "bg-success" },
  warning: { bg: "bg-warning/8", text: "text-warning", hover: "hover:bg-warning/12", active: "bg-warning/12 border-warning/30", iconBg: "bg-warning" },
  info: { bg: "bg-info/8", text: "text-info", hover: "hover:bg-info/12", active: "bg-info/12 border-info/30", iconBg: "bg-info" },
  accent: { bg: "bg-accent/50", text: "text-accent-foreground", hover: "hover:bg-accent", active: "bg-accent border-accent-foreground/30", iconBg: "bg-accent-foreground" },
  muted: { bg: "bg-muted/50", text: "text-muted-foreground", hover: "hover:bg-muted", active: "bg-muted border-muted-foreground/30", iconBg: "bg-muted-foreground" },
};

function LogoIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light rounded-xl opacity-20 blur-md"></div>
      <svg viewBox="0 0 36 36" fill="none" className="relative w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-light))" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="30" height="30" rx="9" fill="url(#logoGrad)" fillOpacity="0.15" />
        <rect x="3" y="3" width="30" height="30" rx="9" stroke="url(#logoGrad)" strokeWidth="2" />
        <path d="M12 18h12M18 12v12" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="18" cy="18" r="4" fill="url(#logoGrad)" />
      </svg>
    </div>
  );
}

function Sidebar({ navItems, isOpen, onClose, isMobile = false }: { navItems: NavItem[]; isOpen: boolean; onClose: () => void; isMobile?: boolean }) {
  const pathname = usePathname();
  
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar - Fixed width 280px */}
      <aside className={`
        hidden lg:flex w-[280px] flex-shrink-0
        relative flex-col h-screen bg-gradient-to-b from-white via-white to-slate-50/50 border-r border-border/40
      `}>
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/4 via-primary/2 to-transparent pointer-events-none rounded-br-3xl"></div>
        
        {/* Header */}
        <div className="relative flex h-20 items-center justify-between px-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                4D Pro
              </span>
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-medium">
                Analyzer
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 pb-2 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "?");
            const colors = colorMap[item.color];
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 animate-fade-in border border-transparent
                  ${isActive ? colors.active : `${colors.bg} ${colors.text} ${colors.hover}`}
                `}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className={`p-2 rounded-lg ${colors.iconBg} text-white shadow-sm transition-transform group-hover:scale-105`}>
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </span>
                <span className="flex-1">{item.label}</span>
                <svg className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative px-4 py-5 space-y-3 border-t border-border/30">
          <div className="px-3 py-1">
            <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-primary/5 to-secondary/5 p-4 text-center border border-primary/10">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 font-medium">
                Premium Access
              </p>
              <p className="text-xs font-semibold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                4D Pro Member
              </p>
            </div>
          </div>
          
          <form action="/api/logout" method="post">
            <Button 
              type="submit" 
              variant="ghost" 
              className="w-full justify-start gap-3.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
            >
              <span className="p-2 rounded-lg bg-muted">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </span>
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Sidebar - Slide out drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] lg:hidden
        flex flex-col h-full bg-gradient-to-b from-white via-white to-slate-50/50 border-r border-border/40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/4 via-primary/2 to-transparent pointer-events-none rounded-br-3xl"></div>
        
        {/* Header */}
        <div className="relative flex h-16 items-center justify-between px-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <div className="flex flex-col">
              <span className="text-base font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                4D Pro
              </span>
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-medium">
                Analyzer
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <p className="px-4 pb-2 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "?");
            const colors = colorMap[item.color];
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 animate-fade-in border border-transparent
                  ${isActive ? colors.active : `${colors.bg} ${colors.text} ${colors.hover}`}
                `}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className={`p-2 rounded-lg ${colors.iconBg} text-white shadow-sm transition-transform group-hover:scale-105`}>
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </span>
                <span className="flex-1">{item.label}</span>
                <svg className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative px-4 py-5 space-y-3 border-t border-border/30">
          <div className="px-3 py-1">
            <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-primary/5 to-secondary/5 p-4 text-center border border-primary/10">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 font-medium">
                Premium Access
              </p>
              <p className="text-xs font-semibold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                4D Pro Member
              </p>
            </div>
          </div>
          
          <form action="/api/logout" method="post">
            <Button 
              type="submit" 
              variant="ghost" 
              className="w-full justify-start gap-3.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
            >
              <span className="p-2 rounded-lg bg-muted">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </span>
              Logout
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}

function MobileHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-b border-border/40">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="text-base font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              4D Pro
            </span>
          </div>
        </div>
        
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    setIsAdmin(pathname.startsWith('/admin'));
  }, [pathname]);
  
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar navItems={navItems} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <MobileHeader onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <main className="flex-1 overflow-auto pt-14 pb-6 lg:pt-0 lg:pb-0">
        <div className="h-full p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
