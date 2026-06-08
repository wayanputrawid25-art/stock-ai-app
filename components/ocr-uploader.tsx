"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";

function Icon({ type, className = '' }: { type: 'upload' | 'check' | 'alert' | 'loader'; className?: string }) {
  const paths: Record<string, string> = {
    upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    check: 'M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  };

  if (type === 'loader') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OcrUploader() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [numbers, setNumbers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [drawDate, setDrawDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage("Please select an image file");
      setMessageType('error');
      return;
    }
    
    if (!drawDate) {
      setMessage("Please select a draw date");
      setMessageType('error');
      return;
    }

    setBusy(true);
    setMessage("");
    setMessageType('');
    setNumbers([]);
    setRawText("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("drawDate", drawDate);

      const response = await fetch("/api/ocr", { method: "POST", body: formData });
      const json = await response.json();
      
      if (!response.ok) throw new Error(json.error || "OCR failed");
      
      setNumbers(json.numbers || []);
      setRawText(json.text || "");
      setMessage(`Extracted and saved ${json.numbers?.length || 0} valid 4-digit results`);
      setMessageType('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OCR failed");
      setMessageType('error');
    } finally {
      setBusy(false);
    }
  }, [selectedFile, drawDate]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <label htmlFor="drawDate" className="text-sm font-medium text-gray-700">Draw Date</label>
          <input 
            type="date" 
            id="drawDate" 
            name="drawDate"
            value={drawDate}
            onChange={(e) => setDrawDate(e.target.value)}
            required 
            className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Image File</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer 
              transition-all duration-300 ease-in-out
              ${isDragging 
                ? 'border-blue-500 bg-blue-50/50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }
              ${busy ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              required
              disabled={busy}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Icon type="upload" className={`w-7 h-7 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop image here' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WebP (Max 10MB)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <img src={preview} alt="Preview" className="w-full h-auto max-h-64 object-contain bg-gray-50" />
        </div>
      )}

      <Button type="submit" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 min-h-[48px]" disabled={busy}>
        {busy ? (
          <>
            <Icon type="loader" className="w-4 h-4 animate-spin mr-2" />
            Scanning...
          </>
        ) : (
          'Run OCR Scan'
        )}
      </Button>

      {busy && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-5 space-y-4">
          <LoadingState variant="dots" message="OCR is reading bold black digits..." />
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 animate-[loading-bar_1.3s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
          messageType === 'success' 
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            messageType === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Icon 
              type={messageType === 'success' ? 'check' : 'alert'} 
              className={`w-5 h-5 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`} 
            />
          </div>
          <p className={`text-sm font-medium ${messageType === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
        </div>
      )}

      {numbers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Extracted Numbers ({numbers.length})</h4>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm font-mono">
              {JSON.stringify(numbers, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {rawText && (
        <details className="rounded-xl border border-gray-200 p-4 text-sm">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">View Normalized OCR Text</summary>
          <pre className="mt-4 overflow-auto whitespace-pre-wrap font-mono text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">{rawText}</pre>
        </details>
      )}
    </form>
  );
}
