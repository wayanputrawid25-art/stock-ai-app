import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, getLocale } from "@/lib/locale";

export default async function SettingsPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.admin.settingsTitle}</h1>
      <Card>
        <CardHeader><CardTitle>{t.admin.languageSettings}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.admin.languageBody}</p>
          <LanguageSwitcher locale={locale} label={t.nav.language} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t.admin.environment}</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>Database: Neon PostgreSQL via `DATABASE_URL`</p>
          <p>Telegram: optional `NEXT_PUBLIC_TELEGRAM_URL`</p>
          <p>Session secrets: `JWT_SECRET`, `NEXTAUTH_SECRET`</p>
          <p>Hosting: Vercel</p>
        </CardContent>
      </Card>
    </div>
  );
}
