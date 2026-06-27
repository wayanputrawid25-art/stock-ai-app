export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-border/40 p-6 animate-pulse">
      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-border/40 p-6 animate-pulse">
      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/4 mb-4"></div>
      <div className="flex items-end gap-2 h-40">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="flex-1 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-border/40 p-6 animate-pulse">
          <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-border/40 overflow-hidden animate-pulse">
      <div className="border-b border-border/40 p-4">
        <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/4"></div>
      </div>
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/6"></div>
            <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/4"></div>
            <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/3"></div>
            <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/5"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDropdown() {
  return (
    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/3 mb-3"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-white rounded-lg border border-border/40 flex-1"></div>
        <div className="h-10 bg-primary/20 rounded-lg w-20"></div>
      </div>
    </div>
  );
}