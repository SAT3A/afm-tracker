import { PageSkeleton } from "@/components/page-skeleton";

export default function PersonasLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageSkeleton title="Memuat Persona AI..." />
      </main>
    </div>
  );
}
