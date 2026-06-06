'use client';

interface LoadingStateProps {
  variant?: 'default' | 'skeleton' | 'pulse' | 'dots';
  message?: string;
  fullScreen?: boolean;
}

function SpinnerIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
      />
    </svg>
  );
}

function StatusIcon({ status }: { status: 'success' | 'error' | 'warning' }) {
  const paths = {
    success: 'M9 12.75 11.25 15 15.75 9.75',
    error: 'M9.75 9.75 14.25 14.25M14.25 9.75 9.75 14.25',
    warning: 'M12 8v4m0 4h.01',
  };

  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d={paths[status]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Default animated spinner loading
 */
function DefaultLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="relative grid h-16 w-16 place-items-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 opacity-20 blur-sm animate-pulse" />
        <SpinnerIcon className="relative h-12 w-12 animate-spin text-blue-600" />
      </div>
      {message && <p className="text-sm font-medium text-gray-600 animate-pulse">{message}</p>}
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
        <div key={i} className="space-y-2 overflow-hidden rounded-lg border border-gray-100 bg-white p-3">
          <div className="h-4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
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
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-bounce"
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
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping" />
        <div className="absolute inset-3 rounded-full bg-blue-600 animate-pulse" />
      </div>
      {message && <p className="text-sm text-gray-600 animate-pulse">{message}</p>}
    </div>
  );
}

/**
 * Skeleton card for dashboard
 */
export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="h-6 w-32 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      </div>
      <div className="h-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
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
          <div className="h-10 flex-1 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          <div className="h-10 w-16 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
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
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-md'
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

  return (
    <div className={containerClasses} role="status" aria-live="polite" aria-busy="true">
      {content}
      <span className="sr-only">{message ?? 'Loading'}</span>
    </div>
  );
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
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-gray-700">{label}</p>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-500">
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

  const icon =
    status === 'loading' ? <SpinnerIcon className="h-3 w-3 animate-spin" /> : <StatusIcon status={status} />;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status]} ${
        animated && status === 'loading' ? 'animate-pulse' : ''
      }`}
    >
      {icon}
      <span className="capitalize">{status}</span>
    </div>
  );
}
