"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Snapshot {
  id: string;
  title: string;
  color: string;
  _count?: { results: number; analyses: number };
}

interface SnapshotSelectorProps {
  snapshots: Snapshot[];
}

export function SnapshotSelector({ snapshots }: SnapshotSelectorProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(snapshots[0]?.id || "");

  const handleChange = (snapshotId: string) => {
    setSelectedId(snapshotId);
    // Update URL or trigger data reload for the selected snapshot
    router.push(`/dashboard?snapshot=${snapshotId}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Active Snapshot
        </label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm appearance-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none pr-10"
          >
            <option value="">All Snapshots</option>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {snapshot.title} ({snapshot._count?.results || 0} results)
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New
        </button>
      </div>
    </div>
  );
}