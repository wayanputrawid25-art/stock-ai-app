"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number };
}

interface SnapshotSelectorProps {
  snapshots: Snapshot[];
  activeSnapshotId: string | null;
  onSnapshotChange?: (snapshotId: string) => void;
  isLoading?: boolean;
}

export function SnapshotSelector({ snapshots, activeSnapshotId, onSnapshotChange, isLoading = false }: SnapshotSelectorProps) {
  const searchParams = useSearchParams();
  
  // Get snapshot from URL or prop
  const urlSnapshotId = searchParams.get("snapshot");
  const [selectedId, setSelectedId] = useState<string>(activeSnapshotId || urlSnapshotId || "");

  // Update selected when prop changes
  useEffect(() => {
    const newId = activeSnapshotId || urlSnapshotId || "";
    setSelectedId(current => current !== newId ? newId : current);
  }, [activeSnapshotId, urlSnapshotId]);

  const handleChange = async (snapshotId: string) => {
    setSelectedId(snapshotId);
    
    // Call the callback if provided
    if (onSnapshotChange) {
      onSnapshotChange(snapshotId);
    }
    
    // Navigate to dashboard with selected snapshot
    const newUrl = snapshotId ? `/dashboard?snapshot=${snapshotId}` : "/dashboard";
    window.history.pushState({}, "", newUrl);
    
    // Dispatch custom event for data refresh
    window.dispatchEvent(new CustomEvent("snapshotChanged", { detail: { snapshotId } }));
  };

  // Get current snapshot info
  const currentSnapshot = snapshots.find(s => s.id === selectedId);
  const resultCount = currentSnapshot?._count?.results || 0;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Active Snapshot
          {isLoading && <span className="ml-2 text-blue-500">Memuat...</span>}
        </label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isLoading}
            className={`
              w-full px-4 py-2.5 rounded-lg border bg-white text-sm appearance-none 
              cursor-pointer outline-none transition-all duration-200
              ${isLoading 
                ? 'border-gray-300 bg-gray-100 cursor-wait opacity-70' 
                : 'border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }
            `}
            style={{ transition: 'all 200ms ease-in-out' }}
          >
            <option value="">-- Pilih Snapshot --</option>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {snapshot.title} ({snapshot._count?.results || 0} results)
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            {isLoading ? (
              <svg className="w-4 h-4 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
      
      {/* Current Snapshot Info */}
      {currentSnapshot && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">{currentSnapshot.title}</span>
          <span className="text-xs text-gray-500">({resultCount} data)</span>
        </div>
      )}
    </div>
  );
}