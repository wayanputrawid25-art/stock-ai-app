'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { LoadingState } from '@/components/LoadingState';
import { performOCR, extractNumbers, OCRProgress, OCRResult } from '@/lib/ocr-improved';

interface OCRScannerProps {
  onResult?: (result: OCRResult) => void;
  onNumbers?: (numbers: string[]) => void;
}

function Icon({
  type,
  className = '',
}: {
  type: 'upload' | 'alert' | 'check' | 'loader' | 'camera' | 'sparkles';
  className?: string;
}) {
  const paths: Record<string, string> = {
    upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    check: 'M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    camera: 'M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z',
    sparkles: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z',
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

export function OCRScanner({ onResult, onNumbers }: OCRScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [result, setResult] = useState<OCRResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    setResult(null);
    setProgress({ status: '', progress: 0 });
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleScan = async () => {
    if (!file) return;

    setLoading(true);
    setProgress({ status: 'Preparing image...', progress: 10 });

    try {
      const ocrResult = await performOCR(file, (p) => setProgress(p));
      setResult(ocrResult);

      if (ocrResult.isSuccess) {
        const numbers = extractNumbers(ocrResult.text);
        onNumbers?.(numbers);
        onResult?.(ocrResult);
      }
    } catch (error) {
      console.error('OCR scan failed:', error);
      setResult({
        text: '',
        confidence: 0,
        isSuccess: false,
        error: 'An error occurred during scanning',
        processingTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

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

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type.startsWith('image/')) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreview('');
    setResult(null);
    setProgress({ status: '', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer 
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center
            ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
            transition-colors duration-300
          `}>
            <Icon type={isDragging ? 'camera' : 'upload'} className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-gray-700">
              {isDragging ? 'Drop image here' : 'Drag & drop or click to select'}
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, JPEG, or WebP (Max 10MB)</p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 border">
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white">
                {file?.name || 'Preview'}
              </span>
            </div>
            <Image
              src={preview}
              alt="Selected image preview"
              width={960}
              height={640}
              unoptimized
              className="h-auto max-h-96 w-full object-contain"
            />
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none min-h-[52px]"
          >
            {loading ? (
              <>
                <Icon type="loader" className="w-5 h-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Icon type="sparkles" className="w-5 h-5" />
                <span>Scan with OCR</span>
              </>
            )}
          </button>

          {/* Loading State */}
          {loading && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-5 space-y-4">
              <LoadingState variant="dots" message="OCR is reading bold black digits..." />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 font-medium">{progress.status || 'Initializing...'}</span>
                  <span className="text-blue-600">{Math.round(progress.progress)}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={handleClear}
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 min-h-[48px]"
          >
            Clear Image
          </button>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div
          className={`
            p-5 rounded-xl border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2
            ${result.isSuccess
              ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
              : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
            }
          `}
        >
          <div className="flex gap-4 items-start">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
              ${result.isSuccess ? 'bg-green-100' : 'bg-red-100'}
            `}>
              <Icon 
                type={result.isSuccess ? 'check' : 'alert'} 
                className={`w-6 h-6 ${result.isSuccess ? 'text-green-600' : 'text-red-600'}`} 
              />
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              {result.isSuccess ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-green-900">Scan Successful</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                      {Math.round(result.confidence)}% confidence
                    </span>
                  </div>
                  {result.text ? (
                    <div className="bg-white/80 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-800 break-words font-mono font-medium leading-relaxed">
                        {result.text}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-green-700 italic">No numbers detected in image</p>
                  )}
                  <p className="text-xs text-green-600">
                    Processed in {result.processingTime}ms
                  </p>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold text-red-900">Scan Failed</p>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
