import { ResultInputForm } from "@/components/result-input-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDictionary } from "@/lib/locale";

export default async function InputPage() {
  const t = await getDictionary();
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t.dashboard.inputTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">Manually enter 4D lottery results</p>
      </div>

      {/* Instructions Card */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            How to use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Enter the draw date for the lottery results
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Type each 4D number on a separate line (e.g., 1234, 5678)
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Numbers will be validated to ensure they are 4 digits
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Input Form Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t.dashboard.pasteTitle}</CardTitle>
          <CardDescription>Enter one 4D number per line</CardDescription>
        </CardHeader>
        <CardContent>
          <ResultInputForm buttonLabel={t.dashboard.validateSave} />
        </CardContent>
      </Card>
    </div>
  );
}
