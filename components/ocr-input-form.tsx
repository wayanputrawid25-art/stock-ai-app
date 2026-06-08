"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/LoadingState";
import Tesseract from "tesseract.js";

function Icon({ type, className = '' }: { type: 'upload' | 'check' | 'alert' | 'loader' | 'camera'; className?: string }) {
  const paths: Record<string, string> = {
    upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    check: 'M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    camera: 'M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z',
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

// Function to clean OCR text - keep only numbers and spaces
function cleanOCRText(text: string): string {
  // Remove all characters except digits and newlines
  return text.replace(/[^0-9\n]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Function to format OCR results into groups of 5 numbers per line
function formatOCRResult(text: string): string {
  const numbers = text.replace(/\D/g, '').trim();
  if (numbers.length === 0) return '';
  
  // Group into sets of 4 digits with 5 numbers per line
  const groups: string[] = [];
  for (let i = 0; i < numbers.length; i += 4) {
    const num = numbers.slice(i, i + 4);
    if (num.length === 4) groups.push(num);
  }
  
  // Format as 5 numbers per line
  const lines: string[] = [];
  for (let i = 0; i < groups.length; i += 5) {
    const line = groups.slice(i, i + 5).join(' ');
    if (line) lines.push(line);
  }
  
  return lines.join('\n');
}

export function OcrInputForm({ buttonLabel }: OcrInputFormProps) {
  const [drawDate, setDrawDate] = useState("");
  const [ocrResult, setOcrResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    setScanning(true);
    setScanStatus("Scanning OCR...");
    setMessage(null);

    try {
      // Client-side OCR using Tesseract.js
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanStatus(`Scanning OCR... ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Get raw OCR text
      const rawText = result.data.text;
      
      // Clean and format the text
      const cleanedText = cleanOCRText(rawText);
      const formattedResult = formatOCRResult(cleanedText);

      if (!formattedResult) {
        setScanStatus("OCR selesai - No valid numbers found");
        setMessage({ type: 'error', text: 'No valid 4-digit numbers found in the image' });
      } else {
        // Set result to textarea directly
        setOcrResult(formattedResult);
        
        // Update textarea value directly
        if (textareaRef.current) {
          textareaRef.current.value = formattedResult;
        }
        
        setScanStatus("OCR selesai");
        setMessage({ type: 'success', text: 'OCR completed! Review the results below.' });
      }
    } catch (error) {
      setScanStatus("OCR failed");
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

    // Get values from textarea (use state value, fallback to ref)
    const textAreaValue = ocrResult || textareaRef.current?.value || "";
    
    // Parse numbers from textarea - handle both formats (with/without spaces)
    const numbers: string[] = [];
    const lines = textAreaValue.split('\n');
    
    for (const line of lines) {
      // Split by whitespace
      const parts = line.split(/\s+/);
      for (const part of parts) {
        const trimmed = part.trim();
        // Check if it's exactly 4 digits
        if (/^\d{4}$/.test(trimmed)) {
          numbers.push(trimmed);
        }
      }
    }

    if (numbers.length === 0) {
      setMessage({ type: 'error', text: 'No valid 4-digit numbers found. Please enter numbers like: 1234 5678' });
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save results");
      }

      setMessage({ type: 'success', text: `Successfully saved ${numbers.length} numbers!` });
      setOcrResult("");
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (textareaRef.current) textareaRef.current.value = '';
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  };

  // Calculate valid numbers from OCR result
  const numbers = ocrResult.split('\n').flatMap(line => line.split(/\s+/)).filter(num => /^\d{4}$/.test(num.trim()));
  const validNumbersCount = numbers.length;

  return (
    <div className="space-y-6">
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

      {/* OCR Image Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Upload Image for OCR</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer 
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
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Icon type={isDragging ? 'camera' : 'upload'} className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop image here' : 'Click or drag image to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP (Max 10MB)</p>
            </div>
          </div>
        </div>

        {preview && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-auto max-h-48 object-contain bg-gray-50" />
          </div>
        )}

        <Button
          onClick={handleScan}
          disabled={scanning || !preview}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 min-h-[48px]"
        >
          {scanning ? (
            <>
              <Icon type="loader" className="w-4 h-4 animate-spin mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <Icon type="camera" className="w-4 h-4 mr-2" />
              Scan Image
            </>
          )}
        </Button>

        {scanning && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4">
            <LoadingState variant="dots" message={scanStatus} />
          </div>
        )}
      </div>

      {/* OCR Result Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="ocrResult" className="text-sm font-medium text-gray-700">
            OCR Result
          </label>
          {validNumbersCount > 0 && (
            <span className="text-xs text-green-600 font-medium">{validNumbersCount} valid numbers</span>
          )}
        </div>
        <Textarea
          ref={textareaRef}
          id="ocrResult"
          value={ocrResult}
          onChange={(e) => {
            setOcrResult(e.target.value);
          }}
          placeholder={"OCR results will appear here automatically..."}
          rows={6}
          className="font-mono"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={busy || !drawDate || !ocrResult.trim()}
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
