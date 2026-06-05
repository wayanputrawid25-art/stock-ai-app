import Link from "next/link";
import { Role } from "@prisma/client";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/lib/locale";

export async function MarketingNav() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold">Frequency Analyzer 4D Pro</Link>
        <div className="flex items-center gap-2">
          <Link href="/features" className="hidden text-sm text-muted-foreground sm:inline">{t.nav.features}</Link>
          <Link href="/pricing" className="hidden text-sm text-muted-foreground sm:inline">{t.nav.pricing}</Link>
          <LanguageSwitcher compact locale={locale} label={t.nav.language} />
          <Button asChild variant="outline" size="sm"><Link href="/login">{t.nav.login}</Link></Button>
          <Button asChild size="sm"><Link href="/contact">{t.nav.telegram}</Link></Button>
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
          [t.nav.dashboard, "/admin"],
          [t.nav.users, "/admin/users"],
          [t.nav.analysis, "/admin/statistics"],
          [t.nav.ocr, "/admin/ocr"],
          [t.nav.logs, "/admin/logs"],
          [t.nav.settings, "/admin/settings"]
        ]
      : [
          [t.nav.dashboard, "/dashboard"],
          [t.nav.input, "/dashboard/input"],
          [t.nav.ocr, "/dashboard/ocr"],
          [t.nav.history, "/dashboard/history"]
        ];

  return (
    <aside className="border-r bg-card md:min-h-screen">
      <div className="flex h-16 items-center border-b px-4 font-semibold">4D Pro</div>
      <nav className="grid gap-1 p-3">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            {label}
          </Link>
        ))}
        <form action="/api/logout" method="post" className="pt-2">
          <Button className="w-full justify-start" variant="ghost" size="sm">{t.nav.logout}</Button>
        </form>
      </nav>
      <div className="px-3 py-3">
        <LanguageSwitcher locale={locale} label={t.nav.language} />
      </div>
      <div className="px-4 py-3 text-xs text-muted-foreground">{t.nav.privateService}</div>
      <Link href={base} className="sr-only">Home</Link>
    </aside>
  );
}
