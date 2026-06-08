"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/LoadingState";

function Icon({ type, className = '' }: { type: 'upload' | 'check' | 'alert' | 'loader' | 'camera' | 'scan'; className?: string }) {
  const paths: Record<string, string> = {
    upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    check: 'M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    camera: 'M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z',
    scan: 'M3 7V5a2 2 0 0 1 2-2h2m0 0V3m0 2a2 2 0 0 1 2-2h2m-2 0v2m0-2H9m2 2h2m-2 0v2m0-2v2m0 2v2m0 2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2m0 0h2m2 0v2m0-2a2 2 0 0 0-2-2H9m2 0v2m0-2v2m0 2a2 2 0 0 0 2-2V7m0 2a2 2 0 0 0-2 2v4m0 0h2m-2 0H9m2 0v2m0-2v2m0 2a2 2 0 0 0 2 2m-2-2v2m0-2v2m0 2a2 2 0 0 0-2 2m2-2v2m0-2v2m0 2a2 2 0 0 0 2 2m-2-2v2m0-2v2',
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
      <path d={paths[type] || paths.upload} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface OcrInputFormProps {
  buttonLabel: string;
}

export function OcrInputForm({ buttonLabel }: OcrInputFormProps) {
  const [mode, setMode] = useState<'ocr' | 'manual'>('ocr');
  const [drawDate, setDrawDate] = useState("");
  const [ocrResults, setOcrResults] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync OCR results to manual input when OCR completes
  useEffect(() => {
    if (ocrResults.length > 0) {
      setManualInput(ocrResults.join('\n'));
      setMode('manual');
    }
  }, [ocrResults]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  }, []);

  const handleScan = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: 'error', text: 'Please select an image first' });
      return;
    }

    if (!drawDate) {
      setMessage({ type: 'error', text: 'Please select a draw date first' });
      return;
    }

    setScanning(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("drawDate", drawDate);

      const response = await fetch("/api/ocr", { method: "POST", body: formData });
      const json = await response.json();

      if (!response.ok) throw new Error(json.error || "OCR failed");

      const numbers = json.numbers || [];
      if (numbers.length > 0) {
        setOcrResults(numbers);
        setMessage({ type: 'success', text: `Found ${numbers.length} numbers! Switch to Manual to review and save.` });
      } else {
        setMessage({ type: 'error', text: 'No 4-digit numbers found in the image' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : "OCR scan failed" });
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!drawDate) {
      setMessage({ type: 'error', text: 'Please select a draw date' });
      return;
    }

    const numbers = manualInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length === 4 && /^\d{4}$/.test(line));

    if (numbers.length === 0) {
      setMessage({ type: 'error', text: 'Please enter valid 4-digit numbers (one per line)' });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawDate, raw: numbers.join('\n') }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Failed to save results");
      }

      setMessage({ type: 'success', text: `Successfully saved ${numbers.length} numbers!` });
      setManualInput("");
      setOcrResults([]);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode('ocr')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'ocr' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon type="camera" className="w-4 h-4" />
            OCR Scan
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'manual' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon type="upload" className="w-4 h-4" />
            Manual Input
          </span>
        </button>
      </div>

      {/* Draw Date */}
      <div className="space-y-2">
        <label htmlFor="drawDate" className="text-sm font-medium text-gray-700">Draw Date</label>
        <Input
          type="date"
          id="drawDate"
          value={drawDate}
          onChange={(e) => setDrawDate(e.target.value)}
          required
          className="w-full md:w-64"
        />
      </div>

      {/* OCR Mode */}
      {mode === 'ocr' && (
        <div className="space-y-4">
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
              ${scanning ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Icon type={isDragging ? 'camera' : 'upload'} className={`w-7 h-7 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop image here' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WebP (Max 10MB)</p>
              </div>
            </div>
          </div>

          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={preview} alt="Preview" className="w-full h-auto max-h-64 object-contain bg-gray-50" />
            </div>
          )}

          <Button
            onClick={handleScan}
            disabled={scanning || !drawDate}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 min-h-[48px]"
          >
            {scanning ? (
              <>
                <Icon type="loader" className="w-4 h-4 animate-spin mr-2" />
                Scanning...
              </>
            ) : (
              <>
                <Icon type="scan" className="w-4 h-4 mr-2" />
                Scan Image
              </>
            )}
          </Button>

          {scanning && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-5 space-y-4">
              <LoadingState variant="dots" message="OCR is reading bold black digits..." />
            </div>
          )}
        </div>
      )}

      {/* Manual Input Mode */}
      {mode === 'manual' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="manualInput" className="text-sm font-medium text-gray-700">
              4D Numbers (one per line)
            </label>
            <Textarea
              id="manualInput"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={"1234\n5678\n9012\n1111\n2222"}
              rows={8}
              className="font-mono"
            />
            {manualInput && (
              <p className="text-xs text-gray-500">
                {manualInput.split('\n').filter(line => line.trim().length === 4 && /^\d{4}$/.test(line.trim())).length} valid numbers
              </p>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={busy || !drawDate || !manualInput.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-green-500/25 min-h-[48px]"
          >
            {busy ? (
              <>
                <Icon type="loader" className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Icon type="check" className="w-4 h-4 mr-2" />
                {buttonLabel}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
          message.type === 'success' 
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Icon 
              type={message.type === 'success' ? 'check' : 'alert'} 
              className={`w-5 h-5 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} 
            />
          </div>
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
        </div>
      )}
    </div>
  );
}