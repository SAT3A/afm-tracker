export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-[#2563EB] to-[#14B8A6] animate-pulse" />

      {/* Header Skeleton */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/20 animate-pulse" />
              <div className="h-5 w-28 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <div className="h-7 w-20 bg-muted/70 rounded-lg animate-pulse" />
              <div className="h-7 w-20 bg-muted/70 rounded-lg animate-pulse" />
              <div className="h-7 w-20 bg-muted/70 rounded-lg animate-pulse" />
              <div className="h-7 w-24 bg-muted/70 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </header>

      {/* Body Skeleton */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-muted/70 rounded-md animate-pulse" />
        </div>

        {/* KPI Grid Skeleton */}
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

        {/* Table/Content Card Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-9 w-64 bg-muted rounded-lg animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-32 bg-muted rounded-lg animate-pulse" />
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
            <span>Memuat data...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
