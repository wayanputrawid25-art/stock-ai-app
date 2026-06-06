'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
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
  type: 'upload' | 'alert' | 'check' | 'loader';
  className?: string;
}) {
  if (type === 'loader') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
      </svg>
    );
  }

  const paths = {
    upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    check: 'M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OCRScanner({ onResult, onNumbers }: OCRScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [result, setResult] = useState<OCRResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Reset result
    setResult(null);
    setProgress({ status: '', progress: 0 });
  };

  const handleScan = async () => {
    if (!file) return;

    setLoading(true);
    setProgress({ status: 'Preparing bold black digit scan...', progress: 8 });

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type.startsWith('image/')) {
      setFile(droppedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(droppedFile);

      setResult(null);
      setProgress({ status: '', progress: 0 });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 active:scale-98"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <Icon type="upload" className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Drag image here or click to select
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, or GIF (Max 10MB)</p>
          </div>
        </div>
      </div>

      {/* Preview and Controls */}
      {preview && (
        <div className="space-y-4">
          {/* Mobile-optimized preview */}
          <div className="relative w-full rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={preview}
              alt="Preview"
              width={960}
              height={640}
              unoptimized
              className="h-auto max-h-80 w-full object-contain"
            />
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading ? (
              <>
                <Icon type="loader" className="w-4 h-4 animate-spin" />
                Scanning bold black digits...
              </>
            ) : (
              'Scan with OCR'
            )}
          </button>

          {loading && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <LoadingState variant="dots" message="OCR sedang membaca angka bold hitam..." />
            </div>
          )}

          {/* Progress Bar */}
          {loading && progress.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{progress.status}</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          className={`p-4 rounded-lg border-2 ${
            result.isSuccess
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex gap-2 items-start">
            {result.isSuccess ? (
              <Icon type="check" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Icon type="alert" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              {result.isSuccess ? (
                <div className="space-y-2">
                  <p className="font-medium text-green-900">Scan Successful</p>
                  <p className="text-sm text-green-800 break-words font-mono">
                    {result.text || 'No text found'}
                  </p>
                  <p className="text-xs text-green-700">
                    Confidence: {Math.round(result.confidence * 100)}% •{' '}
                    {result.processingTime}ms
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-red-900">Scan Failed</p>
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {preview && (
        <button
          onClick={() => {
            setFile(null);
            setPreview('');
            setResult(null);
            setProgress({ status: '', progress: 0 });
          }}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 min-h-[44px]"
        >
          Clear
        </button>
      )}
    </div>
  );
}
