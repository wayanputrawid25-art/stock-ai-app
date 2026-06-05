import { OcrUploader } from "@/components/ocr-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

export default async function OcrPage() {
  const t = await getDictionary();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.dashboard.ocrTitle}</h1>
      <Card>
        <CardHeader><CardTitle>{t.dashboard.uploadTitle}</CardTitle></CardHeader>
        <CardContent>
          <OcrUploader />
        </CardContent>
      </Card>
    </div>
  );
}
