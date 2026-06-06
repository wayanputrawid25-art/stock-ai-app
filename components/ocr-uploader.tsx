"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/LoadingState";

export function OcrUploader() {
  const [message, setMessage] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [rawText, setRawText] = useState("");

  async function upload(formData: FormData) {
    setBusy(true);
    setMessage("");
    setNumbers([]);
    setRawText("");
    try {
      const response = await fetch("/api/ocr", { method: "POST", body: formData });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "OCR failed");
      setNumbers(json.numbers);
      setRawText(json.text ?? "");
      setMessage(`Extracted and saved ${json.numbers.length} valid 4-digit results`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OCR failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={upload} className="grid gap-4">
      <Input name="drawDate" type="date" required />
      <Input name="file" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" required />
      <Button className="w-fit" disabled={busy}>{busy ? "Scanning bold black digits..." : "Run OCR Scan"}</Button>
      {busy ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <LoadingState variant="dots" message="OCR sedang membaca angka bold hitam..." />
          <div className="h-1.5 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 animate-[loading-bar_1.3s_ease-in-out_infinite] rounded-full bg-blue-600" />
          </div>
        </div>
      ) : null}
      {message ? <p className="rounded-md bg-accent p-3 text-sm">{message}</p> : null}
      {numbers.length ? <pre className="overflow-auto rounded-md bg-muted p-3 text-sm">{JSON.stringify(numbers, null, 2)}</pre> : null}
      {rawText ? (
        <details className="rounded-md border border-border p-3 text-sm">
          <summary className="cursor-pointer font-medium">Normalized OCR text</summary>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap font-mono text-xs">{rawText}</pre>
        </details>
      ) : null}
    </form>
  );
}
