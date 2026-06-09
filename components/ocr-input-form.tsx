"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/LoadingState";
import Tesseract from "tesseract.js";

function Icon({ type, className = '' }: { type: 'upload' | 'check' | 'alert' | 'loader' | 'camera' | 'plus' | 'chevron'; className?: string }) {
  const paths: Record<string, string> = {
    upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    check: 'M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    camera: 'M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z',
    plus: 'M12 4.5v15m7.5-7.5h-15',
    chevron: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
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

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number; analyses: number };
}

interface OcrInputFormProps {
  buttonLabel: string;
}

// Improved OCR digit corrections
const OCR_CORRECTIONS: Record<string, string> = {
  'O': '0', 'o': '0',
  'I': '1', 'l': '1', '|': '1',
  'Z': '2', 'z': '2',
  'S': '5', 's': '5',
  'B': '8',
};

// Function to clean OCR text with digit correction
function cleanOCRText(text: string): string {
  // First apply digit corrections
  let corrected = text;
  for (const [wrong, correct] of Object.entries(OCR_CORRECTIONS)) {
    corrected = corrected.split(wrong).join(correct);
  }
  // Then remove all non-digit and non-newline characters
  return corrected.replace(/[^0-9\n]/g, ' ').replace(/\s+/g, ' ').trim();
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSnapshotId = searchParams.get("snapshot");
  
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [newSnapshotTitle, setNewSnapshotTitle] = useState("");
  const [showNewSnapshot, setShowNewSnapshot] = useState(false);
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

  // Load snapshots on mount and sync with URL parameter
  useEffect(() => {
    loadSnapshots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync snapshot selection with URL parameter
  useEffect(() => {
    if (urlSnapshotId && snapshots.length > 0) {
      const snapshotFromUrl = snapshots.find(s => s.id === urlSnapshotId);
      if (snapshotFromUrl && snapshotFromUrl.id !== selectedSnapshot?.id) {
        setSelectedSnapshot(snapshotFromUrl);
      }
    }
  }, [urlSnapshotId, snapshots]);

  const loadSnapshots = async () => {
    try {
      const response = await fetch("/api/snapshots");
      const data = await response.json();
      if (data.snapshots) {
        setSnapshots(data.snapshots);
        // Auto-select first snapshot if none selected
        if (!selectedSnapshot && data.snapshots.length > 0) {
          setSelectedSnapshot(data.snapshots[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load snapshots:", error);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!newSnapshotTitle.trim()) {
      setMessage({ type: 'error', text: 'Please enter a snapshot title' });
      return;
    }

    try {
      const response = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSnapshotTitle.trim() }),
      });
      
      const data = await response.json();
      
      if (data.snapshot) {
        setSnapshots(prev => [data.snapshot, ...prev]);
        setSelectedSnapshot(data.snapshot);
        setNewSnapshotTitle("");
        setShowNewSnapshot(false);
        setMessage({ type: 'success', text: data.message || 'Snapshot created!' });
        
        // Update URL with new snapshot
        router.push(`/dashboard/input?snapshot=${data.snapshot.id}`);
      } else if (data.error) {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create snapshot' });
    }
  };

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
    if (!selectedSnapshot) {
      setMessage({ type: 'error', text: 'Please select a snapshot first' });
      return;
    }

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
        body: JSON.stringify({ 
          snapshotId: selectedSnapshot.id,
          drawDate, 
          raw: numbers.join('\n') 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save results");
      }

      setMessage({ type: 'success', text: `Successfully saved ${numbers.length} numbers to "${selectedSnapshot.title}"!` });
      
      // Dispatch event to refresh dashboard
      window.dispatchEvent(new CustomEvent("dataSaved", { 
        detail: { snapshotId: selectedSnapshot.id } 
      }));
      
      // Reload snapshots to update counts
      loadSnapshots();
      
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
      {/* Snapshot Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Snapshot</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={selectedSnapshot?.id || ""}
              onChange={(e) => {
                const snapshot = snapshots.find(s => s.id === e.target.value);
                setSelectedSnapshot(snapshot || null);
                // Update URL when snapshot changes
                if (snapshot) {
                  window.history.pushState({}, "", `/dashboard/input?snapshot=${snapshot.id}`);
                }
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm appearance-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">-- Select Snapshot --</option>
              {snapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {snapshot.title} ({snapshot._count?.results || 0} results)
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Icon type="chevron" className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNewSnapshot(!showNewSnapshot)}
            className="px-3"
          >
            <Icon type="plus" className="w-4 h-4" />
          </Button>
        </div>

        {/* New Snapshot Input */}
        {showNewSnapshot && (
          <div className="flex gap-2 mt-2 p-3 bg-gray-50 rounded-lg border">
            <Input
              value={newSnapshotTitle}
              onChange={(e) => setNewSnapshotTitle(e.target.value)}
              placeholder="Enter snapshot title (e.g., GAGA, HK MALAM)"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSnapshot();
              }}
            />
            <Button onClick={handleCreateSnapshot} size="sm">
              Create
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setShowNewSnapshot(false);
              setNewSnapshotTitle("");
            }}>
              Cancel
            </Button>
          </div>
        )}
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
