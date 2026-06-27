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

function DefaultLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="relative grid h-16 w-16 place-items-center">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary via-primary-light to-secondary opacity-20 blur-sm animate-pulse" />
        <SpinnerIcon className="relative h-12 w-12 animate-spin text-primary" />
      </div>
      {message && <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-4 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 overflow-hidden rounded-xl border border-border/40 bg-white p-4">
          <div className="h-4 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function DotsLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

function PulseLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-3 rounded-full bg-primary animate-pulse" />
      </div>
      {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl border border-border/40 bg-white p-5">
      <div className="h-5 w-32 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      </div>
      <div className="h-24 rounded bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
    </div>
  );
}

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-10 flex-1 rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          <div className="h-10 w-16 rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function LoadingState({
  variant = 'default',
  message,
  fullScreen = false,
}: LoadingStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md'
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
      {label && <p className="text-xs font-medium text-foreground">{label}</p>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-right text-xs text-muted-foreground">
        {current} of {total}
      </p>
    </div>
  );
}

export function StatusBadge({
  status,
  animated = true,
}: {
  status: 'loading' | 'success' | 'error' | 'warning';
  animated?: boolean;
}) {
  const styles = {
    loading: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    error: 'bg-destructive/10 text-destructive',
    warning: 'bg-warning/10 text-warning',
  };

  const icon =
    status === 'loading' ? <SpinnerIcon className="h-3 w-3 animate-spin" /> : <StatusIcon status={status} />;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]} ${
        animated && status === 'loading' ? 'animate-pulse' : ''
      }`}
    >
      {icon}
      <span className="capitalize">{status}</span>
    </div>
  );
}
