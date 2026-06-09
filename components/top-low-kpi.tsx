"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopLowKPIProps {
  position: string;
  top: number | null;
  low: number | null;
}

export function TopLowKPI({ position, top, low }: TopLowKPIProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle className="text-sm font-semibold text-slate-700">{position}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          {/* TOP Badge */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium text-orange-600">🔥 TOP</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-white">{top ?? "-"}</span>
            </div>
          </div>
          
          {/* Separator */}
          <div className="flex-1 flex justify-center">
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
          </div>
          
          {/* LOW Badge */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium text-blue-600">❄️ LOW</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-white">{low ?? "-"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile-optimized version
export function TopLowKPIMobile({ position, top, low }: TopLowKPIProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle className="text-sm font-semibold text-slate-700">{position}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-orange-600 mb-1">🔥 TOP</span>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{top ?? "-"}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-blue-600 mb-1">❄️ LOW</span>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{low ?? "-"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}