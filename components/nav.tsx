import Link from "next/link";
import { Role } from "@prisma/client";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/lib/locale";

function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light rounded-xl opacity-20 blur-sm"></div>
      <svg viewBox="0 0 32 32" fill="none" className="relative w-full h-full" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <path d="M10 16h12M16 10v12" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4" className="fill-primary stroke-none" />
      </svg>
    </div>
  );
}

export async function MarketingNav() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <LogoIcon />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            4D Analyzer Pro
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/features" className="hidden text-sm font-medium text-muted-foreground hover:text-primary transition-colors sm:inline">
            {t.nav.features}
          </Link>
          <Link href="/pricing" className="hidden text-sm font-medium text-muted-foreground hover:text-primary transition-colors sm:inline">
            {t.nav.pricing}
          </Link>
          <LanguageSwitcher compact locale={locale} label={t.nav.language} />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">{t.nav.login}</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-primary-light">
            <Link href="/contact">{t.nav.telegram}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

export async function AppNav({ role }: { role: Role }) {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const base = role === "ADMIN" ? "/admin" : "/dashboard";
  
  const links = role === "ADMIN"
    ? [
        { label: t.nav.dashboard, href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m6 0h-6", color: "primary" },
        { label: t.nav.users, href: "/admin/users", icon: "M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", color: "secondary" },
        { label: t.nav.analysis, href: "/admin/statistics", icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z", color: "info" },
        { label: t.nav.logs, href: "/admin/logs", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", color: "warning" },
        { label: t.nav.settings, href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "muted" },
      ]
    : [
        { label: t.nav.dashboard, href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m6 0h-6", color: "primary" },
        { label: "Difference Analyzer", href: "/dashboard/analyzer", icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z", color: "info" },
        { label: "Predictions", href: "/dashboard/prediction", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "secondary" },
        { label: t.nav.input, href: "/dashboard/input", icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "success" },
        { label: t.nav.history, href: "/dashboard/history", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", color: "muted" },
      ];

  const colorMap: Record<string, { bg: string; text: string; hover: string; icon: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary", hover: "hover:bg-primary/15", icon: "text-primary" },
    secondary: { bg: "bg-secondary/10", text: "text-secondary-foreground", hover: "hover:bg-secondary/15", icon: "text-secondary" },
    success: { bg: "bg-success/10", text: "text-success", hover: "hover:bg-success/15", icon: "text-success" },
    warning: { bg: "bg-warning/10", text: "text-warning", hover: "hover:bg-warning/15", icon: "text-warning" },
    info: { bg: "bg-info/10", text: "text-info", hover: "hover:bg-info/15", icon: "text-info" },
    muted: { bg: "bg-slate-100", text: "text-slate-600", hover: "hover:bg-slate-200", icon: "text-slate-500" },
  };

  return (
    <aside className="relative flex flex-col h-screen w-64 bg-white border-r border-border/50">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative flex h-20 items-center gap-3 px-5 border-b border-border/50">
        <LogoIcon />
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            4D Pro
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Analyzer
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link, index) => {
          const colors = colorMap[link.color];
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 animate-fade-in
                ${colors.bg} ${colors.text} ${colors.hover}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={`p-1.5 rounded-lg ${link.color === 'primary' ? 'bg-primary text-white' : link.color === 'secondary' ? 'bg-secondary text-secondary-foreground' : link.color === 'success' ? 'bg-success text-white' : link.color === 'warning' ? 'bg-warning text-white' : link.color === 'info' ? 'bg-info text-white' : 'bg-slate-200 text-slate-600'} transition-transform group-hover:scale-110`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={link.icon} />
                </svg>
              </span>
              <span className="flex-1">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative px-3 py-4 space-y-3 border-t border-border/50">
        <div className="px-3">
          <LanguageSwitcher locale={locale} label={t.nav.language} />
        </div>
        
        <form action="/api/logout" method="post">
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
            {t.nav.logout}
          </Button>
        </form>

        <div className="px-3 pt-2">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              {t.nav.privateService}
            </p>
            <p className="text-xs font-semibold text-primary">Premium Access</p>
          </div>
        </div>
      </div>

      <Link href={base} className="sr-only">Home</Link>
    </aside>
  );
}
