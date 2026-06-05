'use client';

import { Loader, Zap, TrendingUp, BarChart3 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'default' | 'skeleton' | 'pulse' | 'dots';
  message?: string;
  fullScreen?: boolean;
}

/**
 * Default animated spinner loading
 */
function DefaultLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative w-10 h-10">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
      {message && <p className="text-sm text-gray-600 animate-pulse">{message}</p>}
    </div>
  );
}

/**
 * Skeleton loading shimmer effect
 */
function SkeletonLoader() {
  return (
    <div className="space-y-4 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Pulsing dots animation
 */
function DotsLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}

/**
 * Pulsing content effect
 */
function PulseLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="w-12 h-12 bg-blue-600 rounded-full animate-pulse" />
      {message && <p className="text-sm text-gray-600 animate-pulse">{message}</p>}
    </div>
  );
}

/**
 * Skeleton card for dashboard
 */
export function SkeletonCard() {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
      <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
    </div>
  );
}

/**
 * Data loading skeleton
 */
export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="flex-1 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
          <div className="w-16 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Main loading state component
 */
export function LoadingState({
  variant = 'default',
  message,
  fullScreen = false,
}: LoadingStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'w-full';

  let content;
  switch (variant) {
    case 'skeleton':
      content = <SkeletonLoader />;
      break;
    case 'dots':
      content = <DotsLoader message={message} />;
      break;
    case 'pulse':
      content = <PulseLoader message={message} />;
      break;
    default:
      content = <DefaultLoader message={message} />;
  }

  return <div className={containerClasses}>{content}</div>;
}

/**
 * Mobile-optimized progress indicator
 */
export function ProgressIndicator({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-gray-700">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">
        {current} of {total}
      </p>
    </div>
  );
}

/**
 * Status badge with animation
 */
export function StatusBadge({
  status,
  animated = true,
}: {
  status: 'loading' | 'success' | 'error' | 'warning';
  animated?: boolean;
}) {
  const styles = {
    loading: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
  };

  const icons = {
    loading: <Loader className="w-3 h-3 animate-spin" />,
    success: <Zap className="w-3 h-3" />,
    error: <TrendingUp className="w-3 h-3" />,
    warning: <BarChart3 className="w-3 h-3" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]} ${
        animated && status === 'loading' ? 'animate-pulse' : ''
      }`}
    >
      {icons[status]}
      <span className="capitalize">{status}</span>
    </div>
  );
}
