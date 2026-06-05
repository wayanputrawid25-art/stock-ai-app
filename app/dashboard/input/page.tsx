import { ResultInputForm } from "@/components/result-input-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

export default async function InputPage() {
  const t = await getDictionary();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.dashboard.inputTitle}</h1>
      <Card>
        <CardHeader><CardTitle>{t.dashboard.pasteTitle}</CardTitle></CardHeader>
        <CardContent>
          <ResultInputForm buttonLabel={t.dashboard.validateSave} />
        </CardContent>
      </Card>
    </div>
  );
}
