import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

const plans = ["MONTHLY", "YEARLY", "LIFETIME"];

export default async function PricingPage() {
  const t = await getDictionary();
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-normal">{t.marketing.pricingTitle}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t.marketing.pricingBody}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan}>
            <CardHeader><CardTitle>{plan}</CardTitle></CardHeader>
            <CardContent>
              <Button asChild className="w-full"><Link href="/contact">{t.marketing.contactAdmin}</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
