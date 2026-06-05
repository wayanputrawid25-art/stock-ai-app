import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

export default async function HomePage() {
  const t = await getDictionary();
  return (
    <main>
      <section className="bg-[linear-gradient(135deg,#f8fafc_0%,#d7f0ec_45%,#fff1c7_100%)]">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-8 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">{t.marketing.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">Frequency Analyzer 4D Pro</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {t.marketing.hero}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/contact">{t.marketing.contactAdmin}</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/login">{t.marketing.login}</Link></Button>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border bg-white/75 p-4 shadow-sm">
            {["AS", "KOP", "KEPALA", "EKOR"].map((position, index) => (
              <div key={position} className="grid grid-cols-[90px_1fr_70px] items-center gap-3 rounded-md border bg-background p-3">
                <span className="font-medium">{position}</span>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${88 - index * 12}%` }} />
                </div>
                <span className="text-right text-sm text-muted-foreground">{91 - index * 9}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {t.marketing.featureCards.map((title) => (
          <Card key={title}>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t.marketing.featureCardBody}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
