import Link from "next/link";
import { Role } from "@prisma/client";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/lib/locale";

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" className="stroke-current" strokeWidth="2" />
      <path d="M8 12h8M12 8v8" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export async function MarketingNav() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <LogoIcon />
          <span>Frequency Analyzer 4D Pro</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/features" className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:inline">{t.nav.features}</Link>
          <Link href="/pricing" className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:inline">{t.nav.pricing}</Link>
          <LanguageSwitcher compact locale={locale} label={t.nav.language} />
          <Button asChild variant="outline" size="sm"><Link href="/login">{t.nav.login}</Link></Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"><Link href="/contact">{t.nav.telegram}</Link></Button>
        </div>
      </nav>
    </header>
  );
}

export async function AppNav({ role }: { role: Role }) {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const base = role === "ADMIN" ? "/admin" : "/dashboard";
  const links =
    role === "ADMIN"
      ? [
          [t.nav.dashboard, "/admin", "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m6 0h-6"],
          [t.nav.users, "/admin/users", "M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"],
          [t.nav.analysis, "/admin/statistics", "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z"],
          [t.nav.logs, "/admin/logs", "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"],
          [t.nav.settings, "/admin/settings", "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"]
        ]
      : [
          [t.nav.dashboard, "/dashboard", "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m6 0h-6"],
          [t.nav.input, "/dashboard/input", "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"],
          [t.nav.history, "/dashboard/history", "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"]
        ];

  return (
    <aside className="border-r bg-card md:min-h-screen flex flex-col">
      <div className="flex h-16 items-center border-b px-4 gap-2">
        <LogoIcon />
        <span className="font-bold text-lg">4D Pro</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(([label, href, iconPath]) => (
          <Link 
            key={href} 
            href={href} 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={iconPath} />
            </svg>
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <LanguageSwitcher locale={locale} label={t.nav.language} />
      </div>
      <form action="/api/logout" method="post" className="p-3 pt-0">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {t.nav.logout}
        </Button>
      </form>
      <div className="px-4 py-3 border-t">
        <p className="text-xs text-muted-foreground text-center">{t.nav.privateService}</p>
      </div>
      <Link href={base} className="sr-only">Home</Link>
    </aside>
  );
}
