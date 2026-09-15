export function PageSkeleton({ title = "Memuat Halaman..." }: { title?: string }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-muted/70 rounded-md animate-pulse" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="w-6 h-6 rounded-md bg-muted/70 animate-pulse" />
            </div>
            <div className="h-7 w-16 bg-muted rounded animate-pulse" />
            <div className="h-2.5 w-24 bg-muted/60 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table / Content Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-9 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-36 bg-primary/20 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-12 w-full bg-muted/50 rounded-xl animate-pulse"
            />
          ))}
        </div>

        <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
}
