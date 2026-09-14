export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 animate-pulse" />

      {/* Header Skeleton */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 animate-pulse" />
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
              <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
              <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
              <div className="h-7 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Body Skeleton */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/70 rounded-md animate-pulse" />
        </div>

        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table/Content Card Skeleton */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-9 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-9 w-36 bg-blue-600/30 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="h-12 w-full bg-slate-100/70 dark:bg-slate-800/40 rounded-xl animate-pulse"
              />
            ))}
          </div>

          <div className="flex items-center justify-center py-4 text-xs text-slate-400 gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat data...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
