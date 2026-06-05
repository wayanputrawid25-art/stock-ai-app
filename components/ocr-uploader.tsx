"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OcrUploader() {
  const [message, setMessage] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function upload(formData: FormData) {
    setBusy(true);
    setMessage("");
    setNumbers([]);
    try {
      const response = await fetch("/api/ocr", { method: "POST", body: formData });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "OCR failed");
      setNumbers(json.numbers);
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
      <Button className="w-fit" disabled={busy}>{busy ? "Scanning..." : "Run OCR Scan"}</Button>
      {message ? <p className="rounded-md bg-accent p-3 text-sm">{message}</p> : null}
      {numbers.length ? <pre className="overflow-auto rounded-md bg-muted p-3 text-sm">{JSON.stringify(numbers, null, 2)}</pre> : null}
    </form>
  );
}
