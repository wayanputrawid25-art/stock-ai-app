"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopLowKPIProps {
  position: string;
  top: number[] | null;
  low: number[] | null;
}

export function TopLowKPI({ position, top, low }: TopLowKPIProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle className="text-sm font-semibold text-slate-700">{position}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-2">
          {/* TOP 6 Digits */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-medium text-orange-600">🔥 TOP 6</span>
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {(top ?? []).map((digit, idx) => (
                <div key={`top-${idx}`} className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white">{digit}</span>
                </div>
              ))}
              {(!top || top.length === 0) && (
                <span className="text-slate-400 text-sm">-</span>
              )}
            </div>
          </div>
          
          {/* Separator */}
          <div className="flex-shrink-0">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
          </div>
          
          {/* LOW 6 Digits */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-medium text-blue-600">❄️ LOW 6</span>
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {(low ?? []).map((digit, idx) => (
                <div key={`low-${idx}`} className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white">{digit}</span>
                </div>
              ))}
              {(!low || low.length === 0) && (
                <span className="text-slate-400 text-sm">-</span>
              )}
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
        <div className="space-y-3">
          {/* TOP 6 Digits */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-orange-600 mb-1">🔥 TOP 6</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {(top ?? []).map((digit, idx) => (
                <div key={`top-${idx}`} className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{digit}</span>
                </div>
              ))}
              {(!top || top.length === 0) && (
                <span className="text-slate-400 text-xs">-</span>
              )}
            </div>
          </div>
          <div className="w-full h-px bg-gray-200" />
          {/* LOW 6 Digits */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-blue-600 mb-1">❄️ LOW 6</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {(low ?? []).map((digit, idx) => (
                <div key={`low-${idx}`} className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{digit}</span>
                </div>
              ))}
              {(!low || low.length === 0) && (
                <span className="text-slate-400 text-xs">-</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}