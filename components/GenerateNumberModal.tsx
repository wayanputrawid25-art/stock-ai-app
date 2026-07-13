"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface GenerateNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Separator = "*" | "|" | "-" | " ";
type Format = "1D" | "2D" | "3D" | "4D" | "5D" | "6D";

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  
  return arrays.reduce<T[][]>((acc, arr) => {
    const result: T[][] = [];
    for (const x of acc) {
      for (const y of arr) {
        result.push([...x, y]);
      }
    }
    return result;
  }, [[]]);
}

function generateCombinations(
  as: string,
  kop: string,
  kep: string,
  ekor: string
): { format: Format; combinations: string[] } {
  const inputs = [as, kop, kep, ekor];
  const labels = ["AS", "KOP", "KEP", "EKOR"];
  
  // Find which columns have input
  const activeIndices: number[] = [];
  const activeLabels: string[] = [];
  
  inputs.forEach((input, index) => {
    const digits = input.split("").filter(d => /^\d$/.test(d));
    if (digits.length > 0) {
      activeIndices.push(index);
      activeLabels.push(labels[index]);
    }
  });
  
  if (activeIndices.length === 0) {
    return { format: "1D", combinations: [] };
  }
  
  // Get digit arrays for active columns
  const digitArrays = activeIndices.map(index => {
    const digits = inputs[index].split("").filter(d => /^\d$/.test(d));
    return [...new Set(digits)]; // Remove duplicates
  });
  
  // Generate all combinations
  const combinations = cartesianProduct(digitArrays);
  
  // Convert to strings
  const format = `${activeIndices.length}D` as Format;
  
  return {
    format,
    combinations: combinations.map(combo => combo.join(""))
  };
}

export function GenerateNumberModal({ isOpen, onClose }: GenerateNumberModalProps) {
  const [show, setShow] = useState(false);
  const [as, setAs] = useState("");
  const [kop, setKop] = useState("");
  const [kep, setKep] = useState("");
  const [ekor, setEkor] = useState("");
  const [separator, setSeparator] = useState<Separator>("*");
  const [maxResults, setMaxResults] = useState(100);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>("2D");
  
  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);
  
  const handleReset = () => {
    setAs("");
    setKop("");
    setKep("");
    setEkor("");
    setGenerated(null);
    setCopied(false);
  };
  
  const handleClose = () => {
    handleReset();
    onClose();
  };
  
  const result = useMemo(() => {
    return generateCombinations(as, kop, kep, ekor);
  }, [as, kop, kep, ekor]);
  
  useEffect(() => {
    setFormat(result.format);
  }, [result.format]);
  
  const handleGenerate = () => {
    const limited = result.combinations.slice(0, maxResults);
    const output = `${result.format}: ${limited.join(separator)}`;
    setGenerated(output);
  };
  
  const handleCopy = async () => {
    if (!generated) return;
    
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = generated;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!show) return null;
  
  const separatorOptions: { value: Separator; label: string }[] = [
    { value: "*", label: "* (Bintang)" },
    { value: "|", label: "| (Garis)" },
    { value: "-", label: "- (Strip)" },
    { value: " ", label: "Spasi" },
  ];
  
  const hasInput = as || kop || kep || ekor;
  const activeCount = result.combinations.length;
  const wouldBeTruncated = activeCount > maxResults;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary-light/10">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Generate Number</h2>
              <p className="text-xs text-muted-foreground">Buat kombinasi angka</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/80 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Input Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AS <span className="text-muted-foreground font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={as}
                  onChange={(e) => setAs(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="0-9"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KOP <span className="text-muted-foreground font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={kop}
                  onChange={(e) => setKop(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="0-9"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KEPALA <span className="text-muted-foreground font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={kep}
                  onChange={(e) => setKep(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="0-9"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EKOR <span className="text-muted-foreground font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={ekor}
                  onChange={(e) => setEkor(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="0-9"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>
            
            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <p>💡 Masukkan angka pada kolom yang ingin digabungkan. Maksimal 6 angka per kolom.</p>
              <p className="mt-1">Format output: <strong>{format}</strong> ({activeCount} kombinasi)</p>
            </div>
            
            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value as Separator)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  {separatorOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah <span className="text-muted-foreground font-normal">(max)</span>
                </label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Math.max(1, Math.min(1000, parseInt(e.target.value) || 100)))}
                  min={1}
                  max={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>
            
            {/* Result Preview */}
            {generated && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Hasil:</span>
                  <Button
                    variant={copied ? "success" : "outline"}
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 text-xs"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <code className="text-xs text-gray-800 break-all whitespace-pre-wrap">
                    {generated}
                    {wouldBeTruncated && (
                      <span className="text-orange-500 ml-2">
                        ... (+{activeCount - maxResults} lagi)
                      </span>
                    )}
                  </code>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total: {activeCount} kombinasi{wouldBeTruncated && `, menampilkan ${maxResults}`}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button
              variant="gradient"
              onClick={handleGenerate}
              disabled={!hasInput}
              className="min-w-[100px]"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for easy usage
export function useGenerateNumberModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  return {
    isOpen,
    openModal,
    closeModal,
    GenerateNumberModal: (props: Omit<GenerateNumberModalProps, "isOpen" | "onClose">) => (
      <GenerateNumberModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        {...props} 
      />
    ),
  };
}
