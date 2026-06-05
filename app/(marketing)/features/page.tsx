import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

const features = [
  "Paste and clean 4-digit results",
  "OCR scan JPG, PNG, WEBP, and JPEG images",
  "AS, KOP, KEPALA, and EKOR frequency ranking",
  "Hot, cold, gap, trend, odd-even, and big-small analysis",
  "Prediction scoring with weighted confidence",
  "CSV, Excel, and report history exports"
];

export default async function FeaturesPage() {
  const t = await getDictionary();
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-normal">{t.marketing.featuresTitle}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature}>
            <CardHeader><CardTitle>{feature}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t.marketing.featuresBody}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
