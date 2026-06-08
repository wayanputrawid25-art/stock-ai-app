import { OcrUploader } from "@/components/ocr-uploader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

export default async function OcrPage() {
  const t = await getDictionary();
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t.dashboard.ocrTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">Scan and extract 4D numbers from lottery result images</p>
      </div>

      {/* Instructions Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tips for best results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Use clear, high-contrast images with bold black 4D numbers
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ensure the image shows only the 4D result numbers clearly
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Supported formats: JPEG, PNG, WebP (Max 10MB)
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Main OCR Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t.dashboard.uploadTitle}</CardTitle>
          <CardDescription>Upload an image of lottery results to automatically extract 4D numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <OcrUploader />
        </CardContent>
      </Card>
    </div>
  );
}
