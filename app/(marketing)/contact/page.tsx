import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

export default async function ContactPage() {
  const t = await getDictionary();
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/putrawid";
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{t.marketing.contactTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{t.marketing.contactBody}</p>
          <Button asChild><Link href={telegram}>{t.marketing.openTelegram}</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}
