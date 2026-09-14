export function PageSkeleton({ title = "Memuat Halaman..." }: { title?: string }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/70 rounded-md animate-pulse" />
      </div>

      {/* KPI Cards Skeleton */}
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

      {/* Table / Content Skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-9 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
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
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
}
